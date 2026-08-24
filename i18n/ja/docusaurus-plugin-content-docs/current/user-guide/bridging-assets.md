---
slug: /user-guide/bridging-assets
title: アセットのブリッジ
sidebar_label: アセットのブリッジ
sidebar_position: 5
---

# アセットのブリッジ

このガイドでは、QoreChainと他のブロックチェーンネットワーク間でアセットを移動する方法について説明します。QoreChainの相互運用レイヤーは、異種ネットワーク向けの**37個のQCB(QoreChain Bridge)構成**(QoreChainループバックを含む)と、Cosmosエコシステムのチェーン向けの**8個のIBCチャネル**で構成されています。

:::caution
クロスチェーンブリッジは現在、**テストネット/プレプロダクション**段階にあります。接続の可用性、対応アセット、ファイナリティパラメータは変更される可能性があり、本番稼働可能なものとして扱うべきではありません。転送を利用する前に、必ず**`qorechain-diana`**上で検証してください。
:::

:::note
以下のコマンドは**`qorechain-diana`**テストネット(EVMチェーンID **9800**)を使用しています。メインネット(**`qorechain-vladi`**、EVMチェーンID **9801**)は2026年6月7日からチェーンバージョン**v3.1.92**で稼働しています — ブリッジ対応が有効化されている場合は、**メインネットへの接続**ページに記載のメインネットのチェーンIDとエンドポイントに置き換えてください。
:::

---

## 接続の概要

QoreChainは2種類のブリッジプロトコルを提供します。

| プロトコル                                 | 接続数        | 用途                                                                 |
| ---------------------------------------- | ------------------ | ------------------------------------------------------------------------ |
| **IBC**(Inter-Blockchain Communication) | 8チャネル         | IBC対応チェーンとのネイティブな相互運用性                          |
| **QCB**(QoreChain Bridge)               | 37構成  | PQCで保護されたアテステーションによる非IBCネットワークとのクロスチェーン転送 |

すべてのQCB構成とIBCチャネルの完全な一覧は、**ブリッジアーキテクチャ**ページに掲載されています。このガイドでは、日常的なブリッジ利用に焦点を当てます。

---

## IBCチャネル

以下のIBC対応チェーンは、QoreChainとの間にチャネルを確立しています。

| チェーン                | チャネル     | ステータス |
| -------------------- | ----------- | ------ |
| Cosmos Hub           | `channel-0` | Active |
| Osmosis              | `channel-1` | Active |
| Noble                | `channel-2` | Active |
| Celestia             | `channel-3` | Active |
| Stride               | `channel-4` | Active |
| Akash                | `channel-5` | Active |
| Babylon              | `channel-6` | Active |
| QoreChain(ループバック) | `channel-7` | Active |

IBC転送には、標準の`ibc-transfer`モジュールを使用します。

```bash
qorechaind tx ibc-transfer transfer transfer <channel> <recipient> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## QCBブリッジのエンドポイント

QoreChain Bridgeは、複数のエコシステムタイプにまたがる外部チェーンに接続します。対応ネットワークの代表例は以下のとおりです。

| チェーン     | チェーンタイプ | 対応アセット |
| --------- | ---------- | ---------------- |
| Ethereum  | EVM        | ETH, USDC, WBTC  |
| BSC       | EVM        | BNB, USDC        |
| Solana    | Solana     | SOL, USDC        |
| Avalanche | EVM        | AVAX, USDC       |
| Polygon   | EVM        | MATIC, USDC      |
| Arbitrum  | EVM        | ETH, ARB, USDC   |
| TON       | TON        | TON              |
| Sui       | Sui Move   | SUI              |
| Optimism  | EVM        | ETH, USDC, OP    |
| Base      | EVM        | ETH, USDC        |
| Aptos     | Aptos      | APT, USDC        |
| Bitcoin   | Bitcoin    | BTC              |
| NEAR      | NEAR       | NEAR, USDC       |
| Cardano   | Cardano    | ADA              |
| Polkadot  | Polkadot   | DOT              |
| Tezos     | Tezos      | XTZ              |
| Tron      | Tron       | TRX, USDT        |

QCB構成の全リストと現在のロールアウト状況については、**ブリッジアーキテクチャ**ページを参照してください。

---

## 入金フロー(外部チェーンからQoreChainへ)

外部チェーンからQoreChainへのアセット入金は、次の手順で行われます。

1. **ロック** — 外部チェーン上でトークンをQCBブリッジのコントラクトまたはアドレスに送信してロックします。
2. **アテステーション** — ブリッジバリデータがロックトランザクションを検知し、PQC署名付きのアテステーションを生成します。
3. **しきい値** — バリデータのアテステーションが**10件中7件**集まると、ブリッジが入金を確定します。
4. **ミント** — 相当量のラップトークンがQoreChain上でミントされ、あなたの`qor1...`アドレスに入金されます。

**CLIコマンド:**

```bash
qorechaind tx bridge deposit \
  --chain ethereum \
  --amount 1000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## 出金フロー(QoreChainから外部チェーンへ)

QoreChainから外部チェーンへのアセット出金:

1. **バーン** — QoreChain上でラップトークンをバーン(焼却)します。
2. **アテステーション** — ブリッジバリデータがバーンを検知し、PQC署名付きのアテステーションを生成します。
3. **しきい値** — アテステーションが**10件中7件**集まると、出金が確定します。
4. **アンロック** — 元のトークンが外部チェーン上で指定した宛先アドレスに解放されます。

**CLIコマンド:**

```bash
qorechaind tx bridge withdraw \
  --chain ethereum \
  --amount 1000000 \
  --to 0xYourEthereumAddress \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## セキュリティモデル

QoreChain Bridgeは、複数の防御レイヤーによって保護されています。

| メカニズム                    | 説明                                                                                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **7-of-10 PQCマルチシグ**     | すべてのブリッジ操作には、10のブリッジバリデータのうち少なくとも7つからのアテステーションが必要で、それぞれが耐量子暗号署名を使用します。               |
| **24時間チャレンジ期間**       | 設定可能なしきい値を超える出金は、24時間のチャレンジウィンドウに入り、その間バリデータやウォッチャーが不正なトランザクションにフラグを立てることができます。 |
| **サーキットブレーカー**       | 異常な取引量や不審なパターンが検出されると、自動レートリミッターがブリッジ操作を停止します。ブリッジ操作は手動レビュー後に再開されます。  |

---

## ブリッジステータスの照会

保留中のブリッジ操作のステータスを確認します。

```bash
qorechaind query bridge pending-deposits --address <your_qor_address>
```

```bash
qorechaind query bridge pending-withdrawals --address <your_qor_address>
```

すべてのアクティブなブリッジ接続を一覧表示します。

```bash
qorechaind query bridge connections
```

---

## ヒント

* ブリッジ入金は通常、必要な7-of-10のアテステーションが集まってから数分以内に確定します。
* 大口の出金は自動的に24時間のチャレンジ期間の対象となります。時間に制約のある転送は事前に計画してください。
* 宛先アドレスの形式が対象チェーンに一致していることを必ず確認してください(例: EVMチェーンでは`0x...`、Solanaではbase58)。
* IBC転送はネイティブなプロトコルレベルの通信を利用するため、通常QCB転送より高速です。
* ブリッジ手数料は`bridge_fee`バーンチャネルを通じてバーンされます([トークン操作](/user-guide/token-operations)を参照)。
