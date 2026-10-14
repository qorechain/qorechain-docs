---
slug: /developer-guide/cross-vm-interoperability
title: 크로스 VM 상호운용성
sidebar_label: 크로스 VM 상호운용성
sidebar_position: 5
---

# 크로스 VM 상호운용성

QoreChain의 **트리플 VM 아키텍처**(EVM, CosmWasm, SVM)는 어떤 가상 머신의 스마트 컨트랙트든 다른 모든 VM의 컨트랙트와 통신할 수 있도록 설계되었습니다. `x/crossvm` 모듈은 동일 트랜잭션 경로와 큐 기반 경로를 갖춘 호출 메시지를 제공합니다.

:::caution 현재 동작하는 기능
크로스 VM 호출은 대상 레인이 제공되는 만큼만 사용할 수 있습니다:

* `MsgCrossVMCall`은 서킷 브레이커에 의해 **메인넷에서 꺼져 있으며**(`qorechaind query circuit disabled-list`), 테스트넷에서는 활성화되어 있습니다.
* **SVM 레인은 두 네트워크 모두에서 트랜잭션에 대해 비활성화**되어 있으므로 SVM 구간은 실행될 수 없습니다.
* **CosmWasm 업로드와 인스턴스화는 두 네트워크 모두에서 허가제**이고 메인넷에는 저장된 컨트랙트 코드가 없으므로, 아직 호출할 CosmWasm 컨트랙트가 없습니다.
* 동기식 **EVM 프리컴파일은 활성화되어 있지 않습니다**(아래 참조).

이 모듈의 REST 경로(`/qorechain/crossvm/v1/...`)는 공개 게이트웨이에서 제공되지 않습니다. CLI 또는 gRPC/ABCI 조회 클라이언트로 메시지를 읽으세요.
:::

:::note
아래 엔드포인트는 기본적으로 로컬 노드를 사용합니다. 메인넷에서는 **`qorechain-vladi`** RPC 엔드포인트(Cosmos RPC **26657**, EVM JSON-RPC **8545**)를 사용하세요. 테스트넷은 **`qorechain-diana`**입니다.
:::

---

## 아키텍처 개요

```
 EVM (Solidity)          CosmWasm (Rust/Wasm)         SVM (BPF)
      |                        |                        |
      |--- sync (precompile) ->|                        |
      |                        |                        |
      |<-- async (EndBlocker) -|-- async (EndBlocker) ->|
      |                        |                        |
      |<------------ async (EndBlocker) ----------------|
```

| 경로             | 방향       | 타이밍           | 메커니즘                       |
| ---------------- | --------------- | ---------------- | ------------------------------- |
| **동기(Synchronous)**  | EVM에서 CosmWasm으로 | 동일 트랜잭션 | `0x0000...0901`의 프리컴파일(아직 활성화되지 않음, 아래 참조) |
| **메시지, 기본** | 임의 VM에서 다른 임의 VM으로 | 동일 트랜잭션 | `MsgCrossVMCall`; 호출이 즉시 실행되며 실패하면 전체 트랜잭션이 되돌려집니다 |
| **메시지, 큐 방식**  | 임의 VM에서 다른 임의 VM으로 | 다음 블록(또는 그 이후) | `async`를 설정한 `MsgCrossVMCall`; 메시지가 큐에서 대기합니다 |

---

## 동기 경로 (EVM에서 CosmWasm으로)

동기 경로는 주소 `0x0000000000000000000000000000000000000901`의 EVM **프리컴파일**을 사용합니다. Solidity 컨트랙트가 CosmWasm 컨트랙트를 호출하고 동일한 트랜잭션 내에서 응답을 받을 수 있도록 설계되었습니다.

:::warning 메인넷과 테스트넷에서 활성화되지 않음
CrossVM 브리지 프리컴파일은 `qorechain-vladi`와 `qorechain-diana`에서 **활성화되어 있지 않습니다**. `0x…0901` 호출은 성공하지만 빈 데이터를 반환합니다. 현재 형태로는 활성화되지 않을 것이며, 호출하는 컨트랙트의 되돌림이 CosmWasm 쪽도 함께 취소하고, 값 전송은 거부되며, EVM 간 재진입은 차단되고, 크로스 VM 서킷 브레이커가 적용되도록 다시 만들어지고 있습니다. 아래 예시는 의도된 형태만 보여줍니다. [EVM 프리컴파일: 네트워크 상태](/developer-guide/evm-precompiles#network-status)를 참조하세요.
:::

### Solidity 예시

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ICrossVM {
    function call(bytes calldata payload) external returns (bytes memory);
}

contract CrossVMCaller {
    ICrossVM constant CROSSVM = ICrossVM(0x0000000000000000000000000000000000000901);

    function callCosmWasmContract(
        string memory cosmwasmAddr,
        string memory executeMsg,
        uint256 funds
    ) external returns (bytes memory) {
        bytes memory payload = abi.encode(cosmwasmAddr, executeMsg, funds);
        return CROSSVM.call(payload);
    }
}
```

활성화되면 프리컴파일은 CosmWasm 컨트랙트를 즉시 실행하고 결과를 반환합니다. 현재 노드는 calldata를 `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)`로 디코딩하며, ABI는 재구축과 함께 변경될 수 있습니다. 가스 비용: **기본 50,000 + 입력 바이트당 4 + 실행 비용**.

---

## 메시지 경로 (`MsgCrossVMCall`)

그 밖의 크로스 VM 호출은 `MsgCrossVMCall` 트랜잭션을 사용합니다. 체인이 발신자로부터 소스 레인을 알아내므로, 메시지에는 대상 VM, 대상 컨트랙트, 페이로드, 그리고 선택적 자금만 포함됩니다. 기본적으로 호출은 트랜잭션 내에서 즉시 실행되며, 대상이 실패하면 전체 트랜잭션이 되돌려집니다. `async` 플래그를 지정하면 메시지는 대신 큐에 들어가 이후 블록에서 모듈의 end-block 큐 처리 과정에 의해 처리됩니다(아래 라이프사이클 참조). 위에서 언급했듯이 이 메시지는 메인넷에서 꺼져 있습니다.

### CLI

`tx crossvm call`은 대상 VM(`evm`, `cosmwasm` 또는 `svm`)과 대상 컨트랙트를 위치 인자로 받으며, 페이로드는 hex로 지정합니다:

```bash
qorechaind tx crossvm call evm 0x1234567890123456789012345678901234567890 \
  --payload 0a0b0c --from mykey --generate-only > tx.json
```

기타 플래그: `--funds <coins>`(CosmWasm 대상에만 해당)와, 호출을 즉시 실행하는 대신 큐에 넣는 `--async`. `tx.json`은 `tx pqc cosign`으로 서명하고 브로드캐스트하세요([양자내성 서명](/developer-guide/post-quantum-signing) 참조). 수수료 하한은 가스당 0.1 uqor입니다.

:::caution 메인넷에서 비활성화되어 있으며 CLI 형식은 수정이 필요함
`MsgCrossVMCall`은 서킷 브레이커에 의해 메인넷에서 꺼져 있습니다. 현재 릴리스 바이너리에서는 `tx crossvm call`이 메시지 자체의 검증을 통과하지 못하는 메시지도 만들어내므로(소스 VM을 비워 둠), 이 명령은 참고용으로만 여기에 문서화되어 있습니다.
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

# List all pending messages
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

**원자성:** 동기 호출(프리컴파일을 통한 EVM에서 CosmWasm으로)은 원자적이도록 설계되어, 어느 한쪽이 되돌려지면 전체 트랜잭션이 되돌려집니다. 현재 프리컴파일은 아직 이를 보장하지 않으며, 이것이 활성화되지 않은 이유 중 하나입니다(위 참조). 비동기 호출은 블록 간에 **원자적이지 않습니다**; `Failed` 및 `Timed Out` 상태를 우아하게 처리하도록 컨트랙트를 설계하세요.

**순서:** 큐의 메시지는 각 EndBlocker 패스 내에서 FIFO로 처리됩니다. 서로 다른 소스 VM 간에 보장된 순서는 없습니다.

**페이로드 인코딩:** 페이로드 형식은 대상 VM에 따라 다릅니다:

* **EVM 대상:** ABI 인코딩된 함수 호출
* **CosmWasm 대상:** JSON 인코딩된 execute 메시지
* **SVM 대상:** Hex 인코딩된 BPF 명령 데이터

---

## 다음 단계

* [EVM 프리컴파일](/developer-guide/evm-precompiles) — 동기 CrossVM 프리컴파일의 상태 및 계획된 기타 프리컴파일
* [EVM 개발](/developer-guide/evm-development) — QoreChain에서의 Solidity 개발
* [CosmWasm 개발](/developer-guide/cosmwasm-development) — Rust/Wasm 컨트랙트 개발
* [SVM 개발](/developer-guide/svm-development) — BPF 프로그램 배포
