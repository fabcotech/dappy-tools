const { parse } = require('pg-connection-string');
const { readFileSync } = require('fs');

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
const config = {
  client: 'pg',
  migrations: {
    directory: './migrations',
  },
  connection: {
    ...parse(
      process.env.DAPPY_PG_CONNECTION_STRING ||
        'postgresql://postgres:postgres@localhost:5432/dappy'
    ),
  },
};

if (process.env.DAPPY_PG_CA_PATH) {
  config.ssl = {
    ca: readFileSync(process.env.DAPPY_PG_CA_PATH, { encoding: 'utf8' }),
  };
}

module.exports = config;
