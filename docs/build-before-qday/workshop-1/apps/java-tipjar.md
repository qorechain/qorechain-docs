---
slug: /build-before-qday/workshop-1/apps/java-tipjar
title: Java App, Q-Day Tip Jar
sidebar_label: Java, Tip Jar
sidebar_position: 5
---

# Java App: Q-Day Tip Jar

The **Q-Day Tip Jar** is a small Java backend for the QoreChain testnet (`qorechain-diana`, EVM chain ID 9800). It sends tips with a **hybrid signature** (classical secp256k1 plus post-quantum ML-DSA-87, FIPS 204) and, as the shop-backend story, it can watch a jar address and accept only the tips whose sender signature the chain verified as hybrid.

## What it shows {#what-it-shows}

- **Hybrid ML-DSA-87 + secp256k1 signing** from Java with one call path in the SDK.
- **One hybrid-signed transaction verified on chain**: the chain emits a `pqc_hybrid_verify` event with `status=verified` for the signer, and the body carries a 4627-byte ML-DSA-87 signature.
- **A backend that tells quantum-safe tips from classical ones**: `watch` labels every incoming transfer `QUANTUM-SAFE` or `classical only`.

Why it matters: a classical signature alone is expected to be breakable by a future quantum computer. A service that checks the chain's own verification record can decide how much to trust each payment. See [Quantum-Safe Transactions](/sdk/guides/quantum-safe).

## Packages and versions {#packages}

| Item | Value |
| --- | --- |
| Maven artifact | `io.github.qorechain:qorechain-sdk` 0.13.0 (on Maven Central since 12 November 2026) |
| Other dependency | `com.fasterxml.jackson.core:jackson-databind` 2.17.2 |
| Java | 21 or later for this app (`maven.compiler.release` is 21) |
| Build plugins | `exec-maven-plugin` 3.5.0, `maven-shade-plugin` 3.6.0 |
| App | `demo:tipjar` 1.0.0 (not published) |
| Network | testnet `qorechain-diana`, release v3.2.8 since 12 November 2026 |

The dependency block:

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.13.0</version>
</dependency>
```

See [SDK install](/sdk/install) for the release table of all languages.

## Build and run {#run}

You need Java 21 or later and Maven. Build once:

```bash
mvn -q package            # produces target/tipjar.jar (about 8 s from an empty Maven cache)
```

Then use the commands:

```bash
./tipjar new                              # create the key file (mode 0600), print the address
./tipjar status                           # address, balance, PQC key registered or not
./tipjar register                         # register the ML-DSA-87 key (idempotent)
./tipjar tip <qor1...> <QOR> [memo]       # send a hybrid-signed tip, wait for the block, verify it
./tipjar watch [qor1...]                  # watch a jar for tips, QUANTUM-SAFE vs classical only
```

`./tipjar` is a small launcher that runs `java -jar target/tipjar.jar` (it also hides a JDK 24+ protobuf warning). You can also run `mvn -q exec:java -Dexec.args="status"`.

1. **`new`** creates a recovery phrase in a key file with mode 0600 and prints only the address. The default is `~/.config/qday/java.env`; set `TIPJAR_KEY` to change it. The phrase is never printed. Keep the file private.
2. **Fund the address** from the [Faucet](/dashboard/faucet) (sign-in required; 100 QOR per 24 hours per account and address, plus the builder-fest test tokens).
3. **`register`** registers the ML-DSA-87 key once. It is signed classically by design: the chain exempts this one message, since there is no PQC key to sign with yet. It carries a proof of possession signed with the new key.
4. **`tip`** sends the tip, waits for the block and verifies it.
5. **`watch`** polls the jar address every 3 seconds and labels each incoming tip.

Set `NO_COLOR=1` to turn off colours. The public testnet endpoints have a per-IP rate limit.

## The account {#account}

A classic coin-118 QoreChain account (`m/44'/118'/0'/0/0`). The ML-DSA-87 key is derived from the mnemonic and bound to the address with `Authenticator.derivePqcCanonical`. The app signs from a mnemonic, so it does not use the seed-path helpers. If you build on those, SDK 0.13.0 needs a recovery code or an independent 32-byte PQC secret: in Java `UnifiedAccounts.unifiedAccountFromSeed(seed32, SeedPqcOptions.withRecoveryCode(code))`; see [SDK install](/sdk/install#whats-new-0130). Never print a recovery code.

## The SDK code that matters {#code}

```java
PqcDx.Signer signer = new PqcDx.Signer();                  // keys, chain id, account number, sequence
signer.secp256k1PrivateKey = account.privateKey;            // classical half
signer.pqcKeypair = Authenticator.derivePqcCanonical(account.address, mnemonic); // ML-DSA-87 half
signer.chainId = "qorechain-diana";
signer.restUrl = Networks.get("testnet").endpoints.rest;    // sign-bytes v1/v2 + key checks

PqcDx.HybridSendPath path = PqcDx.migrateToHybrid(signer, new Broadcaster(rpc), null, opts); // registers once
TypedMessage tip = NativeTx.bankSend(from, to, List.of(new StdFee.Coin("uqor", "500000")));
var sent = path.sendAuto(List.of(tip), "0.15uqor", 1.3);   // simulate, price, hybrid-sign, broadcast
TxTracker.waitForTx(new RestClient(rest), sent.result.transactionHash, null);
```

Gas is never fixed: every transaction is simulated first and gets the simulated gas times 1.3, priced at 0.15 uqor per gas.

## How the proof works {#proof}

The app reads `GET /cosmos/tx/v1beta1/txs/{hash}` and looks for:

- an event `pqc_hybrid_verify` with `address=<signer>` and `status=verified`;
- the body extension `/qorechain.pqc.v1.PQCHybridSignature` with a 4627-byte `pqc_signature`.

The watcher reads exactly that for every incoming transfer (a transaction search on the jar as recipient).

## What you see when it works {#output}

After `tip`, the app prints the transaction hash and block, then the verification result: `QUANTUM-SAFE` when both checks pass, `CHECK FAILED` otherwise. In `watch`, each tip to the jar is listed with a `QUANTUM-SAFE` tag when the chain verified a hybrid signature, or `classical only` when it did not. Open the transaction at `https://explore.qore.network/tx/<HASH>` (switch the explorer to Testnet).

## Where to access it {#access}

| What | Where |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (switch to Testnet) |
| Faucet | [Faucet](/dashboard/faucet) |

## Get the code {#get-the-code}

The code is in the public repository: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/05-java-tipjar (the link works once the repository is published; the code is also shown inline on this page).
