import { storage, STORAGE_BUCKET_ID, ENDPOINT, PROJECT_ID } from "./client";
import { ID } from "appwrite";

export async function uploadFile(file: File): Promise<string> {
  const result = await storage.createFile(STORAGE_BUCKET_ID, ID.unique(), file);
  return result.$id;
}

export function getFilePreviewUrl(fileId: string): string {
  return `${ENDPOINT}/storage/buckets/${STORAGE_BUCKET_ID}/files/${fileId}/preview?project=${PROJECT_ID}`;
}

export function getFileDownloadUrl(fileId: string): string {
  return `${ENDPOINT}/storage/buckets/${STORAGE_BUCKET_ID}/files/${fileId}/download?project=${PROJECT_ID}`;
}
