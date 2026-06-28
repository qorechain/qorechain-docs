---
slug: /introduction/what-is-qorechain
title: Ce este QoreChain?
sidebar_label: Ce este QoreChain?
sidebar_position: 1
---

# Ce este QoreChain?

QoreChain este primul blockchain de tip Layer 1 construit cu criptografie post-cuantică de la geneză, procesare a tranzacțiilor nativă AI și un runtime triplu-VM care execută programe EVM, CosmWasm și SVM pe un singur lanț. În loc să adapteze rezistența cuantică pe un protocol existent, QoreChain a fost proiectat de la zero pentru a fi sigur împotriva adversarilor atât clasici, cât și cuantici, oferind în același timp experiența de dezvoltare și interoperabilitatea așteptate de la un blockchain modern de uz general.

Rețeaua principală (`qorechain-vladi`, EVM chain ID **9801**) este activă din 7 iunie 2026 și rulează versiunea de lanț **v3.1.80**. O rețea de test publică (`qorechain-diana`, EVM chain ID **9800**) rulează în paralel pentru staging și testare de integrare. Token-ul nativ este **QOR** (afișare) / **uqor** (bază, 10^6), cu prefixele Bech32 `qor` pentru conturi și `qorvaloper` pentru validatori. Lanțul este construit pe Cosmos SDK v0.53.

## Inovații de bază

### 1. Criptografie post-cuantică

QoreChain folosește ML-DSA-87 (Dilithium-5) standardizat de NIST pentru semnături digitale, ML-KEM-1024 pentru încapsularea cheilor și SHAKE-256 ca hash implicit al aplicației, oferind securitate împotriva atacurilor atât de la calculatoare clasice, cât și cuantice. Semnăturile hibride sunt acum **necesare implicit** pe calea de tranzacții cosmos: fiecare tranzacție de pe calea cosmos trebuie să poarte o semnătură Dilithium-5 (ML-DSA-87) ca extensie de tranzacție *alături* de semnătura clasică secp256k1 (ECDSA). Tranzacțiile cosmos exclusiv clasice sunt respinse — calea de retrogradare este închisă (doar gentxs de geneză și tranzacțiile de înregistrare/migrare a cheilor PQC sunt exceptate). Tranzacțiile EVM nu sunt afectate: ele folosesc o cale ante separată `eth_secp256k1` (calea QoreChain EVM Engine) și nu necesită semnătura hibridă. Trei moduri de aplicare controlate prin guvernanță (disabled, optional, required) rămân disponibile, dar valoarea implicită actuală a rețelei este **necesar**. Un cadru de agilitate algoritmică asigură că schemele de semnătură pot fi actualizate prin propuneri de guvernanță pe măsură ce standardele criptografice evoluează.

### 2. Procesare nativă AI

Un agent de învățare prin întărire pe lanț (PPO MLP cu 73.733 de parametri) rulează inferență deterministă cu virgulă fixă direct în ciclul de viață al blocului, reglând dinamic parametrii de consens cum ar fi timpul de bloc, limitele de gaz și ponderile pool-urilor de validatori. Acest strat de optimizare este denumit **PRISM** (Policy-driven Reinforcement-learning for Intelligent State Machines). Detectarea statistică a anomaliilor prin isolation forest și scorarea riscului multidimensională evaluează fiecare tranzacție în lanțul de decoratori ante, semnalând tiparele frauduloase înainte de execuție. Optimizarea dinamică a taxelor ajustează taxele de bază în funcție de condițiile de rețea în timp real. Toată inferența AI este complet deterministă între validatori — intrări identice produc ieșiri identice, fără dependență de oracole externe.

### 3. Runtime triplu-VM

QoreChain este singurul Layer 1 care rulează nativ trei mașini virtuale într-un singur consens:

* **EVM** — Compatibilitate completă cu Ethereum cu prețuri de gaz EIP-1559 și JSON-RPC pe portul 8545. Implementați contracte Solidity folosind instrumente standard (Hardhat, Foundry, Remix).
* **CosmWasm** — Contracte inteligente WebAssembly scrise în Rust cu suport complet pentru ciclul de viață (instanțiere, execuție, interogare, migrare).
* **SVM** — Implementare și execuție de programe BPF cu un server JSON-RPC compatibil Solana pe portul 8899. Clienții și instrumentele Solana existente funcționează imediat.

Mesageria între VM-uri permite tuturor celor trei runtime-uri să comunice: contractele EVM apelează CosmWasm prin precompilare, contractele CosmWasm apelează EVM prin mesaje personalizate, iar programele SVM participă prin punte bazată pe evenimente asincrone.

### 4. Tokenomică cu ofertă fixă

Zece canale distincte de ardere (taxe de tranzacție, penalizări de guvernanță, slashing, taxe de punte, descurajarea spam-ului, excedent de epocă, arderi manuale, callback-uri de contract, taxe între VM-uri și arderi la crearea de rollup-uri) alimentează un modul central de contabilitate a arderii. Taxele colectate sunt împărțite **37% către validatori, 30% arse permanent, 20% către trezorerie, 10% către staker-i și 3% către nodurile light**. Mecanismul de staking de guvernanță xQORE le permite utilizatorilor să blocheze QOR pentru pondere dublă de guvernanță cu redistribuire prin rebase PvP — penalizările de ieșire timpurie sunt redistribuite deținătorilor rămași, recompensând convingerea.

QoreChain folosește un model cu **ofertă fixă** cu un buget de emisie finit, în loc de inflație procentuală perpetuă. Oferta totală este fixată la **4.500.000.000 QOR**, dintre care **80.000.000 (1,78%)** au fost arși la TGE. Recompensele pentru staking sunt plătite dintr-un pool dedicat de **590.000.000 QOR** pe un program multianual:

| Perioadă | APY țintă | Buget de emisie |
| --- | --- | --- |
| Anul 1 | 8–12% | 127.500.000 QOR |
| Anul 2 | 6–10% | 106.250.000 QOR |
| Anii 3–4 | 5–8% | 85.000.000 QOR pe an |
| Anul 5+ | Determinat prin guvernanță | ~186.000.000 QOR rămași |

Combinat cu cele zece canale de ardere, designul cu ofertă fixă converge spre un comportament net deflaționist pe măsură ce volumul tranzacțiilor crește.

### 5. Conectivitate între lanțuri

QoreChain este proiectat să se conecteze la un set larg de ecosisteme blockchain prin două protocoale complementare: IBC nativ și QoreChain Bridge (QCB). Stratul de punte definește **37 de configurații de lanț QCB (inclusiv QoreChain însuși ca buclă internă nativă)** plus **8 canale IBC** — acoperind **36 de lanțuri externe** în total. Stratul între lanțuri este în prezent în **stare de rețea de test / în așteptare și încă nu este în producție**; cifrele de mai jos descriu acoperirea vizată.

* **8 canale IBC** — Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon și Injective. Șabloane de releu preconfigurate cu actualizări de client, detectarea comportamentului necorespunzător și curățarea automată a pachetelor.
* **37 de configurații QCB (36 de lanțuri externe + buclă internă QoreChain)** — fiecare punct final este proiectat să includă validarea adreselor per tip, adâncime de confirmare configurabilă, limite de volum prin întrerupător de circuit și atestări de validator semnate PQC. Lanțurile externe vizate sunt:
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

Cinci profiluri presetate (**defi, gaming, nft, enterprise, custom**) permit implementarea cu un singur clic cu moduri de decontare, timpi de bloc, alegeri de VM, backend-uri DA și modele de gaz preconfigurate. Un router DA nativ oferă stocare de blob-uri verificate SHA-256 cu retenție configurabilă și curățare automată. Modulul de consens PRISM oferă metode consultative pentru configurarea de rollup-uri asistată de AI.

### 7. Abstractizarea conturilor și a gazului

Conturile inteligente cu trei tipuri programabile (multisig, recuperare socială, bazat pe sesiune) acceptă chei de sesiune cu permisiuni granulare și expirare, reguli de cheltuire per cont și liste de permisiuni de denom. Acest lucru permite tipare de UX al portofelului imposibile cu conturi standard: chei de sesiune dApp pentru mobil, recuperare socială ca tip de cont de primă clasă și limite de cheltuire programabile aplicate la consens. Abstractizarea gazului elimină cerința de a deține QOR nativ pentru taxe — utilizatorii pot plăti în orice token acceptat transferat prin IBC, cum ar fi USDC sau ATOM.

## Ecosistem

QoreChain este livrat cu **peste 45 de module de geneză, inclusiv peste 20 de module personalizate**, acoperind securitatea (pqc), AI (ai, reputation, rlconsensus), consensul (qca), mașinile virtuale (vm, svm, crossvm), tokenomica (burn, xqore, inflation), lichiditatea (amm), licențierea (license), punțile (bridge, babylon, multilayer), extensiile de guvernanță (abstractaccount, fairblock, gasabstraction) și rollup-urile (rdk). Adăugările recente includ `x/amm` pentru AMM / lichiditate pe lanț și `x/license` pentru licențiere de lanț. Lanțul urmează o arhitectură open-core — stratul de protocol este complet open source, cu extensii proprietare opționale pentru implementări enterprise.

## Conexe

* [Prezentare generală a arhitecturii](/introduction/architecture-overview) — cum se îmbină straturile de la un capăt la altul.
* [Caracteristici principale](/introduction/key-features) — evidențierea capabilităților dintr-o privire.
* [PRISM Consensus Engine](/architecture/prism-consensus-engine) — consensul asistat de AI din nucleu.
* [Tokenomică](/architecture/tokenomics) — oferta QOR, arderile, rebase-urile și emisiile.
* [Pornire rapidă](/getting-started/quickstart) — porniți un nod local și începeți să construiți.
