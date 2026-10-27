---
slug: /dashboard/tools-hub
title: Nodes & Validators
sidebar_label: Nodes & Validators
sidebar_position: 11
---

# Nodes & Validators

The **Nodes & Validators** page (sidebar **Build** group, address `/tools`; it was called Tools and Tools Hub before 27 October 2026) is the operator page of the Dashboard. It has five tabs, in this order: **Validator Program**, **Validator Application**, **Light Node**, **Node Registration** and **Rollups**. It is for people who want to run a validator or a light node, or to ask for an application rollup. The SDK tab moved to the public [Developers](/dashboard/developers) page, which also holds the builder tools (PQC key status, simulator, signing playground, QoreX test wallet).

## Innovations {#innovations}

- **Chain checks come from the chain.** The **Validator Readiness** panel checks four things on the selected network: a registered ML-DSA-87 key, spendable QOR for the self-stake (vesting excluded), the on-chain operator grant, and whether the validator is bonded. The **Light node status** panel reads the requirements in force (registration fee, delegated stake, uptime, heartbeat window, maximum light nodes) and the address's registration and heartbeat state.
- **"Paid" and "granted on chain" are separate facts.** A paid licence shows **Paid, awaiting on-chain grant** until the chain confirms the grant, then **Active on chain**. The tab never shows a licence as active before the chain has the grant.
- **Protocol rules and programme rules are labelled apart.** Each parameter row says whether it comes from the protocol (read from the chain) or the programme (applied by the Association).
- **A self-service testnet light node licence.** Enter a `qor1...` address under **Free testnet licence** and select **Request licence**; the grant is signed automatically, usually within minutes. Mainnet grants stay manual.
- **Node steps follow the network's release manifest.** Downloads (server edition `lightnode-sx`, desktop edition `lightnode-ux`, per platform, with SHA-256 checksums), whether registration is open, and whether the steps are current all come from the manifest.

## How to use {#how-to-use}

Prerequisite for every tab: sign in. The tabs follow the network switch in the header (chain checks, downloads and node status are read from the selected network). Signed out, the page shows "Authentication Required". See [Sign in](/dashboard/overview#sign-in).

### Validator Program {#validator-program}

A read-only overview of the **QoreChain Validator Program**, the way validators join the network: what the programme provides (the on-chain operator grant, delegation from Association-controlled stake and a QOR stipend for independent operators who meet the service levels), what it requires, the selection process and a FAQ. It has **Apply** and **Ask a question** buttons. Protocol parameters (unbonding time, slashing, maximum validators) are read live from the chain; programme rules (the 100,000 QOR self-stake, the commission band, the stipend) are the Association's and are marked as such. Validators do not buy a package: they apply, and pay a **$1,000 programme fee** only once selected. For stipend amounts see the tab itself.

### Validator Application {#validator-application}

1. **Fill in the application.** Entity name, jurisdiction and contact email; the **operator address** (`qor1...`, the account you will run `create-validator` from; the on-chain operator grant is issued to this address); hosting provider, region and type; the networks you already operate; optionally your testnet validator address (`qorvaloper1...`) and the public infrastructure you offer (public RPC, snapshots, archive); the track (Standard, or Global for the reserved seats); and acceptance of the programme terms. Select **Submit application**. Applying is free.
2. **Review and testnet trial.** The application shows as **Application submitted**, then, for applications that go forward, **Testnet trial** (a 14-day trial running a validator on `qorechain-diana`). A rejected one reads **Not selected**, with **Apply again**.
3. **Selection and the programme fee.** A selected application shows **Selected** with a **Pay the $1,000 programme fee** button. Choose the network (USDT on ERC-20, BEP-20 or TRC-20), pay the exact amount shown, paste the transaction hash and select **Verify payment**; the payment is verified on chain. The fee is tied to the operator address in your application and cannot be paid to another address. Approval and payment are shown apart: an application can be selected and still unpaid. After payment the card reads "Programme fee paid".
4. **The on-chain operator grant.** After payment the Association issues the `validator_operator` grant on chain to your operator address. Mainnet grants are signed by hand, in batches, so they are not instant. The tab shows **Operator grant on chain** as soon as the chain has it, and **In the active set** once your validator is bonded.
5. **Readiness.** For submitted, trial, selected and granted applications the **Validator Readiness** panel (with an address field) checks the chain for the operator address. Run [PQC key registration](/developer-guide/running-a-validator#pqc-key-registration) on your own node early: nothing registers that key for you.

Applications approved under the earlier validator offer (before October 2026) show as **Earlier application**; the Association contacts those applicants directly.

### Light Node {#light-node}

Everything a light node operator needs, from the licence to a registered node.

1. **Buy the licence (mainnet).** A light node licence costs **$50**, paid in USDT on ERC-20, BEP-20 or TRC-20 and verified on chain. Enter the `qor1...` address the licence should be granted to, choose the USDT network and select **Buy for $50**; use an account whose recovery words you hold (your own words, Keplr or `qorechaind`), ideally one used only for the node. After paying, the card reads **Payment received** and the on-chain grant follows. **Your past orders** are listed below.
2. **Wait for the on-chain grant.** The licence shows **Paid, awaiting on-chain grant**, then **Active on chain** when the chain confirms the `lightnode_operator` grant. Mainnet grants are signed by hand, in batches.
3. **Install and register the node.** The tab lists the published builds for your network with their checksums and the steps for the current release: set a keyring passphrase, `lightnode-sx onboard`, `lightnode-sx keys add-operator --recover` (adds the account the licence is for), `lightnode-sx register` (attaches the node's post-quantum key and registers it; add `--delegate-to <qorvaloper...>` if the address is short of the required stake), then `lightnode-sx start` and `lightnode-sx status`. The steps are shown as current only when the network's release manifest publishes a build that supports them, and the tab says whether registration is open.
4. **Notices for your address.** The tab warns when the licence address is one of your own custodial Dashboard wallets ("This address cannot run a node": the Dashboard holds that key), and notes when the address already has a post-quantum key on chain (the node reuses it when it was derived from your recovery words, and otherwise refuses and recommends a dedicated account).
5. **Status.** A panel shows the requirements in force and whether a light node is registered and reporting on time. States include "Registered, waiting for its first heartbeat", "Rewards accrued" and a notice when the node has been marked inactive.

#### Free testnet licence {#testnet-licence}

On testnet (`qorechain-diana`) nothing is sold ("Nothing is sold on testnet") and a light node licence is free and self-service:

1. Set the header to **Testnet** and open the **Light Node** tab.
2. Under **Free testnet licence**, enter your `qor1...` address and select **Request licence**.
3. The request reads "Requested for ...", then "Granted to ... You can register your node now." If the grant could not be signed, the tab says so and you can request again.

Grants are signed automatically, usually within minutes. There is one request per account and one per address. **Minimal example:** Testnet, **Light Node**, **Request licence**, wait for "Granted to ...", then run `lightnode-sx onboard` through `register`.

See [Light Node Overview](/light-node/overview) and [Registration & Licensing](/light-node/registration-and-licensing).

:::note Licences bought before the address was required
If you bought a licence before the address was collected, the tab opens with **This licence needs a QoreChain address**: enter the address and select **Save address**. Until it is saved the licence cannot be granted.
:::

### Node Registration {#node-registration}

Records your validator's details with the Association. It does not create the validator on chain; you do that from your own node with `create-validator`. The tab is locked until the grant is on chain.

The form opens once the chain shows an active `validator_operator` grant for your operator address and you hold a selected Validator Program application (or a validator licence from before the programme). Provide the operator address, a **Moniker**, a **Commission** between 5% and 20%, and an optional endpoint, tick the acknowledgement (the 100,000 QOR self-stake, the 21-day unbonding period and slashing) and select **Register validator**.

The on-chain steps are in [Running a Validator](/developer-guide/running-a-validator): register your PQC key, then submit `create-validator` with at least 100,000 QOR of self-stake, PQC-cosigned like every QoreChain transaction. Staking and validator creation happen only on the native transaction lane; there is no path to register or bond a validator through a linked EVM wallet such as MetaMask. Below the form the tab lists what a full node needs (release binary, genesis, peers) from the release manifest, and may show a "Joining is temporarily suspended" banner when the network is not accepting new validators. See [Staking & Validators](/dashboard/staking-and-validators).

### Rollups {#rollups}

The tab is titled **Request a Rollup**. Fill in the form: a name, the virtual machine (EVM, QoreChain Native or SVM), the data-availability layer (QoreChain DA, Celestia or EigenDA), the gas token, the sequencer (Shared sequencer, Dedicated (single) or Decentralized) and the settlement target (QoreChain mainnet or Ethereum), then select **Request deployment**. This only records a request, which is listed below the form with its status; nothing is created on chain at that step. The options are broader than what the on-chain rollup module supports today. To register a rollup on chain yourself, see [Deploying a Rollup](/rollups/deploying-a-rollup); for the concepts, see [Rollups Overview](/rollups/overview).

## How to access {#how-to-access}

- **URL:** [dashboard.qorechain.io/tools](https://dashboard.qorechain.io/tools), or **Nodes & Validators** in the sidebar **Build** group.
- **Sign-in:** required for the whole page, on both networks.
- **Network:** follow the header. The $50 licence purchase is mainnet only; the free licence is testnet only.
- **Costs:** applying is free; the validator programme fee is $1,000 and is paid only after selection; a mainnet light node licence is $50; the testnet licence is free.
- **Wallet:** an account whose recovery words you hold for the node; no wallet is needed to read the tabs.

## Where it is published {#where-published}

| Surface | Address | Networks |
| --- | --- | --- |
| Nodes & Validators | `dashboard.qorechain.io/tools` | Mainnet and testnet, header switch |
| Node downloads and checksums | The Light Node tab | Per network release manifest |
| SDK and builder tools | [Developers](/dashboard/developers) | Both |

## Limits and known issues {#limits}

- **Mainnet grants are manual,** signed in batches, so a paid licence waits in "Paid, awaiting on-chain grant". Testnet grants are automatic.
- **One free testnet request** per account and per address.
- **Rollups is a request form on both networks;** it creates nothing on chain.
- **Joining as a validator can be paused** (the "Joining is temporarily suspended" banner).
- **The USDT receiving details and any stipend amounts** are shown only inside the tabs at the time of payment or application.

For how licensing works across the network, see [Chain Licensing](/architecture/chain-licensing).
