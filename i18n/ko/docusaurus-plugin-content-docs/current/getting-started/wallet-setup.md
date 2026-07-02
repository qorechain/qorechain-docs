---
slug: /getting-started/wallet-setup
title: 지갑 설정
sidebar_label: 지갑 설정
sidebar_position: 2
---

# 지갑 설정

QoreChain은 네이티브, EVM, SVM 실행 환경 전반에 걸쳐 여러 지갑 유형을 지원합니다. 사용 사례에 맞는 지갑을 선택하세요.

:::note
아래 값은 **`qorechain-vladi`** 메인넷(EVM 체인 ID **9801**, 2026년 6월 7일부터 가동 중)과 **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**)을 모두 다룹니다. 두 네트워크의 퍼블릭 엔드포인트는 [네트워크](/appendix/networks#public-endpoints)에 정리되어 있습니다.
:::

## Keplr 지갑

Keplr는 네이티브 QoreChain 트랜잭션, 스테이킹, 거버넌스에 권장되는 지갑입니다.

### QoreChain을 커스텀 체인으로 추가하기

Keplr를 열고 **Settings > Add Custom Chain**으로 이동한 뒤 다음을 입력하세요:

| 필드               | 메인넷                     | 테스트넷                          |
| ------------------ | -------------------------- | -------------------------------- |
| 체인 이름          | `QoreChain`                | `QoreChain Diana Testnet`        |
| 체인 ID            | `qorechain-vladi`          | `qorechain-diana`                |
| RPC URL            | `https://rpc.qore.host`    | `https://rpc-testnet.qore.host`  |
| REST URL           | `https://api.qore.host`    | `https://api-testnet.qore.host`  |
| Bech32 프리픽스    | `qor`                      | `qor`                            |
| 코인 표시 단위     | `QOR`                      | `QOR`                            |
| 코인 최소 단위     | `uqor`                     | `uqor`                           |
| 소수 자릿수        | `6`                        | `6`                              |
| 코인 타입 (BIP-44) | `118`                      | `118`                            |

체인을 추가하면 Keplr가 계정에 대해 `qor1...` 주소를 생성합니다.

:::caution 가스 가격 하한
네트워크 최소 가스 가격은 **0.1uqor**입니다. Keplr의 가스 가격 단계를 설정하는 경우(예: `suggestChain` 사용 시), **0.1 이상**의 값을 사용하세요(권장 low/average/high: `0.1 / 0.15 / 0.25`) — 하한보다 낮게 서명된 트랜잭션은 거부됩니다.
:::

## MetaMask (EVM)

MetaMask를 사용하면 QoreChain의 EVM 실행 환경과 상호작용할 수 있습니다 — Solidity 컨트랙트 배포, ERC-20 토큰 관리, 익숙한 Ethereum 도구 활용이 가능합니다.

### QoreChain을 커스텀 네트워크로 추가하기

MetaMask를 열고 **Settings > Networks > Add Network**로 이동한 뒤 다음을 입력하세요:

| 필드               | 메인넷                    | 테스트넷                          |
| ------------------ | ------------------------- | -------------------------------- |
| 네트워크 이름      | `QoreChain`               | `QoreChain Diana Testnet`        |
| RPC URL            | `https://evm.qore.host`   | `https://evm-testnet.qore.host`  |
| 체인 ID            | `9801`                    | `9800`                           |
| 통화 심볼          | `QOR`                     | `QOR`                            |
| 블록 익스플로러 URL | `https://explore.qore.network` | `https://explore.qore.network` |

네이티브 QOR는 EVM 인터페이스에서 **18자리 소수점**(wei 방식)을 사용합니다. 연결이 완료되면 MetaMask로 EVM 트랜잭션에 서명하고, 배포된 스마트 컨트랙트와 상호작용하며, QoreChain에서 ERC-20 토큰을 관리할 수 있습니다.

### 원콜(one-call) 네트워크 등록

dApp의 경우, npm에 게시된 **`@qorechain/wallet-adapter`** 및 **`@qorechain/connect`** 패키지가 한 번의 호출로 사용자의 지갑에 QoreChain을 등록합니다 — EIP-3085를 통해 MetaMask에 네트워크 추가를 요청하고(EVM 레일의 네이티브 QOR에 올바른 **18자리 소수점** 적용), Keplr의 가스 가격 단계도 설정합니다:

```bash
npm install @qorechain/wallet-adapter @qorechain/connect
```

```ts
import { addQoreEvmToWallet } from "@qorechain/wallet-adapter";

await addQoreEvmToWallet(); // prompts MetaMask with QoreChain's EVM network params
```

## Solana 지갑 (SVM)

QoreChain의 SVM 실행 환경은 표준 Solana 도구와 호환되며, 계정의 **네이티브 QOR 잔액을 SVM 인터페이스에서 직접 확인할 수 있습니다**(lamports 단위, 9자리 소수점; 1 uqor = 1,000 lamports). Solana 호환 지갑이나 라이브러리를 자유롭게 연결하세요.

### @solana/web3.js 사용하기

```javascript
import { Connection } from "@solana/web3.js";

// Public read-only endpoint (or http://localhost:8899 on your own node)
const connection = new Connection("https://svm.qore.host");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
```

퍼블릭 SVM 엔드포인트는 **읽기 전용**이며, 트랜잭션 제출에는 자체 노드가 필요합니다. 자세한 내용은 [SVM 개발](/developer-guide/svm-development)을 참고하세요.

## PQC 지원 지갑 (Cosmos 경로에서 필수)

QoreChain은 cosmos 트랜잭션 경로에서 하이브리드 포스트 양자 암호(PQC)를 요구합니다. 현재 체인 버전(**v3.1.82**) 기준으로 네트워크 기본값은 `hybrid_signature_mode = required`이고 `allow_classical_fallback = false`입니다 — 따라서 **모든 cosmos 경로 트랜잭션은 표준 secp256k1 (ECDSA) 서명과 함께 ML-DSA-87 (Dilithium-5) 서명을 반드시 포함해야 합니다**. PQC 계정에서 발생한 클래식 전용 cosmos 트랜잭션은 거부됩니다.

:::caution Cosmos 트랜잭션에는 하이브리드 PQC 확장이 필요합니다
cosmos 경로에서 일반 클래식 트랜잭션을 전송하면 거부됩니다. Dilithium-5 서명을 `PQCHybridSignature` 트랜잭션 확장으로 첨부해야 합니다. 표준 CosmJS / Keplr 도구만으로는 이 확장이 생성되지 않습니다 — `qorechaind tx pqc cosign` CLI 명령, QoreChain SDK의 하이브리드 서명(아래 참조)을 사용하거나, 코드에서 직접 구성하려면 오픈소스 [**qorechain-pqc**](/developer-guide/post-quantum-signing) 라이브러리(`hybridSignBytes`)를 사용하세요. 유일한 예외는 제네시스 gentx와 PQC 키 등록/마이그레이션 트랜잭션입니다.
:::

### 동작 방식

지갑은 표준 secp256k1 (ECDSA) 서명과 함께 ML-DSA-87 PQC 서명을 트랜잭션 확장으로 첨부합니다. 클래식 서명은 확장을 제외한 서명 바이트에 대해 계산되므로 클래식 검증에서는 그대로 유효하며, PQC 서명이 양자 내성을 제공합니다.

### Dilithium-5 키 생성

하이브리드 서명을 위한 포스트 양자 키를 생성하세요:

```bash
qorechaind tx pqc gen-key
```

### 자동 등록

첫 번째 트랜잭션에 PQC 공개 키를 포함하면 QoreChain이 이를 온체인에 자동으로 등록합니다. 별도의 등록 단계가 필요 없습니다. (PQC 키 등록/마이그레이션 트랜잭션 자체는 하이브리드 요구 사항에서 면제되므로, 계정이 첫 키를 부트스트랩할 수 있습니다.)

### SDK를 이용한 하이브리드 서명

QoreChain SDK는 `includePqcPublicKey: true`와 함께 `buildHybridTx`를 사용해 요건을 충족하는 cosmos 트랜잭션을 생성합니다. 이 함수는 Dilithium-5 확장을 첨부하고 자동 등록을 위해 공개 키를 포함합니다. [SDK 계정 및 PQC 서명](/sdk/concepts/accounts-pqc)을 참고하세요.

### PQC 모드

세 가지 시행 모드는 여전히 거버넌스로 제어되며, **현재 네트워크 기본값은 Required입니다**:

| 모드                   | 설명                                                                    |
| ---------------------- | ----------------------------------------------------------------------- |
| **Disabled**           | PQC 검증이 꺼져 있습니다. 표준 서명만 사용합니다.                        |
| **Optional**           | 트랜잭션에 PQC 서명을 포함할 수 있습니다. 포함된 경우 검증됩니다.        |
| **Required** (기본값)  | 모든 cosmos 경로 트랜잭션은 유효한 PQC 서명을 포함해야 합니다.           |

활성 모드는 체인 수준에서 설정되며 거버넌스를 통해 업데이트할 수 있습니다.

:::note EVM / MetaMask는 영향을 받지 않습니다
위의 MetaMask (EVM) 흐름은 하이브리드 요구 사항의 영향을 받지 **않습니다**. EVM 트랜잭션은 별도의 `eth_secp256k1` ante 경로를 사용하며 PQC 확장이 전혀 필요하지 않습니다.
:::

## CLI 지갑

`qorechaind` 바이너리에는 명령줄 사용을 위한 키 관리 시스템이 내장되어 있습니다.

### 새 키 생성

```bash
qorechaind keys add mykey
```

이 명령은 새 키 쌍을 생성하고 니모닉 문구를 표시합니다. **니모닉을 안전하게 보관하세요** — 이 키를 복구할 수 있는 유일한 방법입니다.

### 주소 확인

```bash
qorechaind keys show mykey -a
```

이 명령은 `qor1...` 형식의 bech32 주소를 출력합니다.

### 모든 키 목록 보기

```bash
qorechaind keys list
```

### 기존 키 가져오기

```bash
qorechaind keys add mykey --recover
```

니모닉 문구를 입력하라는 안내가 표시됩니다.

## 다음 단계

* [첫 번째 트랜잭션](/getting-started/first-transaction) — 새 지갑으로 QOR 토큰 전송하기
* [테스트넷에 연결하기](/getting-started/connecting-to-testnet) — 가동 중인 Diana 테스트넷 참여하기
