import xs, { Stream } from "xstream";

export type Resolver = "auto" | "custom";
export type ResolverMode = "percent" | "absolute";

export enum LoadStatus {
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

export enum LoadError {
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

  // unknown
  UnknownError = "Unknown error"
}

export interface LoadErrorWithArgs {
  error: LoadError;
  args: { [key: string]: any };
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
  parameters: { [key: string]: any };
  method: "GET" | "POST" | "PUT";
  headers: { [key: string]: any };
}

const indexData = (
  data: LoadData,
  existingData: LoadCompleted,
  comparer?: (x: string | undefined) => any
): LoadCompleted => {
  let found = false;
  let stringToCompare = data.data;

  if (typeof comparer === "function") {
    try {
      stringToCompare = comparer(data.data);
    } catch (err) {
      throw err;
    }
  }

  Object.keys(existingData).forEach(key => {
    if (stringToCompare === existingData[key].stringToCompare) {
      found = true;
      existingData = {
        ...existingData,
        [key]: {
          ...existingData[key],
          nodeUrls: existingData[key].nodeUrls.concat(data.nodeUrl)
        }
      };
    }
  });

  if (!found) {
    existingData = {
      ...existingData,
      [Object.keys(existingData).length + 1]: {
        nodeUrls: [data.nodeUrl],
        data: data.data,
        stringToCompare: stringToCompare
      }
    };
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

const createStream = (
  queryHandler: (urlToQuery: string) => Promise<LoadData>,
  urlsToQuery: string[]
): Stream<LoadData> => {
  const streams = urlsToQuery.map(urlToQuery =>
    xs.fromPromise(queryHandler(urlToQuery))
  );

  return xs.merge(...streams);
};

export default (
  queryHandler: (urlToQuery: string) => Promise<LoadData>,
  nodeUrls: string[],
  resolverMode: ResolverMode,
  resolverAccuracy: number,
  resolverAbsolute: number,
  comparer?: (x: string | undefined) => any
): Stream<ResolverOutput> => {
  let loadErrors: LoadErrors = {};
  let loadState: LoadCompleted = {};
  let loadPending: string[] = [];

  return xs.create({
    start: listener => {
      listener.next({
        loadErrors: loadErrors,
        loadState: loadState,
        loadPending: loadPending,
        status: LoadStatus.Loading
      });
      if (resolverMode === "absolute") {
        if (resolverAbsolute > nodeUrls.length) {
          listener.next({
            loadErrors: loadErrors,
            loadState: loadState,
            loadPending: loadPending,
            loadError: {
              error: LoadError.InsufficientNumberOfNodes,
              args: {
                expected: resolverAbsolute,
                got: nodeUrls.length
              }
            },
            status: LoadStatus.Failed
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
                error: LoadError.OutOfNodes,
                args: {
                  alreadyQueried: i - Object.keys(loadErrors).length,
                  resolverAbsolute: resolverAbsolute
                }
              },
              status: LoadStatus.Failed
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
            status: LoadStatus.Loading
          });

          const stream: Stream<LoadData> = createStream(
            queryHandler,
            urlsToQuery
          );
          stream.take(urlsToQuery.length).subscribe({
            next: (data: LoadData) => {
              loadPending = loadPending.filter(url => url !== data.nodeUrl);

              if (data.type === "SUCCESS") {
                try {
                  const newLoadState = indexData(data, loadState, comparer);
                  loadState = newLoadState;
                } catch (err) {
                  loadErrors = {
                    ...loadErrors,
                    [data.nodeUrl]: {
                      nodeUrl: data.nodeUrl,
                      status: err.message ? parseInt(err.message, 10) : 400
                    }
                  };
                }
              } else {
                loadErrors = {
                  ...loadErrors,
                  [data.nodeUrl]: {
                    nodeUrl: data.nodeUrl,
                    status: data.status
                  }
                };
              }
              listener.next({
                loadErrors: loadErrors,
                loadState: loadState,
                loadPending: loadPending,
                status: LoadStatus.Loading
              });
            },
            error: e => {
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
                    error: LoadError.ServerError,
                    args: {
                      numberOfLoadErrors: Object.keys(loadErrors).length
                    }
                  },
                  status: LoadStatus.Failed
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
                    error: LoadError.UnstableState,
                    args: {
                      numberOfLoadStates: Object.keys(loadState).length
                    }
                  },
                  status: LoadStatus.Failed
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
                          error: LoadError.UnaccurateState,
                          args: {
                            totalOkResponses: totalOkResponses,
                            loadStates: Object.keys(loadState).map(k => {
                              return {
                                key: k,
                                okResponses: loadState[k].nodeUrls.length,
                                percent:
                                  Math.round(
                                    (100 *
                                      (100 * loadState[k].nodeUrls.length)) /
                                      totalOkResponses
                                  ) / 100
                              };
                            })
                          }
                        },
                        status: LoadStatus.Failed
                      });
                      listener.complete();
                      return;
                    }

                    listener.next({
                      loadErrors: loadErrors,
                      loadState: loadState,
                      loadPending: loadPending,
                      status: LoadStatus.Completed
                    });
                    listener.complete();
                    return;
                  }
                }
              }

              callBatch(i);
            }
          });
        };

        callBatch(i);
      }
    },
    stop: () => {}
  });
};
