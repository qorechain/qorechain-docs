---
slug: /appendix/networks
title: ネットワーク
sidebar_label: ネットワーク
sidebar_position: 4
---

# ネットワーク

QoreChain ネットワークの統合リファレンスです — チェーン識別子、EVM チェーン ID、トークン単位（デノム）、アドレスプレフィックス、パブリックエンドポイント、標準サービスポートをまとめています。

## ネットワーク概要

| | メインネット | テストネット |
|---|---|---|
| **ステータス** | 稼働中 | アクティブなテストネット |
| **Cosmos チェーン ID** | `qorechain-vladi` | `qorechain-diana` |
| **EVM チェーン ID（EIP-155）** | **9801**（16進 `0x2649`） | **9800**（16進 `0x2648`） |
| **稼働開始** | 2026年6月7日 23:59 UTC | — |
| **チェーンバージョン** | v3.1.82 | v3.1.82 |
| **フレームワーク** | Cosmos SDK v0.53 | Cosmos SDK v0.53 |
| **最低ガス価格** | `0.1uqor` | `0.1uqor` |
| **接続ガイド** | [メインネットへの接続](/getting-started/connecting-to-mainnet) | [テストネットへの接続](/getting-started/connecting-to-testnet) |

## パブリックエンドポイント {#public-endpoints}

すべてのパブリックエンドポイントは HTTPS 経由で提供されます。

| サービス | メインネット | テストネット |
|---|---|---|
| コンセンサス RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| コンセンサス WebSocket | `wss://rpc.qore.host/websocket` | `wss://rpc-testnet.qore.host/websocket` |
| Cosmos REST（LCD） | `https://api.qore.host` | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| EVM WebSocket | — | `wss://evm-ws-testnet.qore.host` |
| SVM JSON-RPC（Solana 互換、読み取り専用） | `https://svm.qore.host` | `https://svm-testnet.qore.host` |
| ブロックエクスプローラー | [explore.qore.network](https://explore.qore.network) | [explore.qore.network](https://explore.qore.network)（Testnet に切り替え） |
| ダウンロード（バイナリ / ジェネシス / スナップショット） | [download.qore.host](https://download.qore.host) | — |

:::note
パブリック SVM エンドポイントは**読み取り専用**です（トランザクション送信はエッジで無効化されています）。SVM への書き込みが必要な場合は自前のノードを運用してください。大量のワークロードや本番用途にも自前のノード運用を推奨します — [ノードの実行](/developer-guide/running-a-node)を参照してください。
:::

## トークンとアドレス

| 項目 | 値 |
|---|---|
| **表示デノム** | QOR |
| **基本デノム** | uqor（1 QOR = 10⁶ uqor） |
| **インターフェースごとの小数点桁数** | Cosmos **6**（`uqor`）· EVM **18**（wei 形式；1 uqor = 10¹² wei）· SVM **9**（lamports；1 uqor = 1,000 lamports） |
| **HD コインタイプ（BIP-44）** | `118` |
| **Bech32 アカウントプレフィックス** | `qor`（例：`qor1...`） |
| **Bech32 バリデータープレフィックス** | `qorvaloper`（例：`qorvaloper1...`） |

3 つのインターフェースは**単一の統合されたネイティブ QOR 残高**を公開します。同じ鍵が、その `qor1...`（Cosmos）、`0x...`（EVM）、base58（SVM）の各アドレス形式で同じ資金を管理します。

## 標準ポート

自身で運用する QoreChain ノードが公開する標準サービスポートは以下のとおりです。

| サービス | ポート |
|---|---|
| Cosmos RPC | 26657 |
| P2P | 26656 |
| REST / API | 1317 |
| gRPC | 9090 |
| EVM JSON-RPC | 8545 |
| EVM JSON-RPC（WebSocket） | 8546 |
| SVM（Solana 互換）JSON-RPC | 8899 |
| Prometheus メトリクス | 26660 |

## エンドポイントとアクセス

- ノード接続、ピア、ジェネシス、スナップショットについては、[メインネットへの接続](/getting-started/connecting-to-mainnet)または[テストネットへの接続](/getting-started/connecting-to-testnet)に従ってください。
- アプリケーションからプログラムでアクセスする場合は、ネットワーク設定を自動的に解決する [QoreChain SDK](/sdk/overview) を使用してください。
- パブリックの**ブロックエクスプローラー**は [explore.qore.network](https://explore.qore.network) にあります。[dashboard.qorechain.io](https://dashboard.qorechain.io) のダッシュボードには独自のエクスプローラービューが含まれており、テストネットの**フォーセット**もそこから利用できます（[ダッシュボードのフォーセット](/dashboard/faucet)を参照）。
- 本ドキュメントは [docs.qorechain.io](https://docs.qorechain.io) で公開されています。

## MetaMask への追加

MetaMask などの EVM ウォレットに QoreChain ネットワークを追加するには、上記の EVM チェーン ID を使用します — メインネットは **9801** と `https://evm.qore.host`、テストネットは **9800** と `https://evm-testnet.qore.host` を指定し、ブロックエクスプローラー URL には `https://explore.qore.network` を設定します。手順の詳細は[ウォレットのセットアップ](/getting-started/wallet-setup)を参照してください。

## 関連ページ

* [メインネットへの接続](/getting-started/connecting-to-mainnet) — 稼働中の `qorechain-vladi` ネットワークに参加します。
* [テストネットへの接続](/getting-started/connecting-to-testnet) — Diana テストネットに参加します。
* [取引所・インテグレーター向けガイド](/developer-guide/exchange-integration) — インテグレーター向けの入金、出金、ノード運用。
* [チェーンパラメーター](/appendix/chain-parameters) — 正規のチェーン設定。
* [SDK 概要](/sdk/overview) — コードからネットワーク設定を解決します。
