# ChatHub — LINE/Discord風チャットアプリ

Appwrite Cloudをバックエンドに使ったリアルタイムチャットアプリ。ユーザー登録不要で、初回アクセス時にランダムIDを生成してすぐ使い始められる。

## Run & Operate

- `pnpm --filter @workspace/chat-app run dev` — フロントエンド開発サーバー (PORT環境変数で指定)
- `pnpm run typecheck` — 全パッケージのタイプチェック
- `pnpm run build` — タイプチェック + ビルド
- Required env: `VITE_APPWRITE_ENDPOINT`, `VITE_APPWRITE_PROJECT_ID`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS
- Backend: Appwrite Cloud (Databases, Realtime, Storage, Anonymous Sessions)
- PWA: vite-plugin-pwa
- Build: 静的サイトとしてビルド可能 (`dist/public/`)

## Where things live

- `artifacts/chat-app/src/services/appwrite/` — Appwrite連携コード（client, auth, database, storage, realtime）
- `artifacts/chat-app/src/contexts/AppContext.tsx` — グローバル状態（currentUser, theme, activeChatId）
- `artifacts/chat-app/src/hooks/` — カスタムフック（useChats, useMessages, useFriends等）
- `artifacts/chat-app/src/components/layout/` — 3カラムレイアウト（AppLayout, Sidebar, ChatArea, RightPanel）
- `artifacts/chat-app/src/components/chat/` — チャットUI（MessageList, MessageItem, MessageInput等）
- `artifacts/chat-app/src/components/friends/` — 友達機能（FriendList, FriendItem, AddFriend）
- `artifacts/chat-app/src/pages/` — SetupPage（初回設定）, ChatPage（メイン）
- `artifacts/chat-app/src/lib/userId.ts` — ランダムユーザーID生成（XXXX-XXXX-XXXX形式）

## Architecture decisions

- **Appwriteのみ使用**: バックエンドサーバー不要。全DB操作はAppwrite SDKで直接フロントエンドから実行。
- **匿名セッション**: Appwrite Anonymous Sessionを使用。ユーザー登録・メール認証不要。
- **ランダムID**: `YUGO-7X4P-K92M`形式のIDをlocalStorageに保存。これがアカウント代わり。
- **リアルタイム**: Appwrite Realtimeでメッセージ・チャット・友達申請をリアルタイム更新。
- **静的ビルド**: `vite build`で`dist/public/`に静的ファイル生成。Render等のサーバー不要。
- **ダークモードデフォルト**: `:root`と`.dark`で同じダークテーマを適用。`.light`クラスでライトモード。

## Product

- 1対1チャットとグループチャット
- リアルタイムメッセージ更新
- テキスト・画像・ファイル送信
- 友達申請・承認・拒否
- ユーザーID検索
- PWA対応（オフラインキャッシュ）
- ダーク/ライトモード切替

## Appwrite Setup（初回必須）

1. **Web Platform追加**: Appwrite Console → Project Settings → Platforms → Add Platform → Web。ホスト名に`*`または実際のドメインを設定。
2. **Database作成**: ID `chat-db` のデータベースを作成。
3. **Collections作成**（以下5つ、権限はAny read/write）:
   - `users`: userId, nickname, avatarUrl, isOnline, lastSeenAt, createdAt
   - `friends`: userId, friendId, status, createdAt
   - `chats`: type, name, avatarUrl, memberIds(array), lastMessage, lastMessageAt, createdBy, createdAt
   - `messages`: chatId, senderId, senderName, type, content, fileId, fileName, replyToId, reactions, editedAt, deletedAt, isPinned, readBy(array), createdAt
   - `notifications`: userId, type, title, body, chatId, isRead, createdAt
4. **Storage Bucket作成**: ID `chat-files`、権限はAny read/write。

## User preferences

- 静的サイトとしてビルド可能（Render Web Service不使用）
- Chromebookを最優先に設計
- PCファーストUI
- コードは省略せず完全実装

## Gotchas

- `VITE_APPWRITE_ENDPOINT`と`VITE_APPWRITE_PROJECT_ID`が未設定だとAppwriteに接続できない。
- Appwrite ConsoleでWebプラットフォームを追加しないと`Project is not accessible in this region`エラーが発生する（CORSの問題ではなくプロジェクト設定の問題）。
- `memberIds`のようなArray型フィールドはAppwriteで`string[]`として定義すること。
- Appwrite Realtimeのチャンネル文字列は`databases.<db-id>.collections.<col-id>.documents`の形式。

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
