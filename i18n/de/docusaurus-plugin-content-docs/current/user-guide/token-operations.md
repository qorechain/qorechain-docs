---
slug: /user-guide/token-operations
title: Token-Operationen
sidebar_label: Token-Operationen
sidebar_position: 1
---

# Token-Operationen

Dieser Leitfaden behandelt den QOR-Token, das Senden und Empfangen von Token, das Abfragen von Guthaben sowie das Verständnis des Gebührenverteilungsmodells auf QoreChain.

:::note
Die nachstehenden Befehle verwenden das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**). Das Mainnet (**`qorechain-vladi`**, EVM-Chain-ID **9801**) ist seit dem 7. Juni 2026 live und läuft mit Chain-Version **v3.1.82** — ersetze für Transaktionen im Mainnet die Mainnet-Chain-ID und die Endpunkte von der Seite **Verbindung zum Mainnet herstellen**.
:::

## Token-Informationen

| Eigenschaft              | Wert                          |
| ------------------------ | ----------------------------- |
| **Anzeige-Denomination** | QOR                           |
| **Basis-Denomination**   | uqor                          |
| **Umrechnung**           | 1 QOR = 1.000.000 uqor (10^6) |
| **Chain-ID**             | `qorechain-vladi` (Mainnet) / `qorechain-diana` (Testnet) |
| **Bech32-Präfix**        | `qor` (z. B. `qor1abc...xyz`) |

Alle On-Chain-Beträge werden in **uqor** angegeben. Gib bei der Übermittlung von Transaktionen Beträge immer in uqor an.

## Token senden

So überträgst du QOR-Token von einem Konto auf ein anderes:

```bash
qorechaind tx bank send <from_address> <to_address> <amount>uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Beispiel:** Sende 5 QOR (5.000.000 uqor) an eine andere Adresse:

```bash
qorechaind tx bank send qor1sender... qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Du kannst für den Absender auch einen Schlüsselnamen anstelle einer Rohadresse verwenden:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

## Guthaben abfragen

Prüfe das Guthaben eines beliebigen Kontos:

```bash
qorechaind query bank balances <address>
```

**Beispiel:**

```bash
qorechaind query bank balances qor1abc...xyz
```

**Beispielausgabe:**

```yaml
balances:
- amount: "15000000"
  denom: uqor
pagination:
  next_key: null
  total: "0"
```

Dies zeigt an, dass das Konto 15 QOR (15.000.000 uqor) hält.

## Gebührenstruktur

Transaktionsgebühren auf QoreChain werden auf fünf Ziele verteilt, um die Netzwerkanreize aufeinander abzustimmen:

| Ziel            | Anteil | Zweck                                                           |
| --------------- | ------ | -------------------------------------------------------------- |
| **Validatoren** | 37 %   | Belohnt Block-Produzenten und sichert das Netzwerk             |
| **Verbrannt**   | 30 %   | Dauerhaft aus dem Angebot entfernt, erzeugt deflationären Druck |
| **Treasury**    | 20 %   | Finanziert Protokollentwicklung und Ökosystem-Förderungen     |
| **Staker**      | 10 %   | Anteilig an alle Delegatoren verteilt                          |
| **Light-Nodes** | 3 %    | Belohnt Light-Node-Betreiber, die Netzwerkdaten bereitstellen  |

## Burn-Kanäle

QoreChain implementiert einen Mehrkanal-Burn-Mechanismus. QOR-Token werden über 10 unterschiedliche Kanäle dauerhaft aus dem Umlauf entfernt:

| Kanal                | Beschreibung                                                        |
| -------------------- | ------------------------------------------------------------------- |
| `tx_fee`             | Der 30-%-Burn-Anteil jeder Transaktionsgebühr                       |
| `governance_penalty` | Verbrannt, wenn Governance-Vorschläge das Quorum nicht erreichen oder per Veto abgelehnt werden |
| `slashing_burn`      | Verbrannter Anteil geslashter Validator-Stakes                      |
| `bridge_fee`         | Bei Cross-Chain-Bridge-Übertragungen verbrannte Gebühr             |
| `spam_deterrent`     | Zusätzliche Verbrennung für als Spam markierte Transaktionen        |
| `epoch_excess`       | Überschüssige Emissionen über dem Ziel werden an Epoch-Grenzen verbrannt |
| `manual_burn`        | Von der Community per Governance-Vorschlag initiierte Token-Burns   |
| `contract_callback`  | Bei Smart-Contract-Callback-Ausführungen verbrannte Gebühren        |
| `cross_vm_fee`       | Verbrannt bei der Ausführung von Cross-VM-Aufrufen (z. B. EVM zu CosmWasm) |
| `rollup_create`      | 1 % des Mindest-Stakes, verbrannt beim Deployment eines neuen Rollups |

Du kannst den über alle Kanäle insgesamt verbrannten Betrag abfragen:

```bash
qorechaind query bank total --denom uqor
```

## Tipps

:::caution
Überprüfe Empfängeradressen immer doppelt, bevor du Token sendest. Transaktionen auf QoreChain sind unumkehrbar.
:::

:::tip

* Verwende das Flag `--dry-run`, um eine Transaktion zu simulieren, ohne sie zu übertragen.
* Verwende `--gas auto`, damit die Node das für deine Transaktion erforderliche Gas schätzt.
* Die Mindestgebühr für eine Standardübertragung beträgt **500 uqor**.

:::
