---
slug: /developer-guide/cross-vm-reference
title: Referenz für Cross-VM-Aufrufe (v3.2.8)
sidebar_label: Cross-VM-Referenz
sidebar_position: 9
---

# Referenz für Cross-VM-Aufrufe (v3.2.8)

Ein Cross-VM-Aufruf lässt Code auf einer virtuellen Maschine einen Contract auf einer anderen ausführen: ein Account oder ein QoreChain Native-Contract ruft einen EVM-Contract auf, ein Account ruft einen QoreChain Native-Contract (CosmWasm) auf, ein Solidity-Contract ruft einen QoreChain Native-Contract auf und so weiter. Es gibt zwei Wege. Ein **synchroner** Aufruf läuft innerhalb Ihrer eigenen Transaktion und liefert die Antwort sofort zurück. Ein **asynchroner** Aufruf kommt in eine Warteschlange und läuft in einem späteren Block.

Diese Seite ist die Referenz zu Feldern, Kosten und Limits für Release v3.2.8, mit einem durchgespielten Beispiel für jede Richtung. Die Konzepte, der Lebenszyklus und das ältere Verhalten stehen in [Cross-VM-Interoperabilität](/developer-guide/cross-vm-interoperability); die SDK-Anleitung steht im [Cross-VM-Leitfaden](/sdk/guides/cross-vm).

:::note Wo v3.2.8 läuft
Das Testnet **`qorechain-diana`** läuft seit dem 12. November 2026 mit **v3.2.8**. Das Mainnet **`qorechain-vladi`** hat es noch nicht angewendet, und im Mainnet ist `MsgCrossVMCall` abgeschaltet. Alles, was unten mit "v3.2.8" markiert ist, ist vorerst Testnet-Verhalten.
:::

:::caution Ist die Aufrufnachricht gerade verfügbar?
Im Testnet wurde `MsgCrossVMCall` durch das Upgrade pausiert. Der Governance-Vorschlag 37 wurde angenommen und hat die Pause aufgehoben, daher ist der Aufruf im Testnet offen (geprüft am 12. November 2026: Die Circuit-Breaker-Liste enthält nur `/cosmwasm.wasm.v1.MsgStoreCode`). Im Mainnet bleibt er abgeschaltet. Ob der Aufruf zu einem bestimmten Zeitpunkt verfügbar ist, zeigen zwei Dinge: die Modulparameter (`enabled`) und die Circuit-Breaker-Liste. Prüfen Sie beides, bevor Sie darauf aufbauen:

```bash
# Module parameters: look for "enabled": true
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params

# Circuit breaker list: the call is paused while this contains /qorechain.crossvm.v1.MsgCrossVMCall
curl -s https://api-testnet.qore.host/cosmos/circuit/v1/disable_list
```

Die Listenroute heißt über REST `disable_list` (die Schreibweise `disabled_list` antwortet mit `501`). Das Gegenstück auf der Kommandozeile eines Knotens ist `qorechaind query circuit disabled-list`. Solange der Aufruf pausiert ist, wird eine Transaktion, die ihn enthält, abgelehnt, und Aufrufe in der Warteschlange bleiben ausstehend, bis sie ablaufen, sofern die Pause nicht vorher aufgehoben wird. Vor dem Beschluss von Vorschlag 37 enthielt die Liste `/qorechain.crossvm.v1.MsgCrossVMCall`; im Testnet ist das nicht mehr der Fall. Was gesendet wurde, steht unter [Im Testnet getestet](#tested).
:::

## Warum das wichtig ist {#why}

- **Die Kosten sind vorhersehbar.** Ein Aufruf in der Warteschlange nach QoreChain Native zeigt seinen Preis vorab: Sie wählen, wie viel Contract-Arbeit er verbrauchen darf und welchen höchsten Auslastungsfaktor Sie akzeptieren, das Geld wird in Treuhand gehalten, und was der Aufruf nicht verbraucht, kommt zu Ihnen zurück.
- **Ein Account kann andere nicht verdrängen.** Ein Absender darf höchstens 100 Aufrufe gleichzeitig in der Warteschlange haben, sodass die gemeinsame Warteschlange nutzbar bleibt.
- **Ein fehlschlagender Aufruf ist nie kostenlos.** Ein Aufruf, der fehlschlägt, bezahlt trotzdem die geleistete Arbeit, in jeder Richtung. Einen Fehler abzufangen und mit demselben Gas erneut zu versuchen, funktioniert also nicht.
- **Die EVM-Seite bleibt in Ihrem Fenster.** Ein Aufruf in die EVM, den Sie nicht selbst signiert haben, sowie die EVM-Bridge bei `0x0901` werden nur durch ein offenes [EVM-Autorisierungsfenster](/developer-guide/evm-window-reference) zugelassen.

## Synchrone und asynchrone Aufrufe {#sync-async}

| | Synchron (Standard) | Asynchron (`async = true`) |
| --- | --- | --- |
| Wann er läuft | Innerhalb Ihrer Transaktion | Am Ende eines späteren Blocks, aus der Warteschlange |
| Gas | Das eigene Gas Ihrer Transaktion | Ein festes vorausbezahltes Budget (siehe [Kosten](#cost)) |
| Antwort | In der Transaktionsantwort zurückgegeben, Feld `data` | Nicht zurückgegeben; die abgeschlossene Nachricht per ID lesen |
| Wenn das Ziel fehlschlägt | Die gesamte Transaktion wird rückgängig gemacht | Nur dieser Aufruf wird als `failed` verzeichnet; Ihre Transaktion bleibt bestehen |
| Gelder | `funds` kann für ein QoreChain Native-Ziel angehängt werden | Ebenso; ein asynchroner Aufruf mit Geldern in eine Lane, die sie nicht tragen kann, wird bei der Einreichung abgelehnt |
| Geeignet für | Alles, was das Ergebnis sofort braucht | Fire-and-forget-Arbeit und Aufrufe, deren Gas Sie begrenzen wollen |

Eine Nachricht in der Warteschlange durchläuft `pending`, dann `executed`, `failed` oder `timed_out`. Sie läuft nach `queue_timeout_blocks` ab (100 im Testnet). Die Warteschlange arbeitet die älteste zuerst ab, und der Durchlauf am Blockende führt höchstens 50 Aufrufe pro Block aus.

### Wer wen aufruft, synchron oder asynchron {#who-calls-whom}

Welchen der beiden Modi ein Aufruf nutzen darf, hängt davon ab, wer ihn absetzt.

| Aufrufer | Ziel | Synchron | Asynchron |
| --- | --- | --- | --- |
| Account (signiert die Transaktion) | EVM, QoreChain Native | Ja (Standard) | Ja |
| QoreChain Native-Contract, der `MsgCrossVMCall` als sich selbst absetzt | EVM | Ja (`async` false, der Standard) | Ja |
| QoreChain Native-Contract, der `MsgCrossVMCall` als sich selbst absetzt | QoreChain Native | Abgelehnt (eigene Lane) | Abgelehnt (eigene Lane) |
| Contract, den die EVM-Bridge bei `0x0901` aufgerufen hat (unterhalb der Bridge) | SVM | Ja | Nicht verwendet |
| Contract, den die EVM-Bridge bei `0x0901` aufgerufen hat (unterhalb der Bridge) | EVM | Nicht verwendet | Ja |

Ein QoreChain Native-Contract, der `MsgCrossVMCall` als sich selbst absetzt, kann die EVM auf beide Arten aufrufen. Synchron (`async` false, der Standard) läuft auf dem eigenen Gas der Transaktion, die Antwort kommt in `MsgCrossVMCallResponse.data` zurück, und ein Fehler macht die gesamte Transaktion rückgängig. Asynchron stellt den Aufruf in die Warteschlange. Beides wurde zuvor im Testnet ausgeführt: der synchrone Aufruf bei Blockhöhe 9,795,779 und der asynchrone Aufruf bei Blockhöhe 9,795,783.

Die Formel "synchron zur SVM, asynchron zur EVM" gilt nur unterhalb der Bridge bei `0x0901`: Für einen Contract, den die EVM-Bridge aufgerufen hat, darf das, was dieser Contract absetzt, synchron zur SVM und asynchron zur EVM gehen. Es ist keine Regel für einen Contract, der als er selbst handelt und gegenüber der EVM beide Modi nutzen darf.

## Felder von MsgCrossVMCall {#fields}

Type-URL `/qorechain.crossvm.v1.MsgCrossVMCall`.

| Feld | Nummer | Bedeutung |
| ----- | ------ | ------- |
| `sender` | 1 | Ihre `qor1...`-Adresse. Sie signiert die Nachricht. |
| `source_vm` | 2 | Wird von der Chain ignoriert. Die Chain ermittelt selbst, woher der Aufruf kommt. Wird weiterhin gesendet, damit ältere Knoten die Nachricht akzeptieren. |
| `target_vm` | 3 | `evm`, `cosmwasm` oder `svm`. Ein Aufruf in die eigene Lane wird abgelehnt. Die SVM-Lane ist im Testnet seit Vorschlag 37 offen und im Mainnet aus; siehe [SVM-Lane](/developer-guide/svm-lane-v328). Für diese Seite wurde kein Aufruf in die SVM ausgeführt. |
| `target_contract` | 4 | Eine EVM-Adresse (`0x` und 40 Hex-Ziffern, keine Precompile-Adresse) oder eine `qor1...`-Contract-Adresse. |
| `payload` | 5 | Die Aufrufdaten: ABI-kodiert für die EVM, die JSON-Execute-Nachricht als UTF-8 für QoreChain Native. Höchstens `max_message_size` Bytes (65,536). |
| `funds` | 6 | Anzuhängende Coins (nur für QoreChain Native-Ziele). |
| `async` | 7 | `true` stellt den Aufruf in die Warteschlange; `false` (Standard) führt ihn sofort aus. |
| `async_gas_limit` | 8 | v3.2.8, nur asynchron in QoreChain Native: die Contract-Gas-Einheiten, mit denen der Aufruf in der Warteschlange läuft. `0` oder nicht gesetzt bedeutet 500,000. Erlaubt von 250,000 bis zu dem, was die Warteschlange in einem Block ausführen kann (1,875,000 beim Standardbudget). |
| `async_max_factor` | 9 | v3.2.8, nur asynchron in QoreChain Native: der höchste Auslastungsfaktor, den Sie zu zahlen bereit sind, in **Millionsteln**: `1000000` ist 1x und `4000000` ist 4x. Der gültige Bereich ist 1,000,000 bis 100,000,000 (1x bis 100x); ein einfaches Vielfaches wie `4` wird mit Codespace `crossvm` Code 2 abgelehnt, bevor etwas läuft. `0` oder nicht gesetzt bedeutet das Vierfache des Faktors bei der Einreichung (4,000,000 Millionstel, wenn der Faktor 1x beträgt), begrenzt auf das Chain-Maximum. Ein Wert unterhalb des geltenden Faktors wird bei der Einreichung abgelehnt. |

Auf der Kommandozeile heißen die beiden neuen Felder `--async-gas-limit` (eine ganze Zahl) und `--async-max-factor` (eine Dezimalzahl wie `2.5`, die der Befehl für Sie in Millionstel umrechnet). In einer rohen Nachricht, im SDK und in den REST- oder JSON-Formen steht der Wert immer in Millionsteln: 2,5x ist `2500000`. Das SDK exportiert `CROSSVM_ASYNC_FACTOR_ONE` (1,000,000), um ein Vielfaches in Millionstel umzurechnen, und `validateCrossVmAsyncGas`, um die beiden Werte vor dem Senden zu prüfen.

## Kosten, Treuhand und Rückerstattungen {#cost}

Für einen **asynchronen Aufruf in QoreChain Native** (v3.2.8):

1. **Treuhand.** Die Vorauszahlung ist Einheiten mal Faktor mal Gaspreis und wird gehalten, nicht ausgegeben. Mit den Standardwerten sind das 500,000 Einheiten x 4 (4,000,000 in Millionsteln) x 0.1 uqor = 200,000 uqor, also **0,2 QOR**. Sie wandern von Ihrem Guthaben auf das Konto `crossvm_async_escrow`. Sie brauchen so viel verfügbares uqor: gesperrte Vesting-Coins, Fee-Grants und in anderen Token bezahlte Gebühren können sie nicht finanzieren, und ein solcher Aufruf wird abgelehnt.
2. **Gebühr für den Warteschlangenplatz.** Jeder asynchrone Aufruf zahlt bei der Einreichung zusätzlich eine Platzgebühr als Gas: 500,000 Gas bei leerer Warteschlange, steigend mit dem Füllstand bis 2,000,000 Gas bei voller Warteschlange. Beim Gaspreis von 0.1 uqor sind das 0,05 QOR bis 0,2 QOR.
3. **Abrechnung.** Wenn der Aufruf abgeschlossen ist, wird das verbrauchte Gas zum dann geltenden Faktor als Gebühr aus der Treuhand bezahlt, und der Rest geht an Sie zurück. Ein Aufruf, der fehlschlägt, bezahlt, was er verbraucht hat. Ein Aufruf, der abläuft oder nie ausgeführt wird, erhält seine gesamte Treuhand zurück, und seine Platzgebühr ist die Bearbeitungsgebühr. Das Ereignis `crossvm_escrow_settled` enthält die Gebühr und die Rückerstattung.
4. **Warten auf den Faktor.** Der Aufruf läuft, solange der Auslastungsfaktor höchstens Ihrem `async_max_factor` entspricht. Ist der Faktor höher, wartet er und läuft ab, wenn der Faktor hoch bleibt. Beim Standard (das Vierfache des Faktors bei der Einreichung, 4,000,000 Millionstel bei einem Faktor von 1x) muss sich der Faktor mehr als vervierfachen, bevor der Aufruf wartet.
5. **Größenlimits.** Die Vorauszahlung darf 50,000,000 Gas nicht überschreiten. Darüber wird der Aufruf bei der Einreichung abgelehnt: später erneut versuchen oder `async_gas_limit` senken.

Für einen **asynchronen Aufruf in die EVM** beträgt das vorausbezahlte Budget 1,000,000 Gas, berechnet bei der Einreichung. Bei einem **synchronen** Aufruf sind die Kosten das eigene Gas der Transaktion. Schwere QoreChain Native-Contracts, die großen Code laden, brauchen bei ihrem ersten Aufruf in einem Block ein höheres `async_gas_limit` und `async_max_factor` als die Standardwerte.

### Fehlgeschlagene Aufrufe werden berechnet {#failed-charged}

Ein Cross-VM-Aufruf, der fehlschlägt, bezahlt trotzdem die geleistete Arbeit. Ein EVM-Aufruf, der zurückgesetzt wird oder kein Gas mehr hat, verbraucht das konsumierte EVM-Gas des Aufrufers, und ein über die Bridge `0x0901` ausgeführter QoreChain Native-Aufruf, der fehlschlägt, verbraucht das vom Contract aufgewendete Gas aus dem aufrufenden EVM-Frame. Ein Contract, der einen teuren, fehlschlagenden Callee überstehen will, sollte beim Unteraufruf ein Gaslimit setzen, statt mit dem verbleibenden Gas erneut zu versuchen.

## Die Warteschlange ausstehender Aufrufe {#pending}

- **Höchstens 100 ausstehende Aufrufe pro Absender** (`max_pending_per_sender`). Ein weiterer asynchroner Aufruf wird mit `ErrQueueFull` (Codespace `crossvm`, Code 4) abgelehnt, bis einer Ihrer Aufrufe gelaufen oder abgelaufen ist. Synchrone Aufrufe sind davon nicht betroffen.
- **Die gesamte Warteschlange fasst höchstens `max_queue_size`** Aufrufe (1,000).
- **Die Liste der ausstehenden Aufrufe ist paginiert.** Jede Seite enthält höchstens 100 Nachrichten, und jede Payload in der Liste wird auf ihre ersten **1,024 Bytes** gekürzt (`payload_hex`). Um eine vollständige Payload zu lesen, rufen Sie die Nachricht per ID ab.
- **Das Seitenlimit wird begrenzt.** Ein `pagination.limit` von 0 oder über 100 wird stillschweigend auf 100 begrenzt. Eine Anfrage mit `limit=101` antwortet mit `200` und höchstens 100 Einträgen, nicht mit einem Fehler. Um weiterzulesen, übergeben Sie den `next_key` aus der Antwort und machen weiter, bis er leer ist.

```bash
# One page of pending calls (use the next key from the response for the next page)
curl -s "https://api-testnet.qore.host/qorechain/crossvm/v1/pending?pagination.limit=100"

# A message by id, with its whole payload
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/message/<id>
```

Am 12. November 2026 im Testnet geprüft: Die Pending-Route antwortete mit `200` und `{"messages":[],"count":0,"pagination":{"next_key":null,"total":"0"}}` (Warteschlange leer), und die Nachrichtenroute antwortete mit `200` und `{"message":null,"found":false}` für eine nicht existierende ID. Dieselben Lesezugriffe mit der Linux-Knoten-CLI:

```bash
qorechaind query crossvm pending
qorechaind query crossvm message <id>
```

:::note Knoten-CLI
`qorechaind` ist die Linux-Knoten-CLI. Es gibt keine paketierte macOS-Binärdatei. Die REST-Aufrufe funktionieren von jedem Rechner aus.
:::

## Modulparameter {#params}

```bash
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params
```

Am 12. November 2026 mit `200` beantwortet, mit diesen Feldern:

| Feld | Gelesener Wert | Bedeutung |
| ----- | ---------- | ------- |
| `enabled` | `true` | Modulschalter. Die Aufrufnachricht hat einen eigenen Eintrag auf der Circuit-Breaker-Liste. |
| `max_message_size` | `65536` | Größte Payload in Bytes. |
| `max_queue_size` | `1000` | Höchstzahl gleichzeitig eingereihter Aufrufe. |
| `queue_timeout_blocks` | `100` | Blöcke, bevor ein nicht ausgeführter Aufruf abläuft. |
| `bridge_allowed_targets` | drei Einträge `cosmwasm:qor1...` | Die QoreChain Native-Contracts, die die Bridge `0x0901` aufrufen darf. Leer hält die Bridge geschlossen. |
| `bridge_target_pins` | ein Eintrag pro Ziel: `target`, `code_id`, `history_len` | Der Code, den jedes erlaubte Ziel weiterhin ausführen muss, damit die Bridge es aufrufen kann. |
| `max_pending_per_sender` | `100` | Aufrufe in der Warteschlange, die ein Absender halten darf. |
| `max_cosmos_tx_gas` | `"50000000"` | Das meiste Gas, das eine Native-Transaktion angeben darf. |
| `record_retention_blocks` | `"100000"` | Wie lange der Eintrag eines abgeschlossenen Aufrufs aus der Warteschlange aufbewahrt wird. |
| `max_block_wasm_gas` | `"3000000"` | QoreChain Native-Ausführung, die ein Block verbrauchen darf. |
| `max_tx_wasm_share_bps` | `5000` | Anteil dieses Budgets, den eine Transaktion verbrauchen darf. |
| `max_block_level_wasm_gas` | `"10000000"` | Budget für Contract-Arbeit außerhalb von Transaktionen. |
| `queue_wasm_reserve_bps` | `2500` | Anteil des Blockbudgets, der für die Warteschlange reserviert ist. |
| `wasm_congestion_max_factor` | `20` | Der höchste Wert, den der Auslastungsfaktor erreichen kann. |
| `wasm_congestion_target_bps` | `5000` | Nutzungsanteil, ab dem der Faktor steigt. |
| `wasm_congestion_factor_micro` | `"1000000"` | Der aktuell geltende Faktor in Millionsteln (`1000000` ist 1x). |
| `max_block_upload_bps` | `5000` | Anteil des Budgets, den Code-Uploads verbrauchen dürfen. |
| `max_queue_timeouts_per_block` | `100` | Pro Block ablaufende Aufrufe. |

Nutzen Sie `wasm_congestion_factor_micro`, um zu sehen, was ein Aufruf in der Warteschlange gerade jetzt vorauszahlt: Einheiten x Faktor x 0.1 uqor.

## Beispiele nach Richtung {#examples}

Alle Beispiele signieren mit dem Post-Quanten-Schlüssel des Accounts, wie jede Native-Transaktion; siehe [Post-Quanten-Signierung](/developer-guide/post-quantum-signing). Nur die Beispiele Native-Account zu QoreChain Native-Contract wurden für diese Seite gesendet (siehe [Im Testnet getestet](#tested)); die EVM-Beispiele wurden nicht ausgeführt und sind dort, wo sie vorkommen, als UNTESTED markiert.

### Native-Account zu EVM-Contract {#native-to-evm}

**UNTESTED:** Diese Richtung wurde für diese Seite nicht ausgeführt.

Das Ziel ist ein EVM-Contract; die Payload sind ABI-kodierte Aufrufdaten. Der Aufruf läuft als Ihre eigene `0x`-Adresse, sodass die EVM-Seite Sie als `msg.sender` sieht. Kommandozeile (Linux-Knoten-CLI), erst bauen, dann die Post-Quanten-Signatur hinzufügen:

```bash
qorechaind tx crossvm call evm 0x1234567890123456789012345678901234567890 \
  --payload <hex of abi.encode(selector, args)> \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > call.json

qorechaind tx pqc cosign call.json --from mykey --pqc-key mykey-mldsa \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

TypeScript mit dem veröffentlichten SDK (0.13.0). Der Helfer ABI-kodiert den Aufruf mit viem:

```ts
import { createClient, createCrossVMClient } from "@qorechain/sdk";

const client = createClient({ network: "testnet" });
const tx = await client.connectTx(signer, { pqcKeypair }); // hybrid signing
const xvm = createCrossVMClient(tx);

const { messageId, executed, data } = await xvm.call({
  targetVm: "evm",
  targetContract: "0xYourErc20",
  evm: { abi: erc20Abi, functionName: "transfer", args: ["0xRecipient", 1n] },
});
```

Python, Go, Rust und Java nehmen die Payload für die EVM als rohe Bytes entgegen (die ABI-Kodierung auf höherer Ebene gibt es nur in TypeScript). Python:

```python
client.call(target_vm="evm", target_contract="0xYourErc20", payload=calldata_bytes)
```

Go:

```go
res, err := c.Call(crossvm.CallOptions{
    TargetVM:       crossvm.VMTypeEVM,
    TargetContract: "0xYourErc20",
    Payload:        calldata,
})
```

Rust:

```rust
let opts = CallOptions::new(VM_TYPE_EVM, "0xYourErc20", calldata_bytes);
let resp = cross_vm.call_with_responses(&opts).await?;
```

Java:

```java
CrossVMClient.CallOptions o = new CrossVMClient.CallOptions();
o.targetVm = CrossVMClient.VMType.EVM;
o.targetContract = "0xYourErc20";
o.payload = calldata;
client.call(o);
```

Ist der Absender nicht der Account, der die Transaktion signiert hat, zum Beispiel ein Authz-Grantee, läuft die EVM-Seite unter dem Fenster des Granters; siehe [Authz und Fenster](#authz).

### Native-Account zu QoreChain Native-Contract {#native-to-wasm}

Die Payload ist die JSON-Execute-Nachricht des Contracts. Ein synchroner Aufruf liefert die Antwort des Contracts in `data` zurück:

```bash
qorechaind tx crossvm call cosmwasm qor1...contract \
  --payload $(printf '%s' '{"transfer":{"recipient":"qor1...","amount":"1"}}' | xxd -p -c 0) \
  --funds 100uqor \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 600000 --fees 60000uqor --generate-only > call.json
```

In der Warteschlange, mit ausdrücklichem Gas-Kontingent und Faktor-Obergrenze (v3.2.8). Die Treuhand beträgt 800,000 x 2.5 x 0.1 uqor = 200,000 uqor (0,2 QOR), wenn der Faktor 1 beträgt (der Befehl nimmt `2.5` und sendet 2,500,000 Millionstel):

```bash
qorechaind tx crossvm call cosmwasm qor1...contract \
  --payload <hex of the execute message> --async \
  --async-gas-limit 800000 --async-max-factor 2.5 \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > call.json
```

TypeScript mit SDK 0.13.0 (synchron und in der Warteschlange mit dem Standardkontingent):

```ts
const sync = await xvm.call({
  targetVm: "cosmwasm",
  targetContract: "qor1...contract",
  cosmwasm: { transfer: { recipient: "qor1...", amount: "1" } },
});

const queued = await xvm.call({
  targetVm: "cosmwasm",
  targetContract: "qor1...contract",
  cosmwasm: { transfer: { recipient: "qor1...", amount: "1" } },
  async: true, // default allowance: 500,000 units, 4x factor (4,000,000 millionths)
});

// SDK 0.14.0: explicit allowance. The factor is in millionths: 6x is 6_000_000.
const tuned = await xvm.call({
  targetVm: "cosmwasm",
  targetContract: "qor1...contract",
  cosmwasm: { transfer: { recipient: "qor1...", amount: "1" } },
  async: true,
  asyncGasLimit: 800_000,
  asyncMaxFactor: 6_000_000,
});
```

Python (`async_=True`), Go (`Async: true`), Rust (`.queue(true)`) und Java (`o.async = true`) stellen auf dieselbe Weise in die Warteschlange:

```python
client.call(target_vm="cosmwasm", target_contract="qor1...contract",
            cosmwasm={"transfer": {"recipient": "qor1...", "amount": "1"}}, async_=True)
```

:::note SDK-Unterstützung für die beiden neuen Felder
SDK 0.13.0 hat keine Option für `async_gas_limit` oder `async_max_factor`, daher verwenden seine Aufrufe in der Warteschlange die Standardwerte. SDK 0.14.0 fügt dem Cross-VM-Aufruf `asyncGasLimit` und `asyncMaxFactor` hinzu, exportiert `CROSSVM_ASYNC_FACTOR_ONE` (1,000,000) und `validateCrossVmAsyncGas`, und sein Helfer `buildCall` setzt `sourceVm` für einen Native-Account standardmäßig auf `evm`. Die Chain ignoriert `source_vm` und hat die Nachricht mit `source_vm` native verzeichnet.
:::

### EVM-Contract zu QoreChain Native-Contract über 0x0901 {#evm-to-wasm}

**UNTESTED:** Diese Richtung wurde für diese Seite nicht ausgeführt.

Ein Solidity-Contract ruft das Bridge-Precompile bei `0x0000000000000000000000000000000000000901` auf. Der Aufruf läuft innerhalb der EVM-Transaktion, mit dem aufrufenden Account oder Contract (als dessen `qor1`-Adresse) als QoreChain Native-Absender, und ein Revert an beliebiger Stelle macht beide Seiten rückgängig.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CrossVMCaller {
    address constant CROSSVM = 0x0000000000000000000000000000000000000901;

    function callNative(string calldata contractAddr, bytes calldata executeMsg)
        external returns (bytes memory)
    {
        // targetVM 1 is QoreChain Native; executeMsg is the JSON execute message
        (bool ok, bytes memory ret) = CROSSVM.call(
            abi.encodeWithSignature(
                "executeCrossVMCall(uint8,string,bytes)", 1, contractAddr, executeMsg
            )
        );
        require(ok, "cross-VM call failed");
        return ret;
    }
}
```

Regeln für die Bridge:

- Nur einfacher `CALL`, kein Wert, Selektor `0x3c11078c`. `STATICCALL`, `DELEGATECALL` und Ziel-VM `0` oder `2` führen zu einem Revert.
- Das Ziel muss in `bridge_allowed_targets` stehen (und ab v3.2.8 weiterhin den Code ausführen, an den es gepinnt ist). Lesen Sie beides mit der oben genannten Params-Route.
- **Der Aufrufer braucht ein Fenster, das `0x0901` aufführt.** Jeder Account, der eine Transaktion an die Bridge sendet, muss ein offenes [EVM-Autorisierungsfenster](/developer-guide/evm-window-reference) haben, dessen `allowed_targets` `0x0000000000000000000000000000000000000901` enthält (und den Contract, der sie aufruft, falls Sie über einen aufrufen). Öffnen Sie eines so, mit einer Grenze, die zu Ihrer Sitzung passt:

```bash
qorechaind tx pqc open-evm-window 600 5 10qor \
  --allowed-targets 0x0000000000000000000000000000000000000901 \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 80000uqor --generate-only > window.json
```

- Ein fehlgeschlagener Aufruf wird mit einem `Error(string)`-Grund zurückgesetzt und für das vom Contract verbrauchte Gas berechnet.

Der Helfer `encodeCrossVmCalldata({ contract, msg })` aus `@qorechain/rdk` baut dieselben Aufrufdaten in TypeScript (siehe [Multi-VM](/rollups/multi-vm)). Mit dem veröffentlichten SDK ist die Precompile-Adresse `PRECOMPILE_ADDRESSES.crossVmBridge` aus `@qorechain/evm`.

### QoreChain Native-Contract zu EVM-Contract {#wasm-to-evm}

**UNTESTED** durch den Autor der Dokumentation. Das Chain-Team meldet, dass beide Modi vor v3.2.8 im Testnet liefen.

Ein QoreChain Native-Contract führt den Aufruf aus, indem er ein `MsgCrossVMCall` als Chain-Nachricht absetzt, mit sich selbst als Absender. Die Nachricht hat dieselben Felder wie oben; die Chain behandelt den Contract als CosmWasm-Aufrufer, was auch immer `source_vm` angibt. Mit `async` false (dem Standard) ist der Aufruf synchron: Er läuft auf dem Gas der Transaktion, die Antwort steht in `MsgCrossVMCallResponse.data`, und ein Fehler macht die gesamte Transaktion rückgängig. Mit `async` true kommt er in die Warteschlange. Siehe [Wer wen aufruft](#who-calls-whom). Das folgende Beispiel stellt den Aufruf in die Warteschlange:

```json
{
  "@type": "/qorechain.crossvm.v1.MsgCrossVMCall",
  "sender": "qor1...the contract...",
  "source_vm": "cosmwasm",
  "target_vm": "evm",
  "target_contract": "0x1234567890123456789012345678901234567890",
  "payload": "<base64 of the ABI-encoded call>",
  "async": true
}
```

Was Sie wissen sollten, bevor Sie sich darauf verlassen:

- Die EVM sieht den Contract als die **letzten 20 Bytes** seiner 32-Byte-Adresse. Stellen Sie sicher, dass der EVM-Contract nicht davon abhängt, dass `msg.sender` ein normaler Account ist.
- Ab v3.2.8 schlägt ein Aufruf fehl (und wird berechnet), wenn der Aufrufer danach mehr native QOR hielte als zu Beginn. EVM-Contracts für diese Richtung sollten einen ERC-20-Token zahlen oder ein im Aufruf genanntes 20-Byte-Konto, nicht native QOR an `msg.sender`.
- Ein Contract, der als er selbst handelt, wird nicht durch ein EVM-Fenster begrenzt. Ein unter einem Authz-Grant eines Accounts abgesetzter Aufruf wird es; siehe unten.
- Unterhalb der Bridge `0x0901` wird ein `MsgCrossVMCall` nur von einem Contract akzeptiert, der als er selbst handelt, und ein Authz-`MsgExec` kann dort keinen für einen anderen Account tragen.

Beide Modi wurden zuvor im Testnet ausgeführt (synchron bei Blockhöhe 9,795,779, asynchron bei Blockhöhe 9,795,783). Der Rust-Code auf Contract-Seite, der diese Nachricht absetzt, wurde für diese Seite nicht ausgeführt.

## Authz und Fenster {#authz}

Ein Cross-VM-Aufruf in die EVM, den der Absender nicht selbst gesendet hat, läuft unter dem EVM-Fenster des **Absenders**, genau so, als würde der eigene Code des Absenders in der Transaktion eines anderen handeln. In der Praxis ist das ein genutzter Authz-Grant. Wenn jemand Ihren Grant von `MsgCrossVMCall` nutzt, um die EVM aufzurufen:

- Der Aufruf wird nur zugelassen, wenn **Ihr** Fenster offen ist und sein Umfang das Ziel zulässt (`allowed_targets`, `native_only`, die wertbewegenden Precompiles).
- Jeder erfolgreiche Aufruf verbraucht eine der Transaktionen des Fensters, und nativer Wert, den Sie dabei verlieren, wird auf den Wert des Fensters angerechnet.
- Ohne einen nutzbaren Post-Quanten-Schlüssel und ein aktives Fenster wird der Aufruf abgelehnt, bei der Einreichung für einen asynchronen Aufruf und erneut, wenn die Warteschlange ihn ausführt.
- Ein Contract oder eine Gruppenrichtlinie hält kein Fenster, daher kann ein Authz-Grant von dort keinen Aufruf in die EVM tragen.
- Aufrufe in QoreChain Native werden nicht durch das Fenster begrenzt. Ein allgemeiner Authz-Grant von `MsgCrossVMCall` gibt dem Grantee Ihre Identität auf der QoreChain Native-Lane: Vergeben Sie ihn nur an Parteien, denen Sie den Account anvertrauen.

Eine Umwandlung eines ERC-20-Tokens unter einem Authz-Grant (`MsgConvertERC20`) wird auf dieselbe Weise durch das Fenster des Absenders zugelassen.

## Limits und Fehler {#limits}

| Situation | Ergebnis |
| --------- | ------ |
| Payload größer als `max_message_size` | Abgelehnt, Code 8 (`message payload exceeds max size`) |
| Zieladresse mit falscher Form für ihre Lane | Bei der Einreichung abgelehnt, Code 5 (`invalid target contract address`) |
| Ziel ist eine Precompile-Adresse (`0x...0000` bis `0x...ffff`) | Bei der Einreichung abgelehnt, Code 5 |
| Ziel-VM gleich Ihrer eigenen Lane | Abgelehnt |
| Unbekannte oder nicht unterstützte VM | Code 7 (`unsupported VM type`) |
| Mehr als 100 Aufrufe eines Absenders in der Warteschlange | `ErrQueueFull`, Code 4, bis einer abgeschlossen ist oder abläuft |
| Warteschlange enthält `max_queue_size` Aufrufe | `ErrQueueFull`, Code 4 |
| `async_max_factor` außerhalb von 1,000,000 bis 100,000,000 (Millionstel), zum Beispiel `6` statt `6000000` | Abgelehnt, bevor etwas läuft, Codespace `crossvm` Code 2 (`async_max_factor 6 is outside 1000000..100000000 (millionths)`) |
| `async_max_factor` unter dem geltenden Faktor | Bei der Einreichung abgelehnt |
| `async_gas_limit` unter 250,000 oder über dem Platz der Warteschlange pro Block | Bei der Einreichung abgelehnt |
| Vorauszahlung über 50,000,000 Gas | Bei der Einreichung abgelehnt; später erneut versuchen oder das Limit senken |
| Verfügbares uqor niedriger als die Treuhand | Abgelehnt (durch Vesting gesperrte Coins, Fee-Grants und Gebühren in anderen Token können sie nicht finanzieren) |
| Auslastungsfaktor über `async_max_factor`, wenn der Aufruf an der Reihe ist | Der Aufruf wartet; er läuft nach `queue_timeout_blocks` ab |
| Aufruf läuft ab oder wird nie ausgeführt | Treuhand vollständig erstattet, Platzgebühr als Bearbeitungsgebühr einbehalten |
| Ziel schlägt fehl | Eintrag `failed` (asynchron) oder die Transaktion wird rückgängig gemacht (synchron); verbrauchtes Gas wird berechnet |
| Native QOR aus der EVM an einen Contract-Aufrufer (32-Byte-Absender) zurückgegeben | Der Aufruf schlägt fehl und wird berechnet |
| Aufruf von `0x0901` ohne ein Fenster, das es aufführt | Abgelehnt |
| Ziel von `0x0901` nicht in `bridge_allowed_targets`, oder Code seit dem Pinnen geändert | Revert: `cross-VM bridge call refused: target ... is not allowlisted` für ein nicht aufgeführtes Ziel |
| `MsgCrossVMCall` auf der Circuit-Breaker-Liste | Transaktion abgelehnt; Aufrufe in der Warteschlange bleiben ausstehend |
| Ein Aufruf in die SVM | Die Lane ist im Testnet seit Vorschlag 37 offen und im Mainnet aus; für diese Seite wurde kein Aufruf in die SVM ausgeführt (UNTESTED) |

Ein auf einem fehlgeschlagenen Aufruf in der Warteschlange verzeichneter Fehler enthält einfachen Text ohne Quelldatei-Annotation.

## Ereignisse {#events}

| Ereignis | Attribute | Bedeutung |
| ----- | ---------- | ------- |
| `crossvm_request` | `message_id`, `source_vm`, `target_vm`, `target_contract`, `sender` | Ein Aufruf wurde eingereicht |
| `crossvm_response` | `message_id`, `status`, und `error` bei einem fehlgeschlagenen Aufruf | Ein Aufruf in der Warteschlange wurde abgeschlossen |
| `crossvm_timeout` | `message_id` | Ein Aufruf in der Warteschlange ist abgelaufen |
| `crossvm_escrow_settled` | Gebühr und Rückerstattung | Die Treuhand eines asynchronen Aufrufs in QoreChain Native wurde ausgezahlt |

## Im Testnet getestet {#tested}

Ausgeführt auf `qorechain-diana` am 12. November 2026 (Release v3.2.8), nachdem Vorschlag 37 angenommen wurde, mit SDK 0.14.0 (`createCrossVMClient(...).buildCall`, hybrid signiert, eth-native Account), gegen den von der Governance gespeicherten cw20-Contract, instanziiert aus Code 859. Die Payload war `{"transfer":{"recipient":<self>,"amount":"1"}}`.

| Schritt | Ergebnis |
| ---- | ------ |
| Circuit-Breaker-Liste gelesen | Nur `/cosmwasm.wasm.v1.MsgStoreCode`; die Aufrufnachricht ist nicht pausiert |
| Synchroner Aufruf Native zu QoreChain Native | Simuliert 601,178 Gas, gesendet mit simuliert x 1.3, Code 0, 595,049 Gas verbraucht |
| Asynchroner Aufruf Native zu QoreChain Native, `asyncGasLimit` 800000, `asyncMaxFactor` 6000000 | Simuliert 751,287 Gas; Code 0; 751,277 Gas verbraucht |
| Abbuchungen des asynchronen Aufrufs (Transaktionsereignisse) | Die Gebühr (146,502 uqor, das Limit mal 0.15) und 680,417 uqor an ein Modulkonto (die Zahlung für Treuhand und Warteschlangenplatz wie beobachtet; hier nicht aufgeschlüsselt) |
| Ereignis des asynchronen Aufrufs | `crossvm_request` mit `source_vm` native, `target_vm` cosmwasm |
| `GET /qorechain/crossvm/v1/message/{id}` | Status `executed`, `created_height` gleich `executed_height` (der Aufruf in der Warteschlange lief im selben Block), leerer Fehler |
| `GET /qorechain/crossvm/v1/pending` danach | Leere Liste |
| `async_max_factor` von `6` | Abgelehnt, bevor etwas lief: Codespace `crossvm` Code 2, `async_max_factor 6 is outside 1000000..100000000 (millionths): invalid cross-VM message` |

Für diese Seite nicht ausgeführt (UNTESTED): EVM zu QoreChain Native über `0x0901` und QoreChain Native zu EVM. Das Chain-Team meldet, dass die synchronen und asynchronen Pfade von QoreChain Native zur EVM im Testnet bei den Blockhöhen 9,795,779 und 9,795,783 liefen, vor v3.2.8.

## Verwandte Seiten {#related}

- [Cross-VM-Interoperabilität](/developer-guide/cross-vm-interoperability) für die Konzepte, den Lebenszyklus und die Hinweise zur Testnet-Allowlist.
- [Referenz zum EVM-Autorisierungsfenster](/developer-guide/evm-window-reference) zum Öffnen und Eingrenzen des Fensters, das die Bridge braucht.
- [EVM-Precompiles](/developer-guide/evm-precompiles) für die Precompile-Tabelle und den Netzwerkstatus.
- [QoreChain Native-Entwicklung](/developer-guide/cosmwasm-development) und [QoreChain Native: Gas und Limits](/developer-guide/cosmwasm-gas-and-limits) für Contract-Gas und das Blockbudget.
- [Post-Quanten-Signierung](/developer-guide/post-quantum-signing) zum Signieren der obigen Transaktionen.
- [Cross-VM-Leitfaden (SDK)](/sdk/guides/cross-vm) und [Multi-VM-Rollups](/rollups/multi-vm) für die SDK- und RDK-Helfer.
