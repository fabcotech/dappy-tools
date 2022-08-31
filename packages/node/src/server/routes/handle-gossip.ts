import https from 'https';
import { Request, Response } from 'express';
import { NameZone } from '../../model/NameZone';
import { checkZoneTransaction, gossip } from '../../../../gossip';
import { log } from '../../log';
import { DappyNetworkMember } from '@fabcotech/dappy-lookup';

const ROUNDS_OF_GOSSIP = 1;

export const createHandleGossip =
  (
    getZones: (names: string[]) => Promise<NameZone[]>,
    saveZone: (zone: NameZone) => Promise<void>,
    dappyNetwork: DappyNetworkMember[],
    dappyNetworkSelfHostname: string
) =>
  async (req: Request, res: Response) => {

    let gossipToDappyNetwork = false;
    log('/gossip ' + req.body.data.zone.origin);

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
        gossipToDappyNetwork = true;
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
        gossipToDappyNetwork = true;
      } catch (err) {
        res.send((err as unknown as any).message || 'Unauthorized').status(403);
        return;
      }
    }

    if (gossipToDappyNetwork && (!req.body.gossip || req.body.gossip < ROUNDS_OF_GOSSIP)) {
      log(`will gossip to ${dappyNetwork.length - 1} members`);
      gossip(
        dappyNetwork.filter(dnm => dnm.hostname !== dappyNetworkSelfHostname),
        (dnm: any) => {
          return new Promise((reso, reje) => {
            const options = {
              minVersion: 'TLSv1.3',
              rejectUnauthorized: true,
              ca: dnm.caCert,
              host: dnm.ip,
              method: 'POST',
              port: dnm.port,
              path: `/gossip`,
              headers: {
                'Content-Type': 'application/json',
                Host: dnm.hostname,
              },
            };
            const req2 = https.request(options as any, (res2) => {
              if (res2.statusCode === 200) {
                reso(true);
              } else {
                reje('Status code not 200')
              }
            });
            req2.on('error', err => {
              reje(err)
            })
            req2.end(
              JSON.stringify({
                ...req.body,
                gossip: 1
              })
            )
          })
        }
      ).then(results => {
        log(`result of gossip `);
        console.log(JSON.stringify(results));
      })
      .catch(err => {
        console.log('critical error gossip should never fail');
        console.log(err);
      })
    }
  };
