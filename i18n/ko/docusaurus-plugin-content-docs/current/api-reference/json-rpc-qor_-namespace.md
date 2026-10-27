---
slug: /api-reference/json-rpc-qor_-namespace
title: JSON-RPC — qor_ 네임스페이스
sidebar_label: JSON-RPC — qor_ 네임스페이스
sidebar_position: 2
---

# JSON-RPC — qor_ 네임스페이스

`qor_` 네임스페이스는 포스트 양자 암호화 상태, AI 분석, 크로스 VM 메시징, 다중 계층 상태, 브리지 작업, 토크노믹스, 롤업 인프라 및 PRISM 합의 상태를 조회하기 위한 QoreChain 전용 JSON-RPC 메서드를 제공하도록 설계되었습니다.

:::warning 아직 제공되지 않음
**릴리스된 노드 빌드 중 아직 `qor_` 네임스페이스를 제공하는 것은 없습니다**. 메인넷(`qorechain-vladi`), 테스트넷(`qorechain-diana`), 직접 운영하는 노드 모두 마찬가지입니다. 공개 EVM 엔드포인트에서 `rpc_modules`는 `eth`, `net`, `rpc`, `txpool`, `web3`만 나열하며, 두 네트워크 모두에서 **모든 `qor_` 메서드가 `-32601`(method not found)을 반환합니다**. 메서드는 노드 소스에 구현되어 있지만 JSON-RPC 서버에 등록되지 않았기 때문에, `app.toml`의 `api` 목록에 `qor`를 추가해도 아무 효과가 없습니다. 네임스페이스 등록은 향후 노드 릴리스에서 이루어질 예정이며, 출시되면 이 페이지에 해당 릴리스를 명시하겠습니다.

현재는 `qor_` 메서드를 기반으로 개발하지 마세요. 아래 표에 REST 경로가 있는 경우 그것을 사용하세요. `client.qor.*` 헬퍼를 제공하는 클라이언트 라이브러리는 바로 이 메서드들을 감싸고 있으므로, 해당 헬퍼도 동일하게 실패합니다.
:::

직접 확인할 수 있습니다.

```bash
curl -s -X POST https://evm.qore.host \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"rpc_modules","params":[],"id":1}'
```

```json
{"jsonrpc":"2.0","id":1,"result":{"eth":"1.0","net":"1.0","rpc":"1.0","txpool":"1.0","web3":"1.0"}}
```

---

## 계획된 메서드와 현재 사용할 수 있는 방법

| 계획된 메서드                | 현재 사용할 수 있는 방법 |
| ----------------------------- | ----------------- |
| `qor_getPQCKeyStatus`         | `GET /qorechain/pqc/v1/account/{address}` (`found`, `account.key_type`, `account.created_at_height`). [REST / gRPC 엔드포인트](/api-reference/rest-grpc-endpoints#pqc-module)를 참조하세요. |
| `qor_getHybridSignatureMode`  | 공개 REST 경로는 없습니다. 노드를 대상으로 하거나 `--node https://rpc.qore.host:443`을 지정하여 `qorechaind query pqc hybrid-mode`(또는 `query pqc params`)를 사용하세요. |
| `qor_getAIStats`              | 직접 운영하는 노드의 gRPC `qorechain.ai.v1.Query/Stats` 또는 `qorechaind query ai stats`; REST 경로는 없습니다. |
| `qor_getCrossVMMessage`       | 직접 운영하는 노드의 gRPC `qorechain.crossvm.v1.Query/Message`; REST 경로는 없습니다. |
| `qor_getReputationScore`      | 공개 쿼리 경로가 없습니다(reputation 모듈은 gRPC `Params`만 노출합니다). |
| `qor_getLayerInfo`            | `GET /qorechain/multilayer/v1/layers/{layer_id}` 및 `anchor/{layer_id}`. [Multilayer 모듈](/api-reference/rest-grpc-endpoints#multilayer-module)을 참조하세요. |
| `qor_getBridgeStatus`         | `GET /qorechain/bridge/v1/chains/{chain_id}`. [Bridge 모듈](/api-reference/rest-grpc-endpoints#bridge-module)을 참조하세요. 브리지는 아직 라이브가 아닙니다. |
| `qor_getRLAgentStatus`, `qor_getRLObservation`, `qor_getRLReward` | 테스트넷(v3.2.6)에서는 `GET /qorechain/rlconsensus/v1/agent`, `/observation`, `/reward`(그 외 `/params`, `/policy`, `/applied_params`, `/last_action`도 제공)를 사용합니다. [RL 컨센서스 모듈](/api-reference/rest-grpc-endpoints#rlconsensus-module)을 참고하십시오. 메인넷에서는 이 경로들이 `501`로 응답하므로, 직접 운영하는 노드의 gRPC `qorechain.rlconsensus.v1.Query`(`AgentStatus`, `Observation`, `Reward`)를 사용하십시오. |
| `qor_getPoolClassification`   | 공개 쿼리 경로가 없습니다. |
| `qor_getBurnStats`            | `GET /qorechain/burn/v1/stats`. [Burn 모듈](/api-reference/rest-grpc-endpoints#burn-module)을 참조하세요. |
| `qor_getXQOREPosition`        | 없음. xQORE는 라이브가 아닙니다([xQORE 스테이킹](/user-guide/xqore-staking) 참조). |
| `qor_getInflationRate`        | `GET /qorechain/inflation/v1/params` 및 `/epoch_info`(발행 모드, 에포크당 발행량, 상한, 진행률; v3.2.2부터 제공). [Inflation 모듈](/api-reference/rest-grpc-endpoints#inflation-module)을 참조하세요. |
| `qor_getTokenomicsOverview`   | `GET /qorechain/burn/v1/stats`, `GET /qorechain/inflation/v1/epoch_info`, `GET /cosmos/bank/v1beta1/supply`를 조합하세요. |
| `qor_getRollupStatus`, `qor_listRollups`, `qor_getSettlementBatch`, `qor_getDABlobStatus` | `GET /qorechain/rdk/v1/rollup/{id}`, `/rollups`, `/batch/{id}/{index}`, `/latest_batch/{id}`, `/batches/{id}`, `/blob/{id}/{index}`(v3.2.2부터 제공; [RDK 모듈](/api-reference/rest-grpc-endpoints#rdk-module) 참조) 또는 `qorechaind query rdk`. |
| `qor_suggestRollupProfile`    | 공개 서비스가 없습니다. [프리셋 프로필](/rollups/preset-profiles)을 참조하세요. |
| `qor_getBTCStakingPosition`   | 없음. BTC 리스테이킹 모듈에는 아직 쿼리 서비스가 없습니다. |
| `qor_getAbstractAccount`      | `GET /qorechain/abstractaccount/v1/accounts/{address}`. 추상 계정은 메인넷에서는 비활성화되어 있고 테스트넷에서는 활성화되어 있습니다(2026년 10월 27일 확인). |
| `qor_getGasAbstractionConfig` | `GET /qorechain/gasabstraction/v1/config`(v3.2.2부터 제공). [Gas Abstraction 모듈](/api-reference/rest-grpc-endpoints#gas-abstraction-module)을 참조하세요. |
| `qor_getFairBlockStatus`, `qor_getLaneConfiguration` | 없음. |

계정의 EVM 레인 상태(등록된 PQC 키, 승인 창 및 EIP-7702 동의)는 `GET /qorechain/pqc/v1/account/{address}`, `GET /qorechain/pqc/v1/evm_window/{address}`, `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`를 사용하세요. 상태 경로는 **단수형** `account`이며, 복수형 `/accounts/`는 제공되지 않고 `501`로 응답합니다.

---

## 오류 코드

네임스페이스를 제공하는 노드에서는 오류가 표준 JSON-RPC 2.0 코드를 따릅니다. 현재 `qor_` 메서드 호출은 `-32601`로 실패합니다.

| 코드   | 메시지           | 설명                                  |
| ------ | ---------------- | ------------------------------------- |
| -32600 | Invalid Request  | 형식이 잘못된 JSON-RPC 요청           |
| -32601 | Method not found | 메서드가 존재하지 않거나, 노드가 `qor_` 네임스페이스를 제공하지 않음(현재 릴리스된 모든 빌드) |
| -32602 | Invalid params   | 누락되었거나 잘못된 매개변수          |
| -32603 | Internal error   | 서버 측 처리 오류                     |
