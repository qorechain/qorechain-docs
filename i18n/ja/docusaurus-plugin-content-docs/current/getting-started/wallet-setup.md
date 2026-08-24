---
slug: /getting-started/wallet-setup
title: ウォレットのセットアップ
sidebar_label: ウォレットのセットアップ
sidebar_position: 2
---

# ウォレットのセットアップ

QoreChainは、ネイティブ、EVM、SVMの各実行環境にわたって複数のウォレットタイプをサポートしています。ご自身のユースケースに合ったウォレットを選択してください。

:::note
以下の値は、**`qorechain-vladi`**メインネット（EVMチェーンID **9801**、2026年6月7日から稼働）と**`qorechain-diana`**テストネット（EVMチェーンID **9800**）の両方をカバーしています。両ネットワークの公開エンドポイントは[ネットワーク](/appendix/networks#public-endpoints)に記載されています。
:::

## Keplr ウォレット

Keplrは、QoreChainのネイティブトランザクション、ステーキング、ガバナンスに推奨されるウォレットです。

### カスタムチェーンとしてQoreChainを追加

Keplrを開き、**設定 > カスタムチェーンを追加**に移動し、以下を入力します。

| 項目               | メインネット                | テストネット                      |
| ------------------ | -------------------------- | -------------------------------- |
| チェーン名          | `QoreChain`                | `QoreChain Diana Testnet`        |
| チェーンID          | `qorechain-vladi`          | `qorechain-diana`                |
| RPC URL            | `https://rpc.qore.host`    | `https://rpc-testnet.qore.host`  |
| REST URL           | `https://api.qore.host`    | `https://api-testnet.qore.host`  |
| Bech32プレフィックス | `qor`                      | `qor`                            |
| コイン単位          | `QOR`                      | `QOR`                            |
| 最小コイン単位       | `uqor`                     | `uqor`                           |
| 小数桁数            | `6`                        | `6`                              |
| コインタイプ（BIP-44） | `118`                      | `118`                            |

チェーンを追加すると、Keplrはアカウント用に`qor1...`アドレスを生成します。

:::caution ガス価格の下限
ネットワークの最低ガス価格は**0.1uqor**です。Keplrのガス価格ステップを設定する場合（例えば`suggestChain`経由）、**0.1以上**の値を使用してください（推奨されるlow/average/high: `0.1 / 0.15 / 0.25`）。下限を下回って署名されたトランザクションは拒否されます。
:::

## MetaMask（EVM）

MetaMaskを使用すると、QoreChainのEVM実行環境と対話できます — Solidityコントラクトをデプロイし、ERC-20トークンを管理し、使い慣れたEthereumツールを利用できます。

### カスタムネットワークとしてQoreChainを追加

MetaMaskを開き、**設定 > ネットワーク > ネットワークを追加**に移動し、以下を入力します。

| 項目                | メインネット                     | テストネット                       |
| ------------------ | ------------------------- | -------------------------------- |
| ネットワーク名        | `QoreChain`               | `QoreChain Diana Testnet`        |
| RPC URL            | `https://evm.qore.host`   | `https://evm-testnet.qore.host`  |
| チェーンID           | `9801`                    | `9800`                           |
| 通貨シンボル          | `QOR`                     | `QOR`                            |
| ブロックエクスプローラーURL | `https://explore.qore.network` | `https://explore.qore.network` |

ネイティブQORは、EVMインターフェース上では**18桁の小数**を持ちます（wei形式）。接続後は、MetaMaskを使ってEVMトランザクションに署名したり、デプロイ済みのスマートコントラクトと対話したり、QoreChain上でERC-20トークンを管理したりできます。

### ワンコールでのネットワーク登録

dApps向けには、（npmに公開されている）**`@qorechain/wallet-adapter`**および**`@qorechain/connect`**パッケージが、1回の呼び出しでユーザーのウォレットにQoreChainを登録します — EIP-3085経由でMetaMaskにネットワークの追加を促し（EVMレール上で正しい**18桁の小数**を持つネイティブQORを使用）、Keplrのガス価格ステップを設定します。

```bash
npm install @qorechain/wallet-adapter @qorechain/connect
```

```ts
import { addQoreEvmToWallet } from "@qorechain/wallet-adapter";

await addQoreEvmToWallet(); // prompts MetaMask with QoreChain's EVM network params
```

## 1つのアカウント、3つのアドレス（統合アカウント） {#unified-accounts}

チェーンバージョン**v3.1.83**時点で、QoreChainアカウントは**3つのエンコーディングを持つ1つの20バイトID**です：`qor1…`（ネイティブ）、`0x…`（EVM）、およびbase58形式（SVM）。これは**1つの残高**を保持し — eth-nativeアカウントの場合は — Nativeパス上で必要となるポスト量子ハイブリッド署名を含め、**3つのレーンすべてを1つの鍵で署名**します。

`@qorechain/wallet-adapter`を使ってコード上で統合ウォレットを生成します。

```js
import { generateQoreWallet } from "@qorechain/wallet-adapter";

const w = await generateQoreWallet();          // or walletFromMnemonic(mnemonic)
console.log(w.addresses.cosmos);               // qor1...
console.log(w.addresses.evm);                  // 0x... (same identity)
console.log(w.addresses.svm);                  // base58 (same identity)
// Native-lane sends use signHybridEth (classical eth_secp256k1 + ML-DSA-87 hybrid).
```

3つの形式のいずれかに送られた資金は、同じ残高に反映されます。

## リンクウォレット：支払い鍵としてのPhantom & MetaMask {#linked-wallets}

チェーンバージョン**v3.1.85**時点で、dApp内でQoreChainアカウントから支払いを行うためにルート鍵を公開する必要はありません。**Phantom**（ed25519）または**MetaMask**（`personal_sign`によるEthereumアドレス経由）の鍵を、アカウントに**オーセンティケーターとして登録**できます — スコープ付き権限、支払い上限、有効期限、即時取り消しを備えた上で — その後、dAppのバックエンドが中継する送金を承認できます。全体のモデルとコードについては[リンクウォレット・オーセンティケーター](/developer-guide/account-abstraction#authenticators)を、エンドツーエンドの例については[SDKオーセンティケーターガイド](/sdk/guides/authenticators)を参照してください。

## Solanaウォレット（SVM）

:::caution SVMトランザクション送信は現在無効です
SVM実行レーンは、**現在ネットワーク全体でトランザクション送信が無効化されています** — 現時点ではQoreChainに対してSolana互換ウォレット経由でトランザクションを送信しないでください。残高やスロットの読み取りは引き続き機能する場合があります。現在の状況については[SVM開発](/developer-guide/svm-development)を参照してください。
:::

QoreChainのSVM実行環境は標準的なSolanaツールと互換性があり、アカウントの**ネイティブQOR残高はSVMインターフェース上で直接確認できます**（lamports単位、9桁の小数；1 uqor = 1,000 lamports）。任意のSolana互換ウォレットまたはライブラリを接続できます。

### @solana/web3.jsの使用

```javascript
import { Connection } from "@solana/web3.js";

// Public read-only endpoint (or http://localhost:8899 on your own node)
const connection = new Connection("https://svm.qore.host");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
```

公開されているSVMエンドポイントは**読み取り専用**です。トランザクションの送信には自分自身のノードが必要です。詳細は[SVM開発](/developer-guide/svm-development)を参照してください。

## PQC対応ウォレット（Cosmosパスで必須）

QoreChainは、Cosmosトランザクションパス上でハイブリッド型のポスト量子暗号（PQC）を必須としています。現在のチェーンバージョン（**v3.1.82**）時点では、ネットワークのデフォルトは`hybrid_signature_mode = required`かつ`allow_classical_fallback = false`です — そのため、**すべてのCosmosパスのトランザクションは、標準のsecp256k1（ECDSA）署名に加えてML-DSA-87（Dilithium-5）署名を含める必要があります**。PQCアカウントからのクラシック署名のみのCosmosトランザクションは拒否されます。

:::caution CosmosトランザクションにはハイブリッドPQC拡張が必要です
Cosmosパス上で通常のクラシックトランザクションを送信すると拒否されます。Dilithium-5署名を`PQCHybridSignature`トランザクション拡張として添付する必要があります。標準のCosmJS / Keplrツールはこの拡張を単体では生成しません — `qorechaind tx pqc cosign` CLIコマンド、QoreChain SDKのハイブリッド署名（以下を参照）、またはコード上で自分で構築する場合はオープンソースの[**qorechain-pqc**](/developer-guide/post-quantum-signing)ライブラリ（`hybridSignBytes`）を使用してください。唯一の例外は、genesisのgentxおよびPQC鍵の登録・移行トランザクションです。
:::

### 仕組み

ウォレットは、標準のsecp256k1（ECDSA）署名と並んで、ML-DSA-87 PQC署名をトランザクション拡張として添付します。クラシック署名は拡張を除いた署名バイトに対して計算されるため、クラシック検証に対して有効なまま維持され、同時にPQC署名が量子耐性を提供します。

### Dilithium-5鍵の生成

ハイブリッド署名用のポスト量子鍵を生成します。

```bash
qorechaind tx pqc gen-key
```

### 自動登録

最初のトランザクションにPQC公開鍵を含めると、QoreChainは自動的にそれをオンチェーンに登録します。別途登録手順は不要です。（PQC鍵の登録・移行トランザクション自体はハイブリッド要件の対象外であるため、アカウントは最初の鍵をブートストラップできます。）

### SDKによるハイブリッド署名

QoreChain SDKは、`includePqcPublicKey: true`を指定した`buildHybridTx`を通じて準拠したCosmosトランザクションを生成します。これによりDilithium-5拡張が添付され、自動登録用の公開鍵が埋め込まれます。詳細は[SDKアカウント＆PQC署名](/sdk/concepts/accounts-pqc)を参照してください。

### PQCモード

3つの強制モードは引き続きガバナンスによって制御されます。**現在のネットワークのデフォルトはRequiredです**：

| モード                   | 説明                                                             |
| ---------------------- | ----------------------------------------------------------------------- |
| **Disabled**           | PQC検証がオフになっています。標準署名のみです。               |
| **Optional**           | トランザクションはPQC署名を含めることができます。含まれている場合は検証されます。 |
| **Required**（デフォルト） | すべてのCosmosパスのトランザクションは有効なPQC署名を含める必要があります。        |

有効なモードはチェーンレベルで設定されており、ガバナンスを通じて更新できます。

:::note EVM / MetaMaskは影響を受けません
上記のMetaMask（EVM）フローは、ハイブリッド要件の影響を**受けません**。EVMトランザクションは別個の`eth_secp256k1`ante処理経路を使用しており、PQC拡張を必要とすることはありません。
:::

## CLIウォレット

`qorechaind`バイナリには、コマンドライン用の組み込み鍵管理システムが含まれています。

### 新しい鍵の作成

```bash
qorechaind keys add mykey
```

これにより新しい鍵ペアが生成され、ニーモニックフレーズが表示されます。**ニーモニックは安全に保管してください** — これがこの鍵を復元する唯一の方法です。

### アドレスの確認

```bash
qorechaind keys show mykey -a
```

これにより、`qor1...`形式のbech32アドレスが出力されます。

### すべての鍵の一覧表示

```bash
qorechaind keys list
```

### 既存の鍵のインポート

```bash
qorechaind keys add mykey --recover
```

ニーモニックフレーズの入力を求められます。

## 次のステップ

* [初めてのトランザクション](/getting-started/first-transaction) — 新しいウォレットを使ってQORトークンを送信する
* [テストネットへの接続](/getting-started/connecting-to-testnet) — 稼働中のDianaテストネットに参加する
