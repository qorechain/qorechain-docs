---
slug: /getting-started/wallet-setup
title: Configurarea portofelului
sidebar_label: Configurarea portofelului
sidebar_position: 2
---

# Configurarea portofelului

QoreChain acceptă mai multe tipuri de portofele în mediile sale de execuție native, EVM și SVM. Alege portofelul care se potrivește cazului tău de utilizare.

:::note
Valorile de mai jos acoperă atât mainnet-ul **`qorechain-vladi`** (EVM chain ID **9801**, activ din 7 iunie 2026), cât și testnet-ul **`qorechain-diana`** (EVM chain ID **9800**). Endpoint-urile publice pentru ambele rețele sunt listate în [Rețele](/appendix/networks#public-endpoints).
:::

## Portofelul Keplr

Keplr este portofelul recomandat pentru tranzacțiile native QoreChain, staking și guvernanță.

### Adaugă QoreChain ca lanț personalizat

Deschide Keplr și navighează la **Settings > Add Custom Chain**, apoi introdu:

| Câmp               | Mainnet                    | Testnet                          |
| ------------------ | -------------------------- | -------------------------------- |
| Nume lanț          | `QoreChain`                | `QoreChain Diana Testnet`        |
| Chain ID           | `qorechain-vladi`          | `qorechain-diana`                |
| RPC URL            | `https://rpc.qore.host`    | `https://rpc-testnet.qore.host`  |
| REST URL           | `https://api.qore.host`    | `https://api-testnet.qore.host`  |
| Prefix Bech32      | `qor`                      | `qor`                            |
| Denominație monedă | `QOR`                      | `QOR`                            |
| Denominație minimă | `uqor`                     | `uqor`                           |
| Zecimale           | `6`                        | `6`                              |
| Coin Type (BIP-44) | `118`                      | `118`                            |

După adăugarea lanțului, Keplr generează o adresă `qor1...` pentru contul tău.

:::caution Prag minim al prețului gazului
Prețul minim al gazului în rețea este **0.1uqor**. Dacă configurezi treptele de preț al gazului din Keplr (de exemplu prin `suggestChain`), folosește valori **egale sau mai mari de 0.1** (valori sugerate low/average/high: `0.1 / 0.15 / 0.25`) — tranzacțiile semnate sub acest prag sunt respinse.
:::

## MetaMask (EVM)

MetaMask permite interacțiunea cu mediul de execuție EVM al QoreChain — implementează contracte Solidity, gestionează token-uri ERC-20 și folosește instrumentele Ethereum cu care ești deja obișnuit.

### Adaugă QoreChain ca rețea personalizată

Deschide MetaMask și navighează la **Settings > Networks > Add Network**, apoi introdu:

| Câmp               | Mainnet                   | Testnet                          |
| ------------------ | ------------------------- | -------------------------------- |
| Nume rețea         | `QoreChain`               | `QoreChain Diana Testnet`        |
| RPC URL            | `https://evm.qore.host`   | `https://evm-testnet.qore.host`  |
| Chain ID           | `9801`                    | `9800`                           |
| Simbol monedă      | `QOR`                     | `QOR`                            |
| URL explorator de blocuri | `https://explore.qore.network` | `https://explore.qore.network` |

QOR nativ are **18 zecimale** pe interfața EVM (în stil wei). Odată conectat, poți folosi MetaMask pentru a semna tranzacții EVM, a interacționa cu contractele inteligente implementate și a gestiona token-uri ERC-20 pe QoreChain.

### Înregistrarea rețelei printr-un singur apel

Pentru dApp-uri, pachetele **`@qorechain/wallet-adapter`** și **`@qorechain/connect`** (publicate pe npm) înregistrează QoreChain în portofelul utilizatorului printr-un singur apel — solicitând MetaMask să adauge rețeaua prin EIP-3085 (cu QOR nativ corect cu **18 zecimale** pe calea EVM) și configurând treptele de preț al gazului din Keplr:

```bash
npm install @qorechain/wallet-adapter @qorechain/connect
```

```ts
import { addQoreEvmToWallet } from "@qorechain/wallet-adapter";

await addQoreEvmToWallet(); // prompts MetaMask with QoreChain's EVM network params
```

## Portofele Solana (SVM)

Mediul de execuție SVM al QoreChain este compatibil cu instrumentele standard Solana, iar **soldul nativ QOR al contului este vizibil direct pe interfața SVM** (în lamports, 9 zecimale; 1 uqor = 1.000 lamports). Conectează orice portofel sau bibliotecă compatibilă cu Solana.

### Utilizarea @solana/web3.js

```javascript
import { Connection } from "@solana/web3.js";

// Public read-only endpoint (or http://localhost:8899 on your own node)
const connection = new Connection("https://svm.qore.host");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
```

Endpoint-urile publice SVM sunt **doar pentru citire**; trimiterea tranzacțiilor necesită propriul tău nod. Vezi [Dezvoltare SVM](/developer-guide/svm-development) pentru detalii.

## Portofele cu suport PQC (obligatorii pe calea Cosmos)

QoreChain impune criptografie post-cuantică hibridă (PQC) pe calea de tranzacții cosmos. Începând cu versiunea curentă a lanțului (**v3.1.82**), setarea implicită a rețelei este `hybrid_signature_mode = required` cu `allow_classical_fallback = false` — astfel **fiecare tranzacție pe calea cosmos trebuie să poarte o semnătură ML-DSA-87 (Dilithium-5) alături de semnătura standard secp256k1 (ECDSA)**. Tranzacțiile cosmos exclusiv clasice provenite dintr-un cont PQC sunt respinse.

:::caution Tranzacțiile Cosmos necesită extensia hibridă PQC
Trimiterea unei tranzacții clasice simple pe calea cosmos va fi respinsă. Trebuie să atașezi semnătura Dilithium-5 ca extensie de tranzacție `PQCHybridSignature`. Instrumentele standard CosmJS / Keplr nu produc singure această extensie — folosește comanda CLI `qorechaind tx pqc cosign`, semnarea hibridă din SDK-ul QoreChain (vezi mai jos) sau, pentru a o construi singur în cod, biblioteca open-source [**qorechain-pqc**](/developer-guide/post-quantum-signing) (`hybridSignBytes`). Singurele excepții sunt gentx-urile de la genesis și tranzacțiile de înregistrare/migrare a cheilor PQC.
:::

### Cum funcționează

Portofelele atașează o semnătură PQC ML-DSA-87 ca extensie de tranzacție, alături de semnătura standard secp256k1 (ECDSA). Semnătura clasică este calculată peste sign bytes care exclud extensia, astfel încât rămâne validă pentru verificarea clasică, în timp ce semnătura PQC oferă rezistență cuantică.

### Generează o cheie Dilithium-5

Generează o cheie post-cuantică pentru semnarea hibridă:

```bash
qorechaind tx pqc gen-key
```

### Înregistrare automată

Când incluzi o cheie publică PQC în prima ta tranzacție, QoreChain o înregistrează automat on-chain. Nu este necesar un pas separat de înregistrare. (Tranzacțiile de înregistrare/migrare a cheilor PQC sunt ele însele exceptate de la cerința hibridă, astfel încât un cont își poate inițializa prima cheie.)

### Semnarea hibridă cu SDK-ul

SDK-ul QoreChain produce tranzacții cosmos conforme prin `buildHybridTx` cu `includePqcPublicKey: true`, care atașează extensia Dilithium-5 și încorporează cheia publică pentru înregistrarea automată. Vezi [Conturi SDK și semnarea PQC](/sdk/concepts/accounts-pqc).

### Moduri PQC

Cele trei moduri de aplicare rămân controlate prin guvernanță; **setarea implicită curentă a rețelei este Required**:

| Mod                    | Descriere                                                                |
| ---------------------- | ------------------------------------------------------------------------ |
| **Disabled**           | Verificarea PQC este dezactivată. Doar semnături standard.                |
| **Optional**           | Tranzacțiile pot include semnături PQC. Dacă sunt prezente, sunt verificate. |
| **Required** (implicit) | Toate tranzacțiile pe calea cosmos trebuie să includă o semnătură PQC validă. |

Modul activ este configurat la nivelul lanțului și poate fi actualizat prin guvernanță.

:::note EVM / MetaMask nu este afectat
Fluxul MetaMask (EVM) de mai sus **nu** este afectat de cerința hibridă. Tranzacțiile EVM folosesc o cale ante separată `eth_secp256k1` și nu au niciodată nevoie de extensia PQC.
:::

## Portofel CLI

Binarul `qorechaind` include un sistem integrat de gestionare a cheilor pentru utilizare din linia de comandă.

### Creează o cheie nouă

```bash
qorechaind keys add mykey
```

Aceasta generează o nouă pereche de chei și afișează fraza mnemonică. **Păstrează fraza mnemonică în siguranță** — este singura modalitate de a recupera această cheie.

### Vizualizează-ți adresa

```bash
qorechaind keys show mykey -a
```

Aceasta afișează adresa ta bech32 `qor1...`.

### Listează toate cheile

```bash
qorechaind keys list
```

### Importă o cheie existentă

```bash
qorechaind keys add mykey --recover
```

Ți se va cere să introduci fraza mnemonică.

## Pașii următori

* [Prima ta tranzacție](/getting-started/first-transaction) — Trimite token-uri QOR folosind noul tău portofel
* [Conectarea la Testnet](/getting-started/connecting-to-testnet) — Alătură-te testnet-ului live Diana
