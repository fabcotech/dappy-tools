import { resolver, ResolverOutput, BeesLoadError }  from "../index";
import { fakeQueryHandler } from "../fakeQueryHandler";

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
    resolver(fakeQueryHandler, ["https://nodea.org"], 100, 1)
      .then((a: ResolverOutput) => {
        expect(a).toEqual({
          loadErrors: {},
          loadState: {
            "1": {
              ids: ["https://nodea.org"],
              data: "a",
              stringToCompare: "a"
            }
          },
          loadPending: [],
          status: "completed"
        });
        done();
      });
  });

  it("should fail with one available node 100/2", done => {
    resolver(fakeQueryHandler, ["https://nodea.org"], 100, 2)
      .then((a: ResolverOutput) => {
        expect(a).toEqual({
          loadErrors: {},
          loadState: {},
          loadPending: [],
          loadError: {
            error: BeesLoadError.InsufficientNumberOfNodes,
            args: {
              expected: 2,
              got: 1
            }
          },
          status: "failed"
        });
        done();
      });
  });

  it("should fail OutOfNodes with unavailable node 100/1", done => {
    resolver(fakeQueryHandler, ["https://nodefail.org"], 100, 1)
    .then((a: ResolverOutput) => {
        expect(a.loadErrors).toEqual({
          "https://nodefail.org": {
            id: "https://nodefail.org",
            status: 400
          }
        });
        expect(a.loadError).toEqual({
          error: BeesLoadError.OutOfNodes,
          args: {
            alreadyQueried: 0,
            resolverAbsolute: 1
          }
        });
        expect(a.status).toBe("failed");
        done();
      
    });
  });
});

describe("resolver, 2 nodes, 100/2", () => {
  it("should complete with two nodes A", done => {
    resolver(
      fakeQueryHandler,
      ["https://nodea1.org", "https://nodea2.org"],
      100,
      2
    )
    .then((a: ResolverOutput) => {
      expect(a).toEqual({
        loadErrors: {},
        loadState: {
          "1": {
            ids: ["https://nodea1.org", "https://nodea2.org"],
            data: "a",
            stringToCompare: "a"
          }
        },
        loadPending: [],
        status: "completed"
      });
      done();
    });
  });

  it("should fail OutOfNodes with one node A and one node B", done => {
    resolver(
      fakeQueryHandler,
      ["https://nodea1.org", "https://nodeb1.org"],
      100,
      2
    )
    .then((a: ResolverOutput) => {
      expect(a.loadState).toEqual({
        "1": {
          ids: ["https://nodea1.org"],
          data: "a",
          stringToCompare: "a"
        },
        "2": {
          ids: ["https://nodeb1.org"],
          data: "b",
          stringToCompare: "b"
        }
      });
      expect(a.loadError).toEqual({
        error: BeesLoadError.OutOfNodes,
        args: {
          resolverAbsolute: 2,
          alreadyQueried: 2
        }
      });
      expect(a.status).toBe("failed");
      done();
    });
  });
});

describe("resolver, 3 nodes", () => {
  it("should complete 51/2 with two nodes A, one node B", done => {
    resolver(
      fakeQueryHandler,
      ["https://nodeb1.org", "https://nodea1.org", "https://nodea2.org"],
      51,
      2
    )
    .then((a: ResolverOutput) => {
      expect(a).toEqual({
        loadErrors: {},
        loadState: {
          "1": {
            ids: ["https://nodeb1.org"],
            data: "b",
            stringToCompare: "b"
          },
          "2": {
            ids: ["https://nodea1.org", "https://nodea2.org"],
            data: "a",
            stringToCompare: "a"
          },
        },
        loadPending: [],
        status: "completed"
      });
      done();
    });
  });

  it("should fail UnaccurateState 67/2 with two nodes A, one node B", done => {
    resolver(
      fakeQueryHandler,
      ["https://nodeb1.org", "https://nodea1.org", "https://nodea2.org"],
      90,
      2
    )
    .then((a: ResolverOutput) => {
      expect(a.loadState).toEqual({
        "1": {
          ids: ["https://nodeb1.org"],
          data: "b",
          stringToCompare: "b"
        },
        "2": {
          ids: ["https://nodea1.org", "https://nodea2.org"],
          data: "a",
          stringToCompare: "a"
        },
      });
      expect(a.loadError).toEqual({
        error: BeesLoadError.UnaccurateState,
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
    });
  });

  it("should fail UnstableState 67/2 with one nodes A, one node B and one node C", done => {
    resolver(
      fakeQueryHandler,
      ["https://nodea1.org", "https://nodeb1.org", "https://nodec1.org"],
      90,
      2
    )
    .then((a: ResolverOutput) => {
      expect(a.loadState).toEqual({
        "1": {
          ids: ["https://nodea1.org"],
          data: "a",
          stringToCompare: "a"
        },
        "2": {
          ids: ["https://nodeb1.org"],
          data: "b",
          stringToCompare: "b"
        },
        "3": {
          ids: ["https://nodec1.org"],
          data: "c",
          stringToCompare: "c"
        }
      });
      expect(a.loadError).toEqual({
        error: BeesLoadError.UnstableState,
        args: {
          numberOfLoadStates: 3
        }
      });
      expect(a.status).toBe("failed");
      done();
    });
  });

  it("should succeed with 100/2 with two nodes A, one node failing", done => {
    resolver(
      fakeQueryHandler,
      ["https://nodea1.org", "https://nodea2.org", "https://nodefail.org"],
      100,
      2
    )
    .then((a: ResolverOutput) => {
      expect(a.status).toBe("completed");
      console.log(a.loadErrors);
      expect(a.loadState).toEqual({
        "1": {
          ids: ["https://nodea1.org", "https://nodea2.org"],
          data: "a",
          stringToCompare: "a"
        }
      });
      done();
    });
  });
});

describe("resolver, 10 nodes", () => {
  it("should fail 91/10 with 9 nodes A, 1 node B, 1 node fails", done => {
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
    91,
    10
    )
    .then((a: ResolverOutput) => {
      expect(a.loadState).toEqual({
        "1": {
          ids: [
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
          ids: ["https://nodeb1.org"],
          data: "b",
          stringToCompare: "b"
        },
      });

      expect(a.loadError).toEqual({
        error: BeesLoadError.OutOfNodes,
        args: {
          alreadyQueried: 10,
          resolverAbsolute: 10,
        }
      });

      done();
    });
  });
  it("should succeed 91/10 with 10 nodes A, 2 nodes fail", done => {
    const nodes = [
      "https://nodea1.org", 
      "https://nodea2.org",
      "https://nodefail1.org",
      "https://nodefail2.org",
      "https://nodea3.org",
      "https://nodea4.org",
      "https://nodea5.org",
      "https://nodea6.org",
      "https://nodea7.org",
      "https://nodea8.org",
      "https://nodea9.org",
      "https://nodea10.org",
    ]
    resolver(
      fakeQueryHandler,
      nodes,
      91,
      10
    )
    .then((a: ResolverOutput) => {
      expect(a.status).toEqual("completed");
      expect(a.loadState).toEqual({
        "1": {
          ids: nodes.filter(a => a.includes("nodea")),
          data: "a",
          stringToCompare: "a"
        }
      });

      done();
    });
  });
});