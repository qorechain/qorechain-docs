---
slug: /dashboard/developers
title: Developers
sidebar_label: Developers
sidebar_position: 13
---

# Developers

The **Developers** page (`/developers`, sidebar **Build** group, entry **Developers**) is a public page of tools for building on QoreChain. It needs no account. It has seven tabs: **SDKs**, **Transaction inspector**, **PQ key status**, **Simulator**, **Signing playground**, **QoreX test wallet** and **AI agents (MCP)**. Together they let you find and install the right package, read any committed transaction and see whether its post-quantum layer verifies, check which post-quantum key an account has registered and whether its EVM authorisation window is open, dry-run a signed transaction, practise hybrid signing with a throwaway key, and exercise a dApp against a mock QoreX wallet, all in the browser. It is for dApp, wallet and backend developers. For the libraries themselves see [Developer Packages](/developer-tools/overview), the [SDK Overview](/sdk/overview) and [Install](/sdk/install).

## Innovations {#innovations}

- **A read-only gateway to the chain.** The tools read public chain data and simulate a transaction through a read-only gateway under the `cosmos/`, `cosmwasm/` and `qorechain/` query paths plus the simulate call. Nothing on the page can broadcast a transaction. The gateway exists because the chain's REST endpoints do not send browser CORS headers.
- **Keys that never leave the browser.** The keys for the signing playground and the test wallet are generated in your browser and kept only in memory. They are never saved or sent, and they vanish on reload. Those two tabs are testnet only and refuse mainnet.
- **The production signing library, not a demo.** The playground uses [QoreSign](/qoresign/overview), the same open-source library as production integrations. It produces and verifies hybrid signatures: a secp256k1 signature plus an ML-DSA-87 signature over the same message.
- **A package hub generated from tested data.** The **SDKs** tab lists 48 packages from one manifest. Versions are read live from each registry (refreshed every 10 minutes, with the last checked version and its date shown if a registry cannot be reached), and each quickstart was run by the SDK team against the public registries, with the output they observed shown beside it.
- **A verdict you can reproduce.** The **Transaction inspector** reads a committed transaction and reports whether its ML-DSA-87 layer verifies against the key the signer has registered, with the sign-bytes version and the reason when it does not, using the `inspectTransaction` function of [QoreSign](/qoresign/overview) 0.1.1, so the same check runs in your own code. It is read-only.
- **Chain answers, not guesses.** **PQ key status** reads the registered ML-DSA-87 key and the EVM window state from the node's own query routes, so you can see why an EVM transaction would be refused before you send it.

## How to use {#how-to-use}

Open [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers). The page opens on **SDKs**. The **PQ key status** and **Simulator** tabs show a **Network** toggle (Testnet or Mainnet) that is local to the page and **defaults to Testnet**, whatever the header says. It is page-local on purpose: the header switch reloads the page, which would wipe the in-memory keys and the test wallet.

### SDKs {#sdks}

**What it does.** Lists every QoreChain library, grouped by product. The manifest holds 48 packages across TypeScript, Python, Go, Rust, Java, Kotlin and Swift. 46 are stable, 1 is deprecated, and 1 is not on its registry yet and is marked **Not published yet** (QoreSeal for npm). The products, in the order shown, are: QoreChain SDK (core, React hooks, EVM, SVM, the dApp starter and the Python, Rust, Go and Java ports), QoreSign (including QoreSign for Python), QoreSeal (encryption to accounts with ML-KEM-1024, testnet; see [QoreSeal](/developer-tools/qoreseal), in Rust, Go, Python, Swift, Kotlin and Android), RDK (the rollup development kit, its command-line tool, the rollup starter and the Python, Rust, Go and Java ports), the PQC library, the wallet adapter, the chain bridge, Handles, QoreX integrations, and MCP and the `qore` CLI.

**How it works.** Each product is a card. If the product ships in several languages, a language selector (pills) switches the package shown. Each package shows:

- a status pill (**Stable**, **Not published yet** or **Deprecated**);
- the **latest version**, read live from its registry (npm, PyPI, crates.io, the Go proxy, Maven Central or GitHub releases) and refreshed every 10 minutes. If a registry cannot be reached, the version last checked is shown with its date and a note that live versions could not be read;
- **Registry**, **Source** (repository) and **License** (Apache-2.0), and the runtime requirements;
- the **Install** command and the **Import** line, each with a copy button, plus peer dependencies, subpath exports, transports and a hosted endpoint where the package has them (Maven shows a `pom.xml` block);
- the **Quickstart**: a pill reading **Tested** with the date, **Failed in testing** or **Not tested**, the file name, the code with a copy button, the **Observed output** and **How it was tested**. A quickstart that failed is hidden behind **Show the quickstart** with a warning to read the known issues first;
- **Known issues** and notes, word for word from the SDK team.

A package that is not published shows "This package is not on its registry yet, so there is no install command." and no install line. The deprecated package (`@qorechain/connect`) is folded at the bottom under **Deprecated packages**, with its replacements (the `@qorechain/qorex-*` packages).

**Steps.**

1. Type in the filter box ("Filter by name or language") to narrow the list; **Clear filter** resets it. When several products match, a **Jump to** row links to each one.
2. Pick the product, then the language pill.
3. Check the version line ("latest on npm", or "checked" with a date), then copy the **Install** command.
4. Copy the **Import** line, then the quickstart into the file named under **File name**, and run it.
5. Open **Network endpoints** to copy the chain ids and public endpoints for testnet and mainnet. The note under it explains the quickstart conventions: the examples only read, and sign with the public test phrase, so never fund an account derived from it.

**Minimal example.** Type `python` in the filter, open **QoreChain SDK**, pick the **Python** pill, copy the install command from **Install**, then copy the quickstart and run it.

**Network.** Static list plus live registry reads; no network choice applies.

### Transaction inspector {#inspector}

**What it does.** Reads a committed transaction by its hash and explains who signed it, what it cost, whether its post-quantum layer verifies and which security tier it falls in. It is read-only: nothing is signed or sent.

**How it works.** The page asks the Dashboard's read-only gateway for the transaction on the network you pick and runs the `inspectTransaction` function of [QoreSign](/qoresign/overview) 0.1.1 over it (see the [QoreSign quickstart](/qoresign/quickstart) to run the same check in code). The post-quantum layer is checked against the ML-DSA-87 key the signer has registered **now**, so a later key rotation can make an older transaction show as not verified.

**Steps.**

1. Open the **Transaction inspector** tab (it is right after **SDKs**) and pick **Testnet** or **Mainnet** with the toggle.
2. Paste the **Transaction hash**: 64 hexadecimal characters, with or without `0x`. A malformed hash is rejected before anything is requested.
3. Select **Inspect**.
4. Read the result:
   - **Overview:** **Status** (**Success**, or **Failed** with the codespace and code), **Height**, **Chain id**, **Memo**, **Fee** with the **Gas limit** (and the fee payer or granter when set), and **Open in explorer**. The explorer follows the network chosen in the header, so a note tells you to switch it when the transaction is on the other network.
   - **Signer:** **Address**, **Key type**, **Sequence**, **Public key** and **Classical signature valid**. EVM-lane transactions carry no signer info here, and the tab says so.
   - **Post-quantum layer:** **Present**, **Count**, **Algorithm** (ML-DSA-87), **Verified** (yes or no), **Sign-bytes version** and, when it is not verified, the **Reason**.
   - **Security tier**, with these definitions:

     | Tier | Meaning |
     | --- | --- |
     | **PQC** | Carries the ML-DSA-87 layer: a hybrid signature. |
     | **Enrollment** | Registers or manages the account's ML-DSA-87 key, and is signed with the classical key by design. |
     | **SHAKE** | A native-lane transaction without the ML-DSA-87 layer. |
     | **Classical** | An EVM-lane transaction, signed with secp256k1 only. |

   - **Messages:** each message's type URL and its raw value (**Show raw value (base64)**), and the **Raw JSON**.
5. An unknown hash reads "No transaction with this hash was found on ..." with a hint to check the hash or switch the network. Testnet nodes prune old history, so an old testnet transaction may be gone.

**Minimal example.** Pick **Testnet** and paste `124E5B2B5B5A8AE7CBA254224CBA07F5014BD1B0014C164A8208E5D7EC0C664E`: the tier reads **PQC** and the post-quantum layer reads **Verified** (checked 27 October 2026; if that transaction has since been pruned, use the hash of a recent testnet transfer).

**Network.** Mainnet or testnet, via the toggle on the tab (default testnet).

### PQ key status {#pq-status}

**What it does.** Shows the ML-DSA-87 key an account has registered on chain and the state of its EVM authorisation window, on mainnet or testnet.

**How it works.** The page parses your input, converts it to a `qor1...` account, and asks the node two queries: the registered PQC key (through [QoreSign](/qoresign/overview)) and the account's EVM window (`GET /qorechain/pqc/v1/evm_window/{address}`). A `0x...` address is the same 20 bytes as its `qor1...` form, and a `qorvaloper1...` address is looked up as the operator's own account. Results belong to one network: changing the toggle clears them.

**Steps.**

1. Open the **PQ key status** tab and pick the network.
2. Enter an **Account address** (`qor1...`, `0x...` or `qorvaloper1...`). The page checks the format and the checksum and reports a typo.
3. Select **Check**.
4. Read **Registered PQC key**: whether a key is registered, the **Algorithm** (ML-DSA-87), the **Key type** (hybrid), **Proof of possession** (with the note that the chain treats it as optional) and the **Public key** (2592 bytes, truncated, with a copy button). An account with no key reads "This account has no PQC key registered on this network."
5. Read **EVM authorisation window**: **State** (**Open** or **Closed**), **Blocks left**, **Transactions used** ("3 of 20" style), **Value used**, **Opened / expiry height**, and whether the window allows **Native QOR transfers only**, with any allowed targets. An account that never opened one reads "No EVM authorisation window has been opened for this account."

The window is opened on the native lane with the account's ML-DSA-87 key and closes when its block limit or its transaction limit is reached; see [EVM authorisation window](/developer-guide/evm-development#evm-window).

**Minimal example.** Pick Testnet, paste the `0x...` form of an address you use with MetaMask, select **Check**: if the window is **Closed** or absent, an EVM transaction from that account would be refused.

### Simulator {#simulator}

**What it does.** Dry-runs a signed transaction against the chain and reports what it would cost and change. Nothing is broadcast.

**How it works.** The page decodes your input (base64 or hex, up to about 180 KB), counts its signatures, and posts it to the node's simulate route. The simulate call is the only write route the gateway allows.

**Steps.**

1. Open **Simulator** and pick the network.
2. Paste the signed transaction (a `TxRaw`, base64 or hex) into **Signed TxRaw**. The page shows the decoded size and number of signatures, and warns if there are none (the chain will most likely refuse to simulate an unsigned transaction).
3. Select **Simulate**.
4. Read **Gas used**, the **Suggested gas limit**, **Balance changes** (address, denom, change) and the **Events** in the collapsible list.
5. If the chain refuses, the page shows its **Code**, **Codespace** and **Log** under "The chain refused the simulation".

You need signed bytes first: build and sign with an SDK or `qorechaind` (see [Post-Quantum Signing](/developer-guide/post-quantum-signing)). **Minimal example:** sign a small transfer with the SDK on testnet, paste the base64 `TxRaw`, select **Simulate**, and check the suggested gas limit before you broadcast.

### Signing playground (testnet only) {#signing-playground}

**What it does.** Lets you generate a throwaway hybrid key and sign and verify messages and Sign In With QoreChain requests in the browser.

**How it works.** A 24-word phrase is generated in the page and kept in memory only. [QoreSign](/qoresign/overview) derives a secp256k1 key and an ML-DSA-87 key from it. Signatures cover the same message with both keys, for chain `qorechain-diana`. Because a throwaway key is not registered on chain, verification uses this session's ML-DSA-87 public key.

**Steps.**

1. Open **Signing playground**. It warns "Throwaway testnet key: never use it for real funds."
2. Select **Generate throwaway key**. The page shows the `qor1...` address, the secp256k1 public key (33 bytes) and the ML-DSA-87 key (public key 2592 bytes, secret key 4896 bytes). **New key** replaces it.
3. **Message:** type text, select **Sign**; the result is a hybrid signature as JSON. Select **Verify**: the page shows "Valid signature", or "Invalid signature" with the error code.
4. **Sign In With QoreChain:** select **Build message** (a sign-in message for this site with the domain, address, chain id, a random nonce and issued and expiry times), then **Sign**, then **Verify**. Verify checks it the way a server would and lists the parsed fields. See the [SIWQ spec](/qoresign/spec/siwq-v1) and the [sign-in guide](/qoresign/guides/sign-in).

**Minimal example.** **Generate throwaway key**, type `hello`, **Sign**, **Verify**: the page shows "Valid signature".

**Network.** Testnet only; the key cannot be used for mainnet and is lost on reload.

### QoreX test wallet (testnet only) {#test-wallet}

**What it does.** Installs a mock of the QoreX wallet in the current tab so you can try a dApp's connect and sign flows without a real wallet.

**How it works.** **Start test wallet** creates a test wallet with a throwaway key (the published `@qorechain/qorex-wallet-mock` package) and announces it to dApps on the page as "QoreX (mock)", through the standard wallet discovery for browser wallets (EIP-6963); it also exposes `window.qorex`. Nothing is approved automatically. It does not broadcast transactions. If a real QoreX extension is present in the tab, the mock replaces it until you reload.

**Steps.**

1. Open **QoreX test wallet** and read the warning: each start generates a throwaway testnet key in memory; never send real funds to it.
2. Select **Start test wallet**. The **Addresses** card lists the QoreChain Native, EVM and SVM addresses.
3. Connect from a dApp running in this tab, or call `window.qorex` from the browser console.
4. Each request appears under **Waiting for approval**; select **Approve** or **Reject**. The **Requests** list logs every request with its approval state and outcome.
5. Select **Stop (reloads the page)** to remove the mock.

**Minimal example.** Start the test wallet, open a dApp in the same tab, choose "QoreX (mock)" in its connect dialog, and **Approve** the connection.

**Network.** Testnet only.

### AI agents (MCP) {#mcp}

**What it does.** Shows the status of the QoreChain MCP server (a Model Context Protocol server that lets an MCP client read QoreChain chain data and use the developer tools) and how to set it up in an MCP client.

**How it works.** When you open the tab the page asks the package registry live and shows the status (**Published**) with the current version (`@qorechain/mcp`, 0.1.0 at the time of writing, which is also on PyPI as `qorechain-mcp`). It then shows the setup for an MCP client, as copyable blocks:

- **Local (stdio), the primary option.** Add `{ "mcpServers": { "qorechain": { "command": "npx", "args": ["-y", "@qorechain/mcp"] } } }` to your MCP client's server configuration. It needs no key.
- **Self-hosted (Streamable HTTP).** Run `qorechain-mcp serve --port 8787` and point the client at `http://localhost:8787/mcp`.
- **Hosted endpoint.** `https://mcp.qorechain.io/mcp` serves testnet by default. Every request needs an API key, sent as an `Authorization: Bearer <key>` header. Request one from your dashboard (see the key flow below). For most uses the local setup needs no key.

**API key for the hosted endpoint.** Sign in, then in the **API key** section of the tab:

1. Fill in the name or organisation, a contact, the intended use and the expected volume, then press **Request API key**. The status reads "waiting for approval".
2. The QoreChain team approves or rejects the request. A rejection shows its note, and you can request again.
3. After approval, press **Generate key**. The key is shown once, with a copy button and a ready configuration snippet, and becomes active within a minute or two. QoreChain keeps no copy of the key, only a fingerprint (a hash), so a lost key cannot be shown again: revoke it and request a new one.
4. **Revoke key** is available at any time and takes effect in about a minute.

Limits: one active key per account, 10 requests per second (burst 20) and 100,000 requests per day.

**Steps.** Open the tab, copy the local configuration into your MCP client, restart it, and ask it to read a block or an account. For tool details and options see [QoreChain MCP server](/developer-tools/mcp). **Minimal example:** paste the stdio block into your client, restart, and ask it for the latest block.

## How to access {#how-to-access}

- **URL:** [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers), or **Developers** in the sidebar **Build** group (and the mobile menu).
- **Sign-in:** none for the page and its tools. Requesting an API key for the hosted MCP endpoint needs sign-in.
- **Network:** **Transaction inspector**, **PQ key status** and **Simulator** work on mainnet or testnet via the toggle on the tab (default testnet). **Signing playground** and **QoreX test wallet** are testnet only. **SDKs** and **AI agents (MCP)** do not depend on a network.
- **Wallet:** none. The tools generate their own throwaway keys.
- **Cost:** free. Nothing is sent to the chain except read queries and simulate calls.
- **Privacy:** throwaway keys exist only in the page's memory. Do not paste a real recovery phrase into any tool.

## Where it is published {#where-published}

| Surface | Address | Networks |
| --- | --- | --- |
| Developers page | `dashboard.qorechain.io/developers` | Read tools on mainnet and testnet; signing tools testnet only |
| Signing library | npm `@qorechain/qoresign` (0.1.1 adds `inspectTransaction`), PyPI QoreSign for Python, source `github.com/qorechain/qoresign`, see [QoreSign](/qoresign/overview) | n/a |
| Test wallet package | npm `@qorechain/qorex-wallet-mock`, source `github.com/qorechain/qorex-integrations` | Testnet |
| Package index | [Developer Packages](/developer-tools/overview) | n/a |
| MCP server | npm `@qorechain/mcp` 0.1.0 and `@qorechain/qore-cli` 0.1.0, PyPI `qorechain-mcp` 0.1.0; guide: [QoreChain MCP server](/developer-tools/mcp) | Testnet by default |

Package versions change; read the current ones on the **SDKs** tab or on the registries.

## Limits and known issues {#limits}

- **The inspector judges against the key registered now.** After a key rotation an older transaction can show as not verified. It reads committed transactions only.
- **The hosted MCP endpoint needs an API key.** Request one from your dashboard (one active key per account, 10 requests per second, 100,000 per day); the local setup needs no key. Use the local setup for most work.
- **Two quickstarts are marked "Not tested":** QoreSign for Android and QoreSeal for Android (the same code was run on the JVM artifact, not on a device). The other tested quickstarts ran and passed.
- **The simulator needs signed bytes.** It cannot sign for you and never broadcasts.
- **The playground and test wallet are testnet only,** use throwaway keys that vanish on reload, and cannot hold or move real funds.
- **A real QoreX extension in the same tab is replaced** by the test wallet until you reload.
- **Reads go through the Dashboard's gateway.** From your own code call the public endpoints directly: `api.qore.host` and `api-testnet.qore.host`.
