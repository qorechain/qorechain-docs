---
slug: /dashboard/contract-auditor
title: Auditor de contracte
sidebar_label: Auditor de contracte
sidebar_position: 7
---

# Auditor de contracte

**Auditorul de contracte** rulează o analiză de securitate bazată pe AI a unui smart contract, alimentată de **QCAI**. Trimite un contract, iar QCAI îl analizează pentru vulnerabilități, atribuie un nivel general de risc și un scor de securitate și explică fiecare constatare cu o soluție recomandată. La fel ca [Generatorul de smart contracte](/dashboard/smart-contract-creator), Auditorul funcționează pe **17 blockchainuri** pentru instrumentele AI.

## Rulează un audit

1. Deschide **Auditorul** și furnizează contractul pe care vrei să-l analizezi.
2. Pornește auditul. QCAI analizează contractul și produce un raport.

## Citește raportul

Un raport de audit se deschide pe propria pagină și include:

- **Nivelul de risc** — o evaluare generală (de exemplu critic, ridicat, mediu sau scăzut), codificată cromatic pentru o scanare rapidă.
- **Scorul de securitate** — un scor general de la 0 la 100.
- **Defalcarea pe severitate** — câte constatări se încadrează în fiecare nivel de severitate (critic, ridicat, mediu, scăzut și informativ).
- **Rezumat** — o scurtă prezentare a posturii de securitate a contractului.

### Constatări

Fiecare constatare listează severitatea sa, un titlu, locația din cod la care se referă, o descriere a problemei și o soluție recomandată. Când un contract nu are probleme la un anumit nivel, raportul precizează acest lucru.

Acolo unde este cazul, raportul include și secțiuni pentru recomandări generale, optimizări de gas, bune practici și aspecte pozitive pe care contractul le respectă deja corect.

## Revizuiește auditurile anterioare

Lista de audituri afișează rapoartele tale anterioare într-un tabel cu numele contractului, blockchainul, nivelul de risc, scorul de securitate și momentul creării fiecăruia. O casetă de căutare filtrează după numele contractului sau blockchain. Selectează orice rând pentru a redeschide raportul complet și folosește linkul propriu al paginii raportului pentru a-l partaja.

:::tip Auditează înainte de a face deploy
Rulează un audit ca ultim pas înainte de deploy și reia-l după orice modificare. Tratează constatările ca o îndrumare de verificat, nu ca o garanție automată — combină raportul cu propriile teste pe [testnet](/getting-started/connecting-to-testnet).
:::

## Legături utile

- [Generatorul de smart contracte](/dashboard/smart-contract-creator) — generează contracte cu QCAI.
- [Securitate post-cuantică](/architecture/post-quantum-security) — cum securizează QoreChain conturile și semnăturile.
