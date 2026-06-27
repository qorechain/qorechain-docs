---
slug: /api-reference/rest-grpc-endpoints
title: REST / gRPC 엔드포인트
sidebar_label: REST / gRPC 엔드포인트
sidebar_position: 1
---

# REST / gRPC 엔드포인트

QoreChain은 프로그래밍 방식 접근을 위해 세 가지 주요 인터페이스를 제공합니다:

| 인터페이스 | 기본 포트    | 프로토콜  | 설명                               |
| --------- | ------------ | --------- | ---------------------------------- |
| REST      | `1317`       | HTTP/1.1  | LCD(Light Client Daemon) REST API  |
| gRPC      | `9090`       | HTTP/2    | Protobuf 인코딩 gRPC 서비스        |
| RPC       | `26657`      | HTTP + WS | QoreChain 합의 엔진 RPC            |

모든 REST 엔드포인트는 JSON을 반환합니다. gRPC 엔드포인트는 Protocol Buffers를 사용하며 모든 gRPC 클라이언트로 사용할 수 있습니다. RPC 인터페이스는 합의 수준 쿼리와 트랜잭션 브로드캐스트를 제공합니다.

:::note
이 인터페이스들은 **`qorechain-vladi`** 메인넷(2026년 6월 7일부터 체인 버전 **v3.1.77**에서 가동 중)과 **`qorechain-diana`** 테스트넷 모두에서 사용할 수 있습니다. 아래 기본 URL은 로컬에서 실행 중인 노드를 가정합니다. 원격 접속의 경우 공급자의 메인넷 또는 테스트넷 호스트로 대체하세요.
:::

## 기본 URL

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## AI 모듈

| 메서드 | 엔드포인트                         | 설명                                               |
| ------ | ---------------------------------- | -------------------------------------------------- |
| GET    | `/ai/v1/config`                    | 현재 AI 모듈 구성을 반환합니다                      |
| GET    | `/ai/v1/stats`                     | 집계된 AI 처리 통계                                 |
| GET    | `/ai/v1/fee-estimate`              | 트랜잭션에 대한 AI 지원 가스 수수료 추정           |
| GET    | `/ai/v1/fraud/investigations`      | 모든 활성 사기 조사를 나열합니다                   |
| GET    | `/ai/v1/fraud/investigations/{id}` | 특정 사기 조사의 세부 정보를 반환합니다           |
| GET    | `/ai/v1/network/recommendations`   | AI 생성 네트워크 최적화 권장 사항                  |
| GET    | `/ai/v1/circuit-breakers`          | 현재 서킷 브레이커 상태와 임계값                   |

## 브리지 모듈 {#bridge-module}

체인 버전 **v3.1.77**부터 브리지 모듈의 읽기 전용 상태는 grpc-gateway를 통해 `/qorechain/bridge/v1/...` 접두사 아래 REST로 노출됩니다(이전에는 gRPC 전용). 이 엔드포인트들은 탐색기 및 라이트 노드 텔레메트리를 위해 HTTP를 통해 실제 온체인 JSON을 제공합니다. 브리지 `config`는 예를 들어 `min_validators=10` 및 `threshold=7`을 보고합니다.

| 메서드 | 엔드포인트                                 | 설명                                     |
| ------ | ------------------------------------------ | ---------------------------------------- |
| GET    | `/qorechain/bridge/v1/config`              | 현재 브리지 모듈 구성                     |
| GET    | `/qorechain/bridge/v1/chains`              | 등록된 모든 브리지 체인을 나열합니다     |
| GET    | `/qorechain/bridge/v1/chains/{chain_id}`   | 특정 브리지 체인의 세부 정보             |
| GET    | `/qorechain/bridge/v1/validators`          | 등록된 브리지 검증자를 나열합니다       |
| GET    | `/qorechain/bridge/v1/validators/{address}`| 특정 브리지 검증자의 세부 정보           |
| GET    | `/qorechain/bridge/v1/operations`          | 브리지 작업을 나열합니다                 |
| GET    | `/qorechain/bridge/v1/operations/{id}`     | 특정 브리지 작업의 세부 정보             |

다음의 더 짧은 경로 엔드포인트도 계속 사용할 수 있습니다:

| 메서드 | 엔드포인트                          | 설명                                           |
| ------ | ----------------------------------- | ---------------------------------------------- |
| GET    | `/bridge/v1/chains`                 | 등록된 모든 브리지 체인을 나열합니다           |
| GET    | `/bridge/v1/chains/{id}`            | 특정 브리지 체인의 세부 정보                   |
| GET    | `/bridge/v1/validators`             | 활성 브리지 검증자를 나열합니다               |
| GET    | `/bridge/v1/operations`             | 최근 브리지 작업을 나열합니다                 |
| GET    | `/bridge/v1/operations/{id}`        | 특정 브리지 작업의 세부 정보                   |
| GET    | `/bridge/v1/locked/{chain}/{asset}` | 체인/자산 쌍의 총 잠긴 가치                    |
| GET    | `/bridge/v1/limits/{chain}`         | 브리지 체인의 속도 제한과 임계값             |
| GET    | `/bridge/v1/estimate`               | 브리지 수수료와 전송 시간을 추정합니다         |

## PQC 모듈

| 메서드 | 엔드포인트                   | 설명                                           |
| ------ | ---------------------------- | ---------------------------------------------- |
| GET    | `/pqc/v1/params`             | 현재 PQC 모듈 매개변수                          |
| GET    | `/pqc/v1/accounts/{address}` | 특정 계정의 PQC 키 상태                        |
| GET    | `/pqc/v1/stats`              | 집계된 PQC 등록 및 마이그레이션 통계          |

## 평판 모듈

| 메서드 | 엔드포인트                            | 설명                                      |
| ------ | ------------------------------------- | ----------------------------------------- |
| GET    | `/reputation/v1/validators`           | 모든 검증자의 평판 점수                    |
| GET    | `/reputation/v1/validators/{address}` | 특정 검증자의 평판 점수                   |

## 크로스 VM 모듈

| 메서드 | 엔드포인트                 | 설명                                     |
| ------ | -------------------------- | ---------------------------------------- |
| GET    | `/crossvm/v1/message/{id}` | ID로 크로스 VM 메시지를 조회합니다       |
| GET    | `/crossvm/v1/pending`      | 큐에서 대기 중인 크로스 VM 메시지를 나열합니다 |
| GET    | `/crossvm/v1/params`       | 현재 크로스 VM 모듈 매개변수             |

## 멀티레이어 모듈

| 메서드 | 엔드포인트                     | 설명                                         |
| ------ | ------------------------------ | -------------------------------------------- |
| GET    | `/multilayer/v1/layer/{id}`    | 특정 계층의 세부 정보                         |
| GET    | `/multilayer/v1/layers`        | 등록된 모든 계층을 나열합니다               |
| GET    | `/multilayer/v1/anchor/{id}`   | 특정 앵커 레코드의 세부 정보                 |
| GET    | `/multilayer/v1/anchors`       | 최근 앵커 제출을 나열합니다                 |
| GET    | `/multilayer/v1/routing-stats` | 계층 간 트랜잭션 라우팅 통계                 |
| GET    | `/multilayer/v1/params`        | 현재 멀티레이어 모듈 매개변수               |

## SVM 모듈

| 메서드 | 엔드포인트                  | 설명                                              |
| ------ | --------------------------- | ------------------------------------------------- |
| GET    | `/svm/v1/params`            | 현재 SVM 모듈 매개변수                            |
| GET    | `/svm/v1/account/{address}` | 주어진 주소의 SVM 계정 정보                       |
| GET    | `/svm/v1/program/{address}` | 주어진 프로그램 주소의 배포된 프로그램 정보       |

## RL 합의 모듈

PRISM 튜닝 매개변수와 강화 학습 에이전트 상태가 이 모듈을 통해 노출됩니다.

| 메서드 | 엔드포인트                    | 설명                                    |
| ------ | ----------------------------- | --------------------------------------- |
| GET    | `/rlconsensus/v1/agent`       | 현재 PRISM 에이전트 상태와 모드         |
| GET    | `/rlconsensus/v1/observation` | 최신 관측 벡터                          |
| GET    | `/rlconsensus/v1/rewards`     | 누적 보상 지표                          |
| GET    | `/rlconsensus/v1/params`      | 현재 PRISM 합의 모듈 매개변수           |
| GET    | `/rlconsensus/v1/policy`      | 활성 정책 구성과 가중치                 |

## 소각 모듈

체인 버전 **v3.1.77**부터 소각 모듈의 읽기 전용 상태는 grpc-gateway를 통해 `/qorechain/burn/v1/...` 접두사 아래 REST로 노출됩니다(이전에는 gRPC 전용). 이 엔드포인트들은 탐색기 및 라이트 노드 텔레메트리를 위해 HTTP를 통해 실제 온체인 JSON을 제공합니다. 소각 `stats`에는 예를 들어 `gas_burn_rate=0.30`이 포함됩니다.

| 메서드 | 엔드포인트                     | 설명                                 |
| ------ | ------------------------------ | ------------------------------------ |
| GET    | `/qorechain/burn/v1/params`    | 현재 소각 모듈 매개변수               |
| GET    | `/qorechain/burn/v1/stats`     | 모든 채널에 걸친 소각 통계           |
| GET    | `/qorechain/burn/v1/records`   | 소각 레코드를 나열합니다             |
| GET    | `/qorechain/burn/v1/milestone` | 소각 마일스톤 진행 상황              |

다음의 더 짧은 경로 엔드포인트도 계속 사용할 수 있습니다:

| 메서드 | 엔드포인트        | 설명                                |
| ------ | ----------------- | ----------------------------------- |
| GET    | `/burn/v1/stats`  | 모든 채널에 걸친 소각 통계          |
| GET    | `/burn/v1/params` | 현재 소각 모듈 매개변수             |

## xQORE 모듈

| 메서드 | 엔드포인트                     | 설명                                       |
| ------ | ------------------------------ | ------------------------------------------ |
| GET    | `/xqore/v1/position/{address}` | 주어진 주소의 xQORE 스테이킹 포지션        |
| GET    | `/xqore/v1/params`             | 현재 xQORE 모듈 매개변수                    |

## 인플레이션 모듈

| 메서드 | 엔드포인트             | 설명                                |
| ------ | ---------------------- | ----------------------------------- |
| GET    | `/inflation/v1/rate`   | 현재 연간 인플레이션율              |
| GET    | `/inflation/v1/epoch`  | 현재 에포크 번호와 진행 상황        |
| GET    | `/inflation/v1/params` | 현재 인플레이션 모듈 매개변수       |

## RDK 모듈

| 메서드 | 엔드포인트                   | 설명                                  |
| ------ | ---------------------------- | ------------------------------------- |
| GET    | `/rdk/v1/rollup/{id}`        | 특정 롤업의 세부 정보                 |
| GET    | `/rdk/v1/rollups`            | 등록된 모든 롤업을 나열합니다         |
| GET    | `/rdk/v1/batch/{id}/{index}` | 특정 정산 배치를 조회합니다           |
| GET    | `/rdk/v1/batches/{id}`       | 특정 롤업의 배치를 나열합니다         |
| GET    | `/rdk/v1/blob/{id}/{index}`  | 특정 DA 블롭을 조회합니다             |
| GET    | `/rdk/v1/params`             | 현재 RDK 모듈 매개변수               |

## Babylon 모듈

| 메서드 | 엔드포인트                       | 설명                                     |
| ------ | -------------------------------- | ---------------------------------------- |
| GET    | `/babylon/v1/staking/{address}`  | 주어진 주소의 BTC 스테이킹 포지션        |
| GET    | `/babylon/v1/checkpoint/{epoch}` | 주어진 에포크의 BTC 체크포인트 데이터    |
| GET    | `/babylon/v1/params`             | 현재 Babylon 모듈 매개변수               |

## 추상 계정 모듈

| 메서드 | 엔드포인트                              | 설명                                         |
| ------ | --------------------------------------- | -------------------------------------------- |
| GET    | `/abstractaccount/v1/account/{address}` | 주어진 주소의 추상 계정 세부 정보            |
| GET    | `/abstractaccount/v1/params`            | 현재 추상 계정 모듈 매개변수                 |

## FairBlock 모듈

| 메서드 | 엔드포인트             | 설명                                       |
| ------ | ---------------------- | ------------------------------------------ |
| GET    | `/fairblock/v1/config` | 현재 FairBlock 암호화 구성                  |
| GET    | `/fairblock/v1/params` | 현재 FairBlock 모듈 매개변수               |

## 가스 추상화 모듈

| 메서드 | 엔드포인트                           | 설명                                      |
| ------ | ------------------------------------ | ----------------------------------------- |
| GET    | `/gasabstraction/v1/accepted-tokens` | 가스 결제에 허용된 토큰을 나열합니다     |
| GET    | `/gasabstraction/v1/params`          | 현재 가스 추상화 모듈 매개변수           |

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

모든 REST 및 gRPC 엔드포인트는 기본적으로 인증되지 않습니다. 프로덕션 배포의 경우, TLS 종료와 접근 제어를 처리하기 위해 노드 앞에 리버스 프록시(예: Nginx 또는 Caddy)를 배치하세요.
