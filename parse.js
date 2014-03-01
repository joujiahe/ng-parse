angular.module('ngParse', [])
.provider('ngParse', [function() {
    var _apiVersion = 1,
        _apiUrl = 'https://api.parse.com/' + _apiVersion + '/',
        _objectApiUrl = _apiUrl + 'classes/',
        _batchApiUrl = _apiUrl + 'batch/',
        _appId,
        _restKey,
        _headers = {
            appId: 'X-Parse-Application-Id',
            restKey: 'X-Parse-REST-API-Key',
            contentType: 'Content-Type',
            contentJson: 'application/json'
        },
        // Caches for request headers
        _objectGetHeaders,
        _objectCreateHeaders,
        _objectUpdateHeaders;

    this.init = function(appId, restKey) {
        _appId = appId;
        _restKey = restKey;

        var _hs = _headers;
        _objectGetHeaders = {};
        _objectGetHeaders[_hs.appId] = _appId;
        _objectGetHeaders[_hs.restKey] = _restKey;

        _objectCreateHeaders = angular.copy(_objectGetHeaders);
        _objectCreateHeaders[_hs.contentType] = _hs.contentJson;

        _objectUpdateHeaders = _objectCreateHeaders;
        _objectDeleteHeaders = _objectGetHeaders;
        _objectBatchHeaders = _objectCreateHeaders;
    };

    this.$get = ['$http', function($http) {

        function ParseObject(className) {
            var _object = {};

            function create(options) {
                return $http.post(_objectApiUrl + className, options,
                    {
                        headers: _objectCreateHeaders
                    }
                );
            }

            function get(options) {
                return $http.get(_objectApiUrl + className + 
                    (options && options.objectId ? '/' + options.objectId : ''), 
                    {
                        headers: _objectGetHeaders
                    }
                );
            }

            function update(options) {
                return $http.put(_objectApiUrl + className + 
                    (options && options.objectId ? '/' + options.objectId : ''),
                    options,
                    {
                        headers: _objectUpdateHeaders
                    }
                );
            }

            function del(options) {
                return $http.delete(_objectApiUrl + className + 
                    (options && options.objectId ? '/' + options.objectId : ''),
                    {
                        headers: _objectDeleteHeaders
                    }
                );
            }

            function deleteFields(options) {
                angular.forEach(options.fields, function(field) {
                    options[field] = {__op: 'Delete'};
                });
                delete options.fields;
                return update(options);
            }

            function batch(options) {
                return $http.post(_batchApiUrl,
                    options,
                    {
                        headers: _objectBatchHeaders
                    }
                );
            }

            return {
                create: create,
                get: get,
                update: update,
                delete: del,
                deleteFields: deleteFields,
                batch: batch
            };
        }

        return {
            Object: ParseObject
        };
    }];
}]);