#!/usr/bin/env node

/* eslint-disable no-console */
const {
  deployMaster, deployBox, deploy, createPurse, updatePursePrice,
} = require('rchain-token/cli/api');

const { setEnvValue, mustBeUrl, mustBeNotEmptyString } = require('./utils');

require('dotenv').config();

async function deployNameSystem() {
  const validatorHost = mustBeUrl(process.env.VALIDATOR, 'environment variable VALIDATOR must contains a rnode validator url');
  const privateKey = mustBeNotEmptyString(process.env.PRIVATE_KEY, 'environment variable PRIVATE_KEY must contains a private key');
  const boxId = mustBeNotEmptyString(process.env.BOX_ID, 'environment variable BOX_ID must contains a box id');
  const contractId = mustBeNotEmptyString(process.env.CONTRACT_ID, 'environment variable CONTRACT_ID must contains a contract id');

  const masterRegistryUri = await deployMaster({
    validatorHost,
    privateKey,
  });
  setEnvValue('RCHAIN_NAMES_MASTER_REGISTRY_URI', masterRegistryUri);
  console.log(`✓ Master deployed at ${masterRegistryUri}`);

  const rBoxId = await deployBox({
    validatorHost,
    masterRegistryUri,
    privateKey,
    boxId,
  });
  setEnvValue('RCHAIN_NAMES_BOX_ID', rBoxId);
  console.log(`✓ Box ${rBoxId} deployed`);

  const rContractId = await deploy({
    validatorHost,
    masterRegistryUri,
    privateKey,
    boxId: rBoxId,
    contractId,
    fungible: false,
  });
  setEnvValue('RCHAIN_NAMES_CONTRACT_ID', rContractId);
  console.log(`✓ Contract ${rContractId} deployed`);

  await createPurse({
    validatorHost,
    masterRegistryUri,
    privateKey,
    contractId: rContractId,
    purses: {
      purse1: {
        id: '0', price: null, boxId: rBoxId, quantity: 100000000,
      },
    },
    pursesData: { purse1: null },
  });
  console.log('✓ Purse 0 created');

  await updatePursePrice({
    masterRegistryUri,
    validatorHost,
    privateKey,
    contractId: rContractId,
    boxId: rBoxId,
    purseId: '0',
    price: ['rev', 50000000],
  });
  console.log('✓ Purse 0 price updated to 50000000');
}

deployNameSystem();
