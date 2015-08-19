var http = require('http'),
    async = require('async');

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

var baseUrl = 'http://www.juvenes.fi/DesktopModules/Talents.LunchMenu/LunchMenuServices.asmx/GetMenuByWeekday?';

exports.getMenus = function(date, callback) {
    var week = date.week(),
        day = date.day();
        
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
                contents: mealOption.ForceMajeure.split('<br/>'),
                info: mealOption.MenuItems.map(function(item) {
                    return {
                        diets: item.Diets.split(','),
                        name: item.name
                    };
                })
            };
        })
    };
}
