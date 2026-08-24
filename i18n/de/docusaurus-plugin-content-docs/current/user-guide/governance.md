---
slug: /user-guide/governance
title: Governance
sidebar_label: Governance
sidebar_position: 3
---

# Governance

Dieser Leitfaden erklärt, wie die On-Chain-Governance bei QoreChain funktioniert, einschließlich des Quadratic Delegation-Reputation Weighted (QDRW) Voting-Systems, wie man Vorschläge einreicht und wie man abstimmt.

:::note
Die folgenden Befehle verwenden das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**). Das Mainnet (**`qorechain-vladi`**, EVM-Chain-ID **9801**) läuft seit dem 7. Juni 2026 live mit Chain-Version **v3.1.92** — ersetze die Chain-ID und Endpunkte des Mainnets gemäß der Seite **Connecting to Mainnet**, wenn du an der Governance im Mainnet teilnimmst.
:::

---

## Stimmgewicht: QDRW-Formel

QoreChain verwendet die **Quadratic Delegation-Reputation Weighted (QDRW)**-Formel, um das Stimmgewicht zu berechnen. Dieses System verhindert die Dominanz von Großinvestoren und belohnt gleichzeitig Teilnehmer, die sich hohe Reputationswerte erarbeitet und sich durch xQORE-Staking für die Governance engagiert haben.

```
VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)
```

| Variable                  | Beschreibung                                                                                                                     |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `VP`                      | Effektives Stimmgewicht                                                                                                           |
| `staked`                  | Gesamtzahl der vom Abstimmenden gestakten QOR-Token                                                                               |
| `xQORE`                   | Menge der gehaltenen xQORE-Governance-Token (siehe [xQORE-Staking](/user-guide/xqore-staking))                                    |
| `r`                       | Reputationswert des Abstimmenden, normiert auf \[0, 1]                                                                            |
| `ReputationMultiplier(r)` | Sigmoid-Funktion, die die Reputation auf einen Multiplikator im Bereich \[0.5, 2.0] abbildet                                      |

### Wesentliche Eigenschaften

* **Quadratische Dämpfung:** Ein Halter mit dem 100-fachen Einsatz eines anderen Abstimmenden erhält nur etwa das 10-fache Stimmgewicht, nicht das 100-fache. Dadurch skaliert der Governance-Einfluss unterlinear mit dem Vermögen.
* **xQORE-Bonus:** xQORE-Token zählen innerhalb der Quadratwurzel mit **2-fachem Gewicht** und verschaffen Governance-engagierten Teilnehmern einen spürbaren Vorteil.
* **Reputationsmultiplikator:** Bildet den Reputationswert des Abstimmenden von \[0, 1] mittels einer Sigmoid-Kurve auf einen Multiplikator im Bereich \[0.5, 2.0] ab. Teilnehmer mit hoher Reputation können ihr effektives Stimmgewicht verdoppeln, während der Einfluss von Teilnehmern mit niedriger Reputation halbiert wird.

---

## Einen Vorschlag einreichen

Jeder QOR-Halter kann einen Governance-Vorschlag einreichen. Damit der Vorschlag in die Abstimmungsphase eintritt, ist eine Mindesteinzahlung erforderlich.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Beispiel für eine Vorschlagsdatei** (`proposal.json`):

```json
{
  "title": "Increase Maximum Validator Count",
  "description": "This proposal increases the maximum active validator set from 100 to 150 to improve decentralization.",
  "type": "parameter_change",
  "changes": [
    {
      "subspace": "staking",
      "key": "MaxValidators",
      "value": "150"
    }
  ],
  "deposit": "10000000uqor"
}
```

---

## Über Vorschläge abstimmen

Sobald ein Vorschlag in die Abstimmungsphase eintritt, kann jeder Staker seine Stimme abgeben:

```bash
qorechaind tx gov vote <proposal_id> <option> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Abstimmungsoptionen:**

| Option         | Beschreibung                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------------------ |
| `yes`          | Den Vorschlag unterstützen                                                                                          |
| `no`           | Den Vorschlag ablehnen                                                                                              |
| `abstain`      | Den Vorschlag zur Kenntnis nehmen, ohne eine Position einzunehmen                                                   |
| `no_with_veto` | Den Vorschlag ablehnen und signalisieren, dass er nicht hätte eingereicht werden dürfen (verbrennt die Einzahlung, falls der Schwellenwert erreicht wird) |

**Beispiel:**

```bash
qorechaind tx gov vote 1 yes \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Vorschlagstypen

QoreChain unterstützt die folgenden Governance-Vorschlagstypen:

| Typ                    | Beschreibung                                                                                                  |
| ----------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Text**                | Ein Signalvorschlag ohne automatische On-Chain-Ausführung. Wird für Stimmungsbilder der Community genutzt.     |
| **Parameter Change**    | Ändert einen oder mehrere On-Chain-Protokollparameter (z. B. maximale Validatorenzahl, Emissionsrate).          |
| **Software Upgrade**    | Plant ein koordiniertes Chain-Upgrade zu einer bestimmten Blockhöhe.                                            |
| **Community Spend**     | Fordert Mittel aus der Community-Treasury für eine bestimmte Empfängeradresse an.                              |

---

## Vorschläge abfragen

Alle Vorschläge auflisten:

```bash
qorechaind query gov proposals
```

Einen bestimmten Vorschlag anhand der ID abfragen:

```bash
qorechaind query gov proposal <proposal_id>
```

Das aktuelle Abstimmungsergebnis eines Vorschlags prüfen:

```bash
qorechaind query gov tally <proposal_id>
```

Die eigene Stimme zu einem Vorschlag einsehen:

```bash
qorechaind query gov vote <proposal_id> <voter_address>
```

---

## Governance-Parameter

Die aktuellen Governance-Parameter abfragen:

```bash
qorechaind query gov params
```

Wichtige Parameter sind unter anderem:

| Parameter             | Beschreibung                                                                    |
| ---------------------- | ----------------------------------------------------------------------------------- |
| `min_deposit`          | Mindesteinzahlung, damit ein Vorschlag in die Abstimmung eintritt                   |
| `max_deposit_period`   | Zeitfenster zum Erreichen der Mindesteinzahlung                                     |
| `voting_period`        | Dauer der Abstimmungsphase, sobald ein Vorschlag aktiv ist                          |
| `quorum`               | Mindestbeteiligung, die für eine gültige Abstimmung erforderlich ist                |
| `threshold`            | Mindestanteil an „Ja"-Stimmen zur Annahme (Enthaltungen ausgenommen)                |
| `veto_threshold`       | Mindestanteil an „Nein mit Veto"-Stimmen, um abzulehnen und die Einzahlung zu verbrennen |

---

:::tip

* Baue vor wichtigen Governance-Abstimmungen Reputation auf, um deinen Stimmgewicht-Multiplikator zu maximieren.
* Lege QOR in xQORE an, um innerhalb der QDRW-Formel einen 2-fachen Governance-Gewichtsbonus zu erhalten.
* Verwende `no_with_veto` mit Bedacht. Wird der Veto-Schwellenwert erreicht, wird die Einzahlung des Vorschlags verbrannt.
* Vorschläge, die innerhalb der Einzahlungsfrist die Mindesteinzahlung nicht erreichen, werden automatisch entfernt.

:::
