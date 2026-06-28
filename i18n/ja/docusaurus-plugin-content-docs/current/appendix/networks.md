---
slug: /appendix/networks
title: ネットワーク
sidebar_label: ネットワーク
sidebar_position: 4
---

# ネットワーク

QoreChain ネットワークの統合リファレンス — チェーン識別子、EVM チェーン ID、トークンデノミネーション、アドレスプレフィックス、標準サービスポートです。完全なノード接続の詳細（パブリックエンドポイント、シード、ジェネシス）については、以下にリンクされている接続ガイドに従ってください。オペレーターは現在のパブリックエンドポイント、シード、ジェネシスを公式リリースから取得します。

## ネットワーク一覧

| | メインネット | テストネット |
|---|---|---|
| **ステータス** | 稼働中 | アクティブなテストネット |
| **Cosmos チェーン ID** | `qorechain-vladi` | `qorechain-diana` |
| **EVM チェーン ID (EIP-155)** | **9801**（16 進数 `0x2649`） | **9800**（16 進数 `0x2648`） |
| **稼働開始** | 2026 年 6 月 7 日 23:59 UTC | — |
| **チェーンバージョン** | v3.1.80 | v3.1.80 |
| **フレームワーク** | Cosmos SDK v0.53 | Cosmos SDK v0.53 |
| **接続ガイド** | [メインネットへの接続](/getting-started/connecting-to-mainnet) | [テストネットへの接続](/getting-started/connecting-to-testnet) |

## トークンとアドレス

| 項目 | 値 |
|---|---|
| **表示デノム** | QOR |
| **基本デノム** | uqor（1 QOR = 10⁶ uqor） |
| **Bech32 アカウントプレフィックス** | `qor`（例: `qor1...`） |
| **Bech32 バリデータプレフィックス** | `qorvaloper`（例: `qorvaloper1...`） |

## 標準ポート

これらは QoreChain ノードが公開する標準サービスポートです。実際のパブリックエンドポイントのホスト名は公式リリースで公開されます — 上記の接続ガイドを参照してください。

| サービス | ポート |
|---|---|
| Cosmos RPC | 26657 |
| P2P | 26656 |
| REST / API | 1317 |
| gRPC | 9090 |
| EVM JSON-RPC | 8545 |
| EVM JSON-RPC (WebSocket) | 8546 |
| SVM (Solana 互換) JSON-RPC | 8899 |
| Prometheus メトリクス | 26660 |

## エンドポイントとアクセス

QoreChain はこのリファレンスで固定のパブリック RPC/REST/EVM ホスト名を公開していません。代わりに:

- ノード接続、シード、ジェネシスについては、[メインネットへの接続](/getting-started/connecting-to-mainnet) または [テストネットへの接続](/getting-started/connecting-to-testnet) に従ってください。オペレーターは現在のパブリックエンドポイント、シード、ジェネシスを公式リリースから取得します。
- アプリケーションからのプログラムによるアクセスには、ネットワーク構成を解決してくれる [QoreChain SDK](/sdk/overview) を使用してください。
- オンチェーンの **エクスプローラー** は [dashboard.qorechain.io](https://dashboard.qorechain.io) のダッシュボードから利用でき、テストネットの **フォーセット** もそこから到達できます（[ダッシュボードフォーセット](/dashboard/faucet) を参照）。
- これらのドキュメントは [docs.qorechain.io](https://docs.qorechain.io) で公開されています。

## MetaMask への追加

MetaMask などの EVM ウォレットに QoreChain ネットワークを追加するには、上記の EVM チェーン ID — メインネットには **9801**、テストネットには **9800** — を、接続先ネットワークの EVM JSON-RPC エンドポイントとともに使用します。手順ごとの詳細な説明については [ウォレットのセットアップ](/getting-started/wallet-setup) を参照してください。

## 関連項目

* [メインネットへの接続](/getting-started/connecting-to-mainnet) — 稼働中の `qorechain-vladi` ネットワークに参加する。
* [テストネットへの接続](/getting-started/connecting-to-testnet) — Diana テストネットに参加する。
* [チェーンパラメータ](/appendix/chain-parameters) — 正規のチェーン構成。
* [SDK 概要](/sdk/overview) — コードからネットワーク構成を解決する。
