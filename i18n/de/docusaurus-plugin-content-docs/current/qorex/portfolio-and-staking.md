---
slug: /qorex/portfolio-and-staking
title: Portfolio & Staking
sidebar_label: Portfolio & Staking
sidebar_position: 4
---

# Portfolio & Staking

## Portfolio

Die **Portfolio**-Ansicht (beim ersten Öffnen in jeder Sitzung biometrisch gesichert) zeigt einen **Allokations-Donut** — Ihre QOR über ihre drei Lanes hinweg vereinheitlicht (Native, EVM, SVM) — mit einer Beschriftung unter dem Ring sowie einer Zeile für jeden Vermögenswert. Prozentwerte erscheinen, sobald der Preis-Feed aktiv ist, und jedes Guthaben zeigt neben dem QOR-Betrag seinen geschätzten Wert in USD. Im **Testnet** wird QOR **ohne USD-Wert** angezeigt — Test-Token haben keinen.

Verwenden Sie **+ Coin or token**, um Coins und Tokens hinzuzufügen, bevor Sie welche halten, und **Receive**, um ihre Adressen zu erhalten — siehe [Coins und Tokens](/qorex/send-and-receive#coins-and-tokens).

**Woher der Preis stammt.** QoreX liest ihn von `GET https://api.qore.network/v1/price/{symbol}` — einem öffentlichen Endpunkt von uns, kein direkter Aufruf an eine Börse. Nichts auf Ihrem Gerät kommuniziert mit einer Preisquelle außerhalb der eigenen Infrastruktur von QoreChain, sodass Ihre IP-Adresse niemals einer solchen ausgesetzt wird. Wenn wirklich kein belastbarer Preis verfügbar ist, antwortet der Endpunkt mit einem Fehler statt zu raten — QoreX zeigt den Preis dann als nicht verfügbar an, statt jemals eine erfundene Null oder einen veralteten Wert so darzustellen, als wäre er aktuell.

Tippen Sie auf einen beliebigen Vermögenswert, um die **Asset-Detailansicht** zu öffnen, die Folgendes zeigt:

- **Guthabenverlauf** — ein echter Trend, erstellt aus Ihren On-Chain-Transfers.
- **Letzte Aktivität** — Transaktionszeilen mit umgekehrter **@handle**-Auflösung, sodass Gegenparteien wo möglich mit Namen angezeigt werden. Tippen Sie auf eine Zeile, um deren vollständige Details zu öffnen: Betrag, Gegenpartei, Block, Transaktions-Hash und Signatur.

## Staking & Earn

Das Staking von QOR trägt zur Absicherung von QoreChain bei und bringt Ihnen Belohnungen ein, die nicht garantiert sind. Alle Staking-Vorgänge sind echte On-Chain-Transaktionen, die Ihre Post-Quantum-Signatur tragen.

### Mit einem Validator staken

1. Öffnen Sie **Stake**.
2. Wählen Sie einen Validator aus der Liste (live von der Chain geladen, der kleinste Stake wird zuerst angezeigt, und jeder aktuell inhaftierte („jailed“) Validator wird ausgeschlossen — an einen solchen zu delegieren ist nie das, was Sie wollen). Validatoren, bei denen Sie bereits QOR haben, tragen ein *staked*-Badge.
3. Geben Sie einen Betrag ein. Während Sie tippen, warnt Sie QoreX, wenn der verbleibende Rest die nächste Netzwerkgebühr nicht decken würde: *„This leaves \{remaining\} QOR — less than the \{fee\} QOR a transaction costs. You would not be able to unstake or claim rewards until this account holds QOR for the fee again.“* (Dadurch bleiben \{remaining\} QOR übrig — weniger als die \{fee\} QOR, die eine Transaktion kostet. Sie könnten weder Unstaking durchführen noch Belohnungen beanspruchen, bis dieses Konto wieder QOR für die Gebühr hält.) Es ist eine Warnung, keine Sperre — es ist Ihr Geld —, aber Unstaking und Beanspruchen kosten beide eine Gebühr aus Ihrem **liquiden** Guthaben, sodass ein Staken bis auf nahezu nichts den Stake blockiert, bis jemand QOR einzahlt.
4. **Bestätigen** Sie (auf dem Handy per Biometrie). Sie können Vesting-QOR bis zu Ihrem Gesamtbetrag staken, aber die Netzwerkgebühr muss aus Ihrem **entsperrten** QOR stammen — Vesting-QOR kann keine Gebühren bezahlen.
5. Beanspruchen Sie Belohnungen vom selben Bildschirm aus, sobald sie anfallen — siehe unten.

:::note Heute keine Bindungsfrist — gewartet wird nur beim Ausstieg
Es gibt keinen festen Zeitraum, den Sie wählen müssten, denn im Moment existiert keiner: Eine Delegation bleibt aktiv, wobei Belohnungen ab dem nächsten Block fließen, bis Sie das Undelegieren beantragen — es gibt kein Ablaufdatum zum Verlängern und keine Mindest-Stakingdauer. Die einzige Wartezeit gilt beim Ausstieg: Sobald Sie undelegieren, verbleibt dieses QOR für eine 21-tägige Unbonding-Periode, in der es weder Erträge bringt noch bewegt werden kann, bevor es wieder in Ihrem verfügbaren Guthaben erscheint. Wenn Sie eine Delegation stattdessen zu einem anderen Validator verschieben (redelegieren), entfällt diese Wartezeit vollständig. Das Chain-Release v3.2.4 (im Mainnet ab Höhe 3.742.566) fügt ein optionales Modul für zeitgesperrtes Staking hinzu (siehe [Zeitgesperrtes Staking](/user-guide/staking-and-delegation#time-locked-staking)), doch QoreX hat dafür keinen Bildschirm: Jede Delegation, die Sie in QoreX vornehmen, ist eine gewöhnliche ohne Sperre. Dies beschreibt das Verhalten von QoreX, keine dauerhafte Garantie — siehe [Gibt es eine Bindungsfrist?](/user-guide/staking-and-delegation#lock-in-period) für weitere Informationen.
:::

### Stake zwischen Validatoren verschieben (redelegieren) {#move-stake}

Verschieben Sie bereits gestaktes QOR zu einem anderen Validator — oder verteilen Sie es auf mehrere —, ohne die 21-tägige Unbonding-Warteschlange überhaupt zu berühren. Der Stake erwirtschaftet während des gesamten Vorgangs weiterhin Belohnungen.

1. Öffnen Sie **Stake** und tippen Sie auf den Validator, bei dem Ihr QOR aktuell steht; das Panel bietet **Move stake** an.
2. Wählen Sie, wohin es gehen soll — entscheiden Sie sich für ein einzelnes Ziel oder mehrere gleichzeitig. Beim Verteilen auf mehrere Ziele wird der Betrag gleichmäßig aufgeteilt, und der genaue Betrag für jeden Validator wird vor der Bestätigung angezeigt.
3. Bestätigen Sie mit biometrischer Freigabe. Jedes Ziel wird in einer **einzigen Transaktion** bewegt — eine Gebühr, und entweder gelangt die gesamte Verschiebung an oder keine davon.

Dies ist der richtige Schritt, wenn ein Validator, an den Sie delegiert haben, inhaftiert wird oder seine Provision erhöht — bevor es diese Funktion gab, führte der einzige Ausweg über Unstaking und eine 21-tägige Wartezeit ohne Erträge; das Verschieben kostet dagegen weder Wartezeit noch entgangene Belohnungen.

:::caution Es gibt eine Obergrenze pro Paar, und die Gebühr wird auch beim Erreichen fällig
Die Chain erlaubt höchstens **7 gleichzeitig laufende Redelegierungen für dasselbe (Quell-, Ziel-)Validatorpaar** — bei normaler Nutzung kommen Sie dem nicht annähernd nahe, aber QoreX prüft dieses Limit vor der Signatur und warnt Sie, wenn Sie es erreicht haben. Wird das Limit überschritten, schlägt die Transaktion On-Chain fehl, und die Netzwerkgebühr wird trotzdem fällig — versuchen Sie also nicht erneut, eine aus diesem Grund bereits abgelehnte Verschiebung durchzuführen, ohne zuvor abzuwarten, bis eine bestehende abgeschlossen ist.

Eine weitere Regel der Chain: Stake, den Sie gerade **in** einen Validator verschoben haben, kann von diesem Validator nicht **weiter** verschoben werden, bis die Verschiebung, die ihn dorthin gebracht hat, abgeschlossen ist (21 Tage) — QoreX teilt Ihnen mit, wenn eine Verschiebung aus diesem Grund abgelehnt wird. Sie können ihn weiterhin unstaken oder Stake verschieben, der bereits bei diesem Validator lag.
:::

### Beanspruchen und Claim & restake {#claim}

- **Claim** sammelt Ihre Belohnungen in Ihrem Guthaben ein. QoreX beansprucht nur bei Validatoren, bei denen tatsächlich Belohnungen bereitliegen.
- **Claim & restake** (Schaltfläche *Claim & restake*: „Compound \{amount\} QOR back to the same validators, in one transaction.“, d. h. \{amount\} QOR in einer Transaktion zurück an dieselben Validatoren reinvestieren) beansprucht die Belohnungen und delegiert sie direkt zurück an die Validatoren, die sie erwirtschaftet haben — eine Transaktion, eine Gebühr. Es wird nur angeboten, wenn QoreX die Aufschlüsselung pro Validator lesen kann.
- **Gebührenprüfung.** Die Gebühr wird *bevor* die Belohnungen eintreffen bezahlt. Kann Ihr entsperrtes QOR sie nicht decken, stoppt QoreX vor der Signatur und nennt den benötigten Betrag („Claiming needs about \{fee\} QOR unlocked for the network fee — it is paid before the rewards arrive.“, d. h. das Beanspruchen benötigt etwa \{fee\} entsperrtes QOR für die Netzwerkgebühr — sie wird vor dem Eintreffen der Belohnungen bezahlt); senden Sie etwas QOR an diese Adresse und versuchen Sie es erneut. Vesting-QOR kann keine Gebühren bezahlen.

### Undelegieren

1. Öffnen Sie **Stake** und tippen Sie auf den Validator. Wenn Sie QOR bei ihm haben, bietet das Panel **Unstake** (und **Move stake**) an.
2. Geben Sie den Betrag ein. Das Panel zeigt, wie viel Sie bei diesem Validator haben, und über der Schaltfläche **Unstake** den Hinweis „Unstaking takes 21 days before the QOR is yours to move“ (Unstaking dauert 21 Tage, bis Sie über das QOR wieder verfügen können) — Sie sehen die 21-tägige Wartezeit, bevor Sie bestätigen.
3. Bestätigen Sie mit biometrischer Freigabe. Das QOR hört sofort auf, Erträge zu bringen, und wird nach Abschluss der Unbonding-Periode wieder verfügbar.

### Unstaking in progress {#unbonding}

Unstaktes QOR verlässt für 21 Tage sowohl Ihre Delegation als auch Ihr verfügbares Guthaben. QoreX listet es unter **Unstaking in progress** auf — *„\{amount\} QOR unstaking“*, jeder Eintrag mit der verbleibenden Zeit (*\{days\}d \{hours\}h \{minutes\}m left*, oder *Less than a minute left*, oder *The wait is over — this should be back in your balance.*). Kann QoreX nicht lesen, wann ein Eintrag abgeschlossen ist, sagt es das und behält den Betrag in der Summe. Ist Ihr Node nicht erreichbar, bleibt die Liste, wie sie war — sie wird nie als „nichts im Unstaking“ gelesen.

:::note Unstaking, wenn Sie einen Validator betreiben
Gehört Ihre Wallet einem Validator-Betreiber, wird das Unstaking abgelehnt, wenn es Ihre Self-Bond unter die erforderlichen 100.000 QOR senken würde: *„Unstaking this much would drop your validator's self-bond below the required 100,000 QOR. The floor applies for as long as the validator operates.“* (Ein Unstaking in dieser Höhe würde die Self-Bond Ihres Validators unter die erforderlichen 100.000 QOR senken. Die Untergrenze gilt, solange der Validator betrieben wird.)
:::

### Earn

Die **Earn**-Ansicht fasst Ihr Staking an einem Ort zusammen: Ihr gestaktes QOR, Ihre beanspruchbaren Belohnungen, bei wie vielen Validatoren Sie sind, und den Anteil des gesamten QOR, der netzwerkweit gestakt ist. Sie zeigt keine Staking-Rate — die Chain veröffentlicht keine Emissionszahl, aus der sich eine Rate ableiten ließe, daher zeigt QoreX *Not available* statt einer Zahl, die es nicht belegen kann.

In der Erweiterung hat der Stake-Bildschirm dieselben Bestandteile (gestakte Summe, Belohnungen, **Claim**, **Claim & restake**, **Unstake**, **Move stake**, eine Kontoauswahl, wenn Sie mehrere Konten haben, und die Unstake-Warnung).

## Nächste Schritte

- [Senden & Empfangen](/qorex/send-and-receive) — QOR und externe Vermögenswerte bewegen.
- [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) — Guardians, Legacy-Vererbung und Geräteverknüpfung.
