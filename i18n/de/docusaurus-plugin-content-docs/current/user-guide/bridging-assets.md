---
slug: /user-guide/bridging-assets
title: Assets bridgen
sidebar_label: Assets bridgen
sidebar_position: 5
---

# Assets bridgen

Diese Anleitung beschreibt, wie der Transfer von Assets zwischen QoreChain und anderen Blockchain-Netzwerken gedacht ist. Die Interoperabilitätsschicht von QoreChain ist um **37 Chain-Konfigurationen** (36 externe Chains plus Injective, erreichbar über IBC) und bis zu **8 IBC-Gegenparteien** für Chains im Cosmos-Ökosystem aufgebaut.

:::caution Auf keinem der beiden Netzwerke live
Das Bridge-Modul ist auf Mainnet und Testnet bereitgestellt, aber **keine Bridge-Route ist aktiv**: Alle 37 Chain-Konfigurationen haben den Status `pending`, ohne gesetzten Bridge-Vertrag, es sind keine Bridge-Validatoren registriert, es wurde nie eine Bridge-Operation erstellt, und es existieren weder IBC-Kanäle noch IBC-Clients. Alles Folgende beschreibt das beabsichtigte Design. Senden Sie keine Assets in der Erwartung, dass sie gebridgt werden. Die aktuelle Statustabelle finden Sie unter [Bridge-Architektur](/architecture/bridge-architecture#current-status).
:::

:::note
Die folgenden Befehle verwenden das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**, Chain-Version **v3.2.4**). Das Mainnet (**`qorechain-vladi`**, EVM-Chain-ID **9801**) läuft mit Chain-Version **v3.2.3**. Ersetze die Mainnet-Chain-ID und die Endpunkte anhand der Seite **Verbindung zum Mainnet**, sobald eine Route aktiviert ist. Status geprüft am 20. Oktober 2026: Alle 37 Chain-Konfigurationen sind auf beiden Netzwerken `pending`.
:::

---

## Verbindungsübersicht

QoreChain ist darauf ausgelegt, zwei Bridging-Protokolle bereitzustellen:

| Protokoll                                 | Verbindungen        | Anwendungsfall                                                                 |
| ---------------------------------------- | ------------------ | ------------------------------------------------------------------------ |
| **IBC** (Inter-Blockchain Communication) | bis zu 8 Kanäle (keiner offen) | Native Interoperabilität mit IBC-fähigen Chains                          |
| **QCB** (QoreChain Bridge)               | 37 Konfigurationen (alle pending) | Cross-Chain-Transfers mit Nicht-IBC-Netzwerken über PQC-gesicherte Attestierungen |

Eine vollständige Auflistung aller Chain-Konfigurationen findet sich auf der Seite **Bridge-Architektur**. Diese Anleitung konzentriert sich darauf, wie ein Bridge-Transfer gedacht ist.

---

## IBC

IBC ist Teil des Designs (Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon, Injective), aber **auf keinem der beiden Netzwerke existiert bisher ein IBC-Kanal oder IBC-Client**, sodass es nichts zu transferieren gibt. Diese Seite wird die Kanäle auflisten, sobald sie geöffnet sind.

---

## QCB-Bridge-Endpunkte

Die QoreChain Bridge soll sich mit externen Chains aus mehreren Ökosystem-Typen verbinden. Eine repräsentative Auswahl der geplanten Verbindungen (jede davon ist heute `pending`):

| Chain     | Chain-Typ |
| --------- | ---------- |
| Ethereum  | EVM        |
| BSC       | EVM        |
| Solana    | Solana     |
| Avalanche | EVM        |
| Polygon   | EVM        |
| Arbitrum  | EVM        |
| TON       | TON        |
| Sui       | Sui Move   |
| Optimism  | EVM        |
| Base      | EVM        |
| Aptos     | Aptos      |
| Bitcoin   | Bitcoin    |
| NEAR      | NEAR       |
| Cardano   | Cardano    |
| Polkadot  | Polkadot   |
| Tezos     | Tezos      |
| Tron      | Tron       |

Es wird keine Asset-Liste veröffentlicht: Die Chain-Konfigurationen enthalten noch kein Asset-Register. Die vollständige Liste der Chain-Konfigurationen finden Sie auf der Seite **Bridge-Architektur**.

---

## Einzahlungsablauf (externe Chain zu QoreChain)

Die vorgesehene Abfolge für eine Einzahlung von einer externen Chain in QoreChain:

1. **Lock (Sperren)** — Tokens werden auf der externen Chain gesperrt, indem sie an den QCB-Bridge-Vertrag bzw. die Bridge-Adresse gesendet werden.
2. **Attestierung** — Bridge-Validatoren beobachten die Sperr-Transaktion und erzeugen PQC-signierte Attestierungen.
3. **Schwellenwert** — Sobald **7 von 10** Validator-Attestierungen vorliegen, finalisiert die Bridge die Einzahlung.
4. **Mint (Prägen)** — Die entsprechenden gewrappten Tokens werden auf QoreChain geprägt und deiner `qor1...`-Adresse gutgeschrieben.

Es gibt keinen vom Nutzer auszuführenden Befehl „Einzahlung starten": Du sperrst auf der externen Chain, und die Attestierungen der Bridge-Validatoren schreiben deinem Konto den Betrag gut. (Der Chain-Befehl `qorechaind tx bridge deposit` schreibt eine bereits attestierte Einzahlung gut und benötigt Signaturen der Bridge-Validatoren; er ist nicht der Weg, auf dem ein Nutzer eine Einzahlung beginnt.)

---

## Auszahlungsablauf (QoreChain zu externer Chain)

Die vorgesehene Abfolge für eine Auszahlung von QoreChain zu einer externen Chain:

1. **Burn (Verbrennen)** — Die gewrappten Tokens werden auf QoreChain verbrannt.
2. **Attestierung** — Bridge-Validatoren beobachten den Burn-Vorgang und erzeugen PQC-signierte Attestierungen.
3. **Schwellenwert** — Sobald **7 von 10** Attestierungen vorliegen, wird die Auszahlung finalisiert.
4. **Unlock (Freigabe)** — Die ursprünglichen Tokens werden auf der externen Chain an die angegebene Zieladresse freigegeben.

**CLI-Befehl** (heute blockiert: Keine Chain ist aktiv, daher würde die Transaktion abgelehnt):

```bash
# 1. Build the unsigned transaction
qorechaind tx bridge withdraw [destination-chain] [destination-address] [asset] [amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 300000 --fees 30000uqor \
  --generate-only > withdraw.json

# 2. Attach the post-quantum co-signature and broadcast
qorechaind tx pqc cosign withdraw.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

Jede Transaktion auf der Native-Lane benötigt die hybride Post-Quanten-Mitsignatur und eine Gebühr von mindestens 0,1 uqor pro Gas-Einheit; siehe [Erste Transaktion](/getting-started/first-transaction).

---

## Sicherheitsmodell

Die QoreChain Bridge soll durch mehrere Verteidigungsebenen abgesichert werden:

| Mechanismus                    | Beschreibung                                                                                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **7-von-10-PQC-Multisig**     | Jede Bridge-Operation erfordert Attestierungen von mindestens 7 der 10 Bridge-Validatoren, die jeweils post-quanten-kryptografische Signaturen verwenden. |
| **24-Stunden-Challenge-Periode** | Transfers oberhalb des Schwellenwerts für große Transfers (100.000 QOR) durchlaufen ein 24-Stunden-Challenge-Fenster, in dem Validatoren oder Beobachter betrügerische Transaktionen melden können. |
| **Circuit Breaker**         | Automatisierte Ratenbegrenzer stoppen Bridge-Operationen, wenn ein ungewöhnliches Volumen oder verdächtige Muster erkannt werden. Bridge-Operationen werden nach manueller Prüfung wieder aufgenommen.  |

---

## Bridge-Status abfragen

So liest du den Zustand der Bridge:

```bash
qorechaind query bridge config
qorechaind query bridge chains
qorechaind query bridge chain ethereum
qorechaind query bridge validators
qorechaind query bridge operations
qorechaind query bridge operation [id]
```

Dieselben Daten sind über REST unter `/qorechain/bridge/v1/` verfügbar (siehe [Bridge-Architektur](/architecture/bridge-architecture#rest-api-endpoints)).

---

## Tipps

* Stelle immer sicher, dass das Format der Zieladresse zur Ziel-Chain passt (z. B. `0x...` für EVM-Chains, Base58 für Solana).
* Große Transfers (über 100.000 QOR) sollen die 24-Stunden-Challenge-Periode automatisch auslösen.
* Bridge-Gebühren werden über den `bridge_fee`-Burn-Kanal verbrannt (siehe [Token-Operationen](/user-guide/token-operations)).
