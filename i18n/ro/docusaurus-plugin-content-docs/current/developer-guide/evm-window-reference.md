---
slug: /developer-guide/evm-window-reference
title: Referință pentru fereastra de autorizare EVM (v3.2.8)
sidebar_label: Referință fereastră EVM
sidebar_position: 7
---

# Referință pentru fereastra de autorizare EVM (v3.2.8)

O tranzacție Ethereum poartă o singură semnătură secp256k1 și nimic altceva, deci nu poate purta semnătura post-cuantică (ML-DSA-87) pe care QoreChain o cere oricărei alte tranzacții. **Fereastra de autorizare EVM** închide această lacună. Contul deschide mai întâi o fereastră limitată printr-un mesaj QoreChain Native care **este** semnat cu cheia lui post-cuantică, iar lane-ul EVM admite apoi tranzacțiile obișnuite ale contului (MetaMask, ethers.js, Hardhat sau Foundry) doar cât timp fereastra le acoperă. Această pagină este referința completă despre cum se comportă o fereastră în versiunea **v3.2.8**.

:::note Unde rulează v3.2.8
Testnet-ul **`qorechain-diana`** rulează **v3.2.8** din 12 noiembrie 2026. Mainnet-ul **`qorechain-vladi`** nu a aplicat-o încă; pe mainnet fereastra funcționează așa cum este descris în [Dezvoltare EVM](/developer-guide/evm-development#evm-window), fără opțiunile și regulile marcate „v3.2.8" mai jos. Un nod sub v3.2.8 refuză un mesaj de fereastră care setează listele noi.
:::

## De ce contează {#why}

- **O cheie clasică furată valorează doar cât admite o fereastră deschisă.** Fereastra limitează timpul (în blocuri), numărul de tranzacții, QOR-ul care poate pleca și, opțional, ce contracte poate atinge contul.
- **Cheia post-cuantică rămâne la comandă.** Deschiderea, restrângerea și închiderea unei ferestre sunt toate mesaje Native semnate hibrid. Cheia clasică singură nu poate deschide niciodată una.
- **v3.2.8 face valorile implicite mai stricte.** Metodele standard ale precompilatelor sunt interzise implicit, semnăturile verificate de alte contracte au nevoie de consimțământul ferestrei, iar schimbarea cheii post-cuantice închide fereastra.

Varianta scurtă a adăugirilor din v3.2.8 se află în [Opțiuni de fereastră adăugate în v3.2.8](/developer-guide/evm-development#evm-window-v328); această pagină nu o repetă integral și adaugă exemplele, referința câmpurilor și tabelul de erori. Pentru prima fereastră pas cu pas, vedeți [Prima ta tranzacție](/getting-started/first-transaction#evm-window).

## Deschidere, închidere și citire {#lifecycle}

| Acțiune | Mesaj | CLI | REST |
| ------- | ----- | --- | ---- |
| Deschidere (înlocuiește orice fereastră deschisă) | `/qorechain.pqc.v1.MsgOpenEVMWindow` | `qorechaind tx pqc open-evm-window [blocks] [max-txs] [max-value]` | niciuna (o tranzacție) |
| Închidere imediată | `/qorechain.pqc.v1.MsgCloseEVMWindow` | `qorechaind tx pqc close-evm-window` | niciuna (o tranzacție) |
| Citire | niciunul | `qorechaind q pqc evm-window <address>` | `GET /qorechain/pqc/v1/evm_window/{address}` |

Deschiderea și închiderea sunt tranzacții pe lane-ul Native și au nevoie de semnătura hibridă a contului (clasică plus ML-DSA-87), iar contul trebuie să dețină deja o cheie post-cuantică înregistrată pentru a deschide o fereastră. Închiderea unei ferestre retrage și un consimțământ EIP-7702 aflat în așteptare. Deschiderea **avansează nonce-ul contului** (secvența Native este nonce-ul EVM), așa că deschideți mai întâi fereastra și citiți nonce-ul EVM după aceea.

### CLI {#cli}

Construiți tranzacția cu `--generate-only`, apoi adăugați semnătura post-cuantică cu `tx pqc cosign`. Binarul de release `qorechaind` are `gen-key` și `cosign`; un build comunitar nu le are.

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana

# Open: 7,200 blocks, 20 transactions, 100 QOR cap (value plus maximum fees)
qorechaind tx pqc open-evm-window 7200 20 100qor \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window.json

qorechaind tx pqc cosign window.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Fără argumente, CLI folosește valori implicite dimensionate pentru o sesiune de deploy: 3,600 de blocuri, 10 tranzacții și 25 QOR. O fereastră limitată la un singur contract de token (înlocuiți adresa cu a dumneavoastră):

```bash
qorechaind tx pqc open-evm-window 600 5 100qor \
  --allowed-targets 0x1111111111111111111111111111111111111111 \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window.json
```

Închideți o fereastră mai devreme, de exemplu dacă credeți că cheia clasică este expusă. Tot ce mai admitea fereastra este refuzat din blocul următor:

```bash
qorechaind tx pqc close-evm-window \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 40000uqor --generate-only > close.json

qorechaind tx pqc cosign close.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Citiți fereastra:

```bash
qorechaind q pqc evm-window <qor1-address> --node $QNODE
```

`live: true` împreună cu `remaining_blocks`, `remaining_txs` și `remaining_value` (uqor) este ceea ce vreți să vedeți. Referința comenzilor este în [Comenzi de tranzacție](/cli-reference/transaction-commands#open-evm-window).

### REST {#rest}

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_window/<qor1-address>
```

Un cont fără fereastră răspunde cu HTTP 200 și `found: false`, deci ruta poate fi interogată periodic fără risc. Fiecare număr este un șir JSON. O fereastră stocată poate fi expirată sau epuizată: `live` vă spune dacă mai admite cel puțin încă o tranzacție de valoare zero la înălțimea curentă.

### TypeScript {#typescript}

Funcțiile ajutătoare pentru fereastră sunt în `@qorechain/sdk` (vedeți [ghidul SDK EVM](/sdk/guides/evm#evm-window-scope) pentru configurarea semnării). `openEvmWindowMsg` primește toate câmpurile de mai jos, `closeEvmWindowMsg` construiește mesajul de închidere, `fetchEvmWindow` citește fereastra, iar `classifyEvmWindowRejection` explică un refuz.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  openEvmWindowMsg,
  closeEvmWindowMsg,
  fetchEvmWindow,
} from "@qorechain/sdk";

const REST = "https://api-testnet.qore.host";
const client = createClient({
  network: "testnet",
  endpoints: { rest: REST, rpc: "https://rpc-testnet.qore.host", evmRpc: "https://evm-testnet.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic); // already registered on chain
const tx = await client.connectTx(signer, { pqcKeypair });         // signs hybrid

// Open a window that may call one token contract (replace the address with your own).
await tx.signAndBroadcast(
  [
    openEvmWindowMsg({
      sender: account.address,
      blocks: 7200,
      maxTxs: 20,
      maxValue: "100000000",                 // uqor: value PLUS the maximum fee of each transaction
      allowedTargets: ["0x1111111111111111111111111111111111111111"], // your token contract
    }),
  ],
  "auto",
);

// Read it back (opens first, then read the nonce).
const w = await fetchEvmWindow({ rest: REST, address: account.address });
console.log(w.live, w.remainingBlocks, w.remainingTxs, w.remainingValue);

// Close it early.
await tx.signAndBroadcast([closeEvmWindowMsg(account.address)], "auto");
```

`openEvmWindowMsg` verifică limitele și formatele listelor înainte să se semneze ceva, deci o greșeală eșuează local în loc să coste o tranzacție refuzată. `MAX_EVM_WINDOW_BLOCKS` și `MAX_EVM_WINDOW_TXS` exportă limitele. Citirea înapoi (`fetchEvmWindow`) returnează limitele, contoarele și domeniul din v3.2.3 (`nativeOnly`, `allowedTargets`); `validators` (adrese de contract), `stakingValidators` (`qorvaloper1...`) și `ibcReceivers` (`"<channel>/<receiver>"`) sunt acceptate de constructor începând cu SDK 0.14.0, care poartă listele din v3.2.8; citirea înapoi nu le returnează, iar nici ruta REST a ferestrei din v3.2.8 nu le returnează, așa că păstrați valorile cu care ați deschis fereastra. Setați cele trei liste doar pentru o rețea care rulează v3.2.8: un nod sub această versiune refuză un mesaj de fereastră care le setează. Cu un `connectTx` care semnează hibrid, cheia post-cuantică trebuie să fie deja înregistrată.

### Testat pe testnet {#tested}

Rulat pe `qorechain-diana` pe 12 noiembrie 2026 (release v3.2.8) cu un cont eth-native care își înregistrase cheia post-cuantică, folosind SDK 0.13.0 (`openEvmWindowMsg`, `closeEvmWindowMsg`, `fetchEvmWindow`) și semnare hibridă. Câmpurile de fereastră `validators`, `staking_validators` și `ibc_receivers` nu erau în constructorii din SDK 0.13.0; SDK 0.14.0 le adaugă la `openEvmWindowMsg`, iar această rulare nu le-a folosit (folosiți linia de comandă pentru ele cu SDK 0.13.0).

| Pas | Rezultat |
| --- | -------- |
| `GET /qorechain/pqc/v1/evm_window/{address}` înainte de deschidere | `found: false`, `live: false` |
| Deschidere: 300 de blocuri, 5 tranzacții, 1,000,000 uqor | cod 0, 187,282 gaz utilizat. Citit înapoi: `found: true`, `live: true`, `opened_height` 9942089, `expiry_height` 9942389, `max_txs` 5, `max_value` 1000000, `remaining_blocks` 297, `native_only: false`, `allowed_targets: []` |
| Deschidere din nou cu `nativeOnly: true` | cod 0, 187,803 gaz utilizat. Fereastra nouă a înlocuit-o pe cea veche: `native_only: true`, un `opened_height` nou |
| Închidere | cod 0, 170,468 gaz utilizat. Citit înapoi: `found: false` |

Cu SDK 0.14.0, în aceeași zi, o fereastră deschisă cu `allowedTargets` (o adresă de țintă admisă), `stakingValidators` (o adresă de operator de validator) și `ibcReceivers` (o pereche `channel-0/...`) a reușit cu cod 0 și 195,233 gaz utilizat. Citirea înapoi prin REST a listat `allowed_targets` și a returnat `found: true`, `live: true`; nu returnează listele `validators`, `staking_validators` sau `ibc_receivers`, așa că păstrați valorile cu care ați deschis fereastra.

`fetchEvmWindow` a returnat aceleași câmpuri în camel case (`openedHeight`, `remainingBlocks`, `nativeOnly`, `allowedTargets`). Deschiderea și închiderea sunt tranzacții Cosmos semnate hibrid, deci prima tranzacție pe care o trimite un cont are nevoie ca cheia lui să fie înregistrată mai întâi.

### Python, Go, Rust și Java {#other-languages}

Fiecare SDK are un constructor pentru mesaj și o citire REST. Toate verifică local limitele lanțului. Un constructor de limbaj care setează listele din v3.2.8 are nevoie de SDK 0.14.0 sau mai nou (Java: 0.14.0 pe Maven Central); versiunile anterioare construiesc doar câmpurile mai vechi.

| Limbaj | Deschidere (cu toate listele) | Închidere | Citire | Limite EVM |
| ------ | ----------------------------- | --------- | ------ | ---------- |
| Python | `msg.pqc.open_evm_window(sender=, blocks=, max_txs=, max_value=, native_only=, allowed_targets=, validators=, staking_validators=, ibc_receivers=)` | `msg.pqc.close_evm_window(sender=)` | `get_evm_window(rest, address)` | `fetch_evm_limits(rest)` |
| Go | `messages.NewOpenEVMWindowWithScope(sender, blocks, maxTxs, maxValue, scope)` cu un `messages.EVMWindowScope` | `messages.NewCloseEVMWindow(sender)` | `rest.GetEVMWindowStatus(address)` | `rest.GetEVMLimits()` |
| Rust | `msg::pqc::open_evm_window_with_scope_any(sender, blocks, max_txs, max_value, &scope)` cu `EvmWindowScope` | `msg::pqc::close_evm_window_any(sender)` | `get_evm_window(&rest, address)` | încă fără funcție ajutătoare; citiți ruta REST |
| Java | `EvmWindow.openWithPolicy(sender, blocks, maxTxs, maxValue, nativeOnly, allowedTargets, validators, stakingValidators, ibcReceivers)` | `EvmWindow.close(sender)` | `rest.evmWindow(address)` | `rest.evmLimits()` |

Python:

```python
from qorsdk import RestClient, get_network, get_evm_window, msg

sender = "qor1..."
open_msg = msg.pqc.open_evm_window(
    sender=sender,
    blocks=7200,
    max_txs=20,
    max_value="100000000",  # uqor, integer string
    allowed_targets=["0x1111111111111111111111111111111111111111"],  # your token contract
)
# broadcast it through the usual hybrid path, then:
rest = RestClient(get_network("testnet").endpoints.rest)
status = get_evm_window(rest, sender)
print(status.live, status.remaining_blocks, status.remaining_txs, status.remaining_value)
close_msg = msg.pqc.close_evm_window(sender=sender)
```

Go:

```go
open, err := messages.NewOpenEVMWindowWithScope(sender, 7200, 20, "100000000",
    messages.EVMWindowScope{
        AllowedTargets: []string{"0x1111111111111111111111111111111111111111"}, // your token contract
    })
status, err := rest.GetEVMWindowStatus(sender)
closeMsg, err := messages.NewCloseEVMWindow(sender)
```

Rust:

```rust
use qorechain::evm_window::{get_evm_window, EvmWindowScope};
use qorechain::msg;

let scope = EvmWindowScope {
    allowed_targets: vec!["0x1111111111111111111111111111111111111111".into()], // your token contract
    ..Default::default()
};
let open = msg::pqc::open_evm_window_with_scope_any("qor1...", 7200, 20, "100000000", &scope)?;
let status = get_evm_window(&rest, "qor1...").await?;
let close = msg::pqc::close_evm_window_any("qor1...");
```

Java:

```java
TypedMessage open = EvmWindow.openWithPolicy(sender, 7200, 20, "100000000",
    false,
    List.of("0x1111111111111111111111111111111111111111"), // allowedTargets: your token contract
    null,                                                   // validators
    null,                                                   // stakingValidators
    null);                                                  // ibcReceivers
EvmWindowStatus status = rest.evmWindow(sender);
TypedMessage close = EvmWindow.close(sender);
```

SDK-ul nu deschide niciodată o fereastră în locul dumneavoastră. O fereastră autorizează cheltuirea, deci pasul rămâne explicit și vizibil pentru utilizator.

## Câmpuri {#fields}

| Câmp (flag CLI) | Limită | Semnificație |
| --------------- | ------ | ------------ |
| `blocks` (primul argument) | 1 până la 17,280 | Fereastra nu admite nimic după înălțimea de deschidere plus `blocks`. Este un număr de blocuri, nu o durată: aproximativ 5 ore pe testnet și aproximativ 15 ore pe mainnet la timpii de bloc de azi |
| `max_txs` (al doilea argument) | 1 până la 1,000 | Câte tranzacții EVM admite |
| `max_value` (al treilea argument) | pozitiv | Total uqor pe care fereastra îl lasă să iasă din cont: valoarea transferată **plus** comisionul maxim (limita de gaz înmulțită cu plafonul comisionului) al fiecărei tranzacții admise |
| `native_only` (`--native-only`) | true sau false | Admite doar transferuri simple de QOR: fără calldata, fără creare de contract, fără destinatar care poartă cod, fără autorizare EIP-7702 |
| `allowed_targets` (`--allowed-targets`) | cel mult 16 adrese `0x`, fără duplicate | Admite doar tranzacțiile către aceste adrese; crearea de contract este refuzată |
| `validators` (`--validators`) | cel mult 16 adrese `0x`, fără duplicate | Contracte a căror verificare a semnăturii contului contează pentru acțiunile proprii ale contului: un modul validator pe care îl apelează un contract de portofel sau punctul de intrare ERC-4337. v3.2.8 |
| `staking_validators` (`--staking-validators`) | cel mult 16 adrese `qorvaloper...`, fără duplicate | Validatori către care contul poate delega sau redelega prin fereastră. v3.2.8 |
| `ibc_receivers` (`--ibc-receivers`) | cel mult 16 intrări `<channel>/<receiver>`, cel mult 256 de caractere fiecare, fără spații sau virgule | Destinațiile exacte către care poate merge un transfer IBC de QOR nativ. Se compară octet cu octet, deci scrieți `channel-0` și receptorul bech32 cu litere mici exact așa cum îl poartă transferul. v3.2.8 |

Fiecare limită trebuie dată: lanțul refuză una lipsă în loc să îi pună o valoare implicită (CLI completează singur valorile implicite pentru sesiunea de deploy). Oricare limită care se epuizează încheie fereastra în practică. O fereastră funcționează doar cât timp cheia post-cuantică a contului este utilizabilă, adică nu este goală, nu este doar clasică și nu este dezactivată de guvernanță.

### Ce numără o fereastră {#counting}

La admitere, înainte ca tranzacția să ruleze, fiecare tranzacție EVM consumă una din `max_txs` și adaugă la valoarea folosită valoarea ei transferată plus comisionul ei maxim, convertite din unitatea EVM cu 18 zecimale în uqor și rotunjite în sus. O tranzacție care este admisă și apoi face revert și-a consumat totuși partea. După execuție, QOR-ul nativ pe care un precompilat l-a mutat în numele contului (o delegare, un depozit, un transfer IBC) se taxează și el ferestrei, deci contează la `max_value` chiar dacă valoarea tranzacției era zero.

Nu se numără: `eth_call`, `eth_estimateGas` și simulările. Tokenurile nu sunt tarifate deloc: un transfer sau un approve ERC-20 poartă valoarea zero, așa că limitați-le cu un domeniu (`allowed_targets`). Fiecare taxare emite un eveniment `pqc_evm_window_used` cu atributele `address`, `evm_address`, `window_open_height`, `used_txs`, `used_value`, `tx_value` și `source` (`ante` pentru admitere, `settlement` pentru taxarea de după execuție), astfel încât un portofel poate arăta ce a consumat o tranzacție. Deschiderea și închiderea emit `pqc_evm_window_opened` și `pqc_evm_window_closed`.

## Precompilate standard printr-o fereastră {#precompile-allowlist}

Pentru un cont pe care îl autorizează o fereastră, o metodă a unui precompilat standard (staking, distribution, ICS-20, gov, slashing, precompilatele de token ERC-20) este refuzată dacă nu se află în tabel și fereastra nu listează acel precompilat în `allowed_targets`. Adresele precompilatelor sunt în [Precompilate EVM](/developer-guide/evm-precompiles); cele pentru staking, distribution, ICS-20 și gov sunt `0x...0800`, `0x...0801`, `0x...0802` și `0x...0805`.

| Precompilat | Metodă | Admisă când |
| ----------- | ------ | ----------- |
| distribution | `claimRewards`, `withdrawDelegatorRewards` | recompensele sunt plătite chiar contului (adresa lui de retragere este a lui însuși) |
| distribution | `withdrawValidatorCommission` | validatorul este al contului și plătește chiar contului |
| distribution | `depositValidatorRewardsPool` | validatorul este în `staking_validators` și fiecare monedă este QOR nativ |
| staking | `delegate`, `redelegate` | validatorul de destinație este în `staking_validators` |
| ICS-20 | `transfer` | QOR nativ, pe portul `transfer`, fără memo, către o pereche din `ibc_receivers` |
| precompilate de token ERC-20 | `transfer`, `transferFrom`, `approve` | QOR nativ; alt token doar când fereastra listează adresa acelui token |

Precompilatele de staking (`0x…0800`) și de distribution (`0x…0801`), la fel ca celelalte precompilate standard din acest tabel, **nu sunt active în prezent pe testnet și nici pe mainnet**; guvernanța le poate activa. Un apel către adresa unui precompilat inactiv ajunge la o adresă fără cod: reușește, nu face nimic și plătește totuși gaz. Câmpurile ferestrei `staking_validators`, `validators` și `ibc_receivers` se aplică odată ce un precompilat este activ. Pentru staking și pentru revendicarea recompenselor, folosiți mesajele Cosmos native (QoreX sau comenzile qorechaind de staking și distribution). Când un precompilat este activ, sumele lui sunt în `uqor` (6 zecimale), nu în unități EVM cu 18 zecimale.

Orice altceva este refuzat printr-o fereastră, indiferent ce listează: retragerea unei delegări (undelegate), anularea unei retrageri în curs, votul și alte acțiuni de guvernanță, schimbarea adresei de retragere, crearea sau editarea unui validator, unjail, alimentarea community pool. Trimiteți acestea ca tranzacții Native semnate post-cuantic. A lista ICS-20 fără `ibc_receivers` nu admite niciun transfer, iar a lista precompilatul de staking fără `staking_validators` nu admite nicio delegare.

Exemple de ce trebuie listat:

| Scop | Fereastră |
| ---- | --------- |
| Staking, revendicarea recompenselor, dezlegarea delegării, vot | Folosiți mesajele Cosmos native (QoreX Stake și Claim sau comenzile qorechaind tx staking / distribution); nu folosiți fereastra EVM pentru acestea |
| Trimiterea de QOR în afara lanțului prin punte | `allowed_targets` cu precompilatul ICS-20, plus `ibc_receivers` precum `channel-0/<receiver>` |
| Mutarea unui token IBC deținut ca precompilat ERC-20 | `allowed_targets` cu adresa acelui token |

A lista un contract înseamnă consimțământul contului pentru ceea ce poate face acel contract cu activele lui: pentru un vault, un router sau un token care ține tokenurile contului, fereastra nu limitează ce tokenuri se mută sau unde.

## Crearea de contract {#contract-creation}

Implementarea unui contract are nevoie de o fereastră **fără domeniu**. O fereastră cu `native_only` sau cu `allowed_targets` refuză crearea de contract. Pentru o sesiune de deploy deschideți o fereastră simplă (valorile implicite ale CLI sunt dimensionate pentru una), faceți deploy, apoi închideți-o. Pentru sesiunile următoare, deschideți o fereastră cu `--allowed-targets <contract-address>` pentru a o limita la apeluri către contractul implementat. Ghidul de deploy cu Hardhat și Foundry este în [Dezvoltare EVM](/developer-guide/evm-development).

## Permit-uri, ordine EIP-712 și Permit2 {#permits}

Un permit EIP-2612, un transfer Permit2, un ordin semnat sau o meta-tranzacție este verificat de un contract cu precompilatul `ecrecover`. Începând cu v3.2.8 (ambele rețele, odată ce o rețea o aplică), pentru un cont care deține o cheie post-cuantică utilizabilă, această verificare reușește doar cât timp fereastra **live** a contului admite **contractul verificator**, adică tokenul sau Permit2 însuși, nu routerul care transmite apelul.

1. Dacă fereastra are domeniu, listați contractul verificator în `allowed_targets` (`native_only` nu admite nicio astfel de semnătură).
2. Deschideți fereastra **înainte** ca utilizatorul să semneze. Fără o fereastră live, semnătura este tratată ca invalidă, iar contractul o refuză.
3. Semnătura în sine nu se taxează niciodată ferestrei, deoarece o semnătură devine publică odată folosită.
4. Un permit sau un approve acordat în interiorul unei ferestre rămâne după închiderea ferestrei. Revizuiți și revocați aprobările când sesiunea se încheie.

Conturile fără înregistrare post-cuantică, un portofel delegat care își verifică propria semnătură și semnătura expeditorului însuși într-o fereastră fără domeniu se recuperează ca înainte. Interogările și estimările de gaz nu sunt afectate.

## Schimbări de cheie și consimțământ EIP-7702 {#key-changes}

- **Rotirea, migrarea sau reînregistrarea cheii post-cuantice închide fereastra** și șterge orice consimțământ EIP-7702. Deschideți fereastra din nou după aceea. Planificați acest lucru în portofelele hot și în integrările de exchange.
- Fereastra, consimțământul EIP-7702 (`MsgAuthorizeEVMDelegation`, `MsgClearEVMDelegation`) și mesajele de administrare a contului abstract trebuie să fie **propriul mesaj de nivel superior, semnat hibrid, al contului**. Nu pot fi trimise prin authz (`MsgExec`) și nici acordate unui alt cont, iar un grant pentru aceste tipuri de mesaje este refuzat. Grant-urile de consimțământ existente de acest fel au fost eliminate la upgrade.
- Un cont delegat EIP-7702 care acționează în interiorul tranzacției altcuiva are nevoie de propria fereastră live în momentul în care codul lui acționează. Fără una, eșuează doar acel apel, iar contractul apelant vede eșecul, deci o plată către un cont delegat nu mai face revert la întreaga tranzacție a plătitorului.

Consimțământul pentru o delegare se înregistrează cu `qorechaind tx pqc authorize-evm-delegation <delegate_0x> <blocks>` și se citește cu `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`; vedeți [Delegări EIP-7702](/developer-guide/evm-development#eip-7702).

## Limite în vigoare {#limits}

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_limits
```

Testnet-ul a răspuns pe 12 noiembrie 2026 cu `tx_max_gas` **30000000** și `precompile_input_max_bytes` **16384**:

| Limită | Valoare | Semnificație |
| ------ | ------- | ------------ |
| `tx_max_gas` | 30,000,000 | Cel mai mult gaz pe care îl poate cere o tranzacție EVM; peste el tranzacția este refuzată înainte să ruleze. Execuțiile EVM pornite de un singur mesaj Native împart același buget |
| `precompile_input_max_bytes` | 16,384 | Cea mai mare intrare pe care o acceptă un precompilat cu stare protejat |
| `blocks` fereastră | 17,280 | Cea mai lungă fereastră |
| `max_txs` fereastră | 1,000 | Cele mai multe tranzacții într-o fereastră |
| Intrări în liste | 16 pe listă | `allowed_targets`, `validators`, `staking_validators`, `ibc_receivers` |

Răspunsul conține și un obiect `limits` cu valorile setate de guvernanță; citiți `tx_max_gas` și `precompile_input_max_bytes` de la nivelul de sus, care sunt valorile în vigoare. Ruta este servită începând cu v3.2.8, deci mainnet-ul public răspunde `501 Not Implemented` până aplică v3.2.8 (verificat la 12 noiembrie 2026, după ce mainnet-ul a trecut la v3.2.7).

O fereastră deschisă la un preț normal al gazului numără tot comisionul maxim: o limită de gaz de 30,000,000 la un plafon de comision de 100 gwei numără 3 QOR din `max_value` pentru o singură tranzacție.

## Erori {#errors}

Refuzurile vin cu codespace `pqc`. Prin EVM JSON-RPC, un refuz ajunge ca o eroare de broadcast care poartă mesajul și niciun codespace, deci potriviți și după text (clasificatoarele din SDK o fac).

| Cod | Mesaj | Cauză | Ce faceți |
| --- | ----- | ----- | --------- |
| 26 | `no open EVM authorisation window` | Nicio fereastră, nicio cheie post-cuantică înregistrată sau fereastra a expirat | Înregistrați mai întâi o cheie dacă nu există una, apoi deschideți o fereastră |
| 27 | `EVM authorisation window exhausted` | O limită este consumată sau tranzacția este în afara domeniului ferestrei (inclusiv un precompilat standard pe care fereastra nu îl listează sau crearea de contract sub o fereastră cu domeniu) | Deschideți o fereastră nouă cu limite mai mari sau cu domeniul de care aveți nevoie |
| 28 | `invalid EVM authorisation window` | O cerere de deschidere în afara limitelor sau nicio cheie utilizabilă în acel moment | Verificați `blocks`, `max_txs`, `max_value` și listele; înregistrați sau reparați cheia |
| 62 | `delegated account has no window covering this action` | Un cont delegat a acționat sau expeditorul a mutat mai mult decât acoperă fereastra lui, fără o fereastră care să acopere. Începând cu v3.2.8, aceeași regulă face să eșueze doar apelul în cauză | Deschideți pentru acel cont o fereastră care admite acțiunea |
| revert | `<method> is disabled: the circuit breaker has tripped ...` | O metodă a unui precompilat standard al cărei mesaj Native este oprit | Așteptați; nu e nimic de schimbat în fereastră |
| revert | `<method>: account ... has no open EVM authorisation window that lists 0x...` | Un precompilat care mută valoare, atins prin cod, pentru un cont a cărui fereastră nu îl listează | Adăugați precompilatul în `allowed_targets` |
| nonce | `nonce too low` | Tranzacția EVM a fost semnată înainte să se deschidă fereastra (deschiderea avansează nonce-ul) | Citiți din nou nonce-ul și semnați iar |
| chain id | `only replay-protected (EIP-155) Ethereum transactions are accepted` | O tranzacție semnată fără chain id | Setați chain id-ul în configurația de rețea a uneltei |

`classifyEvmWindowRejection(err)` din SDK-ul TypeScript returnează `"no-pqc-key"`, `"no-window"`, `"exhausted"` sau `"invalid"`; celelalte SDK-uri au un clasificator echivalent (`describe_evm_window_error` în Python, `tx.ClassifyEVMWindowError` în Go, `classify_evm_window_error` în Rust, `EvmWindowIssue.classify` în Java).

## Ce nu guvernează fereastra {#outside}

Fereastra guvernează lane-ul EVM, adică tranzacțiile semnate doar cu cheia clasică. Acestea nu i se taxează, deoarece fiecare poartă propria semnătură post-cuantică sau este pornită de un modul pentru un cont care a semnat:

- Mesajele de pe lane-ul Native pe care le semnează contul însuși: transferuri bank, staking, guvernanță și un `MsgCrossVMCall` în EVM, care rulează ca adresa `0x` proprie a semnatarului.
- Execuțiile de cont abstract autorizate de autentificatorii contului.
- Conversiile ERC-20 și callback-urile IBC rulate de module.

Un apel cross-VM în EVM pe care expeditorul nu l-a trimis el însuși (de exemplu sub un grant authz) rulează sub fereastra expeditorului și are nevoie ca aceasta să admită ținta. Puntea cross-VM `0x0901` are nevoie de o fereastră care o listează. Vedeți [Interoperabilitate cross-VM](/developer-guide/cross-vm-interoperability).

## Fluxul MetaMask și QoreX {#qorex-flow}

MetaMask semnează cu o cheie Ethereum, adică cheia unui **cont în stil Ethereum (coin 60)**, și nu poate produce un mesaj Native. QoreX este locul unde un astfel de cont își deschide fereastra; transferurile proprii ale QoreX folosesc lane-ul Native și nu au nevoie niciodată de una.

1. În QoreX, adăugați sau restaurați contul coin-60 pentru fraza dumneavoastră MetaMask (vedeți [Restaurarea unei fraze din MetaMask sau din Dashboard](/qorex/getting-started#restore-dashboard)). Contul are nevoie de o cheie ML-DSA-87 înregistrată; primul transfer QoreX o înregistrează.
2. Deschideți cardul **Fereastră de acces EVM** (aplicație: Setări, Securitate, Fereastră de acces EVM; extensie: butonul **Fereastră de acces EVM** din popup) și alegeți câte blocuri (până la 17,280), câte tranzacții (până la 1,000) și plafonul de cheltuieli în QOR. Plafonul acoperă fiecare sumă plus comisionul ei maxim. Valorile implicite sunt 300 de blocuri, 5 tranzacții și 1 QOR.
3. Aprobați mesajul semnat hibrid. O fereastră nouă o înlocuiește pe orice fereastră deschisă, iar deschiderea avansează nonce-ul, deci trimiteți din MetaMask abia după aceea; o tranzacție pregătită mai devreme este refuzată cu „nonce too low".
4. Trimiteți din MetaMask pe chain id 9800 (testnet) sau 9801 (mainnet). Când ați terminat, folosiți **Închide fereastra**, oferit doar cât timp o fereastră este live.

Cardul QoreX setează cele trei limite. Nu oferă un ecran pentru listele de domeniu (`allowed_targets`, `validators`, `staking_validators`, `ibc_receivers`, `native_only`), deci o fereastră cu domeniu vine din `qorechaind` sau dintr-un SDK. Vedeți [Fereastra de acces EVM](/qorex/security-and-recovery#evm-window) pentru card și cele patru stări ale lui.

## Pagini conexe {#related}

- [Dezvoltare EVM](/developer-guide/evm-development): mediul de execuție, limitele de gaz și [opțiunile de fereastră din v3.2.8](/developer-guide/evm-development#evm-window-v328)
- [Precompilate EVM](/developer-guide/evm-precompiles)
- [Interoperabilitate cross-VM](/developer-guide/cross-vm-interoperability)
- [Semnare post-cuantică](/developer-guide/post-quantum-signing)
- [Ghidul SDK EVM](/sdk/guides/evm#evm-window-scope)
- [Comenzi de tranzacție](/cli-reference/transaction-commands#open-evm-window) și [Comenzi de interogare](/cli-reference/query-commands)
- [Endpointuri REST și gRPC](/api-reference/rest-grpc-endpoints)
- [Prima ta tranzacție](/getting-started/first-transaction#evm-window)
- [QoreX: fereastra de acces EVM](/qorex/security-and-recovery#evm-window)
