---
slug: /getting-started/wallet-setup
title: ウォレットのセットアップ
sidebar_label: ウォレットのセットアップ
sidebar_position: 2
---

# ウォレットのセットアップ

QoreChain は、ネイティブ、EVM、SVM の各実行環境にわたって複数のウォレットタイプをサポートしています。ご自身のユースケースに合ったウォレットを選択してください。

:::note
以下のチェーン ID と RPC エンドポイントは **`qorechain-diana`** テストネット（EVM チェーン ID **9800**）を対象としています。メインネット（**`qorechain-vladi`**、EVM チェーン ID **9801**）は 2026 年 6 月 7 日から稼働しており、そのウォレット接続値は別ページの **メインネットへの接続** に記載されています。
:::

## Keplr ウォレット

Keplr は、ネイティブな QoreChain トランザクション、ステーキング、ガバナンスに推奨されるウォレットです。

### QoreChain をカスタムチェーンとして追加する

Keplr を開き、**Settings > Add Custom Chain** に移動して、次の値を入力します:

| フィールド          | 値                        |
| ------------------ | ------------------------- |
| Chain Name         | `QoreChain Diana Testnet` |
| Chain ID           | `qorechain-diana`         |
| RPC URL            | `http://localhost:26657`  |
| REST URL           | `http://localhost:1317`   |
| Bech32 Prefix      | `qor`                     |
| Coin Denom         | `QOR`                     |
| Coin Minimal Denom | `uqor`                    |
| Decimals           | `6`                       |

チェーンを追加すると、Keplr はあなたのアカウント用に `qor1...` アドレスを生成します。このアドレスを使用してテストネット QOR トークンを受け取ります。

## MetaMask (EVM)

MetaMask を使うと、QoreChain の EVM 実行環境とやり取りできます。Solidity コントラクトのデプロイ、ERC-20 トークンの管理、使い慣れた Ethereum ツールの利用が可能です。

### QoreChain をカスタムネットワークとして追加する

MetaMask を開き、**Settings > Networks > Add Network** に移動して、次の値を入力します:

| フィールド        | 値                      |
| --------------- | ----------------------- |
| Network Name    | `QoreChain EVM`         |
| RPC URL         | `http://localhost:8545` |
| Chain ID        | `9800`                  |
| Currency Symbol | `QOR`                   |

接続が完了すると、MetaMask を使って EVM トランザクションへの署名、デプロイ済みスマートコントラクトとのやり取り、QoreChain 上の ERC-20 トークンの管理ができます。

### ワンコールでのネットワーク登録

dApp 向けには、**`@qorechain/wallet-adapter`** および **`@qorechain/connect`** パッケージ（npm に公開済み、v0.1.0）が、ワンコールでユーザーのウォレットに QoreChain を登録します。EIP-3085 を介して MetaMask にネットワーク追加を促し（EVM レール上で正しい **18 桁の小数** を持つネイティブ QOR を設定）、Keplr のガス価格ステップを構成します:

```bash
npm install @qorechain/wallet-adapter @qorechain/connect
```

```ts
import { addQoreEvmToWallet } from "@qorechain/wallet-adapter";

await addQoreEvmToWallet(); // prompts MetaMask with QoreChain's EVM network params
```

## Solana ウォレット (SVM)

QoreChain の SVM 実行環境は、標準的な Solana ツールと互換性があります。Solana 互換のウォレットやライブラリを接続して、SVM プログラムとやり取りできます。

### @solana/web3.js の使用

```javascript
import { Connection } from "@solana/web3.js";

const connection = new Connection("http://localhost:8899");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
```

これにより、QoreChain 上で動作する SVM プログラムのデプロイとやり取りが可能になります。

## PQC 対応ウォレット（Cosmos パスでは必須）

QoreChain は、cosmos トランザクションパスでハイブリッドなポスト量子暗号（PQC）を必要とします。現在のチェーンバージョン（**v3.1.80**）では、ネットワークのデフォルトは `hybrid_signature_mode = required` かつ `allow_classical_fallback = false` です。そのため、**すべての cosmos パストランザクションは、標準の secp256k1（ECDSA）署名に加えて ML-DSA-87（Dilithium-5）署名を伴う必要があります**。PQC アカウントからのクラシックのみの cosmos トランザクションは拒否されます。

:::caution Cosmos トランザクションにはハイブリッド PQC 拡張が必要
cosmos パスで通常のクラシックトランザクションを送信すると拒否されます。Dilithium-5 署名を `PQCHybridSignature` トランザクション拡張として添付する必要があります。標準の CosmJS / Keplr ツール単体ではこの拡張は生成されません。`qorechaind tx pqc cosign` CLI コマンド、QoreChain SDK のハイブリッド署名（下記参照）を使用するか、コード内で自分で構築する場合はオープンソースの [**qorechain-pqc**](/developer-guide/post-quantum-signing) ライブラリ（`hybridSignBytes`）を使用してください。唯一の例外は、ジェネシス gentx と PQC 鍵の登録/移行トランザクションです。
:::

### 仕組み

ウォレットは、標準の secp256k1（ECDSA）署名に加えて、ML-DSA-87 PQC 署名をトランザクション拡張として添付します。クラシック署名は拡張を除外した署名対象バイトに対して計算されるため、クラシック検証では有効なまま保たれ、その一方で PQC 署名が量子耐性を提供します。

### Dilithium-5 鍵の生成

ハイブリッド署名用のポスト量子鍵を生成します:

```bash
qorechaind tx pqc gen-key
```

### 自動登録

最初のトランザクションに PQC 公開鍵を含めると、QoreChain がそれをオンチェーンに自動登録します。別途登録手順は不要です。（PQC 鍵の登録/移行トランザクション自体はハイブリッド要件から免除されているため、アカウントは最初の鍵をブートストラップできます。）

### SDK によるハイブリッド署名

QoreChain SDK は、`includePqcPublicKey: true` を指定した `buildHybridTx` を介して準拠した cosmos トランザクションを生成します。これは Dilithium-5 拡張を添付し、自動登録のために公開鍵を埋め込みます。[SDK アカウントと PQC 署名](/sdk/concepts/accounts-pqc) を参照してください。

### PQC モード

3 つの強制モードは引き続きガバナンスによって制御されます。**現在のネットワークのデフォルトは Required です**:

| モード                  | 説明                                                                   |
| ---------------------- | ----------------------------------------------------------------------- |
| **Disabled**           | PQC 検証は無効です。標準署名のみ。                                          |
| **Optional**           | トランザクションは PQC 署名を含めることができます。含まれる場合は検証されます。   |
| **Required**（デフォルト） | すべての cosmos パストランザクションは有効な PQC 署名を含む必要があります。      |

アクティブなモードはチェーンレベルで構成され、ガバナンスを通じて更新できます。

:::note EVM / MetaMask は影響を受けません
上記の MetaMask（EVM）フローは、ハイブリッド要件の影響を **受けません**。EVM トランザクションは別個の `eth_secp256k1` ante パスを使用し、PQC 拡張を必要とすることは決してありません。
:::

## CLI ウォレット

`qorechaind` バイナリには、コマンドライン用途向けの組み込み鍵管理システムが含まれています。

### 新しい鍵の作成

```bash
qorechaind keys add mykey
```

これにより新しい鍵ペアが生成され、ニーモニックフレーズが表示されます。**ニーモニックは安全に保管してください** — それがこの鍵を復元する唯一の方法です。

### アドレスの表示

```bash
qorechaind keys show mykey -a
```

これにより、あなたの `qor1...` bech32 アドレスが出力されます。

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

* [はじめてのトランザクション](/getting-started/first-transaction) — 新しいウォレットを使って QOR トークンを送信する
* [テストネットへの接続](/getting-started/connecting-to-testnet) — 稼働中の Diana テストネットに参加する
