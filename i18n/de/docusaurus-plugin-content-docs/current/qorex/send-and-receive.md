---
slug: /qorex/send-and-receive
title: Senden & Empfangen
sidebar_label: Senden & Empfangen
sidebar_position: 3
---

# Senden & Empfangen

Der Tab Home (Wallet) ist Ihr Ausgangspunkt. Er zeigt ein **Netzwerk-Badge** (standardmäßig MAINNET, oder TESTNET, wenn Sie den Entwickler-Schalter aktiviert haben), Ihr **Gesamtguthaben** (zum Ein-/Ausblenden antippen) und die Hauptaktionen: **Senden · Empfangen · Swap · Staken**. Ihre Asset-Liste zeigt **QOR** (Native + Post-Quantum 🛡, ein einheitliches Guthaben über die Native-/EVM-/SVM-Lanes hinweg) und **Alle Netzwerke** (eine einheitliche Ansicht über ETH, BNB, POL, ARB und die weiteren [externen Netzwerke](#external-networks-tokens), die QoreX unterstützt).

## Quantensicheres QOR senden

1. Tippen Sie auf **Senden**.
2. Geben Sie den Empfänger als `qor1…`-Adresse **oder** als **@Handle** ein. Ein Handle wird aufgelöst und kryptografisch verifiziert (Registry-Signatur + Besitzer-Signatur + Trust-on-First-Use-Pinning); sollte sich der Schlüssel eines Handles jemals stillschweigend ändern, zeigt QoreX eine ausdrückliche Warnung an.
3. Geben Sie den Betrag ein. Die Vorschau zeigt Empfänger, Betrag, Gebühr und den **Shield**-Status — die Post-Quantum-Schutzstufe der Signatur.
4. Bestätigen Sie mit **biometrischer** Freigabe. QoreX signiert die Überweisung mit der obligatorischen hybriden Post-Quantum-Signatur (ML-DSA-87 + secp256k1) und überträgt sie auf der Native-Lane.

Ihre **erste** Überweisung registriert außerdem automatisch Ihren Post-Quantum-Schlüssel on-chain — Sie können dies unter [Sicherheit & Wiederherstellung](/qorex/security-and-recovery#pqc-key) sehen. Ein separater Schritt ist nicht nötig.

### Senden an ein @Handle, Schritt für Schritt {#handle-send}

1. Öffnen Sie **Senden** und geben Sie im Empfängerfeld statt einer Adresse `@` gefolgt vom Handle ein (zum Beispiel `@liviu`).
2. QoreX schlägt das Handle nach und zeigt Ihnen die **aufgelöste `qor1…`-Adresse**, bevor Sie irgendetwas bestätigen.
3. Überprüfen Sie die aufgelöste Adresse, geben Sie den Betrag ein und bestätigen Sie wie gewohnt.

QoreX akzeptiert eine Auflösung nur, wenn sie **beide** durchgeführten Prüfungen besteht: eine Registry-Attestierung, die gegen einen in der App fest hinterlegten Trust-Key verifiziert wird, und die eigene Signatur des Handle-Besitzers über den Anspruch. Scheitert eine der beiden Prüfungen, wirft QoreX einen Fehler, statt auf eine unverifizierte Adresse zurückzufallen. Beim ersten Mal, dass Sie an ein bestimmtes Handle zahlen, merkt sich QoreX die aufgelöste Adresse; sollte sich die Adresse dieses Handles jemals ändern, stoppt QoreX vor dem Signieren und zeigt Ihnen die alte und die neue Adresse nebeneinander, damit Sie entscheiden können, ob Sie fortfahren möchten. Dieses Gedächtnis gilt **pro Gerät** — zahlen Sie erstmals an dasselbe Handle von einem anderen Telefon oder einer frischen Installation aus, erscheint es auch dort als neu, was erwartet ist und kein Fehler. Die Browser-Erweiterung löst Handles auf und bezahlt sie auf dieselbe Weise (ihr Gedächtnis gilt **pro Browser**, sodass ein anderer Browser oder Computer es als neu ansieht) — siehe [Senden an ein @Handle](/qorex/browser-extension#handle-send).

### Vesting-(gesperrtes) QOR senden {#vesting}

Wenn ein Teil Ihres Guthabens noch **vestet** — zum Beispiel eine noch nicht freigegebene TGE-Zuteilung —, wird Ihr Gesamtbetrag aufgeteilt in **jetzt verfügbar** und **noch gesperrt**. Sie können nur den verfügbaren Anteil senden; QoreX weist einen Überausgabe-Versuch selbst zurück, statt das Netzwerk diesen erst nach Abzug einer Gebühr ablehnen zu lassen. Der gesperrte Anteil wird schrittweise ausgabefähig, sobald der Vesting-Zeitplan ihn freigibt. Diese Aufteilung wird überall dort angezeigt, wo Ihr Guthaben erscheint — Home, Senden und Asset-Detail.

## QOR empfangen

Tippen Sie auf **Empfangen**, um Ihre `qor1…`-Adresse als QR-Code (mit eingebettetem QoreChain-Icon) und eine Kopieren-Schaltfläche anzuzeigen. Teilen Sie eines von beidem mit dem Absender.

:::note Erstmaliger Empfang eines Assets eines externen Netzwerks
Der Bildschirm **Empfangen** zeigt nur ein Netzwerk, auf dem Sie bereits ein Guthaben halten — wenn Sie also noch nie ETH gehalten haben, gibt es dort noch keine ETH-Option zur Auswahl. Ihre EVM-Adresse existiert bereits ab dem Moment, in dem Ihre Wallet existiert (sie wird aus derselben Recovery-Phrase abgeleitet) und ist über Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet und Avalanche hinweg dieselbe Adresse — finden und kopieren Sie sie stattdessen unter **Einstellungen → Adressen** und teilen Sie diese. Sobald eine Überweisung eingeht, erscheint dieses Netzwerk fortan unter Empfangen.
:::

## Eine Zahlung anfordern

Tippen Sie auf **Anfordern** (erfordert [Anmeldung](/qorex/account-and-dashboard#sign-in)), um eine Zahlungsanfrage — einen Betrag plus ein optionales Memo — als QR-Code oder Link zu erstellen. Wer sie scannt, sieht die vorausgefüllte Überweisung.

## Externe Netzwerke & Tokens {#external-networks-tokens}

Über **Alle Netzwerke** (oder Send-external) können Sie **ETH, BNB, POL, AVAX und SOL** nativ senden, außerdem ETH auf **Arbitrum, Base und OP Mainnet** sowie **ATOM, OSMO und TIA** auf Cosmos, dazu **ERC-20**-, **SPL**- und **IBC**-Tokens — USDC und USDT über die EVM-Chains und Solana hinweg, DAI auf Ethereum sowie Noble USDC über IBC — alle abgeleitet aus derselben Recovery-Phrase (ETH verwendet `m/44'/60'`, SOL verwendet seinen Standardpfad, und SPL verwendet Associated Token Accounts).

:::caution Externe Chains sind ausschließlich klassisch
Andere Blockchains können keine Post-Quantum-Signaturen tragen. Wenn Sie auf einem externen Netzwerk senden, weist QoreX ausdrücklich darauf hin (die Überweisung verwendet eine klassische Signatur, und **Shield** zeigt die Herabstufung an). Ihr **QOR** bleibt immer auf der geschützten Native-Lane. Cosmos-basierte externe Sendungen unterstützen ein optionales Memo.
:::

## Swap

Der Tab **Swap** ist an QoreChains On-Chain-AMM angebunden, bleibt aber deaktiviert — die Schaltfläche zeigt **„Swap – kommt mit Pool-Liquidität"** —, bis Liquidität und das Remote-Feature-Flag ihn aktivieren. Sobald das geschieht, leuchtet er automatisch auf; **es ist kein App-Update erforderlich**.

:::note iOS
Der Swap-Tab erscheint im App-Store-Build überhaupt nicht — Apple behandelt einen In-App-Token-Tausch als regulierten Dienst. Swap bleibt (sobald aktiviert) unter Android und in der Browser-Erweiterung verfügbar.
:::

## Nächste Schritte

- [Portfolio & Staking](/qorex/portfolio-and-staking) — sehen Sie Ihre Zuteilung und verdienen Sie Rewards.
- [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) — schützen und stellen Sie Ihre Wallet wieder her.
