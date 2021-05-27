import { resolver, ResolverOutput }  from "../index";
import { fakeQueryHandler } from "../fakeQueryHandler";
import { LoadError } from "../models";

export interface Query {
  path: string;
  parameters: { [key: string]: any };
  method: "GET" | "POST" | "PUT";
  headers: { [key: string]: any };
}

const query: Query = {
  path: "/listen-data-at-name",
  parameters: {},
  method: "POST",
  headers: {}
};

describe("resolver, 1 node", () => {
  it("should complete with one available node 100/1", done => {
    resolver(fakeQueryHandler, ["https://nodea.org"], "absolute", 100, 1)
      .last()
      .subscribe({
        next: (a: ResolverOutput) => {
          expect(a).toEqual({
            loadErrors: {},
            loadState: {
              "1": {
                nodeUrls: ["https://nodea.org"],
                data: "a",
                stringToCompare: "a"
              }
            },
            loadPending: [],
            status: "completed"
          });
          done();
        }
      });
  });

  it("should fail with one available node 100/2", done => {
    resolver(fakeQueryHandler, ["https://nodea.org"], "absolute", 100, 2)
      .last()
      .subscribe({
        next: (a: ResolverOutput) => {
          expect(a).toEqual({
            loadErrors: {},
            loadState: {},
            loadPending: [],
            loadError: {
              error: LoadError.InsufficientNumberOfNodes,
              args: {
                expected: 2,
                got: 1
              }
            },
            status: "failed"
          });
          done();
        }
      });
  });

  it("should fail OutOfNodes with unavailable node 100/1", done => {
    resolver(fakeQueryHandler, ["https://nodefail.org"], "absolute", 100, 1)
      .last()
      .subscribe({
        next: (a: ResolverOutput) => {
          expect(a.loadErrors).toEqual({
            "https://nodefail.org": {
              nodeUrl: "https://nodefail.org",
              status: 400
            }
          });
          expect(a.loadError).toEqual({
            error: LoadError.OutOfNodes,
            args: {
              alreadyQueried: 0,
              resolverAbsolute: 1
            }
          });
          expect(a.status).toBe("failed");
          done();
        }
      });
  });
});

describe("resolver, 2 nodes, 100/2", () => {
  it("should complete with two nodes A", done => {
    resolver(
      fakeQueryHandler,
      ["https://nodea1.org", "https://nodea2.org"],
      "absolute",
      100,
      2
    )
      .last()
      .subscribe({
        next: (a: ResolverOutput) => {
          expect(a).toEqual({
            loadErrors: {},
            loadState: {
              "1": {
                nodeUrls: ["https://nodea1.org", "https://nodea2.org"],
                data: "a",
                stringToCompare: "a"
              }
            },
            loadPending: [],
            status: "completed"
          });
          done();
        }
      });
  });

  it("should fail OutOfNodes with one node A and one node B", done => {
    resolver(
      fakeQueryHandler,
      ["https://nodea1.org", "https://nodeb1.org"],
      "absolute",
      100,
      2
    )
      .last()
      .subscribe({
        next: (a: ResolverOutput) => {
          expect(a.loadState).toEqual({
            "1": {
              nodeUrls: ["https://nodea1.org"],
              data: "a",
              stringToCompare: "a"
            },
            "2": {
              nodeUrls: ["https://nodeb1.org"],
              data: "b",
              stringToCompare: "b"
            }
          });
          expect(a.loadError).toEqual({
            error: LoadError.OutOfNodes,
            args: {
              resolverAbsolute: 2,
              alreadyQueried: 2
            }
          });
          expect(a.status).toBe("failed");
          done();
        }
      });
  });
});

describe("resolver, 3 nodes", () => {
  it("should complete 51/2 with two nodes A, one node B", done => {
    resolver(
      fakeQueryHandler,
      ["https://nodeb1.org", "https://nodea1.org", "https://nodea2.org"],
      "absolute",
      51,
      2
    )
      .last()
      .subscribe({
        next: (a: ResolverOutput) => {
          expect(a).toEqual({
            loadErrors: {},
            loadState: {
              "1": {
                nodeUrls: ["https://nodeb1.org"],
                data: "b",
                stringToCompare: "b"
              },
              "2": {
                nodeUrls: ["https://nodea1.org", "https://nodea2.org"],
                data: "a",
                stringToCompare: "a"
              },
            },
            loadPending: [],
            status: "completed"
          });
          done();
        }
      });
  });

  it("should fail UnaccurateState 67/2 with two nodes A, one node B", done => {
    resolver(
      fakeQueryHandler,
      ["https://nodeb1.org", "https://nodea1.org", "https://nodea2.org"],
      "absolute",
      90,
      2
    )
      .last()
      .subscribe({
        next: (a: ResolverOutput) => {
          expect(a.loadState).toEqual({
            "1": {
              nodeUrls: ["https://nodeb1.org"],
              data: "b",
              stringToCompare: "b"
            },
            "2": {
              nodeUrls: ["https://nodea1.org", "https://nodea2.org"],
              data: "a",
              stringToCompare: "a"
            },
          });
          expect(a.loadError).toEqual({
            error: LoadError.UnaccurateState,
            args: {
              totalOkResponses: 3,
              loadStates: [
                {
                  key: "1",
                  okResponses: 1,
                  percent: 33.33
                },
                {
                  key: "2",
                  okResponses: 2,
                  percent: 66.67
                },
              ]
            }
          });
          expect(a.status).toBe("failed");
          done();
        }
      });
  });

  it("should fail UnstableState 67/2 with one nodes A, one node B and one node C", done => {
    resolver(
      fakeQueryHandler,
      ["https://nodea1.org", "https://nodeb1.org", "https://nodec1.org"],
      "absolute",
      90,
      2
    )
      .last()
      .subscribe({
        next: (a: ResolverOutput) => {
          expect(a.loadState).toEqual({
            "1": {
              nodeUrls: ["https://nodea1.org"],
              data: "a",
              stringToCompare: "a"
            },
            "2": {
              nodeUrls: ["https://nodeb1.org"],
              data: "b",
              stringToCompare: "b"
            },
            "3": {
              nodeUrls: ["https://nodec1.org"],
              data: "c",
              stringToCompare: "c"
            }
          });
          expect(a.loadError).toEqual({
            error: LoadError.UnstableState,
            args: {
              numberOfLoadStates: 3
            }
          });
          expect(a.status).toBe("failed");
          done();
        }
      });
  });
});

describe("resolver, 5 nodes", () => {
  it("should fail ServerError 100/5 with five first nodes that fail", done => {
    resolver(
      fakeQueryHandler,
      [
        "https://nodefail1.org",
        "https://nodefail2.org",
        "https://nodefail3.org",
        "https://nodefail4.org",
        "https://nodefail5.org"
      ],
      "absolute",
      100,
      5
    )
      .last()
      .subscribe({
        next: (a: ResolverOutput) => {
          expect(a.loadError).toEqual({
            error: LoadError.ServerError,
            args: {
              numberOfLoadErrors: 5
            }
          });
          expect(a.status).toBe("failed");
          done();
        }
      });
  });
});

describe.only("resolver, 10 nodes", () => {
  it("should fail 91/10 with 9 nodes A, 1 node B", done => {
    resolver(
      fakeQueryHandler,
      [
        "https://nodea1.org", 
        "https://nodeb1.org",
        "https://nodea2.org",
        "https://nodefail1.org",
        "https://nodea3.org",
        "https://nodea4.org",
        "https://nodea5.org",
        "https://nodea6.org",
        "https://nodea7.org",
        "https://nodea8.org",
        "https://nodea9.org",
    ],
      "absolute",
      91,
      10
    )
      .last()
      .subscribe({
        next: (a: ResolverOutput) => {
          expect(a.loadState).toEqual({
              "1": {
                nodeUrls: [
                  "https://nodea1.org", 
                  "https://nodea2.org",
                  "https://nodea3.org",
                  "https://nodea4.org",
                  "https://nodea5.org",
                  "https://nodea6.org",
                  "https://nodea7.org",
                  "https://nodea8.org",
                  "https://nodea9.org",
                ],
                data: "a",
                stringToCompare: "a"
              },
              "2": {
                nodeUrls: ["https://nodeb1.org"],
                data: "b",
                stringToCompare: "b"
              },
          });

          expect(a.loadError).toEqual({
            error: LoadError.OutOfNodes,
            args: {
              alreadyQueried: 10,
              resolverAbsolute: 10,
            }
          });

          done();
        }
      });
  });
});