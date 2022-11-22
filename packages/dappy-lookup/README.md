### dappy-lookup

A library written in Typescript that resolves any type of record (A, AAAA, CERT) on a dappy name system with co-resolution over HTTPS (DoH).

[dappy website](https://dappy.tech)

[docs for domain purchase and management](http://docs.dappy.tech/)

[dappy-tools repository](https://github.com/fabcotech/dappy-tools)

#### Try it with the CLI

```sh
npx @fabcotech/dappy-lookup fabcotech A --network=gamma
```

#### Building and testing

```sh
# In dappy-tools root
npm i & npx lerna bootstrap

# In dappy-tools/packages/gossip
npm i

# test
npm run test

# build
npm run build
```

#### Using in any web nodeJS repository

```sh
npm i -S @fabcotech/dappy-lookup
```

### Examples

### Stand-alone dappy lookup

Here is an example to get you started:

```typescript
import { lookup } from '@fabcotech/dappy-lookup';

async function run() {
    // lookup the A records for example.dappy on d network
    const packetA = await lookup('example.dappy', 'A');
    console.log(packet);

    // lookup the AAAA records for example.dappy on d network
    const packetAAAA = await lookup('example.dappy', 'AAAA');
    console.log(packet);

    // lookup the CERT records for example.dappy on d network
    const packetCERT = await lookup('example.dappy', 'CERT');
    console.log(packet);
});

run();
```

This example above will resolve a name on default dappy network which is the `d` network, which is the DappyNS production ready network.

Next example do the same but on `gamma` network (used for testing purposes)

```typescript
import { lookup } from '@fabcotech/dappy-lookup;

async function run() {
    // lookup the A records for example.dappy on gamma network
    const packetA = await lookup('example.dappy', 'A', { network: 'gamma' });
    console.log(packetA);
});

run();
```

### NodeJS request using dappy-lookup with CA certificate retrieval

It's a really a pain point to get a valid CA certificate and to install it at operating system level.

On DappyNS, name servers not only distribute IPv4 (**A** records) and IPv6 addresses (**AAAA** records) but also certificates to trust over **CERT** records (alternative of [DANE](https://datatracker.ietf.org/doc/html/rfc6698)). It enable dappy-lookup client to fetch dynamically and in a trusted manner (using coresolution mecanism) CA certificates.

The example below demonstrates how to do this:

```typescript
import { lookup, nodeLookup } from '@fabcotech/dappy-lookup;

const { answers: [{ data: ca }]} = await lookup('example.dappy', 'CERT')

https.get('https://example.dappy/', {
    lookup: nodeLookup,
    ca,
}, (res) => {
  ...
});
```

NodeJS enables to override [lookup function](https://nodejs.org/api/http.html#httprequesturl-options-callback) for [HTTP](https://nodejs.org/api/http.html) and [HTTPS](https://nodejs.org/api/https.html) native modules.

So dappy-lookup provide a lookup function (created with `nodeLookup`) with the same signature as [dns.lookup](https://nodejs.org/api/dns.html#dnslookuphostname-options-callback) provided by NodeJS.

### NodeJS requests using dappy-lookup

The example below shows how to replace native NodeJS lookup function with the dappy-lookup equivalent function. In this example the certificate is not recovered dynamically, it is installed previously on the operating system.

```typescript
import { nodeLookup } from '@fabcotech/dappy-lookup;

https.get('https://example.dappy/', {
    lookup: nodeLookup,
}, (res) => {
  ...
});
```

## Reference

Please read [Reference](REFERENCE.md) to learn more about CLI commands and api.
