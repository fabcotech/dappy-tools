import dns from 'dns';
import { DappyZone } from './types';

import { lookup as dappyLookupRecord } from './lookup';

export function createCached(action: typeof dappyLookupRecord) {
  const cache: {
    [key: string]: {
      value: DappyZone;
      hit: number;
      age: number;
    };
  } = {};

  return async (name: string) => {
    if (!cache[name]) {
      const zone = await action(name);
      if (!zone) {
        return undefined;
      }
      cache[name] = {
        value: zone,
        hit: 0,
        age: Date.now(),
      };
    } else {
      cache[name].hit += 1;
    }
    return cache[name].value;
  };
}

const internalCreateNodeLookup =
  (lookupFn: typeof dappyLookupRecord) =>
  async (
    name: string,
    options: dns.LookupOneOptions,
    callback: (...args: any[]) => void,
  ) => {
    const zone = await lookupFn(name);
    const family = options.family === 6 ? 6 : 4;

    if (!zone) {
      callback(
        new Error(`No address found for name ${name} (format: IPv${family})`),
      );
      return;
    }

    const addresses = zone[family === 6 ? 'AAAA' : 'A'];

    if (!addresses || addresses.length === 0) {
      callback(
        new Error(
          `No address found for name ${name} (format: IPv${options.family})`,
        ),
      );
      return;
    }

    callback(null, addresses[0].ip, family);
  };

const createGetCA =
  (lookupFn: typeof dappyLookupRecord) => async (name: string) => {
    const record = await lookupFn(name);
    if (!record) {
      throw new Error(`No zone found for name ${name}`);
    }
    return record;
  };

export const internalCreateCachedNodeLookup =
  (lookupFn: typeof dappyLookupRecord) => () => {
    const cachedLookup = createCached(lookupFn);

    return {
      lookup: internalCreateNodeLookup(cachedLookup),
      getCA: createGetCA(cachedLookup),
    };
  };

export const createNodeLookup =
  internalCreateCachedNodeLookup(dappyLookupRecord);
