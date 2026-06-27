---
slug: /sdk/quickstart
title: クイックスタート
sidebar_label: クイックスタート
sidebar_position: 3
---

# クイックスタート

ゼロからトランザクション送信まで。このページでは TypeScript SDK
（`@qorechain/sdk`）を使用します。Python、Go、Rust の接続と読み取りの短い
スニペットは末尾に続きます。

## 1. 接続

`createClient()` はネットワークを解決し、読み取りクライアント、手数料ヘルパー、
遅延署名エントリーポイントを構成します。デフォルトでは公開テストネット
（`qorechain-diana`）を対象とします。デフォルトのエンドポイントは
**localhost** を指すため、実際のノードと通信するには `endpoints` を渡してください。

```ts
import { createClient } from "@qorechain/sdk";

// Testnet (chain id "qorechain-diana"), default localhost endpoints.
const client = createClient();

// Point at a real node by overriding endpoints.
const remote = createClient({
  endpoints: {
    rest: "https://rest.testnet.example",   // Cosmos REST (LCD)
    rpc: "https://rpc.testnet.example",      // consensus RPC (for signing)
    evmRpc: "https://evm.testnet.example",   // EVM + qor_ JSON-RPC
  },
});
```

メインネット（チェーン ID `qorechain-vladi`）は稼働中です。これを選択し、
localhost のデフォルトをご自身のノード URL で上書きしてください。

```ts
const main = createClient({
  network: "mainnet",
  endpoints: {
    rest: "https://rest.mainnet.example",
    rpc: "https://rpc.mainnet.example",
    evmRpc: "https://evm.mainnet.example",
  },
});
```

## 2. アカウントを導出する

単一のニーモニックから、独立した導出パスを介してネイティブ（`qor1…`）、EVM
（`0x…`）、SVM（base58）の各アカウントが導出されます。

```ts
import {
  generateMnemonic,
  deriveNativeAccount,
} from "@qorechain/sdk";

const mnemonic = generateMnemonic(); // 12 words (pass 256 for 24 words)

const native = await deriveNativeAccount(mnemonic);
console.log(native.address); // "qor1..."  (Cosmos-style secp256k1)
```

EVM/SVM の導出と完全な導出テーブルについては
[アカウントと PQC 署名](/sdk/concepts/accounts-pqc) を参照してください。

## 3. 残高を読み取る

```ts
// Cosmos bank balances over REST.
const balances = await client.rest.getAllBalances(native.address);

// A typed qor_ JSON-RPC call.
const tokenomics = await client.qor.getTokenomicsOverview();
```

## 4. QOR 送金を送信する

ネイティブアカウントを導出し、その秘密鍵を署名者にアダプトし、`TxClient` を
接続してトークンを送信します。`toBase("1.5")` を使用して QOR を基本単位 `uqor` に
変換します。

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  toBase,
} from "@qorechain/sdk";

const client = createClient({
  endpoints: {
    rpc: "https://rpc.testnet.example",
    rest: "https://rest.testnet.example",
  },
});

const account = await deriveNativeAccount(mnemonic);

// Adapt the raw secp256k1 key into an offline signer bound to the "qor" prefix.
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");

// Connect a tx client at the consensus RPC endpoint.
const tx = await client.connectTx(signer);

// Estimate a fee, then send 1.5 QOR.
const fee = await client.fees.estimate(); // or "fast" | "normal" | "slow"
const result = await tx.bankSend(
  "qor1recipientaddress...",
  [{ denom: "uqor", amount: toBase("1.5") }],
  { fee },
);

console.log(result.transactionHash);
```

`toBase("1.5")` は `"1500000"` を返します（QOR は 10^6 の基本単位 `uqor` を
持ちます）。

## 他の言語: 接続と読み取り

これらは同じネットワークプリセットと読み取りインターフェースを反映しています。

### Python

```python
from qorechain import create_client

client = create_client()  # testnet preset (localhost endpoints)
print(client.network.chain_id)  # "qorechain-diana"

balances = client.rest.get_all_balances("qor1...")
stats = client.qor.get_ai_stats()
client.close()
```

### Go

```go
import "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"

c, err := client.CreateClient(client.Options{}) // defaults to "testnet"
if err != nil {
    panic(err)
}
fmt.Println(c.Network.ChainID) // qorechain-diana

balances, err := c.REST.GetAllBalances("qor1...")
stats, err := c.Qor.GetAIStats()
```

### Rust

```rust
use qorechain::ClientBuilder;

#[tokio::main]
async fn main() -> qorechain::Result<()> {
    let client = ClientBuilder::new().build()?; // defaults to "testnet"
    let balances = client.rest.get_all_balances("qor1...").await?;
    let stats = client.qor.get_ai_stats().await?;
    let _ = (balances, stats);
    Ok(())
}
```

## 次へ

- [ガイド](/sdk/guides/evm) — 各 VM（EVM、SVM、CosmWasm、クロス VM）の利用。
- [アカウントと PQC 署名](/sdk/concepts/accounts-pqc) — HD 導出と
  ポスト量子署名。
- [ネットワークとエンドポイントのリファレンス](/sdk/reference/network)。
- [サンプル](/sdk/examples) — 上記の各フローの実行可能なスニペット。
