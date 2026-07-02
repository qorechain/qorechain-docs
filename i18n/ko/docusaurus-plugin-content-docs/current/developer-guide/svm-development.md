---
slug: /developer-guide/svm-development
title: SVM 개발
sidebar_label: SVM 개발
sidebar_position: 4
---

# SVM 개발

QoreChain은 **Solana 가상 머신(SVM)** 실행 환경을 포함하고 있어, 개발자가 익숙한 Solana 도구를 사용하여 SBF/BPF 프로그램을 배포하고 실행할 수 있습니다. SVM 모듈은 **포트 8899**에서 Solana 호환 JSON-RPC 인터페이스를 제공하며, `qorechaind start`가 이를 자동으로 시작합니다(아래 [JSON-RPC 서버](#json-rpc-server) 참조).

:::note
아래 명령어는 2026년 6월 7일부터 가동 중이며 체인 버전 **v3.1.82**를 실행하는 **`qorechain-vladi`** 메인넷을 사용합니다. 테스트넷의 경우 `--chain-id qorechain-diana`로 대체하세요.
:::

---

## 개요

`x/svm` 모듈은 다음을 제공합니다:

* **네이티브 QOR를 SVM의 일급 자산으로 지원** — 계정의 통합 잔액을 lamports 단위로 확인 가능
* SBF/BPF 프로그램 배포 및 실행
* 데이터 계정 생성 및 관리
* Solana 호환 JSON-RPC 엔드포인트
* QoreChain과 Solana 주소 형식 간의 양방향 주소 매핑
* 컴퓨트 예산 계량 및 렌트(rent) 기반 스토리지 경제 모델

---

## SVM 인터페이스의 네이티브 QOR {#native-qor}

체인 버전 **v3.1.82**부터 SVM 인터페이스는 별도의 샌드박스 잔액이 아닌 **일급 네이티브 QOR 인터페이스**입니다. 계정의 하나의 통합 잔액 — Cosmos 인터페이스에서는 `uqor`로, EVM에서는 18자리 소수점의 wei로 표시되는 동일한 자금 — 이 SVM 측에서는 **lamports**(소수점 9자리)로 표시됩니다:

```
1 uqor = 1,000 lamports    ·    1 QOR = 1,000,000,000 lamports
```

* **`getBalance` / `getAccountInfo`** 는 계정의 네이티브 QOR(lamports 단위)를 반환합니다.
* **`getSignaturesForAddress`** 는 특정 주소와 관련된 트랜잭션 히스토리를 반환합니다 — 표준 Solana 도구를 사용한 입금 감지에 활용할 수 있습니다.
* **System Program 전송은 네이티브 QOR를 이동시킵니다** — Solana 방식의 전송 명령은 Cosmos `MsgSend`나 EVM 전송이 이동시키는 것과 동일한 자금을 이동시킵니다.
* **SVM 주소 형식** — 계정의 SVM 주소는 20바이트의 계정 바이트를 32바이트로 오른쪽 패딩한 후 base58로 인코딩한 값입니다. 세 가지 주소 형식(`qor1...`, `0x...`, base58) 모두 동일한 계정을 가리킵니다.

공개 엔드포인트(`https://svm.qore.host`, `https://svm-testnet.qore.host`)는 **읽기 전용**이며, 엣지에서 트랜잭션 제출이 비활성화되어 있습니다. SVM 트랜잭션을 제출하려면 자체 노드(포트 8899)를 운영하세요.

---

## JSON-RPC 서버 {#json-rpc-server}

Solana 호환 JSON-RPC 서버는 **`qorechaind start`에 의해 시작**되며 **기본적으로 활성화**되어 있습니다. `app.toml`의 `[svm-rpc]` 섹션을 통해 구성합니다:

```toml
[svm-rpc]
# Enable the Solana-compatible JSON-RPC server
enable = true
# Address the server listens on
address = "127.0.0.1:8899"
```

기본값은 `enable = true`와 `address = "127.0.0.1:8899"`이므로, 새로 시작한 노드는 이미 포트 8899에서 Solana JSON-RPC 인터페이스를 제공합니다 — `@solana/web3.js`는 별도 설정 없이 `http://127.0.0.1:8899`로 연결됩니다. `getVersion`은 `1.18.0-qorechain`을 보고하며, `getBalance` / `getAccountInfo`는 실시간 온체인 SVM 계정 정보를 반환합니다.

| 속성          | 값                        |
| ------------- | ------------------------- |
| 기본 URL      | `http://127.0.0.1:8899`   |
| 활성화 여부   | 예, 기본값                |
| 시작 주체     | `qorechaind start`        |
| 호환성        | Solana JSON-RPC (부분 집합) |
| `getVersion`  | `1.18.0-qorechain`        |

### 지원되는 메서드

| 메서드                              | 설명                                      |
| ----------------------------------- | ----------------------------------------- |
| `getAccountInfo`                    | 계정 데이터 및 lamport 잔액 조회          |
| `getBalance`                        | 계정 잔액을 lamports 단위로 조회(네이티브 QOR) |
| `getSignaturesForAddress`           | 주소의 트랜잭션 히스토리                  |
| `getSlot`                           | 현재 슬롯 번호                            |
| `getMinimumBalanceForRentExemption` | 지정된 데이터 크기에 대한 최소 잔액       |
| `getVersion`                        | SVM 런타임 버전 정보                      |
| `getHealth`                         | SVM 엔드포인트 상태 확인                  |

---

## 프로그램 배포 및 상호작용

:::info
**최신 SBF 실행 지원.** SVM 실행 엔진은 **solana-sbpf 0.21.1**로 현대화되어, 현재 Solana 툴체인(**platform-tools v1.53 / agave 4.x**)으로 새로 컴파일한 SBF 프로그램의 **배포와 실행이 모두** QoreChain에서 가능합니다 — 배포 전용이 아니라 실행까지 완전히 지원됩니다. `cargo build-sbf --arch v0` 또는 `--arch v3`로 빌드한 프로그램 모두 지원됩니다.
:::

1. **SBF 프로그램 배포** — 현재 platform-tools(v1.53 / agave 4.x)로 Solana 프로그램을 SBF 공유 객체로 컴파일한 후 QoreChain에 배포합니다:

   ```bash
   # Build with the current Solana toolchain (--arch v0 or --arch v3)
   cargo build-sbf --arch v3

   # Deploy the compiled program
   qorechaind tx svm deploy-program ./my_program.so \
     --from mykey \
     --gas auto \
     --gas-adjustment 1.3 \
     -y
   ```

   트랜잭션 응답에는 base58 형식의 **프로그램 ID**가 포함됩니다.

2. **명령(Instruction) 실행** — 명령 데이터와 함께 온체인 BPF 프로그램을 호출합니다:

   ```bash
   # Execute instruction
   qorechaind tx svm execute <program-id-base58> <data-hex> \
     --from mykey \
     --gas auto \
     -y
   ```

   | 매개변수            | 형식              | 설명                           |
   | ------------------- | ----------------- | ------------------------------ |
   | `program-id-base58` | Base58 문자열     | 배포된 프로그램의 주소         |
   | `data-hex`          | 16진수 인코딩 바이트 | 직렬화된 명령 데이터        |

3. **데이터 계정 생성** — 프로그램은 종종 상태 저장을 위한 계정이 필요합니다. 지정된 크기와 소유자로 계정을 생성합니다:

   ```bash
   # Create data account
   qorechaind tx svm create-account <owner-base58> <space> <lamports> \
     --from mykey \
     --gas auto \
     -y
   ```

   | 매개변수       | 설명                                               |
   | -------------- | -------------------------------------------------- |
   | `owner-base58` | 이 계정을 소유하는 프로그램(base58)                |
   | `space`        | 데이터 필드의 크기(바이트 단위)                    |
   | `lamports`     | 초기 잔액(렌트 면제 최소값 이상이어야 함)          |

   지정된 크기에 대한 최소 렌트 면제 잔액을 조회합니다:

   ```bash
   # RPC: getMinimumBalanceForRentExemption
   curl -X POST http://localhost:8899 \
     -H "Content-Type: application/json" \
     -d '{
       "jsonrpc": "2.0",
       "id": 1,
       "method": "getMinimumBalanceForRentExemption",
       "params": [1024]
     }'
   ```

4. **@solana/web3.js 사용** — Solana JavaScript SDK는 QoreChain SVM 엔드포인트와 직접 연동됩니다:

   ```javascript
   import { Connection, PublicKey } from "@solana/web3.js";

   const connection = new Connection("http://127.0.0.1:8899");

   // Check health
   const health = await connection.getHealth();
   console.log("SVM health:", health);

   // Get slot
   const slot = await connection.getSlot();
   console.log("Current slot:", slot);

   // Get account info
   const pubkey = new PublicKey("YourBase58ProgramId...");
   const accountInfo = await connection.getAccountInfo(pubkey);
   console.log("Account data:", accountInfo);

   // Get balance
   const balance = await connection.getBalance(pubkey);
   console.log("Balance (lamports):", balance);
   ```

---

## 주소 매핑

QoreChain은 네이티브 Bech32 주소(`qor1...`)와 Solana 스타일 base58 주소 간의 **양방향 주소 매핑**을 유지합니다:

| 방향              | 예시                                                       |
| ----------------- | ---------------------------------------------------------- |
| 네이티브 → SVM    | `qor1abc...xyz`는 결정론적 base58 주소로 매핑됩니다        |
| SVM → 네이티브    | Base58 프로그램 주소는 대응하는 `qor1...` 주소로 역매핑됩니다 |

이 매핑은 결정론적이며 `x/svm` 모듈이 관리합니다. 두 표현 모두 동일한 기저 계정을 가리킵니다.

---

## 렌트 모델

SVM 모듈은 상태 비대화를 방지하기 위해 **렌트 기반 스토리지 모델**을 사용합니다:

| 매개변수                     | 값         |
| ---------------------------- | ---------- |
| 바이트당 연간 lamports       | `3,480`    |
| 렌트 면제 배수               | `2.0`      |
| 징수 주기                    | 매 에포크  |

* 잔액이 `2 * (data_size * 3480 / seconds_per_year)` lamports를 **초과**하는 계정은 **렌트 면제** 대상이며 렌트가 부과되지 않습니다.
* 렌트 면제 기준 **미만**인 계정은 매 에포크마다 렌트가 부과됩니다. 잔액이 0이 되면 계정은 삭제됩니다.

:::info
**모범 사례:** 예기치 않은 계정 삭제를 방지하려면 데이터 계정에 항상 렌트 면제 최소값 이상의 자금을 예치하세요.
:::

---

## 컴퓨트 예산

각 명령 실행은 컴퓨트 단위(compute units)로 계량됩니다:

| 매개변수                                  | 값          |
| ----------------------------------------- | ----------- |
| 명령당 최대 컴퓨트 단위                   | `1,400,000` |
| 최대 CPI(교차 프로그램 호출) 깊이         | `4`         |
| 최대 프로그램 크기                        | `10 MB`     |
| 최대 계정 데이터 크기                     | `10 MB`     |

컴퓨트 예산을 초과하는 프로그램은 중단되고 해당 트랜잭션은 되돌려집니다.

---

## 매개변수 요약

| 매개변수                    | 값           |
| --------------------------- | ------------ |
| `max_program_size`          | 10 MB        |
| `max_account_data_size`     | 10 MB        |
| `compute_budget_max`        | 1,400,000 CU |
| `max_cpi_depth`             | 4            |
| `lamports_per_byte_year`    | 3,480        |
| `rent_exemption_multiplier` | 2.0          |
| JSON-RPC 포트               | 8899         |

---

## 크로스 VM 상호운용성

SVM 프로그램은 **비동기** 크로스 VM 메시지 경로를 통해 EVM 및 CosmWasm 컨트랙트와 통신할 수 있습니다:

```bash
# Cross-VM call example
qorechaind tx crossvm call \
  --source-vm svm \
  --target-vm evm \
  --target-contract 0x1234...abcd \
  --payload '...' \
  --from mykey \
  -y
```

메시지는 큐에 저장된 후 EndBlocker에 의해 처리됩니다. 메시지 수명 주기와 타임아웃 동작에 대한 자세한 내용은 [크로스 VM 상호운용성](/developer-guide/cross-vm-interoperability)을 참조하세요.

---

## 다음 단계

* [크로스 VM 상호운용성](/developer-guide/cross-vm-interoperability) — SVM, EVM, CosmWasm 간의 통신
* [EVM 개발](/developer-guide/evm-development) — QoreChain에서의 Solidity 스마트 컨트랙트
* [CosmWasm 개발](/developer-guide/cosmwasm-development) — Rust 기반 WebAssembly 컨트랙트
