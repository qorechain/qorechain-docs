---
slug: /qorex/account-and-dashboard
title: 계정 및 Dashboard
sidebar_label: 계정 및 Dashboard
sidebar_position: 6
---

# 계정 및 Dashboard

QoreX는 **계정 없이도 완전하게 작동**합니다 — 키는 계정에 의존하지 않습니다. 로그인은 @handle, 결제 요청, Dashboard 페어링과 같은 편의 기능만 추가할 뿐입니다.

## 로그인 {#sign-in}

홈 탭의 **Sign in**에서 로그인하거나 온보딩 중에 로그인할 수 있습니다. 방법은 다음과 같습니다.

- **이메일 코드** — 이메일을 입력하면 일회용 코드를 받습니다. 이 로그인 이후 QoreX는 향후 즉시 로그인을 위한 **패스키**(Face ID / Touch ID / PIN) 추가를 제안합니다. 이것은 *계정* 패스키이며, 지갑 키에는 절대 접근하지 않습니다.
- **패스키** — 이전에 등록한 경우 사용합니다.
- **Continue with Google** — 시스템 인증 시트를 통한 단일 네이티브 이동입니다(앱이 브라우저로 튕겨 나가지 않습니다).
- **Continue with QORECHAIN Dashboard** — 기존 Dashboard 계정(해당 Google 로그인 포함)으로 로그인하고 프로필을 가져옵니다.

:::note
패스키 제안은 **이메일 코드** 로그인 후에만 나타납니다. 자격 증명 공급자(Google 또는 Dashboard)로 로그인하면 해당 공급자가 자체 인증을 관리하므로 그러한 계정에는 패스키를 연결할 수 없습니다.
:::

## @handle {#handle}

**이중 서명**(레지스트리 ed25519 서명 + 본인의 secp256k1 서명)으로 주소에 바인딩된 고유한 이름(예: `@liviu`)을 등록하세요. 그러면 누구나 당신의 @handle로 전송할 수 있습니다. 확인 방식은 **verify-then-pin**(최초 사용 시 신뢰, trust-on-first-use)이므로, 핸들의 키가 몰래 변경되면 QoreX가 이를 표시합니다.

핸들 레지스트리에 일시적으로 연결할 수 없는 경우 화면은 **"Handles coming soon"**으로 낮춰지고 나머지 모든 기능은 계속 작동합니다. 레지스트리가 복구되면 핸들은 자동으로 다시 활성화됩니다.

## 연결된 계정 {#linked-account}

**Settings → Linked account**는 QoreX 지갑과 Dashboard 계정을 양방향으로 연결합니다.

1. Dashboard에 표시된 8자리 코드를 입력하거나, QoreX에서 코드를 발급(10분간 유효)하여 Dashboard에 입력합니다.
2. 연결되면 @handle과 연결된 주소가 양쪽에 모두 표시됩니다.
3. 언제든지 연결을 해제할 수 있습니다.

**Continue with Dashboard**를 *통해* 로그인하면 두 계정이 암묵적으로 연결됩니다 — 추가로 할 일은 없습니다.

## Dashboard 통합 {#dashboard}

Dashboard가 연결된 상태에서는 다음이 가능합니다.

- Dashboard의 **Connect with QoreX**는 `qorex://connect` 딥 링크와 서명된 소유권 증명을 통해 지갑과 페어링합니다.
- **Dashboard에서 시작된 전송**은 QoreX에 `qorex://tx` 요청으로 도착합니다. 이 요청은 디코딩되어 전체 내용이 표시되며, 생체 인증 승인 후 **앱 내에서만**, 그리고 앱 자체의 파생 주소에서만 서명됩니다.
- **Your addresses (Settings)** — 이 지갑에서 파생된 모든 계정과 함께, 다른 지갑(Keplr / MetaMask / Phantom)에서 연결한 **읽기 전용** 주소를 나열합니다. 읽기 전용 항목에는 이를 생성한 지갑이 라벨로 표시되며, 그러한 주소에서 전송을 시도하면 이를 생성한 지갑에서 전송해야 한다는 안내가 표시됩니다.

## 다음 단계

- [보안 및 복구](/qorex/security-and-recovery) — 연결된 서명자와 지출 한도가 이 페어링을 기반으로 구축됩니다.
- [dApp 브라우저](/qorex/dapp-browser) — QoreX 내부에서 앱에 연결합니다.
