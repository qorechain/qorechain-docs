---
slug: /qorex/security-and-recovery
title: Security & Recovery
sidebar_label: Security & Recovery
sidebar_position: 5
---

# Security & Recovery

Everything about protecting and recovering your wallet lives in **Settings → Security**. The Home tab also shows a **Backup health** card that keeps warning until social recovery is set up. The card tracks social recovery only: it cannot tell whether you have written your recovery phrase down, so do that yourself (see below).

## Back up now — nobody can recover a lost wallet for you {#back-up-now}

:::danger Read this before you fund your wallet
QoreX is **non-custodial**: your keys exist only on your own device, and QoreChain Association has no copy of them, no master key, and no way to reset or restore your wallet. **There is no "forgot password" flow, no support ticket, and no customer-service override** — if you lose access to your keys with no backup in place, the funds are gone, permanently and irreversibly. This is true of every non-custodial wallet, not a QoreX limitation, but it is worth stating plainly.

**Do at least one of these — right after you create your wallet, not later:**

1. **Write down your 24-word recovery phrase** and store it somewhere offline and durable (not a screenshot, not a note synced to the cloud, not a message to yourself). It is the only thing that can restore your wallet on any device, at any time — on mobile, reveal it from **Settings → Security → Reveal recovery phrase** (the app does **not** show it while it creates the wallet, so you have to go and get it — do it straight away); in the extension it is shown once when you create the wallet, and any time from **Reveal recovery phrase** in the popup. See [Restore an existing wallet](/qorex/getting-started#2-restore-an-existing-wallet).
2. **Set up [social recovery](#social-recovery)** with guardians you trust. This lets you recover your wallet even if you lose the phrase, without any single guardian ever being able to access your funds alone.

Doing both is the safest option — the phrase covers you if you switch devices or the app is unavailable; guardians cover you if you lose the phrase itself.

**Uninstalling the app deletes your keys from that device.** The mobile app's vault and the browser extension's vault each live only on the device that created them. Uninstalling the app, resetting the phone, or removing/clearing the extension deletes that copy — with no backup and no linked device, your wallet cannot be recovered by anyone, including QoreChain. **Removing a wallet from a phone or a browser** (Settings → Wallets → *Remove from this phone*, or *Remove from this browser* in the extension) deletes that wallet's key from the device in the same way — your funds stay on chain, but only its recovery phrase can bring it back.
:::

## Post-quantum key {#pqc-key}

The **Security** screen shows the live on-chain state of your post-quantum key: **"Registers with your first transfer"** → **"Registered on-chain ✓"**. The algorithm is **ML-DSA-87** (deterministic, hybrid with secp256k1).

**Key rotation** — rotating your post-quantum key (an on-chain `MsgRotatePQCKey` operation) is **not yet available inside QoreX**; it will arrive with a later key-management update, will require a fresh biometric confirmation, and is **never automated**. Websites cannot ask QoreX to register, migrate or rotate your post-quantum key. See [Key rotation](/developer-guide/post-quantum-signing#key-rotation) for the underlying mechanism.

## Social recovery {#social-recovery}

Social recovery lets trusted **guardians** help you restore your wallet without ever seeing your recovery phrase.

- Your seed is split into **ML-KEM-sealed shares** — by default three, of which any **two** can help you recover (a 2-of-3 threshold scheme); one alone cannot.
- Each guardian receives a credential. Setup writes nothing readable to the relay — only opaque, sealed envelopes.
- A recovery requires the threshold of guardians to approve, then runs a **48-hour timelock** and sends a **cancel alert** to you, so a malicious attempt can be stopped.

**Set it up:** Home → **Set up recovery** (or Settings → Security → Social recovery) → **Create guardian credentials**. QoreX creates three credentials — *Guardian 1*, *Guardian 2* and a *Printable backup* — and any **2 of the 3** can help you recover. Give one to each trusted person or device and keep the printable backup somewhere safe. The Backup health warning clears once this is done.

**Approve someone else's recovery:** if you are a guardian for someone, use **Help recover** on the Home tab to approve their request.

## Legacy Protocol {#legacy}

**Legacy Protocol** is quantum-safe inheritance: a dead-man's switch layered over your guardians, so your assets can pass to your chosen beneficiaries if you become unreachable. It is optional and configured from Settings → Security.

## Link a new device {#link-device}

Move your wallet to a second phone or tablet with **no server and no typing** of the 24 words:

1. **New device** → onboarding → **Link from another device**. It shows a one-time **10-character code** and opens the camera.
2. **Old device** → Settings → Security → **Link a new device** → type that code → confirm with biometrics. A **QR code** appears (your seed sealed with a key derived from the code: scrypt N=2¹⁷ → AES-256-GCM).
3. **New device** scans the QR → it decrypts locally → same wallet, same addresses.

**Why it's safe:** the code and the QR never appear on the same screen. A photo of the QR alone is ciphertext behind a memory-hard key-derivation function, and both artifacts are one-time and disappear with the screens. A wrong code gives a clean error — just retry.

:::note
Device linking is a **convenience**, not a recovery method. Your 24-word phrase and social recovery are your real safety nets.
:::

## EVM access window {#evm-window}

From chain **v3.2.0**, a transaction on the **EVM lane** — for example one you sign in MetaMask against QoreChain's EVM network — is admitted only from an account that has a **registered post-quantum key** *and* an **open authorisation window**. Opening a window is a QoreChain Native-lane message that MetaMask cannot produce, so QoreX is where you open it. QoreX's own sends use the Native lane and never need a window.

Open it in the app at **Settings → Security → EVM access window**, or with the **EVM access window** button in the extension popup. You choose:

| Field | Meaning | Limit |
|---|---|---|
| **How long (blocks, max 17280)** | how long the window stays open | up to 17,280 blocks (about 15 hours on mainnet) |
| **How many transactions (max 1000)** | how many EVM transactions it admits | up to 1,000 |
| **Spending cap, QOR — covers each amount sent PLUS its maximum fee** | the most it lets through | counts value **plus** each transaction's maximum fee |

The defaults are 300 blocks (about 16 minutes on mainnet), 5 transactions and 1 QOR. Opening costs a normal network fee and is signed with the usual hybrid post-quantum signature, and a new window **replaces** any window that is already open. Opening it also advances your account's nonce, so open the window **first**, then send from MetaMask — a transaction prepared earlier will be refused with "nonce too low". **Close the window** is offered only while a window is live.

The screen shows one of four states: *Open for \{blocks\} more blocks · \{txs\} transactions · \{value\} QOR left*; *No window is open. MetaMask transactions from this account are refused.*; *That window has expired or is used up*; or *QoreX could not read the window from the network* — which means QoreX does not know, **not** that you have none. If your account has no post-quantum key yet, register one first (your first QoreX transfer does it); a window will not help before that.

:::caution Keep it small and short
A window lets ordinary MetaMask transactions move your QOR **without a post-quantum signature**. Keep the limits low, and close the window when you are done.
:::

QoreX itself never sends on QoreChain's EVM lane; use MetaMask or another EVM wallet for that, inside an open window. (Sending ETH, BNB and other assets on *other* networks from QoreX is a different thing — see [External networks & tokens](/qorex/send-and-receive#external-networks-tokens).)

## What the approval window shows {#approvals}

Every signature QoreX produces is approved by you, and the approval lists exactly what you are signing. QoreX shows:

- a title and labelled fields for **every message** in the request, including messages nested inside an authz **MsgExec** and the terms of permission grants — and it **refuses** anything it cannot display ("QoreX cannot read this message … Approve only if you trust this site completely");
- the **fee** (*Fee: \{amount\} · gas \{gas\}*), who pays it and any fee grant — if the fee cannot be read, QoreX says so and tells you not to approve;
- the **limit, allowed action and expiry** of spending allowances and authz grants, with *UNLIMITED* and *NEVER* written out. Anything unreadable, unlimited or endless needs a **second tap** on Approve (*Tap again to approve*);
- the signing account (*Signed by …*) when you have several;
- for a request with a very large number of messages, the first 50 and a count of the rest.

A wallet or account switch, or locking the wallet, answers waiting requests with "no"; a site can have one request waiting, and three can wait in all. Field names in approval windows are shown in English in some builds.

## Your recovery phrase and accessibility tools {#phrase-privacy}

The recovery phrase screen is hidden from screenshots and the app switcher. On **Android 14 and later** the words are also withheld from accessibility services that are not genuine accessibility tools (TalkBack and other real screen readers can still read them). On older Android and on iOS the words are hidden from screen readers by default; if you rely on a screen reader, tap the notice on that screen to let it read them. Reveal the phrase only when nobody can see your screen.

## Connected dApps {#connected-dapps}

dApp connections are **per-origin**. In the app they are also **session-scoped**: closing the in-app dApp browser revokes every connection, so nothing stays connected in the background (the **Connected dApps** card in Settings → Security just says so). In the browser extension, connections persist until you remove them — open **Connected sites** in the popup to see every site this wallet approved and **Revoke** any of them.

## Linked signers & spending limits {#linked-signers}

Linking an external key (Phantom or MetaMask) as a **linked signer** with its own spending limits is **not available inside QoreX yet** — Settings → Security shows the card, with the action marked *coming*. Nothing is linked to your wallet unless you did it yourself outside QoreX. Key management can never be delegated to a linked key. For the on-chain model, see [Linked Wallet Authenticators](/developer-guide/account-abstraction#authenticators).

## Q-Day Scanner {#q-day-scanner}

The **Q-Day Scanner** lets you enter any address — yours or anyone's — and get a quantum-exposure report: which funds sit on classical-only keys and which are already post-quantum protected. Reach it from the Home tab quick buttons.

## Security model, in brief

1. **Non-custodial** — keys are generated on-device, live in hardware-backed vaults (mobile) or an encrypted vault (extension), and never leave.
2. **Nothing without consent** — every connection is per-origin, every signature is individually approved (biometric on mobile), and payloads are always decoded before signing — what QoreX cannot decode, it refuses.
3. **Quantum-safe by default** — Native-lane QOR transfers always carry ML-DSA-87 + secp256k1; anything classical is labeled, never silent.
4. **No analytics, no tracking, no ads.** Optional account sign-in and push notifications use a server only when you turn them on, and are covered by the [QoreChain privacy policy](https://qorechain.io/privacy).
5. **Recovery paths** — 24-word phrase (always), social recovery with guardians + 48h timelock (optional), Legacy inheritance (optional), device linking (convenience).
