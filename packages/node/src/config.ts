import path from 'path';
import fs from 'fs';
// import { ReadFile } from 'fs';

import {
  dappyNetworks,
  DappyNetworkId,
  DappyNetworkMember,
} from '@fabcotech/dappy-lookup';

const DAPPY_CONFIG_FILE_NAME = 'dappyrc';
const DAPPY_BROWSER_MIN_VERSION = '0.5.4';

const numberOr = (defaultValue: any, value: any) => {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value;
  }
  return defaultValue;
};

const createMustBeDefined =
  (predicat: () => boolean) => (envVarName: string) => {
    const envValue = process.env[envVarName];
    if (predicat() && (!envValue || envValue.length === 0)) {
      throw new Error(`${envVarName} can't be empty`);
    }
    return envValue;
  };

let config: ReturnType<typeof initConfig> = {} as any;

export const getConfig = () => config;

export function initConfig() {
  // eslint-disable-next-line
  require('dotenv').config({
    path: path.resolve(process.cwd(), DAPPY_CONFIG_FILE_NAME),
  });

  const mustBeDefinedWhenRchain = createMustBeDefined(
    () => process.env.DAPPY_NODE_ZONE_PROVIDER === 'rchain'
  );

  const cfg = {
    dappyBrowserMinVersion: DAPPY_BROWSER_MIN_VERSION,
    dappyBrowserDownloadLink: `https://github.com/fabcotech/dappy/releases/tag/${DAPPY_BROWSER_MIN_VERSION}?warning`,

    dappyNamesMasterRegistryUri: mustBeDefinedWhenRchain(
      'DAPPY_NAMES_MASTER_REGISTRY_URI'
    ),
    dappyNamesContractId: mustBeDefinedWhenRchain('DAPPY_NAMES_CONTRACT_ID'),

    rchainValidator:
      process.env.DAPPY_RCHAIN_VALIDATOR || 'http://localhost:40403',
    rchainReadOnly:
      process.env.DAPPY_RCHAIN_READ_ONLY || 'http://localhost:40403',
    rchainReadOnlyCertificateFilename:
      process.env.DAPPY_RCHAIN_READ_ONLY_CERTIFICATE_FILENAME,
    rchainNetwork: process.env.DAPPY_RCHAIN_NETWORK || 'unknown',
    rchainShardId: process.env.DAPPY_RCHAIN_SHARD_NAME || '',

    dappyNodeHttpPort:
      parseInt(process.env.DAPPY_NODE_HTTP_PORT || '', 10) || 3001,
    dappyNodeHttpsPort: parseInt(process.env.DAPPY_NODE_HTTPS_PORT || '', 10),
    dappyNodeDnsPort: parseInt(process.env.DAPPY_NODE_DNS_PORT || '', 10),
    dappyNodePrivateKeyFilename:
      process.env.DAPPY_NODE_PRIVATE_KEY_FILENAME || './dappynode.key',
    dappyNodeCertificateFilename:
      process.env.DAPPY_NODE_CERTIFICATE_FILENAME || './dappynode.crt',
    dappyNodeVersion: '0.2.8',
    dappyNodeZoneProvider: process.env.DAPPY_NODE_ZONE_PROVIDER || 'rchain',
    dappyNodeCaching: numberOr(
      60,
      parseInt(process.env.DAPPY_NODE_CACHING || '', 10)
    ),
    dappyNodeCachingZone: process.env.DAPPY_NODE_CACHING_ZONE === 'true',
    dappyNodeFiles: process.env.NODES_FILE,
    dappyNodeEnableRequestMetrics:
      process.env.DAPPY_NODE_ENABLE_REQUEST_METRICS === 'true',
    dappyNodeSentryUrl: process.env.DAPPY_NODE_SENTRY_URL,
    dappyNodeLastBlockJobInterval:
      parseInt(process.env.DAPPY_NODE_LAST_BLOCK_JOB_INTERVAL || '', 10) ||
      40000,
    dappyNodeStartJobs: process.env.DAPPY_NODE_START_JOBS === 'true',
    dappyNetworkId: process.env.DAPPY_NETWORK_ID || 'none',
    dappyNetworkSelfHostname:
      process.env.DAPPY_NETWORK_SELF_HOSTNAME || 'localhost',
    dappyNetwork: [] as DappyNetworkMember[],
    dappyLogPath: process.env.DAPPY_LOG_PATH || './logs',

    redisDb: process.env.DAPPY_NODE_REDIS_DB || 1,
    redisHost: process.env.DAPPY_NODE_REDIS_HOST || 'localhost',
    redisPort: parseInt(process.env.DAPPY_NODE_REDIS_PORT || '', 10) || 6379,
  };

  if (cfg.dappyNetworkId === 'unknown') {
    try {
      cfg.dappyNetwork = JSON.parse(fs.readFileSync(
        path.resolve(
          process.cwd(),
          'dappyNetwork.json'
        ),
        'utf8'
      )).network;
      console.log('Dappy network loaded from ./dappyNetwork.js');
    } catch (err) {
      console.log(
      `Dappy network is unknown and ./dappyNetwork.js does not exist,
maybe you want to set DAPPY_NETWORK_ID=none ?`
      );
      process.exit(1);
    }
  } else if (dappyNetworks[cfg.dappyNetworkId as DappyNetworkId]) {
    cfg.dappyNetwork = dappyNetworks[cfg.dappyNetworkId as DappyNetworkId];
    console.log(
      `Will use dappy network ${cfg.dappyNetworkId} with ${
        Object.keys(cfg.dappyNetwork).length
      } members for gossip !`
    );
  } else {
    console.log(`Dappy network ${cfg.dappyNetwork} not found`);
    process.exit(1);
  }

  if (
    cfg.dappyNetwork.find((a: any) => {
      return a.hostname === cfg.dappyNetworkSelfHostname;
    })
  ) {
    console.log('Identified self in dappy network !');
  } else {
    console.log(
      `hostname ${cfg.dappyNetworkSelfHostname} was not found in dappy network`
    );
    process.exit(1);
  }

  config = cfg;

  return cfg;
}
