---
slug: /developer-guide/exchange-integration
title: 取引所・インテグレーター向けガイド
sidebar_label: 取引所統合
sidebar_position: 11
---

# 取引所・インテグレーター向けガイド

取引所、カストディアン、決済インテグレーターが QOR を上場し、入金と出金を処理するために必要なすべて — インターフェースの選択、安全な入金検知、そして出金の署名について解説します。

:::note
本ガイドは **`qorechain-vladi`** メインネット(チェーンバージョン **v3.1.92**)を対象としています。まず **`qorechain-diana`** テストネットでフロー全体をリハーサルしてください — 両ネットワークのエンドポイントは [ネットワーク](/appendix/networks#public-endpoints) に記載されています。自前のフルノードを運用する場合は、現行のチェーンバージョンに保ってください — 古いノードは新しいトランザクションタイプをデコードできず、同期が停止します。
:::

## 統合パスの選択 {#choosing-a-path}

QoreChain は、**単一の統合ネイティブ QOR 残高**を 3 つのインターフェースを通じて公開する単一のチェーンです。**同じ秘密鍵が同じ資金を管理**しており、Cosmos(`qor1...`)、EVM(`0x...`)、SVM(base58)の各アドレスで利用できます — 自社のスタックに合ったインターフェースを選択してください。

| | **A) Cosmos(ネイティブ)** | **B) EVM** | **C) SVM(Solana VM)** |
|---|---|---|---|
| アドレス | `qor1...`(bech32) | `0x...`(Ethereum) | Solana base58(同一の鍵) |
| 小数点桁数(ネイティブ QOR) | **6**(`uqor`) | **18**(wei 方式) | **9**(lamports; 1 uqor = 1,000 lamports) |
| ツーリング | Cosmos SDK / CosmJS | **標準的な Ethereum**(ethers/web3、MetaMask) | `@solana/web3.js` |
| 出金の署名 | **ハイブリッド PQC が必須**(ML-DSA-87 + secp256k1) | **標準の secp256k1 / EIP-155 — PQC 不要** | Cosmos tx またはノード上での送信経由 |
| メモ / タグ対応 | **あり**(共有アドレス + メモ) | なし(ユーザーごとに 1 アドレス) | なし(ユーザーごとに 1 アドレス) |
| 入金検知 | `MsgSend` イベントをスキャン | `eth_getBlockByNumber` でブロックをスキャン | `getBalance` / `getSignaturesForAddress` |
| 最適な用途 | Cosmos ネイティブのプラットフォーム | **既存の EVM 統合を持つプラットフォーム** | Solana ツーリングのプラットフォーム |

**推奨:** すでに EVM チェーンをサポートしている場合、**パス B(EVM)** が最も工数の少ない統合です — 標準的な Ethereum ツーリングが使え、**出金にポスト量子署名は不要**です(EVM の ante パスは免除対象)。パス A(Cosmos)は、メモベースの共有入金アドレスを備えたネイティブルートです。パス C(SVM)は仕様上は完全なネイティブ QOR インターフェースですが、**そのトランザクションレーンは現在ネットワーク全体で無効化されています**([パス C](#path-c-svm) を参照) — 再開されるまではパス A またはパス B を使用してください。

3 つのインターフェースは**相互排他ではありません** — 同じ鍵の `0x` 形式、`qor1` 形式、SVM 形式のいずれに送られた資金も、同一の残高です。

## ノードの運用 {#node}

本番環境の統合では、サードパーティのエンドポイントではなく、**自前の同期済みノード**に対して入金を検証すべきです。[メインネットへの接続](/getting-started/connecting-to-mainnet) に従ってください — ビルド済みバイナリバンドル(SHA-256 チェックサム付き)、ジェネシス、公開ピア、手数料フロア(`0.1uqor`)、公開されているチェーンデータスナップショットによる高速ブートストラップを網羅しています。非バリデータのフルノードの運用にライセンスは不要です。

QoreChain は**即時ファイナリティ**(リオーグなし)を備えているため、**1 確認で確定**です。1〜2 ブロック待てば十分な運用マージンが得られます。

## パス A — Cosmos(ネイティブ) {#path-a-cosmos}

REST のベース URL: `https://api.qore.host`(または自ノード上の `http://localhost:1317`)。

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

以下の**すべて**が成立する場合に**のみ**入金を計上してください:

1. **`tx_response.code == 0`** — トランザクションが成功していること。失敗した tx は決して計上しないでください。
2. メッセージが **`/cosmos.bank.v1beta1.MsgSend`**(または `MsgMultiSend` の output)であること — コントラクト呼び出しや他のモジュールではないこと。
3. **`to_address`** が自社の入金アドレスと一致し、(共有アドレスモデルの場合)**`memo`** がユーザーと一致すること。
4. **`denom == "uqor"`** であり、`amount` が計上する金額であること(uqor → QOR には ÷ 10⁶)。それ以外の denom は拒否してください。
5. tx が**コミット済みブロック**に含まれていること(`height` が存在し、最新のコミット済み高さ以下であること)。ファイナリティは即時 — 1 確認で確定です。マージンとして 1〜2 ブロック待ってください。
6. **transfer イベント**(`coin_received` / `coin_spent`)から金額を再計算し、メッセージの金額と突合すること — 単一のフィールドやメモだけを決して信用しないでください。
7. tx ハッシュの存在を、**自前の**同期済みノードに対して `GET /cosmos/tx/v1beta1/txs/{hash}` で確認すること。

### 出金 — ハイブリッド PQC 署名 {#cosmos-withdrawals}

メインネットは cosmos トランザクションに**ポスト量子署名**を強制しています(`allow_classical_fallback = false`)。すべての出金には**ハイブリッド署名** — ML-DSA-87(Dilithium-5、FIPS-204)**に加えて** secp256k1 — が必要です。入金にはこれは**不要**です(チェーンを監視するだけです)。

署名ライブラリは [**`@qorechain/wallet-adapter`**](https://github.com/qorechain/qorechain-wallet-adapter)(npm)で、FIPS-204 プリミティブのために `@qorechain/pqc` を取り込みます:

```bash
npm i @qorechain/wallet-adapter @qorechain/pqc @cosmjs/proto-signing cosmjs-types@0.9.0
# pin cosmjs-types to 0.9.x — 0.10 breaks the subpath imports the adapter uses
```

署名は(`qorechaind tx pqc cosign` を反映した)**2 ステップ**のフローです:

**ステップ 1 — ホットウォレットごとに 1 回だけ: ML-DSA-87 鍵を登録します。** この単一の登録トランザクションは**クラシカル署名**です(ブートストラップ免除): メッセージは `/qorechain.pqc.v1.MsgRegisterPQCKeyV2` で、内容は `{sender, public_key, algorithm_id: 1, key_type: "hybrid"}` です。ML-DSA 鍵は既存のシークレットから復元可能なように決定論的に導出してください — 例: `seed = SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)`、次に `mldsa.keygen(seed)` — そしてシードをホットウォレット鍵と併せて保管してください。

**ステップ 2 — 以降のすべての出金: `MsgSend` をハイブリッド署名します。** アダプターは通常の secp256k1 `signDirect` の*前に* ML-DSA-87 署名を tx-body 拡張に組み込むため、既存の署名器はそのまま使えます:

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

署名済みバイト列をブロードキャストします:

```bash
curl -s -X POST https://api.qore.host/cosmos/tx/v1beta1/txs \
  -H 'Content-Type: application/json' \
  -d '{"tx_bytes":"<base64-signed-tx>","mode":"BROADCAST_MODE_SYNC"}' | jq .tx_response.code
# 0 => accepted into the mempool
# code 8 "classical fallback not allowed" => step 1 not done yet for this account
```

その後、`GET /cosmos/tx/v1beta1/txs/{hash}` を、`code == 0` でブロックに現れるまでポーリングしてください。

HSM や別言語のカスタム署名器の場合は、スタンドアロンの [**`qorechain-pqc`**](/developer-guide/post-quantum-signing) FIPS-204 ライブラリ(npm、PyPI、crates.io、Maven Central、Go)を使用し、同じ拡張を組み立ててください。ML-DSA 署名は**決定論的でなければなりません**(FIPS-204 §3.4)— [決定論的署名](/developer-guide/post-quantum-signing#deterministic-signing) を参照してください。チェーンは hedged 署名を拒否します。

### サーバーサイドの代替手段: `@qorechain/chain-bridge` {#chain-bridge}

完全にサーバーサイドで動作するホットウォレットワーカー(ブラウザウォレット不使用)向けに、**`@qorechain/chain-bridge`**(npm)はフロー全体 — 鍵導出、初回利用時の PQC 自動登録、ハイブリッド署名、ブロードキャスト — を 1 回の呼び出しにまとめます。純粋な JavaScript(ネイティブアドオンなし)で、サーバーレスワーカーに適しています:

```js
import { ChainBridge } from "@qorechain/chain-bridge";

const bridge = new ChainBridge({
  cosmosRpc: "https://rpc.qore.host",       // or your own node
  chainId: "qorechain-vladi",
  signerMnemonic: process.env.HOT_WALLET_MNEMONIC,  // from your secrets manager
});

// One call: derives the canonical ML-DSA-87 key, auto-registers it if missing,
// hybrid-signs the MsgSend, and broadcasts. Amounts are in uqor (6 decimals).
const { txHash } = await bridge.sendTokens({
  to: "qor1recipient...",
  amountUqor: "1000000",   // 1 QOR
});
```

`chain-bridge`(≥0.1.1)は、スタックの他の部分と同じ正規のアドレス紐付け PQC 導出 — `SHAKE-256("qorechain:pqc:v1|address|mnemonic")` — を使用するため、鍵はニーモニックから `qorechaind tx pqc recover-key` で復元できます。旧ツーリングで登録されたアカウントは自動的に処理され(レガシー鍵フォールバック)、[`MsgRotatePQCKey`](/developer-guide/post-quantum-signing#key-rotation) で正規の鍵へ一度だけ移行できます。

## パス B — EVM {#path-b-evm}

`https://evm.qore.host`(チェーン ID **9801**)または自ノードのポート 8545 に対する標準的な Ethereum 統合です。

* **小数点桁数:** ネイティブ QOR は EVM レール上では **18 桁**です(1 uqor = 10¹² wei)。これを誤ると入金が 10¹² 倍の係数で誤計上されます。
* **入金:** `eth_getBlockByNumber` でブロックをスキャンし、自社アドレスへのネイティブ送金を検出します。`eth_getTransactionReceipt`(`status == 0x1`)で確認してください。
* **出金:** 標準の secp256k1 / EIP-155 署名 — EVM の ante パスでは **PQC は不要**です。既存の Ethereum 署名スタックがそのまま動作します。
* **偽入金対策:** レシートのステータスを検証し、移動した value が(インデックスしていない ERC-20 イベントではなく)**ネイティブ**送金であることを確認し、自前のノードに対して照合してください。
* **アドレスのマッピング:** `0x` アドレスと `qor1` アドレスは同一アカウントの 2 つのエンコーディングであり、資金は共有されます。[EVM 開発](/developer-guide/evm-development) を参照してください。

## パス C — SVM(Solana 互換) {#path-c-svm}

:::caution SVM レーンは現在無効化されています
SVM 実行レーンは、チェーンバージョン v3.1.89(8 月 22 日)時点で**トランザクション送信についてネットワーク全体で現在無効化されています** — このレーンへのトランザクションはすべて `code 11, "SVM module is disabled"` を返します。レーンが再開されるまで、パス C 上に入出金レールを構築**しないでください**。代わりに **パス A(Cosmos)** または **パス B(EVM)** を使用してください。読み取り系エンドポイント(例: `getBalance`)は引き続き応答する場合がありますが、トランザクション送信が無効化されている間は、SVM に対して入金検知や出金フローを構築しないでください。
:::

v3.1.82 以降、SVM インターフェースは**ネイティブ QOR** を提供します([SVM インターフェース上のネイティブ QOR](/developer-guide/svm-development#native-qor) を参照):

* **残高:** `getBalance` は lamports を返します(QOR には ÷ 10⁹; 1 uqor = 1,000 lamports)。
* **入金:** `getSignaturesForAddress` でアドレスのトランザクション履歴を取得できます。System Program の送金がネイティブ QOR を移動させます。
* 公開エンドポイント(`https://svm.qore.host`、`https://svm-testnet.qore.host`)は**読み取り専用**です。トランザクションは自前のノードから送信してください。

## フローの概要 {#flow-summary}

| 操作 | パス | 署名は必要? |
|---|---|---|
| **入金**(ユーザー → プラットフォーム) | 同期済みノードで自社アドレスへの送金を監視(Cosmos ではメモも) | 不要 — 監視のみ |
| **出金**(プラットフォーム → ユーザー) | 送金を組み立て、オフラインで署名し、ブロードキャスト | Cosmos: ハイブリッド PQC · EVM: 標準の secp256k1 |
| **残高 / スイープ** | REST / EVM / SVM の残高照会 + 送金 | スイープ時のみ署名 |

## 関連ページ

* [メインネットへの接続](/getting-started/connecting-to-mainnet) — ノードのセットアップ、ダウンロード、スナップショット
* [ノードの運用](/developer-guide/running-a-node) — デプロイ、プルーニング、インデックス作成
* [ポスト量子署名](/developer-guide/post-quantum-signing) — ハイブリッド出金を支える FIPS-204 ライブラリ
* [ネットワーク](/appendix/networks) — チェーン ID、エンドポイント、インターフェースごとの小数点桁数
