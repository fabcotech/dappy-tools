import { NameZone } from '@fabcotech/dappy-lookup';
import { Router } from 'express';
import knex from 'knex';
import md5 from 'md5';
import type { Knex } from 'knex';
import { log } from '../../log';
import { ZoneProvider } from '../ZoneProvider';
import * as knexConfig from './knex';
import { getConfig } from '../../config';
import { init } from './init';

let connection: Knex<any, unknown>;

export interface NameZoneTable {
  id: number;
  domain: string;
  public_key: string;
  created_at: Date;
  renewed_at: Date;
  zone: NameZone;
}

async function getZonesPaginated(a: {
  offset: number;
  limit: number;
}): Promise<{
  count: number;
  tables: any;
}> {
  if (a.limit > 500) {
    return Promise.reject(new Error('limit can not exceed 500'));
  }
  const counts = await connection<NameZoneTable>('zones').count();

  const result = await connection<NameZoneTable>('zones')
    .select('*')
    .orderBy('updated_at', 'asc')
    .offset(a.offset)
    .limit(a.limit);

  return {
    count: parseInt(counts[0].count as string, 10),
    tables: result,
  };
}

async function start() {
  connection = knex(knexConfig);
  log('postgresql provider started');

  const config = getConfig();
  const firstZone = await getZonesPaginated({
    offset: 0,
    limit: 3,
  });
  if (
    firstZone.count === 0 &&
    config.downloadZonesIfEmpty &&
    config.dappyNetworkMemberToDownloadNodesFrom
  ) {
    const dappyNetworkMember = config.dappyNetwork.find(
      (a) => a.hostname === config.dappyNetworkMemberToDownloadNodesFrom
    );
    if (dappyNetworkMember) {
      try {
        log('init/download started !');
        const res = await init(dappyNetworkMember, connection, log);
        log('init/download ended successfuly !');
        log(`time for downloading tables       : ${res[0]}s`);
        log(`number of tables                  : ${res[2]}`);
        log(`number of batches (of 200 tables) : ${res[3]}`);
        log(`time for inserting tables in db   : ${res[1]}s`);
      } catch (err) {
        log('init/download crashed, removing all zones');
        // todo
        await connection<NameZoneTable>('zones').del();
        throw err;
      }
    } else {
      throw new Error(
        `Did not find dappy network member to download zones from, cannot init : ${config.dappyNetworkMemberToDownloadNodesFrom}`
      );
    }
  }
  return Promise.resolve();
}

export const zoneProvider: ZoneProvider = {
  getHash: async (each: boolean): Promise<string> => {
    const result = await connection.raw(
      'select domain, md5(CAST((array_agg(z.zone order by "domain")) AS text)) from zones z group by "domain" order by "domain"'
    );

    if (each) {
      return result.rows;
    }

    return md5(JSON.stringify({ rows: result.rows }));
  },
  getZones: async (names: string[]): Promise<NameZone[]> => {
    const result = await connection<NameZoneTable>('zones')
      .select({
        zone: 'zone',
      })
      .whereIn('domain', names);
    return result.map((r) => r.zone);
  },
  start,
  getZonesPaginated,
  getRoutes: () => {
    return Router();
  },
  saveZone: async (zone: NameZone) => {
    const ownerTxt = (zone.records || []).find(
      (r: any) => r.type === 'TXT' && r.data.startsWith('OWNER=')
    );
    let publicKey = '';
    if (!ownerTxt) {
      throw new Error('Invalid zone no owner');
    }
    publicKey = ownerTxt.data.slice(6);

    const result = await connection<NameZoneTable>('zones')
      .select({
        zone: 'zone',
      })
      .where('domain', zone.origin);
    if (result[0]) {
      await connection<NameZoneTable>('zones')
        .where('domain', zone.origin)
        .update({
          zone,
          public_key: publicKey,
        });
    } else {
      await connection<NameZoneTable>('zones').insert({
        domain: zone.origin,
        zone,
        public_key: publicKey,
      });
    }
  },
};
