---
slug: /build-before-qday/overview
title: Build Before Q-Day
sidebar_label: Überblick
sidebar_position: 1
---

# Build Before Q-Day

**Build Before Q-Day** ist das Entwickler-Fest von QoreChain. Es findet online auf [build.qorechain.io](https://build.qorechain.io) statt, mit dem Hashtag #BuildBeforeQDay. Die Teilnehmenden wählen eine Stufe, bauen mit den Open-Source-Kits auf dem QoreChain-Testnet, veröffentlichen ihren Fortschritt öffentlich und stellen ihr Projekt einer Jury und der Community vor. Begleitend zum Fest gibt es jede Woche einen technischen Workshop. Zu jedem Workshop gibt es in diesem Bereich eine vollständige Schritt-für-Schritt-Anleitung, vom ersten bis zum letzten Befehl. So können Sie alles in Ihrem eigenen Tempo auf Ihrem eigenen Computer nachvollziehen, auch wenn Sie neu in der Entwicklung sind. Die Beispiel-Apps liegen gesammelt im öffentlichen Repository [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday).

## Innovationen {#innovations}

Jeder Workshop in diesem Bereich dreht sich um die Eigenschaften, die QoreChain besonders machen:

- **Hybride Signatur.** Eine Transaktion wird zweimal signiert: einmal mit einem klassischen secp256k1-Schlüssel und einmal mit einem Post-Quanten-Schlüssel (ML-DSA-87). Wer nur den klassischen Schlüssel stiehlt, kann die zweite Signatur nicht erzeugen.
- **On-chain verifiziert.** Die Validatoren prüfen beide Signaturen. Die Transaktion trägt eine `PQCHybridSignature`-Erweiterung, und die Chain gibt ein `pqc_hybrid_verify`-Ereignis mit dem Status `verified` aus. Beides können Sie über den öffentlichen REST-Endpunkt lesen und das Ergebnis im Explorer sehen.
- **Ein Schlüssel, einmal gebunden.** Ihr Post-Quanten-Schlüssel wird abgeleitet, nicht erzeugt, und einmal mit einem Nachweis registriert. Siehe [Wie Ihr Post-Quanten-Schlüssel an Ihr Konto gebunden wird](/build-before-qday/key-binding).
- **Gewohnte Werkzeuge.** Sie behalten Hardhat, Foundry oder Ihre bevorzugte Sprache. Die Kits kümmern sich um den Post-Quanten-Schlüssel und das Autorisierungsfenster.

## So funktioniert es {#how-it-works}

1. **Registrieren** Sie sich auf [build.qorechain.io](https://build.qorechain.io): Melden Sie sich mit GitHub an, wählen Sie Ihre Stufe und verbinden Sie X und QoreX.
2. **Bauen** Sie auf dem Testnet mit den Kits, den wöchentlichen Workshops und den Mid-Hack-Challenges. Commits und Updates erscheinen im öffentlichen Feed.
3. **Reichen Sie ein** vor Ablauf der Frist, mit einem öffentlichen Repository, einem Video von bis zu 3 Minuten und der Testnet-Adresse, die Ihr Projekt verwendet.

Die Teilnahme ist kostenlos: Sie bauen auf dem Testnet, wo Test-QOR vom [Faucet](/dashboard/faucet) kommt. Die vollständigen Regeln zu Teilnahmeberechtigung, Einreichung und Bewertung stehen auf der Seite Rules der Fest-Website. Das Preisgeld beträgt insgesamt 20.000 $, dazu kommen Anschlussförderungen in QOR ab Januar 2027; die Aufteilung finden Sie auf der Fest-Website.

## Stufen {#levels}

Sie wählen bei der Registrierung eine Stufe und können sie später ändern.

| Stufe | Für wen sie gedacht ist |
| --- | --- |
| Quantum Pass | Neu bei QoreChain oder bei Web3. Bauen Sie eine kleine App, die eine hybride Post-Quanten-Transaktion sendet und sie von der Chain zurückliest. |
| Intermediate | Sie haben schon eine dApp veröffentlicht. Bauen Sie eine vollständige Anwendung mit dem QoreChain SDK und QoreX. |
| Advanced | Drei Tracks: A, Agenten; B, verschlüsselte Anwendungen mit QoreSeal; C, Cross-VM-Apps, die die EVM-Lane und die Native-Lane verbinden. |
| Expert | Protokoll-Infrastruktur: Rollups mit dem RDK, IBC mit QORel, Custody und Entwickler-Werkzeuge. |

Workshop 1 deckt genau das ab, was die Stufe Quantum Pass verlangt: eine hybrid signierte Transaktion, die on-chain verifiziert wird.

## Zeitplan {#timeline}

Alle Zeitangaben in UTC.

| Wann | Was |
| --- | --- |
| 4. November 2026 | Registrierung und Bauphase beginnen |
| Jede Woche | Ein Workshop (insgesamt 4) mit seiner Schritt-für-Schritt-Anleitung hier |
| 18. November 2026 | Die Mid-Hack-Challenges starten |
| 2. Dezember 2026, 23:59 | Einreichungsfrist |
| 3. bis 5. Dezember | Prüfung der Einreichungen |
| 6. bis 15. Dezember | Bewertung und People's-Choice-Abstimmung |
| 16. Dezember | Gewinner und Live-Demo-Show |
| 17. bis 22. Dezember | Auszahlung der Preise |
| Januar 2027 | Anschlussförderungen |

Den Zeitplan finden Sie auf der Fest-Website.

## Für wen das gedacht ist {#who}

Sie müssen weder Blockchain noch Post-Quanten-Kryptografie kennen. Wenn Sie ein Terminal öffnen und einen Befehl einfügen können, können Sie jeder Anleitung hier folgen. Jede Anleitung erklärt in einfachen Worten, was jeder Befehl tut und was seine einzelnen Teile bedeuten, und zeigt dann, was Sie auf dem Bildschirm sehen sollten. Wenn eine Anleitung sagt, ein Befehl könne einen Moment dauern, warten Sie, bis er fertig ist, bevor Sie den nächsten ausführen.

## Ein Tutorial wählen {#choose}

Machen Sie zuerst die **Workshop-1-Anleitung**. Sie ist der vollständige Weg, von einem leeren Computer bis zu einer Transaktion, die mit zwei Schlüsseln signiert und on-chain geprüft wurde. Wählen Sie danach eine beliebige App unten. Sie zeigen dieselbe Idee in verschiedenen Sprachen und Werkzeugen.

Die Zeitangaben gelten für die Schritte, nachdem die Werkzeuge installiert sind. Die erstmalige Installation der Werkzeuge kommt noch mit etwa 20 bis 40 Minuten dazu: siehe [Bevor Sie beginnen](/build-before-qday/prerequisites).

| Tutorial | Stufe | Sprache | Zeit | Was Sie am Ende haben |
| --- | --- | --- | --- | --- |
| [Workshop-1-Anleitung](/build-before-qday/workshop-1) | Einsteiger | TypeScript, Solidity | 30 Minuten | Ein Projekt, das Sie per Scaffolding erzeugt, getestet und auf dem Testnet bereitgestellt haben, und eine hybrid signierte Transaktion, die on-chain verifiziert wurde. |
| [Q-Day Counter](/build-before-qday/workshop-1/apps/qday-counter) | Einsteiger | TypeScript, Solidity | 25 Minuten | Ein Zähler-Contract auf dem Testnet, den Sie mit einem hybrid signierten Ablauf erhöhen. |
| [Q-Day Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) | Fortgeschritten | TypeScript, Solidity, React | 45 Minuten | Ihr eigenes On-chain-Gästebuch, mit einer Webseite, auf der Sie aus der QoreX-Wallet signieren. |
| [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) | Einsteiger | TypeScript, React | 25 Minuten | Eine Webseite, die QOR aus QoreX sendet und beide Signaturen sowie das Urteil der Chain anzeigt. |
| [Rust, qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) | Fortgeschritten | Rust | 25 Minuten | Eine Kommandozeilen-App, die mit hybrider Signatur bezahlt und sie on-chain verifiziert. |
| [Java, Tip Jar](/build-before-qday/workshop-1/apps/java-tipjar) | Fortgeschritten | Java 21 | 25 Minuten | Ein Backend, das Trinkgelder sendet und nur Zahlungen akzeptiert, die Post-Quanten-signiert wurden. |
| [Python, Airdrop](/build-before-qday/workshop-1/apps/python-airdrop) | Einsteiger | Python | 20 Minuten | Eine Transaktion, die viele Adressen bezahlt, mit beiden Schlüsseln signiert und on-chain verifiziert. |

Was die Stufen hier bedeuten:

- **Einsteiger:** ein paar Befehle, die Sie der Reihe nach einfügen. Kein Code zu schreiben.
- **Fortgeschritten:** dasselbe, mit einem zweiten Werkzeug, etwa einer Webseite, einer Wallet-Erweiterung oder einer Sprach-Toolchain, die Sie vielleicht noch nicht benutzt haben.

Jedes Tutorial folgt derselben Form: **Bevor Sie beginnen**, nummerierte Schritte (jeder Befehl mit dem, was er tut, und was seine einzelnen Teile bedeuten), **Was Sie sehen sollten**, wie Sie die Transaktion on-chain **verifizieren**, und eine Tabelle zur **Fehlerbehebung**.

## Bevor Sie beginnen {#before-you-start}

Lesen Sie [Bevor Sie beginnen: Werkzeuge und eine Testnet-Wallet](/build-before-qday/prerequisites) einmal durch. Es behandelt:

- Die Installation von Node.js, pnpm, Git, Rust, Java, Maven, Python und jq unter macOS, Windows und Linux, jeweils mit einem Prüfbefehl.
- Die Einrichtung der QoreX-Wallet auf dem Testnet.
- Test-QOR vom Faucet erhalten (100 QOR alle 24 Stunden pro Konto).
- QOR und uqor: 1 QOR sind 1.000.000 uqor.
- Wie Sie einen Wegwerf-Testnet-Schlüssel sicher aufbewahren. Verwenden Sie nur Testkonten, niemals eine Wallet mit echtem Guthaben.

## Wo Sie anfangen {#where-to-start}

1. Lesen Sie [Bevor Sie beginnen](/build-before-qday/prerequisites) und installieren Sie die Werkzeuge für Ihr erstes Tutorial.
2. Folgen Sie der [Workshop-1-Anleitung](/build-before-qday/workshop-1) auf dem Testnet.
3. Probieren Sie eine der Beispiel-Apps aus der Tabelle oben aus.
4. Wenn Sie noch nie auf QoreChain bereitgestellt haben, erklärt [In 5 Minuten bereitstellen](/getting-started/deploy-in-5-minutes) die Idee ausführlich. Die Kits hinter den Apps stehen auf der Seite [Kits](/build-before-qday/workshop-1/kits).

## Der Code {#code}

Alle Beispiel-Apps liegen in einem öffentlichen Repository, im Ordner `workshop-1`: [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday). Jedes Tutorial sagt Ihnen, welchen Ordner Sie öffnen. Holen Sie sich den Code einmal mit:

```bash
git clone https://github.com/qorechain/build-before-qday
```

| Teil | Was er tut |
| --- | --- |
| `git clone` | Lädt eine vollständige Kopie eines Code-Repositorys auf Ihren Computer herunter. |
| `https://github.com/qorechain/build-before-qday` | Die Adresse des Repositorys, das kopiert werden soll. |

**Was Sie sehen sollten:** ein neuer Ordner namens `build-before-qday` in dem Ordner, in dem Sie den Befehl ausgeführt haben.
