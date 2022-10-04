import { NameZone } from '@fabcotech/dappy-lookup';
import { Request, Response } from 'express';

export const createUpdateZone =
  (
    getZones: (names: string[]) => Promise<NameZone[]>,
    saveZone: (zone: NameZone) => Promise<void>
  ) =>
  async (req: Request, res: Response) => {
    await saveZone(req.body);
    res.send({
      result: 'ok',
    });
  };
