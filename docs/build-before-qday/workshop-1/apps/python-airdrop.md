---
slug: /build-before-qday/workshop-1/apps/python-airdrop
title: Python App, Q-Day Airdrop
sidebar_label: Python, Airdrop
sidebar_position: 6
---

# Python App: Q-Day Airdrop

The **Q-Day Airdrop** is a small Python tool that sends testnet QOR to a whole list of addresses in **one** transaction, signed with a classical secp256k1 key and a post-quantum ML-DSA-87 (FIPS 204) key. It then proves from the chain's own record that both signatures were verified. It runs on the QoreChain testnet (`qorechain-diana`, EVM chain ID 9800).

## What it shows {#what-it-shows}

- **Hybrid ML-DSA-87 + secp256k1 signing** from Python.
- **One hybrid-signed transaction verified on chain**, paying many recipients at once with a single multi-send message.
- **A verification report** built from the chain's own transaction record, not from the tool's word.

Why it matters: one signature protects a whole airdrop, and it stays protected against a future quantum computer because the ML-DSA-87 half is post-quantum. See [Quantum-Safe Transactions](/sdk/guides/quantum-safe).

## Step by step {#run}

Everything below runs in your own terminal (macOS, Linux, or Windows with WSL). You use a throwaway testnet account only. Testnet QOR has no value, and you never use a real wallet here.

### 1. Install the tools {#install}

You need Git and Python 3.10 or later (with `venv`). Check what you have:

```bash
git --version
python3 --version      # must report 3.10 or later
python3 -m venv --help # prints usage if venv is available
```

If something is missing, install it first, for example from [python.org](https://www.python.org/downloads/) or with your package manager (`brew install python` on macOS, `sudo apt install python3 python3-venv git` on Debian or Ubuntu). Open a new terminal and run the checks again.

### 2. Get the code {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/06-python-airdrop
```

### 3. Install the dependencies {#deps}

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

This installs one package, `qorechain-sdk==0.13.0`, plus what it needs. Keep the virtual environment active for the rest of the steps (run `source .venv/bin/activate` again in any new terminal). Check the tool starts:

```bash
python airdrop.py --help
```

You should see the commands `new`, `status`, `register`, `drop` and `verify`.

### 4. Create your throwaway testnet account {#key}

```bash
python airdrop.py new
```

This generates a fresh recovery phrase, writes it to the key file `~/.config/qday/python.env` (readable only by you, mode 600), and prints only the account address, which starts with `qor1...`. The phrase is never shown. Do not share this file, do not commit it, and do not reuse it on mainnet. To keep the key somewhere else, put `--key-file /path/to/file` before the command name (for example `python airdrop.py --key-file ~/my.env status`) or set `QORE_KEY_FILE`.

Copy the `qor1...` address from the output. If you lose it, `python airdrop.py status` prints it again.

### 5. Get testnet QOR from the faucet {#faucet}

1. Open https://dashboard.qorechain.io/faucet and sign in.
2. Paste your `qor1...` address and request tokens. The faucet gives 100 QOR per 24 hours.
3. Check that it arrived:

```bash
python airdrop.py status
```

The balance should show your testnet QOR, and the post-quantum key should show as not registered yet.

### 6. Register your post-quantum key {#register}

```bash
python airdrop.py register
```

This registers your ML-DSA-87 key on chain once. It is safe to run again. The registration is signed classically, because a key cannot co-sign its own registration. Every transaction after it is hybrid-signed.

### 7. Write the recipient list {#list}

Create a text file with one testnet address per line. For a first try, make a few throwaway addresses by pointing `--key-file` at new files, or use addresses of friends who also use the testnet:

```bash
python airdrop.py --key-file ~/.config/qday/r1.env new
python airdrop.py --key-file ~/.config/qday/r2.env new
```

Then put the printed addresses in `addresses.txt`:

```text
# One qor1 address per line. Blank lines and lines starting with # are ignored.
qor1...first-testnet-address
qor1...second-testnet-address
```

Blank lines, `#` comments, duplicates, the sender itself and anything that is not a valid `qor1...` account address are skipped with a warning. At most 100 recipients per transaction. The repository also has `addresses.example.txt`, a sample with placeholder lines.

### 8. Send the airdrop {#drop}

```bash
python airdrop.py drop addresses.txt 0.1 --memo "Build Before Q-Day"
```

`0.1` is the amount in QOR sent to each recipient. The tool shows a summary (recipients, amount each, total) and asks you to confirm; add `--yes` to skip the question. It then simulates the transaction to set the gas, signs it with both keys, broadcasts it as one transaction, and prints the verification report. If a broadcast fails, wait a minute and retry.

### 9. Verify any transaction {#verify}

```bash
python airdrop.py verify <TX_HASH>
```

Use the hash printed by `drop`. This prints the verification report on its own, for any transaction hash.

## What you should see {#output}

- `drop` prints the transaction hash and height, then the verification report: the signer's `pqc_hybrid_verify` status is `verified`, the ML-DSA-87 signature is 4627 bytes, the code is 0, and the number of recipients matches your list.
- On the explorer: open `https://explore.qore.network/tx/<HASH>` and switch the explorer to **Testnet**. The transaction shows as successful, with every recipient paid.

## How the proof works {#proof}

`verify` reads `GET /cosmos/tx/v1beta1/txs/{hash}` from the public testnet REST endpoint and checks:

- an event of type `pqc_hybrid_verify` for the signer with `status=verified`;
- the `/qorechain.pqc.v1.PQCHybridSignature` extension carries a 4627-byte ML-DSA-87 signature (next to the 64-byte secp256k1 one);
- the transaction succeeded (code 0), and how many recipients it paid.

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
