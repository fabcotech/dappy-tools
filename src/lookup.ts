import { resolver } from 'beesjs';
import {
  DappyLookupOptions,
  DappyRecord,
  DappyNetwork,
  DappyNetworkId,
  DappyNetworkMember,
} from './types';
import { dappyNetworks } from './dappyNetworks';
import { nodeRequest } from './utils/nodeRequest';
import {
  isIP,
  isStringNotEmpty,
  match,
  isBase64String,
} from './utils/validation';
import { hashString } from './utils/hashString';

export type GetDappyNetworks = () => Promise<
  Record<DappyNetworkId, DappyNetworkMember[]>
>;

export const getDappyNetworkStaticList: GetDappyNetworks = () =>
  Promise.resolve(dappyNetworks);

export const validateDappyNetworkInfo = (info: DappyNetworkMember) => {
  if (!isStringNotEmpty(info.hostname)) {
    throw new Error(`missing or malformed hostname: ${info.hostname}`);
  }
  if (!isIP(info.ip)) {
    throw new Error(`missing or malformed ip: ${info.ip}`);
  }
  if (!match(/^\d{1,5}$/, info.port)) {
    throw new Error(`missing or malformed port: ${info.port}`);
  }
  if (!match(/^http(s)?$/, info.scheme)) {
    throw new Error(`missing or malformed scheme: ${info.scheme}`);
  }
  if (!isBase64String(info.caCert)) {
    throw new Error(`missing or malformed caCert: ${info.caCert}`);
  }
};

export const createGetDappyNetworkMembers =
  (getDappyNetworks: GetDappyNetworks) =>
  async (dappyNetwork?: DappyNetwork) => {
    if (Array.isArray(dappyNetwork) && dappyNetwork.length > 0) {
      dappyNetwork.forEach(validateDappyNetworkInfo);
      return dappyNetwork;
    }

    const dappyNetworkId = dappyNetwork as DappyNetworkId;
    const networks = await getDappyNetworks();
    const networkInfo = networks[dappyNetworkId];

    if (!networkInfo || networkInfo.length === 0) {
      throw new Error(`unknown dappy network: ${dappyNetworkId}`);
    }

    return networks[dappyNetworkId];
  };

export const getDappyNetworkMembers = createGetDappyNetworkMembers(
  getDappyNetworkStaticList,
);

export const createGetXRecord =
  (request: typeof nodeRequest) =>
  async (name: string, options: DappyNetworkMember): Promise<DappyRecord> => {
    const { hostname, port, scheme } = options;

    const rawResponse: any = await request({
      scheme,
      hostname,
      port,
      path: '/get-x-records',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        names: [name],
      },
    });

    const response = JSON.parse(Buffer.concat(rawResponse).toString());

    if (response.success === false) {
      throw new Error(response.error.message);
    }

    return JSON.parse(response.records[0].data);
  };

export const createCoResolveRequest =
  (request: typeof nodeRequest) =>
  async (name: string, options?: DappyLookupOptions) => {
    const members = await getDappyNetworkMembers(options?.dappyNetwork);

    const results: Record<string, DappyRecord> = {};
    const resolved = await resolver(
      async (id) => {
        results[id] = await createGetXRecord(request)(
          name,
          members[Number(id)],
        );

        return {
          type: 'SUCCESS',
          data: hashString(JSON.stringify(results[id])),
          id,
        };
      },
      members.map((_, i) => i as any),
      'absolute',
      100,
      members.length,
      (a) => a,
    );
    if (resolved.status === 'failed') {
      throw new Error(
        `Name ${name} not resolved: ${resolved.loadError?.error}`,
      );
    }
    return Object.values(results)[0];
  };

export const lookup = (name: string, options?: DappyLookupOptions) => {
  return createCoResolveRequest(nodeRequest)(name, options);
};
