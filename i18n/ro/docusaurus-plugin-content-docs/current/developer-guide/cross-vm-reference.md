---
slug: /developer-guide/cross-vm-reference
title: Referință pentru apelurile între VM-uri (v3.2.8)
sidebar_label: Referință între VM-uri
sidebar_position: 9
---

# Referință pentru apelurile între VM-uri (v3.2.8)

Un apel între VM-uri permite codului de pe o mașină virtuală să ruleze un contract de pe alta: un cont sau un contract QoreChain Native care apelează un contract EVM, un cont care apelează un contract QoreChain Native (CosmWasm), un contract Solidity care apelează un contract QoreChain Native și așa mai departe. Există două moduri de a face un astfel de apel. Un apel **sincron** rulează în interiorul propriei tranzacții și returnează răspunsul imediat. Un apel **asincron** este pus într-o coadă și rulează într-un bloc ulterior.

Această pagină este referința de câmpuri, costuri și limite pentru versiunea v3.2.8, cu un exemplu lucrat pentru fiecare direcție. Conceptele, ciclul de viață și comportamentul mai vechi se găsesc în [Interoperabilitate între VM-uri](/developer-guide/cross-vm-interoperability); ghidul pentru SDK este în [ghidul Cross-VM](/sdk/guides/cross-vm).

:::note Unde rulează v3.2.8
Testnet-ul **`qorechain-diana`** rulează **v3.2.8** din 12 noiembrie 2026. Mainnet-ul **`qorechain-vladi`** nu a aplicat-o încă, iar pe mainnet `MsgCrossVMCall` este oprit. Tot ce este marcat "v3.2.8" mai jos este deocamdată comportament de testnet.
:::

:::caution Este mesajul de apel disponibil chiar acum?
Pe testnet, `MsgCrossVMCall` a fost pus în pauză de upgrade. Propunerea de guvernanță 37 a trecut și a ridicat pauza, deci apelul este deschis pe testnet (verificat la 12 noiembrie 2026: lista circuit breaker-ului conține doar `/cosmwasm.wasm.v1.MsgStoreCode`). Pe mainnet rămâne oprit. Dacă apelul este disponibil la un moment dat se vede din două lucruri: parametrii modulului (`enabled`) și lista circuit breaker-ului. Verifică-le pe amândouă înainte de a construi ceva pe el:

```bash
# Module parameters: look for "enabled": true
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params

# Circuit breaker list: the call is paused while this contains /qorechain.crossvm.v1.MsgCrossVMCall
curl -s https://api-testnet.qore.host/cosmos/circuit/v1/disable_list
```

Ruta listei are prin REST numele `disable_list` (varianta `disabled_list` răspunde `501`). Echivalentul în linia de comandă pe un nod este `qorechaind query circuit disabled-list`. Cât timp apelul este în pauză, o tranzacție care îl conține este refuzată, iar apelurile din coadă rămân în așteptare până expiră, dacă pauza nu este ridicată mai întâi. Înainte ca propunerea 37 să treacă, lista conținea `/qorechain.crossvm.v1.MsgCrossVMCall`; pe testnet nu îl mai conține. Vezi [Testat pe testnet](#tested) pentru ce s-a trimis.
:::

## De ce contează {#why}

- **Costul este previzibil.** Un apel în coadă către QoreChain Native își arată prețul de la început: alegi cât din munca contractului poate folosi și cel mai mare factor de congestie pe care îl accepți, banii sunt ținuți în escrow, iar ce nu folosește apelul ți se returnează.
- **Un cont nu îi poate bloca pe ceilalți.** Un expeditor poate avea cel mult 100 de apeluri în coadă simultan, astfel încât coada comună rămâne utilizabilă.
- **Un apel eșuat nu este niciodată gratuit.** Un apel care eșuează plătește totuși munca depusă, în orice direcție, deci a prinde un eșec și a reîncerca cu același gaz nu funcționează.
- **Partea EVM rămâne în fereastra ta.** Un apel în EVM pe care nu l-ai semnat tu însuți și puntea EVM de la `0x0901` sunt admise doar de o [fereastră de autorizare EVM](/developer-guide/evm-window-reference) deschisă.

## Apeluri sincrone și asincrone {#sync-async}

| | Sincron (implicit) | Asincron (`async = true`) |
| --- | --- | --- |
| Când rulează | În interiorul tranzacției tale | La sfârșitul unui bloc ulterior, din coadă |
| Gaz | Gazul propriu al tranzacției tale | Un buget plătit în avans, stabilit (vezi [Cost](#cost)) |
| Răspuns | Returnat în răspunsul tranzacției, câmpul `data` | Nereturnat; citești mesajul terminat după id |
| Dacă ținta eșuează | Întreaga tranzacție este anulată | Doar acel apel este înregistrat ca `failed`; tranzacția ta rămâne |
| Fonduri | `funds` pot fi atașate pentru o țintă QoreChain Native | La fel; un apel async cu fonduri către un lane care nu le poate purta este refuzat la trimitere |
| Potrivit pentru | Orice are nevoie de rezultat acum | Muncă de tip trimite și uită, și apeluri al căror gaz vrei să îl limitezi |

Un mesaj din coadă trece prin `pending`, apoi `executed`, `failed` sau `timed_out`. Expiră după `queue_timeout_blocks` (100 pe testnet). Coada rulează cel mai vechi mesaj primul, iar trecerea de la sfârșitul blocului rulează cel mult 50 de apeluri per bloc.

### Cine pe cine apelează, sync sau async {#who-calls-whom}

Care dintre cele două moduri poate fi folosit depinde de cine trimite apelul.

| Apelant | Țintă | Sincron | Asincron |
| --- | --- | --- | --- |
| Cont (semnează tranzacția) | EVM, QoreChain Native | Da (implicit) | Da |
| Contract QoreChain Native, care trimite `MsgCrossVMCall` ca el însuși | EVM | Da (`async` false, implicit) | Da |
| Contract QoreChain Native, care trimite `MsgCrossVMCall` ca el însuși | QoreChain Native | Refuzat (propriul lane) | Refuzat (propriul lane) |
| Contract apelat de puntea EVM de la `0x0901` (sub punte) | SVM | Da | Nefolosit |
| Contract apelat de puntea EVM de la `0x0901` (sub punte) | EVM | Nefolosit | Da |

Un contract QoreChain Native care trimite `MsgCrossVMCall` ca el însuși poate apela EVM în ambele moduri. Sincron (`async` false, implicit) rulează pe gazul propriu al tranzacției, răspunsul revine în `MsgCrossVMCallResponse.data`, iar un eșec anulează întreaga tranzacție. Asincron pune apelul în coadă. Ambele au fost rulate înainte pe testnet: apelul sincron la înălțimea 9.795.779 și cel asincron la înălțimea 9.795.783.

Fraza "sync către SVM, async către EVM" se aplică doar sub puntea `0x0901`: pentru un contract apelat de puntea EVM, ce trimite acel contract poate merge sincron către SVM și asincron către EVM. Nu este o regulă pentru un contract care acționează ca el însuși, care poate folosi oricare dintre moduri către EVM.

## Câmpurile MsgCrossVMCall {#fields}

Type URL `/qorechain.crossvm.v1.MsgCrossVMCall`.

| Câmp | Număr | Semnificație |
| ----- | ------ | ------- |
| `sender` | 1 | Adresa ta `qor1...`. Ea semnează mesajul. |
| `source_vm` | 2 | Ignorat de lanț. Lanțul stabilește singur de unde vine apelul. Este totuși trimis ca nodurile mai vechi să accepte mesajul. |
| `target_vm` | 3 | `evm`, `cosmwasm` sau `svm`. Un apel în propriul lane este refuzat. Lane-ul SVM este deschis pe testnet din propunerea 37 și oprit pe mainnet; vezi [Lane-ul SVM](/developer-guide/svm-lane-v328). Niciun apel în SVM nu a fost rulat pentru această pagină. |
| `target_contract` | 4 | O adresă EVM (`0x` și 40 de cifre hex, nu o adresă de precompile) sau o adresă de contract `qor1...`. |
| `payload` | 5 | Datele apelului: codificate ABI pentru EVM, mesajul JSON de execuție ca UTF-8 pentru QoreChain Native. Cel mult `max_message_size` octeți (65.536). |
| `funds` | 6 | Monede de atașat (doar ținte QoreChain Native). |
| `async` | 7 | `true` pune apelul în coadă; `false` (implicit) îl rulează acum. |
| `async_gas_limit` | 8 | v3.2.8, doar async către QoreChain Native: unitățile de gaz de contract pe care rulează apelul din coadă. `0` sau nesetat înseamnă 500.000. Permis de la 250.000 până la cât poate rula coada într-un bloc (1.875.000 la bugetul implicit). |
| `async_max_factor` | 9 | v3.2.8, doar async către QoreChain Native: cel mai mare factor de congestie pe care îl plătești, în **milionimi**: `1000000` înseamnă 1x, iar `4000000` înseamnă 4x. Intervalul valid este de la 1.000.000 la 100.000.000 (1x până la 100x); un multiplu simplu precum `4` este refuzat cu codespace `crossvm` cod 2 înainte să ruleze ceva. `0` sau nesetat înseamnă de patru ori factorul de la trimitere (4.000.000 de milionimi când factorul este 1x), limitat la maximul lanțului. O valoare sub factorul în vigoare este refuzată la trimitere. |

În linia de comandă, cele două câmpuri noi sunt `--async-gas-limit` (un număr întreg) și `--async-max-factor` (o zecimală precum `2.5`, pe care comanda o transformă în milionimi). Într-un mesaj brut, în SDK și în formele REST sau JSON, valoarea este întotdeauna în milionimi: 2,5x este `2500000`. SDK-ul exportă `CROSSVM_ASYNC_FACTOR_ONE` (1.000.000) pentru a converti un multiplu în milionimi și `validateCrossVmAsyncGas` pentru a verifica cele două valori înainte de trimitere.

## Cost, escrow și rambursări {#cost}

Pentru un **apel async către QoreChain Native** (v3.2.8):

1. **Escrow.** Plata în avans este unități înmulțit cu factor înmulțit cu prețul gazului și este ținută, nu cheltuită. Cu valorile implicite înseamnă 500.000 de unități x 4 (4.000.000 de milionimi) x 0,1 uqor = 200.000 uqor, adică **0,2 QOR**. Se mută din soldul tău în contul `crossvm_async_escrow`. Ai nevoie de atâția uqor cheltuibili: monedele de vesting blocate, fee grant-urile și comisioanele plătite în alte tokenuri nu o pot finanța, iar un astfel de apel este refuzat.
2. **Taxa de loc în coadă.** Fiecare apel async plătește și o taxă de loc, sub formă de gaz, la trimitere: 500.000 de gaz într-o coadă goală, crescând odată cu umplerea cozii până la 2.000.000 de gaz într-una plină. La prețul de 0,1 uqor per gaz, asta înseamnă de la 0,05 QOR până la 0,2 QOR.
3. **Decontare.** Când apelul se termină, gazul folosit la factorul în vigoare atunci este plătit din escrow ca taxă, iar restul ți se returnează. Un apel care eșuează plătește ce a folosit. Un apel care expiră sau nu este rulat niciodată primește înapoi tot escrow-ul, iar taxa lui de loc este taxa de procesare. Evenimentul `crossvm_escrow_settled` poartă taxa și rambursarea.
4. **Așteptarea factorului.** Apelul rulează cât timp factorul de congestie este egal sau sub `async_max_factor`. Dacă factorul este mai mare, așteaptă și expiră dacă factorul rămâne mare. Cu valoarea implicită (de patru ori factorul de la trimitere, 4.000.000 de milionimi când factorul este 1x), factorul trebuie să crească de mai mult de patru ori înainte ca apelul să aștepte.
5. **Limite de dimensiune.** Plata în avans nu poate depăși 50.000.000 de gaz. Peste această valoare apelul este refuzat la trimitere: reîncearcă mai târziu sau coboară `async_gas_limit`.

Pentru un **apel async către EVM**, bugetul plătit în avans este 1.000.000 de gaz, taxat la trimitere. Pentru un apel **sincron**, costul este gazul propriu al tranzacției. Contractele QoreChain Native grele, care încarcă cod mare, au nevoie de un `async_gas_limit` și un `async_max_factor` mai mari decât cele implicite la primul lor apel dintr-un bloc.

### Apelurile eșuate sunt taxate {#failed-charged}

Un apel între VM-uri care eșuează plătește totuși munca depusă. Un apel EVM care face revert sau rămâne fără gaz consumă din apelant gazul EVM folosit, iar un apel QoreChain Native făcut prin puntea `0x0901` care eșuează consumă din frame-ul EVM apelant gazul cheltuit de contract. Un contract care vrea să supraviețuiască unui apelat costisitor care eșuează ar trebui să seteze o limită de gaz pe sub-apel în loc să reîncerce cu același gaz rămas.

## Coada de apeluri în așteptare {#pending}

- **Cel mult 100 de apeluri în așteptare per expeditor** (`max_pending_per_sender`). Un apel async în plus este refuzat cu `ErrQueueFull` (codespace `crossvm`, cod 4) până când unul dintre ale tale a rulat sau a expirat. Apelurile sincrone nu sunt afectate.
- **Întreaga coadă ține cel mult `max_queue_size`** apeluri (1.000).
- **Lista de apeluri în așteptare este paginată.** Fiecare pagină ține cel mult 100 de mesaje, iar fiecare payload din listă este tăiat la primii **1.024 de octeți** (`payload_hex`). Pentru a citi un payload complet, ia mesajul după id.
- **Limita paginii este plafonată.** Un `pagination.limit` de 0 sau peste 100 este plafonat în tăcere la 100. O cerere cu `limit=101` răspunde `200` cu cel mult 100 de elemente, nu cu o eroare. Pentru a citi mai departe, trimite `next_key` din răspuns și continuă până când este gol.

```bash
# One page of pending calls (use the next key from the response for the next page)
curl -s "https://api-testnet.qore.host/qorechain/crossvm/v1/pending?pagination.limit=100"

# A message by id, with its whole payload
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/message/<id>
```

Verificat pe testnet la 12 noiembrie 2026: ruta pending a răspuns `200` cu `{"messages":[],"count":0,"pagination":{"next_key":null,"total":"0"}}` (coadă goală), iar ruta mesajului a răspuns `200` cu `{"message":null,"found":false}` pentru un id care nu există. Aceleași citiri cu CLI-ul de nod pentru Linux:

```bash
qorechaind query crossvm pending
qorechaind query crossvm message <id>
```

:::note CLI-ul de nod
`qorechaind` este CLI-ul de nod pentru Linux. Nu există un binar macOS împachetat. Apelurile REST funcționează de pe orice mașină.
:::

## Parametrii modulului {#params}

```bash
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params
```

A răspuns `200` la 12 noiembrie 2026 cu aceste câmpuri:

| Câmp | Valoare citită | Semnificație |
| ----- | ---------- | ------- |
| `enabled` | `true` | Comutatorul modulului. Mesajul de apel are propria intrare în lista circuit breaker-ului. |
| `max_message_size` | `65536` | Cel mai mare payload, în octeți. |
| `max_queue_size` | `1000` | Cele mai multe apeluri puse în coadă simultan. |
| `queue_timeout_blocks` | `100` | Blocuri până când un apel nerulat expiră. |
| `bridge_allowed_targets` | trei intrări `cosmwasm:qor1...` | Contractele QoreChain Native pe care puntea `0x0901` le poate apela. Gol ține puntea închisă. |
| `bridge_target_pins` | o intrare per țintă: `target`, `code_id`, `history_len` | Codul pe care fiecare țintă permisă trebuie să îl ruleze în continuare pentru ca puntea să o poată apela. |
| `max_pending_per_sender` | `100` | Apeluri în coadă pe care le poate ține un expeditor. |
| `max_cosmos_tx_gas` | `"50000000"` | Cel mai mult gaz pe care îl poate declara o tranzacție Native. |
| `record_retention_blocks` | `"100000"` | Cât timp este păstrată înregistrarea unui apel terminat din coadă. |
| `max_block_wasm_gas` | `"3000000"` | Execuție QoreChain Native pe care o poate folosi un bloc. |
| `max_tx_wasm_share_bps` | `5000` | Partea din acel buget pe care o poate folosi o tranzacție. |
| `max_block_level_wasm_gas` | `"10000000"` | Buget pentru munca de contract făcută în afara tranzacțiilor. |
| `queue_wasm_reserve_bps` | `2500` | Partea din bugetul blocului rezervată cozii. |
| `wasm_congestion_max_factor` | `20` | Cel mai mare nivel pe care îl poate atinge factorul de congestie. |
| `wasm_congestion_target_bps` | `5000` | Partea de utilizare peste care factorul crește. |
| `wasm_congestion_factor_micro` | `"1000000"` | Factorul în vigoare acum, în milionimi (`1000000` este 1x). |
| `max_block_upload_bps` | `5000` | Partea din buget pe care o pot folosi încărcările de cod. |
| `max_queue_timeouts_per_block` | `100` | Apeluri expirate per bloc. |

Folosește `wasm_congestion_factor_micro` ca să vezi cât va plăti în avans acum un apel din coadă: unități x factor x 0,1 uqor.

## Exemple pe direcții {#examples}

Toate exemplele semnează cu cheia post-cuantică a contului, ca orice tranzacție Native; vezi [Semnarea post-cuantică](/developer-guide/post-quantum-signing). Pentru această pagină au fost trimise doar exemplele cont nativ către contract QoreChain Native (vezi [Testat pe testnet](#tested)); exemplele EVM nu au fost rulate și sunt marcate UNTESTED acolo unde apar.

### Cont nativ către contract EVM {#native-to-evm}

**UNTESTED:** această direcție nu a fost rulată pentru această pagină.

Ținta este un contract EVM; payload-ul este un call data codificat ABI. Apelul rulează ca propria ta adresă `0x`, deci partea EVM te vede ca `msg.sender`. Linia de comandă (CLI de nod pentru Linux), construiește apoi adaugă semnătura post-cuantică:

```bash
qorechaind tx crossvm call evm 0x1234567890123456789012345678901234567890 \
  --payload <hex of abi.encode(selector, args)> \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > call.json

qorechaind tx pqc cosign call.json --from mykey --pqc-key mykey-mldsa \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

TypeScript cu SDK-ul publicat (0.13.0). Helperul codifică ABI apelul cu viem:

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

Python, Go, Rust și Java primesc payload-ul ca octeți bruți pentru EVM (codificarea ABI de nivel înalt există doar în TypeScript). Python:

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

Dacă expeditorul nu este contul care a semnat tranzacția, de exemplu un grantee authz, partea EVM rulează sub fereastra granterului; vezi [Authz și ferestre](#authz).

### Cont nativ către contract QoreChain Native {#native-to-wasm}

Payload-ul este mesajul JSON de execuție al contractului. Un apel sincron returnează răspunsul contractului în `data`:

```bash
qorechaind tx crossvm call cosmwasm qor1...contract \
  --payload $(printf '%s' '{"transfer":{"recipient":"qor1...","amount":"1"}}' | xxd -p -c 0) \
  --funds 100uqor \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 600000 --fees 60000uqor --generate-only > call.json
```

În coadă, cu o alocare explicită de gaz și un plafon al factorului (v3.2.8). Escrow-ul este 800.000 x 2,5 x 0,1 uqor = 200.000 uqor (0,2 QOR) dacă factorul este 1 (comanda primește `2.5` și trimite 2.500.000 de milionimi):

```bash
qorechaind tx crossvm call cosmwasm qor1...contract \
  --payload <hex of the execute message> --async \
  --async-gas-limit 800000 --async-max-factor 2.5 \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > call.json
```

TypeScript cu SDK 0.13.0 (sincron și în coadă, cu alocarea implicită):

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

Python (`async_=True`), Go (`Async: true`), Rust (`.queue(true)`) și Java (`o.async = true`) pun în coadă la fel:

```python
client.call(target_vm="cosmwasm", target_contract="qor1...contract",
            cosmwasm={"transfer": {"recipient": "qor1...", "amount": "1"}}, async_=True)
```

:::note Suport SDK pentru cele două câmpuri noi
SDK 0.13.0 nu are nicio opțiune pentru `async_gas_limit` sau `async_max_factor`, deci apelurile sale în coadă folosesc valorile implicite. SDK 0.14.0 adaugă `asyncGasLimit` și `asyncMaxFactor` la apelul între VM-uri, exportă `CROSSVM_ASYNC_FACTOR_ONE` (1.000.000) și `validateCrossVmAsyncGas`, iar helperul său `buildCall` setează implicit `sourceVm` la `evm` pentru un cont nativ. Lanțul ignoră `source_vm` și a înregistrat mesajul cu `source_vm` native.
:::

### Contract EVM către contract QoreChain Native prin 0x0901 {#evm-to-wasm}

**UNTESTED:** această direcție nu a fost rulată pentru această pagină.

Un contract Solidity apelează precompile-ul punții de la `0x0000000000000000000000000000000000000901`. Apelul rulează în interiorul tranzacției EVM, cu contul sau contractul apelant (ca adresa sa `qor1`) drept expeditor QoreChain Native, iar un revert oriunde le anulează pe amândouă.

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

Reguli pentru punte:

- Doar `CALL` simplu, fără valoare, selector `0x3c11078c`. `STATICCALL`, `DELEGATECALL` și VM țintă `0` sau `2` fac revert.
- Ținta trebuie să fie în `bridge_allowed_targets` (și, din v3.2.8, să ruleze în continuare codul la care este fixată). Citește-le pe amândouă cu ruta de parametri de mai sus.
- **Apelantul are nevoie de o fereastră care listează `0x0901`.** Orice cont care trimite o tranzacție către punte trebuie să aibă o [fereastră de autorizare EVM](/developer-guide/evm-window-reference) deschisă, al cărei `allowed_targets` include `0x0000000000000000000000000000000000000901` (și contractul care o apelează, dacă apelezi printr-unul). Deschide una astfel, cu o limită potrivită sesiunii tale:

```bash
qorechaind tx pqc open-evm-window 600 5 10qor \
  --allowed-targets 0x0000000000000000000000000000000000000901 \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 80000uqor --generate-only > window.json
```

- Un apel eșuat face revert cu un motiv `Error(string)` și este taxat pentru gazul folosit de contract.

Helperul `@qorechain/rdk` `encodeCrossVmCalldata({ contract, msg })` construiește același call data în TypeScript (vezi [Multi-VM](/rollups/multi-vm)). Cu SDK-ul publicat, adresa precompile-ului este `PRECOMPILE_ADDRESSES.crossVmBridge` din `@qorechain/evm`.

### Contract QoreChain Native către contract EVM {#wasm-to-evm}

**UNTESTED** de autorul documentației. Echipa lanțului raportează că ambele moduri au rulat pe testnet înainte de v3.2.8.

Un contract QoreChain Native face apelul trimițând un `MsgCrossVMCall` ca mesaj de lanț, cu el însuși ca expeditor. Mesajul are aceleași câmpuri ca mai sus; lanțul tratează contractul ca apelant CosmWasm, indiferent ce spune `source_vm`. Cu `async` false (implicit), apelul este sincron: rulează pe gazul tranzacției, răspunsul este în `MsgCrossVMCallResponse.data`, iar un eșec anulează întreaga tranzacție. Cu `async` true este pus în coadă. Vezi [Cine pe cine apelează](#who-calls-whom). Exemplul de mai jos pune apelul în coadă:

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

Lucruri de știut înainte să te bazezi pe el:

- EVM vede contractul ca **ultimii 20 de octeți** ai adresei sale de 32 de octeți. Asigură-te că contractul EVM nu depinde de faptul că `msg.sender` este un cont obișnuit.
- Din v3.2.8, un apel care ar lăsa apelantul cu mai mult QOR nativ decât a început eșuează (și este taxat). Contractele EVM destinate acestei direcții ar trebui să plătească un token ERC-20 sau un cont de 20 de octeți numit în apel, nu QOR nativ către `msg.sender`.
- Un contract care acționează ca el însuși nu este limitat de o fereastră EVM. Un apel trimis sub un grant authz de la un cont este; vezi mai jos.
- Sub puntea `0x0901`, un `MsgCrossVMCall` este acceptat doar de la un contract care acționează ca el însuși, iar un `MsgExec` authz de acolo nu poate purta unul pentru alt cont.

Ambele moduri au fost rulate înainte pe testnet (sincron la înălțimea 9.795.779, asincron la înălțimea 9.795.783). Codul Rust din partea contractului, care trimite acest mesaj, nu a fost rulat pentru această pagină.

## Authz și ferestre {#authz}

Un apel între VM-uri în EVM pe care expeditorul nu l-a trimis el însuși rulează sub fereastra EVM a **expeditorului**, exact ca și cum codul expeditorului ar acționa în tranzacția altcuiva. În practică, asta este un grant authz folosit. Când cineva folosește grantul tău pentru `MsgCrossVMCall` ca să apeleze EVM:

- Apelul este admis doar dacă fereastra **ta** este deschisă și domeniul ei admite ținta (`allowed_targets`, `native_only`, precompile-urile care mută valoare).
- Fiecare apel reușit consumă una dintre tranzacțiile ferestrei, iar valoarea nativă pe care o pierzi în el se numără din valoarea ferestrei.
- Fără o cheie post-cuantică utilizabilă și o fereastră activă, apelul este refuzat, la trimitere pentru un apel async și din nou când îl rulează coada.
- Un contract sau o politică de grup nu are nicio fereastră, deci un grant authz de la unul nu poate purta un apel în EVM.
- Apelurile în QoreChain Native nu sunt limitate de fereastră. Un grant authz generic pentru `MsgCrossVMCall` îi dă grantee-ului identitatea ta pe lane-ul QoreChain Native: acordă-l doar părților în care ai încredere pentru cont.

O conversie a unui token ERC-20 sub un grant authz (`MsgConvertERC20`) este admisă de fereastra expeditorului în același mod.

## Limite și erori {#limits}

| Situație | Rezultat |
| --------- | ------ |
| Payload mai mare decât `max_message_size` | Refuzat, cod 8 (`message payload exceeds max size`) |
| Adresă țintă cu forma greșită pentru lane-ul ei | Refuzat la trimitere, cod 5 (`invalid target contract address`) |
| Ținta este o adresă de precompile (`0x...0000` până la `0x...ffff`) | Refuzat la trimitere, cod 5 |
| VM țintă egal cu propriul tău lane | Refuzat |
| VM necunoscut sau nesuportat | Cod 7 (`unsupported VM type`) |
| Mai mult de 100 de apeluri în coadă de la un expeditor | `ErrQueueFull`, cod 4, până când unul se termină sau expiră |
| Coada ține `max_queue_size` apeluri | `ErrQueueFull`, cod 4 |
| `async_max_factor` în afara intervalului 1.000.000 până la 100.000.000 (milionimi), de exemplu `6` în loc de `6000000` | Refuzat înainte să ruleze ceva, codespace `crossvm` cod 2 (`async_max_factor 6 is outside 1000000..100000000 (millionths)`) |
| `async_max_factor` sub factorul în vigoare | Refuzat la trimitere |
| `async_gas_limit` sub 250.000 sau peste spațiul pe bloc al cozii | Refuzat la trimitere |
| Plată în avans peste 50.000.000 de gaz | Refuzat la trimitere; reîncearcă mai târziu sau coboară limita |
| uqor cheltuibili mai puțini decât escrow-ul | Refuzat (monedele blocate în vesting, fee grant-urile și comisioanele în alte tokenuri nu îl pot finanța) |
| Factor de congestie peste `async_max_factor` când vine rândul apelului | Apelul așteaptă; expiră după `queue_timeout_blocks` |
| Apelul expiră sau nu este rulat niciodată | Escrow rambursat integral, taxa de loc păstrată ca taxă de procesare |
| Ținta eșuează | Înregistrare `failed` (async) sau tranzacția este anulată (sync); gazul folosit este taxat |
| QOR nativ returnat unui apelant contract (expeditor de 32 de octeți) din EVM | Apelul eșuează și este taxat |
| Apel `0x0901` fără o fereastră care îl listează | Refuzat |
| Ținta `0x0901` nu este în `bridge_allowed_targets`, sau codul s-a schimbat de când a fost fixată | Revert: `cross-VM bridge call refused: target ... is not allowlisted` pentru o țintă nelistată |
| `MsgCrossVMCall` în lista circuit breaker-ului | Tranzacție refuzată; apelurile din coadă rămân în așteptare |
| Un apel în SVM | Lane-ul este deschis pe testnet din propunerea 37 și oprit pe mainnet; niciun apel în SVM nu a fost rulat pentru această pagină (UNTESTED) |

O eroare înregistrată pe un apel eșuat din coadă conține text simplu, fără adnotare de fișier sursă.

## Evenimente {#events}

| Eveniment | Atribute | Semnificație |
| ----- | ---------- | ------- |
| `crossvm_request` | `message_id`, `source_vm`, `target_vm`, `target_contract`, `sender` | Un apel a fost trimis |
| `crossvm_response` | `message_id`, `status`, și `error` pentru un apel eșuat | Un apel din coadă s-a terminat |
| `crossvm_timeout` | `message_id` | Un apel din coadă a expirat |
| `crossvm_escrow_settled` | taxa și rambursarea | Escrow-ul unui apel async către QoreChain Native a fost plătit |

## Testat pe testnet {#tested}

Rulat pe `qorechain-diana` la 12 noiembrie 2026 (versiunea v3.2.8), după ce propunerea 37 a trecut, cu SDK 0.14.0 (`createCrossVMClient(...).buildCall`, semnat hibrid, cont eth-native), pe contractul cw20 stocat de guvernanță, instanțiat din codul 859. Payload-ul a fost `{"transfer":{"recipient":<self>,"amount":"1"}}`.

| Pas | Rezultat |
| ---- | ------ |
| Citirea listei circuit breaker-ului | Doar `/cosmwasm.wasm.v1.MsgStoreCode`; mesajul de apel nu este în pauză |
| Apel sincron nativ către QoreChain Native | Simulat 601.178 de gaz, trimis cu simulat x 1,3, cod 0, 595.049 de gaz folosit |
| Apel asincron nativ către QoreChain Native, `asyncGasLimit` 800000, `asyncMaxFactor` 6000000 | Simulat 751.287 de gaz; cod 0; 751.277 de gaz folosit |
| Debitările apelului async (evenimentele tranzacției) | Taxa (146.502 uqor, limita înmulțită cu 0,15) și 680.417 uqor trimiși către un cont de modul (plata de escrow și de loc în coadă așa cum a fost observată; nedetaliată aici) |
| Eveniment al apelului async | `crossvm_request` cu `source_vm` native, `target_vm` cosmwasm |
| `GET /qorechain/crossvm/v1/message/{id}` | Status `executed`, `created_height` egal cu `executed_height` (apelul din coadă a rulat în același bloc), eroare goală |
| `GET /qorechain/crossvm/v1/pending` după aceea | Listă goală |
| `async_max_factor` de `6` | Refuzat înainte să ruleze ceva: codespace `crossvm` cod 2, `async_max_factor 6 is outside 1000000..100000000 (millionths): invalid cross-VM message` |

Nerulate pentru această pagină (UNTESTED): EVM către QoreChain Native prin `0x0901` și QoreChain Native către EVM. Echipa lanțului raportează că traseele sincron și asincron de la QoreChain Native către EVM au rulat pe testnet la înălțimile 9.795.779 și 9.795.783, înainte de v3.2.8.

## Pagini conexe {#related}

- [Interoperabilitate între VM-uri](/developer-guide/cross-vm-interoperability) pentru concepte, ciclul de viață și notele despre lista de permisiuni de pe testnet.
- [Referință pentru fereastra de autorizare EVM](/developer-guide/evm-window-reference) pentru deschiderea și delimitarea ferestrei de care are nevoie puntea.
- [Precompilate EVM](/developer-guide/evm-precompiles) pentru tabelul precompile-urilor și starea rețelelor.
- [Dezvoltare QoreChain Native](/developer-guide/cosmwasm-development) și [Gaz și limite QoreChain Native](/developer-guide/cosmwasm-gas-and-limits) pentru gazul contractelor și bugetul blocului.
- [Semnarea post-cuantică](/developer-guide/post-quantum-signing) pentru semnarea tranzacțiilor de mai sus.
- [Ghidul Cross-VM (SDK)](/sdk/guides/cross-vm) și [rollup-uri Multi-VM](/rollups/multi-vm) pentru helperii SDK și RDK.
