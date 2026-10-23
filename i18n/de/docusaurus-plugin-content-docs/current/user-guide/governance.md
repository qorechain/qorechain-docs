---
slug: /user-guide/governance
title: Governance
sidebar_label: Governance
sidebar_position: 3
---

# Governance

Dieser Leitfaden erklärt, wie die On-Chain-Governance bei QoreChain funktioniert: wie Stimmen ausgezählt werden, wie man Vorschläge einreicht und wie man abstimmt.

:::note
Die folgenden Befehle verwenden das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**). Das Mainnet (**`qorechain-vladi`**, EVM-Chain-ID **9801**) läuft seit dem 7. Juni 2026 live und seit dem 23. Oktober 2026 auf Release **v3.2.4**; das Testnet läuft seit dem 19. Oktober 2026 mit **v3.2.4** — ersetze die Chain-ID und Endpunkte des Mainnets gemäß der Seite **Connecting to Mainnet**, wenn du an der Governance im Mainnet teilnimmst.
:::

:::caution Mit `tx pqc cosign` signieren
Mainnet und Testnet verlangen für jede Transaktion auf der Cosmos-Lane eine hybride Post-Quantum-Signatur, daher lassen sich die Befehle auf dieser Seite so, wie sie dastehen, nicht senden. Hänge `--generate-only > tx.json` an einen Befehl an und führe dann `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>` aus. Siehe [Hybrides Signieren](/cli-reference/transaction-commands#hybrid-signing).
:::

---

## Stimmgewicht {#voting-power}

Vorschläge werden anhand des **gebondeten Stakes** ausgezählt: Jedes QOR, das du an einen gebondeten Validator delegiert hast, zählt als eine Einheit Stimmgewicht, ohne Multiplikator. Wenn du nicht selbst abstimmst, folgt deine Delegation der Stimme deines Validators; gibst du deine eigene Stimme ab, überschreibt sie dies für deinen Stake. Ein Vorschlag wird angenommen, wenn alle folgenden Bedingungen erfüllt sind:

| Regel     | Aktueller Wert | Bedeutung                                                                     |
| --------- | ---------- | ----------------------------------------------------------------------------- |
| Quorum    | 33.4%      | Anteil des gebondeten Stakes, der abstimmen muss                              |
| Schwellenwert | 50%   | Anteil der „Ja“-Stimmen unter den nicht enthaltenen Stimmen, der zur Annahme nötig ist |
| Veto      | 33.4%      | Erreicht „Nein mit Veto“ diesen Anteil, wird der Vorschlag abgelehnt und seine Einzahlung verbrannt |

Diese Werte wurden am 23. Oktober 2026 vom Mainnet ausgelesen (und sind im Testnet dieselben); bestätige sie mit `qorechaind query gov params`, da die Governance sie ändern kann.

:::note QDRW ist entworfen, aber nicht aktiv
Das Design von QoreChain sieht eine Stimmgewicht-Formel **Quadratic Delegation-Reputation Weighted (QDRW)** vor, `VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)`, die große Stakes dämpfen und Reputation gewichten würde. Sie ist im Modul `x/qca` implementiert, aber auf beiden Netzwerken **abgeschaltet** (`qdrw_enabled` ist in `qorechaind query qca config` `false`) und nicht Teil der Governance-Auszählung, beeinflusst also heute keine Abstimmung. xQORE ist ebenfalls noch nicht live (siehe [xQORE-Staking](/user-guide/xqore-staking)).
:::

---

## Einen Vorschlag einreichen

Jeder QOR-Halter kann einen Governance-Vorschlag einreichen. Damit der Vorschlag in die Abstimmungsphase eintritt, ist eine Mindesteinzahlung erforderlich.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Beispiel für eine Vorschlagsdatei** (`proposal.json`). Ein Vorschlag ist eine Liste von Nachrichten, die das Governance-Modul ausführt, wenn er angenommen wird, plus Titel, Zusammenfassung und Einzahlung. Dieser hier erhöht die maximale Validatorenzahl von 100 auf 150; `authority` ist das Modulkonto der Governance (`qorechaind query auth module-account gov`):

```json
{
  "messages": [
    {
      "@type": "/cosmos.staking.v1beta1.MsgUpdateParams",
      "authority": "qor10d07y265gmmuvt4z0w9aw880jnsr700jwfyxr3",
      "params": {
        "unbonding_time": "1814400s",
        "max_validators": 150,
        "max_entries": 7,
        "historical_entries": 10000,
        "bond_denom": "uqor",
        "min_commission_rate": "0.000000000000000000"
      }
    }
  ],
  "metadata": "",
  "deposit": "10000000uqor",
  "title": "Increase maximum validator count",
  "summary": "Raise the active validator set from 100 to 150 to improve decentralization.",
  "expedited": false
}
```

`MsgUpdateParams` ersetzt den gesamten Parametersatz, kopiere daher die aktuellen Werte aus `qorechaind query staking params` und ändere nur das Feld, das du ändern willst. Ein reiner Text-Vorschlag (Signalvorschlag) verwendet `"messages": []`. `qorechaind tx gov draft-proposal` erzeugt ein Grundgerüst.

---

## Über Vorschläge abstimmen

Sobald ein Vorschlag in die Abstimmungsphase eintritt, kann jeder Staker seine Stimme abgeben:

```bash
qorechaind tx gov vote <proposal_id> <option> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
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
  --gas 400000 --fees 40000uqor
```

---

## Vorschlagstypen

Ein Vorschlag enthält null oder mehr Nachrichten, die ausgeführt werden, wenn er angenommen wird. Häufige Fälle:

| Typ                    | Beschreibung                                                                                                  |
| ----------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Text**                | Ein Signalvorschlag ohne Nachrichten und ohne automatische On-Chain-Ausführung. Wird für Stimmungsbilder der Community genutzt. |
| **Parameter Change**    | Die `MsgUpdateParams`-Nachricht eines Moduls, gesendet vom Modulkonto der Governance. Sie ersetzt den gesamten Parametersatz dieses Moduls. |
| **Software Upgrade**    | Eine `MsgSoftwareUpgrade`-Nachricht, die ein koordiniertes Chain-Upgrade zu einer bestimmten Blockhöhe plant. |
| **Community Spend**     | Eine `MsgCommunityPoolSpend`-Nachricht, die Mittel aus dem Community-Pool an eine Empfängeradresse sendet. |
| **Expedited**           | Setze `"expedited": true` für eine kürzere Abstimmungsphase mit höherer Einzahlung und höherem Annahme-Schwellenwert (siehe unten). |

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

| Parameter             | Beschreibung                                                                    | Aktueller Wert (20. Okt. 2026) |
| ---------------------- | ----------------------------------------------------------------------------------- | ------------------------ |
| `min_deposit`          | Mindesteinzahlung, damit ein Vorschlag in die Abstimmung eintritt                   | 10 QOR (`10000000uqor`)  |
| `max_deposit_period`   | Zeitfenster zum Erreichen der Mindesteinzahlung                                     | 2 Tage                   |
| `voting_period`        | Dauer der Abstimmungsphase, sobald ein Vorschlag aktiv ist                          | 2 Tage                   |
| `quorum`               | Mindestbeteiligung, die für eine gültige Abstimmung erforderlich ist                | 0.334                    |
| `threshold`            | Mindestanteil an „Ja“-Stimmen zur Annahme (Enthaltungen ausgenommen)                | 0.5                      |
| `veto_threshold`       | Mindestanteil an „Nein mit Veto“-Stimmen, um abzulehnen und die Einzahlung zu verbrennen | 0.334                    |
| `expedited_voting_period` / `expedited_threshold` / `expedited_min_deposit` | Abstimmungsdauer, Annahme-Schwellenwert und Einzahlung für beschleunigte Vorschläge | 1 Tag / 0.667 / 50 QOR |

---

## Governance im Mainnet bisher {#mainnet-history}

Die Mainnet-Governance wurde für Parameteränderungen, Circuit-Breaker-Entscheidungen, koordinierte Upgrades und seit Oktober 2026 auch für die Freigabe von Beträgen genutzt, die die Chain beim Upgrade v3.2.0 verzeichnet hat. Die Vorschläge 7 bis 13 wurden im Oktober 2026 im Mainnet angenommen, darunter Vorschlag 12 (eine weitere Freigabe, angenommen am 21. Oktober) und Vorschlag 13 (das Upgrade auf v3.2.4, angewendet auf Höhe 3.742.566 am 23. Oktober); die Liste und die Ergebnisse stehen in der [Versionshistorie](/appendix/version-history#governance-timeline), und jeder Vorschlag lässt sich live unter `GET /cosmos/gov/v1/proposals` abrufen.

---

:::tip

* Stimme ab, bevor die Abstimmungsphase endet; deine Stimme zählt nur, wenn sie abgegeben wird, während sich der Vorschlag in der Abstimmungsphase befindet.
* Verwende `no_with_veto` mit Bedacht. Wird der Veto-Schwellenwert erreicht, wird die Einzahlung des Vorschlags verbrannt.
* Vorschläge, die innerhalb der Einzahlungsfrist die Mindesteinzahlung nicht erreichen, werden automatisch entfernt.

:::
