---
slug: /getting-started/wallet-setup
title: 지갑 설정
sidebar_label: 지갑 설정
sidebar_position: 2
---

# 지갑 설정

QoreChain은 네이티브, EVM, SVM 실행 환경 전반에서 여러 지갑 유형을 지원합니다. 사용 목적에 맞는 지갑을 선택하세요.

:::note
아래 값들은 **`qorechain-vladi`** 메인넷(EVM 체인 ID **9801**, 2026년 6월 7일부터 운영 중, 릴리스 v3.2.3이며 높이 3,742,566부터 v3.2.4)과 **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**, 2026년 10월 19일부터 릴리스 v3.2.4)을 모두 다룹니다. 두 네트워크의 공개 엔드포인트는 [네트워크](/appendix/networks#public-endpoints) 문서에 정리되어 있습니다.
:::

## QoreX (권장) {#qorex}

**QoreX**는 QoreChain의 공식 비수탁형(non-custodial) 지갑으로, 모바일 앱(Android, iOS)과 브라우저 확장 프로그램(Chrome, Firefox, macOS의 Safari)으로 제공됩니다. 모든 네이티브 레인 송금에 필수 하이브리드 포스트 퀀텀 서명으로 서명하고, 사용자의 포스트 퀀텀 키를 대신 등록해 주며, 스테이킹, @핸들, 외부 네트워크를 지원하고, 대시보드와 연동됩니다. 또한 MetaMask 트랜잭션에 필요한 [EVM 인가 창](/getting-started/first-transaction#evm-window)을 열 수 있습니다. [QoreX 가이드](/qorex/overview)와 [시작하기](/qorex/getting-started)부터 확인하세요.

## Keplr 지갑

Keplr는 QoreChain을 커스텀 체인(아래 참고)으로 추가하여 잔액을 확인하고 네이티브 레인에서 수신하는 데 사용할 수 있습니다. QoreChain은 네이티브 레인에서 포스트 퀀텀 공동 서명을 요구하므로, 송금, 스테이킹, 투표는 Keplr만 사용하지 말고 [QoreX](/qorex/overview)와 같은 PQC 지원 지갑으로 진행하세요.

### QoreChain을 커스텀 체인으로 추가하기

Keplr를 열고 **Settings > Add Custom Chain**으로 이동한 다음 아래 값을 입력하세요.

| 필드                | 메인넷                      | 테스트넷                          |
| ------------------- | --------------------------- | --------------------------------- |
| 체인 이름           | `QoreChain`                 | `QoreChain Diana Testnet`         |
| 체인 ID             | `qorechain-vladi`           | `qorechain-diana`                 |
| RPC URL             | `https://rpc.qore.host`     | `https://rpc-testnet.qore.host`   |
| REST URL            | `https://api.qore.host`     | `https://api-testnet.qore.host`   |
| Bech32 프리픽스     | `qor`                       | `qor`                             |
| 코인 표시 단위      | `QOR`                       | `QOR`                             |
| 코인 최소 단위      | `uqor`                      | `uqor`                            |
| 소수점 자릿수       | `6`                         | `6`                               |
| 코인 타입 (BIP-44)  | `118`                       | `118`                             |

체인을 추가하면 Keplr가 계정에 대한 `qor1...` 주소를 생성합니다.

:::caution 최소 가스 가격
네트워크 최소 가스 가격은 **0.1uqor**입니다. `suggestChain` 등을 통해 Keplr의 가스 가격 단계를 설정하는 경우 **0.1 이상**의 값을 사용하세요(권장 낮음/평균/높음: `0.1 / 0.15 / 0.25`) — 이 하한선보다 낮게 서명된 트랜잭션은 거부됩니다.
:::

## MetaMask (EVM)

MetaMask를 사용하면 QoreChain의 EVM 실행 환경과 상호작용할 수 있습니다 — Solidity 컨트랙트 배포, ERC-20 토큰 관리, 익숙한 이더리움 툴링 사용이 가능합니다.

### QoreChain을 커스텀 네트워크로 추가하기

MetaMask를 열고 **Settings > Networks > Add Network**로 이동한 다음 아래 값을 입력하세요.

| 필드                | 메인넷                          | 테스트넷                         |
| ------------------- | -------------------------------- | --------------------------------- |
| 네트워크 이름       | `QoreChain`                      | `QoreChain Diana Testnet`         |
| RPC URL             | `https://evm.qore.host`          | `https://evm-testnet.qore.host`   |
| 체인 ID             | `9801`                           | `9800`                             |
| 통화 심볼           | `QOR`                            | `QOR`                             |
| 블록 탐색기 URL     | `https://explore.qore.network`   | `https://explore.qore.network`    |

네이티브 QOR은 EVM 인터페이스에서 **18자리 소수점**(wei 방식)을 사용합니다. 연결한 후에는 MetaMask로 EVM 트랜잭션에 서명하고, 배포된 스마트 컨트랙트와 상호작용하며, QoreChain에서 ERC-20 토큰을 관리할 수 있습니다.

:::caution EVM / MetaMask에는 PQC 키와 열린 창이 필요합니다
MetaMask는 여전히 정상적으로 서명하지만, EVM 레인은 등록된 포스트 퀀텀 키가 있고 **EVM 인가 창**이 열려 있는 계정의 트랜잭션만 받아들입니다(v3.2.0 이상). 키를 한 번 등록한 뒤, EVM 활동 세션을 시작하기 전에 창을 여세요 — [EVM 인가 창](/getting-started/first-transaction#evm-window)을 참고하세요. MetaMask는 창을 직접 열 수 없으므로, [QoreX](/qorex/security-and-recovery#evm-window) 또는 CLI로 여세요. 위의 MetaMask 네트워크 추가 방법은 달라지지 않았습니다.
:::

### 한 번의 호출로 네트워크 등록하기

dApp의 경우, npm에 배포된 **`@qorechain/wallet-adapter`** 패키지가 한 번의 호출로 사용자 지갑에 QoreChain을 등록합니다 — EIP-3085를 통해 MetaMask에 네트워크 추가를 요청하고(EVM 레일에서 올바른 **18자리 소수점** 네이티브 QOR 포함), Keplr 체인 제안(가스 가격 단계 포함)을 위한 `qoreChainInfo`를 제공합니다.

```bash
npm install @qorechain/wallet-adapter
```

```ts
import { addQoreEvmToWallet } from "@qorechain/wallet-adapter";

// pass the EIP-1193 provider and the network parameters (rpcUrl is required)
await addQoreEvmToWallet(window.ethereum, {
  evmChainId: 9801,                       // 9800 for the testnet
  rpcUrl: "https://evm.qore.host",        // https://evm-testnet.qore.host for the testnet
  explorerUrl: "https://explore.qore.network",
  testnet: false,                         // true for the testnet
});
```

## 하나의 계정, 세 가지 주소 (통합 계정) {#unified-accounts}

체인 버전 **v3.1.83**부터, QoreChain 계정은 **세 가지 인코딩을 가진 하나의 20바이트 아이덴티티**입니다: `qor1…`(네이티브), `0x…`(EVM), base58 형식(SVM). 이 계정은 **하나의 잔액**을 가지며 — eth-네이티브 계정의 경우 — 네이티브 경로에 필요한 포스트 퀀텀 하이브리드 서명을 포함해 **하나의 키로 세 레인 모두에 서명**합니다.

`@qorechain/wallet-adapter`를 사용해 코드에서 통합 지갑을 생성할 수 있습니다.

```js
import { generateQoreWallet } from "@qorechain/wallet-adapter";

const w = await generateQoreWallet();          // or walletFromMnemonic(mnemonic)
console.log(w.cosmos);                         // qor1...
console.log(w.evm);                            // 0x... (same identity)
console.log(w.svm);                            // base58 (same identity)
// Native-lane sends use signHybridEth (classical eth_secp256k1 + ML-DSA-87 hybrid); pass `rest` so the sign-bytes form is resolved.
```

세 가지 형식 중 어디로 자금을 보내든 동일한 잔액에 반영됩니다.

## 연결된 지갑: 지출 키로 사용하는 Phantom과 MetaMask {#linked-wallets}

:::caution 현재 두 네트워크 모두에서 꺼져 있습니다
스마트 계정 및 연결된 지갑 기능은 구현되어 있지만 두 네트워크 모두에서 **꺼져 있습니다**(`abstractaccount.enabled = false`). 이 플래그가 꺼져 있는 동안에는 인증자 등록과 인증자를 통한 실행이 거부됩니다. 연결 흐름을 제공하기 전에 `GET /qorechain/abstractaccount/v1/config`를 확인하세요. 아래 섹션은 설계된 동작을 설명합니다.
:::

dApp에서 QoreChain 계정의 자금을 사용하기 위해 루트 키를 노출할 필요가 없도록 설계되었습니다(체인 버전 **v3.1.85**에서 도입). **Phantom**(ed25519) 또는 **MetaMask**(`personal_sign`을 통한 이더리움 주소 기반) 키를 계정의 **인증자(authenticator)로 등록**할 수 있으며 — 범위가 지정된 권한, 지출 한도, 만료 시각, 즉시 철회 기능과 함께 — 이후 dApp 백엔드가 중계하는 송금을 승인할 수 있습니다. 전체 모델과 코드는 [연결된 지갑 인증자](/developer-guide/account-abstraction#authenticators) 문서를, 종단 간 예제는 [SDK 인증자 가이드](/sdk/guides/authenticators)를 참고하세요.

## Solana 지갑 (SVM)

:::caution SVM 트랜잭션 제출이 현재 비활성화되어 있습니다
SVM 실행 레인은 **현재 네트워크 전역에서 트랜잭션 제출이 비활성화**되어 있습니다 — 지금은 Solana 호환 지갑을 통해 QoreChain에 트랜잭션을 보내지 마세요. 잔액/슬롯 조회는 계속 동작할 수 있습니다. 현재 상태는 [SVM 개발](/developer-guide/svm-development) 문서를 참고하세요.
:::

QoreChain의 SVM 실행 환경은 표준 Solana 툴링과 호환되며, 계정의 **네이티브 QOR 잔액은 SVM 인터페이스에서 직접 확인**할 수 있습니다(lamports 단위, 9자리 소수점; 1 uqor = 1,000 lamports). 모든 Solana 호환 지갑이나 라이브러리를 연결할 수 있습니다.

### @solana/web3.js 사용하기

```javascript
import { Connection } from "@solana/web3.js";

// Public read-only endpoint (or http://localhost:8899 on your own node)
const connection = new Connection("https://svm.qore.host");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
```

공개 SVM 엔드포인트는 **읽기 전용**입니다. 트랜잭션 제출에는 자체 노드가 필요합니다. 자세한 내용은 [SVM 개발](/developer-guide/svm-development) 문서를 참고하세요.

## PQC 지원 지갑 (Cosmos 경로에서 필수)

QoreChain은 cosmos 트랜잭션 경로에서 하이브리드 포스트 퀀텀 암호화(PQC)를 요구합니다. 현재 운영 중인 네트워크(v3.2.x)의 네트워크 기본값은 `hybrid_signature_mode = required`이며 `allow_classical_fallback = false`입니다 — 즉 **모든 cosmos 경로 트랜잭션은 표준 secp256k1(ECDSA) 서명과 함께 ML-DSA-87(Dilithium-5) 서명을 포함해야 합니다**. PQC 계정에서 보낸 클래식 전용 cosmos 트랜잭션은 거부됩니다.

:::caution Cosmos 트랜잭션에는 하이브리드 PQC 확장이 필요합니다
cosmos 경로에서 일반 클래식 트랜잭션을 보내면 거부됩니다. Dilithium-5 서명을 `PQCHybridSignature` 트랜잭션 확장으로 첨부해야 합니다. 표준 CosmJS / Keplr 툴링은 이 확장을 자체적으로 생성하지 않습니다 — `qorechaind tx pqc cosign` CLI 명령어, QoreChain SDK의 하이브리드 서명(아래 참고), 또는 직접 코드로 구현하려면 오픈소스 [**qorechain-pqc**](/developer-guide/post-quantum-signing) 라이브러리(`hybridSignBytes`)를 사용하세요. 유일한 예외는 제네시스 gentx, PQC 키 등록/마이그레이션 트랜잭션, 그리고 등록된 키가 없는 운영자 계정의 unjail입니다.
:::

### 작동 방식

지갑은 표준 secp256k1(ECDSA) 서명과 함께 ML-DSA-87 PQC 서명을 트랜잭션 확장으로 첨부합니다. 클래식 서명은 확장을 제외한 서명 바이트에 대해 계산되므로, 클래식 검증에서는 계속 유효하면서 PQC 서명이 양자 내성을 제공합니다.

### Dilithium-5 키 생성하기

하이브리드 서명을 위한 포스트 퀀텀 키를 생성합니다.

```bash
qorechaind tx pqc gen-key mypqc
```

이 명령은 키 이름을 받아 키를 `~/.qorechaind/pqc/<name>.dilithium`에 저장합니다(모드 `0600`, 암호화되지 않음). 공식 `qorechaind` 릴리스 바이너리가 필요합니다.

### 키 등록하기 (한 번만) {#register-your-key}

포스트 퀀텀 키는 계정당 한 번, 키 등록 트랜잭션으로 **명시적으로 등록**합니다. 이 트랜잭션(및 키 마이그레이션)은 완전히 새로운 계정이 부트스트랩할 수 있도록 클래식 방식으로 서명할 수 있으며, 그 이후에는 모든 Cosmos 레인 트랜잭션에 하이브리드 서명이 포함되어야 합니다.

```bash
# register the public key printed by gen-key for your account
qorechaind tx pqc register-key <public_key_hex> hybrid --from mykey \
  --chain-id qorechain-vladi --gas 600000 --fees 60000uqor
```

v3.2.3부터는 `qorechaind tx pqc register-key-v2 dilithium5 <public_key_hex> hybrid --pqc-key mypqc --from mykey ...`로 등록하여 선택적인 소유 증명을 첨부할 수 있으며, 체인은 약한 키, 퇴화(degenerate) 키, 이미 사용된 키도 거부합니다. PQC 키 파일을 니모닉만큼 신중하게 백업하세요. (키는 `qorechaind tx pqc recover-key`로 니모닉에서 다시 도출할 수 있으며, `tx pqc rotate-key`로 교체할 수 있습니다.) QoreX와 QoreChain SDK는 키를 대신 등록해 줍니다. 서명된 송금의 전체 예시는 [첫 번째 트랜잭션](/getting-started/first-transaction#register-pqc-key)을 참고하세요.

### SDK를 사용한 하이브리드 서명

QoreChain SDK는 `buildHybridTx`로 규격에 맞는 Cosmos 레인 트랜잭션을 생성하며, 이 과정에서 Dilithium-5 확장을 첨부합니다. 계정의 키가 이미 등록되어 있어야 합니다(위 참고). [SDK 계정 및 PQC 서명](/sdk/concepts/accounts-pqc) 문서를 참고하세요.

### PQC 모드

세 가지 적용 모드는 계속 거버넌스로 제어되며, **현재 네트워크 기본값은 Required(필수)**입니다.

| 모드                        | 설명                                                                     |
| --------------------------- | ------------------------------------------------------------------------ |
| **Disabled(비활성화)**      | PQC 검증이 꺼져 있습니다. 표준 서명만 사용합니다.                        |
| **Optional(선택사항)**      | 트랜잭션에 PQC 서명을 포함할 수 있습니다. 포함된 경우 검증됩니다.        |
| **Required(필수)** (기본값) | 모든 cosmos 경로 트랜잭션은 유효한 PQC 서명을 포함해야 합니다.           |

활성 모드는 체인 레벨에서 설정되며 거버넌스를 통해 변경할 수 있습니다.

:::caution EVM / MetaMask에는 PQC 키와 열린 창이 필요합니다
위의 MetaMask(EVM) 흐름은 하이브리드 확장을 포함하지 않지만, v3.2.0부터 EVM 레인은 등록된 포스트 퀀텀 키가 있고 **EVM 인가 창**이 열려 있는 계정의 트랜잭션만 받아들입니다. [EVM 인가 창](/getting-started/first-transaction#evm-window)을 참고하세요.
:::

## CLI 지갑

`qorechaind` 바이너리에는 명령줄 사용을 위한 내장 키 관리 시스템이 포함되어 있습니다.

### 새 키 생성하기

```bash
qorechaind keys add mykey
```

이 명령은 새 키 쌍을 생성하고 니모닉 문구를 표시합니다. **니모닉 문구를 안전하게 보관하세요** — 이 문구가 이 키를 복구할 수 있는 유일한 방법입니다.

### 주소 확인하기

```bash
qorechaind keys show mykey -a
```

이 명령은 `qor1...` bech32 주소를 출력합니다.

### 모든 키 목록 보기

```bash
qorechaind keys list
```

### 기존 키 가져오기

```bash
qorechaind keys add mykey --recover
```

니모닉 문구를 입력하라는 메시지가 표시됩니다.

## 다음 단계

* [첫 번째 트랜잭션](/getting-started/first-transaction) — 새 지갑으로 QOR 토큰 보내기
* [테스트넷 연결하기](/getting-started/connecting-to-testnet) — 운영 중인 Diana 테스트넷에 참여하기
