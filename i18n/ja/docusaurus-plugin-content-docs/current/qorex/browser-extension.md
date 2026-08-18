---
slug: /qorex/browser-extension
title: QoreX ブラウザ拡張機能
sidebar_label: ブラウザ拡張機能
sidebar_position: 2
---

# QoreX ブラウザ拡張機能

QoreX の**ブラウザ拡張機能**は、デスクトップ版の QoreChain ウォレットです。これは**単独で完結するウォレット**であり、ウォレットの作成やインポート、QOR の保有と送信、dApp への接続が行えます。さらに、あらゆる Web サイトが QoreX を検出し、すべてのリクエストを明示的かつ内容の解読された承認へと変えるための要となる部分でもあります。

3 つのストアで**公開済み・提供中**です。

## インストール {#install}

| ブラウザ | インストール |
|---|---|
| **Chrome および Chromium 系ブラウザ**（Brave、Edge、Arc、Opera） | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari（macOS 10.14 以降）** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

### どのバージョンがどこで提供されているか {#versions}

ストアの審査が完了する時期は同じではないため、現在公開されているバージョンはブラウザごとに異なります。

| ブラウザ | 公開バージョン |
|---|---|
| **Firefox** | **0.1.5** |
| **Chrome / Chromium** | **0.1.3**（0.1.5 は申請済み、審査中） |
| **Safari（macOS）** | **QoreX Wallet** の macOS アプリに同梱されており、アプリ自身の `1.x` 系のバージョン番号を使用します。Mac App Store で現在配信されているのは **1.0** で、拡張機能 0.1.5 を含むビルドは審査中です |

**0.1.5** では、[Solana Wallet Standard による検出](#standards)、[パスキーによるロック解除](#security)、完全に実装された [SVM dApp レーン](#standards)、および [Dashboard 接続ブリッジ](#dashboard-bridge)が追加されています。（バージョン 0.1.4 は公開されませんでした。その変更点は 0.1.5 でユーザーに届きます。）

**パーミッションの範囲は 0.1.3 と 0.1.5 で同一です** — [QoreX が要求するパーミッション](#permissions)を参照してください。

:::note
Safari では、承認画面はポップアップウィンドウではなくブラウザのタブで開きます。この拡張機能は、同一のコードベースから Apple の Safari web-extension ラッパーでパッケージ化されています。
:::

## ウォレットの作成または復元 {#wallet}

ポップアップを開き、次のいずれかを選択します。

- **ウォレットを作成** — お使いのデバイス上で新しい 24 語のリカバリーフレーズ（256 ビットのエントロピー）を生成し、QoreChain のアイデンティティを導出して、パスワード（および任意でパスキー。[セキュリティ](#security)を参照）で保護された保管領域に封入します。
- **ウォレットをインポート** — 既存の 24 語のフレーズから復元します。

拡張機能は自前の鍵を保持しており、モバイルアプリを必要としません。ニーモニックはポップアップからエクスポートすることもできます。鍵がデバイスの外に出ることはありません。

### 外部ネットワークでの送信 {#send-external}

Native レーンの QOR に加えて、ポップアップからは外部ネットワーク上の資産も送信できます。いずれも同じリカバリーフレーズから導出されます。

| 種類 | ネットワーク | 同梱トークン |
|---|---|---|
| EVM | Ethereum、BNB Chain、Polygon、Arbitrum | ERC-20 のエントリ（該当する場合は USDT、USDC、DAI） |
| SVM | Solana | SPL のエントリ（USDC、USDT） |
| Cosmos | Cosmos Hub、Osmosis、Celestia | IBC のエントリ（Osmosis 上の USDC）、任意のメモ欄 |

外部への送金を実行する前に、次の明示的な確認事項にチェックを入れる必要があります。**「外部ネットワークは古典的な署名しか受け付けません。お客様の QOR とは異なり、この送金は量子耐性がありません。」** 外部チェーンはポスト量子署名を扱えず、QoreX はその事実を決して隠しません。

## 対応するウォレット標準 {#standards}

QoreX は 3 つのインターフェースを公開しており、いずれもページ上に `window.qorex`（`{ evm, native, svm }`）として注入され、[`@qorechain/connect`](/sdk/overview) の検出コントラクトを通じて発見されます。

| 標準 | 概要 | 開発者にとっての意味 |
|---|---|---|
| **EIP-1193** | Ethereum プロバイダーの JavaScript API（`request(...)`、イベント）。 | 既存の ethers.js / viem / web3.js のコードは変更なしで QoreX の EVM レーンと通信できます。数値のエラーコード（例: `4902`）はそのまま転送されます。 |
| **EIP-6963** | 複数ウォレットのプロバイダー検出（announce / request イベント）。 | QoreX は他のあらゆるウォレットと並んで自身を通知します。**`window.ethereum` を上書きすることは決してありません**。そのため、ユーザーは競合なくサイトごとに QoreX を選択できます。 |
| **Keplr パターンの `signDirect`** | `window.qorex.native` 上にある Cosmos の `OfflineDirectSigner` 形式のプロバイダー。 | Cosmos 系の dApp は、Keplr を使うのと同じ方法で QoreChain の **Native レーン**のトランザクションに署名できます。ポスト量子のレイヤーはあらかじめ適用されています（[ポスト量子署名](#pqc)を参照）。 |
| **Solana Wallet Standard**（0.1.5 以降） | Solana の dApp 向けのネイティブなウォレット検出（`wallet-standard:register-wallet` / `app-ready`）。 | Solana の dApp は **QoreX を自動検出**します。独自の統合作業は不要です。機能: `standard:connect`、`standard:disconnect`、`standard:events`、`solana:signMessage`、`solana:signTransaction`、`solana:signAndSendTransaction`。チェーンは `solana:mainnet`。`legacy` と `v0` の両方のトランザクションに対応します。 |

:::note SVM レーンに直接アクセスする
同じインターフェースは `window.qorex.svm`（`connect` / `signAndSendTransaction` / `signMessage`）からも利用できます。Wallet Standard による自動検出と完全に実装された SVM レーンは **0.1.5** で提供されます。したがって現時点で利用できるのは **Firefox** であり、Chrome では 0.1.5 が審査を通過した時点で利用可能になります（[どのバージョンがどこで提供されているか](#versions)を参照）。

Solana の承認画面には、解読されたペイロード（System の送金であれば受取先と lamports、およびプログラムの一覧）が表示されます。お客様のウォレットが署名者として含まれていないトランザクションは拒否され、署名は**古典的**である旨が明示されます。[ポスト量子署名](#pqc)を参照してください。
:::

## セキュリティとパーミッション {#security}

QoreX は、単に信頼を求めるのではなく、検証できるように作られています。

- **保管領域（ボールト）** — 鍵は **AES-256-GCM** で封入されます。パスワード経路では **Argon2id**（RFC 9106、メモリハード: 64 MiB、t=3、p=1）で鍵を導出するため、ボールトのデータが流出しても GPU/ASIC による解析に耐えます。（従来の PBKDF2 形式のデータも引き続き開くことができ、次回のロック解除時に Argon2id で再封入されます。）
- **パスキーによるロック解除（任意、0.1.5 以降）** — お使いの認証器が **WebAuthn PRF** 拡張に対応している場合、QoreX はパスワードの入力に代えて、パスキーの 32 バイトの PRF 出力からボールトのロックを解除できます。パスワードは常に代替手段として残ります。

  :::note パスキーによるロック解除が表示される環境
  QoreX は WebAuthn の対応状況を検出し、ブラウザが拡張機能のページに対して WebAuthn を公開している環境、すなわち **Chrome と Edge** でのみ **パスキーによるロック解除を有効にする** を表示します。**Firefox** では、拡張機能のページに WebAuthn が公開されていないため、この選択肢は表示されません。[バージョンの差](#versions)と合わせると、現時点では Firefox のユーザーは Wallet Standard を利用できるがパスキーによるロック解除は利用できず、Chrome のユーザーは 0.1.5 が審査を通過するまでそのどちらも利用できない、ということになります。これは想定どおりの動作であり、不具合ではありません。
  :::
- **Manifest V3 と厳格な CSP** — `script-src 'self'; object-src 'self'; base-uri 'self'`。インストール後に**リモートコードを読み込むことはなく**、`wasm-unsafe-eval` も使用しません。
- **アカウント不要、テレメトリーなし** — 解析ツール、トラッキング、リモートへのログ送信、サインアップ、メールアドレスの登録は一切ありません。Firefox のストア掲載情報では、データ収集は `none` と宣言されています。

### QoreX が要求するパーミッションとその理由 {#permissions}

このセクションが存在するのは、Firefox のストア掲載情報に**「すべての Web サイトのデータへのアクセス」**というパーミッションが表示され、ホストパーミッションを一切宣言していないウォレットとしては矛盾して見えかねないためです。以下は、マニフェストのありのままの内容です。

拡張機能の `manifest.json` は次のように宣言しています。

```json
"permissions": ["storage"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
]
```

- **`permissions: ["storage"]`** — 唯一の API パーミッションです。暗号化されたボールトと、オリジンごとの接続の承認内容を、拡張機能のストレージに**ローカルで**保存します。
- **`host_permissions: []`** — QoreX はホストパーミッションを**一切**宣言していません。ユーザーに代わって任意のサイトへクロスオリジンのネットワークリクエストを行う権限を要求しません。
- **`content_scripts` が `<all_urls>` に一致** — Firefox が*「すべての Web サイトのデータへのアクセス」*と表示する、率直な理由がこれです。QoreX は小さなプロバイダースクリプト（`content.js` → `inpage.js`）を**すべてのページ**に注入します。すべてのサイトで動作するコンテンツスクリプトは、技術的にはページを読み取る*ことができ*、ブラウザはその能力を、`host_permissions` に由来するものであれコンテンツスクリプトの一致に由来するものであれ、まさにその表現で説明します。

**なぜコンテンツスクリプトがすべての場所で動作するのか。** それは、サイトごとのアクセス許可を事前に与えなくても、**あらゆる** dApp が EIP-6963 を通じてウォレットを検出できるようにするためです。これは MetaMask、Keplr、Phantom をはじめとする、注入型のウォレットすべてに共通する仕組みです。注入されるプロバイダーは、訪問先がどのサイトであっても、そのページのスクリプトが実行される前（`document_start`）に存在している必要があります。

**そのスクリプトが行うこと、そして行わないこと。** このスクリプトはウォレットのメッセージを橋渡しするだけです（プロバイダーの通知、接続・署名リクエストのサービスワーカーへの転送、結果の返却）。これらのウォレットリクエストを超えてページの内容を読み取ることも、何かをサーバーへ送信することも、リモートコードを読み込むこともありません。ホストパーミッションがないため、任意のクロスオリジンのデータを取得することもできません。これらはすべて検証可能です。拡張機能は CSP でロックされ、解析ツールを一切同梱しておらず、Firefox 向けパッケージには再現可能なソースの zip が含まれています。

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

QoreChain の **Native** レーンについては、`window.qorex.native` にある Keplr パターンのプロバイダー（`enable`、`getKey`、`signDirect`）を使用します。より高水準の [`@qorechain/connect`](/sdk/overview) パッケージが、この検出処理をまとめて引き受けてくれます。

承認は**オリジンごと**に行われます。サイトへの最初の接続時にはオリジンを表示した承認ポップアップが開き、承認しても公開されるのは公開アドレスのみで、あるサイトでの承認が他のサイトに対して何らかの権限を与えることはありません。

### Dashboard ブリッジ（v0.1.5） {#dashboard-bridge}

バージョン 0.1.5 では、**`dashboard.qorechain.io` に限定された**ブリッジが追加されています。`window.qorex.native.connectProof(sessionId)` は *Connect with QoreX* のペアリング証明に署名し（バックエンド側で署名が再検証されます）、`executeTransfer({ to, amountUqor, memo })` は Dashboard から提案された QOR の送金を承認してブロードキャストし、`txHash` を返します。これらのメソッドは、他のいかなるオリジンからも拒否されます。

## ポスト量子署名 {#pqc}

QoreX 自身が開始するすべての QOR 送金は、**ハイブリッドなポスト量子署名**で署名されます。すなわち、古典的な secp256k1 署名と併せて **ML-DSA-87**（Dilithium-5、NIST **FIPS-204**）が用いられ、`@qorechain/sdk` の完全なハイブリッドパイプラインが使用されます。**切り替えの設定はありません**。QoreChain がこれを必須としており、QoreX が Native レーンの QOR 送金をこれなしに送信することはありません。

- **dApp が開始する Native 署名** — qorechain-connect のフローで構築された dApp は、`signDirect` を呼び出す前にトランザクション本体へ PQC 拡張（`/qorechain.pqc.v1.PQCHybridSignature`）をあらかじめ組み込みます。QoreX は古典的な側の署名を提供し、**内容を確認しない署名は拒否**して、ペイロードを解読したうえで PQC のレイヤーが存在するかどうかを明示します。
- **古典的なリクエストには必ずラベルが付く** — リクエストに PQC のレイヤーが含まれていない場合、または PQC を扱えない外部チェーン（ETH、BNB など）を対象としている場合、QoreX は黙って安全性を下げるのではなく、明示的な警告を表示します。

**これがトランザクションサイズに与える影響。** ML-DSA-87 は署名サイズの大きい方式で、署名は **4,627 バイト**、公開鍵は **2,592 バイト**です（FIPS-204 で固定）。そのため、ハイブリッドな QoreChain のトランザクションは、純粋に古典的なものより数キロバイト大きくなります。トランザクションを自分で構築してブロードキャストする場合は、この追加分を見込んでバッファとガス見積もりを設定してください。QoreChain のガス計算はすでにこれを織り込んでいます。プリミティブと決定的署名の要件については、[ポスト量子署名](/developer-guide/post-quantum-signing)を参照してください。
