---
slug: /qorex/developer-mode
title: Modul dezvoltator
sidebar_label: Modul dezvoltator
sidebar_position: 9
---

# Modul dezvoltator

Modul dezvoltator este un comutator din **Setările** QoreX. Este **dezactivat implicit**. Cât timp este activ, QoreX arată un set de unelte pentru cei care construiesc pe **QORE**CHAIN: inspectoare care citesc rețeaua, un loc în care să simulezi și să decodifici tranzacții, unelte pentru contracte și rollup-uri, semnare offline și o cale de a verifica tranzacțiile propuse de agenți AI.

Modul dezvoltator nu schimbă nicio regulă de semnare. Orice semnează îți arată în continuare ce semnează și așteaptă aprobarea ta, exact ca înainte.

## Inovații {#innovations}

- **Fiecare unealtă citește sau cere mai întâi verificarea.** Inspectoarele doar citesc. Uneltele care pot semna arată o verificare decodificată și așteaptă aprobarea ta.
- **Cifre exacte din rețea.** Inspectoarele arată ce raportează lanțul însuși: versiunea lui, funcțiile lui, cheile înregistrate ale contului tău, fereastra ta EVM.
- **Erori în cuvinte simple.** Decodorul de erori transformă o eroare brută din rețea într-o propoziție și spune ce să faci mai departe.
- **Agenții AI propun, tu decizi.** Un agent poate citi ce permiți și poate propune o tranzacție. QoreX o verifică și o simulează, iar tu o aprobi sau o respingi în fereastra normală de aprobare. Niciun agent nu poate semna.

## Cum îl activezi {#how-to-use}

- **Aplicația mobilă (iPhone și Android):** deschide **Setări** și activează **Mod dezvoltator**. În bara de jos apare un tab **Dezvoltator** cu o pictogramă de cod (`</>`). Deschide-l ca să vezi uneltele. Dezactivarea setării ascunde din nou tabul.
- **Extensia de browser:** în popup, atinge de șapte ori numărul versiunii din partea de jos. În popup apare o secțiune **Mod dezvoltator**, cu un buton **Unelte pentru dezvoltatori**. Butonul deschide o pagină cu aceleași grupe ca tabul din aplicație. Aceeași secțiune are **Oprește modul dezvoltator**.

Aceeași secțiune conține comutatorul de rețea. În aplicație este **Folosește testnet (dezvoltatori)** în Setări, în extensie **Comută pe testnet (diana)**. Vezi [Funcții de testnet](/qorex/testnet-features) pentru ceea ce există doar pe testnet.

Uneltele sunt aceleași în aplicație și în extensie, cu excepția cazurilor în care o unealtă spune altceva. Sunt grupate astfel.

## Inspectare {#inspect}

Doar citire, pe mainnet și testnet. Nimic de pe aceste ecrane nu semnează și nu trimite.

### Inspector de rețea și capabilități

Arată pe ce rețea ești și ce acceptă: chain id-ul, versiunea nodului, ultimul bloc, cea mai recentă actualizare aplicată și oricare actualizare programată, funcțiile de protocol pe care le raportează lanțul (activate, pregătite sau neactivate), chain id-ul lane-ului EVM, dacă lane-ul SVM execută sau este închis, parametrii între VM-uri și cei post-cuantici și câte canale IBC și rute de bridge listează rețeaua. O a doua parte, **Acest portofel**, arată versiunea ta de QoreX, build-ul (aplicație sau extensie) și metodele de semnare și modul de simulare pe care le folosește acest build.

Cum se folosește: deschide **Inspector de rețea și capabilități**. Atinge **Reîmprospătează** ca să citești din nou. Folosește **Copiază** lângă o valoare ca să o copiezi.

### Inspector de cont

Arată contul activ: dacă este un cont Cosmos (coin 118) sau un cont unificat (coin 60), slotul și indicii de derivare, adresele lui pe fiecare lane (nativ `qor1...`, EVM `0x...`, cheia SVM) și cheile publice. Se arată doar informații publice; nimic secret nu iese din seif.

Cum se folosește: deschide **Inspector de cont**, apoi atinge **Arată adresele și cheile publice** (QoreX îți poate cere să deblochezi).

### Inspector PQC

Arată cheia ML-DSA-87 înregistrată pe lanț pentru contul tău: algoritmul, înălțimea la care a fost înregistrată, SHA-256 al cheii publice, dimensiunea ei, dacă regulile lanțului încă o acceptă și dovada de posesie. Apoi poate compara acea cheie cu cea de pe acest dispozitiv și spune dacă se potrivesc (cheia canonică, o derivare mai veche sau o rotire numerotată). Are și un tabel **Ce protejează o operațiune**: pentru o trimitere nativă, o tranzacție EVM, o tranzacție SVM, o trimitere IBC și o trimitere pe un lanț extern, ce semnătură este post-cuantică și care este clasică.

Cum se folosește: deschide **Inspector PQC** ca să citești cheia de pe lanț, apoi atinge **Compară cu cheia acestui dispozitiv** pentru a rula comparația. Dacă lanțul refuză cheia înregistrată, ecranul spune că trebuie înregistrată din nou.

### Inspector fereastră EVM

Arată dacă o fereastră EVM este activă pentru contul tău, înălțimile și momentele aproximative la care a fost deschisă și expiră, câte tranzacții și câtă valoare au fost folosite și au rămas și ce permite (doar transferuri de QOR sau apeluri și transferuri; destinatarii și contractele permise). Deschiderea și închiderea unei ferestre se fac pe ecranul ferestrei EVM, nu aici. Vezi [Securitate și recuperare](/qorex/security-and-recovery#evm-window).

Cum se folosește: deschide **Inspector fereastră EVM**. Dacă spune că o fereastră "nu s-a putut citi", asta nu este același lucru cu a nu avea niciuna.

## Tranzacții {#transactions}

Mainnet și testnet, cu excepția cazurilor în care o unealtă spune altceva.

### Inspector de tranzacții

Lipește un hash de tranzacție (QoreChain sau EVM cu `0x`) ori o cerere brută: un SignDoc JSON, un TxRaw base64, un JSON de tranzacție EVM sau o cerere de dApp. QoreX decodifică fiecare mesaj, arată cine semnează, cine primește, fondurile mutate, comisionul, memo-ul și permisiunile cerute și spune dacă semnătura post-cuantică este atașată. Pentru o tranzacție deja în rețea arată și rezultatul, gazul folosit și evenimentele. Un tip de mesaj pe care QoreX nu îl poate citi apare ca necunoscut, cu octeții lui bruți; QoreX nu ghicește. Cererile sunt citite pe dispozitivul tău și nu sunt trimise niciodată.

Cum se folosește: deschide **Inspector de tranzacții**, lipește, atinge **Inspectare**.

### Atelier de simulare

Lipește mesaje QoreChain ca JSON sau o tranzacție EVM, iar QoreX întreabă rețeaua ce ar face cu ea. Nimic nu se semnează și nu se trimite. Vezi dacă ar reuși, gazul pe care l-ar folosi și comisionul, comisionul unic de înregistrare a cheii post-cuantice dacă se aplică, modificările de active pentru contul tău și o listă cu ce nu poate arăta simularea (de exemplu starea proprie a unui contract sau pașii între VM-uri care rulează într-un bloc ulterior). Erorile din rețea sunt decodificate în cuvinte simple, cu o sugestie pentru pasul următor, de **Decodorul de erori** integrat: lipește un jurnal brut, un JSON de rezultat sau un mesaj de eroare și atinge **Decodează**.

Cum se folosește: deschide **Atelier de simulare**, alege **Mesaje QoreChain** sau **Tranzacție EVM**, lipește, atinge **Simulează**.

### Taxe și sponsorizare

Arată prețul minim al gazului pe lanț, cât plătește QoreX pe unitate de gaz, costul acțiunilor uzuale (trimitere, staking, deschiderea unei ferestre EVM, trimitere IBC), dacă următoarea tranzacție plătește și înregistrarea unică a cheii și alocările de comisioane pe care le-ai primit și le-ai oferit, cu un verdict pentru fiecare: ar plăti sau de ce este refuzată (expirată, consumată, tip de mesaj greșit). QoreX își plătește singur comisioanele și nu numește niciodată un sponsor de comisioane.

Cum se folosește: deschide **Taxe și sponsorizare**; citește la deschidere.

### Spațiu de lucru testnet

Unelte pentru construit pe testnet, care nu ating niciodată mainnetul:

- **Conturi doar pentru testnet.** Un cont creat din fraza ta de recuperare, pe care QoreX nu îl lasă niciodată să semneze pe mainnet și îl ascunde cât timp mainnetul este activ. Atinge **Creează un cont doar pentru testnet**.
- **Faucet.** Copiază adresa ta de testnet și atinge **Deschide faucetul de testnet**. Faucetul este în dashboard și te autentifici acolo ca să îl folosești. Vezi [Funcții de testnet](/qorex/testnet-features#get-test-qor).
- **Resetează conexiunile.** **Resetează toate conexiunile** deconectează fiecare site, refuză fiecare cerere aflată încă în așteptare și uită contractele pentru care site-urile ți-au cerut recent să semnezi. Atinge de două ori pentru confirmare.

Disponibilitate: ecranul se deschide pe ambele rețele; conturile doar pentru testnet și faucetul sunt pentru testnet.

### Jurnal de cereri

Listează ce au cerut site-urile, ce ai decis și ce a răspuns rețeaua. Este păstrat doar pe dispozitivul tău și doar cât timp modul dezvoltator este activ, pentru cel mult 500 de intrări și 7 zile. Nu înregistrează niciodată fraza de recuperare, cheile sau parolele și nici ce s-a semnat (doar tipul și un hash). Îl poți păstra după închiderea browserului, îl poți șterge sau poți folosi **Exportă un fișier de depanare** ca să îl atașezi la un raport de eroare; fișierul este verificat să nu conțină fraze și chei înainte de a fi scris.

Cum se folosește: deschide **Jurnal de cereri**. Activează mai întâi modul dezvoltator, altfel nu se înregistrează nimic.

## Contracte și rollup-uri {#contracts}

### Interacțiune cu contracte

Apelează contracte EVM, CosmWasm (QoreChain Native) și SVM cu propriul tău cont. Citirile sunt gratuite; orice modifică starea trece prin aceeași aprobare ca o cerere de dApp, care o simulează și adaugă semnătura post-cuantică.

Cum se folosește:

1. Deschide **Interacțiune cu contracte** și alege **Tip de contract**.
2. EVM: introdu adresa contractului și încarcă **ABI (JSON)**. Fiecare funcție devine un formular tipizat, etichetat read, write sau payable. QoreX refuză o valoare pentru o funcție care nu poate primi QOR.
3. CosmWasm: introdu adresa contractului, încarcă opțional o schemă din `cosmwasm-schema`, scrie **Mesaj (JSON)** și, dacă e nevoie, fondurile (scrise ca `1000uqor`). Folosește **Interogare** ca să citești sau **Verifică execuția** ca să vezi exact ce se va semna.
4. SVM (doar testnet): introdu id-ul programului și încarcă un **IDL Anchor (JSON)**. QoreX semnează tranzacția Solana cu propria ta cheie Solana și o retransmite cu contul tău QoreChain.
5. Atinge **Simulează** ca să vezi ce spune rețeaua că ar face apelul, apoi **Verifică și semnează** (sau **Continuă la aprobare**) și aprobă în fereastra de aprobare.

Poți salva contracte per rețea, le poți exporta într-un fișier și le poți importa din nou. Un panou **Informații contract** arată code id-ul, creatorul, eticheta și adminul unui contract CosmWasm.

### Aprobare implementare

Aprobă o implementare pregătită de unealta ta din linia de comandă, de IDE sau de agent. QoreX calculează singur hashul codului, decodifică argumentele constructorului și verifică cine poate actualiza contractul înainte să se semneze ceva. Refuză dacă hashul declarat de unealtă nu se potrivește cu octeții. Avertizează despre tiparele de proxy actualizabil, despre un admin sau o autoritate de actualizare care nu este contul tău și despre un contract fără admin, care nu poate fi migrat niciodată. Gestionează implementări de contracte EVM și contracte CosmWasm instanțiate dintr-un cod deja stocat. QoreX nu încarcă cod CosmWasm, iar implementarea programelor SVM nu este acceptată în această versiune. Încărcările de cod pe o rețea care le trimite prin guvernanță nu pot fi semnate dintr-un portofel.

Cum se folosește: deschide **Aprobare implementare**, lipește JSON-ul cererii de implementare din unealta ta (atinge **Arată formatul** ca să îl vezi), atinge **Verifică**, citește verificarea, apoi **Aprobă și semnează**.

### Profiluri de rollup și appchain

Adaugă un rollup sau un appchain construit cu RDK-ul QoreChain. QoreX îi interoghează nodul în timp real înainte să păstreze profilul și arată fiecare verificare: chain id-ul REST și RPC, prefixul de adresă, chain id-ul EVM și rollupul pe QoreChain. Un profil se poate deconta pe mainnet sau pe testnet. Cât timp un profil este activ, fiecare ecran de verificare întreabă ce rețea semnează, iar semnarea pentru un nod care nu își confirmă chain id-ul este refuzată.

Cum se folosește: deschide **Profiluri de rollup și appchain**, atinge **Adaugă un profil**, completează numele, chain id-ul și endpoint-urile, apoi **Verifică și adaugă**. Folosește **Activează** sau **Nu mai folosi** ca să comuți și **Verifică din nou** oricând.

## Alte mașini virtuale {#other-vms}

### Solana pe QoreChain (doar testnet)

Lane-ul SVM pe **testnetul** QoreChain: ferestre SVM și retransmiterea unei tranzacții Solana semnate. Această unealtă este afișată doar cât timp testnetul este activ; pe mainnet, lane-ul SVM nu este deschis și nimic de aici nu poate fi folosit. Detaliile și pașii sunt la [Funcții de testnet](/qorex/testnet-features#solana-on-qorechain).

### Apel între VM-uri

Compune un apel din contul tău către un contract de pe alt lane de execuție al QoreChain însuși (EVM, CosmWasm sau SVM). Nimic nu părăsește QoreChain: acesta nu este un bridge către alt lanț. Formularul cere lane-ul țintă, contractul sau programul, payloadul și, doar pentru CosmWasm, QOR de atașat.

Tu alegi **Când rulează**, iar QoreX o spune clar:

- **Acum, în această tranzacție (atomic):** se întâmplă totul sau nimic.
- **Pus în coadă pentru un bloc ulterior (neatomic):** rulează într-un bloc ulterior. Dacă eșuează sau expiră, ce a făcut această tranzacție rămâne făcut.

Cum se folosește: deschide **Apel între VM-uri**, completează formularul, atinge **Simulează** ca să vezi pașii și comisionul, apoi **Semnează și trimite**. QoreX semnează doar apeluri pe care le-a simulat. Dacă rețeaua are apelurile între VM-uri dezactivate, ecranul spune acest lucru și nu oferă nimic de semnat. Pe mainnet, apelurile între VM-uri sunt închise astăzi, deci acolo așteaptă-te la acel mesaj.

### Urmărește un apel între VM-uri

Lipește hashul unei tranzacții (QoreChain sau `0x` pentru EVM), iar QoreX îi citește ramurile între VM-uri. O ramură pusă în coadă apare ca în așteptare, executată, eșuată sau expirată. Ramurile unei tranzacții EVM au rulat în interiorul tranzacției însăși și se citesc din rezultatul ei. Înregistrările din coadă finalizate sunt șterse de rețea după un timp, iar urmărirea spune acest lucru când înregistrarea nu mai există.

Cum se folosește: deschide **Urmărește un apel între VM-uri**, lipește hashul, atinge **Urmărește**.

## Semnare și agenți {#signing-and-agents}

### Permisiuni și sesiuni

Listează tot ce contul tău a permis altor adrese să facă, cu limitele pe care le impune lanțul însuși, și îți permite să revoci fiecare dintre ele: **Autorizări**, **Alocări de comisioane**, **Chei asociate** și **Ferestre de acces**. Fiecare arată ce poate face, limita și când expiră (sau că nu expiră niciodată). **Revocă** trimite tranzacția de revocare; **Închide fereastra** închide o fereastră EVM.

Poți, de asemenea, să dai unei aplicații sau altei adrese o sesiune limitată cu **Sesiune nouă**: să apeleze doar contractele listate, să trimită până la o sumă stabilită, să facă staking la validatorii aleși sau să voteze și să revendice recompense, pentru un număr de zile, plătindu-i opțional comisioanele până la o limită. O **Previzualizare** spune exact ce va putea face beneficiarul și listează separat ce nu impune lanțul, lucru despre care QoreX te va întreba de fiecare dată.

### Spațiu de lucru offline și multisig {#multisig}

Pregătește orice tranzacție ca fișier în formatul de linie de comandă al lanțului, verifică fiecare semnătură dintr-un fișier multisig sau semnează pe un dispozitiv și trimite în rețea de pe altul.

- **Semnare offline:** pregătește o tranzacție pe un dispozitiv conectat (pornește de la un șablon precum Send, Delegate sau Call a contract ori lipește mesajele), du fișierul sau codul QR la QoreX-ul care deține cheia, verifică, **Semnează**, apoi **Trimite în rețea** de pe oricare dispozitiv.
- **Verifică semnăturile:** deschide tranzacția și orice fișiere de semnătură. Pentru fiecare membru multisig, QoreX arată dacă are o cheie post-cuantică înregistrată și dacă runda 1 (post-cuantică) și runda 2 (clasică) sunt valide, depășite, invalide sau lipsă și care rundă încă lipsește.

Verificarea arată întotdeauna memo-ul și fiecare monedă de comision, iar QoreX semnează doar octeții pe care i-ai verificat. Refuză un comision într-o altă monedă decât QOR, un comision mult peste prețul ridicat al gazului din rețea și un comision plătit sau acordat de alt cont. Dacă fișierul se schimbă după verificarea ta, trebuie să îl deschizi și să îl verifici din nou. QoreX nu va trimite în rețea o tranzacție fără semnătura ei ML-DSA-87.

## Agenți AI {#ai-agents}

Agenții AI (propriul tău asistent AI sau o unealtă pe care o rulezi) pot citi conturile pe care le alegi și pot **propune** o tranzacție. Nu pot semna. Modelul este următorul:

1. Tu decizi ce conturi poate vedea un agent și pentru care poate propune. Poți pune pe pauză sau revoca un agent oricând, iar lista **Activitate** arată ce a făcut.
2. QoreX verifică fiecare propunere și o simulează în rețea. O propunere pe care QoreX nu o poate citi sau despre care rețeaua spune că ar eșua nu îți este arătată.
3. Vezi propunerea în fereastra normală de aprobare, marcată ca propusă de un agent AI și nu de un site, și o aprobi sau o respingi. Nimic nu se semnează până nu aprobi.

QoreX nu semnează niciodată tipurile de cereri pe care nicio parte din afară nu le poate solicita, oricine le-ar propune. O limită de propuneri pe oră oprește inundarea, iar doar o singură propunere așteaptă la un moment dat.

Cum se folosește:

- **Aplicația mobilă:** activează modul dezvoltator, deschide **Agenți AI**, apoi lipește JSON-ul propunerii de la agentul tău și atinge **Verifică propunerea** sau deschide un link `qorex://propose`. QoreX nu poate verifica cine a scris o propunere lipită sau un link și spune acest lucru. Verifică și aprobă sau respinge.
- **Extensia de browser (Chrome, Edge, Brave, Firefox):** un agent se conectează printr-un program companion de pe computerul tău, care folosește Model Context Protocol. Acel program nu este încă publicat, așa că partea de extensie nu poate fi folosită încă de public. Când va fi publicat, activezi **Permite conexiuni de la agenți AI pe acest computer**, asociezi agentul cu un cod de unică folosință care expiră în 5 minute și îi alegi conturile.
- **Safari:** indisponibil. Safari nu poate conecta QoreX la programe de pe computerul tău.

## Limite {#limits}

- Modul dezvoltator este pentru cei care construiesc. Dacă doar trimiți, primești și faci staking, nu ai nevoie de el.
- O unealtă care depinde de rețea (inspectoarele, simulatorul, urmăririle) spune "nu s-a putut citi" când rețeaua nu poate fi accesată. Asta nu este același lucru cu a nu exista nimic acolo.
- Uneltele SVM și compozitorul de apeluri între VM-uri depind de ce permite rețeaua. Astăzi, pe mainnet, apelurile SVM și cele între VM-uri sunt închise.
- Extensia de browser are nevoie de atingerea numărului de versiune ca să apară comutatorul; aplicația îl are în Setări.
