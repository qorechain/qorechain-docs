---
slug: /user-guide/bridging-assets
title: Assets bridgen
sidebar_label: Assets bridgen
sidebar_position: 5
---

# Assets bridgen

Dieser Leitfaden beschreibt, wie Sie Assets zwischen QoreChain und anderen Blockchain-Netzwerken bewegen. Die Interoperabilitätsschicht von QoreChain umfasst **37 QCB-Konfigurationen (QoreChain Bridge)** (einschließlich eines QoreChain-Loopbacks) für heterogene Netzwerke sowie **8 IBC-Kanäle** für Chains des Cosmos-Ökosystems.

:::caution
Die Cross-Chain-Bridge befindet sich derzeit in einer **Testnet-/Vorproduktionsphase**. Verbindungsverfügbarkeit, unterstützte Assets und Finalitätsparameter können sich ändern und sollten nicht als produktionsreif betrachtet werden. Validieren Sie alle Transfers auf **`qorechain-diana`**, bevor Sie sich darauf verlassen.
:::

:::note
Die nachfolgenden Befehle verwenden das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**). Das Mainnet (**`qorechain-vladi`**, EVM-Chain-ID **9801**) ist seit dem 7. Juni 2026 live und läuft mit der Chain-Version **v3.1.80** — ersetzen Sie die Mainnet-Chain-ID und die Endpunkte aus der Seite **Mit dem Mainnet verbinden**, sobald dort Bridge-Unterstützung aktiviert wurde.
:::

---

## Verbindungsübersicht

QoreChain bietet zwei Bridging-Protokolle:

| Protokoll                                | Verbindungen       | Anwendungsfall                                                                 |
| ---------------------------------------- | ------------------ | ------------------------------------------------------------------------ |
| **IBC** (Inter-Blockchain Communication) | 8 Kanäle           | Native Interoperabilität mit IBC-fähigen Chains                          |
| **QCB** (QoreChain Bridge)               | 37 Konfigurationen | Cross-Chain-Transfers mit Nicht-IBC-Netzwerken über PQC-gesicherte Attestierungen |

Eine vollständige Auflistung jeder QCB-Konfiguration und jedes IBC-Kanals befindet sich auf der Seite **Bridge-Architektur**. Dieser Leitfaden konzentriert sich auf die alltägliche Nutzung des Bridgings.

---

## IBC-Kanäle

Die folgenden IBC-fähigen Chains haben Kanäle mit QoreChain eingerichtet:

| Chain                | Kanal       | Status |
| -------------------- | ----------- | ------ |
| Cosmos Hub           | `channel-0` | Aktiv  |
| Osmosis              | `channel-1` | Aktiv  |
| Noble                | `channel-2` | Aktiv  |
| Celestia             | `channel-3` | Aktiv  |
| Stride               | `channel-4` | Aktiv  |
| Akash                | `channel-5` | Aktiv  |
| Babylon              | `channel-6` | Aktiv  |
| QoreChain (Loopback) | `channel-7` | Aktiv  |

IBC-Transfers verwenden das Standard-`ibc-transfer`-Modul:

```bash
qorechaind tx ibc-transfer transfer transfer <channel> <recipient> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## QCB-Bridge-Endpunkte

Die QoreChain Bridge verbindet sich mit externen Chains, die mehrere Ökosystemtypen umspannen. Eine repräsentative Auswahl unterstützter Netzwerke:

| Chain     | Chain-Typ  | Unterstützte Assets |
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

Siehe die Seite **Bridge-Architektur** für die vollständige Liste der QCB-Konfigurationen und ihren aktuellen Rollout-Status.

---

## Einzahlungsablauf (externe Chain zu QoreChain)

Das Einzahlen von Assets von einer externen Chain in QoreChain folgt dieser Abfolge:

1. **Lock** — Sperren Sie Token auf der externen Chain, indem Sie sie an den QCB-Bridge-Contract oder die -Adresse senden.
2. **Attestierung** — Bridge-Validatoren beobachten die Sperrtransaktion und erstellen PQC-signierte Attestierungen.
3. **Schwellenwert** — Sobald **7 von 10** Validator-Attestierungen gesammelt sind, finalisiert die Bridge die Einzahlung.
4. **Mint** — Die entsprechenden gewrappten Token werden auf QoreChain geprägt und Ihrer `qor1...`-Adresse gutgeschrieben.

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

Das Auszahlen von Assets von QoreChain auf eine externe Chain:

1. **Burn** — Verbrennen Sie die gewrappten Token auf QoreChain.
2. **Attestierung** — Bridge-Validatoren beobachten den Burn und erstellen PQC-signierte Attestierungen.
3. **Schwellenwert** — Sobald **7 von 10** Attestierungen gesammelt sind, wird die Auszahlung finalisiert.
4. **Unlock** — Die ursprünglichen Token werden auf der externen Chain an die angegebene Zieladresse freigegeben.

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

Die QoreChain Bridge ist durch mehrere Verteidigungsschichten gesichert:

| Mechanismus                  | Beschreibung                                                                                                                                          |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **7-von-10-PQC-Multisig**    | Jede Bridge-Operation erfordert Attestierungen von mindestens 7 von 10 Bridge-Validatoren, die jeweils Post-Quanten-kryptografische Signaturen verwenden. |
| **24-Stunden-Anfechtungsperiode** | Auszahlungen, die einen konfigurierbaren Schwellenwert überschreiten, durchlaufen ein 24-stündiges Anfechtungsfenster, in dem Validatoren oder Watcher betrügerische Transaktionen melden können. |
| **Circuit Breaker**          | Automatisierte Ratenbegrenzer stoppen Bridge-Operationen, wenn ungewöhnliches Volumen oder verdächtige Muster erkannt werden. Bridge-Operationen werden nach manueller Überprüfung fortgesetzt.  |

---

## Bridge-Status abfragen

Prüfen Sie den Status einer ausstehenden Bridge-Operation:

```bash
qorechaind query bridge pending-deposits --address <your_qor_address>
```

```bash
qorechaind query bridge pending-withdrawals --address <your_qor_address>
```

Listen Sie alle aktiven Bridge-Verbindungen auf:

```bash
qorechaind query bridge connections
```

---

## Tipps

* Bridge-Einzahlungen werden in der Regel innerhalb von Minuten finalisiert, sobald die erforderlichen 7-von-10-Attestierungen gesammelt sind.
* Große Auszahlungen lösen automatisch die 24-Stunden-Anfechtungsperiode aus. Planen Sie zeitkritische Transfers entsprechend voraus.
* Überprüfen Sie stets, ob das Format der Zieladresse mit der Ziel-Chain übereinstimmt (z. B. `0x...` für EVM-Chains, base58 für Solana).
* IBC-Transfers sind im Allgemeinen schneller als QCB-Transfers, da sie native Kommunikation auf Protokollebene verwenden.
* Bridge-Gebühren werden über den `bridge_fee`-Burn-Kanal verbrannt (siehe [Token-Operationen](/user-guide/token-operations)).
