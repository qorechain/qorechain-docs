---
slug: /developer-guide/cross-vm-interoperability
title: 크로스 VM 상호운용성
sidebar_label: 크로스 VM 상호운용성
sidebar_position: 5
---

# 크로스 VM 상호운용성

QoreChain의 **트리플 VM 아키텍처**(EVM, QoreChain Native, SVM)는 어떤 가상 머신의 스마트 컨트랙트든 다른 모든 VM의 컨트랙트와 통신할 수 있도록 설계되었습니다. `x/crossvm` 모듈은 동일 트랜잭션 경로와 큐 기반 경로를 갖춘 호출 메시지를 제공합니다.

:::caution 현재 동작하는 기능
크로스 VM 호출은 대상 레인이 제공되는 만큼만 사용할 수 있습니다:

* `MsgCrossVMCall`은 서킷 브레이커에 의해 **메인넷에서 꺼져 있으며**(`qorechaind query circuit disabled-list`), 테스트넷에서는 활성화되어 있습니다.
* **SVM 레인은 두 네트워크 모두에서 트랜잭션에 대해 비활성화**되어 있으므로 SVM 구간은 실행될 수 없습니다.
* **QoreChain Native 업로드는 두 네트워크 모두에서 허가제**이고 **인스턴스화는 메인넷에서 허가제**이며 메인넷에는 저장된 컨트랙트 코드가 없으므로, 메인넷에는 아직 호출할 QoreChain Native 컨트랙트가 없습니다. 테스트넷에서는 거버넌스가 어떤 계정이든 인스턴스화할 수 있는 검토된 컨트랙트 몇 개를 저장했으므로([QoreChain Native 개발](/developer-guide/cosmwasm-development) 참조) 그곳에는 QoreChain Native 대상이 존재할 수 있습니다.
* 동기식 **EVM 프리컴파일은 메인넷에서 활성화되어 있지 않으며** 테스트넷에서는 검토된 QoreChain Native 컨트랙트의 허용 목록과 함께 **활성**입니다(2026년 11월 7일 확인, v3.2.7 업그레이드 후 이를 통한 읽기 전용 호출을 실행했습니다. 아래 참조). 강화된 버전이 v3.2.3부터 바이너리에 들어 있습니다. (2026년 10월 27일 테스트넷 거버넌스가 다른 프리컴파일 세 개, 즉 PQC Verify, PQC Key Status, PRISM Consensus Params를 활성화했고, 11월 4일까지 CrossVM 브리지도 테스트넷 목록에 추가되었으며, 메인넷에서 활성화된 것은 없습니다.)

메인넷에서는 이 모듈의 REST 경로(`/qorechain/crossvm/v1/...`)가 공개 게이트웨이에서 제공되지 않습니다(`501`). CLI 또는 gRPC/ABCI 조회 클라이언트로 메시지를 읽으세요.
:::

:::note
아래 엔드포인트는 기본적으로 로컬 노드를 사용합니다. 메인넷에서는 **`qorechain-vladi`** RPC 엔드포인트(Cosmos RPC **26657**, EVM JSON-RPC **8545**)를 사용하세요. 테스트넷은 **`qorechain-diana`**입니다.
:::

---

## 아키텍처 개요

```
 EVM (Solidity)     QoreChain Native (Rust/Wasm)     SVM (BPF)
      |                        |                        |
      |--- sync (precompile) ->|                        |
      |                        |                        |
      |<-- async (EndBlocker) -|-- async (EndBlocker) ->|
      |                        |                        |
      |<------------ async (EndBlocker) ----------------|
```

| 경로             | 방향       | 타이밍           | 메커니즘                       |
| ---------------- | --------------- | ---------------- | ------------------------------- |
| **동기(Synchronous)**  | EVM에서 QoreChain Native로 | 동일 트랜잭션 | `0x0000...0901`의 프리컴파일(테스트넷에서는 활성, 메인넷에서는 아님, 아래 참조) |
| **메시지, 기본** | 임의 VM에서 다른 임의 VM으로 | 동일 트랜잭션 | `MsgCrossVMCall`; 호출이 즉시 실행되며 실패하면 전체 트랜잭션이 되돌려집니다 |
| **메시지, 큐 방식**  | 임의 VM에서 다른 임의 VM으로 | 다음 블록(또는 그 이후) | `async`를 설정한 `MsgCrossVMCall`; 메시지가 큐에서 대기합니다 |

---

## 동기 경로 (EVM에서 QoreChain Native로) {#synchronous-path-evm-to-qorechain-native}

동기 경로는 주소 `0x0000000000000000000000000000000000000901`의 EVM **프리컴파일**을 사용합니다. Solidity 컨트랙트가 QoreChain Native 컨트랙트를 호출하고 동일한 트랜잭션 내에서 응답을 받을 수 있도록 설계되었습니다.

:::warning 메인넷에서는 활성화되지 않음, 테스트넷에서는 허용 목록과 함께 활성
CrossVM 브리지 프리컴파일은 `qorechain-vladi`에서 **활성화되어 있지 않습니다**. 그곳에서 `0x…0901` 호출은 성공하지만 빈 데이터를 반환합니다. `qorechain-diana`에서는 `active_static_precompiles` 목록에 `0x…0901`이 들어 있습니다(2026년 11월 7일 확인). 이를 통한 읽기 전용 `eth_call`을 v3.2.7 업그레이드 후인 2026년 11월 7일에 실행했습니다(결과는 아래). v3.2.3 바이너리에는 강화된 버전이 들어 있습니다(`STATICCALL`을 거부하고, 중첩 호출을 호출 프레임의 가스에 맞춰 계량하며 저널에 기록해 EVM 되돌림이 QoreChain Native 쪽도 함께 취소하게 하고, 허용 목록에 있는 QoreChain Native 대상에만 접근하며, 크로스 VM 서킷 브레이커를 준수합니다). 그러나 거버넌스에서 승인된 제안이 이를 활성 목록에 추가한 곳(지금까지는 테스트넷, 메인넷은 아님)에서만 실행됩니다. 메인넷에서는 2026년 11월 12일의 v3.2.7 업그레이드 이후에도 별도의 거버넌스 결정이 있기 전까지 프리컴파일과 크로스 VM 호출이 꺼진 상태로 유지됩니다. 아래 예시는 노드가 디코딩하는 레이아웃이며, 프리컴파일이 활성화되기 전에는 메인넷에서 실행될 수 없습니다. 테스트넷에서는 허용 목록 범위 안에서 호출할 수 있습니다(다음 절). [EVM 프리컴파일: 네트워크 상태](/developer-guide/evm-precompiles#network-status)를 참조하세요.
:::

### Solidity 예시

노드는 프리컴파일의 입력을 4바이트 셀렉터와 그 뒤에 오는 `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)`의 ABI 인코딩된 인자(셀렉터 `0x3c11078c`)로 디코딩합니다. `targetVM`은 QoreChain Native 컨트랙트의 경우 `1`입니다(QoreChain Native는 CosmWasm 런타임이며, `0`은 EVM으로, 강화된 브리지는 이를 대상으로 거부합니다). `targetContract`는 컨트랙트의 bech32 주소 문자열이고, `payload`는 컨트랙트의 execute 메시지를 UTF-8 JSON 바이트로 나타낸 것입니다. 프리컴파일은 대상의 원시 응답 바이트를 반환합니다.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CrossVMCaller {
    address constant CROSSVM = 0x0000000000000000000000000000000000000901;
    uint8 constant TARGET_QORECHAIN_NATIVE = 1;

    function callQoreChainNative(string calldata contractAddr, bytes calldata executeMsg)
        external
        returns (bytes memory)
    {
        bytes memory data = abi.encodeWithSignature(
            "executeCrossVMCall(uint8,string,bytes)",
            TARGET_QORECHAIN_NATIVE,
            contractAddr,
            executeMsg
        );
        (bool ok, bytes memory ret) = CROSSVM.call(data);
        require(ok, "cross-VM call failed");
        // While the precompile is not active, the call succeeds with empty data
        // and nothing executes; treat an empty reply as a failure.
        require(ret.length > 0, "cross-VM precompile not active or empty reply");
        return ret;
    }
}
```

이것은 노드가 디코딩하는 레이아웃이며 `@qorechain/rdk` 인코더가 만드는 레이아웃과 같고, 위의 컨트랙트는 [Multi-VM](/rollups/multi-vm)의 스타터와 일치합니다. 프리컴파일을 통해서는 자금을 첨부할 수 없습니다(`MsgCrossVMCall` 메시지 경로는 `--funds`를 받습니다). 메인넷에서는 프리컴파일이 활성화되어 있지 않으므로 이 샘플은 현재 아무것도 할 수 없습니다. 테스트넷에서는 다음에 설명하는 허용 목록 범위 안에서 동작합니다. 샘플 컨트랙트 자체는 이 페이지를 위해 배포하지 않았으며, 아래 호출은 `eth_call`로 직접 수행했습니다.

프리컴파일이 활성화된 곳에서는 QoreChain Native 컨트랙트를 즉시 실행하고 결과를 반환합니다. (`@qorechain/rdk` 헬퍼 `encodeCrossVmCalldata`(0.6.0부터 제공되며 현재 0.8.0에 있음)가 calldata를 만듭니다. [Multi-VM](/rollups/multi-vm) 참조.) 가스 비용: **기본 50,000 + 입력 바이트당 4 + 실행 비용**.

### 테스트넷 동작 (허용 목록, 2026년 11월 7일 확인) {#testnet-allowlist}

`qorechain-diana`(2026년 11월 12일부터 노드 릴리스 v3.2.8)에서 프리컴파일은 브리지 허용 목록에 있는 QoreChain Native 컨트랙트에만 접근합니다. `GET /qorechain/crossvm/v1/params`는 이를 `bridge_allowed_targets`에 나열하며(2026년 11월 7일 기준 세 항목, `cosmwasm:qor1...` 형식), 옆에 `enabled` `true`, `max_message_size` 65536, `max_queue_size` 1000, `queue_timeout_blocks` 100이 있습니다. 2026년 11월 7일에 `executeCrossVMCall(1, target, 0x7b7d)`로 `0x…0901`에 대한 읽기 전용 `eth_call` 요청 두 건을 실행했습니다.

* **허용 목록 밖의 대상:** `cross-VM bridge call refused: target cosmwasm:qor1... is not allowlisted`로 되돌려집니다.
* **허용 목록에 있는 대상:** 호출이 컨트랙트에 도달합니다(빈 `{}` 메시지에 대해 노드가 컨트랙트 자체의 오류를 보고합니다: `Error parsing into type cw20::msg::Cw20ExecuteMsg`). 이는 경로가 동작함을 보여 주며, 이 페이지를 위해 프리컴파일을 통한 상태 변경 크로스 VM 트랜잭션은 전송하지 않았습니다.

메인넷에서는 프리컴파일(`0x…0901`)과 크로스 VM 호출이 2026년 11월 12일의 v3.2.7 업그레이드 이후에도 별도의 거버넌스 결정이 있기 전까지 **꺼진** 상태(서킷 브레이커)로 유지됩니다.

### v3.2.7이 크로스 VM 호출에 바꾸는 것 {#v327}

이 변경은 2026년 11월 6일부터 테스트넷에, 2026년 11월 12일부터 메인넷에 적용됩니다(크로스 VM 호출 자체는 메인넷에서 꺼져 있으므로, 메인넷에서는 켜지는 경우에만 의미가 있습니다).

* 대상 VM에서 실패한 호출은 이제 깔끔하게 실패합니다. 그 호출의 실패로 끝나고 큐는 다음 메시지로 계속 진행합니다.
* 형식이 잘못된 대상은 제출 시점에 코드 5, 코드스페이스 `crossvm`으로 거부됩니다.
* 크로스 VM 호출은 더 이상 EVM 프리컴파일 주소를 대상으로 할 수 없습니다.

---

## 메시지 경로 (`MsgCrossVMCall`)

그 밖의 크로스 VM 호출은 `MsgCrossVMCall` 트랜잭션을 사용합니다. 체인이 발신자로부터 소스 레인을 알아내므로, 메시지에는 대상 VM, 대상 컨트랙트, 페이로드, 그리고 선택적 자금만 포함됩니다. 기본적으로 호출은 트랜잭션 내에서 즉시 실행되며, 대상이 실패하면 전체 트랜잭션이 되돌려집니다. `async` 플래그를 지정하면 메시지는 대신 큐에 들어가 이후 블록에서 모듈의 end-block 큐 처리 과정에 의해 처리됩니다(아래 라이프사이클 참조). 위에서 언급했듯이 이 메시지는 메인넷에서 꺼져 있습니다.

### CLI

`tx crossvm call`은 대상 VM(`evm`, `cosmwasm` 또는 `svm`)과 대상 컨트랙트를 위치 인자로 받으며, 페이로드는 hex로 지정합니다. CLI는 소스 VM을 묻지 않습니다. 체인이 상태로부터 호출자의 레인을 도출하며 선언된 필드는 무시합니다(CLI는 메시지가 자체 검증을 통과하도록 자리 표시자 값을 채웁니다):

```bash
qorechaind tx crossvm call evm 0x1234567890123456789012345678901234567890 \
  --payload 0a0b0c --from mykey --generate-only > tx.json
```

기타 플래그: `--funds <coins>`(QoreChain Native 대상에만 해당)와, 호출을 즉시 실행하는 대신 큐에 넣는 `--async`. `tx.json`은 `tx pqc cosign`으로 서명하고 브로드캐스트하세요([양자내성 서명](/developer-guide/post-quantum-signing) 참조). 수수료 하한은 가스당 0.1 uqor입니다. 호출자 자신의 레인으로 향하는 호출은 거부됩니다(v3.2.3부터).

:::caution 메인넷에서 비활성화됨
`MsgCrossVMCall`은 서킷 브레이커에 의해 메인넷에서 꺼져 있으므로, 이 명령은 현재 그곳에서 성공할 수 없습니다. (v3.2.3 이전 릴리스 바이너리는 소스 VM이 비어 있어 메시지 자체의 검증에 실패하는 메시지도 만들었으며, v3.2.3 바이너리에서 이 문제가 수정되었습니다.) 테스트넷에서는 메시지가 활성화되어 있지만 SVM 레인이 비활성화되어 있으므로 SVM 대상에는 도달할 수 없습니다. EVM 대상과, 컨트랙트가 인스턴스화된 뒤의 QoreChain Native 대상에는 도달할 수 있습니다.
:::

---

## 메시지 라이프사이클

큐에 들어간 모든 크로스 VM 메시지는 정의된 상태 집합을 거쳐 전환됩니다:

```
Submitted --> Pending --> Executed
                |
                +--> Failed
                |
                +--> Timed Out
```

| 상태         | 설명                                               |
| ------------- | --------------------------------------------------------- |
| **Submitted** | 메시지가 큐에 수락됨                           |
| **Pending**   | 다음 EndBlocker 패스에서 실행 대기 중            |
| **Executed**  | 대상 컨트랙트가 성공적으로 호출됨; 응답 기록됨    |
| **Failed**    | 대상 컨트랙트 실행이 되돌려짐; 오류 기록됨        |
| **Timed Out** | 메시지가 실행 없이 `queue_timeout_blocks`를 초과함 |

v3.2.3부터 실패한 큐 호출은 전체가 롤백됩니다. 해당 `Failed` 기록만 남으며, 실패한 QoreChain Native 호출에 첨부된 자금은 더 이상 컨트랙트로 이동하지 않습니다. 모듈이 비활성화되어 있거나 `MsgCrossVMCall`이 서킷 브레이커에 의해 꺼져 있는 동안에는 큐가 **실행되지 않습니다**. 큐에 있는 메시지는 보류 상태로 남아 있다가, 그 전에 스위치가 풀리지 않으면 타임아웃 시점에 만료됩니다.

### CosmWasm으로의 비동기 호출(v3.2.8) {#async-calls}

릴리스 v3.2.8부터(이후 메인넷 업그레이드 전까지는 테스트넷 전용) CosmWasm으로의 비동기 호출은 선불로 지불되고 한도와 함께 큐에 들어갑니다.

| `MsgCrossVMCall` 필드 | 의미 |
| ---------------------- | ------- |
| `async_gas_limit` (8)  | 큐 호출을 위해 예약하는 컨트랙트 가스 단위(기본값 500,000) |
| `async_max_factor` (9) | 허용하는 최대 혼잡 계수(기본값 4배). 현재 적용 중인 계수가 이보다 높으면 호출이 거부됩니다 |

- **에스크로.** 발신자는 가스 단위 x 계수 x 가스 가격을 에스크로 계정에 선불로 지불합니다. 기본값에서는 500,000 x 4 x 0.1 uqor, 약 0.2 QOR입니다. 호출이 사용하지 않은 만큼은 실행될 때 환불됩니다.
- **큐 슬롯 수수료.** 호출을 큐에 넣을 때 소액의 슬롯 수수료도 지불합니다.
- **발신자당 보류 호출은 최대 100개.** 하나가 끝나거나 타임아웃될 때까지 추가 호출은 거부됩니다.
- **실패한 호출도 비용이 청구됩니다.** 실패한 호출도 수행한 작업에 대한 비용을 지불합니다.
- **무거운 호출:** 큰 코드를 로드하는 컨트랙트에는 `async_gas_limit`와 `async_max_factor`를 높이세요. cw721 크기의 컨트랙트는 블록 내 첫 호출에서 기본값에 맞지 않습니다.
- **코드에서.** SDK 0.14.0은 각 언어에서 두 필드를 모두 받습니다(TypeScript: `asyncGasLimit`와 `asyncMaxFactor`, 이를 검사하는 `validateCrossVmAsyncGas`. `asyncMaxFactor`는 백만분율이므로 1,000,000이 1배입니다). 또한 페이지로 나뉜 보류 조회의 모든 페이지를 반환합니다. 테스트넷에서는 실행해 보지 않았습니다.

---

## 파라미터

| 파라미터              | 값        | 설명                                    |
| ---------------------- | ------------ | ---------------------------------------------- |
| `enabled`              | `true`       | 모듈 수준 스위치(호출 메시지 자체는 메인넷에서 별도로 꺼져 있음) |
| `max_message_size`     | 65,536 bytes | 메시지당 최대 페이로드 크기               |
| `max_queue_size`       | 1,000        | 큐에 대기 중인 최대 메시지 수          |
| `queue_timeout_blocks` | 100          | 처리되지 않은 메시지가 타임아웃되기까지의 블록 수 |

---

## 이벤트

`x/crossvm` 모듈은 다음 이벤트를 방출합니다:

| 이벤트              | 속성                                                          | 설명                           |
| ------------------ | ------------------------------------------------------------------- | ------------------------------------- |
| `crossvm_request`  | `message_id`, `source_vm`, `target_vm`, `target_contract`, `sender` | 새 크로스 VM 메시지 제출됨        |
| `crossvm_response` | `message_id`, `status`, `result`                                    | 메시지 실행됨(성공 또는 실패) |
| `crossvm_timeout`  | `message_id`, `source_vm`, `target_vm`                              | 메시지가 실행 없이 만료됨     |

WebSocket을 통해 이벤트를 구독하세요:

```bash
wscat -c ws://localhost:26657/websocket
> {"jsonrpc":"2.0","method":"subscribe","params":["tm.event='Tx' AND crossvm_request.message_id EXISTS"],"id":1}
```

---

## 메시지 조회

### CLI

```bash
# Query a specific message by ID
qorechaind query crossvm message <message-id>

# List pending messages (from v3.2.8 one page of at most 100; follow the next key for more)
qorechaind query crossvm pending

# Module parameters
qorechaind query crossvm params
```

### JSON-RPC

> **아직 제공되지 않음:** 릴리스된 어떤 노드 빌드도 `qor_` JSON-RPC 네임스페이스를 제공하지 않으므로, 이 호출은 현재 모든 공개 엔드포인트에서 `-32601`(메서드를 찾을 수 없음)을 반환합니다. [`qor_` 네임스페이스](/api-reference/json-rpc-qor_-namespace)를 참조하세요.

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getCrossVMMessage",
    "params": ["<message-id>"],
    "id": 1
  }'
```

### 응답 형식

```json
{
  "message_id": "crossvm-00000042",
  "source_vm": "cosmwasm",
  "target_vm": "evm",
  "target_contract": "0x1234...abcd",
  "sender": "qor1sender...",
  "payload": "...",
  "status": "executed",
  "result": "0x...",
  "submitted_height": 12345,
  "executed_height": 12346
}
```

---

## 설계 고려 사항

**원자성:** 동기 호출(프리컴파일을 통한 EVM에서 QoreChain Native로)은 원자적이도록 설계되어, 어느 한쪽이 되돌려지면 전체 트랜잭션이 되돌려집니다. 강화된 프리컴파일은 중첩 호출을 저널에 기록하므로, 호출한 컨트랙트에서의 되돌림은 QoreChain Native 쪽도 함께 취소합니다. 이는 테스트넷에서만 활성입니다. 비동기 호출은 블록 간에 **원자적이지 않습니다**; `Failed` 및 `Timed Out` 상태를 우아하게 처리하도록 컨트랙트를 설계하세요.

**순서:** 큐의 메시지는 각 EndBlocker 패스 내에서 FIFO로 처리됩니다. 서로 다른 소스 VM 간에 보장된 순서는 없습니다.

**페이로드 인코딩:** 페이로드 형식은 대상 VM에 따라 다릅니다:

* **EVM 대상:** ABI 인코딩된 함수 호출
* **QoreChain Native 대상:** JSON 인코딩된 execute 메시지
* **SVM 대상:** Hex 인코딩된 BPF 명령 데이터

---

## 다음 단계

* [EVM 프리컴파일](/developer-guide/evm-precompiles) — 동기 CrossVM 프리컴파일의 상태 및 계획된 기타 프리컴파일
* [EVM 개발](/developer-guide/evm-development) — QoreChain에서의 Solidity 개발
* [QoreChain Native 개발](/developer-guide/cosmwasm-development) — Rust/Wasm 컨트랙트 개발
* [SVM 개발](/developer-guide/svm-development) — BPF 프로그램 배포
