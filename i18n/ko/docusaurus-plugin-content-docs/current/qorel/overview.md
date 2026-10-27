---
slug: /qorel/overview
title: QORel 개요
sidebar_label: 개요
sidebar_position: 1
---

# QORel

QORel은 QoreChain의 IBC 릴레이어입니다. 릴레이어는 두 체인 사이에서 IBC 패킷, 증명, 클라이언트 업데이트를 전달하는 프로그램이며, 릴레이어가 실행되고 있지 않으면 IBC 채널을 통한 전송은 대기 상태로 남습니다. QORel은 QoreChain 채널의 릴레이를 직접 운영하려는 운영자, 밸리데이터, 팀을 위한 것이며, QoreChain에 트랜잭션을 제출할 수 있는 릴레이어가 필요한 모든 사람을 위한 것입니다.

QoreChain은 모든 네이티브 레인 트랜잭션에 하이브리드 포스트 양자 서명(secp256k1과 ML-DSA-87, FIPS 204)을 요구하는데, 기본 릴레이어는 이 서명을 만들지 못하므로 QoreChain은 그 트랜잭션을 거부합니다. QORel은 QoreChain에 대해서는 이 서명을 추가하고, 그 밖의 모든 Cosmos SDK 체인에는 표준 방식으로 서명합니다. 바이너리는 `qorel` 하나이며 Apache-2.0으로 공개됩니다. QORel은 Informal Systems가 만든 IBC 릴레이어 [Hermes](https://github.com/informalsystems/hermes) 1.13.3(Apache-2.0)의 포크입니다. 릴레이어 엔진의 공은 그들에게 있으며, QORel은 추가 서명이 필요하지 않은 모든 체인에 대해 Hermes의 명령과 설정을 그대로 유지합니다.

QORel 0.1.0은 **테스트넷 전용**입니다. QoreChain 테스트넷 `qorechain-diana`와 Cosmos Hub 공개 테스트넷(체인 ID `provider`) 사이에서 릴레이한 이력이 있습니다. 메인넷 IBC는 아직 열려 있지 않으며, 메인넷 지원은 그곳에 채널이 열릴 때 추가됩니다.

## 혁신 {#innovations}

- **체인별 서명 모드.** 설정의 각 체인에는 `signing`이 있습니다. `'qorechain-hybrid'`는 QoreChain이 검증하는 ML-DSA-87 서명을 추가합니다. 기본값인 `'standard'`는 Hermes와 바이트 단위로 동일한 트랜잭션을 만들므로, 같은 QORel 프로세스 하나가 QoreChain과 Cosmos Hub 쪽을 나란히 릴레이할 수 있습니다.
- **플러그인 방식의 서명 계층.** `qorel-signer` 크레이트는 포스트 양자 프리미티브, 체인의 sign-bytes 규칙, 트랜잭션 확장 서명기를 각각 별도의 조각으로 정의합니다. 릴레이어는 auth info가 확정된 뒤, 클래식 서명 문서가 만들어지기 전에 이를 호출하며, 가스 시뮬레이션도 같은 경로를 거칩니다. 다른 추가 서명을 쓰는 체인에는 릴레이어 변경이 아니라 이 크레이트에 새 프레이머가 필요합니다. 계약은 [모든 언어에서 서명하기](/qorel/signing-from-any-language)를 참고하세요.
- **키 명령의 포스트 양자 키 처리.** `qorel keys add`는 계정과 같은 니모닉에서 QoreChain 지갑 파생 방식으로 ML-DSA-87 키를 파생하므로, 릴레이어 키는 QoreX나 SDK가 파생하는 키와 일치합니다. `qorel keys register-pqc`는 소유 증명과 함께 공개 키를 한 번 등록합니다. `qorel keys pqc-status`는 키가 준비되었는지 보고합니다.
- **모든 전송 전 검사.** 하이브리드 체인에 트랜잭션을 보내기 전에 QORel은 포스트 양자 키가 체인에 등록되어 있고 로컬에 보관 중인 키와 같은지 확인하며, 체인에서 sign-bytes 버전을 읽습니다. 하나라도 어긋나면 아무것도 보내지 않으므로, 체인이 거부할 트랜잭션에 수수료가 소모되지 않습니다.
- **QoreChain 수수료 시장에서 가져오는 가스 가격.** `dynamic_gas_price.backend = 'cosmos-evm-feemarket'`은 고정된 추정값 대신 체인의 기본 수수료(최소 가스당 0.1 uqor)를 읽습니다.
- **ibc-go v10 체인의 misbehaviour(비정상 행위) 탐지.** ibc-go v10은 더 이상 `update_client` 이벤트에 헤더를 넣지 않으며, 기본 Hermes 1.13은 이런 체인에서 misbehaviour 탐지를 끕니다. QORel은 대신 `MsgUpdateClient` 트랜잭션에서 헤더를 읽으므로 탐지가 계속 동작합니다.
- **속도 제한이 걸린 엔드포인트에 대한 복원력.** 릴레이나 클리어링 시도가 실패한 동안(예: 공개 엔드포인트가 잠시 `429`로 응답한 뒤) 패킷 워커는 계속 살아 있으며 매 클리어 간격마다 재시도합니다. 클리어링 라운드가 성공한 뒤에만 유휴 상태로 중지합니다.
- **소유자 전용 키 파일.** 저장된 포스트 양자 시드를 포함한 키 파일은 모드 0600으로 기록됩니다.
- **실제 네트워크에서 검증됨.** QoreChain 테스트넷의 첫 IBC 채널인 `qorechain-diana`의 `transfer/channel-0`과 Cosmos Hub 공개 테스트넷의 `channel-600`은 QORel이 릴레이합니다. 양방향 전송, 전송된 토큰의 반환, 만료된 전송의 자동 환불을 테스트했습니다. [테스트 채널](/user-guide/bridging-assets#ibc-test-channel)을 참고하세요.

릴리스별 전체 목록은 [새로운 내용](/qorel/whats-new)에 있습니다.

## 라이브 테스트넷 연결 {#testnet-connection}

| | `qorechain-diana` | Cosmos Hub 공개 테스트넷 (`provider`) |
|---|---|---|
| 라이트 클라이언트 | `07-tendermint-0` | `07-tendermint-466` |
| 연결 | `connection-0` | `connection-315` |
| 채널 | `transfer/channel-0` (`STATE_OPEN`, unordered, 버전 `ics20-1`) | `transfer/channel-600` |

이 연결에는 두 가지 토큰 트레이스가 있습니다. QoreChain 테스트넷의 ATOM은 `ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2`(트레이스 `transfer/channel-0/uatom`)입니다. Hub 테스트넷의 QOR은 `ibc/BB4D5A9372637A885CC895F775B38B127354A31F3E20D8F6FB3997E34BF4AA4A`(트레이스 `transfer/channel-600/uqor`)입니다. 이 경로를 추가하는 chain-registry 풀 리퀘스트([cosmos/chain-registry#8086](https://github.com/cosmos/chain-registry/pull/8086))는 열려 있으며 병합되지 않았습니다. 메인넷에는 IBC 채널이 없습니다.

테스트한 내용: 양방향 전송(1 QOR 송신, 0.1 ATOM 수신, 0.4 QOR 반환)과 타임아웃 1초 전송의 자동 환불(타임아웃 메시지로 릴레이됨). `qorechain-diana`에서의 릴레이어 트랜잭션 13건이 모두 성공했습니다(코드 0).

### 서드파티 릴레이어에 필요한 것 {#third-party}

테스트넷은 `07-tendermint` 라이트 클라이언트 유형만 허용합니다(`/ibc/core/client/v1/params`가 `allowed_clients = ["07-tendermint"]`를 나열). 현재 `08-wasm` 클라이언트는 만들 수 없습니다. QoreChain으로 채널을 열려면 릴레이어에 다음이 필요합니다.

- 양쪽에 각각 `07-tendermint` 클라이언트
- QoreChain 쪽에서는 ML-DSA-87 키가 등록된 릴레이어 계정이 모든 트랜잭션을 하이브리드로 서명할 것. QORel은 이를 수행하며, 기본 Hermes, Go 릴레이어(`rly`), ts-relayer는 거부됩니다.
- 버전이 `ics20-1`인 ICS-20 전송 채널

IBC v2 클라이언트 설정에도 릴레이어 허용 목록은 없습니다(`/ibc/core/client/v2/config/07-tendermint-0`이 `allowed_relayers: []`로 응답). IBC v2 패킷은 절대 Unix 초 단위 타임아웃을 사용합니다. QORel은 아직 IBC v2를 릴레이하지 않습니다.

## qorel-signer {#qorel-signer}

서명기는 QORel 저장소의 `crates/qorel-signer`에 있는 별도 크레이트 `qorel-signer`입니다. crates.io에는 없으므로 git 의존성으로 사용하세요. 이 크레이트가 보장하는 것:

- **플러그인 방식의 공동 서명기.** 체인의 추가 서명은 공동 서명기가 더하며, 표준 서명 체인은 아무것도 쓰지 않으므로 해당 체인의 트랜잭션은 바뀌지 않습니다.
- **원시 protobuf 바이트.** 인코딩된 바이트로 동작하며 IBC나 릴레이어 타입에 의존하지 않습니다.
- **본문 정책.** 체인이 거부할 본문을 거절합니다. 이미 있는 critical 확장 옵션, `unordered` 플래그, 알 수 없는 필드가 그 예입니다.
- **버전을 추측하지 않음.** sign-bytes 버전을 알기 전에는 QoreChain 네트워크에서 v1 sign bytes로 되돌아가지 않습니다.
- **스스로 검증하는 서명.** 모든 서명은 사용 전에 검증됩니다.
- **비밀 값 처리.** 비밀 값은 제로화되며 `Debug` 출력에서 가려집니다.
- **바이트 단위 테스트.** 테스트는 체인의 ante 핸들러가 수락한 릴레이 트랜잭션을 바이트 단위로 다시 구성합니다.

사용 예는 저장소의 `crates/qorel-signer/README.md`에 있으며, [모든 언어에서 서명하기](/qorel/signing-from-any-language#signer-layer)도 참고하세요. 같은 서명기 훅은 업스트림 Hermes에 [informalsystems/hermes#4435](https://github.com/informalsystems/hermes/pull/4435)로 제안되어 있습니다(열려 있음, 병합되지 않음).

## 사용 방법 {#how-to-use}

바이너리를 설치하고, 체인마다 항목을 하나씩 둔 설정을 작성하고, 각 체인에 키를 추가하고, QoreChain에 포스트 양자 키를 등록하고, 준비 상태를 확인한 다음 릴레이어를 시작합니다.

```bash
qorel keys add --chain qorechain-diana --key-name relayer --mnemonic-file ./relayer.mnemonic
qorel keys register-pqc --chain qorechain-diana
qorel keys pqc-status --chain qorechain-diana    # ready_to_relay must be true
qorel health-check
qorel start
```

이 섹션의 페이지:

| 페이지 | 다루는 내용 |
|---|---|
| [새로운 내용](/qorel/whats-new) | 0.1.0이 Hermes 위에 추가하는 것 |
| [설치](/qorel/install) | 타르볼, `.deb`, `.rpm`, Homebrew, 컨테이너, 소스 빌드, 그리고 각각의 검증 방법 |
| [빠른 시작](/qorel/quickstart) | 설치부터 테스트넷에서의 첫 전송까지 |
| [설정](/qorel/configuration) | QoreChain 체인 항목, 키, 가스, 안전 검사 |
| [밸리데이터 옆에서 실행하기](/qorel/running-next-to-a-validator) | systemd, Docker Compose, Kubernetes 구성 |
| [모니터링](/qorel/monitoring) | 텔레메트리, 알림을 걸어야 할 대상 |
| [모든 언어에서 서명하기](/qorel/signing-from-any-language) | 하이브리드 서명 계약과 다섯 가지 언어용 라이브러리 |
| [문제 해결](/qorel/troubleshooting) | 질문과 해결 방법 |

## 접근 방법 {#how-to-access}

- **네트워크.** 테스트넷 `qorechain-diana`만 해당합니다(테스트넷은 v3.2.6 실행 중). 메인넷 `qorechain-vladi`에는 열려 있는 IBC 채널이 없습니다. 각 네트워크의 현황은 [자산 브리징](/user-guide/bridging-assets#ibc-testnet-v326)을 참고하세요.
- **상대방.** `channel-600`을 통한 Cosmos Hub 공개 테스트넷(체인 ID `provider`). 다른 Cosmos SDK 체인도 예제 설정의 `provider` 항목과 같은 방식으로 동작합니다.
- **엔드포인트.** QORel은 체인마다 컨센서스 RPC, WebSocket, gRPC 엔드포인트가 필요합니다. QoreChain 테스트넷에는 공개 RPC(`https://rpc-testnet.qore.host`)와 REST(`https://api-testnet.qore.host`)가 있지만 현재 공개 gRPC 엔드포인트는 없고 제공 예정도 없으므로, `qorechain-diana`용 서드파티 릴레이어는 자체 테스트넷 노드가 필요합니다([노드 운영](/developer-guide/running-a-node), [테스트넷 연결하기](/getting-started/connecting-to-testnet)). 릴레이어에 속도 제한을 거는 공개 엔드포인트는 짧은 테스트에는 쓸 수 있지만 꾸준한 릴레이에는 맞지 않습니다.
- **계정.** 체인마다 수수료용 소액 잔액이 있는 전용 릴레이어 계정 하나. 테스트넷 QOR은 [대시보드 포셋](/dashboard/faucet)에서 받으며 가치가 없습니다. 밸리데이터 운영자 키는 절대 사용하지 마세요.
- **비용.** QORel은 무료입니다. QoreChain에서 트랜잭션 비용은 가스에 가격을 곱한 값이며 최소 가스당 0.1 uqor이고, 수수료 전액이 환불 없이 부과됩니다.
- **플랫폼.** Linux x86_64 및 arm64(glibc 2.28 이상), macOS Apple Silicon 및 Intel, 그 밖의 환경을 위한 컨테이너 이미지. Windows는 지원하지 않으며 WSL2에서 컨테이너를 사용하세요.

## 배포 위치 {#where-published}

| 위치 | 내용 | 버전 |
|---|---|---|
| [GitHub: qorechain/QORel](https://github.com/qorechain/QORel) | 소스, 이슈, 그리고 타르볼, `.deb`, `.rpm`, `SHA256SUMS`, 빌드 증명이 있는 릴리스 페이지 | 0.1.0 |
| Homebrew | `brew install qorechain/tap/qorel` | 0.1.0 |
| `ghcr.io/qorechain/qorel` | 컨테이너 이미지(amd64 및 arm64, distroless, non-root, cosign 서명) | 0.1.0 |
| `qorel-signer` 크레이트 | 서명 계층, 저장소의 `crates/qorel-signer`에 있음. git 의존성을 사용하세요 | crates.io에는 없음 |

라이선스: Apache-2.0. QORel은 Informal Systems Inc.와 Hermes 저작자들이 저작권을 가진 Hermes에서 파생되었으며 마찬가지로 Apache-2.0입니다. 저장소의 `NOTICE` 파일에 출처 표기가 있습니다. 명령과 다운로드 검증 방법은 [설치](/qorel/install)를 참고하세요.

다른 개발자 패키지는 [개발자 패키지](/developer-tools/overview)를 참고하세요. IBC가 체인에 어떻게 들어맞는지는 [브리지 아키텍처](/architecture/bridge-architecture#ibc-relayer)를 참고하세요.

## 한계와 알려진 문제 {#limits}

- **테스트넷 전용.** QORel은 `qorechain-diana`와 Cosmos Hub 공개 테스트넷을 상대로 실행되었습니다. 메인넷에서 릴레이한 적이 없으며 열려 있는 메인넷 IBC 채널도 없습니다.
- **IBC v1(클래식)만 지원.** IBC v2 릴레이는 아직 QORel에 구현되어 있지 않으며 다음 단계입니다. Ethereum(Eureka) 릴레이는 시작하지 않았습니다.
- **체인 버전.** 하이브리드 모드는 체인이 보고하는 sign-bytes 버전을 따릅니다. 현재 두 QoreChain 네트워크 모두 최신 형식(버전 2)을 검증합니다.
- **호스팅 릴레이어 없음.** 이 매뉴얼은 릴레이어 서비스를 제공하지 않습니다. 채널에 실행 중인 릴레이어가 없으면 전송은 하나가 실행될 때까지 대기 상태로 남습니다.
- **공개 엔드포인트.** QoreChain 쪽에는 gRPC가 필요한데 공개되어 있지 않습니다. 다른 체인의 서드파티 공개 엔드포인트는 릴레이어에 속도 제한을 거는 경우가 많습니다.
- **지갑이 아닙니다.** QORel은 릴레이어로서 자신이 보내는 트랜잭션에만 서명합니다. 지갑 서명은 [QoreSign](/qoresign/overview)을 참고하세요.
- **Windows 빌드 없음.** WSL2에서 컨테이너를 사용하세요.
- **릴리스 상태.** QORel은 0.x 릴리스입니다. Hermes와 동일한 명령과 설정은 Hermes의 동작을 유지하며, QoreChain 전용 설정은 1.0 이전에 바뀔 수 있습니다.
