const mongoose = require('mongoose');

let memoryMode = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/inventory_db';

  try {
    console.log(`[DB] Attempting connection to MongoDB at: ${uri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log('[DB] Connected to MongoDB successfully.');
    memoryMode = false;
  } catch (error) {
    console.warn('------------------------------------------------------------');
    console.warn('[DB Warning] Could not connect to local/remote MongoDB:', error.message);
    console.warn('[DB Fallback] Activating resilient In-Memory Inventory Store.');
    console.warn('[DB Fallback] All CRUD operations, stock updates, & searches will function normally!');
    console.warn('------------------------------------------------------------');
    memoryMode = true;
  }
};

const isMemoryMode = () => memoryMode;

module.exports = { connectDB, isMemoryMode };
