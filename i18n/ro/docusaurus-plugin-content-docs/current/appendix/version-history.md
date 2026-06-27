---
slug: /appendix/version-history
title: Istoricul versiunilor
sidebar_label: Istoricul versiunilor
sidebar_position: 3
---

# Istoricul versiunilor

Istoricul public al versiunilor pentru QoreChain. Cea mai recentă versiune este **v3.1.77**, care rulează pe mainnet **`qorechain-vladi`** (EVM chain ID **9801**, live din 7 iunie 2026). Testnet-ul **`qorechain-diana`** (EVM chain ID **9800**) urmărește build-urile pre-release.

:::note
Intrările de mai jos sunt rezumate de capabilități la nivel înalt. Intrările `v1.x` mai vechi sunt păstrate ca evidență istorică a liniei de versiuni de testnet care a precedat mainnet-ul.
:::

---

## v3.1.77 — Versiunea curentă de mainnet

**Focus-ul versiunii:** Acces REST de tip doar-citire pentru modulele cross-chain și de ofertă.

* **Endpoint-uri REST Bridge** — Endpoint-uri de interogare HTTP de tip doar-citire pentru modulul bridge, expunând starea bridge-ului prin REST standard pe lângă gRPC.
* **Endpoint-uri REST Burn** — Endpoint-uri de interogare HTTP de tip doar-citire pentru modulul burn, făcând interogabile datele de distribuție a comisioanelor și de ofertă prin REST standard.

## v3.1.76 — Modernizarea lanțului de instrumente SVM

**Focus-ul versiunii:** Reîmprospătarea compatibilității cu Solana Virtual Machine.

* **Suport pentru programe pe lanțul de instrumente curent** — Execuția SVM a fost modernizată astfel încât programele construite cu lanțul de instrumente Solana curent să ruleze pe runtime-ul SVM al QoreChain.

## v3.1.75 — SVM JSON-RPC în mod implicit

**Focus-ul versiunii:** RPC compatibil Solana din start.

* **JSON-RPC compatibil Solana** — Serverul SVM JSON-RPC este acum activat implicit (port **8899**) și pornit automat odată cu nodul, oferind o interfață RPC compatibilă Solana pentru instrumentele SVM.

## v3.1.74 — Preset-uri de profil pentru rollup

**Focus-ul versiunii:** Utilizabilitatea și settlement-ul Rollup Development Kit.

* **Aplicarea preset-urilor de profil** — Crearea de rollup-uri aplică acum preset-ul profilului selectat (DeFi, gaming, NFT, enterprise sau complet personalizat), astfel încât rollup-urile noi să moștenească valori implicite rezonabile pentru cazul lor de utilizare.
* **Settlement optimistic** — Calea de settlement optimistic (trimitere de batch și contestare) este operațională de la cap la coadă.

## v3.1.73 — Baza de hash post-cuantic

**Focus-ul versiunii:** Finalizarea bazei criptografice post-cuantice implicite.

* **Hash implicit SHAKE-256** — SHAKE-256 (familia SHA-3) este adoptat ca hash implicit al aplicației, completând baza post-cuantică implicită de semnături **ML-DSA-87 (Dilithium-5)**, încapsulare de chei **ML-KEM-1024** și hashing **SHAKE-256**.

## v3.1.72 — Stabilitate și mentenanță

**Focus-ul versiunii:** Stabilitate de rutină și mentenanță a pipeline-ului de build.

* **Îmbunătățiri de stabilitate** — Mentenanță internă de stabilitate, dependențe și pipeline de build, fără modificări de comportament vizibile extern.

## v3.1.71 — Semnături hibride PQC aplicate implicit

**Focus-ul versiunii:** Securitate post-cuantică activată implicit pe calea de tranzacții Cosmos.

* **Semnături hibride obligatorii implicit** — Semnăturile hibride post-cuantice sunt acum aplicate implicit pe calea de tranzacții Cosmos: fiecare tranzacție poartă o semnătură post-cuantică **ML-DSA-87 (Dilithium-5)** alături de semnătura clasică **secp256k1**.
* **Aplicare controlată prin guvernanță** — Modul de aplicare rămâne controlat prin guvernanță, cu valoarea implicită setată la **obligatoriu**.

## v3.1.70 — Întărire pentru producție

**Focus-ul versiunii:** Întărire pentru producție și optimizare a consensului pentru mainnet-ul live.

* **Optimizare a consensului PRISM** — Îmbunătățiri continue ale stratului de optimizare prin învățare prin întărire PRISM pentru reglarea adaptivă a parametrilor în condiții de rețea live, cu controale de siguranță de tip întrerupător de circuit.
* **Performanță și stabilitate** — Rafinări de throughput, latență și utilizare a resurselor pe validatori și noduri complete.
* **Instrumente operaționale** — Ergonomie îmbunătățită de monitorizare, interogare și operare a nodurilor pentru operatorii de mainnet.
* **Aliniere tokenomics v2.1** — Distribuția comisioanelor și mecanica emisiilor aliniate cu modelul economic cu ofertă fixă și emisie finită.

## v3.0.0 — Genesis mainnet

**Focus-ul versiunii:** Lansarea mainnet-ului și evenimentul de generare a tokenului.

* **Genesis mainnet** — Mainnet-ul QoreChain (`qorechain-vladi`, EVM chain ID 9801) a fost lansat pe **7 iunie 2026**, cu evenimentul de generare a tokenului (TGE) la genesis.
* **Împărțirea comisioanelor în cinci direcții** — Distribuția comisioanelor de protocol între validatori, ardere, trezorerie, stakeri și noduri light (**37 / 30 / 20 / 10 / 3**), adăugând o cotă dedicată pentru nodurile light.
* **AMM on-chain** — Modulul nativ de formator de piață automat (`x/amm`) pentru pool-uri de lichiditate și swap-uri on-chain.
* **Licențiere de lanț** — Modulul de licență on-chain (`x/license`) pentru înregistrarea și gestionarea drepturilor de protocol.
* **Paradigme de settlement întărite** — Modurile de settlement RDK finalizate ca optimistic, zk, based și sovereign.

## v1.4.0 — Extindere pre-mainnet

**Focus-ul versiunii:** Acoperire cross-chain și stabilizare a candidatului de versiune înainte de mainnet.

* **Acoperire cross-chain extinsă** — Conectivitate IBC și bridge suplimentară către un set mai larg de rețele externe.
* **Participarea nodurilor light** — Au fost introduse nodurile light și fundamentul pentru recompensele lor din cota de comisioane.
* **Întărirea candidatului de versiune** — Testare extinsă, audituri și stabilizare în toate modulele de bază în pregătirea genesis-ului de mainnet.

## v1.3.0 — Rollup Development Kit

**Focus-ul versiunii:** Infrastructură nativă de rollup pentru implementări de rollup-uri suverane și cu securitate partajată.

* **Modulul x/rdk** — Rollup Development Kit complet cu patru paradigme de settlement: optimistic, zk, based și sovereign
* **5 profiluri preset** — Șabloane de rollup preconfigurate pentru DeFi, gaming, NFT, enterprise și cazuri de utilizare complet personalizate
* **Disponibilitate nativă a datelor** — Strat DA on-chain cu stocare de blob-uri, gestionarea reținerii și ciclul de viață de prunare
* **Auto-finalizare EndBlocker** — Finalizare automată a batch-urilor când fereastra de contestare expiră, fără intervenția operatorului
* **Selecție de profil asistată de AI** — Interogarea `suggest-profile` care recomandă o configurație optimă de rollup pe baza cazului de utilizare vizat
* **Integrare multistrat** — Rollup-urile se înregistrează ca straturi în arhitectura multistrat, moștenind mecanica de rutare, ancorare și contestare
* **Ciclul de viață al escrow-ului bancar** — Stake-ul operatorului este păstrat în escrow în timpul operării rollup-ului și eliberat la oprire curată sau confiscat la slashing

## v1.2.0 — IBC și bridge-uri

**Focus-ul versiunii:** Conectivitate cross-chain și abstracții avansate de cont.

* **25 de conexiuni cross-chain** — 8 canale IBC și 17 conexiuni QoreChain Bridge (QCB) către rețele externe
* **Modulul x/babylon** — Integrare de restaking BTC care permite deținătorilor de Bitcoin să participe la securitatea de staking a QoreChain
* **Modulul x/abstractaccount** — Cadru de conturi inteligente cu reguli de cheltuire programabile, chei de sesiune și logică de autentificare personalizată
* **Modulul x/fairblock** — Threshold Identity-Based Encryption (tIBE) pentru criptarea tranzacțiilor rezistentă la MEV
* **Modulul x/gasabstraction** — Plata gazului în mai multe tokenuri, cu suport pentru QOR nativ, USDC adus prin bridge IBC și ATOM adus prin bridge IBC
* **Prioritizare TX pe 5 benzi** — Benzi de tranzacții ordonate după prioritate: sistem, guvernanță, staking, bridge și general
* **Configurații de releu IBC** — Setări de releu preconfigurate pentru toate canalele IBC acceptate
* **Integrare bridge-to-burn** — Comisioanele de bridge sunt rutate prin distribuția de comisioane a modulului burn

## v1.1.0 — Semnături hibride PQC

**Focus-ul versiunii:** Securitate criptografică post-cuantică și agilitate a algoritmilor.

* **Semnături duale secp256k1 (ECDSA) + ML-DSA-87** — Fiecare tranzacție poartă atât o semnătură clasică, cât și una post-cuantică, verificate în lanțul AnteHandler
* **3 moduri de aplicare** — Aplicarea configurabilă a semnăturilor hibride: oprit (mod 0), permisiv (mod 1, PQC opțional), obligatoriu (mod 2, PQC necesar)
* **Auto-înregistrare** — Cheile publice PQC sunt înregistrate automat la prima tranzacție hibridă, eliminând un pas separat de înregistrare
* **Fundament de hash SHAKE-256** — Toate operațiunile de hashing legate de PQC folosesc SHAKE-256 (familia SHA-3) pentru derivarea adreselor rezistentă cuantic
* **Interfețe de atestare TEE** — Suport de atestare Trusted Execution Environment pentru dovedirea integrității generării cheilor PQC
* **Cadru de agilitate a algoritmilor** — Registru de algoritmi de tip plug-in care permite adăugarea viitoarelor algoritmi PQC prin guvernanță, fără un upgrade de lanț

## v1.0.0 — Genesis (motor de tokenomics)

**Focus-ul versiunii:** Lansarea inițială a protocolului cu tokenomics complet, execuție multi-VM și operațiuni asistate de AI.

* **Modulul x/burn** — Mecanism de ardere a comisioanelor pe mai multe canale, cu o distribuție în patru direcții între validatori, ardere, trezorerie și stakeri
* **Modulul x/xqore** — Derivat de staking pentru guvernanță cu penalizări de deblocare anticipată pe niveluri și redistribuire prin rebase PvP
* **Modulul x/inflation** — Emisie bazată pe epoci cu decădere anuală, guvernată de modelul economic cu emisie finită
* **Stratul de consens PRISM** — Optimizare prin învățare prin întărire (PPO) pentru reglarea dinamică a parametrilor lanțului cu controale de siguranță de tip întrerupător de circuit
* **CPoS cu trei pool-uri** — Classified Proof-of-Stake cu pool-urile de validatori Emerald, Sapphire și Ruby ponderate după scorurile de reputație
* **Guvernanță QDRW** — Sistem de ponderare dinamică a recompenselor (Dynamic Reward Weighting) care permite ajustări aprobate prin guvernanță ale distribuției recompenselor între pool-uri
* **Runtime-uri EVM + CosmWasm + SVM** — Trei medii de execuție concurente: QoreChain EVM Engine, smart-contracte CosmWasm și Solana Virtual Machine
* **Bridge cross-VM** — Transmitere de mesaje și transferuri de active între runtime-urile EVM, CosmWasm și SVM în cadrul unui singur bloc
* **Criptografie post-cuantică** — Semnare rezistentă cuantic susținută de o bibliotecă PQC de înaltă performanță
* **QCAI** — Analiză euristică on-chain cu un sidecar off-chain opțional pentru detectarea fraudei, estimarea comisioanelor și optimizarea rețelei
* **Implementare containerizată** — Implementare completă de testnet multi-validator cu serviciu sidecar și indexator de blocuri
* **Indexator de blocuri** — Ascultător de blocuri cu stocare persistentă pentru interogări istorice și analiză
