---
slug: /build-before-qday/workshop-1/kits
title: QoreChain キット
sidebar_label: キット
sidebar_position: 10
---

# QoreChain キット

QoreChain の開発者スタックは14のキットで構成されています。このページでは、それぞれを1行で紹介し、バージョンと公開場所を示したうえで、これらを使って作れる6つのアイデアで締めくくります。利用できるキットは12個です。出荷されていないものが2つあります。Asset キットは提案段階で、PQ ライトクライアントは仕様のみです。

## 革新的な点 {#innovations}

- **ML-DSA-87 + secp256k1 のハイブリッド署名は、SDK、ウォレット、QoreSign に組み込まれています。** そのため、アプリがポスト量子署名を自分で実装する必要はありません。
- **オンチェーンで検証されたハイブリッド署名トランザクション1件**が、各アプリに共通する証拠です。[Q-Day Counter](/build-before-qday/workshop-1/apps/qday-counter)、[Q-Day Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook)、[Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector)を参照してください。
- **同じ形が多くの言語にあります。** SDK、QoreSign、PQC ライブラリは複数の言語で提供され、共通のテストベクターで検証されています。

## アプリを作る {#build-apps}

| キット | できること | バージョンとレジストリ |
| --- | --- | --- |
| [QoreChain SDK](/sdk/overview) | Native、EVM、SVM の各レーンを1つのクライアントで扱えます。ハイブリッド署名、PQC 鍵の登録、EVM ウィンドウのヘルパー、ステーキング階層、トークノミクス、AMM、クロス VM 呼び出し、ロールアップに対応しています。TypeScript、Python、Rust、Java、Go。 | 0.13.0: npm、PyPI、crates.io、Maven Central、Go |
| [create-qorechain-dapp](/developer-tools/scaffolders-and-cli) | 7つのテンプレート（hardhat、foundry、viem-wagmi、fullstack-web、evm-solidity、cosmwasm、rollup-app）から、動作するプロジェクトを1つのコマンドでスキャフォールドします。 | 0.13.1: npm |
| [RDK（ロールアップ開発キット）](/rollups/overview) | QoreChain で決済されるアプリケーション固有のロールアップを、作成、起動、運用できます。署名付きの決済バッチ、引き出し、データアベイラビリティの読み取りに対応しています。 | `@qorechain/rdk` 0.8.0、5言語 |

```sh
npm i @qorechain/sdk @qorechain/evm
npx create-qorechain-dapp my-app -t hardhat --network testnet
```

## ウォレットと署名 {#wallets-signing}

| キット | できること | バージョンとレジストリ |
| --- | --- | --- |
| [QoreX と qorex-integrations](/developer-tools/qorex-integrations) | 公式ウォレットが両方の鍵を保持し、ハイブリッドで署名し、署名する内容を表示します。インテグレーションを使うと、RainbowKit と wagmi、cosmos-kit、Interchain Kit に QoreX を追加できます。型定義、モックウォレット、Playwright フィクスチャも含まれます。[QoreX の概要](/qorex/overview)も参照してください。 | QoreX 1.2.3（iOS、Android）、拡張機能 0.4.2（Chrome、Firefox）、`@qorechain/qorex-rainbowkit` 0.1.0 |
| [ウォレットアダプター](/developer-tools/wallet-adapter) | 既に使われているウォレット（Keplr、Leap、Cosmostation、MetaMask、Phantom）に QoreChain を追加します。チェーンが要求する ML-DSA-87 ハイブリッド署名にも対応しています。 | `@qorechain/wallet-adapter` 0.5.0 |
| [QoreSign](/qoresign/overview) | QoreX 以外のウォレットやバックエンド向けのハイブリッド署名です。ML-DSA 鍵の導出、両方の鍵による Native レーンのトランザクション署名、ハイブリッド署名のローカル検証、署名前のシミュレーション、Sign In With QoreChain に対応しています。 | 0.2.0: TypeScript、Rust、Go、Swift、Kotlin |
| [QoreChain PQC](/developer-tools/pqc-library) | ほかのすべてを支えるポスト量子のプリミティブです。ML-DSA（FIPS 204）、ML-KEM（FIPS 203）、SHAKE-256 を備え、言語間でバイト互換があり、共通のテストベクターで検証されています。 | `@qorechain/pqc` 0.2.3、6言語 |

```sh
npm i @qorechain/qorex-rainbowkit @qorechain/qorex-types
npm i @qorechain/wallet-adapter
npm i @qorechain/qoresign
npm i @qorechain/pqc
```

## データとプライバシー {#data-privacy}

| キット | できること | バージョンとレジストリ |
| --- | --- | --- |
| [QoreSeal](/developer-tools/qoreseal) | ML-KEM-1024（デフォルトでは X25519 とのハイブリッド）で、QoreChain のアカウント宛てにデータを暗号化します。アカウントが鍵をオンチェーンに公開すれば、誰でもその鍵宛てに暗号化できます。複数の受信者、監査人の鍵、ローテーションするグループ鍵にも対応しています。 | 0.1.0: TypeScript、Rust、Go、Swift、Kotlin、Python |
| [QoreChain MCP](/developer-tools/mcp) | Model Context Protocol のサーバーとコマンドラインツールで、対応する開発者ツールに QoreChain への読み取りアクセスを与えます。ブロック、トランザクション、アカウント、バリデーター、ステーキング階層、ハイブリッド署名のステータス、コントラクトの読み取り、手数料の見積もりが対象です。署名も、鍵の保持も、ブロードキャストも行いません。 | `@qorechain/mcp` 0.1.0 |

```sh
npm i @qorechain/qoreseal
npx -y @qorechain/mcp
```

## インフラとコンプライアンス {#infra-compliance}

| キット | できること | バージョンとレジストリ |
| --- | --- | --- |
| [QORel](/qorel/overview) | Hermes のフォークである IBC リレイヤーで、署名レイヤーを差し替えられます。すべてのトランザクションにポスト量子署名を必要とするチェーンもリレーできます。標準的なチェーンでは、Hermes の形式がそのまま保たれます。 | 0.1.0: GitHub、コンテナイメージ、Homebrew |
| [カストディキット](/developer-tools/custody-kit) | カストディアン向けです。各レーンの要件、アドレス検証、入金検知、出金の署名と検証、ステーキング、ML-DSA-87 鍵の管理を扱い、テストベクターとリファレンスコードが付属します。 | 0.1.0: TypeScript、Python、Go、Rust、Java |
| [QoreScan](/developer-tools/qorescan) | デプロイメントの暗号を棚卸しします（ノード設定、種類別の鍵、TLS エンドポイント、Solidity ソース、チェーン状態）。CycloneDX 1.6 の CBOM を出力し、出力は FINMA ガイダンス 05/2026、EU の PQC ロードマップ、DORA に対応づけられています。棚卸しを補助するもので、認証ではありません。 | `@qorechain/qorescan` 0.1.0 |
| [Asset キット](/developer-tools/asset-kit) | **提案段階で、全体としては出荷されていません。** 規制対象のトークン化資産向けのツールです。ポスト量子のホルダーチェックを備えた ERC-3643 と CMTAT のアダプター、ERC-4626 と ERC-7540 のボールト、発行者コンソール、クライアントが含まれます。EVM コントラクトは利用できますが、ネイティブの資産モジュールは提案段階です。 | 0.1.0 |
| [PQ ライトクライアント](/developer-tools/pq-light-client) | **仕様のみで、出荷されていません。** ML-DSA-87 で署名されたチェックポイントに追従するライトクライアントです。QoreChain は現時点でこれらのチェックポイントを生成していません。リポジトリには、設計をレビューできるように、仕様とリファレンス検証器（Go、Rust、TypeScript）が置かれています。 | 0.1.0（仕様） |

```sh
brew install qorechain/tap/qorel
npx @qorechain/qorescan --help
```

## 作れる6つのアイデア {#ideas}

| アイデア | 使うもの | 内容 |
| --- | --- | --- |
| 量子耐性チェックアウト | SDK、QoreX | ウェブショップ向けの QOR 支払いボタン。すべての支払いがハイブリッド署名されます。 |
| ハッカソンスターター | create-qorechain-dapp | ゼロから、テストネット上のデプロイ済みコントラクトまでを10分で。受講生1人につきコマンド1つです。 |
| Sign In With QoreChain | QoreSign | ウェブアプリ向けのパスワードレスログイン。ハイブリッド署名は自分のサーバーで検証します。 |
| 封印入札オークション | QoreSeal | 公開の時点まで、入札は暗号化されたままです。 |
| PQC 対応状況の棚卸し | QoreScan | フィンテックチームと監査人向けの、暗号の棚卸しと CBOM ファイル。 |
| 自分のチャネルをリレーする | QORel | QoreChain テストネットと、別の Cosmos テストネットチェーンの間でリレーします。 |

## コードを入手する {#get-the-code}

各キットには専用のマニュアルページがあり、上でリンクしています。このワークショップのサンプルアプリは、公開リポジトリ [qorechain/build-before-qday](https://github.com/qorechain/build-before-qday) にあります。各アプリのページが、最初のコマンドから最後のコマンドまで案内します。

```sh
git clone https://github.com/qorechain/build-before-qday
```
