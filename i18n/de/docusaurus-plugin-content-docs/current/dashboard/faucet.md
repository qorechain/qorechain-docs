---
slug: /dashboard/faucet
title: Faucet
sidebar_label: Faucet
sidebar_position: 9
---

# Faucet

Der **Faucet** zahlt kostenlose Test-Token an eine Testnet-Adresse aus, damit Sie das Dashboard, Wallets und Contracts ausprobieren können, ohne etwas von Wert auszugeben. Er ist für alle gedacht, die Testnet-QOR (und während des Builder-Fests drei Test-Token) brauchen, um Transfers, Swaps, Staking-Werkzeuge und Contract-Deployments im Testnet `qorechain-diana` zu testen.

:::caution Nur Testnet, kein realer Wert
Testnet-QOR hat **keinen realen Wert**. Der Faucet berührt niemals das Mainnet: Es gibt keinen Faucet für Mainnet-QOR, und nichts, was Sie hier anfordern, kann in das Mainnet übertragen werden.
:::

## Innovationen {#innovations}

- **Ein Claim, zwei Arten von Token.** Ein Claim zahlt 100 QOR aus, und in einer separaten Transaktion 1.000 fUSD, 0,5 fETH und 0,02 fBTC. Schlägt der Fest-Versand fehl, kommen die QOR trotzdem an, und die Ergebniskarte weist darauf hin.
- **Eine doppelte Abklingzeit.** Ein Claim pro 24 Stunden pro Konto **und** pro Adresse. Der Slot wird reserviert, bevor etwas gesendet wird, und freigegeben, wenn der Versand fehlschlägt; ein fehlgeschlagener Claim verbraucht Ihren Tag also nicht.
- **Fest-Token sind native Bank-Coins.** Es sind Bank-Denominationen der Form `erc20:0x...`, die die On-Chain-AMM, Bank-Sends, IBC und QoreChain-Native-Contracts unverändert verwenden. MetaMask oder eine EVM-DEX sehen sie erst nach einer Umwandlung per `MsgConvertCoin` (siehe [Fest-Test-Token](#fest-tokens)).
- **Keine falschen Zahlen.** Lassen sich die Infos des Faucets nicht laden, zeigt die Seite „...“ statt eines Betrags, nie einen geschätzten.
- **Ein `0x`-Empfänger wird auf seinem `qor1`-Zwilling bezahlt.** Eine `0x`-Adresse sind dieselben 20 Bytes wie ihre `qor1`-Form, daher bezahlt der Dienst dasselbe Konto. Das Dashboard-Formular selbst akzeptiert nur `qor1...`.

## So verwenden Sie es {#how-to-use}

1. **Melden Sie sich an.** Abgemeldet zeigt die Seite „Sign in to access the faucet.“
2. Öffnen Sie **Faucet**. Verwenden Sie unter **Request Tokens** bei **Wallet Address** „Select a wallet“ oder **Use my address ->**, um eine Ihrer Dashboard-Wallets einzutragen, oder geben Sie eine `qor1...`-Adresse ein.
3. Die Infozeile lautet „You can request 100 QOR once every 24 hours“ plus die Fest-Beträge.
4. Wählen Sie **Request Tokens**.
5. Bei Erfolg zeigt die Karte **Tokens Sent!** mit dem Betrag, eine Zeile **Fest tokens** (was angekommen ist, oder ein kurzer Hinweis, falls nur die QOR durchgegangen sind), den Transaktions-Hash mit einer Kopier-Schaltfläche und **View on Explorer**.
6. Ein erneuter Claim zu früh zeigt „Rate Limit Reached“ und „Rate limited for another HH:MM“.

Die Adressprüfung im Formular ist leicht: Sie sucht das Präfix `qor` und eine Länge von mindestens 10 Zeichen und weist `0x...`-Eingaben zurück. Prüfen Sie die Adresse selbst, bevor Sie senden.

Ein Faucet-Claim zählt außerdem für Faucet-[Quests](/dashboard/quests).

**Minimales Beispiel:** Melden Sie sich an, öffnen Sie Faucet, wählen Sie **Use my address ->**, wählen Sie **Request Tokens** und dann **View on Explorer** mit dem Header auf Testnet.

### Fest-Test-Token (fUSD, fETH, fBTC) {#fest-tokens}

Für das Builder-Fest existieren im Testnet drei zusätzliche Test-Token: **fUSD** (FestUSD, 6 Dezimalstellen), **fETH** (FestETH, 18 Dezimalstellen) und **fBTC** (FestBTC, 8 Dezimalstellen). Sie haben keinen Wert und keinen Bezug zu einem realen Vermögenswert. Die Testnet-Governance hat sie beim ERC-20-Modul registriert (Testnet-Vorschlag 26), sodass jedes sowohl als ERC-20-Vertrag auf der Testnet-EVM als auch als Bank-Coin existiert, den Wallets und die AMM halten können. Der Faucet ist so konfiguriert, dass er mit einem QOR-Claim von jedem etwas sendet (zum Zeitpunkt der Erstellung, 27. Oktober 2026: 1.000 fUSD, 0,5 fETH und 0,02 fBTC, mit derselben 24-Stunden-Abklingzeit); die Seite zeigt die genauen Beträge neben dem QOR-Betrag an, wann immer sie sie auszahlt. Die Fest-Token kommen in einer separaten Transaktion an; deren Hash wird nicht auf der Karte angezeigt.

| Token | Dezimalstellen | ERC-20-Vertrag auf der Testnet-EVM | Bank-Denomination (groß-/kleinschreibungsabhängig) |
| --- | --- | --- | --- |
| fUSD | 6 | `0x97143B771D34ddb9130b807b135Ae675A5a963CA` | `erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA` |
| fETH | 18 | `0x02292293c13880a26242690eb70a0e42B8E91c28` | `erc20:0x02292293c13880a26242690eb70a0e42B8E91c28` |
| fBTC | 8 | `0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | `erc20:0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` |

- **Nur Testnet.** Die Token existieren im Mainnet nicht.
- **Kopieren Sie die Denomination exakt.** Der Adressteil steht in der gemischten Groß-/Kleinschreibung nach EIP-55, und die Denomination wird groß-/kleinschreibungsabhängig abgeglichen.
- **On-Chain ansehen.** `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` listet die drei Denominationen mit ihren Symbolen und Anzeigenamen auf.
- **Verwendung aus MetaMask oder einer EVM-DEX.** Der Faucet zahlt Bank-Coins aus. Um eines als ERC-20 für MetaMask oder eine EVM-DEX zu halten, wandeln Sie es mit `MsgConvertCoin` um (Absender Ihre `qor1...`-Adresse, Empfänger eine `0x...`-Adresse und die exakte Denomination in gemischter Groß-/Kleinschreibung). Zurück geht es mit `MsgConvertERC20`. Schritte und Gas-Werte stehen unter [EVM-Entwicklung](/developer-guide/evm-development#fest-tokens). Eine eigene Schritt-für-Schritt-Anleitung zur Umwandlung ist geplant und noch nicht veröffentlicht.
- **Pools.** Die [AMM](/architecture/amm) im Testnet kann sie gegen `uqor` poolen; ob ein Pool existiert, zeigt `GET /qorechain/amm/v1/pools`. Der Tab Tokens der [Wallet](/dashboard/wallet) und [Trade](/dashboard/trade) haben keinen Eintrag dafür; prüfen Sie ein Guthaben mit `GET /cosmos/bank/v1beta1/balances/{address}`.

### Was Sie mit Test-Token tun können

- Senden und empfangen Sie auf der [Wallet](/dashboard/wallet)-Seite.
- Probieren Sie einen [Swap](/dashboard/trade) mit den QoreSwap-Test-Token aus.
- Deployen und testen Sie Contracts mit dem [Smart Contract Creator](/dashboard/smart-contract-creator), bevor Sie zum Mainnet wechseln.
- Testen Sie ein Node- oder Validator-Setup im Testnet mit den Werkzeugen unter [Nodes & Validators](/dashboard/tools-hub).

## So greifen Sie darauf zu {#how-to-access}

- **URL:** [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet).
- **Konto:** Eine Anmeldung ist erforderlich. Eine Wallet-Verbindung ist nicht nötig; Sie können jede beliebige `qor1...`-Adresse einfügen.
- **Netzwerk:** Der Faucet **zahlt immer im Testnet** `qorechain-diana` aus, was auch immer der Header anzeigt. Sie müssen den Header zum Anfordern nicht auf Testnet umstellen. Stellen Sie ihn nur auf Testnet um, damit **View on Explorer** das richtige Netzwerk öffnet; bei Header auf Mainnet zeigt dieser Link „Transaction Not Found“.
- **Kosten:** kostenlos.

## Wo er veröffentlicht ist {#where-published}

| Oberfläche | Adresse | Netzwerk | Konto |
| --- | --- | --- | --- |
| Faucet-Seite | `dashboard.qorechain.io/faucet` | Nur Testnet `qorechain-diana` | Anmeldung erforderlich |
| Metadaten der Fest-Token | `api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` | Testnet | Keines |

## Limits und bekannte Probleme {#limits}

- **100 QOR einmal alle 24 Stunden**, pro Konto und pro Adresse. Die Fest-Token folgen derselben Abklingzeit.
- **Kein Mainnet-Faucet.** Testnet-QOR ist nie gegen Mainnet-QOR tauschbar.
- **Das Formular weist `0x`-Adressen zurück** und führt nur eine leichte `qor`-Prüfung durch.
- **Der Fest-Versand kann für sich allein fehlschlagen;** die QOR werden trotzdem ausgezahlt, und die Karte weist darauf hin. Warten Sie die Abklingzeit ab oder prüfen Sie Ihr Guthaben, bevor Sie es erneut versuchen.
- **Fest-Token erscheinen nicht** im Tab Tokens der Wallet.
