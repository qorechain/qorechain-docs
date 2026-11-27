---
slug: /appendix/faq
title: FAQ
sidebar_label: FAQ
sidebar_position: 5
---

# Frequently Asked Questions

General questions about QoreChain, answered from the documentation. Each answer links to the authoritative page for full detail. For SDK-specific questions, see the [SDK FAQ](/sdk/faq).

### Is mainnet live?

Yes. QoreChain mainnet (chain `qorechain-vladi`, EVM chain ID 9801) has been live since 7 June 2026 and runs release v3.2.8 (applied at height 4,273,000 on 18 November 2026 by governance proposal 17; v3.2.7 had been applied at height 4,164,600 on 12 November 2026 by proposal 16); the testnet, `qorechain-diana`, has run v3.2.9 since 20 November 2026, after v3.2.8 from 12 November (v3.2.9 at height 10,424,000; v3.2.8 at height 9,929,500). See [Networks](/appendix/networks) and [Connecting to Mainnet](/getting-started/connecting-to-mainnet).

### What are the chain IDs and EVM chain IDs?

Mainnet is Cosmos chain `qorechain-vladi` with EVM chain ID **9801** (hex `0x2649`); testnet is `qorechain-diana` with EVM chain ID **9800** (hex `0x2648`). See [Networks](/appendix/networks) for the full table.

### How are transaction fees distributed?

Collected fees are split **37% to validators, 30% burned, 20% to the community treasury, 10% to stakers, and 3% to light nodes**. The split applies to everything in the fee collector, which includes the epoch emission. See [Tokenomics](/architecture/tokenomics#fee-distribution).

### What is PRISM?

PRISM is the reinforcement-learning optimization layer embedded in the QoreChain Consensus Engine. It observes network metrics and proposes deterministic consensus-parameter adjustments under circuit-breaker safety controls. Today it runs in observation mode: no trained policy is loaded, so it does not change any parameter. See [PRISM Consensus Engine](/architecture/prism-consensus-engine).

### Is the cross-chain bridge live?

No. The bridge module is deployed, but all 37 chain configurations are pending, no bridge validators are registered and no IBC channel exists on mainnet (the testnet has a single ICS-20 transfer channel to a test chain, opened for IBC testing, and none to the planned counterparties). It is designed around 37 chain configurations and up to 8 IBC counterparties; treat the targets as design intent. See [Bridge Architecture](/architecture/bridge-architecture).

### How do I connect a wallet?

Use the official [QoreX](/qorex/overview) wallet, or add a QoreChain network to an EVM wallet using the EVM chain IDs (9801 mainnet, 9800 testnet). See [Wallet Setup](/getting-started/wallet-setup).

### How do I get testnet tokens?

Use the testnet faucet on the Dashboard. See [Dashboard Faucet](/dashboard/faucet) and [Connecting to Testnet](/getting-started/connecting-to-testnet).

### What are fUSD, fETH and fBTC?

Testnet-only test tokens (FestUSD, FestETH and FestBTC, with 6, 18 and 8 decimals) created for the builder fest. They have no value, do not exist on mainnet, and are held as bank coins with the case-sensitive denominations `erc20:<contract address>`. The testnet Faucet can send them with a QOR claim. See [Fest test tokens](/dashboard/faucet#fest-tokens).

### How do I run a node, validator, or light node?

For a full node, see [Running a Node](/developer-guide/running-a-node). For a validator, see [Running a Validator](/developer-guide/running-a-validator). For a light node, see [Light Node](/light-node/overview); registration for the light-node reward program is open and licence-gated, and on 27 October 2026 one light node was registered on each network ([status](/light-node/overview#reward-program-status)).

### What signature scheme does QoreChain use?

QoreChain uses a post-quantum hybrid scheme combining classical **secp256k1 (ECDSA)** with post-quantum **ML-DSA-87 (Dilithium-5)**. This hybrid scheme is required by default on the Cosmos transaction path, with enforcement mode governance-controlled. On the EVM lane the signature stays secp256k1, and an account must additionally hold a registered ML-DSA key and an open authorisation window (since v3.2.0). An account is post-quantum protected only after it has registered its ML-DSA-87 key; that first registration is signed with the classical key alone (the documented bootstrap), so register it before the account holds meaningful funds. See [Post-Quantum Security](/architecture/post-quantum-security).

### Why is my EVM transaction refused with "no open EVM authorisation window"?

Since v3.2.0 the EVM lane admits a transaction only from an account that has a registered post-quantum key and an open authorisation window. Open a window with a Cosmos-lane transaction with a hybrid ML-DSA-87 signature (FIPS 204), then retry. See [EVM authorisation window](/getting-started/first-transaction#evm-window).

### How many validators does mainnet have?

Eight bonded validators on 27 October 2026, with about 60.3 million QOR bonded (the active set can hold up to 100). The testnet has four. Read the live set at `GET /cosmos/staking/v1beta1/validators` on `https://api.qore.host`.

### Which block time should I expect?

About 3.1 seconds on mainnet and about 1.3 seconds on the testnet (measured averages, 27 October 2026). Block time is set by the validators' node configuration.

### Is xQORE available?

Not yet. The accounting module exists, but lock and unlock transactions are not wired into the live networks. See [Tokenomics](/architecture/tokenomics#x-xqore).

### Is the QOR supply fixed?

Genesis supply was 4,420,000,000 QOR. Staking emission is minted under a hard cumulative cap of 590,000,000 QOR (86,000 QOR per epoch since governance proposal 10, October 2026), and burns remove tokens permanently. See [Tokenomics](/architecture/tokenomics#supply-and-emission).

### How do I build a rollup?

Use the QoreChain Rollup Development Kit. See [Rollups](/rollups/overview) and the [Rollup Development Kit](/architecture/rollup-development-kit) architecture reference.

### How do I build a dApp?

Use the [QoreChain SDK](/sdk/overview), the public SDK for building applications on QoreChain across its EVM, SVM, and QoreChain Native execution environments.

### Where can I ask questions?

The QCAIA community bot answers questions on Discord ([discord.gg/qorechain](https://discord.gg/qorechain)) and Telegram ([t.me/QoreChainCommunity](https://t.me/QoreChainCommunity)). See [QCAIA Community Bot](/qcaia/overview).


### Is there a second, independently operated EVM RPC for the testnet? {#testnet-second-evm-rpc}

Not today. `https://evm-testnet.qore.host` is the only public EVM JSON-RPC for `qorechain-diana`, and the public testnet endpoints are run by the QoreChain team. Comparing them checks different interfaces, not independent operators.

For a truly independent check, run your own testnet node with JSON-RPC enabled and query it directly. [Connecting to Testnet](/getting-started/connecting-to-testnet) has the binary, genesis, peers and state sync. Use state sync: the public sentry keeps only recent blocks.

For quick cross-checks you can use the consensus RPC `https://rpc-testnet.qore.host` (blocks, transactions by hash), REST `https://api-testnet.qore.host` (accounts, balances, module state), the EVM WebSocket `wss://evm-ws-testnet.qore.host`, and the explorer at [explore.qore.network](https://explore.qore.network), switched to Testnet.

### What happens if I open a new EVM window while one is still active? {#new-evm-window}

The new window replaces the active one, so you do not need to close the old one first. An account has one window at a time.

The new window starts with `usedTxs` and `usedValue` at zero. Its expiry, `maxTxs` and `maxValue` come only from the new message. Nothing carries over from the old window.

The scope is replaced in full too. If the new message lists `allowed_targets`, the window allows only transactions to those addresses and refuses contract creation, so finish your deployments before you open such a window. If the new message has no list, the new window has none, even if the old one had one. After you broadcast, check the result with the EVM window query or in the `pqc_evm_window_opened` event. See [EVM window reference](/developer-guide/evm-window-reference).

### How do I get my CosmWasm contract stored and allowed for cross-VM calls on the testnet? {#testnet-cosmwasm-allowlist}

On the testnet, uploading CosmWasm code goes through governance. Submit a proposal that opens code upload, stores your code and closes upload again, in the same form as earlier proposals that passed (for example 27 and 50). Publish the source, a reproducible build and the sha256 of the wasm file so others can check it. A regular proposal needs a 10 QOR deposit and has a 4 hour vote. An expedited one needs 50 QOR, has a 1 hour vote and needs a higher share of yes votes.

When the code is stored and your contract is instantiated, a second proposal adds it to the cross-VM allowlist (`bridge_allowed_targets`, with a pin in `bridge_target_pins`), as proposal 40 did. A contract with an admin other than governance must be pinned. That proposal replaces all the parameters of the module, so copy the current values from `https://api-testnet.qore.host/qorechain/crossvm/v1/params` and add your entry. The contract must already exist when the proposal executes.

Post the proposal number in the fest builders channel when you submit it, so the testnet validators can review it and vote before voting ends. The full steps, with the exact files and commands, are in [Governance proposals for contracts](/developer-guide/governance-proposals-contracts).

## Related

* [Networks](/appendix/networks) — chain IDs, ports, and endpoints reference.
* [What is QoreChain](/introduction/what-is-qorechain) — the platform overview.
* [QCAIA Community Bot](/qcaia/overview) — ask questions on Discord and Telegram.
