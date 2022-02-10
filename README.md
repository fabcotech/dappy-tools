# Dappy resolve

A library that resolves names from dappy name system (written in Typescript).

# Dappy documentation

You can find Dappy documentation [here](https://fabco.gitbook.io/dappy-spec/).

## Installing

### Node.js

```sh
npm i -S dappy-lookup
```

## You don't have a dappy name ? Mint in one.

Using dappy-browser,

## Examples

### Stand-alone dappy lookup

Here is an example to get you started:

```typescript
import { lookup } from 'dappy-lookup';

async function run() {
    const record = await lookup('your-dappy-name'); 
    console.log(record);
});

run();
```

This example above will resolve a name on default dappy networki which is the `mainnet` network.

Next example do the same but on `gamma` network

```typescript
import { lookup } from 'dappy-lookup';

async function run() {
    const record = await lookup('your-dappy-name', { network: 'gamma' }); 
    console.log(record);
});

run();
```

### NodeJS requests using dappy-lookup

The example below shows how to replace native NodeJS lookup function with the dappy-lookup equivalent function.

```typescript
import { createNodeLookup } from 'dappy-lookup';

const { lookup } = createNodeLookup();

https.get('https://your-dappy-name/', {
    lookup,
}, (res) => {
    console.log(data);
});
```

NodeJS enables to override [lookup function](https://nodejs.org/api/http.html#httprequesturl-options-callback) for [HTTP](https://nodejs.org/api/http.html) and [HTTPS](https://nodejs.org/api/https.html) native modules. 

So dappy-lookup provide a lookup function (created with `createNodeLookup` factory function) with the same signature as [dns.lookup](https://nodejs.org/api/dns.html#dnslookuphostname-options-callback) provided by NodeJS.

### NodeJS request using dappy-lookup with CA certificate retrieval

It's a really a pain point to get a valid CA certificate and to install it at operating system level. 

On dappy name system, name records not only store addresses but also CA certificates.
So, dappy-lookup enable to retrieve CA certificate associated with the address in the same requet. The example below demonstrates how to do this:

```typescript
import { createNodeLookup } from 'dappy-lookup';

const { getCA, lookup } = createNodeLookup();

https.get('https://your-dappy-name/', {
    lookup,
    ca: await getCA('your-dappy-name'),
}, (res) => {
    console.log(data);
});
```

## API

### lookup

```ts
type lookup = (name: string, options: LookupOptions) => Promise<Record>

interface LookupOptions {
    cacheMaxHit: number;
    cacheTTL: number;
    network: DappyNetwork;
}

interface Record {
    addresses: string[],
    ca: string[],
    ...
}
```

### createNodeLookup

```ts
type createNodeLookup = (options: LookupOptions) => { lookup: nodeLookup, getCA: getCA}

interface LookupOptions {
    cacheMaxHit: number;
    cacheTTL: number;
    network: DappyNetwork;
}

type DappyNetwork = 'mainnet' | 'gamma';

type getCA = (name: string) => Promise<string[]>;

// Same interface as [NodeJS dns.lookup](https://nodejs.org/api/dns.html#dnslookuphostname-options-callback)
type nodeLookup = (name: string, options?: Options, callback: Callback) => void

interface Options {
  all?: boolean;
  family?: number;
  hints?: number;
  verbatim?: boolean;
}

type Callback = (err: Error, address: string, family: number) => void;
```


