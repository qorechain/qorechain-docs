---
slug: /developer-guide/running-a-validator
title: Betrieb eines Validators
sidebar_label: Betrieb eines Validators
sidebar_position: 9
---

# Betrieb eines Validators

Diese Anleitung beschreibt, wie Sie einen Validator im QoreChain-Netzwerk erstellen, das Pool-Klassifizierungssystem verstehen, einen PQC-Schlüssel für quantenresistente Sicherheit registrieren und Ihren Node überwachen.

:::note
Diese Anleitung bezieht sich auf das **`qorechain-vladi`**-Mainnet (EVM-Chain-ID **9801**), das seit dem 7. Juni 2026 live ist und die Chain-Version **v3.1.82** ausführt. Das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**) wird empfohlen, um Ihr Setup zu proben, bevor Sie live gehen. Ersetzen Sie die `--chain-id` entsprechend Ihrem Zielnetzwerk.
:::

---

## Voraussetzungen

* Ein vollständig synchronisierter `qorechaind`-Node (siehe [Verbindung zum Testnet](/getting-started/connecting-to-testnet))
* Ein Konto mit einem Guthaben von mindestens **1.000 QOR** (1,000,000,000 uqor) für die anfängliche Selbstdelegation
* Vertrautheit mit dem Modell für [Staking und Delegation](/user-guide/staking-and-delegation)

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

| Parameter                      | Beschreibung                                                     |
| ------------------------------ | ---------------------------------------------------------------- |
| `--amount`                     | Selbstdelegationsbetrag (Mindest-Stake)                           |
| `--pubkey`                     | Öffentlicher Konsensschlüssel des Validators (ed25519)            |
| `--moniker`                    | Für Menschen lesbarer Name Ihres Validators                       |
| `--commission-rate`            | Anfänglicher Provisionssatz (z. B. 0.10 = 10 %)                   |
| `--commission-max-rate`        | Maximaler Provisionssatz (nach der Erstellung unveränderlich)     |
| `--commission-max-change-rate` | Maximale tägliche Änderungsrate der Provision                     |
| `--min-self-delegation`        | Mindestanzahl an Token, die der Betreiber selbst delegieren muss  |

Nachdem die Transaktion bestätigt wurde, verifizieren Sie Ihren Validator:

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## Pool-Klassifizierung

QoreChain verwendet ein **Drei-Pool-Klassifizierungssystem**, das vom Modul `x/qca` (Quantum Consensus Allocation) verwaltet wird. Alle **1.000 Blöcke** werden Validatoren basierend auf ihrer Reputation und ihrem Stake in einen von drei Pools neu klassifiziert:

| Pool                                 | Kriterien                                          | Block-Zuteilung  |
| ------------------------------------ | -------------------------------------------------- | ---------------- |
| **RPoS** (Reputation Proof-of-Stake) | Reputation >= 70. Perzentil UND Stake >= Median    | 40 % der Blöcke  |
| **DPoS** (Delegated Proof-of-Stake)  | Gesamtdelegation >= 10,000 QOR                     | 35 % der Blöcke  |
| **PoS** (Proof-of-Stake)             | Alle übrigen aktiven Validatoren                   | 25 % der Blöcke  |

Innerhalb jedes Pools werden Block-Proposer per **gewichteter Zufallsauswahl** proportional zu ihrem effektiven Stake ausgewählt. Die Klassifizierung stellt sicher, dass sowohl Validatoren mit hoher Reputation als auch solche mit hoher Delegation fair repräsentiert werden, während kleinere Validatoren weiterhin teilnehmen können.

### Ihre Pool-Klassifizierung abfragen

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

Die Staking-Belohnung eines Validators wird durch eine Bonding-Kurve bestimmt, die mehrere Faktoren einbezieht:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Variable | Beschreibung                                                              |
| -------- | -------------------------------------------------------------------------- |
| `R`      | Belohnungsbetrag                                                            |
| `beta`   | Basis-Belohnungsrate                                                        |
| `S`      | Effektiver Stake                                                            |
| `alpha`  | Skalierungskonstante für Loyalität                                          |
| `L`      | Loyalitätsdauer (kontinuierliche Staking-Zeit)                              |
| `Q(r)`   | Reputations-Qualitätsfaktor, Bereich \[0.75 - 1.25]                         |
| `P(t)`   | Protokollphasen-Multiplikator (passt sich über den Netzwerklebenszyklus an) |

**Wichtige Erkenntnisse:**

* **Bonus für Loyalitätsdauer:** Validatoren, die kontinuierlich staken, erhalten über den logarithmischen Loyalitätsterm steigende Belohnungen. Dies schafft Anreize für langfristiges Engagement.
* **Reputations-Qualitätsfaktor:** Reicht von 0.75 (schlechte Reputation) bis 1.25 (ausgezeichnete Reputation). Die Reputation wird aus Uptime, erfolgreichen Proposals, Community-Beteiligung und der Qualität der Transaktionsvalidierung berechnet.
* **Protokollphasen-Multiplikator:** Passt sich an, während das Netzwerk verschiedene Phasen durchläuft (Bootstrap, Wachstum, Reife).

---

## Progressives Slashing

QoreChain verwendet ein Modell des **progressiven Slashings**, das Strafen für Wiederholungstäter eskaliert, während es Validatoren erlaubt, sich mit der Zeit zu erholen:

```
penalty = base_rate * escalation^effective_count * severity
```

| Parameter                          | Wert            |
| ---------------------------------- | --------------- |
| Maximale Strafe pro Ereignis       | 33 % des Stakes |
| Halbwertszeit des Abklingens       | 100,000 Blöcke  |
| Schweregrad Downtime               | 1.0             |
| Schweregrad Double-Signing         | 2.0             |
| Schweregrad Light-Client-Angriff   | 3.0             |

1. **Jeder Verstoß erhöht den effektiven Zähler.** Jeder Verstoß (Downtime, Double-Signing usw.) erhöht den effektiven Zähler des Validators, was sich auf künftige Strafen auswirkt.

2. **Die Strafe eskaliert exponentiell.** Die Strafe eskaliert basierend auf dem effektiven Zähler gemäß der obigen Formel, sodass Wiederholungstäter deutlich höhere Strafen erhalten.

3. **Der effektive Zähler klingt mit der Zeit ab.** Der effektive Zähler klingt mit einer Halbwertszeit von 100,000 Blöcken ab (\~7 Tage bei 6-Sekunden-Blöcken), sodass sich Validatoren nach einer Phase guten Verhaltens erholen können.

4. **Einzelereignisse vs. wiederholte Verstöße.** Ein einzelnes versehentliches Downtime-Ereignis führt zu einer geringen Strafe, während wiederholte Verstöße exponentiell steigende Konsequenzen nach sich ziehen.

---

## PQC-Schlüsselregistrierung

Validatoren können optional einen **öffentlichen Post-Quanten-Kryptografie-Schlüssel (PQC)** mit dem Algorithmus ML-DSA-87 registrieren. Dies bietet quantenresistente Sicherheit für die Validator-Identität und kann für hybrides Signieren verwendet werden.

```bash
qorechaind tx pqc register-key <pubkey-hex> hybrid \
  --from mykey \
  --gas auto \
  -y
```

| Parameter      | Beschreibung                                                     |
| -------------- | ----------------------------------------------------------------- |
| `<pubkey-hex>` | Öffentlicher ML-DSA-87-Schlüssel mit 2592 Byte in Hex-Kodierung   |
| `hybrid`       | Registrierungsmodus (hybrid = klassisch + PQC)                    |

Registrierung verifizieren:

```bash
qorechaind query pqc key <account-address>
```

:::tip
**Empfehlung:** Die PQC-Schlüsselregistrierung ist optional, wird aber für Validatoren im Mainnet dringend empfohlen. Sie bietet eine zukunftsgerichtete Verteidigung gegen Bedrohungen durch Quantencomputer.
:::

---

## Monitoring

### Prometheus-Metriken

QoreChain stellt Prometheus-Metriken auf Port **26660** bereit:

```
http://localhost:26660/metrics
```

Wichtige zu überwachende Metriken:

| Metrik                          | Beschreibung                                          |
| ------------------------------- | ------------------------------------------------------ |
| `qorechain_missed_blocks_total` | Gesamtzahl der von Ihrem Validator verpassten Blöcke   |
| `qorechain_validator_uptime`    | Uptime-Prozentsatz über die letzten N Blöcke           |
| `qorechain_reputation_score`    | Aktueller Reputationswert                              |
| `qorechain_pool_classification` | Aktuelle Pool-Zuordnung (0=PoS, 1=DPoS, 2=RPoS)        |
| `qorechain_consecutive_signed`  | Aufeinanderfolgend signierte Blöcke                    |
| `consensus_height`              | Aktuelle Blockhöhe                                     |
| `consensus_rounds`              | Konsensrunden für die aktuelle Höhe                    |

### Reputationswert abfragen

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

### Health-Checks

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

1. **Verwenden Sie eine Sentry-Node-Architektur.** Betreiben Sie Ihren Validator hinter Sentry-Nodes, um ihn vor DDoS-Angriffen zu schützen. Machen Sie nur Sentry-Nodes im öffentlichen Netzwerk erreichbar.

2. **Richten Sie eine Alarmierung ein.** Konfigurieren Sie Alarme für verpasste Blöcke, niedrige Uptime und unerwartete Neustarts. Einige wenige verpasste Blöcke sind normal; anhaltende Ausfälle lösen Slashing aus.

3. **Halten Sie eine hohe Uptime.** Das Reputationssystem belohnt konstante Uptime. Längere Downtime verschlechtert Ihren Reputations-Qualitätsfaktor und reduziert die Belohnungen.

4. **Halten Sie die Software aktuell.** Verfolgen Sie QoreChain-Releases und spielen Sie Updates zeitnah ein. Koordinieren Sie sich bei Chain-Upgrades mit der Validator-Community.

5. **Sichern Sie Ihre Schlüssel.** Verwenden Sie ein Hardware-Sicherheitsmodul (HSM) oder einen Remote-Signer für den Konsensschlüssel des Validators. Speichern Sie Schlüssel niemals auf derselben Maschine wie den Node.

6. **Registrieren Sie einen PQC-Schlüssel.** Machen Sie Ihren Validator zukunftssicher gegen Quantenbedrohungen, indem Sie einen ML-DSA-87-Schlüssel registrieren.

7. **Überwachen Sie Ihren Pool.** Verfolgen Sie Ihre Pool-Klassifizierung alle 1.000 Blöcke. Eine Verbesserung Ihrer Reputation kann Sie von PoS zu RPoS aufsteigen lassen und Ihre Chancen auf Block-Proposals deutlich erhöhen.

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

Seit Chain-Version **v3.1.80** kann ein QoreChain-Validator auch bei der Validierung der über die [Bridge](/architecture/bridge-architecture) verbundenen Netzwerke mitwirken. Dies ist **lizenzgebunden und opt-in**:

1. **Lizenz besitzen.** Der Validator muss eine aktive `validator_<chain>`-Lizenz (oder `qcb_bridge`) für das Zielnetzwerk besitzen. Der Orchestrator weigert sich, einen externen Client ohne diese Lizenz zu starten (fail-closed).
2. **Die Aktivierung provisioniert den Client automatisch.** Wenn die Lizenz aktiviert wird, provisioniert QoreChain den Client des entsprechenden Netzwerks auf Ihrem Node — der gepinnte Client wird heruntergeladen, seine Konfiguration gerendert und er läuft unter der Orchestrierung von QoreChain. Vor der Aktivierung wird nichts abgerufen.
3. **Schlüssel und Stake des Netzwerks bereitstellen.** Validator-/Stake- und Signierschlüssel des externen Netzwerks werden pro Netzwerk **vom Betreiber bereitgestellt**; QoreChain liefert das Driver-Framework und die erzwungene Lizenzsperre, nicht Ihren Stake auf der externen Chain.

Driver existieren für alle **37 Bridge-Netzwerke**, klassifiziert danach, wie ein Validator teilnehmen kann:

| Klasse | Teilnahme | Beispiele |
| ------ | --------- | --------- |
| Permissionless-Validator | Staken und betreiben | Solana, Ethereum, Avalanche, Sui, Aptos, Cardano, Tezos, Algorand, Starknet |
| Begrenzt / gewählt / Zulassung | Staken, vorbehaltlich einer Obergrenze oder Wahl | BSC, Polygon, Polkadot, TRON, Sei, Injective, NEAR, Hedera |
| L2-Full-Node | Full Node betreiben (kein Staking) | Optimism, Base, zkSync Era, Linea, Scroll, Arbitrum |
| Ohne Staking / Trust-List | Beobachten / ohne Staking teilnehmen | Bitcoin, Filecoin, XRPL, Stellar |

:::note
Die gepinnten Client-Versionen sind Best-Effort; prüfen Sie vor einer Produktionsaktivierung das Upstream-Client-Release für Ihr Zielnetzwerk.
:::

## Nächste Schritte

* [Aus dem Quellcode bauen](/developer-guide/building-from-source) — Das `qorechaind`-Binary bauen
* [EVM-Entwicklung](/developer-guide/evm-development) — Smart Contracts auf QoreChain bereitstellen
* [Account Abstraction](/developer-guide/account-abstraction) — Programmierbare Konten für Ihren Validator-Betrieb
