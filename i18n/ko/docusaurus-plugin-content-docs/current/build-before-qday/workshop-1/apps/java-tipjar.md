---
slug: /build-before-qday/workshop-1/apps/java-tipjar
title: Java 앱, Q-Day Tip Jar
sidebar_label: Java, Tip Jar
sidebar_position: 5
---

# Java 앱: Q-Day Tip Jar

**Q-Day Tip Jar**는 QoreChain 테스트넷(`qorechain-diana`, EVM 체인 ID 9800)을 위한 작은 Java 백엔드입니다. **하이브리드 서명**(기존 방식의 secp256k1과 양자 내성 ML-DSA-87, FIPS 204)으로 팁을 보냅니다. 쇼핑몰 백엔드 예제로서, 팁 항아리(jar) 주소를 지켜보면서 발신자 서명이 하이브리드로 체인에서 검증된 팁만 받아들이게 할 수도 있습니다.

## 보여 주는 것 {#what-it-shows}

- SDK의 호출 경로 하나로 Java에서 하는 **하이브리드 ML-DSA-87 + secp256k1 서명**.
- **온체인에서 검증된 하이브리드 서명 트랜잭션**: 체인이 서명자에 대해 `status=verified`인 `pqc_hybrid_verify` 이벤트를 발생시키고, 트랜잭션에는 4627바이트 ML-DSA-87 서명이 담깁니다.
- **양자 안전 팁과 기존 방식 팁을 구분하는 백엔드**: `watch`가 들어오는 모든 전송에 `QUANTUM-SAFE` 또는 `classical only` 라벨을 붙입니다.

중요한 이유: 기존 방식의 서명만으로는 미래의 양자 컴퓨터가 깰 수 있을 것으로 예상됩니다. 체인 자체의 검증 기록을 확인하는 서비스는 각 결제를 얼마나 신뢰할지 판단할 수 있습니다. [양자 안전 트랜잭션](/sdk/guides/quantum-safe)을 참고하세요.

## 단계별 안내 {#run}

아래의 모든 작업은 자신의 터미널(macOS, Linux 또는 WSL이 있는 Windows)에서 실행됩니다. 일회용 테스트넷 계정만 사용합니다. 테스트넷 QOR에는 가치가 없으며, 여기서는 실제 지갑을 쓰지 않습니다.

### 1. 도구 설치 {#install}

Git, JDK 21 이상, Maven이 필요합니다. 가지고 있는 것을 확인하세요.

```bash
git --version
java -version      # must report 21 or later
mvn -version       # any recent Maven 3.x
```

`java` 또는 `mvn`이 없거나 너무 오래되었다면 먼저 설치하세요. 예를 들어 [Temurin JDK 21](https://adoptium.net)과 [Apache Maven](https://maven.apache.org/install.html)을 쓰거나 패키지 관리자를 사용합니다(macOS는 `brew install openjdk@21 maven`, Debian이나 Ubuntu는 `sudo apt install openjdk-21-jdk maven`). 새 터미널을 열고 세 가지 확인을 다시 실행하세요.

### 2. 코드 받기 {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/05-java-tipjar
```

### 3. 앱 빌드 {#build}

```bash
mvn -q package
```

Maven이 Maven Central에서 SDK를 내려받아 실행 가능한 파일 `target/tipjar.jar` 하나를 빌드합니다. 첫 빌드는 1분 이내로 끝납니다. 그런 다음 실행 스크립트에 실행 권한을 주고 동작하는지 확인합니다.

```bash
chmod +x tipjar
./tipjar
```

명령 목록(`new`, `status`, `register`, `tip`, `watch`)이 보여야 합니다.

### 4. 일회용 테스트넷 계정 만들기 {#key}

```bash
./tipjar new
```

새 복구 문구를 생성해 키 파일 `~/.config/qday/java.env`(본인만 읽을 수 있음, 권한 0600)에 저장하고, `qor1...`로 시작하는 계정 주소만 출력합니다. 문구는 출력되지 않습니다. 이 파일을 공유하거나 커밋하지 마시고, 메인넷에서 재사용하지 마세요. 키를 다른 곳에 두려면 모든 명령 앞에 `TIPJAR_KEY=/path/to/file`을 설정하세요.

출력에서 `qor1...` 주소를 복사합니다. 잃어버렸다면 `./tipjar status`가 다시 출력해 줍니다.

### 5. 포셋에서 테스트넷 QOR 받기 {#faucet}

1. https://dashboard.qorechain.io/faucet 을 열고 로그인합니다.
2. `qor1...` 주소를 붙여 넣고 토큰을 요청합니다. 포셋은 24시간마다 100 QOR를 줍니다.
3. 도착했는지 확인합니다.

```bash
./tipjar status
```

잔액에 테스트넷 QOR가 표시되고, 양자 내성 키는 아직 등록되지 않은 것으로 표시되어야 합니다.

### 6. 양자 내성 키 등록 {#register}

```bash
./tipjar register
```

ML-DSA-87 키를 체인에 한 번 등록합니다. 다시 실행해도 안전합니다. 등록 메시지 자체는 설계상 기존 방식으로 서명합니다. 서명에 쓸 양자 내성 키가 아직 없기 때문이며, 대신 새 키를 가지고 있다는 증명이 포함됩니다. 그 이후의 모든 트랜잭션은 하이브리드로 서명합니다.

### 7. 팁을 받을 두 번째 주소 만들기 {#jar}

팁에는 받는 사람이 필요합니다. 항아리용 두 번째 일회용 계정을 자체 키 파일로 만드세요.

```bash
TIPJAR_KEY=~/.config/qday/jar.env ./tipjar new
```

이 계정의 `qor1...` 주소를 복사합니다. 이것이 항아리 주소입니다.

### 8. 하이브리드 서명 팁 보내기 {#tip}

```bash
./tipjar tip qor1...JAR_ADDRESS 1 "my first quantum-safe tip"
```

`qor1...JAR_ADDRESS`를 7단계의 항아리 주소로 바꾸세요. `1`은 QOR 단위의 금액입니다. 메모는 선택 사항입니다. 앱은 트랜잭션을 시뮬레이션해 가스를 정하고, 두 키로 서명하고, 브로드캐스트하고, 블록을 기다린 다음, 체인의 검증 기록을 확인합니다.

### 9. 쇼핑몰 백엔드처럼 항아리 지켜보기 {#watch}

같은 폴더에서 두 번째 터미널을 엽니다. 항아리 주소에 대해 감시기를 시작한 뒤, 첫 번째 터미널에서 팁을 한 번 더 보내세요.

```bash
./tipjar watch qor1...JAR_ADDRESS
```

감시기는 3초마다 확인하며 들어오는 팁마다 라벨을 붙입니다. Ctrl+C로 중지합니다. 색상을 끄려면 `NO_COLOR=1`을 설정하세요. 공개 테스트넷 엔드포인트에는 IP별 요청 제한이 있으므로, 호출이 실패하면 1분 기다렸다가 다시 시도하세요.

## 확인할 결과 {#output}

- `tip` 후에 터미널에 트랜잭션 해시와 블록 높이가 출력되고, 이어서 검증 결과가 나옵니다. 체인이 하이브리드 서명을 검증했으면 `QUANTUM-SAFE`, 그렇지 않으면 `CHECK FAILED`입니다.
- `watch`에서는 각 팁이 목록에 표시되며, 체인이 하이브리드 서명을 검증했으면 `QUANTUM-SAFE` 태그가, 그렇지 않으면 `classical only`가 붙습니다.
- 익스플로러에서: `https://explore.qore.network/tx/<HASH>`를 열고(터미널에 나온 해시 사용) 익스플로러를 **Testnet**으로 전환합니다. 트랜잭션이 성공으로 표시됩니다.

## 증명이 동작하는 방식 {#proof}

앱은 테스트넷 REST 엔드포인트(`GET /cosmos/tx/v1beta1/txs/{hash}`)에서 트랜잭션을 읽어 다음을 찾습니다.

- `address=<signer>`와 `status=verified`가 있는 `pqc_hybrid_verify` 이벤트
- 4627바이트 `pqc_signature`가 담긴 `/qorechain.pqc.v1.PQCHybridSignature` 확장

감시기는 들어오는 모든 전송에 대해 정확히 이것을 읽습니다.

## 핵심 SDK 코드 {#code}

```java
PqcDx.Signer signer = new PqcDx.Signer();                  // keys, chain id, account number, sequence
signer.secp256k1PrivateKey = account.privateKey;            // classical half
signer.pqcKeypair = Authenticator.derivePqcCanonical(account.address, mnemonic); // ML-DSA-87 half
signer.chainId = "qorechain-diana";
signer.restUrl = Networks.get("testnet").endpoints.rest;    // sign-bytes version and key checks

PqcDx.HybridSendPath path = PqcDx.migrateToHybrid(signer, new Broadcaster(rpc), null, opts); // registers once
TypedMessage tip = NativeTx.bankSend(from, to, List.of(new StdFee.Coin("uqor", "500000")));
var sent = path.sendAuto(List.of(tip), "0.15uqor", 1.3);   // simulate, price, hybrid-sign, broadcast
TxTracker.waitForTx(new RestClient(rest), sent.result.transactionHash, null);
```

가스는 고정값이 아닙니다. 모든 트랜잭션은 먼저 시뮬레이션되며, 시뮬레이션된 가스의 1.3배가 한도가 되고, 가스당 0.15 uqor로 가격이 매겨집니다.

이 계정은 일반적인 coin-118 QoreChain 계정(`m/44'/118'/0'/0/0`)입니다. ML-DSA-87 키는 같은 복구 문구에서 파생되며 `Authenticator.derivePqcCanonical`로 주소에 바인딩됩니다. 시드 기반 헬퍼로 직접 앱을 만든다면 SDK 0.13.0에는 복구 코드 또는 독립적인 32바이트 PQC 시크릿이 필요합니다. [SDK 설치](/sdk/install#whats-new-0130)를 참고하세요. 복구 코드는 절대 출력하지 마세요.

## 사용한 패키지 {#packages}

| 항목 | 버전 |
| --- | --- |
| `io.github.qorechain:qorechain-sdk`(Maven Central) | 0.13.0 |
| `com.fasterxml.jackson.core:jackson-databind` | 2.17.2 |
| `org.codehaus.mojo:exec-maven-plugin` | 3.5.0 |
| `org.apache.maven.plugins:maven-shade-plugin` | 3.6.0 |
| Java(`maven.compiler.release`) | 21 |
| 앱 `demo:tipjar` | 1.0.0 |

모든 언어의 릴리스 표는 [SDK 설치](/sdk/install)를 참고하세요.

## 참고할 곳 {#access}

| 항목 | 위치 |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| 익스플로러 | `https://explore.qore.network`(Testnet으로 전환) |
| 포셋 | https://dashboard.qorechain.io/faucet |
| 코드 | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/05-java-tipjar |
