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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
/*
  We do not do a Promise.all on all ids
  requests will be done BATCH_SIZE by BATCH_SIZE
*/
var BATCH_SIZE = 2;
export var BeesLoadStatus;
(function (BeesLoadStatus) {
    BeesLoadStatus["Loading"] = "loading";
    BeesLoadStatus["Failed"] = "failed";
    BeesLoadStatus["Completed"] = "completed";
})(BeesLoadStatus || (BeesLoadStatus = {}));
export var BeesLoadError;
(function (BeesLoadError) {
    BeesLoadError["OutOfNodes"] = "Out of nodes";
    BeesLoadError["UnaccurateState"] = "Unaccurate state";
})(BeesLoadError || (BeesLoadError = {}));
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
    // initialize existingData
    if (Object.keys(existingData).length === 0) {
        existingData = {
            "1": {
                ids: [data.id],
                data: data.data || "",
                stringToCompare: stringToCompare,
            },
        };
    }
    else {
        Object.keys(existingData).forEach(function (key) {
            var _a;
            if (stringToCompare === existingData[key].stringToCompare) {
                found = true;
                existingData = __assign(__assign({}, existingData), (_a = {}, _a[key] = __assign(__assign({}, existingData[key]), { ids: existingData[key].ids.concat(data.id) }), _a));
            }
        });
        if (!found) {
            existingData = __assign(__assign({}, existingData), (_a = {}, _a[Object.keys(existingData).length + 1] = {
                ids: [data.id],
                data: data.data,
                stringToCompare: stringToCompare,
            }, _a));
        }
    }
    return existingData;
};
export var resolver = function (queryHandler, ids, resolverAccuracy, resolverAbsolute, comparer) {
    var loadErrors = {};
    var loadState = {};
    var loadPending = [];
    return new Promise(function (resolve, reject) {
        if (typeof resolverAccuracy !== "number" || resolverAccuracy < 50 || resolverAccuracy > 100) {
            reject("resolverAccuracy should be a number (percentage) between 50 and 100");
            return;
        }
        if (typeof resolverAbsolute !== 'number' || !Number.isInteger(resolverAbsolute) || resolverAbsolute > ids.length) {
            reject("resolverAbsolute should be an integer number and not exceed the length of ids");
            return;
        }
        var i = 0;
        var callBatch = function (i) { return __awaiter(void 0, void 0, void 0, function () {
            var idsToQuery, responses, totalOkResponses, j, key, nodesWithOkResponses;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        idsToQuery = ids.slice(i, i + BATCH_SIZE);
                        if (idsToQuery.length === 0) {
                            resolve({
                                loadErrors: loadErrors,
                                loadState: loadState,
                                loadPending: loadPending,
                                loadError: {
                                    error: BeesLoadError.OutOfNodes,
                                    args: {
                                        alreadyQueried: i - Object.keys(loadErrors).length,
                                        resolverAbsolute: resolverAbsolute,
                                    },
                                },
                                status: BeesLoadStatus.Failed,
                            });
                            return [2 /*return*/];
                        }
                        i += idsToQuery.length;
                        loadPending = loadPending.concat(idsToQuery);
                        return [4 /*yield*/, Promise.all(idsToQuery.map(function (id) { return queryHandler(id); }))];
                    case 1:
                        responses = _a.sent();
                        responses.forEach(function (data) {
                            var _a, _b;
                            loadPending = loadPending.filter(function (id) { return id !== data.id; });
                            if (data.type === "SUCCESS") {
                                try {
                                    loadState = indexData(data, loadState, comparer);
                                }
                                catch (err) {
                                    loadErrors = __assign(__assign({}, loadErrors), (_a = {}, _a[data.id] = {
                                        id: data.id,
                                        status: err.message ? parseInt(err.message, 10) : 400,
                                    }, _a));
                                }
                            }
                            else {
                                loadErrors = __assign(__assign({}, loadErrors), (_b = {}, _b[data.id] = {
                                    id: data.id,
                                    status: data.status,
                                }, _b));
                            }
                        });
                        totalOkResponses = Object.keys(loadState).reduce(function (total, k) {
                            return total + loadState[k].ids.length;
                        }, 0);
                        // don't ruen this into a .forEach, return are
                        // not effecive in forEach loops
                        for (j = 0; j < Object.keys(loadState).length; j += 1) {
                            key = Object.keys(loadState)[j];
                            nodesWithOkResponses = loadState[key].ids.length;
                            // at least [resolverAbsolute] responses of the same
                            // resolver must Complete or Fail
                            if (nodesWithOkResponses >= resolverAbsolute) {
                                if (resolverAccuracy / 100 >
                                    loadState[key].ids.length / totalOkResponses) {
                                    resolve({
                                        loadErrors: loadErrors,
                                        loadState: loadState,
                                        loadPending: loadPending,
                                        loadError: {
                                            error: BeesLoadError.UnaccurateState,
                                            args: {
                                                totalOkResponses: totalOkResponses,
                                                loadStates: Object.keys(loadState).map(function (k) {
                                                    return {
                                                        key: k,
                                                        okResponses: loadState[k].ids.length,
                                                        percent: Math.round((100 *
                                                            (100 * loadState[k].ids.length)) /
                                                            totalOkResponses) / 100,
                                                    };
                                                }),
                                            },
                                        },
                                        status: BeesLoadStatus.Failed,
                                    });
                                    // will stop for loop
                                    return [2 /*return*/];
                                }
                                resolve({
                                    loadErrors: loadErrors,
                                    loadState: loadState,
                                    loadPending: loadPending,
                                    status: BeesLoadStatus.Completed,
                                });
                                // will stop for loop
                                return [2 /*return*/];
                            }
                        }
                        // if no return in for loop, go
                        // on next batch
                        callBatch(i);
                        return [2 /*return*/];
                }
            });
        }); };
        callBatch(i);
    });
};
//# sourceMappingURL=index.js.map