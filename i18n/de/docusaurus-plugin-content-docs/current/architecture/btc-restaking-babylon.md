---
slug: /architecture/btc-restaking-babylon
title: BTC-Restaking (Babylon)
sidebar_label: BTC-Restaking (Babylon)
sidebar_position: 11
---

# BTC-Restaking (Babylon)

Das `x/babylon`-Modul integriert QoreChain mit dem Babylon-Protokoll, um die Proof-of-Work-Finalitätsgarantien von Bitcoin zu erben. Durch BTC-Restaking gewinnt QoreChain eine sekundäre Finalitätsschicht, die durch Bitcoins Hashrate gestützt wird — ohne dass Änderungen am Bitcoin-Protokoll selbst erforderlich sind.

## Überblick

Das Babylon-Protokoll ermöglicht es Proof-of-Stake-Chains, Bitcoins Sicherheit über einen Timestamping- und Checkpointing-Mechanismus zu nutzen. QoreChains Integration funktioniert wie folgt:

1. **BTC-Staker** sperren Bitcoin in Babylon-Staking-Transaktionen und registrieren ihre Positionen auf QoreChain.
2. **Epoch-Checkpoints** von QoreChain werden periodisch an Babylon relayed, das sie auf Bitcoin mit einem Zeitstempel versieht.
3. **Finalitätsvererbung**: Sobald eine QoreChain-Epoche auf Bitcoin gecheckpointed ist, erbt der von dieser Epoche abgedeckte Zustand die Proof-of-Work-Finalitätsgarantien von Bitcoin.

Dies bietet einen Schutz gegen Long-Range-Angriffe und Equivocation, der in Bitcoins akkumulierter Hashrate verankert ist, anstatt sich ausschließlich auf QoreChains eigenes Validatoren-Set zu verlassen.

## BTC-Staking-Positionen

Nutzer können BTC-Staking-Positionen auf QoreChain registrieren, indem sie eine `MsgBTCRestake`-Transaktion einreichen, die auf eine Bitcoin-Staking-Transaktion verweist.

### Registrierungsanforderungen

| Parameter               | Wert                          | Beschreibung                                       |
| ----------------------- | ----------------------------- | ------------------------------------------------- |
| **Mindest-Stake**       | 100.000 Satoshis (0,001 BTC)  | Minimal erforderliche BTC pro Staking-Position    |
| **Unbonding-Periode**   | 144 BTC-Blöcke (\~1 Tag)      | Wartezeit, bevor gestaketes BTC abgehoben werden kann |
| **Checkpoint-Intervall**| Alle 10 QoreChain-Epochen     | Wie oft der Zustand zu Babylon gecheckpointed wird |

### Struktur einer Staking-Position

Jede BTC-Staking-Position verfolgt den folgenden On-Chain-Zustand:

| Feld               | Beschreibung                                                    |
| ------------------ | --------------------------------------------------------------- |
| `staker_address`   | QoreChain-Adresse des Stakers (`qor1...`)                       |
| `btc_tx_hash`      | Bitcoin-Transaktions-Hash der Staking-Transaktion              |
| `amount_satoshis`  | Menge des gestaketen BTC in Satoshis                            |
| `status`           | Lebenszyklusstatus der Position: `active`, `unbonding` oder `withdrawn` |
| `staked_at`        | Zeitstempel der Positionsregistrierung                          |
| `unbonding_height` | Blockhöhe, bei der das Unbonding initiiert wurde (falls zutreffend) |
| `validator_addr`   | QoreChain-Validator-Adresse, an die dieser Stake delegiert ist  |

### Registrierungsablauf

1. **BTC-Staking-Transaktion erstellen** — Erstellen Sie im Bitcoin-Netzwerk die BTC-Staking-Transaktion.
2. **MsgBTCRestake auf QoreChain einreichen** — Reichen Sie auf QoreChain `MsgBTCRestake` mit `btc_tx_hash`, `amount` und `validator` ein.
3. **Position erfasst** — Die Position wird On-Chain als „active" erfasst.

## Epoch-Checkpoints

Die Epoch-State-Roots von QoreChain werden über die Babylon-Relay-Chain periodisch auf Bitcoin gecheckpointed.

### Checkpoint-Ablauf

1. **Checkpoint einreichen** — Ein QoreChain-Validator reicht `MsgSubmitBTCCheckpoint` ein, das die Epochennummer, den BTC-Block-Hash, die BTC-Blockhöhe und den QoreChain-State-Root enthält.
2. **IBC-Relay** — Die Checkpoint-Daten werden über IBC an die Babylon-Chain relayed.
3. **Timestamping auf Bitcoin** — Babylon nimmt den Checkpoint in eine Bitcoin-Transaktion auf und verankert so QoreChains Zustand in Bitcoins Blockchain.
4. **Bestätigung** — Sobald die Bitcoin-Transaktion bestätigt ist, fließt die Finalität über Babylon zurück zu QoreChain.
5. **Finalisierung** — Der Checkpoint-Status wechselt von `pending` zu `confirmed` zu `finalized`.

### Checkpoint-Struktur

| Feld               | Beschreibung                                              |
| ------------------ | -------------------------------------------------------- |
| `epoch_num`        | QoreChain-Epochennummer, die gecheckpointed wird          |
| `btc_block_hash`   | Bitcoin-Block-Hash, der den Checkpoint enthält            |
| `btc_block_height` | Bitcoin-Blockhöhe                                         |
| `state_root`       | QoreChain-State-Root an der Epochengrenze                 |
| `submitted_at`     | Zeitstempel der Checkpoint-Einreichung                    |
| `status`           | Checkpoint-Status: `pending`, `confirmed` oder `finalized` |

### Epoch-Snapshots

An jeder Checkpoint-Grenze erfasst ein Epoch-Snapshot den aggregierten Netzwerkzustand:

| Feld               | Beschreibung                                      |
| ------------------ | ------------------------------------------------ |
| `total_staked`     | Gesamt gestaketes BTC über alle Positionen (Satoshis) |
| `active_positions` | Anzahl der aktiven Staking-Positionen            |
| `validator_count`  | Anzahl der Validatoren mit BTC-gestützten Delegationen |
| `block_height`     | QoreChain-Blockhöhe zum Zeitpunkt des Snapshots  |

## Sekundäre Finalitätsschicht

Die Babylon-Integration bietet eine **sekundäre Finalitätsgarantie**, die QoreChains native Konsensfinalität ergänzt:

| Finalitätsschicht | Quelle                     | Geschwindigkeit | Sicherheit                              |
| ----------------- | -------------------------- | --------------- | --------------------------------------- |
| **Primär**        | QoreChain Consensus Engine | \~5 Sekunden    | Gestützt durch QOR-Stake + PQC-Signaturen |
| **Sekundär**      | Babylon + Bitcoin          | \~60 Minuten    | Gestützt durch Bitcoins kumulative Hashrate |

Die sekundäre Schicht ist besonders wertvoll für:

* **Verhinderung von Long-Range-Angriffen**: Selbst wenn ein Angreifer erheblichen QOR-Stake akkumuliert, kann er keine Historie umschreiben, die auf Bitcoin gecheckpointed wurde.
* **Cross-Chain-Bridge-Sicherheit**: Bridge-Operationen mit hohen Werten können auf Finalität auf Bitcoin-Ebene warten, bevor Mittel freigegeben werden.
* **Institutionelles Vertrauen**: Der Bitcoin-Zeitstempel bietet einen unabhängig verifizierbaren Nachweis von QoreChains Zustandshistorie.

## Konfiguration

| Parameter             | Standard         | Beschreibung                               |
| --------------------- | ---------------- | ------------------------------------------ |
| `enabled`             | `false`          | Hauptschalter für BTC-Restaking-Funktionen |
| `min_stake_amount`    | 100.000 Satoshis | Minimale BTC pro Staking-Position          |
| `unbonding_period`    | 144 BTC-Blöcke   | BTC-denominierte Unbonding-Dauer           |
| `checkpoint_interval` | 10 Epochen       | Epochen zwischen Babylon-Checkpoints       |
| `babylon_chain_id`    | `bbn-1`          | Chain-ID des verbundenen Babylon-Netzwerks |

## Ereignisse

Das Modul gibt die folgenden On-Chain-Ereignisse aus:

| Ereignistyp              | Attribute                                | Beschreibung                                   |
| ------------------------ | ---------------------------------------- | ---------------------------------------------- |
| `btc_restake`            | staker, btc\_tx\_hash, amount, validator | Neue BTC-Staking-Position registriert          |
| `btc_unbond`             | staker, amount                           | BTC-Staking-Position in Unbonding übergegangen |
| `btc_checkpoint`         | epoch, checkpoint\_id                    | Epoch-Checkpoint an Babylon eingereicht        |
| `babylon_epoch_complete` | epoch                                    | Babylon-Epoche mit Bitcoin-Zeitstempel finalisiert |

## API-Endpunkte

### REST

| Methode | Endpunkt                         | Beschreibung                              |
| ------- | -------------------------------- | ---------------------------------------- |
| GET     | `/babylon/v1/staking/{address}`  | BTC-Staking-Positionen für eine Adresse abrufen |
| GET     | `/babylon/v1/checkpoint/{epoch}` | Checkpoint-Daten für eine bestimmte Epoche abrufen |
| GET     | `/babylon/v1/params`             | Modul-Konfigurationsparameter abrufen    |

### JSON-RPC

| Methode                     | Parameter          | Beschreibung                                                    |
| --------------------------- | ------------------ | -------------------------------------------------------------- |
| `qor_getBTCStakingPosition` | `address` (string) | Gibt die BTC-Staking-Position für die angegebene QoreChain-Adresse zurück |

## CLI-Befehle

### Abfragebefehle

```bash
# Query BTC restaking configuration
qorechaind query babylon config

# Query a staking position by address
qorechaind query babylon position <staker-address>
```

### Transaktionsbefehle

```bash
# Register a BTC restaking position
qorechaind tx babylon restake \
  --btc-tx-hash <hash> \
  --amount-satoshis <amount> \
  --validator <qorvaloper1...> \
  --from <key-name>

# Submit a BTC checkpoint
qorechaind tx babylon submit-checkpoint \
  --epoch <epoch-number> \
  --btc-block-hash <hash> \
  --btc-block-height <height> \
  --state-root <root> \
  --from <key-name>
```
