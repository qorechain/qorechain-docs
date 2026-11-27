---
slug: /build-before-qday/workshop-4
title: "워크숍 4: 롤업, IBC, 개발자를 위한 QoreX"
sidebar_label: "워크숍 4"
sidebar_position: 5
date: 2026-11-27
---

# 워크숍 4: 롤업, IBC, 개발자를 위한 QoreX

워크숍 4는 애플리케이션 아래 계층으로 내려갑니다. 첫째, QoreChain에 정산하는 <strong>롤업</strong>을 실행합니다. 롤업을 만들고, 거기에서 출금하고, 롤업이 한 일을 증명한 다음, 일부러 부정을 저지르고 그 부정이 적발되는 것을 지켜봅니다. 둘째, IBC로 <strong>QOR을 Cosmos Hub 테스트넷에 보냈다가 다시 가져옵니다</strong>. 셋째, dApp을 만드는 동안 <strong>QoreX 지갑</strong>이 무엇을 제공하는지 확인합니다.

아래의 모든 명령은 무엇을 하는지, 화면에 무엇이 보여야 하는지를 설명합니다. 코드는 공개되어 있습니다. [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday)의 `workshop-4` 폴더입니다. 여기의 모든 것은 테스트넷에서만 실행됩니다. 테스트 토큰에는 가치가 없습니다.

<strong>소요 시간:</strong> 단계를 진행하는 데 약 45분입니다. 롤업에는 한 시간의 챌린지 윈도우도 있어 그동안 기다립니다. 세 파트는 서로 독립적이므로, 파트 1에서 기다리는 동안 파트 2나 파트 3을 진행할 수 있습니다.

## 만들 것 {#what-we-built}

| 파트 | 앱 | 보여 주는 것 |
| --- | --- | --- |
| 1 | <strong>롤업</strong> (Node.js, `@qorechain/rdk`) | 앵커가 ML-DSA-87로 서명된 배치, Merkle 증명으로 지급되는 출금, 누구나 확인할 수 있는 정산 영수증, 워치타워가 증명하는 부정, 그리고 슬래싱되는 본드. |
| 2 | <strong>IBC 왕복</strong> (Node.js, `@qorechain/qoresign`, cosmjs) | QOR이 Cosmos Hub 테스트넷에 갔다가 돌아오며, QoreChain의 릴레이어인 QORel이 운반합니다. |
| 3 | <strong>개발자를 위한 QoreX</strong> (가이드, 새 코드 없음) | dApp이 통신하는 프로바이더, 연동 패키지, 개발자 모드, 요청 기록, 트랜잭션 검사기. |

이 앱들의 바탕이 되는 혁신 요소:

- <strong>정산이 포스트 양자 방식으로 서명되는 롤업.</strong> 생성자가 정직한 각 배치의 상태 루트에 ML-DSA-87(NIST FIPS 204)로 서명하고, 체인이 이를 저장합니다.
- <strong>체인이 직접 확인하는 부정 증명.</strong> `qledger-v1` 원장을 사용하면 QoreChain이 이의가 제기된 배치를 다시 실행합니다. 누가 옳았는지 판단하기 위해 누군가를 신뢰할 필요가 없습니다.
- <strong>QoreChain에서 가져오는 순서.</strong> based 시퀀싱에서는 롤업 트랜잭션이 QoreChain의 인박스에 게시되므로, 운영자가 순서를 바꾸거나 게시된 것을 빠뜨릴 수 없습니다.
- <strong>QoreChain 쪽에서 하이브리드 서명을 하는 IBC.</strong> QoreChain을 떠나는 전송은 secp256k1과 ML-DSA-87 두 가지로 서명됩니다.
- <strong>한 일을 보여 주는 지갑.</strong> QoreX는 각 사이트가 요청한 것을 기록하고, 체인에 저장된 내용을 검사할 수 있게 해 줍니다.

## 이 가이드에서 쓰는 용어 {#words}

| 용어 | 쉬운 뜻 |
| --- | --- |
| 롤업 | 자체 트랜잭션을 메인 체인 밖에서 실행하고, 가끔 짧은 요약을 메인 체인에 보내는 시스템 |
| 배치 | 그러한 요약 하나. 롤업의 새 상태와 롤업이 요청하는 출금이 담깁니다 |
| 상태 루트 | 롤업의 모든 잔액을 나타내는 짧은 지문 |
| 옵티미스틱 롤업 | 배치는 바로 받아들여지며, 챌린지 윈도우 동안 아무도 틀렸음을 증명하지 않아야만 확정됩니다 |
| 챌린지 윈도우 | 누구든 배치가 틀렸음을 증명할 수 있는 시간. 테스트넷에서는 한 시간입니다 |
| 본드 | 운영자가 잠가 두고 거짓말을 하면 잃는 돈 |
| 워치타워 | 롤업의 트랜잭션을 다시 실행해 보고 잘못된 배치를 신고하는 계정 |
| `qledger-v1` | 체인이 직접 다시 실행할 줄 아는 단순한 원장. 그 안의 계정은 ML-DSA-44로 서명합니다 |
| based 시퀀싱 | 롤업 트랜잭션의 순서가 운영자가 아니라 QoreChain의 인박스에서 정해집니다 |
| 앵커 | 롤업 생성자가 ML-DSA-87로 서명해 체인에 저장한 배치의 상태 루트 |
| Merkle 증명 | 전체 집합을 보내지 않고도 한 항목이 더 큰 집합 안에 있음을 증명하는 몇 개의 해시 |
| IBC | Cosmos 체인들이 수탁자 없이 서로 토큰을 옮기는 방식. 각 체인이 상대의 라이트 클라이언트를 실행하고 증명을 확인합니다 |
| 채널 | 두 체인 사이의 통로 |
| 바우처 | 내 QOR이 QoreChain에 잠겨 있는 동안 상대 체인이 만드는 토큰 |
| 에스크로 | 보낸 QOR이 바우처가 돌아올 때까지 기다리는 QoreChain의 계정 |
| 릴레이어 | 두 체인 사이에서 패킷과 증명을 운반하는 프로그램 |

:::caution 일회용 테스트넷 계정만 사용하세요
스크립트가 새 계정을 만들어 줍니다. 그대로 사용하세요. 실제 돈이 들어 있는 계정의 비밀 단어나 키를 파일이나 명령에 절대 넣지 마세요.
:::

## 시작하기 전에 {#prerequisites}

터미널, <strong>Node.js 20 이상</strong>, <strong>Git</strong>이 필요합니다. [시작하기 전에](/build-before-qday/prerequisites)를 참고하세요. 파트 3에는 <strong>pnpm</strong>과 QoreX 지갑도 필요합니다. Node.js를 확인합니다.

```bash
node -v
```

`v20` 이상이 출력되어야 합니다. 예제 코드를 받습니다.

```bash
git clone https://github.com/qorechain/build-before-qday.git
cd build-before-qday/workshop-4
```

첫 번째 줄은 예제를 `build-before-qday`라는 폴더로 내려받습니다. 두 번째 줄은 `workshop-4` 폴더로 이동합니다.

파트마다 필요한 테스트 QOR의 양이 다릅니다.

| 파트 | 필요한 것 | 받는 곳 |
| --- | --- | --- |
| 1, 운영자 계정 | 테스트 QOR 약 12,010개: 롤업 스테이크 10,000, 사이드체인 슬롯에 1,000, 제출자 본드 1,000, 그리고 입금과 수수료에 쓸 몇 개 | 포셋은 하루에 100 QOR을 주므로 부족합니다. [build.qorechain.io](https://build.qorechain.io) 채널에서 페스트 팀에 더 큰 테스트넷 그랜트를 요청하세요 |
| 1, 워치타워 계정 | 수수료에 쓸 테스트 QOR 몇 개 | [포셋](/dashboard/faucet) |
| 2 | 테스트 QOR 약 2개와 약간의 테스트 ATOM | [포셋](/dashboard/faucet). ATOM은 스크립트가 Cosmos Hub 테스트넷 포셋에 요청합니다 |
| 3 | QoreX 테스트넷 계정에 약간의 테스트 QOR | [포셋](/dashboard/faucet) |

:::tip 큰 그랜트가 없어도 파트 1을 따라갈 수 있습니다
`node rollup.mjs rollups`는 계정이 필요 없으며, 아래 단계는 각 명령이 무엇을 하는지 보여 줍니다.
:::

## 파트 1: QoreChain에 정산하는 롤업 {#part-1}

코드: [workshop-4/01-rollup](https://github.com/qorechain/build-before-qday/tree/main/workshop-4/01-rollup). 패키지: `@qorechain/rdk`, Rollup Development Kit.

작은 옵티미스틱 롤업의 전체 생애를 따라가 봅니다. 롤업을 만들고, 스테이크를 잠그고, 운영자 본드를 걸고, 입금하고, 배치를 제출하고, 기다리고, 출금하고, 영수증을 만들고, 부정을 저지르고, 그 부정을 적발합니다. 동작 방식은 [롤업](/rollups/overview)을 참고하세요.

### 1단계: 설치 {#r1}

```bash
cd 01-rollup
npm install
node rollup.mjs help
```

| 부분 | 하는 일 |
| --- | --- |
| `cd 01-rollup` | 롤업 앱의 폴더로 이동합니다. |
| `npm install` | 앱이 사용하는 패키지를 내려받습니다. 버전은 `package.json`과 `package-lock.json`에 고정되어 있습니다. |
| `node rollup.mjs help` | 스크립트를 실행해 모든 명령을 나열합니다. |

<strong>보여야 하는 것:</strong> 명령 목록: `init`, `rollups`, `prepare`, `status`, `withdraw`, `bond`, `receipt`, `cheat`, `watchtower`.

### 2단계: 테스트넷의 롤업 살펴보기 {#r2}

```bash
node rollup.mjs rollups
```

체인을 읽습니다. 계정은 필요 없습니다.

<strong>보여야 하는 것:</strong> 첫 줄에는 롤업 수와 오늘 체인이 요구하는 스테이크와 본드(이 가이드를 작성할 당시 10,000 QOR과 1,000 QOR)가 표시됩니다. 그다음 롤업마다 한 줄씩 id, 활성 여부, 정산 방식(`optimistic` 또는 `zk`), VM 유형, 생성된 블록이 표시됩니다.

<strong>이유:</strong> 내가 지불할 수치가 스크립트가 아니라 체인에서 온다는 것을 보여 줍니다.

### 3단계: 계정 두 개 만들기 {#r3}

```bash
node rollup.mjs init
```

<strong>운영자</strong>와 <strong>워치타워</strong>, 두 계정을 만듭니다. 비밀 단어는 `~/.config/qday-w4/operator.json`과 `watcher.json`에 저장되고, 나만 읽을 수 있으며, 출력되지 않습니다. 운영자 파일에는 두 사용자 Ana와 Ben의 롤업 키를 위한 무작위 시드 두 개도 들어 있습니다. 파일을 다른 곳에 두려면 환경 변수 `QDAY_DIR`을 설정하세요.

<strong>보여야 하는 것:</strong> `qor1...` 주소 두 개. [시작하기 전에](#prerequisites)에 나온 대로 두 곳 모두에 자금을 넣으세요.

<strong>계정이 두 개인 이유:</strong> 잘못된 배치를 신고하는 쪽이 그 배치를 게시한 쪽이어서는 안 됩니다.

### 4단계: 롤업을 만들고 배치 0 제출하기 {#r4}

```bash
node rollup.mjs prepare
```

이 명령 하나가 전체 설정을 실행합니다. 이미 한 일은 `~/.config/qday-w4/rollup-state.json`에 기억해 두므로, 중간에 멈추면 다시 실행할 수 있습니다.

| 보내는 것 | 하는 일 |
| --- | --- |
| `createRollup` | `qledger-v1` 실행과 based 시퀀싱을 사용하는 롤업을 만들고 스테이크를 잠급니다. |
| `bondRollupSubmitter` | 1,000 QOR 본드를 잠급니다. |
| 입금 두 건 | Ana의 3 QOR과 Ben의 1 QOR이 롤업으로 이동합니다. |
| 롤업 트랜잭션 세 건 | Ana가 Ben에게 0.5 QOR을 지급하고, Ana가 0.3 QOR을 출금하고, Ben이 0.2 QOR을 출금합니다. 각각 보내는 사람의 ML-DSA-44 키로 서명되어 QoreChain의 인박스에 게시됩니다. |
| `submitBatch` | 스크립트가 인박스를 다시 읽고 재실행해 새 상태 루트와 출금 루트를 구한 뒤 배치 0을 보냅니다. RDK가 그 앵커에 ML-DSA-87로 서명합니다. |

<strong>보여야 하는 것:</strong> 트랜잭션마다 `ok` 줄 하나와 블록, 익스플로러 링크. 그다음 내 롤업의 상태가 표시되며 배치 0은 `submitted`로 나타납니다.

### 5단계: 한 시간 기다린 뒤 확인하기 {#r5}

```bash
node rollup.mjs status
```

<strong>보여야 하는 것:</strong> 롤업, 운영자의 스테이크, 출금 풀, 본드, 각 배치. 한 시간의 챌린지 윈도우가 지나면 배치 0이 `finalized`로 표시됩니다.

<strong>기다리는 이유:</strong> 옵티미스틱 롤업이 안전한 것은 돈이 나가기 전에 배치가 틀렸음을 증명할 시간이 있기 때문입니다.

### 6단계: QoreChain으로 출금하기 {#r6}

```bash
node rollup.mjs withdraw 0
node rollup.mjs withdraw 1
```

출금 `0`은 Ana의 0.3 QOR이고 출금 `1`은 Ben의 0.2 QOR입니다. 이 데모에서는 둘 다 운영자 계정으로 지급됩니다. 스크립트는 그 출금이 배치 0의 출금 루트에 들어 있다는 Merkle 증명을 만들고, 체인은 지급하기 전에 저장해 둔 루트와 대조해 확인합니다. 그런 다음 스크립트는 같은 출금을 한 번 더 보냅니다.

<strong>보여야 하는 것:</strong> 증명에 포함된 해시 수, `ok` 줄, 지급 전후의 받는 쪽 잔액(같은 계정이 수수료를 냈습니다), 그리고 `REFUSED`로 표시된 두 번째 시도. 출금은 한 번만 지급됩니다.

배치 0이 아직 확정되지 않았다면, 명령은 멈추고 출금은 챌린지 윈도우가 지난 후에만 지급된다고 알려 줍니다.

### 7단계: 정산 영수증 {#r7}

```bash
node rollup.mjs receipt 0
```

배치 0을 설명하는 작은 JSON 파일을 만들어 키 옆에 저장합니다. 누구나 확인할 수 있습니다. 이 검사는 모든 것을 QoreChain에서 다시 읽으며 파일을 신뢰하지 않습니다.

| 검사 | 증명하는 것 |
| --- | --- |
| `rollupLayerBinding` | 롤업이 영수증에 적힌 레이어에 속한다 |
| `batchStateRoot` | 체인의 배치에 정확히 이 상태 루트가 담겨 있다 |
| `anchorOnChain` | 영수증의 모든 필드를 가진 앵커가 체인에 존재한다 |
| `creatorAuthority` | 서명 키를 영수증이 아니라 체인에서 읽었다 |
| `pqcSignature` | 앵커에 대한 ML-DSA-87 서명이 유효하다 |
| `chainBinding` | 영수증이 이 체인의 것이며 다른 곳에서 복사한 것이 아니다 |

<strong>보여야 하는 것:</strong> `VALID`와 여섯 가지 검사 각각의 옆에 있는 체크 표시. 그다음 스크립트가 상태 루트의 16진수 한 자리를 바꾸고 다시 검사합니다: `NOT VALID`.

<strong>쓸모 있는 이유:</strong> 거래소, 감사인, 다른 시스템이 파일을 보낸 사람을 신뢰하지 않고도 롤업의 상태를 검증할 수 있습니다.

### 8단계: 부정직한 운영자 {#r8}

```bash
node rollup.mjs cheat
```

Ben이 롤업 안에서 Ana에게 0.1 QOR을 지급한 다음, 운영자가 상태 루트의 비트 하나를 일부러 뒤집은 배치 1을 제출합니다.

<strong>보여야 하는 것:</strong> `ok` 줄 두 개. 두 번째 줄은 배치가 <strong>잘못된 상태 루트</strong>로 게시되었다고 알려 줍니다. 체인은 일단 이를 받아들입니다. 한 시간 안에 틀렸음이 증명될 수 있으며, 운영자의 본드가 걸려 있습니다.

### 9단계: 워치타워가 적발하기 {#r9}

```bash
node rollup.mjs watchtower
```

이 명령은 운영자가 아니라 워치타워 계정을 사용합니다.

| 단계 | 일어나는 일 |
| --- | --- |
| 1 | 체인에서 배치 1을 읽습니다. |
| 2 | 배치 1이 사용한 인박스 부분을 정확히 읽고, 배치 0 이후의 상태에서 다시 실행합니다. 이렇게 하면 정직한 루트가 나옵니다. |
| 3 | 부정 증명을 만들고 내 컴퓨터에서 확인합니다. |
| 4 | `challengeBatch`를 보냅니다. 체인이 배치를 직접 다시 실행해 거부하고 본드를 슬래싱합니다. 절반은 소각되고 절반은 워치타워에 지급됩니다. |

<strong>보여야 하는 것:</strong> 잘못된 루트와 정직한 루트, 로컬 검사 결과, 챌린지의 `ok` 줄, 거부됨으로 표시된 배치, 그리고 전후의 워치타워 잔액.

:::note 누군가 나보다 빠를 수 있습니다
테스트넷에는 이미 독립적인 워치타워들이 있습니다. 그중 하나가 먼저 부정을 증명하면(블록 하나면 될 수도 있습니다), 내 스크립트는 배치가 이미 거부되었다고 알리고 로컬 검사만 실행합니다. 어느 쪽이든 운영자는 본드를 잃습니다.
:::

다시 부정을 저질러 보려면 먼저 본드를 다시 채우세요.

```bash
node rollup.mjs bond
```

### 코드의 구성 {#r-code}

모든 것은 `rollup.mjs` 파일 하나에 있습니다. 각 명령은 `cmds` 객체의 함수 하나이며, 위 단계의 순서대로 되어 있습니다. `connect()` 함수는 계정 파일을 RDK 트랜잭션 클라이언트로 바꾸며, 이 클라이언트는 모든 QoreChain 트랜잭션에 secp256k1과 ML-DSA-87 두 키로 서명합니다.

## 파트 2: QOR을 Cosmos Hub에 보냈다가 가져오기 {#part-2}

코드: [workshop-4/02-ibc](https://github.com/qorechain/build-before-qday/tree/main/workshop-4/02-ibc). 패키지: `@qorechain/qoresign`과 cosmjs. 네트워크: QoreChain 테스트넷 `qorechain-diana`와 Cosmos Hub 테스트넷 `provider`.

이 앱은 0.5 QOR을 QoreChain 테스트넷에서 Cosmos Hub 테스트넷으로 보냈다가 다시 가져옵니다. QoreChain의 릴레이어인 [QORel](https://github.com/qorechain/QORel)이 두 체인 사이에서 패킷을 운반합니다. 이 가이드를 작성할 당시 QoreChain 테스트넷에는 IBC 채널이 열 개 있었습니다: Cosmos Hub, Osmosis, Injective, Akash, Celestia, Coreum, dYdX, Fetch, Allora, ixo. IBC는 테스트넷에서만 실행되며, 메인넷에서는 가동되지 않습니다.

동작 방식:

1. 키 하나로 주소 두 개가 생깁니다. QoreChain의 `qor1...`와 Hub의 `cosmos1...`입니다.
2. <strong>갈 때:</strong> 전송은 QoreChain에서 두 키로 서명되고, 체인은 둘 다 확인합니다. QORel이 패킷과 증명을 Hub로 운반합니다. Hub에 있는 QoreChain의 라이트 클라이언트가 증명을 확인하고 QOR에 대한 바우처를 만듭니다.
3. <strong>올 때:</strong> Hub에서는 전송이 Hub의 일반적인 방식으로 서명됩니다. QoreChain에 있는 Hub의 라이트 클라이언트가 증명을 확인합니다. 바우처는 소각되고 원래 QOR이 풀립니다.

:::info 알아 두면 좋은 두 가지 제한
QoreChain의 `channel-0`은 Hub의 `channel-600`입니다. Hub에서 바우처의 이름은 `ibc/` 뒤에 `transfer/channel-600/uqor`의 SHA-256이 붙은 것입니다. 테스트넷의 각 QOR 채널에서는 안전 제동 장치로서, 24시간 동안 QOR 공급량의 최대 1%만 건너갈 수 있습니다.
:::

### 1단계: 설치 {#i1}

```bash
cd ../02-ibc
npm install
node ibc.mjs help
```

첫 번째 줄은 `01-rollup`에서 `02-ibc`로 이동합니다. `workshop-4` 폴더에 있다면 `cd 02-ibc`를 사용하세요.

<strong>보여야 하는 것:</strong> 명령 목록: `init`, `channels`, `status`, `register`, `hub-faucet`, `send`, `back`.

### 2단계: 키 하나, 체인 둘 {#i2}

```bash
node ibc.mjs init
```

계정을 만들고 그 비밀 단어를 `~/.config/qday-w4/traveler.json`에 저장하며, 파일은 나만 읽을 수 있습니다. 비밀 단어는 출력되지 않습니다. `QDAY_DIR`로 폴더를 바꿀 수 있습니다.

<strong>보여야 하는 것:</strong> 계정의 QoreChain 주소와 Cosmos Hub 주소. `qor1...` 주소를 [포셋](/dashboard/faucet)에 붙여 넣으세요.

### 3단계: 채널 나열하기 {#i3}

```bash
node ibc.mjs channels
```

QoreChain 테스트넷의 모든 IBC 채널과 반대편 끝의 체인을 읽습니다. 계정은 필요 없습니다.

<strong>보여야 하는 것:</strong> 채널마다 한 줄씩 상태(`OPEN`), 상대 체인의 id, 상대편에서의 채널 이름이 표시됩니다. 마지막 줄은 메인넷에는 아직 채널이 없음을 보여 줍니다.

### 4단계: 포스트 양자 키를 등록하고 ATOM 받기 {#i4}

```bash
node ibc.mjs register
node ibc.mjs hub-faucet
node ibc.mjs status
```

| 명령 | 하는 일 |
| --- | --- |
| `register` | 내 ML-DSA-87 공개 키를 체인에 한 번 올립니다. 이후의 QoreChain 트랜잭션은 이 키로 확인합니다. |
| `hub-faucet` | Cosmos Hub 테스트넷의 공개 포셋에 ATOM을 요청합니다. ATOM은 돌아오는 길의 수수료를 냅니다. |
| `status` | QoreChain의 내 QOR, Hub의 바우처와 ATOM, 그리고 내 키가 체인에 있는지를 보여 줍니다. |

<strong>보여야 하는 것:</strong> `status`를 실행하면 내 QOR 잔액, `ML-DSA-87 key on chain: yes`, 약간의 ATOM이 보여야 합니다. 잔액이 아직 0이면 1분 기다린 뒤 `status`를 다시 실행하세요.

### 5단계: 갈 때 {#i5}

```bash
node ibc.mjs send 0.5
```

`channel-0`의 토큰 전송 메시지(`MsgTransfer`, ICS-20 표준)를 만들고 QoreSign을 통해 두 키로 서명한 다음, 바우처가 Hub에 나타날 때까지 기다립니다.

<strong>보여야 하는 것:</strong> 번호가 매겨진 세 줄: 패킷 번호, 블록, 익스플로러 링크가 있는 서명된 트랜잭션, 패킷을 운반하는 QORel, 그리고 Hub에 도착한 바우처와 걸린 시간(초). 각 방향은 보통 몇 초 걸립니다. 실제 걸리는 시간은 다를 수 있습니다.

### 6단계: 그리고 올 때 {#i6}

```bash
node ibc.mjs back
```

모든 바우처를 `channel-600`을 통해 돌려보냅니다. Hub 트랜잭션은 일반 cosmjs 클라이언트로, Hub의 현재 가스 가격에 맞춰 서명됩니다. 그런 다음 스크립트는 QOR이 돌아올 때까지 기다립니다.

<strong>보여야 하는 것:</strong> Hub 트랜잭션, 그다음 Hub에서 소각되는 바우처와 QoreChain에서 풀리는 일반 QOR.

### 코드의 구성 {#i-code}

모든 것은 `ibc.mjs` 파일 하나에 있습니다. `sendTx()`는 QoreSign으로 하이브리드 QoreChain 트랜잭션을 만들고 서명합니다. `hubWallet()`은 같은 비밀 단어를 `cosmos` 접두사를 가진 Hub 지갑으로 바꿉니다. 각 명령은 `cmds` 객체의 함수 하나입니다.

## 파트 3: 개발자를 위한 QoreX {#part-3}

가이드: [workshop-4/03-qorex-developer-mode](https://github.com/qorechain/build-before-qday/tree/main/workshop-4/03-qorex-developer-mode). 새 코드는 없습니다. 워크숍 1의 [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector)를 사용합니다.

아래 단계는 Chrome 또는 Firefox의 <strong>QoreX 0.4.5 브라우저 확장 프로그램</strong>을 사용합니다. Safari 확장 프로그램은 이전 버전입니다. QoreX 앱(1.2.5, iPhone 및 Android)에도 개발자 모드가 있습니다. [개발자 모드](/qorex/developer-mode)에 설명된 대로 <strong>설정</strong>에서 켭니다.

### dApp이 통신하는 대상 {#providers}

QoreX는 웹 페이지에 프로바이더 세 개를 추가합니다.

| 프로바이더 | 용도 | 표준 |
| --- | --- | --- |
| `window.ethereum` | EVM dApp. QoreX는 EIP-6963을 통해서도 자신을 알립니다 | EIP-1193 |
| `window.qorex.native` | secp256k1과 ML-DSA-87로 서명하는 QoreChain Native 트랜잭션 | QoreX API |
| `window.qorex.svm` | SVM 레인 | QoreX API |

npm의 다음 패키지들은 QoreX를 흔히 쓰는 도구에 연결합니다.

| 패키지 | 용도 |
| --- | --- |
| `@qorechain/qorex-rainbowkit` | RainbowKit에서 QoreX 사용(EVM) |
| `@qorechain/qorex-cosmos-kit`, `@qorechain/qorex-interchain-kit` | Cosmos Kit과 Interchain Kit에서 QoreX 사용 |
| `@qorechain/qorex-types` | `window.qorex`용 TypeScript 타입 |
| `@qorechain/qorex-wallet-mock`, `@qorechain/qorex-synpress` | 자동화 테스트에서 QoreX를 상대로 dApp 테스트 |
| `@qorechain/sdk`, `@qorechain/wallet-adapter` | 하이브리드 서명 트랜잭션을 만들고 보내기 |

자세한 내용은 [QoreX와 dApp 연동하기](/qorex/dapp-integration)를 참고하세요.

### 1단계: 개발자 모드 켜기 {#x1}

확장 프로그램의 팝업에서 홈 화면 하단의 버전 번호를 <strong>일곱 번</strong> 클릭합니다. <strong>개발자 모드</strong> 섹션이 나타나고, <strong>개발자 도구</strong>, <strong>테스트넷(diana)으로 전환</strong>, <strong>개발자 모드 끄기</strong>가 있습니다. <strong>테스트넷(diana)으로 전환</strong>을 클릭합니다.

<strong>먼저 하는 이유:</strong> 요청 기록은 개발자 모드가 켜져 있는 동안에만 요청을 기록합니다.

### 2단계: Hybrid Inspector 시작하기 {#x2}

`workshop-4` 폴더에서 실행합니다.

```bash
cd ../workshop-1/03-hybrid-inspector
pnpm install
pnpm dev
```

첫 번째 줄은 워크숍 1 앱으로 이동하고, `pnpm install`은 그 패키지를 내려받으며, `pnpm dev`는 로컬 웹 페이지를 시작합니다. 출력되는 주소(보통 `http://localhost:5173`)를 열고 QoreX를 연결합니다.

### 3단계: 지갑이 잠긴 상태에서 요청 보내기 {#x3}

QoreX에서 <strong>잠금</strong>을 클릭합니다. Inspector에서 메모 `Workshop 4`와 함께 0.001 QOR을 자신의 주소로 보냅니다.

<strong>보여야 하는 것:</strong> QoreX가 비밀번호를 요청하고, 요청하는 <strong>사이트의 이름을 알려 줍니다</strong>. 잠금을 해제하면 승인 화면에 금액, 받는 주소, 메모가 표시됩니다. 승인하면 트랜잭션이 두 키로 서명됩니다. 대신 창을 닫으면 요청이 거부됩니다.

<strong>중요한 이유:</strong> 비밀번호 없이는 아무것도 서명되지 않으며, 어느 사이트가 요청하는지 알 수 있습니다.

### 4단계: 개발자 도구 열기 {#x4}

<strong>개발자 도구</strong>를 열고 <strong>트랜잭션</strong> 아래를 봅니다.

- <strong>요청 기록:</strong> 각 사이트가 QoreX에 요청한 것으로, 메서드, 매개변수, 내가 응답한 내용이 담깁니다.
- <strong>트랜잭션 검사기:</strong> 트랜잭션 해시나 요청을 <strong>Hash or request</strong>에 붙여 넣고 <strong>검사</strong>를 클릭합니다. 해시를 넣으면 지갑을 벗어나지 않고 체인이 기록한 내용을 볼 수 있습니다.

개발자 도구는 모두 17개입니다. [개발자 모드](/qorex/developer-mode)에서 각 도구를 설명합니다.

### QoreX 1.2.5의 또 다른 새 기능 {#also-new}

- <strong>직접 여는 EVM 창은 기본적으로 QOR 전송만 허용합니다.</strong> 더 넓은 범위를 선택할 수 있으며, 무엇을 허용하는지 볼 수 있습니다.
- <strong>PQC 멀티시그:</strong> 각 구성원이 포스트 양자 방식으로 서명하는 공유 계정입니다.
- <strong>키 교체와 복구:</strong> 주소를 바꾸지 않고 체인의 ML-DSA-87 키를 교체하거나 고칩니다.

## 문제 해결 {#troubleshooting}

| 보이는 메시지 | 할 일 |
| --- | --- |
| `no operator account yet` | 먼저 `node rollup.mjs init`을 실행하세요. |
| `no rollup yet` | 먼저 `node rollup.mjs prepare`를 실행하세요. |
| 자금 부족으로 `createRollup`이 거부됨 | 운영자 계정에는 테스트 QOR이 약 12,010개 필요합니다. [시작하기 전에](#prerequisites)를 참고하세요. |
| `prepare`가 중간에 멈춤 | 다시 실행하세요. 이미 한 부분 다음부터 이어서 진행합니다. |
| `withdrawals are paid only after the challenge window` | 배치 0이 아직 확정되지 않았습니다. `node rollup.mjs status`로 확인하고 나중에 다시 시도하세요. |
| `nothing to challenge` | 먼저 `node rollup.mjs cheat`를 실행하세요. |
| `watchtower`를 실행했을 때 배치가 이미 거부되어 있음 | 테스트넷의 다른 워치타워가 더 빨랐습니다. 정상입니다. |
| `no account "traveler"` | 먼저 `node ibc.mjs init`을 실행하세요. |
| `does not exist on chain yet` | 그 주소에 쓸 테스트 QOR을 포셋에서 받은 다음 다시 시도하세요. |
| `nothing after 120 s` | 릴레이어가 바쁠 수 있습니다. 1분 기다린 뒤 `node ibc.mjs status`를 실행하세요. |
| 요청 기록이 비어 있음 | dApp을 사용하기 전에 개발자 모드를 켜세요. |

## 더 알아보기 {#learn-more}

- 페스트와 그 레벨 및 트랙: [build.qorechain.io](https://build.qorechain.io).
- [롤업](/rollups/overview)과 RDK. RDK는 TypeScript, Python, Rust, Go, Java용으로 제공되며, 명령줄 도구 `qorollup`과 프로젝트 템플릿이 있습니다.
- 새 배치가 도착하는 대로 따라가려면 RDK의 `watchBatches`를 살펴보세요. 온종일 실행되는 워치타워의 출발점입니다.
- [QORel](https://github.com/qorechain/QORel)은 오픈 소스입니다. `brew install qorechain/tap/qorel`로 설치하거나 컨테이너 `ghcr.io/qorechain/qorel`을 사용하세요. 반드시 자신의 키로만 실행하세요.
- 파트 2에서 다른 채널을 시험해 보려면 `ibc.mjs`의 `CHANNEL`, `HUB_CHANNEL`, 상대 체인의 엔드포인트를 바꾸세요. `node ibc.mjs channels`가 채널을 나열합니다.
- QoreX의 [개발자 모드](/qorex/developer-mode)와 [dApp 연동](/qorex/dapp-integration).
- 롤업이 게시하는 데이터를 비공개로 유지해야 한다면 [워크숍 3, QoreSeal](/build-before-qday/workshop-3#part-1)을 참고하세요.
