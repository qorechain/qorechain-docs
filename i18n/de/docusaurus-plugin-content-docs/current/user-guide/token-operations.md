---
slug: /user-guide/token-operations
title: Token-Operationen
sidebar_label: Token-Operationen
sidebar_position: 1
---

# Token-Operationen

Dieser Leitfaden behandelt den QOR-Token, das Senden und Empfangen von Token, das Abfragen von Guthaben sowie das Verständnis des Gebührenverteilungsmodells von QoreChain.

:::note
Die folgenden Befehle verwenden das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**). Das Mainnet (**`qorechain-vladi`**, EVM-Chain-ID **9801**) ist seit dem 29. Juni 2026 live und läuft auf der v3.2-Linie (Node-Release **v3.2.1**; das Testnet läuft mit **v3.2.2**) — ersetzen Sie die Mainnet-Chain-ID und -Endpunkte von der Seite **Connecting to Mainnet**, wenn Sie im Mainnet Transaktionen durchführen.
:::

:::caution Mit `tx pqc cosign` signieren
Mainnet und Testnet verlangen bei jeder Transaktion auf der Cosmos-Lane eine hybride Post-Quanten-Signatur, daher werden die Befehle auf dieser Seite so, wie sie dastehen, nicht übertragen. Hängen Sie `--generate-only > tx.json` an einen Befehl an und führen Sie dann `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>` aus. Siehe [Hybrides Signieren](/cli-reference/transaction-commands#hybrid-signing). [QoreX](/qorex/overview) und das [Dashboard](/dashboard/overview) übernehmen dieses Signieren für Sie.
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
  --gas 400000 --fees 40000uqor
```

**Beispiel:** Senden Sie 5 QOR (5.000.000 uqor) an eine andere Adresse:

```bash
qorechaind tx bank send qor1sender... qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

Sie können für den Absender auch einen Schlüsselnamen anstelle einer rohen Adresse verwenden:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
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
| **Verbrannt**    | 30%   | Wird dauerhaft aus dem Umlauf entfernt                           |
| **Treasury**     | 20%   | Finanziert die Protokollentwicklung und Ökosystem-Grants         |
| **Staker**       | 10%   | Proportional an alle Delegatoren verteilt                        |
| **Light Nodes**  | 3%    | Für Light-Node-Belohnungen reserviert (siehe Hinweis unten)      |

Die Aufteilung gilt für alles, was in den Fee Collector fließt, der die Transaktionsgebühren und die in jeder Epoche geprägte Staking-Emission enthält. Der Light-Node-Anteil sammelt sich in einer Reserve an; die Registrierung für Light-Node-Belohnungen ist noch nicht geöffnet, daher wird derzeit kein Node daraus bezahlt (siehe [Light Node](/light-node/overview)). Seit dem Upgrade v3.2.0 wird der Staker-Anteil als normale Staking-Belohnung ausgezahlt (siehe [Tokenomics](/architecture/tokenomics#stranded-and-reserve)).

## Burn-Kanäle

Das Burn-Modul von QoreChain definiert 12 Burn-Quellen. QOR, das über eine davon verbrannt wird, wird dauerhaft aus dem Umlauf entfernt. Im Mainnet hat bisher nur der Gas-Gebühren-Kanal Burns verzeichnet; die anderen sind definiert, haben aber nichts verzeichnet.

| Kanal               | Beschreibung                                                                      |
| ------------------ | -------------------------------------------------------------------------------- |
| `gas_fee`          | 30% aller Gas-Gebühren werden verbrannt                                          |
| `contract_create`  | Pauschale Gebühr von 100 QOR wird pro Contract-Erstellung verbrannt (inaktiv: der CosmWasm-Upload ist geschlossen) |
| `ai_service`       | 50% der KI-Dienstgebühren werden verbrannt (inaktiv: KI-Dienstgebühren sind nicht live) |
| `bridge_fee`       | 100% der Bridge-Gebühren werden verbrannt (inaktiv: die Bridge ist nicht live)   |
| `treasury_buyback` | Periodischer Buyback-and-Burn aus der Treasury                                   |
| `failed_tx`        | Gas fehlgeschlagener Transaktionen; wird von der Chain ab v3.2.2 angewendet (bisher nur im Testnet) |
| `xqore_penalty`    | xQORE-Strafen für vorzeitigen Ausstieg, die über Burn geleitet werden (xQORE ist nicht live) |
| `auto_buyback`     | Automatisierte Burns auf Protokollebene (inaktiv)                                |
| `tge`              | Reserviert; der TGE-Burn fand vor dem Genesis statt, und dieser Kanal verzeichnet nichts |
| `rollup_create`    | 1% des Rollup-Erstellungs-Stakes werden verbrannt                                |
| `milestone`        | Geplante Burns bei festen kumulativen Transaktionszahlen (bisher keiner ausgelöst) |
| `amm`              | Reserviert für AMM-Protokollgebühren (keine verzeichnet)                         |

Das Burn-Modul hat keine CLI-Abfrage; lesen Sie den kumulativen Burn je Quelle über REST:

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stats
```

Die Antwort listet `total_burned` und `burns_by_source` (in uqor) auf. Das aktuelle Gesamtangebot liefert `qorechaind query bank total-supply-of uqor`.

## Tipps

:::caution
Überprüfen Sie Empfängeradressen immer sorgfältig, bevor Sie Token senden. Transaktionen auf QoreChain sind unwiderruflich.
:::

:::tip

* Verwenden Sie das Flag `--dry-run`, um eine Transaktion zu simulieren, ohne sie zu übertragen.
* Setzen Sie `--gas` explizit (400.000 genügen für eine hybrid signierte Überweisung).
* Die Gebühren-Untergrenze beträgt **0,1 uqor pro Gaseinheit**, ein Gaslimit von 400.000 erfordert also mindestens **40.000 uqor**.

:::
