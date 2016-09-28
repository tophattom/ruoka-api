var http = require('http'),
    moment = require('moment-timezone');

var restaurantIds = {
    tty: '0812',
    tay: '0815'
};

var baseUrl = 'http://www.amica.fi/modules/json/json/Index?';
    
exports.getMenus = function(date, campus, callback) {
    var options = {
        costNumber: restaurantIds[campus],
        firstDay: date.format('YYYY-MM-DD'),
        language: 'fi'
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
                    name: data.RestaurantName,
                    url: data.RestaurantUrl,
                    menus: [
                        {
                            name: 'Lounas',
                            meals: data.MenusForDays[0].SetMenus
                                .filter(function(setMenu) {
                                    return setMenu.Name !== null;
                                })
                                .map(normalizeMenu)
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

function normalizeMenu(setMenu) {
    var name = parseName(setMenu);
    var prices = parsePrices(setMenu);

    return {
        name: name,
        prices: prices,
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
}

function parsePrices(menu) {
    var priceExp = /(\d+,\d+)/g;

    if (menu.Price !== null) {
        return menu.Price.split('/').map(function(price) {
            return price.replace('€', '').trim();
        })
    } else {
        var priceMatch = menu.Name.match(priceExp);

        return priceMatch;
    }
}

function parseName(menu) {
    var nameExp = /([a-zA-ZäÄöÖ]+)\s+\d+(?:.+\/.+)?/;
    var nameMatch = menu.Name.match(nameExp);

    return nameMatch !== null ? nameMatch[1] : menu.Name;
}
