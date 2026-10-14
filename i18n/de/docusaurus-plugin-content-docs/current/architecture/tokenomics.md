---
slug: /architecture/tokenomics
title: Tokenomics
sidebar_label: Tokenomics
sidebar_position: 6
---

# Tokenomics

Das Wirtschaftsmodell von QoreChain basiert auf dem nativen **QOR**-Token und folgt einem **endlichen, gedeckelten Angebotspfad**: ein festes Genesis-Angebot, eine Staking-Belohnungs-Emission, die unter einer harten kumulativen Obergrenze geprägt wird, und eine mehrkanalige Burn-Engine, die Token dauerhaft entfernt. Diese Seite beschreibt, wie Angebot, Emission, Burns und die Gebührenaufteilung funktionieren, anhand von Zahlen, die von der Live-Chain gelesen wurden.

---

## Token-Grundlagen

| Eigenschaft            | Wert                                                      |
| ----------------------- | ---------------------------------------------------------- |
| **Anzeige-Token**       | QOR                                                        |
| **Basis-Denomination**  | uqor                                                       |
| **Dezimalpräzision**    | 10^6 (1 QOR = 1.000.000 uqor)                              |
| **Angebot**             | Genesis 4.420.000.000 QOR; siehe [Angebots- und Emissionsmodell](#supply-and-emission) |
| **Chain-ID**            | `qorechain-vladi` (Mainnet, EVM-Chain-ID 9801)             |
| **Bech32-Präfix**       | `qor` (Konten: `qor1...`, Validatoren: `qorvaloper...`)    |

:::note
Die Angaben auf dieser Seite beschreiben das **Mainnet** (`qorechain-vladi`, EVM-Chain-ID **9801**), live seit dem 29. Juni 2026 auf Release **v3.2.1**. Das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**) teilt sich dieselben Modulparameter; sein Angebots- und Emissionsverlauf unterscheidet sich jedoch (das Testnet-Angebot liegt weit über dem des Mainnets, und seine Emission hat die Obergrenze bereits überschritten) — verwenden Sie daher die Mainnet-Zahlen.
:::

---

## Angebots- und Emissionsmodell {#supply-and-emission}

QoreChain hat einen **endlichen, gedeckelten Angebotspfad**. Das Genesis-Angebot betrug **4.420.000.000 QOR** (geplant waren 4.500.000.000 QOR; 80.000.000 QOR, 1,78 %, wurden beim Token Generation Event vor dem Genesis verbrannt). Nach dem Genesis verändern nur zwei Dinge das Angebot:

* **Emission** — das `x/inflation`-Modul prägt in jeder Epoche einen festen Betrag, unter einer **harten kumulativen Obergrenze von 114.285.714 QOR**. Geprägte Token gelangen in den Fee-Collector und durchlaufen dieselbe Gebührenaufteilung wie Transaktionsgebühren (siehe [Gebührenverteilung](#fee-distribution)).
* **Burns** — das `x/burn`-Modul entfernt den Burn-Anteil von allem im Fee-Collector dauerhaft.

### Emission {#staking-reward-schedule}

| Parameter | Wert |
| --- | --- |
| Emissionsmodus | `fixed` (seit v3.1.94, Höhe 2.122.074 — 26. August 2026) |
| Emission pro Epoche | 16.239 QOR |
| Epochenlänge | 43.200 Blöcke (etwa 38,6 Stunden bei der aktuellen Blockzeit von ≈3,2 s) |
| Kumulative Obergrenze (`max_total_emission`) | 114.285.714 QOR |
| Bisher geprägt (14. Oktober 2026, Epoche 81) | 105.200.179 QOR (92,05 % der Obergrenze) |
| Verbleibend unter der Obergrenze | 9.085.535 QOR (etwa 559 Epochen bei 16.239 QOR pro Epoche) |

Sobald die Obergrenze erreicht ist, stellt das Modul das Prägen dauerhaft ein; danach stammen Belohnungen allein aus Transaktionsgebühren. Die Obergrenze wurde durch Governance-Vorschlag #4 festgelegt (angenommen, wobei der gesamte gebondete Stake dafür stimmte) und ersetzte den ursprünglichen abnehmenden Zeitplan, der für ein ausgereiftes, vollständig gebondetes Netzwerk kalibriert war und gemessen am tatsächlich gebondeten Stake weit schneller auszahlte als beabsichtigt. Die Zeitplanwerte (17,5 %, 11 %, 7 %, 7 %, 2 % für die Jahre 1–5) bleiben in den Modulparametern gespeichert, werden im `fixed`-Modus jedoch nicht verwendet.

QoreChain stellt keine Live-Zahl zur Staking-Rendite bereit; behandeln Sie jede genannte Prozentzahl als nicht verifiziert. Aktuelle Zahlen lassen sich aus dem Chain-Zustand lesen: das Angebot unter `GET /cosmos/bank/v1beta1/supply/by_denom?denom=uqor` und die Burn-Summen unter `GET /qorechain/burn/v1/stats`.

---

## x/burn — Mehrkanalige Burn-Engine

Das `x/burn`-Modul definiert **12 Burn-Quellen**. Jeder verbrannte Token wird dauerhaft aus dem Angebot entfernt. Auf dem Mainnet wurden bisher nur für `gas_fee` Burns verzeichnet (31.560.093 QOR Stand 14. Oktober 2026); die übrigen sind definiert, haben aber keine verzeichnet.

### Burn-Kanäle

| #  | Kanal              | Quelle                       | Beschreibung                                    |
| -- | ------------------- | ----------------------------- | ------------------------------------------------ |
| 1  | `gas_fee`           | Transaktionsgebühren          | 30 % aller Gas-Gebühren werden verbrannt          |
| 2  | `contract_create`   | Smart-Contract-Deployment     | Pauschale Gebühr von 100 QOR pro Contract-Erstellung wird verbrannt |
| 3  | `ai_service`        | Nutzungsgebühren des KI-Moduls | 50 % der KI-Servicegebühren werden verbrannt     |
| 4  | `bridge_fee`        | Cross-Chain-Bridge-Gebühren   | 100 % der Bridge-Gebühren werden verbrannt        |
| 5  | `treasury_buyback`  | Treasury-Operationen          | Periodischer Buyback-and-Burn aus der Treasury    |
| 6  | `failed_tx`         | Gas fehlgeschlagener Transaktionen | 10 % des Gas fehlgeschlagener Transaktionen werden verbrannt (von der Chain ab v3.2.2 angewendet; bisher nur im Testnet) |
| 7  | `xqore_penalty`     | Strafen bei vorzeitigem xQORE-Ausstieg | Strafbeträge werden über den Burn-Mechanismus geleitet |
| 8  | `auto_buyback`      | Automatisiertes Buyback-Programm | Automatisierte Burns auf Protokollebene         |
| 9  | `tge`               | Token Generation Event        | Der TGE-Burn von 80.000.000 QOR erfolgte vor dem Genesis (das Genesis-Angebot beträgt 4.420.000.000 QOR); dieser Kanal ist reserviert und verzeichnet 0 |
| 10 | `rollup_create`     | Rollup-Deployment             | 1 % des Rollup-Erstellungs-Stakes wird verbrannt  |
| 11 | `milestone`         | Meilensteine der Transaktionsanzahl | Geplante Burns bei festen kumulativen Transaktionszahlen (bisher keiner ausgelöst) |
| 12 | `amm`               | AMM                           | Reserviert für AMM-Protokollgebühren (keine verzeichnet) |

Die Kanäle `contract_create`, `ai_service`, `bridge_fee` und `auto_buyback` sind derzeit inaktiv: Der CosmWasm-Upload ist geschlossen, KI-Servicegebühren und die Bridge sind nicht live.

### Gebührenverteilung {#fee-distribution}

Alles im Fee-Collector wird auf fünf Empfänger aufgeteilt, wie unten dargestellt. Der Fee-Collector hält sowohl Transaktionsgebühren als auch die von `x/inflation` geprägte Epochen-Emission. Die Anteile werden on-chain erzwungen und ergeben immer exakt 100 %.

```mermaid
flowchart LR
    F["Fee-Collector<br/>(Gebühren + Emission)"]
    F --> V["Validatoren<br/>37%"]
    F --> B["Verbrannt<br/>30%"]
    F --> T["Treasury<br/>20%"]
    F --> S["Staker<br/>10%"]
    F --> L["Light Nodes<br/>3%"]
```

Die Anteile sind:

| Empfänger       | Anteil | Beschreibung                                                          |
| ---------------- | ------ | ----------------------------------------------------------------------- |
| **Validatoren**  | 37 %   | An das aktive Validator-Set proportional zum Stake verteilt             |
| **Verbrannt**    | 30 %   | Über den `gas_fee`-Burn-Kanal dauerhaft aus dem Angebot entfernt        |
| **Treasury**     | 20 %   | Der Community-Treasury für governance-gesteuerte Ausgaben zugewiesen    |
| **Staker**       | 10 %   | An alle QOR-Staker proportional zur Delegation verteilt                 |
| **Light Nodes**  | 3 %    | An Light Nodes für die Bereitstellung von Netzwerkdaten verteilt        |

Die Anteile werden on-chain erzwungen und müssen immer exakt 100 % ergeben.

:::note Was tatsächlich durch die Aufteilung fließt
Die Aufteilung gilt für alles im Fee-Collector, der sowohl Transaktionsgebühren als auch die von `x/inflation` geprägte Epochen-Emission hält. In der Praxis ist es heute fast ausschließlich Emission: Von 105.200.179 geprägten QOR wurden 31.560.093 QOR (30,0 %) verbrannt, und 3.156.009 QOR (3,0 %) liegen in der Light-Node-Reserve. Bis zum Upgrade auf v3.2.0 (25. September 2026, Höhe 2.981.742) wurde der 10-%-Staker-Anteil in den Bestand des Distribution-Moduls verschoben, ohne einen Anspruch zu decken — Staker und Validatoren erhielten daher zusammen 37 %, nicht 47 %; ab dieser Höhe wird der Staker-Anteil als normale Staking-Belohnung ausgezahlt, und der bereits gestrandete Betrag (6.693.045,92 QOR) wurde verzeichnet und kann nur per Governance-Abstimmung bewegt werden — siehe [Gestrandeter Staker-Anteil und Light-Node-Reserve](#stranded-and-reserve).
:::

### Burn-Parameter

| Parameter              | Standard                    | Beschreibung                              |
| ----------------------- | --------------------------- | ------------------------------------------ |
| `gas_burn_rate`         | 0.30                        | Anteil der verbrannten Gas-Gebühren (30 %) |
| `contract_create_fee`   | 100.000.000 uqor (100 QOR)  | Pauschale Burn-Gebühr für Contract-Erstellung |
| `ai_service_burn_rate`  | 0.50                        | Anteil der verbrannten KI-Servicegebühren (50 %) |
| `bridge_burn_rate`      | 1.00                        | Anteil der verbrannten Bridge-Gebühren (100 %) |
| `failed_tx_burn_rate`   | 0.10                        | Anteil des verbrannten Gas fehlgeschlagener Transaktionen (10 %) |
| `validator_share`       | 0.37                        | Anteil des Fee-Collectors an die Validatoren |
| `treasury_share`        | 0.20                        | Anteil an die Treasury                    |
| `staker_share`          | 0.10                        | Anteil an die Staker                      |
| `light_node_share`      | 0.03                        | Anteil an die Light Nodes                 |
| `enabled`               | true                        | Flag zur Modulaktivierung                 |

Jedes Burn-Ereignis wird on-chain mit seiner Quelle, dem Betrag, der Blockhöhe und dem zugehörigen Transaktions-Hash aufgezeichnet. Aggregierte Statistiken sind pro Kanal und insgesamt abfragbar.

---

## Gestrandeter Staker-Anteil und Light-Node-Reserve {#stranded-and-reserve}

Zwei Beträge haben sich auf dem Mainnet vor dem Upgrade auf v3.2.0 (25. September 2026, Höhe 2.981.742) angesammelt und werden nun **verzeichnet, außerhalb jeder Verteilung** gehalten. Beide können nur per Governance-Abstimmung bewegt werden.

| Datensatz | Betrag auf dem Mainnet | Abfrage | Governance-Nachricht |
| --- | --- | --- | --- |
| **Gestrandeter Staker-Anteil** — der 10-%-Staker-Anteil, der dort hinterlegt wurde, wo er keinen Staking-Belohnungsanspruch deckte | 6.693.045,921330 QOR verzeichnet, 0 freigegeben | `GET /qorechain/burn/v1/stranded_rewards` | `MsgReleaseStrandedRewards` (Governance-Autorität; benanntes Ziel; darf den Datensatz nicht übersteigen) |
| **Light-Node-Reserve** — der 3-%-Light-Node-Anteil, der sich ansammelte, während kein Light Node berechtigt war | 3.156.009,326407 QOR reserviert, 0 ausstehend | `GET /qorechain/lightnode/v1/reward_pool` | `MsgReleaseLightNodeReserve` (Governance-Autorität) |

Ab der Upgrade-Höhe wird der Staker-Anteil als normale Staking-Belohnung ausgezahlt, und Light-Node-Belohnungen werden nur aus dem gezahlt, was seit dem vorherigen Verteilungslauf angefallen ist, mit einer Obergrenze pro Node und Block (`max_reward_per_block_per_node`, 1.713 uqor, gelesen am 14. Oktober 2026). Die Light-Node-Registrierung ist derzeit geschlossen, sodass kein Node berechtigt ist und der 3-%-Anteil weiter der Reserve zufließt. Eine Freigabe vor dem Upgrade-Snapshot, über dem verzeichneten Betrag oder an ein ungültiges Ziel wird abgelehnt.

---

## x/xqore — Gesperrtes Staking und Governance-Verstärkung {#x-xqore}

:::warning Noch nicht live
Die Buchhaltung des xQORE-Moduls existiert und ist im Genesis aktiviert, aber sie ist auf dem Mainnet (`qorechain-vladi`) und dem Testnet (`qorechain-diana`) **noch nicht nutzbar**. Der Node hat keinen Transaktions-, Abfrage-, CLI- oder RPC-Einstiegspunkt dafür, daher funktionieren `tx xqore lock` / `unlock`, `query xqore ...`, die xQORE-REST-Routen und `qor_getXQOREPosition` nicht, und niemand hält xQORE. Es ist für ein künftiges Chain-Release geplant, das auch ändern wird, wie Ausstiegsstrafen umverteilt werden, sodass das Entsperren unabhängig von der Anzahl der Inhaber günstig bleibt. Das Release wird hier genannt, sobald es erscheint.
:::

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

1. In der Genesis-Konfiguration werden **0 %** der Strafbeträge verbrannt (`penalty_burn_rate = 0`; der Burn-Kanal `xqore_penalty` existiert, falls die Governance dies ändert).
2. **100 %** werden anteilig an alle verbleibenden xQORE-Inhaber umverteilt.

Dies erzeugt eine positiv-summige Dynamik für langfristige Inhaber: Jeder vorzeitige Ausstieg erhöht den effektiven Wert der verbleibenden xQORE-Positionen. Rebases erfolgen alle **100 Blöcke**.

### xQORE-Parameter

| Parameter                | Standard                | Beschreibung                                |
| ------------------------- | ------------------------ | --------------------------------------------- |
| `governance_multiplier`   | 2.0                      | Stimmrecht-Multiplikator für xQORE-Inhaber   |
| `min_lock_amount`         | 1.000.000 uqor (1 QOR)   | Mindestmenge an QOR zum Sperren               |
| `penalty_burn_rate`       | 0.00                     | Anteil der verbrannten Ausstiegsstrafen (Genesis-Standard: alle Strafen werden umverteilt) |
| `rebase_interval`         | 100 Blöcke               | Blöcke zwischen PvP-Rebase-Ereignissen        |
| `enabled`                 | true                     | Flag zur Modulaktivierung                     |

---

## x/inflation — Gedeckelte Emission

Das `x/inflation`-Modul prägt die Emission pro Epoche (16.239 QOR, `emission_mode = fixed`) und sendet sie an den Fee-Collector, bis die kumulative Obergrenze von 114.285.714 QOR erreicht ist. Parameteränderungen laufen über einen normalen Governance-Parametervorschlag (`MsgUpdateParams`, hinzugefügt in v3.1.94).

### Epochen-Mechanik

* **Epochenlänge**: 43.200 Blöcke (etwa 38,6 Stunden bei ≈3,2 s pro Block).
* An jeder Epochengrenze prägt das Modul die Epochen-Emission (oder den Rest bis zur Obergrenze), aktualisiert den Epochen-Datensatz und stellt das Prägen ein, sobald `total_minted` die Obergrenze erreicht.

### Parameter

| Parameter | Wert (Mainnet) | Beschreibung |
| --- | --- | --- |
| `emission_mode` | `fixed` | `schedule` (Legacy, jahresbasierte Sätze) oder `fixed` |
| `fixed_epoch_emission` | 16.239.000.000 uqor | Pro Epoche im Fixed-Modus geprägt |
| `max_total_emission` | 114.285.714.000.000 uqor | Harte kumulative Obergrenze |
| `epoch_length` | 43.200 Blöcke | Blöcke pro Emissionsepoche |
| `schedule` | 17,5 %, 11 %, 7 %, 7 %, 2 % (Jahre 1–5) | Legacy-Zeitplan, im Fixed-Modus ungenutzt |
| `enabled` | `true` | Flag zur Modulaktivierung |

Auf dem Mainnet sind diese Werte nicht über eine REST-Route verfügbar; sie lassen sich aus dem Chain-Zustand über die rohe Store-Schnittstelle des RPC `abci_query` lesen (Store `inflation`, Schlüssel `inflation/params` und `inflation/epoch`). Ein eigener Abfragedienst dafür existiert nur im Testnet (v3.2.2).

---

## Burn gegenüber Emission

Die Emission ist gedeckelt (114.285.714 QOR), und der Burn-Anteil gilt für alles, was in den Fee-Collector gelangt, einschließlich der Emission. Bislang wurden 31.560.093 QOR verbrannt, bei 105.200.179 QOR geprägt; das Angebot liegt daher derzeit über seinem Genesis-Niveau. Nachdem die Obergrenze erreicht ist, kann das Angebot nur noch sinken, und zwar um den verbrannten Betrag.

---

## Verwandte Themen

* [Chain-Parameter](/appendix/chain-parameters) — kanonische ökonomische und Konsens-Standardwerte.
* [Staking und Delegation](/user-guide/staking-and-delegation) — QOR delegieren und Staking-Belohnungen erhalten.
* [xQORE Staking](/user-guide/xqore-staking) — der PvP-Rebase-Staking-Mechanismus.
* [Light-Node-Belohnungen](/light-node/rewards-and-monitoring) — der Belohnungsanteil der Light Nodes.
