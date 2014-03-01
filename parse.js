angular.module('ngParse', [])
.provider('ngParse', [function() {
    var _apiVersion = 1,
        _apiUrl = 'https://api.parse.com/' + _apiVersion + '/',
        _objectsApiUrl = _apiUrl + 'classes/',
        _usersApiUrl = _apiUrl + 'users/',
        _batchApiUrl = _apiUrl + 'batch/',
        _appId,
        _restKey,
        _headers = {
            appId: 'X-Parse-Application-Id',
            restKey: 'X-Parse-REST-API-Key',
            sessionToken: 'X-Parse-Session-Token',
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
        _baseHeaders = {};
        _baseHeaders[_hs.appId]   = _appId;
        _baseHeaders[_hs.restKey] = _restKey;

        _jsonHeaders = angular.copy(_baseHeaders);
        _jsonHeaders[_hs.contentType] = _hs.contentJson;

        _objectGetHeaders    = _baseHeaders;
        _objectCreateHeaders = _jsonHeaders;
        _objectUpdateHeaders = _jsonHeaders;
        _objectDeleteHeaders = _baseHeaders;
        _objectBatchHeaders  = _jsonHeaders;

        _userSignUpHeaders   = _jsonHeaders;
    };

    this.$get = ['$http', '$q', function($http, $q) {

        function createObject(className, options) {
            return $http.post(_objectsApiUrl + className, options, {
                headers: _objectCreateHeaders
            });
        }

        function getObject(className, options) {
            return $http.get(_objectsApiUrl + className + options.objectId, {
                headers: _objectGetHeaders
            });
        }

        function findObjects(className, options) {
            var params = {};
            angular.forEach(options.query, function(value, key) {
                params[key] = JSON.stringify(value);
            });
            return $http.get(_objectsApiUrl + className, {
                params: params,
                headers: _objectGetHeaders
            });
        }

        function updateObject(className, options, clean) {
            return clean ? deleteFields(className, options) :
            $http.put(_objectsApiUrl + className + '/' + options.objectId, options, {
                headers: _objectUpdateHeaders
            });
        }

        function deleteObject(className, options) {
            return $http.delete(_objectsApiUrl + className + '/' + options.objectId, {
                headers: _objectDeleteHeaders
            });
        }

        function deleteFields(className, options) {
            angular.forEach(options, function(value, field) {
                if (value === undefined)
                    options[field] = {__op: 'Delete'};
            });
            return updateObject(className, options);
        }

        function saveObject(className, options, clean) {
            return options.objectId ? updateObject(className, options, clean) : 
                    createObject(className, options);
        }

        function _resolveReq(req, callback, clean) {
            var _object = this;
            if (!callback)
                callback = angular.noop;

            req(clean).success(function(data) {
                var error = false;
                if (data.error) {
                    error = data;
                } else if (data.results) {
                    var datas = data.results;

                    angular.forEach(_object, function(value, key) {
                        delete _object[key];
                    });

                    angular.forEach(datas, function(value, key) {
                        _object[key] = ParseObject(className, value);
                    });
                } else {
                    angular.extend(_object, data);
                }
                callback(error);
            }).error(function(error) {
                callback(error);
            });
            return _object;
        }

        function ParseObject(className, options) {
            var _object = angular.extend({}, options),
                _createObject = createObject.bind(_object, className, _object),
                _getObject    = getObject.bind(_object, className, _object),
                _findObjects  = findObjects.bind(_object, className, _object),
                _updateObject = updateObject.bind(_object, className, _object),
                _deleteObject = deleteObject.bind(_object, className, _object),
                _deleteFields = deleteFields.bind(_object, className, _object),
                _saveObject   = saveObject.bind(_object, className, _object);

            // _object.create = _resolveReq.bind(_object, _createObject);
            _object.get    = _resolveReq.bind(_object, _getObject);
            _object.find   = _resolveReq.bind(_object, _findObjects);
            // _object.update = _resolveReq.bind(_object, _updateObject);
            _object.remove = _resolveReq.bind(_object, _deleteObject);
            _object.save   = _resolveReq.bind(_object, _saveObject);
            _object.deleteFields   = _resolveReq.bind(_object, _deleteFields);
            return _object;
        }

        function createUser(options) {
            return $http.post(_usersApiUrl, options, {
                headers: _objectCreateHeaders
            });
        }

        function updateUser(options, clean) {
            return clean ? deleteUserFields(options) :
            (function(_userData) {
                delete _userData.sessionToken;
                var headers = angular.extend({}, _objectUpdateHeaders);
                headers[_headers.sessionToken] = options.sessionToken;

                return $http.put(_usersApiUrl + options.objectId, _userData, {
                    headers: headers
                });
            })(angular.extend({}, options));
        }

        function deleteUserFields(options) {
            angular.forEach(options, function(value, field) {
                if (value === undefined)
                    options[field] = {__op: 'Delete'};
            });
            return updateUser(options);
        }

        function saveUser(options, clean) {
            return options.objectId ? updateUser(options, clean) : 
                    createUser(options);
        }

        function userLogin(options) {
            return $http.get(_apiUrl + 'login', {
                params: {
                    username: options.username,
                    password: options.password
                },
                headers: _objectGetHeaders
            });
        }

        function ParseUser(options) {
            var _user = ParseObject('users', options),
                _updateUser       = updateUser.bind(_user, _user),
                _deleteUserFields = deleteUserFields.bind(_user, _user),
                _saveUser         = saveUser.bind(_user, _user),
                _userLogin        = userLogin.bind(_user, _user);

            _user.signUp = _resolveReq.bind(_user, _saveUser);
            // _user.update = _resolveReq.bind(_user, _updateUser);
            _user.save   = _resolveReq.bind(_user, _saveUser);
            _user.logIn  = _resolveReq.bind(_user, _userLogin);
            return _user;
        }

        function ParseBatch(options) {
            return $http.post(_batchApiUrl, options, {
               headers: _objectBatchHeaders
            });
        }

        return {
            Object: ParseObject,
            User: ParseUser,
            Batch: ParseBatch
        };
    }];
}]);