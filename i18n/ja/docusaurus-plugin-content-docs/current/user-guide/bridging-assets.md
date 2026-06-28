---
slug: /user-guide/bridging-assets
title: アセットのブリッジ
sidebar_label: アセットのブリッジ
sidebar_position: 5
---

# アセットのブリッジ

このガイドでは、QoreChain と他のブロックチェーンネットワークの間でアセットを移動する方法について説明します。QoreChain の相互運用性レイヤーは、異種ネットワーク向けの **37 個の QCB（QoreChain Bridge）構成**（QoreChain ループバックを含む）と、Cosmos エコシステムのチェーン向けの **8 個の IBC チャネル** で構成されています。

:::caution
クロスチェーンブリッジは現在 **テストネット / プリプロダクション** 段階にあります。接続の可用性、サポートされるアセット、ファイナリティパラメータは変更される可能性があり、本番環境対応とみなすべきではありません。それらに依存する前に、必ず **`qorechain-diana`** ですべての送金を検証してください。
:::

:::note
以下のコマンドは **`qorechain-diana`** テストネット（EVM チェーン ID **9800**）を使用します。メインネット（**`qorechain-vladi`**、EVM チェーン ID **9801**）は、チェーンバージョン **v3.1.80** で稼働し、2026 年 6 月 7 日以降稼働中です。ブリッジサポートが有効になっている場合は、**メインネットへの接続** ページからメインネットのチェーン ID とエンドポイントに置き換えてください。
:::

---

## 接続の概要

QoreChain は 2 つのブリッジングプロトコルを提供します。

| プロトコル                                 | 接続数        | ユースケース                                                                 |
| ---------------------------------------- | ------------------ | ------------------------------------------------------------------------ |
| **IBC**（Inter-Blockchain Communication） | 8 チャネル         | IBC 対応チェーンとのネイティブな相互運用性                          |
| **QCB**（QoreChain Bridge）               | 37 構成  | PQC で保護されたアテステーションによる非 IBC ネットワークとのクロスチェーン送金 |

すべての QCB 構成と IBC チャネルの完全な列挙は **ブリッジアーキテクチャ** ページにあります。このガイドでは日々のブリッジング利用に焦点を当てます。

---

## IBC チャネル

以下の IBC 対応チェーンが QoreChain とのチャネルを確立しています。

| チェーン                | チャネル     | ステータス |
| -------------------- | ----------- | ------ |
| Cosmos Hub           | `channel-0` | アクティブ |
| Osmosis              | `channel-1` | アクティブ |
| Noble                | `channel-2` | アクティブ |
| Celestia             | `channel-3` | アクティブ |
| Stride               | `channel-4` | アクティブ |
| Akash                | `channel-5` | アクティブ |
| Babylon              | `channel-6` | アクティブ |
| QoreChain（ループバック） | `channel-7` | アクティブ |

IBC 送金は標準の `ibc-transfer` モジュールを使用します。

```bash
qorechaind tx ibc-transfer transfer transfer <channel> <recipient> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## QCB ブリッジエンドポイント

QoreChain Bridge は、複数のエコシステムタイプにまたがる外部チェーンに接続します。サポートされるネットワークの代表的な一例:

| チェーン     | チェーンタイプ | サポートされるアセット |
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

QCB 構成の完全なリストとその現在のロールアウト状況については、**ブリッジアーキテクチャ** ページを参照してください。

---

## デポジットフロー（外部チェーンから QoreChain へ）

外部チェーンから QoreChain へアセットをデポジットする手順は以下のとおりです。

1. **ロック** — トークンを QCB ブリッジコントラクトまたはアドレスに送信して、外部チェーン上でロックします。
2. **アテステーション** — ブリッジバリデータがロックトランザクションを観測し、PQC 署名されたアテステーションを生成します。
3. **しきい値** — **10 個中 7 個** のバリデータアテステーションが収集されると、ブリッジはデポジットを確定します。
4. **ミント** — 同等のラップされたトークンが QoreChain 上でミントされ、あなたの `qor1...` アドレスに入金されます。

**CLI コマンド:**

```bash
qorechaind tx bridge deposit \
  --chain ethereum \
  --amount 1000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## 引き出しフロー（QoreChain から外部チェーンへ）

QoreChain から外部チェーンへアセットを引き出す手順:

1. **バーン** — QoreChain 上のラップされたトークンをバーンします。
2. **アテステーション** — ブリッジバリデータがバーンを観測し、PQC 署名されたアテステーションを生成します。
3. **しきい値** — **10 個中 7 個** のアテステーションが収集されると、引き出しが確定します。
4. **アンロック** — 元のトークンが外部チェーン上で、指定された宛先アドレスにリリースされます。

**CLI コマンド:**

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

QoreChain Bridge は複数の防御レイヤーによって保護されています。

| メカニズム                    | 説明                                                                                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **7-of-10 PQC マルチシグ**     | すべてのブリッジ操作には、10 個中少なくとも 7 個のブリッジバリデータからのアテステーションが必要であり、それぞれがポスト量子暗号署名を使用します。               |
| **24 時間のチャレンジ期間** | 設定可能なしきい値を超える引き出しは、24 時間のチャレンジウィンドウに入ります。この期間中、バリデータまたはウォッチャーは不正なトランザクションをフラグできます。 |
| **サーキットブレーカー**         | 異常なボリュームや疑わしいパターンが検出されると、自動レートリミッターがブリッジ操作を停止します。ブリッジ操作は手動レビュー後に再開されます。  |

---

## ブリッジステータスのクエリ

保留中のブリッジ操作のステータスを確認します。

```bash
qorechaind query bridge pending-deposits --address <your_qor_address>
```

```bash
qorechaind query bridge pending-withdrawals --address <your_qor_address>
```

アクティブなすべてのブリッジ接続を一覧表示します。

```bash
qorechaind query bridge connections
```

---

## ヒント

* ブリッジデポジットは、必要な 10 個中 7 個のアテステーションが集まると、通常数分以内に確定します。
* 大口の引き出しは、24 時間のチャレンジ期間を自動的にトリガーします。時間に敏感な送金は前もって計画してください。
* 宛先アドレスのフォーマットが対象チェーンと一致していることを必ず確認してください（例: EVM チェーンの場合は `0x...`、Solana の場合は base58）。
* IBC 送金は、ネイティブなプロトコルレベルの通信を使用するため、一般的に QCB 送金より高速です。
* ブリッジ手数料は `bridge_fee` バーンチャネルを通じてバーンされます（[トークン操作](/user-guide/token-operations) を参照）。
