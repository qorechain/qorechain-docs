---
slug: /qorex/overview
title: QoreX 지갑
sidebar_label: 개요
sidebar_position: 1
---

# QoreX 지갑

**QoreX**는 양자 내성 Layer 1(메인넷 `qorechain-vladi`)인 **QoreChain**의 공식 **비수탁형** 지갑입니다. 개인 키는 **오직 사용자의 기기에서만** 생성되고 저장됩니다 — QoreChain Association은 사용자의 자금에 절대 접근할 수 없으며, 앱은 **어떠한 데이터도** 수집하지 않습니다. Native 레인의 모든 QOR 전송에는 **하이브리드 포스트 양자 서명**(ML-DSA-87, NIST FIPS-204, secp256k1과 결합)이 적용되므로, 사용자의 자금은 고전적 공격자와 양자 공격자 모두로부터 보호됩니다.

QoreX는 함께 작동하는 두 부분으로 구성됩니다:

- **모바일 앱**(iOS 및 Android) — 완전한 지갑: 생성/복구, 양자 내성 QOR 송수신, 외부 네트워크, 스테이킹, 포트폴리오, 복구, 그리고 인앱 dApp 브라우저.
- **브라우저 확장 프로그램**(Chrome 및 Firefox, 동일한 코드베이스로 Safari 지원) — 데스크톱용 dApp 커넥터: 웹사이트가 사용자의 지갑을 발견할 수 있게 하고, 모든 요청을 명시적인 승인으로 전환합니다.

## 플랫폼 지원

| 기능 | iOS/Android 앱 | Chrome/Firefox 확장 프로그램 |
|---|---|---|
| 지갑 생성 / 복구 / 연결 | ✅ | — (앱과 페어링) |
| QOR 송수신 (포스트 양자) | ✅ | dApp 서명을 통해 |
| 외부 네트워크 (ETH / BNB / POL / ARB / SOL + 토큰) | ✅ | ✅ (팝업에서 전송) |
| 스테이킹, 포트폴리오, Q-Day Scanner, 복구, Legacy | ✅ | — |
| dApp 연결 | ✅ (인앱 브라우저) | ✅ (모든 웹사이트) |
| 계정 (@handle, 결제 요청, Dashboard 연결) | ✅ | — |

## QoreX가 다른 이유

- **기본적으로 양자 내성** — Native 레인의 QOR 전송에는 항상 ML-DSA-87 + secp256k1 하이브리드 서명이 적용됩니다. 고전적인 것(외부 체인)은 명확하게 표시되며, 절대 조용히 처리되지 않습니다.
- **진정한 비수탁형** — 키는 기기 내에서 생성되어 하드웨어 기반 보관소(iOS의 Secure Enclave, Android의 StrongBox) 또는 암호화된 보관소(확장 프로그램)에 저장됩니다. 키는 절대 기기를 벗어나지 않습니다.
- **데이터 미수집** — 모든 QoreX 앱에는 분석, 추적 또는 광고가 없습니다. 선택적 계정 로그인은 편의 기능을 추가하지만(자세한 내용은 [계정 및 Dashboard](/qorex/account-and-dashboard) 참조), 지갑은 이에 절대 의존하지 않습니다.
- **하나의 통합 잔액** — 사용자의 QOR은 Native, EVM, SVM 레인 전체에 걸쳐 하나의 잔액이며, QoreX는 이를 단일 수치로 표시합니다.
- **다양한 복구 경로** — 24단어 복구 문구(항상), 보호자와 48시간 타임락을 사용하는 선택적 소셜 복구, 선택적 Legacy 상속, 그리고 편리한 다중 기기 연결.

## 시작하기

- QoreX가 처음이신가요? [시작하기](/qorex/getting-started)부터 시작하여 지갑을 생성하거나 복구하세요.
- 그런 다음 양자 내성 QOR을 [송수신](/qorex/send-and-receive)하는 방법을 배우세요.
- [보안 및 복구](/qorex/security-and-recovery)에서 안전망을 설정하세요.
- 데스크톱에서는 [브라우저 확장 프로그램](/qorex/browser-extension)을 설치하세요.

:::note 다운로드 및 지원
QoreX **1.0**이 앱 스토어 전반에 걸쳐 출시되고 있습니다 — iOS 및 Android 앱(App Store 및 Google Play)과 브라우저 확장 프로그램(Chrome Web Store, Firefox Add-ons, 그리고 Safari 빌드). 일부 대상은 특정 시점에 스토어의 검토 대기열에 있을 수 있습니다. 항상 [qorechain.io](https://qorechain.io)에서 현재의 공식 다운로드 링크를 찾고, 공식 스토어 목록에서만 QoreX를 설치하세요.
:::
