---
slug: /qorel/whats-new
title: QORel의 새로운 내용
sidebar_label: 새로운 내용
sidebar_position: 2
---

# QORel의 새로운 내용

이 페이지는 각 QORel 릴리스가 추가하는 내용을 나열합니다. Hermes에서, 또는 이전 QORel에서 옮겨 갈지 판단하는 운영자를 위한 것이며, 릴리스가 하는 일을 확인 가능한 동작으로만 서술합니다. QORel은 Hermes 1.13.3(Informal Systems, Apache-2.0)을 기반으로 하며, 아래의 모든 변경은 그 기반 위에 더해진 것입니다. 목록에 없는 것은 Hermes와 동일하게 동작합니다.

## 0.1.0 {#v0-1-0}

첫 릴리스. 테스트넷 전용입니다. 파일은 [릴리스 페이지](https://github.com/qorechain/QORel/releases)에 있습니다.

### 혁신 {#innovations}

- **QoreChain용 하이브리드 포스트 양자 서명.** 체인에 `signing = 'qorechain-hybrid'`를 설정하면 QORel은 ML-DSA-87 서명(`/qorechain.pqc.v1.PQCHybridSignature`)을 각 트랜잭션의 유일한 critical 확장 옵션으로 덧붙인 다음, 최종 본문에 secp256k1로 서명합니다. 포스트 양자 키가 서명하는 메시지는 버전 2 sign bytes이며, 두 QoreChain 네트워크 모두 이를 검증합니다. 정적 `extension_options`는 이 모드와 함께 쓸 수 없으며, 함께 있으면 설정이 거부됩니다.
- **표준 서명은 그대로입니다.** `signing = 'standard'`(기본값)에서는 Cosmos Hub, Osmosis 및 그 밖의 모든 Cosmos SDK 체인에 대해 트랜잭션 형식이 Hermes와 바이트 단위로 동일합니다.
- **`qorel-signer` 크레이트.** 포스트 양자 프리미티브(`PqSigner`, `MlDsa87Signer` 포함), 체인의 규칙(`SignBytesFramer`), 릴레이어가 호출하는 확장 서명기(`TxExtensionSigner`)는 각각 별도의 인터페이스입니다. 가스 시뮬레이션과 배치 크기 계산도 같은 경로를 거치므로, 추가되는 약 4.7 KB와 검증 가스가 항상 반영됩니다.
- **`qorel keys add`가 포스트 양자 키를 파생합니다.** 하이브리드 체인에서는 같은 니모닉과 계정으로부터 QoreChain 지갑 파생 방식으로 ML-DSA-87 키를 파생하고, 32바이트 시드만 키 옆에 `<key name>.pqc`로 저장합니다. 비밀 값은 출력되지 않습니다.
- **`qorel keys register-pqc`.** `MsgRegisterPQCKeyV2`를 한 번 전송하며, v3.2.3 이상의 네트워크에서는 소유 증명이 함께 들어갑니다. 멱등적이며(같은 키가 이미 등록되어 있으면 아무것도 보내지 않음), 계정에 이미 다른 키가 있으면 전송을 거부합니다. `--no-proof`는 v3.2.3보다 오래된 네트워크 전용으로만 존재합니다.
- **`qorel keys pqc-status`.** 키가 등록되어 있는지, 로컬 키와 일치하는지, 소유가 증명되었는지, 체인이 어떤 sign bytes를 검증하는지, 그리고 `ready_to_relay`를 출력합니다.
- **전송 전 안전 검사.** 하이브리드 체인에 트랜잭션을 보내기 전에 QORel은 키가 로드되어 있고, 등록되어 있고, 로컬 키와 동일한지, 그리고 sign-bytes 버전을 알고 있는지 확인합니다. `pqc.sign_bytes = 'auto'`에서는 체인의 적용된 업그레이드 기록에서 버전을 읽고, 1분마다 다시 읽으며, codespace `pqc` 코드 21로 거부된 뒤에도 다시 읽습니다. 어느 하나라도 실패하면 아무것도 보내지 않고 수수료도 소모되지 않으며, `health-check`가 그 이유를 보고합니다.
- **수수료 시장 가스 가격.** `dynamic_gas_price.backend = 'cosmos-evm-feemarket'`은 QoreChain의 기본 수수료를 읽으며, 그 최소값은 가스당 0.1 uqor입니다.
- **ibc-go v10 체인의 misbehaviour(비정상 행위) 탐지.** ibc-go v10은 더 이상 `update_client` 이벤트에 헤더를 포함하지 않으므로 QORel은 `MsgUpdateClient` 트랜잭션에서 헤더를 읽습니다. 기본 Hermes 1.13은 이런 체인에서 탐지를 비활성화합니다.
- **패킷 워커가 속도 제한을 견딥니다.** 릴레이나 클리어링 시도가 실패한 동안에도 워커는 계속 살아 있으며 매 클리어 간격마다 재시도합니다. Hermes에서는 마지막 클리어링 라운드가 실패했더라도 새 IBC 이벤트 없이 `clear_interval x 5` 블록이 지나면 워커가 중지되었고, 그 시점에 대기 중이던 패킷은 채널의 다음 패킷이나 재시작을 기다려야 했습니다.
- **소유자 전용 키 파일.** Hermes는 기본 umask로 키 파일을 기록했습니다. QORel은 `<key name>.json`과 `<key name>.pqc`를 모드 0600으로 기록합니다. 이전 Hermes로 추가한 키는 기존 모드를 유지하므로 `ls -l`로 확인하세요.
- **`qorel` 바이너리.** Hermes 명령 집합에 포스트 양자 키 명령을 더한 바이너리 `qorel` 하나입니다. 같은 CLI를 가진 `hermes` 바이너리도 소스 트리에서 함께 빌드됩니다.
- **출처 증명이 있는 릴리스.** Linux 및 macOS용 타르볼, 하드닝된 systemd 유닛이 포함된 `.deb` 및 `.rpm` 패키지, Homebrew 포뮬러, cosign으로 서명된 멀티 아키텍처 컨테이너 이미지. 릴리스 파일에는 `SHA256SUMS`와 빌드 증명이 함께 제공됩니다. [설치](/qorel/install)를 참고하세요.
- **로컬 데브넷 테스트.** 저장소에는 `scripts/qorel-devnet/`가 있으며, QoreChain 노드와 ibc-go v10 테스트 체인을 로컬에서 빌드하고 양방향 ICS-20 엔드 투 엔드 테스트를 실행합니다. 키 등록, 클라이언트·연결·채널 생성, 양방향 전송, 전송된 토큰의 반환, 타임아웃된 패킷의 클리어링과 환불, QORel이 직접 보낸 전송을 포함합니다.

### 테스트넷에서 검증됨 {#proven-on-the-testnet}

- QoreChain 테스트넷의 첫 IBC 채널인 `qorechain-diana`의 `transfer/channel-0`과 Cosmos Hub 공개 테스트넷(체인 ID `provider`)의 `channel-600`은 QORel이 릴레이합니다. 클라이언트는 `07-tendermint-0`과 `07-tendermint-466`, 연결은 `connection-0`과 `connection-315`입니다.
- 양방향 전송(1 QOR 송신, 0.1 ATOM 수신, 0.4 QOR 반환)과 타임아웃 1초 전송의 타임아웃 메시지를 통한 자동 환불을 테스트했습니다. `qorechain-diana`에서의 릴레이어 트랜잭션 13건이 모두 성공했습니다.
- 채널의 읽기 쪽 보기는 [자산 브리징](/user-guide/bridging-assets#ibc-test-channel)에 있습니다.

### 이번 릴리스에 없는 것 {#not-in-this-release}

- IBC v2 릴레이. QORel에 아직 구현되어 있지 않으며 다음 단계입니다.
- Ethereum(Eureka) 릴레이. 시작하지 않았습니다.
- 메인넷 릴레이. 아직 열려 있는 메인넷 IBC 채널이 없습니다.
- Windows 빌드.
- crates.io의 `qorel-signer` 크레이트. 게시가 막혀 있습니다. 크레이트는 저장소의 `crates/qorel-signer`에 있으므로 git 의존성을 사용하세요.

## 업그레이드 {#upgrading}

이전 QORel 릴리스는 없습니다. Hermes 1.13에서 QORel 0.1.0으로 옮기는 방법:

1. `hermes`와 나란히, 또는 그 대신 `qorel`을 설치합니다([설치](/qorel/install)).
2. `config.toml`은 그대로 둡니다. `signing`이 없는 체인은 표준 서명을 유지하며 이전처럼 동작합니다.
3. 서비스 파일의 명령을 `hermes`에서 `qorel`로 바꿉니다. 키 저장 폴더(기본값 `~/.hermes/keys`)는 바뀌지 않으며, 그래서 컨테이너 이미지가 데이터를 `/home/nonroot/.hermes`에 마운트합니다.
4. `ls -l`로 키 파일 모드를 확인합니다. 새 키는 0600이고 이전 키는 기존 모드를 유지합니다.

저장소의 `UPGRADING.md`에 있는 Hermes 업스트림 업그레이드 노트는 1.6보다 오래된 Hermes 버전에서 오는 모든 사용자에게 적용됩니다.
