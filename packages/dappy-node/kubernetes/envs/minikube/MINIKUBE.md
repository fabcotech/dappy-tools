# Installation inside a local kubernetes using minikube

## Install and run local kubernetes cluster

Be sure to have these tools installed:
- [NodeJS](https://nodejs.org/): Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine.
- [Git](https://git-scm.com/):  Open source distributed version control system
- [Docker](https://www.docker.com/get-started) : Docker CLI and container runtime
- [minikube](https://minikube.sigs.k8s.io/): CLI to create and manage local k8s clusters
- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl): CLI to manage kubernetes ressources

```sh
# Start k8s cluster
minikube start

# Install ingress controller
minikube addons enable ingress
```

## Use postgresql as zone provider

```sh
cd <DAPPY_NODE_GIT_ROOT_FOLDER>/packages/dappy-node/kubernetes/envs/minikube

# Create namespace for dappy using rchain zone provider
kubectl create ns dappy-node-pg

# generate certificate for dappy-node HTTPS endpoint
mkcert pg.dappy.dev

# Create secret sslsecret from certificate and key file
kubectl create secret tls dappy-node-tls --key="pg.dappy.dev-key.pem" --cert="pg.dappy.dev.pem" -n=dappy-node-pg

# For MacOs+Docker only, add local entries to HOST file
sudo -s
echo "127.0.0.1    pg.dappy.dev" >> /etc/hosts
exit

# For Linux only, add local entries to HOST file
sudo -s
echo "`minikube ip`    pg.dappy.dev" >> /etc/hosts
exit
```

### Deploy postgresql

```sh
# Deploy pg
kubectl apply -k pg -n=dappy-node-pg

# Wait until deployment is done
kubectl wait --for=condition=available --timeout=600s deployment/pg -n=dappy-node-pg
```

### Deploy dappy-node

Inside folder `<DAPPY_NODE_GIT_ROOT_FOLDER>/packages/dappy-node/kubernetes/envs/minikube`

```sh
# Use minikube docker runtime
eval $(minikube docker-env)

# Build dappy-node image and push it into minikube docker runtime
docker build -t fabcotech/dappy-node -f ../../../Dockerfile ../../../../../

# start or update config
kubectl apply -k dappy/pg -n=dappy-node-pg

# Wait until deployment is done
kubectl wait --for=condition=available --timeout=600s deployment/dappy-node -n=dappy-node-pg
```

## Use rchain as zone provider

```sh
# Create namespace for dappy using rchain zone provider
kubectl create ns dappy-node-rchain
```

### Deploy a rchain validator node in local kubernetes cluster

Install [mkcert](https://github.com/FiloSottile/mkcert): It enables locally-trusted development certificates. mkcert root CA must be installed with this command `mkcert -install` (chrome/firefox must be restarted)

```sh
# On macOS only, run following command in a dedicated terminal
sudo minikube tunnel

cd <DAPPY_NODE_GIT_ROOT_FOLDER>/packages/dappy-node/kubernetes/envs/minikube
# generate certificate for rnode HTTPS endpoint
mkcert rnode.dev

# Create secret sslsecret from certificate and key file
kubectl create secret tls sslsecret --key="rnode.dev-key.pem" --cert="rnode.dev.pem" -n=dappy-node-rchain

# Deploy rnode in devMode on minikube
kubectl apply -k rnode -n=dappy-node-rchain

# Wait until deployment is done
kubectl wait --for=condition=available --timeout=600s deployment/rnode -n=dappy-node-rchain

# For MacOs only, add local entries to HOST file
sudo -s
echo "127.0.0.1    rnode.dev" >> /etc/hosts
exit

# For Linux only, add local entries to HOST file
sudo -s
echo "`minikube ip`    rnode.dev" >> /etc/hosts
exit

# Check HTTP and HTTPS endpoints
curl http://rnode.dev/status
curl https://rnode.dev/status
```

### Deploy dappy-node

Inside folder `<DAPPY_NODE_GIT_ROOT_FOLDER>/packages/dappy-node/kubernetes/envs/minikube`

```sh
# Create configmap that contains master uri
kubectl create configmap dappy-config --from-env-file dappyrc

# Use minikube docker runtime
eval $(minikube docker-env)

# Build dappy-node image and push it into minikube docker runtime
docker build -t fabcotech/dappy-node -f ../../../Dockerfile ../../../../../

# generate certificate for dappy-node HTTPS endpoint
mkcert dappy.rchain.dev

# Create secret sslsecret from certificate and key file
kubectl create secret tls dappy-node-tls --key="dappy.rchain.dev-key.pem" --cert="dappy.rchain.dev.pem" -n=dappy-node-rchain

# start or update config
kubectl apply -k dappy/rchain -n=dappy-node-rchain

# Wait until deployment is done
kubectl wait --for=condition=available --timeout=600s deployment/dappy-node -n=dappy-node-rchain

# For MacOs only, add local entries to HOST file
sudo -s
echo "127.0.0.1    dappy.rchain.dev" >> /etc/hosts
exit

# For Linux only, add local entries to HOST file
sudo -s
echo "`minikube ip`    dappy.rchain.dev" >> /etc/hosts
exit
```

### Redeploy Dappy name system

```sh
# Create configmap that contains master uri
kubectl create configmap dappy-config --from-env-file dappyrc

# start or update config
kubectl apply -k dappy

# Wait until deployment is done
kubectl wait --for=condition=available --timeout=600s deployment/dappy-node
```

## Docker build and push to docker hub

```sh
# dappy-node (nodejs)
docker build . -t fabcotech/dappy-node:{DAPPY_NODE_VERSION}
docker push fabcotech/dappy-node:{DAPPY_NODE_VERSION}
```

## Other commands

```sh
# Update dappy-node image and run it on kubernetes
cd <DAPPY_NODE_GIT_ROOT_FOLDER>/packages/dappy-node
eval $(minikube docker-env)
docker build -t fabcotech/dappy-node -f . ../../
kubectl rollout restart deployment dappy-jobs dappy-node

# update values in file stresstest/ping-pong.js
# and check ping/pong on http(3001) and https(3002)
node stresstest/ping-pong.js
```

## Deploy an ip app

Prerequisites:
- [mkcert](https://github.com/FiloSottile/mkcert): It enables locally-trusted development certificates. mkcert root CA must be installed with this command `mkcert -install` (chrome/firefox must be restarted)
- [hosts](https://github.com/xwmx/hosts)

```sh
sudo hosts add 127.0.0.1 ipapp.dev
mkcert ipapp.dev
kubectl create secret tls ipapp-tls --key="ipapp.dev-key.pem" --cert="ipapp.dev.pem"
rm ipapp.dev-key.pem ipapp.dev.pem
kubectl apply -f kubernetes/envs/minikube/ipApp

curl -I https://ipapp.dev #should return HTTP code 200
```
