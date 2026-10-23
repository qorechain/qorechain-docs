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
이 인터페이스들은 **`qorechain-vladi`** 메인넷(2026년 6월 7일부터 가동 중)과 **`qorechain-diana`** 테스트넷 모두에서 사용할 수 있으며, 두 네트워크 모두 노드 릴리스 **v3.2.4**를 실행합니다(2026년 10월 23일 확인). 메인넷은 2026년 10월 23일 높이 3,742,566에서 v3.2.4를 적용했고(거버넌스 제안 13), 테스트넷은 2026년 10월 19일부터 실행하고 있습니다. 아래의 기본 URL은 로컬에서 실행 중인 노드를 기준으로 합니다. 공개 호스팅 엔드포인트는 `https://api.qore.host` / `https://api-testnet.qore.host`(REST)와 `https://rpc.qore.host` / `https://rpc-testnet.qore.host`(RPC)이며, [네트워크](/appendix/networks#public-endpoints)에 정리되어 있습니다. **공개 gRPC 엔드포인트는 없습니다**: 호스트 이름 `grpc.qore.host`와 `grpc-testnet.qore.host`는 존재하지 않으므로, gRPC가 필요하면 직접 노드를 실행하십시오.
:::

## 기본 URL

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## 존재하는 라우트 {#which-routes-exist}

QoreChain 전용 모듈은 REST에서 `/qorechain/<module>/v1/...` 접두사 아래에 노출되며, 아래에 나열된 모듈에만 REST 라우트가 있습니다. 나머지 모듈은 **gRPC로만** 접근할 수 있습니다([gRPC 전용 모듈](#grpc-only-modules) 참조). 표준 Cosmos SDK, EVM, QoreChain Native 라우트는 [표준 라우트](#standard-routes)에 나열되어 있습니다.

존재하지 않는 라우트는 HTTP `501`과 `{"code":12,"message":"Not Implemented"}`로 응답합니다. 이는 쿼리 결과가 비어 있다는 뜻이 아니라 해당 라우트가 제공되지 않는다는 뜻입니다. `/qorechain/` 접두사가 없는 짧은 경로(예: `/bridge/v1/chains` 또는 `/pqc/v1/params`)는 제공되지 **않습니다**. 존재하는 라우트에서 알 수 없는 레코드를 조회하면 HTTP `404`와 `{"code":5,"message":"... not found"}`가 반환됩니다.

아래 예시는 공개 메인넷 호스트를 사용합니다. 테스트넷에서는 `https://api-testnet.qore.host`로 바꾸십시오. 샘플의 값은 2026년 10월 20일부터 23일 사이에 실제 네트워크에서 읽은 것이며 시간이 지나면 변하므로, 응답의 형태를 파악하는 용도로만 사용하십시오. v3.2.4 릴리스는 일부 라우트와 필드를 추가합니다. 이들은 아래에서 **v3.2.4**로 표시됩니다. 테스트넷은 2026년 10월 19일부터, 메인넷은 2026년 10월 23일부터 이를 제공하고 있습니다. 아직 이전 릴리스인 노드는 새 라우트에 `501`로 응답합니다.

## PQC 모듈 {#pqc-module}

| 메서드 | 엔드포인트                                 | 설명                                                                 |
| ------ | ---------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/qorechain/pqc/v1/account/{address}`    | 계정의 양자내성 키 등록 정보(`found`, 키 유형, 알고리즘) |
| GET    | `/qorechain/pqc/v1/evm_window/{address}` | 계정의 EVM 레인 승인 윈도우와 그 잔여 한도          |
| GET    | `/qorechain/pqc/v1/evm_delegation_consent/{address}` | 계정의 EIP-7702 위임 동의, 현재 위임 및 EVM 논스(v3.2.2부터) |
| GET    | `/qorechain/pqc/v1/protocol_features`    | **v3.2.4**(테스트넷은 2026년 10월 19일부터, 메인넷은 2026년 10월 23일부터이며 이전 릴리스 노드에서는 `501`). 바이너리가 알고 있는 모든 프로토콜 기능과 `enabled`, `known`, `staged` 플래그 |

경로 세그먼트는 단수형 `account`입니다. `/qorechain/pqc/v1/params` 또는 `/stats` 라우트는 없습니다(해당 정보는 `qorechaind query pqc params`와 `stats`를 사용하십시오).

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
    "migration_algorithm_id": 0,
    "classical_key_source": "auth_account"
  }
}
```

`classical_key_source`는 `ecdsa_pubkey`가 어디에서 왔는지를 나타냅니다: `stored`(등록 시 제공된 키), `auth_account`(저장된 것이 없어 계정 자체의 온체인 공개 키를 사용), 또는 `none`입니다. v3.2.4부터(테스트넷은 2026년 10월 19일부터, 메인넷은 2026년 10월 23일부터) 레코드에 `"possession_proven": false`도 포함되며, 이 값은 검증된 [소유 증명](/developer-guide/post-quantum-signing#proof-of-possession)과 함께 키가 등록되면 `true`가 됩니다. 이전 릴리스의 노드는 이 필드를 보고하지 않습니다.

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
  "remaining_value": "",
  "native_only": false,
  "allowed_targets": []
}
```

이 라우트는 윈도우가 없는 주소에 대해서도 실패하지 않고 `found: false`를 반환합니다. v3.2.0부터 EVM 레인은 등록된 PQC 키가 있고 **동시에** 열린 윈도우가 있는 계정의 트랜잭션만 허용합니다. `live`는 윈도우가 현재 높이에서 트랜잭션을 최소 하나 더 허용하는 동안 `true`입니다. `remaining_blocks`, `remaining_txs`, `remaining_value`는 어느 한도가 가장 먼저 소진될지 보여 주며, 값은 문자열로 반환되는 `uqor` 정수입니다. v3.2.3부터 윈도우에 범위를 지정할 수 있습니다: `native_only`(일반 QOR 전송만 허용)와 `allowed_targets`(나열된 수신자에게만 허용). EVM 레인의 동작 방식은 [EVM 개발](/developer-guide/evm-development#evm-window)을 참조하십시오.

```bash
curl -s https://api.qore.host/qorechain/pqc/v1/evm_delegation_consent/qor1...
```

```json
{
  "found": false,
  "live": false,
  "delegate": "",
  "granted_height": "0",
  "expiry_height": "0",
  "current_delegate": "",
  "nonce": "0"
}
```

계정의 EIP-7702 위임은 해당 계정 자신의 양자내성 동의(`MsgAuthorizeEVMDelegation`)가 있어야만 효력이 발생합니다. `found`와 `live`는 `delegate`에 대해 기록된, 아직 사용 가능한 동의가 있는지를 보고하며, `current_delegate`는 계정이 현재 설정한 위임이고 `nonce`는 해당 계정의 EVM 논스입니다.

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

`StateAnchorView`는 `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, `main_chain_height`, `anchored_at`, `pqc_aggregate_signature`, `transaction_count`, `compressed_state_proof`를 포함합니다. v3.2.2부터 서명되는 메시지는 **v2 앵커 메시지**입니다: 도메인 태그 `qorechain-multilayer-anchor-v2` 다음에 체인 ID, 레이어 ID, 레이어 높이, 상태 루트, 검증인 집합 해시, 트랜잭션 수, 압축 상태 증명이 오며, 가변 길이 필드에는 각각 8바이트 빅엔디안 길이가 접두사로 붙습니다(이전 v1 메시지에는 체인 ID와 길이 접두사가 없어서 서명이 모든 체인에서 유효했습니다). 이 서명은 레이어 생성자가 등록한 PQC 키에 대해 검증됩니다. `qorechaind query rdk anchor-sign-bytes`는 롤업 배치에 대한 바이트를 출력합니다. 앵커가 없는 레이어는 `anchor/{layer_id}`에서 HTTP `404`(`no anchor for layer ...`)를, `anchors/{layer_id}`에서 빈 목록(`{"anchors": []}`)을 반환합니다.

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
| GET    | `/qorechain/burn/v1/stranded_rewards` | 따로 확보되어 아직 거버넌스가 해제하지 않은 스테이커 몫 |

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stats
```

```json
{
  "stats": {
    "total_burned": "31574710367921",
    "burns_by_source": {
      "gas_fee": "31574710282421",
      "failed_tx": "85500",
      "milestone": "0",
      "amm": "0",
      "xqore_penalty": "0"
    },
    "last_burn_height": "3666968"
  }
}
```

실제 응답에는 모든 소각 소스(`ai_service`, `amm`, `auto_buyback`, `bridge_fee`, `contract_create`, `failed_tx`, `gas_fee`, `milestone`, `rollup_create`, `tge`, `treasury_buyback`, `xqore_penalty`, 그리고 v3.2.4부터는 스테이킹 티어 잠금의 조기 해제 페널티가 소각되는 `staking_tier_penalty`)가 나열되며, 위 샘플은 일부만 보여 줍니다. 금액 단위는 `uqor`입니다. `failed_tx`는 실패한 트랜잭션의 소각이 실제로 부과된 수수료에 적용되기 시작한 v3.2.2 업그레이드 이후로 0이 아닌 값을 유지하고 있습니다. v3.2.3부터 오래된 건별 소각 `records`는 정리(prune)되므로, `records`는 전체 이력이 아니라 최근 구간입니다. `stats`의 합계는 누적 값입니다.

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

```json
{ "reserved": "0", "released": "10500542706858", "initialized": true, "snapshot_height": "2981742" }
```

`reserved`는 아직 해제되지 않고 남은 금액, `released`는 거버넌스가 이미 이동한 금액, `snapshot_height`는 해당 적립금을 기록한 v3.2.0 업그레이드의 높이입니다. 위 값은 2026년 10월 23일에 읽은 값입니다: 거버넌스는 2026년 10월 19일에 첫 번째 금액(6,693,045.921330 QOR)을 해제했고, v3.2.3 업그레이드는 해당 높이에서 남은 적립금(3,807,496.785528 QOR)을 다시 계산했으며, 거버넌스 제안 12가 그 금액을 해제했으므로(통과, 투표는 2026년 10월 21일 종료) 적립금은 이제 비어 있고 `released`의 합계는 10,500,542.706858 QOR입니다. 실시간 값을 확인하십시오. [토크노믹스](/architecture/tokenomics)를 참조하십시오.

## 추상 계정 모듈 {#abstract-account-module}

추상 계정 쿼리 서비스는 `/qorechain/abstractaccount/v1/...` 아래에서 REST로 노출되며(체인 버전 **v3.1.85**부터), 하드코딩 없이 [인증자(authenticator)](/developer-guide/account-abstraction#authenticators) 범위를 검증하는 데 사용되는 **권한 스키마**도 포함됩니다.

| 메서드 | 엔드포인트                                              | 설명                                            |
| ------ | ----------------------------------------------------- | ------------------------------------------------------ |
| GET    | `/qorechain/abstractaccount/v1/config`                | 모듈 구성(기능 프로브: `enabled`)        |
| GET    | `/qorechain/abstractaccount/v1/accounts`              | 추상 계정 목록                                |
| GET    | `/qorechain/abstractaccount/v1/accounts/{address}`    | 주소의 추상 계정 상태(없으면 `404`)                  |
| GET    | `/qorechain/abstractaccount/v1/permission_schema`     | `schema_version`, `permissions`, `msg_permissions`, `key_management_msgs`, `lane_rules` |
| GET    | `/qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}` | **v3.2.4**(테스트넷은 2026년 10월 19일부터, 메인넷은 2026년 10월 23일부터이며 이전 릴리스 노드에서는 `501`). 연결된 인증자 키가 다음에 서명해야 하는 시퀀스(`nonce`, `linked`) |

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
{
  "licenses": [
    {
      "grantee": "qor1...",
      "feature_id": "lightnode_operator",
      "expires_at": "0",
      "granted_at": "3536305",
      "granted_by": "qor1...",
      "suspended": false,
      "metadata": "",
      "active": true
    }
  ]
}
```

`expires_at: "0"`은 부여가 만료되지 않음을 의미합니다. v3.2.3부터 거버넌스는 이러한 라이선스를 부여하는 라이선스 권한자를 교체할 수 있습니다(`MsgUpdateAuthority`). 이미 이루어진 부여는 그대로 유지됩니다.

## 라이트 노드 모듈 {#light-node-module}

| 메서드 | 엔드포인트                                      | 설명                                                        |
| ------ | --------------------------------------------- | ------------------------------------------------------------------ |
| GET    | `/qorechain/lightnode/v1/params`              | 등록, 하트비트, 보상 파라미터                                      |
| GET    | `/qorechain/lightnode/v1/stats`               | `total_registered`, `total_active`, `total_rewards`, `last_reward_height` |
| GET    | `/qorechain/lightnode/v1/nodes`               | 등록된 라이트 노드 목록                                       |
| GET    | `/qorechain/lightnode/v1/node/{address}`      | 노드 하나(등록되지 않았으면 `{"node": null, "found": false}`)     |
| GET    | `/qorechain/lightnode/v1/rewards/{address}`   | 운영자 주소에 누적된 보상(`accumulated_rewards`) |
| GET    | `/qorechain/lightnode/v1/reward_pool`         | 보상 풀 회계(`balance`, `reserved`, `outstanding`, `payable`, `distributable`, `max_reward_per_block_per_node`, `max_reward_per_month_per_node`, `initialized`) |

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
  "balance": "5645408555",
  "reserved": "5645276228",
  "outstanding": "130077",
  "payable": "0",
  "max_reward_per_block_per_node": "1713",
  "distributable": "2250",
  "initialized": true,
  "max_reward_per_month_per_node": "2000000000",
  "monthly_cap_active": true,
  "last_distribution_time": "1792775155",
  "last_distribution_height": "3744000"
}
```

`reserved`는 풀에서 따로 보류되어 거버넌스 투표로만 이동할 수 있는 부분입니다. 노드별 한도는 `uqor` 단위입니다. `max_reward_per_block_per_node`는 블록당 상한이며, v3.2.3부터 `max_reward_per_month_per_node`(`2000000000` uqor = 30일당 2,000 QOR)는 월 상한으로서 블록 시간과 가동 시간에 비례해 산정되므로 더 이상 블록 생성 속도에 좌우되지 않습니다. 상한은 약속된 금액이 아닙니다. 이 샘플은 거버넌스가 이전 적립금을 해제한 뒤(제안 8, 2026년 10월 19일) 2026년 10월 23일에 읽은 실제 메인넷 응답입니다. v3.2.4부터(테스트넷은 2026년 10월 19일부터, 메인넷은 2026년 10월 23일부터) 응답에 `monthly_cap_active`, `last_distribution_time`, `last_distribution_height`도 포함되며, 노드의 한도는 해당 노드 자신의 등록 시점부터 시작됩니다.

:::note 등록에는 라이선스가 필요합니다
체인은 유효한 `lightnode_operator` 라이선스 부여 없이는 라이트 노드 등록을 거부합니다(`holders/lightnode_operator`가 부여 목록을 보여 줍니다). 2026년 10월 23일 기준으로 `stats`는 메인넷과 테스트넷 모두에서 `"total_registered": "1"`을 보고합니다. 프로그램 상태는 [라이트 노드](/light-node/overview)를 참조하십시오.
:::

## RDK 모듈 {#rdk-module}

Rollup Development Kit 쿼리 서비스는 `/qorechain/rdk/v1/...` 아래에서 REST로 노출됩니다(체인 버전 **v3.2.2**부터. v3.2.0과 v3.2.1에서는 gRPC 전용이었습니다).

| 메서드 | 엔드포인트                                              | 설명                                          |
| ------ | ----------------------------------------------------- | ---------------------------------------------------- |
| GET    | `/qorechain/rdk/v1/params`                            | 모듈 파라미터                                    |
| GET    | `/qorechain/rdk/v1/rollups`                           | 롤업 목록                                        |
| GET    | `/qorechain/rdk/v1/rollup/{rollup_id}`                | 롤업 하나(알 수 없으면 `404`)                        |
| GET    | `/qorechain/rdk/v1/latest_batch/{rollup_id}`          | 롤업의 최신 정산 배치                 |
| GET    | `/qorechain/rdk/v1/batch/{rollup_id}/{batch_index}`   | 정산 배치 하나                                 |
| GET    | `/qorechain/rdk/v1/batches/{rollup_id}`               | 롤업의 배치를 인덱스 순서로(페이지 단위)      |
| GET    | `/qorechain/rdk/v1/blob/{rollup_id}/{blob_index}`     | 데이터 가용성 블롭 레코드 하나                    |

```bash
curl -s https://api.qore.host/qorechain/rdk/v1/params
```

```json
{
  "params": {
    "max_rollups": 100,
    "min_stake_for_rollup": "10000000000",
    "rollup_creation_burn_rate": "0.01",
    "default_challenge_window": "604800",
    "max_da_blob_size": "2097152",
    "blob_retention_blocks": "432000",
    "max_batches_per_block": 10
  }
}
```

작성 시점 기준으로 `rollups`는 두 네트워크 모두에서 빈 목록이므로, 롤업별 라우트는 `404`로 응답합니다(예: `{"code":5,"message":"rollup foo not found"}`). `default_challenge_window`는 초 단위(`604800`)로 표현됩니다. v3.2.4부터 새로 제출된 배치의 낙관적 챌린지 윈도우는 블록 시간으로 측정됩니다. 테스트넷에서는 높이 8,337,253(2026년 10월 19일)부터, 메인넷에서는 높이 3,742,566(2026년 10월 23일)부터입니다. 업그레이드 이전에는 체인이 초 값을 블록당 6초로 고정하여 블록 수로 환산했습니다.

## 인플레이션 모듈 {#inflation-module}

발행 설정과 진행 상황은 `/qorechain/inflation/v1/...` 아래에서 REST로 노출됩니다(체인 버전 **v3.2.2**부터). CLI 명령으로는 제공되지 않습니다.

| 메서드 | 엔드포인트                              | 설명                                                                 |
| ------ | ------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/qorechain/inflation/v1/params`      | 발행 파라미터: `emission_mode`, `fixed_epoch_emission`, `max_total_emission`, `epoch_length`, `enabled` |
| GET    | `/qorechain/inflation/v1/epoch_info`  | 진행 상황: `current_epoch`, `block_start`, `next_epoch_height`, `total_minted`, `max_total_emission`, `remaining_emission` |

```bash
curl -s https://api.qore.host/qorechain/inflation/v1/params
curl -s https://api.qore.host/qorechain/inflation/v1/epoch_info
```

메인넷에서 `emission_mode`는 `"fixed"`, `fixed_epoch_emission`은 `"86000000000"`(에포크당 86,000 QOR), `epoch_length`는 `"43200"` 블록, `max_total_emission`은 `"590000000000000"`(590,000,000 QOR, 누적 상한)입니다. 이 값들은 거버넌스 제안 10(2026년 10월 19일 통과)으로 설정되었으며, 새로운 고정 금액을 사용하는 첫 에포크는 블록 3,672,000에서 시작하고, `epoch_info`는 진행 중인 에포크와 지금까지 발행된 금액을 보여 줍니다. 응답의 `schedule` 목록은 원래의 `schedule` 모드에 속하며, 고정 모드 에포크가 발행하는 금액을 설명하지 않습니다. 모든 금액은 `uqor`입니다. 테스트넷은 자체적으로 다른 값을 보고합니다. v3.2.4부터 세 번째 모드인 `target_apy`가 있으며 `target_apy_bps` 필드를 갖습니다(테스트넷은 2026년 10월 19일부터, 메인넷은 2026년 10월 23일부터). 네트워크는 자체 거버넌스 투표로만 이 모드로 전환하므로, 그러한 투표가 통과될 때까지 메인넷은 `fixed`를 유지합니다(2026년 10월 23일 확인: 여전히 `fixed`). 작성 시점에 테스트넷은 `"emission_mode": "fixed"`를 보고합니다.

## 가스 추상화 모듈 {#gas-abstraction-module}

| 메서드 | 엔드포인트                                              | 설명                                                                 |
| ------ | ----------------------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/qorechain/gasabstraction/v1/config`                 | 허용되는 수수료 토큰, 프리미엄, 블록당 변환 한도                      |
| GET    | `/qorechain/gasabstraction/v1/conversion_rate?denom=` | 수수료 토큰 한 단위가 `uqor`로 얼마의 가치인지, 그리고 `usable` 여부 |
| GET    | `/qorechain/gasabstraction/v1/float`                  | 변환 플로트의 주소, 잔액 및 이번 블록의 사용량             |

```bash
curl -s https://api.qore.host/qorechain/gasabstraction/v1/config
```

```json
{
  "config": {
    "enabled": true,
    "native_denom": "uqor",
    "accepted_tokens": [
      { "denom": "uqor", "conversion_rate": "1.0", "price_source": "", "rate_expiry_height": "0",
        "pool_id": "0", "min_liquidity": "", "max_deviation_bps": 0 }
    ],
    "premium_bps": 300,
    "max_tip_multiplier": 3,
    "float_min": "0",
    "block_conversion_cap": "0"
  }
}
```

허용 목록에는 두 네트워크 모두 네이티브 `uqor`만 들어 있으므로, 수수료는 `uqor`로 지불되며 변환은 이루어지지 않습니다. 거버넌스가 토큰을 추가하며(풀, 최소 유동성, 시간 가중 가격과 현물 가격 간 최대 편차와 함께), 이러한 토큰으로 지불된 수수료는 QOR 플로트를 통해 변환되고 AMM 풀을 통해 다시 채워집니다. `?denom=` 없이 `conversion_rate`를 호출하면 `500`(`denom is required`)으로 응답합니다.

## 스테이킹 티어 모듈 (v3.2.4) {#stakingtier-module}

:::note v3.2.4부터 제공
스테이킹 티어 모듈은 **v3.2.4**에 포함되어 있습니다. 이 라우트들은 테스트넷에서 2026년 10월 19일부터, 메인넷에서 2026년 10월 23일부터 제공되고 있습니다(거버넌스 제안 13, 높이 3,742,566). 이전 릴리스의 노드는 `501`로 응답합니다.
:::

| 메서드 | 엔드포인트                                  | 설명                                                        |
| ------ | ----------------------------------------- | ------------------------------------------------------------------ |
| GET    | `/qorechain/stakingtier/v1/params`        | 락 티어, 최소 락 금액, 조기 해제 페널티      |
| GET    | `/qorechain/stakingtier/v1/locks/{holder}` | 보유자의 락, 각 락에 현재 누적된 금액 및 청구할 수 있는 금액 |
| GET    | `/qorechain/stakingtier/v1/pool`          | 보너스 풀: 잔액, 미지급액, 잉여금 및 마지막 정산 |

`params`는 세 가지 락 기간(3개월, 6개월, 12개월)과 해당 파라미터, 그리고 `min_lock_amount`(`"10000000"` uqor, 10 QOR)를 나열합니다. 락은 `tx stakingtier lock`으로 생성합니다([트랜잭션 명령](/cli-reference/transaction-commands#stakingtier) 참조).

## gRPC 전용 모듈 {#grpc-only-modules}

이 모듈들은 gRPC `Query` 서비스는 있지만 **REST 라우트는 없습니다**. 서비스 이름은 `qorechain.<module>.v1.Query` 형식을 따릅니다.

| 모듈        | gRPC 쿼리 메서드(체인 버전 v3.2.4)              |
| ------------- | ------------------------------------------------------ |
| `ai`          | `Config`, `Stats`                                      |
| `crossvm`     | `Params`, `PendingMessages`, `Message`                 |
| `reputation`  | `Params`                                               |
| `rlconsensus` | `AgentStatus`, `Params`, `Observation`, `Reward`, `Policy` |
| `svm`         | `Slot`, `Account`, `Program`                           |
| `qca`         | `Config`                                               |

직접 실행하는 노드에 `grpcurl`을 사용하거나 [CLI 쿼리 명령](/cli-reference/query-commands)을 사용하십시오. `rdk` 쿼리는 REST로도 사용할 수 있으며([RDK 모듈](#rdk-module) 참조), v3.2.2 이전에는 gRPC 전용이었습니다.

xQORE, BTC 리스테이킹(Babylon), FairBlock 모듈은 현재 릴리스에서 REST와 gRPC 모두 쿼리 서비스가 전혀 없습니다. v3.2.2 이전에는 쿼리 서비스가 없었던 인플레이션 및 가스 추상화 모듈은 REST로 제공됩니다([인플레이션 모듈](#inflation-module) 및 [가스 추상화 모듈](#gas-abstraction-module) 참조).

## 표준 라우트 {#standard-routes}

표준 Cosmos SDK, IBC, EVM, QoreChain Native REST 라우트도 제공됩니다. 두 네트워크에서 확인된 예시는 다음과 같습니다:

| 엔드포인트                                              | 설명                                   |
| ----------------------------------------------------- | --------------------------------------------- |
| `/cosmos/bank/v1beta1/supply`                         | 총 공급량                                  |
| `/cosmos/bank/v1beta1/balances/{address}`             | 계정 잔액                              |
| `/cosmos/staking/v1beta1/validators`                  | 검증인                                    |
| `/cosmos/staking/v1beta1/params`                      | 스테이킹 파라미터                        |
| `/cosmos/distribution/v1beta1/params`                 | 분배 파라미터                       |
| `/cosmos/gov/v1/params/voting`                        | 거버넌스 파라미터                      |
| `/cosmos/slashing/v1beta1/params`                     | 슬래싱 파라미터                         |
| `/cosmos/upgrade/v1beta1/current_plan`, `/applied_plan/{name}` | 예정된 / 적용된 업그레이드(메인넷에서 `applied_plan/v3.2.3`은 `{"height":"3662051"}`을 반환) |
| `/cosmos/circuit/v1/disable_list`                     | 네트워크 전체에서 비활성화된 메시지 유형       |
| `/cosmos/base/node/v1beta1/config`                    | 노드 최소 가스 가격(두 네트워크 모두 `0.1uqor`) |
| `/cosmos/base/tendermint/v1beta1/blocks/latest`       | 최신 블록                                  |
| `/cosmos/tx/v1beta1/txs`, `/txs/{hash}`, `/txs/block/{height}` | 트랜잭션 검색 / 조회 / 블록별 조회 |
| `/cosmos/evm/vm/v1/params`                            | EVM 모듈 파라미터                         |
| `/cosmos/evm/feemarket/v1/params`                     | EVM 수수료 시장 파라미터                     |
| `/cosmwasm/wasm/v1/codes/params`                      | QoreChain Native 업로드/인스턴스화 권한       |
| `/ibc/apps/transfer/v1/params`                        | IBC 전송 파라미터                       |

QoreChain Native 접두사는 `/cosmwasm/wasm/v1/...`이며, `/cosmos/wasm/v1/...`은 제공되지 않습니다.

## gRPC 리플렉션

직접 실행하는 노드는 포트 `9090`에서 gRPC를 제공합니다. 서버 리플렉션이 활성화된 경우 `grpcurl` 같은 도구로 사용 가능한 서비스를 탐색할 수 있습니다:

```bash
grpcurl -plaintext localhost:9090 list
```

특정 서비스를 조회하려면:

```bash
grpcurl -plaintext -d '{"address":"qor1..."}' localhost:9090 qorechain.pqc.v1.Query/Account
```

`qorechain.pqc.v1.Query`에는 v3.2.3 노드에서 `Account`, `EVMWindow`, `EVMDelegationConsent`의 세 가지 메서드가 있으며, v3.2.4부터(테스트넷은 2026년 10월 19일부터, 메인넷은 2026년 10월 23일부터) `ProtocolFeatures`라는 네 번째 메서드가 있습니다. `Params` 메서드는 없습니다.

## 인증

모든 REST 및 gRPC 엔드포인트는 기본적으로 인증되지 않습니다. 프로덕션 배포에서는 노드 앞에 리버스 프록시(예: Nginx 또는 Caddy)를 두어 TLS 종료와 접근 제어를 처리하십시오.
