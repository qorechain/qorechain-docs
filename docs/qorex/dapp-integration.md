---
slug: /qorex/dapp-integration
title: Integrate a dApp with QoreX
sidebar_label: dApp Integration
sidebar_position: 8
---

# Integrate a dApp with QoreX

This is the complete guide for a developer who wants a web app to work with the QoreX wallet: how to detect it, connect, send QoreChain transactions, sign messages, use EVM and Solana, handle refusals, and generate links that open QoreX. It covers the QoreX browser extension and the QoreX app's in-app dApp browser, and says where the two differ. The code samples were checked against the wallet's own code.

## Innovations {#innovations}

- **The page never holds the post-quantum key.** `signAndBroadcast` takes your messages; QoreX shows them decoded, adds the ML-DSA-87 layer that only the wallet can make, and broadcasts. cosmjs, cosmos-kit and Interchain Kit work unchanged through `getOfflineSigner`, and QoreX adds the same layer when the transaction has none.
- **Detection by capability, not by version.** `window.qorex.native.capabilities` lists what a build does, so one code path works on every release.
- **Nothing is taken over.** QoreX announces itself with EIP-6963 and the Solana Wallet Standard, never sets `window.keplr`, and never overwrites another wallet's `window.ethereum`.
- **Message signing with a post-quantum half.** `signArbitrary` signs with the account's classical key (ADR-36) and with ML-DSA-87. A server verifies both with `@qorechain/qoresign` against the key registered on chain.
- **EVM on QoreChain, explained to the user.** `personal_sign`, `eth_signTypedData_v4` and `eth_sendTransaction` are decoded on the device, simulated where the node allows, and the approval opens the per-transaction authorisation window QoreChain's EVM lane needs.
- **No blind signing, and a short list of things a site can never ask for.** A message QoreX cannot display is refused, and wallet-only messages (key management, spending rules, windows, grants) are refused from any site.
- **Links a service can generate.** Open a page in the app, ask for a payment signed by the recipient's own key, or hand over an agent proposal.

## What QoreX injects {#injected}

On every page, QoreX adds one object, `window.qorex`, with three providers:

| Provider | What it is |
|---|---|
| `window.qorex.native` | The QoreChain (Cosmos) lane. Keplr-style: `enable`, `getKey`, `signAndBroadcast`, `signDirect`, `signArbitrary`, `verifyArbitrary`, `getOfflineSigner*`, plus a `capabilities` list. It is not a Keplr drop-in. |
| `window.qorex.evm` | An EIP-1193 provider for QoreChain's EVM lane (and, in the extension, Ethereum). Also announced through EIP-6963. |
| `window.qorex.svm` | A Solana provider. In the extension, Solana dApps normally find QoreX through the Wallet Standard instead. |

What QoreX does not do:

- It never sets `window.keplr`. Code that looks for Keplr will not find QoreX; detect `window.qorex` instead.
- It never overwrites `window.ethereum`. The extension does not set it at all. The app's in-app browser sets `window.ethereum` only when no other wallet has. Pick QoreX by its EIP-6963 name, not by `window.ethereum`.
- `signAmino` and `sendTx` do not exist (see [cosmjs](#cosmjs)).

## Detect QoreX {#detection}

**EVM.** Listen for EIP-6963 announcements and pick the one whose `rdns` is `network.qore.qorex`:

```ts
const wallets = new Map<string, EIP6963ProviderDetail>();
window.addEventListener("eip6963:announceProvider", (event) => {
  const detail = (event as CustomEvent<EIP6963ProviderDetail>).detail;
  wallets.set(detail.info.rdns, detail);
});
window.dispatchEvent(new Event("eip6963:requestProvider"));

const qorex = wallets.get("network.qore.qorex"); // undefined when QoreX is not there
```

**QoreChain native lane.** Check for `window.qorex?.native` and read its capabilities. Check them rather than a version number:

```js
const native = window.qorex?.native;
const can = (name) => native?.capabilities?.includes(name) === true;
```

| Capability | Extension | App |
|---|---|---|
| `signAndBroadcast` | 0.3.5 | 1.2.1 (method present from 1.1.5) |
| `signDirectAddsPqcLayer` | 0.4.0 | 1.2.1 (behaviour from 1.2.0) |
| `signArbitrary` | 0.4.0 | 1.2.1 (method present from 1.2.0) |
| `listAccounts`, `connectProofPicksAccount`, `executeRequest` | 0.3.x | not in the app |

App 1.2.0 has the methods but declares no capabilities; to cover it, fall back to `typeof window.qorex?.native?.signArbitrary === "function"`. `executeRequest` is the Dashboard bridge, which works for `dashboard.qorechain.io` only (see [Dashboard bridge](/qorex/browser-extension#dashboard-bridge)); other sites do not need it. Builds 1.2.5 and 0.4.4 declare the same capabilities as before.

**Extension or app.** A page cannot ask which one it is talking to, and should not need to. The differences that matter are in the table below.

| | Extension (desktop) | App (in-app dApp browser) |
|---|---|---|
| QoreChain native lane | yes | yes |
| EVM signing on QoreChain | yes | yes |
| EVM on Ethereum (`wallet_switchEthereumChain` to `0x1`, per site) | yes | no, QoreChain's active network only |
| EVM events (`connect`, `accountsChanged`, `chainChanged`) | all three | `connect` only: the browser is closed to switch account or network |
| Solana (Wallet Standard) | yes | no, the in-app browser does not sign Solana transactions |
| Dashboard bridge (`connectProof`, `executeRequest`) | yes, `dashboard.qorechain.io` only | no |
| Opening a page from a link | not applicable | `browse` links (see [Links](#links)) |

See [Browser Extension](/qorex/browser-extension) and [dApp Browser](/qorex/dapp-browser) for the user side of each.

## Connect {#connect}

Connecting needs one approval per site, which reveals only the public address:

```js
await window.qorex.native.enable("qorechain-vladi"); // once per site; mainnet chain id
const key = await window.qorex.native.getKey("qorechain-vladi");
// key.bech32Address is the qor1... address; key.algo is "secp256k1", or "ethsecp256k1" for a coin-60 account
```

EVM:

```js
const [account] = await qorex.provider.request({ method: "eth_requestAccounts" });
```

`eth_accounts` returns an empty list until the user has approved the site, and never opens a window on its own. `enable` and `eth_requestAccounts` do open the wallet when it is locked (see [Locked wallet](#locked)).

The extension fires a window event, `qorex_keystorechange`, when the account, wallet or network changes. Approvals are kept per wallet and the user can revoke a site at any time under **Connected sites**.

## Send a QoreChain transaction: `signAndBroadcast` {#sign-and-broadcast}

Every QoreChain transaction from an account with a registered post-quantum key must carry a hybrid signature: secp256k1 **and** ML-DSA-87. Only the wallet holds the ML-DSA key, so a page cannot build that signature itself. Send the messages and QoreX does the rest:

1. shows the user the decoded messages and the fee,
2. builds the transaction for the account the user has selected,
3. adds the hybrid signature (registering the account's post-quantum key first if this is its first transaction),
4. broadcasts, and resolves with the result.

```js
const provider = window.qorex.native;
if (!provider.capabilities?.includes("signAndBroadcast")) {
  throw new Error("Please update QoreX");
}
await provider.enable("qorechain-vladi");              // connect, once per site

const res = await provider.signAndBroadcast({
  chainId: "qorechain-vladi",                          // must be the wallet's active network
  messages: [
    {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: MsgSend.encode(msgSend).finish(),         // protobuf bytes: Uint8Array,
    },                                                 // number[] or a base64 string
  ],
  memo: "",                                            // optional, at most 256 bytes
  gasLimit: 300000,                                    // optional: 100k to 5M, default 400k
});
// res = { txHash, code, height?, shield }
```

`shield` tells you whether the committed transaction carries the hybrid layer: `shielded` when it does, `downgraded` when it was committed without it (report that case), and `pending` or `classical` otherwise.

**Rules**

- `chainId` must equal the wallet's active network: `qorechain-vladi` (mainnet) or `qorechain-diana` when the user has switched to testnet. A mismatch is refused with a message naming both. **A dApp cannot switch the network** (see [Testnet](#testnet)).
- 1 to 32 messages per call. The message bytes are signed exactly as you send them; the wallet does not re-encode them.
- A memo of at most 256 bytes is shown on the approval sheet; line breaks and control characters in it are shown as their codes.
- Wallet-only messages are refused (see [Messages a site can never request](#wallet-only)).
- QoreX will not sign a message it cannot display. Such a request is refused with `QoreX cannot show what <type> does, so it will not sign it`, including inside `MsgExec`. Use a message type QoreX can decode.

**Gas and fee**

- The fee is `gasLimit` times the network's gas price (QoreX follows the network's live minimum), shown before the user approves.
- Your `gasLimit` is held to 100,000 to 5,000,000; with no value it is 400,000.
- A transaction that runs CosmWasm or cross-VM code is simulated first, before the approval. QoreX asks for at least 1.3 times the simulated gas, up to 20,000,000, and a higher value from your page is kept. A call the contract would reject is refused before the approval, with the chain's reason. If the call needs more than 20,000,000, QoreX says so and refuses.
- A transaction cannot exceed the network's own per-transaction gas limit; QoreX refuses one above it before anything is signed.

A rejection by the user throws `QoreX: signature rejected` with code `4001`.

## cosmjs, cosmos-kit and Interchain Kit {#cosmjs}

`getOfflineSigner(chainId)`, `getOfflineSignerOnlyDirect(chainId)` and `getOfflineSignerAuto(chainId)` return a cosmjs `OfflineDirectSigner`, so `SigningStargateClient` works unchanged:

```js
const signer = window.qorex.native.getOfflineSigner("qorechain-vladi");
const client = await SigningStargateClient.connectWithSigner(rpc, signer, {
  gasPrice: GasPrice.fromString("0.15uqor"),
});
await client.sendTokens(from, to, [{ denom: "uqor", amount: "1000" }], "auto");
```

**The wallet-added post-quantum layer.** When the transaction carries no ML-DSA layer (which a page cannot make), QoreX adds it: it simulates the layer's cost, raises the gas and the fee in the transaction, signs ML-DSA-87 over the body and the raised fee information, and shows the user the final fee before they approve. Your `"auto"` fee therefore comes back higher by the layer's cost, tens of thousands of gas. Always broadcast the `signed` document that comes back, not the one you sent. Check `capabilities.includes("signDirectAddsPqcLayer")` before relying on this.

- The account must already have its post-quantum key registered; it registers with its first transaction from QoreX. Otherwise the call fails with code `4100` and reason `pqc-key-missing`. Have the user send one transaction from QoreX first, or use `signAndBroadcast`, which registers the key itself.
- **Amino is refused.** `signAmino` and `getOfflineSignerOnlyAmino().signAmino` reject with code `4200` and reason `amino-unsupported`, because Amino JSON cannot carry the hybrid signature. Configure your library for direct signing.
- Accounts imported from MetaMask (coin 60) sign through `signAndBroadcast`; the extension refuses `signDirect`, and so the cosmjs signers, for them.
- `getKey` and `getAccounts` return the active account.

In a web app, the [wallet adapter](/developer-tools/wallet-adapter) and the [QoreX integrations](/developer-tools/qorex-integrations) packages (RainbowKit, Interchain Kit, cosmos-kit) wrap this detection and these calls for you.

## `signDirect` {#sign-direct}

`signDirect` signs a `SignDoc` your page built. If the body already carries an ML-DSA layer, QoreX verifies it against the account's registered key, as the chain does, before any window opens. If it carries none, QoreX adds it as described above. A layer that does not match the registered key, a wallet-only message, a message QoreX cannot display, or more than 1,000 messages is refused before any approval opens. For new code, `signAndBroadcast` is simpler.

## Sign a message: `signArbitrary` and `verifyArbitrary` {#sign-arbitrary}

```js
const message = "Log in to example.com\nNonce: 1234";
const sig = await window.qorex.native.signArbitrary("qorechain-vladi", address, message);
const ok = await window.qorex.native.verifyArbitrary("qorechain-vladi", address, message, sig);
```

The signature follows [QoreSign message-signing-v1](/qoresign/spec/message-signing-v1): ADR-36 with the account's classical key (secp256k1, or eth_secp256k1 for a coin-60 account), plus ML-DSA-87 over `"qorechain-msg-v1|" + chainId + "|" + data`. It also carries Keplr's `pub_key` and `signature` fields, so code written for Keplr can read it. The user sees the whole message. A message must be 1 to 4096 bytes and must not start with another QoreChain signing domain.

**Verify on your server, never in the page.** The ML-DSA half has to be checked against the key registered on chain for that address, never against a key the client sends. Use [`@qorechain/qoresign`](/qoresign/overview):

```ts
import { verifyMessageWithChain } from "@qorechain/qoresign/network";

try {
  await verifyMessageWithChain({
    rest: "https://api.qore.host",     // the network's REST endpoint
    chainId: "qorechain-vladi",
    signer: address,                    // the qor1... address that signed
    data: message,                      // exactly the text you asked the user to sign
    signature: sig,                     // the object signArbitrary returned
  });
  // signed in
} catch (err) {
  // a QoreSignError with a stable code: the signature does not verify
}
```

`verifyMessageWithChain` fetches the signer's registered ML-DSA-87 key and throws a `QoreSignError` when anything does not verify. An account that has never sent a transaction on that network has no registered key yet and fails with `KEY_NOT_REGISTERED`: ask the user to send one transaction from QoreX first. Put a one-time nonce and your domain in the message, and check both on the server, so a signature cannot be replayed on another site. The QoreSign guides cover sign-in messages in more detail.

## EVM dApps {#evm}

QoreX answers on EIP-6963 and, through its EIP-1193 provider, signs `personal_sign`, `eth_signTypedData_v4` and `eth_sendTransaction` on QoreChain's EVM lane (chain id **9801**, testnet **9800**). In the extension it also signs on Ethereum after the site calls `wallet_switchEthereumChain` to `0x1` (per site). Read-only methods (`eth_call`, `eth_getBalance`, `eth_getLogs` and the other standard reads) go to the selected network's node. Any other method answers `4200`, and `wallet_switchEthereumChain` or `wallet_addEthereumChain` to anything but a chain QoreX signs for answers `4902`. A site cannot switch to the other QoreChain network: that answers `4100` with `switch the network in QoreX itself`.

```js
const [from] = await qorex.provider.request({ method: "eth_requestAccounts" });
const hash = await qorex.provider.request({
  method: "eth_sendTransaction",
  params: [{ from, to, value: "0x0", data }],
});
```

**What the approval decodes.** Every window says what is being authorised, decoded on the device: transfers, token allowances (an unlimited one says UNLIMITED), `setApprovalForAll`, Permit and Permit2 signatures, and Safe transactions (a DELEGATECALL is marked high risk). A call QoreX cannot decode is shown as unknown and high risk and needs a second tap. EIP-7702 delegations are refused.

**Simulation.** Before signing, the window shows what the transaction changes in the user's balance.

- With `eth_simulateV1` (transfer tracing) on the node, it shows the changes in QOR and tokens.
- On a node without `eth_simulateV1`, which is the case on QoreChain's EVM nodes today, only `eth_call` is available, and that says whether the call would revert. A call with data then shows "what it does to your tokens was not checked", and the user needs a second tap to approve.
- A transaction that would fail, or that the node cannot simulate, also needs a second tap.
- The simulation goes to the same node that would receive the transaction; nothing else is sent anywhere.

Design the page so this second tap is not a surprise: explain what the call does in your own interface too.

**The EVM authorisation window, per transaction.** On QoreChain an EVM transaction is admitted only inside an authorisation window opened by the account's hybrid ML-DSA-87 signature on the native lane. When none covers the transaction, the same approval opens one for exactly that transaction:

- the value plus the maximum fee as its limit,
- about ten minutes,
- limited to the contracts the transaction calls, where the network supports it.

The approval names every contract the window would admit (including contracts that recently verified a signature for the same site) and says that it replaces any window the user has open. If the network cannot limit a window to contracts, QoreX asks a second time, naming the contracts and saying the window would admit any contract, before it opens an unlimited one; a "no" sends nothing. The QOR limit covers all QOR leaving the account, maximum fee included, and a contract the window lets the user call can still act for the account (tokens it holds or approved, or QOR held by other contracts). See [EVM access window](/qorex/security-and-recovery#evm-window).

**A window the user opened by hand.** A window the user opens on the window screen defaults to **QOR transfers only**; allowing any contract is a separate choice with a warning. So a window the user opened earlier will not cover a token or contract call. A dApp that expects a window to exist should either let QoreX open the per-transaction window (the simplest way, and the narrowest), or tell the user to choose **any contract** if they open one themselves.

**Other rules on this lane**

- Only accounts imported from MetaMask (coin type 60) can send on QoreChain's EVM lane. Another account answers `4100` and the message tells the user the next steps.
- The staking, distribution, governance, vesting, bank and IBC precompiles are refused (`4200`): on QoreChain those go through the native lane.
- Signatures on the EVM lane are classical (secp256k1). QoreX does not claim more.
- Typed data for another chain than the selected one is refused with `-32602`.

## Solana dApps (extension) {#solana}

The extension registers with the Solana Wallet Standard on Solana mainnet (`solana:mainnet`), so Solana dApps find it without custom code. Features: connect, disconnect, events, `solana:signMessage`, `solana:signTransaction` and `solana:signAndSendTransaction`, for legacy and v0 transactions. `connect({ silent: true })` is supported.

The approval decodes System transfers, SPL Token and Token-2022 transfers, approvals, authority changes and account closes, and shows a memo's text. An instruction QoreX cannot decode is marked on the sheet as unreadable and the approval needs a second tap. A transaction that does not list the wallet as a signer is refused, and `signMessage` will not sign bytes that are really a transaction. Signatures are classical and marked so.

The app's in-app browser does not sign Solana transactions. Solana on QoreChain itself is a separate, testnet-only feature inside the wallet: see [Testnet-only features](/qorex/testnet-features).

## When the wallet is locked {#locked}

From extension 0.4.4 and Safari 1.8.2, a signing request made while QoreX is locked (native, EVM or Solana) opens the wallet on the password screen, naming the site. After the user unlocks, the window closes and the request shows its own approval. If the user closes the window instead, the request is refused with code `4001`. Before this, such a request failed at once with "wallet is locked".

- `enable`, `getKey`, `eth_requestAccounts` and the signing methods wake the wallet this way.
- Reads a page makes on load (`eth_accounts`, `eth_chainId`, chain reads) never open a window: `eth_accounts` just returns an empty list.
- Nothing is signed without the password, and a request that waits is answered "no" if the user switches wallet or locks again.

Handle `4001` as a normal outcome, not a fault.

## Messages a site can never request {#wallet-only}

QoreX refuses these from any site on every path (`signAndBroadcast`, `signDirect`, an agent proposal), because they hand over standing authority over the account. The user does these from QoreX's own screens:

- post-quantum key management: register, migrate and rotate a key, the encryption key, and PQC multisig registration;
- authenticators and spending rules: registering or revoking a signing key, spending rules, creating an abstract account;
- EVM window open, close and clear (and the delegation consent);
- Solana-on-QoreChain window open and close, and the Solana relay message;
- an authz grant (`MsgGrant`) of `MsgGrant` or `MsgExec`, because such a grant would let the grantee act as the account.

The refusal applies directly, inside `MsgExec` at any depth, and as a generic grant of one of these messages. The error reads `QoreX: <type> is managed by the wallet itself, not by a website`.

## Errors and events {#errors}

Errors carry an EIP-1193 `code`:

| Code | Meaning |
|---|---|
| `4001` | The user refused, or closed the window (including the unlock window). |
| `4100` | Not authorised: unknown account, no registered post-quantum key (`reason: pqc-key-missing`), a coin-118 account trying the EVM lane, or a request to switch the network. |
| `4200` | Not supported: Amino (`reason: amino-unsupported`), an EVM method QoreX does not sign, an EIP-7702 delegation, a native-only precompile. |
| `4901` | Wrong Solana chain. |
| `4902` | Unknown chain. |
| `-32602` | Bad parameters (for example typed data for another chain). |

Events:

- EVM provider: `connect`, `accountsChanged` and `chainChanged` in the extension; only `connect` in the app.
- Native lane (extension): the window event `qorex_keystorechange` when the account, wallet or network changes. cosmos-kit listens for it.
- Solana Wallet Standard: `change`.

## Links a service can generate {#links}

Three links open QoreX from another page or app.

### Open a page in the app: `browse` {#link-browse}

```
https://link.qore.network/browse?url=<encodeURIComponent(https URL)>
qorex://browse?url=<encodeURIComponent(https URL)>
```

On a phone, the link opens your page in QoreX's dApp browser after the usual biometric prompt. The page must be `https://` on a domain name. QoreX refuses the link if the page has:

- a port,
- a user name or password,
- an IP address,
- `localhost`,
- a backslash or whitespace,
- more than 2048 characters.

The link gives the page nothing. It still asks to connect, and every signature still goes through the approval sheet. With no wallet on the phone, the app stays on onboarding. If QoreX is not installed, the https form shows a page with a link to get it. The extension has no `browse` link.

### Ask for a payment: `qorex://pay` {#link-pay}

```
qorex://pay?v=1&net=qorechain-vladi&to=qor1...&amt=1500000&d=uqor&id=pr_...&tag=...&pk=...&sig=...
```

A payment request link carries the recipient, the amount in base units, the denomination, a request id and its memo tag, an optional note and @handle, the network, and a signature by the recipient's own account key over all of it. The payer's QoreX checks the signature, that the signing key owns the recipient address, the exact network, and any @handle, then shows the normal review before sending. An altered amount or recipient is detected, and the request is marked paid by reading the chain.

**Generate it with QoreX's own request screen** (app, **Payment requests**, **New request**) rather than by hand: the signature is made with the account key, which a page never holds. Treat a link you build or alter yourself as unsupported. A web form of the link is not available yet.

### Hand over an agent proposal: `qorex://propose` {#link-propose}

```
qorex://propose?d=<base64url of the proposal JSON>
```

App only. The link carries a transaction an AI agent proposes; QoreX validates it, simulates it, and shows it in the normal approval window. A proposal is never signed as is, and a link can carry at most 64 KB. See the [AI agent model](#agents) below.

## AI agents {#agents}

If you build an AI agent that works with a wallet, the model is that an agent can read what the user allows and **propose** a transaction; it never signs. QoreX checks and simulates every proposal and the user approves or rejects it in the same approval window a dApp request uses. A proposal for a wallet-only message is refused before any window opens. In the extension an agent reaches QoreX through a companion program on the user's computer that is not yet published; in the app, a proposal is pasted or arrives as a `qorex://propose` link. For how the user turns this on and what they see, read [Developer mode: AI agents](/qorex/developer-mode#ai-agents).

## Testnet {#testnet}

**A dApp cannot switch the network.** `chainId` in a request must match the network the wallet is on; a mismatch is refused. This protects the user from a page that would move them to a network where funds look the same but are not.

To use the testnet (`qorechain-diana`, EVM chain id 9800), the user switches it in QoreX:

- **App:** Settings, then **Use testnet (developers)**.
- **Extension:** turn on Developer mode (tap the version number at the bottom of the popup seven times), then **Switch to testnet (diana)**. **Switch back to mainnet** returns to the default.

A TESTNET banner then shows on every screen, testnet balances show no USD value, and the network re-binds without a restart. Tell your users to switch before opening your testnet page. Testnet-only wallet features (IBC, the QoreChain Bridge screen, Solana on QoreChain) are described in [Testnet-only features](/qorex/testnet-features).

## Troubleshooting {#troubleshooting}

| What you see | Why, and what to do |
|---|---|
| `window.keplr` is undefined | By design. Use `window.qorex.native`, or a library with a QoreX connector. |
| `window.ethereum` is not QoreX | By design. Select the wallet through EIP-6963 (`rdns` `network.qore.qorex`). |
| `QoreX: chain X does not match the active network Y` | The user is on the other network. Ask them to switch in QoreX; you cannot. |
| `4100`, `pqc-key-missing` | The account has no post-quantum key on the network yet. Ask the user to send one transaction from QoreX, or use `signAndBroadcast`. |
| `4200`, `amino-unsupported` | Your library is asking for Amino. Configure direct signing. |
| `QoreX: <type> is managed by the wallet itself, not by a website` | A wallet-only message. Remove it; the user does this from QoreX. |
| `QoreX cannot show what <type> does, so it will not sign it` | A message QoreX cannot decode. Use a type it can display. |
| `QoreX: send between 1 and 32 messages` | Split the request. |
| `QoreX: the memo may be at most 256 bytes` | Shorten the memo. |
| `QoreX: a message must be 1 to 4096 bytes` | Shorten the message you ask to sign. |
| `needs about N gas, more than the 20,000,000 QoreX allows` | The contract call is too heavy for one transaction. Split it. |
| `QoreX: EVM method X not yet supported` (`4200`) | QoreX signs `personal_sign`, `eth_signTypedData_v4` and `eth_sendTransaction` only. |
| `QoreX: this account uses the QoreChain (coin 118) key and cannot send on QoreChain's EVM lane` | Only accounts imported from MetaMask (coin 60) send on the EVM lane. |
| `QoreX: staking, rewards, IBC and governance on QoreChain go through the native lane` | Call the native lane for those; the EVM precompiles are refused. |
| An EVM call keeps needing a second tap | The node cannot check what the call does to tokens, or the call is not decodable. Explain it in your page. |
| A token call fails although the user opened a window | A window the user opened by hand covers QOR transfers only by default. Let QoreX open the per-transaction window, or tell the user to choose any contract. |
| `4001` right after the page asks for a signature | The user refused, or closed the unlock window on a locked wallet. Offer to try again. |
| `eth_accounts` returns `[]` | The site is not connected yet. Call `eth_requestAccounts`. |
| A `browse` link does nothing | The page address broke a rule (port, IP, `localhost`, not https, over 2048 characters), or the phone has no wallet yet. |
| `KEY_NOT_REGISTERED` on your server | The signer never sent a transaction on that network. Ask for one first. |

If a problem remains, the user can send a redacted request log from [Developer mode](/qorex/developer-mode), and you can use the testnet to reproduce it.

## Where it is published {#where-published}

| What | Where |
|---|---|
| QoreX browser extension | Chrome Web Store, Firefox Add-ons and the Mac App Store (Safari). See [Browser Extension](/qorex/browser-extension#install). |
| QoreX app and its dApp browser | App Store and Google Play. See [QoreX Wallet](/qorex/overview#how-to-access). |
| Message and transaction verification | `@qorechain/qoresign` (TypeScript and other languages). See [QoreSign](/qoresign/overview). |
| Wallet detection for web apps | [`@qorechain/wallet-adapter`](/developer-tools/wallet-adapter) |
| RainbowKit, Interchain Kit and cosmos-kit connectors, types and a test wallet | [`@qorechain/qorex-*`](/developer-tools/qorex-integrations) |
| Core SDK for building and sending transactions | [Developer Tools](/developer-tools/overview) |

The QoreX source code is not public. The current version on each store is on the [overview](/qorex/overview#versions) page.
