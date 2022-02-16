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

const MINIMUM_CONSENSUS_THRESHOLD = (100 / 3) * 2;
const MEMBER_MAJORITY = 50;

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
    const getXRecord = createGetXRecord(request);
    const members = await getDappyNetworkMembers(options?.dappyNetwork);

    let result: DappyRecord = {} as any;
    const resolved = await resolver(
      async (id) => {
        try {
          result = await getXRecord(name, members[Number(id)]);

          return {
            type: 'SUCCESS',
            data: hashString(JSON.stringify(result)),
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
      members.map((_, i) => i as any),
      'absolute',
      MINIMUM_CONSENSUS_THRESHOLD,
      Math.ceil(members.length * (MEMBER_MAJORITY / 100)),
      (a) => a,
    );
    if (resolved.status === 'failed') {
      throw new Error(
        `Name ${name} not resolved: ${resolved.loadError?.error}`,
      );
    }
    return result;
  };

export const lookup = (name: string, options?: DappyLookupOptions) => {
  return createCoResolveRequest(nodeRequest)(name, options);
};
