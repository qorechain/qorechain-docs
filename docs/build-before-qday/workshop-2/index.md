---
slug: /build-before-qday/workshop-2
title: "Workshop 2: Protect money with a post-quantum key"
sidebar_label: "Workshop 2"
sidebar_position: 3
date: 2026-11-18
---

# Workshop 2: Protect money with a post-quantum key

Workshop 1 sent one transaction signed with two keys. Workshop 2 uses the post-quantum key to **protect money**: first a smart contract that pays out only when a post-quantum key signs, then an AI agent whose spending limits are enforced by the chain, then a way to ask the chain how each transaction was protected.

You do not need to be a security expert. Every command below says what it does and what you should see. The three example apps are public: [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), folder `workshop-2`.

**How long this takes:** about 40 minutes for the vault, 25 for the agent, 10 for the questions to the chain. Do the parts in any order, but each part needs its own test account.

## What we build {#what-we-built}

| Part | App | What it shows |
| --- | --- | --- |
| 1 | **QDayVault** (Solidity and TypeScript) | A vault that pays out only with an ML-DSA-87 signature, checked on chain by the `pqcVerify` precompile. A stolen Ethereum-style key is not enough to take the money. |
| 2 | **Bill-paying agent** (Node.js) | An agent with its own key. The chain enforces its limits: send only, 1 QOR per payment, 3 QOR per day, 24 hours. |
| 3 | **Ask the chain** (MCP and `qore-cli`) | Read-only questions: was this transaction signed post-quantum, and what is the state of this account's key? |

The innovations behind them:

- **Post-quantum verification inside a contract.** The chain has built-in contracts (precompiles) at fixed addresses that check ML-DSA-87 signatures and report an account's registered key. Your Solidity code calls them like any other contract.
- **Limits that live on chain.** An agent's permissions and spending rules are part of the account, so a bug or a stolen server cannot lift them.
- **Honest labels.** The chain can tell you which transactions carried a post-quantum signature and which did not.

## Words used in this guide {#words}

| Word | Plain meaning |
| --- | --- |
| Precompile | A built-in contract at a fixed address that the chain runs natively. `pqcVerify` is at `0x0000000000000000000000000000000000000a01` and `pqcKeyStatus` at `0x0000000000000000000000000000000000000a02`. Write the addresses in lowercase: the Solidity compiler rejects mixed-case spelling |
| ML-DSA-87 | The post-quantum signature scheme (NIST FIPS 204) used by QoreChain |
| EVM window | A short, limited permission to send Ethereum-style transactions from an account. Opening it needs a transaction signed with both keys, so an Ethereum key alone can never open one |
| Guardian | The account whose post-quantum key must sign every withdrawal from the vault |
| Authenticator | A key linked to your account with rules the chain enforces, as used by the agent in part 2 |
| Throwaway account | A key made for this exercise that holds test QOR only |

:::caution Throwaway testnet accounts only
Use keys made for this workshop, holding test QOR with no value. Never put the key or recovery code of an account that holds real money into a `.env` file or a command.
:::

## Before you start {#prerequisites}

You need the tools from [Before you start](/build-before-qday/prerequisites) (a terminal, Node.js 22 or later and Git), and a web browser. Check Node.js:

```bash
node -v
```

It should print `v22` or higher. Part 1 also needs **pnpm** and **Foundry**:

```bash
npm install -g pnpm
```

Installs pnpm, the package tool the vault uses. Check it with `pnpm -v`.

Foundry compiles, tests and deploys Solidity. Install it from [getfoundry.sh](https://getfoundry.sh): the page gives one command for your system, then you run:

```bash
foundryup
```

Downloads the Foundry tools. Check with `forge --version` and `cast --version`.

Get the example code:

```bash
git clone https://github.com/qorechain/build-before-qday.git
cd build-before-qday/workshop-2
```

The first line downloads the examples into a folder named `build-before-qday`. The second moves into the `workshop-2` folder, which holds the three apps.

For test QOR you use the [faucet](/dashboard/faucet) on the dashboard. All three apps run on the QoreChain testnet `qorechain-diana` only.

## Part 1: QDayVault, a vault that survives a leaked key {#part-1}

Code: [workshop-2/01-qday-vault](https://github.com/qorechain/build-before-qday/tree/main/workshop-2/01-qday-vault). A normal wallet key (the secp256k1 key MetaMask uses) could one day be broken by a quantum computer. This vault is built so that a stolen key of that kind is not enough: money leaves only when the **guardian** signs the withdrawal with a post-quantum key, and the contract checks that signature itself, on chain. Anyone may submit the signed withdrawal. What matters is the signature, not who sends it.

```bash
cd 01-qday-vault
```

Moves into the vault folder.

### How the contract works {#vault-how}

Open `src/QDayVault.sol`. The important function is `withdraw`:

```solidity
(bool registered,, bytes memory pubkey, bool proven) = PQC_KEYS.pqcKeyStatus(guardian);
if (!registered || pubkey.length == 0) revert GuardianKeyNotRegistered();
if (!proven) revert GuardianKeyNotProven();

uint256 n = nonce;
if (!PQC_VERIFY.pqcVerify(pubkey, mldsaSignature, withdrawalMessage(to, amount, n))) revert BadPqcSignature();

nonce = n + 1;
emit Withdrawn(to, amount, n);
(bool ok,) = to.call{value: amount}("");
if (!ok) revert TransferFailed();
```

1. **Read the guardian's key from the chain.** The key is 2,592 bytes, so the contract does not store it. If the guardian rotates the key on chain, the vault follows.
2. **Refuse a key that was never proven.** "Proven" means the account signed a proof of ownership when it registered the key. Without this check someone could register a key they do not own.
3. **Verify the signature over an exact message.** The message binds a fixed tag, the chain id, the vault address, the recipient, the amount and the nonce, so a signature works for one withdrawal, on one vault, on one chain, once.
4. **Raise the nonce before sending money.** The same signature cannot be used twice, and the state changes before the outside call, which protects against reentrancy.
5. **Check that the transfer worked.** If it failed, the whole transaction is undone.

### Step 1: run the tests (no account needed) {#vault-tests}

```bash
pnpm install
```

Downloads the JavaScript packages in `package.json` (the QoreChain SDK, viem, tsx).

```bash
pnpm forge-std
```

Downloads `forge-std`, Foundry's standard library, into `lib/`. The tests and the deploy script import it. You do this once.

```bash
forge test
```

Compiles the contract and runs the 8 tests in `test/QDayVault.t.sol`. You should see `8 passed; 0 failed`. The local test chain has no QoreChain precompiles, so the tests put small stand-in contracts at the two precompile addresses with `vm.etch`. They check the logic: a good signature pays, a bad one is refused, a signature works once, an unproven key is refused. The real precompiles run in the next steps.

### Step 2: create a testnet-only account {#vault-account}

```bash
cast wallet new
```

Prints a new address and private key. Use it for the testnet only.

On macOS and Linux:

```bash
cp .env.example .env
```

On Windows PowerShell use `Copy-Item .env.example .env`. This creates your own settings file. `.env` is ignored by Git, so it is never committed. Open `.env` and set `PRIVATE_KEY` to the private key from `cast wallet new`.

```bash
pnpm window recovery-code
```

Prints a recovery code that starts with `QRC1-`. Your post-quantum key is made from it. Put it in `.env` as `QORE_PQC_RECOVERY_CODE` and keep a copy somewhere safe, apart from the private key. Always use the same code: a different code means a different post-quantum key.

### Step 3: fund the account {#vault-fund}

```bash
pnpm window status
```

Prints your account in two forms, `0x...` and `qor1...`. They are the same account. Paste the `qor1...` address into the [faucet](/dashboard/faucet).

### Step 4: register your post-quantum key, once {#vault-register}

```bash
pnpm window register
```

Puts your ML-DSA-87 public key on chain, with a proof that you own it. You do this once per account. Afterwards `pnpm window status` shows `PQC key: registered`. This is the only transaction the chain accepts with the classical key alone, because the chain does not know your post-quantum key yet. For what the registration really binds, see [How your post-quantum key is bound to your account](/build-before-qday/key-binding).

### Step 5: open a scoped EVM window {#vault-window}

```bash
pnpm window:scoped
```

Sends a transaction signed with both keys that opens an EVM window of **600 blocks (about 15 minutes), 3 transactions and 2 QOR** of value plus fees. That is enough for the deploy and one withdrawal, and nothing more. If your classical key leaks while the window is open, the damage is capped at that budget; when it ends, the Ethereum-style lane closes again.

**Wait about 10 seconds** before the next step. Opening the window used one nonce of your account, and the next block must include it first.

### Step 6: deploy the vault {#vault-deploy}

```bash
pnpm deploy:testnet
```

Runs the Foundry script `script/QDayVault.s.sol`: it deploys the vault with a 1 QOR deposit and makes **you** the guardian. Look for `QDayVault 0x...` in the output. In Foundry's output "ETH" means QOR.

```bash
pnpm vault status
```

Shows the vault address, its balance (1 QOR), the guardian (you) and the nonce (0).

### Step 7: the attack, as a simulation {#vault-attack}

```bash
pnpm vault attack 0x1b6dF9880065e7758c6e82741c50cEaD80664937 0.5
```

Plays an attacker who has your classical key but not your post-quantum key. It signs the withdrawal with a random ML-DSA-87 key and asks the chain what would happen. You should see `BLOCKED by the vault: BadPqcSignature`. It is only a simulation, so it costs nothing and does not use your window. Any address works as the recipient.

### Step 8: the real withdrawal {#vault-withdraw}

```bash
pnpm vault withdraw 0x1b6dF9880065e7758c6e82741c50cEaD80664937 0.5
```

Signs the withdrawal with **your** ML-DSA-87 key (a 157-byte message, a 4,627-byte signature) and sends it. The vault checks it with `pqcVerify` and pays. You should see `WITHDRAWN tx 0x...` and an explorer link.

```bash
pnpm window status
```

Shows what is left of the window: 1 transaction, exactly the budget you gave it.

### If something goes wrong {#vault-troubleshooting}

| You see | What it means | What to do |
| --- | --- | --- |
| `REFUSED: Missing or invalid parameters` on deploy or withdraw | There is no live EVM window: it expired or was used up | Run `pnpm window status`, then `pnpm window:scoped`, wait 10 seconds, try again |
| `does not exist on chain yet` | The account has no QOR yet | Use the faucet (step 3) |
| `PQC key: not registered` | Step 4 was skipped | Run `pnpm window register` |
| `GuardianKeyNotRegistered` | The guardian has no ML-DSA-87 key on chain | Register it (step 4) |
| `No vault yet` | Nothing was deployed from this folder | Do step 6, or set `VAULT_ADDRESS` in `.env` |

### Audit the contract before you deploy {#vault-audit}

The `audit/` folder holds the first draft of the contract, with real bugs, and the fixed version. It shows a two-stage flow with the dashboard's [Contract Auditor](/dashboard/contract-auditor): audit the draft, fix every finding with a test, audit the final contract and keep both reports. An automatic audit does not replace a human audit before mainnet. For Solidity the quantum readiness rating shows "Not scored", which is expected: on the EVM the post-quantum check is done by the chain through the precompile. See `audit/README.md` in the folder, and the [EVM Precompiles](/developer-guide/evm-precompiles) page for the precompile addresses and gas.

## Part 2: a bill-paying agent with limits the chain enforces {#part-2}

Code: [workshop-2/02-pq-agent](https://github.com/qorechain/build-before-qday/tree/main/workshop-2/02-pq-agent). If you give a bot your private key, its spending limits live in its own code. One bug, one prompt injection or one stolen server, and the limits are gone. On QoreChain the limits live **on chain**: the agent gets its own key, linked to your account under rules the chain checks on every payment.

Go back one folder and into the agent:

```bash
cd ../02-pq-agent
```

### Three keys, three roles {#agent-keys}

| Key | Who holds it | What it can do |
| --- | --- | --- |
| **Owner** | You | Your account, signed with both keys. Holds the money, links the agent and writes the rules |
| **Agent key** | The agent | An ed25519 key. It can ask to spend from the owner's account, only inside the rules. It holds no money |
| **Gas wallet** | The agent | A small separate account that submits the agent's requests and pays the fees. It never holds the owner's money |

The rules in this example: the agent may only **send QOR**, at most **1 QOR per payment** and **3 QOR per day**, and the link **expires after 24 hours**. Open `agent.mjs` and look at the `pay` command: there is no limit check in it. The agent just tries to pay. Every limit you will see comes from the chain.

### Step 1: install and create the keys {#agent-keys-create}

```bash
npm install
```

Downloads the packages in `package.json`: the QoreChain SDK, CosmJS and `@noble/curves` for the ed25519 key.

```bash
node agent.mjs init
```

Creates the agent's ed25519 key and its gas wallet and saves them in `~/.config/qday/agent.env`, readable only by you. It prints the gas wallet's `qor1...` address.

```bash
node agent.mjs owner-init
```

Creates a throwaway owner account for the testnet and saves it in `~/.config/qday/owner.env`. To use an account you already have, put `QORE_MNEMONIC="..."` in that file instead. Keys never leave your computer, are never printed and never belong in a repository.

```bash
node agent.mjs whoami
```

Prints the three addresses: owner, agent key and gas wallet.

### Step 2: fund the owner and the gas wallet {#agent-fund}

Paste each `qor1...` address into the [faucet](/dashboard/faucet). The owner needs a few QOR for the bills, the gas wallet about 3 QOR for fees.

```bash
node agent.mjs balance
```

Checks that both have QOR.

### Step 3: register the post-quantum keys, once {#agent-register}

```bash
node agent.mjs register owner
node agent.mjs register gas
```

Each account puts its ML-DSA-87 public key on chain with a proof of ownership. From then on both sign every transaction with two keys.

### Step 4: link the agent, with limits {#agent-link}

```bash
node agent.mjs link 1 3
```

The owner sends **one** transaction, signed with both keys, that links the agent's ed25519 key to the owner's account (the agent key signs a proof that it agrees, so nobody can link a key they do not own), gives it one permission (`send`), writes a spending rule (1 QOR per payment, 3 QOR per day, `uqor` only) and sets a 24-hour expiry. Add a third number for another number of hours, at most 30 days. You should see `agent linked` and `hybrid ML-DSA-87: verified`.

```bash
node agent.mjs rules
```

Reads back from the chain what it enforces: the rule, the permission, the expiry and how many payments the agent has made. For how linking works, see [Authenticators](/sdk/guides/authenticators).

### Step 5: let the agent pay the bills {#agent-run}

```bash
node agent.mjs run bills.json
```

The agent tries to pay the five bills in `bills.json`, 8.2 QOR in total. For each it signs a request with its ed25519 key and the gas wallet submits it. You should see:

| Bill | Amount | Result | Why |
| --- | --- | --- | --- |
| Server hosting | 0.8 | PAID | |
| Domain renewal | 0.5 | PAID | |
| Invoice from an unknown sender | 5 | REFUSED BY THE CHAIN | Over the 1 QOR per-payment limit |
| API credits | 1 | PAID | |
| Monitoring | 0.9 | REFUSED BY THE CHAIN | Over the 3 QOR daily limit: 2.3 spent, 0.7 left |

The refusals come from the chain, not from the agent's code. One detail in the explorer: a refused payment still shows as a transaction with code 0. The transaction itself was accepted into a block, but the payment inside it was refused. `agent.mjs` reads the result of the payment inside, which is what it prints.

### Step 6: revoke the agent {#agent-revoke}

```bash
node agent.mjs revoke
```

One transaction from the owner switches the agent key off.

```bash
node agent.mjs pay qor1s90l5nnwfjznf4cdj3p4pf2p7uk32axf8800yu 0.1 "after revoke"
```

Tries one more payment. You should see `REFUSED BY THE CHAIN: linked key is unbound or revoked`. So if an agent is ever compromised, the most you can lose is its daily limit, and one transaction stops it.

To run the demo again, move `~/.config/qday/agent.env` somewhere else (after moving the gas wallet's QOR out) and run `node agent.mjs init` again.

All commands: `init`, `owner-init`, `whoami`, `register owner|gas`, `link <perTxQOR> <dailyQOR> [hours]`, `rules`, `pay <to> <QOR> [memo]`, `run <bills.json>`, `revoke`, `balance`. You can change `QORE_REST`, `QORE_RPC` (your own node) and `QDAY_DIR` (where the key files live) with environment variables.

## Part 3: ask the chain, with MCP and qore-cli {#part-3}

Code: [workshop-2/03-mcp](https://github.com/qorechain/build-before-qday/tree/main/workshop-2/03-mcp). MCP (Model Context Protocol) is a standard way for coding assistants and other AI tools to use outside tools. The QoreChain MCP server, `@qorechain/mcp`, gives them **read access** to the chain: blocks, transactions, accounts, the state of an account's post-quantum key, fee estimates and simulations. It has 14 tools. It **never signs, never holds keys and never broadcasts**: if you ask for a transfer, it gives you an unsigned document and you sign it in your own wallet.

### Add it to your MCP client {#mcp-config}

Any MCP client works. Most use a configuration like this:

```json
{
  "mcpServers": {
    "qorechain": {
      "command": "npx",
      "args": ["-y", "@qorechain/mcp"]
    }
  }
}
```

`npx -y` downloads the server the first time and starts it. The client then lists its tools, for example `get_pq_status`, `get_transaction`, `get_address_info`, `read_contract`, `estimate_fee`, `simulate_tx` and `prepare_transfer`.

### The same questions from the terminal {#mcp-cli}

`qore-cli` gives the same answers without an AI client. Ask three questions about what you built:

```bash
npx -y @qorechain/qore-cli pq status <hash of an agent payment>
```

Was the agent's payment signed post-quantum? Expected: `tier: pqc`, `verified: true`. It is a native transaction, signed with both keys and checked by the chain.

```bash
npx -y @qorechain/qore-cli pq status <hash of the vault withdrawal>
```

And the vault withdrawal? Expected: `tier: classical`, `reason: evm_lane`. That is an honest answer: Ethereum-style transactions carry no post-quantum signature. They are protected by the EVM window and, here, by the vault contract, which checks an ML-DSA-87 signature itself.

```bash
npx -y @qorechain/qore-cli pq status <your 0x or qor1 address>
```

And the account? Expected: `registered: true`, `possession_proven: true`, and the EVM window with what is left of it.

### A visual client (optional) {#mcp-inspector}

To click through the tools without an AI assistant:

```bash
npx -y @modelcontextprotocol/inspector npx -y @qorechain/mcp
```

Then choose **Connect**, **Tools**, **List Tools**, pick `get_pq_status`, put an address or a hash in `target`, and choose **Run Tool**.

## What you have now {#done}

A contract that pays only against a post-quantum signature, an agent whose limits the chain enforces, and the tools to check how any transaction was protected. Use any of them as the base for your submission: see [Build Before Q-Day](/build-before-qday/overview) for the levels and the rules.
