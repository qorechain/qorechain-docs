---
slug: /dashboard/tools-hub
title: Tools Hub
sidebar_label: Tools Hub
sidebar_position: 11
---

# Tools Hub

The **Tools** page gathers QoreChain's operator and builder tooling in one place, organized into seven tabs, in this order: **Information**, **Validator Application**, **Buy License**, **Light Node**, **Node Registration**, **Rollups**, and **SDK**. The **Information** tab is a read-only overview of the validator and light-node programs — the three ways to participate (genesis validator, light node, delegator), license tiers, staking and slashing basics, hardware requirements, who operates the program, and a FAQ. The other tabs are summarized below with where they lead for full documentation. The Tools page follows the network switch in the header, because published builds can differ between networks.

Sign in to use the tools that record registrations or submit applications — see [Sign in](/dashboard/overview#sign-in).

## Light Node

Running a light node and joining its rewards program are two different things, and the Light Node tab keeps them separate rather than presenting one sign-up flow:

1. **Get the software — works today.** No license, no on-chain check, and no approval needed; this is shown first regardless of your license status. The tab reads the live network manifest and gives you copy-ready commands for a full QoreChain node (download and verify the binary, initialize the node with genesis, point it at the network's peers, and state-sync instead of syncing from genesis). A light node itself only needs the `lightnode-sx` or `lightnode-ux` binary — see [Light Node Overview](/light-node/overview). Below the commands, **Download the light node** lists the published builds with their sha256 checksums — a **Desktop edition** (includes the web dashboard) and a **Server edition** (headless, command line) across six platforms; check the file against its checksum before running it. If no build is published for the network you have selected, the panel says so.
2. **Check the chain's requirements — Light node status.** This panel reads the live chain parameters (they are governance parameters and can change without this page being edited): the delegated stake required — your total across all the validators you delegate to, not per validator (currently 1,000 QOR) — the registration fee (currently 1 QOR), the uptime needed for rewards, how often a heartbeat is expected (and the grace allowed), and the maximum number of light nodes. You can optionally enter an operator address to see whether a light node is registered to it, whether it is reporting on time, and its accrued rewards.
3. **Rewards enrolment is not open yet.** Joining the light-node reward share needs an active `lightnode_operator` license granted on-chain, the minimum delegated stake, and the registration fee. Enrolment itself is not open (see [Status of the reward program](/light-node/overview#reward-program-status)), and buying a license does not open it early, so there is nothing to sign up for today; run and sync your node in the meantime. Uptime is counted from the block your node registers on-chain, not before.
4. **Registration record.** If your account holds a license that is recorded as active, this tab also shows a short form — operator address (`qor1…`), moniker, public endpoint URL, and an acknowledgement of the stake commitment — and then a summary of what you submitted. That form records your registration request with The Qore Trust on the Dashboard; it does **not** send the on-chain registration transaction, and it does not check the chain. The on-chain registration is made from the node itself with `lightnode-sx register` (see [Registration & Licensing](/light-node/registration-and-licensing)) and succeeds only once the chain shows an active grant, the stake is already bonded from your operator address, and enrolment is open.

For the full picture, see [Light Node Overview](/light-node/overview) and [Registration & Licensing](/light-node/registration-and-licensing).

## Node Registration

The Node Registration tab records a validator registration with The Qore Trust on the Dashboard. It does not itself create the validator on chain; that is done from your own node (steps 1 and 5 below). Prerequisites and steps:

1. **Register your PQC key first — from the CLI, on your own validator node.** A validator must run PQC key registration itself — it does not happen automatically — before applying for or using a license and before creating the validator. See [Running a Validator](/developer-guide/running-a-validator#pqc-key-registration) for the CLI command.
2. **Confirm you're licensed.** The form needs a validator license recorded as active in your account. The **chain** is what decides whether `create-validator` is accepted, and it requires the operator grant on-chain: a license bought through **Buy License** is recorded on our side, and the on-chain grant is a separate, manual step that follows. Check **Validator Readiness** (on the Validator Application tab) to see what the chain currently recognises. If you're not yet licensed, this tab links to **Buy License** — validator licenses require an approved [Validator Application](#validator-application) first.
3. **Fill in the registration form.** Provide your validator address or consensus pubkey, a moniker, a commission rate (within your license's allowed range), and an optional public endpoint. If your licenses include cross-network chains, select which of them this validator will service.
4. **Acknowledge the self-stake requirement.** The validator self-stake floor is a fixed 100,000 QOR — a protocol-level constant, not an adjustable setting — subject to an unbonding period, with downtime or double-signing slashed. Acknowledge it, then submit to register.
5. **Sync and create the validator.** Registering here records your validator; you still bring your node to the current chain tip and submit `create-validator` yourself, hybrid PQC-cosigned like every QoreChain transaction — the key from step 1 is what makes that signature valid.
6. **Confirm and bond stake.** A summary panel shows the registration (moniker, validator address, commission, self-stake intent, cross-network chains, status) and prompts you to bond your self-stake to enter the active validator set. The bonding itself happens on your node with the post-quantum-cosigned transaction, not in the Dashboard.

Staking and validator creation happen only on QoreChain's native transaction lane — there is no path to register or bond a validator through a linked EVM wallet such as MetaMask.

See [Running a Validator](/developer-guide/running-a-validator) and [Staking & Validators](/dashboard/staking-and-validators).

## Rollups

Request a QoreChain-powered rollup. The form lets you name the rollup and state the virtual machine (EVM, CosmWasm, or SVM), data-availability layer, gas token, sequencer model and settlement target you want. Submitting it records a provisioning request that The Qore Trust reviews; it does not create the rollup on-chain. The options are broader than what the on-chain rollup module currently supports. To register a rollup on-chain yourself, see [Deploying a Rollup](/rollups/deploying-a-rollup); for the concepts, see [Rollups Overview](/rollups/overview).

## SDK

A quickstart and reference hub for building on QoreChain in code. The section shows installation steps and copy-ready snippets for connecting, deriving accounts across the three runtimes, reading state, sending transfers, and quantum-safe signing, plus a table of language packages and links to the repository, examples, and explorer. See [QoreChain SDK Overview](/sdk/overview) and [Install](/sdk/install).

## Validator Application {#validator-application}

Apply to become a Genesis Validator:

1. **Enter your entity details.** Legal entity name, country/jurisdiction, and a contact email.
2. **Choose your desired tier.** Pick from the validator tier catalog (each tier lists its slot count and feature set) — this is the tier you intend to license once approved, not a purchase yet.
3. **Describe your infrastructure.** Your infrastructure region and hardware/datacenter details.
4. **Explain your motivation.** A short statement on your team's validator/infrastructure experience and why you want to run a QoreChain Genesis Validator.
5. **Acknowledge compliance and submit.** Confirm that KYC/AML verification of the applicant entity and its beneficial owners is required before a license is granted, then submit.
6. **Track your status.** The tab shows your application as under review, approved, or not approved with a reason (with the option to revise and resubmit). Once your application is pending or approved, a live **Validator Readiness** panel checks three things directly against the chain, not against what you've purchased: your PQC key registration, your self-bond (a fixed 100,000 QOR — spendable balance only, vesting funds don't count), and whether your operator license has actually been granted on-chain and is currently valid (not suspended, and not past its expiry — licences expire at a block height, and if the chain tip cannot be read an expiring licence is reported as *couldn't verify* rather than as valid). Each check reports one of three states — met, not yet met, or *couldn't verify* when the chain can't be reached — and a failed read is never shown as "you don't have this," since that would send you off to redo something you already hold. Once approved, you can proceed to **Buy License** to acquire a validator license.

See [Running a Validator](/developer-guide/running-a-validator).

## Buy License

Acquire the licenses required to run network infrastructure:

1. **Enter the address to license.** The **QoreChain address** field at the top is required for every purchase: type the `qor1…` address the license should be granted to on-chain. Use an address you control and will keep — the grant binds to it, and changing it later needs support. A license cannot be ordered without one.
2. **Choose a payment network.** Under **Pay with USDT on:** select ERC-20, BEP-20, or TRC-20.
3. **Pick what to buy.** A light-node license is available to anyone. Validator licenses (across the tier catalog) unlock only once your [Validator Application](#validator-application) is approved. Cross-network add-ons extend a validator license to additional chains, priced per chain per year — select the chains you want, then buy.
4. **Complete payment.** Each purchase moves you into a payment step that confirms the amount and network and verifies the payment on-chain before the license is recorded as paid.
5. **Wait for the on-chain grant, then register.** After payment the license shows **Paid — awaiting on-chain grant**. Grants are issued by hand, in batches, so they are not instant. The status changes to **Active** only after the chain itself confirms the grant. Registration on the chain checks the chain, not our records, so registering before the grant lands will refuse. Once the badge reads **Active**, return to **Light Node** or **Node Registration** for the matching registration.

:::note Licenses bought before the address was required
If you bought a license before the address was collected, the Buy License tab opens with **This licence needs a QoreChain address** — enter the address and select **Save address**. Until it is saved the license cannot be granted.
:::

For how licensing works across the network, see [Chain Licensing](/architecture/chain-licensing).
