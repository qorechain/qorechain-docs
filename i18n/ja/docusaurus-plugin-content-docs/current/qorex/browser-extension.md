---
slug: /qorex/browser-extension
title: QoreX ブラウザ拡張機能
sidebar_label: ブラウザ拡張機能
sidebar_position: 2
---

# QoreX ブラウザ拡張機能

QoreX の**ブラウザ拡張機能**はデスクトップ版の QoreChain ウォレットです。これは**スタンドアロンのウォレット**であり、ウォレットの作成またはインポート、QOR の保有と送金、dApp への接続が可能です。そして、あらゆるウェブサイトが QoreX を検出し、すべてのリクエストを明示的かつ復号された承認へと変える役割を担う要素でもあります。

これは 3 つのストアで**公開・稼働中**です。

## インストール {#install}

| ブラウザ | インストール |
|---|---|
| **Chrome および Chromium 系ブラウザ**（Brave、Edge、Arc、Opera） | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 10.14 or later)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

現在の公開ビルドは **0.1.3** です。バージョン **0.1.5** は現在展開中で、[ダッシュボード接続ブリッジ](#dashboard-bridge)を追加します。これらのバージョン間で権限の範囲は変わりません。

:::note
Safari では、承認はポップアップウィンドウではなくブラウザのタブで開きます。この拡張機能は、同じコードベースから Apple の Safari ウェブ拡張ラッパーでパッケージされています。
:::

## ウォレットの作成または復元 {#wallet}

ポップアップを開いて次のいずれかを選択します。

- **ウォレットの作成** — お使いのデバイス上で新しい 24 語の復旧フレーズ（256 ビットのエントロピー）を生成し、QoreChain のアイデンティティを導出して、パスワード（およびオプションでパスキー。[セキュリティ](#security)を参照）のもとでボールトに封印します。
- **ウォレットのインポート** — 既存の 24 語のフレーズから復元します。

拡張機能は独自の鍵を保持し、モバイルアプリを必要としません。ポップアップからニーモニックをエクスポートすることもできます。鍵がデバイスの外に出ることはありません。

## 対応するウォレット標準 {#standards}

QoreX は 3 つのインターフェースを公開しており、いずれもページ上に `window.qorex`（`{ evm, native, svm }`）として注入され、[`@qorechain/connect`](/sdk/overview) の検出コントラクトを通じて発見されます。

| 標準 | 概要 | 開発者にとっての意味 |
|---|---|---|
| **EIP-1193** | Ethereum プロバイダーの JavaScript API（`request(...)`、イベント）。 | 既存の ethers.js / viem / web3.js のコードは変更なしで QoreX の EVM レーンと通信できます。数値のエラーコード（例: `4902`）はそのまま転送されます。 |
| **EIP-6963** | マルチウォレットのプロバイダー検出（announce / request イベント）。 | QoreX は他のすべてのウォレットと並んで自身をアナウンスし、**`window.ethereum` を上書きすることは決してありません**。そのため、ユーザーは競合なしにサイトごとに QoreX を選択できます。 |
| **Keplr パターンの `signDirect`** | `window.qorex.native` 上の Cosmos `OfflineDirectSigner` 形式のプロバイダー。 | Cosmos 系の dApp は、Keplr を使う場合と同じ方法で QoreChain の **Native レーン**トランザクションに署名します。ポスト量子レイヤーはあらかじめ適用されています（[ポスト量子署名](#pqc)を参照）。 |

:::note SVM (Solana 互換)
SVM プロバイダーは `connect` / `signAndSendTransaction` / `signMessage` とともに `window.qorex.svm` 上で公開されています。QoreX はまだ Solana の **Wallet Standard** 検出プロトコルを通じた登録を行っていないため、Wallet Standard の自動検出に依存する Solana の dApp は QoreX を自動的に検出しません。現時点では `window.qorex.svm` を通じて直接アクセスしてください。
:::

## セキュリティと権限 {#security}

QoreX は、単に信頼されるだけでなく検証可能であるように設計されています。

- **ボールト** — 鍵は **AES-256-GCM** で封印されます。パスワード経路では **Argon2id**（RFC 9106、メモリハード: 64 MiB、t=3、p=1）で鍵を導出するため、流出したボールトの blob は GPU/ASIC によるクラッキングに耐性があります。（旧来の PBKDF2 の blob は引き続き開くことができ、次回のアンロック時に Argon2id へ再封印されます。）
- **パスキーによるアンロック（オプション）** — 認証器が **WebAuthn PRF** 拡張をサポートしている場合、QoreX は入力したパスワードの代わりに、パスキーの 32 バイトの PRF 出力からボールトをアンロックできます。
- **Manifest V3 + 厳格な CSP** — `script-src 'self'; object-src 'self'; base-uri 'self'`。インストール後の**リモートコードの読み込みは一切なく**、`wasm-unsafe-eval` もありません。
- **アカウントなし、テレメトリなし** — 分析なし、トラッキングなし、リモートログなし、サインアップなし、メールアドレスなし。Firefox のリストでは、データ収集を `none` と宣言しています。

### QoreX が要求する権限とその理由 {#permissions}

このセクションが存在するのは、Firefox のリストが**「すべてのウェブサイトでデータにアクセスする」**という権限を表示するためであり、これはホスト権限を宣言していないウォレットとは矛盾しているように見える場合があるからです。マニフェストの正確で編集されていない事実を以下に示します。

拡張機能の `manifest.json` は次を宣言しています。

```json
"permissions": ["storage"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
]
```

- **`permissions: ["storage"]`** — 唯一の API 権限です。暗号化されたボールトとオリジンごとの接続承認を、拡張機能のストレージに**ローカルで**保存します。
- **`host_permissions: []`** — QoreX はホスト権限を**一切**宣言しません。あなたに代わって任意のサイトへクロスオリジンのネットワークリクエストを行う機能を要求することはありません。
- **`content_scripts` が `<all_urls>` にマッチする** — これが、Firefox が*「すべてのウェブサイトでデータにアクセスする」*と表示する正直な理由です。QoreX は小さなプロバイダースクリプト（`content.js` → `inpage.js`）を**すべてのページ**に注入します。すべてのサイトで実行されるコンテンツスクリプトは、技術的にはページを読み取ることが*できる*ため、ブラウザはその機能を、`host_permissions` から来るものであれコンテンツスクリプトのマッチから来るものであれ、まさにその文言で説明します。

**コンテンツスクリプトがどこでも実行される理由。** それは、**あらゆる** dApp がサイトごとのアクセスを事前に許可することなく、EIP-6963 を通じてウォレットを検出できるようにするためです。これは MetaMask、Keplr、Phantom、その他すべての注入型ウォレットの動作方法です。注入されたプロバイダーは、あなたが訪れるどのサイトでも、ページのスクリプトが実行される前（`document_start`）に存在している必要があります。

**そのスクリプトが行うこと、行わないこと。** それはウォレットのメッセージを橋渡しするだけです（プロバイダーをアナウンスし、接続/署名リクエストをサービスワーカーへ転送し、結果を返す）。それはウォレットのリクエスト以外のページコンテンツを読み取ることも、何かをサーバーへ送信することも、リモートコードを読み込むことも**ありません**。また、ホスト権限が存在しないため、任意のクロスオリジンデータを取得することもできません。これらはすべて検証可能です。拡張機能は CSP でロックされ、分析を一切搭載せず、Firefox のパッケージには再現可能なソース zip が含まれています。

## dApp を QoreX に接続する {#connect}

dApp は **EIP-6963** を通じて QoreX の EVM レーンを検出します。announce-and-request を行ってから、返された EIP-1193 プロバイダーを使用します。

```ts
import type { EIP6963ProviderDetail } from "./types";

const wallets = new Map<string, EIP6963ProviderDetail>();

// 1. Collect every wallet that announces itself.
window.addEventListener("eip6963:announceProvider", (event) => {
  const detail = (event as CustomEvent<EIP6963ProviderDetail>).detail;
  wallets.set(detail.info.rdns, detail);
});

// 2. Ask installed wallets to announce.
window.dispatchEvent(new Event("eip6963:requestProvider"));

// 3. Pick QoreX by its rdns and use the standard EIP-1193 provider.
const qorex = wallets.get("network.qore.qorex");
if (qorex) {
  const accounts = await qorex.provider.request({ method: "eth_requestAccounts" });
  console.log("QoreX EVM account:", accounts[0]);
}
```

QoreChain の **Native** レーンには、`window.qorex.native`（`enable`、`getKey`、`signDirect`）にある Keplr パターンのプロバイダーを使用します。上位レベルの [`@qorechain/connect`](/sdk/overview) パッケージが、この検出処理をあなたのためにラップします。

承認は**オリジンごと**です。サイトへの最初の接続では、オリジンを表示する承認ポップアップが開きます。承認すると公開アドレスのみが明かされ、あるサイトの承認が別のサイトに何かを付与することはありません。

### ダッシュボードブリッジ (v0.1.5) {#dashboard-bridge}

バージョン 0.1.5 は、**`dashboard.qorechain.io` のみ**にスコープされたブリッジを追加します。`window.qorex.native.connectProof(sessionId)` は *Connect with QoreX* のペアリング証明に署名し（バックエンドが署名を再検証します）、`executeTransfer({ to, amountUqor, memo })` はダッシュボードが提案した QOR 送金を承認してブロードキャストし、`txHash` を返します。これらのメソッドは他のオリジンでは拒否されます。

## ポスト量子署名 {#pqc}

QoreX 自身が開始するすべての QOR 送金は、**ハイブリッドポスト量子署名** — 古典的な secp256k1 署名とともに **ML-DSA-87**（Dilithium-5、NIST **FIPS-204**）— で署名され、`@qorechain/sdk` の完全なハイブリッドパイプラインを使用します。**トグルはありません**。QoreChain がそれを要求し、QoreX はそれなしに Native レーンの QOR 送金を送信することは決してありません。

- **dApp が開始する Native 署名** — qorechain-connect フローで構築された dApp は、`signDirect` を呼び出す前に PQC 拡張（`/qorechain.pqc.v1.PQCHybridSignature`）をトランザクションボディに事前レイヤー化します。QoreX は古典的な半分を提供し、**ブラインド署名を拒否**して、ペイロードを復号し、PQC レイヤーが存在するかどうかを表示します。
- **古典的なリクエストは常にラベル付けされる** — リクエストが PQC レイヤーを持たない場合、または（PQC を運べない）外部チェーン（ETH/BNB など）を対象とする場合、QoreX は黙ってダウングレードするのではなく、明示的な警告を表示します。

**これがトランザクションサイズに意味すること。** ML-DSA-87 は大きな署名です。署名は **4,627 bytes**、公開鍵は **2,592 bytes** です（FIPS-204 で固定）。したがって、ハイブリッドな QoreChain トランザクションは、純粋に古典的なものより数キロバイト大きくなります。トランザクションを自分で構築してブロードキャストする場合は、追加のバイト数に合わせてバッファとガス見積もりのサイズを設定してください。QoreChain のガス計算はすでにそれらを見込んでいます。プリミティブと決定論的署名の要件については、[ポスト量子署名](/developer-guide/post-quantum-signing)を参照してください。
