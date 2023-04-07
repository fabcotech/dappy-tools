import { resolver } from '@fabcotech/bees';

import {
  getDappyNetworkMembers,
  getHashOfMajorityResult,
  CO_RESOLUTION_SETTINGS,
  shuffleArray,
  QueryType,
} from './coResolveQuery';
import { hashString } from './utils/hashString';

import { DappyLookupOptions } from './types';

export const createCoResolveQuerySimple =
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

    if (process.env.DEBUG) {
      Object.keys(resolved.loadState).forEach((a) => {
        console.log(
          `\x1B[34mGroup ${a} (hash ${resolved.loadState[a].stringToCompare}) \x1b[0m`,
        );
        resolved.loadState[a].ids.forEach((id) => {
          console.log(
            '\x1b[32m',
            members[Number(id)].hostname,
            '@',
            members[Number(id)].ip,
            '\x1b[0m',
          );
        });
      });
      console.log('\n');
    }

    return results[getHashOfMajorityResult(resolved)];
  };
