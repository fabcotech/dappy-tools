import { DappyNetworkMember } from "@fabcotech/dappy-model";
import { expect } from "chai";

import { gossip } from "./index";

describe("gossip.ts simple typologies", function scenario() {
  it("should gossip 2 out of 3", async function test1() {
    this.timeout(4000);
    const results = await gossip(
      [1, 2, 3] as unknown as DappyNetworkMember[],
      (dnm) => {
        if ((dnm as unknown as number) === 3) {
          return Promise.reject(new Error("comm/tls"));
        }
        return Promise.resolve(true);
      },
      10
    );
    expect(results[0]).to.eql(true);
    expect(results[1]).to.eql(true);
    expect((results[2] as Error).message).to.eql(
      "undefined:undefined@undefined comm/tls"
    );
  });

  it("should gossip 100% after network interruption (1)", async function test2() {
    this.timeout(16000);
    const t = new Date().getTime();
    const results = await gossip(
      [1, 2, 3] as unknown as DappyNetworkMember[],
      (dnm) => {
        if ((dnm as unknown as number) === 3) {
          // will only resolve after 2 seconds (network interruption)
          if (new Date().getTime() - t > 5000) {
            return Promise.resolve(true);
          }
          return Promise.reject(new Error("comm/tls"));
        }
        return Promise.resolve(true);
      },
      3000
    );
    expect(results).to.eql([true, true, true]);
  });

  it("should gossip 100% after network interruption (2)", async function test3() {
    this.timeout(16000);
    const t = new Date().getTime();
    const results = await gossip(
      [1, 2, 3] as unknown as DappyNetworkMember[],
      (dnm) => {
        if ([1, 2].includes(dnm as unknown as number)) {
          // will only resolve after 2 seconds (network interruption)
          if (new Date().getTime() - t > 5000) {
            return Promise.resolve(true);
          }
          return Promise.reject(new Error("comm/tls"));
        }
        return Promise.resolve(true);
      },
      3000
    );
    expect(results).to.eql([true, true, true]);
  });
});

describe("gossip.ts complex typologies", () => {
  // 1 and 2 only know typo1
  const typo1 = [1, 2, 3];
  // 3 and 4 know typo2
  const typo2 = [1, 2, 3, 4];

  let member3HasReceivedMessages = false;
  let member4HasReceivedMessages = false;

  it("should gossip 4 out of 4", async () => {
    // 1 starts to gossip
    const gossipOfMember1 = async () => {
      const results = await gossip(
        typo1 as unknown as DappyNetworkMember[],
        (dnm) => {
          if ((dnm as unknown as number) === 3) {
            member3HasReceivedMessages = true;
          }
          return Promise.resolve(true);
        },
        10
      );

      return results;
    };

    // member 3 starts to gossip
    const gossipOfMember3 = async () => {
      if (!member3HasReceivedMessages) {
        throw new Error(
          "Member 3 cannot gossip if he has not received message"
        );
      }
      const results = await gossip(
        typo2 as unknown as DappyNetworkMember[],
        (dnm) => {
          if ((dnm as unknown as number) === 4) {
            member4HasReceivedMessages = true;
          }
          return Promise.resolve(true);
        },
        10
      );

      return results;
    };

    expect(await gossipOfMember1()).to.eql([true, true, true]);
    expect(member3HasReceivedMessages).to.eql(true);
    expect(await gossipOfMember3()).to.eql([true, true, true, true]);
    expect(member4HasReceivedMessages).to.eql(true);
  });
});
