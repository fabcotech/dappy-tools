import { Router } from 'express';
import knex from 'knex';
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
