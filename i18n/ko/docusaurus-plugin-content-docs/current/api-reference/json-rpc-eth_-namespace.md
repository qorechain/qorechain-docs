---
slug: /api-reference/json-rpc-eth_-namespace
title: JSON-RPC — eth_ 네임스페이스
sidebar_label: JSON-RPC — eth_ 네임스페이스
sidebar_position: 3
---

# JSON-RPC — eth_ 네임스페이스

QoreChain은 완전한 EVM 호환 JSON-RPC 인터페이스를 구현하여, 표준 이더리움 도구(MetaMask, Hardhat, Foundry, ethers.js, web3.js)가 수정 없이 체인과 상호작용할 수 있도록 합니다.

## 연결

| 전송 방식 | 기본 주소               |
| --------- | ----------------------- |
| HTTP      | `http://localhost:8545` |
| WebSocket | `ws://localhost:8546`   |

:::note
EVM JSON-RPC 인터페이스는 **`qorechain-vladi`** 메인넷(EVM 체인 ID **9801**, 16진수 `0x2649`, 체인 버전 **v3.1.82**에서 가동 중)과 **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**, 16진수 `0x2648`)에서 제공됩니다. 위의 로컬 주소는 직접 운영하는 노드에 적용됩니다. 원격 접속의 경우 공급자의 메인넷 또는 테스트넷 엔드포인트로 대체하세요.
:::

## 지원되는 네임스페이스

| 네임스페이스 | 설명                                                                                                          |
| --------- | -------------------------------------------------------------------------------------------------------------- |
| `eth_`    | 핵심 이더리움 JSON-RPC 메서드                                                                                  |
| `web3_`   | 유틸리티 메서드(클라이언트 버전, 해싱)                                                                         |
| `net_`    | 네트워크 상태 메서드                                                                                           |
| `txpool_` | 트랜잭션 풀 검사                                                                                               |
| `qor_`    | QoreChain 전용 확장 기능([qor_ 네임스페이스](/api-reference/json-rpc-qor_-namespace) 참조)                     |

## eth_ 메서드

| 메서드                      | 매개변수                                         | 설명                                                 |
| --------------------------- | ------------------------------------------------ | ---------------------------------------------------- |
| `eth_blockNumber`           | 없음                                             | 최신 블록 번호를 반환합니다                           |
| `eth_getBalance`            | `address`, `blockNumber`                         | 주소의 잔액을 wei 단위로 반환합니다                   |
| `eth_getTransactionCount`   | `address`, `blockNumber`                         | 주소의 nonce(트랜잭션 수)를 반환합니다               |
| `eth_sendRawTransaction`    | `signedTxData`                                   | 브로드캐스트할 서명된 트랜잭션을 제출합니다           |
| `eth_call`                  | `callObject`, `blockNumber`                      | EVM에 대해 읽기 전용 호출을 실행합니다               |
| `eth_estimateGas`           | `callObject`                                     | 트랜잭션에 필요한 가스를 추정합니다                   |
| `eth_getBlockByNumber`      | `blockNumber`, `fullTx` (bool)                   | 번호로 블록 데이터를 반환합니다                       |
| `eth_getTransactionByHash`  | `txHash`                                         | 해시로 트랜잭션 데이터를 반환합니다                   |
| `eth_getTransactionReceipt` | `txHash`                                         | 채굴된 트랜잭션의 영수증을 반환합니다                 |
| `eth_getLogs`               | `filterObject`                                   | 필터와 일치하는 로그를 반환합니다                     |
| `eth_chainId`               | 없음                                             | 체인 ID를 반환합니다(16진수 인코딩)                  |
| `eth_gasPrice`              | 없음                                             | 현재 가스 가격을 wei 단위로 반환합니다               |
| `eth_feeHistory`            | `blockCount`, `newestBlock`, `rewardPercentiles` | 과거 수수료 데이터를 반환합니다(EIP-1559)            |

## web3_ 메서드

| 메서드               | 매개변수     | 설명                                     |
| -------------------- | ------------ | ---------------------------------------- |
| `web3_clientVersion` | 없음         | 클라이언트 버전 문자열을 반환합니다       |
| `web3_sha3`          | `data` (hex) | 입력값의 Keccak-256 해시를 반환합니다     |

## net_ 메서드

| 메서드          | 매개변수   | 설명                                        |
| --------------- | ---------- | ------------------------------------------- |
| `net_version`   | 없음       | 네트워크 ID를 반환합니다                     |
| `net_listening` | 없음       | 노드가 수신 대기 중이면 `true`를 반환합니다  |
| `net_peerCount` | 없음       | 연결된 피어 수를 반환합니다(16진수)         |

## 구성

`app.toml`에서 JSON-RPC 서버를 활성화하고 구성하세요:

```toml
[json-rpc]
# Enable the JSON-RPC server
enable = true

# HTTP server address
address = "0.0.0.0:8545"

# WebSocket server address
ws-address = "0.0.0.0:8546"

# Enabled API namespaces
api = "eth,web3,net,txpool,qor"

# Maximum number of logs returned by eth_getLogs
filter-cap = 10000

# Maximum gas for eth_call and eth_estimateGas
gas-cap = 25000000

# EVM execution timeout
evm-timeout = "5s"

# Transaction fee cap (in QOR)
txfee-cap = 1

# Maximum open WebSocket connections
max-open-connections = 0
```

## 예제

### eth_blockNumber

요청:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_blockNumber",
    "params": [],
    "id": 1
  }'
```

응답:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x53b35"
}
```

### eth_chainId

요청:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_chainId",
    "params": [],
    "id": 2
  }'
```

응답(메인넷 `qorechain-vladi`, 체인 ID 9801):

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": "0x2649"
}
```

`qorechain-diana` 테스트넷(체인 ID 9800)에서 이 메서드는 `"0x2648"`을 반환합니다.

### eth_getBalance

요청:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getBalance",
    "params": ["0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28", "latest"],
    "id": 3
  }'
```

응답:

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": "0x56bc75e2d63100000"
}
```

## ethers.js로 연결하기

```javascript
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("http://localhost:8545");

// Get latest block
const block = await provider.getBlockNumber();
console.log("Latest block:", block);

// Get balance
const balance = await provider.getBalance("0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28");
console.log("Balance:", ethers.formatEther(balance), "QOR");
```

:::info

- 체인 ID는 16진수 문자열로 반환됩니다. 지갑 구성을 위해 10진수로 변환하세요. `0x2649`는 **9801**(메인넷), `0x2648`은 **9800**(테스트넷)입니다.
- 가스 가격 책정은 EIP-1559 모델을 따릅니다. 기본 수수료 및 우선순위 수수료 추정에는 `eth_feeHistory`를 사용하세요.
- 허용되는 블록 태그: `"latest"`, `"earliest"`, `"pending"` 또는 16진수 블록 번호.
- 필터 제한: `eth_getLogs`는 쿼리당 `filter-cap` 결과 수로 제한됩니다(기본값 10,000). 대규모 데이터셋의 경우 더 좁은 블록 범위를 사용하세요.

:::
