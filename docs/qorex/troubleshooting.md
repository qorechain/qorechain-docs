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
| **"Secure your device first"** at onboarding | Set up Face ID / a fingerprint **or a screen lock (PIN / pattern)** in your system settings, then return. A wallet can only be created on a device with a strong unlock factor. On Android, 2D face unlock alone is a *weak* biometric - the PIN behind it is what qualifies. |
| **Sign-in sheet closed** / "That sign-in attempt expired" | A previous attempt was abandoned - just tap sign-in again. |
| **"Add a passkey" missing** after Google / Dashboard sign-in | Expected: passkeys attach only to email-code accounts (see the note in [Account & Dashboard](/qorex/account-and-dashboard#sign-in)). |
| **"Handles coming soon"** | The @handle registry is temporarily unreachable. Your wallet is unaffected; handles light up automatically when it returns. |
| **Extension: paying an @handle fails with an error about the lookup** | Fixed in extension **0.3.7** and later (every store now serves 0.3.8 or later). If your extension is older, update it from your browser's extension page; until then paste the `qor1…` address instead, or use the mobile app. |
| **The extension has no way to claim an @handle** | Expected: claiming needs a signed-in account and happens in the mobile app. Once claimed, you can pay and resolve it from the extension. |
| **A handle I tried to claim is refused as reserved** | Names that imitate QoreChain (its brand names, or trust words such as *official*, *support*, *airdrop*, *treasury*, including look-alike spellings) are reserved. Choose a different handle. |
| **An approval says QoreX cannot show the request, or refuses it as ambiguous** | QoreX will not show a request it cannot decode, or one whose bytes could be read two ways (for example a field repeated so that a fee or amount reads differently on screen than on chain). Do not look for a workaround - the site is sending something unsafe or unsupported. |
| **QoreX warns that a handle's address changed** | Expected security behavior, not a bug - QoreX remembers the address a handle resolved to the first time you paid it, and flags a later change rather than silently trusting it. Confirm the new address out-of-band with the recipient before continuing. |
| **Send refused for "more than your available balance"** on a vesting account | Part of your balance is still locked by a vesting schedule. Only the **available** portion (shown on Home, Send, and Asset detail) can be sent; the rest unlocks gradually. |
| **A wallet-request says it's "for testnet/mainnet, but your wallet is on…"** | The request (e.g. from the Dashboard) targets a different network than the one you're currently connected to. Switch networks yourself first if that's what you intended - QoreX will not switch for you. |
| **"Wrong code or damaged QR"** during device linking | Re-check the 10-character code (the alphabet omits look-alikes: no 0/O/1/I/L) and rescan. Both artifacts are one-time. |
| **Camera screen says permission needed** | iOS: Settings → QoreX → Camera. Android: App info → Permissions → Camera. |
| **Extension: no wallet on first open** | The extension is a **standalone** wallet - open the popup and choose **Create a new wallet** or **Import a recovery phrase**. It does not require the mobile app. |
| **Send from a read-only address refused** | That address belongs to another wallet (the label shows which). QoreX can only sign for its own derived accounts - send from the wallet that owns it. |
| **Testnet badge showing** | Settings → **"Use testnet (developers)"** is on. Turn it off to return to mainnet. |
| **Swap button is disabled** | Expected for now (Android) - Swap turns on automatically once pool liquidity is available; no app update is needed. The Swap tab is not shown on iOS, and the extension has no Swap screen. |
| **I uninstalled the app / removed the extension and now see no wallet** | The vault lived only on that device or in that browser. If you had backed up your 24-word phrase, restore with it. If you had set up [social recovery](/qorex/security-and-recovery#social-recovery), start a recovery with your guardians. Without either, the wallet cannot be recovered - see [Back up now](/qorex/security-and-recovery#back-up-now) to protect any new wallet immediately. |
| **I can't find my 24 words / the app never showed them to me** | The mobile app does not show the phrase while it creates the wallet. Open **Settings → Security → Reveal recovery phrase** and confirm with biometrics or your device PIN, then write the words down. In the extension, use **Reveal recovery phrase** in the popup (your password is required). If the wallet is only on a phone you have already lost, QoreChain cannot recover it - see [Back up now](/qorex/security-and-recovery#back-up-now). |
| **A funded account disappeared from "Your accounts"** | Nothing is lost - every account re-derives from your recovery phrase, so this is a display issue, not data loss. This was a real, now-fixed bug on mobile builds before **1.0.9**: a momentary failed read from the device's secure storage (most likely right at unlock) could show a shortened account list. Update QoreX (the fix shipped in 1.0.9 and every later version); if you're already current and this happens, closing and reopening the app should bring it back - tapping "add an account" would create a **new** one rather than restore the missing one, so avoid that until the existing account reappears. |
| **"The EVM lane needs an open authorisation window for this account. Open one here first - MetaMask cannot."** (or "Your EVM authorisation window has run out", or "That authorisation window was refused") | A MetaMask / EVM-lane transaction was refused because the account has no open window (or it ran out of blocks, transactions or value). Open one under [EVM access window](/qorex/security-and-recovery#evm-window) (it is for Ethereum-style coin-60 accounts), then retry. Open it *before* you send - opening a window advances the account nonce, so a transaction prepared earlier fails with "nonce too low". If your account has no ML-DSA-87 key yet, QoreX tells you to register one first. |
| **"This network needs an updated QoreX. Update the app and try again - nothing was sent."** | The network verifies a newer signing form than your build produces. Update QoreX from your store and retry; nothing was sent and no fee was taken. |
| **"Too many transactions from this account in a short time. Wait a minute and try again."** | The network limits how many transactions one account can send in a short period. Wait a minute. |
| **"That address can't receive ordinary transfers."** | The network refuses plain transfers to that address (some system or module addresses). Check the recipient. |
| **"Not enough unlocked QOR to pay the network fee. Vesting QOR cannot pay fees…"** or **"Claiming needs about … QOR unlocked"** | Claims and unstaking pay their fee from your *unlocked* balance (before rewards arrive). Send a small amount of QOR to that address, then try again. |
| **"The network ran out of gas before finishing. The fee was taken and nothing moved - your rewards are still there."** | The transaction reached a block and failed there. Try again; the fee for the failed attempt is spent. |
| **"Unstaking this much would drop your validator's self-bond below the required 100,000 QOR."** | Only validator operators meet this: the self-bond floor applies for as long as the validator runs. Unstake less. |
| **"Account 'qor1…' does not exist on chain"** when sending from an account restored from the Dashboard or MetaMask | Update QoreX to the current version; the account is an Ethereum-style (coin 60) account - see [Restore a phrase from MetaMask or the Dashboard](/qorex/getting-started#restore-dashboard). The first send also registers that account's ML-DSA-87 key (one extra small fee). |
| **I restored my phrase and my second account / my funds are missing** | Restoring brings back **Account 1** only. Tap **Add an account** (and, for a phrase used in MetaMask or on the Dashboard, **Add an Ethereum account (coin 60)**) in Settings → Your accounts - the accounts re-derive at the same addresses. |
| **Extension: "Wallets" says the passkey was turned off** | Adding or removing a wallet re-seals the vault and drops passkey unlock (it could not cover the new wallet). Turn it on again from the popup home screen; Firefox never offers passkey unlock. |
| **No push notification arrived** | Push is mainnet-only and needs notifications allowed for QoreX in your phone's settings, plus the **Push notifications** switch on (Home → bell). It tells you only that QOR arrived, not the amount; the **Notifications** list in the app shows the details. |
| **Android: the Back button** | Back goes to the previous screen; on Home it exits the app. |

## Still stuck?

- Review the [Security & Recovery](/qorex/security-and-recovery) page for guardians and device linking.
- For questions about QoreChain itself, see the [main documentation](/introduction/what-is-qorechain) or the community channels linked on [qorechain.io](https://qorechain.io).
