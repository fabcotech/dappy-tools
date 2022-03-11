import dns from 'dns';
import { NamePacket } from './model/NamePacket';

import { lookup as dappyLookupRecord } from './lookup';

export function createCached(action: typeof dappyLookupRecord) {
  const cache: {
    [key: string]: {
      value: NamePacket;
      hit: number;
      age: number;
    };
  } = {};

  return async (name: string) => {
    if (!cache[name]) {
      const value = await action(name);

      cache[name] = {
        value,
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
    const packet = await lookupFn(name);
    const family = options.family === 6 ? 6 : 4;

    if (!packet.answers || !packet.answers.length) {
      callback(
        new Error(`No address found for name ${name} (format: IPv${family})`),
      );
      return;
    }

    const addresses = packet.answers.map(({ data }) => data);

    if (!addresses || addresses.length === 0) {
      callback(
        new Error(
          `No address found for name ${name} (format: IPv${options.family})`,
        ),
      );
      return;
    }

    callback(null, addresses[0], family);
  };

const createGetCA =
  (lookupFn: typeof dappyLookupRecord) => async (name: string) => {
    const packet = await lookupFn(name);
    const cert = (packet.answers || []).find(({ type }) => type === 'CERT');
    if (!packet.answers || !cert) {
      throw new Error(`No cert found for name ${name}`);
    }
    return cert;
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
