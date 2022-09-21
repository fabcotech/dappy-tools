import { Request, Response } from 'express';

import { log } from '../../log';

export const createGetHash =
  (
    each: boolean,
    getHash: (each: boolean) => Promise<string>,
    resSend: (res: Response, text: string, httpStatus: number) => void
  ) =>
  async (req: Request, res: Response) => {
    log(each ? `/hashes` : `/hash`);
    resSend(res, (await getHash(each)), 200);
  };
