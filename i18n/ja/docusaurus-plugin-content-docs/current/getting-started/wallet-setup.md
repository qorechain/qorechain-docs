---
slug: /getting-started/wallet-setup
title: ウォレットのセットアップ
sidebar_label: ウォレットのセットアップ
sidebar_position: 2
---

# ウォレットのセットアップ

QoreChain は、ネイティブ、EVM、SVM の各実行環境にわたって複数のウォレットタイプをサポートしています。ユースケースに合ったウォレットを選択してください。

:::note
以下のチェーン ID と RPC エンドポイントは **`qorechain-diana`** テストネット（EVM チェーン ID **9800**）を対象としています。メインネット（**`qorechain-vladi`**、EVM チェーン ID **9801**）は 2026 年 6 月 7 日から稼働しており、そのウォレット接続値は別ページの **メインネットへの接続** に記載されています。
:::

## Keplr ウォレット

Keplr は、ネイティブな QoreChain トランザクション、ステーキング、ガバナンスに推奨されるウォレットです。

### QoreChain をカスタムチェーンとして追加する

Keplr を開き、**Settings > Add Custom Chain** に移動して、次の内容を入力します。

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

チェーンを追加すると、Keplr はアカウント用に `qor1...` アドレスを生成します。このアドレスを使ってテストネット QOR トークンを受け取ります。

## MetaMask（EVM）

MetaMask を使うと、QoreChain の EVM 実行環境とやり取りできます。Solidity コントラクトのデプロイ、ERC-20 トークンの管理、使い慣れた Ethereum ツールの利用が可能です。

### QoreChain をカスタムネットワークとして追加する

MetaMask を開き、**Settings > Networks > Add Network** に移動して、次の内容を入力します。

| フィールド       | 値                      |
| --------------- | ----------------------- |
| Network Name    | `QoreChain EVM`         |
| RPC URL         | `http://localhost:8545` |
| Chain ID        | `9800`                  |
| Currency Symbol | `QOR`                   |

接続後は、MetaMask を使って EVM トランザクションに署名し、デプロイ済みのスマートコントラクトとやり取りし、QoreChain 上の ERC-20 トークンを管理できます。

## Solana ウォレット（SVM）

QoreChain の SVM 実行環境は、標準的な Solana ツールと互換性があります。Solana 互換のウォレットやライブラリを接続して、SVM プログラムとやり取りできます。

### @solana/web3.js を使う

```javascript
import { Connection } from "@solana/web3.js";

const connection = new Connection("http://localhost:8899");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
```

これにより、QoreChain 上で動作する SVM プログラムのデプロイとやり取りが可能になります。

## PQC 対応ウォレット（Cosmos パスでは必須）

QoreChain は、cosmos トランザクションパスにおいてハイブリッドな耐量子暗号（PQC）を必須としています。現行のチェーンバージョン（**v3.1.77**）では、ネットワークのデフォルトは `hybrid_signature_mode = required` および `allow_classical_fallback = false` です。そのため、**すべての cosmos パストランザクションは、標準の secp256k1（ECDSA）署名に加えて ML-DSA-87（Dilithium-5）署名を必ず含める必要があります**。PQC アカウントからの古典署名のみの cosmos トランザクションは拒否されます。

:::caution Cosmos トランザクションにはハイブリッド PQC 拡張が必要です
cosmos パスで古典署名のみのプレーンなトランザクションを送信すると拒否されます。Dilithium-5 署名を `PQCHybridSignature` トランザクション拡張として添付する必要があります。標準的な CosmJS / Keplr のツールはこの拡張を単独では生成しません。`qorechaind tx pqc cosign` CLI コマンド、QoreChain SDK のハイブリッド署名（下記参照）、または、自分のコードで構築する場合はオープンソースの [**qorechain-pqc**](/developer-guide/post-quantum-signing) ライブラリ（`hybridSignBytes`）を使用してください。唯一の例外は、ジェネシスの gentx と PQC 鍵の登録／移行トランザクションです。
:::

### 仕組み

ウォレットは、標準の secp256k1（ECDSA）署名と並んで、ML-DSA-87 PQC 署名をトランザクション拡張として添付します。古典署名は拡張を除外した署名バイト上で計算されるため、古典的な検証では有効なまま保たれ、一方で PQC 署名が耐量子性を提供します。

### Dilithium-5 鍵を生成する

ハイブリッド署名用の耐量子鍵を生成します。

```bash
qorechaind tx pqc gen-key
```

### 自動登録

最初のトランザクションに PQC 公開鍵を含めると、QoreChain がそれをオンチェーンで自動的に登録します。別途の登録手順は不要です。（PQC 鍵の登録／移行トランザクション自体はハイブリッド要件の対象外であるため、アカウントは最初の鍵をブートストラップできます。）

### SDK によるハイブリッド署名

QoreChain SDK は、`includePqcPublicKey: true` を指定した `buildHybridTx` によって、要件に準拠した cosmos トランザクションを生成します。これにより Dilithium-5 拡張が添付され、自動登録のために公開鍵が埋め込まれます。[SDK アカウントと PQC 署名](/sdk/concepts/accounts-pqc) を参照してください。

### PQC モード

3 つの強制モードはガバナンスによって制御されたままです。**現在のネットワークのデフォルトは Required（必須）** です。

| モード                   | 説明                                                                       |
| ---------------------- | ------------------------------------------------------------------------- |
| **Disabled**           | PQC 検証はオフです。標準署名のみ。                                            |
| **Optional**           | トランザクションは PQC 署名を含めることができます。含まれている場合は検証されます。 |
| **Required**（デフォルト） | すべての cosmos パストランザクションは有効な PQC 署名を含める必要があります。     |

有効なモードはチェーンレベルで構成され、ガバナンスを通じて更新できます。

:::note EVM / MetaMask は影響を受けません
上記の MetaMask（EVM）フローは、ハイブリッド要件の影響を **受けません**。EVM トランザクションは別の `eth_secp256k1` ante パスを使用し、PQC 拡張を必要としません。
:::

## CLI ウォレット

`qorechaind` バイナリには、コマンドライン利用のための鍵管理システムが組み込まれています。

### 新しい鍵を作成する

```bash
qorechaind keys add mykey
```

これにより新しい鍵ペアが生成され、ニーモニックフレーズが表示されます。**ニーモニックは安全に保管してください** — それがこの鍵を復元する唯一の方法です。

### 自分のアドレスを表示する

```bash
qorechaind keys show mykey -a
```

これにより `qor1...` の bech32 アドレスが出力されます。

### すべての鍵を一覧表示する

```bash
qorechaind keys list
```

### 既存の鍵をインポートする

```bash
qorechaind keys add mykey --recover
```

ニーモニックフレーズの入力を求められます。

## 次のステップ

* [はじめてのトランザクション](/getting-started/first-transaction) — 新しいウォレットを使って QOR トークンを送る
* [テストネットへの接続](/getting-started/connecting-to-testnet) — 稼働中の Diana テストネットに参加する
