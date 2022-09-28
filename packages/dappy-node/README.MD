# Dappy-node

Dappy node is a [DoH](https://datatracker.ietf.org/doc/html/rfc8484) and an authoritative name server, written in [NodeJS](https://nodejs.org/).

Dappy zones and records are independent from [ICANN](https://www.icann.org/).
To avoid conflicts with existing TLDs, dappy zones are optionnaly suffixed with `.d`.

What makes dappy-node really unique is that zones are stored on a blockchain, therefore the state is automatically shared between the nodes of a given dappy network.

Persist name zone directly on the blockchains garantees:
- Records can't be falsified
- Data is highly available throught the network
- Very thin access control can be defined, (ex: a third party company can manage the zone for  *api.microsoft.com*)

Records are fetched with **co-resolution**, in a **trustless manner** by requesting network members in parallel. Distributing trust over network is an alternative solution to [DNSSEC](https://datatracker.ietf.org/doc/html/rfc4033).

[Read the dappy propositions](https://github.com/fabcotech/dappy-propositions)

## Get dappy-node

### Quick start-up

Run a dappy-node with memory zone provider using npx

```bash
# Run a dappy-node that save zones in memory
DAPPY_NODE_ZONE_PROVIDER=memory DAPPY_NODE_CACHING=0 npx @fabcotech/dappy-node

# Resolve example.d A record
dappy-lookup example.d A --endpoint=http://127.0.0.1:3001
```

### Other installation procedures

Please refer to [INSTALLATION.md](INSTALLATION.MD) if you want to install a standalone dappy-node or to join an existing Dappy network.

## Understanding Dappy-node

### Zone providers

Dappy-node abstracts how zones and records are persisted.

There are 3 zone providers availables:
- memory: for demo and development purpose. It contains a built-in zone `example` with some records. It is the easiest way to start and experiment dappy-node.
- rchain: for production purposes. Zones and records are persisted on blockchain [Rchain](https://rchain-community.github.io/)
- postgresql: for production purposes when confidentiality is needed. Zones and records are persisted on a pg instance.

Each of these zone providers have their own jobs and routes.

Use `DAPPY_NODE_ZONE_PROVIDER` environment variable to define zone_provider.

### DNS over HTTPS

Dappy-node is queryable over HTTPS. It implements [DoH](https://datatracker.ietf.org/doc/html/rfc8484) RFC. DNS packets are sent over HTTPS in binary format.

Under the hood, dappy-node use [dns-packet](https://github.com/mafintosh/dns-packet) to decode and encode DNS packets.

Every DoH clients can query dappy-node, it includes browsers like Chrome. Dappy provide a command line [dappy-lookup](https://github.com/fabcotech/dappy-lookup) that makes DoH queries. You can try it like this:

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
| DAPPY_NETWORK_SELF_HOSTNAME | Yes | `localhost1`, `fabco`, `anothermember` |
| DAPPY_LOG_PATH | Yes | `./logs` | path to log warning and errors |
| NODES_FILE | No |  |  |

if DAPPY_NETWORK_ID is `unknown`, the program will try to load a dappy network from the file `./dappyNetwork.js`.

DAPPY_NETWORK_SELF_HOSTNAME is your username in the dappy network, this is used to avoid gossiping messages to self. You can find it in any dappy network reference.

#### Environment variables read when rchain is used as zone provider

| **Keys** | **Required** | **Default value** | **Description** |
|---|---|---|---|
| DAPPY_NAMES_MASTER_REGISTRY_URI | Yes |  | rchain token master deployment |
| DAPPY_NAMES_CONTRACT_ID | Yes |  | rchain contract used for dappy name system |
| DAPPY_RCHAIN_VALIDATOR | Yes | `http://localhost:40403` | Rnode used to send transactions |
| DAPPY_RCHAIN_READ_ONLY | Yes | `http://localhost:40403` | Rnode used to query rchain data |
| DAPPY_RCHAIN_NETWORK | Yes | `unknown` | RChain network |
| DAPPY_RCHAIN_SHARD_NAME | Yes | `unknown` | RChain shard ID |
| DAPPY_JOBS_LOGS_CONTRACTS | Yes | | Ccomma-separated list of contracts you want to keep the logs |
| DAPPY_JOBS_REDIS_URL |  Yes | | Redis url format: `redis://HOST:PORT/DB` |
| DAPPY_RCHAIN_READ_ONLY_CERTIFICATE_FILENAME | Yes |  | Rnode certificate  |
| DAPPY_NODE_LAST_BLOCK_JOB_INTERVAL | Yes | `40000` | Interval in ms to fetch rchain data |
| DAPPY_NODE_START_JOBS | Yes | `false` |  |
| DAPPY_NODE_REDIS_DB | Yes | `1` | Redis database number |
| DAPPY_NODE_REDIS_HOST | Yes | `localhost` | Redis host |
| DAPPY_NODE_REDIS_PORT | Yes | `6379` | Redis port |
| DAPPY_NODE_CACHING_ZONE | Yes | `false` | Cache zones |

#### Environment variables read when postgresql is used as zone provider

| **Keys** | **Required** | **Default value (dev)** | **Description** |
|---|---|---|---|
| DAPPY_PG_CONNECTION_STRING | No | `postgresql://postgres:postgres@localhost:5432/dappy` | postgresql connection string |

### API Reference

Please read [API Reference](API.md) for more details.

### Kubernetes

#### Selection of namespace

You will probably have one namespace per dappy-node. Be careful to select the right one.

```
# Create a namespace (only at setup)
kubectl create ns node1-gamma

# See namespaces
kubectl get namespaces
> node1-gamma
> node2-gamma
> ...

# Pick namespace for the following operations
kubectl config set-context --current --namespace=node2-gamma
```

#### Secrets and certificates

To be written / todo

#### Checking of the pods

At the time this is written, a dappy-node should have 4 pods :
- `dappy-node-xxx` is the nodeJS / DoH endpoint
- `grafana-xxx` logs
- `prometheus-xxx` metrics

```
kubectl get pods
```

#### Updating pods / deploying

**Be careful** : as of today there for each namespace there are manual updates to do in some yml files before deploying pods - `kubectl apply` command.

**(1)** Update 3 lines in `kubernetes/envs/digitalocean/gamma/dappy/pg/dappy-node-ingress.yaml` so that the hostname matches with the hostname of your node in dappy-lookup codebase [src/dappyNetworks.ts](https://github.com/fabcotech/dappy-tools/blob/master/packages/dappy-lookup/src/dappyNetworks.ts). Example value : `node2.gamma.fabco.dappy`.

**(2)** Update 3 lines in `kubernetes/envs/digitalocean/gamma/dappy/pg/dappy-node-webpki-ingress.yaml` so that the public DNS subdomain you want to use to expose rnode. Example value : `node2.gamma.dappy.tech`.

```
# Deploying or updating all pods
# and services within a namespace
kubectl apply -k kubernetes/envs/digitalocean/gamma/dappy/pg/
```
