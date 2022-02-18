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
    OutOfNodes = "Out of nodes",
    UnaccurateState = "Unaccurate state"
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
export declare const resolver: (queryHandler: (urlToQuery: string) => Promise<BeesLoadData>, ids: string[], resolverAccuracy: number, resolverAbsolute: number, comparer?: ((x: string | undefined) => any) | undefined) => Promise<ResolverOutput>;
