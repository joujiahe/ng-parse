angular.module('ngParse', ['rest'])
.provider('ngParse', [function() {
    var _apiVersion = 1,
        _apiBaseUrl = 'https://api.parse.com/',
        _appId,
        _restKey;

    this.init = function(appId, restKey, apiVersion) {
        _appId = appId;
        _restKey = restKey;
        _apiUrl =  _apiBaseUrl + (apiVersion || _apiVersion) + '/';
    }

    this.$get = ['rest', '$q', function(rest, $q) {

        function ParseObject(className) {
            var RESTObject = rest(_apiUrl + 'classes/' + className + '/@objectId', {
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
                            return new RESTObject(data);
                        });
                    }
                }
            });

            return RESTObject;
        }

        function ParseUser() {
            var sessionToken,
                RESTObject = rest(_apiUrl + 'users/@objectId', {
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
                            return new RESTObject(data);
                        });
                    }
                }
            });

            return RESTObject;
        }

        function ParseBatch() {
            var RESTObject = rest(_apiUrl + 'batch/@objectId', {
                // default configs
                headers: {
                    'X-Parse-Application-Id': _appId,
                    'X-Parse-REST-API-Key': _restKey
                }
            }, {
                // object methods
                post: {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                },
                get: false,
                put: false,
                delete: false
            });

            return RESTObject;
        }

        function ParseRole() {
            var RESTObject = rest(_apiUrl + 'roles/@objectId', {
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
                            return new RESTObject(data);
                        });
                    }
                }
            });

            return RESTObject;
        }

        function ParseFile() {
            var RESTObject = rest(_apiUrl + 'roles/@objectId', {
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

            return RESTObject;
        }

        function ParseAnalytics() {

        }

        function ParsePush() {

        }

        function ParseInstallation() {

        }

        function ParseFunction() {

        }

        function ParseGeo() {

        }

        return {
            Object: ParseObject,
            User: ParseUser,
            Batch: ParseBatch,
            Role: ParseRole,
            File: ParseFile,
            // Query: ParseQuery,
            // File: ParseFile
        };
    }];
}]);