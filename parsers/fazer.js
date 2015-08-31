var http = require('http'),
    moment = require('moment-timezone');

var url = 'http://www.amica.fi/modules/json/json/Index?costNumber=0812&language=fi',

    contentExp = /(.+?) \((.+)\)/;

exports.getMenus = function(date, callback) {
    var result = '';
    
    var req = http.get(url, function(res) {
        res.on('data', function(data) {
            result += data.toString();
        });
    });
    
    req.on('close', function() {
        var data = JSON.parse(result);
        
        var restaurants = [
            {
                name: data.RestaurantName,
                menus: [
                    {
                        name: 'Lounas',
                        meals: data.MenusForDays.find(item => {
                                return moment(item.Date).format('YYYY-MM-DD') === date.format('YYYY-MM-DD');
                            })
                            .SetMenus.map(item => {
                                return {
                                    name: item.Name,
                                    contents: item.Components.map(component => {
                                            var parts = component.match(contentExp);
                                            
                                            return {
                                                name: parts[1],
                                                diets: parts[2].split(',').map(diet => { return diet.trim(); })
                                            };
                                        })
                                };
                            })
                    }
                ]
            }
        ];
        
        return callback(restaurants);
    });
    
    req.on('error', function(err) {
        console.error(err);
    });
};
