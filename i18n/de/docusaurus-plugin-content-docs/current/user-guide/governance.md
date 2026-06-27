---
slug: /user-guide/governance
title: Governance
sidebar_label: Governance
sidebar_position: 3
---

# Governance

Dieser Leitfaden beschreibt, wie On-Chain-Governance auf QoreChain funktioniert, einschließlich des Abstimmungssystems Quadratic Delegation-Reputation Weighted (QDRW), wie Vorschläge eingereicht werden und wie abgestimmt wird.

:::note
Die nachfolgenden Befehle verwenden das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**). Das Mainnet (**`qorechain-vladi`**, EVM-Chain-ID **9801**) ist seit dem 7. Juni 2026 live und läuft mit der Chain-Version **v3.1.77** — ersetzen Sie die Mainnet-Chain-ID und die Endpunkte aus der Seite **Mit dem Mainnet verbinden**, wenn Sie auf dem Mainnet an der Governance teilnehmen.
:::

---

## Stimmgewicht: QDRW-Formel

QoreChain verwendet die Formel **Quadratic Delegation-Reputation Weighted (QDRW)** zur Berechnung des Stimmgewichts. Dieses System verhindert die Dominanz von Walen und belohnt zugleich Teilnehmer, die hohe Reputationswerte erworben und sich durch xQORE-Staking zur Governance verpflichtet haben.

```
VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)
```

| Variable                  | Beschreibung                                                                                                                     |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `VP`                      | Effektives Stimmgewicht                                                                                                         |
| `staked`                  | Gesamtmenge der vom Abstimmenden gestakten QOR-Token                                                                            |
| `xQORE`                   | Menge der gehaltenen xQORE-Governance-Token (siehe [xQORE-Staking](/user-guide/xqore-staking))                                  |
| `r`                       | Reputationswert des Abstimmenden, normalisiert auf \[0, 1]                                                                      |
| `ReputationMultiplier(r)` | Sigmoid-Funktion, die die Reputation auf einen Multiplikator im Bereich \[0.5, 2.0] abbildet                                    |

### Wesentliche Eigenschaften

* **Quadratische Dämpfung:** Ein Halter mit dem 100-fachen Stake eines anderen Abstimmenden gewinnt nur \~10-fach mehr Stimmgewicht, nicht 100-fach. Dadurch skaliert der Governance-Einfluss sublinear mit dem Vermögen.
* **xQORE-Bonus:** xQORE-Token zählen mit **2-fachem Gewicht** innerhalb der Quadratwurzel und verschaffen governance-engagierten Teilnehmern einen spürbaren Vorteil.
* **Reputationsmultiplikator:** Bildet den Reputationswert des Abstimmenden mithilfe einer Sigmoid-Kurve von \[0, 1] auf einen Multiplikator in \[0.5, 2.0] ab. Teilnehmer mit hoher Reputation können ihr effektives Stimmgewicht verdoppeln, während Teilnehmer mit niedriger Reputation ihren Einfluss halbiert sehen.

---

## Einen Vorschlag einreichen

Jeder QOR-Halter kann einen Governance-Vorschlag einreichen. Eine Mindesteinlage ist erforderlich, damit der Vorschlag in die Abstimmungsphase eintritt.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Beispiel-Vorschlagsdatei** (`proposal.json`):

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

Sobald ein Vorschlag in die Abstimmungsphase eintritt, kann jeder Staker eine Stimme abgeben:

```bash
qorechaind tx gov vote <proposal_id> <option> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Abstimmungsoptionen:**

| Option         | Beschreibung                                                                                             |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| `yes`          | Den Vorschlag unterstützen                                                                               |
| `no`           | Den Vorschlag ablehnen                                                                                   |
| `abstain`      | Den Vorschlag zur Kenntnis nehmen, ohne Position zu beziehen                                             |
| `no_with_veto` | Den Vorschlag ablehnen und signalisieren, dass er nicht hätte eingereicht werden sollen (verbrennt die Einlage, wenn der Schwellenwert erreicht wird) |

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

| Typ                  | Beschreibung                                                                                    |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| **Text**             | Ein Signalvorschlag ohne automatische On-Chain-Ausführung. Wird für Stimmungsbilder der Community verwendet. |
| **Parameteränderung** | Ändert einen oder mehrere On-Chain-Protokollparameter (z. B. max. Validatoren, Emissionsrate).  |
| **Software-Upgrade** | Plant ein koordiniertes Chain-Upgrade bei einer angegebenen Blockhöhe.                          |
| **Community-Ausgabe** | Beantragt Mittel aus der Community-Treasury für eine angegebene Empfängeradresse.               |

---

## Vorschläge abfragen

Listen Sie alle Vorschläge auf:

```bash
qorechaind query gov proposals
```

Fragen Sie einen bestimmten Vorschlag nach ID ab:

```bash
qorechaind query gov proposal <proposal_id>
```

Prüfen Sie die aktuelle Auszählung der Stimmen zu einem Vorschlag:

```bash
qorechaind query gov tally <proposal_id>
```

Sehen Sie Ihre eigene Stimme zu einem Vorschlag ein:

```bash
qorechaind query gov vote <proposal_id> <voter_address>
```

---

## Governance-Parameter

Fragen Sie die aktuellen Governance-Parameter ab:

```bash
qorechaind query gov params
```

Zu den wichtigsten Parametern gehören:

| Parameter            | Beschreibung                                                     |
| -------------------- | ---------------------------------------------------------------- |
| `min_deposit`        | Mindesteinlage, die erforderlich ist, damit ein Vorschlag in die Abstimmung eintritt |
| `max_deposit_period` | Zeitfenster zum Erreichen der Mindesteinlage                     |
| `voting_period`      | Dauer der Abstimmungsphase, sobald ein Vorschlag aktiv ist       |
| `quorum`             | Mindestbeteiligung, die für eine gültige Abstimmung erforderlich ist |
| `threshold`          | Mindest-„yes"-Prozentsatz zum Annehmen (ohne Enthaltungen)      |
| `veto_threshold`     | Mindest-„no with veto"-Prozentsatz zum Ablehnen und Verbrennen der Einlage |

---

:::tip

* Bauen Sie vor wichtigen Governance-Abstimmungen Reputation auf, um Ihren Stimmgewicht-Multiplikator zu maximieren.
* Sperren Sie QOR in xQORE, um innerhalb der QDRW-Formel einen 2-fachen Governance-Gewichtsbonus zu erhalten.
* Verwenden Sie `no_with_veto` mit Bedacht. Wenn der Veto-Schwellenwert erreicht wird, wird die Vorschlagseinlage verbrannt.
* Vorschläge, die die Mindesteinlage innerhalb der Einlagenfrist nicht erreichen, werden automatisch entfernt.

:::
