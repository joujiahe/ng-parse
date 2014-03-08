angular.module('app', ['ngParse'])
.config(['ngParseProvider', function(ngParseProvider) {
    var appId = 'q6XQ0eiusGQxbjResDckcaZNhM4h06a8LmIKSfdo',
        restKey = 'kly8JbLTsQQLBzLyr6NvtxRYp8PnTo8B7PMLlgSt',
        masterKey = 'at1pw2FxzaDFtoO1alUS8VWkTSBSNN9UPdjYZ5MV';
    ngParseProvider.init(appId, restKey, masterKey);
}])

.controller('main', ['$scope', 'ngParse', function($scope, ngParse) {
    // var FileObject = ngParse.File();
    // $scope.upload = function(evt) {
    //     var file = document.getElementById('file').files[0];
        
    //     var picture = new FileObject({
    //         name: file.name,
    //         file: file
    //     });
    //     picture.save().then(function(v) {
    //         console.dir(v);
    //         var TestObject = ngParse.Object('TestObject'),
    //             object = new TestObject();
    //         object.save().then(function(v) {
    //             console.dir(v);
    //             object.file = picture;
    //             object.save().then(function() {
    //                 console.dir(object);
    //             })
    //         });
    //     });
        // "ffdf11d4-9cbb-4e43-84d0-f5da1e6af9c8-170.jpg"
        // "8763285d-88a7-4523-973a-016ff6d9647b-170.jpg"
        // reader.onload = function(evt) {
        //     console.dir(evt);
        //     var dataURL = evt.target.result;
        //     var mimeType = dataURL.split(",")[0].split(":")[1].split(";")[0];
        //     console.log(mimeType);
        // };
        
        // reader.readAsDataURL(file);
    // }
    var TestObject = ngParse.Object('TestObject');
    var object = new TestObject();
    object.query().then(function(data) {
        console.dir(data);
        // angular.forEach(data, function(v){
        //     v.remove();
        // })
    });

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