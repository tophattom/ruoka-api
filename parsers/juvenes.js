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
        MenuTypeId: '77'
    },
    {
        KitchenId: '60038',
        MenuTypeId: '3'
    }
];

var baseUrl = 'http://www.juvenes.fi/DesktopModules/Talents.LunchMenu/LunchMenuServices.asmx/GetMenuByWeekday?',
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
    var week = date.week(),
        day = date.day();
        
    if (day === 0) {
        day = 7;
    }
        
    var menus = [];
    
    async.each(restaurants, function(restaurant, done) {
        var options = {
            KitchenId: restaurant.KitchenId,
            MenuTypeId: restaurant.MenuTypeId,
            Week: week,
            Weekday: day,
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
            console.error(err);
            return;
        }
        
        menus = menus.map(function(menu) {
            return normalizeMenu(menu);
        });
        
        callback(menus);
    });
};

function normalizeMenu(menu) {
    return {
        restaurant: menu.KitchenName,
        name: menu.MenuTypeName,
        meals: menu.MealOptions.map(function(mealOption) {
            return {
                name: mealOption.Name,
                contents: mealOption.MenuItems.map(function(item) {
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
