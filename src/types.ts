export type DappyNetworkId = 'dNetwork' | 'gamma';

export type DappyNetwork = DappyNetworkId | string[];

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
