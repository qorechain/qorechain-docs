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
가리키므로, 실제 노드와 통신하려면 `endpoints`를 전달하세요. 퍼블릭
엔드포인트는 [네트워크 레퍼런스](/sdk/reference/network#public-endpoints)에
나와 있습니다.

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

// Any REST route works through the typed escape hatch, for example the burn
// statistics.
const burn = await client.rest.getBurnStats();
```

`client.qor`(타입이 지정된 `qor_` JSON-RPC 호출)는 퍼블릭 엔드포인트에서
사용할 수 없습니다. 배포된 어떤 노드 빌드도 해당 네임스페이스를 제공하지
않으므로 모든 호출이 `-32601`(method not found)을 반환합니다. 대신 REST로
조회하세요. [`qor_` 네임스페이스](/api-reference/json-rpc-qor_-namespace)를
참조하세요.

## 4. QOR 전송하기 {#send-qor}

메인넷과 테스트넷에서 모든 Native 경로 트랜잭션은 **하이브리드**(클래식
secp256k1 + ML-DSA-87) 서명을 포함해야 하며, 계정의 ML-DSA-87 키가 먼저
**온체인에 등록**되어 있어야 합니다. 등록은 명시적으로 수행합니다. 첫
트랜잭션에서의 자동 등록은 없습니다. 일반 `tx.bankSend`(클래식 서명만
사용)는 라이브 네트워크에서 거부됩니다. 아래 두 단계에는 **SDK 0.8.3
이상**(`derivePqcCanonical`; 하이브리드 전송 전반에는 0.8.1 이상)과 자금이
있는 계정이 필요합니다:

```bash
npm i @qorechain/sdk @cosmjs/stargate
```

### 4a. 포스트 양자 키 등록하기 (최초 1회)

등록은 클래식 서명으로 수행하며 하이브리드 요구 사항에서 면제되므로, 새
계정이 첫 키를 부트스트랩할 수 있습니다. 수수료는 계정이 지불합니다.
2,592바이트 키에는 약 600,000의 가스 한도가 필요합니다.

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
const tx = await client.connectTx(signer);

// The address-bound ML-DSA-87 key, recoverable from { address, mnemonic }.
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);

// Read the status over REST (the default status source needs `qor_`).
const { found } = await client.rest.get<{ found: boolean }>(
  `/qorechain/pqc/v1/account/${account.address}`,
);

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  ecdsaPubkey: account.publicKey,
  status: { registered: found },          // skips the transaction when already registered
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});
console.log(res.alreadyRegistered ? "already registered" : res.txHash);
```

### 4b. 하이브리드 서명으로 전송하기

`signAndBroadcastHybrid`는 트랜잭션을 구성하고, 서명하고, 브로드캐스트합니다.
네트워크가 어떤 sign-bytes 형식을 검증하는지 SDK가 네트워크에 물어볼 수
있도록 `rest`를 전달하세요([어떤 sign-bytes 형식을 써야 하나요?](/sdk/concepts/accounts-pqc#sign-bytes-versions)
참조). QOR를 기본 단위 `uqor`로 변환하려면 `toBase("1.5")`를 사용하세요.
네트워크의 최소 가스 가격은 가스 단위당 0.1 uqor이므로, 가스 한도
400,000에는 최소 40,000 uqor의 수수료가 필요합니다.

```ts
import { StargateClient } from "@cosmjs/stargate";
import {
  signAndBroadcastHybrid,
  qorechainRegistry,
  MSG_SEND_TYPE_URL,
  toBase,
} from "@qorechain/sdk";

const transport = await StargateClient.connect(RPC);
const info = await transport.getSequence(account.address); // { accountNumber, sequence }

const result = await signAndBroadcastHybrid({
  registry: qorechainRegistry(),
  signer,
  pqcKeypair,
  messages: [
    {
      typeUrl: MSG_SEND_TYPE_URL,
      value: {
        fromAddress: account.address,
        toAddress: "qor1recipientaddress...",
        amount: [{ denom: "uqor", amount: toBase("1.5") }],
      },
    },
  ],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" },
  chainId: client.network.chainId,
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: REST,
  transport,
});

console.log(result.transactionHash);
```

`toBase("1.5")`는 `"1500000"`을 반환합니다 (QOR는 10^6 기본 단위 `uqor`를
사용합니다).

:::info 통합 계정
통합 eth-native 계정(`deriveUnifiedAccount`)에는 대신 `EthNativeSigner`를
사용하세요. 등록 및 전송 샘플은
[계정 및 PQC 서명](/sdk/concepts/accounts-pqc#hybrid-signing)에 있습니다.
:::

:::note 클래식 전송은 로컬 및 개발 노드에서만 작동합니다
클래식 `client.connectTx(signer)`와 `tx.bankSend(...)` 경로는 여전히
존재하며, `ensurePqcRegistered`가 1회 등록 트랜잭션에 사용하는 경로이기도
합니다. 하이브리드 확장을 요구하지 않는 노드(로컬 개발 노드)에서는 일반
전송도 이 경로로 보낼 수 있습니다. 퍼블릭 네트워크는 이를 거부합니다.
:::

## 다른 언어: 연결 및 조회

아래 예제들은 동일한 네트워크 프리셋과 읽기 인터페이스를 그대로 따릅니다.
퍼블릭 테스트넷 엔드포인트를 사용하며, 메인넷에서는 `"mainnet"`과 메인넷
URL을 전달하세요.

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

## 다음 단계

- [가이드](/sdk/guides/evm) — 각 VM(EVM, SVM, CosmWasm, 크로스 VM) 다루기.
- [계정 및 PQC 서명](/sdk/concepts/accounts-pqc) — HD 파생, 통합
  eth-native 계정, 포스트 양자 서명.
- [Authenticators 및 위임 지출](/sdk/guides/authenticators) — 연결된
  Phantom/MetaMask 키가 릴레이어를 통해 지출하도록 허용.
- [네트워크 및 엔드포인트 레퍼런스](/sdk/reference/network).
- [예제](/sdk/examples) — 위의 각 플로우에 대한 실행 가능한 스니펫.
