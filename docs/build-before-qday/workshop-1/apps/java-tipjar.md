---
slug: /build-before-qday/workshop-1/apps/java-tipjar
title: Java App, Q-Day Tip Jar
sidebar_label: Java, Tip Jar
sidebar_position: 5
---

# Java App: Q-Day Tip Jar

The **Q-Day Tip Jar** is a small Java program for the QoreChain testnet (`qorechain-diana`, EVM chain ID 9800). It sends tips with a **hybrid signature**: a classical secp256k1 signature plus a post-quantum ML-DSA-87 signature (FIPS 204). It can also watch a "jar" address, like a shop backend, and tell quantum-safe tips from classical ones.

**How long this takes:** about 20 minutes the first time (10 minutes of installing tools, 5 minutes of setup, 5 minutes of sending and checking).

You do not need to know Java. You only type the commands below, one by one, and compare the result with "What you should see".

## What it shows {#what-it-shows}

- **Hybrid ML-DSA-87 + secp256k1 signing** from Java with one call in the SDK.
- **A hybrid-signed transaction verified on chain**: the chain records a `pqc_hybrid_verify` event with `status=verified`, and the transaction carries a 4,627-byte ML-DSA-87 signature.
- **A backend that tells quantum-safe tips from classical ones**: `watch` labels every incoming transfer `QUANTUM-SAFE` or `classical only`.

Why it matters: a classical signature alone is expected to be breakable by a future quantum computer. A service that checks the chain's own verification record can decide how much to trust each payment. See [Quantum-Safe Transactions](/sdk/guides/quantum-safe).

:::warning Testnet only
Use a throwaway testnet account only. Testnet QOR has no value. Never use your real wallet, your real recovery phrase or real funds in this tutorial.
:::

## Words you will see {#words}

| Word | Meaning |
| --- | --- |
| Testnet | A practice copy of QoreChain. Coins on it are free and worth nothing. |
| QOR and uqor | Two names for the same coin. 1 QOR = 1,000,000 uqor. The app asks for QOR. Fees are shown in uqor. |
| Memo | A short text attached to a transaction, like a note on a bank transfer. |
| Address | Your public account number. On QoreChain it starts with `qor1`. Safe to share. |
| Key file | A file with your secret recovery phrase. Never share it. |
| Faucet | A website that gives free testnet QOR. |
| Hash | The unique ID of a transaction. You use it to look the transaction up. |

## Before you start {#before}

You need three tools: **Git** (downloads the code), **Java 21 or later** (runs the app) and **Maven** (builds the app). After each install, **close the terminal and open a new one**, then run the check command.

| Tool | macOS | Windows | Linux (Debian or Ubuntu) | Check |
| --- | --- | --- | --- | --- |
| Git | `brew install git` (Homebrew from https://brew.sh) | https://git-scm.com/download/win (this also gives you "Git Bash") | `sudo apt install git` | `git --version` |
| Java 21+ | `brew install openjdk@21` | https://adoptium.net (choose Temurin 21, the .msi installer) | `sudo apt install openjdk-21-jdk` | `java -version` must say 21 or higher |
| Maven | `brew install maven` | Download the zip from https://maven.apache.org/download.cgi and follow https://maven.apache.org/install.html | `sudo apt install maven` | `mvn -version` |

On Windows, use **Git Bash** (installed with Git) as your terminal for this tutorial, because the launcher `tipjar` is a shell script. On macOS use Terminal. On Linux use any terminal. If you prefer plain PowerShell, see the note in step 3.

**On macOS with Homebrew:** `brew install openjdk@21` may tell you to link it. If `java -version` still shows an old version, run what Homebrew prints under "For the system Java wrappers to find this JDK", then open a new terminal.

## Get a testnet wallet and free QOR {#wallet}

The app makes its own throwaway key (step 4 below), so you do not strictly need a wallet app for this tutorial. You do need a place to get testnet QOR. If you also want to see your account in QoreX:

1. **QoreX app:** open Settings, then turn on **Use testnet (developers)**.
2. **QoreX browser extension:** unlock it, tap the version number at the bottom 7 times, then choose **Switch to testnet (diana)**.

The free QOR comes from the faucet at https://dashboard.qorechain.io/faucet. You sign in, paste the address, and request. It gives **100 QOR per 24 hours per account**.

The very first transaction of a new account registers its post-quantum ML-DSA-87 key on the chain. This is a one-time step with a fee of about 0.09 QOR. The app does it for you with the `register` command.

## Step by step {#run}

### 1. Download the code {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/05-java-tipjar
```

**What it does**

- `git clone <address>`: copies the project from GitHub into a new folder called `build-before-qday` on your computer.
- `cd <folder>`: moves your terminal into the Java app's folder. Every later command must run from this folder.

**What you should see:** lines like `Cloning into 'build-before-qday'...` and then your prompt in the new folder.

### 2. Build the app {#build}

```bash
mvn -q package
```

**What it does:** Maven downloads the QoreChain SDK from Maven Central and packs the app into one runnable file, `target/tipjar.jar`.

| Part | Meaning |
| --- | --- |
| `mvn` | The Maven build tool. |
| `package` | Compile the code and pack it into a `.jar` file. |
| `-q` | Quiet mode: print only problems. |

**What you should see:** nothing for a few seconds (about 10 seconds the first time, a little longer on a slow connection), then your prompt returns. Check that the file exists:

```bash
ls target/tipjar.jar
```

**What you should see:** `target/tipjar.jar`.

### 3. Make the launcher runnable and test it {#launcher}

```bash
chmod +x tipjar
./tipjar
```

**What it does**

| Part | Meaning |
| --- | --- |
| `chmod +x tipjar` | Allows the file `tipjar` to be run as a program. A fresh download does not have this permission. |
| `./tipjar` | Runs the launcher in this folder. It starts `java -jar target/tipjar.jar`. With no command it prints help. |

**What you should see:** a list of commands: `new`, `status`, `register`, `tip`, `watch`.

:::note Plain PowerShell on Windows
Skip `chmod`. Replace `./tipjar` with `java -jar target/tipjar.jar` in every command below.
:::

### 4. Create your throwaway testnet account {#key}

```bash
./tipjar new
```

**What it does:** creates a fresh account. It writes a secret recovery phrase into the key file `~/.config/qday/java.env` (in your home folder, readable only by you) and prints only the public address.

| Part | Meaning |
| --- | --- |
| `new` | Create a new key file and print its address. |
| `new --force` | Replace an existing key file. The old key is lost. |

**What you should see:** `new jar key`, the path of the key file, and an `address` starting with `qor1...`. The recovery phrase is never printed.

**Copy the `qor1...` address.** If you lose it, `./tipjar status` prints it again. Never share the key file, never commit it to Git, and never reuse it on mainnet. To keep the key in another place, set `TIPJAR_KEY` first: `TIPJAR_KEY=/path/to/file ./tipjar status` (in PowerShell: `$env:TIPJAR_KEY="C:\path\file"`).

### 5. Get testnet QOR from the faucet {#faucet}

1. Open https://dashboard.qorechain.io/faucet and sign in.
2. Paste your `qor1...` address and press the request button.
3. Wait a few seconds, then run:

```bash
./tipjar status
```

**What it does:** asks the testnet for your balance and whether your post-quantum key is registered.

**What you should see:** `balance   100 QOR` (or the faucet amount) and a line saying the ML-DSA-87 key is not registered yet. If the balance is 0, wait 10 seconds and run it again.

### 6. Register your post-quantum key {#register}

```bash
./tipjar register
```

**What it does:** records your ML-DSA-87 key on the chain, once. It is safe to run again. This first transaction is signed with the classical key only, because there is no post-quantum key on chain yet to sign with. It costs about 0.09 QOR. Every transaction after it is hybrid-signed.

**What you should see:** a transaction hash and a message that the key is registered. Run `./tipjar status` again and it should now show the key as registered.

**How long:** a few seconds (one block).

### 7. Create a second address to receive tips {#jar}

A tip needs someone to receive it. Make a second throwaway account, the "jar", with its own key file:

```bash
TIPJAR_KEY=~/.config/qday/jar.env ./tipjar new
```

**What it does:** the part before `./tipjar` sets the key file for this one command only (`TIPJAR_KEY`), so the new account does not overwrite your first one. On Windows PowerShell run `$env:TIPJAR_KEY="$HOME\.config\qday\jar.env"` first, then `java -jar target/tipjar.jar new`, and reset it afterwards with `Remove-Item Env:TIPJAR_KEY`.

**What you should see:** a new `qor1...` address. Copy it. This is your **jar address**. The jar does not need any QOR to receive tips.

### 8. Send a hybrid-signed tip {#tip}

```bash
./tipjar tip qor1...JAR_ADDRESS 1 "my first quantum-safe tip"
```

Replace `qor1...JAR_ADDRESS` with the jar address from step 7.

| Part | Meaning |
| --- | --- |
| `tip` | Send a tip. |
| `qor1...JAR_ADDRESS` | Who receives the tip. |
| `1` | The amount in QOR (so 1 QOR = 1,000,000 uqor). |
| `"my first quantum-safe tip"` | The memo, a short text attached to the transaction. Optional. Keep the quotes if it has spaces. |

**What it does:** the app asks the chain how much gas the transaction needs (a test run), adds 30 percent as a safety margin, signs with both keys, sends it, waits for the block, and then checks the chain's own record.

**What you should see:** the transaction hash, the block height, and the result `QUANTUM-SAFE`. If you see `CHECK FAILED`, see Troubleshooting. Copy the hash.

**How long:** about 10 seconds.

### 9. Watch the jar, as a shop backend would {#watch}

Open a **second terminal**, go to the same folder, and start the watcher:

```bash
cd build-before-qday/workshop-1/05-java-tipjar
./tipjar watch qor1...JAR_ADDRESS
```

Now go back to the first terminal and send one more tip (step 8, with a new memo).

**What it does:** `watch` asks the chain every 3 seconds for new transfers to the jar and labels each one. `NO_COLOR=1 ./tipjar watch ...` turns colours off. Stop it with Ctrl+C.

**What you should see:** each tip listed with the tag `QUANTUM-SAFE`. A tip sent without a verified hybrid signature would show `classical only`.

## Verify the transaction yourself {#verify}

You do not have to trust the app. Ask the chain directly.

**Way 1, in the browser.** Open `https://explore.qore.network/tx/<HASH>` (put your hash in place of `<HASH>`), then switch the explorer to **Testnet**. You should see a successful transaction.

**Way 2, one command.** Put your hash in place of `<HASH>`:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

| Part | Meaning |
| --- | --- |
| `curl` | A tool that downloads a web address. Built into macOS, Windows 10+ and most Linux. |
| `-s` | Silent: hide the progress bar. |
| the address | The public testnet REST API. It returns the full transaction record as JSON. |

**What you should see** in the long output (use a JSON viewer or add `| jq .` if you installed jq):

- `"code": 0` means the transaction succeeded.
- A `PQCHybridSignature` extension holding a `pqc_signature` of **4,627 bytes** (that is the ML-DSA-87 signature).
- An event `pqc_hybrid_verify` with `status` set to `verified` for your address.

## How the proof works {#proof}

The app reads the same record from `GET /cosmos/tx/v1beta1/txs/{hash}` and looks for the event `pqc_hybrid_verify` (`address=<signer>`, `status=verified`) and the extension `/qorechain.pqc.v1.PQCHybridSignature` with a 4,627-byte signature. The watcher does the same for every incoming transfer.

## Troubleshooting {#troubleshooting}

| What you see | Why | What to do |
| --- | --- | --- |
| `./tipjar: Permission denied` | A fresh download is not marked as runnable. | Run `chmod +x tipjar`. |
| `build first: (cd ... && mvn -q package)` | The jar file is missing. | Run `mvn -q package` in this folder (step 2). |
| `mvn: command not found` or `java: command not found` | Tool not installed, or the terminal was not reopened. | Install it (see Before you start), open a new terminal, check the version. |
| Java says version 17 or lower | An older Java is first on your path. | Install Java 21, open a new terminal, run `java -version` again. |
| `no key file at ..., run new first` | You skipped step 4, or `TIPJAR_KEY` points somewhere else. | Run `./tipjar new`. |
| `key file already exists` | You already made a key. | Keep it, or replace it with `./tipjar new --force` (the old key is lost). |
| `account has no PQC key and classical fallback is disabled` | The post-quantum key is not registered yet. | Run `./tipjar register` first. |
| `EVM authorisation window exhausted` | This message belongs to the EVM apps (counter, guestbook). Not used by the Tip Jar. | In the EVM apps, open a new window with `pnpm window open`. |
| `HHE10402` after opening the window | Hardhat apps only: the window was not active yet. | In the Hardhat apps, run the deploy again. |
| Balance is 0 or `not on chain yet` | Faucet tokens have not arrived. | Wait 10 seconds, run `./tipjar status`. Check you pasted the right address. |
| Faucet says rate limit | One request per 24 hours per account. | Wait, or use a second throwaway account. |
| `chain refused the tx` or `poll failed` | The testnet is busy or being upgraded, or the public endpoint limits requests per IP address. | Wait a minute and run the command again. |
| `recipient must be a qor1... address` | The address is wrong or has spaces. | Copy the full `qor1...` address again. |
| `CORS` errors in a browser | Only when a web page calls the chain directly. This app does not. | In a browser app, use the template's `/lcd` proxy. |
| `pnpm: command not found` | pnpm is not installed. Not needed here. | Only for the Hardhat tutorial: run `npm install -g pnpm`. |

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
