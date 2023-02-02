const { publicKeyFromPrivateKey } = require('@fabcotech/gossip');

const { getRandomName, purchaseZone, getZonesPaginated } = require('./utils.js');

const NUM = 100;
const privateKey = "28a5c9ac133b4449ca38e9bdf7cacdce31079ef6b3ac2f0a080af83ecff98b36";
const publicKey = publicKeyFromPrivateKey(privateKey);

const dappyNetworkk = [{
  scheme: 'https',
  ip: '127.0.0.1',
  hostname: 'localhost',
  caCert: 'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUN6akNDQWJhZ0F3SUJBZ0lVZmdNd3VSbWtpNWhNRU9pWUs5ZjlTQnpIQWJFd0RRWUpLb1pJaHZjTkFRRUwKQlFBd0ZERVNNQkFHQTFVRUF3d0piRzlqWVd4b2IzTjBNQjRYRFRJeU1EUXlPREE0TkRjek1Wb1hEVFF5TURReQpNekE0TkRjek1Wb3dGREVTTUJBR0ExVUVBd3dKYkc5allXeG9iM04wTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGCkFBT0NBUThBTUlJQkNnS0NBUUVBclpralFabThLdU5uakJjTkhBb01BMlBEakxYbXR1UTlXSFBxTy9QbzJCbVYKQklDZU9OdStzd1BSbDRkVHhCZzc4RENtcy8rSGRxVUczZnhrM3dsSDhMd2dVQmlwVm1Rb1N6bVpTMENsK2J4OApRTHNNa2QzamxqVVp6QzJIYllQdHpDK29KMmVRQ2wzNlZDeENnWUY2Q1dsNkFkSytiT1ZJSjdheDRYZFdCUHFnCmc2UUlYYzFRWC9lN2Y1NyszMk9KLzl2VXVmQ3FuVDJKTWNCMzAwOVNRblFBZm9XaGxDaXBuTXJXU2hSeENPVGgKdDhCbDFxZElpMVp4UXNMK3dXUDI5RTVyMThBcm5aSnZsdEtHNXpGbnp1QmtpVWxtdnFMYjU1NlU4OGhXYkJ0Ugo0ck4vWFpsTklZQkdqS2JaUmxrZUZldk1taG8zMXpwbUdiMDNicUhHN1FJREFRQUJveGd3RmpBVUJnTlZIUkVFCkRUQUxnZ2xzYjJOaGJHaHZjM1F3RFFZSktvWklodmNOQVFFTEJRQURnZ0VCQUswNC9NUXMybnU1ZlNyaXBlSDQKQ2d1eWUvalRBNUhtdlRPZU9pcmg5ZzRYTXV3bzNwQkliWjVGZ21oV1dQdm9zTUhmcVpaQkcxSGxCWnlwZk9pTgpkU09qOEduOE1kZ0Rmb1BHdFY1bVJTd0JyV0ppUElJTEtTMGFTZXBINU1BcVJHZnRKampzMWJxa3JaYlJlTkNkClNiTHZwUHNBczlDVUNJZlh4b3oyWG1CVHE2dzNYS05Gck1FVUI2ZmNIS0tXbVUzcG0yT1lqUGxKVmw2UVRoSU8KQ0s5ajhjS3hxQ1hESGRqNW03MzF4bEJRcE1pSnQra3lNWWJPUFZsSnovbXJzNUJJNVlRUmExLzRBRU1ORk4vbQpSK3VlTVhDenczL2FYNmRXQlluRG0vcGwvaGh0V3ZZZUFTZ0Vhd0hZTWhxeUpPUnlUeDZJWERjUGdqL09COEhQCkVadz0KLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQ==',
  port: '3002',
}];

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
module.exports.createAllZones = createAllZones;

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
// f();