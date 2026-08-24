---
slug: /developer-guide/running-a-validator
title: Validator betreiben
sidebar_label: Validator betreiben
sidebar_position: 9
---

# Validator betreiben

Dieser Leitfaden erklärt, wie man einen Validator im QoreChain-Netzwerk erstellt, das Pool-Klassifizierungssystem versteht, einen PQC-Schlüssel für quantenresistente Sicherheit registriert und den eigenen Node überwacht.

:::note
Dieser Leitfaden bezieht sich auf das **`qorechain-vladi`**-Mainnet (EVM-Chain-ID **9801**), das seit dem 7. Juni 2026 mit der Chain-Version **v3.1.92** läuft. Das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**) wird empfohlen, um das eigene Setup zu proben, bevor man live geht. Setzen Sie die passende `--chain-id` für Ihr Zielnetzwerk ein.
:::

---

## Voraussetzungen

* Ein vollständig synchronisierter `qorechaind`-Node (siehe [Mit dem Testnet verbinden](/getting-started/connecting-to-testnet))
* Ein finanziertes Konto mit mindestens **1.000 QOR** (1.000.000.000 uqor) für die anfängliche Self-Delegation
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

| Parameter                      | Beschreibung                                              |
| ------------------------------ | ----------------------------------------------------------|
| `--amount`                     | Self-Delegation-Betrag (Mindest-Stake)                    |
| `--pubkey`                     | Konsens-Public-Key des Validators (ed25519)                |
| `--moniker`                    | Menschenlesbarer Name für Ihren Validator                  |
| `--commission-rate`            | Anfängliche Provisionsrate (z. B. 0,10 = 10 %)             |
| `--commission-max-rate`        | Maximale Provisionsrate (nach Erstellung unveränderlich)   |
| `--commission-max-change-rate` | Maximale tägliche Änderungsrate der Provision              |
| `--min-self-delegation`        | Mindestanzahl an Token, die der Betreiber selbst delegieren muss |

Prüfen Sie nach Bestätigung der Transaktion Ihren Validator:

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## Pool-Klassifizierung

QoreChain verwendet ein **dreistufiges Pool-Klassifizierungssystem**, das vom Modul `x/qca` (Quantum Consensus Allocation) verwaltet wird. Alle **1.000 Blöcke** werden Validatoren anhand ihrer Reputation und ihres Stakes in einen von drei Pools neu eingeteilt:

| Pool                                  | Kriterien                                                | Block-Zuteilung |
| -------------------------------------- | --------------------------------------------------------- | ---------------- |
| **RPoS** (Reputation Proof-of-Stake)   | Reputation >= 70. Perzentil UND Stake >= Median            | 40 % der Blöcke   |
| **DPoS** (Delegated Proof-of-Stake)    | Gesamtdelegation >= 10.000 QOR                             | 35 % der Blöcke   |
| **PoS** (Proof-of-Stake)               | Alle übrigen aktiven Validatoren                           | 25 % der Blöcke   |

Innerhalb jedes Pools werden Blockvorschläger mittels **gewichteter Zufallsauswahl** proportional zu ihrem effektiven Stake ausgewählt. Die Klassifizierung stellt sicher, dass sowohl Validatoren mit hoher Reputation als auch solche mit hoher Delegation fair repräsentiert werden, während kleinere Validatoren weiterhin teilnehmen können.

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

| Variable | Beschreibung                                                       |
| -------- | -------------------------------------------------------------------|
| `R`      | Belohnungsbetrag                                                    |
| `beta`   | Basis-Belohnungsrate                                                |
| `S`      | Effektiver Stake                                                    |
| `alpha`  | Skalierungskonstante für Loyalität                                  |
| `L`      | Loyalitätsdauer (kontinuierliche Staking-Zeit)                      |
| `Q(r)`   | Reputations-Qualitätsfaktor, Bereich \[0,75 - 1,25]                  |
| `P(t)`   | Protokollphasen-Multiplikator (passt sich über den Netzwerklebenszyklus an) |

**Wichtige Erkenntnisse:**

* **Loyalitätsdauer-Bonus:** Validatoren, die kontinuierlich staken, erhalten über den logarithmischen Loyalitätsterm steigende Belohnungen. Dies fördert langfristiges Engagement.
* **Reputations-Qualitätsfaktor:** Reicht von 0,75 (schlechte Reputation) bis 1,25 (exzellente Reputation). Die Reputation wird aus Uptime, erfolgreichen Vorschlägen, Community-Beteiligung und der Qualität der Transaktionsvalidierung berechnet.
* **Protokollphasen-Multiplikator:** Passt sich an, während das Netzwerk verschiedene Phasen durchläuft (Bootstrap, Wachstum, Reife).

---

## Progressives Slashing

QoreChain verwendet ein **progressives Slashing**-Modell, das Strafen für wiederholte Verstöße eskaliert, Validatoren aber zugleich erlaubt, sich mit der Zeit zu erholen:

```
penalty = base_rate * escalation^effective_count * severity
```

| Parameter                        | Wert            |
| --------------------------------- | ---------------- |
| Maximale Strafe pro Ereignis       | 33 % des Stakes   |
| Halbwertszeit des Verfalls         | 100.000 Blöcke    |
| Schweregrad Downtime               | 1,0               |
| Schweregrad Double-Sign            | 2,0               |
| Schweregrad Light-Client-Angriff   | 3,0               |

1. **Jeder Verstoß erhöht den effektiven Zähler.** Jeder Verstoß (Downtime, Double-Signing usw.) erhöht den effektiven Zähler des Validators, der sich auf zukünftige Strafen auswirkt.

2. **Die Strafe eskaliert exponentiell.** Die Strafe eskaliert anhand des effektiven Zählers gemäß der obigen Formel, sodass Wiederholungstäter deutlich höhere Strafen erhalten.

3. **Der effektive Zähler verfällt mit der Zeit.** Der effektive Zähler verfällt mit einer Halbwertszeit von 100.000 Blöcken (~7 Tage bei 6-Sekunden-Blöcken), sodass sich Validatoren nach einer Phase guten Verhaltens erholen können.

4. **Einzelereignisse vs. wiederholte Verstöße.** Ein einzelnes versehentliches Downtime-Ereignis führt zu einer geringen Strafe, während wiederholte Verstöße exponentiell steigende Konsequenzen auslösen.

---

## PQC-Schlüsselregistrierung {#pqc-key-registration}

Validatoren können optional einen **post-quantenkryptografischen (PQC) Public Key** mit dem Algorithmus ML-DSA-87 registrieren. Dies bietet quantenresistente Sicherheit für die Validator-Identität und kann für hybrides Signieren verwendet werden.

```bash
qorechaind tx pqc register-key <pubkey-hex> hybrid \
  --from mykey \
  --gas auto \
  -y
```

| Parameter      | Beschreibung                                                |
| -------------- | -------------------------------------------------------------|
| `<pubkey-hex>` | 2592-Byte-ML-DSA-87-Public-Key in Hex-Kodierung               |
| `hybrid`       | Registrierungsmodus (hybrid = sowohl klassisch als auch PQC)  |

Registrierung überprüfen:

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

| Metrik                           | Beschreibung                                             |
| ---------------------------------- | ----------------------------------------------------------|
| `qorechain_missed_blocks_total`    | Gesamtzahl der von Ihrem Validator verpassten Blöcke        |
| `qorechain_validator_uptime`       | Uptime-Prozentsatz über die letzten N Blöcke                |
| `qorechain_reputation_score`       | Aktueller Reputationswert                                   |
| `qorechain_pool_classification`    | Aktuelle Pool-Zuordnung (0=PoS, 1=DPoS, 2=RPoS)              |
| `qorechain_consecutive_signed`     | Aufeinanderfolgend signierte Blöcke                          |
| `consensus_height`                 | Aktuelle Blockhöhe                                           |
| `consensus_rounds`                 | Konsensrunden für die aktuelle Höhe                          |

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
# Node-Status
qorechaind status | jq '.sync_info'

# Signierinformationen des Validators (Uptime, verpasste Blöcke)
qorechaind query slashing signing-info $(qorechaind comet show-validator)

# Prüfen, ob Ihr Validator im aktiven Set ist
qorechaind query staking validators --status bonded | grep "my-validator"
```

---

## Best Practices für den Betrieb

1. **Eine Sentry-Node-Architektur verwenden.** Betreiben Sie Ihren Validator hinter Sentry-Nodes, um ihn vor DDoS-Angriffen zu schützen. Setzen Sie nur die Sentry-Nodes dem öffentlichen Netzwerk aus.

2. **Alerting einrichten.** Konfigurieren Sie Benachrichtigungen für verpasste Blöcke, niedrige Uptime und unerwartete Neustarts. Ein paar verpasste Blöcke sind normal; anhaltende Ausfälle lösen Slashing aus.

3. **Hohe Uptime aufrechterhalten.** Das Reputationssystem belohnt konsistente Uptime. Längere Ausfallzeiten verschlechtern Ihren Reputations-Qualitätsfaktor und verringern die Belohnungen.

4. **Software aktuell halten.** Verfolgen Sie QoreChain-Releases und spielen Sie Updates zeitnah ein. Stimmen Sie sich für Chain-Upgrades mit der Validator-Community ab.

5. **Ihre Schlüssel sichern.** Verwenden Sie ein Hardware-Sicherheitsmodul (HSM) oder einen Remote-Signer für den Konsensschlüssel des Validators. Bewahren Sie Schlüssel niemals auf derselben Maschine wie den Node auf.

6. **Einen PQC-Schlüssel registrieren.** Machen Sie Ihren Validator durch die Registrierung eines ML-DSA-87-Schlüssels zukunftssicher gegen Quantenbedrohungen.

7. **Ihren Pool überwachen.** Verfolgen Sie Ihre Pool-Klassifizierung alle 1.000 Blöcke. Eine Verbesserung Ihrer Reputation kann Sie von PoS zu RPoS verschieben und Ihre Blockvorschlagsmöglichkeiten erheblich erhöhen.

---

## Referenz: Validator-Befehle

```bash
# Validator-Metadaten bearbeiten
qorechaind tx staking edit-validator \
  --moniker "new-name" \
  --website "https://myvalidator.com" \
  --details "Description of my validator" \
  --from mykey -y

# Nach Downtime-Slashing entsperren (unjail)
qorechaind tx slashing unjail --from mykey -y

# Zusätzlichen Stake delegieren
qorechaind tx staking delegate $(qorechaind keys show mykey --bech val -a) \
  500000000uqor --from mykey -y

# Belohnungen auszahlen
qorechaind tx distribution withdraw-rewards $(qorechaind keys show mykey --bech val -a) \
  --commission --from mykey -y
```

---

## Verbundene Netzwerke validieren {#connected-networks}

Ab Chain-Version **v3.1.80** kann ein QoreChain-Validator auch dabei helfen, die über die [Bridge](/architecture/bridge-architecture) verbundenen Netzwerke zu validieren. Dies ist **lizenzgebunden und optional**:

1. **Die Lizenz besitzen.** Der Validator muss eine aktive Lizenz `validator_<chain>` (oder `qcb_bridge`) für das Zielnetzwerk besitzen. Der Orchestrator verweigert den Start eines externen Clients ohne diese Lizenz (fail-closed).
2. **Die Aktivierung stellt den Client automatisch bereit.** Sobald die Lizenz aktiviert ist, stellt QoreChain den passenden Client des jeweiligen Netzwerks auf Ihrem Node bereit — lädt den festgelegten Client herunter, erzeugt dessen Konfiguration und betreibt ihn unter der Orchestrierung von QoreChain. Vor der Aktivierung wird nichts heruntergeladen.
3. **Die Schlüssel und den Stake des Netzwerks selbst bereitstellen.** Die Validator-/Stake- und Signierschlüssel des externen Netzwerks werden **vom Betreiber selbst bereitgestellt**, pro Netzwerk; QoreChain liefert das Treiber-Framework und die erzwungene Lizenzsperre, nicht Ihren externen Chain-Stake.

Für alle **37 Bridge-Netzwerke** existieren Treiber, klassifiziert danach, wie ein Validator teilnehmen kann:

| Klasse | Teilnahme | Beispiele |
| ----- | ------------- | -------- |
| Permissionless Validator | Staken und betreiben | Solana, Ethereum, Avalanche, Sui, Aptos, Cardano, Tezos, Algorand, Starknet |
| Gedeckelt / gewählt / mit Zulassung | Staken, vorbehaltlich einer Obergrenze oder Wahl | BSC, Polygon, Polkadot, TRON, Sei, Injective, NEAR, Hedera |
| L2-Full-Node | Einen Full-Node betreiben (kein Staking) | Optimism, Base, zkSync Era, Linea, Scroll, Arbitrum |
| Nicht-staking / Trust-Liste | Beobachten / teilnehmen ohne Staking | Bitcoin, Filecoin, XRPL, Stellar |

:::note
Die Client-Versionsfestlegungen erfolgen nach bestem Wissen; überprüfen Sie vor einer Produktivaktivierung das Upstream-Client-Release für Ihr Zielnetzwerk.
:::

## Nächste Schritte

* [Aus dem Quellcode erstellen](/developer-guide/building-from-source) — Das `qorechaind`-Binary erstellen
* [EVM-Entwicklung](/developer-guide/evm-development) — Smart Contracts auf QoreChain bereitstellen
* [Account Abstraction](/developer-guide/account-abstraction) — Programmierbare Accounts für Ihre Validator-Operationen
