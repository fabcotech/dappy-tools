import { Response, Router } from 'express';
import bodyParser from 'body-parser';

import { getNodes } from './get-nodes';
import { ping } from './ping';
import { createDnsQuery, createExtendedDnsQuery } from './dns-query';
import { createMintZone } from './mint-zone';
import { createUpdateZone } from './update-zone';
import { createGetHash } from './get-hash';
import { getCurrentZoneProvider } from '../../ZoneProviders';
import { getStore } from '../../store';
import { createGetZones } from './get-zones';
import { createHandleGossip } from './handle-gossip';
import { getConfig } from '../../config';

export function getRouter() {
  const router = Router();
  const store = getStore();
  const config = getConfig();

  const { getZones, saveZone, getHash } = getCurrentZoneProvider();

  router.post('/ping', ping);
  router.post('/get-nodes', getNodes(store));
  router.post(
    '/dns-query',
    bodyParser.raw({
      type: 'application/dns-message',
    }),
    createDnsQuery(getZones)
  );
  router.post(
    '/dns-query-extended',
    bodyParser.json(),
    createExtendedDnsQuery(getZones)
  );

  router.post(
    '/mint-zone',
    bodyParser.json(),
    createMintZone(getZones, saveZone)
  );

  router.post(
    '/update-zone',
    bodyParser.json(),
    createUpdateZone(getZones, saveZone)
  );

  router.post('/get-zones', bodyParser.json(), createGetZones(getZones));

  router.get(
    '/hashes',
    bodyParser.json(),
    createGetHash(
      true,
      getHash,
      (res: Response, text: string, httpStatus: number) => {
        res.status(httpStatus).send(text);
      }
    )
  );

  router.get(
    '/hash',
    bodyParser.json(),
    createGetHash(
      false,
      getHash,
      (res: Response, text: string, httpStatus: number) => {
        res.status(httpStatus).send(text);
      }
    )
  );

  router.post(
    '/gossip',
    bodyParser.json(),
    createHandleGossip(
      getZones,
      saveZone,
      config.dappyNetwork,
      config.dappyNetworkMasterPublicKey,
      (res: Response, text: string, httpStatus: number) => {
        res.status(httpStatus).send(text);
      }
    )
  );

  return router;
}
