---
slug: /qorex/account-and-dashboard
title: Account & Dashboard
sidebar_label: Account & Dashboard
sidebar_position: 6
---

# Account & Dashboard

QoreX works **fully without an account** — your keys never depend on one. Signing in only adds conveniences like @handles, payment requests, and Dashboard pairing.

## Sign in {#sign-in}

You can sign in from **Sign in** on the Home tab, or during onboarding. Methods:

- **Email code** — enter your email and receive a one-time code. After this sign-in, QoreX offers to add a **passkey** for instant future sign-ins (Face ID / Touch ID / PIN). This is an *account* passkey — it never touches your wallet keys.
- **Passkey** — if you enrolled one previously.
- **Continue with Google** — a single native hop through the system authentication sheet (the app never bounces out to a browser).
- **Continue with QORECHAIN Dashboard** — sign in with an existing Dashboard account (including its Google login) and import your profile.

:::note
The passkey offer appears only after **email-code** sign-in. When you sign in with an identity provider (Google or Dashboard), that provider manages its own authentication, so a passkey cannot be attached to those accounts.
:::

## Several accounts from one phrase {#accounts}

Settings → **Your accounts** (also findable as **Addresses**) lets you create, switch, and rename up to **20 accounts**, all derived from the same 24-word recovery phrase (there is nothing extra to back up). Each account is its own distinct `qor1…` address with its own balance, and — because a handle binds to an **address**, not to the wallet as a whole — its own optional @handle. Whichever account is active is the one Send, Receive, Staking, and the dApp browser use — switching moves everything with it, and the app shows which account you're on whenever more than one exists. Since **0.2.2**, the browser extension has this feature too — see [Several accounts from one phrase](/qorex/browser-extension#wallet).

One recovery phrase restores every account, but each account registers its own ML-DSA-87 post-quantum key on-chain the first time it transacts — same as a regular single-account wallet — so opening and using a new account carries that account's own one-time key-registration cost.

## @handle {#handle}

Claim a unique name (for example `@liviu`) bound to your address by **dual signatures** (a registry ed25519 signature + your own secp256k1 signature). Anyone can then send to your @handle. Resolution is **verify-then-pin** (trust-on-first-use), so if a handle's key is ever silently changed, QoreX flags it.

Because a handle binds to an address rather than to your wallet, claiming one is **per address** — if you have [several accounts](#accounts), each can carry its own @handle, and claiming one for an account doesn't automatically give the others a name. The browser extension can also claim a handle for its own single address, straight from the popup.

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

## Next steps

- [Security & Recovery](/qorex/security-and-recovery) — linked signers and spending limits build on this pairing.
- [dApp Browser](/qorex/dapp-browser) — connect to apps from inside QoreX.
