var http = require('http'),
    moment = require('moment-timezone'),
    
    juvenes = require('./parsers/juvenes.js'),
    sodexo = require('./parsers/sodexo.js');

var today = moment(new Date()).tz('Europe/Helsinki');


juvenes.getMenus(today, function(menus) {
    console.log(menus[1].meals[0]);
});

sodexo.getMenus(today, function(menus) {
    console.log(menus[0].meals[1]);
});
