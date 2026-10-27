---
slug: /qoresign/guides/evm-quantum-ready
title: "EVM 지갑: 승인 윈도우"
sidebar_label: EVM 승인 윈도우
sidebar_position: 3
---

# EVM 지갑: 승인 윈도우

Ethereum 트랜잭션에는 두 번째 서명을 실어 보낼 필드가 없으며, 네트워크는 PQC 설정을 레인별이 아니라
체인 전체에 적용합니다. 따라서 QoreChain의 EVM 레인에서 전송되는 트랜잭션은 secp256k1로만 서명되며,
QoreSign은 하이브리드 EVM 서명을 제공하지 않습니다(`assertHybridLane("evm")`은
`LANE_NOT_AVAILABLE`을 던집니다).

대신 네트워크는 발신자가 등록된 ML-DSA-87 키를 가지고 있고 해당 트랜잭션을 포함하는 유효한
**EVM 승인 윈도우**가 열려 있을 때만 EVM 트랜잭션을 받아들입니다.
윈도우는 하이브리드로 서명된 트랜잭션으로 Native 레인에서 열리므로, 포스트 양자 키가 EVM 활동을
미리 승인하게 됩니다. EVM 트랜잭션 자체는 secp256k1로만 서명됩니다. 두 공개 네트워크 모두 이를 강제합니다(프로토콜 기능
`evm-pqc-authorisation-window`, [QoreChain SDK](/sdk/overview)의 `fetchProtocolFeatures` 또는
`/qorechain/pqc/v1/protocol_features`에서 확인할 수 있습니다).

## EVM 계정 절차 {#steps}

1. Native 레인에서 계정에 ML-DSA-87 키를 등록합니다
   (`buildRegisterPqKeyMessage`,
   [등록](/qoresign/spec/hybrid-signing-v1#registration) 참고). `eth_secp256k1` 계정의 경우
   동일한 20바이트 주소가 `qor1` 형식으로도 표현되므로, 이를 `sender`로 사용합니다.
2. 하이브리드로 서명된 Native 레인 트랜잭션으로 윈도우를 엽니다. 만료 높이, EVM 트랜잭션 최대 개수,
   최대 금액, 그리고 선택적으로 호출할 수 있는 컨트랙트를 지정합니다. QoreChain SDK에는 윈도우
   메시지용 컴포저가 있습니다.
3. 윈도우가 열려 있는 동안 어떤 EIP-1193 지갑에서든 EVM 트랜잭션을 보냅니다.
   윈도우 밖이거나 한도를 초과하면 네트워크가 이를 거부하므로, secp256k1 키만으로는
   EVM 레인에서 가치를 이동할 수 없습니다.

네트워크가 EVM 레인에 레인별 PQC를 추가하면, QoreSign은 새 마이너 버전에서 하이브리드 EVM 모드를
추가할 예정입니다.

## MetaMask 및 기타 EIP-1193 지갑 {#eip-1193-wallets}

MetaMask와 기타 EIP-1193 지갑은 `eth_sendTransaction`에 ML-DSA-87 서명을 추가할 수 없습니다.
이러한 지갑에서는 ML-DSA-87 키를 가진 지갑에서 여는 윈도우가 사용 가능한 방법입니다.
