(function (app) {
    app.models = {
        HistoryItem: function (data) {
            var self = this;
            this.title = ko.observable(data.title);
            this.url = ko.observable(data.url);
            this.visitCount = ko.observable(data.visitCount);
            this.latestVisit = ko.observable(data.latestVisit);
            this.domain = ko.observable(data.domain);

            this.displayTitle = ko.computed(function() {
                return self.title() || self.url();
            });

            this.latestVisitFromNow = ko.computed(function() {
                return moment(self.latestVisit() / 1000).fromNow();
            });
        },

        Place: function (data) {
            var self = this;
            this.name = ko.observable(data.name);
            this.photo = ko.observable(data.photo);
            this.website = ko.observable(data.website);
            this.domain = ko.observable(data.domain);
            this.lat = ko.observable(data.lat);
            this.lng = ko.observable(data.lng);
            this.rating = ko.observable(data.rating);
            this.ratingMax = ko.observable(data.ratingMax || 5);
            this.ratingsCount = ko.observable(data.ratingsCount);
            this.vicinity = ko.observable(data.vicinity);
            this.notes = ko.observable(data.notes);

            this.photoExpanded = ko.observable(false);

            this.ratingDisplay = ko.computed(function () {
                return self.rating() + "/" + self.ratingMax() + " (" + self.ratingsCount() + " ratings)";
            });

            this.mapUrl = ko.computed(function () {
                return "http://maps.apple.com/?q=" + self.vicinity();
            });
        },

        Coordinates: function (data) {
            this.lat = ko.observable(data.lat);
            this.lng = ko.observable(data.lng);
        }
    };
})(app);