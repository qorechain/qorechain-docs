---
slug: /developer-guide/svm-development
title: SVM 개발
sidebar_label: SVM 개발
sidebar_position: 4
---

# SVM 개발

QoreChain에는 **Solana Virtual Machine(SVM)** 실행 환경이 포함되어 있어, 개발자가 익숙한 Solana 도구를 사용하여 SBF/BPF 프로그램을 배포하고 실행할 수 있습니다. SVM 모듈은 **포트 8899**에서 Solana 호환 JSON-RPC 인터페이스를 노출하며, `qorechaind start`가 이를 자동으로 실행합니다(아래 [JSON-RPC 서버](#json-rpc-server) 참조).

:::note
아래 명령은 2026년 6월 7일부터 운영 중이며 체인 버전 **v3.1.77**을 실행하는 **`qorechain-vladi`** 메인넷을 사용합니다. 테스트넷의 경우 `--chain-id qorechain-diana`로 대체하세요.
:::

---

## 개요

`x/svm` 모듈은 다음을 제공합니다.

* SBF/BPF 프로그램 배포 및 실행
* 데이터 계정 생성 및 관리
* Solana 호환 JSON-RPC 엔드포인트
* QoreChain과 Solana 주소 형식 간의 양방향 주소 매핑
* 컴퓨팅 예산 측정 및 임대료 기반 스토리지 경제

---

## JSON-RPC 서버 {#json-rpc-server}

Solana 호환 JSON-RPC 서버는 **`qorechaind start`에 의해 시작**되며 **기본적으로 활성화**되어 있습니다. `app.toml`의 `[svm-rpc]` 섹션을 통해 구성됩니다.

```toml
[svm-rpc]
# Enable the Solana-compatible JSON-RPC server
enable = true
# Address the server listens on
address = "127.0.0.1:8899"
```

기본값은 `enable = true` 및 `address = "127.0.0.1:8899"`이므로, 갓 시작한 노드는 이미 포트 8899에서 Solana JSON-RPC 인터페이스를 제공합니다. `@solana/web3.js`는 추가 설정 없이 `http://127.0.0.1:8899`에서 연결됩니다. `getVersion`은 `1.18.0-qorechain`을 보고하며, `getBalance` / `getAccountInfo`는 실시간 온체인 SVM 계정을 반환합니다.

| 속성          | 값                        |
| ------------- | ------------------------- |
| 기본 URL      | `http://127.0.0.1:8899`   |
| 활성화        | 예, 기본값                |
| 시작 주체     | `qorechaind start`        |
| 호환성        | Solana JSON-RPC (서브셋)  |
| `getVersion`  | `1.18.0-qorechain`        |

### 지원되는 메서드

| 메서드                              | 설명                                      |
| ----------------------------------- | ----------------------------------------- |
| `getAccountInfo`                    | 계정 데이터 및 lamport 잔액 조회          |
| `getBalance`                        | lamport 단위의 계정 잔액 조회             |
| `getSlot`                           | 현재 슬롯 번호                            |
| `getMinimumBalanceForRentExemption` | 주어진 데이터 크기에 대한 최소 잔액       |
| `getVersion`                        | SVM 런타임 버전 정보                      |
| `getHealth`                         | SVM 엔드포인트 상태 점검                  |

---

## 프로그램 배포 및 상호작용

:::info
**최신 SBF 실행.** SVM 실행 엔진은 **solana-sbpf 0.21.1**로 현대화되었으므로, 현재 Solana 툴체인(**platform-tools v1.53 / agave 4.x**)으로 갓 컴파일한 SBF 프로그램이 QoreChain에서 **배포되고 실행됩니다** — 실행은 배포 전용이 아니라 완전히 지원됩니다. `cargo build-sbf --arch v0` 또는 `--arch v3`로 빌드한 프로그램이 모두 지원됩니다.
:::

1. **SBF 프로그램 배포** — 현재 platform-tools(v1.53 / agave 4.x)로 Solana 프로그램을 SBF 공유 객체로 컴파일한 다음 QoreChain에 배포하세요.

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

2. **인스트럭션 실행** — 인스트럭션 데이터로 온체인 BPF 프로그램을 호출합니다.

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
   | `data-hex`          | Hex 인코딩 바이트 | 직렬화된 인스트럭션 데이터     |

3. **데이터 계정 생성** — 프로그램은 종종 상태를 저장할 계정이 필요합니다. 지정된 크기와 소유자로 계정을 생성하세요.

   ```bash
   # Create data account
   qorechaind tx svm create-account <owner-base58> <space> <lamports> \
     --from mykey \
     --gas auto \
     -y
   ```

   | 매개변수       | 설명                                                |
   | -------------- | --------------------------------------------------- |
   | `owner-base58` | 이 계정을 소유하는 프로그램(base58)                 |
   | `space`        | 데이터 필드의 크기(바이트)                          |
   | `lamports`     | 초기 잔액(임대료 면제 최소값을 충족해야 함)         |

   주어진 크기에 대한 임대료 면제 최소 잔액을 조회하세요.

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

4. **@solana/web3.js 사용** — Solana JavaScript SDK는 QoreChain SVM 엔드포인트와 직접 작동합니다.

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

QoreChain은 네이티브 Bech32 주소(`qor1...`)와 Solana 스타일 base58 주소 간의 **양방향 주소 매핑**을 유지합니다.

| 방향          | 예시                                                       |
| ------------- | ---------------------------------------------------------- |
| 네이티브 → SVM | `qor1abc...xyz`가 결정론적 base58 주소로 매핑됨            |
| SVM → 네이티브 | base58 프로그램 주소가 `qor1...` 등가 주소로 다시 매핑됨   |

이 매핑은 결정론적이며 `x/svm` 모듈에 의해 관리됩니다. 두 표현 모두 동일한 기본 계정을 가리킵니다.

---

## 임대료 모델

SVM 모듈은 상태 비대화를 방지하기 위해 **임대료 기반 스토리지 모델**을 사용합니다.

| 매개변수                   | 값         |
| -------------------------- | ---------- |
| 연간 바이트당 lamport      | `3,480`    |
| 임대료 면제 배수           | `2.0`      |
| 징수 주기                  | 매 에포크  |

* lamport 단위로 잔액이 `2 * (data_size * 3480 / seconds_per_year)`를 **초과**하는 계정은 **임대료 면제** 대상이며 절대 부과되지 않습니다.
* 임대료 면제 임계값 **미만**의 계정은 매 에포크마다 임대료가 부과됩니다. 잔액이 0에 도달하면 해당 계정은 삭제됩니다.

:::info
**모범 사례:** 예기치 않은 계정 삭제를 방지하기 위해 항상 임대료 면제 최소값보다 높게 데이터 계정에 자금을 충전하세요.
:::

---

## 컴퓨팅 예산

각 인스트럭션 실행은 컴퓨팅 단위로 측정됩니다.

| 매개변수                                 | 값          |
| ---------------------------------------- | ----------- |
| 인스트럭션당 최대 컴퓨팅 단위            | `1,400,000` |
| 최대 CPI(교차 프로그램 호출) 깊이        | `4`         |
| 최대 프로그램 크기                       | `10 MB`     |
| 최대 계정 데이터 크기                    | `10 MB`     |

컴퓨팅 예산을 초과하는 프로그램은 중단되고 트랜잭션은 되돌려집니다.

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

## 교차 VM 상호운용성

SVM 프로그램은 **비동기** 교차 VM 메시지 경로를 통해 EVM 및 CosmWasm 컨트랙트와 통신할 수 있습니다.

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

메시지는 큐에 추가되어 EndBlocker에 의해 처리됩니다. 메시지 수명 주기 및 타임아웃 동작에 대한 자세한 내용은 [교차 VM 상호운용성](/developer-guide/cross-vm-interoperability)을 참조하세요.

---

## 다음 단계

* [교차 VM 상호운용성](/developer-guide/cross-vm-interoperability) — SVM, EVM, CosmWasm 간의 통신
* [EVM 개발](/developer-guide/evm-development) — QoreChain의 Solidity 스마트 컨트랙트
* [CosmWasm 개발](/developer-guide/cosmwasm-development) — Rust 기반 WebAssembly 컨트랙트
