import {
  DappyLookupOptions,
  DappyRecord,
  DappyNetwork,
  DappyNetworkId,
  DappyNetworkInfo,
} from './types';
import { dappyNetworks } from './dappyNetworks';

import { nodeRequest } from './utils/nodeRequest';
import {
  isIP,
  isStringNotEmpty,
  match,
  isBase64String,
} from './utils/validation';
// const parseUrl = (url: string): RequestOptions => ({});

// eslint-disable-next-line
// const getDappyNode = (dappyNetwork?: DappyNetwork): DappyNetworkInfo => {
//   return {
//     hostname: 'dappynode',
//     ip: '127.0.0.1',
//     port: '3001',
//     scheme: 'http',
//     caCert: '123456789ABCDEF',
//   };
// };

// const validateDappyNetworkInfo = (dappyNetworkInfo: DappyNetworkInfo) => {
// }
export type GetDappyNetworks = () => Promise<
  Record<DappyNetworkId, DappyNetworkInfo[]>
>;

export const getDappyNetworkStaticList: GetDappyNetworks = () =>
  Promise.resolve(dappyNetworks);

export const validateDappyNetworkInfo = (info: DappyNetworkInfo) => {
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

export const createGetDappyNetworkInfo =
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

export const getDappyNetworkInfo = createGetDappyNetworkInfo(
  getDappyNetworkStaticList,
);

export const getXRecord =
  (request: typeof nodeRequest) =>
  async (name: string, options: DappyNetworkInfo): Promise<DappyRecord> => {
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
    return getXRecord(request)(
      name,
      (await getDappyNetworkInfo(options?.dappyNetwork))[0],
    );
  };

export const lookup = (name: string, options?: DappyLookupOptions) => {
  return createCoResolveRequest(nodeRequest)(name, options);
};
