---
slug: /dashboard/staking-and-validators
title: Staking & Validatoren
sidebar_label: Staking & Validatoren
sidebar_position: 8
---

# Staking & Validatoren

Diese Seite behandelt das Staking über das Dashboard: dein QOR an einen Validator delegieren, es unbonden und Belohnungen einfordern. Die Aktionen befinden sich im **Mainnet** auf der Seite **Wallet** (Tabs **Stake / Delegate** und **Rewards**), mit verbundener QoreX-Wallet. Um Validatoren zuerst zu vergleichen, nutze die schreibgeschützte Seite [Validators](/dashboard/validators). Für die Konzepte hinter Delegation und Belohnungen siehe [Staking & Delegation](/user-guide/staking-and-delegation).

## Innovationen {#innovations}

- **Das Dashboard hält nie einen Staking-Schlüssel.** Du stellst die Anfrage (welcher Validator, wie viel) im Dashboard zusammen, und QoreX rekonstruiert, zeigt, signiert mit der hybriden ML-DSA-87-Signatur und sendet sie. Das Dashboard sendet nur Parameter über einen `qorex://tx?...`-Link und erfährt nur den Transaktions-Hash. Der Ablauf ist derselbe wie beim [Sende-Ablauf](/dashboard/wallet#send-mainnet).
- **Dauerhaft nur die Native-Lane.** Staking, Delegation und Validator-Operationen finden ausschließlich auf der nativen (Cosmos-)Lane mit der hybriden Post-Quantum-Signatur statt, nie über einen EVM-Precompile. Eine mit MetaMask verknüpfte Adresse kann QOR empfangen und, bei geöffnetem EVM-Fenster, senden, aber nicht staken. Das kann nur eine mit QoreX verbundene Adresse.
- **Die Validator-Reihenfolge verteilt den Stake.** Es werden nur gebondete, nicht gejailte Validatoren aufgelistet, der kleinste zuerst. Der oberste Platz wird serverseitig zufällig aus der kleineren Hälfte gezogen, sodass der größte Validator nie die Voreinstellung ist.
- **Die Light-Node-Schwelle ist eine Gesamtsumme.** „Currently bonded“ wird gegen die Light-Node-Stake-Schwelle angezeigt, gezählt über alle deine Validatoren zusammen, sodass ein Fehlbetrag auf mehrere Validatoren verteilt werden kann.
- **Die Unbonding-Zeit wird dort gezeigt, wo sie zählt.** Die 21-tägige Unbonding-Frist wird von der Chain gelesen und bei Delegate einmal und bei Unbond zweimal angezeigt, absichtlich, weil man sie genau dort braucht.
- **Gebührenprüfung vor dem Signieren.** Das Panel liest dein verfügbares QOR (Vesting- und gebondete Coins ausgenommen) und hält **Continue in QoreX** deaktiviert, bis die Gebühr bezahlt werden kann.

## Anleitung {#how-to-use}

Voraussetzungen: angemeldet, Kopfzeile auf **Mainnet**, die [Bestätigung](/dashboard/overview#risk-acknowledgement) akzeptiert und eine QoreX-Wallet verbunden, wie unter [Die Wallet im Mainnet verwenden](/dashboard/wallet#mainnet) beschrieben.

### Einen Validator auswählen

Öffne [Validators](/dashboard/validators), um Provision, Voting Power und Status zu vergleichen. Die Seite liegt im Dashboard unter `/validators`: Sie erfordert, dass du angemeldet bist, hat keinen Seitenleisten-Link (gib die Adresse ein oder folge dem Link hier) und folgt dem in der Kopfzeile gewählten Netzwerk. Ihre APY-Spalte wird von der Chain gelesen und trägt den Hinweis „variable, not guaranteed, lock bonuses not included“ (oder lautet „From fees“); es wird keine Zahl versprochen. Beachte bei der Auswahl:

- **Provision:** Ein niedrigerer Satz lässt dir mehr Belohnungen, aber nachhaltig arbeitende Betreiber brauchen einen angemessenen Anteil.
- **Status:** Ein Validator wird gejailt, wenn er weniger als 5% der Blöcke in einem 10.000-Block-Fenster signiert, das sind im Mainnet bei etwa 3,1 Sekunden pro Block rund 8,3 Stunden verpasster Blöcke. Ein Downtime-Jailing dauert fest **600 Sekunden** und kostet den Validator **1% seines Stakes**; Double-Signing ist ein separates, schwerwiegenderes Vergehen, das **5%** slasht. Dies sind die aktuellen Live-Parameter der Chain (geprüft am 27. Oktober 2026).
- **Voting Power:** Den Stake auf mehrere Validatoren zu verteilen unterstützt die Dezentralisierung. Die Reihenfolge im Delegate-Panel hilft dabei.

### Delegieren {#delegate}

1. Öffne auf **Wallet** den Tab **Stake / Delegate** und suche das Panel **Delegate QOR**.
2. Lies die Infobox: **Currently bonded** im Vergleich zur **Light-node threshold** und ob du sie erreichst. Die Schwelle wird gegen deinen insgesamt delegierten Stake über alle Validatoren geprüft. Es gibt keine Möglichkeit, direkt „an einen Light Node zu delegieren“: Delegation zielt immer auf einen Validator, und die Light-Node-Berechtigung ist eine separate Prüfung deiner Gesamtsumme.
3. Öffne das Dropdown **Validator** und wähle einen aus. Der erste Eintrag wird zufällig aus der kleineren Hälfte der Validatoren gezogen und kann sich beim Neuladen ändern; die übrigen werden nach dem kleinsten Stake zuerst aufgelistet. Gejailte Validatoren werden nicht angeboten.
4. Gib einen **Amount (QOR)** ein.
5. Lies den Hinweis unter dem Betrag: Das Unbonding dauert 21 Tage, und gebondetes QOR kann bis zum Ablauf dieser Frist weder bewegt noch verkauft werden.
6. Warnt das Panel, dass die Adresse nicht genug verfügbares QOR für die Gebühr hat, sende ihr zuerst etwas verfügbares QOR. **Continue in QoreX** bleibt deaktiviert, bis dies behoben ist.
7. Wähle **Continue in QoreX** (es zeigt **Preparing...**, während die Anfrage erstellt wird).
8. Das Panel zeigt "Approve it in QoreX" mit **Open QoreX**, der Request-ID und **Approve in the browser extension**, wenn die Erweiterung erkannt wird. QoreX zeigt Validator und Betrag vor dem Signieren; es wird nichts gesendet, bevor du genehmigst.
9. Genehmige in QoreX. Es erstellt, signiert und sendet die Delegation.

**Minimales Beispiel:** 10 QOR an den ersten aufgelisteten Validator delegieren und in QoreX genehmigen.

:::note Zeitgesperrtes Staking ist nicht Teil des Dashboards
Das Release v3.2.4 bringt ein optionales Modul für zeitgesperrtes Staking mit (im Mainnet seit dem 23. Oktober 2026, im Testnet seit dem 19. Oktober 2026); siehe [Zeitgesperrtes Staking](/user-guide/staking-and-delegation#time-locked-staking). Weder das Dashboard noch QoreX haben dafür einen Bildschirm. Die hier vorgenommenen Delegationen sind gewöhnliche Delegationen ohne Bindungsfrist; die einzige Wartezeit ist das 21-tägige Unbonding beim Ausstieg.
:::

### Umdelegieren {#redelegate}

Das Dashboard hat kein Redelegate-Panel. **QoreX verschiebt Stake direkt zwischen Validatoren** (App ab 1.0.8 und Erweiterung ab 0.2.6): keine 21-tägige Unbonding-Wartezeit, keine verlorenen Belohnungen, und es kann eine Verschiebung in einer Transaktion auf mehrere Ziel-Validatoren aufteilen. Öffne **Stake** in QoreX, tippe auf den Validator, den du verlassen möchtest, und wähle, wohin der Stake gehen soll; siehe [Stake zwischen Validatoren verschieben](/qorex/portfolio-and-staking#move-stake).

Bei einem älteren QoreX-Build ohne diese Funktion verschiebst du den Stake stattdessen in zwei Schritten: [Delegierung aufheben](#undelegate), die Unbonding-Frist abwarten (das QOR ist währenddessen weder bewegbar noch verdient es etwas), dann an den neuen Validator [delegieren](#delegate). Dieser Workaround kostet 21 Tage Belohnungen und mehr Gebühren, aktualisiere QoreX also, wenn du kannst.

### Delegierung aufheben {#undelegate}

:::caution 21-tägige Unbonding-Frist
Undelegiertes QOR kommt nicht sofort an. Es verbringt zunächst eine **21-tägige Unbonding-Frist**, während der es keine Belohnungen verdient und weder bewegt noch verkauft werden kann. Das Panel weist absichtlich zweimal darauf hin, einmal als Untertitel und noch einmal direkt über der Bestätigungsschaltfläche.
:::

1. Öffne auf **Wallet** den Tab **Stake / Delegate** und scrolle zum Panel **Unbond QOR**, unterhalb von Delegate.
2. Hast du von dieser Adresse keine aktiven Delegationen, weist das Panel darauf hin und endet hier.
3. Öffne **Unbond from** und wähle die zu reduzierende Delegation. Es listet nur Validatoren auf, an die du delegiert hast, mit dem gebondeten Betrag.
4. Gib einen Betrag ein oder wähle **Unbond all X QOR**, um den vollständigen gebondeten Betrag einzutragen.
5. Die Eingabe von mehr als dem gebondeten Betrag blockiert das Absenden.
6. Lies die zweite Warnung über der Bestätigungsschaltfläche: Das QOR kommt in 21 Tagen an, nicht heute.
7. Kann die Adresse die Gebühr nicht decken (gebondete Coins können sie nicht bezahlen), warnt das Panel und deaktiviert die Schaltfläche.
8. Wähle **Continue in QoreX** (**Preparing...**, während die Anfrage erstellt wird) und genehmige dann in QoreX über **Open QoreX** oder **Approve in the browser extension**.

Das QOR wird erst wieder verfügbar, nachdem die 21-tägige Unbonding-Frist endet.

### Belohnungen einfordern {#claim}

1. Öffne auf **Wallet** den Tab **Rewards**.
2. Das Panel **Staking rewards** liest deine aufgelaufenen Belohnungen über jeden Validator, an den du delegiert hast. Ist von dieser Adresse nichts gestaket, weist es darauf hin.
3. Andernfalls zeigt es die insgesamt wartende Summe plus eine Zeile pro Validator. Belohnungen laufen fortlaufend auf und gehen durch Warten nicht verloren.
4. Wähle **Claim in QoreX**. Dies fordert von **allen** Validatoren auf einmal ein; es gibt kein Einfordern pro Validator.
5. Genehmige den Claim in QoreX (**Open QoreX** oder **Approve in the browser extension**).

## Zugang {#how-to-access}

- **Wo:** [dashboard.qorechain.io/wallet](https://dashboard.qorechain.io/wallet), Tabs **Stake / Delegate** und **Rewards**. Eine Anmeldung ist erforderlich.
- **Netzwerk:** nur Mainnet, mit verknüpfter QoreX-Wallet. Testnet-Wallets haben keinen Staking-Bildschirm.
- **Wallet:** QoreX (App oder Erweiterung). Keplr und MetaMask können im Dashboard nicht staken.
- **Kosten:** die Netzwerkgebühr, bezahlt aus verfügbarem QOR (Untergrenze 0.1 uqor pro Gas). Das Dashboard berechnet nichts.
- **Mittel:** Vesting-Guthaben zählen für das, was du delegieren kannst, können aber die Gebühr nicht bezahlen.

## Wo es veröffentlicht ist {#where-published}

| Oberfläche | Adresse | Netzwerk |
| --- | --- | --- |
| Delegate, Unbond, Rewards | `dashboard.qorechain.io/wallet` | Mainnet |
| Validatoren vergleichen | `dashboard.qorechain.io/validators`, siehe [Validators](/dashboard/validators) | Folgt dem Netzwerk der Kopfzeile |
| Stake zwischen Validatoren verschieben | QoreX, siehe [Portfolio & Staking](/qorex/portfolio-and-staking#move-stake) | Mainnet |

## Grenzen und bekannte Probleme {#limits}

- **Nicht im Dashboard:** Redelegation (nutze QoreX) und zeitgesperrtes Staking.
- **Kein Staking mit Testnet-Wallets** im Dashboard.
- **Schätzungen sind ungefähr:** Die im Panel angezeigte Gebührenschätzung und die Light-Node-Schwelle sind im Dashboard eingebaute Werte, nicht in diesem Moment von der Chain gelesen. QoreX zeigt die exakte Gebühr vor dem Signieren.
- **Das Unbonding dauert 21 Tage** und kann nicht verkürzt werden.
- **Claim ist Claim-all.**

## Verwandt

- [Validators](/dashboard/validators) - Validatoren, Provision und variable Rendite vergleichen.
- [Staking & Delegation](/user-guide/staking-and-delegation) - vollständige Staking-Konzepte.
- [Die Wallet im Mainnet verwenden](/dashboard/wallet#mainnet) - verbinde QoreX, bevor du mit dem Staking beginnst.
- [Explorer Validators](/dashboard/explorer#validators) - Validatoren ohne Wallet durchsuchen.
- [Nodes & Validators](/dashboard/tools-hub) - bewirb dich, um deinen eigenen Validator zu betreiben.
