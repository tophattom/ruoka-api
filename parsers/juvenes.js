var http = require('http'),
async = require('async'),
entities = new (require('html-entities').AllHtmlEntities)();

var restaurants = [
  {
    KitchenId: '6',
    MenuTypeId: '60'
  },
  {
    KitchenId: '6',
    MenuTypeId: '74'
  },
  {
    KitchenId: '60038',
    MenuTypeId: '3'
  },
  {
    KitchenId: '60038',
    MenuTypeId: '77'
  }
];

var priceGroups = [
  {
    groupId: 0,
    prices: null
  },
  {
    groupId: 1,
    prices: ['2,60', '4,87', '9,90']
  },
  {
    groupId: 8,
    prices: ['4,00', '7,25', '9,90']
  },
  {
    groupId: 3,
    prices: ['2,10', '4,55', '8,50']
  },
  {
    groupId: 4,
    prices: ['4,95', '7,37', '10,20']
  }
];

var baseUrl = 'http://www.juvenes.fi/DesktopModules/Talents.LunchMenu/LunchMenuServices.asmx/GetMenuByDate?',
    infoUrl = 'http://www.juvenes.fi/DesktopModules/Talents.LunchMenu/LunchMenuServices.asmx/GetKitchenInfo?';

exports.getOpeningHours = function(callback) {
  var options = {
    KitchenInfoId: 2352,
    lang: "'fi'",
    format: 'json'
  };

  var queryString = Object.keys(options).map(function(key) {
    return key + '=' + options[key];
  }).join('&');

  var result = '';
  var req = http.get(infoUrl + queryString, function(res) {
    res.on('data', function(data) {
      result += data.toString();
    });
  });

  req.on('close', function() {
    result = result.slice(1).slice(0, -2);

    var resultObj = JSON.parse(result);
    if (resultObj.d) {
      resultObj.d = resultObj.d.replace(/\\u000a/g, '\n').replace(/<br( \\\/)?>/g, '').replace(/\\/g, '');
      resultObj.d = entities.decode(resultObj.d);

      var trs = resultObj.d.split('</tr>').slice(1).slice(0, -1);
      trs = trs.map(function(tr) {
        return tr.replace('<tr>', '').split('</td>').map(function(td) {
          return td.trim().replace('<td>', '').replace(/^\s+/g, '').replace(/ {2,}/g, '')
          .split(/\n/)
          .map(function(item) {
            return item.replace(/<.+?>/g, '').trim();
          })
          .filter(function(item) {
            return item !== '';
          });
        }).filter(function(td) {
          return td.length > 0;
        });
      });

      var infos = trs.map(function(tr) {
        return {
          menu: tr[0].slice(0, tr[0].length - tr[1].length > 0 ? tr[0].length - tr[1].length : tr[0].length).join(' '),
          hours: tr[2].map(function(time, index) {
            var diff = tr[0].length - tr[1].length,
            dayOptions = tr[0].slice(diff);

            return {
              time: time,
              days: diff > 0 ? dayOptions[index] : ''
            };
          })
        };
      });

      callback(infos);
    }
  });
};

exports.getMenus = function(date, callback) {
  var menus = [];

  async.each(restaurants, function(restaurant, done) {
    var options = {
      KitchenId: restaurant.KitchenId,
      MenuTypeId: restaurant.MenuTypeId,
      Date: "'" + date.format('YYYY-MM-DD') + "'",
      lang: "'fi'",
      format: 'json'
    };

    var queryString = Object.keys(options).map(function(key) {
      return key + '=' + options[key];
    }).join('&');

    var result = '';

    var req = http.get(baseUrl + queryString, function(res) {
      res.on('data', function(data) {
        result += data.toString();
      });
    });

    req.on('close', function() {
      result = result.slice(1).slice(0, -2);

      var resultObj = JSON.parse(result);
      if (resultObj.d) {
        var menu = JSON.parse(resultObj.d);
        menus.push(menu);
      }

      done();
    });

    req.on('error', function(err) {
      done(err);
    });
  }, function(err) {
    if (err) {
      callback(err);
      return;
    }

    try {
      menus = menus.map(function(menu) {
        return normalizeMenu(menu);
      });

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
          menus: obj[restaurantName].menus
        };
      });

      callback(null, restaurantList);
    } catch(e) {
      callback(e);
    }
  });
};

function normalizeMenu(menu) {
  return {
    restaurant: menu.KitchenName,
    name: menu.MenuTypeName,
    meals: menu.MealOptions.map(function(mealOption) {
      var prices = null;
      priceGroups.forEach(function(priceGroup) {
        if (priceGroup.groupId === mealOption.ExternalGroupId) {
          prices = priceGroup.prices;
        }
      });

      return {
        name: mealOption.Name,
        prices: prices,
        contents: mealOption.MenuItems
          .filter(function(item) {
            return item.Name !== '';
          })
          .map(function(item) {
            return {
              name: item.Name,
              diets: item.Diets.split(',').map(function(diet) {
                return diet.trim();
              }),
              ingredients: item.Ingredients
            };
          })
      };
    })
  };
}
