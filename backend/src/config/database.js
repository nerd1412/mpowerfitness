const { Sequelize } = require('sequelize');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';

let sequelize;

const databaseUrl = process.env.DATABASE_URL;

if (databaseUrl && databaseUrl.startsWith('postgres')) {
  // PostgreSQL: Production or Local (if URL is provided)
  const options = {
    dialect: 'postgres',
    logging: false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
  };

  // Only use SSL in production (Render requirement)
  if (isProduction) {
    options.dialectOptions = { ssl: { require: true, rejectUnauthorized: false } };
  }

  sequelize = new Sequelize(databaseUrl, options);
} else {
  // Default Local development: SQLite
  const dbPath = process.env.SQLITE_PATH || path.join(__dirname, '../../data/mpower.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: process.env.NODE_ENV === 'development' ? false : false,
    define: { underscored: false, timestamps: true }
  });
}

module.exports = sequelize;
