---
slug: /sdk/concepts/architecture
title: アーキテクチャと概念
sidebar_label: アーキテクチャ
sidebar_position: 1
---

# アーキテクチャと概念

QoreChain は、3 つのスマートコントラクト仮想マシンを並行して実行する単一のレイヤー 1 チェーンであり、アカウントとトークンを共有します。

## トリプル VM モデル

| VM | コントラクト | SDK でのクライアント面 |
| --- | --- | --- |
| **CosmWasm** | Rust/Wasm コントラクト | `@qorechain/sdk` の `client.cosmwasm()` および `queryContractSmart` / `execute` ヘルパー |
| **QoreChain EVM Engine** | Solidity / Vyper | `@qorechain/evm`（viem アダプター） |
| **SVM** | Solana プログラム | `@qorechain/svm`（`@solana/web3.js` アダプター） |

ネイティブ（Cosmos）レイヤーは、銀行送金、ステーキング、ガバナンス、そしてランタイム間でメッセージをルーティングする `x/crossvm` モジュールを処理します。

## 読み取り面

SDK は、いくつかのエンドポイントを通じてノードと通信します。

- **Cosmos REST (LCD)** — 銀行残高、アカウント情報、モジュールクエリ。
- **コンセンサス RPC** — ネイティブトランザクションの署名/ブロードキャスト、および CosmWasm 読み取りクライアントに使用されます。
- **EVM JSON-RPC** — 標準の `eth_*` 呼び出しに加え、QoreChain の `qor_*` 名前空間と EVM プリコンパイル。
- **SVM JSON-RPC** — SVM ランタイム向けの Solana 互換 RPC。

`qor_*` JSON-RPC 名前空間は、トークノミクス、PQC 鍵ステータス、ハイブリッド署名モード、クロス VM メッセージ、ネットワーク統計など、QoreChain 固有の読み取りを公開します。TypeScript では、これらは `client.qor`（`QorClient`）上の型付きメソッドです。同じ面が Python、Go、Rust の SDK にも存在します。

## トークンと通貨単位

- 表示トークン: **QOR**。
- 基本通貨単位: **uqor**、QOR あたり **10^6** 基本単位。

金額の計算は常に基本単位で行ってください。SDK は正確な変換を提供するため、浮動小数点で精度を失うことはありません。

```ts
import { toBase, fromBase } from "@qorechain/sdk";

toBase("1.5");        // "1500000"  (QOR -> uqor)
fromBase("1500000");  // "1.5"      (uqor -> QOR)
```

> 注: EVM ランタイムは QOR を 18 桁の小数で表現します（EVM の慣習）。これは Cosmos の `uqor` の 10^6 の基数とは異なります。`@qorechain/evm` クライアントは表示にデフォルトで 18 桁の小数を使用します。対象のネットワークの値を確認してください。

## アドレス

同じ鍵素材は、3 つのアドレス形式で表現できます。

- **native** — `qor` プレフィックスを持つ bech32（`qor1…`）、バリデーターは `qorvaloper` を使用します。
- **EVM** — `0x…`、EIP-55 チェックサム付き。
- **SVM** — ed25519 公開鍵の base58。

導出パスについては [アカウントと PQC 署名](/sdk/concepts/accounts-pqc) を参照してください。

## クロス VM

QoreChain の `x/crossvm` モジュールは、ある VM 上のコントラクトが別の VM 上のアクションをトリガーできるようにします。EVM→native のパスは、**クロス VM ブリッジプリコンパイル**（`@qorechain/evm`）を通じてオンチェーンで実行され、SDK は型付きの REST 読み取りヘルパー
（`getCrossVmMessage`、`getPendingCrossVmMessages`、`getCrossVmParams`）に加え、メッセージの状態を追跡する `client.qor.getCrossVMMessage(...)` を提供します。[クロス VM ガイド](/sdk/guides/cross-vm) を参照してください。
