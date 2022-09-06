import https from 'https';
import { Request, Response } from 'express';
import { checkZoneTransaction, gossip } from '@fabcotech/gossip';
import isEqual from 'lodash.isequal';

import { DappyNetworkMember } from '@fabcotech/dappy-lookup';
import { NameZone } from '../../model/NameZone';
import { log } from '../../log';

const ROUNDS_OF_GOSSIP = 1;

export const createHandleGossip =
  (
    getZones: (names: string[]) => Promise<NameZone[]>,
    saveZone: (zone: NameZone) => Promise<void>,
    dappyNetwork: DappyNetworkMember[],
    dappyNetworkSelfHostname: string,
    resSend: (res: Response, text: string, httpStatus: number) => void
  ) =>
  async (req: Request, res: Response) => {
    let gossipToDappyNetwork = false;
    log(`/gossip ${req.body.data.zone.origin}`);

    if (!req.body || !req.body.data || !req.body.signature) {
      resSend(res, 'Need data and signature', 400);
      return;
    }

    if (
      !req.body.data.zone ||
      !req.body.data.zone.origin ||
      typeof req.body.data.zone.origin !== 'string'
    ) {
      resSend(res, 'Need an origin', 400);
      return;
    }

    const ownerTxt = (req.body.data.zone.records || []).find(
      (r: any) => r.type === 'TXT' && r.data.startsWith('OWNER=')
    );
    let publicKey = '';
    if (!ownerTxt) {
      resSend(res, 'Need an owner as TXT record', 400);
      return;
    }
    publicKey = ownerTxt.data.slice(6);
    if (publicKey.length !== 130) {
      resSend(res, 'Public key must be of length 130', 400);
      return;
    }

    const zones = await getZones([req.body.data.zone.origin]);

    // todo
    /*
      Does dappyNetwork[0].publicKey has the right to create+update ?
    */

    if (zones[0]) {
      if (isEqual(zones[0], req.body.data.zone)) {
        resSend(res, 'Zone already exists and unchanged', 200);
        return;
      }
    }

    if (req.body.data.new) {
      try {
        checkZoneTransaction(
          // todo replace by dappyNetwork[0].publicKey
          '04ea33c48dff95cdff4f4211780a5b151570a9a2fac5e62e5fa545c1aa5be3539c34d426b046f985204815964e10fcd1d87ef88d9bcf43816ad1fa00934cfe4652',
          req.body
        );
        await saveZone(req.body.data.zone);
        resSend(res, 'Zone created', 200);
        gossipToDappyNetwork = true;
      } catch (err) {
        resSend(res, err, 403);
        return;
      }
    } else {
      const zone = await getZones([req.body.data.zone.origin]);
      if (!zone[0]) {
        resSend(res, 'Zone does not exist', 403);
        return;
      }

      const currentOwnerTxt = (zone[0].records || []).find(
        (r: any) => r.type === 'TXT' && r.data.startsWith('OWNER=')
      );
      if (!currentOwnerTxt) {
        resSend(res, 'Zone has no owner, cannot update', 400);
        return;
      }
      const publicKeyOfCurrentOwner = currentOwnerTxt.data.slice(6);
      try {
        checkZoneTransaction(publicKeyOfCurrentOwner, req.body);
        await saveZone(req.body.data.zone);
        resSend(res, 'Zone updated', 200);
        gossipToDappyNetwork = true;
      } catch (err) {
        resSend(res, (err as unknown as any).message || 'Unauthorized', 403);
        return;
      }
    }

    if (
      gossipToDappyNetwork &&
      (!req.body.gossip || req.body.gossip < ROUNDS_OF_GOSSIP)
    ) {
      log(`will gossip to ${dappyNetwork.length - 1} members`);
      gossip(
        dappyNetwork.filter((dnm) => dnm.hostname !== dappyNetworkSelfHostname),
        (dnm: any) => {
          return new Promise((reso, reje) => {
            const options = {
              minVersion: 'TLSv1.3',
              rejectUnauthorized: true,
              ca: dnm.caCert,
              host: dnm.ip,
              method: 'POST',
              port: dnm.port,
              path: '/gossip',
              headers: {
                'Content-Type': 'application/json',
                Host: dnm.hostname,
              },
            };
            const req2 = https.request(options as any, (res2) => {
              if (res2.statusCode === 200) {
                reso(true);
              } else {
                reje(new Error('Status code not 200'));
              }
            });
            req2.on('error', (err) => {
              reje(err);
            });
            req2.end(
              JSON.stringify({
                ...req.body,
                gossip: 1,
              })
            );
          });
        }
      )
        .then((results: (string | true | Error)[]) => {
          const errors = results.filter((a) => a !== true);
          if (errors.length) {
            log(`${results.length - errors.length} gossips successful`);
            log(`${errors.length} gossip errors :`, 'error');
            log(JSON.stringify(errors), 'error');
          } else {
            log('all gossips successful');
          }
        })
        .catch((err) => {
          log('critical error gossip should never fail', 'error');
          log(err, 'error');
        });
    }
  };
