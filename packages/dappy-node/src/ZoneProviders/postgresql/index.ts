import { Router } from 'express';
import knex from 'knex';
import md5 from 'md5';
import type { Knex } from 'knex';
import { log } from '../../log';
import { NameZone } from '../../model/NameZone';
import { ZoneProvider } from '../ZoneProvider';
import * as knexConfig from './knex';

let connection: Knex<any, unknown>;

function start() {
  connection = knex(knexConfig);
  log('postgresql provider started');
  return Promise.resolve();
}

interface NameZoneTable {
  id: number;
  domain: string;
  public_key: string;
  created_at: Date;
  renewed_at: Date;
  zone: NameZone;
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
