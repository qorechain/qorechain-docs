---
slug: /appendix/version-history
title: Istoricul versiunilor
sidebar_label: Istoricul versiunilor
sidebar_position: 3
---

# Istoricul versiunilor

Istoricul public al versiunilor QoreChain. Cea mai recentă versiune este **v3.1.82**, care rulează pe mainnet-ul **`qorechain-vladi`** (chain ID EVM **9801**, activ din 7 iunie 2026). Testnet-ul **`qorechain-diana`** (chain ID EVM **9800**) urmărește build-urile pre-lansare.

:::note
Intrările de mai jos sunt rezumate de nivel înalt ale capabilităților. Intrările mai vechi `v1.x` sunt păstrate ca înregistrare istorică a liniei de versiuni de testnet care a precedat mainnet-ul.
:::

---

## v3.1.82 — QOR nativ pe SVM activ + facilitare pentru integratori (versiunea curentă de mainnet)

**Focusul versiunii:** Unificarea QOR-ului nativ pe SVM rulând pe ambele rețele, plus tot ce are nevoie un exchange sau un integrator pentru a se conecta.

* **Sold nativ QOR unificat, activ pe toate cele trei interfețe** — Unificarea SVM (v3.1.81) este confirmată ca fiind activă pe mainnet și testnet: același cont deține un singur sold, vizibil ca `uqor` (6 zecimale) pe Cosmos, în stil wei cu 18 zecimale pe EVM și în lamports (9 zecimale; 1 uqor = 1,000 lamports) pe interfața compatibilă cu Solana.
* **Endpoint-uri publice verificate** — Endpoint-uri HTTPS publice pentru RPC de consens, REST, JSON-RPC EVM și JSON-RPC SVM pe ambele rețele, plus [exploratorul de blocuri](https://explore.qore.network) public. Vezi [Rețele](/appendix/networks).
* **Descărcări** — Pachete versionate cu binarele nodului, genesis-ul de mainnet și snapshot-uri recente ale datelor lanțului (cu sume de control SHA-256), publicate la [download.qore.host](https://download.qore.host).
* **Semnare post-cuantică deterministă pe întreaga stivă client** — `@qorechain/pqc` 0.1.1 semnează ML-DSA-87 determinist (FIPS-204 §3.4) în toate cele șase binding-uri de limbaj, în concordanță cu ceea ce acceptă lanțul; `@qorechain/wallet-adapter` 0.1.2 se bazează pe acesta pentru semnarea tranzacțiilor hibride.
* **Ghid pentru integratori** — Noul [Ghid pentru exchange-uri și integratori](/developer-guide/exchange-integration) acoperă depunerile, retragerile și operarea nodurilor pe cele trei interfețe.

## v3.1.81 — Unificarea QOR-ului nativ pe SVM

**Focusul versiunii:** QOR nativ ca activ de primă clasă pe interfața compatibilă cu Solana.

* **QOR nativ pe SVM** — Runtime-ul SVM expune acum direct soldul nativ de QOR al contului (în lamports), în loc să urmărească un sold separat, exclusiv SVM. `getBalance` și `getSignaturesForAddress` funcționează pe fondurile native, iar transferurile prin System Program mută QOR nativ.
* **Maparea adreselor SVM** — Adresa SVM a unui cont este derivată din cei 20 de octeți ai contului (completați la dreapta până la 32 de octeți, codificați în base58), astfel încât adresele Cosmos, EVM și SVM ale unei chei se referă la aceleași fonduri.

## v3.1.80 — Interogări multistrat pentru ancore de stare

**Focusul versiunii:** Ancore de decontare lizibile și verificabile offline pentru rollup-uri.

* **Interogări de citire a ancorelor** — Serviciul de interogare `x/multilayer` expune acum `Anchor` (cea mai recentă ancoră de stare pentru un strat) și `Anchors` (istoricul ancorelor unui strat), astfel încât clienții pot obține ancora de decontare a unui strat și o pot verifica independent.
* **Gateway REST pentru multilayer** — Fiecare interogare multilayer (`params`, `layers`, `layers/{layer_id}`, `anchor/{layer_id}`, `anchors/{layer_id}`, `routing-stats`) este acum disponibilă prin REST, în plus față de gRPC.
* **Chitanțe de decontare rezistente cuantic, deblocate** — Fiecare ancoră poartă o semnătură **ML-DSA-87 (Dilithium-5)** peste câmpurile sale canonice, oferind baza on-chain pentru verificarea offline a chitanțelor de decontare din Rollup Development Kit.

## v3.1.79 — Auto-provizionarea validatorilor pentru rețelele de bridge

**Focusul versiunii:** Participare la cheie pe rețelele conectate pentru validatorii licențiați.

* **Framework de drivere de rețea** — Un framework declarativ de drivere permite ca un validator QoreChain care deține licența relevantă `validator_<chain>` (sau `qcb_bridge`) să aibă clientul rețelei externe corespunzătoare provizionat, configurat și rulat pe același nod, sub orchestrarea QoreChain — doar după activarea licenței.
* **Drivere pentru toate cele 37 de rețele de bridge** — Acoperirea cuprinde fiecare rețea conectată, clasificată după modelul de participare (validator fără permisiuni, plafonat/ales/cu admitere, full-node L2 și roluri fără staking/pe listă de încredere). Cheile de stake și de semnare pentru rețelele externe rămân furnizate de operator pentru fiecare rețea; QoreChain livrează framework-ul și gate-ul de licență impus.

## v3.1.78 — Pregătire pre-lansare

**Focusul versiunii:** Portofelele, bridge-urile, IBC și licențierea funcționează toate la lansare — fără guvernanță post-lansare.

* **Activare trustless a bridge-urilor post-lansare** — O cheie `bridge_admin` (sau un deținător de licență `qcb_bridge`) poate activa bridge-ul oricărui lanț conectat cu o singură tranzacție semnată (`tx bridge update-chain-config` / `set-verifier-bootstrap`) — setând adresa contractului, confirmările, arhitectura, statusul, verificatorul activ și rădăcina de încredere a verificatorului — fără propunere de guvernanță sau upgrade de lanț.
* **Gate de licență pentru rețelele de validatori** — Orchestratorul impune acum licența `validator_<chain>` / `qcb_bridge` (fail-closed) înainte de a porni orice client de rețea externă.
* **Pachete de integrare pentru portofele** — `@qorechain/wallet-adapter` și `@qorechain/connect` publicate pe npm (v0.1.0), adăugând înregistrarea rețelei în MetaMask cu un singur apel (EIP-3085, QOR nativ cu **18 zecimale** pe calea EVM) și configurarea prețului gazului pentru Keplr.
* **Relayer IBC la cheie** — Configurație de relayer gata de rulat și instrumente de bootstrap pentru canale, pentru cele opt contrapărți IBC, astfel încât canalele să fie funcționale post-lansare fără configurare personalizată.

## v3.1.77 — Endpoint-uri REST pentru bridge și burn

**Focusul versiunii:** Acces REST doar în citire pentru modulele cross-chain și de ofertă.

* **Endpoint-uri REST pentru bridge** — Endpoint-uri HTTP de interogare, doar în citire, pentru modulul de bridge, expunând starea bridge-ului prin REST standard, în plus față de gRPC.
* **Endpoint-uri REST pentru burn** — Endpoint-uri HTTP de interogare, doar în citire, pentru modulul de burn, făcând datele despre distribuția taxelor și ofertă interogabile prin REST standard.

## v3.1.76 — Modernizarea toolchain-ului SVM

**Focusul versiunii:** Actualizarea compatibilității cu Solana Virtual Machine.

* **Suport pentru programe construite cu toolchain-ul curent** — Execuția SVM a fost modernizată astfel încât programele construite cu toolchain-ul Solana curent rulează pe runtime-ul SVM al QoreChain.

## v3.1.75 — JSON-RPC SVM activat implicit

**Focusul versiunii:** RPC compatibil cu Solana, disponibil din start.

* **JSON-RPC compatibil cu Solana** — Serverul JSON-RPC SVM este acum activat implicit (portul **8899**) și pornit automat odată cu nodul, oferind o interfață RPC compatibilă cu Solana pentru instrumentele SVM.

## v3.1.74 — Presetări de profil pentru rollup-uri

**Focusul versiunii:** Utilizabilitatea și decontarea în Rollup Development Kit.

* **Aplicarea presetărilor de profil** — Crearea rollup-urilor aplică acum presetarea profilului selectat (DeFi, gaming, NFT, enterprise sau complet personalizat), astfel încât rollup-urile noi moștenesc valori implicite potrivite pentru cazul lor de utilizare.
* **Decontare optimistă** — Calea de decontare optimistă (trimitere de batch-uri și contestare) este operațională de la un capăt la altul.

## v3.1.73 — Baza de hash post-cuantică

**Focusul versiunii:** Finalizarea bazei criptografice post-cuantice implicite.

* **SHAKE-256 ca hash implicit** — SHAKE-256 (familia SHA-3) este adoptat ca hash implicit al aplicației, completând baza post-cuantică implicită formată din semnături **ML-DSA-87 (Dilithium-5)**, încapsulare de chei **ML-KEM-1024** și hashing **SHAKE-256**.

## v3.1.72 — Stabilitate și mentenanță

**Focusul versiunii:** Mentenanță de rutină pentru stabilitate și pipeline-ul de build.

* **Îmbunătățiri de stabilitate** — Mentenanță internă de stabilitate, dependențe și pipeline de build, fără modificări de comportament vizibile extern.

## v3.1.71 — Semnături hibride PQC impuse implicit

**Focusul versiunii:** Securitate post-cuantică activată implicit pe calea tranzacțiilor Cosmos.

* **Semnături hibride obligatorii implicit** — Semnăturile hibride post-cuantice sunt acum impuse implicit pe calea tranzacțiilor Cosmos: fiecare tranzacție poartă o semnătură post-cuantică **ML-DSA-87 (Dilithium-5)** alături de semnătura clasică **secp256k1**.
* **Impunere controlată prin guvernanță** — Modul de impunere rămâne controlat prin guvernanță, cu valoarea implicită setată pe **obligatoriu**.

## v3.1.70 — Consolidare pentru producție

**Focusul versiunii:** Consolidare pentru producție și optimizarea consensului pentru mainnet-ul live.

* **Optimizarea consensului PRISM** — Îmbunătățiri continue ale stratului de optimizare prin învățare cu întărire PRISM pentru ajustarea adaptivă a parametrilor în condiții de rețea live, cu controale de siguranță de tip circuit-breaker.
* **Performanță și stabilitate** — Rafinări de throughput, latență și utilizare a resurselor la nivelul validatorilor și al nodurilor complete.
* **Instrumente operaționale** — Ergonomie îmbunătățită pentru monitorizare, interogare și operarea nodurilor pentru operatorii de mainnet.
* **Aliniere la Tokenomics v2.1** — Distribuția taxelor și mecanica de emisiune aliniate cu modelul economic cu ofertă fixă și emisiune finită.

## v3.0.0 — Genesis-ul mainnet-ului

**Focusul versiunii:** Lansarea mainnet-ului și evenimentul de generare a tokenului.

* **Genesis-ul mainnet-ului** — Mainnet-ul QoreChain (`qorechain-vladi`, chain ID EVM 9801) a fost lansat pe **7 iunie 2026**, cu evenimentul de generare a tokenului (TGE) la genesis.
* **Împărțirea taxelor în cinci** — Distribuția taxelor de protocol între validatori, burn, trezorerie, stakeri și noduri light (**37 / 30 / 20 / 10 / 3**), adăugând o cotă dedicată nodurilor light.
* **AMM on-chain** — Modul nativ de automated market maker (`x/amm`) pentru pool-uri de lichiditate și swap-uri on-chain.
* **Licențiere pe lanț** — Modul de licențe on-chain (`x/license`) pentru înregistrarea și gestionarea drepturilor de protocol.
* **Paradigme de decontare consolidate** — Modurile de decontare RDK finalizate ca optimistic, zk, based și sovereign.

## v1.4.0 — Expansiune pre-mainnet

**Focusul versiunii:** Acoperire cross-chain și stabilizarea candidatului de lansare înainte de mainnet.

* **Acoperire cross-chain extinsă** — Conectivitate IBC și de bridge suplimentară către un set mai larg de rețele externe.
* **Participarea nodurilor light** — Au fost introduse nodurile light și fundația pentru recompensele lor din cota de taxe.
* **Consolidarea candidatului de lansare** — Testare extinsă, audituri și stabilizare pentru toate modulele de bază, în pregătirea genesis-ului mainnet-ului.

## v1.3.0 — Rollup Development Kit

**Focusul versiunii:** Infrastructură nativă de rollup pentru implementări de rollup-uri suverane și cu securitate partajată.

* **Modulul x/rdk** — Rollup Development Kit complet, cu patru paradigme de decontare: optimistic, zk, based și sovereign
* **5 profiluri presetate** — Șabloane de rollup preconfigurate pentru cazuri de utilizare DeFi, gaming, NFT, enterprise și complet personalizate
* **Disponibilitate nativă a datelor** — Strat DA on-chain cu stocare de blob-uri, gestionarea retenției și ciclu de viață de pruning
* **Auto-finalizare în EndBlocker** — Finalizare automată a batch-urilor la expirarea ferestrei de contestare, fără a fi necesară intervenția operatorului
* **Selectare de profil asistată de AI** — Interogare `suggest-profile` care recomandă o configurație optimă de rollup pe baza cazului de utilizare vizat
* **Integrare multistrat** — Rollup-urile se înregistrează ca straturi în arhitectura multistrat, moștenind mecanicile de rutare, ancorare și contestare
* **Ciclu de viață de escrow bancar** — Stake-ul operatorului este ținut în escrow pe durata operării rollup-ului și eliberat la o închidere curată sau confiscat la slashing

## v1.2.0 — IBC și bridge-uri

**Focusul versiunii:** Conectivitate cross-chain și abstracții avansate de cont.

* **25 de conexiuni cross-chain** — 8 canale IBC și 17 conexiuni QoreChain Bridge (QCB) către rețele externe
* **Modulul x/babylon** — Integrare de restaking BTC care permite deținătorilor de Bitcoin să participe la securitatea de staking a QoreChain
* **Modulul x/abstractaccount** — Framework de conturi inteligente cu reguli de cheltuire programabile, chei de sesiune și logică de autentificare personalizată
* **Modulul x/fairblock** — Threshold Identity-Based Encryption (tIBE) pentru criptarea tranzacțiilor rezistentă la MEV
* **Modulul x/gasabstraction** — Plata gazului cu mai multe tokenuri, cu suport pentru QOR nativ, USDC adus prin IBC și ATOM adus prin IBC
* **Prioritizarea TX pe 5 benzi** — Benzi de tranzacții ordonate după prioritate: sistem, guvernanță, staking, bridge și generală
* **Configurații de relayer IBC** — Setări de relayer preconfigurate pentru toate canalele IBC suportate
* **Integrare bridge-to-burn** — Taxele de bridge sunt direcționate prin distribuția de taxe a modulului de burn

## v1.1.0 — Semnături hibride PQC

**Focusul versiunii:** Securitate criptografică post-cuantică și agilitate algoritmică.

* **Semnături duale secp256k1 (ECDSA) + ML-DSA-87** — Fiecare tranzacție poartă atât o semnătură clasică, cât și una post-cuantică, verificate în lanțul AnteHandler
* **3 moduri de impunere** — Impunere configurabilă a semnăturilor hibride: dezactivat (modul 0), permisiv (modul 1, PQC opțional), obligatoriu (modul 2, PQC necesar)
* **Auto-înregistrare** — Cheile publice PQC sunt înregistrate automat la prima tranzacție hibridă, eliminând un pas separat de înregistrare
* **Fundație de hash SHAKE-256** — Toate operațiunile de hashing legate de PQC folosesc SHAKE-256 (familia SHA-3) pentru derivarea de adrese rezistentă cuantic
* **Interfețe de atestare TEE** — Suport de atestare Trusted Execution Environment pentru dovedirea integrității generării cheilor PQC
* **Framework de agilitate algoritmică** — Registru de algoritmi extensibil care permite adăugarea viitorilor algoritmi PQC prin guvernanță, fără upgrade de lanț

## v1.0.0 — Genesis (motorul de tokenomics)

**Focusul versiunii:** Lansarea inițială a protocolului cu tokenomics complet, execuție multi-VM și operațiuni asistate de AI.

* **Modulul x/burn** — Mecanism de ardere a taxelor pe mai multe canale, cu o distribuție în patru părți între validatori, burn, trezorerie și stakeri
* **Modulul x/xqore** — Derivat de staking pentru guvernanță, cu penalități de deblocare anticipată pe niveluri și redistribuire prin rebase de tip PvP
* **Modulul x/inflation** — Emisiune bazată pe epoci, cu descreștere anuală, guvernată de modelul economic cu emisiune finită
* **Stratul de consens PRISM** — Optimizare prin învățare cu întărire (PPO) pentru ajustarea dinamică a parametrilor lanțului, cu controale de siguranță de tip circuit-breaker
* **CPoS cu trei pool-uri** — Classified Proof-of-Stake cu pool-urile de validatori Emerald, Sapphire și Ruby, ponderate după scoruri de reputație
* **Guvernanța QDRW** — Sistem de Dynamic Reward Weighting care permite ajustări aprobate prin guvernanță ale distribuției recompenselor între pool-uri
* **Runtime-uri EVM + CosmWasm + SVM** — Trei medii de execuție concurente: QoreChain EVM Engine, contracte inteligente CosmWasm și Solana Virtual Machine
* **Bridge cross-VM** — Transmitere de mesaje și transferuri de active între runtime-urile EVM, CosmWasm și SVM în cadrul aceluiași bloc
* **Criptografie post-cuantică** — Semnare rezistentă cuantic, susținută de o bibliotecă PQC de înaltă performanță
* **QCAI** — Analiză euristică on-chain cu un sidecar off-chain opțional pentru detectarea fraudelor, estimarea taxelor și optimizarea rețelei
* **Implementare containerizată** — Implementare completă de testnet cu mai mulți validatori, cu serviciu sidecar și indexer de blocuri
* **Indexer de blocuri** — Listener de blocuri cu stocare persistentă pentru interogări istorice și analize
