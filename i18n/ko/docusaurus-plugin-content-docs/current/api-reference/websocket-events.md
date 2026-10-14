---
slug: /api-reference/websocket-events
title: 웹소켓 이벤트
sidebar_label: 웹소켓 이벤트
sidebar_position: 5
---

# 웹소켓 이벤트

QoreChain은 EVM 호환 웹소켓과 QoreChain 컨센서스 엔진 RPC 웹소켓, 두 가지 웹소켓 인터페이스를 통해 실시간 이벤트 스트리밍을 제공합니다.

:::note
컨센서스 엔진 RPC 웹소켓은 **`qorechain-vladi`** 메인넷과 **`qorechain-diana`** 테스트넷 모두에서 공개적으로 사용할 수 있습니다. EVM 웹소켓은 **테스트넷에서만** 공개적으로 사용할 수 있습니다. 공개 메인넷 EVM 웹소켓은 없으며(`wss://evm.qore.host`와 `wss://evm-ws.qore.host`는 웹소켓 연결을 받지 않습니다), 따라서 메인넷에서 `eth_subscribe`를 사용하려면 직접 노드를 실행하십시오. 아래의 로컬 엔드포인트는 직접 실행하는 노드를 기준으로 합니다.

| 인터페이스 | 메인넷 | 테스트넷 |
| --------- | ------- | ------- |
| RPC 웹소켓 | `wss://rpc.qore.host/websocket` | `wss://rpc-testnet.qore.host/websocket` |
| EVM 웹소켓 | 없음 (자체 노드만 가능) | `wss://evm-ws-testnet.qore.host` |
:::

---

## EVM 웹소켓

**엔드포인트:** 직접 실행하는 노드에서는 `ws://localhost:8546`, 공개 테스트넷은 `wss://evm-ws-testnet.qore.host`입니다. 공개 메인넷 EVM 웹소켓은 없습니다.

EVM 웹소켓은 이더리움 툴링과 호환되는 실시간 이벤트 스트리밍을 위해 표준 `eth_subscribe` 메서드를 지원합니다.

### 구독 유형

| 구독                      | 설명                                              |
| ------------------------- | ------------------------------------------------- |
| `newHeads`                | 새 블록이 추가될 때마다 헤더를 전송합니다        |
| `logs`                    | 선택적 필터와 일치하는 로그를 전송합니다         |
| `newPendingTransactions`  | 멤풀에 들어오는 트랜잭션 해시를 전송합니다       |

`syncing` 구독은 구현되어 있지 않습니다. `"syncing"`을 사용한 `eth_subscribe`는 `-32600 syncing subscription is not implemented`를 반환합니다. 대신 HTTP로 `eth_syncing`을 폴링하십시오.

### 새 블록 구독하기

```json
{
  "jsonrpc": "2.0",
  "method": "eth_subscribe",
  "params": ["newHeads"],
  "id": 1
}
```

### 필터를 사용해 로그 구독하기

```json
{
  "jsonrpc": "2.0",
  "method": "eth_subscribe",
  "params": [
    "logs",
    {
      "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28",
      "topics": ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"]
    }
  ],
  "id": 2
}
```

### 구독 취소하기

```json
{
  "jsonrpc": "2.0",
  "method": "eth_unsubscribe",
  "params": ["0x1a2b3c..."],
  "id": 3
}
```

---

## QoreChain RPC 웹소켓

**엔드포인트:** 직접 실행하는 노드에서는 `ws://localhost:26657/websocket`, 공개 엔드포인트는 `wss://rpc.qore.host/websocket`(메인넷)과 `wss://rpc-testnet.qore.host/websocket`(테스트넷)입니다.

RPC 웹소켓은 QoreChain 컨센서스 엔진의 이벤트 구독 시스템을 사용합니다. 클라이언트는 이벤트 유형과 속성으로 필터링하는 쿼리 문자열을 사용해 구독합니다.

### 모든 새 블록 구독하기

```json
{
  "jsonrpc": "2.0",
  "method": "subscribe",
  "params": {
    "query": "tm.event='NewBlock'"
  },
  "id": 1
}
```

### 모든 트랜잭션 구독하기

```json
{
  "jsonrpc": "2.0",
  "method": "subscribe",
  "params": {
    "query": "tm.event='Tx'"
  },
  "id": 2
}
```

### 모듈별 이벤트 구독하기

이벤트 유형으로 필터링하여 특정 모듈의 이벤트만 수신합니다.

```json
{
  "jsonrpc": "2.0",
  "method": "subscribe",
  "params": {
    "query": "tm.event='Tx' AND bridge_deposit.chain EXISTS"
  },
  "id": 3
}
```

### 구독 취소하기

```json
{
  "jsonrpc": "2.0",
  "method": "unsubscribe",
  "params": {
    "query": "tm.event='NewBlock'"
  },
  "id": 4
}
```

---

## 모듈 이벤트 레퍼런스

이벤트는 표준 컨센서스 엔진 이벤트로 발생합니다. 이벤트 유형과 속성으로 필터링한 `tm.event='Tx'` 쿼리로 구독하십시오(예: `tm.event='Tx' AND bridge_deposit.chain EXISTS`). 블록 종료 로직에서 발생하는 블록 수준 이벤트(아래의 PRISM 이벤트 등)는 `Tx`가 아니라 `tm.event='NewBlock'`으로 전달됩니다. 아래의 이름과 속성은 체인 버전 v3.2.0 기준입니다.

:::note 실제로 볼 수 있는 이벤트
이 모듈 중 상당수는 공개 네트워크에서 유휴 상태입니다. 브리지는 아직 가동되지 않았고, 등록된 멀티레이어 레이어나 롤업도 아직 없으며, xQORE는 사용할 수 없습니다. 이들 이벤트는 정의되어 있지만 활동이 생기기 전까지는 발생하지 않습니다. PRISM 관찰 및 보상 이벤트(`rl_observation_collected`, `rl_reward_computed`)는 두 네트워크 모두에서 약 10블록마다 발생합니다.
:::

### PQC 모듈

| 이벤트 유형                 | 주요 속성                                                 | 설명                                                 |
| --------------------------- | --------------------------------------------------------- | ---------------------------------------------------- |
| `pqc_verify`                | `address`, `key_type`, `algorithm_id`, `hybrid_mode`, `status` | 각 PQC 서명 검사 시 발생합니다                  |
| `pqc_hybrid_verify`         | `address`, `algorithm_id`, `status`                       | 각 하이브리드 서명 검증 시 발생합니다                |
| `pqc_hybrid_classical_only` | `address`, `hybrid_mode`                                  | 현재 모드에서 클래식 전용 서명이 수락될 때 발생합니다 |
| `pqc_key_registered`        | `address`, `key_type`, `algorithm_id`                     | PQC 키가 등록될 때 발생합니다                        |
| `pqc_key_rotated`           | `address`, `algorithm_id`                                 | PQC 키가 교체될 때 발생합니다                        |
| `pqc_key_migrated`          | `address`, `from_algorithm`, `to_algorithm`               | 키가 새 알고리즘으로 마이그레이션될 때 발생합니다    |
| `pqc_evm_window_opened`     | `address`, `expiry_height`, `max_txs`, `max_value`        | EVM 레인 승인 윈도우가 열릴 때 발생합니다            |
| `pqc_evm_window_closed`     | `address`                                                 | EVM 레인 승인 윈도우가 닫힐 때 발생합니다            |

PQC 키는 등록 트랜잭션으로 명시적으로 등록됩니다. 자동 등록 이벤트는 없습니다.

### 브리지 모듈

| 이벤트 유형                   | 주요 속성                                                | 설명                                         |
| ----------------------------- | -------------------------------------------------------- | -------------------------------------------- |
| `bridge_deposit`              | `operation_id`, `chain`, `asset`, `amount`, `sender`     | 인바운드 입금이 기록될 때 발생합니다         |
| `bridge_withdraw`             | `operation_id`, `chain`, `asset`, `amount`, `sender`, `receiver` | 출금이 기록될 때 발생합니다          |
| `bridge_attestation`          | `operation_id`, `validator`, `chain`, `pqc_verified`, `attestations` | 각 검증자 증명(attestation)마다 발생합니다 |
| `bridge_operation_executed`   | `operation_id`, `status`                                 | 작업이 완료될 때 발생합니다                  |
| `bridge_circuit_breaker_trip` | `chain`, `status`, `reason`                              | 체인의 브리지 서킷 브레이커가 작동할 때 발생합니다 |

### 크로스VM 모듈

| 이벤트 유형        | 주요 속성                                                                   | 설명                                                  |
| ------------------ | --------------------------------------------------------------------------- | ----------------------------------------------------- |
| `crossvm_request`  | `message_id`, `source_vm`, `target_vm`, `target_contract`, `sender`         | 크로스VM 호출이 시작될 때 발생합니다                  |
| `crossvm_response` | `message_id`, `status`                                                      | 크로스VM 호출이 완료될 때 발생합니다                  |
| `crossvm_timeout`  | `message_id`                                                                | 크로스VM 메시지가 대기열 제한 시간을 초과할 때 발생합니다 |

### 멀티레이어 모듈

| 이벤트 유형             | 주요 속성                                                                                    | 설명                                         |
| ----------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `state_anchored`        | `layer_id`, `layer_height`, `state_root`, `main_chain_height`, `pqc_verified`, `transaction_count` | 레이어 상태 앵커가 수락될 때 발생합니다 |
| `anchor_challenged`     | `layer_id`, `layer_height`, `challenger`, `challenge_reason`, `resolution`                   | 앵커에 이의가 제기될 때 발생합니다           |
| `layer_status_updated`  | `layer_id`, `status`, `reason`                                                               | 레이어 상태가 변경될 때 발생합니다           |
| `sidechain_registered`, `paychain_registered` | `layer_id`, `layer_type`, `creator`, `status`                          | 레이어가 등록될 때 발생합니다                |
| `transaction_routed`    | `selected_layer`, `routing_reason`, `gas_savings`, `latency_ms`, `sender`                    | 트랜잭션이 레이어로 라우팅될 때 발생합니다   |

### RDK 모듈

| 이벤트 유형       | 주요 속성                                                   | 설명                                             |
| ----------------- | ----------------------------------------------------------- | ------------------------------------------------ |
| `rollup_created`  | `rollup_id`, `creator`, `profile`, `settlement_mode`        | 새 롤업이 등록될 때 발생합니다                   |
| `batch_submitted` | `rollup_id`, `batch_index`, `tx_count`                      | 정산 배치가 제출될 때 발생합니다                 |
| `batch_finalized` | `rollup_id`, `batch_index`                                  | 배치가 챌린지 기간을 통과할 때 발생합니다        |
| `da_blob_stored`  | `rollup_id`, `blob_index`, `backend`, `size`                | DA 블롭이 저장될 때 발생합니다                   |
| `da_blob_pruned`  | `rollup_id`, `blob_index`                                   | 보존 기간이 지난 후 DA 블롭이 정리(pruning)될 때 발생합니다 |

### 소각 모듈

| 이벤트 유형              | 주요 속성                                                 | 설명                                                |
| ------------------------ | --------------------------------------------------------- | --------------------------------------------------- |
| `burn`                   | `source`, `amount`                                        | 토큰이 영구적으로 소각될 때 발생합니다              |
| `milestone_burn`         | `tx_threshold`, `burn_amount`, `cumulative_tx_count`      | 트랜잭션 수 마일스톤 소각이 실행될 때 발생합니다    |
| `burn_stranded_released` | `amount`, `destination`, `remaining`                      | 거버넌스가 묶여 있던 스테이커 몫의 일부를 해제할 때 발생합니다 |

### xQORE 모듈

이 이벤트들은 아직 발생하지 않습니다. xQORE는 배포된 어떤 노드 빌드에서도 가동되지 않았습니다([xQORE 스테이킹](/user-guide/xqore-staking) 참조).

| 이벤트 유형    | 주요 속성                                                             | 설명                                     |
| -------------- | --------------------------------------------------------------------- | ---------------------------------------- |
| `xqore_lock`   | `owner`, `amount`                                                     | QOR이 xQORE로 잠길 때 발생합니다         |
| `xqore_unlock` | `owner`, `amount`, `penalty`, `burned`, `redistributed`, `returned`   | xQORE가 QOR로 잠금 해제될 때 발생합니다  |

### PRISM 컨센서스(RL 컨센서스) 모듈

이들은 블록 종료 이벤트이며 `NewBlock` 스트림으로 전달됩니다.

| 이벤트 유형                    | 주요 속성               | 설명                                                          |
| ------------------------------ | ----------------------- | ------------------------------------------------------------- |
| `rl_observation_collected`     | `height`                | PRISM 관찰이 수행될 때 발생합니다 (약 10블록마다)             |
| `rl_reward_computed`           | `height`, `reward`      | PRISM 보상이 계산될 때 발생합니다                             |
| `rl_action_applied`            | `height`, `agent_mode`  | PRISM 에이전트가 파라미터 조정을 적용할 때 발생합니다         |
| `rl_agent_mode_changed`        | `height`, `agent_mode`  | 에이전트 모드가 변경될 때 발생합니다                          |
| `rl_circuit_breaker_triggered` | `height`                | PRISM 서킷 브레이커가 작업을 차단할 때 발생합니다             |
| `rl_circuit_breaker_recovered` | `height`                | 서킷 브레이커가 복구될 때 발생합니다                          |

### AI 모듈

| 이벤트 유형        | 주요 속성                                        | 설명                                                |
| ------------------ | ------------------------------------------------ | --------------------------------------------------- |
| `ai_anomaly_check` | `score_millionths`, `action`, `is_anomalous`     | 이상 점수가 매겨진 각 트랜잭션마다 발생합니다       |

---

## 자바스크립트 클라이언트 예제

### EVM 웹소켓 (ethers.js)

```javascript
import { ethers } from "ethers";

// Own node: ws://localhost:8546. Public testnet: wss://evm-ws-testnet.qore.host
const provider = new ethers.WebSocketProvider("ws://localhost:8546");

// Subscribe to new blocks
provider.on("block", (blockNumber) => {
  console.log("New block:", blockNumber);
});

// Subscribe to contract events
const filter = {
  address: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28",
  topics: [ethers.id("Transfer(address,address,uint256)")],
};
provider.on(filter, (log) => {
  console.log("Transfer event:", log);
});
```

### QoreChain RPC 웹소켓 (네이티브)

```javascript
// Own node: ws://localhost:26657/websocket. Public: wss://rpc.qore.host/websocket
const ws = new WebSocket("ws://localhost:26657/websocket");

ws.onopen = () => {
  // Subscribe to bridge deposits
  ws.send(JSON.stringify({
    jsonrpc: "2.0",
    method: "subscribe",
    params: { query: "tm.event='Tx' AND bridge_deposit.chain EXISTS" },
    id: 1,
  }));

  // Subscribe to rollup batch submissions
  ws.send(JSON.stringify({
    jsonrpc: "2.0",
    method: "subscribe",
    params: { query: "tm.event='Tx' AND batch_submitted.rollup_id EXISTS" },
    id: 2,
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.result && data.result.events) {
    console.log("Event received:", data.result.events);
  }
};
```

---

## 참고 사항

- **연결 제한**: 직접 실행하는 노드에서는 웹소켓 연결의 기본 최대 개수가 무제한입니다 (`max-open-connections = 0`). 프로덕션 배포 시에는 `app.toml`에서 제한을 설정하십시오. 공개 엔드포인트에는 자체 제한이 적용됩니다.
- **이벤트 버퍼**: RPC 웹소켓은 구독당 제한된 수의 이벤트를 버퍼링합니다 (자체 호스팅 노드의 기본값은 200개). 클라이언트가 처리 속도를 따라가지 못하면 오래된 이벤트부터 삭제됩니다.
- **재연결**: 노드 재시작이나 업그레이드 중 웹소켓 연결이 끊길 수 있으므로, 클라이언트는 지수 백오프를 적용한 자동 재연결을 구현해야 합니다.
