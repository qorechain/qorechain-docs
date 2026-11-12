---
slug: /build-before-qday/workshop-1/apps/qday-guestbook
title: Q-Day Guestbook
sidebar_label: Q-Day Guestbook
sidebar_position: 2
---

# Q-Day Guestbook

Q-Day Guestbook は、QoreChain EVM テストネット上のオンチェーンのゲストブックです。誰でも、アドレスごとに1回、140文字までのメッセージで署名できます。2つの部分で構成されています。Solidity コントラクトと Hardhat プロジェクト（`contracts-app/`）、そして QoreX ウォレットを接続し、アカウントの EVM ウィンドウを表示し、最新の署名をライブで一覧表示する React のウェブページ（`web/`）です。

## 確認できること {#shows}

- **意識しなくてもハイブリッドで署名するブラウザー dApp。** このページは、通常の wagmi と RainbowKit のアプリです。署名の ML-DSA-87 の半分は QoreX が追加するため、同じトランザクションが secp256k1 とポスト量子鍵の両方で保護されます。
- **EVM ウィンドウがインターフェースに表示されます。** ページはアカウントのウィンドウをチェーンから読み取り、有効かどうか、残りのブロック数とトランザクション数を表示します。
- **わかりやすい拒否理由。** チェーンが書き込みを拒否すると、`classifyEvmWindowRejection` がそのエラーを4つの原因（登録済みの鍵がない、ウィンドウがない、ウィンドウを使い切った、パラメーターが不正）のどれかに対応づけ、ページが対処方法を表示します。
- **オンチェーンで検証されたハイブリッド署名。** 書き込んだ署名はそれぞれ1件のトランザクションで、チェーンは両方の署名（ML-DSA-87 と secp256k1）を確認してから受け付けています。

## 始める前に {#prerequisites}

macOS、Linux、または WSL か Git Bash を使う Windows のターミナルと、次のツールが必要です。

| ツール | 必要なバージョン | 確認コマンド |
| --- | --- | --- |
| Git | 比較的新しいバージョンなら何でも | `git --version` |
| Node.js | 20.12 以降（22 LTS を推奨） | `node --version` |
| pnpm | 9 以降 | `pnpm --version` |

Node.js は https://nodejs.org からインストールします。`pnpm --version` が失敗する場合は、`npm install -g pnpm`（または `corepack enable`）で pnpm をインストールして、もう一度確認してください。

フォーセット用の[QoreChain ダッシュボード](https://dashboard.qorechain.io)の無料アカウントと、ブラウザー部分で使う QoreX ウォレット（デスクトップブラウザーの拡張機能、またはアプリ）も必要です。[QoreX インテグレーション](/developer-tools/qorex-integrations)と [QoreX の概要](/qorex/overview)を参照してください。コントラクトのステップでは、実際のウォレットは使いません。使い捨てのテストネットアカウントを使います。テストネットの QOR に価値はありません。

## ステップバイステップ {#steps}

### 1. コードを取得する {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/02-qday-guestbook
```

このプロジェクトには2つのフォルダーがあり、それぞれ別にセットアップします。

### 2. コントラクト: インストールとテスト {#step-contract-install}

```sh
cd contracts-app
pnpm install
pnpm test
```

`QDayGuestbook` のテストについて、`3 passing` と表示されるはずです。テストはローカルのシミュレートされたチェーン上で動き、鍵は不要です。

### 3. コントラクト: テストネット用の鍵ファイルを作る {#step-account}

```sh
cp .env.example .env
```

`.env` ファイルには使い捨ての鍵が入ります。コミットしないでください。また、その鍵を本物の用途に流用しないでください。`.env` を好きなエディターで開き、2つの値を入力します。

**a. 使い捨ての秘密鍵。** ランダムな 32 バイトの鍵を生成します。

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

表示された `0x...` の値を `.env` に `PRIVATE_KEY=0x...` としてコピーし、ゼロだけのプレースホルダーを置き換えます。

**b. ポスト量子のリカバリーコード。** アカウントの ML-DSA-87 鍵は、別のリカバリーコードから導出されます。1つ作成します。

```sh
pnpm window recovery-code
```

表示された `QRC1-...` の行を、`.env` に `QORE_PQC_RECOVERY_CODE=QRC1-...` としてコピーします。常に同じコードを使い続けてください。新しいコードにすると、アカウントの ML-DSA-87 鍵が別のものになります。

`QORE_MNEMONIC` は空のままにし、`QORE_NETWORK=testnet` は維持します。`.env` は次のようになります（プレースホルダーで示しています）。

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

### 4. コントラクト: アカウントに資金を入れる {#step-faucet}

```sh
pnpm window status
```

1行目に、アカウントが `0x...` と `qor1...` の形式で表示されます。`qor1...` のアドレスをコピーして、次の手順に進みます。

1. https://dashboard.qorechain.io/faucet を開いてサインインします。
2. `qor1...` のアドレスを貼り付けて、QOR をリクエストします（24時間に1回、100 QOR）。
3. 数秒待ってから、もう一度 `pnpm window status` を実行します。

### 5. コントラクト: 鍵を登録し、ウィンドウを開いて、デプロイする {#step-window}

```sh
pnpm window register        # once: registers your ML-DSA-87 key
pnpm window open            # hybrid-signed: opens a window (600 blocks, 5 transactions)
sleep 10                    # opening the window advances the account's nonce
pnpm deploy:testnet         # Hardhat Ignition, answer y when asked to confirm
```

`pnpm deploy:testnet` は、デプロイされた `QDayGuestbook` のアドレス（`0x...`）を表示します。これをコピーしてください。登録は、チェーンが従来型の署名で受け付ける唯一のメッセージです。チェーン上にはまだ照合先の鍵がないためです。ウィンドウを開くときの署名はハイブリッドです。表示されるトランザクションハッシュを控えておいてください。

### 6. コントラクト: コマンドラインから署名する {#step-cli}

```sh
pnpm sign "Hello from my terminal"   # writes one entry
pnpm sign --read                     # lists the latest entries
```

各アドレスが署名できるのは1回だけなので、同じアカウントからの2回目の `pnpm sign` は、コントラクトに拒否されます。

### 7. ウェブページ: インストールと設定 {#step-web}

同じプロジェクトフォルダーで2つ目のターミナルを開く（または `cd ..` で戻る）か、次のコマンドを実行します。

```sh
cd web
pnpm install
cp .env.example .env
```

`web/.env` を開き、ステップ5でコピーしたアドレスを設定します。

```sh
VITE_GUESTBOOK_ADDRESS=0x...
```

`VITE_WALLETCONNECT_PROJECT_ID` は空のままにしてください。これは、`src/wagmi.ts` に WalletConnect ベースのウォレットを追加する場合にだけ必要です。

### 8. ウェブページ: 実行する {#step-run}

```sh
pnpm dev
```

QoreX をインストールしたブラウザーで http://localhost:5174 を開きます。ページは EVM RPC 経由でチェーンを読み取ります。EVM ウィンドウは、Vite のプロキシ `/lcd` を通して REST で読み取ります。公開 REST エンドポイントが CORS ヘッダーを送らないためです。下部の署名一覧には、ステップ6で書き込んだエントリがすでに表示されています。

### 9. QoreX から署名する {#step-sign}

1. QoreX をインストールして、テストネットに切り替えます。切り替え方は[5分でデプロイ](/getting-started/deploy-in-5-minutes#step-testnet)を参照してください。
2. QoreX では、ML-DSA-87 鍵を登録済みの coin-60（Ethereum）アカウントを使い、[フォーセット](/dashboard/faucet)から資金を入れます（サインイン後にそのアドレスを貼り付けます）。
3. ページで **Connect QoreX** を選び、メッセージを入力して、**Sign** を選びます。ウィンドウが開いていなければ、QoreX は承認画面で EVM ウィンドウを開くことを提案します。
4. QoreX で承認します。

### 10. エクスプローラーで検索する {#step-explorer}

https://explore.qore.network を開き、ネットワークセレクターを **Testnet** に切り替えます。ステップ6または9のトランザクションハッシュ、`pnpm window open` のハッシュ、または `QDayGuestbook` のアドレスを検索します。ウィンドウのトランザクションには、チェーンが検証したポスト量子署名が表示されます。

## 何が表示されるか {#result}

- `contracts-app` で `pnpm test` を実行すると、`3 passing` と表示されます。
- `pnpm window status` が、`PQC key: registered` と、残りのブロック数とトランザクション数を伴う `window: live` を表示します。
- `pnpm deploy:testnet` が、`QDayGuestbook` のアドレス（`0x...`）を表示します。
- `pnpm sign "..."` が、トランザクションハッシュと `status: success in block ...` を表示します。
- ページのステップ1に、あなたの `0x...` アカウント、チェーン `qorechain-diana EVM (9800)`、残高、そして残りのブロック数とトランザクション数を伴う `live` の EVM ウィンドウが表示されます。
- **Sign** を選んで QoreX で承認すると、エクスプローラーへのトランザクションリンクが表示され、続いて `success in block ...` と表示されます。
- 下部の一覧に、オンチェーンの署名の数と、最新のエントリ（最大20件）が新しい順に表示され、数秒ごとに更新されます。
- 同じアドレスからもう一度試すと、そのアドレスはすでに署名済みであると表示されます。

## コード {#code}

コントラクトはエントリーを配列に保持し、アドレスごとに署名を1回に制限します。

```solidity
uint256 public constant MAX_LENGTH = 140;
Entry[] private entries;
mapping(address => bool) public hasSigned;

function sign(string calldata message) external {
    uint256 len = bytes(message).length;
    if (len == 0 || len > MAX_LENGTH) revert BadLength();
    if (hasSigned[msg.sender]) revert AlreadySigned();
    hasSigned[msg.sender] = true;
    entries.push(Entry(msg.sender, uint64(block.timestamp), message));
    emit Signed(entries.length - 1, msg.sender, message);
}

function count() external view returns (uint256) { return entries.length; }

// the newest `limit` entries, newest first
function latest(uint256 limit) external view returns (Entry[] memory out);
```

QoreX は、コネクターの一覧（`web/src/wagmi.ts`）の最初のウォレットです。

```ts
import { qorechain, qorechainTestnet } from "@qorechain/evm";
import { qorexWallet } from "@qorechain/qorex-rainbowkit";

wallets: [() => qorexWallet({ pollAccountsOnFocus: true }), injectedWallet],
// ...
chains: [qorechainTestnet, qorechain],
```

ページはウィンドウを表示し、拒否の理由を説明します（`web/src/App.tsx`）。

```tsx
const w = await evmWindowStatus({ rest: REST, address });   // found, live, remainingBlocks, remainingTxs
const rejection = write.error ? classifyEvmWindowRejection(write.error) : undefined;
// "no-pqc-key" | "no-window" | "exhausted" | "invalid"
```

## 使用したパッケージ {#packages}

コントラクト（`contracts-app/`）:

| パッケージ | バージョン | 用途 |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | ウィンドウ用ヘルパースクリプト、ハイブリッド署名 |
| `@qorechain/evm` | ^0.13.0 | チェーン定義、`evmWindowStatus`、`evmWindowCost` |
| `@cosmjs/stargate` | ^0.39.0 | ウィンドウのメッセージのブロードキャスト |
| `hardhat` | ^3.21.1 | コンパイル、テスト、Ignition によるデプロイ |
| `viem` | ^2.47.6 | Ethereum クライアント |
| `tsx` | ^4.19.0 | TypeScript スクリプトの実行 |
| `typescript` | ^5.6.3 | 型チェック |

ウェブページ（`web/`）:

| パッケージ | バージョン | 用途 |
| --- | --- | --- |
| `@qorechain/evm` | ^0.13.0 | チェーン定義、`evmWindowStatus`、`classifyEvmWindowRejection` |
| `@qorechain/qorex-rainbowkit` | ^0.1.0 | RainbowKit のウォレットとしての QoreX |
| `@rainbow-me/rainbowkit` | ^2.2.11 | 接続ボタン |
| `wagmi` | ^2.19.5 | 読み取りと書き込みのための React フック |
| `viem` | ^2.53.1 | Ethereum クライアント |
| `@tanstack/react-query` | ^5.59.0 | ウィンドウとチェーンの読み取りのためのデータ取得 |
| `react`、`react-dom` | ^18.3.1 | インターフェース |
| `vite` | ^5.4.0 | 開発サーバー |
| `@vitejs/plugin-react` | ^4.3.0 | Vite の React サポート |
| `typescript` | ^5.6.3 | 型チェック |

ソース: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/02-qday-guestbook
