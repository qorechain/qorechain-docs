---
slug: /getting-started/wallet-setup
title: Configurarea portofelului
sidebar_label: Configurarea portofelului
sidebar_position: 2
---

# Configurarea portofelului

QoreChain acceptă mai multe tipuri de portofele în mediile sale de execuție native, EVM și SVM. Alege portofelul care se potrivește cazului tău de utilizare.

:::note
ID-urile de lanț și punctele finale RPC de mai jos vizează rețeaua de testare **`qorechain-diana`** (EVM chain ID **9800**). Mainnet-ul (**`qorechain-vladi`**, EVM chain ID **9801**) este activ din 7 iunie 2026; valorile sale de conectare a portofelului sunt documentate pe pagina separată **Connecting to Mainnet**.
:::

## Portofelul Keplr

Keplr este portofelul recomandat pentru tranzacțiile native QoreChain, staking și guvernanță.

### Adaugă QoreChain ca lanț personalizat

Deschide Keplr și navighează la **Settings > Add Custom Chain**, apoi introdu:

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

După adăugarea lanțului, Keplr generează o adresă `qor1...` pentru contul tău. Folosește această adresă pentru a primi token-uri QOR de testare.

## MetaMask (EVM)

MetaMask permite interacțiunea cu mediul de execuție EVM al QoreChain — implementarea de contracte Solidity, gestionarea token-urilor ERC-20 și utilizarea instrumentelor Ethereum familiare.

### Adaugă QoreChain ca rețea personalizată

Deschide MetaMask și navighează la **Settings > Networks > Add Network**, apoi introdu:

| Câmp            | Valoare                 |
| --------------- | ----------------------- |
| Network Name    | `QoreChain EVM`         |
| RPC URL         | `http://localhost:8545` |
| Chain ID        | `9800`                  |
| Currency Symbol | `QOR`                   |

După conectare, poți folosi MetaMask pentru a semna tranzacții EVM, pentru a interacționa cu contracte inteligente implementate și pentru a gestiona token-uri ERC-20 pe QoreChain.

### Înregistrarea rețelei printr-un singur apel

Pentru dApp-uri, pachetele **`@qorechain/wallet-adapter`** și **`@qorechain/connect`** (publicate pe npm, v0.1.0) înregistrează QoreChain în portofelul utilizatorului printr-un singur apel — solicitând MetaMask să adauge rețeaua prin EIP-3085 (cu QOR-ul nativ corect cu **18 zecimale** pe magistrala EVM) și configurând treapta de preț al gazului din Keplr:

```bash
npm install @qorechain/wallet-adapter @qorechain/connect
```

```ts
import { addQoreEvmToWallet } from "@qorechain/wallet-adapter";

await addQoreEvmToWallet(); // prompts MetaMask with QoreChain's EVM network params
```

## Portofele Solana (SVM)

Mediul de execuție SVM al QoreChain este compatibil cu instrumentele standard Solana. Conectează orice portofel sau bibliotecă compatibilă cu Solana pentru a interacționa cu programele SVM.

### Folosind @solana/web3.js

```javascript
import { Connection } from "@solana/web3.js";

const connection = new Connection("http://localhost:8899");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
```

Acest lucru permite implementarea și interacțiunea cu programele SVM care rulează pe QoreChain.

## Portofele cu PQC activat (obligatoriu pe calea Cosmos)

QoreChain necesită criptografie hibridă post-cuantică (PQC) pe calea de tranzacționare cosmos. Începând cu versiunea actuală a lanțului (**v3.1.80**), valoarea implicită a rețelei este `hybrid_signature_mode = required` cu `allow_classical_fallback = false` — astfel încât **fiecare tranzacție pe calea cosmos trebuie să poarte o semnătură ML-DSA-87 (Dilithium-5) alături de semnătura standard secp256k1 (ECDSA)**. Tranzacțiile cosmos doar clasice de la un cont PQC sunt respinse.

:::caution Tranzacțiile cosmos necesită extensia hibridă PQC
Trimiterea unei tranzacții clasice simple pe calea cosmos va fi respinsă. Trebuie să atașezi semnătura Dilithium-5 ca extensie de tranzacție `PQCHybridSignature`. Instrumentele standard CosmJS / Keplr nu produc singure această extensie — folosește comanda CLI `qorechaind tx pqc cosign`, semnarea hibridă din SDK-ul QoreChain (vezi mai jos) sau, pentru a o construi singur în cod, biblioteca open-source [**qorechain-pqc**](/developer-guide/post-quantum-signing) (`hybridSignBytes`). Singurele excepții sunt gentx-urile genesis și tranzacțiile de înregistrare/migrare a cheilor PQC.
:::

### Cum funcționează

Portofelele atașează o semnătură PQC ML-DSA-87 ca extensie de tranzacție alături de semnătura standard secp256k1 (ECDSA). Semnătura clasică este calculată peste octeții de semnare care exclud extensia, astfel încât rămâne validă pentru verificarea clasică, în timp ce semnătura PQC oferă rezistență cuantică.

### Generează o cheie Dilithium-5

Generează o cheie post-cuantică pentru semnarea hibridă:

```bash
qorechaind tx pqc gen-key
```

### Înregistrare automată

Când incluzi o cheie publică PQC în prima ta tranzacție, QoreChain o înregistrează automat pe lanț. Nu este necesar niciun pas separat de înregistrare. (Tranzacțiile de înregistrare/migrare a cheilor PQC sunt ele însele scutite de cerința hibridă, astfel încât un cont își poate inițializa prima cheie.)

### Semnarea hibridă cu SDK-ul

SDK-ul QoreChain produce tranzacții cosmos conforme prin `buildHybridTx` cu `includePqcPublicKey: true`, care atașează extensia Dilithium-5 și încorporează cheia publică pentru înregistrare automată. Vezi [SDK Accounts & PQC signing](/sdk/concepts/accounts-pqc).

### Moduri PQC

Cele trei moduri de aplicare rămân controlate de guvernanță; **valoarea implicită actuală a rețelei este Required**:

| Mod                     | Descriere                                                                |
| ----------------------- | ----------------------------------------------------------------------- |
| **Disabled**            | Verificarea PQC este dezactivată. Doar semnături standard.              |
| **Optional**            | Tranzacțiile pot include semnături PQC. Dacă sunt prezente, sunt verificate. |
| **Required** (implicit) | Toate tranzacțiile pe calea cosmos trebuie să includă o semnătură PQC validă. |

Modul activ este configurat la nivelul lanțului și poate fi actualizat prin guvernanță.

:::note EVM / MetaMask neafectat
Fluxul MetaMask (EVM) de mai sus **nu** este afectat de cerința hibridă. Tranzacțiile EVM folosesc o cale ante `eth_secp256k1` separată și nu au niciodată nevoie de extensia PQC.
:::

## Portofel CLI

Binarul `qorechaind` include un sistem integrat de gestionare a cheilor pentru utilizarea din linia de comandă.

### Creează o cheie nouă

```bash
qorechaind keys add mykey
```

Acest lucru generează o nouă pereche de chei și afișează fraza mnemonică. **Stochează mnemonica în siguranță** — este singura modalitate de a recupera această cheie.

### Vizualizează adresa ta

```bash
qorechaind keys show mykey -a
```

Acest lucru produce adresa ta bech32 `qor1...`.

### Listează toate cheile

```bash
qorechaind keys list
```

### Importă o cheie existentă

```bash
qorechaind keys add mykey --recover
```

Vei fi solicitat să introduci fraza ta mnemonică.

## Pașii următori

* [Your First Transaction](/getting-started/first-transaction) — Trimite token-uri QOR folosind noul tău portofel
* [Connecting to Testnet](/getting-started/connecting-to-testnet) — Alătură-te rețelei de testare Diana active
