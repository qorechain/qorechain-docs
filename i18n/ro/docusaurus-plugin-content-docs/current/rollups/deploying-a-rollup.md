---
slug: /rollups/deploying-a-rollup
title: Implementarea unui Rollup
sidebar_label: Implementarea unui Rollup
sidebar_position: 3
---

# Implementarea unui Rollup

Poți configura un rollup specific aplicației în trei moduri: prin **Dashboard** (un formular de cerere, nu o tranzacție on-chain), prin **CLI**-ul lanțului (`qorechaind`, control total asupra tranzacției on-chain) sau cu **RDK-ul TypeScript** (`@qorechain/rdk` plus schela `create-qorechain-rollup`), care acoperă configurarea, citirile și, atunci când îi dai o cheie post-cuantică, tranzacții semnate hibrid (vezi [RDK 0.6.0: modificări și limite](#rdk-050-limits)). Această pagină acoperă toate cele trei moduri, plus ciclul de viață al operatorului și comenzile de batch.

:::caution Capabilitate în stadiu incipient
Până acum nu a fost creat niciun rollup pe vreuna dintre rețele (verificat la 23 octombrie 2026). Comenzile de mai jos folosesc testnetul **`qorechain-diana`** (chain ID EVM **9800**, versiunea de lanț **v3.2.4** din 19 octombrie 2026). Mainnetul (**`qorechain-vladi`**, chain ID EVM **9801**, activ din 7 iunie 2026) rulează versiunea de lanț **v3.2.4** din 23 octombrie 2026 (aplicată la înălțimea 3.742.566 prin propunerea de guvernanță 13); versiunile anterioare diferă în câteva detalii, pe care această pagină le marchează „de la v3.2.4". Validează fiecare implementare mai întâi pe testnet.
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
| **ID rollup** | Folosește 3–64 de caractere: litere mici, cifre, `.`, `_` și `-`, începând cu o literă sau o cifră. Lanțul impune această regulă pe ambele rețele începând cu v3.2.2 (CLI-ul o verifică înainte de a construi tranzacția), așa că un id neconform este refuzat |
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
3. **Alege o mașină virtuală.** Înregistrarea on-chain stochează o etichetă de VM. Rollup-ul tău se execută off-chain în propriul runtime; alegerea nu rulează pe lane-urile EVM, QoreChain Native sau SVM proprii ale QoreChain:
   * **EVM** — contracte Solidity / Vyper cu unelte Ethereum complete (Hardhat, Foundry, MetaMask)
   * **QoreChain Native** — contracte inteligente Rust pe runtime-ul Cosmos SDK (runtime-ul CosmWasm), cu IBC nativ
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
`--vm` înregistrează ce runtime folosește rollup-ul tău. Lanțul gazdă doar face settlement pentru rollup; nu îi execută contractele. Încărcarea QoreChain Native a lanțului gazdă este în prezent închisă, iar lane-ul său de tranzacții SVM este dezactivat la nivelul întregii rețele, ceea ce nu afectează settlement-ul unui rollup off-chain, dar înseamnă că nu poți implementa contracte pentru un rollup pe acele lane-uri ale lanțului gazdă.
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

Rollup Development Kit-ul este livrat ca două pachete npm publice pentru același modul on-chain `x/rdk` ca și CLI-ul. Nu există încă niciun rollup pe vreuna dintre rețele, deci nicio cale de tranzacție a kitului nu a fost exersată pe un rollup live; citește [RDK 0.6.0: modificări și limite](#rdk-050-limits) înainte de a te baza pe el pentru a trimite tranzacții:

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.6.0`) — SDK-ul TypeScript: un constructor de configurație cu profiluri preset, helper-e de tranzacție pentru ciclurile de viață ale rollup-ului și ale batch-urilor de settlement, DA nativ, clienți de citire tipați, chitanțe de settlement quantum-safe, QCAI Rollup Copilot, helper-e de calldata cross-VM și watchtower. Depinde de `@qorechain/sdk` `^0.9.0` și `@qorechain/evm` `^0.8.0`.
* **`create-qorechain-rollup`** (`v0.6.0`) — o schelă (scaffolder) care clonează câte un șablon de pornire funcțional pentru fiecare profil (inclusiv șablonul `multivm-rollup`).

Acestea sunt publicate pe npm. Repo-ul livrează de asemenea un CLI de operator publicat, **`@qorechain/rdk-cli`** (`qorollup`, `v0.6.0`), cu comenzile `doctor`, `create`, `status`, `watch`, `params`, `suggest`, cele de ciclu de viață (`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw` și `faucet`, plus comenzile `receipt`, `advise` și `watchtower`. Comenzile sale de tranzacție semnează exclusiv clasic (vezi limitele de mai jos).

Puncte importante, pe versiuni:

* **v0.4.2 — funcționează direct pe rețeaua live, fără configurare suplimentară.** Preset-urile `mainnet` și `testnet` includ acum endpoint-urile publice `qore.host` (REST la `api.qore.host` / `api-testnet.qore.host`), astfel încât `createRdkClient({ network })` ajunge la lanț fără `endpoints` setate manual — suprascrie doar dacă vrei să vizezi propriul nod. Aceeași versiune a redenumit identificatorul VM-ului rollup Wasm în **`native`** (QoreChain Native); `cosmwasm` rămâne un alias legacy acceptat, iar ambele se mapează la `cosmwasm` pe wire — lanțul, explorer-ul și Dashboard-ul rămân neschimbate.
* **v0.4.3 — actualizare de dependențe pentru remedierea codificării semnăturii hibride din SDK.** Clientul de tranzacții al RDK-ului în sine încă semna exclusiv clasic.
* **v0.4.4 — urmărește `@qorechain/sdk` `^0.7.0`**, versiunea SDK pentru lane-urile de autenticator din lanțul **v3.1.85**. Fără modificări în API-ul RDK.
* **v0.5.0 (18 octombrie 2026)** — verificarea chitanțelor de settlement se face față de starea lanțului și nu declară niciodată o chitanță validă pe baza propriilor câmpuri; clientul de tranzacții TypeScript semnează hibrid atunci când primește un `pqcKeypair`. Depinde de `@qorechain/sdk` `^0.8.0`.
* **v0.6.0 (versiune GitHub din 20 octombrie 2026; verificată pe fiecare registru la 23 octombrie 2026)** — versiunea de compatibilitate pentru lanțul v3.2.2 până la v3.2.4: batch-uri ancorate, chitanțe de settlement care se pot verifica, ferestre de contestare măsurate așa cum le măsoară lanțul, un encoder care corespunde structurii cross-VM a lanțului, șabloane care semnează hibrid și `@qorechain/sdk` `^0.9.0`. Detaliile și ce rămâne sunt mai jos.

**Versiuni publicate (verificat la 23 octombrie 2026).** npm `@qorechain/rdk`, `@qorechain/rdk-cli` și `create-qorechain-rollup`: **0.6.0** (`latest`); PyPI `qorechain-rdk`: 0.6.0; crates.io `qorechain-rdk`: 0.6.0; Maven Central `io.github.qorechain:qorechain-rdk`: 0.6.0 (latest și release); modulul Go `github.com/qorechain/qorechain-rdk/packages/go`: `v0.6.0` este servit de proxy-ul de module și este acum ceea ce rezolvă `@latest`; fixarea explicită a `@v0.6.0` rămâne în continuare varianta cea mai clară.

#### RDK 0.6.0: modificări și limite {#rdk-050-limits}

Această secțiune prezintă ce fac pachetele 0.6.0 publicate, verificate față de conținutul pachetelor și notele de lansare GitHub, și ce încă nu pot face. Niciunul dintre aceste puncte nu este un comportament al lanțului. Unde o afirmație spune „netestat live", nu există niciun rollup pe vreuna dintre rețele, deci calea a fost verificată doar față de cod și offline.

**Ce s-a schimbat în 0.6.0** (TypeScript, dacă o linie nu spune altfel):

* **Semnare.** `RdkClient.connectTx(signer, { pqcKeypair, rest })` semnează hibrid (secp256k1 + ML-DSA-87) atunci când transmiți un keypair; fără el semnează exclusiv clasic, iar rețelele refuză tranzacția. `signer` trebuie să fie un `OfflineDirectSigner`, iar taxa trebuie să fie explicită (un `fee` sau un `gasPrice` la conectare). Helperii noi `resolvePqcKeypair` și `pqcKeypairFromEnv` derivă dintr-un mnemonic atât cheia ML-DSA-87 canonică, cât și pe cea legacy și o folosesc pe cea pe care contul o are înregistrată on-chain; refuză, în loc să ghicească, atunci când contul deține o cheie diferită. `QORE_PQC_SEED_HEX` furnizează un seed pentru un operator care semnează cu o cheie privată brută. Kitul depinde acum de `@qorechain/sdk` `^0.9.0`, deci o instalare nouă conține o singură copie a SDK-ului (0.9.0); cu 0.5.0, npm instala SDK 0.8.3 imbricat sub kit.
* **Batch-uri ancorate.** `MsgSubmitBatch` poartă `anchor_signature` și `validator_set_hash`. `RdkTxClient.submitBatch` semnează ancora singur doar atunci când clientul semnează hibrid, are un endpoint REST și **este creatorul rollup-ului** (lanțul verifică ancora față de cheia înregistrată a creatorului); în orice alt caz trimite fără ancoră, ca înainte. Transmite `anchor: "require"` pentru a refuza în loc să trimită fără ancoră, `anchor: "off"` pentru a nu semna niciodată, sau `anchorSignature` pentru a trimite o semnătură obținută de tine. `anchorSignBytesForBatch` construiește octeții v2 pentru un creator care semnează în afara fluxului, de care are nevoie un rollup cu un sequencer separat. Netestat live.
* **Chitanțe de settlement.** Căutarea contului PQC folosește ruta la singular `/qorechain/pqc/v1/account/{address}` (0.5.0 folosea o cale la plural pe care rețelele nu o servesc). Verificarea acceptă ambele forme de sign-bytes ale ancorei și o alege pe una după înălțimea ancorei, niciodată încercându-le pe ambele: v1 sub trecerea din v3.2.2, v2 de la ea. Schema de chitanță v2 înregistrează `chainId`; verificarea refuză o chitanță verificată față de un nod al altui lanț și raportează `signBytesVersion` și o verificare `chainBinding`. Chitanțele versiunea 1 se verifică în continuare. Vezi [Chitanțe de settlement](/rollups/settlement-receipts).
* **Citiri.** `getLatestBatch` apelează `/qorechain/rdk/v1/latest_batch/{rollup_id}` (0.5.0 apela o formă pe care lanțul nu o servește), iar `listBatches` parcurge fiecare pagină (`listBatchesPage` citește una singură). `RollupView` poartă `escrowBalance` și, acolo unde nodul le raportează, `challengeWindowSec`, `challengeBond` și `proofSystem`; `BatchView` poartă `submittedTime`.
* **Ferestre de contestare.** `batchChallengeWindow` calculează fereastra unui batch așa cum o face lanțul și o evaluează față de vârful lanțului (`getChainTip`), nu față de ceasul local: secunde de timp de bloc pentru un batch care are un timp de trimitere înregistrat (regula v3.2.4: testnet de la înălțimea 8.337.253, mainnet din înălțimea 3.742.566), `window / 6` blocuri numărate de la înălțimea trimiterii în caz contrar (regula pentru batch-urile trimise înainte de înălțimea upgrade-ului). Verificarea de sănătate din spatele `qorollup status` și watchtower-ul o folosesc (vezi [Watchtower](/rollups/watchtower)).
* **Cross-VM.** `encodeCrossVmCalldata` codifică acum `executeCrossVMCall(uint8,string,bytes)`, structura pe care o decodifică nodul, și primește un `targetVm`. `isCrossVmPrecompileActive` citește lista live a precompile-urilor active (vezi [Multi-VM](/rollups/multi-vm)).
* **Reguli verificate înainte de plata unei taxe.** `rollupIdError` verifică gramatica id-ului la validarea unei configurații și înainte ca `createRollup` să transmită; `withdrawalErrors` verifică o retragere înainte ca `executeWithdrawal` să transmită.
* **Șabloane.** Șabloanele create de schelă se conectează prin `pqcKeypairFromEnv`, deci scripturile lor `create` și `submit-batch` semnează hibrid, și depind de `@qorechain/rdk` `^0.6.0`. Șablonul `multivm-rollup` verifică dacă precompile-ul este activ și cere un răspuns nevid de la țintă.
* **Python, Go, Rust și Java.** Remedierile de pe partea de citire de mai sus (ruta PQC la singular, `latest_batch`, sign-bytes v2 ai ancorei, regulile ferestrei de contestare, verificările de id și de retragere) se află și în pachetele publicate ale celorlalte patru limbaje.
* **Modificări incompatibile.** `encodeCrossVmCalldata` primește `targetVm`, iar `CROSS_VM_DEFAULT_SIGNATURE` s-a schimbat. `RollupHealth` și `BatchDeadline` poartă un `challengeWindow` în loc de vechiul termen limită exprimat în secunde.

**Limite care rămân în 0.6.0:**

* **Doar clientul TypeScript semnează hibrid.** CLI-ul `qorollup` (comenzile sale `create`, `pause`, `resume`, `stop` și `withdraw` se conectează fără o cheie post-cuantică) și clienții **Python, Go, Rust și Java** semnează exclusiv clasic, ceea ce ambele rețele refuză pe lane-ul nativ; README-urile lor spun încă acest lucru. Constructorii lor de mesaje nu au câmpul `anchor_signature` sau `validator_set_hash`. Pentru tranzacții din acestea, construiește și semnează cu CLI-ul lanțului (`--generate-only`, apoi `qorechaind tx pqc cosign`) sau folosește clientul TypeScript cu un `pqcKeypair`.
* **Nicio creare hibridă a unui rollup nu a fost exersată live,** deoarece nu există niciun rollup pe vreuna dintre rețele. Același lucru este valabil pentru batch-urile ancorate, retragerile și întregul flux al chitanțelor.
* **Ancorarea cere creatorul.** Un batch este ancorat în aceeași tranzacție doar dacă semnătura creatorului se află în ea. Dacă sequencer-ul este o altă adresă, creatorul trebuie să semneze octeții v2 în afara fluxului, iar sequencer-ul trimite rezultatul.
* **Precompile-ul cross-VM de la `0x…0901` nu are cod** și nu se află în lista precompile-urilor active pe nicio rețea, deci un apel dintr-un contract tot nu face nimic (vezi [Multi-VM](/rollups/multi-vm)).
* **Lungimea ferestrei de contestare.** Kitul citește fereastra proprie a unui rollup doar atunci când nodul o raportează (pachetul documentează acest lucru ca v3.2.4 și ulterior, pe care le rulează acum ambele rețele). În caz contrar folosește fereastra implicită a modulului; transmite `challengeWindowSecs` pentru un rollup care și-a configurat-o pe a sa. Helperii mai vechi `challengeWindowDeadline` și `isChallengeWindowClosed` sunt în continuare exportați și primesc în continuare secunde, deci nu le da o înălțime de bloc.
* **Disponibilitatea datelor.** `buildDaBlob` calculează hash-ul cu SHA-256, în timp ce commitment-ul de blob al lanțului este SHAKE-256 (vezi [Disponibilitatea datelor](/rollups/data-availability)).

**Versiuni anterioare lui 0.6.0.** 0.5.0 și cele anterioare nu ar trebui folosite pentru chitanțe de settlement, watchtower sau calldata cross-VM: 0.5.0 căuta cheia creatorului pe o rută pe care rețelele nu o servesc (deci verificarea chitanțelor eșua închis pentru fiecare chitanță autentică), reconstruia doar mesajul de ancoră v1, citea o înălțime de bloc ca timestamp (fiecare vârstă de batch și fiecare termen limită de contestare erau greșite, iar watchtower-ul ridica imediat alerta de termen limită pentru fiecare batch), apela o rută latest-batch pe care lanțul nu o servește, citea doar primele 50 de batch-uri, codifica o funcție pe care precompile-ul nu o decodifică și livra șabloane care semnau exclusiv clasic. 0.4.x nu avea semnare hibridă în clientul de tranzacții.

#### Clienții Python, Go, Rust și Java

Pe lângă pachetul TypeScript, RDK-ul oferă clienți compleți în **Python**, **Go**, **Rust** și **Java** care reflectă suprafața TypeScript: constructorul de configurație cu validare, cele cinci profiluri preset, utilitare denom/economie/bech32, helper-e Merkle binar și pentru dovezi de retragere, manifeste de rollup, clienți de citire REST și JSON-RPC `qor_`, verificări preflight/health, conturi (mnemonic → adresă `qor`) și semnare + broadcast clasic de tranzacții (`SIGN_MODE_DIRECT`, neacceptat pe rețelele cu semnătură hibridă — vezi [RDK 0.6.0: modificări și limite](#rdk-050-limits)). Toate sunt verificate față de vectori de test comuni, cross-language, și sunt **publicate** în registrele lor:

```bash
# Python — installs as qorechain-rdk, imports as qorrdk
pip install qorechain-rdk

# Rust
cargo add qorechain-rdk

# Go (pin the version)
go get github.com/qorechain/qorechain-rdk/packages/go@v0.6.0

# Java (Maven / Gradle)
# io.github.qorechain:qorechain-rdk:0.6.0
```

```python
import qorrdk
```

Versiuni curente publicate, toate **0.6.0** (verificat la 23 octombrie 2026): Python `qorechain-rdk` (PyPI, import `qorrdk`), modulul Go `github.com/qorechain/qorechain-rdk/packages/go` (`v0.6.0`), Rust `qorechain-rdk` (crates.io) și Java `io.github.qorechain:qorechain-rdk` (Maven Central). Acești clienți citesc starea lanțului; încă nu produc semnătura hibridă pe care o cer rețelele, iar constructorii lor de mesaje nu poartă câmpuri de ancoră (vezi [RDK 0.6.0: modificări și limite](#rdk-050-limits)).

:::note
RDK-ul TypeScript și șabloanele sale folosesc implicit testnetul **`qorechain-diana`**, iar preset-urile ajung la endpoint-urile publice live fără configurare suplimentară. Fixează versiunile (pin) și validează pe testnet înainte de mainnet.
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

:::caution Ce pot face scripturile create de schelă
Șabloanele `create-qorechain-rollup` 0.6.0 depind de `@qorechain/rdk` `^0.6.0`. Scripturile lor `create` și `submit-batch` se conectează prin `connectOperator()` din `src/signer.ts`, care îți rezolvă cheia post-cuantică din `QORE_MNEMONIC` (sau din `QORE_PQC_SEED_HEX` când semnezi cu `QORE_OPERATOR_PRIVATE_KEY_HEX`), o verifică față de lanț și semnează hibrid; dacă niciuna nu este setată, scriptul avertizează și semnează exclusiv clasic, ceea ce ambele rețele refuză. Niciun rollup nu a fost creat printr-un șablon pe o rețea live, deci această cale este netestată live. Scriptul `submit-batch` al șablonului de pornire este doar un flux de referință: trimite rădăcini ilustrative și o dovadă de exemplu și nu este de așteptat să finalizeze un batch pe o rețea live.
:::

### Construiește o configurație de rollup din cod

Construiește o configurație dintr-un preset, citește stake-ul și rata de ardere live de pe lanț și produce mesajul de creare. Constructorul de configurație aplică matricea de compatibilitate settlement → proof la `validate()` / `build()`. Trimite valorile rezultate cu CLI-ul de mai sus sau cu clientul TypeScript căruia i s-a dat un `pqcKeypair` — vezi [RDK 0.6.0: modificări și limite](#rdk-050-limits).

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

// The public qore.host endpoints are baked into the presets (RDK ≥ 0.4.2).
// `params()` is a REST read of /qorechain/rdk/v1/params, served on both networks.
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

Clientul REST tipat nu are nevoie de signer și citește ambele rețele:

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);
```

Pentru batch-uri, folosește `rdk.rest.getBatch(rollupId, index)` sau `qorechaind query rdk batch [rollup-id]` (mai jos); `getLatestBatch` și `listBatches` citesc, începând cu 0.6.0, ruta `latest_batch` a lanțului și fiecare pagină a listei de batch-uri (vezi [RDK 0.6.0: modificări și limite](#rdk-050-limits)).

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

Dezafectează permanent rollup-ul și eliberează stake-ul. QOR-ul stake-uit — minus arderea unică de la creare și minus orice a fost deja plătit din escrow-ul rollup-ului prin retrageri sau recompense pentru dovezi de fraudă — este returnat creatorului: începând cu v3.2.3, un registru de escrow per rollup înregistrează ce mai deține fiecare rollup, `stop-rollup` returnează exact acel sold, iar un rollup oprit nu mai plătește retrageri. Stake-ul de înregistrare a stratului, de 1.000 QOR, este returnat separat când stratul rollup-ului este dezafectat.

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

### Trimite un batch {#submit-a-batch}

Trimite un batch de settlement pentru un rollup. Primește ID-ul rollup-ului, un index de batch și o rădăcină de stare codificată hex. Pentru fiecare batch după primul, transmite rădăcina de stare a batch-ului anterior ca `--prev-state-root`.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --prev-state-root <previous-state-root-hex> --tx-count 120 \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > batch.json
qorechaind tx pqc cosign batch.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

| Flag | Descriere |
| ---- | ----------- |
| `--prev-state-root` | Rădăcina de stare hex de la care pornește batch-ul (obligatorie pentru fiecare batch după indexul `0`) |
| `--tx-count` | Numărul de tranzacții rollup din batch |
| `--data-hash` | Hash-ul hex al datelor batch-ului postate ca blob DA (lasă-l gol astăzi: nu există nicio modalitate de a posta un blob, vezi [Disponibilitatea datelor](/rollups/data-availability)) |
| `--withdrawals-root` | Rădăcina Merkle hex a retragerilor L2 → L1 ale batch-ului (vezi [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)) |
| `--anchor-signature` | Semnătura hex ML-DSA-87 a **creatorului** rollup-ului peste octeții de semnat v2 ai ancorei (din v3.2.2); batch-ul este apoi ancorat în `x/multilayer` în aceeași tranzacție, iar o ancoră refuzată refuză batch-ul |
| `--validator-set-hash` | Commitment-ul hex al setului de validatori, purtat în ancoră și acoperit de semnătură |

Fără `--anchor-signature`, batch-ul este decontat **neancorat**. Pentru a ancora un batch, afișează octeții de semnat, semnează-i cu cheia post-cuantică înregistrată a creatorului și transmite semnătura (valorile `--tx-count` și `--validator-set-hash` trebuie să corespundă celor pe care le trimiți):

```bash
qorechaind query rdk anchor-sign-bytes [layer-id] [batch-index] [state-root-hex] \
  --chain-id qorechain-diana --tx-count 120
```

`layer-id` este id-ul stratului rollup-ului (id-ul rollup-ului pentru rollup-urile create de RDK). Din TypeScript, `RdkTxClient.submitBatch` din `@qorechain/rdk` 0.6.0 semnează ancora pentru tine atunci când clientul semnează hibrid și este creatorul rollup-ului, iar `anchorSignBytesForBatch` oferă unui creator octeții de semnat în afara fluxului (vezi [RDK 0.6.0: modificări și limite](#rdk-050-limits)). `--proof` ZK pentru un rollup `zk` nu are astăzi niciun flag CLI, iar mesajul resolve-challenge nu este o comandă CLI: folosește un client. Vezi [Chitanțe de settlement](/rollups/settlement-receipts) pentru ce dovedește și ce nu dovedește o ancoră. Încă nu există niciun rollup, strat sau ancoră pe vreuna dintre rețele.

### Contestă un batch (rollup-uri optimistice) {#challenge-a-batch-optimistic-rollups}

Orice cont poate contesta un batch `submitted` în fereastra de contestare (100.800 de blocuri implicit pentru un batch trimis pe mainnet înainte de înălțimea 3.742.566; de la v3.2.4, o fereastră în secunde de timp de bloc pentru batch-urile noi: pe testnet de la înălțimea 8.337.253, pe mainnet din înălțimea 3.742.566), depunând o garanție (bond) (`challenge_bond`-ul rollup-ului; 1.000 QOR pentru preset-urile `nft` și `custom`) și o dovadă de fraudă. Primește ID-ul rollup-ului și indexul batch-ului; transmite dovada de fraudă cu `--proof`:

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

# A page of batches in index order (--limit up to 100, default 50)
qorechaind query rdk batches [rollup-id] --start 0 --limit 50
```

---

## Interogare

| Comandă | Scop |
| ------- | ------- |
| `qorechaind query rdk rollup [rollup-id]` | Detaliile unui rollup specific |
| `qorechaind query rdk list-rollups` | Toate rollup-urile înregistrate |
| `qorechaind query rdk batch [rollup-id]` | Ultimul batch de settlement (sau `--index`) |
| `qorechaind query rdk batches [rollup-id]` | O pagină de batch-uri în ordinea indexului (`--start`, `--limit`) |
| `qorechaind query rdk anchor-sign-bytes [layer-id] [batch-index] [state-root-hex]` | Octeții de semnat v2 ai ancorei pentru un batch (offline) |
| `qorechaind query rdk config` | Parametrii modulului RDK |
| `qorechaind query rdk suggest-profile [use-case]` | Afișează o trimitere către RPC-ul `qor_suggestRollupProfile`; endpoint-urile publice nu îl servesc, așa că alege un profil din tabelul [Profiluri preset](/rollups/preset-profiles) |

---

## Pașii următori

* **[Disponibilitatea datelor](/rollups/data-availability)** — backend-uri DA native, Celestia și redundante.
* **[ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)** — verificarea dovezilor și fluxul de retragere L2 → L1 prin `execute-withdrawal`.
