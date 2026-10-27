---
slug: /developer-tools/pqc-library
title: 포스트 퀀텀 라이브러리 (qorechain-pqc)
sidebar_label: PQC 라이브러리
sidebar_position: 20
---

# 포스트 퀀텀 라이브러리 (`qorechain-pqc`)

`qorechain-pqc`는 QoreChain 도구가 기반으로 삼는, 표준만을 구현한 포스트 퀀텀 암호 라이브러리입니다. 전체 [QoreChain SDK](/sdk/overview)에 의존하지 않고 체인이 사용하는 정확한 키와 서명을 만들거나 검사해야 하는 지갑, 백엔드, 거래소, 도구 개발자를 위한 라이브러리입니다. 세 가지 NIST 표준(서명용 ML-DSA(FIPS 204), 키 캡슐화용 ML-KEM(FIPS 203), 해시용 SHAKE-256(FIPS 202))의 독립 구현을 TypeScript/JavaScript, Python, Rust, Go, Java, C에서 하나의 API로 감싸고, 하이브리드 QoreChain 트랜잭션이 서명하는 바이트를 만드는 헬퍼를 추가합니다. 버전 **0.2.3**, Apache-2.0이며, 2026년 10월 27일에 레지스트리에서 확인했습니다.

이 라이브러리는 프리미티브 라이브러리입니다. 네트워크와 통신하지 않고, 키를 보관하지 않으며, 체인에 키를 등록하거나 트랜잭션을 보내지 않습니다. 하이브리드 서명과 키 등록에 관한 체인 규칙은 [포스트 퀀텀 서명](/developer-guide/post-quantum-signing)과 [포스트 양자 보안](/architecture/post-quantum-security)을 읽으세요. 바로 사용할 수 있는 서명 클라이언트가 필요하면 이 프리미티브 위에 구축된 [SDK](/sdk/overview)나 [QoreSign](/qoresign/overview)을 사용하세요.

## 혁신 {#innovations}

* **하나의 테스트 벡터 세트, 여섯 개의 독립 백엔드.** JavaScript 바인딩은 `@noble/post-quantum`을, Rust는 `fips204`, `fips203`, `sha3` 크레이트를, Go는 Cloudflare CIRCL을, Java는 Bouncy Castle을, Python과 C는 liboqs를 사용합니다. 각 바인딩의 테스트 스위트는 저장소 `vectors/` 폴더의 동일한 파일(세 가지 레벨의 ML-DSA, 세 가지 레벨의 ML-KEM, SHAKE-256)을 바이트 단위로 재현해야 하므로, 한 언어에서 만든 서명은 다른 언어에서도 검증됩니다.
* **기본값은 결정론적 서명.** `sign`은 FIPS 204의 결정론적 변형(0 바이트 32개의 서명 난수)을 사용하므로, 같은 키와 메시지는 모든 바인딩에서 바이트 단위로 동일한 서명을 만듭니다. 덕분에 서명과 이를 포함한 트랜잭션 해시를 재현하고 벡터와 대조해 확인할 수 있습니다.
* **상호 운용되는, 명시적으로 선택하는 헤지드 서명.** 무작위(헤지드) 서명은 JavaScript의 `{hedged: true}`, Python의 `hedged=True`, Rust의 `sign_hedged`, Go의 `SignHedged`(0.2.3에서 추가), Java의 `mldsaSignHedged`, C의 `qpqc_mldsa_sign_hedged`로 사용할 수 있습니다. 여섯 언어 중 어느 것에서 만든 헤지드 서명도 여섯 언어 모두에서 검증됩니다(0.2.3에서 36개 조합 중 36개 확인). 체인은 유효한 FIPS 204 ML-DSA-87 서명이면 무엇이든 검증하므로 두 종류 모두 받아들이며, 비밀 키 없이는 둘을 구별할 수 없습니다.
* **체인이 만드는 방식 그대로 만드는 체인의 하이브리드 서명 바이트.** 모든 바인딩에 `hybridSignBytesV1`, `hybridSignBytesV2`, 그리고 버전을 필수로 받는 디스패처 `hybridSignBytes(version, chainId, body, authInfo)`가 있습니다. v2 형식은 `"qorechain-pqc-hybrid-v2"`, 64비트 빅엔디언 길이가 붙은 체인 id, 그리고 각각 32비트 빅엔디언 길이가 붙은 트랜잭션 본문(PQC 확장 제외)과 auth info로 이루어집니다. 모든 바인딩은 체인의 알려진 정답 파일(`vectors/signbytes-kat-v3.1.98.json`)에 대해 테스트됩니다. 어떤 체인에도 바인딩되지 않은 바이트는 어떤 네트워크에서도 검증되지 않으므로, 검사가 적용된 진입점은 빈 체인 id를 거부합니다.
* **순수 함수로 결정되는 네트워크의 서명 바이트 버전.** 네트워크는 한 번에 정확히 하나의 형식만 검증하며, v2로의 전환은 두 가지 플랜 이름(메인넷의 `v3.2.0`(높이 2,981,742), 테스트넷의 `v3.1.98`)으로 적용되었습니다. `SIGN_BYTES_V2_UPGRADES`는 두 이름을 모두 나열하고, `signBytesVersionForApplied(chainId, appliedHeights)`는 노드에서 읽은 적용 높이로부터 `v1` 또는 `v2`를 반환합니다. 한 이름만 조회하면 다른 이름으로 전환한 네트워크를 잘못 판단하게 됩니다.
* **엄격한 입력 검사.** `verify`는 절대 오류를 던지지 않습니다. 길이가 맞지 않는 키나 서명, 그 밖의 잘못된 입력은 `false`를 반환합니다. `keygen(seed)`, `sign`, `encapsulate`, `decapsulate`는 잘못된 인수와 기대 길이를 알려주는 오류를 던집니다.
* **순수 JavaScript, 네이티브 코드 없음.** npm 패키지는 WebAssembly나 애드온 없이 Node와 브라우저에서 실행됩니다. 저장소 자체 측정(0.2.3, 1.5 KB 메시지, 코어 1개)에서 Apple 실리콘 노트북 기준으로 ML-DSA-87 서명에 걸리는 시간은 JavaScript에서 약 8 ms, 나머지 다섯 바인딩에서 약 0.3 ~ 0.45 ms입니다.

## 사용 방법 {#how-to-use}

다섯 개 레지스트리 패키지는 모두 같은 연산을 제공합니다. `keygen`, `keygenFromSeed`(32바이트 시드), `sign`, `verify`, ML-KEM의 `keygen`, `encapsulate`, `decapsulate`, `shake256`, `pubkeyHash`, 그리고 서명 바이트 헬퍼입니다. 기본값은 ML-DSA-87과 ML-KEM-1024이며, 레벨별 변형(44, 65, 87 및 512, 768, 1024)이 함께 내보내집니다. ML-DSA-87의 공개 키는 2,592바이트, 서명은 4,627바이트이며, 아래 예제에서 이를 출력합니다.

### 설치 및 가져오기 {#install}

| 언어 | 설치 | 가져오기 |
| --- | --- | --- |
| TypeScript / JavaScript | `npm install @qorechain/pqc` | `import { mldsa } from "@qorechain/pqc"` |
| Python (3.9 이상) | `pip install qorechain-pqc` | `from qorpqc import mldsa` |
| Rust | `cargo add qorechain-pqc` | `use qorechain_pqc::mldsa;` |
| Go | `go get github.com/qorechain/qorechain-pqc/go` | `import pqc "github.com/qorechain/qorechain-pqc/go"` |
| Java | `implementation("io.github.qorechain:qorechain-pqc:0.2.3")` | `import network.qorechain.pqc.Pqc;` |
| C | 저장소의 `c/`를 빌드 (정적 라이브러리와 헤더) | `qorechain_pqc.h` |

### 언어별 서명 및 검증 {#examples}

이 예제는 개발자 허브의 퀵스타트입니다. 각각 2026년 10월 27일에 공개 레지스트리에서 설치한 뒤(Node 26, liboqs가 있는 Python 3.12, Rust 1.95, Go 1.26, Gradle 9.6의 JDK 21) 수정 없이 실행했으며, 공개 키 크기, 서명 크기, 검증 결과 `2592 4627 true`를 출력했습니다(Python은 `True`를 출력). 어느 것도 네트워크나 자금이 있는 키를 사용하지 않으며, C 바인딩에는 퀵스타트가 없습니다.

TypeScript:

```ts
import { mldsa } from "@qorechain/pqc";

// ML-DSA-87 key pair from a fixed 32-byte seed (example only; use a random seed in practice).
const seed = new Uint8Array(32).fill(7);
const { publicKey, secretKey } = mldsa.keygen(seed);

const message = new TextEncoder().encode("hello QoreChain");
const signature = mldsa.sign(secretKey, message); // deterministic by default
const ok = mldsa.verify(publicKey, message, signature);
console.log(publicKey.length, signature.length, ok);
```

Python:

```python
from qorpqc import mldsa

# ML-DSA-87 key pair. The Python binding generates keys from the system RNG
# (it does not take a seed); signing is deterministic by default.
public_key, secret_key = mldsa.keygen()

message = b"hello QoreChain"
signature = mldsa.sign(secret_key, message)
ok = mldsa.verify(public_key, message, signature)
print(len(public_key), len(signature), ok)
```

Rust:

```rust
use qorechain_pqc::mldsa;

fn main() {
    // ML-DSA-87 key pair from a fixed 32-byte seed (example only; use a random seed in practice).
    let seed = [7u8; 32];
    let (pk, sk) = mldsa::default::keygen_from_seed(&seed);

    let message = b"hello QoreChain";
    let sig = mldsa::default::sign(&sk, message).expect("sign"); // deterministic
    let ok = mldsa::default::verify(&pk, message, &sig);
    println!("{} {} {}", pk.len(), sig.len(), ok);
}
```

Go:

```go
package main

import (
	"bytes"
	"fmt"

	pqc "github.com/qorechain/qorechain-pqc/go"
)

func main() {
	// ML-DSA-87 key pair from a fixed 32-byte seed (example only; use a random seed in practice).
	pk, sk, _ := pqc.MLDSA.KeygenFromSeed(bytes.Repeat([]byte{7}, 32))

	message := []byte("hello QoreChain")
	sig, _ := pqc.MLDSA.Sign(sk, message) // deterministic
	fmt.Println(len(pk), len(sig), pqc.MLDSA.Verify(pk, message, sig))
}
```

Java (`PqcQuickstart.java`로 저장):

```java
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import network.qorechain.pqc.Pqc;

public class PqcQuickstart {
    public static void main(String[] args) {
        // ML-DSA-87 key pair from a fixed 32-byte seed (example only; use a random seed in practice).
        // In the Java binding the secret key IS the 32-byte seed.
        byte[] seed = new byte[32];
        Arrays.fill(seed, (byte) 7);
        byte[][] kp = Pqc.mldsaKeygenFromSeed("ml-dsa-87", seed); // {publicKey, secretKey}

        byte[] message = "hello QoreChain".getBytes(StandardCharsets.UTF_8);
        byte[] sig = Pqc.mldsaSign("ml-dsa-87", kp[1], message); // deterministic
        boolean ok = Pqc.mldsaVerify("ml-dsa-87", kp[0], message, sig);
        System.out.println(kp[0].length + " " + sig.length + " " + ok);
    }
}
```

고정 시드(32바이트, 각 바이트 값 7)는 예제일 뿐입니다. 실제 키에는 무작위 시드나 [포스트 퀀텀 서명](/developer-guide/post-quantum-signing#key-derivation)에 설명된 키 파생을 사용하세요.

### 헤지드 서명 {#hedged}

`sign`은 결정론적 서명을 합니다. 무작위 서명을 선택하려면 명시적 변형을 호출하세요. 예를 들어 JavaScript에서는 `mldsa.sign(secretKey, message, { hedged: true })`, Python에서는 `mldsa.sign(secret_key, message, hedged=True)`입니다. 매번 다른 서명을 원할 때만 사용하세요. 체인은 둘 다 받아들이며, `pqc` 코드 21(`hybrid_verify_failed`)은 둘 중 무엇을 선택했는지 때문에 발생하는 일이 없습니다([문제 해결 목록](/developer-guide/post-quantum-signing#code-21) 참조).

### 서명 바이트 형식 선택 {#sign-bytes}

노드에 어떤 업그레이드 이름이 적용되었는지 물어본 다음 라이브러리가 결정하도록 하세요. 다음은 패키지 README의 JavaScript 형태이며, 다른 바인딩도 각자의 스타일로 같은 이름을 내보냅니다.

```ts
import { SIGN_BYTES_V2_UPGRADES, signBytesVersionForApplied, hybridSignBytes } from "@qorechain/pqc";

const applied: Record<string, string> = {};
for (const name of SIGN_BYTES_V2_UPGRADES) {
  const r = await fetch(`${rest}/cosmos/upgrade/v1beta1/applied_plan/${name}`).then((x) => x.json());
  applied[name] = r.height; // "0" means not applied
}
const version = signBytesVersionForApplied(chainId, applied); // "v1" or "v2"
const signBytes = hybridSignBytes(version, chainId, bodyWithoutPqcExt, authInfoBytes);
```

`rest`는 메인넷(`qorechain-vladi`)에서는 `https://api.qore.host`, 테스트넷(`qorechain-diana`)에서는 `https://api-testnet.qore.host`입니다. 현재 두 네트워크 모두 v2를 검증합니다. 대부분의 애플리케이션은 이를 직접 할 필요가 없습니다. SDK와 QoreSign이 네트워크별로 형식을 정합니다.

## 접근 방법 {#how-to-access}

* **라이브러리를 사용하는 데 네트워크, 계정, 키가 필요하지 않습니다.** 오프라인에서 실행됩니다. 라이브러리가 만든 키 쌍은 단지 키일 뿐입니다. QoreChain에서 사용하려면 계정이 공개 키를 한 번 등록해야 하며([포스트 퀀텀 서명](/developer-guide/post-quantum-signing#pqc-key-registration) 참조), 이후 Cosmos 레인 트랜잭션에는 secp256k1 서명과 ML-DSA-87 서명(하이브리드)이 모두 필요합니다.
* **네트워크.** 서명 바이트 헬퍼와 벡터는 메인넷 `qorechain-vladi`(v3.2.4)와 테스트넷 `qorechain-diana`(v3.2.6)에 맞춰져 있습니다. 엔드포인트는 [네트워크](/appendix/networks)를 참조하세요.
* **Python에는 liboqs 공유 라이브러리가 필요합니다.** `pip install qorechain-pqc`는 `liboqs-python`에 의존하며, 이 패키지는 liboqs가 없으면 첫 가져오기 때 이를 빌드합니다. 이를 위해 머신에 `git`, CMake, C 컴파일러가 필요합니다. 제한된 환경에서는 시스템 패키지 관리자로 liboqs를 설치하거나 미리 빌드해 두세요. Python 바인딩은 시스템 난수 생성기에서 키를 읽으며 0.2.3에는 시드 기반 키 생성이 없습니다.
* **Go는 Go 1.25 이상이 필요합니다**(0.2.1부터의 요구 사항이며, CIRCL 1.6.5 이상과 함께).
* **Java**는 JDK 21로 실행해 보았습니다. Java 바인딩의 ML-DSA 비밀 키는 다른 바인딩이 사용하는 4,896바이트 확장 키가 아니라 32바이트 FIPS 204 시드이며, 그 외의 입력은 거부됩니다.
* **Java의 Bouncy Castle 고정.** Java 바인딩은 0.2.3부터 Bouncy Castle 1.85 위에 구축되어 있습니다(이전 릴리스는 공개된 보안 권고가 있는 이전 버전을 사용했으나, 바인딩이 호출하는 ML-DSA 또는 ML-KEM 코드에는 해당 사항이 없었습니다). 프로젝트 변경 기록에 따르면 1.85는 `org.bouncycastle.pqc.crypto` 클래스를 여전히 포함하는 마지막 Bouncy Castle 릴리스이므로, 빌드를 1.85에 유지하고, 다른 의존성이 더 새로운 릴리스를 끌어오기 전에 테스트하세요. 이후 릴리스에는 해당 클래스가 더 이상 포함되지 않습니다.
* **비용.** 무료이며 Apache-2.0 오픈 소스입니다. 서명과 검증에는 비용이 들지 않으며, 결과 서명을 온체인에서 사용할 때는 일반 수수료(하한 가스당 0.1 uqor)를 지불합니다.

## 게시 위치 {#where-published}

| 레지스트리 | 패키지 | 버전 | 링크 |
| --- | --- | --- | --- |
| npm | `@qorechain/pqc` | 0.2.3 | https://www.npmjs.com/package/@qorechain/pqc |
| PyPI | `qorechain-pqc` (import `qorpqc`) | 0.2.3 | https://pypi.org/project/qorechain-pqc/ |
| crates.io | `qorechain-pqc` | 0.2.3 | https://crates.io/crates/qorechain-pqc |
| Go 모듈 프록시 | `github.com/qorechain/qorechain-pqc/go` | v0.2.3 (태그 `go/v0.2.3`) | https://pkg.go.dev/github.com/qorechain/qorechain-pqc/go |
| Maven Central | `io.github.qorechain:qorechain-pqc` | 0.2.3 | https://central.sonatype.com/artifact/io.github.qorechain/qorechain-pqc |
| C | 소스만 제공, 패키지 레지스트리 없음 | 태그 `v0.2.3` | https://github.com/qorechain/qorechain-pqc |

소스: https://github.com/qorechain/qorechain-pqc (폴더 `js`, `python`, `rust`, `go`, `java`, `c`, `vectors`). 모든 패키지는 Apache-2.0입니다. 버전은 2026년 10월 27일에 각 레지스트리에서 읽었습니다. 키 파생과 로테이션을 포함해 같은 라이브러리를 개념적으로 설명하는 가이드는 [포스트 퀀텀 서명](/developer-guide/post-quantum-signing)이며, 이를 사용하는 SDK는 [SDK 개요](/sdk/overview)에 설명되어 있습니다.

## 제한 사항 및 알려진 문제 {#limits}

* **지갑이나 클라이언트가 아니라 프리미티브 라이브러리입니다.** 키를 등록하거나, 트랜잭션을 구성하거나, 브로드캐스트하거나, 체인을 읽지 않습니다. 이런 용도에는 [SDK](/sdk/overview)나 [QoreSign](/qoresign/overview)을 사용하세요.
* **Python과 C는 시드로부터 키를 생성할 수 없습니다.** 둘 다 시스템 난수 생성기에서 키를 뽑는 liboqs를 기반으로 합니다. 이들의 벡터 테스트는 대신 확장 비밀 키를 사용합니다.
* **Java 비밀 키는 시드입니다.** Java와 다른 바인딩 사이에서 ML-DSA 비밀 키를 옮기는 코드는 변환해야 합니다. Java 값은 32바이트 시드이고, 다른 바인딩은 ML-DSA-87의 4,896바이트 확장 키입니다.
* **Python 바인딩은 liboqs가 아직 설치되어 있지 않으면 처음에 C 툴체인이 필요합니다.** Python 퀵스타트는 liboqs가 이미 있는 상태에서 실행했습니다.
* **C 바인딩에는 레지스트리 패키지와 테스트된 퀵스타트가 없습니다.** 저장소에서 빌드하세요. liboqs와 OpenSSL이 필요합니다.
* **키 크기는 표준이 정합니다.** ML-DSA-87 서명은 4,627바이트, 공개 키는 2,592바이트이며, 표준과 호환되는 더 작은 형식은 없습니다.
* **이전 릴리스.** 0.2.1 이상을 사용하세요. 0.2.0에서 버전을 인식하는 `hybridSignBytes`가 도입되었고(이전의 인수 두 개짜리 형식은 이제 `hybridSignBytesV1`), 0.2.1에서 두 업그레이드 플랜 이름이 모두 추가되었습니다. 0.2.2와 0.2.3은 문서와 의존성 버전을 변경했으며 출력은 동일합니다.
* **하이브리드 사용에는 나머지 절반도 필요합니다.** 하이브리드 서명에는 secp256k1 서명도 포함됩니다. 이 라이브러리는 ML-DSA 절반만 만듭니다. 계정, 등록, EVM 인가 윈도우는 [포스트 퀀텀 서명](/developer-guide/post-quantum-signing)과 [EVM 가이드](/developer-guide/evm-development#evm-window)에 문서화된 체인 규칙입니다.
