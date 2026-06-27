---
slug: /dashboard/faucet
title: Faucet
sidebar_label: Faucet
sidebar_position: 9
---

# Faucet

Der **Faucet** gibt Ihnen kostenlose Test-Token, damit Sie das Dashboard ausprobieren können, ohne etwas von Wert auszugeben. Es handelt sich um ein **ausschließlich für das Testnet** gedachtes Tool — verwenden Sie es im Testnet (`qorechain-diana`), um Ihre Adresse aufzuladen, bevor Sie Transfers, Swaps, Staking und Contract-Deployment testen.

## Test-Token anfordern

1. Verbinden Sie sich mit dem **Testnet** und öffnen Sie den **Faucet**.
2. Geben Sie die aufzuladende Adresse ein (`qor1...`). Wenn Ihre Wallet verbunden ist, wählen Sie **Meine Adresse verwenden**, um sie automatisch einzutragen. Das Formular bestätigt, dass die Adresse gültig ist, bevor Sie fortfahren können.
3. Wählen Sie die Anforderungsschaltfläche aus. Die Aufladung wird innerhalb von Sekunden verarbeitet.

Wenn die Anforderung erfolgreich ist, zeigt eine Bestätigungskarte den gesendeten Betrag und den Transaktions-Hash mit einer Kopierschaltfläche und einem Link, um die Transaktion im [Explorer](/dashboard/explorer) zu öffnen.

## Limits

Jede Adresse kann einmal pro Abklingzeit beim Faucet anfordern. Die Seite zeigt den genauen Betrag pro Anforderung und die Abklingzeit an, bevor Sie erneut beziehen können. Wenn Sie zu früh erneut anfordern, teilt Ihnen der Faucet mit, wann Sie das nächste Mal berechtigt sind.

## Was Sie mit Test-Token tun können

Test-Token ermöglichen es Ihnen, das Netzwerk im Testnet von Anfang bis Ende durchzuspielen:

- Senden und empfangen Sie auf der [Wallet](/dashboard/wallet)-Seite.
- Probieren Sie einen [Swap](/dashboard/trade) auf dem AMM aus.
- [Delegieren](/dashboard/staking-and-validators) Sie an einen Validator.
- Deployen und testen Sie Contracts, bevor Sie zum Mainnet wechseln.

:::note Nur Testwert
Faucet-Token existieren im Testnet und haben keinen realen Wert. Wenn Sie für den produktiven Einsatz bereit sind, wechseln Sie zum Mainnet (`qorechain-vladi`).
:::
