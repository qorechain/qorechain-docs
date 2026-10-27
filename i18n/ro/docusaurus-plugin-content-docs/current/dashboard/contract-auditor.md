---
slug: /dashboard/contract-auditor
title: Auditor de contracte
sidebar_label: Auditor de contracte
sidebar_position: 7
---

# Auditor de contracte

**Auditorul de contracte** (bara laterală **Build**, intrarea **AI Audit**) rulează o analiză de securitate a codului sursă al unui contract lipit în pagină, cu **QCAIA**, asistentul AI al QoreChain, și returnează un scor, un nivel de risc și constatări cu soluții recomandate. Este destinat dezvoltatorilor care vor o a doua verificare rapidă a unui contract înainte de a-l testa și a-l implementa. Nu este un audit formal și nu înlocuiește analiza făcută de oameni.

## Inovații {#innovations}

- **Detectarea automată a blockchain-ului.** „Auto-detect from code” este opțiunea implicită; poți alege în schimb unul dintre cele 17 ecosisteme.
- **Un procentaj separat de pregătire post-cuantică** lângă Security Score de la 0 la 100, raportat separat, ca să nu fie inclus în scorul de securitate.
- **Un audit gratuit în fiecare zi UTC.** Primul audit din fiecare zi UTC este gratuit. După aceea, pe testnet fiecare audit se plătește în QOR de test, după o fereastră „Confirm Security Audit” care afișează „Audit Cost”; pe mainnet, auditurile suplimentare așteaptă până în următoarea zi UTC.
- **Rapoarte private în mod implicit.** Proprietarul schimbă vizibilitatea; un raport public nu arată niciodată numele sau IP-ul proprietarului.
- **Constatări cu soluții, nu doar etichete.** Fiecare constatare are o severitate, o locație, o descriere și o soluție recomandată, iar raportul complet adaugă recomandări, optimizări de gas, bune practici și aspecte pozitive.

## Cum se folosește {#how-to-use}

### Rulează un audit

1. Autentifică-te (obligatoriu) și deschide **AI Audit**.
2. Completează **Blockchain** (implicit „Auto-detect from code”), **Name (Optional)** și **Contract Source Code**.
3. Selectează **Run Security Audit**, apoi confirmă fereastra „Confirm Security Audit”.
4. **Security Report** apare direct pe aceeași pagină. **Export PDF** îl salvează.

**Exemplu minimal:** lipește un ERC-20, păstrează detectarea automată, **Run Security Audit**, Confirm, **Export PDF**.

### Citește raportul

Raportul afișat pe pagină arată:

- **Risk Level**, codificat cromatic;
- **Security Score** de la 0 la 100 și procentajul de pregătire post-cuantică;
- un **Executive Summary**;
- **Vulnerabilities Found (N Issues)**, cu severitățile Critical, High, Medium, Low și Info. Un rezultat curat scrie „No vulnerabilities detected”.

Fiecare constatare listează severitatea, titlul, locația din cod, o descriere și o soluție recomandată.

Pagina raportului complet `/audits/<id>` adaugă defalcarea pe severitate, **Recommendations**, **Gas optimizations**, **Best practices**, **Positive aspects** și, pentru proprietar, comutatorul de vizibilitate.

### Audituri anterioare și partajare

- Rapoartele tale se găsesc la **Profile > Audited**.
- Lista **All Security Audits** de la `/audits` (cu link de pe pagina de start) arată cele mai recente audituri ale căror proprietari le-au făcut publice, într-un tabel cu numele contractului, blockchain, nivelul de risc, scor și dată. O casetă de căutare filtrează după nume, blockchain sau nivel de risc. Rapoartele private nu apar niciodată în ea; același lucru este valabil pentru lista celor mai recente audituri de pe pagina de start.
- Pe un raport pe care îl deții, un comutator din partea de sus scrie „This report is private”. Activează-l pentru a face raportul public, astfel încât oricine are linkul să îl poată citi (numele și IP-ul tău nu sunt afișate niciodată), și dezactivează-l pentru a-l face din nou privat.

:::tip Auditează înainte de a face deploy
Rulează un audit ca ultim pas înainte de deploy și reia-l după orice modificare. Tratează constatările ca o îndrumare de verificat, nu ca o garanție, și combină raportul cu propriile teste pe [testnet](/getting-started/connecting-to-testnet).
:::

## Cum se accesează {#how-to-access}

- **URL:** [dashboard.qorechain.io/audit](https://dashboard.qorechain.io/audit), sau **New Audit** pe pagina de start.
- **Cont:** autentificarea este necesară pentru a rula un audit. Lista `/audits` și rapoartele publice de la `/audits/<id>` se deschid fără cont.
- **Rețele:** funcționează pe ambele. Regula auditului gratuit zilnic este aceeași; auditurile suplimentare plătite există doar pe testnet.
- **Cost:** primul audit din fiecare zi UTC este gratuit; cele suplimentare pe testnet costă QOR de test; cele suplimentare pe mainnet așteaptă ziua următoare.

## Unde este publicat {#where-published}

| Suprafață | Adresă | Cont |
| --- | --- | --- |
| Rulează un audit | `dashboard.qorechain.io/audit` | Autentificare necesară |
| All Security Audits | `dashboard.qorechain.io/audits` | Niciunul |
| Un raport | `dashboard.qorechain.io/audits/<id>` | Niciunul dacă este public; altfel, proprietarul |

## Limite și probleme cunoscute {#limits}

- Analizează doar sursa pe care o lipești, fără compilare, teste sau analiză la rulare. Constatările pot fi incomplete sau greșite.
- Un raport privat nu poate fi deschis de nimeni în afară de proprietarul său, nici cu linkul.

## Înrudite

- [Creator de contracte inteligente](/dashboard/smart-contract-creator) - generează contracte cu QCAIA.
- [Securitate post-cuantică](/architecture/post-quantum-security) - cum securizează QoreChain conturile și semnăturile.
