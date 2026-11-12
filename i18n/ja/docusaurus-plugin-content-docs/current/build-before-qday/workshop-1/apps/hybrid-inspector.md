---
slug: /build-before-qday/workshop-1/apps/hybrid-inspector
title: Hybrid Inspector
sidebar_label: Hybrid Inspector
sidebar_position: 3
---

# Hybrid Inspector

Hybrid Inspector は、テストネット `qorechain-diana` 上の QoreChain ハイブリッド署名がどのようなものかを表示する小さなウェブページ（React 製）です。QoreX ウォレットを接続し、QoreX が secp256k1 と ML-DSA-87 の両方で署名するトランザクションを1つ送信すると、ページがそのトランザクションを分解して見せてくれます。従来型の署名、耐量子署名、そしてチェーン自身の検証結果です。任意のテストネットのトランザクションハッシュを貼り付けて調べることもできます。

**所要時間:** インストールを含めて約20分です。その後は、ページは数秒で動きます。

## 何がわかるか {#what-it-shows}

- **ウェブページからの ML-DSA-87 + secp256k1 ハイブリッド署名。** ページは `qorexSignAndBroadcast` を使って、エンコードしたメッセージを QoreX に渡します。QoreX は両方の鍵で署名し、ブロードキャストします。
- **チェーン上で検証されたハイブリッド署名付きトランザクション1件。** ページは、そのトランザクションについてチェーンが出す `pqc_hybrid_verify` イベントを読み取ります。このイベントは、チェーンが耐量子署名を確認したことを示すものです。
- **サイズが目に見えます。** 従来型の署名は 64 バイトです。ML-DSA-87 の署名（FIPS 204）は 4,627 バイトで、トランザクションの `PQCHybridSignature` 拡張に載って運ばれます。

## 手順 {#steps}

作業は、お使いのターミナルとブラウザで行います。使うのは使い捨てのテストネットアカウントだけです。テストネットの QOR に価値はありません。ここで本物のウォレットや本物の資金を使わないでください。

### 1. 始める前に: ツールをインストールする {#install}

必要なものは4つです。Chromium ベースのブラウザ（Chrome、Edge、Brave）、**Git**（コードをダウンロードします）、**Node.js**（ページのツールを動かします）、**pnpm**（ページのライブラリをインストールします）。Node.js は 22 以降を使ってください。このページ自体は Node.js 20 でも動きますが、すべてのワークショップアプリで安全なのは 22 です。

**macOS**

| ツール | インストール方法 | 確認方法 |
| --- | --- | --- |
| Git | `xcode-select --install`（または `brew install git`） | `git --version` |
| Node.js 22+ | https://nodejs.org から LTS のインストーラーをダウンロードするか、`brew install node` を実行します | `node --version`（v22 以上と表示される必要があります） |
| pnpm | `npm install -g pnpm` | `pnpm --version` |

**Windows**（PowerShell を使います）

| ツール | インストール方法 | 確認方法 |
| --- | --- | --- |
| Git | https://git-scm.com/download/win からダウンロードします | `git --version` |
| Node.js 22+ | https://nodejs.org から LTS のインストーラーをダウンロードします（または `winget install OpenJS.NodeJS.LTS`） | `node --version` |
| pnpm | `npm install -g pnpm` | `pnpm --version` |

**Linux（Debian または Ubuntu）**

| ツール | インストール方法 | 確認方法 |
| --- | --- | --- |
| Git | `sudo apt update && sudo apt install -y git curl` | `git --version` |
| Node.js 22+ | https://nodejs.org/en/download に従います（Linux を選び、LTS バージョンを選択） | `node --version` |
| pnpm | `npm install -g pnpm` | `pnpm --version` |

**つまずきやすい点:** Homebrew でインストールした Node.js には pnpm が含まれていません。`pnpm: command not found` と表示されたら、`npm install -g pnpm` を実行してから、新しいターミナルを開いてください。

**表示されるはずのもの:** 確認コマンドはすべてバージョン番号を表示します。`node --version` は `v22` 以上で始まります。

### 2. 始める前に: テストネットの QoreX {#qorex}

QoreX は QoreChain の公式ウォレットです。このページには、ページを開くブラウザに **QoreX ブラウザ拡張機能**が必要です。お使いのブラウザのストアからインストールしてください。[QoreX インテグレーション](/developer-tools/qorex-integrations)と [dApp ブラウザ](/qorex/dapp-browser)を参照してください。

この練習のためだけに作った**新しい使い捨てアカウント**を使ってください。QoreX はアカウントを作るときにリカバリーフレーズを表示します。紙に書き留めて、他人に見せず、メインネットでは決して再利用しないでください。

QoreX をテストネットに切り替えます。

- **ブラウザ拡張機能:** ロックを解除し、下部のバージョン番号を 7 回タップして、**Switch to testnet (diana)** を選びます。
- **QoreX アプリ:** 設定を開き、**Use testnet (developers)** をオンにします。（このページはデスクトップブラウザで動くため、このチュートリアルでは拡張機能を使います。）

テストネット切り替えの詳細は、[5分でデプロイ](/getting-started/deploy-in-5-minutes#step-testnet)を参照してください。アカウントアドレス（`qor1...` で始まります）をコピーします。

このページは QoreChain Native の送金を行うため、Ethereum アカウント（coin 60）は不要です。

### 3. フォーセットからテストネット QOR を入手する {#faucet}

フォーセットは、無料のテストネット QOR をアドレスに送ってくれるウェブサイトです。

1. https://dashboard.qorechain.io/faucet を開いてサインインします。
2. `qor1...` アドレスを貼り付けてリクエストします。フォーセットは**1アカウントにつき24時間あたり 100 QOR** を支払います。

**金額について:** 画面で読む単位は **QOR** です。チェーンは最小単位の **uqor** で数えます。1 QOR = 1,000,000 uqor です。ページは QOR で入力を求め、変換は自動で行います。

**知っておくと役立つこと:** 新しいアカウントの最初のトランザクションは、耐量子の ML-DSA-87 鍵をチェーンに登録します。これは約 0.09 QOR の一度きりの手数料です。QoreX が最初の送信時に代わりに行ってくれます。

### 4. コードを入手する {#get-code}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/03-hybrid-inspector
```

| 部分 | 意味 |
| --- | --- |
| `git clone <address>` | サンプルアプリ一式の完全なコピーを GitHub から、`build-before-qday` という新しいフォルダにダウンロードします。 |
| `cd <folder>` | ターミナルを Hybrid Inspector のフォルダに移動します。以降のコマンドはすべてここから実行します。 |

**表示されるはずのもの:** `Cloning into 'build-before-qday'...`。`ls` を実行して確認します。`package.json`、`src`、`index.html`、`vite.config.ts` が見えるはずです。

### 5. ライブラリをインストールする {#install-libs}

```sh
pnpm install
```

**何をするか:** `pnpm` が、ページに必要なライブラリ（`package.json` に記載）を `node_modules` というフォルダにダウンロードします。プロジェクトごとに1回だけ実行します。

| 部分 | 意味 |
| --- | --- |
| `pnpm` | ライブラリをインストールするツールです。 |
| `install` | `package.json` を読み、記載されたものすべてを `pnpm-lock.yaml` にあるバージョンでインストールします。 |

**かかる時間:** 1分未満です。

**表示されるはずのもの:** 進行状況バーが出て、その後 `Done in` と時間が表示されます。

### 6. ビルドできることを確認する {#build}

```sh
pnpm build
```

**何をするか:** `package.json` の `build` という名前のスクリプトを実行します。そのスクリプトは `tsc --noEmit && vite build` です。

| 部分 | 意味 |
| --- | --- |
| `pnpm build` | プロジェクトの `build` スクリプトを実行します。 |
| `tsc --noEmit` | TypeScript のチェッカーです。コードの間違いを探し、ファイルは書き出しません。 |
| `vite build` | Vite がページをまとめて、`dist` フォルダに小さなウェブサイトとして出力します。 |

**表示されるはずのもの:** `transforming...`、続いて `dist/index.html` などの行、最後に `built in` と時間（1秒を大きく下回ります）。

### 7. ページを実行する {#run}

```sh
pnpm dev
```

**何をするか:** スクリプト `dev` を実行し、お使いのコンピューター上で小さなウェブサーバーを起動して、ブラウザでページを使えるようにします。作業中はこのターミナルを開いたままにしてください。止めるには Ctrl+C を押します。

**表示されるはずのもの:**

```text
  VITE v5.4.21  ready in 111 ms

  ➜  Local:   http://localhost:5173/
```

QoreX をインストールしたブラウザで http://localhost:5173 を開きます。ポート 5173 が使われている場合、Vite は別のポートを表示します。表示されたアドレスを使ってください。

トランザクションを直接調べるには、アドレスに `?tx=<HASH>` を付けます。`http://localhost:5173?tx=<HASH>` です。

**ページが `/lcd` を呼ぶ理由:** 公開テストネットの REST サービスは CORS ヘッダーを返さないため、ブラウザのページから直接呼び出すことはできません。開発サーバーが、`/lcd` へのすべての呼び出しを `https://api-testnet.qore.host` に転送します。このページはテストネット専用で、`.env` ファイルは不要です。

### 8. 接続、送信、検証 {#connect-send}

1. **接続する。** **Connect QoreX** をクリックします。QoreX がページの許可を求めます。承認してください。ページにアドレス（`qor1...`）、テストネットの残高、ML-DSA-87 鍵が登録されているかどうかが表示されます。最初の送信までは「not registered yet」と表示されます。
2. **送信フォームに入力する。**

| 項目 | 意味 |
| --- | --- |
| To | 受取人のアドレス（`qor1...`）です。デフォルトでは自分のアドレスが入っていますが、そのままで問題ありません。 |
| Amount (QOR) | 送る金額を QOR で入力します。`1` は 1 QOR = 1,000,000 uqor を意味します。 |
| Memo | トランザクションに添付され、チェーン上に保存される短いテキストです。誰でも読めるので、秘密の内容は書かないでください。 |

3. **送信する。** **Sign with QoreX and send** をクリックします。QoreX が署名する内容を表示し、承認を求めます。承認して、ブロックを待ちます（数秒です）。
4. **調べる。** ページが自動的にトランザクションを調べます。ページの手順3に、64文字のテストネットのトランザクションハッシュを貼り付けて **Inspect** をクリックすることでも、任意のものを調べられます。

**表示されるはずのもの:** `QoreX: code 0, shield ..., tx <hash>` という行、続いて、下の「表示されるはずのもの」で説明する検査カードです。トランザクションハッシュをコピーしておきましょう。

### 9. ページを使わずに、もう一つの方法で検証する {#verify-curl}

チェーンに直接尋ねることもできます。必要なのは `curl` だけで、macOS とほとんどの Linux に付属しています。Windows の PowerShell では `curl.exe` を使います。`jq` ツールは必須ではありませんが、結果が読みやすくなります（macOS は `brew install jq`、Linux は `sudo apt install -y jq`、Windows は `winget install jqlang.jq`）。

```sh
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.code, .tx.body.extension_options[0]["@type"], (.tx.body.extension_options[0].pqc_signature | length)'
```

| 部分 | 意味 |
| --- | --- |
| `curl -s <address>` | テストネットの REST サービスから応答をダウンロードします。`-s` は進行状況バーを隠します。 |
| `<HASH>` | 手順8で得たトランザクションハッシュです。 |
| `\| jq '...'` | 3つの値を取り出します。`jq` がない場合はこの部分を外し、全文を読んでください。 |

**表示されるはずのもの:**

- `code` が `0`: トランザクションは成功しました。
- `pqc_signature` を持つ `PQCHybridSignature` 拡張（タイプ `/qorechain.pqc.v1.PQCHybridSignature`）。その base64 テキストは 6,172 文字で、これは 4,627 バイトの ML-DSA-87 署名にあたります。
- `tx_response.events` の中に、`pqc_hybrid_verify` タイプのイベントがあり、属性 `status` が `verified` になっています。

**エクスプローラーで:** https://explore.qore.network を開き、**Testnet** に切り替えて、トランザクションハッシュを検索します。

## トラブルシューティング {#troubleshooting}

| 表示される内容 | 理由 | 対処 |
| --- | --- | --- |
| `pnpm: command not found` | pnpm がインストールされていません。Homebrew の Node.js には含まれていません。 | `npm install -g pnpm` を実行し、新しいターミナルを開きます。 |
| `node --version` が v18 以下を表示する | Node.js が古すぎます。 | Node.js 22 以降をインストールします（手順1）。 |
| ページに `QoreX was not found in this page. Install the QoreX extension, switch it to testnet, and reload.` と表示される | 拡張機能がない、ロックされている、またはブラウザが Chromium ベースではありません。 | Chrome、Edge、Brave で QoreX をインストールしてロックを解除します。テストネットに切り替えてから、ページを再読み込みします。 |
| フォーセットがレート制限に達したと表示する | 1アカウントにつき24時間に1回のリクエストです。 | 24時間待つか、別の使い捨てアカウントを使います。 |
| `account has no PQC key and classical fallback is disabled` | 耐量子鍵がまだ登録されていません。 | QoreX から一度送信します（最初の送信で鍵が登録されます。約 0.09 QOR です）。先にフォーセットから QOR を入手しておいてください。 |
| `EVM authorisation window exhausted` | これは Hardhat アプリのもので、このページのものではありません。 | そのアプリで `pnpm window open` を使って新しいウィンドウを開きます。 |
| ウィンドウを開いた後の `HHE10402` | Hardhat アプリのものです。ウィンドウが有効になるまで数秒かかります。 | もう一度デプロイを実行します。 |
| ブラウザのコンソールに CORS エラーが出る | ページが REST サービスを直接呼び出しました。 | 開発サーバー（`pnpm dev`）の `/lcd` プロキシを使い、`http://localhost:5173` でページを開きます。`dist/index.html` をファイルとして開かないでください。 |
| `Enter an amount in QOR, for example 1.` | 金額が空、ゼロ、または数字ではありません。 | `1` のような数字を入力します。 |
| `A transaction hash is 64 hex characters.` | 貼り付けたハッシュが間違っているか、途中で切れています。 | 64文字をすべて貼り付けます。 |
| `Transaction not found on qorechain-diana` | ハッシュが別のネットワークのものか、ブロックがまだ確定していません。 | 10秒待ってからもう一度試します。QoreX がテストネットになっているか確認してください。 |
| ポート 5173 がすでに使われている | 別のプログラムが使っています。 | Vite が次のポートを選んで表示します。そのアドレスを開いてください。 |

## コード {#code}

接続と送信:

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

チェーンから証明を読み取る:

```ts
const res = await fetch(`/lcd/cosmos/tx/v1beta1/txs/${hash}`).then((r) => r.json());
const tx = res.tx;
const ext = [...(tx.body.extension_options ?? []), ...(tx.body.non_critical_extension_options ?? [])];
const hyb = ext.find((x) => String(x["@type"]).includes("PQCHybridSignature"));
const verify = (res.tx_response.events ?? []).filter((e) => e.type === "pqc_hybrid_verify");
// classical signature: atob(tx.signatures[0]).length  -> 64
// ML-DSA-87 signature: atob(hyb.pqc_signature).length -> 4627
```

`msgSendBytes` は、バンクの `MsgSend` メッセージ用の小さな protobuf エンコーダーで、`src/App.tsx` にあります。QoreX はエンコード済みのメッセージを受け取るためです。ページは、コードが 0 で、`pqc_hybrid_verify` イベントのステータスが `verified` で、耐量子署名が 4,627 バイトである場合に、そのトランザクションをハイブリッド検証済みとして表示します。

## 表示されるはずのもの {#result}

- ヘッダーに `qorechain-diana (testnet)` と、上がり続けるブロック高が表示されます。
- 接続後: あなたのアドレス、残高、鍵のステータス。
- 送信後: トランザクションハッシュと結果コード、続いて検査カード。メモ、メッセージタイプ、64 バイトの従来型署名、先頭バイトを16進で示した 4,627 バイトの ML-DSA-87 署名、アルゴリズム名 `ML-DSA-87 (FIPS 204)`、そして `pqc_hybrid_verify` の判定が表示されます。
- エクスプローラーで: https://explore.qore.network を開き、**Testnet** に切り替えて、トランザクションハッシュを検索します。

## 使用パッケージ {#packages}

| パッケージ | バージョン | 用途 |
| --- | --- | --- |
| `@qorechain/qorex-types` | 0.1.0（固定） | `getQorexNative`、`qorexSignAndBroadcast` |
| `@qorechain/sdk` | ^0.13.0 | 依存関係として記載されています。ページ自体は通常の REST 呼び出しを使います |
| `react`, `react-dom` | ^18.3.1 | インターフェース |
| `@vitejs/plugin-react` | ^4.3.0 | Vite の React プラグイン |
| `vite` | ^5.4.0 | 開発サーバーとビルド |
| `typescript` | ^5.6.3 | 型チェック |

## ソースコード {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/03-hybrid-inspector
