---
slug: /developer-guide/svm-lane-v328
title: "Lane-ul SVM: programe, conturi și limite de custodie (v3.2.8)"
sidebar_label: Lane-ul SVM (v3.2.8)
sidebar_position: 10
---

# Lane-ul SVM: programe, conturi și limite de custodie (v3.2.8)

Lane-ul SVM este partea QoreChain compatibilă cu Solana: implementezi programe compilate, creezi conturi de date și apelezi programe cu unelte în stil Solana, iar același sold nativ de QOR este vizibil în lamports. Versiunea **v3.2.8** a închis lane-ul la upgrade, până când un vot de guvernanță l-a redeschis. Pe testnet, acel vot (propunerea 37) a trecut, iar lane-ul este **deschis**; custodia lui este limitată de trei limite guvernate.

Această pagină explică cum citești starea lane-ului, cum funcționează programele, conturile și chiria, cum înregistrează un portofel SVM o cheie post-cuantică, ce înseamnă limitele de custodie și care exemple pot rula astăzi.

:::note Mai întâi testnet-ul, iar lane-ul este deschis acolo din propunerea 37
v3.2.8 rulează pe testnet-ul **`qorechain-diana`** din 12 noiembrie 2026. Mainnet-ul (`qorechain-vladi`) este încă pe v3.2.6, nu are o dată pentru v3.2.8, iar **lane-ul rămâne oprit pe mainnet**. Upgrade-ul a închis lane-ul pe testnet (scrierile SVM au eșuat, `MsgRegisterSVMPQCKey` a fost refuzat). **Propunerea de guvernanță 37 a trecut și l-a deschis pe `qorechain-diana`**: a setat `enabled: true`, a păstrat ceilalți parametri așa cum erau și a ridicat pauza circuit breaker-ului pe `MsgExecuteProgram` și pe apelurile între VM-uri. La verificarea din 12 noiembrie 2026, după vot, `GET /qorechain/svm/v1/params` arăta `enabled: true`, iar lista circuit breaker-ului conținea doar `/cosmwasm.wasm.v1.MsgStoreCode`. JSON-RPC-ul SVM public rămâne doar pentru citire. Citește întotdeauna starea live mai întâi (secțiunea următoare) și nu o presupune.
:::

## De ce contează {#why}

* Un client care oferă acțiuni SVM cât timp lane-ul este închis le dă utilizatorilor tranzacții refuzate. Citirea mai întâi a unui singur parametru evită asta.
* Lane-ul ține QOR real: fiecare lamport dintr-un program, dintr-o adresă derivată din program sau dintr-un cont de date este susținut de uqor ținuți de modulul SVM. Cele trei limite de custodie țin acest fond sub control, deci un transfer sau un depozit poate fi refuzat chiar dacă expeditorul are fondurile.
* Chiria și limitele de dimensiune decid cât costă păstrarea stării on-chain, deci ele aparțin bugetului unei implementări.

## Citirea stării lane-ului {#lane-state}

Starea lane-ului este câmpul `enabled` din parametrii SVM. Citește-l de pe ruta REST sau din CLI-ul de nod. Același răspuns conține toate celelalte limite de pe această pagină, deci un singur apel ajunge pentru dimensionarea unei implementări.

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params
```

Răspuns pe `qorechain-diana`, 12 noiembrie 2026, după ce propunerea 37 a trecut (HTTP 200):

```json
{"params":{"max_program_size":"10485760","max_account_data_size":"10485760","compute_budget_max":"1400000","lamports_per_byte":"3480","rent_exemption_multi":"2.000000000000000000","enabled":true,"svm_slot_offset":"0","default_sig_scheme":0,"max_cpi":4,"max_custody_uqor":"10000000000","max_custody_hard_uqor":"1000000000000","max_account_excess_uqor":"10000000000"}}
```

Pe un nod Linux (nu există un binar macOS împachetat), aceeași citire este:

```bash
qorechaind query svm params --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

În TypeScript, cu Node 18 sau mai nou (nu este nevoie de niciun apel SDK pentru această citire):

```ts
const REST = "https://api-testnet.qore.host";

const { params } = await (await fetch(`${REST}/qorechain/svm/v1/params`)).json();
if (!params.enabled) {
  throw new Error("The SVM lane is closed on this network; do not offer SVM actions");
}
console.log("compute units per instruction:", params.compute_budget_max);
```

Un helper tipizat pentru acești parametri (și un builder sigur pentru o propunere de parametri) face parte din ciorna SDK pentru v3.2.8, care nu este încă publicată. O versiune SDK ulterioară îl adaugă; folosește linia de comandă sau ruta REST până atunci.

### Identitatea clusterului {#cluster-info}

`cluster_info` identifică clusterul pentru portofele și spune dacă execuția este activă. Nu se schimbă odată cu starea lane-ului în alt fel decât prin `execution_enabled`.

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/cluster_info
```

Răspuns la 12 noiembrie 2026, citit după ce propunerea 37 a trecut, cu `execution_enabled` `true` (HTTP 200):

```json
{"chain_id":"qorechain-diana","genesis_hash":"6Z9pa53SwiprqiAoNCqqUdj5c3C4P1zRw31gQVnF4Czj","caip2_chain_id":"solana:6Z9pa53SwiprqiAoNCqqUdj5c3C4P1zR","derivation":"base58(SHA-256(\"qorechain/svm/genesis-hash/v1\" || 0x00 || chain_id))","execution_enabled":true}
```

CLI-ul de nod are aceeași interogare: `qorechaind query svm cluster-info`. Metoda JSON-RPC `getGenesisHash` de pe `https://svm-testnet.qore.host` returnează același hash. Hash-ul este derivat din chain id; nu este hash-ul genesis al unui cluster Solana real.

## RPC-ul SVM public este doar pentru citire {#public-rpc}

Endpoint-urile publice `https://svm.qore.host` și `https://svm-testnet.qore.host` răspund la citiri și refuză metodele de scriere (`sendTransaction` și similare) pe chain id-urile publice, indiferent dacă lane-ul este deschis sau nu. Pentru a trimite tranzacții SVM rulezi propriul nod, care servește JSON-RPC compatibil Solana pe portul 8899 implicit (vezi [Dezvoltare SVM](/developer-guide/svm-development#json-rpc-server)), iar lane-ul însuși trebuie să fie deschis pe rețeaua pe care o urmează acel nod. Citirile funcționează acum:

```bash
# Health, version, cluster hash, slot and a rent quote (all HTTP 200 on 12 November 2026)
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth","params":[]}'
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getVersion","params":[]}'
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getGenesisHash","params":[]}'
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getMinimumBalanceForRentExemption","params":[1024]}'
```

`getVersion` a raportat `solana-core` `1.18.0-qorechain` împreună cu chain id-ul, id-ul clusterului și hash-ul genesis. Cotația de chirie pentru 1.024 de octeți a fost `8017920` lamports la 12 noiembrie 2026. Rutele REST `GET /qorechain/svm/v1/account/{address}`, `.../program/{address}` și `.../slot` au răspuns **HTTP 501** (neimplementat) pe endpoint-ul public; citește conturile și programele prin metodele JSON-RPC `getAccountInfo` și `getMultipleAccounts`, sau prin CLI-ul de nod.

## Implementarea și apelarea programelor {#programs}

Odată ce lane-ul este deschis, fluxul este: construiești un program SBF cu toolchain-ul Solana curent, îl implementezi, creezi conturile de care are nevoie, apoi îl apelezi. Fiecare comandă `tx svm` este o tranzacție pe lane-ul Cosmos, deci are nevoie de o limită de gaz explicită, de un comision de cel puțin gaz înmulțit cu 0,1 uqor și de cosemnătura hibridă post-cuantică (vezi [Semnarea post-cuantică](/developer-guide/post-quantum-signing)).

Acestea sunt comenzile CLI de nod pentru Linux din referința nodului. **UNTESTED: lane-ul s-a deschis pe testnet abia după propunerea 37, iar pentru această pagină nu a fost rulată nicio implementare de program, execuție sau creare de cont.**

```bash
# 1. Build (platform-tools v1.53, --arch v0 or --arch v3)
cargo build-sbf --arch v3

# 2. Deploy; the response carries the program id in base58
qorechaind tx svm deploy-program ./my_program.so --from mykey \
  --gas 2000000 --fees 200000uqor --chain-id qorechain-diana --generate-only > tx.json
qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana

# 3. Create a data account owned by the program (space in bytes, lamports for rent)
qorechaind tx svm create-account <owner-base58> <space> <lamports> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-diana --generate-only > tx.json

# 4. Call the program
qorechaind tx svm execute <program-id-base58> <data-hex> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-diana --generate-only > tx.json
```

Citiri pe un nod, disponibile indiferent de starea lane-ului:

```bash
qorechaind query svm account <base58-address>
qorechaind query svm program <base58-address>
qorechaind query svm params
qorechaind query svm slot
```

### TypeScript cu @qorechain/svm 0.13.0 {#typescript}

`@qorechain/svm` este un strat subțire peste `@solana/web3.js`. Nu are un wrapper pentru loader: folosește CLI-ul de nod de mai sus pentru implementare, iar pachetul pentru a construi și trimite instrucțiuni către un program care există deja. Presetările sale publice nu setează intenționat niciun endpoint SVM, deci dă-i URL-ul propriului nod.

```ts
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  createSvmClient,
  createInvokeInstruction,
  withComputeBudget,
  svmKeypairFromSecretKey,
} from "@qorechain/svm";

const client = createSvmClient({ rpcUrl: "http://127.0.0.1:8899" }); // your own node

const payer = svmKeypairFromSecretKey(secretKey64);       // 64-byte Solana-style secret key
const programId = new PublicKey("<program-id-base58>");
const dataAccount = new PublicKey("<data-account-base58>");

const tx = new Transaction().add(
  createInvokeInstruction(
    programId,
    [{ pubkey: dataAccount, isSigner: false, isWritable: true }],
    Uint8Array.from([0]),                                  // your program's instruction data
  ),
);
withComputeBudget(tx, { units: 200_000 });                 // stay under compute_budget_max

const sim = await client.simulateTransaction(tx);          // dry run first
const signature = await client.sendTransaction(tx, [payer]);
```

**UNTESTED:** acest exemplu are nevoie de un nod pe care îl rulezi tu (lane-ul este deschis pe testnet). Pe endpoint-ul public trimiterea este refuzată. Apelurile doar pentru citire (`client.getBalance`, `client.getAccountInfo`, `client.getSignaturesForAddress`) funcționează față de `https://svm-testnet.qore.host`, deoarece `createSvmClient({ rpcUrl })` acceptă orice URL.

Python, Go, Rust și Java: adaptoarele SVM pentru aceste limbaje construiesc aceleași mesaje; o versiune SDK ulterioară adaugă helperii v3.2.8. Până atunci folosește CLI-ul de nod de mai sus sau mesajul brut. Orice bibliotecă client Solana poate vorbi și cu portul 8899 al propriului tău nod, deoarece setul de metode este compatibil Solana.

## Conturi și chirie {#rent}

Conturile de date SVM plătesc pentru spațiul pe care îl folosesc. Numerele vin din parametrii live de mai sus.

| Element | Regulă | Valoare live (testnet) |
| ---- | ---- | -------------------- |
| Chiria pe an | dimensiunea datelor în octeți înmulțită cu `lamports_per_byte` | 3.480 de lamports per octet |
| Minimul de scutire de chirie | chiria pe an înmulțită cu `rent_exemption_multi` | multiplicator 2,0 |
| Finanțat la sau peste minim | nu se taxează niciodată chirie | |
| Finanțat sub minim | chiria se scade în fiecare epocă | |
| Soldul ajunge la zero | contul este eliminat | |

Lamports și uqor se raportează astfel: 1 uqor = 1.000 de lamports. Cere nodului minimul exact în loc să îl calculezi: `getMinimumBalanceForRentExemption` a returnat 8.017.920 de lamports pentru 1.024 de octeți (cotația include antetul contului). `create-account` are nevoie de cel puțin atâția lamports, altfel contul nu este scutit de chirie.

Adrese: adresa SVM a unui cont este cei 20 de octeți ai contului completați la 32 de octeți și scriși în base58. Formele `qor1...`, `0x...` și base58 denumesc același cont.

## Cheia post-cuantică pentru portofelele SVM {#pqc-key}

Un portofel SVM care vrea o cheie post-cuantică on-chain o înregistrează cu **`MsgRegisterSVMPQCKey`**. Mesajul poartă expeditorul, adresa SVM de 32 de octeți și cheia publică ML-DSA-87. Este un mesaj pe lane-ul Cosmos, deci expeditorul îl semnează hibrid ca orice altă tranzacție nativă. Este refuzat cât timp lane-ul este închis, iar **contul SVM trebuie să existe deja înainte ca cheia lui să fie înregistrată** (vezi refuzul de la [Testat pe testnet](#tested)).

Nu există o comandă `tx svm` pentru el; folosește composer-ul din SDK. În TypeScript, composer-ul este `msg.svm.registerSvmPqcKey` din `@qorechain/sdk`. **UNTESTED pentru un cont existent: singura trimitere a fost pentru o adresă fără cont și a fost refuzată.**

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  msg,
} from "@qorechain/sdk";
import { fromBech32 } from "@cosmjs/encoding";

const client = createClient({
  network: "testnet",
  endpoints: { rest: "https://api-testnet.qore.host", rpc: "https://rpc-testnet.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);
const tx = await client.connectTx(signer, { pqcKeypair });   // signs hybrid

// 20 account bytes padded with zeros to the 32-byte SVM address
const svmAddr = new Uint8Array(32);
svmAddr.set(fromBech32(account.address).data);

await tx.signAndBroadcast(
  [msg.svm.registerSvmPqcKey({ sender: account.address, svmAddr, pqcPubKey: pqcKeypair.publicKey })],
  "auto",
);
```

Composer-ul Python este `msg.svm.register_svm_pqc_key(sender=, ...)`, iar cel Go este `Svm.RegisterPQCKey(sender, svmAddr, pqcPubKey)`.

## Limitele de custodie {#custody}

Fiecare lamport ținut de un program, de o adresă derivată din program sau de un cont de date este susținut de uqor pe care modulul SVM îi ține într-un singur fond, numit custodie. Trei parametri guvernați îl limitează. Toți trei sunt în uqor; 1 QOR înseamnă 1.000.000 uqor. Guvernanța îi schimbă printr-o propunere de parametri, iar o propunere trebuie să trimită toate cele douăsprezece câmpuri, deoarece înlocuiește setul în întregime.

| Parametru | Valoare live | Pe înțelesul tuturor |
| --------- | ---------- | -------------- |
| `max_custody_uqor` | 10.000.000.000 (10.000 QOR) | Plafonul soldului fondului SVM. Un transfer care ar ridica fondul peste el este refuzat cu `svm custody cap exceeded` (cod 23). `0` înseamnă fără plafon. |
| `max_custody_hard_uqor` | 1.000.000.000.000 (1.000.000 QOR) | Plafonul absolut al soldului brut al fondului, incluzând rezervele de chirie, pre-finanțarea și donațiile simple. O operațiune care ar lăsa soldul peste el este refuzată. Nu poate fi sub `max_custody_uqor` și trebuie să fie peste zero pentru ca lane-ul să poată fi deschis. |
| `max_account_excess_uqor` | 10.000.000.000 (10.000 QOR) | Cel mai mult pe care îl poate ține un singur cont de date peste minimul său scutit de chirie. `0` înseamnă fără plafon per cont. |

Ce înseamnă asta pentru o aplicație: păstrează valoarea parcată în conturile SVM modestă și peste minimul de chirie doar cu cât ai nevoie. Un depozit care este în regulă pentru soldul tău poate fi totuși refuzat dacă fondul în ansamblu este aproape de plafon, deci tratează codul 23 ca "încearcă mai târziu sau cu mai puțin", nu ca pe o tranzacție invalidă. Limitele pot crește doar printr-un vot de guvernanță, niciodată printr-o tranzacție a unui utilizator.

## Buget de calcul și limite de dimensiune {#limits}

| Limită | Parametru | Valoare live (testnet) |
| ----- | --------- | -------------------- |
| Unități de calcul per instrucțiune | `compute_budget_max` | 1.400.000 |
| Dimensiunea programului (ELF) | `max_program_size` | 10.485.760 de octeți (10 MiB) |
| Dimensiunea contului de date | `max_account_data_size` | 10.485.760 de octeți (10 MiB) |
| Apeluri imbricate de programe | `max_cpi` | 4 |
| Schema de semnătură implicită | `default_sig_scheme` | 0 (Ed25519) |
| Decalaj de slot | `svm_slot_offset` | 0 (slotul este înălțimea blocului plus decalajul) |

Fiecare frame are o stivă de 32 KiB și un heap de 256 KiB. Valorile de mai sus pot fi schimbate prin guvernanță, deci citește-le live. În `@qorechain/svm` 0.13.0, `withComputeBudget(tx, { units })` cere o limită de unități de calcul; ține-o la sau sub `compute_budget_max`.

## Limitele actuale ale endpoint-ului SVM de testnet {#endpoint-limits}

Lane-ul este deschis, dar JSON-RPC-ul SVM public nu se comportă încă ca un nod Solana complet. Planifică în jurul acestor limite:

- **`getLatestBlockhash` returnează blockhash-ul ca 64 de caractere hexazecimale,** nu în base58 cum fac nodurile Solana (citit la 12 noiembrie 2026: `blockhash` `e8d4...d449`, `lastValidBlockHeight` 9944659). Un client care așteaptă base58 trebuie să îl convertească. Echipa lanțului a programat o schimbare.
- **`sendTransaction` în format wire Solana din uneltele Solana standard nu este încă suportat** pe endpoint-ul public. Programele sunt implementate și apelate cu mesajele Cosmos `MsgDeployProgram` și `MsgExecuteProgram`, semnate cu semnătura hibridă ca orice tranzacție pe lane-ul Cosmos (vezi helperii TypeScript de mai sus). Paritatea completă cu uneltele Solana este planificată pentru o versiune ulterioară.
- **O cheie străină poate autoriza o acțiune SVM printr-un relayer.** Autorizarea semnează un digest legat de lanț (domeniul `qorechain-svm-auth-v3`) odată ce rețeaua activează funcția de protocol `svm-relayed-chain-bound`; `@qorechain/wallet-adapter` 0.6.0 îl construiește cu `authSignBytesV3`, iar `resolveSvmAuthVersion` citește ce formă vrea rețeaua.

## Erori și refuzuri {#errors}

| Ce vezi | Semnificație | Ce faci |
| ------------ | ------- | ---------- |
| `SVM module is disabled` (cod 11) | Lane-ul este închis (mainnet, sau testnet înainte de propunerea 37) | Citește `enabled`; nu reîncerca |
| `MsgRegisterSVMPQCKey` refuzat cu `SVM account ... not found` (codespace `svm`, cod 3) | Contul SVM nu există încă | Creează mai întâi contul, apoi înregistrează-i cheia |
| `MsgRegisterSVMPQCKey` refuzat cât timp lane-ul este închis | Lane închis | Înregistrează după ce lane-ul se deschide |
| Metodă de scriere refuzată pe `svm.qore.host` sau `svm-testnet.qore.host` | Endpoint-urile publice sunt doar pentru citire | Folosește propriul nod |
| `svm custody cap exceeded` (cod 23) | Fondul este la plafon | Reîncearcă mai târziu sau cu o sumă mai mică |
| `airdrop rate limit exceeded` (cod 19) | `requestAirdrop` apelat prea des (doar testnet) | Așteaptă |
| `blockhash expired` (cod 20) | Blockhash-ul recent este prea vechi | Ia unul proaspăt și semnează din nou |
| `svm simulation slots busy, retry later` (cod 24) | Simulările sunt limitate; nu apare niciodată într-un bloc | Reîncearcă simularea |
| HTTP 501 pe `/qorechain/svm/v1/account/...` | Rută neimplementată pe endpoint-ul public | Folosește `getAccountInfo` |

## Testat pe testnet {#tested}

Rulat pe `qorechain-diana` la 12 noiembrie 2026 (versiunea v3.2.8), după ce propunerea 37 a trecut.

| Pas | Rezultat |
| ---- | ------ |
| `GET /cosmos/circuit/v1/disable_list` | Doar `/cosmwasm.wasm.v1.MsgStoreCode` |
| `GET /qorechain/svm/v1/params` | `enabled` true; `max_program_size` 10485760, `max_account_data_size` 10485760, `compute_budget_max` 1400000, `lamports_per_byte` 3480, `rent_exemption_multi` 2, `max_cpi` 4, `max_custody_uqor` 10000000000, `max_custody_hard_uqor` 1000000000000, `max_account_excess_uqor` 10000000000 |
| `MsgRegisterSVMPQCKey` pentru o adresă SVM care nu există încă | Refuzat: codespace `svm` cod 3, `SVM account ... not found: SVM account not found`. Contul trebuie să existe înainte ca cheia sa post-cuantică să fie înregistrată |

Nerulate (UNTESTED): implementarea unui program, execuția unui program și crearea unui cont SVM.

## Mainnet {#mainnet}

Mainnet-ul rămâne deocamdată pe v3.2.6, cu lane-ul SVM oprit, iar activarea lui pe mainnet are nevoie de o versiune ulterioară și de un vot de guvernanță. Planifică doar în funcție de testnet.

## Vezi și {#see-also}

* [Dezvoltare SVM](/developer-guide/svm-development): prezentarea lane-ului, serverul JSON-RPC și QOR nativ ca lamports.
* [JSON-RPC compatibil Solana](/api-reference/json-rpc-solana-compatible): lista metodelor.
* [Semnarea post-cuantică](/developer-guide/post-quantum-signing): semnătura hibridă de care are nevoie fiecare tranzacție de pe lane-ul nativ.
* [Interoperabilitate între VM-uri](/developer-guide/cross-vm-interoperability): apeluri între SVM, EVM și QoreChain Native.
* [Operatori de noduri: lista de verificare v3.2.8](/developer-guide/node-operators-v328): actualizarea unui nod.
