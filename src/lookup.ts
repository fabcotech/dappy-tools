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
  DappyZone,
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
  isOptional,
  isNumber,
  isIPv4,
  isIPv6,
} from './utils/validation';
import { hashString } from './utils/hashString';
import { get } from './utils/get';
import { JSONArray, JSONObject, JSONValue } from './utils/json';
import { tryParseJSON } from './utils/parse';

const DEFAULT_DAPPY_NETWORK = 'd';
const GET_X_RECORD_PATH = '/get-x-records';

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

export const isDappyNetwork = (
  network: JSONArray | string,
): network is DappyNetworkMember[] => {
  return isArrayNotEmptyOf(
    isObjectWith({
      hostname: isStringNotEmpty,
      ip: isIP,
      port: match(/^\d{1,5}$/),
      scheme: match(/^http(s)?$/),
      caCert: isOptional(isBase64String),
    }),
  )(network);
};

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

export const isDappyNodeResponse = (
  response: JSONValue,
): response is DappyNodeResponse => {
  return isObjectWith({
    success: isBoolean,
  })(response);
};

export const isDappyNodeSuccessResponse = (
  response: JSONObject,
): response is DappyNodeSuccessResponse =>
  isDappyNodeResponse(response) && response.success;

export const isDappyNodeResponseError = (
  response: JSONObject,
): response is DappyNodeErrorResponse =>
  isDappyNodeResponse(response) && !response.success;

export const isDappyZone = (data: JSONObject): data is DappyZone => {
  return isObjectWith({
    $origin: isStringNotEmpty,
    $ttl: isNumber,
    a: isOptional(
      isArrayNotEmptyOf(
        isObjectWith({
          name: isStringNotEmpty,
          ttl: isOptional(isNumber),
          ip: isIPv4,
        }),
      ),
    ),
    aaaa: isOptional(
      isArrayNotEmptyOf(
        isObjectWith({
          name: isStringNotEmpty,
          ttl: isOptional(isNumber),
          ip: isIPv6,
        }),
      ),
    ),
    tlsa: isOptional(
      isArrayNotEmptyOf(
        isObjectWith({
          name: isStringNotEmpty,
          ttl: isOptional(isNumber),
          certUsage: isNumber,
          selector: isNumber,
          matchingType: isNumber,
          cert: isStringNotEmpty,
        }),
      ),
    ),
  })(data);
};

export const isDappyRecord = (data: JSONValue): data is DappyRecord => {
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
    const rawResponse = await request(reqOptions);

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
  async (name: string, options?: DappyLookupOptions) => {
    const getXRecord = createGetXRecord(request);
    const members = await getDappyNetworkMembers(options?.dappyNetwork);

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

export const lookup = (name: string, options?: DappyLookupOptions) => {
  return createCoResolveRequest(nodeRequest)(name, options);
};
