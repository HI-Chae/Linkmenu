import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI ?? process.env.MONGODB_URL ?? process.env.MONGDB_URL;

if (!uri) {
  throw new Error("MongoDB 연결 문자열 환경 변수가 설정되지 않았습니다. (MONGODB_URI / MONGODB_URL / MONGDB_URL)");
}

const client = new MongoClient(uri);

let cachedClient: MongoClient | null = null;

export async function getMongoClient() {
  if (!cachedClient) {
    cachedClient = await client.connect();
  }

  return cachedClient;
}

export async function getDatabase() {
  const mongoClient = await getMongoClient();
  return mongoClient.db();
}
