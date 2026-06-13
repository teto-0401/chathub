import { databases, DATABASE_ID, COLLECTIONS } from "./client";
import { ID, Query, AppwriteException } from "appwrite";

export async function upsertUser(userId: string, nickname: string) {
  try {
    const existing = await findUserById(userId);
    if (existing) {
      return await databases.updateDocument(DATABASE_ID, COLLECTIONS.USERS, existing.$id, {
        nickname,
        lastSeenAt: new Date().toISOString()
      });
    }
    return await databases.createDocument(DATABASE_ID, COLLECTIONS.USERS, ID.unique(), {
      userId,
      nickname,
      isOnline: true,
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof AppwriteException && error.code === 404) {
      return await databases.createDocument(DATABASE_ID, COLLECTIONS.USERS, ID.unique(), {
        userId,
        nickname,
        isOnline: true,
        lastSeenAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
    }
    throw error;
  }
}

export async function findUserById(userId: string) {
  try {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.USERS, [
      Query.equal("userId", userId),
      Query.limit(1)
    ]);
    return response.documents.length > 0 ? response.documents[0] : null;
  } catch {
    return null;
  }
}

export async function getChats(userId: string) {
  try {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CHATS, [
      Query.contains("memberIds", userId)
    ]);
    return response.documents.slice().reverse();
  } catch (err) {
    console.error("getChats error:", err);
    return [];
  }
}

export async function sendMessage(
  chatId: string,
  senderId: string,
  senderName: string,
  content: string,
  type: string,
  replyToId?: string,
  fileId?: string,
  fileName?: string
) {
  const now = new Date().toISOString();
  const data: Record<string, unknown> = {
    chatId,
    senderId,
    senderName,
    type,
    content,
    isPinned: false,
    readBy: [senderId],
    createdAt: now
  };
  if (fileId) data.fileId = fileId;
  if (fileName) data.fileName = fileName;
  if (replyToId) data.replyToId = replyToId;

  return await databases.createDocument(DATABASE_ID, COLLECTIONS.MESSAGES, ID.unique(), data);
}

export async function getMessages(chatId: string, limit = 50) {
  const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.MESSAGES, [
    Query.equal("chatId", chatId),
    Query.orderDesc("createdAt"),
    Query.limit(limit)
  ]);
  return response.documents.reverse();
}

export async function markAsRead(messageId: string, userId: string, currentReadBy: string[]) {
  if (currentReadBy.includes(userId)) return;
  return await databases.updateDocument(DATABASE_ID, COLLECTIONS.MESSAGES, messageId, {
    readBy: [...currentReadBy, userId]
  });
}

export async function sendFriendRequest(fromUserId: string, toUserId: string) {
  return await databases.createDocument(DATABASE_ID, COLLECTIONS.FRIENDS, ID.unique(), {
    userId: fromUserId,
    friendId: toUserId,
    status: "pending",
    createdAt: new Date().toISOString()
  });
}

export async function acceptFriendRequest(friendDocId: string) {
  return await databases.updateDocument(DATABASE_ID, COLLECTIONS.FRIENDS, friendDocId, {
    status: "accepted"
  });
}

export async function rejectFriendRequest(friendDocId: string) {
  return await databases.deleteDocument(DATABASE_ID, COLLECTIONS.FRIENDS, friendDocId);
}

export async function getFriends(userId: string) {
  const [sent, received] = await Promise.all([
    databases.listDocuments(DATABASE_ID, COLLECTIONS.FRIENDS, [Query.equal("userId", userId)]),
    databases.listDocuments(DATABASE_ID, COLLECTIONS.FRIENDS, [Query.equal("friendId", userId)])
  ]);
  return [...sent.documents, ...received.documents];
}

export async function getOrCreateDirectChat(userId: string, friendId: string) {
  try {
    const existingChats = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CHATS, [
      Query.contains("memberIds", userId)
    ]);
    const existing = existingChats.documents.find(chat => chat.memberIds.includes(friendId));
    if (existing) return existing;

    const now = new Date().toISOString();
    return await databases.createDocument(DATABASE_ID, COLLECTIONS.CHATS, ID.unique(), {
      type: "direct",
      memberIds: [userId, friendId],
      createdBy: userId,
      createdAt: now
    });
  } catch (err) {
    console.error("getOrCreateDirectChat error:", JSON.stringify(err));
    throw err;
  }
}

export async function createGroupChat(name: string, memberIds: string[], createdBy: string) {
  const now = new Date().toISOString();
  return await databases.createDocument(DATABASE_ID, COLLECTIONS.CHATS, ID.unique(), {
    type: "group",
    name,
    memberIds: [...memberIds, createdBy],
    createdBy,
    createdAt: now
  });
}

export async function toggleReaction(messageId: string, emoji: string, userId: string, currentReactionsRaw: string | null) {
  const reactions = currentReactionsRaw ? JSON.parse(currentReactionsRaw) : {};
  if (!reactions[emoji]) reactions[emoji] = [];
  if (reactions[emoji].includes(userId)) {
    reactions[emoji] = reactions[emoji].filter((id: string) => id !== userId);
    if (reactions[emoji].length === 0) delete reactions[emoji];
  } else {
    reactions[emoji].push(userId);
  }
  return await databases.updateDocument(DATABASE_ID, COLLECTIONS.MESSAGES, messageId, {
    reactions: JSON.stringify(reactions)
  });
}

export async function deleteMessage(messageId: string) {
  return await databases.updateDocument(DATABASE_ID, COLLECTIONS.MESSAGES, messageId, {
    deletedAt: new Date().toISOString()
  });
}

export async function editMessage(messageId: string, newContent: string) {
  return await databases.updateDocument(DATABASE_ID, COLLECTIONS.MESSAGES, messageId, {
    content: newContent,
    editedAt: new Date().toISOString()
  });
}

export async function pinMessage(messageId: string, isPinned: boolean) {
  return await databases.updateDocument(DATABASE_ID, COLLECTIONS.MESSAGES, messageId, { isPinned });
}

export async function updatePresence(documentId: string, isOnline: boolean) {
  return await databases.updateDocument(DATABASE_ID, COLLECTIONS.USERS, documentId, {
    isOnline,
    lastSeenAt: new Date().toISOString()
  });
}
