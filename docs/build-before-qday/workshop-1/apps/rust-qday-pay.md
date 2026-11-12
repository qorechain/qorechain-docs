---
slug: /build-before-qday/workshop-1/apps/rust-qday-pay
title: Rust App, qday-pay
sidebar_label: Rust, qday-pay
sidebar_position: 4
---

# Rust App: qday-pay

**qday-pay** is a small Rust program that you run in a terminal. It pays testnet QOR on the QoreChain testnet `qorechain-diana` with a **hybrid signature**: a classical secp256k1 signature plus a post-quantum ML-DSA-87 signature (NIST FIPS 204). After the payment, it reads the transaction back from the chain and shows you the chain's own proof that both signatures were checked.

**How long this takes:** about 15 minutes in total. The first build downloads and compiles the libraries and takes 2 to 5 minutes. After that, every command runs in seconds.

## What it shows {#what-it-shows}

- **Hybrid signing from Rust** with the published crate `qorechain-sdk` (version 0.13, used in code as `qorechain`).
- **One-time registration** of your post-quantum key on chain.
- **A verification report** for any transaction: the 64-byte classical signature, the 4,627-byte ML-DSA-87 signature and the `pqc_hybrid_verify` verdict from the chain.

Why it matters: a classical signature alone is expected to be breakable by a future quantum computer. A hybrid signature stays safe as long as one of the two halves holds. See [Quantum-Safe Transactions](/sdk/guides/quantum-safe).

## Step by step {#run}

You work in your own terminal. You use a throwaway testnet account only. Testnet QOR has no value. Never use a real wallet or real funds here.

:::note Windows
qday-pay uses Linux and macOS file permissions for its key file, so on Windows you run it inside **WSL** (Windows Subsystem for Linux). WSL gives you a Linux terminal inside Windows. Everything below then follows the Linux instructions.
:::

### 1. Before you start: install the tools {#install}

You need three tools: **Git** (downloads the code), **Rust** (builds the program) and a **C compiler** (Rust needs one to link the program). Java, Node.js and Python are not needed for this app.

**macOS**

| Tool | How to install | Check it |
| --- | --- | --- |
| C compiler and Git | `xcode-select --install` (a window opens, click Install) | `git --version` |
| Rust | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (press Enter to accept the default), then close and reopen the terminal | `rustc --version` and `cargo --version` |

**Linux (Debian or Ubuntu; other distributions use their own package manager)**

| Tool | How to install | Check it |
| --- | --- | --- |
| Git and C compiler | `sudo apt update && sudo apt install -y git build-essential curl` | `git --version` |
| Rust | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (press Enter to accept the default), then close and reopen the terminal | `rustc --version` and `cargo --version` |

**Windows (through WSL)**

1. Open PowerShell as administrator and run `wsl --install`. Restart the computer when it asks. Windows installs Ubuntu. Open the **Ubuntu** app from the Start menu.
2. In the Ubuntu terminal, follow the **Linux** table above.
3. Git for Windows (https://git-scm.com/download/win) is not needed, because Git comes with the Linux command above.

Rust 1.74 or later is required. The command `rustup` installs the latest version, which is fine. The version check should print something like `rustc 1.80.0`, or a higher number.

**What you should see:** `git --version`, `rustc --version` and `cargo --version` each print a version number. If a command says `command not found`, close the terminal, open a new one and try again.

### 2. Before you start: get a testnet wallet and the faucet {#wallet}

This app creates its own testnet account (step 5), so you do not need to install a wallet to run it. You only need a way to receive free testnet QOR. The faucet is a website that sends free testnet QOR to an address.

If you also want to look at your account in the QoreX wallet, use **QoreX on testnet** with a throwaway account:

- **QoreX app:** open Settings and turn on **Use testnet (developers)**.
- **QoreX browser extension:** unlock it, tap the version number at the bottom 7 times, then choose **Switch to testnet (diana)**.

You need no Ethereum account for this app. It uses the QoreChain Native account type (a `qor1...` address).

**Faucet:** https://dashboard.qorechain.io/faucet. Sign in, paste your address and request. The faucet pays **100 QOR per 24 hours per account**.

**Good to know:** the very first transaction of a new account registers its post-quantum ML-DSA-87 key on chain. This is a one-time fee of about 0.09 QOR. qday-pay does this in step 7.

**Amounts:** the unit you read is **QOR**. The chain counts in **uqor**, the smallest unit. 1 QOR = 1,000,000 uqor. You type amounts in QOR (for example `1`) and the program converts them for you.

### 3. Get the code {#get-the-code-step}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/04-rust-qday-pay
```

**What it does**

| Part | Meaning |
| --- | --- |
| `git clone <address>` | Downloads a full copy of the example apps from GitHub into a new folder called `build-before-qday`. |
| `cd <folder>` | Moves your terminal into the Rust app's folder. All the next commands run from here. |

**What you should see:** `Cloning into 'build-before-qday'...` and then your prompt in the `04-rust-qday-pay` folder. Run `ls` to check: you see `Cargo.toml`, `Cargo.lock`, `README.md` and `src`.

### 4. Build the program {#build}

```bash
cargo build --release
```

**What it does:** `cargo` is Rust's build tool. This command downloads the libraries listed in `Cargo.toml` and compiles the program into one file.

| Part | Meaning |
| --- | --- |
| `build` | Compile the program (do not run it yet). |
| `--release` | Build the fast, optimised version. Without it you get a slower debug version in a different folder. |

**How long:** 2 to 5 minutes the first time, a few seconds after that.

**What you should see:** many `Compiling ...` lines, then `Finished release profile [optimized] target(s)`. The program is now the file `./target/release/qday-pay`.

Check that it runs:

```bash
./target/release/qday-pay
```

**What it does:** runs the program with no command. It prints its help and changes nothing.

**What you should see:**

```text
qday-pay: hybrid post-quantum payments on QoreChain testnet

  qday-pay new
  qday-pay status
  qday-pay register
  qday-pay send <qor1to> <amount_qor> [--memo text]
  qday-pay verify <tx_hash>
```

The five lines are the five commands you use below. In the rest of this page, `<command>` means `./target/release/qday-pay <command>`.

### 5. Create a throwaway testnet account {#new-account}

```bash
./target/release/qday-pay new
```

**What it does:** creates a brand new testnet account. It generates a secret recovery phrase (the mnemonic) and saves it in a **key file**. From that one phrase it derives both of your keys, the classical secp256k1 key and the post-quantum ML-DSA-87 key. The phrase is never printed on screen.

| Part | Meaning |
| --- | --- |
| `new` | The command: create an account and a key file. It refuses to overwrite a key file that already exists, so it cannot destroy a funded account by mistake. |

**Where the key file is:** `~/.config/qday/rust.env`. The `~` is your home folder. The file is readable only by you (mode 0600). You can use another place by setting `QDAY_KEY_FILE`, for example `QDAY_KEY_FILE=$HOME/my-test-key.env ./target/release/qday-pay new`. If you do, set the same variable in front of every later command.

:::warning Keep the key file private
The key file is the key to the account. Never share it, never paste it into a chat or a screenshot, and never commit it to Git. Use this account for the workshop only and never on mainnet. When you finish, delete the file.
:::

**What you should see:**

```text
  New testnet account (mnemonic saved, not shown)

  address      qor1...
  key file     /home/you/.config/qday/rust.env (0600)

  Next: fund it with testnet QOR, then `qday-pay status`.
```

Copy the `qor1...` address.

### 6. Fund the account from the faucet {#faucet}

1. Open https://dashboard.qorechain.io/faucet and sign in.
2. Paste your `qor1...` address and request. You receive 100 QOR.
3. Wait about 10 seconds for the block that holds the payment.

The account must exist on chain before you can register a key, and the faucet payment is what creates it.

### 7. Check the account {#status}

```bash
./target/release/qday-pay status
```

**What it does:** reads your account from the testnet and prints a summary. It sends nothing.

**What you should see:**

```text
  network      qorechain-diana (testnet)
  address      qor1...
  balance      100 QOR
  ML-DSA-87    NOT registered (run `qday-pay register`)
  block        123456
```

| Line | Meaning |
| --- | --- |
| `network` | The chain the program talks to. It works on the testnet `qorechain-diana` only and refuses any other network. |
| `balance` | Your spendable QOR. |
| `ML-DSA-87` | Whether your post-quantum key is registered on chain. |
| `block` | The latest block height. It keeps rising. |

### 8. Register the post-quantum key {#register}

```bash
./target/release/qday-pay register
```

**What it does:** sends one transaction that tells the chain your ML-DSA-87 public key, together with a **proof of possession** (a proof that you really hold the matching secret key). The chain stores the key, and from now on it can check your post-quantum signatures. It costs a one-time fee of about 0.09 QOR. You can run it again safely: if the key is already registered, it does nothing.

| Part | Meaning |
| --- | --- |
| `register` | The command: register your ML-DSA-87 key once. |

**What you should see:**

```text
  ML-DSA-87    registered (MsgRegisterPQCKeyV2 + proof of possession)
  tx           <64-character transaction hash>
  block        123460
  gas          ... used / ... wanted
  address      qor1...
```

### 9. Send a hybrid-signed payment {#send}

Replace `qor1...` with a testnet address. You can pay your own address, or a friend's testnet address.

```bash
./target/release/qday-pay send qor1... 1 --memo "Build Before Q-Day Workshop 1 (Rust)"
```

**What it does:** builds a payment, signs it twice (secp256k1 and ML-DSA-87), checks the gas cost, sends it, waits until it is in a block and then runs the verification of step 10 for you.

| Part | Meaning |
| --- | --- |
| `send` | The command: pay QOR to another address. |
| `qor1...` (first value) | The receiver. It must be a `qor1` address, or the program stops with `not a qor1 address`. |
| `1` (second value) | The amount in QOR. `1` means 1 QOR, which is 1,000,000 uqor. You can use decimals such as `0.5`. |
| `--memo "text"` | Optional. A memo is a short text attached to the transaction and stored on chain. Put it in quotes when it has spaces. Anyone can read it, so write nothing private. |

The option `--memo` comes after the receiver and the amount, as in the example.

**What you should see:**

```text
  sending      1 QOR -> qor1...
  fee          ... uqor (gas ...)
  included     block 123465

  tx           <64-character transaction hash>
  block        123465
  memo         Build Before Q-Day Workshop 1 (Rust)
  classical    secp256k1   64 bytes
  quantum      ML-DSA-87   4627 bytes

  VERIFIED: secp256k1 + ML-DSA-87
```

The `fee` is shown in uqor and is far below 1 QOR. The program also prints an `explorer` link and a `chain says` line (step 10). Copy the transaction hash.

### 10. Verify any transaction {#verify}

```bash
./target/release/qday-pay verify <TX_HASH>
```

**What it does:** reads the transaction from the chain and checks three things, without sending anything.

| Part | Meaning |
| --- | --- |
| `verify` | The command: print the verification report. |
| `<TX_HASH>` | The 64-character hash of the transaction. Paste the hash from step 9. It works for any testnet transaction. |

The checks:

1. The transaction succeeded (result code 0).
2. The chain emitted the event `pqc_hybrid_verify` with `status=verified`. That is the chain saying it checked the post-quantum signature.
3. The transaction carries a `PQCHybridSignature` extension with a 4,627-byte ML-DSA-87 signature, next to the 64-byte secp256k1 signature.

**What you should see:** the same report as in step 9, ending with `VERIFIED: secp256k1 + ML-DSA-87`. If a check fails, the report says `NOT VERIFIED as hybrid` and the program exits with code 2.

### 11. Verify it a second way, without our program {#verify-curl}

You can ask the chain directly. This needs only `curl`, which macOS and most Linux systems include. The tool `jq` (optional) makes the answer easier to read. Install it with `brew install jq` on macOS or `sudo apt install -y jq` on Linux.

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.code, .tx.body.extension_options[0]["@type"], (.tx.body.extension_options[0].pqc_signature | length)'
```

| Part | Meaning |
| --- | --- |
| `curl -s <address>` | Downloads the answer from the testnet REST service. `-s` hides the progress bar. |
| `<HASH>` | Your transaction hash. |
| `\| jq '...'` | Picks out three values. Without `jq`, drop this part and read the full text. |

**What you should see:**

- `"code": 0` in the answer (the transaction succeeded). In the `jq` output the first line is `0`.
- A `PQCHybridSignature` extension (type `/qorechain.pqc.v1.PQCHybridSignature`) holding the ML-DSA-87 signature. The base64 text length is 6,172 characters, which is 4,627 bytes.
- In `tx_response.events`, an event of type `pqc_hybrid_verify` with the attribute `status` set to `verified`.

**In the explorer:** open https://explore.qore.network, switch it to **Testnet**, and search for your transaction hash. The program also prints a direct link.

### 12. Clean up {#cleanup}

When you are done, delete the throwaway key file:

```bash
rm ~/.config/qday/rust.env
```

`rm` deletes a file. Only run it for a testnet key you no longer need.

## Troubleshooting {#troubleshooting}

| What you see | Why | What to do |
| --- | --- | --- |
| `command not found: cargo` or `rustc` | Rust is not installed, or the terminal was opened before the install. | Install Rust (step 1), then close and reopen the terminal. |
| `linker 'cc' not found` or `linking with cc failed` | There is no C compiler. | macOS: `xcode-select --install`. Ubuntu: `sudo apt install -y build-essential`. |
| `cannot read ... run qday-pay new first` | No key file at that place. | Run `./target/release/qday-pay new`, or set the same `QDAY_KEY_FILE` as before. |
| `cannot create ... it may already exist` | A key file exists. The program never overwrites one. | Keep using it, or delete it with `rm` if it holds nothing you need, then run `new` again. |
| `account qor1... not found on chain yet; fund it first` | The account has no QOR yet, so it does not exist on chain. | Request QOR from the faucet (step 6), wait about 10 seconds, try again. |
| Faucet says you hit a rate limit | The faucet gives one request per 24 hours per account. | Wait 24 hours, or use a second throwaway account. |
| `account has no PQC key and classical fallback is disabled` | You sent a payment before registering the post-quantum key. | Run `./target/release/qday-pay register`, then send again. |
| `not a qor1 address` | The receiver is wrong, for example a `0x...` address. | Use a `qor1...` address. |
| `transport error` or `error sending request` | No internet, or the testnet is briefly unreachable. | Check your connection and try again in a minute. |
| `NOT VERIFIED as hybrid` | The transaction failed or was not a hybrid-signed one. | Read the `code` in the report. Send a new payment with this program. |
| `pnpm: command not found` | You tried a JavaScript app. This Rust app needs no pnpm. | Ignore it here. For the JavaScript apps, run `npm install -g pnpm`. |
| `EVM authorisation window exhausted` | This belongs to the Hardhat app, not this one. | In that app, open a new window with `pnpm window open`. |
| CORS errors | This belongs to browser apps. This command line app has none. | In a browser app, use the template's `/lcd` proxy. |

## The account {#account}

The account is a QoreChain Native secp256k1 account (coin type 118, path `m/44'/118'/0'/0/0`, a `qor1...` address). The ML-DSA-87 key comes from the same recovery phrase through the SDK's canonical address-bound rule (`authenticator::try_derive_pqc_canonical`). One recovery phrase restores both keys.

## The SDK code that matters {#code}

This is the core of the `send` command in `src/main.rs`:

```rust
let send = bank_send_any(w.address(), to, vec![coin(&uqor)]);           // MsgSend
let draft = build_hybrid_tx(params.clone())?;                           // secp256k1 + ML-DSA-87
params.fee = estimate_fee(rest, &draft.tx_raw_bytes, 1.3, "0.15uqor").await?; // simulate, gas x 1.3
let tx = build_hybrid_tx(params)?;                                      // sign for real
let res = broadcast_and_wait(rest, &tx.tx_raw_bytes, WaitOptions::default()).await?;
```

Registration is one call: `PqcDx::ensure_pqc_registered()`. It sends `MsgRegisterPQCKeyV2` with a proof of possession only when no key is registered yet.

## How "verified" is decided {#verified}

`verify` reads `GET /cosmos/tx/v1beta1/txs/{hash}` and checks:

- the transaction succeeded (`code 0`);
- the chain emitted `pqc_hybrid_verify` with `status=verified` for the signer;
- the body carries a `/qorechain.pqc.v1.PQCHybridSignature` extension with a 4,627-byte ML-DSA-87 signature (next to the 64-byte secp256k1 signature).

## What you should see {#output}

- `new` prints a `qor1...` address and the key file place, never the recovery phrase.
- `status` shows the balance and whether the ML-DSA-87 key is registered.
- `send` ends with `VERIFIED: secp256k1 + ML-DSA-87` and an explorer link.
- On https://explore.qore.network (switched to Testnet) the transaction shows up under its hash.

## Network endpoints {#access}

| | |
| --- | --- |
| Cosmos chain id | `qorechain-diana` (testnet only) |
| REST | `https://api-testnet.qore.host` |
| Faucet | https://dashboard.qorechain.io/faucet |
| Explorer | https://explore.qore.network (switch to Testnet) |

## Packages used {#packages}

| Crate | Version | Used for |
| --- | --- | --- |
| `qorechain-sdk` | 0.13 | Accounts, hybrid signing, REST client, verification helpers |
| `tokio` | 1 | Async runtime |
| `serde_json` | 1 | Reading the chain's JSON answers |
| `base64` | 0.22 | Measuring signature sizes |
| `cosmrs` | 0.22 | The `Coin` message type |

## Source code {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/04-rust-qday-pay
