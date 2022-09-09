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

### Deploy dappy-node

```sh
kubectl -n=<NAMESPACE> apply -k <NAMeSPACE>/dappy/pg
```
