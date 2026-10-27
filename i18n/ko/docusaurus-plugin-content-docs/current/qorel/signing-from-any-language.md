---
slug: /qorel/signing-from-any-language
title: 모든 언어에서 QoreChain 트랜잭션 서명하기
sidebar_label: 모든 언어에서 서명하기
sidebar_position: 8
---

# 모든 언어에서 QoreChain 트랜잭션 서명하기

QORel은 Rust의 `qorel-signer` 크레이트로 서명합니다. 다른 릴레이어, 봇, 도구도 QoreChain SDK와 포스트 양자 라이브러리를 사용해 다른 언어에서 같은 하이브리드 포스트 양자 서명을 만들 수 있습니다. 이 페이지는 모두가 따르는 계약을 설명하고 Rust, TypeScript, Go, Python, Java에서 사용할 라이브러리를 나열합니다. QoreChain에 트랜잭션을 제출하는 릴레이어, 봇, 백엔드를 만드는 개발자를 위한 것입니다.

## 혁신 {#innovations}

- **하나의 계약, 하나의 테스트 벡터 집합.** 모든 언어가 같은 sign bytes와 같은 확장을 만듭니다. QORel 저장소는 체인이 받아들인 트랜잭션으로부터 바이트 단위로 다시 만든 벡터를 공개하므로, 구현이 네트워크에 닿기 전에 검증할 수 있습니다.
- **확장이 유일한 추가 사항입니다.** 포스트 양자 서명은 트랜잭션 본문의 확장 옵션 하나에 실려 갑니다. 메시지, 수수료, 클래식 서명은 평소 형태를 유지합니다.
- **훅 지점이 좁습니다.** 서명은 auth info가 확정된 뒤, 클래식 서명 문서가 만들어지기 전에 추가됩니다. 릴레이어는 다시 작성할 필요 없이 그 지점에서 한 군데만 바꾸면 됩니다.
- **어디서나 같은 키.** ML-DSA-87 키는 QoreChain 지갑 파생 방식으로 계정의 니모닉에서 파생되므로, 니모닉을 가져오는 모든 지갑이나 릴레이어가 같은 포스트 양자 키를 얻습니다.

## 사용 방법 {#how-to-use}

### 계약 {#contract}

QoreChain은 두 서명을 모두 가진 네이티브 레인 트랜잭션만 받아들입니다.

- **클래식 secp256k1 서명.** 일반적인 `SIGN_MODE_DIRECT` 형태이며, 확장을 포함한 최종 본문을 대상으로 합니다.
- **본문의 확장 옵션에 담긴 ML-DSA-87(FIPS 204) 서명.** 타입은 `/qorechain.pqc.v1.PQCHybridSignature`이고 `algorithm_id = 1`, `pqc_signature`(4,627바이트), 선택적인 `pqc_public_key`(2,592바이트)를 가집니다. 트랜잭션의 유일한 critical 확장 옵션(`extension_options` 안)이어야 합니다.

ML-DSA 서명은 sign bytes(버전 2, 두 네트워크에서 현재 사용 중)를 대상으로 합니다.

```
"qorechain-pqc-hybrid-v2" || BE64(len(chain_id)) || chain_id
                          || BE32(len(B0)) || B0
                          || BE32(len(A))  || A
```

- `B0`는 PQC 확장이 없는 `TxBody`를 정규 형식으로 다시 인코딩한 것입니다.
- `A`는 변경하지 않은 `AuthInfo` 바이트입니다.

작업 순서:

1. 본문과 auth info를 만듭니다.
2. ML-DSA-87로 sign bytes에 서명합니다.
3. 확장을 본문에 덧붙입니다.
4. secp256k1로 최종 본문에 서명합니다.
5. 브로드캐스트합니다.

틀리기 쉬운 규칙:

- `B0`는 정규 형식이어야 합니다. 체인이 본문을 디코딩하고, 하이브리드 옵션을 제거하고, 다시 인코딩해서 이를 다시 도출하기 때문입니다. 자체 확장 옵션, `unordered` 플래그, 알 수 없는 필드, 비정규 인코딩이 있는 본문을 보내지 마세요.
- codespace `pqc` 코드 21로 거부되면 하이브리드 서명이 검증되지 않았다는 뜻입니다. 재시도하기 전에 sign-bytes 버전과 계정의 등록 상태를 다시 읽으세요. [포스트 양자 서명](/developer-guide/post-quantum-signing#code-21)을 참고하세요.
- 가스: 검증에는 키가 있는 서명자당 2,000 가스가 들며, 약 4.7 KB 확장의 크기 비용이 더해집니다. 둘 다 계산되도록 같은 경로로 시뮬레이션하세요.

### 키 등록과 파생 {#keys}

계정은 소유 증명을 포함한 `MsgRegisterPQCKeyV2`로 ML-DSA 공개 키를 한 번 등록합니다. 이는 QoreChain이 클래식 서명만으로 받아들이는 유일한 트랜잭션입니다. [포스트 양자 서명](/developer-guide/post-quantum-signing#pqc-key-registration)을 참고하세요.

ML-DSA 키는 계정과 같은 니모닉에서 파생됩니다.

```
seed = SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)[:32]
```

그 다음 `ML-DSA-87.KeyGen_internal(seed)`를 실행합니다. 비밀 값은 제로화되며 출력되지 않습니다. 같은 파생 방식이 [키 파생](/qoresign/guides/key-derivation)에 설명되어 있습니다.

### QORel의 서명 계층 {#signer-layer}

`qorel-signer` 크레이트는 작업을 세 개의 인터페이스로 나눕니다.

- `PqSigner`: 포스트 양자 프리미티브(`algorithm_id`, `public_key`, `sign`). `MlDsa87Signer`가 제공되며, 기본은 hedged 서명이고 테스트 벡터에는 결정적 서명을 쓰며, 모든 서명은 사용 전에 검증됩니다.
- `SignBytesFramer`: 체인의 규칙(`check_body`, `frame`, `pack`).
- `TxExtensionSigner`: 릴레이어가 호출하는 것. `PqExtensionSigner`가 프리미티브와 프레이머를 결합합니다.

릴레이어는 다음 순서로 트랜잭션을 만듭니다. 공동 서명자 확장이 없는 본문을 인코딩하고(`B0`), 최종 auth info를 인코딩하고(`A`), 공동 서명자에게 덧붙일 확장 옵션을 요청하고, 그것들을 포함해 본문을 다시 인코딩하고, 최종 본문의 서명 문서에 대해 클래식 서명을 만듭니다. Rust에서 이 크레이트를 사용하려면 저장소에서 직접 의존성을 지정하세요(crates.io에는 없습니다).

```toml
[dependencies]
qorel-signer = { git = "https://github.com/qorechain/QORel", tag = "qorel-v0.1.0" }
```

체인에 맞는 하이브리드 서명기를 만들고 확장 옵션을 요청하는 전체 호출 예는 저장소의 `crates/qorel-signer/README.md`에 있습니다. 이 크레이트는 원시 protobuf 바이트로 동작하고, 체인이 거부할 본문(이미 있는 critical 확장 옵션, `unordered`, 알 수 없는 필드)을 거절하며, 버전을 알기 전에는 QoreChain 네트워크에서 v1 sign bytes로 되돌아가지 않고, 자신이 만든 각 서명을 검증하며, 비밀 값을 제로화하고 `Debug` 출력에서 가립니다. 테스트는 체인의 ante 핸들러가 받아들인 트랜잭션을 바이트 단위로 다시 구성합니다. [개요의 qorel-signer](/qorel/overview#qorel-signer)도 참고하세요.

다른 추가 서명이 필요한 체인은 프레이머를 구현하고, 알고리즘이 다르면 새 프리미티브도 구현합니다. 릴레이어의 나머지는 바뀌지 않습니다.

### 라이브러리 {#libraries}

| 언어 | 패키지 | 하이브리드 서명 |
|---|---|---|
| Rust | `qorechain-sdk`(crates.io), 또는 [QORel 저장소](https://github.com/qorechain/QORel)의 `qorel-signer`(`crates/qorel-signer`) | `PqExtensionSigner`를 사용하는 `qorel_signer::qorechain::qorechain_hybrid_signer`. `qorechain::tx::build_hybrid_tx` |
| TypeScript 및 JavaScript | `npm install @qorechain/sdk` | `TxClient`가 `pqcKeypair`로 하이브리드 서명. `ensurePqcRegistered` |
| Go | `go get github.com/qorechain/qorechain-sdk/packages/go@latest` | `qorechain/tx`(하이브리드 빌드 및 서명), `qorechain/signbytes`, `qorechain/pqcdx` |
| Python | `pip install qorechain-sdk` | `build_hybrid_tx`, `build_hybrid_signature_extension` |
| Java 및 Kotlin | `io.github.qorechain:qorechain-sdk`(Maven Central) | `PqcDx`(등록, 하이브리드 전송 경로)와 하이브리드 트랜잭션 빌더 |
| C 및 기타 | [`qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) | ML-DSA-87 키 생성, 서명, 검증 바인딩. sign bytes는 위와 같이 프레이밍 |

각 패키지의 현재 버전은 [개발자 패키지](/developer-tools/overview)를, 지갑이나 백엔드에서의 서명은 [QoreSign](/qoresign/overview)을 참고하세요. 일부 패키지의 클래식 전용 클라이언트는 네이티브 레인 트랜잭션을 보낼 수 없습니다. 쓰기에 사용하기 전에 패키지 페이지를 확인하세요.

### 테스트 벡터 {#test-vectors}

QORel 저장소의 `crates/qorel-signer/tests/vectors/`에는 다음이 있습니다.

- sign-bytes 정답 파일
- 릴레이 트랜잭션 벡터: 확장이 없는 본문, sign bytes, 확장 바이트, 전체 서명된 트랜잭션. 체인이 받아들인 트랜잭션으로부터 바이트 단위로 다시 만든 것입니다
- SDK 간 키 파생 벡터

라이브 네트워크에 무언가를 보내기 전에 사용하는 언어에서 이를 실행하세요. QoreSign 벡터는 [테스트 벡터](/qoresign/vectors)에 있습니다.

### 다른 릴레이어에 포스트 양자 서명 추가하기 {#other-relayers}

훅 지점은 "auth info가 확정된 뒤, 클래식 서명 문서가 만들어지기 전"입니다. 확장을 그 지점에 끼워 넣으세요.

- Hermes 기반 릴레이어에서는 `crates/relayer/src/chain/cosmos/encode.rs::sign_tx`입니다. 그곳의 QORel 변경은 범용적입니다. 어떤 `TxExtensionSigner`든 확장 옵션을 추가할 수 있습니다.
- Cosmos SDK `client/tx` 패키지 위에 만든 Go 릴레이어에서는 `SetSignatures` 전에 `TxBuilder`를 감쌉니다.

## 접근 방법 {#how-to-access}

- **네트워크.** 계약은 두 QoreChain 네트워크에서 같습니다. QORel 자체는 테스트넷에서만 테스트되었습니다.
- **키와 계정.** 등록된 ML-DSA-87 키가 있고 자금이 있는 계정. 테스트넷 QOR은 [대시보드 포셋](/dashboard/faucet)에서 받습니다.
- **비용.** 라이브러리는 무료입니다(Apache-2.0). 트랜잭션은 최소 가스당 0.1 uqor의 가스를 지불합니다.

## 배포 위치 {#where-published}

| 패키지 | 레지스트리 | 소스 |
|---|---|---|
| `qorel-signer` | 저장소 안에 있음(`crates/qorel-signer`). crates.io에는 없으므로 위의 git 의존성을 사용하세요 | [qorechain/QORel](https://github.com/qorechain/QORel) |
| `qorechain-sdk`, `@qorechain/sdk`, Go 모듈, Maven 아티팩트 | crates.io, npm, Go 프록시, Maven Central, PyPI | [qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk) |
| `qorechain-pqc` | npm, PyPI, crates.io, Go, Maven | [qorechain/qorechain-pqc](https://github.com/qorechain/qorechain-pqc) |

## 한계와 알려진 문제 {#limits}

- **ML-DSA-87(알고리즘 ID 1)만 지원.** QORel과 위의 라이브러리가 서명하는 알고리즘은 이것 하나입니다.
- **Sign-bytes 버전.** 이 페이지는 두 네트워크가 검증하는 버전 2를 문서화합니다. 도구는 그래도 버전을 가정하지 말고 체인(적용된 업그레이드 기록)에서 읽어야 하며, QORel은 그렇게 합니다.
- **서명은 로컬에서 합니다.** 이 라이브러리들은 사용자를 대신해 키를 보관하지 않으며 하드웨어 지갑을 통해 서명하지도 않습니다.
- **언어별 예제는 여기서 반복하지 않습니다.** 각 패키지의 빠른 시작을 사용하세요. 이 매뉴얼은 모든 언어가 QORel 테스트 벡터를 상대로 실행되었다고 주장하지 않습니다.
