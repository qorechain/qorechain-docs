---
slug: /qorex/portfolio-and-staking
title: Portfolio & Staking
sidebar_label: Portfolio & Staking
sidebar_position: 4
---

# Portfolio & Staking

Diese Seite behandelt die Portfolio-Ansicht und das Staking in QoreX: QOR an Validatoren delegieren, Belohnungen beanspruchen, Stake verschieben, Unstaking und, in Builds, die es enthalten, zeitgesperrtes Staking. Sie richtet sich an alle, die QOR in der Mobile-App oder der Erweiterung halten.

## Portfolio

Die **Portfolio**-Ansicht (beim ersten Öffnen in jeder Sitzung biometrisch gesichert) zeigt einen **Allokations-Donut** - Ihre QOR über ihre drei Lanes hinweg vereinheitlicht (Native, EVM, SVM) - mit einer Beschriftung unter dem Ring sowie einer Zeile für jeden Vermögenswert. Prozentwerte erscheinen, sobald der Preis-Feed aktiv ist, und jedes Guthaben zeigt neben dem QOR-Betrag seinen geschätzten Wert in USD. Im **Testnet** wird QOR **ohne USD-Wert** angezeigt - Test-Token haben keinen.

Verwenden Sie **+ Coin or token**, um Coins und Tokens hinzuzufügen, bevor Sie welche halten, und **Receive**, um ihre Adressen zu erhalten - siehe [Coins und Tokens](/qorex/send-and-receive#coins-and-tokens).

**Woher der Preis stammt.** QoreX liest ihn von `GET https://api.qore.network/v1/price/{symbol}` - einem öffentlichen Endpunkt von uns, kein direkter Aufruf an eine Börse. Nichts auf Ihrem Gerät kommuniziert mit einer Preisquelle außerhalb der eigenen Infrastruktur von QoreChain, sodass Ihre IP-Adresse niemals einer solchen ausgesetzt wird. Wenn wirklich kein belastbarer Preis verfügbar ist, antwortet der Endpunkt mit einem Fehler statt zu raten - QoreX zeigt den Preis dann als nicht verfügbar an, statt jemals eine erfundene Null oder einen veralteten Wert so darzustellen, als wäre er aktuell.

Tippen Sie auf einen beliebigen Vermögenswert, um die **Asset-Detailansicht** zu öffnen, die Folgendes zeigt:

- **Guthabenverlauf** - ein echter Trend, erstellt aus Ihren On-Chain-Transfers.
- **Letzte Aktivität** - Transaktionszeilen mit umgekehrter **@handle**-Auflösung, sodass Gegenparteien wo möglich mit Namen angezeigt werden. Tippen Sie auf eine Zeile, um deren vollständige Details zu öffnen: Betrag, Gegenpartei, Block, Transaktions-Hash und Signatur.

## Staking & Earn

Das Staking von QOR trägt zur Absicherung von QoreChain bei und bringt Ihnen Belohnungen ein, die nicht garantiert sind. Alle Staking-Vorgänge sind echte On-Chain-Transaktionen auf der hybrid signierten nativen Lane: Jede wird zweimal signiert, mit einem klassischen Schlüssel und mit ML-DSA-87 (FIPS 204). Staking läuft nie über einen EVM-Precompile.

### Mit einem Validator staken

1. Öffnen Sie **Stake**.
2. Wählen Sie einen Validator aus der Liste (live von der Chain geladen, der kleinste Stake wird zuerst angezeigt, und jeder aktuell inhaftierte („jailed“) Validator wird ausgeschlossen - an einen solchen zu delegieren ist nie das, was Sie wollen). Validatoren, bei denen Sie bereits QOR haben, tragen ein *staked*-Badge.
3. Geben Sie einen Betrag ein. Während Sie tippen, warnt Sie QoreX, wenn der verbleibende Rest die nächste Netzwerkgebühr nicht decken würde: *"This leaves \{remaining\} QOR - less than the \{fee\} QOR a transaction costs. You would not be able to unstake or claim rewards until this account holds QOR for the fee again."* Es ist eine Warnung, keine Sperre - es ist Ihr Geld -, aber Unstaking und Beanspruchen kosten beide eine Gebühr aus Ihrem **liquiden** Guthaben, sodass ein Staken bis auf nahezu nichts den Stake blockiert, bis jemand QOR einzahlt.
4. **Bestätigen** Sie (auf dem Handy per Biometrie). Sie können Vesting-QOR bis zu Ihrem Gesamtbetrag staken, aber die Netzwerkgebühr muss aus Ihrem **entsperrten** QOR stammen - Vesting-QOR kann keine Gebühren bezahlen.
5. Beanspruchen Sie Belohnungen vom selben Bildschirm aus, sobald sie anfallen - siehe unten.

:::note Eine gewöhnliche Delegation hat keine Bindungsfrist; gewartet wird nur beim Ausstieg
Eine gewöhnliche Delegation hat keine feste Laufzeit: Sie bleibt aktiv, wobei Belohnungen ab dem nächsten Block fließen, bis Sie das Undelegieren beantragen. Es gibt kein Ablaufdatum zum Verlängern und keine Mindest-Stakingdauer. Die einzige Wartezeit gilt beim Ausstieg: Sobald Sie undelegieren, verbleibt dieses QOR in einer 21-tägigen Unbonding-Periode, in der es weder Erträge bringt noch bewegt werden kann, bevor es wieder in Ihrem verfügbaren Guthaben erscheint. Wenn Sie eine Delegation stattdessen zu einem anderen Validator verschieben (redelegieren), entfällt diese Wartezeit vollständig. Das Chain-Release v3.2.4 (im Mainnet seit dem 23. Oktober 2026) fügt eine optionale zeitgesperrte Form des Stakings hinzu, die neuere QoreX-Builds nutzen können: siehe [Staking-Sperren](#staking-locks) unten. In Builds ohne sie (iOS 1.1.8, Chrome 0.3.8, Safari 0.3.8) ist jede Delegation, die Sie vornehmen, eine gewöhnliche ohne Sperre. Siehe auch [Gibt es eine Bindungsfrist?](/user-guide/staking-and-delegation#lock-in-period).
:::


### Staking-Sperren {#staking-locks}

Staking-Sperren sind heute in Android 1.1.9 und in der Firefox-Erweiterung 0.3.9 enthalten; iOS, Chrome und Safari erhalten sie, sobald ihre Stores diese Builds ausliefern. Eine Sperre ist optional. Sie bindet einen Teil Ihres Stakes für 3, 6 oder 12 Monate im Gegenzug für einen Bonus.

- **Der angezeigte Bonus ist der, den die Sperre heute einbringt**, unterhalb der Obergrenze, die das Netzwerk setzt. Er kann sich ändern, wenn sich die Netzwerkbedingungen ändern, und ist nicht garantiert.
- **Der Stufenplan ist mit „up to“ gekennzeichnet**, und der heutige Wert wird daneben angezeigt.
- **Vorzeitiges Entsperren** liegt hinter einer zweiten Bestätigung, die die Kosten nennt, bevor Sie signieren.
- **Unstake und Move stake sind auf den entsperrten Teil** Ihres Stakes beschränkt.

Wie das Modul On-Chain funktioniert, siehe [Zeitgesperrtes Staking](/user-guide/staking-and-delegation#time-locked-staking).

### Stake zwischen Validatoren verschieben (redelegieren) {#move-stake}

Verschieben Sie bereits gestaktes QOR zu einem anderen Validator - oder verteilen Sie es auf mehrere -, ohne die 21-tägige Unbonding-Warteschlange überhaupt zu berühren. Der Stake erwirtschaftet während des gesamten Vorgangs weiterhin Belohnungen.

1. Öffnen Sie **Stake** und tippen Sie auf den Validator, bei dem Ihr QOR aktuell steht; das Panel bietet **Move stake** an.
2. Wählen Sie, wohin es gehen soll - entscheiden Sie sich für ein einzelnes Ziel oder mehrere gleichzeitig. Beim Verteilen auf mehrere Ziele wird der Betrag gleichmäßig aufgeteilt, und der genaue Betrag für jeden Validator wird vor der Bestätigung angezeigt.
3. Bestätigen Sie mit biometrischer Freigabe. Jedes Ziel wird in einer **einzigen Transaktion** bewegt - eine Gebühr, und entweder gelangt die gesamte Verschiebung an oder keine davon.

Dies ist der richtige Schritt, wenn ein Validator, an den Sie delegiert haben, inhaftiert wird oder seine Provision erhöht - bevor es diese Funktion gab, führte der einzige Ausweg über Unstaking und eine 21-tägige Wartezeit ohne Erträge; das Verschieben kostet dagegen weder Wartezeit noch entgangene Belohnungen.

:::caution Es gibt eine Obergrenze pro Paar, und die Gebühr wird auch beim Erreichen fällig
Die Chain erlaubt höchstens **7 gleichzeitig laufende Redelegierungen für dasselbe (Quell-, Ziel-)Validatorpaar** - bei normaler Nutzung kommen Sie dem nicht annähernd nahe, aber QoreX prüft dieses Limit vor der Signatur und warnt Sie, wenn Sie es erreicht haben. Wird das Limit überschritten, schlägt die Transaktion On-Chain fehl, und die Netzwerkgebühr wird trotzdem fällig - versuchen Sie also nicht erneut, eine aus diesem Grund bereits abgelehnte Verschiebung durchzuführen, ohne zuvor abzuwarten, bis eine bestehende abgeschlossen ist.

Eine weitere Regel der Chain: Stake, den Sie gerade **in** einen Validator verschoben haben, kann von diesem Validator nicht **weiter** verschoben werden, bis die Verschiebung, die ihn dorthin gebracht hat, abgeschlossen ist (21 Tage) - QoreX teilt Ihnen mit, wenn eine Verschiebung aus diesem Grund abgelehnt wird. Sie können ihn weiterhin unstaken oder Stake verschieben, der bereits bei diesem Validator lag.
:::

### Beanspruchen und Claim & restake {#claim}

- **Claim** sammelt Ihre Belohnungen in Ihrem Guthaben ein. QoreX beansprucht nur bei Validatoren, bei denen tatsächlich Belohnungen bereitliegen.
- **Claim & restake** (Schaltfläche *Claim & restake*: "Compound \{amount\} QOR back to the same validators, in one transaction.") beansprucht die Belohnungen und delegiert sie direkt zurück an die Validatoren, die sie erwirtschaftet haben - eine Transaktion, eine Gebühr. Es wird nur angeboten, wenn QoreX die Aufschlüsselung pro Validator lesen kann.
- **Gebührenprüfung.** Die Gebühr wird *bevor* die Belohnungen eintreffen bezahlt. Kann Ihr entsperrtes QOR sie nicht decken, stoppt QoreX vor der Signatur und nennt den benötigten Betrag ("Claiming needs about \{fee\} QOR unlocked for the network fee - it is paid before the rewards arrive."); senden Sie etwas QOR an diese Adresse und versuchen Sie es erneut. Vesting-QOR kann keine Gebühren bezahlen.

### Undelegieren

1. Öffnen Sie **Stake** und tippen Sie auf den Validator. Wenn Sie QOR bei ihm haben, bietet das Panel **Unstake** (und **Move stake**) an.
2. Geben Sie den Betrag ein. Das Panel zeigt, wie viel Sie bei diesem Validator haben, und über der Schaltfläche **Unstake** den Hinweis "Unstaking takes 21 days before the QOR is yours to move" - Sie sehen die 21-tägige Wartezeit, bevor Sie bestätigen.
3. Bestätigen Sie mit biometrischer Freigabe. Das QOR hört sofort auf, Erträge zu bringen, und wird nach Abschluss der Unbonding-Periode wieder verfügbar.

### Unstaking in progress {#unbonding}

Unstaktes QOR verlässt für 21 Tage sowohl Ihre Delegation als auch Ihr verfügbares Guthaben. QoreX listet es unter **Unstaking in progress** auf - *"\{amount\} QOR unstaking"*, jeder Eintrag mit der verbleibenden Zeit (*\{days\}d \{hours\}h \{minutes\}m left*, oder *Less than a minute left*, oder *The wait is over - this should be back in your balance.*). Kann QoreX nicht lesen, wann ein Eintrag abgeschlossen ist, sagt es das und behält den Betrag in der Summe. Ist Ihr Node nicht erreichbar, bleibt die Liste, wie sie war - sie wird nie als „nichts im Unstaking“ gelesen.

:::note Unstaking, wenn Sie einen Validator betreiben
Gehört Ihre Wallet einem Validator-Betreiber, wird das Unstaking abgelehnt, wenn es Ihre Self-Bond unter die erforderlichen 100.000 QOR senken würde: *"Unstaking this much would drop your validator's self-bond below the required 100,000 QOR. The floor applies for as long as the validator operates."*
:::

### Earn

Die **Earn**-Ansicht fasst Ihr Staking an einem Ort zusammen: Ihr gestaktes QOR, Ihre beanspruchbaren Belohnungen, bei wie vielen Validatoren Sie sind, und den Anteil des gesamten QOR, der netzwerkweit gestakt ist. Sie zeigt keine Staking-Rate: Die Chain veröffentlicht keine Emissionszahl, aus der sich eine Rate ableiten ließe, daher zeigt QoreX *Not available* statt einer Zahl, die es nicht belegen kann.

In der Erweiterung hat der Stake-Bildschirm dieselben Bestandteile (gestakte Summe, Belohnungen, **Claim**, **Claim & restake**, **Unstake**, **Move stake**, eine Kontoauswahl, wenn Sie mehrere Konten haben, und die Unstake-Warnung).

## Nächste Schritte

- [Senden & Empfangen](/qorex/send-and-receive) - QOR und externe Vermögenswerte bewegen.
- [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) - Guardians, Legacy-Vererbung und Geräteverknüpfung.

## Grenzen und bekannte Probleme {#limits}

- Belohnungen sind nicht garantiert. QoreX zeigt keine Gesamt-Staking-Rate.
- Staking-Sperren sind nicht in iOS 1.1.8, Chrome 0.3.8 oder Safari 0.3.8 enthalten.
- Unstaktes QOR braucht 21 Tage, um zurückzukehren; das Verschieben von Stake zwischen Validatoren hat keine Wartezeit, ist aber auf 7 gleichzeitig laufende Redelegierungen für dasselbe Validatorpaar begrenzt.
- Vesting-QOR kann gestakt werden, aber keine Gebühren bezahlen; die Gebühr muss aus entsperrtem QOR stammen.
- Das Portfolio gibt es nur mobil. Im Testnet zeigt QOR keinen USD-Wert.
