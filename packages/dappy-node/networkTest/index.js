const { exec } = require("child_process");
const fs = require('fs');
const https = require('https');

const { publicKeyFromPrivateKey } = require('@fabcotech/gossip');

const { getRandomName, purchaseZone, getZonesPaginated, getHash } = require('./utils.js');

const NUMBER_OF_ZONES_TO_CREATE = 100;
const processes = [];

const argsProcess1 =
  'DAPPY_PG_CONNECTION_STRING=postgresql://postgres:postgres@localhost:5432/dappy1 DAPPY_NODE_HTTP_PORT=3001 DAPPY_NODE_HTTPS_PORT=3002 DAPPY_NODE_CERTIFICATE_FILENAME=./networkTest/dappynodetest1.crt DAPPY_NODE_PRIVATE_KEY_FILENAME=./networkTest/dappynodetest1.key DOWNLOAD_ZONES_IF_EMPTY=false DAPPY_NETWORK_FILE=networkTest/dappyNetwork.json';

const argsProcess2 =
  'DAPPY_PG_CONNECTION_STRING=postgresql://postgres:postgres@localhost:5432/dappy2 DAPPY_NODE_HTTP_PORT=3003 DAPPY_NODE_HTTPS_PORT=3004 DAPPY_NODE_CERTIFICATE_FILENAME=./networkTest/dappynodetest2.crt DAPPY_NODE_PRIVATE_KEY_FILENAME=./networkTest/dappynodetest2.key DOWNLOAD_ZONES_IF_EMPTY=true DAPPY_NETWORK_MEMBER_TO_DOWNLOAD_ZONES_FROM=localhost DAPPY_NETWORK_FILE=networkTest/dappyNetwork.json';

const argsProcess3 =
  'DAPPY_PG_CONNECTION_STRING=postgresql://postgres:postgres@localhost:5432/dappy3 DAPPY_NODE_HTTP_PORT=3005 DAPPY_NODE_HTTPS_PORT=3006 DAPPY_NODE_CERTIFICATE_FILENAME=./networkTest/dappynode2.crt DAPPY_NODE_PRIVATE_KEY_FILENAME=./networkTest/dappynode2.key DOWNLOAD_ZONES_IF_EMPTY=true DAPPY_NETWORK_MEMBER_TO_DOWNLOAD_ZONES_FROM=localhost2 DAPPY_NETWORK_FILE=networkTest/dappyNetwork.json';

const privateKey = "28a5c9ac133b4449ca38e9bdf7cacdce31079ef6b3ac2f0a080af83ecff98b36";
const publicKey = publicKeyFromPrivateKey(privateKey);

const domains = {};

const createAllZones = (dappyNetwork, number) => {
  let i = 1;
  return new Promise((resolve, reject) => {
    const purchase = async () => {
      if (i % 100 === 0) console.log('(Zones creation) Creation no', i);
      const r = getRandomName();
      try {
        await purchaseZone(
          dappyNetwork,
          {
            origin: r,
            records:[{ host: '@', type: 'TXT', data: `OWNER=${publicKey}`}]
          },
          privateKey,
          true
        );
        domains[r] = true;
        if (i === number) {
          resolve();
        } else {
          i += 1;
          // 1 second pause
          if (i % 500 === 0) {
            await new Promise((resolvee) => {
              console.log('(Zones creation) Batches of 500, 8s pause before next batch');
              setTimeout(resolvee, 8000);
            });
          }
          await purchase();
        }
      } catch (err) {
        reject(err);
      }
    };
    purchase();
  });
};

const func = async () => {
  const network = JSON.parse(
    fs.readFileSync('./networkTest/dappyNetwork.json', 'utf8')
  );

  const step3 = (args, name) => {
    const child = exec(
      `${args} node dist/src/index.js`,
      { maxBuffer: 1024 * 1000 * 12 },
      (error, stdout, stderr) => {
        if (error) {
          console.log(error);
          console.log(stderr);
          throw new Error('error in child process');
        }
        console.log(name, 'process ended');
      }
    );
    child.stdout.on('data', (data) => {
      console.log(`(${name})`, data);
    });
    processes.push(child);
  };

  let process3Launched = false;
  /*
    Step 4 checks the result of GET /hash on
    each two nodes, make sure they match
    THEN
    launches a third process and checks GET /hash as well
    this time it checks that the fetching of zones work
  */
  const step4 = () => {
    setInterval(() => {
      const hashes = [];
      const checkHashes = () => {
        if (hashes[0] === hashes[1]) {
          console.log(`(master) ✅✅✅ Hashes are the same (${NUMBER_OF_ZONES_TO_CREATE} zones created) !!`);
          console.log('(master)', hashes[0]);
          console.log('(master)', hashes[1]);
          if (!process3Launched) {
            console.log('(master) spawning process 3 to test fetching');
            process3Launched = true;
            step3(argsProcess3, 'process3');
          }
          setTimeout(() => {
            getHash({
              ...network[1],
              port: '3006',
            })
              .then((a) => {
                console.log(`(master) /hash of process 3 : ${a}`)
                if (hashes[0] === hashes[1]) {
                  console.log(`(master) ✅✅✅ Hash of process 3 matches as well !!`);
                  console.log('(master)', a);
                  processes.forEach((pr) => {
                    pr.stdin.pause();
                    pr.kill();
                  });
                  setTimeout(() => {
                    process.exit(0);
                  }, 500);
                } else {
                  console.log(`(master) ❌❌❌ Hash of process 3 does not match !!`);
                  console.log('(master)', a);
                  process.exit(1);
                }
              });
            }, 2000);
        } else {
          console.log(`(master) ❌❌❌ Hashes are not the same (${NUMBER_OF_ZONES_TO_CREATE} zones created)!!`);
          console.log('(master)', hashes[0]);
          console.log('(master)', hashes[1]);
          process.exit(1);
        }

      };
      getHash(network[0])
        .then((a) => {
          if (hashes.length === 1) {
            hashes.push(a);
            checkHashes()
          } else {
            hashes.push(a);
          }
        });
      getHash(network[1])
        .then((a) => {
          if (hashes.length === 1) {
            hashes.push(a);
            checkHashes()
          } else {
            hashes.push(a);
          }
        });
    }, 10000);
  };

  let i = 0;
  /*
    Step 1 runs the migrations on each process (1,2,3) and then
    runs process 1 and 2, process 3 is spawned later
  */
  const step1 = (args, name) => {
    const child = exec(
      `${args} ./node_modules/.bin/knex migrate:latest --knexfile src/ZoneProviders/postgresql/knex.js`,
      { maxBuffer: 1024 * 1000 * 12 },
      (error, stdout, stderr) => {
        if (error) {
          console.log(error);
          console.log(stderr);
          throw new Error('error in child process');
        }
        console.log(`(master) migration ${name} exited`);
        i += 1;
        if (i === 3) {
          console.log('(master) all migrations exited');
          step3(argsProcess1, 'process1');
          setTimeout(() => {
            const networkWith1Node = [network[0]];
            console.log(networkWith1Node);
            createAllZones(networkWith1Node, NUMBER_OF_ZONES_TO_CREATE)
              .then((a) => {
                console.log('(master) createAllZones script is over');
                setTimeout(() => {
                  step4();
                }, 1000);
              });
          }, 2000);

          setTimeout(() => {
            step3(argsProcess2, 'process2');
          }, 10000);
        }
      }
    );
    child.stdout.on('data', (data) => {
      console.log(`(${name})`, data);
    });
  };

  step1(argsProcess1, 'process1');
  step1(argsProcess2, 'process2');
  step1(argsProcess3, 'process3');
};

func();


/* 
const getAllZones = () => {
  let tables = [];
  let i = 0;
  const perPage = 500;
  return new Promise((resolve, reject) => {
    const getZonesAtPage = async () => {
      console.log(`getAllZones request no ${i} retrieving ${perPage} zones`);
      const r = getRandomName();
      try {
        const a = await getZonesPaginated(
          dappyNetwork,
          { limit: perPage, offset: i * perPage }
        );
        tables = tables.concat(a.tables);
        if (perPage * (i + 1) >= a.count) {
          resolve(tables);
        } else {
          i += 1;
          getZonesAtPage();
        }
      } catch (err) {
        reject(err)
      }
    };
    getZonesAtPage();
  });
}


const f = async () => {
  console.log('starting');
  const t = new Date().getTime();
  await createAllZones(dappyNetworkk);
  console.log(`${Math.round((new Date().getTime() - t) / 10) / 100} seconds to create ${NUM} domains (https + pg)`)

  const t2 = new Date().getTime();
  const allTables = await getAllZones();
  console.log(`${Math.round((new Date().getTime() - t2) / 10) / 100} seconds to get all zones ${allTables.length} (https + pg)`);
  console.log(allTables[0]);
}
// f(); */

