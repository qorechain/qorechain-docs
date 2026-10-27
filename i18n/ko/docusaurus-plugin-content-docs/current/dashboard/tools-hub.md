---
slug: /dashboard/tools-hub
title: 노드 및 검증인
sidebar_label: 노드 및 검증인
sidebar_position: 11
---

# 노드 및 검증인

**Nodes & Validators** 페이지(사이드바 **Build** 그룹, 주소 `/tools`; 2026년 10월 27일 이전에는 Tools와 Tools Hub라고 불렀습니다)는 Dashboard의 운영자 페이지입니다. 다섯 개의 탭이 있으며 순서는 **Validator Program**, **Validator Application**, **Light Node**, **Node Registration**, **Rollups**입니다. 검증인이나 라이트 노드를 운영하려는 사람, 또는 애플리케이션 롤업을 요청하려는 사람을 위한 페이지입니다. SDK 탭은 공개 [개발자](/dashboard/developers) 페이지로 옮겨졌으며, 이곳에는 빌더 도구(PQC 키 상태, 시뮬레이터, 서명 플레이그라운드, QoreX test wallet)도 있습니다.

## 혁신 사항 {#innovations}

- **체인 확인은 체인에서 가져옵니다.** **Validator Readiness** 패널은 선택한 네트워크에서 네 가지를 확인합니다: 등록된 ML-DSA-87 키, 셀프 스테이크에 쓸 수 있는 QOR(베스팅 제외), 온체인 운영자 부여, 그리고 검증인이 본딩되었는지 여부입니다. **Light node status** 패널은 현재 적용 중인 요건(등록 수수료, 위임 스테이크, 가동 시간, 하트비트 기간, 최대 라이트 노드 수)과 해당 주소의 등록 및 하트비트 상태를 읽어옵니다.
- **"결제됨"과 "온체인에서 부여됨"은 별개의 사실입니다.** 결제된 라이선스는 체인이 부여를 확인할 때까지 **Paid, awaiting on-chain grant**로 표시되고, 그 후 **Active on chain**으로 바뀝니다. 탭은 체인에 부여가 반영되기 전에는 라이선스를 활성으로 표시하지 않습니다.
- **프로토콜 규칙과 프로그램 규칙을 구분해 표시합니다.** 각 파라미터 행은 그 값이 프로토콜(체인에서 읽음)에서 오는지 프로그램(Association이 적용)에서 오는지 알려줍니다.
- **셀프 서비스 테스트넷 라이트 노드 라이선스.** **Free testnet licence** 아래에 `qor1...` 주소를 입력하고 **Request licence**를 선택하면, 부여가 자동으로 서명되며 보통 몇 분 안에 완료됩니다. 메인넷 부여는 수작업으로 유지됩니다.
- **노드 단계는 네트워크의 릴리스 매니페스트를 따릅니다.** 다운로드(서버 에디션 `lightnode-sx`, 데스크톱 에디션 `lightnode-ux`, 플랫폼별, SHA-256 체크섬 포함), 등록이 열려 있는지 여부, 단계가 현재 것인지 여부는 모두 매니페스트에서 가져옵니다.

## 사용 방법 {#how-to-use}

모든 탭의 전제 조건: 로그인. 탭들은 헤더의 네트워크 전환을 따릅니다(체인 확인, 다운로드, 노드 상태는 선택한 네트워크에서 읽어옵니다). 로그아웃 상태에서는 페이지에 "Authentication Required"가 표시됩니다. [로그인](/dashboard/overview#sign-in)을 참고하세요.

### Validator Program {#validator-program}

검증인이 네트워크에 합류하는 방식인 **QoreChain Validator Program**에 대한 읽기 전용 개요입니다: 프로그램이 제공하는 것(온체인 운영자 부여, Association이 관리하는 스테이크로부터의 위임, 서비스 수준을 충족하는 독립 운영자를 위한 QOR 지원금), 프로그램의 요건, 선정 절차, FAQ를 담고 있습니다. **Apply**와 **Ask a question** 버튼이 있습니다. 프로토콜 파라미터(언본딩 기간, 슬래싱, 최대 검증인 수)는 체인에서 실시간으로 읽어오며, 프로그램 규칙(100,000 QOR 셀프 스테이크, 수수료율 범위, 지원금)은 Association의 규칙이며 그렇게 표시됩니다. 검증인은 패키지를 구매하지 않습니다: 신청을 하고, 선정된 후에만 **$1,000 프로그램 수수료**를 납부합니다. 지원금 금액은 탭 자체에서 확인하세요.

### Validator Application {#validator-application}

1. **신청서를 작성하세요.** 법인명, 관할권, 연락처 이메일; **운영자 주소**(`qor1...`, `create-validator`를 실행할 계정이며, 온체인 운영자 부여는 이 주소로 발급됩니다); 호스팅 제공자, 지역, 유형; 현재 운영 중인 네트워크; 선택적으로 테스트넷 검증인 주소(`qorvaloper1...`)와 제공하는 공개 인프라(공개 RPC, 스냅샷, 아카이브); 트랙(표준, 또는 예약된 좌석을 위한 글로벌); 그리고 프로그램 약관 동의를 입력합니다. **Submit application**을 선택합니다. 신청은 무료입니다.
2. **검토 및 테스트넷 시험 운영.** 신청은 **Application submitted**로 표시되고, 다음 단계로 진행되는 신청은 **Testnet trial**(`qorechain-diana`에서 검증인을 실행하는 14일간의 시험 운영)로 표시됩니다. 거절된 신청은 **Not selected**와 함께 **Apply again**이 표시됩니다.
3. **선정과 프로그램 수수료.** 선정된 신청에는 **Selected**와 함께 **Pay the $1,000 programme fee** 버튼이 표시됩니다. 네트워크(ERC-20, BEP-20 또는 TRC-20의 USDT)를 선택하고, 표시된 정확한 금액을 지불한 뒤, 트랜잭션 해시를 붙여넣고 **Verify payment**를 선택하면 결제가 온체인에서 검증됩니다. 수수료는 신청서의 운영자 주소에 묶이며, 다른 주소로 납부할 수 없습니다. 승인과 결제는 별도로 표시됩니다: 신청이 선정되었더라도 아직 미결제 상태일 수 있습니다. 결제 후 카드에는 "Programme fee paid"가 표시됩니다.
4. **온체인 운영자 부여.** 결제 후 Association이 운영자 주소에 `validator_operator` 부여를 온체인으로 발급합니다. 메인넷 부여는 수작업으로 일괄 서명되므로 즉시 이루어지지 않습니다. 체인에 부여가 반영되는 즉시 탭에 **Operator grant on chain**이 표시되고, 검증인이 본딩되면 **In the active set**이 표시됩니다.
5. **준비 상태.** 제출됨, 시험 운영, 선정됨, 부여됨 상태의 신청에는 **Validator Readiness** 패널(주소 입력란 포함)이 운영자 주소에 대해 체인을 확인합니다. 본인의 노드에서 [PQC 키 등록](/developer-guide/running-a-validator#pqc-key-registration)을 일찍 실행하세요: 누구도 그 키를 대신 등록해 주지 않습니다.

이전 검증인 제안(2026년 10월 이전)에 따라 승인된 신청은 **Earlier application**으로 표시되며, Association이 해당 신청자에게 직접 연락합니다.

### Light Node {#light-node}

라이선스부터 등록된 노드까지, 라이트 노드 운영자에게 필요한 모든 것을 담고 있습니다.

1. **라이선스를 구매하세요(메인넷).** 라이트 노드 라이선스는 **$50**이며, ERC-20, BEP-20 또는 TRC-20의 USDT로 결제하고 온체인에서 검증됩니다. 라이선스를 부여받을 `qor1...` 주소를 입력하고, USDT 네트워크를 선택한 뒤 **Buy for $50**을 선택하세요. 복구 단어를 직접 보유한 계정(본인의 단어, Keplr 또는 `qorechaind`)을 사용하고, 가능하면 노드 전용 계정을 사용하세요. 결제 후 카드에는 **Payment received**가 표시되고 온체인 부여가 이어집니다. 아래에 **Your past orders**가 나열됩니다.
2. **온체인 부여를 기다리세요.** 라이선스에는 **Paid, awaiting on-chain grant**가 표시되며, 체인이 `lightnode_operator` 부여를 확인하면 **Active on chain**으로 바뀝니다. 메인넷 부여는 수작업으로 일괄 서명됩니다.
3. **노드를 설치하고 등록하세요.** 탭에는 네트워크에 게시된 빌드와 체크섬, 그리고 현재 릴리스의 단계가 나열됩니다: 키링 암호를 설정한 뒤 `lightnode-sx onboard`, `lightnode-sx keys add-operator --recover`(라이선스 대상 계정을 추가), `lightnode-sx register`(노드의 포스트 양자 키를 연결하고 등록하며, 주소의 스테이크가 부족하면 `--delegate-to <qorvaloper...>`를 추가), 그다음 `lightnode-sx start`와 `lightnode-sx status`입니다. 이 단계는 네트워크의 릴리스 매니페스트가 이를 지원하는 빌드를 게시한 경우에만 현재 단계로 표시되며, 탭은 등록이 열려 있는지도 알려줍니다.
4. **주소에 대한 안내.** 라이선스 주소가 본인의 수탁형 Dashboard 지갑 중 하나인 경우 탭이 경고합니다("This address cannot run a node": Dashboard가 그 키를 보관합니다). 또한 주소에 이미 온체인 포스트 양자 키가 있는 경우에도 안내합니다(복구 단어에서 파생된 키라면 노드가 이를 재사용하고, 그렇지 않으면 거부하며 전용 계정을 권장합니다).
5. **상태.** 패널이 현재 적용 중인 요건과 라이트 노드가 등록되어 있고 제때 보고하고 있는지 여부를 보여줍니다. 표시되는 상태에는 "Registered, waiting for its first heartbeat", "Rewards accrued", 그리고 노드가 비활성으로 표시되었을 때의 안내가 포함됩니다.

#### 무료 테스트넷 라이선스 {#testnet-licence}

테스트넷(`qorechain-diana`)에서는 판매하는 것이 없으며("Nothing is sold on testnet") 라이트 노드 라이선스는 무료이며 셀프 서비스입니다:

1. 헤더를 **Testnet**으로 설정하고 **Light Node** 탭을 엽니다.
2. **Free testnet licence** 아래에 `qor1...` 주소를 입력하고 **Request licence**를 선택합니다.
3. 요청은 "Requested for ..."로 표시되고, 이어서 "Granted to ... You can register your node now."가 표시됩니다. 부여를 서명하지 못한 경우 탭이 그렇게 알려 주며 다시 요청할 수 있습니다.

부여는 자동으로 서명되며, 보통 몇 분 안에 완료됩니다. 요청은 계정당 한 번, 주소당 한 번입니다. **최소 예제:** Testnet, **Light Node**, **Request licence**, "Granted to ..."가 나올 때까지 기다린 다음, `lightnode-sx onboard`부터 `register`까지 실행합니다.

[라이트 노드 개요](/light-node/overview)와 [등록 및 라이선싱](/light-node/registration-and-licensing)을 참고하세요.

:::note 주소가 필수가 되기 전에 구매한 라이선스
주소를 수집하기 전에 라이선스를 구매했다면, 탭이 **This licence needs a QoreChain address**라는 안내와 함께 열립니다: 주소를 입력하고 **Save address**를 선택하세요. 저장되기 전까지는 라이선스가 부여될 수 없습니다.
:::

### Node Registration {#node-registration}

검증인의 세부 정보를 Association에 기록합니다. 온체인에서 검증인을 생성하지는 않으며, 그 작업은 본인의 노드에서 `create-validator`로 수행합니다. 부여가 온체인에 반영되기 전까지 탭은 잠겨 있습니다.

체인에 운영자 주소에 대한 활성 `validator_operator` 부여가 표시되고, 선정된 Validator Program 신청(또는 프로그램 이전의 검증인 라이선스)을 보유하고 있으면 양식이 열립니다. 운영자 주소, **Moniker**, 5%에서 20% 사이의 **Commission**, 선택적인 엔드포인트를 입력하고, 확인 사항(100,000 QOR 셀프 스테이크, 21일 언본딩 기간, 슬래싱)에 체크한 뒤 **Register validator**를 선택합니다.

온체인 단계는 [검증인 운영하기](/developer-guide/running-a-validator)에 있습니다: PQC 키를 등록한 다음, 다른 모든 QoreChain 트랜잭션과 마찬가지로 PQC 공동 서명된 `create-validator`를 최소 100,000 QOR의 셀프 스테이크와 함께 제출합니다. 스테이킹과 검증인 생성은 오직 네이티브 트랜잭션 레인에서만 이루어지며, MetaMask와 같이 연결된 EVM 지갑을 통해 검증인을 등록하거나 본딩하는 경로는 존재하지 않습니다. 양식 아래에는 릴리스 매니페스트에서 가져온 풀 노드에 필요한 항목(릴리스 바이너리, 제네시스, 피어)도 나열되며, 네트워크가 새 검증인을 받지 않을 때는 "Joining is temporarily suspended" 배너가 표시될 수 있습니다. [스테이킹 및 검증인](/dashboard/staking-and-validators)을 참고하세요.

### Rollups {#rollups}

탭의 제목은 **Request a Rollup**입니다. 양식을 작성합니다: 이름, 가상 머신(EVM, QoreChain Native 또는 SVM), 데이터 가용성 계층(QoreChain DA, Celestia 또는 EigenDA), 가스 토큰, 시퀀서(Shared sequencer, Dedicated (single) 또는 Decentralized), 정산 대상(QoreChain mainnet 또는 Ethereum)을 지정한 뒤 **Request deployment**를 선택합니다. 이는 요청만 기록하며, 요청은 양식 아래에 상태와 함께 나열됩니다. 이 단계에서 온체인에는 아무것도 생성되지 않습니다. 선택 가능한 옵션은 온체인 롤업 모듈이 현재 지원하는 범위보다 넓습니다. 온체인에서 직접 롤업을 등록하려면 [롤업 배포하기](/rollups/deploying-a-rollup)를, 개념은 [롤업 개요](/rollups/overview)를 참고하세요.

## 접근 방법 {#how-to-access}

- **URL:** [dashboard.qorechain.io/tools](https://dashboard.qorechain.io/tools), 또는 사이드바 **Build** 그룹의 **Nodes & Validators**.
- **로그인:** 두 네트워크 모두에서 페이지 전체에 필요합니다.
- **네트워크:** 헤더를 따릅니다. $50 라이선스 구매는 메인넷 전용이며, 무료 라이선스는 테스트넷 전용입니다.
- **비용:** 신청은 무료입니다. 검증인 프로그램 수수료는 $1,000이며 선정된 후에만 납부합니다. 메인넷 라이트 노드 라이선스는 $50이고, 테스트넷 라이선스는 무료입니다.
- **지갑:** 노드를 위해 복구 단어를 직접 보유한 계정. 탭을 읽는 데는 지갑이 필요 없습니다.

## 게시 위치 {#where-published}

| 화면 | 주소 | 네트워크 |
| --- | --- | --- |
| Nodes & Validators | `dashboard.qorechain.io/tools` | 메인넷과 테스트넷, 헤더 전환 |
| 노드 다운로드와 체크섬 | Light Node 탭 | 네트워크별 릴리스 매니페스트 |
| SDK 및 빌더 도구 | [개발자](/dashboard/developers) | 둘 다 |

## 제한 사항 및 알려진 문제 {#limits}

- **메인넷 부여는 수작업이며** 일괄 서명되므로, 결제된 라이선스는 "Paid, awaiting on-chain grant" 상태로 대기합니다. 테스트넷 부여는 자동입니다.
- **무료 테스트넷 요청은** 계정당, 주소당 한 번입니다.
- **Rollups는 두 네트워크 모두에서 요청 양식이며,** 온체인에는 아무것도 생성하지 않습니다.
- **검증인 합류는 일시 중단될 수 있습니다**("Joining is temporarily suspended" 배너).
- **USDT 수신 정보와 지원금 금액은** 결제 또는 신청 시점에 탭 안에서만 표시됩니다.

네트워크 전반에서 라이선싱이 어떻게 작동하는지에 대해서는 [체인 라이선싱](/architecture/chain-licensing)을 참고하세요.
