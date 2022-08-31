import { Request, Response } from 'express';
import { NameZone } from '../../model/NameZone';
import { checkZoneTransaction } from '../../../../gossip';

export const createHandleGossip =
  (
    getZones: (names: string[]) => Promise<NameZone[]>,
    saveZone: (zone: NameZone) => Promise<void>,
) =>
  async (req: Request, res: Response) => {
    if (!req.body || !req.body.data || !req.body.signature) {
      res.send('Need data and signature').status(400);
      return;
    }

    if (!req.body.data.zone || !req.body.data.zone.origin || typeof req.body.data.zone.origin !== 'string') {
      res.send('Need an origin').status(400);
      return;
    }

    const ownerTxt = (req.body.data.zone.records || [])
      .find((r: any) => r.type === 'TXT' && r.data.startsWith("OWNER="))
    if (!ownerTxt) {
      res.send('Need an owner as TXT record').status(400);
      return;
    }

    if (req.body.data.new) {
      const zone = await getZones([req.body.data.zone.origin]);
      // todo
      /*
        Does dappyNetwork[0].publicKey has the right to create+update ?
      */
      if (zone[0]) {
        // todo
        /*
          The following if is never true
          Need some sort of serialization, fields are not in the same
          order, they are probably reordered by postgre or knex
        */
        if (JSON.stringify(zone[0]) === JSON.stringify(req.body.data.zone)) {
          res.send("Zone already exists and unchanged").status(200);
          return;
        }
      }

      try {
        checkZoneTransaction(
          // todo replace by dappyNetwork[0].publicKey
          "04ea33c48dff95cdff4f4211780a5b151570a9a2fac5e62e5fa545c1aa5be3539c34d426b046f985204815964e10fcd1d87ef88d9bcf43816ad1fa00934cfe4652",
          req.body
        );
        await saveZone(
          req.body.data.zone
        );
        res.send("Zone created").status(200);
        return;
      } catch (err) {
        res.send(err).status(403);
        return;
      }
    } else {
      const zone = await getZones([req.body.data.zone.origin]);
      if (zone[0]) {
        // todo
        /*
          The following if is never true
          Need some sort of serialization, fields are not in the same
          order, they are probably reordered by postgre or knex
        */
        if (JSON.stringify(zone[0]) === JSON.stringify(req.body.data.zone)) {
          res.send("Zone already exists and unchanged").status(200);
          return;
        }
      } else {
        res.send('Zone does not exist').status(403);
        return;
      }

      const currentOwnerTxt = (zone[0].records || [])
        .find((r: any) => r.type === 'TXT' && r.data.startsWith("OWNER="))
      if (!currentOwnerTxt) {
        res.send('Zone has no owner, cannot update').status(400);
        return;
      }
      const publicKeyOfCurrentOwner = currentOwnerTxt.data.slice(6);
      try {
        checkZoneTransaction(
          publicKeyOfCurrentOwner,
          req.body
        );
        await saveZone(
          req.body.data.zone
        );
        res.send("Zone updated").status(200);
        return;
      } catch (err) {
        res.send((err as unknown as any).message || 'Unauthorized').status(403);
        return;
      }
    }
  };
