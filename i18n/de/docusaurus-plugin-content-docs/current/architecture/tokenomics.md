---
slug: /architecture/tokenomics
title: Tokenomics
sidebar_label: Tokenomics
sidebar_position: 6
---

# Tokenomics

QoreChain verwendet ein Wirtschaftsmodell mit **fixem Angebot**, das auf dem nativen **QOR**-Token basiert. Anstatt das Angebot im Zeitverlauf zu inflationieren, finanziert das Netzwerk Staking-Belohnungen aus einem endlichen, vorab zugewiesenen Emissionsbudget, während eine mehrkanalige Burn-Engine anhaltenden deflationären Druck ausübt, wenn die Netzwerknutzung wächst.

---

## Token-Grundlagen

| Eigenschaft            | Wert                                                      |
| ----------------------- | ---------------------------------------------------------- |
| **Anzeige-Token**       | QOR                                                        |
| **Basis-Denomination**  | uqor                                                       |
| **Dezimalpräzision**    | 10^6 (1 QOR = 1.000.000 uqor)                              |
| **Gesamtangebot**       | 4.500.000.000 QOR (fix)                                    |
| **Chain-ID**            | `qorechain-vladi` (Mainnet, EVM-Chain-ID 9801)             |
| **Bech32-Präfix**       | `qor` (Konten: `qor1...`, Validatoren: `qorvaloper...`)    |

:::note
Die Angaben auf dieser Seite beschreiben das **Mainnet** (`qorechain-vladi`, EVM-Chain-ID **9801**), live seit dem 7. Juni 2026 auf Chain-Version **v3.1.95**. Das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**) teilt sich dasselbe Wirtschaftsmodell.
:::

---

## Angebots- und Emissionsmodell

QoreChain hat ein **fixes Gesamtangebot von 4.500.000.000 QOR**. Es wird niemals neues QOR geprägt, um das Angebot zu inflationieren. Stattdessen:

* **80.000.000 QOR (1,78 % des Angebots)** wurden beim Token Generation Event (TGE) verbrannt.
* Staking-Belohnungen werden aus einem **endlichen Emissionsbudget von 590.000.000 QOR** ausgezahlt, das im Zeitverlauf nach einem abnehmenden Zeitplan abgebaut wird.

Dies ist ein **Modell mit fixem Angebot und einem endlichen Emissionsbudget**, kein Modell mit Angebotsinflation. Sobald das Emissionsbudget erschöpft ist, erfolgt keine weitere Belohnungsemission über das hinaus, was die Governance aus dem verbleibenden Budget zuweist.

### Staking-Belohnungszeitplan {#staking-reward-schedule}

:::note Die Emission wurde am 26. August 2026 per Governance gedeckelt
Der unten abgebildete abnehmende Zeitplan war das ursprüngliche Design, ausgelegt auf ein ausgereiftes Netzwerk mit dem Großteil des Angebots gebondet. Gemessen am Netzwerk, wie es tatsächlich stand — rund 6,8 Mio. QOR gebondet, weit unter diesem Zielwert — zahlte er rund 20 % des gebondeten Stakes *pro Tag* aus. Governance-Vorschlag #4 wurde mit 100 % des gebondeten Stakes angenommen und trat bei Höhe 2.122.074 (2026-08-26, 03:27 UTC, Chain-Version v3.1.94) in Kraft: Die Emission pro Epoche sank von 2.153.583 QOR auf **16.239 QOR**, unter einer neuen harten, kumulativen Obergrenze von **114.285.714 QOR** für dieses Modul — eine Design-Entscheidung, kein Bugfix. Zum Zeitpunkt des Inkrafttretens der Obergrenze waren unter dem alten Zeitplan bereits **104.680.531 QOR (91,6 %) emittiert worden**; beim neuen Satz wird das verbleibende Guthaben voraussichtlich noch etwa **1 Jahr und 11 Monate** reichen, danach stellt dieses Modul die Emission dauerhaft ein, und Validator-/Staker-Belohnungen stammen dann allein aus Transaktionsgebühren (siehe [Gebührenverteilung](#fee-distribution) unten). Die Tabelle unten bleibt als Referenz für das ursprüngliche Design erhalten — sie beschreibt nicht mehr die aktuell live gültige Auszahlungsrate.
:::

Staking-Belohnungen werden aus dem Emissionsbudget von 590.000.000 QOR nach einem abnehmenden Zeitplan verteilt:

| Zeitraum    | Ziel-APY               | Emissionsbudget             |
| ----------- | ----------------------- | -------------------------------- |
| Jahr 1      | 8–12 % APY              | 127.500.000 QOR                  |
| Jahr 2      | 6–10 % APY              | 106.250.000 QOR                  |
| Jahre 3–4   | 5–8 % APY               | 85.000.000 QOR pro Jahr          |
| Jahr 5+     | Von der Governance festgelegt | ~186.000.000 QOR verbleibend |

Die APY-Bereiche waren die ursprünglichen Zielwerte je Zeitraum im Design; sie entsprechen nicht der aktuell live gültigen Auszahlungsrate, seit die Emission wie oben beschrieben gedeckelt wurde. QoreChain stellt derzeit keinen Abfrage-Endpunkt bereit, um eine live gültige APY-Zahl zu berechnen — behandeln Sie jede spezifische Staking-Rendite-Prozentzahl, die Sie sehen (auch auf dieser Seite, historisch), als gegenüber der Chain heute nicht verifizierbar und nicht als Zahl, mit der geplant werden sollte.

---

## x/burn — Mehrkanalige Burn-Engine

Das `x/burn`-Modul implementiert ein 10-Kanal-Token-Burn-System. Jeder verbrannte Token wird dauerhaft aus dem zirkulierenden Angebot entfernt, was mit wachsender Netzwerknutzung anhaltenden deflationären Druck erzeugt.

### Burn-Kanäle

| #  | Kanal              | Quelle                       | Beschreibung                                    |
| -- | ------------------- | ----------------------------- | ------------------------------------------------ |
| 1  | `gas_fee`           | Transaktionsgebühren          | 30 % aller Gas-Gebühren werden verbrannt          |
| 2  | `contract_create`   | Smart-Contract-Deployment     | Pauschale Gebühr von 100 QOR pro Contract-Erstellung wird verbrannt |
| 3  | `ai_service`        | Nutzungsgebühren des KI-Moduls | 50 % der KI-Servicegebühren werden verbrannt     |
| 4  | `bridge_fee`        | Cross-Chain-Bridge-Gebühren   | 100 % der Bridge-Gebühren werden verbrannt        |
| 5  | `treasury_buyback`  | Treasury-Operationen          | Periodischer Buyback-and-Burn aus der Treasury    |
| 6  | `failed_tx`         | Gas fehlgeschlagener Transaktionen | 10 % des Gas fehlgeschlagener Transaktionen werden verbrannt |
| 7  | `xqore_penalty`     | Strafen bei vorzeitigem xQORE-Ausstieg | Strafbeträge werden über den Burn-Mechanismus geleitet |
| 8  | `auto_buyback`      | Automatisiertes Buyback-Programm | Automatisierte Burns auf Protokollebene         |
| 9  | `tge`               | Token Generation Event        | Einmalige Genesis-Burns (80.000.000 QOR)          |
| 10 | `rollup_create`     | Rollup-Deployment             | 1 % des Rollup-Erstellungs-Stakes wird verbrannt  |

### Gebührenverteilung {#fee-distribution}

Alle vom Netzwerk eingenommenen Transaktionsgebühren werden auf fünf Empfänger aufgeteilt, wie unten dargestellt. Die Anteile werden on-chain erzwungen und ergeben immer exakt 100 %.

```mermaid
flowchart LR
    F["Transaction fees"]
    F --> V["Validators<br/>37%"]
    F --> B["Burned<br/>30%"]
    F --> T["Treasury<br/>20%"]
    F --> S["Stakers<br/>10%"]
    F --> L["Light Nodes<br/>3%"]
```

Alle vom Netzwerk eingenommenen Transaktionsgebühren werden auf fünf Empfänger aufgeteilt:

| Empfänger       | Anteil | Beschreibung                                                          |
| ---------------- | ------ | ----------------------------------------------------------------------- |
| **Validatoren**  | 37 %   | An das aktive Validator-Set proportional zum Stake verteilt             |
| **Verbrannt**    | 30 %   | Über den `gas_fee`-Burn-Kanal dauerhaft aus dem Angebot entfernt        |
| **Treasury**     | 20 %   | Der Community-Treasury für governance-gesteuerte Ausgaben zugewiesen    |
| **Staker**       | 10 %   | An alle QOR-Staker proportional zur Delegation verteilt                 |
| **Light Nodes**  | 3 %    | An Light Nodes für die Bereitstellung von Netzwerkdaten verteilt        |

Die Anteile werden on-chain erzwungen und müssen immer exakt 100 % ergeben.

:::note Dies sind die konfigurierten Aufteilungen, keine bestätigte Live-Messung
Die obige Tabelle spiegelt die konfigurierten Parameter von `x/burn` wider. Eine Messung anhand des Live-Chain-Zustands ergab, dass der tatsächlich effektive kombinierte Anteil, der bei Validatoren und Stakern gemeinsam ankommt, niedriger liegt als die 47 %, die diese beiden Zeilen zusammen ergeben. Wir haben diese Diskrepanz noch nicht unabhängig geklärt, daher gibt diese Seite die konfigurierten Design-Werte an, statt eine der beiden Zahlen als bestätigt live gültig zu behaupten — fragen Sie die `x/burn`-Parameter und -Statistiken direkt ab (siehe [REST/gRPC-Endpunkte](/api-reference/rest-grpc-endpoints)), wenn Ihr Anwendungsfall von der exakten aktuellen Aufteilung abhängt.
:::

### Burn-Parameter

| Parameter              | Standard                    | Beschreibung                              |
| ----------------------- | --------------------------- | ------------------------------------------ |
| `gas_burn_rate`         | 0.30                        | Anteil der verbrannten Gas-Gebühren (30 %) |
| `contract_create_fee`   | 100.000.000 uqor (100 QOR)  | Pauschale Burn-Gebühr für Contract-Erstellung |
| `ai_service_burn_rate`  | 0.50                        | Anteil der verbrannten KI-Servicegebühren (50 %) |
| `bridge_burn_rate`      | 1.00                        | Anteil der verbrannten Bridge-Gebühren (100 %) |
| `failed_tx_burn_rate`   | 0.10                        | Anteil des verbrannten Gas fehlgeschlagener Transaktionen (10 %) |

Jedes Burn-Ereignis wird on-chain mit seiner Quelle, dem Betrag, der Blockhöhe und dem zugehörigen Transaktions-Hash aufgezeichnet. Aggregierte Statistiken sind pro Kanal und insgesamt abfragbar.

---

## x/xqore — Gesperrtes Staking und Governance-Verstärkung

Das `x/xqore`-Modul führt **xQORE** ein, ein nicht übertragbares Derivat für gesperrtes Staking. Nutzer sperren QOR, um xQORE im Verhältnis 1:1 zu prägen. xQORE-Inhaber erhalten verstärkte Governance-Macht und einen Anteil an umverteilten Ausstiegsstrafen.

### Sperrmechanismus

* **Sperren**: QOR an das xQORE-Modul senden, um xQORE im Verhältnis 1:1 zu prägen.
* **Governance-Gewicht**: xQORE-Inhaber erhalten im Vergleich zu Standard-QOR-Stakern **2-faches Governance-Stimmrecht**.
* **Nicht übertragbar**: xQORE kann nicht zwischen Konten gesendet werden. Es ist an die sperrende Adresse gebunden.

### Strafenzeitplan bei Ausstieg

Eine vorzeitige Auszahlung aus xQORE zieht eine Strafe nach sich, die mit der Sperrdauer abnimmt:

| Sperrdauer      | Strafsatz | Beschreibung                                |
| ---------------- | --------- | --------------------------------------------- |
| &lt; 30 Tage     | **50 %**  | Die Hälfte des gesperrten QOR verfällt         |
| 30 -- 90 Tage    | **35 %**  | Erhebliche Strafe bei kurzfristigen Sperren    |
| 90 -- 180 Tage   | **15 %**  | Reduzierte Strafe bei mittelfristigem Engagement |
| > 180 Tage       | **0 %**   | Vollständige Auszahlung ohne Strafe            |

### PvP-Rebase-Umverteilung

Bei vorzeitigem Ausstieg eingezogene Strafen werden nicht einfach vernichtet. Stattdessen folgen sie einem PvP-Rebase-Modell (Player-versus-Player):

1. **50 %** der Strafbeträge werden verbrannt (über `x/burn`, geleitet durch den `xqore_penalty`-Kanal).
2. **50 %** werden anteilig an alle verbleibenden xQORE-Inhaber umverteilt.

Dies erzeugt eine positiv-summige Dynamik für langfristige Inhaber: Jeder vorzeitige Ausstieg erhöht den effektiven Wert der verbleibenden xQORE-Positionen. Rebases erfolgen alle **100 Blöcke**.

### xQORE-Parameter

| Parameter                | Standard                | Beschreibung                                |
| ------------------------- | ------------------------ | --------------------------------------------- |
| `governance_multiplier`   | 2.0                      | Stimmrecht-Multiplikator für xQORE-Inhaber   |
| `min_lock_amount`         | 1.000.000 uqor (1 QOR)   | Mindestmenge an QOR zum Sperren               |
| `penalty_burn_rate`       | 0.50                     | Anteil der verbrannten Ausstiegsstrafen (50 %) |
| `rebase_interval`         | 100 Blöcke               | Blöcke zwischen PvP-Rebase-Ereignissen        |
| `enabled`                 | true                     | Flag zur Modulaktivierung                     |

---

## x/inflation — Emissionsbudget-Zeitplan

Trotz seines Modulnamens inflationiert das `x/inflation`-Modul das Gesamtangebot **nicht**. Es steuert die Freigabe von Staking-Belohnungen aus dem endlichen Emissionsbudget von **590.000.000 QOR** gemäß dem abnehmenden [Staking-Belohnungszeitplan](#staking-reward-schedule). Emissionen werden pro Epoche berechnet und an Staker und Validatoren verteilt, wobei das vorab zugewiesene Budget abgebaut wird, statt neues Angebot zu prägen.

### Epochen-Mechanik

* **Epochenlänge**: 17.280 Blöcke (\~1 Tag bei 5-Sekunden-Blockzeiten)
* **Blöcke pro Jahr**: \~6.311.520
* Zu Beginn jeder Epoche wird die geplante Emission für den aktuellen Zeitraum aus dem Emissionsbudget freigegeben und an Staker und Validatoren verteilt.
* Der Epochen-Tracker erfasst die aktuelle Epochennummer, das aktuelle Jahr, den Startblock, das kumulativ aus dem Emissionsbudget freigegebene QOR und das verbleibende Budget.

### Inflation-Parameter

| Parameter        | Standard        | Beschreibung                                                |
| ----------------- | ---------------- | ------------------------------------------------------------ |
| `schedule`        | abnehmend        | Zeitraum-indexiertes Emissionsbudget (siehe Staking-Belohnungszeitplan) |
| `epoch_length`    | 17.280 Blöcke    | Blöcke pro Emissionsepoche                                   |
| `enabled`         | true             | Flag zur Modulaktivierung                                    |

---

## Deflationäre Dynamik

Da das Angebot fix ist und die Emission aus einem endlichen Budget gezogen wird, tendiert die Netto-Token-Dynamik von QoreChain mit wachsender Akzeptanz zur Deflation:

```
Years 1-2:  Larger scheduled emissions from the budget offset burns → near-neutral supply
Years 3-4:  Scheduled emissions decline; burn volume grows with usage → convergence
Year 5+:    Emission budget is largely drawn down; burn channels (gas, bridge,
            contracts, rollups) scale with transaction volume → net deflationary
```

Die 10 Burn-Kanäle stellen sicher, dass jede wichtige Netzwerkaktivität Tokens aus dem Angebot entfernt. Mit steigendem Transaktionsvolumen, wachsender Bridge-Nutzung, mehr KI-Serviceaufrufen und mehr Rollup-Deployments beschleunigen sich die kumulativen Burns, während die geplanten Emissionen zum Ende des endlichen Budgets hin abnehmen.

---

## Reihenfolge des Modul-Lebenszyklus

Die Wirtschaftsmodule werden während des `EndBlocker` jedes Blocks in einer bestimmten Reihenfolge ausgeführt:

```
x/burn → x/xqore → x/inflation → x/rlconsensus
```

1. **x/burn** — Verarbeitet ausstehende Burn-Datensätze und aktualisiert aggregierte Statistiken.
2. **x/xqore** — Führt PvP-Rebases aus (alle `rebase_interval` Blöcke) und leitet Strafen an den Burn-Mechanismus weiter.
3. **x/inflation** — Gibt geplante Staking-Belohnungs-Emissionen an den Epochengrenzen aus dem Budget frei.
4. **x/rlconsensus** — Passt Konsensparameter basierend auf den Reinforcement-Learning-Signalen von PRISM an.

Diese Reihenfolge stellt sicher, dass Burns abgeschlossen sind, bevor Rebases stattfinden, und dass Rebases abgeschlossen sind, bevor geplante Emissionen freigegeben werden — so bleiben konsistente wirtschaftliche Zustandsübergänge gewahrt.

## Verwandte Themen

* [Chain-Parameter](/appendix/chain-parameters) — kanonische ökonomische und Konsens-Standardwerte.
* [Staking und Delegation](/user-guide/staking-and-delegation) — QOR delegieren und Belohnungen verdienen.
* [xQORE Staking](/user-guide/xqore-staking) — der PvP-Rebase-Staking-Mechanismus.
* [Light-Node-Belohnungen](/light-node/rewards-and-monitoring) — der Belohnungsanteil der Light Nodes.
