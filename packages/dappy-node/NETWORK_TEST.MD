Three processes will be spawned:

```
(1) master node
postgresql://postgres:postgres@localhost:5432/dappy1
db: dappy1
On port 3001 and 3002

(2) node 2
postgresql://postgres:postgres@localhost:5432/dappy2
db: dappy2
On port 3003 and 3004

(2) node 3 - spawned later not part of the dappy network
postgresql://postgres:postgres@localhost:5432/dappy3
db: dappy3
On port 3005 and 3006

dappyNetworkTest.json will be used as a reference of dappyNetwork
```

#### init

Create or empty databases dappy1 and dappy2, easy with adminer `npm run pg:open-adminer`

#### Run

```
npm run test:network
```

Issues launching ?

Make sure you don't have some suprocesses running :

```
ps aux | grep src
```

Make sure ports 3001-3006 are free.
