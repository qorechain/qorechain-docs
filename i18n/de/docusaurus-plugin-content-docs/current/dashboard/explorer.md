---
slug: /dashboard/explorer
title: Explorer
sidebar_label: Explorer
sidebar_position: 2
---

# Explorer

Der **Explorer** ist das Fenster des Dashboards zur Chain. Verwenden Sie ihn, um Blöcke, Transaktionen, Adressen und Validatoren nachzuschlagen und die Netzwerkaktivität in Echtzeit zu beobachten. Der Explorer ist schreibgeschützt — zum Durchsuchen ist keine Wallet-Verbindung erforderlich.

## Die Übersichtsseite

Öffnen Sie den **Explorer** im Dashboard, um eine Live-Momentaufnahme des Netzwerks zu sehen:

- **Netzwerkstatus** — Chain-ID, aktueller Status und ein Quantum-Safe-Indikator.
- **Block-Aktivität** — die neueste Blockhöhe, die durchschnittliche Blockzeit und die heute produzierten Blöcke.
- **Supply** — gesamtes gebondetes QOR, das Bonded-Verhältnis und der zirkulierende Bestand.
- **Eckdaten** — Gesamtzahl der Transaktionen, aktive und gesamte Validatoren sowie Gesamtzahl der Adressen.
- **Neueste Blöcke** — eine Live-Liste mit Höhe, Zeit, Transaktionsanzahl und Proposer jedes Blocks.
- **Neueste Transaktionen** — eine Live-Liste mit Hash, Typ, Block, Betrag und Absender jeder Transaktion.

Klicken Sie auf eine beliebige Block- oder Transaktionszeile, um die zugehörige Detailseite zu öffnen. Ein Aktualisierungssteuerelement an jeder Liste ruft die neuesten Einträge ab.

## Suche

Das Suchfeld oben im Explorer akzeptiert eines der folgenden Elemente und leitet Sie automatisch zur richtigen Seite weiter:

- Eine **Adresse** (`qor1...`)
- Einen **Transaktions-Hash**
- Eine **Blockhöhe** (eine Zahl)

## Transaktionsdetails

Eine Transaktionsseite zeigt ihren Hash, Status, Betrag, Absender und Empfänger (beide anklickbar), Gebühr, Blockhöhe, Transaktionstyp und Memo, falls vorhanden. Sie können den Hash kopieren und eine Rohansicht der vollständigen Transaktion zur genaueren Untersuchung ein- und ausblenden.

## Blockdetails

Eine Blockseite zeigt ihre Höhe, ihren Zeitstempel, den Proposer, den Hash, die Transaktionsanzahl, das verbrauchte Gas und die Liste der enthaltenen Transaktionen sowie Konsens- und Post-Quantum-Signaturinformationen. Steuerelemente für Zurück und Vor ermöglichen es Ihnen, die Chain Block für Block durchzugehen.

## Adressdetails

Eine Adressseite zeigt die Adresse mit einem scanbaren QR-Code, ihren QOR-Kontostand, die Transaktionsanzahl sowie die Summen für eingehende und ausgehende Transfers. Darunter befindet sich der vollständige Transaktionsverlauf für die Adresse — Transfers, Swaps, Faucet-Bezüge und mehr — jeweils mit Betrag, Zeit und Status. Sie können die Adresse kopieren, ihren QR-Code herunterladen und jede Transaktion für Details öffnen.

## Validatoren {#validators}

Die Validatoren-Ansicht listet die Validatoren des Netzwerks mit Übersichtskarten für die Anzahl der aktiven Validatoren, das gesamte gebondete QOR und die Konsens-Gesundheit auf. Die Tabelle zeigt Rang, Moniker, Voting Power, Provision und Status (zum Beispiel aktiv oder jailed) jedes Validators sowie einen Post-Quantum-Indikator. Ein Suchfeld filtert nach Validatorname oder -adresse. Um an einen Validator zu delegieren, siehe [Staking & Validatoren](/dashboard/staking-and-validators).
