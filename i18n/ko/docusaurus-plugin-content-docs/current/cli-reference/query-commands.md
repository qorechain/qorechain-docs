---
slug: /cli-reference/query-commands
title: 쿼리 명령어
sidebar_label: 쿼리 명령어
sidebar_position: 3
---

# 쿼리 명령어

모든 쿼리 명령어는 다음 패턴을 따릅니다.

```bash
qorechaind query <module> <command> [args] [flags]
```

:::note
쿼리는 `--node`가 가리키는 노드를 대상으로 실행됩니다. 실시간 데이터를 조회하려면 **`qorechain-vladi`** 메인넷 RPC 엔드포인트(체인 버전 **v3.1.92**)를 사용하고, 테스트용으로는 **`qorechain-diana`** 테스트넷 엔드포인트를 사용하세요. 기본값인 `tcp://localhost:26657`은 직접 운영하는 노드를 대상으로 합니다.
:::

공통 플래그는 모든 `query` 하위 명령어에 적용됩니다.

| 플래그       | 유형   | 설명                                     |
| ---------- | ------ | ----------------------------------------------- |
| `--node`   | string | RPC 엔드포인트 (기본값: `tcp://localhost:26657`) |
| `--output` | string | 출력 형식: `json` 또는 `text`                 |
| `--height` | int    | 특정 블록 높이의 상태를 쿼리          |

---

## bank

### balances

계정의 모든 잔액을 조회합니다.

```bash
qorechaind query bank balances <address>
```

### total

모든 토큰의 총 공급량을 조회합니다.

```bash
qorechaind query bank total
```

---

## staking

### validator

운영자 주소로 단일 검증인을 조회합니다.

```bash
qorechaind query staking validator <validator_address>
```

### validators

모든 검증인 목록을 조회합니다.

```bash
qorechaind query staking validators
```

### delegation

위임자에서 검증인으로의 위임 내역을 조회합니다.

```bash
qorechaind query staking delegation <delegator_address> <validator_address>
```

### delegations

위임자의 모든 위임 내역을 조회합니다.

```bash
qorechaind query staking delegations <delegator_address>
```

### unbonding-delegation

언본딩 중인 위임 내역을 조회합니다.

```bash
qorechaind query staking unbonding-delegation <delegator_address> <validator_address>
```

---

## distribution

### rewards

위임자의 모든 위임 보상을 조회합니다.

```bash
qorechaind query distribution rewards <delegator_address>
```

### commission

검증인 수수료를 조회합니다.

```bash
qorechaind query distribution commission <validator_address>
```

---

## gov

### proposal

ID로 단일 제안을 조회합니다.

```bash
qorechaind query gov proposal <proposal_id>
```

### proposals

모든 제안 목록을 조회하며, 필요 시 상태로 필터링할 수 있습니다.

```bash
qorechaind query gov proposals [flags]
```

| 플래그       | 유형   | 설명                                                               |
| ---------- | ------ | ------------------------------------------------------------------------- |
| `--status` | string | 상태로 필터링: `deposit_period`, `voting_period`, `passed`, `rejected` |

### votes

제안에 대한 투표를 조회합니다.

```bash
qorechaind query gov votes <proposal_id>
```

---

## pqc

### account

계정의 PQC 키 등록 상태를 조회합니다.

```bash
qorechaind query pqc account <address>
```

### algorithms

지원되는 모든 PQC 알고리즘 목록을 조회합니다.

```bash
qorechaind query pqc algorithms
```

### algorithm

특정 PQC 알고리즘의 세부 정보를 조회합니다.

```bash
qorechaind query pqc algorithm <algorithm_name>
```

### stats

집계된 PQC 등록 통계를 조회합니다.

```bash
qorechaind query pqc stats
```

### params

PQC 모듈 파라미터를 조회합니다.

```bash
qorechaind query pqc params
```

### migration

계정의 PQC 키 마이그레이션 상태를 조회합니다.

```bash
qorechaind query pqc migration <address>
```

### hybrid-mode

현재 하이브리드 서명 강제 모드를 조회합니다.

```bash
qorechaind query pqc hybrid-mode
```

---

## xqore

### position

주소의 xQORE 스테이킹 포지션을 조회합니다.

```bash
qorechaind query xqore position <address>
```

### params

xQORE 모듈 파라미터를 조회합니다.

```bash
qorechaind query xqore params
```

---

## burn

### stats

모든 채널에 걸친 소각 통계를 조회합니다.

```bash
qorechaind query burn stats
```

### params

소각 모듈 파라미터를 조회합니다.

```bash
qorechaind query burn params
```

---

## inflation

### rate

현재 연환산 인플레이션율을 조회합니다.

```bash
qorechaind query inflation rate
```

### epoch

현재 에폭 번호와 진행 상황을 조회합니다.

```bash
qorechaind query inflation epoch
```

### params

인플레이션 모듈 파라미터를 조회합니다.

```bash
qorechaind query inflation params
```

---

## ai

### config

AI 모듈 설정을 조회합니다.

```bash
qorechaind query ai config
```

### stats

집계된 AI 처리 통계를 조회합니다.

```bash
qorechaind query ai stats
```

### fee-estimate

AI 기반 가스 수수료 견적을 받습니다.

```bash
qorechaind query ai fee-estimate [flags]
```

| 플래그        | 유형   | 설명                     |
| ----------- | ------ | -------------------------------- |
| `--tx-type` | string | 견적 대상 트랜잭션 유형 |
| `--urgency` | string | `low`, `medium`, `high`         |

### investigations

진행 중인 부정 행위 조사 목록을 조회합니다.

```bash
qorechaind query ai investigations
```

### recommendations

AI가 생성한 네트워크 최적화 권장 사항을 받습니다.

```bash
qorechaind query ai recommendations
```

### circuit-breakers

현재 서킷 브레이커 상태를 조회합니다.

```bash
qorechaind query ai circuit-breakers
```

---

## reputation

### validators

모든 검증인의 평판 점수를 조회합니다.

```bash
qorechaind query reputation validators
```

### validator

특정 검증인의 평판 점수를 조회합니다.

```bash
qorechaind query reputation validator <validator_address>
```

---

## bridge

### chains

등록된 모든 브리지 체인 목록을 조회합니다.

```bash
qorechaind query bridge chains
```

### chain

특정 브리지 연결된 체인의 세부 정보를 조회합니다.

```bash
qorechaind query bridge chain <chain_id>
```

### validators

활성 브리지 검증인 목록을 조회합니다.

```bash
qorechaind query bridge validators
```

### operations

최근 브리지 작업 목록을 조회합니다.

```bash
qorechaind query bridge operations
```

| 플래그       | 유형   | 설명                              |
| ---------- | ------ | ---------------------------------------- |
| `--status` | string | 필터: `pending`, `completed`, `failed` |
| `--chain`  | string | 체인 ID로 필터링                       |

### limits

브리지 연결된 체인의 속도 제한을 조회합니다.

```bash
qorechaind query bridge limits <chain_id>
```

### estimate

브리지 수수료와 전송 시간을 추정합니다.

```bash
qorechaind query bridge estimate <chain_id> <amount> <asset>
```

---

## crossvm

### message

ID로 크로스-VM 메시지를 조회합니다.

```bash
qorechaind query crossvm message <message_id>
```

### pending

대기 중인 크로스-VM 메시지 목록을 조회합니다.

```bash
qorechaind query crossvm pending
```

### params

Cross-VM 모듈 파라미터를 조회합니다.

```bash
qorechaind query crossvm params
```

---

## svm

### account

SVM 계정 정보를 조회합니다.

```bash
qorechaind query svm account <pubkey>
```

### program

배포된 SVM 프로그램 정보를 조회합니다.

```bash
qorechaind query svm program <program_id>
```

### params

SVM 모듈 파라미터를 조회합니다.

```bash
qorechaind query svm params
```

### slot

현재 SVM 슬롯 번호를 조회합니다.

```bash
qorechaind query svm slot
```

---

## multilayer

### layer

특정 레이어의 세부 정보를 조회합니다.

```bash
qorechaind query multilayer layer <layer_id>
```

### layers

등록된 모든 레이어 목록을 조회합니다.

```bash
qorechaind query multilayer layers
```

### anchor

특정 앵커 레코드를 조회합니다.

```bash
qorechaind query multilayer anchor <anchor_id>
```

### anchors

최근 앵커 제출 내역 목록을 조회합니다.

```bash
qorechaind query multilayer anchors [flags]
```

| 플래그         | 유형   | 설명               |
| ------------ | ------ | ------------------------- |
| `--layer-id` | string | 레이어 ID로 필터링        |
| `--limit`    | uint   | 반환할 최대 결과 수 |

### routing-stats

레이어 간 트랜잭션 라우팅 통계를 조회합니다.

```bash
qorechaind query multilayer routing-stats
```

### simulate-route

실행 없이 트랜잭션 라우팅을 시뮬레이션합니다.

```bash
qorechaind query multilayer simulate-route <tx_data_hex>
```

### params

Multilayer 모듈 파라미터를 조회합니다.

```bash
qorechaind query multilayer params
```

---

## rdk

### rollup

특정 롤업의 세부 정보를 조회합니다.

```bash
qorechaind query rdk rollup <rollup_id>
```

### rollups

등록된 모든 롤업 목록을 조회합니다.

```bash
qorechaind query rdk rollups
```

| 플래그       | 유형   | 설명                           |
| ---------- | ------ | ------------------------------------- |
| `--status` | string | 필터: `active`, `paused`, `stopped` |

### batch

특정 정산 배치를 조회합니다.

```bash
qorechaind query rdk batch <rollup_id> <batch_index>
```

### latest-batch

롤업의 최신 배치를 조회합니다.

```bash
qorechaind query rdk latest-batch <rollup_id>
```

### suggest-profile

AI 기반 롤업 프로필 추천을 받습니다.

```bash
qorechaind query rdk suggest-profile <use_case>
```

### blob

특정 DA blob을 조회합니다.

```bash
qorechaind query rdk blob <rollup_id> <blob_index>
```

### params

RDK 모듈 파라미터를 조회합니다.

```bash
qorechaind query rdk params
```

:::note
롤업 출금 증명 및 정산 상태 또한 `rdk` 그룹 아래에서 조회할 수 있습니다. 정확한 쿼리 하위 명령어와 인자는 사용 중인 롤업의 정산 유형에 따라 달라지므로, 출금/정산 쿼리의 정확한 범위는 **Rollup Development Kit** 문서를 참조하세요.
:::

---

## rlconsensus

PRISM은 합의 파라미터를 조정하는 강화학습 레이어입니다. CLI 모듈 이름 `rlconsensus`와 그 하위 명령어는 그대로 유지됩니다.

### agent-status

현재 PRISM 에이전트 상태와 모드를 조회합니다.

```bash
qorechaind query rlconsensus agent-status
```

### observation

최신 PRISM 관측 벡터를 조회합니다.

```bash
qorechaind query rlconsensus observation
```

### reward

누적 PRISM 보상 지표를 조회합니다.

```bash
qorechaind query rlconsensus reward
```

### params

PRISM Consensus 모듈 파라미터를 조회합니다.

```bash
qorechaind query rlconsensus params
```

### policy

활성 PRISM 정책 설정을 조회합니다.

```bash
qorechaind query rlconsensus policy
```

---

## babylon

### staking

주소의 BTC 스테이킹 포지션을 조회합니다.

```bash
qorechaind query babylon staking <address>
```

### checkpoint

특정 에폭의 BTC 체크포인트 데이터를 조회합니다.

```bash
qorechaind query babylon checkpoint <epoch>
```

### params

Babylon 모듈 파라미터를 조회합니다.

```bash
qorechaind query babylon params
```

---

## abstractaccount

### account

추상 계정 세부 정보를 조회합니다.

```bash
qorechaind query abstractaccount account <address>
```

### params

Abstract Account 모듈 파라미터를 조회합니다.

```bash
qorechaind query abstractaccount params
```

### permission-schema

11개의 권한, 메시지→권한 매핑, 그리고 위임 불가능한 키 관리 메시지로 구성된 표준 인증자 권한 분류 체계를 조회합니다(체인 버전 **v3.1.85** 기준으로 제공되며, REST `/qorechain/abstractaccount/v1/permission_schema`에서도 제공됩니다).

```bash
qorechaind query abstractaccount permission-schema
```

### auth-keygen / auth-sign-cosmos / auth-sign-evm

SDK 없이 인증자 권한 부여를 구성하기 위한 도우미 명령어입니다. 테스트용 키를 생성하거나, Native 레인 또는 EVM 레인의 위임 작업에 대해 **체인이 검증하는 정확한 서명 바이트**를 생성합니다(체인 버전 **v3.1.85** 기준으로 제공).

```bash
qorechaind query abstractaccount auth-keygen
qorechaind query abstractaccount auth-sign-cosmos <account> <to> <amount> <nonce>
qorechaind query abstractaccount auth-sign-evm <account> <to> <value> <data_hex> <nonce>
```

---

## gasabstraction

### accepted-tokens

가스 결제용으로 허용되는 토큰 목록을 조회합니다.

```bash
qorechaind query gasabstraction accepted-tokens
```

### params

Gas Abstraction 모듈 파라미터를 조회합니다.

```bash
qorechaind query gasabstraction params
```

---

## fairblock

### config

FairBlock 암호화 설정을 조회합니다.

```bash
qorechaind query fairblock config
```

### params

FairBlock 모듈 파라미터를 조회합니다.

```bash
qorechaind query fairblock params
```
