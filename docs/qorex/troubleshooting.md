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
| **"Secure your device first"** at onboarding | Enroll Face ID / a fingerprint in your system settings, then return to the app. A wallet can only be created on a biometric-protected device. |
| **Sign-in sheet closed** / "That sign-in attempt expired" | A previous attempt was abandoned — just tap sign-in again. |
| **"Add a passkey" missing** after Google / Dashboard sign-in | Expected: passkeys attach only to email-code accounts (see the note in [Account & Dashboard](/qorex/account-and-dashboard#sign-in)). |
| **"Handles coming soon"** | The @handle registry is temporarily unreachable. Your wallet is unaffected; handles light up automatically when it returns. |
| **"Wrong code or damaged QR"** during device linking | Re-check the 10-character code (the alphabet omits look-alikes: no 0/O/1/I/L) and rescan. Both artifacts are one-time. |
| **Camera screen says permission needed** | iOS: Settings → QoreX → Camera. Android: App info → Permissions → Camera. |
| **Extension: "No wallet yet"** | The extension pairs with a wallet created in the QoreX mobile app — create one there first. |
| **Send from a read-only address refused** | That address belongs to another wallet (the label shows which). QoreX can only sign for its own derived accounts — send from the wallet that owns it. |
| **Testnet badge showing** | Settings → **"Use testnet (developers)"** is on. Turn it off to return to mainnet. |
| **Swap button is disabled** | Expected for now — Swap turns on automatically once pool liquidity is available; no app update is needed. |

## Still stuck?

- Review the [Security & Recovery](/qorex/security-and-recovery) page for guardians and device linking.
- For questions about QoreChain itself, see the [main documentation](/introduction/what-is-qorechain) or the community channels linked on [qorechain.io](https://qorechain.io).
