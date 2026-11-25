---
slug: /qorex/testnet-features
title: Funcții de testnet
sidebar_label: Funcții de testnet
sidebar_position: 10
---

# Funcții de testnet

:::caution DOAR PE TESTNET
Tot ce se află pe această pagină funcționează **doar pe testnetul QoreChain** (`qorechain-diana`). **Nimic din acestea nu este pe mainnet.** Tokenurile de testnet nu au valoare. Ecranele de mai jos nu apar în QoreX cât timp ești pe mainnet.
:::

QoreX are câteva funcții care sunt mai întâi validate pe testnet. Ele sunt afișate doar cât timp testnetul este activ, iar fiecare ecran spune acest lucru cu un banner **TESTNET: doar tokenuri de test, nu QOR real**.

## Inovații {#innovations}

- **Rețeaua confirmă înainte să semnezi (doar testnet).** Pentru un transfer pe alt lanț, QoreX cere mai întâi rețelei să confirme canalul și contrapartea lui. Dacă nu poate, nu se trimite nimic.
- **Starea reală a rutelor (doar testnet).** Ecranul bridge arată ce spune rețeaua însăși despre fiecare rută și nu oferă nimic din ce ea nu oferă.
- **Tranzacții în format Solana pe QoreChain (doar testnet).** O fereastră SVM pe care o deschizi cu semnătura ta ML-DSA-87 permite propriei tale chei Solana să acționeze în limite stricte.

## Cum ajungi la testnet în QoreX {#reach-testnet}

- **Aplicația mobilă:** deschide **Setări** și activează **Folosește testnet (dezvoltatori)**. Aplicația comută imediat la `qorechain-diana`, fără repornire. Implicit este întotdeauna mainnet. Dezactivează opțiunea ca să revii.
- **Extensia de browser:** atinge de șapte ori numărul versiunii din partea de jos a popupului ca să apară secțiunea **Mod dezvoltator**, apoi atinge **Comută pe testnet (diana)**. În aceeași secțiune, **Revino pe mainnet** te duce înapoi.

Cât timp testnetul este activ, ecranele de mai jos, doar pentru testnet, apar în **Setările** aplicației și în popupul extensiei (**Trimite pe alt lanț** și **Bridge**), iar unealta **Solana pe QoreChain** apare în tabul Dezvoltator sau pe pagina Unelte pentru dezvoltatori. Soldurile de testnet nu au valoare în dolari. dApp-urile nu pot schimba rețeaua; doar tu poți.

## Obține QOR de test {#get-test-qor}

QOR de testnet este gratuit și nu are valoare. Îl obții din [Faucetul din Dashboard](/dashboard/faucet): autentifică-te acolo, copiază adresa ta de testnet din QoreX (unealta pentru dezvoltatori **Spațiu de lucru testnet** are un buton **Copiază adresa** și un buton **Deschide faucetul de testnet**) și cere tokenuri. Vezi și [Conectarea la testnet](/getting-started/connecting-to-testnet) pentru endpoint-urile publice de testnet.

## Trimite pe alt lanț (IBC) {#ibc}

**DOAR PE TESTNET.** Trimite QOR din testnetul QoreChain către testneturile **Cosmos Hub**, **Osmosis**, **Injective**, **Akash** și **Celestia** și adu-l înapoi.

Ce face QoreX pentru tine:

- **Verifică mai întâi ruta.** Înainte să poți semna, QoreX cere rețelei să confirme că canalul este deschis și că duce în continuare la lanțul ales de tine. Dacă acel canal este închis, schimbat sau nu poate fi confirmat, QoreX spune acest lucru și nu trimite nimic.
- **Arată verificarea completă.** Vezi expeditorul, destinatarul de pe celălalt lanț, comisionul de rețea și durata înainte să semnezi.
- **Durata.** Un transfer de test către testnetul Cosmos Hub a ajuns în aproximativ 20 de secunde. QoreX îți spune să te aștepți la circa un minut. Dacă nu este livrat în 10 minute, se întoarce la tine.
- **Ce semnătură.** Un transfer din QoreChain este semnat cu cheia ta hibridă (ML-DSA-87 și secp256k1). Întoarcerea este semnată pe celălalt lanț cu o cheie clasică, așa cum cere acel lanț, iar verificarea spune acest lucru: pe acel lanț, aceste monede sunt protejate doar de o cheie clasică.

### Trimite din QoreChain {#ibc-send}

1. Activează testnetul (vezi [mai sus](#reach-testnet)), deschide **Setări** (extensie: popupul) și atinge **Trimite pe alt lanț**.
2. Alege **Lanțul de destinație** și **Activ** (QOR sau monede sosite prin IBC).
3. Introdu **Sumă**. Câmpul **Receiver** este precompletat cu propria ta adresă pe acel lanț; o poți schimba. QoreX verifică dacă este o adresă validă pentru acel lanț.
4. Atinge **Verifică**, controlează detaliile sub **Verifică înainte de semnare**, apoi **Semnează și trimite**.

### Adu monedele înapoi {#ibc-back}

1. În **Trimite pe alt lanț**, deschide **Adu înapoi pe QoreChain** și atinge **Show my balances** pe lanțul folosit.
2. Alege **Ce aduci înapoi**. Contul de pe acel lanț are nevoie de puțin din moneda proprie a lanțului pentru a plăti comisionul; QoreX îți spune dacă lipsește.
3. Verifică, apoi **Semnează și adu înapoi**. Monedele sunt livrate la propria ta adresă QoreChain.

### Urmărește un transfer {#ibc-track}

**Transferurile tale** listează fiecare transfer și îl urmărește: așteaptă rețeaua, în tranzit, livrat sau întors la tine (cu motivul ori pentru că a expirat). Atinge **Reîmprospătează** ca să citești din nou. Dacă starea nu este încă cunoscută, QoreX spune că livrarea nu este confirmată, în loc să ghicească.

## Ecranul Bridge {#bridge}

**DOAR PE TESTNET.** Ecranul **Bridge** citește din rețea rutele QoreChain Bridge și arată starea reală a fiecărei rute: nedeschisă încă, în pauză, închisă deocamdată, deschisă, deschisă pentru retrageri sau deschisă pentru depuneri. O rută este oferită doar când rețeaua însăși spune că este deschisă.

**Toate rutele sunt închise astăzi pe testnet, deci nu se oferă nimic.** Ecranul este pregătit pentru momentul în care rutele se deschid. Nimic de aici nu este o rută, un activ sau o sumă pe care le poți folosi acum și nimic nu este pe mainnet.

## Solana pe QoreChain {#solana-on-qorechain}

**DOAR PE TESTNET.** Lane-ul SVM rulează tranzacții în format Solana pe QoreChain. Este o unealtă din modul dezvoltator, afișată doar cât timp testnetul este activ. Pe mainnet, lane-ul SVM nu este deschis și nimic de aici nu poate fi folosit.

Ce face unealta:

- **Arată lane-ul.** Dacă lane-ul SVM rulează în rețea și clusterul lui.
- **Arată fereastra ta SVM.** O fereastră permite tranzacțiilor semnate cu cheia ta Solana să cheltuiască din contul tău fără o semnătură ML-DSA-87, în anumite limite. QoreX arată dacă este una deschisă, câte blocuri, tranzacții și QOR au rămas, ce cheie Solana este legată și ce programe admite.
- **Deschide și închide o fereastră.** Deschizi o fereastră alegând ce programe admite (se recomandă să le listezi; **Orice program** vine cu un avertisment), câte blocuri rămâne deschisă (cel mult 17.280), câte tranzacții (cel mult 1.000) și cel mai mult QOR pe care îl poate cheltui. Cheia legată este cheia Solana de la indexul 0 al frazei tale de recuperare. Deschiderea unei ferestre o înlocuiește pe cea existentă. Avertismentul de pe ecran se aplică: ține-o mică și scurtă și închide-o când ai terminat cu **Închide fereastra**.
- **Retransmite o tranzacție Solana semnată.** Lipește octeții de transmisie (base64 sau base58) dintr-o unealtă pentru dezvoltatori și atinge **Citește-o**. QoreX arată programele și care semnatari au semnat și retransmite doar tranzacțiile semnate complet. Contul tău QoreChain semnează plicul cu ML-DSA-87 și îi plătește comisionul; nu capătă nicio autoritate asupra tranzacției Solana.

Cum se folosește: activează testnetul și modul dezvoltator, deschide **Solana pe QoreChain** din tabul Dezvoltator (sau din pagina Unelte pentru dezvoltatori a extensiei), apoi folosește secțiunile de mai sus. Și apelurile de contract către programe SVM din [Modul dezvoltator](/qorex/developer-mode#contracts) funcționează doar pe testnet.

Pentru partea de lanț a lane-ului SVM, vezi [SVM pe testnet](/developer-guide/svm-testnet-v329) și [lane-ul SVM](/developer-guide/svm-lane-v328).

## Ce nu este pe mainnet {#not-on-mainnet}

- Trimiterea din QoreX pe alte lanțuri prin IBC.
- Ecranul QoreChain Bridge și rutele lui.
- Solana pe QoreChain, inclusiv ferestrele SVM și retransmiterea.

QoreX arată aceste ecrane doar pe testnet și spune acest lucru pe fiecare dintre ele.
