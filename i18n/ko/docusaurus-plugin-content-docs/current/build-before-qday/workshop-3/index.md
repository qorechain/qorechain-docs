---
slug: /build-before-qday/workshop-3
title: "워크숍 3: 암호화 앱과 크로스 VM"
sidebar_label: "워크숍 3"
sidebar_position: 4
date: 2026-11-20
---

# 워크숍 3: 암호화 앱과 크로스 VM

워크숍 2에서는 포스트 양자 키로 자금을 보호했습니다. 워크숍 3에서는 같은 체인으로 두 가지 새로운 일을 합니다. 첫째, **QoreChain 주소로 메시지를 암호화**해서 그 주소의 주인만 포스트 양자 암호화로 읽을 수 있게 합니다. 둘째, **EVM**의 트랜잭션 하나가 **QoreChain Native**의 컨트랙트에 기록하고, 양쪽이 함께 바뀌거나 아무것도 바뀌지 않게 합니다.

암호학자가 아니어도 괜찮습니다. 아래의 모든 명령은 무엇을 하는지, 화면에 무엇이 보여야 하는지를 설명합니다. 두 개의 예제 앱은 공개되어 있습니다. [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday)의 `workshop-3` 폴더입니다. 둘 다 QoreChain 테스트넷 `qorechain-diana`에서만 실행됩니다. 테스트 QOR에는 가치가 없습니다.

**소요 시간:** QoreSeal에 약 30분, 크로스 VM 결제에 40분입니다. 두 파트는 서로 독립적이며, 각각 자신의 테스트 계정이 필요합니다.

## 만들 것 {#what-we-built}

| 파트 | 앱 | 보여 주는 것 |
| --- | --- | --- |
| 1 | **QoreSeal** (Node.js) | ML-KEM-1024로 `qor1...` 주소에 메시지를 암호화하고, 열어 보고, 외부인은 열 수 없다는 것과 변조가 발각된다는 것을 확인하고, 옛 메일을 잃지 않고 키를 교체합니다. |
| 2 | **CrossVmCheckout** (Solidity와 Rust) | EVM 컨트랙트의 호출 한 번이 같은 트랜잭션 안에서 Native 컨트랙트에 영수증을 기록합니다. 어느 한쪽이 실패하면 양쪽이 모두 취소됩니다. |

이 앱들의 바탕이 되는 혁신 요소:

- **주소로 하는 암호화.** 모든 계정은 포스트 양자 암호화 키를 공개 전화번호부처럼 체인에 게시할 수 있습니다. 누군가에게 쓰려면 그 사람의 주소만 있으면 됩니다.
- **키를 계정에 묶는 카드.** 계정이 두 개의 서명 키로 작은 수신자 카드에 서명하므로, 아무도 가짜 암호화 키를 끼워 넣을 수 없습니다.
- **하이브리드 암호화.** ML-KEM-1024(NIST FIPS 203)를 기존 방식의 X25519 키와 결합합니다. 둘 중 하나만 버텨 주면 메시지는 비공개로 유지됩니다.
- **크로스 VM 원자성.** EVM과 QoreChain Native는 하나의 상태와 하나의 블록을 공유합니다. 둘 사이의 호출은 같은 트랜잭션의 일부이므로, 정리해야 할 반쯤 끝난 상태가 없습니다.
- **거버넌스가 승인한 범위.** 브리지는 거버넌스가 승인한 Native 컨트랙트만 호출하며, 각 승인은 컨트랙트의 코드에 고정됩니다.

## 이 가이드에서 쓰는 용어 {#words}

| 용어 | 쉬운 뜻 |
| --- | --- |
| ML-KEM-1024 | 포스트 양자 키 교환 방식(NIST FIPS 203). 여기서는 메시지마다 비밀 키를 합의하는 데 사용합니다 |
| X25519 | 기존 방식의 키 교환. 둘 중 하나가 뚫려도 봉투가 안전하도록 ML-KEM과 결합합니다 |
| ML-DSA-87 | 포스트 양자 서명(NIST FIPS 204). 모든 네이티브 트랜잭션은 이 서명과 기존 방식의 secp256k1 키로 서명됩니다 |
| 수신자 카드 | 계정의 암호화 키를 그 계정에 묶어 주는, 서명된 작은 메모 |
| 봉투 | 봉인된 메시지. 원하는 방법으로 보낼 수 있는 텍스트 파일로 저장됩니다 |
| Native | QoreChain Native. Rust로 컨트랙트를 작성하는 CosmWasm 레인 |
| 브리지 precompile | `0x0000000000000000000000000000000000000901`에 있는 내장 컨트랙트로, EVM 컨트랙트가 Native 컨트랙트를 호출할 수 있게 해 줍니다 |
| 허용 목록 | 브리지가 호출할 수 있도록 거버넌스가 승인한 Native 컨트랙트 목록 |
| EVM 윈도우 | 계정에서 이더리움 방식 트랜잭션을 보낼 수 있게 해 주는 짧고 제한된 권한. 열려면 두 개의 키로 서명한 트랜잭션이 필요합니다 |

:::caution 일회용 테스트넷 계정만 사용하세요
이 워크숍을 위해 만든 키, 그리고 가치 없는 테스트 QOR만 들어 있는 계정을 사용하세요. 실제 돈이 들어 있는 계정의 비밀 단어나 키를 파일이나 명령에 절대 넣지 마세요.
:::

## 시작하기 전에 {#prerequisites}

[시작하기 전에](/build-before-qday/prerequisites)의 도구(터미널, Node.js, Git)와 포셋을 위한 브라우저가 필요합니다. 파트 1에는 Node.js 20 이상이 필요합니다. 파트 2에는 **pnpm**과 **Foundry**도 필요하고, 선택적으로 Rust도 필요합니다. Node.js를 확인합니다.

```bash
node -v
```

`v20` 이상이 출력되어야 합니다. 파트 2를 위해 나머지를 설치합니다.

```bash
npm install -g pnpm
```

파트 2가 사용하는 패키지 도구인 pnpm을 설치합니다. `pnpm -v`로 확인하세요. Foundry는 Solidity를 컴파일, 테스트, 배포합니다. [getfoundry.sh](https://getfoundry.sh)에서 설치한 다음 `foundryup`을 실행하세요. `forge --version`과 `cast --version`으로 확인합니다.

예제 코드를 받습니다.

```bash
git clone https://github.com/qorechain/build-before-qday.git
cd build-before-qday/workshop-3
```

첫 번째 줄은 예제를 `build-before-qday`라는 폴더로 내려받습니다. 두 번째 줄은 두 앱이 들어 있는 `workshop-3` 폴더로 이동합니다.

테스트 QOR은 대시보드의 [포셋](/dashboard/faucet)에서 받습니다.

## 파트 1: QoreSeal, 주소로 암호화하기 {#part-1}

코드: [workshop-3/01-qoreseal](https://github.com/qorechain/build-before-qday/tree/main/workshop-3/01-qoreseal). 패키지: `@qorechain/qoreseal`과 `@qorechain/qoresign`.

누군가에게 비공개 메시지를 보내려는데 아는 것이라고는 그 사람의 주소뿐입니다. 이 앱은 그 방법을 보여 줍니다.

1. Alice가 자신의 키를 체인에 등록합니다.
2. 누구든 Alice의 주소로 그녀의 암호화 키를 조회합니다.
3. 메시지를 Alice에게 봉인합니다. Alice는 열 수 있습니다. **Eve는 열 수 없습니다.**
4. 봉투의 비트 하나만 바꿔도 **더 이상 열리지 않습니다**.
5. 한 메시지를 Alice **와** Bob에게 봉인합니다. 각자 자신의 키로 엽니다.
6. Alice가 키를 **교체**합니다. 옛 카드는 거부되고, 새 메시지는 새 키를 쓰며, 옛 메시지는 여전히 열립니다.

암호화는 내 컴퓨터에서 이루어집니다. 체인은 메시지를 보지 못하고 공개 키만 봅니다.

```bash
cd 01-qoreseal
```

QoreSeal 폴더로 이동합니다.

### 1단계: 설치 {#seal-install}

```bash
npm install
```

`package-lock.json`에 적힌 정확한 버전의 패키지를 내려받습니다. QoreSeal, QoreSign(하이브리드 서명기), 그리고 트랜잭션을 만드는 cosmjs 도우미 몇 개입니다.

```bash
node seal.mjs help
```

모든 명령을 나열합니다.

### 2단계: 테스트넷 계정 세 개 만들기 {#seal-accounts}

```bash
node seal.mjs init alice
node seal.mjs init bob
node seal.mjs init eve
```

각 명령은 새 계정을 만들고 그 비밀 단어를 `~/.config/qday-w3/<name>.json`에 저장하며, 파일은 나만 읽을 수 있습니다. 비밀은 출력되지 않습니다. 파일을 다른 곳에 두려면 `QDAY_DIR`을 설정하세요. 각 명령은 계정의 `qor1...` 주소를 출력합니다.

### 3단계: Alice에게 자금 넣기 {#seal-fund-alice}

Alice의 `qor1...` 주소를 [포셋](/dashboard/faucet)에 붙여 넣은 다음 확인합니다.

```bash
node seal.mjs whoami
```

각 계정의 주소, 잔액, 키가 아직 체인에 있는지 여부를 보여 줍니다. 지금은 답이 `no`입니다.

### 4단계: Alice가 키를 등록하기 {#seal-register}

```bash
node seal.mjs register alice
```

트랜잭션이 두 개 있습니다.

1. **ML-DSA-87 서명 키**와, Alice가 그 키의 주인이라는 증명. 체인이 아직 그녀의 포스트 양자 키를 모르기 때문에, 기존 키만으로 서명해도 체인이 받아들이는 유일한 트랜잭션입니다.
2. **ML-KEM-1024 암호화 키**(1,568바이트). 두 키로 서명합니다. 이제부터 누구든 체인에서 이 키를 읽을 수 있습니다.

그다음 Alice의 **수신자 카드**에 서명하고 `cards/alice.json`으로 저장합니다. 실제 앱에서는 이 카드를 주소 옆에, 예를 들어 프로필 페이지, 컨트랙트, 또는 API 뒤에 게시합니다.

### 5단계: Bob과 Eve에게 QOR 나눠 주고 Bob 등록하기 {#seal-bob}

```bash
node seal.mjs fund alice bob 3
node seal.mjs fund alice eve 3
```

Alice가 Bob과 Eve에게 테스트 QOR 3개씩 보냅니다. 등록 이후의 모든 트랜잭션과 마찬가지로 **두** 키로 서명되고, 체인이 둘 다 확인합니다. 그래서 Alice가 먼저 등록합니다. 체인에 ML-DSA-87 키가 없는 계정은 키 등록만 할 수 있고, 그 밖의 트랜잭션은 거부됩니다.

```bash
node seal.mjs register bob
```

9단계에서 한 메시지를 두 사람에게 보내기 위해 Bob이 필요합니다. Eve는 등록하지 않은 채로 둡니다. Eve는 Alice의 메일을 읽으려 시도할 외부인입니다.

### 6단계: 보내는 사람처럼 Alice 조회하기 {#seal-lookup}

```bash
node seal.mjs lookup alice
```

공개 REST API에서 `GET /qorechain/pqc/v1/kem/<address>`를 읽습니다. 알고리즘(`ML-KEM-1024`), 1,568바이트의 공개 키, 그리고 등록된 블록이 나옵니다. 그다음 그 키와 체인에 있는 Alice의 ML-DSA-87 키에 대해 카드를 확인합니다. `card valid`가 보여야 합니다. 어떤 주소에 대해서도 할 수 있습니다: `node seal.mjs lookup qor1...`.

### 7단계: Alice에게 메시지를 봉인하고 열어 보기 {#seal-send}

```bash
node seal.mjs send alice "Payroll for March: 12,400 QOR to the team"
```

체인에서 Alice의 키를 읽고, 그녀의 카드를 확인하고, 메시지를 봉인합니다. 41자 메시지가 약 1,760바이트가 되며, 대부분은 포스트 양자 키 자료입니다. 봉투는 `inbox/`에 저장됩니다.

```bash
node seal.mjs open alice
```

`OPENED by alice with encryption key #0`과 메시지가 나옵니다.

```bash
node seal.mjs open eve
```

`CANNOT OPEN: eve holds none of the keys this envelope was sealed to`가 나옵니다. Eve는 파일을 가지고 있지만 Alice의 키는 없습니다.

### 8단계: 변조해 보기 {#seal-tamper}

```bash
node seal.mjs tamper alice
```

봉투의 비트 하나를 뒤집고 열어 보려 합니다. `DECRYPTION_FAILED`와 함께 `REFUSED`가 보여야 합니다. 봉투는 인증되어 있어서 어떤 변경도 발각되며, 봉인된 메시지를 아무도 고쳐 쓸 수 없습니다.

### 9단계: 메시지 하나, 수신자 둘 {#seal-multi}

```bash
node seal.mjs send alice,bob "Board memo: Q4 budget"
node seal.mjs open bob
node seal.mjs open alice
```

두 주소에 봉인된 봉투 하나입니다. 각자 자신의 키로 엽니다. Eve는 여전히 열 수 없습니다.

### 10단계: Alice의 키 교체하기 {#seal-rotate}

```bash
node seal.mjs rotate alice
```

같은 비밀 단어에서 Alice의 **다음** 암호화 키(번호 1)를 파생하고 체인에 등록하며, 이 키가 옛 키를 **대체**합니다. 그다음 **옛** 카드를 체인에 대해 확인하면 `refused: the card names a different ML-KEM-1024 key than the registered one`이 보여야 합니다. 카드를 확인하는 발신자는 더 이상 옛 키로 봉인할 수 없습니다. 새 카드에 서명합니다.

```bash
node seal.mjs open alice inbox/$(ls inbox | head -1)
```

교체 전에 봉인된 **첫 번째** 봉투를 엽니다: `OPENED by alice with encryption key #0 (an older key)`. 옛 키는 저장된 적이 없습니다. 비밀 단어에서 다시 파생되므로, 키를 교체해도 옛 메일을 열지 못하게 되는 일은 없습니다.

```bash
node seal.mjs inspect
```

비밀 없이 봉투 안에 무엇이 있는지 보여 줍니다: 버전, 용도, 수신자, 크기.

### 코드가 동작하는 방식 {#seal-code}

모든 것은 `seal.mjs`에 있습니다. 중요한 QoreSeal 호출은 다음과 같습니다.

| 호출 | 하는 일 |
| --- | --- |
| `deriveSealKeys({ mnemonic, index })` | 비밀 단어에서 파생한, 번호 `index`번 키의 암호화 키 |
| `buildRegisterKemKeyMessage({ sender, mlkemPublicKey })` | 키를 체인에 올리는 `MsgRegisterKEMKey` 메시지 |
| `signRecipientCard({ chainId, address, keys, classicalKey, pqKey })` | 계정의 두 서명 키로 서명한 카드 |
| `verifyRecipientCard({ card, chainId, address, mlkemPublicKey, pqPublicKey })` | 카드가 체인의 키와 일치하지 않으면 예외를 던집니다 |
| `sealToAddresses({ rest, chainId, purpose, recipients, plaintext })` | 체인에서 각 키를 읽고, 각 카드를 확인하고, 봉인합니다 |
| `open({ chainId, purpose, envelope, keys })` | 봉투를 열거나, 예외를 던집니다 |
| `envelopeToText`와 `envelopeFromText` | 봉투를 텍스트 파일로, 그리고 그 반대로 |

`purpose`(여기서는 `qday-note`)는 봉인되는 내용의 일부입니다. 한 앱을 위해 만든 봉투는 다른 앱에서 온 것처럼 열 수 없습니다.

### 문제가 생겼을 때 (QoreSeal) {#seal-trouble}

| 보이는 메시지 | 할 일 |
| --- | --- |
| `does not exist on chain yet: fund ... first` | 계정에 QOR가 없습니다. 포셋이나 `fund`를 사용하세요 |
| `no ML-KEM key registered for this address` | 먼저 그 계정에 `register`를 실행하세요 |
| `hybrid mode needs the recipient card` | `cards/<name>.json` 파일이 없습니다. `register <name>`을 실행하면 카드를 다시 씁니다 |
| `no envelope yet` | 먼저 `send`를 실행하세요 |
| `account has no PQC key and classical fallback is disabled` | 그 계정이 아직 등록하지 않았습니다. 그 계정에서 `fund`하기 전에 `register <name>`을 실행하세요 |
| 트랜잭션에서 `refused: ...` | 메시지를 읽어 보세요. 대개 QOR가 부족하거나 공개 테스트넷 API가 요청을 제한하고 있는 경우입니다. 몇 초 기다리세요 |

`~/.config/qday-w3/`의 파일에는 비밀 단어가 들어 있습니다. 절대 커밋하거나 공유하지 말고, 메인넷에서 다시 사용하지도 마세요. `cards/`와 `inbox/` 폴더는 로컬에만 있으며 `.gitignore`에 들어 있습니다.

## 파트 2: CrossVmCheckout, 두 VM에 걸친 하나의 트랜잭션 {#part-2}

코드: [workshop-3/02-cross-vm](https://github.com/qorechain/build-before-qday/tree/main/workshop-3/02-cross-vm). 언어: EVM 쪽은 Solidity와 TypeScript, Native 쪽은 Rust.

QoreChain은 같은 체인에서 가상 머신을 둘 이상 실행합니다. **EVM**(Solidity, MetaMask 방식)과 **QoreChain Native**(Rust로 작성하는 CosmWasm 컨트랙트)입니다. 둘은 하나의 상태와 하나의 블록을 공유합니다. 이 앱은 작은 가게입니다.

- **`CrossVmCheckout`**(Solidity, EVM)은 주문을 셉니다.
- **`qday-receipts`**(Rust, Native)는 영수증 장부를 보관합니다.
- `checkout("coffee for the team")` 호출 한 번이 **같은 트랜잭션 안에서** 둘 다 합니다. EVM 쪽에서는 주문 수가 올라가고, Native 쪽에서는 영수증이 기록됩니다.

핵심은 **원자성**입니다. 양쪽이 함께 바뀌거나, 둘 다 바뀌지 않습니다.

| 명령 | 일어나는 일 | 결과 |
| --- | --- | --- |
| `checkout` | EVM에서 주문 +1, Native에서 영수증 +1 | 둘 다 바뀜 |
| `undo` | Native 영수증이 기록된 **다음** EVM 쪽이 되돌려짐 | 둘 다 안 바뀜: 영수증도 취소됨 |
| `native-fails` | 주문이 집계된 **다음** Native 컨트랙트가 거부함 | 둘 다 안 바뀜: 주문도 취소됨 |
| `outside` | 거버넌스가 승인하지 않은 Native 컨트랙트를 호출하도록 브리지에 요청 | 체인이 거부함 |

메인넷에서는 지금 크로스 VM 호출이 일시 중지되어 있으므로, 이 파트는 테스트넷에서만 실행됩니다.

### 브리지와 허용 목록 {#bridge}

EVM은 `0x0000000000000000000000000000000000000901`의 브리지 precompile을 통해 Native에 닿습니다. 다음을 호출합니다.

```solidity
executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)
```

| 인자 | 의미 |
| --- | --- |
| `targetVM` | Native는 `1` |
| `targetContract` | Native 컨트랙트의 `qor1...` 주소 |
| `payload` | Native 컨트랙트의 JSON 메시지 |

브리지는 **거버넌스**가 승인한 Native 컨트랙트에만 닿습니다. 목록은 crossvm 파라미터(`GET https://api-testnet.qore.host/qorechain/crossvm/v1/params`)에 공개되어 있고, 각 항목은 컨트랙트의 코드에 고정되어 있어서 승인된 컨트랙트를 나중에 다른 코드로 바꿔치기할 수 없습니다.

호출할 Native 컨트랙트 `qday-receipts`는 테스트넷 허용 목록에 있습니다(거버넌스 제안 40, 코드 ID 865).

```text
qor1xjayq5ev55tkzpml9klxwyshr7gdrha0nurha9jhm0f0gdckksgs3gltw8
```

관리자가 없으므로 아무도 바꿀 수 없습니다. **어떤 빌더든 크로스 VM 트랙을 위해 자신의 컨트랙트에서 이것을 호출할 수 있습니다.** Native 쪽에서 호출의 발신자는 내 지갑이 아니라 내 EVM 컨트랙트 자신의 `qor1...` 계정이므로, 모든 영수증에 어떤 컨트랙트가 기록했는지 표시됩니다.

### EVM 컨트랙트가 동작하는 방식 {#xvm-how}

`evm/src/CrossVmCheckout.sol`을 엽니다.

```solidity
function checkout(string calldata note, bool failAfter) external returns (bytes memory reply) {
    _checkNote(bytes(note));
    orders += 1;
    reply = _callNative(bytes(string.concat('{"record":{"note":"', note, '"}}')));
    if (failAfter) revert EvmSideFailed();
    emit Ordered(orders, msg.sender, note, reply);
}

function _callNative(bytes memory payload) private returns (bytes memory) {
    (bool ok, bytes memory ret) =
        BRIDGE.call(abi.encodeWithSignature("executeCrossVMCall(uint8,string,bytes)", NATIVE, receipts, payload));
    if (!ok) revert BridgeCallFailed(ret);
    if (ret.length == 0) revert BridgeNotActive();
    if (ret.length >= 64 && uint256(bytes32(ret)) == 32) return abi.decode(ret, (bytes));
    return ret;
}
```

1. **메모 확인.** 메모는 JSON 문자열 안에 들어가므로 `"`와 `\`가 없는 1자에서 140자의 출력 가능한 문자여야 합니다. 그렇지 않으면 조작된 메모가 Native 컨트랙트가 받는 메시지를 바꿀 수 있습니다.
2. **주문 집계.** 일반적인 EVM 상태 변경입니다.
3. **브리지 호출.** Native 컨트랙트가 바로 그 자리, 이 트랜잭션 안에서 실행됩니다.
4. **브리지 호출이 실패하면 되돌립니다.** Native의 실패는 EVM의 revert가 되고, 트랜잭션 전체가 취소됩니다.
5. **응답이 없으면 브리지가 없는 것입니다.** precompile이 활성화되지 않은 체인에서는 그 주소로의 호출이 빈 데이터로 "성공"합니다. 이를 성공이 아니라 오류로 취급하세요.
6. **응답 디코딩.** 브리지는 Native의 응답을 ABI 인코딩된 `bytes`로 돌려줍니다. 코드는 원시 바이트도 받아들입니다.
7. **`failAfter`**는 Native 호출이 성공한 뒤에 되돌립니다. Native 쪽에 기록된 영수증도 함께 취소된다는 것을 보여 줍니다.

일반 `call`을 사용하고, `staticcall`이나 view 함수는 사용하지 마세요. Native 쪽이 상태를 기록할 수 있으므로 브리지는 정적 호출을 거부합니다.

아래의 모든 명령은 별도 안내가 없으면 `evm` 폴더에서 실행합니다.

```bash
cd ../02-cross-vm/evm
```

아직 `01-qoreseal`에 있다면, 크로스 VM 앱의 EVM 폴더로 이동합니다.

### 1단계: 테스트 실행 (계정 불필요) {#xvm-tests}

```bash
pnpm install
pnpm forge-std
forge test
```

`pnpm install`은 JavaScript 패키지를 내려받습니다. `pnpm forge-std`는 Foundry의 표준 라이브러리를 `lib/`에 한 번 내려받습니다. `forge test`는 `test/CrossVmCheckout.t.sol`의 테스트 5개를 실행합니다. `5 passed; 0 failed`가 보여야 합니다.

Foundry의 로컬 EVM에는 QoreChain 브리지가 없으므로, 테스트는 `vm.etch`로 `0x...0901`에 작은 가짜 브리지를 둡니다. 전송되는 JSON 메시지가 정확한지, `failAfter`가 모든 것을 되돌리는지, Native의 실패가 EVM 쪽을 되돌리는지, 메모로 JSON을 주입할 수 없는지, 비활성 브리지가 오류인지를 확인합니다. 진짜 브리지는 다음 단계에서 실행합니다.

### 2단계: 포스트 양자 키가 있는 계정 {#xvm-account}

워크숍 2를 했다면 그곳의 `.env`를 복사하고(같은 계정, 키는 이미 등록됨) `.env.example`의 `RECEIPTS_CONTRACT` 줄을 추가하세요. 그렇지 않다면 다음을 실행합니다.

```bash
cast wallet new
cp .env.example .env
```

`cast wallet new`는 일회용 계정을 만듭니다. 그 개인 키를 `.env`에 `PRIVATE_KEY`로 넣으세요. **테스트넷 전용입니다.**

```bash
pnpm window recovery-code
```

`QRC1-...` 코드를 출력합니다. 이를 `.env`에 `QORE_PQC_RECOVERY_CODE`로 넣고, 개인 키와는 따로 사본을 보관하세요. ML-DSA-87 키는 이 코드에서 파생됩니다.

```bash
pnpm window status
```

`qor1...` 주소를 보여 줍니다. 이를 [포셋](/dashboard/faucet)에 붙여 넣은 다음 실행합니다.

```bash
pnpm window register
```

ML-DSA-87 키를 계정당 한 번 체인에 올립니다. 이제 `pnpm window status`에 `PQC key: registered`가 표시됩니다.

### 3단계: 범위가 지정된 EVM 윈도우 열기 {#xvm-window}

```bash
pnpm window:scoped
```

**1,200블록(약 28분), 트랜잭션 6개, 3 QOR**의 가치와 수수료에 대한 윈도우를 엽니다. 배포와 세 번의 데모 트랜잭션에는 충분하고, 그 이상은 안 됩니다. 지갑은 **내 컨트랙트**를 호출하고, 컨트랙트는 자신의 신원으로 브리지를 호출하므로, 윈도우는 내 컨트랙트로의 호출만 허용하면 됩니다.

윈도우 트랜잭션이 블록에 들어가도록, 다음 단계 전에 **약 10초 기다리세요**.

### 4단계: 가게 배포하기 {#xvm-deploy}

```bash
pnpm deploy:testnet
```

`RECEIPTS_CONTRACT`를 가리키는 `CrossVmCheckout`을 배포합니다. `CrossVmCheckout 0x...`를 찾아보세요. Foundry의 출력에서 "ETH"는 QOR를 뜻합니다.

```bash
pnpm xvm status
```

양쪽을 보여 줍니다. 내 EVM 컨트랙트의 `orders`와 `qday-receipts`의 영수증 수, 그리고 최신 영수증 세 개입니다. 다른 빌더들도 같은 영수증 장부에 기록하므로 그 수는 아마 0이 아닐 것입니다. 중요한 것은 그 수가 어떻게 **변하는가**입니다.

### 5단계: 체인이 승인하지 않은 컨트랙트 {#xvm-outside}

```bash
pnpm xvm outside
```

허용 목록에 **없는** 실제 Native 컨트랙트에 대한 직접 브리지 호출을 시뮬레이션합니다. `REFUSED by the bridge: ... is not allowlisted`가 보여야 합니다. 무료이며 윈도우 트랜잭션을 쓰지 않습니다.

### 6단계: 트랜잭션 하나, VM 둘 {#xvm-checkout}

```bash
pnpm xvm checkout "coffee for the team"
```

`before`, 트랜잭션(`SUCCESS`), 그리고 `after`가 보입니다. 주문 +1 **그리고** 영수증 +1, 내 컨트랙트의 `qor1...` 주소에서(`from`) 보내진 내 메모가 담긴 새 영수증이 나옵니다. 그다음 `both sides changed, in the same transaction`이 나옵니다.

### 7단계: Native 호출 뒤에 EVM 쪽이 실패 {#xvm-undo}

```bash
pnpm xvm undo "this receipt must disappear"
```

Native 영수증이 기록된 다음 EVM 쪽이 되돌려집니다. 트랜잭션은 `REVERTED`로 채굴되고, `before`와 `after`는 동일합니다: `nothing changed on either side`. Native 쪽에 기록되었던 영수증도 사라집니다.

### 8단계: Native 쪽이 거부 {#xvm-native-fails}

```bash
pnpm xvm native-fails
```

EVM 쪽에서 주문이 집계된 다음 `qday-receipts`가 `{"fail":{}}`로 거부합니다. 트랜잭션은 `REVERTED`이고 숫자는 동일합니다. EVM 주문도 취소된 것입니다.

각 트랜잭션에는 익스플로러 링크가 있습니다. 네트워크 선택기를 **Testnet**으로 두고 [대시보드 익스플로러](/dashboard/explorer)에서 여세요.

### 문제가 생겼을 때 (크로스 VM) {#xvm-trouble}

| 보이는 메시지 | 의미 | 할 일 |
| --- | --- | --- |
| 배포나 트랜잭션에서 `Missing or invalid parameters` | 유효한 EVM 윈도우가 없음 | `pnpm window status`, 그다음 `pnpm window:scoped`, 10초 기다린 뒤 다시 시도 |
| `No shop yet` | 이 폴더에서 배포된 것이 없음 | 4단계를 하거나 `.env`에 `SHOP_ADDRESS`를 설정 |
| `not allowlisted`가 포함된 `BridgeCallFailed` | 대상이 거버넌스의 승인을 받지 않음 | 위의 주소인 `qday-receipts`를 사용 |
| `BridgeNotActive` | 그 네트워크에서 브리지 precompile이 활성화되어 있지 않음 | 테스트넷을 사용 |
| `BadNote` | 메모가 비어 있거나 너무 길거나 `"` 또는 `\`가 있음 | 140자까지의 일반 텍스트를 사용 |

### Native 쪽 {#native-side}

`native/` 폴더에는 `qday-receipts`(CosmWasm 2, Rust)의 전체 소스가 있습니다.

| 메시지 | 하는 일 |
| --- | --- |
| `{"record":{"note":"..."}}` | 영수증을 추가합니다: ID, 발신자, 메모, 블록 높이 |
| `{"fail":{}}` | 원자성을 보여 주기 위해 항상 거부합니다 |
| `{"count":{}}` (쿼리) | 영수증이 몇 개인지 |
| `{"receipt":{"id":1}}` (쿼리) | 영수증 하나 |
| `{"latest":{"limit":3}}` (쿼리) | 최신 영수증을 최신순으로, 최대 20개 |

테스트를 실행합니다(Rust 필요).

```bash
cd ../native
cargo test
```

테스트 3개가 통과해야 합니다. 테스트넷에서 Native 컨트랙트를 업로드하려면 거버넌스를 거쳐야 하므로 이것을 직접 배포할 필요는 없습니다. 이미 라이브 상태입니다.

체인에 있는 코드가 이 소스인지 확인하려면 CosmWasm optimizer로 빌드해서 체크섬을 비교하세요. 체인에 있는 코드는 Apple Silicon Mac에서 arm64 이미지로 빌드했으므로 같은 것을 사용하세요. x86 이미지는 다른 체크섬을 만듭니다.

```bash
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/optimizer-arm64:0.16.1
cat artifacts/checksums.txt
```

체크섬은 `6ebfc32fb9a9c8a412fdb071fb2c317b780ba05f637b8a4d274001c95fb5c43c`여야 하며, 체인이 코드 865에 대해 보여 주는 `data_hash`와 같습니다.

```bash
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/code/865" | head -c 400
```

계정 없이 어디서든 영수증 장부를 읽을 수 있습니다.

```bash
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/contract/qor1xjayq5ev55tkzpml9klxwyshr7gdrha0nurha9jhm0f0gdckksgs3gltw8/smart/$(printf '{"latest":{"limit":3}}' | base64)"
```

### 파일 {#files}

```text
evm/src/CrossVmCheckout.sol         the shop: counts orders, writes receipts through the bridge
evm/test/CrossVmCheckout.t.sol      Foundry tests, with a fake bridge
evm/script/CrossVmCheckout.s.sol    deploy script (reads RECEIPTS_CONTRACT and PRIVATE_KEY)
evm/scripts/window.ts               pnpm window: status, register, open, recovery-code
evm/scripts/xvm.ts                  pnpm xvm: status, checkout, undo, native-fails, outside
evm/.env.example                    the settings to copy into .env
native/src/lib.rs                   qday-receipts, the Native contract
```

## 더 알아보기 {#learn-more}

- 페스트, 암호화 앱과 크로스 VM 트랙, 바운티: [build.qorechain.io](https://build.qorechain.io).
- npm의 QoreSeal: [@qorechain/qoreseal](https://www.npmjs.com/package/@qorechain/qoreseal).
- [EVM precompile](/developer-guide/evm-precompiles)과 [크로스 VM 레퍼런스](/developer-guide/cross-vm-reference).
- EVM 윈도우와 금고는 [워크숍 2](/build-before-qday/workshop-2).
