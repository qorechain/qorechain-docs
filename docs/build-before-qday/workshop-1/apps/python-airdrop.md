---
slug: /build-before-qday/workshop-1/apps/python-airdrop
title: Python App, Q-Day Airdrop
sidebar_label: Python, Airdrop
sidebar_position: 6
---

# Python App: Q-Day Airdrop

The **Q-Day Airdrop** is a small Python tool that sends testnet QOR to a whole list of addresses in **one** transaction. The transaction is signed with a classical secp256k1 key and a post-quantum ML-DSA-87 key (FIPS 204). The tool then proves, from the chain's own record, that both signatures were verified. It runs on the QoreChain testnet (`qorechain-diana`, EVM chain ID 9800).

**How long this takes:** about 20 minutes the first time (10 minutes of installing tools, 5 minutes of setup, 5 minutes of sending and checking).

You do not need to know Python. You only type the commands below, one by one, and compare the result with "What you should see".

## What it shows {#what-it-shows}

- **Hybrid ML-DSA-87 + secp256k1 signing** from Python.
- **One hybrid-signed transaction verified on chain**, paying many recipients at once with a single multi-send message.
- **A verification report** built from the chain's own transaction record, not from the tool's word.

Why it matters: one signature protects a whole airdrop, and it stays protected against a future quantum computer because the ML-DSA-87 half is post-quantum. See [Quantum-Safe Transactions](/sdk/guides/quantum-safe).

:::warning Testnet only
Use a throwaway testnet account only. Testnet QOR has no value. Never use your real wallet, your real recovery phrase or real funds in this tutorial.
:::

## Words you will see {#words}

| Word | Meaning |
| --- | --- |
| Testnet | A practice copy of QoreChain. Coins on it are free and worth nothing. |
| QOR and uqor | Two names for the same coin. 1 QOR = 1,000,000 uqor. The tool asks for QOR. Fees are shown in uqor. |
| Memo | A short text attached to a transaction, like a note on a bank transfer. |
| Address | Your public account number. On QoreChain it starts with `qor1`. Safe to share. |
| Key file | A file with your secret recovery phrase. Never share it. |
| Faucet | A website that gives free testnet QOR. |
| Hash | The unique ID of a transaction. You use it to look the transaction up. |

## Before you start {#before}

You need **Git** (downloads the code) and **Python 3.10 or later** with `venv` (a private folder for the tool's libraries). After each install, **close the terminal and open a new one**, then run the check command.

| Tool | macOS | Windows | Linux (Debian or Ubuntu) | Check |
| --- | --- | --- | --- | --- |
| Git | `brew install git` (Homebrew from https://brew.sh) | https://git-scm.com/download/win | `sudo apt install git` | `git --version` |
| Python 3.10+ | `brew install python` | https://www.python.org/downloads/ (tick "Add python.exe to PATH" in the installer) | `sudo apt install python3 python3-venv python3-pip` | `python3 --version` (on Windows: `python --version`) |

On Windows, use PowerShell or Git Bash. Where this page says `python3`, Windows usually uses `python`. Everything else is the same, except the line that turns the virtual environment on (step 3).

## Get a testnet wallet and free QOR {#wallet}

The tool makes its own throwaway key (step 4 below), so you do not need a wallet app for this tutorial. If you also want to see your account in QoreX:

1. **QoreX app:** open Settings, then turn on **Use testnet (developers)**.
2. **QoreX browser extension:** unlock it, tap the version number at the bottom 7 times, then choose **Switch to testnet (diana)**.

The free QOR comes from the faucet at https://dashboard.qorechain.io/faucet. You sign in, paste the address, and request. It gives **100 QOR per 24 hours per account**.

The very first transaction of a new account registers its post-quantum ML-DSA-87 key on the chain. This is a one-time step with a fee of about 0.09 QOR. The tool does it for you with the `register` command.

## Step by step {#run}

### 1. Download the code {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/06-python-airdrop
```

**What it does**

- `git clone <address>`: copies the project from GitHub into a new folder called `build-before-qday`.
- `cd <folder>`: moves your terminal into the Python app's folder. Every later command must run from this folder.

**What you should see:** lines like `Cloning into 'build-before-qday'...` and then your prompt in the new folder.

### 2. Create a private Python environment {#venv}

```bash
python3 -m venv .venv
```

**What it does:** makes a folder called `.venv` that holds this tool's libraries, so they do not mix with anything else on your computer.

| Part | Meaning |
| --- | --- |
| `python3` | The Python program. |
| `-m venv` | Run Python's built-in "virtual environment" maker. |
| `.venv` | The name of the folder to create. |

**What you should see:** nothing printed, and a new `.venv` folder.

### 3. Turn it on and install the libraries {#deps}

```bash
source .venv/bin/activate
```

On Windows PowerShell use `.venv\Scripts\activate` instead (if PowerShell blocks it, run `Set-ExecutionPolicy -Scope Process RemoteSigned` and try again). In Windows Command Prompt use `.venv\Scripts\activate.bat`.

**What it does:** switches your terminal to use the private environment.

**What you should see:** `(.venv)` at the start of your prompt. Turn it on again with this same command in every new terminal.

```bash
pip install -r requirements.txt
```

| Part | Meaning |
| --- | --- |
| `pip` | Python's library installer. |
| `install` | Download and install libraries. |
| `-r requirements.txt` | Read the list of libraries from this file. It names one library, `qorechain-sdk==0.13.0` (the QoreChain SDK, exact version 0.13.0), plus what it needs. |

**What you should see:** download lines ending in `Successfully installed ... qorechain-sdk-0.13.0`. A notice that a new pip is available is harmless.

**How long:** about 15 seconds to 1 minute.

Now check the tool starts:

```bash
python airdrop.py --help
```

**What you should see:** the commands `new`, `status`, `register`, `drop` and `verify`.

### 4. Create your throwaway testnet account {#key}

```bash
python airdrop.py new
```

**What it does:** creates a fresh account. It writes a secret recovery phrase into the key file `~/.config/qday/python.env` (in your home folder, readable only by you) and prints only the public address.

| Part | Meaning |
| --- | --- |
| `new` | Create a new key file and print its address. |
| `new --force` | Replace an existing key file. The old key is lost. |

**What you should see:** `New testnet wallet`, an `address` starting with `qor1...`, the key file path with `(mode 600, mnemonic not shown)`, and a hint for the next step.

**Copy the `qor1...` address.** If you lose it, `python airdrop.py status` prints it again. Never share the key file, never commit it to Git, and never reuse it on mainnet.

To keep the key somewhere else, put `--key-file` **before** the command name:

```bash
python airdrop.py --key-file ~/my.env status
```

`--key-file <path>` means "use this key file instead of the default one". Order matters: `--key-file` goes before `status`, `drop` and the other commands. You can also set the environment variable `QORE_KEY_FILE` instead.

### 5. Get testnet QOR from the faucet {#faucet}

1. Open https://dashboard.qorechain.io/faucet and sign in.
2. Paste your `qor1...` address and press the request button.
3. Wait a few seconds, then run:

```bash
python airdrop.py status
```

**What it does:** asks the testnet for your balance and whether your post-quantum key is registered.

**What you should see:** your balance (about 100 QOR) and a warning that the ML-DSA-87 key is not registered yet. If it says the address "is not on chain yet", the faucet payment has not arrived: wait 10 seconds and try again.

### 6. Register your post-quantum key {#register}

```bash
python airdrop.py register
```

**What it does:** records your ML-DSA-87 key on the chain, once. It is safe to run again. This first transaction is signed classically, because a key cannot co-sign its own registration. It costs about 0.09 QOR. Every transaction after it is hybrid-signed.

**What you should see:** a transaction hash and a line `registered` (or `already registered` if you ran it twice).

**How long:** a few seconds (one block).

### 7. Write the recipient list {#list}

Make two throwaway recipient accounts. Each one gets its own key file:

```bash
python airdrop.py --key-file ~/.config/qday/r1.env new
python airdrop.py --key-file ~/.config/qday/r2.env new
```

**What it does:** the same `new` as before, but `--key-file` sends each key to its own file so nothing is overwritten. (You can also use addresses of friends who use the testnet.)

**What you should see:** two different `qor1...` addresses. Copy both.

Now create a plain text file called `addresses.txt` in this folder, one address per line. Any text editor works (Notepad on Windows, TextEdit in plain-text mode on macOS, `nano addresses.txt` on Linux):

```text
# One qor1 address per line. Blank lines and lines starting with # are ignored.
qor1...first-testnet-address
qor1...second-testnet-address
```

Replace the two example lines with your real addresses. Blank lines, `#` comments, duplicates, the sender itself and anything that is not a valid `qor1...` address are skipped with a warning. At most 100 recipients per transaction. The folder also has `addresses.example.txt`, a sample with placeholder lines.

### 8. Send the airdrop {#drop}

```bash
python airdrop.py drop addresses.txt 0.1 --memo "Build Before Q-Day"
```

| Part | Meaning |
| --- | --- |
| `drop` | Send one transaction paying everyone in the list. |
| `addresses.txt` | The file with the recipients. |
| `0.1` | The amount in QOR **for each recipient** (0.1 QOR = 100,000 uqor). Two recipients get 0.2 QOR in total. |
| `--memo "..."` | A short text attached to the transaction. Optional. |
| `--yes` (or `-y`) | Optional: skip the "are you sure" question. |

Option order: the amount and the file come first, and `--memo` and `--yes` come after them. `--key-file` is different: it goes before `drop`.

**What it does:** shows a summary (recipients, amount each, total) and asks you to confirm. Type `y` and press Enter. Then it asks the chain how much gas is needed (a test run), adds 30 percent as a safety margin, signs with both keys, sends one transaction, and prints the verification report.

**What you should see:** the transaction hash and height, then a report with: code 0, the signer's `pqc_hybrid_verify` status `verified`, an ML-DSA-87 signature of 4,627 bytes, and a recipient count that matches your list. Copy the hash.

**How long:** about 10 seconds.

### 9. Verify any transaction {#verify}

```bash
python airdrop.py verify <TX_HASH>
```

**What it does:** reads the transaction from the chain and prints the verification report on its own. It works for any transaction hash, not only your own.

**What you should see:** the same report as at the end of step 8.

## Verify the transaction yourself {#check}

You do not have to trust the tool. Ask the chain directly.

**Way 1, in the browser.** Open `https://explore.qore.network/tx/<HASH>` (put your hash in place of `<HASH>`), then switch the explorer to **Testnet**. You should see a successful transaction with every recipient paid.

**Way 2, one command:**

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

| Part | Meaning |
| --- | --- |
| `curl` | A tool that downloads a web address. Built into macOS, Windows 10+ and most Linux. |
| `-s` | Silent: hide the progress bar. |
| the address | The public testnet REST API. It returns the full transaction record as JSON. |

**What you should see** in the long output (add `| jq .` if you installed jq, see https://jqlang.github.io/jq/download/):

- `"code": 0` means the transaction succeeded.
- A `PQCHybridSignature` extension holding a `pqc_signature` of **4,627 bytes** (the ML-DSA-87 signature), next to the 64-byte classical one.
- An event `pqc_hybrid_verify` with `status` set to `verified` for your address.

## How the proof works {#proof}

`verify` reads `GET /cosmos/tx/v1beta1/txs/{hash}` from the public testnet REST endpoint and checks:

- an event of type `pqc_hybrid_verify` for the signer with `status=verified`;
- the `/qorechain.pqc.v1.PQCHybridSignature` extension carries a 4,627-byte ML-DSA-87 signature;
- the transaction succeeded (code 0), and how many recipients it paid.

## Troubleshooting {#troubleshooting}

| What you see | Why | What to do |
| --- | --- | --- |
| `python3: command not found` or version below 3.10 | Python is missing or old. | Install Python 3.10 or later, open a new terminal. On Windows use `python`. |
| `No module named venv` or `ensurepip is not available` | The venv part of Python is not installed (Debian, Ubuntu). | `sudo apt install python3-venv`, then repeat step 2. |
| `ModuleNotFoundError: No module named 'qorsdk'` | The environment is not on, or the install was skipped. | Run `source .venv/bin/activate`, then `pip install -r requirements.txt`. |
| `unrecognized arguments: --key-file` | `--key-file` was put after the command. | Put it before: `python airdrop.py --key-file <path> status`. |
| `no key file at ... Run: python airdrop.py new` | You skipped step 4, or a different `--key-file` is in use. | Run `python airdrop.py new`. |
| `... already exists (use --force to replace it)` | A key file is already there. | Keep it, or run `python airdrop.py new --force` (the old key is lost). |
| `... is readable by others (mode ...)` | The key file permissions are too open. | Run `chmod 600 <path>`. |
| `... is not on chain yet (fund it first)` | No faucet QOR has arrived. | Wait 10 seconds, or request from the faucet. |
| `account has no PQC key and classical fallback is disabled` | The post-quantum key is not registered yet. | Run `python airdrop.py register` first. |
| `the ML-DSA-87 key is not registered yet` | Same reason, found by the tool before sending. | Run `python airdrop.py register`. |
| `balance too low` | Total amount plus fee is more than you hold. | Send a smaller amount, or wait for the next faucet request. |
| Faucet says rate limit | One request per 24 hours per account. | Wait, or use another throwaway account. |
| `skip line N: not a valid qor1 address` | A line in `addresses.txt` is not a proper address. | Fix or delete that line. Other lines still work. |
| `no valid recipients` | Every line was skipped. | Check `addresses.txt` has real `qor1...` addresses. |
| `bad amount` | The amount is not a plain number. | Use QOR as a number, for example `0.1`. |
| `refused by the node: code ...` | The chain refused the transaction. | Read the message. Wait a minute and retry if the testnet is busy or upgrading. |
| `transaction not found on the testnet` | Wrong hash, or the block is not final yet. | Check the hash and try again in a few seconds. |
| `the testnet may be pausing for an upgrade` | Public endpoints limit requests per IP address, or the testnet is upgrading. | Wait a minute and run it again. |
| `EVM authorisation window exhausted` | Belongs to the EVM apps, not this one. | In an EVM app, open a new window with `pnpm window open`. |
| `HHE10402` after opening the window | Hardhat apps only: the window was not active yet. | Run the deploy again. |
| `CORS` errors in a browser | Only when a web page calls the chain directly. This tool does not. | In a browser app, use the template's `/lcd` proxy. |
| `pnpm: command not found` | pnpm is not installed. Not needed here. | Only for the Hardhat tutorial: run `npm install -g pnpm`. |

## The SDK code that matters {#code}

```python
from qorsdk import (derive_native_account, derive_pqc_canonical, msg, build_hybrid_tx,
                    auto_fee, hybrid_sign_and_broadcast, wait_for_tx,
                    resolve_sign_bytes_version)

account = derive_native_account(mnemonic)                   # classical secp256k1 key
pqc = derive_pqc_canonical(account.address, mnemonic)       # ML-DSA-87 key, same mnemonic

# ONE MsgMultiSend: one input (the sender), one output per recipient.
drop = msg.bank.multi_send(
    inputs=[Input(address=sender, coins=[Coin(denom="uqor", amount=str(each * len(to)))])],
    outputs=[Output(address=a, coins=[Coin(denom="uqor", amount=str(each))]) for a in to])

build = lambda fee, v: build_hybrid_tx(account=account, pqc_keypair=pqc, messages=[drop], fee=fee,
    memo=memo, chain_id="qorechain-diana", account_number=num, sequence=seq, sign_bytes_version=v)

v = resolve_sign_bytes_version("qorechain-diana", rest_url=REST)                 # "v2" on the testnet
fee = auto_fee(REST, build({"amount": [], "gas": "0"}, v), gas_multiplier=1.3)  # simulate
res = hybrid_sign_and_broadcast(lambda v: build(fee, v), chain_id="qorechain-diana", rest_url=REST)
included = wait_for_tx(rest, res["tx_response"]["txhash"])
```

The key is registered once with `ensure_pqc_registered(...)`, which does nothing if the same key is already on chain. Gas is never fixed: the real hybrid-signed transaction is simulated first and the limit is the simulated gas times 1.3, priced at 0.15 uqor per gas.

The account is coin type 118 (`m/44'/118'/0'/0/0`). The ML-DSA-87 key is derived from the same recovery phrase and bound to the address with `derive_pqc_canonical`. If you build your own app on the seed-based helpers instead, SDK 0.13.0 needs a recovery code or an independent 32-byte PQC secret (in Python `unified_account_from_seed(seed32, recovery_code=...)`); see [SDK install](/sdk/install#whats-new-0130). Never print a recovery code.

## Packages used {#packages}

| Item | Version |
| --- | --- |
| `qorechain-sdk` (PyPI, imported as `qorsdk`) | 0.13.0 (pinned in `requirements.txt` as `qorechain-sdk==0.13.0`) |
| Python | 3.10 or later |

The tool also imports the protobuf types `Input`, `Output` (from `cosmpy.protos.cosmos.bank.v1beta1.bank_pb2`) and `Coin` (from `cosmpy.protos.cosmos.base.v1beta1.coin_pb2`); they come with the SDK. See [SDK install](/sdk/install) for the release table of all languages.

## Where to look things up {#access}

| What | Where |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (switch to Testnet) |
| Faucet | https://dashboard.qorechain.io/faucet |
| Code | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/06-python-airdrop |
