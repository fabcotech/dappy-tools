"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var xstream_1 = require("xstream");
var fetchPolyfilled;
if (typeof fetch === "function") {
    fetchPolyfilled = fetch;
}
else {
    fetchPolyfilled = require("node-fetch");
}
var models_1 = require("./models");
var resolver = function (nodeUrl, urlToQuery, query) {
    return new Promise(function (resolve, reject) {
        var fetchParameters = {
            method: query.method.toLowerCase(),
            headers: query.headers
        };
        if (fetchParameters.method !== "get") {
            fetchParameters.body = JSON.stringify(query.parameters);
        }
        fetchPolyfilled(urlToQuery + query.path, fetchParameters)
            .then(function (a) {
            if ([200, 202].find(function (status) { return status === a.status; })) {
                return a.text();
            }
            else {
                resolve({ type: "ERROR", nodeUrl: nodeUrl, status: a.status });
                throw new Error(JSON.stringify({ status: a.status, statusText: a.statusText }));
            }
        })
            .then(function (a) {
            resolve({ type: "SUCCESS", nodeUrl: nodeUrl, data: a });
        })["catch"](function (a) {
            var status;
            try {
                status = JSON.parse(a.message).status;
            }
            catch (e) {
                status = 404;
            }
            resolve({ type: "ERROR", nodeUrl: nodeUrl, status: status });
        });
    });
};
var indexData = function (data, existingData, comparer) {
    var _a;
    var found = false;
    var stringToCompare = data.data;
    if (typeof comparer === "function") {
        try {
            stringToCompare = comparer(data.data);
        }
        catch (err) {
            throw err;
        }
    }
    Object.keys(existingData).forEach(function (key) {
        var _a;
        if (stringToCompare === existingData[key].stringToCompare) {
            found = true;
            existingData = __assign({}, existingData, (_a = {}, _a[key] = __assign({}, existingData[key], { nodeUrls: existingData[key].nodeUrls.concat(data.nodeUrl) }), _a));
        }
    });
    if (!found) {
        existingData = __assign({}, existingData, (_a = {}, _a[Object.keys(existingData).length + 1] = {
            nodeUrls: [data.nodeUrl],
            data: data.data,
            stringToCompare: stringToCompare
        }, _a));
    }
    if (!Object.keys(existingData).length) {
        existingData = {
            "1": {
                nodeUrls: [data.nodeUrl],
                data: data.data || "",
                stringToCompare: stringToCompare
            }
        };
    }
    return existingData;
};
var createStream = function (query, urlsToQuery) {
    var streams = urlsToQuery.map(function (urlToQuery) {
        return xstream_1["default"].fromPromise(resolver(urlToQuery, urlToQuery, query));
    });
    return xstream_1["default"].merge.apply(xstream_1["default"], streams);
};
exports.resolve = function (query, nodeUrls, resolverMode, resolverAccuracy, resolverAbsolute, comparer) {
    var loadErrors = {};
    var loadState = {};
    var loadPending = [];
    return xstream_1["default"].create({
        start: function (listener) {
            listener.next({
                loadErrors: loadErrors,
                loadState: loadState,
                loadPending: loadPending,
                status: models_1.LoadStatus.Loading
            });
            if (resolverMode === "absolute") {
                if (resolverAbsolute > nodeUrls.length) {
                    listener.next({
                        loadErrors: loadErrors,
                        loadState: loadState,
                        loadPending: loadPending,
                        loadError: {
                            error: models_1.LoadError.InsufficientNumberOfNodes,
                            args: {
                                expected: resolverAbsolute,
                                got: nodeUrls.length
                            }
                        },
                        status: models_1.LoadStatus.Failed
                    });
                    listener.complete();
                    return;
                }
                var i = 0;
                var callBatch_1 = function (i) {
                    var urlsToQuery = nodeUrls.slice(i, i + resolverAbsolute + 1);
                    if (urlsToQuery.length === 0) {
                        listener.next({
                            loadErrors: loadErrors,
                            loadState: loadState,
                            loadPending: loadPending,
                            loadError: {
                                error: models_1.LoadError.OutOfNodes,
                                args: {
                                    alreadyQueried: i - Object.keys(loadErrors).length,
                                    resolverAbsolute: resolverAbsolute
                                }
                            },
                            status: models_1.LoadStatus.Failed
                        });
                        listener.complete();
                        return;
                    }
                    i += urlsToQuery.length;
                    loadPending = loadPending.concat(urlsToQuery);
                    listener.next({
                        loadErrors: loadErrors,
                        loadState: loadState,
                        loadPending: loadPending,
                        status: models_1.LoadStatus.Loading
                    });
                    var stream = createStream(query, urlsToQuery);
                    stream.take(urlsToQuery.length).subscribe({
                        next: function (data) {
                            var _a, _b;
                            loadPending = loadPending.filter(function (url) { return url !== data.nodeUrl; });
                            if (data.type === "SUCCESS") {
                                try {
                                    var newLoadState = indexData(data, loadState, comparer);
                                    loadState = newLoadState;
                                }
                                catch (err) {
                                    loadErrors = __assign({}, loadErrors, (_a = {}, _a[data.nodeUrl] = {
                                        nodeUrl: data.nodeUrl,
                                        status: err.message ? parseInt(err.message, 10) : 400
                                    }, _a));
                                }
                            }
                            else {
                                loadErrors = __assign({}, loadErrors, (_b = {}, _b[data.nodeUrl] = {
                                    nodeUrl: data.nodeUrl,
                                    status: data.status
                                }, _b));
                            }
                            listener.next({
                                loadErrors: loadErrors,
                                loadState: loadState,
                                loadPending: loadPending,
                                status: models_1.LoadStatus.Loading
                            });
                        },
                        error: function (e) {
                            console.error(e);
                            listener.error("UnknownError");
                        },
                        complete: function () {
                            // 5 or more load errors
                            if (Object.keys(loadErrors).length > 4) {
                                listener.next({
                                    loadErrors: loadErrors,
                                    loadState: loadState,
                                    loadPending: loadPending,
                                    loadError: {
                                        error: models_1.LoadError.ServerError,
                                        args: {
                                            numberOfLoadErrors: Object.keys(loadErrors).length
                                        }
                                    },
                                    status: models_1.LoadStatus.Failed
                                });
                                listener.complete();
                                return;
                                // 3 or more different groups
                            }
                            else if (Object.keys(loadState).length > 2) {
                                listener.next({
                                    loadErrors: loadErrors,
                                    loadState: loadState,
                                    loadPending: loadPending,
                                    loadError: {
                                        error: models_1.LoadError.UnstableState,
                                        args: {
                                            numberOfLoadStates: Object.keys(loadState).length
                                        }
                                    },
                                    status: models_1.LoadStatus.Failed
                                });
                                listener.complete();
                                return;
                            }
                            else {
                                var totalOkResponses_1 = Object.keys(loadState).reduce(function (total, k) {
                                    return total + loadState[k].nodeUrls.length;
                                }, 0);
                                for (var i_1 = 0; i_1 < Object.keys(loadState).length; i_1 += 1) {
                                    var key = Object.keys(loadState)[i_1];
                                    var nodesWithOkResponses = loadState[key].nodeUrls.length;
                                    // at least [resolverAbsolute] responses of the same
                                    // resolver must Complete or Fail
                                    if (nodesWithOkResponses >= resolverAbsolute) {
                                        if (resolverAccuracy / 100 >
                                            loadState[key].nodeUrls.length / totalOkResponses_1) {
                                            listener.next({
                                                loadErrors: loadErrors,
                                                loadState: loadState,
                                                loadPending: loadPending,
                                                loadError: {
                                                    error: models_1.LoadError.UnaccurateState,
                                                    args: {
                                                        totalOkResponses: totalOkResponses_1,
                                                        loadStates: Object.keys(loadState).map(function (k) {
                                                            return {
                                                                key: k,
                                                                okResponses: loadState[k].nodeUrls.length,
                                                                percent: Math.round((100 *
                                                                    (100 * loadState[k].nodeUrls.length)) /
                                                                    totalOkResponses_1) / 100
                                                            };
                                                        })
                                                    }
                                                },
                                                status: models_1.LoadStatus.Failed
                                            });
                                            listener.complete();
                                            return;
                                        }
                                        listener.next({
                                            loadErrors: loadErrors,
                                            loadState: loadState,
                                            loadPending: loadPending,
                                            status: models_1.LoadStatus.Completed
                                        });
                                        listener.complete();
                                        return;
                                    }
                                }
                            }
                            callBatch_1(i);
                        }
                    });
                };
                callBatch_1(i);
            }
        },
        stop: function () { }
    });
};
