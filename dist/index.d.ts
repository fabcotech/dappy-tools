import { Stream } from "xstream";
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
    InvalidNodes = "Invalid nodes",
    UnknownError = "Unknown error"
}
export interface LoadErrorWithArgs {
    error: LoadError;
    args: {
        [key: string]: any;
    };
}
export interface ResolverOutput {
    loadState: LoadCompleted;
    loadErrors: LoadErrors;
    loadPending: string[];
    loadError?: LoadErrorWithArgs;
    status: LoadStatus;
}
export interface Query {
    path: string;
    parameters: {
        [key: string]: any;
    };
    method: "GET" | "POST" | "PUT";
    headers: {
        [key: string]: any;
    };
}
declare const _default: (queryHandler: (urlToQuery: string) => Promise<LoadData>, nodeUrls: string[], resolverMode: ResolverMode, resolverAccuracy: number, resolverAbsolute: number, comparer?: (x: string) => any) => Stream<ResolverOutput>;
export default _default;
