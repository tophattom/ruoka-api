var http = require('http'),
    moment = require('moment-timezone');

var baseUrl = 'http://www.amica.fi/api/restaurant/menu/day?';
    
exports.getMenus = function(date, callback) {
    var options = {
        date: date.format('YYYY-MM-DD'),
        language: 'fi',
        restaurantPageId: 69171
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
        try {
            var data = JSON.parse(result);
            
            var restaurants = [
                {
                    name: 'Reaktori',
                    menus: [
                        {
                            name: 'Lounas',
                            meals: data.LunchMenu.SetMenus.map(function(setMenu) {
                                return {
                                    name: setMenu.Name,
                                    prices: setMenu.Price.split('/').map(function(price) {
                                        return price.replace('€', '').trim();
                                    }),
                                    contents: setMenu.Meals.map(function(content) {
                                        return {
                                            name: content.Name,
                                            diets: content.Diets
                                        };
                                    })
                                };
                            })
                        }
                    ]
                }
            ];
            
            callback(null, restaurants);
        } catch (e) {
            callback(e);
        }
    });
    
    req.on('error', function(err) {
        console.error(err);
    });
};
