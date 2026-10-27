---
slug: /developer-guide/running-a-validator
title: Validator betreiben
sidebar_label: Validator betreiben
sidebar_position: 9
---

# Validator betreiben

Dieser Leitfaden erklärt, wie man einen Validator im QoreChain-Netzwerk erstellt, das Design der Pool-Klassifizierung versteht, einen PQC-Schlüssel (hybride ML-DSA-87-Signaturen, FIPS 204) registriert und den eigenen Node überwacht.

:::note
Dieser Leitfaden bezieht sich auf das **`qorechain-vladi`**-Mainnet (EVM-Chain-ID **9801**), das seit dem 7. Juni 2026 live ist und das das Node-Release **v3.2.4** betreibt (per Governance-Vorschlag 13 bei Höhe 3.742.566 am 23. Oktober 2026 angewendet, nach v3.2.3 bei Höhe 3.662.051 am 20. Oktober 2026). Ein Validator muss zum Zeitpunkt der Erstellung das v3.2.4-Binary betreiben; der Mainnet-Governance-Vorschlag 14 würde v3.2.5 auf Höhe 3.906.833 anwenden, und das Manifest nennt dann das zu installierende Binary (siehe [Einen Node betreiben: Upgrades](/developer-guide/running-a-node#upgrades)). Das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**) läuft mit v3.2.6 (angewendet am 27. Oktober 2026, nach v3.2.5 am 26. Oktober) und wird empfohlen, um das eigene Setup zu proben, bevor man live geht. Setzen Sie die passende `--chain-id` für Ihr Zielnetzwerk ein. Die Blockzeiten unterscheiden sich: etwa 3,1 s im Mainnet (die letzten 1.000 Blöcke brauchten am 27. Oktober 2026 52 Minuten 21 Sekunden) und etwa 1,3 s im Testnet; beide schwanken, rechnen Sie Blockanzahlen daher pro Netzwerk in Zeit um.
:::

:::caution Das Release-Binary verwenden, keinen Build aus dem Quellcode
Ein Validator muss das **Release-`qorechaind`** betreiben, das im Live-Manifest genannt wird (`https://download.qore.host/mainnet/latest.json`; siehe [Einen Node betreiben](/developer-guide/running-a-node#fetch-the-manifest)). Ein aus dem öffentlichen Quellcode gebautes Binary enthält Stub-Keeper und keinen Post-Quanten-Signierer: Es kann den Konsenszustand des Netzwerks nicht reproduzieren und nicht die hybride Signatur erzeugen, die `create-validator` und jede andere Transaktion auf der Cosmos-Lane benötigen (siehe [Aus dem Quellcode erstellen](/developer-guide/building-from-source)). Ab v3.2.3 startet ein aus dem öffentlichen Quellcode gebautes Binary in einem öffentlichen Netzwerk überhaupt nicht mehr. Ein frischer Mainnet-Node benötigt v3.2.0 oder neuer; halten Sie die Systemuhr per NTP synchronisiert, denn ab v3.2.1 stoppt der Node, wenn seine Uhr um mehr als 60 Sekunden abweicht.
:::

:::note Welche Teile dieser Seite live sind
Die Blockproduktion verwendet die standardmäßige, nach Stake gewichtete Validator-Rotation, und Slashing sowie Governance nutzen die Standardmodule des Cosmos SDK mit den unten gezeigten Parametern. Die Triple-Pool-CPoS-Logik (Pool-Klassifizierung, poolgewichtete Proposer-Auswahl, Bonding-Kurve und progressives Slashing) ist im Modul `x/qca` implementiert und ihre Parameter liegen on-chain, ist aber **noch nicht in Blockproduktion, Belohnungen oder Slashing eingebunden**. Die Abschnitte zu diesen Themen beschreiben das Design; planen Sie nicht damit, dass Pool-Zugehörigkeit oder Reputation heute Ihren Anteil an Blockvorschlägen oder Ihre Belohnungen verändern.
:::

---

## Voraussetzungen

* Ein vollständig synchronisierter Release-`qorechaind`-Node (siehe [Mit dem Mainnet verbinden](/getting-started/connecting-to-mainnet) bzw. [Mit dem Testnet verbinden](/getting-started/connecting-to-testnet) zum Proben)
* Ein **registrierter ML-DSA-87-PQC-Schlüssel** auf dem Operator-Konto (siehe [PQC-Schlüsselregistrierung](#pqc-key-registration)) — `create-validator` benötigt die hybride Signatur
* Ein finanziertes Konto mit mindestens **100.000 QOR** (100.000.000.000 uqor) für die anfängliche Self-Delegation — dieses Minimum wird on-chain erzwungen, und `create-validator` wird darunter abgelehnt
* Eine aktive **`validator_operator`-Erteilung** auf Ihrer Operator-Adresse, ausgestellt über das [Validator Program](/dashboard/tools-hub#validator-application) auf der Seite **Nodes & Validators** des Dashboards (bewerben, ausgewählt werden, die Programmgebühr von $1,000 zahlen); siehe den Hinweis unten. Ohne sie schlägt `create-validator` mit `ErrUnauthorized` fehl, unabhängig davon, wie viel QOR Sie self-bonden
* Vertrautheit mit dem Modell [Staking und Delegation](/user-guide/staking-and-delegation)

---

## Dem Netzwerk beitreten {#joining}

**Verwenden Sie State Sync als Standardweg zum Beitritt.** Es holt einen aktuellen Anwendungszustand von Peers, statt Blöcke abzuspielen, also statt jeden Block ab Genesis erneut abzuspielen. Der Snapshot-Download ist nur ein Ausweichweg: Der Snapshot im Mainnet-Manifest ist weiterhin das Archiv vom 21. August 2026 (Höhe 1.966.629, etwa 27 GB), das vor mehreren Upgrades liegt und danach etwa zwei Monate an Blöcken abspielt; das Testnet veröffentlicht überhaupt keinen Snapshot.

1. Installieren Sie das Release-`qorechaind`, das das Manifest nennt (siehe [Einen Node betreiben](/developer-guide/running-a-node#fetch-the-manifest)), führen Sie `qorechaind init <moniker> --chain-id qorechain-vladi` aus, legen Sie dann Genesis, Peers und Seeds aus dem Manifest wie dort beschrieben ab und setzen Sie `minimum-gas-prices = "0.1uqor"` in `app.toml`.
2. Übernehmen Sie den Trust Point aus dem Manifest und schreiben Sie den Abschnitt `[statesync]` der `config.toml`:

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

```toml
[statesync]
enable = true
rpc_servers = "https://rpc.qore.host:443,https://<a second RPC you run or trust>:26657"
trust_height = <TRUST_HEIGHT>
trust_hash = "<TRUST_HASH>"
trust_period = "168h0m0s"
```

3. Halten Sie optional die Festplattennutzung klein (siehe [Hardware](#hardware)): Setzen Sie in `app.toml` `pruning = "custom"` mit `pruning-keep-recent = "100000"` und `pruning-interval = "10"`, und in `config.toml` `indexer = "null"` unter `[tx_index]` (ein Validator bedient keine Transaktionsabfragen; verwenden Sie `null` nicht auf einem Node, den Sie abfragen).
4. Starten Sie mit `qorechaind start --minimum-gas-prices=0.1uqor` und warten Sie, bis `catching_up` den Wert `false` hat.

:::warning State Sync benötigt zwei verschiedene RPC-Server
State Sync gleicht den Trust Point mit **zwei** RPC-Servern ab. Die `stateSync.rpcServers` des Manifests führen `https://rpc.qore.host` **zweimal** auf (und das Testnet-Manifest führt `https://rpc-testnet.qore.host` zweimal auf). Zwei identische Einträge erfüllen die Anzahl, heben aber den Abgleich auf, da beide Antworten von einem einzigen Server stammen. Fügen Sie einen zweiten RPC hinzu, den Sie selbst betreiben oder dem Sie unabhängig vertrauen, und prüfen Sie den Trust Hash vor dem Start gegen eine zweite Quelle, zum Beispiel muss `curl -s "https://<second-rpc>/block?height=$TRUST_HEIGHT" | jq -r .result.block_id.hash` gleich `$TRUST_HASH` sein. Der Trust Point im Manifest wird stündlich aktualisiert, holen Sie ihn also erneut, falls er veraltet ist.
:::

Halten Sie die Systemuhr per NTP synchronisiert: Ab v3.2.1 stoppt der Node, wenn seine Uhr um mehr als 60 Sekunden abweicht.

---

## Netzwerkparameter {#parameters}

Diese Werte wurden am 27. Oktober 2026 aus der Mainnet-REST-API gelesen (`qorechain-vladi`, v3.2.4). Lesen Sie sie live aus, bevor Sie sich darauf verlassen: `qorechaind query staking params`, `qorechaind query slashing params` oder `GET /cosmos/staking/v1beta1/params` und `GET /cosmos/slashing/v1beta1/params`.

| Eintrag | Wert |
| --- | --- |
| Größe des aktiven Sets (`max_validators`) | 100 (heute sind 8 Validatoren gebondet, keiner gejailt) |
| Unbonding-Zeitraum | 1.814.400 s (21 Tage); höchstens 7 Unbonding-Einträge (`max_entries`) pro Delegator |
| Minimale Provisionsrate (`min_commission_rate`) | 0 (Sie wählen Ihre eigene Rate, bis zu Ihrer `commission-max-rate`) |
| Fenster für signierte Blöcke | 10.000 Blöcke (`signed_blocks_window`) |
| Mindestanteil signierter Blöcke pro Fenster | 0,05, ein Validator wird also gejailt, wenn er weniger als 5 % des Fensters signiert |
| Downtime-Jail / -Slash | 600 s Jail, 1 % des Stakes geslasht |
| Double-Sign-Slash | 5 % des Stakes |
| Self-Bond-Untergrenze zum Erstellen eines Validators | **100.000 QOR** (`100000000000uqor`), on-chain erzwungen; darunter schlägt `create-validator` mit Code 18 fehl |
| Operator-Erteilung | Eine aktive `validator_operator`-Erteilung auf dem Absender ist erforderlich; ohne sie schlägt `create-validator` mit `ErrUnauthorized` fehl |
| Gebührenuntergrenze | 0,1 uqor pro Gas |

**Reihenfolge der Schritte.** Gehen Sie in dieser Reihenfolge vor: (1) den PQC-Schlüssel des Kontos registrieren, (2) die `validator_operator`-Erteilung erhalten, (3) `create-validator` mit `--generate-only` erzeugen und mit `tx pqc cosign` signieren. Der Schlüssel kommt zuerst, weil ein Konto ohne registrierten Schlüssel nur die Registrierung selbst senden kann (siehe [PQC-Schlüsselregistrierung](#pqc-key-registration)), und die Erteilung geprüft wird, wenn `create-validator` ausgeführt wird. Einzelheiten stehen unter [Einen Validator erstellen](#validator-license-gate) und [PQC-Schlüsselregistrierung](#pqc-key-registration).

:::caution `min-self-delegation` ist nicht die Untergrenze von 100.000 QOR
Die Genesis-Validatoren zeigen on-chain `min_self_delegation` = `1` (1 uqor). Das ist **nicht** die Untergrenze: deren Genesis-Transaktionen waren davon ausgenommen. Das Feld `min-self-delegation` in Ihrer `validator.json` ist Ihr eigenes Versprechen, mindestens so viel self-gebondet zu halten, und hat nichts mit der Untergrenze von 100.000 QOR zu tun, die für den `amount` gilt, den Sie beim Erstellen des Validators self-delegieren.
:::

---

## Hardware {#hardware}

Gemessen an den laufenden Mainnet-Validatoren (27. Oktober 2026): etwa 3,2 bis 3,5 GB RAM und unter 10 % CPU bei normaler Last. Ein Validator läuft komfortabel mit 3 bis 4 vCPU, 8 bis 16 GB RAM und NVMe-Speicher. Die Single-Core-Geschwindigkeit ist wichtiger als die Kernanzahl: Das Verifizieren von ML-DSA-87-Signaturen macht etwa die Hälfte der Arbeit bei der Prüfung einer Transaktion aus und erreicht unter Last Spitzen.

| Eintrag | Empfohlenes Validator-Profil |
| --- | --- |
| CPU | 4 vCPU, hohe Taktrate |
| RAM | 16 GB |
| Festplatte | 100 GB oder mehr, NVMe |
| Uhr | NTP-synchronisiert (die 60-Sekunden-Regel oben) |
| Netzwerk | Nur P2P `26656` ist für die Welt offen; RPC, REST und EVM sind an localhost gebunden |

Die Festplattennutzung hängt davon ab, wie Sie beigetreten sind. Ein Validator, der per State Sync mit `pruning = "custom"` (keep-recent 100000) und `indexer = "null"` beigetreten ist, belegt nach zwei Monaten etwa 10 GB. Ein Node mit Standard-Pruning, der seit Genesis läuft, belegt nach vier Monaten etwa 100 bis 130 GB. Die 500 GB oder mehr, die für RPC-Nodes unter [Einen Node betreiben](/developer-guide/running-a-node#recommended-hardware) empfohlen werden, sind für einen Validator großzügig bemessen.

---

## Wie das Netzwerk betrieben wird {#network-organisation}

Am 27. Oktober 2026 hat das Netzwerk 8 aktive Validatoren, in mehreren Ländern und bei mehr als einem Hosting-Anbieter. Die öffentlichen Endpunkte (`rpc.qore.host`, `api.qore.host`, `evm.qore.host`, `svm.qore.host`) werden von dedizierten Nicht-Validator-Nodes hinter einem Edge-Netzwerk bedient, nie von Validatoren, und die IP-Adressen der Validatoren werden nicht im DNS veröffentlicht. Die Stimmgewalt folgt dem gebondeten Stake: Ein neuer Validator mit dem minimalen Self-Bond startet mit einem kleinen Anteil an der Stimmgewalt und wächst, sobald Delegationen eintreffen.

---

## Einen Validator erstellen

### Operator-Erteilung: `validator_operator` {#validator-license-gate}

`create-validator` wird durch zwei unabhängige, jeweils on-chain erzwungene Prüfungen abgesichert, und Sie benötigen beide — ein großer Self-Bond allein genügt nicht:

1. **Mindest-Self-Bond von 100.000 QOR.**
2. **Eine aktive `validator_operator`-Erteilung** auf dem Konto, das die Transaktion einreicht.

Die Erteilung wird on-chain von der QoreChain Association über das **Validator Program** ausgestellt: Bewerben Sie sich auf der Seite **Nodes & Validators** des Dashboards ([Tools Hub](/dashboard/tools-hub#validator-application)), betreiben Sie für die 14-tägige Probephase einen Validator im diana-Testnet und zahlen Sie nach Ihrer Auswahl die **Programmgebühr von $1,000**; die Erteilung wird dann in Stapeln für die Operator-Adresse aus Ihrer Bewerbung signiert. Prüfen Sie Ihre mit `GET /qorechain/license/v1/check/{grantee}/validator_operator`. Das `expires_at` einer Lizenz ist eine **Blockhöhe**, kein Datum und keine Dauer — `0` bedeutet keine Ablauffrist. Fehlt die Lizenz oder ist sie abgelaufen, schlägt `create-validator` mit `ErrUnauthorized` fehl, egal wie viel Sie self-bonden; dies ist der mit Abstand häufigste Grund, warum ein gut finanzierter Versuch scheitert und unerklärlich wirkt. Diese Sperre existiert gerade deshalb, weil die EVM-Ausführungsebene sie weder sehen noch durchsetzen kann (ein einzelner Ante-Decorator dort würde sie vollständig umgehen) — das ist einer der Gründe, warum Staking und Validierung ausschließlich auf der nativen Lane verbleiben.

Erstellen Sie eine Datei `validator.json` (die flag-basierte Form wurde im aktuellen SDK entfernt):

```json
{
  "pubkey": {"@type": "/cosmos.crypto.ed25519.PubKey", "key": "<base64 key from: qorechaind comet show-validator>"},
  "amount": "100000000000uqor",
  "moniker": "my-validator",
  "identity": "",
  "website": "",
  "security": "",
  "details": "",
  "commission-rate": "0.10",
  "commission-max-rate": "0.20",
  "commission-max-change-rate": "0.01",
  "min-self-delegation": "1"
}
```

Erzeugen und signieren Sie anschließend die Transaktion (sie benötigt die hybride Signatur wie jede Transaktion auf der Cosmos-Lane; siehe [Transaktionsbefehle](/cli-reference/transaction-commands#hybrid-signing)):

```bash
qorechaind tx staking create-validator validator.json \
  --from mykey --chain-id qorechain-vladi \
  --gas 600000 --fees 60000uqor \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

Die Gebührenuntergrenze des Netzwerks beträgt **0,1 uqor pro Gas-Einheit**, ein Gaslimit von 600.000 erfordert also mindestens 60.000 uqor.

| Feld in `validator.json`       | Beschreibung                                        |
| ------------------------------ | -------------------------------------------------- |
| `amount`                       | Self-Delegation-Betrag — **mindestens 100.000 QOR** (`100000000000uqor`) |
| `pubkey`                       | Konsens-Public-Key des Validators (ed25519)           |
| `moniker`                      | Menschenlesbarer Name für Ihren Validator             |
| `commission-rate`              | Anfängliche Provisionsrate (z. B. 0,10 = 10 %)         |
| `commission-max-rate`          | Maximale Provisionsrate (nach Erstellung unveränderlich) |
| `commission-max-change-rate`   | Maximale tägliche Änderungsrate der Provision              |
| `min-self-delegation`          | Ihre eigene Verpflichtung, mindestens so viel self-gebondet zu halten (in uqor). Es ist **nicht** die On-Chain-Untergrenze von 100.000 QOR, die für `amount` gilt |

Prüfen Sie nach Bestätigung der Transaktion Ihren Validator:

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## Pool-Klassifizierung

:::note Design, noch nicht in der Blockproduktion aktiv
Die folgende Pool-Klassifizierung ist das Design von `x/qca`. Ihre Parameter liegen on-chain (`qorechaind query qca config`), aber Blockvorschläger werden noch nicht nach Pool ausgewählt, und die Pools verändern Belohnungen oder Slashing noch nicht.
:::

Das Modul `x/qca` (Quantum Consensus Allocation) von QoreChain definiert ein **dreistufiges Pool-Klassifizierungssystem**. Alle **1.000 Blöcke** (etwa 52 Minuten bei den 3,1-s-Blöcken des Mainnets) sollen Validatoren anhand ihrer Reputation und ihres Stakes in einen von drei Pools neu eingeteilt werden:

| Pool                                 | Kriterien                                          | Block-Zuteilung |
| ------------------------------------ | ------------------------------------------------- | ---------------- |
| **RPoS** (Reputation Proof-of-Stake) | Reputation >= 70. Perzentil UND Stake >= Median | 40 % der Blöcke    |
| **DPoS** (Delegated Proof-of-Stake)  | Gesamtdelegation >= 10.000 QOR                    | 35 % der Blöcke    |
| **PoS** (Proof-of-Stake)             | Alle übrigen aktiven Validatoren                   | 25 % der Blöcke    |

Im Design werden Blockvorschläger innerhalb jedes Pools mittels **gewichteter Zufallsauswahl** proportional zu ihrem effektiven Stake ausgewählt, sodass sowohl Validatoren mit hoher Reputation als auch solche mit hoher Delegation fair repräsentiert werden, während kleinere Validatoren weiterhin teilnehmen können.

### Die Pool-Konfiguration abfragen

```bash
# Pool weights and classification parameters (there is no per-validator classification query)
qorechaind query qca config
```

Über JSON-RPC:

> **Noch nicht bereitgestellt:** Kein veröffentlichter Node-Build stellt den JSON-RPC-Namespace `qor_` bereit, daher liefert dieser Aufruf heute an jedem öffentlichen Endpunkt `-32601` (Methode nicht gefunden). Siehe [den Namespace `qor_`](/api-reference/json-rpc-qor_-namespace).

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

:::note Design, noch nicht aktiv
Die Bonding-Kurve ist in `x/qca` implementiert, aber noch nicht in die Belohnungsverteilung eingebunden; Staking-Belohnungen folgen heute dem Standard-Distribution-Modul. Die Formel unten ist das Design.
:::

Die Staking-Belohnung eines Validators soll durch eine Bonding-Kurve bestimmt werden, die mehrere Faktoren einbezieht:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Variable | Beschreibung                                                |
| -------- | ---------------------------------------------------------- |
| `R`      | Belohnungsbetrag                                              |
| `beta`   | Basis-Belohnungsrate                                                |
| `S`      | Effektiver Stake                                                    |
| `alpha`  | Skalierungskonstante für Loyalität                                  |
| `L`      | Loyalitätsdauer (kontinuierliche Staking-Zeit)                      |
| `Q(r)`   | Reputations-Qualitätsfaktor, Bereich \[0,75 - 1,25]                  |
| `P(t)`   | Protokollphasen-Multiplikator (passt sich über den Netzwerklebenszyklus an) |

**Wichtige Erkenntnisse:**

* **Loyalitätsdauer-Bonus:** Das Design fügt einen logarithmischen Term für kontinuierliche Staking-Zeit hinzu.
* **Reputations-Qualitätsfaktor:** Reicht von 0,75 (schlechte Reputation) bis 1,25 (exzellente Reputation). Die Gewichte der Reputationsformel liegen on-chain (`qorechaind query reputation params`).
* **Protokollphasen-Multiplikator:** Passt sich an, während das Netzwerk verschiedene Phasen durchläuft (Bootstrap, Wachstum, Reife).

---

## Slashing {#slashing}

Die Basis-Strafen für Verstöße, live abfragbar und zum Zeitpunkt der Erstellung dieses Textes aktuell:

```bash
qorechaind query slashing params
```

| Parameter | Wert |
| --- | --- |
| Fenster für signierte Blöcke | 10.000 Blöcke (etwa 8,7 Stunden im Mainnet bei 3,1 s pro Block; im Testnet kürzer) |
| Mindestanteil signierter Blöcke pro Fenster | 5 % (`min_signed_per_window` = 0,05): Ein Validator wird gejailt, wenn er **weniger als 5 %** der letzten 10.000 Blöcke signiert, das heißt, wenn er mehr als 95 % verpasst |
| Downtime-Jail-Dauer | 600 Sekunden (10 Minuten) |
| Downtime-Slash-Anteil | 1 % des Stakes |
| Double-Sign-Slash-Anteil | 5 % des Stakes |

Jailing ist ein fester 10-Minuten-Timeout mit einer festen Strafe. Das Unbonding dauert 21 Tage (1.814.400 s), das aktive Set umfasst höchstens 100 Validatoren (`max_validators`), und jeder Delegator kann höchstens 7 Unbonding-Einträge haben (`max_entries`). Das progressive Modell unten ist ein separates Design, das zusätzliche, eskalierende Konsequenzen für wiederholte Verstöße darüberlegen würde; es ist noch nicht eingebunden.

## Progressives Slashing

:::note Design, noch nicht aktiv
Progressives Slashing ist in `x/qca` implementiert, aber nicht in das Slashing eingebunden: Die geltenden Strafen sind die Standardwerte von `x/slashing` aus der Tabelle oben. Die Parameter unten sind das Design (`qorechaind query qca config`).
:::

Das Design des progressiven Slashings eskaliert Strafen für wiederholte Verstöße, erlaubt Validatoren aber zugleich, sich mit der Zeit zu erholen:

```
penalty = base_rate * escalation^effective_count * severity
```

| Parameter                    | Wert          |
| ---------------------------- | -------------- |
| Maximale Strafe pro Ereignis    | 33 % des Stakes   |
| Halbwertszeit des Verfalls              | 100.000 Blöcke |
| Schweregrad Downtime            | 1,0            |
| Schweregrad Double-Sign         | 2,0            |
| Schweregrad Light-Client-Angriff | 3,0            |

1. **Jeder Verstoß erhöht den effektiven Zähler.** Jeder Verstoß (Downtime, Double-Signing usw.) erhöht den effektiven Zähler des Validators, der sich auf zukünftige Strafen auswirkt.

2. **Die Strafe eskaliert exponentiell.** Die Strafe eskaliert anhand des effektiven Zählers gemäß der obigen Formel, sodass Wiederholungstäter deutlich höhere Strafen erhalten.

3. **Der effektive Zähler verfällt mit der Zeit.** Der effektive Zähler verfällt mit einer Halbwertszeit von 100.000 Blöcken (etwa 3,6 Tage bei den 3,1-s-Blöcken des Mainnets), sodass sich Validatoren nach einer Phase guten Verhaltens erholen können.

4. **Einzelereignisse vs. wiederholte Verstöße.** Ein einzelnes versehentliches Downtime-Ereignis führt zu einer geringen Strafe, während wiederholte Verstöße exponentiell steigende Konsequenzen auslösen.

---

## PQC-Schlüsselregistrierung {#pqc-key-registration}

Registrieren Sie Ihren **post-quantenkryptografischen (PQC) Public Key** (ML-DSA-87) **bevor** Sie `create-validator` ausführen, und zwar so früh wie möglich: Das Panel [Validator Readiness](/dashboard/tools-hub#validator-application) prüft ihn ab dem Moment Ihrer Bewerbung. Dies ist **nicht optional und nicht automatisch**: Die Chain verlangt eine hybride PQC-Signatur für jede Transaktion auf der Cosmos-Lane, `MsgCreateValidator` gehört nicht zu den ausgenommenen Nachrichtentypen, und kein Konto registriert seinen Schlüssel automatisch: Die Registrierung ist eine explizite Transaktion, die jedes Konto (Validator-Operatoren eingeschlossen) selbst und im Voraus senden muss. Erzeugen Sie zuerst den Schlüssel:

```bash
qorechaind tx pqc gen-key mypqc          # prints the public key (hex); stored unencrypted under ~/.qorechaind/pqc/
```

```bash
qorechaind tx pqc register-key-v2 dilithium5 <pubkey-hex> hybrid \
  --from mykey \
  --pqc-key mypqc \
  --chain-id qorechain-vladi \
  --gas 600000 --fees 60000uqor \
  -y
```

`--pqc-key mypqc` hängt einen **Besitznachweis (Proof of Possession)** an: Der Schlüssel signiert `qorechain-pqc-pop-v1|chainid|algo|address|hex(pubkey)`, und die Chain verifiziert dies, sodass niemand einen Public Key registrieren kann, dessen privaten Teil er nicht besitzt. In v3.2.3 ist es optional und wird empfohlen. Ab v3.2.4 (Mainnet seit dem 23. Oktober 2026, Testnet seit dem 19. Oktober 2026) meldet der Kontodatensatz außerdem, ob ein Nachweis verifiziert wurde (`possession_proven`, in `GET /qorechain/pqc/v1/account/{address}`).

:::note Was v3.2.3 an der Schlüsselregistrierung geändert hat
* Ein Konto **ohne** registrierten Schlüssel kann nur die Registrierung selbst senden: Jede andere Transaktion mit einer hybriden Signaturerweiterung wird abgelehnt. Registrieren Sie zuerst und signieren Sie dann alles Weitere mit `tx pqc cosign`.
* `classical_only`, leere und degenerierte Schlüssel werden bei der Registrierung abgelehnt.
* Sobald ein Konto einen Schlüssel hält, muss jede weitere Schlüsselpflege (Rotation, Migration, Neuregistrierung) selbst hybrid signiert sein und kann nicht über `authz` gesendet werden.
* `tx pqc gen-key` überschreibt niemals eine vorhandene Schlüsseldatei.
:::

| Parameter      | Beschreibung                                       |
| -------------- | ------------------------------------------------- |
| `dilithium5`   | Algorithmus (ML-DSA-87)                            |
| `<pubkey-hex>` | 2592-Byte-ML-DSA-87-Public-Key in Hex-Kodierung    |
| `hybrid`       | Schlüsseltyp (hybrid = sowohl klassisch als auch PQC) |

(`qorechaind tx pqc register-key <pubkey-hex> hybrid` ist die äquivalente Legacy-Form für Dilithium-5.)

:::caution `--gas` explizit setzen
Der ML-DSA-87-Public-Key ist 2.592 Byte groß, und das Schreiben auf die Chain kann das Standard-Gaslimit von 200.000 überschreiten (Registrierungen im Mainnet haben 220.000 bis 350.000 Gas verbraucht). Ohne `--gas 600000` (oder höher) kann die Transaktion mit einem kryptischen `out of gas`-Fehler fehlschlagen. Die Gebühr muss mindestens dem Gaslimit mal 0,1 uqor entsprechen, `--gas 600000` erfordert also `--fees 60000uqor` oder mehr.
:::

Registrierung überprüfen:

```bash
qorechaind query pqc account <account-address>
```

Die Schlüsseldatei unter `~/.qorechaind/pqc/` ist der Post-Quanten-Signaturschlüssel des Kontos: Sichern Sie sie wie die Mnemonic und halten Sie sie nach Möglichkeit von der Maschine fern, auf der der Konsensschlüssel liegt. Siehe [Post-Quanten-Signierung](/developer-guide/post-quantum-signing#pqc-key-registration) für Wiederherstellung und Rotation.

---

## Monitoring

### Prometheus-Metriken

QoreChain stellt Prometheus-Metriken auf Port **26660** bereit:

```
http://localhost:26660/metrics
```

Aktivieren Sie den Endpunkt mit `prometheus = true` im Abschnitt `[instrumentation]` der `config.toml`. Der Node stellt die Standardmetriken der Konsens-Engine bereit (Blockhöhe, Konsensrunden, Validator-Set, Peers, Mempool); listen Sie mit `curl -s localhost:26660/metrics | grep -i -E 'height|validator|peers|mempool'` auf, was Ihr Node bereitstellt. Die Signaturgesundheit pro Validator lässt sich am zuverlässigsten aus der Chain selbst ablesen (siehe Health-Checks unten), da deren eigene Aufzeichnung über das Jailing entscheidet.

### Reputationsparameter abfragen

```bash
# Formula weights only (there is no per-validator score query)
qorechaind query reputation params
```

Über JSON-RPC:

> **Noch nicht bereitgestellt:** Kein veröffentlichter Node-Build stellt den JSON-RPC-Namespace `qor_` bereit, daher liefert dieser Aufruf heute an jedem öffentlichen Endpunkt `-32601` (Methode nicht gefunden). Siehe [den Namespace `qor_`](/api-reference/json-rpc-qor_-namespace).

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
qorechaind query staking validators --status BOND_STATUS_BONDED | grep "my-validator"
```

---

## Best Practices für den Betrieb

1. **Eine Sentry-Node-Architektur verwenden.** Betreiben Sie Ihren Validator hinter Sentry-Nodes, um ihn vor DDoS-Angriffen zu schützen. Setzen Sie nur die Sentry-Nodes dem öffentlichen Netzwerk aus.

2. **Alerting einrichten.** Konfigurieren Sie Benachrichtigungen für verpasste Blöcke, niedrige Uptime und unerwartete Neustarts. Ein paar verpasste Blöcke sind normal; anhaltende Ausfälle lösen Slashing aus.

3. **Hohe Uptime aufrechterhalten.** Anhaltende Ausfallzeiten führen dazu, dass der Validator gejailt (weniger als 5 % der letzten 10.000 Blöcke signiert) und geslasht wird; siehe [Slashing](#slashing).

4. **Software aktuell halten.** Verfolgen Sie QoreChain-Releases und spielen Sie Updates zeitnah ein. Stimmen Sie sich für Chain-Upgrades mit der Validator-Community ab.

5. **Ihre Schlüssel sichern.** Schützen Sie den Konsensschlüssel des Validators (`priv_validator_key.json`) und bewahren Sie Backups offline auf; erwägen Sie einen Remote-Signer. Remote-Signing (`priv_validator_laddr`) wurde mit dem Release-Binary `qorechaind` nicht verifiziert, und das Post-Quanten-Modul ändert den Typ des Konsensschlüssels (ed25519) nicht, testen Sie also jedes Signer-Setup im Testnet, bevor Sie sich darauf verlassen. Halten Sie die Schlüssel des Operator-Kontos und dessen PQC-Schlüsseldatei nach Möglichkeit von der Maschine fern, auf der der Validator läuft.

6. **Zuerst einen PQC-Schlüssel registrieren.** Das Operator-Konto benötigt einen registrierten ML-DSA-87-Schlüssel, bevor es einen Validator erstellen oder eine andere Transaktion auf der Cosmos-Lane senden kann.

7. **Die Uhr synchron halten.** Betreiben Sie einen NTP-Client; ab v3.2.1 stoppt der Node, wenn seine Uhr um mehr als 60 Sekunden abweicht.

---

## Referenz: Validator-Befehle

```bash
# Edit validator metadata
qorechaind tx staking edit-validator \
  --new-moniker "new-name" \
  --website "https://myvalidator.com" \
  --details "Description of my validator" \
  --from mykey --gas 400000 --fees 40000uqor --generate-only > tx.json

# Unjail after downtime slashing
qorechaind tx slashing unjail --from mykey --gas 300000 --fees 30000uqor --generate-only > tx.json

# Delegate additional stake
qorechaind tx staking delegate $(qorechaind keys show mykey --bech val -a) \
  500000000uqor --from mykey --gas 400000 --fees 40000uqor --generate-only > tx.json

# Withdraw rewards and commission
qorechaind tx distribution withdraw-rewards $(qorechaind keys show mykey --bech val -a) \
  --commission --from mykey --gas 400000 --fees 40000uqor --generate-only > tx.json

# Sign and broadcast any of the above (hybrid signature):
qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

Die Gebührenuntergrenze des Netzwerks beträgt 0,1 uqor pro Gas-Einheit. Ein Operator-Konto, das **keinen** registrierten PQC-Schlüssel hat, kann `unjail` weiterhin klassisch senden; sobald ein Schlüssel registriert ist, benötigt jede Transaktion (unjail eingeschlossen) die hybride Signatur.

---

## Verbundene Netzwerke validieren {#connected-networks}

:::caution Noch kein verbundenes Netzwerk ist aktiv
Das Bridge-Modul ist auf Mainnet und Testnet bereitgestellt, aber **keine Bridge-Route ist aktiv**: Alle 37 Chain-Konfigurationen haben den Status `pending`, es sind keine Bridge-Validatoren registriert, es wurde noch nie eine Bridge-Operation erzeugt, und im Mainnet ist kein IBC-Channel geöffnet (das Testnet hat einen Transfer-Channel, der keine Bridge-Route ist). Das Framework unten beschreibt das Design; heute gibt es in einem verbundenen Netzwerk nichts zu validieren.
:::

Das Design (seit Chain-Version **v3.1.80**) erlaubt es einem QoreChain-Validator, auch dabei zu helfen, die über die [Bridge](/architecture/bridge-architecture) verbundenen Netzwerke zu validieren. Es ist **lizenzgebunden und optional**:

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

* [Einen Node betreiben](/developer-guide/running-a-node) — Das Release-Binary installieren, State Sync und Node-Einstellungen
* [EVM-Entwicklung](/developer-guide/evm-development) — Smart Contracts auf QoreChain bereitstellen
* [Post-Quanten-Signierung](/developer-guide/post-quantum-signing) — Schlüsselregistrierung, Wiederherstellung und Rotation
