---
slug: /appendix/version-history
title: Istoricul versiunilor
sidebar_label: Istoricul versiunilor
sidebar_position: 3
---

# Istoricul versiunilor

Istoricul public al versiunilor QoreChain. Cea mai recentă versiune este **v3.1.85**, care rulează pe mainnet-ul **`qorechain-vladi`** (chain ID EVM **9801**, live din 7 iunie 2026). Testnet-ul **`qorechain-diana`** (chain ID EVM **9800**) urmărește build-urile pre-lansare.

:::note
Intrările de mai jos sunt rezumate de nivel înalt ale capabilităților. Intrările mai vechi `v1.x` sunt păstrate ca înregistrare istorică a liniei de versiuni de testnet care a precedat mainnet-ul.
:::

---

## v3.1.85 — Cheltuire delegată prin portofele conectate (versiunea curentă)

**Obiectivul versiunii:** O cheie de portofel extern conectat (Phantom, MetaMask) poate acum să **cheltuiască** din contul canonic post-cuantic unic — sub permisiuni cu privilegii minime, limite de cheltuire și revocare instantanee.

* **Benzi de execuție pentru autentificatori** — Două mesaje noi permit unui autentificator înregistrat să autorizeze transferuri din contul canonic fără prezența proprietarului contului: **`MsgExecuteEVM`** (un apel/transfer EVM de la adresa `0x…` a contului) și **`MsgExecuteCosmos`** (un transfer bank pe banda Native). Un **relayer** trimite și plătește anvelopa — propria sa semnătură hibridă PQC satisface cerințele tranzacției — în timp ce semnătura autentificatorului peste octeți de semnare separați pe domenii și protejați împotriva reluării constituie autorizarea. Cheia externă nu are nevoie niciodată de o co-semnătură ML-DSA.
* **MetaMask ca autentificator** — Autentificatorii secp256k1 pot fi acum înregistrați prin **adresa Ethereum de 20 de octeți** și verificați prin **EIP-191 `personal_sign`** (pe lângă forma cu cheie comprimată de 33 de octeți), astfel încât un cont MetaMask standard poate fi conectat și poate cheltui sub limite.
* **Aplicare pe toate cele trei benzi** — Domeniile de permisiuni și limitele de valoare **SpendingRule** (per tranzacție + plafoane zilnice) sunt aplicate pe benzile Native, EVM și SVM; mesajele de gestionare a cheilor nu sunt niciodată delegabile. Coduri de eroare distincte permit portofelelor să afișeze mesajul potrivit: `5` limită de cheltuire depășită, `6` autentificator expirat, `10` permisiune refuzată, `11` reluare respinsă.
* **Interogarea schemei de permisiuni** — `GET /qorechain/abstractaccount/v1/permission_schema` (de asemenea gRPC/CLI) returnează taxonomia canonică de permisiuni (11 permisiuni), maparea mesaj→permisiune și lista mesajelor nedelegabile, astfel încât portofelele validează domeniile de acces fără hardcodare.
* **Rotația cheilor PQC în același algoritm** — Noul **`MsgRotatePQCKey`** rotește cheia ML-DSA-87 a unui cont în cadrul aceluiași algoritm (semnat dual de cheia veche și cea nouă), permițând migrarea cheilor derivate în mod legacy către derivarea canonică legată de adresă și retragerea unei chei compromise. CLI nou: `tx pqc rotate-key` și `tx pqc recover-key` (recuperare deterministă a cheii dintr-o frază mnemonică).
* **Tranzacțiile cu cheia rădăcină neafectate** — Modificările sunt aditive; fluxurile normale de portofel, exchange și Keplr rămân neschimbate. Operatorii de noduri trebuie să fie pe **v3.1.85** până la înălțimea de upgrade a rețelei.

## v3.1.84 — Permisiuni pentru autentificatori și limite de cheltuire

**Obiectivul versiunii:** Modelul de permisiuni din spatele cheltuirii delegate.

* **Taxonomie canonică de permisiuni** — Unsprezece permisiuni (`all`, `send`, `delegate`, `withdraw`, `vote`, `evm`, `wasm`, `svm`, `amm`, `ibc`, `deploy`) cu o mapare mesaj→permisiune de tip fail-closed: un tip de mesaj care nu este mapat este refuzat, iar mesajele de gestionare a cheilor nu pot fi niciodată delegate.
* **Aplicarea SpendingRule** — Plafoanele de cheltuire per tranzacție și per zi (UTC), cu liste de denominări permise, sunt aplicate și înregistrate per pereche (cont, autentificator).
* **Autorizare pe banda SVM** — Acțiunile autorizate de o cheie cu schemă externă (de ex. Phantom ed25519) pe banda SVM trec prin aceeași poartă centrală de autorizare.

## v3.1.83 — Semnare cu cont unificat pe toate cele trei interfețe

**Obiectivul versiunii:** O singură cheie, un singur cont — o identitate unificată unică ce poate acum să **semneze**, nu doar să dețină un sold, pe interfețele Cosmos, EVM și SVM.

* **O singură cheie semnează pe fiecare bandă** — Un cont creat eth-native (adresa = keccak al cheii sale publice secp256k1) semnează acum tranzacții pe banda Cosmos cu schema `eth_secp256k1`, pe lângă tranzacțiile EVM. Formele sale `qor1…` (Cosmos), `0x…` (EVM) și Solana-VM (base58) reprezintă o singură identitate de 20 de octeți care atât **deține un singur sold**, cât și **cheltuiește pe toate cele trei benzi** — inclusiv tranzacții Cosmos hibride post-cuantice (ML-DSA-87).
* **Semnarea post-cuantică neschimbată** — Contul unificat își înregistrează în continuare cheia ML-DSA-87 și poartă semnătura hibridă FIPS-204 cerută de lanț; partea clasică este `eth_secp256k1` (keccak) în loc de schema coinType-118. Conturile coinType-118 existente nu sunt afectate.
* **Upgrade progresiv neutru pentru consens** — Livrat ca upgrade binar progresiv pe ambele rețele, **fără re-genesis și fără oprirea lanțului**. Soldurile conturilor, istoricul și genesis-ul rămân neschimbate.
* **Tooling pentru clienți** — `@qorechain/wallet-adapter` 0.1.5 adaugă semnarea Cosmos eth-native (`signClassicalEth` / `signHybridEth`), generarea unificată a celor 3 adrese și `walletFromSeed` (derivarea contului canonic din orice seed de 32 de octeți — de ex. o semnătură Phantom); `@qorechain/chain-bridge` primește o cale de semnare `eth_secp256k1`.

:::caution Operatori de noduri — upgrade obligatoriu
Nodurile complete trebuie să ruleze **v3.1.83+**. Un nod pre-3.1.83 nu poate decoda o tranzacție eth-native (`eth_secp256k1`) și va înceta să se sincronizeze imediat ce una apare într-un bloc. Descărcați pachetul curent de la [download.qore.host](https://download.qore.host).
:::

## v3.1.82 — QOR nativ pe SVM live + facilități pentru integratori

**Obiectivul versiunii:** Unificarea QOR-ului nativ pe SVM rulând pe ambele rețele, plus tot ce are nevoie un exchange sau un integrator pentru a se conecta.

* **Sold unificat de QOR nativ live pe toate cele trei interfețe** — Unificarea SVM (v3.1.81) este confirmată live pe mainnet și testnet: același cont deține un singur sold, vizibil ca `uqor` (6 zecimale) pe Cosmos, cu 18 zecimale în stil wei pe EVM și în lamports (9 zecimale; 1 uqor = 1.000 lamports) pe interfața compatibilă Solana.
* **Endpoint-uri publice verificate** — Endpoint-uri HTTPS publice pentru RPC-ul de consens, REST, JSON-RPC EVM și JSON-RPC SVM pe ambele rețele, plus [exploratorul de blocuri](https://explore.qore.network) public. Vezi [Rețele](/appendix/networks).
* **Descărcări** — Pachete versionate cu binarele nodurilor, genesis-ul mainnet-ului și snapshot-uri proaspete ale datelor lanțului (cu sume de control SHA-256), publicate la [download.qore.host](https://download.qore.host).
* **Semnare post-cuantică deterministă în întreaga stivă client** — `@qorechain/pqc` 0.1.1 semnează ML-DSA-87 determinist (FIPS-204 §3.4) în toate cele șase binding-uri de limbaj, corespunzând cu ceea ce acceptă lanțul; `@qorechain/wallet-adapter` 0.1.2 se bazează pe acesta pentru semnarea tranzacțiilor hibride.
* **Ghid pentru integratori** — Noul [Ghid pentru exchange-uri și integratori](/developer-guide/exchange-integration) acoperă depunerile, retragerile și operarea nodurilor pe cele trei interfețe.

## v3.1.81 — Unificarea QOR-ului nativ pe SVM

**Obiectivul versiunii:** QOR nativ ca activ de primă clasă pe interfața compatibilă Solana.

* **QOR nativ pe SVM** — Runtime-ul SVM expune acum direct soldul de QOR nativ al contului (în lamports), în loc să urmărească un sold separat exclusiv SVM. `getBalance` și `getSignaturesForAddress` funcționează pe fondurile native, iar transferurile System Program mută QOR nativ.
* **Maparea adreselor SVM** — Adresa SVM a unui cont este derivată din cei 20 de octeți ai contului (completați la dreapta până la 32 de octeți, codificați base58), astfel încât adresele Cosmos, EVM și SVM ale unei singure chei se referă la aceleași fonduri.

## v3.1.80 — Interogări de ancore de stare Multilayer

**Obiectivul versiunii:** Ancore de decontare lizibile și verificabile offline pentru rollup-uri.

* **Interogări de citire a ancorelor** — Serviciul de interogare `x/multilayer` expune acum `Anchor` (cea mai recentă ancoră de stare pentru un layer) și `Anchors` (istoricul ancorelor unui layer), astfel încât clienții pot prelua ancora de decontare a unui layer și o pot verifica independent.
* **Gateway REST pentru multilayer** — Fiecare interogare multilayer (`params`, `layers`, `layers/{layer_id}`, `anchor/{layer_id}`, `anchors/{layer_id}`, `routing-stats`) este acum disponibilă prin REST, pe lângă gRPC.
* **Chitanțe de decontare rezistente cuantic deblocate** — Fiecare ancoră poartă o semnătură **ML-DSA-87 (Dilithium-5)** peste câmpurile sale canonice, oferind baza on-chain pentru verificarea offline a chitanțelor de decontare din Rollup Development Kit.

## v3.1.79 — Auto-provizionarea validatorilor pentru rețelele de bridge

**Obiectivul versiunii:** Participare la cheie pe rețelele conectate pentru validatorii licențiați.

* **Framework de drivere de rețea** — Un framework declarativ de drivere permite unui validator QoreChain care deține licența relevantă `validator_<chain>` (sau `qcb_bridge`) să aibă clientul rețelei externe corespunzătoare provizionat, configurat și rulat pe același nod, sub orchestrarea QoreChain — doar după activarea licenței.
* **Drivere pentru toate cele 37 de rețele de bridge** — Acoperirea cuprinde fiecare rețea conectată, clasificată după modelul de participare (validator fără permisiuni, plafonat/ales/cu admitere, nod complet L2 și roluri fără staking/pe listă de încredere). Stake-ul și cheile de semnare pe rețeaua externă rămân furnizate de operator pentru fiecare rețea; QoreChain livrează framework-ul și poarta de licență aplicată strict.

## v3.1.78 — Pregătire pre-lansare

**Obiectivul versiunii:** Portofelele, bridge-urile, IBC și licențierea funcționează toate la lansare — fără guvernanță post-lansare.

* **Activare fără încredere a bridge-urilor post-lansare** — O cheie `bridge_admin` (sau un deținător de licență `qcb_bridge`) poate activa bridge-ul oricărui lanț conectat cu o singură tranzacție semnată (`tx bridge update-chain-config` / `set-verifier-bootstrap`) — setând adresa contractului, confirmările, arhitectura, statusul, verificatorul activ și rădăcina de încredere a verificatorului — fără propunere de guvernanță sau upgrade de lanț.
* **Poartă de licență pentru rețelele de validatori** — Orchestratorul aplică acum licența `validator_<chain>` / `qcb_bridge` (fail-closed) înainte de a porni orice client de rețea externă.
* **Pachete de integrare pentru portofele** — `@qorechain/wallet-adapter` și `@qorechain/connect` publicate pe npm (v0.1.0), adăugând înregistrarea rețelei în MetaMask cu un singur apel (EIP-3085, QOR nativ cu **18 zecimale** pe șina EVM) și configurarea prețului gazului pentru Keplr.
* **Relayer IBC la cheie** — Configurație de relayer gata de rulare și tooling de bootstrap al canalelor pentru cele opt contrapărți IBC, astfel încât canalele să pornească post-lansare fără configurări speciale.

## v3.1.77 — Endpoint-uri REST pentru Bridge și Burn

**Obiectivul versiunii:** Acces REST read-only pentru modulele cross-chain și de ofertă monetară.

* **Endpoint-uri REST pentru bridge** — Endpoint-uri HTTP de interogare read-only pentru modulul bridge, expunând starea bridge-ului prin REST standard, pe lângă gRPC.
* **Endpoint-uri REST pentru burn** — Endpoint-uri HTTP de interogare read-only pentru modulul burn, făcând datele de distribuție a comisioanelor și de ofertă monetară interogabile prin REST standard.

## v3.1.76 — Modernizarea toolchain-ului SVM

**Obiectivul versiunii:** Reîmprospătarea compatibilității cu Solana Virtual Machine.

* **Suport pentru programe cu toolchain curent** — Execuția SVM modernizată astfel încât programele construite cu toolchain-ul Solana curent să ruleze pe runtime-ul SVM al QoreChain.

## v3.1.75 — JSON-RPC SVM activat implicit

**Obiectivul versiunii:** RPC compatibil Solana disponibil din start.

* **JSON-RPC compatibil Solana** — Serverul JSON-RPC SVM este acum activat implicit (portul **8899**) și pornit automat odată cu nodul, oferind o interfață RPC compatibilă Solana pentru tooling-ul SVM.

## v3.1.74 — Presetări de profil pentru rollup-uri

**Obiectivul versiunii:** Utilizabilitatea și decontarea în Rollup Development Kit.

* **Aplicarea presetărilor de profil** — Crearea unui rollup aplică acum presetarea profilului selectat (DeFi, gaming, NFT, enterprise sau complet personalizat), astfel încât rollup-urile noi moștenesc valori implicite potrivite pentru cazul lor de utilizare.
* **Decontare optimistă** — Calea de decontare optimistă (trimitere de batch-uri și contestare) este operațională de la un capăt la altul.

## v3.1.73 — Linia de bază hash post-cuantică

**Obiectivul versiunii:** Finalizarea liniei de bază criptografice post-cuantice implicite.

* **SHAKE-256 hash implicit** — SHAKE-256 (familia SHA-3) este adoptat ca hash aplicativ implicit, completând linia de bază post-cuantică implicită formată din semnături **ML-DSA-87 (Dilithium-5)**, încapsulare de chei **ML-KEM-1024** și hashing **SHAKE-256**.

## v3.1.72 — Stabilitate și mentenanță

**Obiectivul versiunii:** Mentenanță de rutină a stabilității și a pipeline-ului de build.

* **Îmbunătățiri de stabilitate** — Mentenanță internă a stabilității, dependențelor și pipeline-ului de build, fără modificări de comportament vizibile extern.

## v3.1.71 — Semnături hibride PQC aplicate implicit

**Obiectivul versiunii:** Securitate post-cuantică activată implicit pe calea de tranzacții Cosmos.

* **Semnături hibride obligatorii implicit** — Semnăturile hibride post-cuantice sunt acum aplicate implicit pe calea de tranzacții Cosmos: fiecare tranzacție poartă o semnătură post-cuantică **ML-DSA-87 (Dilithium-5)** alături de semnătura clasică **secp256k1**.
* **Aplicare controlată prin guvernanță** — Modul de aplicare rămâne controlat prin guvernanță, cu valoarea implicită setată pe **obligatoriu**.

## v3.1.70 — Consolidare pentru producție

**Obiectivul versiunii:** Consolidare pentru producție și optimizarea consensului pentru mainnet-ul live.

* **Optimizarea consensului PRISM** — Îmbunătățiri continue ale stratului de optimizare cu învățare prin întărire PRISM pentru ajustarea adaptivă a parametrilor în condiții de rețea live, cu controale de siguranță de tip circuit-breaker.
* **Performanță și stabilitate** — Rafinări ale debitului, latenței și utilizării resurselor pe validatori și noduri complete.
* **Tooling operațional** — Ergonomie îmbunătățită de monitorizare, interogare și operare a nodurilor pentru operatorii de mainnet.
* **Aliniere la Tokenomics v2.1** — Distribuția comisioanelor și mecanica de emisie aliniate cu modelul economic cu ofertă fixă și emisie finită.

## v3.0.0 — Genesis-ul mainnet-ului

**Obiectivul versiunii:** Lansarea mainnet-ului și evenimentul de generare a tokenului.

* **Genesis mainnet** — Mainnet-ul QoreChain (`qorechain-vladi`, chain ID EVM 9801) a fost lansat pe **7 iunie 2026**, cu evenimentul de generare a tokenului (TGE) la genesis.
* **Împărțirea comisioanelor în cinci direcții** — Distribuția comisioanelor de protocol între validatori, burn, trezorerie, stakeri și noduri light (**37 / 30 / 20 / 10 / 3**), adăugând o cotă dedicată nodurilor light.
* **AMM on-chain** — Modul nativ de automated-market-maker (`x/amm`) pentru pool-uri de lichiditate și swap-uri on-chain.
* **Licențiere pe lanț** — Modul de licențe on-chain (`x/license`) pentru înregistrarea și gestionarea drepturilor de protocol.
* **Paradigme de decontare consolidate** — Modurile de decontare RDK finalizate ca: optimist, zk, based și suveran.

## v1.4.0 — Extindere pre-mainnet

**Obiectivul versiunii:** Acoperire cross-chain și stabilizarea candidatului de lansare înaintea mainnet-ului.

* **Acoperire cross-chain extinsă** — Conectivitate IBC și de bridge suplimentară către un set mai larg de rețele externe.
* **Participarea nodurilor light** — Au fost introduse nodurile light și fundația pentru recompensele lor din cota de comisioane.
* **Consolidarea candidatului de lansare** — Testare extinsă, audituri și stabilizare pe toate modulele de bază, în pregătirea genesis-ului mainnet-ului.

## v1.3.0 — Rollup Development Kit

**Obiectivul versiunii:** Infrastructură nativă de rollup pentru implementări de rollup-uri suverane și cu securitate partajată.

* **Modulul x/rdk** — Rollup Development Kit complet, cu patru paradigme de decontare: optimist, zk, based și suveran
* **5 profiluri presetate** — Șabloane de rollup pre-configurate pentru cazuri de utilizare DeFi, gaming, NFT, enterprise și complet personalizate
* **Disponibilitate nativă a datelor** — Strat DA on-chain cu stocare de blob-uri, gestionarea retenției și ciclu de viață de pruning
* **Auto-finalizare prin EndBlocker** — Finalizare automată a batch-urilor la expirarea ferestrei de contestare, fără a fi necesară intervenția operatorului
* **Selecție de profil asistată de AI** — Interogarea `suggest-profile`, care recomandă o configurație optimă de rollup pe baza cazului de utilizare vizat
* **Integrare multilayer** — Rollup-urile se înregistrează ca layere în arhitectura multilayer, moștenind mecanica de rutare, ancorare și contestare
* **Ciclu de viață de escrow bancar** — Stake-ul operatorului este ținut în escrow pe durata operării rollup-ului și eliberat la o închidere curată sau pierdut la slashing

## v1.2.0 — IBC și bridge-uri

**Obiectivul versiunii:** Conectivitate cross-chain și abstracțiuni avansate de cont.

* **25 de conexiuni cross-chain** — 8 canale IBC și 17 conexiuni QoreChain Bridge (QCB) către rețele externe
* **Modulul x/babylon** — Integrare de restaking BTC, care permite deținătorilor de Bitcoin să participe la securitatea de staking a QoreChain
* **Modulul x/abstractaccount** — Framework de conturi inteligente cu reguli de cheltuire programabile, chei de sesiune și logică de autentificare personalizată
* **Modulul x/fairblock** — Criptare pe bază de identitate cu prag (tIBE) pentru criptarea tranzacțiilor rezistentă la MEV
* **Modulul x/gasabstraction** — Plata gazului multi-token, cu suport pentru QOR nativ, USDC adus prin bridge IBC și ATOM adus prin bridge IBC
* **Prioritizare TX pe 5 benzi** — Benzi de tranzacții ordonate după prioritate: sistem, guvernanță, staking, bridge și general
* **Configurații de relayer IBC** — Setup-uri de relayer pre-configurate pentru toate canalele IBC suportate
* **Integrare bridge-către-burn** — Comisioanele de bridge sunt direcționate prin distribuția de comisioane a modulului burn

## v1.1.0 — Semnături hibride PQC

**Obiectivul versiunii:** Securitate criptografică post-cuantică și agilitate algoritmică.

* **Semnături duale secp256k1 (ECDSA) + ML-DSA-87** — Fiecare tranzacție poartă atât o semnătură clasică, cât și una post-cuantică, verificate în lanțul AnteHandler
* **3 moduri de aplicare** — Aplicare configurabilă a semnăturilor hibride: oprit (modul 0), permisiv (modul 1, PQC opțional), obligatoriu (modul 2, PQC obligatoriu)
* **Auto-înregistrare** — Cheile publice PQC sunt înregistrate automat la prima tranzacție hibridă, eliminând un pas separat de înregistrare
* **Fundament de hash SHAKE-256** — Toate operațiunile de hashing legate de PQC folosesc SHAKE-256 (familia SHA-3) pentru derivarea de adrese rezistentă cuantic
* **Interfețe de atestare TEE** — Suport pentru atestare prin Trusted Execution Environment, pentru dovedirea integrității generării cheilor PQC
* **Framework de agilitate algoritmică** — Registru de algoritmi de tip plug-in, care permite adăugarea viitorilor algoritmi PQC prin guvernanță, fără upgrade de lanț

## v1.0.0 — Genesis (motorul de tokenomics)

**Obiectivul versiunii:** Lansarea inițială a protocolului, cu tokenomics complet, execuție multi-VM și operațiuni asistate de AI.

* **Modulul x/burn** — Mecanism de ardere a comisioanelor pe canale multiple, cu distribuție în patru direcții între validatori, burn, trezorerie și stakeri
* **Modulul x/xqore** — Derivat de staking pentru guvernanță, cu penalități etajate de deblocare anticipată și redistribuție rebase PvP
* **Modulul x/inflation** — Emisie pe bază de epoci cu decădere anuală, guvernată de modelul economic cu emisie finită
* **Stratul de consens PRISM** — Optimizare cu învățare prin întărire (PPO) pentru ajustarea dinamică a parametrilor lanțului, cu controale de siguranță de tip circuit-breaker
* **CPoS cu triplu pool** — Classified Proof-of-Stake cu pool-uri de validatori Emerald, Sapphire și Ruby, ponderate după scoruri de reputație
* **Guvernanță QDRW** — Sistem Dynamic Reward Weighting, care permite ajustări aprobate prin guvernanță ale distribuției recompenselor între pool-uri
* **Runtime-uri EVM + CosmWasm + SVM** — Trei medii de execuție concurente: QoreChain EVM Engine, contracte inteligente CosmWasm și Solana Virtual Machine
* **Bridge cross-VM** — Transmitere de mesaje și transferuri de active între runtime-urile EVM, CosmWasm și SVM în cadrul aceluiași bloc
* **Criptografie post-cuantică** — Semnare rezistentă cuantic, susținută de o bibliotecă PQC de înaltă performanță
* **QCAI** — Analiză euristică on-chain, cu un sidecar opțional off-chain pentru detectarea fraudelor, estimarea comisioanelor și optimizarea rețelei
* **Implementare containerizată** — Implementare completă de testnet multi-validator, cu serviciu sidecar și indexer de blocuri
* **Indexer de blocuri** — Listener de blocuri cu stocare persistentă pentru interogări istorice și analitică
