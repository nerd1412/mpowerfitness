const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { Admin } = require('../models/index');

const seed = async () => {
  console.log('🌱 Seeding Mpower Fitness database...');

  const existingAdmin = await Admin.findOne({ where: { email: 'admin@mpowerfitness.com' } });
  if (existingAdmin) {
    console.log('✅ Admin already exists, skipping seed');
    return;
  }

  await Admin.create({
    name: 'Mpower Admin',
    email: 'admin@mpowerfitness.com',
    password: await bcrypt.hash('Admin@123456', 12),
    role: 'superadmin',
    isActive: true,
    upiId: process.env.UPI_ID || 'payments@mpowerfitness',
    upiName: process.env.UPI_NAME || 'Mpower Fitness',
    permissions: ['all'],
  });

  console.log('✅ Admin seeded');
  console.log('   Email:    admin@mpowerfitness.com');
  console.log('   Password: Admin@123456');
};

module.exports = { seed };

if (require.main === module) {
  const { sequelize } = require('../models/index');
  sequelize.sync({ alter: true })
    .then(() => seed())
    .then(() => process.exit(0))
    .catch(e => { console.error(e); process.exit(1); });
}
