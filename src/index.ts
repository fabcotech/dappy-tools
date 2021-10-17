import xs, { Stream } from "xstream";

export type BeesResolver = "auto" | "custom";
export type BeesResolverMode = "percent" | "absolute";

export enum BeesLoadStatus {
  Loading = "loading",
  Failed = "failed",
  Completed = "completed",
}

export interface BeesLoadData {
  type: "SUCCESS" | "ERROR";
  status?: number;
  data?: string;
  stringToCompare?: string | undefined;
  nodeUrl: string;
}

export interface BeesLoadCompleted {
  [id: string]: {
    nodeUrls: string[];
    data: string;
    stringToCompare: string | undefined;
  };
}

export interface BeesLoadErrors {
  [nodeUrl: string]: {
    nodeUrl: string;
    status?: number;
  };
}

export enum BeesLoadError {
  // request
  IncompleteAddress = "The address is incomplete",
  ChainNotFound = "Blockchain not found",
  MissingBlockchainData = "Missing data from the blockchain",
  RecordNotFound = "Record not found",

  // not found
  ResourceNotFound = "Contract not found",

  // server error
  ServerError = "Server error",

  // resolver
  InsufficientNumberOfNodes = "Insufficient number of nodes",
  OutOfNodes = "Out of nodes",
  UnstableState = "Unstable state",
  UnaccurateState = "Unaccurate state",

  // parsing
  FailedToParseResponse = "Failed to parse response",
  InvalidManifest = "Invalid manifest", // for dappy manifests
  InvalidSignature = "Invalid signature",
  InvalidRecords = "Invalid records", // for records
  InvalidNodes = "Invalid nodes", // for nodes
  InvalidServers = "Invalid servers", // for nodes

  PostParseError = "Parse error after multicall", // for nodes
  UnknownCriticalError = "Unknown critical error", // for nodes
}

export interface BeesLoadErrorWithArgs {
  error: BeesLoadError;
  args: { [key: string]: any };
}

export interface ResolverOutput {
  loadState: BeesLoadCompleted;
  loadErrors: BeesLoadErrors;
  loadPending: string[];
  loadError?: BeesLoadErrorWithArgs;
  status: BeesLoadStatus;
}

const indexData = (
  data: BeesLoadData,
  existingData: BeesLoadCompleted,
  comparer?: (x: string | undefined) => any
): BeesLoadCompleted => {
  let found = false;
  let stringToCompare = data.data;

  if (typeof comparer === "function") {
    try {
      stringToCompare = comparer(data.data);
    } catch (err) {
      throw err;
    }
  }

  Object.keys(existingData).forEach((key) => {
    if (stringToCompare === existingData[key].stringToCompare) {
      found = true;
      existingData = {
        ...existingData,
        [key]: {
          ...existingData[key],
          nodeUrls: existingData[key].nodeUrls.concat(data.nodeUrl),
        },
      };
    }
  });

  if (!found) {
    existingData = {
      ...existingData,
      [Object.keys(existingData).length + 1]: {
        nodeUrls: [data.nodeUrl],
        data: data.data,
        stringToCompare: stringToCompare,
      },
    };
  }

  if (!Object.keys(existingData).length) {
    existingData = {
      "1": {
        nodeUrls: [data.nodeUrl],
        data: data.data || "",
        stringToCompare: stringToCompare,
      },
    };
  }

  return existingData;
};

const createStream = (
  queryHandler: (urlToQuery: string) => Promise<BeesLoadData>,
  urlsToQuery: string[]
): Stream<BeesLoadData> => {
  const streams = urlsToQuery.map((urlToQuery) =>
    xs.fromPromise(queryHandler(urlToQuery))
  );

  return xs.merge(...streams);
};

export const resolver = (
  queryHandler: (urlToQuery: string) => Promise<BeesLoadData>,
  nodeUrls: string[],
  resolverMode: BeesResolverMode,
  resolverAccuracy: number,
  resolverAbsolute: number,
  comparer?: (x: string | undefined) => any
): Stream<ResolverOutput> => {
  let loadErrors: BeesLoadErrors = {};
  let loadState: BeesLoadCompleted = {};
  let loadPending: string[] = [];

  return xs.create({
    start: (listener) => {
      listener.next({
        loadErrors: loadErrors,
        loadState: loadState,
        loadPending: loadPending,
        status: BeesLoadStatus.Loading,
      });
      if (resolverMode === "absolute") {
        if (resolverAbsolute > nodeUrls.length) {
          listener.next({
            loadErrors: loadErrors,
            loadState: loadState,
            loadPending: loadPending,
            loadError: {
              error: BeesLoadError.InsufficientNumberOfNodes,
              args: {
                expected: resolverAbsolute,
                got: nodeUrls.length,
              },
            },
            status: BeesLoadStatus.Failed,
          });
          listener.complete();
          return;
        }

        let i = 0;

        const callBatch = (i: number) => {
          const urlsToQuery = nodeUrls.slice(i, i + resolverAbsolute);
          if (urlsToQuery.length === 0) {
            listener.next({
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
            listener.complete();
            return;
          }
          i += urlsToQuery.length;

          loadPending = loadPending.concat(urlsToQuery);
          listener.next({
            loadErrors: loadErrors,
            loadState: loadState,
            loadPending: loadPending,
            status: BeesLoadStatus.Loading,
          });

          const stream: Stream<BeesLoadData> = createStream(
            queryHandler,
            urlsToQuery
          );
          stream.take(urlsToQuery.length).subscribe({
            next: (data: BeesLoadData) => {
              loadPending = loadPending.filter((url) => url !== data.nodeUrl);

              if (data.type === "SUCCESS") {
                try {
                  const newLoadState = indexData(data, loadState, comparer);
                  loadState = newLoadState;
                } catch (err) {
                  loadErrors = {
                    ...loadErrors,
                    [data.nodeUrl]: {
                      nodeUrl: data.nodeUrl,
                      status: err.message ? parseInt(err.message, 10) : 400,
                    },
                  };
                }
              } else {
                loadErrors = {
                  ...loadErrors,
                  [data.nodeUrl]: {
                    nodeUrl: data.nodeUrl,
                    status: data.status,
                  },
                };
              }
              listener.next({
                loadErrors: loadErrors,
                loadState: loadState,
                loadPending: loadPending,
                status: BeesLoadStatus.Loading,
              });
            },
            error: (e) => {
              console.error(e);
              listener.error("UnknownError");
            },
            complete: () => {
              // 5 or more load errors
              if (Object.keys(loadErrors).length > 4) {
                listener.next({
                  loadErrors: loadErrors,
                  loadState: loadState,
                  loadPending: loadPending,
                  loadError: {
                    error: BeesLoadError.ServerError,
                    args: {
                      numberOfLoadErrors: Object.keys(loadErrors).length,
                    },
                  },
                  status: BeesLoadStatus.Failed,
                });
                listener.complete();
                return;

                // 3 or more different groups
              } else if (Object.keys(loadState).length > 2) {
                listener.next({
                  loadErrors: loadErrors,
                  loadState: loadState,
                  loadPending: loadPending,
                  loadError: {
                    error: BeesLoadError.UnstableState,
                    args: {
                      numberOfLoadStates: Object.keys(loadState).length,
                    },
                  },
                  status: BeesLoadStatus.Failed,
                });
                listener.complete();
                return;
              } else {
                const totalOkResponses = Object.keys(loadState).reduce(
                  (total, k) => {
                    return total + loadState[k].nodeUrls.length;
                  },
                  0
                );

                for (let i = 0; i < Object.keys(loadState).length; i += 1) {
                  const key = Object.keys(loadState)[i];

                  const nodesWithOkResponses = loadState[key].nodeUrls.length;

                  // at least [resolverAbsolute] responses of the same
                  // resolver must Complete or Fail
                  if (nodesWithOkResponses >= resolverAbsolute) {
                    if (
                      resolverAccuracy / 100 >
                      loadState[key].nodeUrls.length / totalOkResponses
                    ) {
                      listener.next({
                        loadErrors: loadErrors,
                        loadState: loadState,
                        loadPending: loadPending,
                        loadError: {
                          error: BeesLoadError.UnaccurateState,
                          args: {
                            totalOkResponses: totalOkResponses,
                            loadStates: Object.keys(loadState).map((k) => {
                              return {
                                key: k,
                                okResponses: loadState[k].nodeUrls.length,
                                percent:
                                  Math.round(
                                    (100 *
                                      (100 * loadState[k].nodeUrls.length)) /
                                      totalOkResponses
                                  ) / 100,
                              };
                            }),
                          },
                        },
                        status: BeesLoadStatus.Failed,
                      });
                      listener.complete();
                      return;
                    }

                    listener.next({
                      loadErrors: loadErrors,
                      loadState: loadState,
                      loadPending: loadPending,
                      status: BeesLoadStatus.Completed,
                    });
                    listener.complete();
                    return;
                  }
                }
              }

              callBatch(i);
            },
          });
        };

        callBatch(i);
      }
    },
    stop: () => {},
  });
};
