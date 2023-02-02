
### Network tests

In addition to the regular tests `npm run test` there is a network test that will simulate a 2-nodes dappy network exposed on localhost, through HTTP+TLS with a self-signed certificate+key pais for each (production setup). 1000 fake zones are created in the name system during the test.

A third node is later spawned, in order to test the fetching capabilities.

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

networktest/dappyNetwork.json will be used as a reference of dappy network
```

#### Prerequisites

Create or empty postgreSQL databases dappy1, dappy2 and dappy3, easy with adminer `npm run pg:open-adminer`

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
