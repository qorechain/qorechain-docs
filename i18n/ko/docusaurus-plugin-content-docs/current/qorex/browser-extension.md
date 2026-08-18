---
slug: /qorex/browser-extension
title: QoreX 브라우저 확장 프로그램
sidebar_label: 브라우저 확장 프로그램
sidebar_position: 2
---

# QoreX 브라우저 확장 프로그램

QoreX **브라우저 확장 프로그램**은 데스크톱용 QoreChain 지갑입니다. 지갑을 생성하거나 가져오고, QOR를 보관·전송하며, dApp에 연결할 수 있는 **독립 실행형 지갑**인 동시에, 어떤 웹사이트든 QoreX를 감지하고 모든 요청을 명시적이고 해독된 승인 절차로 바꿔 주는 구성 요소이기도 합니다.

세 곳의 스토어에서 **정식 공개 및 배포 중**입니다.

## 설치 {#install}

| 브라우저 | 설치 |
|---|---|
| **Chrome 및 Chromium 계열 브라우저** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 10.14 이상)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

### 브라우저별 배포 버전 {#versions}

스토어 심사 완료 시점이 서로 다르기 때문에, 현재 게시된 버전은 브라우저마다 차이가 있습니다.

| 브라우저 | 게시된 버전 |
|---|---|
| **Firefox** | **0.1.5** |
| **Chrome / Chromium** | **0.1.3** (0.1.5 제출 완료, 심사 중) |
| **Safari (macOS)** | **QoreX Wallet** macOS 앱에 포함되어 배포되며, 이 앱은 자체적인 `1.x` 버전 체계를 사용합니다 |

**0.1.5**에서는 [Solana Wallet Standard 감지](#standards), [패스키 잠금 해제](#security), 완전히 구현된 [SVM dApp 레인](#standards), 그리고 [대시보드 연결 브리지](#dashboard-bridge)가 추가되었습니다. (0.1.4 버전은 게시된 적이 없으며, 해당 변경 사항은 0.1.5를 통해 사용자에게 전달됩니다.)

**권한 범위는 0.1.3과 0.1.5에서 동일합니다** — [QoreX가 요청하는 권한](#permissions)을 참고하세요.

:::note
Safari에서는 승인 화면이 팝업 창이 아니라 브라우저 탭에서 열립니다. 확장 프로그램이 동일한 코드베이스에서 Apple의 Safari 웹 확장 래퍼로 패키징되기 때문입니다.
:::

## 지갑 생성 또는 복구 {#wallet}

팝업을 열고 다음 중 하나를 선택하세요.

- **지갑 생성** — 기기에서 새로운 24단어 복구 문구(256비트 엔트로피)를 생성하고, QoreChain 신원을 파생한 뒤, 비밀번호(그리고 선택적으로 패스키 — [보안](#security) 참고)로 잠긴 볼트에 봉인합니다.
- **지갑 가져오기** — 기존 24단어 문구로 복구합니다.

확장 프로그램은 자체적으로 키를 보관하므로 모바일 앱이 필요하지 않습니다. 팝업에서 니모닉을 내보낼 수도 있습니다. 키는 절대 기기 밖으로 나가지 않습니다.

### 외부 네트워크로 전송 {#send-external}

네이티브 레인의 QOR 외에도, 팝업에서 외부 네트워크의 자산을 전송할 수 있으며, 모두 동일한 복구 문구에서 파생됩니다.

| 종류 | 네트워크 | 기본 포함 토큰 |
|---|---|---|
| EVM | Ethereum, BNB Chain, Polygon, Arbitrum | ERC-20 항목 (해당되는 경우 USDT, USDC, DAI) |
| SVM | Solana | SPL 항목 (USDC, USDT) |
| Cosmos | Cosmos Hub, Osmosis, Celestia | IBC 항목 (Osmosis의 USDC), 선택적 메모 필드 |

외부 전송을 실행하기 전에 반드시 다음 확인 사항에 명시적으로 체크해야 합니다. **"외부 네트워크는 고전 서명만 허용합니다 — 귀하의 QOR와 달리 이 전송은 양자 내성이 없습니다."** 외부 체인은 포스트 양자 서명을 담을 수 없으며, QoreX는 이 사실을 결코 숨기지 않습니다.

## 지원하는 지갑 표준 {#standards}

QoreX는 세 가지 인터페이스를 제공하며, 모두 페이지에 `window.qorex` (`{ evm, native, svm }`)로 주입되고 [`@qorechain/connect`](/sdk/overview) 감지 규약을 통해 발견됩니다.

| 표준 | 개요 | 개발자에게 의미하는 것 |
|---|---|---|
| **EIP-1193** | Ethereum 프로바이더 JavaScript API (`request(...)`, 이벤트). | 기존 ethers.js / viem / web3.js 코드가 수정 없이 QoreX의 EVM 레인과 통신합니다. 숫자 오류 코드(예: `4902`)는 그대로 전달됩니다. |
| **EIP-6963** | 다중 지갑 프로바이더 감지 (announce / request 이벤트). | QoreX는 다른 모든 지갑과 나란히 자신을 알리며 **`window.ethereum`을 절대 덮어쓰지 않습니다**. 따라서 사용자는 충돌 없이 사이트별로 QoreX를 선택할 수 있습니다. |
| **Keplr 방식 `signDirect`** | `window.qorex.native`에 제공되는 Cosmos `OfflineDirectSigner` 형태의 프로바이더. | Cosmos 계열 dApp은 Keplr를 쓸 때와 동일한 방식으로 QoreChain **네이티브 레인** 트랜잭션에 서명합니다. 포스트 양자 계층은 미리 적용되어 있습니다([포스트 양자 서명](#pqc) 참고). |
| **Solana Wallet Standard** *(0.1.5부터)* | Solana dApp을 위한 네이티브 지갑 감지 (`wallet-standard:register-wallet` / `app-ready`). | Solana dApp이 **QoreX를 자동으로 감지**하므로 별도 연동이 필요 없습니다. 기능: `standard:connect`, `standard:disconnect`, `standard:events`, `solana:signMessage`, `solana:signTransaction`, `solana:signAndSendTransaction`. 체인은 `solana:mainnet`이며, `legacy`와 `v0` 트랜잭션을 모두 지원합니다. |

:::note SVM 레인에 직접 접근하기
동일한 인터페이스는 `window.qorex.svm` (`connect` / `signAndSendTransaction` / `signMessage`)에서도 사용할 수 있습니다. Wallet Standard 자동 감지와 완전히 구현된 SVM 레인은 **0.1.5**부터 제공되므로, 현재는 **Firefox**에서 사용할 수 있고 Chrome에서는 0.1.5가 심사를 통과한 뒤에 사용할 수 있습니다([브라우저별 배포 버전](#versions) 참고).

Solana 승인 화면은 해독된 페이로드(System 전송의 수신자와 lamports, 그리고 프로그램 목록)를 표시하고, 사용자의 지갑이 서명자로 포함되지 않은 트랜잭션은 거부하며, 서명을 **고전 서명**으로 표시합니다 — [포스트 양자 서명](#pqc)을 참고하세요.
:::

## 보안 및 권한 {#security}

QoreX는 단순히 신뢰를 요구하는 대신 검증할 수 있도록 설계되었습니다.

- **볼트** — 키는 **AES-256-GCM**으로 봉인됩니다. 비밀번호 경로는 **Argon2id** (RFC 9106, 메모리 하드: 64 MiB, t=3, p=1)로 키를 파생하므로, 볼트 데이터가 유출되더라도 GPU/ASIC 기반 크래킹에 강합니다. (기존 PBKDF2 데이터도 계속 열 수 있으며, 다음 잠금 해제 시 Argon2id로 재봉인됩니다.)
- **패스키 잠금 해제 (선택 사항, 0.1.5부터)** — 인증기가 **WebAuthn PRF** 확장을 지원하는 경우, QoreX는 비밀번호를 입력하는 대신 패스키의 32바이트 PRF 출력으로 볼트를 잠금 해제할 수 있습니다. 비밀번호는 언제나 대체 수단으로 남아 있습니다.

  :::note 패스키 잠금 해제가 표시되는 환경
  QoreX는 WebAuthn 지원 여부를 감지하여, 브라우저가 확장 프로그램 페이지에 이를 노출하는 경우에만 **패스키 잠금 해제 사용**을 표시합니다. 즉 **Chrome과 Edge**가 해당됩니다. **Firefox**에서는 확장 프로그램 페이지에 WebAuthn을 노출하지 않기 때문에 이 옵션이 숨겨집니다. [버전 차이](#versions)와 합쳐 보면, 현재 Firefox 사용자는 Wallet Standard는 쓸 수 있지만 패스키 잠금 해제는 쓸 수 없고, Chrome 사용자는 0.1.5가 심사를 통과하기 전까지 둘 다 쓸 수 없다는 뜻입니다. 이는 버그가 아니라 예상된 동작입니다.
  :::
- **Manifest V3 + 엄격한 CSP** — `script-src 'self'; object-src 'self'; base-uri 'self'`. 설치 이후 **원격 코드를 불러오지 않으며** `wasm-unsafe-eval`도 사용하지 않습니다.
- **계정 없음, 텔레메트리 없음** — 분석 도구, 추적, 원격 로깅, 가입 절차, 이메일이 모두 없습니다. Firefox 등록 정보에는 데이터 수집이 `none`으로 선언되어 있습니다.

### QoreX가 요청하는 권한과 그 이유 {#permissions}

이 항목이 존재하는 이유는, Firefox 등록 정보에 **"모든 웹사이트의 데이터에 접근"** 권한이 표시되기 때문입니다. 호스트 권한을 전혀 선언하지 않는 지갑에서는 모순처럼 보일 수 있습니다. 아래는 매니페스트에 있는 그대로의, 편집되지 않은 사실입니다.

확장 프로그램의 `manifest.json` 선언 내용은 다음과 같습니다.

```json
"permissions": ["storage"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
]
```

- **`permissions: ["storage"]`** — 유일한 API 권한입니다. 암호화된 볼트와 출처(origin)별 연결 승인 내역을 확장 프로그램 저장소에 **로컬로** 보관합니다.
- **`host_permissions: []`** — QoreX는 호스트 권한을 **전혀** 선언하지 않습니다. 사용자를 대신해 임의의 사이트로 교차 출처 네트워크 요청을 보낼 수 있는 권한을 요청하지 않습니다.
- **`content_scripts`가 `<all_urls>`와 일치** — Firefox가 *"모든 웹사이트의 데이터에 접근"* 이라고 표시하는 진짜 이유가 바로 이것입니다. QoreX는 작은 프로바이더 스크립트(`content.js` → `inpage.js`)를 **모든 페이지**에 주입합니다. 모든 사이트에서 실행되는 콘텐츠 스크립트는 기술적으로 페이지를 읽을 *수* 있으며, 브라우저는 그 권한을 `host_permissions`에서 왔든 콘텐츠 스크립트 일치 규칙에서 왔든 동일한 문구로 설명합니다.

**콘텐츠 스크립트가 모든 곳에서 실행되는 이유.** **어떤** dApp이든 사이트별 접근 권한을 먼저 부여받지 않고도 EIP-6963을 통해 지갑을 감지할 수 있도록 하기 위해서입니다. 이는 MetaMask, Keplr, Phantom을 비롯한 모든 주입형 지갑이 작동하는 방식과 같습니다. 주입된 프로바이더는 방문하는 사이트가 무엇이든 페이지의 스크립트가 실행되기 전에(`document_start`) 준비되어 있어야 합니다.

**이 스크립트가 하는 일과 하지 않는 일.** 이 스크립트는 지갑 메시지를 중계하는 일만 합니다(프로바이더 알림, 연결/서명 요청을 서비스 워커로 전달, 결과 반환). 해당 지갑 요청을 넘어 페이지 내용을 읽거나, 서버로 무언가를 전송하거나, 원격 코드를 불러오지 **않습니다**. 또한 호스트 권한이 없기 때문에 임의의 교차 출처 데이터를 가져올 수도 없습니다. 이 모든 사항은 검증 가능합니다. 확장 프로그램은 CSP로 잠겨 있고, 분석 도구를 포함하지 않으며, Firefox 패키지에는 재현 가능한 소스 zip이 포함되어 있습니다.

## dApp을 QoreX에 연결하기 {#connect}

dApp은 **EIP-6963**을 통해 QoreX의 EVM 레인을 감지합니다. announce-and-request 방식으로 감지한 뒤, 반환된 EIP-1193 프로바이더를 사용하세요.

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

QoreChain **네이티브** 레인의 경우 `window.qorex.native`에 있는 Keplr 방식 프로바이더(`enable`, `getKey`, `signDirect`)를 사용하세요. 상위 수준 패키지인 [`@qorechain/connect`](/sdk/overview)가 이 감지 과정을 대신 처리해 줍니다.

승인은 **출처별**로 이루어집니다. 사이트에 처음 연결할 때 출처를 표시하는 승인 팝업이 열리고, 승인하면 공개 주소만 공개되며, 한 사이트의 승인이 다른 사이트에는 어떤 권한도 부여하지 않습니다.

### 대시보드 브리지 (v0.1.5) {#dashboard-bridge}

0.1.5 버전은 **`dashboard.qorechain.io` 전용**으로 범위가 한정된 브리지를 추가합니다. `window.qorex.native.connectProof(sessionId)`는 *Connect with QoreX* 페어링 증명에 서명하고(백엔드가 서명을 재검증합니다), `executeTransfer({ to, amountUqor, memo })`는 대시보드가 제안한 QOR 전송을 승인·브로드캐스트하고 `txHash`를 반환합니다. 이 메서드들은 다른 모든 출처에서는 거부됩니다.

## 포스트 양자 서명 {#pqc}

QoreX가 직접 시작하는 모든 QOR 전송은 **하이브리드 포스트 양자 서명**으로 서명됩니다. 즉 고전 secp256k1 서명과 함께 **ML-DSA-87**(Dilithium-5, NIST **FIPS-204**)이 사용되며, `@qorechain/sdk`의 완전한 하이브리드 파이프라인을 거칩니다. **끄고 켜는 설정은 없습니다.** QoreChain이 이를 요구하며, QoreX는 이 서명 없이는 네이티브 레인 QOR 전송을 절대 보내지 않습니다.

- **dApp이 시작하는 네이티브 서명** — qorechain-connect 플로우 기반 dApp은 `signDirect`를 호출하기 전에 트랜잭션 본문에 PQC 확장(`/qorechain.pqc.v1.PQCHybridSignature`)을 미리 넣습니다. QoreX는 고전 서명 부분을 담당하며 **맹목적 서명을 거부**하고, 페이로드를 해독한 뒤 PQC 계층이 있는지 여부를 표시합니다.
- **고전 요청은 항상 표시됩니다** — 요청에 PQC 계층이 없거나 외부 체인(ETH/BNB 등, PQC를 담을 수 없음)을 대상으로 하는 경우, QoreX는 조용히 등급을 낮추지 않고 명시적인 경고를 표시합니다.

**트랜잭션 크기에 미치는 영향.** ML-DSA-87은 서명 크기가 큽니다. 서명은 **4,627 bytes**, 공개키는 **2,592 bytes**입니다(FIPS-204에 의해 고정). 따라서 하이브리드 QoreChain 트랜잭션은 순수 고전 트랜잭션보다 수 킬로바이트 더 큽니다. 트랜잭션을 직접 구성하고 브로드캐스트한다면 추가 바이트를 감안해 버퍼와 수수료 추정치를 잡으세요. QoreChain의 가스 산정은 이미 이를 반영하고 있습니다. 기본 요소와 결정적 서명 요구 사항은 [포스트 양자 서명](/developer-guide/post-quantum-signing)을 참고하세요.
