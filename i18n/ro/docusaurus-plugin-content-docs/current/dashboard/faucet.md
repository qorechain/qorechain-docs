---
slug: /dashboard/faucet
title: Faucet
sidebar_label: Faucet
sidebar_position: 9
---

# Faucet

**Faucet**-ul plătește tokenuri de test gratuite către o adresă de testnet, astfel încât să poți încerca Dashboard-ul, portofelele și contractele fără a cheltui ceva de valoare. Este pentru oricine are nevoie de QOR de testnet (și, în timpul fest-ului builderilor, de trei tokenuri de test) pentru a testa transferuri, swap-uri, instrumente de staking și deploy de contracte pe testnet-ul `qorechain-diana`.

:::caution Doar pentru testnet, fără valoare reală
QOR de testnet **nu are valoare reală**. Faucet-ul nu atinge niciodată mainnet-ul: nu există un faucet pentru QOR de mainnet, iar nimic din ce revendici aici nu poate fi mutat pe mainnet.
:::

## Inovații {#innovations}

- **O singură solicitare, două feluri de token.** O solicitare plătește 100 QOR și, într-o tranzacție separată, 1.000 fUSD, 0,5 fETH și 0,02 fBTC. Dacă trimiterea tokenurilor Fest eșuează, QOR ajunge oricum, iar cardul de rezultat o spune.
- **Un cooldown dublu.** O solicitare per 24 de ore per cont **și** per adresă. Slotul este rezervat înainte de a se trimite ceva și eliberat dacă trimiterea eșuează, deci o solicitare eșuată nu îți consumă ziua.
- **Tokenurile Fest sunt monede bank native.** Sunt denominații bank `erc20:0x...` pe care AMM-ul on-chain, transferurile bank, IBC și contractele QoreChain Native le folosesc ca atare. MetaMask sau un DEX EVM le văd doar după o conversie `MsgConvertCoin` (vezi [Tokenuri de test Fest](#fest-tokens)).
- **Un destinatar `0x` este plătit pe geamănul său `qor1`.** O adresă `0x` reprezintă aceiași 20 de octeți ca forma sa `qor1`, deci serviciul plătește același cont. Formularul din Dashboard acceptă el însuși doar `qor1...`.

## Cum se folosește {#how-to-use}

1. **Autentifică-te.** Când nu ești autentificat, pagina afișează "Sign in to access the faucet."
2. Deschide **Faucet**. În **Request Tokens**, sub **Wallet Address**, folosește "Select a wallet" sau **Use my address ->** pentru a completa unul dintre portofelele tale din Dashboard, ori scrie o adresă `qor1...`.
3. Linia de informații spune "You can request 100 QOR once every 24 hours", plus sumele pentru fest.
4. Selectează **Request Tokens**.
5. Dacă reușește, cardul afișează **Tokens Sent!** cu suma, un rând **Fest tokens** (ce a ajuns, sau o scurtă notă dacă doar QOR a trecut), hash-ul tranzacției cu un buton de copiere și **View on Explorer**.
6. Dacă soliciți din nou prea curând, apare "Rate Limit Reached" și "Rate limited for another HH:MM".

Verificarea adresei din formular este ușoară: caută prefixul `qor` și o lungime de cel puțin 10 caractere și respinge intrările `0x...`. Verifică singur adresa înainte de a trimite.

O solicitare la faucet se contorizează și pentru [misiunile](/dashboard/quests) faucet.

**Exemplu minimal:** autentifică-te, deschide Faucet, selectează **Use my address ->**, selectează **Request Tokens**, apoi **View on Explorer** cu antetul pe Testnet.

### Tokenuri de test Fest (fUSD, fETH, fBTC) {#fest-tokens}

Trei tokenuri de test suplimentare există pe testnet pentru fest-ul builderilor: **fUSD** (FestUSD, 6 zecimale), **fETH** (FestETH, 18 zecimale) și **fBTC** (FestBTC, 8 zecimale). Nu au valoare și nu au legătură cu vreun activ real. Guvernanța testnet-ului le-a înregistrat în modulul ERC-20 (propunerea 26 a testnet-ului), astfel încât fiecare există atât ca contract ERC-20 pe EVM-ul testnet-ului, cât și ca monedă bank pe care portofelele și AMM-ul o pot deține. Faucet-ul este configurat să trimită câte puțin din fiecare odată cu o solicitare de QOR (la momentul scrierii, 27 octombrie 2026: 1.000 fUSD, 0,5 fETH și 0,02 fBTC, cu aceeași perioadă de cooldown de 24 de ore); pagina afișează sumele exacte lângă suma de QOR ori de câte ori le plătește. Tokenurile Fest ajung într-o tranzacție separată; hash-ul ei nu este afișat pe card.

| Token | Zecimale | Contract ERC-20 pe EVM-ul testnet-ului | Denominația bank (sensibilă la majuscule) |
| --- | --- | --- | --- |
| fUSD | 6 | `0x97143B771D34ddb9130b807b135Ae675A5a963CA` | `erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA` |
| fETH | 18 | `0x02292293c13880a26242690eb70a0e42B8E91c28` | `erc20:0x02292293c13880a26242690eb70a0e42B8E91c28` |
| fBTC | 8 | `0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | `erc20:0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` |

- **Doar pe testnet.** Tokenurile nu există pe mainnet.
- **Copiază denominația exact.** Partea de adresă este în format EIP-55 cu majuscule și minuscule mixte, iar denominația este comparată sensibil la majuscule.
- **Vezi-le on-chain.** `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` listează cele trei denominații cu simbolurile și numele lor de afișare.
- **Folosirea lor din MetaMask sau dintr-un DEX EVM.** Faucet-ul plătește monede bank. Pentru a deține una ca ERC-20 în MetaMask sau într-un DEX EVM, convert-o cu `MsgConvertCoin` (expeditor adresa ta `qor1...`, destinatar o adresă `0x...` și denominația exactă cu majuscule și minuscule mixte). Mutarea înapoi se face cu `MsgConvertERC20`. Pașii și cifrele de gaz se găsesc în [Dezvoltare EVM](/developer-guide/evm-development#fest-tokens).
- **Pool-uri.** [AMM](/architecture/amm)-ul testnet-ului le poate pune în pool împotriva `uqor`; dacă există un pool este arătat de `GET /qorechain/amm/v1/pools`. Fila Tokens din [Wallet](/dashboard/wallet) și [Trade](/dashboard/trade) nu au o intrare pentru ele; verifică un sold cu `GET /cosmos/bank/v1beta1/balances/{address}`.

### Ce să faci cu tokenurile de test

- Trimite și primește pe pagina [Wallet](/dashboard/wallet).
- Încearcă un [swap](/dashboard/trade) cu tokenurile de test QoreSwap.
- Fă deploy și testează contracte din [Smart Contract Creator](/dashboard/smart-contract-creator) înainte de a trece la mainnet.
- Testează configurarea unui nod sau a unui validator pe testnet cu instrumentele din [Noduri și validatori](/dashboard/tools-hub).

## Cum se accesează {#how-to-access}

- **URL:** [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet).
- **Cont:** este necesară autentificarea. Nu este nevoie de conectarea unui portofel; poți lipi orice adresă `qor1...`.
- **Rețea:** Faucet-ul **plătește întotdeauna pe testnet** `qorechain-diana`, indiferent ce arată antetul. Nu trebuie să comuți antetul pe testnet pentru a face o solicitare. Comută-l pe testnet doar pentru ca **View on Explorer** să deschidă rețeaua potrivită; cu antetul pe mainnet, acel link arată "Transaction Not Found".
- **Cost:** gratuit.

## Unde este publicat {#where-published}

| Suprafață | Adresă | Rețea | Cont |
| --- | --- | --- | --- |
| Pagina Faucet | `dashboard.qorechain.io/faucet` | Doar testnet `qorechain-diana` | Autentificare necesară |
| Metadatele tokenurilor Fest | `api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` | Testnet | Niciunul |

## Limite și probleme cunoscute {#limits}

- **100 QOR o dată la 24 de ore**, per cont și per adresă. Tokenurile Fest urmează același cooldown.
- **Fără faucet pentru mainnet.** QOR de testnet nu poate fi niciodată schimbat pe QOR de mainnet.
- **Formularul respinge adresele `0x`** și face doar o verificare ușoară a prefixului `qor`.
- **Trimiterea tokenurilor Fest poate eșua singură;** QOR este plătit oricum, iar cardul o spune. Așteaptă cooldown-ul sau verifică-ți soldul înainte de a reîncerca.
- **Tokenurile Fest nu apar** în fila Tokens din Wallet.
