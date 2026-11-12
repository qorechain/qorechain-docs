---
slug: /build-before-qday/workshop-1/kits
title: QoreChain キット
sidebar_label: キット
sidebar_position: 10
---

# QoreChain キット

QoreChain の開発者スタックは14個のキットで構成されています。このページでは、各キットを1行で紹介し、バージョンと公開先を示し、最後にそれらから作れる6つのアイデアを挙げます。12個のキットは利用可能です。2つは未提供で、Asset kit は提案段階、PQ light client は仕様のみです。

## 革新的な点 {#innovations}

- **ハイブリッド ML-DSA-87 + secp256k1 署名は、SDK、ウォレット、QoreSign に組み込まれています**。そのため、アプリが耐量子署名を自前で実装する必要はありません。
- **オンチェーンで検証される、ハイブリッド署名された1つのトランザクション**が、すべてのアプリに共通する証明です。[Q-Day Counter](/build-before-qday/workshop-1/apps/qday-counter)、[Q-Day Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook)、[Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) を参照してください。
- **多くの言語で同じ形。** SDK、QoreSign、PQC ライブラリは複数の言語で提供され、共通のテストベクターで検証されています。

## アプリを構築する {#build-apps}

| キット | 何をするか | バージョンと公開先 |
| --- | --- | --- |
| [QoreChain SDK](/sdk/overview) | Native、EVM、SVM の各レーンに対応する1つのクライアント。ハイブリッド署名、PQC 鍵の登録、EVM ウィンドウのヘルパー、ステーキング階層、トークノミクス、AMM、クロス VM 呼び出し、ロールアップを備えています。TypeScript、Python、Rust、Java、Go に対応。 | 0.13.0: npm、PyPI、crates.io、Maven Central、Go |
| [create-qorechain-dapp](/developer-tools/scaffolders-and-cli) | 7つのテンプレート（hardhat、foundry、viem-wagmi、fullstack-web、evm-solidity、cosmwasm、rollup-app）から、動作するプロジェクトを1つのコマンドでスキャフォールドします。 | 0.13.1: npm |
| [RDK、ロールアップ開発キット](/rollups/overview) | QoreChain 上で決済される、アプリケーション固有のロールアップを作成、起動、運用します。署名付き決済バッチ、引き出し、データアベイラビリティの読み取りに対応。 | `@qorechain/rdk` 0.8.0、5言語 |

```sh
npm i @qorechain/sdk @qorechain/evm
npx create-qorechain-dapp my-app -t hardhat --network testnet
```

## ウォレットと署名 {#wallets-signing}

| キット | 何をするか | バージョンと公開先 |
| --- | --- | --- |
| [QoreX と qorex-integrations](/developer-tools/qorex-integrations) | 公式ウォレットは両方の鍵を保持し、ハイブリッド署名を行い、署名する内容を表示します。インテグレーションは、RainbowKit と wagmi、cosmos-kit、Interchain Kit に QoreX を追加し、型、モックウォレット、Playwright フィクスチャを備えています。[QoreX の概要](/qorex/overview)も参照してください。 | QoreX 1.2.3（iOS、Android）、拡張機能 0.4.2（Chrome、Firefox）、`@qorechain/qorex-rainbowkit` 0.1.0 |
| [Wallet Adapter](/developer-tools/wallet-adapter) | すでに使われているウォレット（Keplr、Leap、Cosmostation、MetaMask、Phantom）に QoreChain を追加します。チェーンが必須とする ML-DSA-87 のハイブリッド署名にも対応しています。 | `@qorechain/wallet-adapter` 0.5.0 |
| [QoreSign](/qoresign/overview) | QoreX 以外のウォレットとバックエンド向けのハイブリッド署名。ML-DSA 鍵の導出、両方の鍵による Native レーンのトランザクション署名、ハイブリッド署名のローカル検証、署名前のシミュレーション、Sign In With QoreChain を提供します。 | 0.2.0: TypeScript、Rust、Go、Swift、Kotlin |
| [QoreChain PQC](/developer-tools/pqc-library) | 他のすべての土台となる耐量子プリミティブ。ML-DSA（FIPS 204）、ML-KEM（FIPS 203）、SHAKE-256 を、言語間でバイト互換に、共通のテストベクターで検証して提供します。 | `@qorechain/pqc` 0.2.3、6言語 |

```sh
npm i @qorechain/qorex-rainbowkit @qorechain/qorex-types
npm i @qorechain/wallet-adapter
npm i @qorechain/qoresign
npm i @qorechain/pqc
```

## データとプライバシー {#data-privacy}

| キット | 何をするか | バージョンと公開先 |
| --- | --- | --- |
| [QoreSeal](/developer-tools/qoreseal) | ML-KEM-1024（既定で X25519 とのハイブリッド）を使って、QoreChain のアカウント宛てにデータを暗号化します。アカウントは自分の鍵をオンチェーンで公開し、誰でもそのアカウント宛てに暗号化できます。複数の受信者、監査人の鍵、ローテーションするグループ鍵に対応。 | 0.1.0: TypeScript、Rust、Go、Swift、Kotlin、Python |
| [QoreChain MCP](/developer-tools/mcp) | Model Context Protocol サーバーとコマンドラインツールで、対応する開発者ツールに QoreChain の読み取りアクセスを与えます。ブロック、トランザクション、アカウント、バリデーター、ステーキング階層、ハイブリッド署名のステータス、コントラクトの読み取り、手数料の見積もりが対象です。署名も、鍵の保持も、ブロードキャストも一切行いません。 | `@qorechain/mcp` 0.1.0 |

```sh
npm i @qorechain/qoreseal
npx -y @qorechain/mcp
```

## インフラとコンプライアンス {#infra-compliance}

| キット | 何をするか | バージョンと公開先 |
| --- | --- | --- |
| [QORel](/qorel/overview) | Hermes のフォークである IBC リレイヤー。署名レイヤーを差し替えられるため、すべてのトランザクションに耐量子署名が必要なチェーンもリレーできます。標準的なチェーンでは、Hermes と全く同じフォーマットのままです。 | 0.1.0: GitHub、コンテナイメージ、Homebrew |
| [Custody kit](/developer-tools/custody-kit) | カストディアン向け。各レーンの要件、アドレスの検証、入金の検知、出金の署名と検証、ステーキング、ML-DSA-87 鍵の管理を扱い、テストベクターとリファレンスコードが付きます。 | 0.1.0: TypeScript、Python、Go、Rust、Java |
| [QoreScan](/developer-tools/qorescan) | デプロイ環境の暗号技術（ノード設定、種類別の鍵、TLS エンドポイント、Solidity ソース、チェーンの状態）を棚卸しし、CycloneDX 1.6 の CBOM を出力します。出力は FINMA ガイダンス 05/2026、EU の PQC ロードマップ、DORA に対応づけられています。棚卸しを補助するもので、認証ではありません。 | `@qorechain/qorescan` 0.1.0 |
| [Asset kit](/developer-tools/asset-kit) | **提案段階で、全体としては未提供です。** 規制対象のトークン化資産向けツール群: 耐量子のホルダーチェック付きの ERC-3643 と CMTAT のアダプター、ERC-4626 と ERC-7540 のボルト、発行者コンソール、クライアント。EVM コントラクトは利用可能で、ネイティブのアセットモジュールは提案段階です。 | 0.1.0 |
| [PQ light client](/developer-tools/pq-light-client) | **仕様のみで、未提供です。** ML-DSA-87 で署名されたチェックポイントを追跡するライトクライアント。QoreChain は現時点でこのチェックポイントを生成していません。リポジトリには、設計をレビューできるように、仕様とリファレンス検証器（Go、Rust、TypeScript）が入っています。 | 0.1.0（仕様） |

```sh
brew install qorechain/tap/qorel
npx @qorechain/qorescan --help
```

## 作れるものの6つのアイデア {#ideas}

| アイデア | 使うキット | 内容 |
| --- | --- | --- |
| 量子安全なチェックアウト | SDK、QoreX | Web ショップ向けの「QOR で支払う」ボタン。すべての支払いがハイブリッド署名されます。 |
| ハッカソンのスターター | create-qorechain-dapp | ゼロからテストネット上のデプロイ済みコントラクトまで10分で到達します。受講生1人につき1つのコマンドです。 |
| Sign In With QoreChain | QoreSign | Web アプリ向けのパスワードレスログイン。ハイブリッド署名をサーバーで検証します。 |
| 封印入札オークション | QoreSeal | 公開されるまで、入札は暗号化されたままです。 |
| PQC 対応状況の棚卸し | QoreScan | フィンテックのチームとその監査人向けの、暗号技術の棚卸しと CBOM ファイル。 |
| 自分のチャネルをリレーする | QORel | QoreChain テストネットと、別の Cosmos テストネットのチェーンの間でリレーします。 |

## コードを入手する {#get-the-code}

各キットには、上にリンクされた独自のマニュアルページがあります。このワークショップのサンプルアプリは、公開リポジトリ [qorechain/build-before-qday](https://github.com/qorechain/build-before-qday) にあり、各アプリのページが、最初のコマンドから最後のコマンドまでを案内します。

```sh
git clone https://github.com/qorechain/build-before-qday
```
