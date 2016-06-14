app.VM = function() {
    var self = this;

    self.historyLimit = 20000;

    self.isLoggedIn = ko.observable(false);
    self.isLoggingIn = ko.observable(false);
    self.loginError = ko.observable("");
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

            self.loginError("");
            self.isLoggingIn(true);

            self.fetchHistory(email, password, function (result) {
                self.isLoggingIn(false);
                if (result.success) {
                    window.localStorage["email"] = email;
                    window.localStorage["password"] = password;

                    self.isLoggedIn(true);
                } else {
                    self.loginError(result.error.message);
                }
            });
        },

        logout: function () {
            window.localStorage.removeItem("email");
            window.localStorage.removeItem("password");
            window.localStorage.removeItem("history");
            self.email(undefined);
            self.password(undefined);
            self.isLoggedIn(false);
        },

        clearAll: function() {
            window.localStorage.clear();
            self.email(undefined);
            self.password(undefined);
            self.isLoggedIn(false);
        },

        nearbySearch: function () {
            self.isLoadingNearby(true);
            self.getCurrentLocation(function (position) {
                self.getPlacesNearPosition(position);
            });
            document.body.scrollTop = document.documentElement.scrollTop = 0;
        },

        fetchHistory: function () {
            self.fetchHistory(self.email(), self.password());
        },

        expandPhoto: function (obj) {
            obj.place.photoExpanded(!obj.place.photoExpanded());
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

    self.fetchHistory = function (email, password, callback) {
        self.isLoadingHistory(true);

        $.post("https://fennec-history-proxy.herokuapp.com/history", {
            email: email,
            password: password,
            limit: self.historyLimit
        }).done(function (results) {
            self.processHistory(results);

            callback && callback({
                success: true
            });
        }).fail(function (res) {
            callback && callback({
                success: false,
                error: res.responseJSON.error
            });
        }).always(function () {
            self.isLoadingHistory(false);
        });
    };

    self.getPlacesNearPosition = function(position) {
        self.isLoadingNearby(true);
        app.services.googlePlaces.nearbySearch(
            position.coords.latitude, position.coords.longitude,
            function(results, status) {
                let places = [];
                _.each(results, function(res) {
                    var place = app.services.kvCache.get(res.place_id);
                    if (place !== undefined) {
                        console.log("Found place in cache", res.place_id);
                        places.push(new app.models.Place(place));
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

                self.isLoadingNearby(false);

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
                obj.domain = new URI(obj.url).hostname();
            }

            if (item.visits) {
                obj.visitCount = item.visits.length;
                obj.latestVisit = _.max(item.visits, function (visit) {
                    return visit.date;
                }).date;
            }

            return obj;
        });

        app.services.kvCache.set("history", processed);

        self.historyItems([]);
        let ls = [];
        _.each(processed, function(p) {
            ls.push(new app.models.HistoryItem(p));
        });
        self.historyItems(ls);
    };

    self.getRecommendations = function (pos) {
        self.recommendations(_.first(_.shuffle(_.map(DUMMY_RECOMMENDATIONS, function (rec) {
            return {
                place: new app.models.Place(rec.place),
                items: rec.items
            };
        })), 2));
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

        self.historyItems(_.map(_.first(cachedHistory, self.historyLimit), function (p) {
            return new app.models.HistoryItem(p);
        }));
    };

    self.init = function () {
        app.services.googlePlaces.init(document.getElementById("map"));

        self.setIsLoggedIn();
        self.getRecommendations();
        self.getCurrentLocation(function (position) {
            self.getPlacesNearPosition(position);
        });

        window.setTimeout(self.loadCachedHistory, 0);
    };

    self.init();
}

var progress = 0,
    loadTime = 7000,
    updateProgressEvery = 500,

    progressInterval = window.setInterval(function () {
        progress = progress + updateProgressEvery;
        console.log(progress);

        $(".load-progress").html(Math.round((progress/loadTime) * 100) + "%");
    }, updateProgressEvery);

window.setTimeout(function () {
    $(".app").show();
    $(".preload-app").hide();
    window.clearInterval(progressInterval);
}, loadTime);

ko.applyBindings(new app.VM());