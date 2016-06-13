app.VM = function() {
    var self = this;

    self.historyLimit = 100;

    self.isLoggedIn = ko.observable(false);
    self.email = ko.observable("");
    self.password = ko.observable("");

    self.places = ko.observableArray([]);
    self.historyItems = ko.observableArray([]);

    self.recommendations = ko.observableArray([]);

    self.isLoadingNearby = ko.observable(false);
    self.isLoadingHistory = ko.observable(false);

    self.currentPosition = ko.observable();

    self.positionDisplayCoordinates = ko.computed(function () {
        if (!self.currentPosition()) {
            return "unknown";
        }
        return self.currentPosition().coords.latitude + "," + self.currentPosition().coords.longitude;
    });

    self.uiActions = {
        login: function () {
            var email = self.email(),
                password = self.password();

            self.fetchHistory(email, password, function (result) {
                if (result.success) {
                    window.localStorage["email"] = email;
                    window.localStorage["password"] = password;

                    self.isLoggedIn(true);
                } else {
                    alert("Problems logging in: " + result.error);
                }
            });
        },

        logout: function () {
            window.localStorage.clear();
            self.email(undefined);
            self.password(undefined);
            self.isLoggedIn(false);
        },

        nearbySearch: function () {
            if (!self.currentPosition()) {
                alert("No idea where you are :(");
                return;
            }
            self.getPlacesNearPosition(self.currentPosition());
        },

        fetchHistory: function () {
            self.fetchHistory(self.email(), self.password());
        }
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
            // hack... why isn't place.domain always function??
            var placeDomain;
            if ((typeof place.domain) === "string") {
                placeDomain = place.domain;
            }  else if ((typeof place.domain) === "function") {
                placeDomain = place.domain();
            } else {
                return;
            }

            _.each(self.historyItems(), function(item) {
                if (item.domain() === undefined) {
                    return;
                }

                if (placeDomain !== item.domain()) {
                    return;
                }

                if (places[place.website] !== undefined) {
                    places[place.website].items.push(item);
                } else {
                    console.log(place.website);
                    places[place.website] = {
                        place: place,
                        items: [item]
                    };
                }
            });
        });

        return _.shuffle(_.union(self.recommendations(), _.map(_.keys(places), function(key) {
            return {
                place: places[key].place,
                items: places[key].items
            }
        })));
    });

    self.fetchHistory = function (email, password, callback) {
        self.isLoadingHistory(true);

        // TODO ERROR HANDLING BROKEN

        $.post("https://fennec-history-proxy.herokuapp.com/history", {
            email: email,
            password: password,
            limit: self.historyLimit
        }, function (results) {
            self.processHistory(results);
            self.isLoadingHistory(false);

            callback && callback({
                success: true
            });
        }, function (error) {
            callback && callback({
                success: false,
                error: error
            });
        }, 'json');
    };

    self.getPlacesNearPosition = function(position) {
        app.services.googlePlaces.nearbySearch(
            position.coords.latitude, position.coords.longitude,
            function(results, status) {
                let places = [];
                _.each(results, function(res) {
                    var place = app.services.kvCache.get(res.place_id);
                    if (place !== undefined) {
                        console.log("Found place in cache", res.place_id);
                        places.push(place);
                    } else {
                        self.getPlaceDetails(res.place_id,
                            function(place) {
                                app.services.kvCache.set(res.place_id, place);
                                places.push(new app.models.Place(place));
                            },

                            function(errorStatus) {}
                        );
                    }
                });

                self.places(places);
            }
        );
    };

    self.getPlaceDetails = function(placeId, callback, errCallback) {
        app.services.googlePlaces.service.getDetails({
            "placeId": placeId
        }, function(placeDetails, status) {
            if (status !== google.maps.places.PlacesServiceStatus.OK) {
                console.error("Failed to get place details", placeId, status);
                errCallback && errCallback(status);
                return;
            }

            console.log("Fetched place details", placeId);
            callback(app.services.googlePlaces.placeDetailsToDataObject(placeDetails));
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

        app.services.kvCache.set("history", processed);

        self.historyItems([]);
        let ls = [];
        _.each(processed, function(p) {
            is.push(new HistoryItem(p));
        });
        self.historyItems(ls);
    };

    self.getRecommendations = function (pos) {
    };

    self.getCurrentLocation = function (callback) {
        navigator.geolocation.getCurrentPosition(function (pos) {
            self.currentPosition(pos);
            callback(pos);
        });
    };

    self.setIsLoggedIn = function () {
        if (!window.localStorage["email"] || !window.localStorage["password"]) {
            return;
        }

        self.email(window.localStorage["email"]);
        self.password(window.localStorage["password"]);
        self.isLoggedIn(true);
    };

    self.loadCachedHistory = function (limit) {
        var cachedHistory = app.services.kvCache.get("history");

        if (cachedHistory === undefined) {
            return;
        }

        _.each(_.first(cachedHistory, self.historyLimit), function (p) {
            self.historyItems.push(new app.models.HistoryItem(p));
        });
    };

    self.init = function () {
        app.services.googlePlaces.init(document.getElementById("map"));

        self.setIsLoggedIn();
        self.getCurrentLocation(function (position) {
            self.getPlacesNearPosition(position);
            self.getRecommendations(position);
        });
        self.loadCachedHistory();
    };

    self.init();
    self.recommendations(DUMMY_RECOMMENDATIONS);
}

ko.applyBindings(new app.VM());