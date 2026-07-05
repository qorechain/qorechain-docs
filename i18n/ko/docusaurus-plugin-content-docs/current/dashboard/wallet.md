---
slug: /dashboard/wallet
title: 지갑
sidebar_label: 지갑
sidebar_position: 3
---

# 지갑

**지갑(Wallet)** 페이지에서는 잔액과 거래 내역을 확인하고, QOR을 받고 보낼 수 있습니다. 페이지의 동작 방식은 네트워크에 따라 다릅니다:

- **메인넷 — 비수탁형(non-custodial).** Dashboard는 메인넷 키를 보관하지 않습니다. 자신의 지갑(Native 레일에는 **Keplr**, EVM 레일에는 **MetaMask**)을 연결하면 실제 잔액과 내역을 체인에서 직접 읽어오며, 어느 레일로든 자금을 받을 수 있습니다. 송금은 연결된 본인 지갑에서 직접 이루어집니다.
- **테스트넷 — 수탁형(custodial).** Dashboard가 테스트 지갑을 대신 관리해 주므로, 별도의 설정 없이 이체, 스왑, 스테이킹을 바로 시험해 볼 수 있습니다. [Faucet](/dashboard/faucet)에서 자금을 충전하세요.

계정은 양자 내성 암호화로 보호되며, 모든 주소의 Native 인코딩은 `qor` bech32 접두사(`qor1...`)를 사용합니다.

## 하나의 계정, 세 가지 인코딩 {#one-account-three-encodings}

QoreChain 계정은 하나의 단일 신원이며, 실행 레일별로 세 가지 방식으로 표기할 수 있습니다:

| 레일 | 인코딩 | 표기 예시 |
| --- | --- | --- |
| **Native QOR** | bech32 | `qor1...` |
| **EVM** | hex | `0x...` |
| **SVM** | base58 | 예: `5Gv7...` |

세 가지 인코딩 모두 **동일한 계정과 동일한 잔액**을 가리킵니다. 어느 레일로 받은 자금이든 하나의 잔액으로 들어오며, Dashboard는 `qor1`(Native) 인코딩을 기준으로 잔액과 내역을 인덱싱하므로 모든 레일의 활동이 한곳에 함께 표시됩니다.

## 메인넷에서 지갑 사용하기 {#mainnet}

1. Dashboard 헤더를 **Mainnet**으로 전환합니다.
2. 안내가 표시되면 [1회성 위험 고지](/dashboard/overview#risk-acknowledgement)에 동의합니다 — 메인넷은 실제 자금을 이동시키고, Dashboard는 비수탁형이며, 트랜잭션은 되돌릴 수 없습니다.
3. **Connect Wallet**을 선택하고 **Keplr**(Native 레일) 또는 **MetaMask**(EVM 레일)를 선택한 뒤, 지갑에서 연결을 승인합니다.
4. 페이지가 체인에서 실제 잔액과 거래 내역을 불러옵니다.

지갑에 아직 QoreChain이 설정되어 있지 않다면 먼저 추가하세요 — [지갑에 QoreChain 추가하기](#add-network)를 참고하세요.

### 메인넷에서 보내기 {#send-mainnet}

Dashboard는 메인넷 키를 절대 보관하지 않으므로, 송금은 연결된 본인 지갑에서 직접 이루어집니다. 다른 네트워크에서와 마찬가지로 Keplr(Native 레일) 또는 MetaMask(EVM 레일)에서 이체를 생성하고 거기서 서명하세요. 트랜잭션이 온체인에 기록되면 Dashboard의 내역에 표시됩니다.

:::caution 실제 자금, 되돌릴 수 없는 이체
메인넷 트랜잭션은 되돌릴 수 없습니다. 서명하기 전에 지갑에서 수신자 주소를 반드시 다시 확인하세요.
:::

### 특정 레일로 받기 {#receive-mainnet}

1. **Receive**를 선택합니다.
2. 수신 모달에서 선택기로 레일을 고릅니다: **Native QOR**, **EVM**, **SVM** 중 하나입니다.
3. 모달에 해당 레일의 인코딩(`qor1...`, `0x...`, 또는 base58)으로 주소가 QR 코드 및 복사 버튼과 함께 표시됩니다.
4. 주소를 복사하거나, 보내는 사람이 QR 코드를 스캔하도록 합니다.

보내는 사람이 어떤 레일을 사용하든 자금은 동일한 계정으로 도착합니다 — 하나의 계정, 세 가지 인코딩, 하나의 잔액입니다.

### 거래 내역 읽기 {#history}

메인넷에서는 내역의 각 행에 다음이 표시됩니다:

- **레일 배지** — Native, EVM, SVM 중 하나로, 해당 트랜잭션이 사용한 레일을 알려줍니다.
- 일반적인 라벨 대신 *Send*, *PQC key registration*, *contract deploy* 같은 **실제 트랜잭션 유형 라벨**.
- 금액, 시간, 상태와 함께 [Explorer](/dashboard/explorer)에서 열어볼 수 있는 트랜잭션 해시.

## 테스트넷에서 지갑 사용하기 {#testnet}

테스트넷(`qorechain-diana`)에서는 Dashboard가 테스트 지갑을 대신 관리하므로, 아무것도 연결하지 않고 전체 플로우를 처음부터 끝까지 테스트할 수 있습니다.

### 페이지에 표시되는 내용

- 지갑 라벨과 활성 주소(축약 형태), 원클릭 복사 버튼.
- QOR 기준 **총 잔액**.
- 양자 내성 암호화와 연결된 네트워크를 안내하는 보안 패널.
- 새로 고침 컨트롤이 있는 마지막 업데이트 표시기.
- 보유 자산과 거래 내역을 보여주는 **Assets** 및 **Activity** 탭.

언제든지 새로 고침 컨트롤을 사용해 체인에서 현재 잔액과 최신 활동을 가져올 수 있습니다.

### QOR 보내기 (테스트넷)

1. **Send**를 선택합니다.
2. 수신자 주소(`qor1...`)를 입력합니다.
3. 금액과 선택 사항인 메모를 입력합니다.
4. 세부 정보와 예상 수수료를 검토한 뒤 확인합니다.

수신자를 입력하는 동안 저장된 연락처와 최근 주소가 제안되어 실수를 방지하는 데 도움이 됩니다. 이체가 제출되면 트랜잭션 해시와 함께 확인 메시지를 받게 되며, 이 해시는 [Explorer](/dashboard/explorer)에서 열어볼 수 있습니다.

### QOR 받기 (테스트넷)

1. **Receive**를 선택합니다.
2. 주소 또는 해당 QR 코드를 보내는 사람과 공유하거나, 원클릭으로 주소를 복사합니다.
3. 필요하면 요청 금액과 메모를 입력해 결제 링크와 다운로드 가능한 QR 코드를 생성할 수 있습니다.

### 테스트 지갑 관리

**My Wallets**를 선택하면 주소 목록이 열립니다. 여기에서 지갑 간 전환, 새 지갑 생성, 기존 지갑 가져오기, 더 이상 필요 없는 지갑 제거를 할 수 있습니다. 활성 지갑은 테스트넷에서 Dashboard 전반의 송금, 스왑, 스테이킹 및 기타 서명 작업에 사용되는 지갑입니다.

## 지갑에 QoreChain 추가하기 {#add-network}

**Add Network** 페이지에는 연결 방식별로 네 개의 카드가 나란히 표시되어, 한 번의 클릭으로 자신의 지갑에 QoreChain을 추가할 수 있습니다:

| 카드 | 제공 내용 |
| --- | --- |
| **Native** | 각각 복사 버튼이 있는 RPC 및 REST 엔드포인트와 체인 ID — Keplr 및 기타 Native 레일 지갑용. |
| **EVM** | 즉시 사용 가능한 EIP-3085 네트워크 파라미터 — 한 번의 클릭으로 MetaMask 및 기타 EVM 지갑에 QoreChain을 추가합니다. |
| **SVM** | SVM 호환 지갑 및 도구를 위한 SVM RPC URL. |
| **WalletConnect** | WalletConnect 호환 지갑을 연결하기 위한 WalletConnect 페어링. |

QoreChain을 추가하려면:

1. Dashboard에서 **Add Network** 페이지를 엽니다.
2. 사용하는 지갑의 레일에 맞는 카드를 선택합니다.
3. 추가 버튼을 선택하거나(EVM, WalletConnect), 엔드포인트와 체인 ID를 지갑의 네트워크 추가 양식에 복사해 넣습니다(Native, SVM).
4. 지갑에서 새 네트워크를 승인합니다.

공개 엔드포인트는 `rpc.qore.host`(Native RPC), `api.qore.host`(REST), `evm.qore.host`(EVM JSON-RPC), `svm.qore.host`(SVM RPC)이며, 테스트넷용으로는 `*-testnet` 변형(예: `rpc-testnet.qore.host`)이 있습니다. 체인 ID: 메인넷 `qorechain-vladi`(EVM 체인 ID `9801`), 테스트넷 `qorechain-diana`(EVM 체인 ID `9800`).

## 관련 문서

- [Token Operations](/user-guide/token-operations) — QOR 이체와 단위(denomination)의 개념.
- [Trade](/dashboard/trade) — 온체인 AMM에서 토큰을 스왑하세요.
- [Bridge](/dashboard/bridge) — 다른 체인으로 자산을 옮기거나 가져오세요.
