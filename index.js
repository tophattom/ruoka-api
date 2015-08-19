var http = require('http'),
    moment = require('moment-timezone'),
    express = require('express'),
    async = require('async'),
    
    juvenes = require('./parsers/juvenes.js'),
    sodexo = require('./parsers/sodexo.js'),
    
    config = require('./config.js');



var app = express();

app.get('/:date', function(req, res, next) {
    var date = moment(req.params.date, 'YYYY-MM-DD').tz('Europe/Helsinki');
        
    async.parallel([
        function(callback) {
            juvenes.getMenus(date, function(menus) {
                callback(null, menus);
            });
        },
        function(callback) {
            sodexo.getMenus(date, function(menus) {
                callback(null, menus);
            });
        }
    ], function(err, result) {
        result = result.reduce(function(prev, current) {
            return prev.concat(current);
        }, []);
        
        res.status(200).send(result);
    });
});

app.listen(config.app.port);
console.log('Server listening on port', config.app.port);
