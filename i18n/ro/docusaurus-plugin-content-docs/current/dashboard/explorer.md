---
slug: /dashboard/explorer
title: Explorer
sidebar_label: Explorer
sidebar_position: 2
---

# Explorer

**Explorer**-ul este fereastra Dashboard-ului către lanț. Folosește-l pentru a căuta blocuri, tranzacții, adrese și validatori și pentru a urmări activitatea rețelei în timp real. Explorer-ul este doar pentru citire — nu este necesară conectarea unui portofel pentru a-l explora. În interiorul Dashboard-ului, vizualizarea mainnet-ului necesită autentificare; un explorer public separat, care nu necesită niciun cont, este disponibil la [explore.qore.network](https://explore.qore.network) (este o aplicație diferită, cu propriul comutator Mainnet/Testnet).

## Pagina de prezentare generală

Deschide **Explorer** din Dashboard pentru a vedea o imagine live a rețelei:

- **Starea rețelei** — ID-ul lanțului, starea curentă și un indicator al stării de securitate.
- **Activitatea blocurilor** — cea mai recentă înălțime de bloc, timpul mediu pe bloc și blocurile produse astăzi.
- **Ofertă** — totalul de QOR pus în staking (bonded), rata de bonding și oferta circulantă.
- **Statistici principale** — numărul total de tranzacții, validatorii activi și totali și numărul total de adrese.
- **Cele mai recente blocuri** — o listă live cu înălțimea, ora, numărul de tranzacții și proponentul fiecărui bloc.
- **Cele mai recente tranzacții** — o listă live cu hash-ul, tipul, blocul, suma și expeditorul fiecărei tranzacții.

Apasă pe orice rând de bloc sau de tranzacție pentru a-i deschide pagina de detalii. Un buton de reîmprospătare pe fiecare listă aduce cele mai noi intrări.

## Căutare

Caseta de căutare din partea de sus a Explorer-ului acceptă oricare dintre următoarele și te direcționează automat către pagina potrivită:

- O **adresă** (`qor1...`)
- Un **hash de tranzacție**
- O **înălțime de bloc** (un număr)

## Detaliile tranzacției

O pagină de tranzacție afișează hash-ul, starea, suma, expeditorul și destinatarul (ambele accesibile printr-un clic), comisionul, înălțimea blocului, tipul tranzacției și memo-ul, dacă există. Poți copia hash-ul și poți comuta la o vizualizare brută a întregii tranzacții pentru o inspecție mai detaliată.

Pagina arată și ce a protejat tranzacția și face doar afirmații pe care lanțul le susține:

* **PQC Verified.** O tranzacție de pe lane-ul nativ afișează acest card doar dacă a reușit **și** lanțul însuși a verificat semnătura ei hibridă, inclusiv partea ML-DSA-87 (lanțul înregistrează un eveniment de verificare pentru ea). O tranzacție eșuată sau una fără o semnătură hibridă verificată afișează în schimb securitate standard; Explorer-ul nu presupune că o semnătură este post-cuantică.
* **Authorised by a PQC window.** O tranzacție trimisă dintr-un portofel EVM poartă o semnătură secp256k1 obișnuită, deci nu este niciodată etichetată „PQC Verified". Dacă expeditorul avea deschisă o [fereastră de autorizare EVM](/developer-guide/evm-development#evm-window) în momentul trimiterii, pagina spune că a fost **autorizată de o fereastră PQC** și afișează un link **Window opened by** către tranzacția semnată post-cuantic care a deschis fereastra. Se aplică începând de la înălțimile de activare ale funcției de fereastră (testnet 5.920.000; mainnet 2.981.742).

Aceste etichete sunt specifice Explorer-ului din Dashboard de la dashboard.qorechain.io/explorer. Explorer-ul separat de la explore.qore.network este o aplicație diferită și nu aplică aceste reguli.

## Detaliile blocului

O pagină de bloc afișează înălțimea, marcajul de timp, proponentul, hash-ul, numărul de tranzacții, gazul consumat și lista tranzacțiilor pe care le conține, împreună cu numărul său de semnături. Blocurile nu poartă nicio etichetă post-cuantică: sunt semnate cu cheile de consens ale validatorilor, iar protecția post-cuantică este afișată per tranzacție, nu per bloc. Butoanele „anterior" și „următor" îți permit să parcurgi lanțul bloc cu bloc.

## Detaliile adresei

O adresă QoreChain este un singur cont cu trei codificări — Native (`qor1...`), EVM (`0x...`) și SVM (base58) — iar pagina adresei reunește activitatea de pe toate cele trei căi într-o singură vizualizare a acelei identități unice.

Pagina afișează adresa cu un cod QR scanabil, soldul său de QOR, numărul de tranzacții și totalurile transferurilor primite și trimise. Mai jos se află istoricul combinat al tranzacțiilor adresei pe căile Native, EVM și SVM — transferuri, implementări de contracte, înregistrări de chei PQC, swap-uri, revendicări de la faucet și altele — fiecare cu suma, ora și starea sa. Poți copia adresa, poți descărca codul său QR și poți deschide orice tranzacție pentru detalii.

## Validatori {#validators}

Vizualizarea validatorilor listează validatorii rețelei, cu carduri rezumative pentru numărul de validatori activi, totalul de QOR pus în staking și sănătatea consensului. Tabelul afișează pentru fiecare validator rangul, numele (moniker), puterea de vot, comisionul și starea (de exemplu activ sau sancționat/jailed), plus un indicator post-cuantic. O casetă de căutare filtrează după numele sau adresa validatorului. Pentru a delega către un validator, consultă [Staking și Validatori](/dashboard/staking-and-validators).

:::note Lista de validatori a Dashboard-ului poate afișa setul celeilalte rețele
Folosește [explore.qore.network](https://explore.qore.network) pentru lista autoritară de validatori pe fiecare rețea.
:::

## Explorer independent {#standalone-explorer}

Același Explorer este servit fără Dashboard la [explore.qore.network](https://explore.qore.network): anonim, doar explorer, cu linkuri scurte precum `/tx/…`, `/block/…`, `/address/…` și `/validators`. Se deschide implicit pe mainnet.
