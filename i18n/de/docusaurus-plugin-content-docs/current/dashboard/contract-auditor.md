---
slug: /dashboard/contract-auditor
title: Contract Auditor
sidebar_label: Contract Auditor
sidebar_position: 7
---

# Contract Auditor

Der **Contract Auditor** (Seitenleiste **Build**, Eintrag **AI Audit**) führt mit **QCAIA**, dem KI-Assistenten von QoreChain, eine Sicherheitsprüfung des eingefügten Contract-Quellcodes durch und liefert einen Score, eine Risikostufe und Befunde mit empfohlenen Behebungen. Er richtet sich an Entwickler, die vor dem Testen und Deployen eines Contracts schnell eine zweite Einschätzung wollen. Er ist kein formales Audit und ersetzt keine Prüfung durch Menschen.

## Innovationen {#innovations}

- **Automatische Blockchain-Erkennung.** „Auto-detect from code“ ist die Voreinstellung; stattdessen können Sie eines von 17 Ökosystemen auswählen.
- **Ein separater Prozentwert für die Post-Quanten-Bereitschaft** neben dem Sicherheits-Score von 0 bis 100. Er wird für sich ausgewiesen und fließt nicht in den Sicherheits-Score ein.
- **Ein kostenloses Audit pro UTC-Tag.** Das erste Audit eines jeden UTC-Tages ist kostenlos. Danach wird jedes weitere Audit im Testnet nach einem Dialog „Confirm Security Audit“, der die „Audit Cost“ zeigt, in Test-QOR bezahlt; im Mainnet müssen weitere Audits bis zum nächsten UTC-Tag warten.
- **Berichte sind standardmäßig privat.** Der Eigentümer schaltet die Sichtbarkeit um; ein öffentlicher Bericht zeigt nie den Namen oder die IP des Eigentümers.
- **Befunde mit Behebungen, nicht nur Etiketten.** Jeder Befund hat einen Schweregrad, eine Fundstelle, eine Beschreibung und eine empfohlene Behebung, und der vollständige Bericht ergänzt Empfehlungen, Gas-Optimierungen, Best Practices und positive Aspekte.

## Anwendung {#how-to-use}

### Ein Audit durchführen

1. Melden Sie sich an (erforderlich) und öffnen Sie **AI Audit**.
2. Füllen Sie **Blockchain** (Standard „Auto-detect from code“), **Name (Optional)** und **Contract Source Code** aus.
3. Wählen Sie **Run Security Audit** und bestätigen Sie dann den Dialog „Confirm Security Audit“.
4. Der **Security Report** erscheint direkt auf derselben Seite. Mit **Export PDF** speichern Sie ihn.

**Minimales Beispiel:** Fügen Sie einen ERC-20 ein, lassen Sie die automatische Erkennung aktiv, **Run Security Audit**, Confirm, **Export PDF**.

### Den Bericht lesen

Der Bericht auf der Seite zeigt:

- die **Risk Level**, farblich codiert;
- den **Security Score** von 0 bis 100 sowie den Prozentwert der Post-Quanten-Bereitschaft;
- eine **Executive Summary**;
- **Vulnerabilities Found (N Issues)** mit den Schweregraden Critical, High, Medium, Low und Info. Ein sauberes Ergebnis lautet „No vulnerabilities detected“.

Jeder Befund führt Schweregrad, Titel, die Stelle im Code, eine Beschreibung und eine empfohlene Behebung auf.

Die vollständige Berichtsseite `/audits/<id>` ergänzt die Schweregrad-Aufschlüsselung, **Recommendations**, **Gas optimizations**, **Best practices**, **Positive aspects** und, für den Eigentümer, den Sichtbarkeitsschalter.

### Frühere Audits und Teilen

- Ihre eigenen Berichte finden Sie unter **Profile > Audited**.
- Die Liste **All Security Audits** unter `/audits` (von der Startseite aus verlinkt) zeigt die neuesten Audits, deren Eigentümer sie öffentlich gemacht haben, in einer Tabelle mit Contract-Name, Blockchain, Risikostufe, Score und Datum. Ein Suchfeld filtert nach Name, Blockchain oder Risikostufe. Private Berichte erscheinen dort nie; dasselbe gilt für die Liste der neuesten Audits auf der Startseite.
- Bei einem Bericht, der Ihnen gehört, steht oben ein Schalter mit der Beschriftung „This report is private“. Schalten Sie ihn ein, um den Bericht öffentlich zu machen, sodass ihn jeder mit dem Link lesen kann (Ihr Name und Ihre IP werden nie angezeigt), und schalten Sie ihn aus, um ihn wieder privat zu machen.

:::tip Auditieren Sie vor dem Deployen
Führen Sie ein Audit als letzten Schritt vor dem Deployen durch und wiederholen Sie es nach jeder Änderung. Behandeln Sie Befunde als zu prüfende Orientierungshilfe, nicht als Garantie, und kombinieren Sie den Bericht mit Ihren eigenen Tests im [Testnet](/getting-started/connecting-to-testnet).
:::

## Zugang {#how-to-access}

- **URL:** [dashboard.qorechain.io/audit](https://dashboard.qorechain.io/audit) oder **New Audit** auf der Startseite.
- **Konto:** Zum Durchführen eines Audits ist eine Anmeldung erforderlich. Die Liste unter `/audits` und öffentliche Berichte unter `/audits/<id>` lassen sich ohne Konto öffnen.
- **Netzwerke:** funktioniert in beiden. Die Regel zum täglichen kostenlosen Audit ist dieselbe; kostenpflichtige zusätzliche Audits gibt es nur im Testnet.
- **Kosten:** Das erste Audit eines jeden UTC-Tages ist kostenlos; zusätzliche Audits im Testnet kosten Test-QOR; zusätzliche Audits im Mainnet warten bis zum nächsten Tag.

## Wo es veröffentlicht ist {#where-published}

| Oberfläche | Adresse | Konto |
| --- | --- | --- |
| Ein Audit durchführen | `dashboard.qorechain.io/audit` | Anmeldung erforderlich |
| All Security Audits | `dashboard.qorechain.io/audits` | Keines |
| Ein Bericht | `dashboard.qorechain.io/audits/<id>` | Keines, wenn öffentlich; sonst der Eigentümer |

## Grenzen und bekannte Probleme {#limits}

- Er prüft nur den eingefügten Quellcode, ohne Kompilierung, Tests oder Laufzeitanalyse. Befunde können unvollständig oder falsch sein.
- Ein privater Bericht kann von niemandem außer seinem Eigentümer geöffnet werden, auch nicht mit dem Link.

## Verwandte Themen

- [Smart Contract Creator](/dashboard/smart-contract-creator) - Contracts mit QCAIA generieren.
- [Post-Quantum-Sicherheit](/architecture/post-quantum-security) - wie QoreChain Konten und Signaturen absichert.
