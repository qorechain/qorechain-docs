---
slug: /appendix/chain-parameters
title: 체인 파라미터
sidebar_label: 체인 파라미터
sidebar_position: 2
---

# 체인 파라미터

QoreChain 네트워크의 모듈 파라미터를 모듈별로 묶어 통합 정리한 참조 문서입니다. 파라미터는 해당 모듈에 params 쿼리가 있는 경우 `qorechaind query <module> params`로 조회할 수 있습니다(`pqc`, `amm`, `crossvm`, `lightnode`, `multilayer`, `reputation`, `rlconsensus`. `ai`, `qca`, `rdk`, `bridge`, `abstractaccount`, `gasabstraction`은 `config`를 사용합니다). REST로는 [REST / gRPC 레퍼런스](/api-reference/rest-grpc-endpoints)에 나열된 경로만 조회할 수 있습니다. `x/inflation` 파라미터는 v3.2.3부터 메인넷에서도 REST(`/qorechain/inflation/v1/params`)로 제공됩니다. 메인넷에서는 `ai`, `qca`, `reputation`, `rlconsensus`, `fairblock`, `xqore`와 `pqc` 파라미터에 REST를 지원하지 않습니다(테스트넷은 v3.2.6부터 `pqc`와 `rlconsensus` 파라미터를 REST로 제공하며, `crossvm`과 `rdk` 파라미터는 v3.2.5부터 두 네트워크 모두에서 제공됩니다).

:::note
표시된 값은 2026년 10월 23일에 메인넷 **`qorechain-vladi`**(EVM 체인 ID **9801**, 릴리스 **v3.2.5**, 거버넌스 제안 14에 따라 2026년 10월 29일 높이 3,906,833에서 적용)에서 실시간으로 읽은 값이며(거버넌스 제안으로 변경된 경우를 제외하면 제네시스 값이며, 변경된 값은 별도로 표기했습니다), 핵심 모듈 행은 2026년 10월 27일에, v3.2.5에 좌우되는 행은 2026년 10월 30일에 다시 읽었습니다. 테스트넷 **`qorechain-diana`**(EVM 체인 ID **9800**)는 릴리스 **v3.2.6**(2026년 10월 27일 적용)을 실행합니다. 별도 표기가 없는 한 테스트넷의 값은 메인넷과 동일하며, 남아 있는 차이점은 [테스트넷과 메인넷의 차이점](#testnet-differences)에 정리되어 있습니다. 블록 단위로 표시된 기간은 측정된 메인넷 블록 시간인 약 3.1초로 환산한 것입니다(테스트넷은 약 1.3초마다 블록을 생성합니다).
:::

---

## PQC 모듈 (`x/pqc`)

| 파라미터                   | 값                         | 설명                                                                     |
| -------------------------- | -------------------------- | ------------------------------------------------------------------------ |
| `pqc_primary`              | `true`                     | 포스트 퀀텀 서명이 기본 방식임                                           |
| `allow_classical_fallback` | `false`                    | 고전 전용 폴백은 닫혀 있음; Cosmos 레인 트랜잭션은 하이브리드여야 함     |
| `min_security_level`       | `5`                        | 등록 알고리즘에 요구되는 최소 NIST 보안 수준                             |
| `default_migration_blocks` | `1,000,000`                | 거버넌스로 시작된 알고리즘 마이그레이션의 기본 기간(≈3.1초 블록 기준 약 36일) |
| `default_signature_algo`   | `1`                        | Dilithium-5 / ML-DSA-87                                                  |
| `hybrid_signature_mode`    | `2` (required)             | 강제 모드: 0=비활성, 1=선택, 2=필수                                      |

알고리즘 레지스트리(id 1 `dilithium5`, id 2 `mlkem1024`)는 파라미터가 아니라 체인 상태입니다. 키는 `MsgRegisterPQCKey` 또는 `MsgRegisterPQCKeyV2`로 명시적으로 등록하며, 자동 등록은 없습니다. v3.2.3부터 체인은 취약한 키, 퇴화된 키, 이미 사용된 공개 키를 거부하며, `MsgRegisterPQCKeyV2`는 선택적 소유 증명(`tx pqc register-key-v2 ... --pqc-key <name>`)을 받아 이 증명이 있으면 체인이 검증합니다.

### EVM 승인 윈도우 한도 {#evm-window-limits}

[EVM 승인 윈도우](/getting-started/first-transaction#evm-window)의 한도는 모듈 파라미터가 아니라 프로토콜 상수입니다.

| 한도 | 값 |
| ----- | ----- |
| 최대 `blocks` | 17,280 (≈3.1초 블록 기준 약 15시간) |
| 최대 `max_txs` | 1,000 |
| `max_value` | 0보다 큼 (uqor; 전송 금액과 각 트랜잭션의 최대 수수료의 합) |
| 최대 `allowed_targets` | 수신 주소 16개 (선택적 범위 지정, v3.2.3) |

v3.2.3부터는 윈도우를 `native_only`(일반 네이티브 QOR 전송만 허용)로 더 좁힐 수도 있습니다.

---

## AI 모듈 (`x/ai`)

모듈 설정(`qorechaind query ai config`):

| 파라미터            | 값                     | 설명                                                                        |
| ------------------- | ---------------------- | --------------------------------------------------------------------------- |
| `anomaly_threshold` | `0.7`                  | 이 이상 점수를 넘으면 앤티 핸들러가 트랜잭션을 플래그 처리함 |
| `routing_strategy`  | `reputation_weighted`  | 라우팅 전략                                                                 |
| `risk_threshold`    | `0.8`                  | 위험 점수 임계값                                                            |
| `max_tx_per_minute` | `600`                  | Cosmos 레인에서 30블록 구간(≈3.1초 블록 기준 약 94초) 동안 집계되는 발신자별 트랜잭션 한도(이름은 과거 명칭임). v3.2.0부터 적용되며 기본값은 10 |

[AI 엔진](/architecture/ai-engine) 페이지에 설명된 사기 점수화 가중치와 심각도 임계값은 모듈 파라미터가 아니라 탐지기 상수입니다.

---

## 평판 모듈 (`x/reputation`)

| 파라미터    | 값     | 설명                                                 |
| ----------- | ------ | ---------------------------------------------------- |
| `alpha`     | `0.30` | 평판 공식에서 가동시간 점수(S\_i)에 대한 가중치      |
| `beta`      | `0.35` | 참여 점수(P\_i)에 대한 가중치                        |
| `gamma`     | `0.20` | 커뮤니티 점수(C\_i)에 대한 가중치                    |
| `delta`     | `0.15` | 재임 기간 점수(T\_i)에 대한 가중치                   |
| `lambda`    | `1000` | 과거 점수에 대한 시간 감쇠 스케일                    |
| `min_score` | `0.10` | 평판 점수의 하한                                     |

평판 공식: `R_i = alpha * S_i + beta * P_i + gamma * C_i + delta * T_i`, 과거 점수에는 시간 감쇠가 적용됩니다.

---

## QCA 모듈 (`x/qca`)

:::note 구현 완료, 아직 활성화되지 않음
Triple-Pool CPoS 로직은 `x/qca`에 구현되어 있고 이 파라미터들도 온체인에 있지만, **아직 블록 생성, 보상, 슬래싱, 거버넌스 집계에는 연결되어 있지 않습니다**. 현재 적용 중인 슬래싱은 표준 `x/slashing` 모듈입니다([스테이킹, 슬래싱, 거버넌스, 수수료, EVM](#core-modules) 참조). [합의 메커니즘](/architecture/consensus-mechanism)을 참조하세요.
:::

설정(`qorechaind query qca config`):

| 파라미터                        | 값                  | 설명                                                  |
| ------------------------------- | ------------------- | ----------------------------------------------------- |
| `use_reputation_weighting`      | `true`              | 평판 가중치 적용의 제네시스 설정                      |
| `min_reputation_score`          | `0.1`               | 최소 평판 점수                                        |
| `pool_classification_interval`  | `1000` blocks       | 풀 분류 간 블록 수                                    |
| `pool_weight_rpos`              | `0.40`              | RPoS 풀의 제안 가중치                                 |
| `pool_weight_dpos`              | `0.35`              | DPoS 풀의 제안 가중치                                 |
| `pool_min_delegation_dpos`      | `10,000,000,000 uqor` | DPoS 풀의 최소 위임량(10,000 QOR)                   |
| `pool_rep_percentile_rpos`      | `70`                | RPoS 풀의 평판 백분위                                 |
| `bonding_alpha`                 | `0.1`               | 본딩 커브 파라미터                                    |
| `bonding_beta`                  | `1.0`               | 본딩 커브 파라미터                                    |
| `bonding_phase_multiplier`      | `1.5`               | 본딩 커브 단계 승수                                   |
| `slashing_base_rate`            | `0.01`              | 점진적 슬래싱 기본 비율                               |
| `slashing_escalation_factor`    | `1.5`               | 점진적 슬래싱 가중 계수                               |
| `slashing_max_penalty`          | `0.33`              | 점진적 슬래싱 최대 페널티                             |
| `slashing_decay_halflife`       | `100,000` blocks    | 점진적 슬래싱 감쇠 반감기                             |
| `qdrw_enabled`                  | `false`             | QDRW 집계는 비활성화됨                                |
| `qdrw_xqore_multiplier`         | `2.0`               | QDRW 공식에서 xQORE의 가중치                          |
| `qdrw_rep_min_multiplier`       | `0.5`               | 평판 승수의 하한                                      |
| `qdrw_rep_max_multiplier`       | `2.0`               | 평판 승수의 상한                                      |

---

## 소각 모듈 (`x/burn`)

| 파라미터               | 값                           | 설명                                                  |
| ---------------------- | ---------------------------- | ----------------------------------------------------- |
| `gas_burn_rate`        | `0.30`                       | 수수료 수집기에서 소각되는 비율                       |
| `contract_create_fee`  | `100,000,000 uqor` (100 QOR) | 컨트랙트 생성 시 고정 소각 수수료                     |
| `ai_service_burn_rate` | `0.50`                       | AI 서비스 수수료 중 소각되는 비율                     |
| `bridge_burn_rate`     | `1.00`                       | 브리지 수수료 중 소각되는 비율                        |
| `failed_tx_burn_rate`  | `0.10`                       | 실패한 트랜잭션 가스 중 소각되는 비율(v3.2.2부터 체인이 적용) |
| `validator_share`      | `0.37`                       | 검증자에게 분배되는 비율                              |
| `treasury_share`       | `0.20`                       | 트레저리로 보내지는 비율                              |
| `staker_share`         | `0.10`                       | 스테이커에게 분배되는 비율                            |
| `light_node_share`     | `0.03`                       | 라이트 노드에 분배되는 비율                           |
| `enabled`              | `true`                       | 모듈 활성화 플래그                                    |

수수료 분배는 검증자, 소각, 트레저리, 스테이커, 라이트 노드에 걸쳐 **37 / 30 / 20 / 10 / 3** 이며, 비율의 합은 `1.00`이어야 합니다. `milestone_burn_schedule`도 존재합니다. [토크노믹스](/architecture/tokenomics)를 참조하세요.

---

## xQORE 모듈 (`x/xqore`)

:::caution 아직 온체인에서 사용할 수 없음
xQORE 모듈의 회계 로직은 존재하지만, 잠금 및 잠금 해제 트랜잭션, 쿼리, CLI 명령은 **아직 라이브 네트워크에 연결되어 있지 않습니다**. 현재 QOR를 잠글 수 없으며 발행된 xQORE도 없습니다. 아래 값은 제네시스 설정입니다.
:::

| 파라미터                  | 값                     | 설명                                                 |
| ------------------------- | ---------------------- | ---------------------------------------------------- |
| `governance_multiplier`   | `2.0`                  | xQORE 보유자의 투표권 승수                           |
| `min_lock_amount`         | `1,000,000 uqor`       | 잠글 최소 금액(1 QOR)                                |
| `penalty_burn_rate`       | `0.0`                  | 소각되는 출구 페널티 비율(전액 재분배됨)             |
| `rebase_interval`         | `100` blocks           | PvP 리베이스 이벤트 간 블록 수                       |
| `enabled`                 | `true`                 | 모듈 활성화 플래그                                   |

출구 페널티: 50 %(잠금 30일 미만), 35 %(30–90일), 15 %(90–180일), 0 %(180일 초과). 잠금 승수: 0 / 90 / 180 / 365 / 730일에 각각 1.0 / 1.2 / 1.4 / 1.7 / 2.0.

---

## 인플레이션 모듈 (`x/inflation`)

| 파라미터               | 값                      | 설명                                                  |
| ---------------------- | ----------------------- | ----------------------------------------------------- |
| `emission_mode`        | `fixed`                 | `schedule`(레거시) 또는 `fixed`(v3.1.94부터)          |
| `fixed_epoch_emission` | `86,000,000,000 uqor` (86,000 QOR) | fixed 모드에서 에포크마다 발행되는 양(2026년 10월 19일 거버넌스 제안 10 이전에는 16,239 QOR) |
| `max_total_emission`   | `590,000,000,000,000 uqor` (590,000,000 QOR) | 누적 발행 하드 상한(제안 10 이전에는 114,285,714 QOR) |
| `epoch_length`         | `43,200` blocks         | 에포크당 블록 수(≈3.1초 블록 기준 약 37.7시간)        |
| `schedule`             | 17.5 %, 11 %, 7 %, 7 %, 2 % | 연도별 레거시 비율, fixed 모드에서는 사용되지 않음 |
| `enabled`              | `true`                  | 모듈 활성화 플래그                                    |

이 모듈은 상한에 도달할 때까지 이 발행량을 수수료 수집기로 발행합니다. 86,000 QOR로 시작하는 첫 에포크는 블록 3,672,000에서 시작됩니다. 2026년 10월 23일(에포크 86) 기준으로 105,420,896.21 QOR가 발행되었고 상한까지 484,579,103.79 QOR가 남아 있었습니다(`GET /qorechain/inflation/v1/epoch_info`). [토크노믹스](/architecture/tokenomics#supply-and-emission)를 참조하세요.

---

## RL 컨센서스 모듈 (`x/rlconsensus`)

`x/rlconsensus` 모듈은 강화학습 최적화 계층인 **PRISM**을 구현합니다. 메인넷에서는 관측 모드이며, 정책 가중치가 로드되어 있지 않아 아무것도 조정하지 않고, PRISM 제어 메시지 네 가지는 서킷 브레이커로 꺼져 있습니다([서킷 브레이커 상태](#circuit-breaker) 참조). 테스트넷에서는 에이전트가 작은 시연용 정책이 로드된 **섀도 모드**로 실행됩니다. 10블록마다 관측하고 어떤 값도 변경하지 않은 채 제안된 액션을 기록합니다. 표에는 메인넷 값이 나와 있으며, 테스트넷은 `agent_mode`(`0`, 섀도)만 다르고 값을 REST(`GET /qorechain/rlconsensus/v1/params`, v3.2.6; 메인넷은 501로 응답)로 제공합니다.

| 파라미터                         | 값             | 설명                                                          |
| -------------------------------- | -------------- | ------------------------------------------------------------- |
| `enabled`                        | `true`         | 모듈 활성화 플래그                                            |
| `observation_interval`           | `10`           | PRISM 관측 샘플 간 블록 수                                    |
| `agent_mode`                     | `1` (conservative) | 에이전트 모드: 0=shadow, 1=conservative, 2=autonomous, 3=paused |
| `max_change_conservative`        | `0.10`         | conservative 모드에서 액션당 최대 파라미터 변경량             |
| `max_change_autonomous`          | `0.25`         | autonomous 모드에서 액션당 최대 파라미터 변경량               |
| `circuit_breaker_window`         | `50`           | 서킷 브레이커 윈도우                                          |
| `circuit_breaker_threshold`      | `0.50`         | 서킷 브레이커 임계값                                          |
| `reward_weight_throughput`       | `0.30`         | 처리량에 대한 보상 가중치                                     |
| `reward_weight_finality`         | `0.25`         | 파이널리티에 대한 보상 가중치                                 |
| `reward_weight_decentralization` | `0.20`         | 탈중앙화에 대한 보상 가중치                                   |
| `reward_weight_mev`              | `0.15`         | MEV에 대한 보상 가중치                                        |
| `reward_weight_failed_txs`       | `0.10`         | 실패한 트랜잭션에 대한 보상 가중치                            |
| `default_block_time_ms`          | `5000`         | 관측 기준선의 기본 블록 시간(실제 블록 시간이 아님)           |
| `default_base_gas_price`         | `100`          | 관측 기준선의 기본 베이스 가스 가격                           |
| `default_validator_set_size`     | `100`          | 관측 기준선의 기본 검증자 집합 크기                           |

---

## 브리지 모듈 (`x/bridge`)

:::caution 라이브 아님
37개 체인 설정이 모두 `pending` 상태이며, 등록된 브리지 검증자도, 생성된 브리지 작업도 없으며, 메인넷에는 열린 IBC 채널이 없습니다(테스트넷에는 IBC 테스트를 위해 열린, 체인 ID가 `provider`인 테스트 카운터파티 체인으로 향하는 단일 ICS-20 transfer 채널(`channel-0`)이 있습니다. 2026년 10월 27일 확인). [브리지 아키텍처](/architecture/bridge-architecture)를 참조하세요.
:::

`GET /qorechain/bridge/v1/config`:

| 파라미터                   | 값                          | 설명                                              |
| -------------------------- | --------------------------- | ------------------------------------------------- |
| `min_validators`           | `10`                        | 증명 집합에 필요한 검증자 수                      |
| `attestation_threshold`    | `7`                         | 필요한 증명 수                                    |
| `challenge_period_secs`    | `86400`                     | 챌린지 기간(24시간)                               |
| `large_transfer_threshold` | `100,000,000,000 uqor` (100,000 QOR) | 이 금액을 초과하는 전송은 챌린지 기간을 기다림 |
| `enabled`                  | `true`                      | 모듈 활성화 플래그                                |

체인별 설정(`min_confirmations`, `max_single_transfer`, `daily_limit`)은 모듈 파라미터가 아니라 각 체인 설정에 있습니다.

---

## 멀티레이어 모듈 (`x/multilayer`)

| 파라미터                       | 값               | 설명                                              |
| ------------------------------ | ---------------- | ------------------------------------------------- |
| `max_sidechains`               | `10` (테스트넷: `64`) | 등록 가능한 최대 사이드체인 수               |
| `max_paychains`                | `50`             | 등록 가능한 최대 페이체인 수                      |
| `min_anchor_interval`          | `100`            | 최소 앵커 간격(블록)                              |
| `max_anchor_interval`          | `1000`           | 최대 앵커 간격(블록)                              |
| `default_challenge_period`     | `86400` s        | 기본 챌린지 기간(1일)                             |
| `min_sidechain_stake`          | `1,000,000,000`  | 사이드체인 등록 최소 스테이크(1,000 QOR)          |
| `min_paychain_stake`           | `100,000,000`    | 페이체인 등록 최소 스테이크(100 QOR)              |
| `routing_enabled`              | `true`           | 크로스 레이어 라우팅 활성화                       |
| `routing_confidence_threshold` | `0.6`            | 자동 라우팅의 신뢰도 임계값                       |
| `cross_layer_fee_bundling`     | `true`           | 한 번의 수수료 지불로 여러 레이어를 커버할 수 있음 |

---

## 크로스-VM 모듈 (`x/crossvm`)

| 파라미터              | 값      | 설명                                           |
| --------------------- | ------- | ---------------------------------------------- |
| `max_message_size`    | `65536` | 크로스-VM 메시지의 최대 크기(바이트, 64 KB)    |
| `max_queue_size`      | `1000`  | 크로스-VM 큐의 최대 대기 메시지 수             |
| `queue_timeout_blocks`| `100`   | 대기 메시지가 타임아웃되기까지의 블록 수       |
| `enabled`             | `true`  | 모듈 활성화 플래그                             |
| `bridge_allowed_targets` | `[]`(비어 있음) | 크로스-VM 브리지가 호출할 수 있는 컨트랙트 대상의 거버넌스 관리 허용 목록(v3.2.5). 빈 목록은 아무것도 허용하지 않음 |

`MsgCrossVMCall`은 메인넷에서 여전히 서킷 브레이커로 꺼져 있습니다(테스트넷에서는 활성화, 2026년 10월 30일 확인). v3.2.5부터 두 네트워크 모두 이 값들을 REST(`GET /qorechain/crossvm/v1/params`)로 제공하며, v3.2.5 이전에는 메인넷이 501로 응답했습니다.

---

## SVM 모듈 (`x/svm`)

제네시스 값:

| 파라미터                | 값           | 설명                                         |
| ----------------------- | ------------ | -------------------------------------------- |
| `max_program_size`      | `10485760`   | 최대 프로그램 바이너리 크기(바이트, 10 MB)   |
| `max_account_data_size` | `10485760`   | 최대 계정 데이터 크기(바이트, 10 MB)         |
| `compute_budget_max`    | `1400000`    | 트랜잭션당 최대 컴퓨트 유닛(1.4M)            |
| `lamports_per_byte`     | `3480`       | 바이트당 임대 비용(lamports)                 |
| `rent_exemption_multi`  | `2.0`        | 면제에 필요한 임대 연수                      |
| `enabled`               | `true`       | 모듈 활성화 플래그                           |
| `svm_slot_offset`       | `0`          | 슬롯 오프셋                                  |
| `default_sig_scheme`    | `0`          | 기본 서명 방식                               |
| `max_cpi`               | `4`          | 최대 크로스 프로그램 호출 깊이               |

SVM 트랜잭션 레인은 네트워크 전체에서 비활성화되어 있습니다([네트워크](/appendix/networks) 참조).

---

## RDK 모듈 (`x/rdk`)

`qorechaind query rdk config`:

| 파라미터                    | 값                   | 설명                                          |
| --------------------------- | -------------------- | --------------------------------------------- |
| `max_rollups`               | `100` (테스트넷: `200`) | 등록 가능한 최대 롤업 수                   |
| `min_stake_for_rollup`      | `10,000,000,000 uqor`| 최소 운영자 스테이크(10,000 QOR)              |
| `rollup_creation_burn_rate` | `0.01`               | 생성 스테이크 중 소각되는 비율(1%)            |
| `default_challenge_window`  | `604,800` s (테스트넷: `3,600` s) | 기본 챌린지 윈도우(7일, 테스트넷은 1시간) |
| `max_da_blob_size`          | `2,097,152`          | 최대 DA blob 크기(바이트, 2 MB)               |
| `blob_retention_blocks`     | `432,000`            | DA blob 보관 블록 수(≈3.1초 블록 기준 약 16일) |
| `max_batches_per_block`     | `10`                 | 블록당 처리되는 최대 배치 수                  |

같은 값이 v3.2.5부터 두 네트워크 모두에서 `GET /qorechain/rdk/v1/params`로 REST를 통해 제공됩니다(2026년 10월 30일 확인). v3.2.5부터 이 RDK 파라미터는 거버넌스로 변경됩니다. 두 네트워크 모두 아직 생성된 롤업이 없습니다.

---

## FairBlock 모듈 (`x/fairblock`)

제네시스 값(이 모듈에는 쿼리 서비스가 없어 실시간으로 다시 읽을 수 없습니다):

| 파라미터             | 값      | 설명                                        |
| -------------------- | ------- | ------------------------------------------- |
| `enabled`            | `false` | FairBlock tIBE 암호화는 비활성화됨          |
| `tibe_threshold`     | `5`     | 필요한 최소 복호화 키 셰어 수               |
| `decryption_delay`   | `3`     | 확정 후 복호화까지의 블록 수                |
| `max_encrypted_size` | `65536` | 최대 암호화 페이로드 크기(바이트)           |

---

## 가스 추상화 모듈 (`x/gasabstraction`)

제네시스 설정(`enabled = true`, `native_denom = uqor`):

| 토큰 단위   | 변환 비율       | 설명                   |
| ----------- | --------------- | ---------------------- |
| `uqor`      | `1.0`           | 네이티브 QOR 토큰 (1:1) |
| `ibc/USDC`  | `1.0`           | IBC 브리지 USDC        |
| `ibc/ATOM`  | `10.0`          | IBC 브리지 ATOM        |

변환 비율은 해당 토큰으로 수수료를 지불할 때 환산에 사용되는 비율입니다.

:::note 수락되는 IBC 수수료 토큰 없음
메인넷에는 열린 IBC 채널이 없으므로 그곳에는 `ibc/USDC`나 `ibc/ATOM`이 존재할 수 없습니다. 테스트넷의 단일 테스트 채널에는 소량의 테스트 바우처 잔액이 있지만, 허용 토큰 목록은 마찬가지로 `uqor`뿐입니다. 수수료는 `uqor`로 지불합니다.
:::

---

## 라이트 노드 모듈 (`x/lightnode`)

| 파라미터                 | 값                 | 설명                                                 |
| ------------------------ | ------------------ | ---------------------------------------------------- |
| `registration_fee`       | `1,000,000 uqor` (1 QOR) | 라이트 노드 등록 수수료                        |
| `heartbeat_interval`     | `1000` blocks      | 필수 하트비트 간 블록 수(≈3.1초 블록 기준 약 52분)   |
| `min_delegated_stake`    | `1,000,000,000 uqor` (1,000 QOR) | 운영자가 위임해야 하는 최소 스테이크   |
| `reward_share`           | `0.03`             | 라이트 노드용으로 따로 떼어 두는 수수료 수집기 비율  |
| `min_uptime_for_rewards` | `0.80`             | 보상 자격을 위한 최소 가동 비율                      |
| `max_light_nodes`        | `10,000`           | 등록 가능한 최대 라이트 노드 수                      |
| `heartbeat_grace_period` | `100` blocks       | 늦은 하트비트에 대한 유예 기간                       |

보상 회계는 라이브 상태입니다. `GET /qorechain/lightnode/v1/reward_pool`은 풀(`balance`, `reserved`, `outstanding`, `payable`, `distributable`)과 노드별 보상 한도를 보고합니다. v3.2.3부터 이 한도는 `max_reward_per_month_per_node`로, **노드당 30일에 2,000 QOR(`2000000000` uqor)** 이며 블록 시간에 비례해 안분되고 노드의 가동률에 따라 조정됩니다. 이전의 블록당 값(`max_reward_per_block_per_node`, `1713` uqor)도 계속 보고됩니다. 2026년 10월 27일 기준으로 메인넷 풀에는 약 13,380.9 QOR의 준비금(`reserved`)이 있었고, 그중 소액(0.06 QOR)이 미지급 상태였으며 아직 지급 가능한 금액은 없었습니다. 등록은 열려 있으며 라이선스로 제한됩니다. 해당 날짜에 메인넷에서 `lightnode_operator` 라이선스 7개가 부여되었고 각 네트워크에 라이트 노드 1개가 등록되어 있었습니다(`GET /qorechain/license/v1/holders/lightnode_operator`, `GET /qorechain/lightnode/v1/stats`). [라이트 노드](/light-node/overview#reward-program-status)와 [토크노믹스](/architecture/tokenomics#stranded-and-reserve)를 참조하세요.

---

## AMM 모듈 (`x/amm`)

| 파라미터                | 값                            | 설명                                |
| ----------------------- | ----------------------------- | ----------------------------------- |
| `swap_fee_bps`          | `30`                          | 스왑 수수료(0.30%)                  |
| `protocol_fee_bps`      | `10`                          | 프로토콜 수수료 몫(0.10%)           |
| `min_liquidity`         | `1000`                        | 최소 유동성                         |
| `max_pools_per_creator` | `50`                          | 생성자당 최대 풀 수                 |
| `lp_token_decimals`     | `6`                           | LP 지분 표시 소수점 자릿수(지분은 토큰이 아니라 원장 항목) |
| `pool_creation_fee`     | `100,000,000 uqor` (100 QOR)  | 풀 생성 수수료                      |
| `max_swap_impact_bps`   | `500`                         | 스왑의 최대 가격 영향(5%)           |
| `enabled`               | `true`                        | 모듈 활성화 플래그                  |

메인넷과 테스트넷 모두 아직 풀이 없으며, `MsgPausePool` / `MsgResumePool`은 메인넷에서 꺼져 있습니다.

---

## 스마트 계정 (`x/abstractaccount`)

:::caution 메인넷에서는 꺼져 있음
메인넷에서 `enabled`는 `false`입니다(테스트넷은 `true`, 2026년 10월 27일 확인). 꺼져 있는 동안에는 인증자 등록, 인증자를 통한 실행, 스마트 계정 생성이 모두 거부됩니다. 이 기능을 기반으로 개발하기 전에 `GET /qorechain/abstractaccount/v1/config`를 확인하세요.
:::

| 파라미터              | 값       | 설명                             |
| --------------------- | -------- | -------------------------------- |
| `enabled`             | `false` (테스트넷: `true`) | 모듈 활성화 플래그 |
| `max_session_keys`    | `10`     | 계정당 최대 세션 키 수           |
| `max_spending_rules`  | `5`      | 최대 지출 규칙 수                |
| `default_session_ttl` | `86400` s| 기본 세션 키 수명                |

---

## 스테이킹, 슬래싱, 거버넌스, 수수료, EVM {#core-modules}

표준 Cosmos SDK 및 EVM 모듈이며, 모두 2026년 10월 27일에 메인넷에서 실시간으로 읽은 값입니다(이전에 읽은 값에서 변경 없음). 테스트넷은 거버넌스 투표 기간, 활성화된 EVM 프리컴파일, QoreChain Native 인스턴스화 권한을 제외하면 동일합니다([테스트넷과 메인넷의 차이점](#testnet-differences) 참조).

| 모듈 | 파라미터 | 값 |
| --- | --- | --- |
| 스테이킹 | `unbonding_time` | 1,814,400 s (21일) |
| | `max_validators` | 100 |
| | `max_entries` | 7 |
| | `historical_entries` | 10,000 |
| | `bond_denom` | `uqor` |
| | `min_commission_rate` | 0 |
| 슬래싱 | `signed_blocks_window` | 10,000 블록(≈3.1초 블록 기준 약 8.7시간) |
| | `min_signed_per_window` | 5 % (구간의 5 % 미만으로 서명한 검증자는 감옥에 보내짐) |
| | `downtime_jail_duration` | 600 s |
| | `slash_fraction_downtime` | 1 % |
| | `slash_fraction_double_sign` | 5 % |
| 거버넌스 | `min_deposit` | 10,000,000 uqor (10 QOR) |
| | `max_deposit_period` / `voting_period` | 각각 172,800 s (2일) |
| | `quorum` / `threshold` / `veto_threshold` | 0.334 / 0.5 / 0.334 |
| | `expedited_voting_period` / `expedited_min_deposit` / `expedited_threshold` | 86,400 s / 50 QOR / 0.667 |
| | `burn_vote_veto` | `true` |
| 분배 | `community_tax` | 0.02 |
| 수수료 시장 | `min_gas_price` | 가스당 0.1 uqor |
| | `base_fee_change_denominator` / `elasticity_multiplier` | 8 / 2 |
| | `no_base_fee` | `false` |
| EVM | `evm_denom` / `extended_denom` | `uqor` / `aqor` (소수점 18자리) |
| | 컨트랙트 생성 / 호출 접근 | 퍼미션리스 |
| | `active_static_precompiles` | 메인넷에서는 비어 있음(활성화된 EVM 프리컴파일 없음, 테스트넷은 세 개가 활성화되어 있음. 아래 참조) |
| | `history_serve_window` | 8,192 |
| ERC-20 | `enable_erc20` / `permissionless_registration` | `true` / `false` |
| QoreChain Native | `code_upload_access` / `instantiate_default_permission` | `Nobody` / `Nobody` |

---

## 서킷 브레이커 상태 {#circuit-breaker}

체인은 Cosmos SDK 서킷 브레이커로 개별 메시지 유형을 끌 수 있으며, 이는 재단 운영 계정과 거버넌스가 제어합니다. 비활성화된 메시지 유형은 모든 레인에서 앤티 핸들러가 거부합니다. 실시간 목록은 `GET /cosmos/circuit/v1/disable_list`에서 확인할 수 있습니다.

**메인넷(2026년 10월 30일, 16개 항목, 10월 14일 이후 변경 없음, v3.2.5 업그레이드로도 변경되지 않음):** 베스팅 계정 생성(`MsgCreateVestingAccount`, `MsgCreatePermanentLockedAccount`, `MsgCreatePeriodicVestingAccount`); QoreChain Native `MsgStoreCode`, `MsgInstantiateContract`, `MsgInstantiateContract2`; AMM `MsgPausePool`, `MsgResumePool`; `crossvm.MsgCrossVMCall`; `multilayer.MsgUpdateLayerStatus`; `pqc.MsgDeprecateAlgorithm`, `pqc.MsgDisableAlgorithm`; 그리고 PRISM 제어 메시지 네 가지(`MsgSetAgentMode`, `MsgUpdatePolicy`, `MsgUpdateRewardWeights`, `MsgResumeAgent`). EVM 레인(`MsgEthereumTx`)은 **열려 있습니다**. 9월 16일부터 25일까지 꺼져 있었으며 v3.2.0 업그레이드로 다시 열렸습니다.

**테스트넷(2026년 10월 27일, 1개 항목):** QoreChain Native `MsgStoreCode`(컨트랙트 업로드)만 해당되며, 인스턴스화는 더 이상 그곳에서 꺼져 있지 않습니다.

표준 bank, staking, governance, distribution, authz, `x/pqc` 등록 메시지를 포함한 그 밖의 모든 메시지 유형은 활성화되어 있습니다. 이 목록은 거버넌스로 제어되며 변경될 수 있으므로 항상 조회하세요.

---

## 테스트넷과 메인넷의 차이점 {#testnet-differences}

2026년 10월 27일에 실시간으로 읽었고 v3.2.5 업그레이드 이후 2026년 10월 30일에 다시 확인했습니다. 메인넷 `qorechain-vladi`는 v3.2.5를 실행합니다(높이 3,906,833, 2026년 10월 29일부터, 거버넌스 제안 14. v3.2.4는 2026년 10월 23일 높이 3,742,566에서 적용되었습니다). 테스트넷 `qorechain-diana`는 **v3.2.6**을 실행합니다. v3.2.4는 높이 8,337,253(2026년 10월 19일), v3.2.5는 높이 8,890,800(10월 26일), v3.2.6은 높이 8,970,638(10월 27일)에 적용되었습니다. 테스트넷은 각 릴리스를 먼저 받는 스테이징 네트워크이며 테스트에 맞게 조정되어 있으므로 아래 값들은 메인넷과 다릅니다. 이 섹션은 이 페이지의 파라미터 표를 다루며, 이제 두 네트워크 모두 v3.2.5를 갖추고 있으므로 남아 있는 차이는 테스트넷 전용 릴리스 v3.2.6과 테스트넷 튜닝에서 비롯됩니다. 여기에 나열되지 않은 모든 파라미터는 두 네트워크에서 동일합니다(스테이킹, 슬래싱, 분배, 수수료 시장, ERC-20, AMM, 소각, 라이트 노드, 브리지, 가스 추상화, 시간 잠금 스테이킹 값을 하나씩 비교했습니다).

| 영역 | 메인넷 | 테스트넷 |
| ---- | ------- | ------- |
| 거버넌스 투표 기간 | `voting_period` 172,800 s(2일). `expedited_voting_period` 86,400 s(1일) | `voting_period` 14,400 s(4시간). `expedited_voting_period` 3,600 s(1시간). 예치금, 정족수, 임계값은 동일 |
| `x/inflation` | `emission_mode` `fixed`. `fixed_epoch_emission` 86,000 QOR. `max_total_emission` 590,000,000 QOR. `target_apy_bps` `0` | `emission_mode` `target_apy`. `target_apy_bps` `1667`. `fixed_epoch_emission` 16,239 QOR. `max_total_emission` 3,950,390,341,362,112,750 uqor, 이미 도달함(`/qorechain/inflation/v1/epoch_info`의 `remaining_emission`이 `0`이므로 테스트넷은 더 이상 발행하지 않음) |
| EVM 활성 정적 프리컴파일 | 없음(`[]`) | 세 개: `0x0000000000000000000000000000000000000C01`의 PRISM 파라미터 프리컴파일, 그리고 `0x...0a01`과 `0x...0a02`의 프리컴파일 |
| PRISM 에이전트(`x/rlconsensus`) | 관측 모드, 정책 미로드. 제어 메시지는 꺼져 있음 | 시연용 정책이 있는 섀도 모드(테스트넷 거버넌스가 설정). `GET /qorechain/rlconsensus/v1/...`이 응답함(메인넷은 501로 응답) |
| 스마트 계정(`x/abstractaccount`) | `enabled` `false` | `enabled` `true` |
| RDK(`x/rdk`) | `max_rollups` 100. `default_challenge_window` 604,800 s | `max_rollups` 200. `default_challenge_window` 3,600 s |
| 멀티레이어(`x/multilayer`) | `max_sidechains` 10 | `max_sidechains` 64 |
| QoreChain Native 인스턴스화 권한 | `Nobody` | `Everybody`(코드 업로드는 두 네트워크 모두 `Nobody` 유지) |
| 서킷 브레이커 | 16개 항목(위 참조), `MsgCrossVMCall`, `MsgInstantiateContract`, `MsgInstantiateContract2` 포함 | 1개 항목: QoreChain Native `MsgStoreCode` |
| REST 파라미터 경로 | `x/pqc`와 `x/rlconsensus` 파라미터는 501로 응답(`/qorechain/crossvm/v1/params`와 `/qorechain/rdk/v1/params`는 v3.2.5부터 응답함) | `GET /qorechain/pqc/v1/params`와 `/qorechain/rlconsensus/v1/params`도 응답함(v3.2.6) |
| 블록 시간과 검증인 | 약 3.1초. 본딩된 검증인 8명 | 약 1.3초. 본딩된 검증인 4명 |
| 테스트 토큰 | 없음 | fUSD, fETH, fBTC([파우셋](/dashboard/faucet#fest-tokens) 참조) |

두 네트워크 모두 v3.2.4 추가 사항을 포함합니다. 선택적 시간 잠금 스테이킹 모듈 `x/stakingtier`(48개 대신 49개 모듈; `GET /qorechain/stakingtier/v1/params`, 최소 잠금 10 QOR, 조기 해제 페널티 5 %), 열세 번째 기록 소각 소스(`staking_tier_penalty`), 노드 자신의 등록 시점부터 시작되는 보상 한도를 가진 추가 라이트 노드 보상 풀 보고 필드, PQC 계정의 `possession_proven` 플래그(소유 증명은 계정 키에는 선택 사항으로 유지되며 브리지 검증자 키에는 필수), 블록 시간으로 계산되는 RDK 챌린지 윈도우, 그리고 `protocol_features` 및 `auth_nonce` 쿼리가 그것입니다. [스테이킹과 위임](/user-guide/staking-and-delegation#time-locked-staking)을 참조하세요. 테스트넷에 추가된 v3.2.6 사항은 [버전 이력](/appendix/version-history#testnet-v326)에 요약되어 있습니다.
