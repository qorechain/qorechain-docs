---
slug: /qorex/browser-extension
title: QoreX ブラウザ拡張機能
sidebar_label: ブラウザ拡張機能
sidebar_position: 2
---

# QoreX ブラウザ拡張機能

QoreX の**ブラウザ拡張機能**は、デスクトップ向けの QoreChain ウォレットです。ウォレットの作成またはインポート、QOR の保有と送信、dApp への接続まで単体で完結する**スタンドアロンウォレット**であり、同時に、あらゆるウェブサイトが QoreX を検出し、すべてのリクエストを内容が解読された明示的な承認へと変換できるようにする要となる部品でもあります。

現在、3 つのストアで**公開・提供中**です。

## インストール {#install}

| ブラウザ | インストール |
|---|---|
| **Chrome および Chromium 系ブラウザ**（Brave、Edge、Arc、Opera） | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari（macOS 10.14 以降）** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

### どのバージョンがどこで公開されているか {#versions}

ストアの審査完了時期はそれぞれ異なるため、現在公開されているバージョンはブラウザごとに違います。

| ブラウザ | 公開バージョン |
|---|---|
| **Firefox** | **0.1.5** |
| **Chrome / Chromium** | **0.1.3**（0.1.5 は提出済み・審査中） |
| **Safari（macOS）** | **QoreX Wallet** macOS アプリに同梱され、アプリ独自の `1.x` バージョン番号体系に従います |

**0.1.5** では、[Solana Wallet Standard による検出](#standards)、[パスキーによるロック解除](#security)、完全実装された [SVM dApp レーン](#standards)、そして [ダッシュボード接続ブリッジ](#dashboard-bridge) が追加されました。（バージョン 0.1.4 は公開されておらず、その変更点は 0.1.5 としてユーザーに届きます。）

**権限の範囲は 0.1.3 と 0.1.5 で同一です** — [QoreX が要求する権限](#permissions)を参照してください。

:::note
Safari では、承認画面がポップアップウィンドウではなくブラウザのタブとして開きます。拡張機能は同一のコードベースから Apple の Safari ウェブ拡張機能ラッパーでパッケージ化されているためです。
:::

## ウォレットの作成または復元 {#wallet}

ポップアップを開いて、次のいずれかを選択します。

- **ウォレットを作成** — お使いのデバイス上で新しい 24 語のリカバリーフレーズ（256 ビットのエントロピー）を生成し、QoreChain の識別情報を導出したうえで、パスワード（および任意でパスキー。[セキュリティ](#security)を参照）で保護された保管庫に封印します。
- **ウォレットをインポート** — 既存の 24 語のフレーズから復元します。

拡張機能は自身の鍵を保持し、モバイルアプリを必要としません。ポップアップからニーモニックをエクスポートすることもできます。鍵がデバイスの外に出ることはありません。

### 外部ネットワークでの送信 {#send-external}

ネイティブレーンの QOR に加えて、ポップアップからは外部ネットワーク上の資産も送信できます。いずれも同じリカバリーフレーズから導出されます。

| 種別 | ネットワーク | 同梱トークン |
|---|---|---|
| EVM | Ethereum、BNB Chain、Polygon、Arbitrum | ERC-20 のエントリ（該当する場合は USDT、USDC、DAI） |
| SVM | Solana | SPL のエントリ（USDC、USDT） |
| Cosmos | Cosmos Hub、Osmosis、Celestia | IBC のエントリ（Osmosis 上の USDC）、任意のメモ欄あり |

外部への送金を実行する前には、次の確認事項に明示的にチェックを入れる必要があります。**「外部ネットワークは古典的な署名のみを受け付けます。お客様の QOR とは異なり、この送金は耐量子ではありません。」** 外部チェーンは耐量子署名を扱えず、QoreX はその事実を決して隠しません。

## 対応するウォレット標準 {#standards}

QoreX は 3 つのインターフェースを公開します。いずれもページ上に `window.qorex`（`{ evm, native, svm }`）として注入され、[`@qorechain/connect`](/sdk/overview) の検出コントラクトを通じて発見できます。

| 標準 | 概要 | 開発者にとっての意味 |
|---|---|---|
| **EIP-1193** | Ethereum のプロバイダー JavaScript API（`request(...)`、イベント）。 | 既存の ethers.js / viem / web3.js のコードをそのまま QoreX の EVM レーンに接続できます。数値のエラーコード（例: `4902`）はそのまま転送されます。 |
| **EIP-6963** | 複数ウォレット向けのプロバイダー検出（announce / request イベント）。 | QoreX は他のあらゆるウォレットと並んで自身を告知し、**`window.ethereum` を上書きすることはありません**。そのため、ユーザーは競合なくサイトごとに QoreX を選択できます。 |
| **Keplr 方式の `signDirect`** | `window.qorex.native` 上にある Cosmos の `OfflineDirectSigner` 形式のプロバイダー。 | Cosmos 系の dApp は、Keplr を使う場合とまったく同じ方法で QoreChain の**ネイティブレーン**のトランザクションに署名できます。耐量子レイヤーはあらかじめ適用されています（[耐量子署名](#pqc)を参照）。 |
| **Solana Wallet Standard** *(0.1.5 以降)* | Solana dApp 向けのネイティブなウォレット検出（`wallet-standard:register-wallet` / `app-ready`）。 | Solana の dApp は**QoreX を自動検出**し、独自の統合作業は不要です。対応機能: `standard:connect`、`standard:disconnect`、`standard:events`、`solana:signMessage`、`solana:signTransaction`、`solana:signAndSendTransaction`。チェーンは `solana:mainnet`、トランザクションは `legacy` と `v0` の両方に対応します。 |

:::note SVM レーンに直接アクセスする
同じインターフェースは `window.qorex.svm` 上でも利用できます（`connect` / `signAndSendTransaction` / `signMessage`）。Wallet Standard による自動検出と完全実装された SVM レーンは **0.1.5** で提供されます。したがって現時点では **Firefox** で利用でき、Chrome では 0.1.5 が審査を通過し次第利用可能になります（[どのバージョンがどこで公開されているか](#versions)を参照）。

Solana の承認画面では、解読されたペイロード（System による送金では受取先と lamports、およびプログラムの一覧）が表示されます。署名者としてお客様のウォレットが記載されていないトランザクションは拒否され、署名は**古典的**であると明示されます — [耐量子署名](#pqc)を参照してください。
:::

## セキュリティと権限 {#security}

QoreX は、単に信頼されることではなく、検証可能であることを目指して作られています。

- **保管庫** — 鍵は **AES-256-GCM** で封印されます。パスワード経路では鍵導出に **Argon2id**（RFC 9106、メモリハード: 64 MiB、t=3、p=1）を使用するため、保管庫のデータが流出しても GPU/ASIC による解読に耐えます。（従来の PBKDF2 形式のデータも引き続き開くことができ、次回のロック解除時に Argon2id で再封印されます。）
- **パスキーによるロック解除（任意、0.1.5 以降）** — お使いの認証器が **WebAuthn PRF** 拡張に対応している場合、QoreX はパスワードの入力に代えて、パスキーの 32 バイトの PRF 出力から保管庫のロックを解除できます。パスワードは常に代替手段として残ります。

  :::note パスキーによるロック解除が表示される環境
  QoreX は WebAuthn の対応状況を機能検出し、ブラウザが拡張機能のページに対して WebAuthn を公開している環境、すなわち **Chrome と Edge** でのみ **パスキーによるロック解除を有効にする** を表示します。**Firefox** ではこのオプションは非表示です。Firefox は拡張機能のページに WebAuthn を公開していないためです。[バージョンのずれ](#versions)と合わせると、現時点で Firefox のユーザーは Wallet Standard を利用できるがパスキーによるロック解除は利用できず、Chrome のユーザーは 0.1.5 が審査を通過するまでそのいずれも利用できない、ということになります。これは想定どおりの挙動であり、不具合ではありません。
  :::
- **Manifest V3 と厳格な CSP** — `script-src 'self'; object-src 'self'; base-uri 'self'`。インストール後に**リモートコードを読み込むことはなく**、`wasm-unsafe-eval` も使用しません。
- **アカウント不要、テレメトリなし** — 解析も追跡もリモートログ送信もなく、サインアップもメールアドレスも不要です。Firefox のストア掲載情報では、データ収集は `none` と申告されています。

### QoreX が要求する権限とその理由 {#permissions}

このセクションが存在するのは、Firefox のストア掲載情報に **「すべてのウェブサイトでのデータへのアクセス」** という権限が表示され、ホスト権限を一切宣言していないウォレットとしては矛盾して見えかねないためです。以下は、マニフェストから一切手を加えずに引用した正確な内容です。

拡張機能の `manifest.json` の宣言は次のとおりです。

```json
"permissions": ["storage"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
]
```

- **`permissions: ["storage"]`** — 唯一の API 権限です。暗号化された保管庫と、オリジンごとの接続承認を拡張機能のストレージに**ローカルで**保存します。
- **`host_permissions: []`** — QoreX はホスト権限を**一切**宣言していません。ユーザーに代わって任意のサイトへクロスオリジンのネットワークリクエストを行う能力を要求しません。
- **`content_scripts` が `<all_urls>` に一致** — これこそが、Firefox が「すべてのウェブサイトでのデータへのアクセス」と表示する率直な理由です。QoreX は小さなプロバイダースクリプト（`content.js` → `inpage.js`）を**すべてのページ**に注入します。すべてのサイトで動作するコンテンツスクリプトは、技術的にはページを読み取ることが*可能*であり、ブラウザはその能力を、`host_permissions` に由来するか コンテンツスクリプトの一致条件に由来するかを問わず、まさにその文言で説明します。

**コンテンツスクリプトがすべてのサイトで動作する理由。** それは、サイトごとのアクセス許可をあらかじめ与えなくても、**あらゆる** dApp が EIP-6963 を通じてウォレットを検出できるようにするためです。これは MetaMask、Keplr、Phantom をはじめとする、注入型のウォレットすべてに共通する仕組みです。注入されるプロバイダーは、訪問先がどのサイトであっても、そのページのスクリプトが実行される前（`document_start`）に存在していなければなりません。

**そのスクリプトが行うこと、そして行わないこと。** このスクリプトが行うのは、ウォレットのメッセージを橋渡しすること（プロバイダーの告知、接続や署名のリクエストのサービスワーカーへの転送、結果の返却）だけです。それらのウォレットリクエストを超えてページの内容を読み取ることも、何かをサーバーへ送信することも、リモートコードを読み込むこともありません。またホスト権限がないため、任意のクロスオリジンデータを取得することもできません。これらはすべて検証可能です。拡張機能は CSP でロックされ、解析ツールを一切同梱しておらず、Firefox 版のパッケージには再現可能なソースの zip が含まれています。

## dApp を QoreX に接続する {#connect}

dApp は **EIP-6963** を通じて QoreX の EVM レーンを検出します。announce と request を行い、返された EIP-1193 プロバイダーを使用します。

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

QoreChain の**ネイティブ**レーンについては、`window.qorex.native` にある Keplr 方式のプロバイダー（`enable`、`getKey`、`signDirect`）を使用します。より高水準の [`@qorechain/connect`](/sdk/overview) パッケージが、この検出処理をまとめて引き受けてくれます。

承認は**オリジンごと**です。サイトへの最初の接続では、オリジンを表示した承認ポップアップが開きます。承認によって開示されるのは公開アドレスのみであり、あるサイトへの承認が他のサイトに何らかの権限を与えることはありません。

### ダッシュボードブリッジ（v0.1.5） {#dashboard-bridge}

バージョン 0.1.5 では、**`dashboard.qorechain.io` に限定された**ブリッジが追加されました。`window.qorex.native.connectProof(sessionId)` は *Connect with QoreX* のペアリング証明に署名し（バックエンド側で署名が再検証されます）、`executeTransfer({ to, amountUqor, memo })` はダッシュボードから提案された QOR の送金を承認してブロードキャストし、`txHash` を返します。これらのメソッドは、他のオリジンからの呼び出しでは拒否されます。

## 耐量子署名 {#pqc}

QoreX 自身が開始する QOR の送金はすべて、**ハイブリッド耐量子署名**で署名されます。すなわち、古典的な secp256k1 署名と併せて **ML-DSA-87**（Dilithium-5、NIST **FIPS-204**）が使われ、`@qorechain/sdk` の完全なハイブリッドパイプラインを利用します。**切り替えスイッチはありません**。QoreChain がこれを必須としており、QoreX がネイティブレーンの QOR 送金をこれなしで送信することはありません。

- **dApp が開始するネイティブ署名** — qorechain-connect のフローで構築された dApp は、`signDirect` を呼び出す前に PQC 拡張（`/qorechain.pqc.v1.PQCHybridSignature`）をトランザクション本体にあらかじめ重ねます。QoreX は古典的な側の署名を担い、内容を確認せずに署名することを**拒否**し、ペイロードを解読したうえで PQC レイヤーの有無を明示します。
- **古典的なリクエストには必ずラベルが付く** — リクエストに PQC レイヤーがない場合や、外部チェーン（ETH、BNB など。PQC を扱えません）を対象とする場合、QoreX は黙って安全性を落とすのではなく、明示的な警告を表示します。

**トランザクションのサイズへの影響。** ML-DSA-87 は大きな署名です。署名は **4,627 bytes**、公開鍵は **2,592 bytes** です（FIPS-204 で規定）。したがって、ハイブリッドな QoreChain のトランザクションは、純粋に古典的なものより数キロバイト大きくなります。ご自身でトランザクションを構築してブロードキャストする場合は、この追加分を見込んでバッファと手数料の見積もりを設計してください。QoreChain のガス計算はすでにこれを織り込んでいます。プリミティブと決定的署名の要件については、[耐量子署名](/developer-guide/post-quantum-signing)を参照してください。
