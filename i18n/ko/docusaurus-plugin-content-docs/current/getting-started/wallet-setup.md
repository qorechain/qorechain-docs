---
slug: /getting-started/wallet-setup
title: 지갑 설정
sidebar_label: 지갑 설정
sidebar_position: 2
---

# 지갑 설정

QoreChain은 네이티브, EVM, SVM 실행 환경 전반에 걸쳐 여러 지갑 유형을 지원합니다. 사용 사례에 맞는 지갑을 선택하세요.

:::note
아래의 체인 ID와 RPC 엔드포인트는 **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**)을 대상으로 합니다. 메인넷(**`qorechain-vladi`**, EVM 체인 ID **9801**)은 2026년 6월 7일부터 가동 중이며, 메인넷의 지갑 연결 값은 별도의 **메인넷 연결** 페이지에 문서화되어 있습니다.
:::

## Keplr 지갑

Keplr은 네이티브 QoreChain 트랜잭션, 스테이킹, 거버넌스에 권장되는 지갑입니다.

### QoreChain을 사용자 지정 체인으로 추가

Keplr을 열고 **Settings > Add Custom Chain**으로 이동한 후 다음을 입력하세요.

| 필드               | 값                        |
| ------------------ | ------------------------- |
| Chain Name         | `QoreChain Diana Testnet` |
| Chain ID           | `qorechain-diana`         |
| RPC URL            | `http://localhost:26657`  |
| REST URL           | `http://localhost:1317`   |
| Bech32 Prefix      | `qor`                     |
| Coin Denom         | `QOR`                     |
| Coin Minimal Denom | `uqor`                    |
| Decimals           | `6`                       |

체인을 추가하면 Keplr이 계정에 대한 `qor1...` 주소를 생성합니다. 이 주소를 사용하여 테스트넷 QOR 토큰을 받으세요.

## MetaMask (EVM)

MetaMask는 QoreChain의 EVM 실행 환경과의 상호작용을 가능하게 합니다 — Solidity 컨트랙트 배포, ERC-20 토큰 관리, 익숙한 Ethereum 도구 사용이 가능합니다.

### QoreChain을 사용자 지정 네트워크로 추가

MetaMask를 열고 **Settings > Networks > Add Network**로 이동한 후 다음을 입력하세요.

| 필드            | 값                      |
| --------------- | ----------------------- |
| Network Name    | `QoreChain EVM`         |
| RPC URL         | `http://localhost:8545` |
| Chain ID        | `9800`                  |
| Currency Symbol | `QOR`                   |

연결되면 MetaMask를 사용하여 EVM 트랜잭션에 서명하고, 배포된 스마트 컨트랙트와 상호작용하며, QoreChain에서 ERC-20 토큰을 관리할 수 있습니다.

## Solana 지갑 (SVM)

QoreChain의 SVM 실행 환경은 표준 Solana 도구와 호환됩니다. Solana 호환 지갑이나 라이브러리를 연결하여 SVM 프로그램과 상호작용하세요.

### @solana/web3.js 사용

```javascript
import { Connection } from "@solana/web3.js";

const connection = new Connection("http://localhost:8899");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
```

이를 통해 QoreChain에서 실행되는 SVM 프로그램을 배포하고 상호작용할 수 있습니다.

## PQC 지원 지갑 (Cosmos 경로에서 필수)

QoreChain은 cosmos 트랜잭션 경로에서 하이브리드 포스트 양자 암호화(PQC)를 요구합니다. 현재 체인 버전(**v3.1.77**) 기준으로 네트워크 기본값은 `hybrid_signature_mode = required` 및 `allow_classical_fallback = false`입니다 — 따라서 **모든 cosmos 경로 트랜잭션은 표준 secp256k1 (ECDSA) 서명과 함께 ML-DSA-87 (Dilithium-5) 서명을 포함해야 합니다**. PQC 계정에서 보낸 고전 전용 cosmos 트랜잭션은 거부됩니다.

:::caution Cosmos 트랜잭션은 하이브리드 PQC 확장이 필요합니다
cosmos 경로에서 일반 고전 트랜잭션을 전송하면 거부됩니다. Dilithium-5 서명을 `PQCHybridSignature` 트랜잭션 확장으로 첨부해야 합니다. 표준 CosmJS / Keplr 도구는 자체적으로 이 확장을 생성하지 않습니다 — `qorechaind tx pqc cosign` CLI 명령어, QoreChain SDK의 하이브리드 서명(아래 참조)을 사용하거나, 코드에서 직접 구성하려면 오픈소스 [**qorechain-pqc**](/developer-guide/post-quantum-signing) 라이브러리(`hybridSignBytes`)를 사용하세요. 유일한 예외는 제네시스 gentx와 PQC 키 등록/마이그레이션 트랜잭션입니다.
:::

### 작동 방식

지갑은 표준 secp256k1 (ECDSA) 서명과 함께 ML-DSA-87 PQC 서명을 트랜잭션 확장으로 첨부합니다. 고전 서명은 확장을 제외한 서명 바이트에 대해 계산되므로, PQC 서명이 양자 저항성을 제공하는 동안 고전 검증에 대해 유효하게 유지됩니다.

### Dilithium-5 키 생성

하이브리드 서명을 위한 포스트 양자 키를 생성합니다.

```bash
qorechaind tx pqc gen-key
```

### 자동 등록

첫 번째 트랜잭션에 PQC 공개 키를 포함하면 QoreChain이 자동으로 온체인에 등록합니다. 별도의 등록 단계가 필요하지 않습니다. (PQC 키 등록/마이그레이션 트랜잭션 자체는 하이브리드 요구사항에서 면제되므로, 계정이 첫 번째 키를 부트스트랩할 수 있습니다.)

### SDK를 이용한 하이브리드 서명

QoreChain SDK는 `includePqcPublicKey: true`와 함께 `buildHybridTx`를 통해 준수하는 cosmos 트랜잭션을 생성하며, 이는 Dilithium-5 확장을 첨부하고 자동 등록을 위해 공개 키를 포함합니다. [SDK 계정 및 PQC 서명](/sdk/concepts/accounts-pqc)을 참조하세요.

### PQC 모드

세 가지 시행 모드는 거버넌스로 제어되며, **현재 네트워크 기본값은 Required입니다**.

| 모드                   | 설명                                                                     |
| ---------------------- | ------------------------------------------------------------------------ |
| **Disabled**           | PQC 검증이 비활성화됩니다. 표준 서명만 사용됩니다.                        |
| **Optional**           | 트랜잭션에 PQC 서명을 포함할 수 있습니다. 존재하면 검증됩니다.            |
| **Required** (기본값)  | 모든 cosmos 경로 트랜잭션은 유효한 PQC 서명을 포함해야 합니다.            |

활성 모드는 체인 수준에서 구성되며 거버넌스를 통해 업데이트할 수 있습니다.

:::note EVM / MetaMask는 영향받지 않음
위의 MetaMask (EVM) 흐름은 하이브리드 요구사항의 영향을 **받지 않습니다**. EVM 트랜잭션은 별도의 `eth_secp256k1` ante 경로를 사용하며 PQC 확장이 필요하지 않습니다.
:::

## CLI 지갑

`qorechaind` 바이너리에는 명령줄 사용을 위한 내장 키 관리 시스템이 포함되어 있습니다.

### 새 키 생성

```bash
qorechaind keys add mykey
```

이는 새 키 쌍을 생성하고 니모닉 구문을 표시합니다. **니모닉을 안전하게 보관하세요** — 이것이 이 키를 복구하는 유일한 방법입니다.

### 주소 보기

```bash
qorechaind keys show mykey -a
```

이는 `qor1...` bech32 주소를 출력합니다.

### 모든 키 나열

```bash
qorechaind keys list
```

### 기존 키 가져오기

```bash
qorechaind keys add mykey --recover
```

니모닉 구문을 입력하라는 메시지가 표시됩니다.

## 다음 단계

* [첫 번째 트랜잭션](/getting-started/first-transaction) — 새 지갑을 사용하여 QOR 토큰 전송
* [테스트넷 연결](/getting-started/connecting-to-testnet) — 가동 중인 Diana 테스트넷에 참여
