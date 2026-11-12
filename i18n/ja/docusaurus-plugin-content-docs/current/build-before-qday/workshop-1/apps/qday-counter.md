---
slug: /build-before-qday/workshop-1/apps/qday-counter
title: Q-Day Counter
sidebar_label: Q-Day Counter
sidebar_position: 1
---

# Q-Day Counter

Q-Day Counter は、QoreChain EVM プロジェクトとして最小限ながら実用的なものです。1つの数値を保存する Solidity コントラクトと、それをテストネット `qorechain-diana` にデプロイする Hardhat プロジェクト、そして数値を読み取って増やす短いスクリプトで構成されています。`create-qorechain-dapp` の `hardhat` テンプレートに、小さな `interact` スクリプトを加えたものです。

## 確認できること {#shows}

- **ハイブリッド署名がデプロイの流れに組み込まれています。** コントラクトのデプロイを含むあらゆる EVM トランザクションの前に、アカウントには登録済みの ML-DSA-87 鍵と、有効な EVM 認可ウィンドウが必要です。ウィンドウは、secp256k1 と ML-DSA-87 の両方で署名（ハイブリッド）した Native レーンのメッセージ1件で開き、チェーンが両方の署名を検証します。
- **オンチェーンで検証された、ハイブリッド署名トランザクション1件。** `pnpm window open` のステップが、そのトランザクションを送信します。エクスプローラーで検索すると、チェーン自身の判定を確認できます。
- **普段の EVM ツールがそのまま使えます。** Hardhat、Ignition、viem は通常の Ethereum トランザクションを送ります。ポスト量子の保護はウィンドウの側にあるため、盗まれた secp256k1 鍵だけでは、アカウントから資金を動かせません。

secp256k1 を破れるほど大きな量子コンピューターがあれば、攻撃者は従来型の署名を偽造できてしまいます。QoreChain は、アカウントに対して2つ目のポスト量子署名（ML-DSA-87、FIPS 204）を必須にしています。Counter は、このルールを有効にした状態での開発の流れ全体を示します。鍵を登録し、ウィンドウを開き、デプロイし、呼び出し、読み取ります。

## 始める前に {#prerequisites}

macOS、Linux、または WSL か Git Bash を使う Windows のターミナルと、次のツールが必要です。

| ツール | 必要なバージョン | 確認コマンド |
| --- | --- | --- |
| Git | 比較的新しいバージョンなら何でも | `git --version` |
| Node.js | 20.12 以降（22 LTS を推奨） | `node --version` |
| pnpm | 9 以降 | `pnpm --version` |

Node.js は https://nodejs.org からインストールします。`pnpm --version` が失敗する場合は、`npm install -g pnpm`（または `corepack enable`）で pnpm をインストールして、もう一度確認してください。

フォーセットを使うには、[QoreChain ダッシュボード](https://dashboard.qorechain.io)の無料アカウントも必要です。このガイドでは実際のウォレットは一切使いません。以下はすべて使い捨てのテストネットアカウントを使い、テストネットの QOR に価値はありません。

## ステップバイステップ {#steps}

### 1. コードを取得する {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/01-qday-counter
```

### 2. 依存関係をインストールする {#step-install}

```sh
pnpm install
```

### 3. テストとビルドを実行する {#step-test}

テストはローカルのシミュレートされたチェーン上で動きます。鍵もネットワーク上のアカウントも必要ありません。

```sh
pnpm test
pnpm build
```

`Counter` のテストについて、`2 passing` と表示されるはずです。

### 4. テストネット用の鍵ファイルを作る {#step-account}

テンプレートから設定ファイルを作成します。

```sh
cp .env.example .env
```

`.env` ファイルには使い捨ての鍵が入ります。コミットしないでください。また、その鍵を本物の用途に流用しないでください。`.env` を好きなエディターで開きます。2つの値を入力します。

**a. 使い捨ての秘密鍵。** ランダムな 32 バイトの鍵を生成します。

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

表示された `0x...` の値を `.env` に `PRIVATE_KEY=0x...` としてコピーし、ゼロだけのプレースホルダーを置き換えます。

**b. ポスト量子のリカバリーコード。** アカウントの ML-DSA-87 鍵は、別のリカバリーコードから導出されます。1つ作成します。

```sh
pnpm window recovery-code
```

表示された `QRC1-...` の行を、`.env` に `QORE_PQC_RECOVERY_CODE=QRC1-...` としてコピーします。このコードは秘密鍵と一緒に保管し、常に同じものを使い続けてください。新しいコードにすると、アカウントの ML-DSA-87 鍵が別のものになります。

`QORE_MNEMONIC` は空のままにし、`QORE_NETWORK=testnet` は維持します。`.env` は次のようになります（プレースホルダーで示しています）。

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

### 5. アカウントのアドレスを表示する {#step-address}

```sh
pnpm window status
```

1行目に、アカウントが `0x...` と `qor1...` の形式で表示されます。この時点では、鍵が未登録であること、ウィンドウが存在しないことも表示されます。`qor1...` のアドレスをコピーしてください。

### 6. フォーセットでテストネット QOR を受け取る {#step-faucet}

1. https://dashboard.qorechain.io/faucet を開いてサインインします。
2. `qor1...` のアドレスを貼り付けて、QOR をリクエストします（24時間に1回、100 QOR）。
3. 数秒待ってから、もう一度 `pnpm window status` を実行します。アカウントがチェーン上に存在するようになります。

### 7. 鍵を登録してウィンドウを開く {#step-window}

```sh
pnpm window register    # once: registers your ML-DSA-87 key
pnpm window open        # hybrid-signed: opens a window (600 blocks, 5 transactions)
sleep 10                # opening the window advances the account's nonce
pnpm window status      # PQC key: registered, window: live
```

登録は、チェーンが従来型の署名で受け付ける唯一のメッセージです。チェーン上にはまだ照合先の鍵がないためです。ウィンドウを開くときの署名は、ハイブリッドです。`window open` が表示するトランザクションハッシュを控えておいてください。最後のステップで検索します。

### 8. コントラクトをデプロイする {#step-deploy}

```sh
pnpm deploy:testnet     # Hardhat Ignition, answer y when asked to confirm
```

このコマンドは、デプロイされた `Counter` のアドレス（`0x...`）を表示します。

### 9. 読み取って、増やす {#step-interact}

```sh
pnpm interact           # read count, increment(), read again, explorer link
pnpm interact --read    # read only
```

### 10. エクスプローラーで検索する {#step-explorer}

1. https://explore.qore.network を開き、ネットワークセレクターを **Testnet** に切り替えます。
2. `pnpm window open` が表示したハッシュを検索します。トランザクションには、チェーンが検証したポスト量子署名が表示されます。
3. `pnpm interact` が表示した `increment` トランザクションのハッシュ、またはステップ8の `Counter` のアドレスを検索すると、コントラクト呼び出しが確認できます。

[Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) では、同じ種類の証拠をバイト単位で見ることができます。

## 何が表示されるか {#result}

- `pnpm test` が `2 passing` を表示します。
- `pnpm window status` が、アカウント（`0x...` と、その `qor1...` 形式）、`PQC key: registered`、そして残りのブロック数、トランザクション数、金額とともに `window: live` を表示します。
- `pnpm deploy:testnet` が、デプロイされた `Counter` のアドレス（`0x...`）を表示します。
- `pnpm interact` が、Counter のアドレス、`count`、`increment` のトランザクションハッシュ、ブロック番号付きの `status: success`、新しい `count`、そしてエクスプローラー上のトランザクションへのリンクを表示します。
- エクスプローラー（Testnet）上で、`window open` のトランザクションに、両方の署名で検証済みであることを示すマークが付きます。

ステップのどれかが失敗したら、まず `pnpm window status` を実行してください。鍵とウィンドウのどちらが足りないかがわかります。ウィンドウを使い切ったあとにトランザクションが拒否された場合は、`pnpm window open` で新しいウィンドウを開きます。

## コード {#code}

コントラクト（`contracts/Counter.sol`）です。

```solidity
contract Counter {
    uint256 public count;
    event CountChanged(uint256 newCount);

    constructor(uint256 initial) {
        count = initial;
        emit CountChanged(initial);
    }

    function increment() external {
        count += 1;
        emit CountChanged(count);
    }

    function set(uint256 value) external {
        count = value;
        emit CountChanged(value);
    }
}
```

`scripts/window.ts` のうち、ハイブリッド署名にあたる部分（ウィンドウのメッセージと署名者）です。

```ts
import { EthNativeSigner, openEvmWindowMsg } from "@qorechain/sdk";
import { evmWindowCost } from "@qorechain/evm";

// 3,000,000 gas at a 250 gwei fee cap, for a few deploys
const perTx = evmWindowCost({ gas: 3_000_000n, maxFeePerGas: 250_000_000_000n });
const maxValue = BigInt(process.env.QORE_WINDOW_MAX_UQOR ?? (perTx * maxTxs).toString());
const msg = openEvmWindowMsg({ sender: acc.cosmos, blocks, maxTxs, maxValue });

// broadcast(acc, "hybrid", [msg]) does this:
const signer = new EthNativeSigner(acc, { signMode: "hybrid", rest: net.rest });
const res = await signer.signAndBroadcast(transport, {
  chainId: net.chainId, accountNumber, sequence, fee: FEE, messages: [msg],
});
```

`acc` はあなたの鍵素材から導出された統合アカウントで、`net` は `QORE_NETWORK`（デフォルトは `testnet`、チェーン ID は `qorechain-diana`）のネットワークレコードです。ハイブリッドトランザクションは大きいため、スクリプトが使う手数料は 100000 `uqor`、ガスリミットは 800000 です。ウィンドウのサイズは、`.env` の `QORE_WINDOW_BLOCKS`（デフォルト 600）、`QORE_WINDOW_TXS`（デフォルト 5）、`QORE_WINDOW_MAX_UQOR` で変更できます。

## 使用したパッケージ {#packages}

| パッケージ | バージョン | 用途 |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | ハイブリッド署名、PQC 鍵の登録、`openEvmWindowMsg` |
| `@qorechain/evm` | ^0.13.0 | EVM ウィンドウのヘルパー（`evmWindowStatus`、`evmWindowCost`） |
| `@cosmjs/stargate` | ^0.39.0 | Native レーンのトランザクションのブロードキャスト |
| `hardhat` | ^3.21.1 | コンパイル、テスト、Ignition によるデプロイ |
| `viem` | ^2.47.6 | コントラクトの読み取りと書き込み |
| `tsx` | ^4.19.0 | TypeScript スクリプトの実行 |
| `typescript` | ^5.6.3 | 型チェック |

同じプロジェクトは、`npx create-qorechain-dapp my-app -t hardhat --network testnet` で自分でもスキャフォールドできます。[スキャフォルダーと CLI](/developer-tools/scaffolders-and-cli)と [SDK のインストール](/sdk/install)を参照してください。

## ネットワークの詳細 {#networks}

| 項目 | 値 |
| --- | --- |
| ネットワーク | テストネット `qorechain-diana` |
| EVM チェーン ID | 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM RPC | `https://evm-testnet.qore.host` |

ソース: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/01-qday-counter
