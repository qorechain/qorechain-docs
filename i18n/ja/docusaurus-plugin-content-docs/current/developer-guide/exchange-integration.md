---
slug: /developer-guide/exchange-integration
title: 取引所・インテグレーター向けガイド
sidebar_label: 取引所統合
sidebar_position: 11
---

# 取引所・インテグレーター向けガイド

取引所、カストディアン、決済インテグレーターが QOR を上場し、入金と出金を処理するために必要なすべてを解説します。インターフェースの選択、安全な入金検知、出金の署名までを網羅しています。

:::note
このガイドは **`qorechain-vladi`** メインネット（チェーンバージョン **v3.1.82**）を対象としています。まず **`qorechain-diana`** テストネットで全フローをリハーサルしてください。両ネットワークのエンドポイントは [ネットワーク](/appendix/networks#public-endpoints) に記載されています。
:::

## 統合パスの選択 {#choosing-a-path}

QoreChain は単一のチェーンであり、**統一されたネイティブ QOR 残高**を 3 つのインターフェースを通じて公開しています。**同じ秘密鍵が同じ資金を管理**し、Cosmos（`qor1...`）、EVM（`0x...`）、SVM（base58）の各アドレスで利用できます。お使いのスタックに合ったインターフェースを選んでください。

| | **A) Cosmos（ネイティブ）** | **B) EVM** | **C) SVM（Solana VM）** |
|---|---|---|---|
| アドレス | `qor1...`（bech32） | `0x...`（Ethereum） | Solana base58（同一鍵） |
| 小数点桁数（ネイティブ QOR） | **6**（`uqor`） | **18**（wei 方式） | **9**（lamports; 1 uqor = 1,000 lamports） |
| ツーリング | Cosmos SDK / CosmJS | **標準的な Ethereum**（ethers/web3、MetaMask） | `@solana/web3.js` |
| 出金の署名 | **ハイブリッド PQC 必須**（ML-DSA-87 + secp256k1） | **標準的な secp256k1 / EIP-155 — PQC 不要** | Cosmos トランザクション経由またはノード上での送信 |
| メモ / タグのサポート | **あり**（共有アドレス + メモ） | なし（ユーザーごとに 1 アドレス） | なし（ユーザーごとに 1 アドレス） |
| 入金検知 | `MsgSend` イベントをスキャン | `eth_getBlockByNumber` でブロックをスキャン | `getBalance` / `getSignaturesForAddress` |
| 適したプラットフォーム | Cosmos ネイティブのプラットフォーム | **既存の EVM 統合を持つプラットフォーム** | Solana ツーリングを利用するプラットフォーム |

**推奨:** すでに EVM チェーンをサポートしている場合、**パス B（EVM）** が最も手間の少ない統合です。標準的な Ethereum ツーリングがそのまま使え、**出金にポスト量子署名は不要**です（EVM の ante パスは免除されています）。パス A（Cosmos）はメモベースの共有入金アドレスを備えたネイティブルートです。パス C（SVM）も完全なネイティブ QOR インターフェースであり、特に Solana ツーリングを好む場合に選択してください。

3 つのインターフェースは**相互排他ではありません** — 同じ鍵の `0x`、`qor1`、SVM の各形式に送られた資金は同一の残高です。

## ノードの運用 {#node}

本番環境の統合では、サードパーティのエンドポイントではなく、**自社で同期したノード**に対して入金を検証すべきです。[メインネットへの接続](/getting-started/connecting-to-mainnet) に従ってください。プレビルドのバイナリバンドル（SHA-256 チェックサム付き）、ジェネシス、公開ピア、手数料下限（`0.1uqor`）、公開チェーンデータスナップショットによる高速ブートストラップについて説明しています。非バリデーターのフルノードの運用にライセンスは不要です。

QoreChain は**即時ファイナリティ**（リオーグなし）を持つため、**1 確認で確定**です。1〜2 ブロック待つことで運用上の余裕を十分に確保できます。

## パス A — Cosmos（ネイティブ） {#path-a-cosmos}

ベース REST URL: `https://api.qore.host`（または自ノード上の `http://localhost:1317`）。

### 入金の監視

```bash
# latest height
curl -s https://rpc.qore.host/status | jq -r .result.sync_info.latest_block_height

# all txs in a height (deposit scanning)
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs/block/{HEIGHT}" | jq '.txs'

# incoming transfers to an address
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs?query=transfer.recipient='qor1...'&pagination.limit=50" | jq '.tx_responses[].txhash'

# balance (uqor — divide by 1e6 for QOR)
curl -s "https://api.qore.host/cosmos/bank/v1beta1/balances/qor1.../by_denom?denom=uqor" | jq -r .balance.amount
```

### 偽入金対策チェックリスト {#anti-fake-deposit}

以下の**すべて**が満たされる場合に**のみ**入金をクレジットしてください。

1. **`tx_response.code == 0`** — トランザクションが成功していること。失敗したトランザクションは決してクレジットしないでください。
2. メッセージが **`/cosmos.bank.v1beta1.MsgSend`**（または `MsgMultiSend` の出力）であること — コントラクト呼び出しや他モジュールではないこと。
3. **`to_address`** があなたの入金アドレスと一致し、（共有アドレスモデルの場合）**`memo`** がユーザーと一致すること。
4. **`denom == "uqor"`** であり、`amount` がクレジットする値であること（uqor → QOR に換算するには ÷ 10⁶）。それ以外の denom は拒否してください。
5. トランザクションが**コミット済みブロック**に含まれていること（`height` が存在し、最新のコミット済み高さ以下であること）。ファイナリティは即時 — 1 確認で確定です。余裕を持たせるために 1〜2 ブロック待ってください。
6. **転送イベント**（`coin_received` / `coin_spent`）から金額を再計算し、メッセージの金額と突き合わせて検証すること — 単一のフィールドやメモだけを決して信用しないでください。
7. トランザクションハッシュが `GET /cosmos/tx/v1beta1/txs/{hash}` を通じて、**自社の**同期済みノード上に存在することを検証すること。

### 出金 — ハイブリッド PQC 署名 {#cosmos-withdrawals}

メインネットは cosmos トランザクションに**ポスト量子署名**を強制しています（`allow_classical_fallback = false`）。すべての出金には**ハイブリッド署名** — ML-DSA-87（Dilithium-5、FIPS-204）**に加えて** secp256k1 — が必要です。入金にはこれは不要です（チェーンを監視するだけだからです）。

署名ライブラリは [**`@qorechain/wallet-adapter`**](https://github.com/qorechain/qorechain-wallet-adapter)（npm）で、FIPS-204 プリミティブのために `@qorechain/pqc` を取り込みます。

```bash
npm i @qorechain/wallet-adapter @qorechain/pqc @cosmjs/proto-signing cosmjs-types@0.9.0
# pin cosmjs-types to 0.9.x — 0.10 breaks the subpath imports the adapter uses
```

署名は（`qorechaind tx pqc cosign` を模した）**2 ステップ**のフローです。

**ステップ 1 — ホットウォレットごとに 1 回だけ: ML-DSA-87 鍵を登録します。** この単一の登録トランザクションは**古典署名**です（ブートストラップ免除）: メッセージは `/qorechain.pqc.v1.MsgRegisterPQCKeyV2`、内容は `{sender, public_key, algorithm_id: 1, key_type: "hybrid"}`。既存のシークレットから復元できるよう、ML-DSA 鍵は決定論的に導出してください — 例: `seed = SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)`、その後 `mldsa.keygen(seed)` — そしてシードをホットウォレット鍵と併せて保管してください。

**ステップ 2 — それ以降のすべての出金: `MsgSend` をハイブリッド署名します。** アダプターは、通常の secp256k1 `signDirect` の*前に* ML-DSA-87 署名をトランザクションボディの拡張に埋め込むため、既存の署名フローは変更不要です。

```js
import { QoreChainSigner } from "@qorechain/wallet-adapter";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx.js";

// pqc = { publicKey, secretKey } from mldsa.keygen(seed)
// accountNumber + sequence from the auth query
const signer = new QoreChainSigner({ wallet, chainId: "qorechain-vladi",
  address, pubkeySecp256k1, accountNumber, pqc });
const txBytes = await signer.signHybrid({
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: MsgSend.encode(MsgSend.fromPartial({ fromAddress, toAddress,
      amount: [{ denom: "uqor", amount: "1000000" }] })).finish() }],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gasLimit: 400000n },
  sequence });
```

署名済みバイト列をブロードキャストします。

```bash
curl -s -X POST https://api.qore.host/cosmos/tx/v1beta1/txs \
  -H 'Content-Type: application/json' \
  -d '{"tx_bytes":"<base64-signed-tx>","mode":"BROADCAST_MODE_SYNC"}' | jq .tx_response.code
# 0 => accepted into the mempool
# code 8 "classical fallback not allowed" => step 1 not done yet for this account
```

その後、ブロックに含まれ `code == 0` になるまで `GET /cosmos/tx/v1beta1/txs/{hash}` をポーリングしてください。

HSM や別言語のカスタム署名器の場合は、スタンドアロンの [**`qorechain-pqc`**](/developer-guide/post-quantum-signing) FIPS-204 ライブラリ（npm、PyPI、crates.io、Maven Central、Go）を使用し、同じ拡張を組み立ててください。ML-DSA 署名は**決定論的でなければなりません**（FIPS-204 §3.4）— [決定論的署名](/developer-guide/post-quantum-signing#deterministic-signing) を参照してください。チェーンは hedged（ランダム化）署名を拒否します。

## パス B — EVM {#path-b-evm}

`https://evm.qore.host`（チェーン ID **9801**）または自ノードのポート 8545 に対する標準的な Ethereum 統合です。

* **小数点桁数:** ネイティブ QOR は EVM レール上では **18 桁**です（1 uqor = 10¹² wei）。これを誤ると入金額が 10¹² 倍ずれてクレジットされます。
* **入金:** `eth_getBlockByNumber` でブロックをスキャンし、自社アドレスへのネイティブ転送を検出します。`eth_getTransactionReceipt`（`status == 0x1`）で確認してください。
* **出金:** 標準的な secp256k1 / EIP-155 署名 — EVM の ante パスでは **PQC は不要**です。既存の Ethereum 署名スタックがそのまま動作します。
* **偽入金対策:** レシートのステータスを検証し、移動した価値が（インデックスしていない ERC-20 イベントではなく）**ネイティブ**転送であることを確認し、自社ノードに対して照合してください。
* **アドレスのマッピング:** `0x` アドレスと `qor1` アドレスは同一アカウントの 2 つのエンコーディングであり、資金は共有されます。[EVM 開発](/developer-guide/evm-development) を参照してください。

## パス C — SVM（Solana 互換） {#path-c-svm}

v3.1.82 以降、SVM インターフェースは**ネイティブ QOR** を提供します（[SVM インターフェース上のネイティブ QOR](/developer-guide/svm-development#native-qor) を参照）。

* **残高:** `getBalance` は lamports を返します（QOR に換算するには ÷ 10⁹; 1 uqor = 1,000 lamports）。
* **入金:** `getSignaturesForAddress` はアドレスのトランザクション履歴を返します。System Program の転送がネイティブ QOR を移動させます。
* 公開エンドポイント（`https://svm.qore.host`、`https://svm-testnet.qore.host`）は**読み取り専用**です。トランザクションは自ノードを通じて送信してください。

## フローの概要 {#flow-summary}

| 操作 | パス | 署名は必要か |
|---|---|---|
| **入金**（ユーザー → プラットフォーム） | 同期済みノードで自社アドレスへの転送（Cosmos ではメモも）を監視 | 不要 — 監視のみ |
| **出金**（プラットフォーム → ユーザー） | 転送を構築し、オフラインで署名してブロードキャスト | Cosmos: ハイブリッド PQC · EVM: 標準的な secp256k1 |
| **残高照会 / スイープ** | REST / EVM / SVM の残高クエリ + 転送 | スイープ時のみ署名 |

## 関連ページ

* [メインネットへの接続](/getting-started/connecting-to-mainnet) — ノードのセットアップ、ダウンロード、スナップショット
* [ノードの運用](/developer-guide/running-a-node) — デプロイ、プルーニング、インデックス作成
* [ポスト量子署名](/developer-guide/post-quantum-signing) — ハイブリッド出金を支える FIPS-204 ライブラリ
* [ネットワーク](/appendix/networks) — チェーン ID、エンドポイント、インターフェースごとの小数点桁数
