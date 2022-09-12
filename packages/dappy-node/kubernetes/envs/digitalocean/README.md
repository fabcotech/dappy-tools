# Deploy on Digital ocean

## Prerequisites

Be sure to have these tools installed locally:
- [Git](https://git-scm.com/):  Open source distributed version control system
- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl): CLI to manage kubernetes ressources

Be sure to these services installed on your kubernetes cluster:
- [Cert-manager](https://cert-manager.io/docs/installation/)

All commands above assume that current directory of your terminal is set to:

`<DAPPY_NODE_GIT_ROOT_FOLDER>/packages/dappy-node/kubernetes/envs/digitalocean`

## Initialization

Create namespace

```sh
kubectl create ns <NAMESPACE>
```

Create certificate issuer
```sh
kubectl -n=<NAMESPACE> apply -k <NAMESPACE>/cert-manager
```

## Use PostgreSQL as zone provider

### Initialization

Create secret with postgreSQL connection string
```sh
kubectl -n=<NAMESPACE> create secret generic pg --from-literal=connection-string='<POSTGRESQL_CONNECTION_STRING>'
```

Upload postgreSQL CA certificate as configmap. Rename certifiate file to `ca.pem` to match k8s configuration:
```sh
kubectl -n=<NAMESPACE> create configmap pg-dappy-ca --from-file=./ca.pem
```

### Deploy adminer to administrate PostgreSQL database

```sh
kubectl -n=<NAMESPACE> apply -k <NAMESPACE>/pg
```

Adminer should be available here: `https://adminer.<NAMESPACE>.dappy.tech/`

Following connection info are available on Digital Ocean PosgreSQL page:
- system: `PostgreSQL`
- Server
- username
- password
- database: `dappy`

### Deploy dappy-node

Create a key and certificate for <NODE_NAME>.<NAMESPACE>.dappy TLS endpoint
```sh
openssl req \
  -x509 \
  -newkey rsa:2048 \
  -sha256 \
  -days 3000 \
  -nodes \
  -keyout dappy-node.key \
  -out dappy-node.crt \
  -outform PEM \
  -subj '/CN=node1.gamma.dappy'\
  -extensions san \
  -config <( \
    echo '[req]'; \
    echo 'distinguished_name=req'; \
    echo '[san]'; \
    echo 'basicConstraints = critical, CA:TRUE'; \
    echo 'subjectAltName=DNS.1:localhost,DNS.2:node1.gamma.dappy,DNS.3:node1.gamma.dappy.tech')
```

Push key and certificate in k8s as secret:
```sh
kubectl -n=<NAMESPACE> create secret tls <NODE_NAME>.<NAMESPACE>.dappy --key="dappy-node.key" --cert="dappy-node.crt"
```

Deploy dappy node instance
```sh
kubectl -n=<NAMESPACE> apply -k <NAMESPACE>/dappy/pg
```
Test Web PKI endpoint
```sh
curl -IX POST https://<NODE_NAME>.<NAMESPACE>.dappy.tech/ping
```

Test .dappy endpoint
```sh
curl -k -IX POST -H 'Host: <NODE_NAME>.<NAMESPACE>.dappy' 'https://<NODE_PUBLIC_IP>/ping'
```

## Monitoring

Install prometheus and grafana

```sh
kubectl -n=<NAMESPACE> apply -k <NAMESPACE>/monitoring
```

Configuration is looking for pods following these criterias:
- pod label matches this regex `dappy-node`
- pod port matches this regex `3001`
- corresponding service contains this annotation `prometheus.io/scrape: "true"`

Be sure to implement all of these criterias.
