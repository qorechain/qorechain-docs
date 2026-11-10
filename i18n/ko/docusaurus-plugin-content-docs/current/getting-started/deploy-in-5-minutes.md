---
slug: /getting-started/deploy-in-5-minutes
title: 5분 만에 QoreChain에 배포하기
sidebar_label: 5분 만에 배포하기
sidebar_position: 6
---

# 5분 만에 QoreChain에 배포하기

이 페이지는 QoreChain을 한 번도 사용해 본 적 없는 Solidity 개발자를 위한 것입니다. Foundry 또는 Hardhat과 MetaMask에서 사용하는 것과 같은 복구 문구를 그대로 사용합니다. 새로 생기는 것은 짧은 **승인 윈도우** 하나뿐입니다. QoreChain은 모든 계정을 포스트 퀀텀 키로 보호하는데, 이더리움 트랜잭션에는 이 키를 실을 수 없으므로 먼저 한도가 있는 윈도우를 열고, 윈도우가 열려 있는 동안 일반 EVM 트랜잭션이 받아들여집니다. 아래 단계는 실제 비용이 들지 않는 **테스트넷**(`qorechain-diana`, EVM 체인 ID 9800)을 기준으로 합니다.

:::note
이 경로는 테스트넷에서 실행해 확인했습니다. QoreX에서 윈도우를 연 다음, 같은 복구 문구로 Foundry `cast`를 사용해 컨트랙트를 생성하고 호출했습니다. `forge create`와 Hardhat도 같은 종류의 EVM 트랜잭션을 보내지만, 해당 실행에는 포함되지 않았습니다. `qorechaind` 명령줄에서 연 윈도우도 확인되었습니다. [대안: 명령줄](#cli)을 참고하세요.
:::

## 필요한 것 {#what-you-need}

- 배포에 사용할 계정의 복구 문구. QoreX는 원시 개인 키를 가져올 수 없습니다. 개인 키만 있다면 대신 [명령줄](#cli)을 사용하세요.
- QoreChain 지갑인 [QoreX](/qorex/overview)(앱 또는 브라우저 확장 프로그램).
- 이미 설치된 Foundry 또는 Hardhat.

## 1. QoreX에 coin 60 계정 추가하기 {#step-import}

EVM 레인은 `eth_secp256k1` 키(코인 타입 60)로만 동작합니다. 표준 secp256k1 Cosmos 키(코인 타입 118, QoreX 기본값)는 해당 EVM 주소에 대해 서명할 수 없으므로, coin 118 계정에서 연 윈도우는 EVM 도구에는 쓸모가 없습니다. **Ethereum 계정(coin 60)**이 필요합니다. QoreX에서 **내 계정**을 열고 **Ethereum 계정 추가(coin 60)**를 누르세요. QoreX는 지갑의 **자체 복구 문구**에서 Ethereum 경로 `m/44'/60'`으로 이 계정을 도출합니다. 이 계정의 `0x…` 주소는 MetaMask나 Foundry가 바로 그 같은 문구를 사용할 때에만 그곳의 주소와 같습니다(Foundry의 경우 도출 경로 `m/44'/60'/0'/0/0`, 인덱스 0). MetaMask 계정이 다른 문구에서 만들어졌다면 QoreX는 다른 주소를 표시하며, 그 주소에서 연 윈도우는 배포에 사용하는 키를 포괄하지 않습니다. `0x…` 주소는 QoreChain의 `qor1…` 주소와 같은 키입니다.

이 계정은 별도의 주소를 가지므로, 다음 단계 전에 자금을 넣고 QoreX에서 선택해 두세요. [MetaMask 또는 대시보드에서 문구 복원하기](/qorex/getting-started#restore-dashboard)를 참고하세요.

:::caution 운영용 문구를 개발 도구에 붙여넣지 마세요
테스트용으로 만든 복구 문구와 테스트 QOR만 사용하세요. 실제 자금이 들어 있는 계정의 문구를 Foundry, Hardhat 또는 스크립트에 입력하지 마세요.
:::

## 2. QoreX를 테스트넷으로 전환하기 {#step-testnet}

- **앱:** 설정 → **테스트넷 사용(개발자)**.
- **브라우저 확장 프로그램:** 잠금을 해제하고 하단의 버전 번호를 일곱 번 누른 다음 **테스트넷(diana)으로 전환**을 선택합니다.

홈의 네트워크 배지가 TESTNET으로 바뀝니다.

## 3. 테스트넷 QOR 받기 {#step-faucet}

[대시보드 파우셋](/dashboard/faucet)에서 `0x…` 또는 `qor1…` 주소로 테스트넷 QOR을 요청하세요. 두 주소 형태 모두 같은 잔액입니다.

## 4. QoreX에서 EVM 윈도우 열기 {#step-window}

- **확장 프로그램과 앱:** 메인 팝업 또는 홈에 있는 **MetaMask on QoreChain** 카드(**0x** 표시)입니다. 이 카드를 누르면 **EVM 액세스 윈도우** 화면이 열립니다.
- **앱:** 설정 → 보안 → **EVM 액세스 윈도우**에서도 열 수 있습니다.

이 계정에 아직 포스트 퀀텀 키가 없으면 QoreX가 이 단계에서 대신 등록해 줍니다. 등록 비용은 계정당 한 번 0.09 QOR이며, 윈도우 트랜잭션은 그와 별도로 자체 네트워크 수수료를 지불합니다. 그런 다음 세 가지 한도를 선택합니다.

| 필드 | 범위 | QoreX 기본값 |
|---|---|---|
| 블록(윈도우가 열려 있는 기간) | 1 ~ 17,280 | 300 |
| 최대 트랜잭션 수 | 1 ~ 1,000 | 5 |
| 지출 한도(QOR 단위) | 0 초과 | 1 |

지출 한도는 각 트랜잭션의 금액 **더하기 최대 수수료**(가스 한도 × 수수료 상한)를 합산하며, 전송하는 금액만 세지 않습니다. 컨트랙트 배포는 QOR을 옮기지 않지만 최대 수수료는 그대로 집계됩니다. Hardhat이 보내는 3,000,000 가스 배포는 약 0.64 QOR로 집계됩니다.

배포 세션에는 기본값이 너무 작습니다. 적당한 선택은 3,000 블록(테스트넷에서 약 1시간), 트랜잭션 20건, 한도 10 QOR입니다. 세션에 필요한 만큼만 작게 유지하고, 끝나면 윈도우를 닫으세요.

:::caution 먼저 윈도우를 여세요
윈도우를 열면 계정 nonce가 증가합니다. 배포하기 **전에** 윈도우를 여세요. 그 이전에 서명된 트랜잭션은 "nonce too low"로 거부됩니다.
:::

## 5. Foundry 또는 Hardhat으로 배포하기 {#step-deploy}

**자금이 있는 같은 coin 60 계정**의 키를 사용하세요. QoreX는 Foundry 서명자로 동작할 수 없으므로, Foundry 또는 Hardhat에 같은 복구 문구에서 나온 키를 제공합니다(예: Foundry에서 인덱스 0과 함께 `--mnemonic` 사용). 네트워크 설정은 다음과 같습니다.

| 설정 | 값 |
|---|---|
| RPC URL | `https://evm-testnet.qore.host` |
| 체인 ID | `9800` |
| 통화 | QOR, 소수 18자리 |

**Foundry**

```bash
export ETH_RPC_URL=https://evm-testnet.qore.host

forge create src/Counter.sol:Counter --private-key $DEPLOYER_KEY --broadcast
cast send <contract> "increment()" --private-key $DEPLOYER_KEY
cast call <contract> "number()(uint256)"
```

**Hardhat**

```js
// hardhat.config.js
module.exports = {
  solidity: "0.8.24",
  networks: {
    diana: {
      url: "https://evm-testnet.qore.host",
      chainId: 9800,
      accounts: [process.env.DEPLOYER_KEY],
    },
  },
};
```

```bash
DEPLOYER_KEY=0x... npx hardhat run scripts/deploy.js --network diana
```

보내는 모든 트랜잭션(배포 또는 호출)은 윈도우의 트랜잭션 하나를 사용합니다. 읽기(`cast call`, view 함수, 가스 추정)는 윈도우가 필요 없으며 윈도우를 전혀 소모하지 않습니다.

## 윈도우 확인과 만료 처리 {#check-and-expiry}

윈도우는 **만료됩니다**. 블록, 트랜잭션 또는 지출 한도가 소진되면 EVM 레인이 다음 트랜잭션을 `no open EVM authorisation window` 또는 `EVM authorisation window exhausted`로 거부합니다. QoreX에서 새 윈도우를 여세요. 새 윈도우는 이전 윈도우를 대체합니다.

상태를 확인하려면 [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers)의 **PQ key status** 탭([개발자](/dashboard/developers) 참고) 또는 REST 경로를 사용하세요.

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_window/<qor1-address>
```

`live: true`와 함께 `remaining_blocks`, `remaining_txs`, `remaining_value`(`uqor` 단위)가 표시되면 윈도우가 열려 있는 것입니다.

## 대안: 명령줄 {#cli}

`qorechaind` 릴리스 바이너리가 있으면 QoreX 없이도 원시 개인 키를 가져오고, 그 포스트 퀀텀 키를 등록하고, 윈도우를 열 수 있습니다. 개인 키만 가진 개발자를 위한 경로입니다. `gen-key`와 `cosign`은 커뮤니티 빌드에 없으므로 릴리스 바이너리가 필요합니다. 윈도우 규칙은 [EVM 개발](/developer-guide/evm-development)의 [EVM 승인 윈도우](/developer-guide/evm-development#evm-window) 섹션에 있습니다. 이렇게 연 윈도우에 이어 `cast`로 보낸 트랜잭션은 테스트넷에서 확인되었습니다.

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana

# import the private key as an eth_secp256k1 key: the qor1... and 0x... addresses are one account
qorechaind keys import-hex deployer <private-key-hex-without-0x> --key-type eth_secp256k1

# register a post-quantum key once per account (back up the .dilithium file)
qorechaind tx pqc gen-key deployer-mldsa
qorechaind tx pqc register-key-v2 dilithium5 <public_key_hex> hybrid --pqc-key deployer-mldsa \
  --from deployer --chain-id $QCHAIN --node $QNODE --gas auto --gas-adjustment 1.3 --gas-prices 0.2uqor

# open the window

qorechaind tx pqc open-evm-window 3000 20 10qor --from deployer \
  --chain-id $QCHAIN --node $QNODE --gas 400000 --fees 80000uqor --generate-only > window.json
qorechaind tx pqc cosign window.json --from deployer --pqc-key deployer-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

배포용 윈도우를 `--native-only` 또는 `--allowed-targets`로 좁히지 마세요. 두 옵션 모두 컨트랙트 생성을 거부합니다. 이 옵션들은 컨트랙트가 이미 존재하는 이후 세션을 위한 것입니다.

## 테스트넷에서 다른 점 {#diana-notes}

- **CosmWasm**은 테스트넷에서 거버넌스가 승인한 코드만 받아들이므로, 직접 만든 컨트랙트를 업로드할 수 없습니다. 열려 있는 경로는 Solidity입니다.
- **SVM**은 사용할 수 없습니다.
- 메인넷도 체인 ID 9801과 `https://evm.qore.host`로 같은 방식으로 동작하지만, 테스트넷에서 먼저 시작하세요.

## 자주 발생하는 오류 {#errors}

| 메시지 | 원인 | 해결 방법 |
|---|---|---|
| `account ... has no registered post-quantum key` | 계정에 ML-DSA-87 키가 없음 | QoreX에서 윈도우를 열면 키가 등록되며, 명령줄에서 직접 등록해도 됩니다 |
| `no open EVM authorisation window` | 윈도우가 없거나 만료됨 | 윈도우 열기 |
| `EVM authorisation window exhausted` | 트랜잭션 수 또는 지출 한도 소진 | 더 큰 한도로 새 윈도우 열기 |
| `nonce too low` | 서명한 뒤에 윈도우를 열었음 | 먼저 윈도우를 연 다음 전송 |
| `only replay-protected (EIP-155) Ethereum transactions are accepted` | 체인 ID 없이 서명된 트랜잭션 | 네트워크 설정에 `chainId` 지정 |

다음 단계: [EVM 개발](/developer-guide/evm-development), [QoreX 보안 및 복구](/qorex/security-and-recovery#evm-window), [개발자](/dashboard/developers).
