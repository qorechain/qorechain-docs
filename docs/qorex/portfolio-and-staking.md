---
slug: /qorex/portfolio-and-staking
title: Portfolio & Staking
sidebar_label: Portfolio & Staking
sidebar_position: 4
---

# Portfolio & Staking

This page covers the Portfolio view and staking in QoreX: delegating QOR to validators, claiming rewards, moving stake, unstaking and time-locked staking. It is for anyone holding QOR in the mobile app, the browser extension or the Safari extension.

## Innovations {#innovations}

- **Figures from the chain.** The unbonding period and the base yield are read from the network, not fixed in the wallet.
- **Moves the network would refuse are caught first.** Move stake greys out what cannot be moved and says why, before a fee is spent.
- **Rewards can go to another account of the same wallet,** and only there.
- **No invented zeros.** When the network does not answer, QoreX shows the last values it was given, with their time, or a dash.

## Portfolio

The **Portfolio** view (biometric-gated the first time you open it each session) shows an **allocation donut** - your QOR unified across its three lanes (Native, EVM, SVM) - with a caption under the ring, plus a row for each asset. Percentages appear once the price feed is live, and each balance shows its estimated value in USD alongside the QOR amount. On **testnet**, QOR is shown with **no USD value** - test tokens have none.

Use **+ Coin or token** to add coins and tokens before you hold any, and **Receive** to get their addresses - see [Coins and tokens](/qorex/send-and-receive#coins-and-tokens).

**Where the price comes from.** QoreX reads it from `GET https://api.qore.network/v1/price/{symbol}` - a public endpoint of ours, not a direct call to any exchange. Nothing on your device talks to a price source outside QoreChain's own infrastructure, so your IP address is never exposed to one. If a defensible price genuinely isn't available, the endpoint responds with an error rather than guessing - QoreX shows the price as unavailable rather than ever displaying a fabricated zero or stale figure as if it were current.

Tap any asset to open **Asset detail**, which shows:

- **Balance history** - a real trend built from your on-chain transfers.
- **Recent activity** - transaction rows with reverse **@handle** lookup, so counterparties show by name where possible. Tap any row to open its full detail: amount, counterparty, block, transaction hash, and signature.

The **QOR** page lists every transaction of the account, incoming and outgoing, with **Show more** at the bottom. For all kinds of transaction, pending and failed states and CSV export, see [History](/qorex/send-and-receive#history). On testnet, QOR has no dollar value on Home or in Portfolio.

## When the network is slow or not answering {#network-status}

- **Network status banner.** QoreX checks the time of the latest block on the chain. If it is more than a minute old, a banner says *"The network is slow: the latest block is \{seconds\} seconds old. Transactions may take longer."* If no node answers, it says *"Cannot reach the network right now. Balances may be out of date."* It is the chain's own block time, not a status page.
- **Last known values.** When the network does not answer (for example while a node is re-indexing or after an update), the extension's account card and the app's Home and Staking screens keep showing the last balance and delegations the network gave for that account, and say so: *"The network is not answering. These are the last known values, from \{time\}."* No dollar value is put on an old balance.
- **Rewards that could not be read** show a dash, not 0 QOR, and **Claim** is not offered for them.

## Staking & Earn {#staking}

Staking QOR helps secure QoreChain and earns you rewards, which are not guaranteed. All staking operations are real on-chain transactions on the hybrid-signed native lane: each is signed twice, with a classical key and with ML-DSA-87 (FIPS 204). Staking never goes through an EVM precompile.

### Where staking lives {#staking-screens}

- **App:** the **Stake** screen shows your total, your rewards with **Claim** and, below, the validators. Extra controls such as claim and restake, rewards address and locks scroll with the list. The table of staking tiers is folded to one line: tap to open it.
- **Extension and Safari:** **Staking** is a menu, and each action opens its own screen with a one-line explanation, its own error messages and **Back to staking**: **Stake QOR**, **Unstake**, **Move stake**, **Claim**, **Claim & restake**, **Lock for a bonus** and **Rewards go to**. **Claim** is always listed. An account selector appears when you have several accounts.

### Stake with a validator

1. Open **Stake**.
2. Choose a validator from the list (loaded live from the chain, smallest stake shown first, with any validator currently jailed left out - delegating to one is never what you want). Validators you already have QOR with carry a *staked* badge.
3. Enter an amount. While you type, QoreX warns you if what would be left would not cover the next network fee: *"This leaves \{remaining\} QOR - less than the \{fee\} QOR a transaction costs. You would not be able to unstake or claim rewards until this account holds QOR for the fee again."* It is a warning, not a block - it is your money - but unstaking and claiming both cost a fee from your **liquid** balance, so staking down to nearly nothing locks the stake until someone sends QOR in.
4. **Confirm** (biometrics on mobile). You can stake vesting QOR, up to your total, but the network fee must come from your **unlocked** QOR - vesting QOR cannot pay fees.
5. Claim rewards whenever they accrue - see below.

On a first transaction from an account, staking screens say that it also registers the account's ML-DSA-87 key (a one-time network fee).

:::note Ordinary delegation has no lock-in period; the wait is only on the way out
An ordinary delegation has no fixed term: it stays active, with rewards flowing from the next block, until you ask to undelegate. There is no expiry to renew and no minimum stake duration. The only waiting period is on exit: once you undelegate, that QOR sits in an **unbonding period**, earning nothing and unmovable, before it is back in your spendable balance. QoreX reads the length of that period from the network and shows it before you confirm (21 days on QoreChain at the time of writing; if it cannot be read, QoreX says *the period the network sets*). Moving a delegation to a different validator instead (redelegate) skips that wait entirely. Time-locked staking is optional, see [Staking locks](#staking-locks) below. See also [Is there a lock-in period?](/user-guide/staking-and-delegation#lock-in-period).
:::


### Staking locks {#staking-locks}

Staking locks are in the app and the extensions, including Safari. A lock is optional. It commits part of your stake for 3, 6 or 12 months in return for a bonus.

- **The bonus shown is the one the lock earns today**, under the ceiling the network sets. It can change as network conditions change, and it is not guaranteed.
- **The tier schedule is labelled "up to"**, with today's figure shown beside it.
- **Unlocking early** sits behind a second confirmation that names the cost before you sign.
- **Unstake and Move stake are limited to the unlocked part** of your stake.

For how the module works on chain, see [Time-locked staking](/user-guide/staking-and-delegation#time-locked-staking).

### Move stake between validators (redelegate) {#move-stake}

Move QOR you already have staked to a different validator - or split it across several - without going through the unbonding queue at all. The stake keeps earning rewards the whole way across.

**Extension and Safari** (Stake → **Move stake**) walk you through three steps:

1. **Move from.** Pick the validator your stake is leaving. Each one shows *Staked \{held\} QOR · can move \{free\} QOR* (and any locked amount). A validator you cannot move out of yet is greyed out with the date: *"Can move from here again after \{date\}: stake you moved here must arrive first."*
2. **Move to.** Pick one or more destinations. A pair that already has the maximum number of moves in progress is switched off (*"\{n\} moves in progress, the chain allows \{max\}"*).
3. **How much.** Enter the amount, or tap **Max** (the free, unlocked amount on the source). The route (*From ... to ...*) and, for several destinations, the split (*\{amount\} QOR to each of \{n\} validators*) are shown before the button. Any error and the network's answer appear next to the button.

**App:** open **Stake**, tap the validator your QOR is with and choose **Move stake**. The same checks run on the validator you open. Pick one or several destinations, enter the amount (it has its own field and **Max**), check the split and confirm with biometrics.

Splitting across several divides the amount equally, and every destination moves in a **single transaction** - one fee, and either the whole move lands or none of it does.

This is the move to make when a validator you're delegated to gets jailed or raises its commission: moving costs no wait and no lost rewards.

:::caution Rules of the chain that can refuse a move
- **7 moves in progress per pair.** The chain allows at most 7 redelegations in progress at once for the same (source, destination) validator pair.
- **Moved stake cannot move on at once.** Stake you have just moved **into** a validator cannot be moved **onward** from that validator until the move that brought it there has completed (the network's unbonding period). You can still unstake it, or move stake that was already with that validator.

QoreX checks both before you sign. If the network still refuses a move, QoreX says why in words rather than with a code; a move refused on chain has still paid the network fee, so do not retry it without waiting.
:::

### Claim, and Claim & restake {#claim}

- **Claim** collects your rewards into your balance. QoreX claims only from validators that actually have rewards waiting.
- **Claiming that costs more than it brings.** If the claim fee is larger than your rewards, the first tap warns you and the button changes to **Claim anyway**. Rewards keep growing if you wait.
- **Claim & restake** (button *Claim & restake*: "Compound \{amount\} QOR back to the same validators, in one transaction.") claims and delegates the rewards straight back to the validators that earned them - one transaction, one fee. It is offered only when QoreX can read the per-validator breakdown. One transaction can cover **at most 127 validators**; with more than that, QoreX says so and signs nothing.
- **Fee check.** The fee is paid *before* the rewards arrive. If your unlocked QOR cannot cover it, QoreX stops before you sign and says how much is needed ("Claiming needs about \{fee\} QOR unlocked for the network fee - it is paid before the rewards arrive."); send a little QOR to that address and try again. Vesting QOR cannot pay fees.

### Choose where rewards go {#rewards-address}

By default rewards go to the account that earned them. You can send **future** rewards to **another account of the same wallet**, and only there.

1. App: on **Stake**, open **Rewards go to**. Extension and Safari: **Staking → Rewards go to**. You see where rewards go now.
2. Choose **Change where rewards go** and pick one of your accounts.
3. The first tap names the account in full (*"Future rewards go to \{name\}. Tap again to sign."*); the second signs it (hybrid signature, normal network fee; biometrics in the app).

Your stake does not move. QoreX works out your own addresses from your recovery phrase, so it cannot be pointed at an address outside the wallet, and websites cannot request this change. If rewards already go to an address outside your wallet, QoreX points this out and offers to send them to one of your accounts instead.

### Gas price and transaction size {#gas}

QoreX reads the network's current minimum gas price. If the network raises it, QoreX pays above the new minimum; the prices built into the wallet remain the floor. The fee shown in a review is the fee that gets signed. QoreChain accepts at most **50,000,000 gas** in one transaction: a larger one is refused before anything is signed and no fee is taken, so split it into smaller parts (for example, claim from fewer validators at a time).

### Undelegate

1. Open **Stake** and tap the validator. If you have QOR with it, the panel offers **Unstake** (and **Move stake**).
2. Enter the amount. The panel shows how much you have with that validator and, above the **Unstake** button, how long unstaking takes (*"Unstaking takes \{days\} before the QOR is yours to move."*, with the period read from the network) - you see the wait before you confirm.
3. Confirm with biometric approval. The QOR stops earning immediately and becomes spendable again after the unbonding period completes.

### Unstaking in progress {#unbonding}

Unstaked QOR leaves both your delegation and your spendable balance for the network's unbonding period. QoreX lists it under **Unstaking in progress** - *"\{amount\} QOR unstaking"*, each entry with the time left (*\{days\}d \{hours\}h \{minutes\}m left*, or *Less than a minute left*, or *The wait is over - this should be back in your balance.*). If QoreX cannot read when an entry completes it says so and keeps the amount in the total. If your node cannot be reached the list stays as it was - it never reads as "nothing unstaking".

:::note Unstaking when you run a validator
If your wallet is a validator operator's, unstaking is refused when it would take your self-bond below the required 100,000 QOR: *"Unstaking this much would drop your validator's self-bond below the required 100,000 QOR. The floor applies for as long as the validator operates."*
:::

### Earn

The **Earn** view summarizes your staking in one place: your staked QOR, your claimable rewards, how many validators you are with, and the share of all QOR that is staked network-wide.

**Yield.** The base yearly rate comes from **the chain's own figure**. It is shown *before the validator's commission*, and it is **variable and not guaranteed**. If the chain reports that rewards now come from fees only, QoreX says *rewards from fees* instead of a percentage. If the figure cannot be read, QoreX shows *Not available* rather than a number it cannot support. A time lock's bonus is a separate figure, see [Staking locks](#staking-locks).

The extension and Safari have the staking pieces on separate screens, see [Where staking lives](#staking-screens).

## Next steps

- [Send & Receive](/qorex/send-and-receive) - move QOR and external assets.
- [Security & Recovery](/qorex/security-and-recovery) - guardians, Legacy inheritance, and device linking.

## Limits and known issues {#limits}

- Rewards are not guaranteed, and the yield shown is variable and before commission.
- Unstaked QOR returns only after the network's unbonding period (21 days at the time of writing); moving stake between validators has no wait but is limited to 7 moves in progress for the same validator pair, and moved stake cannot move on until its move completes.
- Rewards can be redirected only to another account of the same wallet.
- Claim & restake covers at most 127 validators in one transaction, and no transaction can exceed 50,000,000 gas.
- Vesting QOR can be staked but cannot pay fees; the fee must come from unlocked QOR.
- Portfolio is mobile only. On testnet, QOR shows no USD value.
