---
slug: /introduction/what-is-qorechain
title: Ce este QoreChain?
sidebar_label: Ce este QoreChain?
sidebar_position: 1
---

# Ce este QoreChain?

QoreChain este primul blockchain de tip Layer 1 construit cu criptografie post-cuantică de la geneză, procesare a tranzacțiilor nativă AI și un runtime triplu-VM care execută programe EVM, QoreChain Native (runtime-ul CosmWasm) și SVM pe un singur lanț. În loc să adapteze rezistența cuantică pe un protocol existent, QoreChain a fost proiectat de la zero pentru a fi sigur împotriva adversarilor atât clasici, cât și cuantici, oferind în același timp experiența de dezvoltare și interoperabilitatea așteptate de la un blockchain modern de uz general.

Rețeaua principală (`qorechain-vladi`, EVM chain ID **9801**) este activă din 7 iunie 2026 și rulează versiunea de lanț **v3.2.4** (aplicată prin propunerea de guvernanță 13 la înălțimea 3,742,566, pe 23 octombrie 2026). O rețea de test publică (`qorechain-diana`, EVM chain ID **9800**, care rulează v3.2.6 din 27 octombrie 2026) rulează în paralel pentru staging și testare de integrare. Token-ul nativ este **QOR** (afișare) / **uqor** (bază, 10^6), cu prefixele Bech32 `qor` pentru conturi și `qorvaloper` pentru validatori. Lanțul este construit pe Cosmos SDK v0.53.

## Inovații de bază

### 1. Criptografie post-cuantică

QoreChain folosește ML-DSA-87 (Dilithium-5) standardizat de NIST pentru semnături digitale, ML-KEM-1024 pentru încapsularea cheilor și SHAKE-256 ca hash implicit al aplicației. Semnăturile hibride sunt acum **necesare implicit** pe calea de tranzacții cosmos: fiecare tranzacție de pe calea cosmos trebuie să poarte o semnătură Dilithium-5 (ML-DSA-87) ca extensie de tranzacție *alături* de semnătura clasică secp256k1 (ECDSA). Tranzacțiile cosmos exclusiv clasice sunt respinse — calea de retrogradare este închisă (doar gentxs de geneză, tranzacțiile de înregistrare/migrare a cheilor PQC și o deblocare (unjail) dintr-un cont de operator fără cheie înregistrată sunt exceptate). Banda EVM păstrează semnătura standard `eth_secp256k1`, astfel încât instrumentele Ethereum semnează neschimbat, dar începând cu v3.2.0 o tranzacție EVM este admisă doar de la un cont care are o cheie ML-DSA-87 înregistrată și o **fereastră de autorizare EVM** deschisă — o permisiune delimitată, deschisă printr-un mesaj post-cuantic semnat pe banda Cosmos (vezi [fereastra de autorizare EVM](/getting-started/first-transaction#evm-window)). O cheie clasică singură nu mai poate muta fonduri pe banda EVM. Trei moduri de aplicare controlate prin guvernanță (disabled, optional, required) rămân disponibile, dar valoarea implicită actuală a rețelei este **required**. Un cadru de agilitate algoritmică asigură că schemele de semnătură pot fi actualizate prin propuneri de guvernanță pe măsură ce standardele criptografice evoluează.

### 2. Procesare nativă AI

**PRISM** (Policy-driven Reinforcement-learning for Intelligent State Machines) este un strat de învățare prin întărire pe lanț — o rețea de politici PPO cu virgulă fixă, cu 73,733 de parametri și limite de siguranță de tip circuit-breaker — integrat în ciclul de viață al blocului. În prezent rulează în mod de observare: rețelele active înregistrează observații și recompense la fiecare 10 blocuri, nu este încărcată nicio politică antrenată, deci astăzi niciun parametru de consens nu este reglat de acesta. Detectarea statistică a anomaliilor prin isolation forest și scorarea riscului multidimensională evaluează fiecare tranzacție în lanțul de decoratori ante, semnalând tiparele frauduloase înainte de execuție. Optimizarea dinamică a taxelor ajustează taxele de bază în funcție de condițiile de rețea în timp real. Toată inferența AI pe lanț este concepută să fie complet deterministă între validatori — intrări identice produc ieșiri identice, fără dependență de oracole externe.

### 3. Runtime triplu-VM

QoreChain este singurul Layer 1 care rulează nativ trei mașini virtuale într-un singur consens:

* **EVM** — Compatibilitate completă cu Ethereum cu prețuri de gaz EIP-1559 și JSON-RPC pe portul 8545. Implementați contracte Solidity folosind instrumente standard (Hardhat, Foundry, Remix).
* **QoreChain Native** — Contracte inteligente WebAssembly scrise în Rust cu suport complet pentru ciclul de viață (instanțiere, execuție, interogare, migrare).
* **SVM** — Implementare și execuție de programe BPF cu un server JSON-RPC compatibil Solana pe portul 8899. Clienții și instrumentele Solana existente funcționează imediat.

Mesageria între VM-uri permite tuturor celor trei runtime-uri să comunice: contractele EVM apelează QoreChain Native prin precompilare (odată ce acea precompilare este activată), contractele QoreChain Native apelează EVM prin mesaje personalizate, iar programele SVM participă prin punte bazată pe evenimente asincrone. Astăzi, doar runtime-ul EVM acceptă tranzacții în rețelele active: încărcarea și instanțierea codului QoreChain Native sunt dezactivate, banda de tranzacții SVM este dezactivată, nicio precompilare EVM nu este activă pe mainnet (testnet-ul are trei active), iar mesajul de apel între VM-uri este oprit pe rețeaua principală.

### 4. Tokenomică cu emisie plafonată

Motorul de ardere definește **douăsprezece surse de ardere** (taxe de gaz, crearea de contracte, taxe pentru serviciile AI, taxe de punte, răscumpărarea de către trezorerie, tranzacții eșuate, penalizări xQORE, răscumpărare automată, arderea TGE, crearea de rollup-uri, borne de număr de tranzacții și AMM) care alimentează un modul central de contabilitate a arderii; pe rețeaua principală, până acum doar canalele taxelor de gaz și ale tranzacțiilor eșuate au înregistrat arderi. Tot ce intră în colectorul de taxe este împărțit **37% către validatori, 30% ars permanent, 20% către trezorerie, 10% către staker-i și 3% către nodurile light**. Împărțirea se aplică atât taxelor de tranzacție, cât și emisiei de epocă. Designul de staking de guvernanță xQORE le permite utilizatorilor să blocheze QOR pentru pondere dublă de guvernanță, penalizările de ieșire timpurie fiind redistribuite deținătorilor rămași; tranzacțiile de blocare și deblocare nu sunt încă conectate la rețelele active.

QOR are o **cale de ofertă finită**: **4,420,000,000 QOR** la geneză (4,500,000,000 QOR planificați, dintre care 80,000,000 QOR au fost arși la evenimentul de generare a token-ului dinainte de geneză), emisie de staking creată sub un **plafon cumulativ strict de 590,000,000 QOR** și motorul de ardere, care elimină permanent token-uri. Modulul `x/inflation` creează o sumă fixă pe epocă de 43,200 de blocuri (86,000 QOR începând cu propunerea de guvernanță 10 din octombrie 2026) până la atingerea plafonului, după care recompensele provin exclusiv din taxele de tranzacție. Vezi [Tokenomică](/architecture/tokenomics#supply-and-emission) pentru cifrele actuale și program.

### 5. Conectivitate între lanțuri

QoreChain este proiectat să se conecteze la un set larg de ecosisteme blockchain prin două protocoale complementare: IBC nativ și QoreChain Bridge (QCB). Stratul de punte definește **37 de configurații de lanț (36 de lanțuri externe plus Injective, accesat prin IBC)** și până la **8 contrapărți IBC**. Stratul între lanțuri **nu este activ în niciuna dintre rețele**: toate cele 37 de configurații de lanț au starea `pending`, mainnet-ul nu are niciun canal IBC, iar testnet-ul are un singur canal de test către un lanț de test. Cifrele de mai jos descriu acoperirea vizată.

* **Până la 8 contrapărți IBC** — Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon și Injective. Șabloane de releu preconfigurate cu actualizări de client, detectarea comportamentului necorespunzător și curățarea automată a pachetelor.
* **37 de configurații de lanț QCB (36 de lanțuri externe plus Injective prin IBC)** — fiecare punct final este proiectat să includă validarea adreselor per tip, adâncime de confirmare configurabilă, limite de volum prin întrerupător de circuit și atestări de validator semnate PQC. Lanțurile externe vizate sunt:
  * **Bază (10):** Ethereum, Solana, TON, BSC, Avalanche, Polygon, Arbitrum, Optimism, Base, Sui
  * **Familia EVM (14):** zkSync Era, Linea, Scroll, Blast, Mantle, Hyperliquid, Berachain, Sonic, Sei, Monad, Plasma, Filecoin FVM, Cronos, Kaia
  * **Non-EVM (5):** Starknet, XRP Ledger, Stellar, Hedera, Algorand
  * **În așteptare (7):** NEAR, Bitcoin, Cardano, Polkadot, Tezos, Tron, Aptos

Arhitectura acoperă fiecare tip major de lanț — EVM, Solana (SVM), bazate pe Move (Sui, Aptos), Cosmos/IBC, UTXO și alte familii non-EVM — pentru a oferi interoperabilitate largă în întregul ecosistem.

### 6. Rollup Development Kit

Modulul `x/rdk` este un cadru nativ protocolului pentru implementarea de rollup-uri specifice aplicațiilor direct pe lanțul gazdă QoreChain. Suportul pentru rollup-uri este livrat ca un cadru de lanț gazdă; afirmațiile specifice de implementare ar trebui tratate ca fiind capabilități vizate. Sunt acceptate patru paradigme de decontare:

* **Optimistic** — Dovezi de fraudă cu o fereastră de contestare de 7 zile, auto-finalizate de EndBlocker.
* **ZK (Zero-Knowledge)** — Dovezi SNARK sau STARK cu finalitate instantanee la verificare.
* **Based** — Tranzacții secvențiate de L1 cu finalitate în aproximativ 2 blocuri gazdă.
* **Sovereign** — Lanțuri independente care folosesc QoreChain exclusiv pentru disponibilitatea datelor.

Cinci profiluri presetate (**defi, gaming, nft, enterprise, custom**) permit implementarea cu un singur clic cu moduri de decontare, timpi de bloc, alegeri de VM, backend-uri DA și modele de gaz preconfigurate. Un router DA nativ oferă stocare de blob-uri verificate SHAKE-256 cu retenție configurabilă și curățare automată. Modulul de consens PRISM oferă metode consultative pentru configurarea de rollup-uri asistată de AI. Niciun rollup nu a fost creat încă în rețelele active.

### 7. Abstractizarea conturilor și a gazului

Conturile inteligente cu trei tipuri programabile (multisig, recuperare socială, bazat pe sesiune) acceptă chei de sesiune cu permisiuni granulare și expirare, reguli de cheltuire per cont și liste de permisiuni de denom. Acest lucru permite tipare de UX al portofelului imposibile cu conturi standard: chei de sesiune dApp pentru mobil, recuperare socială ca tip de cont de primă clasă și limite de cheltuire programabile. Funcțiile de cont inteligent și de portofel conectat sunt implementate, dar sunt **oprite pe mainnet** (`abstractaccount.enabled = false`) și activate pe testnet (verificați `GET /qorechain/abstractaccount/v1/config`). Abstractizarea gazului este concepută pentru a le permite utilizatorilor să plătească taxele într-un token non-nativ acceptat (configurația listează `ibc/USDC` și `ibc/ATOM`); niciun canal IBC nu este încă deschis, așa că taxele se plătesc în prezent în QOR.

## Ecosistem

QoreChain este livrat cu **48 de module de geneză, dintre care 20 sunt specifice QoreChain**, acoperind securitatea (pqc), AI (ai, reputation, rlconsensus), consensul (qca), mașinile virtuale (vm, svm, crossvm), tokenomica (burn, xqore, inflation), lichiditatea (amm), licențierea (license), punțile (bridge, babylon, multilayer), extensiile de guvernanță (abstractaccount, fairblock, gasabstraction) și rollup-urile (rdk). Adăugările recente includ `x/amm` pentru AMM / lichiditate pe lanț și `x/license` pentru licențiere de lanț. Lanțul urmează o arhitectură open-core — stratul de protocol este complet open source, cu extensii proprietare opționale pentru implementări enterprise.

## Conexe

* [Prezentare generală a arhitecturii](/introduction/architecture-overview) — cum se îmbină straturile de la un capăt la altul.
* [Caracteristici principale](/introduction/key-features) — evidențierea capabilităților dintr-o privire.
* [PRISM Consensus Engine](/architecture/prism-consensus-engine) — consensul asistat de AI din nucleu.
* [Tokenomică](/architecture/tokenomics) — oferta QOR, arderile, rebase-urile și emisiile.
* [Pornire rapidă](/getting-started/quickstart) — porniți un nod local și începeți să construiți.
