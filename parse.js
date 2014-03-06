angular.module('ngREST', [])
.factory('ngREST', ['$http', '$q', function($http, $q) {
    var _DS_ = '/',
        _SP_ = '@';

    var _methods = {
        post: {
            method: 'POST',
        },
        get: {
            method: 'GET',
        },
        put: {
            method: 'PUT',
        },
        delete: {
            method: 'DELETE',
        }
    };

    function _mergeConfigs(target, source) {
        if (source == undefined)
            return target;

        var configs = angular.extend({}, target);
        angular.forEach(source, function(config, name) {
            if (angular.isObject(config))
                configs[name] = angular.extend({}, target[name], config);
            else
                configs[name] = config;
        });

        return configs;
    }

    return function (url, defaultConfigs, methods) {
        var urlParams = url.split(_SP_);

        defaultConfigs = angular.extend({url: urlParams.shift()}, defaultConfigs);

        angular.forEach(_methods, function(_methodConfigs, name) {
            if (methods[name])
                methods[name] = _mergeConfigs(methods[name], _methodConfigs);
            else if(methods[name] != false)
                methods[name] = _methodConfigs;
            else
                delete methods[name];
        });

        function Robject(properties) {
            var _this = this;
            angular.forEach(properties, function(value, property) {
                _this[property] = value;
            });
        }
        var prototype  = Robject.prototype,
            refMethods = {};

        angular.forEach(methods, function(methodConfigs, name) {
            if (angular.isString(methodConfigs)) {
                refMethods[name] = methodConfigs;
            } else if (angular.isFunction(methodConfigs)) {
                prototype[name] = methodConfigs;
            } else {
                var _before = methodConfigs.before || angular.noop,
                    _after  = methodConfigs.after || angular.noop,
                    _data   = (/^(POST|PUT)$/i.test((methodConfigs.method))) ? 'data' : 'params';

                delete methodConfigs.before;
                delete methodConfigs.after;

                methodConfigs = _mergeConfigs(defaultConfigs, methodConfigs);
                prototype[name] = function(actionConfigs) {
                    var _this = this,
                        deferred = $q.defer();

                    actionConfigs = _mergeConfigs(methodConfigs, actionConfigs);
                    actionConfigs[_data] = JSON.parse(JSON.stringify((_this)));

                    if(_before.bind(_this)(actionConfigs) == false) {
                        deferred.reject(_this);
                    } else {
                        for (var i = 0, l = urlParams.length; i < l; i++) {
                            var property = urlParams[i];
                            if (_this[property])
                                actionConfigs.url += _this[property] + _DS_;
                            else
                                break;
                        }
                        $http(actionConfigs)
                        .success(function(data) {
                            angular.extend(_this, data);
                            deferred.resolve(_after.bind(_this)(data) || _this);
                        }).error(function(data) {
                            deferred.reject(data);
                        });
                    }
                    // console.dir(actionConfigs);
                    return deferred.promise;
                }
            }
        });

        angular.forEach(refMethods, function(methodConfigs, name) {
            prototype[name] = prototype[methodConfigs];
        });

        return Robject;
    }
}]);

angular.module('ngParse', [])
.provider('ngParse', [function() {
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

    this.$get = ['ngREST', '$q', function(ngREST, $q) {

        function ParseObject(className, params) {
            var Resource = ngREST(_apiUrl + 'classes/' + className + '/@objectId', {
                // default configs
                headers: {
                    'X-Parse-Application-Id': _appId,
                    'X-Parse-REST-API-Key': _restKey
                }
            }, {
                // object methods
                get: {
                },
                post: {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                },
                put: {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                },
                save: function(configs) {
                    var _this = this;

                    return _this.objectId ? _this.put(configs) : _this.post(configs);
                },
                remove: 'delete',
                query: {
                    method: 'GET',
                    before: function() {
                    },
                    after: function() {
                        var _this = this;

                        return _this.results.map(function(data) {
                            return new Resource(data);
                        });
                    }
                }
            });

            return Resource;
        }

        function ParseUser(params) {
            var sessionToken,
                Resource = ngREST(_apiUrl + 'users/@objectId', {
                // default configs
                headers: {
                    'X-Parse-Application-Id': _appId,
                    'X-Parse-REST-API-Key': _restKey
                }
            }, {
                // object methods
                get: {
                },
                post: {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                },
                put: {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    before: function(configs) {
                        configs.headers['X-Parse-Session-Token'] = sessionToken;
                    }
                },
                save: function(configs) {
                    var _this = this;

                    return _this.objectId ? _this.put(configs) : _this.post(configs);
                },
                delete:  {
                    before: function(configs) {
                        configs.headers['X-Parse-Session-Token'] = sessionToken;
                    }
                },
                remove: 'delete',
                logIn: {
                    method: 'GET',
                    url: _apiUrl + 'login',
                    after: function() {
                        sessionToken = this.sessionToken;

                        delete this.password;
                        delete this.sessionToken;
                    }
                },
                query: {
                    method: 'GET',
                    before: function() {
                    },
                    after: function() {
                        var _this = this;

                        return _this.results.map(function(data) {
                            return new Resource(data);
                        });
                    }
                }
            });

            return Resource;
        }

        function ParseBatch(params) {
            return $http.post(_batchApiUrl, options, {
               headers: _batchHeaders
            });
        }

        function ParseRole(params) {
            var Resource = ngREST(_apiUrl + 'roles/@objectId', {
                // default configs
                headers: {
                    'X-Parse-Application-Id': _appId,
                    'X-Parse-REST-API-Key': _restKey
                }
            }, {
                // object methods
                get: {
                },
                post: {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                },
                put: {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                },
                save: function(configs) {
                    var _this = this;

                    return _this.objectId ? _this.put(configs) : _this.post(configs);
                },
                remove: 'delete',
                query: {
                    method: 'GET',
                    before: function() {
                    },
                    after: function() {
                        var _this = this;

                        return _this.results.map(function(data) {
                            return new Resource(data);
                        });
                    }
                }
            });

            return Resource;
        }

        function ParseFile(params) {
            var Resource = ngREST(_apiUrl + 'roles/@objectId', {
                // default configs
                headers: {
                    'X-Parse-Application-Id': _appId,
                    'X-Parse-REST-API-Key': _restKey
                }
            }, {
                // object methods
                get: false,
                post: {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                },
                put: false,
                delete: false
            });

            return Resource;
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
            Object: ParseObject,
            User: ParseUser,
            Role: ParseRole,
            File: ParseFile,
            // Query: ParseQuery,
            // Batch: ParseBatch,
            // File: ParseFile
        };
    }];
}]);