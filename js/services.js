(function (app) {
    var googlePlaces = function () {
        var self = this;

        self.map = null;
        self.service = null;

        self.init = function (mapDiv) {
            if (window.google === undefined) {
                return;
            }

            self.map = new google.maps.Map(document.getElementById('map'), {
                center: {lat: 49.123, lng: 31.123},
                zoom: 15
            });

            self.service = new google.maps.places.PlacesService(self.map);
        };

        self.nearbySearch = function (lat, lng, callback) {
            self.service.nearbySearch({
                location: {
                    lat: lat,
                    lng: lng
                },
                radius: 1000
            }, callback);
        };

        self.placeDetailsToDataObject = function (placeDetails) {
            var placeObj = {
                "name": placeDetails.name,
                "website": placeDetails.website,
                "lat": placeDetails.geometry.location.lat(),
                "lng": placeDetails.geometry.location.lng(),
                "rating": placeDetails.rating,
                "ratingsCount": placeDetails.user_ratings_total,
                "vicinity": placeDetails.vicinity
            };

            if (placeDetails.photos !== undefined) {
                placeObj.photo = placeDetails.photos[0].getUrl({ 'maxWidth': 300, 'maxHeight': 300 });
            }

            if (placeObj.website) {
                placeObj.domain = new URI(placeObj.website).hostname();
            }

            return placeObj;
        }
    },

    kvCache = {
        get: function (key) {
            var val = window.localStorage[key];
            if (val === undefined) {
                return undefined;
            }
            return JSON.parse(val);
        },
        set: function (key, value) {
            window.localStorage[key] = JSON.stringify(value);
        }
    };

    app.services = {
        kvCache: kvCache,
        googlePlaces: new googlePlaces()
    };
})(app);