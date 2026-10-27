---
slug: /developer-guide/evm-development
title: EVM 개발
sidebar_label: EVM 개발
sidebar_position: 2
---

# EVM 개발

QoreChain은 QoreChain EVM 엔진에서 완전한 EVM 호환 실행 환경을 구동하므로, 익숙한 툴체인을 사용해 Solidity 스마트 컨트랙트를 배포하고 상호작용할 수 있습니다. EVM 모듈은 **8545 포트**에서 JSON-RPC 인터페이스를 노출하며(웹소켓은 **8546** 포트), 표준 이더리움 개발 워크플로를 지원합니다.

:::note
아래 예제는 2026년 6월 7일부터 가동 중이며 작성 시점에 노드 릴리스 **v3.2.4**(거버넌스 제안 13으로 2026년 10월 23일 높이 3,742,566에서 적용되었으며, v3.2.3은 2026년 10월 20일 높이 3,662,051에서 적용되었습니다. 메인넷 거버넌스 제안 14가 높이 3,906,833에서 v3.2.5를 적용할 예정이며, 해당 릴리스가 바꾸는 내용은 적용된 뒤에 문서화됩니다)를 실행하는 **`qorechain-vladi`** 메인넷(EVM 체인 ID **9801**)을 대상으로 합니다. **`qorechain-diana`** 테스트넷은 **v3.2.6**을 실행하며(2026년 10월 19일 높이 8,337,253부터 v3.2.4, 10월 26일 높이 8,890,800에서 v3.2.5, 10월 27일 높이 8,970,638에서 v3.2.6), 그곳에서는 EVM 체인 ID **9800**을 사용하세요. 이 페이지가 네트워크 간에 다른 내용(테스트넷 프리컴파일, Fest 테스트 토큰)을 설명하는 경우에는 그렇게 명시합니다. 코드 샘플은 직접 운영하는 노드를 위해 `http://localhost:8545`를 사용하며, 공개 메인넷 엔드포인트는 `https://evm.qore.host`, 테스트넷 엔드포인트는 `https://evm-testnet.qore.host`입니다.
:::

:::caution EVM 트랜잭션에는 등록된 PQC 키와 열려 있는 인가 윈도우가 필요합니다
v3.2.0 업그레이드(메인넷 높이 2,981,742, 테스트넷 높이 5,920,000) 이후 EVM 레인은 **(1) 등록된 ML-DSA-87 양자 내성 키**와 **(2) 해당 트랜잭션을 수용할 여유가 있는, 열려 있는 EVM 인가 윈도우**를 모두 가진 계정의 트랜잭션만 받아들입니다. 서명은 일반 도구(MetaMask, ethers.js, Hardhat, Foundry)로 하지만, 등록된 키와 열려 있는 윈도우가 없으면 `eth_sendRawTransaction`은 거부됩니다(코드스페이스 `pqc`, 코드 26, 27 또는 28). 읽기, `eth_call`, 가스 추정에는 둘 다 필요하지 않습니다. 아래의 [EVM 인가 윈도우](#evm-window)와 [첫 트랜잭션](/getting-started/first-transaction#evm-window)의 단계별 안내를 참조하세요.

v3.2.2부터 메인넷에는 두 가지 규칙이 더 적용됩니다. **보호되지 않은(EIP-155 이전) 트랜잭션은 거부됩니다**(노드의 멤풀과 블록 실행 모두에서). 따라서 체인 ID를 포함해 서명하세요(현재의 모든 지갑과 라이브러리가 그렇게 합니다). 또한 **모듈 계정은 EVM을 통해 점유할 수 없습니다**.
:::

---

## JSON-RPC 엔드포인트

| 속성                | 값                                          |
| ------------------- | ------------------------------------------ |
| 기본 URL             | `http://localhost:8545`                    |
| 웹소켓 URL           | `ws://localhost:8546`                      |
| 지원 네임스페이스     | `eth_`, `web3_`, `net_`, `txpool_`          |
| 체인 ID (메인넷)      | `9801` (`qorechain-vladi`)                 |
| 체인 ID (테스트넷)    | `9800` (`qorechain-diana`)                 |
| 통화 심볼            | `QOR`                                      |

QoreChain 전용 읽기는 REST(`api.qore.host`)로 제공됩니다. [아래](#custom-qor_-namespace)에 설명된 `qor_` JSON-RPC 네임스페이스는 공개 엔드포인트와 기본 노드 구성에서 **활성화되어 있지 않습니다**. 새로 초기화한 노드(v3.2.3 이상)의 기본 `api` 목록은 `eth,net,web3`이며, `txpool`은 노드의 대기 중인 트랜잭션을 공개하기 때문에 선택 사항(opt-in)입니다.

노드 릴리스 v3.2.4부터(메인넷은 2026년 10월 23일부터, 테스트넷은 2026년 10월 19일부터) 노드는 자체 JSON-RPC 서버에 제한을 둡니다. 256 KiB를 넘는 요청 본문은 거부되고(HTTP 413), 동시에 처리되는 요청은 256개를 넘지 않으며(초과분은 HTTP 503), 토픽 위치가 4개를 넘거나, 한 위치에 대안이 1000개를 넘거나, 주소가 1000개를 넘는 `eth_getLogs` 또는 `eth_newFilter` 필터는 거부됩니다. 이 제한은 `app.toml`의 `[json-rpc]` 섹션에 있는 노드 로컬 설정이며, [노드 실행](/developer-guide/running-a-node#exposing-endpoints-for-integration)을 참고하세요.

---

## 지갑 설정 (MetaMask)

MetaMask에 QoreChain을 커스텀 네트워크로 추가하세요.

| 필드                | 메인넷 값                    | 테스트넷 값               |
| ------------------- | ---------------------------- | ------------------------- |
| 네트워크 이름         | QoreChain (qorechain-vladi)  | QoreChain Diana           |
| RPC URL             | `https://evm.qore.host`      | `https://evm-testnet.qore.host` |
| 체인 ID             | `9801`                       | `9800`                    |
| 통화 심볼           | `QOR`                        | `QOR`                     |
| 블록 탐색기 URL      | `https://explore.qore.network` | *(선택 사항)*  |

MetaMask에서 전송하려면 계정에 등록된 PQC 키와 열려 있는 [EVM 인가 윈도우](#evm-window)도 필요합니다.

---

## Hardhat

Hardhat을 설치하고 `hardhat.config.js`를 설정합니다.

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

컨트랙트를 배포합니다(배포 계정에는 등록된 PQC 키와 열려 있는 [인가 윈도우](#evm-window)가 필요하며, 배포는 윈도우 내에서 EVM 트랜잭션 한 건으로 계산됩니다).

```bash
npx hardhat run scripts/deploy.js --network qorechain
```

QoreChain EVM을 대상으로 테스트를 실행합니다.

```bash
npx hardhat test --network qorechain
```

---

## Foundry

Foundry로 컨트랙트를 생성하고 배포합니다.

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

QoreChain은 EVM 트랜잭션에 **EIP-1559 동적 기본 수수료** 모델을 사용합니다.

* 기본 수수료는 블록 사용률에 따라 블록마다 조정됩니다
* 사용자는 `maxFeePerGas`와 `maxPriorityFeePerGas`를 설정할 수 있습니다
* 우선 수수료는 블록 제안자에게 지급됩니다

### 단위 변환 브리지

네이티브 QOR 토큰은 소수점 이하 **6자리**(`uqor`)를 사용하는 반면, EVM은 소수점 이하 **18자리**를 기대합니다. `x/precisebank` 모듈이 이 변환을 매끄럽게 처리합니다.

| 컨텍스트     | 단위    | 소수 자릿수 | 예시                    |
| ------------ | ------- | ----------- | ----------------------- |
| 네이티브 체인 | `uqor`  | 6           | `1000000 uqor = 1 QOR`  |
| EVM          | wei     | 18          | `1e18 wei = 1 QOR`      |

이 변환은 사용자에게 투명하게 이루어집니다. `eth_getBalance`로 잔액을 조회하면 응답은 18자리 wei 단위로 표시됩니다. 동일한 계정을 네이티브 뱅크 모듈로 조회하면 잔액은 6자리 `uqor` 단위로 나타납니다.

---

## ERC-20 토큰 페어 {#erc20-token-pairs}

`x/erc20` 모듈은 네이티브 Cosmos SDK 단위와 ERC-20 컨트랙트 간의 **토큰 페어**를 제공합니다.

* 네이티브 토큰은 EVM 컨트랙트 내에서 ERC-20으로 사용할 수 있습니다
* EVM에 배포된 ERC-20 토큰은 네이티브 단위로 변환할 수 있습니다
* 변환은 양방향으로 이루어지며 프로토콜 계층에서 처리됩니다

```bash
# Register a native ERC-20 contract as a token pair (permissioned: `permissionless_registration` is false)
qorechaind tx erc20 register-erc20 <contract-addr> --from mykey

# Convert native tokens to ERC-20
qorechaind tx erc20 convert-coin 1000000uqor --from mykey --gas 400000 --fees 40000uqor

# Convert ERC-20 back to native
qorechaind tx erc20 convert-erc20 <contract-addr> 1000000000000000000 --from mykey --gas 400000 --fees 40000uqor
```

이들은 Cosmos 레인 트랜잭션이므로, 라이브 네트워크에서는 하이브리드 양자 내성 cosign도 필요합니다(`--generate-only`로 구성한 다음 `qorechaind tx pqc cosign` 실행. [양자 내성 서명](/developer-guide/post-quantum-signing) 참조). 위의 일반 `convert-erc20` 명령은 CLI가 `0x` 발신자를 기록하기 때문에 노드 릴리스 v3.2.6에서 거부됩니다. 동작하는 형식은 [두 형태 사이의 변환](#fest-convert)을 참조하세요. 토큰 페어는 허가형 정책에 따라 등록되며(거버넌스가 등록합니다), 작성 시점에 메인넷에는 존재하지 않습니다. 테스트넷에는 [다음 섹션](#fest-tokens)의 Fest 테스트 토큰이 있습니다.

## Fest 테스트 토큰과 ERC20 변환 {#fest-tokens}

:::note 테스트넷 전용, 가치 없음
이 섹션의 토큰은 `qorechain-diana` 테스트넷(EVM 체인 ID 9800)에만 존재합니다. 빌더를 위한 테스트 토큰이며 가치가 없습니다. 메인넷에는 ERC-20 토큰 페어가 없으므로(2026년 10월 27일 확인), 아래의 denom은 메인넷에 하나도 존재하지 않습니다.
:::

2026년 10월 27일 테스트넷 거버넌스(제안 26)가 세 개의 ERC-20 컨트랙트를 토큰 페어로 등록했습니다. 이 토큰들은 빌더가 [AMM 풀](/api-reference/rest-grpc-endpoints#amm-module)에서 QOR과 짝지을 수 있는 두 번째 토큰을 제공합니다:

| 토큰 | ERC-20 컨트랙트 (EIP-55) | 소수 자릿수 | 뱅크 denom |
| ----- | ------------------------ | -------- | ---------- |
| fUSD (FestUSD) | `0x97143B771D34ddb9130b807b135Ae675A5a963CA` | 6  | `erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA` |
| fETH (FestETH) | `0x02292293c13880a26242690eb70a0e42B8E91c28` | 18 | `erc20:0x02292293c13880a26242690eb70a0e42B8E91c28` |
| fBTC (FestBTC) | `0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | 8  | `erc20:0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` |

* **뱅크 denom은 콜론이 있는 `erc20:<address>` 형식이며, 주소는 표시된 정확한 EIP-55 대소문자 혼합 철자여야 합니다.** denom은 대소문자를 구분합니다. `erc20:0x97143b771d34...`(소문자)는 다른 문자열이며, 이를 조회하면 `404`로 응답합니다. `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata`에서 denom을 복사하세요. 이 엔드포인트는 세 토큰을 `symbol`(`fUSD`, `fETH`, `fBTC`), `display` 이름(`FestUSD`, `FestETH`, `FestBTC`), 소수 자릿수와 함께 나열합니다.
* **포셋은 뱅크 코인을 지급합니다.** EVM(MetaMask, Solidity)에서 Fest 토큰을 사용하려면 먼저 `MsgConvertCoin`으로 뱅크 코인을 ERC-20 형태로 변환하세요. ERC-20 잔액을 다시 뱅크 형태로 되돌리려면(예: AMM에서 짝짓기 위해) `MsgConvertERC20`을 사용하세요. 둘 다 다음에서 설명합니다.
* **토큰은 두 가지 형태로 존재합니다.** ERC-20 잔액은 EVM JSON-RPC를 통해 컨트랙트의 `balanceOf`로 읽고, 변환된 잔액은 뱅크 코인이며 `GET /cosmos/bank/v1beta1/balances/{address}`로 읽습니다. AMM에서는 뱅크 코인 형태만 짝지을 수 있습니다. 변환은 두 형태 사이에서 가치를 옮길 뿐 새로 만들어 내지 않습니다.
* **금액은 토큰 자체의 소수 자릿수를 사용합니다**(fUSD, fETH, fBTC는 각각 6, 18, 8). `uqor`의 6자리가 아닙니다.

```bash
curl -s https://api-testnet.qore.host/cosmos/evm/erc20/v1/token_pairs
curl -s "https://api-testnet.qore.host/cosmos/evm/erc20/v1/token_pairs/0x97143B771D34ddb9130b807b135Ae675A5a963CA"
```

### 두 형태 사이의 변환 {#fest-convert}

두 변환 메시지는 모두 Cosmos 레인 트랜잭션입니다. 등록된 양자 내성 키와 하이브리드 cosign이 필요하며, 다른 네이티브 트랜잭션과 같습니다(구성한 다음 `qorechaind tx pqc cosign`. [양자 내성 서명](/developer-guide/post-quantum-signing) 참조). 수수료는 최소 gas × 0.1 uqor여야 합니다.

:::note 실제로 실행한 것
이 페이지의 REST 읽기(`token_pairs`, `denoms_metadata`)는 2026년 10월 27일 테스트넷에 대해 실행했습니다. 아래의 두 변환 명령은 이 페이지를 위해 끝까지 실행하지 **않았습니다**. 메시지 형태와 발신자 규칙은 v3.2.6 노드 소스와 체인 팀의 참고 자료에서 가져왔습니다. 문서화된 형태로 취급하고, 먼저 소량으로 확인하세요.
:::

**뱅크 코인에서 ERC-20으로: `MsgConvertCoin`.** `coin`은 대소문자를 구분하는 정확한 뱅크 denom(`erc20:<EIP-55 address>`)이고, `sender`는 서명자인 `qor1...` 주소이며, `receiver`는 ERC-20을 보유할 `0x...` 주소입니다. 가스를 약 432,000 사용하므로 가스 한도를 600,000으로 설정하세요.

```bash
# Write the message by hand (not run for this page)
cat > convert-coin.json <<'JSON'
{
  "body": {
    "messages": [{
      "@type": "/cosmos.evm.erc20.v1.MsgConvertCoin",
      "coin": { "denom": "erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA", "amount": "1000000" },
      "receiver": "0xYOUR_EVM_ADDRESS",
      "sender": "qor1youraddr..."
    }],
    "memo": ""
  },
  "auth_info": { "signer_infos": [], "fee": { "amount": [{ "denom": "uqor", "amount": "60000" }], "gas_limit": "600000" } },
  "signatures": []
}
JSON
qorechaind tx pqc cosign convert-coin.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

**ERC-20에서 뱅크 코인으로: `MsgConvertERC20`.** 이 메시지의 `sender` 필드도 계정의 `qor1...` bech32 주소여야 합니다. `0x` 발신자는 `decoding bech32 failed`로 거부됩니다. 노드 릴리스 v3.2.6에서 CLI 명령 `qorechaind tx erc20 convert-erc20`([ERC-20 토큰 페어](#erc20-token-pairs)의 일반 예시)은 발신자를 `0x` 형식으로 기록하므로 이 이유로 거부됩니다. 사용하지 마세요. 위와 같은 방식으로 `qor1` 주소를 발신자로 하여 메시지를 직접 구성하세요:

```bash
# Workaround: write the message with a qor1 sender (not run for this page)
cat > convert-erc20.json <<'JSON'
{
  "body": {
    "messages": [{
      "@type": "/cosmos.evm.erc20.v1.MsgConvertERC20",
      "contract_address": "0x97143B771D34ddb9130b807b135Ae675A5a963CA",
      "amount": "1000000",
      "receiver": "qor1youraddr...",
      "sender": "qor1youraddr..."
    }],
    "memo": ""
  },
  "auth_info": { "signer_infos": [], "fee": { "amount": [{ "denom": "uqor", "amount": "60000" }], "gas_limit": "600000" } },
  "signatures": []
}
JSON
qorechaind tx pqc cosign convert-erc20.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

여기서 `receiver`는 뱅크 코인을 받는 `qor1...` 계정입니다(모듈은 뱅크 코인으로의 변환 수신자에 bech32 형식을 허용합니다). 금액은 토큰 자체의 기본 단위(소수 6, 18 또는 8자리)입니다. `MsgConvertCoin`의 denom은 `denoms_metadata`에서만 복사하세요. 소문자 형태는 `token pair not found`로 거부됩니다.

---

## PQC와 EVM 호환성

EVM 트랜잭션은 **고전적인 ECDSA(secp256k1)**로 서명되므로, MetaMask, Hardhat, Foundry, ethers.js 및 기타 표준 도구가 수정 없이 이를 구성하고 서명합니다. **v3.2.0**에서 바뀐 것은 *수용(admission)* 입니다. 트랜잭션은 발신자가 등록된 양자 내성 키와 유효한 인가 윈도우(다음 섹션)를 가진 경우에만 수락됩니다. 키 등록과 윈도우 개설은 Cosmos 레인 트랜잭션이며 하이브리드(ML-DSA-87 + secp256k1) 서명이 필요합니다.

컨트랙트 내에서 양자 내성 보안을 확보하려면 다음을 활용하세요.

* **PQC Verify 프리컴파일**(`0x0000...0A01`)은 Solidity에서 온체인으로 ML-DSA-87 서명을 검증합니다. 이 프리컴파일은 **테스트넷에서 활성화되어 있으며**(거버넌스 제안 21로 활성화, 2026년 10월 27일 통과) 작성 시점에 **메인넷에서는 활성화되지 않았습니다**. [EVM 프리컴파일: 네트워크 상태](/developer-guide/evm-precompiles#network-status)를 참조하세요.
* EVM에서 QoreChain Native 또는 SVM으로 향하는 **크로스-VM 메시지**는 Cosmos 레인 트랜잭션이며 다른 트랜잭션과 마찬가지로 하이브리드 서명을 포함합니다. 현재 사용 가능 여부는 [크로스-VM 상호운용성](/developer-guide/cross-vm-interoperability)을 참조하세요.

---

## EVM 인가 윈도우 {#evm-window}

양자 내성 서명은 이더리움 트랜잭션과 *함께* 전달될 수 없으므로(MetaMask와 같은 지갑은 두 번째 서명을 첨부할 수 없습니다), 그보다 *앞서* 전달됩니다. 계정은 Cosmos 레인 메시지 `MsgOpenEVMWindow`로 범위가 제한된 윈도우를 열고, 이후 EVM 레인은 유효한 윈도우가 포괄하는 트랜잭션만 수용합니다. 도난당한 고전 키만으로는 윈도우를 열 수 없으므로, 이미 열려 있는 윈도우가 허용하는 범위만 이동할 수 있습니다.

| 한도        | 범위               | 의미 |
| ----------- | ------------------ | ------- |
| `blocks`    | 1 – 17,280         | 윈도우가 열려 있는 기간으로, 윈도우를 여는 블록부터 블록 수로 계산 |
| `max-txs`   | 1 – 1,000          | 수용하는 EVM 트랜잭션 수 |
| `max-value` | 0 초과, `uqor` 단위 | 수용하는 총 유출액: 전송 값 **더하기** 각 트랜잭션이 지불할 수 있는 최대 수수료(가스 한도 × 가스당 최대 수수료)를 `uqor`로 환산해 올림한 값 |

먼저 소진되는 한도가 윈도우를 닫습니다. 세 가지 한도는 모두 필수이며, 윈도우를 열면 기존 윈도우가 대체됩니다. 수용된 후 실패한 트랜잭션도 슬롯과 값 예산을 소모하며, 컨트랙트 배포도 다른 트랜잭션과 동일하게 계산됩니다. `blocks`는 기간이 아니라 블록 수입니다. 17,280 블록은 메인넷에서 약 15시간(블록당 약 3.2초), 테스트넷에서 약 6시간(2026년 10월 27일 기준 블록당 약 1.3초이며, 테스트넷 블록 시간은 변동합니다)입니다.

**값 한도는 네이티브 QOR만 계산합니다.** 토큰 전송, 승인(approval) 또는 기타 컨트랙트 호출은 값이 0이므로 `max-value`에 계산되지 않습니다(최대 수수료만 계산됨). 이들도 제한하려면 윈도우의 **범위(scope)**를 좁히세요(메인넷 v3.2.3 이상):

| 범위 옵션(CLI 플래그) | 메시지 필드 | 윈도우가 수용하는 것 |
| ----------------------- | ------------- | ---------------------- |
| `--native-only`         | `native_only` | 네이티브 QOR의 일반 전송만: calldata 없음, 컨트랙트 생성 없음, 코드를 가진 수신자 없음, EIP-7702 인가 없음 |
| `--allowed-targets 0xA,0xB` | `allowed_targets` | 수신자가 나열된 20바이트 주소 중 하나인 트랜잭션만. 컨트랙트 생성은 거부됨 |

범위 없이 연 윈도우는 이전과 정확히 동일하게 동작합니다. 범위를 벗어난 트랜잭션은 코드 27로 거부됩니다(메시지는 윈도우가 "이 트랜잭션을 수용하지 않는다"고 표시). `GET /qorechain/pqc/v1/evm_window/{address}`와 `qorechaind query pqc evm-window`는 `native_only`와 `allowed_targets`를 보고하며, `pqc_evm_window_opened` 이벤트에도 설정된 경우 이 값이 포함됩니다.

**단계**(전체 안내는 [첫 트랜잭션](/getting-started/first-transaction#evm-window)에 있습니다):

1. ML-DSA-87 키를 한 번 등록합니다(`tx pqc register-key-v2` 또는 `register-key`, `--gas 600000 --fees 60000uqor` 사용. 이 트랜잭션 하나는 하이브리드 요건에서 면제되므로 새 계정도 부트스트랩할 수 있습니다). [양자 내성 서명](/developer-guide/post-quantum-signing#pqc-key-registration)을 참조하세요.
2. 윈도우를 엽니다. 이는 Cosmos 레인 트랜잭션이므로 서명하지 않은 상태로 생성한 다음 ML-DSA 키로 cosign합니다(`max-value`는 `uqor` 또는 `qor`를 받으며, `1000qor`는 1,000 QOR입니다):

   ```bash
   qorechaind tx pqc open-evm-window 7200 20 1000qor --from mykey \
     --chain-id qorechain-vladi --gas 400000 --fees 40000uqor --generate-only > w.json
   qorechaind tx pqc cosign w.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi

   # the same window narrowed to plain QOR transfers (mainnet v3.2.3 and later):
   qorechaind tx pqc open-evm-window 7200 20 1000qor --native-only --from mykey \
     --chain-id qorechain-vladi --gas 400000 --fees 40000uqor --generate-only > w.json
   ```

3. 남은 한도를 확인합니다: `qorechaind query pqc evm-window <address>` 또는 `GET /qorechain/pqc/v1/evm_window/{address}`(윈도우가 없으면 `found: false`로 응답).
4. EVM 트랜잭션을 평소처럼 전송합니다. 윈도우를 여는 것은 Cosmos 레인 트랜잭션이며 계정의 시퀀스(EVM 논스이기도 함)를 증가시키므로, 윈도우가 열린 **후에** 논스를 읽고 그때 서명하세요.

윈도우를 일찍 닫으려면 `qorechaind tx pqc close-evm-window`를 사용합니다(동일한 `--generate-only` 및 `cosign` 패턴). 예를 들어 고전 키가 노출되었다고 의심되는 경우, 윈도우가 아직 허용하던 모든 것이 다음 블록부터 거부됩니다.

### EIP-7702 위임 {#eip-7702}

계정의 EIP-7702 위임(타입 4 트랜잭션)은 v3.2.2부터 계정 자신의 양자 내성 동의가 있어야만 효력이 발생합니다. 먼저 하이브리드 서명된 Cosmos 레인 메시지 `MsgAuthorizeEVMDelegation`(`qorechaind tx pqc authorize-evm-delegation <delegate_0x> <blocks>`)으로 동의를 기록하세요. 이 동의는 일회용이며, 지정한 블록 수가 지나면 만료되고 `close-evm-window`로 철회됩니다. 위임된 계정에서 나가는 값은 **해당** 계정 자신의 윈도우에 청구되며, 실패한 타입 4 트랜잭션도 이미 적용한 인가는 유지하고, `qorechaind tx pqc clear-evm-delegation`은 위임을 제거합니다. 거부된 위임은 코드 60에서 63으로 응답합니다. 동의 내용은 `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`로 읽을 수 있습니다.

| 거부 (코드스페이스 `pqc`) | 의미 |
| ------------------------- | ------- |
| code 26 | 발신자에게 열려 있는 윈도우가 없거나, 발신자에게 등록된 PQC 키가 없음 |
| code 27 | 윈도우가 만료되었거나 소진됨(메시지에 어떤 한도인지 표시), 또는 트랜잭션이 윈도우의 범위를 벗어남 |
| code 28 | 윈도우를 열 때 한도가 유효하지 않거나, 그 시점에 등록된 키가 없음 |

TypeScript SDK(0.8.2 이상)에서는: `openEvmWindowMsg`, `closeEvmWindowMsg`, `fetchEvmWindow({ rest, address })`, `classifyEvmWindowRejection(err)`(`"no-pqc-key" | "no-window" | "exhausted" | "invalid"`)를 사용할 수 있습니다. SDK 0.9.0은 `openEvmWindowMsg`에 범위 옵션(`nativeOnly`, `allowedTargets`)을 추가하고 EIP-7702 동의 빌더(`authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `fetchEvmDelegationConsent`)를 추가합니다. 0.9.0 이전 릴리스는 범위가 없는 윈도우만 만들 수 있으므로, 나머지에는 `qorechaind`를 사용하세요([SDK EVM 가이드](/sdk/guides/evm#evm-window-scope) 참조).

---

## 커스텀 `qor_` 네임스페이스 {#custom-qor_-namespace}

QoreChain은 체인 전용 조회를 위해 JSON-RPC를 `qor_` 네임스페이스로 확장합니다.

:::warning 아직 제공되지 않음
공개된 노드 빌드 중 `qor_` 네임스페이스를 제공하는 것은 아직 없습니다. 공개 엔드포인트의 `rpc_modules`에는 `eth`, `net`, `rpc`, `txpool`, `web3`만 나열되며, 아래의 모든 메서드는 메인넷, 테스트넷, 기본 구성(`eth`, `net`, `web3`)의 자체 운영 노드에서 `-32601`(메서드를 찾을 수 없음)을 반환합니다. 현황과 REST 대안(예: PQC 키 상태는 `GET /qorechain/pqc/v1/account/{address}`)은 [`qor_` 네임스페이스](/api-reference/json-rpc-qor_-namespace)를 참조하세요.
:::

| 메서드                       | 설명                                                        |
| ---------------------------- | ------------------------------------------------------------- |
| `qor_getPQCKeyStatus`        | 계정에 등록된 PQC 공개키가 있는지 확인                          |
| `qor_getAIStats`             | AI 엔진 통계 조회(이상 탐지 횟수, 위험도 분포)                   |
| `qor_getCrossVMMessage`      | ID로 크로스-VM 메시지의 상태 조회                                |
| `qor_getPoolClassification`  | 검증인 풀 분류 조회(RPoS/DPoS/PoS)                              |
| `qor_getReputationScore`     | 검증인의 평판 점수 조회                                          |
| `qor_getAbstractAccount`     | 추상 계정 구성 조회                                              |

`curl` 사용 예시입니다.

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

* [EVM 프리컴파일](/developer-guide/evm-precompiles) — QoreChain 프리컴파일 인터페이스 참조(테스트넷에서 세 개 활성화, 메인넷에서는 없음)
* [크로스-VM 상호운용성](/developer-guide/cross-vm-interoperability) — 크로스-VM 호출과 현재 사용 가능 여부
* [계정 추상화](/developer-guide/account-abstraction) — 연결된 지갑 인증기와 지출 규칙(테스트넷에서는 활성화, 메인넷에서는 비활성화)
