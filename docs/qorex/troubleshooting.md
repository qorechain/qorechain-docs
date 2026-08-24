---
slug: /qorex/troubleshooting
title: QoreX Troubleshooting
sidebar_label: Troubleshooting
sidebar_position: 9
---

# Troubleshooting

Common questions and quick fixes for the QoreX app and extension.

| Symptom | Cause / fix |
|---|---|
| **"Secure your device first"** at onboarding | Set up Face ID / a fingerprint **or a screen lock (PIN / pattern)** in your system settings, then return. A wallet can only be created on a device with a strong unlock factor. On Android, 2D face unlock alone is a *weak* biometric — the PIN behind it is what qualifies. |
| **Sign-in sheet closed** / "That sign-in attempt expired" | A previous attempt was abandoned — just tap sign-in again. |
| **"Add a passkey" missing** after Google / Dashboard sign-in | Expected: passkeys attach only to email-code accounts (see the note in [Account & Dashboard](/qorex/account-and-dashboard#sign-in)). |
| **"Handles coming soon"** | The @handle registry is temporarily unreachable. Your wallet is unaffected; handles light up automatically when it returns. |
| **QoreX warns that a handle's address changed** | Expected security behavior, not a bug — QoreX remembers the address a handle resolved to the first time you paid it, and flags a later change rather than silently trusting it. Confirm the new address out-of-band with the recipient before continuing. |
| **Send refused for "more than your available balance"** on a vesting account | Part of your balance is still locked by a vesting schedule. Only the **available** portion (shown on Home, Send, and Asset detail) can be sent; the rest unlocks gradually. |
| **A wallet-request says it's "for testnet/mainnet, but your wallet is on…"** | The request (e.g. from the Dashboard) targets a different network than the one you're currently connected to. Switch networks yourself first if that's what you intended — QoreX will not switch for you. |
| **"Wrong code or damaged QR"** during device linking | Re-check the 10-character code (the alphabet omits look-alikes: no 0/O/1/I/L) and rescan. Both artifacts are one-time. |
| **Camera screen says permission needed** | iOS: Settings → QoreX → Camera. Android: App info → Permissions → Camera. |
| **Extension: no wallet on first open** | The extension is a **standalone** wallet — open the popup and choose **Create wallet** or **Import wallet**. It does not require the mobile app. |
| **Send from a read-only address refused** | That address belongs to another wallet (the label shows which). QoreX can only sign for its own derived accounts — send from the wallet that owns it. |
| **Testnet badge showing** | Settings → **"Use testnet (developers)"** is on. Turn it off to return to mainnet. |
| **Swap button is disabled** | Expected for now — Swap turns on automatically once pool liquidity is available; no app update is needed. |
| **I uninstalled the app / removed the extension and now see no wallet** | The vault lived only on that device or in that browser. If you had backed up your 24-word phrase, restore with it. If you had set up [social recovery](/qorex/security-and-recovery#social-recovery), start a recovery with your guardians. Without either, the wallet cannot be recovered — see [Back up now](/qorex/security-and-recovery#back-up-now) to protect any new wallet immediately. |

## Still stuck?

- Review the [Security & Recovery](/qorex/security-and-recovery) page for guardians and device linking.
- For questions about QoreChain itself, see the [main documentation](/introduction/what-is-qorechain) or the community channels linked on [qorechain.io](https://qorechain.io).
