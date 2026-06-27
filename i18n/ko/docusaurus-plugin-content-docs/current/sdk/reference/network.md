---
slug: /sdk/reference/network
title: 네트워크 및 엔드포인트
sidebar_label: 네트워크 및 엔드포인트
sidebar_position: 1
---

# 네트워크 및 엔드포인트 참조

## 메인넷

| 필드 | 값 |
| --- | --- |
| 네트워크 프리셋 | `mainnet` |
| 체인 id | `qorechain-vladi` (가동 중) |
| 표시 토큰 | `QOR` |
| 기본 단위 | `uqor` |
| QOR당 기본 단위 수 | `10^6` |
| 계정 bech32 접두사 | `qor` |
| 검증자 bech32 접두사 | `qorvaloper` |

## 테스트넷

| 필드 | 값 |
| --- | --- |
| 네트워크 프리셋 | `testnet` |
| 체인 id | `qorechain-diana` (가동 중) |
| 표시 토큰 | `QOR` |
| 기본 단위 | `uqor` |
| QOR당 기본 단위 수 | `10^6` |
| 계정 bech32 접두사 | `qor` |
| 검증자 bech32 접두사 | `qorvaloper` |

## 기본 포트

`createClient()`는 기본적으로 다음 localhost 포트를 사용합니다. 실제 노드를
가리키려면 `endpoints`를 재정의하세요.

| 엔드포인트 | 포트 | 용도 |
| --- | --- | --- |
| Cosmos REST (LCD) | `1317` | bank 잔액, 계정 정보, 모듈 쿼리 |
| gRPC | `9090` | gRPC 쿼리 |
| Consensus RPC | `26657` | native tx 서명/브로드캐스트, CosmWasm 읽기 |
| EVM JSON-RPC | `8545` | `eth_*`, `qor_*`, 프리컴파일 |
| EVM JSON-RPC (WS) | `8546` | EVM WebSocket 구독 |
| SVM JSON-RPC | `8899` | Solana 호환 RPC |

명시적 엔드포인트를 사용하는 예:

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  endpoints: {
    rest: "https://rest.testnet.example",   // REST (LCD)
    rpc: "https://rpc.testnet.example",      // consensus RPC
    evmRpc: "https://evm.testnet.example",   // EVM + qor_ JSON-RPC
    evmWs: "wss://evm.testnet.example",      // EVM WebSocket
  },
});
```

SDK는 네트워크를 프로그래밍 방식으로 나열하고 해석할 수 있도록 네트워크 프리셋과
lookup 헬퍼(networks 모듈에서 익스포트됨)를 노출합니다. Python/Go/Rust에서
이에 해당하는 것은 `create_client` / `CreateClient` / `ClientBuilder`와
`networks` 모듈입니다.

## 메인넷 대상으로 지정하기

두 프리셋 모두 동일한 localhost 기본값을 제공합니다. `mainnet`을 선택하고
엔드포인트를 노드 URL로 재정의하세요:

```ts
const main = createClient({
  network: "mainnet",       // chain id qorechain-vladi
  endpoints: {
    rest: "https://rest.mainnet.example",
    rpc: "https://rpc.mainnet.example",
    evmRpc: "https://evm.mainnet.example",
  },
});
```
