angular.module('app', ['ngParse'])
.config(['ngParseProvider', function(ngParseProvider) {
    var appId = 'q6XQ0eiusGQxbjResDckcaZNhM4h06a8LmIKSfdo',
        restKey = 'kly8JbLTsQQLBzLyr6NvtxRYp8PnTo8B7PMLlgSt';
    ngParseProvider.init(appId, restKey);
}])

.controller('main', ['$scope', 'ngParse', function($scope, ngParse) {

    var query = $scope.query = ngParse.Query('TestObject');
    query.find();

    $scope.createObject = function() {
        var object = ngParse.Object('TestObject');
        object.save(function() {
            query.find(); 
        });
    }

    $scope.removeObject = function(object) {
        object.remove(function() {
            console.log(query);
        })
        object = undefined;
    }
}]);