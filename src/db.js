import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
let db;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to env file");
}

async function connectToDb(cb) {
  const client = new MongoClient(uri);
  await client.connect();
  db = client.db("todo-app-db");
  cb();
}

export { db, connectToDb };
