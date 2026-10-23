---
slug: /api-reference/json-rpc-eth_-namespace
title: JSON-RPC — eth_ 네임스페이스
sidebar_label: JSON-RPC — eth_ 네임스페이스
sidebar_position: 3
---

# JSON-RPC — eth_ 네임스페이스

QoreChain은 EVM 호환 JSON-RPC 인터페이스를 구현하여, 표준 이더리움 도구(MetaMask, Hardhat, Foundry, ethers.js, web3.js)가 별도의 수정 없이 체인 상태를 읽고 가스를 추정할 수 있도록 합니다. **EVM 레인에서 트랜잭션을 보내려면** 체인 버전 v3.2.0부터 **추가 단계가 하나 필요합니다**: 보내는 계정에 등록된 양자내성 키와 열려 있는 EVM 승인 윈도우가 있어야 합니다([트랜잭션 전송](#sending-transactions) 참조).

## 연결

| 전송 방식 | 기본 주소                |
| --------- | ----------------------- |
| HTTP      | `http://localhost:8545` |
| WebSocket | `ws://localhost:8546`   |

:::note
EVM JSON-RPC 인터페이스는 **`qorechain-vladi`** 메인넷(EVM 체인 ID **9801**, 16진수 `0x2649`, 노드 릴리스 **v3.2.4**, 2026년 10월 23일부터, 2026년 6월 7일부터 운영 중)과 **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**, 16진수 `0x2648`, 노드 릴리스 **v3.2.4**, 2026년 10월 19일부터)에서 제공됩니다. 위의 로컬 주소는 직접 실행하는 노드에 적용됩니다. 공개 HTTP 엔드포인트는 `https://evm.qore.host`(메인넷)와 `https://evm-testnet.qore.host`(테스트넷)이며, [네트워크](/appendix/networks#public-endpoints)에 나열되어 있습니다. 공개 EVM WebSocket은 테스트넷 것(`wss://evm-ws-testnet.qore.host`)뿐이며, 공개 메인넷 EVM WebSocket은 없습니다.
:::

## 지원되는 네임스페이스

| 네임스페이스 | 설명                                                                                                    |
| --------- | -------------------------------------------------------------------------------------------------------------- |
| `eth_`    | 핵심 이더리움 JSON-RPC 메서드                                                                                 |
| `web3_`   | 유틸리티 메서드(클라이언트 버전, 해싱)                                                                      |
| `net_`    | 네트워크 상태 메서드                                                                                         |
| `txpool_` | 트랜잭션 풀 조회                                                                                    |
| `rpc_`    | 서버 자체 조회(`rpc_modules`)                                                                           |

## eth_ 메서드

| 메서드                      | 매개변수                                       | 설명                                          |
| --------------------------- | ------------------------------------------------ | ---------------------------------------------------- |
| `eth_blockNumber`           | 없음                                             | 최신 블록 번호를 반환합니다                      |
| `eth_getBalance`            | `address`, `blockNumber`                         | 특정 주소의 잔액을 wei 단위로 반환합니다             |
| `eth_getTransactionCount`   | `address`, `blockNumber`                         | 특정 주소의 논스(트랜잭션 수)를 반환합니다 |
| `eth_sendRawTransaction`    | `signedTxData`                                   | 서명된 트랜잭션을 브로드캐스트용으로 제출합니다           |
| `eth_call`                  | `callObject`, `blockNumber`                      | EVM에 대해 읽기 전용 호출을 실행합니다             |
| `eth_estimateGas`           | `callObject`                                     | 트랜잭션에 필요한 가스를 추정합니다         |
| `eth_getBlockByNumber`      | `blockNumber`, `fullTx` (bool)                   | 번호로 블록 데이터를 반환합니다                 |
| `eth_getTransactionByHash`  | `txHash`                                         | 해시로 트랜잭션 데이터를 반환합니다               |
| `eth_getTransactionReceipt` | `txHash`                                         | 채굴(생성)된 트랜잭션의 영수증을 반환합니다          |
| `eth_getLogs`               | `filterObject`                                   | 필터와 일치하는 로그를 반환합니다                    |
| `eth_chainId`               | 없음                                             | 체인 ID를 반환합니다(16진수 인코딩)                   |
| `eth_gasPrice`              | 없음                                             | 현재 가스 가격을 wei 단위로 반환합니다                 |
| `eth_feeHistory`            | `blockCount`, `newestBlock`, `rewardPercentiles` | 과거 수수료 데이터를 반환합니다(EIP-1559)               |
| `eth_getBlockByHash`        | `blockHash`, `fullTx` (bool)                     | 해시로 블록 데이터를 반환합니다                 |
| `eth_getCode`               | `address`, `blockNumber`                         | 컨트랙트 바이트코드를 반환합니다                   |
| `eth_getStorageAt`          | `address`, `slot`, `blockNumber`                 | 스토리지 슬롯을 반환합니다                 |
| `eth_getBlockReceipts`      | `blockNumber`                                    | 블록의 모든 영수증을 반환합니다                   |
| `eth_getProof`              | `address`, `storageKeys`, `blockNumber`          | 계정 증명을 반환합니다                 |
| `eth_createAccessList`      | `callObject`, `blockNumber`                      | 호출에 대한 액세스 리스트를 생성합니다                 |
| `eth_maxPriorityFeePerGas`  | 없음                                             | 권장 우선 수수료를 반환합니다(wei)             |
| `eth_syncing`               | 없음                                             | 노드가 따라잡았으면 `false`를 반환합니다                 |
| `eth_newFilter`, `eth_newBlockFilter`, `eth_getFilterChanges` | 필터 객체 / 필터 ID | 폴링 필터                              |

## web3_ 메서드

| 메서드               | 매개변수   | 설명                              |
| -------------------- | ------------ | ---------------------------------------- |
| `web3_clientVersion` | 없음         | 클라이언트 버전 문자열을 반환합니다        |
| `web3_sha3`          | `data` (hex) | 입력값의 Keccak-256 해시를 반환합니다 |

## txpool_ 메서드

| 메서드           | 매개변수 | 설명                                                         |
| ---------------- | ---------- | ------------------------------------------------------------------- |
| `txpool_status`  | 없음       | 대기 중 및 큐에 있는 트랜잭션 수를 반환합니다               |
| `txpool_content` | 없음       | 대기 중 및 큐에 있는 트랜잭션을 반환합니다(공개 엔드포인트에서는 사용 불가) |
| `txpool_inspect` | 없음       | 풀의 요약을 반환합니다(공개 엔드포인트에서는 사용 불가)         |

## net_ 메서드

| 메서드          | 매개변수 | 설명                                 |
| --------------- | ---------- | ------------------------------------------- |
| `net_version`   | 없음       | 네트워크 ID를 반환합니다                      |
| `net_listening` | 없음       | 노드가 리스닝 중이면 `true`를 반환합니다     |
| `net_peerCount` | 없음       | 연결된 피어 수를 반환합니다(16진수) |

## 설정

`app.toml`에서 JSON-RPC 서버를 활성화하고 설정합니다.

```toml
[json-rpc]
# Enable the JSON-RPC server
enable = true

# HTTP server address
address = "0.0.0.0:8545"

# WebSocket server address
ws-address = "0.0.0.0:8546"

# Enabled API namespaces (a node initialised by v3.2.3 or later defaults to "eth,net,web3";
# txpool is opt-in because it publishes the node's pending transactions)
api = "eth,web3,net,txpool"

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

## 공개 엔드포인트의 제한 {#public-limits}

:::note
- `eth_getLogs`는 `fromBlock`과 `toBlock` 사이에 최대 **10,000블록**까지만 허용합니다. 더 넓은 범위는 `{"code":-32000,"message":"maximum [from, to] blocks distance: 10000"}`를 반환합니다. 10,000블록 이하의 구간으로 나누어 조회하세요. 별도의 `filter-cap` 설정은 반환되는 로그 수를 제한합니다.
- `txpool_status`는 공개 엔드포인트에서 동작합니다. `txpool_content`와 `txpool_inspect`는 공개 메인넷과 공개 테스트넷 엔드포인트 모두에서 비활성화되어 있습니다(`api` 목록에 `txpool`이 있는 직접 실행 노드에서는 동작합니다).
- `debug_*` 메서드와 `eth_signTransaction`은 사용할 수 없습니다.
- `eth_subscribe`에는 WebSocket 연결이 필요합니다. HTTP에서는 `-32601 notifications not supported`를 반환합니다. [WebSocket 이벤트](/api-reference/websocket-events)를 참조하세요.
- 공개 엔드포인트에서는 오래된 높이의 상태가 프루닝되므로, 먼 과거 블록에 대한 `eth_call`은 상태 버전 오류로 실패할 수 있습니다.
- 스크립트가 `403 Forbidden`을 받으면 명시적인 `User-Agent` 헤더를 설정하세요. Python의 기본 `urllib` 에이전트는 차단되며, `requests`, `curl`, Node, Go 클라이언트는 그대로 동작합니다.
:::

## 트랜잭션 전송 {#sending-transactions}

:::caution EVM 레인에는 PQC 키와 열린 윈도우가 필요합니다
체인 버전 v3.2.0부터 EVM 레인은 **등록된 양자내성 키**와 **열려 있는 EVM 승인 윈도우**가 있는 계정의 트랜잭션(컨트랙트 배포를 포함한 `MsgEthereumTx`)만 수락합니다. 이 설정을 마치지 않은 일반 EVM 지갑은 트랜잭션을 제출할 수 없습니다: 노드는 해당 트랜잭션을 포함하지 않고 `pqc` 모듈 오류(코드 26, 27 또는 28)로 거부합니다. 잔액 조회, `eth_call` 호출, 가스 추정에는 윈도우가 필요하지 않습니다. v3.2.2부터는 **체인 ID 없이** 서명된(EIP-155 이전 방식) 트랜잭션도 거부되며, v3.2.3부터는 윈도우의 범위를 일반 QOR 전송(`native_only`) 또는 지정한 수신자(`allowed_targets`)로 제한할 수 있습니다. 범위를 벗어난 트랜잭션은 코드 27로 거부됩니다.

전송하기 전에 계정을 확인하세요:

- `GET /qorechain/pqc/v1/account/{address}` (`found: true`는 키가 등록되어 있음을 의미)
- `GET /qorechain/pqc/v1/evm_window/{address}` (`live: true`는 현재 윈도우가 트랜잭션을 허용하고 있음을 의미)

두 엔드포인트 모두 [REST / gRPC 엔드포인트](/api-reference/rest-grpc-endpoints#pqc-module)에 설명되어 있습니다(윈도우 응답에는 `native_only`와 `allowed_targets`도 함께 표시됩니다). 윈도우는 이더리움 트랜잭션이 아니라 QoreChain 트랜잭션(`MsgOpenEVMWindow`, 최대 17,280블록 및 1,000개 트랜잭션과 값 상한으로 제한됨)으로 엽니다. 레인 개요는 [EVM 개발](/developer-guide/evm-development)을 참조하세요.
:::

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
  "result": "0x37f559"
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

`qorechain-diana` 테스트넷(체인 ID 9800)에서는 이 메서드가 `"0x2648"`을 반환합니다.

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

- 체인 ID는 16진수 문자열로 반환됩니다. 지갑 설정을 위해 10진수로 변환하세요 — `0x2649`는 **9801**(메인넷), `0x2648`은 **9800**(테스트넷)입니다.
- 가스 가격 책정은 EIP-1559 모델을 따릅니다. 기본 수수료 및 우선 수수료 추정에는 `eth_feeHistory`를 사용하세요.
- 허용되는 블록 태그: `"latest"`, `"earliest"`, `"pending"`, 또는 16진수 블록 번호.
- 필터 제한 사항: `eth_getLogs`는 쿼리당 `filter-cap` 결과 수로 제한되며(기본값 10,000), 공개 엔드포인트는 10,000블록보다 넓은 범위를 거부합니다. 대용량 데이터셋의 경우 더 좁은 블록 범위를 사용하세요.

:::
