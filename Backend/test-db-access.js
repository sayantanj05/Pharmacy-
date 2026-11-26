// Verifies MongoDB Atlas credentials have read/write access to the Pharmacy DB.
// Usage: node test-db-access.js
// Reads MONGODB_URI / MONGODB_DB_NAME from .env (same as the backend).

require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'Pharmacy';

if (!uri) {
  console.error('MONGODB_URI is not set. Check your .env file.');
  process.exit(1);
}

const testCollection = 'devin_access_test';
const testDoc = { probe: true, createdAt: new Date() };

const run = async () => {
  console.log(`Connecting to Atlas... (db: ${dbName})`);
  await mongoose.connect(uri, {
    dbName,
    serverSelectionTimeoutMS: 15000,
  });
  console.log('Connected:', mongoose.connection.host);

  const db = mongoose.connection.db;
  const coll = db.collection(testCollection);

  // READ: list collections
  const collections = await db.listCollections().toArray();
  console.log(`READ ok - ${collections.length} collections visible`);

  // WRITE: insert
  const inserted = await coll.insertOne(testDoc);
  console.log('WRITE ok - inserted doc', inserted.insertedId);

  // UPDATE
  await coll.updateOne({ _id: inserted.insertedId }, { $set: { probe: false } });
  console.log('UPDATE ok');

  // DELETE (cleanup)
  await coll.deleteOne({ _id: inserted.insertedId });
  console.log('DELETE ok - test doc removed');

  await mongoose.disconnect();
  console.log('\nAll checks passed - the DB user has full read/write access.');
};

run().catch(async (err) => {
  console.error('\nFAILED:', err.message);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
