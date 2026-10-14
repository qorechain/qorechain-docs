---
slug: /dashboard/contract-auditor
title: Contract Auditor
sidebar_label: Contract Auditor
sidebar_position: 7
---

# Contract Auditor

Der **Contract Auditor** führt eine KI-gestützte Sicherheitsanalyse eines Smart Contracts durch, angetrieben von **QCAI**. Reichen Sie einen Contract ein, und QCAI überprüft ihn auf Schwachstellen, weist eine Gesamtrisikostufe und einen Sicherheits-Score zu und erklärt jeden Befund mit einer empfohlenen Behebung. Wie der [Smart Contract Creator](/dashboard/smart-contract-creator) arbeitet der Auditor für KI-Tooling über **17 Blockchains** hinweg.

## Ein Audit durchführen

1. Melden Sie sich an, öffnen Sie **AI Audit** und fügen Sie Ihren Contract in **Contract Source Code** ein. Legen Sie optional die **Blockchain** fest (Standard ist **Auto-detect from code**) sowie einen **Name**.
2. Wählen Sie **Run Security Audit**. QCAI überprüft den Contract und erstellt einen Bericht; mit **Export PDF** speichern Sie ihn.

## Den Bericht lesen

Ein Audit-Bericht wird auf einer eigenen Seite geöffnet und enthält:

- **Risikostufe** — eine Gesamtbewertung (zum Beispiel kritisch, hoch, mittel oder niedrig), farblich codiert für schnelles Überfliegen.
- **Sicherheits-Score** — ein Gesamt-Score von 0 bis 100.
- **Schweregrad-Aufschlüsselung** — wie viele Befunde in jeden Schweregrad fallen (kritisch, hoch, mittel, niedrig und informativ).
- **Zusammenfassung** — ein kurzer Überblick über die Sicherheitslage des Contracts.

### Befunde

Jeder Befund führt seinen Schweregrad auf, einen Titel, die Stelle im Code, auf die er sich bezieht, eine Beschreibung des Problems und eine empfohlene Behebung. Wenn ein Contract auf einer bestimmten Stufe keine Probleme aufweist, vermerkt der Bericht dies.

Sofern zutreffend enthält der Bericht außerdem Abschnitte für allgemeine Empfehlungen, Gas-Optimierungen, Best Practices und positive Aspekte, die der Contract bereits richtig umsetzt.

## Frühere Audits überprüfen

Die Audit-Liste zeigt Ihre vorherigen Berichte in einer Tabelle mit dem Contract-Namen, der Blockchain, der Risikostufe, dem Sicherheits-Score und dem Erstellungszeitpunkt jedes Berichts. Ein Suchfeld filtert nach Contract-Name oder Blockchain. Wählen Sie eine beliebige Zeile aus, um den vollständigen Bericht erneut zu öffnen. Berichte sind **standardmäßig privat**; bei einem Bericht, der Ihnen gehört, steht oben ein Schalter mit der Beschriftung „This report is private" — schalten Sie ihn ein, um den Bericht öffentlich zu machen, sodass ihn jeder mit dem Link lesen kann (Ihr Name und Ihre IP werden nie angezeigt), und schalten Sie ihn aus, um ihn wieder privat zu machen.

:::tip Auditieren Sie vor dem Deployen
Führen Sie ein Audit als letzten Schritt vor dem Deployen durch und wiederholen Sie es nach jeder Änderung. Behandeln Sie Befunde als zu prüfende Orientierungshilfe, nicht als automatische Garantie — kombinieren Sie den Bericht mit Ihren eigenen Tests im [Testnet](/getting-started/connecting-to-testnet).
:::

## Verwandte Themen

- [Smart Contract Creator](/dashboard/smart-contract-creator) — Contracts mit QCAI generieren.
- [Post-Quantum-Sicherheit](/architecture/post-quantum-security) — wie QoreChain Konten und Signaturen absichert.
