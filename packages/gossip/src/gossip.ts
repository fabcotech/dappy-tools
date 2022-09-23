import { DappyNetworkMember } from '@fabcotech/dappy-lookup';

const formatDappyNetworkMember = (dnm: DappyNetworkMember) => {
  return `${dnm.ip}:${dnm.port}@${dnm.hostname}`
}

const gossipToOne = (
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
          reject(formatDappyNetworkMember(dnm) + ' timeout')
        } else {
          i += 1;
          go()
        }
      }, timeout);
      func(dnm)
        .then((a) => {
          if (over) return;
          over = true;
          resolve(a)
        })
        .catch(err => {
          if (over) return;
          over = true;
          if (i === 2) {
            if (typeof err === 'string') {
              reject(formatDappyNetworkMember(dnm) + ' ' + err)
            } else {
              reject(formatDappyNetworkMember(dnm) + ' tls/comm' + '\n' + JSON.stringify(err, Object.getOwnPropertyNames(err)))
            }
          } else {
            setTimeout(() => {
              i += 1;
              go();
            }, timeout);
          }
        })
    }
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
  const results: (true | string | Error)[] = dappyNetwork.map(() => 'notover');
  return new Promise((resolve) => {
    dappyNetwork.forEach((dnm, index) => {
      gossipToOne(
        dnm,
        func,
        timeout
      ).then((a) => {
        results[index] = a;
        if (!results.find(r => r === 'notover')) {
          resolve(results)
        }
      })
      .catch(err => {
        results[index] = err;
        if (!results.find(r => r === 'notover')) {
          resolve(results)
        }
      })
    })
  });
};
