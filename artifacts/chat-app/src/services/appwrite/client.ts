import { Client, Account, Databases, Storage, Realtime } from "appwrite";

export const ENDPOINT = "https://sgp.cloud.appwrite.io/v1";
export const PROJECT_ID = "6a2a14fd0026dd2c2de2";

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const realtime = new Realtime(client);
export { client };

export const DATABASE_ID = "chat-db";
export const STORAGE_BUCKET_ID = "chat-files";

export const COLLECTIONS = {
  USERS: "users",
  FRIENDS: "friends",
  CHATS: "chats",
  MESSAGES: "messages",
  NOTIFICATIONS: "notifications",
} as const;
