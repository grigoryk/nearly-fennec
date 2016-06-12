(function (app) {
    app.models = {
        HistoryItem: function (data) {
            var self = this;
            this.title = ko.observable(data.title);
            this.url = ko.observable(data.url);
            this.visitCount = ko.observable(data.visitCount);
            this.domain = ko.observable(data.domain);

            this.displayTitle = ko.computed(function() {
                return self.title() || self.url();
            });
        },

        Place: function (data) {
            this.name = ko.observable(data.name);
            this.photo = ko.observable(data.photo);
            this.website = ko.observable(data.website);
            this.domain = ko.observable(data.domain);
            this.lat = ko.observable(data.lat);
            this.lng = ko.observable(data.lng);
            this.rating = ko.observable(data.rating);
            this.ratingsCount = ko.observable(data.ratingsCount);
            this.vicinity = ko.observable(data.vicinity);
        },

        Coordinates: function (data) {
            this.lat = ko.observable(data.lat);
            this.lng = ko.observable(data.lng);
        }
    };
})(app);