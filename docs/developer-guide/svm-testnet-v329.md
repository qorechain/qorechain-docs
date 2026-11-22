---
slug: /developer-guide/svm-testnet-v329
title: "SVM on the Testnet: Deploy Programs and Send Solana Transactions (v3.2.9)"
sidebar_label: SVM Testnet (v3.2.9)
sidebar_position: 11
---

# SVM on the Testnet: Deploy Programs and Send Solana Transactions (v3.2.9)

Release **v3.2.9** lets the standard Solana command line talk to QoreChain. You can run `solana transfer`, `solana program deploy`, `anchor deploy` and a web3.js script against the testnet, and the chain checks every Solana signature itself. A Solana key cannot touch your QoreChain account on its own: you first open a small, bounded **authorisation window** with a transaction signed by your **post-quantum key**, and the window is only accepted when the Solana key proves, with its own signature, that you hold it. When the window ends, the key is an ordinary Solana account again.

This page takes a developer from an empty machine to a deployed and called program on the testnet: what is new, the tools, building the key proof by hand, opening and closing the window, funding a deployer key, deploying with `solana` or `anchor`, calling the program, reading the result, and a table of the real error texts.

:::note Testnet only, checked on 22 November 2026
Everything here runs on the **`qorechain-diana`** testnet, which has run v3.2.9 since 20 November 2026 (governance proposal 39, height 10,424,000). The Solana-compatible (SVM) lane is open there since governance proposal 37. **None of this works on mainnet:** the SVM lane is off on `qorechain-vladi`, cross-VM calls stay paused and CosmWasm contract upload stays governance only. Build against the testnet only. Test QOR has no value. Use throwaway keys.

The read calls, the fee quote, the nonce route and the key-proof example on this page were run against the live testnet on 22 November 2026. The full flow (window, funding, deploy, call, upgrade, close) was run before the release on a local test network with unmodified `solana-cli` 4.0.2 and `anchor-cli` 1.2.2. See [What was checked](#tested) for the exact split.
:::

:::caution The public gateway does not relay transactions yet
On 22 November 2026 `https://svm-testnet.qore.host` answered every well-formed `sendTransaction` with `this node relays no Solana transactions ([svm-rpc] relayer-key is not set)`. Reads work, fee quotes work, writes are refused until the operators of that gateway set a relayer account. The steps up to and including the window need no gateway. For the steps that send, see [Sending without the public gateway](#relay) and re-check the endpoint before you start: run the command in [Step 1](#step-config) and then a `solana transfer` as in [Step 6](#step-fund).
:::

## What is new in v3.2.9 for the SVM {#whats-new}

* **Solana wire transactions on chain.** A transaction that a Solana wallet or tool signed is carried, byte for byte, in the Native message `MsgSolanaTransaction`. The chain verifies every ed25519 signature, the recent blockhash and the fee payer, runs the instructions in order as one atomic step, and refuses a signature it has already seen. The message runs only as a top-level message of its own carrying transaction: it is refused under authz and when a contract dispatches it.
* **A gateway that relays instead of executing.** The node's Solana JSON-RPC method `sendTransaction` no longer runs anything on the node. It decodes the transaction, simulates it on a discarded copy of the state, and hands it to a relayer account that signs the carrying transaction with both keys and sends it to the mempool. Only what goes through a block changes state. The relayer gains no authority over your transaction, because your ed25519 signatures are verified on chain.
* **A post-quantum authorisation window for Solana keys.** `MsgOpenSVMWindow` names one ed25519 key and bounds it by blocks, number of transactions and QOR value, optionally limited to listed programs. While the window is open, transactions signed by that key act for your account. Opening it needs your **ML-DSA-87 signature**, so a leaked Solana key alone can never open one.
* **A key proof.** Opening a window needs `svm_key_proof` (field 7): a 64-byte Ed25519 signature, made by the Solana key itself, over a short text that names the chain, your account and the key. A public key is public, so the proof is what shows that the person opening the window holds the key.
* **One proof opens one window.** The text carries a counter (the nonce) that goes up with every window opened for that key, so an old proof cannot be replayed.
* **A program loader.** The upgradeable loader is available, so `solana program deploy`, `write-buffer`, `extend`, `set-upgrade-authority`, `close` and `anchor deploy` work, and programs can be upgraded by their authority and closed to get the rent back.
* **Fees that Solana tools understand.** `getFeeForMessage` and `simulateTransaction` report the real fee, so the default `solana` and web3.js fee checks are right with no extra flags. When a transaction is too cheap, the error carries the exact price to set.
* **Budgets for authz grants.** `MsgExecuteProgram`, `MsgCreateAccount` and `MsgDeployProgram` sent in your name by someone else under an authz grant run only inside a window and its separate on-behalf budget.

### The transaction path {#path}

```text
solana CLI / web3.js / anchor
        |  sendTransaction (signed wire transaction)
        v
SVM gateway on a node: decode, verify, simulate on a copy, check the price
        |  relayer signs MsgSolanaTransaction with the classical key and ML-DSA-87
        v
mempool, then a block: ante checks every Solana signature, blockhash, fee payer, window
        v
instructions run in order; they all succeed or none does
```

The Solana fee goes to the relayer, so it is never out of pocket. Every answer of the gateway is final: a block is committed once, so `processed`, `confirmed` and `finalized` return the same data.

### The window: what it bounds {#window}

| Bound | What it means | Limit |
| ----- | ------------- | ----- |
| Blocks | The window expires after this many blocks. A block takes about 1.4 seconds on the testnet (checked 22 November 2026), so 3,600 blocks is about 85 minutes | 1 to 17,280 |
| Transactions | Each admitted Solana transaction counts one, even if it then fails | 1 to 1,000 |
| Value | Every decrease of the account's native QOR caused by admitted transactions, fees included, counts. A transaction that would go over the value is refused and reverts. The value is given in uqor or QOR, for example `25qor` | greater than 0 |
| Programs (optional) | Every instruction of an admitted transaction must call one of the listed programs | up to 16 |

Rules that follow from the design:

* The window is opened and closed only by **your own post-quantum signature**, as a top-level message. It is refused under authz, group or a contract.
* You need a **registered post-quantum key** before you can open a window.
* **One Solana key authorises one account at a time.** Opening a window again replaces the old one and frees its key.
* **Changing or migrating your post-quantum key ends the window.**
* Besides the native balance, the value limit also counts QOR that your signature controls elsewhere: accounts derived from yours with a seed, token accounts you may close, lookup tables and loader accounts you are the authority of. Spent or handed to someone else, they count. A window key can never take your account's own address out of the wallet state.
* Reading `getBalance` or `getAccountInfo` for the window key shows your native balance while the window is open.

### Known limits of the window {#window-limits}

Read these before you open a window for a wallet that holds tokens.

* **Token amounts are not counted in the value limit.** The limit counts native QOR only. With the default scope (no program list), the Solana key can transfer and burn the account's SPL tokens, and mint with a mint authority the account holds, for the transaction fee alone.
* **The default scope refuses lasting grants.** A key acting through a default-scope window cannot approve a delegate, change a token account's owner or close authority, or change a mint or freeze authority. This includes a token account or mint created in the same transaction. These need your own post-quantum signature, or a window whose program list names the token program.
* **A co-signer's payment counts against the window.** If another key signs the same Solana transaction and pays something in it, that payment counts against your value limit too. Let a sponsor pay in a separate transaction, or open a window whose value limit covers everything the transaction moves.
* **Grants made under an explicit token scope outlive the window.** If the program list names the token program, delegates and authority changes made through the window stay in place after the window closes, expires or your post-quantum key is rotated. Revoke them with your own signature.
* **To exclude token actions entirely,** open the window with a program list that does not name the token program.

### Fees {#fees}

| Item | Value (testnet, 22 November 2026) |
| ---- | --------------------------------- |
| Base fee per signature | 0.045 QOR (45,000 uqor, 45,000,000 lamports). It is the price of 450,000 gas at the chain's minimum gas price of 0.1 uqor per gas, and `getFeeForMessage` reports it |
| Units on screen | `solana` labels amounts **SOL**. On QoreChain 1 "SOL" is 1 QOR, because 1 uqor is 1,000 lamports and 1 QOR is 1,000,000 uqor. Read "0.045 SOL" as 0.045 QOR |
| Priority fee | Only when the transaction needs more gas than the base fee pays for. It is the ComputeBudget price times the unit limit |
| A deploy | One base fee per write transaction, plus rent that comes back when you close the program |

What you pay is capped by what you signed: you pay the carrying transaction's cost, at least the base fee and at most the fee your own signature promised. A relayer cannot make you pay more.

When a transaction pays less than its carrier costs, the gateway refuses it with code `-32002` and tells you the exact fix. The same numbers are in the error `data`:

```json
{
  "code": -32002,
  "message": "Transaction simulation failed: insufficient priority fee: the transaction pays 45000000 lamports, its carrier costs ... uqor ... set ComputeBudget SetComputeUnitPrice to <price> micro-lamports per compute unit, which covers it for a compute unit limit of <limit> or more ...",
  "data": {
    "computeUnitPrice": 0,
    "computeUnitLimit": 0,
    "transactionComputeUnitLimit": 0,
    "carrierFeeLamports": 0,
    "feeLamports": 0
  }
}
```

The zeros stand for your transaction's numbers. Set `SetComputeUnitPrice` to `data.computeUnitPrice` and a unit limit of at least `data.computeUnitLimit`; one micro-lamport less is refused again. With `solana program deploy` use `--with-compute-unit-price <data.computeUnitPrice>`. In the pre-release runs every step of a normal program deploy, upgrade, extend, close and authority change fitted in the base fee, so you meet this error mainly with an unusually large `--max-len`.

### On-behalf budgets {#on-behalf}

An authz grantee that sends `MsgExecuteProgram`, `MsgCreateAccount` or `MsgDeployProgram` in your name acts only inside your window and its **separate on-behalf budget**: `on_behalf_max_txs` and `on_behalf_max_value`. The key's own limits and the on-behalf budget cannot exhaust each other. With no on-behalf budget (the default) such grants are refused and nothing moves. A `MsgExecuteProgram` wrapped in an authz execution with the account itself as grantee counts as sent on your behalf too, so send your own SVM messages as top-level messages.

Every nested execute or deploy also makes your account pay the SVM flat fee, `max(1, compute_budget_max / 1000)` uqor, which is 1,400 uqor at the live parameter value of 1,400,000. That fee counts against the on-behalf value limit. Set `--on-behalf-max-value` to at least `on_behalf_max_txs` times the flat fee, plus the value the grantee is meant to move. A value of 0 refuses every on-behalf execution.

### The loader {#loader}

| You run | What it does on chain |
| ------- | --------------------- |
| `solana program deploy x.so` | Writes the program into a buffer in many small transactions, then deploys it. The program id is the one in `--program-id`, or a fresh one |
| `solana program deploy --program-id <id> x.so` for an existing program | Upgrades it. Only the upgrade authority can do this |
| `solana program write-buffer` / `show --buffers` / `close <buffer>` | Writes, lists and closes a buffer without deploying |
| `solana program extend <id> <bytes>` | Makes the program's data area bigger |
| `solana program set-upgrade-authority <id> --new-upgrade-authority <key>` | Hands upgrades to another key. `--final` makes the program permanent |
| `solana program close <id>` | Closes the program and returns the rent |
| `anchor deploy` | Does the same with the program built by Anchor |

A program may be up to 10 MiB (the live `max_program_size`). Programs call each other up to 4 levels deep (`max_cpi`). The default compute budget is up to 1,400,000 units per instruction.

## Words used in this guide {#words}

| Word | Plain meaning |
| ---- | ------------- |
| SVM | The Solana-compatible virtual machine in QoreChain. It runs the same compiled programs (SBF) as Solana |
| Lamport | The smallest unit in Solana tools. 1 uqor is 1,000 lamports, and 1 QOR is 1,000,000,000 lamports |
| Window | A short, bounded permission for one Solana key to act for your account. Opening it needs a transaction signed with your post-quantum key |
| Key proof | The Solana key's own signature over a short text. It proves you hold the key you name |
| Nonce | A counter per Solana key, increased by each window opened with a proof. The next proof must sign the current value |
| Carrier | The Native transaction that carries one Solana transaction through a block |
| Relayer | The account that signs and sends the carrier. The Solana fee reimburses it |
| Blockhash | The recent block hash a Solana transaction is built on. It is valid for 150 slots, about 3.5 minutes here |

## Before you start {#prerequisites}

You need a terminal on macOS or Linux, about 10 QOR of test QOR, and these tools (the versions in the right column are the ones used for this page):

| Tool | What for | Version used |
| ---- | -------- | ------------ |
| Solana command line (Agave) | `solana`, `solana-keygen` | `solana-cli` 4.0.2 |
| Rust and `cargo build-sbf` | Build a program | `cargo-build-sbf` 4.0.0, platform tools v1.53, `rustc` 1.89 |
| Anchor (optional) | `anchor build`, `anchor deploy` | `anchor-cli` 1.2.2 |
| Node.js 18 or newer | The key-proof script and the call script | any current LTS |
| `@solana/web3.js` 1.x | Call the program | 1.99 |
| `qorechaind` v3.2.9 | Register your post-quantum key, open and close the window | the release binary, see below |

Check what you have:

```bash
solana --version
cargo build-sbf --version
anchor --version
node -v
```

**About `qorechaind`.** Opening a window is a Native message that needs your ML-DSA-87 signature, and the command `tx pqc open-svm-window` is part of v3.2.9. On 22 November 2026 the testnet release manifest (`https://download.qore.host/testnet/latest.json`) still listed version 3.2.8, so the v3.2.9 bundle is the one named in the text of governance proposal 39 (`GET https://api-testnet.qore.host/cosmos/gov/v1/proposals/39`). The release binary is built for Linux; there is no packaged macOS binary. An SDK helper for the window is not published yet. Everything else in this guide needs no node.

You also need a QoreChain account with test QOR (get it from the [faucet](/dashboard/faucet)) and a registered post-quantum key. If you have not done this, follow [Registering your key](/developer-guide/post-quantum-signing#pqc-key-registration) first. The commands below call the account key `mykey` and its post-quantum key `mykey-mldsa`.

:::caution Throwaway testnet keys only
The two Solana keypairs you create below are files with secret keys inside. Never use a keypair that holds real funds on another network, and never paste a secret key into a command, a chat or a repository.
:::

## Step by step {#steps}

Make one working folder and a separate Solana configuration, so your normal `solana` settings are not touched:

```bash
mkdir -p ~/qore-svm && cd ~/qore-svm
alias qsol='solana -C ~/qore-svm/solana-config.yml'
```

The alias runs `solana` with its own config file. Keep using the same terminal, or repeat the alias in a new one.

### Step 1: Point the Solana tools at the testnet {#step-config}

```bash
qsol config set --url https://svm-testnet.qore.host
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getVersion","params":[]}'
qsol epoch-info
```

The first line saves the RPC address in `solana-config.yml`. The second asks the node for its version. You should see `solana-core` `1.18.0-qorechain`, the chain id `qorechain-diana` and the genesis hash `6Z9pa53SwiprqiAoNCqqUdj5c3C4P1zRw31gQVnF4Czj` (HTTP 200). The third prints the current slot, which equals the block height (about 10.57 million on 22 November 2026).

The lane parameters decide what fits. Read them once:

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params
```

You should see `"enabled":true` and the limits of the live testnet: `max_program_size` 10,485,760, `compute_budget_max` 1,400,000, `lamports_per_byte` 3,480, `max_cpi` 4. If `enabled` is `false`, the lane is closed and nothing below can work.

The public endpoint does not serve a websocket (a websocket upgrade answered HTTP 405 on 22 November 2026), so give `--use-rpc` to the commands that confirm a transaction (`solana program deploy`, `write-buffer`) and let the tool poll over plain HTTP. Anchor accepts it after a double dash.

### Step 2: Create two Solana keypairs {#step-keys}

```bash
solana-keygen new --no-bip39-passphrase --outfile window.json
solana-keygen new --no-bip39-passphrase --outfile deployer.json
solana-keygen pubkey window.json
solana-keygen pubkey deployer.json
```

The first two commands each write a keypair file (a JSON array of 64 numbers: the 32-byte secret seed, then the public key). The last two print the public keys as base58 text. You should see two different addresses of 32 to 44 characters. Call them `WINDOW_PUBKEY` and `DEPLOYER_PUBKEY`.

Why two keys. The **window key** will act for your Native account for a short time. It holds nothing itself; it spends your QOR inside the window. The **deployer key** is an ordinary Solana key. You fund it from the window, and from then on it deploys, upgrades and owns the program with no window involved. Do not use the window key as the upgrade authority: the program records your Native account as authority, and `solana` refuses an upgrade signed by a key that is not the recorded authority.

Set the deployer key as the default signer of your Solana config:

```bash
qsol config set --keypair ~/qore-svm/deployer.json
```

### Step 3: Register your post-quantum key {#step-pqc}

Skip this step if `qorechaind query pqc account <your qor address>` already shows a key. Otherwise, on a machine with the release `qorechaind`:

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana

qorechaind tx pqc gen-key mykey-mldsa
qorechaind tx pqc register-key-v2 dilithium5 <printed-pubkey-hex> hybrid --pqc-key mykey-mldsa \
  --from mykey --chain-id $QCHAIN --node $QNODE --gas 600000 --fees 60000uqor -y
qorechaind query pqc account <your qor address> --node $QNODE
```

`gen-key` creates the ML-DSA-87 key and prints its public key in hex. `register-key-v2` puts it on your account, with a proof of possession. The query should show the registered key. This is the only transaction a new account may sign with the classical key alone. The full explanation, including how to back the key up, is in [Post-Quantum Signing](/developer-guide/post-quantum-signing#pqc-key-registration).

### Step 4: Build the key proof {#step-proof}

The proof is an Ed25519 signature by the window key over this exact text, encoded as UTF-8 with no spaces and no trailing newline:

```text
qorechain-svm-window-key-v1|<chain-id>|<your qor address>|<WINDOW_PUBKEY>
```

For a key that has opened one or more windows before, the nonce `N` follows after one more `|`:

```text
qorechain-svm-window-key-v1|<chain-id>|<your qor address>|<WINDOW_PUBKEY>|<N>
```

`N` is the number of windows already opened with a proof for that key, written in decimal with no sign and no leading zeros. For a new key `N` is 0 and there is no suffix. The signature is plain Ed25519 (RFC 8032): no prehash, no context, and no Solana off-chain message header, so a wallet must sign the raw UTF-8 bytes.

Do not build the text by hand. Ask the chain for it:

```bash
curl -s "https://api-testnet.qore.host/qorechain/pqc/v1/svm_window_key_proof/<WINDOW_PUBKEY>?sender=<your qor address>"
```

The answer has the nonce and the exact text:

```json
{"svm_pubkey":"9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj","nonce":"0","key_proof_required":true,"sign_bytes":"qorechain-svm-window-key-v1|qorechain-diana|qor1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg34kqp8d|9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj","chain_id":"qorechain-diana"}
```

This is the live answer on 22 November 2026 for a sample address. Sign `sign_bytes` with the window key. The script below does both steps, using only Node.js (save it as `keyproof.mjs`):

```js
// node keyproof.mjs <solana-keypair.json> <your qor address>
import { readFileSync } from "node:fs";
import { createPrivateKey, sign } from "node:crypto";

const REST = "https://api-testnet.qore.host";
const [keypairPath, sender] = process.argv.slice(2);

// A solana-cli keypair file: JSON array of 64 bytes, the 32-byte seed first, then the public key.
const bytes = Uint8Array.from(JSON.parse(readFileSync(keypairPath, "utf8")));
const seed = bytes.slice(0, 32);

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function base58(buf) {
  let n = 0n;
  for (const b of buf) n = n * 256n + BigInt(b);
  let out = "";
  while (n > 0n) { out = ALPHABET[Number(n % 58n)] + out; n /= 58n; }
  for (const b of buf) { if (b === 0) out = "1" + out; else break; }
  return out;
}
const pubkey = base58(bytes.slice(32));

// The chain knows its id and the key's nonce, so it gives the exact text.
const url = `${REST}/qorechain/pqc/v1/svm_window_key_proof/${pubkey}?sender=${sender}`;
const info = await (await fetch(url)).json();
console.log("nonce:", info.nonce);
console.log("text to sign:", info.sign_bytes);

// Pure Ed25519 over the UTF-8 bytes of the text.
const pkcs8 = Buffer.concat([Buffer.from("302e020100300506032b657004220420", "hex"), Buffer.from(seed)]);
const key = createPrivateKey({ key: pkcs8, format: "der", type: "pkcs8" });
const proof = sign(null, Buffer.from(info.sign_bytes, "utf8"), key);
console.log("svm_key_proof (hex):", proof.toString("hex"));
```

```bash
node keyproof.mjs window.json <your qor address>
```

You should see `nonce: 0`, the text and a 128-character hex string. Keep the hex string. It is valid for **one window** and only for this sender, key and chain.

**Check your code against a published example.** Chain id `qorechain-diana`, sender `qor1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg34kqp8d` (20 bytes of `0x11`), nonce 0:

| Field | Value |
| ----- | ----- |
| Public key (base58) | `9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj` |
| Public key (hex) | `79b5562e8fe654f94078b112e8a98ba7901f853ae695bed7e0e3910bad049664` |
| Message (131 bytes) | `qorechain-svm-window-key-v1\|qorechain-diana\|qor1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg34kqp8d\|9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj` |
| Signature (hex) | `786b449dcd4b85c2225819c9ac993fbe97a2cfdce7f9ffba07e6895fad0b9b8d3a0634aae5b21d28d366590b3858c7085c8c856a90770fd919ee1bff728b0801` |

With nonce 1 the message is 133 bytes and ends in `|1`. The script above reproduced this signature on 22 November 2026 from the matching key. If your code produces other bytes for the same inputs, the usual causes are a trailing newline, a prehash, the Solana off-chain header or a nonce of the wrong value.

You do not have to run the script: the command in the next step can sign with the keypair file by itself (`--svm-keypair`). Use the script when the key lives somewhere else, for example in a wallet that can sign a plain message, and pass its result with `--svm-key-proof`.

### Step 5: Open the window {#step-open}

Build the transaction, then add the post-quantum signature. This example opens a window of 3,600 blocks (about 85 minutes), up to 10 transactions and 10 QOR in total (value plus fees), limited to the System program (transfers) and the loader (deploys):

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana
SYS=11111111111111111111111111111111
LOADER=BPFLoaderUpgradeab1e11111111111111111111111

qorechaind tx pqc open-svm-window <WINDOW_PUBKEY> 3600 10 10qor \
  --allowed-programs $SYS,$LOADER \
  --svm-keypair ~/qore-svm/window.json \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window-open.json

qorechaind tx pqc cosign window-open.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

The first command builds `window-open.json`. The positional arguments are the Solana public key, the number of blocks, the number of transactions and the value. It reads the nonce from the chain and signs the key proof with `window.json`. The second command adds your ML-DSA-87 signature and sends the transaction. You should see a transaction hash and code 0.

To use the proof from the script instead, replace `--svm-keypair ...` with `--svm-key-proof <hex from Step 4>`. If you give neither flag, the command refuses and prints the exact text to sign. If the key has opened windows before, the command reads the nonce itself; with `--svm-key-proof` you can pin it with `--svm-key-nonce <N>`.

Read the window back:

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/svm_window/<your qor address>
qorechaind query pqc svm-window <your qor address> --node $QNODE
```

You should see `"found":true` and `"live":true`, with `max_txs`, `used_txs`, `max_value`, `used_value`, `remaining_blocks`, `remaining_txs`, `remaining_value`, `allowed_programs`, and `key_proven` `true`. You can also read it by the Solana key: `GET /qorechain/pqc/v1/svm_window_by_key/<WINDOW_PUBKEY>`. The fields `key_proof_required`, `key_usable` and `key_proof_nonce` (the next value to sign) are there too.

The program list names the System program and the loader because that is the combination tested. In this guide the window key only transfers, and the deployer deploys. If you ever let the window key pay a deploy directly, the list must name both programs.

### Step 6: Fund the deployer {#step-fund}

While the window is open, the window key spends your QOR. Send 5 QOR to the deployer:

```bash
qsol balance <WINDOW_PUBKEY>
qsol transfer <DEPLOYER_PUBKEY> 5 --keypair ~/qore-svm/window.json --allow-unfunded-recipient
qsol balance <DEPLOYER_PUBKEY>
```

The first line shows your Native balance as the window key sees it (in "SOL", read QOR). The second sends 5 QOR; the `--keypair` flag makes the window key the signer for this one command, and `--allow-unfunded-recipient` is needed because the deployer holds nothing yet. The third should show `5 SOL`, that is 5 QOR. The transfer costs your account 5.045 QOR in all: the 5 QOR plus the 0.045 QOR base fee, and the window counters (`used_txs` 1, `used_value` 5,045,000) show it.

If this is refused with `this node relays no Solana transactions`, see [Sending without the public gateway](#relay).

### Step 7: Build a small program {#step-build}

```bash
cargo init --lib hello
cd hello
```

Replace `Cargo.toml` with:

```toml
[package]
name = "hello"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]

[dependencies]
solana-program = "2.2"
```

Replace `src/lib.rs` with:

```rust
use solana_program::{account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, msg, pubkey::Pubkey};

entrypoint!(process_instruction);

fn process_instruction(_program_id: &Pubkey, _accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    msg!("hello from QoreChain, {} data bytes", data.len());
    Ok(())
}
```

```bash
cargo build-sbf
ls -l target/deploy
```

This compiles the program for SBF. You should see `hello.so` (about 19 KB) and `hello-keypair.json`, the key whose address becomes the program id. Compiler warnings about `unexpected cfg` are harmless. The program writes one log line and does nothing else.

### Step 8: Deploy {#step-deploy}

```bash
qsol program deploy target/deploy/hello.so --program-id target/deploy/hello-keypair.json --use-rpc
```

This writes the program in about 20 small transactions and then deploys it. `solana` first estimates the cost and checks your balance: for the 18,896-byte build it printed a spend of 0.133 QOR (rent) and a fee of 1.035 QOR on 22 November 2026, which is 23 transactions at 0.045 QOR. You should end with `Program Id: <address>`. Check it:

```bash
qsol program show <program id>
```

You should see the program id, the loader (`BPFLoaderUpgradeab1e11111111111111111111111`), a ProgramData address, the **authority** (your deployer key), the deploy slot and the data length. If you started the deploy and it stops halfway, `solana` prints a 12-word recovery phrase for the temporary buffer key. Keep it until the deploy has finished: with it you resume the same buffer by passing the recovered keypair to the next `program deploy` or `write-buffer`, and you can close the buffer to get its rent back.

For a program built with Anchor, add `--skip-feature-verify` to `solana program deploy`, as the pre-release runs did.

#### With Anchor {#anchor}

```bash
anchor init counter
cd counter
anchor build
anchor deploy --provider.cluster https://svm-testnet.qore.host \
  --provider.wallet ~/qore-svm/deployer.json -- --use-rpc
```

`anchor build` compiles the template program and `anchor deploy` deploys it to the program id in `declare_id!`. A template program is about 130 KB, which is about 130 write transactions at 0.045 QOR, so fund the deployer with at least 10 QOR first. In the pre-release run a 128 KB program cost about 6.8 QOR, most of it the write fees, with the rent coming back on close. A second `anchor deploy` after a code change upgrades the program. Anchor skips the IDL upload for a local address; the IDL upload to the testnet was not tested.

### Step 9: Call the program {#step-call}

`solana` cannot call an arbitrary program, so use a short web3.js script. In an empty folder:

```bash
npm init -y
npm install @solana/web3.js@1
```

Save as `call.cjs`:

```js
// node call.cjs <payer keypair.json> <program id> [data as text]
const fs = require("fs");
const { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } = require("@solana/web3.js");

const RPC = "https://svm-testnet.qore.host";
const [payerPath, programId, text = "hi"] = process.argv.slice(2);
const payer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(payerPath, "utf8"))));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const conn = new Connection(RPC, "confirmed");
  const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash();
  const tx = new Transaction({ feePayer: payer.publicKey, recentBlockhash: blockhash }).add(
    new TransactionInstruction({ programId: new PublicKey(programId), keys: [], data: Buffer.from(text) }),
  );
  tx.sign(payer);

  const signature = await conn.sendRawTransaction(tx.serialize()); // preflight runs on the gateway
  console.log("signature:", signature);

  // The public endpoint serves no websocket, so poll instead of confirmTransaction.
  for (;;) {
    const { value } = await conn.getSignatureStatuses([signature]);
    if (value[0]) { console.log("status:", value[0].confirmationStatus, "err:", JSON.stringify(value[0].err)); break; }
    if ((await conn.getBlockHeight()) > lastValidBlockHeight) throw new Error("blockhash expired, build and send again");
    await sleep(1500);
  }
  const t = await conn.getTransaction(signature, { maxSupportedTransactionVersion: 0 });
  console.log("fee (lamports):", t.meta.fee);
  console.log((t.meta.logMessages || []).join("\n"));
})().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
```

```bash
node call.cjs ~/qore-svm/deployer.json <program id> "hello"
```

The script builds one instruction for your program, signs it with the deployer key, sends it, polls until the signature has a status, and prints the program's log. The fee payer is the deployer, so no window is needed. You should see a signature, `status: finalized err: null`, `fee (lamports): 45000000`, and logs like these (shape from the pre-release run; the message is your program's own):

```text
Program <program id> invoke [1]
Program log: hello from QoreChain, 5 data bytes
Program <program id> consumed ... compute units
Program <program id> success
```

### Step 10: Read the result {#step-read}

| You want | Command or call |
| -------- | --------------- |
| The status of a transaction | `qsol confirm -v <signature>`, or `getSignatureStatuses` |
| Its logs, fee and balance changes | `getTransaction` with `maxSupportedTransactionVersion: 0` (the script above) |
| The program and its authority | `qsol program show <program id>` |
| All programs of the deployer | `qsol program show --programs` |
| A data account | `qsol account <address>`, or `getAccountInfo` |
| Your window, by account or by key | `GET /qorechain/pqc/v1/svm_window/<address>` and `.../svm_window_by_key/<pubkey>` |

A transaction that fails inside a block (for example because you skipped the gateway's preflight with `--skip-preflight`) still keeps its signature and pays its fee, and its effects are reverted. In the pre-release run a transfer above the window's value limit, sent with `--skip-preflight`, landed and failed with `Error processing Instruction 0: generic instruction error`, and the transfer was reverted. Without `--skip-preflight` it is refused earlier, at the gateway, with `-32002 ... SVM authorisation window exhausted`.

### Step 11: Upgrade, hand over, extend and close {#step-admin}

All of these use the deployer key as signer and need no window.

| Task | Command |
| ---- | ------- |
| Upgrade after a code change | `qsol program deploy target/deploy/hello.so --program-id target/deploy/hello-keypair.json --use-rpc` |
| Make the data area bigger by N bytes | `qsol program extend <program id> N` |
| Hand upgrades to another key | `qsol program set-upgrade-authority <program id> --new-upgrade-authority <new.json>` |
| Make the program permanent | `qsol program set-upgrade-authority <program id> --final` |
| Write a buffer without deploying, list buffers | `qsol program write-buffer x.so --use-rpc`, then `qsol program show --buffers` |
| Close a buffer, or close the program and take the rent back | `qsol program close <buffer or program id>` (a program also needs `--bypass-warning`) |

An upgrade by any key that is not the authority is refused. After `set-upgrade-authority`, the old authority is refused and the new one can upgrade. After `--final` an upgrade is refused with a message that the program is no longer upgradeable. A closed program cannot be called again and `program show` says it has been closed.

### Step 12: Close the window {#step-close}

You can close a window when you are done, and you must close it at once if you think the Solana key was exposed. Whatever the window still admitted is refused from the next block:

```bash
qorechaind tx pqc close-svm-window --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window-close.json
qorechaind tx pqc cosign window-close.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Read the window again: it should no longer be live, and `qsol balance <WINDOW_PUBKEY>` should show 0 again. The window key can no longer move your QOR. The deployer key, program and funds you created through the window stay yours.

To open a new window for the same key, run Step 4 again: the nonce is now higher, and a proof made for the old window is refused with `expected_nonce`.

## Sending without the public gateway {#relay}

The public gateway at `svm-testnet.qore.host` refused to relay on 22 November 2026 (see the box at the top). There are two ways to send until it relays.

**A single transaction through the command line.** Any native account that holds QOR and has a registered post-quantum key can carry a Solana transaction you signed. Build and sign the Solana transaction first, for example with web3.js, and print it in base64 (`tx.serialize().toString("base64")`). A transaction is valid for about 3.5 minutes after the blockhash it uses. Then:

```bash
qorechaind tx svm solana-tx <base64 transaction> --from mykey \
  --chain-id $QCHAIN --node $QNODE --gas <GAS> --fees <FEES>uqor --generate-only > relay.json
qorechaind tx pqc cosign relay.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Set `--gas` and `--fees` from a dry run: run `tx pqc cosign` with `--dry-run` first (it prints a gas estimate and sends nothing), then use the estimate plus 30% as `<GAS>`, and a fee of at least `<GAS>` times 0.1 uqor as `<FEES>`. A simple transfer needs roughly 300,000 to 400,000 gas, and a deploy or a proposal that carries code needs much more.

The account in `--from` is the relayer. It signs the carrier and pays its gas, and the Solana fee payer reimburses it. The relayer gains no authority over the Solana transaction. The carrier's fee must be covered by what the Solana transaction pays: 45,000 uqor for one signature. This is practical for a transfer or a call, not for a deploy of many write transactions. This route was not run on the live testnet for this page.

**Your own gateway.** A node that follows the testnet and runs the v3.2.9 binary serves the Solana JSON-RPC on port 8899 and relays when the `[svm-rpc]` section of its `app.toml` names a relayer: `relayer-key` (a funded account in the node's keyring, or several separated by commas), `relayer-pqc-key` (their ML-DSA-87 keys under the node's `pqc` folder) and `relayer-keyring-backend`. With `relayer-key` empty, `sendTransaction` is refused, as on the public endpoint today. Leave `relayer-fee` empty: the relayer then prices each carrier from what the Solana transaction pays, so it is never out of pocket. Copy the whole `lib/` folder of the release bundle. This setup was not run for this page; see [Running a Node](/developer-guide/running-a-node) for the node itself.

## Limits to plan for {#limits}

* **Relay quota.** A Solana transaction sent through a gateway counts against its fee payer: 600 per 30 blocks at the default, which is well under a minute. A large deploy from one key can pass it (a 1 MB program is about 1,100 writes). The refused writes cost nothing. Write the buffer first with `qsol program write-buffer`, wait a minute and run it again with the same buffer if it stops, then deploy from the buffer with `--buffer`, or pay the buffer writes and the deploy from different fee payers.
* **Gateway fair share.** A gateway keeps part of its capacity for clients that have sent few transactions and shares the rest evenly between active client networks. If you are refused with a fair-share message (code `-32005`), wait a minute or use another gateway.
* **The transaction must land before its blockhash expires** (150 slots). `solana` resends for you; a script should do the same.
* **A transaction is at most 1,232 bytes, with at most 64 accounts,** as in Solana. Legacy and version 0 messages are accepted.
* **Programs and accounts:** 10 MiB each; 32 KiB stack and 256 KiB heap per frame.
* **Custody limits** from [SVM Lane (v3.2.8)](/developer-guide/svm-lane-v328#custody) still apply: a deposit can be refused with `svm custody cap exceeded` (code 23) when the SVM pool is at its cap.
* **Names in the window list.** `--allowed-programs` takes base58 program ids, at most 16, each only once. A scope applies to the transaction's top-level instructions: a listed program that calls other programs carries your signature along, so list only programs you trust as a whole.
* **Addresses.** A new v3.2.9 message refuses a bech32 address that is not in its canonical lower-case form. Send the form `toBech32` produces.

## Troubleshooting {#troubleshooting}

Texts marked "live" were seen on the live testnet on 22 November 2026. The others are the chain's and the gateway's own messages as seen in the pre-release runs.

| What you see | What it means | What to do |
| ------------ | ------------- | ---------- |
| `this node relays no Solana transactions ([svm-rpc] relayer-key is not set)` (JSON-RPC code `-32603`, live) | The gateway has no relayer account | Use [your own gateway or the command-line relay](#relay), or wait for the operators |
| `Error: Account <key> has insufficient funds for spend (X SOL) + fee (Y SOL)` (live, from `solana`) | The key holds nothing. Read SOL as QOR | Open the window and fund the key, or open the window and use the window key as the signer |
| Simulation `InsufficientFundsForFee`, log `fee payer ... has no account: insufficient fee` (live) | Same cause, seen from a simulation | Same fix |
| `invalid solana transaction: no signatures`, `truncated: need 2 bytes at 1` (code `-32602`, live) | The bytes are not a signed Solana transaction | Send the full signed wire transaction, base64 or base58 |
| HTTP 405 on a websocket upgrade (live) | The public endpoint serves no websocket | Add `--use-rpc` to `solana program deploy` and `write-buffer`; poll with `getSignatureStatuses` in scripts |
| `-32002 ... insufficient priority fee ...` | The transaction pays less than its carrier costs | Set the ComputeBudget price and unit limit from the error `data`; see [Fees](#fees) |
| `-32002 ... SVM authorisation window exhausted` | The window ran out of blocks, transactions or value, or the transaction would go over the value | Read the window, open a new one with a higher value or more transactions |
| `no open SVM authorisation window` (codespace `pqc`, code 341) | The key has no live window | Open one (Step 5) |
| Open refused with code 343 and `expected_nonce=<N>` | The proof was signed over another nonce, for example an old proof | Read the nonce route again (Step 4), sign again |
| `the key proof does not verify for <key>, sender <qor address>, chain <id>` (CLI) | The signature does not match the text | Sign exactly `sign_bytes` from the nonce route, with the right key and sender |
| `--svm-keypair holds the key X, not Y` (CLI) | The keypair file is not the key you named | Use the keypair that matches the base58 key |
| `the window needs the proof that you hold the Solana key` (CLI) | You gave neither `--svm-keypair` nor `--svm-key-proof` | Give one of them; the message prints the text to sign |
| `blocks must be between 1 and 17280`, `max_txs must be between 1 and 1000`, `max_value must be positive`, `allowed_programs lists N programs, the maximum is 16` | A window bound is out of range | Use values inside the table under [The window](#window) |
| `svm_pubkey ... is not a valid ed25519 public key`, or `... is a native account address, not an ed25519 key` | The key is a program address or one of your QoreChain addresses | Use a keypair made with `solana-keygen` |
| `sender sol:<payer> has sent 600 transactions in the last 30 blocks` | The relay quota of one fee payer | Wait a minute, resume with the same buffer; see [Limits](#limits) |
| `-32005` with `fair share of the relayer quota` | The gateway shares its capacity | Retry after a minute |
| `-32020 node is starting, no committed state` | The node has no state yet | Retry in a few seconds |
| `node busy: the carrier could not be measured now, retry` | The gateway could not price the carrier at this moment | Retry |
| `Transaction simulation failed: Blockhash not found` | The blockhash is older than 150 slots or unknown | Fetch a fresh blockhash, sign and send again |
| `Transaction simulation failed: This transaction has already been processed` | The same signed transaction was seen before | Check `getSignatureStatuses`; do not send it again |
| A Solana transaction is refused with `cannot approve a delegate`, `cannot hand over the ownership`, `cannot hand over the close authority` or `cannot change the mint or freeze authority`, with `the grant would outlive the window` | A default-scope window refuses lasting token grants | Sign this action with your own post-quantum key on the Native lane, or open a window whose program list names the token program (see [Known limits](#window-limits)) |
| `SVM module is disabled` (code 11) | The lane is closed. This is the mainnet state | Use the testnet |
| `svm custody cap exceeded` (code 23) | The SVM pool is at its cap | Retry later or with a smaller amount |
| `solana program deploy` of an Anchor-built program is refused client-side on the program's features | The tool checks ELF features | Add `--skip-feature-verify` |
| An upgrade by the window key is refused by `solana` | The recorded authority is your Native account, not the key | Deploy with a separate deployer key as in this guide |
| Window open or close refused under authz, group or a contract | Windows are opened and closed by your own signature only | Send the message as a top-level message from your account |

## What was checked {#tested}

| Check | Where and when | Result |
| ----- | -------------- | ------ |
| `GET /qorechain/svm/v1/params` and `/cluster_info` | live testnet, 22 November 2026 | `enabled` and `execution_enabled` both `true` |
| `getHealth`, `getVersion`, `getGenesisHash`, `getLatestBlockhash` (base58), `getMinimumBalanceForRentExemption(1024)` | live testnet, 22 November 2026 | `ok`; `1.18.0-qorechain`; genesis hash as above; 44-character base58 blockhash; 8,017,920 lamports |
| `getFeeForMessage` and `simulateTransaction` for a one-signature transfer | live testnet, 22 November 2026 | fee 45,000,000 lamports (0.045 QOR); an unfunded payer gives `InsufficientFundsForFee` |
| Key-proof nonce route and window routes | live testnet, 22 November 2026 | nonce 0, `sign_bytes` as in Step 4; `found` `false` for an address with no window |
| Key-proof script of Step 4 against the published example | live testnet route, 22 November 2026 | signature identical to the table |
| Program build with `cargo build-sbf` (4.0.0, platform tools v1.53) | local machine, 22 November 2026 | 18,896-byte `hello.so` |
| `solana program deploy` cost estimate from an unfunded key | live testnet, 22 November 2026 | refused client-side with spend 0.133 QOR and fee 1.035 QOR |
| `sendTransaction` of a well-formed transfer | live testnet, 22 November 2026 | refused: `this node relays no Solana transactions` |
| Websocket upgrade on the public endpoint | live testnet, 22 November 2026 | HTTP 405 |
| Open window, `solana transfer` from the window key, deploy, call, upgrade, set authority, extend, close, `anchor deploy` and upgrade | local test network before the release, `solana-cli` 4.0.2, `anchor-cli` 1.2.2, `@solana/web3.js` 1.99 | passed |
| The same steps on the live testnet | not run: the public gateway relayed nothing on 22 November 2026, and no test QOR was spent on this page | not run |

## Mainnet {#mainnet}

Mainnet runs a release without any of this: the SVM lane is off there, its public SVM endpoints are read-only, cross-VM calls stay paused and contract upload stays governance only. Do not open windows, deploy or send Solana transactions against mainnet; plan against the testnet only.

## See also {#see-also}

* [SVM Lane (v3.2.8)](/developer-guide/svm-lane-v328): the lane state, rent, custody limits and the post-quantum key of an SVM wallet.
* [SVM Development](/developer-guide/svm-development): the lane overview and the JSON-RPC server.
* [Solana-Compatible JSON-RPC](/api-reference/json-rpc-solana-compatible): the method list.
* [Post-Quantum Signing](/developer-guide/post-quantum-signing): registering and using your ML-DSA-87 key.
* [EVM Authorisation Window Reference](/developer-guide/evm-window-reference): the same idea for Ethereum-style keys.
* [Cross-VM Interoperability](/developer-guide/cross-vm-interoperability): calls between SVM, EVM and QoreChain Native.
* [Version History](/appendix/version-history#v329): what v3.2.9 changed.
