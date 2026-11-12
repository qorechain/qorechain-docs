---
slug: /developer-guide/evm-window-reference
title: EVM 인가 윈도우 레퍼런스 (v3.2.8)
sidebar_label: EVM 윈도우 레퍼런스
sidebar_position: 7
---

# EVM 인가 윈도우 레퍼런스 (v3.2.8)

이더리움 트랜잭션에는 secp256k1 서명 하나만 들어 있고 다른 것은 없으므로, QoreChain이 다른 모든 트랜잭션에 요구하는 포스트 퀀텀(ML-DSA-87) 서명을 담을 수 없습니다. **EVM 인가 윈도우**가 이 간극을 메웁니다. 계정이 먼저 포스트 퀀텀 키로 서명된 QoreChain Native 메시지로 제한된 윈도우를 열고, 그러면 EVM 레인은 윈도우가 허용하는 동안에만 해당 계정의 일반 MetaMask, ethers.js, Hardhat, Foundry 트랜잭션을 받아들입니다. 이 페이지는 릴리스 **v3.2.8**에서 윈도우가 동작하는 방식에 대한 전체 레퍼런스입니다.

:::note v3.2.8이 실행되는 곳
**`qorechain-diana`** 테스트넷은 2026년 11월 12일부터 **v3.2.8**을 실행해 왔습니다. **`qorechain-vladi`** 메인넷은 아직 적용하지 않았으며, 메인넷에서는 윈도우가 [EVM 개발](/developer-guide/evm-development#evm-window)에 설명된 대로 동작하고 아래에서 "v3.2.8"로 표시된 옵션과 규칙은 없습니다. v3.2.8 미만의 노드는 새 목록을 설정하는 윈도우 메시지를 거부합니다.
:::

## 중요한 이유 {#why}

- **탈취된 클래식 키의 가치는 열려 있는 윈도우가 허용하는 만큼뿐입니다.** 윈도우는 시간(블록), 트랜잭션 수, 나갈 수 있는 QOR, 그리고 선택적으로 계정이 접근할 수 있는 컨트랙트를 제한합니다.
- **포스트 퀀텀 키가 계속 주도합니다.** 윈도우를 열고, 좁히고, 닫는 것은 모두 하이브리드 서명된 Native 메시지입니다. 클래식 키만으로는 윈도우를 열 수 없습니다.
- **v3.2.8은 기본값을 더 엄격하게 만듭니다.** 표준 프리컴파일 메서드는 기본적으로 거부되고, 다른 컨트랙트가 확인하는 서명에는 윈도우의 동의가 필요하며, 포스트 퀀텀 키를 변경하면 윈도우가 닫힙니다.

v3.2.8에서 추가된 사항의 요약은 [v3.2.8에서 추가된 윈도우 옵션](/developer-guide/evm-development#evm-window-v328)에 있으며, 이 페이지는 그것을 전부 반복하지 않고 예제, 필드 레퍼런스, 오류 표를 더합니다. 첫 윈도우의 단계별 안내는 [첫 트랜잭션](/getting-started/first-transaction#evm-window)을 참고하세요.

## 열기, 닫기, 읽기 {#lifecycle}

| 동작 | 메시지 | CLI | REST |
| ------ | ------- | --- | ---- |
| 열기(열려 있는 윈도우를 대체) | `/qorechain.pqc.v1.MsgOpenEVMWindow` | `qorechaind tx pqc open-evm-window [blocks] [max-txs] [max-value]` | 없음(트랜잭션) |
| 즉시 닫기 | `/qorechain.pqc.v1.MsgCloseEVMWindow` | `qorechaind tx pqc close-evm-window` | 없음(트랜잭션) |
| 읽기 | 없음 | `qorechaind q pqc evm-window <address>` | `GET /qorechain/pqc/v1/evm_window/{address}` |

열기와 닫기는 Native 레인 트랜잭션이며 계정의 하이브리드(클래식 + ML-DSA-87) 서명이 필요하고, 윈도우를 열려면 계정에 등록된 포스트 퀀텀 키가 이미 있어야 합니다. 윈도우를 닫으면 대기 중인 EIP-7702 동의도 철회됩니다. 윈도우를 열면 **계정의 nonce가 증가**하므로(Native 시퀀스가 곧 EVM nonce), 먼저 윈도우를 열고 그 후에 EVM nonce를 읽으세요.

### CLI {#cli}

`--generate-only`로 트랜잭션을 만든 다음 `tx pqc cosign`으로 포스트 퀀텀 서명을 추가합니다. 릴리스 `qorechaind` 바이너리에는 `gen-key`와 `cosign`이 있으며, 커뮤니티 빌드에는 없습니다.

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana

# Open: 7,200 blocks, 20 transactions, 100 QOR cap (value plus maximum fees)
qorechaind tx pqc open-evm-window 7200 20 100qor \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window.json

qorechaind tx pqc cosign window.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

인자를 생략하면 CLI는 배포 세션에 맞춘 기본값을 사용합니다. 3,600 블록, 10 트랜잭션, 25 QOR입니다. 하나의 컨트랙트로 범위가 제한된 윈도우는 한 검증인에게 위임하고 하나의 IBC 수신자에게 전송할 수도 있습니다.

```bash
qorechaind tx pqc open-evm-window 600 5 100qor \
  --allowed-targets 0x0000000000000000000000000000000000000800 \
  --staking-validators qorvaloper1... \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window.json
```

예를 들어 클래식 키가 노출되었다고 생각되면 윈도우를 일찍 닫으세요. 윈도우가 아직 허용하던 것은 다음 블록부터 거부됩니다.

```bash
qorechaind tx pqc close-evm-window \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 40000uqor --generate-only > close.json

qorechaind tx pqc cosign close.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

윈도우를 읽습니다.

```bash
qorechaind q pqc evm-window <qor1-address> --node $QNODE
```

`live: true`와 함께 `remaining_blocks`, `remaining_txs`, `remaining_value`(uqor)가 보이면 정상입니다. 명령 레퍼런스는 [트랜잭션 명령](/cli-reference/transaction-commands#open-evm-window)에 있습니다.

### REST {#rest}

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_window/<qor1-address>
```

윈도우가 없는 계정은 `found: false`와 함께 HTTP 200으로 응답하므로 이 경로는 폴링해도 안전합니다. 모든 숫자는 JSON 문자열입니다. 저장된 윈도우는 만료되었거나 소진되었을 수 있습니다. `live`는 현재 높이에서 값이 0인 트랜잭션을 하나 이상 더 허용하는지를 알려 줍니다.

### TypeScript {#typescript}

윈도우 헬퍼는 `@qorechain/sdk`에 있습니다(서명 설정은 [SDK EVM 가이드](/sdk/guides/evm#evm-window-scope) 참고). `openEvmWindowMsg`는 아래의 모든 필드를 받고, `closeEvmWindowMsg`는 닫기 메시지를 만들고, `fetchEvmWindow`는 윈도우를 읽고, `classifyEvmWindowRejection`은 거부 사유를 설명합니다.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  openEvmWindowMsg,
  closeEvmWindowMsg,
  fetchEvmWindow,
} from "@qorechain/sdk";

const REST = "https://api-testnet.qore.host";
const client = createClient({
  network: "testnet",
  endpoints: { rest: REST, rpc: "https://rpc-testnet.qore.host", evmRpc: "https://evm-testnet.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic); // already registered on chain
const tx = await client.connectTx(signer, { pqcKeypair });         // signs hybrid

// Open a window that may call one token contract and delegate to one validator.
await tx.signAndBroadcast(
  [
    openEvmWindowMsg({
      sender: account.address,
      blocks: 7200,
      maxTxs: 20,
      maxValue: "100000000",                 // uqor: value PLUS the maximum fee of each transaction
      allowedTargets: ["0x0000000000000000000000000000000000000800"],
      stakingValidators: ["qorvaloper1..."],
    }),
  ],
  "auto",
);

// Read it back (opens first, then read the nonce).
const w = await fetchEvmWindow({ rest: REST, address: account.address });
console.log(w.live, w.remainingBlocks, w.remainingTxs, w.remainingValue);

// Close it early.
await tx.signAndBroadcast([closeEvmWindowMsg(account.address)], "auto");
```

`openEvmWindowMsg`는 서명하기 전에 한도와 목록 형식을 검사하므로, 실수가 있으면 거부된 트랜잭션으로 비용을 치르는 대신 로컬에서 실패합니다. `MAX_EVM_WINDOW_BLOCKS`와 `MAX_EVM_WINDOW_TXS`가 한도를 내보냅니다. 읽기(`fetchEvmWindow`)는 한도, 카운터, v3.2.3 범위(`nativeOnly`, `allowedTargets`)를 반환하며, `validators`(컨트랙트 주소), `stakingValidators`(`qorvaloper1...`), `ibcReceivers`(`"<channel>/<receiver>"`)는 v3.2.8 목록을 담은 SDK 0.14.0부터 빌더가 받으며, 읽기는 이를 반환하지 않으므로 REST로 읽으세요. 위 예제는 `stakingValidators`를 사용하며, SDK 0.14.0으로 실행해 보지는 않았습니다. 세 목록은 v3.2.8을 실행하는 네트워크에서만 설정하세요. 그보다 낮은 노드는 이를 설정한 윈도우 메시지를 거부합니다. 하이브리드 서명을 하는 `connectTx`에서는 포스트 퀀텀 키가 이미 등록되어 있어야 합니다.

### 테스트넷에서 검증됨 {#tested}

2026년 11월 12일 `qorechain-diana`(릴리스 v3.2.8)에서 포스트 퀀텀 키를 등록한 eth-native 계정으로, SDK 0.13.0(`openEvmWindowMsg`, `closeEvmWindowMsg`, `fetchEvmWindow`)과 하이브리드 서명을 사용해 실행했습니다. 윈도우 필드 `validators`, `staking_validators`, `ibc_receivers`는 SDK 0.13.0 빌더에 없었으며, SDK 0.14.0이 이를 `openEvmWindowMsg`에 추가합니다. 이 실행에서는 사용하지 않았습니다(SDK 0.13.0에서는 이 필드에 명령줄을 사용하세요).

| 단계 | 결과 |
| ---- | ------ |
| 열기 전 `GET /qorechain/pqc/v1/evm_window/{address}` | `found: false`, `live: false` |
| 열기: 300 블록, 5 트랜잭션, 1,000,000 uqor | 코드 0, 사용 가스 187,282. 다시 읽기: `found: true`, `live: true`, `opened_height` 9942089, `expiry_height` 9942389, `max_txs` 5, `max_value` 1000000, `remaining_blocks` 297, `native_only: false`, `allowed_targets: []` |
| `nativeOnly: true`로 다시 열기 | 코드 0, 사용 가스 187,803. 새 윈도우가 이전 윈도우를 대체함: `native_only: true`, 새로운 `opened_height` |
| 닫기 | 코드 0, 사용 가스 170,468. 다시 읽기: `found: false` |

같은 날 SDK 0.14.0으로, `allowedTargets`(스테이킹 프리컴파일 주소), `stakingValidators`(검증인 운영자 주소 하나), `ibcReceivers`(`channel-0/...` 쌍 하나)를 지정해 연 윈도우가 코드 0, 사용 가스 195,233으로 성공했습니다. REST 읽기에는 `allowed_targets`가 나열되었고 `found: true`, `live: true`가 반환되었습니다. `validators`, `staking_validators`, `ibc_receivers` 목록은 반환하지 않으므로, 윈도우를 열 때 사용한 값을 직접 보관하세요.

`fetchEvmWindow`는 같은 필드를 카멜 케이스(`openedHeight`, `remainingBlocks`, `nativeOnly`, `allowedTargets`)로 반환했습니다. 열기와 닫기는 하이브리드 서명된 Cosmos 트랜잭션이므로, 계정이 처음 보내는 트랜잭션은 먼저 키를 등록해야 합니다.

### Python, Go, Rust, Java {#other-languages}

각 SDK에는 메시지 빌더와 REST 읽기가 있습니다. 모두 체인의 한도를 로컬에서 검사합니다. v3.2.8 목록을 설정하는 언어별 빌더는 SDK 0.14.0 이상이 필요하며(Java는 Maven Central에 나타난 뒤의 0.14.0이며, Maven Central에는 2026년 11월 12일 기준 0.13.0이 그대로 표시됩니다), 이전 릴리스는 이전 필드만 빌드합니다.

| 언어 | 열기(모든 목록 포함) | 닫기 | 읽기 | EVM 한도 |
| -------- | ---------------------- | ----- | ---- | ---------- |
| Python | `msg.pqc.open_evm_window(sender=, blocks=, max_txs=, max_value=, native_only=, allowed_targets=, validators=, staking_validators=, ibc_receivers=)` | `msg.pqc.close_evm_window(sender=)` | `get_evm_window(rest, address)` | `fetch_evm_limits(rest)` |
| Go | `messages.NewOpenEVMWindowWithScope(sender, blocks, maxTxs, maxValue, scope)`, `messages.EVMWindowScope` 사용 | `messages.NewCloseEVMWindow(sender)` | `rest.GetEVMWindowStatus(address)` | `rest.GetEVMLimits()` |
| Rust | `msg::pqc::open_evm_window_with_scope_any(sender, blocks, max_txs, max_value, &scope)`, `EvmWindowScope` 사용 | `msg::pqc::close_evm_window_any(sender)` | `get_evm_window(&rest, address)` | 아직 헬퍼 없음. REST 경로를 읽으세요 |
| Java | `EvmWindow.openWithPolicy(sender, blocks, maxTxs, maxValue, nativeOnly, allowedTargets, validators, stakingValidators, ibcReceivers)` | `EvmWindow.close(sender)` | `rest.evmWindow(address)` | `rest.evmLimits()` |

Python:

```python
from qorsdk import RestClient, get_network, get_evm_window, msg

sender = "qor1..."
open_msg = msg.pqc.open_evm_window(
    sender=sender,
    blocks=7200,
    max_txs=20,
    max_value="100000000",  # uqor, integer string
    allowed_targets=["0x0000000000000000000000000000000000000800"],
    staking_validators=["qorvaloper1..."],
)
# broadcast it through the usual hybrid path, then:
rest = RestClient(get_network("testnet").endpoints.rest)
status = get_evm_window(rest, sender)
print(status.live, status.remaining_blocks, status.remaining_txs, status.remaining_value)
close_msg = msg.pqc.close_evm_window(sender=sender)
```

Go:

```go
open, err := messages.NewOpenEVMWindowWithScope(sender, 7200, 20, "100000000",
    messages.EVMWindowScope{
        AllowedTargets:    []string{"0x0000000000000000000000000000000000000800"},
        StakingValidators: []string{"qorvaloper1..."},
    })
status, err := rest.GetEVMWindowStatus(sender)
closeMsg, err := messages.NewCloseEVMWindow(sender)
```

Rust:

```rust
use qorechain::evm_window::{get_evm_window, EvmWindowScope};
use qorechain::msg;

let scope = EvmWindowScope {
    allowed_targets: vec!["0x0000000000000000000000000000000000000800".into()],
    staking_validators: vec!["qorvaloper1...".into()],
    ..Default::default()
};
let open = msg::pqc::open_evm_window_with_scope_any("qor1...", 7200, 20, "100000000", &scope)?;
let status = get_evm_window(&rest, "qor1...").await?;
let close = msg::pqc::close_evm_window_any("qor1...");
```

Java:

```java
TypedMessage open = EvmWindow.openWithPolicy(sender, 7200, 20, "100000000",
    false,
    List.of("0x0000000000000000000000000000000000000800"), // allowedTargets
    null,                                                   // validators
    List.of("qorvaloper1..."),                              // stakingValidators
    null);                                                  // ibcReceivers
EvmWindowStatus status = rest.evmWindow(sender);
TypedMessage close = EvmWindow.close(sender);
```

SDK는 윈도우를 대신 열어 주지 않습니다. 윈도우는 지출을 허가하는 것이므로, 이 단계는 명시적으로 사용자에게 보이도록 유지됩니다.

## 필드 {#fields}

| 필드(CLI 플래그) | 제한 | 의미 |
| ---------------- | ----- | ------- |
| `blocks`(첫 번째 인자) | 1 ~ 17,280 | 윈도우는 열린 높이에 `blocks`를 더한 이후로는 아무것도 허용하지 않습니다. 기간이 아니라 블록 수이며, 현재 블록 시간 기준으로 테스트넷에서 약 5시간, 메인넷에서 약 15시간입니다 |
| `max_txs`(두 번째 인자) | 1 ~ 1,000 | 허용하는 EVM 트랜잭션 수 |
| `max_value`(세 번째 인자) | 양수 | 윈도우가 계정에서 내보내도록 허용하는 총 uqor: 전송된 값 **더하기** 허용된 모든 트랜잭션의 최대 수수료(가스 한도 곱하기 수수료 상한) |
| `native_only`(`--native-only`) | true 또는 false | 일반 QOR 전송만 허용: calldata, 컨트랙트 생성, 코드를 가진 수신자, EIP-7702 인가 모두 불가 |
| `allowed_targets`(`--allowed-targets`) | 최대 16개의 `0x` 주소, 중복 없음 | 이 주소로 보내는 트랜잭션만 허용하며, 컨트랙트 생성은 거부됩니다 |
| `validators`(`--validators`) | 최대 16개의 `0x` 주소, 중복 없음 | 계정 서명에 대한 검사가 계정 자신의 동작에 대해 인정되는 컨트랙트: 지갑 컨트랙트가 호출하는 검증 모듈 또는 ERC-4337 엔트리 포인트. v3.2.8 |
| `staking_validators`(`--staking-validators`) | 최대 16개의 `qorvaloper...` 주소, 중복 없음 | 계정이 윈도우를 통해 위임하거나 재위임할 수 있는 검증인. v3.2.8 |
| `ibc_receivers`(`--ibc-receivers`) | 최대 16개 항목 `<channel>/<receiver>`, 항목당 최대 256자, 공백이나 쉼표 없음 | 네이티브 QOR IBC 전송이 갈 수 있는 정확한 목적지. 바이트 단위로 비교되므로 `channel-0`과 소문자 bech32 수신자를 전송이 담고 있는 그대로 적으세요. v3.2.8 |

모든 한도를 지정해야 합니다. 체인은 누락된 값을 기본값으로 채우지 않고 거부합니다(CLI는 배포 세션 기본값을 직접 채웁니다). 어떤 한도든 소진되면 사실상 윈도우가 끝납니다. 윈도우는 계정의 포스트 퀀텀 키를 사용할 수 있는 동안에만, 즉 비어 있지 않고, 클래식 전용이 아니며, 거버넌스에 의해 비활성화되지 않은 동안에만 동작합니다.

### 윈도우가 계산하는 것 {#counting}

접수 시점, 즉 트랜잭션이 실행되기 전에 각 EVM 트랜잭션은 `max_txs` 중 하나를 사용하고, 전송된 값에 최대 수수료를 더한 금액(18자리 EVM 단위에서 uqor로 환산해 올림)을 사용된 값에 더합니다. 접수된 후 되돌려진(revert) 트랜잭션도 자기 몫을 이미 사용한 것입니다. 실행 후에는 프리컴파일이 계정을 대신해 옮긴 네이티브 QOR(위임, 예치, IBC 전송)도 윈도우에 부과되므로, 트랜잭션 값이 0이었더라도 `max_value`에 포함됩니다.

계산되지 않는 것: `eth_call`, `eth_estimateGas`, 시뮬레이션. 토큰은 가격이 전혀 책정되지 않습니다. ERC-20 전송이나 approve는 값이 0이므로 범위(`allowed_targets`)로 제한하세요. 각 부과는 `address`, `evm_address`, `window_open_height`, `used_txs`, `used_value`, `tx_value`, `source`(접수 시 `ante`, 실행 후 부과 시 `settlement`) 속성을 가진 `pqc_evm_window_used` 이벤트를 발생시키므로, 지갑은 트랜잭션이 얼마를 가져갔는지 보여 줄 수 있습니다. 열기와 닫기는 `pqc_evm_window_opened`와 `pqc_evm_window_closed`를 발생시킵니다.

## 윈도우를 통한 표준 프리컴파일 {#precompile-allowlist}

윈도우가 인가한 계정의 경우, 표준 프리컴파일(스테이킹, 분배, ICS-20, 거버넌스, 슬래싱, ERC-20 토큰 프리컴파일)의 메서드는 표에 있고 윈도우가 `allowed_targets`에 해당 프리컴파일을 나열한 경우가 아니면 거부됩니다. 프리컴파일 주소는 [EVM 프리컴파일](/developer-guide/evm-precompiles)에 있으며, 스테이킹, 분배, ICS-20, 거버넌스는 각각 `0x...0800`, `0x...0801`, `0x...0802`, `0x...0805`입니다.

| 프리컴파일 | 메서드 | 허용되는 경우 |
| ---------- | ------ | ------------- |
| distribution | `claimRewards`, `withdrawDelegatorRewards` | 보상이 계정 자신에게 지급되는 경우(출금 주소가 자신의 주소) |
| distribution | `withdrawValidatorCommission` | 검증인이 계정 자신의 것이며 계정 자신에게 지급하는 경우 |
| distribution | `depositValidatorRewardsPool` | 검증인이 `staking_validators`에 있고 모든 코인이 네이티브 QOR인 경우 |
| staking | `delegate`, `redelegate` | 대상 검증인이 `staking_validators`에 있는 경우 |
| ICS-20 | `transfer` | 네이티브 QOR, `transfer` 포트, 메모 없음, `ibc_receivers`에 있는 쌍으로 |
| ERC-20 토큰 프리컴파일 | `transfer`, `transferFrom`, `approve` | 네이티브 QOR. 다른 토큰은 윈도우가 그 토큰의 주소를 나열한 경우에만 |

그 밖의 모든 것은 윈도우가 무엇을 나열하든 윈도우를 통해서는 거부됩니다. 언본딩, 언본딩 취소, 투표와 기타 거버넌스 동작, 출금 주소 변경, 검증인 생성 또는 편집, 언제일(unjail), 커뮤니티 풀 충전이 그렇습니다. 이런 동작은 포스트 퀀텀 서명된 Native 트랜잭션으로 보내세요. `ibc_receivers` 없이 ICS-20을 나열하면 전송이 하나도 허용되지 않으며, `staking_validators` 없이 스테이킹 프리컴파일을 나열하면 위임이 하나도 허용되지 않습니다.

무엇을 나열할지에 대한 예시:

| 목표 | 윈도우 |
| ---- | ------ |
| MetaMask에서 스테이킹 보상 청구 | 분배 프리컴파일이 포함된 `allowed_targets`. 출금 주소는 계정 자신으로 유지 |
| MetaMask에서 스테이킹 | 스테이킹 프리컴파일이 포함된 `allowed_targets`와 `staking_validators` |
| QOR를 밖으로 브리지 | ICS-20 프리컴파일이 포함된 `allowed_targets`와 `channel-0/<receiver>` 같은 `ibc_receivers` |
| ERC-20 프리컴파일로 보유한 IBC 토큰 이동 | 해당 토큰의 주소가 포함된 `allowed_targets` |

컨트랙트를 나열하는 것은 그 컨트랙트가 계정의 자산으로 할 수 있는 일에 대한 계정의 동의입니다. 계정의 토큰을 보관하는 볼트, 라우터, 토큰의 경우, 윈도우는 어떤 토큰이 어디로 이동하는지를 제한하지 않습니다.

## 컨트랙트 생성 {#contract-creation}

컨트랙트를 배포하려면 **범위가 없는** 윈도우가 필요합니다. `native_only`나 `allowed_targets`가 있는 윈도우는 컨트랙트 생성을 거부합니다. 배포 세션에서는 일반 윈도우(CLI 기본값이 하나에 맞춰져 있음)를 열고, 배포한 뒤 닫으세요. 이후 세션에서는 `--allowed-targets <contract-address>`로 윈도우를 열어 배포한 컨트랙트에 대한 호출로 제한하세요. Hardhat과 Foundry를 사용한 배포 안내는 [EVM 개발](/developer-guide/evm-development)에 있습니다.

## Permit, EIP-712 주문, Permit2 {#permits}

EIP-2612 permit, Permit2 전송, 서명된 주문, 메타 트랜잭션은 컨트랙트가 `ecrecover` 프리컴파일로 검사합니다. v3.2.8부터(네트워크가 적용한 이후 양쪽 네트워크 모두), 사용 가능한 포스트 퀀텀 키를 가진 계정의 경우 이 검사는 계정 자신의 **열려 있는** 윈도우가 **검증하는 컨트랙트**, 즉 호출을 전달하는 라우터가 아니라 토큰이나 Permit2 자체를 허용하는 동안에만 성공합니다.

1. 윈도우에 범위가 있다면 검증하는 컨트랙트를 `allowed_targets`에 나열하세요(`native_only`는 이런 서명을 허용하지 않습니다).
2. 사용자가 서명하기 **전에** 윈도우를 여세요. 열려 있는 윈도우가 없으면 서명은 유효하지 않은 것으로 처리되어 컨트랙트가 거부합니다.
3. 서명 자체는 윈도우에 절대 부과되지 않습니다. 서명은 사용되는 순간 공개되기 때문입니다.
4. 윈도우 안에서 부여한 permit이나 approve는 윈도우가 닫힌 뒤에도 남아 있습니다. 세션이 끝나면 approve를 검토하고 취소하세요.

포스트 퀀텀 기록이 없는 계정, 자신의 서명을 확인하는 위임된 지갑, 범위가 없는 윈도우에서의 발신자 본인 서명은 이전과 같이 복구됩니다. 쿼리와 가스 추정은 영향을 받지 않습니다.

## 키 변경과 EIP-7702 동의 {#key-changes}

- **포스트 퀀텀 키를 교체, 마이그레이션 또는 재등록하면 윈도우가 닫히고** 모든 EIP-7702 동의가 삭제됩니다. 이후에 윈도우를 다시 여세요. 핫 월렛과 거래소 연동에서는 이를 고려하세요.
- 윈도우, EIP-7702 동의(`MsgAuthorizeEVMDelegation`, `MsgClearEVMDelegation`), 추상 계정 관리 메시지는 계정 **자신의 최상위 하이브리드 서명 메시지**여야 합니다. authz(`MsgExec`)를 통해 보낼 수 없고 다른 계정에 부여할 수도 없으며, 이 메시지 유형의 부여는 거부됩니다. 이런 종류의 기존 동의 부여는 업그레이드 시점에 제거되었습니다.
- 다른 사람의 트랜잭션 안에서 동작하는 EIP-7702 위임 계정은 그 코드가 동작하는 순간 자신의 열려 있는 윈도우가 필요합니다. 윈도우가 없으면 해당 호출만 실패하고 호출하는 컨트랙트가 그 실패를 확인하므로, 위임된 계정에 대한 결제가 더 이상 결제자의 트랜잭션 전체를 되돌리지 않습니다.

위임에 대한 동의는 `qorechaind tx pqc authorize-evm-delegation <delegate_0x> <blocks>`로 기록하고 `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`로 읽습니다. [EIP-7702 위임](/developer-guide/evm-development#eip-7702)을 참고하세요.

## 적용 중인 한도 {#limits}

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_limits
```

테스트넷은 2026년 11월 12일에 `tx_max_gas` **30000000**과 `precompile_input_max_bytes` **16384**로 응답했습니다.

| 한도 | 값 | 의미 |
| ----- | ----- | ------- |
| `tx_max_gas` | 30,000,000 | 하나의 EVM 트랜잭션이 요청할 수 있는 최대 가스이며, 이를 넘으면 트랜잭션은 실행 전에 거부됩니다. 하나의 Native 메시지가 시작한 EVM 실행은 같은 예산을 공유합니다 |
| `precompile_input_max_bytes` | 16,384 | 보호되는 상태 변경 프리컴파일이 받는 최대 입력 |
| 윈도우 `blocks` | 17,280 | 가장 긴 윈도우 |
| 윈도우 `max_txs` | 1,000 | 한 윈도우의 최대 트랜잭션 수 |
| 목록 항목 | 목록당 16 | `allowed_targets`, `validators`, `staking_validators`, `ibc_receivers` |

응답에는 거버넌스가 설정한 값이 담긴 `limits` 객체도 들어 있습니다. 적용 중인 값인 최상위 `tx_max_gas`와 `precompile_input_max_bytes`를 읽으세요. 이 경로는 v3.2.8부터 제공되므로, 공개 메인넷은 업그레이드할 때까지 `501 Not Implemented`로 응답합니다.

일반 가스 가격으로 열린 윈도우도 최대 수수료를 계산합니다. 가스 한도 30,000,000에 수수료 상한 100 gwei이면 트랜잭션 하나당 `max_value`에 3 QOR가 계산됩니다.

## 오류 {#errors}

거부는 코드스페이스 `pqc`로 반환됩니다. EVM JSON-RPC에서는 거부가 메시지만 담고 코드스페이스는 없는 브로드캐스트 오류로 도착하므로, 텍스트로도 일치 여부를 확인하세요(SDK 분류기가 그렇게 합니다).

| 코드 | 메시지 | 원인 | 대처 방법 |
| ---- | ------- | ----- | ---------- |
| 26 | `no open EVM authorisation window` | 윈도우가 없거나, 등록된 포스트 퀀텀 키가 없거나, 윈도우가 만료됨 | 키가 없다면 먼저 등록한 뒤 윈도우를 여세요 |
| 27 | `EVM authorisation window exhausted` | 한도가 소진되었거나, 트랜잭션이 윈도우의 범위 밖(윈도우가 나열하지 않은 표준 프리컴파일, 또는 범위가 있는 윈도우에서의 컨트랙트 생성 포함)임 | 더 큰 한도나 필요한 범위로 새 윈도우를 여세요 |
| 28 | `invalid EVM authorisation window` | 한도를 벗어난 열기 요청이거나, 그 시점에 사용 가능한 키가 없음 | `blocks`, `max_txs`, `max_value`와 목록을 확인하고, 키를 등록하거나 복구하세요 |
| 62 | `delegated account has no window covering this action` | 위임된 계정이 동작했거나 발신자가 윈도우가 허용하는 것보다 많이 이동했는데, 이를 허용하는 윈도우가 없음. v3.2.8부터 같은 규칙은 문제가 된 호출만 실패시킴 | 그 동작을 허용하는 윈도우를 해당 계정에 여세요 |
| revert | `<method> is disabled: the circuit breaker has tripped ...` | Native 메시지가 꺼져 있는 표준 프리컴파일 메서드 | 기다리세요. 윈도우에서 바꿀 것은 없습니다 |
| revert | `<method>: account ... has no open EVM authorisation window that lists 0x...` | 윈도우가 나열하지 않은 계정에서 코드를 통해 도달한, 값을 옮기는 프리컴파일 | `allowed_targets`에 해당 프리컴파일을 추가하세요 |
| nonce | `nonce too low` | EVM 트랜잭션이 윈도우가 열리기 전에 서명됨(윈도우를 열면 nonce가 증가) | nonce를 다시 읽고 다시 서명하세요 |
| chain id | `only replay-protected (EIP-155) Ethereum transactions are accepted` | 체인 ID 없이 서명된 트랜잭션 | 도구의 네트워크 설정에 체인 ID를 지정하세요 |

TypeScript SDK의 `classifyEvmWindowRejection(err)`는 `"no-pqc-key"`, `"no-window"`, `"exhausted"`, `"invalid"` 중 하나를 반환하며, 다른 SDK에도 동등한 분류기가 있습니다(Python은 `describe_evm_window_error`, Go는 `tx.ClassifyEVMWindowError`, Rust는 `classify_evm_window_error`, Java는 `EvmWindowIssue.classify`).

## 윈도우가 관장하지 않는 것 {#outside}

윈도우는 EVM 레인, 즉 클래식 키만으로 서명된 트랜잭션을 관장합니다. 다음은 각각 자체 포스트 퀀텀 서명을 담고 있거나 서명한 계정을 위해 모듈이 시작하므로 윈도우에 부과되지 않습니다.

- 계정이 직접 서명하는 Native 레인 메시지: 뱅크 전송, 스테이킹, 거버넌스, 그리고 서명자 자신의 `0x` 주소로 실행되는 EVM으로의 `MsgCrossVMCall`.
- 계정의 인증기가 인가한 추상 계정 실행.
- 모듈이 실행하는 ERC-20 변환과 IBC 콜백.

발신자가 직접 보내지 않은 EVM으로의 크로스 VM 호출(예: authz 부여 아래)은 발신자의 윈도우 아래에서 실행되며 윈도우가 대상을 허용해야 합니다. `0x0901` 크로스 VM 브리지는 이를 나열한 윈도우가 필요합니다. [크로스 VM 상호운용성](/developer-guide/cross-vm-interoperability)을 참고하세요.

## MetaMask와 QoreX 흐름 {#qorex-flow}

MetaMask는 이더리움 키, 즉 **이더리움 방식(coin 60) 계정**의 키로 서명하며 Native 메시지를 만들 수 없습니다. 이런 계정이 윈도우를 여는 곳이 QoreX입니다. QoreX 자체의 전송은 Native 레인을 사용하므로 윈도우가 필요 없습니다.

1. QoreX에서 MetaMask 구문에 해당하는 coin-60 계정을 추가하거나 복원합니다([MetaMask 또는 대시보드에서 구문 복원](/qorex/getting-started#restore-dashboard) 참고). 계정에는 등록된 ML-DSA-87 키가 필요하며, 첫 QoreX 전송이 이를 등록합니다.
2. **EVM 액세스 윈도우** 카드(앱: 설정, 보안, EVM 액세스 윈도우. 확장 프로그램: 팝업의 **EVM 액세스 윈도우** 버튼)를 열고 블록 수(최대 17,280), 트랜잭션 수(최대 1,000), QOR 단위의 지출 한도를 선택합니다. 한도는 각 금액과 그 최대 수수료를 포함합니다. 기본값은 300 블록, 5 트랜잭션, 1 QOR입니다.
3. 하이브리드 서명된 메시지를 승인합니다. 새 윈도우는 열려 있는 윈도우를 대체하고, 윈도우를 열면 nonce가 증가하므로 그 이후에만 MetaMask에서 전송하세요. 그 전에 준비한 트랜잭션은 "nonce too low"로 거부됩니다.
4. 체인 ID 9800(테스트넷) 또는 9801(메인넷)으로 MetaMask에서 전송합니다. 끝나면 **윈도우 닫기**를 사용하세요. 이 버튼은 윈도우가 열려 있는 동안에만 제공됩니다.

QoreX 카드는 세 가지 한도를 설정합니다. 범위 목록(`allowed_targets`, `validators`, `staking_validators`, `ibc_receivers`, `native_only`)을 위한 화면은 제공하지 않으므로, 범위가 있는 윈도우는 `qorechaind`나 SDK로 만듭니다. 카드와 네 가지 상태는 [EVM 액세스 윈도우](/qorex/security-and-recovery#evm-window)를 참고하세요.

## 관련 페이지 {#related}

- [EVM 개발](/developer-guide/evm-development): 런타임, 가스 한도, [v3.2.8 윈도우 옵션](/developer-guide/evm-development#evm-window-v328)
- [EVM 프리컴파일](/developer-guide/evm-precompiles)
- [크로스 VM 상호운용성](/developer-guide/cross-vm-interoperability)
- [포스트 퀀텀 서명](/developer-guide/post-quantum-signing)
- [SDK EVM 가이드](/sdk/guides/evm#evm-window-scope)
- [트랜잭션 명령](/cli-reference/transaction-commands#open-evm-window) 및 [쿼리 명령](/cli-reference/query-commands)
- [REST 및 gRPC 엔드포인트](/api-reference/rest-grpc-endpoints)
- [첫 트랜잭션](/getting-started/first-transaction#evm-window)
- [QoreX: EVM 액세스 윈도우](/qorex/security-and-recovery#evm-window)
