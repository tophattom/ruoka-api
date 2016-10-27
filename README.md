# TTY:n ruokalistat API


````
GET http://api.ruoka.xyz/YYYY-MM-DD/ (default: fi)
    http://api.ruoka.xyz/YYYY-MM-DD/fi
    http://api.ruoka.xyz/YYYY-MM-DD/en
````

```` json
{
    "restaurants": [
        {
            "name": "Hertsi",
            "menus": [
                {
                    "restaurant": "Hertsi",
                    "name": "Lounas",
                    "meals": [
                        {
                            "name": "Popular",
                            "contents": [
                                {
                                    "name": "Chili con carne",
                                    "diets": ["G", "L"]
                                },
                                {
                                    "name": "Täysjyväriisiä"
                                }
                            ]
                        },
                        {
                            "name": "Inspiring",
                            "contents": [
                                {
                                    "name": "Kalaa capers",
                                    "diets": ["M"]
                                },
                                {
                                    "name": "Seitä, kaprista, chiliä, ja sitruunaa, täyjyväohraa"
                                }
                            ]
                        },
                        ...
                    ]
                },
                ...
            ]
        },
        ...
    ],
    "availableDiets": ["G", "VL", ...]
}
````