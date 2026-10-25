import "server-only";
import { MongoClient } from "mongodb";

// One client per server instance. In development the module is re-evaluated on
// every edit, so the client is kept on globalThis to avoid leaking connections. It is
// replaced if MONGODB_URI changes, since the dev server reloads .env.local without restarting.
const globalForMongo = globalThis as unknown as { mongoClient?: MongoClient; mongoUri?: string };

function getClient(): MongoClient {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Add it to .env.local (see .env.example).");
  if (globalForMongo.mongoClient && globalForMongo.mongoUri !== uri) {
    void globalForMongo.mongoClient.close().catch(() => {});
    globalForMongo.mongoClient = undefined;
  }
  globalForMongo.mongoClient ??= new MongoClient(uri, { appName: "kisumu-education-festival" });
  globalForMongo.mongoUri = uri;
  return globalForMongo.mongoClient;
}

export function getDb() {
  return getClient().db(process.env.MONGODB_DB || "kisumu_festival");
}
