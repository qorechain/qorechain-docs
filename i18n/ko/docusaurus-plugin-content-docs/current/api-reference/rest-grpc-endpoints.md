---
slug: /api-reference/rest-grpc-endpoints
title: REST / gRPC 엔드포인트
sidebar_label: REST / gRPC 엔드포인트
sidebar_position: 1
---

# REST / gRPC 엔드포인트

QoreChain은 프로그래밍 방식 접근을 위해 세 가지 기본 인터페이스를 제공합니다:

| 인터페이스 | 기본 포트 | 프로토콜  | 설명                        |
| --------- | ------------ | --------- | ---------------------------------- |
| REST      | `1317`       | HTTP/1.1  | REST 게이트웨이(Cosmos SDK API 서버) |
| gRPC      | `9090`       | HTTP/2    | Protobuf로 인코딩된 gRPC 서비스      |
| RPC       | `26657`      | HTTP + WS | QoreChain 합의 엔진 RPC     |

모든 REST 엔드포인트는 JSON을 반환합니다. gRPC 엔드포인트는 Protocol Buffers를 사용하며 어떤 gRPC 클라이언트로도 사용할 수 있습니다. RPC 인터페이스는 합의 수준의 조회와 트랜잭션 브로드캐스트를 제공합니다.

:::note
이 인터페이스들은 **`qorechain-vladi`** 메인넷(2026년 6월 29일부터 가동 중)과 **`qorechain-diana`** 테스트넷 모두에서 사용할 수 있습니다. 아래의 기본 URL은 로컬에서 실행 중인 노드를 기준으로 합니다. 공개 호스팅 엔드포인트는 `https://api.qore.host` / `https://api-testnet.qore.host`(REST)와 `https://rpc.qore.host` / `https://rpc-testnet.qore.host`(RPC)이며, [네트워크](/appendix/networks#public-endpoints)에 정리되어 있습니다. **공개 gRPC 엔드포인트는 없습니다**: 호스트 이름 `grpc.qore.host`와 `grpc-testnet.qore.host`는 존재하지 않으므로, gRPC가 필요하면 직접 노드를 실행하십시오.
:::

## 기본 URL

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## 존재하는 라우트 {#which-routes-exist}

QoreChain 전용 모듈은 REST에서 `/qorechain/<module>/v1/...` 접두사 아래에 노출되며, 아래에 나열된 모듈에만 REST 라우트가 있습니다. 나머지 모듈은 **gRPC로만** 접근할 수 있습니다([gRPC 전용 모듈](#grpc-only-modules) 참조). 표준 Cosmos SDK, EVM, CosmWasm 라우트는 [표준 라우트](#standard-routes)에 나열되어 있습니다.

존재하지 않는 라우트는 HTTP `501`과 `{"code":12,"message":"Not Implemented"}`로 응답합니다. 이는 쿼리 결과가 비어 있다는 뜻이 아니라 해당 라우트가 제공되지 않는다는 뜻입니다. `/qorechain/` 접두사가 없는 짧은 경로(예: `/bridge/v1/chains` 또는 `/pqc/v1/params`)는 제공되지 **않습니다**. 존재하는 라우트에서 알 수 없는 레코드를 조회하면 HTTP `404`와 `{"code":5,"message":"... not found"}`가 반환됩니다.

아래 예시는 공개 메인넷 호스트를 사용합니다. 테스트넷에서는 `https://api-testnet.qore.host`로 바꾸십시오.

## PQC 모듈 {#pqc-module}

| 메서드 | 엔드포인트                                 | 설명                                                                 |
| ------ | ---------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/qorechain/pqc/v1/account/{address}`    | 계정의 양자내성 키 등록 정보(`found`, 키 유형, 알고리즘) |
| GET    | `/qorechain/pqc/v1/evm_window/{address}` | 계정의 EVM 레인 승인 윈도우와 그 잔여 한도          |

경로 세그먼트는 단수형 `account`입니다. `/qorechain/pqc/v1/params` 또는 `/stats` 라우트는 없습니다.

```bash
curl -s https://api.qore.host/qorechain/pqc/v1/account/qor1...
```

```json
{
  "found": true,
  "account": {
    "address": "qor1...",
    "public_key": "<base64 ML-DSA-87 public key>",
    "algorithm_id": 1,
    "algorithm_name": "dilithium5",
    "ecdsa_pubkey": null,
    "key_type": "hybrid",
    "created_at_height": "209015",
    "migration_public_key": null,
    "migration_algorithm_id": 0
  }
}
```

등록된 키가 없는 계정은 `{"found": false, "account": null}`을 반환합니다. 계정이 전송하기 전에 키를 등록해야 하는지 판단하려면 `found`를 사용하십시오.

```bash
curl -s https://api.qore.host/qorechain/pqc/v1/evm_window/qor1...
```

```json
{
  "found": false,
  "live": false,
  "opened_height": "0",
  "expiry_height": "0",
  "max_txs": "0",
  "used_txs": "0",
  "max_value": "",
  "used_value": "",
  "remaining_blocks": "0",
  "remaining_txs": "0",
  "remaining_value": ""
}
```

이 라우트는 윈도우가 없는 주소에 대해서도 실패하지 않고 `found: false`를 반환합니다. v3.2.0부터 EVM 레인은 등록된 PQC 키가 있고 **동시에** 열린 윈도우가 있는 계정의 트랜잭션만 허용합니다. `live`는 윈도우가 현재 높이에서 트랜잭션을 최소 하나 더 허용하는 동안 `true`입니다. `remaining_blocks`, `remaining_txs`, `remaining_value`는 어느 한도가 가장 먼저 소진될지 보여 주며, 값은 문자열로 반환되는 `uqor` 정수입니다. EVM 레인의 동작 방식은 [EVM 개발](/developer-guide/evm-development)을 참조하십시오.

## 브리지 모듈 {#bridge-module}

브리지 모듈의 읽기 전용 상태는 `/qorechain/bridge/v1/...` 아래에서 REST로 노출됩니다(체인 버전 **v3.1.77**부터 실제 온체인 JSON 제공). 브리지 `config`는 예를 들어 `min_validators=10`과 `attestation_threshold=7`을 보고합니다.

| 메서드 | 엔드포인트                                    | 설명                              |
| ------ | ------------------------------------------- | ---------------------------------------- |
| GET    | `/qorechain/bridge/v1/config`               | 현재 브리지 모듈 구성      |
| GET    | `/qorechain/bridge/v1/chains`               | 등록된 모든 브리지 체인 목록       |
| GET    | `/qorechain/bridge/v1/chains/{chain_id}`    | 특정 브리지 체인의 상세 정보     |
| GET    | `/qorechain/bridge/v1/validators`           | 등록된 브리지 검증인 목록       |
| GET    | `/qorechain/bridge/v1/validators/{address}` | 특정 브리지 검증인의 상세 정보  |
| GET    | `/qorechain/bridge/v1/operations`           | 브리지 작업 목록                  |
| GET    | `/qorechain/bridge/v1/operations/{id}`      | 특정 브리지 작업의 상세 정보  |

```bash
curl -s https://api.qore.host/qorechain/bridge/v1/config
```

```json
{
  "config": {
    "min_validators": 10,
    "attestation_threshold": 7,
    "challenge_period_secs": "86400",
    "large_transfer_threshold": "100000000000",
    "enabled": true
  }
}
```

`chains/{chain_id}`는 `{"chain": {"chain_id": "ethereum", "name": "Ethereum", "chain_type": "evm", "bridge_contract": "0x000…0", "status": "pending", "min_confirmations": 12, ...}}`와 같은 항목 하나를 반환합니다.

:::caution 브리지는 아직 가동되지 않았습니다
구성된 37개의 브리지 체인은 두 네트워크 모두에서 `"status": "pending"`으로 보고되며, `validators`와 `operations`는 빈 목록입니다. 이 라우트들은 모듈의 구성을 보여 줄 뿐, 오늘 자산을 브리지할 수 있다는 의미가 아닙니다. [브리지 아키텍처](/architecture/bridge-architecture)를 참조하십시오.
:::

## 멀티레이어 모듈 {#multilayer-module}

멀티레이어 모듈의 전체 쿼리 서비스는 `/qorechain/multilayer/v1/...` 아래에서 REST로 노출되며(체인 버전 **v3.1.80**부터), 두 개의 **상태 앵커 읽기 쿼리**가 포함됩니다: `anchor/{layer_id}`는 레이어의 최신 정산 앵커를 반환하고, `anchors/{layer_id}`는 해당 레이어의 앵커 이력을 반환합니다. 각 앵커는 정규(canonical) 필드에 대한 **ML-DSA-87 (Dilithium-5)** 서명을 포함하므로, 클라이언트가 앵커를 가져와 독립적으로 검증할 수 있습니다 — 이는 Rollup Development Kit의 [정산 영수증](/rollups/settlement-receipts)의 온체인 기반입니다.

| 메서드 | 엔드포인트                                        | 설명                                       |
| ------ | ----------------------------------------------- | ------------------------------------------------- |
| GET    | `/qorechain/multilayer/v1/params`               | 현재 Multilayer 모듈 파라미터              |
| GET    | `/qorechain/multilayer/v1/layers`               | 등록된 모든 레이어 목록                       |
| GET    | `/qorechain/multilayer/v1/layers/{layer_id}`    | 특정 레이어의 상세 정보                      |
| GET    | `/qorechain/multilayer/v1/anchor/{layer_id}`    | 레이어의 최신 상태 앵커                   |
| GET    | `/qorechain/multilayer/v1/anchors/{layer_id}`   | 레이어의 상태 앵커 이력                  |
| GET    | `/qorechain/multilayer/v1/routing-stats`        | 레이어 전반의 트랜잭션 라우팅 통계      |

`StateAnchorView`는 `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, `main_chain_height`, `anchored_at`, `pqc_aggregate_signature`, `transaction_count`, `compressed_state_proof`를 포함합니다. 서명되는 정규 메시지는 `layer_id || layer_height || state_root || validator_set_hash`이며, 레이어 생성자가 등록한 PQC 키에 대해 검증됩니다. 앵커가 없는 레이어는 `anchor/{layer_id}`에서 HTTP `404`(`no anchor for layer ...`)를, `anchors/{layer_id}`에서 빈 목록(`{"anchors": []}`)을 반환합니다.

```bash
curl -s https://api.qore.host/qorechain/multilayer/v1/params
```

```json
{
  "params": {
    "max_sidechains": "10",
    "max_paychains": "50",
    "min_anchor_interval": "100",
    "max_anchor_interval": "1000",
    "default_challenge_period": "86400",
    "min_sidechain_stake": "1000000000",
    "min_paychain_stake": "100000000",
    "routing_enabled": true,
    "routing_confidence_threshold": "0.6",
    "cross_layer_fee_bundling": true
  }
}
```

작성 시점 기준으로 `layers`는 두 네트워크 모두에서 빈 목록입니다.

## 소각 모듈 {#burn-module}

소각 모듈의 읽기 전용 상태는 `/qorechain/burn/v1/...` 아래에서 REST로 노출됩니다. 소각 `params`에는 예를 들어 `gas_burn_rate=0.30`이 포함됩니다.

| 메서드 | 엔드포인트                              | 설명                                                    |
| ------ | ------------------------------------- | -------------------------------------------------------------- |
| GET    | `/qorechain/burn/v1/params`           | 현재 Burn 모듈 파라미터                                 |
| GET    | `/qorechain/burn/v1/stats`            | 소스별로 구분한 누적 소각 총량                   |
| GET    | `/qorechain/burn/v1/records`          | 최근 소각 기록 목록                                  |
| GET    | `/qorechain/burn/v1/milestone`        | 소각 마일스톤 진행 상황(누적 트랜잭션 수)         |
| GET    | `/qorechain/burn/v1/stranded_rewards` | v3.2.0 업그레이드에서 따로 확보되어 아직 해제되지 않은 스테이커 몫 |

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stats
```

```json
{
  "stats": {
    "total_burned": "31560093291491",
    "burns_by_source": {
      "gas_fee": "31560093291491",
      "failed_tx": "0",
      "milestone": "0",
      "amm": "0",
      "xqore_penalty": "0"
    },
    "last_burn_height": "3506945"
  }
}
```

실제 응답에는 모든 소각 소스(`ai_service`, `amm`, `auto_buyback`, `bridge_fee`, `contract_create`, `failed_tx`, `gas_fee`, `milestone`, `rollup_create`, `tge`, `treasury_buyback`, `xqore_penalty`)가 나열되며, 위 샘플은 일부만 보여 줍니다. 금액 단위는 `uqor`입니다.

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

```json
{ "reserved": "6693045921330", "released": "0", "initialized": true, "snapshot_height": "2981742" }
```

`reserved`는 아직 해제되지 않고 남은 금액, `released`는 거버넌스가 이미 이동한 금액, `snapshot_height`는 해당 적립금을 기록한 v3.2.0 업그레이드의 높이입니다. [토크노믹스](/architecture/tokenomics)를 참조하십시오.

## 추상 계정 모듈 {#abstract-account-module}

추상 계정 쿼리 서비스는 `/qorechain/abstractaccount/v1/...` 아래에서 REST로 노출되며(체인 버전 **v3.1.85**부터), 하드코딩 없이 [인증자(authenticator)](/developer-guide/account-abstraction#authenticators) 범위를 검증하는 데 사용되는 **권한 스키마**도 포함됩니다.

| 메서드 | 엔드포인트                                              | 설명                                            |
| ------ | ----------------------------------------------------- | ------------------------------------------------------ |
| GET    | `/qorechain/abstractaccount/v1/config`                | 모듈 구성(기능 프로브: `enabled`)        |
| GET    | `/qorechain/abstractaccount/v1/accounts`              | 추상 계정 목록                                |
| GET    | `/qorechain/abstractaccount/v1/accounts/{address}`    | 주소의 추상 계정 상태(없으면 `404`)                  |
| GET    | `/qorechain/abstractaccount/v1/permission_schema`     | `schema_version`, `permissions`, `msg_permissions`, `key_management_msgs` |

```bash
curl -s https://api.qore.host/qorechain/abstractaccount/v1/config
```

```json
{ "config": { "enabled": false, "max_session_keys": 10, "max_spending_rules": 5, "default_session_ttl": "86400" } }
```

:::note 두 네트워크 모두에서 비활성화됨
현재 메인넷과 테스트넷 모두에서 `enabled`는 `false`이므로, 연결된 지갑 지출과 같은 추상 계정 기능은 사용할 수 없습니다. 이 모듈에 의존하기 전에 `config.enabled`를 기능 프로브로 사용하십시오. [계정 추상화](/developer-guide/account-abstraction)를 참조하십시오.
:::

## AMM 모듈 {#amm-module}

| 메서드 | 엔드포인트                                           | 설명                                              |
| ------ | -------------------------------------------------- | -------------------------------------------------------- |
| GET    | `/qorechain/amm/v1/params`                         | 현재 AMM 파라미터(베이시스 포인트 단위 수수료, 한도)    |
| GET    | `/qorechain/amm/v1/pools`                          | 풀 목록                                              |
| GET    | `/qorechain/amm/v1/pools/{pool_id}`                | 풀 하나(알 수 없으면 `404`)                              |
| GET    | `/qorechain/amm/v1/pools/{pool_id}/lp/{address}`   | 풀에서 한 주소의 LP 토큰 잔액                  |
| GET    | `/qorechain/amm/v1/pool_by_denoms?denom_a=&denom_b=` | 디놈 쌍에 해당하는 풀 조회(없으면 `404`)        |
| GET    | `/qorechain/amm/v1/quote/exact_in?pool_id=&denom_in=&amount_in=`   | 견적: 정확한 입력에 대한 출력       |
| GET    | `/qorechain/amm/v1/quote/exact_out?pool_id=&denom_out=&amount_out=` | 견적: 정확한 출력에 필요한 입력 |

```bash
curl -s https://api.qore.host/qorechain/amm/v1/params
```

```json
{
  "params": {
    "swap_fee_bps": 30,
    "protocol_fee_bps": 10,
    "min_liquidity": "1000",
    "max_pools_per_creator": 50,
    "lp_token_decimals": 6,
    "pool_creation_fee": "100000000",
    "max_swap_impact_bps": 500,
    "enabled": true
  }
}
```

작성 시점 기준으로 두 네트워크 모두에 풀이 없으며(`{"pools": []}`), 알 수 없는 풀에 대한 견적은 HTTP `400`과 `{"code":3,"message":"pool not found"}`를 반환합니다.

## 라이선스 모듈 {#licence-module}

| 메서드 | 엔드포인트                                              | 설명                                                      |
| ------ | ----------------------------------------------------- | ---------------------------------------------------------------- |
| GET    | `/qorechain/license/v1/check/{grantee}/{feature_id}`  | `grantee`가 해당 기능에 대해 유효한 부여를 보유하는지 여부(없으면 `404`) |
| GET    | `/qorechain/license/v1/holders/{feature_id}`          | 기능에 대한 모든 부여                                         |
| GET    | `/qorechain/license/v1/list/{grantee}`                | 한 주소가 보유한 모든 부여                                   |

부여(`LicenseView`)에는 `grantee`, `feature_id`, `expires_at`, `granted_at`, `granted_by`, `suspended`, `metadata`가 있습니다. `check`는 `active`도 반환합니다. 일치하는 항목이 없는 list 또는 holders 쿼리는 `{"licenses": []}`를 반환하며, 부여가 없는 주소에 대한 `check`는 HTTP `404`와 `{"code":5,"message":"no license for <grantee>/<feature_id>"}`를 반환합니다.

```bash
curl -s https://api.qore.host/qorechain/license/v1/holders/lightnode_operator
```

```json
{ "licenses": [] }
```

## 라이트 노드 모듈 {#light-node-module}

| 메서드 | 엔드포인트                                      | 설명                                                        |
| ------ | --------------------------------------------- | ------------------------------------------------------------------ |
| GET    | `/qorechain/lightnode/v1/params`              | 등록, 하트비트, 보상 파라미터                                      |
| GET    | `/qorechain/lightnode/v1/stats`               | `total_registered`, `total_active`, `total_rewards`, `last_reward_height` |
| GET    | `/qorechain/lightnode/v1/nodes`               | 등록된 라이트 노드 목록                                       |
| GET    | `/qorechain/lightnode/v1/node/{address}`      | 노드 하나(등록되지 않았으면 `{"node": null, "found": false}`)     |
| GET    | `/qorechain/lightnode/v1/rewards/{address}`   | 운영자 주소에 누적된 보상(`accumulated_rewards`) |
| GET    | `/qorechain/lightnode/v1/reward_pool`         | 보상 풀 회계(`balance`, `reserved`, `outstanding`, `payable`, `distributable`, `max_reward_per_block_per_node`, `initialized`) |

```bash
curl -s https://api.qore.host/qorechain/lightnode/v1/params
```

```json
{
  "registration_fee": "1000000",
  "heartbeat_interval": "1000",
  "min_delegated_stake": "1000000000",
  "reward_share": "0.030000000000000000",
  "min_uptime_for_rewards": "0.800000000000000000",
  "max_light_nodes": "10000",
  "heartbeat_grace_period": "100"
}
```

```bash
curl -s https://api.qore.host/qorechain/lightnode/v1/reward_pool
```

```json
{
  "balance": "<uqor>",
  "reserved": "<uqor>",
  "outstanding": "0",
  "payable": "0",
  "max_reward_per_block_per_node": "1713",
  "distributable": "0",
  "initialized": true
}
```

`reserved`는 풀에서 따로 보류되어 거버넌스 투표로만 이동할 수 있는 부분이며, `max_reward_per_block_per_node`(`uqor` 단위)는 체인이 노드당 블록당 적립하는 금액의 상한입니다. 상한은 약속된 금액이 아닙니다. 여기서 `balance`와 `reserved`는 자리 표시자로 표시되어 있습니다.

:::note 등록은 열려 있지 않습니다
`stats`는 두 네트워크 모두에서 `"total_registered": "0"`을 보고하고 `nodes`는 비어 있으며, 체인은 `lightnode_operator` 라이선스 부여 없이는 라이트 노드 등록을 거부합니다. 프로그램 상태는 [라이트 노드](/light-node/overview)를 참조하십시오.
:::

## gRPC 전용 모듈 {#grpc-only-modules}

이 모듈들은 gRPC `Query` 서비스는 있지만 **REST 라우트는 없습니다**. 서비스 이름은 `qorechain.<module>.v1.Query` 형식을 따릅니다.

| 모듈        | gRPC 쿼리 메서드(체인 버전 v3.2.0)              |
| ------------- | ------------------------------------------------------ |
| `ai`          | `Config`, `Stats`                                      |
| `crossvm`     | `Params`, `PendingMessages`, `Message`                 |
| `reputation`  | `Params`                                               |
| `rlconsensus` | `AgentStatus`, `Params`, `Observation`, `Reward`, `Policy` |
| `rdk`         | `Params`, `Rollup`, `Rollups`, `Batch`, `LatestBatch`  |
| `svm`         | `Slot`, `Account`, `Program`                           |
| `qca`         | `Config`                                               |

직접 실행하는 노드에 `grpcurl`을 사용하거나 [CLI 쿼리 명령](/cli-reference/query-commands)을 사용하십시오. 특히 `rdk` 쿼리는 메인넷에서 REST로 **제공되지 않으므로**(`/qorechain/rdk/v1/...`은 `501`로 응답), REST 기반 롤업 리더는 현재 메인넷에서 동작할 수 없습니다.

xQORE, 인플레이션, BTC 리스테이킹(Babylon), FairBlock, 가스 추상화 모듈은 현재 메인넷 릴리스에서 REST와 gRPC 모두 쿼리 서비스가 전혀 없습니다.

## 표준 라우트 {#standard-routes}

표준 Cosmos SDK, IBC, EVM, CosmWasm REST 라우트도 제공됩니다. 두 네트워크에서 확인된 예시는 다음과 같습니다:

| 엔드포인트                                              | 설명                                   |
| ----------------------------------------------------- | --------------------------------------------- |
| `/cosmos/bank/v1beta1/supply`                         | 총 공급량                                  |
| `/cosmos/bank/v1beta1/balances/{address}`             | 계정 잔액                              |
| `/cosmos/staking/v1beta1/validators`                  | 검증인                                    |
| `/cosmos/staking/v1beta1/params`                      | 스테이킹 파라미터                        |
| `/cosmos/distribution/v1beta1/params`                 | 분배 파라미터                       |
| `/cosmos/gov/v1/params/voting`                        | 거버넌스 파라미터                      |
| `/cosmos/slashing/v1beta1/params`                     | 슬래싱 파라미터                         |
| `/cosmos/upgrade/v1beta1/current_plan`, `/applied_plan/{name}` | 예정된 / 적용된 업그레이드          |
| `/cosmos/base/node/v1beta1/config`                    | 노드 최소 가스 가격(두 네트워크 모두 `0.1uqor`) |
| `/cosmos/base/tendermint/v1beta1/blocks/latest`       | 최신 블록                                  |
| `/cosmos/tx/v1beta1/txs`, `/txs/{hash}`, `/txs/block/{height}` | 트랜잭션 검색 / 조회 / 블록별 조회 |
| `/cosmos/evm/vm/v1/params`                            | EVM 모듈 파라미터                         |
| `/cosmos/evm/feemarket/v1/params`                     | EVM 수수료 시장 파라미터                     |
| `/cosmwasm/wasm/v1/codes/params`                      | CosmWasm 업로드/인스턴스화 권한       |
| `/ibc/apps/transfer/v1/params`                        | IBC 전송 파라미터                       |

CosmWasm 접두사는 `/cosmwasm/wasm/v1/...`이며, `/cosmos/wasm/v1/...`은 제공되지 않습니다.

## gRPC 리플렉션

직접 실행하는 노드는 포트 `9090`에서 gRPC를 제공합니다. 서버 리플렉션이 활성화된 경우 `grpcurl` 같은 도구로 사용 가능한 서비스를 탐색할 수 있습니다:

```bash
grpcurl -plaintext localhost:9090 list
```

특정 서비스를 조회하려면:

```bash
grpcurl -plaintext -d '{"address":"qor1..."}' localhost:9090 qorechain.pqc.v1.Query/Account
```

`qorechain.pqc.v1.Query`에는 `Account`와 `EVMWindow`라는 두 가지 메서드가 있습니다. `Params` 메서드는 없습니다.

## 인증

모든 REST 및 gRPC 엔드포인트는 기본적으로 인증되지 않습니다. 프로덕션 배포에서는 노드 앞에 리버스 프록시(예: Nginx 또는 Caddy)를 두어 TLS 종료와 접근 제어를 처리하십시오.
