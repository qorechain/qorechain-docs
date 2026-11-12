---
slug: /build-before-qday/overview
title: Build Before Q-Day
sidebar_label: Überblick
sidebar_position: 1
---

# Build Before Q-Day

**Build Before Q-Day** ist das Entwickler-Fest von QoreChain. Es findet online auf [build.qorechain.io](https://build.qorechain.io) statt, mit dem Hashtag #BuildBeforeQDay. Die Teilnehmenden wählen ein Level, bauen mit den Open-Source-Kits auf dem QoreChain-Testnet, zeigen ihre Arbeit öffentlich und präsentieren ihr Projekt einer Jury und der Community. Begleitend gibt es jede Woche einen technischen Workshop. Zu jedem Workshop finden Sie in diesem Bereich eine vollständige Schritt-für-Schritt-Anleitung vom ersten bis zum letzten Befehl, damit Sie alles in Ihrem eigenen Tempo auf Ihrem eigenen Rechner nachvollziehen können. Die Beispiel-Apps jedes Workshops liegen im öffentlichen Repository [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday).

## Innovationen {#innovations}

Jeder Workshop in diesem Bereich dreht sich um die Funktionen, die QoreChain besonders machen:

- **Hybride Signierung.** Eine Transaktion wird zweimal signiert: einmal mit einem klassischen secp256k1-Schlüssel und einmal mit einem Post-Quanten-Schlüssel (ML-DSA-87). Wer nur den klassischen Schlüssel stiehlt, kann die zweite Signatur nicht erzeugen.
- **On-Chain verifiziert.** Die Validatoren prüfen beide Signaturen. Die Transaktion trägt eine `PQCHybridSignature`-Erweiterung, und die Chain gibt ein `pqc_hybrid_verify`-Ereignis mit dem Status `verified` aus. Beides können Sie über den öffentlichen REST-Endpunkt lesen, und das Ergebnis sehen Sie im Explorer.
- **Gewohnte Werkzeuge.** Sie behalten Hardhat, Foundry oder Ihre Sprache. Die Kits kümmern sich um den Post-Quanten-Schlüssel und das Autorisierungsfenster.

## So funktioniert es {#how-it-works}

1. **Registrieren** Sie sich auf [build.qorechain.io](https://build.qorechain.io): Melden Sie sich mit GitHub an, wählen Sie Ihr Level und verbinden Sie X und QoreX.
2. **Bauen** Sie auf dem Testnet mit den Kits, den wöchentlichen Workshops und den Mid-Hack-Challenges. Commits und Updates erscheinen im öffentlichen Feed.
3. **Reichen Sie ein** vor Ablauf der Frist, mit einem öffentlichen Repository, einem Video von bis zu 3 Minuten und der Testnet-Adresse, die Ihr Projekt verwendet.

Die Teilnahme ist kostenlos: Sie bauen auf dem Testnet, wo Test-QOR aus dem [Faucet](/dashboard/faucet) kommt. Die vollständigen Regeln zu Teilnahmeberechtigung, Einreichung und Bewertung stehen auf der Seite Rules der Fest-Website. Das Preisgeld beträgt insgesamt 20.000 $, mit anschließenden Förderungen in QOR ab Januar 2027; die Aufteilung steht auf der Fest-Website.

## Level {#levels}

Sie wählen ein Level bei der Registrierung und können es später ändern.

| Level | Für wen |
| --- | --- |
| Quantum Pass | Neu bei QoreChain oder im Web3. Bauen Sie eine kleine App, die eine hybride Post-Quanten-Transaktion sendet und sie von der Chain zurückliest. |
| Intermediate | Sie haben schon eine dApp veröffentlicht. Bauen Sie eine vollständige Anwendung mit dem QoreChain SDK und QoreX. |
| Advanced | Drei Tracks: A, Agenten; B, verschlüsselte Anwendungen mit QoreSeal; C, Cross-VM-Apps, die EVM und Native Lane verbinden. |
| Expert | Protokoll-Infrastruktur: Rollups mit dem RDK, IBC mit QORel, Custody und Entwickler-Tooling. |

Workshop 1 deckt genau das ab, was das Level Quantum Pass verlangt: eine hybrid signierte Transaktion, On-Chain verifiziert.

## Zeitplan {#timeline}

Alle Zeiten in UTC.

| Wann | Was |
| --- | --- |
| 4. November 2026 | Registrierung und Bau beginnen |
| Jede Woche | Ein Workshop (insgesamt 4) mit seiner Schritt-für-Schritt-Anleitung hier |
| 18. November 2026 | Mid-Hack-Challenges beginnen |
| 2. Dezember 2026, 23:59 | Einreichungsfrist |
| 3. bis 5. Dezember | Prüfung der Einreichungen |
| 6. bis 15. Dezember | Bewertung und People's-Choice-Abstimmung |
| 16. Dezember | Gewinner und Live-Demo-Show |
| 17. bis 22. Dezember | Auszahlung der Preise |
| Januar 2027 | Anschlussförderungen |

Der Zeitplan steht auf der Fest-Website.

## Workshops {#workshops}

| Workshop | Thema | Anleitung |
| --- | --- | --- |
| Workshop 1 | Ihre erste hybrid signierte Transaktion | [Workshop 1](/build-before-qday/workshop-1) |

Jede Anleitung beginnt bei null, ohne dass etwas installiert ist. Sie listet auf, was zu installieren ist, und führt dann Befehl für Befehl durch den Ablauf: den Code holen, installieren, einen reinen Testnet-Schlüssel erzeugen, Test-QOR vom Faucet holen, ausführen und das Ergebnis im Explorer prüfen. Am Ende stehen die verwendeten Pakete und die Beispiel-Apps. Alle Beispiel-Apps liegen im öffentlichen Repository [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday).

## Wo Sie anfangen {#where-to-start}

- Folgen Sie [Workshop 1](/build-before-qday/workshop-1) auf dem Testnet.
- Stöbern Sie in den [Beispiel-Apps](/build-before-qday/workshop-1/kits) und den Kits dahinter.
- Wenn Sie noch nie auf QoreChain bereitgestellt haben, lesen Sie zuerst [Deploy in 5 Minutes](/getting-started/deploy-in-5-minutes).
