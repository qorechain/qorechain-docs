---
slug: /architecture/bridge-architecture
title: Bridge-Architektur
sidebar_label: Bridge-Architektur
sidebar_position: 7
---

# Bridge-Architektur

Das `x/bridge`-Modul ist darauf ausgelegt, QoreChain über **37 Chain-Konfigurationen (36 externe Chains plus Injective, das über IBC angebunden wird) und bis zu 8 IBC-(Inter-Blockchain Communication-)Gegenparteien** mit dem breiteren Blockchain-Ökosystem zu verbinden. Jede Bridge-Operation ist darauf ausgelegt, durch Post-Quanten-Kryptografie abgesichert zu sein.

:::caution Auf keinem der beiden Netzwerke live
Das Bridge-Modul ist auf Mainnet und Testnet bereitgestellt, aber **keine Bridge-Route ist aktiv**: Alle 37 Chain-Konfigurationen haben den Status `pending`, es ist kein Bridge-Contract gesetzt, es sind keine Bridge-Validatoren registriert, es wurde noch nie eine Bridge-Operation erstellt, und im Mainnet existiert kein IBC-Kanal (das Testnet hat einen einzigen ICS-20-Testkanal zu einer Chain mit der ID `provider`, keinen zu den unten genannten Gegenparteien). Alles Folgende beschreibt das beabsichtigte Design. Senden Sie keine Assets in der Erwartung, dass sie gebridged werden.
:::

## Aktueller Status {#current-status}

| | Mainnet | Testnet |
|---|---|---|
| Bridge-Modul | aktiviert | aktiviert |
| Chain-Konfigurationen | 37, alle `pending` | 37, alle `pending` |
| Registrierte Bridge-Validatoren | 0 | 0 |
| Bridge-Operationen | 0 | 0 |
| IBC-Kanäle / -Clients | 0 / 0 | 1 / 1 (ein Testkanal zum Cosmos-Hub-Testnet) |

(Geprüft am 27. Oktober 2026 gegen Mainnet (v3.2.4) und Testnet (v3.2.6). Die Live-Werte lesen Sie mit `qorechaind query bridge chains` und `qorechaind query bridge validators` oder über REST unter `/qorechain/bridge/v1/chains` und `/qorechain/bridge/v1/validators`.) Die Modulkonfiguration ist auf beiden Netzwerken gleich: `min_validators` 10, `attestation_threshold` 7, `challenge_period_secs` 86,400 und `large_transfer_threshold` 100.000 QOR (`100000000000` uqor). Der IBC-Stack, den das Modul verwenden würde, ist ibc-go v10.7 (seit v3.2.2), im Mainnet wurde jedoch noch kein Client und kein Kanal erstellt (das Testnet hat einen Test-Client und einen Test-Kanal, siehe oben).

## Verbindungsübersicht

QoreChain ist darauf ausgelegt, zwei parallel arbeitende Bridge-Protokolle zu unterstützen:

| Protokoll | Verbindungen          | Sicherheitsmodell                    | Anwendungsfall                          |
| --------- | --------------------- | ------------------------------------ | --------------------------------------- |
| **IBC**   | bis zu 8 Kanäle (keiner offen) | Standard-IBC + PQC-Paketsignaturen   | Cosmos SDK-kompatible Chains            |
| **QCB**   | 37 Chain-Konfigs (alle pending) | 7-aus-10 Dilithium-5-Multisig        | Nicht-IBC-Chains (EVM, Solana, TON usw.) |

Die **37 Chain-Konfigurationen** sind die unten aufgeführten **36 externen Chains** plus **Injective**, das als Chain vom Typ IBC konfiguriert ist. Es gibt keine Loopback-Konfiguration für QoreChain. Die geplanten IBC-Kanäle verbinden sich mit Cosmos SDK-kompatiblen Chains.

## IBC-Kanäle

QoreChain ist darauf ausgelegt, IBC-Verbindungen zu den folgenden 8 Chains zu unterhalten, weitergeleitet über Hermes v1.x. **Keine dieser Gegenparteien ist bislang verbunden** (das Mainnet hat keinen IBC-Kanal und keinen IBC-Client; das Testnet hat einen einzigen ICS-20-Testkanal zu einer Chain mit der ID `provider`, geprüft am 27. Oktober 2026), daher listet diese Tabelle nur geplante Gegenparteien auf:

| Chain      | Beschreibung                    |
| ---------- | ------------------------------- |
| Cosmos Hub | Primäre Hub-Verbindung          |
| Osmosis    | DEX-Liquiditäts-Routing         |
| Noble      | Native USDC-Emission            |
| Celestia   | Data-Availability-Layer         |
| Stride     | Liquid Staking                  |
| Akash      | Dezentralisiertes Computing     |
| Babylon    | BTC-Restaking-Protokoll         |
| Injective  | DeFi-/Orderbuch-Interoperabilität |

### IBC-Relayer-Konfiguration

* **Relayer-Software**: Hermes v1.x
* **Client-Updates**: Automatische Light-Client-Aktualisierung
* **Fehlverhaltenserkennung**: Aktiviert — der Relayer überwacht auf Equivocation
* **Paketbereinigung**: Alle 100 Blöcke werden ausstehende IBC-Pakete bereinigt
* **PQC-Erweiterung**: Jedes von QoreChain stammende IBC-Paket enthält eine optionale Dilithium-5-Signatur für vorausschauende Quantensicherheit. PQC-fähige empfangende Chains können diese Signatur zusätzlich zur Standard-IBC-Verifizierung prüfen.

## QCB-(QoreChain Bridge-)Protokoll

Das QCB-Protokoll verwendet eine Hub-and-Spoke-Architektur, die durch Post-Quanten-Kryptografie abgesichert ist. QoreChain fungiert als Hub, mit einer Spoke-Konfiguration für jede externe Chain.

### Externe Chain-Konfigurationen (36)

Das QCB-Protokoll ist darauf ausgelegt, die folgenden 36 externen Chains anzusprechen. Zusammen mit Injective (einer Konfiguration vom Typ IBC) ergeben sich **insgesamt 37 Chain-Konfigurationen**, die derzeit alle den Status `pending` haben.

**Baseline-Chains (10)**

Ethereum, Solana, TON, BSC, Avalanche, Polygon, Arbitrum, Optimism, Base, Sui.

**EVM-Familien-Chains (14)**

zkSync Era, Linea, Scroll, Blast, Mantle, Hyperliquid, Berachain, Sonic, Sei, Monad, Plasma, Filecoin FVM, Cronos, Kaia.

**Nicht-EVM-Chains (5)**

Starknet, XRP Ledger, Stellar, Hedera, Algorand.

**Weitere Chains (7)**

NEAR, Bitcoin, Cardano, Polkadot, Tezos, Tron, Aptos.

:::note
Zählkontrolle: 10 Baseline + 14 EVM-Familie + 5 Nicht-EVM + 7 weitere = **36 externe Chains**. Mit Injective (IBC) ergeben sich **37 Chain-Konfigurationen**.
:::

### Adressformate

Das QCB-Protokoll klassifiziert Chains nach Typ, um Zieladressen zu validieren:

| Chain-Typ    | Beispiel-Chains                                                         | Adressformat                                       |
| ------------ | ----------------------------------------------------------------------- | -------------------------------------------------- |
| `evm`        | Ethereum, BSC, Avalanche, Polygon, Arbitrum, Optimism, Base             | `0x` + 40 Hex-Zeichen                              |
| `solana`     | Solana                                                                  | Base58, 32–44 Zeichen                              |
| `ton`        | TON                                                                     | `EQ` + base64-kodiert                              |
| `sui_move`   | Sui                                                                     | `0x` + 64 Hex-Zeichen                              |
| `aptos_move` | Aptos                                                                   | `0x` + 64 Hex-Zeichen                              |
| `bitcoin`    | Bitcoin                                                                 | Bech32 (`bc1`), P2SH (`3...`) oder Legacy (`1...`) |
| `near`       | NEAR Protocol                                                           | `.near`-Suffix oder implizit                       |
| `cardano`    | Cardano                                                                 | `addr1` (Zahlung) oder `stake1` (Staking)          |
| `polkadot`   | Polkadot                                                                | SS58-kodiert                                       |
| `tezos`      | Tezos                                                                   | `tz1`/`tz2`/`tz3` (implizit) oder `KT1` (originated) |
| `tron`       | TRON                                                                    | `T` + base58, 34 Zeichen                           |

## Light Clients

Um externe Chain-Ereignisse vertrauenslos zu verifizieren, ist die Bridge darauf ausgelegt, On-Chain-Light-Clients auszuführen, die auf den Konsens und das Beweissystem jeder Quell-Chain zugeschnitten sind. Diese Light Clients ermöglichen es QoreChain, Einzahlungen und Auszahlungen zu validieren, ohne sich ausschließlich auf Validator-Attestierungen zu verlassen.

| Light Client            | Quell-Chain         | Verifizierungsprimitive                                             |
| ----------------------- | ------------------- | ------------------------------------------------------------------- |
| **Ethereum Light Client** | Ethereum / EVM L1 | BLS12-381-Signaturverifizierung, SSZ-Serialisierung, MPT-State-Proofs |
| **Bitcoin SPV**         | Bitcoin             | Simplified Payment Verification anhand von Block-Headern            |
| **Starknet STARK**      | Starknet            | STARK-Beweisverifizierung von Starknet-Zustandsübergängen          |
| **Sui BLS**             | Sui                 | BLS-Aggregat-Signaturverifizierung von Sui-Checkpoints             |
| **Wormhole / Solana VAA** | Solana (via Wormhole) | Verified Action Approval (VAA) Guardian-Signaturverifizierung    |

## Einzahlungsablauf (Extern zu QoreChain)

Die nachfolgende Sequenz zeigt die vorgesehene QCB-Einzahlung: Assets werden auf einer externen Chain gesperrt, QoreChain-Validatoren reichen PQC-signierte Attestierungen ein (7-aus-10 Dilithium-5), und Wrapped Tokens werden geprägt. Cosmos SDK-kompatible Chains würden stattdessen den parallelen IBC-Pfad verwenden (bis zu 8 Kanäle, mit optionalen Dilithium-5-Paketsignaturen). Keiner der beiden Pfade ist aktiv; es wurde noch nie eine Einzahlung vorgenommen.

```mermaid
sequenceDiagram
    participant U as User
    participant X as External Chain
    participant V as QoreChain Validators
    participant Q as QoreChain
    U->>X: 1. Lock assets on bridge contract
    X->>V: 2. Observe lock event
    V->>Q: 3. Submit attestations (7/10 PQC sigs)
    Note over V,Q: Light client verifies source proofs where available
    Q->>Q: 4. Mint wrapped tokens
    Note over Q: If > 100K QOR: 24h challenge period before execution
    Note over X,Q: IBC path (planned, up to 8 channels) runs in parallel for Cosmos SDK chains
```

```
External Chain          QoreChain Validators           QoreChain
     |                         |                          |
     | 1. Lock assets on       |                          |
     |    bridge contract      |                          |
     |------------------------>|                          |
     |                         | 2. Observe & attest      |
     |                         |    (7/10 PQC sigs)       |
     |                         |------------------------->|
     |                         |                          | 3. Mint wrapped
     |                         |                          |    tokens
     |                         |                          |
     |                         |    [If > 100K QOR]       |
     |                         |    24h challenge period   |
     |                         |    before execution       |
```

1. **Lock** — Der Nutzer sperrt Assets im Bridge-Contract auf der externen Chain.
2. **Attestieren** — Bridge-Validatoren beobachten die Lock-Transaktion und reichen Dilithium-5-signierte Attestierungen ein. Es sind mindestens **7 von 10** Validator-Attestierungen erforderlich. Wo ein Light Client für die Quell-Chain verfügbar ist, wird das Lock-Ereignis zusätzlich anhand der chaineigenen Beweise verifiziert.
3. **Mint** — Sobald der Attestierungsschwellenwert erreicht ist, werden Wrapped Tokens auf QoreChain geprägt.
4. **Challenge-Periode** — Für Transfers, die den Gegenwert von 100.000 QOR überschreiten, gilt vor der Ausführung eine **24-stündige Challenge-Periode**. Während dieses Zeitfensters können Validatoren verdächtige Aktivitäten kennzeichnen.

## Auszahlungsablauf (QoreChain zu Extern)

```
QoreChain               QoreChain Validators           External Chain
     |                         |                          |
     | 1. Burn wrapped tokens  |                          |
     |------------------------>|                          |
     |                         | 2. Attest burn           |
     |                         |    (7/10 PQC sigs)       |
     |                         |------------------------->|
     |                         |                          | 3. Unlock original
     |                         |                          |    assets
```

1. **Burn** — Der Nutzer verbrennt Wrapped Tokens auf QoreChain.
2. **Attestieren** — Validatoren attestieren das Burn-Ereignis mit Dilithium-5-Signaturen (7/10-Schwellenwert).
3. **Unlock** — Sobald der Schwellenwert erreicht ist, werden die ursprünglichen Assets auf der externen Chain freigegeben.

Alle während Auszahlungen erhobenen Bridge-Gebühren werden über den `bridge_fee`-Burn-Kanal an das `x/burn`-Modul geleitet (100 % der Bridge-Gebühren werden verbrannt).

### L2 → L1-Auszahlungen (Rollups)

Rollup-Auszahlungen nutzen die Bridge nicht. Sie werden vom `x/rdk`-Modul mit `execute-withdrawal` gegen die Auszahlungs-Root eines finalisierten Batches bezahlt — siehe [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals).

## Sicherheitsarchitektur

### PQC-Multisig

Alle QCB-Bridge-Operationen erfordern einen **7-aus-10-Schwellenwert** von Dilithium-5-Post-Quanten-Signaturen registrierter Bridge-Validatoren. Jeder Bridge-Validator registriert sich mit:

* Einer QoreChain-Validator-Adresse
* Einem Dilithium-5-Public-Key (2.592 Bytes)
* Einer Liste unterstützter Chains
* Einem Reputationswert (verwaltet von `x/reputation`)

Seit v3.2.2 validiert das Modul Nullbeträge und seine Konfiguration auf jedem Pfad einheitlich. **Ab v3.2.4 (Mainnet seit 23. Oktober 2026, Testnet seit 19. Oktober 2026):** Die Registrierung eines Bridge-Validators erfordert zusätzlich einen Besitznachweis des Dilithium-5-Schlüssels (dasselbe `proof_of_possession`-Format wie bei der PQC-Schlüsselregistrierung, siehe [Post-Quanten-Sicherheit](/architecture/post-quantum-security#proof-of-possession)) und weist einen Schlüssel zurück, den bereits ein anderer Bridge-Validator verwendet. Frühere Releases haben keine solche Prüfung, und auf keinem der beiden Netzwerke ist ein Bridge-Validator registriert.

### Circuit Breaker

Jede verbundene Chain verfügt über unabhängige Circuit-Breaker-Schutzmechanismen:

| Schutzmechanismus         | Beschreibung                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------ |
| **Einzeltransferlimit**   | Maximalbetrag für jede einzelne Bridge-Operation pro Chain                            |
| **Tägliches Gesamtlimit** | Gesamtvolumenobergrenze pro Chain pro 24-Stunden-Fenster                              |
| **Manuelle Pause**        | Durch Governance oder Validatoren ausgelöster Notfallstopp pro Chain                  |
| **Anomalieerkennung**     | Automatische Pause bei >50 Operationen in einem kurzen Fenster oder wenn das Volumen das 5-fache des Tageslimits überschreitet |

Der Circuit-Breaker-Zustand wird pro Chain verfolgt und umfasst: maximaler Einzeltransfer, Tageslimit, aktuelle Tagesnutzung, letzte Reset-Höhe sowie Pausenstatus mit Begründung.

### Challenge-Periode

Für große Transfers (>100.000 QOR-Gegenwert, konfigurierbar über `large_transfer_threshold`):

* Nach Erreichen des Attestierungsschwellenwerts gilt eine **24-stündige Challenge-Periode** (86.400 Sekunden).
* Während dieses Zeitfensters sollen Validatoren die Operation kennzeichnen können.
* Wird sie nicht angefochten, führt sich die Operation nach Ablauf der Periode automatisch aus.
* Angefochtene Operationen werden für eine Governance-Überprüfung eingefroren.

### KI-Pfadoptimierung

Das Bridge-Modul integriert sich mit dem KI-Subsystem für die Routenoptimierung (nicht über REST verfügbar). Für Transfers, die mehrere Pfade durchlaufen können (z. B. Chain A zu Chain B über einen Vermittler), bewertet der Pfadoptimierer:

* Geschätzte Gebühren über die Routen hinweg
* Geschätzte Abschlusszeit
* Sicherheitswert pro Pfad
* Konfidenzniveau der Schätzung

## Bridge-Administration

### Chain-Aktivierung nach dem Deployment (keine Governance)

Ab Chain-Version **v3.1.78** kann eine Bridge-Chain nach dem Deployment mit einer einzigen signierten Transaktion aktiviert und neu konfiguriert werden — ohne Governance-Vorschlag und ohne Chain-Upgrade. Ein `bridge_admin`-Key (gesetzt in `BridgeConfig.BridgeAdmin` zum Genesis-Zeitpunkt) oder ein Inhaber der `qcb_bridge`-Lizenz kann:

* **`tx bridge update-chain-config`** — die Contract-Adresse, Bestätigungsanzahl, Architektur und den Status einer Chain festlegen (`MsgUpdateChainConfig`).
* **`tx bridge set-verifier-bootstrap`** — den aktiven Verifier für eine Chain auswählen und dessen Trust Root installieren (`MsgSetVerifierBootstrap`).

Dadurch kann ein Betreiber die Bridge einer verbundenen Chain direkt online bringen — oder deren Verifier rotieren —, wobei die Autorisierung gegen den Bridge-Admin-Key geprüft wird. Ab Chain-Version **v3.2.0** besitzt das Bridge-Modul außerdem ein eigenes Modul-Konto (frühere Releases hatten keines, sodass die erste Einzahlung auf einer aktivierten Route fehlgeschlagen wäre).

Lizenzen wie `qcb_bridge` werden vom Lizenzautoritäts-Konto vergeben. Seit v3.2.3 (Mainnet) kann die Governance dieses Konto mit einem `MsgUpdateAuthority`-Vorschlag ersetzen; das Modul selbst ist unter [Chain-Lizenzierung](/architecture/chain-licensing) beschrieben.

### Validierung verbundener Netzwerke

Ab Chain-Version **v3.1.79** kann ein Validator, der die passende `validator_<chain>`-(oder `qcb_bridge`-)Lizenz hält, den Client des externen Netzwerks auf demselben Node ausführen, automatisch unter QoreChains Orchestrierung bereitgestellt, sobald die Lizenz aktiviert ist. Für alle 37 Bridge-Netzwerke werden Treiber ausgeliefert, klassifiziert nach Teilnahmemodell (permissionless Validator, gedeckelt/gewählt/Zulassung, L2-Full-Node und Non-Staking/Trust-List). Stake und Signaturschlüssel des externen Netzwerks werden vom Betreiber pro Netzwerk bereitgestellt. Siehe [Einen Validator betreiben](/developer-guide/running-a-validator#connected-networks) für die Betreiberschritte. Da jede Chain-Konfiguration `pending` ist, wird heute kein verbundenes Netzwerk über die Bridge validiert.

## REST-API-Endpunkte {#rest-api-endpoints}

Der Bridge-Zustand ist **schreibgeschützt über REST** via grpc-gateway unter dem Präfix `/qorechain/bridge/v1/...` abfragbar. Diese liefern echtes On-Chain-JSON über HTTP für Explorer und Light-Node-Telemetrie. Siehe [REST-/gRPC-Endpunkte](/api-reference/rest-grpc-endpoints#bridge-module) für die vollständige Liste.

| Methode | Endpunkt                                  | Beschreibung                                                                                                         |
| ------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| GET     | `/qorechain/bridge/v1/config`             | Konfiguration des Bridge-Moduls (`min_validators`, `attestation_threshold`, `challenge_period_secs`, `large_transfer_threshold`, `enabled`) |
| GET     | `/qorechain/bridge/v1/chains`             | Alle Chain-Konfigurationen und ihr Status                                                                           |
| GET     | `/qorechain/bridge/v1/chains/{chain_id}`  | Eine Chain-Konfiguration                                                                                            |
| GET     | `/qorechain/bridge/v1/validators`         | Registrierte Bridge-Validatoren                                                                                     |
| GET     | `/qorechain/bridge/v1/validators/{address}` | Ein Bridge-Validator                                                                                              |
| GET     | `/qorechain/bridge/v1/operations`         | Bridge-Operationen                                                                                                  |
| GET     | `/qorechain/bridge/v1/operations/{id}`    | Eine Bridge-Operation                                                                                               |

Gesperrte Beträge, Circuit-Breaker-Zustand und Routenschätzungen haben heute keine Abfrageroute.

## Bridge-Ereignisse

Das Bridge-Modul emittiert die folgenden On-Chain-Ereignisse:

| Ereignistyp                   | Beschreibung                                    |
| ----------------------------- | ----------------------------------------------- |
| `bridge_deposit`              | Neue Einzahlungsoperation erstellt              |
| `bridge_withdraw`             | Neue Auszahlungsoperation erstellt              |
| `bridge_attestation`          | Validator-Attestierung eingereicht              |
| `bridge_operation_executed`   | Operation finalisiert und ausgeführt            |
| `bridge_circuit_breaker_trip` | Circuit Breaker aktiviert oder deaktiviert      |
| `bridge_validator_registered` | Neuer Bridge-Validator registriert              |
| `bridge_pqc_verification`     | PQC-Signaturverifizierungsergebnis (IBC-Pakete) |

## Verwandt

* [Assets bridgen](/user-guide/bridging-assets) — Assets Schritt für Schritt chainübergreifend bewegen.
* [BTC-Restaking via Babylon](/architecture/btc-restaking-babylon) — Bitcoin-gestützte Sicherheit.
* [Post-Quanten-Sicherheit](/architecture/post-quantum-security) — PQC-Verifizierung bei IBC-Paketen.
