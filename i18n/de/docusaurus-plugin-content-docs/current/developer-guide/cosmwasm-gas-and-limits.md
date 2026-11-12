---
slug: /developer-guide/cosmwasm-gas-and-limits
title: CosmWasm-Gas, Preisgestaltung und Upload-Grenzen
sidebar_label: CosmWasm-Gas und Grenzen
sidebar_position: 6
---

# CosmWasm-Gas, Preisgestaltung und Upload-Grenzen

QoreChain-Native-Contracts (QoreChains Name für seine CosmWasm-Laufzeitumgebung) werden danach bepreist, was ihre Ausführung einen Validator kostet. Ab dem Release **v3.2.8** hängt der Preis eines Contract-Aufrufs von drei Dingen ab: ob der Contract-Code für den aktuellen Block bereits im Speicher geladen ist, wie stark der Block mit Contract-Arbeit ausgelastet ist und wie viel Speicher der Aufruf berührt. Code-Uploads sind in Größe und Form begrenzt.

:::note Zuerst das Testnet
v3.2.8 läuft seit dem 12. November 2026 im **`qorechain-diana`**-Testnet. Das Mainnet (`qorechain-vladi`) übernimmt es mit einem späteren Governance-Upgrade; die folgenden Werte beschreiben daher heute das Testnet und nach diesem Upgrade das Mainnet. Alle Befehle verwenden `--chain-id qorechain-diana`; ersetzen Sie dies durch `qorechain-vladi`, sobald das Mainnet aktualisiert ist.
:::

## Warum das wichtig ist {#why}

- Ein Contract-Aufruf, der gestern mit einem festen Gaslimit funktionierte, kann heute mit Out-of-Gas scheitern, weil der erste Aufruf eines Codes in einem Block ein Mehrfaches eines Folgeaufrufs kostet. Ein festes Limit ist eine Schätzung, die im ungünstigsten Moment versagt.
- Die Gebühren folgen der Last. Sind die Blöcke voller Contract-Aufrufe, steigt der Preis der Contract-Ausführung, und er fällt wieder, wenn sie es nicht sind.
- Jeder Block hat nur eine begrenzte Menge an Contract-Arbeit. Ein Aufruf, der nicht hineinpasst, schlägt fehl und zahlt seine Gebühr wie jede fehlgeschlagene Transaktion.

Die Kurzregel: **simulieren, das Ergebnis mit mindestens 1,3 multiplizieren und Gas für einen Contract-Aufruf niemals fest codieren.**

## Das Gasmodell {#gas-model}

### Kosten für das Laden des Codes {#code-load}

Bevor ein Contract läuft, muss sein kompilierter Code geladen werden. Der erste Aufruf eines Codes in einem Block zahlt für dieses Laden. Spätere Aufrufe desselben Codes im selben Block sind günstig, weil der Code bereits im Speicher liegt.

| Aufruf | Ungefähres Gas |
| ---- | --------------- |
| cw20-`transfer`, erster Aufruf des Codes in einem Block (eine Nachricht, gemessenes verbrauchtes Gas) | 585,151 |
| cw20-`transfer`, drei Aufrufe in einer Transaktion, also zwei Wiederholungen im selben Block (gemessenes verbrauchtes Gas, gesamt) | 646,169 |
| Derselbe einzelne Aufruf laut Simulation | 591,280 |

Diese Zahlen wurden am 12. November 2026 im Testnet mit dem geprüften cw20-Code gemessen, den die Governance gespeichert hat (Überlastungsfaktor 1x). Eine Wiederholung desselben Codes im selben Block kostet in der Praxis nur etwa 30.500 Gas zusätzlich. Die Simulation meldet mehr, als eine Transaktion verbraucht, weil sie immer das kalte Laden berechnet und einen Puffer für Überlastung aufschlägt: Drei Aufrufe wurden mit 1,326,504 simuliert und verbrauchten 646,169. Die Werte hängen vom Code und vom Aufruf ab; messen Sie daher Ihren eigenen Contract. Im Detail: Das Laden wird beim ersten Aufruf eines Codes in einem Block voll berechnet, die nächsten acht Aufrufe dieses Codes im selben Block zahlen kein Laden, und jeder spätere Aufruf im Block zahlt ein Achtel davon. Die Menge der geladenen Codes ist zu Beginn jedes Blocks leer, sodass jeder Validator dieselben Aufrufe gleich berechnet. Das gilt für Instanziierung, Ausführung und Migration sowie für Aufrufe aus einem anderen Contract oder aus der Cross-VM-Bridge.

**Angeheftete Codes überspringen die Ladegebühr.** Die Governance kann einen beliebten Code anheften, sodass Validatoren ihn geladen halten, und Aufrufe eines angehefteten Codes zahlen die Ladekosten nie. So prüfen Sie, welche Codes angeheftet sind:

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/codes/pinned
```

### Aufruf-Setup und Speicher {#setup}

Jeder Aufruf zahlt außerdem eine kleine Setup-Gebühr (Grundkosten, Kosten pro 64-KiB-Seite des Anfangsspeichers und Kosten pro Datensegment) sowie eine Gebühr für jede Speicherseite, um die er wächst. Contracts, die den Speicher klein halten, sind günstiger.

### Preisgestaltung bei Überlastung {#congestion}

Das Gas der Contract-Ausführung wird mit einem **Überlastungsfaktor** multipliziert.

| Eigenschaft | Wert |
| -------- | ----- |
| Bereich | standardmäßig 1x bis 20x |
| Governance-Obergrenze | Die Governance kann das Maximum bis auf 100x setzen |
| Wann er steigt | Nur wenn Blöcke voll sind: Nach einem Block, der mehr als die Hälfte seines Contract-Budgets verbraucht hat (das Standardziel), steigt der Faktor, und er steigt schneller, wenn das Budget erschöpft war |
| Wann er fällt | Nach einem Block, der weniger als das Ziel verbraucht hat |

Der Faktor skaliert nur die Contract-Ausführung. Speicher, Aufruf-Setup und Code-Upload werden nicht multipliziert. Bei der Messung der obigen Transfers lag der Faktor bei 1x.

Lesen Sie die aktuellen Werte:

```bash
qorechaind query crossvm params --node https://rpc-testnet.qore.host:443
```

Relevant sind die Felder `wasm_congestion_factor_micro` (der geltende Faktor in Millionsteln, `1000000` ist also 1x), `wasm_congestion_max_factor`, `wasm_congestion_target_bps`, `max_block_wasm_gas` und `max_tx_wasm_share_bps`.

### Das Contract-Budget pro Block {#budget}

Jeder Block hat ein Budget an Contract-Arbeit. Die Standardwerte:

| Parameter | Standard | Bedeutung |
| --------- | ------- | ------- |
| `max_block_wasm_gas` | 3,000,000 | Contract-Ausführung, die alle Transaktionen zusammen in einem Block verbrauchen dürfen |
| `max_tx_wasm_share_bps` | 5,000 (die Hälfte) | Der Anteil dieses Budgets, den eine Transaktion nutzen darf, beim Standard also 1,500,000 |
| `queue_wasm_reserve_bps` | 2,500 | Anteil des Budgets, der für eingereihte asynchrone Cross-VM-Aufrufe reserviert ist |

Wenn das Budget die Contract-Arbeit einer Transaktion ablehnt, schlägt die Transaktion fehl („block wasm gas budget exhausted") und zahlt ihre Gebühr wie jede fehlgeschlagene Transaktion. Versuchen Sie es im nächsten Block erneut, der mit vollem Budget beginnt. Eine Prioritätsgebühr hilft, früh im Block zum Zug zu kommen, bevor das Budget aufgebraucht ist. Ein einzelner Aufruf, der mehr als den Anteil einer Transaktion benötigt, kann nicht laufen, bis die Governance das Budget oder den Anteil erhöht.

### Simulation und Sicherheitsmarge {#simulation}

Eine Simulation **berechnet immer das kalte Laden**, als wäre Ihr Aufruf der erste seines Codes im Block, und sie bepreist die Ausführung mit dem Überlastungsfaktor, den der nächste Block verwenden wird, plus zwei Anstiegsschritte (etwa 2,25x auf den Ausführungsanteil). Eine Schätzung übersteht deshalb ein paar Blöcke steigender Last. Sie ist für einen ersten Aufruf nie zu niedrig.

Verwenden Sie deshalb für jede Contract-Nachricht diese Regel:

1. Simulieren Sie die Transaktion.
2. Multiplizieren Sie das simulierte Gas mit **mindestens 1,3**.
3. Verwenden Sie das Ergebnis als Gaslimit und überschreiten Sie die Transaktionsobergrenze nicht.

### Transaktionsobergrenze {#tx-cap}

Eine Cosmos-Transaktion darf kein Gaslimit über **50,000,000** setzen. Eine Transaktion über der Obergrenze wird abgelehnt, bevor ihre Gebühr erhoben wird.

## Upload-Regeln {#upload}

Das Hochladen von Code (`MsgStoreCode`) bleibt **durch die Governance kontrolliert**: `code_upload_access` ist in beiden Netzwerken `Nobody`, Code wird also über einen Governance-Vorschlag gespeichert. Prüfen Sie es jederzeit:

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/codes/params
```

Ab v3.2.8 wird ein Upload in fester Reihenfolge geprüft, die günstigsten Prüfungen zuerst:

1. **Zugriff.** Der Absender muss von der Upload-Regel zugelassen sein. Der Mempool nimmt Upload-Nachrichten nur von zugelassenen Absendern an.
2. **Gas für die angegebene Größe, im Voraus.** Die Transaktion muss Gas für die Modulgröße übrig haben, die sie angibt, sonst scheitert sie sofort mit Out-of-Gas, bevor irgendetwas entpackt wird.
3. **Inspektion in einem Durchgang.** Das Modul wird einmal entpackt, nie über seine angegebene Größe hinaus, und anhand der folgenden Grenzen geprüft. Ein gzip-Upload muss genau ein gzip-Member sein, das auf die angegebene Größe entpackt wird.
4. **Speicher und Kompilierung.** Der Speicher wird pro Byte berechnet, danach wird das Modul kompiliert.

Typische Upload-Kosten: etwa **9,9 Millionen Gas für ein cw20** und etwa **22,8 Millionen für ein cw721**. Der dichteste Upload, der innerhalb der Grenzen bleibt, kostet etwa 32 Millionen und liegt damit noch innerhalb der Obergrenze von 50,000,000.

### Modulgrenzen {#module-limits}

| Grenze | Wert |
| ----- | ----- |
| Funktionen | höchstens 4,096 |
| Funktionstypen | höchstens 512 |
| Kompilierte Größe (konservative Schätzung) | höchstens 32 MiB |
| Exporte | höchstens 128 |
| Globale Variablen | höchstens 256 |
| Element-Segmente | höchstens 16, mit insgesamt höchstens 2,500 Einträgen |
| Datensegmente | höchstens 1,024 |
| Anfangsspeicher | höchstens 64 Seiten (4 MiB) |
| Benutzerdefinierte Abschnitte | höchstens 128 KiB insgesamt |
| Gleitkommaoperationen | keine erlaubt |

Gleitkommabefehle werden abgelehnt, weil sie auf der Hardware verschiedener Validatoren nicht deterministisch sind. Schreiben Sie Contracts mit Ganzzahl- oder Dezimaltypen aus `cosmwasm-std` und prüfen Sie, dass Ihr Build keine Gleitkommabefehle enthält, bevor Sie ihn der Governance vorlegen.

Die Grenzen werden außerdem **zum Aufrufzeitpunkt für bereits gespeicherten Code** geprüft. Ein früher gespeicherter Code, der eine Grenze verletzt (zum Beispiel durch Gleitkomma), wird beim Aufruf abgelehnt. Contracts, die aus den Standardvorlagen für cw20 und cw721 und den Release-Contracts gebaut wurden, bleiben weit innerhalb aller Grenzen.

## Durchgespieltes Beispiel: einen cw20-Transfer schätzen und ausführen {#worked-example}

Die Nachricht ist der Standard-cw20-`transfer`: `{"transfer": {"recipient": "qor1...", "amount": "1000"}}`. Die Beispiele verwenden das Testnet.

### CLI {#example-cli}

Lassen Sie die CLI mit `--gas auto` simulieren und verwenden Sie eine Anpassung von 1.3 oder mehr. Erstellen Sie die Transaktion mit `--generate-only` und signieren Sie sie mit `tx pqc cosign`, wie im Rest des Handbuchs (siehe [Hybride Signierung](/cli-reference/transaction-commands#hybrid-signing)):

```bash
qorechaind tx wasm execute <contract-addr> \
  '{"transfer":{"recipient":"qor1recipient...","amount":"1000"}}' \
  --from mykey \
  --gas auto --gas-adjustment 1.3 --gas-prices 0.15uqor \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

Die Netzwerk-Untergrenze liegt bei 0,1 uqor pro Gaseinheit; `0.15uqor` lässt Spielraum. Wird Ihr Contract oft im selben Block wie andere Nutzer desselben Codes aufgerufen, deckt das simulierte Limit das kalte Laden bereits ab.

### TypeScript {#example-ts}

Simulieren, mit 1,3 multiplizieren, die Obergrenze prüfen und dann über den hybriden Builder senden. Das folgt dem [Leitfaden für QoreChain Native im SDK](/sdk/guides/cosmwasm#gas), der die vollständigen Imports und die Registrierung des ML-DSA-87-Schlüssels des Kontos enthält.

```ts
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { checkCosmosGasLimit, COSMOS_TX_MAX_GAS } from "@qorechain/sdk";

const cwClient = await SigningCosmWasmClient.connectWithSigner(
  "https://rpc-testnet.qore.host",
  signer,
);

const msgs = [
  {
    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
    value: MsgExecuteContract.fromPartial({
      sender,
      contract: contractAddress,
      msg: new TextEncoder().encode(
        JSON.stringify({ transfer: { recipient, amount: "1000" } }),
      ),
      funds: [],
    }),
  },
];

const simulatedGas = await cwClient.simulate(sender, msgs, undefined);
const gas = Math.ceil(simulatedGas * 1.3);
checkCosmosGasLimit(gas); // throws above COSMOS_TX_MAX_GAS (50,000,000)

const gasPrice = 0.15; // uqor per unit of gas
const fee = {
  amount: [{ denom: "uqor", amount: String(Math.ceil(gas * gasPrice)) }],
  gas: String(gas),
};
// Pass `fee` and `msgs` to signAndBroadcastHybrid exactly as in the SDK guide.
```

`carriesWasmExecution(messages)` zeigt, ob eine Liste von Nachrichten simuliertes Gas benötigt, und `WASM_GAS_MULTIPLIER_MIN` ist das Minimum von 1,3. Wo ein CosmJS-Client `"auto"` als Gebühr akzeptiert, simuliert er für Sie.

### Im Testnet getestet {#example-tested}

Dieser Lauf wurde am 12. November 2026 auf `qorechain-diana` (Release v3.2.8) mit einem eth-nativen Konto, dem TypeScript-SDK 0.13.0 und dem von der Governance gespeicherten cw20-Code (Code-ID 859) durchgeführt. Er signiert die Transaktion, sendet die signierten Bytes an die REST-Simulationsroute und sendet die echte Transaktion mit dem simulierten Gas mal 1,3.

```ts
import { Registry } from "@cosmjs/proto-signing";
import { wasmTypes } from "@cosmjs/cosmwasm-stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { EthNativeSigner, qorechainRegistryTypes } from "@qorechain/sdk";

const registry = new Registry([...qorechainRegistryTypes, ...wasmTypes]);
const signer = new EthNativeSigner(account, { rest: REST, registry });
const signBytesVersion = await signer.resolveSignBytesVersion(CHAIN_ID);

// 1. Sign once with a generous limit, then ask the node what the call needs.
const base = { chainId: CHAIN_ID, accountNumber, sequence, messages: [msg] };
const { txRawBytes } = signer.sign({
  ...base,
  fee: { amount: [{ denom: "uqor", amount: "450000" }], gas: "3000000" },
  signBytesVersion,
});
const sim = await fetch(`${REST}/cosmos/tx/v1beta1/simulate`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ tx_bytes: Buffer.from(txRawBytes).toString("base64") }),
}).then((r) => r.json());

// 2. Send it for real with the simulated gas times 1.3.
const gas = Math.ceil(Number(sim.gas_info.gas_used) * 1.3);
const res = await signer.signAndBroadcast(transport, {
  ...base,
  fee: { amount: [{ denom: "uqor", amount: String(Math.ceil(gas * 0.15)) }], gas: String(gas) },
});
```

Was der Lauf ausgegeben hat:

| Schritt | Ergebnis |
| ---- | ------ |
| cw20 instanziieren (Code 859): simuliert, dann mit diesem Wert mal 1,3 gesendet | simuliert 634,956; Limit 825,443; Code 0, verbrauchtes Gas 629,267 |
| cw20-`transfer`: simuliert | 591,280 Gas |
| Derselbe Transfer mit einem festen Limit von 400,000 | abgelehnt: `out of gas in location: wasm code load; gasWanted: 400000, gasUsed: 564549` (die Gebühr wird dennoch erhoben) |
| Derselbe Transfer mit simuliert x 1,3 (768,664) | Code 0, verbrauchtes Gas 585,151 |
| Drei Transfers in einer Transaktion, simuliert x 1,3 (1,724,456) | Code 0, verbrauchtes Gas 646,169 |

Ein festes Limit von 400,000 scheitert beim ersten Aufruf des Codes in einem Block, das simulierte Limit nicht. Die Gebühr richtet sich nach dem Limit, das Sie anfordern (in diesem Lauf 0,15 uqor pro Gaseinheit), ein größerer Puffer kostet also eine größere Gebühr: Verwenden Sie 1,3, nicht 5.

### Python, Go, Rust und Java {#example-other}

Jedes dieser SDKs simuliert über die REST-Route und bemisst das Limit anhand des Ergebnisses. Sie benötigen eine vollständig zusammengesetzte (signierte) Transaktion, weil die Simulationsroute die Transaktionsstruktur verlangt. Bei einer CosmWasm-Ausführung, -Instanziierung oder -Migration (und einem Cross-VM-Aufruf) heben die SDKs das Limit auf mindestens das 1,3-Fache des simulierten Gas an. Keines hat einen fertigen Builder für cw20- oder CosmWasm-Nachrichten; erstellen Sie die `MsgExecuteContract` daher mit Ihrer Protobuf-Bibliothek und übergeben Sie deren signierte Bytes.

**Python** (`qorechain-sdk`, `qorsdk`): `estimate_gas` und `auto_fee` nehmen die gebaute Transaktion entgegen und wenden für wasm-Nachrichten die Untergrenze von 1,3 an.

```python
from qorsdk import auto_fee, estimate_gas

rest = "https://api-testnet.qore.host"
gas = estimate_gas(rest, built, gas_multiplier=1.3)   # raises above the 50,000,000 cap
fee = auto_fee(rest, built, gas_multiplier=1.3, gas_price="0.15uqor")
```

**Go** (`github.com/qorechain/qorechain-sdk/packages/go/qorechain/tx`): `EstimateGas` liefert das simulierte Gas, `WasmGasWanted` wendet die Untergrenze von 1,3 an, und `EstimateFee` bepreist einen übergebenen Multiplikator (es fügt die Untergrenze nicht selbst hinzu, übergeben Sie also 1,3 oder mehr).

```go
used, err := tx.EstimateGas("https://api-testnet.qore.host", txBytes, nil)
if err != nil { return err }
gas := tx.WasmGasWanted(used, 1.3)

fee, err := tx.EstimateFee("https://api-testnet.qore.host", txBytes, 1.3, "0.15uqor", nil)
```

**Rust** (`qorechain-sdk`): `estimate_gas_wanted` hebt das Limit für wasm- und Cross-VM-Nachrichten auf mindestens das 1,3-Fache des simulierten Gas an, und `estimate_fee` bepreist es.

```rust
use qorechain_sdk::tx::{estimate_fee, estimate_gas_wanted};

let est = estimate_gas_wanted("https://api-testnet.qore.host", &tx_bytes, 1.3).await?;
// est.simulated, est.gas_wanted
let fee = estimate_fee("https://api-testnet.qore.host", &tx_bytes, 1.3, "0.15uqor").await?;
```

**Java** (`io.github.qorechain.tx.AutoGas`): Übergeben Sie `true` als letztes Argument, wenn die Transaktion wasm- oder Cross-VM-Nachrichten enthält.

```java
AutoGas.Estimate est = AutoGas.estimate(
    "https://api-testnet.qore.host", txBytes, /* hybrid */ true, 1.3, null, /* wasmOrCrossVm */ true);
// est.simulatedGas, est.gasWanted
```

### REST-Simulationsroute {#example-rest}

`POST /cosmos/tx/v1beta1/simulate` mit dem Base64 einer signierten Transaktion liefert `gas_info.gas_used`. Multiplizieren Sie den Wert mit 1,3 für das Limit.

```bash
curl -s -X POST https://api-testnet.qore.host/cosmos/tx/v1beta1/simulate \
  -H 'Content-Type: application/json' \
  -d '{"tx_bytes":"<base64 of the signed TxRaw>"}'
```

Die Antwort enthält `gas_info.gas_used` (einen String). Die Route akzeptiert nur POST: Ein `GET` darauf antwortet mit `501 Not Implemented`.

## Grenzen und Fehler {#limits-errors}

| Situation | Was Sie sehen | Was zu tun ist |
| --------- | ------------ | ---------- |
| Gaslimit über 50,000,000 | Abgelehnt, bevor die Gebühr erhoben wird | Limit senken; die Arbeit auf mehrere Transaktionen aufteilen |
| Out-of-Gas bei einem Contract-Aufruf | Die Transaktion schlägt mit einem Out-of-Gas-Fehler fehl | Simulieren und mindestens das 1,3-Fache des Ergebnisses verwenden; nie einen festen Wert wiederverwenden |
| Contract-Budget des Blocks aufgebraucht | Fehler mit Verweis auf das Block-wasm-Gas-Budget; Gebühr bezahlt | Im nächsten Block erneut versuchen, optional mit einer Prioritätsgebühr |
| Ein Aufruf braucht mehr als den Anteil einer Transaktion | Schlägt jedes Mal fehl | Die Governance bitten, Budget oder Anteil zu erhöhen, oder den Aufruf günstiger machen |
| Upload durch einen Absender ohne Zugriff | Bei der Annahme abgelehnt | Code über einen Governance-Vorschlag einreichen |
| Upload ohne genug Gas für die angegebene Größe | Sofort Out-of-Gas | Das Gas so setzen, dass es die angegebene Größe deckt (etwa 9,9 Millionen für cw20) |
| Upload über einer Modulgrenze | Beim Upload abgelehnt | Funktionen, Exporte, globale Variablen, Segmente oder Speicher reduzieren (siehe Tabelle oben) |
| Gleitkommabefehle in einem Modul | Beim Upload abgelehnt, und bei gespeichertem Code beim Aufruf | Gleitkommaoperationen aus dem Build entfernen |
| Gzip-Upload, der kein einzelnes Member ist oder dessen Größe nicht stimmt | Abgelehnt | Das Modul als einzelnen gzip-Stream mit der richtigen Größe komprimieren |

## Verwandte Seiten {#related}

- [QoreChain-Native-Leitfaden (SDK): Gas für Contract-Aufrufe](/sdk/guides/cosmwasm#gas)
- [QoreChain-Native-Entwicklung](/developer-guide/cosmwasm-development)
- [Cross-VM-Interoperabilität](/developer-guide/cross-vm-interoperability)
- [Hybride Signierung und `tx pqc cosign`](/cli-reference/transaction-commands#hybrid-signing)
- [Governance](/user-guide/governance)
