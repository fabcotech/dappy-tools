import { Request, Response } from 'express';

export const createGetZonesPaginated =
  (
    getZonesPaginated: (a: { offset: number; limit: number }) => Promise<{
      count: number;
      tables: any;
    }>
  ) =>
  async (req: Request, res: Response) => {
    return res.send({
      result: await getZonesPaginated(req.body),
    });
  };
