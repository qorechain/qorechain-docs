---
slug: /rollups/deploying-a-rollup
title: Implementarea unui Rollup
sidebar_label: Implementarea unui Rollup
sidebar_position: 3
---

# Implementarea unui Rollup

Poți configura un rollup specific aplicației în trei moduri: prin **Dashboard** (un formular de cerere, nu o tranzacție on-chain), prin **CLI**-ul lanțului (`qorechaind`, control total asupra tranzacției on-chain) sau cu **RDK-ul TypeScript** (`@qorechain/rdk` plus schela `create-qorechain-rollup`), care acoperă astăzi configurarea și citirile. Această pagină acoperă toate cele trei moduri, plus ciclul de viață al operatorului și comenzile de batch.

:::caution Capabilitate în stadiu incipient
Până acum nu a fost creat niciun rollup pe vreuna dintre rețele. Comenzile de mai jos folosesc testnetul **`qorechain-diana`** (chain ID EVM **9800**, versiunea de lanț **v3.2.2**). Mainnetul (**`qorechain-vladi`**, chain ID EVM **9801**) rulează versiunea de lanț **v3.2.1**; această pagină descrie comportamentul de pe mainnet, iar versiunea mai nouă de pe testnet poate diferi în detalii. Validează fiecare implementare mai întâi pe testnet.
:::

:::note Taxe și semnare
Rețeaua impune un preț minim al gazului de `0.1uqor`, așa că un simplu `--fees 500uqor` este refuzat, iar fiecare tranzacție pe lane-ul nativ are nevoie de co-semnătura post-cuantică hibridă. Exemplele de CLI de pe această pagină construiesc, prin urmare, tranzacția cu `--generate-only` și o co-semnează cu `qorechaind tx pqc cosign`, care o semnează și o transmite (creează cheia o singură dată cu `qorechaind tx pqc gen-key` și înregistreaz-o on-chain o singură dată cu `qorechaind tx pqc register-key`, sau folosește QoreX ori SDK-ul, care fac asta pentru tine). Taxa este fixată când este generat fișierul nesemnat, așa că setează limita de gas și taxa împreună: taxa trebuie să fie cel puțin limita de gas × 0.1 uqor. Limitele de gas de mai jos sunt orientative — simulează înainte să te bazezi pe ele. Vezi [Prima tranzacție](/getting-started/first-transaction) și [Semnarea post-cuantică](/developer-guide/post-quantum-signing).
:::

---

## Cerințe

| Cerință | Detalii |
| ----------- | ------- |
| **Stake minim** | Cel puțin 10.000 QOR (`min_stake_for_rollup`); stake-ul este ținut în escrow la crearea rollup-ului |
| **Ardere la creare** | 1 % din stake-ul pe care îl furnizezi este ars permanent la creare (o creare care nu poate aplica arderea este refuzată); restul este ținut în escrow și este returnat când rollup-ul este oprit |
| **Stake de înregistrare a stratului** | Crearea înregistrează și stratul rollup-ului în modulul multilayer, ceea ce blochează încă **1.000 QOR** (`min_sidechain_stake`) de la creator, returnați când stratul este dezafectat la oprire. Dacă stratul nu poate fi înregistrat (sold prea mic sau s-a atins limita de 10 sidechain-uri multilayer), rollup-ul este totuși creat, dar nu are strat, deci batch-urile sale nu pot fi ancorate |
| **ID rollup** | Folosește 3–64 de caractere: litere mici, cifre, `.`, `_` și `-`, începând cu o literă sau o cifră. Versiunile mai noi ale lanțului impun această regulă, așa că folosește-o de la început |
| **Cont** | Un cont QoreChain alimentat, cu o cheie post-cuantică înregistrată, cu sold suficient pentru stake, stake-ul stratului și taxele de tranzacție |

Interoghează parametrii live ai modulului pentru stake-ul minim și rata de ardere curente înainte de a implementa:

```bash
qorechaind query rdk config
```

---

## Implementare prin Dashboard (Tools → Rollups)

Dashboard-ul are un formular **Deploy a Rollup** sub **Tools → Rollups**. Este un **formular de cerere**: trimiterea lui înregistrează o cerere de provizionare pentru contul tău, revizuită de **The Qore Trust**, iar o cerere nouă afișează statusul **provisioning**. **Nu** transmite o tranzacție `create-rollup` on-chain — pentru a înregistra un rollup on-chain, folosește CLI-ul de mai jos.

### Pași

1. **Autentifică-te.** Formularul necesită o sesiune autentificată pentru a trimite o cerere și pentru a lista cererile tale existente.
2. **Denumește-ți rollup-ul.** Introdu un nume pentru rollup (2–41 caractere: litere, cifre, spații, cratime sau underscore).
3. **Alege o mașină virtuală.** Înregistrarea on-chain stochează o etichetă de VM. Rollup-ul tău se execută off-chain în propriul runtime; alegerea nu rulează pe lane-urile EVM, CosmWasm sau SVM proprii ale QoreChain:
   * **EVM** — contracte Solidity / Vyper cu unelte Ethereum complete (Hardhat, Foundry, MetaMask)
   * **CosmWasm** — contracte inteligente Rust pe runtime-ul Cosmos SDK, cu IBC nativ
   * **SVM** — mașina virtuală Solana, pentru aplicații cu execuție paralelă și throughput ridicat
4. **Alege un strat de disponibilitate a datelor.** Unde publică rollup-ul tău datele de tranzacție, astfel încât oricine să poată reconstrui starea: **QoreChain DA**, **Celestia** sau **EigenDA**. Reține că EigenDA este o opțiune la nivel de Dashboard, în timp ce backend-urile DA on-chain ale `x/rdk` sunt native, Celestia sau ambele — vezi [Disponibilitatea datelor](/rollups/data-availability).
5. **Setează un token de gas.** Token-ul folosit pentru a plăti execuția pe rollup-ul tău. Implicit este **QOR**; introdu un simbol personalizat pentru a folosi propriul token nativ.
6. **Alege un sequencer.** Cine ordonează tranzacțiile înainte de settlement: **Shared sequencer** (setul partajat QoreChain), **Dedicated (single)** (rulează propriul sequencer unic) sau **Decentralized** (un set de sequencer permisionless).
7. **Alege o țintă de settlement.** Unde își ancorează rollup-ul rădăcinile de stare și dovezile de validitate: **mainnet QoreChain** sau **Ethereum**.
8. **Trimite cererea.** Provizionarea este revizuită de **The Qore Trust**, așa că o cerere abia trimisă apare cu statusul **provisioning** până la finalizarea revizuirii.

Cererile trimise apar în lista **Your rollups** împreună cu VM-ul, stratul DA, token-ul de gas, sequencer-ul, ținta de settlement și statusul curent.

:::note
Opțiunile formularului (mașină virtuală, strat de disponibilitate a datelor, token de gas, sequencer, țintă de settlement) descriu ceea ce ceri; sunt mai largi decât ceea ce modulul `x/rdk` on-chain acceptă în prezent. On-chain, disponibilitatea datelor este `native` (Celestia nu este activ), iar sequencing-ul este făcut de creatorul rollup-ului sau de o adresă de sequencer configurată. Vezi [Disponibilitatea datelor](/rollups/data-availability).
:::

---

## Implementare prin CLI

CLI-ul creează rollup-ul direct on-chain. `create-rollup` primește trei argumente poziționale — ID-ul rollup-ului, un profil și suma de stake (în `uqor`) — plus un flag opțional `--vm`.

:::tip
Începând cu versiunea de lanț **v3.1.74**, `create-rollup` **aplică automat preset-ul profilului ales** — modul de settlement, sequencer, DA, modelul de gas și VM-ul sunt toate preluate din preset. Nu mai trebuie să le setezi manual (anterior mesajul avea hardcodată o configurație sovereign). Flag-ul `--vm` are acum **valoare implicită goală**, așa că se aplică VM-ul din preset, cu excepția cazului în care îl suprascrii explicit.
:::

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 600000 --fees 60000uqor \
  --generate-only > create-rollup.json
```

**Exemplu** — creează un rollup din preset-ul `defi` (settlement, sequencer, DA și VM provin toate din preset; `defi` se rezolvă la settlement zk pe EVM). Construiește tranzacția nesemnată, apoi atașează co-semnătura post-cuantică și transmite-o:

```bash
# 1. Build the unsigned transaction (10,000 QOR stake)
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 600000 --fees 60000uqor \
  --generate-only > create-rollup.json

# 2. Cosign with your post-quantum key and broadcast
qorechaind tx pqc cosign create-rollup.json \
  --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

Un profil ZK precum `defi` este acceptat la creare, dar un rollup creat astfel nu are o cheie de verificare, deci batch-urile sale ZK nu pot fi încă finalizate (vezi [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)).

**Flag-uri:**

| Flag | Implicit | Descriere |
| ---- | ------- | ----------- |
| `--vm` | *(gol — se folosește VM-ul din profil)* | Suprascrie tipul de VM al rollup-ului: `evm`, `cosmwasm`, `svm` sau `custom`. Lasă nesetat pentru a aplica VM-ul din preset. (În clienții RDK, runtime-ul Wasm este tipul de VM **`native`** — QoreChain Native — cu `cosmwasm` păstrat ca alias legacy; `cosmwasm` este valoarea on-wire, care este cea acceptată de acest flag la nivel de lanț.) |

:::note Eticheta VM este metadată
`--vm` înregistrează ce runtime folosește rollup-ul tău. Lanțul gazdă doar face settlement pentru rollup; nu îi execută contractele. Încărcarea CosmWasm a lanțului gazdă este în prezent închisă, iar lane-ul său de tranzacții SVM este dezactivat la nivelul întregii rețele, ceea ce nu afectează settlement-ul unui rollup off-chain, dar înseamnă că nu poți implementa contracte pentru un rollup pe acele lane-uri ale lanțului gazdă.
:::

Argumentul `[profile]` selectează o configurație preset care se aplică automat — vezi **[Profiluri preset](/rollups/preset-profiles)**. `[stake-amount]` este garanția (bond) în `uqor`; arderea la creare reprezintă 1 % din ea.

### Inspectează ce ai implementat

```bash
# Query a specific rollup by ID
qorechaind query rdk rollup my-defi-rollup

# List all registered rollups
qorechaind query rdk list-rollups
```

---

## Implementare cu RDK-ul TypeScript (`@qorechain/rdk`) {#deploy-with-the-typescript-rdk-qorechainrdk}

Rollup Development Kit-ul este livrat ca două pachete npm publice pentru același modul on-chain `x/rdk` ca și CLI-ul. Astăzi sunt cele mai utile pentru construirea și validarea configurațiilor și pentru citirea stării; vezi avertismentul de mai jos despre semnare înainte de a te baza pe ele pentru a trimite tranzacții:

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.4.4`) — SDK-ul TypeScript: un constructor de configurație cu profiluri preset, helper-e de tranzacție pentru ciclurile de viață ale rollup-ului și ale batch-urilor de settlement, DA nativ, clienți de citire tipați și noutățile din v0.4 — chitanțe de settlement quantum-safe, QCAI Rollup Copilot, helper-e de calldata cross-VM și watchtower.
* **`create-qorechain-rollup`** (`v0.4.4`) — o schelă (scaffolder) care clonează câte un șablon de pornire funcțional pentru fiecare profil (inclusiv șablonul `multivm-rollup`).

Acestea sunt publicate pe npm. Repo-ul livrează de asemenea un CLI de operator publicat, **`@qorechain/rdk-cli`** (`qorollup`, `v0.4.4`), cu comenzile `doctor`, `create`, `status`, `watch`, `params`, `suggest`, cele de ciclu de viață (`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw` și `faucet`, plus comenzile `receipt`, `advise` și `watchtower` din v0.4.

Puncte importante de la lansarea inițială v0.4.0:

* **v0.4.2 — funcționează direct pe rețeaua live, fără configurare suplimentară.** Preset-urile `mainnet` și `testnet` includ acum endpoint-urile publice `qore.host` (REST la `api.qore.host` / `api-testnet.qore.host`), astfel încât `createRdkClient({ network })` ajunge la lanț fără `endpoints` setate manual — suprascrie doar dacă vrei să vizezi propriul nod. Aceeași versiune a redenumit identificatorul VM-ului rollup Wasm în **`native`** (QoreChain Native); `cosmwasm` rămâne un alias legacy acceptat, iar ambele se mapează la `cosmwasm` pe wire — lanțul, explorer-ul și Dashboard-ul rămân neschimbate.
* **v0.4.3 — actualizare de dependențe pentru remedierea codificării semnăturii hibride din SDK.** Clientul de tranzacții al RDK-ului în sine încă semnează exclusiv clasic (vezi avertismentul de mai jos).
* **v0.4.4 — urmărește `@qorechain/sdk` `^0.7.0`**, versiunea SDK pentru lane-urile de autenticator din lanțul **v3.1.85**, astfel încât aceste capabilități ajung la utilizatorii TypeScript ai RDK-ului direct prin SDK. Fără modificări în API-ul RDK.

:::caution Semnarea cu clienții publicați
Ambele rețele necesită o semnătură hibridă (secp256k1 + ML-DSA-87) pe fiecare tranzacție pe lane-ul nativ. Pachetul npm publicat în prezent (`@qorechain/rdk` 0.4.4) semnează printr-un client exclusiv clasic, deci poate **citi** starea lanțului, dar nu poate face ca o tranzacție să fie acceptată. Pentru tranzacții, construiește și semnează astăzi cu CLI-ul (`--generate-only`, apoi `qorechaind tx pqc cosign`) sau cu semnarea hibridă din [`@qorechain/sdk`](/sdk/overview). Clienții RDK Python, Go, Rust și Java semnează de asemenea exclusiv clasic și **nu sunt potriviți pentru tranzacții** pe aceste rețele. Verifică versiunea pe care o instalezi; versiunile care adaugă semnare hibridă în clienții RDK vor fi menționate aici.
:::

:::note Citirile necesită rutele REST ale RDK
Helper-ele de citire TypeScript (`rdk.params()`, `rdk.rest.getRollup()`) apelează rute REST `/qorechain/rdk/v1/…`, pe care endpoint-urile publice de mainnet nu le servesc în prezent. Pe mainnet folosește `qorechaind query rdk …` (gRPC).
:::

#### Clienții Python, Go, Rust și Java

Pe lângă pachetul TypeScript, RDK-ul oferă clienți compleți în **Python**, **Go**, **Rust** și **Java** care reflectă suprafața TypeScript: constructorul de configurație cu validare, cele cinci profiluri preset, utilitare denom/economie/bech32, helper-e Merkle binar și pentru dovezi de retragere, manifeste de rollup, clienți de citire REST și JSON-RPC `qor_`, verificări preflight/health, conturi (mnemonic → adresă `qor`) și semnare + broadcast clasic de tranzacții (`SIGN_MODE_DIRECT`, neacceptat pe rețelele cu semnătură hibridă — vezi avertismentul de mai sus). Toate sunt verificate față de vectori de test comuni, cross-language, și sunt **publicate** în registrele lor:

```bash
# Python — installs as qorechain-rdk, imports as qorrdk
pip install qorechain-rdk

# Rust
cargo add qorechain-rdk

# Go
go get github.com/qorechain/qorechain-rdk/packages/go

# Java (Maven / Gradle)
# io.github.qorechain:qorechain-rdk:0.4.4
```

```python
import qorrdk
```

Versiuni curente publicate: Python `qorechain-rdk` **0.5.0** (PyPI, import `qorrdk`), modulul Go `github.com/qorechain/qorechain-rdk/packages/go` (**v0.5.0**), Rust `qorechain-rdk` **0.4.4** (crates.io) și Java `io.github.qorechain:qorechain-rdk` **0.4.4** (Maven Central). Acești clienți citesc starea lanțului; nu produc semnătura hibridă pe care o cer rețelele (vezi avertismentul de mai sus).

:::note
RDK-ul TypeScript și șabloanele sale folosesc implicit testnetul **`qorechain-diana`**, iar din v0.4.2 preset-urile ajung la endpoint-urile publice live fără configurare suplimentară. Fixează versiunile (pin) și validează pe testnet înainte de mainnet.
:::

### Crearea unui proiect cu `create-qorechain-rollup` {#scaffold-a-project-with-create-qorechain-rollup}

Fiecare profil are un șablon de pornire asociat (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`). Creează unul cu oricare dintre formele:

```bash
npm create qorechain-rollup my-rollup
# or
npx create-qorechain-rollup my-rollup
```

Pentru uz non-interactiv / CI, transmite explicit șablonul și rețeaua:

```bash
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --yes
```

Schela afișează costul documentat de stake și de ardere la creare, plus pașii următori pentru a crea rollup-ul și a-i citi statusul.

:::caution Verifică versiunea RDK pe care o instalează șablonul
Șabloanele fixează în prezent `@qorechain/rdk` la seria 0.2. După generarea proiectului, rulează `npm install @qorechain/rdk@latest` pentru a obține preset-urile de endpoint-uri publice `qore.host` și clienții de citire actuali. Scriptul `submit-batch` al șablonului de pornire este doar un flux de referință: trimite rădăcini ilustrative și o dovadă de exemplu și nu este de așteptat să finalizeze un batch pe o rețea live.
:::

### Construiește o configurație de rollup din cod

Construiește o configurație dintr-un preset, citește stake-ul și rata de ardere live de pe lanț și produce mesajul de creare. Constructorul de configurație aplică matricea de compatibilitate settlement → proof la `validate()` / `build()`. Trimite valorile rezultate cu CLI-ul de mai sus (sau cu un client care semnează hibrid) — vezi avertismentul despre semnare.

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

// The public qore.host endpoints are baked into the presets (RDK ≥ 0.4.2).
// `params()` is a REST read: it works where the RDK REST routes are served and
// is refused (HTTP 501) on mainnet today — use `qorechaind query rdk config` there.
const rdk = createRdkClient({ network: "testnet" });

// Read the live module parameters — never hardcode the stake or burn rate.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// The values to pass to `qorechaind tx rdk create-rollup`.
const msg = config.toCreateMsg("<your qor address>", { stakeAmount: params.minStakeForRollup });
console.log(msg.rollupId, msg.profile, msg.vmType, msg.stakeAmount);
```

Nu ești sigur ce profil ți se potrivește? `rdk.suggestProfile(...)` ar trebui să returneze o recomandare asistată de QCAI; pe endpoint-urile publice actuale returnează întotdeauna fallback-ul `defi` (`source: "fallback"`), așa că alege din [tabelul de profiluri](/rollups/preset-profiles).

### Citește starea din cod

Clientul REST tipat nu are nevoie de signer și funcționează acolo unde rutele REST ale RDK sunt servite (nu și pe mainnet în prezent):

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);
```

Pentru batch-uri, folosește `qorechaind query rdk batch [rollup-id]` (mai jos).

---

## Gestionarea ciclului de viață

Un rollup trece prin stările `pending`, `active`, `paused` și `stopped`; un rollup nou începe imediat în starea `active`. Doar creatorul îl poate pune în pauză, relua sau opri (impus începând cu versiunea de lanț v3.2.0). Fiecare comandă de mai jos urmează același tipar în doi pași ca la creare: generează tranzacția nesemnată, apoi co-semneaz-o.

### Pause

Oprește temporar rollup-ul. Starea este păstrată, iar rollup-ul poate fi reluat. Este necesar un șir de caractere care să indice motivul.

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > pause.json
qorechaind tx pqc cosign pause.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

### Resume

Reia un rollup pus anterior în pauză.

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > resume.json
qorechaind tx pqc cosign resume.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

### Stop

Dezafectează permanent rollup-ul și eliberează stake-ul. QOR-ul stake-uit — minus arderea unică de la creare — este returnat creatorului. Stake-ul de înregistrare a stratului, de 1.000 QOR, este returnat separat când stratul rollup-ului este dezafectat.

```bash
qorechaind tx rdk stop-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > stop.json
qorechaind tx pqc cosign stop.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

:::danger
Oprirea unui rollup este permanentă. Rollup-ul nu poate fi repornit după ce a fost oprit.
:::

---

## Comenzi de operator: batch-uri și contestații

Operatorii de rollup trimit batch-uri de settlement, iar contestatarii pot disputa batch-uri optimistice. Aceste comenzi stau la baza stratului de settlement descris în **[Prezentare generală Rollups](/rollups/overview)** și **[ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)**.

### Cine poate trimite și în ce ordine

* **Doar adresa de sequencer configurată a rollup-ului — sau, când nu este configurată niciuna (cazul tuturor preset-urilor), creatorul său — poate trimite batch-uri.** Based sequencing și shared sequencing nu admit încă seturi de propunători sau liste (rosters): sunt deocamdată doar etichete, iar creatorul trimite.
* Batch-urile formează un lanț: primul batch are indexul `0`; fiecare batch ulterior trebuie să folosească indexul următor și să poarte rădăcina de stare a batch-ului anterior ca `prev_state_root`.
* Un batch care poartă un hash de date pe un rollup `native` sau `both` este refuzat dacă nu este deja stocat un blob corespunzător (vezi [Disponibilitatea datelor](/rollups/data-availability)). Un batch fără hash de date nu este verificat.
* Un rollup `zk` trebuie să atașeze o dovadă, iar dovada trebuie să treacă verificarea (vezi [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)).

### Trimite un batch

Trimite un batch de settlement pentru un rollup. Primește ID-ul rollup-ului, un index de batch și o rădăcină de stare codificată hex.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > batch.json
qorechaind tx pqc cosign batch.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

Comanda CLI primește doar aceste trei argumente poziționale, deci poate trimite **doar batch-ul 0**; batch-urile ulterioare au nevoie de un client care poate seta `prev_state_root` (și, acolo unde sunt folosite, `data_hash`, `withdrawals_root` și `tx_count`). Batch-urile unui rollup sunt decontate (settled), dar **nu sunt ancorate** în `x/multilayer` pe mainnet în prezent (vezi [Rollup Development Kit](/architecture/rollup-development-kit#state-anchoring)).

### Contestă un batch (rollup-uri optimistice) {#challenge-a-batch-optimistic-rollups}

Orice cont poate contesta un batch `submitted` în fereastra de contestare, depunând o garanție (bond) (`challenge_bond`-ul rollup-ului; 1.000 QOR pentru preset-urile `nft` și `custom`) și o dovadă de fraudă. Primește ID-ul rollup-ului și indexul batch-ului; transmite dovada de fraudă cu `--proof`:

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > challenge.json
qorechaind tx pqc cosign challenge.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

| Flag | Descriere |
| ---- | ----------- |
| `--proof` | Dovadă de fraudă codificată hex |

O contestație **îngheață** batch-ul (`challenged`): acesta nu mai poate fi finalizat. **Creatorul** rollup-ului îl rezolvă apoi cu un mesaj resolve-challenge (nu este expus ca o comandă CLI; folosește un client). Lanțul decide singur rezultatul, verificând dovada stocată. Dacă frauda este confirmată, batch-ul devine `rejected`, garanția este returnată, iar contestatarul primește o sumă suplimentară egală cu garanția, din stake-ul rollup-ului; dacă este respinsă, garanția ajunge la creator, iar batch-ul revine la `submitted`.

### Inspectează batch-urile

```bash
# Latest batch for a rollup
qorechaind query rdk batch [rollup-id]

# A specific batch by index
qorechaind query rdk batch [rollup-id] --index 42
```

---

## Interogare

| Comandă | Scop |
| ------- | ------- |
| `qorechaind query rdk rollup [rollup-id]` | Detaliile unui rollup specific |
| `qorechaind query rdk list-rollups` | Toate rollup-urile înregistrate |
| `qorechaind query rdk batch [rollup-id]` | Ultimul batch de settlement (sau `--index`) |
| `qorechaind query rdk config` | Parametrii modulului RDK |
| `qorechaind query rdk suggest-profile [use-case]` | Afișează o trimitere către RPC-ul `qor_suggestRollupProfile`; endpoint-urile publice nu îl servesc, așa că alege un profil din tabelul [Profiluri preset](/rollups/preset-profiles) |

---

## Pașii următori

* **[Disponibilitatea datelor](/rollups/data-availability)** — backend-uri DA native, Celestia și redundante.
* **[ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)** — verificarea dovezilor și fluxul de retragere L2 → L1 prin `execute-withdrawal`.
