const { Sequelize } = require('sequelize');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';

let sequelize;

if (isProduction && process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')) {
  // Production: PostgreSQL
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
  });
} else {
  // Local development: SQLite
  const dbPath = process.env.SQLITE_PATH || path.join(__dirname, '../../data/mpower.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: process.env.NODE_ENV === 'development' ? false : false,
    define: { underscored: false, timestamps: true }
  });
}

module.exports = sequelize;
