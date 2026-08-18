---
slug: /qorex/overview
title: QoreX 지갑
sidebar_label: 개요
sidebar_position: 1
---

# QoreX 지갑

**QoreX**는 양자 내성 Layer 1인 **QoreChain**(메인넷 `qorechain-vladi`)의 공식 **비수탁형** 지갑입니다. 개인 키는 **오직 사용자의 기기에서만** 생성되고 저장됩니다. QoreChain Association은 사용자의 자금에 절대 접근할 수 없으며, 앱은 **어떠한 데이터도 수집하지 않습니다**. Native 레인에서 이루어지는 모든 QOR 전송에는 **하이브리드 포스트 양자 서명**(ML-DSA-87, NIST FIPS-204, secp256k1과 결합)이 실리므로, 사용자의 자금은 고전적 공격자와 양자 공격자 양쪽 모두로부터 보호됩니다.

QoreX는 함께 작동하는 두 가지 부분으로 구성됩니다.

- **브라우저 확장 프로그램** — 데스크톱 지갑으로, **Chrome, Firefox, Safari(macOS)에서 정식 출시되어 공개**되어 있습니다. 이는 독립형 지갑(생성/가져오기, QOR 보관 및 전송)이자, 어떤 웹사이트든 QoreX를 발견하고 모든 요청을 명시적 승인으로 전환하도록 해주는 커넥터입니다. [브라우저 확장 프로그램](/qorex/browser-extension)을 참조하세요.
- **모바일 앱**(Android 및 iOS) — 생성/복원, 양자 내성 QOR 송수신, 외부 네트워크, 스테이킹, 포트폴리오, 복구, 인앱 dApp 브라우저를 갖춘 완전한 지갑입니다. 현재 공개 테스트 중입니다(아래 이용 가능 여부 참조).

## 플랫폼별 이용 가능 여부

| 기능 | 모바일 앱 (Android 및 iOS) | 브라우저 확장 프로그램 |
|---|---|---|
| 지갑 생성 / 가져오기 | ✅ | ✅ (독립형) |
| QOR 송수신 (포스트 양자) | ✅ | ✅ (팝업에서) |
| 외부 네트워크 (ETH / BNB / POL / ARB / SOL + 토큰) | ✅ | dApp 서명을 통해 |
| 스테이킹, 포트폴리오, Q-Day 스캐너, 복구, Legacy | ✅ | — |
| dApp 연결 | ✅ (인앱 브라우저) | ✅ (모든 웹사이트) |
| 계정 (@handle, 결제 요청) | ✅ | — |
| 다중 기기 연동 | ✅ | — |
| 대시보드 페어링 | ✅ | ✅ (연결 + 제안된 전송, v0.1.5) |

## QoreX가 다른 이유

- **기본값으로 양자 내성** — Native 레인의 QOR 전송에는 항상 ML-DSA-87 + secp256k1 하이브리드 서명이 실립니다. 고전적인 요소(외부 체인)는 명확하게 표시되며, 절대 조용히 처리되지 않습니다.
- **진정한 비수탁형** — 키는 기기에서 생성되어 하드웨어 기반 볼트(iOS의 Secure Enclave, Android의 StrongBox) 또는 암호화된 볼트(확장 프로그램) 안에 보관됩니다. 키는 절대 사용자의 기기를 떠나지 않습니다.
- **데이터 미수집** — 어떤 QoreX 앱에도 분석, 추적, 광고가 없습니다. 선택적 계정 로그인은 편의 기능을 추가하지만([계정 및 대시보드](/qorex/account-and-dashboard) 참조), 지갑은 결코 그것에 의존하지 않습니다.
- **하나로 통합된 잔액** — 사용자의 QOR는 Native, EVM, SVM 레인 전체에서 하나의 잔액이며, QoreX는 이를 단일 수치로 보여줍니다.
- **다양한 복구 경로** — 24단어 복구 문구(항상 제공), 가디언과 48시간 타임락을 활용하는 선택적 소셜 복구, 선택적 Legacy 상속, 그리고 편리한 다중 기기 연동.

## 시작하기

- QoreX가 처음이신가요? [시작하기](/qorex/getting-started)에서 지갑을 생성하거나 복원하는 것부터 시작하세요.
- 그런 다음 양자 내성 QOR을 [송수신](/qorex/send-and-receive)하는 방법을 익히세요.
- [보안 및 복구](/qorex/security-and-recovery)에서 안전 장치를 설정하세요.
- 데스크톱에서는 [브라우저 확장 프로그램](/qorex/browser-extension)을 설치하세요.

:::note 다운로드 및 이용 가능 여부
- **브라우저 확장 프로그램** — 정식 출시되어 공개됨: [Chrome Web Store, Firefox Add-ons, 또는 Mac App Store(Safari)](/qorex/browser-extension#install)에서 설치하세요.
- **Android 앱** — Google Play에서 **공개 테스트**용으로 이용할 수 있습니다.
- **iOS 앱** — 사용해 보고 싶으시다면 **TestFlight**를 통해 테스트용으로 이용할 수 있습니다.

현재의 공식 링크는 [qorechain.io](https://qorechain.io)에서 확인하시고, QoreX는 반드시 공식 등록처에서만 설치하세요.
:::
