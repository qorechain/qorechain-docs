---
slug: /appendix/chain-parameters
title: 체인 파라미터
sidebar_label: 체인 파라미터
sidebar_position: 2
---

# 체인 파라미터

QoreChain 네트워크의 모듈 파라미터를 모듈별로 묶어 통합 정리한 참조 문서입니다. 파라미터는 해당 모듈에 params 쿼리가 있는 경우 `qorechaind query <module> params`로 조회할 수 있습니다(`pqc`, `amm`, `crossvm`, `lightnode`, `multilayer`, `reputation`, `rlconsensus`. `ai`, `qca`, `rdk`, `bridge`, `abstractaccount`, `gasabstraction`은 `config`를 사용하며, `gasabstraction`은 테스트넷에서만 조회할 수 있습니다). REST로는 [REST / gRPC 레퍼런스](/api-reference/rest-grpc-endpoints)에 나열된 경로만 조회할 수 있습니다. `ai`, `qca`, `reputation`, `crossvm`, `rlconsensus`, `fairblock`, `xqore`는 REST를 지원하지 않습니다.

:::note
표시된 값은 2026년 10월 14일에 실시간으로 읽은 값입니다(거버넌스 제안으로 변경된 경우를 제외하면 메인넷 제네시스 값이며, 변경된 값은 별도로 표기했습니다). 파라미터는 메인넷 **`qorechain-vladi`**(EVM 체인 ID **9801**)와 테스트넷 **`qorechain-diana`**(EVM 체인 ID **9800**)에 적용되며, 별도 표기가 없는 한 두 네트워크에서 동일합니다. 블록 단위로 표시된 기간은 측정된 메인넷 블록 시간인 약 3.2초로 환산한 것입니다(테스트넷은 약 1초마다 블록을 생성합니다).
:::

---

## PQC 모듈 (`x/pqc`)

| 파라미터                   | 값                         | 설명                                                                     |
| -------------------------- | -------------------------- | ------------------------------------------------------------------------ |
| `pqc_primary`              | `true`                     | 포스트 퀀텀 서명이 기본 방식임                                           |
| `allow_classical_fallback` | `false`                    | 고전 전용 폴백은 닫혀 있음; Cosmos 레인 트랜잭션은 하이브리드여야 함     |
| `min_security_level`       | `5`                        | 등록 알고리즘에 요구되는 최소 NIST 보안 수준                             |
| `default_migration_blocks` | `1,000,000`                | 거버넌스로 시작된 알고리즘 마이그레이션의 기본 기간(≈3.2초 블록 기준 약 37일) |
| `default_signature_algo`   | `1`                        | Dilithium-5 / ML-DSA-87                                                  |
| `hybrid_signature_mode`    | `2` (required)             | 강제 모드: 0=비활성, 1=선택, 2=필수                                      |

알고리즘 레지스트리(id 1 `dilithium5`, id 2 `mlkem1024`)는 파라미터가 아니라 체인 상태입니다. 키는 `MsgRegisterPQCKey`로 명시적으로 등록하며, 자동 등록은 없습니다.

---

## AI 모듈 (`x/ai`)

모듈 설정(`qorechaind query ai config`):

| 파라미터            | 값                     | 설명                                                                        |
| ------------------- | ---------------------- | --------------------------------------------------------------------------- |
| `anomaly_threshold` | `0.7`                  | 이 이상 점수를 넘으면 앤티 핸들러가 트랜잭션을 플래그 처리함 |
| `routing_strategy`  | `reputation_weighted`  | 라우팅 전략                                                                 |
| `risk_threshold`    | `0.8`                  | 위험 점수 임계값                                                            |
| `max_tx_per_minute` | `600`                  | Cosmos 레인에서 30블록 구간(≈3.2초 블록 기준 약 96초) 동안 집계되는 발신자별 트랜잭션 한도(이름은 과거 명칭임). v3.2.0부터 적용되며 기본값은 10 |

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
| `failed_tx_burn_rate`  | `0.10`                       | 실패한 트랜잭션 가스 중 소각되는 비율                 |
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
| `fixed_epoch_emission` | `16,239,000,000 uqor` (16,239 QOR) | fixed 모드에서 에포크마다 발행되는 양      |
| `max_total_emission`   | `114,285,714,000,000 uqor` (114,285,714 QOR) | 누적 발행 하드 상한            |
| `epoch_length`         | `43,200` blocks         | 에포크당 블록 수(≈3.2초 블록 기준 약 38.6시간)        |
| `schedule`             | 17.5 %, 11 %, 7 %, 7 %, 2 % | 연도별 레거시 비율, fixed 모드에서는 사용되지 않음 |
| `enabled`              | `true`                  | 모듈 활성화 플래그                                    |

이 모듈은 상한에 도달할 때까지 이 발행량을 수수료 수집기로 발행합니다. [토크노믹스](/architecture/tokenomics#supply-and-emission)를 참조하세요. 메인넷에서는 이 값들이 REST 경로로 노출되지 않습니다.

---

## RL 컨센서스 모듈 (`x/rlconsensus`)

`x/rlconsensus` 모듈은 강화학습 최적화 계층인 **PRISM**을 구현합니다. 두 네트워크 모두 관측 모드이며, 정책 가중치가 로드되어 있지 않아 아무것도 조정하지 않습니다. PRISM 제어 메시지 네 가지는 메인넷에서 서킷 브레이커로 꺼져 있습니다([서킷 브레이커 상태](#circuit-breaker) 참조).

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
37개 체인 설정이 모두 `pending` 상태이며, 등록된 브리지 검증자도, 생성된 브리지 작업도 없고, 어느 네트워크에서도 열린 IBC 채널이 없습니다. [브리지 아키텍처](/architecture/bridge-architecture)를 참조하세요.
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
| `max_sidechains`               | `10`             | 등록 가능한 최대 사이드체인 수                    |
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

`MsgCrossVMCall`은 메인넷에서 서킷 브레이커로 꺼져 있습니다(테스트넷에서는 활성화).

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
| `max_rollups`               | `100`                | 등록 가능한 최대 롤업 수                      |
| `min_stake_for_rollup`      | `10,000,000,000 uqor`| 최소 운영자 스테이크(10,000 QOR)              |
| `rollup_creation_burn_rate` | `0.01`               | 생성 스테이크 중 소각되는 비율(1%)            |
| `default_challenge_window`  | `604,800` s          | 기본 챌린지 윈도우(7일)                       |
| `max_da_blob_size`          | `2,097,152`          | 최대 DA blob 크기(바이트, 2 MB)               |
| `blob_retention_blocks`     | `432,000`            | DA blob 보관 블록 수(≈3.2초 블록 기준 약 16일) |
| `max_batches_per_block`     | `10`                 | 블록당 처리되는 최대 배치 수                  |

두 네트워크 모두 아직 생성된 롤업이 없습니다.

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

:::note 열린 IBC 채널 없음
어느 네트워크에도 열린 IBC 채널이 없으므로 `ibc/USDC`나 `ibc/ATOM`은 아직 존재할 수 없으며, 수수료는 `uqor`로 지불합니다. 수수료 경로는 v3.2.2에서 개편되었습니다(테스트넷 전용).
:::

---

## 라이트 노드 모듈 (`x/lightnode`)

| 파라미터                 | 값                 | 설명                                                 |
| ------------------------ | ------------------ | ---------------------------------------------------- |
| `registration_fee`       | `1,000,000 uqor` (1 QOR) | 라이트 노드 등록 수수료                        |
| `heartbeat_interval`     | `1000` blocks      | 필수 하트비트 간 블록 수(≈3.2초 블록 기준 약 54분)   |
| `min_delegated_stake`    | `1,000,000,000 uqor` (1,000 QOR) | 운영자가 위임해야 하는 최소 스테이크   |
| `reward_share`           | `0.03`             | 라이트 노드용으로 따로 떼어 두는 수수료 수집기 비율  |
| `min_uptime_for_rewards` | `0.80`             | 보상 자격을 위한 최소 가동 비율                      |
| `max_light_nodes`        | `10,000`           | 등록 가능한 최대 라이트 노드 수                      |
| `heartbeat_grace_period` | `100` blocks       | 늦은 하트비트에 대한 유예 기간                       |

보상 회계는 라이브 상태이지만(`GET /qorechain/lightnode/v1/reward_pool`은 2026년 10월 14일 기준 `max_reward_per_block_per_node` 1,713 uqor를 반환합니다), 현재 등록은 닫혀 있으며 등록된 라이트 노드는 없습니다. [토크노믹스](/architecture/tokenomics#stranded-and-reserve)를 참조하세요.

---

## AMM 모듈 (`x/amm`)

| 파라미터                | 값                            | 설명                                |
| ----------------------- | ----------------------------- | ----------------------------------- |
| `swap_fee_bps`          | `30`                          | 스왑 수수료(0.30%)                  |
| `protocol_fee_bps`      | `10`                          | 프로토콜 수수료 몫(0.10%)           |
| `min_liquidity`         | `1000`                        | 최소 유동성                         |
| `max_pools_per_creator` | `50`                          | 생성자당 최대 풀 수                 |
| `lp_token_decimals`     | `6`                           | LP 토큰 소수점 자릿수               |
| `pool_creation_fee`     | `100,000,000 uqor` (100 QOR)  | 풀 생성 수수료                      |
| `max_swap_impact_bps`   | `500`                         | 스왑의 최대 가격 영향(5%)           |
| `enabled`               | `true`                        | 모듈 활성화 플래그                  |

메인넷과 테스트넷 모두 아직 풀이 없으며, `MsgPausePool` / `MsgResumePool`은 메인넷에서 꺼져 있습니다.

---

## 스마트 계정 (`x/abstractaccount`)

:::caution 두 네트워크 모두 꺼져 있음
`enabled`가 `false`입니다. 꺼져 있는 동안에는 인증자 등록, 인증자를 통한 실행, 스마트 계정 생성이 모두 거부됩니다. 이 기능을 기반으로 개발하기 전에 `GET /qorechain/abstractaccount/v1/config`를 확인하세요.
:::

| 파라미터              | 값       | 설명                             |
| --------------------- | -------- | -------------------------------- |
| `enabled`             | `false`  | 모듈 활성화 플래그               |
| `max_session_keys`    | `10`     | 계정당 최대 세션 키 수           |
| `max_spending_rules`  | `5`      | 최대 지출 규칙 수                |
| `default_session_ttl` | `86400` s| 기본 세션 키 수명                |

---

## 스테이킹, 슬래싱, 거버넌스, 수수료, EVM {#core-modules}

표준 Cosmos SDK 및 EVM 모듈이며, 실시간으로 읽은 값입니다(별도 표기가 없는 한 두 네트워크에서 동일).

| 모듈 | 파라미터 | 값 |
| --- | --- | --- |
| 스테이킹 | `unbonding_time` | 1,814,400 s (21일) |
| | `max_validators` | 100 |
| | `max_entries` | 7 |
| | `historical_entries` | 10,000 |
| | `bond_denom` | `uqor` |
| | `min_commission_rate` | 0 |
| 슬래싱 | `signed_blocks_window` | 10,000 블록(≈3.2초 블록 기준 약 8.9시간) |
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
| | `active_static_precompiles` | 비어 있음(활성화된 EVM 프리컴파일 없음) |
| | `history_serve_window` | 8,192 |
| ERC-20 | `enable_erc20` / `permissionless_registration` | `true` / `false` |
| CosmWasm | `code_upload_access` / `instantiate_default_permission` | `Nobody` / `Nobody` |

---

## 서킷 브레이커 상태 {#circuit-breaker}

체인은 Cosmos SDK 서킷 브레이커로 개별 메시지 유형을 끌 수 있으며, 이는 재단 운영 계정과 거버넌스가 제어합니다. 비활성화된 메시지 유형은 모든 레인에서 앤티 핸들러가 거부합니다. 실시간 목록은 `GET /cosmos/circuit/v1/disable_list`에서 확인할 수 있습니다.

**메인넷(2026년 10월 14일, 16개 항목):** 베스팅 계정 생성(`MsgCreateVestingAccount`, `MsgCreatePermanentLockedAccount`, `MsgCreatePeriodicVestingAccount`); CosmWasm `MsgStoreCode`, `MsgInstantiateContract`, `MsgInstantiateContract2`; AMM `MsgPausePool`, `MsgResumePool`; `crossvm.MsgCrossVMCall`; `multilayer.MsgUpdateLayerStatus`; `pqc.MsgDeprecateAlgorithm`, `pqc.MsgDisableAlgorithm`; 그리고 PRISM 제어 메시지 네 가지(`MsgSetAgentMode`, `MsgUpdatePolicy`, `MsgUpdateRewardWeights`, `MsgResumeAgent`). EVM 레인(`MsgEthereumTx`)은 **열려 있습니다**. 9월 16일부터 25일까지 꺼져 있었으며 v3.2.0 업그레이드로 다시 열렸습니다.

**테스트넷:** CosmWasm 메시지 세 가지만 해당됩니다.

표준 bank, staking, governance, distribution, authz, `x/pqc` 등록 메시지를 포함한 그 밖의 모든 메시지 유형은 활성화되어 있습니다. 이 목록은 거버넌스로 제어되며 변경될 수 있으므로 항상 조회하세요.
