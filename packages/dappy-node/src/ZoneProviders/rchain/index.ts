import { getZones } from './getZones';
import { start } from './start';
import { getRoutes } from './routes';

export const zoneProvider = {
  getHash: async () => {
    return Promise.resolve('not implemented');
  },
  getZones,
  start,
  getRoutes,
  saveZone: () => Promise.reject(new Error('not implemented')),
};
