---
slug: /appendix/version-history
title: Istoricul versiunilor
sidebar_label: Istoricul versiunilor
sidebar_position: 3
---

# Istoricul versiunilor

Istoricul public al versiunilor pentru QoreChain. Cea mai recentă versiune este **v3.1.80**, rulând pe mainnet **`qorechain-vladi`** (EVM chain ID **9801**, activ din 7 iunie 2026). Testnet-ul **`qorechain-diana`** (EVM chain ID **9800**) urmărește build-urile pre-release.

:::note
Intrările de mai jos sunt rezumate de capabilități la nivel general. Intrările mai vechi `v1.x` sunt păstrate ca înregistrare istorică a liniei de lansări de testnet care a precedat mainnet-ul.
:::

---

## v3.1.80 — Interogări de ancoră de stare multilayer (versiunea curentă de mainnet)

**Focusul versiunii:** Ancore de decontare lizibile, verificabile offline, pentru rollup-uri.

* **Interogări de citire a ancorelor** — Serviciul de interogare `x/multilayer` expune acum `Anchor` (cea mai recentă ancoră de stare pentru un layer) și `Anchors` (istoricul ancorelor unui layer), astfel încât clienții pot prelua ancora de decontare a unui layer și o pot verifica independent.
* **Gateway REST pentru multilayer** — Fiecare interogare multilayer (`params`, `layers`, `layers/{layer_id}`, `anchor/{layer_id}`, `anchors/{layer_id}`, `routing-stats`) este acum disponibilă prin REST, pe lângă gRPC.
* **Chitanțe de decontare quantum-safe deblocate** — Fiecare ancoră poartă o semnătură **ML-DSA-87 (Dilithium-5)** peste câmpurile sale canonice, oferind baza on-chain pentru verificarea offline a chitanțelor de decontare din Rollup Development Kit.

## v3.1.79 — Auto-provizionare de validatori pentru rețelele bridge

**Focusul versiunii:** Participare la cheie pe rețelele conectate, pentru validatorii licențiați.

* **Cadru de drivere de rețea** — Un cadru de drivere declarativ permite ca un validator QoreChain care deține licența relevantă `validator_<chain>` (sau `qcb_bridge`) să aibă clientul de rețea externă corespunzător provizionat, configurat și rulat pe același nod sub orchestrarea QoreChain — doar după activarea licenței.
* **Drivere pentru toate cele 37 de rețele bridge** — Acoperirea cuprinde fiecare rețea conectată, clasificată după modelul de participare (validator permissionless, rol cu plafon/ales/admisie, full-node L2 și roluri non-staking/trust-list). Stake-ul de rețea externă și cheile de semnare rămân furnizate de operator pentru fiecare rețea; QoreChain livrează cadrul și poarta de licență impusă.

## v3.1.78 — Pregătire pre-deploy

**Focusul versiunii:** Portofelele, bridge-urile, IBC și licențierea funcționează toate la lansare — fără guvernanță post-deploy.

* **Activare trustless de bridge post-deploy** — O cheie `bridge_admin` (sau un deținător de licență `qcb_bridge`) poate activa bridge-ul oricărui chain conectat printr-o singură tranzacție semnată (`tx bridge update-chain-config` / `set-verifier-bootstrap`) — setând adresa contractului, confirmările, arhitectura, statusul, verificatorul activ și rădăcina de încredere a verificatorului — fără propunere de guvernanță sau upgrade de chain.
* **Poarta de licență validator-rețea** — Orchestratorul impune acum licența `validator_<chain>` / `qcb_bridge` (fail-closed) înainte de pornirea oricărui client de rețea externă.
* **Pachete de integrare a portofelelor** — `@qorechain/wallet-adapter` și `@qorechain/connect` publicate pe npm (v0.1.0), adăugând înregistrarea rețelei MetaMask printr-un singur apel (EIP-3085, QOR nativ cu **18 zecimale** pe șina EVM) și configurarea prețului de gas pentru Keplr.
* **Releu IBC la cheie** — Configurație de releu gata de rulare și tooling de bootstrap pentru canale pentru cei opt parteneri IBC, astfel încât canalele să fie disponibile post-deploy fără configurare personalizată.

## v3.1.77 — Endpoint-uri REST pentru Bridge & Burn

**Focusul versiunii:** Acces REST read-only pentru modulele cross-chain și de aprovizionare.

* **Endpoint-uri REST pentru Bridge** — Endpoint-uri HTTP de interogare read-only pentru modulul bridge, expunând starea bridge-ului prin REST standard, pe lângă gRPC.
* **Endpoint-uri REST pentru Burn** — Endpoint-uri HTTP de interogare read-only pentru modulul burn, făcând datele de distribuție a taxelor și de aprovizionare interogabile prin REST standard.

## v3.1.76 — Modernizarea lanțului de unelte SVM

**Focusul versiunii:** Reîmprospătarea compatibilității cu Solana Virtual Machine.

* **Suport pentru programe pe lanțul de unelte curent** — Execuția SVM a fost modernizată astfel încât programele construite cu lanțul de unelte Solana curent să ruleze pe runtime-ul SVM al QoreChain.

## v3.1.75 — SVM JSON-RPC implicit

**Focusul versiunii:** RPC compatibil Solana, gata de utilizare.

* **JSON-RPC compatibil Solana** — Serverul SVM JSON-RPC este acum activat implicit (port **8899**) și pornit automat odată cu nodul, oferind o interfață RPC compatibilă Solana pentru tooling-ul SVM.

## v3.1.74 — Presetări de profil pentru rollup-uri

**Focusul versiunii:** Utilizabilitatea și decontarea Rollup Development Kit.

* **Aplicarea presetărilor de profil** — Crearea de rollup-uri aplică acum presetarea profilului selectat (DeFi, gaming, NFT, enterprise sau complet personalizat), astfel încât noile rollup-uri să moștenească valori implicite rezonabile pentru cazul lor de utilizare.
* **Decontare optimistă** — Calea de decontare optimistă (trimiterea loturilor și contestarea) este operațională cap-coadă.

## v3.1.73 — Baza de hash post-cuantic

**Focusul versiunii:** Finalizarea bazei criptografice post-cuantice implicite.

* **Hash implicit SHAKE-256** — SHAKE-256 (familia SHA-3) este adoptat ca hash implicit al aplicației, completând baza post-cuantică implicită formată din semnături **ML-DSA-87 (Dilithium-5)**, încapsularea cheilor **ML-KEM-1024** și hashing **SHAKE-256**.

## v3.1.72 — Stabilitate & întreținere

**Focusul versiunii:** Stabilitate de rutină și întreținerea pipeline-ului de build.

* **Îmbunătățiri de stabilitate** — Întreținere internă de stabilitate, dependențe și pipeline de build, fără modificări de comportament vizibile extern.

## v3.1.71 — Semnături hibride PQC impuse implicit

**Focusul versiunii:** Securitate post-cuantică activată implicit pe calea de tranzacții Cosmos.

* **Semnături hibride obligatorii implicit** — Semnăturile hibride post-cuantice sunt acum impuse implicit pe calea de tranzacții Cosmos: fiecare tranzacție poartă o semnătură post-cuantică **ML-DSA-87 (Dilithium-5)** alături de semnătura clasică **secp256k1**.
* **Impunere controlată prin guvernanță** — Modul de impunere rămâne controlat prin guvernanță, cu valoarea implicită setată la **required**.

## v3.1.70 — Întărire pentru producție

**Focusul versiunii:** Întărire pentru producție și optimizarea consensului pentru mainnet-ul live.

* **Optimizarea consensului PRISM** — Îmbunătățiri continue ale stratului de optimizare prin reinforcement learning PRISM pentru ajustarea adaptivă a parametrilor în condiții de rețea live, cu controale de siguranță de tip circuit-breaker.
* **Performanță și stabilitate** — Rafinări de throughput, latență și utilizare a resurselor la nivelul validatorilor și al nodurilor complete.
* **Tooling operațional** — Ergonomie îmbunătățită de monitorizare, interogare și operare a nodurilor pentru operatorii de mainnet.
* **Aliniere la Tokenomics v2.1** — Distribuția taxelor și mecanica de emisie aliniate la modelul economic cu aprovizionare fixă și emisie finită.

## v3.0.0 — Geneza mainnet

**Focusul versiunii:** Lansarea mainnet-ului și evenimentul de generare a token-urilor.

* **Geneza mainnet** — Mainnet-ul QoreChain (`qorechain-vladi`, EVM chain ID 9801) a fost lansat pe **7 iunie 2026**, cu evenimentul de generare a token-urilor (TGE) la geneză.
* **Împărțire a taxelor în cinci** — Distribuția taxelor de protocol între validatori, burn, trezorerie, stakeri și noduri light (**37 / 30 / 20 / 10 / 3**), adăugând o cotă dedicată nodurilor light.
* **AMM on-chain** — Modul nativ de automated-market-maker (`x/amm`) pentru pool-uri de lichiditate și swap-uri on-chain.
* **Licențiere de chain** — Modul de licență on-chain (`x/license`) pentru înregistrarea și gestionarea drepturilor de protocol.
* **Paradigme de decontare întărite** — Modurile de decontare RDK finalizate ca optimistic, zk, based și sovereign.

## v1.4.0 — Extindere pre-mainnet

**Focusul versiunii:** Acoperire cross-chain și stabilizare a candidatului de lansare înaintea mainnet-ului.

* **Acoperire cross-chain extinsă** — Conectivitate IBC și bridge suplimentară către un set mai larg de rețele externe.
* **Participarea nodurilor light** — Au fost introduse nodurile light și fundația pentru recompensele lor din cota de taxe.
* **Întărirea candidatului de lansare** — Testare extinsă, audituri și stabilizare la nivelul tuturor modulelor de bază, în pregătirea pentru geneza mainnet.

## v1.3.0 — Rollup Development Kit

**Focusul versiunii:** Infrastructură nativă de rollup pentru deployment-uri de rollup-uri sovereign și cu securitate partajată.

* **Modulul x/rdk** — Rollup Development Kit complet cu patru paradigme de decontare: optimistic, zk, based și sovereign
* **5 profiluri presetate** — Șabloane de rollup preconfigurate pentru cazurile de utilizare DeFi, gaming, NFT, enterprise și complet personalizate
* **Disponibilitate nativă a datelor** — Strat DA on-chain cu stocare de blob-uri, gestionarea retenției și ciclu de viață al pruning-ului
* **Auto-finalizare EndBlocker** — Finalizare automată a loturilor la expirarea ferestrei de contestare, fără intervenția operatorului
* **Selecție de profil asistată de AI** — Interogare `suggest-profile` care recomandă o configurație optimă de rollup pe baza cazului de utilizare intenționat
* **Integrare multilayer** — Rollup-urile se înregistrează ca layere în arhitectura multilayer, moștenind mecanismele de rutare, ancorare și contestare
* **Ciclu de viață al escrow-ului bank** — Stake-ul operatorului este ținut în escrow pe durata operării rollup-ului și eliberat la o oprire curată sau confiscat la slashing

## v1.2.0 — IBC & Bridges

**Focusul versiunii:** Conectivitate cross-chain și abstracții avansate de cont.

* **25 de conexiuni cross-chain** — 8 canale IBC și 17 conexiuni QoreChain Bridge (QCB) către rețele externe
* **Modulul x/babylon** — Integrare de BTC restaking care permite deținătorilor de Bitcoin să participe la securitatea de staking a QoreChain
* **Modulul x/abstractaccount** — Cadru de cont inteligent cu reguli de cheltuire programabile, chei de sesiune și logică de autentificare personalizată
* **Modulul x/fairblock** — Threshold Identity-Based Encryption (tIBE) pentru criptarea tranzacțiilor rezistentă la MEV
* **Modulul x/gasabstraction** — Plata gas-ului în mai multe token-uri, suportând QOR nativ, USDC podit prin IBC și ATOM podit prin IBC
* **Prioritizare TX pe 5 benzi** — Benzi de tranzacții ordonate după prioritate: system, governance, staking, bridge și general
* **Configurații de releu IBC** — Configurații de releu preconfigurate pentru toate canalele IBC suportate
* **Integrare bridge-to-burn** — Taxele bridge sunt rutate prin distribuția taxelor a modulului burn

## v1.1.0 — Semnături hibride PQC

**Focusul versiunii:** Securitate criptografică post-cuantică și agilitate algoritmică.

* **Semnături duale secp256k1 (ECDSA) + ML-DSA-87** — Fiecare tranzacție poartă atât o semnătură clasică, cât și una post-cuantică, verificate în lanțul AnteHandler
* **3 moduri de impunere** — Impunere configurabilă a semnăturilor hibride: off (mod 0), permissive (mod 1, PQC opțional), mandatory (mod 2, PQC obligatoriu)
* **Auto-înregistrare** — Cheile publice PQC sunt înregistrate automat la prima tranzacție hibridă, eliminând un pas separat de înregistrare
* **Fundație de hash SHAKE-256** — Toate operațiunile de hashing legate de PQC folosesc SHAKE-256 (familia SHA-3) pentru derivarea adreselor rezistentă cuantic
* **Interfețe de atestare TEE** — Suport de atestare Trusted Execution Environment pentru dovedirea integrității generării cheilor PQC
* **Cadru de agilitate algoritmică** — Registru de algoritmi pluggable care permite adăugarea de algoritmi PQC viitori prin guvernanță, fără upgrade de chain

## v1.0.0 — Geneza (motorul de tokenomics)

**Focusul versiunii:** Lansarea inițială a protocolului cu tokenomics complet, execuție multi-VM și operațiuni asistate de AI.

* **Modulul x/burn** — Mecanism de ardere a taxelor pe mai multe canale, cu o distribuție în patru direcții între validatori, burn, trezorerie și stakeri
* **Modulul x/xqore** — Derivat de staking pentru guvernanță cu penalizări de deblocare timpurie pe niveluri și redistribuire prin rebase PvP
* **Modulul x/inflation** — Emisie bazată pe epoci cu decădere anuală, guvernată de modelul economic cu emisie finită
* **Stratul de consens PRISM** — Optimizare prin reinforcement learning (PPO) pentru ajustarea dinamică a parametrilor chain-ului, cu controale de siguranță de tip circuit-breaker
* **CPoS cu triplu pool** — Classified Proof-of-Stake cu pool-uri de validatori Emerald, Sapphire și Ruby ponderate după scorurile de reputație
* **Guvernanță QDRW** — Sistem Dynamic Reward Weighting care permite ajustări aprobate prin guvernanță ale distribuției recompenselor între pool-uri
* **Runtime-uri EVM + CosmWasm + SVM** — Trei medii de execuție concurente: QoreChain EVM Engine, contracte inteligente CosmWasm și Solana Virtual Machine
* **Bridge cross-VM** — Transmiterea de mesaje și transferurile de active între runtime-urile EVM, CosmWasm și SVM în cadrul unui singur bloc
* **Criptografie post-cuantică** — Semnare rezistentă cuantic, susținută de o bibliotecă PQC de înaltă performanță
* **QCAI** — Analiză euristică on-chain cu un sidecar off-chain opțional pentru detectarea fraudei, estimarea taxelor și optimizarea rețelei
* **Deployment containerizat** — Deployment complet de testnet cu mai mulți validatori, cu serviciu sidecar și indexer de blocuri
* **Indexer de blocuri** — Block listener cu stocare persistentă pentru interogare istorică și analiză
