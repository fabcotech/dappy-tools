import dns from 'dns';
// import { NamePacket } from '../model/NamePacket';

import { lookup as dappyLookupRecord } from '../lookup';

export const nodeLookup =
  (lookupFn: typeof dappyLookupRecord) =>
  (
    name: string,
    options: dns.LookupOneOptions,
    callback: (...args: any[]) => void,
  ) => {
    lookupFn(name, options.family === 6 ? 'AAAA' : 'A').then((packet) => {
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
    });
  };
