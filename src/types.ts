export type DappyNetworkId = 'd' | 'gamma';

export type DappyNetwork = DappyNetworkId | DappyNetworkMember[];

export type DappyNetworkMember = {
  scheme: 'https' | 'http';
  hostname: string;
  port: string;
  caCert?: string;
  ip: string;
};

export type DappyLookupOptions = {
  dappyNetwork: DappyNetwork;
};

export type DappyRecordValue = {
  value: string;
  kind: string;
};

export type DappyRecord = {
  values: DappyRecordValue[];
  ca: string[];
};

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
