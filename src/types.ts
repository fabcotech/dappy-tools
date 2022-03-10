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
  TLSA: RRTLSA[];
  A?: RRA[];
  AAAA?: RRAAAA[];
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

export type RecordType = 'A' | 'AAAA' | 'TLSA';

export type RRAData = string;
export type RRAAAAData = string;
export type RRTLSAData = string;

export type RRData = RRAData | RRAAAAData;
export type DNSClass = 'IN';

export type DNSQuestion = {
  type: RecordType;
  class: DNSClass;
  name: string;
};

export type RecordAnswer = {
  type: RecordType;
  class: DNSClass;
  name: string;
  ttl: number;
  data: RRData;
};

// DNS RCODEs in https://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml
export enum DNSReturnCode {
  NOERROR, // DNS Query completed successfully
  FORMERR, //  DNS Query Format Error
  SERVFAIL, // Server failed to complete the DNS request
  NXDOMAIN, //  Domain name does not exist.
  NOTIMP, //  Function not implemented
  REFUSED, // The server refused to answer for the query
  YXDOMAIN, //  Name that should not exist, does exist
  XRRSET, //  RRset that should not exist, does exist
  NOTAUTH, //  Server not authoritative for the zone
  NOTZONE, //  Name not in zone
}

// As described in https://datatracker.ietf.org/doc/html/rfc1035#section-4.1
export type DNSPacket = {
  type: 'query' | 'response';
  rcode: DNSReturnCode;
  id: number;
  flags: number;
  questions: DNSQuestion[];
  answers: RecordAnswer[];
  additionals: [];
  authorities: [];
};
