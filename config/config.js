module.exports = {
  development: {
    username: 'postgres',
    password: null,
    database: 'zensecontrol_development',
    host: '127.0.0.1',
    port: 32770,
    dialect: 'postgres'
  },
  test: {
    username: 'root',
    password: null,
    database: 'zensecontrol_test',
    host: '127.0.0.1',
    dialect: 'postgres'
  },
  production: {
    username: process.env.PROD_DB_USERNAME,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOSTNAME,
    dialect: 'postgres'
  }
}
