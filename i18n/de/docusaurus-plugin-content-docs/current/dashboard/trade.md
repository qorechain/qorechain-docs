---
slug: /dashboard/trade
title: Trade (DEX)
sidebar_label: Trade (DEX)
sidebar_position: 4
---

# Trade (DEX)

Die Seite **Trade** (mit dem Titel "QoreChain DEX") ist ein Swap-Bildschirm für Test-Token mit vier Tabs: **Swap**, **Pools**, **Add Liquidity** und **My Positions**. Sie dient dazu, einen Swap-Ablauf mit Test-Token von Anfang bis Ende auszuprobieren, bevor es echte Pools gibt. Zum Design des nativen Automated Market Maker von QoreChain siehe [AMM & On-Chain Liquidity](/architecture/amm).

:::caution Vorerst nur Test-Token
Alles auf dieser Seite läuft im **Testnet**, unabhängig davon, welches Netzwerk die Kopfzeile anzeigt. Im Mainnet ist die Seite weiterhin durch Anmeldung und Bestätigung geschützt, zeigt aber `qorechain-diana` und Testnet-Token. Nur fünf QoreSwap-Test-Token werden on-chain abgewickelt; alles andere hier ist ein Übungsbereich. Das native AMM-Modul von QoreChain ist live, aber auf keinem der beiden Netzwerke wurden bisher Pools erstellt (`GET /qorechain/amm/v1/pools` liefert auf beiden eine leere Liste, geprüft am 27. Oktober 2026).
:::

## Innovationen {#innovations}

- **On-Chain-Swaps für fünf Test-Token.** Swaps zwischen WQOR, QUSDC, QUSDT, QWETH und QWBTC laufen gegen den QoreSwap-AMM-Contract auf dem Testnet-EVM (Chain-ID 9800). Das Angebot kommt von `getAmountOut` des Contracts.
- **Slippage wird in der Transaktion durchgesetzt.** Der Trade läuft als Approve gefolgt von `swapExactTokensForTokens`, mit einer aus deiner Slippage-Einstellung abgeleiteten Mindestausgabe, signiert vom EVM-Schlüssel der Test-Wallet. Bewegt sich der Preis über deine Toleranz hinaus, wird der Swap zurückgesetzt, statt zu einem schlechteren Preis ausgeführt zu werden.
- **Test-Token auf Abruf.** **Get test tokens** fordert alle fünf Token an, einmal alle 12 Stunden pro Token.
- **Klare Trennung zwischen echt und Übung.** Andere Paare, die Pools-Liste, Add Liquidity und My Positions sind ein Übungsbereich im Testnet und liegen nicht on-chain.

## Anwendung {#how-to-use}

Voraussetzungen: angemeldet und eine Test-Wallet (siehe [Wallet](/dashboard/wallet#testnet)). Ohne diese zeigt die Seite "Wallet Required for Trading".

### Swap

1. Das Banner bietet **Get test tokens** an; nutze es zuerst.
2. Wähle den Token, mit dem du bezahlst, und gib einen Betrag ein. Das Standardpaar, QOR zu USDC, ist ein **Übungs**paar, das nicht on-chain abgewickelt wird. Wähle **WQOR** und **QUSDC** (oder ein beliebiges Paar der fünf) für einen On-Chain-Swap.
3. Wähle den Token, den du erhalten möchtest; die Ausgabe wird automatisch berechnet.
4. Passe optional die **Slippage-Toleranz** an (Standard 0,5 %).
5. Wähle **Swap Now**, dann **Confirm Swap**. Das Ergebnis zeigt "Swap Confirmed" mit **View Transaction**.

**Recent Swaps** listet Swaps aller Nutzer; **Show My History** filtert auf deine eigenen.

**Minimales Beispiel:** Wähle im Testnet **Get test tokens**, verkaufe 10 WQOR gegen QUSDC, **Swap Now**, **Confirm Swap**.

:::tip Slippage
Eine höhere Toleranz erhöht in sich schnell bewegenden Märkten die Wahrscheinlichkeit, dass ein Swap durchgeht, aber du erhältst möglicherweise einen schlechteren Preis. Der Standardwert passt für die meisten Paare.
:::

### Pools

Durchsuche die Pool-Karten: Handelspaar, Gesamtliquidität, 24-Stunden-Volumen, Anzahl der Anbieter sowie außerdem ein APR, eine Gebühr, eine Pool-ID, ein Preis und die Reserven. Ein Suchfeld filtert nach Token-Symbol. Das sind Übungswerte; lies sie nicht als Renditen.

### Add Liquidity

1. Wähle zwei Token für das Paar (einer ist standardmäßig QOR). Mit **Create Pool** legst du ein neues Paar an.
2. Gib einen Betrag für den ersten Token ein; der zweite wird passend zum Pool-Verhältnis ausgefüllt. Die Seite weist darauf hin: "Minimum 1000 QOR required".
3. Überprüfe deinen Anteil und bestätige dann.

### My Positions

Jeder Eintrag zeigt das Token-Paar, den Betrag jedes Tokens, deinen Anteil und die verdienten Gebühren. Um eine Position zu verlassen, wähle **Withdraw**, dann **Request Withdrawal (x%)**; nach einer Abkühlzeit wähle **Confirm Withdraw** (oder **Cancel Withdrawal**). Es gibt keine einzelne Schaltfläche "Remove Liquidity".

## Zugang {#how-to-access}

- **URL:** [dashboard.qorechain.io/trade](https://dashboard.qorechain.io/trade).
- **Konto:** Eine Anmeldung ist erforderlich. Zum Swappen wird eine Test-Wallet benötigt. Im Mainnet ist außerdem die einmalige [Bestätigung](/dashboard/overview#risk-acknowledgement) erforderlich, bevor die Seite sich öffnet.
- **Netzwerk:** nur Testnet-Inhalte; der Schalter in der Kopfzeile ändert daran nichts.
- **Kosten:** kostenlos. Die Test-Token kommen von **Get test tokens**; die Test-Wallet zahlt Gas in Test-QOR aus dem [Faucet](/dashboard/faucet).

## Wo es veröffentlicht ist {#where-published}

| Oberfläche | Adresse | Netzwerk | On-Chain-Abwicklung? |
| --- | --- | --- | --- |
| Swap von WQOR, QUSDC, QUSDT, QWETH, QWBTC | `dashboard.qorechain.io/trade` | Testnet-EVM, Chain-ID 9800 | Ja |
| Andere Paare, Pools, Add Liquidity, My Positions | `dashboard.qorechain.io/trade` | Testnet | Nein, Übungs-Ledger |
| Natives AMM | Siehe [AMM](/architecture/amm) | Beide Netzwerke | Es existieren noch keine Pools |

## Grenzen und bekannte Probleme {#limits}

- **Kein Mainnet-Handel.** Die Seite ignoriert den Netzwerkschalter und zeigt auch im Mainnet Testnet-Inhalte.
- **Nur fünf Token werden on-chain abgewickelt.** Die Fest-Token aus dem [Faucet](/dashboard/faucet#fest-tokens) sind auf dieser Seite nicht enthalten.
- **Das native AMM hat auf keinem Netzwerk Pools.** Echte Pools werden beschrieben, sobald sie existieren.
- **Übungswerte** (Preise, APR, Volumen) sind keine Marktdaten.
- **Testnet-Token haben keinen Wert** und lassen sich gegen nichts eintauschen.

## Verwandt

- [AMM & On-Chain Liquidity](/architecture/amm) - Pool-Typen und Preiskurven.
- [Wallet](/dashboard/wallet) - Guthaben vor und nach einem Swap prüfen.
