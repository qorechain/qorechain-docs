---
slug: /sdk/quickstart
title: クイックスタート
sidebar_label: クイックスタート
sidebar_position: 3
---

# クイックスタート

ゼロからトランザクション送信まで。このページでは TypeScript SDK
（`@qorechain/sdk`）を使用します。Python、Go、Rust での接続と読み取りの短い
スニペットは末尾に掲載しています。

## 1. 接続

`createClient()` はネットワークを解決し、読み取りクライアント、手数料ヘルパー、
遅延初期化される署名エントリーポイントを構成します。デフォルトでは公開テストネット
（`qorechain-diana`）を対象とします。デフォルトのエンドポイントは
**localhost** を指すため、実際のノードと通信するには `endpoints` を渡してください。
公開エンドポイントは[ネットワークリファレンス](/sdk/reference/network#public-endpoints)に
掲載されています。

```ts
import { createClient } from "@qorechain/sdk";

// Testnet (chain id "qorechain-diana"), default localhost endpoints.
const client = createClient();

// Point at the public testnet by overriding endpoints.
const remote = createClient({
  endpoints: {
    rest: "https://api-testnet.qore.host",   // Native REST (LCD)
    rpc: "https://rpc-testnet.qore.host",    // consensus RPC (for signing)
    evmRpc: "https://evm-testnet.qore.host", // EVM JSON-RPC (eth_*)
  },
});
```

メインネット（チェーン ID `qorechain-vladi`）は稼働中です。メインネットを選択し、
localhost のデフォルトを公開エンドポイント（または自前のノード）で上書きしてください：

```ts
const main = createClient({
  network: "mainnet",
  endpoints: {
    rest: "https://api.qore.host",
    rpc: "https://rpc.qore.host",
    evmRpc: "https://evm.qore.host",
  },
});
```

## 2. アカウントの導出

1 つのニーモニックから、独立した導出パスを介して Native（`qor1…`）、EVM（`0x…`）、
SVM（base58）の各アカウントが導出されます。

```ts
import {
  generateMnemonic,
  deriveNativeAccount,
} from "@qorechain/sdk";

const mnemonic = generateMnemonic(); // 12 words (pass 256 for 24 words)

const native = await deriveNativeAccount(mnemonic);
console.log(native.address); // "qor1..."  (Native secp256k1, coin type 118)
```

0.6.0 以降では、代わりに **統合 eth-native アカウント**を導出できます — 1 つの
`eth_secp256k1` 鍵が 3 つのアドレス（`qor1…`、`0x…`、SVM base58）すべてとして
表現され、残高は 1 つに共有されます：

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const unified = await deriveUnifiedAccount(mnemonic);
console.log(unified.cosmos); // "qor1..."
console.log(unified.evm);    // "0x..."
console.log(unified.svm);    // base58 (same 20 bytes + 12 zero bytes)
```

EVM/SVM の導出、統合アカウント、導出パスの完全な一覧表については、
[アカウントと PQC 署名](/sdk/concepts/accounts-pqc)を参照してください。

## 3. 残高の読み取り

```ts
// Native bank balances over REST.
const balances = await client.rest.getAllBalances(native.address);

// Any REST route works through the typed escape hatch, for example the burn
// statistics.
const burn = await client.rest.getBurnStats();
```

`client.qor`（型付きの `qor_` JSON-RPC 呼び出し）は公開エンドポイントでは使用できません。
リリース済みのどのノードビルドもその名前空間を提供しておらず、すべての呼び出しが
`-32601`（メソッドが見つからない）を返します。代わりに REST 経由で読み取ってください。
[`qor_` 名前空間](/api-reference/json-rpc-qor_-namespace)を参照してください。

## 4. QOR の送金 {#send-qor}

メインネットとテストネットでは、Native パスのすべてのトランザクションに**ハイブリッド**
（古典 secp256k1 + ML-DSA-87）署名を付ける必要があり、アカウントの ML-DSA-87 鍵は
**先にオンチェーンで登録**されていなければなりません。登録は明示的に行います。最初の
トランザクション時の自動登録はありません。古典署名のみのトランザクションは稼働中の
ネットワークに拒否されるため、トランザクションクライアントにアカウントの
ML-DSA-87 鍵ペアを渡すと、すべてのトランザクションをハイブリッドで署名します。以下の 2 つのステップには
**SDK 0.9.0 以降**と、資金のあるアカウントが必要です：

```bash
npm i @qorechain/sdk
```

### 4a. ポスト量子鍵の登録（初回のみ）

手数料はアカウントが支払います。2,592 バイトの鍵には約 600,000 のガスリミットが必要です。
`ensurePqcRegistered` はまず REST（`rest`）で鍵の状態を読み取るため、鍵がすでに登録済みの場合は
トランザクションをスキップし、アカウントが*別の*鍵を保持している場合は、何も送信せずに
`PqcKeyMismatchError` を投げます（2 回目の登録は**手数料が徴収された後に**拒否されます）。
登録は、鍵を持たないアカウントからチェーンが受け入れる唯一の古典署名トランザクションであるため、
ハイブリッドクライアントはこれを自動的に古典署名で送信します。ネットワークが
v3.2.3 を適用した後は（両ネットワークとも適用済み）、このヘルパーは任意の所有証明も添付します。
チェーンは脆弱な鍵、縮退した鍵、再利用された鍵を拒否します。`derivePqcCanonical` で導出した鍵であれば問題ありません。

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  ensurePqcRegistered,
} from "@qorechain/sdk";

const REST = "https://api-testnet.qore.host";
const RPC = "https://rpc-testnet.qore.host";

const client = createClient({ endpoints: { rest: REST, rpc: RPC } });

const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");

// The address-bound ML-DSA-87 key, recoverable from { address, mnemonic }.
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);

// With the keypair, every transaction this client sends is signed hybrid.
const tx = await client.connectTx(signer, { pqcKeypair });

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  rest: client.network.endpoints.rest, // reads the status first; never registers blind
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});
console.log(res.alreadyRegistered ? "already registered" : res.txHash);
```

### 4b. ハイブリッド署名での送信

`tx.bankSend` はハイブリッドで署名するようになりました。手数料のデフォルトは `"auto"` です。クライアントは
ハイブリッドトランザクションそのものをシミュレートし、シミュレーションでは課金されない
ポスト量子検証のガスを加算します。ネットワークの最低ガス価格はガス 1 単位あたり 0.1 uqor です
（クライアントは 0.15 で価格設定します）。QOR を基本単位の `uqor` に変換するには `toBase("1.5")` を使用します。

```ts
import { toBase } from "@qorechain/sdk";

const result = await tx.bankSend("qor1recipientaddress...", [
  { denom: "uqor", amount: toBase("1.5") },
]);
console.log(result.transactionHash);
```

`toBase("1.5")` は `"1500000"` を返します（QOR の基本単位 `uqor` は 10^6 です）。他の
メッセージを同じ方法で送信するには、`tx.signAndBroadcast([message], "auto")` に渡します。
手数料、アカウント番号、シーケンスを明示的に制御するには、`signAndBroadcastHybrid` を使用します
（[アカウントと PQC 署名](/sdk/concepts/accounts-pqc#hybrid-signing)を参照）。

:::info 統合アカウント
統合 eth-native アカウント（`deriveUnifiedAccount`）では、代わりに
`EthNativeSigner` を使用してください。登録と送信のサンプルは
[アカウントと PQC 署名](/sdk/concepts/accounts-pqc#hybrid-signing)にあります。
:::

:::note 鍵ペアなしではクライアントは古典署名を行います
`pqcKeypair` なしの `client.connectTx(signer)` は古典署名のみを行います。公開ネットワークは、
これを鍵登録（まだ鍵を持たないアカウント）に限って受け入れます。ハイブリッド拡張を要求しない
ノード（ローカル開発ノード）に対しては、通常の送金にも使えます。0.9.0 より前の SDK バージョンには
ハイブリッドの `TxClient` がありません。`signAndBroadcastHybrid` を通じて送信してください
（[0.9.0 より前のバージョン](/sdk/install#before-090)を参照）。
:::

## その他の言語：接続と読み取り

以下は同じネットワークプリセットと読み取り API を提供します。公開テストネットの
エンドポイントを使用しています。メインネットの場合は `"mainnet"` とメインネットの URL を
渡してください。

### Python

```python
from qorsdk import create_client

client = create_client(
    network="testnet",
    endpoints={
        "rest": "https://api-testnet.qore.host",
        "rpc": "https://rpc-testnet.qore.host",
        "evm_rpc": "https://evm-testnet.qore.host",
    },
)
print(client.network.chain_id)  # "qorechain-diana"

balances = client.rest.get_all_balances("qor1...")
burn = client.rest.get_burn_stats()
client.close()
```

### Go

```go
import (
    "fmt"

    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"
)

c, err := client.CreateClient(client.Options{
    Network: "testnet",
    Endpoints: client.EndpointOverrides{
        REST:   "https://api-testnet.qore.host",
        RPC:    "https://rpc-testnet.qore.host",
        EVMRPC: "https://evm-testnet.qore.host",
    },
})
if err != nil {
    panic(err)
}
fmt.Println(c.Network.ChainID) // qorechain-diana

balances, err := c.REST.GetAllBalances("qor1...")
burn, err := c.REST.GetBurnStats()
```

### Rust

```rust
use qorechain::ClientBuilder;

#[tokio::main]
async fn main() -> qorechain::Result<()> {
    let client = ClientBuilder::new()
        .network("testnet")
        .rest("https://api-testnet.qore.host")
        .rpc("https://rpc-testnet.qore.host")
        .evm_rpc("https://evm-testnet.qore.host")
        .build()?;
    let balances = client.rest.get_all_balances("qor1...").await?;
    let burn = client.rest.get_burn_stats().await?;
    let _ = (balances, burn);
    Ok(())
}
```

## 次のステップ

- [ガイド](/sdk/guides/evm) — 各 VM（EVM、SVM、CosmWasm、クロス VM）の使い方。
- [アカウントと PQC 署名](/sdk/concepts/accounts-pqc) — HD 導出、統合
  eth-native アカウント、ポスト量子署名。
- [オーセンティケータと委任支出](/sdk/guides/authenticators) — リンク済みの
  Phantom/MetaMask 鍵にリレイヤー経由で支出させる方法。
- [ネットワークとエンドポイントのリファレンス](/sdk/reference/network)。
- [サンプル集](/sdk/examples) — 上記の各フローの実行可能なスニペット。
