---
slug: /introduction/key-features
title: Caracteristici principale
sidebar_label: Caracteristici principale
sidebar_position: 3
---

# Caracteristici principale

Tabelul următor enumeră fiecare caracteristică majoră din QoreChain, organizată după faza de lansare în care a fost introdusă. Versiunea actuală a lanțului este **v3.1.82**, cu rețeaua principală (`qorechain-vladi`, EVM chain ID 9801) activă din 7 iunie 2026 și o rețea de test paralelă (`qorechain-diana`, EVM chain ID 9800).

| Caracteristică             | Introdusă în        | Descriere                                                                                                                                                                                                                                                                                                                                                                                        |
| -------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Semnături hibride PQC (necesare implicit) | v1.1.0 (Securitate) | Semnături duale pe fiecare tranzacție de pe calea cosmos: o semnătură clasică secp256k1 (ECDSA) asociată cu ML-DSA-87 (Dilithium-5). Începând cu v3.1.71, valoarea implicită a rețelei este **necesar** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`) — tranzacțiile cosmos exclusiv clasice sunt respinse; doar gentxs de geneză și tranzacțiile de înregistrare/migrare a cheilor PQC sunt exceptate. Tranzacțiile EVM folosesc o cale separată `eth_secp256k1` și nu sunt afectate. Trei moduri de aplicare controlate prin guvernanță (disabled / optional / required) rămân disponibile. Integrare fără probleme a portofelului prin înregistrarea automată a extensiei TX. |
| Hash implicit SHAKE-256    | v1.1.0 (Securitate) | Funcție cu ieșire extensibilă (XOF) din familia SHA-3. Începând cu v3.1.73, SHAKE-256 (prin pachetul `qorehash`) este **hash-ul implicit al aplicației**, completând baza PQC (Dilithium-5 + ML-KEM-1024 + SHAKE-256). Oferă hashing de lungime variabilă, ieșire fixă de 32 de octeți, concatenarea nodurilor interne Merkle și hashing cu separare de domeniu — totul în Go pur, fără dependență FFI. |
| Interfețe TEE și FL        | v1.1.0 (Securitate) | Specificații de interfață de nivel de producție pentru atestarea Trusted Execution Environment (SGX, TDX, SEV-SNP, ARM CCA) și coordonarea Federated Learning (metode de agregare FedAvg, FedProx, SCAFFOLD). Permite inferența AI în enclavă hardware și antrenarea distribuită a modelelor cu protecția confidențialității și garanții criptografice. |
| Consens RL pe lanț (PRISM) | v1.0.0 (Geneză)     | Un MLP cu virgulă fixă nativ Go (73.733 de parametri) rulează inferența PPO direct în ciclul de viață al blocului. Stratul de optimizare PRISM reglează dinamic timpul de bloc, limitele de gaz și ponderile pool-urilor de validatori fără oracole externe. Matematica deterministă a seriilor Taylor asigură rezultate identice pentru toți validatorii. Patru moduri de operare: shadow, conservative, autonomous și paused. Protecție prin întrerupător de circuit pentru siguranță. |
| Triple-Pool Composite PoS  | v1.0.0 (Geneză)     | Validatorii sunt clasificați în pool-uri RPoS (ponderate prin reputație), DPoS (ponderate prin delegare) și PoS (standard) la fiecare 1.000 de blocuri pe QoreChain Consensus Engine. Sortiția ponderată pe pool-uri diversifică producția de blocuri dincolo de dominanța pură a mizei. Curba de legare personalizată ia în considerare miza auto-legată, durata loialității, calitatea reputației și faza protocolului. |
| Guvernanță QDRW            | v1.0.0 (Geneză)     | Delegare cuadratică cu ponderarea reputației. Puterea de vot folosește o funcție de rădăcină pătrată atenuată de un multiplicator de reputație sigmoid, prevenind capturarea de către balene în timp ce recompensează participarea onestă pe termen lung. Un avantaj de miză de 100x produce aproximativ 10x putere de vot. Deținerile xQORE dublează ponderea de vot. |
| Motorul de ardere          | v1.0.0 (Geneză)     | Zece canale distincte de ardere: taxe de tranzacție, penalizări de guvernanță, slashing, taxe de punte, descurajarea spam-ului, excedent de epocă, arderi manuale, callback-uri de contract, taxe între VM-uri și arderi la crearea de rollup-uri. Taxele colectate sunt împărțite **37% către validatori, 30% arse permanent, 20% către trezorerie, 10% către staker-i și 3% către nodurile light**. |
| Staking xQORE              | v1.0.0 (Geneză)     | Blocați QOR pentru a emite xQORE la un raport 1:1 pentru pondere dublă de guvernanță în voturile QDRW. Penalizările de ieșire graduale (50% sub 30 de zile, 35% la 30-90 de zile, 15% la 90-180 de zile, 0% după 180 de zile) sunt redistribuite deținătorilor rămași prin rebase PvP — recompensând convingerea și penalizând capitalul pe termen scurt. |
| Emisii cu ofertă fixă      | v1.0.0 (Geneză)     | O ofertă totală fixă de 4.500.000.000 QOR (80.000.000 arși la TGE) cu un buget finit de recompense pentru staking de 590.000.000 QOR: Anul 1 la 8–12% APY (127.500.000 QOR), Anul 2 la 6–10% APY (106.250.000 QOR), Anii 3–4 la 5–8% APY (85.000.000 QOR pe an) și Anul 5+ determinat prin guvernanță (~186.000.000 QOR rămași). Combinat cu motorul de ardere, QOR converge spre un comportament net deflaționist pe măsură ce volumul tranzacțiilor crește. |
| Runtime EVM                | v1.0.0 (Geneză)     | Compatibilitate completă cu Ethereum cu prețuri de gaz EIP-1559, JSON-RPC pe portul 8545 (spațiile de nume `eth_`, `web3_`, `net_`, `txpool_`, `qor_`) și suport pentru instrumente standard (Hardhat, Foundry, Remix). Implementați și interacționați cu contracte Solidity folosind fluxurile de lucru Ethereum existente. |
| Runtime CosmWasm           | v1.0.0 (Geneză)     | Motor de contracte inteligente WebAssembly pentru contracte bazate pe Rust. Suport complet pentru ciclul de viață: instanțiere, execuție, interogare și migrare. Contractele rulează într-un mediu Wasm izolat cu execuție deterministă. |
| Runtime SVM                | v1.0.0 (Geneză)     | Implementare și execuție de programe BPF printr-un executor susținut de Rust. Serverul JSON-RPC compatibil Solana pe portul 8899 acceptă `getAccountInfo`, `getBalance`, `getSlot` și altele. Clienții și instrumentele Solana existente funcționează fără modificări. |
| Punte între VM-uri         | v1.0.0 (Geneză)     | Interoperabilitate fără probleme între toate cele trei VM-uri. Contractele EVM apelează CosmWasm prin precompilare; contractele CosmWasm apelează EVM prin mesaje personalizate; programele SVM participă prin punte bazată pe evenimente asincrone. Apeluri sincrone EVM-CosmWasm și mesagerie SVM asincronă într-un singur lanț. |
| Conectivitate între lanțuri | v1.2.0 (Interop)   | Opt canale IBC (Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon, Injective) plus **37 de configurații QCB care acoperă 36 de lanțuri externe** (inclusiv QoreChain însuși ca buclă internă nativă). Atestări de validator semnate PQC, adâncimi de confirmare per lanț și limite de volum prin întrerupător de circuit. În prezent în stare de rețea de test / în așteptare — încă neproducție. |
| Restaking BTC              | v1.2.0 (Interop)    | Integrare Babylon Protocol pentru garanții de finalitate Bitcoin. Validatorii înregistrează poziții de staking BTC (minimum 100.000 satoshi). Rădăcinile de stare ale epocilor QoreChain sunt verificate periodic pe Bitcoin prin epoci Babylon transmise prin IBC, oferind un strat secundar de finalitate susținut de hashrate-ul BTC. |
| Abstractizarea conturilor  | v1.2.0 (Interop)    | Conturi inteligente programabile la nivel de protocol (similar cu ERC-4337). Trei tipuri de cont: multisig, recuperare socială și bazat pe sesiune. Chei de sesiune cu permisiuni granulare și expirare, reguli de cheltuire zilnice per cont și per tranzacție, liste de permisiuni de denom restrânse și aplicarea automată a regulilor la consens. |
| Protecție MEV              | v1.2.0 (Interop)    | Cadru FairBlock de criptare bazată pe identitate de prag (tIBE) pentru mempool-uri criptate. Tranzacțiile sunt opace criptografic pentru proponenții de blocuri până după includere, eliminând front-running și atacurile sandwich. Decoratorul ante FairBlockDecorator este conectat și pregătit; decriptarea de prag tIBE se activează după implementarea ceremoniei de chei. |
| Abstractizarea gazului     | v1.2.0 (Interop)    | Plata gazului cu mai multe token-uri elimină cerința de a deține QOR nativ pentru taxele de tranzacție. Utilizatorii pot plăti în token-uri acceptate transferate prin IBC: ibc/USDC la un raport 1:1 și ibc/ATOM la un raport 10:1. Decoratorul GasAbstractionDecorator validează și convertește denom-urile de taxă non-native înainte de deducerea standard a taxei. |
| Prioritizare pe 5 benzi    | v1.2.0 (Interop)    | Spațiul de bloc este partiționat static în cinci benzi de prioritate: PQC (prioritate 100, 15% spațiu), MEV (90, 20%), AI (80, 15%), Default (50, 40%) și Free (10, 10%). Tranzacțiile critice pentru securitate nu pot fi niciodată înlăturate de traficul standard cu volum mare. |
| Lichiditate pe lanț (AMM)  | v1.2.0 (Interop)    | Formatorul automat de piață nativ (`x/amm`) oferă pool-uri de lichiditate pe lanț și schimburi la nivel de protocol. |
| Rollup-uri RDK             | v1.3.0 (Rollup-uri) | Rollup Development Kit cu patru paradigme de decontare (optimistic, zk, based, sovereign), cinci profiluri presetate (defi, gaming, nft, enterprise, custom), router DA nativ cu stocare de blob-uri SHA-256 și curățare automată, ciclu de viață al escrow-ului bancar cu rată de ardere la creare configurabilă, auto-finalizare prin EndBlocker și configurare asistată de PRISM prin modulul de consens. Capabilitățile de rollup sunt livrate ca un cadru de lanț gazdă. |
| Licențiere de lanț         | v1.3.0 (Rollup-uri) | Modulul `x/license` oferă licențiere de lanț nativă protocolului. |

## Istoricul versiunilor

<details>

<summary>v1.0.0 — Lansarea de geneză</summary>

A stabilit protocolul de bază cu criptografie post-cuantică (Dilithium-5, ML-KEM-1024), stratul de consens PRISM de învățare prin întărire pe lanț, runtime triplu-VM (EVM, CosmWasm, SVM) cu mesagerie între VM-uri, motorul de tokenomică cu ofertă fixă (ardere, xQORE, buget finit de emisie), selecția validatorilor Triple-Pool Composite PoS, guvernanță cuadratică QDRW și pipeline-ul de procesare a tranzacțiilor AI.

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
