---
slug: /sdk/concepts/architecture
title: 아키텍처 및 개념
sidebar_label: 아키텍처
sidebar_position: 1
---

# 아키텍처 및 개념

QoreChain은 세 개의 스마트 컨트랙트 가상 머신을 나란히 실행하며, 공유 계정과
공유 토큰을 갖춘 단일 Layer 1 체인입니다.

## 트리플 VM 모델

| VM | 컨트랙트 | SDK의 클라이언트 표면 |
| --- | --- | --- |
| **CosmWasm** | Rust/Wasm 컨트랙트 | `@qorechain/sdk`의 `client.cosmwasm()` 및 `queryContractSmart` / `execute` 헬퍼 |
| **QoreChain EVM Engine** | Solidity / Vyper | `@qorechain/evm` (viem 어댑터) |
| **SVM** | Solana 프로그램 | `@qorechain/svm` (`@solana/web3.js` 어댑터) |

네이티브(Cosmos) 레이어는 뱅크 전송, 스테이킹, 거버넌스, 그리고 런타임 간
메시지를 라우팅하는 `x/crossvm` 모듈을 처리합니다.

## 읽기 표면

SDK는 여러 엔드포인트를 통해 노드와 통신합니다:

- **Cosmos REST (LCD)** — 뱅크 잔액, 계정 정보, 모듈 쿼리.
- **합의 RPC** — 네이티브 트랜잭션 서명/브로드캐스트 및 CosmWasm 읽기 클라이언트에
  사용.
- **EVM JSON-RPC** — 표준 `eth_*` 호출과 QoreChain `qor_*` 네임스페이스 및 EVM
  프리컴파일.
- **SVM JSON-RPC** — SVM 런타임을 위한 Solana 호환 RPC.

`qor_*` JSON-RPC 네임스페이스는 토크노믹스, PQC 키 상태, 하이브리드 서명 모드,
크로스 VM 메시지, 네트워크 통계 같은 QoreChain 고유 읽기를 노출합니다.
TypeScript에서는 이들이 `client.qor`(`QorClient`)의 타입이 지정된 메서드입니다.
동일한 표면이 Python, Go, Rust SDK에도 존재합니다.

## 토큰 및 디노미네이션

- 표시 토큰: **QOR**.
- 기본 디노미네이션: **uqor**, QOR당 **10^6** 기본 단위.

항상 기본 단위로 금액 계산을 하세요. SDK는 정확한 변환을 제공하므로 부동
소수점으로 정밀도를 잃지 않습니다:

```ts
import { toBase, fromBase } from "@qorechain/sdk";

toBase("1.5");        // "1500000"  (QOR -> uqor)
fromBase("1500000");  // "1.5"      (uqor -> QOR)
```

> 참고: EVM 런타임은 QOR를 18 소수 자릿수로 표현하며(EVM 관례), 이는 Cosmos
> `uqor`의 10^6 기본과는 다릅니다. `@qorechain/evm` 클라이언트는 표시에 기본적으로
> 18 소수 자릿수를 사용합니다. 대상 네트워크에 대한 값을 확인하세요.

## 주소

동일한 키 자료는 세 가지 주소 형식으로 표현될 수 있습니다:

- **native** — `qor` 접두사를 가진 bech32(`qor1…`), 검증자는 `qorvaloper`를
  사용.
- **EVM** — `0x…`, EIP-55 체크섬.
- **SVM** — ed25519 공개 키의 base58.

파생 경로는 [계정 및 PQC 서명](/sdk/concepts/accounts-pqc)을 참조하세요.

## 크로스 VM

QoreChain의 `x/crossvm` 모듈은 한 VM의 컨트랙트가 다른 VM의 액션을 트리거할 수
있게 합니다. EVM→네이티브 경로는 **크로스 VM 브리지 프리컴파일**(`@qorechain/evm`)을
통해 온체인에서 실행되며, SDK는 타입이 지정된 REST 읽기 헬퍼(`getCrossVmMessage`,
`getPendingCrossVmMessages`, `getCrossVmParams`)와 메시지 상태를 추적하는
`client.qor.getCrossVMMessage(...)`를 제공합니다.
[크로스 VM 가이드](/sdk/guides/cross-vm)를 참조하세요.
