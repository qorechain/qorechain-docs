---
slug: /user-guide/token-operations
title: Token-Operationen
sidebar_label: Token-Operationen
sidebar_position: 1
---

# Token-Operationen

Dieser Leitfaden behandelt den QOR-Token, das Senden und Empfangen von Token, das Abfragen von Guthaben sowie das Verständnis des Gebührenverteilungsmodells von QoreChain.

:::note
Die folgenden Befehle verwenden das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**). Das Mainnet (**`qorechain-vladi`**, EVM-Chain-ID **9801**) ist seit dem 7. Juni 2026 live und läuft mit der Chain-Version **v3.1.92** — ersetzen Sie die Mainnet-Chain-ID und -Endpunkte von der Seite **Connecting to Mainnet**, wenn Sie im Mainnet Transaktionen durchführen.
:::

## Token-Informationen

| Eigenschaft               | Wert                          |
| ------------------------ | ----------------------------- |
| **Anzeige-Denomination**  | QOR                           |
| **Basis-Denomination**    | uqor                          |
| **Umrechnung**            | 1 QOR = 1.000.000 uqor (10^6) |
| **Chain-ID**              | `qorechain-vladi` (Mainnet) / `qorechain-diana` (Testnet) |
| **Bech32-Präfix**         | `qor` (z. B. `qor1abc...xyz`) |

Alle On-Chain-Beträge werden in **uqor** angegeben. Geben Sie beim Einreichen von Transaktionen die Beträge immer in uqor an.

## Token senden

So übertragen Sie QOR-Token von einem Konto auf ein anderes:

```bash
qorechaind tx bank send <from_address> <to_address> <amount>uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Beispiel:** Senden Sie 5 QOR (5.000.000 uqor) an eine andere Adresse:

```bash
qorechaind tx bank send qor1sender... qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Sie können für den Absender auch einen Schlüsselnamen anstelle einer rohen Adresse verwenden:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

## Guthaben abfragen

Prüfen Sie das Guthaben eines beliebigen Kontos:

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

| Ziel             | Anteil | Zweck                                                            |
| --------------- | ----- | --------------------------------------------------------------- |
| **Validatoren**  | 37%   | Belohnt Blockproduzenten und sichert das Netzwerk                |
| **Verbrannt**    | 30%   | Wird dauerhaft aus dem Umlauf entfernt und erzeugt deflationären Druck |
| **Treasury**     | 20%   | Finanziert die Protokollentwicklung und Ökosystem-Grants         |
| **Staker**       | 10%   | Proportional an alle Delegatoren verteilt                        |
| **Light Nodes**  | 3%    | Belohnt Light-Node-Betreiber, die Netzwerkdaten bereitstellen    |

## Burn-Kanäle

QoreChain implementiert einen Multi-Channel-Burn-Mechanismus. QOR-Token werden über 10 verschiedene Kanäle dauerhaft aus dem Umlauf entfernt:

| Kanal                 | Beschreibung                                                          |
| -------------------- | ---------------------------------------------------------------------- |
| `tx_fee`             | Der 30%-Burn-Anteil jeder Transaktionsgebühr                           |
| `governance_penalty` | Wird verbrannt, wenn Governance-Vorschläge das Quorum nicht erreichen oder abgelehnt werden |
| `slashing_burn`      | Verbrannter Anteil von geslashten Validator-Stakes                     |
| `bridge_fee`         | Bei Cross-Chain-Bridge-Transfers verbrannte Gebühr                     |
| `spam_deterrent`     | Zusätzlicher Burn, der auf als Spam markierte Transaktionen angewendet wird |
| `epoch_excess`       | Überschüssige Emissionen über dem Ziel, die an Epochen-Grenzen verbrannt werden |
| `manual_burn`        | Von der Community initiierte Token-Burns per Governance-Vorschlag      |
| `contract_callback`  | Bei Smart-Contract-Callback-Ausführungen verbrannte Gebühren           |
| `cross_vm_fee`       | Wird verbrannt bei der Ausführung von Cross-VM-Aufrufen (z. B. EVM zu CosmWasm) |
| `rollup_create`      | 1% des Mindest-Stakes werden beim Deployment eines neuen Rollups verbrannt |

Sie können den insgesamt über alle Kanäle verbrannten Betrag abfragen:

```bash
qorechaind query bank total --denom uqor
```

## Tipps

:::caution
Überprüfen Sie Empfängeradressen immer sorgfältig, bevor Sie Token senden. Transaktionen auf QoreChain sind unwiderruflich.
:::

:::tip

* Verwenden Sie das Flag `--dry-run`, um eine Transaktion zu simulieren, ohne sie zu übertragen.
* Verwenden Sie `--gas auto`, damit der Node das für Ihre Transaktion benötigte Gas schätzt.
* Die Mindestgebühr für eine Standardüberweisung beträgt **500 uqor**.

:::
