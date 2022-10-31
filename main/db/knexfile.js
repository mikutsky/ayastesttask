const { env, dbConfig } = require('../conf');

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: dbConfig.host,
      database: dbConfig.database,
      user: dbConfig.user,
      password: dbConfig.password,
      charset: 'utf8',
    },
    pool: {
      min: dbConfig.min,
      max: dbConfig.max,
    },
  },
};
