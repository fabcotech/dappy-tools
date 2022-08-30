import chai, { expect } from 'chai';
import spies from 'chai-spies';

import { resolver, BeesLoadError }  from "../index";
import { fakeQueryHandler } from "../fakeQueryHandler";

export interface Query {
  path: string;
  parameters: { [key: string]: any };
  method: "GET" | "POST" | "PUT";
  headers: { [key: string]: any };
}

chai.use(spies);

const stringify = JSON.stringify

describe("resolver, 1 node", () => {
  it("should fail with invalid resolverAccuracy", async () => {
    try {
      await resolver(
        fakeQueryHandler, ["https://nodea.org"], 30, 1
      )
    } catch (err) {
      expect(err).equal("resolverAccuracy should be a number (percentage) between 50 and 100")
    }    
  });

  it("should fail with invalid resolverAbsolute", async () => {
    try {
      await resolver(fakeQueryHandler, ["https://nodea.org"], 100, 2)
    } catch (err) {
      expect(err).equal("resolverAbsolute should be an integer number and not exceed the length of ids");
    }
  });

  it("should complete with one available node 100/1", async () => {

    const a = await resolver(fakeQueryHandler, ["https://nodea.org"], 100, 1)
    console.log(a)
    expect(stringify(a)).equal(stringify({
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
    }))
  });

  it("should fail OutOfNodes with unavailable node 100/1", async () => {
    const a = await resolver(fakeQueryHandler, ["https://nodefail.org"], 100, 1);
    expect(stringify(a.loadErrors)).equal(stringify({
      "https://nodefail.org": {
        id: "https://nodefail.org",
        status: 400
      }
    }))
    expect(stringify(a.loadError)).equal(stringify({
      error: BeesLoadError.OutOfNodes,
      args: {
        alreadyQueried: 0,
        resolverAbsolute: 1
      }
    }));
    expect(a.status).equal("failed");
  });
});

describe("resolver, 2 nodes, 100/2", () => {
  it("should complete with two nodes A", async () => {
    const a = await resolver(
      fakeQueryHandler,
      ["https://nodea1.org", "https://nodea2.org"],
      100,
      2
    )
    expect(stringify(a)).equal(stringify({
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
    }));
  });

  it("should fail OutOfNodes with one node A and one node B", async () => {
    const a = await resolver(
      fakeQueryHandler,
      ["https://nodea1.org", "https://nodeb1.org"],
      100,
      2
    );
    expect(stringify(a.loadState)).equal(stringify({
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
    }));
    expect(stringify(a.loadError)).equal(stringify({
      error: BeesLoadError.OutOfNodes,
      args: {
        alreadyQueried: 2,
        resolverAbsolute: 2,
      }
    }));
    expect(a.status).equal("failed");

  });
});

describe("resolver, 3 nodes", () => {
  it("should complete 51/2 with two nodes A, one node B", async () => {
    const a = await resolver(
      fakeQueryHandler,
      ["https://nodeb1.org", "https://nodea1.org", "https://nodea2.org"],
      51,
      2
    );
    expect(stringify(a)).equal(stringify({
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
    }));
  });

  it("should fail UnaccurateState 67/2 with two nodes A, one node B", async () => {
    const a = await resolver(
      fakeQueryHandler,
      ["https://nodeb1.org", "https://nodea1.org", "https://nodea2.org"],
      90,
      2
    );
    expect(stringify(a.loadState)).equal(stringify({
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
    }));
    expect(stringify(a.loadError)).equal(stringify({
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
    }));
    expect(a.status).equal("failed");
  });

  it("should succeed with 100/2 with two nodes A, one node failing", async () => {
    const a = await resolver(
      fakeQueryHandler,
      ["https://nodea1.org", "https://nodea2.org", "https://nodefail.org"],
      100,
      2
    )
    expect(a.status).equal("completed");
    expect(stringify(a.loadState)).equal(stringify({
      "1": {
        ids: ["https://nodea1.org", "https://nodea2.org"],
        data: "a",
        stringToCompare: "a"
      }
    }));
  });
});

describe("resolver, 10 nodes", () => {
  it("should fail 91/10 with 9 nodes A, 1 node B, 1 node fails", async () => {
    const a = await resolver(
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

    expect(stringify(a.loadState)).equal(stringify({
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
    }));

    expect(stringify(a.loadError)).equal(stringify({
      error: BeesLoadError.OutOfNodes,
      args: {
        alreadyQueried: 10,
        resolverAbsolute: 10,
      }
    }));
  });
  it("should succeed 91/10 with 10 nodes A, 2 nodes fail", async () => {
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
    const a = await resolver(
      fakeQueryHandler,
      nodes,
      91,
      10
    )
    expect(a.status).equal("completed");
    expect(stringify(a.loadState)).equal(stringify({
      "1": {
        ids: nodes.filter(a => a.includes("nodea")),
        data: "a",
        stringToCompare: "a"
      }
    }));
  });
});