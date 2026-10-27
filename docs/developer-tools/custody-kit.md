---
slug: /developer-tools/custody-kit
title: QoreChain Custody Kit
sidebar_label: Custody Kit
sidebar_position: 32
---

# QoreChain custody kit

The QoreChain custody kit is a written integration guide, a set of test vectors and small reference code for custodians and exchanges that hold customer funds on QoreChain. It explains what the network requires on each execution lane, and it shows, in readable code, the parts of an integration that are easy to get wrong: checking an address, decoding and verifying a signed transaction before it is broadcast, and deciding which incoming transfers to credit.

It is for custodians, exchanges, payment processors and wallet back ends, and for the engineers and auditors who review those integrations. Version **0.1.0**, published on 27 October 2026, Apache-2.0. It works against mainnet (`qorechain-vladi`) and testnet (`qorechain-diana`); the live checks that ship with it run against testnet and only read.

**Read this first: the kit is example code, not a library.** You clone the repository and read, copy or vendor the folder for your language. There is no npm, PyPI, crates.io or Maven Central package of the kit, by design. The one exception in form is Go: the Go folder is a Go module with a tagged version, so `go get` can fetch it, but it is still example code without a promise of a stable API (see [What is a library and what is example code](#library-vs-example)). The signing and the cryptographic verification come from [QoreSign](/qoresign/overview), which is a published library.

## Innovations {#innovations}

- **One behaviour in five languages, proved by one file.** TypeScript, Python, Go, Rust and Java implement the same four functions with the same results and the same error codes. Every language runs against the shared test vector file `vectors/custody-v1.json`, so a team that ports the kit to another language can prove it matches.
- **Stable error codes for addresses.** `validateAddress` never throws. It returns the two spellings of the address on success, or one of eleven stable codes (`EMPTY`, `WHITESPACE`, `BAD_HEX`, `BAD_EIP55`, `NO_CHECKSUM`, `MIXED_CASE`, `BAD_BECH32`, `BAD_CHECKSUM`, `WRONG_PREFIX`, `BAD_LENGTH`, `KIND_NOT_ALLOWED`) so a withdrawal form can show the exact reason.
- **Pre-broadcast check of both signatures.** `verifyTx` checks the secp256k1 signature over the `SignDoc`, the ML-DSA-87 layer against a key you pass in, and whether the public key inside the transaction is the one you expect. It returns `{ valid, classical, signerKey, pq }` and throws only on malformed input, never on a bad signature. A second process can run it on every signed withdrawal before anything is sent.
- **Deposit decisions with a reason.** `extractDeposits` returns every incoming transfer of a transaction with a `creditable` flag and a `reason` (`evm_failed`, `fee_refund`, `unsupported_message` or `null`). It catches the case that surprises EVM integrators: a failed EVM execution still reports result code 0 at the native level.
- **A query builder that matches the node.** `buildDepositQuery` produces the exact percent-encoded REST path for incoming transfers to an address (limit 1 to 100, height bounds, ascending order), and converts `0x` input to the `qor1` form.
- **Guidance written per lane.** The guide covers the native lane, the EVM lane with its authorisation windows, and states that the SVM lane is not open for transactions, so no deposit or withdrawal flow should be built on it.

## Use cases {#use-cases}

1. **Deposit scanner for an exchange.** Keep a height cursor, call `buildDepositQuery({ address, minHeight, maxHeight })` against your own node, then `extractDeposits(txResponse, address)` to credit successful `MsgSend`, `MsgMultiSend` and EVM transfers in `uqor`. Failed EVM executions, gas refunds and other messages are excluded or flagged for review.
2. **Withdrawal pipeline with a second approver.** After the signer produces a hybrid-signed withdrawal, an independent process runs `decodeTx` (recipient, amount, fee, memo) and `verifyTx` (both signatures, expected keys) before the transaction is broadcast.
3. **Address intake.** Validate every user-supplied withdrawal address with `validateAddress`, refuse `qorvaloper` addresses as payment destinations, and optionally require EIP-55 checksums for hex input.
4. **HSM planning.** A security team uses the key management guide to choose between HSM-generated ML-DSA-87 keys and mnemonic-based canonical derivation, to check PKCS #11 v3.2 support for pure ML-DSA-87 signing with an empty context, and to design rotation and backups.
5. **EVM payout rail.** An exchange that pays out on the EVM lane registers the ML-DSA-87 key once, opens a scoped authorisation window per batch with one hybrid native-lane transaction, then signs ordinary EIP-1559 transactions with its existing secp256k1 stack.
6. **Staking for customers.** A custodian that offers staking follows the staking guide (delegate, undelegate, redelegate, rewards, staking tier locks) and decodes every staking message with `decodeTx` before signing.
7. **Port to another language, or an audit.** A team writing its own implementation runs it against `vectors/custody-v1.json` to show that it matches the reference results and error codes.
8. **Rehearsal before mainnet.** An integration team follows the testnet rehearsal (register key, hybrid send, deposit scan, staking, EVM window, key rotation) and the integration checklist.

## How it works {#how-it-works}

### What the kit contains {#contents}

| Part | What it is |
|---|---|
| `docs/` | Ten guide pages: signing per lane, addresses and derivation, deposits, withdrawals, staking, errors, key management, test environment, integration checklist, FAQ. |
| `code/ts`, `code/python`, `code/go`, `code/rust`, `code/java` | Reference code with the same four functions and a small example command line per language. |
| `vectors/custody-v1.json` | Test vectors: a good and a bad address per error code, a hybrid-signed `MsgDelegate`, a hybrid-signed `MsgOpenEVMWindow` from an eth-native account, staking and window messages, malformed transactions, deposit queries and deposit extraction cases. The QoreSign vectors are reused by reference and checked by SHA-256. |
| Live checks | Read-only checks against testnet, switched on with `QORE_LIVE_TEST=1`: staking parameters, a deposit query for a recent transfer, and verification of a committed hybrid transaction. |

### What is a library and what is example code {#library-vs-example}

| Piece | Kind | Where to get it |
|---|---|---|
| QoreSign (signing, ML-DSA-87 and secp256k1 verification, key registration message) | Published library | npm, PyPI, crates.io, Go, Maven Central. See [QoreSign](/qoresign/overview). |
| The kit's code in TypeScript, Python, Rust and Java | Example code, not published to any registry | Clone `qorechain/qorechain-custody-kit` and copy or vendor the folder. |
| The kit's code in Go (package `custodykit`) | Example code. Fetchable as a Go module at a tagged version, with no promise of a stable API | `go get github.com/qorechain/qorechain-custody-kit/code/go@v0.1.0`, or clone and vendor. |
| The guide pages, vectors and checklist | Documentation and data | The repository. |

The kit implements no signature scheme. ML-DSA-87 and secp256k1 verification come from QoreSign. The Python code contains a small Keccak-256 used for the EIP-55 checksum and nothing else.

### Lanes {#lanes}

| Lane | What a custodian signs | Status |
|---|---|---|
| Native (Cosmos SDK) | secp256k1 `SIGN_MODE_DIRECT` plus an ML-DSA-87 (FIPS 204) layer. An account with a registered key has no classical path; a keyless account can send classically only to register its key (or to unjail). | open |
| EVM | Ordinary secp256k1 Ethereum transactions (EIP-155 and EIP-1559), admitted for a sender with a registered ML-DSA-87 key and a live authorisation window, opened by a hybrid native-lane transaction: one ML-DSA-87 signature per window. | open |
| SVM | Not applicable | not open for transactions |

### Hybrid native-lane transactions {#hybrid}

- A hybrid transaction is an ordinary `TxRaw` signed twice by the same account. The ML-DSA-87 signature travels in the body as the extension option `/qorechain.pqc.v1.PQCHybridSignature` (`algorithm_id = 1`, a 4,627-byte signature, optionally the 2,592-byte public key). The secp256k1 signature is the usual `SIGN_MODE_DIRECT` signature over the final body, extension included.
- The ML-DSA-87 signature covers sign-bytes that exclude the extension. Both public networks verify sign-bytes v2 (a domain string, the chain id, then the body and auth info bytes). Hedged and deterministic FIPS 204 signatures are both accepted. The normative format is the [QoreSign hybrid signing specification](/qoresign/spec/hybrid-signing-v1).
- Order of operations: encode body and auth info (fee and gas fixed), compute the v2 sign-bytes, sign with ML-DSA-87, append the extension, sign the `SignDoc` with secp256k1, broadcast.
- Key registration: `MsgRegisterPQCKeyV2` (`key_type = "hybrid"`, with an optional and recommended proof of possession), signed classically from the keyless account, once per hot address. QoreSign builds the whole message.
- A hybrid transaction is about 4.7 KB larger than a classical one and uses more gas, so always simulate.

### Addresses {#addresses}

- `qor1...` and `0x...` are two spellings of the same 20 bytes. Funds sent to either arrive in the same balance. `qorvaloper1...` is a validator operator address and never a payment address.
- There are two account kinds: `secp256k1` (coin type 118, path `m/44'/118'/0'/0/i`) and eth-native `eth_secp256k1` (coin type 60, path `m/44'/60'/0'/0/i`). The same mnemonic gives two different accounts. Eth-native accounts let one key operate both the native lane and the EVM lane.
- The ML-DSA-87 key can come from the canonical derivation (what QoreChain wallets and the SDK register, bound to the `qor1` address and the mnemonic), from a draft hierarchical derivation, or from a random key generated in an HSM. Any valid key works once it is registered. See [key derivation](/qoresign/guides/key-derivation).

### Deposits {#deposits}

- QoreChain finalises a block when it is committed. There are no reorganisations, so a transaction in a committed block is final after one block. Extra confirmations are an operational choice.
- Native-lane deposits are found with `GET /cosmos/tx/v1beta1/txs?query=transfer.recipient='qor1...' AND tx.height>=H1 AND tx.height<=H2&order_by=ORDER_BY_ASC`. `buildDepositQuery` builds exactly this path.
- Credit rules in `extractDeposits`: a transaction with `code != 0` moved nothing; a `transfer` without `msg_index` is the fee payment; amounts are filtered by denom (`uqor` by default); `MsgSend` and `MsgMultiSend` outputs are creditable; `MsgEthereumTx` is creditable unless the EVM execution failed or the transfer is a gas refund from the fee collector; anything else comes back with `reason: "unsupported_message"` for review.

### Withdrawals and gas {#withdrawals}

- Fee = ceil(gas limit x gas price) in `uqor`. The minimum gas price is 0.1 uqor, charged on the gas limit.
- Take the gas limit from a simulation of the fully signed transaction. On nodes that have applied the v3.2.5 upgrade (testnet now, mainnet after it is applied) use `ceil(gas_used x 1.02) + 2000`, because simulation includes the ML-DSA-87 verification. Before that use `ceil((gas_used + 40000) x 1.4)`. Detect which applies with `GET /cosmos/upgrade/v1beta1/applied_plan/v3.2.5`, not by date.
- After choosing the gas limit, rebuild `AuthInfo` and sign again: both signatures cover the fee.
- Sequences: run one signer queue per hot address, or several hot addresses for parallel payouts.

### EVM authorisation windows {#evm-windows}

- A window is opened with `/qorechain.pqc.v1.MsgOpenEVMWindow` (`blocks` 1 to 17,280, `max_txs` 1 to 1,000, `max_value` in `uqor` counting value plus maximum fee, optional `native_only`, optional `allowed_targets` of up to 16 addresses) and closed with `MsgCloseEVMWindow`. State is at `GET /qorechain/pqc/v1/evm_window/{address}`.
- Opening a window replaces any existing window and advances the account's sequence, which is its EVM nonce: open the window, then read the nonce.
- `eth_call` and `eth_estimateGas` need no window.

## How to use {#how-to-use}

### Get the code {#install}

The kit is reference code: clone the repository, or vendor the folder for your language, rather than installing a package.

| Language | Get it | Depends on | Minimum platform |
|---|---|---|---|
| TypeScript | `git clone https://github.com/qorechain/qorechain-custody-kit`, then `cd code/ts && pnpm install && pnpm build` | `@qorechain/qoresign` 0.1.0 (npm) | Node.js 20 |
| Python | clone, then `cd code/python && pip install -r requirements-dev.txt`. For `verify_tx` also `pip install qorechain-qoresign==0.1.1` | nothing at runtime; `qorechain-qoresign` 0.1.1 (PyPI) for `verify_tx` | Python 3.9 |
| Go | `go get github.com/qorechain/qorechain-custody-kit/code/go@v0.1.0` (package `custodykit`), or clone | `github.com/qorechain/qoresign/go` v0.1.0 | Go 1.25 |
| Rust | clone, then `cd code/rust && cargo build` (not on crates.io) | `qorechain-qoresign` 0.1.0 (crates.io) | Rust 2021 edition |
| Java | clone, then `cd code/java && mvn test` (not on Maven Central) | `io.github.qorechain:qoresign:0.1.0` (Maven Central), Gson | Java 17 |

QoreSign is published for every language the kit uses, including Python. `verify_tx` in the Python code needs `qorechain-qoresign` 0.1.1 from PyPI (macOS and Linux). The TypeScript, Go, Rust and Java code pin QoreSign 0.1.0, which is still published next to 0.1.1.

### Quickstart {#quickstart}

Target network: testnet (`qorechain-diana`) for anything that reads the chain. The environment variable `QORE_REST` points the examples and the live checks at another REST endpoint, which in production is your own node. The addresses below come from the public BIP-39 test phrase and must never hold funds.

**1. Validate an address (Go, offline).** Run on 27 October 2026 from a clone of tag `v0.1.0`:

```bash
cd code/go
go run ./cmd/custody-kit validate 0x9858EfFD232B4033E47d90003D41EC34EcaEda94
```

It printed (exit code 0):

```json
{
  "valid": true,
  "kind": "account",
  "format": "hex",
  "checksum": "eip55",
  "bech32": "qor1npvwllfr9dqr8erajqqr6s0vxnk2ak55am9g2c",
  "hex": "0x9858EfFD232B4033E47d90003D41EC34EcaEda94"
}
```

A validator address is refused unless you allow it with `--allow-validator`:

```bash
go run ./cmd/custody-kit validate qorvaloper19rl4cm2hmr8afy4kldpxz3fka4jguq0a5ws5he
```

It printed `"valid": false` with `"error": "KIND_NOT_ALLOWED"` and the detail `a validator address is not accepted here`, and exited with code 1. The Go test suite (`go test ./...`) also passed on the same checkout.

**2. Decode and verify a signed transaction before broadcast.**

```bash
go run ./cmd/custody-kit decode <tx hex or base64>
go run ./cmd/custody-kit verify <tx> --chain-id qorechain-diana --account-number <n> \
  --pubkey <33-byte hex> --pq-pubkey <2592-byte hex>
```

Add `--eth` for an eth-native account. Read the account number from `GET /cosmos/auth/v1beta1/account_info/{address}` and the registered ML-DSA-87 key from `GET /qorechain/pqc/v1/account/{address}`.

The same in TypeScript, from the kit's example command line (`code/ts/src/cli.ts`):

```ts
import { decodeTx, fromHex, verifyTx } from "./index.js";

console.log(JSON.stringify(decodeTx(txBytes), null, 2)); // messages, memo, fee, signers, pqcLayers, txHash

const r = verifyTx({
  txBytes,
  chainId: "qorechain-diana",
  accountNumber: BigInt(accountNumber),
  classicalPublicKey: fromHex(secp256k1PubKeyHex),
  classicalKeyType: "secp256k1", // or "eth_secp256k1" for eth-native accounts
  pqPublicKey: fromHex(registeredMlDsa87KeyHex),
});
// r.valid, r.classical, r.signerKey ("match" | "absent" | "mismatch"), r.pq
```

**3. Scan deposits (reads on testnet).**

```bash
go run ./cmd/custody-kit deposits qor1... --from-height 8976000 --to-height 8976400
```

Run on 27 October 2026 for the public test address over testnet heights 8976000 to 8983000, it returned an empty list, which is expected for an address that never received anything.

TypeScript (from `code/ts/src/cli.ts`):

```ts
import { DEFAULT_TESTNET_REST, buildDepositQuery, extractDeposits, getJson } from "./index.js";

const restUrl = process.env.QORE_REST ?? DEFAULT_TESTNET_REST;
const path = buildDepositQuery({ address, minHeight: BigInt(from), maxHeight: BigInt(to) });
const body = await getJson(restUrl, path);
const responses = (body.tx_responses ?? []) as Record<string, unknown>[];
const entries = responses.flatMap((r) => extractDeposits(r, address));
// each entry: txhash, height, msgIndex, messageType, sender, amount, denom, memo, creditable, reason
```

Go (from `code/go/cmd/custody-kit/main.go`):

```go
opts := custodykit.DepositQueryOptions{Address: addr, MinHeight: &from, MaxHeight: &to}
path, err := custodykit.BuildDepositQuery(opts)
// GET restURL + path, then for each tx_response:
r, err := custodykit.ParseTxResponse(raw)
entries, err := custodykit.ExtractDeposits(r, addr, "") // "" = uqor
```

**4. The other languages.**

```bash
# Python (from code/python/src)
python -m qorechain_custody_kit validate qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h
python -m qorechain_custody_kit deposits <address> --from-height H --to-height H

# Rust
cargo run --example custody-kit -- validate 0x9858EfFD232B4033E47d90003D41EC34EcaEda94

# Java
mvn -q compile exec:java -Dexec.args="validate 0x9858EfFD232B4033E47d90003D41EC34EcaEda94"
```

**5. Run the vectors and the live checks.**

```bash
scripts/fetch-qoresign-vectors.sh            # optional: also check the QoreSign hybrid vectors
cd code/go && go test ./...                  # vectors
QORE_LIVE_TEST=1 go test -run Live ./...     # live reads against testnet
```

Each language has the equivalent (`pnpm test`, `pytest`, `cargo test`, `mvn test`). Live checks need no funds. Only the Go `validate` and `deposits` commands and the Go test suite were run when this page was written; the other languages are described from the repository.

### Main functions and commands {#api}

| TypeScript | Go | Python and Rust | Java | What it does |
|---|---|---|---|---|
| `validateAddress(input, { allow, requireEip55 })` | `ValidateAddress(input, ValidateAddressOptions{Allow, RequireEIP55})` | `validate_address` | `Addresses.validateAddress` | Returns `{ valid, kind, format, checksum, bech32, hex }` or `{ valid: false, error }`. |
| `decodeTx(txBytes)`, `decodeMessage(typeUrl, value)` | `DecodeTx`, `DecodeMessage` | `decode_tx`, `decode_message` | `TxDecoder.decodeTx`, `decodeMessage` | Messages, memo, fee, signers, ML-DSA-87 layers and the transaction hash. |
| `verifyTx({ txBytes, chainId, accountNumber, classicalPublicKey, classicalKeyType, pqPublicKey, signBytesVersion })` | `VerifyTx(VerifyTxArgs{...})` | `verify_tx` | `TxVerifier.verifyTx` | Returns `{ valid, classical, signerKey, pq }`. Sign-bytes version v1, v2 or either. |
| `buildDepositQuery({ address, minHeight, maxHeight, event, page, limit, orderBy })` | `BuildDepositQuery` | `build_deposit_query` | `Deposits.buildDepositQuery` | REST path for incoming transfers. `event` is `transfer` (default) or `coin_received`; `limit` 1 to 100, default 50; ascending by default. |
| `extractDeposits(txResponse, address, { denom })` | `ExtractDeposits(resp, address, denom)` | `extract_deposits` | `Deposits.extractDeposits` | Deposit entries with `creditable` and `reason`. |
| `depositEventQuery`, `percentEncode`, `getJson`, `toHex`, `fromHex` | `DepositEventQuery`, `PercentEncode`, `GetJSON`, `ToHex`, `FromHex`, `ParseTxResponse` | `deposit_event_query`, `get_json`, `from_hex` | `CustodyKit`, `Rest` | Helpers. |

Also exported: the constants `FEE_COLLECTOR`, `MSG_SEND`, `MSG_MULTI_SEND`, `MSG_ETHEREUM_TX`, `KNOWN_MESSAGES`, `PQC_HYBRID_TYPE_URL` and `DEFAULT_TESTNET_REST`.

Example command line in every language:

- `validate <address> [--allow-validator] [--require-eip55]`
- `decode <tx hex or base64>`
- `verify <tx> --chain-id ID --account-number N --pubkey HEX [--eth] [--pq-pubkey HEX]`
- `deposits <address> [--from-height H] [--to-height H] [--rest URL]`

Error codes, identical in every language:

- Kit: `MALFORMED_TX` (the bytes are not a well-formed transaction), `UNKNOWN_FIELD` (a field the decoder does not know, which the network would also refuse), `INVALID_ARGUMENT`.
- `validateAddress`: the eleven codes listed under [Innovations](#innovations).

Chain refusals a custodian meets most often, as codespace and code (the full table is in the kit's `docs/errors.md`):

| Codespace | Codes |
|---|---|
| `sdk` | 3 sequence mismatch, 4 unauthorized, 5 insufficient funds, 11 out of gas, 12 memo too large, 13 insufficient fee, 19 already in mempool |
| `pqc` | 20 hybrid signature required, 21 hybrid verification failed, 7 key already registered, 26 no EVM window (or no registered key), 27 window exhausted or out of scope, 28 invalid window parameters |
| `stakingtier` | 13 stake is locked |

Branch on the codespace and code together, and keep the raw log.

## How to access {#how-to-access}

| | Mainnet | Testnet |
|---|---|---|
| Chain id | `qorechain-vladi` | `qorechain-diana` |
| EVM chain id | 9801 | 9800 |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM JSON-RPC | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| Node release | v3.2.4 (v3.2.5 not applied yet) | v3.2.6 (v3.2.5 applied) |

- The denomination is `uqor` (1 QOR = 10^6 uqor; on the EVM lane 1 uqor = 10^12 wei). The minimum gas price is 0.1 uqor, the unbonding period is 21 days and the memo limit is 256 characters. These values were read from both networks on 27 October 2026 and can change by governance, so read them from the chain in production.
- Deposits need no keys and no registration. Sending needs a registered ML-DSA-87 key per hot address.
- Run your own full nodes for production. The public endpoints are rate-limited and meant for development. If a script gets `403 Forbidden`, set an explicit `User-Agent` header. See [running a node](/developer-guide/running-a-node) and [connecting to mainnet](/getting-started/connecting-to-mainnet).
- The testnet receives each node release before mainnet. Switch gas rules by checking the applied upgrade, not by date.
- Test tokens on testnet (bank denoms of the form `erc20:0x...`, an IBC token) do not exist on mainnet. Credit `uqor` on both networks.
- Testnet QOR comes from the QoreChain dashboard faucet and has no value. See [connecting to testnet](/getting-started/connecting-to-testnet).

## Security notes {#security}

- Both keys of a hot address (secp256k1 and ML-DSA-87) sign every native-lane transaction. Keep them in the same custody perimeter, under the same quorum and audit trail.
- Back up the 32-byte ML-DSA-87 seed (software keys) or use the HSM's key backup. An account with a registered key has no classical path, so losing the ML-DSA-87 key means the account can no longer sign. Test the restore on testnet with `verifyTx`.
- HSMs must support pure ML-DSA-87 signing (`CKM_ML_DSA` in PKCS #11 v3.2) over the sign-bytes with an empty context. `HashML-DSA` is not accepted.
- Run `decodeTx` and `verifyTx` on every signed transaction before broadcast, in a process that did not build it.
- Rotation uses `MsgRotatePQCKey`: both keys sign, the transaction's own layer uses the current key, and reuse of an earlier key is refused. If the secp256k1 key is exposed, move funds to a new address with both keys fresh and close any open EVM window.
- EVM windows: use `native_only` or `allowed_targets`, the smallest `max_value` and `blocks` that cover the batch, and close the window after the batch. Treat `MsgSetWithdrawAddress`, `MsgRotatePQCKey`, `MsgOpenEVMWindow` and `MsgAuthorizeEVMDelegation` as privileged operations.
- Never credit an EVM transaction whose `ethereum_tx` event reports a failure, even though its native result is `code == 0`.
- This is reference code at version 0.1.0. Review it before you use it in production. Report vulnerabilities privately to security@qore.network, including documentation errors that could lead to a wrong credit or an unintended signature.

## Where it is published {#where-published}

Checked against the registries on 27 October 2026.

| Registry | Package | Version | Link |
|---|---|---|---|
| GitHub | `qorechain/qorechain-custody-kit` (all five languages, guide pages, vectors) | release `v0.1.0`, published 27 October 2026 | https://github.com/qorechain/qorechain-custody-kit |
| Go module proxy | `github.com/qorechain/qorechain-custody-kit/code/go` (example code, fetchable) | v0.1.0 (tag `code/go/v0.1.0`) | https://pkg.go.dev/github.com/qorechain/qorechain-custody-kit/code/go |
| npm, PyPI, crates.io, Maven Central | not published: the kit is example code to copy or vendor | not applicable | not applicable |

The GitHub release carries no attached files; the release is the tag of the repository. Dependencies the kit builds on, all published: `@qorechain/qoresign` on npm (latest 0.1.1, the kit pins 0.1.0), `qorechain-qoresign` on PyPI (0.1.1), `qorechain-qoresign` on crates.io (latest 0.1.1, the kit pins 0.1.0), `github.com/qorechain/qoresign/go` (v0.1.0 and v0.1.1) and `io.github.qorechain:qoresign` on Maven Central (0.1.0 and 0.1.1).

Licence Apache-2.0. Maintainer: QoreChain Association.

## Limits and known issues {#limits}

- The kit does not hold keys, sign transactions, broadcast, or provide threshold or MPC signing. Signing is done by QoreSign or your HSM. There is no standardised threshold scheme for ML-DSA today; the guide documents how to combine a threshold secp256k1 key with a separately held ML-DSA-87 key.
- It makes no statement about any custodian's internal processes. The checklist describes network requirements only.
- `validateAddress` accepts 20-byte addresses. Longer module and contract account addresses are refused, as they should be for deposit and payout addresses.
- `extractDeposits` auto-credits `MsgSend`, `MsgMultiSend` and successful `MsgEthereumTx`. Other messages (reward withdrawals, contract calls, IBC transfers) are returned for review, not credited.
- `verifyTx` verifies single-signer transactions.
- The SVM lane is not open for transactions. Do not build deposit or withdrawal flows on it.
- The kit's own code is example code at 0.1.0. Function names and signatures can change between versions, and the Go module tag does not promise a stable API.
- Only the Go examples and test suite were run when this page was written. The live checks and the vector checks in the other four languages were not re-run.
- The repository's Python README may still say that `verify_tx` raises an import error until `qorechain-qoresign` 0.1.1 is on PyPI. That version is published, so the note is out of date.
- The kit's guide quotes parameters (gas figures, staking tier values) read on 27 October 2026. Read them from the chain in production.

## Related pages {#related}

- [QoreSign](/qoresign/overview): hybrid signing, verification, the key registration message and the gas helpers `suggestGasLimit` and `simulateTx`.
- [QoreChain SDK](/sdk/overview): error decoding with `decodeTxError`, the EVM window composers and the refusal classifier.
- [Post-quantum signing](/developer-guide/post-quantum-signing): hybrid signatures, sign-bytes v2 and key registration.
- [Exchange and integrator guide](/developer-guide/exchange-integration): choosing between the native, EVM and SVM paths.
- [EVM precompiles](/developer-guide/evm-precompiles) and the EVM lane.
- [Staking and delegation](/user-guide/staking-and-delegation).
- [Running a node](/developer-guide/running-a-node) and [connecting to mainnet](/getting-started/connecting-to-mainnet).
- [QoreChain MCP server](/developer-tools/mcp): `get_pq_status` and `simulate_tx` for quick checks.
- [QoreScan](/developer-tools/qorescan): inventory the cryptography of your node, endpoints and accounts.
