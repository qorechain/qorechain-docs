---
slug: /build-before-qday/workshop-1/apps/java-tipjar
title: Java App, Q-Day Tip Jar
sidebar_label: Java, Tip Jar
sidebar_position: 5
---

# Java App: Q-Day Tip Jar

The **Q-Day Tip Jar** is a small Java backend for the QoreChain testnet (`qorechain-diana`, EVM chain ID 9800). It sends tips with a **hybrid signature** (classical secp256k1 plus post-quantum ML-DSA-87, FIPS 204). As a shop-backend example, it can also watch a jar address and accept only the tips whose sender signature the chain verified as hybrid.

## What it shows {#what-it-shows}

- **Hybrid ML-DSA-87 + secp256k1 signing** from Java with one call path in the SDK.
- **A hybrid-signed transaction verified on chain**: the chain emits a `pqc_hybrid_verify` event with `status=verified` for the signer, and the transaction carries a 4627-byte ML-DSA-87 signature.
- **A backend that tells quantum-safe tips from classical ones**: `watch` labels every incoming transfer `QUANTUM-SAFE` or `classical only`.

Why it matters: a classical signature alone is expected to be breakable by a future quantum computer. A service that checks the chain's own verification record can decide how much to trust each payment. See [Quantum-Safe Transactions](/sdk/guides/quantum-safe).

## Step by step {#run}

Everything below runs in your own terminal (macOS, Linux, or Windows with WSL). You use a throwaway testnet account only. Testnet QOR has no value, and you never use a real wallet here.

### 1. Install the tools {#install}

You need Git, a JDK 21 or later, and Maven. Check what you have:

```bash
git --version
java -version      # must report 21 or later
mvn -version       # any recent Maven 3.x
```

If `java` or `mvn` is missing or too old, install them first, for example with [Temurin JDK 21](https://adoptium.net) and [Apache Maven](https://maven.apache.org/install.html), or with your package manager (`brew install openjdk@21 maven` on macOS, `sudo apt install openjdk-21-jdk maven` on Debian or Ubuntu). Open a new terminal and run the three checks again.

### 2. Get the code {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/05-java-tipjar
```

### 3. Build the app {#build}

```bash
mvn -q package
```

Maven downloads the SDK from Maven Central and builds one runnable file, `target/tipjar.jar`. The first build takes under a minute. Then make the launcher executable and check it runs:

```bash
chmod +x tipjar
./tipjar
```

You should see the list of commands (`new`, `status`, `register`, `tip`, `watch`).

### 4. Create your throwaway testnet account {#key}

```bash
./tipjar new
```

This generates a fresh recovery phrase, writes it to the key file `~/.config/qday/java.env` (readable only by you, mode 0600), and prints only the account address, which starts with `qor1...`. The phrase is never printed. Do not share this file, do not commit it, and do not reuse it on mainnet. To keep the key somewhere else, set `TIPJAR_KEY=/path/to/file` before every command.

Copy the `qor1...` address from the output. If you lose it, `./tipjar status` prints it again.

### 5. Get testnet QOR from the faucet {#faucet}

1. Open https://dashboard.qorechain.io/faucet and sign in.
2. Paste your `qor1...` address and request tokens. The faucet gives 100 QOR per 24 hours.
3. Check that it arrived:

```bash
./tipjar status
```

The balance should show your testnet QOR, and the post-quantum key should show as not registered yet.

### 6. Register your post-quantum key {#register}

```bash
./tipjar register
```

This registers your ML-DSA-87 key on chain once. It is safe to run again. The registration message itself is signed classically by design, because there is no post-quantum key to sign with yet; it carries a proof that you hold the new key. Every transaction after it is hybrid-signed.

### 7. Create a second address to receive tips {#jar}

A tip needs a recipient. Create a second throwaway account for the jar, with its own key file:

```bash
TIPJAR_KEY=~/.config/qday/jar.env ./tipjar new
```

Copy its `qor1...` address. This is your jar address.

### 8. Send a hybrid-signed tip {#tip}

```bash
./tipjar tip qor1...JAR_ADDRESS 1 "my first quantum-safe tip"
```

Replace `qor1...JAR_ADDRESS` with the jar address from step 7. `1` is the amount in QOR. The memo is optional. The app simulates the transaction to set the gas, signs it with both keys, broadcasts it, waits for the block, and checks the chain's verification record.

### 9. Watch the jar, as a shop backend would {#watch}

Open a second terminal in the same folder. Start the watcher on the jar address, then send another tip from the first terminal:

```bash
./tipjar watch qor1...JAR_ADDRESS
```

The watcher checks every 3 seconds and labels each incoming tip. Stop it with Ctrl+C. Set `NO_COLOR=1` to turn off colours. The public testnet endpoints have a per-IP rate limit, so if a call fails, wait a minute and retry.

## What you should see {#output}

- After `tip`, the terminal prints the transaction hash and block height, then the verification result: `QUANTUM-SAFE` when the chain verified the hybrid signature, `CHECK FAILED` otherwise.
- In `watch`, each tip is listed with a `QUANTUM-SAFE` tag when the chain verified a hybrid signature, or `classical only` when it did not.
- On the explorer: open `https://explore.qore.network/tx/<HASH>` (use the hash from the terminal) and switch the explorer to **Testnet**. The transaction shows as successful.

## How the proof works {#proof}

The app reads the transaction from the testnet REST endpoint (`GET /cosmos/tx/v1beta1/txs/{hash}`) and looks for:

- an event `pqc_hybrid_verify` with `address=<signer>` and `status=verified`;
- the extension `/qorechain.pqc.v1.PQCHybridSignature` with a 4627-byte `pqc_signature`.

The watcher reads exactly that for every incoming transfer.

## The SDK code that matters {#code}

```java
PqcDx.Signer signer = new PqcDx.Signer();                  // keys, chain id, account number, sequence
signer.secp256k1PrivateKey = account.privateKey;            // classical half
signer.pqcKeypair = Authenticator.derivePqcCanonical(account.address, mnemonic); // ML-DSA-87 half
signer.chainId = "qorechain-diana";
signer.restUrl = Networks.get("testnet").endpoints.rest;    // sign-bytes version and key checks

PqcDx.HybridSendPath path = PqcDx.migrateToHybrid(signer, new Broadcaster(rpc), null, opts); // registers once
TypedMessage tip = NativeTx.bankSend(from, to, List.of(new StdFee.Coin("uqor", "500000")));
var sent = path.sendAuto(List.of(tip), "0.15uqor", 1.3);   // simulate, price, hybrid-sign, broadcast
TxTracker.waitForTx(new RestClient(rest), sent.result.transactionHash, null);
```

Gas is never fixed: every transaction is simulated first and gets the simulated gas times 1.3, priced at 0.15 uqor per gas.

The account is a classic coin-118 QoreChain account (`m/44'/118'/0'/0/0`). The ML-DSA-87 key is derived from the same recovery phrase and bound to the address with `Authenticator.derivePqcCanonical`. If you build your own app on the seed-based helpers instead, SDK 0.13.0 needs a recovery code or an independent 32-byte PQC secret; see [SDK install](/sdk/install#whats-new-0130). Never print a recovery code.

## Packages used {#packages}

| Item | Version |
| --- | --- |
| `io.github.qorechain:qorechain-sdk` (Maven Central) | 0.13.0 |
| `com.fasterxml.jackson.core:jackson-databind` | 2.17.2 |
| `org.codehaus.mojo:exec-maven-plugin` | 3.5.0 |
| `org.apache.maven.plugins:maven-shade-plugin` | 3.6.0 |
| Java (`maven.compiler.release`) | 21 |
| App `demo:tipjar` | 1.0.0 |

See [SDK install](/sdk/install) for the release table of all languages.

## Where to look things up {#access}

| What | Where |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (switch to Testnet) |
| Faucet | https://dashboard.qorechain.io/faucet |
| Code | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/05-java-tipjar |
