const { Router } = require('express');
const bodyParser = require('body-parser');

const { listenForDataAtNameWsHandler } = require('./listen-for-data-at-name');
const {
  listenForDataAtNameXWsHandler,
} = require('./listen-for-data-at-name-x');
const { deployWsHandler } = require('./deploy');
const { exploreDeployWsHandler } = require('./explore-deploy');
const { exploreDeployXWsHandler } = require('./explore-deploy-x');
const { prepareDeployWsHandler } = require('./prepare-deploy');
const { getXRecordsWsHandler } = require('./get-x-records');
const {
  getXRecordsByPublicKeyWsHandler,
} = require('./get-x-records-by-public-key');
const { pickRandomReadOnly } = require('./pickRandomReadOnly');
const { getContractLogsHandler } = require('./get-contract-logs');
const { dnsQuery } = require('./dns-query');
const { log } = require('../../log');

const getInfo = (store) => (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  let wrappedRevContractId = 'notconfigured';
  if (store.rchainNamesMasterRegistryUri !== 'notconfigured') {
    wrappedRevContractId = `${store.rchainNamesMasterRegistryUri.slice(0, 3)}rev`;
  }

  res.json({
    success: true,
    data: {
      dappyNodeVersion: store.dappyNodeVersion,
      dappyBrowserMinVersion: store.dappyBrowserMinVersion,
      dappyBrowserDownloadLink: store.dappyBrowserDownloadLink,
      lastFinalizedBlockNumber: store.lastFinalizedBlockNumber,
      rnodeVersion: store.rnodeVersion,
      rchainNamesMasterRegistryUri: store.rchainNamesMasterRegistryUri,
      rchainNamesContractId: store.rchainNamesContractId,
      wrappedRevContractId,
      rchainNetwork: store.rchainNetwork,
      namePrice: store.namePrice,
    },
  });
};

const getLastFinalizedBlockNumber = (store) => (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({
    data: store.lastFinalizedBlockNumber,
    success: true,
  });
};

const pickRandomValidator = (store) => ({
  url: store.httpUrlValidator[Math.floor(Math.random() * store.httpUrlValidator.length)],
});

const deploy = (store) => async (req, res) => {
  const data = await deployWsHandler(req.body, pickRandomValidator(store));
  res.json(data);
};

const prepareDeploy = (store) => async (req, res) => {
  const data = await prepareDeployWsHandler(req.body, pickRandomReadOnly(store));
  if (data.success) {
    res.json(data);
  } else {
    res.status(400).json(data);
  }
};

const exploreDeploy = (store) => async (req, res) => {
  const data = await exploreDeployWsHandler(
    req.body,
    pickRandomReadOnly(store),
    store.redisClient,
    store.useCache,
    store.caching,
  );
  if (data.success) {
    res.json(data);
  } else {
    res.status(400).json(data);
  }
};

const exploreDeployX = (store) => async (req, res) => {
  const data = await exploreDeployXWsHandler(
    req.body,
    pickRandomReadOnly(store),
    store.redisClient,
    store.useCache,
    store.caching,
  );
  if (data.success) {
    res.json(data);
  } else {
    res.status(400).json(data);
  }
};

const listenForDataAtName = (store) => async (req, res) => {
  const data = await listenForDataAtNameWsHandler(
    req.body,
    pickRandomReadOnly(store),
  );
  if (data.success) {
    res.json(data);
  } else {
    res.status(400).json(data);
  }
};

const listenForDataAtNameX = (store) => async (req, res) => {
  const data = await listenForDataAtNameXWsHandler(
    req.body,
    pickRandomReadOnly(store),
  );
  if (data.success) {
    res.json(data);
  } else {
    res.status(400).json(data);
  }
};

const getXRecords = (store) => async (req, res) => {
  const data = await getXRecordsWsHandler(req.body, {
    redisClient: store.redisClient,
    log,
    urlOrOptions: pickRandomReadOnly(store),
  });
  if (data.success) {
    res.json(data);
  } else {
    res.status(400).json(data);
  }
};

const getXRecordsByPublicKey = (store) => async (req, res) => {
  const data = await getXRecordsByPublicKeyWsHandler(req.body, store.redisClient);
  if (data.success) {
    res.json(data);
  } else {
    res.status(400).json(data);
  }
};

const getContractLogs = (store) => (req, res) => {
  getContractLogsHandler(store.redisClient.zRange.bind(store.redisClient), log)(req.body, res);
};

function getRoutes(store) {
  const router = Router();

  router.use(bodyParser.json());

  router.post('/dns-query', bodyParser.raw({
    type: 'application/dns-message',
  }), dnsQuery(store));
  router.get('/info', getInfo(store));
  router.post('/info', getInfo(store));
  router.post('/last-finalized-block-number', getLastFinalizedBlockNumber(store));
  router.post('/explore-deploy-x', exploreDeployX(store));
  router.post('/listen-for-data-at-name-x', listenForDataAtNameX(store));
  router.post('/get-x-records', getXRecords(store));
  router.post('/get-x-records-by-public-key', getXRecordsByPublicKey(store));
  router.post('/get-contract-logs', getContractLogs(store));
  router.post('/api/deploy', deploy(store));
  router.post('/api/prepare-deploy', prepareDeploy(store));
  router.post('/api/explore-deploy', exploreDeploy(store));
  router.post('/api/listen-for-data-at-name', listenForDataAtName(store));

  return router;
}

module.exports = {
  getRoutes,
};
