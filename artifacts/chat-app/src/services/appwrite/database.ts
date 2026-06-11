import { databases, DATABASE_ID, COLLECTIONS } from "./client";
import { ID, Query, AppwriteException } from "appwrite";

// ユーザー登録・更新
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

// ユーザー検索（IDで）
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

// チャット一覧取得（自分が所属するもの）
export async function getChats(userId: string) {
  const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CHATS, [
    Query.contains("memberIds", userId),
    Query.orderDesc("lastMessageAt")
  ]);
  return response.documents;
}

// メッセージ送信
export async function sendMessage(chatId: string, senderId: string, senderName: string, content: string, type: string, replyToId?: string, fileId?: string, fileName?: string) {
  const now = new Date().toISOString();
  const message = await databases.createDocument(DATABASE_ID, COLLECTIONS.MESSAGES, ID.unique(), {
    chatId,
    senderId,
    senderName,
    type,
    content,
    fileId: fileId || null,
    fileName: fileName || null,
    replyToId: replyToId || null,
    isPinned: false,
    readBy: [senderId],
    createdAt: now
  });

  await databases.updateDocument(DATABASE_ID, COLLECTIONS.CHATS, chatId, {
    lastMessage: type === 'text' ? content : (type === 'image' ? '画像を送信' : 'ファイルを送信'),
    lastMessageAt: now
  });

  return message;
}

// メッセージ取得
export async function getMessages(chatId: string, limit = 50) {
  const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.MESSAGES, [
    Query.equal("chatId", chatId),
    Query.orderDesc("createdAt"),
    Query.limit(limit)
  ]);
  return response.documents.reverse(); // 古い順にする
}

// 既読マーク
export async function markAsRead(messageId: string, userId: string, currentReadBy: string[]) {
  if (currentReadBy.includes(userId)) return;
  return await databases.updateDocument(DATABASE_ID, COLLECTIONS.MESSAGES, messageId, {
    readBy: [...currentReadBy, userId]
  });
}

// 友達申請
export async function sendFriendRequest(fromUserId: string, toUserId: string) {
  return await databases.createDocument(DATABASE_ID, COLLECTIONS.FRIENDS, ID.unique(), {
    userId: fromUserId,
    friendId: toUserId,
    status: "pending",
    createdAt: new Date().toISOString()
  });
}

// 友達一覧取得
export async function getFriends(userId: string) {
  const [sent, received] = await Promise.all([
    databases.listDocuments(DATABASE_ID, COLLECTIONS.FRIENDS, [Query.equal("userId", userId)]),
    databases.listDocuments(DATABASE_ID, COLLECTIONS.FRIENDS, [Query.equal("friendId", userId)])
  ]);
  return [...sent.documents, ...received.documents];
}

// DMチャット作成 or 既存のDM取得
export async function getOrCreateDirectChat(userId: string, friendId: string) {
  const existingChats = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CHATS, [
    Query.equal("type", "direct"),
    Query.contains("memberIds", userId)
  ]);

  const existing = existingChats.documents.find(chat => chat.memberIds.includes(friendId));
  if (existing) return existing;

  const now = new Date().toISOString();
  return await databases.createDocument(DATABASE_ID, COLLECTIONS.CHATS, ID.unique(), {
    type: "direct",
    memberIds: [userId, friendId],
    createdBy: userId,
    createdAt: now,
    lastMessageAt: now
  });
}

// グループ作成
export async function createGroupChat(name: string, memberIds: string[], createdBy: string) {
  const now = new Date().toISOString();
  return await databases.createDocument(DATABASE_ID, COLLECTIONS.CHATS, ID.unique(), {
    type: "group",
    name,
    memberIds: [...memberIds, createdBy],
    createdBy,
    createdAt: now,
    lastMessageAt: now
  });
}

// リアクション追加/削除
export async function toggleReaction(messageId: string, emoji: string, userId: string, currentReactionsRaw: string | null) {
  const reactions = currentReactionsRaw ? JSON.parse(currentReactionsRaw) : {};
  if (!reactions[emoji]) {
    reactions[emoji] = [];
  }
  
  if (reactions[emoji].includes(userId)) {
    reactions[emoji] = reactions[emoji].filter((id: string) => id !== userId);
    if (reactions[emoji].length === 0) {
      delete reactions[emoji];
    }
  } else {
    reactions[emoji].push(userId);
  }

  return await databases.updateDocument(DATABASE_ID, COLLECTIONS.MESSAGES, messageId, {
    reactions: JSON.stringify(reactions)
  });
}

// メッセージ削除（論理削除）
export async function deleteMessage(messageId: string) {
  return await databases.updateDocument(DATABASE_ID, COLLECTIONS.MESSAGES, messageId, {
    deletedAt: new Date().toISOString()
  });
}

// メッセージ編集
export async function editMessage(messageId: string, newContent: string) {
  return await databases.updateDocument(DATABASE_ID, COLLECTIONS.MESSAGES, messageId, {
    content: newContent,
    editedAt: new Date().toISOString()
  });
}

// ピン留め
export async function pinMessage(messageId: string, isPinned: boolean) {
  return await databases.updateDocument(DATABASE_ID, COLLECTIONS.MESSAGES, messageId, {
    isPinned
  });
}

// オンライン状態更新
export async function updatePresence(documentId: string, isOnline: boolean) {
  return await databases.updateDocument(DATABASE_ID, COLLECTIONS.USERS, documentId, {
    isOnline,
    lastSeenAt: new Date().toISOString()
  });
}
