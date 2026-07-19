---
slug: /qorex/troubleshooting
title: QoreX 문제 해결
sidebar_label: 문제 해결
sidebar_position: 9
---

# 문제 해결

QoreX 앱과 확장 프로그램에 대한 일반적인 질문과 빠른 해결 방법입니다.

| 증상 | 원인 / 해결 |
|---|---|
| 온보딩 중 **"Secure your device first"** | 시스템 설정에서 Face ID 또는 지문을 등록한 다음 앱으로 돌아오세요. 지갑은 생체 인증으로 보호되는 기기에서만 생성할 수 있습니다. |
| **로그인 시트가 닫힘** / "That sign-in attempt expired" | 이전 시도가 중단된 것입니다 — 로그인을 다시 탭하기만 하면 됩니다. |
| Google / Dashboard 로그인 후 **"Add a passkey"가 없음** | 정상입니다: 패스키는 이메일 코드 계정에만 연결됩니다([계정 및 Dashboard](/qorex/account-and-dashboard#sign-in)의 참고 사항 확인). |
| **"Handles coming soon"** | @handle 레지스트리에 일시적으로 접근할 수 없습니다. 지갑에는 영향이 없으며, 레지스트리가 복구되면 핸들이 자동으로 활성화됩니다. |
| 기기 연결 중 **"Wrong code or damaged QR"** | 10자리 코드를 다시 확인하고(알파벳은 혼동되는 문자를 제외합니다: 0/O/1/I/L 없음) 다시 스캔하세요. 두 항목 모두 일회용입니다. |
| **카메라 화면에 권한이 필요하다고 표시됨** | iOS: 설정 → QoreX → 카메라. Android: 앱 정보 → 권한 → 카메라. |
| **확장 프로그램: "No wallet yet"** | 확장 프로그램은 QoreX 모바일 앱에서 생성한 지갑과 페어링됩니다 — 먼저 그곳에서 지갑을 생성하세요. |
| **읽기 전용 주소에서 보내기가 거부됨** | 해당 주소는 다른 지갑에 속합니다(라벨에 어느 지갑인지 표시됩니다). QoreX는 자신이 파생한 계정에 대해서만 서명할 수 있습니다 — 해당 주소를 소유한 지갑에서 보내세요. |
| **테스트넷 배지가 표시됨** | 설정 → **"Use testnet (developers)"**가 켜져 있습니다. 이를 꺼서 메인넷으로 돌아가세요. |
| **Swap 버튼이 비활성화됨** | 현재로서는 정상입니다 — 풀 유동성이 확보되면 Swap이 자동으로 켜지며, 앱 업데이트는 필요하지 않습니다. |

## 여전히 해결되지 않나요?

- 가디언 및 기기 연결에 대해서는 [보안 및 복구](/qorex/security-and-recovery) 페이지를 참고하세요.
- QoreChain 자체에 대한 질문은 [기본 문서](/introduction/what-is-qorechain) 또는 [qorechain.io](https://qorechain.io)에 링크된 커뮤니티 채널을 확인하세요.
