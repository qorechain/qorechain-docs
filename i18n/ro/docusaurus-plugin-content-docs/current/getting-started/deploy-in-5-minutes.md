---
slug: /getting-started/deploy-in-5-minutes
title: Implementați pe QoreChain în 5 minute
sidebar_label: Implementare în 5 minute
sidebar_position: 6
---

# Implementați pe QoreChain în 5 minute

Această pagină este pentru un dezvoltator Solidity care nu a folosit niciodată QoreChain. Păstrați Foundry sau Hardhat și aceeași frază de recuperare pe care o folosiți pentru MetaMask. Singurul lucru nou este o scurtă **fereastră de autorizare**: QoreChain protejează fiecare cont cu o cheie post-cuantică, o tranzacție Ethereum nu poate purta una, așa că deschideți mai întâi o fereastră delimitată, iar tranzacțiile EVM obișnuite sunt admise cât timp aceasta este deschisă. Pașii de mai jos folosesc **testnet-ul** (`qorechain-diana`, ID-ul EVM al chain-ului 9800), unde nimic nu costă bani reali.

:::note
Acest traseu a fost rulat pe testnet: o fereastră deschisă în QoreX, apoi un contract creat și apelat cu Foundry `cast` din aceeași frază de recuperare. `forge create` și Hardhat trimit același tip de tranzacție EVM, dar nu au făcut parte din acea rulare. O fereastră deschisă din linia de comandă `qorechaind` este de asemenea confirmată; vezi [Alternativă: linia de comandă](#cli).
:::

## De ce aveți nevoie {#what-you-need}

- Fraza de recuperare a contului din care doriți să implementați. QoreX nu poate importa o cheie privată brută. Dacă aveți doar o cheie privată, folosiți în schimb [linia de comandă](#cli).
- [QoreX](/qorex/overview), portofelul QoreChain (aplicație sau extensie de browser).
- Foundry sau Hardhat deja instalat.

## 1. Adăugați un cont coin-60 în QoreX {#step-import}

Lane-ul EVM funcționează doar cu o cheie `eth_secp256k1` (coin type 60). O cheie Cosmos secp256k1 standard (coin type 118, implicitul din QoreX) nu poate semna pentru adresa sa EVM, deci o fereastră deschisă pe un cont coin-118 este inutilă pentru uneltele EVM. Aveți nevoie de un **cont Ethereum (coin 60)**. În QoreX deschideți **Your accounts** și atingeți **Add an Ethereum account (coin 60)**. QoreX îl derivă din **propria frază de recuperare** a portofelului, cu calea Ethereum `m/44'/60'`. Adresa sa `0x…` este aceeași cu cea din MetaMask sau Foundry doar dacă acestea folosesc exact aceeași frază (pentru Foundry, calea de derivare `m/44'/60'/0'/0/0`, indexul 0). Dacă contul dumneavoastră MetaMask provine dintr-o altă frază, QoreX arată o adresă diferită, iar o fereastră deschisă acolo nu acoperă cheia cu care implementați. Adresa `0x…` este aceeași cheie cu o adresă `qor1…` pe QoreChain.

Contul are propria adresă, așa că alimentați-l și selectați-l în QoreX înainte de pașii următori. Vezi [Restaurează o frază din MetaMask sau din Dashboard](/qorex/getting-started#restore-dashboard).

:::caution Nu lipiți niciodată o frază de producție în uneltele de dezvoltare
Folosiți o frază de recuperare creată pentru testare, doar cu QOR de test. Nu introduceți în Foundry, Hardhat sau într-un script fraza unui cont care deține fonduri reale.
:::

## 2. Comutați QoreX pe testnet {#step-testnet}

- **Aplicație:** Settings → **Use testnet (developers)**.
- **Extensie de browser:** deblocați-o, atingeți de șapte ori numărul versiunii din partea de jos, apoi alegeți **Switch to testnet (diana)**.

Insigna rețelei de pe Home se schimbă în TESTNET.

## 3. Obțineți QOR de testnet {#step-faucet}

Solicitați QOR de testnet pentru adresa dumneavoastră `0x…` sau `qor1…` de la [Dashboard Faucet](/dashboard/faucet). Este același sold pe ambele forme ale adresei.

## 4. Deschideți fereastra EVM în QoreX {#step-window}

- **Extensie și aplicație:** cardul intitulat **MetaMask on QoreChain** (cu un semn **0x**) din fereastra principală sau de pe Home. Acesta deschide ecranul **EVM access window**.
- **Aplicație:** și Settings → Security → **EVM access window**.

Dacă acest cont nu are încă o cheie post-cuantică, QoreX o înregistrează pentru dumneavoastră la acest pas. Înregistrarea costă 0.09 QOR, o singură dată pe cont, iar tranzacția ferestrei își plătește separat propriul comision de rețea. Apoi alegeți trei limite:

| Câmp | Interval | Valoare implicită QoreX |
|---|---|---|
| Blocks (cât timp rămâne deschisă fereastra) | 1 până la 17,280 | 300 |
| Max transactions | 1 până la 1,000 | 5 |
| Spending cap, în QOR | peste 0 | 1 |

Plafonul de cheltuieli numără valoarea fiecărei tranzacții **plus comisionul ei maxim** (limita de gaz înmulțită cu plafonul comisionului), nu doar ce transferă. O implementare de contract nu mută niciun QOR, dar tot își numără comisionul maxim: o implementare de 3,000,000 de gaz trimisă de Hardhat numără aproximativ 0.64 QOR.

Pentru o sesiune de implementare, valorile implicite sunt prea mici. O alegere rezonabilă este 3,000 de blocuri (aproximativ o oră pe testnet), 20 de tranzacții și un plafon de 10 QOR. Păstrați-le cât mai mici permite sesiunea dumneavoastră și închideți fereastra când ați terminat.

:::caution Deschideți mai întâi fereastra
Deschiderea unei ferestre avansează nonce-ul contului. Deschideți-o **înainte** de a implementa: o tranzacție semnată mai devreme este refuzată cu „nonce too low".
:::

## 5. Implementați cu Foundry sau Hardhat {#step-deploy}

Folosiți cheia **aceluiași cont coin-60 alimentat**. QoreX nu poate acționa ca semnatar Foundry, așa că oferiți lui Foundry sau Hardhat cheia din aceeași frază de recuperare, de exemplu `--mnemonic` cu indexul 0 în Foundry. Setările rețelei:

| Setare | Valoare |
|---|---|
| RPC URL | `https://evm-testnet.qore.host` |
| Chain ID | `9800` |
| Monedă | QOR, 18 zecimale |

**Foundry**

```bash
export ETH_RPC_URL=https://evm-testnet.qore.host

forge create src/Counter.sol:Counter --private-key $DEPLOYER_KEY --broadcast
cast send <contract> "increment()" --private-key $DEPLOYER_KEY
cast call <contract> "number()(uint256)"
```

**Hardhat**

```js
// hardhat.config.js
module.exports = {
  solidity: "0.8.24",
  networks: {
    diana: {
      url: "https://evm-testnet.qore.host",
      chainId: 9800,
      accounts: [process.env.DEPLOYER_KEY],
    },
  },
};
```

```bash
DEPLOYER_KEY=0x... npx hardhat run scripts/deploy.js --network diana
```

Fiecare tranzacție pe care o trimiteți (implementare sau apel) consumă una dintre tranzacțiile ferestrei. Citirile (`cast call`, funcțiile view, estimarea gazului) nu au nevoie de fereastră și nu consumă nimic din ea.

## Verificați fereastra și tratați expirarea {#check-and-expiry}

O fereastră **expiră**: când blocurile, tranzacțiile sau plafonul de cheltuieli se epuizează, lane-ul EVM refuză următoarea dumneavoastră tranzacție cu `no open EVM authorisation window` sau `EVM authorisation window exhausted`. Deschideți una nouă în QoreX; o fereastră nouă o înlocuiește pe cea veche.

Pentru a-i vedea starea, folosiți fila **PQ key status** de pe [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers) (vezi [Developers](/dashboard/developers)) sau ruta REST:

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_window/<qor1-address>
```

`live: true` împreună cu `remaining_blocks`, `remaining_txs` și `remaining_value` (în `uqor`) înseamnă că este deschisă.

## Alternativă: linia de comandă {#cli}

Cu binarul de release `qorechaind` puteți importa o cheie privată brută, înregistra cheia sa post-cuantică și deschide fereastra fără QoreX. Aceasta este calea pentru un dezvoltator care are doar o cheie privată. `gen-key` și `cosign` nu există într-un build comunitar, deci este nevoie de binarul de release. Regulile ferestrei se află în secțiunea [Fereastra de autorizare EVM](/developer-guide/evm-development#evm-window) din [Dezvoltare EVM](/developer-guide/evm-development). O fereastră deschisă astfel, urmată de o tranzacție trimisă cu `cast`, este confirmată pe testnet.

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana

# import the private key as an eth_secp256k1 key: the qor1... and 0x... addresses are one account
qorechaind keys import-hex deployer <private-key-hex-without-0x> --key-type eth_secp256k1

# register a post-quantum key once per account (back up the .dilithium file)
qorechaind tx pqc gen-key deployer-mldsa
qorechaind tx pqc register-key-v2 dilithium5 <public_key_hex> hybrid --pqc-key deployer-mldsa \
  --from deployer --chain-id $QCHAIN --node $QNODE --gas auto --gas-adjustment 1.3 --gas-prices 0.2uqor

# open the window

qorechaind tx pqc open-evm-window 3000 20 10qor --from deployer \
  --chain-id $QCHAIN --node $QNODE --gas 400000 --fees 80000uqor --generate-only > window.json
qorechaind tx pqc cosign window.json --from deployer --pqc-key deployer-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Nu restrângeți o fereastră de implementare cu `--native-only` sau `--allowed-targets`: ambele refuză crearea de contracte. Sunt pentru sesiuni ulterioare, după ce contractul există.

## Ce este diferit pe testnet {#diana-notes}

- **CosmWasm** acceptă pe testnet doar coduri aprobate prin guvernanță, deci nu vă puteți încărca acolo propriul contract. Solidity este calea deschisă.
- **SVM** nu este disponibil.
- Mainnet funcționează la fel, cu ID-ul chain-ului 9801 și `https://evm.qore.host`, dar începeți pe testnet.

## Erori frecvente {#errors}

| Mesaj | Cauză | Remediere |
|---|---|---|
| `account ... has no registered post-quantum key` | contul nu are o cheie ML-DSA-87 | deschideți o fereastră în QoreX, care o înregistrează, sau înregistrați-o din linia de comandă |
| `no open EVM authorisation window` | nu există fereastră sau a expirat | deschideți o fereastră |
| `EVM authorisation window exhausted` | tranzacțiile sau plafonul de cheltuieli au fost epuizate | deschideți o fereastră nouă cu limite mai mari |
| `nonce too low` | fereastra a fost deschisă după ce ați semnat | deschideți mai întâi fereastra, apoi trimiteți |
| `only replay-protected (EIP-155) Ethereum transactions are accepted` | o tranzacție semnată fără ID de chain | setați `chainId` în configurația rețelei |

Următorii pași: [Dezvoltare EVM](/developer-guide/evm-development), [Securitatea și recuperarea în QoreX](/qorex/security-and-recovery#evm-window), [Developers](/dashboard/developers).
