---
slug: /qorex/dapp-browser
title: dApp 브라우저
sidebar_label: dApp 브라우저
sidebar_position: 7
---

# dApp 브라우저 (모바일)

QoreX에는 인앱 **dApp 브라우저**가 포함되어 있어, 지갑을 벗어나지 않고도 QoreChain 애플리케이션을 사용할 수 있으며, 모든 서명은 명시적으로 승인됩니다. 다른 앱을 설치하지 않고 웹 앱을 사용하려는 모바일 사용자와, 모바일 지갑 안에서 자신의 앱을 테스트하려는 개발자를 위한 기능입니다.

## 혁신 요소 {#innovations}

- **사이트당 한 번의 승인, 언제든 취소 가능.** 각 출처는 따로 승인되며, 연결된 사이트는 지갑별로 이 기기에 저장되고, [내 자산 보호](/qorex/security-and-recovery#protection)에서 언제든 취소할 수 있습니다.
- **디코딩되고 생체 인증으로 보호되는 서명.** 각 서명은 페이로드가 디코딩된 별도의 승인이며, QoreX가 디코딩할 수 없는 것은 거부합니다.
- **`signAndBroadcast`.** 페이지가 메시지를 보내면, QoreX가 이를 표시하고 지갑만 만들 수 있는 ML-DSA-87 계층을 추가한 뒤 브로드캐스트합니다.
- **브라우저에서의 EVM 및 메시지 서명.** EVM dApp은 QoreChain에서 메시지, 타입 데이터, 트랜잭션에 서명할 수 있으며, 각각이 무엇을 하는지 먼저 디코딩하고 시뮬레이션합니다. 모든 페이지는 ML-DSA-87 절반도 담는 메시지 서명을 요청할 수 있습니다.
- **링크로 페이지 열기.** `browse` 링크는 페이지를 dApp 브라우저에서 바로 열며, 시작 페이지는 즐겨찾기와 최근 사이트를 기기에 보관합니다.
- **장악하지 않는 탐색.** QoreX는 EIP-6963으로 자신을 알리며, 다른 지갑의 `window.ethereum`이나 `window.keplr`를 절대 덮어쓰지 않습니다.

## 접근 방법 {#how-to-access}

dApp 브라우저는 모바일 앱의 일부입니다. App Store(iOS 15.1 이상) 또는 Google Play(Android 7.0 이상)에서 설치하세요. 링크는 [개요](/qorex/overview#how-to-access)에 있습니다. 계정이 필요 없습니다. 데스크톱 dApp의 경우 [브라우저 확장 프로그램](/qorex/browser-extension)을 사용하세요.

## dApp에 연결하기 {#how-to-use}

홈 탭에서 **dApp 브라우저**를 열고 앱으로 이동하세요. **dApp URL 입력** 입력란에 dApp의 주소를 입력하거나 붙여넣으세요(`https://` 주소만 연결됩니다). QoreX는 페이지에 자체 프로바이더를 `window.qorex`로 주입합니다 - QoreChain 네이티브 프로바이더(`signAndBroadcast`, `signDirect`, 메시지 서명 포함), EVM 프로바이더, Solana 프로바이더 객체 - 그리고 EIP-6963을 통해서도 자신을 알립니다. 다른 지갑이 설정하지 않은 경우에만 `window.ethereum`을 설정하며, 다른 지갑을 덮어쓰지 않습니다. `window.keplr` 별칭은 없습니다. 개발자: [QoreX와 dApp 연동하기](/qorex/dapp-integration)를 참고하세요.

### 즐겨찾기와 최근 사이트 {#favourites}

브라우저의 시작 페이지에는 **즐겨찾기**와 **최근** 사이트(최근 8개)가 나열됩니다. 주소 표시줄의 별을 탭하면 열린 페이지를 즐겨찾기에 보관하고(다시 탭하면 제거), 홈 버튼으로 목록으로 돌아갑니다. **지우기**는 최근 목록을 비웁니다. [browse 링크](#browse-links)로 연 페이지도 방문으로 계산됩니다. 두 목록은 모두 이 휴대폰에만 남으며, 페이지의 쿼리나 프래그먼트 없이 저장됩니다.

### 링크로 페이지 열기 {#browse-links}

웹의 링크로 dApp 브라우저에서 페이지를 열 수 있습니다: `https://link.qore.network/browse?url=<encoded https address>` 또는 `qorex://browse?url=<encoded https address>`. QoreX는 먼저 dApp 브라우저를 여는 생체 인증을 요청합니다. 도메인 이름의 `https://` 주소가 아니거나, 포트, 사용자 이름, IP 주소 또는 `localhost`가 있는 주소는 거부합니다. 링크는 페이지에 아무것도 주지 않습니다. 페이지는 여전히 연결을 요청해야 하고, 모든 서명은 여전히 승인 시트를 거칩니다. 휴대폰에 지갑이 없으면 앱은 온보딩에 머뭅니다. [서비스가 생성할 수 있는 링크](/qorex/dapp-integration#links)를 참고하세요.

- **연결**은 **오리진마다 한 번의 승인**만 필요합니다. 승인하면 해당 사이트에는 공개 주소만 공개됩니다.
- **모든 서명**은 각각 생체 인증으로 보호되는 별도의 승인이며, 페이로드가 **디코딩**되어 서명하는 내용을 정확히 확인할 수 있습니다 - **블라인드 서명은 없습니다**.
- **연결은 취소할 때까지 유지됩니다.** 1.2.5부터 사이트 주소가 지갑별로 이 기기에 저장됩니다. 연결된 사이트는 [내 자산 보호](/qorex/security-and-recovery#protection)에서 확인하고 취소하세요. 연결만으로는 아무것도 서명되지 않으며, 모든 서명에는 여전히 개별 승인이 필요합니다.
- **네이티브 트랜잭션은 `signAndBroadcast`를 거칩니다:** QoreX는 모든 메시지, 수수료, 서명 계정을 표시하고, ML-DSA-87 계층을 추가한 뒤 브로드캐스트합니다. [승인 창에 표시되는 내용](/qorex/security-and-recovery#approvals)을 참고하세요.
- **EVM dApp**은 QoreChain에서 `personal_sign`, 타입 데이터, 트랜잭션을 요청할 수 있습니다. 승인 화면은 이를 디코딩하고, 네트워크가 허용하면 트랜잭션이 잔액에 미치는 영향을 보여 줍니다. QoreChain의 EVM 레인에서는 승인 화면이 트랜잭션에 필요한 짧은 인가 창도 열며 허용하는 모든 컨트랙트의 이름을 표시합니다. [EVM 접근 창](/qorex/security-and-recovery#evm-window)을 참고하세요. MetaMask에서 가져온 계정만 해당 레인에서 보낼 수 있습니다.
- **메시지 서명:** 페이지가 메시지 서명을 요청할 수 있으며, 먼저 전체 내용을 확인합니다.
- **네트워크:** 페이지는 네트워크를 전환할 수 없습니다. QoreX 안에서 직접 전환해야 하며(아래 설정 참고), 페이지는 지갑과 같은 네트워크에 있어야 합니다.

## Q-Day Scanner

홈 탭의 빠른 버튼에서 **Q-Day Scanner**도 열 수 있습니다. 임의의 Bitcoin 또는 Ethereum 주소를 입력하면 노출 보고서를 받을 수 있습니다. [보안 및 복구](/qorex/security-and-recovery#q-day-scanner)를 참고하세요.

## 설정 빠른 참조

**Settings**의 기타 유용한 항목:

- **Security** → [보안 및 복구](/qorex/security-and-recovery)
- **Language** - 기본적으로 휴대폰 설정을 따르며, 10개 언어를 지원합니다
- **Take the tour again** - QoreX가 하는 일과 각 기능의 위치를 알려 주는 짧은 카드 다섯 장
- **Coins and networks** - 현재 지갑이 보유하고 전송할 수 있는 모든 것
- **Wallets** - 이 휴대폰의 여러 복구 문구 - [여러 지갑](/qorex/getting-started#several-wallets)을 참고하세요
- **Your accounts** 및 **Your addresses** → [계정 및 Dashboard](/qorex/account-and-dashboard)
- **Claim your @handle** 및 **Linked account** → [계정 및 Dashboard](/qorex/account-and-dashboard)
- **Use testnet (developers)** - `qorechain-diana` 테스트넷(EVM 체인 ID 9800)으로 전환합니다. 앱은 재시작 없이 실시간으로 다시 바인딩됩니다. 기본값은 항상 메인넷입니다. 테스트넷 잔액에는 USD 가치가 표시되지 않습니다.
- **개발자 모드** - 기본으로 꺼져 있으며, QoreChain에서 개발하는 사람을 위한 도구가 있는 개발자 탭을 추가합니다. [개발자 모드](/qorex/developer-mode)를 참고하세요.
- **Portfolio animation** - Aurora 배경을 켜고 끕니다.
- **Delete account** → [계정 삭제](/qorex/account-and-dashboard#delete-account)
- **Connected to** - 활성 네트워크와 해당 체인 ID를 표시합니다.

## 플랫폼 참고 사항

- **iOS**(iOS 15.1 이상) - Face ID(최초 사용 시 사용 안내 프롬프트가 표시됨), Secure Enclave 볼트, 시스템 인증 시트를 통한 로그인, 그리고 기기 연동 및 QR 스캔을 위한 카메라 권한.
- **Android**(Android 7.0 이상) - StrongBox Keystore를 사용하는 BiometricPrompt, `qorex://` 플로우(인증 콜백, connect, tx, link)를 위해 등록된 딥 링크, 그리고 기기 연동을 위한 카메라 권한.

데스크톱 dApp의 경우, 대신 [브라우저 확장 프로그램](/qorex/browser-extension)을 사용하세요.

## 게시 위치 {#where-published}

dApp 브라우저는 QoreX 모바일 앱(App Store 및 Google Play)에 포함되어 배포됩니다. 스토어 목록과 현재 버전은 [게시 위치](/qorex/overview#where-published)를 참고하세요. 별도로 다운로드하는 것이 아닙니다.

## 제한 사항 및 알려진 문제 {#limits}

- `https://` 주소만 연결됩니다.
- 앱 내 브라우저는 QoreChain의 활성 네트워크에서만 서명하며, EVM `connect` 이벤트만 발생시킵니다. 계정이나 네트워크를 전환하려면 브라우저를 닫아야 합니다. Solana 트랜잭션에는 서명하지 않으며 Ethereum 네트워크가 없습니다.
- `window.qorex.native`는 Keplr 스타일이지만 Keplr의 대체재(drop-in)는 아니며, `window.keplr` 별칭은 없습니다. Amino 서명은 거부됩니다.
- Q-Day Scanner, 소셜 복구, Legacy는 앱에 있으며 확장 프로그램에는 없습니다.
