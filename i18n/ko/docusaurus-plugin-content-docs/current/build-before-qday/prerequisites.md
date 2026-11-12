---
slug: /build-before-qday/prerequisites
title: "시작하기 전에: 도구와 테스트넷 지갑"
sidebar_label: "시작하기 전에"
sidebar_position: 2
---

# 시작하기 전에: 도구와 테스트넷 지갑

이 섹션의 모든 튜토리얼은 아무것도 설치되지 않은 컴퓨터에서 시작합니다. 이 페이지는 그 준비를 한 번에 끝내는 곳입니다. 한 번만 해 두고 원하는 튜토리얼을 여세요. 각 튜토리얼은 이 페이지로 연결되며, 필요한 짧은 확인 명령만 다시 안내합니다.

**소요 시간:** 처음에는 약 20분에서 40분이며, 대부분 다운로드 시간입니다. 따라 할 튜토리얼에 필요한 도구만 설치하면 됩니다.

:::caution 일회용 테스트넷 계정만 사용하세요
여기서 하는 모든 작업은 QOR에 가치가 없는 QoreChain **테스트넷**에서 이루어집니다. 어떤 튜토리얼에서도 실제 지갑, 실제 복구 문구, 실제 자금을 사용하지 마세요. 이 연습만을 위한 새 계정을 만들게 됩니다.
:::

## 튜토리얼마다 어떤 도구가 필요한가요? {#which-tools}

필요한 행의 도구만 설치하세요. Git, 터미널, 웹 브라우저는 모든 튜토리얼에 필요합니다.

| 튜토리얼 | 언어 | 설치할 도구 | QoreX 지갑 |
| --- | --- | --- | --- |
| [워크숍 1 가이드](/build-before-qday/workshop-1) | TypeScript | Node.js, pnpm, curl, jq(선택) | 필요 없음 |
| [Q-Day Counter](/build-before-qday/workshop-1/apps/qday-counter) | TypeScript | Git, Node.js, pnpm | 필요 없음 |
| [Q-Day Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) | TypeScript | Git, Node.js, pnpm | 필요. 이더리움 계정(coin 60)이 있어야 합니다 |
| [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) | TypeScript | Git, Node.js, pnpm | 필요 |
| [Rust, qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) | Rust | Git, Rust | 필요 없음 |
| [Java, Tip Jar](/build-before-qday/workshop-1/apps/java-tipjar) | Java | Git, Java 21, Maven | 필요 없음 |
| [Python, Airdrop](/build-before-qday/workshop-1/apps/python-airdrop) | Python | Git, Python 3.10 이상 | 필요 없음 |

## 터미널 열기 {#terminal}

터미널은 명령을 입력하는 창입니다. 이 페이지들의 명령을 복사해서 한 번에 하나씩 붙여 넣게 됩니다.

| 시스템 | 여는 방법 |
| --- | --- |
| macOS | Command와 Space를 누르고 `Terminal`을 입력한 뒤 Return을 누릅니다. |
| Windows | 시작 메뉴를 열고 `PowerShell`을 입력한 뒤 **Windows PowerShell**을 엽니다. Java 튜토리얼에는 **Git Bash**(아래 설명처럼 Git과 함께 설치됨) 또는 WSL도 필요합니다. |
| Linux | Ctrl, Alt, T를 누르거나 애플리케이션에서 `Terminal`을 검색합니다. |

도구를 설치한 뒤에는 **터미널을 닫고 새로 여세요.** 설치하는 동안 열려 있던 터미널은 새 도구를 아직 인식하지 못합니다.

## 도구 설치하기 {#install}

도구마다 설치 명령이나 다운로드 링크를 안내한 다음 **확인 명령**을 보여 줍니다. 확인 명령은 도구에 버전을 묻는 명령입니다. 필요한 버전 이상의 번호가 출력되면 도구가 잘 작동하는 것입니다.

### 패키지 관리자(선택 사항) {#package-managers}

패키지 관리자는 명령 하나로 다른 프로그램을 설치해 주는 도구입니다. 각 도구를 해당 웹사이트에서 직접 내려받아도 됩니다. 아래 명령은 각 시스템에 맞는 패키지 관리자를 사용합니다.

| 시스템 | 패키지 관리자 | 받는 방법 |
| --- | --- | --- |
| macOS | Homebrew | 아래 한 줄을 터미널에 붙여 넣고, 출력되는 안내를 따릅니다. `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` |
| Windows | winget | Windows 10과 11에 이미 포함되어 있습니다. `winget --version`으로 확인하세요. |
| Linux | apt | Ubuntu와 Debian에는 이미 포함되어 있습니다. 다른 시스템은 사용하는 패키지 관리자(`dnf`, `pacman`)를 쓰세요. |

### Git {#git}

Git은 GitHub에서 예제 코드를 내려받는 도구입니다.

| 시스템 | 설치 |
| --- | --- |
| macOS | `xcode-select --install`(창이 열리면 **설치**를 선택) 또는 `brew install git` |
| Windows | `winget install --id Git.Git -e` 또는 [git-scm.com](https://git-scm.com/download/win)에서 다운로드 |
| Linux | `sudo apt install -y git` |

확인하기:

```bash
git --version
```

`git version 2.40.0` 같은 한 줄이 보여야 합니다. 어떤 버전이든 괜찮습니다.

### Node.js 22.13 이상 {#node}

Node.js는 TypeScript 프로젝트를 실행합니다. 여기서 사용하는 컨트랙트 도구인 Hardhat 3은 Node.js 22.13보다 낮은 버전에서는 시작을 거부합니다.

| 시스템 | 설치 |
| --- | --- |
| macOS | `brew install node` 또는 [nodejs.org](https://nodejs.org)에서 LTS 설치 프로그램 다운로드 |
| Windows | `winget install --id OpenJS.NodeJS.LTS -e` 또는 [nodejs.org](https://nodejs.org)에서 LTS 설치 프로그램 다운로드 |
| Linux (Ubuntu, Debian) | `curl -fsSL https://deb.nodesource.com/setup_22.x \| sudo -E bash -` 다음 `sudo apt install -y nodejs` |

:::note Linux: 기본 apt 패키지를 쓰지 마세요
Ubuntu와 Debian에서 `sudo apt install nodejs`를 실행하면 너무 오래된 버전이 설치됩니다. 위의 NodeSource 명령을 사용하세요.
:::

확인하기:

```bash
node -v
```

`v22.13.0` 이상이 보여야 합니다. 예를 들어 `v22.20.0`이나 `v24.1.0`입니다. 더 낮은 번호가 보이면 다시 설치하고 새 터미널을 여세요.

### pnpm 9 이상 {#pnpm}

pnpm은 TypeScript 프로젝트에 필요한 라이브러리를 설치합니다. `npm`과 같은 일을 하지만 더 빠릅니다.

모든 시스템에서 Node.js에 포함된 설치 도구 `npm`으로 설치합니다.

```bash
npm install -g pnpm
```

| 부분 | 하는 일 |
| --- | --- |
| `npm install` | 프로그램을 내려받아 설치합니다. |
| `-g` | "global"의 줄임말로, 폴더 하나가 아니라 컴퓨터 전체에 설치합니다. |
| `pnpm` | 설치할 프로그램입니다. |

macOS와 Linux에서 `EACCES`나 "permission denied"로 끝나면 `sudo npm install -g pnpm`으로 다시 실행하세요.

:::caution Homebrew로 설치한 Node.js에는 pnpm이 들어 있지 않습니다
튜토리얼에서 `pnpm: command not found`(또는 `zsh: command not found: pnpm`)가 나오면 아직 pnpm을 설치하지 않은 것입니다. `npm install -g pnpm`을 실행하고, 새 터미널을 열어 다시 시도하세요.
:::

확인하기:

```bash
pnpm -v
```

`9.0.0` 이상이 보여야 합니다. 예를 들어 `10.4.1`입니다.

### curl과 jq(워크숍 1 가이드 전용) {#curl-jq}

`curl`은 터미널에서 웹 주소의 내용을 내려받는 도구입니다. 공개 REST 엔드포인트에서 내 트랜잭션을 읽을 때 사용합니다. `jq`는 긴 응답에서 원하는 부분만 보이게 걸러 줍니다. `jq`는 선택 사항입니다.

| 시스템 | curl | jq |
| --- | --- | --- |
| macOS | 기본 포함. | `brew install jq` |
| Windows | Windows 10과 11에 `curl.exe`로 포함되어 있습니다. | `winget install --id jqlang.jq -e` |
| Linux | 없으면 `sudo apt install -y curl` | `sudo apt install -y jq` |

확인하기:

```bash
curl --version
jq --version
```

각각 버전이 담긴 한 줄이 보여야 합니다. 예를 들어 `jq-1.7`입니다.

:::note Windows PowerShell에서는 curl.exe로 입력하세요
PowerShell에서 짧은 이름 `curl`은 다른 내장 명령입니다. 이 페이지들의 모든 명령에서 `curl` 대신 `curl.exe`를 입력하세요. Git Bash를 쓰면 `curl` 그대로 작동합니다.
:::

### Rust 1.88 이상(Rust 튜토리얼 전용) {#rust}

Rust는 `qday-pay` 명령줄 앱을 컴파일합니다. Rust 공식 설치 프로그램인 `rustup`으로 설치하며, Rust 빌드 도구인 `cargo`도 함께 설치됩니다.

| 시스템 | 설치 |
| --- | --- |
| macOS | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh`(Return을 눌러 기본값을 수락). 컴파일러 도구는 `xcode-select --install`로 설치됩니다. |
| Windows | [rustup.rs](https://rustup.rs)에서 `rustup-init.exe`를 내려받아 실행하거나 `winget install --id Rustlang.Rustup -e`. Visual Studio C++ Build Tools를 설치하겠냐고 물으면 수락하세요. Windows에서 프로그램을 빌드하려면 Rust에 필요합니다. |
| Linux | `sudo apt install -y build-essential curl` 다음 `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh`(Return을 눌러 기본값을 수락) |

확인하기:

```bash
rustc --version
cargo --version
```

`rustc 1.88.0` 이상과 `cargo` 버전 한 줄이 보여야 합니다. 이미 Rust가 있다면 `rustup update`로 최신 상태로 만들 수 있습니다.

### Java 21과 Maven(Java 튜토리얼 전용) {#java}

Tip Jar 앱에는 Java 21 이상의 JDK(Java를 빌드하고 실행하는 도구)와, Java 라이브러리를 내려받는 빌드 도구인 Maven이 필요합니다.

| 시스템 | 설치 |
| --- | --- |
| macOS | `brew install --cask temurin@21` 다음 `brew install maven`(또는 [adoptium.net](https://adoptium.net)의 설치 프로그램 사용) |
| Windows | `winget install --id EclipseAdoptium.Temurin.21.JDK -e` 다음 [maven.apache.org/download.cgi](https://maven.apache.org/download.cgi)에서 Maven을 내려받아 압축을 풀고 `bin` 폴더를 `PATH`에 추가합니다. 더 쉬운 방법: WSL을 설치하고(아래 참고) Linux 줄을 따릅니다. |
| Linux | `sudo apt install -y openjdk-21-jdk maven` |

확인하기:

```bash
java -version
mvn -version
```

`openjdk version "21`(또는 25 같은 더 높은 번호)과, `Apache Maven 3.` 뒤에 버전이 보여야 합니다. `java -version`이 17 이하로 나오면 Java 21을 설치하고 새 터미널을 여세요.

### venv가 있는 Python 3.10 이상(Python 튜토리얼 전용) {#python}

Python은 Airdrop 앱을 실행합니다. `venv`는 앱의 라이브러리를 담는 전용 폴더를 만들어 주므로, 컴퓨터의 다른 부분은 건드리지 않습니다.

| 시스템 | 설치 |
| --- | --- |
| macOS | `brew install python` 또는 [python.org](https://www.python.org/downloads/)에서 다운로드 |
| Windows | `winget install --id Python.Python.3.12 -e` 또는 [python.org](https://www.python.org/downloads/)에서 내려받고, 설치 프로그램에서 **Add python.exe to PATH**를 체크 |
| Linux | `sudo apt install -y python3 python3-venv python3-pip` |

확인하기:

```bash
python3 --version
```

`Python 3.10.0` 이상이 보여야 합니다. Windows에서는 대신 `python --version`을 입력하세요(명령이 `python3`이 아니라 `python`입니다).

### Windows와 Linux 명령: WSL {#wsl}

튜토리얼의 대부분 명령은 모든 시스템에서 같습니다. 일부는 Linux 셸 기능을 사용합니다. `source`, `chmod`, `./tipjar`, `sleep`입니다. Windows에서는 두 가지 선택지가 있습니다.

1. **Windows 그대로 사용.** TypeScript, Rust, Python 튜토리얼에는 PowerShell을 사용합니다. 예를 들어 `.venv\Scripts\activate`처럼 Windows에서 다른 부분은 튜토리얼이 Windows용 명령을 따로 알려 줍니다. Java 튜토리얼에는 **Git Bash**(Git과 함께 설치됨)를 사용하세요.
2. **WSL.** Windows Subsystem for Linux는 Windows 안에서 진짜 Linux를 쓰게 해 줍니다. PowerShell을 관리자 권한으로 열고 아래 명령을 실행한 뒤 재시작하고, Ubuntu 창에서 이 페이지의 **Linux** 줄을 따르세요.

```powershell
wsl --install
```

| 부분 | 하는 일 |
| --- | --- |
| `wsl` | Windows Subsystem for Linux 도구입니다. |
| `--install` | WSL과 Ubuntu Linux 시스템을 한 번에 설치합니다. |

## 한 번에 모두 확인하기 {#check-all}

설치한 도구의 명령을 실행하세요. 각각 버전이 출력되어야 합니다.

```bash
git --version
node -v
pnpm -v
rustc --version
java -version
mvn -version
python3 --version
```

| 확인 명령 | 정상 결과 |
| --- | --- |
| `node -v` | `v22.13.0` 이상 |
| `pnpm -v` | `9.0.0` 이상 |
| `rustc --version` | `rustc 1.88.0` 이상 |
| `java -version` | `21` 이상 |
| `mvn -version` | `Apache Maven 3.`과 버전 |
| `python3 --version` | `Python 3.10.0` 이상 |

## 테스트넷 지갑 만들기 {#wallet}

테스트 QOR을 담아 둘 곳이 필요합니다. 일부 튜토리얼은 파일 안에 일회용 계정을 대신 만들어 줍니다. 다른 튜토리얼은 테스트넷으로 전환한 **QoreX** 지갑(QoreChain의 공식 지갑)을 사용합니다. 어느 쪽인지는 [튜토리얼마다 어떤 도구가 필요한가요?](#which-tools)의 표에 나와 있습니다.

### 테스트넷의 QoreX {#qorex}

1. 공식 스토어에서 QoreX를 설치합니다. iPhone은 [App Store](https://apps.apple.com/us/app/qorex-wallet/id6791256626), Android는 [Google Play](https://play.google.com/store/apps/details?id=network.qore.qorex), Chrome, Brave, Edge, Arc, Opera는 [Chrome 웹 스토어](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg), Firefox는 [Firefox 부가 기능](https://addons.mozilla.org/firefox/addon/qorex/)입니다. 전체 목록은 [QoreX 개요](/qorex/overview)에 있습니다.
2. **새** 지갑을 만들고 복구 문구를 종이에 적어 두세요. 실제 자금이 들어 있는 문구를 가져오지 마세요.
3. 지갑을 테스트넷으로 전환합니다.
   - **휴대폰 앱:** **설정**을 열고 **Use testnet (developers)**를 켭니다.
   - **브라우저 확장 프로그램:** 잠금을 해제한 뒤 **맨 아래의 버전 번호**를 7번 누릅니다. 개발자 옵션이 나타납니다. **Switch to testnet (diana)**를 선택하세요.
4. 테스트넷 배지가 표시되는지 확인합니다. 테스트넷의 이름은 `qorechain-diana`입니다.

**화면에 보여야 하는 결과:** 지갑에 테스트넷 배지가 표시되고, 홈 화면에 `qor1...` 주소가 보입니다. 테스트넷 잔액에 달러 가치가 표시되지 않는 것은 정상입니다.

### 이더리움 계정 추가하기(coin 60) {#coin-60}

Guestbook 튜토리얼은 EVM 레인을 사용하므로, 지갑에 이더리움 방식의 계정이 필요합니다.

1. QoreX에서 계정 목록을 열고 **Add an Ethereum account (coin 60)**를 선택합니다.
2. 새 계정을 만듭니다. 실제 자금이 들어 있는 문구를 복원하지 마세요.
3. 그 계정을 선택합니다. `0x...` 주소가 표시됩니다.

**화면에 보여야 하는 결과:** *Ethereum, coin 60*이라는 이름의 계정과, `0x`로 시작하는 주소. 같은 계정에는 `qor1...` 주소도 있습니다.

계정에 대한 더 자세한 내용: [QoreX 계정과 대시보드](/qorex/account-and-dashboard), [QoreX 시작하기](/qorex/getting-started).

## 포셋에서 테스트 QOR 받기 {#faucet}

포셋은 테스트넷 주소에 무료 테스트 QOR을 보내 줍니다. 모든 트랜잭션에는 소액의 네트워크 수수료가 들기 때문에, 새 계정은 무언가를 하기 전에 먼저 QOR을 받아야 합니다.

1. 브라우저에서 [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet)을 엽니다.
2. QoreChain 대시보드에 로그인합니다.
3. 주소 입력란에 `qor1...` 주소를 붙여 넣습니다.
4. **Request Tokens**를 선택합니다.
5. **Tokens Sent!**가 나타날 때까지 기다립니다.

**화면에 보여야 하는 결과:** 100 QOR이 표시된 **Tokens Sent!** 카드와 **View on Explorer** 링크.

포셋은 계정별, 주소별로 **24시간에 한 번 100 QOR**을 보내 줍니다. 너무 일찍 다시 요청하면 **Rate Limit Reached**가 표시됩니다. 24시간이 지날 때까지 기다리세요. 이 페이지의 모든 튜토리얼에는 한 번의 요청이면 충분합니다.

### 첫 트랜잭션이 양자 내성 키를 등록합니다 {#first-tx}

모든 QoreChain 계정에는 두 개의 키가 있습니다. 기존 방식의 키와 양자 내성 ML-DSA-87 키입니다. 새 계정의 맨 처음 트랜잭션이 **ML-DSA-87 키를 온체인에 등록**합니다. 계정마다 단 한 번만 하며 비용은 약 **0.09 QOR**입니다. 그 이후의 모든 트랜잭션은 두 키로 서명됩니다.

튜토리얼에서는 `register`라는 명령으로 이 단계를 대신 실행해 줍니다. 지금 따로 할 일은 없습니다. 포셋의 100 QOR이면 이 비용을 여러 번 감당하고도 남습니다.

## QOR와 uqor {#units}

같은 코인을 가리키는 두 가지 이름이 나옵니다. **QOR**는 코인 하나 전체이고, **uqor**는 가장 작은 단위입니다.

**1 QOR = 1,000,000 uqor.**

| 표시 | 의미 |
| --- | --- |
| `1` QOR | 1,000,000 uqor |
| `0.1` QOR | 100,000 uqor |
| `0.09` QOR | 90,000 uqor |
| `0.15uqor` | 수수료를 낼 때 쓰는 가스 단위당 0.15 uqor의 가격 |

지갑과 대부분의 명령은 QOR을 사용합니다. 체인 자체는 uqor 단위로 계산합니다. **메모**는 `Hello from the workshop`처럼 트랜잭션에 붙이는 짧은 텍스트입니다. 누구나 온체인에서 읽을 수 있으므로 메모에 비밀을 적지 마세요.

**가스**는 트랜잭션이 네트워크에 요청하는 작업량의 단위입니다. 수수료는 사용한 가스에 가스 가격을 곱한 값입니다. 이 섹션의 도구가 가스를 대신 추정해 주므로 직접 계산할 필요가 없습니다.

## 일회용 키를 안전하게 보관하기 {#key-hygiene}

튜토리얼은 테스트넷 계정을 위한 비밀 값을 만들어 컴퓨터에 저장합니다. 테스트 QOR에는 가치가 없더라도, 메인넷에서도 같은 습관이 몸에 배도록 조심해서 다루세요.

1. **저장되는 위치.** TypeScript 튜토리얼에서는 비밀 값이 프로젝트 폴더의 `.env`라는 파일에 들어갑니다. Rust, Java, Python 앱은 `new` 명령으로 홈 폴더 안의 `.config/qday`라는 숨김 폴더에 키 파일을 만듭니다. 정확한 파일은 튜토리얼에 나옵니다.
2. **절대 공유하지 마세요.** 채팅, 이메일, 스크린샷, 영상에 붙여 넣지 마세요. 화면을 공유할 때는 그 파일을 가리세요.
3. **절대 커밋하지 마세요.** `.env`나 키 파일을 Git에 추가하지 말고, GitHub에 올리지도 마세요. 프로젝트가 `.env`를 이미 무시하고 있지 않다면 `.gitignore`에 추가하세요.
4. **테스트넷 전용.** 테스트넷 키, 복구 문구, 복구 코드를 메인넷에서 다시 사용하지 마세요.
5. **끝나면 삭제하세요.** 튜토리얼을 마쳤다면 키 파일이나 `.env`를 삭제하세요. 새 계정은 언제든 1분이면 다시 만들 수 있습니다.

:::danger 실제 자금
실제 자금이 들어 있는 계정의 키, 니모닉(복구 문구), 복구 코드를 `.env` 파일, 키 파일, 이 섹션의 어떤 명령에도 절대 넣지 마세요.
:::

## 네트워크와 공개 엔드포인트 {#network}

| 서비스 | 값 |
| --- | --- |
| 테스트넷 이름 | `qorechain-diana` |
| EVM 체인 ID | 9800 |
| REST(웹으로 데이터 읽기) | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` |
| 익스플로러 | [explore.qore.network](https://explore.qore.network)에서 **Testnet**으로 전환 |
| 포셋 | [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet) |

## 문제 해결 {#troubleshooting}

| 보이는 증상 | 원인 | 해결 방법 |
| --- | --- | --- |
| `pnpm: command not found` | pnpm이 설치되지 않았습니다. Node.js에는 pnpm이 포함되어 있지 않으며, Homebrew로 설치해도 마찬가지입니다. | `npm install -g pnpm`을 실행하고, 새 터미널을 열어 `pnpm -v`를 실행하세요. |
| `node: command not found`, 또는 설치 후에도 오래된 버전이 나옴 | 설치 중에 터미널이 열려 있었거나, 오래된 버전이 우선 적용되고 있습니다. | 터미널을 닫고 새로 열어 `node -v`를 실행하세요. Linux에서는 기본 apt 패키지가 아니라 NodeSource 명령을 사용하세요. |
| `ERROR: You are using Node.js ... which is not supported by Hardhat` | Node.js가 22.13보다 낮습니다. | Node.js 22.13 이상을 설치한 뒤, 프로젝트에서 `pnpm install`을 다시 실행하세요. |
| `npm install -g pnpm` 중 `EACCES` 또는 permission denied | 현재 사용자가 전역 폴더에 쓸 수 없습니다. | macOS와 Linux에서는 `sudo npm install -g pnpm`을 실행하세요. |
| Rust를 설치한 뒤 `rustc: command not found` | 터미널이 새 `PATH`를 아직 모릅니다. | 새 터미널을 여세요. 그래도 안 되면 `source "$HOME/.cargo/env"`를 실행하세요. |
| Rust 빌드 중 `linker 'cc' not found` 또는 `link.exe not found` | C 컴파일러 도구가 없습니다. | macOS: `xcode-select --install`. Linux: `sudo apt install -y build-essential`. Windows: Visual Studio C++ Build Tools를 설치하세요. |
| `java -version`이 17 이하로 나옴 | 더 오래된 Java가 우선 적용되고 있습니다. | Java 21을 설치하고, 새 터미널을 열어 다시 확인하세요. |
| Python venv를 활성화할 때 PowerShell이 스크립트 실행이 비활성화되어 있다고 함 | Windows는 기본적으로 스크립트를 차단합니다. | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`를 실행하고 `Y`로 답한 뒤 다시 활성화하세요. |
| 포셋에서 `Rate Limit Reached` | 포셋은 계정별, 주소별로 24시간에 한 번 지급합니다. | 24시간이 지날 때까지 기다리세요. 모든 튜토리얼에는 한 번의 요청이면 충분합니다. |
| 지갑에 테스트넷 배지가 없음 | 지갑이 아직 메인넷에 있습니다. | 휴대폰 앱: 설정에서 **Use testnet (developers)**. 확장 프로그램: 버전 번호를 7번 누른 뒤 **Switch to testnet (diana)**. |
| `account has no PQC key and classical fallback is disabled` | 새 계정이 ML-DSA-87 키를 아직 등록하지 않았습니다. | 튜토리얼의 `register` 단계(계정의 첫 트랜잭션)를 먼저 실행하세요. |
| 브라우저 콘솔의 CORS 오류 | 공개 REST 엔드포인트는 CORS 헤더를 보내지 않으므로, 웹 페이지가 직접 호출할 수 없습니다. | 템플릿이 하는 것처럼, 프로젝트의 `/lcd` 프록시를 통해 엔드포인트를 호출하세요. |

## 다음 단계 {#next}

[개요](/build-before-qday/overview#choose)에서 튜토리얼을 하나 고르고 첫 명령부터 따라 하세요.
