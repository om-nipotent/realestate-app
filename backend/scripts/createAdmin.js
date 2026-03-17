/**
 * Run this once to create the admin account:
 *   node scripts/createAdmin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ADMIN = {
  name: 'Admin',
  email: 'omtayade@realestate.com',
  phone: '9999999999',
  password: 'om@123',
  role: 'admin',
  verificationStatus: 'verified',
  isActive: true,
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const collection = mongoose.connection.collection('users');

  const existing = await collection.findOne({ email: ADMIN.email });
  if (existing) {
    console.log('⚠️  Admin already exists. Login with:');
    console.log(`   Email   : ${ADMIN.email}`);
    console.log(`   Password: ${ADMIN.password}`);
    await mongoose.disconnect();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(ADMIN.password, salt);

  await collection.insertOne({
    ...ADMIN,
    password: hashedPassword,
    searchHistory: [],
    viewedProperties: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('✅ Admin account created!');
  console.log(`   Email   : ${ADMIN.email}`);
  console.log(`   Password: ${ADMIN.password}`);
  console.log('\n👉 Go to http://localhost:5173/login and sign in.');
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
