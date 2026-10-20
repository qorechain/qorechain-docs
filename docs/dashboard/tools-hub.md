---
slug: /dashboard/tools-hub
title: Tools Hub
sidebar_label: Tools Hub
sidebar_position: 11
---

# Tools Hub

The **Tools** page gathers QoreChain's operator and builder tooling in one place, in six tabs, in this order: **Validator Program**, **Validator Application**, **Light Node**, **Node Registration**, **Rollups** and **SDK**. The page follows the network switch in the header: chain checks, downloads and node status are read from the network you have selected. Licences are sold on **mainnet only** (see [Light Node](#light-node)).

Sign in to use the tools that record registrations, submit applications or take payment; see [Sign in](/dashboard/overview#sign-in).

## Validator Program

A read-only overview of the **QoreChain Validator Program**, the way validators join the network: what the programme provides (the on-chain operator grant, delegation from Association-controlled stake and a QOR stipend for independent operators who meet the service levels), what it requires, the selection process and a FAQ. Protocol parameters on this tab (unbonding time, slashing, maximum validators) are read live from the chain; programme rules (the 100,000 QOR self-stake, the commission band, the stipend) are the Association's and are marked as such. Validators do not buy a package: they apply, and pay a **$1,000 programme fee** only once selected.

## Validator Application {#validator-application}

Apply to the Validator Program:

1. **Fill in the application.** Entity name, jurisdiction and contact email; the **operator address** (`qor1…`, the account you will run `create-validator` from: the on-chain operator grant is issued to this address); hosting provider, region and type; the networks you already operate; optionally your testnet validator address and the public infrastructure you offer (public RPC, snapshots, archive); the track (standard, or global for the reserved seats); and acceptance of the programme terms. Applying is free.
2. **Review and testnet trial.** The application shows as **Submitted** while it is reviewed. Applications that go forward run a validator on the diana testnet for a 14-day trial, shown as **Testnet trial**.
3. **Selection and the programme fee.** A selected application shows **Selected** with a **Pay $1,000** button. The payment step works as for a light node licence (USDT on ERC-20, BEP-20 or TRC-20, verified on chain). The fee is tied to the operator address in your application; it cannot be paid to another address. Approval and payment are always shown apart: an application can be selected and still unpaid.
4. **The on-chain operator grant.** After payment the Association issues the `validator_operator` grant on chain to your operator address. Grants are signed by hand, in batches, so they are not instant. The tab shows **Operator grant on chain** as soon as the chain has it, and **In the active set** once your validator is bonded.

From the moment an application is in, a **Validator Readiness** panel checks the chain directly for the operator address: a registered post-quantum key, enough spendable QOR for the self-stake, the operator grant and whether the validator is bonded. Run [PQC key registration](/developer-guide/running-a-validator#pqc-key-registration) on your own node early: nothing registers that key for you.

Applications approved under the earlier validator offer (before October 2026) show as **Earlier application**; the Association contacts those applicants directly.

## Light Node {#light-node}

Everything a light node operator needs, from the licence to a node registered on chain.

1. **Buy the licence (mainnet).** A light node licence costs **$50**, paid in USDT on ERC-20, BEP-20 or TRC-20 and verified on chain. Enter the `qor1…` address the licence should be granted to before paying; use an account whose recovery words you hold (your own words, Keplr or `qorechaind`), ideally one used only for the node. With the header set to **testnet**, nothing is for sale: testnet light node licences are free and granted by the QoreChain team.
2. **Wait for the on-chain grant.** After payment the licence shows **Paid, awaiting on-chain grant**; it changes to **Active on chain** only when the chain confirms the `lightnode_operator` grant. Grants are signed by hand, in batches.
3. **Install and register the node.** The tab lists the published builds for your network with their checksums (server edition `lightnode-sx`, desktop edition `lightnode-ux`, on Linux, macOS and Windows) and the steps for the current release: set a keyring passphrase, `lightnode-sx onboard`, `lightnode-sx keys add-operator --recover` (adds the account the licence is for), `lightnode-sx register` (attaches the node's post-quantum key and registers it, adding `--delegate-to <qorvaloper…>` if the address is short of the required stake), then `lightnode-sx start` and `lightnode-sx status`. The steps are shown as current only when the network's release manifest publishes a build that supports them, and the tab says whether registration is open on that network.
4. **Notices for your address.** The tab warns when the licence address is one of your own custodial Dashboard wallets (the Dashboard holds that key, so a node cannot sign with it), and notes when the address already has a post-quantum key on chain (the node reuses it when it was derived from your recovery words, and otherwise refuses and recommends a dedicated account).
5. **Status.** A panel reads the chain: the requirements in force (registration fee, delegated stake, uptime, heartbeat window, maximum light nodes) and, for an address, whether a light node is registered and reporting on time.

See [Light Node Overview](/light-node/overview) and [Registration & Licensing](/light-node/registration-and-licensing).

:::note Licences bought before the address was required
If you bought a licence before the address was collected, the tab opens with **This licence needs a QoreChain address**: enter the address and select **Save address**. Until it is saved the licence cannot be granted.
:::

## Node Registration

Records your validator's details with the Association. It does not create the validator on chain; you do that from your own node with `create-validator`.

The form opens once the chain shows an active `validator_operator` grant for your operator address and you hold a selected Validator Program application (or a validator licence from before the programme). Provide your validator operator address, a moniker, a commission rate between 5% and 20%, and an optional public endpoint, then acknowledge the 100,000 QOR self-stake, the 21-day unbonding period and slashing.

The on-chain steps are in [Running a Validator](/developer-guide/running-a-validator): register your PQC key, then submit `create-validator` with at least 100,000 QOR of self-stake, PQC-cosigned like every QoreChain transaction. Staking and validator creation happen only on QoreChain's native transaction lane; there is no path to register or bond a validator through a linked EVM wallet such as MetaMask. Below the form, the tab also lists what a full node needs (release binary, genesis, peers) from the network's release manifest.

See [Staking & Validators](/dashboard/staking-and-validators).

## Rollups

Request a QoreChain-powered rollup. The form lets you name the rollup and state the virtual machine (EVM, CosmWasm, or SVM), data-availability layer, gas token, sequencer model and settlement target you want. Submitting it records a provisioning request that is reviewed; it does not create the rollup on-chain. The options are broader than what the on-chain rollup module currently supports. To register a rollup on-chain yourself, see [Deploying a Rollup](/rollups/deploying-a-rollup); for the concepts, see [Rollups Overview](/rollups/overview).

## SDK

A quickstart and reference hub for building on QoreChain in code. The section shows installation steps and copy-ready snippets for connecting, deriving accounts across the three runtimes, reading state, sending transfers, and quantum-safe signing, plus a table of language packages and links to the repository, examples, and explorer. See [QoreChain SDK Overview](/sdk/overview) and [Install](/sdk/install).

For how licensing works across the network, see [Chain Licensing](/architecture/chain-licensing).
