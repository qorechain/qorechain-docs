---
slug: /introduction/key-features
title: Caracteristici principale
sidebar_label: Caracteristici principale
sidebar_position: 3
---

# Caracteristici principale

Tabelul următor enumeră fiecare caracteristică majoră din QoreChain, organizată după faza de lansare în care a fost introdusă. Mainnet-ul (`qorechain-vladi`, EVM chain ID 9801), activ din 7 iunie 2026, rulează **v3.2.4** (aplicată la înălțimea 3.742.566, pe 23 octombrie 2026); rețeaua de test paralelă (`qorechain-diana`, EVM chain ID 9800) rulează v3.2.4 din 19 octombrie 2026. Tabelul [Starea funcționalităților](#feature-status) de la finalul listei arată ce este activ astăzi pe rețelele live.

| Caracteristică             | Introdusă în        | Descriere                                                                                                                                                                                                                                                                                                                                                                                        |
| -------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Semnături hibride PQC (necesare implicit) | v1.1.0 (Securitate) | Semnături duale pe fiecare tranzacție de pe calea cosmos: o semnătură clasică secp256k1 (ECDSA) asociată cu ML-DSA-87 (Dilithium-5). Începând cu v3.1.71, valoarea implicită a rețelei este **necesar** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`) — tranzacțiile cosmos exclusiv clasice sunt respinse; doar gentxs de geneză și tranzacțiile de înregistrare/migrare a cheilor PQC sunt exceptate. Tranzacțiile EVM își păstrează semnătura `eth_secp256k1`, dar, începând cu v3.2.0, sunt admise doar de la un cont cu o cheie ML-DSA-87 înregistrată și cu o [fereastră de autorizare EVM](/getting-started/first-transaction#evm-window) deschisă. Trei moduri de aplicare controlate prin guvernanță (disabled / optional / required) rămân disponibile. |
| Hash implicit SHAKE-256    | v1.1.0 (Securitate) | Funcție cu ieșire extensibilă (XOF) din familia SHA-3. Începând cu v3.1.73, SHAKE-256 (prin pachetul `qorehash`) este **hash-ul implicit al aplicației**, completând baza PQC (Dilithium-5 + ML-KEM-1024 + SHAKE-256). Oferă hashing de lungime variabilă, ieșire fixă de 32 de octeți, concatenarea nodurilor interne Merkle și hashing cu separare de domeniu — totul în Go pur, fără dependență FFI. |
| Interfețe TEE și FL        | v1.1.0 (Securitate) | Specificații de interfață (încă fără implementare) pentru atestarea Trusted Execution Environment (SGX, TDX, SEV-SNP, ARM CCA) și coordonarea Federated Learning (metode de agregare FedAvg, FedProx, SCAFFOLD); ambele sunt planificate pentru o versiune viitoare. |
| Consens RL pe lanț (PRISM) | v1.0.0 (Geneză)     | Un MLP cu virgulă fixă nativ Go (73.733 de parametri) este integrat în ciclul de viață al blocului pentru inferența PPO. PRISM este conceput să regleze timpul de bloc, prețul gazului și ponderile pool-urilor; pe rețelele live, în prezent doar observă (nu este încărcată nicio politică antrenată, iar mesajele de control sunt dezactivate). Matematica deterministă a seriilor Taylor este concepută să dea rezultate identice pentru toți validatorii. Patru moduri de operare (shadow, conservative, autonomous, paused); ambele rețele sunt setate pe conservative. Protecție prin întrerupător de circuit pentru siguranță. |
| Triple-Pool Composite PoS  | v1.0.0 (Geneză)     | Proiectat: validatorii sunt clasificați în pool-uri RPoS (ponderate prin reputație), DPoS (ponderate prin delegare) și PoS (standard) la fiecare 1.000 de blocuri. Sortiția ponderată pe pool-uri ar diversifica producția de blocuri dincolo de dominanța pură a mizei, iar o curbă de legare personalizată ar lua în considerare miza auto-legată, durata loialității, calitatea reputației și faza protocolului. Implementat în `x/qca`, dar **încă neactiv în producția de blocuri, recompense sau slashing**; propunerea de blocuri și slashing-ul urmează în prezent regulile standard ponderate pe miză. |
| Guvernanță QDRW            | v1.0.0 (Geneză)     | Delegare cuadratică cu ponderarea reputației. Proiectată astfel încât puterea de vot să folosească o funcție de rădăcină pătrată atenuată de un multiplicator de reputație sigmoid, prevenind capturarea de către balene în timp ce recompensează participarea onestă pe termen lung (un avantaj de miză de 100x produce aproximativ 10x putere de vot; deținerile xQORE dublează ponderea de vot). Implementată, dar **dezactivată pe rețelele live** (`qdrw` este oprit); propunerile sunt în prezent numărate pe baza mizei delegate (bonded). |
| Motorul de ardere          | v1.0.0 (Geneză)     | Douăsprezece surse de ardere (taxe de gaz, crearea de contracte, taxe pentru serviciile AI, taxe de punte, răscumpărare de către trezorerie, tranzacții eșuate, penalizări xQORE, răscumpărare automată, arderea TGE, crearea de rollup-uri, borne de număr de tranzacții și AMM); pe mainnet, până acum au fost înregistrate arderi doar pe canalele taxelor de gaz și ale tranzacțiilor eșuate. Tot ce se află în colectorul de taxe, inclusiv emisia de epocă, este împărțit **37% către validatori, 30% ars permanent, 20% către trezorerie, 10% către staker-i și 3% către nodurile light**. |
| Staking xQORE              | v1.0.0 (Geneză)     | Încă neactiv: tranzacțiile de blocare și deblocare ale modulului nu sunt conectate pe rețelele live (vezi [Staking xQORE](/user-guide/xqore-staking)). Comportament proiectat: blocați QOR pentru a emite xQORE la un raport 1:1 pentru pondere dublă de guvernanță în voturile QDRW. Penalizările de ieșire graduale (50% sub 30 de zile, 35% la 30-90 de zile, 15% la 90-180 de zile, 0% după 180 de zile) sunt redistribuite deținătorilor rămași prin rebase PvP — recompensând convingerea și penalizând capitalul pe termen scurt. |
| Emisii plafonate           | v1.0.0 (Geneză)     | O cale de ofertă finită: 4.420.000.000 QOR la geneză (80.000.000 QOR din cei 4.500.000.000 planificați au fost arși la TGE) plus emisia de staking bătută de `x/inflation` sub un plafon cumulativ strict de 590.000.000 QOR (86.000 QOR per epocă de 43.200 de blocuri în modul `fixed`, începând cu propunerea de guvernanță 10 din octombrie 2026). Arderile elimină permanent tokenuri. Vezi [Tokenomics](/architecture/tokenomics#supply-and-emission). |
| Runtime EVM                | v1.0.0 (Geneză)     | Compatibilitate completă cu Ethereum cu prețuri de gaz EIP-1559, JSON-RPC pe portul 8545 (spațiile de nume `eth_`, `web3_`, `net_` și `txpool_`; spațiul de nume `qor_` nu este încă servit) și suport pentru instrumente standard (Hardhat, Foundry, Remix). Implementați și interacționați cu contracte Solidity folosind fluxurile de lucru Ethereum existente; începând cu v3.2.0, expeditorul are nevoie de o cheie post-cuantică înregistrată și de o [fereastră de autorizare EVM](/getting-started/first-transaction#evm-window) deschisă. |
| Runtime QoreChain Native           | v1.0.0 (Geneză)     | Denumirea QoreChain pentru runtime-ul său CosmWasm: un motor de contracte inteligente WebAssembly pentru contracte bazate pe Rust. Suport complet pentru ciclul de viață: instanțiere, execuție, interogare și migrare. Contractele rulează într-un mediu Wasm izolat cu execuție deterministă. Încărcarea codului și instanțierea sunt în prezent **dezactivate** pe ambele rețele (setare de guvernanță plus întrerupător de circuit). |
| Runtime SVM                | v1.0.0 (Geneză)     | Implementare și execuție de programe BPF printr-un executor susținut de Rust. Serverul JSON-RPC compatibil Solana pe portul 8899 acceptă `getAccountInfo`, `getBalance`, `getSlot` și altele. Metodele de citire funcționează pe punctele finale publice; lane-ul de tranzacții SVM este în prezent **dezactivat** la nivelul întregii rețele. |
| Punte între VM-uri         | v1.0.0 (Geneză)     | Interoperabilitate fără probleme între toate cele trei VM-uri. Contractele EVM apelează QoreChain Native prin precompilare (încă neactivă, vezi [Starea rețelei](/developer-guide/evm-precompiles#network-status)); contractele QoreChain Native apelează EVM prin mesaje personalizate; programele SVM participă prin punte bazată pe evenimente asincrone. Apeluri sincrone EVM-QoreChain Native și mesagerie SVM asincronă într-un singur lanț. Mesajul de apel între VM-uri este în prezent oprit pe mainnet. |
| Conectivitate între lanțuri | v1.2.0 (Interop)   | Proiectată pentru până la opt contrapărți IBC (Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon, Injective) plus **37 de configurații de lanț QCB (36 de lanțuri externe plus Injective prin IBC)**. Atestări de validator semnate PQC, adâncimi de confirmare per lanț și limite de volum prin întrerupător de circuit. Începând cu octombrie 2026, toate cele 37 de configurații de lanț sunt în starea `pending`, iar niciun canal IBC nu este deschis pe vreuna dintre rețele — **nu este live**. |
| Restaking BTC              | v1.2.0 (Interop)    | Etapă de proiectare — tranzacțiile modulului nu sunt activate pe rețelele live. Integrare Babylon Protocol pentru garanții de finalitate Bitcoin. Validatorii ar înregistra poziții de staking BTC (minimum 100.000 satoshi). Rădăcinile de stare ale epocilor QoreChain sunt verificate periodic pe Bitcoin prin epoci Babylon transmise prin IBC, oferind un strat secundar de finalitate susținut de hashrate-ul BTC. |
| Abstractizarea conturilor  | v1.2.0 (Interop)    | Conturi inteligente programabile la nivel de protocol (similar cu ERC-4337). Trei tipuri de cont: multisig, recuperare socială și bazat pe sesiune. Chei de sesiune cu permisiuni granulare și expirare, reguli de cheltuire zilnice per cont și per tranzacție și liste de permisiuni de denom restrânse. Implementată, dar în prezent **oprită** pe ambele rețele (`abstractaccount.enabled = false`; verifică `GET /qorechain/abstractaccount/v1/config`). |
| Protecție MEV              | v1.2.0 (Interop)    | Cadru FairBlock de criptare bazată pe identitate de prag (tIBE) pentru mempool-uri criptate, conceput să mențină tranzacțiile opace pentru proponenții de blocuri până după includere. Decoratorul ante FairBlockDecorator este conectat; decriptarea de prag tIBE se activează după implementarea ceremoniei de chei. În prezent **dezactivată** pe ambele rețele (`enabled = false`). |
| Abstractizarea gazului     | v1.2.0 (Interop)    | Concepută pentru a le permite utilizatorilor să plătească taxele într-un token non-nativ acceptat; configurația listează `ibc/USDC` la un raport 1:1 și `ibc/ATOM` la 10:1. Încă nu este deschis niciun canal IBC, deci pe rețele nu există un astfel de token, iar taxele se plătesc în prezent în QOR. |
| Prioritizare pe 5 benzi    | v1.2.0 (Interop)    | Definițiile benzilor (PQC, MEV, AI, Default, Free) există ca configurație, dar benzile de spațiu de bloc nu sunt aplicate de mempool-ul live sau de handler-ul de propuneri. |
| Lichiditate pe lanț (AMM)  | v1.2.0 (Interop)    | Formatorul automat de piață nativ (`x/amm`) oferă pool-uri de lichiditate pe lanț și schimburi la nivel de protocol. Modulul este live; încă nu a fost creat niciun pool. |
| Rollup-uri RDK             | v1.3.0 (Rollup-uri) | Rollup Development Kit cu patru paradigme de decontare (optimistic, zk, based, sovereign), cinci profiluri presetate (defi, gaming, nft, enterprise, custom), router DA nativ cu stocare de blob-uri SHAKE-256 și curățare automată, ciclu de viață al escrow-ului bancar cu rată de ardere la creare configurabilă, auto-finalizare prin EndBlocker și configurare asistată de PRISM prin modulul de consens. Capabilitățile de rollup sunt livrate ca un cadru de lanț gazdă; niciun rollup nu a fost creat încă pe rețelele live. |
| Licențiere de lanț         | v1.3.0 (Rollup-uri) | Modulul `x/license` oferă licențiere de lanț nativă protocolului. |

## Starea funcționalităților (octombrie 2026) {#feature-status}

Verificat pe rețelele live la 20 octombrie 2026. „Live” înseamnă că funcționalitatea este activă pe mainnet (și, cu excepția cazului în care un rând spune altfel, pe testnet); descrierile de mai sus spun ce este conceput să facă fiecare funcționalitate.

| Capabilitate | Starea pe rețelele live |
| --- | --- |
| Semnături hibride ML-DSA-87 + secp256k1 (lane-ul Cosmos) | **Live**, obligatorii (`hybrid_signature_mode = required`) |
| Fereastra de autorizare EVM | **Live** începând cu v3.2.0 (restrângere opțională a domeniului începând cu v3.2.3) |
| Staking cu blocare în timp (`x/stakingtier`, opțional) | **Live** începând cu v3.2.4 (testnet din 19 octombrie 2026, mainnet din 23 octombrie 2026) |
| Runtime-urile EVM, QoreChain Native, SVM | EVM **live**; încărcarea codului și instanțierea QoreChain Native **dezactivate** (setare de guvernanță plus întrerupător de circuit); lane-ul de tranzacții SVM **dezactivat** (citirile funcționează) |
| Motorul de ardere și împărțirea taxelor (37/30/20/10/3) | **Live**; doar canalele de ardere a taxelor de gaz și a tranzacțiilor eșuate au arderi înregistrate pe mainnet |
| Emisii plafonate (`x/inflation`) | **Live**, fix 86.000 QOR per epocă, până la un plafon de 590.000.000 QOR (mainnet) |
| Staking, slashing, guvernanță | **Live** (module standard; vezi [Parametrii lanțului](/appendix/chain-parameters)) |
| Recompensele nodurilor light | Contabilizarea recompenselor **live**; înregistrarea **deschisă** și condiționată de licență, niciun nod light înregistrat încă (vezi [starea](/light-node/overview#reward-program-status)) |
| AMM (`x/amm`) | Modul **live**, încă fără pool-uri create |
| PRISM (`x/rlconsensus`) | **Doar observare** — nicio politică încărcată |
| Triple-Pool CPoS / QDRW (`x/qca`) | Implementate, **neconectate** la producția de blocuri, recompense sau numărarea voturilor |
| xQORE (`x/xqore`) | Doar contabilitate — **încă fără tranzacții de blocare/deblocare** |
| Conturi inteligente / portofele conectate (`x/abstractaccount`) | Implementate, **oprite** (`enabled = false`) |
| Rollup Development Kit (`x/rdk`), multistrat | Module **live**, încă fără rollup-uri sau straturi create |
| Bridge cross-chain, IBC, restaking Babylon | **În așteptare** — toate cele 37 de configurații de lanț sunt `pending`, niciun canal IBC deschis, nicio tranzacție de restaking |
| Protecție MEV FairBlock | **Dezactivată** (`enabled = false`) |
| Precompilările EVM, spațiul de nume JSON-RPC `qor_` | **Neactive / neservite** (lista precompilărilor active este goală) |

## Istoricul versiunilor

<details>

<summary>v1.0.0 — Lansarea de geneză</summary>

A stabilit protocolul de bază cu criptografie post-cuantică (Dilithium-5, ML-KEM-1024), stratul de consens PRISM de învățare prin întărire pe lanț, runtime triplu-VM (EVM, QoreChain Native, SVM) cu mesagerie între VM-uri, motorul de tokenomică (ardere, xQORE, modulul de emisie), selecția validatorilor Triple-Pool Composite PoS, guvernanță cuadratică QDRW și pipeline-ul de procesare a tranzacțiilor AI.

</details>

<details>

<summary>v1.1.0 — Lansarea de consolidare a securității</summary>

A introdus arhitectura de semnătură hibridă care asociază o semnătură clasică secp256k1 (ECDSA) cu ML-DSA-87, cu trei moduri de aplicare controlate prin guvernanță, fundația de hash post-cuantic SHAKE-256 pentru viitoarea înlocuire a arborelui Merkle și specificații de interfață de nivel de producție pentru atestarea TEE (SGX, TDX, SEV-SNP, ARM CCA) și coordonarea învățării federate (FedAvg, FedProx, SCAFFOLD).

</details>

<details>

<summary>v1.2.0 — Lansarea de interoperabilitate și UX</summary>

A adăugat conectivitate între lanțuri (8 canale IBC + 37 de configurații QCB care acoperă 36 de lanțuri externe, în prezent în rețea de test/în așteptare), restaking BTC prin Babylon Protocol, abstractizarea conturilor inteligente cu chei de sesiune și recuperare socială, cadrul de protecție MEV FairBlock, abstractizarea gazului cu mai multe token-uri, lichiditate pe lanț (`x/amm`) și prioritizarea spațiului de bloc pe 5 benzi.

</details>

<details>

<summary>v1.3.0 — Lansarea ecosistemului de rollup-uri</summary>

A livrat Rollup Development Kit cu patru paradigme de decontare (optimistic, zk, based, sovereign), cinci profiluri de implementare presetate (defi, gaming, nft, enterprise, custom), un router DA nativ, gestionarea ciclului de viață al escrow-ului bancar, auto-finalizare condusă de EndBlocker, configurare de rollup asistată de PRISM și licențiere de lanț (`x/license`). Integrare profundă cu modulul de arhitectură multistrat pentru înregistrarea automată a sidechain-urilor și ancorarea stării.

</details>

## Conexe

* [Ce este QoreChain](/introduction/what-is-qorechain) — prezentarea generală a platformei în context.
* [Tokenomică](/architecture/tokenomics) — modelul economic din spatele QOR.
* [Arhitectura punții](/architecture/bridge-architecture) — conectivitatea între lanțuri și restaking-ul BTC.
* [Prezentare generală a rollup-urilor](/rollups/overview) — Rollup Development Kit și paradigmele de decontare.
