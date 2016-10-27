var http = require('http');

var baseUrl = 'http://www.sodexo.fi/ruokalistat/output/daily_json/12812/';

exports.getMenus = function(date, lang, callback) {
    var urlDate = date.format('YYYY/MM/DD'),
        requestUrl = baseUrl + urlDate + '/fi',
        
        result = '';
        
    var req = http.get(requestUrl, function(res) {
        res.on('data', function(data) {
            result += data.toString();
        });
    });
    
    req.on('close', function() {
        try {
            var data = JSON.parse(result),
                title = "title_" + lang,
                desc = "desc_" + lang;
            
            var menus = [
                {
                    restaurant: 'Hertsi',
                    name: 'Lounas',
                    meals: data.courses.map(function(course) {
                        return {
                            name: course.category,
                            prices: course.price.split('/').map(function(price) {
                                return price.trim();
                            }),
                            contents: [
                                {
                                    name: course[title],
                                    diets: typeof course.properties !== 'undefined' ? 
                                        course.properties.split(',').map(function(diet) {
                                            return diet.trim();
                                        }) : []
                                },
                                {
                                    name: course[desc]
                                }
                            ].filter(function(content) {
                                return content.name !== '';
                            })
                        };
                    })
                }
            ];
            
            var obj = {};
            menus.forEach(function(menu) {
                if (!obj[menu.restaurant]) {
                    obj[menu.restaurant] = {};
                    obj[menu.restaurant].menus = [];
                }
                
                obj[menu.restaurant].menus.push(menu);
            });
            
            var restaurantList = Object.keys(obj).map(function(restaurantName) {
                return {
                    name: restaurantName,
                    url: data.meta.ref_url,
                    menus: obj[restaurantName].menus
                };
            });
            
            callback(null, restaurantList);
        } catch(e) {
            callback(e);
        }
        
    });
    
    req.on('error', function(err) {
        callback(err);
    });
};