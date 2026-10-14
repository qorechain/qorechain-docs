---
slug: /dashboard/trade
title: Trade (DEX)
sidebar_label: Trade (DEX)
sidebar_position: 4
---

# Trade (DEX)

Die Seite **Trade** ist der Token-Swap-Bildschirm des Dashboards: Tausche einen Token gegen einen anderen und stelle einem Pool Liquidität bereit – ohne Off-Chain-Orderbuch. Zum Design des nativen Automated Market Maker (AMM) von QoreChain siehe [AMM & On-Chain Liquidity](/architecture/amm).

:::caution Vorerst nur Test-Token
Die Pools und Token auf dieser Seite sind Test-Token: Swaps laufen gegen einen Swap-Contract, der auf dem Testnet-EVM deployt ist, und die Seite hat dafür eine Schaltfläche **Get test tokens**. Betrachte nichts hier Gezeigtes als Liquidität mit realem Wert oder als Marktpreis. Das native AMM-Modul von QoreChain ist live, aber auf keinem der beiden Netzwerke wurden bisher Pools erstellt. Diese Seite wird aktualisiert, sobald echte Pools verfügbar sind.
:::

Zum Handeln brauchst du ein angemeldetes Konto und eine Wallet – siehe [Anmelden](/dashboard/overview#sign-in) und [Wallet verbinden](/dashboard/overview#connect-your-wallet).

Die Seite hat vier Tabs: **Swap**, **Pools**, **Add Liquidity** und **My Positions**.

## Swap

Tausche einen Token gegen einen anderen:

1. Wähle den Token, mit dem du bezahlst, und gib einen Betrag ein.
2. Wähle den Token, den du erhalten möchtest – der Ausgabebetrag wird automatisch berechnet.
3. Passe optional deine **Slippage-Toleranz** an (die maximale Preisbewegung, die du akzeptierst; Standard 0,5 %).
4. Wähle **Swap** und bestätige.

Ein Swap-Verlaufsbereich listet deine vergangenen Swaps mit Token, Beträgen, Kurs, Zeit und Status auf.

:::tip Slippage
Eine höhere Slippage-Toleranz erhöht in sich schnell bewegenden Märkten die Wahrscheinlichkeit, dass ein Swap durchgeht, aber du erhältst möglicherweise einen ungünstigeren Preis. Der Standardwert passt für die meisten Paare.
:::

## Pools

Durchsuche die verfügbaren Liquiditätspools. Jede Pool-Karte zeigt das Handelspaar, die Gesamtliquidität, das 24-Stunden-Volumen und die Anzahl der Anbieter. Ein Suchfeld filtert Pools nach Token-Symbol.

## Add Liquidity

Stelle einem Pool Liquidität bereit und erhalte einen Anteil an seinen Swap-Gebühren:

1. Wähle die beiden zu paarenden Token (einer ist standardmäßig QOR).
2. Gib einen Betrag für den ersten Token ein – der zweite Betrag wird automatisch ausgefüllt, um dem aktuellen Pool-Verhältnis zu entsprechen.
3. Überprüfe deinen voraussichtlichen Anteil am Pool, wähle dann **Add Liquidity** und bestätige.

Du erhältst Liquidity-Provider-Token (LP-Token), die deine Position repräsentieren.

## My Positions

Sieh dir die Liquiditätspositionen an, die du hältst. Jeder Eintrag zeigt das Token-Paar, den Betrag in jedem Token, deinen Anteil am Pool und die verdienten Gebühren. Wähle bei einer Position **Remove Liquidity**, um eine Vorschau der Token zu erhalten, die du erhalten würdest, und deinen Anteil abzuheben.

## Verwandt

- [AMM & On-Chain Liquidity](/architecture/amm) – Pool-Typen und Preiskurven.
- [Wallet](/dashboard/wallet) – Guthaben vor und nach einem Swap prüfen.
