---
slug: /user-guide/deploying-rollups
title: Rollups bereitstellen
sidebar_label: Rollups bereitstellen
sidebar_position: 6
---

# Rollups bereitstellen

Diese Anleitung ist eine kurze Orientierung zum Start eines anwendungsspezifischen Rollups, das mit dem Rollup Development Kit (RDK) auf QoreChain abgewickelt wird. Die Schritt-für-Schritt-Befehle finden Sie unter **[Ein Rollup bereitstellen](/rollups/deploying-a-rollup)**; diese Seite behandelt, was Sie vor dem Start benötigen.

:::caution Frühe Entwicklungsphase
Auf keinem der beiden Netzwerke wurde bisher ein Rollup erstellt (geprüft am 27. Oktober 2026). Das Mainnet (**`qorechain-vladi`**, EVM-Chain-ID **9801**) läuft seit dem 23. Oktober 2026 mit Chain-Version **v3.2.4**; das Testnet (**`qorechain-diana`**, EVM-Chain-ID **9800**) läuft mit v3.2.6 (seit dem 27. Oktober 2026), und sein Standard-Anfechtungsfenster beträgt 1 Stunde statt 7 Tage. Validieren Sie zuerst im Testnet; das Verhalten des Anfechtungsfensters ist im [Rollup Development Kit](/architecture/rollup-development-kit#optimistic-settlement) beschrieben.
:::

---

## Was ein Rollup hier ist {#what-a-rollup-is-here}

Ein QoreChain-Rollup ist eine anwendungsspezifische Chain, die **off-chain ausführt** und QoreChain zur **Abwicklung** (Settlement) nutzt: Sie registrieren das Rollup on-chain, reichen State-Root-Batches ein und (optional) Daten-Blobs und Auszahlungs-Commitments. Der On-Chain-Eintrag enthält ein Profil, einen Abwicklungsmodus, einen Sequenzer-Modus, ein Datenverfügbarkeits-Backend, ein Gasmodell und ein VM-Label; die Host-Chain führt die Transaktionen Ihres Rollups nicht aus.

---

## Voreingestellte Profile {#preset-profiles}

Das RDK wird mit fünf voreingestellten Profilen ausgeliefert, die jeweils auf eine gängige Anwendungskategorie zugeschnitten sind:

| Profil         | Abwicklung (Nachweis) | Sequenzer | DA              | Gasmodell    | VM       | Vorgesehener Anwendungsfall |
| -------------- | ------------------- | --------- | --------------- | ------------ | -------- | ----------------- |
| **defi**       | zk (SNARK)          | dedicated | native          | EIP-1559     | EVM      | DeFi-/AMM-Anwendungen (Lending, DEXs, Derivate) |
| **gaming**     | based               | based     | native          | flat         | custom   | Spielzustand mit hohem Durchsatz und Echtzeit-Erlebnisse |
| **nft**        | optimistic (fraud)  | dedicated | native (Celestia DA geplant) | standard | QoreChain Native | NFT-Minting und Marktplatz-Workloads |
| **enterprise** | based               | based     | native          | subsidized   | EVM      | Permissioned- und Konsortial-Deployments mit gesponserten Gebühren |
| **custom**     | Standardwerte: optimistic (fraud) | dedicated | native | standard | EVM | Ausgangs-Standardwerte; passen Sie an, was die Nachricht erlaubt |

Siehe [Voreingestellte Profile](/rollups/preset-profiles) für Details und Hinweise zum Reifegrad (zum Beispiel kann ZK-Settlement und damit das Profil `defi` auf keinem der beiden Netzwerke bisher genutzt werden, und `based`-Sequenzierung bedeutet derzeit, dass der Ersteller einreicht).

---

## Voraussetzungen {#requirements}

| Voraussetzung | Details |
| ----------- | ------- |
| **Rollup-Einsatz** | Mindestens 10.000 QOR (`min_stake_for_rollup`, 10.000.000.000 uqor). Den aktuellen Wert abfragen: `qorechaind query rdk config` |
| **Erstellungs-Burn** | 1 % des eingesetzten Betrags wird bei der Erstellung verbrannt; der Rest wird in einem Ledger pro Rollup hinterlegt (Escrow). Wenn Sie das Rollup stoppen, erhalten Sie zurück, was darin übrig ist (daraus bezahlte Auszahlungen und Fraud-Proof-Belohnungen verringern die Rückerstattung) |
| **Rollup-ID** | 3 bis 64 Zeichen: Kleinbuchstaben, Ziffern, `.`, `_` und `-`, beginnend mit einem Buchstaben oder einer Ziffer. Eine ID, die dies verletzt, wird abgelehnt, nachdem Sie die Gebühr bezahlt haben, prüfen Sie sie also vorher (das TypeScript-RDK 0.6.0 prüft sie, bevor es sendet) |
| **Einsatz für die Layer-Registrierung** | Beim Erstellen eines Rollups wird außerdem ein Layer beim Multilayer-Modul registriert, wodurch weitere 1.000 QOR des Erstellers gesperrt werden (werden zurückgegeben, wenn das Rollup gestoppt wird). Ohne dieses Guthaben wird der Layer nicht erstellt und das Rollup kann nicht verankert werden |
| **Konto** | Ein finanziertes Konto mit einem registrierten Post-Quantum-Schlüssel (jede Transaktion auf der nativen Lane wird hybrid signiert) |

---

## Tipps {#tips}

* Beginnen Sie mit einem voreingestellten Profil. Presets legen den Abwicklungsmodus, den Sequenzer, das Datenverfügbarkeits-Backend und die VM fest; `create-rollup` verlangt nur die ID, das Profil, den Einsatz und ein optionales `--vm`.
* Der 1-%-Erstellungs-Burn wird auf den von Ihnen eingesetzten Betrag angewendet.
* Batches werden ohne Anker abgewickelt, es sei denn, Sie senden die Post-Quantum-Signatur des Erstellers mit (`--anchor-signature` bei `tx rdk submit-batch`, verfügbar seit v3.2.2). Siehe [State Anchoring](/architecture/rollup-development-kit#state-anchoring).
* Auszahlungen nach L1 (`tx rdk execute-withdrawal`) werden aus dem Escrow-Ledger Ihres Rollups bezahlt und funktionieren im Mainnet seit v3.2.3; sie benötigen einen finalisierten Batch mit einer Auszahlungs-Root und verwenden ausschließlich `uqor`.
* Der Rollup-Ersteller ist derzeit der Batch-Einreicher (kein Preset setzt eine Sequenzer-Adresse), bewahren Sie den Schlüssel des Erstellers daher sicher auf: Nur der Ersteller kann das Rollup pausieren, fortsetzen oder stoppen.
* Das RDK ist in fünf Sprachen veröffentlicht (Version 0.7.0 auf npm, PyPI, crates.io, Maven Central und dem Go-Modul-Proxy; geprüft am 27. Oktober 2026), aber nur der TypeScript-Client signiert hybride Transaktionen, und zwar nur, wenn Sie ihm Ihr Post-Quantum-Schlüsselpaar geben; die `qorollup`-CLI und die Clients für Python, Go, Rust und Java signieren nur klassisch, was beide Netzwerke ablehnen. Siehe [RDK: Änderungen und Einschränkungen](/rollups/deploying-a-rollup#rdk-050-limits).
* Der Helfer `suggest-profile` liefert auf den öffentlichen Endpunkten derzeit einen festen `defi`-Fallback zurück, wählen Sie daher anhand der Profiltabelle.

---

## Nächste Schritte {#next-steps}

* [Ein Rollup bereitstellen](/rollups/deploying-a-rollup) — ein Rollup über die CLI oder TypeScript erstellen, betreiben und stoppen.
* [Rollups-Überblick](/rollups/overview) — Abwicklungsmodi, Sequenzer, Nachweissysteme.
* [Datenverfügbarkeit](/rollups/data-availability) und [ZK / STARK & Auszahlungen](/rollups/zk-stark-withdrawals).
