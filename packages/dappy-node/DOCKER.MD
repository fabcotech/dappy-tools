### Join a network

It just take a dozen of minutes to join a dappy network.

#### Key pair generation

Let's generate a certificate+key pair first. You can choose any domain you want as it is just an identifier in the dappy network, and indicative. The identifier is not a domain name in the DNS or dappy name system. If you run multiple node, it is probably better to name the certificate and keys `dappynodegamma3`.

For the `gamma` network use the `noden.gamma.company.dappy` schema, for the `d` network use the `noden.d.company.dappy` schema. Of course you need one key pair per node.

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

rename `docker-compose-d-example.yml` to `docker-compose-d.yml`.

Simply copy the instructions from previous paragraphs, but use `docker-compose-d.yml` instead. Make sure you have a distinct `DAPPY_PG_CONNECTION_STRING`, there should be one database per node, if not the zones will be mixed. However having the same IP address poses no problem.

```sh
docker compose -f docker-compose-d.yml up (--detach)
```

Accepting HTTP requests on `127.0.0.1:3002`.

#### TLS

For maximum security and privacy, dappy only deals with encrypted traffic, every service discovery (or co-resolution) request must be encrypted with TLS. Our node (d or gamma) is now awaiting HTTP traffic on `localhost:x`, let's setup nginx for HTTPS/TLS requests coming from devices and programs using co-resolution and a dappy network.
