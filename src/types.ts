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

export type ResourceRecord = {
  name: string;
  ttl?: number;
};

// Simplified version of A RR from RFC 1035
export type RRA = ResourceRecord & {
  ip: string;
};

// Simplified version of AAAA RR from RFC 1035
export type RRAAAA = ResourceRecord & {
  ip: string;
};

export enum CertificateUsage { // ignored
  CA_CONSTRAINT,
  SERVICE_CERTIFICATE_CONSTRAINT,
  TRUST_ANCHOR_ASSERTION,
  DOMAIN_ISSUED_CERTITICATE, // default value
}

export enum CertificateType { // ignored
  FULL_CERTIFICATE, // default value
  SUBJECT_PUBLIC_KEY_INFO,
}

export enum CertificateMatchingType { // ignored
  EXACT_MATCH,
  SHA_256, // default value
  SHA_512,
}

// TLSA resource record (RR) from RFC 6698 about DANE
// https://datatracker.ietf.org/doc/html/rfc6698#section-2.1
export type RRTLSA = ResourceRecord & {
  certUsage: CertificateUsage;
  selector: CertificateType;
  matchingType: CertificateMatchingType;
  cert: string;
};

export type DappyZone = {
  $origin: string;
  $ttl?: number;
  tlsa: RRTLSA[];
  a?: RRA[];
  aaaa?: RRAAAA[];
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
