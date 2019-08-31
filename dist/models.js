"use strict";
exports.__esModule = true;
var LoadStatus;
(function (LoadStatus) {
    LoadStatus["Loading"] = "loading";
    LoadStatus["Failed"] = "failed";
    LoadStatus["Completed"] = "completed";
})(LoadStatus = exports.LoadStatus || (exports.LoadStatus = {}));
var LoadError;
(function (LoadError) {
    // request
    LoadError["IncompleteAddress"] = "The address is incomplete";
    LoadError["ChainNotFound"] = "Blockchain not found";
    LoadError["MissingBlockchainData"] = "Missing data from the blockchain";
    LoadError["RecordNotFound"] = "Record not found";
    // not found
    LoadError["ResourceNotFound"] = "Contract not found";
    // server error
    LoadError["ServerError"] = "Server error";
    // resolver
    LoadError["InsufficientNumberOfNodes"] = "Insufficient number of nodes";
    LoadError["OutOfNodes"] = "Out of nodes";
    LoadError["UnstableState"] = "Unstable state";
    LoadError["UnaccurateState"] = "Unaccurate state";
    // parsing
    LoadError["FailedToParseResponse"] = "Failed to parse response";
    LoadError["InvalidManifest"] = "Invalid manifest";
    LoadError["InvalidSignature"] = "Invalid signature";
    LoadError["InvalidRecords"] = "Invalid records";
    LoadError["InvalidNodes"] = "Invalid nodes"; // for nodes
})(LoadError = exports.LoadError || (exports.LoadError = {}));
