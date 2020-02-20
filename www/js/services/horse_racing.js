app.service('GiveMeHorse', function ($q) {
    this.please = function (name, odds) {
        var timer = (odds) ? (Math.random()*15000 + (odds * 500)) : (Math.random()*15000 + 5000)
        return $q(function(resolve, reject) {
            setTimeout(resolve, timer, name)
        });
    };
});