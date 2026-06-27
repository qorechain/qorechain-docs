---
slug: /developer-guide/evm-development
title: EVM 개발
sidebar_label: EVM 개발
sidebar_position: 2
---

# EVM 개발

QoreChain은 QoreChain EVM Engine 위에서 완전한 EVM 호환 실행 환경을 구동하므로, 익숙한 도구를 사용해 Solidity 스마트 컨트랙트를 배포하고 상호작용할 수 있습니다. EVM 모듈은 표준 이더리움 개발 워크플로를 지원하는 JSON-RPC 인터페이스를 **포트 8545**(WebSocket은 **8546**)에 노출합니다.

:::note
아래 예제는 **`qorechain-vladi`** 메인넷(EVM 체인 ID **9801**)을 대상으로 하며, 이 메인넷은 2026년 6월 7일부터 체인 버전 **v3.1.77**로 운영 중입니다. **`qorechain-diana`** 테스트넷의 경우 EVM 체인 ID **9800**을 사용하세요.
:::

---

## JSON-RPC 엔드포인트

| 속성                 | 값                                         |
| -------------------- | ------------------------------------------ |
| 기본 URL          | `http://localhost:8545`                    |
| WebSocket URL        | `ws://localhost:8546`                      |
| 지원되는 네임스페이스 | `eth_`, `web3_`, `net_`, `txpool_`, `qor_` |
| 체인 ID (메인넷)   | `9801` (`qorechain-vladi`)                 |
| 체인 ID (테스트넷)   | `9800` (`qorechain-diana`)                 |
| 통화 기호      | `QOR`                                      |

`qor_` 네임스페이스는 QoreChain 고유 메서드를 제공합니다. 아래 [커스텀 네임스페이스](#custom-qor_-namespace)를 참고하세요.

---

## 지갑 설정 (MetaMask)

MetaMask에서 QoreChain을 커스텀 네트워크로 추가하세요:

| 필드              | 메인넷 값             | 테스트넷 값           |
| ------------------ | ------------------------- | ----------------------- |
| 네트워크 이름       | QoreChain (qorechain-vladi) | QoreChain Diana       |
| RPC URL            | `http://localhost:8545`   | `http://localhost:8545` |
| 체인 ID           | `9801`                    | `9800`                  |
| 통화 기호    | `QOR`                     | `QOR`                   |
| 블록 익스플로러 URL | *(공식 메인넷 익스플로러를 사용)* | *(로컬 테스트넷의 경우 비워 둠)* |

---

## Hardhat

Hardhat을 설치하고 `hardhat.config.js`를 설정하세요:

```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.24",
  networks: {
    qorechain: {
      url: "http://localhost:8545",
      accounts: ["0xYOUR_PRIVATE_KEY_HEX"],
      chainId: 9801, // mainnet qorechain-vladi (use 9800 for qorechain-diana testnet)
    },
  },
};
```

컨트랙트 배포:

```bash
npx hardhat run scripts/deploy.js --network qorechain
```

QoreChain EVM에 대해 테스트 실행:

```bash
npx hardhat test --network qorechain
```

---

## Foundry

Foundry로 컨트랙트를 생성하고 배포하세요:

```bash
# Create a new project
forge init my-project && cd my-project

# Build
forge build

# Deploy
forge create --rpc-url http://localhost:8545 \
  --private-key 0xYOUR_PRIVATE_KEY_HEX \
  src/MyContract.sol:MyContract

# Interact
cast call <contract-address> "myFunction()" --rpc-url http://localhost:8545
cast send <contract-address> "setValue(uint256)" 42 \
  --rpc-url http://localhost:8545 \
  --private-key 0xYOUR_PRIVATE_KEY_HEX
```

---

## Ethers.js

```javascript
import { ethers } from "ethers";

// Connect to QoreChain EVM
const provider = new ethers.JsonRpcProvider("http://localhost:8545");

// Get chain info
const network = await provider.getNetwork();
console.log("Chain ID:", network.chainId); // 9801n on mainnet (9800n on testnet)

// Read balance
const balance = await provider.getBalance("0xYourAddress");
console.log("Balance:", ethers.formatEther(balance), "QOR");

// Send transaction
const wallet = new ethers.Wallet("0xYOUR_PRIVATE_KEY_HEX", provider);
const tx = await wallet.sendTransaction({
  to: "0xRecipientAddress",
  value: ethers.parseEther("1.0"),
});
await tx.wait();
```

---

## 가스 모델

QoreChain은 EVM 트랜잭션에 **EIP-1559 동적 기본 수수료(base fee)** 모델을 사용합니다:

* 기본 수수료는 사용률에 따라 블록마다 조정됩니다
* 사용자는 `maxFeePerGas`와 `maxPriorityFeePerGas`를 설정할 수 있습니다
* 우선순위 수수료(priority fee)는 블록 제안자에게 지급됩니다

### 단위 브리지

네이티브 QOR 토큰은 **소수점 6자리**(`uqor`)를 가지는 반면, EVM은 **소수점 18자리**를 기대합니다. `x/precisebank` 모듈이 매끄러운 변환을 처리합니다:

| 컨텍스트      | 단위 | 소수 자릿수 | 예시                |
| ------------ | ------------ | -------- | ---------------------- |
| 네이티브 체인 | `uqor`       | 6        | `1000000 uqor = 1 QOR` |
| EVM          | wei          | 18       | `1e18 wei = 1 QOR`     |

이 변환은 투명하게 이루어집니다. `eth_getBalance`로 잔액을 조회하면 응답은 18자리 wei 단위로 표시됩니다. 동일한 계정을 네이티브 bank 모듈로 조회하면 잔액은 6자리 `uqor`로 나타납니다.

---

## ERC-20 토큰 페어

`x/erc20` 모듈은 네이티브 Cosmos SDK 단위와 ERC-20 컨트랙트 간의 **토큰 페어**를 자동으로 등록합니다:

* 네이티브 토큰을 EVM 컨트랙트 내에서 ERC-20으로 사용할 수 있습니다
* EVM에 배포된 ERC-20 토큰을 네이티브 단위로 변환할 수 있습니다
* 변환은 양방향이며 프로토콜 수준에서 처리됩니다

```bash
# Register a new token pair (governance proposal)
qorechaind tx erc20 register-coin <denom> --from mykey

# Convert native tokens to ERC-20
qorechaind tx erc20 convert-coin 1000000uqor --from mykey

# Convert ERC-20 back to native
qorechaind tx erc20 convert-erc20 <contract-addr> 1000000000000000000 --from mykey
```

---

## PQC 및 EVM 호환성

EVM 트랜잭션은 기존 이더리움 도구, 지갑, 라이브러리와의 완전한 호환성을 위해 **고전적 ECDSA (secp256k1)** 서명을 사용합니다. 이를 통해 MetaMask, Hardhat, Foundry, ethers.js 및 모든 표준 EVM 도구가 수정 없이 작동합니다.

EVM 내에서의 양자내성 보안을 위해:

* **PQC Verify 프리컴파일**(`0x0000...0A01`)을 사용해 Solidity에서 ML-DSA-87 서명을 온체인으로 검증하세요. [EVM 프리컴파일](/developer-guide/evm-precompiles)을 참고하세요.
* EVM에서 CosmWasm 또는 SVM으로 보내는 **크로스-VM 메시지**는 Cosmos SDK 트랜잭션 계층에서 PQC 서명될 수 있습니다.
* 계정은 하이브리드 보안을 위해 `x/pqc`를 통해 선택적으로 PQC 공개 키를 등록할 수 있습니다.

---

## 커스텀 `qor_` 네임스페이스 {#custom-qor_-namespace}

QoreChain은 체인 고유 쿼리를 위해 JSON-RPC를 `qor_` 네임스페이스로 확장합니다:

| 메서드                      | 설명                                                       |
| --------------------------- | ----------------------------------------------------------------- |
| `qor_getPQCKeyStatus`       | 계정에 등록된 PQC 공개 키가 있는지 확인               |
| `qor_getAIStats`            | AI 엔진 통계 조회 (이상 탐지 횟수, 위험 분포) |
| `qor_getCrossVMMessage`     | ID로 크로스-VM 메시지의 상태를 조회                  |
| `qor_getPoolClassification` | 밸리데이터 풀 분류 조회 (RPoS/DPoS/PoS)                 |
| `qor_getReputationScore`    | 밸리데이터의 평판 점수를 조회                   |
| `qor_getAbstractAccount`    | 추상 계정 설정을 조회                            |

`curl`을 사용한 예제:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getPQCKeyStatus",
    "params": ["0xYourAddress"],
    "id": 1
  }'
```

---

## 다음 단계

* [EVM 프리컴파일](/developer-guide/evm-precompiles) — Solidity에서 PQC, AI, 크로스-VM 기능 접근
* [크로스-VM 상호운용성](/developer-guide/cross-vm-interoperability) — EVM에서 CosmWasm 및 SVM 컨트랙트 호출
* [계정 추상화](/developer-guide/account-abstraction) — 세션 키를 갖춘 프로그래밍 가능한 계정
