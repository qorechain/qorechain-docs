---
slug: /qoresign/guides/keplr-compatible-wallets
title: Keplr 호환 지갑에 하이브리드 서명 추가하기
sidebar_label: Keplr 호환 지갑
sidebar_position: 1
---

# Keplr 호환 지갑에 하이브리드 서명 추가하기

QoreChain의 Native 레인은 ML-DSA-87 키가 등록된 계정의 트랜잭션에 그 키의 서명도 포함되어 있지 않으면
거부합니다. Keplr 호환 지갑(Keplr, Leap, Cosmostation 등 `signDirect`를 구현한 지갑)은
secp256k1 부분을 만들어 내지만, ML-DSA-87 부분은 포스트 양자 키를 가진 쪽에서 제공해야 합니다.

추가하는 방법은 두 가지입니다.

## 옵션 A: 지갑이 두 키를 모두 보유(QoreSign) {#option-a}

지갑이 secp256k1 키 옆에 ML-DSA-87 키를 파생하고, 서명하기 전에 해당 계층을 추가합니다.

```ts
import { deriveCanonicalPqKey, signPqLayer } from "@qorechain/qoresign";

// at account creation or import, from the same mnemonic and address
const pqKey = deriveCanonicalPqKey({ mnemonic, address });

// inside signDirect(signerAddress, signDoc):
const { bodyBytes } = signPqLayer({
  chainId: signDoc.chainId,
  bodyBytes: signDoc.bodyBytes,
  authInfoBytes: signDoc.authInfoBytes,
  pqKey,
});
const finalDoc = { ...signDoc, bodyBytes }; // sign this with the secp256k1 key, as for any Cosmos SDK chain
```

사용자를 안전하게 지키는 규칙:

- 서명하기 전에 `bodyBytes` / `authInfoBytes`의 메시지와 수수료를 사용자에게 보여 주세요.
  이는 다른 `signDirect` 요청과 같습니다. ML-DSA-87 서명은 수수료를 포함해 서명합니다.
- dApp이 이미 PQC 계층이 포함된 본문을 보낸 경우, 고전 서명을 추가하기 전에
  `assertPqLayerMatchesRegisteredKey`(`@qorechain/qoresign/network`에서 제공)로 확인하세요.
  검증되지 않는 계층은 아무것도 보호하지 못합니다.
- 계정당 한 번, `classicalOnly` 모드로 서명한 `buildRegisterPqKeyMessage`로 키를 등록하세요
  ([`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send)
  및 [등록](/qoresign/spec/hybrid-signing-v1#registration) 참고).
- 브로드캐스트 후 커밋된 트랜잭션을 다시 읽어 `evaluateLayerState`를 호출하세요.
  `downgraded`는 계층이 체인에 도달하지 못했다는 뜻입니다.

## 옵션 B: dApp이 포스트 양자 키를 보유(`@qorechain/wallet-adapter`) {#option-b}

지갑을 바꿀 수 없을 때는 dApp이
[`@qorechain/wallet-adapter`](https://www.npmjs.com/package/@qorechain/wallet-adapter)를 사용할 수 있습니다.
이 어댑터는 본문에 ML-DSA-87 계층을 추가한 다음, 변경되지 않은 지갑에 일반적인 `signDirect` 서명을
요청합니다. 이 경우 포스트 양자 키는 지갑이 아니라 dApp 또는 보조 서명자에게 있습니다.
동일한 키를 사용하면 QoreSign과 어댑터는 동일한 바이트를 생성합니다.

## Keplr용 체인 등록 {#chain-registration}

게시된 체인 디스크립터를 사용해 `experimentalSuggestChain`으로 체인을 제안하세요. 체인 ID는
`qorechain-vladi`(메인넷)와 `qorechain-diana`(테스트넷), bech32 접두사는 `qor`, 코인 타입은 `118`,
수수료 단위는 소수 자릿수 6의 `uqor`, 최소 가스 가격은 `0.1`입니다. 공개 엔드포인트:
`https://rpc.qore.host` 및 `https://api.qore.host`(메인넷),
`https://rpc-testnet.qore.host` 및 `https://api-testnet.qore.host`(테스트넷).
