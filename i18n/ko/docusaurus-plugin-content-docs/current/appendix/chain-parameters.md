---
slug: /appendix/chain-parameters
title: 체인 파라미터
sidebar_label: 체인 파라미터
sidebar_position: 2
---

# 체인 파라미터

QoreChain 제네시스에서 구성 가능한 모든 모듈 파라미터를 통합 정리한 참조 문서입니다. 파라미터는 모듈별로 그룹화되어 있으며 런타임에 `qorechaind query <module> params`로 조회할 수 있습니다.

:::note
표시된 값은 배포된 제네시스 기본값입니다. 별도 표기가 없는 한, 파라미터는 메인넷 **`qorechain-vladi`**(EVM 체인 ID **9801**)와 테스트넷 **`qorechain-diana`**(EVM 체인 ID **9800**)에 적용됩니다.
:::

---

## PQC 모듈 (`x/pqc`)

| 파라미터                    | 타입   | 기본값                 | 설명                                                                   |
| --------------------------- | ------ | ---------------------- | ---------------------------------------------------------------------- |
| `hybrid_signature_mode`     | uint   | `2` (required)         | 강제 모드: 0=비활성, 1=선택, 2=필수 (현재 기본값)                      |
| `allow_classical_fallback`  | bool   | `false`                | 고전 전용 폴백은 닫혀 있음; cosmos 트랜잭션은 하이브리드여야 함        |
| `algorithm_registry`        | array  | ML-DSA-87, ML-KEM-1024 | 크기 제약이 적용된 등록된 PQC 알고리즘                                 |
| `auto_register_enabled`     | bool   | `true`                 | 첫 하이브리드 트랜잭션 시 PQC 키 자동 등록                             |
| `migration_deadline_height` | uint64 | `0`                    | 이 블록 높이 이후 고전 전용 키가 거부됨 (0=비활성)                     |
| `migration_grace_period`    | uint64 | `100000`               | 마이그레이션 마감 전 경고 블록 수                                      |

---

## AI 모듈 (`x/ai`)

| 파라미터                   | 타입   | 기본값        | 설명                                              |
| -------------------------- | ------ | ------------- | ------------------------------------------------- |
| `anomaly_weight_volume`    | string | `0.30`        | 사기 점수화에서 거래량 이상에 대한 가중치         |
| `anomaly_weight_velocity`  | string | `0.25`        | 사기 점수화에서 속도 이상에 대한 가중치           |
| `anomaly_weight_pattern`   | string | `0.25`        | 사기 점수화에서 패턴 이상에 대한 가중치           |
| `anomaly_weight_network`   | string | `0.20`        | 사기 점수화에서 네트워크 그래프 이상에 대한 가중치 |
| `fraud_threshold_low`      | string | `0.30`        | 저위험 경고에 대한 점수 임계값                    |
| `fraud_threshold_medium`   | string | `0.55`        | 중위험 경고에 대한 점수 임계값                    |
| `fraud_threshold_high`     | string | `0.75`        | 고위험 경고에 대한 점수 임계값                    |
| `fraud_threshold_critical` | string | `0.90`        | 치명적 위험 경고에 대한 점수 임계값               |
| `circuit_breaker_enabled`  | bool   | `true`        | QCAI 서킷 브레이커 활성화                         |

---

## 평판 모듈 (`x/reputation`)

| 파라미터       | 타입   | 기본값        | 설명                                                |
| -------------- | ------ | ------------- | --------------------------------------------------- |
| `alpha`        | string | `0.30`        | 평판 공식에서 가동시간 점수(S\_i)에 대한 가중치     |
| `beta`         | string | `0.25`        | 참여 점수(P\_i)에 대한 가중치                       |
| `gamma`        | string | `0.25`        | 커뮤니티 점수(C\_i)에 대한 가중치                   |
| `delta`        | string | `0.20`        | 재임 기간 점수(T\_i)에 대한 가중치                  |
| `decay_lambda` | string | `0.01`        | 과거 점수에 적용되는 지수적 시간 감쇠 계수          |

평판 공식: `R_i = alpha * S_i + beta * P_i + gamma * C_i + delta * T_i`, 에포크마다 지수적 시간 감쇠가 적용됩니다.

---

## QCA 모듈 (`x/qca`)

| 파라미터                       | 타입   | 기본값        | 설명                                          |
| ------------------------------ | ------ | ------------- | --------------------------------------------- |
| `emerald_pool_weight`          | string | `0.50`        | Emerald 풀의 블록 제안 가중치                 |
| `sapphire_pool_weight`         | string | `0.30`        | Sapphire 풀의 블록 제안 가중치                |
| `ruby_pool_weight`             | string | `0.20`        | Ruby 풀의 블록 제안 가중치                    |
| `emerald_min_reputation`       | string | `0.80`        | Emerald 풀의 최소 평판 점수                   |
| `sapphire_min_reputation`      | string | `0.50`        | Sapphire 풀의 최소 평판 점수                  |
| `bonding_curve_base_rate`      | string | `0.05`        | 스테이킹 본딩 커브의 기본 비율               |
| `bonding_curve_multiplier`     | string | `1.50`        | 본딩 커브 진행에 대한 승수                    |
| `slashing_downtime_window`     | int64  | `10000`       | 다운타임을 평가하는 블록 수                   |
| `slashing_downtime_threshold`  | string | `0.05`        | 슬래싱 전 최소 서명 블록 비율                 |
| `slashing_downtime_penalty`    | string | `0.01`        | 다운타임에 대한 슬래시 비율                   |
| `slashing_double_sign_penalty` | string | `0.05`        | 이중 서명에 대한 슬래시 비율                  |
| `qdrw_enabled`                 | bool   | `true`        | 동적 보상 가중치 활성화                       |
| `qdrw_throughput_weight`       | string | `0.40`        | 처리량 지표에 대한 QDRW 가중치                |
| `qdrw_latency_weight`          | string | `0.30`        | 지연 지표에 대한 QDRW 가중치                  |
| `qdrw_security_weight`         | string | `0.20`        | 보안 지표에 대한 QDRW 가중치                  |
| `qdrw_decentralization_weight` | string | `0.10`        | 탈중앙화 지표에 대한 QDRW 가중치              |
| `qdrw_adjustment_cap`          | string | `0.10`        | 단일 에포크 최대 QDRW 조정폭                  |
| `qdrw_adjustment_interval`     | int64  | `100`         | QDRW 조정 간 블록 수                          |

---

## 소각 모듈 (`x/burn`)

| 파라미터            | 타입   | 기본값        | 설명                                              |
| ------------------- | ------ | ------------- | ------------------------------------------------- |
| `burn_enabled`      | bool   | `true`        | 수수료 소각 메커니즘 활성화                       |
| `validator_share`   | string | `0.37`        | 블록 검증자에게 분배되는 수수료 비율             |
| `burn_share`        | string | `0.30`        | 영구 소각되는 수수료 비율                         |
| `treasury_share`    | string | `0.20`        | 커뮤니티 트레저리로 보내지는 수수료 비율          |
| `staker_share`      | string | `0.10`        | 위임자에게 분배되는 수수료 비율                   |
| `light_node_share`  | string | `0.03`        | 라이트 노드에 분배되는 수수료 비율               |

비율의 합은 `1.00`이어야 합니다. 수수료 분배는 검증자, 소각, 트레저리, 스테이커, 라이트 노드에 걸쳐 **37 / 30 / 20 / 10 / 3** 입니다.

---

## xQORE 모듈 (`x/xqore`)

| 파라미터             | 타입   | 기본값        | 설명                                          |
| -------------------- | ------ | ------------- | --------------------------------------------- |
| `min_lock_amount`    | string | `1000000uqor` | xQORE로 잠글 최소 금액                        |
| `min_lock_duration`  | string | `7d`          | 최소 잠금 기간                                |
| `max_lock_duration`  | string | `365d`        | 최대 잠금 기간                                |
| `penalty_tier_1_pct` | string | `0.50`        | 조기 해제 페널티: 잠금 경과 0-25%             |
| `penalty_tier_2_pct` | string | `0.30`        | 조기 해제 페널티: 잠금 경과 25-50%            |
| `penalty_tier_3_pct` | string | `0.15`        | 조기 해제 페널티: 잠금 경과 50-75%            |
| `penalty_tier_4_pct` | string | `0.05`        | 조기 해제 페널티: 잠금 경과 75-100%           |
| `pvp_rebase_enabled` | bool   | `true`        | PvP 리베이스 재분배 활성화                    |

---

## 인플레이션 모듈 (`x/inflation`)

| 파라미터          | 타입   | 기본값                 | 설명                                              |
| ----------------- | ------ | ---------------------- | ------------------------------------------------ |
| `epoch_length`    | uint64 | `100`                  | 인플레이션 에포크당 블록 수                       |
| `blocks_per_year` | uint64 | `6311520`              | 연간 추정 블록 수 (비율 계산용)                   |
| `initial_rate`    | string | `0.08`                 | 초기 연환산 발행 비율 파라미터                    |
| `rate_decay`      | string | `0.05`                 | 매년 적용되는 감쇠 계수                           |
| `min_rate`        | string | `0.02`                 | 최저 발행 비율 파라미터                           |
| `max_supply`      | string | `1000000000000000uqor` | 최대 토큰 공급 상한                               |

:::note
위의 `x/inflation` 파라미터는 배포된 메커니즘 기본값입니다. 표준 **토크노믹스 v2.1** 경제 모델에서 QoreChain은 **고정 공급(fixed-supply)** 방식이며, 스테이킹 및 생태계 보상을 지원하는 **유한 발행 예산(590M 풀)**을 가집니다. `initial_rate` / `rate_decay` / `min_rate` 값은 해당 유한 예산 내에서 발행 일정이 어떻게 짜이는지를 규율하는 메커니즘 세부 사항이며, 총 공급량의 개방형 비율 인플레이션이 **아닙니다**.
:::

---

## RL 컨센서스 모듈 (`x/rlconsensus`)

`x/rlconsensus` 모듈은 QoreChain 컨센서스 엔진의 강화학습 최적화 계층인 **PRISM**을 구현합니다.

| 파라미터                     | 타입   | 기본값        | 설명                                            |
| ---------------------------- | ------ | ------------- | ----------------------------------------------- |
| `observation_interval`       | uint64 | `10`          | PRISM 관측 샘플 간 블록 수                       |
| `agent_mode`                 | uint   | `0`           | 에이전트 모드: 0=꺼짐, 1=관측, 2=제안, 3=자동   |
| `circuit_breaker_enabled`    | bool   | `true`        | PRISM 서킷 브레이커 활성화                       |
| `circuit_breaker_max_change` | string | `0.10`        | 액션당 최대 파라미터 변경 (10%)                  |
| `circuit_breaker_cooldown`   | uint64 | `100`         | 서킷 브레이커 작동 후 대기 블록 수              |
| `reward_throughput_weight`   | string | `0.40`        | 처리량에 대한 보상 가중치                        |
| `reward_latency_weight`      | string | `0.30`        | 지연에 대한 보상 가중치                          |
| `reward_security_weight`     | string | `0.20`        | 보안에 대한 보상 가중치                          |
| `reward_stability_weight`    | string | `0.10`        | 안정성에 대한 보상 가중치                        |
| `ppo_learning_rate`          | string | `0.0003`      | PPO 학습률                                       |
| `ppo_clip_range`             | string | `0.20`        | PPO 클리핑 범위                                  |

---

## 브리지 모듈 (`x/bridge`)

| 파라미터                        | 타입   | 기본값        | 설명                                            |
| ------------------------------- | ------ | ------------- | ----------------------------------------------- |
| `min_confirmations_ibc`         | uint64 | `1`           | IBC 전송의 최소 확인 수                          |
| `min_confirmations_ethereum`    | uint64 | `12`          | Ethereum 브리지의 최소 확인 수                   |
| `min_confirmations_bitcoin`     | uint64 | `6`           | Bitcoin 브리지의 최소 확인 수                    |
| `circuit_breaker_enabled`       | bool   | `true`        | 브리지 서킷 브레이커 활성화                      |
| `circuit_breaker_max_daily_usd` | string | `10000000`    | 최대 일일 브리지 거래량 (USD 환산)              |
| `circuit_breaker_max_single_tx` | string | `1000000`     | 최대 단일 전송 금액 (USD 환산)                  |

---

## 멀티레이어 모듈 (`x/multilayer`)

| 파라미터                    | 타입   | 기본값             | 설명                                              |
| --------------------------- | ------ | ------------------ | ------------------------------------------------- |
| `max_sidechains`            | uint   | `10`               | 등록 가능한 최대 사이드체인 수                     |
| `max_paychains`             | uint   | `50`               | 등록 가능한 최대 페이체인 수                       |
| `anchor_interval_sidechain` | uint64 | `100`              | 사이드체인의 필수 앵커 간격 (블록)                |
| `anchor_interval_paychain`  | uint64 | `50`               | 페이체인의 필수 앵커 간격 (블록)                  |
| `challenge_period`          | string | `7d`               | 앵커에 대한 사기 챌린지 기간                       |
| `min_sidechain_stake`       | string | `1000000000uqor` | 사이드체인 등록 최소 스테이크 (1,000 QOR)         |
| `min_paychain_stake`        | string | `100000000uqor`  | 페이체인 등록 최소 스테이크 (100 QOR)             |
| `routing_threshold`         | string | `0.80`             | 자동 라우팅을 트리거하는 부하 임계값             |

---

## 크로스-VM 모듈 (`x/crossvm`)

| 파라미터           | 타입   | 기본값        | 설명                                          |
| ------------------ | ------ | ------------- | --------------------------------------------- |
| `max_message_size` | uint64 | `65536`       | 크로스-VM 메시지의 최대 크기 (바이트, 64 KB) |
| `max_queue_size`   | uint   | `1000`        | 크로스-VM 큐의 최대 대기 메시지 수           |
| `queue_timeout`    | uint64 | `100`         | 대기 메시지가 타임아웃되기까지의 블록 수      |

---

## SVM 모듈 (`x/svm`)

| 파라미터                      | 타입   | 기본값        | 설명                                         |
| ----------------------------- | ------ | ------------- | -------------------------------------------- |
| `max_program_size`            | uint64 | `10485760`    | 최대 프로그램 바이너리 크기 (바이트, 10 MB) |
| `compute_budget`              | uint64 | `1400000`     | 트랜잭션당 기본 컴퓨트 유닛 (1.4M)          |
| `rent_lamports_per_byte_year` | uint64 | `3480`        | 바이트당 연간 임대 비용 (lamports)          |
| `rent_exemption_threshold`    | string | `2.0`         | 면제에 필요한 임대 연수                      |
| `max_accounts_per_tx`         | uint   | `64`          | 트랜잭션당 참조 가능한 최대 계정 수         |

---

## RDK 모듈 (`x/rdk`)

| 파라미터              | 타입   | 기본값                             | 설명                                     |
| --------------------- | ------ | ---------------------------------- | ---------------------------------------- |
| `max_rollups`         | uint   | `100`                              | 등록 가능한 최대 롤업 수                  |
| `min_stake`           | string | `10000000000uqor`                  | 최소 운영자 스테이크 (10,000 QOR)        |
| `burn_rate`           | string | `0.01`                             | 소각되는 롤업 수수료 비율 (1%)           |
| `challenge_window`    | string | `7d`                               | 사기 챌린지 윈도우 기간                   |
| `max_blob_size`       | uint64 | `2097152`                          | 최대 DA blob 크기 (바이트, 2 MB)         |
| `blob_retention`      | uint64 | `432000`                           | 프루닝 전 DA blob 보관 블록 수           |
| `max_batches_pending` | uint   | `10`                               | 롤업당 최대 미확정 배치 수               |
| `auto_finalize`       | bool   | `true`                             | EndBlocker 자동 확정 활성화              |
| `settlement_types`    | array  | optimistic, zk, based, sovereign   | 허용되는 정산 패러다임                   |
| `preset_profiles`     | array  | defi, gaming, nft, enterprise, custom | 사용 가능한 롤업 프리셋               |

---

## FairBlock 모듈 (`x/fairblock`)

| 파라미터             | 타입   | 기본값        | 설명                                        |
| -------------------- | ------ | ------------- | ------------------------------------------- |
| `enabled`            | bool   | `false`       | FairBlock tIBE 암호화 활성화                |
| `tibe_threshold`     | uint   | `2`           | 필요한 최소 복호화 키 셰어 수               |
| `decryption_delay`   | uint64 | `1`           | 확정 후 복호화까지의 블록 수                |
| `max_encrypted_size` | uint64 | `4096`        | 최대 암호화 페이로드 크기 (바이트)         |

---

## 가스 추상화 모듈 (`x/gasabstraction`)

| 파라미터          | 타입  | 기본값        | 설명                                                  |
| ----------------- | ----- | ------------- | ----------------------------------------------------- |
| `accepted_tokens` | array | (아래 참조)   | 변환 비율과 함께 가스 결제에 허용되는 토큰            |

**기본 허용 토큰:**

| 토큰 단위   | 변환 비율       | 설명                   |
| ----------- | --------------- | ---------------------- |
| `uqor`      | `1.0`           | 네이티브 QOR 토큰 (1:1) |
| `ibc/USDC`  | `1.0`           | IBC 브리지 USDC        |
| `ibc/ATOM`  | `10.0`          | IBC 브리지 ATOM        |

변환 비율은 토큰 단위당 가스 유닛 수를 나타냅니다. 비율이 높을수록 각 토큰 단위가 더 많은 가스를 커버합니다.
