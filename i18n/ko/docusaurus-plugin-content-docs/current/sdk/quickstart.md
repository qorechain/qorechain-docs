---
slug: /sdk/quickstart
title: 퀵스타트
sidebar_label: 퀵스타트
sidebar_position: 3
---

# 퀵스타트

제로에서 트랜잭션 전송까지. 이 페이지는 TypeScript SDK(`@qorechain/sdk`)를
사용하며, Python, Go, Rust용 간단한 연결·조회 스니펫은 마지막에
소개합니다.

## 1. 연결

`createClient()`는 네트워크를 결정하고 읽기 클라이언트, 수수료 헬퍼,
지연(lazy) 서명 진입점을 구성합니다. 기본적으로 퍼블릭 테스트넷
(`qorechain-diana`)을 대상으로 합니다. 기본 엔드포인트는 **localhost**를
가리키므로, 실제 노드와 통신하려면 `endpoints`를 전달하세요.

```ts
import { createClient } from "@qorechain/sdk";

// Testnet (chain id "qorechain-diana"), default localhost endpoints.
const client = createClient();

// Point at a real node by overriding endpoints.
const remote = createClient({
  endpoints: {
    rest: "https://api-testnet.qore.host",   // Native REST (LCD)
    rpc: "https://rpc-testnet.qore.host",    // consensus RPC (for signing)
    evmRpc: "https://evm-testnet.qore.host", // EVM + qor_ JSON-RPC
  },
});
```

메인넷(chain id `qorechain-vladi`)은 가동 중입니다. 메인넷을 선택하고
localhost 기본값을 퍼블릭 엔드포인트(또는 자체 노드)로 재정의하세요:

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

## 2. 계정 파생

하나의 니모닉으로 서로 독립적인 파생 경로를 통해 네이티브(`qor1…`),
EVM(`0x…`), SVM(base58) 계정을 파생합니다.

```ts
import {
  generateMnemonic,
  deriveNativeAccount,
} from "@qorechain/sdk";

const mnemonic = generateMnemonic(); // 12 words (pass 256 for 24 words)

const native = await deriveNativeAccount(mnemonic);
console.log(native.address); // "qor1..."  (Native secp256k1, coin type 118)
```

0.6.0부터는 대신 **통합 eth-native 계정**을 파생할 수 있습니다 — 하나의
`eth_secp256k1` 키가 세 가지 주소(`qor1…`, `0x…`, SVM base58)로 표현되며
하나의 공유 잔액을 가집니다:

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const unified = await deriveUnifiedAccount(mnemonic);
console.log(unified.cosmos); // "qor1..."
console.log(unified.evm);    // "0x..."
console.log(unified.svm);    // base58 (same 20 bytes + 12 zero bytes)
```

EVM/SVM 파생, 통합 계정, 전체 파생 테이블은
[계정 및 PQC 서명](/sdk/concepts/accounts-pqc)을 참조하세요.

## 3. 잔액 조회

```ts
// Native bank balances over REST.
const balances = await client.rest.getAllBalances(native.address);

// A typed qor_ JSON-RPC call.
const tokenomics = await client.qor.getTokenomicsOverview();
```

## 4. QOR 전송하기

네이티브 계정을 파생하고, 개인 키를 서명자(signer)로 변환한 뒤,
`TxClient`를 연결하고 토큰을 전송합니다. QOR를 기본 단위 `uqor`로
변환하려면 `toBase("1.5")`를 사용하세요.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  toBase,
} from "@qorechain/sdk";

const client = createClient({
  endpoints: {
    rpc: "https://rpc-testnet.qore.host",
    rest: "https://api-testnet.qore.host",
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

`toBase("1.5")`는 `"1500000"`을 반환합니다 (QOR는 10^6 기본 단위 `uqor`를
사용합니다).

:::info 라이브 네트워크에서의 하이브리드 서명
메인넷과 테스트넷에서 Native 경로는 **하이브리드**(클래식 +
ML-DSA-87) 서명 확장을 요구합니다 — `buildHybridTx` /
`signAndBroadcastHybrid`를 사용하거나, 통합 eth-native 계정에는
`signHybridEth`를 사용하세요.
[하이브리드 서명](/sdk/concepts/accounts-pqc#hybrid-signing)을 참조하세요.
:::

## 다른 언어: 연결 및 조회

아래 예제들은 동일한 네트워크 프리셋과 읽기 인터페이스를 그대로 따릅니다.

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

## 다음 단계

- [가이드](/sdk/guides/evm) — 각 VM(EVM, SVM, CosmWasm, 크로스 VM) 다루기.
- [계정 및 PQC 서명](/sdk/concepts/accounts-pqc) — HD 파생, 통합
  eth-native 계정, 포스트 양자 서명.
- [Authenticators 및 위임 지출](/sdk/guides/authenticators) — 연결된
  Phantom/MetaMask 키가 릴레이어를 통해 지출하도록 허용.
- [네트워크 및 엔드포인트 레퍼런스](/sdk/reference/network).
- [예제](/sdk/examples) — 위의 각 플로우에 대한 실행 가능한 스니펫.
