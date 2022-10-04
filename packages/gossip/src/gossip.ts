import { DappyNetworkMember } from "@fabcotech/dappy-lookup";

const formatDappyNetworkMember = (dnm: DappyNetworkMember) => {
  return `${dnm.ip}:${dnm.port}@${dnm.hostname}`;
};

export const gossipToOne = (
  dnm: DappyNetworkMember,
  func: (dnm: DappyNetworkMember) => Promise<true>,
  timeout: number
): Promise<true> => {
  return new Promise((resolve, reject) => {
    let i = 0;
    const go = () => {
      let over = false;
      setTimeout(() => {
        if (over) return;
        over = true;
        if (i === 2) {
          reject(new Error(`${formatDappyNetworkMember(dnm)} timeout`));
        } else {
          i += 1;
          go();
        }
      }, timeout);
      func(dnm)
        .then((a) => {
          if (over) return;
          over = true;
          resolve(a);
        })
        .catch((err) => {
          if (over) return;
          over = true;
          if (i === 2) {
            if (typeof err === "string") {
              reject(new Error(`${formatDappyNetworkMember(dnm)} ${err}`));
            } else if (err instanceof Error) {
              reject(
                new Error(`${formatDappyNetworkMember(dnm)} ${err.message}`)
              );
            }
          } else {
            setTimeout(() => {
              i += 1;
              go();
            }, timeout);
          }
        });
    };
    go();
  });
};

/*
  Gossip always resolves to an array of results
  Make sure that un func, you either
  resolve(true) OR reject(Error) OR reject(string)
*/
export const gossip = (
  dappyNetwork: DappyNetworkMember[],
  func: (dnm: DappyNetworkMember) => Promise<true>,
  timeout = 8000
): Promise<(true | string | Error)[]> => {
  const results: (true | string | Error)[] = dappyNetwork.map(() => "notover");
  return new Promise((resolve) => {
    dappyNetwork.forEach((dnm, index) => {
      gossipToOne(dnm, func, timeout)
        .then((a) => {
          results[index] = a;
          if (!results.find((r) => r === "notover")) {
            resolve(results);
          }
        })
        .catch((err: Error) => {
          results[index] = err;
          if (!results.find((r) => r === "notover")) {
            resolve(results);
          }
        });
    });
  });
};
