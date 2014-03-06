angular.module('app', ['ngParse', 'ngREST'])
.config(['ngParseProvider', function(ngParseProvider) {
    var appId = 'q6XQ0eiusGQxbjResDckcaZNhM4h06a8LmIKSfdo',
        restKey = 'kly8JbLTsQQLBzLyr6NvtxRYp8PnTo8B7PMLlgSt';
    ngParseProvider.init(appId, restKey);
}])

.controller('main', ['$scope', 'ngParse', 'ngREST', function($scope, ngParse, ngREST) {
    var File = ngParse.File();
    console.dir(new File());
    // var TestObject = ngParse.Object('TestObject');
    // var object = new TestObject({foo: 'qoo'});
    // object.objectId = 'qlUBqWTtsj';
    // object.query().then(function(data) {
    //     console.dir(data);
    // });
    // var query = $scope.query = ngParse.Query('TestObject');
    // query.find();

    // $scope.createObject = function() {
    //     var object = ngParse.Object('TestObject');
    //     object.save(function() {
    //         query.find(); 
    //     });
    // }

    // $scope.removeObject = function(object) {
    //     object.remove(function() {
    //         console.log(query);
    //     })
    //     object = undefined;
    // }

    // var role = ngParse.Role({name: 'Test', ACL: {'*': {read: true}}});
    // role.save();

    // var User = ngParse.User();
    // var user = new User();
    // user.username = 'joujiahe';
    // user.password = '5.ru8ck6';
    // user.logIn().then(function() {
    //     user.remove().then(function() {
    //         console.dir(user);
    //     });
    // });
}]);