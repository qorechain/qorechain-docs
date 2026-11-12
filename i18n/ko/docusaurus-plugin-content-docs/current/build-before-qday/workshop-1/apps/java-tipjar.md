---
slug: /build-before-qday/workshop-1/apps/java-tipjar
title: Java 앱, Q-Day 팁 저금통
sidebar_label: Java, 팁 저금통
sidebar_position: 5
---

# Java 앱: Q-Day 팁 저금통

**Q-Day 팁 저금통**(Tip Jar)은 QoreChain 테스트넷(`qorechain-diana`, EVM 체인 ID 9800)용 작은 Java 프로그램입니다. **하이브리드 서명**으로 팁을 보냅니다. 하이브리드 서명이란 기존 방식의 secp256k1 서명에 양자 내성 ML-DSA-87 서명(FIPS 204)을 더한 것입니다. 쇼핑몰 백엔드처럼 "저금통" 주소를 지켜보면서, 양자 안전 팁과 기존 방식 팁을 구분해 줄 수도 있습니다.

**소요 시간:** 처음에는 약 20분입니다(도구 설치 10분, 설정 5분, 전송과 확인 5분).

Java를 몰라도 됩니다. 아래 명령을 하나씩 입력하고 결과를 "표시되는 내용"과 비교하기만 하면 됩니다.

## 보여 주는 것 {#what-it-shows}

- SDK 호출 한 번으로 Java에서 하는 **하이브리드 ML-DSA-87 + secp256k1 서명**.
- **체인에서 검증된 하이브리드 서명 트랜잭션**: 체인이 `status=verified`인 `pqc_hybrid_verify` 이벤트를 기록하며, 트랜잭션에는 4,627바이트 ML-DSA-87 서명이 담겨 있습니다.
- **양자 안전 팁과 기존 방식 팁을 구분하는 백엔드**: `watch`가 들어오는 모든 송금에 `QUANTUM-SAFE` 또는 `classical only` 라벨을 붙입니다.

중요한 이유: 기존 방식 서명만으로는 미래의 양자 컴퓨터에 뚫릴 수 있다고 예상됩니다. 체인 자체의 검증 기록을 확인하는 서비스는 각 결제를 얼마나 신뢰할지 결정할 수 있습니다. [양자 안전 트랜잭션](/sdk/guides/quantum-safe)을 참고하세요.

:::warning 테스트넷 전용
반드시 일회용 테스트넷 계정만 사용하세요. 테스트넷 QOR에는 가치가 없습니다. 이 튜토리얼에서는 실제 지갑, 실제 복구 문구, 실제 자금을 절대 사용하지 마세요.
:::

## 자주 나오는 용어 {#words}

| 용어 | 의미 |
| --- | --- |
| 테스트넷 | QoreChain의 연습용 사본입니다. 여기의 코인은 무료이며 가치가 없습니다. |
| QOR와 uqor | 같은 코인을 부르는 두 이름입니다. 1 QOR = 1,000,000 uqor. 앱은 QOR 단위로 금액을 묻고, 수수료는 uqor로 표시합니다. |
| 메모 | 은행 송금의 메모처럼 트랜잭션에 첨부하는 짧은 글입니다. |
| 주소 | 내 공개 계좌 번호입니다. QoreChain에서는 `qor1`로 시작합니다. 공유해도 안전합니다. |
| 키 파일 | 비밀 복구 문구가 들어 있는 파일입니다. 절대 공유하지 마세요. |
| 파우셋 | 무료 테스트넷 QOR를 주는 웹사이트입니다. |
| 해시 | 트랜잭션의 고유 ID입니다. 트랜잭션을 조회할 때 사용합니다. |

## 시작 전에 {#before}

세 가지 도구가 필요합니다. **Git**(코드 내려받기), **Java 21 이상**(앱 실행), **Maven**(앱 빌드)입니다. 각 설치 후에는 **터미널을 닫고 새로 연** 다음 확인 명령을 실행하세요.

| 도구 | macOS | Windows | Linux (Debian 또는 Ubuntu) | 확인 |
| --- | --- | --- | --- | --- |
| Git | `brew install git` (Homebrew는 https://brew.sh) | https://git-scm.com/download/win (이것으로 "Git Bash"도 설치됩니다) | `sudo apt install git` | `git --version` |
| Java 21+ | `brew install openjdk@21` | https://adoptium.net (Temurin 21을 선택하고 .msi 설치 프로그램 사용) | `sudo apt install openjdk-21-jdk` | `java -version`에 21 이상이 표시되어야 합니다 |
| Maven | `brew install maven` | https://maven.apache.org/download.cgi 에서 zip을 내려받고 https://maven.apache.org/install.html 을 따르세요 | `sudo apt install maven` | `mvn -version` |

Windows에서는 이 튜토리얼의 터미널로 (Git과 함께 설치되는) **Git Bash**를 사용하세요. 실행 파일 `tipjar`가 셸 스크립트이기 때문입니다. macOS에서는 터미널(Terminal)을, Linux에서는 아무 터미널이나 사용하세요. 일반 PowerShell을 쓰고 싶다면 3단계의 안내를 참고하세요.

**Homebrew를 쓰는 macOS:** `brew install openjdk@21`이 링크를 걸라고 안내할 수 있습니다. `java -version`이 여전히 오래된 버전을 보여 주면, Homebrew가 "For the system Java wrappers to find this JDK" 아래에 출력하는 명령을 실행한 다음 새 터미널을 여세요.

## 테스트넷 지갑과 무료 QOR 받기 {#wallet}

앱이 아래 4단계에서 자체 일회용 키를 만들기 때문에, 이 튜토리얼에 지갑 앱이 꼭 필요한 것은 아닙니다. 테스트넷 QOR를 받을 곳은 필요합니다. QoreX에서 내 계정을 함께 보고 싶다면 다음과 같이 하세요.

1. **QoreX 앱:** 설정을 열고 **Use testnet (developers)**를 켭니다.
2. **QoreX 브라우저 확장 프로그램:** 잠금을 해제하고, 하단의 버전 번호를 7번 누른 다음 **Switch to testnet (diana)**를 선택합니다.

무료 QOR는 https://dashboard.qorechain.io/faucet 의 파우셋에서 받습니다. 로그인하고 주소를 붙여 넣은 뒤 요청하세요. **계정당 24시간에 100 QOR**를 지급합니다.

새 계정의 첫 번째 트랜잭션은 양자 내성 ML-DSA-87 키를 체인에 등록합니다. 한 번만 하는 단계이며 수수료는 약 0.09 QOR입니다. 앱이 `register` 명령으로 이를 처리해 줍니다.

## 단계별 안내 {#run}

### 1. 코드 내려받기 {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/05-java-tipjar
```

**하는 일**

- `git clone <address>`: GitHub의 프로젝트를 내 컴퓨터의 `build-before-qday`라는 새 폴더로 복사합니다.
- `cd <folder>`: 터미널을 Java 앱 폴더로 이동합니다. 이후 모든 명령은 이 폴더에서 실행해야 합니다.

**표시되는 내용:** `Cloning into 'build-before-qday'...` 같은 줄이 나오고, 프롬프트가 새 폴더로 바뀝니다.

### 2. 앱 빌드 {#build}

```bash
mvn -q package
```

**하는 일:** Maven이 Maven Central에서 QoreChain SDK를 내려받고, 앱을 실행 가능한 파일 하나(`target/tipjar.jar`)로 묶습니다.

| 부분 | 의미 |
| --- | --- |
| `mvn` | Maven 빌드 도구입니다. |
| `package` | 코드를 컴파일하고 `.jar` 파일로 묶습니다. |
| `-q` | 조용한 모드입니다. 문제가 있을 때만 출력합니다. |

**표시되는 내용:** 몇 초 동안 아무것도 표시되지 않다가(처음에는 약 10초, 느린 연결에서는 조금 더 걸림) 프롬프트가 돌아옵니다. 파일이 있는지 확인하세요.

```bash
ls target/tipjar.jar
```

**표시되는 내용:** `target/tipjar.jar`.

### 3. 실행 파일 권한 주고 테스트 {#launcher}

```bash
chmod +x tipjar
./tipjar
```

**하는 일**

| 부분 | 의미 |
| --- | --- |
| `chmod +x tipjar` | `tipjar` 파일을 프로그램으로 실행할 수 있게 허용합니다. 새로 내려받은 파일에는 이 권한이 없습니다. |
| `./tipjar` | 이 폴더의 실행 파일을 실행합니다. 내부적으로 `java -jar target/tipjar.jar`를 시작합니다. 명령을 주지 않으면 도움말을 출력합니다. |

**표시되는 내용:** 명령 목록 `new`, `status`, `register`, `tip`, `watch`.

:::note Windows의 일반 PowerShell
`chmod`는 건너뛰세요. 아래의 모든 명령에서 `./tipjar`를 `java -jar target/tipjar.jar`로 바꿔 사용하세요.
:::

### 4. 일회용 테스트넷 계정 만들기 {#key}

```bash
./tipjar new
```

**하는 일:** 새 계정을 만듭니다. 비밀 복구 문구를 키 파일 `~/.config/qday/java.env`(홈 폴더 안, 본인만 읽을 수 있음)에 쓰고, 공개 주소만 출력합니다.

| 부분 | 의미 |
| --- | --- |
| `new` | 새 키 파일을 만들고 그 주소를 출력합니다. |
| `new --force` | 이미 있는 키 파일을 교체합니다. 이전 키는 사라집니다. |

**표시되는 내용:** `new jar key`, 키 파일의 경로, 그리고 `qor1...`로 시작하는 `address`. 복구 문구는 출력되지 않습니다.

**`qor1...` 주소를 복사해 두세요.** 잃어버렸다면 `./tipjar status`가 다시 출력해 줍니다. 키 파일은 절대 공유하지 말고, Git에 커밋하지 말고, 메인넷에서 재사용하지 마세요. 키를 다른 곳에 두려면 먼저 `TIPJAR_KEY`를 설정하세요: `TIPJAR_KEY=/path/to/file ./tipjar status` (PowerShell에서는 `$env:TIPJAR_KEY="C:\path\file"`).

### 5. 파우셋에서 테스트넷 QOR 받기 {#faucet}

1. https://dashboard.qorechain.io/faucet 을 열고 로그인합니다.
2. `qor1...` 주소를 붙여 넣고 요청 버튼을 누릅니다.
3. 몇 초 기다린 다음 실행합니다.

```bash
./tipjar status
```

**하는 일:** 테스트넷에 내 잔액과 양자 내성 키의 등록 여부를 묻습니다.

**표시되는 내용:** `balance   100 QOR`(또는 파우셋 지급액), 그리고 ML-DSA-87 키가 아직 등록되지 않았다는 줄. 잔액이 0이면 10초 기다렸다가 다시 실행하세요.

### 6. 양자 내성 키 등록 {#register}

```bash
./tipjar register
```

**하는 일:** ML-DSA-87 키를 체인에 한 번 기록합니다. 다시 실행해도 안전합니다. 이 첫 트랜잭션은 기존 방식 키로만 서명됩니다. 서명에 쓸 양자 내성 키가 아직 체인에 없기 때문입니다. 약 0.09 QOR가 듭니다. 그 이후의 모든 트랜잭션은 하이브리드로 서명됩니다.

**표시되는 내용:** 트랜잭션 해시와 키가 등록되었다는 메시지. `./tipjar status`를 다시 실행하면 이제 키가 등록된 것으로 표시됩니다.

**소요 시간:** 몇 초(블록 하나)입니다.

### 7. 팁을 받을 두 번째 주소 만들기 {#jar}

팁을 보내려면 받는 사람이 있어야 합니다. 자체 키 파일을 가진 두 번째 일회용 계정, 즉 "저금통"을 만드세요.

```bash
TIPJAR_KEY=~/.config/qday/jar.env ./tipjar new
```

**하는 일:** `./tipjar` 앞부분은 이 명령 한 번에만 키 파일(`TIPJAR_KEY`)을 지정하므로, 새 계정이 첫 번째 계정을 덮어쓰지 않습니다. Windows PowerShell에서는 먼저 `$env:TIPJAR_KEY="$HOME\.config\qday\jar.env"`를 실행한 다음 `java -jar target/tipjar.jar new`를 실행하고, 끝나면 `Remove-Item Env:TIPJAR_KEY`로 되돌리세요.

**표시되는 내용:** 새 `qor1...` 주소. 복사해 두세요. 이것이 **저금통 주소**입니다. 저금통은 팁을 받는 데 QOR가 필요하지 않습니다.

### 8. 하이브리드 서명 팁 보내기 {#tip}

```bash
./tipjar tip qor1...JAR_ADDRESS 1 "my first quantum-safe tip"
```

`qor1...JAR_ADDRESS`를 7단계의 저금통 주소로 바꾸세요.

| 부분 | 의미 |
| --- | --- |
| `tip` | 팁을 보냅니다. |
| `qor1...JAR_ADDRESS` | 팁을 받는 사람입니다. |
| `1` | QOR 단위의 금액입니다(1 QOR = 1,000,000 uqor). |
| `"my first quantum-safe tip"` | 메모이며, 트랜잭션에 첨부되는 짧은 글입니다. 선택 사항입니다. 공백이 있으면 따옴표를 유지하세요. |

**하는 일:** 앱이 체인에 트랜잭션에 필요한 가스량을 묻고(시험 실행), 안전 여유분으로 30퍼센트를 더하고, 두 키로 서명하고, 전송하고, 블록을 기다린 다음 체인 자체의 기록을 확인합니다.

**표시되는 내용:** 트랜잭션 해시, 블록 높이, 그리고 결과 `QUANTUM-SAFE`. `CHECK FAILED`가 보이면 문제 해결을 참고하세요. 해시를 복사해 두세요.

**소요 시간:** 약 10초입니다.

### 9. 쇼핑몰 백엔드처럼 저금통 지켜보기 {#watch}

**두 번째 터미널**을 열고 같은 폴더로 이동한 다음 감시 프로그램을 시작하세요.

```bash
cd build-before-qday/workshop-1/05-java-tipjar
./tipjar watch qor1...JAR_ADDRESS
```

이제 첫 번째 터미널로 돌아가 팁을 한 번 더 보내세요(8단계, 새 메모 사용).

**하는 일:** `watch`는 3초마다 체인에 저금통으로 들어온 새 송금을 묻고 각각에 라벨을 붙입니다. `NO_COLOR=1 ./tipjar watch ...`는 색상을 끕니다. Ctrl+C로 중지합니다.

**표시되는 내용:** 각 팁이 `QUANTUM-SAFE` 태그와 함께 나열됩니다. 검증된 하이브리드 서명 없이 보낸 팁은 `classical only`로 표시됩니다.

## 트랜잭션 직접 검증하기 {#verify}

앱을 믿을 필요는 없습니다. 체인에 직접 물어보세요.

**방법 1, 브라우저에서.** `https://explore.qore.network/tx/<HASH>`를 열고(`<HASH>` 자리에 내 해시를 넣으세요) 탐색기를 **Testnet**으로 전환합니다. 성공한 트랜잭션이 보여야 합니다.

**방법 2, 명령 한 줄.** `<HASH>` 자리에 내 해시를 넣으세요.

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

| 부분 | 의미 |
| --- | --- |
| `curl` | 웹 주소의 내용을 내려받는 도구입니다. macOS, Windows 10 이상, 대부분의 Linux에 내장되어 있습니다. |
| `-s` | 조용한 모드입니다. 진행 표시줄을 숨깁니다. |
| 주소 | 공개 테스트넷 REST API입니다. 전체 트랜잭션 기록을 JSON으로 돌려줍니다. |

긴 출력에서 **표시되는 내용**(JSON 뷰어를 쓰거나, jq를 설치했다면 `| jq .`를 덧붙이세요):

- `"code": 0`은 트랜잭션이 성공했다는 뜻입니다.
- **4,627바이트**의 `pqc_signature`(ML-DSA-87 서명)가 담긴 `PQCHybridSignature` 확장.
- 내 주소에 대해 `status`가 `verified`인 `pqc_hybrid_verify` 이벤트.

## 증명이 작동하는 방식 {#proof}

앱은 `GET /cosmos/tx/v1beta1/txs/{hash}`에서 같은 기록을 읽어, `pqc_hybrid_verify` 이벤트(`address=<signer>`, `status=verified`)와 4,627바이트 서명이 담긴 `/qorechain.pqc.v1.PQCHybridSignature` 확장을 찾습니다. 감시 프로그램도 들어오는 모든 송금에 대해 같은 일을 합니다.

## 문제 해결 {#troubleshooting}

| 보이는 증상 | 원인 | 해결 방법 |
| --- | --- | --- |
| `./tipjar: Permission denied` | 새로 내려받은 파일이 실행 가능으로 표시되어 있지 않습니다. | `chmod +x tipjar`를 실행하세요. |
| `build first: (cd ... && mvn -q package)` | jar 파일이 없습니다. | 이 폴더에서 `mvn -q package`를 실행하세요(2단계). |
| `mvn: command not found` 또는 `java: command not found` | 도구가 설치되지 않았거나, 터미널을 다시 열지 않았습니다. | 설치하고(시작 전에 참고) 새 터미널을 연 다음 버전을 확인하세요. |
| Java 버전이 17 이하로 표시됨 | 오래된 Java가 경로에서 먼저 잡힙니다. | Java 21을 설치하고 새 터미널을 열어 `java -version`을 다시 실행하세요. |
| `no key file at ..., run new first` | 4단계를 건너뛰었거나, `TIPJAR_KEY`가 다른 곳을 가리킵니다. | `./tipjar new`를 실행하세요. |
| `key file already exists` | 이미 키를 만들었습니다. | 그대로 쓰거나, `./tipjar new --force`로 교체하세요(이전 키는 사라집니다). |
| `account has no PQC key and classical fallback is disabled` | 양자 내성 키가 아직 등록되지 않았습니다. | 먼저 `./tipjar register`를 실행하세요. |
| `EVM authorisation window exhausted` | 이 메시지는 EVM 앱(counter, guestbook)에 해당합니다. 팁 저금통에서는 쓰이지 않습니다. | EVM 앱에서 `pnpm window open`으로 새 윈도우를 여세요. |
| 윈도우를 연 뒤 `HHE10402` | Hardhat 앱에만 해당합니다. 윈도우가 아직 활성화되지 않았습니다. | Hardhat 앱에서 배포를 다시 실행하세요. |
| 잔액이 0이거나 `not on chain yet` | 파우셋 토큰이 아직 도착하지 않았습니다. | 10초 기다린 뒤 `./tipjar status`를 실행하세요. 주소를 올바르게 붙여 넣었는지 확인하세요. |
| 파우셋이 요청 한도라고 함 | 계정당 24시간에 한 번만 요청할 수 있습니다. | 기다리거나 두 번째 일회용 계정을 사용하세요. |
| `chain refused the tx` 또는 `poll failed` | 테스트넷이 바쁘거나 업그레이드 중이거나, 공개 엔드포인트가 IP 주소당 요청 수를 제한합니다. | 1분 기다린 뒤 명령을 다시 실행하세요. |
| `recipient must be a qor1... address` | 주소가 틀렸거나 공백이 들어 있습니다. | 전체 `qor1...` 주소를 다시 복사하세요. |
| 브라우저의 `CORS` 오류 | 웹 페이지가 체인을 직접 호출할 때만 발생합니다. 이 앱은 그렇지 않습니다. | 브라우저 앱에서는 템플릿의 `/lcd` 프록시를 사용하세요. |
| `pnpm: command not found` | pnpm이 설치되어 있지 않습니다. 여기서는 필요하지 않습니다. | Hardhat 튜토리얼에서만 `npm install -g pnpm`을 실행하세요. |

## 핵심이 되는 SDK 코드 {#code}

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

가스는 고정값이 아닙니다. 모든 트랜잭션은 먼저 시뮬레이션되고, 시뮬레이션된 가스의 1.3배를 가스당 0.15 uqor로 계산해 적용합니다.

계정은 일반적인 coin-118 QoreChain 계정(`m/44'/118'/0'/0/0`)입니다. ML-DSA-87 키는 같은 복구 문구에서 만들어지며 `Authenticator.derivePqcCanonical`로 주소와 결합됩니다. 시드 기반 도우미로 직접 앱을 만든다면 SDK 0.13.0에는 복구 코드나 독립적인 32바이트 PQC 비밀 값이 필요합니다. [SDK 설치](/sdk/install#whats-new-0130)를 참고하세요. 복구 코드를 절대 출력하지 마세요.

## 사용된 패키지 {#packages}

| 항목 | 버전 |
| --- | --- |
| `io.github.qorechain:qorechain-sdk` (Maven Central) | 0.13.0 |
| `com.fasterxml.jackson.core:jackson-databind` | 2.17.2 |
| `org.codehaus.mojo:exec-maven-plugin` | 3.5.0 |
| `org.apache.maven.plugins:maven-shade-plugin` | 3.6.0 |
| Java (`maven.compiler.release`) | 21 |
| 앱 `demo:tipjar` | 1.0.0 |

모든 언어의 릴리스 표는 [SDK 설치](/sdk/install)를 참고하세요.

## 참고할 곳 {#access}

| 항목 | 위치 |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| 탐색기 | `https://explore.qore.network` (Testnet으로 전환) |
| 파우셋 | https://dashboard.qorechain.io/faucet |
| 코드 | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/05-java-tipjar |
