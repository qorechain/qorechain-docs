---
slug: /qorex/send-and-receive
title: Senden & Empfangen
sidebar_label: Senden & Empfangen
sidebar_position: 3
---

# Senden & Empfangen

Der Tab Start (Wallet) ist Ihr Ausgangspunkt. Er zeigt ein **Netzwerk-Badge** (standardmäßig MAINNET, oder TESTNET, wenn Sie den Entwickler-Umschalter aktiviert haben), Ihr **Gesamtguthaben** (zum Ausblenden/Anzeigen antippen) und die Hauptaktionen: **Senden · Empfangen · Swap · Stake**. Ihre Vermögensliste zeigt **QOR** (Native + post-quantum 🛡, ein einheitliches Guthaben über die Native/EVM/SVM-Lanes hinweg) und **Alle Netzwerke** (eine vereinheitlichte ETH · BNB · POL · ARB-Ansicht).

## Quantensicheres QOR senden

1. Tippen Sie auf **Senden**.
2. Geben Sie den Empfänger als `qor1…`-Adresse **oder** als **@handle** ein. Ein Handle wird aufgelöst und kryptografisch verifiziert (Registrierungssignatur + Eigentümersignatur + Trust-on-First-Use-Pinning); falls sich der Schlüssel eines Handles jemals unbemerkt ändert, zeigt QoreX eine ausdrückliche Warnung an.
3. Geben Sie den Betrag ein. Die Vorschau zeigt den Empfänger, den Betrag, die Gebühr und den **Shield**-Status – das Post-Quantum-Schutzniveau der Signatur.
4. Bestätigen Sie mit **biometrischer** Freigabe. QoreX signiert die Überweisung mit der obligatorischen hybriden Post-Quantum-Signatur (ML-DSA-87 + secp256k1) und sendet sie über die Native-Lane.

Ihre **erste** Überweisung registriert außerdem Ihren Post-Quantum-Schlüssel automatisch on-chain – dies können Sie unter [Sicherheit & Wiederherstellung](/qorex/security-and-recovery#pqc-key) sehen. Ein separater Schritt ist nicht erforderlich.

## QOR empfangen

Tippen Sie auf **Empfangen**, um Ihre `qor1…`-Adresse als QR-Code (mit eingebettetem QoreChain-Symbol) und eine Kopierschaltfläche anzuzeigen. Teilen Sie eines von beidem mit dem Absender.

## Eine Zahlung anfordern

Tippen Sie auf **Anfordern** (erfordert [Anmeldung](/qorex/account-and-dashboard#sign-in)), um eine Zahlungsanforderung zu erstellen – einen Betrag samt optionalem Memo – als QR-Code oder Link. Wer ihn scannt, sieht die vorausgefüllte Überweisung.

## Externe Netzwerke & Token

Über **Alle Netzwerke** (oder Extern-Senden) können Sie **ETH, BNB, POL, ARB und SOL** nativ senden, dazu **ERC-20**- und **SPL**-Token – alle aus derselben Wiederherstellungsphrase abgeleitet (ETH verwendet `m/44'/60'`, SOL verwendet seinen Standardpfad und SPL verwendet Associated Token Accounts).

:::caution Externe Chains sind ausschließlich klassisch
Andere Blockchains können keine Post-Quantum-Signaturen tragen. Wenn Sie über ein externes Netzwerk senden, weist QoreX ausdrücklich darauf hin (die Überweisung verwendet eine klassische Signatur und der **Shield** zeigt die Herabstufung an). Ihr **QOR** verbleibt stets auf der geschützten Native-Lane. Cosmos-basierte externe Sendungen unterstützen ein optionales Memo.
:::

## Swap

Der **Swap**-Tab ist mit dem On-Chain-AMM von QoreChain verbunden, bleibt aber deaktiviert – die Schaltfläche zeigt **„Swap — coming with pool liquidity"** – bis Liquidität und das Remote-Feature-Flag ihn aktivieren. Sobald das geschieht, leuchtet er automatisch auf; **es ist kein App-Update erforderlich**.

## Nächste Schritte

- [Portfolio & Staking](/qorex/portfolio-and-staking) – sehen Sie Ihre Allokation und verdienen Sie Belohnungen.
- [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) – schützen und stellen Sie Ihre Wallet wieder her.
