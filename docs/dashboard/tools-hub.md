---
slug: /dashboard/tools-hub
title: Tools Hub
sidebar_label: Tools Hub
sidebar_position: 11
---

# Tools Hub

The **Tools** page gathers QoreChain's operator and builder tooling in one place, organized into tabs. From here you can register infrastructure, deploy a rollup, reach the SDK, apply to become a validator, and acquire the licenses these roles require. Each section is summarized below with where it leads for full documentation.

Connect your wallet to use the tools that register infrastructure or submit applications — see [Overview & Getting Started](/dashboard/overview#connect-your-wallet).

## Light Node

Running a light node and joining its rewards program are two different things, and the Light Node tab keeps them separate rather than presenting one sign-up flow:

1. **Bring your node up — works today.** No license, no on-chain check, and no approval needed; this is shown first regardless of your license status. It reads the live network manifest and gives you copy-ready commands to download and verify the binary, initialize the node with genesis, point it at the network's peers, and state-sync instead of syncing from genesis.
2. **Check your rewards-program status.** Joining the light-node reward share is a separate, on-chain-gated step: an active `lightnode_operator` license granted on-chain, a minimum amount of QOR delegated — your total across all the validators you delegate to, not per validator, read live from staking — and a small on-chain registration fee. **Enrollment is not open yet**, and buying a license does not open it early, so there is nothing to sign up for today; this tab shows the requirement as a status to check rather than a form to submit until it opens.
3. **Register once your license is granted on-chain.** A license purchased through **Buy License** is recorded on our side first — the on-chain grant is a separate step, and registration refuses until that grant lands (see the note on Buy License below). Once it has landed, this tab replaces the status panel with a registration form: your operator address (`qor1…`), a moniker, and a public endpoint URL, plus an acknowledgement of the stake commitment.
4. **Confirm and bond stake.** After submitting, a summary panel confirms the registration (moniker, operator address, endpoint, stake intent, status) and prompts you to bond the acknowledged stake from your operator address once eligibility opens.

For the full picture, see [Light Node Overview](/light-node/overview) and [Registration & Licensing](/light-node/registration-and-licensing).

## Node Registration

The Node Registration tab registers a validator node on-chain:

1. **Register your PQC key first — from the CLI, on your own validator node.** This is not automatic the way it is for a regular account's first transaction: a validator must run PQC key registration itself, before applying for or using a license and before creating the validator. See [Running a Validator](/developer-guide/running-a-validator#pqc-key-registration) for the CLI command.
2. **Confirm you're licensed.** An active validator license is required before you can register here. A license purchased through **Buy License** is recorded on our side; the on-chain grant is a separate step, and registration refuses until that grant lands. If you're not yet licensed, this tab links to **Buy License** — validator licenses require an approved [Validator Application](#validator-application) first.
3. **Fill in the registration form.** Provide your validator address or consensus pubkey, a moniker, a commission rate (within your license's allowed range), and an optional public endpoint. If your licenses include cross-network chains, select which of them this validator will service.
4. **Acknowledge the self-stake requirement.** The validator self-stake floor is a fixed 100,000 QOR — a protocol-level constant, not an adjustable setting — subject to an unbonding period, with downtime or double-signing slashed. Acknowledge it, then submit to register.
5. **Sync and create the validator.** Registering here records your validator; you still bring your node to the current chain tip and submit `create-validator` yourself, hybrid PQC-cosigned like every QoreChain transaction — the key from step 1 is what makes that signature valid.
6. **Confirm and bond stake.** A summary panel shows the registration (moniker, validator address, commission, self-stake intent, cross-network chains, status) and prompts you to bond your self-stake to enter the active validator set.

Staking and validator creation happen only on QoreChain's native transaction lane — there is no path to register or bond a validator through a linked EVM wallet such as MetaMask.

See [Running a Validator](/developer-guide/running-a-validator) and [Staking & Validators](/dashboard/staking-and-validators).

## Rollups

Deploy your own QoreChain-powered rollup. The configuration form lets you name the rollup and choose its virtual machine (EVM, CosmWasm, or SVM), data-availability layer, gas token, sequencer model, and settlement target. After you submit, the rollup is provisioned following review before it goes live. See [Rollups Overview](/rollups/overview) and [Deploying a Rollup](/rollups/deploying-a-rollup).

## SDK

A quickstart and reference hub for building on QoreChain in code. The section shows installation steps and copy-ready snippets for connecting, deriving accounts across the three runtimes, reading state, sending transfers, and quantum-safe signing, plus a table of language packages and links to the repository, examples, and explorer. See [QoreChain SDK Overview](/sdk/overview) and [Install](/sdk/install).

## Validator Application {#validator-application}

Apply to become a Genesis Validator:

1. **Enter your entity details.** Legal entity name, country/jurisdiction, and a contact email.
2. **Choose your desired tier.** Pick from the validator tier catalog (each tier lists its slot count and feature set) — this is the tier you intend to license once approved, not a purchase yet.
3. **Describe your infrastructure.** Your infrastructure region and hardware/datacenter details.
4. **Explain your motivation.** A short statement on your team's validator/infrastructure experience and why you want to run a QoreChain Genesis Validator.
5. **Acknowledge compliance and submit.** Confirm that KYC/AML verification of the applicant entity and its beneficial owners is required before a license is granted, then submit.
6. **Track your status.** The tab shows your application as under review, approved, or not approved with a reason (with the option to revise and resubmit). Once your application is pending or approved, a live **Validator Readiness** panel checks three things directly against the chain, not against what you've purchased: your PQC key registration, your self-bond (a fixed 100,000 QOR — spendable balance only, vesting funds don't count), and whether your operator license has actually been granted on-chain. Each check reports one of three states — met, not yet met, or *couldn't verify* when the chain can't be reached — and a failed read is never shown as "you don't have this," since that would send you off to redo something you already hold. Once approved, you can proceed to **Buy License** to acquire a validator license.

See [Running a Validator](/developer-guide/running-a-validator).

## Buy License

Acquire the licenses required to run network infrastructure:

1. **Enter the address to license.** Provide the `qor1…` address the license should be granted to on-chain — use the address you'll actually operate the node with, since that's the one the network checks.
2. **Choose a payment network.** Select USDT on ERC-20, BEP-20, or TRC-20.
3. **Pick what to buy.** A light-node license is available to anyone. Validator licenses (across the tier catalog) unlock only once your [Validator Application](#validator-application) is approved. Cross-network add-ons extend a validator license to additional chains, priced per chain per year — select the chains you want, then buy.
4. **Complete payment.** Each purchase moves you into a payment step that confirms the amount and network and verifies the payment on-chain before the license is marked active in our records.
5. **Wait for the on-chain grant, then register.** A license shown as active here has been recorded on our side — the grant that makes it recognized on-chain is a separate step. Registration checks the chain, not our records, so registering before the grant lands will refuse. Once the grant is confirmed, return to **Light Node** or **Node Registration** to complete the matching on-chain registration.

For how licensing works across the network, see [Chain Licensing](/architecture/chain-licensing).
