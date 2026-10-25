// Creates an organiser account for /admin, or resets its password if it already exists.
//   npm run seed:admin -- <email> <password>
// Uses MONGODB_URI and MONGODB_DB from .env.local. Hashes the same way as src/lib/admin-users.ts.
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { MongoClient } from "mongodb";

const [emailArg, password] = process.argv.slice(2);
const email = (emailArg ?? "").trim().toLowerCase();
if (!email.includes("@") || !password) {
  console.error("Usage: npm run seed:admin -- <email> <password>");
  process.exit(1);
}
if (password.length < 8) {
  console.error("Use a password of at least 8 characters.");
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not set. Add it to .env.local.");
  process.exit(1);
}

const salt = randomBytes(16);
const hash = await promisify(scrypt)(password, salt, 64);
const passwordHash = `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;

const client = new MongoClient(process.env.MONGODB_URI);
try {
  await client.connect();
  const admins = client.db(process.env.MONGODB_DB || "kisumu_festival").collection("admins");
  await admins.createIndex({ email: 1 }, { unique: true });
  const now = new Date();
  const result = await admins.updateOne(
    { email },
    { $set: { passwordHash, updatedAt: now }, $setOnInsert: { email, createdAt: now } },
    { upsert: true },
  );
  console.log(result.upsertedCount ? `Created admin ${email}.` : `Updated the password for ${email}.`);
} finally {
  await client.close();
}
