---
slug: /qorex/overview
title: QoreX 지갑
sidebar_label: 개요
sidebar_position: 1
---

# QoreX 지갑

**QoreX**는 양자내성 레이어 1인 **QoreChain**(메인넷 `qorechain-vladi`)의 공식 **비수탁형(non-custodial)** 지갑입니다. 개인 키는 **오직 사용자의 기기에서만** 생성되고 저장되며 — QoreChain Association은 사용자의 자금에 절대 접근할 수 없고 앱에는 **분석, 추적, 광고가 일절 없습니다**. Native 레인의 모든 QOR 전송에는 **하이브리드 포스트양자 서명**(ML-DSA-87, NIST FIPS-204, secp256k1과 결합)이 포함되어, 사용자의 자금은 고전적 공격자와 양자 공격자 모두로부터 보호됩니다.

QoreX는 함께 동작하는 두 부분으로 구성됩니다.

- **브라우저 확장 프로그램** — 데스크톱 지갑으로, **Chrome, Firefox, Safari(macOS)에서 정식 공개(live) 서비스 중**입니다. 독립형 지갑(생성/가져오기, QOR 보유 및 전송)이자, 모든 웹사이트가 QoreX를 인식하고 모든 요청을 명시적 승인으로 전환할 수 있게 해주는 커넥터입니다. [브라우저 확장 프로그램](/qorex/browser-extension) 참고.
- **모바일 앱**(Android 및 iOS) — 완전한 지갑 기능: 생성/복원, 양자내성 QOR 송수신, 외부 네트워크, 스테이킹, 포트폴리오, 복구, 그리고 앱 내 dApp 브라우저. Android는 **Google Play**에서, iOS는 **App Store**에서 제공됩니다(아래 이용 가능 여부 참고).

:::caution 지갑을 만들자마자 복구 구문을 백업하세요
QoreX는 비수탁형입니다. QoreChain Association은 분실한 지갑을 복구하거나 초기화하거나 대신 복원해 줄 수 없습니다. **앱을 삭제하거나, 휴대폰을 초기화하거나, 확장 프로그램을 제거하면 해당 기기에서 키가 삭제됩니다.** 24단어 복구 구문을 적어 두고(모바일 앱은 지갑을 만드는 동안에는 이를 표시하지 않습니다 — **설정 → 보안 → 복구 구문 보기**에서 확인하세요. 확장 프로그램은 생성 시 한 번 표시합니다), 가능하다면 [소셜 복구](/qorex/security-and-recovery#social-recovery)를 설정하세요. [지금 백업하기](/qorex/security-and-recovery#back-up-now)를 참고하세요.
:::

## 플랫폼별 이용 가능 여부 {#platform-availability}

| 기능 | 모바일 앱(Android & iOS) | 브라우저 확장 프로그램 |
|---|---|---|
| 지갑 생성 / 가져오기 | ✅ (앱은 지갑을 생성할 때 구문을 표시하지 않음 — 설정 → 보안에서 확인) | ✅ (독립형, 구문은 생성 시 한 번 표시) |
| 각자 고유한 복구 구문을 가진 여러 지갑 | ✅ (설정 → 지갑) | ✅ (**지갑**, 모든 지갑에 비밀번호 하나) |
| 하나의 복구 구문으로 여러 계정 사용 | ✅ (지갑당 최대 20개) | ✅ |
| 직접 추가하는 Ethereum 방식(coin 60) 계정 | ✅ | ✅ |
| QOR 송수신 (포스트양자) | ✅ | ✅ (전송, QR로 수신) |
| 지원되는 모든 네트워크에서 수신 | ✅ | ✅ |
| @핸들 결제 / 청구 | ✅ | ✅ 결제 가능, 청구는 일부 확장 프로그램 버전에서 일반 QoreChain 계정에 제공되며 그렇지 않으면 앱에서 청구 |
| 스테이킹: 위임, 언스테이크, 스테이크 이동, 청구, 청구 및 재스테이킹 | ✅ | ✅ |
| 외부 네트워크(Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + 토큰) | ✅ | ✅ (팝업에서 전송) |
| 컨트랙트로 토큰 추가 (EVM 네트워크) | ✅ | ✅ |
| EVM 접근 창 | ✅ | ✅ |
| 인터페이스 언어(10개 언어) | ✅ (휴대폰 설정을 따름) | ✅ (브라우저 설정을 따름) |
| 포트폴리오, Q-Day 스캐너, 소셜 복구, Legacy | ✅ | — |
| 검색, 첫 실행 투어, 홈 화면 위젯, 푸시 알림 | ✅ | — |
| dApp 연결 | ✅ (앱 내 브라우저, 세션 범위) | ✅ (모든 웹사이트, 해제 기능이 있는 **연결된 사이트**) |
| 스왑 | Android만 해당, 풀 유동성이 생길 때까지 꺼져 있음 (iOS에는 표시되지 않음) | — |
| 계정 로그인 및 결제 요청 | ✅ | — |
| 다중 기기 연결 | ✅ | — |
| Dashboard 연동 | ✅ | ✅ (연결 + 제안된 전송, 스테이킹 포함) |

## QoreX가 다른 이유

- **기본적으로 양자내성(Quantum-safe)** — Native 레인의 QOR 전송은 항상 ML-DSA-87 + secp256k1 하이브리드 서명을 포함합니다. 고전 방식(외부 체인)인 경우 명확히 표시되며, 절대 조용히 처리되지 않습니다.
- **진정한 비수탁형(Non-custodial)** — 키는 기기에서 생성되어 하드웨어 기반 보관소(iOS의 Secure Enclave, Android의 StrongBox) 또는 암호화된 보관소(확장 프로그램)에 저장됩니다. 절대 기기 밖으로 나가지 않습니다.
- **어떤 QoreX 앱에도 분석, 추적, 광고가 없습니다.** 선택적 부가 기능은 사용자가 켰을 때만 서버를 사용합니다: 계정 로그인([계정 & Dashboard](/qorex/account-and-dashboard) 참고)과 푸시 알림이며, 푸시 알림은 QOR이 도착했을 때 QoreX가 알려줄 수 있도록 기기와 사용자의 *공개* 주소를 등록합니다. 지갑은 둘 중 어느 것에도 의존하지 않습니다.
- **하나로 통합된 잔액** — Native, EVM, SVM 레인에 걸친 QOR은 하나의 잔액이며, QoreX는 이를 단일 수치로 표시합니다.
- **다양한 복구 경로** — 24단어 복구 구문(항상 제공, 모바일에서는 설정 → 보안에서 확인), 가디언과 48시간 타임락을 사용하는 선택적 소셜 복구, 선택적 Legacy 상속, 그리고 편리한 다중 기기 연결.

## 시작하기

- QoreX가 처음이신가요? [시작하기](/qorex/getting-started)에서 지갑을 생성하거나 복원하세요.
- 그다음 양자내성 QOR을 [송수신](/qorex/send-and-receive)하는 방법을 익히세요.
- [보안 & 복구](/qorex/security-and-recovery)에서 안전망을 설정하세요.
- 데스크톱에서는 [브라우저 확장 프로그램](/qorex/browser-extension)을 설치하세요.

## 다운로드 및 이용 가능 여부 {#availability}

- **브라우저 확장 프로그램** — 정식 공개(live) 중: [Chrome Web Store, Firefox Add-ons, 또는 Mac App Store(Safari)](/qorex/browser-extension#install)에서 설치하세요. 항상 공식 스토어 목록에서만 설치하세요.
- **Android 앱** — Google Play에서 정식 서비스 중: https://play.google.com/store/apps/details?id=network.qore.qorex (Android 7.0 이상).
- **iOS 앱** — **App Store**에서 서비스 중: https://apps.apple.com/us/app/qorex-wallet/id6791256626 (iOS 15.1 이상).

## 어느 버전이 어디에 배포되어 있는지 {#versions}

스토어 심사는 자체 일정에 따라 진행되므로, 한 스토어가 다른 스토어보다 잠시 이전 또는 최신 빌드를 제공할 수 있습니다. **2026년 10월 15일** 기준:

| 플랫폼 | 배포 중인 버전 |
|---|---|
| Android | 1.1.6 |
| iOS | 1.1.6 |
| Chrome | 0.3.6 |
| Firefox | 0.3.7 (0.3.6 이후의 포인트 릴리스) |
| Safari(macOS) | 1.7.6, 확장 프로그램 0.3.6 포함 |

이 문서는 1.1.6 / 0.3.6 기능 세트를 설명합니다. 아직 이전 빌드를 제공하는 스토어는 자동으로 따라잡으며, 스토어에는 항상 현재 버전이 표시됩니다. 1.0.9 / 0.2.6 이후의 주요 변경 사항:

- 한 휴대폰이나 브라우저에서 각자 고유한 복구 구문을 가진 **여러 지갑**을 원탭으로 전환 — [여러 지갑](/qorex/getting-started#several-wallets) 참고.
- MetaMask나 Dashboard에서 처음 사용한 구문을 위해 직접 추가하는 **Ethereum 방식(coin 60) 계정** — [MetaMask 또는 Dashboard의 구문 복원하기](/qorex/getting-started#restore-dashboard) 참고.
- **컨트랙트로 토큰 추가**, **모든 네트워크에서 수신**, 전역 **검색**, 첫 실행 **투어**, **홈 화면 위젯**, QOR이 도착했을 때의 **푸시 알림**(모바일) — [보내기 및 받기](/qorex/send-and-receive) 참고.
- **청구 및 재스테이킹**, 청구 전 수수료 확인, **진행 중인 언스테이킹** 목록, 그리고 언스테이크가 불가능해질 정도로 스테이킹하기 전의 경고 — [포트폴리오 및 스테이킹](/qorex/portfolio-and-staking) 참고.
- 모든 메시지, 수수료, 지출 한도, 만료 시점을 보여주고 QoreX가 표시할 수 없는 것은 거부하는 승인 화면, dApp용 **`signAndBroadcast`**, 해제 기능이 있는 **연결된 사이트**(확장 프로그램), **EVM 접근 창** — [보안 & 복구](/qorex/security-and-recovery)와 [브라우저 확장 프로그램](/qorex/browser-extension) 참고.
- 수정 사항: 자금이 있는 계정이 "내 계정"에서 일시적으로 사라질 수 있던 문제(1.0.9), Android 하드웨어 뒤로 가기 버튼이 이제 한 화면씩 뒤로 이동(1.1.1), Android 14 이상에서 접근성 서비스가 아닌 서비스에는 복구 구문이 노출되지 않음(1.1.6).
