---
slug: /api-reference/websocket-events
title: WebSocket 이벤트
sidebar_label: WebSocket 이벤트
sidebar_position: 5
---

# WebSocket 이벤트

QoreChain은 두 가지 WebSocket 인터페이스를 통해 실시간 이벤트 스트리밍을 제공합니다: EVM 호환 WebSocket과 QoreChain 합의 엔진 RPC WebSocket입니다.

:::note
두 WebSocket 인터페이스 모두 **`qorechain-vladi`** 메인넷(체인 버전 **v3.1.77**에서 가동 중)과 **`qorechain-diana`** 테스트넷에서 사용할 수 있습니다. 아래 로컬 엔드포인트는 직접 운영하는 노드를 가정합니다. 원격 접속의 경우 공급자의 메인넷 또는 테스트넷 호스트로 대체하세요.
:::

---

## EVM WebSocket

**엔드포인트:** `ws://localhost:8546`

EVM WebSocket은 이더리움 도구와 호환되는 실시간 이벤트 스트리밍을 위한 표준 `eth_subscribe` 메서드를 지원합니다.

### 구독 유형

| 구독                     | 설명                                              |
| ------------------------ | ------------------------------------------------ |
| `newHeads`               | 새 블록이 추가될 때마다 헤더를 방출합니다         |
| `logs`                   | 선택적 필터와 일치하는 로그를 방출합니다         |
| `newPendingTransactions` | 멤풀에 진입하는 트랜잭션 해시를 방출합니다       |
| `syncing`                | 동기화 상태 업데이트를 방출합니다               |

### 새 블록 구독

```json
{
  "jsonrpc": "2.0",
  "method": "eth_subscribe",
  "params": ["newHeads"],
  "id": 1
}
```

### 필터로 로그 구독

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

### 구독 취소

```json
{
  "jsonrpc": "2.0",
  "method": "eth_unsubscribe",
  "params": ["0x1a2b3c..."],
  "id": 3
}
```

---

## QoreChain RPC WebSocket

**엔드포인트:** `ws://localhost:26657/websocket`

RPC WebSocket은 QoreChain 합의 엔진 이벤트 구독 시스템을 사용합니다. 클라이언트는 유형과 속성으로 이벤트를 필터링하는 쿼리 문자열로 구독합니다.

### 모든 새 블록 구독

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

### 모든 트랜잭션 구독

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

### 모듈별 이벤트 구독

이벤트 유형으로 필터링하여 특정 모듈의 이벤트만 수신합니다:

```json
{
  "jsonrpc": "2.0",
  "method": "subscribe",
  "params": {
    "query": "tm.event='Tx' AND fraud_alert.severity EXISTS"
  },
  "id": 3
}
```

### 구독 취소

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

## 모듈 이벤트 참조

### PQC 모듈

| 이벤트 유형                | 주요 속성                                            | 설명                                          |
| -------------------------- | ---------------------------------------------------- | --------------------------------------------- |
| `pqc_hybrid_verify`        | `address`, `algorithm`, `result` (pass/fail), `mode` | 각 하이브리드 서명 검증 시 방출됩니다         |
| `pqc_hybrid_auto_register` | `address`, `algorithm`, `pubkey_hash`                | PQC 키가 자동 등록될 때 방출됩니다           |

### AI 모듈

| 이벤트 유형       | 주요 속성                                                           | 설명                                             |
| ----------------- | ------------------------------------------------------------------- | ------------------------------------------------ |
| `fraud_alert`     | `severity` (low/medium/high/critical), `address`, `reason`, `score` | 트랜잭션에서 사기가 탐지될 때 방출됩니다         |
| `circuit_breaker` | `module`, `action` (tripped/reset), `threshold`, `value`            | AI 서킷 브레이커 상태가 변경될 때 방출됩니다     |

### 브리지 모듈

| 이벤트 유형            | 주요 속성                                                      | 설명                                                  |
| ---------------------- | --------------------------------------------------------------- | ------------------------------------------------------- |
| `deposit_completed`    | `chain_id`, `sender`, `recipient`, `amount`, `asset`, `tx_hash` | 인바운드 브리지 입금이 확정될 때 방출됩니다           |
| `withdrawal_completed` | `chain_id`, `sender`, `recipient`, `amount`, `asset`, `tx_hash` | 아웃바운드 브리지 출금이 확정될 때 방출됩니다         |

### 크로스 VM 모듈

| 이벤트 유형        | 주요 속성                                                       | 설명                                                  |
| ------------------ | ---------------------------------------------------------------- | ----------------------------------------------------- |
| `crossvm_request`  | `message_id`, `source_vm`, `target_vm`, `sender`, `payload_hash` | 크로스 VM 호출이 시작될 때 방출됩니다                 |
| `crossvm_response` | `message_id`, `source_vm`, `target_vm`, `success`, `gas_used`    | 크로스 VM 호출이 완료될 때 방출됩니다                 |
| `crossvm_timeout`  | `message_id`, `source_vm`, `target_vm`, `queued_at_height`       | 크로스 VM 메시지가 큐 타임아웃을 초과할 때 방출됩니다 |

### 멀티레이어 모듈

| 이벤트 유형            | 주요 속성                                                     | 설명                                            |
| ---------------------- | -------------------------------------------------------------- | ----------------------------------------------- |
| `anchor_submitted`     | `layer_id`, `layer_type`, `anchor_hash`, `height`, `submitter` | 계층 상태 앵커가 제출될 때 방출됩니다           |
| `layer_status_changed` | `layer_id`, `previous_status`, `new_status`, `reason`          | 계층의 운영 상태가 변경될 때 방출됩니다         |

### RDK 모듈

| 이벤트 유형       | 주요 속성                                             | 설명                                             |
| ----------------- | ----------------------------------------------------- | ------------------------------------------------ |
| `rollup_created`  | `rollup_id`, `operator`, `settlement_type`, `profile` | 새 롤업이 등록될 때 방출됩니다                   |
| `batch_submitted` | `rollup_id`, `batch_index`, `state_root`, `tx_count`  | 정산 배치가 제출될 때 방출됩니다                 |
| `batch_finalized` | `rollup_id`, `batch_index`, `finalized_at_height`     | 배치가 챌린지 윈도우를 통과할 때 방출됩니다     |
| `da_blob_stored`  | `rollup_id`, `blob_index`, `size_bytes`, `commitment` | DA 블롭이 저장될 때 방출됩니다                   |
| `da_blob_pruned`  | `rollup_id`, `blob_index`, `pruned_at_height`         | 보존 기간 후 DA 블롭이 제거될 때 방출됩니다     |

### 소각 모듈

| 이벤트 유형       | 주요 속성                                                                           | 설명                                        |
| ----------------- | ----------------------------------------------------------------------------------- | ------------------------------------------- |
| `fee_distributed` | `total_fees`, `validator_amount`, `burn_amount`, `treasury_amount`, `staker_amount` | 징수된 수수료가 분배될 때 방출됩니다         |
| `tokens_burned`   | `amount`, `channel`, `block_height`                                                 | 토큰이 영구적으로 소각될 때 방출됩니다       |

### xQORE 모듈

| 이벤트 유형      | 주요 속성                                                      | 설명                                       |
| ---------------- | -------------------------------------------------------------- | ------------------------------------------ |
| `xqore_locked`   | `address`, `amount`, `lock_duration`, `tier`                   | QOR가 xQORE로 잠길 때 방출됩니다           |
| `xqore_unlocked` | `address`, `amount`, `penalty_applied`, `penalty_amount`       | xQORE가 QOR로 잠금 해제될 때 방출됩니다     |
| `pvp_rebase`     | `epoch`, `total_penalty`, `rebase_amount`, `beneficiary_count` | PvP 리베이스 분배 중에 방출됩니다           |

### 인플레이션 모듈

| 이벤트 유형    | 주요 속성                                                  | 설명                                       |
| -------------- | ---------------------------------------------------------- | ------------------------------------------ |
| `epoch_minted` | `epoch`, `minted_amount`, `inflation_rate`, `block_height` | 각 인플레이션 에포크 종료 시 방출됩니다     |

### RL 합의 모듈

PRISM 매개변수 조정과 서킷 브레이커 활동이 이 모듈을 통해 방출됩니다.

| 이벤트 유형                 | 주요 속성                                                      | 설명                                                      |
| --------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------- |
| `rl_action_applied`         | `action_type`, `param_key`, `old_value`, `new_value`, `reward` | PRISM 에이전트가 매개변수 조정을 적용할 때 방출됩니다     |
| `circuit_breaker_triggered` | `reason`, `param_key`, `attempted_value`, `limit`              | PRISM 서킷 브레이커가 작업을 차단할 때 방출됩니다         |

---

## JavaScript 클라이언트 예제

### EVM WebSocket (ethers.js)

```javascript
import { ethers } from "ethers";

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

### QoreChain RPC WebSocket (네이티브)

```javascript
const ws = new WebSocket("ws://localhost:26657/websocket");

ws.onopen = () => {
  // Subscribe to fraud alerts
  ws.send(JSON.stringify({
    jsonrpc: "2.0",
    method: "subscribe",
    params: { query: "tm.event='Tx' AND fraud_alert.severity EXISTS" },
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

## 참고

- **연결 제한**: 기본 최대 WebSocket 연결 수는 무제한(`max-open-connections = 0`)입니다. 프로덕션 배포의 경우 `app.toml`에서 제한을 설정하세요.
- **이벤트 버퍼**: RPC WebSocket은 구독당 최대 200개의 이벤트를 버퍼링합니다. 클라이언트가 뒤처지면 오래된 이벤트는 삭제됩니다.
- **재연결**: WebSocket 연결은 노드 재시작 또는 업그레이드 중에 중단될 수 있으므로, 클라이언트는 지수 백오프를 사용한 자동 재연결을 구현해야 합니다.
