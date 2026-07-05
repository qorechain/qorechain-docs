---
slug: /sdk/guides/authenticators
title: 인증자(Authenticator)와 위임 지출
sidebar_label: 인증자
sidebar_position: 8
---

# 인증자(Authenticator)와 위임 지출

**인증자 레인**(SDK 0.7.0, 체인 **v3.1.85**)을 사용하면 연결된 외부 키 —
Phantom **ed25519** 키 또는 MetaMask / EVM **secp256k1** 키 — 가 최소 권한,
지출 한도, 철회 가능한 조건 하에서 단 하나의 정식(canonical) **PQC 필수**
계정에서 지출할 수 있으며, **외부 키가 ML-DSA 공동 서명을 생성할 필요가
전혀 없습니다**.

이는 체인의 [계정 추상화](/developer-guide/account-abstraction) 모듈에
대응하는 SDK 기능입니다.

## 릴레이어 모델

**릴레이어(relayer)** 가 트랜잭션을 제출하고 수수료를 지불합니다. 릴레이어
자신의 하이브리드(클래식 + ML-DSA-87) 서명이 봉투(envelope)에 대한 ante
핸들러 검증을 충족하므로, 정식 계정의 PQC 서명은 온체인에서 **필요하지
않습니다**. 대신 도메인 분리(domain-separated)되고 리플레이가 방지된
**sign-bytes** 다이제스트에 대한 연결된 키의 서명이 승인 역할을 합니다.

```text
 Phantom / MetaMask key            Relayer (pays fees)             Chain
 ─────────────────────            ───────────────────            ─────
 sign(authSignBytes)  ──────────▶ wrap in Msg, sign envelope ──▶ verify authenticator sig
                                                                  check permission + rule
                                                                  spend FROM canonical account
```

릴레이어는 소유자와 **다른** 계정이므로 해당 계정의 EVM 논스를 증가시키지
않습니다.

## 세 가지 레인

| 레인 | 메시지 | Sign-bytes | 지출 대상 |
| --- | --- | --- | --- |
| EVM | `MsgExecuteEVM` | `evmAuthSignBytes` | 계정의 `0x` 주소에서 네이티브 QOR / EVM 호출 |
| Native | `MsgExecuteCosmos` | `cosmosAuthSignBytes` | 계정에서 `x/bank`를 통한 네이티브 QOR |
| 키 로테이션 | `MsgRotatePQCKey` | `rotationSignBytes` | (계정의 PQC 키를 교체) |

메시지 타입 URL은 `/qorechain.abstractaccount.v1.MsgExecuteEVM`,
`/qorechain.abstractaccount.v1.MsgExecuteCosmos`,
`/qorechain.pqc.v1.MsgRotatePQCKey`입니다.

## Phantom 인증자 등록하기

키 연결은 **소유자 서명**(정식 계정이 수행하는 일반적인 하이브리드
트랜잭션)으로 이루어집니다. `MsgRegisterAuthenticator`는 키(스킴 + 원시
공개키 바이트), 부여된 `permissions`, 그리고 `expiryUnix` 세션 만료 시각을
지정합니다. 지출 한도는 `MsgUpdateSpendingRules`를 통해 `SpendingRule`로
첨부합니다:

```ts
import { msg } from "@qorechain/sdk";

// The Phantom wallet in the browser:
const phantomPubkey = window.solana.publicKey.toBytes(); // 32-byte ed25519

// 1) Link the key: least privilege ("send" only) + a session expiry.
const register = msg.abstractaccount.registerAuthenticator({
  owner: canonicalAccount,          // the PQC-required account ("qor1…")
  accountAddress: canonicalAccount, // the account the key may act for
  scheme: "ed25519",                // Phantom keys are ed25519
  pubkey: phantomPubkey,
  permissions: ["send"],            // e.g. "send", "evm", "svm" — never "all" for a hot key
  expiryUnix: String(Math.floor(Date.now() / 1000) + 7 * 24 * 3600), // 7 days
  label: "phantom",
});

// 2) Bound what it can move: per-tx and daily limits, uqor only.
const limits = msg.abstractaccount.updateSpendingRules({
  owner: canonicalAccount,
  accountAddress: canonicalAccount,
  rules: [
    {
      id: "phantom-hot",
      perTxLimit: "1000000",    // ≤ 1 QOR per spend
      dailyLimit: "10000000",   // ≤ 10 QOR per day
      allowedDenoms: ["uqor"],
      enabled: true,
    },
  ],
});

// Broadcast BOTH owner-signed (hybrid) — e.g. via the hybrid tx path:
// await signAndBroadcastHybrid({ ..., messages: [register, limits] });
```

키를 즉시 비활성화하려면 소유자가
`msg.abstractaccount.revokeAuthenticator({ owner, accountAddress, scheme,
pubkey })`를 브로드캐스트합니다.

## Phantom으로 지출하기 (Native 레인, 릴레이어 경유)

키가 연결되면 브라우저에서 릴레이어에 전달할 수 있는 `MsgExecuteCosmos`를
구성합니다. `buildPhantomExecuteCosmos`는 도메인 분리 다이제스트를 재구성하고,
Phantom이 이를 서명하도록 하며(`signMessage`), `{ typeUrl, value }` 메시지를
반환합니다.

**브라우저 (Phantom 사용자):**

```ts
import { buildPhantomExecuteCosmos } from "@qorechain/sdk";

// window.solana is a Phantom-style wallet: { publicKey, signMessage }.
const msgExecute = await buildPhantomExecuteCosmos({
  wallet: window.solana,
  relayer: relayerAddress,       // who will submit + pay fees
  chainId: "qorechain-vladi",
  account: canonicalAccount,     // the PQC-required owner
  to: recipient,                 // "qor1…"
  amount: "100uqor",             // single-coin amount string
  nonce,                         // the per-authenticator sequence for (account, pubkey)
});

// Ship `msgExecute` to your relayer service (it is already signed by Phantom):
await fetch("/api/relay", {
  method: "POST",
  body: JSON.stringify({
    typeUrl: msgExecute.typeUrl,
    value: {
      ...msgExecute.value,
      pubkey: Buffer.from(msgExecute.value.pubkey).toString("base64"),
      signature: Buffer.from(msgExecute.value.signature).toString("base64"),
      nonce: msgExecute.value.nonce.toString(),
    },
  }),
});
```

**서버 (릴레이어):** 자신의 **고유** 계정으로 봉투에 서명하고(Native 경로에서
평소처럼 하이브리드) 수수료를 지불합니다. 메시지 내부에 포함된 인증자의
서명이 소유자 계정에서 지출할 수 있는 승인입니다.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
} from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: {
    rpc: "https://rpc.qore.host",
    rest: "https://api.qore.host",
  },
});

// The relayer's OWN account — a different account than the owner.
const relayer = await deriveNativeAccount(process.env.RELAYER_MNEMONIC!);
const signer = await directSignerFromPrivateKey(relayer.privateKey, "qor");
const tx = await client.connectTx(signer);

// Decode the message from the request, then broadcast it (relayer pays fees).
const result = await tx.signAndBroadcast([msgExecute], { fee });
console.log(result.transactionHash);
```

(Phantom 대신 로컬 ed25519 키를 사용하는) 실행 가능한 엔드투엔드 버전은
[`authenticator-spend`](https://github.com/qorechain/qorechain-sdk/tree/main/examples/authenticator-spend)
예제에서 확인할 수 있습니다.

## MetaMask로 지출하기 (EVM 레인)

MetaMask 키는 `registerEthAuthenticatorMsg`를 사용해 **20바이트 ETH 주소**
(스킴 `secp256k1`)로 연결하며, 동일한 종류의 다이제스트에 대한 65바이트
EIP-191 `personal_sign` 서명으로 지출을 승인합니다.

**1) 소유자가 MetaMask 주소를 연결** (소유자 서명, 하이브리드):

```ts
import { registerEthAuthenticatorMsg } from "@qorechain/sdk";

const [ethAddress] = await window.ethereum.request({
  method: "eth_requestAccounts",
  params: [],
});

const register = registerEthAuthenticatorMsg({
  owner: canonicalAccount,
  ethAddress,                 // 0x-hex 20-byte address = the authenticator pubkey
  permissions: ["evm"],       // EVM lane only
  expiryUnix: Math.floor(Date.now() / 1000) + 24 * 3600, // 24 h session
  label: "metamask",
});
// broadcast owner-signed (hybrid), like any other message
```

**2) MetaMask가 EVM 전송을 승인** — `buildMetaMaskExecuteEvm`은 다이제스트를
구성하고, 프로바이더에 `personal_sign`(EIP-191)을 요청한 뒤, 릴레이어에
전달할 수 있는 `MsgExecuteEVM`을 반환합니다:

```ts
import { buildMetaMaskExecuteEvm } from "@qorechain/sdk";

const msgExecute = await buildMetaMaskExecuteEvm({
  provider: window.ethereum,   // any EIP-1193 provider
  address: ethAddress,         // the linked 20-byte address (0x-hex)
  relayer: relayerAddress,
  chainId: "qorechain-vladi",
  account: canonicalAccount,   // the PQC-required owner
  to: "0xRecipient…",          // 0x-hex recipient
  value: "1000000000000000000",// decimal wei string (EVM lane: 18 decimals)
  gasLimit: 100000,
  nonce: evmNonce,             // the account's CURRENT EVM nonce — do NOT +1
});
// hand `msgExecute` to the relayer, exactly as in the Phantom flow
```

`buildMetaMaskExecuteCosmos`는 Native 레인에서 동일한 방식으로 동작합니다
(`to: "qor1…"`, `amount: "100uqor"`, `nonce` = 인증자별 시퀀스). 키와 서명을
직접 관리하는 경우를 위해 대응하는 저수준 컴포저 — `executeEvmMsg`,
`executeCosmosMsg`, `registerEthAuthenticatorMsg`, `revokeAuthenticatorMsg`,
`rotatePqcKeyMsg` — 도 제공됩니다.

## Sign-bytes (바이트 단위 정의)

두 가지 바이트 헬퍼가 있습니다. `BE64(n)`은 8바이트 빅엔디언 정수이고,
`LP(bytes)`는 `BE64(len) ‖ bytes`(길이 접두)입니다.

**EVM 레인** — `evmAuthSignBytes({ chainId, account, pubkey, to, value, data, nonce })`
는 32바이트 다이제스트를 반환합니다:

```text
sha256( "qorechain-evm-auth-v1"
        ‖ LP(chainId) ‖ LP(account) ‖ LP(pubkey)
        ‖ LP(to) ‖ LP(value) ‖ LP(data) ‖ BE64(nonce) )
```

`to`는 `0x`-hex 수신자, `value`는 10진수 wei 문자열, `data`는 원시
calldata입니다.

**Native 레인** — `cosmosAuthSignBytes({ chainId, account, pubkey, to, amount, nonce })`
는 32바이트 다이제스트를 반환합니다:

```text
sha256( "qorechain-cosmos-auth-v1"
        ‖ LP(chainId) ‖ LP(account) ‖ LP(pubkey)
        ‖ LP(to) ‖ LP(amount) ‖ BE64(nonce) )
```

`amount`는 정식 단일 코인 문자열입니다(예: `100uqor`).

**로테이션** — `rotationSignBytes(chainId, algorithmId, account, oldPub, newPub)`
는 두 키가 서명하는 문자열(그 UTF-8 인코딩)을 반환합니다:

```text
qorechain-pqc-rotate-v1|<chainId>|<algorithmId>|<account>|<oldHex>|<newHex>
```

## 논스(Nonce)

- `MsgExecuteEVM.nonce` = 계정의 **현재 EVM 논스** (릴레이어는 다른 계정이라
  소유자의 논스를 증가시키지 않으므로 1을 더하면 **안 됩니다**).
- `MsgExecuteCosmos.nonce` = `(account, pubkey)`에 대한 **인증자별 시퀀스** —
  계정 자체의 시퀀스와는 별개인 스토어 카운터로, Native 레인 지출이 성공할
  때마다 증가합니다.

논스를 잘못 지정하면 리플레이 거부가 발생합니다
(`abstractaccount` 코드 11, 아래 참조).

```ts
// EVM lane: the account's current nonce, straight from the EVM JSON-RPC.
const evmNonce = await client.evm.call<string>("eth_getTransactionCount", [
  account0x,
  "latest",
]);
```

## 권한 스키마

체인은 정식 인증자 권한 분류 체계를 게시하므로, 클라이언트는 문자열을
하드코딩하지 않고 스코프를 검증할 수 있으며 `schema_version`을 통해 변경
여부를 감지할 수 있습니다:

```ts
// REST (LCD):
const schema = await client.rest.getPermissionSchema();

schema.schema_version;      // bumps on any taxonomy/mapping change
schema.permissions;         // ["send", "evm", "svm", "all", ...]
schema.msg_permissions;     // { "/qorechain.abstractaccount.v1.MsgExecuteEVM": "evm", ... }
schema.key_management_msgs; // typeURLs NEVER delegable to a linked key
```

REST 라우트는 `GET /qorechain/abstractaccount/v1/permission_schema`이며, 타입이
지정된 gRPC 쿼리 클라이언트는 동일한 데이터를
`clients.abstractaccount.permissionSchema()`로 제공합니다. 이 모듈은
`/config`, `/accounts`, `/accounts/{address}` 엔드포인트도 제공합니다.

## 오류 코드

실패는 `decodeTxError`를 통해 읽기 쉬운 `kind`로 디코딩됩니다:

| Codespace | 코드 | Kind |
| --- | --- | --- |
| `abstractaccount` | 5 | `spending_limit_exceeded` |
| `abstractaccount` | 6 | `session_key_expired` |
| `abstractaccount` | 10 | `permission_denied` |
| `abstractaccount` | 11 | `authenticator_replay` |
| `pqc` | 21 | `hybrid_verify_failed` |

```ts
import { decodeTxError } from "@qorechain/sdk";

const decoded = decodeTxError({
  code: result.code,
  codespace: result.codespace,
  rawLog: result.rawLog,
});

switch (decoded.kind) {
  case "spending_limit_exceeded": // over the per-tx or daily SpendingRule
    break;
  case "session_key_expired":     // expiryUnix passed — re-register the key
    break;
  case "permission_denied":       // scope missing — check the permission_schema
    break;
  case "authenticator_replay":    // wrong nonce — refetch and re-sign
    break;
  case "hybrid_verify_failed":    // ML-DSA sig did not verify (see note below)
    break;
}
```

`hybrid_verify_failed`는 대부분 **헤지드(hedged)**(비결정론적) ML-DSA-87
서명을 의미합니다 — 체인은 결정론적 서명만 수락합니다. 0.6.1 이전 SDK가
하이브리드 확장을 JSON으로 인코딩한 경우에도 이 오류가 발생합니다
(업그레이드하세요 —
[계정 & PQC 서명](/sdk/concepts/accounts-pqc#hybrid-signing) 참고).

## 키 로테이션 {#key-rotation}

계정의 ML-DSA-87 키를 **동일한** 알고리즘의 새 키로 교체합니다 — 예를 들어
레거시 체인 브리지 파생 키(`shake256(mnemonic)`)를 정식 주소 바인딩 키
(`shake256("qorechain:pqc:v1|addr|mnemonic")`)로 마이그레이션할 때
사용합니다:

```ts
import { rotatePqcKeyMsgFromMnemonic, derivePqcLegacy } from "@qorechain/sdk";

const { msg, oldKeypair, newKeypair } = rotatePqcKeyMsgFromMnemonic({
  account,
  mnemonic,
  chainId: "qorechain-vladi",
  // oldDerivation: "bridge" (legacy), newDerivation: "adapter" (canonical) by default
});
// broadcast `msg` BY the account, cosigned (hybrid) with the OLD key —
// both keys dual-sign the rotation bytes (old proves ownership, new proves control).
```

`derivePqcLegacy(mnemonic)`은 필요할 때(예: 로테이션이 반영되기 전까지 계속
서명해야 하는 경우) 레거시 키페어를 단독으로 재생성합니다.

## 다음 단계

- [계정 & PQC 서명](/sdk/concepts/accounts-pqc) — 통합 계정과 하이브리드
  서명.
- [계정 추상화](/developer-guide/account-abstraction) — 체인 측 모듈.
- 실행 가능한 예제:
  [`authenticator-spend`](https://github.com/qorechain/qorechain-sdk/tree/main/examples/authenticator-spend).
