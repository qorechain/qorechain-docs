---
slug: /getting-started/wallet-setup
title: ウォレットのセットアップ
sidebar_label: ウォレットのセットアップ
sidebar_position: 2
---

# ウォレットのセットアップ

QoreChain は、ネイティブ、EVM、SVM の各実行環境にわたって複数のウォレットタイプをサポートしています。ユースケースに合ったウォレットを選択してください。

:::note
以下の値は、**`qorechain-vladi`** メインネット(EVM チェーン ID **9801**、2026 年 6 月 7 日より稼働中)と **`qorechain-diana`** テストネット(EVM チェーン ID **9800**)の両方をカバーしています。両ネットワークのパブリックエンドポイントは [ネットワーク](/appendix/networks#public-endpoints) に記載されています。
:::

## Keplr ウォレット

Keplr は、QoreChain のネイティブトランザクション、ステーキング、ガバナンスに推奨されるウォレットです。

### QoreChain をカスタムチェーンとして追加する

Keplr を開き、**Settings > Add Custom Chain** に移動して、次の内容を入力します。

| 項目               | メインネット               | テストネット                     |
| ------------------ | -------------------------- | -------------------------------- |
| チェーン名         | `QoreChain`                | `QoreChain Diana Testnet`        |
| チェーン ID        | `qorechain-vladi`          | `qorechain-diana`                |
| RPC URL            | `https://rpc.qore.host`    | `https://rpc-testnet.qore.host`  |
| REST URL           | `https://api.qore.host`    | `https://api-testnet.qore.host`  |
| Bech32 プレフィックス | `qor`                   | `qor`                            |
| コインデノム       | `QOR`                      | `QOR`                            |
| コイン最小デノム   | `uqor`                     | `uqor`                           |
| 小数点桁数         | `6`                        | `6`                              |
| コインタイプ (BIP-44) | `118`                   | `118`                            |

チェーンを追加すると、Keplr はアカウント用の `qor1...` アドレスを生成します。

:::caution ガス価格の下限
ネットワークの最低ガス価格は **0.1uqor** です。Keplr のガス価格ステップを設定する場合(例:`suggestChain` 経由)は、**0.1 以上**の値を使用してください(推奨の low/average/high:`0.1 / 0.15 / 0.25`)。下限を下回る価格で署名されたトランザクションは拒否されます。
:::

## MetaMask (EVM)

MetaMask を使うと、QoreChain の EVM 実行環境とやり取りできます。Solidity コントラクトのデプロイ、ERC-20 トークンの管理、使い慣れた Ethereum ツールの利用が可能です。

### QoreChain をカスタムネットワークとして追加する

MetaMask を開き、**Settings > Networks > Add Network** に移動して、次の内容を入力します。

| 項目               | メインネット              | テストネット                     |
| ------------------ | ------------------------- | -------------------------------- |
| ネットワーク名     | `QoreChain`               | `QoreChain Diana Testnet`        |
| RPC URL            | `https://evm.qore.host`   | `https://evm-testnet.qore.host`  |
| チェーン ID        | `9801`                    | `9800`                           |
| 通貨シンボル       | `QOR`                     | `QOR`                            |
| ブロックエクスプローラー URL | `https://explore.qore.network` | `https://explore.qore.network` |

ネイティブ QOR は EVM インターフェース上では **18 桁の小数点**(wei 形式)を持ちます。接続が完了すると、MetaMask を使って EVM トランザクションへの署名、デプロイ済みスマートコントラクトとのやり取り、QoreChain 上の ERC-20 トークンの管理が行えます。

### ワンコールでのネットワーク登録

dApp 向けには、npm で公開されている **`@qorechain/wallet-adapter`** と **`@qorechain/connect`** パッケージが、1 回の呼び出しでユーザーのウォレットに QoreChain を登録します。EIP-3085 経由で MetaMask にネットワーク追加を促し(EVM レール上の正しい **18 桁小数点**のネイティブ QOR を設定)、Keplr のガス価格ステップも設定します。

```bash
npm install @qorechain/wallet-adapter @qorechain/connect
```

```ts
import { addQoreEvmToWallet } from "@qorechain/wallet-adapter";

await addQoreEvmToWallet(); // prompts MetaMask with QoreChain's EVM network params
```

## Solana ウォレット (SVM)

QoreChain の SVM 実行環境は標準の Solana ツールと互換性があり、アカウントの**ネイティブ QOR 残高は SVM インターフェース上で直接確認できます**(lamports 単位、9 桁の小数点。1 uqor = 1,000 lamports)。Solana 互換のウォレットやライブラリを何でも接続できます。

### @solana/web3.js を使う

```javascript
import { Connection } from "@solana/web3.js";

// Public read-only endpoint (or http://localhost:8899 on your own node)
const connection = new Connection("https://svm.qore.host");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
```

パブリック SVM エンドポイントは**読み取り専用**です。トランザクションの送信には自前のノードが必要です。詳細は [SVM 開発](/developer-guide/svm-development) を参照してください。

## PQC 対応ウォレット(Cosmos パスでは必須)

QoreChain は cosmos トランザクションパスでハイブリッド耐量子暗号(PQC)を必須としています。現在のチェーンバージョン(**v3.1.82**)では、ネットワークのデフォルトは `hybrid_signature_mode = required` かつ `allow_classical_fallback = false` です。つまり、**すべての cosmos パスのトランザクションは、標準の secp256k1 (ECDSA) 署名に加えて ML-DSA-87 (Dilithium-5) 署名を含める必要があります**。PQC アカウントからの古典署名のみの cosmos トランザクションは拒否されます。

:::caution Cosmos トランザクションにはハイブリッド PQC 拡張が必要です
cosmos パスで通常の古典トランザクションを送信すると拒否されます。Dilithium-5 署名を `PQCHybridSignature` トランザクション拡張として添付する必要があります。標準の CosmJS / Keplr ツールは、この拡張を自動では生成しません。`qorechaind tx pqc cosign` CLI コマンド、QoreChain SDK のハイブリッド署名(下記参照)、あるいはコードで自作する場合はオープンソースの [**qorechain-pqc**](/developer-guide/post-quantum-signing) ライブラリ(`hybridSignBytes`)を使用してください。唯一の例外は、genesis gentx と PQC 鍵の登録/移行トランザクションです。
:::

### 動作の仕組み

ウォレットは、標準の secp256k1 (ECDSA) 署名に加えて、ML-DSA-87 の PQC 署名をトランザクション拡張として添付します。古典署名は拡張を除外した署名バイト列に対して計算されるため、古典検証では引き続き有効であり、PQC 署名が量子耐性を提供します。

### Dilithium-5 鍵の生成

ハイブリッド署名用の耐量子鍵を生成します。

```bash
qorechaind tx pqc gen-key
```

### 自動登録

最初のトランザクションに PQC 公開鍵を含めると、QoreChain が自動的にオンチェーンに登録します。個別の登録手順は不要です。(PQC 鍵の登録/移行トランザクション自体はハイブリッド要件の対象外なので、アカウントは最初の鍵をブートストラップできます。)

### SDK によるハイブリッド署名

QoreChain SDK は、`includePqcPublicKey: true` を指定した `buildHybridTx` によって準拠した cosmos トランザクションを生成します。これは Dilithium-5 拡張を添付し、自動登録用の公開鍵を埋め込みます。[SDK アカウントと PQC 署名](/sdk/concepts/accounts-pqc) を参照してください。

### PQC モード

3 つの適用モードは引き続きガバナンスで制御されます。**現在のネットワークデフォルトは Required です**。

| モード                 | 説明                                                                    |
| ---------------------- | ----------------------------------------------------------------------- |
| **Disabled**           | PQC 検証は無効です。標準署名のみが使用されます。                         |
| **Optional**           | トランザクションは PQC 署名を含めることができます。含まれている場合は検証されます。 |
| **Required**(デフォルト) | すべての cosmos パスのトランザクションは有効な PQC 署名を含める必要があります。 |

有効なモードはチェーンレベルで設定され、ガバナンスを通じて更新できます。

:::note EVM / MetaMask には影響なし
上記の MetaMask (EVM) フローは、ハイブリッド要件の影響を**受けません**。EVM トランザクションは別の `eth_secp256k1` ante パスを使用するため、PQC 拡張は一切不要です。
:::

## CLI ウォレット

`qorechaind` バイナリには、コマンドライン用の鍵管理システムが組み込まれています。

### 新しい鍵の作成

```bash
qorechaind keys add mykey
```

これにより新しい鍵ペアが生成され、ニーモニックフレーズが表示されます。**ニーモニックは安全に保管してください** — この鍵を復元する唯一の手段です。

### アドレスの確認

```bash
qorechaind keys show mykey -a
```

これにより `qor1...` 形式の bech32 アドレスが出力されます。

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

* [最初のトランザクション](/getting-started/first-transaction) — 新しいウォレットで QOR トークンを送信する
* [テストネットへの接続](/getting-started/connecting-to-testnet) — 稼働中の Diana テストネットに参加する
