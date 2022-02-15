import dns from 'dns';

import { lookup as dappyLookupRecord } from './lookup';
import { DappyRecord, DappyRecordValue } from './types';
import { isIPv6 } from './utils/validation';

export function createCached(action: typeof dappyLookupRecord) {
  const cache: {
    [key: string]: {
      value: DappyRecord;
      hit: number;
      age: number;
    };
  } = {};

  return async (name: string) => {
    if (!cache[name]) {
      cache[name] = {
        value: await action(name),
        hit: 0,
        age: Date.now(),
      };
    } else {
      cache[name].hit += 1;
    }
    return cache[name].value;
  };
}

function withFamily(recordValue: DappyRecordValue) {
  return {
    address: recordValue.value,
    family: isIPv6(recordValue.value) ? 6 : 4,
  };
}

const internalCreateNodeLookup =
  (lookupFn: typeof dappyLookupRecord) =>
  async (
    name: string,
    options: dns.LookupOneOptions,
    callback: (...args: any[]) => void,
  ) => {
    const record = await lookupFn(name);

    const family = options.family === 6 ? 6 : 4;
    const addresses = record.values
      .map(withFamily)
      .filter((a) => a.family === family);

    if (addresses.length === 0) {
      callback(
        new Error(
          `No address found for name ${name} (format: IPv${options.family})`,
        ),
      );
      return;
    }

    callback(null, addresses[0].address, addresses[0].family);
  };

const createGetCA =
  (lookupFn: typeof dappyLookupRecord) => async (name: string) => {
    const record = await lookupFn(name);
    return record.ca;
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
