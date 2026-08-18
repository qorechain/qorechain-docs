---
slug: /qorex/overview
title: QoreX 지갑
sidebar_label: 개요
sidebar_position: 1
---

# QoreX 지갑

**QoreX**는 양자 내성 레이어 1인 **QoreChain**(메인넷 `qorechain-vladi`)의 공식 **비수탁형** 지갑입니다. 개인 키는 **사용자의 기기에서만** 생성되고 저장됩니다 — QoreChain Association은 사용자의 자금에 접근할 수 없으며, 앱은 **어떠한 데이터도 수집하지 않습니다**. Native 레인의 모든 QOR 전송에는 **하이브리드 포스트 퀀텀 서명**(ML-DSA-87, NIST FIPS-204, secp256k1과 결합)이 포함되므로, 자금이 고전적 공격자와 양자 공격자 모두로부터 보호됩니다.

QoreX는 함께 작동하는 두 부분으로 구성됩니다:

- **브라우저 확장 프로그램** — 데스크톱 지갑으로, **Chrome, Firefox, Safari(macOS)에서 공개적으로 서비스 중**입니다. 독립 실행형 지갑(생성/가져오기, QOR 보관 및 전송)이자, 모든 웹사이트가 QoreX를 발견하고 모든 요청을 명시적인 승인 절차로 전환하도록 해주는 커넥터입니다. [브라우저 확장 프로그램](/qorex/browser-extension)을 참고하세요.
- **모바일 앱**(Android 및 iOS) — 완전한 형태의 지갑입니다: 생성/복원, 양자 내성 QOR 송수신, 외부 네트워크, 스테이킹, 포트폴리오, 복구, 그리고 앱 내 dApp 브라우저를 제공합니다. Android는 **Google Play**에서, iOS는 TestFlight에서 제공됩니다(아래 이용 가능 여부 참고).

## 플랫폼별 이용 가능 여부

| 기능 | 모바일 앱 (Android 및 iOS) | 브라우저 확장 프로그램 |
|---|---|---|
| 지갑 생성 / 가져오기 | ✅ | ✅ (독립 실행형) |
| QOR 송수신 (포스트 퀀텀) | ✅ | ✅ (팝업에서) |
| 외부 네트워크 (Ethereum, BNB Chain, Polygon, Arbitrum, Solana, Cosmos Hub, Osmosis, Celestia + 토큰) | ✅ | ✅ (팝업에서 전송) |
| 스테이킹, 포트폴리오, Q-Day Scanner, 복구, Legacy | ✅ | — |
| dApp 연결 | ✅ (인앱 브라우저) | ✅ (모든 웹사이트) |
| 계정 (@handle, 결제 요청) | ✅ | — |
| 다중 기기 연결 | ✅ | — |
| Dashboard 페어링 | ✅ | ✅ (연결 + 제안된 전송, v0.1.5) |

## QoreX가 다른 이유

- **기본적으로 양자 내성** — Native 레인의 QOR 전송에는 항상 ML-DSA-87 + secp256k1 하이브리드 서명이 포함됩니다. 고전적 방식(외부 체인)은 명확하게 표시되며, 결코 조용히 처리되지 않습니다.
- **진정한 비수탁형** — 키는 기기에서 생성되어 하드웨어 기반 볼트(iOS의 Secure Enclave, Android의 StrongBox) 또는 암호화된 볼트(확장 프로그램)에 보관됩니다. 키는 절대 기기를 벗어나지 않습니다.
- **데이터 수집 없음** — 어떤 QoreX 앱에도 분석, 추적, 광고가 없습니다. 선택적인 계정 로그인은 편의 기능을 더해 주지만([계정 및 Dashboard](/qorex/account-and-dashboard) 참고), 지갑이 이에 의존하지는 않습니다.
- **하나로 통합된 잔액** — 보유한 QOR은 Native, EVM, SVM 레인 전체에 걸쳐 하나의 잔액이며, QoreX는 이를 단일 수치로 보여줍니다.
- **다양한 복구 경로** — 24단어 복구 문구(항상 제공), 보증인과 48시간 타임락을 활용하는 선택적 소셜 복구, 선택적 Legacy 상속, 그리고 편리한 다중 기기 연결을 지원합니다.

## 시작하기

- QoreX가 처음이신가요? [시작하기](/qorex/getting-started)에서 지갑을 생성하거나 복원하세요.
- 그다음 양자 내성 QOR을 [송수신](/qorex/send-and-receive)하는 방법을 익히세요.
- [보안 및 복구](/qorex/security-and-recovery)에서 안전장치를 설정하세요.
- 데스크톱에서는 [브라우저 확장 프로그램](/qorex/browser-extension)을 설치하세요.

:::note 다운로드 및 이용 가능 여부
- **브라우저 확장 프로그램** — 공개적으로 서비스 중입니다: [Chrome Web Store, Firefox Add-ons 또는 Mac App Store (Safari)](/qorex/browser-extension#install)에서 설치하세요.
- **Android 앱** — Google Play에서 이용할 수 있습니다: https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS 앱** — **TestFlight**를 통해 테스트용으로 이용할 수 있습니다: https://testflight.apple.com/join/Xa9D7vgR — App Store 출시는 아직 심사 중입니다.

QoreX는 반드시 공식 스토어 등록 페이지에서만 설치하세요.
:::
