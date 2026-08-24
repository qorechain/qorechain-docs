---
slug: /qorex/browser-extension
title: QoreX 브라우저 확장 프로그램
sidebar_label: 브라우저 확장 프로그램
sidebar_position: 2
---

# QoreX 브라우저 확장 프로그램

QoreX **브라우저 확장 프로그램**은 데스크톱용 QoreChain 지갑입니다. 지갑을 생성하거나 가져오고, QOR을 보관하고 전송하며, dApp에 연결할 수 있는 **독립형 지갑**인 동시에, 모든 웹사이트가 QoreX를 발견하고 모든 요청을 명시적이고 해독된 승인 절차로 바꿀 수 있게 해주는 구성 요소입니다.

세 개의 스토어에서 **정식 공개되어 사용 가능**합니다.

## 설치 {#install}

| 브라우저 | 설치 |
|---|---|
| **Chrome 및 Chromium 계열 브라우저** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 10.14 이상)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

### 브라우저별로 어떤 버전이 서비스 중인가 {#versions}

스토어 심사 완료 시점이 서로 다르기 때문에, 현재 게시된 버전은 브라우저마다 다릅니다.

| 브라우저 | 게시된 버전 |
|---|---|
| **Firefox** | **0.1.8** (0.1.9 제출 완료, 심사 중) |
| **Chrome / Chromium** | **0.1.5** (0.1.9 제출 완료, 심사 중) |
| **Safari (macOS)** | **QoreX Wallet** macOS 앱에 포함되어 배포되며, 이 앱은 자체 `1.x` 번호 체계를 사용합니다 — Mac App Store에서는 현재 **1.1**이 제공되고(확장 프로그램 0.1.5 포함), **1.2**(0.1.9 포함)는 제출 완료되어 심사 중입니다 |

최신 기능이 아직 사용 중인 브라우저에는 배포되지 않았을 수 있습니다 — 이 문서에서 설명하는 내용이 실제로 사용 가능하다고 가정하기 전에 위 표를 먼저 확인하세요.

**0.1.5**에서는 [Solana Wallet Standard 탐지](#standards), [패스키 잠금 해제](#security), 완전히 구현된 [SVM dApp 레인](#standards), 그리고 [Dashboard 연결 브리지](#dashboard-bridge)가 추가되었습니다. (버전 0.1.4는 게시된 적이 없으며, 해당 변경 사항은 0.1.5를 통해 사용자에게 전달됩니다.)

**0.1.6–0.1.9**에서는 순서대로 다음이 추가되었습니다. 베스팅 상태를 인식하여 잔액을 초과하는 시도에 정직하게 거부 메시지를 보여주는 전송 기능; 팝업 홈 화면에 바로 표시되는 계정 주소와 실시간 잔액; 그리고 **0.1.9**에서는 Send 화면에서 바로 [@handle로 전송](#handle-send)하는 기능, 주소 QR 코드가 포함된 [Receive 화면](#receive), [언어 선택기](#language)(모바일 앱과 동일한 10개 언어), 그리고 헷갈림을 유발하던 [베스팅 잔액](#vesting)의 "다음 잠금 해제 날짜" 표시 제거.

**권한 범위는 0.1.3 이후 변경되지 않았습니다** — [QoreX가 요청하는 권한](#permissions)을 참고하세요.

:::note
Safari에서는 승인 화면이 팝업 창이 아니라 브라우저 탭에서 열립니다 — 확장 프로그램이 동일한 코드베이스에서 Apple의 Safari 웹 확장 래퍼로 패키징되기 때문입니다.
:::

## 지갑 생성 또는 복구 {#wallet}

팝업을 열고 다음 중 하나를 선택하세요.

- **지갑 생성** — 기기에서 새로운 24단어 복구 문구를 생성하고(256비트 엔트로피), QoreChain 신원을 파생한 뒤, 비밀번호(그리고 선택적으로 패스키 — [보안](#security) 참고)로 볼트에 봉인합니다.
- **지갑 가져오기** — 기존 24단어 문구로 복구합니다.

확장 프로그램은 자체 키를 보유하며, 모바일 앱이 반드시 필요하지 않습니다. 팝업에서 니모닉을 내보낼 수도 있습니다. 키는 절대 기기를 벗어나지 않습니다.

:::note 브라우저 프로필당 계정 1개
하나의 복구 문구로 여러 개의 QoreChain 계정을 보관할 수 있는 모바일 앱과 달리, 확장 프로그램은 정확히 **하나**의 계정만 관리합니다. 스테이킹, 포트폴리오, Q-Day 스캐너, 소셜 복구, Legacy Protocol, 결제 요청, 기기 연결은 모바일 전용 기능입니다 — 전체 비교는 [QoreX Wallet](/qorex/overview#platform-availability)을 참고하세요.
:::

## 계정, 잔액 및 @handle {#account}

팝업의 초기 화면에는 `qor1…` 주소(탭하여 복사)와 실시간 QOR 잔액이 표시되므로, 둘 중 어느 것을 확인하기 위해서도 블록 탐색기를 따로 열 필요가 없습니다.

### 베스팅(잠금) 잔액 {#vesting}

계정에 베스팅 중인 QOR(예: 아직 해제되지 않은 TGE 배분)이 있는 경우, 잔액은 **현재 사용 가능** 부분과 **아직 잠긴** 부분으로 나뉘어 표시되며, 사용 가능한 금액을 초과하는 전송은 수수료를 뗀 뒤 온체인에서 실패하는 대신 네트워크에 도달하기 전에 거부됩니다. QoreX는 여기에 "다음 잠금 해제 날짜"를 의도적으로 표시하지 **않습니다**. 베스팅 일정은 거버넌스에 의해 변경될 수 있으므로, 잔액 카드에 날짜를 표시하면 QoreX가 보장할 수 없는 약속처럼 보이게 됩니다. 정확성이 유지되는 부분은 사용 가능/잠김 구분뿐입니다.

### @handle 청구하기

팝업에서 모바일 앱과 마찬가지로 이 계정 주소에 대해 고유한 **@handle**(예: `@liviu`)을 청구할 수 있습니다. 청구는 계정 자체의 키로 서명되어 그 주소에 연결되므로, 누군가 여러분에게 송금할 때 모바일 앱과 Dashboard가 이를 확인할 수 있습니다. 핸들이 지갑 전체가 아니라 주소에 연결되는 방식에 대해서는 [@handle](/qorex/account-and-dashboard#handle)을 참고하세요.

## @handle로 전송 {#handle-send}

0.1.9부터는 주소를 조회하는 대신 등록된 @handle로 바로 전송할 수 있습니다.

1. 팝업을 열고 **Send**를 탭합니다.
2. 수신자 입력란에 `qor1…` 주소 대신 `@`에 이어 핸들(예: `@liviu`)을 입력합니다.
3. QoreX가 핸들을 확인하고, 서명하기 전에 **확인된 주소**를 보여줍니다 — 항상 예상한 주소와 일치하는지 확인하세요.
4. 금액을 입력하고 확인합니다.

QoreX가 확인 결과를 사용하기 전에 두 가지 방식으로 검증됩니다. 확장 프로그램에 내장된 신뢰 키로 검증하는 레지스트리 증명, 그리고 청구 내용에 대한 핸들 소유자 본인의 서명입니다. 둘 중 하나라도 실패하면 응답은 즉시 거부됩니다 — QoreX는 검증되지 않은 주소를 대신 보여주지 않습니다. 특정 핸들로 처음 전송할 때 QoreX는 확인된 주소를 기억(고정)해 둡니다. 이후 그 핸들이 **다른** 주소로 확인되면 QoreX는 진행을 멈추고 이전 주소와 새 주소를 모두 온전히 보여주어 계속할지 여부를 직접 판단하게 합니다.

## 받기 {#receive}

팝업에서 **Receive**를 탭하면 `qor1…` 주소가 QR 코드(QoreChain 아이콘이 삽입됨)와 복사 버튼으로 표시됩니다 — 휴대폰으로 스캔하거나 주소를 직접 붙여넣으세요.

### 외부 네트워크에서 전송하기 {#send-external}

Native 레인의 QOR 외에도, 팝업에서 외부 네트워크의 자산을 전송할 수 있으며, 모두 동일한 복구 문구에서 파생됩니다.

| 종류 | 네트워크 | 기본 포함 토큰 |
|---|---|---|
| EVM | Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche C-Chain | ERC-20 항목 (모든 EVM 체인에 걸친 USDC 및 USDT, Ethereum의 DAI) |
| SVM | Solana | SPL 항목 (USDC, USDT) |
| Cosmos | Cosmos Hub, Osmosis, Celestia | IBC를 통한 Noble USDC; 선택적 메모 필드 |

외부 전송이 발송되기 전에 다음 확인 사항에 명시적으로 체크해야 합니다. **"외부 네트워크는 고전 서명만 허용합니다 — 귀하의 QOR와 달리, 이 전송은 양자 내성이 없습니다."** 외부 체인은 포스트 양자 서명을 담을 수 없으며, QoreX는 이를 결코 숨기지 않습니다.

## 지원하는 지갑 표준 {#standards}

QoreX는 세 가지 인터페이스를 노출하며, 모두 페이지에 `window.qorex` (`{ evm, native, svm }`)로 주입되고 [`@qorechain/connect`](/sdk/overview) 탐지 계약을 통해 발견됩니다.

| 표준 | 개요 | 개발자에게 주는 의미 |
|---|---|---|
| **EIP-1193** | Ethereum 프로바이더 JavaScript API (`request(...)`, 이벤트). | 기존 ethers.js / viem / web3.js 코드가 수정 없이 QoreX의 EVM 레인과 통신합니다. 숫자 오류 코드(예: `4902`)는 그대로 전달됩니다. |
| **EIP-6963** | 다중 지갑 프로바이더 탐지 (announce / request 이벤트). | QoreX는 다른 모든 지갑과 나란히 자신을 알리며, **`window.ethereum`을 절대 덮어쓰지 않습니다** — 따라서 사용자는 충돌 없이 사이트별로 QoreX를 선택할 수 있습니다. |
| **Keplr 방식 `signDirect`** | `window.qorex.native`에 제공되는 Cosmos `OfflineDirectSigner` 형태의 프로바이더. | Cosmos 계열 dApp은 Keplr를 쓸 때와 동일한 방식으로 QoreChain **Native 레인** 트랜잭션에 서명합니다. 포스트 양자 계층은 미리 적용됩니다([포스트 양자 서명](#pqc) 참고). |
| **Solana Wallet Standard** *(0.1.5부터)* | Solana dApp을 위한 네이티브 지갑 탐지 (`wallet-standard:register-wallet` / `app-ready`). | Solana dApp이 **QoreX를 자동 감지**합니다 — 별도 통합이 필요 없습니다. 기능: `standard:connect`, `standard:disconnect`, `standard:events`, `solana:signMessage`, `solana:signTransaction`, `solana:signAndSendTransaction`; 체인 `solana:mainnet`; `legacy`와 `v0` 트랜잭션 모두 지원. |

:::note SVM 레인에 직접 접근하기
동일한 인터페이스는 `window.qorex.svm`에서도 사용할 수 있습니다 (`connect` / `signAndSendTransaction` / `signMessage`). Wallet-Standard 자동 탐지와 완전히 구현된 SVM 레인은 **0.1.5**에서 출시되었으며, Chrome과 Firefox 양쪽에서 모두 서비스 중입니다([브라우저별로 어떤 버전이 서비스 중인가](#versions) 참고).

Solana 승인 화면은 해독된 페이로드(System 전송의 경우 수신자와 lamports, 그리고 프로그램 목록)를 표시하고, 사용자의 지갑을 서명자로 명시하지 않은 트랜잭션은 거부하며, 서명을 **고전 서명**으로 표시합니다 — [포스트 양자 서명](#pqc)을 참고하세요.
:::

## 언어 {#language}

이 확장 프로그램은 모바일 앱, 대시보드, 사이트와 동일한 10개 언어를 지원합니다: 영어, 루마니아어, 독일어, 스페인어, 프랑스어, 이탈리아어, 터키어, 아랍어, 일본어, 한국어. 기본적으로 **브라우저**의 언어를 따르며(그 외 언어는 영어로 대체) — 이는 **휴대폰**의 언어를 따르는 모바일 앱과는 다른 기준이라는 점에 유의하세요. 휴대폰과 브라우저의 언어 설정이 다르면 두 곳에서 서로 다른 언어가 표시될 수 있습니다. 팝업 초기 화면의 선택기를 통해 언제든 감지된 언어를 재정의할 수 있으며, 아랍어로 전환하면 텍스트뿐 아니라 팝업 전체가 즉시 오른쪽에서 왼쪽 방향으로 바뀝니다.

## 보안 및 권한 {#security}

QoreX는 단순히 신뢰를 요구하는 것이 아니라 검증 가능하도록 설계되었습니다.

- **볼트** — 키는 **AES-256-GCM**으로 봉인됩니다. 비밀번호 경로는 **Argon2id**(RFC 9106, 메모리 하드: 64 MiB, t=3, p=1)로 키를 파생하므로, 유출된 볼트 블롭도 GPU/ASIC 크래킹에 강하게 저항합니다. (기존 PBKDF2 블롭은 계속 열 수 있으며, 다음 잠금 해제 시 Argon2id로 다시 봉인됩니다.)
- **패스키 잠금 해제 (선택 사항, 0.1.5부터)** — 인증기가 **WebAuthn PRF** 확장을 지원하는 경우, QoreX는 비밀번호를 입력하는 대신 패스키의 32바이트 PRF 출력으로 볼트를 열 수 있습니다. 비밀번호는 항상 대체 수단으로 남아 있습니다.

  :::note 패스키 잠금 해제가 표시되는 환경
  QoreX는 WebAuthn을 기능 탐지하여, 브라우저가 확장 프로그램 페이지에 이를 노출하는 경우에만 **패스키 잠금 해제 사용**을 표시합니다 — 즉 **Chrome과 Edge**입니다. **Firefox**에서는 이 옵션이 숨겨지는데, Firefox가 확장 프로그램 페이지에 WebAuthn을 노출하지 않기 때문입니다. 이는 버그가 아니라 의도된 동작입니다.
  :::
- **Manifest V3 + 엄격한 CSP** — `script-src 'self'; object-src 'self'; base-uri 'self'`. 설치 이후 **원격 코드 로딩이 전혀 없으며**, `wasm-unsafe-eval`도 사용하지 않습니다.
- **계정 없음, 텔레메트리 없음** — 분석 도구, 트래킹, 원격 로깅, 회원 가입, 이메일 수집이 모두 없습니다. Firefox 등록 정보에는 데이터 수집이 `none`으로 선언되어 있습니다.

### QoreX가 요청하는 권한과 그 이유 {#permissions}

이 섹션이 존재하는 이유는, Firefox 등록 정보에 **"모든 웹사이트의 데이터에 접근"** 권한이 표시되기 때문입니다. 호스트 권한을 전혀 선언하지 않는 지갑치고는 모순처럼 보일 수 있습니다. 아래는 매니페스트에서 그대로 가져온, 편집되지 않은 사실입니다.

확장 프로그램의 `manifest.json`은 다음을 선언합니다.

```json
"permissions": ["storage"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
]
```

- **`permissions: ["storage"]`** — 유일한 API 권한입니다. 암호화된 볼트와 출처(origin)별 연결 승인 정보를 확장 프로그램 저장소에 **로컬로** 저장합니다.
- **`host_permissions: []`** — QoreX는 호스트 권한을 **전혀** 선언하지 않습니다. 사용자를 대신해 임의의 사이트로 교차 출처 네트워크 요청을 보낼 수 있는 권한을 요청하지 않습니다.
- **`content_scripts`가 `<all_urls>`와 일치** — Firefox가 *"모든 웹사이트의 데이터에 접근"*이라고 표시하는 솔직한 이유가 바로 이것입니다. QoreX는 **모든 페이지**에 작은 프로바이더 스크립트(`content.js` → `inpage.js`)를 주입합니다. 모든 사이트에서 실행되는 콘텐츠 스크립트는 기술적으로 페이지를 읽을 *수* 있고, 브라우저는 그 기능을 정확히 그런 문구로 설명합니다 — 그것이 `host_permissions`에서 비롯되든 콘텐츠 스크립트 매칭에서 비롯되든 마찬가지입니다.

**콘텐츠 스크립트가 모든 곳에서 실행되는 이유.** **어떤** dApp이든 사이트별 접근 권한을 먼저 부여받지 않고도 EIP-6963을 통해 지갑을 발견할 수 있도록 하기 위해서입니다. 이는 MetaMask, Keplr, Phantom을 비롯한 모든 주입형 지갑이 동작하는 방식입니다. 주입된 프로바이더는 페이지의 스크립트가 실행되기 전에(`document_start`), 사용자가 방문하는 모든 사이트에서 존재해야 합니다.

**그 스크립트가 하는 일과 하지 않는 일.** 이 스크립트는 지갑 메시지를 중계하기만 합니다(프로바이더를 알리고, 연결/서명 요청을 서비스 워커로 전달하며, 결과를 반환). 해당 지갑 요청 외에 페이지 내용을 읽거나, 서버로 무언가를 전송하거나, 원격 코드를 로드하지 **않습니다** — 또한 호스트 권한이 없기 때문에 임의의 교차 출처 데이터를 가져올 수도 없습니다. 이 모든 것은 검증 가능합니다. 확장 프로그램은 CSP로 잠겨 있고, 분석 도구를 포함하지 않으며, Firefox 패키지에는 재현 가능한 소스 zip이 포함되어 있습니다.

## dApp을 QoreX에 연결하기 {#connect}

dApp은 **EIP-6963**을 통해 QoreX의 EVM 레인을 발견합니다. announce-and-request 방식을 사용한 뒤, 반환된 EIP-1193 프로바이더를 사용하세요.

```ts
import type { EIP6963ProviderDetail } from "./types";

const wallets = new Map<string, EIP6963ProviderDetail>();

// 1. Collect every wallet that announces itself.
window.addEventListener("eip6963:announceProvider", (event) => {
  const detail = (event as CustomEvent<EIP6963ProviderDetail>).detail;
  wallets.set(detail.info.rdns, detail);
});

// 2. Ask installed wallets to announce.
window.dispatchEvent(new Event("eip6963:requestProvider"));

// 3. Pick QoreX by its rdns and use the standard EIP-1193 provider.
const qorex = wallets.get("network.qore.qorex");
if (qorex) {
  const accounts = await qorex.provider.request({ method: "eth_requestAccounts" });
  console.log("QoreX EVM account:", accounts[0]);
}
```

QoreChain **Native** 레인의 경우, `window.qorex.native`에 있는 Keplr 방식 프로바이더(`enable`, `getKey`, `signDirect`)를 사용하세요. 상위 수준의 [`@qorechain/connect`](/sdk/overview) 패키지가 이 탐지 과정을 대신 처리해 줍니다.

승인은 **출처별**로 이루어집니다. 사이트에 처음 연결할 때 출처를 표시하는 승인 팝업이 열리고, 승인 시 공개 주소만 공개되며, 한 사이트의 승인이 다른 사이트에 어떤 권한도 부여하지 않습니다.

### Dashboard 브리지 (v0.1.5) {#dashboard-bridge}

버전 0.1.5는 **`dashboard.qorechain.io` 전용**으로 범위가 한정된 브리지를 추가합니다. `window.qorex.native.connectProof(sessionId)`는 *Connect with QoreX* 페어링 증명에 서명하고(백엔드가 서명을 다시 검증합니다), `executeTransfer({ to, amountUqor, memo })`는 Dashboard가 제안한 QOR 전송을 승인 및 브로드캐스트하고 `txHash`를 반환합니다. 이 메서드들은 다른 모든 출처에서 거부됩니다.

`qor1…` 주소는 메인넷과 테스트넷 양쪽에서 동일하게 유효하기 때문에, Dashboard가 제안하는 요청은 대상 네트워크를 명시하며, QoreX는 그 네트워크가 확장 프로그램이 현재 연결된 네트워크와 일치하지 않으면 해당 요청을 실행하지 않습니다 — 요청을 대신해 네트워크를 전환하는 일은 절대 없습니다.

## 포스트 양자 서명 {#pqc}

QoreX가 직접 개시하는 모든 QOR 전송은 **하이브리드 포스트 양자 서명** — 고전 secp256k1 서명과 함께 **ML-DSA-87**(Dilithium-5, NIST **FIPS-204**) — 으로 서명되며, `@qorechain/sdk`의 완전한 하이브리드 파이프라인을 사용합니다. **끄고 켜는 설정은 없습니다.** QoreChain이 이를 요구하며, QoreX는 이것 없이 Native 레인 QOR 전송을 절대 보내지 않습니다.

- **dApp이 개시하는 Native 서명** — qorechain-connect 플로우 기반으로 만들어진 dApp은 `signDirect`를 호출하기 전에 트랜잭션 본문에 PQC 확장(`/qorechain.pqc.v1.PQCHybridSignature`)을 미리 계층으로 추가합니다. QoreX는 고전 서명 부분을 담당하며 **맹목적 서명을 거부하고**, 페이로드를 해독해 PQC 계층의 존재 여부를 표시합니다.
- **고전 요청은 항상 라벨이 붙습니다** — 요청에 PQC 계층이 없거나, 외부 체인(PQC를 담을 수 없는 ETH/BNB 등)을 대상으로 하는 경우, QoreX는 조용히 등급을 낮추는 대신 명시적인 경고를 표시합니다.

**이것이 트랜잭션 크기에 미치는 영향.** ML-DSA-87은 큰 서명입니다. 서명은 **4,627바이트**, 공개 키는 **2,592바이트**입니다(FIPS-204로 고정). 따라서 하이브리드 QoreChain 트랜잭션은 순수 고전 트랜잭션보다 수 킬로바이트 더 큽니다. 트랜잭션을 직접 구성하고 브로드캐스트한다면, 추가 바이트를 감안해 버퍼와 수수료 추정치를 잡으세요. QoreChain의 가스 회계는 이미 이를 반영하고 있습니다. 기본 요소와 결정론적 서명 요구 사항은 [포스트 양자 서명](/developer-guide/post-quantum-signing)을 참고하세요.
