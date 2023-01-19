import { NameZone } from '@fabcotech/dappy-lookup';
import { Request, Response } from 'express';
import { getTLDs, recordHostsToMatchWith } from './utils';

export const createGetRecords =
  (
    getZones: (names: string[]) => Promise<NameZone[]>,
    dappyNetworkId: string,
    recordType?: string
  ) =>
  async (req: Request, res: Response) => {
    let { name } = req.params;
    if (name.endsWith(`.${dappyNetworkId}`)) {
      name = name.substring(0, name.length - `.${dappyNetworkId}`.length);
    }

    const tld = getTLDs([name], dappyNetworkId)[0];

    const zones = await getZones([tld]);
    if (!zones[0]) {
      res.sendStatus(404);
      return;
    }

    if (recordType) {
      res.json({
        records: zones[0].records
          .filter((a) => a.type === recordType)
          .filter((a) => recordHostsToMatchWith(name).includes(a.name)),
      });
    } else {
      res.json(zones[0]);
    }
  };
