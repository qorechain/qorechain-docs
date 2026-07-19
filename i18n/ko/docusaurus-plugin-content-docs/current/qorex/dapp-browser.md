---
slug: /qorex/dapp-browser
title: dApp 브라우저
sidebar_label: dApp 브라우저
sidebar_position: 7
---

# dApp 브라우저 (모바일)

QoreX에는 인앱 **dApp 브라우저**가 포함되어 있어, 지갑을 벗어나지 않고도 QoreChain 애플리케이션을 사용할 수 있으며, 모든 서명은 명시적으로 승인됩니다.

## dApp에 연결하기

홈 탭에서 **dApp 브라우저**를 열고 앱으로 이동하세요. QoreX는 페이지에 자체 프로바이더를 주입합니다 — QoreChain 연결 프로바이더, 읽기 전용 EVM 프로바이더, 그리고 다른 실제 지갑을 **절대 가로채지 않는** 정중한 `keplr` / `ethereum` 별칭입니다.

- **연결**은 **오리진마다 한 번의 승인**만 필요합니다. 승인하면 해당 사이트에는 공개 주소만 공개됩니다.
- **모든 서명**은 각각 생체 인증으로 보호되는 별도의 승인이며, 페이로드가 **디코딩**되어 서명하는 내용을 정확히 확인할 수 있습니다 — **블라인드 서명은 없습니다**.
- **브라우저를 닫으면 모든 권한이 소멸됩니다** — 연결은 세션 범위로 한정됩니다.

## Q-Day Scanner

홈 탭의 빠른 버튼에서 **Q-Day Scanner**도 열 수 있습니다. 임의의 주소를 입력하면 해당 주소의 양자 노출 보고서를 받을 수 있습니다 — 어떤 자금이 클래식 전용 키에 있고 어떤 자금이 이미 포스트 양자 보호를 받고 있는지 확인할 수 있습니다. [보안 및 복구](/qorex/security-and-recovery#q-day-scanner)를 참고하세요.

## 설정 빠른 참조

**Settings**의 기타 유용한 컨트롤:

- **Security dashboard** → [보안 및 복구](/qorex/security-and-recovery)
- **Your addresses** 및 **Linked account** → [계정 및 Dashboard](/qorex/account-and-dashboard)
- **Use testnet (developers)** — `qorechain-diana` 테스트넷(EVM chain ID 9800)으로 전환합니다. 앱은 재시작 없이 실시간으로 다시 바인딩됩니다. 기본값은 항상 메인넷입니다.
- **Portfolio animation** — Aurora 배경을 켜고 끕니다.
- **Network status** — 활성 엔드포인트와 함께 "Connected to …"를 표시합니다.

## 플랫폼 참고 사항

- **iOS** — Face ID(최초 사용 시 사용 안내 프롬프트가 표시됨), Secure Enclave 볼트, 시스템 인증 시트를 통한 로그인, 그리고 기기 연동 및 QR 스캔을 위한 카메라 권한.
- **Android** — StrongBox Keystore를 사용하는 BiometricPrompt, `qorex://` 플로우(인증 콜백, connect, tx, link)를 위해 등록된 딥 링크, 그리고 기기 연동을 위한 카메라 권한.

데스크톱 dApp의 경우, 대신 [브라우저 확장 프로그램](/qorex/browser-extension)을 사용하세요.
