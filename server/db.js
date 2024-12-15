import { MongoClient } from "mongodb";
import { config } from "dotenv";

config();
async function connecttToDatabase() {
  try {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    let db = client.db(process.env.DB_NAME);
    console.log("Uspjesno spajanje na bazu podataka.");
    return db;
  } catch (e) {
    console.log("Doslo je do spajanja na bazu podataka!");
    throw e;
  }
}
export { connecttToDatabase };
