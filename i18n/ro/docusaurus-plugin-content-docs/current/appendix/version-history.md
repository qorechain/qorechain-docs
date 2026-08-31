---
slug: /appendix/version-history
title: Istoric versiuni
sidebar_label: Istoric versiuni
sidebar_position: 3
---

# Istoric versiuni

Istoricul public al versiunilor QoreChain. Cea mai recentă versiune este **v3.1.95**, care rulează pe mainnet **`qorechain-vladi`** (ID chain EVM **9801**, live din 7 iunie 2026). Testnetul **`qorechain-diana`** (ID chain EVM **9800**) urmărește build-urile pre-lansare.

:::note
Intrările de mai jos sunt rezumate de nivel înalt ale capabilităților. Intrările `v1.x` mai vechi sunt păstrate ca înregistrare istorică a liniei de lansări testnet care a precedat mainnet-ul.
:::

---

## v3.1.95 — Consolidare EVM Cosmos (versiunea curentă)

**Focus lansare:** Actualizare de securitate în flux (rolling) pentru biblioteca de contabilizare a soldurilor EVM.

* **Consolidare la overflow** — O cale de actualizare a soldului EVM eșuează acum în siguranță, în loc să se înfășoare (wrap) silențios la o condiție extremă de overflow. Livrată ca actualizare în flux (rolling), fără a rupe consensul — nu a fost necesar niciun vot de guvernanță sau înălțime de oprire coordonată.

## v3.1.94 — Plafon de emisiune și consolidarea mesajelor administrative

**Focus lansare:** Aducerea emisiunii recompenselor de staking în linie cu condițiile reale ale rețelei și strângerea verificărilor de autorizare pe mesajele administrative privilegiate.

* **Plafon de emisiune** — O propunere de guvernanță, adoptată cu susținerea integrală a stake-ului bonded și aplicată la înălțimea 2.122.074 (26 august 2026), a înlocuit programul original de emisiune în declin cu o sumă fixă per epocă, sub un plafon cumulativ dur. Programul original fusese calibrat pentru o rețea mult mai matură, complet bonded; raportat la stake-ul bonded real, plătea mult mai rapid decât se intenționase. Vezi [Tokenomics](/architecture/tokenomics#staking-reward-schedule) pentru cifrele curente și autonomia (runway) rămasă.
* **Consolidarea mesajelor administrative** — Un set de mesaje administrative privilegiate, controlate prin autoritate, își verifică acum semnatarul față de adresa proprie a modulului de guvernanță, în loc să aibă încredere într-o valoare purtată în mesajul însuși.
* De asemenea, include corecția de fiabilitate la onboarding-ul nodurilor din v3.1.92, pentru orice nod care face upgrade direct la această versiune.

## v3.1.92 — Fiabilitatea sincronizării nodurilor

**Focus lansare:** Onboarding mai fiabil al nodurilor din snapshot-uri și din arhiva publică a chain-ului.

* **Corecție de sincronizare snapshot și arhivă** — A fost rezolvată o problemă în care un nod care se restaura dintr-un snapshot de state-sync sau din arhiva publică a chain-ului putea eșua să finalizeze sincronizarea dincolo de anumite blocuri istorice. Onboarding-ul prin oricare dintre cele două căi se finalizează acum în mod fiabil.

## v3.1.90 — Contabilizarea uptime-ului pentru light node

**Focus lansare:** Uptime-ul măsurat pentru eligibilitatea recompenselor light node se acumulează acum consistent în timp.

* **Acumulare progresivă a uptime-ului** — Uptime-ul de eligibilitate pentru recompense al unui light node este acum calculat prin acumularea progresivă a numărului de heartbeat-uri așteptate, pornind de la propria înregistrare, la orice interval de heartbeat era în vigoare în fiecare moment, în loc de recalcularea întregului istoric sub intervalul aflat în vigoare în prezent. O schimbare de guvernanță a intervalului de heartbeat afectează deci uptime-ul doar de la acel moment înainte și nu reevaluează niciodată retroactiv performanța trecută a unui nod.

## v3.1.86 — Protecție la recuperarea validatorilor

**Focus lansare:** Un validator nu mai poate fi blocat permanent din recuperarea dintr-o închisoare (jail) pentru downtime.

* **Corecție blocaj jail** — Un cont de operator de validator fără o cheie post-cuantică înregistrată poate acum întotdeauna să trimită `MsgUnjail` pentru a se recupera dintr-o închisoare (jail) de downtime, chiar și atunci când aplicarea semnăturii hibride este setată la obligatorie, cu fallback-ul clasic dezactivat. Anterior, un astfel de cont nu avea nicio cale de recuperare, deoarece dezînchiderea (unjail) necesita trimiterea unei tranzacții pe care contul era blocat să o trimită.
* **Snapshot-uri state-sync** — Generarea de snapshot-uri este activată la nivelul întregii rețele, permițând validatorilor și nodurilor complete noi să se alăture rapid prin state sync în locul unei redări istorice complete.

## v3.1.85 — Cheltuire delegată prin portofele conectate

**Focus lansare:** O cheie de portofel extern conectat (Phantom, MetaMask) poate acum să **cheltuiască** din contul post-cuantic canonic unic — sub permisiuni cu privilegiu minim, limite de cheltuire și revocare instantanee.

* **Lane-uri de execuție pentru autenticator** — Două mesaje noi permit unui autenticator înregistrat să autorizeze transferuri din contul canonic fără ca proprietarul contului să fie prezent: **`MsgExecuteEVM`** (un apel/transfer EVM din adresa `0x…` a contului) și **`MsgExecuteCosmos`** (o trimitere bancară pe lane-ul nativ). Un **relayer** trimite și plătește plicul (envelope) — propria sa semnătură hibridă PQC satisface cerințele tranzacției — în timp ce semnătura autenticatorului asupra unor octeți de semnat separați pe domeniu și legați de anti-replay reprezintă autorizarea. Cheia externă nu are niciodată nevoie de o co-semnătură ML-DSA.
* **MetaMask ca autenticator** — Autenticatorii secp256k1 pot fi acum înregistrați prin **adresa Ethereum pe 20 de octeți** și verificați prin **EIP-191 `personal_sign`** (pe lângă forma de cheie comprimată pe 33 de octeți), astfel încât un cont MetaMask standard poate fi conectat și poate cheltui sub limite.
* **Aplicare pe toate cele trei lane-uri** — Domeniile de permisiune și limitele de valoare din **SpendingRule** (plafoane per tranzacție + zilnice) sunt aplicate pe lane-urile Native, EVM și SVM; mesajele de management al cheilor nu pot fi niciodată delegate. Coduri de eroare distincte permit portofelelor să afișeze mesajul corect: `5` limită de cheltuire depășită, `6` autenticator expirat, `10` permisiune refuzată, `11` replay respins.
* **Interogare schemă de permisiuni** — `GET /qorechain/abstractaccount/v1/permission_schema` (disponibil și prin gRPC/CLI) returnează taxonomia canonică de permisiuni (11 permisiuni), maparea mesaj→permisiune și lista mesajelor nedelegabile, astfel încât portofelele să valideze domeniile fără a le codifica dur (hardcoding).
* **Rotația cheii PQC în același algoritm** — Noul mesaj **`MsgRotatePQCKey`** rotește cheia ML-DSA-87 a unui cont în cadrul aceluiași algoritm (semnat dublu de cheia veche și cea nouă), permițând migrarea cheilor derivate în formă veche către derivarea canonică legată de adresă și retragerea unei chei compromise. CLI nou: `tx pqc rotate-key` și `tx pqc recover-key` (recuperare deterministă a cheii dintr-un mnemonic).
* **Tranzacțiile cu cheia rădăcină rămân neafectate** — Modificările sunt aditive; fluxurile normale de portofel, exchange și Keplr rămân neschimbate. Operatorii de noduri trebuie să fie pe **v3.1.85** până la înălțimea upgrade-ului de rețea.

## v3.1.84 — Permisiuni și limite de cheltuire pentru autenticator

**Focus lansare:** Modelul de permisiuni din spatele cheltuirii delegate.

* **Taxonomie canonică de permisiuni** — Unsprezece permisiuni (`all`, `send`, `delegate`, `withdraw`, `vote`, `evm`, `wasm`, `svm`, `amm`, `ibc`, `deploy`) cu o mapare mesaj→permisiune fail-closed: un tip de mesaj care nu este mapat este refuzat, iar mesajele de management al cheilor nu pot fi niciodată delegate.
* **Aplicarea SpendingRule** — Plafoanele de cheltuire per tranzacție și per zi (UTC), împreună cu listele de denominări permise, sunt aplicate și înregistrate per pereche (cont, autenticator).
* **Autorizare pe lane-ul SVM** — Acțiunile autorizate de o cheie dintr-o schemă externă (de ex. Phantom ed25519) pe lane-ul SVM trec prin aceeași poartă centrală de autorizare.

## v3.1.83 — Semnare unificată a contului pe toate cele trei interfețe

**Focus lansare:** O singură cheie, un singur cont — o identitate unificată unică ce poate acum să **semneze**, nu doar să dețină un sold, pe interfețele Cosmos, EVM și SVM.

* **O singură cheie semnează pe fiecare lane** — Un cont creat eth-native (adresă = keccak al cheii sale publice secp256k1) semnează acum tranzacțiile de pe lane-ul Cosmos cu schema `eth_secp256k1`, pe lângă tranzacțiile EVM. Formele sale `qor1…` (Cosmos), `0x…` (EVM) și Solana-VM (base58) sunt o singură identitate pe 20 de octeți care atât **deține un singur sold**, cât și **cheltuiește pe toate cele trei lane-uri** — inclusiv tranzacții Cosmos hibride post-cuantice (ML-DSA-87).
* **Semnarea post-cuantică rămâne neschimbată** — Contul unificat își înregistrează în continuare cheia ML-DSA-87 și poartă semnătura hibridă FIPS-204 cerută de chain; partea clasică este `eth_secp256k1` (keccak) în loc de schema coinType-118. Conturile coinType-118 existente rămân neafectate.
* **Upgrade continuu, neutru din punct de vedere al consensului** — Livrat ca upgrade continuu al binarului pe ambele rețele, **fără regeneză și fără oprirea chain-ului**. Soldurile conturilor, istoricul și geneza rămân neschimbate.
* **Unelte client** — `@qorechain/wallet-adapter` 0.1.5 adaugă semnarea Cosmos eth-native (`signClassicalEth` / `signHybridEth`), generarea unificată a celor 3 adrese și `walletFromSeed` (derivă contul canonic din orice seed de 32 de octeți — de exemplu o semnătură Phantom); `@qorechain/chain-bridge` primește o cale de semnare `eth_secp256k1`.

:::caution Operatori de noduri — upgrade necesar
Nodurile complete trebuie să ruleze **v3.1.83+**. Un nod pre-3.1.83 nu poate decoda o tranzacție eth-native (`eth_secp256k1`) și se va opri din sincronizare imediat ce una apare într-un bloc. Descărcați pachetul curent de la [download.qore.host](https://download.qore.host).
:::

## v3.1.82 — QOR nativ pe SVM live + activare pentru integratori

**Focus lansare:** Unificarea QOR nativ pe SVM rulând pe ambele rețele, plus tot ce are nevoie un exchange sau un integrator pentru a se conecta.

* **Sold QOR nativ unificat live pe toate cele trei interfețe** — Unificarea SVM (v3.1.81) este confirmată live pe mainnet și testnet: același cont deține un sold unic vizibil ca `uqor` (6 zecimale) pe Cosmos, în stil wei cu 18 zecimale pe EVM și în lamports (9 zecimale; 1 uqor = 1.000 lamports) pe interfața compatibilă Solana.
* **Endpoint-uri publice verificate** — Endpoint-uri HTTPS publice pentru RPC de consens, REST, EVM JSON-RPC și SVM JSON-RPC pe ambele rețele, plus [exploratorul public de blocuri](https://explore.qore.network). Vezi [Rețele](/appendix/networks).
* **Descărcări** — Pachete binare de nod versionate, geneza mainnet-ului și snapshot-uri proaspete de date ale chain-ului (cu sume de control SHA-256) publicate la [download.qore.host](https://download.qore.host).
* **Semnare post-cuantică deterministă în tot stack-ul client** — `@qorechain/pqc` 0.1.1 semnează ML-DSA-87 în mod determinist (FIPS-204 §3.4) în toate cele șase legături de limbaj (language bindings), potrivindu-se cu ceea ce acceptă chain-ul; `@qorechain/wallet-adapter` 0.1.2 se bazează pe aceasta pentru semnarea tranzacțiilor hibride.
* **Ghid pentru integratori** — Noul [Ghid pentru exchange-uri și integratori](/developer-guide/exchange-integration) acoperă depuneri, retrageri și operațiuni de nod pe cele trei interfețe.

## v3.1.81 — Unificarea QOR nativ pe SVM

**Focus lansare:** QOR nativ ca activ de prim rang pe interfața compatibilă Solana.

* **QOR nativ pe SVM** — Runtime-ul SVM afișează acum direct soldul QOR nativ al contului (în lamports), în loc să urmărească un sold separat, specific SVM. `getBalance` și `getSignaturesForAddress` operează asupra fondurilor native, iar transferurile System Program mută QOR nativ.
* **Mapare a adresei SVM** — Adresa SVM a unui cont este derivată din cei 20 de octeți ai contului (completați la dreapta până la 32 de octeți, codificați base58), astfel încât adresele Cosmos, EVM și SVM ale unei chei se referă la aceleași fonduri.

## v3.1.80 — Interogări ale ancorei de stare multilayer

**Focus lansare:** Ancore de decontare lizibile, verificabile offline, pentru rollup-uri.

* **Interogări de citire a ancorei** — Serviciul de interogare `x/multilayer` expune acum `Anchor` (cea mai recentă ancoră de stare pentru un layer) și `Anchors` (istoricul ancorelor unui layer), astfel încât clienții pot prelua ancora de decontare a unui layer și o pot verifica independent.
* **Gateway REST pentru multilayer** — Fiecare interogare multilayer (`params`, `layers`, `layers/{layer_id}`, `anchor/{layer_id}`, `anchors/{layer_id}`, `routing-stats`) este acum disponibilă prin REST, pe lângă gRPC.
* **Chitanțe de decontare sigure cuantic deblocate** — Fiecare ancoră poartă o semnătură **ML-DSA-87 (Dilithium-5)** asupra câmpurilor sale canonice, oferind baza on-chain pentru verificarea offline a chitanțelor de decontare din Rollup Development Kit.

## v3.1.79 — Auto-provizionare validatori pentru rețelele de bridge

**Focus lansare:** Participare turnkey pe rețelele conectate pentru validatorii licențiați.

* **Cadru de driver de rețea** — Un cadru declarativ de driver permite ca un validator QoreChain care deține licența relevantă `validator_<chain>` (sau `qcb_bridge`) să aibă clientul rețelei externe corespunzătoare provizionat, configurat și rulat pe același nod, sub orchestrarea QoreChain — doar după activarea licenței.
* **Drivere pentru toate cele 37 de rețele de bridge** — Acoperirea se întinde pe fiecare rețea conectată, clasificată după modelul de participare (validator permisionless, capat/ales/prin admitere, nod complet L2 și roluri non-staking/listă de încredere). Stake-ul și cheile de semnare pentru rețeaua externă rămân furnizate de operator pentru fiecare rețea; QoreChain livrează cadrul și poarta de licență aplicată.

## v3.1.78 — Pregătire pre-deploy

**Focus lansare:** Portofele, bridge-uri, IBC și licențierea funcționează toate la lansare — fără guvernanță post-deploy.

* **Activare fără încredere (trustless) a bridge-ului post-deploy** — O cheie `bridge_admin` (sau deținătorul licenței `qcb_bridge`) poate activa bridge-ul oricărui chain conectat printr-o singură tranzacție semnată (`tx bridge update-chain-config` / `set-verifier-bootstrap`) — setând adresa contractului, confirmările, arhitectura, statusul, verificatorul activ și rădăcina de încredere a verificatorului — fără propunere de guvernanță sau upgrade de chain.
* **Poartă de licență pentru rețeaua de validatori** — Orchestratorul aplică acum licența `validator_<chain>` / `qcb_bridge` (fail-closed) înainte de a porni orice client de rețea externă.
* **Pachete de integrare portofel** — `@qorechain/wallet-adapter` și `@qorechain/connect` publicate pe npm (v0.1.0), adăugând înregistrarea rețelei MetaMask dintr-un singur apel (EIP-3085, QOR nativ cu **18 zecimale** pe rail-ul EVM) și configurarea prețului gazului pentru Keplr.
* **Relayer turnkey pentru IBC** — Configurație de relayer gata de rulat și unelte de bootstrap al canalelor pentru cei opt parteneri IBC, astfel încât canalele să pornească post-deploy fără o configurare personalizată.

## v3.1.77 — Endpoint-uri REST pentru bridge și burn

**Focus lansare:** Acces REST doar-citire pentru modulele cross-chain și de supply.

* **Endpoint-uri REST pentru bridge** — Endpoint-uri HTTP de interogare doar-citire pentru modulul de bridge, expunând starea bridge-ului prin REST standard, pe lângă gRPC.
* **Endpoint-uri REST pentru burn** — Endpoint-uri HTTP de interogare doar-citire pentru modulul de burn, făcând datele de distribuție a taxelor și de supply interogabile prin REST standard.

## v3.1.76 — Modernizarea toolchain-ului SVM

**Focus lansare:** Actualizarea compatibilității Solana Virtual Machine.

* **Suport pentru programe cu toolchain-ul curent** — Execuția SVM a fost modernizată astfel încât programele construite cu toolchain-ul Solana curent rulează pe runtime-ul SVM al QoreChain.

## v3.1.75 — SVM JSON-RPC implicit

**Focus lansare:** RPC compatibil Solana disponibil din start.

* **JSON-RPC compatibil Solana** — Serverul SVM JSON-RPC este acum activat implicit (port **8899**) și pornit automat odată cu nodul, oferind o interfață RPC compatibilă Solana pentru uneltele SVM.

## v3.1.74 — Preset-uri de profil pentru rollup

**Focus lansare:** Utilizabilitatea și decontarea Rollup Development Kit.

* **Aplicarea preset-ului de profil** — Crearea unui rollup aplică acum preset-ul profilului selectat (DeFi, gaming, NFT, enterprise sau complet personalizat), astfel încât rollup-urile noi moștenesc valori implicite potrivite pentru cazul lor de utilizare.
* **Decontare optimistă** — Calea de decontare optimistă (trimitere în lot și contestare) este operațională de la un capăt la altul.

## v3.1.73 — Baseline hash post-cuantic

**Focus lansare:** Finalizarea baseline-ului criptografic post-cuantic implicit.

* **SHAKE-256 hash implicit** — SHAKE-256 (familia SHA-3) este adoptat ca hash implicit al aplicației, finalizând baseline-ul post-cuantic implicit format din semnături **ML-DSA-87 (Dilithium-5)**, încapsulare de chei **ML-KEM-1024** și hashing **SHAKE-256**.

## v3.1.72 — Stabilitate și mentenanță

**Focus lansare:** Mentenanță de rutină a stabilității și a pipeline-ului de build.

* **Îmbunătățiri de stabilitate** — Mentenanță internă de stabilitate, dependințe și pipeline de build, fără schimbări de comportament vizibile extern.

## v3.1.71 — Semnături hibride PQC aplicate implicit

**Focus lansare:** Securitate post-cuantică activă implicit pe calea de tranzacții Cosmos.

* **Semnături hibride obligatorii implicit** — Semnăturile hibride post-cuantice sunt acum aplicate implicit pe calea de tranzacții Cosmos: fiecare tranzacție poartă o semnătură post-cuantică **ML-DSA-87 (Dilithium-5)** alături de semnătura clasică **secp256k1**.
* **Aplicare controlată prin guvernanță** — Modul de aplicare rămâne controlat prin guvernanță, cu valoarea implicită setată la **obligatoriu**.

## v3.1.70 — Consolidare pentru producție

**Focus lansare:** Consolidare pentru producție și optimizarea consensului pentru mainnet-ul live.

* **Optimizarea consensului PRISM** — Îmbunătățiri continue ale stratului de optimizare prin învățare prin întărire PRISM pentru ajustarea adaptivă a parametrilor în condiții de rețea live, cu controale de siguranță de tip circuit-breaker.
* **Performanță și stabilitate** — Rafinări de throughput, latență și utilizare a resurselor pe validatori și noduri complete.
* **Unelte operaționale** — Ergonomie îmbunătățită de monitorizare, interogare și operare a nodurilor pentru operatorii de mainnet.
* **Aliniere Tokenomics v2.1** — Mecanica distribuției taxelor și a emisiunii aliniată cu modelul economic de supply fix și emisiune finită.

## v3.0.0 — Geneza mainnet-ului

**Focus lansare:** Lansarea mainnet-ului și evenimentul de generare a token-ului.

* **Geneza mainnet-ului** — Mainnet-ul QoreChain (`qorechain-vladi`, ID chain EVM 9801) a fost lansat pe **7 iunie 2026**, cu evenimentul de generare a token-ului (TGE) la geneză.
* **Distribuție a taxelor în cinci direcții** — Distribuția taxelor de protocol pe validatori, burn, trezorerie, stakeri și light node-uri (**37 / 30 / 20 / 10 / 3**), adăugând o cotă dedicată pentru light node-uri.
* **AMM on-chain** — Modul nativ de automated-market-maker (`x/amm`) pentru pool-uri de lichiditate și swap-uri on-chain.
* **Licențiere pe chain** — Modul de licențiere on-chain (`x/license`) pentru înregistrarea și gestionarea drepturilor de protocol.
* **Paradigme de decontare consolidate** — Modurile de decontare RDK finalizate ca optimist, zk, based și sovereign.

## v1.4.0 — Extindere pre-mainnet

**Focus lansare:** Acoperire cross-chain și stabilizare release-candidate înaintea mainnet-ului.

* **Acoperire cross-chain extinsă** — Conectivitate IBC și de bridge suplimentară către un set mai larg de rețele externe.
* **Participarea light node-urilor** — Introducerea light node-urilor și a bazei pentru recompensele lor din cota de taxe.
* **Consolidare release-candidate** — Testare, audituri și stabilizare extinse pe toate modulele de bază, în pregătirea genezei mainnet-ului.

## v1.3.0 — Rollup Development Kit

**Focus lansare:** Infrastructură nativă de rollup pentru desfășurări de rollup sovereign și cu securitate partajată.

* **Modulul x/rdk** — Rollup Development Kit complet cu patru paradigme de decontare: optimist, zk, based și sovereign
* **5 profiluri preset** — Șabloane de rollup preconfigurate pentru cazurile de utilizare DeFi, gaming, NFT, enterprise și complet personalizat
* **Disponibilitate nativă a datelor** — Strat de disponibilitate a datelor (DA) on-chain, cu stocare de blob-uri, gestionarea retenției și ciclu de viață de pruning
* **Auto-finalizare EndBlocker** — Finalizare automată a loturilor la expirarea ferestrei de contestare, fără intervenția operatorului
* **Selecție de profil asistată de AI** — Interogarea `suggest-profile` recomandă o configurație optimă de rollup pe baza cazului de utilizare intenționat
* **Integrare multilayer** — Rollup-urile se înregistrează ca layere în arhitectura multilayer, moștenind mecanicile de rutare, ancorare și contestare
* **Ciclu de viață escrow bancar** — Stake-ul operatorului este ținut în escrow pe durata operării rollup-ului și eliberat la o oprire curată sau confiscat în caz de slashing

## v1.2.0 — IBC și bridge-uri

**Focus lansare:** Conectivitate cross-chain și abstractizări avansate de cont.

* **25 de conexiuni cross-chain** — 8 canale IBC și 17 conexiuni QoreChain Bridge (QCB) către rețele externe
* **Modulul x/babylon** — Integrare de restaking BTC, permițând deținătorilor de Bitcoin să participe la securitatea prin staking a QoreChain
* **Modulul x/abstractaccount** — Cadru de conturi inteligente cu reguli de cheltuire programabile, chei de sesiune și logică de autentificare personalizată
* **Modulul x/fairblock** — Criptare prin identitate cu prag (tIBE) pentru criptarea tranzacțiilor rezistentă la MEV
* **Modulul x/gasabstraction** — Plata gazului cu mai multe token-uri, suportând QOR nativ, USDC bridge-uit prin IBC și ATOM bridge-uit prin IBC
* **Prioritizare TX pe 5 lane-uri** — Lane-uri de tranzacții ordonate după prioritate: sistem, guvernanță, staking, bridge și general
* **Configurații de relayer IBC** — Configurări de relayer preconfigurate pentru toate canalele IBC suportate
* **Integrare bridge-la-burn** — Taxele de bridge sunt rutate prin distribuția de taxe a modulului de burn

## v1.1.0 — Semnături hibride PQC

**Focus lansare:** Securitate criptografică post-cuantică și agilitate a algoritmilor.

* **Semnături duale secp256k1 (ECDSA) + ML-DSA-87** — Fiecare tranzacție poartă atât o semnătură clasică, cât și una post-cuantică, verificate în lanțul AnteHandler
* **3 moduri de aplicare** — Aplicare configurabilă a semnăturii hibride: dezactivat (modul 0), permisiv (modul 1, PQC opțional), obligatoriu (modul 2, PQC necesar)
* **Auto-înregistrare** — Cheile publice PQC sunt înregistrate automat la prima tranzacție hibridă, eliminând un pas separat de înregistrare
* **Fundație de hash SHAKE-256** — Toate operațiunile de hashing legate de PQC folosesc SHAKE-256 (familia SHA-3) pentru derivarea de adrese rezistentă cuantic
* **Interfețe de atestare TEE** — Suport pentru atestare Trusted Execution Environment, pentru a demonstra integritatea generării cheilor PQC
* **Cadru de agilitate a algoritmilor** — Registru de algoritmi conectabil (pluggable), permițând adăugarea de algoritmi PQC viitori prin guvernanță, fără upgrade de chain

## v1.0.0 — Geneză (motor de tokenomics)

**Focus lansare:** Lansarea inițială a protocolului, cu tokenomics complet, execuție multi-VM și operațiuni asistate de AI.

* **Modulul x/burn** — Mecanism de ardere a taxelor pe mai multe canale, cu o distribuție în patru direcții pe validatori, burn, trezorerie și stakeri
* **Modulul x/xqore** — Derivativ de staking pentru guvernanță, cu penalități pe niveluri pentru deblocare anticipată și redistribuire prin rebase PvP
* **Modulul x/inflation** — Emisiune bazată pe epoci, cu declin anual, guvernată de modelul economic cu emisiune finită
* **Stratul de consens PRISM** — Optimizare prin învățare prin întărire (PPO) pentru ajustarea dinamică a parametrilor chain-ului, cu controale de siguranță de tip circuit-breaker
* **CPoS cu trei pool-uri** — Classified Proof-of-Stake cu pool-uri de validatori Emerald, Sapphire și Ruby, ponderate după scoruri de reputație
* **Guvernanță QDRW** — Sistem de ponderare dinamică a recompenselor (Dynamic Reward Weighting), permițând ajustări aprobate prin guvernanță ale distribuției recompenselor între pool-uri
* **Runtime-uri EVM + CosmWasm + SVM** — Trei medii de execuție concurente: motorul EVM QoreChain, contractele inteligente CosmWasm și Solana Virtual Machine
* **Bridge cross-VM** — Transmitere de mesaje și transferuri de active între runtime-urile EVM, CosmWasm și SVM în cadrul aceluiași bloc
* **Criptografie post-cuantică** — Semnare rezistentă cuantic, susținută de o bibliotecă PQC de înaltă performanță
* **QCAI** — Analiză euristică on-chain, cu un sidecar opțional off-chain pentru detectarea fraudei, estimarea taxelor și optimizarea rețelei
* **Desfășurare containerizată** — Desfășurare completă de testnet multi-validator, cu serviciu sidecar și indexer de blocuri
* **Indexer de blocuri** — Ascultător de blocuri (block listener) cu stocare persistentă pentru interogări istorice și analiză
