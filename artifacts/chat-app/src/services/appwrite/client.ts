import { Client, Account, Databases, Storage, Realtime } from "appwrite";

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || "not-configured";

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

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
