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
                        "Chili con carne",
                        "Täysjyväriisiä"
                    ]
                },
                {
                    "name": "Inspiring",
                    "contents": [
                        "Kalaa capers",
                        "Seitä, kaprista, chiliä, ja sitruunaa, täyjyväohraa"
                    ]
                },
                ...
            ]
        },
        ...
    ]
}
````