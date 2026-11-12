---
slug: /build-before-qday/prerequisites
title: "Before you start: tools and a testnet wallet"
sidebar_label: "Before you start"
sidebar_position: 2
---

# Before you start: tools and a testnet wallet

Every tutorial in this section starts from a computer with nothing installed. This page is the one place where you set that up. Do it once, then open any tutorial. Each tutorial links back here and repeats only the short check commands it needs.

**How long this takes:** about 20 to 40 minutes the first time, mostly downloads. You only install the tools for the tutorial you want to follow.

:::caution Throwaway testnet account only
Everything here runs on the QoreChain **testnet**, where QOR has no value. Never use your real wallet, a real recovery phrase or real funds in any tutorial. You will make a new account just for this exercise.
:::

## Which tools does each tutorial need? {#which-tools}

Install only the rows you need. Git, a terminal and a web browser are needed by all of them.

| Tutorial | Language | Tools to install | QoreX wallet |
| --- | --- | --- | --- |
| [Workshop 1 guide](/build-before-qday/workshop-1) | TypeScript | Node.js, pnpm, curl, jq (optional) | Not needed |
| [Q-Day Counter](/build-before-qday/workshop-1/apps/qday-counter) | TypeScript | Git, Node.js, pnpm | Not needed |
| [Q-Day Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) | TypeScript | Git, Node.js, pnpm | Needed, with an Ethereum account (coin 60) |
| [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) | TypeScript | Git, Node.js, pnpm | Needed |
| [Rust, qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) | Rust | Git, Rust | Not needed |
| [Java, Tip Jar](/build-before-qday/workshop-1/apps/java-tipjar) | Java | Git, Java 21, Maven | Not needed |
| [Python, Airdrop](/build-before-qday/workshop-1/apps/python-airdrop) | Python | Git, Python 3.10 or later | Not needed |

## Open a terminal {#terminal}

A terminal is a window where you type commands. You will paste commands from these pages into it, one at a time.

| System | How to open it |
| --- | --- |
| macOS | Press Command and Space, type `Terminal`, press Return. |
| Windows | Open the Start menu, type `PowerShell`, open **Windows PowerShell**. For the Java tutorial you also need **Git Bash** (it comes with Git, see below) or WSL. |
| Linux | Press Ctrl, Alt and T, or search for `Terminal` in your applications. |

After you install a tool, **close the terminal and open a new one**. A terminal that was open during the install does not see the new tool yet.

## Install the tools {#install}

For every tool you get the install command or download link, then the **check command**. A check command asks the tool for its version. If it prints a version number at or above the one required, the tool works.

### Package managers (optional helpers) {#package-managers}

A package manager installs other programs from one command. You can also download each tool by hand from its website. The commands below use the helper that fits your system.

| System | Helper | How to get it |
| --- | --- | --- |
| macOS | Homebrew | Paste this one line into the terminal, then follow what it prints: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` |
| Windows | winget | Already included in Windows 10 and 11. Check with `winget --version`. |
| Linux | apt | Already included on Ubuntu and Debian. Other systems: use your own package manager (`dnf`, `pacman`). |

### Git {#git}

Git downloads the example code from GitHub.

| System | Install |
| --- | --- |
| macOS | `xcode-select --install` (a window opens, choose **Install**), or `brew install git` |
| Windows | `winget install --id Git.Git -e`, or download from [git-scm.com](https://git-scm.com/download/win) |
| Linux | `sudo apt install -y git` |

Check it:

```bash
git --version
```

You should see a line such as `git version 2.40.0`. Any version works.

### Node.js 22.13 or later {#node}

Node.js runs the TypeScript projects. Hardhat 3, the contract tool used here, refuses to start on anything older than Node.js 22.13.

| System | Install |
| --- | --- |
| macOS | `brew install node`, or download the LTS installer from [nodejs.org](https://nodejs.org) |
| Windows | `winget install --id OpenJS.NodeJS.LTS -e`, or download the LTS installer from [nodejs.org](https://nodejs.org) |
| Linux (Ubuntu, Debian) | `curl -fsSL https://deb.nodesource.com/setup_22.x \| sudo -E bash -` then `sudo apt install -y nodejs` |

:::note Linux: do not use the default apt package
On Ubuntu and Debian, `sudo apt install nodejs` gives an old version that is too low. Use the NodeSource line above.
:::

Check it:

```bash
node -v
```

You should see `v22.13.0` or higher, for example `v22.20.0` or `v24.1.0`. If you see a lower number, install again and open a new terminal.

### pnpm 9 or later {#pnpm}

pnpm installs the libraries a TypeScript project needs. It does the same job as `npm`, only faster.

Install it with Node.js's own installer tool, `npm`, on every system:

```bash
npm install -g pnpm
```

| Part | What it does |
| --- | --- |
| `npm install` | Downloads and installs a program. |
| `-g` | Short for "global": installs it for your whole computer, not for one folder. |
| `pnpm` | The program to install. |

On macOS and Linux, if this ends with `EACCES` or "permission denied", run it again as `sudo npm install -g pnpm`.

:::caution Node.js from Homebrew does not include pnpm
If a tutorial says `pnpm: command not found` (or `zsh: command not found: pnpm`), you have not installed pnpm yet. Run `npm install -g pnpm`, open a new terminal and try again.
:::

Check it:

```bash
pnpm -v
```

You should see `9.0.0` or higher, for example `10.4.1`.

### curl and jq (Workshop 1 guide only) {#curl-jq}

`curl` downloads a web address from the terminal. You use it to read your transaction from the public REST endpoint. `jq` filters the long answer so you see only the part you want. `jq` is optional.

| System | curl | jq |
| --- | --- | --- |
| macOS | Included. | `brew install jq` |
| Windows | Included in Windows 10 and 11 as `curl.exe`. | `winget install --id jqlang.jq -e` |
| Linux | `sudo apt install -y curl` if missing | `sudo apt install -y jq` |

Check them:

```bash
curl --version
jq --version
```

You should see a version line for each, for example `jq-1.7`.

:::note Windows PowerShell: type curl.exe
In PowerShell the short word `curl` is a different built-in command. Type `curl.exe` instead of `curl` in every command on these pages. If you use Git Bash, plain `curl` works.
:::

### Rust 1.88 or later (Rust tutorial only) {#rust}

Rust compiles the `qday-pay` command line app. You install it with `rustup`, the official Rust installer. It also installs `cargo`, the Rust build tool.

| System | Install |
| --- | --- |
| macOS | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (press Return to accept the default). The compiler tools come with `xcode-select --install`. |
| Windows | Download and run `rustup-init.exe` from [rustup.rs](https://rustup.rs), or `winget install --id Rustlang.Rustup -e`. When it asks for the Visual Studio C++ Build Tools, accept: Rust needs them to build programs on Windows. |
| Linux | `sudo apt install -y build-essential curl` then `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (press Return to accept the default) |

Check it:

```bash
rustc --version
cargo --version
```

You should see `rustc 1.88.0` or higher and a `cargo` version line. If you already have Rust, `rustup update` brings it up to date.

### Java 21 and Maven (Java tutorial only) {#java}

The Tip Jar app needs a Java 21 or later JDK (the tools to build and run Java) and Maven, the build tool that downloads Java libraries.

| System | Install |
| --- | --- |
| macOS | `brew install --cask temurin@21` then `brew install maven` (or use the installer from [adoptium.net](https://adoptium.net)) |
| Windows | `winget install --id EclipseAdoptium.Temurin.21.JDK -e`, then download Maven from [maven.apache.org/download.cgi](https://maven.apache.org/download.cgi), unzip it, and add its `bin` folder to the `PATH`. Easier path: install WSL (see below) and follow the Linux line. |
| Linux | `sudo apt install -y openjdk-21-jdk maven` |

Check them:

```bash
java -version
mvn -version
```

You should see `openjdk version "21` (or a higher number such as 25) and `Apache Maven 3.` followed by a version. If `java -version` shows 17 or lower, install Java 21 and open a new terminal.

### Python 3.10 or later with venv (Python tutorial only) {#python}

Python runs the Airdrop app. `venv` makes a private folder for its libraries, so nothing else on your computer is touched.

| System | Install |
| --- | --- |
| macOS | `brew install python`, or download from [python.org](https://www.python.org/downloads/) |
| Windows | `winget install --id Python.Python.3.12 -e`, or download from [python.org](https://www.python.org/downloads/) and tick **Add python.exe to PATH** in the installer |
| Linux | `sudo apt install -y python3 python3-venv python3-pip` |

Check it:

```bash
python3 --version
```

You should see `Python 3.10.0` or higher. On Windows, type `python --version` instead (the command is `python`, not `python3`).

### Windows and the Linux commands: WSL {#wsl}

Most commands in the tutorials are the same on every system. A few use Linux shell features: `source`, `chmod`, `./tipjar` and `sleep`. On Windows you have two choices:

1. **Native Windows.** Use PowerShell for the TypeScript, Rust and Python tutorials. The tutorials give the Windows variant where it differs, for example `.venv\Scripts\activate`. For the Java tutorial, use **Git Bash** (installed with Git).
2. **WSL.** Windows Subsystem for Linux gives you a real Linux inside Windows. Open PowerShell as administrator, run the command below, restart, then follow the **Linux** lines on this page inside the Ubuntu window.

```powershell
wsl --install
```

| Part | What it does |
| --- | --- |
| `wsl` | The Windows Subsystem for Linux tool. |
| `--install` | Installs WSL and the Ubuntu Linux system in one step. |

## Check everything in one go {#check-all}

Run the commands for the tools you installed. Each one must print a version.

```bash
git --version
node -v
pnpm -v
rustc --version
java -version
mvn -version
python3 --version
```

| Check | Good answer |
| --- | --- |
| `node -v` | `v22.13.0` or higher |
| `pnpm -v` | `9.0.0` or higher |
| `rustc --version` | `rustc 1.88.0` or higher |
| `java -version` | `21` or higher |
| `mvn -version` | `Apache Maven 3.` and a version |
| `python3 --version` | `Python 3.10.0` or higher |

## Get a testnet wallet {#wallet}

You need a place to hold test QOR. Some tutorials create a throwaway account for you in a file. Others use the **QoreX** wallet, QoreChain's official wallet, switched to the testnet. The table in [Which tools does each tutorial need?](#which-tools) says which.

### QoreX on testnet {#qorex}

1. Install QoreX from the official listing: [App Store](https://apps.apple.com/us/app/qorex-wallet/id6791256626) for iPhone, [Google Play](https://play.google.com/store/apps/details?id=network.qore.qorex) for Android, [Chrome Web Store](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) for Chrome, Brave, Edge, Arc and Opera, or [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/qorex/). The full list is on the [QoreX overview](/qorex/overview).
2. Create a **new** wallet and save the recovery phrase on paper. Do not import a phrase that holds real funds.
3. Switch the wallet to the testnet:
   - **Phone app:** open **Settings**, then turn on **Use testnet (developers)**.
   - **Browser extension:** unlock it, then tap the **version number at the bottom** 7 times. A developer option appears. Choose **Switch to testnet (diana)**.
4. Check that the testnet badge shows. The testnet is called `qorechain-diana`.

**What you should see:** a testnet badge in the wallet, and a `qor1...` address on the home screen. Testnet balances show no dollar value, and that is correct.

### Add an Ethereum account (coin 60) {#coin-60}

The Guestbook tutorial uses the EVM lane, so the wallet needs an Ethereum-style account.

1. In QoreX, open the account list and choose **Add an Ethereum account (coin 60)**.
2. Create a new one. Do not restore a phrase that holds real funds.
3. Select that account. It shows a `0x...` address.

**What you should see:** an account labelled *Ethereum, coin 60*, with an address that starts with `0x`. The same account also has a `qor1...` address.

More about accounts: [QoreX account and Dashboard](/qorex/account-and-dashboard) and [Get started with QoreX](/qorex/getting-started).

## Get test QOR from the faucet {#faucet}

The faucet gives free test QOR to a testnet address. A new account must receive some before it can do anything, because every transaction pays a small network fee.

1. Open [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet) in your browser.
2. Sign in to the QoreChain Dashboard.
3. Paste your `qor1...` address into the address box.
4. Select **Request Tokens**.
5. Wait for **Tokens Sent!**.

**What you should see:** the card **Tokens Sent!** with 100 QOR, and a **View on Explorer** link.

The faucet pays **100 QOR once every 24 hours per account** and per address. If you ask again too early it shows **Rate Limit Reached**. Wait for the 24 hours to end. One request is enough for every tutorial on this page.

### Your first transaction registers your post-quantum key {#first-tx}

Every QoreChain account has two keys: a classical key and a post-quantum ML-DSA-87 key. The very first transaction of a new account **registers the ML-DSA-87 key on chain**. It is one time only, per account, and costs about **0.09 QOR**. After that, every transaction is signed with both keys.

To see how the key is made and bound to your account, read [How your post-quantum key is bound to your account](/build-before-qday/key-binding).

The tutorials run this step for you with a command named `register`. You do not need to do anything now. The faucet's 100 QOR covers it many times over.

## QOR and uqor {#units}

You will see two names for the same coin. **QOR** is the whole coin. **uqor** is the smallest piece.

**1 QOR = 1,000,000 uqor.**

| You see | It means |
| --- | --- |
| `1` QOR | 1,000,000 uqor |
| `0.1` QOR | 100,000 uqor |
| `0.09` QOR | 90,000 uqor |
| `0.15uqor` | A price of 0.15 uqor for each unit of gas, used when you pay a fee |

Wallets and most commands use QOR. The chain itself counts in uqor. A **memo** is a short piece of text you attach to a transaction, such as `Hello from the workshop`. Anyone can read it on chain, so never put a secret in a memo.

**Gas** is the measure of work a transaction asks the network to do. The fee is the gas used multiplied by the gas price. The tools in this section estimate the gas for you, so you do not calculate anything.

## Keep your throwaway keys safe {#key-hygiene}

A tutorial creates a secret for your testnet account and stores it on your computer. Treat it with care, even though test QOR has no value, so you form the habit before mainnet.

1. **Where it lives.** In the TypeScript tutorials the secrets go in a file named `.env` in the project folder. The Rust, Java and Python apps write a key file with the command `new`, in a hidden folder named `.config/qday` inside your home folder. The tutorial names the exact file.
2. **Never share it.** Do not paste it into chat, email, a screenshot or a video. Hide the file when you share your screen.
3. **Never commit it.** Do not add `.env` or a key file to Git, and never push it to GitHub. Add `.env` to `.gitignore` if a project does not already ignore it.
4. **Testnet only.** Never reuse a testnet key, recovery phrase or recovery code on mainnet.
5. **Delete it when you finish.** When you have finished a tutorial, delete the key file or `.env`. You can always make a new account in a minute.

:::danger Real funds
Never put the key, mnemonic (recovery phrase) or recovery code of an account that holds real funds into a `.env` file, a key file or any command in this section.
:::

## The network and the public endpoints {#network}

| Service | Value |
| --- | --- |
| Testnet name | `qorechain-diana` |
| EVM chain ID | 9800 |
| REST (read data over the web) | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` |
| Explorer | [explore.qore.network](https://explore.qore.network), then switch to **Testnet** |
| Faucet | [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet) |

## Troubleshooting {#troubleshooting}

| What you see | Why | What to do |
| --- | --- | --- |
| `pnpm: command not found` | pnpm is not installed. Node.js does not include it, also when installed with Homebrew. | Run `npm install -g pnpm`, open a new terminal and run `pnpm -v`. |
| `node: command not found`, or an old version after the install | The terminal was open during the install, or the old version comes first. | Close the terminal, open a new one, run `node -v`. On Linux use the NodeSource line, not the default apt package. |
| `ERROR: You are using Node.js ... which is not supported by Hardhat` | Node.js is older than 22.13. | Install Node.js 22.13 or later, then run `pnpm install` in the project again. |
| `EACCES` or permission denied during `npm install -g pnpm` | Your user cannot write to the global folder. | Run `sudo npm install -g pnpm` on macOS and Linux. |
| `rustc: command not found` after installing Rust | The terminal does not know the new `PATH` yet. | Open a new terminal. If it still fails, run `source "$HOME/.cargo/env"`. |
| `linker 'cc' not found` or `link.exe not found` when building Rust | The C compiler tools are missing. | macOS: `xcode-select --install`. Linux: `sudo apt install -y build-essential`. Windows: install the Visual Studio C++ Build Tools. |
| `java -version` shows 17 or lower | An older Java comes first. | Install Java 21, open a new terminal, check again. |
| PowerShell says running scripts is disabled when you activate the Python venv | Windows blocks scripts by default. | Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, answer `Y`, then activate again. |
| `Rate Limit Reached` on the faucet | The faucet pays once every 24 hours per account and per address. | Wait for the 24 hours to end. One request is enough for every tutorial. |
| The wallet shows no testnet badge | The wallet is still on mainnet. | Phone app: Settings, then **Use testnet (developers)**. Extension: tap the version number 7 times, then **Switch to testnet (diana)**. |
| `account has no PQC key and classical fallback is disabled` | The new account has not registered its ML-DSA-87 key. | Run the tutorial's `register` step first (it is the first transaction of the account). |
| CORS errors in the browser console | The public REST endpoint sends no CORS headers, so a web page cannot call it directly. | Call the endpoint through the project's `/lcd` proxy, as the template does. |

## Next step {#next}

Pick a tutorial from the [overview](/build-before-qday/overview#choose) and follow it from the first command.
