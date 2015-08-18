var http = require('http'),
    moment = require('moment-timezone'),
    
    juvenes = require('./parsers/juvenes.js');

var today = moment(new Date()).tz('Europe/Helsinki');

juvenes.getMenu(today);


var result = '';

var req = http.get('http://www.juvenes.fi/DesktopModules/Talents.LunchMenu/LunchMenuServices.asmx/GetMenuByWeekday?KitchenId=6&MenuTypeId=60&Week=34&Weekday=1&lang=%27fi%27&format=json',
    function(res) {
        res.on('data', function(data) {
            result = result + data.toString();
        });
    });
    
req.on('close', function() {
    result = result.slice(1).slice(0, -2);
    
    var data = JSON.parse(JSON.parse(result).d);
    // console.dir(data);
    
});
    
req.on('error', function(err) {
    // console.error(err);
});