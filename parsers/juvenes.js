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
        day = date.day() + 1;
        
    var menus = [];
    
    restaurants.forEach(function(restaurant) {
        
    });
    
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
            
            var menu = JSON.parse(JSON.parse(result).d);
            menus.push(menu);
            
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
        
        callback(menus);
    });
};
