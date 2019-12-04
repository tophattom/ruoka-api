var https = require('https');

var baseUrl = 'https://www.sodexo.fi/ruokalistat/output/daily_json/111/';

exports.getMenus = function(date, callback) {
  var urlDate = date.format('YYYY-MM-DD'),
  requestUrl = baseUrl + urlDate,

  result = '';

  var req = https.get(requestUrl, function(res) {
    res.on('data', function(data) {
      result += data.toString();
    });
  });

  req.on('close', function() {
    try {
      var data = JSON.parse(result);

      var menus = [
      {
        restaurant: 'Hertsi',
        name: 'Lounas',
        meals: Object.keys(data.courses).map(function(key) {
          var course = data.courses[key];
          var prices = typeof course.price !== 'undefined' ? course.price.split('/') : [];

          return {
            name: course.category,
            prices: prices.map(function(price) {
              return price.trim();
            }),
            contents: [
              {
                name: course.title_fi,
                diets: typeof course.properties !== 'undefined' ?
                course.properties.split(',').map(function(diet) {
                  return diet.trim();
                }) : []
              }
            ].filter(function(content) {
              return content.name !== '';
            })
          };
        })
      }
      ];

      var obj = {};
      menus.forEach(function(menu) {
        if (!obj[menu.restaurant]) {
          obj[menu.restaurant] = {};
          obj[menu.restaurant].menus = [];
        }

        obj[menu.restaurant].menus.push(menu);
      });

      var restaurantList = Object.keys(obj).map(function(restaurantName) {
        return {
          name: restaurantName,
          url: data.meta.ref_url,
          menus: obj[restaurantName].menus
        };
      });

      callback(null, restaurantList);
    } catch(e) {
      callback(e);
    }

  });

  req.on('error', function(err) {
    callback(err);
  });
};
