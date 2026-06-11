const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomSegment(len: number): string {
  let s = "";
  for (let i = 0; i < len; i++) {
    s += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return s;
}

export function generateUserId(): string {
  return `${randomSegment(4)}-${randomSegment(4)}-${randomSegment(4)}`;
}

export function getStoredUserId(): string | null {
  return localStorage.getItem("chat_user_id");
}

export function storeUserId(id: string): void {
  localStorage.setItem("chat_user_id", id);
}

export function getOrCreateUserId(): string {
  const existing = getStoredUserId();
  if (existing) return existing;
  const newId = generateUserId();
  storeUserId(newId);
  return newId;
}
