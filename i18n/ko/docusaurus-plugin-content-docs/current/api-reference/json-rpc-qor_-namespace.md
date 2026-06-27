---
slug: /api-reference/json-rpc-qor_-namespace
title: JSON-RPC — qor_ 네임스페이스
sidebar_label: JSON-RPC — qor_ 네임스페이스
sidebar_position: 2
---

# JSON-RPC — qor_ 네임스페이스

`qor_` 네임스페이스는 포스트 양자 암호화 상태, AI 분석, 크로스 VM 메시징, 다중 계층 상태, 브리지 작업, 토크노믹스, 롤업 인프라 및 PRISM 합의 상태를 조회하기 위한 QoreChain 전용 JSON-RPC 메서드를 제공합니다.

## 연결

| 전송 방식 | 기본 주소               |
| --------- | ----------------------- |
| HTTP      | `http://localhost:8545` |
| WebSocket | `ws://localhost:8546`   |

`qor_` 네임스페이스는 동일한 포트에서 `eth_`, `web3_`, `net_`, `txpool_`과 함께 제공됩니다. `app.toml`에서 활성화하세요:

```toml
[json-rpc]
api = "eth,web3,net,txpool,qor"
```

:::note
`qor_` 네임스페이스는 **`qorechain-vladi`** 메인넷(EVM 체인 ID **9801**, 체인 버전 **v3.1.77**에서 가동 중)과 **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**)에서 사용할 수 있습니다. 아래 예제는 로컬 노드를 가정합니다. 원격 접속의 경우 공급자의 메인넷 또는 테스트넷 엔드포인트로 대체하세요.
:::

---

## 메서드

| 메서드                        | 매개변수                                | 설명                                                    |
| ----------------------------- | --------------------------------------- | -------------------------------------------------------- |
| `qor_getPQCKeyStatus`         | `address` (string)                      | 계정의 PQC 키 등록 상태를 반환합니다                     |
| `qor_getHybridSignatureMode`  | 없음                                    | 현재 하이브리드 서명 적용 모드를 반환합니다             |
| `qor_getAIStats`              | 없음                                    | 집계된 AI 모듈 처리 통계를 반환합니다                   |
| `qor_getCrossVMMessage`       | `messageId` (string)                    | ID로 크로스 VM 메시지를 조회합니다                       |
| `qor_getReputationScore`      | `validator` (string)                    | 검증자 주소의 평판 점수를 반환합니다                     |
| `qor_getLayerInfo`            | `layerId` (string)                      | 등록된 계층의 메타데이터와 상태를 반환합니다             |
| `qor_getBridgeStatus`         | `chainId` (string)                      | 체인의 브리지 상태와 잠긴 총액을 반환합니다             |
| `qor_getRLAgentStatus`        | 없음                                    | 현재 PRISM 에이전트 모드와 운영 상태를 반환합니다       |
| `qor_getRLObservation`        | 없음                                    | 최신 PRISM 관측 벡터를 반환합니다                       |
| `qor_getRLReward`             | 없음                                    | 누적 PRISM 보상 지표를 반환합니다                       |
| `qor_getPoolClassification`   | `validator` (string)                    | 검증자의 CPoS 풀 분류를 반환합니다                       |
| `qor_getBurnStats`            | 없음                                    | 모든 채널에 걸친 소각 통계를 반환합니다                 |
| `qor_getXQOREPosition`        | `address` (string)                      | 주소의 xQORE 스테이킹 포지션을 반환합니다               |
| `qor_getInflationRate`        | 없음                                    | 현재 연간 인플레이션율을 반환합니다                     |
| `qor_getTokenomicsOverview`   | 없음                                    | 소각, 인플레이션, 공급량 통합 개요를 반환합니다         |
| `qor_getRollupStatus`         | `rollupId` (string)                     | 특정 롤업의 상태와 구성을 반환합니다                     |
| `qor_listRollups`             | 없음                                    | 등록된 모든 롤업 목록을 반환합니다                       |
| `qor_getSettlementBatch`      | `rollupId` (string), `batchIndex` (int) | 롤업의 특정 정산 배치를 반환합니다                       |
| `qor_suggestRollupProfile`    | `useCase` (string)                      | 사용 사례에 대한 AI 지원 롤업 프로파일 추천             |
| `qor_getDABlobStatus`         | `rollupId` (string), `blobIndex` (int)  | 특정 DA 블롭의 상태를 반환합니다                         |
| `qor_getBTCStakingPosition`   | `address` (string)                      | Babylon 모듈을 통한 BTC 스테이킹 포지션을 반환합니다     |
| `qor_getAbstractAccount`      | `address` (string)                      | 추상 계정 세부 정보와 지출 규칙을 반환합니다             |
| `qor_getFairBlockStatus`      | 없음                                    | FairBlock 암호화 상태와 구성을 반환합니다               |
| `qor_getGasAbstractionConfig` | 없음                                    | 허용 토큰과 가스 추상화 매개변수를 반환합니다           |
| `qor_getLaneConfiguration`    | 없음                                    | 5레인 TX 우선순위 지정 구성을 반환합니다                 |

---

## 예제

### qor_getBurnStats

**요청:**

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getBurnStats",
    "params": [],
    "id": 1
  }'
```

**응답:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "total_burned": "1250000000",
    "total_distributed": "4750000000",
    "channels": {
      "validator_share": "0.40",
      "burn_share": "0.30",
      "treasury_share": "0.20",
      "staker_share": "0.10"
    },
    "last_block_burned": "342891"
  }
}
```

### qor_getRLAgentStatus

**요청:**

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getRLAgentStatus",
    "params": [],
    "id": 2
  }'
```

**응답:**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "agent_mode": "observe",
    "observation_interval": 10,
    "circuit_breaker": {
      "active": false,
      "max_param_change": "0.10",
      "cooldown_blocks": 100
    },
    "last_observation_block": "342885",
    "cumulative_reward": "18.742"
  }
}
```

### qor_getRollupStatus

**요청:**

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getRollupStatus",
    "params": ["rollup-001"],
    "id": 3
  }'
```

**응답:**

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "rollup_id": "rollup-001",
    "status": "active",
    "settlement_type": "optimistic",
    "operator": "qor1abc123...",
    "total_batches": 147,
    "last_finalized_batch": 145,
    "pending_batches": 2,
    "stake": "10000000000uqor",
    "created_at_height": 100230
  }
}
```

---

## 오류 코드

| 코드   | 메시지           | 설명                                  |
| ------ | ---------------- | ------------------------------------- |
| -32600 | Invalid Request  | 형식이 잘못된 JSON-RPC 요청           |
| -32601 | Method not found | 메서드가 존재하지 않음                |
| -32602 | Invalid params   | 누락되었거나 잘못된 매개변수          |
| -32603 | Internal error   | 서버 측 처리 오류                     |
| -32000 | Module disabled  | 조회한 모듈이 활성화되지 않음         |
| -32001 | Entity not found | 요청한 리소스가 존재하지 않음         |
