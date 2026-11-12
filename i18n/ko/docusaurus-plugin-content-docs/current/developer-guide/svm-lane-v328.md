---
slug: /developer-guide/svm-lane-v328
title: "SVM 레인: 프로그램, 계정, 커스터디 한도 (v3.2.8)"
sidebar_label: SVM 레인 (v3.2.8)
sidebar_position: 10
---

# SVM 레인: 프로그램, 계정, 커스터디 한도 (v3.2.8)

SVM 레인은 QoreChain에서 Solana와 호환되는 부분입니다. Solana 방식의 도구로 컴파일된 프로그램을 배포하고, 데이터 계정을 만들고, 프로그램을 호출할 수 있으며, 같은 네이티브 QOR 잔액이 lamport 단위로 보입니다. 릴리스 **v3.2.8**은 업그레이드 시점에 레인을 닫았고, 거버넌스 투표가 다시 열 때까지 닫힌 상태였습니다. 테스트넷에서는 그 투표(제안 37)가 통과되어 레인이 **열려 있으며**, 커스터디는 거버넌스로 정하는 세 가지 한도로 제한됩니다.

이 페이지는 레인 상태를 읽는 방법, 프로그램, 계정, 렌트가 동작하는 방식, SVM 지갑이 포스트 퀀텀 키를 등록하는 방법, 커스터디 한도의 의미, 지금 실행할 수 있는 예시가 무엇인지를 설명합니다.

:::note 테스트넷이 먼저이며, 제안 37 이후 그곳에서 레인이 열려 있습니다
v3.2.8은 2026년 11월 12일부터 **`qorechain-diana`** 테스트넷에서 실행되고 있습니다. 메인넷(`qorechain-vladi`)은 v3.2.7을 실행하고 있으며(2026년 11월 12일부터) v3.2.8을 아직 적용하지 않았고, **메인넷에서는 레인이 꺼진 상태로 유지됩니다**. 업그레이드는 테스트넷의 레인을 닫았습니다(SVM 쓰기가 실패했고 `MsgRegisterSVMPQCKey`가 거부되었습니다). **거버넌스 제안 37이 통과되어 `qorechain-diana`에서 레인을 열었습니다**. 이 제안은 `enabled: true`로 설정하고, 다른 파라미터는 그대로 두었으며, `MsgExecuteProgram`과 크로스 VM 호출에 걸려 있던 서킷 브레이커 중지를 해제했습니다. 투표 후인 2026년 11월 12일에 확인했을 때 `GET /qorechain/svm/v1/params`는 `enabled: true`를 보여 주었고 서킷 브레이커 목록에는 `/cosmwasm.wasm.v1.MsgStoreCode`만 들어 있었습니다. 공개 SVM JSON-RPC는 계속 읽기 전용입니다. 항상 실시간 상태를 먼저 읽고(다음 절) 추정하지 마세요.
:::

## 왜 중요한가 {#why}

* 레인이 닫혀 있는데 SVM 동작을 제공하는 클라이언트는 사용자에게 거부된 트랜잭션을 안겨 줍니다. 파라미터 하나를 먼저 읽으면 이를 피할 수 있습니다.
* 레인에는 실제 QOR가 들어 있습니다. 프로그램, 프로그램 파생 주소, 데이터 계정에 있는 모든 lamport는 SVM 모듈이 보유한 uqor로 뒷받침됩니다. 세 가지 커스터디 한도가 이 풀을 제한하므로, 발신자에게 자금이 있어도 전송이나 예치가 거부될 수 있습니다.
* 렌트와 크기 한도는 상태를 체인에 유지하는 데 드는 비용을 결정하므로 배포 예산에 포함해야 합니다.

## 레인 상태 읽기 {#lane-state}

레인 상태는 SVM 파라미터의 `enabled` 필드입니다. REST 경로나 노드 CLI로 읽으세요. 같은 응답에 이 페이지의 다른 모든 한도도 들어 있으므로, 한 번의 호출로 배포 규모를 가늠할 수 있습니다.

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params
```

제안 37 통과 후인 2026년 11월 12일 `qorechain-diana`의 응답입니다(HTTP 200).

```json
{"params":{"max_program_size":"10485760","max_account_data_size":"10485760","compute_budget_max":"1400000","lamports_per_byte":"3480","rent_exemption_multi":"2.000000000000000000","enabled":true,"svm_slot_offset":"0","default_sig_scheme":0,"max_cpi":4,"max_custody_uqor":"10000000000","max_custody_hard_uqor":"1000000000000","max_account_excess_uqor":"10000000000"}}
```

Linux 노드(패키지된 macOS 바이너리는 없습니다)에서 같은 조회는 다음과 같습니다.

```bash
qorechaind query svm params --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

Node 18 이상의 TypeScript에서는 다음과 같습니다(이 조회에는 SDK 호출이 필요하지 않습니다).

```ts
const REST = "https://api-testnet.qore.host";

const { params } = await (await fetch(`${REST}/qorechain/svm/v1/params`)).json();
if (!params.enabled) {
  throw new Error("The SVM lane is closed on this network; do not offer SVM actions");
}
console.log("compute units per instruction:", params.compute_budget_max);
```

이 파라미터를 위한 타입 지정 헬퍼(그리고 파라미터 제안을 만드는 안전한 빌더)는 아직 게시되지 않은 v3.2.8 SDK 초안에 포함되어 있습니다. 이후 SDK 릴리스에서 추가되며, 그때까지는 명령줄이나 REST 경로를 사용하세요.

### 클러스터 식별 정보 {#cluster-info}

`cluster_info`는 지갑을 위해 클러스터를 식별하고 실행이 켜져 있는지 알려 줍니다. `execution_enabled` 외에는 레인 상태에 따라 달라지지 않습니다.

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/cluster_info
```

제안 37 통과 후 읽은 2026년 11월 12일의 응답이며 `execution_enabled`가 `true`입니다(HTTP 200).

```json
{"chain_id":"qorechain-diana","genesis_hash":"6Z9pa53SwiprqiAoNCqqUdj5c3C4P1zRw31gQVnF4Czj","caip2_chain_id":"solana:6Z9pa53SwiprqiAoNCqqUdj5c3C4P1zR","derivation":"base58(SHA-256(\"qorechain/svm/genesis-hash/v1\" || 0x00 || chain_id))","execution_enabled":true}
```

노드 CLI에도 같은 조회가 있습니다. `qorechaind query svm cluster-info`입니다. `https://svm-testnet.qore.host`의 JSON-RPC 메서드 `getGenesisHash`는 같은 해시를 반환합니다. 이 해시는 체인 id에서 파생된 것이며 실제 Solana 클러스터의 제네시스 해시가 아닙니다. 이 경로는 메인넷(v3.2.7)에서도 제공됩니다. 2026년 11월 12일 `https://api.qore.host/qorechain/svm/v1/cluster_info`는 `execution_enabled` `false`와 함께 `200`으로 응답했습니다.

## 공개 SVM RPC는 읽기 전용입니다 {#public-rpc}

공개 엔드포인트 `https://svm.qore.host`와 `https://svm-testnet.qore.host`는 읽기에는 응답하고, 레인이 열려 있든 아니든 공개 체인 id에서 쓰기 메서드(`sendTransaction` 등)를 거부합니다. SVM 트랜잭션을 제출하려면 자체 노드를 실행해야 하며, 이 노드는 기본적으로 포트 8899에서 Solana 호환 JSON-RPC를 제공합니다([SVM 개발](/developer-guide/svm-development#json-rpc-server) 참조). 또한 그 노드가 따르는 네트워크에서 레인 자체가 열려 있어야 합니다. 읽기는 지금 동작합니다.

```bash
# Health, version, cluster hash, slot and a rent quote (all HTTP 200 on 12 November 2026)
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth","params":[]}'
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getVersion","params":[]}'
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getGenesisHash","params":[]}'
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getMinimumBalanceForRentExemption","params":[1024]}'
```

`getVersion`은 체인 id, 클러스터 id, 제네시스 해시와 함께 `solana-core` `1.18.0-qorechain`을 보고했습니다. 1,024바이트에 대한 렌트 견적은 2026년 11월 12일에 `8017920` lamport였습니다. REST 경로 `GET /qorechain/svm/v1/account/{address}`, `.../program/{address}`, `.../slot`은 공개 엔드포인트에서 **HTTP 501**(구현되지 않음)로 응답했습니다. 계정과 프로그램은 JSON-RPC 메서드 `getAccountInfo`와 `getMultipleAccounts`로, 또는 노드 CLI로 읽으세요.

## 프로그램 배포와 호출 {#programs}

레인이 열리면 흐름은 다음과 같습니다. 최신 Solana 툴체인으로 SBF 프로그램을 빌드하고, 배포하고, 필요한 계정을 만든 뒤 호출합니다. 모든 `tx svm` 명령은 Cosmos 레인 트랜잭션이므로 명시적인 가스 한도, 최소 가스 곱하기 0.1 uqor의 수수료, 하이브리드 포스트 퀀텀 공동 서명이 필요합니다([양자내성 서명](/developer-guide/post-quantum-signing) 참조).

다음은 노드 레퍼런스의 Linux 노드 CLI 명령입니다. **UNTESTED: 레인은 제안 37 이후에야 테스트넷에서 열렸으며, 이 페이지를 위해 프로그램 배포, 실행, 계정 생성은 실행하지 않았습니다.**

```bash
# 1. Build (platform-tools v1.53, --arch v0 or --arch v3)
cargo build-sbf --arch v3

# 2. Deploy; the response carries the program id in base58
qorechaind tx svm deploy-program ./my_program.so --from mykey \
  --gas 2000000 --fees 200000uqor --chain-id qorechain-diana --generate-only > tx.json
qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana

# 3. Create a data account owned by the program (space in bytes, lamports for rent)
qorechaind tx svm create-account <owner-base58> <space> <lamports> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-diana --generate-only > tx.json

# 4. Call the program
qorechaind tx svm execute <program-id-base58> <data-hex> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-diana --generate-only > tx.json
```

노드에서의 읽기는 레인 상태와 관계없이 사용할 수 있습니다.

```bash
qorechaind query svm account <base58-address>
qorechaind query svm program <base58-address>
qorechaind query svm params
qorechaind query svm slot
```

### @qorechain/svm 0.13.0을 사용하는 TypeScript {#typescript}

`@qorechain/svm`은 `@solana/web3.js` 위의 얇은 계층입니다. 로더 래퍼는 없습니다. 배포에는 위의 노드 CLI를 사용하고, 이미 존재하는 프로그램에 명령을 만들어 보내는 데 이 패키지를 사용하세요. 공개 프리셋은 의도적으로 SVM 엔드포인트를 설정하지 않으므로, 자체 노드의 URL을 지정하세요.

```ts
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  createSvmClient,
  createInvokeInstruction,
  withComputeBudget,
  svmKeypairFromSecretKey,
} from "@qorechain/svm";

const client = createSvmClient({ rpcUrl: "http://127.0.0.1:8899" }); // your own node

const payer = svmKeypairFromSecretKey(secretKey64);       // 64-byte Solana-style secret key
const programId = new PublicKey("<program-id-base58>");
const dataAccount = new PublicKey("<data-account-base58>");

const tx = new Transaction().add(
  createInvokeInstruction(
    programId,
    [{ pubkey: dataAccount, isSigner: false, isWritable: true }],
    Uint8Array.from([0]),                                  // your program's instruction data
  ),
);
withComputeBudget(tx, { units: 200_000 });                 // stay under compute_budget_max

const sim = await client.simulateTransaction(tx);          // dry run first
const signature = await client.sendTransaction(tx, [payer]);
```

**UNTESTED:** 이 예시에는 직접 실행하는 노드가 필요합니다(테스트넷에서 레인은 열려 있습니다). 공개 엔드포인트에 대해서는 전송이 거부됩니다. `createSvmClient({ rpcUrl })`이 어떤 URL이든 받으므로, 읽기 전용 호출(`client.getBalance`, `client.getAccountInfo`, `client.getSignaturesForAddress`)은 `https://svm-testnet.qore.host`에 대해 동작합니다.

Python, Go, Rust, Java의 경우 해당 언어의 SVM 어댑터가 같은 메시지를 만들며, v3.2.8 헬퍼는 이후 SDK 릴리스에서 추가됩니다. 그때까지는 위의 노드 CLI나 원시 메시지를 사용하세요. 메서드 집합이 Solana와 호환되므로 어떤 Solana 클라이언트 라이브러리든 자체 노드의 포트 8899와 통신할 수 있습니다.

## 계정과 렌트 {#rent}

SVM 데이터 계정은 사용하는 공간에 대한 비용을 냅니다. 숫자는 위의 실시간 파라미터에서 가져옵니다.

| 항목 | 규칙 | 실시간 값(테스트넷) |
| ---- | ---- | -------------------- |
| 연간 렌트 | 데이터 크기(바이트)에 `lamports_per_byte`를 곱한 값 | 바이트당 3,480 lamport |
| 렌트 면제 최소 금액 | 연간 렌트에 `rent_exemption_multi`를 곱한 값 | 승수 2.0 |
| 최소 금액 이상으로 충전됨 | 렌트가 청구되지 않음 | |
| 최소 금액 미만으로 충전됨 | 에포크마다 렌트가 차감됨 | |
| 잔액이 0에 도달 | 계정이 제거됨 | |

lamport와 uqor의 관계는 1 uqor = 1,000 lamport입니다. 최소 금액은 직접 계산하지 말고 노드에 물어보세요. `getMinimumBalanceForRentExemption`은 1,024바이트에 대해 8,017,920 lamport를 반환했습니다(견적에는 계정 헤더가 포함됩니다). `create-account`에는 최소한 그만큼의 lamport가 필요하며, 그렇지 않으면 계정이 렌트 면제 상태가 아닙니다.

주소: 계정의 SVM 주소는 20바이트 계정 바이트를 32바이트로 패딩하여 base58로 쓴 것입니다. `qor1...`, `0x...`, base58 형식은 모두 같은 계정을 가리킵니다.

## SVM 지갑을 위한 포스트 퀀텀 키 {#pqc-key}

체인에 포스트 퀀텀 키를 두고 싶은 SVM 지갑은 **`MsgRegisterSVMPQCKey`**로 이를 등록합니다. 이 메시지에는 발신자, 32바이트 SVM 주소, ML-DSA-87 공개 키가 담깁니다. Cosmos 레인 메시지이므로 발신자는 다른 모든 네이티브 트랜잭션처럼 하이브리드로 서명합니다. 레인이 닫혀 있는 동안에는 거부되며, **키를 등록하기 전에 SVM 계정이 이미 존재해야 합니다**([테스트넷에서 검증한 내용](#tested)의 거부 사례 참조).

이를 위한 `tx svm` 명령은 없습니다. SDK 컴포저를 사용하세요. TypeScript에서 컴포저는 `@qorechain/sdk`의 `msg.svm.registerSvmPqcKey`입니다. **이미 존재하는 계정에 대해서는 UNTESTED: 유일한 전송은 계정이 없는 주소에 대한 것이었고 거부되었습니다.**

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  msg,
} from "@qorechain/sdk";
import { fromBech32 } from "@cosmjs/encoding";

const client = createClient({
  network: "testnet",
  endpoints: { rest: "https://api-testnet.qore.host", rpc: "https://rpc-testnet.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);
const tx = await client.connectTx(signer, { pqcKeypair });   // signs hybrid

// 20 account bytes padded with zeros to the 32-byte SVM address
const svmAddr = new Uint8Array(32);
svmAddr.set(fromBech32(account.address).data);

await tx.signAndBroadcast(
  [msg.svm.registerSvmPqcKey({ sender: account.address, svmAddr, pqcPubKey: pqcKeypair.publicKey })],
  "auto",
);
```

Python 컴포저는 `msg.svm.register_svm_pqc_key(sender=, ...)`이고 Go는 `Svm.RegisterPQCKey(sender, svmAddr, pqcPubKey)`입니다.

## 커스터디 한도 {#custody}

프로그램, 프로그램 파생 주소, 데이터 계정이 보유한 모든 lamport는 SVM 모듈이 커스터디라고 부르는 하나의 풀에 보관하는 uqor로 뒷받침됩니다. 거버넌스로 정하는 세 가지 파라미터가 이를 제한합니다. 세 가지 모두 uqor 단위이며 1 QOR는 1,000,000 uqor입니다. 거버넌스는 파라미터 제안으로 이를 변경하며, 제안은 집합 전체를 교체하므로 열두 개 필드를 모두 보내야 합니다.

| 파라미터 | 실시간 값 | 쉽게 말하면 |
| --------- | ---------- | -------------- |
| `max_custody_uqor` | 10,000,000,000(10,000 QOR) | SVM 풀 잔액의 상한. 풀을 이 값 위로 올리는 전송은 `svm custody cap exceeded`(코드 23)로 거부됩니다. `0`은 상한 없음을 뜻합니다. |
| `max_custody_hard_uqor` | 1,000,000,000,000(1,000,000 QOR) | 렌트 준비금, 선충전, 단순 기부를 포함한 풀의 원시 잔액에 대한 절대 상한. 잔액이 이 값을 넘게 되는 작업은 거부됩니다. `max_custody_uqor`보다 작아서는 안 되며, 레인을 열려면 0보다 커야 합니다. |
| `max_account_excess_uqor` | 10,000,000,000(10,000 QOR) | 데이터 계정 하나가 렌트 면제 최소 금액을 넘어 보유할 수 있는 최대 금액. `0`은 계정별 상한 없음을 뜻합니다. |

애플리케이션에 주는 의미는 다음과 같습니다. SVM 계정에 맡기는 가치는 적당하게 유지하고, 렌트 최소 금액을 넘는 부분은 필요한 만큼만 두세요. 잔액에 문제가 없는 예치도 풀 전체가 상한에 가까우면 거부될 수 있으므로, 코드 23은 잘못된 트랜잭션이 아니라 "나중에 또는 더 적은 금액으로 시도하라"는 뜻으로 취급하세요. 한도는 거버넌스 투표로만 늘어날 수 있으며 사용자 트랜잭션으로는 절대 늘어나지 않습니다.

## 컴퓨트 예산과 크기 한도 {#limits}

| 한도 | 파라미터 | 실시간 값(테스트넷) |
| ----- | --------- | -------------------- |
| 명령당 컴퓨트 유닛 | `compute_budget_max` | 1,400,000 |
| 프로그램 크기(ELF) | `max_program_size` | 10,485,760바이트(10 MiB) |
| 데이터 계정 크기 | `max_account_data_size` | 10,485,760바이트(10 MiB) |
| 중첩 프로그램 호출 | `max_cpi` | 4 |
| 기본 서명 방식 | `default_sig_scheme` | 0(Ed25519) |
| 슬롯 오프셋 | `svm_slot_offset` | 0(슬롯은 블록 높이에 오프셋을 더한 값) |

각 프레임에는 32 KiB 스택과 256 KiB 힙이 있습니다. 위 값은 거버넌스로 바뀔 수 있으므로 실시간으로 읽으세요. `@qorechain/svm` 0.13.0에서 `withComputeBudget(tx, { units })`는 컴퓨트 유닛 한도를 요청하며, `compute_budget_max` 이하로 유지하세요.

## 테스트넷 SVM 엔드포인트의 현재 제한 {#endpoint-limits}

레인은 열려 있지만 공개 SVM JSON-RPC는 아직 완전한 Solana 노드처럼 동작하지 않습니다. 다음 제한을 감안해 계획하세요.

- **`getLatestBlockhash`는 블록해시를 64자리 16진수 문자로 반환합니다.** Solana 노드처럼 base58이 아닙니다(2026년 11월 12일에 읽은 값: `blockhash` `e8d4...d449`, `lastValidBlockHeight` 9944659). base58을 기대하는 클라이언트는 변환해야 합니다. 체인 팀이 변경을 예정해 두었습니다.
- **표준 Solana 도구의 Solana 와이어 형식 `sendTransaction`은 공개 엔드포인트에서 아직 지원되지 않습니다.** 프로그램은 Cosmos 메시지 `MsgDeployProgram`과 `MsgExecuteProgram`으로 배포하고 호출하며, 다른 Cosmos 레인 트랜잭션처럼 하이브리드 서명으로 서명합니다(위의 TypeScript 헬퍼 참조). Solana 도구와의 완전한 동등성은 이후 릴리스에서 계획되어 있습니다.
- **외부 키가 릴레이어를 통해 SVM 동작을 승인할 수 있습니다.** 네트워크가 프로토콜 기능 `svm-relayed-chain-bound`를 활성화하면 승인은 체인에 묶인 다이제스트(도메인 `qorechain-svm-auth-v3`)에 서명합니다. `@qorechain/wallet-adapter` 0.6.0은 `authSignBytesV3`로 이를 만들고, `resolveSvmAuthVersion`은 네트워크가 어느 형식을 원하는지 읽습니다.

## 오류와 거부 {#errors}

| 표시되는 내용 | 의미 | 해야 할 일 |
| ------------ | ------- | ---------- |
| `SVM module is disabled`(코드 11) | 레인이 닫혀 있음(메인넷, 또는 제안 37 이전의 테스트넷) | `enabled`를 읽으세요. 재시도하지 마세요 |
| `SVM account ... not found`와 함께 거부된 `MsgRegisterSVMPQCKey`(코드스페이스 `svm`, 코드 3) | SVM 계정이 아직 존재하지 않음 | 먼저 계정을 만든 다음 키를 등록하세요 |
| 레인이 닫혀 있는 동안 거부된 `MsgRegisterSVMPQCKey` | 레인이 닫혀 있음 | 레인이 열린 후에 등록하세요 |
| `svm.qore.host` 또는 `svm-testnet.qore.host`에서 쓰기 메서드 거부 | 공개 엔드포인트는 읽기 전용 | 자체 노드를 사용하세요 |
| `svm custody cap exceeded`(코드 23) | 풀이 상한에 도달함 | 나중에 또는 더 적은 금액으로 다시 시도하세요 |
| `airdrop rate limit exceeded`(코드 19) | `requestAirdrop`을 너무 자주 호출함(테스트넷 전용) | 기다리세요 |
| `blockhash expired`(코드 20) | 최근 블록해시가 너무 오래됨 | 새 것을 가져와 다시 서명하세요 |
| `svm simulation slots busy, retry later`(코드 24) | 시뮬레이션은 제한되어 있으며 블록 안에서는 발생하지 않음 | 시뮬레이션을 다시 시도하세요 |
| `/qorechain/svm/v1/account/...`에서 HTTP 501 | 공개 엔드포인트에서 구현되지 않은 경로 | `getAccountInfo`를 사용하세요 |

## 테스트넷에서 검증한 내용 {#tested}

제안 37 통과 후인 2026년 11월 12일 `qorechain-diana`(릴리스 v3.2.8)에서 실행했습니다.

| 단계 | 결과 |
| ---- | ------ |
| `GET /cosmos/circuit/v1/disable_list` | `/cosmwasm.wasm.v1.MsgStoreCode`만 있음 |
| `GET /qorechain/svm/v1/params` | `enabled` true, `max_program_size` 10485760, `max_account_data_size` 10485760, `compute_budget_max` 1400000, `lamports_per_byte` 3480, `rent_exemption_multi` 2, `max_cpi` 4, `max_custody_uqor` 10000000000, `max_custody_hard_uqor` 1000000000000, `max_account_excess_uqor` 10000000000 |
| 아직 존재하지 않는 SVM 주소에 대한 `MsgRegisterSVMPQCKey` | 거부됨: 코드스페이스 `svm` 코드 3, `SVM account ... not found: SVM account not found`. 포스트 퀀텀 키를 등록하기 전에 계정이 존재해야 합니다 |

실행하지 않은 것(UNTESTED): 프로그램 배포, 프로그램 실행, SVM 계정 생성.

## 메인넷 {#mainnet}

메인넷은 당분간 SVM 레인이 꺼진 채 v3.2.7에 머물며, 메인넷에서 이를 활성화하려면 이후 릴리스와 거버넌스 투표가 필요합니다. 테스트넷만을 기준으로 계획하세요.

## 함께 보기 {#see-also}

* [SVM 개발](/developer-guide/svm-development): 레인 개요, JSON-RPC 서버, lamport로 표현되는 네이티브 QOR.
* [Solana 호환 JSON-RPC](/api-reference/json-rpc-solana-compatible): 메서드 목록.
* [양자내성 서명](/developer-guide/post-quantum-signing): 모든 네이티브 레인 트랜잭션에 필요한 하이브리드 서명.
* [크로스 VM 상호운용성](/developer-guide/cross-vm-interoperability): SVM, EVM, QoreChain Native 간의 호출.
* [노드 운영자: v3.2.8 체크리스트](/developer-guide/node-operators-v328): 노드 업그레이드.
