---
slug: /dashboard/wallet
title: Portofel
sidebar_label: Portofel
sidebar_position: 3
---

# Portofel

Pagina **Portofel** este locul unde îți vezi soldul și istoricul tranzacțiilor, primești QOR și îl trimiți. Modul în care funcționează pagina depinde de rețea:

- **Mainnet — non-custodial.** Dashboard-ul nu deține chei de mainnet. Îți conectezi propriul portofel (**Keplr** pentru șina Native, **MetaMask** pentru șina EVM), soldul și istoricul tău real sunt citite direct de pe lanț și poți primi fonduri pe orice șină. Trimiterile se fac din propriul tău portofel conectat.
- **Testnet — custodial.** Dashboard-ul gestionează un portofel de test pentru tine, astfel încât să poți încerca transferuri, swap-uri și staking fără nicio configurare. Alimentează-l de la [Faucet](/dashboard/faucet).

Conturile sunt protejate cu criptografie rezistentă la calculul cuantic, iar codificarea Native a fiecărei adrese folosește prefixul bech32 `qor` (`qor1...`).

## Un cont, trei codificări {#one-account-three-encodings}

Un cont QoreChain este o identitate unică ce poate fi scrisă în trei moduri — câte unul pentru fiecare șină de execuție:

| Șină | Codificare | Arată ca |
| --- | --- | --- |
| **Native QOR** | bech32 | `qor1...` |
| **EVM** | hex | `0x...` |
| **SVM** | base58 | de ex. `5Gv7...` |

Toate cele trei codificări indică spre **același cont și același sold**. Fondurile primite pe orice șină ajung în unicul tău sold, iar Dashboard-ul indexează soldul și istoricul prin codificarea `qor1` (Native), astfel încât activitatea de pe fiecare șină apare împreună.

## Folosește Portofelul pe mainnet {#mainnet}

1. Comută antetul Dashboard-ului pe **Mainnet**.
2. Dacă ți se cere, acceptă [confirmarea unică a riscurilor](/dashboard/overview#risk-acknowledgement) — mainnet-ul mută fonduri reale, Dashboard-ul este non-custodial, iar tranzacțiile sunt ireversibile.
3. Selectează **Connect Wallet** și alege **Keplr** (șina Native) sau **MetaMask** (șina EVM), apoi aprobă conexiunea în portofelul tău.
4. Pagina îți încarcă soldul real și istoricul tranzacțiilor de pe lanț.

Dacă portofelul tău nu are încă QoreChain configurat, adaugă-l mai întâi — vezi [Adaugă QoreChain în portofelul tău](#add-network).

### Trimite pe mainnet {#send-mainnet}

Deoarece Dashboard-ul nu îți deține niciodată cheile de mainnet, trimiterile se fac din propriul tău portofel conectat: creează transferul în Keplr (șina Native) sau MetaMask (șina EVM) așa cum ai face-o pe orice rețea și semnează-l acolo. Dashboard-ul afișează tranzacția în istoricul tău odată ce aceasta este pe lanț.

:::caution Fonduri reale, transferuri ireversibile
Tranzacțiile pe mainnet sunt ireversibile. Verifică întotdeauna de două ori adresa destinatarului în portofelul tău înainte de a semna.
:::

### Primește pe o anumită șină {#receive-mainnet}

1. Selectează **Receive**.
2. În fereastra modală de primire, alege o șină cu selectorul: **Native QOR**, **EVM** sau **SVM**.
3. Fereastra modală îți afișează adresa în codificarea acelei șine (`qor1...`, `0x...` sau base58), cu un cod QR și un buton de copiere.
4. Copiază adresa sau lasă expeditorul să scaneze codul QR.

Indiferent ce șină folosește expeditorul, fondurile ajung în același cont — un cont, trei codificări, un singur sold.

### Citește istoricul tranzacțiilor {#history}

Pe mainnet, fiecare rând din istoricul tău arată:

- O **insignă de șină** — Native, EVM sau SVM — care îți spune ce șină a folosit tranzacția.
- O **etichetă reală de tip de tranzacție**, cum ar fi *Send*, *înregistrare de cheie PQC* sau *lansare de contract*, în locul unei etichete generice.
- Suma, ora și starea, împreună cu hash-ul tranzacției, pe care îl poți deschide în [Explorer](/dashboard/explorer).

## Folosește Portofelul pe testnet {#testnet}

Pe testnet (`qorechain-diana`) Dashboard-ul gestionează un portofel de test pentru tine, astfel încât să poți testa fluxurile cap-coadă fără să conectezi nimic.

### Ce afișează pagina

- Eticheta portofelului tău și adresa activă, în formă scurtată, cu un buton de copiere dintr-un singur click.
- **Soldul tău total** în QOR.
- Un panou de securitate care menționează criptarea rezistentă la calculul cuantic și rețeaua conectată.
- Un indicator al ultimei actualizări, cu un control de reîmprospătare.
- Filele **Assets** și **Activity**, care îți arată deținerile și istoricul tranzacțiilor.

Folosește oricând controlul de reîmprospătare pentru a-ți prelua soldul curent și cea mai recentă activitate de pe lanț.

### Trimite QOR (testnet)

1. Selectează **Send**.
2. Introdu adresa destinatarului (`qor1...`).
3. Introdu suma și, opțional, un memo.
4. Verifică detaliile și comisionul estimat, apoi confirmă.

Pe măsură ce tastezi un destinatar, îți sunt sugerate contactele salvate și adresele recente, ca să te ajute să eviți greșelile. După ce transferul este trimis, primești o confirmare cu hash-ul tranzacției, pe care îl poți deschide în [Explorer](/dashboard/explorer).

### Primește QOR (testnet)

1. Selectează **Receive**.
2. Împărtășește-ți adresa sau codul ei QR cu expeditorul, sau copiază adresa cu un singur click.
3. Opțional, introdu o sumă solicitată și un memo pentru a genera un link de plată și un cod QR descărcabil.

### Gestionează-ți portofelele de test

Selectează **My Wallets** pentru a-ți deschide lista de adrese. De acolo poți comuta între portofele, poți crea un portofel nou, poți importa unul existent sau poți elimina un portofel de care nu mai ai nevoie. Portofelul activ este cel folosit pentru trimitere, swap, staking și alte acțiuni semnate în întregul Dashboard pe testnet.

## Adaugă QoreChain în portofelul tău {#add-network}

Pagina **Add Network** afișează patru carduri alăturate — câte unul pentru fiecare mod de conectare — astfel încât să poți adăuga QoreChain în propriul portofel cu un singur click:

| Card | Ce îți oferă |
| --- | --- |
| **Native** | Endpoint-urile RPC și REST plus ID-ul lanțului, fiecare cu un buton de copiere — pentru Keplr și alte portofele de pe șina Native. |
| **EVM** | Parametri de rețea EIP-3085 gata pregătiți — un singur click adaugă QoreChain în MetaMask și în alte portofele EVM. |
| **SVM** | URL-ul RPC SVM pentru portofelele și instrumentele compatibile SVM. |
| **WalletConnect** | O asociere WalletConnect pentru a lega orice portofel compatibil WalletConnect. |

Pentru a adăuga QoreChain:

1. Deschide pagina **Add Network** din Dashboard.
2. Alege cardul care corespunde șinei portofelului tău.
3. Selectează butonul de adăugare (EVM, WalletConnect) sau copiază endpoint-urile și ID-ul lanțului în formularul de adăugare a rețelei din portofelul tău (Native, SVM).
4. Aprobă noua rețea în portofelul tău.

Endpoint-urile publice sunt `rpc.qore.host` (RPC Native), `api.qore.host` (REST), `evm.qore.host` (JSON-RPC EVM) și `svm.qore.host` (RPC SVM), cu variantele `*-testnet` (de exemplu `rpc-testnet.qore.host`) pentru testnet. ID-uri de lanț: mainnet `qorechain-vladi` (ID de lanț EVM `9801`), testnet `qorechain-diana` (ID de lanț EVM `9800`).

## Pagini conexe

- [Token Operations](/user-guide/token-operations) — conceptele din spatele transferurilor și denominărilor QOR.
- [Trade](/dashboard/trade) — schimbă-ți tokenurile pe AMM-ul de pe lanț.
- [Bridge](/dashboard/bridge) — mută active către și dinspre alte lanțuri.
