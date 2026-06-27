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

**BPF** — Berkeley Packet Filter. Formatul de bytecode folosit de runtime-ul SVM pentru a executa programe on-chain. Programele sunt compilate în BPF înainte de implementare.

**Chain License** — O înregistrare de licență on-chain gestionată de modulul `x/license`. Licențele de lanț controlează accesul la capabilități specifice de protocol și le permit operatorilor să înregistreze, să verifice și să gestioneze drepturile de licențiere on-chain. Vezi [Licențiere de lanț](/architecture/chain-licensing).

**CLFB** — Cross-Layer Fee Balancing (echilibrarea comisioanelor între straturi). Un mecanism din cadrul arhitecturii multistrat care ajustează dinamic comisioanele între sidechain-uri și paychain-uri pentru a menține echilibrul și a preveni congestia pe orice strat individual.

**CPI** — Cross-Program Invocation (invocare între programe). Un mecanism din runtime-ul SVM care permite unui program implementat să apeleze alt program în cadrul aceluiași context de tranzacție.

**CPoS** — Classified Proof-of-Stake (dovadă de miză clasificată). Sistemul de clasificare a consensului QoreChain care grupează validatorii în trei pool-uri (Emerald, Sapphire, Ruby) pe baza scorurilor de reputație. Fiecare pool are ponderi distincte în algoritmul de selecție a propunătorului.

**DA** — Data Availability (disponibilitatea datelor). Garanția că datele de tranzacție publicate pe lanț pot fi recuperate de orice nod. Modulul RDK oferă DA nativ pentru rollup-uri, stocând blob-uri on-chain cu perioade de reținere configurabile.

**DPoS** — Delegated Proof-of-Stake (dovadă de miză delegată). Un mecanism de consens în care deținătorii de tokenuri își deleagă miza către validatori care produc blocuri în numele lor. QoreChain extinde DPoS cu o clasificare ponderată de reputație (CPoS).

**EIP-1559** — Ethereum Improvement Proposal 1559. Un model de comisioane de tranzacție care folosește un comision de bază (ars) plus un comision de prioritate (plătit validatorilor). QoreChain implementează mecanici de comisioane în stil EIP-1559 în QoreChain EVM Engine.

**HCS** — Hybrid Cryptographic Signatures (semnături criptografice hibride). Sistemul de semnătură duală al QoreChain în care tranzacțiile poartă atât o semnătură clasică (secp256k1/ECDSA), cât și o semnătură post-cuantică (ML-DSA-87), oferind securitate criptografică împotriva adversarilor atât clasici, cât și cuantici.

**IBC** — Inter-Blockchain Communication (comunicare între blockchain-uri). Un protocol pentru transmiterea autentificată de mesaje între blockchain-uri independente. QoreChain acceptă canale IBC pentru transferuri cross-chain de tokenuri și releu de date.

**Light Node (nod light)** — Un nod cu consum redus de resurse care urmărește lanțul și deservește interogări ușoare fără a deține starea completă. Nodurile light primesc o cotă dedicată de **3%** din împărțirea comisioanelor de protocol, recompensând participanții care extind acoperirea rețelei. Vezi [Nod light](/light-node/overview).

**MEV** — Maximal Extractable Value (valoare maximă extractibilă). Profitul care poate fi obținut prin reordonarea, inserarea sau cenzurarea tranzacțiilor în cadrul unui bloc. Modulul FairBlock al QoreChain (criptare tIBE) și prioritizarea TX pe 5 benzi atenuează extragerea MEV.

**ML-DSA-87** — Module-Lattice Digital Signature Algorithm (nivel de securitate 5). Schema de semnătură digitală post-cuantică standardizată de NIST, folosită de QoreChain pentru semnarea tranzacțiilor rezistentă cuantic. Produce semnături de 4.627 octeți cu chei publice de 2.592 octeți.

**ML-KEM-1024** — Module-Lattice Key Encapsulation Mechanism (nivel de securitate 5). O schemă post-cuantică de încapsulare a cheilor standardizată de NIST, disponibilă în registrul de algoritmi PQC al QoreChain pentru viitoare canale de comunicare criptate.

**MLP** — Multi-Layer Perceptron (perceptron multistrat). O clasă de rețea neuronală folosită de QCAI pentru recunoașterea tiparelor în detectarea fraudei și scorarea anomaliilor.

**PPO** — Proximal Policy Optimization. Un algoritm de învățare prin întărire folosit de PRISM pentru a optimiza parametrii lanțului (dimensiunea blocului, limitele de gaz, dimensiunea setului de validatori) pe baza condițiilor de rețea observate.

**PQC** — Post-Quantum Cryptography (criptografie post-cuantică). Algoritmi criptografici concepuți pentru a fi siguri împotriva atacurilor atât de la calculatoare clasice, cât și cuantice. QoreChain implementează PQC prin modulul său `x/pqc` cu ML-DSA-87 ca schemă principală de semnătură.

**PRISM** — Policy-driven Reinforcement-learning for Intelligent State Machines. Stratul de optimizare prin învățare prin întărire integrat în QoreChain Consensus Engine (prin modulul `x/rlconsensus`). PRISM observă metricile rețelei și propune ajustări deterministe ale parametrilor de consens sub controale de siguranță de tip întrerupător de circuit. Vezi [PRISM Consensus Engine](/architecture/prism-consensus-engine).

**PvP Rebase** — Player versus Player Rebase. Un mecanism din modulul xQORE în care penalizările de la deblocarea anticipată sunt redistribuite proporțional către stakerii care rămân blocați, recompensând angajamentul pe termen lung.

**QCAI** — QoreChain Artificial Intelligence. Termenul umbrelă pentru subsistemul AI al QoreChain, incluzând motorul euristic on-chain (modulul `x/ai`) și sidecar-ul QCAI off-chain care oferă capabilități avansate de inferență.

**QCB** — QoreChain Bridge. Protocolul de bridge nativ al QoreChain pentru conectarea la lanțuri non-IBC (de ex., Ethereum, Bitcoin, Solana, Avalanche). QCB folosește un set federat de validatori pentru atestarea cross-chain. Vezi [Arhitectura bridge-ului](/architecture/bridge-architecture).

**QDRW** — QoreChain Dynamic Reward Weighting. Un mecanism de guvernanță care permite PRISM (sub aprobarea guvernanței) să ajusteze dinamic ponderile de distribuție a recompenselor între pool-urile de validatori, optimizând pentru metricile de sănătate a rețelei.

**RDK** — Rollup Development Kit. Cadrul nativ al QoreChain pentru implementarea și gestionarea rollup-urilor cu patru paradigme de settlement (optimistic, zk, based, sovereign), cinci profiluri preset și disponibilitate integrată a datelor. Vezi [Prezentare generală rollup-uri](/rollups/overview).

**RL** — Reinforcement Learning (învățare prin întărire). O abordare de învățare automată în care un agent învață acțiunile optime prin încercare și recompensă. PRISM folosește RL pentru a regla dinamic parametrii lanțului în cadrul QoreChain Consensus Engine.

**RPoS** — Reputation-based Proof-of-Stake (dovadă de miză bazată pe reputație). Modelul global de consens care combină delegarea DPoS cu scorarea de reputație. Validatorii câștigă reputație prin uptime, participare și contribuții comunitare, ceea ce influențează frecvența propunerii lor de blocuri.

**SHAKE-256** — O funcție de hash cu lungime variabilă a ieșirii din familia SHA-3. QoreChain folosește SHAKE-256 ca funcție de hash fundamentală pentru operațiuni legate de PQC, inclusiv derivarea cheilor și calculul adreselor.

**SNARK** — Succinct Non-interactive Argument of Knowledge. Un tip de dovadă cu cunoaștere zero care poate fi verificată rapid cu o dimensiune mică a dovezii. Acceptată ca paradigmă de settlement în modulul RDK pentru zk-rollup-uri.

**STARK** — Scalable Transparent Argument of Knowledge. Un sistem de dovadă cu cunoaștere zero care nu necesită un setup de încredere și este rezistent cuantic. Disponibil ca sistem de dovadă alternativ pentru settlement-ul zk-rollup în RDK.

**SVM** — Solana Virtual Machine. Un mediu de execuție de înaltă performanță pentru programe BPF. QoreChain integrează SVM ca unul dintre cele trei runtime-uri acceptate, alături de QoreChain EVM Engine și CosmWasm.

**TEE** — Trusted Execution Environment (mediu de execuție de încredere). O zonă securizată a unui procesor care asigură că codul și datele sunt protejate de accesul extern. Modulul PQC al QoreChain acceptă atestare TEE pentru dovezile de generare a cheilor.

**tIBE** — Threshold Identity-Based Encryption (criptare bazată pe identitate cu prag). O schemă criptografică în care un mesaj poate fi decriptat doar atunci când un prag de părți colaborează. Folosită de modulul FairBlock pentru a cripta conținutul tranzacțiilor până la finalizarea blocului, prevenind extragerea MEV.

**uqor** — Denominarea de bază a tokenului QOR. 1 QOR = 1.000.000 uqor (10^6). Toate sumele on-chain, comisioanele și valorile de staking sunt denominate în uqor.

**xQORE** — Derivatul de staking pentru guvernanță al QOR. Utilizatorii blochează QOR pentru a primi xQORE, care acordă putere de vot sporită în guvernanță și câștigă recompense din rebase-ul PvP provenit din penalizările de deblocare anticipată. Vezi [Tokenomics](/architecture/tokenomics).
