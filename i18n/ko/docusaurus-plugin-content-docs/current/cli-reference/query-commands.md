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
쿼리는 `--node`가 가리키는 노드를 대상으로 실행됩니다. 실시간 데이터를 조회하려면 **`qorechain-vladi`** 메인넷 RPC 엔드포인트(체인 버전 **v3.1.85**)를 사용하고, 테스트에는 **`qorechain-diana`** 테스트넷 엔드포인트를 사용하세요. 기본값인 `tcp://localhost:26657`은 직접 운영하는 노드를 대상으로 합니다.
:::

공통 플래그는 모든 `query` 하위 명령어에 적용됩니다.

| 플래그     | 타입   | 설명                                            |
| ---------- | ------ | ----------------------------------------------- |
| `--node`   | string | RPC 엔드포인트 (기본값: `tcp://localhost:26657`) |
| `--output` | string | 출력 형식: `json` 또는 `text`                   |
| `--height` | int    | 특정 블록 높이의 상태를 조회                    |

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

운영자 주소로 단일 밸리데이터를 조회합니다.

```bash
qorechaind query staking validator <validator_address>
```

### validators

모든 밸리데이터를 나열합니다.

```bash
qorechaind query staking validators
```

### delegation

위임자가 밸리데이터에게 위임한 내역을 조회합니다.

```bash
qorechaind query staking delegation <delegator_address> <validator_address>
```

### delegations

위임자의 모든 위임 내역을 조회합니다.

```bash
qorechaind query staking delegations <delegator_address>
```

### unbonding-delegation

언본딩 중인 위임을 조회합니다.

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

밸리데이터 커미션을 조회합니다.

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

모든 제안을 나열하며, 상태별로 필터링할 수 있습니다.

```bash
qorechaind query gov proposals [flags]
```

| 플래그     | 타입   | 설명                                                                      |
| ---------- | ------ | ------------------------------------------------------------------------- |
| `--status` | string | 상태별 필터: `deposit_period`, `voting_period`, `passed`, `rejected` |

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

지원되는 모든 PQC 알고리즘을 나열합니다.

```bash
qorechaind query pqc algorithms
```

### algorithm

특정 PQC 알고리즘의 상세 정보를 조회합니다.

```bash
qorechaind query pqc algorithm <algorithm_name>
```

### stats

PQC 등록 집계 통계를 조회합니다.

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

현재 하이브리드 서명 적용(enforcement) 모드를 조회합니다.

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

모든 채널의 소각 통계를 조회합니다.

```bash
qorechaind query burn stats
```

### params

burn 모듈 파라미터를 조회합니다.

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

현재 에포크 번호와 진행 상황을 조회합니다.

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

AI 모듈 구성을 조회합니다.

```bash
qorechaind query ai config
```

### stats

집계된 AI 처리 통계를 조회합니다.

```bash
qorechaind query ai stats
```

### fee-estimate

AI 보조 가스 수수료 추정치를 가져옵니다.

```bash
qorechaind query ai fee-estimate [flags]
```

| 플래그      | 타입   | 설명                            |
| ----------- | ------ | ------------------------------- |
| `--tx-type` | string | 추정에 사용할 트랜잭션 유형     |
| `--urgency` | string | `low`, `medium`, `high`         |

### investigations

진행 중인 사기 조사를 나열합니다.

```bash
qorechaind query ai investigations
```

### recommendations

AI가 생성한 네트워크 최적화 권장 사항을 가져옵니다.

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

모든 밸리데이터의 평판 점수를 조회합니다.

```bash
qorechaind query reputation validators
```

### validator

특정 밸리데이터의 평판 점수를 조회합니다.

```bash
qorechaind query reputation validator <validator_address>
```

---

## bridge

### chains

등록된 모든 브리지 체인을 나열합니다.

```bash
qorechaind query bridge chains
```

### chain

특정 브리지 체인의 상세 정보를 조회합니다.

```bash
qorechaind query bridge chain <chain_id>
```

### validators

활성 브리지 밸리데이터를 나열합니다.

```bash
qorechaind query bridge validators
```

### operations

최근 브리지 작업을 나열합니다.

```bash
qorechaind query bridge operations
```

| 플래그     | 타입   | 설명                                     |
| ---------- | ------ | ---------------------------------------- |
| `--status` | string | 필터: `pending`, `completed`, `failed` |
| `--chain`  | string | 체인 ID로 필터                           |

### limits

브리지 체인의 레이트 리밋을 조회합니다.

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

ID로 크로스-VM 메시지를 가져옵니다.

```bash
qorechaind query crossvm message <message_id>
```

### pending

대기 중인 크로스-VM 메시지를 나열합니다.

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

특정 레이어의 상세 정보를 조회합니다.

```bash
qorechaind query multilayer layer <layer_id>
```

### layers

등록된 모든 레이어를 나열합니다.

```bash
qorechaind query multilayer layers
```

### anchor

특정 앵커 레코드를 조회합니다.

```bash
qorechaind query multilayer anchor <anchor_id>
```

### anchors

최근 앵커 제출 내역을 나열합니다.

```bash
qorechaind query multilayer anchors [flags]
```

| 플래그       | 타입   | 설명                      |
| ------------ | ------ | ------------------------- |
| `--layer-id` | string | 레이어 ID로 필터          |
| `--limit`    | uint   | 반환할 최대 결과 수       |

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

특정 롤업의 상세 정보를 조회합니다.

```bash
qorechaind query rdk rollup <rollup_id>
```

### rollups

등록된 모든 롤업을 나열합니다.

```bash
qorechaind query rdk rollups
```

| 플래그     | 타입   | 설명                                  |
| ---------- | ------ | ------------------------------------- |
| `--status` | string | 필터: `active`, `paused`, `stopped` |

### batch

특정 정산(settlement) 배치를 조회합니다.

```bash
qorechaind query rdk batch <rollup_id> <batch_index>
```

### latest-batch

롤업의 최신 배치를 조회합니다.

```bash
qorechaind query rdk latest-batch <rollup_id>
```

### suggest-profile

AI 보조 롤업 프로필 추천을 가져옵니다.

```bash
qorechaind query rdk suggest-profile <use_case>
```

### blob

특정 DA 블롭을 조회합니다.

```bash
qorechaind query rdk blob <rollup_id> <blob_index>
```

### params

RDK 모듈 파라미터를 조회합니다.

```bash
qorechaind query rdk params
```

:::note
롤업 출금 증명과 정산 상태도 `rdk` 그룹에서 조회할 수 있습니다. 정확한 쿼리 하위 명령어와 인자는 롤업의 정산 유형에 따라 다릅니다. 출금/정산 쿼리에 대한 공식적인 내용은 **Rollup Development Kit** 문서를 참조하세요.
:::

---

## rlconsensus

PRISM은 합의 파라미터를 조정하는 강화학습 레이어입니다. CLI 모듈 이름 `rlconsensus`와 그 하위 명령어는 원문 그대로 유지됩니다.

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

활성 PRISM 정책 구성을 조회합니다.

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

지정한 에포크의 BTC 체크포인트 데이터를 조회합니다.

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

추상 계정(abstract account) 상세 정보를 조회합니다.

```bash
qorechaind query abstractaccount account <address>
```

### params

Abstract Account 모듈 파라미터를 조회합니다.

```bash
qorechaind query abstractaccount params
```

### permission-schema

표준(canonical) 인증자(authenticator) 권한 분류 체계를 조회합니다 — 11개 권한, 메시지→권한 매핑, 그리고 위임 불가능한 키 관리 메시지가 포함됩니다(체인 버전 **v3.1.85**부터 사용 가능하며, REST 경로 `/qorechain/abstractaccount/v1/permission_schema`로도 제공됩니다).

```bash
qorechaind query abstractaccount permission-schema
```

### auth-keygen / auth-sign-cosmos / auth-sign-evm

SDK 없이 인증자 승인(authorization)을 구성하기 위한 헬퍼입니다. 테스트 키를 생성하거나, Native 레인 또는 EVM 레인의 위임된 액션에 대해 **체인이 검증하는 것과 정확히 동일한 서명 바이트**를 생성합니다(체인 버전 **v3.1.85**부터 사용 가능).

```bash
qorechaind query abstractaccount auth-keygen
qorechaind query abstractaccount auth-sign-cosmos <account> <to> <amount> <nonce>
qorechaind query abstractaccount auth-sign-evm <account> <to> <value> <data_hex> <nonce>
```

---

## gasabstraction

### accepted-tokens

가스 지불에 사용할 수 있는 토큰을 나열합니다.

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

FairBlock 암호화 구성을 조회합니다.

```bash
qorechaind query fairblock config
```

### params

FairBlock 모듈 파라미터를 조회합니다.

```bash
qorechaind query fairblock params
```
