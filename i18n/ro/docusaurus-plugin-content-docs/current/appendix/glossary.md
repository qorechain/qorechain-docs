---
slug: /appendix/glossary
title: Glosar
sidebar_label: Glosar
sidebar_position: 1
---

# Glosar

Referință alfabetică a termenilor, abrevierilor și acronimelor folosite în întreaga documentație QoreChain.

---

**AMM** — Automated Market Maker (formator de piață automat). Modulul nativ on-chain de lichiditate al QoreChain (`x/amm`) care oferă pool-uri cu produs constant, swap-uri și furnizare de lichiditate direct la nivel de protocol, fără o implementare externă de smart-contract. Vezi [AMM](/architecture/amm).

**Authorisation window (EVM) (fereastră de autorizare EVM)** — O permisiune delimitată (blocuri, număr de tranzacții, valoare totală), deschisă cu un mesaj de pe lane-ul Cosmos semnat post-cuantic, în interiorul căreia trebuie să se încadreze o tranzacție de pe lane-ul EVM începând cu v3.2.0. Începând cu v3.2.3, o fereastră poate fi restrânsă doar la transferuri native sau la o listă de destinatari. Vezi [Fereastra de autorizare EVM](/getting-started/first-transaction#evm-window).

**BPF** — Berkeley Packet Filter. Formatul de bytecode folosit de runtime-ul SVM pentru a executa programe on-chain. Programele sunt compilate în BPF înainte de implementare.

**Chain License** — O înregistrare de licență on-chain gestionată de modulul `x/license`. Licențele de lanț controlează accesul la capabilități specifice de protocol și le permit operatorilor să înregistreze, să verifice și să gestioneze drepturile de licențiere on-chain. Vezi [Licențiere de lanț](/architecture/chain-licensing).

**Circuit breaker (întrerupător de circuit)** — Mecanismul Cosmos SDK care dezactivează la nivelul întregii rețele tipuri individuale de mesaje; lista curentă poate fi interogată la `/cosmos/circuit/v1/disable_list`. Vezi [Parametrii lanțului](/appendix/chain-parameters#circuit-breaker).

**CLFB** — Cross-Layer Fee Bundling (gruparea comisioanelor între straturi). O singură plată de comision pe stratul sursă care acoperă execuția pe straturile dintr-o cale între straturi (parametrul `cross_layer_fee_bundling` al `x/multilayer`). Vezi [Arhitectura multistrat](/architecture/multilayer-architecture).

**CPI** — Cross-Program Invocation (invocare între programe). Un mecanism din runtime-ul SVM care permite unui program implementat să apeleze alt program în cadrul aceluiași context de tranzacție.

**CPoS** — Composite Proof-of-Stake (dovadă de miză compozită). Designul de clasificare a consensului al QoreChain care grupează validatorii în trei pool-uri (RPoS, DPoS, PoS) pe baza reputației și a delegării. Fiecare pool are ponderi distincte în algoritmul de selecție a propunătorului. Implementat în `x/qca`, dar încă neactiv în producția de blocuri.

**DA** — Data Availability (disponibilitatea datelor). Garanția că datele de tranzacție publicate pe lanț pot fi recuperate de orice nod. Modulul RDK oferă DA nativ pentru rollup-uri, stocând blob-uri on-chain cu perioade de reținere configurabile.

**DPoS** — Delegated Proof-of-Stake (dovadă de miză delegată). Un mecanism de consens în care deținătorii de tokenuri își deleagă miza către validatori care produc blocuri în numele lor.

**EIP-1559** — Ethereum Improvement Proposal 1559. Un model de comisioane de tranzacție care folosește un comision de bază (ars) plus un comision de prioritate (plătit validatorilor). QoreChain implementează mecanici de comisioane în stil EIP-1559 în QoreChain EVM Engine.

**HCS** — Hierarchical Commitment Schemes (scheme ierarhice de angajament). Mecanismul prin care sidechain-urile, paychain-urile și rollup-urile își ancorează periodic rădăcinile de stare în lanțul principal (vezi Arhitectura multistrat). A nu se confunda cu schema de semnătură hibridă secp256k1 + ML-DSA-87, pe care această documentație o numește *semnătură hibridă*.

**Hybrid sign-bytes v2 (octeți de semnare hibrizi v2)** — Octeții etichetați cu domeniu și legați de lanț pe care îi semnează cheia ML-DSA începând cu v3.2.0. Vezi [Securitate post-cuantică](/architecture/post-quantum-security#sign-bytes-v2).

**IBC** — Inter-Blockchain Communication (comunicare între blockchain-uri). Un protocol pentru transmiterea autentificată de mesaje între blockchain-uri independente. QoreChain acceptă canale IBC pentru transferuri cross-chain de tokenuri și releu de date.

**Light Node (nod light)** — Un client cu consum redus de resurse care urmărește lanțul verificând încrucișat antetele blocurilor la unul sau mai multe endpoint-uri RPC, fără a deține starea completă. Nu deservește interogări pentru alții. Împărțirea comisioanelor de protocol rezervă o cotă de **3%** pentru programul de recompense al nodurilor light. Înregistrarea pentru program este deschisă și condiționată de o licență `lightnode_operator` (50 USD, cumpărată din Dashboard); la 20 octombrie 2026 fuseseră acordate șase licențe pe mainnet, iar niciun nod light nu se înregistrase încă. Rularea unui nod nu necesită licență. Vezi [Nod light](/light-node/overview) și [starea programului de recompense](/light-node/overview#reward-program-status).

**MEV** — Maximal Extractable Value (valoare maximă extractibilă). Profitul care poate fi obținut prin reordonarea, inserarea sau cenzurarea tranzacțiilor în cadrul unui bloc. Modulul FairBlock al QoreChain (criptare tIBE) este conceput pentru a atenua extragerea MEV; nu este încă activat.

**ML-DSA-87** — Module-Lattice Digital Signature Algorithm (nivel de securitate 5). Schema de semnătură digitală post-cuantică standardizată de NIST, folosită de QoreChain pentru semnarea tranzacțiilor rezistentă cuantic. Produce semnături de 4.627 octeți cu chei publice de 2.592 octeți.

**ML-KEM-1024** — Module-Lattice Key Encapsulation Mechanism (nivel de securitate 5). O schemă post-cuantică de încapsulare a cheilor standardizată de NIST, disponibilă în registrul de algoritmi PQC al QoreChain pentru viitoare canale de comunicare criptate.

**MLP** — Multi-Layer Perceptron (perceptron multistrat). O clasă de rețea neuronală folosită de QCAI pentru recunoașterea tiparelor în detectarea fraudei și scorarea anomaliilor.

**PPO** — Proximal Policy Optimization. Un algoritm de învățare prin întărire folosit de PRISM pentru a optimiza parametrii lanțului (timpul de bloc, prețul gazului, ponderile pool-urilor; dimensiunea setului de validatori este doar înregistrată în log) pe baza condițiilor de rețea observate. Nicio politică antrenată nu este încărcată pe rețelele live.

**PQC** — Post-Quantum Cryptography (criptografie post-cuantică). Algoritmi criptografici concepuți pentru a fi siguri împotriva atacurilor atât de la calculatoare clasice, cât și cuantice. QoreChain implementează PQC prin modulul său `x/pqc` cu ML-DSA-87 ca schemă principală de semnătură.

**PRISM** — Policy-driven Reinforcement-learning for Intelligent State Machines. Stratul de optimizare prin învățare prin întărire integrat în QoreChain Consensus Engine (prin modulul `x/rlconsensus`). PRISM observă metricile rețelei și este conceput să propună ajustări deterministe ale parametrilor de consens sub controale de siguranță de tip întrerupător de circuit; astăzi rulează în mod de observare. Vezi [PRISM Consensus Engine](/architecture/prism-consensus-engine).

**Proof of possession (PoP) (dovadă de posesie)** — O semnătură pe care o cheie post-cuantică o face asupra propriilor detalii de înregistrare, dovedind că cel care o înregistrează deține cheia privată. Opțională la înregistrarea cheii unui cont începând cu v3.2.3 (`tx pqc register-key-v2 ... --pqc-key <name>`); obligatorie pentru cheile validatorilor de bridge pe testnet (v3.2.4).

**Protocol feature (funcționalitate de protocol)** — Un comutator de comportament pe care handler-ul de upgrade al unei versiuni îl activează la o singură înălțime de bloc pe fiecare nod (de exemplu `pqc-sign-bytes-v2`, `evm-pqc-authorisation-window`), astfel încât istoricul se redă neschimbat sub acea înălțime.

**PvP Rebase** — Player versus Player Rebase. Un mecanism din modulul xQORE în care penalizările de la deblocarea anticipată sunt redistribuite proporțional către stakerii care rămân blocați, recompensând angajamentul pe termen lung (încă neconectat on-chain).

**QCAI** — QoreChain Artificial Intelligence. Termenul umbrelă pentru subsistemul AI al QoreChain, incluzând motorul euristic on-chain (modulul `x/ai`) și sidecar-ul QCAI off-chain care oferă capabilități avansate de inferență.

**QCB** — QoreChain Bridge. Protocolul de bridge nativ al QoreChain pentru conectarea la lanțuri non-IBC (de ex., Ethereum, Bitcoin, Solana, Avalanche). QCB folosește un prag de atestare al validatorilor (7 din 10 semnături ML-DSA-87) pentru atestarea cross-chain. Vezi [Arhitectura bridge-ului](/architecture/bridge-architecture).

**QDRW** — Quadratic Delegation with Reputation Weighting (delegare pătratică cu ponderare după reputație). O formulă de putere de vot în guvernanță (rădăcina pătrată a mizei plus xQORE ponderat, scalată cu un multiplicator de reputație). Implementat în `x/qca`, dar dezactivat pe rețelele live (`qdrw_enabled = false`).

**RDK** — Rollup Development Kit. Cadrul nativ al QoreChain pentru implementarea și gestionarea rollup-urilor cu patru paradigme de settlement (optimistic, zk, based, sovereign), cinci profiluri preset și disponibilitate integrată a datelor. Vezi [Prezentare generală rollup-uri](/rollups/overview).

**RL** — Reinforcement Learning (învățare prin întărire). O abordare de învățare automată în care un agent învață acțiunile optime prin încercare și recompensă. PRISM este conceput să folosească RL pentru a regla parametrii lanțului în cadrul QoreChain Consensus Engine (astăzi doar observare).

**RPoS** — Reputation Proof-of-Stake (dovadă de miză bazată pe reputație). Pool-ul pentru validatorii situați la sau peste percentila 70 de reputație, cu cel puțin miza proprie (self-bonded) mediană. Validatorii câștigă reputație prin uptime, participare și contribuții comunitare.

**SHAKE-256** — O funcție de hash cu lungime variabilă a ieșirii din familia SHA-3. SHAKE-256 este hash-ul implicit de aplicație al QoreChain (pachetul `qorehash`) și este folosit pentru operațiuni legate de PQC, precum derivarea cheilor.

**SNARK** — Succinct Non-interactive Argument of Knowledge. Un tip de dovadă cu cunoaștere zero care poate fi verificată rapid cu o dimensiune mică a dovezii. Acceptată ca paradigmă de settlement în modulul RDK pentru zk-rollup-uri.

**STARK** — Scalable Transparent Argument of Knowledge. Un sistem de dovadă cu cunoaștere zero care nu necesită un setup de încredere și este rezistent cuantic. Disponibil ca sistem de dovadă alternativ pentru settlement-ul zk-rollup în RDK.

**Stranded staker share / reward-pool reserve (cota blocată a stakerilor / rezerva pool-ului de recompense)** — Sume înregistrate la upgrade-ul v3.2.0 care se mișcă doar printr-un vot de guvernanță; guvernanța le-a eliberat în octombrie 2026 (după v3.2.3 a fost propus un rest corectat al cotei blocate). Vezi [Tokenomics](/architecture/tokenomics#stranded-and-reserve).

**SVM** — Solana Virtual Machine. Un mediu de execuție de înaltă performanță pentru programe BPF. QoreChain integrează SVM ca unul dintre cele trei runtime-uri acceptate, alături de QoreChain EVM Engine și CosmWasm.

**TEE** — Trusted Execution Environment (mediu de execuție de încredere). O zonă securizată a unui procesor care asigură că codul și datele sunt protejate de accesul extern. QoreChain definește specificații de interfață pentru atestarea TEE; nu există încă nicio implementare.

**tIBE** — Threshold Identity-Based Encryption (criptare bazată pe identitate cu prag). O schemă criptografică în care un mesaj poate fi decriptat doar atunci când un prag de părți colaborează. Folosită de modulul FairBlock pentru a cripta conținutul tranzacțiilor până la finalizarea blocului, prevenind extragerea MEV.

**Time-locked staking (staking cu blocare în timp)** — Un angajament opțional al unei părți dintr-o delegare pentru un termen fix, oferit de modulul `x/stakingtier`. **Doar pe testnet** (v3.2.4); nu este live pe mainnet. Vezi [Staking și delegare](/user-guide/staking-and-delegation#time-locked-staking).

**uqor** — Denominarea de bază a tokenului QOR. 1 QOR = 1.000.000 uqor (10^6). Toate sumele on-chain, comisioanele și valorile de staking sunt denominate în uqor.

**xQORE** — Derivatul de staking pentru guvernanță al QOR. Utilizatorii blochează QOR pentru a primi xQORE, care acordă putere de vot sporită în guvernanță și câștigă recompense din rebase-ul PvP provenit din penalizările de deblocare anticipată (comportament proiectat; tranzacțiile de blocare și deblocare nu sunt încă conectate on-chain). Vezi [Tokenomics](/architecture/tokenomics#x-xqore).
