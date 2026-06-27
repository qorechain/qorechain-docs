---
slug: /getting-started/wallet-setup
title: Configurarea portofelului
sidebar_label: Configurarea portofelului
sidebar_position: 2
---

# Configurarea portofelului

QoreChain acceptă mai multe tipuri de portofele în mediile sale native, EVM și SVM de execuție. Alegeți portofelul care corespunde cazului dumneavoastră de utilizare.

:::note
ID-urile de lanț și punctele finale RPC de mai jos vizează rețeaua de test **`qorechain-diana`** (EVM chain ID **9800**). Rețeaua principală (**`qorechain-vladi`**, EVM chain ID **9801**) este activă din 7 iunie 2026; valorile sale de conectare a portofelului sunt documentate pe pagina separată **Conectarea la rețeaua principală**.
:::

## Portofelul Keplr

Keplr este portofelul recomandat pentru tranzacțiile native QoreChain, staking și guvernanță.

### Adăugați QoreChain ca lanț personalizat

Deschideți Keplr și navigați la **Settings > Add Custom Chain**, apoi introduceți:

| Câmp               | Valoare                   |
| ------------------ | ------------------------- |
| Chain Name         | `QoreChain Diana Testnet` |
| Chain ID           | `qorechain-diana`         |
| RPC URL            | `http://localhost:26657`  |
| REST URL           | `http://localhost:1317`   |
| Bech32 Prefix      | `qor`                     |
| Coin Denom         | `QOR`                     |
| Coin Minimal Denom | `uqor`                    |
| Decimals           | `6`                       |

După adăugarea lanțului, Keplr generează o adresă `qor1...` pentru contul dumneavoastră. Folosiți această adresă pentru a primi token-uri QOR de pe rețeaua de test.

## MetaMask (EVM)

MetaMask permite interacțiunea cu mediul EVM de execuție al QoreChain — implementați contracte Solidity, gestionați token-uri ERC-20 și folosiți instrumentele Ethereum cunoscute.

### Adăugați QoreChain ca rețea personalizată

Deschideți MetaMask și navigați la **Settings > Networks > Add Network**, apoi introduceți:

| Câmp            | Valoare                 |
| --------------- | ----------------------- |
| Network Name    | `QoreChain EVM`         |
| RPC URL         | `http://localhost:8545` |
| Chain ID        | `9800`                  |
| Currency Symbol | `QOR`                   |

Odată conectat, puteți folosi MetaMask pentru a semna tranzacții EVM, a interacționa cu contracte inteligente implementate și a gestiona token-uri ERC-20 pe QoreChain.

## Portofele Solana (SVM)

Mediul SVM de execuție al QoreChain este compatibil cu instrumentele standard Solana. Conectați orice portofel sau bibliotecă compatibilă cu Solana pentru a interacționa cu programele SVM.

### Folosind @solana/web3.js

```javascript
import { Connection } from "@solana/web3.js";

const connection = new Connection("http://localhost:8899");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
```

Acest lucru permite implementarea și interacțiunea cu programele SVM care rulează pe QoreChain.

## Portofele cu suport PQC (necesare pe calea Cosmos)

QoreChain necesită criptografie hibridă post-cuantică (PQC) pe calea de tranzacții cosmos. Începând cu versiunea actuală a lanțului (**v3.1.77**), valoarea implicită a rețelei este `hybrid_signature_mode = required` cu `allow_classical_fallback = false` — astfel încât **fiecare tranzacție de pe calea cosmos trebuie să poarte o semnătură ML-DSA-87 (Dilithium-5) alături de semnătura standard secp256k1 (ECDSA)**. Tranzacțiile cosmos exclusiv clasice de la un cont PQC sunt respinse.

:::caution Tranzacțiile cosmos necesită extensia PQC hibridă
Trimiterea unei tranzacții pur clasice pe calea cosmos va fi respinsă. Trebuie să atașați semnătura Dilithium-5 ca extensie de tranzacție `PQCHybridSignature`. Instrumentele standard CosmJS / Keplr nu produc singure această extensie — folosiți comanda CLI `qorechaind tx pqc cosign`, semnarea hibridă a QoreChain SDK (vezi mai jos) sau, pentru a o construi singur în cod, biblioteca open-source [**qorechain-pqc**](/developer-guide/post-quantum-signing) (`hybridSignBytes`). Singurele excepții sunt gentxs de geneză și tranzacțiile de înregistrare/migrare a cheilor PQC.
:::

### Cum funcționează

Portofelele atașează o semnătură PQC ML-DSA-87 ca extensie de tranzacție alături de semnătura standard secp256k1 (ECDSA). Semnătura clasică este calculată peste octeții de semnare care exclud extensia, astfel încât rămâne validă pentru verificarea clasică, în timp ce semnătura PQC oferă rezistență cuantică.

### Generați o cheie Dilithium-5

Generați o cheie post-cuantică pentru semnarea hibridă:

```bash
qorechaind tx pqc gen-key
```

### Înregistrare automată

Când includeți o cheie publică PQC în prima dumneavoastră tranzacție, QoreChain o înregistrează automat pe lanț. Nu este necesar un pas separat de înregistrare. (Tranzacțiile de înregistrare/migrare a cheilor PQC sunt ele însele exceptate de la cerința hibridă, astfel încât un cont își poate inițializa prima cheie.)

### Semnarea hibridă cu SDK-ul

QoreChain SDK produce tranzacții cosmos conforme prin `buildHybridTx` cu `includePqcPublicKey: true`, care atașează extensia Dilithium-5 și încorporează cheia publică pentru înregistrarea automată. Vezi [Conturi SDK și semnarea PQC](/sdk/concepts/accounts-pqc).

### Moduri PQC

Cele trei moduri de aplicare rămân controlate prin guvernanță; **valoarea implicită actuală a rețelei este Required (necesar)**:

| Mod                    | Descriere                                                                |
| ---------------------- | ----------------------------------------------------------------------- |
| **Disabled**           | Verificarea PQC este dezactivată. Doar semnături standard.              |
| **Optional**           | Tranzacțiile pot include semnături PQC. Dacă sunt prezente, sunt verificate. |
| **Required** (implicit) | Toate tranzacțiile de pe calea cosmos trebuie să includă o semnătură PQC validă. |

Modul activ este configurat la nivel de lanț și poate fi actualizat prin guvernanță.

:::note EVM / MetaMask neafectat
Fluxul MetaMask (EVM) de mai sus **nu** este afectat de cerința hibridă. Tranzacțiile EVM folosesc o cale ante separată `eth_secp256k1` și nu au nevoie niciodată de extensia PQC.
:::

## Portofel CLI

Binarul `qorechaind` include un sistem integrat de gestionare a cheilor pentru utilizarea din linia de comandă.

### Creați o cheie nouă

```bash
qorechaind keys add mykey
```

Acest lucru generează o nouă pereche de chei și afișează fraza mnemonică. **Stocați mnemonica în siguranță** — este singura modalitate de a recupera această cheie.

### Vizualizați adresa dumneavoastră

```bash
qorechaind keys show mykey -a
```

Acest lucru afișează adresa dumneavoastră bech32 `qor1...`.

### Listați toate cheile

```bash
qorechaind keys list
```

### Importați o cheie existentă

```bash
qorechaind keys add mykey --recover
```

Vi se va cere să introduceți fraza dumneavoastră mnemonică.

## Pașii următori

* [Prima dumneavoastră tranzacție](/getting-started/first-transaction) — Trimiteți token-uri QOR folosind noul dumneavoastră portofel
* [Conectarea la rețeaua de test](/getting-started/connecting-to-testnet) — Alăturați-vă rețelei de test Diana active
