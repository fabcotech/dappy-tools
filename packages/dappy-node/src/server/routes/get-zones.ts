import { NameZone } from '@fabcotech/dappy-model';
import { Request, Response } from 'express';

export const createGetZones =
  (getZones: (names: string[]) => Promise<NameZone[]>) =>
  async (req: Request, res: Response) => {
    return res.send({
      result: await getZones(req.body),
    });
  };
