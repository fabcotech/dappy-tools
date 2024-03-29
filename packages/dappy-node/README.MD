# Dappy-node

Dappy node is a [DoH](https://datatracker.ietf.org/doc/html/rfc8484) and an authoritative name server, written in [NodeJS](https://nodejs.org/). It is a core component of the [dappy](https://dappy.tech) protocol and ecosystem.

Dappy node is currently available with three connectors for storing the zones : memory (dev) and postreSQL (production).

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

# Build the npm lib from dappy-tools/packages/dappy-node
npm i
npm run build

# Build the docker image from dappy-tools/
docker build . -f ./packages/dappy-node/Dockerfile -t dappynodelocal

# test
npm run test
```

## Understanding dappy-node

### Zone providers

Dappy-node abstracts how zones and records are persisted.

There are 3 zone providers availables:

- memory: for demo and development purpose. It contains a built-in zone `example` with some records. It is the easiest way to start and experiment dappy-node.
- postgresql: for production purposes when confidentiality is needed. Zones and records are persisted on a pg instance.

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

### dappy-node configuration

dappy-node is configurable through environments variables.
To be more convenient, dappy-node try to load a [.env file](https://github.com/motdotla/dotenv) named `dappyrc` at startup.

Below, here are all environments variables read by dappy-node.

#### General environment variables

| **Keys**                          | **Required** | **Default value**                         | **Description**                                                       |
| --------------------------------- | ------------ | ----------------------------------------- | --------------------------------------------------------------------- |
| DAPPY_NODE_ZONE_PROVIDER          | No           | `postgresql`                              | Zone provider used                                                    |
| DAPPY_NODE_DNS_PORT               | No           |                                           | dappy-node dns port, disabled if not provided                         |
| DAPPY_NODE_HTTP_PORT              | Yes          | `3001`                                    | dappy-node http port                                                  |
| DAPPY_NODE_HTTPS_PORT             | No           |                                           | dappy-node https port. HTTPS is disabled if not defined               |
| DAPPY_NODE_PRIVATE_KEY_FILENAME   | No           | `dappynode.key`                           | dappy-node private key. Generated if not exists                       |
| DAPPY_NODE_CERTIFICATE_FILENAME   | No           | `dappynode.crt`                           | dappy-node certificate. Generated if not exists                       |
| DAPPY_NODE_CACHING                | Yes          | `60`                                      | record ttl cache. Disabled if set to `0`                              |
| DAPPY_NODE_ENABLE_REQUEST_METRICS | Yes          | `false`                                   | Activate metrics                                                      |
| DAPPY_NODE_SENTRY_URL             | No           | `false`                                   | Send logs to sentry                                                   |
| DAPPY_NETWORK_ID                  | Yes          | `unknown`, `gamma`, `beta` or `d`         |
| DAPPY_NETWORK_MASTER_PUBLIC_KEY   | No           | `04ea33c...`                              | Public key to check messages for zone creation (dappy network master) |
| DAPPY_NETWORK_FILE                | No           | `File path of a dappy network .json file` |
| DAPPY_LOG_PATH                    | Yes          | `./logs`                                  | path to log warning and errors                                        |

if DAPPY_NETWORK_ID is `unknown`, the program will try to load a dappy network from the file `./dappyNetwork.js`.

#### Environment variables read when postgresql is used as zone provider

| **Keys**                                    | **Required** | **Default value (dev)**                               | **Description**                                                         |
| ------------------------------------------- | ------------ | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| DAPPY_PG_CONNECTION_STRING                  | No           | `postgresql://postgres:postgres@localhost:5432/dappy` | postgresql connection string                                            |
| DAPPY_NETWORK_MEMBER_TO_DOWNLOAD_ZONES_FROM | No           | ``                                                    | the network member hostname you want to download zones from             |
| DOWNLOAD_ZONES_IF_EMPTY                     | No           | `false`                                               | do you want to download the zones if there are zero zones in pg (setup) |
| DAPPY_NETWORK_ID                            | No           | `local`                                               | ID of the dappy network you want to connect to                          |
| DAPPY_NETWORK_MASTER_PUBLIC_KEY             | No           | `04ea33c4...`                                         | The public key of the entity able to send new zones                     |

### API Reference

Please read [API Reference](API.md) for more details.

### Join a network

It just take a dozen of minutes to join a dappy network.

#### Key pair generation

Let's generate a certificate+key pair first. You can choose any domain you want as it is just an identifier in the dappy network, and indicative. The identifier is not a domain name in the DNS or dappy name system. If you run multiple node, it is probably better to name the certificate and keys `dappynodegamma3`.

For the `gamma` network use the `noden.gamma.[company].dappy` schema, for the `d` network use the `noden.d.[company].dappy` schema. Of course you need one key pair per node.

```sh
openssl req -x509 -newkey rsa:2048 -sha256 -days 30000 -nodes -outform PEM \
  -keyout dappynodegamma3.key \
  -out dappynodegamma3.crt \
  -subj '/CN=node3.gamma.fabco.dappy'\
  -extensions san \
  -config <( \
    echo '[req]'; \
    echo 'distinguished_name=req'; \
    echo '[san]'; \
    echo 'subjectAltName=DNS.1:node3.gamma.fabco.dappy')
```

#### Run with docker compose (gamma network)

rename `docker-compose-gamma-example.yml` to `docker-compose-gamma.yml`.

Now check the `docker-compose-gamma.yml`, few env variables will need to be modified to your setup.

- `DAPPY_PG_CONNECTION_STRING`: you probably have your own connection string to a local or remote postgresql instance. Notice that the two images use it.
- `DAPPY_PG_CA_PATH`: path to the certificate to be used for connecting to postgresql. Put it in a `cert/` folder as this folder is mounted as a volume.
- `DOWNLOAD_ZONES_IF_EMPTY`: do you want to download zones from another node at startup ? Probalby if it is the first launch.
- `DAPPY_NETWORK_MEMBER_TO_DOWNLOAD_ZONES_FROM`: a node you trust from the same dappy network. Default value should be good.
- `DAPPY_NETWORK_MASTER_PUBLIC_KEY`: the master node is the only one authorized to send transactions with new zones (a new domain that was just purchased). It must be identified by a public key.

```sh
docker compose -f docker-compose-gamma.yml up (--detach)
```

Accepting HTTP requests on `127.0.0.1:3001`.

#### Run with docker compose (d network)

Rename `docker-compose-d-example.yml` to `docker-compose-d.yml`.

Simply copy the instructions from previous paragraphs, but use `docker-compose-d.yml` instead. Make sure you have a distinct `DAPPY_PG_CONNECTION_STRING`, there should be one database per node, if not the zones will be mixed. However having the same IP address poses no problem.

```sh
docker compose -f docker-compose-d.yml up (--detach)
```

Accepting HTTP requests on `127.0.0.1:3002`.

#### TLS

For maximum security and privacy, dappy only deals with encrypted traffic, every service discovery (or co-resolution) request must be encrypted with TLS. Our node (d or gamma) is now awaiting HTTP traffic on `localhost:x`, let's setup nginx for HTTPS/TLS requests coming from devices and programs using co-resolution and a dappy network.
