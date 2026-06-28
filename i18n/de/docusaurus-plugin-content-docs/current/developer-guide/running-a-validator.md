---
slug: /developer-guide/running-a-validator
title: Betrieb eines Validators
sidebar_label: Betrieb eines Validators
sidebar_position: 9
---

# Betrieb eines Validators

Diese Anleitung beschreibt, wie Sie einen Validator im QoreChain-Netzwerk erstellen, das Pool-Klassifizierungssystem verstehen, einen PQC-Schlüssel für quantenresistente Sicherheit registrieren und Ihren Node überwachen.

:::note
Diese Anleitung richtet sich an das **`qorechain-vladi`**-Mainnet (EVM-Chain-ID **9801**), das seit dem 7. Juni 2026 mit der Chain-Version **v3.1.80** läuft. Für das Einüben Ihrer Einrichtung vor dem Live-Gang wird das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**) empfohlen. Ersetzen Sie die `--chain-id` durch den passenden Wert für Ihr Zielnetzwerk.
:::

---

## Voraussetzungen

* Ein vollständig synchronisierter `qorechaind`-Node (siehe [Mit dem Testnet verbinden](/getting-started/connecting-to-testnet))
* Ein Konto mit Guthaben von mindestens **1.000 QOR** (1.000.000.000 uqor) für die anfängliche Selbst-Delegation
* Vertrautheit mit dem Modell für [Staking und Delegation](/user-guide/staking-and-delegation)

---

## Erstellen eines Validators

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

| Parameter                      | Beschreibung                                        |
| ------------------------------ | -------------------------------------------------- |
| `--amount`                     | Betrag der Selbst-Delegation (Mindest-Stake)       |
| `--pubkey`                     | Öffentlicher Konsens-Schlüssel des Validators (ed25519) |
| `--moniker`                    | Menschenlesbarer Name für Ihren Validator          |
| `--commission-rate`            | Anfänglicher Provisionssatz (z. B. 0.10 = 10 %)    |
| `--commission-max-rate`        | Maximaler Provisionssatz (nach Erstellung unveränderlich) |
| `--commission-max-change-rate` | Maximale tägliche Änderungsrate der Provision      |
| `--min-self-delegation`        | Mindestanzahl an Tokens, die der Betreiber selbst delegieren muss |

Überprüfen Sie nach Bestätigung der Transaktion Ihren Validator:

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## Pool-Klassifizierung

QoreChain verwendet ein **Drei-Pool-Klassifizierungssystem**, das vom Modul `x/qca` (Quantum Consensus Allocation) verwaltet wird. Alle **1.000 Blöcke** werden die Validatoren anhand ihrer Reputation und ihres Stakes in einen von drei Pools neu eingeordnet:

| Pool                                 | Kriterien                                          | Block-Zuteilung |
| ------------------------------------ | ------------------------------------------------- | ---------------- |
| **RPoS** (Reputation Proof-of-Stake) | Reputation >= 70. Perzentil UND Stake >= Median   | 40 % der Blöcke  |
| **DPoS** (Delegated Proof-of-Stake)  | Gesamtdelegation >= 10.000 QOR                     | 35 % der Blöcke  |
| **PoS** (Proof-of-Stake)             | Alle übrigen aktiven Validatoren                   | 25 % der Blöcke  |

Innerhalb jedes Pools werden die Block-Proposer mittels **gewichteter Zufallsauswahl** proportional zu ihrem effektiven Stake ausgewählt. Die Klassifizierung stellt sicher, dass sowohl Validatoren mit hoher Reputation als auch solche mit hoher Delegation fair vertreten sind, während kleinere Validatoren weiterhin teilnehmen können.

### Abfrage Ihrer Pool-Klassifizierung

```bash
qorechaind query qca pool-classification $(qorechaind keys show mykey --bech val -a)
```

Über JSON-RPC:

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

Die Staking-Belohnung für einen Validator wird durch eine Bonding-Kurve bestimmt, die mehrere Faktoren berücksichtigt:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Variable | Beschreibung                                               |
| -------- | ---------------------------------------------------------- |
| `R`      | Belohnungsbetrag                                           |
| `beta`   | Basis-Belohnungssatz                                       |
| `S`      | Effektiver Stake                                           |
| `alpha`  | Skalierungskonstante für Loyalität                         |
| `L`      | Loyalitätsdauer (kontinuierliche Staking-Zeit)            |
| `Q(r)`   | Reputations-Qualitätsfaktor, Bereich \[0.75 - 1.25]        |
| `P(t)`   | Protokollphasen-Multiplikator (passt sich über den Netzwerk-Lebenszyklus an) |

**Wichtige Erkenntnisse:**

* **Bonus für Loyalitätsdauer:** Validatoren, die kontinuierlich staken, erhalten durch den logarithmischen Loyalitätsterm steigende Belohnungen. Dies fördert langfristiges Engagement.
* **Reputations-Qualitätsfaktor:** Reicht von 0,75 (schlechte Reputation) bis 1,25 (ausgezeichnete Reputation). Die Reputation wird aus Verfügbarkeit, erfolgreichen Proposals, Community-Beteiligung und der Qualität der Transaktionsvalidierung berechnet.
* **Protokollphasen-Multiplikator:** Passt sich an, während das Netzwerk verschiedene Phasen durchläuft (Bootstrap, Wachstum, Reife).

---

## Progressives Slashing

QoreChain verwendet ein **progressives Slashing**-Modell, das Strafen für Wiederholungstäter eskaliert, Validatoren aber gleichzeitig erlaubt, sich mit der Zeit zu erholen:

```
penalty = base_rate * escalation^effective_count * severity
```

| Parameter                    | Wert           |
| ---------------------------- | -------------- |
| Maximale Strafe pro Ereignis | 33 % des Stakes |
| Zerfalls-Halbwertszeit       | 100.000 Blöcke |
| Schweregrad bei Ausfallzeit  | 1.0            |
| Schweregrad bei Doppelsignatur | 2.0          |
| Schweregrad bei Light-Client-Angriff | 3.0    |

1. **Jedes Vergehen erhöht den effektiven Zählerstand.** Jedes Vergehen (Ausfallzeit, Doppelsignatur usw.) erhöht den effektiven Zählerstand des Validators, was sich auf zukünftige Strafen auswirkt.

2. **Die Strafe eskaliert exponentiell.** Die Strafe eskaliert anhand des effektiven Zählerstands gemäß der obigen Formel, sodass Wiederholungstäter deutlich höheren Strafen ausgesetzt sind.

3. **Der effektive Zählerstand zerfällt mit der Zeit.** Der effektive Zählerstand zerfällt mit einer Halbwertszeit von 100.000 Blöcken (\~7 Tage bei 6s-Blöcken), wodurch sich Validatoren nach einer Phase guten Verhaltens erholen können.

4. **Einzelereignisse vs. wiederholte Vergehen.** Ein einzelnes versehentliches Ausfallzeit-Ereignis führt zu einer geringen Strafe, während wiederholte Vergehen exponentiell steigende Konsequenzen auslösen.

---

## PQC-Schlüsselregistrierung

Validatoren können optional einen **post-quanten-kryptografischen (PQC) öffentlichen Schlüssel** mit dem ML-DSA-87-Algorithmus registrieren. Dies bietet quantenresistente Sicherheit für die Validator-Identität und kann für hybride Signaturen verwendet werden.

```bash
qorechaind tx pqc register-key <pubkey-hex> hybrid \
  --from mykey \
  --gas auto \
  -y
```

| Parameter      | Beschreibung                                      |
| -------------- | ------------------------------------------------- |
| `<pubkey-hex>` | 2592-Byte-ML-DSA-87-Public-Key in Hex-Kodierung   |
| `hybrid`       | Registrierungsmodus (hybrid = sowohl klassisch + PQC) |

Registrierung überprüfen:

```bash
qorechaind query pqc key <account-address>
```

:::tip
**Empfehlung:** Die PQC-Schlüsselregistrierung ist optional, wird aber für Validatoren, die im Mainnet betrieben werden, dringend empfohlen. Sie bietet eine zukunftsorientierte Verteidigung gegen Bedrohungen durch Quantencomputer.
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
| `qorechain_validator_uptime`    | Verfügbarkeit in Prozent über die letzten N Blöcke |
| `qorechain_reputation_score`    | Aktueller Reputationswert                       |
| `qorechain_pool_classification` | Aktuelle Pool-Zuordnung (0=PoS, 1=DPoS, 2=RPoS) |
| `qorechain_consecutive_signed`  | Aufeinanderfolgend signierte Blöcke             |
| `consensus_height`              | Aktuelle Blockhöhe                              |
| `consensus_rounds`              | Konsensrunden für die aktuelle Höhe            |

### Abfrage des Reputationswerts

```bash
qorechaind query reputation score $(qorechaind keys show mykey --bech val -a)
```

Über JSON-RPC:

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

1. **Verwenden Sie eine Sentry-Node-Architektur.** Betreiben Sie Ihren Validator hinter Sentry-Nodes, um ihn vor DDoS-Angriffen zu schützen. Geben Sie nur Sentry-Nodes für das öffentliche Netzwerk frei.

2. **Richten Sie Benachrichtigungen ein.** Konfigurieren Sie Alarme für verpasste Blöcke, geringe Verfügbarkeit und unerwartete Neustarts. Einige verpasste Blöcke sind normal; anhaltende Ausfälle lösen Slashing aus.

3. **Halten Sie eine hohe Verfügbarkeit aufrecht.** Das Reputationssystem belohnt konstante Verfügbarkeit. Längere Ausfallzeiten verschlechtern Ihren Reputations-Qualitätsfaktor und verringern die Belohnungen.

4. **Halten Sie die Software aktuell.** Verfolgen Sie QoreChain-Releases und wenden Sie Updates zeitnah an. Stimmen Sie sich für Chain-Upgrades mit der Validator-Community ab.

5. **Sichern Sie Ihre Schlüssel.** Verwenden Sie ein Hardware-Sicherheitsmodul (HSM) oder einen Remote-Signer für den Konsens-Schlüssel des Validators. Speichern Sie Schlüssel niemals auf demselben Rechner wie den Node.

6. **Registrieren Sie einen PQC-Schlüssel.** Machen Sie Ihren Validator zukunftssicher gegen Quantenbedrohungen, indem Sie einen ML-DSA-87-Schlüssel registrieren.

7. **Überwachen Sie Ihren Pool.** Verfolgen Sie Ihre Pool-Klassifizierung alle 1.000 Blöcke. Die Verbesserung Ihrer Reputation kann Sie von PoS zu RPoS bewegen und Ihre Möglichkeiten zum Vorschlagen von Blöcken erheblich erhöhen.

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

## Validierung verbundener Netzwerke {#connected-networks}

Ab der Chain-Version **v3.1.80** kann ein QoreChain-Validator auch bei der Validierung der über die [Bridge](/architecture/bridge-architecture) verbundenen Netzwerke mitwirken. Dies ist **lizenzgesteuert und Opt-in**:

1. **Halten Sie die Lizenz.** Der Validator muss eine aktive `validator_<chain>`- (oder `qcb_bridge`-)Lizenz für das Zielnetzwerk besitzen. Der Orchestrator weigert sich, ohne diese einen externen Client zu starten (fail-closed).
2. **Die Aktivierung stellt den Client automatisch bereit.** Wenn die Lizenz aktiviert wird, stellt QoreChain den Client des passenden Netzwerks auf Ihrem Node bereit — es lädt den gepinnten Client herunter, rendert dessen Konfiguration und betreibt ihn unter der Orchestrierung von QoreChain. Bis zur Aktivierung wird nichts heruntergeladen.
3. **Stellen Sie die Schlüssel und den Stake des Netzwerks bereit.** Der Validator/Stake und die Signierschlüssel des externen Netzwerks sind pro Netzwerk **vom Betreiber bereitzustellen**; QoreChain liefert das Treiber-Framework und das erzwungene Lizenz-Gate, nicht Ihren Stake auf der externen Chain.

Treiber existieren für alle **37 Bridge-Netzwerke**, klassifiziert danach, wie ein Validator teilnehmen kann:

| Klasse | Teilnahme | Beispiele |
| ----- | ------------- | -------- |
| Erlaubnisfreier Validator | Staken und betreiben | Solana, Ethereum, Avalanche, Sui, Aptos, Cardano, Tezos, Algorand, Starknet |
| Begrenzt / gewählt / Zulassung | Staken, vorbehaltlich einer Obergrenze oder Wahl | BSC, Polygon, Polkadot, TRON, Sei, Injective, NEAR, Hedera |
| L2-Full-Node | Einen Full Node betreiben (kein Staking) | Optimism, Base, zkSync Era, Linea, Scroll, Arbitrum |
| Ohne Staking / Trust-List | Beobachten / ohne Staking teilnehmen | Bitcoin, Filecoin, XRPL, Stellar |

:::note
Die Pins der Client-Versionen sind Best-Effort; überprüfen Sie das Upstream-Client-Release für Ihr Zielnetzwerk vor einer Produktivaktivierung.
:::

## Nächste Schritte

* [Aus dem Quellcode bauen](/developer-guide/building-from-source) — Erstellen Sie das `qorechaind`-Binary
* [EVM-Entwicklung](/developer-guide/evm-development) — Deployen Sie Smart Contracts auf QoreChain
* [Account Abstraction](/developer-guide/account-abstraction) — Programmierbare Konten für Ihre Validator-Operationen
