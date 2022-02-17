
const BATCH_SIZE = 2;

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

export enum BeesLoadError {
  InsufficientNumberOfNodes = "Insufficient number of nodes",
  OutOfNodes = "Out of nodes",
  UnstableState = "Unstable state",
  UnaccurateState = "Unaccurate state",
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

  // initialize existingData
  if (Object.keys(existingData).length === 0) {
    existingData = {
      "1": {
        ids: [data.id],
        data: data.data || "",
        stringToCompare: stringToCompare,
      },
    };
  } else {
    Object.keys(existingData).forEach((key) => {
      if (stringToCompare === existingData[key].stringToCompare) {
        found = true;
        existingData = {
          ...existingData,
          [key]: {
            ...existingData[key],
            ids: existingData[key].ids.concat(data.id),
          },
        };
      }
    });
  
    if (!found) {
      existingData = {
        ...existingData,
        [Object.keys(existingData).length + 1]: {
          ids: [data.id],
          data: data.data,
          stringToCompare: stringToCompare,
        },
      };
    }
  }

  return existingData;
};

export const resolver = (
  queryHandler: (urlToQuery: string) => Promise<BeesLoadData>,
  ids: string[],
  resolverAccuracy: number,
  resolverAbsolute: number,
  comparer?: (x: string | undefined) => any
): Promise<ResolverOutput> => {
  let loadErrors: BeesLoadErrors = {};
  let loadState: BeesLoadCompleted = {};
  let loadPending: string[] = [];

  return new Promise((resolve, reject) => {
    if (resolverAbsolute > ids.length) {
      resolve({
        loadErrors: loadErrors,
        loadState: loadState,
        loadPending: loadPending,
        loadError: {
          error: BeesLoadError.InsufficientNumberOfNodes,
          args: {
            expected: resolverAbsolute,
            got: ids.length,
          },
        },
        status: BeesLoadStatus.Failed,
      });
      return;
    }

    let i = 0;

    const callBatch = async (i: number) => {
      console.log('callBatch', i);
      // idsToQuery is of same size as resolverAbsolute
      // but you can change this to do 3 by 3 or 4 by 4 etc.
      const idsToQuery = ids.slice(i, i + BATCH_SIZE);

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
        return;
      }

      i += idsToQuery.length;

      loadPending = loadPending.concat(idsToQuery);

      const responses = await Promise.all(idsToQuery.map(id => queryHandler(id)));

      responses.forEach((data: BeesLoadData) => {
        loadPending = loadPending.filter((id) => id !== data.id);

        if (data.type === "SUCCESS") {
          try {
            loadState = indexData(data, loadState, comparer);
          } catch (err) {
            loadErrors = {
              ...loadErrors,
              [data.id]: {
                id: data.id,
                status: (err as any).message ? parseInt((err as any).message, 10) : 400,
              },
            };
          }
        } else {
          loadErrors = {
            ...loadErrors,
            [data.id]: {
              id: data.id,
              status: data.status,
            },
          };
        }

      });

      if (Object.keys(loadState).length > 2) {
        resolve({
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
        return;
      } else {
        const totalOkResponses = Object.keys(loadState).reduce(
          (total, k) => {
            return total + loadState[k].ids.length;
          },
          0
        );

        // don't ruen this into a .forEach, return are
        // not effecive in forEach loops
        for (let j = 0; j < Object.keys(loadState).length; j += 1) {
          const key = Object.keys(loadState)[j];

          const nodesWithOkResponses = loadState[key].ids.length;

          // at least [resolverAbsolute] responses of the same
          // resolver must Complete or Fail
          if (nodesWithOkResponses >= resolverAbsolute) {
            if (
              resolverAccuracy / 100 >
              loadState[key].ids.length / totalOkResponses
            ) {
              resolve({
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
                        okResponses: loadState[k].ids.length,
                        percent:
                          Math.round(
                            (100 *
                              (100 * loadState[k].ids.length)) /
                              totalOkResponses
                          ) / 100,
                      };
                    }),
                  },
                },
                status: BeesLoadStatus.Failed,
              });
              // will stop for loop
              return;
            }

            resolve({
              loadErrors: loadErrors,
              loadState: loadState,
              loadPending: loadPending,
              status: BeesLoadStatus.Completed,
            });
            // will stop for loop
            return;
          }
        }
      }

      // if no return in for loop, go
      // on next batch
      callBatch(i);
    };

    callBatch(i);
  });
};
