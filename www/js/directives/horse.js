app.directive('horsePanel', function() {
    return {
        restrict: 'E',
        scope: {
            info: "=",
            id: "="
        },
        templateUrl: 'js/directives/horse.html',
        controller: "HorseController"
    };
});