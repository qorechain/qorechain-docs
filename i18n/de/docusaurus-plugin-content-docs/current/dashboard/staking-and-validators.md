---
slug: /dashboard/staking-and-validators
title: Staking & Validatoren
sidebar_label: Staking & Validatoren
sidebar_position: 8
---

# Staking & Validatoren

Die Seite **Validators** (`/validators`) ermöglicht es dir, die Validatoren des Netzwerks zu überprüfen – sie ist ein reiner Nur-Lese-Browser, ohne Wallet-Verbindung und ohne Delegieren-Schaltfläche. Die eigentlichen Staking-Aktionen (delegieren, Delegierung aufheben, einfordern) befinden sich stattdessen auf der Seite **Wallet**, in den Tabs **Stake / Delegate** und **Rewards**, sobald deine QoreX-Wallet dort verbunden ist. Delegieren trägt zur Sicherung des Netzwerks bei und bringt Staking-Belohnungen ein. Für die Konzepte hinter Delegation und Belohnungen siehe [Staking & Delegation](/user-guide/staking-and-delegation).

QoreChain-Staking wird post-quantensicher signiert, sodass das Dashboard niemals einen Schlüssel besitzt, mit dem eine Delegation signiert werden könnte. Jede der folgenden Staking-Aktionen funktioniert nach demselben Muster: Du stellst die Anfrage im Dashboard zusammen (welcher Validator, wie viel), genehmigst und signierst sie dann **in deiner verbundenen QoreX-Wallet** – der App oder der Browser-Erweiterung ab **Version 0.2.2 oder neuer** (siehe [welche Version wo aktiv ist](/qorex/overview#platform-availability); bei einer älteren Erweiterungsversion bittet dich das Dashboard um ein Update, statt stillschweigend zu scheitern) – genau wie beim [Sende-Ablauf](/dashboard/wallet#mainnet). Das Dashboard sendet nur die Parameter über einen `qorex://tx?...`-Link; QoreX rekonstruiert, signiert und sendet die eigentliche Transaktion selbst. Verbinde zuerst deine Wallet – siehe [Die Wallet im Mainnet verwenden](/dashboard/wallet#mainnet).

Staking, Delegation und Validierung finden ausschließlich auf der Native-Schiene (Cosmos) statt, unter Verwendung der hybriden post-quantensicheren Signatur – niemals über ein EVM-Precompile. Dies ist eine dauerhafte Sicherheitseigenschaft und keine vorübergehende Lücke: Die EVM-Schiene läuft mit einem einzigen Ante-Decorator, sodass die Prüfungen für Validator-Lizenz, Mindest-Self-Bond und PQC, die im Ante der Native-Schiene verankert sind, allesamt umgangen würden, wenn Staking dort verfügbar gemacht würde. Eine mit MetaMask verknüpfte Adresse kann QOR senden und empfangen (siehe [Die Wallet im Mainnet verwenden](/dashboard/wallet#mainnet)), kann aber nicht staken – das kann ausschließlich eine mit QoreX verbundene Adresse.

## Validatoren überprüfen

Die Seite öffnet sich mit Übersichtskarten zur Anzahl der aktiven Validatoren, zur insgesamt gebundenen QOR-Menge, zur durchschnittlichen Provision und zur durchschnittlichen Verfügbarkeit. Darunter befindet sich die Validatorenliste. Jede Validator-Zeile zeigt:

- Einen **Rang** und den **Moniker** (Namen) des Validators, mit seiner Adresse und einer Kopier-Schaltfläche.
- **Voting Power** – der gebundene Stake des Validators und sein Anteil an der Gesamtmenge.
- **Provision** – der Prozentsatz, den der Validator von den Belohnungen einbehält.
- **APY** – die geschätzte Jahresrendite für das Delegieren.
- **Status** – zum Beispiel aktiv oder gesperrt (jailed).
- Betriebsdetails: Region, Verfügbarkeit, vorgeschlagene Blöcke, Softwareversion und zuletzt gesehen.

Ein Suchfeld filtert die Liste nach Validatorname oder Adresse.

Diese Seite dient ausschließlich dem Vergleich von Validatoren. Um tatsächlich an einen zu delegieren, geh zur Seite **Wallet** – siehe unten.

## Einen Validator auswählen

Wenn du einen Validator zum Delegieren auswählst, beachte Folgendes:

- **Provision** – ein niedrigerer Satz lässt dir mehr Belohnungen, aber nachhaltig arbeitende Betreiber brauchen einen angemessenen Anteil.
- **Verfügbarkeit und Status** – bevorzuge aktive Validatoren mit hoher Verfügbarkeit; ein gesperrter (jailed) Validator verdient nichts. Ein Validator wird gesperrt, wenn er das Signieren bei mehr als 5% der Blöcke innerhalb eines 10,000-Block-Fensters (etwa sechs Stunden bis zum Erreichen dieser Schwelle) verpasst – er verdient dann nichts, weder für dich noch für sich selbst, bis er das Problem behebt und die Sperre aufgehoben wird (unjail). Eine Downtime-Sperre dauert fest **600 Sekunden (10 Minuten)** und kostet den Validator **1% seines Stakes**; Double-Signing ist ein separates, schwerwiegenderes Vergehen, das mit **5%** geslasht wird. Diese Werte sind die aktuell live geltenden Chain-Parameter – behandle jeden anderswo gesehenen älteren Wert als überholt.
- **Voting Power** – das Verteilen des Stakes auf mehrere Validatoren unterstützt die Dezentralisierung. Im Delegate-Panel werden die Validatoren genau aus diesem Grund nach der kleinsten Größe zuerst aufgelistet.

## Delegieren, Umdelegieren, Delegierung aufheben und Belohnungen einfordern

Alle vier Aktionen befinden sich auf der Seite **Wallet** (`/dashboard/wallet`), nicht auf der Validators-Seite. Öffne die Wallet, verbinde QoreX, falls noch nicht geschehen (siehe [Die Wallet im Mainnet verwenden](/dashboard/wallet#mainnet)), und verwende dann den Tab **Stake / Delegate** zum Delegieren und Aufheben der Delegierung sowie den Tab **Rewards** zum Einfordern.

### Delegieren {#delegate}

1. Wähle auf der Seite **Wallet** den Tab **Stake / Delegate**.
2. Prüfe im Panel **Delegate QOR** die Infobox oben – sie zeigt deinen aktuell gebundenen Gesamtbetrag im Vergleich zur Light-Node-Stake-Schwelle und ob du sie bereits erreichst. Diese Schwelle wird gegen deinen **insgesamt delegierten Stake über alle Validatoren hinweg** geprüft, nicht pro Validator, sodass ein Fehlbetrag auf mehrere verteilt werden kann – es gibt keine Möglichkeit, direkt „an einen Light Node zu delegieren“, da Delegation immer auf einen Validator zielt und die Light-Node-Berechtigung eine separate Prüfung deines Gesamtbetrags ist.
3. Öffne das Dropdown **Validator** und wähle einen aus. Validatoren werden nach dem kleinsten Stake zuerst aufgelistet.
4. Gib einen **Amount (QOR)** ein.
5. Lies den Hinweis unter dem Betragsfeld: Das Unbonding dauert 21 Tage, und sobald QOR gebunden ist, kann es bis zum Ablauf dieser Frist weder bewegt noch verkauft werden.
6. Wenn das Panel eine Warnung anzeigt, dass diese Adresse nicht über genug verfügbares (spendable) QOR verfügt, um die Gebühr zu decken, sende ihr zuerst etwas verfügbares QOR – Vesting- oder gebundene Coins können die Gebühr nicht bezahlen. Die Schaltfläche **Continue in QoreX** bleibt deaktiviert, bis dies behoben ist.
7. Klicke auf **Continue in QoreX** (die Schaltfläche zeigt **Preparing…**, während die Anfrage erstellt wird).
8. Das Panel zeigt jetzt **Approve it in QoreX** mit einem Link **Open QoreX** und einer Request-ID. QoreX zeigt dir vor dem Signieren den Validator und den Betrag – es wird nichts gesendet, bevor du es dort genehmigst.
9. Öffne QoreX (der Link/Deeplink erledigt das) und genehmige die Delegation. QoreX erstellt, signiert und sendet die Transaktion; das Dashboard bekommt deinen Schlüssel niemals zu Gesicht.

### Umdelegieren {#redelegate}

Der zugrunde liegende Request-Vertrag unterstützt bereits das direkte Verschieben eines Bonds von einem Validator zu einem anderen (`redelegate`, mit einem Quell- und einem Ziel-Validator, die sich unterscheiden müssen) – nach demselben nicht-verwahrenden, QoreX-signierten Muster wie beim Delegieren und beim Aufheben der Delegierung. Zum Zeitpunkt der Erstellung dieses Textes stellt das Dashboard dafür jedoch noch kein eigenes Redelegate-Panel oder eine entsprechende Schaltfläche bereit.

Bis dieses Panel verfügbar ist, verschiebe einen Stake in zwei Schritten mithilfe der Abläufe auf dieser Seite zu einem anderen Validator:

1. Hebe die **[Delegierung auf](#undelegate)** für den Betrag beim Validator, den du verlassen möchtest.
2. Warte die in diesem Ablauf angezeigte Unbonding-Frist ab – das QOR ist während dieser Zeit weder bewegbar noch verdient es etwas.
3. Sobald das entbundene QOR wieder verfügbar (spendable) ist, **[delegiere](#delegate)** es an den neuen Validator.

Das dauert länger, als eine direkte Umdelegierung dauern würde (keine Bonding-Belohnungen während des 21-tägigen Unbonding-Fensters) – behandle diesen Weg also als vorübergehende Lösung, nicht als den vorgesehenen. Gebührenmäßig ist außerdem wissenswert, dass eine direkte Umdelegierung normalerweise die teuerste dieser Staking-Operationen ist und dass bereits der Schritt „Delegierung aufheben" in diesem Workaround spürbar mehr kostet als ein einfaches Delegieren allein – die Chain misst Gas pro Operation, statt eine Pauschalgebühr zu berechnen, und das Schreiben eines Unbonding-Queue-Eintrags ist echter Mehraufwand. Das reine Delegieren bleibt die günstigste der drei Operationen.

### Delegierung aufheben {#undelegate}

Das Beenden einer Delegierung ist jetzt im Dashboard verfügbar – eine Zeit lang war es möglich, zu delegieren, aber von hier aus überhaupt nicht zu unbonden. Falls du dich erinnerst, dass das gefehlt hat, liegt es daran.

:::caution 21-tägige Unbonding-Frist
Undelegiertes QOR kommt nicht sofort an. Es verbringt zunächst eine **21-tägige Unbonding-Frist**, während der es keine Belohnungen verdient und weder bewegt noch verkauft werden kann. Das Panel weist absichtlich zweimal darauf hin – einmal als Untertitel, ein weiteres Mal direkt über der Bestätigungsschaltfläche –, weil genau diejenigen, die in Eile auf diesen Bildschirm zugreifen (ein fallender Markt, ein gesperrter Validator), es am dringendsten vor dem Signieren sehen müssen.
:::

1. Wähle auf der Seite **Wallet** den Tab **Stake / Delegate** und scrolle zum Panel **Unbond QOR** unterhalb von Delegate. Sein Untertitel wiederholt bereits die obige Warnung zur 21-tägigen Unbonding-Frist.
2. Wenn diese Adresse keine aktiven Delegationen hat, weist das Panel darauf hin und endet hier.
3. Öffne das Dropdown **Unbond from** und wähle die zu reduzierende Delegation – es listet nur Validatoren auf, an die du tatsächlich delegiert hast, jeweils mit dem gebundenen Betrag.
4. Gib einen **Amount (QOR)** zum Unbonden ein, oder klicke auf **Unbond all `<amount>` QOR**, um den vollständigen gebundenen Betrag für diesen Validator einzutragen.
5. Wenn du mehr eingibst, als bei diesem Validator gebunden ist, weist das Panel darauf hin und blockiert das Absenden.
6. Direkt über der Bestätigungsschaltfläche erscheint die Warnung ein zweites Mal: Das QOR kommt in 21 Tagen an, nicht sofort, und verdient bis dahin nichts. Das ist eine bewusste Wiederholung, kein Tippfehler in der Dokumentation – lies sie noch einmal, bevor du fortfährst.
7. Wenn die Adresse die Gebühr nicht decken kann (gebundene Coins können sie nicht bezahlen – du brauchst hier zuerst etwas verfügbares QOR), warnt dich das Panel und deaktiviert die Schaltfläche.
8. Klicke auf **Continue in QoreX** (**Preparing…**, während die Anfrage erstellt wird).
9. Das Panel zeigt **Approve it in QoreX** mit einem Link **Open QoreX** und einer Request-ID – QoreX zeigt den Validator und den Betrag an, bevor du signierst.
10. Öffne QoreX und genehmige. Es signiert und sendet das Undelegate; das QOR wird erst wieder verfügbar (spendable), nachdem die 21-tägige Unbonding-Frist abgelaufen ist.

### Belohnungen einfordern {#claim}

1. Wähle auf der Seite **Wallet** den Tab **Rewards**.
2. Das Panel **Staking rewards** liest deine aufgelaufenen Belohnungen über alle Validatoren hinweg, an die du delegiert hast. Wenn von dieser Adresse nichts gestaked ist, weist es darauf hin, und es gibt nichts einzufordern.
3. Andernfalls zeigt es den insgesamt zum Einfordern bereitstehenden Betrag, dazu eine Zeile pro Validator mit dem dort aufgelaufenen Betrag. Belohnungen laufen fortlaufend auf und gehen durch Warten nie verloren – es gibt keine Frist.
4. Klicke auf **Claim in QoreX**. Das ist ein Claim-all: Es fordert die aufgelaufenen Belohnungen von allen angezeigten Validatoren in einer einzigen Anfrage ein – es gibt keine Schaltfläche zum Einfordern pro Validator.
5. Genehmige den Claim in QoreX (über den Link **Open QoreX**), um ihn zu signieren und zu senden.

:::note Unbonding-Frist
Undelegiertes QOR durchläuft eine 21-tägige Unbonding-Frist, bevor es wieder verfügbar (spendable) ist; während dieser Zeit verdient es keine Belohnungen. Einzelheiten findest du unter [Staking & Delegation](/user-guide/staking-and-delegation).
:::

## Verwandt

- [Staking & Delegation](/user-guide/staking-and-delegation) – vollständige Staking-Konzepte.
- [Die Wallet im Mainnet verwenden](/dashboard/wallet#mainnet) – verbinde QoreX, bevor du mit dem Staking beginnst.
- [Explorer Validators](/dashboard/explorer#validators) – Validatoren ohne Wallet durchsuchen.
- [Tools Hub](/dashboard/tools-hub) – bewirb dich, um deinen eigenen Validator zu betreiben.
