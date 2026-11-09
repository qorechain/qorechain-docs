---
slug: /getting-started/deploy-in-5-minutes
title: Implementați pe QoreChain în 5 minute
sidebar_label: Implementare în 5 minute
sidebar_position: 6
---

# Implementați pe QoreChain în 5 minute

Această pagină este pentru un dezvoltator Solidity care nu a folosit niciodată QoreChain. Păstrați Foundry sau Hardhat și cheia dumneavoastră MetaMask. Singurul lucru nou este o scurtă **fereastră de autorizare**: QoreChain protejează fiecare cont cu o cheie post-cuantică, o tranzacție Ethereum nu poate purta una, așa că deschideți mai întâi o fereastră delimitată, iar tranzacțiile EVM obișnuite sunt admise cât timp aceasta este deschisă. Pașii de mai jos folosesc **testnet-ul** (`qorechain-diana`, ID-ul EVM al chain-ului 9800), unde nimic nu costă bani reali.

:::note
Acest traseu a fost rulat pe testnet: o fereastră deschisă în QoreX, apoi un contract creat și apelat cu Foundry `cast` din aceeași frază de recuperare. `forge create` și Hardhat trimit același tip de tranzacție EVM, dar nu au făcut parte din acea rulare. O fereastră deschisă din linia de comandă `qorechaind` este de asemenea confirmată; vezi [Alternativă: linia de comandă](#cli).
:::

## De ce aveți nevoie {#what-you-need}

- Un cont MetaMask din care doriți să implementați, cu fraza sa de recuperare sau cheia privată.
- [QoreX](/qorex/overview), portofelul QoreChain (aplicație sau extensie de browser).
- Foundry sau Hardhat deja instalat.

## 1. Importați cheia MetaMask în QoreX ca cont coin-60 {#step-import}

Conturile QoreX folosesc implicit coin type 118. Un cont coin-118 are o cheie diferită de cea din MetaMask, deci nicio tranzacție MetaMask nu poate proveni din el, iar o fereastră deschisă pe el este inutilă. În QoreX deschideți **Your accounts** și atingeți **Add an Ethereum account (coin 60)**. Adresa sa `0x…` este cea pe care o arată MetaMask și este aceeași cheie cu o adresă `qor1…` pe QoreChain. Pentru primul cont Ethereum al unei fraze, aceasta este și adresa pe care Foundry o derivă din aceeași frază la indexul 0. Contul are propria adresă, așa că alimentați-l și selectați-l în QoreX înainte de pașii următori. Vezi [Restaurează o frază din MetaMask sau din Dashboard](/qorex/getting-started#restore-dashboard).

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

Folosiți **aceeași cheie alimentată** ca pentru contul coin-60; QoreX nu poate acționa ca semnatar Foundry, așa că oferiți lui Foundry sau Hardhat cheia privată (sau fraza cu `--mnemonic`). Setările rețelei:

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

Cu binarul de release `qorechaind` puteți face pașii 1, 4 și înregistrarea cheii post-cuantice fără QoreX. Comenzile complete (importul cheii, `tx pqc register-key-v2`, `tx pqc open-evm-window`, `tx pqc cosign`) se află în [Dezvoltare EVM](/developer-guide/evm-development) și în secțiunea [Fereastra de autorizare EVM](/developer-guide/evm-development#evm-window). O fereastră deschisă astfel, urmată de o tranzacție trimisă cu `cast`, este confirmată pe testnet.

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana

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
