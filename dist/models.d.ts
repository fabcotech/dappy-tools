export declare type Resolver = "auto" | "custom";
export declare type ResolverMode = "percent" | "absolute";
export declare enum LoadStatus {
    Loading = "loading",
    Failed = "failed",
    Completed = "completed"
}
export interface LoadData {
    type: "SUCCESS" | "ERROR";
    status?: number;
    data?: string;
    stringToCompare?: string | undefined;
    nodeUrl: string;
}
export interface LoadCompleted {
    [id: string]: {
        nodeUrls: string[];
        data: string;
        stringToCompare: string | undefined;
    };
}
export interface LoadErrors {
    [nodeUrl: string]: {
        nodeUrl: string;
        status?: number;
    };
}
export declare enum LoadError {
    IncompleteAddress = "The address is incomplete",
    ChainNotFound = "Blockchain not found",
    MissingBlockchainData = "Missing data from the blockchain",
    RecordNotFound = "Record not found",
    ResourceNotFound = "Contract not found",
    ServerError = "Server error",
    InsufficientNumberOfNodes = "Insufficient number of nodes",
    OutOfNodes = "Out of nodes",
    UnstableState = "Unstable state",
    UnaccurateState = "Unaccurate state",
    FailedToParseResponse = "Failed to parse response",
    InvalidManifest = "Invalid manifest",
    InvalidSignature = "Invalid signature",
    InvalidRecords = "Invalid records",
    InvalidNodes = "Invalid nodes"
}
export interface LoadErrorWithArgs {
    error: LoadError;
    args: {
        [key: string]: any;
    };
}
