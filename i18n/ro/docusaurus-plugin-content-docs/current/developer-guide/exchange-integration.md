---
slug: /developer-guide/exchange-integration
title: Ghid pentru Exchange-uri și Integratori
sidebar_label: Integrare Exchange
sidebar_position: 11
---

# Ghid pentru Exchange-uri și Integratori

Tot ce are nevoie un exchange, un custode sau un integrator de plăți pentru a lista QOR și a procesa depuneri și retrageri: alegerea unei interfețe, detectarea sigură a depunerilor și semnarea retragerilor.

:::note
Acest ghid vizează mainnet-ul **`qorechain-vladi`** (activ din 7 iunie 2026; versiunea de nod **v3.2.3**, aplicată la înălțimea 3.662.051 pe 20 octombrie 2026). Repetați întregul flux mai întâi pe testnet-ul **`qorechain-diana`** — rulează v3.2.4 din 19 octombrie 2026, iar mainnet-ul trece de la v3.2.3 la v3.2.4 la înălțimea 3.742.566 (propunerea de guvernanță 13), așa că modificările enumerate mai jos se aplică ambelor rețele odată ce se atinge acel bloc (endpoint-urile pentru ambele rețele se află în [Rețele](/appendix/networks#public-endpoints)). Dacă rulați propriul full node, mențineți-l la versiunea recomandată de manifestul de descărcare și niciodată sub `minCompatible` al acestuia (**3.2.3** pe mainnet până la upgrade) — un nod învechit nu poate urma upgrade-urile chain-ului și se oprește la înălțimea upgrade-ului; vezi [Rularea unui nod](/developer-guide/running-a-node#upgrades) pentru ce trebuie făcut înainte de înălțimea 3.742.566.

**Ce s-a schimbat pentru integratori în v3.2.2 și v3.2.3** (formatul de semnare, adresele, zecimalele, memo-urile și taxele rămân neschimbate):

* **Tranzacțiile Ethereum neprotejate (pre-EIP-155) sunt refuzate** în mempool și la execuția blocurilor (v3.2.2). Portofelul unui deponent trebuie să semneze cu un chain id; orice portofel actual o face.
* **Conturile de modul nu pot fi revendicate prin EVM** (v3.2.2); nu folosiți adresa unui cont de modul ca adresă de depunere sau de retragere.
* **Conturile de vesting pot fi create doar pentru semnatarul însuși** (v3.2.3); cele trei mesaje de creare a conturilor de vesting se află în prezent și pe lista circuit-breaker a mainnet-ului.
* **Mesajele de cheie PQC cer semnătura hibridă din momentul în care un cont are o cheie** (v3.2.3): vezi [Semnare Post-Cuantică](/developer-guide/post-quantum-signing#key-integrity). Înregistrați cheia hot wallet-ului o singură dată, din timp.
* **Ferestrele EVM pot fi restrânse** (v3.2.3): un hot wallet care trimite doar QOR simplu poate deschide o fereastră `native_only`, vezi [Dezvoltare EVM](/developer-guide/evm-development#evm-window).

**Ce se schimbă pentru integratori în v3.2.4** (pe testnet din 19 octombrie 2026; pe mainnet de la înălțimea 3.742.566). Semnarea tranzacțiilor, adresele, zecimalele, memo-urile și taxele rămân neschimbate, iar nimic din modul în care se detectează un depozit sau se semnează și se transmite o retragere nu se schimbă:

* **Blocări opționale de staking (modul nou `x/stakingtier`).** Un delegator poate bloca o parte dintr-o delegare pentru 3, 6 sau 12 luni (blocare minimă 10 QOR, cel mult 16 blocări deschise per delegator). Nu se întâmplă nimic cu un cont care nu creează o blocare. Cât timp o blocare este deschisă, acea sumă **nu poate fi de-delegată sau re-delegată**, pe nicio cale (o tranzacție obișnuită, `authz`, un grup sau un contract); încheierea timpurie a unei blocări arde o penalizare din stake-ul blocat. Un custodian care face staking cu fondurile clienților nu ar trebui, prin urmare, să blocheze partea pe care ar putea fi nevoit să o restituie. Citiți parametrii la `GET /qorechain/stakingtier/v1/params`.
* **O nouă sursă de ardere, `staking_tier_penalty`**, apare în statisticile de ardere odată ce au loc deblocări timpurii. Joburile de reconciliere a ofertei care enumeră sursele de ardere ar trebui să accepte un nume de sursă necunoscut.
* **Limite JSON-RPC locale nodului** pentru nodurile pe care le rulați singuri: corpurile de cerere de peste 256 KiB sunt refuzate (HTTP 413), nu se servesc mai mult de 256 de cereri simultan (HTTP 503 peste această limită), iar un filtru `eth_getLogs` sau `eth_newFilter` cu mai mult de 4 poziții de topic, 1000 de alternative într-o poziție sau 1000 de adrese este refuzat. Limitele sunt configurabile în secțiunea `[json-rpc]` din `app.toml` (vezi [Rularea unui nod](/developer-guide/running-a-node#exposing-endpoints-for-integration)). Un scaner de depozite care interoghează `eth_getLogs` cu o listă lungă de adrese ar trebui să împartă lista.
* **O înregistrare repetată de cheie este refuzată înainte de a fi plătită.** Un nod care rulează v3.2.4 respinge, la momentul transmiterii, un `MsgRegisterPQCKeyV2` care poartă exact cheia publică pe care contul o are deja înregistrată, cu eroarea pe care ar fi returnat-o chain-ul (cod PQC 7, contul există deja) și fără a percepe o taxă. Verificați `GET /qorechain/pqc/v1/account/{address}` înainte de a înregistra cheia unui hot wallet, așa cum se recomandă mai jos.
* **Indicator opțional de deținere.** Înregistrarea contului primește un câmp `possession_proven` care spune dacă o dovadă a deținerii a fost verificată la înregistrare; el nu schimbă cine poate trimite sau primi. Vezi [Semnare Post-Cuantică](/developer-guide/post-quantum-signing#proof-of-possession).
:::

## Alegerea unei căi de integrare {#choosing-a-path}

QoreChain este un singur chain cu **un singur sold nativ QOR unificat**, expus prin trei interfețe. **Aceeași cheie privată controlează aceleași fonduri** printr-o adresă Cosmos (`qor1...`), o adresă EVM (`0x...`) și o adresă SVM (base58) — alegeți interfața care se potrivește stack-ului vostru.

| | **A) Cosmos (nativ)** | **B) EVM** | **C) SVM (Solana VM)** |
|---|---|---|---|
| Adresă | `qor1...` (bech32) | `0x...` (Ethereum) | Solana base58 (aceeași cheie) |
| Zecimale (QOR nativ) | **6** (`uqor`) | **18** (stil wei) | **9** (lamports; 1 uqor = 1.000 lamports) |
| Tooling | Cosmos SDK / CosmJS | **Ethereum standard** (ethers/web3, MetaMask) | `@solana/web3.js` |
| Semnare retrageri | **PQC hibrid obligatoriu** (ML-DSA-87 + secp256k1) | **secp256k1 / EIP-155 standard, dar numai în interiorul unei ferestre de autorizare PQC deschise** (cheie ML-DSA înregistrată + o fereastră deschisă printr-un mesaj Cosmos semnat hibrid) | prin tx Cosmos sau submisie pe nod (lane momentan dezactivat) |
| Suport memo / tag | **Da** (adresă partajată + memo) | Nu (o adresă per utilizator) | Nu (o adresă per utilizator) |
| Detectare depuneri | scanare evenimente `MsgSend` | scanare blocuri via `eth_getBlockByNumber` | `getBalance` / `getSignaturesForAddress` |
| Recomandat pentru | Platforme native Cosmos | **Platforme cu integrare EVM existentă** | Platforme cu tooling Solana |

**Recomandare:** folosiți **Calea A (Cosmos)** pentru retrageri; este ruta nativă și are adrese de depunere partajate bazate pe memo. Începând cu v3.2.0, lane-ul EVM (Calea B) necesită și el o cheie ML-DSA-87 înregistrată și o **fereastră de autorizare EVM** deschisă și mărginită, care poate fi deschisă doar cu un mesaj pe lane-ul Cosmos semnat hibrid; așadar un rail de retrageri EVM are nevoie de același stack de semnare post-cuantică ca Calea A **plus** gestionarea ferestrelor (vezi [Calea B](#path-b-evm) și [fereastra de autorizare EVM](/developer-guide/evm-development#evm-window)). Calea B rămâne potrivită pentru **detectarea depunerilor** cu tooling Ethereum standard. Calea C (SVM) este, pe hârtie, o interfață nativă QOR completă, dar **lane-ul său de tranzacții este momentan dezactivat la nivel de întreagă rețea** (vezi [Calea C](#path-c-svm)) — folosiți Calea A, sau Calea B pentru detectarea depunerilor, până la redeschidere.

Cele trei interfețe **nu se exclud reciproc** — fondurile trimise către forma `0x`, `qor1` sau SVM a aceleiași chei reprezintă același sold.

## Rularea nodului vostru {#node}

Integrările de producție ar trebui să verifice depunerile față de **propriul nod sincronizat**, nu față de un endpoint terț. Urmați [Conectarea la Mainnet](/getting-started/connecting-to-mainnet) — acolo găsiți pachetul binar preconstruit (cu sume de control SHA-256), genesis-ul, peer-ii publici, pragul minim de taxă (`0.1uqor`) și un bootstrap rapid via snapshot-ul publicat al datelor chain-ului. Nu este necesară nicio licență pentru a rula un full node nevalidator.

Deoarece QoreChain are **finalitate instantanee** (fără reorganizări), **1 confirmare este finală**; așteptarea a 1–2 blocuri oferă o marjă operațională confortabilă.

## Calea A — Cosmos (nativ) {#path-a-cosmos}

URL de bază REST: `https://api.qore.host` (sau `http://localhost:1317` pe nodul vostru).

### Urmărirea depunerilor

```bash
# latest height
curl -s https://rpc.qore.host/status | jq -r .result.sync_info.latest_block_height

# all txs in a height (deposit scanning)
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs/block/{HEIGHT}" | jq '.txs'

# incoming transfers to an address
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs?query=transfer.recipient='qor1...'&limit=50" | jq '.tx_responses[].txhash'

# balance (uqor — divide by 1e6 for QOR)
curl -s "https://api.qore.host/cosmos/bank/v1beta1/balances/qor1.../by_denom?denom=uqor" | jq -r .balance.amount
```

### Checklist anti-depunere-falsă {#anti-fake-deposit}

Creditați o depunere **doar** când **toate** condițiile de mai jos sunt îndeplinite:

1. **`tx_response.code == 0`** — tranzacția a reușit; nu creditați niciodată un tx eșuat.
2. Mesajul este **`/cosmos.bank.v1beta1.MsgSend`** (sau un output de `MsgMultiSend`) — nu un apel de contract sau alt modul.
3. **`to_address`** este egal cu adresa voastră de depunere, iar (în modelul de adresă partajată) **`memo`**-ul corespunde utilizatorului.
4. **`denom == "uqor"`**, iar `amount` este valoarea creditată (uqor → ÷ 10⁶ pentru QOR). Respingeți orice alt denom.
5. Tranzacția se află într-un **bloc confirmat (committed)** (`height` prezent și ≤ ultima înălțime confirmată). Finalitatea este instantanee — 1 confirmare este finală; așteptați 1–2 blocuri pentru marjă.
6. Recalculați suma din **evenimentele de transfer** (`coin_received` / `coin_spent`) și verificați-o încrucișat față de suma din mesaj — nu aveți încredere niciodată doar într-un singur câmp sau doar în memo.
7. Verificați că hash-ul tranzacției există via `GET /cosmos/tx/v1beta1/txs/{hash}` față de **propriul vostru** nod sincronizat.

### Retrageri — semnare PQC hibridă {#cosmos-withdrawals}

Mainnet-ul impune **semnături post-cuantice** pe tranzacțiile cosmos (`allow_classical_fallback = false`): fiecare retragere are nevoie de o **semnătură hibridă** — ML-DSA-87 (Dilithium-5, FIPS-204) **plus** secp256k1. Depunerile **nu** necesită acest lucru (doar urmăriți chain-ul).

Biblioteca de semnare este [**`@qorechain/wallet-adapter`**](https://github.com/qorechain/qorechain-wallet-adapter) (npm), care aduce `@qorechain/pqc` pentru primitivele FIPS-204:

```bash
npm i @qorechain/wallet-adapter @qorechain/pqc @cosmjs/proto-signing@0.32 @cosmjs/stargate@0.32 cosmjs-types@0.9.0
# pin the cosmjs packages to 0.32 (the adapter's peer range) and cosmjs-types to 0.9.x — 0.10 breaks the subpath imports the adapter uses
```

Semnarea este un flux în **doi pași** (oglindind `qorechaind tx pqc cosign`):

**Pasul 1 — o singură dată per hot wallet: înregistrați cheia sa ML-DSA-87.** Această tranzacție de înregistrare unică este **semnată clasic** (excepție de bootstrap, pentru un cont care nu are încă o cheie; odată ce există o cheie, orice alt mesaj de cheie trebuie semnat hibrid): mesajul `/qorechain.pqc.v1.MsgRegisterPQCKeyV2` cu `{sender, public_key, algorithm_id: 1, key_type: "hybrid"}`. Derivați cheia ML-DSA determinist, astfel încât să poată fi recuperată din secretul vostru existent — de exemplu `seed = SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)`, apoi `mldsa.keygen(seed)` — și stocați seed-ul alături de cheia hot wallet-ului. Înregistrarea este explicită: nimic nu înregistrează cheia în locul vostru când apare prima tranzacție hibridă, iar o cheie încorporată într-o tranzacție nu este înregistrată. Chain-ul refuză cheile `classical_only` și cheile care nu oferă nicio protecție post-cuantică (cod 230) și verifică o dovadă opțională de posesie atunci când atașați una (CLI: `register-key-v2 ... --pqc-key`; `@qorechain/sdk` 0.9.0 atașează una singur prin `ensurePqcRegistered` după ce rețeaua a aplicat v3.2.3, iar `@qorechain/wallet-adapter` 0.4.0 nu atașează una, ceea ce este acceptat). Setați explicit gas-ul (cheia de 2.592 de bytes are nevoie de mai mult decât cei 200.000 impliciți; folosiți `--gas 600000` în CLI, o limită de gas de 600.000 în cod și o taxă de cel puțin gas × 0.1 uqor, adică 60.000 uqor).

**Pasul 2 — pentru fiecare retragere ulterioară: semnați hibrid `MsgSend`-ul.** Adapterul încorporează semnătura ML-DSA-87 într-o extensie de tx-body *înainte* de `signDirect`-ul obișnuit secp256k1, astfel încât signer-ul vostru existent rămâne neschimbat:

```js
import { QoreChainSigner } from "@qorechain/wallet-adapter";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx.js";

// pqc = { publicKey, secretKey } from mldsa.keygen(seed)
// accountNumber + sequence from the auth query
const signer = new QoreChainSigner({ wallet, chainId: "qorechain-vladi",
  rest: "https://api.qore.host",   // used to pick the network's hybrid sign-bytes form (required on mainnet and testnet)
  address, pubkeySecp256k1, accountNumber, pqc });
const txBytes = await signer.signHybrid({
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: MsgSend.encode(MsgSend.fromPartial({ fromAddress, toAddress,
      amount: [{ denom: "uqor", amount: "1000000" }] })).finish() }],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gasLimit: 400000n },
  sequence });
```

Difuzați (broadcast) bytes-ii semnați:

```bash
curl -s -X POST https://api.qore.host/cosmos/tx/v1beta1/txs \
  -H 'Content-Type: application/json' \
  -d '{"tx_bytes":"<base64-signed-tx>","mode":"BROADCAST_MODE_SYNC"}' | jq .tx_response.code
# 0 => accepted into the mempool
# code 20 "hybrid PQC signature required" => the transaction carries no PQC extension
#   (a classical-only transaction is refused; only the key registration itself is exempt)
# code 21 => the PQC half did not verify (wrong key or sign-bytes form), see the troubleshooting link below
```

Apoi interogați periodic `GET /cosmos/tx/v1beta1/txs/{hash}` până apare într-un bloc cu `code == 0`.

Pentru un HSM sau un signer custom în alt limbaj, folosiți bibliotecile FIPS-204 de sine stătătoare [**`qorechain-pqc`**](/developer-guide/post-quantum-signing) (npm, PyPI, crates.io, Maven Central, Go) și asamblați aceeași extensie. Chain-ul acceptă orice semnătură ML-DSA-87 validă conform FIPS-204, hedged sau deterministă; semnarea deterministă (FIPS-204 §3.4, implicită în biblioteci) vă dă o semnătură și un hash de tx reproductibile. Vezi [Semnare deterministă](/developer-guide/post-quantum-signing#deterministic-signing), și [Depanarea codului 21](/developer-guide/post-quantum-signing#code-21) dacă o tranzacție hibridă este respinsă.

### Alternativă server-side: `@qorechain/chain-bridge` {#chain-bridge}

Pentru un worker hot-wallet complet server-side (fără niciun wallet de browser implicat), **`@qorechain/chain-bridge`** (npm) încapsulează întregul flux — derivarea cheii, semnarea hibridă și broadcast-ul — într-un singur apel. Este JavaScript pur (fără addon-uri native), potrivit pentru worker-e serverless:

```js
import { ChainBridge } from "@qorechain/chain-bridge";

const bridge = new ChainBridge({
  cosmosRpc: "https://rpc.qore.host",       // or your own node
  cosmosRest: "https://api.qore.host",      // used to pick the network's hybrid sign-bytes form (required on mainnet and testnet)
  chainId: "qorechain-vladi",
  signerMnemonic: process.env.HOT_WALLET_MNEMONIC,  // from your secrets manager
});

// One call: derives the canonical ML-DSA-87 key, hybrid-signs the MsgSend, and broadcasts.
// Amounts are in uqor (6 decimals). Register the key beforehand with bridge.registerPqc({ mnemonic }).
const { txHash } = await bridge.sendTokens({
  to: "qor1recipient...",
  amountUqor: "1000000",   // 1 QOR
});
```

Dacă contul nu are încă o cheie înregistrată, biblioteca însăși trimite tranzacția explicită `MsgRegisterPQCKeyV2` și reîncearcă o dată; acesta este comportamentul bibliotecii, nu al chain-ului, așa că un rail de hot wallet ar trebui să înregistreze cheia din timp și să o confirme (`GET /qorechain/pqc/v1/account/{address}`) înainte de prima retragere. Începând cu `chain-bridge` 0.2.3, cu `cosmosRest` setat, înregistrarea poartă dovada de posesie după ce rețeaua a aplicat v3.2.3, iar înainte de orice reînregistrare biblioteca citește chain-ul: dacă contul deține deja o cheie care nu este nici cheia canonică, nici cea legacy a mnemonicului vostru, aruncă `pqc_key_mismatch` și nu trimite nimic (o înregistrare repetată costă taxa sa și este refuzată). `chain-bridge` (≥0.1.1) folosește aceeași derivare PQC canonică legată de adresă ca restul stack-ului — `SHAKE-256("qorechain:pqc:v1|address|mnemonic")` — astfel încât cheia poate fi recuperată din mnemonic cu `qorechaind tx pqc recover-key`. Conturile înregistrate cu tooling mai vechi sunt gestionate automat (fallback pe cheia legacy) și pot fi migrate o singură dată la cheia canonică cu [`MsgRotatePQCKey`](/developer-guide/post-quantum-signing#key-rotation).

## Calea B — EVM {#path-b-evm}

Integrare Ethereum standard față de `https://evm.qore.host` (chain ID **9801**) sau portul 8545 al propriului vostru nod.

* **Zecimale:** QOR nativ are **18 zecimale** pe rail-ul EVM (1 uqor = 10¹² wei). Greșirea acestei conversii duce la creditarea eronată a depunerilor cu un factor de 10¹².
* **Depuneri:** scanați blocurile cu `eth_getBlockByNumber` pentru transferuri native către adresele voastre; confirmați cu `eth_getTransactionReceipt` (`status == 0x1`). Tranzacțiile EVM ale deponenților sunt și ele supuse regulii ferestrei, așa că un utilizator al cărui cont nu are o cheie înregistrată sau o fereastră deschisă nu poate trimite o depunere de pe lane-ul EVM (poate folosi în schimb lane-ul Cosmos), iar o tranzacție semnată fără chain id (pre-EIP-155) este refuzată pe loc. O fereastră poate fi restrânsă (`native_only`, `allowed_targets`), așa că o depunere admisă este întotdeauna un transfer nativ sau un apel pe care fereastra îl permite; citiți totuși receipt-ul în loc să presupuneți.
* **Retrageri:** semnare standard secp256k1 / EIP-155, **dar numai de la un cont cu o cheie ML-DSA-87 înregistrată și o fereastră de autorizare EVM deschisă** (începând cu v3.2.0; vezi [fereastra de autorizare EVM](/developer-guide/evm-development#evm-window) și ghidul pas cu pas din [Prima ta tranzacție](/getting-started/first-transaction#evm-window)). O tranzacție în afara unei ferestre este respinsă (codespace `pqc`, codurile 26, 27 sau 28). Fereastra trebuie deschisă cu o tranzacție pe lane-ul Cosmos semnată hibrid, deci Calea B nu elimină nevoia de semnare post-cuantică; dimensionați `max-value` astfel încât să acopere valoarea plus taxa maximă (limita de gas × taxa maximă per gas) a fiecărei retrageri pe care o așteptați în interiorul ferestrei (pentru un hot wallet care trimite doar QOR simplu, adăugați `--native-only` când o deschideți) și urmăriți `GET /qorechain/pqc/v1/evm_window/{address}` pentru ca hot wallet-ul să nu rămână niciodată fără fonduri în mijlocul unui lot. Deschiderea unei ferestre avansează secvența contului, care este și nonce-ul său EVM, așa că citiți nonce-ul după ce fereastra este deschisă.
* **Anti-depunere-falsă:** verificați statusul receipt-ului, că valoarea mutată este un transfer **nativ** (nu un eveniment ERC-20 pe care nu îl indexați), și confirmați față de propriul vostru nod.
* **Maparea adreselor:** adresa `0x` și adresa `qor1` sunt două codificări ale aceluiași cont — fondurile sunt partajate. Vezi [Dezvoltare EVM](/developer-guide/evm-development).

## Calea C — SVM (compatibil Solana) {#path-c-svm}

:::caution Lane-ul SVM este momentan dezactivat
Lane-ul de execuție SVM este **momentan dezactivat la nivel de întreagă rețea pentru submisia de tranzacții**, începând cu versiunea chain v3.1.89 (22 august) — orice tranzacție trimisă către el returnează `code 11, "SVM module is disabled"`. **Nu** construiți un rail de depunere/retragere pe Calea C până când lane-ul se redeschide — aceasta este o dezactivare la compilare, nu un parametru runtime, deci nu poate fi reactivată printr-un vot de guvernanță; se așteaptă să rămână dezactivată până când un audit extern o validează. Folosiți în schimb **Calea A (Cosmos)** sau **Calea B (EVM)**. Endpoint-urile de citire (de exemplu `getBalance`) pot continua să răspundă, dar nu construiți detectare de depuneri sau fluxuri de retragere pe SVM cât timp submisia de tranzacții este dezactivată.
:::

Începând cu v3.1.82, interfața SVM servește **QOR nativ** (vezi [QOR nativ pe interfața SVM](/developer-guide/svm-development#native-qor)):

* **Solduri:** `getBalance` returnează lamports (÷ 10⁹ pentru QOR; 1 uqor = 1.000 lamports).
* **Depuneri:** `getSignaturesForAddress` oferă istoricul de tranzacții pentru o adresă; transferurile System Program mută QOR nativ.
* Endpoint-urile publice (`https://svm.qore.host`, `https://svm-testnet.qore.host`) sunt **doar pentru citire**; trimiteți tranzacțiile prin propriul vostru nod.

## Rezumatul fluxului {#flow-summary}

| Operațiune | Cale | Necesită semnare? |
|---|---|---|
| **Depunere** (utilizator → platformă) | Urmăriți propriul nod sincronizat pentru transferuri către adresa voastră (+ memo pe Cosmos) | Nu — doar monitorizare |
| **Retragere** (platformă → utilizator) | Construiți transferul, semnați offline, difuzați (broadcast) | Cosmos: PQC hibrid · EVM: secp256k1 standard în interiorul unei ferestre autorizate PQC |
| **Sold / sweep** | Interogare sold REST / EVM / SVM + transfer | Semnare doar pentru sweep |

## Legături utile

* [Conectarea la Mainnet](/getting-started/connecting-to-mainnet) — configurare nod, descărcări, snapshot
* [Rularea unui Nod](/developer-guide/running-a-node) — deployment, pruning, indexare
* [Semnare Post-Cuantică](/developer-guide/post-quantum-signing) — bibliotecile FIPS-204 din spatele retragerilor hibride
* [Rețele](/appendix/networks) — chain ID-uri, endpoint-uri, zecimale per interfață
