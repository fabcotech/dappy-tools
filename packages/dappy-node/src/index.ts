import 'dotenv/config';

import { startZoneProvider } from './ZoneProviders';
import { startHttpServers, startDnsServer } from './server';

async function start() {
  await startZoneProvider();
  startHttpServers();
  startDnsServer();
}

start();
