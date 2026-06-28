---
slug: /api-reference/rest-grpc-endpoints
title: REST / gRPC 엔드포인트
sidebar_label: REST / gRPC 엔드포인트
sidebar_position: 1
---

# REST / gRPC 엔드포인트

QoreChain은 프로그래밍 방식 접근을 위해 세 가지 주요 인터페이스를 제공합니다:

| 인터페이스 | 기본 포트 | 프로토콜  | 설명                        |
| --------- | ------------ | --------- | ---------------------------------- |
| REST      | `1317`       | HTTP/1.1  | LCD(Light Client Daemon) REST API |
| gRPC      | `9090`       | HTTP/2    | Protobuf로 인코딩된 gRPC 서비스      |
| RPC       | `26657`      | HTTP + WS | QoreChain 합의 엔진 RPC     |

모든 REST 엔드포인트는 JSON을 반환합니다. gRPC 엔드포인트는 Protocol Buffers를 사용하며 모든 gRPC 클라이언트로 사용할 수 있습니다. RPC 인터페이스는 합의 수준 쿼리와 트랜잭션 브로드캐스트를 제공합니다.

:::note
이 인터페이스들은 **`qorechain-vladi`** 메인넷(체인 버전 **v3.1.80**에서 2026년 6월 7일 이후 가동 중)과 **`qorechain-diana`** 테스트넷 모두에서 사용할 수 있습니다. 아래의 기본 URL은 로컬에서 실행 중인 노드를 가정합니다. 원격 접근의 경우 제공자의 메인넷 또는 테스트넷 호스트로 대체하세요.
:::

## 기본 URL

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## AI 모듈

| 메서드 | 엔드포인트                           | 설명                                        |
| ------ | ---------------------------------- | -------------------------------------------------- |
| GET    | `/ai/v1/config`                    | 현재 AI 모듈 구성을 반환            |
| GET    | `/ai/v1/stats`                     | 집계된 AI 처리 통계                |
| GET    | `/ai/v1/fee-estimate`              | 트랜잭션에 대한 AI 지원 가스 수수료 추정   |
| GET    | `/ai/v1/fraud/investigations`      | 모든 활성 사기 조사 목록              |
| GET    | `/ai/v1/fraud/investigations/{id}` | 특정 사기 조사에 대한 세부 정보를 반환 |
| GET    | `/ai/v1/network/recommendations`   | AI가 생성한 네트워크 최적화 권장 사항  |
| GET    | `/ai/v1/circuit-breakers`          | 현재 서킷 브레이커 상태 및 임계값      |

## Bridge 모듈 {#bridge-module}

체인 버전 **v3.1.77**부터, 브리지 모듈의 읽기 전용 상태는 grpc-gateway를 통해 `/qorechain/bridge/v1/...` 접두사 아래에서 REST로 노출됩니다(이전에는 gRPC 전용). 이 엔드포인트들은 익스플로러와 라이트 노드 텔레메트리를 위해 실제 온체인 JSON을 HTTP로 제공합니다. 브리지 `config`는 예를 들어 `min_validators=10`과 `threshold=7`을 보고합니다.

| 메서드 | 엔드포인트                                   | 설명                              |
| ------ | ------------------------------------------ | ---------------------------------------- |
| GET    | `/qorechain/bridge/v1/config`              | 현재 브리지 모듈 구성      |
| GET    | `/qorechain/bridge/v1/chains`              | 등록된 모든 브리지 체인 목록       |
| GET    | `/qorechain/bridge/v1/chains/{chain_id}`   | 특정 브리지 체인에 대한 세부 정보     |
| GET    | `/qorechain/bridge/v1/validators`          | 등록된 브리지 검증자 목록       |
| GET    | `/qorechain/bridge/v1/validators/{address}`| 특정 브리지 검증자에 대한 세부 정보  |
| GET    | `/qorechain/bridge/v1/operations`          | 브리지 작업 목록                  |
| GET    | `/qorechain/bridge/v1/operations/{id}`     | 특정 브리지 작업에 대한 세부 정보  |

다음의 더 짧은 경로 엔드포인트도 계속 사용할 수 있습니다:

| 메서드 | 엔드포인트                            | 설명                                    |
| ------ | ----------------------------------- | ---------------------------------------------- |
| GET    | `/bridge/v1/chains`                 | 등록된 모든 브리지 체인 목록             |
| GET    | `/bridge/v1/chains/{id}`            | 특정 브리지 체인에 대한 세부 정보           |
| GET    | `/bridge/v1/validators`             | 활성 브리지 검증자 목록                 |
| GET    | `/bridge/v1/operations`             | 최근 브리지 작업 목록                 |
| GET    | `/bridge/v1/operations/{id}`        | 특정 브리지 작업에 대한 세부 정보        |
| GET    | `/bridge/v1/locked/{chain}/{asset}` | 체인/자산 쌍에 대한 총 잠금 가치      |
| GET    | `/bridge/v1/limits/{chain}`         | 브리지 체인에 대한 속도 제한 및 임계값 |
| GET    | `/bridge/v1/estimate`               | 브리지 수수료 및 전송 시간을 추정         |

## PQC 모듈

| 메서드 | 엔드포인트                     | 설명                                    |
| ------ | ---------------------------- | ---------------------------------------------- |
| GET    | `/pqc/v1/params`             | 현재 PQC 모듈 매개변수                  |
| GET    | `/pqc/v1/accounts/{address}` | 특정 계정에 대한 PQC 키 상태          |
| GET    | `/pqc/v1/stats`              | 집계된 PQC 등록 및 마이그레이션 통계 |

## Reputation 모듈

| 메서드 | 엔드포인트                              | 설명                               |
| ------ | ------------------------------------- | ----------------------------------------- |
| GET    | `/reputation/v1/validators`           | 모든 검증자의 평판 점수      |
| GET    | `/reputation/v1/validators/{address}` | 특정 검증자의 평판 점수 |

## Cross-VM 모듈

| 메서드 | 엔드포인트                   | 설명                              |
| ------ | -------------------------- | ---------------------------------------- |
| GET    | `/crossvm/v1/message/{id}` | ID로 cross-VM 메시지를 검색       |
| GET    | `/crossvm/v1/pending`      | 큐에서 대기 중인 cross-VM 메시지 목록 |
| GET    | `/crossvm/v1/params`       | 현재 Cross-VM 모듈 매개변수       |

## Multilayer 모듈 {#multilayer-module}

체인 버전 **v3.1.80**부터, 멀티레이어 모듈의 전체 쿼리 서비스는 grpc-gateway를 통해 `/qorechain/multilayer/v1/...` 접두사 아래에서 REST로 노출됩니다(이전에는 gRPC 전용). 여기에는 두 가지 **상태 앵커 읽기 쿼리**가 포함됩니다: `anchor/{layer_id}`는 레이어의 최신 정산 앵커를 반환하고, `anchors/{layer_id}`는 해당 앵커 이력을 반환합니다. 각 앵커는 정규 필드에 대한 **ML-DSA-87 (Dilithium-5)** 서명을 포함하므로, 클라이언트는 앵커를 가져와 독립적으로 검증할 수 있습니다. 이는 Rollup Development Kit의 [정산 영수증](/rollups/settlement-receipts)을 위한 온체인 기반입니다.

| 메서드 | 엔드포인트                                        | 설명                                       |
| ------ | ----------------------------------------------- | ------------------------------------------------- |
| GET    | `/qorechain/multilayer/v1/params`               | 현재 Multilayer 모듈 매개변수              |
| GET    | `/qorechain/multilayer/v1/layers`               | 등록된 모든 레이어 목록                       |
| GET    | `/qorechain/multilayer/v1/layers/{layer_id}`    | 특정 레이어에 대한 세부 정보                      |
| GET    | `/qorechain/multilayer/v1/anchor/{layer_id}`    | 레이어의 최신 상태 앵커                   |
| GET    | `/qorechain/multilayer/v1/anchors/{layer_id}`   | 레이어의 상태 앵커 이력                  |
| GET    | `/qorechain/multilayer/v1/routing-stats`        | 레이어 전반의 트랜잭션 라우팅 통계      |

`StateAnchorView`는 `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, `main_chain_height`, `anchored_at`, `pqc_aggregate_signature`, `transaction_count`, `compressed_state_proof`를 포함합니다. 서명된 정규 메시지는 `layer_id || layer_height || state_root || validator_set_hash`이며, 레이어 생성자의 등록된 PQC 키에 대해 검증됩니다.

다음의 더 짧은 경로 엔드포인트도 계속 사용할 수 있습니다:

| 메서드 | 엔드포인트                       | 설명                                  |
| ------ | ------------------------------ | -------------------------------------------- |
| GET    | `/multilayer/v1/layer/{id}`    | 특정 레이어에 대한 세부 정보                 |
| GET    | `/multilayer/v1/layers`        | 등록된 모든 레이어 목록                  |
| GET    | `/multilayer/v1/anchor/{id}`   | 특정 앵커 레코드에 대한 세부 정보         |
| GET    | `/multilayer/v1/anchors`       | 최근 앵커 제출 목록              |
| GET    | `/multilayer/v1/routing-stats` | 레이어 전반의 트랜잭션 라우팅 통계 |
| GET    | `/multilayer/v1/params`        | 현재 Multilayer 모듈 매개변수         |

## SVM 모듈

| 메서드 | 엔드포인트                    | 설명                                       |
| ------ | --------------------------- | ------------------------------------------------- |
| GET    | `/svm/v1/params`            | 현재 SVM 모듈 매개변수                     |
| GET    | `/svm/v1/account/{address}` | 주어진 주소에 대한 SVM 계정 정보              |
| GET    | `/svm/v1/program/{address}` | 주어진 프로그램 주소에 대한 배포된 프로그램 정보 |

## RL Consensus 모듈

PRISM 튜닝 매개변수와 강화 학습 에이전트 상태가 이 모듈을 통해 노출됩니다.

| 메서드 | 엔드포인트                      | 설명                             |
| ------ | ----------------------------- | --------------------------------------- |
| GET    | `/rlconsensus/v1/agent`       | 현재 PRISM 에이전트 상태 및 모드     |
| GET    | `/rlconsensus/v1/observation` | 최신 관측 벡터               |
| GET    | `/rlconsensus/v1/rewards`     | 누적 보상 지표               |
| GET    | `/rlconsensus/v1/params`      | 현재 PRISM Consensus 모듈 매개변수 |
| GET    | `/rlconsensus/v1/policy`      | 활성 정책 구성 및 가중치 |

## Burn 모듈

체인 버전 **v3.1.77**부터, 번 모듈의 읽기 전용 상태는 grpc-gateway를 통해 `/qorechain/burn/v1/...` 접두사 아래에서 REST로 노출됩니다(이전에는 gRPC 전용). 이 엔드포인트들은 익스플로러와 라이트 노드 텔레메트리를 위해 실제 온체인 JSON을 HTTP로 제공합니다. 번 `stats`는 예를 들어 `gas_burn_rate=0.30`을 포함합니다.

| 메서드 | 엔드포인트                       | 설명                          |
| ------ | ------------------------------ | ------------------------------------ |
| GET    | `/qorechain/burn/v1/params`    | 현재 Burn 모듈 매개변수       |
| GET    | `/qorechain/burn/v1/stats`     | 모든 채널 전반의 번 통계  |
| GET    | `/qorechain/burn/v1/records`   | 번 레코드 목록                   |
| GET    | `/qorechain/burn/v1/milestone` | 번 마일스톤 진행 상황             |

다음의 더 짧은 경로 엔드포인트도 계속 사용할 수 있습니다:

| 메서드 | 엔드포인트          | 설명                         |
| ------ | ----------------- | ----------------------------------- |
| GET    | `/burn/v1/stats`  | 모든 채널 전반의 번 통계 |
| GET    | `/burn/v1/params` | 현재 Burn 모듈 매개변수      |

## xQORE 모듈

| 메서드 | 엔드포인트                       | 설명                                |
| ------ | ------------------------------ | ------------------------------------------ |
| GET    | `/xqore/v1/position/{address}` | 주어진 주소에 대한 xQORE 스테이킹 포지션 |
| GET    | `/xqore/v1/params`             | 현재 xQORE 모듈 매개변수            |

## Inflation 모듈

| 메서드 | 엔드포인트               | 설명                         |
| ------ | ---------------------- | ----------------------------------- |
| GET    | `/inflation/v1/rate`   | 현재 연간 인플레이션율   |
| GET    | `/inflation/v1/epoch`  | 현재 에포크 번호 및 진행 상황   |
| GET    | `/inflation/v1/params` | 현재 Inflation 모듈 매개변수 |

## RDK 모듈

| 메서드 | 엔드포인트                     | 설명                           |
| ------ | ---------------------------- | ------------------------------------- |
| GET    | `/rdk/v1/rollup/{id}`        | 특정 롤업에 대한 세부 정보         |
| GET    | `/rdk/v1/rollups`            | 등록된 모든 롤업 목록          |
| GET    | `/rdk/v1/batch/{id}/{index}` | 특정 정산 배치를 검색 |
| GET    | `/rdk/v1/batches/{id}`       | 특정 롤업에 대한 배치 목록   |
| GET    | `/rdk/v1/blob/{id}/{index}`  | 특정 DA 블롭을 검색          |
| GET    | `/rdk/v1/params`             | 현재 RDK 모듈 매개변수         |

## Babylon 모듈

| 메서드 | 엔드포인트                         | 설명                              |
| ------ | -------------------------------- | ---------------------------------------- |
| GET    | `/babylon/v1/staking/{address}`  | 주어진 주소에 대한 BTC 스테이킹 포지션 |
| GET    | `/babylon/v1/checkpoint/{epoch}` | 주어진 에포크에 대한 BTC 체크포인트 데이터    |
| GET    | `/babylon/v1/params`             | 현재 Babylon 모듈 매개변수        |

## Abstract Account 모듈

| 메서드 | 엔드포인트                                | 설명                                  |
| ------ | --------------------------------------- | -------------------------------------------- |
| GET    | `/abstractaccount/v1/account/{address}` | 주어진 주소에 대한 추상 계정 세부 정보 |
| GET    | `/abstractaccount/v1/params`            | 현재 Abstract Account 모듈 매개변수   |

## FairBlock 모듈

| 메서드 | 엔드포인트               | 설명                                |
| ------ | ---------------------- | ------------------------------------------ |
| GET    | `/fairblock/v1/config` | 현재 FairBlock 암호화 구성 |
| GET    | `/fairblock/v1/params` | 현재 FairBlock 모듈 매개변수        |

## Gas Abstraction 모듈

| 메서드 | 엔드포인트                             | 설명                               |
| ------ | ------------------------------------ | ----------------------------------------- |
| GET    | `/gasabstraction/v1/accepted-tokens` | 가스 결제에 허용되는 토큰 목록     |
| GET    | `/gasabstraction/v1/params`          | 현재 Gas Abstraction 모듈 매개변수 |

## gRPC 리플렉션

gRPC 서버 리플렉션은 기본적으로 활성화되어 있어, `grpcurl`과 같은 도구가 사용 가능한 서비스를 검색할 수 있습니다:

```bash
grpcurl -plaintext localhost:9090 list
```

특정 서비스를 쿼리하려면:

```bash
grpcurl -plaintext localhost:9090 qorechain.pqc.v1.Query/Params
```

## 인증

모든 REST 및 gRPC 엔드포인트는 기본적으로 인증되지 않습니다. 프로덕션 배포의 경우, TLS 종료 및 접근 제어를 처리하기 위해 노드 앞에 리버스 프록시(예: Nginx 또는 Caddy)를 배치하세요.
