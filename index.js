var http = require('http'),
    moment = require('moment-timezone'),
    express = require('express'),
    async = require('async'),

    raven = require('raven'),

    juvenes = require('./parsers/juvenes.js'),
    sodexo = require('./parsers/sodexo.js'),
    fazer = require('./parsers/fazer.js'),

    config = require('./config.js');


var app = express();

var sentryEnabled = typeof config.sentry !== 'undefined' && config.sentry.enabled;
var ravenClient;

if (sentryEnabled) {
  ravenClient = new raven.Client(config.sentry.dsn);
  ravenClient.patchGlobal();

  app.use(raven.middleware.express.requestHandler(config.sentry.dsn));
}

app.use(function(req, res, next) {
  res.set({
    'Access-Control-Allow-Origin': 'https://ruoka.xyz',
    'Access-Control-Allow-Methods': 'GET'
  });


  if (req.method === 'OPTIONS') {
    res.status(200).send();
  } else {
    next();
  }
});

app.get('/:date', function(req, res, next) {
  var date = moment(req.params.date, 'YYYY-MM-DD').tz('Europe/Helsinki');

  async.parallel([
    menuRetriever(juvenes, date),
    menuRetriever(sodexo, date),
    menuRetriever(fazer, date)
  ], function(err, result) {
    var restaurants = result.reduce(function(prev, current) {
        return prev.concat(current);
      }, [])
      .sort(function(a, b) {
        return (a.restaurant + a.name) < (b.restaurant + b.name) ? -1 : 1;
      });

    var allDiets = restaurants
      .map(function(restaurant) {
        return restaurant.menus.map(function(menu) {
          return menu.meals.map(function(meal) {
            return meal.contents.map(function(content) {
              return content.diets || [];
            }).reduce(function(prev, current) {
              return prev.concat(current);
            }, []);
          }).reduce(function(prev, current) {
            return prev.concat(current);
          }, []);
        }).reduce(function(prev, current) {
          return prev.concat(current);
        }, []);
      })
      .reduce(function(prev, current) {
        return prev.concat(current);
      }, [])
      .filter(function(diet, index, self) {
        return self.indexOf(diet) === index;
      })
      .filter(function(diet) {
        return diet !== '';
      })
      .sort();

    res.status(200).send({
      restaurants: restaurants,
      availableDiets: allDiets
    });
  });
});

if (sentryEnabled) {
  app.use(raven.middleware.express.errorHandler(config.sentry.dsn));
}

app.listen(config.app.port);
console.log('Server listening on port', config.app.port);

function menuRetriever(service, date) {
  return function(callback) {
    service.getMenus(date, function(err, menus) {
      if (err) {
        if (sentryEnabled) {
          ravenClient.captureException(err);
        } else {
          console.log(err);
        }

        callback(null, []);
        return;
      }

      callback(null, menus);
    });
  };
}
