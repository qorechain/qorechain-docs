---
slug: /user-guide/gas-abstraction
title: Gas-Abstraktion
sidebar_label: Gas-Abstraktion
sidebar_position: 7
---

# Gas-Abstraktion

Dieser Leitfaden beschreibt die Gas-Abstraktionsfunktion von QoreChain, die es Nutzern ermöglicht, Transaktionsgebühren in nicht-nativen Token statt in QOR zu bezahlen.

:::note
Die nachfolgenden Befehle verwenden das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**). Das Mainnet (**`qorechain-vladi`**, EVM-Chain-ID **9801**) ist seit dem 7. Juni 2026 live und läuft mit der Chain-Version **v3.1.82** — ersetzen Sie die Mainnet-Chain-ID und die Endpunkte aus der Seite **Mit dem Mainnet verbinden**, wenn Sie auf dem Mainnet transagieren.
:::

---

## Überblick

Die Gas-Abstraktion beseitigt die Anforderung, QOR-Token zur Bezahlung von Transaktionsgebühren zu halten. Nutzer, die akzeptierte alternative Token halten (etwa per IBC transferiertes USDC oder ATOM), können diese Token direkt zur Gebührenzahlung verwenden. Das Protokoll wandelt den Gebührenbetrag automatisch in sein natives Äquivalent um, bevor es verarbeitet wird.

---

## Akzeptierte Token

Die folgenden Token werden zur Gebührenzahlung akzeptiert:

| Token              | Denomination | Umrechnungskurs | Beispielgebühr       |
| ------------------ | ------------ | --------------- | -------------------- |
| **QOR**            | `uqor`       | 1.0 (nativ)     | `--fees 500uqor`     |
| **USDC** (via IBC) | `ibc/USDC`   | 1.0             | `--fees 500ibc/USDC` |
| **ATOM** (via IBC) | `ibc/ATOM`   | 10.0            | `--fees 50ibc/ATOM`  |

:::note
Umrechnungskurse spiegeln das protokolldefinierte Tauschverhältnis wider, nicht die Marktpreise. Ein Kurs von 10.0 für ATOM bedeutet, dass 1 Einheit ibc/ATOM zu Gebührenzwecken 10 Einheiten uqor entspricht.
:::

---

## So funktioniert es

Der `GasAbstractionDecorator` von QoreChain ist in die Pipeline zur Transaktionsverarbeitung integriert. Wenn eine Transaktion Gebühren in einer nicht-nativen Denomination enthält, geschieht Folgendes:

1. **Gebührenprüfung** — Der Decorator prüft die in der Transaktion angegebene Gebührendenomination.
2. **Kurssuche** — Wenn die Denomination in der Liste der akzeptierten Token enthalten ist, schlägt das Protokoll den entsprechenden Umrechnungskurs nach.
3. **Umrechnung** — Der Gebührenbetrag wird mithilfe des Umrechnungskurses in sein natives uqor-Äquivalent umgerechnet.
4. **Standardverarbeitung** — Die umgerechnete Gebühr wird an den Standard-`DeductFee`-Handler zum Abzug vom Konto des Absenders übergeben. Die Umrechnung ist für den Rest der Transaktions-Pipeline transparent. Die gesamte nachgelagerte Gebührenverarbeitung (Verteilung an Validatoren, Burning, Treasury-Zuweisung, Staker-Belohnungen und Light-Node-Belohnungen) arbeitet mit dem nativen uqor-Äquivalent.

---

## Anwendungsbeispiele

### Gebühren in USDC bezahlen

Senden Sie einen Token-Transfer mit Gebühren, die in USDC bezahlt werden:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 500ibc/USDC
```

Da USDC einen Umrechnungskurs von 1.0 hat, entsprechen 500 ibc/USDC 500 uqor.

### Gebühren in ATOM bezahlen

Senden Sie einen Token-Transfer mit Gebühren, die in ATOM bezahlt werden:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 50ibc/ATOM
```

Da ATOM einen Umrechnungskurs von 10.0 hat, entsprechen 50 ibc/ATOM 500 uqor.

---

## Akzeptierte Token abfragen

Rufen Sie die Liste der derzeit für die Gas-Abstraktion akzeptierten Token zusammen mit ihren Umrechnungskursen ab:

```bash
qorechaind query gasabstraction accepted-tokens
```

**Beispielausgabe:**

```yaml
accepted_tokens:
- denom: uqor
  conversion_rate: "1.000000000000000000"
- denom: ibc/USDC
  conversion_rate: "1.000000000000000000"
- denom: ibc/ATOM
  conversion_rate: "10.000000000000000000"
```

---

## JSON-RPC-Zugriff

Für Anwendungen, die über JSON-RPC integriert sind, fragen Sie die Gas-Abstraktionskonfiguration ab:

```
qor_getGasAbstractionConfig
```

**Anfrage:**

```json
{
  "jsonrpc": "2.0",
  "method": "qor_getGasAbstractionConfig",
  "params": [],
  "id": 1
}
```

**Antwort:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "accepted_tokens": [
      { "denom": "uqor", "conversion_rate": "1.0" },
      { "denom": "ibc/USDC", "conversion_rate": "1.0" },
      { "denom": "ibc/ATOM", "conversion_rate": "10.0" }
    ]
  }
}
```

---

:::tip

* Die Gas-Abstraktion ist ideal für Nutzer, die aus anderen Ökosystemen einsteigen und möglicherweise noch kein QOR halten.
* Umrechnungskurse werden durch die Governance festgelegt und können über Parameteränderungs-Vorschläge aktualisiert werden.
* Wenn Sie mehrere akzeptierte Token halten, kann jeder davon für Gebühren bei jedem Transaktionstyp verwendet werden.
* Der tatsächlich in `--fees` angegebene Token wird von Ihrem Konto abgezogen. Die Umrechnung wird nur verwendet, um zu validieren, dass die Gebühr die Mindestanforderung erfüllt.

:::
