---
slug: /user-guide/bridging-assets
title: 자산 브리징
sidebar_label: 자산 브리징
sidebar_position: 5
---

# 자산 브리징

이 가이드에서는 QoreChain과 다른 블록체인 네트워크 간에 자산을 이동하는 방법을 설명합니다. QoreChain의 상호운용성 계층은 이기종 네트워크를 위한 **37개의 QCB(QoreChain Bridge) 구성**(QoreChain 루프백 포함)과 Cosmos 생태계 체인을 위한 **8개의 IBC 채널**로 구성됩니다.

:::caution
크로스체인 브리지는 현재 **테스트넷 / 프로덕션 이전** 단계입니다. 연결 가용성, 지원 자산, 파이널리티 파라미터는 변경될 수 있으며 프로덕션 준비가 완료된 것으로 간주해서는 안 됩니다. 모든 전송은 의존하기 전에 **`qorechain-diana`**에서 검증하십시오.
:::

:::note
아래 명령어는 **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**)을 사용합니다. 메인넷(**`qorechain-vladi`**, EVM 체인 ID **9801**)은 2026년 6월 7일부터 체인 버전 **v3.1.92**로 가동 중입니다 — 브리지 지원이 활성화된 곳에서는 **메인넷 연결** 페이지의 메인넷 체인 ID와 엔드포인트로 대체하십시오.
:::

---

## 연결 개요

QoreChain은 두 가지 브리징 프로토콜을 제공합니다.

| 프로토콜                                  | 연결 수             | 사용 사례                                                                  |
| ---------------------------------------- | ------------------ | ------------------------------------------------------------------------ |
| **IBC**(Inter-Blockchain Communication)  | 8개 채널            | IBC 지원 체인과의 네이티브 상호운용성                                         |
| **QCB**(QoreChain Bridge)                | 37개 구성           | PQC 기반 검증(attestation)을 통한 비-IBC 네트워크와의 크로스체인 전송              |

모든 QCB 구성과 IBC 채널의 전체 목록은 **브리지 아키텍처** 페이지에 있습니다. 이 가이드는 일상적인 브리징 사용법에 초점을 맞춥니다.

---

## IBC 채널

다음 IBC 지원 체인들은 QoreChain과 채널을 구축했습니다.

| 체인                  | 채널        | 상태  |
| -------------------- | ----------- | ------ |
| Cosmos Hub           | `channel-0` | 활성 |
| Osmosis              | `channel-1` | 활성 |
| Noble                | `channel-2` | 활성 |
| Celestia             | `channel-3` | 활성 |
| Stride               | `channel-4` | 활성 |
| Akash                | `channel-5` | 활성 |
| Babylon              | `channel-6` | 활성 |
| QoreChain (루프백)    | `channel-7` | 활성 |

IBC 전송은 표준 `ibc-transfer` 모듈을 사용합니다.

```bash
qorechaind tx ibc-transfer transfer transfer <channel> <recipient> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## QCB 브리지 엔드포인트

QoreChain Bridge는 다양한 생태계 유형에 걸친 외부 체인과 연결됩니다. 지원되는 네트워크의 대표적인 목록은 다음과 같습니다.

| 체인      | 체인 유형 | 지원 자산       |
| --------- | ---------- | ---------------- |
| Ethereum  | EVM        | ETH, USDC, WBTC  |
| BSC       | EVM        | BNB, USDC        |
| Solana    | Solana     | SOL, USDC        |
| Avalanche | EVM        | AVAX, USDC       |
| Polygon   | EVM        | MATIC, USDC      |
| Arbitrum  | EVM        | ETH, ARB, USDC   |
| TON       | TON        | TON              |
| Sui       | Sui Move   | SUI              |
| Optimism  | EVM        | ETH, USDC, OP    |
| Base      | EVM        | ETH, USDC        |
| Aptos     | Aptos      | APT, USDC        |
| Bitcoin   | Bitcoin    | BTC              |
| NEAR      | NEAR       | NEAR, USDC       |
| Cardano   | Cardano    | ADA              |
| Polkadot  | Polkadot   | DOT              |
| Tezos     | Tezos      | XTZ              |
| Tron      | Tron       | TRX, USDT        |

QCB 구성의 전체 목록과 현재 배포 상태는 **브리지 아키텍처** 페이지를 참고하십시오.

---

## 입금 흐름 (외부 체인에서 QoreChain으로)

외부 체인에서 QoreChain으로 자산을 입금하는 과정은 다음 순서를 따릅니다.

1. **잠금(Lock)** — 외부 체인에서 QCB 브리지 컨트랙트 또는 주소로 토큰을 전송하여 잠급니다.
2. **검증(Attestation)** — 브리지 검증자들이 잠금 트랜잭션을 관찰하고 PQC 서명된 검증(attestation)을 생성합니다.
3. **임계값(Threshold)** — 검증자 검증(attestation)이 **10개 중 7개** 모이면 브리지가 입금을 완료합니다.
4. **발행(Mint)** — 동일한 가치의 래핑된 토큰이 QoreChain에서 발행되어 사용자의 `qor1...` 주소로 지급됩니다.

**CLI 명령어:**

```bash
qorechaind tx bridge deposit \
  --chain ethereum \
  --amount 1000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## 출금 흐름 (QoreChain에서 외부 체인으로)

QoreChain에서 외부 체인으로 자산을 출금하는 과정입니다.

1. **소각(Burn)** — QoreChain에서 래핑된 토큰을 소각합니다.
2. **검증(Attestation)** — 브리지 검증자들이 소각을 관찰하고 PQC 서명된 검증(attestation)을 생성합니다.
3. **임계값(Threshold)** — 검증(attestation)이 **10개 중 7개** 모이면 출금이 완료됩니다.
4. **잠금 해제(Unlock)** — 원본 토큰이 외부 체인에서 지정된 대상 주소로 지급됩니다.

**CLI 명령어:**

```bash
qorechaind tx bridge withdraw \
  --chain ethereum \
  --amount 1000000 \
  --to 0xYourEthereumAddress \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## 보안 모델

QoreChain Bridge는 여러 방어 계층으로 보호됩니다.

| 메커니즘                     | 설명                                                                                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **7-of-10 PQC 다중서명**     | 모든 브리지 작업은 10명의 브리지 검증자 중 최소 7명의 검증(attestation)을 필요로 하며, 각 검증자는 양자내성암호(post-quantum cryptographic) 서명을 사용합니다.               |
| **24시간 챌린지 기간**       | 설정 가능한 임계값을 초과하는 출금은 24시간의 챌린지 창(window)에 진입하며, 이 기간 동안 검증자나 감시자가 사기성 트랜잭션을 신고할 수 있습니다. |
| **서킷 브레이커**            | 비정상적인 거래량이나 의심스러운 패턴이 감지되면 자동 속도 제한 장치가 브리지 작업을 중단시킵니다. 브리지 작업은 수동 검토 후 재개됩니다.  |

---

## 브리지 상태 조회

대기 중인 브리지 작업의 상태를 확인합니다.

```bash
qorechaind query bridge pending-deposits --address <your_qor_address>
```

```bash
qorechaind query bridge pending-withdrawals --address <your_qor_address>
```

모든 활성 브리지 연결을 나열합니다.

```bash
qorechaind query bridge connections
```

---

## 팁

* 브리지 입금은 필요한 7-of-10 검증(attestation)이 모이면 일반적으로 몇 분 이내에 완료됩니다.
* 대규모 출금은 자동으로 24시간 챌린지 기간을 유발합니다. 시간에 민감한 전송은 미리 계획하십시오.
* 대상 주소 형식이 목표 체인과 일치하는지 항상 확인하십시오(예: EVM 체인은 `0x...`, Solana는 base58).
* IBC 전송은 네이티브 프로토콜 수준의 통신을 사용하므로 일반적으로 QCB 전송보다 빠릅니다.
* 브리지 수수료는 `bridge_fee` 소각 채널을 통해 소각됩니다 ([토큰 작업](/user-guide/token-operations) 참고).
