---
slug: /dashboard/trade
title: Tranzacționare (DEX)
sidebar_label: Tranzacționare (DEX)
sidebar_position: 4
---

# Tranzacționare (DEX)

Pagina **Tranzacționare** (intitulată „QoreChain DEX") este un ecran de schimb cu tokenuri de test, cu patru file: **Swap**, **Pools**, **Add Liquidity** și **My Positions**. Este făcută pentru a încerca un flux de schimb de la cap la coadă cu tokenuri de test, înainte să existe pool-uri reale. Pentru designul automated market maker-ului nativ al QoreChain, vezi [AMM și lichiditate on-chain](/architecture/amm).

:::caution Deocamdată doar tokenuri de test
Tot ce rulează pe această pagină rulează pe **testnet**, indiferent ce rețea arată antetul. Pe mainnet, pagina este în continuare condiționată de autentificare și de confirmare, dar afișează `qorechain-diana` și tokenuri de testnet. Doar cinci tokenuri de test QoreSwap se decontează on-chain; tot restul de aici este o zonă de exersare. Modulul AMM nativ al QoreChain este activ, dar încă nu au fost create pool-uri pe niciuna dintre rețele (`GET /qorechain/amm/v1/pools` returnează o listă goală pe ambele, verificat la 27 octombrie 2026).
:::

## Inovații {#innovations}

- **Schimburi on-chain pentru cinci tokenuri de test.** Schimburile între WQOR, QUSDC, QUSDT, QWETH și QWBTC rulează pe contractul AMM QoreSwap de pe EVM-ul testnet-ului (chain ID 9800). Cotația vine din `getAmountOut` al contractului.
- **Slippage impus în tranzacție.** Tranzacția rulează ca un approve urmat de `swapExactTokensForTokens`, cu o ieșire minimă derivată din setarea ta de slippage, semnată cu cheia EVM a portofelului de test. Dacă prețul depășește toleranța ta, schimbul este anulat (revert) în loc să se execute la un preț mai prost.
- **Tokenuri de test la cerere.** **Get test tokens** revendică toate cele cinci tokenuri, o dată la 12 ore pentru fiecare token.
- **Separare cinstită între real și exersare.** Celelalte perechi, lista Pools, Add Liquidity și My Positions sunt o zonă de exersare pe testnet și nu sunt on-chain.

## Cum se folosește {#how-to-use}

Cerințe: să fii autentificat și să ai un portofel de test (vezi [Portofel](/dashboard/wallet#testnet)). Fără el, pagina afișează „Wallet Required for Trading".

### Swap

1. Bannerul oferă **Get test tokens**; folosește-l mai întâi.
2. Alege tokenul cu care plătești și introdu o sumă. Perechea implicită, QOR către USDC, este o pereche de **exersare** care nu se decontează on-chain. Alege **WQOR** și **QUSDC** (sau orice pereche dintre cele cinci) pentru un schimb on-chain.
3. Alege tokenul pe care îl primești; ieșirea este cotată automat.
4. Opțional, ajustează **toleranța la slippage** (pagina are o valoare implicită).
5. Selectează **Swap Now**, apoi **Confirm Swap**. Rezultatul afișează „Swap Confirmed" cu **View Transaction**.

**Recent Swaps** listează schimburile tuturor utilizatorilor; **Show My History** îl filtrează la ale tale.

**Exemplu minimal:** pe testnet selectează **Get test tokens**, vinde niște WQOR pentru QUSDC, **Swap Now**, **Confirm Swap**.

:::tip Slippage
O toleranță mai mare face ca un schimb să aibă șanse mai mari să se efectueze pe piețele cu mișcare rapidă, dar este posibil să primești un preț mai prost. Valoarea implicită este potrivită pentru majoritatea perechilor.
:::

### Pools

Răsfoiește cardurile de pool pentru perechea de tranzacționare și detaliile ei. O casetă de căutare filtrează după simbolul tokenului. Aceste pool-uri sunt o zonă de exersare, nu lichiditate on-chain, iar cifrele de pe ele nu sunt date de piață.

### Add Liquidity

1. Selectează două tokenuri de împerecheat (unul este implicit QOR). Folosește **Create Pool** pentru o pereche nouă.
2. Introdu o sumă pentru primul token; al doilea se completează pentru a corespunde raportului pool-ului. Pagina indică un minim pentru crearea unui pool.
3. Analizează ponderea ta, apoi confirmă.

### My Positions

Fiecare intrare afișează perechea de tokenuri, suma din fiecare token, ponderea ta și comisioanele câștigate. Pentru a ieși dintr-o poziție, selectează **Withdraw**, apoi **Request Withdrawal (x%)**; după o perioadă de așteptare, selectează **Confirm Withdraw** (sau **Cancel Withdrawal**). Nu există un singur buton „Remove Liquidity".

## Cum se accesează {#how-to-access}

- **URL:** [dashboard.qorechain.io/trade](https://dashboard.qorechain.io/trade).
- **Cont:** autentificarea este obligatorie. Pentru a face schimburi este nevoie de un portofel de test. Pe mainnet, [confirmarea](/dashboard/overview#risk-acknowledgement) unică este de asemenea necesară înainte să se deschidă pagina.
- **Rețea:** doar conținut de testnet; comutatorul din antet nu îl schimbă.
- **Cost:** gratuit. Tokenurile de test vin din **Get test tokens**; portofelul de test plătește gazul în QOR de test din [Faucet](/dashboard/faucet).

## Unde este publicat {#where-published}

| Suprafață | Adresă | Rețea | Se decontează on-chain? |
| --- | --- | --- | --- |
| Schimb de WQOR, QUSDC, QUSDT, QWETH, QWBTC | `dashboard.qorechain.io/trade` | EVM testnet, chain ID 9800 | Da |
| Alte perechi, Pools, Add Liquidity, My Positions | `dashboard.qorechain.io/trade` | Testnet | Nu, registru de exersare |
| AMM nativ | Vezi [AMM](/architecture/amm) | Ambele rețele | Nu există încă pool-uri |

## Limite și probleme cunoscute {#limits}

- **Fără tranzacționare pe mainnet.** Pagina ignoră comutatorul de rețea și afișează conținut de testnet și pe mainnet.
- **Doar cinci tokenuri se decontează on-chain.** Tokenurile Fest din [Faucet](/dashboard/faucet#fest-tokens) nu sunt pe această pagină.
- **AMM-ul nativ nu are pool-uri** pe niciuna dintre rețele. Pool-urile reale vor fi descrise când vor exista.
- **Cifrele pool-urilor** sunt date de exersare, nu date de piață.
- **Tokenurile de testnet nu au valoare** și nu pot fi schimbate pe nimic.

## Înrudite

- [AMM și lichiditate on-chain](/architecture/amm) - tipuri de pool-uri și curbe de prețuri.
- [Portofel](/dashboard/wallet) - verifică soldurile înainte și după un schimb.
