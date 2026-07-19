---
slug: /qorex/security-and-recovery
title: Security & Recovery
sidebar_label: Security & Recovery
sidebar_position: 5
---

# Security & Recovery

Everything about protecting and recovering your wallet lives in **Settings → Security dashboard**. The Home tab also shows a **Backup health** card that keeps warning until social recovery is set up.

## Post-quantum key {#pqc-key}

The Security dashboard shows the live on-chain state of your post-quantum key: **"Registers with your first transfer"** → **"Registered on-chain ✓"**. The algorithm is **ML-DSA-87** (deterministic, hybrid with secp256k1).

**Key rotation** — rotating your post-quantum key (an on-chain `MsgRotatePQCKey` operation) requires a fresh biometric ceremony and is **never automated**. See [Key rotation](/developer-guide/post-quantum-signing#key-rotation) for the underlying mechanism.

## Social recovery {#social-recovery}

Social recovery lets trusted **guardians** help you restore your wallet without ever seeing your recovery phrase.

- Your seed is split into **ML-KEM-sealed shares** distributed to guardians as a **threshold** scheme (t-of-n): any *t* of your *n* guardians can help you recover, but fewer cannot.
- Each guardian receives a credential. Setup writes nothing readable to the relay — only opaque, sealed envelopes.
- A recovery requires the threshold of guardians to approve, then runs a **48-hour timelock** and sends a **cancel alert** to you, so a malicious attempt can be stopped.

**Set it up:** Security dashboard → Social recovery → choose your guardians and threshold. The Backup health warning clears once this is done.

**Approve someone else's recovery:** if you are a guardian for someone, use **Help recover** on the Home tab to approve their request.

## Legacy Protocol {#legacy}

**Legacy Protocol** is quantum-safe inheritance: a dead-man's switch layered over your guardians, so your assets can pass to your chosen beneficiaries if you become unreachable. It is optional and configured from the Security dashboard.

## Link a new device {#link-device}

Move your wallet to a second phone or tablet with **no server and no typing** of the 24 words:

1. **New device** → onboarding → **Link from another device**. It shows a one-time **10-character code** and opens the camera.
2. **Old device** → Settings → Security → **Link a new device** → type that code → confirm with biometrics. A **QR code** appears (your seed sealed with a key derived from the code: scrypt N=2¹⁷ → AES-256-GCM).
3. **New device** scans the QR → it decrypts locally → same wallet, same addresses.

**Why it's safe:** the code and the QR never appear on the same screen. A photo of the QR alone is ciphertext behind a memory-hard key-derivation function, and both artifacts are one-time and disappear with the screens. A wrong code gives a clean error — just retry.

:::note
Device linking is a **convenience**, not a recovery method. Your 24-word phrase and social recovery are your real safety nets.
:::

## Connected dApps {#connected-dapps}

dApp connections are **per-origin** and **session-scoped**: closing the in-app dApp browser revokes every connection. You can review and disconnect active connections in the Security dashboard.

## Linked signers & spending limits {#linked-signers}

When you link external keys (Phantom / MetaMask) through the [Dashboard](/qorex/account-and-dashboard#dashboard), each one gets **scoped permissions** and a **SpendingRule** that is enforced **on-chain**, not just in the interface. Key management can never be delegated to a linked key. See [Linked Wallet Authenticators](/developer-guide/account-abstraction#authenticators) for the on-chain model. The dashboard always shows the current on-chain truth.

## Q-Day Scanner {#q-day-scanner}

The **Q-Day Scanner** lets you enter any address — yours or anyone's — and get a quantum-exposure report: which funds sit on classical-only keys and which are already post-quantum protected. Reach it from the Home tab quick buttons.

## Security model, in brief

1. **Non-custodial** — keys are generated on-device, live in hardware-backed vaults (mobile) or an encrypted vault (extension), and never leave.
2. **Nothing without consent** — every connection is per-origin, every signature is individually approved (biometric on mobile), and payloads are always decoded before signing.
3. **Quantum-safe by default** — Native-lane QOR transfers always carry ML-DSA-87 + secp256k1; anything classical is labeled, never silent.
4. **No data collection** — no analytics, tracking, or ads. Optional account sign-in is covered by the [QoreChain privacy policy](https://qorechain.io/privacy).
5. **Recovery paths** — 24-word phrase (always), social recovery with guardians + 48h timelock (optional), Legacy inheritance (optional), device linking (convenience).
