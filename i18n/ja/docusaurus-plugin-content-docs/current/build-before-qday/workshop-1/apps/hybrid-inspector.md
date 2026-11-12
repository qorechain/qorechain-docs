---
slug: /build-before-qday/workshop-1/apps/hybrid-inspector
title: Hybrid Inspector
sidebar_label: Hybrid Inspector
sidebar_position: 3
---

# Hybrid Inspector

Hybrid Inspector は、QoreChain のハイブリッド署名がテストネット `qorechain-diana` 上でどのように見えるかを示す、小さな React ページです。QoreX ウォレットを接続し、QoreX が secp256k1 と ML-DSA-87 の両方で署名するトランザクションを1件送ると、ページがそのトランザクションを分解して見せます。従来型の署名、ポスト量子署名、そしてチェーン自身の判定です。テストネットの任意のトランザクションハッシュを貼り付けることもできます。

## 確認できること {#what-it-shows}

- **ウェブページからの ML-DSA-87 + secp256k1 ハイブリッド署名。** ページは、エンコードしたメッセージを `qorexSignAndBroadcast` で QoreX に渡します。QoreX が両方の鍵で署名し、ブロードキャストします。
- **オンチェーンで検証された、ハイブリッド署名トランザクション1件。** ページは、そのトランザクションについてチェーンの `pqc_hybrid_verify` イベントを読み取ります。このイベントは、チェーンがポスト量子署名を確認したことを示します。
- **サイズが見えます。** 従来型の署名は 64 バイトです。ML-DSA-87 署名（FIPS 204）は 4,627 バイトで、トランザクションの `PQCHybridSignature` 拡張に載って運ばれます。

## ステップバイステップ {#steps}

### 1. ツールをインストールする

Chromium ベースのブラウザー（Chrome、Edge、Brave）、Git、Node.js 20 以降、pnpm が必要です。

- Git: https://git-scm.com/downloads
- Node.js 20 以降: https://nodejs.org（LTS リリースで問題ありません）
- pnpm: `npm install -g pnpm`

バージョンを確認します。

```sh
git --version
node --version     # v20.0.0 or higher
pnpm --version     # 9 or higher
```

### 2. QoreX ブラウザー拡張機能をインストールする

お使いのブラウザーのストアから QoreX をインストールします。詳しくは [QoreX インテグレーション](/developer-tools/qorex-integrations)と [dApp ブラウザー](/qorex/dapp-browser)を参照してください。

### 3. QoreX で使い捨てのテストネットアカウントを作る

このワークショップでは、実際のウォレットは一切必要ありません。QoreX で、この演習だけに使う**新しい**アカウント（新しいプロファイルか、新しいウォレット）を作成し、テストネット `qorechain-diana` に切り替えます。テストネットへの切り替え方は[5分でデプロイ](/getting-started/deploy-in-5-minutes#step-testnet)を参照してください。アカウントを作成すると、QoreX がリカバリーフレーズを表示します。紙に書き留めて他人に見せず、メインネットでは決して使い回さないでください。このアカウントには、この演習以外の価値はありません。

アカウントのアドレス（`qor1...` で始まります）をコピーします。

### 4. フォーセットでテストネット QOR を受け取る

1. https://dashboard.qorechain.io/faucet を開いてサインインします。
2. `qor1...` のアドレスを貼り付けて、受け取ります。1回の受け取りで 100 QOR が支払われ、アカウントごとに24時間に1回です。

### 5. コードを取得する

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/03-hybrid-inspector
```

### 6. 依存関係をインストールする

```sh
pnpm install
```

### 7. ビルドできることを確認する

```sh
pnpm build
```

このコマンドは、プロジェクトの型チェックとビルドを行います。最後に `built in` と所要時間が表示されます。

### 8. ページを実行する

```sh
pnpm dev
```

QoreX をインストールしたブラウザーで http://localhost:5173 を開きます。アドレスに `?tx=<HASH>` を付ける（`http://localhost:5173?tx=<HASH>`）と、トランザクションを直接調べられます。ポート 5173 がすでに使われている場合は、Vite が代わりに使うポートを表示します。

REST の呼び出しは、Vite のプロキシ `/lcd` を通して `https://api-testnet.qore.host` に送られます。公開 REST エンドポイントが CORS ヘッダーを送らないためです。このページはテストネットでのみ動作し、`.env` ファイルは不要です。

### 9. 接続して、送信し、検証する

1. **Connect QoreX** をクリックします。ページに、あなたのアドレス（`qor1...`）、テストネットの残高、ML-DSA-87 鍵が登録済みかどうかが表示されます。QoreX は最初の送信時に鍵を登録します。
2. メモを付けて、少額の QOR を**送信**します。QoreX が署名する内容を表示し、承認を求めます。
3. ページがトランザクションを自動的に調べます。64 文字のテストネットのトランザクションハッシュを貼り付けて調べることもできます。

## コード {#code}

接続と送信です。

```ts
import { getQorexNative, qorexSignAndBroadcast } from "@qorechain/qorex-types";

const native = getQorexNative();
await native.enable("qorechain-diana");
const key = await native.getKey("qorechain-diana");      // key.bech32Address

const r = await qorexSignAndBroadcast({
  chainId: "qorechain-diana",
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: msgSendBytes(from, to, uqor) }],
  memo,
});                                                       // r.txHash, r.code, r.shield
```

チェーンから証拠を読み取ります。

```ts
const res = await fetch(`/lcd/cosmos/tx/v1beta1/txs/${hash}`).then((r) => r.json());
const tx = res.tx;
const ext = [...(tx.body.extension_options ?? []), ...(tx.body.non_critical_extension_options ?? [])];
const hyb = ext.find((x) => String(x["@type"]).includes("PQCHybridSignature"));
const verify = (res.tx_response.events ?? []).filter((e) => e.type === "pqc_hybrid_verify");
// classical signature: atob(tx.signatures[0]).length  -> 64
// ML-DSA-87 signature: atob(hyb.pqc_signature).length -> 4627
```

QoreX はエンコード済みのメッセージを受け取るため、`msgSendBytes` は、bank の `MsgSend` メッセージ用に `src/App.tsx` にある小さな protobuf エンコーダーです。ページは、コードが 0 で、`pqc_hybrid_verify` イベントのステータスが `verified` で、ポスト量子署名が 4,627 バイトのとき、そのトランザクションをハイブリッド検証済みと表示します。

## 何が表示されるか {#result}

- ヘッダーに `qorechain-diana (testnet)` と、上がり続けるブロック高が表示されます。
- 接続後: あなたのアドレス、残高、鍵のステータス。
- 送信後: トランザクションハッシュと結果コード、続いて調査カード。カードには、メモ、メッセージの種類、64 バイトの従来型署名、先頭バイトを16進で示した 4,627 バイトの ML-DSA-87 署名、アルゴリズム名 `ML-DSA-87 (FIPS 204)`、そして `pqc_hybrid_verify` の判定が表示されます。
- エクスプローラーでは、https://explore.qore.network を開き、**Testnet** に切り替えて、トランザクションハッシュを検索します。

## 使用したパッケージ {#packages}

| パッケージ | バージョン | 用途 |
| --- | --- | --- |
| `@qorechain/qorex-types` | 0.1.0（固定） | `getQorexNative`、`qorexSignAndBroadcast` |
| `@qorechain/sdk` | ^0.13.0 | 依存関係として記載。ページ自体は単純な REST 呼び出しを使います |
| `react`、`react-dom` | ^18.3.1 | インターフェース |
| `@vitejs/plugin-react` | ^4.3.0 | Vite の React プラグイン |
| `vite` | ^5.4.0 | 開発サーバーとビルド |
| `typescript` | ^5.6.3 | 型チェック |

## ソースコード {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/03-hybrid-inspector
