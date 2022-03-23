import { resolver, ResolverOutput } from 'beesjs';
import dnsPacket from 'dns-packet';

import { dappyNetworks } from './dappyNetworks';
import { nodeRequest } from './utils/nodeRequest';
import { hashString } from './utils/hashString';
import { NamePacket } from './model/NamePacket';
import {
  isDappyNetwork,
  DappyNetwork,
  DappyNetworkId,
  DappyNetworkMember,
} from './model/DappyNetwork';
import { DappyLookupOptions } from './types';
import { RecordType } from './model/ResourceRecords';
import { JSONObject } from './utils/json';

const DEFAULT_DAPPY_NETWORK = 'd';
const DNS_QUERY_PATH = '/dns-query';

const CO_RESOLUTION_SETTINGS: {
  [key: number]: { absolute: number; accuracy: number };
} = {
  1: { absolute: 1, accuracy: 100 },
  2: { absolute: 2, accuracy: 100 },
  3: { absolute: 2, accuracy: 66 },
  4: { absolute: 3, accuracy: 66 },
  5: { absolute: 3, accuracy: 66 },
  6: { absolute: 4, accuracy: 66 },
  7: { absolute: 4, accuracy: 66 },
};

export type GetDappyNetworks = () => Promise<
  Record<DappyNetworkId, DappyNetworkMember[]>
>;

export const getDappyNetworkStaticList: GetDappyNetworks = () =>
  Promise.resolve(dappyNetworks);

export const createGetDappyNetworkMembers =
  (getDappyNetworks: GetDappyNetworks) =>
  async (dappyNetwork?: DappyNetwork) => {
    const network = dappyNetwork || DEFAULT_DAPPY_NETWORK;

    if (isDappyNetwork(network)) {
      return network;
    }

    const dappyNetworkId = network;
    const networks = await getDappyNetworks();
    const networkInfo = networks[dappyNetworkId];

    if (!networkInfo || networkInfo.length === 0) {
      throw new Error('unknown or malformed dappy network');
    }

    return networks[dappyNetworkId];
  };

export const getDappyNetworkMembers = createGetDappyNetworkMembers(
  getDappyNetworkStaticList,
);

export const tryParseDnsPacket = (raw: Buffer): JSONObject | undefined => {
  try {
    return dnsPacket.decode(raw) as JSONObject;
  } catch (e) {
    return undefined;
  }
};

export const createGetRecords =
  (request: typeof nodeRequest) =>
  async (name: string, recordType: RecordType, options: DappyNetworkMember) => {
    const { hostname, port, scheme, ip, caCert } = options;
    const dnsQuery = dnsPacket.encode({
      type: 'query',
      id: 0,
      flags: dnsPacket.RECURSION_DESIRED,
      questions: [
        {
          name,
          type: recordType,
        },
      ],
    });
    const reqOptions: Parameters<typeof request>[0] = {
      scheme,
      host: ip,
      port,
      path: DNS_QUERY_PATH,
      method: 'POST',
      headers: {
        Host: hostname,
        'content-type': 'application/dns-message',
        'content-length': dnsQuery.length,
      },
      body: dnsQuery,
    };
    if (caCert) {
      reqOptions.ca = Buffer.from(caCert, 'base64').toString();
    }
    const rawResponse = await request(reqOptions);

    const jsonResponse = tryParseDnsPacket(rawResponse);

    if (!jsonResponse || Array.isArray(jsonResponse)) {
      throw new Error(
        `Could not parse response from ${scheme}://${hostname}:${port}/${DNS_QUERY_PATH}`,
      );
    }

    return jsonResponse;
  };

const getHashOfMajorityResult = (resolved: ResolverOutput) =>
  Object.values(resolved.loadState)
    .map(({ ids, data }) => ({ count: ids.length, hash: data }))
    .sort((a, b) => b.count - a.count)[0].hash;

export const createCoResolveRequest =
  (request: typeof nodeRequest) =>
  async (
    name: string,
    recordType: RecordType,
    options?: DappyLookupOptions,
  ): Promise<NamePacket> => {
    const getRecords = createGetRecords(request);
    const members = await getDappyNetworkMembers(options?.dappyNetwork);

    const results: Record<string, NamePacket> = {};
    const resolved = await resolver(
      async (id) => {
        try {
          const namePacket = await getRecords(
            name,
            recordType,
            members[Number(id)],
          );
          const hash = hashString(JSON.stringify(namePacket));
          results[hash] = namePacket as NamePacket;

          return {
            type: 'SUCCESS',
            data: hash,
            id,
          };
        } catch (e) {
          return {
            type: 'ERROR',
            data: (e as Error).message,
            id,
          };
        }
      },
      members.map((_, i) => i.toString()),
      CO_RESOLUTION_SETTINGS[Math.min(members.length, 7)].accuracy,
      CO_RESOLUTION_SETTINGS[Math.min(members.length, 7)].absolute,
      (a) => a,
    );
    if (resolved.status === 'failed') {
      throw new Error(
        `Name ${name} not resolved: ${resolved.loadError?.error}`,
      );
    }

    return results[getHashOfMajorityResult(resolved)];
  };

export const lookup = (
  name: string,
  recordType: string,
  options?: DappyLookupOptions,
) => {
  return createCoResolveRequest(nodeRequest)(
    name,
    RecordType[recordType as keyof typeof RecordType],
    options,
  );
};
