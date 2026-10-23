---
slug: /developer-guide/post-quantum-signing
title: 양자내성 서명
sidebar_label: 양자내성 서명
sidebar_position: 8
---

# 양자내성 서명

`qorechain-pqc`는 QoreChain을 뒷받침하는 오픈소스 **표준 전용(standards-only)** 양자내성 암호 라이브러리입니다. 지갑, 통합 개발자, 툴링에 체인이 사용하는 것과 정확히 동일한 프리미티브를 제공하며 — 6개 언어에서 하나의 일관된 API로, 공유된 교차 언어 테스트 벡터 스위트를 통해 **바이트 호환성이 입증**되어 있습니다.

이 라이브러리는 **최종 확정된 NIST 표준**의 감사된 구현을 래핑합니다. 커스텀 방식을 발명하지 **않습니다**: 비표준 변형이야말로 상호운용성을 깨뜨리는 요인입니다(한 곳에서 생성된 서명이 다른 곳에서는 검증되지 않게 됩니다). 모든 바인딩은 동일한 벡터에 대해 검증되므로, 한 언어에서 생성된 ML-DSA 서명은 다른 모든 언어에서 검증되고, ML-KEM 공유 비밀은 6개 언어 전체에서 일치하며, SHAKE-256 다이제스트도 동일합니다.

* **리포지토리:** [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc)
* **라이선스:** Apache-2.0

## 프리미티브

| 프리미티브 | 표준 | 역할 | 레벨 (기본값은 **굵게**) |
| --- | --- | --- | --- |
| **ML-DSA** | FIPS-204 | 디지털 서명 | 44 · 65 · **87** |
| **ML-KEM** | FIPS-203 | 키 캡슐화 | 512 · 768 · **1024** |
| **SHAKE-256** | FIPS-202 | 확장 가능 출력 해시 | — |

이는 QoreChain이 프로토콜 수준에서 실행하는 것과 동일한 프리미티브입니다: **ML-DSA-87 (Dilithium-5)** 서명, **ML-KEM-1024** 키 캡슐화, 그리고 기본 애플리케이션 해시로서의 **SHAKE-256**. 체인이 이를 어떻게 사용하는지는 [양자내성 보안](/architecture/post-quantum-security)을 참조하세요.

### 크기 (바이트)

크기/보안 예산에 따라 보안 레벨을 선택하세요.

| 스킴 | 보안 | 공개 키 | 서명 / 암호문 |
| --- | --- | --- | --- |
| ML-DSA-44 | L2 | 1312 | 2420 |
| ML-DSA-65 | L3 | 1952 | 3309 |
| **ML-DSA-87** | L5 | 2592 | 4627 |
| ML-KEM-512 | L1 | 800 | 768 |
| ML-KEM-768 | L3 | 1184 | 1088 |
| **ML-KEM-1024** | L5 | 1568 | 1568 |

> NIST 표준을 더 작게 만들면서 여전히 표준일 수는 없습니다. ML-DSA-87은 키/서명 크기와 바이트가 고정되어 있어 — 이를 "최적화"하면 다른 어떤 구현도 검증할 수 없는 비표준 변형이 됩니다. 온체인 풋프린트를 줄이려면 스킴을 변경하는 대신 아래의 수단들을 사용하세요.

## 언어 및 패키지

모든 언어가 동일한 API를 노출하며, 각각 서로 다른 감사된 구현을 기반으로 합니다. 이것이 바이트 호환성을 보장하는 방식입니다 — 독립적인 백엔드들이 표준에 대해 합의하는 것입니다.

| 언어 | 패키지 | 설치 | 기반 구현 |
| --- | --- | --- | --- |
| JavaScript / TypeScript | `@qorechain/pqc` (npm) | `npm i @qorechain/pqc` | [@noble/post-quantum](https://github.com/paulmillr/noble-post-quantum) |
| Rust | `qorechain-pqc` (crates.io) | `cargo add qorechain-pqc` | `fips204` · `fips203` · `sha3` |
| Python | `qorechain-pqc` (PyPI) | `pip install qorechain-pqc` (import `qorpqc`) | [liboqs-python](https://github.com/open-quantum-safe/liboqs-python) |
| Go | `github.com/qorechain/qorechain-pqc/go` | `go get github.com/qorechain/qorechain-pqc/go` | [Cloudflare CIRCL](https://github.com/cloudflare/circl) |
| C | `c/` (정적 라이브러리 + 헤더) | [리포지토리](https://github.com/qorechain/qorechain-pqc)에서 빌드 | [liboqs](https://github.com/open-quantum-safe/liboqs) + OpenSSL |
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.2.3` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info 가용성
JavaScript, Rust, Python, Go, Java 바인딩은 모두 버전 **0.2.3**으로 **게시**되어 있습니다(npm, crates.io, PyPI, `v0.2.3`으로 Go 모듈 프록시, Maven Central. 2026년 10월 21일 확인) — 위의 명령어로 설치하세요. Python 배포판은 `qorechain-pqc`로 설치되지만 **`qorpqc`로 임포트**합니다. **Java** 패키지는 `io.github.qorechain:qorechain-pqc:0.2.3`(Bouncy Castle 백엔드)입니다. 버전 **0.2.0**에서 버전 인식형 `hybridSignBytes`(아래 참조)가 추가되었고, **0.2.1**에서는 메인넷에서 v2로의 전환을 나타내는 업그레이드 이름이 수정되었으며, **0.2.2**에서는 헤지드 서명과 결정론적 서명에 관한 문서와 주석이 수정되었으므로(체인은 둘 다 수락하며, JavaScript 바인딩에서는 코드상 버전 상수만 바뀌었습니다), **0.2.3**에서는 동일한 출력을 유지한 채 암호화 의존성(Java의 Bouncy Castle, JavaScript의 `@noble/post-quantum`)이 업데이트되었습니다. 0.2.1 이상을 사용하세요. **C** 바인딩은 [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc)에서 직접 빌드하는 정적 라이브러리 + 헤더입니다.
:::

## 결정론적 서명 (기본값) {#deterministic-signing}

버전 **0.1.1**부터(이후 모든 릴리스 포함) `sign()`은 **6개 바인딩 모두**에서 **결정론적** ML-DSA 변형(FIPS-204 §3.4, 서명 난수가 32개의 0 바이트인 방식)을 생성합니다. 체인은 헤지드(hedged)든 결정론적이든 유효한 FIPS-204 ML-DSA-87 서명이라면 모두 수락합니다. 두 방식의 검증 절차는 동일하며, 비밀키 없이는 검증자가 둘을 구분할 수 없습니다. 바인딩이 기본적으로 결정론적으로 서명하는 이유는 같은 트랜잭션이 항상 같은 서명과 같은 tx 해시를 만들고, 모든 바인딩이 공유 테스트 벡터와 일치하도록 하기 위해서입니다.

핵심 사항:

* 결정론적 출력은 같은 키와 메시지에 대해 **6개 바인딩 모두에서 바이트 단위로 동일**하며, 공유 교차 언어 테스트 벡터로 고정되어 있습니다.
* 헤지드 서명은 바인딩별 **명시적 옵트인**으로 계속 사용할 수 있습니다(예: JavaScript의 `{hedged: true}`, Rust의 `sign_hedged`, Java의 `mldsaSignHedged`, Python의 `sign(..., hedged=True)`). 헤지드 서명도 유효한 FIPS-204 서명으로서 **체인이 수락합니다**. 유일한 차이는 서명할 때마다 서명과 그에 따른 tx 해시가 바뀐다는 점입니다.
* JavaScript 바인딩 버전 0.1.0은 기본적으로 헤지드 서명을 했습니다. 그 서명들도 온체인에서 유효합니다. 공유 벡터와 일치하는 재현 가능한 서명이 필요하다면 0.1.1로 업그레이드하세요.

## 키 등록 {#pqc-key-registration}

모든 계정은 ML-DSA-87 공개 키를 **한 번, 명시적으로** 등록합니다. 자동 등록은 없습니다: 이후의 하이브리드 트랜잭션에 포함된 공개 키(예: SDK의 `includePqcPublicKey` 옵션)는 확장에 실려 전달될 뿐 키를 **등록하지는 않습니다**. **첫** 등록은 클래식 방식으로 서명할 수 있는 유일한 Cosmos 레인 트랜잭션이므로, 새 계정이 첫 키를 부트스트랩할 수 있습니다. 이미 키가 있는 계정은 이후의 모든 키 메시지에 하이브리드 서명을 해야 합니다. 릴리스 `qorechaind`(공개 소스에서 빌드한 바이너리는 서명할 수 없습니다. [소스에서 빌드하기](/developer-guide/building-from-source) 참조), QoreX, 또는 SDK의 `ensurePqcRegistered`로 수행하세요.

```bash
# 1. Create a key. It is stored unencrypted under ~/.qorechaind/pqc/mypqc.dilithium (mode 0600) and the public key hex is printed.
qorechaind tx pqc gen-key mypqc

# 2. Register the public key on your account (classical-signed, because the account has no key yet).
#    --pqc-key mypqc also attaches the optional proof of possession (see below).
qorechaind tx pqc register-key-v2 dilithium5 <printed-pubkey-hex> hybrid --pqc-key mypqc \
  --from mykey --chain-id qorechain-vladi --gas 600000 --fees 60000uqor -y

# 3. Verify.
qorechaind query pqc account <address>
```

`--gas`를 명시적으로 설정하세요: 2,592바이트 공개 키는 기본 200,000 가스를 초과할 수 있으며(메인넷 등록은 대략 220,000~310,000을 사용했고, 소유 증명이 포함된 등록은 4,627바이트 서명이 하나 더 실리므로 약 46,000 가스가 더 듭니다), 수수료는 최소 gas × 0.1 uqor여야 하므로 `--gas 600000`에는 `--fees 60000uqor` 이상이 필요합니다. 레거시 형식 `qorechaind tx pqc register-key <pubkey-hex> hybrid`는 Dilithium-5에서 동일하게 동작합니다. 이후에는 각 Cosmos 레인 트랜잭션을 `--generate-only`로 구성하고 `qorechaind tx pqc cosign`으로 서명하세요. 키 파일은 계정의 양자내성 서명 키입니다: 이를 읽을 수 있는 사람은 누구든 클래식 키와 함께 계정의 공동 서명을 할 수 있으므로 니모닉처럼 백업하세요(아래에 설명된 대로 니모닉에서 다시 파생할 수 있습니다).

등록된 키는 EVM 트랜잭션을 보내기 위한 두 가지 요건 중 첫 번째이기도 합니다. 두 번째는 열려 있는 [EVM 승인 윈도우](/developer-guide/evm-development#evm-window)입니다.

### 체인이 등록 시 검사하는 항목 (메인넷 v3.2.3 이상) {#key-integrity}

v3.2.3 업그레이드(2026년 10월 20일 메인넷 높이 3,662,051에서 적용)부터 체인은 키의 길이가 맞는지만이 아니라 키 자체를 검사합니다:

| 규칙 | 거부 (codespace `pqc`) |
| --- | --- |
| `key_type`은 `hybrid` 또는 `pqc_only`여야 합니다. `classical_only`는 양자내성 키를 등록하지 않아 계정이 다시는 서명할 수 없게 됩니다 | 코드 230 |
| 양자내성 보호를 제공하지 않는 키(비밀 값이 필요 없는 퇴화된 키)는 등록, 로테이션, 마이그레이션 모두에서 거부됩니다 | 코드 230 |
| 계정이 이전에 사용한 키는 다시 등록하거나 그 키로 되돌려 로테이션할 수 없습니다(계정이 폐기된 키를 기억합니다) | 코드 232 |
| 등록에 포함되는 클래식 키는 서명자 본인의 압축 secp256k1 키여야 합니다(v3.2.2부터) | 코드 45 |
| 선택적인 소유 증명이 있으면 검증되어야 합니다 | 코드 231 |
| 이미 키를 가진 계정은 이후의 모든 키 메시지(등록, 마이그레이션)에 하이브리드 서명을 해야 합니다. 사용 가능한 키가 없는 레코드를 복구하는 경우에만 클래식 서명이 허용됩니다 | 코드 234 |
| 알고리즘을 폐기하거나 비활성화하더라도 체인에 활성 서명 알고리즘이 하나도 남지 않는 상황이 되어서는 안 됩니다 | 코드 233 |

또한 v3.2.3부터 어떤 키 메시지(`MsgRegisterPQCKey`, `MsgRegisterPQCKeyV2`, `MsgRotatePQCKey`, `MsgMigratePQCKey`)도 `authz`를 통해 계정을 대신해 보낼 수 없습니다. 트랜잭션은 하이브리드 서명 확장을 최대 **하나**만 담을 수 있습니다. 등록된 키가 **없는** 계정은 더 이상 검증할 대상이 없는 하이브리드 확장을 첨부할 수 없습니다(확장이 전혀 없는 경우와 똑같이, 등록만 통과할 수 있습니다).

### 소유 증명 (선택 사항) {#proof-of-possession}

등록 시 등록자가 새 키의 비밀을 보유하고 있음을 함께 증명할 수도 있습니다. 키가 `qorechain-pqc-pop-v1|<chain-id>|<algorithm id>|<address>|<public key hex>`에 서명하고(알고리즘 ID는 ML-DSA-87의 경우 `1`이며, 공개 키는 소문자 hex입니다) 그 서명을 `MsgRegisterPQCKeyV2`의 `proof_of_possession` 필드에 넣습니다. CLI에서는 `register-key-v2 ... --pqc-key <name>`이 이를 만들어 첨부합니다. TypeScript SDK 0.9.0에서는 네트워크가 v3.2.3을 적용한 뒤 `ensurePqcRegistered`가 증명을 스스로 첨부하며(`signProofOfPossession` / `verifyProofOfPossession`으로 직접 만들고 검증할 수도 있습니다), `@qorechain/chain-bridge` 0.2.3도 `cosmosRest`가 주어지면 동일하게 동작합니다. `@qorechain/wallet-adapter`(0.4.0)와 0.9.0 이전의 SDK 릴리스는 증명을 첨부하지 않으므로 이들을 통한 등록에는 증명이 없으며, 체인은 이를 여전히 수락합니다. 체인은 증명이 **있을 때** 이를 검증하고, 검증되지 않으면 등록을 거부합니다(코드 231). 증명이 없는 등록은 메인넷에서 여전히 수락됩니다. 메시지에 체인, 알고리즘, 계정, 키가 모두 명시되므로, 그중 하나를 위해 만든 증명은 다른 것에 대해서는 아무것도 증명하지 못합니다.

**소유 플래그와 브리지 밸리데이터(v3.2.4).** 계정 레코드는 계정의 현재 키가 증명되었는지 여부를 보고합니다: `GET /qorechain/pqc/v1/account/{address}`의 `possession_proven`입니다. 키가 검증된 소유 증명과 함께 등록되었거나 로테이션으로 설치된 경우(새 키가 로테이션에 서명하므로 이것이 증명이 됩니다) `true`이며, 증명 없이 등록한 계정에서는 `false`로 유지됩니다. 이 플래그는 누가 송금하거나 수신할 수 있는지에 아무런 영향을 주지 않습니다. **브리지 밸리데이터**를 등록하려면 추가로 밸리데이터의 포스트 양자 키에 대한 소유 증명이 필요하며(등록 시의 `proof_of_possession`; 키는 `qorechain-pqc-pop-v1|<chain-id>|1|<validator address>|<public key hex>`에 서명하고, CLI에서는 `--pqc-key`를 사용합니다), 두 브리지 밸리데이터가 같은 키를 등록할 수 없습니다. 크로스체인 브리지 자체는 프로덕션 단계가 아닙니다. 두 변경 사항은 테스트넷에서는 2026년 10월 19일부터, 메인넷에서는 2026년 10월 23일부터 적용되고 있습니다(v3.2.4, 거버넌스 제안 13으로 높이 3,742,566에서 적용).

## 거부 코드 (codespace `pqc`) {#pqc-codes}

| 코드 | 의미 |
| --- | --- |
| 20 | 하이브리드 서명 필요: 트랜잭션에 PQC 확장이 없음(첫 등록과, 키가 없는 계정의 unjail만 예외) |
| 21 | ML-DSA-87 부분이 검증되지 않음, [아래](#code-21) 참조 |
| 26, 27, 28 | EVM 레인: 열린 윈도우 없음 또는 키 없음 / 윈도우 소진 / 잘못된 윈도우 범위, [EVM 개발](/developer-guide/evm-development#evm-window) 참조 |
| 45 | 등록에 포함된 클래식 키가 서명자 본인의 압축 secp256k1 키가 아님 |
| 60, 61 | EIP-7702 위임: 이 위임에 대한 양자내성 동의 없음 / 잘못된 위임 요청 |
| 62, 63 | 위임된 계정에 해당 동작을 포함하는 윈도우가 없음 / Ethereum 트랜잭션은 EVM 레인에서만 실행됨 |
| 230 | 취약한 키 또는 `classical_only` 등록 |
| 231 | 소유 증명이 검증되지 않음 |
| 232 | 이 계정이 이전에 사용한 키 |
| 233 | 활성 서명 알고리즘이 남지 않게 됨 |
| 234 | 키가 있는 계정의 키 관리에는 하이브리드 서명이 필요함 |

## `pqc` 코드 21 (`hybrid_verify_failed`) 문제 해결 {#code-21}

코드 21은 하이브리드 서명의 ML-DSA-87 부분이 계정에 등록된 키로 검증되지 않았음을 의미합니다. 헤지드와 결정론적 서명 중 무엇을 선택했는지는 **절대** 원인이 아닙니다. 다음 순서로 확인하세요.

1. **sign-bytes 버전.** PQC 서명은 v1 또는 v2 sign-bytes를 대상으로 하며, 네트워크는 각 높이에서 정확히 한 가지 형식만 검증합니다. `qorechain-diana`는 `v3.1.98` 업그레이드에서 v2로 전환했고, `qorechain-vladi`는 `v3.2.0` 업그레이드에서 전환했으며, 이후에 생성된 체인은 제네시스부터 v2입니다. 현재 SDK는 네트워크별로 형식을 선택합니다. 직접 구현한 서명기는 어떤 업그레이드가 적용되었는지 노드에 확인해야 합니다([계정 및 PQC 서명](/sdk/concepts/accounts-pqc) 참고).
2. **v2 sign-bytes의 체인 ID.** v2는 체인 ID를 바인딩하므로, `qorechain-diana`용으로 만든 서명은 `qorechain-vladi`에서 검증되지 않으며 그 반대도 마찬가지입니다.
3. **오래된 PQC 라이브러리.** 표준 이전(FIPS-204 이전) 빌드는 표준 검증기가 거부하는 서명을 생성합니다. `qorechain-pqc` 0.1.1 이상을 사용하세요.
4. **잘못된 키.** 공개키는 계정에 등록된 키여야 합니다(`GET /qorechain/pqc/v1/account/{address}`). 다른 파생 방식으로 만든 키(예: 주소 바인딩 파생 대신 레거시 브리지 파생 `shake256(mnemonic)`)는 유효하게 서명하지만 일치하지 않습니다. 정식 키로 옮기려면 [키 로테이션](#key-rotation)을 참고하세요.

## 결정론적 키 파생 및 복구 {#key-derivation}

생태계 표준 파생 방식은 ML-DSA-87 키를 계정에 바인딩하므로, **계정의 니모닉만으로 복구할 수 있습니다**:

```
seed = SHAKE-256("qorechain:pqc:v1|" + cosmosAddress + "|" + mnemonic)
(publicKey, secretKey) = mldsa.keygen(seed)
```

게시된 모든 도구(`@qorechain/wallet-adapter`, `@qorechain/sdk`, `@qorechain/chain-bridge` ≥0.1.1)가 이와 동일한 키를 파생하므로, 어떤 툴링을 사용하든 하나의 니모닉은 하나의 키를 생성합니다. CLI에서 키를 복구하려면(니모닉은 stdin으로 입력):

```bash
# the mnemonic is read from stdin; keep it out of shell history by redirecting from a file you delete afterwards
qorechaind tx pqc recover-key mykey qor1youraddress... < mnemonic.txt
# legacy tooling derivation (shake256(mnemonic) only, unbound to the address):
qorechaind tx pqc recover-key mykey qor1youraddress... --derivation bridge < mnemonic.txt
```

복구된 개인 키는 `tx pqc cosign`에서 사용할 수 있도록 암호화되지 않은 16진수(모드 0600)로 `<home>/pqc/mykey.dilithium`에 기록됩니다.

## 키 로테이션 (동일 알고리즘) {#key-rotation}

체인 버전 **v3.1.85**부터 **`MsgRotatePQCKey`**가 계정의 ML-DSA-87 키를 **동일한 알고리즘 내에서** 로테이션합니다 — 이전에는 등록이 일회성이었고 `MigratePQCKey`는 알고리즘 간 전환만 가능했습니다. 레거시 방식으로 파생된 키를 표준(canonical) 주소 바인딩 파생 방식으로 마이그레이션하거나, 유출된 키를 폐기하는 데 사용하세요.

로테이션은 **이중 서명(dual-signed)** 방식입니다: 이전 키와 새 키가 모두 도메인 분리된 메시지 `"qorechain-pqc-rotate-v1|chainId|algorithm|account|oldPubHex|newPubHex"`에 서명합니다. 재사용(replay)은 구조적으로 불가능합니다 — 일단 로테이션되면 이전 키는 더 이상 등록된 키와 일치하지 않으므로 동일한 메시지를 다시 적용할 수 없습니다. 로테이션은 **루트 키 전용** 작업이며([인증자(authenticator)](/developer-guide/account-abstraction#authenticators)에 절대 위임할 수 없음), 트랜잭션 자체는 여전히 *이전* 키로 하이브리드 서명되어 현재 소유권을 증명합니다.

원샷 CLI(니모닉은 stdin으로 입력; 이전 키를 복구하고, 새 키를 파생 또는 생성하고, 이중 서명한 뒤 브로드캐스트합니다):

```bash
# migrate a legacy-derived key to the canonical derivation (mnemonic on stdin):
qorechaind tx pqc rotate-key --old-derivation bridge --new-derivation adapter \
  --from mykey --chain-id qorechain-vladi --gas 600000 --fees 60000uqor -o json -y < mnemonic.txt

# rotate to a brand-new random key (compromise recovery); --new-key-out is required and is written before anything is sent:
qorechaind tx pqc rotate-key --old-derivation adapter --new-random --new-key-out mykey-new \
  --from mykey --chain-id qorechain-vladi --gas 600000 --fees 60000uqor -o json -y < mnemonic.txt
```

로테이션은 2,592바이트 키 두 개와 서명 세 개를 담으므로 일반 전송보다 훨씬 많은 가스가 필요합니다. 명시적인 `--gas 600000`과 최소 60,000 uqor의 수수료를 유지하세요. `--new-key-out` 없이 `--new-random`을 사용하면 거부됩니다(노드 릴리스 v3.2.1 이상). 로테이션 후 새 키를 잃어버리는 일이 없도록 하기 위함입니다.

코드에서는 `@qorechain/wallet-adapter`(≥0.1.7)와 `@qorechain/sdk`(≥0.7.0)가 동일한 플로우를 제공합니다(동기식이며, 메시지와 두 키페어를 반환합니다):

```js
import { rotatePqcKeyMsgFromMnemonic } from "@qorechain/wallet-adapter";

// Builds the dual-signed MsgRotatePQCKey migrating shake256(mnemonic) -> canonical:
const { msg, oldKeypair, newKeypair } = rotatePqcKeyMsgFromMnemonic({
  account: "qor1youraddress...", mnemonic, chainId: "qorechain-vladi",
});
// Sign & broadcast `msg` with the account's normal hybrid signer, using `oldKeypair` for the envelope's PQC signature.
```

SDK 0.9.0과 `@qorechain/wallet-adapter` 0.4.0의 로테이션 헬퍼는 레거시 파생 방식을 **새** 키로 사용하는 것을 거부합니다(계정에 바인딩되지 않기 때문입니다). 레거시 키도 이전 키로는 여전히 사용할 수 있습니다. 로테이션이 성공하면 새 키의 서명이 통과되고(code 0), 이전 키는 거부됩니다(`pqc` code 21). v3.2.3부터 로테이션은(마이그레이션과 마찬가지로) 양자내성 보호를 제공하지 않는 새 키(코드 230)와 계정이 이전에 사용한 키(코드 232)를 거부하며, `authz`를 통해 보낼 수 없습니다.

## 일관된 API

모든 언어가 동일한 인터페이스를 제공합니다:

```text
keygen()                              -> (publicKey, secretKey)
sign(secretKey, message)              -> signature
verify(publicKey, message, signature) -> bool

kem.keygen()                          -> (publicKey, secretKey)
kem.encapsulate(publicKey)            -> (cipherText, sharedSecret)
kem.decapsulate(secretKey, cipherText)-> sharedSecret

shake256(data, outLen=32)             -> digest
```

### 빠른 시작 (JavaScript / TypeScript)

```js
import { mldsa, mlkem, shake256, pubkeyHash } from '@qorechain/pqc';

// ML-DSA-87 signatures
const { publicKey, secretKey } = mldsa.keygen();
const sig = mldsa.sign(secretKey, message);
mldsa.verify(publicKey, message, sig); // true

// ML-KEM-1024 key encapsulation
const { publicKey: ek, secretKey: dk } = mlkem.keygen();
const { cipherText, sharedSecret } = mlkem.encapsulate(ek);
mlkem.decapsulate(dk, cipherText); // === sharedSecret

// SHAKE-256 + blockchain helpers
shake256(data, 32);        // 32-byte digest
pubkeyHash(publicKey, 20); // pay-to-pubkey-hash
```

기본값이 원하는 것과 다를 경우 레벨별 익스포트를 사용할 수 있습니다: `mldsa44/65/87` 및 `mlkem512/768/1024` (`mldsa` / `mlkem`은 L5 기본값입니다).

**Rust, Go, C, Python, Java** 바인딩도 이를 정확히 동일하게 미러링합니다. 예를 들면:

```rust
// Rust
use qorechain_pqc::mldsa::default as mldsa;
let (pk, sk) = mldsa::keygen()?;
let sig = mldsa::sign(&sk, msg)?;
assert!(mldsa::verify(&pk, msg, &sig));
```

```go
// Go
pk, sk, _ := pqc.MLDSA.Keygen()
sig, _ := pqc.MLDSA.Sign(sk, msg)
pqc.MLDSA.Verify(pk, msg, sig) // true
```

## 블록체인 헬퍼

라이브러리는 원시 프리미티브 외에도, 통합 개발자가 QoreChain 계정 및 트랜잭션과 상호작용하는 데 필요한 두 가지 헬퍼를 제공합니다.

### `pubkeyHash(pk, len=20)`

**pay-to-pubkey-hash** 등록 헬퍼입니다. 공개 키의 짧은(20–32바이트) SHAKE-256 해시를 생성합니다. 패턴은 이렇습니다: 계정 상태에는 `pubkeyHash`만 저장하고, 전체 공개 키는 트랜잭션에 포함하도록 요구합니다. 1–2.5 KB 크기의 키와 무관하게 계정 상태는 작게 유지됩니다.

### `hybridSignBytes(version, chainId, bodyWithoutPqcExt, authInfo)`

QoreChain의 지갑 호환 **하이브리드 확장 서명 바이트(sign-bytes) 프레이밍**입니다. 하이브리드 트랜잭션의 PQC 절반을 구성하기 위해 ML-DSA-87 (Dilithium-5)로 서명해야 하는 바이트를 정확히 생성합니다. 두 가지 형식이 있으며 네트워크는 각 높이에서 정확히 하나만 검증합니다: **v1** = `BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A`, **v2** = `"qorechain-pqc-hybrid-v2" ‖ BE64(len chainId) ‖ chainId ‖ BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A` (`B0`는 PQC 확장을 제외한 트랜잭션 본문, `A`는 auth info입니다). 두 공개 네트워크 모두 **v2**를 사용합니다. 라이브러리는 순수 함수이므로 호출자가 형식을 선택합니다: 노드에 `GET /cosmos/upgrade/v1beta1/applied_plan/{name}`을 **두 이름 모두**(메인넷의 업그레이드 이름인 `v3.2.0`과 테스트넷의 이전 이름인 `v3.1.98`) 조회하고, 둘 중 하나라도 높이가 0보다 크면 v2를 사용하세요. `signBytesVersionForApplied`와 `signBytesVersionFor(chainId, height)`가 이 규칙을 구현합니다(`@qorechain/pqc` 0.2.1 이상을 사용하세요. 0.1.x의 인자 2개짜리 형식은 예외를 던집니다).

이것이 지갑과 통합 개발자가 cosmos 트랜잭션 경로에서 **필수 하이브리드 서명**을 생성하는 데 사용하는 구성 요소입니다. 현재 체인 버전 기준으로 하이브리드 서명은 **기본적으로 필수**입니다(`hybrid_signature_mode = required`, `allow_classical_fallback = false`): 모든 cosmos 경로 트랜잭션은 클래식 secp256k1 서명과 함께 Dilithium-5 서명을 포함해야 합니다. 적용(enforcement) 모델은 [양자내성 보안](/architecture/post-quantum-security)을 참조하세요.

클래식 secp256k1 서명은 표준 서명 바이트(PQC 확장을 **제외**함)에 대해 계산되고, ML-DSA-87 서명은 계산되어 `PQCHybridSignature` 확장으로 첨부됩니다. 클래식 서명 바이트가 확장을 제외하기 때문에, 검증자가 PQC 부분을 이해하든 못하든 클래식 서명은 유효하게 유지됩니다.

이 하이브리드 서명을 생성하는 방법은 세 가지입니다:

* **CLI** — `qorechaind tx pqc cosign`이 트랜잭션에 Dilithium-5 공동 서명을 첨부하고 브로드캐스트합니다(`qorechaind tx pqc gen-key` 실행 및 키 등록 이후). 릴리스 바이너리에만 포함되어 있습니다. [트랜잭션 명령어](/cli-reference/transaction-commands)를 참조하세요.
* **QoreChain SDK** — `buildHybridTx` / `signAndBroadcastHybrid`(sign-bytes 형식이 결정되도록 `rest`를 전달하세요)가 TypeScript, Python, Go, Rust, Java에서 동일한 작업을 수행하며, TypeScript에서는 `client.connectTx(signer, { pqcKeypair })`(SDK 0.9.0)가 모든 트랜잭션을 하이브리드로 서명합니다. 먼저 키를 등록하세요(위 참조). [SDK 계정 및 PQC 서명](/sdk/concepts/accounts-pqc)을 참조하세요.
* **`qorechain-pqc` 직접 사용** — 지원되는 6개 언어 중 하나로 SDK 외부에서 툴링을 구축하는 경우, `hybridSignBytes`로 서명 바이트를 프레이밍하고 `mldsa.sign`으로 Dilithium-5 서명을 생성하세요.

## 온체인 풋프린트 최적화

ML-DSA 키와 서명은 클래식 암호 기준으로는 큽니다. 표준의 바이트가 고정되어 있기 때문에, 온체인 풋프린트를 작게 유지하는 방법은 다음 세 가지 수단을 사용하는 것입니다 — 어느 것도 표준을 변경하지 않습니다:

1. **보안 레벨을 신중하게 선택하세요.** ML-DSA-65(L3) 서명은 ML-DSA-87(L5)보다 약 28% 작으면서도 여전히 매우 강력하며, ML-KEM-768 암호문은 1024보다 작습니다. 사용 사례별로 선택하세요.
2. **Pay-to-pubkey-hash.** 계정 상태에는 `pubkeyHash(pk)`(SHAKE-256의 20–32바이트)만 저장하고, 전체 공개 키는 트랜잭션에 포함하도록 요구하세요. 키 크기와 무관하게 계정 상태는 작게 유지됩니다.
3. **서명은 검증 후 폐기하세요.** 서명은 트랜잭션(블록 데이터)에는 존재해야 하지만, 영구 상태 트리에는 절대 기록되어서는 안 됩니다.

> **왜 Falcon은 없나요?** FN-DSA(Falcon)는 더 작은 서명을 제공하지만 의도적으로 **제외**되었습니다: FN-DSA는 FIPS-206 *초안*(최종본이 아님)이며, 표준 전용 라이브러리는 확정된 표준만 제공합니다. FIPS-206이 확정되면 재검토할 수 있습니다.

## 관련 문서

* [양자내성 보안](/architecture/post-quantum-security) — 체인이 이 프리미티브들을 사용하고 하이브리드 서명을 강제하는 방식.
* [트랜잭션 명령어](/cli-reference/transaction-commands) — `tx pqc gen-key` / `tx pqc cosign` CLI 플로우.
* [SDK 계정 및 PQC 서명](/sdk/concepts/accounts-pqc) — QoreChain SDK에서의 키 및 하이브리드 서명.
* [지갑 설정](/getting-started/wallet-setup) — PQC 기반 계정 생성 및 관리.
