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

1. Melden Sie sich an, stellen Sie das Dashboard auf **Testnet** um und öffnen Sie den **Faucet**.
2. Geben Sie die zu finanzierende Adresse ein (`qor1...`). Wenn Ihre Wallet verbunden ist, wählen Sie **Use my address**, um sie automatisch einzutragen. Das Formular prüft, ob die Adresse gültig ist, bevor Sie fortfahren können.
3. Wählen Sie die Anfrage-Schaltfläche. Die Gutschrift wird innerhalb von Sekunden verarbeitet.

Wenn die Anfrage erfolgreich ist, zeigt eine Bestätigungskarte den gesendeten Betrag und den Transaktions-Hash an, zusammen mit einer Kopier-Schaltfläche und einem Link, um die Transaktion im [Explorer](/dashboard/explorer) zu öffnen. Seit dem 27. Oktober 2026 kann ein Claim auch die drei [Fest-Test-Token](#fest-tokens) auszahlen; die Karte hat dann eine Zeile **Fest tokens**, die auflistet, was angekommen ist, oder einen kurzen Hinweis, falls nur die QOR durchgegangen sind.

## Limits

Jede Adresse kann pro Abklingzeit (Cooldown) nur einmal Token vom Faucet anfordern. Die Seite zeigt den genauen Betrag pro Anfrage sowie die Wartezeit an, bevor Sie erneut anfordern können. Wenn Sie zu früh erneut anfragen, teilt Ihnen der Faucet mit, wann Sie wieder berechtigt sind.

## Fest-Test-Token (fUSD, fETH, fBTC) {#fest-tokens}

Für das Builder-Fest existieren im Testnet drei zusätzliche Test-Token: **fUSD** (FestUSD, 6 Dezimalstellen), **fETH** (FestETH, 18 Dezimalstellen) und **fBTC** (FestBTC, 8 Dezimalstellen). Es sind einfache Test-Token ohne Wert und ohne Bezug zu einem realen Vermögenswert. Die Testnet-Governance hat sie beim ERC-20-Modul registriert (Testnet-Vorschlag 26), sodass jedes sowohl als ERC-20-Vertrag auf der Testnet-EVM als auch als Bank-Coin existiert, den Wallets und der AMM halten können. Der Faucet ist so konfiguriert, dass er mit einem QOR-Claim von jedem etwas sendet (zum Zeitpunkt der Erstellung, 27. Oktober 2026: 1.000 fUSD, 0,5 fETH und 0,02 fBTC, mit derselben 24-Stunden-Abklingzeit wie die QOR); die Seite zeigt die genauen Beträge neben dem QOR-Betrag an, wann immer der Faucet sie auszahlt.

| Token | Dezimalstellen | ERC-20-Vertrag auf der Testnet-EVM | Bank-Denomination (groß-/kleinschreibungsabhängig) |
| --- | --- | --- | --- |
| fUSD | 6 | `0x97143B771D34ddb9130b807b135Ae675A5a963CA` | `erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA` |
| fETH | 18 | `0x02292293c13880a26242690eb70a0e42B8E91c28` | `erc20:0x02292293c13880a26242690eb70a0e42B8E91c28` |
| fBTC | 8 | `0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | `erc20:0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` |

Gut zu wissen:

- **Nur Testnet.** Die Token existieren im Mainnet nicht.
- **Kopieren Sie die Denomination exakt.** Der Adressteil steht in der gemischten Groß-/Kleinschreibung nach EIP-55, und die Denomination wird groß-/kleinschreibungsabhängig abgeglichen.
- **On-Chain ansehen.** `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` listet die drei Denominationen mit ihren Symbolen und Anzeigenamen auf.
- **Umwandlung zwischen den beiden Formen.** Um ein ERC-20-Guthaben in Bank-Coins zu verschieben (`MsgConvertERC20`), muss der Absender als bech32-Adresse `qor1...` angegeben werden.
- **Pools.** Die [AMM](/architecture/amm) im Testnet kann sie gegen `uqor` poolen; ob ein Pool existiert, zeigt `GET /qorechain/amm/v1/pools`. Die Seiten [Wallet](/dashboard/wallet) und [Trade](/dashboard/trade) haben keinen eigenen Eintrag dafür; prüfen Sie ein Guthaben mit `GET /cosmos/bank/v1beta1/balances/{address}`.

## Was Sie mit Test-Token tun können

Mit Test-Token können Sie das Netzwerk im Testnet von Ende zu Ende ausprobieren:

- Senden und empfangen Sie auf der [Wallet](/dashboard/wallet)-Seite.
- Probieren Sie einen [Swap](/dashboard/trade) auf dem AMM aus.
- [Delegieren](/dashboard/staking-and-validators) Sie an einen Validator.
- Deployen und testen Sie Contracts, bevor Sie zum Mainnet wechseln.

:::note Nur Testwert
Faucet-Token existieren nur im Testnet und haben keinen realen Wert. Wenn Sie für den Produktiveinsatz bereit sind, wechseln Sie zum Mainnet (`qorechain-vladi`).
:::
