angular.module('rest', [])
.factory('rest', ['$http', '$q', function($http, $q) {
    var _DS_ = '/',
        _SP_ = '@',
        extend     = angular.extend,
        copy       = angular.copy,
        forEach    = angular.forEach,
        isObject   = angular.isObject,
        isString   = angular.isString,
        isFunction = angular.isFunction,
        noop       = angular.noop,
        fromJson   = angular.fromJson,
        toJson     = angular.toJson;

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

        var configs = extend({}, target);
        forEach(source, function(config, name) {
            if (isObject(config))
                configs[name] = extend({}, target[name], config);
            else
                configs[name] = config;
        });

        return configs;
    }

    return function (url, defaultConfigs, methods) {
        var urlParams = url.split(_SP_);

        defaultConfigs = extend({url: urlParams.shift()}, defaultConfigs);

        forEach(_methods, function(_methodConfigs, name) {
            if (methods[name])
                methods[name] = _mergeConfigs(methods[name], _methodConfigs);
            else if(methods[name] != false)
                methods[name] = _methodConfigs;
            else
                delete methods[name];
        });

        function RESTObject(properties) {
            var _this = this;
            forEach(properties, function(value, property) {
                _this[property] = value;
            });
        }
        var prototype  = RESTObject.prototype,
            refMethods = {};

        forEach(methods, function(methodConfigs, name) {
            if (isString(methodConfigs)) {
                refMethods[name] = methodConfigs;
            } else if (isFunction(methodConfigs)) {
                prototype[name] = methodConfigs;
            } else {
                var _before = methodConfigs.before || noop,
                    _after  = methodConfigs.after || noop,
                    _data   = (/^(POST|PUT)$/i.test((methodConfigs.method))) ? 'data' : 'params';

                prototype[name] = function(data) {
                    var _this = this,
                        deferred = $q.defer(),
                        httpConfigs = copy(_mergeConfigs(defaultConfigs, methodConfigs));

                    extend(_this, data);
                    httpConfigs[_data] = fromJson(toJson(_this));

                    forEach(urlParams, function(property) {
                        if (_this[property])
                            httpConfigs.url += _this[property];

                        _this[property] += _DS_;
                    });

                    if(_before.bind(_this)(httpConfigs) == false) {
                        deferred.reject(_this);
                    } else {
                        $http(httpConfigs)
                        .success(function(res) {
                            extend(_this, res);
                            deferred.resolve(_after.bind(_this)(res) || _this);
                        }).error(function(res) {
                            deferred.reject(res);
                        });
                    }
                    return deferred.promise;
                }
            }
        });

        forEach(refMethods, function(methodConfigs, name) {
            prototype[name] = prototype[methodConfigs];
        });

        return RESTObject;
    }
}]);
