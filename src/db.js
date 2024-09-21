const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
const DbName = process.env.DB_NAME;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to env file");
}

let client = null;
let db = null;

async function connectToDb() {
  try {
    if (client && db) {
      return { client, db };
    }
    if (process.env.NODE_ENV === "development") {
      if (!global._client) {
        client = await new client(uri).connect();
        global._client = client;
      } else {
        client = global._client;
      }
    } else {
      client = await new MongoClient(uri).connect();
    }
    db = await client.db(DbName);
    console.log("Sucessfully connected to Database");
    return { client, db };
  } catch (err) {
    console.error(err);
  }
}

module.exports = connectToDb;
