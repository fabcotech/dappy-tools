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

Create gamma namespace

```sh
kubectl create ns gamma
```

Create certificate issuer
```sh
kubectl apply -k gamma/cert-manager
```

## Deploy adminer to administrate PostgreSQL database

```sh
kubectl apply -k <NAMESPACE>/pg
```
