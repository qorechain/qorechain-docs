---
slug: /user-guide/bridging-assets
title: Assets bridgen
sidebar_label: Assets bridgen
sidebar_position: 5
---

# Assets bridgen

Diese Anleitung beschreibt, wie Assets zwischen QoreChain und anderen Blockchain-Netzwerken transferiert werden. Die Interoperabilitätsschicht von QoreChain umfasst **37 QCB-Konfigurationen (QoreChain Bridge)** (einschließlich eines QoreChain-Loopbacks) für heterogene Netzwerke sowie **8 IBC-Kanäle** für Chains im Cosmos-Ökosystem.

:::caution
Die Cross-Chain-Bridge befindet sich derzeit in einer **Testnet-/Vorproduktionsphase**. Verfügbarkeit der Verbindungen, unterstützte Assets und Finalitätsparameter können sich ändern und sollten nicht als produktionsreif betrachtet werden. Validiere alle Transfers auf **`qorechain-diana`**, bevor du dich auf sie verlässt.
:::

:::note
Die folgenden Befehle verwenden das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**). Das Mainnet (**`qorechain-vladi`**, EVM-Chain-ID **9801**) läuft seit dem 7. Juni 2026 live mit Chain-Version **v3.1.92** — ersetze die Mainnet-Chain-ID und die Endpunkte anhand der Seite **Verbindung zum Mainnet**, sofern dort Bridge-Unterstützung aktiviert wurde.
:::

---

## Verbindungsübersicht

QoreChain bietet zwei Bridging-Protokolle:

| Protokoll                                 | Verbindungen        | Anwendungsfall                                                                 |
| ---------------------------------------- | ------------------ | ------------------------------------------------------------------------ |
| **IBC** (Inter-Blockchain Communication) | 8 Kanäle         | Native Interoperabilität mit IBC-fähigen Chains                          |
| **QCB** (QoreChain Bridge)               | 37 Konfigurationen  | Cross-Chain-Transfers mit Nicht-IBC-Netzwerken über PQC-gesicherte Attestierungen |

Eine vollständige Auflistung aller QCB-Konfigurationen und IBC-Kanäle findet sich auf der Seite **Bridge-Architektur**. Diese Anleitung konzentriert sich auf die tägliche Nutzung des Bridgings.

---

## IBC-Kanäle

Die folgenden IBC-fähigen Chains haben Kanäle mit QoreChain eingerichtet:

| Chain                | Kanal     | Status |
| -------------------- | ----------- | ------ |
| Cosmos Hub           | `channel-0` | Aktiv |
| Osmosis              | `channel-1` | Aktiv |
| Noble                | `channel-2` | Aktiv |
| Celestia             | `channel-3` | Aktiv |
| Stride               | `channel-4` | Aktiv |
| Akash                | `channel-5` | Aktiv |
| Babylon              | `channel-6` | Aktiv |
| QoreChain (Loopback) | `channel-7` | Aktiv |

IBC-Transfers nutzen das Standardmodul `ibc-transfer`:

```bash
qorechaind tx ibc-transfer transfer transfer <channel> <recipient> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## QCB-Bridge-Endpunkte

Die QoreChain Bridge verbindet sich mit externen Chains aus mehreren Ökosystem-Typen. Eine repräsentative Auswahl unterstützter Netzwerke:

| Chain     | Chain-Typ | Unterstützte Assets |
| --------- | ---------- | ---------------- |
| Ethereum  | EVM        | ETH, USDC, WBTC  |
| BSC       | EVM        | BNB, USDC        |
| Solana    | Solana     | SOL, USDC        |
| Avalanche | EVM        | AVAX, USDC       |
| Polygon   | EVM        | MATIC, USDC      |
| Arbitrum  | EVM        | ETH, ARB, USDC   |
| TON       | TON        | TON              |
| Sui       | Sui Move   | SUI              |
| Optimism  | EVM        | ETH, USDC, OP    |
| Base      | EVM        | ETH, USDC        |
| Aptos     | Aptos      | APT, USDC        |
| Bitcoin   | Bitcoin    | BTC              |
| NEAR      | NEAR       | NEAR, USDC       |
| Cardano   | Cardano    | ADA              |
| Polkadot  | Polkadot   | DOT              |
| Tezos     | Tezos      | XTZ              |
| Tron      | Tron       | TRX, USDT        |

Die vollständige Liste der QCB-Konfigurationen und ihren aktuellen Rollout-Status findest du auf der Seite **Bridge-Architektur**.

---

## Einzahlungsablauf (externe Chain zu QoreChain)

Die Einzahlung von Assets von einer externen Chain in QoreChain folgt dieser Abfolge:

1. **Lock (Sperren)** — Tokens werden auf der externen Chain gesperrt, indem sie an den QCB-Bridge-Vertrag bzw. die Bridge-Adresse gesendet werden.
2. **Attestierung** — Bridge-Validatoren beobachten die Sperr-Transaktion und erzeugen PQC-signierte Attestierungen.
3. **Schwellenwert** — Sobald **7 von 10** Validator-Attestierungen vorliegen, finalisiert die Bridge die Einzahlung.
4. **Mint (Prägen)** — Die entsprechenden gewrappten Tokens werden auf QoreChain geprägt und deiner `qor1...`-Adresse gutgeschrieben.

**CLI-Befehl:**

```bash
qorechaind tx bridge deposit \
  --chain ethereum \
  --amount 1000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Auszahlungsablauf (QoreChain zu externer Chain)

Die Auszahlung von Assets von QoreChain zu einer externen Chain:

1. **Burn (Verbrennen)** — Die gewrappten Tokens werden auf QoreChain verbrannt.
2. **Attestierung** — Bridge-Validatoren beobachten den Burn-Vorgang und erzeugen PQC-signierte Attestierungen.
3. **Schwellenwert** — Sobald **7 von 10** Attestierungen vorliegen, wird die Auszahlung finalisiert.
4. **Unlock (Freigabe)** — Die ursprünglichen Tokens werden auf der externen Chain an die angegebene Zieladresse freigegeben.

**CLI-Befehl:**

```bash
qorechaind tx bridge withdraw \
  --chain ethereum \
  --amount 1000000 \
  --to 0xYourEthereumAddress \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Sicherheitsmodell

Die QoreChain Bridge wird durch mehrere Verteidigungsebenen abgesichert:

| Mechanismus                    | Beschreibung                                                                                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **7-von-10-PQC-Multisig**     | Jede Bridge-Operation erfordert Attestierungen von mindestens 7 der 10 Bridge-Validatoren, die jeweils post-quanten-kryptografische Signaturen verwenden. |
| **24-Stunden-Challenge-Periode** | Auszahlungen oberhalb eines konfigurierbaren Schwellenwerts durchlaufen ein 24-Stunden-Challenge-Fenster, in dem Validatoren oder Beobachter betrügerische Transaktionen melden können. |
| **Circuit Breaker**         | Automatisierte Ratenbegrenzer stoppen Bridge-Operationen, wenn ein ungewöhnliches Volumen oder verdächtige Muster erkannt werden. Bridge-Operationen werden nach manueller Prüfung wieder aufgenommen.  |

---

## Bridge-Status abfragen

So prüfst du den Status einer laufenden Bridge-Operation:

```bash
qorechaind query bridge pending-deposits --address <your_qor_address>
```

```bash
qorechaind query bridge pending-withdrawals --address <your_qor_address>
```

Alle aktiven Bridge-Verbindungen auflisten:

```bash
qorechaind query bridge connections
```

---

## Tipps

* Bridge-Einzahlungen werden in der Regel innerhalb weniger Minuten finalisiert, sobald die erforderlichen 7-von-10-Attestierungen vorliegen.
* Große Auszahlungen lösen automatisch die 24-Stunden-Challenge-Periode aus. Plane bei zeitkritischen Transfers entsprechend im Voraus.
* Stelle immer sicher, dass das Format der Zieladresse zur Ziel-Chain passt (z. B. `0x...` für EVM-Chains, Base58 für Solana).
* IBC-Transfers sind in der Regel schneller als QCB-Transfers, da sie native Kommunikation auf Protokollebene nutzen.
* Bridge-Gebühren werden über den `bridge_fee`-Burn-Kanal verbrannt (siehe [Token-Operationen](/user-guide/token-operations)).
