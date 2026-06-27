---
slug: /dashboard/overview
title: 대시보드 개요 및 시작하기
sidebar_label: 개요 및 시작하기
sidebar_position: 1
---

# 대시보드 개요 및 시작하기

**[dashboard.qorechain.io](https://dashboard.qorechain.io)**의 QoreChain 대시보드는 브라우저에서 QoreChain을 사용하기 위한 공식 웹 앱입니다. 한 곳에서 체인을 탐색하고, 지갑을 관리하고, 토큰을 스왑하고, 체인 간에 자산을 이동하고, 스마트 컨트랙트를 생성 및 감사하고, 검증자에게 스테이킹하고, 테스트넷 토큰을 청구하고, 퀘스트를 완료하고, 네트워크의 도구에 접근할 수 있습니다.

이 섹션의 모든 내용은 사용자 사용법입니다: 각 페이지가 무엇을 하는지, 그리고 어떻게 사용하는지를 다룹니다. 설치가 필요하지 않습니다 — 대시보드는 전적으로 브라우저에서 실행됩니다.

## 할 수 있는 일

| 영역 | 용도 |
| --- | --- |
| **[익스플로러](/dashboard/explorer)** | 블록, 트랜잭션, 주소, 검증자를 탐색합니다. |
| **[지갑](/dashboard/wallet)** | 잔액을 확인하고, QOR를 송금 및 수신하고, 주소를 관리합니다. |
| **[트레이드](/dashboard/trade)** | 온체인 AMM에서 토큰을 스왑하고 유동성을 공급합니다. |
| **[브리지](/dashboard/bridge)** | QoreChain과 다른 체인 간에 자산을 이동합니다. |
| **[스마트 컨트랙트 생성기](/dashboard/smart-contract-creator)** | **QCAI**로 17개의 지원 블록체인에서 스마트 컨트랙트를 생성합니다. |
| **[컨트랙트 감사기](/dashboard/contract-auditor)** | 스마트 컨트랙트에 대해 **QCAI** 보안 분석을 실행합니다. |
| **[스테이킹 및 검증자](/dashboard/staking-and-validators)** | 검증자를 검토하고 QOR를 위임합니다. |
| **[포셋](/dashboard/faucet)** | 테스트넷에서 테스트 토큰을 요청합니다. |
| **[퀘스트](/dashboard/quests)** | 가이드된 작업을 완료하여 네트워크를 배웁니다. |
| **[도구 허브](/dashboard/tools-hub)** | 노드, 롤업, SDK, 라이선싱 도구에 접근합니다. |

## 지갑 연결 {#connect-your-wallet}

온체인 상태를 변경하는 대부분의 작업 — 토큰 송금, 스왑, 스테이킹, 브리징 — 에는 연결된 지갑이 필요합니다.

1. [dashboard.qorechain.io](https://dashboard.qorechain.io)를 엽니다.
2. **지갑 연결(Connect Wallet)**을 선택합니다.
3. 지갑에서 연결을 승인합니다.

연결되면 대시보드는 헤더에 (축약된 형태로) 주소를 표시하고 서명이 필요한 작업을 잠금 해제합니다. 익스플로러와 같은 읽기 전용 페이지는 연결 없이 작동합니다.

QoreChain 계정은 `qor` bech32 접두사를 사용하므로 연결된 주소는 `qor1...`처럼 보입니다. 계정은 양자 안전 암호화로 보호됩니다. 최초 설정 안내는 [지갑 설정](/getting-started/wallet-setup)을 참조하세요.

## 네트워크 선택

대시보드는 두 개의 네트워크에 대해 작동합니다. 헤더는 현재 연결된 네트워크를 보여줍니다.

| 네트워크 | 체인 ID | 사용 시점 |
| --- | --- | --- |
| **메인넷** | `qorechain-vladi` | 실제 가치와 프로덕션 사용을 위한 라이브 네트워크입니다. |
| **테스트넷** | `qorechain-diana` | 테스트 토큰을 위한 [포셋](/dashboard/faucet)이 있는, 테스트를 위한 무료 환경입니다. |

네이티브 토큰은 **QOR**(기본 단위 `uqor`, 여기서 1 QOR = 10^6 uqor)입니다. 처음 사용하는 경우, 테스트넷에서 시작하여 포셋에서 토큰을 청구하고 메인넷으로 이동하기 전에 첫 전송을 시도해 보세요.

:::tip QoreChain이 처음이신가요?
[테스트넷 연결하기](/getting-started/connecting-to-testnet)와 [첫 트랜잭션](/getting-started/first-transaction)을 따라 빠르게 직접 해본 다음, 다시 돌아와 나머지 대시보드를 살펴보세요.
:::

## 관련 항목

* [익스플로러](/dashboard/explorer) — 블록, 트랜잭션, 계정을 탐색합니다.
* [지갑](/dashboard/wallet) — 계정을 관리하고 트랜잭션을 전송합니다.
* [트레이드 / DEX](/dashboard/trade) — 온체인 AMM 풀에 대해 토큰을 스왑합니다.
* [브리지](/dashboard/bridge) — 체인 간에 자산을 이동합니다.
* [도구 허브](/dashboard/tools-hub) — 라이선스, 포셋, 그리고 개발자 유틸리티입니다.
