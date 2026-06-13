import { client, DATABASE_ID, COLLECTIONS } from "./client";

type UnsubscribeFn = () => void;

export function subscribeToMessages(chatId: string, callback: (event: any) => void): UnsubscribeFn {
  return client.subscribe(
    `databases.${DATABASE_ID}.collections.${COLLECTIONS.MESSAGES}.documents`,
    (response: any) => {
      if (response.payload?.chatId === chatId) {
        callback(response);
      }
    }
  );
}

export function subscribeToChats(userId: string, callback: (event: any) => void): UnsubscribeFn {
  return client.subscribe(
    `databases.${DATABASE_ID}.collections.${COLLECTIONS.CHATS}.documents`,
    (response: any) => {
      // Notice: If chats can be huge, we might only notify if memberIds includes userId.
      if (response.payload?.memberIds?.includes(userId)) {
        callback(response);
      }
    }
  );
}

export function subscribeToFriendRequests(userId: string, callback: (event: any) => void): UnsubscribeFn {
  return client.subscribe(
    `databases.${DATABASE_ID}.collections.${COLLECTIONS.FRIENDS}.documents`,
    (response: any) => {
      if (response.payload?.friendId === userId || response.payload?.userId === userId) {
        callback(response);
      }
    }
  );
}

export function subscribeToNotifications(userId: string, callback: (event: any) => void): UnsubscribeFn {
  return client.subscribe(
    `databases.${DATABASE_ID}.collections.${COLLECTIONS.NOTIFICATIONS}.documents`,
    (response: any) => {
      if (response.payload?.userId === userId) {
        callback(response);
      }
    }
  );
}
