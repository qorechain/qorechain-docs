---
slug: /dashboard/faucet
title: Faucet
sidebar_label: Faucet
sidebar_position: 9
---

# Faucet

Der **Faucet** stellt Ihnen kostenlose Test-Token bereit, damit Sie das Dashboard ausprobieren können, ohne etwas von echtem Wert auszugeben. Er ist ein reines **Testnet-Werkzeug** — verwenden Sie ihn im Testnet (`qorechain-diana`), um Ihre Adresse mit Guthaben auszustatten, bevor Sie Transfers, Swaps, Staking und Contract-Deployments testen.

:::caution Nur Testnet — kein realer Wert
Testnet-QOR hat **keinen realen Wert**. Der Faucet berührt niemals das Mainnet: Es gibt keinen Faucet für Mainnet-QOR, und nichts, was Sie hier anfordern, kann in das Mainnet übertragen werden.
:::

## Test-Token anfordern

1. Verbinden Sie sich mit dem **Testnet** und öffnen Sie den **Faucet**.
2. Geben Sie die zu finanzierende Adresse ein (`qor1...`). Wenn Ihre Wallet verbunden ist, wählen Sie **Meine Adresse verwenden**, um sie automatisch einzutragen. Das Formular prüft, ob die Adresse gültig ist, bevor Sie fortfahren können.
3. Wählen Sie die Anfrage-Schaltfläche. Die Gutschrift wird innerhalb von Sekunden verarbeitet.

Wenn die Anfrage erfolgreich ist, zeigt eine Bestätigungskarte den gesendeten Betrag und den Transaktions-Hash an, zusammen mit einer Kopier-Schaltfläche und einem Link, um die Transaktion im [Explorer](/dashboard/explorer) zu öffnen.

## Limits

Jede Adresse kann pro Abklingzeit (Cooldown) nur einmal Token vom Faucet anfordern. Die Seite zeigt den genauen Betrag pro Anfrage sowie die Wartezeit an, bevor Sie erneut anfordern können. Wenn Sie zu früh erneut anfragen, teilt Ihnen der Faucet mit, wann Sie wieder berechtigt sind.

## Was Sie mit Test-Token tun können

Mit Test-Token können Sie das Netzwerk im Testnet von Ende zu Ende ausprobieren:

- Senden und empfangen Sie auf der [Wallet](/dashboard/wallet)-Seite.
- Probieren Sie einen [Swap](/dashboard/trade) auf dem AMM aus.
- [Delegieren](/dashboard/staking-and-validators) Sie an einen Validator.
- Deployen und testen Sie Contracts, bevor Sie zum Mainnet wechseln.

:::note Nur Testwert
Faucet-Token existieren nur im Testnet und haben keinen realen Wert. Wenn Sie für den Produktiveinsatz bereit sind, wechseln Sie zum Mainnet (`qorechain-vladi`).
:::
