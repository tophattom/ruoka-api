var http = require('http'),
    moment = require('moment-timezone');

var baseUrl = 'http://www.amica.fi/modules/json/json/Index?';
    
exports.getMenus = function(date, lang, callback) {
    var options = {
        costNumber: '0812',
        firstDay: date.format('YYYY-MM-DD'),
        language: lang
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
                    url: data.RestaurantUrl,
                    menus: [
                        {
                            name: 'Lounas',
                            meals: data.MenusForDays[0].SetMenus
                                .filter(function(setMenu) {
                                    return setMenu.Name !== null;
                                })
                                .map(function(setMenu) {
                                    return {
                                        name: setMenu.Name,
                                        prices: setMenu.Price.split('/').map(function(price) {
                                            return price.replace('€', '').trim();
                                        }),
                                        contents: setMenu.Components.map(function(component) {
                                            var parts = component.split('(');
                                            return {
                                                name: parts[0].trim(),
                                                diets: parts[1].slice(0, -1).split(',').map(function(diet) {
                                                    return diet.trim();
                                                })
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
        callback(err);
    });
};
