var http = require('http');

var baseUrl = 'http://www.sodexo.fi/ruokalistat/output/daily_json/12812/';

exports.getMenus = function(date, callback) {
    var urlDate = date.format('YYYY/MM/DD'),
        requestUrl = baseUrl + urlDate + '/fi',
        
        result = '';
        
    var req = http.get(requestUrl, function(res) {
        res.on('data', function(data) {
            result += data.toString();
        });
    });
    
    req.on('close', function() {
        var data = JSON.parse(result);
        
        var menus = [
            {
                restaurant: 'Hertsi',
                name: 'Lounas',
                meals: data.courses.map(function(course) {
                    return {
                        name: course.category,
                        contents: [course.title_fi, course.desc_fi],
                        info: [
                            {
                                diets: typeof course.properties !== 'undefined' ? course.properties.split(',') : [],
                                name: course.title_fi
                            }
                        ]
                    };
                })
            }
        ];
        
        callback(menus);
    });
    
    req.on('error', function(err) {
        console.error(err);
    });
};