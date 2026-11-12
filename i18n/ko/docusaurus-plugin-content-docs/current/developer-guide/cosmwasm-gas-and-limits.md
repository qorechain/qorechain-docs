---
slug: /developer-guide/cosmwasm-gas-and-limits
title: CosmWasm 가스, 가격 책정 및 업로드 제한
sidebar_label: CosmWasm 가스와 제한
sidebar_position: 6
---

# CosmWasm 가스, 가격 책정 및 업로드 제한

QoreChain Native 컨트랙트(QoreChain이 자사 CosmWasm 런타임에 붙인 이름)는 검증인이 실행하는 데 드는 비용에 따라 가격이 책정됩니다. 릴리스 **v3.2.8**부터 컨트랙트 호출의 가격은 세 가지에 좌우됩니다. 현재 블록에서 해당 컨트랙트 코드가 이미 메모리에 로드되어 있는지, 블록이 컨트랙트 작업으로 얼마나 붐비는지, 그리고 호출이 얼마나 많은 메모리를 건드리는지입니다. 코드 업로드는 크기와 형태에 제한이 있습니다.

:::note 먼저 테스트넷
v3.2.8은 2026년 11월 12일부터 **`qorechain-diana`** 테스트넷에서 실행되어 왔습니다. 메인넷(`qorechain-vladi`)은 이후의 거버넌스 업그레이드로 적용하므로, 아래 수치는 현재는 테스트넷을, 그 업그레이드 이후에는 메인넷을 설명합니다. 모든 명령은 `--chain-id qorechain-diana`를 사용하며, 메인넷이 업그레이드되면 `qorechain-vladi`로 바꾸세요.
:::

## 중요한 이유 {#why}

- 어제는 고정 가스 한도로 잘 동작하던 컨트랙트 호출이 오늘은 가스 부족으로 실패할 수 있습니다. 블록에서 해당 코드의 첫 호출은 반복 호출보다 몇 배 더 비싸기 때문입니다. 고정 한도는 가장 나쁜 순간에 틀리는 추측입니다.
- 수수료는 부하를 따라갑니다. 블록이 컨트랙트 호출로 가득 차면 컨트랙트 실행 가격이 오르고, 그렇지 않으면 다시 내려갑니다.
- 모든 블록에는 컨트랙트 작업량의 한도가 있습니다. 한도에 맞지 않는 호출은 실패하며, 다른 실패한 트랜잭션과 마찬가지로 수수료를 지불합니다.

간단한 규칙: **시뮬레이션하고, 결과에 최소 1.3을 곱하고, 컨트랙트 호출의 가스를 절대 하드코딩하지 마세요.**

## 가스 모델 {#gas-model}

### 코드 로드 비용 {#code-load}

컨트랙트가 실행되기 전에 컴파일된 코드를 로드해야 합니다. 블록에서 해당 코드의 첫 호출이 그 로드 비용을 지불합니다. 같은 블록에서 같은 코드에 대한 이후 호출은 코드가 이미 메모리에 있으므로 저렴합니다.

| 호출 | 대략적인 가스 |
| ---- | --------------- |
| cw20 `transfer`, 블록에서 해당 코드의 첫 호출(메시지 1개, 측정된 사용 가스) | 585,151 |
| cw20 `transfer`, 한 트랜잭션에서 3회 호출, 즉 같은 블록에서 2회 반복(측정된 사용 가스, 합계) | 646,169 |
| 동일한 단일 호출을 시뮬레이션이 보고한 값 | 591,280 |

이 수치는 2026년 11월 12일 테스트넷에서 거버넌스가 저장한 검토된 cw20 코드로 측정했습니다(혼잡 계수 1x). 같은 블록에서 같은 코드를 반복 호출하면 실제로는 약 30,500 가스만 추가됩니다. 시뮬레이션은 트랜잭션이 실제로 사용하는 것보다 더 많이 보고합니다. 항상 콜드 로드를 부과하고 혼잡에 대한 여유분을 더하기 때문입니다. 3회 호출은 1,326,504로 시뮬레이션되었고 646,169가 사용되었습니다. 수치는 코드와 호출에 따라 달라지므로, 자신의 컨트랙트로 직접 측정하세요. 자세히 말하면, 로드 비용은 블록에서 해당 코드의 첫 호출에 전액 부과되고, 같은 블록에서 그 코드에 대한 다음 8회 호출은 로드 비용이 없으며, 이후 호출은 각각 로드 비용의 8분의 1을 지불합니다. 로드된 코드 집합은 매 블록마다 비어 있는 상태로 시작하므로 모든 검증인이 같은 호출에 같은 비용을 부과합니다. 이는 인스턴스화, 실행, 마이그레이션, 그리고 다른 컨트랙트나 크로스 VM 브리지에서 이루어지는 호출에 적용됩니다.

**고정(pinned)된 코드는 로드 비용을 건너뜁니다.** 거버넌스는 인기 있는 코드를 고정하여 검증인이 로드된 상태로 유지하게 할 수 있으며, 고정된 코드에 대한 호출은 로드 비용을 지불하지 않습니다. 어떤 코드가 고정되어 있는지 확인하세요.

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/codes/pinned
```

### 호출 설정과 메모리 {#setup}

모든 호출은 소액의 설정 비용(기본 비용, 초기 메모리 64 KiB 페이지당 비용, 데이터 세그먼트당 비용)과 메모리를 늘릴 때 페이지당 부과되는 비용도 지불합니다. 메모리를 작게 유지하는 컨트랙트가 더 저렴합니다.

### 혼잡 가격 책정 {#congestion}

컨트랙트 실행 가스에는 **혼잡 계수**가 곱해집니다.

| 속성 | 값 |
| -------- | ----- |
| 범위 | 기본적으로 1x에서 20x까지 |
| 거버넌스 상한 | 거버넌스가 최대값을 100x까지 설정할 수 있음 |
| 오르는 때 | 블록이 가득 찼을 때만: 컨트랙트 예산의 절반(기본 목표)을 넘게 사용한 블록 뒤에 계수가 오르고, 예산이 소진되었다면 더 빠르게 오릅니다 |
| 내리는 때 | 목표보다 적게 사용한 블록 뒤 |

이 계수는 컨트랙트 실행에만 곱해집니다. 스토리지, 호출 설정, 코드 업로드에는 곱해지지 않습니다. 위의 전송을 측정했을 때 계수는 1x였습니다.

현재 값을 읽으세요.

```bash
qorechaind query crossvm params --node https://rpc-testnet.qore.host:443
```

확인할 필드는 `wasm_congestion_factor_micro`(적용 중인 계수이며 백만분율이므로 `1000000`이 1x), `wasm_congestion_max_factor`, `wasm_congestion_target_bps`, `max_block_wasm_gas`, `max_tx_wasm_share_bps`입니다.

### 블록당 컨트랙트 예산 {#budget}

각 블록에는 컨트랙트 작업 예산이 있습니다. 기본값은 다음과 같습니다.

| 파라미터 | 기본값 | 의미 |
| --------- | ------- | ------- |
| `max_block_wasm_gas` | 3,000,000 | 한 블록에서 모든 트랜잭션이 함께 사용할 수 있는 컨트랙트 실행량 |
| `max_tx_wasm_share_bps` | 5,000 (절반) | 한 트랜잭션이 사용할 수 있는 해당 예산의 비율이며, 기본값에서는 1,500,000 |
| `queue_wasm_reserve_bps` | 2,500 | 대기 중인 비동기 크로스 VM 호출을 위해 예약된 예산 비율 |

예산이 트랜잭션의 컨트랙트 작업을 거부하면 트랜잭션은 실패하고("block wasm gas budget exhausted") 다른 실패한 트랜잭션처럼 수수료를 지불합니다. 가득 찬 예산으로 시작하는 다음 블록에서 다시 시도하세요. 우선순위 수수료는 예산이 소진되기 전인 블록 초반에 포함되도록 도와줍니다. 한 트랜잭션의 몫보다 더 많이 필요한 단일 호출은 거버넌스가 예산이나 몫을 올릴 때까지 실행할 수 없습니다.

### 시뮬레이션과 안전 여유분 {#simulation}

시뮬레이션은 **항상 콜드 로드를 부과**하여, 호출이 블록에서 해당 코드의 첫 호출인 것처럼 계산하고, 다음 블록이 사용할 혼잡 계수에 상승 두 단계를 더한 값(실행 부분에서 약 2.25x)으로 실행 가격을 책정합니다. 따라서 추정치는 부하가 몇 블록 동안 오르더라도 유효합니다. 첫 호출에 대해서는 결코 너무 낮지 않습니다.

이 때문에 모든 컨트랙트 메시지에 다음 규칙을 사용하세요.

1. 트랜잭션을 시뮬레이션합니다.
2. 시뮬레이션된 가스에 **최소 1.3**을 곱합니다.
3. 그 결과를 가스 한도로 사용하되, 트랜잭션 상한을 넘지 마세요.

### 트랜잭션 상한 {#tx-cap}

Cosmos 트랜잭션은 **50,000,000**을 넘는 가스 한도를 설정할 수 없습니다. 상한을 넘는 트랜잭션은 수수료가 부과되기 전에 거부됩니다.

## 업로드 규칙 {#upload}

코드 업로드(`MsgStoreCode`)는 계속 **거버넌스가 통제**합니다. 두 네트워크 모두에서 `code_upload_access`가 `Nobody`이므로 코드는 거버넌스 제안을 통해 저장됩니다. 언제든 확인하세요.

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/codes/params
```

v3.2.8부터 업로드는 비용이 낮은 검사부터 정해진 순서로 확인됩니다.

1. **접근 권한.** 발신자가 업로드 규칙에서 허용되어야 합니다. 멤풀은 허용된 발신자의 업로드 메시지만 받아들입니다.
2. **선언된 크기에 대한 가스를 미리.** 트랜잭션은 선언한 모듈 크기에 해당하는 가스가 남아 있어야 하며, 그렇지 않으면 아무것도 압축 해제되기 전에 즉시 가스 부족으로 실패합니다.
3. **한 번의 검사.** 모듈은 선언된 크기를 넘지 않도록 한 번만 압축 해제되어 아래 제한에 대해 검사됩니다. gzip 업로드는 선언한 크기로 압축이 풀리는 정확히 하나의 gzip 멤버여야 합니다.
4. **스토리지와 컴파일.** 스토리지는 바이트당 부과되고, 이후 모듈이 컴파일됩니다.

일반적인 업로드 비용: **cw20은 약 990만 가스**, **cw721은 약 2,280만 가스**입니다. 제한 내에서 가장 빽빽한 업로드는 약 3,200만 가스이며, 이는 여전히 50,000,000 상한 안입니다.

### 모듈 제한 {#module-limits}

| 제한 | 값 |
| ----- | ----- |
| 함수 | 최대 4,096 |
| 함수 타입 | 최대 512 |
| 컴파일된 크기(보수적 추정) | 최대 32 MiB |
| 익스포트 | 최대 128 |
| 글로벌 | 최대 256 |
| 엘리먼트 세그먼트 | 최대 16, 전체 항목 최대 2,500 |
| 데이터 세그먼트 | 최대 1,024 |
| 초기 메모리 | 최대 64 페이지(4 MiB) |
| 커스텀 섹션 | 합계 최대 128 KiB |
| 부동소수점 연산 | 허용되지 않음 |

부동소수점 명령은 검증인 하드웨어마다 결정적이지 않기 때문에 거부됩니다. `cosmwasm-std`의 정수 또는 소수 타입으로 컨트랙트를 작성하고, 거버넌스에 제출하기 전에 빌드에 부동소수점 명령이 없는지 확인하세요.

이 제한은 **이미 저장된 코드에 대해서도 호출 시점에** 검사되므로, 이전에 저장된 코드가 제한을 어기면(예: 부동소수점) 호출될 때 거부됩니다. 표준 cw20 및 cw721 템플릿과 릴리스 컨트랙트로 빌드한 컨트랙트는 모든 제한을 충분히 만족합니다.

## 실습 예제: cw20 전송 추정 및 실행 {#worked-example}

메시지는 표준 cw20 `transfer`입니다: `{"transfer": {"recipient": "qor1...", "amount": "1000"}}`. 예제는 테스트넷을 사용합니다.

### CLI {#example-cli}

CLI가 `--gas auto`로 시뮬레이션하게 하고, 1.3 이상의 조정값을 사용하세요. 이 매뉴얼의 다른 부분과 마찬가지로 `--generate-only`로 트랜잭션을 만들고 `tx pqc cosign`으로 서명합니다([하이브리드 서명](/cli-reference/transaction-commands#hybrid-signing) 참고).

```bash
qorechaind tx wasm execute <contract-addr> \
  '{"transfer":{"recipient":"qor1recipient...","amount":"1000"}}' \
  --from mykey \
  --gas auto --gas-adjustment 1.3 --gas-prices 0.15uqor \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

네트워크 최저 수수료는 가스 1단위당 0.1 uqor이며, `0.15uqor`는 여유를 둔 값입니다. 같은 코드의 다른 사용자와 같은 블록에서 컨트랙트가 자주 호출되더라도, 시뮬레이션된 한도에는 이미 콜드 로드가 포함되어 있습니다.

### TypeScript {#example-ts}

시뮬레이션하고, 1.3을 곱하고, 상한을 확인한 다음, 하이브리드 빌더로 전송합니다. 이는 전체 import와 계정의 ML-DSA-87 키 등록이 담긴 [QoreChain Native SDK 가이드](/sdk/guides/cosmwasm#gas)를 따릅니다.

```ts
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { checkCosmosGasLimit, COSMOS_TX_MAX_GAS } from "@qorechain/sdk";

const cwClient = await SigningCosmWasmClient.connectWithSigner(
  "https://rpc-testnet.qore.host",
  signer,
);

const msgs = [
  {
    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
    value: MsgExecuteContract.fromPartial({
      sender,
      contract: contractAddress,
      msg: new TextEncoder().encode(
        JSON.stringify({ transfer: { recipient, amount: "1000" } }),
      ),
      funds: [],
    }),
  },
];

const simulatedGas = await cwClient.simulate(sender, msgs, undefined);
const gas = Math.ceil(simulatedGas * 1.3);
checkCosmosGasLimit(gas); // throws above COSMOS_TX_MAX_GAS (50,000,000)

const gasPrice = 0.15; // uqor per unit of gas
const fee = {
  amount: [{ denom: "uqor", amount: String(Math.ceil(gas * gasPrice)) }],
  gas: String(gas),
};
// Pass `fee` and `msgs` to signAndBroadcastHybrid exactly as in the SDK guide.
```

SDK 0.14.0은 같은 규칙을 직접 적용합니다. 50,000,000을 넘는 Cosmos 가스 한도는 서명 전에 거부하고, CosmWasm 및 크로스 VM 트랜잭션에는 시뮬레이션된 가스의 1.3배 이상을 부여하며, 이들에 고정 폴백 값을 쓰지 않습니다. `carriesWasmExecution(messages)`는 메시지 목록에 시뮬레이션된 가스가 필요한지 알려 주며, `WASM_GAS_MULTIPLIER_MIN`은 최소값 1.3입니다. CosmJS 클라이언트가 수수료로 `"auto"`를 받는 경우에는 클라이언트가 대신 시뮬레이션합니다.

### 테스트넷에서 검증됨 {#example-tested}

이 실행은 2026년 11월 12일 `qorechain-diana`(릴리스 v3.2.8)에서 eth-native 계정, TypeScript SDK 0.13.0, 거버넌스가 저장한 cw20 코드(코드 ID 859)로 수행했습니다. 트랜잭션에 서명하고, 서명된 바이트를 REST 시뮬레이션 경로로 보낸 뒤, 시뮬레이션된 가스에 1.3을 곱해 실제 트랜잭션을 전송합니다.

```ts
import { Registry } from "@cosmjs/proto-signing";
import { wasmTypes } from "@cosmjs/cosmwasm-stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { EthNativeSigner, qorechainRegistryTypes } from "@qorechain/sdk";

const registry = new Registry([...qorechainRegistryTypes, ...wasmTypes]);
const signer = new EthNativeSigner(account, { rest: REST, registry });
const signBytesVersion = await signer.resolveSignBytesVersion(CHAIN_ID);

// 1. Sign once with a generous limit, then ask the node what the call needs.
const base = { chainId: CHAIN_ID, accountNumber, sequence, messages: [msg] };
const { txRawBytes } = signer.sign({
  ...base,
  fee: { amount: [{ denom: "uqor", amount: "450000" }], gas: "3000000" },
  signBytesVersion,
});
const sim = await fetch(`${REST}/cosmos/tx/v1beta1/simulate`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ tx_bytes: Buffer.from(txRawBytes).toString("base64") }),
}).then((r) => r.json());

// 2. Send it for real with the simulated gas times 1.3.
const gas = Math.ceil(Number(sim.gas_info.gas_used) * 1.3);
const res = await signer.signAndBroadcast(transport, {
  ...base,
  fee: { amount: [{ denom: "uqor", amount: String(Math.ceil(gas * 0.15)) }], gas: String(gas) },
});
```

실행 결과는 다음과 같습니다.

| 단계 | 결과 |
| ---- | ------ |
| cw20 인스턴스화(코드 859): 시뮬레이션 후 그 값에 1.3을 곱해 전송 | 시뮬레이션 634,956; 한도 825,443; 코드 0, 사용 가스 629,267 |
| cw20 `transfer`: 시뮬레이션 | 591,280 가스 |
| 고정 한도 400,000으로 같은 전송 | 거부됨: `out of gas in location: wasm code load; gasWanted: 400000, gasUsed: 564549` (수수료는 여전히 부과됨) |
| 시뮬레이션 x 1.3(768,664)으로 같은 전송 | 코드 0, 사용 가스 585,151 |
| 한 트랜잭션에서 전송 3회, 시뮬레이션 x 1.3(1,724,456) | 코드 0, 사용 가스 646,169 |

고정 한도 400,000은 블록에서 해당 코드의 첫 호출에 실패하지만, 시뮬레이션된 한도는 실패하지 않습니다. 수수료는 요청한 한도를 기준으로 정해지므로(이 실행에서는 가스 1단위당 0.15 uqor) 여유분이 클수록 수수료도 커집니다. 5가 아니라 1.3을 사용하세요.

### Python, Go, Rust, Java {#example-other}

이들 SDK는 각각 REST 경로로 시뮬레이션하고 그 결과로 한도를 정합니다. 시뮬레이션 경로는 트랜잭션 구조를 요구하므로 완전히 조립된(서명된) 트랜잭션이 필요합니다. CosmWasm 실행, 인스턴스화, 마이그레이션(및 크로스 VM 호출)에 대해 SDK는 한도를 시뮬레이션된 가스의 최소 1.3배로 올립니다. 어느 SDK에도 바로 쓸 수 있는 cw20 또는 CosmWasm 메시지 빌더는 없으므로, protobuf 라이브러리로 `MsgExecuteContract`를 만들고 서명된 바이트를 전달하세요.

**Python**(`qorechain-sdk`, `qorsdk`): `estimate_gas`와 `auto_fee`는 빌드된 트랜잭션을 받아 wasm 메시지에 1.3 하한을 적용합니다.

```python
from qorsdk import auto_fee, estimate_gas

rest = "https://api-testnet.qore.host"
gas = estimate_gas(rest, built, gas_multiplier=1.3)   # raises above the 50,000,000 cap
fee = auto_fee(rest, built, gas_multiplier=1.3, gas_price="0.15uqor")
```

**Go**(`github.com/qorechain/qorechain-sdk/packages/go/qorechain/tx`): `EstimateGas`는 시뮬레이션된 가스를 반환하고, `WasmGasWanted`는 1.3 하한을 적용하며, `EstimateFee`는 전달한 배수로 가격을 책정합니다(하한을 직접 추가하지 않으므로 1.3 이상을 전달하세요).

```go
used, err := tx.EstimateGas("https://api-testnet.qore.host", txBytes, nil)
if err != nil { return err }
gas := tx.WasmGasWanted(used, 1.3)

fee, err := tx.EstimateFee("https://api-testnet.qore.host", txBytes, 1.3, "0.15uqor", nil)
```

**Rust**(`qorechain-sdk`): `estimate_gas_wanted`는 wasm 및 크로스 VM 메시지에 대해 한도를 시뮬레이션된 가스의 최소 1.3배로 올리고, `estimate_fee`는 그에 대한 가격을 책정합니다.

```rust
use qorechain_sdk::tx::{estimate_fee, estimate_gas_wanted};

let est = estimate_gas_wanted("https://api-testnet.qore.host", &tx_bytes, 1.3).await?;
// est.simulated, est.gas_wanted
let fee = estimate_fee("https://api-testnet.qore.host", &tx_bytes, 1.3, "0.15uqor").await?;
```

**Java**(`io.github.qorechain.tx.AutoGas`): 트랜잭션에 wasm 또는 크로스 VM 메시지가 포함되어 있으면 마지막 인자로 `true`를 전달하세요.

```java
AutoGas.Estimate est = AutoGas.estimate(
    "https://api-testnet.qore.host", txBytes, /* hybrid */ true, 1.3, null, /* wasmOrCrossVm */ true);
// est.simulatedGas, est.gasWanted
```

### REST 시뮬레이션 경로 {#example-rest}

서명된 트랜잭션의 base64를 담아 `POST /cosmos/tx/v1beta1/simulate`를 호출하면 `gas_info.gas_used`가 반환됩니다. 여기에 1.3을 곱해 한도로 사용하세요.

```bash
curl -s -X POST https://api-testnet.qore.host/cosmos/tx/v1beta1/simulate \
  -H 'Content-Type: application/json' \
  -d '{"tx_bytes":"<base64 of the signed TxRaw>"}'
```

응답에는 `gas_info.gas_used`(문자열)가 들어 있습니다. 이 경로는 POST만 받으며, `GET`은 `501 Not Implemented`로 응답합니다.

## 제한과 오류 {#limits-errors}

| 상황 | 보이는 현상 | 대처 방법 |
| --------- | ------------ | ---------- |
| 가스 한도가 50,000,000 초과 | 수수료가 부과되기 전에 거부됨 | 한도를 낮추고, 작업을 여러 트랜잭션으로 나누세요 |
| 컨트랙트 호출에서 가스 부족 | 트랜잭션이 가스 부족 오류로 실패 | 시뮬레이션하고 결과의 최소 1.3배를 사용하세요. 고정값을 재사용하지 마세요 |
| 블록의 컨트랙트 예산 소진 | block wasm gas budget을 언급하는 실패, 수수료 지불됨 | 다음 블록에서 다시 시도하세요. 필요하면 우선순위 수수료를 추가하세요 |
| 한 호출이 트랜잭션의 몫보다 많이 필요함 | 매번 실패 | 거버넌스에 예산이나 몫을 올려 달라고 요청하거나, 호출을 더 저렴하게 만드세요 |
| 접근 권한이 없는 발신자의 업로드 | 접수 단계에서 거부됨 | 거버넌스 제안으로 코드를 제출하세요 |
| 선언된 크기에 충분한 가스가 없는 업로드 | 즉시 가스 부족 | 선언된 크기를 감당할 가스를 설정하세요(cw20은 약 990만) |
| 모듈 제한을 넘는 업로드 | 업로드 시 거부됨 | 함수, 익스포트, 글로벌, 세그먼트 또는 메모리를 줄이세요(위 표 참고) |
| 모듈에 부동소수점 명령 포함 | 업로드 시 거부되며, 저장된 코드는 호출 시 거부됨 | 빌드에서 부동소수점 연산을 제거하세요 |
| 하나의 멤버가 아니거나 크기가 틀린 gzip 업로드 | 거부됨 | 올바른 크기의 단일 gzip 스트림으로 모듈을 압축하세요 |

## 관련 페이지 {#related}

- [QoreChain Native 가이드(SDK): 컨트랙트 호출 가스](/sdk/guides/cosmwasm#gas)
- [QoreChain Native 개발](/developer-guide/cosmwasm-development)
- [크로스 VM 상호운용성](/developer-guide/cross-vm-interoperability)
- [하이브리드 서명과 `tx pqc cosign`](/cli-reference/transaction-commands#hybrid-signing)
- [거버넌스](/user-guide/governance)
