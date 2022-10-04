import {
  DappyNetworkMember,
  isDappyNetworkMemberHTTPS,
} from '@fabcotech/dappy-model';
import https from 'https';
import type { Knex } from 'knex';

const getZonesPaginated = async (
  dnm: DappyNetworkMember,
  a: { limit: number; offset: number }
): Promise<any> => {
  const results = await new Promise((resolve, reject) => {
    const options = {
      minVersion: 'TLSv1.3',
      rejectUnauthorized: true,
      host: dnm.ip,
      method: 'POST',
      port: dnm.port,
      ca: undefined,
      path: '/get-zones-paginated',
      headers: {
        'Content-Type': 'application/json',
        Host: dnm.hostname,
      },
    };
    if (isDappyNetworkMemberHTTPS(dnm)) {
      options.ca = dnm.caCert;
    }

    const req = https.request(options as unknown, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Status code not 200 : ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    });
    req.on('error', (err) => {
      reject(err);
    });
    req.end(JSON.stringify(a));
  });

  return JSON.parse(results as unknown as any).result;
};

const getAllZones = (dnm: DappyNetworkMember): Promise<any> => {
  let tables = [];
  let i = 0;
  const perPage = 500;
  return new Promise((resolve, reject) => {
    const getZonesAtPage = async () => {
      try {
        const a = await getZonesPaginated(dnm, {
          limit: perPage,
          offset: i * perPage,
        });
        tables = tables.concat(a.tables);
        if (perPage * (i + 1) >= a.count) {
          resolve(tables);
        } else {
          i += 1;
          getZonesAtPage();
        }
      } catch (err) {
        reject(err);
      }
    };
    getZonesAtPage();
  });
};

export const init = async (
  dnm: DappyNetworkMember,
  connection: Knex<any, unknown>,
  log: (a: any, level?: string) => void
) => {
  let t2 = new Date().getTime();
  const allTables = await getAllZones(dnm);
  t2 = Math.round((new Date().getTime() - t2) / 10) / 100;
  log(`retrieved ${allTables.length} tables from dappy network member`);

  const size = 200;
  const batches = [];
  for (let i = 0; i < allTables.length; i += size) {
    batches.push(
      allTables.slice(i, i + size).map((a) => {
        delete a.id;
        return a;
      })
    );
  }

  log(`created ${batches.length} batches of 200 each for insertion in db`);

  let t3 = new Date().getTime();
  return new Promise((resolve, reject) => {
    let j = 0;
    const insertMany = () => {
      const batch = batches[j];
      if (j % 5 === 0) log(`inserting batch ${j} (displaying % 5 only)`);
      connection('zones')
        .insert(batch)
        .then(() => {
          j += 1;
          if (j === batches.length) {
            log('over');
            t3 = Math.round((new Date().getTime() - t3) / 10) / 100;
            resolve([t2, t3, allTables.length, batches.length]);
          } else {
            insertMany();
          }
        })
        .catch((err) => {
          reject(err);
        });
    };
    insertMany();
  });
};
