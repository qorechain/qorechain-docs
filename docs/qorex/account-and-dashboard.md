---
slug: /qorex/account-and-dashboard
title: Account & Dashboard
sidebar_label: Account & Dashboard
sidebar_position: 6
---

# Account & Dashboard

QoreX works **fully without an account** — your keys never depend on one. Signing in adds conveniences such as payment requests and Dashboard pairing; claiming an @handle may also ask you to sign in.

## Sign in {#sign-in}

You can sign in from **Sign in** on the Home tab, or during onboarding. Methods:

- **Email code** — enter your email and receive a one-time code. After this sign-in, QoreX offers to add a **passkey** for instant future sign-ins (Face ID / Touch ID / PIN). This is an *account* passkey — it never touches your wallet keys.
- **Passkey** — if you enrolled one previously.
- **Sign in with Apple** *(iOS only)* — Apple shares only your name and email, and lets you hide your real address behind a private-relay one.
- **Continue with Google** — a single native hop through the system authentication sheet (the app never bounces out to a browser).
- **Continue with QORECHAIN Dashboard** — sign in with an existing Dashboard account (including its Google login) and import your profile.

:::note
The passkey offer appears only after **email-code** sign-in. When you sign in with an identity provider (Apple, Google or Dashboard), that provider manages its own authentication, so a passkey cannot be attached to those accounts.
:::

## Several accounts from one phrase {#accounts}

Settings → **Your accounts** lets you create and switch between up to **20 accounts** per wallet, all derived from the same 24-word recovery phrase (there is nothing extra to back up). Each account is its own `qor1…` address with its own balance, its own optional @handle (a handle binds to an **address**, not to the wallet), and — after its first send — its own post-quantum key. Tap an account to make it the one in use. Whichever account is active is the one Send, Receive, Staking and the dApp browser use — switching moves everything with it, and the app shows which account you're on whenever more than one exists. Accounts are numbered *Account 1, 2, …*; they cannot be renamed. The browser extension has the same screen — see [Several accounts from one phrase](/qorex/browser-extension#wallet).

- **Add an account** adds the next account on the same phrase. A new account registers its own quantum-safe key the first time it sends, which costs a small one-time network fee.
- **Add an Ethereum account (coin 60)** is for a recovery phrase first used in MetaMask or on the QoreChain Dashboard — that is where its funds are. It uses the Ethereum path `m/44'/60'` and is labelled *Ethereum · coin 60*; its `0x…` address is the same on every EVM network and is the same key as that QoreChain account. See [Restore a phrase from MetaMask or the Dashboard](/qorex/getting-started#restore-dashboard).
- **Restoring** a phrase on a new device brings back **Account 1** only; use **Add an account** (and **Add an Ethereum account (coin 60)**) to bring back the others. The Addresses screen (**Settings → Your addresses**) is separate: it lists every account in this wallet plus read-only addresses linked from other wallets.

## @handle {#handle}

Claim a unique name (for example `@liviu`) bound to your address by **dual signatures** (a registry ed25519 signature + your own secp256k1 signature). Anyone can then send to your @handle. Resolution is **verify-then-pin** (trust-on-first-use), so if a handle's key is ever silently changed, QoreX flags it.

Because a handle binds to an address rather than to your wallet, claiming one is **per address** — if you have [several accounts](#accounts), each can carry its own @handle, and claiming one for an account doesn't automatically give the others a name. In the browser extension you can pay a handle; claiming from the popup is offered on ordinary QoreChain accounts in some versions and not in others — if the popup does not offer it, claim from the mobile app. Ethereum-style (coin 60) accounts have no handle.

If the handle registry is temporarily unreachable, the screen degrades to **"Handles coming soon"** and everything else keeps working; handles light up again automatically when the registry returns.

:::note Claiming a handle vs. linking to the Dashboard
These are two separate, unrelated actions. Claiming an @handle lets **other people send to you by name** — it does nothing on its own beyond that. Linking to the Dashboard (below) connects your wallet to a Dashboard account so the two can show the same data. You can do either without the other.
:::

## Linked account {#linked-account}

**Settings → Linked account** connects your QoreX wallet and your Dashboard account both ways:

1. Enter the 8-character code shown by the Dashboard, **or** mint one in QoreX (valid 10 minutes) and type it into the Dashboard.
2. If you have [several accounts](#accounts), QoreX's own approval window lets you pick **which one** links — it doesn't assume the currently active account.
3. Once linked, your @handle and connected addresses appear on both.
4. Unlink anytime.

Signing in *via* **Continue with Dashboard** links the two implicitly — there is nothing extra to do.

## Dashboard integration {#dashboard}

With the Dashboard connected:

- **Connect with QoreX** on the Dashboard pairs it to your wallet via a `qorex://connect` deep link plus a signed ownership proof.
- **Transfers initiated on the Dashboard** arrive in QoreX as `qorex://tx` requests. They are decoded, shown to you in full, and signed **only in the app** after biometric approval — and only from the app's own derived address. Because a `qor1…` address is equally valid on mainnet and testnet, every Dashboard-initiated request states which network it targets, and QoreX refuses to act on it if that doesn't match the network you're currently connected to — it never switches networks on a request's behalf.
- If a Connect or transfer request arrives while you are **not signed in**, QoreX offers an inline **"Sign in to Dashboard"** step so you can continue without hitting a dead end.
- **Your addresses (Settings)** — lists every account derived from this wallet, plus **read-only** addresses you linked from other wallets (Keplr / MetaMask / Phantom). Read-only entries are labeled with the wallet that created them; trying to send from one explains that you must send from the wallet that created it.

## Delete your account {#delete-account}

Settings → **Delete account** (the red entry at the bottom). After a confirmation and one biometric unlock, QoreX permanently erases: this device's wallet and private keys; your @handle in the QoreX registry (if any); your QoreChain Dashboard account (if you signed in); and your social recovery setup (if configured). It cannot be undone. Because QoreX is non-custodial, **if you have not backed up your recovery phrase you will lose access to any funds** — back it up first. The server-side removals are best-effort; the on-device wipe always completes and returns the app to the first-launch screen.

## Next steps

- [Security & Recovery](/qorex/security-and-recovery) — backup, recovery and the EVM access window.
- [dApp Browser](/qorex/dapp-browser) — connect to apps from inside QoreX.
