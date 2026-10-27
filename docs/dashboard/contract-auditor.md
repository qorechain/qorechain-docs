---
slug: /dashboard/contract-auditor
title: Contract Auditor
sidebar_label: Contract Auditor
sidebar_position: 7
---

# Contract Auditor

The **Contract Auditor** (sidebar **Build**, entry **AI Audit**) runs a security review of pasted contract source with **QCAIA**, QoreChain's AI assistant, and returns a score, a risk level and findings with recommended fixes. It is for developers who want a fast second look at a contract before testing and deploying it. It is not a formal audit and does not replace human review.

## Innovations {#innovations}

- **Blockchain auto-detection.** "Auto-detect from code" is the default; you can instead pick one of 17 ecosystems.
- **A separate post-quantum readiness percentage** next to the 0 to 100 Security Score, reported on its own so it is not folded into the security score.
- **A free audit every UTC day.** The first audit each UTC day is free. After that, on testnet each audit is paid in test QOR after a "Confirm Security Audit" dialog showing the "Audit Cost"; on mainnet, further audits wait until the next UTC day.
- **Reports private by default.** The owner switches visibility; a public report never shows the owner's name or IP.
- **Findings with fixes, not just labels.** Each finding has a severity, location, description and recommended fix, and the full report adds recommendations, gas optimizations, best practices and positive aspects.

## How to use {#how-to-use}

### Run an audit

1. Sign in (required) and open **AI Audit**.
2. Fill **Blockchain** (default "Auto-detect from code"), **Name (Optional)** and **Contract Source Code**.
3. Select **Run Security Audit**, then confirm the "Confirm Security Audit" dialog.
4. The **Security Report** appears inline on the same page. **Export PDF** saves it.

**Minimal example:** paste an ERC-20, keep auto-detect, **Run Security Audit**, Confirm, **Export PDF**.

### Read the report

The inline report shows:

- **Risk Level**, colour-coded;
- **Security Score** from 0 to 100, and the post-quantum readiness percentage;
- an **Executive Summary**;
- **Vulnerabilities Found (N Issues)**, with severities Critical, High, Medium, Low and Info. A clean result reads "No vulnerabilities detected".

Each finding lists severity, title, the location in the code, a description and a recommended fix.

The full report page `/audits/<id>` adds the severity breakdown, **Recommendations**, **Gas optimizations**, **Best practices**, **Positive aspects** and, for the owner, the visibility switch.

### Past audits and sharing

- Your own reports are under **Profile > Audited**.
- The **All Security Audits** list at `/audits` (linked from the home page) shows the latest audits whose owners made them public, in a table with contract name, blockchain, risk level, score and date. A search box filters by name, blockchain or risk level. Private reports never appear in it; the same applies to the latest-audits list on the home page.
- On a report you own, a switch at the top reads "This report is private". Turn it on to make the report public so anyone with the link can read it (your name and IP are never shown), and off to make it private again.

:::tip Audit before you deploy
Run an audit as the last step before deploying, and re-run it after any change. Treat findings as guidance to verify, not a guarantee, and combine the report with your own testing on [testnet](/getting-started/connecting-to-testnet).
:::

## How to access {#how-to-access}

- **URL:** [dashboard.qorechain.io/audit](https://dashboard.qorechain.io/audit), or **New Audit** on the home page.
- **Account:** sign-in is required to run an audit. The `/audits` list and public reports at `/audits/<id>` open without an account.
- **Networks:** works on both. The free-daily rule is the same; paid extra audits exist on testnet only.
- **Cost:** the first audit each UTC day is free; testnet extras cost test QOR; mainnet extras wait for the next day.

## Where it is published {#where-published}

| Surface | Address | Account |
| --- | --- | --- |
| Run an audit | `dashboard.qorechain.io/audit` | Sign-in required |
| All Security Audits | `dashboard.qorechain.io/audits` | None |
| A report | `dashboard.qorechain.io/audits/<id>` | None if public; owner otherwise |

## Limits and known issues {#limits}

- It reviews only the source you paste, with no compile, test or runtime analysis. Findings can be incomplete or wrong.
- A private report cannot be opened by anyone but its owner, even with the link.

## Related

- [Smart Contract Creator](/dashboard/smart-contract-creator) - generate contracts with QCAIA.
- [Post-Quantum Security](/architecture/post-quantum-security) - how QoreChain secures accounts and signatures.
