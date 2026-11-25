---
slug: /qorex/developer-mode
title: Developer Mode
sidebar_label: Developer Mode
sidebar_position: 9
---

# Developer Mode

Developer mode is a switch in QoreX **Settings**. It is **off by default**. While it is on, QoreX shows a set of tools for people who build on **QORE**CHAIN: inspectors that read the network, a place to simulate and decode transactions, contract and rollup tools, offline signing, and a way to review transactions proposed by AI agents.

Developer mode changes no signing rule. Anything that signs still shows you what it signs and waits for your approval, exactly as before.

## Innovations {#innovations}

- **Every tool is read or review first.** The inspectors only read. The tools that can sign show a decoded review and wait for your approval.
- **Exact numbers from the network.** The inspectors show what the chain itself reports: its version, its features, your account's registered keys, your EVM window.
- **Errors in plain words.** The error decoder turns a raw network error into a sentence and says what to do next.
- **AI agents propose, you decide.** An agent can read what you allow and propose a transaction. QoreX checks and simulates it, and you approve or reject it in the normal approval window. No agent can sign.

## How to turn it on {#how-to-use}

- **Mobile app (iPhone and Android):** open **Settings** and switch on **Developer mode**. A **Developer** tab with a code icon (`</>`) appears in the bottom bar. Open it to see the tools. Switching the setting off hides the tab again.
- **Browser extension:** in the popup, tap the version number at the bottom seven times. A **Developer mode** section appears in the popup, with a **Developer tools** button. The button opens a page with the same groups as the app's tab. The same section has **Turn off developer mode**.

The same section holds the network switch. The app has it as **Use testnet (developers)** in Settings, the extension as **Switch to testnet (diana)**. See [Testnet Features](/qorex/testnet-features) for what only exists on the testnet.

The tools are the same on the app and the extension, except where a tool says otherwise. They are grouped as follows.

## Inspect {#inspect}

Read only, on mainnet and testnet. Nothing on these screens signs or sends.

### Network and capability inspector

Shows which network you are on and what it supports: the chain id, the node's version, the latest block, the latest upgrade it has applied and any scheduled one, the protocol features the chain reports (enabled, staged or not enabled), the EVM lane's chain id, whether the SVM lane executes or is closed, the cross-VM and post-quantum parameters, and how many IBC channels and bridge routes the network lists. A second part, **This wallet**, shows your QoreX version, the build (app or extension) and the signing methods and simulation mode this build uses.

How to use: open **Network and capability inspector**. Tap **Refresh** to read again. Use **Copy** next to a value to copy it.

### Account inspector

Shows the active account: whether it is a Cosmos account (coin 118) or a unified account (coin 60), its slot and derivation indices, its addresses on each lane (native `qor1...`, EVM `0x...`, SVM key), and public keys. Only public information is shown; nothing secret leaves the vault.

How to use: open **Account inspector**, then tap **Show addresses and public keys** (QoreX may ask you to unlock).

### PQC inspector

Shows the ML-DSA-87 key registered on the chain for your account: the algorithm, the height it was registered at, the SHA-256 of the public key, its size, whether the chain's rules still accept it, and its proof of possession. It can then compare that key with the one on this device and say whether they match (canonical key, an older derivation, or a numbered rotation). It also has a **What protects an operation** table: for a native send, an EVM transaction, an SVM transaction, an IBC send and a send on an external chain, which signature is post-quantum and which is classical.

How to use: open **PQC inspector** to read the key on chain, then tap **Compare with this device's key** to run the comparison. If the chain refuses the registered key, the screen says it must be registered again.

### EVM window inspector

Shows whether an EVM window is live for your account, the heights and approximate times it was opened and expires, how many transactions and how much value are used and left, and what it allows (QOR transfers only, or calls and transfers; the allowed recipients and contracts). Opening and closing a window happen on the EVM window screen, not here. See [Security and Recovery](/qorex/security-and-recovery#evm-window).

How to use: open **EVM window inspector**. If it says a window "could not be read", that is not the same as having none.

## Transactions {#transactions}

Mainnet and testnet, unless a tool says otherwise.

### Transaction inspector

Paste a transaction hash (QoreChain, or EVM with `0x`) or a raw request: a SignDoc JSON, a base64 TxRaw, an EVM transaction JSON or a dApp request. QoreX decodes every message, shows who signs, who receives, the funds moved, the fee, the memo and the permissions requested, and says whether the post-quantum signature is attached. For a transaction already on the network it also shows the result, gas used and events. A message type QoreX cannot read is shown as unknown with its raw bytes; QoreX does not guess. Requests are read on your device and never sent.

How to use: open **Transaction inspector**, paste, tap **Inspect**.

### Simulation workbench

Paste QoreChain messages as JSON, or an EVM transaction, and QoreX asks the network what it would do. Nothing is signed or sent. You see whether it would succeed, the gas it would use and the fee, the one-time post-quantum key registration fee if it applies, the asset changes for your account, and a list of what the simulation cannot show (for example a contract's own state, or cross-VM steps that run in a later block). Network errors are decoded into plain words, with a suggestion for what to do next, by the built-in **Error decoder**: paste a raw log, a result JSON or an error message and tap **Decode**.

How to use: open **Simulation workbench**, choose **QoreChain messages** or **EVM transaction**, paste, tap **Simulate**.

### Fees and sponsorship

Shows the chain's minimum gas price, what QoreX pays per gas, the cost of common actions (send, stake, open an EVM window, IBC send), whether the next transaction also pays the one-time key registration, and the fee allowances you have received and given, with a verdict for each: would it pay, or why it is refused (expired, used up, wrong message type). QoreX pays its own fees and never names a fee granter itself.

How to use: open **Fees and sponsorship**; it reads on opening.

### Testnet Workspace

Tools for building on the testnet, which never touch mainnet:

- **Testnet-only accounts.** An account made from your recovery phrase that QoreX never lets sign on mainnet and hides while mainnet is active. Tap **Create a testnet-only account**.
- **Faucet.** Copy your testnet address and tap **Open the testnet faucet**. The faucet is on the dashboard and you sign in there to use it. See [Testnet Features](/qorex/testnet-features#get-test-qor).
- **Reset connections.** **Reset all connections** disconnects every site, refuses every request still waiting and forgets the contracts sites recently had you sign for. Tap it twice to confirm.

Availability: the screen opens on both networks; the testnet-only accounts and the faucet are for the testnet.

### Request log

Lists what sites asked, what you decided and what the network answered. It is kept on your device only, and only while Developer mode is on, for at most 500 entries and 7 days. It never records your recovery phrase, keys or passwords, nor what was signed (only its type and a hash). You can keep it after the browser closes, clear it, or **Export a debug file** to attach to a bug report; the file is checked for phrases and keys before it is written.

How to use: open **Request log**. Turn Developer mode on first, or nothing is recorded.

## Contracts and rollups {#contracts}

### Contract interaction

Call EVM, CosmWasm (QoreChain Native) and SVM contracts with your own account. Reads are free; anything that changes state goes through the same approval as a dApp request, which simulates it and adds the post-quantum signature.

How to use:

1. Open **Contract interaction** and choose the **Contract type**.
2. EVM: enter the contract address and load its **ABI (JSON)**. Each function becomes a typed form, tagged read, write or payable. QoreX refuses a value for a function that cannot receive QOR.
3. CosmWasm: enter the contract address, optionally load a schema from `cosmwasm-schema`, write the **Message (JSON)** and, if needed, the funds (written like `1000uqor`). Use **Query** to read, or **Review execute** to see exactly what will be signed.
4. SVM (testnet only): enter the program id and load an **Anchor IDL (JSON)**. QoreX signs the Solana transaction with your own Solana key and relays it with your QoreChain account.
5. Tap **Simulate** to see what the network says the call would do, then **Review and sign** (or **Continue to approval**) and approve in the approval window.

You can save contracts per network, export them as a file and import them again. A **Contract info** panel shows a CosmWasm contract's code id, creator, label and admin.

### Deployment approval

Approve a deployment that your command-line tool, IDE or agent prepared. QoreX works out the code hash itself, decodes the constructor arguments, and checks who can upgrade the contract before anything is signed. It refuses if the tool's stated hash does not match the bytes. It warns about upgradeable proxy patterns, about an admin or upgrade authority that is not your account, and about a contract with no admin that can never be migrated. It handles EVM contract deployments and CosmWasm contracts instantiated from a code that is already stored. QoreX does not upload CosmWasm code, and SVM program deployment is not supported in this version. Code uploads on a network that sends them through governance cannot be signed from a wallet.

How to use: open **Deployment approval**, paste the deploy request JSON from your tool (tap **Show the format** to see it), tap **Check**, read the review, then **Approve and sign**.

### Rollup and appchain profiles

Add a rollup or appchain built with the QoreChain RDK. QoreX asks its node live before keeping the profile and shows each check: REST and RPC chain id, address prefix, EVM chain id, and the rollup on QoreChain. A profile can settle to the mainnet or the testnet. While a profile is active, every review screen asks which network signs, and signing for a node that does not confirm its chain id is refused.

How to use: open **Rollup and appchain profiles**, tap **Add a profile**, fill in the name, chain id and endpoints, then **Check and add**. Use **Make active** or **Stop using** to switch, and **Check again** at any time.

## Other virtual machines {#other-vms}

### Solana on QoreChain (testnet only)

The SVM lane on the QoreChain **testnet**: SVM windows, and relaying a signed Solana transaction. This tool is shown only while the testnet is active; on mainnet the SVM lane is not open and nothing here can be used. Details and steps are on [Testnet Features](/qorex/testnet-features#solana-on-qorechain).

### Cross-VM call

Compose a call from your account to a contract on another execution lane of QoreChain itself (EVM, CosmWasm or SVM). Nothing leaves QoreChain: this is not a bridge to another chain. The form asks for the target lane, the contract or program, the payload and, for CosmWasm only, QOR to attach.

You choose **When it runs**, and QoreX says it plainly:

- **Now, inside this transaction (atomic):** all of it happens or none of it.
- **Queued for a later block (not atomic):** it runs in a later block. If it fails or times out, what this transaction did stays done.

How to use: open **Cross-VM call**, fill in the form, tap **Simulate** to see the steps and the fee, then **Sign and send**. QoreX signs only calls it has simulated. If the network has cross-VM calls switched off, the screen says so and offers nothing to sign. On mainnet today cross-VM calls are closed, so expect that message there.

### Track a cross-VM call

Paste the hash of a transaction (QoreChain, or `0x` for EVM) and QoreX reads its cross-VM legs. A queued leg shows as pending, executed, failed or timed out. An EVM transaction's legs ran inside the transaction itself and are read from its result. Finished queued records are pruned by the network after a while, and the tracker says so when the record is gone.

How to use: open **Track a cross-VM call**, paste the hash, tap **Track**.

## Signing and agents {#signing-and-agents}

### Permissions and sessions

Lists everything your account has allowed other addresses to do, with the limits the chain itself enforces, and lets you revoke each one: **Grants**, **Fee allowances**, **Linked keys** and **Access windows**. Each shows what it may do, its limit and when it expires (or that it never does). **Revoke** sends the revoking transaction; **Close window** closes an EVM window.

You can also give an app or another address a limited session with **New session**: call only listed contracts, send up to a set amount, stake with chosen validators, or vote and claim rewards, for a number of days, optionally paying its fees up to a limit. A **Preview** says exactly what the grantee will be able to do, and separately lists what the chain does not enforce, which QoreX will ask you about each time.

### Offline and multisig workspace {#multisig}

Prepare any transaction as a file in the chain's command-line format, check every signature in a multisig file, or sign on one device and broadcast from another.

- **Offline signing:** prepare a transaction on a device that is online (start from a template such as Send, Delegate or Call a contract, or paste the messages), take the file or QR code to the QoreX that holds the key, review it, **Sign**, then **Broadcast** from either device.
- **Check signatures:** open the transaction and any signature files. For each multisig member QoreX shows whether they have a post-quantum key registered and whether round 1 (post-quantum) and round 2 (classical) are valid, stale, invalid or missing, and which round is still missing.

The review always shows the memo and every fee coin, and QoreX signs only the bytes you reviewed. It refuses a fee in a coin other than QOR, a fee well above the network's high gas price, and a fee paid or granted by another account. If the file changes after your review, you must open and review it again. QoreX will not broadcast a transaction without its ML-DSA-87 signature.

## AI agents {#ai-agents}

AI agents (your own AI assistant, or a tool you run) can read the accounts you choose and **propose** a transaction. They cannot sign. The model is:

1. You decide which accounts an agent can see and propose for. You can pause or revoke an agent at any time, and the **Activity** list shows what it did.
2. QoreX checks every proposal and simulates it on the network. A proposal QoreX cannot read, or that the network says would fail, is not shown to you.
3. You see the proposal in the normal approval window, marked as proposed by an AI agent and not by a website, and you approve or reject it. Nothing is signed until you approve.

QoreX never signs the kinds of request that no outside party may ask for, whoever proposes them. A limit on proposals per hour stops a flood, and only one proposal waits at a time.

How to use it:

- **Mobile app:** turn on Developer mode, open **AI agents**, then paste the proposal JSON from your agent and tap **Review proposal**, or open a `qorex://propose` link. QoreX cannot check who wrote a pasted proposal or a link, and says so. Review it and approve or reject.
- **Browser extension (Chrome, Edge, Brave, Firefox):** an agent connects through a companion program on your computer that uses the Model Context Protocol. That program is not yet published, so the extension side cannot be used by the public yet. When it is, you turn on **Allow AI agent connections on this computer**, pair the agent with a one-time code that expires in 5 minutes, and choose its accounts.
- **Safari:** not available. Safari cannot connect QoreX to programs on your computer.

## Limits {#limits}

- Developer mode is for people who build. If you only send, receive and stake, you do not need it.
- A tool that depends on the network (the inspectors, the simulator, the trackers) says "could not read" when the network cannot be reached. That is not the same as there being nothing there.
- SVM tools and the cross-VM composer depend on what the network allows. On mainnet today SVM and cross-VM calls are closed.
- The browser extension needs the version-number tap to reveal the switch; the app has it in Settings.
