---
slug: /appendix/networks
title: ネットワーク
sidebar_label: ネットワーク
sidebar_position: 4
---

# ネットワーク

QoreChainネットワークの統合リファレンスです。チェーンID、EVMチェーンID、トークンの単位、アドレスプレフィックス、パブリックエンドポイント、標準サービスポートをまとめています。

## ネットワーク概要

| | メインネット | テストネット |
|---|---|---|
| **ステータス** | 稼働中 | アクティブなテストネット |
| **Cosmosチェーン ID** | `qorechain-vladi` | `qorechain-diana` |
| **EVMチェーン ID (EIP-155)** | **9801**（16進数 `0x2649`） | **9800**（16進数 `0x2648`） |
| **稼働開始** | 2026年6月7日 23:59 UTC | — |
| **チェーンバージョン** | v3.1.95 | v3.1.95 |
| **フレームワーク** | Cosmos SDK v0.53 | Cosmos SDK v0.53 |
| **最小ガス価格** | `0.1uqor` | `0.1uqor` |
| **接続ガイド** | [メインネットへの接続](/getting-started/connecting-to-mainnet) | [テストネットへの接続](/getting-started/connecting-to-testnet) |

## パブリックエンドポイント {#public-endpoints}

すべてのパブリックエンドポイントはHTTPS経由で提供されます。

| サービス | メインネット | テストネット |
|---|---|---|
| コンセンサスRPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| コンセンサスWebSocket | `wss://rpc.qore.host/websocket` | `wss://rpc-testnet.qore.host/websocket` |
| Cosmos REST（LCD） | `https://api.qore.host` | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| EVM WebSocket | — | `wss://evm-ws-testnet.qore.host` |
| SVM JSON-RPC（Solana互換、読み取り専用） | `https://svm.qore.host` | `https://svm-testnet.qore.host` |
| ブロックエクスプローラー | [explore.qore.network](https://explore.qore.network) | [explore.qore.network](https://explore.qore.network)（テストネットに切り替え） |
| ダウンロード（バイナリ／genesis／スナップショット） | [download.qore.host](https://download.qore.host) | — |

:::note
パブリックSVMエンドポイントは**読み取り専用**です（トランザクション送信はエッジで無効化されています）。SVMへの書き込みが必要な場合は自分自身のノードを運用してください。負荷の高い用途や本番ワークロードについても、自分自身のノードの運用を推奨します。詳細は[ノードの運用](/developer-guide/running-a-node)を参照してください。
:::

:::caution SVM取引レーンは現在無効です
パブリックエンドポイントが読み取り専用であることに加えて、SVM実行レーンは**現在、トランザクション送信についてネットワーク全体で無効化されています**（チェーンバージョンv3.1.89、8月22日以降）。これは自分自身のノード経由での送信も含み、パブリックの`svm.qore.host` / `svm-testnet.qore.host`エンドポイントに限った話ではありません。詳細は[SVM開発](/developer-guide/svm-development)を参照してください。レーンが再開されるまではCosmosまたはEVMインターフェースを使用してください。
:::

## トークンとアドレス

| 項目 | 値 |
|---|---|
| **表示単位** | QOR |
| **基本単位** | uqor（1 QOR = 10⁶ uqor） |
| **インターフェースごとの小数点桁数** | Cosmos **6**桁（`uqor`）・EVM **18**桁（wei形式、1 uqor = 10¹² wei）・SVM **9**桁（lamports、1 uqor = 1,000 lamports） |
| **HDコインタイプ（BIP-44）** | `118` |
| **Bech32アカウントプレフィックス** | `qor`（例: `qor1...`） |
| **Bech32バリデータープレフィックス** | `qorvaloper`（例: `qorvaloper1...`） |

3つのインターフェースは**単一の統合されたネイティブQOR残高**を公開します。同じ鍵が、`qor1...`（Cosmos）、`0x...`（EVM）、base58（SVM）というそれぞれのアドレス形式のもとで同じ資金を制御します。

## 標準ポート

以下は、自分自身で運用するQoreChainノードが公開する標準サービスポートです。

| サービス | ポート |
|---|---|
| Cosmos RPC | 26657 |
| P2P | 26656 |
| REST / API | 1317 |
| gRPC | 9090 |
| EVM JSON-RPC | 8545 |
| EVM JSON-RPC（WebSocket） | 8546 |
| SVM（Solana互換）JSON-RPC | 8899 |
| Prometheusメトリクス | 26660 |

## エンドポイントとアクセス

- ノード接続、ピア、genesis、スナップショットについては、[メインネットへの接続](/getting-started/connecting-to-mainnet)または[テストネットへの接続](/getting-started/connecting-to-testnet)を参照してください。
- アプリケーションからのプログラムによるアクセスには、ネットワーク設定を自動的に解決してくれる[QoreChain SDK](/sdk/overview)を使用してください。
- パブリックの**ブロックエクスプローラー**は[explore.qore.network](https://explore.qore.network)にあります。[dashboard.qorechain.io](https://dashboard.qorechain.io)のダッシュボードには独自のエクスプローラービューが含まれており、テストネットの**Faucet**もそこから利用できます（[ダッシュボードのFaucet](/dashboard/faucet)を参照）。
- 本ドキュメントは[docs.qorechain.io](https://docs.qorechain.io)で公開されています。

## MetaMaskへの追加

MetaMaskなどのEVMウォレットにQoreChainネットワークを追加するには、上記のEVMチェーンIDを使用します。メインネットは**9801**と`https://evm.qore.host`、テストネットは**9800**と`https://evm-testnet.qore.host`を組み合わせ、ブロックエクスプローラーURLには`https://explore.qore.network`を指定します。手順の詳細は[ウォレットの設定](/getting-started/wallet-setup)を参照してください。

## 関連ページ

* [メインネットへの接続](/getting-started/connecting-to-mainnet) — 稼働中の`qorechain-vladi`ネットワークに参加する。
* [テストネットへの接続](/getting-started/connecting-to-testnet) — Dianaテストネットに参加する。
* [取引所・インテグレーターガイド](/developer-guide/exchange-integration) — インテグレーター向けの入出金とノード運用について。
* [チェーンパラメーター](/appendix/chain-parameters) — 正規のチェーン設定。
* [SDK概要](/sdk/overview) — コードからネットワーク設定を解決する。
