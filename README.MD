## Bees js

General purpose 0 dependency NodeJS library for reading in distributed ledgers or distributed databases in a trustless manner.

Beesjs has been initiated in the dappy project [dappy.tech](https://dappy.tech), to address the problem of unique trustful API endpoints in name systems like the DNS, and more broadly the problem of reading the blockchain state without trusting a node.

```bash
npm install beesjs
```

### Use

Beesjs does not know how to query the network, the first argument of `resolve` is a function that performs the request and returns a string. Each string will then be compared by Bees, until the multi-request either fails or completes.

```javascript
import { resolver } from 'beesjs';

resolve(
  (id) => {
    return new Promise((resolve, reject) => {
      // this request includes DNS and CA, you are free
      // to query any endpoint any way you want
      https.get(`https://${id}`, (res) => {
        let s = '';
        res.on('data', (d) => {
          s += d.toString('utf8')
        });
        res.on('end', (d) => {
          resolve({
            type: 'SUCCESS',
            data: s,
            id: id,
          });
        });
      }).on('error', (e) => {
        console.log(e);
        resolve({
          type: 'ERROR',
          status: 500,
          id: id,
        });
      });
    });
  },
  /*
    ids
    IDs of the nodes that we want to hit/query
  */
  ['nodea.org', 'nodeb.org'],
  /*
    resolverAccuracy
    The group of [resoverAbsolute] must represent 100% of
    all successful answers
  */
  100,
  /*
    resoverAbsolute
    We want a group of 2 members to represent [resolverAccuracy]% of
    the total of succesful answers
  */
  2,
  a => a
)
  .then(resp => {
    if (resp.statue === "completed") {
      console.log('multi-request / co-resolution succeeded'):

      // resp contains all the groups of answers, you have to iterate over
      // the keys to know which group is the most important
      let winnerGroup = {
        data: '',
        ids: [],
      };
      Object.keys(resp.loadState).forEach((key) => {
        if (resp.loadState[key].ids.length > data.ids.length) {
          winnerGroup = {
            data: resp.loadState[key].data,
            ids: resp.loadState[key].ids,
          };
        }
      });

      console.log(`result of multirequest ${winnerGroup.ids.length} nodes in winning group :`);
      console.log(winnerGroup);
    } else {
      console.log('multi-request / co-resolution did not succeed');
      console.log(resp);
    }
  })
  .catch(err => {
    console.log('something went wrong');
    throw err;
  })
```

### Test and build

```bash
# test
npm run test

# build
npm run build && npm run build:declaration
```