---
slug: /qorex/overview
title: QoreX 지갑
sidebar_label: 개요
sidebar_position: 1
---

# QoreX 지갑

**QoreX**는 양자내성 레이어 1인 **QoreChain**(메인넷 `qorechain-vladi`)의 공식 **비수탁형(non-custodial)** 지갑입니다. 개인 키는 **오직 사용자의 기기에서만** 생성되고 저장되며 — QoreChain Association은 사용자의 자금에 절대 접근할 수 없고 앱은 **어떠한 데이터도 수집하지 않습니다**. Native 레인의 모든 QOR 전송에는 **하이브리드 포스트양자 서명**(ML-DSA-87, NIST FIPS-204, secp256k1과 결합)이 포함되어, 사용자의 자금은 고전적 공격자와 양자 공격자 모두로부터 보호됩니다.

QoreX는 함께 동작하는 두 부분으로 구성됩니다.

- **브라우저 확장 프로그램** — 데스크톱 지갑으로, **Chrome, Firefox, Safari(macOS)에서 정식 공개(live) 서비스 중**입니다. 독립형 지갑(생성/가져오기, QOR 보유 및 전송)이자, 모든 웹사이트가 QoreX를 인식하고 모든 요청을 명시적 승인으로 전환할 수 있게 해주는 커넥터입니다. [브라우저 확장 프로그램](/qorex/browser-extension) 참고.
- **모바일 앱**(Android 및 iOS) — 완전한 지갑 기능: 생성/복원, 양자내성 QOR 송수신, 외부 네트워크, 스테이킹, 포트폴리오, 복구, 그리고 앱 내 dApp 브라우저. Android는 **Google Play**에서, iOS는 **App Store**에서 제공됩니다(아래 이용 가능 여부 참고).

## 플랫폼별 이용 가능 여부 {#platform-availability}

| 기능 | 모바일 앱(Android & iOS) | 브라우저 확장 프로그램 |
|---|---|---|
| 지갑 생성 / 가져오기 | ✅ | ✅ (독립형) |
| 하나의 복구 구문으로 여러 계정 사용 | ✅ (최대 20개) | ✅ *(0.2.2부터)* |
| QOR 송수신 (포스트양자) | ✅ | ✅ (팝업에서, 수신 QR 포함) |
| @핸들 결제 / 청구 | ✅ | ✅ |
| 스테이킹 (위임, 위임 해제, 청구) | ✅ | ✅ *(0.2.2부터 — 자체 Stake 화면 제공, Dashboard가 전달하는 스테이킹 요청도 승인 가능)* |
| 외부 네트워크(Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + 토큰) | ✅ | ✅ (팝업에서 전송) |
| 인터페이스 언어(10개 언어) | ✅ (휴대폰 설정을 따름) | ✅ (브라우저 설정을 따름) |
| 포트폴리오, Q-Day 스캐너, 소셜 복구, Legacy | ✅ | — |
| dApp 연결 | ✅ (앱 내 브라우저) | ✅ (모든 웹사이트) |
| 계정 로그인 및 결제 요청 | ✅ | — |
| 다중 기기 연결 | ✅ | — |
| Dashboard 연동 | ✅ | ✅ (연결 + 제안된 전송, 스테이킹 포함) |

:::note 확장 프로그램 스테이킹은 0.2.2 이상 필요
확장 프로그램이 0.2.2보다 오래된 버전이면, 최신 빌드를 쓰고 있더라도 Dashboard의 스테이킹 버튼이 확장 프로그램 업데이트가 필요하다고 표시할 수 있습니다 — Dashboard의 스테이킹 요청을 확장 프로그램에 연결하는 수정 사항은 0.2.2에서 도입되었습니다. [어느 버전이 어디에 배포되어 있는지](/qorex/browser-extension#versions) 확인하세요. 사용 중인 스토어에 아직 0.2.2가 반영되지 않았다면, 반영되는 즉시 아무 조치 없이도 스테이킹 승인이 정상 작동하게 됩니다.
:::

## QoreX가 다른 이유

- **기본적으로 양자내성(Quantum-safe)** — Native 레인의 QOR 전송은 항상 ML-DSA-87 + secp256k1 하이브리드 서명을 포함합니다. 고전 방식(외부 체인)인 경우 명확히 표시되며, 절대 조용히 처리되지 않습니다.
- **진정한 비수탁형(Non-custodial)** — 키는 기기에서 생성되어 하드웨어 기반 보관소(iOS의 Secure Enclave, Android의 StrongBox) 또는 암호화된 보관소(확장 프로그램)에 저장됩니다. 절대 기기 밖으로 나가지 않습니다.
- **데이터 수집 없음** — 어떤 QoreX 앱에도 분석, 추적, 광고가 없습니다. 선택적 계정 로그인은 편의 기능을 추가하지만(자세한 내용은 [계정 & Dashboard](/qorex/account-and-dashboard) 참고), 지갑은 이에 절대 의존하지 않습니다.
- **하나로 통합된 잔액** — Native, EVM, SVM 레인에 걸친 QOR은 하나의 잔액이며, QoreX는 이를 단일 수치로 표시합니다.
- **다양한 복구 경로** — 24단어 복구 구문(항상 제공), 가디언과 48시간 타임락을 사용하는 선택적 소셜 복구, 선택적 Legacy 상속, 그리고 편리한 다중 기기 연결.

## 시작하기

- QoreX가 처음이신가요? [시작하기](/qorex/getting-started)에서 지갑을 생성하거나 복원하세요.
- 그다음 양자내성 QOR을 [송수신](/qorex/send-and-receive)하는 방법을 익히세요.
- [보안 & 복구](/qorex/security-and-recovery)에서 안전망을 설정하세요.
- 데스크톱에서는 [브라우저 확장 프로그램](/qorex/browser-extension)을 설치하세요.

:::note 다운로드 및 이용 가능 여부
- **브라우저 확장 프로그램** — 정식 공개(live) 중: [Chrome Web Store, Firefox Add-ons, 또는 Mac App Store(Safari)](/qorex/browser-extension#install)에서 설치하세요. [어느 버전이 어디에 배포되어 있는지](/qorex/browser-extension#versions) 확인하세요 — 최신 기능이 일부 브라우저에는 아직 순차 배포 중일 수 있습니다.
- **Android 앱** — Google Play에서 정식 서비스 중: https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS 앱** — **App Store**에서 서비스 중: https://apps.apple.com/us/app/qorex-wallet/id6791256626.

스토어 심사는 자체 일정에 따라 진행되므로, 최신 릴리스가 한 스토어에 먼저 반영되고 다른 스토어에는 나중에 반영되는 경우가 있습니다 — 정확한 현재 상황은 아래 [어느 버전이 어디에 배포되어 있는지](#platform-availability)를 참고하세요. 항상 공식 스토어 목록에서만 설치하세요.
:::

:::note 어느 버전이 어디에 배포되어 있는지
스토어 승인은 시점이 서로 달라, 아래 버전이 플랫폼별로 잠시 차이가 날 수 있습니다.

| 플랫폼 | 배포 중인 버전 |
|---|---|
| Android | 1.0.8 |
| iOS | 1.0.8 |
| Firefox | 0.2.6 |
| Safari(macOS) | 1.6, 확장 프로그램 0.2.6 포함 |
| Chrome | 8월 말 기준으로 장기간 스토어 심사에 묶여 있었습니다 — 여기 적힌 숫자를 믿기보다는 [Chrome Web Store 목록](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg)에서 현재 버전을 직접 확인하세요 |

1.0.8 / 0.2.6에서는 21일 언본딩 대기 없이 **스테이킹된 QOR을 검증인 간에 이동**(재위임)하는 기능이 추가되었습니다 — [검증인 간 스테이크 이동](/qorex/portfolio-and-staking#move-stake) 참고.

이 페이지는 QoreX의 현재 기능 세트를 설명합니다 — 이전 빌드를 서비스 중인 스토어도 사용자가 별도로 조치하지 않아도 자동으로 따라잡습니다.
:::
