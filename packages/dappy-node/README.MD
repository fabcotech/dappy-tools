# Dappy-node

Dappy node is a [DoH](https://datatracker.ietf.org/doc/html/rfc8484) and an authoritative name server, written in [NodeJS](https://nodejs.org/). It is a core component of the [dappy](https://dappy.tech) protocol and ecosystem.

Dappy node is currently available with three connectors for storing the zones : memory (dev), postreSQL (production) and RChain (blockchain, experimental).

[dappy website](https://dappy.tech)

[docs for domain purchase and management](http://docs.dappy.tech/)

[dappy-tools repository](https://github.com/fabcotech/dappy-tools)

### Quick start

Run a dappy-node with memory zone provider using npx

```bash
# Run a dappy-node that save zones in memory
DAPPY_NODE_ZONE_PROVIDER=memory DAPPY_NODE_CACHING=0 npx @fabcotech/dappy-node

# Resolve example.d A record
dappy-lookup example.d A --endpoint=http://127.0.0.1:3001
```

### Build and test

```sh
# In dappy-tools root
npm i & npx lerna bootstrap

# In dappy-tools/packages/dappy-node
npm i
npm run build

# test
npm run test
```

## Understanding dappy-node

### Zone providers

Dappy-node abstracts how zones and records are persisted.

There are 3 zone providers availables:
- memory: for demo and development purpose. It contains a built-in zone `example` with some records. It is the easiest way to start and experiment dappy-node.
- postgresql: for production purposes when confidentiality is needed. Zones and records are persisted on a pg instance.
- rchain: experimental provider that connects with a RChain (L1) deployment.

Each of these zone providers have their own jobs and routes.

Use `DAPPY_NODE_ZONE_PROVIDER` environment variable to define zone_provider.

### DNS over HTTPS

Dappy-node is queryable over HTTPS. It implements [DoH](https://datatracker.ietf.org/doc/html/rfc8484) RFC. DNS packets are sent over HTTPS in binary format.

Under the hood, dappy-node use [dns-packet](https://github.com/mafintosh/dns-packet) to decode and encode DNS packets.

Every DoH clients can query dappy-node, it includes browsers like Chrome. Dappy provide a command line [dappy-lookup](https://github.com/fabcotech/dappy-tools/tree/master/packages/dappy-lookup) that makes DoH queries. You can try it like this:

```sh
npx @fabcotech/dappy-lookup example.d A --endpoint=http://127.0.0.1:3001
```

## Support

We are open to, and grateful for, any contributions made by the community.

### Report a bug

We use the issue tracker to keep track of bugs and improvements to dappy-node itself and the documentation. We encourage you to open issues to discuss improvements, architecture, theory, internal implementation, etc. If a topic has been discussed before, we will ask you to join the previous discussion.

## Reference

### Command line tools

dappy-node repository contains several command lines tools.

- **easyrnode**: It helps to work with a local rchain node using the following commands/arguments:
  - **init**: create files `.rnode/genesis/bonds.txt` and `rnode/genesis/wallets.txt` needed to bootstrap rchain
  - **run**: run docker compose [file](src/bin/easyrnode/commands/assets/docker-compose.yml), which starts the latest images of [rnode](https://hub.docker.com/r/rchain/rnode) and [redis](https://hub.docker.com/_/redis)
  - **deploy**: deploys a rholang file, --phlo-limit, --phlo-price, --private-key and --host have default values that can be overwritten. Example: `easyrnode deploy ./example.rho --wait`
  - **help**: display help for each command. Example: `easyrnode help deploy`
- **dappy-deploy-name-system**: deploy dappy name system master on rchain. Arguments:
   - --validator: url to rchain node validator
   - --privatekey: private key used to deploy dappy name system master
   - --boxid: boxId used to deploy domain tokens
   - --contractid: contract token created
- **dappy-node**: DoH server. Configuration is described below
### dappy-node configuration

dappy-node is configurable through environments variables.
To be more convenient, dappy-node try to load a [.env file](https://github.com/motdotla/dotenv) named `dappyrc` at startup.

Below, here are all environments variables read by dappy-node.
#### General environment variables

| **Keys** | **Required** | **Default value** | **Description** |
|---|---|---|---|
| DAPPY_NODE_ZONE_PROVIDER | No | `rchain` | Zone provider used |
| DAPPY_NODE_DNS_PORT | No | | dappy-node dns port, disabled if not provided  |
| DAPPY_NODE_HTTP_PORT | Yes | `3001` | dappy-node http port  |
| DAPPY_NODE_HTTPS_PORT | No |  | dappy-node https port. HTTPS is disabled if not defined |
| DAPPY_NODE_PRIVATE_KEY_FILENAME | No | `dappynode.key` | dappy-node private key. Generated if not exists |
| DAPPY_NODE_CERTIFICATE_FILENAME | No | `dappynode.crt` | dappy-node certificate. Generated if not exists |
| DAPPY_NODE_CACHING | Yes | `60` | record ttl cache. Disabled if set to `0` |
| DAPPY_NODE_ENABLE_REQUEST_METRICS | Yes | `false` | Activate metrics |
| DAPPY_NODE_SENTRY_URL | No | `false` | Send logs to sentry |
| DAPPY_NETWORK_ID | Yes | `unknown`, `gamma`, `beta` or `d` |
| DAPPY_NETWORK_MASTER_PUBLIC_KEY | No | `04ea33c...` | Public key to check messages for zone creation (dappy network master) |
| DAPPY_NETWORK_FILE | No | `File path of a dappy network .json file` |
| DAPPY_LOG_PATH | Yes | `./logs` | path to log warning and errors |

if DAPPY_NETWORK_ID is `unknown`, the program will try to load a dappy network from the file `./dappyNetwork.js`.

#### Environment variables read when postgresql is used as zone provider

| **Keys** | **Required** | **Default value (dev)** | **Description** |
|---|---|---|---|
| DAPPY_PG_CONNECTION_STRING | No | `postgresql://postgres:postgres@localhost:5432/dappy` | postgresql connection string |
| DAPPY_NETWORK_MEMBER_TO_DOWNLOAD_ZONES_FROM | No | `` | the network member hostname you want to download zones from |
| DOWNLOAD_ZONES_IF_EMPTY | No | `false` | do you want to download the zones if there are zero zones in pg (setup) |
| DAPPY_NETWORK_ID | No | `local` | ID of the dappy network you want to connect to |
| DAPPY_NETWORK_MASTER_PUBLIC_KEY | No | `04ea33c4...` | The public key of the entity able to send new zones |

### API Reference

Please read [API Reference](API.md) for more details.


### Kubernetes

[Kubernetes guide](./kubernetes/KUBERNETES.MD)