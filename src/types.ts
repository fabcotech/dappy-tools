export type DappyNetworkId = 'dNetwork' | 'gamma';

export type DappyNetwork = DappyNetworkId | DappyNetworkMember[];

export interface DappyNetworkMember {
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

export type DappyNodeErrorResponse = {
  success: false;
  error: {
    message: string;
  };
};

export type DappyNodeSuccessResponse = {
  success: true;
  records: {
    data: string;
  }[];
};

export type DappyNodeResponse =
  | DappyNodeErrorResponse
  | DappyNodeSuccessResponse;
