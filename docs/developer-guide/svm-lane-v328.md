---
slug: /developer-guide/svm-lane-v328
title: "SVM Lane: Programs, Accounts and Custody Limits (v3.2.8)"
sidebar_label: SVM Lane (v3.2.8)
sidebar_position: 10
---

# SVM Lane: Programs, Accounts and Custody Limits (v3.2.8)

The SVM lane is the Solana-compatible part of QoreChain: you deploy compiled programs, create data accounts and call programs with Solana-style tooling, and the same native QOR balance is visible in lamports. From release **v3.2.8** the lane is **closed by the upgrade until a governance vote reopens it**, and once it is open its custody is bounded by three governed limits.

This page explains how to read the lane state, how programs, accounts and rent work, how an SVM wallet registers a post-quantum key, what the custody limits mean, and which examples can run today.

:::note Testnet first, and the lane is closed until a vote says otherwise
v3.2.8 has run on the **`qorechain-diana`** testnet since 12 November 2026. Mainnet (`qorechain-vladi`) is still on v3.2.6, has no v3.2.8 date, and **the lane stays off on mainnet**. On the testnet the upgrade closes the lane: SVM writes fail, `MsgRegisterSVMPQCKey` is refused and the public SVM JSON-RPC refuses write methods. **Governance proposal 37 opens it on `qorechain-diana`** (it sets `enabled: true`, keeps the other parameters as they are and lifts the circuit-breaker pause on `MsgExecuteProgram` and on cross-VM calls). When this page was checked on 12 November 2026 the proposal was still in its voting period and `enabled` was still `false`. Always read the live state first (next section) and do not assume it.
:::

## Why it matters {#why}

* A client that offers SVM actions while the lane is closed gives users refused transactions. Reading one parameter first avoids that.
* The lane holds real QOR: every lamport in a program, a program-derived address or a data account is backed by uqor held by the SVM module. The three custody limits keep that pool bounded, so a transfer or a deposit can be refused even when the sender has the funds.
* Rent and size limits decide how much it costs to keep state on chain, so they belong in a deployment budget.

## Reading the lane state {#lane-state}

The lane state is the `enabled` field of the SVM parameters. Read it from the REST route or the node CLI. The same response carries every other limit on this page, so one call is enough to size a deployment.

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params
```

Response on `qorechain-diana`, 12 November 2026 (HTTP 200):

```json
{"params":{"max_program_size":"10485760","max_account_data_size":"10485760","compute_budget_max":"1400000","lamports_per_byte":"3480","rent_exemption_multi":"2.000000000000000000","enabled":false,"svm_slot_offset":"0","default_sig_scheme":0,"max_cpi":4,"max_custody_uqor":"10000000000","max_custody_hard_uqor":"1000000000000","max_account_excess_uqor":"10000000000"}}
```

On a Linux node (there is no packaged macOS binary), the same read is:

```bash
qorechaind query svm params --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

In TypeScript, with Node 18 or later (no SDK call is needed for this read):

```ts
const REST = "https://api-testnet.qore.host";

const { params } = await (await fetch(`${REST}/qorechain/svm/v1/params`)).json();
if (!params.enabled) {
  throw new Error("The SVM lane is closed on this network; do not offer SVM actions");
}
console.log("compute units per instruction:", params.compute_budget_max);
```

A typed helper for these parameters (and a safe builder for a parameters proposal) is part of the SDK draft for v3.2.8, which is not published yet. A later SDK release adds this; use the command line or the REST route until then.

### Cluster identity {#cluster-info}

`cluster_info` identifies the cluster for wallets and says whether execution is on. It does not change with the lane state in any way other than `execution_enabled`.

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/cluster_info
```

Response on 12 November 2026 (HTTP 200):

```json
{"chain_id":"qorechain-diana","genesis_hash":"6Z9pa53SwiprqiAoNCqqUdj5c3C4P1zRw31gQVnF4Czj","caip2_chain_id":"solana:6Z9pa53SwiprqiAoNCqqUdj5c3C4P1zR","derivation":"base58(SHA-256(\"qorechain/svm/genesis-hash/v1\" || 0x00 || chain_id))","execution_enabled":false}
```

The node CLI has the same query: `qorechaind query svm cluster-info`. The JSON-RPC method `getGenesisHash` on `https://svm-testnet.qore.host` returns the same hash. The hash is derived from the chain id; it is not the genesis hash of a real Solana cluster.

## Public SVM RPC is read-only {#public-rpc}

The public endpoints `https://svm.qore.host` and `https://svm-testnet.qore.host` answer reads and refuse write methods (`sendTransaction` and similar) on the public chain ids, whether or not the lane is open. To submit SVM transactions you run your own node, which serves the Solana-compatible JSON-RPC on port 8899 by default (see [SVM Development](/developer-guide/svm-development#json-rpc-server)), and the lane itself must be open on the network that node follows. Reads work now:

```bash
# Health, version, cluster hash, slot and a rent quote (all HTTP 200 on 12 November 2026)
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth","params":[]}'
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getVersion","params":[]}'
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getGenesisHash","params":[]}'
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getMinimumBalanceForRentExemption","params":[1024]}'
```

`getVersion` reported `solana-core` `1.18.0-qorechain` together with the chain id, the cluster id and the genesis hash. The rent quote for 1,024 bytes was `8017920` lamports on 12 November 2026. The REST routes `GET /qorechain/svm/v1/account/{address}`, `.../program/{address}` and `.../slot` answered **HTTP 501** (not implemented) on the public endpoint; read accounts and programs through the JSON-RPC methods `getAccountInfo` and `getMultipleAccounts`, or through the node CLI.

## Deploying and calling programs {#programs}

Once the lane is open, the flow is: build an SBF program with the current Solana toolchain, deploy it, create the accounts it needs, then call it. Every `tx svm` command is a Cosmos-lane transaction, so it needs an explicit gas limit, a fee of at least gas times 0.1 uqor, and the hybrid post-quantum cosignature (see [Post-Quantum Signing](/developer-guide/post-quantum-signing)).

These are the Linux node CLI commands from the node reference. **UNTESTED: the lane is closed on the testnet today, so none of the write commands below could be run.**

```bash
# 1. Build (platform-tools v1.53, --arch v0 or --arch v3)
cargo build-sbf --arch v3

# 2. Deploy; the response carries the program id in base58
qorechaind tx svm deploy-program ./my_program.so --from mykey \
  --gas 2000000 --fees 200000uqor --chain-id qorechain-diana --generate-only > tx.json
qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana

# 3. Create a data account owned by the program (space in bytes, lamports for rent)
qorechaind tx svm create-account <owner-base58> <space> <lamports> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-diana --generate-only > tx.json

# 4. Call the program
qorechaind tx svm execute <program-id-base58> <data-hex> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-diana --generate-only > tx.json
```

Reads on a node, available whatever the lane state:

```bash
qorechaind query svm account <base58-address>
qorechaind query svm program <base58-address>
qorechaind query svm params
qorechaind query svm slot
```

### TypeScript with @qorechain/svm 0.13.0 {#typescript}

`@qorechain/svm` is a thin layer over `@solana/web3.js`. It has no loader wrapper: use the node CLI above to deploy, and the package to build and send instructions to a program that already exists. Its public presets set no SVM endpoint on purpose, so give it the URL of your own node.

```ts
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  createSvmClient,
  createInvokeInstruction,
  withComputeBudget,
  svmKeypairFromSecretKey,
} from "@qorechain/svm";

const client = createSvmClient({ rpcUrl: "http://127.0.0.1:8899" }); // your own node

const payer = svmKeypairFromSecretKey(secretKey64);       // 64-byte Solana-style secret key
const programId = new PublicKey("<program-id-base58>");
const dataAccount = new PublicKey("<data-account-base58>");

const tx = new Transaction().add(
  createInvokeInstruction(
    programId,
    [{ pubkey: dataAccount, isSigner: false, isWritable: true }],
    Uint8Array.from([0]),                                  // your program's instruction data
  ),
);
withComputeBudget(tx, { units: 200_000 });                 // stay under compute_budget_max

const sim = await client.simulateTransaction(tx);          // dry run first
const signature = await client.sendTransaction(tx, [payer]);
```

**UNTESTED:** this example needs a node you run and an open lane. Against the public endpoint the send is refused. The read-only calls (`client.getBalance`, `client.getAccountInfo`, `client.getSignaturesForAddress`) work against `https://svm-testnet.qore.host` because `createSvmClient({ rpcUrl })` accepts any URL.

Python, Go, Rust and Java: the SVM adapters for those languages build the same messages; a later SDK release adds the v3.2.8 helpers. Until then use the node CLI above or the raw message. Any Solana client library can also talk to your own node's port 8899 because the method set is Solana-compatible.

## Accounts and rent {#rent}

SVM data accounts pay for the space they use. The numbers come from the live parameters above.

| Item | Rule | Live value (testnet) |
| ---- | ---- | -------------------- |
| Rent per year | data size in bytes times `lamports_per_byte` | 3,480 lamports per byte |
| Rent-exempt minimum | rent per year times `rent_exemption_multi` | multiplier 2.0 |
| Funded at or above the minimum | never charged rent | |
| Funded below the minimum | rent is deducted each epoch | |
| Balance reaches zero | the account is removed | |

Lamports and uqor relate as 1 uqor = 1,000 lamports. Ask the node for the exact minimum rather than computing it: `getMinimumBalanceForRentExemption` returned 8,017,920 lamports for 1,024 bytes (the quote includes the account header). `create-account` needs at least that many lamports, or the account is not rent exempt.

Addresses: an account's SVM address is its 20 account bytes padded to 32 bytes and written in base58. The `qor1...`, `0x...` and base58 forms name the same account.

## Post-quantum key for SVM wallets {#pqc-key}

An SVM wallet that wants a post-quantum key on chain registers it with **`MsgRegisterSVMPQCKey`**. It carries the sender, the 32-byte SVM address and the ML-DSA-87 public key. It is a Cosmos-lane message, so the sender signs it hybrid like any other native transaction, and **while the lane is closed the chain refuses it**.

There is no `tx svm` command for it; use the SDK composer. In TypeScript the composer is `msg.svm.registerSvmPqcKey` in `@qorechain/sdk`. **UNTESTED: refused while the lane is closed, so it was not sent.**

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  msg,
} from "@qorechain/sdk";
import { fromBech32 } from "@cosmjs/encoding";

const client = createClient({
  network: "testnet",
  endpoints: { rest: "https://api-testnet.qore.host", rpc: "https://rpc-testnet.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);
const tx = await client.connectTx(signer, { pqcKeypair });   // signs hybrid

// 20 account bytes padded with zeros to the 32-byte SVM address
const svmAddr = new Uint8Array(32);
svmAddr.set(fromBech32(account.address).data);

await tx.signAndBroadcast(
  [msg.svm.registerSvmPqcKey({ sender: account.address, svmAddr, pqcPubKey: pqcKeypair.publicKey })],
  "auto",
);
```

The Python composer is `msg.svm.register_svm_pqc_key(sender=, ...)` and the Go one is `Svm.RegisterPQCKey(sender, svmAddr, pqcPubKey)`.

## Custody limits {#custody}

Every lamport held by a program, a program-derived address or a data account is backed by uqor that the SVM module holds in one pool, called custody. Three governed parameters bound it. All three are in uqor; 1 QOR is 1,000,000 uqor. Governance changes them with a parameters proposal, and a proposal must send all twelve fields because it replaces the set as a whole.

| Parameter | Live value | In plain terms |
| --------- | ---------- | -------------- |
| `max_custody_uqor` | 10,000,000,000 (10,000 QOR) | The cap on the SVM pool balance. A transfer that would lift the pool above it is refused with `svm custody cap exceeded` (code 23). `0` means no cap. |
| `max_custody_hard_uqor` | 1,000,000,000,000 (1,000,000 QOR) | The absolute ceiling on the pool's raw balance, rent reserves, pre-funding and plain donations included. An operation that would leave the balance above it is refused. It must not be below `max_custody_uqor`, and it must be above zero for the lane to be opened. |
| `max_account_excess_uqor` | 10,000,000,000 (10,000 QOR) | The most a single data account may hold above its rent-exempt minimum. `0` means no per-account cap. |

What this means for an application: keep the value you park in SVM accounts modest and above the rent minimum only by what you need. A deposit that is fine for your balance can still be refused if the pool as a whole is near its cap, so treat code 23 as "try later or with less", not as an invalid transaction. The limits can only grow through a governance vote, never by a user transaction.

## Compute budget and size limits {#limits}

| Limit | Parameter | Live value (testnet) |
| ----- | --------- | -------------------- |
| Compute units per instruction | `compute_budget_max` | 1,400,000 |
| Program size (ELF) | `max_program_size` | 10,485,760 bytes (10 MiB) |
| Data account size | `max_account_data_size` | 10,485,760 bytes (10 MiB) |
| Nested program calls | `max_cpi` | 4 |
| Default signature scheme | `default_sig_scheme` | 0 (Ed25519) |
| Slot offset | `svm_slot_offset` | 0 (the slot is the block height plus the offset) |

Each frame has a 32 KiB stack and a 256 KiB heap. The values above can change by governance, so read them live. In `@qorechain/svm` 0.13.0, `withComputeBudget(tx, { units })` requests a compute-unit limit; keep it at or below `compute_budget_max`.

## Errors and refusals {#errors}

| What you see | Meaning | What to do |
| ------------ | ------- | ---------- |
| `SVM module is disabled` (code 11) | The lane is closed | Read `enabled` and wait for the vote; do not retry |
| `MsgRegisterSVMPQCKey` refused | Lane closed | Register after the lane opens |
| Write method refused on `svm.qore.host` or `svm-testnet.qore.host` | Public endpoints are read-only | Use your own node |
| `svm custody cap exceeded` (code 23) | The pool is at its cap | Retry later or with a smaller amount |
| `airdrop rate limit exceeded` (code 19) | `requestAirdrop` called too often (testnet only) | Wait |
| `blockhash expired` (code 20) | The recent blockhash is too old | Fetch a fresh one and sign again |
| `svm simulation slots busy, retry later` (code 24) | Simulations are bounded; it never occurs in a block | Retry the simulation |
| HTTP 501 on `/qorechain/svm/v1/account/...` | Route not implemented on the public endpoint | Use `getAccountInfo` |

## Mainnet {#mainnet}

Mainnet stays on v3.2.6 for now, with the SVM lane off, and enabling it on mainnet needs a later release and a governance vote. Plan against the testnet only.

## See also {#see-also}

* [SVM Development](/developer-guide/svm-development): the lane overview, the JSON-RPC server and native QOR as lamports.
* [Solana-Compatible JSON-RPC](/api-reference/json-rpc-solana-compatible): the method list.
* [Post-Quantum Signing](/developer-guide/post-quantum-signing): the hybrid signature every native-lane transaction needs.
* [Cross-VM Interoperability](/developer-guide/cross-vm-interoperability): calls between SVM, EVM and QoreChain Native.
* [Node Operators: v3.2.8 Checklist](/developer-guide/node-operators-v328): upgrading a node.
