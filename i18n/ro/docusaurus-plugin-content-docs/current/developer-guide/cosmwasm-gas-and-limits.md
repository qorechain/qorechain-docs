---
slug: /developer-guide/cosmwasm-gas-and-limits
title: Gaz, prețuri și limite de încărcare CosmWasm
sidebar_label: Gaz și limite CosmWasm
sidebar_position: 6
---

# Gaz, prețuri și limite de încărcare CosmWasm

Contractele QoreChain Native (numele sub care QoreChain își denumește mediul de execuție CosmWasm) sunt tarifate după costul pe care îl are rularea lor pentru un validator. Începând cu versiunea **v3.2.8**, prețul unui apel de contract depinde de trei lucruri: dacă codul contractului este deja încărcat în memorie pentru blocul curent, cât de aglomerat este blocul cu lucru de contract și câtă memorie atinge apelul. Încărcările de cod sunt limitate ca dimensiune și ca formă.

:::note Mai întâi testnet
v3.2.8 rulează pe testnet-ul **`qorechain-diana`** din 12 noiembrie 2026. Mainnet-ul (`qorechain-vladi`) o aplică printr-un upgrade ulterior de guvernanță, deci cifrele de mai jos descriu testnet-ul de azi și mainnet-ul după acel upgrade. Fiecare comandă folosește `--chain-id qorechain-diana`; înlocuiți cu `qorechain-vladi` după ce mainnet-ul s-a actualizat.
:::

## De ce contează {#why}

- Un apel de contract care a mers ieri cu o limită fixă de gaz poate rămâne azi fără gaz, deoarece primul apel al unui cod într-un bloc costă de câteva ori mai mult decât o repetare. O limită fixă este o presupunere care eșuează exact în cel mai prost moment.
- Comisioanele urmează încărcarea. Când blocurile sunt pline de apeluri de contract, prețul execuției de contract crește, iar când nu sunt, scade la loc.
- Fiecare bloc are o cantitate limitată de lucru de contract. Un apel care nu încape eșuează și își plătește comisionul ca orice tranzacție eșuată.

Regula scurtă: **simulați, înmulțiți rezultatul cu cel puțin 1.3 și nu fixați niciodată gazul în cod pentru un apel de contract.**

## Modelul de gaz {#gas-model}

### Costul încărcării codului {#code-load}

Înainte ca un contract să ruleze, codul lui compilat trebuie încărcat. Primul apel al unui cod într-un bloc plătește această încărcare. Apelurile ulterioare către același cod, în același bloc, sunt ieftine, deoarece codul este deja în memorie.

| Apel | Gaz aproximativ |
| ---- | --------------- |
| cw20 `transfer`, primul apel al codului într-un bloc (un mesaj, gaz utilizat măsurat) | 585,151 |
| cw20 `transfer`, trei apeluri într-o tranzacție, deci două repetări în același bloc (gaz utilizat măsurat, total) | 646,169 |
| Același apel singular, așa cum îl raportează simularea | 591,280 |

Aceste cifre au fost măsurate pe testnet pe 12 noiembrie 2026 cu codul cw20 revizuit pe care l-a stocat guvernanța (factor de aglomerare 1x). O repetare a aceluiași cod în același bloc adaugă în practică doar aproximativ 30,500 de gaz. Simularea raportează mai mult decât folosește o tranzacție, deoarece taxează mereu încărcarea la rece și adaugă o marjă pentru aglomerare: trei apeluri au fost simulate la 1,326,504 și au folosit 646,169. Cifrele depind de cod și de apel, așa că măsurați propriul contract. În detaliu, încărcarea se taxează integral la primul apel al unui cod într-un bloc, următoarele opt apeluri către acel cod în același bloc nu plătesc încărcare, iar fiecare apel de după aceea din bloc plătește o optime din ea. Setul codurilor încărcate pornește gol la fiecare bloc, așa că fiecare validator taxează aceleași apeluri. Aceasta se aplică la instantiate, execute, migrate și la apelurile făcute din alt contract sau din puntea cross-VM.

**Codurile fixate (pinned) sar peste taxa de încărcare.** Guvernanța poate fixa un cod popular astfel încât validatorii să îl țină încărcat, iar apelurile către un cod fixat nu plătesc niciodată costul de încărcare. Verificați ce coduri sunt fixate:

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/codes/pinned
```

### Inițializarea apelului și memoria {#setup}

Fiecare apel plătește și o mică taxă de inițializare (un cost de bază, un cost pe pagină de 64 KiB de memorie inițială și un cost pe segment de date) și o taxă pentru fiecare pagină de memorie pe care o extinde. Contractele care țin memoria mică sunt mai ieftine.

### Prețul de aglomerare {#congestion}

Gazul de execuție al contractelor se înmulțește cu un **factor de aglomerare**.

| Proprietate | Valoare |
| ----------- | ------- |
| Interval | de la 1x până la 20x implicit |
| Plafon de guvernanță | Guvernanța poate seta maximul până la 100x |
| Când crește | Doar când blocurile sunt pline: după un bloc care a folosit mai mult de jumătate din bugetul lui de contract (ținta implicită) factorul crește, și crește mai repede când bugetul a fost epuizat |
| Când scade | După un bloc care a folosit mai puțin decât ținta |

Factorul scalează doar execuția contractelor. Stocarea, inițializarea apelului și încărcarea de cod nu se înmulțesc. Factorul era 1x când au fost măsurate transferurile de mai sus.

Citiți valorile live:

```bash
qorechaind query crossvm params --node https://rpc-testnet.qore.host:443
```

Câmpurile de urmărit sunt `wasm_congestion_factor_micro` (factorul în vigoare, în milionimi, deci `1000000` înseamnă 1x), `wasm_congestion_max_factor`, `wasm_congestion_target_bps`, `max_block_wasm_gas` și `max_tx_wasm_share_bps`.

### Bugetul de contract pe bloc {#budget}

Fiecare bloc are un buget de lucru de contract. Valorile implicite sunt:

| Parametru | Implicit | Semnificație |
| --------- | -------- | ------------ |
| `max_block_wasm_gas` | 3,000,000 | Execuția de contract pe care toate tranzacțiile împreună o pot folosi într-un bloc |
| `max_tx_wasm_share_bps` | 5,000 (jumătate) | Partea din acel buget pe care o poate folosi o singură tranzacție, deci 1,500,000 la valoarea implicită |
| `queue_wasm_reserve_bps` | 2,500 | Partea din buget rezervată apelurilor cross-VM asincrone aflate în coadă |

Când bugetul refuză lucrul de contract al unei tranzacții, tranzacția eșuează („block wasm gas budget exhausted") și își plătește comisionul ca orice tranzacție eșuată. Reîncercați în blocul următor, care pornește cu un buget complet. Un comision de prioritate vă ajută să intrați devreme într-un bloc, înainte ca bugetul să fie consumat. Un singur apel care are nevoie de mai mult decât partea unei tranzacții nu poate rula până când guvernanța nu mărește bugetul sau partea.

### Simularea și marja de siguranță {#simulation}

O simulare **taxează mereu încărcarea la rece**, ca și cum apelul dumneavoastră ar fi primul al codului său în bloc, și tarifează execuția la factorul de aglomerare pe care îl va folosi blocul următor plus două trepte de creștere (aproximativ 2.25x pe partea de execuție). O estimare rezistă astfel câtorva blocuri de încărcare în creștere. Nu este niciodată prea mică pentru un prim apel.

Din acest motiv, folosiți această regulă pentru fiecare mesaj de contract:

1. Simulați tranzacția.
2. Înmulțiți gazul simulat cu **cel puțin 1.3**.
3. Folosiți rezultatul drept limită de gaz și nu depășiți plafonul tranzacției.

### Plafonul tranzacției {#tx-cap}

O tranzacție Cosmos nu poate seta o limită de gaz peste **50,000,000**. O tranzacție peste plafon este refuzată înainte să i se taxeze comisionul.

## Reguli de încărcare {#upload}

Încărcarea de cod (`MsgStoreCode`) rămâne **controlată de guvernanță**: `code_upload_access` este `Nobody` pe ambele rețele, deci codul se stochează printr-o propunere de guvernanță. Verificați oricând:

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/codes/params
```

Începând cu v3.2.8, o încărcare este verificată într-o ordine fixă, cu verificările cele mai ieftine primele:

1. **Acces.** Expeditorul trebuie să fie permis de regula de încărcare. Mempool-ul admite mesaje de încărcare doar de la expeditori permiși.
2. **Gaz pentru dimensiunea declarată, de la început.** Tranzacția trebuie să aibă gaz rămas pentru dimensiunea de modul pe care o declară, altfel rămâne imediat fără gaz, înainte să se despacheteze ceva.
3. **Inspecție dintr-o singură trecere.** Modulul se despachetează o singură dată, niciodată dincolo de dimensiunea declarată, și se inspectează față de limitele de mai jos. O încărcare gzip trebuie să fie exact un singur membru gzip care se despachetează la dimensiunea pe care o declară.
4. **Stocare și compilare.** Stocarea se taxează pe octet, apoi modulul se compilează.

Costuri tipice de încărcare: aproximativ **9.9 milioane de gaz pentru un cw20** și aproximativ **22.8 milioane pentru un cw721**. Cea mai densă încărcare care rămâne în limite costă aproximativ 32 de milioane, încă în interiorul plafonului de 50,000,000.

### Limitele modulului {#module-limits}

| Limită | Valoare |
| ------ | ------- |
| Funcții | cel mult 4,096 |
| Tipuri de funcții | cel mult 512 |
| Dimensiune compilată (estimare conservatoare) | cel mult 32 MiB |
| Exporturi | cel mult 128 |
| Globale | cel mult 256 |
| Segmente de elemente | cel mult 16, cu cel mult 2,500 de intrări în total |
| Segmente de date | cel mult 1,024 |
| Memorie inițială | cel mult 64 de pagini (4 MiB) |
| Secțiuni personalizate | cel mult 128 KiB în total |
| Operații în virgulă mobilă | niciuna permisă |

Instrucțiunile în virgulă mobilă sunt refuzate deoarece nu sunt deterministe pe hardware-ul diferit al validatorilor. Scrieți contractele cu tipuri întregi sau zecimale din `cosmwasm-std` și verificați că build-ul dumneavoastră nu conține instrucțiuni în virgulă mobilă înainte să îl trimiteți la guvernanță.

Limitele se verifică și **la momentul apelului pentru codul deja stocat**, deci un cod stocat mai devreme care încalcă o limită (de exemplu virgulă mobilă) este refuzat când este apelat. Contractele construite din șabloanele standard cw20 și cw721 și contractele de release rămân bine în interiorul tuturor limitelor.

## Exemplu detaliat: estimați și executați un transfer cw20 {#worked-example}

Mesajul este `transfer` standard cw20: `{"transfer": {"recipient": "qor1...", "amount": "1000"}}`. Exemplele folosesc testnet-ul.

### CLI {#example-cli}

Lăsați CLI să simuleze cu `--gas auto` și folosiți o ajustare de 1.3 sau mai mare. Construiți tranzacția cu `--generate-only` și semnați-o cu `tx pqc cosign`, ca în restul manualului (vezi [Semnarea hibridă](/cli-reference/transaction-commands#hybrid-signing)):

```bash
qorechaind tx wasm execute <contract-addr> \
  '{"transfer":{"recipient":"qor1recipient...","amount":"1000"}}' \
  --from mykey \
  --gas auto --gas-adjustment 1.3 --gas-prices 0.15uqor \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

Pragul minim al rețelei este 0.1 uqor pe unitate de gaz; `0.15uqor` lasă o marjă. Dacă contractul dumneavoastră este apelat des în același bloc cu alți utilizatori ai aceluiași cod, limita simulată acoperă deja încărcarea la rece.

### TypeScript {#example-ts}

Simulați, înmulțiți cu 1.3, verificați plafonul, apoi trimiteți prin constructorul hibrid. Aceasta urmează [ghidul SDK QoreChain Native](/sdk/guides/cosmwasm#gas), care are importurile complete și înregistrarea cheii ML-DSA-87 a contului.

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

SDK 0.14.0 aplică el însuși aceleași reguli: refuză o limită de gaz Cosmos peste 50.000.000 înainte de semnare, dă tranzacțiilor CosmWasm și cross-VM cel puțin 1,3 ori gazul simulat și nu folosește niciodată o valoare fixă de rezervă pentru ele. `carriesWasmExecution(messages)` vă spune dacă o listă de mesaje are nevoie de gaz simulat, iar `WASM_GAS_MULTIPLIER_MIN` este minimul de 1.3. Acolo unde un client CosmJS acceptă `"auto"` drept comision, simulează în locul dumneavoastră.

### Testat pe testnet {#example-tested}

Această rulare a fost făcută pe `qorechain-diana` pe 12 noiembrie 2026 (release v3.2.8) cu un cont eth-native, SDK-ul TypeScript 0.13.0 și codul cw20 pe care l-a stocat guvernanța (code id 859). Semnează tranzacția, trimite bytes-ii semnați la ruta REST de simulare și trimite tranzacția reală cu gazul simulat înmulțit cu 1.3.

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

Ce a afișat rularea:

| Pas | Rezultat |
| --- | -------- |
| Instantiate cw20 (cod 859): simulat, apoi trimis cu rezultatul înmulțit cu 1.3 | simulat 634,956; limită 825,443; cod 0, gaz utilizat 629,267 |
| cw20 `transfer`: simulat | 591,280 de gaz |
| Același transfer cu o limită fixă de 400,000 | refuzat: `out of gas in location: wasm code load; gasWanted: 400000, gasUsed: 564549` (comisionul se taxează totuși) |
| Același transfer cu simulat x 1.3 (768,664) | cod 0, gaz utilizat 585,151 |
| Trei transferuri într-o tranzacție, simulat x 1.3 (1,724,456) | cod 0, gaz utilizat 646,169 |

O limită fixă de 400,000 eșuează la primul apel al codului într-un bloc, iar limita simulată nu. Comisionul se stabilește pe limita pe care o cereți (0.15 uqor pe unitate de gaz în această rulare), deci o marjă mai mare costă un comision mai mare: folosiți 1.3, nu 5.

### Python, Go, Rust și Java {#example-other}

Fiecare dintre aceste SDK-uri simulează pe ruta REST și dimensionează limita pornind de la rezultat. Au nevoie de o tranzacție complet asamblată (semnată), deoarece ruta de simulare cere structura tranzacției. Pentru un execute, instantiate sau migrate CosmWasm (și pentru un apel cross-VM), SDK-urile ridică limita la cel puțin 1.3 ori gazul simulat. Niciunul nu are un constructor de mesaje cw20 sau CosmWasm gata făcut, așa că construiți `MsgExecuteContract` cu biblioteca dumneavoastră protobuf și transmiteți bytes-ii lui semnați.

**Python** (`qorechain-sdk`, `qorsdk`): `estimate_gas` și `auto_fee` primesc tranzacția construită și aplică pragul de 1.3 pentru mesajele wasm.

```python
from qorsdk import auto_fee, estimate_gas

rest = "https://api-testnet.qore.host"
gas = estimate_gas(rest, built, gas_multiplier=1.3)   # raises above the 50,000,000 cap
fee = auto_fee(rest, built, gas_multiplier=1.3, gas_price="0.15uqor")
```

**Go** (`github.com/qorechain/qorechain-sdk/packages/go/qorechain/tx`): `EstimateGas` returnează gazul simulat, `WasmGasWanted` aplică pragul de 1.3, iar `EstimateFee` tarifează un multiplicator pe care îl transmiteți (nu adaugă el însuși pragul, deci transmiteți 1.3 sau mai mult).

```go
used, err := tx.EstimateGas("https://api-testnet.qore.host", txBytes, nil)
if err != nil { return err }
gas := tx.WasmGasWanted(used, 1.3)

fee, err := tx.EstimateFee("https://api-testnet.qore.host", txBytes, 1.3, "0.15uqor", nil)
```

**Rust** (`qorechain-sdk`): `estimate_gas_wanted` ridică limita la cel puțin 1.3 ori gazul simulat pentru mesajele wasm și cross-VM, iar `estimate_fee` o tarifează.

```rust
use qorechain_sdk::tx::{estimate_fee, estimate_gas_wanted};

let est = estimate_gas_wanted("https://api-testnet.qore.host", &tx_bytes, 1.3).await?;
// est.simulated, est.gas_wanted
let fee = estimate_fee("https://api-testnet.qore.host", &tx_bytes, 1.3, "0.15uqor").await?;
```

**Java** (`io.github.qorechain.tx.AutoGas`): transmiteți `true` ca ultim argument când tranzacția conține mesaje wasm sau cross-VM.

```java
AutoGas.Estimate est = AutoGas.estimate(
    "https://api-testnet.qore.host", txBytes, /* hybrid */ true, 1.3, null, /* wasmOrCrossVm */ true);
// est.simulatedGas, est.gasWanted
```

### Ruta REST de simulare {#example-rest}

`POST /cosmos/tx/v1beta1/simulate` cu base64 al unei tranzacții semnate returnează `gas_info.gas_used`. Înmulțiți-l cu 1.3 pentru limită.

```bash
curl -s -X POST https://api-testnet.qore.host/cosmos/tx/v1beta1/simulate \
  -H 'Content-Type: application/json' \
  -d '{"tx_bytes":"<base64 of the signed TxRaw>"}'
```

Răspunsul conține `gas_info.gas_used` (un șir). Ruta acceptă doar POST: un `GET` pe ea răspunde cu `501 Not Implemented`.

## Limite și erori {#limits-errors}

| Situație | Ce vedeți | Ce faceți |
| -------- | --------- | --------- |
| Limită de gaz peste 50,000,000 | Refuzată înainte să se taxeze comisionul | Reduceți limita; împărțiți lucrul pe mai multe tranzacții |
| Fără gaz la un apel de contract | Tranzacția eșuează cu o eroare de lipsă de gaz | Simulați și folosiți cel puțin 1.3 ori rezultatul; nu reutilizați o valoare fixă |
| Bugetul de contract al blocului epuizat | Eșec care menționează bugetul de gaz wasm al blocului; comision plătit | Reîncercați în blocul următor, opțional cu un comision de prioritate |
| Un apel are nevoie de mai mult decât partea unei tranzacții | Eșuează de fiecare dată | Cereți guvernanței să mărească bugetul sau partea, sau faceți apelul mai ieftin |
| Încărcare de la un expeditor fără acces | Refuzată la admitere | Trimiteți codul printr-o propunere de guvernanță |
| Încărcare fără gaz suficient pentru dimensiunea declarată | Fără gaz imediat | Setați gazul astfel încât să acopere dimensiunea declarată (aproximativ 9.9 milioane pentru cw20) |
| Încărcare peste o limită de modul | Refuzată la încărcare | Reduceți funcțiile, exporturile, globalele, segmentele sau memoria (vezi tabelul de mai sus) |
| Instrucțiuni în virgulă mobilă într-un modul | Refuzat la încărcare și, pentru codul stocat, la apel | Eliminați operațiile în virgulă mobilă din build |
| Încărcare gzip care nu este un singur membru sau a cărei dimensiune este greșită | Refuzată | Comprimați modulul ca un singur flux gzip, cu dimensiunea corectă |

## Pagini conexe {#related}

- [Ghidul QoreChain Native (SDK): gaz pentru apelurile de contract](/sdk/guides/cosmwasm#gas)
- [Dezvoltare QoreChain Native](/developer-guide/cosmwasm-development)
- [Interoperabilitate cross-VM](/developer-guide/cross-vm-interoperability)
- [Semnarea hibridă și `tx pqc cosign`](/cli-reference/transaction-commands#hybrid-signing)
- [Guvernanță](/user-guide/governance)
