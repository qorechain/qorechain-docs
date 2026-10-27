---
slug: /dashboard/quests
title: Quests
sidebar_label: Quests
sidebar_position: 10
---

# Quests

**Quests** are guided tasks that walk you through using QoreChain while you complete them. A quest groups one or more steps, such as funding a wallet, making a transfer or linking an account, and rewards you for finishing. This page also covers the other pages of the sidebar **Earn** group and the arcade: **Leaderboard**, **Badges** and **Games**. All of them are for community members who want a hands-on way to learn the network and collect progress.

## Innovations {#innovations}

- **Verified completion, not self-reporting.** A quest counts when its check passes. Eigenstate 2 states the check type on each quest: **linked account**, **connected wallet**, **proof link**, **team review** or **quiz**.
- **Social quests count only for verified accounts.** A quest that involves X, Telegram or Discord (and, for Eigenstate 2 linked-account checks, also YouTube and GitHub) counts only once you have connected the account in your **Profile** and the connection is verified. Until then the page shows *Connect Social Accounts* with a **Go to Profile** link.
- **Prerequisites are enforced.** A locked quest says what to finish first ("Complete "..." first").
- **Clear statuses.** Started, Pending Verification, Pending Review, Failed and Completed, so a quest waiting for a human review is not shown as failed.
- **Two seasons in one page.** The **Eigenstate 1** and **Eigenstate 2** tabs have their own quest sets and categories.

## How to use {#how-to-use}

### Browse quests

Open **Quests** (sidebar **Earn**). A summary shows how many quests are available, in progress and completed. **Category tabs** filter the list:

- Eigenstate 1: Onboarding, Trading, Social, Community, Learning, Daily and Weekly.
- Eigenstate 2: Social, Exchanges, Developer, Educational, Korea/Asia, On-Chain and Other.

An empty category reads "No quests in this category yet." Each quest card shows an icon, title and short description, a **difficulty** badge, an estimated time, the **reward** (in QOR or in eigenvalue points, λ) and a status (completed, in progress, started or locked).

### Complete an Eigenstate 1 quest

1. Open a quest and select **Start Quest** (later **Continue Quest**).
2. Work through the tasks. A task offers **Go to Action** (to the relevant Dashboard page) and **Complete** (to confirm a step so it can be verified).
3. A progress bar tracks completed tasks.
4. When all tasks are done, select **Check Completion** to verify the quest and receive its reward.

Daily and weekly quests reset on a schedule; the detail page shows the reset cadence and your streak. A claim from the [Faucet](/dashboard/faucet) counts toward the faucet quests.

### Complete an Eigenstate 2 quest

1. Open the quest and read its check type.
2. Use the button the quest offers. Which one appears depends on the check type and the current status: **Verify**, **Submit**, **Resubmit**, **Retry verification** or **Re-check status**.
3. Watch the status move through Started, Pending Verification or Pending Review, then Completed (or Failed).

### Leaderboard {#leaderboard}

`/leaderboard` ranks people by eigenvalue points (λ) with a top three, community statistics and a search box. It is an off-chain ranking.

### Badges {#badges}

`/badges` is a catalogue of 12 badge series. **Check Badges** re-evaluates your progress. A **Badge Widget** gives you an iframe, BBCode or Markdown snippet with **Copy Code** to show a badge elsewhere. A Bridge series appears in the list although the bridge is not live.

### Games {#games}

`/games` is the **QoreChain Arcade** with 12 games: Quantum Space Miner, Quantum Runner, Chain Breaker, Token Rush, Block Defense, Node Puzzle, Quantum Stack, Hash Breaker, Qubit Bounce, Consensus Race, Quantum Maze and Wave Coder. Select **Play Now** on a card; your score (Photons, γ) is submitted when the game ends. Scores are kept off chain.

## How to access {#how-to-access}

- **URLs:** [dashboard.qorechain.io/quests](https://dashboard.qorechain.io/quests), `/leaderboard`, `/badges`, `/games`.
- **Sign-in:** required for all of them. `/quests` redirects to sign-in when you are signed out; Leaderboard, Badges and Games show an "Authentication Required" screen.
- **Network:** none of them follows the network switch.
- **Wallet:** none required, but quests that involve transactions need a funded testnet wallet (see [Wallet](/dashboard/wallet#testnet) and [Faucet](/dashboard/faucet)); social quests need linked accounts.
- **Cost:** free.

## Where it is published {#where-published}

| Page | Address | Account |
| --- | --- | --- |
| Quests (Eigenstate 1 and 2) | `dashboard.qorechain.io/quests` | Sign-in |
| Leaderboard | `dashboard.qorechain.io/leaderboard` | Sign-in |
| Badges | `dashboard.qorechain.io/badges` | Sign-in |
| Games | `dashboard.qorechain.io/games` | Sign-in |

## Limits and known issues {#limits}

- **Quest sets change.** A season's tab can be empty or show fewer quests when its quests are not active; check the tab rather than relying on this page for the current list.
- **Everything here is off chain:** points, ranks, badges and game scores are recorded by the Dashboard, not on QoreChain. Photons are not on chain.
- **Reward amounts** are shown on each quest and can change.
- **Sign-in** and, for social quests, verified linked accounts are required.
- **Public Sale** (`/public-sale`) is a separate page for existing participants (allocation, vesting timeline, claim); all earlier rounds are closed, and it is not described further here.
- **FAQ** (`/faq`) is a short in-app help page; this manual is the reference.

## Related

- [Overview & Getting Started](/dashboard/overview) - sign in and connect your wallet before starting quests.
- [Faucet](/dashboard/faucet) - fund a testnet wallet for quests that involve transactions.
