---
slug: /qorex/overview
title: QoreX 지갑
sidebar_label: 개요
sidebar_position: 1
---

# QoreX 지갑

**QoreX**는 **QoreChain**(메인넷 `qorechain-vladi`)의 공식 **비수탁형(non-custodial)** 지갑입니다. QOR을 보유, 전송, 스테이킹, 수신하고, @핸들로 다른 사람에게 결제하고, 같은 복구 구문으로 다른 네트워크의 자산을 보유하고, 웹사이트가 지갑에 서명을 요청하는 내용을 승인하려는 모든 사람을 위한 지갑입니다. 개인 키는 **오직 사용자의 기기에서만** 생성되고 저장됩니다. QoreChain Association은 사용자의 자금에 절대 접근할 수 없으며, 앱에는 **분석도, 크래시 보고도, 추적 SDK도 없습니다**. 키, 복구 구문, 보관소, 승인 내역은 기기 밖으로 나가지 않습니다([QoreX가 네트워크로 보내는 것](#data-and-privacy) 참고). 네이티브 QOR 전송은 모두 두 번 서명됩니다. 고전 키로 한 번, ML-DSA-87(FIPS 204)로 한 번입니다.

QoreX는 함께 동작하는 네 가지 빌드로 구성됩니다.

- **모바일 앱**(Android 및 iOS): 복구, 스테이킹, 포트폴리오, 앱 내 dApp 브라우저, Q-Day 스캐너를 갖춘 완전한 지갑입니다. [시작하기](/qorex/getting-started)와 [dApp 브라우저](/qorex/dapp-browser)를 참고하세요.
- **브라우저 확장 프로그램**(Chrome 및 Chromium 브라우저, Firefox): 독립형 데스크톱 지갑이자, 모든 웹사이트가 QoreX를 인식하고 모든 요청을 명시적 승인으로 전환할 수 있게 해주는 커넥터입니다. [브라우저 확장 프로그램](/qorex/browser-extension)을 참고하세요.
- **Safari 확장 프로그램**: 같은 확장 프로그램을 Mac App Store의 macOS 앱 **QoreX Wallet** 안에 담아 제공합니다.
- **개발자 키트**: QoreX와 연동하는 앱을 위한 공개 npm 패키지 6개입니다. [개발자용](#developers)을 참고하세요.

:::caution 지갑을 만들자마자 복구 구문을 백업하세요
QoreX는 비수탁형입니다. QoreChain Association은 분실한 지갑을 복구하거나 초기화하거나 대신 복원해 줄 수 없습니다. **앱을 삭제하거나, 휴대폰을 초기화하거나, 확장 프로그램을 제거하면 해당 기기에서 키가 삭제됩니다.** 24단어 복구 구문을 적어 두고(모바일 앱은 지갑을 만드는 동안에는 이를 표시하지 않으므로 **설정 → 보안 → 복구 구문 보기**에서 확인하세요. 확장 프로그램은 생성 시 한 번 표시합니다), 가능하다면 [소셜 복구](/qorex/security-and-recovery#social-recovery)를 설정하세요. [지금 백업하기](/qorex/security-and-recovery#back-up-now)를 참고하세요.
:::

## 혁신 요소 {#innovations}

- **하이브리드 서명 네이티브 레인.** 네이티브 QOR 전송은 모두 두 번 서명됩니다. 고전 secp256k1 키로 한 번, ML-DSA-87(FIPS 204)로 한 번입니다. 체인은 두 서명을 모두 검증합니다. 외부 네트워크의 모든 것은 고전 서명만 사용하며, QoreX는 확인하기 전에 이를 그대로 표시합니다.
- **복구 구문 하나, ML-DSA-87 키 하나, 두 번째 백업 없음.** ML-DSA-87 키는 같은 24단어에서 결정적으로 파생됩니다. `SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)`. 이 파생 방식은 [QoreSign](/qoresign/overview)에 공개되어 있으므로, 호환되는 모든 지갑이 같은 키를 파생합니다.
- **자동으로 등록하고, 이후 확인.** ML-DSA-87 키는 첫 트랜잭션과 함께 체인에 등록됩니다(체인 v3.2.3 이상에서는 소유 증명 포함). 브로드캐스트할 때마다 지갑은 커밋된 트랜잭션에 ML-DSA-87 레이어가 있는지 확인하고, 없으면 경고합니다.
- **읽을 수 없는 것은 거부하는 승인.** 서명하기 전에 모든 메시지, 수수료, 지출 한도, 만료 시점이 해독되어 표시됩니다. QoreX가 해독할 수 없는 요청이나, 바이트를 두 가지로 읽을 수 있는 요청은 거부됩니다.
- **dApp용 `signAndBroadcast`.** 웹사이트가 메시지를 보내면, 지갑이 이를 해독해 보여주고, 오직 지갑만 만들 수 있는 ML-DSA-87 레이어를 추가한 뒤 브로드캐스트합니다. 웹 페이지는 그 레이어를 만들 수 없습니다.
- **EVM 접근 창.** 체인 v3.2.0 이상에서 EVM 트랜잭션은 계정에 열린 창이 있는 동안에만 허용됩니다. 트랜잭션 수, 금액, 만료 시점으로 한정된 하이브리드 서명 `MsgOpenEVMWindow`입니다. QoreX가 이를 열고, 보여주고, 닫습니다.
- **고정(pinning)이 있는 핸들.** @핸들은 레지스트리의 ed25519 증명과 소유자 본인의 secp256k1 서명으로 `qor1…` 주소에 묶입니다. QoreX는 처음 확인한 주소를 고정해 두고, 조용히 바뀌면 알려 줍니다.
- **회사가 필요 없는 복구.** 소셜 복구는 시드를 ML-KEM으로 봉인한 암호화 조각(가디언 3명 중 2명)으로 나누며, 알림을 보내는 48시간 타임락이 있습니다. Legacy는 가디언에 대한 데드맨 스위치입니다. 기기 연결은 일회용 코드와 단독으로는 쓸모없는 QR로 지갑을 옮깁니다. [보안 & 복구](/qorex/security-and-recovery)를 참고하세요.
- **작은 사용 범위.** 확장 프로그램은 브라우저에 API 권한 `storage` 하나만 요청하며, 분석이나 추적 코드를 포함하지 않습니다. 푸시는 서버에 사용자의 공개 주소만 알리며 알림에는 "QOR received"라고만 표시됩니다.

## 사용 방법 {#how-to-use}

1. 공식 스토어 목록에서 QoreX를 설치합니다([이용 방법](#how-to-access) 참고).
2. 지갑을 만들거나 복원합니다. 모바일 앱은 [시작하기](/qorex/getting-started), 확장 프로그램은 [브라우저 확장 프로그램](/qorex/browser-extension#wallet)을 참고하세요.
3. 24단어를 적어 둔 다음 QOR을 송수신합니다: [보내기 및 받기](/qorex/send-and-receive).
4. 스테이킹합니다: [포트폴리오 및 스테이킹](/qorex/portfolio-and-staking). 안전망을 설정합니다: [보안 & 복구](/qorex/security-and-recovery).
5. 웹사이트를 QoreX와 함께 사용하려면 확장 프로그램(데스크톱) 또는 앱의 [dApp 브라우저](/qorex/dapp-browser)에서 엽니다. 모든 연결과 모든 서명은 사용자가 직접 하는 승인입니다.

## 이용 방법 {#how-to-access}

- **네트워크:** 메인넷 `qorechain-vladi`(기본값)와 테스트넷 `qorechain-diana`. 모바일에서 테스트넷은 **설정 → 테스트넷 사용(개발자)**입니다.
- **필요한 계정:** 없음. 로그인(이메일, Apple 또는 Google)은 선택 사항이며 @핸들을 청구하고, Dashboard에 연결하고, 결제 요청을 사용할 때만 필요합니다.
- **사전 조건:** 모바일에서는 기기 잠금 해제(iOS는 Face ID 또는 Touch ID, Android는 Class-3 생체 인증 또는 화면 잠금 PIN)가 필요하며, 없으면 생성 및 가져오기 버튼이 비활성화된 상태로 유지됩니다. 확장 프로그램에서는 비밀번호가 필요합니다.
- **비용:** QoreX는 무료입니다. 전송, 스테이킹, EVM 창 열기에는 일반 네트워크 수수료가 듭니다(네트워크 최저가는 가스당 0.1 uqor).
- **항상 공식 목록에서 설치하세요:**

| 빌드 | 위치 | 최소 요구 사항 |
|---|---|---|
| iOS 앱 | [App Store, QoreX](https://apps.apple.com/us/app/qorex-wallet/id6791256626) | iOS 15.1 |
| Android 앱 | [Google Play](https://play.google.com/store/apps/details?id=network.qore.qorex) | Android 7.0 |
| Chrome, Brave, Edge, Arc, Opera | [Chrome Web Store](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) | Chromium 브라우저 |
| Firefox | [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/qorex/) | Firefox 140 |
| Safari | [Mac App Store, QoreX Wallet](https://apps.apple.com/us/app/qorex-wallet/id6794132220) | macOS 12 |

## 배포 위치 {#where-published}

| 빌드 | 목록 및 패키지 이름 | 현재 버전(2026년 10월 27일) | 링크 |
|---|---|---|---|
| iOS 앱 | App Store, **QoreX** (id 6791256626) | 1.1.8 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6791256626) |
| Android 앱 | Google Play, `network.qore.qorex` | 1.1.9 | [play.google.com](https://play.google.com/store/apps/details?id=network.qore.qorex) |
| Chrome 확장 프로그램 | Chrome Web Store, **QoreX** | 0.3.8 | [chromewebstore.google.com](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) |
| Firefox 확장 프로그램 | Firefox Add-ons, `qorex` | 0.3.9 | [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/qorex/) |
| Safari 확장 프로그램 | Mac App Store, **QoreX Wallet** (id 6794132220) | 앱 1.7.8, 확장 프로그램 0.3.8 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6794132220) |
| 개발자 키트 | npm 패키지 6개, [개발자용](#developers) 참고 | 0.1.0 | [QoreX 연동](/developer-tools/qorex-integrations) |

스토어 심사는 자체 일정에 따라 진행되므로 한 스토어가 다른 스토어보다 이전 빌드를 제공할 수 있습니다. [어느 버전이 어디에 배포되어 있는지](#versions)를 참고하세요. QoreX 소스 코드는 공개되어 있지 않습니다.

## 제한 사항 및 알려진 문제 {#limits}

- **서명된 범위를 넘어서는 보장은 없습니다.** 하이브리드 서명은 네이티브 레인 트랜잭션에 적용됩니다. EVM 트랜잭션은 secp256k1 서명만 포함하며, EVM 접근 창이 열려 있는 동안에만 허용됩니다. SVM 및 외부 네트워크 전송은 고전 서명만 사용합니다.
- **확장 프로그램의 EVM 공급자는 계정 및 네트워크 조회에만 응답합니다.** 아직 EVM 트랜잭션이나 메시지에 서명하지 않습니다. 메시지 서명(`signArbitrary`)은 제공되지 않습니다.
- **모바일 전용:** 포트폴리오, Q-Day 스캐너, 소셜 복구, Legacy, 결제 요청, 로그인, 기기 연결.
- **스왑은 사용할 수 없습니다.** 풀 유동성이 생길 때까지 꺼져 있으며 iOS에는 표시되지 않습니다.
- **연결된 서명자**(지출 한도가 있는 연결 키로서의 Phantom 또는 MetaMask)는 아직 QoreX 안에서 사용할 수 없습니다.
- ML-DSA-87 키의 **키 교체**는 아직 QoreX 안에서 사용할 수 없습니다.
- **핸들 서비스가 중단되면** 지갑은 일반 주소로 대체되며, 나머지 기능은 계속 동작합니다.
- 적어 둔 구문도 소셜 복구도 없이 분실한 지갑은 누구도 복구할 수 없습니다.

## 플랫폼별 이용 가능 여부 {#platform-availability}

| 기능 | 모바일 앱(Android & iOS) | 브라우저 확장 프로그램 |
|---|---|---|
| 지갑 생성 / 가져오기 | ✅ (앱은 지갑을 생성할 때 구문을 표시하지 않음 - 설정 → 보안에서 확인) | ✅ (독립형, 구문은 생성 시 한 번 표시) |
| 각자 고유한 복구 구문을 가진 여러 지갑 | ✅ (설정 → 지갑) | ✅ (**지갑**, 모든 지갑에 비밀번호 하나) |
| 하나의 복구 구문으로 여러 계정 사용 | ✅ (지갑당 최대 20개) | ✅ |
| 직접 추가하는 Ethereum 방식(coin 60) 계정 | ✅ | ✅ |
| QOR 송수신 (하이브리드 서명 네이티브 레인) | ✅ | ✅ (전송, QR로 수신) |
| 지원되는 모든 네트워크에서 수신 | ✅ | ✅ |
| @핸들 결제 | ✅ | ✅ |
| @핸들 청구 | ✅ (로그인된 계정 필요) | - (확장 프로그램이 앱으로 안내) |
| 스테이킹: 위임, 언스테이크, 스테이크 이동, 청구, 청구 및 재스테이킹 | ✅ | ✅ |
| 외부 네트워크(Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + 토큰) | ✅ | ✅ (팝업에서 전송) |
| 컨트랙트로 토큰 추가 (EVM 네트워크) | ✅ | ✅ |
| EVM 접근 창 | ✅ | ✅ |
| 인터페이스 언어(10개 언어) | ✅ (휴대폰 설정을 따름) | ✅ (브라우저 설정을 따름) |
| 포트폴리오, Q-Day 스캐너, 소셜 복구, Legacy | ✅ | - |
| 검색, 첫 실행 투어, 홈 화면 위젯, 푸시 알림 | ✅ | - |
| dApp 연결 | ✅ (앱 내 브라우저, 세션 범위) | ✅ (모든 웹사이트, 해제 기능이 있는 **연결된 사이트**) |
| 스왑 | Android만 해당, 풀 유동성이 생길 때까지 꺼져 있음 (iOS에는 표시되지 않음) | - |
| 계정 로그인 및 결제 요청 | ✅ | - |
| 다중 기기 연결 | ✅ | - |
| Dashboard 연동 | ✅ | ✅ (연결 + 제안된 전송, 스테이킹 포함) |

## 시작하기

- QoreX가 처음이신가요? [시작하기](/qorex/getting-started)에서 지갑을 생성하거나 복원하세요.
- 그다음 하이브리드 서명 네이티브 레인에서 QOR을 [송수신](/qorex/send-and-receive)하는 방법을 익히세요.
- [보안 & 복구](/qorex/security-and-recovery)에서 안전망을 설정하세요.
- 데스크톱에서는 [브라우저 확장 프로그램](/qorex/browser-extension)을 설치하세요.

## 다운로드 및 이용 가능 여부 {#availability}

[이용 방법](#how-to-access)의 공식 목록에서 설치하세요. Android 앱은 Android 7.0 이상, iOS 앱은 iOS 15.1 이상, Firefox 확장 프로그램은 Firefox 140 이상, Safari 확장 프로그램은 macOS 12 이상이 필요합니다.

## 어느 버전이 어디에 배포되어 있는지 {#versions}

스토어 심사는 자체 일정에 따라 진행되므로 한 스토어가 다른 스토어보다 한동안 이전 빌드를 제공할 수 있습니다. 다음은 **2026년 10월 27일** 기준 **각 스토어**의 현재 버전입니다.

| 스토어 | 현재 버전 | 비고 |
|---|---|---|
| Apple App Store (iOS) | 1.1.8 | 10월 21일 출시 |
| Google Play (Android) | 1.1.9 | |
| Chrome Web Store | 0.3.8 | |
| Firefox Add-ons | 0.3.9 | |
| Safari (Mac App Store) | 1.7.8, 확장 프로그램 0.3.8 포함 | Mac App Store는 자체 `1.x` 번호 체계를 사용 |

스토어에는 항상 현재 버전이 표시되며, 아직 이전 빌드를 제공하는 스토어는 자동으로 따라잡습니다. 스토어에서 아직 출시하지 않은 빌드는 이 매뉴얼에서 이용 가능한 것으로 설명하지 않습니다.

1.1.9 / 0.3.9 빌드에서 추가된 점(현재 Android 1.1.9와 Firefox 확장 프로그램 0.3.9. iOS, Chrome, Safari는 해당 스토어가 이 빌드를 제공하면 포함됩니다):

- **스테이킹 잠금.** 스테이크의 일부를 3개월, 6개월 또는 12개월 동안 잠글 수 있습니다. 표시되는 보너스는 네트워크 상한 안에서 해당 잠금이 현재 얻는 보너스입니다. 일찍 잠금을 해제하려면 비용을 명시하는 두 번째 확인을 거쳐야 하며, **언스테이크**와 **스테이크 이동**은 잠금이 풀린 부분으로 제한됩니다. 티어 일정에는 "up to"라는 표시와 함께 현재 수치가 병기됩니다. [포트폴리오 및 스테이킹](/qorex/portfolio-and-staking#staking-locks)을 참고하세요.
- 승인 화면에서 **IBC 전송 메모를 쉬운 말로** 표시합니다.
- 확장 프로그램에서 **MetaMask(coin 60)에서 가져온 계정으로 스테이킹**할 수 있습니다.

1.1.8 / 0.3.8 빌드에서 달라진 점:

- **첫 페이지부터 QoreChain에서 MetaMask 사용.** MetaMask에 필요한 EVM 접근 창을 열고, 확인하고, 닫으며, 남은 내용을 확인할 수 있습니다.
- **더 강력한 서명 검사.** QoreX는 앱의 ML-DSA-87 서명을 계정에 등록된 키와 대조해 검증하며, 그 키가 다른 지갑에서 등록된 경우 이를 명확히 알려 줍니다.
- **보고된 보안 문제에 대한 수정.**

1.1.7 / 0.3.7 빌드에서 달라진 점(1.1.8 / 0.3.8에 포함됨):

- **바이트를 두 가지로 읽을 수 있는 요청은 승인에서 거부됩니다.** 같은 필드가 요청에 두 번 나타나면, 화면과 체인이 무엇이 서명되는지에 대해 서로 다르게 이해할 수 있습니다. 예를 들어 수수료나 금액이 실제로 실행되는 것과 다르게 표시될 수 있습니다. 이제 QoreX는 그런 요청의 한 가지 해석만 보여주는 대신 요청 자체를 거부합니다. [승인 창이 보여주는 것](/qorex/security-and-recovery#approvals)을 참고하세요.
- **권한 부여 만료 시점이 초 단위까지 표시되며**, 거버넌스 투표가 해독되어 승인 화면에 표시됩니다.
- **사이트는 요청이 스스로 주장하는 내용이 아니라 브라우저가 직접 증명하는 출처(origin)로 식별됩니다.**
- **확장 프로그램에서 @핸들 조회가 다시 동작합니다.**
- **@핸들 청구에는 로그인된 계정이 필요하며 앱에서 이루어집니다.** 확장 프로그램이 앱으로 안내합니다.
- **QoreChain을 흉내 내는 이름은 예약되어 있으므로**, 새 핸들이 프로젝트나 그 직원을 모방할 수 없습니다.

1.0.9 / 0.2.6 이후의 주요 변경 사항:

- 한 휴대폰이나 브라우저에서 각자 고유한 복구 구문을 가진 **여러 지갑**을 원탭으로 전환 - [여러 지갑](/qorex/getting-started#several-wallets) 참고.
- MetaMask나 Dashboard에서 처음 사용한 구문을 위해 직접 추가하는 **Ethereum 방식(coin 60) 계정** - [MetaMask 또는 Dashboard의 구문 복원하기](/qorex/getting-started#restore-dashboard) 참고.
- **컨트랙트로 토큰 추가**, **모든 네트워크에서 수신**, 전역 **검색**, 첫 실행 **투어**, **홈 화면 위젯**, QOR이 도착했을 때의 **푸시 알림**(모바일) - [보내기 및 받기](/qorex/send-and-receive) 참고.
- **청구 및 재스테이킹**, 청구 전 수수료 확인, **진행 중인 언스테이킹** 목록, 그리고 언스테이크가 불가능해질 정도로 스테이킹하기 전의 경고 - [포트폴리오 및 스테이킹](/qorex/portfolio-and-staking) 참고.
- 모든 메시지, 수수료, 지출 한도, 만료 시점을 보여주고 QoreX가 표시할 수 없는 것은 거부하는 승인 화면, dApp용 **`signAndBroadcast`**, 해제 기능이 있는 **연결된 사이트**(확장 프로그램), **EVM 접근 창** - [보안 & 복구](/qorex/security-and-recovery)와 [브라우저 확장 프로그램](/qorex/browser-extension) 참고.
- 수정 사항: 자금이 있는 계정이 "내 계정"에서 일시적으로 사라질 수 있던 문제(1.0.9), Android 하드웨어 뒤로 가기 버튼이 이제 한 화면씩 뒤로 이동(1.1.1), Android 14 이상에서 접근성 서비스가 아닌 서비스에는 복구 구문이 노출되지 않음(1.1.6).

QoreX는 2026년 10월 29일부터 체인 **v3.2.5**를 실행하는 메인넷 `qorechain-vladi`(2026년 6월 7일부터 라이브)에서 동작합니다(v3.2.4는 2026년 10월 23일부터). 서명 형식, 주소, 소수 자릿수, 메모, 수수료는 이러한 업그레이드에서 바뀌지 않으므로 이를 위해 QoreX를 업데이트할 필요는 없습니다.

## 개발자용 {#developers}

자체 앱에서 QoreX와 연동하려면 QoreX 개발자 키트를 사용하세요. 0.1.0으로 공개된 npm 패키지 6개입니다. 설치 명령, 예제, 제한 사항은 [QoreX 연동](/developer-tools/qorex-integrations)에 있습니다. 웹 앱에서의 지갑 탐색과 서명에 대해서는 [지갑 어댑터](/developer-tools/wallet-adapter)를, QoreX가 주입하는 브라우저 공급자에 대해서는 [브라우저 확장 프로그램](/qorex/browser-extension#standards)을 함께 참고하세요.

## QoreX가 네트워크로 보내는 것 {#data-and-privacy}

QoreX에는 **분석도, 크래시 보고도, 추적 SDK도 없습니다**. 키, 복구 구문, 보관소, 승인 내역은 **기기 밖으로 나가지 않습니다**. 앱은 모든 지갑이 그래야 하듯 네트워크와 통신합니다. 다음이 전체 목록입니다.

**항상 (잔액을 표시하고 전송하는 데 필요):**

- 잔액, 내역, 브로드캐스트를 위한 **QoreChain 퍼블릭 엔드포인트**(`qore.host`의 `api`, `rpc`, `evm`, `svm`과 `-testnet` 대응 엔드포인트). 이 요청에는 사용자의 **공개** `qor1…` 주소가 포함됩니다.
- **가격 조회** - QOR 가격에 대한 요청 한 건이며, **주소는 포함되지 않습니다**.
- **보유 중이거나 조회 중인 외부 네트워크** - 해당 네트워크의 공개 서드파티 RPC/REST 서비스이며, 그 네트워크에서의 사용자의 **공개** 주소가 포함됩니다.
- **@핸들 레지스트리** - 조회하는 핸들 또는 공개 주소가 포함됩니다.

**사용자가 켠 경우에만:**

- **푸시 알림**(모바일) - 사용자가 활성화하기 전까지는 꺼져 있습니다. 활성화하면 서버는 기기 토큰과 사용 중인 지갑의 공개 `qor1…` 주소(최대 10개)를 받습니다. 서버가 90일 동안 소식을 듣지 못한 기기는 삭제됩니다.
- **소셜 복구** - 릴레이는 **암호문만** 저장합니다.
- **로그인**(이메일, 또는 Apple이나 Google) - @핸들을 청구하고, Dashboard에 연결하고, 결제 요청을 사용하는 데 필요합니다.
- **Dashboard 연결 및 연결된 주소** - 해당 주소를 소유하고 있다는 서명된 증명을 보냅니다.
- **결제 요청** - 보내는 핸들, 받는 핸들, 금액, 선택적 메모를 보냅니다.

**홈 화면 위젯**은 QoreChain 서버로 자체 요청을 보내지 않습니다. 앱이 주소, 잔액, 개인정보 보호 플래그를 로컬에서 위젯에 전달하고, 위젯은 공개 QoreChain REST 엔드포인트에서 잔액을 새로 고칩니다.

두 앱 모두 **AI 채팅도, QCAI 서비스도 없습니다**.
