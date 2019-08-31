import { Stream } from "xstream";
import { ResolverMode, LoadStatus, LoadErrors, LoadCompleted, LoadErrorWithArgs } from "./models";
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
export declare const resolve: (query: Query, nodeUrls: string[], resolverMode: ResolverMode, resolverAccuracy: number, resolverAbsolute: number, comparer?: (x: string) => any) => Stream<ResolverOutput>;
