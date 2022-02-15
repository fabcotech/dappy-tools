import dns from 'dns';

import { lookup as dappyLookupRecord } from './lookup';
import { DappyRecord, DappyRecordValue } from './types';

// function isIPv4(address: string) {
//   return /\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}\b/.test(address);
// }

function isIPv6(address: string) {
  return /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/.test(
    address,
  );
}

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
