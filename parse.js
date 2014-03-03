angular.module('ngParse', [])
.provider('ngParse', [function() {
    var _POST_ = 'post',
        _GET_  = 'get',
        _PUT_  = 'put',
        _DEL_  = 'delete',
        _DS_   = '/';

    var _apiVersion = 1,
        _apiUrl = 'https://api.parse.com/' + _apiVersion + '/',
        _objectsApiUrl  = _apiUrl + 'classes/',
        _usersApiUrl    = _apiUrl + 'users/',
        _batchApiUrl    = _apiUrl + 'batch/',
        _functionApiUrl = _apiUrl + 'functions/',
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
        _objectCreateHeaders,
        _objectGetHeaders,
        _objectUpdateHeaders,
        _objectDeleteHeaders, 

        _userCreateHeaders,
        _userGetHeaders,
        _userUpdateHeaders,
        _userDeleteHeaders,

        _batchHeaders,
        _functionHeaders;

    this.init = function(appId, restKey) {
        _appId = appId;
        _restKey = restKey;

        var _hs = _headers;
        _baseHeaders = {};
        _baseHeaders[_hs.appId]   = _appId;
        _baseHeaders[_hs.restKey] = _restKey;

        _jsonHeaders = angular.copy(_baseHeaders);
        _jsonHeaders[_hs.contentType] = _hs.contentJson;

        _objectCreateHeaders = _jsonHeaders;
        _objectGetHeaders    = _baseHeaders;
        _objectUpdateHeaders = _jsonHeaders;
        _objectDeleteHeaders = _baseHeaders;

        _userCreateHeaders   = _jsonHeaders;
        _userSignUpHeaders   = _jsonHeaders;
        _userUpdateHeaders   = _jsonHeaders;
        _userDeleteHeaders   = _jsonHeaders;

        _batchHeaders        = _jsonHeaders;
        _functionHeaders     = _jsonHeaders;
    };

    this.$get = ['$http', '$q', function($http, $q) {

        // Base
        function _api(method, classPath, params, configs) {
            return $http[method](_apiUrl + classPath, params, configs);
        }

        // Parse Objects
        // function _classesApi(method, className, params, configs) {
        //     return _api(method, 'classes/' + className, params, configs);
        // }

        // Try more generic way...
        var _classesApi = _api;
        function createObject(className, params) {
            return _classesApi(_POST_, className, params, {
                headers: _objectCreateHeaders
            });
        }

        function readObject(className, params) {
            return _classesApi(_GET_, className + _DS_ + params.objectId, {
                headers: _objectGetHeaders
            });
        }

        function updateObject(className, params) {
            return _classesApi(_PUT_, className + _DS_ + params.objectId, params, {
                headers: _objectUpdateHeaders
            });
        }

        function deleteObject(className, params) {
            return _classesApi(_DEL_, className + _DS_ + params.objectId, {
                headers: _objectDeleteHeaders
            });
        }

        // function saveObject(className, options, clean) {
        //     return options.objectId ? updateObject(className, options, clean) : 
        //             createObject(className, options);
        // }

        function _processUndefinedFields(params) {
            angular.forEach(params, function(value, field) {
                if (value === undefined)
                    params[field] = {__op: 'Delete'};
            });
        }

        function _action(action, process, callback) {
            callback = callback || angular.noop;
            // console.log(req);
            action()
            .success(function(data) {
                if (data.error)
                    process(false, data, callback);
                else
                    process(true, data, callback);
            })
            .error(function(data) {
                process(false, data, callback);
            });
        }

        function ParseClassesObject(className, params) {
            return ParseObject('classes/' + className, params);
        }

        function ParseObject(className, params) {
            var _object = angular.extend({}, params),
                _createAction = _action.bind(undefined,
                            createObject.bind(undefined, className, _object),
                            function(success, data, callback) {
                                angular.extend(_object, data);
                                callback(success);
                            }),

                _readAction = _action.bind(undefined,
                            readObject.bind(undefined, className, _object),
                            function(success, data, callback) {
                                angular.extend(_object, data);
                                callback(success);
                            }),

                _updateAction = _action.bind(undefined,
                            updateObject.bind(undefined, className, _object),
                            function(success, data, callback) {
                                angular.extend(_object, data);
                                callback(success);
                            }),

                _deleteAction = _action.bind(undefined,
                            deleteObject.bind(undefined, className, _object),
                            function(success, data, callback) {
                                angular.extend(_object, data);
                                callback(success);
                            });

            _object.save = function(callback) {
                if (_object.objectId) {
                    _updateAction(callback);
                } else {
                    _createAction(callback);
                }
                return _object;
            }

            _object.get = function(callback) {
                _readAction(callback);
                return _object;
            }

            _object.remove = function(callback) {
                _deleteAction(callback);
                return _object;
            }

            return _object;
        }

        // Parse Users
        function _usersApi(method, params, configs) {
            return _api(method, 'users/' + (params.objectId || ''), params, configs);
        }

        function createUser(params) {
            return _usersApi(_POST_, params, {
                headers: _userCreateHeaders
            });
        }

        function updateUser(params) {
            return (function(data, headers) {
                delete data.sessionToken;
                headers[_headers.sessionToken] = params.sessionToken;

                return _usersApi(_PUT_, data, {
                    headers: headers
                });
            })(angular.extend({}, params), angular.extend({}, _userUpdateHeaders));
        }

        function deleteUser(params) {
            return (function(headers) {
                headers[_headers.sessionToken] = params.sessionToken;
                return _usersApi(_DEL_, {
                    headers: headers
                });
            })(angular.extend({}, _userDeleteHeaders));
        }

        function _loginApi(method, params, configs) {
            return _api(method, 'login/', params, configs);
        }

        function userLogin(params) {
            return _loginApi(_GET_, {
                params: {
                    username: params.username,
                    password: params.password
                },
                headers: _objectGetHeaders
            });
        }

        function ParseUser(params) {
            var _user = angular.extend({}, params),
                _createAction = _action.bind(undefined,
                            createUser.bind(undefined, _user),
                            function(success, data, callback) {
                                angular.extend(_user, data);
                                callback(success);
                            }),

                _loginAction = _action.bind(undefined,
                            userLogin.bind(undefined, _user),
                            function(success, data, callback) {
                                angular.extend(_user, data);
                                callback(success);
                            }),

                _updateAction = _action.bind(undefined,
                            updateUser.bind(undefined, _user),
                            function(success, data, callback) {
                                angular.extend(_user, data);
                                callback(success);
                            }),

                _deleteAction = _action.bind(undefined,
                            deleteUser.bind(undefined, _user),
                            function(success, data, callback) {
                                angular.extend(_user, data);
                                callback(success);
                            }),

                _queryAction = _action.bind(undefined,
                            queryUsers.bind(undefined, _user),
                            function(success, data, callback) {
                                angular.extend(_user, data);
                                callback(success);
                            });


            _user.save = function(callback) {
                if (_user.objectId)
                    _updateAction(callback);
                else
                    _createAction(callback);
                return _user;
            }

            _user.logIn = function(callback) {
                _loginAction(callback);
                return _user;
            }

            _user.remove = function(callback) {
                _deleteAction(callback);
                return _user;
            }

            _user.find = function(callback) {
                _queryAction(callback);
                return _user;
            }

            return _user;
        }

        // Parse Query
        function _queryApi(classPath, query) {
            return _api(_GET_, classPath,  {
                params: _parseQuery(query),
                headers: _objectGetHeaders
            });
        }

        function _parseQuery(query) {
            var query = {};
            angular.forEach(query, function(value, key) {
                query[key] = JSON.stringify(value);
            });
            return query;
        }

        function queryObjects(className, query) {
            return _queryApi('classes/' + className, query);
        }

        function queryUsers(query) {
            return _queryApi('users/', query);
        }

        function ParseQuery(className) {
            var _query = {},

                _queryAction = _action.bind(undefined,
                            queryObjects.bind(undefined, className, _query),
                            function(success, data, callback) {
                                data.results = data.results.map(function(object) {
                                    return ParseObject(className, object);
                                });
                                angular.extend(_query, data);
                                callback(success);
                            });

            _query.find = function(callback) {
                _queryAction(callback);
                return _query;
            }

            return _query;
        }

        function ParseBatch(params) {
            return $http.post(_batchApiUrl, options, {
               headers: _batchHeaders
            });
        }

        function ParseRole(params) {
            return ParseObject('roles', params);
        }

        function ParseFile(params) {
            return ParseObject('files', params);
        }

        function ParseAnalytics(params) {

        }

        function ParsePush(params) {

        }

        function ParseInstallation(params) {
            return ParseObject('installations', params);
        }

        function ParseFunction(params) {
            return $http.post(_functionApiUrl, params, {
               headers: _functionHeaders
            });
        }

        function ParseGeo() {

        }

        return {
            Object: ParseClassesObject,
            User: ParseUser,
            Query: ParseQuery,
            Batch: ParseBatch,
            Role: ParseRole,
            File: ParseFile
        };
    }];
}]);