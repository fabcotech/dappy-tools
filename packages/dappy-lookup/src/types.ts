import { DappyNetwork } from './model';

export * from './model';

export * from './utils/json';

export type DappyLookupOptions = {
  dappyNetwork: DappyNetwork;
};

export type DappyDohServerOptions = {
  dappyNetwork: DappyNetwork;
  port: number;
};
