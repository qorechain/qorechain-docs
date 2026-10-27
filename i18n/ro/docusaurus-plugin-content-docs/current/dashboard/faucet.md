---
slug: /dashboard/faucet
title: Faucet
sidebar_label: Faucet
sidebar_position: 9
---

# Faucet

**Faucet**-ul îți oferă tokenuri de test gratuite, astfel încât să poți încerca Dashboard-ul fără a cheltui ceva de valoare. Este un instrument **doar pentru testnet** — folosește-l pe testnet (`qorechain-diana`) pentru a-ți alimenta adresa înainte de a testa transferuri, swap-uri, staking și deploy de contracte.

:::caution Doar pentru testnet — fără valoare reală
QOR de testnet **nu are valoare reală**. Faucet-ul nu atinge niciodată mainnet-ul: nu există un faucet pentru QOR de mainnet, iar nimic din ce revendici aici nu poate fi mutat pe mainnet.
:::

## Solicită tokenuri de test

1. Autentifică-te, comută Dashboard-ul pe **testnet** și deschide **Faucet**-ul.
2. Introdu adresa de alimentat (`qor1...`). Dacă portofelul tău este conectat, selectează **Use my address** pentru a o completa automat. Formularul confirmă faptul că adresa este validă înainte de a putea continua.
3. Selectează butonul de solicitare. Alimentarea este procesată în câteva secunde.

Când solicitarea reușește, un card de confirmare afișează suma trimisă și hash-ul tranzacției, cu un buton de copiere și un link pentru a deschide tranzacția în [Explorer](/dashboard/explorer). Din 27 octombrie 2026, o solicitare poate plăti și cele trei [tokenuri de test Fest](#fest-tokens); cardul are atunci un rând **Tokenuri Fest** care listează ce a ajuns, sau o scurtă notă dacă doar QOR a trecut.

## Limite

Fiecare adresă poate solicita de la Faucet o singură dată per perioadă de așteptare (cooldown). Pagina afișează suma exactă per solicitare și perioada de cooldown înainte de a putea revendica din nou. Dacă soliciți din nou prea curând, Faucet-ul îți spune când vei fi din nou eligibil.

## Tokenuri de test Fest (fUSD, fETH, fBTC) {#fest-tokens}

Trei tokenuri de test suplimentare există pe testnet pentru fest-ul builderilor: **fUSD** (FestUSD, 6 zecimale), **fETH** (FestETH, 18 zecimale) și **fBTC** (FestBTC, 8 zecimale). Sunt tokenuri de test simple, fără valoare și fără legătură cu vreun activ real. Guvernanța testnet-ului le-a înregistrat în modulul ERC-20 (propunerea 26 a testnet-ului), astfel încât fiecare există atât ca contract ERC-20 pe EVM-ul testnet-ului, cât și ca monedă bank pe care portofelele și AMM-ul o pot deține. Faucet-ul este configurat să trimită câte puțin din fiecare odată cu o solicitare de QOR (la momentul scrierii, 27 octombrie 2026: 1.000 fUSD, 0,5 fETH și 0,02 fBTC, cu aceeași perioadă de cooldown de 24 de ore ca la QOR); pagina afișează sumele exacte lângă suma de QOR ori de câte ori Faucet-ul le plătește.

| Token | Zecimale | Contract ERC-20 pe EVM-ul testnet-ului | Denominația bank (sensibilă la majuscule) |
| --- | --- | --- | --- |
| fUSD | 6 | `0x97143B771D34ddb9130b807b135Ae675A5a963CA` | `erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA` |
| fETH | 18 | `0x02292293c13880a26242690eb70a0e42B8E91c28` | `erc20:0x02292293c13880a26242690eb70a0e42B8E91c28` |
| fBTC | 8 | `0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | `erc20:0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` |

De știut:

- **Doar pe testnet.** Tokenurile nu există pe mainnet.
- **Copiază denominația exact.** Partea de adresă este în format EIP-55 cu majuscule și minuscule mixte, iar denominația este comparată sensibil la majuscule.
- **Vezi-le on-chain.** `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` listează cele trei denominații cu simbolurile și numele lor de afișare.
- **Conversia între cele două forme.** Mutarea unui sold ERC-20 în monede bank (`MsgConvertERC20`) cere expeditorul ca adresă bech32 `qor1...`.
- **Pool-uri.** [AMM](/architecture/amm)-ul testnet-ului le poate pune în pool împotriva `uqor`; dacă există un pool este arătat de `GET /qorechain/amm/v1/pools`. Paginile [Portofel](/dashboard/wallet) și [Trade](/dashboard/trade) nu au o intrare dedicată pentru ele; verifică un sold cu `GET /cosmos/bank/v1beta1/balances/{address}`.

## Ce să faci cu tokenurile de test

Tokenurile de test îți permit să exersezi rețeaua de la cap la coadă pe testnet:

- Trimite și primește pe pagina [Wallet](/dashboard/wallet).
- Încearcă un [swap](/dashboard/trade) pe AMM.
- [Deleagă](/dashboard/staking-and-validators) către un validator.
- Fă deploy și testează contracte înainte de a trece la mainnet.

:::note Doar valoare de test
Tokenurile de la Faucet există pe testnet și nu au valoare reală. Când ești pregătit pentru utilizare în producție, comută la mainnet (`qorechain-vladi`).
:::
