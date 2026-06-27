---
slug: /dashboard/explorer
title: Explorer
sidebar_label: Explorer
sidebar_position: 2
---

# Explorer

**Explorer**-ul este fereastra Dashboard-ului către lanț. Folosește-l pentru a căuta blocuri, tranzacții, adrese și validatori și pentru a urmări activitatea rețelei în timp real. Explorer-ul este doar pentru citire — nu este necesară conectarea unui portofel pentru a-l explora.

## Pagina de prezentare generală

Deschide **Explorer** din Dashboard pentru a vedea un instantaneu live al rețelei:

- **Starea rețelei** — chain ID, starea curentă și un indicator de siguranță cuantică.
- **Activitatea blocurilor** — cea mai recentă înălțime a blocului, timpul mediu pe bloc și blocurile produse astăzi.
- **Oferta** — totalul QOR blocat (bonded), raportul bonded și oferta circulantă.
- **Statistici principale** — totalul tranzacțiilor, validatorii activi și totali și totalul adreselor.
- **Cele mai recente blocuri** — o listă live cu înălțimea, timpul, numărul de tranzacții și proponentul fiecărui bloc.
- **Cele mai recente tranzacții** — o listă live cu hash-ul, tipul, blocul, suma și expeditorul fiecărei tranzacții.

Apasă pe orice rând de bloc sau tranzacție pentru a deschide pagina sa de detalii. Un control de reîmprospătare pe fiecare listă aduce cele mai noi intrări.

## Căutare

Caseta de căutare din partea de sus a Explorer-ului acceptă oricare dintre următoarele și te direcționează automat către pagina corectă:

- O **adresă** (`qor1...`)
- Un **hash de tranzacție**
- O **înălțime de bloc** (un număr)

## Detaliile tranzacției

O pagină de tranzacție afișează hash-ul, starea, suma, expeditorul și destinatarul (ambele pot fi accesate prin clic), comisionul, înălțimea blocului, tipul tranzacției și memo-ul, dacă există. Poți copia hash-ul și comuta o vizualizare brută (raw) a întregii tranzacții pentru o inspecție mai aprofundată.

## Detaliile blocului

O pagină de bloc afișează înălțimea, marcajul temporal, proponentul, hash-ul, numărul de tranzacții, gas-ul utilizat și lista tranzacțiilor pe care le conține, împreună cu informații despre consens și semnătura post-cuantică. Controalele de tip anterior și următor îți permit să parcurgi lanțul bloc cu bloc.

## Detaliile adresei

O pagină de adresă afișează adresa cu un cod QR scanabil, soldul său în QOR, numărul de tranzacții și totalurile pentru transferurile primite și trimise. Sub acestea se află istoricul complet al tranzacțiilor pentru adresă — transferuri, swap-uri, revendicări de la faucet și altele — fiecare cu suma, timpul și starea sa. Poți copia adresa, descărca codul său QR și deschide orice tranzacție pentru detalii.

## Validatori {#validators}

Vizualizarea validatorilor listează validatorii rețelei cu carduri de sumar pentru numărul de validatori activi, totalul QOR blocat (bonded) și sănătatea consensului. Tabelul afișează rangul, monikerul, puterea de vot, comisionul și starea fiecărui validator (de exemplu activ sau jailed), plus un indicator post-cuantic. O casetă de căutare filtrează după numele sau adresa validatorului. Pentru a delega către un validator, vezi [Staking și validatori](/dashboard/staking-and-validators).
