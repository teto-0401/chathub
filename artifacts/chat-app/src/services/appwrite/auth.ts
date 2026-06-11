import { account } from "./client";
import { AppwriteException } from "appwrite";

export async function ensureAnonymousSession(): Promise<void> {
  try {
    await account.get();
  } catch (e) {
    if (e instanceof AppwriteException && e.code === 401) {
      await account.createAnonymousSession();
    } else {
      throw e;
    }
  }
}

export async function getCurrentSession() {
  try {
    return await account.get();
  } catch {
    return null;
  }
}
