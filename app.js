function HistoryItem(data) {
    var thiz = this;
    this.title = ko.observable(data.title);
    this.url = ko.observable(data.url);
    this.visitCount = ko.observable(data.visitCount);
    this.domain = ko.observable(data.domain);

    this.displayTitle = ko.computed(function() {
        return thiz.title() || thiz.url();
    });
}

function Place(data) {
    this.name = ko.observable(data.name);
    this.photo = ko.observable(data.photo);
    this.website = ko.observable(data.website);
    this.domain = ko.observable(data.domain);
    this.lat = ko.observable(data.lat);
    this.lng = ko.observable(data.lng);
    this.rating = ko.observable(data.rating);
    this.ratingsCount = ko.observable(data.ratingsCount);

    this.vicinity = ko.observable(data.vicinity);
}

function Coordinates(data) {
    this.lat = ko.observable(data.lat);
    this.lng = ko.observable(data.lng);
}

function NearlyFennecVM() {
    var self = this;

    self.historyLimit = ko.observable(20000);

    self.isLoggedIn = ko.observable(false);
    self.email = ko.observable("");
    self.password = ko.observable("");

    self.places = ko.observableArray([]);
    self.historyItems = ko.observableArray([]);

    self.unionVisible = ko.observable(true);
    self.isLoadingNearby = ko.observable(false);
    self.isLoadingHistory = ko.observable(false);

    self.currentPosition = ko.observable();

    self.dummyPlaces = [
        {
            "name": "YVR Airport",
            "website": "https://www.yvr.ca",
            "lat": 21,
            "lng": 4343,
            "rating": 3.7,
            "ratingsCount": 12,
            "vicinity": "123 E Hastings, Vancouver"
        }
    ];

    self.login = function() {
        window.localStorage["email"] = self.email();
        window.localStorage["password"] = self.password();
        self.isLoggedIn(true);

        self.fetchHistory();
    };

    self.logout = function() {
        window.localStorage.clear();
        self.email(undefined);
        self.password(undefined);
        self.isLoggedIn(false);
    }

    self.hasCreds = ko.computed(function() {
        return self.email() && self.password();
    });

    self.isLoading = ko.computed(function() {
        return self.isLoadingNearby() || self.isLoadingHistory();
    });

    self.union = ko.computed(function() {
        let places = {};

        _.each(self.places(), function(place) {
            _.each(self.historyItems(), function(item) {
                if (place.domain() === undefined || item.domain() === undefined) {
                    return;
                }

                if (place.domain() !== item.domain()) {
                    return;
                }

                if (places[place.website()] !== undefined) {
                    places[place.website()].items.push(item);
                } else {
                    places[place.website()] = {
                        place: place,
                        items: [item]
                    };
                }
            });
        });

        return _.map(_.keys(places), function(key) {
            return {
                place: places[key].place,
                items: places[key].items
            }
        });
    });

    self.fetchHistory = function() {
        self.isLoadingHistory(true);

        $.post("https://fennec-history-proxy.herokuapp.com/history", {
            email: self.email,
            password: self.password,
            limit: self.historyLimit
        }, function(results) {
            self.processHistory(results);
            self.isLoadingHistory(false);
            self.nearbySearch({background: true});
        }, 'json');
    };

    self.nearbySearch = function(opts) {
        function fetchPlaces(position, callback) {
            var center = { lat: position.coords.latitude, lng: position.coords.longitude },
                map = new google.maps.Map(document.getElementById('map'), {
                    center: center,
                    zoom: 15
                });

            self.service = new google.maps.places.PlacesService(map);

            self.service.nearbySearch({
                location: center,
                radius: 500
            }, callback);
        }

        if (opts === undefined) {
            opts = {background: false};
        }

        if (!opts.background) {
            self.isLoadingNearby(true);
        }

        function realSearch() {
            navigator.geolocation.getCurrentPosition(function(pos) {
                fetchPlaces(pos, function(results, status) {
                    let places = [];
                    _.each(results, function(res) {
                        self.getPlaceDetails(res.place_id,
                            function(place) {
                                places.push(new Place(place));
                            },

                            function(errorStatus) { }
                        );
                    });
                    self.places(places);
                    if (!opts.background) {
                        self.isLoadingNearby(false);
                    }
                });
            });
        }

        function dummySearch() {
            var places = [];
            _.each(self.dummyPlaces, function(place) {
                places.push(new Place(place));
            });
            self.places(places);
            if (!opts.background) {
                self.isLoadingNearby(false);
            }
        }

        dummySearch();
    };

    self.getPlaceDetails = function(placeId, callback, errCallback) {
        var ls = window.localStorage;
        if (ls[placeId] !== undefined) {
            console.log("Found place in cache", placeId);
            callback(JSON.parse(ls[placeId]));
            return;
        }

        console.log("Place not in cache", placeId);

        this.service.getDetails({ "placeId": placeId }, function(placeDetails, status) {
            if (status !== google.maps.places.PlacesServiceStatus.OK) {
                console.error("Failed to get place details", placeId, status);
                errCallback && errCallback(status);
                return;
            }

            console.log("Fetched place details", placeId);

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
                placeObj.domain = new URI(placeObj.website).domain();
            }

            ls[placeId] = JSON.stringify(placeObj);

            callback(placeObj);
        });
    };

    self.processHistory = function(items) {
        var processed = _.map(items, function(item) {
            var obj = {
                "title": item.title,
                "url": item.histUri
            };

            if (obj.url) {
                obj.domain = new URI(obj.url).domain();
            }

            if (item.visits) {
                obj.visitCount = item.visits.length;
            }

            return obj;
        });

        window.localStorage["history"] = JSON.stringify(processed);

        self.historyItems([]);
        let is = [];
        _.each(processed, function(p) {
            is.push(new HistoryItem(p));
        });
        self.historyItems(is);
    };

    self.nearbySearch();

    if (window.localStorage["email"] && window.localStorage["password"]) {
        self.email(window.localStorage["email"]);
        self.password(window.localStorage["password"]);
        self.isLoggedIn(true);
    }

    if (window.localStorage["history"] !== undefined) {
        _.each(_.first(JSON.parse(window.localStorage["history"]), self.historyLimit()), function(p) {
            self.historyItems.push(new HistoryItem(p));
        });
    }
}

ko.applyBindings(new NearlyFennecVM());