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
    connectionString:
      process.env.DAPPY_PG_CONNECTION_STRING ||
      'postgresql://postgres:postgres@localhost:5432/dappy',
  },
};

if (process.env.DAPPY_PG_CA_PATH) {
  config.connection.ssl = {
    ca: readFileSync(process.env.DAPPY_PG_CA_PATH, { encoding: 'utf8' }),
  };
}

module.exports = config;
