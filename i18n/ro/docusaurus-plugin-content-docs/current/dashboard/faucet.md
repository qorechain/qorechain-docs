---
slug: /dashboard/faucet
title: Faucet
sidebar_label: Faucet
sidebar_position: 9
---

# Faucet

**Faucet**-ul îți oferă tokenuri de test gratuite, astfel încât să poți încerca Dashboard-ul fără a cheltui ceva de valoare. Este un instrument **doar pentru testnet** — folosește-l pe testnet (`qorechain-diana`) pentru a-ți alimenta adresa înainte de a testa transferuri, swap-uri, staking și deploy de contracte.

## Solicită tokenuri de test

1. Conectează-te la **testnet** și deschide **Faucet**-ul.
2. Introdu adresa de alimentat (`qor1...`). Dacă portofelul tău este conectat, selectează **Use my address** pentru a o completa automat. Formularul confirmă faptul că adresa este validă înainte de a putea continua.
3. Selectează butonul de solicitare. Alimentarea este procesată în câteva secunde.

Când solicitarea reușește, un card de confirmare afișează suma trimisă și hash-ul tranzacției, cu un buton de copiere și un link pentru a deschide tranzacția în [Explorer](/dashboard/explorer).

## Limite

Fiecare adresă poate solicita de la Faucet o singură dată per perioadă de așteptare (cooldown). Pagina afișează suma exactă per solicitare și perioada de cooldown înainte de a putea revendica din nou. Dacă soliciți din nou prea curând, Faucet-ul îți spune când vei fi din nou eligibil.

## Ce să faci cu tokenurile de test

Tokenurile de test îți permit să exersezi rețeaua de la cap la coadă pe testnet:

- Trimite și primește pe pagina [Wallet](/dashboard/wallet).
- Încearcă un [swap](/dashboard/trade) pe AMM.
- [Deleagă](/dashboard/staking-and-validators) către un validator.
- Fă deploy și testează contracte înainte de a trece la mainnet.

:::note Doar valoare de test
Tokenurile de la Faucet există pe testnet și nu au valoare reală. Când ești pregătit pentru utilizare în producție, comută la mainnet (`qorechain-vladi`).
:::
