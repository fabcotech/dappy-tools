export type DappyNetworkId = 'dNetwork' | 'gamma';

export type DappyNetwork = DappyNetworkId | DappyNetworkInfo[];

export interface DappyNetworkInfo {
  scheme: 'https' | 'http';
  hostname: string;
  port: string;
  caCert: string;
  ip: string;
}

export interface DappyLookupOptions {
  dappyNetwork: DappyNetwork;
}

export interface DappyRecordValue {
  value: string;
  kind: string;
}

export interface DappyRecord {
  values: DappyRecordValue[];
  ca: string[];
}
