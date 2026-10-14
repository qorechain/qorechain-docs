---
slug: /dashboard/trade
title: Tranzacționare (DEX)
sidebar_label: Tranzacționare (DEX)
sidebar_position: 4
---

# Tranzacționare (DEX)

Pagina **Tranzacționare** este ecranul de schimb de tokenuri al Panoului: schimbi un token cu altul și furnizezi lichiditate unui pool, fără registru de ordine off-chain. Pentru designul automated market maker-ului (AMM) nativ al QoreChain, vezi [AMM și lichiditate on-chain](/architecture/amm).

:::caution Deocamdată doar tokenuri de test
Pool-urile și tokenurile de pe această pagină sunt tokenuri de test: schimburile rulează pe un contract de swap implementat pe EVM-ul testnet-ului, iar pagina are un buton **Get test tokens** pentru ele. Nu considera nimic din ce este afișat aici drept lichiditate cu valoare reală sau drept preț de piață. Modulul AMM nativ al QoreChain este activ, dar încă nu au fost create pool-uri pe niciuna dintre rețele. Această pagină va fi actualizată când vor fi disponibile pool-uri reale.
:::

Tranzacționarea necesită un cont autentificat și un portofel — vezi [Autentificare](/dashboard/overview#sign-in) și [Conectează-ți portofelul](/dashboard/overview#connect-your-wallet).

Pagina are patru file: **Swap**, **Pools**, **Add Liquidity** și **My Positions**.

## Swap

Schimbă un token cu altul:

1. Alege tokenul cu care plătești și introdu o sumă.
2. Alege tokenul pe care dorești să-l primești — suma de ieșire este cotată automat.
3. Opțional, ajustează-ți **toleranța la slippage** (mișcarea maximă de preț pe care o vei accepta; implicit 0.5%).
4. Selectează **Swap** și confirmă.

Un panou cu istoricul schimburilor listează schimburile tale anterioare cu tokenurile, sumele, rata, ora și statusul.

:::tip Slippage
O toleranță mai mare la slippage face ca un schimb să aibă șanse mai mari să se efectueze pe piețele cu mișcare rapidă, dar este posibil să primești un preț mai puțin favorabil. Valoarea implicită este potrivită pentru majoritatea perechilor.
:::

## Pools

Răsfoiește pool-urile de lichiditate disponibile. Fiecare card de pool afișează perechea de tranzacționare, lichiditatea totală, volumul pe 24 de ore și numărul de furnizori. O casetă de căutare filtrează pool-urile după simbolul tokenului.

## Add Liquidity

Furnizează lichiditate unui pool și primește o parte din comisioanele de schimb ale acestuia:

1. Selectează cele două tokenuri pe care să le împerechezi (unul este implicit QOR).
2. Introdu o sumă pentru primul token — a doua sumă se completează automat pentru a corespunde raportului curent al pool-ului.
3. Analizează ponderea ta proiectată din pool, apoi selectează **Add Liquidity** și confirmă.

Primești tokenuri de furnizor de lichiditate (LP) care reprezintă poziția ta.

## My Positions

Vizualizează pozițiile de lichiditate pe care le deții. Fiecare intrare afișează perechea de tokenuri, suma din fiecare token, ponderea ta din pool și comisioanele câștigate. Selectează **Remove Liquidity** pe o poziție pentru a previzualiza tokenurile pe care le-ai primi și pentru a-ți retrage partea.

## Înrudite

- [AMM și lichiditate on-chain](/architecture/amm) — tipuri de pool-uri și curbe de prețuri.
- [Portofel](/dashboard/wallet) — verifică soldurile înainte și după un schimb.
