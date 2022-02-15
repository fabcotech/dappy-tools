export declare type BeesResolverMode = "percent" | "absolute";
export declare enum BeesLoadStatus {
    Loading = "loading",
    Failed = "failed",
    Completed = "completed"
}
export interface BeesLoadData {
    type: "SUCCESS" | "ERROR";
    status?: number;
    data?: string;
    stringToCompare?: string | undefined;
    id: string;
}
export interface BeesLoadCompleted {
    [id: string]: {
        ids: string[];
        data: string;
        stringToCompare: string | undefined;
    };
}
export interface BeesLoadErrors {
    [id: string]: {
        id: string;
        status?: number;
    };
}
export declare enum BeesLoadError {
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
    InvalidServers = "Invalid servers",
    PostParseError = "Parse error after multicall",
    UnknownCriticalError = "Unknown critical error"
}
export interface BeesLoadErrorWithArgs {
    error: BeesLoadError;
    args: {
        [key: string]: any;
    };
}
export interface ResolverOutput {
    loadState: BeesLoadCompleted;
    loadErrors: BeesLoadErrors;
    loadPending: string[];
    loadError?: BeesLoadErrorWithArgs;
    status: BeesLoadStatus;
}
export declare const resolver: (queryHandler: (urlToQuery: string) => Promise<BeesLoadData>, ids: string[], resolverMode: BeesResolverMode, resolverAccuracy: number, resolverAbsolute: number, comparer?: ((x: string | undefined) => any) | undefined) => Promise<ResolverOutput>;
