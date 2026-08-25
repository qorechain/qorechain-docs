---
slug: /qorex/portfolio-and-staking
title: Portfolio & Staking
sidebar_label: Portfolio & Staking
sidebar_position: 4
---

# Portfolio & Staking

## Portfolio

Die **Portfolio**-Ansicht (beim ersten Öffnen in jeder Sitzung biometrisch gesichert) zeigt einen **Allokations-Donut** — Ihre QOR über ihre drei Lanes hinweg vereinheitlicht (Native, EVM, SVM) — mit einer Beschriftung unter dem Ring sowie einer Zeile für jeden Vermögenswert. Prozentwerte erscheinen, sobald der Preis-Feed aktiv ist.

Tippen Sie auf einen beliebigen Vermögenswert, um die **Asset-Detailansicht** zu öffnen, die Folgendes zeigt:

- **Guthabenverlauf** — ein echter Trend, erstellt aus Ihren On-Chain-Transfers.
- **Letzte Aktivität** — Transaktionszeilen mit umgekehrter **@handle**-Auflösung, sodass Gegenparteien wo möglich mit Namen angezeigt werden.

## Staking & Earn

Das Staking von QOR trägt zur Absicherung von QoreChain bei und bringt Ihnen Belohnungen ein. Alle Staking-Vorgänge sind echte On-Chain-Transaktionen, die Ihre Post-Quantum-Signatur tragen.

### Mit einem Validator staken

1. Öffnen Sie **Stake**.
2. Wählen Sie einen Validator aus der Liste (live von der Chain geladen).
3. Geben Sie einen Betrag ein und **delegieren** Sie mit biometrischer Bestätigung.
4. Beanspruchen Sie Belohnungen vom selben Bildschirm aus, sobald sie anfallen.

:::note Heute keine Bindungsfrist — gewartet wird nur beim Ausstieg
Es gibt keinen festen Zeitraum, den Sie wählen müssten, denn im Moment existiert keiner: Eine Delegation bleibt aktiv, wobei Belohnungen ab dem nächsten Block fließen, bis Sie das Undelegieren beantragen — es gibt kein Ablaufdatum zum Verlängern und keine Mindest-Stakingdauer. Die einzige Wartezeit gilt beim Ausstieg: Sobald Sie undelegieren, verbleibt dieses QOR für eine 21-tägige Unbonding-Periode, in der es weder Erträge bringt noch bewegt werden kann, bevor es wieder in Ihrem verfügbaren Guthaben erscheint. Wenn Sie eine Delegation stattdessen zu einem anderen Validator verschieben (redelegieren), entfällt diese Wartezeit vollständig. Dies beschreibt das aktuelle Verhalten der Chain, keine dauerhafte Garantie — siehe [Gibt es eine Bindungsfrist?](/user-guide/staking-and-delegation#lock-in-period) für weitere Informationen.
:::

:::note Dieser Bildschirm hat noch keine eigene Undelegieren-Schaltfläche
Dieser Stake-Bildschirm deckt nur Delegieren und Beanspruchen ab. Um direkt von einem QoreX-Bildschirm aus zu undelegieren, verwenden Sie stattdessen den [Stake-Bildschirm der Browser-Erweiterung](/qorex/browser-extension#stake) — oder undelegieren Sie über das [Dashboard](/dashboard/staking-and-validators#delegate), das die Anfrage an die verbundene QoreX-Instanz sendet, App eingeschlossen, damit Sie sie dort bestätigen.
:::

### Earn

Die **Earn**-Ansicht fasst Ihre aktiven Positionen und Ihre Rendite an einem Ort zusammen.

## Nächste Schritte

- [Senden & Empfangen](/qorex/send-and-receive) — QOR und externe Vermögenswerte bewegen.
- [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) — Guardians, Legacy-Vererbung und Geräteverknüpfung.
