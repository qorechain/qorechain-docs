---
slug: /dashboard/contract-auditor
title: Contract Auditor
sidebar_label: Contract Auditor
sidebar_position: 7
---

# Contract Auditor

The **Contract Auditor** runs an AI-powered security analysis of a smart contract, powered by **QCAI**. Submit a contract and QCAI reviews it for vulnerabilities, assigns an overall risk level and security score, and explains each finding with a recommended fix. Like the [Smart Contract Creator](/dashboard/smart-contract-creator), the Auditor works across **17 supported blockchains** for AI tooling.

## Run an audit

1. Open the **Auditor** and provide the contract you want analyzed.
2. Start the audit. QCAI reviews the contract and produces a report.

## Read the report

An audit report opens on its own page and includes:

- **Risk level** — an overall rating (for example critical, high, medium, or low), color-coded for quick scanning.
- **Security score** — an overall score from 0 to 100.
- **Severity breakdown** — how many findings fall into each severity (critical, high, medium, low, and informational).
- **Summary** — a short overview of the contract's security posture.

### Findings

Each finding lists its severity, a title, the location in the code it refers to, a description of the issue, and a recommended fix. When a contract has no issues at a given level, the report says so.

Where applicable, the report also includes sections for general recommendations, gas optimizations, best practices, and positive aspects the contract already gets right.

## Review past audits

The audits list shows your previous reports in a table with the contract name, blockchain, risk level, security score, and when each was created. A search box filters by contract name or blockchain. Select any row to reopen the full report, and use the report's own page link to share it.

:::tip Audit before you deploy
Run an audit as the last step before deploying, and re-run it after any change. Treat findings as guidance to verify, not an automatic guarantee — combine the report with your own testing on [testnet](/getting-started/connecting-to-testnet).
:::

## Related

- [Smart Contract Creator](/dashboard/smart-contract-creator) — generate contracts with QCAI.
- [Post-Quantum Security](/architecture/post-quantum-security) — how QoreChain secures accounts and signatures.
