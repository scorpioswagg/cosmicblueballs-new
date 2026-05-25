import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URL;
const dbName = process.env.DB_NAME || 'cosmic_blueprint';

if (!uri) {
  throw new Error('Please add your MONGO_URL to environment variables');
}

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export async function getDb() {
  const c = await clientPromise;
  return c.db(dbName);
}

export async function ensureIndexes() {
  const db = await getDb();
  await db.collection('magic_tokens').createIndex({ createdAt: 1 }, { expireAfterSeconds: 600 });
  await db.collection('magic_tokens').createIndex({ email: 1 });
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('reports').createIndex({ userId: 1, createdAt: -1 });
  await db.collection('purchases').createIndex({ userId: 1, reportType: 1 });
  await db.collection('subscriptions').createIndex({ email: 1 }, { unique: true });
}
