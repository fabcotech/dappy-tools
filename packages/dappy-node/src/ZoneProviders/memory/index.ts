import { NameZone } from '@fabcotech/dappy-lookup';
import { Router } from 'express';

import { log } from '../../log';

import { zones } from './zones';

export const zoneProvider = {
  getHash: async () => {
    return Promise.resolve('not implemented');
  },
  getZonesPaginated: async () => {
    return Promise.reject(new Error('not implemented'));
  },
  getZones: async (names: string[]): Promise<NameZone[]> => {
    return Object.entries(zones)
      .filter(([k]) => names.includes(k))
      .map(([, v]) => v);
  },
  start: () => {
    log('memory provider started');
    return Promise.resolve();
  },
  getRoutes: () => {
    return Router();
  },
  saveZone: async (zone: NameZone): Promise<void> => {
    return new Promise((resolve) => {
      zones[zone.origin] = zone;
      resolve();
    });
  },
};
