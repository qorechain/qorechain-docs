---
slug: /build-before-qday/workshop-3
title: "Workshop 3: Encrypted apps and cross-VM"
sidebar_label: "Workshop 3"
sidebar_position: 4
date: 2026-11-20
---

# Workshop 3: Encrypted apps and cross-VM

Workshop 2 protected money with a post-quantum key. Workshop 3 does two new things with the same chain. First, you **encrypt a message to a QoreChain address** so that only the owner of that address can read it, with post-quantum encryption. Second, one transaction on the **EVM** writes into a contract on **QoreChain Native**, and both sides change together or not at all.

You do not need to be a cryptographer. Every command below says what it does and what you should see. The two example apps are public: [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), folder `workshop-3`. Both run on the QoreChain testnet `qorechain-diana` only. Test QOR has no value.

**How long this takes:** about 30 minutes for QoreSeal, 40 for the cross-VM checkout. The two parts are independent, and each needs its own test accounts.

## What we build {#what-we-built}

| Part | App | What it shows |
| --- | --- | --- |
| 1 | **QoreSeal** (Node.js) | Encrypt a message to a `qor1...` address with ML-KEM-1024, open it, see that an outsider cannot, see that tampering is caught, and rotate a key without losing old mail. |
| 2 | **CrossVmCheckout** (Solidity and Rust) | One call from an EVM contract writes a receipt into a Native contract in the same transaction. If either side fails, both sides are undone. |

The innovations behind them:

- **Encryption to an address.** Every account can publish a post-quantum encryption key on chain, like a public phone book. To write to someone you need only their address.
- **A card that binds the key to the account.** The account signs a small recipient card with both of its signing keys, so nobody can slip a fake encryption key in between.
- **Hybrid encryption.** ML-KEM-1024 (NIST FIPS 203) is combined with the classical X25519 key. The message stays private as long as either one holds.
- **Cross-VM atomicity.** The EVM and QoreChain Native share one state and one block. A call across them is part of the same transaction, so there is no half-finished state to clean up.
- **Governance-approved reach.** The bridge only calls Native contracts that governance has approved, and each approval is pinned to the contract's code.

## Words used in this guide {#words}

| Word | Plain meaning |
| --- | --- |
| ML-KEM-1024 | A post-quantum key exchange (NIST FIPS 203). Used here to agree on a secret key for each message |
| X25519 | A classical key exchange, combined with ML-KEM so the envelope holds if either is broken |
| ML-DSA-87 | The post-quantum signature (NIST FIPS 204). Every native transaction is signed with it and with the classical secp256k1 key |
| Recipient card | A small signed note that ties an account's encryption keys to the account |
| Envelope | The sealed message, saved as a text file you can send any way you like |
| Native | QoreChain Native, the CosmWasm lane where contracts are written in Rust |
| Bridge precompile | A built-in contract at `0x0000000000000000000000000000000000000901` that lets an EVM contract call a Native contract |
| Allowlist | The Native contracts that governance has approved for the bridge to reach |
| EVM window | A short, limited permission to send Ethereum-style transactions from an account. Opening it needs a transaction signed with both keys |

:::caution Throwaway testnet accounts only
Use keys made for this workshop, holding test QOR with no value. Never put the secret words or key of an account that holds real money into a file or a command.
:::

## Before you start {#prerequisites}

You need the tools from [Before you start](/build-before-qday/prerequisites) (a terminal, Node.js and Git), and a browser for the faucet. Part 1 needs Node.js 20 or newer. Part 2 also needs **pnpm** and **Foundry**, and optionally Rust. Check Node.js:

```bash
node -v
```

It should print `v20` or higher. For Part 2 install the rest:

```bash
npm install -g pnpm
```

Installs pnpm, the package tool Part 2 uses. Check it with `pnpm -v`. Foundry compiles, tests and deploys Solidity: install it from [getfoundry.sh](https://getfoundry.sh), then run `foundryup`. Check with `forge --version` and `cast --version`.

Get the example code:

```bash
git clone https://github.com/qorechain/build-before-qday.git
cd build-before-qday/workshop-3
```

The first line downloads the examples into a folder named `build-before-qday`. The second moves into the `workshop-3` folder, which holds the two apps.

Test QOR comes from the [faucet](/dashboard/faucet) on the dashboard.

## Part 1: QoreSeal, encrypt to an address {#part-1}

Code: [workshop-3/01-qoreseal](https://github.com/qorechain/build-before-qday/tree/main/workshop-3/01-qoreseal). Packages: `@qorechain/qoreseal` and `@qorechain/qoresign`.

You want to send a private message to someone, and all you know is their address. This app shows how:

1. Alice registers her keys on chain.
2. Anyone looks up Alice's encryption key by her address.
3. A message is sealed to Alice. Alice opens it. **Eve cannot.**
4. Change one bit of the envelope and it **no longer opens**.
5. One message sealed to Alice **and** Bob: each opens it with their own key.
6. Alice **rotates** her key: the old card is refused, new messages use the new key, and old messages still open.

The encryption happens on your computer. The chain never sees the message, only the public key.

```bash
cd 01-qoreseal
```

Moves into the QoreSeal folder.

### Step 1: install {#seal-install}

```bash
npm install
```

Downloads the exact package versions in `package-lock.json`: QoreSeal, QoreSign (the hybrid signer) and a few cosmjs helpers that build the transaction.

```bash
node seal.mjs help
```

Lists every command.

### Step 2: create three testnet accounts {#seal-accounts}

```bash
node seal.mjs init alice
node seal.mjs init bob
node seal.mjs init eve
```

Each command makes a new account and saves its secret words in `~/.config/qday-w3/<name>.json`, readable only by you. Nothing secret is printed. Set `QDAY_DIR` to keep the files somewhere else. Each command prints the account's `qor1...` address.

### Step 3: fund Alice {#seal-fund-alice}

Paste Alice's `qor1...` address into the [faucet](/dashboard/faucet), then check:

```bash
node seal.mjs whoami
```

Shows each account: address, balance, and whether its keys are on chain yet. For now the answer is `no`.

### Step 4: Alice registers her keys {#seal-register}

```bash
node seal.mjs register alice
```

Two transactions:

1. **The ML-DSA-87 signing key**, with a proof that Alice owns it. This is the only transaction the chain accepts signed with the classical key alone, because it does not know her post-quantum key yet.
2. **The ML-KEM-1024 encryption key** (1,568 bytes), signed with both keys. From now on anyone can read it from the chain.

Then it signs Alice's **recipient card** and saves it as `cards/alice.json`. In a real app you would publish the card next to the address, for example on a profile page, in a contract or behind an API.

### Step 5: share QOR with Bob and Eve, and register Bob {#seal-bob}

```bash
node seal.mjs fund alice bob 3
node seal.mjs fund alice eve 3
```

Sends 3 test QOR from Alice to Bob and to Eve. Like every transaction after registration, it is signed with **both** keys, and the chain checks both. That is why Alice registers first: an account with no ML-DSA-87 key on chain can only register one, and any other transaction from it is refused.

```bash
node seal.mjs register bob
```

Bob is needed for Step 9, where one message goes to two people. Eve stays unregistered: she is the outsider who will try to read Alice's mail.

### Step 6: look Alice up, like a sender would {#seal-lookup}

```bash
node seal.mjs lookup alice
```

Reads `GET /qorechain/pqc/v1/kem/<address>` from the public REST API: the algorithm (`ML-KEM-1024`), the 1,568-byte public key and the block it was registered at. Then it checks the card against that key and against Alice's ML-DSA-87 key on chain. You should see `card valid`. You can do this for any address: `node seal.mjs lookup qor1...`.

### Step 7: seal a message to Alice, and open it {#seal-send}

```bash
node seal.mjs send alice "Payroll for March: 12,400 QOR to the team"
```

Reads Alice's key from the chain, checks her card and seals the message. A 41 character message becomes about 1,760 bytes, mostly post-quantum key material. The envelope is saved in `inbox/`.

```bash
node seal.mjs open alice
```

Shows `OPENED by alice with encryption key #0` and the message.

```bash
node seal.mjs open eve
```

Shows `CANNOT OPEN: eve holds none of the keys this envelope was sealed to`. Eve has the file, but not Alice's key.

### Step 8: tamper with it {#seal-tamper}

```bash
node seal.mjs tamper alice
```

Flips one bit of the envelope and tries to open it. You should see `REFUSED` with `DECRYPTION_FAILED`. The envelope is authenticated, so any change is caught and nobody can edit a sealed message.

### Step 9: one message, two recipients {#seal-multi}

```bash
node seal.mjs send alice,bob "Board memo: Q4 budget"
node seal.mjs open bob
node seal.mjs open alice
```

One envelope, sealed to both addresses. Each opens it with their own key. Eve still cannot.

### Step 10: rotate Alice's key {#seal-rotate}

```bash
node seal.mjs rotate alice
```

Derives Alice's **next** encryption key (number 1) from the same secret words and registers it on chain, where it **replaces** the old one. Then it checks the **old** card against the chain and you should see `refused: the card names a different ML-KEM-1024 key than the registered one`. Senders who check the card can no longer seal to the old key. A new card is signed.

```bash
node seal.mjs open alice inbox/$(ls inbox | head -1)
```

Opens the **first** envelope, sealed before the rotation: `OPENED by alice with encryption key #0 (an older key)`. The old key was never stored. It is derived again from the secret words, so rotating never locks you out of old mail.

```bash
node seal.mjs inspect
```

Shows what is inside an envelope without the secret: version, purpose, recipients and sizes.

### How the code works {#seal-code}

Everything is in `seal.mjs`. The QoreSeal calls that matter:

| Call | What it does |
| --- | --- |
| `deriveSealKeys({ mnemonic, index })` | The encryption keys of key number `index`, derived from the secret words |
| `buildRegisterKemKeyMessage({ sender, mlkemPublicKey })` | The `MsgRegisterKEMKey` message that puts the key on chain |
| `signRecipientCard({ chainId, address, keys, classicalKey, pqKey })` | The card, signed with both of the account's signing keys |
| `verifyRecipientCard({ card, chainId, address, mlkemPublicKey, pqPublicKey })` | Throws unless the card matches the keys on chain |
| `sealToAddresses({ rest, chainId, purpose, recipients, plaintext })` | Reads each key from the chain, checks each card, seals |
| `open({ chainId, purpose, envelope, keys })` | Opens the envelope, or throws |
| `envelopeToText` and `envelopeFromText` | The envelope as a text file and back |

`purpose` (here `qday-note`) is part of what is sealed: an envelope made for one app cannot be opened as if it came from another.

### If something goes wrong (QoreSeal) {#seal-trouble}

| You see | What to do |
| --- | --- |
| `does not exist on chain yet: fund ... first` | The account has no QOR: use the faucet or `fund` |
| `no ML-KEM key registered for this address` | Run `register` for that account first |
| `hybrid mode needs the recipient card` | The `cards/<name>.json` file is missing: run `register <name>`, it writes the card again |
| `no envelope yet` | Run `send` first |
| `account has no PQC key and classical fallback is disabled` | That account has not registered yet: run `register <name>` before `fund` from it |
| `refused: ...` on a transaction | Read the message: usually not enough QOR, or the public testnet API is rate limiting you. Wait a few seconds |

The files in `~/.config/qday-w3/` hold secret words. Never commit or share them, and never reuse them on mainnet. The `cards/` and `inbox/` folders are local and listed in `.gitignore`.

## Part 2: CrossVmCheckout, one transaction across two VMs {#part-2}

Code: [workshop-3/02-cross-vm](https://github.com/qorechain/build-before-qday/tree/main/workshop-3/02-cross-vm). Languages: Solidity and TypeScript for the EVM side, Rust for the Native side.

QoreChain runs more than one virtual machine on the same chain: the **EVM** (Solidity, MetaMask style) and **QoreChain Native** (CosmWasm contracts in Rust). They share one state and one block. This app is a tiny shop:

- **`CrossVmCheckout`** (Solidity, EVM) counts orders.
- **`qday-receipts`** (Rust, Native) keeps a receipt book.
- One call to `checkout("coffee for the team")` does both **in the same transaction**: the order count goes up on the EVM side and a receipt is written on the Native side.

The point is **atomicity**: both sides change together or neither does.

| Command | What happens | Result |
| --- | --- | --- |
| `checkout` | Order +1 on EVM, receipt +1 on Native | Both change |
| `undo` | The Native receipt is written, **then** the EVM side reverts | Neither changes: the receipt is undone too |
| `native-fails` | The order is counted, **then** the Native contract refuses | Neither changes: the order is undone too |
| `outside` | Ask the bridge to call a Native contract governance has not approved | Refused by the chain |

On mainnet, cross-VM calls are paused for now, so this part runs on the testnet only.

### The bridge and the allowlist {#bridge}

The EVM reaches Native through the bridge precompile at `0x0000000000000000000000000000000000000901`. You call:

```solidity
executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)
```

| Argument | Meaning |
| --- | --- |
| `targetVM` | `1` for Native |
| `targetContract` | The `qor1...` address of the Native contract |
| `payload` | The Native contract's JSON message |

The bridge only reaches Native contracts that **governance** has approved. The list is public, in the crossvm parameters (`GET https://api-testnet.qore.host/qorechain/crossvm/v1/params`), and each entry is pinned to the contract's code, so an approved contract cannot be swapped for different code later.

The Native contract you will call, `qday-receipts`, is on the testnet allowlist (governance proposal 40, code id 865):

```text
qor1xjayq5ev55tkzpml9klxwyshr7gdrha0nurha9jhm0f0gdckksgs3gltw8
```

It has no admin, so nobody can change it. **Any builder can call it from their own contracts for the Cross-VM track.** On the Native side, the sender of the call is your EVM contract's own `qor1...` account, not your wallet, so every receipt shows which contract wrote it.

### How the EVM contract works {#xvm-how}

Open `evm/src/CrossVmCheckout.sol`:

```solidity
function checkout(string calldata note, bool failAfter) external returns (bytes memory reply) {
    _checkNote(bytes(note));
    orders += 1;
    reply = _callNative(bytes(string.concat('{"record":{"note":"', note, '"}}')));
    if (failAfter) revert EvmSideFailed();
    emit Ordered(orders, msg.sender, note, reply);
}

function _callNative(bytes memory payload) private returns (bytes memory) {
    (bool ok, bytes memory ret) =
        BRIDGE.call(abi.encodeWithSignature("executeCrossVMCall(uint8,string,bytes)", NATIVE, receipts, payload));
    if (!ok) revert BridgeCallFailed(ret);
    if (ret.length == 0) revert BridgeNotActive();
    if (ret.length >= 64 && uint256(bytes32(ret)) == 32) return abi.decode(ret, (bytes));
    return ret;
}
```

1. **Check the note.** It goes inside a JSON string, so it must be 1 to 140 printable characters with no `"` and no `\`. Otherwise a crafted note could change the message the Native contract receives.
2. **Count the order.** A normal EVM state change.
3. **Call the bridge.** The Native contract runs right there, inside this transaction.
4. **If the bridge call failed, revert.** A Native failure becomes an EVM revert, and the whole transaction is undone.
5. **No reply means no bridge.** On a chain where the precompile is not active, a call to that address "succeeds" with empty data. Treat that as an error, never as success.
6. **Decode the reply.** The bridge returns the Native reply as ABI-encoded `bytes`. The code also accepts raw bytes.
7. **`failAfter`** reverts after the Native call succeeded. It shows that the receipt written on the Native side is undone as well.

Use a normal `call`, not a `staticcall` or a view function: the bridge refuses static calls, because the Native side may write state.

All commands below run in the `evm` folder unless said otherwise:

```bash
cd ../02-cross-vm/evm
```

If you are still in `01-qoreseal`, this moves to the cross-VM app's EVM folder.

### Step 1: run the tests (no account needed) {#xvm-tests}

```bash
pnpm install
pnpm forge-std
forge test
```

`pnpm install` downloads the JavaScript packages. `pnpm forge-std` downloads Foundry's standard library into `lib/`, once. `forge test` runs the 5 tests in `test/CrossVmCheckout.t.sol`. You should see `5 passed; 0 failed`.

Foundry's local EVM has no QoreChain bridge, so the tests put a small fake bridge at `0x...0901` with `vm.etch`. They check the exact JSON message sent, that `failAfter` reverts everything, that a Native failure reverts the EVM side, that a note cannot inject JSON, and that an inactive bridge is an error. The real bridge runs in the next steps.

### Step 2: an account with a post-quantum key {#xvm-account}

If you did Workshop 2, copy your `.env` from there (same account, key already registered) and add the `RECEIPTS_CONTRACT` line from `.env.example`. Otherwise:

```bash
cast wallet new
cp .env.example .env
```

`cast wallet new` makes a throwaway account. Put its private key in `.env` as `PRIVATE_KEY`. **Testnet only.**

```bash
pnpm window recovery-code
```

Prints a `QRC1-...` code. Put it in `.env` as `QORE_PQC_RECOVERY_CODE` and keep a copy apart from the private key. Your ML-DSA-87 key is derived from it.

```bash
pnpm window status
```

Shows your `qor1...` address. Paste it into the [faucet](/dashboard/faucet), then:

```bash
pnpm window register
```

Puts your ML-DSA-87 key on chain, once per account. `pnpm window status` now shows `PQC key: registered`.

### Step 3: open a scoped EVM window {#xvm-window}

```bash
pnpm window:scoped
```

Opens a window of **1,200 blocks (about 28 minutes), 6 transactions and 3 QOR** of value plus fees. That is enough for the deploy and the three demo transactions, nothing more. Your wallet calls **your own contract**, and the contract then calls the bridge with its own identity, so the window only needs to admit the call to your contract.

**Wait about 10 seconds** before the next step, so the window transaction is in a block.

### Step 4: deploy the shop {#xvm-deploy}

```bash
pnpm deploy:testnet
```

Deploys `CrossVmCheckout` pointing at `RECEIPTS_CONTRACT`. Look for `CrossVmCheckout 0x...`. In Foundry's output, "ETH" means QOR.

```bash
pnpm xvm status
```

Shows both sides: `orders` on your EVM contract and the receipts count on `qday-receipts`, with the latest three receipts. Other builders write into the same receipt book, so its count is probably not zero. What matters is how it **changes**.

### Step 5: a contract the chain has not approved {#xvm-outside}

```bash
pnpm xvm outside
```

Simulates a direct bridge call to a real Native contract that is **not** on the allowlist. You should see `REFUSED by the bridge: ... is not allowlisted`. This is free and uses no window transaction.

### Step 6: one transaction, two VMs {#xvm-checkout}

```bash
pnpm xvm checkout "coffee for the team"
```

You see `before`, the transaction (`SUCCESS`), and `after`: orders +1 **and** receipts +1, plus the new receipt with your note, sent `from` your contract's `qor1...` address. Then `both sides changed, in the same transaction`.

### Step 7: the EVM side fails after the Native call {#xvm-undo}

```bash
pnpm xvm undo "this receipt must disappear"
```

The Native receipt is written, then the EVM side reverts. The transaction is mined as `REVERTED`, and `before` and `after` are identical: `nothing changed on either side`. The receipt that was written on the Native side is gone too.

### Step 8: the Native side refuses {#xvm-native-fails}

```bash
pnpm xvm native-fails
```

The order is counted on the EVM side, then `qday-receipts` refuses with `{"fail":{}}`. The transaction is `REVERTED` and the numbers are identical: the EVM order is undone too.

Each transaction has an explorer link. Open it on the [Dashboard explorer](/dashboard/explorer) with the network selector on **Testnet**.

### If something goes wrong (cross-VM) {#xvm-trouble}

| You see | What it means | What to do |
| --- | --- | --- |
| `Missing or invalid parameters` on deploy or a transaction | No live EVM window | `pnpm window status`, then `pnpm window:scoped`, wait 10 seconds, try again |
| `No shop yet` | Nothing deployed from this folder | Step 4, or set `SHOP_ADDRESS` in `.env` |
| `BridgeCallFailed` with `not allowlisted` | The target is not approved by governance | Use `qday-receipts`, the address above |
| `BridgeNotActive` | The bridge precompile is not active on that network | Use the testnet |
| `BadNote` | The note is empty, too long, or has `"` or `\` | Use plain text up to 140 characters |

### The Native side {#native-side}

The folder `native/` holds the full source of `qday-receipts` (CosmWasm 2, Rust):

| Message | What it does |
| --- | --- |
| `{"record":{"note":"..."}}` | Adds a receipt: id, sender, note, block height |
| `{"fail":{}}` | Always refuses, to show atomicity |
| `{"count":{}}` (query) | How many receipts |
| `{"receipt":{"id":1}}` (query) | One receipt |
| `{"latest":{"limit":3}}` (query) | The newest receipts, newest first, at most 20 |

Run its tests (Rust needed):

```bash
cd ../native
cargo test
```

You should see 3 tests pass. Uploading Native contracts on the testnet goes through governance, so you do not need to deploy this one: it is already live.

To check that the code on chain is this source, build it with the CosmWasm optimizer and compare checksums. The code on chain was built on an Apple Silicon Mac with the arm64 image, so use the same one: the x86 image produces a different checksum.

```bash
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/optimizer-arm64:0.16.1
cat artifacts/checksums.txt
```

The checksum should be `6ebfc32fb9a9c8a412fdb071fb2c317b780ba05f637b8a4d274001c95fb5c43c`, the same `data_hash` the chain shows for code 865:

```bash
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/code/865" | head -c 400
```

Read the receipt book from anywhere, no account needed:

```bash
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/contract/qor1xjayq5ev55tkzpml9klxwyshr7gdrha0nurha9jhm0f0gdckksgs3gltw8/smart/$(printf '{"latest":{"limit":3}}' | base64)"
```

### Files {#files}

```text
evm/src/CrossVmCheckout.sol         the shop: counts orders, writes receipts through the bridge
evm/test/CrossVmCheckout.t.sol      Foundry tests, with a fake bridge
evm/script/CrossVmCheckout.s.sol    deploy script (reads RECEIPTS_CONTRACT and PRIVATE_KEY)
evm/scripts/window.ts               pnpm window: status, register, open, recovery-code
evm/scripts/xvm.ts                  pnpm xvm: status, checkout, undo, native-fails, outside
evm/.env.example                    the settings to copy into .env
native/src/lib.rs                   qday-receipts, the Native contract
```

## Learn more {#learn-more}

- The fest, the Encrypted Apps and Cross-VM tracks and the bounties: [build.qorechain.io](https://build.qorechain.io).
- QoreSeal on npm: [@qorechain/qoreseal](https://www.npmjs.com/package/@qorechain/qoreseal).
- [EVM precompiles](/developer-guide/evm-precompiles) and the [cross-VM reference](/developer-guide/cross-vm-reference).
- [Workshop 2](/build-before-qday/workshop-2) for the EVM window and the vault.
