Bees js is a javascript library that retreives data from public distributed ledgers, and decides which answer to reject or accept. It's goal is to have a reliable second layer of consensus logic made at light clients level.

#### The situation

Blockchain and more generally public DLS (decentralized ledger systems) are cool. They are a public, trustless (or a least more trustless than centralized entities) database/ledgers we can store data and even host logic onto (with smart contracts). As time advances, different solutions are getting more and more close to some actual industry-scale infrastructure we can safely rely on, and build business solutions on.

#### The problem of light clients

Often a node proposes two APIs:

- The main API : it is the first-layer API that makes this node a valid node (has the last block, sends the blocks and their sontent when asked by other nodes etc...).

- The second-layer API: it is often a user/dapp oriented API, it allows clients to simply get some balance at an address, or get some value in a smart-contract, this API **is not mandatory because it is not part of the consensus mechanism** . Nodes can choose to have a second-layer API or not, they can choose to tweak the answers if they want (for example tell that Bob has 2 bitcoins instead of 0). It is often very costly in term of hardware and bandwith to run a public second-layer API. In Ethereum and EOS it is called RPC API.

This might evolve in the future but right now, public API/RPC API available for ethereum and EOS (there are probably other examples), are not mandatory and do not stand at consensus-level. It means that any node can be a regular/valid node and at the same way lying

There are already lots of dapps in the wild in 2018, the problem is that they often rely on some third party server/service to interact with the blockchain/DLS. This third party will tell the clients its "version" of the state at time `t`, event if it may be on a fork, client wont notice it and eventually react the wrong way for any reason.

**Clients have no way to easily interact with a set of public nodes, and guess if some nodes are lying, or some nodes are on a fork, they must rely on some private/public third party centralized server that makes them not dapp anymore.**

**Bees JS's goal is to help you make sense answers received from some nodes/servers that might lie or be in some way not in sync with the ledger you are interogating.**

### Install

```

npm install beesjs

```

### Use

```javascript
resolve(query, urlsToQuery, settings).subscribe({
  next: resp => console.log(resp),
  complete: () => console.log("completed"),
  error: resp => console.error(resp)
});
```

The resolve function takes 3 parameters and returns a stream (xstream) you can subscribe to.

The first is the `query` object:

```typescript
interface Query {
  path: string;
  parameters: { [key: string]: any };
  method: "get" | "post" | "put";
}

ex: {
  path: "/version";
  parameters: {
  }
  method: "get";
}
```

The second is the urls to query

```typescript

type  UrlsToQuery = string[]

ex: [
  "https://564.786.675.9",
  "https://aserverinthenetwork.com",
  "https://12.886.65.10",
  "https://someserver.com",
  "https://someotherserver.com",
  "https://node2.someotherserver.com",
  "https://node3.someotherserver.com",v
  "http://somenonssl.com",
],

```

And then the settings

The `resolverAbsolute` represents the amount of nodes we want to send the same answer to consider the response accurate.

The `resolverAccuracy` represents the percentage of different answers (in comparison with the group the has the maximum same answers) we are willing to tolerate.

```typescript

interface  Settings {
  resolverAbsolute: number; // defauts to 3
  resolverAccuracy: number; // defauts to 100
}

ex: {
  resolverAbsolute: 3,
  resolverAccuracy: 100,
}

```

### Example

```javascript
let response = undefined;

resolve(
  {
    path: "/get_value_ofvariable",
    parameters: { key: "users" },
    method: "post"
  },
  [
    "https://564.786.675.9",
    "https://aserverinthenetwork.com",
    "https://someserver.com",
    "https://someotherserver.com"
  ],
  {
    resolverAbsolute: 2,
    resolverAccuracy: 100
  }
).subscribe({
  next: resp => {
    response = resp;
  },
  complete: () => {
    console.log("completed");
    console.log("final state is", response);
  },
  error: resp => console.error(resp)
});
```
