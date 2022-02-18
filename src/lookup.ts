import { resolver, ResolverOutput } from 'beesjs';
import {
  DappyLookupOptions,
  DappyRecord,
  DappyNodeResponse,
  DappyNetwork,
  DappyNetworkId,
  DappyNetworkMember,
  DappyNodeErrorResponse,
  DappyNodeSuccessResponse,
} from './types';
import { dappyNetworks } from './dappyNetworks';
import { nodeRequest } from './utils/nodeRequest';
import {
  isIP,
  isStringNotEmpty,
  match,
  isBase64String,
  isObjectWith,
  isArrayNotEmptyOf,
  isBoolean,
} from './utils/validation';
import { hashString } from './utils/hashString';
import { get } from './utils/get';

const DEFAULT_DAPPY_NETWORK = 'dNetwork';
const MINIMUM_CONSENSUS_THRESHOLD = (2 / 3) * 100;
const MEMBER_MAJORITY = 50;
const GET_X_RECORD_PATH = '/getXRecord';

export type GetDappyNetworks = () => Promise<
  Record<DappyNetworkId, DappyNetworkMember[]>
>;

export const getDappyNetworkStaticList: GetDappyNetworks = () =>
  Promise.resolve(dappyNetworks);

export const isDappyNetwork = (
  network: any,
): network is DappyNetworkMember[] => {
  return isArrayNotEmptyOf(
    isObjectWith({
      hostname: isStringNotEmpty,
      ip: isIP,
      port: match(/^\d{1,5}$/),
      scheme: match(/^http(s)?$/),
      caCert: isBase64String,
    }),
  )(network);
};

export const createGetDappyNetworkMembers =
  (getDappyNetworks: GetDappyNetworks) =>
  async (dappyNetwork: DappyNetwork) => {
    if (isDappyNetwork(dappyNetwork)) {
      return dappyNetwork;
    }

    const dappyNetworkId = dappyNetwork;
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

export const tryParseJSON = (raw: string): object | undefined => {
  try {
    return JSON.parse(raw);
  } catch (e) {
    return undefined;
  }
};

export const isDappyNodeResponse = (response: {
  [key: string]: any;
}): response is DappyNodeResponse => {
  return isObjectWith({
    success: isBoolean,
  })(response);
};

export const isDappyNodeSuccessResponse = (response: {
  [key: string]: any;
}): response is DappyNodeSuccessResponse =>
  isDappyNodeResponse(response) && response.success;

export const isDappyNodeResponseError = (response: {
  [key: string]: any;
}): response is DappyNodeErrorResponse =>
  isDappyNodeResponse(response) && !response.success;

export const isDappyRecord = (data: {
  [key: string]: any;
}): data is DappyRecord => {
  return isObjectWith({
    values: isArrayNotEmptyOf(
      isObjectWith({
        value: isStringNotEmpty,
        kind: isStringNotEmpty,
      }),
    ),
    ca: isArrayNotEmptyOf(isStringNotEmpty),
  })(data);
};

export const createGetXRecord =
  (request: typeof nodeRequest) =>
  async (
    name: string,
    options: DappyNetworkMember,
  ): Promise<DappyRecord | undefined> => {
    const { hostname, port, scheme, ip, caCert } = options;
    const reqOptions: Parameters<typeof request>[0] = {
      scheme,
      host: ip,
      port,
      path: GET_X_RECORD_PATH,
      method: 'POST',
      headers: {
        Host: hostname,
        'Content-Type': 'application/json',
      },
      body: {
        names: [name],
      },
    };
    if (caCert) {
      reqOptions.ca = Buffer.from(caCert, 'base64').toString();
    }
    const rawResponse: any = await request(reqOptions);

    const jsonResponse = tryParseJSON(rawResponse);

    if (!jsonResponse) {
      throw new Error(
        `Could not parse response from ${scheme}://${hostname}:${port}/${GET_X_RECORD_PATH}`,
      );
    }

    if (!isDappyNodeResponse(jsonResponse)) {
      throw new Error(
        `Dappy node response is incorrect: ${JSON.stringify(jsonResponse)}`,
      );
    }

    if (isDappyNodeResponseError(jsonResponse)) {
      throw new Error(jsonResponse.error.message);
    } else {
      const rawData = get<string>(jsonResponse, 'records[0].data');
      if (!rawData) {
        return undefined;
      }

      const jsonData = tryParseJSON(rawData);

      if (!jsonData) {
        throw new Error(
          `Could not parse record data from ${scheme}://${hostname}:${port}/${GET_X_RECORD_PATH}`,
        );
      }
      if (!isDappyRecord(jsonData)) {
        throw new Error(
          `Dappy record is incorrect: ${JSON.stringify(jsonData)}`,
        );
      }
      return jsonData;
    }
  };

const getHashOfMajorityResult = (resolved: ResolverOutput) =>
  Object.values(resolved.loadState)
    .map(({ ids, data }) => ({ count: ids.length, hash: data }))
    .sort((a, b) => b.count - a.count)[0].hash;

export const createCoResolveRequest =
  (request: typeof nodeRequest) =>
  async (name: string, options: DappyLookupOptions) => {
    const getXRecord = createGetXRecord(request);
    const members = await getDappyNetworkMembers(options.dappyNetwork);

    const results: Record<string, DappyRecord | undefined> = {};
    const resolved = await resolver(
      async (id) => {
        try {
          const record = await getXRecord(name, members[Number(id)]);
          const hash = hashString(JSON.stringify(record));
          results[hash] = record;

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

    return results[getHashOfMajorityResult(resolved)];
  };

export const lookup = (name: string, options?: DappyLookupOptions) => {
  return createCoResolveRequest(nodeRequest)(name, {
    dappyNetwork: DEFAULT_DAPPY_NETWORK,
    ...options,
  });
};
