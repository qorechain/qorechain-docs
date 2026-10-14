---
slug: /user-guide/gas-abstraction
title: Gas-Abstraktion
sidebar_label: Gas-Abstraktion
sidebar_position: 7
---

# Gas-Abstraktion

Diese Seite beschreibt die Gas-Abstraktionsfunktion von QoreChain, deren Design es Nutzern ermöglicht, Transaktionsgebühren in einem akzeptierten nicht-nativen Token statt in QOR zu bezahlen. **Sie ist heute auf keinem der beiden Netzwerke nutzbar**; diese Seite erklärt das Design und was Sie stattdessen tun.

:::caution Noch nicht verfügbar
Das Bezahlen von Gebühren in einem nicht-nativen Token funktioniert heute weder im Mainnet (**`qorechain-vladi`**, Node-Release **v3.2.1**) noch im Testnet (**`qorechain-diana`**).

* Die Gas-Abstraktions-Abfragen werden im Mainnet nicht bereitgestellt: `qorechaind query gasabstraction accepted-tokens` gibt seinen Hilfetext aus, und die REST-Route `/qorechain/gasabstraction/v1/config` liefert `Not Implemented`.
* Auf keinem der beiden Netzwerke sind IBC-Kanäle geöffnet, daher kann kein `ibc/USDC`- oder `ibc/ATOM`-Guthaben existieren, mit dem sich bezahlen ließe.
* Die Netzwerk-Gebührenuntergrenze wird in `uqor` geprüft, sodass eine Gebühr in jeder anderen Denomination abgelehnt wird.

Bezahlen Sie jede Gebühr in `uqor`. Diese Seite wird aktualisiert, sobald ein Token auf einem Live-Netzwerk akzeptiert wird.
:::

---

## Was heute funktioniert: Gebühren in uqor bezahlen

Jede Transaktion zahlt mindestens **0.1 uqor pro Gas-Einheit**. Legen Sie Gas-Limit und Gebühr gemeinsam fest:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --gas 400000 --fees 40000uqor \
  --chain-id qorechain-vladi --generate-only > tx.json
```

Signieren Sie sie anschließend hybrid und senden Sie sie mit `qorechaind tx pqc cosign`, wie unter [Transaktionsbefehle](/cli-reference/transaction-commands#hybrid-signing) beschrieben. Siehe [Gebühren und Gas](/cli-reference/transaction-commands#fees-and-gas) für empfohlene Limits je Transaktionstyp.

---

## Überblick

Die Gas-Abstraktion soll die Anforderung beseitigen, QOR zur Bezahlung von Transaktionsgebühren zu halten. Ein Nutzer, der einen akzeptierten alternativen Token hält (zum Beispiel einen per IBC transferierten Stablecoin), würde die Gebühr in diesem Token bezahlen, und das Protokoll würde den Gebührenbetrag vor der Verarbeitung in sein natives Äquivalent umrechnen.

---

## Vorgesehenes Design

### Akzeptierte Token

Die Genesis-Konfiguration des Moduls listet diese Token und protokolldefinierte Umrechnungskurse auf. Es sind Tauschverhältnisse für Gebührenzwecke, keine Marktpreise. Auf den Netzwerken kann heute nur `uqor` existieren (siehe den Hinweis oben).

| Token              | Denomination | Umrechnungskurs |
| ------------------ | ------------ | --------------- |
| **QOR**            | `uqor`       | 1.0 (nativ)     |
| **USDC** (via IBC) | `ibc/USDC`   | 1.0             |
| **ATOM** (via IBC) | `ibc/ATOM`   | 10.0            |

### Wie es funktionieren soll

Der `GasAbstractionDecorator` von QoreChain sitzt in der Pipeline zur Transaktionsverarbeitung. Für eine Transaktion, deren Gebühr in einer nicht-nativen Denomination vorliegt:

1. **Gebührenprüfung** — Der Decorator liest die Gebührendenomination.
2. **Kurssuche** — Wenn die Denomination in der Liste der akzeptierten Token enthalten ist, wird der entsprechende Umrechnungskurs nachgeschlagen.
3. **Umrechnung** — Die Gebühr wird in ihr natives `uqor`-Äquivalent umgerechnet.
4. **Standardverarbeitung** — Die umgerechnete Gebühr durchläuft den Standard-Handler für den Gebührenabzug, sodass die nachgelagerte Gebührenverarbeitung (Verteilung an Validatoren, Burning, Treasury, Anteile für Staker und Light Nodes) mit dem nativen Äquivalent arbeitet.

---

## Die Konfiguration abfragen

Das Mainnet stellt die Gas-Abstraktions-Abfragen noch nicht bereit, und die JSON-RPC-Methode `qor_getGasAbstractionConfig` wird auf keinem öffentlichen Endpunkt bereitgestellt (siehe [den `qor_`-Namespace](/api-reference/json-rpc-qor_-namespace)). Derzeit gibt es keine öffentliche Möglichkeit, eine Live-Liste akzeptierter Token auszulesen.
