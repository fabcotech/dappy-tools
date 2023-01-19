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
import { createGetRecords } from './get-records';
import { createGetZonesPaginated } from './get-zones-paginated';
import { createHandleGossip } from './handle-gossip';
import { getConfig } from '../../config';

export function getRouter() {
  const router = Router();
  const store = getStore();
  const config = getConfig();

  const { getZones, saveZone, getHash, getZonesPaginated } =
    getCurrentZoneProvider();

  router.post('/ping', ping);
  router.post('/get-nodes', getNodes(store));
  router.post(
    '/dns-query',
    bodyParser.raw({
      type: 'application/dns-message',
    }),
    createDnsQuery(getZones, config.dappyNetworkId)
  );
  router.post(
    '/dns-query-extended',
    bodyParser.json(),
    createExtendedDnsQuery(getZones, config.dappyNetworkId)
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
  router.post(
    '/get-zones-paginated',
    bodyParser.json(),
    createGetZonesPaginated(getZonesPaginated)
  );

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

  router.post(
    '/:name',
    bodyParser.json(),
    createGetRecords(getZones, config.dappyNetworkId, undefined)
  );
  router.get(
    '/:name',
    bodyParser.json(),
    createGetRecords(getZones, config.dappyNetworkId, undefined)
  );
  router.post(
    '/:name/A',
    bodyParser.json(),
    createGetRecords(getZones, config.dappyNetworkId, 'A')
  );
  router.get(
    '/:name/A',
    bodyParser.json(),
    createGetRecords(getZones, config.dappyNetworkId, 'A')
  );
  router.post(
    '/:name/AAAA',
    bodyParser.json(),
    createGetRecords(getZones, config.dappyNetworkId, 'AAAA')
  );
  router.get(
    '/:name/AAAA',
    bodyParser.json(),
    createGetRecords(getZones, config.dappyNetworkId, 'AAAA')
  );
  router.post(
    '/:name/TXT',
    bodyParser.json(),
    createGetRecords(getZones, config.dappyNetworkId, 'TXT')
  );
  router.get(
    '/:name/TXT',
    bodyParser.json(),
    createGetRecords(getZones, config.dappyNetworkId, 'TXT')
  );
  router.post(
    '/:name/CERT',
    bodyParser.json(),
    createGetRecords(getZones, config.dappyNetworkId, 'CERT')
  );
  router.get(
    '/:name/CERT',
    bodyParser.json(),
    createGetRecords(getZones, config.dappyNetworkId, 'CERT')
  );
  router.post(
    '/:name/CNAME',
    bodyParser.json(),
    createGetRecords(getZones, config.dappyNetworkId, 'CNAME')
  );
  router.get(
    '/:name/CNAME',
    bodyParser.json(),
    createGetRecords(getZones, config.dappyNetworkId, 'CNAME')
  );


  return router;
}
