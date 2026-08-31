---
slug: /qorex/portfolio-and-staking
title: Portfolio & Staking
sidebar_label: Portfolio & Staking
sidebar_position: 4
---

# Portfolio & Staking

## Portfolio

Die **Portfolio**-Ansicht (beim ersten Öffnen in jeder Sitzung biometrisch gesichert) zeigt einen **Allokations-Donut** — Ihre QOR über ihre drei Lanes hinweg vereinheitlicht (Native, EVM, SVM) — mit einer Beschriftung unter dem Ring sowie einer Zeile für jeden Vermögenswert. Prozentwerte erscheinen, sobald der Preis-Feed aktiv ist, und jedes Guthaben zeigt neben dem QOR-Betrag seinen geschätzten Wert in USD.

**Woher der Preis stammt.** QoreX liest ihn von `GET https://api.qore.network/v1/price/{symbol}` — einem öffentlichen Endpunkt von uns, kein direkter Aufruf an eine Börse. Nichts auf Ihrem Gerät kommuniziert mit einer Preisquelle außerhalb der eigenen Infrastruktur von QoreChain, sodass Ihre IP-Adresse niemals einer solchen ausgesetzt wird. Wenn wirklich kein belastbarer Preis verfügbar ist, antwortet der Endpunkt mit einem Fehler statt zu raten — QoreX zeigt den Preis dann als nicht verfügbar an, statt jemals eine erfundene Null oder einen veralteten Wert so darzustellen, als wäre er aktuell.

Tippen Sie auf einen beliebigen Vermögenswert, um die **Asset-Detailansicht** zu öffnen, die Folgendes zeigt:

- **Guthabenverlauf** — ein echter Trend, erstellt aus Ihren On-Chain-Transfers.
- **Letzte Aktivität** — Transaktionszeilen mit umgekehrter **@handle**-Auflösung, sodass Gegenparteien wo möglich mit Namen angezeigt werden. Tippen Sie auf eine Zeile, um deren vollständige Details zu öffnen: Betrag, Gegenpartei, Block, Transaktions-Hash und Signatur.

## Staking & Earn

Das Staking von QOR trägt zur Absicherung von QoreChain bei und bringt Ihnen Belohnungen ein. Alle Staking-Vorgänge sind echte On-Chain-Transaktionen, die Ihre Post-Quantum-Signatur tragen.

### Mit einem Validator staken

1. Öffnen Sie **Stake**.
2. Wählen Sie einen Validator aus der Liste (live von der Chain geladen, der kleinste Stake wird zuerst angezeigt, und jeder aktuell inhaftierte („jailed“) Validator wird ausgeschlossen — an einen solchen zu delegieren ist nie das, was Sie wollen).
3. Geben Sie einen Betrag ein und **delegieren** Sie mit biometrischer Bestätigung.
4. Beanspruchen Sie Belohnungen vom selben Bildschirm aus, sobald sie anfallen.

:::note Heute keine Bindungsfrist — gewartet wird nur beim Ausstieg
Es gibt keinen festen Zeitraum, den Sie wählen müssten, denn im Moment existiert keiner: Eine Delegation bleibt aktiv, wobei Belohnungen ab dem nächsten Block fließen, bis Sie das Undelegieren beantragen — es gibt kein Ablaufdatum zum Verlängern und keine Mindest-Stakingdauer. Die einzige Wartezeit gilt beim Ausstieg: Sobald Sie undelegieren, verbleibt dieses QOR für eine 21-tägige Unbonding-Periode, in der es weder Erträge bringt noch bewegt werden kann, bevor es wieder in Ihrem verfügbaren Guthaben erscheint. Wenn Sie eine Delegation stattdessen zu einem anderen Validator verschieben (redelegieren), entfällt diese Wartezeit vollständig. Dies beschreibt das aktuelle Verhalten der Chain, keine dauerhafte Garantie — siehe [Gibt es eine Bindungsfrist?](/user-guide/staking-and-delegation#lock-in-period) für weitere Informationen.
:::

### Stake zwischen Validatoren verschieben (redelegieren) {#move-stake}

Verschieben Sie bereits gestaktes QOR zu einem anderen Validator — oder verteilen Sie es auf mehrere —, ohne die 21-tägige Unbonding-Warteschlange überhaupt zu berühren. Der Stake erwirtschaftet während des gesamten Vorgangs weiterhin Belohnungen.

1. Öffnen Sie **Stake** und tippen Sie auf den Validator, bei dem Ihr QOR aktuell steht.
2. Wählen Sie, wohin es gehen soll — entscheiden Sie sich für ein einzelnes Ziel oder mehrere gleichzeitig. Beim Verteilen auf mehrere Ziele wird der Betrag gleichmäßig aufgeteilt, und der genaue Betrag für jeden Validator wird vor der Bestätigung angezeigt.
3. Bestätigen Sie mit biometrischer Freigabe. Jedes Ziel wird in einer **einzigen Transaktion** bewegt — eine Gebühr, und entweder gelangt die gesamte Verschiebung an oder keine davon.

Dies ist der richtige Schritt, wenn ein Validator, an den Sie delegiert haben, inhaftiert wird oder seine Provision erhöht — bevor es diese Funktion gab, führte der einzige Ausweg über Unstaking und eine 21-tägige Wartezeit ohne Erträge; das Verschieben kostet dagegen weder Wartezeit noch entgangene Belohnungen.

:::caution Es gibt eine Obergrenze pro Paar, und die Gebühr wird auch beim Erreichen fällig
Die Chain erlaubt höchstens **7 gleichzeitig laufende Redelegierungen für dasselbe (Quell-, Ziel-)Validatorpaar** — bei normaler Nutzung kommen Sie dem nicht annähernd nahe, aber QoreX prüft dieses Limit vor der Signatur und warnt Sie, wenn Sie es erreicht haben. Wird das Limit überschritten, schlägt die Transaktion On-Chain fehl, und die Netzwerkgebühr wird trotzdem fällig — versuchen Sie also nicht erneut, eine aus diesem Grund bereits abgelehnte Verschiebung durchzuführen, ohne zuvor abzuwarten, bis eine bestehende abgeschlossen ist.
:::

### Undelegieren

1. Öffnen Sie **Stake**, tippen Sie auf den Validator und wählen Sie Undelegieren statt Ihren Stake zu verschieben.
2. Geben Sie den Betrag ein — der Bildschirm zeigt die **21-tägige Unbonding-Periode** und die **genaue Provision**, die Sie zahlen werden, jeweils vor der Bestätigung.
3. Bestätigen Sie mit biometrischer Freigabe. Das QOR hört sofort auf, Erträge zu bringen, und wird nach Abschluss der Unbonding-Periode wieder verfügbar.

### Earn

Die **Earn**-Ansicht fasst Ihre aktiven Positionen und Ihre Rendite an einem Ort zusammen.

## Nächste Schritte

- [Senden & Empfangen](/qorex/send-and-receive) — QOR und externe Vermögenswerte bewegen.
- [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) — Guardians, Legacy-Vererbung und Geräteverknüpfung.
