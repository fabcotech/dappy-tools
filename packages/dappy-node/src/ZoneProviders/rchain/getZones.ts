import { NameZone } from '@fabcotech/dappy-lookup';
import { getXRecordsWsHandler } from './get-x-records';
import { pickRandomReadOnly } from './pickRandomReadOnly';
import { log } from '../../log';
import { getStore } from '../../store';
import { getConfig } from '../../config';

export const getZones = async (names: string[]): Promise<NameZone[]> => {
  const store = getStore();
  const config = getConfig();

  const result = await getXRecordsWsHandler(
    { names },
    {
      cacheEnabled: config.dappyNodeCachingZone,
      redisClient: store.redisClient,
      log,
      urlOrOptions: pickRandomReadOnly(),
    }
  );

  if (!result.success) {
    throw new Error('Failed to get zones from rchain');
  }

  return result.records?.map((r) => {
    return typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
  }) as NameZone[];
};
