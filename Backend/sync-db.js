const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const readline = require('readline');

const ATLAS_URI = process.env.MONGODB_URI_ATLAS || 'mongodb+srv://goandstudyadmin:goandstudyadmin@goandstudycluster.4jz25t7.mongodb.net/Pharmacy?appName=goandstudycluster';
const LOCAL_URI = process.env.MONGODB_URI_LOCAL || 'mongodb://localhost:27017/Pharmacy';
const DB_NAME = process.env.MONGODB_DB_NAME || 'Pharmacy';

const COLLECTIONS = [
  'users', 'shops', 'medicines', 'orders', 'orderitems',
  'cartitems', 'supplies', 'vendors', 'vendorpayments',
  'payments', 'notifications', 'expirylogs', 'alternatives'
];

let atlasConn, localConn;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function connectDB(uri, name) {
  return mongoose.createConnection(uri, { dbName: name });
}

function getCollection(conn, collectionName) {
  return conn.collection(collectionName);
}

async function fetchAllDocs(conn, collectionName) {
  const collection = getCollection(conn, collectionName);
  const docs = await collection.find({}).toArray();
  const map = new Map();
  for (const doc of docs) {
    map.set(doc._id.toString(), doc);
  }
  return map;
}

function mergeDocs(localDoc, atlasDoc) {
  if (!localDoc) return atlasDoc;
  if (!atlasDoc) return localDoc;
  
  const localTime = localDoc.updatedAt ? new Date(localDoc.updatedAt).getTime() : 0;
  const atlasTime = atlasDoc.updatedAt ? new Date(atlasDoc.updatedAt).getTime() : 0;
  
  if (atlasTime > localTime) {
    return { ...atlasDoc, _source: 'atlas', _conflict: false };
  } else if (localTime > atlasTime) {
    return { ...localDoc, _source: 'local', _conflict: false };
  } else {
    return { ...localDoc, _source: 'conflict', _conflict: true };
  }
}

async function syncCollection(collectionName) {
  console.log(`\nSyncing: ${collectionName}`);
  
  const [localDocs, atlasDocs] = await Promise.all([
    fetchAllDocs(localConn, collectionName),
    fetchAllDocs(atlasConn, collectionName)
  ]);
  
  const allIds = new Set([...localDocs.keys(), ...atlasDocs.keys()]);
  let synced = 0;
  let conflicts = 0;
  let localOnly = 0;
  let atlasOnly = 0;
  
  const localUpdates = [];
  const atlasUpdates = [];
  
  for (const id of allIds) {
    const localDoc = localDocs.get(id);
    const atlasDoc = atlasDocs.get(id);
    
    if (localDoc && !atlasDoc) {
      localOnly++;
      localUpdates.push({ ...localDoc, _source: 'local' });
      atlasUpdates.push({ ...localDoc, _source: 'local' });
    } else if (atlasDoc && !localDoc) {
      atlasOnly++;
      localUpdates.push({ ...atlasDoc, _source: 'atlas' });
      atlasUpdates.push({ ...atlasDoc, _source: 'atlas' });
    } else {
      const merged = mergeDocs(localDoc, atlasDoc);
      if (merged._conflict) {
        conflicts++;
        console.log(`  ⚠️  Conflict: ${collectionName}/${id}`);
        console.log(`    Local updated: ${localDoc.updatedAt}`);
        console.log(`    Atlas updated: ${atlasDoc.updatedAt}`);
        console.log(`    Using: ${merged._source} (newer)`);
      }
      
      const cleanMerged = { ...merged };
      delete cleanMerged._source;
      delete cleanMerged._conflict;
      
      localUpdates.push({ ...cleanMerged, _source: merged._source });
      atlasUpdates.push({ ...cleanMerged, _source: merged._source });
    }
    synced++;
  }
  
  const upsert = async (conn, docs, label) => {
    const collection = getCollection(conn, collectionName);
    const bulkOps = docs.map(doc => ({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: doc },
        upsert: true
      }
    }));
    
    if (bulkOps.length > 0) {
      const result = await collection.bulkWrite(bulkOps, { ordered: false });
      return result.upsertedCount + result.modifiedCount;
    }
    return 0;
  };
  
  const [localResult, atlasResult] = await Promise.all([
    upsert(localConn, localUpdates, 'local'),
    upsert(atlasConn, atlasUpdates, 'atlas')
  ]);
  
  console.log(`  ✓ Synced ${synced} docs | New: ${localOnly} local, ${atlasOnly} atlas | Conflicts: ${conflicts} | Writes: ${localResult} local, ${atlasResult} atlas`);
  return { synced, conflicts, localOnly, atlasOnly };
}

async function runSync() {
  console.log('🚀 Starting bidirectional sync...');
  console.log(`   Atlas: ${ATLAS_URI.replace(/\/\/.*@/, '//***@')}`);
  console.log(`   Local: ${LOCAL_URI}`);
  console.log(`   DB: ${DB_NAME}\n`);
  
  try {
    atlasConn = connectDB(ATLAS_URI, DB_NAME);
    localConn = connectDB(LOCAL_URI, DB_NAME);
    
    await Promise.all([
      new Promise((resolve, reject) => atlasConn.on('connected', resolve).on('error', reject)),
      new Promise((resolve, reject) => localConn.on('connected', resolve).on('error', reject))
    ]);
    
    console.log('✅ Connected to both databases\n');
    
    const results = {};
    for (const collection of COLLECTIONS) {
      results[collection] = await syncCollection(collection);
    }
    
    const totalSynced = Object.values(results).reduce((sum, r) => sum + r.synced, 0);
    const totalConflicts = Object.values(results).reduce((sum, r) => sum + r.conflicts, 0);
    
    console.log('\n' + '='.repeat(50));
    console.log(`✅ Sync complete! Total: ${totalSynced} docs | Conflicts: ${totalConflicts}`);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  } finally {
    if (atlasConn) await atlasConn.close();
    if (localConn) await localConn.close();
  }
}

async function watchSync(intervalMs = 30000) {
  console.log(`👁️  Watch mode: syncing every ${intervalMs / 1000}s`);
  console.log('   Press Ctrl+C to stop\n');
  
  await runSync();
  
  const timer = setInterval(async () => {
    console.log(`\n🔄 Auto-sync at ${new Date().toLocaleTimeString()}`);
    try {
      atlasConn = connectDB(ATLAS_URI, DB_NAME);
      localConn = connectDB(LOCAL_URI, DB_NAME);
      
      await Promise.all([
        new Promise((resolve, reject) => atlasConn.on('connected', resolve).on('error', reject)),
        new Promise((resolve, reject) => localConn.on('connected', resolve).on('error', reject))
      ]);
      
      for (const collection of COLLECTIONS) {
        await syncCollection(collection);
      }
      
      await Promise.all([atlasConn.close(), localConn.close()]);
    } catch (error) {
      console.error('❌ Auto-sync failed:', error.message);
    }
  }, intervalMs);
  
  process.on('SIGINT', () => {
    clearInterval(timer);
    console.log('\n\n👋 Stopped watching');
    process.exit(0);
  });
}

const args = process.argv.slice(2);
const mode = args[0] || 'once';
const interval = parseInt(args[1]) || 30000;

if (mode === 'watch') {
  watchSync(interval);
} else {
  runSync();
}
