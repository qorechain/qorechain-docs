---
slug: /build-before-qday/workshop-1
title: "ワークショップ1: 最初のハイブリッド署名トランザクション"
sidebar_label: "ワークショップ1"
sidebar_position: 2
date: 2026-11-12
---

# ワークショップ1: 最初のハイブリッド署名トランザクション

このガイドでは、何もインストールされていないコンピューターから出発して、2つの鍵で同時に署名し、QoreChain テストネットに検証されるトランザクションを1つ作るところまで進みます。すべて自分の環境で、使い捨てのテストネットアカウントを使って実行します。

## 作るもの {#what-we-built}

1つのコマンドでスキャフォールドした完全な Solidity プロジェクトを、テストし、QoreChain テストネットにデプロイし、そのうえで**2つの鍵で同時に署名**したトランザクションを1つ送って、チェーンに検証させます。

このワークショップで確認できること:

- **ハイブリッド署名。** トランザクションには、従来型の secp256k1 署名と、ポスト量子の ML-DSA-87 署名（NIST FIPS 204）の両方が含まれます。
- **オンチェーンで検証された、ハイブリッド署名トランザクション1件。** バリデーターが両方の署名を検証します。その証拠は、公開 REST エンドポイント（`PQCHybridSignature` 拡張と `pqc_hybrid_verify` イベント）とエクスプローラーから読み取れます。
- **EVM 認可ウィンドウ。** Ethereum のトランザクションにはポスト量子署名を載せられません。そのため QoreChain では、ML-DSA-87 鍵を1回だけ登録し、ハイブリッド署名したメッセージで短いウィンドウを開きます。そのウィンドウの間は、通常の EVM トランザクションが受け付けられます。考え方の詳細は[5分でデプロイ](/getting-started/deploy-in-5-minutes)を参照してください。

これは、Quantum Pass レベルが求める内容そのものです。

## 前提条件 {#prerequisites}

macOS、Linux、または Windows（WSL）のコンピューターと、ターミナル、ウェブブラウザーが必要です。先に次のツールをインストールし、それぞれのバージョンを確認してください。

| ツール | バージョン | 確認 | インストール |
| --- | --- | --- | --- |
| Node.js | 22 以降（Hardhat 3 が必要とします） | `node -v` | [nodejs.org](https://nodejs.org) |
| pnpm | 9 以降 | `pnpm -v` | `npm install -g pnpm`（または `corepack enable`） |
| curl | 任意 | `curl --version` | macOS と Linux に付属 |
| jq（任意） | 任意 | `jq --version` | [jqlang.org](https://jqlang.org)。ステップ6で出力を絞り込むときだけ使います |

フォーセットを使うには、QoreChain ダッシュボードのアカウントも必要です（ステップ4）。

このガイドで使うネットワークと公開エンドポイントは次のとおりです。

| サービス | URL |
| --- | --- |
| テストネット | `qorechain-diana`、EVM チェーン ID 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` |
| エクスプローラー | `https://explore.qore.network`（Testnet に切り替えます） |
| フォーセット | `https://dashboard.qorechain.io/faucet`（サインインが必要です） |

:::caution 使い捨てのテストネット鍵のみ
この演習のために作った、テスト用 QOR しか持たない鍵だけを使ってください。実際の資金を持つアカウントの鍵やリカバリーコードを `.env` に入れてはいけません。また、`.env` を git にコミットしないでください。
:::

## 手順 {#steps}

### ステップ1: ツールを確認する {#step-1}

1. ターミナルを開きます。
2. 上の表のチェックを実行します。

```bash
node -v
pnpm -v
```

`node -v` は `v22` 以上を表示する必要があります。そうでない場合は、先に進む前に新しい Node.js をインストールしてください。

### ステップ2: プロジェクトをスキャフォールドしてテストを実行する {#step-2}

1. 新しいフォルダーにプロジェクトを作成します。`npx` コマンドはスキャフォルダーをダウンロードするため、インターネット接続が必要です。

```bash
npx create-qorechain-dapp@latest qday-demo -t hardhat --network testnet --package-manager pnpm
```

2. フォルダーに移動して、テストを実行します。テストはローカルのシミュレートされたチェーン上で動き、何も送信しません。

```bash
cd qday-demo
pnpm test
```

`Done! Created qday-demo` と表示され、続いてテストの結果として `2 passing` と表示されるはずです。

3. 生成されたものを確認します。`contracts/Counter.sol`、`ignition/modules/Counter.ts`、`scripts/window.ts`（認可ウィンドウ用のヘルパー）、そして `qorechainTestnet` ネットワーク（チェーン ID 9800）を含む `hardhat.config.ts` です。テンプレートの詳細は[スキャフォルダーと CLI](/developer-tools/scaffolders-and-cli)と[チェーン開発者キット](/developer-tools/chain-dev-sdk)を参照してください。

### ステップ3: 使い捨てのテストネットアカウントを作る {#step-3}

アカウントには2つの秘密情報が必要です。Ethereum 形式の秘密鍵と、ポスト量子の ML-DSA-87 鍵の導出元となる**リカバリーコード**（`QRC1` で始まります）です。次のコマンドは、プロジェクトにインストール済みのライブラリで両方を生成し、新しい `.env` ファイルに直接書き込みます。そのため、画面に表示されることも、どこかに貼り付けることもありません。`qday-demo` フォルダーの中で実行してください。

```bash
node --input-type=module -e '
import { generatePrivateKey } from "viem/accounts";
import { generatePqcRecoveryCode } from "@qorechain/sdk";
import { writeFileSync } from "node:fs";
writeFileSync(".env", `PRIVATE_KEY=${generatePrivateKey()}\nQORE_PQC_RECOVERY_CODE=${generatePqcRecoveryCode()}\nQORE_NETWORK=testnet\n`);
console.log(".env written");
'
```

`.env written` と表示されます。補足です。

- このコマンドは、スキャフォルダーが作ったプレースホルダーの `.env` を置き換えます。実行は1回だけにしてください。もう一度実行すると、別のアカウントと別のポスト量子鍵ができます。
- `.env` はそのまま保管してください。同じ秘密鍵と同じリカバリーコードがあれば、毎回同じアカウントになります。ファイルを失った場合は、新しいアカウントで最初からやり直します。
- ニーモニックを使いたい場合は、上の2行の代わりに `.env` に `QORE_MNEMONIC="your twelve words"` を入れてください。ニーモニックなら、2つの鍵が同じフレーズから作られ、リカバリーコードは不要です。この演習のためだけに作ったフレーズを使ってください。

次に、新しいアカウントのアドレスをプロジェクトに尋ねます。

```bash
pnpm window status
```

3行が表示されるはずです。

```text
account:  0x...  (qor1...)
PQC key:  not registered (run: pnpm window register)
window:   none (run: pnpm window open)
```

`qor1...` のアドレスをコピーしてください。これがフォーセットに渡すアドレスです。

### ステップ4: フォーセットでテストネット QOR を受け取る {#step-4}

1. ブラウザーで[フォーセット](https://dashboard.qorechain.io/faucet)を開き、サインインします。
2. `qor1...` のアドレスを貼り付けます（ダッシュボードがアドレスを把握している場合は **Use my address** を選びます）。
3. **Request Tokens** を選びます。カードに **Tokens Sent!** と、100 QOR とフェスト用のテストトークン、そして **View on Explorer** のリンクが表示されます。

フォーセットの配布は、アカウントごと、アドレスごとに24時間に1回です。正確な金額は[フォーセット](/dashboard/faucet)にあります。ターミナルに戻り、アカウントがチェーン上に存在することを確認します。

```bash
pnpm window status
```

今度は、「does not exist on chain yet」で失敗せずに、結果が返ってきます。

### ステップ5: 鍵を登録し、ウィンドウを開いて、デプロイする {#step-5}

1. ML-DSA-87 鍵を登録します。これはアカウントごとに1回だけの手順で、登録にはチェーンの要件どおり、従来型の鍵で署名します。

```bash
pnpm window register
```

`registered: <HASH>` と表示されます。

2. 認可ウィンドウを開きます。これ自体が**ハイブリッド署名**のトランザクションです。

```bash
pnpm window open
```

`opened: <HASH>` と表示され、続いて `window: 600 blocks, 5 txs, 3750000 uqor (value plus fees)` のような行が表示されます。`opened:` のハッシュを控えておいてください。ステップ6で検証に使います。

3. 約10秒待ちます。ウィンドウを開いたことでアカウントの nonce が進んでおり、Hardhat は確認を待ちます。
4. コントラクトをビルドしてデプロイします。

```bash
pnpm build
pnpm deploy:testnet
```

「Confirm deploy to network qorechainTestnet (9800)?」には `y` と答えます。`CounterModule#Counter - 0x...` と表示されるはずです。

### ステップ6: オンチェーンでハイブリッド署名を検証する {#step-6}

ステップ5の `opened:` トランザクションは、両方の鍵で署名されています。`<HASH>` をそのハッシュに置き換えて、公開 REST エンドポイントから読み取ります。

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

次の点を確認します。

1. `tx_response.code` が `0` であること。
2. トランザクション本体に、ML-DSA-87 署名を持つ `PQCHybridSignature` 拡張があること。サイズは **4,627 バイト**で、64 バイトの secp256k1 署名と並んでいます。
3. `tx_response.events` に、属性 `status` が `verified` の `pqc_hybrid_verify` イベントがあること。このイベントだけを表示するには次のようにします（`jq` が必要です）。

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> \
  | jq '.tx_response.events[] | select(.type=="pqc_hybrid_verify")'
```

続いて、エクスプローラーで確認します。

1. [explore.qore.network](https://explore.qore.network) を開きます。
2. ネットワークセレクターを **Testnet** に切り替えます。
3. ハッシュを検索します。トランザクションのページには、署名のセキュリティが、量子耐性ありでオンチェーン検証済み、アルゴリズムは ML-DSA-87（FIPS 204）と表示されます。

これが証拠です。バリデーターが両方の署名を確認しました。

## 何が表示されるか {#what-you-should-see}

| 場所 | 内容 |
| --- | --- |
| ステップ2のあと | `Done! Created qday-demo` と `2 passing` |
| ステップ3のあと | `.env written`、続いて `0x...` と `qor1...` の両アドレスを含む `account:` 行 |
| ステップ4のあと | フォーセットの **Tokens Sent!** と、`pnpm window status` で存在が確認できるアカウント |
| ステップ5のあと | `registered: <HASH>`、`opened: <HASH>`、続いて `CounterModule#Counter - 0x...` |
| ステップ6のあと | REST の出力と、Testnet のエクスプローラーの両方で、`code` が 0、4,627 バイトの ML-DSA-87 署名、そして `status` が `verified` の `pqc_hybrid_verify` |

## 使用したパッケージ {#published}

スキャフォールドされた `package.json` に宣言されているものです。

| パッケージ | レジストリ | バージョン |
| --- | --- | --- |
| `create-qorechain-dapp` | npm | 0.14.0 |
| `@qorechain/sdk` | npm | ^0.14.0 |
| `@qorechain/evm` | npm | ^0.14.0 |
| `@cosmjs/stargate` | npm | ^0.39.0 |
| `hardhat` | npm | ^3.21.1 |
| `viem` | npm | ^2.47.6 |
| `tsx` | npm | ^4.19.0 |
| `typescript` | npm | ^5.6.3 |

スキャフォルダーは、生成された `package.json` に記載されている Hardhat toolbox、Ignition、keystore の各プラグインもインストールします。

## トラブルシューティング {#troubleshooting}

| 表示される内容 | 原因 | 対処 |
| --- | --- | --- |
| ウィンドウを開いた直後の `HHE10402` または「wait for confirmations」 | ウィンドウを開いたことでアカウントの nonce が進んだ | `pnpm deploy:testnet` をもう一度実行する |
| 「EVM authorisation window exhausted」または「no window」 | ウィンドウのトランザクション数かブロック数を使い切った、または別のコントラクトにスコープされている（別のコントラクトにスコープされたウィンドウは、デプロイをブロックします） | `pnpm window open` で新しいウィンドウを開き、約10秒待ってから、もう一度デプロイする |
| 「account has no PQC key and classical fallback is disabled」 | アカウントが ML-DSA-87 鍵を登録していない | 先に `pnpm window register` を実行し、そのあとウィンドウを開く |
| 「does not exist on chain yet」 | アカウントにまだ QOR がない | フォーセットで QOR を受け取る（ステップ4） |
| フォーセットで「Rate Limit Reached」と表示される、または30秒たってもトークンが届かない | 受け取りはアカウントごと、アドレスごとに24時間に1回で、リクエストは1件ずつ処理される | 数秒待ってから再試行するか、クールダウンが終わるまで待つ |
| `pnpm window` がリカバリーコードの不足を示すメッセージで止まる | `.env` に `PRIVATE_KEY` はあるが `QORE_PQC_RECOVERY_CODE` がない | ステップ3をやり直すか、`QORE_MNEMONIC` を使う |
| Hardhat が起動しない | Node.js が 22 より古い | Node.js 22 以降をインストールして、`pnpm install` をもう一度実行する |

## サンプルアプリ {#example-apps}

同じ流れを、複数の言語とフロントエンドで試せます。どのアプリもハイブリッドで署名します。すべて、公開リポジトリ [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday) の `workshop-1` フォルダーにあります。次のコマンドで取得します。

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1
```

各アプリのページは、それぞれ最初から最後まで通した独立したガイドです。

| アプリ | 言語 | ページ |
| --- | --- | --- |
| Q-Day Counter | TypeScript、Solidity | [qday-counter](/build-before-qday/workshop-1/apps/qday-counter) |
| Q-Day Guestbook | TypeScript、Solidity | [qday-guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) |
| Hybrid Inspector | TypeScript | [hybrid-inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) |
| Q-Day Pay | Rust | [rust-qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) |
| Q-Day Tip Jar | Java | [java-tipjar](/build-before-qday/workshop-1/apps/java-tipjar) |
| Q-Day Airdrop | Python | [python-airdrop](/build-before-qday/workshop-1/apps/python-airdrop) |

これらのアプリの土台になっているキットは、[キット](/build-before-qday/workshop-1/kits)に一覧があります。QoreX ウォレットをブラウザー dApp で使うには、[QoreX](/qorex/overview)を参照してください。
