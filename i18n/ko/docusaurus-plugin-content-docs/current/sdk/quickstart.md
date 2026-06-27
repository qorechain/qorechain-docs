---
slug: /sdk/quickstart
title: 퀵스타트
sidebar_label: 퀵스타트
sidebar_position: 3
---

# 퀵스타트

처음부터 트랜잭션 전송까지. 이 페이지는 TypeScript SDK
(`@qorechain/sdk`)를 사용합니다. Python, Go, Rust용 짧은 연결 및 읽기 스니펫은
끝부분에 이어집니다.

## 1. 연결

`createClient()`는 네트워크를 해석하고 읽기 클라이언트, 수수료 헬퍼, 지연 로딩되는
서명 진입점을 구성합니다. 기본적으로 공개 테스트넷
(`qorechain-diana`)을 대상으로 합니다. 기본 엔드포인트는 **localhost**를 가리키므로,
실제 노드와 통신하려면 `endpoints`를 전달하세요.

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

메인넷(chain id `qorechain-vladi`)이 가동 중입니다. 이를 선택하고
localhost 기본값을 노드 URL로 재정의하세요:

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

## 2. 계정 파생

하나의 니모닉으로 독립적인 파생 경로를 통해 native(`qor1…`), EVM(`0x…`),
SVM(base58) 계정을 파생합니다.

```ts
import {
  generateMnemonic,
  deriveNativeAccount,
} from "@qorechain/sdk";

const mnemonic = generateMnemonic(); // 12 words (pass 256 for 24 words)

const native = await deriveNativeAccount(mnemonic);
console.log(native.address); // "qor1..."  (Cosmos-style secp256k1)
```

EVM/SVM 파생과 전체 파생 표는 [계정 및 PQC 서명](/sdk/concepts/accounts-pqc)을
참조하세요.

## 3. 잔액 읽기

```ts
// Cosmos bank balances over REST.
const balances = await client.rest.getAllBalances(native.address);

// A typed qor_ JSON-RPC call.
const tokenomics = await client.qor.getTokenomicsOverview();
```

## 4. QOR 전송 보내기

native 계정을 파생하고, 그 개인 키를 서명자로 변환하고, `TxClient`를
연결한 뒤 토큰을 전송하세요. QOR를 기본 단위 `uqor`로 변환하려면 `toBase("1.5")`를
사용하세요.

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

`toBase("1.5")`는 `"1500000"`을 반환합니다(QOR는 기본 단위 `uqor`가 10^6 단위입니다).

## 다른 언어: 연결 및 읽기

이들은 동일한 네트워크 프리셋과 읽기 표면을 그대로 반영합니다.

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

## 다음

- [가이드](/sdk/guides/evm) — 각 VM 다루기(EVM, SVM, CosmWasm, 크로스 VM).
- [계정 및 PQC 서명](/sdk/concepts/accounts-pqc) — HD 파생과
  포스트 양자 서명.
- [네트워크 및 엔드포인트 참조](/sdk/reference/network).
- [예제](/sdk/examples) — 위의 각 흐름에 대한 실행 가능한 스니펫.
