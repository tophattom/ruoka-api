# TTY:n ruokalistat API


````
GET http://api.ruoka.xyz/YYYY-MM-DD
````

```` json
{
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
}
````