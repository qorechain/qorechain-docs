---
slug: /developer-guide/cross-vm-interoperability
title: 크로스 VM 상호운용성
sidebar_label: 크로스 VM 상호운용성
sidebar_position: 5
---

# 크로스 VM 상호운용성

QoreChain의 **트리플 VM 아키텍처**(EVM, CosmWasm, SVM)는 어떤 가상 머신의 스마트 컨트랙트든 다른 모든 VM의 컨트랙트와 통신할 수 있게 합니다. `x/crossvm` 모듈은 동기 및 비동기 메시징 경로를 모두 제공합니다.

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
| **동기(Synchronous)**  | EVM에서 CosmWasm으로 | 동일 트랜잭션 | `0x0000...0901`의 프리컴파일   |
| **비동기(Asynchronous)** | CosmWasm에서 EVM으로 | 다음 블록       | EndBlocker를 통한 `MsgCrossVMCall` |
| **비동기(Asynchronous)** | SVM에서 임의 VM으로   | 다음 블록       | EndBlocker를 통한 `MsgCrossVMCall` |
| **비동기(Asynchronous)** | 임의 VM에서 SVM으로      | 다음 블록       | EndBlocker를 통한 `MsgCrossVMCall` |

---

## 동기 경로 (EVM에서 CosmWasm으로)

동기 경로는 주소 `0x0000000000000000000000000000000000000901`의 EVM **프리컴파일**을 사용합니다. 이를 통해 Solidity 컨트랙트가 CosmWasm 컨트랙트를 호출하고 동일한 트랜잭션 내에서 응답을 받을 수 있습니다.

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

프리컴파일은 CosmWasm 컨트랙트를 즉시 실행하고 결과를 반환합니다. 가스 비용: **기본 50,000 + 실행 비용**.

---

## 비동기 경로

다른 모든 크로스 VM 방향은 비동기 메시지 큐를 사용합니다. 메시지는 한 블록에서 제출되고 다음 블록의 **EndBlocker**에 의해 처리됩니다.

### CLI

```bash
# CosmWasm to EVM
qorechaind tx crossvm call \
  --source-vm cosmwasm \
  --target-vm evm \
  --target-contract 0x1234...abcd \
  --payload '{"method":"transfer","params":["0xRecipient",100]}' \
  --from mykey \
  -y

# SVM to CosmWasm
qorechaind tx crossvm call \
  --source-vm svm \
  --target-vm cosmwasm \
  --target-contract qor1contractaddr... \
  --payload '{"execute":{"action":{}}}' \
  --from mykey \
  -y

# EVM to SVM (async)
qorechaind tx crossvm call \
  --source-vm evm \
  --target-vm svm \
  --target-contract <program-id-base58> \
  --payload '0a0b0c...' \
  --from mykey \
  -y
```

---

## 메시지 라이프사이클

모든 크로스 VM 메시지는 정의된 상태 집합을 거쳐 전환됩니다:

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

# List messages by sender
qorechaind query crossvm messages-by-sender <address>
```

### JSON-RPC

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

**원자성:** 동기 호출(프리컴파일을 통한 EVM에서 CosmWasm으로)은 원자적입니다 — 어느 한쪽이 되돌려지면 전체 트랜잭션이 되돌려집니다. 비동기 호출은 블록 간에 **원자적이지 않습니다**; `Failed` 및 `Timed Out` 상태를 우아하게 처리하도록 컨트랙트를 설계하세요.

**순서:** 큐의 메시지는 각 EndBlocker 패스 내에서 FIFO로 처리됩니다. 서로 다른 소스 VM 간에 보장된 순서는 없습니다.

**페이로드 인코딩:** 페이로드 형식은 대상 VM에 따라 다릅니다:

* **EVM 대상:** ABI 인코딩된 함수 호출
* **CosmWasm 대상:** JSON 인코딩된 execute 메시지
* **SVM 대상:** Hex 인코딩된 BPF 명령 데이터

---

## 다음 단계

* [EVM 프리컴파일](/developer-guide/evm-precompiles) — 동기 CrossVM 프리컴파일 및 기타 사용자 정의 프리컴파일
* [EVM 개발](/developer-guide/evm-development) — QoreChain에서의 Solidity 개발
* [CosmWasm 개발](/developer-guide/cosmwasm-development) — Rust/Wasm 컨트랙트 개발
* [SVM 개발](/developer-guide/svm-development) — BPF 프로그램 배포
