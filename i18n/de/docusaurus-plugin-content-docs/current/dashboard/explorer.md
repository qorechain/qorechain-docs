---
slug: /dashboard/explorer
title: Explorer
sidebar_label: Explorer
sidebar_position: 2
---

# Explorer

Der **Explorer** ist das Fenster des Dashboards zur Chain. Verwenden Sie ihn, um Blöcke, Transaktionen, Adressen und Validatoren nachzuschlagen und die Netzwerkaktivität in Echtzeit zu beobachten. Der Explorer ist schreibgeschützt — zum Durchsuchen ist keine Wallet-Verbindung erforderlich. Innerhalb des Dashboards setzt die Ansicht des Mainnets eine Anmeldung voraus; ein separater öffentlicher Explorer, der kein Konto benötigt, ist unter [explore.qore.network](https://explore.qore.network) verfügbar (er ist eine andere Anwendung mit eigenem Mainnet/Testnet-Umschalter).

## Die Übersichtsseite

Öffnen Sie den **Explorer** im Dashboard, um eine Live-Momentaufnahme des Netzwerks zu sehen:

- **Netzwerkstatus** — Chain-ID, aktueller Status und ein Sicherheitsstatus-Chip.
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

Die Seite zeigt auch, was die Transaktion geschützt hat, und sie macht nur eine Aussage, die die Chain belegt:

* **PQC Verified.** Eine Transaktion auf der Native-Schiene zeigt diese Karte nur, wenn sie erfolgreich war **und** die Chain selbst ihre Hybridsignatur einschließlich des ML-DSA-87-Anteils verifiziert hat (die Chain zeichnet dafür ein Verifikations-Event auf). Eine fehlgeschlagene Transaktion oder eine ohne verifizierte Hybridsignatur zeigt stattdessen Standardsicherheit; der Explorer nimmt nicht an, dass eine Signatur post-quantum ist.
* **Autorisiert durch ein PQC-Fenster.** Eine Transaktion, die von einer EVM-Wallet gesendet wird, trägt eine gewöhnliche secp256k1-Signatur und wird daher nie als „PQC Verified“ gekennzeichnet. Hatte der Absender beim Senden ein offenes [EVM-Autorisierungsfenster](/developer-guide/evm-development#evm-window), sagt die Seite, dass sie **durch ein PQC-Fenster autorisiert** wurde, und zeigt einen Link **Fenster geöffnet von** zu der post-quantum-signierten Transaktion, die das Fenster geöffnet hat. Das gilt ab den Aktivierungshöhen der Fenster-Funktion (Testnet 5,920,000; Mainnet 2,981,742).

Diese Kennzeichnungen gelten nur für den Dashboard-Explorer unter dashboard.qorechain.io/explorer. Der separate Explorer unter explore.qore.network ist eine andere Anwendung und wendet diese Regeln nicht an.

## Blockdetails

Eine Blockseite zeigt ihre Höhe, ihren Zeitstempel, den Proposer, den Hash, die Transaktionsanzahl, das verbrauchte Gas und die Liste der enthaltenen Transaktionen sowie ihre Signaturanzahl. Blöcke tragen keine Post-Quantum-Kennzeichnung: Sie werden mit den Konsens-Schlüsseln der Validatoren signiert, und der Post-Quantum-Schutz wird pro Transaktion angezeigt, nicht pro Block. Steuerelemente für Zurück und Vor ermöglichen es Ihnen, die Chain Block für Block durchzugehen.

## Adressdetails

Eine QoreChain-Adresse ist ein einziges Konto mit drei Kodierungen — Native (`qor1...`), EVM (`0x...`) und SVM (base58) — und die Adressseite führt die Aktivität aller drei Schienen zu einer einzigen Ansicht dieser einen Identität zusammen.

Die Seite zeigt die Adresse mit einem scanbaren QR-Code, ihren QOR-Kontostand, die Transaktionsanzahl sowie die Summen für eingehende und ausgehende Transfers. Darunter befindet sich der kombinierte Transaktionsverlauf der Adresse über die Native-, EVM- und SVM-Schienen — Transfers, Contract-Deployments, PQC-Schlüsselregistrierungen, Swaps, Faucet-Bezüge und mehr — jeweils mit Betrag, Zeit und Status. Sie können die Adresse kopieren, ihren QR-Code herunterladen und jede Transaktion für Details öffnen.

## Validatoren {#validators}

Die Validatoren-Ansicht listet die Validatoren des Netzwerks mit Übersichtskarten für die Anzahl der aktiven Validatoren, das gesamte gebondete QOR und die Konsens-Gesundheit auf. Die Tabelle zeigt Rang, Moniker, Voting Power, Provision und Status (zum Beispiel aktiv oder jailed) jedes Validators sowie einen Post-Quantum-Indikator. Ein Suchfeld filtert nach Validatorname oder -adresse. Um an einen Validator zu delegieren, siehe [Staking & Validatoren](/dashboard/staking-and-validators).

:::note Die Validatorenliste des Dashboards kann die Menge des anderen Netzwerks anzeigen
Verwenden Sie [explore.qore.network](https://explore.qore.network) für die maßgebliche Validatorenliste pro Netzwerk.
:::

## Eigenständiger Explorer {#standalone-explorer}

Derselbe Explorer wird auch ohne das Dashboard unter [explore.qore.network](https://explore.qore.network) bereitgestellt: anonym, nur Explorer, mit Kurzlinks wie `/tx/…`, `/block/…`, `/address/…` und `/validators`. Er öffnet sich standardmäßig im Mainnet.
