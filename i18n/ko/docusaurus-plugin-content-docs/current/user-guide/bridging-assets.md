---
slug: /user-guide/bridging-assets
title: 자산 브리징
sidebar_label: 자산 브리징
sidebar_position: 5
---

# 자산 브리징

이 가이드에서는 QoreChain과 다른 블록체인 네트워크 간의 자산 이동이 어떻게 동작하도록 설계되었는지 설명합니다. QoreChain의 상호운용성 계층은 **37개의 체인 구성**(외부 체인 36개와 IBC로 연결되는 Injective)과 Cosmos 생태계 체인을 위한 최대 **8개의 IBC 카운터파티**를 중심으로 구축되어 있습니다.

:::caution 어느 네트워크에서도 라이브 상태가 아닙니다
브리지 모듈은 메인넷과 테스트넷에 배포되어 있지만, **활성화된 브리지 경로는 없습니다**. 37개의 체인 구성이 모두 브리지 컨트랙트가 설정되지 않은 `pending` 상태이고, 등록된 브리지 검증자가 없으며, 생성된 브리지 작업이 한 번도 없고, IBC 채널이나 클라이언트도 존재하지 않습니다. 아래 내용은 모두 의도된 설계를 설명합니다. 자산이 브리징되기를 기대하고 전송하지 마십시오. 현재 상태 표는 [브리지 아키텍처](/architecture/bridge-architecture)를 참고하십시오.
:::

:::note
아래 명령어는 **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**, 체인 버전 **v3.2.4**)을 사용합니다. 메인넷(**`qorechain-vladi`**, EVM 체인 ID **9801**)은 체인 버전 **v3.2.4**로 가동 중입니다(2026년 10월 23일부터). 경로가 활성화되면 **메인넷 연결** 페이지의 메인넷 체인 ID와 엔드포인트로 대체하십시오. 2026년 10월 23일에 확인한 상태: 두 네트워크 모두에서 37개의 체인 구성이 모두 `pending`입니다.
:::

---

## 연결 개요

QoreChain은 두 가지 브리징 프로토콜을 제공하도록 설계되었습니다.

| 프로토콜                                  | 연결 수                          | 사용 사례                                                                  |
| ---------------------------------------- | ------------------------------- | ------------------------------------------------------------------------ |
| **IBC**(Inter-Blockchain Communication)  | 최대 8개 채널 (열린 채널 없음)      | IBC 지원 체인과의 네이티브 상호운용성                                         |
| **QCB**(QoreChain Bridge)                | 37개 구성 (모두 pending)          | PQC 기반 검증(attestation)을 통한 비-IBC 네트워크와의 크로스체인 전송              |

모든 체인 구성의 전체 목록은 **브리지 아키텍처** 페이지에 있습니다. 이 가이드는 브리지 전송이 어떻게 동작하도록 설계되었는지에 초점을 맞춥니다.

---

## IBC

IBC는 설계의 일부이지만(Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon, Injective), **어느 네트워크에도 IBC 채널이나 클라이언트가 아직 존재하지 않으므로** 전송할 수 있는 대상이 없습니다. 채널이 열리면 이 페이지에 목록이 표시됩니다.

---

## QCB 브리지 엔드포인트

QoreChain Bridge는 다양한 생태계 유형에 걸친 외부 체인과 연결되도록 설계되었습니다. 계획된 연결의 대표적인 목록은 다음과 같습니다(현재는 모두 `pending` 상태입니다).

| 체인      | 체인 유형 |
| --------- | ---------- |
| Ethereum  | EVM        |
| BSC       | EVM        |
| Solana    | Solana     |
| Avalanche | EVM        |
| Polygon   | EVM        |
| Arbitrum  | EVM        |
| TON       | TON        |
| Sui       | Sui Move   |
| Optimism  | EVM        |
| Base      | EVM        |
| Aptos     | Aptos      |
| Bitcoin   | Bitcoin    |
| NEAR      | NEAR       |
| Cardano   | Cardano    |
| Polkadot  | Polkadot   |
| Tezos     | Tezos      |
| Tron      | Tron       |

자산 목록은 게시되지 않습니다. 체인 구성에는 아직 자산 레지스트리가 없습니다. 체인 구성의 전체 목록은 **브리지 아키텍처** 페이지를 참고하십시오.

---

## 입금 흐름 (외부 체인에서 QoreChain으로)

외부 체인에서 QoreChain으로 입금하도록 설계된 순서는 다음과 같습니다.

1. **잠금(Lock)** — 외부 체인에서 QCB 브리지 컨트랙트 또는 주소로 토큰을 전송하여 잠급니다.
2. **검증(Attestation)** — 브리지 검증자들이 잠금 트랜잭션을 관찰하고 PQC 서명된 검증(attestation)을 생성합니다.
3. **임계값(Threshold)** — 검증자 검증(attestation)이 **10개 중 7개** 모이면 브리지가 입금을 완료합니다.
4. **발행(Mint)** — 동일한 가치의 래핑된 토큰이 QoreChain에서 발행되어 사용자의 `qor1...` 주소로 지급됩니다.

사용자가 직접 실행하는 "입금 시작" 명령어는 없습니다. 외부 체인에서 잠금을 수행하면 브리지 검증자들의 검증(attestation)이 사용자의 계정에 입금을 반영합니다. (체인의 `qorechaind tx bridge deposit` 명령어는 이미 검증된 입금을 반영하며 브리지 검증자의 서명이 필요합니다. 사용자가 입금을 시작하는 방법이 아닙니다.)

---

## 출금 흐름 (QoreChain에서 외부 체인으로)

QoreChain에서 외부 체인으로 출금하도록 설계된 순서는 다음과 같습니다.

1. **소각(Burn)** — QoreChain에서 래핑된 토큰을 소각합니다.
2. **검증(Attestation)** — 브리지 검증자들이 소각을 관찰하고 PQC 서명된 검증(attestation)을 생성합니다.
3. **임계값(Threshold)** — 검증(attestation)이 **10개 중 7개** 모이면 출금이 완료됩니다.
4. **잠금 해제(Unlock)** — 원본 토큰이 외부 체인에서 지정된 대상 주소로 지급됩니다.

**CLI 명령어** (현재는 차단됨: 활성화된 체인이 없으므로 트랜잭션이 거부됩니다):

```bash
# 1. Build the unsigned transaction
qorechaind tx bridge withdraw [destination-chain] [destination-address] [asset] [amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 300000 --fees 30000uqor \
  --generate-only > withdraw.json

# 2. Attach the post-quantum co-signature and broadcast
qorechaind tx pqc cosign withdraw.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

모든 네이티브 레인 트랜잭션에는 하이브리드 양자내성 공동 서명과 가스 단위당 최소 0.1 uqor의 수수료가 필요합니다. [첫 트랜잭션](/getting-started/first-transaction)을 참고하십시오.

---

## 보안 모델

QoreChain Bridge는 여러 방어 계층으로 보호되도록 설계되었습니다.

| 메커니즘                     | 설명                                                                                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **7-of-10 PQC 다중서명**     | 모든 브리지 작업은 10명의 브리지 검증자 중 최소 7명의 검증(attestation)을 필요로 하며, 각 검증자는 양자내성암호(post-quantum cryptographic) 서명을 사용합니다.               |
| **24시간 챌린지 기간**       | 대규모 전송 임계값(100,000 QOR)을 초과하는 전송은 24시간의 챌린지 창(window)에 진입하며, 이 기간 동안 검증자나 감시자가 사기성 트랜잭션을 신고할 수 있습니다. |
| **서킷 브레이커**            | 비정상적인 거래량이나 의심스러운 패턴이 감지되면 자동 속도 제한 장치가 브리지 작업을 중단시킵니다. 브리지 작업은 수동 검토 후 재개됩니다.  |

---

## 브리지 상태 조회

브리지의 상태를 확인합니다.

```bash
qorechaind query bridge config
qorechaind query bridge chains
qorechaind query bridge chain ethereum
qorechaind query bridge validators
qorechaind query bridge operations
qorechaind query bridge operation [id]
```

동일한 데이터는 `/qorechain/bridge/v1/` 아래의 REST로도 제공됩니다([브리지 아키텍처](/architecture/bridge-architecture#rest-api-endpoints) 참고).

---

## 팁

* 대상 주소 형식이 목표 체인과 일치하는지 항상 확인하십시오(예: EVM 체인은 `0x...`, Solana는 base58).
* 대규모 전송(100,000 QOR 초과)은 24시간 챌린지 기간을 자동으로 유발하도록 설계되어 있습니다.
* 브리지 수수료는 `bridge_fee` 소각 채널을 통해 소각됩니다 ([토큰 작업](/user-guide/token-operations) 참고).
