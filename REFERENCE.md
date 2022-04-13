# Reference

## CLI commands

### lookup

### savecertificate

## API Reference

### Methods

**`lookup()`**

```ts
function lookup(
  name: string,
  recordType: 'A' | 'AAAA' | 'CERT',
  options: {
    dappyNetwork: 'd' | 'gamma';
  }
) =>
  Promise<NamePacket>;

```

Co-resolve **A** record on DappyNS.

Co-resolve queries can produce different errors, you can read about them [here](REFERENCE.md#co-resolution-known-errors)

Example:

```ts
const recordA = await lookup('example.dappy', 'A');
console.log(recordA);
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

`lookup()` can be used by [HTTP](https://nodejs.org/api/http.html) and [HTTPS](https://nodejs.org/api/https.html) NodeJS modules to resolve names.

Example:

```ts
import { nodeLookup, lookup } from 'dappy-lookup';

https.get('https://example.dappy', {
  lookup: nodeLookup,
  ca: await lookup('example.dappy', 'CERT'),
}, (res) => {
  ...
});
```

**`getCertificates()`**

```ts
function getCertificates(
  name: string
  options?: {
    dappyNetwork: 'd' | 'gamma';
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

**`coResolvePostJsonQuer()`**

```ts
function coResolvePostJsonQuery(
  query: {
    path: string;
    body: any;
  },
  options?: {
    dappyNetwork: 'd' | 'gamma';
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

**`dappyNetworks`**

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
    type: 'A' | 'AAAA' | 'TXT' | 'CERT';
    class: 'IN';
    name: string;
  }[];
  answers: {
    type: 'A' | 'AAAA' | 'TXT' | 'CERT';
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
