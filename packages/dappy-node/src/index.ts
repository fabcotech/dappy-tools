import 'dotenv/config';

import { startZoneProvider } from './ZoneProviders';
import { initCache } from './cache';
import { startHttpServers, startDnsServer } from './server';
import { initStore } from './store';
import { initConfig } from './config';

async function start() {
  const config = initConfig();
  initStore();

  if (config.dappyNodeCaching) {
    initCache();
  }

  await startZoneProvider();
  startHttpServers();
  startDnsServer();
}

start();
