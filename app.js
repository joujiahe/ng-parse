angular.module('app', ['ngParse'])
.config(['ngParseProvider', function(ngParseProvider) {
    var appId = 'q6XQ0eiusGQxbjResDckcaZNhM4h06a8LmIKSfdo',
        restKey = 'kly8JbLTsQQLBzLyr6NvtxRYp8PnTo8B7PMLlgSt';
    ngParseProvider.init(appId, restKey);
}])

.controller('main', ['$scope', 'ngParse', function($scope, ngParse) {
    // ngParse.Object('TestObject').get()
    // .success(function(data, status, headers, config) {
    //     console.log(data);
    // });
    // ngParse.Object('TestObject').create({
    //     mynewfield: 'oqq'
    // })
    // .success(function(data, status, headers, config) {
    //     console.log(data);
    // });
    // ngParse.Object('TestObject').delete({
    //     objectId: '6zL0jk7vQD',
    //     qoo: 'test qoo'
    // })
    // .success(function(data, status, headers, config) {
    //     console.log(data);
    // });
    // ngParse.Object('TestObject').deleteFields({
    //     objectId: 'tK0py9uN3J',
    //     fields: ['mynewfield']
    // })
    // .success(function(data, status, headers, config) {
    //     console.log(data);
    // });

    // ngParse.Object('TestObject').batch({requests:[{
    //     "method": "DELETE",
    //     "path": "/1/classes/TestObject/tK0py9uN3J"
    // }, {
    //     "method": "DELETE",
    //     "path": "/1/classes/TestObject/Ow7ZEjvYlG"
    // }, {
    //     "method": "DELETE",
    //     "path": "/1/classes/TestObject/9bAuZUQSs9"
    // }, {
    //     "method": "DELETE",
    //     "path": "/1/classes/TestObject/xrKh8uvCZz"
    // }, {
    //     "method": "DELETE",
    //     "path": "/1/classes/TestObject/IxzhGRfCSc"
    // }, {
    //     "method": "DELETE",
    //     "path": "/1/classes/TestObject/3uVjsfAesP"
    // }]})
    // .success(function(data, status, headers, config) {
    //     console.log(data);
    // });}]);