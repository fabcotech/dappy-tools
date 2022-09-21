### Gossip

Utils use to sign, verify and air messages sent between and to nodes of the dappy network for zone management.

#### Sign a message

Signs a message (`data` in our case) with a private key

```typescript
import { publicKeyFromPrivateKey, signZoneTransaction } from "@fabcotech/gossip";

const privateKey = "aaa";

const publicKey = publicKeyFromPrivateKey(privateKey);
const zone = {
  origin: "apple",
  records: {
    host: '@', type: 'TXT', value: 'OWNER=' + publicKey
  }
}
const payload = {
  data: {
    zone: zone,
    date: new Date().getTime()
  }
}

const signature = signZoneTransaction(payload.data, privateKey, 'hex')
const zoneTransactionWithSignature = {
  ...payload,
  signature: signature
}
```

#### Check a message

Checks the message (`data`) is valid :
- Date (`data.date`) should be between 10 minutes ago and now.
- Cryptographic signature of `data -> JSON.stringify -> blake2 hash` should match public key.

```typescript
import { publicKeyFromPrivateKey, signZoneTransaction } from "dummychain";

// either throws or returns true
checkZoneTransaction(
  publicKey, // public key comes from an external / unknown source
  zoneTransactionWithSignature
)
```

#### Gossip

Send a message to a dappy network, will retry 3 times (hardcoded) with a delay of 8000ms (configurable) if response status code is not 200.

```typescript
import https from "https";
import { gossip } from "@fabcotech/gossip";
import { dappyNetworks } from "@fabcotech/dappy-lookup";

gossip(
  dappyNetworks["d"],
  (dnm) => {
    return new Promise((reso, reje) => {
      const options = {
        minVersion: 'TLSv1.3',
        rejectUnauthorized: true,
        ca: dnm.caCert,
        host: dnm.ip,
        method: 'POST',
        port: dnm.port,
        path: `/gossip`,
        headers: {
          'Content-Type': 'application/json',
          Host: dnm.hostname,
        },
      };
      const req = https.request(options, (res) => {
        if (res.statusCode === 200) {
          reso(true);
        } else {
          reje('Status code not 200')
        }
      });
      req.on('error', err => {
        reje(err)
      })
      req.end()
    })
  }
).then((results) => {
  /*
    results is an array of
    string(error) | Error(error) | true(success)
  */
  console.log(results);
})
.catch((err) => {
  console.log('critical error gossip should never fail');
  console.log(err);
})
```