---
slug: /developer-guide/exchange-integration
title: 거래소 및 통합사 가이드
sidebar_label: 거래소 통합
sidebar_position: 11
---

# 거래소 및 통합사 가이드

거래소, 커스터디, 결제 통합사가 QOR을 상장하고 입출금을 처리하는 데 필요한 모든 것: 인터페이스 선택, 안전한 입금 감지, 출금 서명까지 다룹니다.

:::note
이 가이드는 **`qorechain-vladi`** 메인넷(2026년 6월 7일부터 가동 중, 노드 릴리스 **v3.2.3**, 2026년 10월 20일 높이 3,662,051에서 적용)을 대상으로 합니다. 먼저 **`qorechain-diana`** 테스트넷에서 전체 흐름을 리허설하세요 — 테스트넷은 2026년 10월 19일부터 v3.2.4를 실행하고 있으며, 메인넷은 높이 3,742,566에서 v3.2.3에서 v3.2.4로 넘어가므로(거버넌스 제안 13) 아래에 나열된 변경 사항은 해당 블록에 도달하면 두 네트워크 모두에 적용됩니다(두 네트워크의 엔드포인트는 [네트워크](/appendix/networks#public-endpoints)에서 확인할 수 있습니다). 자체 풀 노드를 운영한다면 다운로드 매니페스트가 권장하는 릴리스로 유지하고, 매니페스트의 `minCompatible` 미만으로 내려가지 않도록 하세요(메인넷에서는 업그레이드 전까지 **3.2.3**) — 오래된 노드는 체인 업그레이드를 따라갈 수 없고 업그레이드 높이에서 멈춥니다. 높이 3,742,566 이전에 해야 할 일은 [노드 실행](/developer-guide/running-a-node#upgrades)을 참고하세요.

**v3.2.2와 v3.2.3에서 통합사에게 달라진 점** (서명 형식, 주소, 소수 자릿수, 메모, 수수료는 모두 그대로입니다):

* **보호되지 않은(EIP-155 이전) Ethereum 트랜잭션은 거부됩니다**(v3.2.2). 멤풀과 블록 실행 모두에서 해당됩니다. 입금자의 지갑은 체인 ID로 서명해야 하며, 현재의 모든 지갑이 그렇게 합니다.
* **모듈 계정은 EVM을 통해 점유할 수 없습니다**(v3.2.2). 모듈 계정 주소를 입금 또는 출금 주소로 사용하지 마세요.
* **베스팅 계정은 서명자 자신에 대해서만 생성할 수 있습니다**(v3.2.3). 세 가지 베스팅 생성 메시지는 현재 메인넷의 서킷 브레이커 목록에도 올라 있습니다.
* **계정에 키가 생기면 PQC 키 메시지에 하이브리드 서명이 필요합니다**(v3.2.3): [양자내성 서명](/developer-guide/post-quantum-signing#key-integrity)을 참고하세요. 핫월렛의 키는 일찍 한 번만 등록하세요.
* **EVM 창의 범위를 제한할 수 있습니다**(v3.2.3): 순수 QOR만 보내는 핫월렛은 `native_only` 창을 열 수 있습니다. [EVM 개발](/developer-guide/evm-development#evm-window)을 참고하세요.

**v3.2.4에서 통합사에게 달라지는 점** (테스트넷은 2026년 10월 19일부터, 메인넷은 높이 3,742,566부터). 트랜잭션 서명, 주소, 소수 자릿수, 메모, 수수료는 그대로이며, 입금을 감지하는 방식이나 출금을 서명하고 브로드캐스트하는 방식은 전혀 바뀌지 않습니다:

* **선택적 스테이킹 잠금(새 모듈 `x/stakingtier`).** 위임자는 위임의 일부를 3개월, 6개월 또는 12개월 동안 잠글 수 있습니다(최소 잠금 10 QOR, 위임자당 열린 잠금은 최대 16개). 잠금을 만들지 않은 계정에는 아무 일도 일어나지 않습니다. 잠금이 열려 있는 동안 해당 금액은 어떤 경로(일반 트랜잭션, `authz`, 그룹 또는 컨트랙트)로도 **언델리게이트하거나 리델리게이트할 수 없으며**, 잠금을 일찍 종료하면 잠긴 스테이크에서 페널티가 소각됩니다. 따라서 고객 자금을 스테이킹하는 커스터디안은 반환해야 할 수 있는 부분을 잠그지 않아야 합니다. 파라미터는 `GET /qorechain/stakingtier/v1/params`에서 확인하세요.
* **새로운 소각 출처 `staking_tier_penalty`** 가 조기 해제가 발생하면 소각 통계에 나타납니다. 소각 출처를 열거하는 공급량 대사 작업은 알 수 없는 출처 이름도 받아들여야 합니다.
* 직접 운영하는 노드를 위한 **노드 로컬 JSON-RPC 제한**: 256 KiB를 넘는 요청 본문은 거부되고(HTTP 413), 동시에 처리되는 요청은 256개까지이며(그 이상은 HTTP 503), 토픽 위치가 4개를 넘거나, 한 위치에 대안이 1000개를 넘거나, 주소가 1000개를 넘는 `eth_getLogs` 또는 `eth_newFilter` 필터는 거부됩니다. 이 제한은 `app.toml`의 `[json-rpc]` 섹션에서 설정할 수 있습니다([노드 실행](/developer-guide/running-a-node#exposing-endpoints-for-integration) 참고). 긴 주소 목록으로 `eth_getLogs`를 폴링하는 입금 스캐너는 목록을 나누어야 합니다.
* **반복된 키 등록은 수수료를 내기 전에 거부됩니다.** v3.2.4를 실행하는 노드는 계정에 이미 등록된 것과 정확히 같은 공개 키를 담은 `MsgRegisterPQCKeyV2`를, 체인이 반환했을 오류(PQC 코드 7, 계정이 이미 존재함)와 함께 브로드캐스트 시점에 거부하며, 수수료도 부과하지 않습니다. 아래에서 권장하듯 핫월렛의 키를 등록하기 전에 `GET /qorechain/pqc/v1/account/{address}`를 확인하세요.
* **선택적 소유 플래그.** 계정 기록에 등록 시 소유 증명이 검증되었는지를 나타내는 `possession_proven` 필드가 추가됩니다. 누가 보내고 받을 수 있는지는 바뀌지 않습니다. [양자내성 서명](/developer-guide/post-quantum-signing#proof-of-possession)을 참고하세요.
:::

## 통합 경로 선택 {#choosing-a-path}

QoreChain은 **하나의 통합된 네이티브 QOR 잔액**을 세 가지 인터페이스로 노출하는 단일 체인입니다. **동일한 개인 키가 동일한 자금**을 Cosmos(`qor1...`), EVM(`0x...`), SVM(base58) 주소 아래에서 제어하므로, 여러분의 스택에 맞는 인터페이스를 선택하면 됩니다.

| | **A) Cosmos (네이티브)** | **B) EVM** | **C) SVM (Solana VM)** |
|---|---|---|---|
| 주소 | `qor1...` (bech32) | `0x...` (Ethereum) | Solana base58 (동일 키) |
| 소수 자릿수 (네이티브 QOR) | **6** (`uqor`) | **18** (wei 방식) | **9** (lamports; 1 uqor = 1,000 lamports) |
| 도구 | Cosmos SDK / CosmJS | **표준 Ethereum** (ethers/web3, MetaMask) | `@solana/web3.js` |
| 출금 서명 | **하이브리드 PQC 필수** (ML-DSA-87 + secp256k1) | **표준 secp256k1 / EIP-155, 단 열려 있는 PQC 승인 창 안에서만 가능** (등록된 ML-DSA 키 + 하이브리드 서명된 Cosmos 메시지로 연 창) | Cosmos 트랜잭션 또는 온-노드 제출을 통해 (레인 현재 비활성화) |
| 메모/태그 지원 | **가능** (공유 주소 + 메모) | 불가 (사용자당 하나의 주소) | 불가 (사용자당 하나의 주소) |
| 입금 감지 | `MsgSend` 이벤트 스캔 | `eth_getBlockByNumber`로 블록 스캔 | `getBalance` / `getSignaturesForAddress` |
| 적합한 대상 | Cosmos 네이티브 플랫폼 | **기존 EVM 통합을 보유한 플랫폼** | Solana 툴링 플랫폼 |

**권장 사항:** 출금에는 **경로 A(Cosmos)**를 사용하세요. 이것이 네이티브 경로이며 메모 기반 공유 입금 주소를 지원합니다. v3.2.0부터 EVM 레인(경로 B)도 등록된 ML-DSA-87 키와, 하이브리드 서명된 Cosmos 레인 메시지로만 열 수 있는 제한된 **EVM 승인 창**을 요구하므로, EVM 출금 레일에는 경로 A와 동일한 양자내성 서명 스택**에 더해** 창 관리가 필요합니다([경로 B](#path-b-evm) 및 [EVM 승인 창](/developer-guide/evm-development#evm-window) 참고). 경로 B는 표준 Ethereum 툴링을 사용한 **입금 감지**에는 여전히 적합합니다. 경로 C(SVM)는 서류상으로는 완전한 네이티브 QOR 인터페이스이지만, **해당 트랜잭션 레인은 현재 네트워크 전역에서 비활성화되어 있습니다**([경로 C](#path-c-svm) 참고) — 재개될 때까지는 경로 A를 사용하거나, 입금 감지에는 경로 B를 사용하세요.

세 인터페이스는 **상호 배타적이지 않습니다** — 동일 키의 `0x`, `qor1`, SVM 형태로 전송된 자금은 모두 같은 잔액입니다.

## 노드 운영 {#node}

프로덕션 통합에서는 서드파티 엔드포인트가 아니라 **자체 동기화 노드**를 기준으로 입금을 검증해야 합니다. [메인넷 연결하기](/getting-started/connecting-to-mainnet)를 따르세요 — 사전 빌드된 바이너리 번들(SHA-256 체크섬 포함), 제네시스, 퍼블릭 피어, 수수료 하한(`0.1uqor`), 게시된 체인 데이터 스냅샷을 통한 빠른 부트스트랩까지 다룹니다. 비검증 풀 노드를 운영하는 데는 라이선스가 필요하지 않습니다.

QoreChain은 **즉시 완결성**(리오그 없음)을 가지므로 **1회 확인이면 최종 확정**입니다. 1~2블록을 기다리면 운영상 여유를 더 확보할 수 있습니다.

## 경로 A — Cosmos (네이티브) {#path-a-cosmos}

기본 REST URL: `https://api.qore.host` (또는 자체 노드에서 `http://localhost:1317`).

### 입금 감시

```bash
# latest height
curl -s https://rpc.qore.host/status | jq -r .result.sync_info.latest_block_height

# all txs in a height (deposit scanning)
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs/block/{HEIGHT}" | jq '.txs'

# incoming transfers to an address
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs?query=transfer.recipient='qor1...'&limit=50" | jq '.tx_responses[].txhash'

# balance (uqor — divide by 1e6 for QOR)
curl -s "https://api.qore.host/cosmos/bank/v1beta1/balances/qor1.../by_denom?denom=uqor" | jq -r .balance.amount
```

### 가짜 입금 방지 체크리스트 {#anti-fake-deposit}

다음 조건을 **모두** 만족할 때만 입금을 인정하세요:

1. **`tx_response.code == 0`** — 트랜잭션이 성공했을 때. 실패한 트랜잭션은 절대 인정하지 마세요.
2. 메시지가 **`/cosmos.bank.v1beta1.MsgSend`**(또는 `MsgMultiSend`의 출력)일 것 — 컨트랙트 호출이나 다른 모듈이 아닐 것.
3. **`to_address`**가 여러분의 입금 주소와 일치하고, (공유 주소 모델의 경우) **`memo`**가 해당 사용자와 일치할 것.
4. **`denom == "uqor"`**이고 `amount`가 인정할 금액일 것(uqor → QOR로 환산하려면 10⁶으로 나눔). 다른 denom은 거부하세요.
5. 트랜잭션이 **커밋된 블록**에 있을 것(`height`가 존재하고 최신 커밋 높이 이하). 완결성은 즉시이므로 1회 확인이면 최종 확정이며, 여유를 위해 1~2블록을 기다리세요.
6. **전송 이벤트**(`coin_received` / `coin_spent`)로부터 금액을 다시 계산하여 메시지 금액과 교차 검증하세요 — 단일 필드나 메모만 믿지 마세요.
7. 여러분의 **자체** 동기화 노드에서 `GET /cosmos/tx/v1beta1/txs/{hash}`를 통해 트랜잭션 해시가 존재하는지 확인하세요.

### 출금 — 하이브리드 PQC 서명 {#cosmos-withdrawals}

메인넷은 Cosmos 트랜잭션에 대해 **양자내성 서명**을 강제합니다(`allow_classical_fallback = false`). 모든 출금에는 ML-DSA-87(Dilithium-5, FIPS-204) **더하기** secp256k1로 구성된 **하이브리드 서명**이 필요합니다. 입금은 이 과정이 필요하지 않습니다(체인을 감시하기만 하면 됩니다).

서명 라이브러리는 [**`@qorechain/wallet-adapter`**](https://github.com/qorechain/qorechain-wallet-adapter)(npm)이며, FIPS-204 프리미티브를 위해 `@qorechain/pqc`를 함께 사용합니다:

```bash
npm i @qorechain/wallet-adapter @qorechain/pqc @cosmjs/proto-signing@0.32 @cosmjs/stargate@0.32 cosmjs-types@0.9.0
# pin the cosmjs packages to 0.32 (the adapter's peer range) and cosmjs-types to 0.9.x — 0.10 breaks the subpath imports the adapter uses
```

서명은 **2단계** 흐름입니다 (`qorechaind tx pqc cosign`과 동일한 방식):

**1단계 — 핫월렛당 최초 1회: ML-DSA-87 키를 등록합니다.** 이 등록 트랜잭션 한 건만 **클래식 서명**으로 처리됩니다(아직 키가 없는 계정에 대한 부트스트랩 예외이며, 키가 한 번 생기면 이후의 모든 키 메시지는 하이브리드 서명이어야 합니다): 메시지 `/qorechain.pqc.v1.MsgRegisterPQCKeyV2`에 `{sender, public_key, algorithm_id: 1, key_type: "hybrid"}`를 담습니다. ML-DSA 키는 결정론적으로 파생하여 기존 시크릿으로부터 복구 가능하게 하세요 — 예: `seed = SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)` 후 `mldsa.keygen(seed)` — 그리고 이 시드를 핫월렛 키와 함께 보관하세요. 등록은 명시적입니다. 하이브리드 트랜잭션이 처음 나타날 때 키가 자동으로 등록되지 않으며, 트랜잭션에 포함된 키는 등록된 것이 아닙니다. 체인은 `classical_only` 키와 양자내성 보호를 제공하지 않는 키를 거부하며(코드 230), 소유 증명을 첨부하면 이를 검증합니다(CLI: `register-key-v2 ... --pqc-key`. `@qorechain/sdk` 0.9.0은 네트워크가 v3.2.3을 적용한 뒤에는 `ensurePqcRegistered`를 통해 스스로 이를 첨부하며, `@qorechain/wallet-adapter` 0.4.0은 첨부하지 않지만 첨부하지 않아도 수락됩니다). 가스를 명시적으로 설정하세요(2,592바이트 키에는 기본값 200,000보다 많은 가스가 필요합니다. CLI에서는 `--gas 600000`, 코드에서는 가스 한도 600,000, 수수료는 최소 gas × 0.1 uqor, 즉 60,000 uqor를 사용하세요).

**2단계 — 이후 모든 출금: `MsgSend`를 하이브리드 서명합니다.** 어댑터는 일반적인 secp256k1 `signDirect` *이전에* ML-DSA-87 서명을 트랜잭션 본문 확장(tx-body extension)에 포함시키므로 기존 서명 로직은 변경할 필요가 없습니다:

```js
import { QoreChainSigner } from "@qorechain/wallet-adapter";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx.js";

// pqc = { publicKey, secretKey } from mldsa.keygen(seed)
// accountNumber + sequence from the auth query
const signer = new QoreChainSigner({ wallet, chainId: "qorechain-vladi",
  rest: "https://api.qore.host",   // used to pick the network's hybrid sign-bytes form (required on mainnet and testnet)
  address, pubkeySecp256k1, accountNumber, pqc });
const txBytes = await signer.signHybrid({
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: MsgSend.encode(MsgSend.fromPartial({ fromAddress, toAddress,
      amount: [{ denom: "uqor", amount: "1000000" }] })).finish() }],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gasLimit: 400000n },
  sequence });
```

서명된 바이트를 브로드캐스트합니다:

```bash
curl -s -X POST https://api.qore.host/cosmos/tx/v1beta1/txs \
  -H 'Content-Type: application/json' \
  -d '{"tx_bytes":"<base64-signed-tx>","mode":"BROADCAST_MODE_SYNC"}' | jq .tx_response.code
# 0 => accepted into the mempool
# code 20 "hybrid PQC signature required" => the transaction carries no PQC extension
#   (a classical-only transaction is refused; only the key registration itself is exempt)
# code 21 => the PQC half did not verify (wrong key or sign-bytes form), see the troubleshooting link below
```

이후 `GET /cosmos/tx/v1beta1/txs/{hash}`를 폴링하여 `code == 0`으로 블록에 포함될 때까지 기다리세요.

HSM이나 다른 언어로 작성한 커스텀 서명기를 사용하는 경우, 독립형 [**`qorechain-pqc`**](/developer-guide/post-quantum-signing) FIPS-204 라이브러리(npm, PyPI, crates.io, Maven Central, Go)를 사용하여 동일한 확장을 조립하세요. 체인은 헤지드(hedged)든 결정론적이든 유효한 FIPS-204 ML-DSA-87 서명을 모두 수락합니다. 결정론적으로 서명하면(FIPS-204 §3.4, 라이브러리 기본값) 서명과 tx 해시를 재현할 수 있습니다. [결정론적 서명](/developer-guide/post-quantum-signing#deterministic-signing)을 참고하고, 하이브리드 트랜잭션이 거부되면 [코드 21 문제 해결](/developer-guide/post-quantum-signing#code-21)을 참고하세요.

### 서버 사이드 대안: `@qorechain/chain-bridge` {#chain-bridge}

브라우저 지갑 없이 완전히 서버 사이드에서 동작하는 핫월렛 워커의 경우, **`@qorechain/chain-bridge`**(npm)가 키 파생, 하이브리드 서명, 브로드캐스트까지 전체 흐름을 하나의 호출로 감쌉니다. 순수 JavaScript로 작성되어(네이티브 애드온 없음) 서버리스 워커에 적합합니다:

```js
import { ChainBridge } from "@qorechain/chain-bridge";

const bridge = new ChainBridge({
  cosmosRpc: "https://rpc.qore.host",       // or your own node
  cosmosRest: "https://api.qore.host",      // used to pick the network's hybrid sign-bytes form (required on mainnet and testnet)
  chainId: "qorechain-vladi",
  signerMnemonic: process.env.HOT_WALLET_MNEMONIC,  // from your secrets manager
});

// One call: derives the canonical ML-DSA-87 key, hybrid-signs the MsgSend, and broadcasts.
// Amounts are in uqor (6 decimals). Register the key beforehand with bridge.registerPqc({ mnemonic }).
const { txHash } = await bridge.sendTokens({
  to: "qor1recipient...",
  amountUqor: "1000000",   // 1 QOR
});
```

계정에 아직 등록된 키가 없으면 라이브러리가 직접 명시적인 `MsgRegisterPQCKeyV2` 트랜잭션을 보내고 한 번 재시도합니다. 이는 체인의 동작이 아니라 라이브러리의 동작이므로, 핫월렛 레일은 키를 미리 등록하고 첫 출금 전에 확인(`GET /qorechain/pqc/v1/account/{address}`)해야 합니다. `chain-bridge` 0.2.3부터는 `cosmosRest`를 설정하면 네트워크가 v3.2.3을 적용한 뒤 등록 트랜잭션에 소유 증명이 포함되며, 라이브러리는 재등록에 앞서 체인을 읽어 계정에 이미 키가 있고 그 키가 니모닉의 표준 키도 레거시 키도 아니면 `pqc_key_mismatch`를 던지고 아무것도 전송하지 않습니다(반복 등록은 수수료만 소모하고 거부됩니다). `chain-bridge`(≥0.1.1)는 스택의 나머지 부분과 동일한 표준 주소 결합 PQC 파생 방식을 사용합니다 — `SHAKE-256("qorechain:pqc:v1|address|mnemonic")` — 따라서 니모닉으로부터 `qorechaind tx pqc recover-key`를 통해 키를 복구할 수 있습니다. 이전 버전 도구로 등록된 계정도 자동으로 처리되며(레거시 키 폴백), [`MsgRotatePQCKey`](/developer-guide/post-quantum-signing#key-rotation)를 통해 표준 키로 한 번에 마이그레이션할 수 있습니다.

## 경로 B — EVM {#path-b-evm}

`https://evm.qore.host`(체인 ID **9801**) 또는 자체 노드의 8545 포트를 대상으로 하는 표준 Ethereum 통합입니다.

* **소수 자릿수:** EVM 레일에서 네이티브 QOR은 **18 소수 자릿수**입니다(1 uqor = 10¹² wei). 이를 잘못 처리하면 입금이 10¹² 배로 잘못 인정됩니다.
* **입금:** `eth_getBlockByNumber`로 블록을 스캔하여 여러분의 주소로의 네이티브 전송을 찾고, `eth_getTransactionReceipt`(`status == 0x1`)로 확인하세요. 입금자 본인의 EVM 트랜잭션에도 창 규칙이 적용되므로, 등록된 키가 없거나 열려 있는 창이 없는 계정의 사용자는 EVM 레인에서 입금을 보낼 수 없으며(대신 Cosmos 레인을 사용할 수 있습니다), 체인 ID 없이 서명된 트랜잭션(EIP-155 이전)은 즉시 거부됩니다. 창은 범위가 제한될 수 있으므로(`native_only`, `allowed_targets`), 통과된 입금은 항상 네이티브 전송이거나 창이 허용하는 호출입니다. 그래도 가정하지 말고 영수증을 읽으세요.
* **출금:** 표준 secp256k1 / EIP-155 서명이지만, **등록된 ML-DSA-87 키와 열려 있는 EVM 승인 창이 있는 계정에서만** 가능합니다(v3.2.0부터. [EVM 승인 창](/developer-guide/evm-development#evm-window) 및 [첫 트랜잭션](/getting-started/first-transaction#evm-window)의 안내 참고). 창 밖의 트랜잭션은 거부됩니다(codespace `pqc`, 코드 26, 27 또는 28). 창은 하이브리드 서명된 Cosmos 레인 트랜잭션으로 열어야 하므로, 경로 B를 사용해도 양자내성 서명이 필요 없어지지는 않습니다. `max-value`는 창 안에서 예상되는 모든 출금의 금액과 최대 수수료(가스 한도 × 가스당 최대 수수료)를 합한 값을 감당하도록 설정하고(순수 QOR만 보내는 핫월렛이라면 창을 열 때 `--native-only`를 추가하세요), 일괄 처리 도중 핫월렛이 바닥나지 않도록 `GET /qorechain/pqc/v1/evm_window/{address}`를 지켜보세요. 창을 열면 계정의 시퀀스(곧 EVM 논스)가 증가하므로, 논스는 창이 열린 뒤에 읽으세요.
* **가짜 입금 방지:** 영수증 상태를 검증하고, 이동한 값이 인덱싱하지 않는 ERC-20 이벤트가 아니라 **네이티브** 전송인지 확인하며, 자체 노드로 재확인하세요.
* **주소 매핑:** `0x` 주소와 `qor1` 주소는 동일한 계정의 두 가지 인코딩이며 자금이 공유됩니다. [EVM 개발](/developer-guide/evm-development) 참고.

## 경로 C — SVM (Solana 호환) {#path-c-svm}

:::caution SVM 레인 현재 비활성화됨
SVM 실행 레인은 체인 버전 v3.1.89(8월 22일)부터 **트랜잭션 제출에 한해 네트워크 전역에서 현재 비활성화**되어 있습니다 — 이 레인으로 보내는 모든 트랜잭션은 `code 11, "SVM module is disabled"`를 반환합니다. 레인이 재개되기 전까지는 경로 C 위에 입출금 레일을 구축하지 **마세요** — 이는 런타임 파라미터가 아니라 컴파일 타임 비활성화이므로 거버넌스 투표로 다시 켤 수 없으며, 외부 감사가 통과할 때까지는 꺼진 상태로 유지될 것으로 예상됩니다. 대신 **경로 A(Cosmos)** 또는 **경로 B(EVM)**를 사용하세요. 읽기 전용 요청(예: `getBalance`)은 계속 응답할 수 있지만, 트랜잭션 제출이 비활성화된 동안에는 SVM 기반의 입금 감지나 출금 흐름을 구축하지 마세요.
:::

v3.1.82부터 SVM 인터페이스는 **네이티브 QOR**을 제공합니다([SVM 인터페이스의 네이티브 QOR](/developer-guide/svm-development#native-qor) 참고):

* **잔액:** `getBalance`는 lamports를 반환합니다(QOR로 환산하려면 10⁹으로 나눔; 1 uqor = 1,000 lamports).
* **입금:** `getSignaturesForAddress`가 주소의 트랜잭션 이력을 제공하며, System Program 전송이 네이티브 QOR을 이동시킵니다.
* 퍼블릭 엔드포인트(`https://svm.qore.host`, `https://svm-testnet.qore.host`)는 **읽기 전용**입니다. 트랜잭션은 자체 노드를 통해 제출하세요.

## 흐름 요약 {#flow-summary}

| 작업 | 경로 | 서명 필요 여부 |
|---|---|---|
| **입금** (사용자 → 플랫폼) | 자체 동기화 노드에서 여러분의 주소로의 전송을 감시(Cosmos의 경우 + 메모) | 불필요 — 감시만 하면 됨 |
| **출금** (플랫폼 → 사용자) | 전송을 구성하고, 오프라인으로 서명한 뒤, 브로드캐스트 | Cosmos: 하이브리드 PQC · EVM: PQC 승인 창 안에서의 표준 secp256k1 |
| **잔액 / 스윕** | REST / EVM / SVM 잔액 조회 + 전송 | 스윕에만 서명 필요 |

## 관련 문서

* [메인넷 연결하기](/getting-started/connecting-to-mainnet) — 노드 설정, 다운로드, 스냅샷
* [노드 운영하기](/developer-guide/running-a-node) — 배포, 프루닝, 인덱싱
* [양자내성 서명](/developer-guide/post-quantum-signing) — 하이브리드 출금을 뒷받침하는 FIPS-204 라이브러리
* [네트워크](/appendix/networks) — 인터페이스별 체인 ID, 엔드포인트, 소수 자릿수
