import { Client, Account, Databases, Storage, Realtime } from "appwrite";

const client = new Client()
    .setEndpoint("https://sgp.cloud.appwrite.io/v1")
    .setProject("6a2a14fd0026dd2c2de2");

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
