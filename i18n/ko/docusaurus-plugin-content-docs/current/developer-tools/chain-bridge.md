---
slug: /developer-tools/chain-bridge
title: 체인 브리지와 handle
sidebar_label: 체인 브리지와 handle
sidebar_position: 3
---

# 체인 브리지와 handle

이 페이지는 서버 측의 작은 패키지 두 개를 다룹니다.

**`@qorechain/chain-bridge`**(0.2.3)는 사람이 키보드 앞에 없이 QoreChain에서 동작하는 백엔드를 위한 Node.js 라이브러리입니다. QOR 전송, 계정의 ML-DSA-87 키 등록, 라이트 노드 등록, 컨트랙트 배포를 수행하며, 체인의 라이선스 권한 키를 가진 주체를 위해 라이선스 부여와 취소도 수행합니다. 일반 백엔드가 혼자서는 할 수 없는 두 가지, 즉 네이티브 레인 트랜잭션에 필요한 ML-DSA-87 하이브리드 서명과 QoreChain 커스텀 메시지의 정확한 protobuf 인코딩을 처리합니다. 핫 월렛 워커, 결제 및 대시보드 백엔드 같은 서비스를 위한 패키지입니다.

**`@qorechain/handles`**(0.1.0)는 QoreX `@handle`을 주소로 해석하고, 반환하기 전에 그 답을 암호학적으로 검증합니다. 사용자가 `qor1...` 주소 대신 `@alice`를 입력할 수 있게 하는 지갑과 서비스를 위한 패키지입니다.

두 패키지 모두 레지스트리 메타데이터에 소스 저장소가 나열되어 있지 않습니다. 게시된 코드는 npm에서 읽을 수 있습니다.

## 혁신 {#innovations}

### 체인 브리지 {#innovations-chain-bridge}

- **니모닉 하나, 표준 ML-DSA-87 키 하나.** 키는 `SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)`에 이어 ML-DSA-87 키 생성으로 파생되며, [지갑 어댑터](/developer-tools/wallet-adapter), SDK, QoreX와 같은 파생 방식이므로 `qorechaind tx pqc recover-key`로 키를 복구할 수 있습니다. 이전 도구가 `SHAKE-256(mnemonic)`으로 등록한 계정은 기존 키를 유지합니다. 표준 서명이 검증 실패로 거부되면 브리지는 기존 키로 한 번 재시도합니다.
- **체인에서 읽어오는 서명 바이트 형식.** `cosmosRest`를 설정하면 브리지는 노드에 적용된 업그레이드 플랜(`v3.2.0`과 `v3.1.98`)을 물어보고, 둘 중 하나라도 적용되었으면 v2 형식으로 서명합니다. 자세한 내용은 [지갑 어댑터 페이지](/developer-tools/wallet-adapter#innovations)에 있습니다. 체인이 `pqc` 코드 21로 거부하면 한 번 다시 해석하고 다시 서명합니다. 실제 네트워크에서는 `cosmosRest`가 필수이며, 없으면 하이브리드 호출은 추측하지 않고 오류를 발생시킵니다.
- **첫 사용 시 키를 등록하되, 먼저 체인을 확인합니다.** PQC 키가 없다는 이유로 하이브리드 트랜잭션이 거부되면, 브리지는 `MsgRegisterPQCKeyV2`(첫 등록에는 체인이 허용하는 기존 방식의 트랜잭션)를 보내고 재시도합니다. 이 메시지는 거부되더라도 수수료가 들기 때문에, 먼저 `GET /qorechain/pqc/v1/account/{address}`를 읽습니다. 계정이 이미 키를 가지고 있고 그 키가 니모닉의 표준 키도 기존 키도 아니면 `pqc_key_mismatch`를 던지고 아무것도 보내지 않습니다. `cosmosRest`가 있으면, 네트워크가 v3.2.3을 적용한 뒤(메인넷과 테스트넷 모두 적용됨) 등록에는 소유 증명도 함께 담깁니다.
- **일반 이름으로 라이선스 기능 ID 생성.** `featureIdsFor({ type, chains })`는 제품 설명을 체인의 기능 ID(`validator_operator`와 `validator_<chain>`, `lightnode_operator`, `qcb_bridge`와 `bridge_<chain>`)로 매핑하고, "Solana"나 "BNB Chain" 같은 자유 형식의 체인 이름을 정규화하며, 알 수 없는 체인은 체인이 거부할 ID를 만드는 대신 제외합니다. 2026년 10월 27일 확인: `featureIdsFor({ type: "validator", chains: ["Solana", "Ethereum", "Foo"] })`는 `validator_operator`, `validator_solana`, `validator_ethereum`을 반환하고 `Foo`는 제외했습니다.
- **순수 JavaScript, 네이티브 애드온 없음.** Node.js 18 이상용 ES 모듈이므로 서버리스 워커에서도 실행됩니다. 메인 진입점 외에 `@qorechain/chain-bridge/proto`(와이어 인코더)와 `@qorechain/chain-bridge/features`(기능 매핑)를 내보냅니다.

### Handles {#innovations-handles}

- **해석 결과는 반환되기 전에 두 번 검증됩니다.** 레코드에는 클라이언트에 고정해 둔 레지스트리 공개 키로 검증하는 레지스트리의 ed25519 서명이 있어야 하며, 소유자 본인의 클레임에 대한 secp256k1 서명도 있어야 하고 그 공개 키의 해시가 레코드의 `qor1` 주소와 일치해야 합니다. 둘 중 하나라도 실패한 레코드는 절대 반환되지 않습니다.
- **핀 저장소는 사용자가 관리합니다.** `resolve`는 레코드를 보유한 핀과 비교하여 `pin.status`를 `new`, `match`, `CHANGED` 중 하나로 반환하며, 스스로 핀을 만들지 않습니다. 사용자가 주소를 확인하고 진행한 후에 핀을 만듭니다. 핀의 목적은 레지스트리가 다른 답을 하기 시작했음을 알아차리는 것이므로, 검사 대상이 아닌 쪽, 예를 들어 사용자의 기기에 보관해야 합니다.
- **네트워크별로 소유자가 서명한 주소만 반환됩니다.** `addressForNetwork(record, caip2)`는 QoreChain 네트워크에는 `qor1` 주소를, 레코드가 통합 계정일 때 체인 ID 9800과 9801에는 `0x` 주소를 반환합니다. 레지스트리가 단지 증명할 뿐인 다른 체인의 주소는 전송용으로 반환되지 않습니다.
- **표시 전용 역방향 조회.** `reverse(address)`는 기록에 표시할 handle을 반환합니다. 그 결과가 전송의 목적지가 되어서는 안 됩니다.
- **클레임과 삭제는 별도의 서명 도메인을 사용합니다.** `signClaim`과 `signDelete`는 서로 다른 메시지에 서명하므로, 삭제 서명을 클레임으로 재생할 수 없습니다.

## 사용 방법 {#how-to-use}

### 체인 브리지 {#use-chain-bridge}

```bash
npm install @qorechain/chain-bridge
```

이 패키지는 `@qorechain/wallet-adapter`(^0.4.0), `@qorechain/pqc`(^0.2.1), cosmjs 0.32, ethers 6을 함께 가져옵니다. 테스트된 퀵스타트는 없으며, 아래 스니펫은 패키지 타입 정의와 [거래소 통합 가이드](/developer-guide/exchange-integration#chain-bridge)를 따릅니다. 2026년 10월 27일에 게시된 0.2.3 패키지에 대해 생성자, `featureIdsFor`, 메서드 목록을 확인했으며 트랜잭션은 보내지 않았습니다.

```js
import { ChainBridge } from "@qorechain/chain-bridge";

const bridge = new ChainBridge({
  cosmosRpc: "https://rpc-testnet.qore.host",
  cosmosRest: "https://api-testnet.qore.host", // picks the sign-bytes form; required on both live networks
  chainId: "qorechain-diana",
  signerMnemonic: process.env.WORKER_MNEMONIC, // from your secrets manager, never in source code
});

// Once per account (the bridge also does it on first use if the chain reports no key).
await bridge.registerPqc({ mnemonic: process.env.WORKER_MNEMONIC });

// Amounts are in uqor (6 decimals): 1 QOR = 1000000.
const { txHash, code } = await bridge.sendTokens({ to: "qor1...", amountUqor: "1000000" });
```

주요 메서드:

| 메서드 | 기능 | 사용하는 키 |
|---|---|---|
| `sendTokens({ to, amountUqor })` | bank `MsgSend`, 하이브리드 서명 | 서명자 |
| `registerPqc({ mnemonic })` | `MsgRegisterPQCKeyV2`, 기존 방식 | 해당 계정 |
| `registerLightNode({ operatorMnemonic, nodeType, version, capabilities })` | 라이트 노드 등록, 하이브리드 서명 | 운영자 |
| `grantLicense`, `grantLicenseSet`, `revokeLicense`, `suspendLicense`, `resumeLicense` | 라이선스 모듈 메시지 | 체인의 라이선스 권한 키 |
| `deployEvm({ bytecode, abi, args })` | `eth_sendRawTransaction`을 통한 이더리움 방식 배포 | 배포자 키 |
| `deploySvm({ bytecode })` | SVM 프로그램 배포 | 서명자 |
| `createVestingAccount`, `createPeriodicVestingAccount` | 베스팅 계정 생성 | 서명자 |
| `featureIdsFor`, `normalizeChain` | 로컬 헬퍼 | 없음 |

모든 호출은 `{ txHash, code, height, gasUsed }`를 반환하며, 하이브리드 호출은 `signBytesVersion`도 보고합니다. 기본 가스 가격은 가스당 0.1 uqor로 네트워크 하한입니다(300,000 가스의 `sendTokens`는 이 가격에서 30,000 uqor이고, 키 등록의 기본값 6,000,000 가스는 600,000 uqor이며 계정당 한 번만 지불합니다). EVM 레인은 소수점 18자리를 사용하므로 `deployEvm`의 `value`는 wei 단위입니다. 기본 코인 타입 118 키 대신 통합 eth-native 키(`qor1`, `0x`, SVM으로 표현되는 하나의 신원)로 서명하려면 설정에 `keyType: "eth_secp256k1"`을 지정하세요. 이 옵션은 소스와 지갑 어댑터 README에는 있지만 타입 정의에는 없습니다.

### Handles {#handles}

```bash
npm install @qorechain/handles
```

런타임 의존성은 `@noble/curves`, `@noble/hashes`, `bech32`뿐입니다. 테스트된 퀵스타트는 없습니다. 아래 스니펫은 패키지 README와 타입 정의를 따릅니다. 2026년 10월 27일에 게시된 0.1.0 패키지에서 `isHandleInput`, `normalizeHandle`, 내보내기 목록을 확인했으며 레지스트리에는 접속하지 않았습니다.

```ts
import { HandleClient, type PinStore } from "@qorechain/handles";

const client = new HandleClient({ baseUrl: registryUrl, registryPubkeyHex });

// You supply the pin store, ideally on the user's device.
const pins: PinStore = { get: (handle) => load(handle), put: (pin) => save(pin) };

const { record, pin } = await client.resolve("@alice", pins);

if (pin.status === "CHANGED") {
  // Stop. Show both addresses in full and require explicit confirmation.
  // Never update the pin silently.
}

// Show record.qorAddress to the user. When they proceed (and only then):
await client.pin(record, pins, Date.now());
```

`resolve`는 handle을 알 수 없거나, 레지스트리에 연결할 수 없거나, 답이 검증에 실패하면 오류를 던집니다. `isHandleInput(text)`는 handle과 주소를 구별합니다(handle은 `a-z`, `0-9`, `_`로 이루어진 3자에서 20자이거나 `@`로 시작하며, `qor1...` 또는 `0x...` 문자열은 절대 handle이 아닙니다). 그 밖의 내보내기: `claimSignBytes`, `signClaim`, `deleteSignBytes`, `signDelete`, `verifyResolution`, `checkPin`, `QorexError`. QoreX가 handle을 사용하는 방법은 [@handle로 보내기](/qorex/browser-extension#handle-send)와 [계정 및 대시보드](/qorex/account-and-dashboard)를 참조하세요.

## 접근 방법 {#how-to-access}

- **네트워크:** 체인 브리지는 [개발자 패키지](/developer-tools/overview#how-to-access) 페이지에 나열된 엔드포인트로 메인넷 `qorechain-vladi` 또는 테스트넷 `qorechain-diana`에 대해 실행됩니다(`deployEvm`에는 EVM RPC와 체인 ID 9800 또는 9801).
- **체인 브리지 사전 요구 사항:** Node.js 18 이상, 워커가 니모닉을 보유한 자금이 있는 계정(시크릿 매니저에 보관), 그리고 네트워크의 REST URL. ML-DSA-87 키는 니모닉에서 파생되어 첫 사용 시 등록되므로, 계정에는 그 등록 수수료를 낼 만큼의 QOR이 있어야 합니다.
- **라이선스 호출**은 체인이 라이선스 권한으로 설정한 키로 서명했을 때만 성공합니다. 외부 개발자는 이 키를 가지고 있지 않으므로, 이 메서드들은 해당 키의 운영자를 위한 것입니다. 사용자로서의 라이선스와 라이트 노드 등록은 [등록 및 라이선스](/light-node/registration-and-licensing)를 참조하세요.
- **Handles 사전 요구 사항:** 레지스트리의 기본 URL과 ed25519 공개 키(hex), 직접 구현하는 핀 저장소, 그리고 `fetch`. 읽기에는 계정이 필요하지 않습니다.
- **비용:** 두 패키지 모두 무료입니다. 체인 브리지 트랜잭션은 네트워크 수수료를 지불합니다.

## 게시 위치 {#where-published}

| 레지스트리 | 패키지 | 버전 | 링크 |
|---|---|---|---|
| npm | `@qorechain/chain-bridge` | 0.2.3 (2026년 10월 20일 게시) | [npmjs.com](https://www.npmjs.com/package/@qorechain/chain-bridge) |
| npm | `@qorechain/handles` | 0.1.0 (2026년 8월 게시) | [npmjs.com](https://www.npmjs.com/package/@qorechain/handles) |

두 패키지 모두 Apache-2.0이며 npm에만 게시되어 있습니다(PyPI, crates.io, Maven Central, Go 프록시에는 없음). 레지스트리 메타데이터에 소스 저장소가 나열되어 있지 않으므로 연결할 공개 소스 페이지가 없으며, 코드는 게시된 tarball에 들어 있습니다. 실시간 버전을 읽으려면 [실시간 버전 확인 방법](/developer-tools/overview#live-versions)을 참조하세요.

## 제한 사항 및 알려진 문제 {#limits}

### 체인 브리지 {#limits-chain-bridge}

- **EVM 배포에는 열려 있는 윈도우가 필요합니다.** `deployEvm`은 표준 이더리움 트랜잭션을 보냅니다. 체인 v3.2.0부터 EVM 레인은 등록된 ML-DSA-87 키가 있고 열려 있는 EVM 인가 윈도우가 있는 계정의 트랜잭션만 허용하는데, 브리지에는 윈도우를 여는 메서드가 없습니다. 호출하기 전에 다른 도구([지갑 어댑터](/developer-tools/wallet-adapter#evm-window), SDK, QoreX)로 윈도우를 여세요. 그렇지 않으면 트랜잭션이 거부됩니다(codespace `pqc`, 코드 26, 27 또는 28). 이는 체인 규칙과 패키지 소스에 따른 것이며, 이 페이지를 위해 실제 네트워크에서 시도해 보지는 않았습니다. 패키지 README는 아직 EVM 레인이 면제라고 설명하는데, 이는 오래된 내용입니다.
- **`deploySvm`**은 SVM 레인을 대상으로 하며, SVM 레인은 어느 네트워크에서도 아직 트랜잭션을 받지 않습니다.
- **컨트랙트 업로드 메서드는 있지만 문서화되어 있지 않습니다.** 소스에는 QoreChain Native 컨트랙트용 `storeWasm`, `instantiateWasm`, `deployWasm`도 있으나 타입 정의와 README에는 없습니다. 실제 네트워크에서 업로드는 일반 계정에게 거버넌스 전용이므로, 일반 계정은 거부될 것으로 예상하세요.
- **키는 서버에서 파생됩니다.** 니모닉은 프로세스 안에 머뭅니다. 로그와 소스 관리에 남기지 말고, 개인 지갑으로 재사용하지 마세요.
- **등록은 무료가 아닙니다.** 브리지는 첫 사용 시 스스로 키를 등록합니다. 자금을 옮기는 레일은 미리 등록하고 첫 출금 전에 `GET /qorechain/pqc/v1/account/{address}`로 결과를 확인해야 합니다.
- **cosmjs 0.32.** 한 프로젝트에서 SDK(cosmjs 0.39)와 함께 설치하지 마세요. npm이 `ERESOLVE`를 보고합니다.
- **오래된 README 부분.** README는 메인넷이 첫 번째 서명 바이트 형식에 머문다고 설명하지만, 두 네트워크 모두 v2를 검증합니다([포스트 양자 보안](/architecture/post-quantum-security) 참조).
- **테스트된 퀵스타트도, 공개 소스 저장소도 없습니다.**

### Handles {#limits-handles}

- **레지스트리 주소와 공개 키는 게시되어 있지 않습니다.** 패키지에도, 이 매뉴얼에도 없습니다. QoreX와 대시보드에는 내장되어 있으므로, 통합하는 쪽은 이 두 값을 받아야만 패키지를 사용할 수 있습니다.
- **Handle은 온체인 이름이 아닙니다.** 레지스트리는 QoreX를 위해 운영되는 오프체인 서비스이며, 패키지는 그 답을 검증할 수 있지만 서비스가 가용하도록 만들 수는 없습니다. 레지스트리에 연결할 수 없으면 `resolve`는 `NETWORK_UNAVAILABLE` 오류를 던지며, `isReachable()`은 UI가 handle 기능을 숨기는 데 쓸 수 있는 빠른 점검입니다.
- **대신 핀을 만들어 주지 않습니다.** `pin`을 호출하지 않으면 모든 해석이 `new`로 보고됩니다. 핀을 안전하게 저장할 책임은 호출자에게 있습니다.
- **전송에는 소유자가 서명한 주소만 사용됩니다.** 레지스트리가 증명하는 다른 체인의 주소는 `addressForNetwork`가 반환하지 않습니다.
- **쓰기 호출에는 패키지 외에 더 필요한 것이 있습니다.** `claim`, `deleteHandle`, `bySub`는 레지스트리의 쓰기 엔드포인트와 통신하며 소유자 서명(`signClaim`, `signDelete`) 또는 계정 토큰이 필요합니다. 지갑 앱을 위한 것입니다.
- **테스트된 퀵스타트도, 공개 소스 저장소도 없습니다.**
