---
slug: /user-guide/gas-abstraction
title: Gas-Abstraktion
sidebar_label: Gas-Abstraktion
sidebar_position: 7
---

# Gas-Abstraktion

Die Gas-Abstraktion erlaubt es einem Nutzer, eine Transaktionsgebühr in einem akzeptierten nicht-nativen Token statt in QOR zu bezahlen. Der Code für die Gebührenumrechnung ist Teil der Chain, aber **heute wird auf keinem der beiden Netzwerke ein nicht-nativer Token akzeptiert**, sodass jede Gebühr in QOR bezahlt wird. Diese Seite erklärt, was live ist, wie die Umrechnung wie gebaut funktioniert und was Sie stattdessen tun.

:::caution Noch nicht nutzbar: Bezahlen Sie jede Gebühr in uqor
Im Mainnet (**`qorechain-vladi`**) und im Testnet (**`qorechain-diana`**), beide auf Node-Release **v3.2.4**, geprüft am 23. Oktober 2026:

* Die aktuell gültige Liste akzeptierter Token enthält **nur `uqor`**. Die Gebührenumrechnung wurde mit v3.2.2 eingeschaltet, aber nichts anderes ist aufgeführt, die Umrechnungsobergrenze pro Block ist `0` (Umrechnung aus), und der Umrechnungs-Float hält kein Guthaben. Eine in einer anderen Denomination bezahlte Gebühr wird mit dem Fehler „denom not accepted for fee payment" abgelehnt, sowohl in der Simulation als auch in einer echten Transaktion.
* Auf keinem der beiden Netzwerke existiert ein IBC-Kanal oder IBC-Client, daher kann kein `ibc/…`-Guthaben existieren, mit dem sich bezahlen ließe.

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

## Die aktuelle Konfiguration {#live-configuration}

Das Modul stellt seine Konfiguration über REST und gRPC bereit. Dies sind die Werte auf beiden Netzwerken am 23. Oktober 2026:

| Feld | Wert | Bedeutung |
| --- | --- | --- |
| `enabled` | `true` | Modulschalter |
| `native_denom` | `uqor` | Die Denomination, in der jede Gebühr letztlich bezahlt wird |
| `accepted_tokens` | nur `uqor` | Token, die eine Gebühr bezahlen dürfen. `uqor` braucht keine Preisquelle |
| `premium_bps` | `300` | Der Anteil am Wert einer umgerechneten Gebühr, den der Float zur Deckung seines Preisrisikos behält (3 %) |
| `max_tip_multiplier` | `3` | Eine umgerechnete Gebühr darf dieses Vielfache der Mindestgebühr für ihr Gas nicht überschreiten; `0` würde keine Grenze bedeuten |
| `float_min` | `0` | Das native Guthaben, das der Float stets zurückhält |
| `block_conversion_cap` | `0` | Das Maximum, das der Float pro Block auszahlt; `0` bedeutet, dass die Umrechnung aus ist |

Frühere Versionen dieser Seite zeigten Platzhalter-Einträge `ibc/USDC` und `ibc/ATOM` mit festen Kursen. Sie stehen nicht in der aktuellen Liste.

Lesen Sie sie selbst aus:

```bash
qorechaind query gasabstraction config
qorechaind query gasabstraction accepted-tokens
qorechaind query gasabstraction conversion-rate uqor
qorechaind query gasabstraction float

curl -s https://api.qore.host/qorechain/gasabstraction/v1/config
curl -s "https://api.qore.host/qorechain/gasabstraction/v1/conversion_rate?denom=uqor"
curl -s https://api.qore.host/qorechain/gasabstraction/v1/float
```

`conversion_rate` meldet `rate`, `effective_rate` (den Kurs abzüglich der Prämie), `price_source` und ob der Token bei dieser Höhe `usable` ist, mit einem `reason`, wenn nicht. `float` meldet die Adresse und die Guthaben des Floats sowie die Nutzung des aktuellen Blocks gegenüber `block_cap`. Die JSON-RPC-Methode `qor_getGasAbstractionConfig` wird auf keinem öffentlichen Endpunkt bereitgestellt (siehe [den `qor_`-Namespace](/api-reference/json-rpc-qor_-namespace)); verwenden Sie REST oder gRPC.

---

## Wie die Umrechnung funktioniert (wie gebaut) {#how-it-works}

Seit v3.2.2 leitet der Gebühren-Decorator jede Transaktion auf einen von zwei Pfaden:

* Eine Gebühr in `uqor` oder in mehr als einer Denomination nimmt den **nativen Pfad**, unverändert.
* Eine Gebühr in **genau einer** nicht-nativen Denomination nimmt den **Umrechnungspfad**.

Auf dem Umrechnungspfad:

1. **Akzeptiert?** Die Denomination muss in der Liste akzeptierter Token stehen und eine Preisquelle haben, sonst wird die Transaktion abgelehnt.
2. **Preis.** Der Preis des Tokens stammt aus einer von zwei Quellen: einem per Governance festgelegten statischen Kurs, der bei einer genannten Blockhöhe abläuft, oder dem zeitgewichteten Durchschnittspreis des [AMM](/architecture/amm)-Pools, der den Token mit QOR paart. Ein Poolpreis wird nur verwendet, wenn der Pool aktiv ist, auf der QOR-Seite mindestens die konfigurierte Mindestliquidität hält und sein Spotpreis innerhalb der konfigurierten Abweichung von seinem Durchschnitt liegt.
3. **Wert.** Der native Wert der Gebühr ist der Token-Betrag mal dem Preis, abzüglich der Prämie.
4. **Dieselben Regeln wie bei einer nativen Gebühr.** Die Regeln für Mindestgebühr und dynamische Gebühr im nativen Bereich werden auf diesen nativen Wert angewendet, sodass eine umgerechnete Gebühr genau das erfüllen muss, was eine QOR-Gebühr erfüllen muss (0.1 uqor pro Gas-Einheit als Untergrenze), und durch `max_tip_multiplier` begrenzt ist.
5. **Abwicklung.** Die Token des Zahlers gehen an den **Float** des Gas-Abstraktions-Moduls, und der Float zahlt den nativen Wert in `uqor` an den Fee Collector. Alles, was dem Fee Collector nachgelagert ist (Burning sowie die Anteile für Validatoren, Staker, Treasury und Light Nodes), sieht daher immer nur `uqor`.

Die Umrechnung ist auf dreierlei Weise begrenzt: pro Transaktion (`max_tip_multiplier`), pro Block (`block_conversion_cap`) und durch das Guthaben, das der Float stets zurückhält (`float_min`). Jede Ablehnung erfolgt auch während der Simulation, sodass die Gas-Schätzung auf dieselbe Weise fehlschlägt wie die echte Transaktion.

### Einen Token akzeptieren lassen

* **Die Governance** ersetzt die Konfiguration mit `MsgUpdateConfig` (Autorität: das Governance-Modulkonto). So würden ein echter `ibc/<hash>`-Gebührentoken und sein Pool oder statischer Kurs hinzugefügt und die Umrechnung geöffnet.
* **Der Float** ist ein Modulkonto, das gewöhnliche Bank-Sendungen ablehnt. Er wird mit `MsgFundFloat` befüllt (`qorechaind tx gasabstraction fund-float <amount>uqor`), zum Beispiel von einem Konto, das dafür eine Auszahlung aus dem Community-Pool erhalten hat.

Im Mainnet wurde kein Vorschlag für eines von beidem gestellt, und die Liste bleibt auf `uqor` beschränkt, bis einer angenommen wird.
