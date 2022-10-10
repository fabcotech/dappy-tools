import { resolver, ResolverOutput } from '@fabcotech/bees';
import {
  isDappyNetworkMembers,
  DappyNetwork,
  DappyNetworkId,
  DappyNetworkMember,
} from './model';

import { dappyNetworks } from './dappyNetworks';
import { hashString } from './utils/hashString';

import { DappyLookupOptions } from './types';
import { JSONObject } from './utils/json';

const DEFAULT_DAPPY_NETWORK = 'd';

const shuffleArray = (dn: DappyNetworkMember[]): DappyNetworkMember[] => {
  const newArray = dn.concat([]);
  for (let i = newArray.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = newArray[i];
    newArray[i] = newArray[j];
    newArray[j] = temp;
  }

  return newArray;
};

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

    if (isDappyNetworkMembers(network)) {
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

const getHashOfMajorityResult = (resolved: ResolverOutput) =>
  Object.values(resolved.loadState)
    .map(({ ids, data }) => ({ count: ids.length, hash: data }))
    .sort((a, b) => b.count - a.count)[0].hash;

type QueryType<TQuery> = (
  query: TQuery,
  options: DappyNetworkMember,
) => Promise<JSONObject>;

export const createCoResolveQuery =
  <TQuery, TResult extends object>(query: QueryType<TQuery>) =>
  async (queryArgs: TQuery, options?: DappyLookupOptions): Promise<TResult> => {
    let members = await getDappyNetworkMembers(options?.dappyNetwork);
    members = shuffleArray(members);

    const results: Record<string, TResult> = {};
    const resolved = await resolver(
      async (id) => {
        try {
          const reponse = await query(queryArgs, members[Number(id)]);
          const hash = hashString(JSON.stringify(reponse));
          results[hash] = reponse as TResult;

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
        `Query ${queryArgs} not resolved: ${resolved.loadError?.error}`,
      );
    }

    return results[getHashOfMajorityResult(resolved)];
  };
