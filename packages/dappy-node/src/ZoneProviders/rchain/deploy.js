const rchainToolkit = require('@fabcotech/rchain-toolkit');
const Ajv = require('ajv');

const { log } = require('../../log');

const ajv = new Ajv();
const schema = {
  schemaId: 'deploy',
  type: 'object',
  properties: {
    data: {
      type: 'object',
      properties: {
        timestamp: {
          type: 'number',
        },
        phloPrice: {
          type: 'number',
        },
        phloLimit: {
          type: 'number',
        },
        validAfterBlockNumber: {
          type: 'number',
        },
        term: {
          type: 'string',
        },
      },
      required: [
        'timestamp',
        'phloPrice',
        'phloLimit',
        'validAfterBlockNumber',
        'term',
      ],
    },
    deployer: {
      type: 'string',
    },
    signature: {
      type: 'string',
    },
    sigAlgorithm: {
      type: 'string',
      const: 'secp256k1',
    },
  },
  required: ['deployer', 'signature', 'sigAlgorithm'],
};

ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));

const validate = ajv.compile(schema);

module.exports.deployWsHandler = async (body, urlOrOptions) => {
  log('deploy');

  const valid = validate(body);

  if (!valid) {
    return {
      success: false,
      error: {
        message: validate.errors.map((e) => `body${e.dataPath} ${e.message}`),
      },
    };
  }

  let deployResponse;
  try {
    deployResponse = await rchainToolkit.http.deploy(urlOrOptions, body);
  } catch (err) {
    return {
      success: false,
      error: { message: deployResponse },
    };
  }
  if (!deployResponse.startsWith('"Success')) {
    return {
      success: false,
      error: { message: deployResponse },
    };
  }
  return {
    success: true,
    data: deployResponse,
  };
};
