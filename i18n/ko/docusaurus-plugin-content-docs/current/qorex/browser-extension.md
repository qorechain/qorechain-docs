---
slug: /qorex/browser-extension
title: QoreX 브라우저 확장 프로그램
sidebar_label: 브라우저 확장 프로그램
sidebar_position: 2
---

# QoreX 브라우저 확장 프로그램

QoreX **브라우저 확장 프로그램**은 데스크톱용 QoreChain 지갑입니다. 지갑을 생성하거나 가져오고, QOR을 보관하고 전송하며, dApp에 연결할 수 있는 **독립형 지갑**인 동시에, 모든 웹사이트가 QoreX를 발견하고 모든 요청을 명시적이고 해독된 승인 절차로 바꿀 수 있게 해주는 구성 요소입니다.

세 개의 스토어(Chrome, Firefox, Safari)에서 **정식 공개되어 사용 가능**합니다. 현재 Chrome은 나머지보다 한 릴리스 뒤처져 있습니다 — [브라우저별로 어떤 버전이 서비스 중인가](#versions)를 참고하세요.

## 설치 {#install}

| 브라우저 | 설치 |
|---|---|
| **Chrome 및 Chromium 계열 브라우저** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** (Firefox 140 이상) | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 12 이상)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

### 브라우저별로 어떤 버전이 서비스 중인가 {#versions}

**2026년 10월 20일** 기준 각 스토어의 현재 버전:

| 스토어 | 현재 버전 |
|---|---|
| Chrome Web Store | 0.3.6 (아직 0.3.7로 업데이트되지 않음) |
| Firefox Add-ons | 0.3.7 |
| Safari (Mac App Store, **QoreX Wallet** macOS 앱) | 1.7.7, 확장 프로그램 0.3.7 포함 — Mac App Store는 자체 `1.x` 번호 체계를 사용합니다 |

스토어 심사 완료 시점이 서로 다르기 때문에 한 스토어가 다른 스토어보다 오래된 빌드를 제공할 수 있습니다. 스토어 등록 정보에는 항상 현재 버전이 표시됩니다. 이 페이지는 0.3.7 기능 세트를 설명하며, 0.3.7이 필요한 부분에는 그렇게 명시합니다. Chrome 사용자는 Chrome 등록 정보가 업데이트되면 이를 받게 됩니다. [브라우저별로 어떤 버전이 서비스 중인가](/qorex/overview#versions)도 참고하세요.

0.2.6 이후 확장 프로그램에는 다음이 추가되었습니다. [하나의 비밀번호로 여러 지갑](#wallets), [직접 추가하는 Ethereum 방식 계정](#coin60), [Claim & restake](#stake)(청구 후 재스테이킹), **Unstaking in progress**(언스테이킹 진행 중) 목록, [컨트랙트로 토큰 추가](#custom-tokens), [모든 네트워크에서 받기](#receive), [Revoke 기능이 있는 연결된 사이트](#connected-sites), [EVM 접근 창](#evm-window), [dApp용 `signAndBroadcast`](#sign-and-broadcast), 그리고 모든 메시지, 수수료, 만료 시점을 보여주는 승인 화면.

**권한 범위는 0.1.3 이후 변경되지 않았습니다** — [QoreX가 요청하는 권한](#permissions)을 참고하세요.

:::note
Safari에서는 승인 화면이 팝업 창이 아니라 브라우저 탭에서 열립니다 — 확장 프로그램이 동일한 코드베이스에서 Apple의 Safari 웹 확장 래퍼로 패키징되기 때문입니다.
:::

## 지갑 생성 또는 복구 {#wallet}

팝업을 열고 다음 중 하나를 선택하세요.

- **새 지갑 생성** — 비밀번호(8자 이상)를 정하면, QoreX가 기기에서 새로운 24단어 복구 문구를 생성하고(256비트 엔트로피), QoreChain 신원을 파생한 뒤, 그 비밀번호(그리고 선택적으로 패스키 — [보안](#security) 참고)로 볼트에 봉인합니다. 24개 단어는 **한 번만** 표시됩니다 — 적어 두고, *I have saved my recovery phrase somewhere safe*에 체크한 뒤 계속하세요. 나중에 팝업의 **Reveal recovery phrase**로 다시 볼 수 있습니다(비밀번호 필요).
- **복구 문구 가져오기** — 기존 문구로 복구합니다. 24단어보다 짧은 문구도 자금은 정상적으로 복구되지만, QoreX는 이 경우 포스트 양자 키가 문구의 강도만큼만 확보된다고 경고합니다. 완전한 강도를 원하면 새 24단어 지갑을 만들어 자금을 옮기세요.

:::danger 계속하기 전에 문구를 적어 두세요
확장 프로그램의 볼트는 이 브라우저에만 존재합니다. **확장 프로그램을 제거하거나, 데이터를 지우거나, 브라우저를 초기화하면 키가 삭제되며**, QoreChain Association을 포함해 누구도 이를 복원할 수 없습니다. 적어 둔 24개 단어가 없으면 자금은 영구히 사라집니다. [지금 백업하기](/qorex/security-and-recovery#back-up-now)를 참고하세요.
:::

확장 프로그램은 자체 키를 보유하며, 모바일 앱이 필요하지 않습니다. 키는 절대 기기를 벗어나지 않습니다.

## 여러 지갑과 계정 {#wallets}

- **지갑**(0.3.3부터) — 팝업의 **Wallets** 화면("Wallets in this browser")에는 이 브라우저의 모든 지갑이 나열됩니다. 각 지갑은 고유한 복구 문구를 가지며, **하나의 비밀번호**로 모두 잠금 해제됩니다. 전환하면 QoreX가 표시하고 서명에 사용하는 지갑이 바뀔 뿐, 온체인에서는 아무것도 이동하지 않습니다. 새 지갑을 만들거나(문구는 한 번만 표시됨) 복구하여 **추가**할 수 있으며, 볼트를 다시 봉인하기 위해 비밀번호를 한 번 묻습니다. 지갑을 추가하거나 제거하면 **패스키 잠금 해제**가 꺼집니다 — 홈 화면에서 다시 켜세요. 지갑을 제거하려면 *Remove from this browser*를 탭하고 비밀번호를 입력하세요. 마지막 지갑은 이 화면에서 제거할 수 없습니다. 제거하면 해당 키가 브라우저에서 삭제되며 — 복구 문구만이 그것을 되살릴 수 있습니다.
- **계정**(0.2.2부터) — **Your accounts**에서 같은 문구로 여러 계정을 만들고 전환할 수 있습니다(지갑당 최대 20개, 번호가 매겨지며 이름은 바꿀 수 없음). 적어 둔 문구를 복구하면 **Account 1**이 돌아오며, 나머지는 **Add an account**로 다시 추가하세요. 전환하면 모든 것이 함께 이동합니다. 전송, 스테이킹, 받기, @handle이 활성화된 계정을 따라갑니다.

### Ethereum 방식 계정 {#coin60}

0.3.2부터 (**Your accounts** 화면의) **Add an Ethereum account (coin 60)**로, MetaMask 또는 Dashboard에서 처음 사용한 문구의 계정을 추가할 수 있습니다. [MetaMask 또는 Dashboard의 문구 복구하기](/qorex/getting-started#restore-dashboard)를 참고하세요. 그 0x 주소는 같은 단어에 대해 MetaMask가 보여주는 주소와 같습니다. 이 계정에서는 핸들이 제공되지 않습니다.

포트폴리오, Q-Day 스캐너, 소셜 복구, Legacy Protocol, 결제 요청, 계정 로그인, 기기 연결은 여전히 모바일 전용입니다 — [QoreX Wallet](/qorex/overview#platform-availability)을 참고하세요.

## 계정, 잔액 및 @handle {#account}

팝업의 초기 화면에는 `qor1…` 주소(탭하여 복사)와 실시간 QOR 잔액이 표시되므로, 둘 중 어느 것을 확인하기 위해서도 블록 탐색기를 따로 열 필요가 없습니다.

### 베스팅(잠금) 잔액 {#vesting}

계정에 베스팅 중인 QOR(예: 아직 해제되지 않은 TGE 배분)이 있는 경우, 잔액은 **현재 사용 가능** 부분과 **아직 잠긴** 부분으로 나뉘어 표시되며, 사용 가능한 금액을 초과하는 전송은 수수료를 뗀 뒤 온체인에서 실패하는 대신 네트워크에 도달하기 전에 거부됩니다. QoreX는 여기에 "다음 잠금 해제 날짜"를 의도적으로 표시하지 **않습니다**. 베스팅 일정은 거버넌스에 의해 변경될 수 있으므로, 잔액 카드에 날짜를 표시하면 QoreX가 보장할 수 없는 약속처럼 보이게 됩니다. 정확성이 유지되는 부분은 사용 가능/잠김 구분뿐입니다.

### @handle 청구하기

고유한 **@handle**(예: `@liviu`)을 청구하려면 **로그인된 계정**이 필요하며 **모바일 앱에서** 이루어집니다. 확장 프로그램은 그곳으로 안내할 뿐 핸들을 직접 청구하지 않습니다. 청구된 핸들은 해당 주소에 연결되므로, 여러분이 핸들로 결제할 때 확장 프로그램이 이를 확인하고 다른 사람들도 이름으로 여러분에게 송금할 수 있습니다. 핸들이 지갑 전체가 아니라 주소에 연결되는 방식에 대해서는 [@handle](/qorex/account-and-dashboard#handle)을 참고하세요.

## @handle로 전송 {#handle-send}

0.1.9부터는 주소를 조회하는 대신 등록된 @handle로 바로 전송할 수 있습니다(0.3.6까지의 버전에서는 결함으로 조회가 중단되었으며 0.3.7부터 다시 작동합니다).

1. 팝업을 열고 **Send**를 탭합니다.
2. 수신자 입력란에 `qor1…` 주소 대신 `@`에 이어 핸들(예: `@liviu`)을 입력합니다.
3. QoreX가 핸들을 확인하고, 서명하기 전에 **확인된 주소**를 보여줍니다 — 항상 예상한 주소와 일치하는지 확인하세요.
4. 금액을 입력하고 확인합니다.

QoreX가 확인 결과를 사용하기 전에 두 가지 방식으로 검증됩니다. 확장 프로그램에 내장된 신뢰 키로 검증하는 레지스트리 증명, 그리고 청구 내용에 대한 핸들 소유자 본인의 서명입니다. 둘 중 하나라도 실패하면 응답은 즉시 거부됩니다 — QoreX는 검증되지 않은 주소를 대신 보여주지 않습니다. 특정 핸들로 처음 전송할 때 QoreX는 확인된 주소를 기억(고정)해 둡니다. 이후 그 핸들이 **다른** 주소로 확인되면 QoreX는 진행을 멈추고 이전 주소와 새 주소를 모두 온전히 보여주어 계속할지 여부를 직접 판단하게 합니다. 이 기억은 **브라우저별로** 유지됩니다 — 같은 핸들이라도 다른 브라우저나 컴퓨터에서 처음 결제하면 그곳에서도 새로운 것으로 표시됩니다. 이는 오류가 아니라 예상된 동작입니다.

## 받기 {#receive}

팝업에서 **Receive**를 탭하면 `qor1…` 주소가 QR 코드(QoreChain 아이콘이 삽입됨)와 복사 버튼으로 표시됩니다 — 휴대폰으로 스캔하거나 주소를 직접 붙여넣으세요.

**네트워크 선택기.** Receive는 Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia의 주소도 표시할 수 있으며, 각각 "이 네트워크 전용" 경고가 함께 표시됩니다(QoreChain이 항상 맨 앞에 옵니다).

## 확장 프로그램에서 스테이킹하기 {#stake}

**0.2.2**부터 팝업에 자체 **Stake** 화면이 생겨, 확장 프로그램에서만 생성된 지갑도 모바일 앱 없이 스테이킹 보상을 받을 수 있습니다.

1. 팝업을 열고 **Stake**로 이동합니다.
2. 이 화면은 커미션이 표시된 활성 검증인 목록, 현재 스테이킹 총액, 청구 대기 중인 보상을 보여줍니다. 네트워크가 **jail(수감)** 처리한 검증인은 목록에서 제외됩니다 — 그런 검증인에게 위임하는 것은 결코 바람직하지 않기 때문입니다.
3. 위임하려면 검증인과 금액을 선택한 뒤 확인합니다. QoreX는 Send와 마찬가지로 필수 하이브리드 포스트 양자 서명으로 서명합니다. 금액을 입력하는 동안, 그 금액이 트랜잭션 수수료보다 적은 잔액을 남기게 되면 경고합니다(계정에 다시 QOR이 생길 때까지 언스테이킹이나 청구를 할 수 없게 됩니다). 계정이 여럿이면 Stake 화면의 계정 선택기에서 스테이킹할 계정을 고르세요.
4. **Claim**은 보상을 수령하고, **Claim & restake**는 한 번의 트랜잭션으로 보상을 그것을 벌어들인 검증인들에게 다시 복리로 위임합니다. QoreX는 먼저 **잠금 해제된** QOR로 수수료를 낼 수 있는지 확인하며(수수료는 보상이 도착하기 전에 지불됩니다), 그렇지 않으면 알려 줍니다.
5. **Unstake**는 21일의 언본딩 기간을 시작하며, 해당 금액은 남은 시간과 함께 **Unstaking in progress** 아래에 표시됩니다 — [스테이킹 및 위임](/user-guide/staking-and-delegation)을 참고하세요.
6. **Move stake**는 스테이킹을 하나 또는 여러 다른 검증인으로 옮깁니다(재위임) — 언본딩 대기가 없고, 페널티도 없으며, 보상은 계속 쌓입니다. [검증인 간 스테이킹 이동](/qorex/portfolio-and-staking#move-stake)을 참고하세요.

스테이킹, 위임, 보상은 전적으로 **Native** 레인에서만 이루어지며, EVM 프리컴파일을 통해서는 절대 이루어지지 않습니다.

### Dashboard 스테이킹 요청 승인하기 {#stake-dashboard}

QoreChain [Dashboard](/dashboard/staking-and-validators)는 스테이킹 요청을 구성하지만 직접 서명하지는 못합니다 — 여러분의 키는 절대 확장 프로그램의 볼트를 벗어나지 않습니다. Dashboard에서 **Continue in QoreX**를 클릭하면, 요청이 확장 프로그램에서 열려 검토(검증인과 금액)하고 Send와 똑같이 승인할 수 있습니다.

:::note 트랜잭션이 성공 대신 "downgraded(강등됨)"로 표시되는 경우
Dashboard는 트랜잭션을 깔끔한 성공 대신 **downgraded(강등됨)**로 표시할 때가 있습니다. 이는 자금은 실제로 이동했지만 해당 트랜잭션에 대한 포스트 양자 서명 계층이 체인에서 확인되지 않았다는 의미입니다 — 여러분이 잘못한 것도 아니고, 여러분 쪽에서 고칠 수 있는 것도 아닙니다. 이것은 저희 쪽의 결함이니, 저희가 조사할 수 있도록 지원팀에 알려 주세요. 이 메시지는 읽고 신고할 시간을 드리기 위해 의도적으로 사라지지 않고 화면에 계속 표시됩니다.
:::

### 외부 네트워크에서 전송하기 {#send-external}

Native 레인의 QOR 외에도, 팝업에서 외부 네트워크의 자산을 전송할 수 있으며, 모두 동일한 복구 문구에서 파생됩니다(EVM 네트워크의 경우 확인하기 전에 **최대 네트워크 수수료** — "Network fee: at most …" — 를 표시합니다).

| 종류 | 네트워크 | 기본 포함 토큰 |
|---|---|---|
| EVM | Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche C-Chain | ERC-20 항목 (모든 EVM 체인에 걸친 USDC 및 USDT, Ethereum의 DAI) |
| SVM | Solana | SPL 항목 (USDC, USDT) |
| Cosmos | Cosmos Hub, Osmosis, Celestia | IBC를 통한 Noble USDC; 선택적 메모 필드 |

외부 전송이 발송되기 전에 다음 확인 사항에 명시적으로 체크해야 합니다. **"외부 네트워크는 고전 서명만 허용합니다 — 귀하의 QOR와 달리, 이 전송은 양자 내성이 없습니다."** 외부 체인은 포스트 양자 서명을 담을 수 없으며, QoreX는 이를 결코 숨기지 않습니다.

## 지원하는 지갑 표준 {#standards}

QoreX는 세 가지 인터페이스를 노출하며, 모두 페이지에 `window.qorex` (`{ evm, native, svm }`)로 주입되고 [`@qorechain/connect`](/sdk/overview) 탐지 계약을 통해 발견됩니다.

| 표준 | 개요 | 개발자에게 주는 의미 |
|---|---|---|
| **EIP-1193** | Ethereum 프로바이더 JavaScript API (`request(...)`, 이벤트). | QoreX의 EVM 프로바이더는 계정 및 네트워크 조회에 응답합니다 — `eth_requestAccounts`, `eth_accounts`, `eth_chainId`, `wallet_switchEthereumChain`(그 외 체인은 표준 `4902`를 반환). 아직 EVM 트랜잭션이나 메시지에 서명하거나 전송하지는 **않습니다**. 다른 메서드는 "EVM method … not yet supported"를 반환합니다. EVM 레인 트랜잭션에는 MetaMask나 다른 EVM 지갑을 사용하세요(이제 열려 있는 [EVM 접근 창](#evm-window)도 필요합니다). |
| **EIP-6963** | 다중 지갑 프로바이더 탐지 (announce / request 이벤트). | QoreX는 다른 모든 지갑과 나란히 자신을 알리며, **`window.ethereum`을 절대 덮어쓰지 않습니다** — 따라서 사용자는 충돌 없이 사이트별로 QoreX를 선택할 수 있습니다. |
| **Native 프로바이더 (Keplr 방식)** | `window.qorex.native`: `enable`, `getKey`, `signDirect`, `signAndBroadcast`, 그리고 `capabilities` 목록. Keplr의 완전한 대체물은 **아닙니다** — QoreX는 `window.keplr`를 별칭으로 제공하지 않으며 `getOfflineSigner`, `signAmino`, `sendTx`가 없습니다. | QoreChain 트랜잭션을 보내려면 **`signAndBroadcast`**를 호출하세요([QoreChain 트랜잭션 보내기](#sign-and-broadcast) 참고). QoreX는 해독된 메시지와 수수료를 보여주고, 지갑만 만들 수 있는 하이브리드 포스트 양자 서명을 추가한 뒤 브로드캐스트합니다. QoreChain에서의 `signDirect`는 트랜잭션에 이미 유효한 양자 내성 계층이 포함되어 있지 않으면 거부됩니다. |
| **Solana Wallet Standard** *(0.1.5부터)* | Solana dApp을 위한 네이티브 지갑 탐지 (`wallet-standard:register-wallet` / `app-ready`). | Solana dApp이 **QoreX를 자동 감지**합니다 — 별도 통합이 필요 없습니다. 기능: `standard:connect`, `standard:disconnect`, `standard:events`, `solana:signMessage`, `solana:signTransaction`, `solana:signAndSendTransaction`; 체인 `solana:mainnet`; `legacy`와 `v0` 트랜잭션 모두 지원. |

:::note SVM 레인에 직접 접근하기
동일한 인터페이스는 `window.qorex.svm`에서도 사용할 수 있습니다 (`connect` / `signAndSendTransaction` / `signMessage`). Wallet-Standard 자동 탐지와 완전히 구현된 SVM 레인은 **0.1.5**에서 출시되었으며, Chrome과 Firefox 양쪽에서 모두 서비스 중입니다([브라우저별로 어떤 버전이 서비스 중인가](#versions) 참고).

Solana 승인 화면은 **명령(instruction)마다 한 줄**을 표시하며, QoreX가 해독할 수 있는 경우 해독합니다. SOL 전송(수신자와 lamports), SPL 토큰 전송, **"ALLOW SPENDING of your tokens"**(approve), **"HAND OVER control of the account"**(set authority), 토큰 계정 닫기가 이에 해당하며, 그 외에는 프로그램과 함께 "instruction QoreX cannot read"라고 표시합니다. approve 또는 set-authority 명령이 포함된 요청에는 "wants authority over your Solana tokens — read every line below"라는 머리말이 붙습니다. 사용자의 지갑을 서명자로 명시하지 않은 트랜잭션은 거부되고, `signMessage`는 실제로는 트랜잭션인 바이트에는 서명하지 않으며, 서명은 **고전 서명**으로 표시됩니다 — [포스트 양자 서명](#pqc)을 참고하세요.
:::

## 코인 및 토큰 {#custom-tokens}

팝업의 **Coins and tokens** 화면에서 **컨트랙트로 ERC-20 토큰을 추가**할 수 있습니다. 네트워크를 선택하고, 컨트랙트 주소를 붙여넣고, **Check contract**를 누르세요. QoreX는 토큰의 이름과 소수 자릿수를 컨트랙트 자체에서 읽으며 — 팝업을 신뢰하지 않고 추가할 때 백그라운드에서 다시 읽습니다 — 누구나 어떤 이름으로든 토큰을 만들 수 있다는 안내와 함께 이를 표시합니다. 그러면 토큰이 **Send on external networks**에 나타납니다. 기본 포함 토큰, 중복, 비 EVM 네트워크, 잘못된 주소, 읽을 수 없는 컨트랙트, 그리고 기본 포함 토큰의 이름을 도용한 컨트랙트는 거부됩니다.

## 연결된 사이트 {#connected-sites}

팝업의 **Connected sites**에는 이 지갑이 승인한 모든 사이트가 나열됩니다 — 사이트는 이 지갑의 주소를 볼 수 있고 서명을 요청할 수 있습니다. 하나를 제거하려면 **Revoke**를 탭하세요. 승인은 **지갑별로** 유지됩니다. 한 지갑에 대해 승인된 사이트는 전환 후 다른 지갑의 주소를 읽을 수 없습니다.

## EVM 접근 창 {#evm-window}

팝업의 **EVM access window** 화면은 Ethereum 방식(coin 60) 계정이 QoreChain의 EVM 레인(v3.2.0 이상)에서 전송할 수 있게 하는 창을 열고 닫습니다 — 앱의 같은 화면과 동일하며 한도도 같습니다(최대 17,280 블록과 1,000 트랜잭션, 그리고 각 금액과 그 최대 수수료를 합산하는 QOR 상한). [EVM 접근 창](/qorex/security-and-recovery#evm-window)을 참고하세요.

## 언어 {#language}

이 확장 프로그램은 모바일 앱, 대시보드, 사이트와 동일한 10개 언어를 지원합니다: 영어, 루마니아어, 독일어, 스페인어, 프랑스어, 이탈리아어, 터키어, 아랍어, 일본어, 한국어. 기본적으로 **브라우저**의 언어를 따르며(그 외 언어는 영어로 대체) — 이는 **휴대폰**의 언어를 따르는 모바일 앱과는 다른 기준이라는 점에 유의하세요. 휴대폰과 브라우저의 언어 설정이 다르면 두 곳에서 서로 다른 언어가 표시될 수 있습니다. 팝업 초기 화면의 선택기를 통해 언제든 감지된 언어를 재정의할 수 있으며, 아랍어로 전환하면 텍스트뿐 아니라 팝업 전체가 즉시 오른쪽에서 왼쪽 방향으로 바뀝니다.

## 보안 및 권한 {#security}

QoreX는 단순히 신뢰를 요구하는 것이 아니라 검증 가능하도록 설계되었습니다.

- **볼트** — 키는 **AES-256-GCM**으로 봉인됩니다. 비밀번호 경로는 **Argon2id**(RFC 9106, 메모리 하드: 64 MiB, t=3, p=1)로 키를 파생하므로, 유출된 볼트 블롭도 GPU/ASIC 크래킹에 강하게 저항합니다. (기존 PBKDF2 블롭은 계속 열 수 있으며, 다음 잠금 해제 시 Argon2id로 다시 봉인됩니다.)
- **패스키 잠금 해제 (선택 사항, 0.1.5부터)** — 인증기가 **WebAuthn PRF** 확장을 지원하는 경우, QoreX는 비밀번호를 입력하는 대신 패스키의 32바이트 PRF 출력으로 볼트를 열 수 있습니다. 비밀번호는 항상 대체 수단으로 남아 있습니다.

  :::note 패스키 잠금 해제가 표시되는 환경
  QoreX는 WebAuthn을 기능 탐지하여, 브라우저가 확장 프로그램 페이지에 이를 노출하는 경우에만 **Enable passkey unlock**을 표시합니다 — 즉 **Chrome과 Edge**입니다. **Firefox**에서는 이 옵션이 숨겨지는데, Firefox가 확장 프로그램 페이지에 WebAuthn을 노출하지 않기 때문입니다. 이는 버그가 아니라 의도된 동작입니다.
  :::
- **Manifest V3 + 엄격한 CSP** — `script-src 'self'; object-src 'self'; base-uri 'self'`. 설치 이후 **원격 코드 로딩이 전혀 없으며**, `wasm-unsafe-eval`도 사용하지 않습니다.
- **분석 도구 없음, 크래시 보고 없음, 트래킹 SDK 없음, 회원 가입 없음** — 확장 프로그램은 QOR을 보관, 전송, 스테이킹하는 데 계정이 필요하지 않습니다. 키, 복구 문구, 볼트, 승인 정보는 절대 브라우저를 벗어나지 않습니다. 다만 네트워크 요청은 보냅니다. 잔액, 내역, 브로드캐스트를 위해 공개 QoreChain 엔드포인트로(공개 `qor1…` 주소를 포함), 가격 조회(주소 없음), 보유하거나 조회하는 외부 네트워크의 공개 서비스로(해당 네트워크의 공개 주소), 그리고 @handle 레지스트리로(핸들 또는 공개 주소) 보냅니다. [Dashboard 페어링](#dashboard-bridge)을 사용하는 경우에만 해당 주소를 소유하고 있다는 서명된 증명을 전송합니다. [QoreX가 네트워크로 보내는 정보](/qorex/overview#data-and-privacy)를 참고하세요.

### QoreX가 요청하는 권한과 그 이유 {#permissions}

이 섹션이 존재하는 이유는, Firefox 등록 정보에 **"모든 웹사이트의 데이터에 접근"** 권한이 표시되기 때문입니다. 호스트 권한을 전혀 선언하지 않는 지갑치고는 모순처럼 보일 수 있습니다. 아래는 매니페스트에서 그대로 가져온, 편집되지 않은 사실입니다.

확장 프로그램의 `manifest.json`은 다음을 선언합니다.

```json
"permissions": ["storage"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
],
"web_accessible_resources": [
  { "resources": ["dist/inpage.js"], "matches": ["<all_urls>"], "use_dynamic_url": true }
]
```

- **`permissions: ["storage"]`** — 유일한 API 권한입니다. 암호화된 볼트와 출처(origin)별 연결 승인 정보를 확장 프로그램 저장소에 **로컬로** 저장합니다.
- **`host_permissions: []`** — QoreX는 호스트 권한을 **전혀** 선언하지 않습니다. 사용자를 대신해 임의의 사이트로 교차 출처 네트워크 요청을 보낼 수 있는 권한을 요청하지 않습니다.
- **`web_accessible_resources`** — 페이지가 QoreX 자체의 `inpage.js`, 즉 프로바이더를 노출하는 작은 스크립트를 로드할 수 있게 합니다. `use_dynamic_url`은 세션마다 고유한 주소를 부여하므로, 사이트가 확장 프로그램을 탐색하여 지문을 수집할 수 없습니다.
- **`content_scripts`가 `<all_urls>`와 일치** — Firefox가 *"모든 웹사이트의 데이터에 접근"*이라고 표시하는 솔직한 이유가 바로 이것입니다. QoreX는 **모든 페이지**에 작은 프로바이더 스크립트(`content.js` → `inpage.js`)를 주입합니다. 모든 사이트에서 실행되는 콘텐츠 스크립트는 기술적으로 페이지를 읽을 *수* 있고, 브라우저는 그 기능을 정확히 그런 문구로 설명합니다 — 그것이 `host_permissions`에서 비롯되든 콘텐츠 스크립트 매칭에서 비롯되든 마찬가지입니다.

**콘텐츠 스크립트가 모든 곳에서 실행되는 이유.** **어떤** dApp이든 사이트별 접근 권한을 먼저 부여받지 않고도 EIP-6963을 통해 지갑을 발견할 수 있도록 하기 위해서입니다. 이는 MetaMask, Keplr, Phantom을 비롯한 모든 주입형 지갑이 동작하는 방식입니다. 주입된 프로바이더는 페이지의 스크립트가 실행되기 전에(`document_start`), 사용자가 방문하는 모든 사이트에서 존재해야 합니다.

**그 스크립트가 하는 일과 하지 않는 일.** 이 스크립트는 지갑 메시지를 중계하기만 합니다(프로바이더를 알리고, 연결/서명 요청을 서비스 워커로 전달하며, 결과를 반환). 해당 지갑 요청 외에 페이지 내용을 읽거나, 서버로 무언가를 전송하거나, 원격 코드를 로드하지 **않습니다** — 또한 호스트 권한이 없기 때문에 임의의 교차 출처 데이터를 가져올 수도 없습니다. 이 모든 것은 검증 가능합니다. 확장 프로그램은 CSP로 잠겨 있고, 분석 도구를 포함하지 않으며, Firefox 패키지에는 재현 가능한 소스 zip이 포함되어 있습니다.

## dApp을 QoreX에 연결하기 {#connect}

dApp은 **EIP-6963**을 통해 QoreX를 발견합니다. announce-and-request 방식을 사용한 뒤, 반환된 EIP-1193 프로바이더를 사용하세요(이 프로바이더는 계정 및 네트워크 조회에만 응답합니다 — 위의 표를 참고하세요).

```ts
import type { EIP6963ProviderDetail } from "./types";

const wallets = new Map<string, EIP6963ProviderDetail>();

// 1. Collect every wallet that announces itself.
window.addEventListener("eip6963:announceProvider", (event) => {
  const detail = (event as CustomEvent<EIP6963ProviderDetail>).detail;
  wallets.set(detail.info.rdns, detail);
});

// 2. Ask installed wallets to announce.
window.dispatchEvent(new Event("eip6963:requestProvider"));

// 3. Pick QoreX by its rdns and use the standard EIP-1193 provider.
const qorex = wallets.get("network.qore.qorex");
if (qorex) {
  const accounts = await qorex.provider.request({ method: "eth_requestAccounts" });
  console.log("QoreX EVM account:", accounts[0]);
}
```

QoreChain **Native** 레인의 경우, `window.qorex.native`의 프로바이더(`enable`, `getKey`, `signAndBroadcast`, `signDirect`. 이 빌드가 지원하는 기능은 `capabilities`를 읽어 확인)를 사용하세요. 상위 수준의 [`@qorechain/connect`](/sdk/overview) 패키지가 이 탐지 과정을 대신 처리해 줍니다.

승인은 **출처별**로 이루어집니다. 사이트에 처음 연결할 때 출처를 표시하는 승인 팝업이 열리고, 승인 시 공개 주소만 공개되며, 한 사이트의 승인이 다른 사이트에 어떤 권한도 부여하지 않습니다. 승인은 지갑별로 유지되고, **Connected sites**에서 취소할 때까지 지속되며, 한 사이트는 대기 중인 요청을 하나(전체로는 세 개)까지 가질 수 있습니다. 지갑을 전환하거나 잠그면 대기 중인 요청에는 "거부"로 응답합니다. [승인 창이 보여주는 것](/qorex/security-and-recovery#approvals)을 참고하세요.

### Dashboard 브리지 (v0.1.5, v0.2.2에서 확장) {#dashboard-bridge}

버전 0.1.5는 **`dashboard.qorechain.io` 전용**으로 범위가 한정된 브리지를 추가합니다. `window.qorex.native.connectProof(sessionId)`는 *Connect with QoreX* 페어링 증명에 서명하고(백엔드가 서명을 다시 검증합니다), `executeTransfer({ to, amountUqor, memo })`는 Dashboard가 제안한 QOR 전송을 승인 및 브로드캐스트하고 `txHash`를 반환합니다. 이 메서드들은 다른 모든 출처에서 거부됩니다.

**0.2.2**는 `native:executeRequest`를 추가합니다. 이 메서드는 [스테이킹](#stake-dashboard)을 포함해 Dashboard가 제안하는 요청 전체를 받아들이며, QoreX가 다른 모든 곳에서 사용하는 것과 동일한 공유 파서로 검증합니다. 네트워크 불일치, 낯선 출처, 여러분의 것이 아닌 주소, 알 수 없는 요청 종류, 또는(스테이킹 요청에는 있을 수 없는) `toAddress`를 담은 스테이킹 요청의 경우 거부됩니다. 요청 종류는 send, delegate, undelegate, redelegate, claim이며, Connect 요청에서는 연결할 계정을 선택할 수 있고, `listAccounts()`는 여러분의 계정을 반환합니다(읽기 전용).

`qor1…` 주소는 메인넷과 테스트넷 양쪽에서 동일하게 유효하기 때문에, Dashboard가 제안하는 요청은 대상 네트워크를 명시하며, QoreX는 그 네트워크가 확장 프로그램이 현재 연결된 네트워크와 일치하지 않으면 해당 요청을 실행하지 않습니다 — 요청을 대신해 네트워크를 전환하는 일은 절대 없습니다.

## dApp에서 QoreChain 트랜잭션 보내기: `signAndBroadcast` {#sign-and-broadcast}

포스트 양자 키가 등록된 계정에서 나가는 모든 QoreChain 트랜잭션에는 하이브리드 서명 — secp256k1 **과** ML-DSA-87 — 이 필요하며, ML-DSA 키는 지갑만 보유하므로 페이지는 이를 만들 수 없습니다. 메시지만 보내면 나머지는 QoreX가 처리합니다. 해독된 메시지와 수수료를 보여주고, 사용자가 선택한 계정에 대해 트랜잭션을 구성하고, 하이브리드 서명을 추가하고(계정의 첫 트랜잭션이라면 먼저 계정의 포스트 양자 키를 등록), 브로드캐스트한 뒤 결과와 함께 완료됩니다. 확장 프로그램 **0.3.5**와 앱 **1.1.5**부터 사용할 수 있습니다(현재 모든 스토어 빌드).

```js
const provider = window.qorex.native;
if (!provider.capabilities?.includes("signAndBroadcast")) {
  throw new Error("Please update QoreX");
}
await provider.enable("qorechain-vladi");            // connect, once per site

const res = await provider.signAndBroadcast({
  chainId: "qorechain-vladi",                        // must be the wallet's active network
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: msgSendBytes }],  // protobuf bytes: Uint8Array, number[] or base64
  memo: "",                                          // optional, up to 256 bytes
  gasLimit: 300000,                                  // optional
});
// → { txHash, code, height?, shield }
```

- `chainId`는 지갑의 활성 네트워크(메인넷에서는 `qorechain-vladi`)와 같아야 합니다. dApp은 네트워크를 전환할 수 없으며, 사용자만 전환할 수 있습니다.
- 호출당 메시지는 1~32개이며, 메시지 바이트는 보낸 그대로 서명됩니다.
- 수수료(`gasLimit` × 네트워크 가스 가격)는 승인 전에 표시됩니다. 거부되면 `QoreX: signature rejected`가 발생합니다.
- 포스트 양자 키 관리(등록, 마이그레이션, 교체 — authz `MsgExec` 내부 포함)는 거부됩니다. 계정의 키는 지갑이 직접 관리합니다.

## 포스트 양자 서명 {#pqc}

QoreX가 직접 개시하는 모든 QOR 전송은 **하이브리드 포스트 양자 서명** — 고전 secp256k1 서명과 함께 **ML-DSA-87**(Dilithium-5, NIST **FIPS-204**) — 으로 서명되며, `@qorechain/sdk`의 완전한 하이브리드 파이프라인을 사용합니다. **끄고 켜는 설정은 없습니다.** QoreChain이 이를 요구하며, QoreX는 이것 없이 Native 레인 QOR 전송을 절대 보내지 않습니다.

- **dApp이 개시하는 Native 서명** — [`signAndBroadcast`](#sign-and-broadcast)를 사용하세요. QoreX가 모든 메시지를 해독하고, 수수료를 보여주며, 양자 내성 계층을 직접 추가합니다. `signDirect`는 페이지가 구성한 트랜잭션에 서명하며, QoreChain에서는 그 트랜잭션에 이미 유효한 양자 내성 계층이 포함되어 있지 않으면 **거부됩니다**(`signAndBroadcast`를 사용하는 Ethereum 방식 계정에 대해서도 거부됩니다). QoreX는 맹목적으로 서명하지 않습니다. 해독할 수 없는 요청은 거부되며, 고전 서명만 있는 QoreChain 트랜잭션에는 절대 서명하지 않습니다.
- **고전 서명은 항상 라벨이 붙습니다** — 외부 네트워크(ETH, BNB, Solana 등)의 전송은 포스트 양자 서명을 담을 수 없습니다. QoreX는 명시적인 확인 체크를 요구하고, 조용히 등급을 낮추는 대신 이를 고전 서명으로 표시합니다.

**이것이 트랜잭션 크기에 미치는 영향.** ML-DSA-87은 큰 서명입니다. 서명은 **4,627바이트**, 공개 키는 **2,592바이트**입니다(FIPS-204로 고정). 따라서 하이브리드 QoreChain 트랜잭션은 순수 고전 트랜잭션보다 수 킬로바이트 더 큽니다. 트랜잭션을 직접 구성하고 브로드캐스트한다면, 추가 바이트를 감안해 버퍼와 수수료 추정치를 잡으세요. QoreChain의 가스 회계는 이미 이를 반영하고 있습니다. 기본 요소와 결정론적 서명 요구 사항은 [포스트 양자 서명](/developer-guide/post-quantum-signing)을 참고하세요.
