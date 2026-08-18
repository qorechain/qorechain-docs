---
slug: /qorex/browser-extension
title: QoreX 브라우저 확장 프로그램
sidebar_label: 브라우저 확장 프로그램
sidebar_position: 2
---

# QoreX 브라우저 확장 프로그램

QoreX **브라우저 확장 프로그램**은 데스크톱용 QoreChain 지갑입니다. 이는 **독립형 지갑** — 지갑을 생성하거나 가져오고, QOR를 보관 및 전송하며, dApp에 연결할 수 있습니다 — 이며, 모든 웹사이트가 QoreX를 발견하고 모든 요청을 명시적이고 해독된 승인으로 바꿀 수 있게 해 주는 구성 요소입니다.

이 확장 프로그램은 세 개의 스토어에서 **정식으로 공개되어 사용 가능**합니다.

## 설치 {#install}

| 브라우저 | 설치 |
|---|---|
| **Chrome 및 Chromium 기반 브라우저** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 10.14 이상)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

현재 공개 빌드는 **0.1.3**입니다. 버전 **0.1.5**가 현재 배포 중이며, [대시보드 연결 브리지](#dashboard-bridge)를 추가합니다. 이러한 버전들 사이에서 권한 표면은 변경되지 않았습니다.

:::note
Safari에서는 승인이 팝업 창이 아니라 브라우저 탭에서 열립니다 — 이 확장 프로그램은 동일한 코드베이스로부터 Apple의 Safari 웹 확장 래퍼로 패키징되어 있습니다.
:::

## 지갑 생성 또는 복원 {#wallet}

팝업을 열고 다음을 선택하세요:

- **지갑 생성** — 기기에서 새로운 24단어 복구 문구(256비트 엔트로피)를 생성하고, QoreChain 신원을 파생하며, 비밀번호(그리고 선택적으로 패스키 — [보안](#security) 참고)로 볼트에 봉인합니다.
- **지갑 가져오기** — 기존 24단어 문구로부터 복원합니다.

확장 프로그램은 자체 키를 보유하며, 모바일 앱을 필요로 하지 않습니다. 팝업에서 니모닉을 내보낼 수도 있습니다. 키는 기기를 절대 벗어나지 않습니다.

## 지원되는 지갑 표준 {#standards}

QoreX는 세 가지 인터페이스를 노출하며, 모두 페이지에 `window.qorex`(`{ evm, native, svm }`)로 주입되고 [`@qorechain/connect`](/sdk/overview) 탐지 계약을 통해 발견됩니다.

| 표준 | 이것이 무엇인지 | 개발자로서 당신에게 의미하는 것 |
|---|---|---|
| **EIP-1193** | 이더리움 프로바이더 JavaScript API(`request(...)`, 이벤트). | 기존 ethers.js / viem / web3.js 코드가 QoreX의 EVM 레인과 그대로 통신합니다. 숫자 오류 코드(예: `4902`)는 그대로 전달됩니다. |
| **EIP-6963** | 다중 지갑 프로바이더 탐지(announce / request 이벤트). | QoreX는 다른 모든 지갑과 나란히 자신을 알립니다 — **`window.ethereum`을 절대 덮어쓰지 않습니다** — 따라서 사용자는 충돌 없이 사이트마다 QoreX를 선택할 수 있습니다. |
| **Keplr 패턴 `signDirect`** | `window.qorex.native`에 있는 Cosmos `OfflineDirectSigner` 형태의 프로바이더. | Cosmos 방식의 dApp은 Keplr와 동일한 방식으로 QoreChain **Native 레인** 트랜잭션에 서명합니다. 포스트 양자 계층이 미리 적용됩니다([포스트 양자 서명](#pqc) 참고). |

:::note SVM (Solana 호환)
SVM 프로바이더가 `connect` / `signAndSendTransaction` / `signMessage`와 함께 `window.qorex.svm`에 노출됩니다. QoreX는 아직 Solana **Wallet Standard** 탐지 프로토콜을 통해 등록하지 **않으므로**, Wallet-Standard 자동 탐지에 의존하는 Solana dApp은 QoreX를 자동으로 감지하지 못합니다 — 당분간은 `window.qorex.svm`을 통해 직접 접근하세요.
:::

## 보안 및 권한 {#security}

QoreX는 단순히 신뢰받기 위해서가 아니라 검증 가능하도록 만들어졌습니다:

- **볼트** — 당신의 키는 **AES-256-GCM**으로 봉인됩니다. 비밀번호 경로는 **Argon2id**(RFC 9106, 메모리 하드: 64 MiB, t=3, p=1)로 키를 파생하므로, 탈취된 볼트 블롭은 GPU/ASIC 크래킹에 저항합니다. (레거시 PBKDF2 블롭은 여전히 열 수 있으며 다음 잠금 해제 시 Argon2id로 다시 봉인됩니다.)
- **패스키 잠금 해제(선택 사항)** — 당신의 인증기가 **WebAuthn PRF** 확장을 지원하는 경우, QoreX는 입력한 비밀번호 대신 패스키의 32바이트 PRF 출력으로 볼트를 잠금 해제할 수 있습니다.
- **Manifest V3 + 엄격한 CSP** — `script-src 'self'; object-src 'self'; base-uri 'self'`. 설치 후 **원격 코드 로딩이 없으며** `wasm-unsafe-eval`도 없습니다.
- **계정 없음, 텔레메트리 없음** — 분석, 추적, 원격 로깅, 가입, 이메일이 없습니다. Firefox 목록은 데이터 수집을 `none`으로 선언합니다.

### QoreX가 요청하는 권한과 그 이유 {#permissions}

이 섹션은 Firefox 목록이 **"모든 웹사이트의 데이터에 접근"** 권한을 표시하기 때문에 존재하며, 이는 호스트 권한을 선언하지 않는 지갑과 상충하는 것처럼 보일 수 있습니다. 다음은 매니페스트에서 나온 정확하고 편집되지 않은 진실입니다.

확장 프로그램의 `manifest.json`은 다음을 선언합니다:

```json
"permissions": ["storage"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
]
```

- **`permissions: ["storage"]`** — 유일한 API 권한입니다. 암호화된 볼트와 오리진별 연결 승인을 **로컬로**, 확장 프로그램 저장소에 저장합니다.
- **`host_permissions: []`** — QoreX는 호스트 권한을 **전혀** 선언하지 않습니다. 당신을 대신하여 임의의 사이트에 교차 오리진 네트워크 요청을 할 수 있는 능력을 요청하지 않습니다.
- **`content_scripts`가 `<all_urls>`와 일치** — 이것이 Firefox가 *"모든 웹사이트의 데이터에 접근"*이라고 말하는 정직한 이유입니다. QoreX는 작은 프로바이더 스크립트(`content.js` → `inpage.js`)를 **모든 페이지**에 주입합니다. 모든 사이트에서 실행되는 콘텐츠 스크립트는 기술적으로 페이지를 읽을 *수* 있으며, 브라우저는 그것이 `host_permissions`에서 왔든 콘텐츠 스크립트 일치에서 왔든 그 정확한 표현으로 그 기능을 설명합니다.

**콘텐츠 스크립트가 모든 곳에서 실행되는 이유.** **어떤** dApp이든 먼저 사이트별 접근을 부여하지 않고도 EIP-6963을 통해 지갑을 발견할 수 있게 하기 위해서입니다. 이것이 MetaMask, Keplr, Phantom 및 다른 모든 주입형 지갑이 작동하는 방식입니다: 주입된 프로바이더는 당신이 방문하는 어떤 사이트에서든 페이지의 스크립트가 실행되기 전에(`document_start`) 존재해야 합니다.

**그 스크립트가 하는 일 — 그리고 하지 않는 일.** 오직 지갑 메시지를 중계할 뿐입니다(프로바이더를 알리고, connect/sign 요청을 서비스 워커로 전달하며, 결과를 반환합니다). 그러한 지갑 요청을 넘어서 페이지 콘텐츠를 읽거나, 서버로 무언가를 전송하거나, 원격 코드를 로드하지 **않습니다** — 그리고 호스트 권한이 없기 때문에 임의의 교차 오리진 데이터를 가져올 수 없습니다. 이 모든 것은 검증 가능합니다: 확장 프로그램은 CSP로 잠겨 있고, 분석을 전혀 탑재하지 않으며, Firefox 패키지에는 재현 가능한 소스 zip이 포함되어 있습니다.

## dApp을 QoreX에 연결하기 {#connect}

dApp은 **EIP-6963**을 통해 QoreX의 EVM 레인을 발견합니다. announce-and-request 후, 반환된 EIP-1193 프로바이더를 사용하세요:

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

QoreChain **Native** 레인의 경우, `window.qorex.native`에 있는 Keplr 패턴 프로바이더(`enable`, `getKey`, `signDirect`)를 사용하세요. 상위 수준의 [`@qorechain/connect`](/sdk/overview) 패키지가 이 탐지를 대신 감싸줍니다.

승인은 **오리진별**입니다: 사이트에 대한 첫 연결은 오리진을 보여주는 승인 팝업을 열고, 승인하면 당신의 공개 주소만 드러나며, 한 사이트의 승인은 다른 사이트에 아무것도 부여하지 않습니다.

### 대시보드 브리지 (v0.1.5) {#dashboard-bridge}

버전 0.1.5는 **`dashboard.qorechain.io`에만** 범위가 한정된 브리지를 추가합니다: `window.qorex.native.connectProof(sessionId)`는 *Connect with QoreX* 페어링 증명에 서명하고(백엔드가 서명을 재검증함), `executeTransfer({ to, amountUqor, memo })`는 대시보드가 제안한 QOR 전송을 승인 및 브로드캐스트하여 `txHash`를 반환합니다. 이 메서드들은 다른 어떤 오리진에서도 거부됩니다.

## 포스트 양자 서명 {#pqc}

QoreX 자체가 시작하는 모든 QOR 전송은 **하이브리드 포스트 양자 서명** — 고전 secp256k1 서명과 함께 **ML-DSA-87**(Dilithium-5, NIST **FIPS-204**) — 으로 서명되며, `@qorechain/sdk`의 완전한 하이브리드 파이프라인을 사용합니다. **토글은 없습니다**: QoreChain이 이를 요구하며 QoreX는 이 없이는 Native 레인 QOR 전송을 절대 보내지 않습니다.

- **dApp이 시작한 Native 서명** — qorechain-connect 흐름 위에 구축된 dApp은 `signDirect`를 호출하기 전에 트랜잭션 본문에 PQC 확장(`/qorechain.pqc.v1.PQCHybridSignature`)을 미리 계층화합니다. QoreX는 고전 절반을 기여하며 **블라인드 서명을 거부하고**, 페이로드를 해독하여 PQC 계층이 존재하는지 여부를 표시합니다.
- **고전 요청은 항상 라벨이 붙습니다** — 요청에 PQC 계층이 없거나, 외부 체인(ETH/BNB/등, PQC를 담을 수 없음)을 대상으로 하는 경우, QoreX는 조용히 다운그레이드하는 대신 명시적인 경고를 표시합니다.

**이것이 트랜잭션 크기에 의미하는 것.** ML-DSA-87은 큰 서명입니다: 서명은 **4,627 bytes**이고 공개 키는 **2,592 bytes**입니다(FIPS-204에 의해 고정됨). 따라서 하이브리드 QoreChain 트랜잭션은 순수 고전 트랜잭션보다 수 킬로바이트 더 큽니다. 트랜잭션을 직접 빌드하고 브로드캐스트하는 경우, 추가 바이트에 맞게 버퍼와 수수료 추정치를 조정하세요. QoreChain의 가스 회계는 이미 이를 예상하고 있습니다. 기본 요소와 결정론적 서명 요구 사항에 대해서는 [포스트 양자 서명](/developer-guide/post-quantum-signing)을 참고하세요.
