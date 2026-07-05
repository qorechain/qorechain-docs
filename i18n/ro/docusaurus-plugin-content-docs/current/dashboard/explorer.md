---
slug: /dashboard/explorer
title: Explorer
sidebar_label: Explorer
sidebar_position: 2
---

# Explorer

**Explorer**-ul este fereastra Dashboard-ului către lanț. Folosește-l pentru a căuta blocuri, tranzacții, adrese și validatori și pentru a urmări activitatea rețelei în timp real. Explorer-ul este doar pentru citire — nu este necesară conectarea unui portofel pentru a-l explora.

## Pagina de prezentare generală

Deschide **Explorer** din Dashboard pentru a vedea o imagine live a rețelei:

- **Starea rețelei** — ID-ul lanțului, starea curentă și un indicator de siguranță cuantică.
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

## Detaliile blocului

O pagină de bloc afișează înălțimea, marcajul de timp, proponentul, hash-ul, numărul de tranzacții, gazul consumat și lista tranzacțiilor pe care le conține, împreună cu informații despre consens și despre semnăturile post-cuantice. Butoanele „anterior" și „următor" îți permit să parcurgi lanțul bloc cu bloc.

## Detaliile adresei

O adresă QoreChain este un singur cont cu trei codificări — Native (`qor1...`), EVM (`0x...`) și SVM (base58) — iar pagina adresei reunește activitatea de pe toate cele trei căi într-o singură vizualizare a acelei identități unice.

Pagina afișează adresa cu un cod QR scanabil, soldul său de QOR, numărul de tranzacții și totalurile transferurilor primite și trimise. Mai jos se află istoricul combinat al tranzacțiilor adresei pe căile Native, EVM și SVM — transferuri, implementări de contracte, înregistrări de chei PQC, swap-uri, revendicări de la faucet și altele — fiecare cu suma, ora și starea sa. Poți copia adresa, poți descărca codul său QR și poți deschide orice tranzacție pentru detalii.

## Validatori {#validators}

Vizualizarea validatorilor listează validatorii rețelei, cu carduri rezumative pentru numărul de validatori activi, totalul de QOR pus în staking și sănătatea consensului. Tabelul afișează pentru fiecare validator rangul, numele (moniker), puterea de vot, comisionul și starea (de exemplu activ sau sancționat/jailed), plus un indicator post-cuantic. O casetă de căutare filtrează după numele sau adresa validatorului. Pentru a delega către un validator, consultă [Staking și Validatori](/dashboard/staking-and-validators).
