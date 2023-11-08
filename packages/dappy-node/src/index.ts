import 'dotenv/config';

import { startZoneProvider } from './ZoneProviders';
import { startHttpServers, startDnsServer } from './server';
import { initConfig } from './config';

async function start() {
  initConfig();
  await startZoneProvider();
  startHttpServers();
  startDnsServer();
}

start();
