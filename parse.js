angular.module('ngParse', [])
.provider('ngParse', [function() {
    var _POST_ = 'post',
        _GET_  = 'get',
        _PUT_  = 'put',
        _DEL_  = 'delete',
        _DS_   = '/';

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

        _userCreateHeaders   = _jsonHeaders;
        _userSignUpHeaders   = _jsonHeaders;
        _userUpdateHeaders   = _jsonHeaders;
        _userDeleteHeaders   = _jsonHeaders;

        _objectBatchHeaders  = _jsonHeaders;

    };

    this.$get = ['$http', '$q', function($http, $q) {

        function _api(method, classPath, params, configs) {
            return $http[method](_apiUrl + classPath, params, configs);
        }

        function _classesApi(method, className, params, configs) {
            return _api(method, 'classes/' + className, params, configs);
        }

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

        function _query(classPath, queryObject) {
            return _api(_GET_, classPath,  {
                params: _parseQueryObject(queryObject),
                headers: _objectGetHeaders
            });
        }

        function _parseQueryObject(queryObject) {
            var query = {};
            angular.forEach(queryObject, function(value, key) {
                query[key] = JSON.stringify(value);
            });
            return query;
        }

        function queryObjects(className, params) {
            return _query('classes/' + className, params.query);
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
                            }),

                _queryAction = _action.bind(undefined,
                            queryObjects.bind(undefined, className, _object),
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

            _object.find = function(callback) {
                _queryAction(callback);
                return _object;
            }

            return _object;
        }

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

        function findUsers(params) {

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

        function queryUsers(params) {
            return _query('users/', params.query);
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