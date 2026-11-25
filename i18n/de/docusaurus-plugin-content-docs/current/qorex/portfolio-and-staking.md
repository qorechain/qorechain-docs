---
slug: /qorex/portfolio-and-staking
title: Portfolio & Staking
sidebar_label: Portfolio & Staking
sidebar_position: 4
---

# Portfolio & Staking

Diese Seite behandelt die Portfolio-Ansicht und das Staking in QoreX: QOR an Validatoren delegieren, Belohnungen beanspruchen, Stake verschieben, Unstaking und zeitgesperrtes Staking. Sie richtet sich an alle, die QOR in der Mobile-App, der Browser-Erweiterung oder der Safari-Erweiterung halten.

## Innovationen {#innovations}

- **Zahlen aus der Chain.** Die Unbonding-Periode und der Basisertrag werden aus dem Netzwerk gelesen und sind nicht fest in der Wallet hinterlegt.
- **Verschiebungen, die das Netzwerk ablehnen würde, werden vorher abgefangen.** Einsatz verschieben graut aus, was nicht verschoben werden kann, und sagt warum, bevor eine Gebühr ausgegeben wird.
- **Belohnungen können an ein anderes Konto derselben Wallet gehen,** und nur dorthin.
- **Keine erfundenen Nullen.** Wenn das Netzwerk nicht antwortet, zeigt QoreX die zuletzt erhaltenen Werte mit ihrem Zeitpunkt oder einen Strich.

## Portfolio

Die **Portfolio**-Ansicht (beim ersten Öffnen in jeder Sitzung biometrisch gesichert) zeigt einen **Allokations-Donut** - Ihre QOR über ihre drei Lanes hinweg vereinheitlicht (Native, EVM, SVM) - mit einer Beschriftung unter dem Ring sowie einer Zeile für jeden Vermögenswert. Prozentwerte erscheinen, sobald der Preis-Feed aktiv ist, und jedes Guthaben zeigt neben dem QOR-Betrag seinen geschätzten Wert in USD. Im **Testnet** wird QOR **ohne USD-Wert** angezeigt - Test-Token haben keinen.

Verwenden Sie **+ Coin or token**, um Coins und Tokens hinzuzufügen, bevor Sie welche halten, und **Receive**, um ihre Adressen zu erhalten - siehe [Coins und Tokens](/qorex/send-and-receive#coins-and-tokens).

**Woher der Preis stammt.** QoreX liest ihn von `GET https://api.qore.network/v1/price/{symbol}` - einem öffentlichen Endpunkt von uns, kein direkter Aufruf an eine Börse. Nichts auf Ihrem Gerät kommuniziert mit einer Preisquelle außerhalb der eigenen Infrastruktur von QoreChain, sodass Ihre IP-Adresse niemals einer solchen ausgesetzt wird. Wenn wirklich kein belastbarer Preis verfügbar ist, antwortet der Endpunkt mit einem Fehler statt zu raten - QoreX zeigt den Preis dann als nicht verfügbar an, statt jemals eine erfundene Null oder einen veralteten Wert so darzustellen, als wäre er aktuell.

Tippen Sie auf einen beliebigen Vermögenswert, um die **Asset-Detailansicht** zu öffnen, die Folgendes zeigt:

- **Guthabenverlauf** - ein echter Trend, erstellt aus Ihren On-Chain-Transfers.
- **Letzte Aktivität** - Transaktionszeilen mit umgekehrter **@handle**-Auflösung, sodass Gegenparteien wo möglich mit Namen angezeigt werden. Tippen Sie auf eine Zeile, um deren vollständige Details zu öffnen: Betrag, Gegenpartei, Block, Transaktions-Hash und Signatur.

Die **QOR**-Seite listet jede Transaktion des Kontos, ein- und ausgehend, mit **Mehr anzeigen** am Ende. Zu allen Transaktionsarten, ausstehenden und fehlgeschlagenen Zuständen und zum CSV-Export siehe [Verlauf](/qorex/send-and-receive#history). Im Testnet hat QOR auf Home und im Portfolio keinen Dollarwert.

## Wenn das Netzwerk langsam ist oder nicht antwortet {#network-status}

- **Netzwerkstatus-Banner.** QoreX prüft den Zeitpunkt des neuesten Blocks der Chain. Ist er älter als eine Minute, zeigt ein Banner *„Das Netzwerk ist langsam: Der neueste Block ist \{seconds\} Sekunden alt. Transaktionen können länger dauern.“* Antwortet kein Node, heißt es *„Das Netzwerk ist gerade nicht erreichbar. Guthaben sind möglicherweise veraltet.“* Es ist die eigene Blockzeit der Chain, keine Statusseite.
- **Zuletzt bekannte Werte.** Wenn das Netzwerk nicht antwortet (zum Beispiel während ein Node neu indexiert oder nach einem Update), zeigen die Kontokarte der Erweiterung und die Bildschirme Home und Staking der App weiterhin das letzte Guthaben und die letzten Delegationen, die das Netzwerk für dieses Konto geliefert hat, und sagen das: *„Das Netzwerk antwortet nicht. Dies sind die zuletzt bekannten Werte vom \{time\}.“* Ein altes Guthaben erhält keinen Dollarwert.
- **Belohnungen, die nicht gelesen werden konnten,** zeigen einen Strich statt 0 QOR, und **Abholen** wird für sie nicht angeboten.

## Staking & Earn {#staking}

Das Staking von QOR trägt zur Absicherung von QoreChain bei und bringt Ihnen Belohnungen ein, die nicht garantiert sind. Alle Staking-Vorgänge sind echte On-Chain-Transaktionen auf der hybrid signierten nativen Lane: Jede wird zweimal signiert, mit einem klassischen Schlüssel und mit ML-DSA-87 (FIPS 204). Staking läuft nie über einen EVM-Precompile.

### Wo sich das Staking befindet {#staking-screens}

- **App:** Der Bildschirm **Stake** zeigt Ihre Summe, Ihre Belohnungen mit **Abholen** und darunter die Validatoren. Zusätzliche Elemente wie Beanspruchen und erneut staken, die Belohnungsadresse und Sperren scrollen mit der Liste mit. Die Tabelle der Staking-Stufen ist auf eine Zeile eingeklappt: Tippen Sie, um sie zu öffnen.
- **Erweiterung und Safari:** **Staking** ist ein Menü, und jede Aktion öffnet ihren eigenen Bildschirm mit einer einzeiligen Erklärung, eigenen Fehlermeldungen und **Zurück zum Staking**: **QOR staken**, **Entstaken**, **Einsatz verschieben**, **Abholen**, **Beanspruchen & erneut staken**, **Für einen Bonus sperren** und **Belohnungen gehen an**. **Abholen** ist immer aufgeführt. Haben Sie mehrere Konten, erscheint eine Kontoauswahl.

### Mit einem Validator staken

1. Öffnen Sie **Stake**.
2. Wählen Sie einen Validator aus der Liste (live von der Chain geladen, der kleinste Stake wird zuerst angezeigt, und jeder aktuell inhaftierte („jailed“) Validator wird ausgeschlossen - an einen solchen zu delegieren ist nie das, was Sie wollen). Validatoren, bei denen Sie bereits QOR haben, tragen ein *staked*-Badge.
3. Geben Sie einen Betrag ein. Während Sie tippen, warnt Sie QoreX, wenn der verbleibende Rest die nächste Netzwerkgebühr nicht decken würde: *"This leaves \{remaining\} QOR - less than the \{fee\} QOR a transaction costs. You would not be able to unstake or claim rewards until this account holds QOR for the fee again."* Es ist eine Warnung, keine Sperre - es ist Ihr Geld -, aber Unstaking und Beanspruchen kosten beide eine Gebühr aus Ihrem **liquiden** Guthaben, sodass ein Staken bis auf nahezu nichts den Stake blockiert, bis jemand QOR einzahlt.
4. **Bestätigen** Sie (auf dem Handy per Biometrie). Sie können Vesting-QOR bis zu Ihrem Gesamtbetrag staken, aber die Netzwerkgebühr muss aus Ihrem **entsperrten** QOR stammen - Vesting-QOR kann keine Gebühren bezahlen.
5. Beanspruchen Sie Belohnungen vom selben Bildschirm aus, sobald sie anfallen - siehe unten.

Bei der ersten Transaktion eines Kontos weisen die Staking-Bildschirme darauf hin, dass sie auch den ML-DSA-87-Schlüssel des Kontos registriert (eine einmalige Netzwerkgebühr).

:::note Eine gewöhnliche Delegation hat keine Bindungsfrist; gewartet wird nur beim Ausstieg
Eine gewöhnliche Delegation hat keine feste Laufzeit: Sie bleibt aktiv, wobei Belohnungen ab dem nächsten Block fließen, bis Sie das Undelegieren beantragen. Es gibt kein Ablaufdatum zum Verlängern und keine Mindest-Stakingdauer. Die einzige Wartezeit gilt beim Ausstieg: Sobald Sie undelegieren, verbleibt dieses QOR in einer **Unbonding-Periode**, in der es weder Erträge bringt noch bewegt werden kann, bevor es wieder in Ihrem verfügbaren Guthaben erscheint. QoreX liest die Länge dieser Periode aus dem Netzwerk und zeigt sie, bevor Sie bestätigen (zum Zeitpunkt der Erstellung 21 Tage auf QoreChain; kann sie nicht gelesen werden, sagt QoreX *die vom Netzwerk festgelegte Zeit*). Wenn Sie eine Delegation stattdessen zu einem anderen Validator verschieben (redelegieren), entfällt diese Wartezeit vollständig. Zeitgesperrtes Staking ist optional, siehe [Staking-Sperren](#staking-locks) unten. Siehe auch [Gibt es eine Bindungsfrist?](/user-guide/staking-and-delegation#lock-in-period).
:::


### Staking-Sperren {#staking-locks}

Staking-Sperren gibt es in der App und in den Erweiterungen, einschließlich Safari. Eine Sperre ist optional. Sie bindet einen Teil Ihres Stakes für 3, 6 oder 12 Monate im Gegenzug für einen Bonus.

- **Der angezeigte Bonus ist der, den die Sperre heute einbringt**, unterhalb der Obergrenze, die das Netzwerk setzt. Er kann sich ändern, wenn sich die Netzwerkbedingungen ändern, und ist nicht garantiert.
- **Der Stufenplan ist mit „up to“ gekennzeichnet**, und der heutige Wert wird daneben angezeigt.
- **Vorzeitiges Entsperren** liegt hinter einer zweiten Bestätigung, die die Kosten nennt, bevor Sie signieren.
- **Unstake und Move stake sind auf den entsperrten Teil** Ihres Stakes beschränkt.

Wie das Modul On-Chain funktioniert, siehe [Zeitgesperrtes Staking](/user-guide/staking-and-delegation#time-locked-staking).

### Stake zwischen Validatoren verschieben (redelegieren) {#move-stake}

Verschieben Sie bereits gestaktes QOR zu einem anderen Validator - oder verteilen Sie es auf mehrere -, ohne die Unbonding-Warteschlange überhaupt zu berühren. Der Stake erwirtschaftet während des gesamten Vorgangs weiterhin Belohnungen.

**Erweiterung und Safari** (Stake → **Einsatz verschieben**) führen Sie durch drei Schritte:

1. **Von.** Wählen Sie den Validator, den Ihr Stake verlässt. Jeder zeigt *Gestakt \{held\} QOR · verschiebbar \{free\} QOR* (und einen eventuell gesperrten Betrag). Ein Validator, von dem Sie noch nicht wegverschieben können, ist mit dem Datum ausgegraut: *„Ab \{date\} wieder verschiebbar: hierher verschobener Stake muss erst ankommen.“*
2. **An.** Wählen Sie ein oder mehrere Ziele. Ein Paar, bei dem bereits die Höchstzahl laufender Verschiebungen erreicht ist, ist deaktiviert (*"\{n\} moves in progress, the chain allows \{max\}"*).
3. **Wie viel.** Geben Sie den Betrag ein oder tippen Sie auf **Max** (der freie, nicht gesperrte Betrag bei der Quelle). Die Route (*From ... to ...*) und bei mehreren Zielen die Aufteilung (*\{amount\} QOR to each of \{n\} validators*) werden vor der Schaltfläche angezeigt. Fehler und die Antwort des Netzwerks erscheinen neben der Schaltfläche.

**App:** Öffnen Sie **Stake**, tippen Sie auf den Validator, bei dem Ihr QOR liegt, und wählen Sie **Einsatz verschieben**. Auf dem geöffneten Validator laufen dieselben Prüfungen. Wählen Sie ein oder mehrere Ziele, geben Sie den Betrag ein (er hat ein eigenes Feld und **Max**), prüfen Sie die Aufteilung und bestätigen Sie mit Biometrie.

Beim Verteilen auf mehrere wird der Betrag gleichmäßig aufgeteilt, und alle Ziele werden in einer **einzigen Transaktion** bewegt - eine Gebühr, und entweder gelingt die gesamte Verschiebung oder nichts davon.

Dies ist der richtige Schritt, wenn ein Validator, an den Sie delegiert haben, inhaftiert wird oder seine Provision erhöht: Das Verschieben kostet weder Wartezeit noch entgangene Belohnungen.

:::caution Regeln der Chain, die eine Verschiebung ablehnen können
- **7 laufende Verschiebungen je Paar.** Die Chain erlaubt höchstens 7 gleichzeitig laufende Redelegierungen für dasselbe (Quell-, Ziel-)Validatorpaar.
- **Verschobener Stake kann nicht sofort weiterverschoben werden.** Stake, den Sie gerade **in** einen Validator verschoben haben, kann von diesem Validator nicht **weiter** verschoben werden, bis die Verschiebung, die ihn dorthin gebracht hat, abgeschlossen ist (die Unbonding-Periode des Netzwerks). Sie können ihn weiterhin unstaken oder Stake verschieben, der bereits bei diesem Validator lag.

QoreX prüft beides, bevor Sie signieren. Lehnt das Netzwerk eine Verschiebung dennoch ab, nennt QoreX den Grund in Worten statt mit einem Code; für eine on-chain abgelehnte Verschiebung wurde die Netzwerkgebühr bereits bezahlt, versuchen Sie sie also nicht ohne Wartezeit erneut.
:::

### Beanspruchen und Claim & restake {#claim}

- **Claim** sammelt Ihre Belohnungen in Ihrem Guthaben ein. QoreX beansprucht nur bei Validatoren, bei denen tatsächlich Belohnungen bereitliegen.
- **Abholen, das mehr kostet, als es bringt.** Ist die Abholgebühr höher als Ihre Belohnungen, warnt Sie das erste Tippen, und die Schaltfläche wird zu **Trotzdem abholen**. Die Belohnungen wachsen weiter, wenn Sie warten.
- **Claim & restake** (Schaltfläche *Beanspruchen & erneut staken*: "Compound \{amount\} QOR back to the same validators, in one transaction.") beansprucht die Belohnungen und delegiert sie direkt zurück an die Validatoren, die sie erwirtschaftet haben - eine Transaktion, eine Gebühr. Es wird nur angeboten, wenn QoreX die Aufschlüsselung pro Validator lesen kann. Eine Transaktion kann **höchstens 127 Validatoren** abdecken; bei mehr sagt QoreX das und signiert nichts.
- **Gebührenprüfung.** Die Gebühr wird *bevor* die Belohnungen eintreffen bezahlt. Kann Ihr entsperrtes QOR sie nicht decken, stoppt QoreX vor der Signatur und nennt den benötigten Betrag ("Claiming needs about \{fee\} QOR unlocked for the network fee - it is paid before the rewards arrive."); senden Sie etwas QOR an diese Adresse und versuchen Sie es erneut. Vesting-QOR kann keine Gebühren bezahlen.

### Wählen, wohin Belohnungen gehen {#rewards-address}

Standardmäßig gehen Belohnungen an das Konto, das sie erwirtschaftet hat. Sie können **künftige** Belohnungen an **ein anderes Konto derselben Wallet** senden, und nur dorthin.

1. App: Öffnen Sie unter **Stake** den Punkt **Belohnungen gehen an**. Erweiterung und Safari: **Staking → Belohnungen gehen an**. Sie sehen, wohin die Belohnungen derzeit gehen.
2. Wählen Sie **Ändern, wohin Belohnungen gehen** und eines Ihrer Konten.
3. Das erste Tippen nennt das Konto vollständig (*„Künftige Belohnungen gehen an \{name\}. Zum Signieren erneut tippen.“*); das zweite signiert (hybride Signatur, normale Netzwerkgebühr; Biometrie in der App).

Ihr Stake wird nicht bewegt. QoreX ermittelt Ihre eigenen Adressen aus Ihrer Wiederherstellungsphrase, kann also nicht auf eine Adresse außerhalb der Wallet gelenkt werden, und Websites können diese Änderung nicht anfordern. Gehen Belohnungen bereits an eine Adresse außerhalb Ihrer Wallet, weist QoreX darauf hin und bietet an, sie stattdessen an eines Ihrer Konten zu senden.

### Gaspreis und Transaktionsgröße {#gas}

QoreX liest den aktuellen Mindestgaspreis des Netzwerks. Erhöht das Netzwerk ihn, zahlt QoreX über dem neuen Minimum; die in die Wallet eingebauten Preise bleiben die Untergrenze. Die in einer Prüfansicht angezeigte Gebühr ist die Gebühr, die signiert wird. QoreChain akzeptiert höchstens **50.000.000 Gas** in einer Transaktion: Eine größere wird abgelehnt, bevor etwas signiert wird, und es wird keine Gebühr erhoben; teilen Sie sie also in kleinere Teile auf (zum Beispiel von weniger Validatoren auf einmal abholen).

### Undelegieren

1. Öffnen Sie **Stake** und tippen Sie auf den Validator. Wenn Sie QOR bei ihm haben, bietet das Panel **Unstake** (und **Move stake**) an.
2. Geben Sie den Betrag ein. Das Panel zeigt, wie viel Sie bei diesem Validator haben, und über der Schaltfläche **Entstaken**, wie lange das Entstaken dauert (*„Das Entstaken dauert \{days\}, bis du die QOR bewegen kannst.“*, mit aus dem Netzwerk gelesener Periode) - Sie sehen die Wartezeit, bevor Sie bestätigen.
3. Bestätigen Sie mit biometrischer Freigabe. Das QOR hört sofort auf, Erträge zu bringen, und wird nach Abschluss der Unbonding-Periode wieder verfügbar.

### Unstaking in progress {#unbonding}

Unstaktes QOR verlässt für die Unbonding-Periode des Netzwerks sowohl Ihre Delegation als auch Ihr verfügbares Guthaben. QoreX listet es unter **Unstaking in progress** auf - *"\{amount\} QOR unstaking"*, jeder Eintrag mit der verbleibenden Zeit (*\{days\}d \{hours\}h \{minutes\}m left*, oder *Less than a minute left*, oder *The wait is over - this should be back in your balance.*). Kann QoreX nicht lesen, wann ein Eintrag abgeschlossen ist, sagt es das und behält den Betrag in der Summe. Ist Ihr Node nicht erreichbar, bleibt die Liste, wie sie war - sie wird nie als „nichts im Unstaking“ gelesen.

:::note Unstaking, wenn Sie einen Validator betreiben
Gehört Ihre Wallet einem Validator-Betreiber, wird das Unstaking abgelehnt, wenn es Ihre Self-Bond unter die erforderlichen 100.000 QOR senken würde: *"Unstaking this much would drop your validator's self-bond below the required 100,000 QOR. The floor applies for as long as the validator operates."*
:::

### Earn

Die **Earn**-Ansicht fasst Ihr Staking an einem Ort zusammen: Ihr gestaktes QOR, Ihre beanspruchbaren Belohnungen, bei wie vielen Validatoren Sie sind, und den Anteil des gesamten QOR, der netzwerkweit gestakt ist.

**Ertrag.** Der jährliche Basissatz stammt aus **der eigenen Angabe der Chain**. Er wird *vor der Provision des Validators* angezeigt und ist **variabel und nicht garantiert**. Meldet die Chain, dass Belohnungen jetzt nur noch aus Gebühren kommen, zeigt QoreX *Belohnungen aus Gebühren* statt eines Prozentsatzes. Kann die Zahl nicht gelesen werden, zeigt QoreX *Nicht verfügbar* statt einer Zahl, die es nicht belegen kann. Der Bonus einer Zeitsperre ist eine eigene Zahl, siehe [Staking-Sperren](#staking-locks).

Erweiterung und Safari haben die Staking-Bestandteile auf getrennten Bildschirmen, siehe [Wo sich das Staking befindet](#staking-screens).

## Nächste Schritte

- [Senden & Empfangen](/qorex/send-and-receive) - QOR und externe Vermögenswerte bewegen.
- [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) - Guardians, Legacy-Vererbung und Geräteverknüpfung.

## Grenzen und bekannte Probleme {#limits}

- Belohnungen sind nicht garantiert, und der angezeigte Ertrag ist variabel und vor Provision.
- Unstaktes QOR kehrt erst nach der Unbonding-Periode des Netzwerks zurück (zum Zeitpunkt der Erstellung 21 Tage); das Verschieben von Stake zwischen Validatoren hat keine Wartezeit, ist aber auf 7 laufende Verschiebungen für dasselbe Validatorpaar begrenzt, und verschobener Stake kann erst weiterverschoben werden, wenn seine Verschiebung abgeschlossen ist.
- Belohnungen können nur an ein anderes Konto derselben Wallet umgeleitet werden.
- Beanspruchen & erneut staken deckt höchstens 127 Validatoren in einer Transaktion ab, und keine Transaktion kann 50.000.000 Gas überschreiten.
- Vesting-QOR kann gestakt werden, aber keine Gebühren bezahlen; die Gebühr muss aus entsperrtem QOR stammen.
- Das Portfolio gibt es nur mobil. Im Testnet zeigt QOR keinen USD-Wert.
