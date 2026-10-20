---
slug: /user-guide/token-operations
title: 토큰 작업
sidebar_label: 토큰 작업
sidebar_position: 1
---

# 토큰 작업

이 가이드에서는 QOR 토큰, 토큰 송수신 방법, 잔액 조회, 그리고 QoreChain의 수수료 분배 모델에 대해 다룹니다.

:::note
아래 명령은 **`qorechain-diana`** 테스트넷(EVM chain ID **9800**)을 사용합니다. 메인넷(**`qorechain-vladi`**, EVM chain ID **9801**)은 2026년 6월 7일부터 가동 중이며 릴리스 **v3.2.3**을 실행합니다. 테스트넷은 **v3.2.4**를 실행합니다. 메인넷에서 거래할 때는 **메인넷 연결** 페이지의 메인넷 chain ID 및 엔드포인트로 대체하세요.
:::

:::caution `tx pqc cosign`으로 서명하세요
메인넷과 테스트넷은 모든 Cosmos 레인 트랜잭션에 하이브리드 포스트 양자 서명을 요구하므로, 이 페이지의 명령은 그대로는 브로드캐스트되지 않습니다. 명령에 `--generate-only > tx.json`을 추가한 다음 `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>`를 실행하세요. [하이브리드 서명](/cli-reference/transaction-commands#hybrid-signing)을 참조하세요. [QoreX](/qorex/overview)와 [대시보드](/dashboard/overview)는 이 서명을 대신 처리해 줍니다.
:::

## 토큰 정보

| 속성                      | 값                            |
| ------------------------ | ----------------------------- |
| **표시 단위**             | QOR                           |
| **기본 단위**             | uqor                          |
| **환산**                  | 1 QOR = 1,000,000 uqor (10^6) |
| **Chain ID**             | `qorechain-vladi` (메인넷) / `qorechain-diana` (테스트넷) |
| **Bech32 접두사**         | `qor` (예: `qor1abc...xyz`)    |

모든 온체인 금액은 **uqor** 단위로 표시됩니다. 거래를 제출할 때는 항상 금액을 uqor 단위로 지정하세요.

## 토큰 전송

한 계정에서 다른 계정으로 QOR 토큰을 전송하려면:

```bash
qorechaind tx bank send <from_address> <to_address> <amount>uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**예시:** 다른 주소로 5 QOR (5,000,000 uqor) 전송:

```bash
qorechaind tx bank send qor1sender... qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

송신자에 대해 원시 주소 대신 키 이름을 사용할 수도 있습니다:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

## 잔액 조회

모든 계정의 잔액을 확인합니다:

```bash
qorechaind query bank balances <address>
```

**예시:**

```bash
qorechaind query bank balances qor1abc...xyz
```

**샘플 출력:**

```yaml
balances:
- amount: "15000000"
  denom: uqor
pagination:
  next_key: null
  total: "0"
```

이는 해당 계정이 15 QOR (15,000,000 uqor)를 보유하고 있음을 나타냅니다.

## 수수료 구조

QoreChain의 거래 수수료는 네트워크 인센티브를 정렬하기 위해 다섯 곳으로 분배됩니다:

| 분배처          | 비율  | 목적                                                            |
| --------------- | ----- | --------------------------------------------------------------- |
| **검증인**      | 37%   | 블록 생성자에게 보상하고 네트워크를 보호합니다                    |
| **소각**        | 30%   | 공급량에서 영구적으로 제거됩니다                                  |
| **트레저리**    | 20%   | 프로토콜 개발과 생태계 보조금에 자금을 지원합니다                 |
| **스테이커**    | 10%   | 모든 위임자에게 비례하여 분배됩니다                              |
| **라이트 노드** | 3%    | 라이트 노드 보상(아래 참고 사항 참조)                             |

이 분배는 수수료 수집기에 들어오는 모든 것에 적용되며, 수수료 수집기에는 거래 수수료와 에포크마다 발행되는 스테이킹 발행량이 담깁니다. 라이트 노드 몫은 라이트 노드 보상 풀에 적립됩니다. 등록은 열려 있으며 라이선스로 제한되지만 아직 등록한 라이트 노드가 없으므로 현재 이 풀에서 지급받는 노드는 없습니다([라이트 노드](/light-node/overview#reward-program-status) 참조). v3.2.0 업그레이드 이후 스테이커 몫은 일반 스테이킹 보상으로 지급됩니다([토크노믹스](/architecture/tokenomics#stranded-and-reserve) 참조).

## 소각 채널

QoreChain의 소각 모듈은 12개의 소각 소스를 정의합니다. 이 중 어느 경로로든 소각된 QOR은 유통에서 영구적으로 제거됩니다. 메인넷에서는 현재까지 가스 수수료 채널과 실패한 거래 채널에서만 소각이 기록되었으며, 나머지는 정의되어 있지만 기록된 것이 없습니다. 테스트넷에는 선택적 시간 잠금 스테이킹 모듈을 위한 열세 번째 소스 `staking_tier_penalty`가 기록됩니다.

| 채널                | 설명                                                                             |
| ------------------ | -------------------------------------------------------------------------------- |
| `gas_fee`          | 모든 가스 수수료의 30%가 소각됩니다                                                |
| `contract_create`  | 컨트랙트 생성당 정액 100 QOR 수수료 소각 (비활성: CosmWasm 업로드가 닫혀 있음)    |
| `ai_service`       | AI 서비스 수수료의 50% 소각 (비활성: AI 서비스 수수료는 라이브가 아님)            |
| `bridge_fee`       | 브리지 수수료의 100% 소각 (비활성: 브리지는 라이브가 아님)                        |
| `treasury_buyback` | 트레저리에서 주기적으로 수행하는 바이백 후 소각                                    |
| `failed_tx`        | 실패한 거래 가스의 10%; v3.2.2부터 체인이 적용                                    |
| `xqore_penalty`    | 소각을 통해 처리되는 xQORE 조기 출금 페널티 (xQORE는 라이브가 아님)               |
| `auto_buyback`     | 프로토콜 수준의 자동 소각 (비활성)                                                |
| `tge`              | 예약됨; TGE 소각은 제네시스 이전에 이루어졌으며 이 채널에는 기록되는 것이 없음      |
| `rollup_create`    | 롤업 생성 스테이크의 1%가 소각됩니다                                              |
| `milestone`        | 고정된 누적 거래 건수에서 예약된 소각 (아직 발동된 적 없음)                        |
| `amm`              | AMM 프로토콜 수수료용으로 예약됨 (기록된 것 없음)                                  |

소각 모듈에는 CLI 조회 명령이 없습니다. 소스별 누적 소각량은 REST에서 읽으세요:

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stats
```

응답에는 `total_burned`와 `burns_by_source`(uqor 단위)가 나열됩니다. 현재 총 공급량은 `qorechaind query bank total-supply-of uqor`로 확인할 수 있습니다.

## 팁

:::caution
토큰을 전송하기 전에 항상 수신자 주소를 다시 확인하세요. QoreChain의 거래는 되돌릴 수 없습니다.
:::

:::tip

* `--dry-run` 플래그를 사용하면 거래를 브로드캐스트하지 않고 시뮬레이션할 수 있습니다.
* `--gas`를 명시적으로 설정하세요(하이브리드 서명 전송에는 400,000이면 충분합니다).
* 수수료 하한은 **가스 단위당 0.1 uqor**이므로, 가스 한도 400,000에는 최소 **40,000 uqor**가 필요합니다.

:::
