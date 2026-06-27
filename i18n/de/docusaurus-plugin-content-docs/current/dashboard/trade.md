---
slug: /dashboard/trade
title: Trade (DEX)
sidebar_label: Trade (DEX)
sidebar_position: 4
---

# Trade (DEX)

Die Seite **Trade** ist die dezentrale Börse des Dashboards. Sie ermöglicht es dir, Token zu swappen und Liquidität direkt auf dem nativen On-Chain Automated Market Maker (AMM) von QoreChain bereitzustellen – ohne Off-Chain-Orderbuch und ohne externen Smart Contract. Swaps und Liquiditätsaktionen werden auf Protokollebene abgewickelt. Zum Design dahinter siehe [AMM & On-Chain Liquidity](/architecture/amm).

Verbinde deine Wallet, um zu handeln – siehe [Overview & Getting Started](/dashboard/overview#connect-your-wallet).

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

Durchsuche die verfügbaren Liquiditätspools. Jede Pool-Karte zeigt das Handelspaar, die Gesamtliquidität, das 24-Stunden-Volumen, den APR und die Anzahl der Anbieter. Ein Suchfeld filtert Pools nach Token-Symbol.

## Add Liquidity

Stelle Liquidität bereit, um einen Anteil an den Swap-Gebühren zu verdienen:

1. Wähle die beiden zu paarenden Token (einer ist standardmäßig QOR).
2. Gib einen Betrag für den ersten Token ein – der zweite Betrag wird automatisch ausgefüllt, um dem aktuellen Pool-Verhältnis zu entsprechen.
3. Überprüfe deinen voraussichtlichen Anteil am Pool, wähle dann **Add Liquidity** und bestätige.

Du erhältst Liquidity-Provider-Token (LP-Token), die deine Position repräsentieren.

## My Positions

Sieh dir die Liquiditätspositionen an, die du hältst. Jeder Eintrag zeigt das Token-Paar, den Betrag in jedem Token, deinen Anteil am Pool, die verdienten Gebühren und den APR. Wähle bei einer Position **Remove Liquidity**, um eine Vorschau der Token zu erhalten, die du erhalten würdest, und deinen Anteil abzuheben.

## Verwandt

- [AMM & On-Chain Liquidity](/architecture/amm) – Pool-Typen und Preiskurven.
- [Wallet](/dashboard/wallet) – Guthaben vor und nach einem Swap prüfen.
