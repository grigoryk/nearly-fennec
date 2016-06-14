var DUMMY_RECOMMENDATIONS = [
    {
        place: {
            name: "Shake Shack",
            website: "https://foursquare.com/v/shake-shack/4f159a54e4b01eeff24c6408",
            lat: 41.2123,
            lng: 29.123,
            rating: 8.4,
            ratingMax: 10,
            ratingsCount: 251,
            vicinity: "24 The Market Building (The Piazza), London",
            photo: "https://irs2.4sqi.net/img/general/699x268/1778283_S8p0SDGHu9643vKCZ9NvoNUh_lLTPwhkZ5pdWDYLPdc.jpg",
            notes: "Burger joint"
        },
        items: []
    },

    {
        place: {
            name: "Hummus Bros",
            website: "https://foursquare.com/v/hummus-bros/4ac518e7f964a52034ab20e3",
            lat: 41.2123,
            lng: 29.123,
            rating: 8.3,
            ratingMax: 10,
            ratingsCount: 92,
            vicinity: "88 Wardour St., London",
            photo: "https://irs2.4sqi.net/img/general/699x268/4pdQoVE3jS_fKwFF7B3xNZzDxmCpQy2_7sxoinrSHVM.jpg",
            notes: "Mediterranean goodness"
        },
        items: []
    },

    {
        place: {
            name: "TAP Coffee",
            website: "https://foursquare.com/v/tap-coffee/4bbb2ff71261d13a1058eb98",
            lat: 41.2123,
            lng: 29.123,
            rating: 9.1,
            ratingMax: 10,
            ratingsCount: 136,
            vicinity: "26 Rathbone Pl (Percy St), Fitzrovia",
            photo: "https://irs1.4sqi.net/img/general/699x268/40095441_6FInTd_DoKeyRJ7sHP_vOTjHvPUgjfyDDRWS5OVCZGs.jpg",
            notes: "Better than your average Philz"
        },
        items: []
    },

    {
        place: {
            name: "Milkbar",
            website: "https://foursquare.com/v/milkbar/4acda021f964a5206bcc20e3",
            lat: 41.2123,
            lng: 29.123,
            rating: 8.7,
            ratingMax: 10,
            ratingsCount: 90,
            vicinity: "3-5 Bateman St (Greek St), Soho",
            photo: "https://irs0.4sqi.net/img/general/699x268/QcPfLs3dPLG_fZXggxelr3tz1dUKcCA73uRGwMN0ra0.jpg",
            notes: "Coffee shop not just for dairy lovers"
        },
        items: []
    },

    {
        place: {
            name: "The Breakfast Club",
            website: "https://foursquare.com/v/the-breakfast-club/4ac4bb54f964a520e49e20e3",
            lat: 41.2123,
            lng: 29.123,
            rating: 8.6,
            ratingMax: 10,
            ratingsCount: 314,
            vicinity: "33 D'Arblay St (Wardour St), Soho",
            photo: "https://irs3.4sqi.net/img/general/699x268/37100850_1x7KKMBZVjABRh404EZfo_RPm3F0O15GkIllHGfHS-U.jpg",
            notes: "Awesome breakfast spot"
        },
        items: []
    },

    {
        place: {
            name: "Food For Thought",
            website: "https://foursquare.com/v/food-for-thought/4afc54a1f964a520a42122e3",
            lat: 41.2123,
            lng: 29.123,
            rating: 8.6,
            ratingMax: 10,
            ratingsCount: 65,
            vicinity: "31 Neal St, London, Greater London",
            photo: "https://irs1.4sqi.net/img/general/699x268/7KzlNMKFQeGFlzJnpwfSq2AD7AVyefAWRBbZ2KLDCDA.jpg",
            notes: "Vegetarian/vegan joint"
        },
        items: []
    },

    {
        place: {
            name: "New Row Coffee",
            website: "https://foursquare.com/v/new-row-coffee/4ea816d27ee5c76518d5c1a7",
            lat: 41.2123,
            lng: 29.123,
            rating: 8.9,
            ratingMax: 10,
            ratingsCount: 87,
            vicinity: "24 New Row, London",
            photo: "https://irs0.4sqi.net/img/general/699x268/82007_lALme3fyxQ5jdYkKr_1zpvU8maS-kYOsOcUtzKfxVWk.jpg",
            notes: "What is this, Revolver?"
        },
        items: []
    },

    {
        place: {
            name: "The Victoria",
            website: "http://www.yelp.com/biz/the-victoria-paddington",
            // lat: 41.2123,
            // lng: 29.123,
            rating: 4.4,
            ratingMax: 5,
            ratingsCount: 116,
            vicinity: "10A Strathearn Pl, Paddington, London W2 2NH",
            photo: "https://irs1.4sqi.net/img/general/width960/29600398_q2V2bMDoVWSkXgWw8bTWwcLfCQIjp15TE0jkaBNlfEg.jpg",
            notes: "W19th-century pub with great selection of Fullers and wallpaper."
        },
        items: []
    },

    {
        place: {
            name: "The Monkey Puzzle",
            website: "https://www.yelp.co.uk/biz/the-monkey-puzzle-london",
            // lat: 41.2123,
            // lng: 29.123,
            rating: 4,
            ratingMax: 5,
            ratingsCount: 16,
            vicinity: "30 Southwick Street, Paddington, London W2 1JQ",
            photo: "https://irs1.4sqi.net/img/general/width960/51972983_HJIV_PgUVlsxp49WGHTxy8miQFHR8h8uCYae8J9G5DI.jpg",
            notes: "Lovely little pub for an after work drink or casual pint out."
        },
        items: []
    },

    {
        place: {
            name: "The Golden Hind",
            website: "http://www.yelp.com/biz/the-golden-hind-london",
            // lat: 41.2123,
            // lng: 29.123,
            rating: 4,
            ratingMax: 5,
            ratingsCount: 210,
            vicinity: "73 Marylebone Lane, London, W1U 2PN United Kingdom",
            photo: "https://irs0.4sqi.net/img/general/width960/4L6HPl660VkLHUsu8juCrHWaHUOqUagJek41zb3kT_U.jpg",
            notes: "Casual atmosphere, families, couples etc. Staff is friendly."
        },
        items: []
    },

    {
        place: {
            name: "Marks & Spencer",
            website: "https://foursquare.com/v/marks--spencer/4bb1daa7f964a520a7a63ce3?#tasteId=52cb360d498e49ae1f58c8d9",
            // lat: 41.2123,
            // lng: 29.123,
            rating: 7.2,
            ratingMax: 10,
            ratingsCount: 67,
            vicinity: "258 Edgware Rd, Paddington, Greater London, W2 1DU",
            photo: "https://irs1.4sqi.net/img/general/width960/7884262_oBiP2oD5zWmMHVyHWLekpkuT-xg8fkRveBlNXXbGr_o.jpg",
            notes: "Great Salads for lunch. Take them to Hyde Park."
        },
        items: []
    },
];