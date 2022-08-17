# Reference

## CLI commands

### lookup

Lookup name records in dappy network.

Positioned arguments:

1. name: `<name to lookup>`
2. record type: A, AAAA, CERT, TXT, CSP

Optional arguments:

- --network=`<network_id>`
- --endpoint=`<http_url>`
- --hostname=`<hostname>`
- --cacert=`<ca_cert_file_path>`
- --network-file=`<network_json_file_path>`

Built-in network ids are:

- d
- gamma

Examples:

```sh
# Lookup A records for example.dappy in dappy network (mainnet)
dappy-lookup example.dappy A

# Lookup A records for example.dappy in dappy gamma network
dappy-lookup example.dappy A --network=gamma

# Lookup A records for example.dappy using a custom dappy-node over http
dappy-lookup example.dappy A --endpoint=http://127.0.0.1:8080

# Lookup A records for example.dappy using a custom dappy-node over https
dappy-lookup example.dappy A --endpoint=https://127.0.0.1:443 --hostname=localhost --cacert=./cert.pem

# Lookup A records for example.dappy using a custom dappy-node network defined in a JSON config file
dappy-lookup example.dappy A --network-file=./custom-network.json
```

Here is the json config file scheme of a Dappy-node network:

```json
[
  {
    "ip": "<IP_ADDRESS>",
    "port": <PORT>,
    "hostname": "<HOSTNAME>",
    "scheme": "<HTTP | HTTPS>",
    "caCert": "<BASE_64_ENCODED_CA_CERTIFICATE>"
  }
]
```

### savecertificate

Retrieve certificates from Dappy name system.
They are saved as PEM format in the local file system.
If multiple certificates are found, they are suffixed with a number.

Positioned arguments:

1. name: `<certificate name>`

Optional arguments:

- --out=`<certificate_path>`
- --network=`<network_id>`
- --endpoint=`<http_url>`
- --hostname=`<hostname>`
- --cacert=`<ca_cert_file_path>`
- --network-file=`<network_json_file_path>`

Built-in network ids are:

- d
- gamma

Examples:

```sh
# Download example.dappy certificate(s) using dappy network (mainnet)
dappy-lookup savecertificate example.dappy

# Download example.dappy certificate(s) using gamma network, save it/them to custom path
dappy-lookup savecertificate example.dappy --out=customname.pem --network=gamma

# Download example.dappy certificate(s) using a custom dappy-node network defined in a JSON config file
dappy-lookup savecertificate example.dappy --network-file=./custom-network.json
```

## API Reference

### Methods

**`lookup()`**

```ts
function lookup(
  name: string,
  recordType: 'A' | 'AAAA' | 'CERT' | 'CSP' | 'CERT',
  options: {
    dappyNetwork: 'd' | 'gamma' | DappyNetworkMember[];
  }
) =>
  Promise<NamePacket>;

```

Co-resolve **A** record on DappyNS.

Co-resolve queries can produce different errors, you can read about them [here](REFERENCE.md#co-resolution-known-errors)

Example on d network (production):

```ts
const recordA = await lookup('example.dappy', 'A');
console.log(recordA);
```

Example on custom local network, using a [local dappy-node](https://github.com/fabcotech/dappy-node#quick-start-up):

```ts
const recordA = await lookup('example.dappy', 'A', [
  {
    scheme: 'http',
    hostname: 'localhost',
    port: '3001',
    ip: '127.0.0.1',
  },
]);
```

**`getCertificates()`**

```ts
function getCertificates(
  name: string
  options?: {
    dappyNetwork: 'd' | 'gamma' | DappyNetworkMember[];
  }
): Promise<NamePacket>
```

Get certificates for a particular name. Query is co-resolved through `option.dappyNetwork`. Certificates are decoded in utf-8.

Co-resolve queries can produce different errors, you can read about them [here](REFERENCE.md#co-resolution-known-errors)

Example:

```ts
const record = await getCertificates('example.dappy', {
  dappyNetwork: 'gamma',
});
const exampleCertificate = record.answers[0].data;
console.log(exampleCertificate);
```

**`coResolvePostJsonQuery()`**

```ts
function coResolvePostJsonQuery(
  query: {
    path: string;
    body: any;
  },
  options?: {
    dappyNetwork: 'd' | 'gamma' | DappyNetworkMember[];
  },
): Promise<NamePacket>;
```

Co-resolve a POST query using dappy network defined at `options.dappyNetwork`

Co-resolve queries can produce different errors, you can read about them [here](REFERENCE.md#co-resolution-known-errors)

Example:

```ts
const response = await coResolvePostJsonQuery(
  { path: '/ping' },
  { dappyNetwork: 'gamma' },
);
console.log(response);
```

**`nodeLookup()`**

```ts
 function nodeLookup(
    name: string,
    options?: {
      all?: boolean;
      family?: number;
      hints?: number;
      verbatim?: boolean;
    },
    callback: (err: Error, address: string, family: number) => void;
  ) => void;
}
```

`nodeLookup()` can be used by [HTTP](https://nodejs.org/api/http.html) and [HTTPS](https://nodejs.org/api/https.html) NodeJS modules to resolve names.

Example:

```ts
import { nodeLookup, lookup } from 'dappy-lookup';

const { answers: [{ data: ca }]} = await lookup('example.dappy', 'CERT')

https.get('https://example.dappy', {
  lookup: nodeLookup,
  ca
}, (res) => {
  ...
});
```

### Co-resolution known errors

- `unknown or malformed dappy network`: can't parse or identity dappy network
- `query ... not resolved: Unaccurate state`: Too many nodes sent a different answer.
- `Query ... not resolved: Out of nodes`: Not enough nodes sent an answer.

### Types

**NamePacket**

```ts
export type NamePacket = {
  version: string;
  type: 'query' | 'response';
  rcode: ReturnCode;
  id?: number;
  flags: number;
  questions: {
    type: 'A' | 'AAAA' | 'TXT' | 'CERT' | 'CSP';
    class: 'IN';
    name: string;
  }[];
  answers: {
    type: 'A' | 'AAAA' | 'TXT' | 'CERT' | 'CSP';
    class: 'IN';
    name: string;
    ttl: number;
    data: string;
  }[];
  additionals: [];
  authorities: [];
};

export enum ReturnCode {
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
```

**DappyNetwork**

```ts
export type DappyNetwork = DappyNetworkId | DappyNetworkMember[];

export type DappyNetworkId = 'd' | 'gamma';

export type DappyNetworkMember = {
  scheme: 'https' | 'http';
  hostname: string;
  port: string;
  caCert?: string;
  ip: string;
};
```
