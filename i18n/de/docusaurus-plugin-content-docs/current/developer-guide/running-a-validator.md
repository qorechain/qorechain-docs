---
slug: /developer-guide/running-a-validator
title: Einen Validator betreiben
sidebar_label: Einen Validator betreiben
sidebar_position: 9
---

# Einen Validator betreiben

Dieser Leitfaden behandelt, wie Sie einen Validator im QoreChain-Netzwerk erstellen, das Pool-Klassifikationssystem verstehen, einen PQC-Schlüssel für quantenresistente Sicherheit registrieren und Ihren Node überwachen.

:::note
Dieser Leitfaden richtet sich an das **`qorechain-vladi`**-Mainnet (EVM-Chain-ID **9801**), das seit dem 7. Juni 2026 mit Chain-Version **v3.1.77** in Betrieb ist. Das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**) wird empfohlen, um Ihre Einrichtung vor dem Live-Gang zu proben. Ersetzen Sie die passende `--chain-id` für Ihr Zielnetzwerk.
:::

---

## Voraussetzungen

* Ein vollständig synchronisierter `qorechaind`-Node (siehe [Verbindung zum Testnet](/getting-started/connecting-to-testnet))
* Ein finanziertes Konto mit mindestens **1.000 QOR** (1.000.000.000 uqor) für die anfängliche Selbst-Delegation
* Vertrautheit mit dem Modell [Staking und Delegation](/user-guide/staking-and-delegation)

---

## Einen Validator erstellen

```bash
qorechaind tx staking create-validator \
  --amount 1000000000uqor \
  --pubkey $(qorechaind comet show-validator) \
  --moniker "my-validator" \
  --commission-rate 0.10 \
  --commission-max-rate 0.20 \
  --commission-max-change-rate 0.01 \
  --min-self-delegation 1 \
  --from mykey \
  --gas auto \
  --gas-adjustment 1.3 \
  -y
```

| Parameter                      | Beschreibung                                       |
| ------------------------------ | -------------------------------------------------- |
| `--amount`                     | Selbst-Delegationsbetrag (Mindeststake)            |
| `--pubkey`                     | Öffentlicher Konsensschlüssel des Validators (ed25519) |
| `--moniker`                    | Menschenlesbarer Name für Ihren Validator          |
| `--commission-rate`            | Anfängliche Provisionsrate (z. B. 0,10 = 10 %)     |
| `--commission-max-rate`        | Maximale Provisionsrate (nach Erstellung unveränderlich) |
| `--commission-max-change-rate` | Maximale tägliche Provisionsänderungsrate          |
| `--min-self-delegation`        | Mindestanzahl Tokens, die der Betreiber selbst delegieren muss |

Nachdem die Transaktion bestätigt wurde, verifizieren Sie Ihren Validator:

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## Pool-Klassifikation

QoreChain verwendet ein **Drei-Pool-Klassifikationssystem**, das vom Modul `x/qca` (Quantum Consensus Allocation) verwaltet wird. Alle **1.000 Blöcke** werden Validatoren basierend auf ihrer Reputation und ihrem Stake in einen von drei Pools neu klassifiziert:

| Pool                                 | Kriterien                                         | Blockzuweisung   |
| ------------------------------------ | ------------------------------------------------- | ---------------- |
| **RPoS** (Reputation Proof-of-Stake) | Reputation >= 70. Perzentil UND Stake >= Median   | 40 % der Blöcke    |
| **DPoS** (Delegated Proof-of-Stake)  | Gesamtdelegation >= 10.000 QOR                    | 35 % der Blöcke    |
| **PoS** (Proof-of-Stake)             | Alle übrigen aktiven Validatoren                  | 25 % der Blöcke    |

Innerhalb jedes Pools werden Block-Proposer mittels **gewichteter Zufallsauswahl** proportional zu ihrem effektiven Stake ausgewählt. Die Klassifikation stellt sicher, dass sowohl Validatoren mit hoher Reputation als auch mit hoher Delegation eine faire Repräsentation erhalten, während kleinere Validatoren weiterhin teilnehmen können.

### Ihre Pool-Klassifikation abfragen

```bash
qorechaind query qca pool-classification $(qorechaind keys show mykey --bech val -a)
```

Via JSON-RPC:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getPoolClassification",
    "params": ["qorvaloper1..."],
    "id": 1
  }'
```

---

## Bonding-Kurve

Die Staking-Belohnung für einen Validator wird durch eine Bonding-Kurve bestimmt, die mehrere Faktoren einbezieht:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Variable | Beschreibung                                               |
| -------- | ---------------------------------------------------------- |
| `R`      | Belohnungsbetrag                                           |
| `beta`   | Basis-Belohnungsrate                                       |
| `S`      | Effektiver Stake                                           |
| `alpha`  | Loyalitäts-Skalierungskonstante                            |
| `L`      | Loyalitätsdauer (kontinuierliche Staking-Zeit)             |
| `Q(r)`   | Reputations-Qualitätsfaktor, Bereich \[0,75 - 1,25]        |
| `P(t)`   | Protokollphasen-Multiplikator (passt sich über den Netzwerk-Lebenszyklus an) |

**Wichtigste Erkenntnisse:**

* **Loyalitätsdauer-Bonus:** Validatoren, die kontinuierlich staken, erhalten über den logarithmischen Loyalitätsterm steigende Belohnungen. Dies fördert langfristiges Engagement.
* **Reputations-Qualitätsfaktor:** Reicht von 0,75 (schlechte Reputation) bis 1,25 (ausgezeichnete Reputation). Die Reputation wird aus Verfügbarkeit, erfolgreichen Vorschlägen, Community-Beteiligung und Transaktionsvalidierungsqualität berechnet.
* **Protokollphasen-Multiplikator:** Passt sich an, während das Netzwerk durch verschiedene Phasen reift (Bootstrap, Wachstum, Reife).

---

## Progressives Slashing

QoreChain verwendet ein **progressives Slashing**-Modell, das Strafen für Wiederholungstäter eskaliert und es Validatoren gleichzeitig erlaubt, sich mit der Zeit zu erholen:

```
penalty = base_rate * escalation^effective_count * severity
```

| Parameter                    | Wert           |
| ---------------------------- | -------------- |
| Maximale Strafe pro Ereignis | 33 % des Stakes |
| Zerfalls-Halbwertszeit       | 100.000 Blöcke |
| Downtime-Schweregrad         | 1,0            |
| Double-Sign-Schweregrad      | 2,0            |
| Light-Client-Angriff-Schweregrad | 3,0        |

1. **Jeder Verstoß erhöht die effektive Zählung.** Jeder Verstoß (Downtime, Double-Signing usw.) erhöht die effektive Zählung des Validators, was zukünftige Strafen beeinflusst.

2. **Die Strafe eskaliert exponentiell.** Die Strafe eskaliert basierend auf der effektiven Zählung mit der obigen Formel, sodass Wiederholungstäter deutlich höhere Strafen erfahren.

3. **Die effektive Zählung zerfällt mit der Zeit.** Die effektive Zählung zerfällt mit einer Halbwertszeit von 100.000 Blöcken (\~7 Tage bei 6s-Blöcken), wodurch Validatoren sich nach einer Phase guten Verhaltens erholen können.

4. **Einzelereignisse vs. wiederholte Verstöße.** Ein einzelnes versehentliches Downtime-Ereignis führt zu einer geringfügigen Strafe, während wiederholte Verstöße exponentiell steigende Konsequenzen auslösen.

---

## PQC-Schlüsselregistrierung

Validatoren können optional einen **öffentlichen Post-Quanten-Kryptografie-Schlüssel (PQC)** mit dem ML-DSA-87-Algorithmus registrieren. Dies bietet quantenresistente Sicherheit für die Validator-Identität und kann für die hybride Signierung verwendet werden.

```bash
qorechaind tx pqc register-key <pubkey-hex> hybrid \
  --from mykey \
  --gas auto \
  -y
```

| Parameter      | Beschreibung                                      |
| -------------- | ------------------------------------------------- |
| `<pubkey-hex>` | 2592-Byte-ML-DSA-87-öffentlicher Schlüssel in Hex-Kodierung |
| `hybrid`       | Registrierungsmodus (hybrid = klassisch + PQC)    |

Registrierung verifizieren:

```bash
qorechaind query pqc key <account-address>
```

:::tip
**Empfehlung:** Die PQC-Schlüsselregistrierung ist optional, wird aber für Validatoren, die auf dem Mainnet betrieben werden, dringend empfohlen. Sie bietet eine zukunftsorientierte Verteidigung gegen Bedrohungen durch Quantencomputing.
:::

---

## Überwachung

### Prometheus-Metriken

QoreChain stellt Prometheus-Metriken auf Port **26660** bereit:

```
http://localhost:26660/metrics
```

Wichtige zu überwachende Metriken:

| Metrik                          | Beschreibung                                    |
| ------------------------------- | ----------------------------------------------- |
| `qorechain_missed_blocks_total` | Gesamtzahl der von Ihrem Validator verpassten Blöcke |
| `qorechain_validator_uptime`    | Verfügbarkeitsprozentsatz über die letzten N Blöcke |
| `qorechain_reputation_score`    | Aktueller Reputationswert                        |
| `qorechain_pool_classification` | Aktuelle Pool-Zuweisung (0=PoS, 1=DPoS, 2=RPoS) |
| `qorechain_consecutive_signed`  | Aufeinanderfolgend signierte Blöcke             |
| `consensus_height`              | Aktuelle Blockhöhe                              |
| `consensus_rounds`              | Konsensrunden für die aktuelle Höhe            |

### Reputationswert abfragen

```bash
qorechaind query reputation score $(qorechaind keys show mykey --bech val -a)
```

Via JSON-RPC:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getReputationScore",
    "params": ["qorvaloper1..."],
    "id": 1
  }'
```

### Zustandsprüfungen

```bash
# Node status
qorechaind status | jq '.sync_info'

# Validator signing info (uptime, missed blocks)
qorechaind query slashing signing-info $(qorechaind comet show-validator)

# Check if your validator is in the active set
qorechaind query staking validators --status bonded | grep "my-validator"
```

---

## Bewährte Betriebspraktiken

1. **Verwenden Sie eine Sentry-Node-Architektur.** Betreiben Sie Ihren Validator hinter Sentry-Nodes, um ihn vor DDoS-Angriffen zu schützen. Exponieren Sie nur Sentry-Nodes zum öffentlichen Netzwerk.

2. **Richten Sie Alarmierung ein.** Konfigurieren Sie Alarme für verpasste Blöcke, niedrige Verfügbarkeit und unerwartete Neustarts. Einige verpasste Blöcke sind normal; anhaltende Ausfälle lösen Slashing aus.

3. **Halten Sie eine hohe Verfügbarkeit aufrecht.** Das Reputationssystem belohnt konsistente Verfügbarkeit. Längere Ausfallzeiten verschlechtern Ihren Reputations-Qualitätsfaktor und reduzieren die Belohnungen.

4. **Halten Sie die Software aktuell.** Verfolgen Sie QoreChain-Releases und wenden Sie Updates zeitnah an. Koordinieren Sie sich mit der Validator-Community für Chain-Upgrades.

5. **Sichern Sie Ihre Schlüssel.** Verwenden Sie ein Hardware-Sicherheitsmodul (HSM) oder einen Remote-Signer für den Validator-Konsensschlüssel. Speichern Sie Schlüssel niemals auf derselben Maschine wie den Node.

6. **Registrieren Sie einen PQC-Schlüssel.** Machen Sie Ihren Validator zukunftssicher gegen Quantenbedrohungen, indem Sie einen ML-DSA-87-Schlüssel registrieren.

7. **Überwachen Sie Ihren Pool.** Verfolgen Sie Ihre Pool-Klassifikation alle 1.000 Blöcke. Eine Verbesserung Ihrer Reputation kann Sie von PoS zu RPoS bewegen und Ihre Block-Vorschlagsmöglichkeiten erheblich steigern.

---

## Referenz der Validator-Befehle

```bash
# Edit validator metadata
qorechaind tx staking edit-validator \
  --moniker "new-name" \
  --website "https://myvalidator.com" \
  --details "Description of my validator" \
  --from mykey -y

# Unjail after downtime slashing
qorechaind tx slashing unjail --from mykey -y

# Delegate additional stake
qorechaind tx staking delegate $(qorechaind keys show mykey --bech val -a) \
  500000000uqor --from mykey -y

# Withdraw rewards
qorechaind tx distribution withdraw-rewards $(qorechaind keys show mykey --bech val -a) \
  --commission --from mykey -y
```

---

## Nächste Schritte

* [Aus dem Quellcode bauen](/developer-guide/building-from-source) — Das `qorechaind`-Binary bauen
* [EVM-Entwicklung](/developer-guide/evm-development) — Smart Contracts auf QoreChain bereitstellen
* [Account Abstraction](/developer-guide/account-abstraction) — Programmierbare Konten für Ihre Validator-Operationen
