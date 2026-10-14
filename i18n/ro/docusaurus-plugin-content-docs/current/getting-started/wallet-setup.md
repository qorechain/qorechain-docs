---
slug: /getting-started/wallet-setup
title: Configurarea portofelului
sidebar_label: Configurarea portofelului
sidebar_position: 2
---

# Configurarea portofelului

QoreChain acceptă mai multe tipuri de portofele în mediile sale de execuție native, EVM și SVM. Alege portofelul care se potrivește cazului tău de utilizare.

:::note
Valorile de mai jos acoperă atât mainnet-ul **`qorechain-vladi`** (EVM chain ID **9801**, activ din 29 iunie 2026), cât și testnet-ul **`qorechain-diana`** (EVM chain ID **9800**). Endpoint-urile publice pentru ambele rețele sunt listate în [Rețele](/appendix/networks#public-endpoints).
:::

## QoreX (recomandat) {#qorex}

**QoreX** este portofelul oficial, non-custodial, al QoreChain — o aplicație mobilă (Android, iOS) și o extensie de browser (Chrome, Firefox, Safari pe macOS). Semnează fiecare transfer pe calea Native cu semnătura hibridă post-cuantică obligatorie, îți înregistrează cheia post-cuantică în locul tău, acceptă staking, @handle-uri și rețele externe și se asociază cu Dashboard-ul. Deschide, de asemenea, [fereastra de autorizare EVM](/getting-started/first-transaction#evm-window) de care au nevoie tranzacțiile MetaMask. Începe cu [ghidul QoreX](/qorex/overview) și [Primii pași](/qorex/getting-started).

## Portofelul Keplr

Keplr poate adăuga QoreChain ca lanț personalizat (mai jos) pentru a vedea soldurile și a primi fonduri pe calea Native. Deoarece QoreChain cere o co-semnătură post-cuantică pe calea Native, trimite, fă staking și votează cu un portofel compatibil PQC, cum este [QoreX](/qorex/overview), nu doar cu Keplr.

### Adaugă QoreChain ca lanț personalizat

Deschide Keplr și navighează la **Settings > Add Custom Chain**, apoi introdu:

| Câmp               | Mainnet                    | Testnet                          |
| ------------------ | -------------------------- | -------------------------------- |
| Numele lanțului    | `QoreChain`                | `QoreChain Diana Testnet`        |
| Chain ID           | `qorechain-vladi`          | `qorechain-diana`                |
| URL RPC            | `https://rpc.qore.host`    | `https://rpc-testnet.qore.host`  |
| URL REST           | `https://api.qore.host`    | `https://api-testnet.qore.host`  |
| Prefix Bech32      | `qor`                      | `qor`                            |
| Denominare monedă  | `QOR`                      | `QOR`                            |
| Denominare minimă  | `uqor`                     | `uqor`                           |
| Zecimale           | `6`                        | `6`                              |
| Coin Type (BIP-44) | `118`                      | `118`                            |

După adăugarea lanțului, Keplr generează o adresă `qor1...` pentru contul tău.

:::caution Pragul minim al prețului gazului
Prețul minim al gazului în rețea este **0.1uqor**. Dacă configurezi treptele de preț al gazului din Keplr (de exemplu prin `suggestChain`), folosește valori **egale cu sau peste 0.1** (valori sugerate low/average/high: `0.1 / 0.15 / 0.25`) — tranzacțiile semnate sub acest prag sunt respinse.
:::

## MetaMask (EVM)

MetaMask permite interacțiunea cu mediul de execuție EVM al QoreChain — implementează contracte Solidity, gestionează token-uri ERC-20 și folosește instrumentele Ethereum cu care ești deja familiarizat.

### Adaugă QoreChain ca rețea personalizată

Deschide MetaMask și navighează la **Settings > Networks > Add Network**, apoi introdu:

| Câmp               | Mainnet                   | Testnet                          |
| ------------------ | ------------------------- | -------------------------------- |
| Numele rețelei     | `QoreChain`               | `QoreChain Diana Testnet`        |
| URL RPC            | `https://evm.qore.host`   | `https://evm-testnet.qore.host`  |
| Chain ID           | `9801`                    | `9800`                           |
| Simbolul monedei   | `QOR`                     | `QOR`                            |
| URL explorator de blocuri | `https://explore.qore.network` | `https://explore.qore.network` |

QOR nativ are **18 zecimale** pe interfața EVM (în stil wei). Odată conectat, poți folosi MetaMask pentru a semna tranzacții EVM, a interacționa cu contractele inteligente implementate și a gestiona token-uri ERC-20 pe QoreChain.

:::caution EVM / MetaMask necesită o cheie PQC și o fereastră deschisă
MetaMask semnează în continuare normal, dar calea EVM admite tranzacții doar de la un cont care are o cheie post-cuantică înregistrată și o **fereastră de autorizare EVM** deschisă (v3.2.0 și ulterior). Înregistrează-ți cheia o singură dată, apoi deschide o fereastră înainte de o sesiune de activitate EVM — vezi [Fereastra de autorizare EVM](/getting-started/first-transaction#evm-window). MetaMask nu poate deschide singur fereastra; deschide-o în [QoreX](/qorex/security-and-recovery#evm-window) sau cu CLI. Adăugarea rețelei în MetaMask (mai sus) rămâne neschimbată.
:::

### Înregistrarea rețelei printr-un singur apel

Pentru dApp-uri, pachetul **`@qorechain/wallet-adapter`** (publicat pe npm) înregistrează QoreChain în portofelul utilizatorului printr-un singur apel — solicitând MetaMask să adauge rețeaua prin EIP-3085 (cu QOR nativ corect la **18 zecimale** pe calea EVM) — și oferă `qoreChainInfo` pentru sugestia de lanț Keplr (inclusiv treapta de preț al gazului):

```bash
npm install @qorechain/wallet-adapter
```

```ts
import { addQoreEvmToWallet } from "@qorechain/wallet-adapter";

// pass the EIP-1193 provider and the network parameters (rpcUrl is required)
await addQoreEvmToWallet(window.ethereum, {
  evmChainId: 9801,                       // 9800 for the testnet
  rpcUrl: "https://evm.qore.host",        // https://evm-testnet.qore.host for the testnet
  explorerUrl: "https://explore.qore.network",
  testnet: false,                         // true for the testnet
});
```

## Un cont, trei adrese (conturi unificate) {#unified-accounts}

Începând cu versiunea de lanț **v3.1.83**, un cont QoreChain este **o singură identitate de 20 de octeți cu trei codificări**: `qor1…` (Native), `0x…` (EVM) și o formă base58 (SVM). Acesta deține **un singur sold** și — pentru conturile eth-native — **semnează pe toate cele trei căi cu o singură cheie**, inclusiv semnătura hibridă post-cuantică obligatorie pe calea Native.

Generează un portofel unificat în cod cu `@qorechain/wallet-adapter`:

```js
import { generateQoreWallet } from "@qorechain/wallet-adapter";

const w = await generateQoreWallet();          // or walletFromMnemonic(mnemonic)
console.log(w.cosmos);                         // qor1...
console.log(w.evm);                            // 0x... (same identity)
console.log(w.svm);                            // base58 (same identity)
// Native-lane sends use signHybridEth (classical eth_secp256k1 + ML-DSA-87 hybrid); pass `rest` so the sign-bytes form is resolved.
```

Fondurile trimise către oricare dintre cele trei forme ajung în același sold.

## Portofele conectate: Phantom și MetaMask drept chei de cheltuire {#linked-wallets}

:::caution Dezactivat momentan pe ambele rețele
Funcțiile de cont inteligent și de portofel conectat sunt implementate, dar **dezactivate** pe ambele rețele (`abstractaccount.enabled = false`): înregistrarea unui authenticator și execuția prin intermediul unuia sunt refuzate cât timp indicatorul este dezactivat. Verifică `GET /qorechain/abstractaccount/v1/config` înainte de a oferi un flux de conectare. Secțiunea de mai jos descrie comportamentul proiectat.
:::

Proiectat astfel încât să nu fii nevoit să îți expui cheia rădăcină pentru a cheltui dintr-un cont QoreChain într-un dApp (introdus în versiunea de lanț **v3.1.85**): o cheie **Phantom** (ed25519) sau **MetaMask** (prin adresa sa Ethereum, via `personal_sign`) poate fi **înregistrată ca authenticator** pe contul tău — cu permisiuni delimitate, limite de cheltuire, o dată de expirare și revocare instantanee — și apoi poate autoriza transferuri retransmise de backend-ul dApp-ului. Vezi [Linked Wallet Authenticators](/developer-guide/account-abstraction#authenticators) pentru modelul complet și cod, precum și [ghidul SDK Authenticators](/sdk/guides/authenticators) pentru exemple cap-coadă.

## Portofele Solana (SVM)

:::caution Trimiterea tranzacțiilor SVM este dezactivată momentan
Calea de execuție SVM este **dezactivată în prezent la nivelul întregii rețele pentru trimiterea tranzacțiilor** — nu trimite tranzacții printr-un portofel compatibil cu Solana către QoreChain în acest moment. Citirea soldurilor/slot-urilor poate funcționa în continuare; vezi [SVM Development](/developer-guide/svm-development) pentru stadiul actual.
:::

Mediul de execuție SVM al QoreChain este compatibil cu instrumentele standard Solana, iar **soldul nativ QOR al contului este vizibil direct pe interfața SVM** (în lamports, 9 zecimale; 1 uqor = 1.000 lamports). Conectează orice portofel sau bibliotecă compatibilă cu Solana.

### Utilizarea @solana/web3.js

```javascript
import { Connection } from "@solana/web3.js";

// Public read-only endpoint (or http://localhost:8899 on your own node)
const connection = new Connection("https://svm.qore.host");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
```

Endpoint-urile publice SVM sunt **doar pentru citire**; trimiterea tranzacțiilor necesită propriul tău nod. Vezi [SVM Development](/developer-guide/svm-development) pentru detalii.

## Portofele cu suport PQC (obligatoriu pe calea Cosmos)

QoreChain impune criptografie hibridă post-cuantică (PQC) pe calea de tranzacții cosmos. Pe rețelele live (v3.2.x), setarea implicită a rețelei este `hybrid_signature_mode = required` cu `allow_classical_fallback = false` — astfel încât **fiecare tranzacție pe calea cosmos trebuie să poarte o semnătură ML-DSA-87 (Dilithium-5) alături de semnătura standard secp256k1 (ECDSA)**. Tranzacțiile cosmos exclusiv clasice provenite de la un cont PQC sunt respinse.

:::caution Tranzacțiile Cosmos necesită extensia hibridă PQC
Trimiterea unei tranzacții clasice simple pe calea cosmos va fi respinsă. Trebuie să atașezi semnătura Dilithium-5 ca extensie de tranzacție `PQCHybridSignature`. Instrumentele standard CosmJS / Keplr nu produc singure această extensie — folosește comanda CLI `qorechaind tx pqc cosign`, semnarea hibridă din SDK-ul QoreChain (vezi mai jos) sau, pentru a o construi singur în cod, biblioteca open-source [**qorechain-pqc**](/developer-guide/post-quantum-signing) (`hybridSignBytes`). Singurele excepții sunt gentx-urile de la genesis, tranzacțiile de înregistrare/migrare a cheilor PQC și un unjail de la un cont de operator care nu are nicio cheie înregistrată.
:::

### Cum funcționează

Portofelele atașează o semnătură PQC ML-DSA-87 ca extensie de tranzacție alături de semnătura standard secp256k1 (ECDSA). Semnătura clasică este calculată peste sign bytes care exclud extensia, astfel încât rămâne validă pentru verificarea clasică, în timp ce semnătura PQC oferă rezistență cuantică.

### Generează o cheie Dilithium-5

Generează o cheie post-cuantică pentru semnarea hibridă:

```bash
qorechaind tx pqc gen-key mypqc
```

Comanda primește un nume de cheie și stochează cheia în `~/.qorechaind/pqc/<name>.dilithium` (mod `0600`, necriptată). Necesită binarul oficial de release `qorechaind`.

### Înregistrează-ți cheia (o singură dată) {#register-your-key}

O cheie post-cuantică este **înregistrată explicit**, o singură dată pentru fiecare cont, printr-o tranzacție de înregistrare a cheii. Această tranzacție (și migrarea cheii) poate fi semnată clasic, astfel încât un cont complet nou să se poată inițializa; după aceea, fiecare tranzacție pe calea Cosmos trebuie să poarte semnătura hibridă.

```bash
# register the public key printed by gen-key for your account
qorechaind tx pqc register-key <public_key_hex> hybrid --from mykey \
  --chain-id qorechain-vladi --gas 600000 --fees 60000uqor
```

Fă backup fișierului cheii PQC la fel de atent ca fraza mnemonică. (O cheie poate fi re-derivată din fraza mnemonică cu `qorechaind tx pqc recover-key` și înlocuită cu `tx pqc rotate-key`.) QoreX și SDK-ul QoreChain înregistrează cheia în locul tău. Vezi [Prima tranzacție](/getting-started/first-transaction#register-pqc-key) pentru un transfer semnat complet.

### Semnare hibridă cu SDK-ul

SDK-ul QoreChain produce tranzacții conforme pe calea Cosmos prin `buildHybridTx`, care atașează extensia Dilithium-5. Cheia contului trebuie să fie deja înregistrată (vezi mai sus). Vezi [SDK Accounts & PQC signing](/sdk/concepts/accounts-pqc).

### Modurile PQC

Cele trei moduri de aplicare rămân controlate prin guvernanță; **setarea implicită curentă a rețelei este Required**:

| Mod                    | Descriere                                                                |
| ---------------------- | ------------------------------------------------------------------------ |
| **Disabled**           | Verificarea PQC este dezactivată. Doar semnături standard.               |
| **Optional**           | Tranzacțiile pot include semnături PQC. Dacă sunt prezente, sunt verificate. |
| **Required** (implicit) | Toate tranzacțiile pe calea cosmos trebuie să includă o semnătură PQC validă. |

Modul activ este configurat la nivelul lanțului și poate fi actualizat prin guvernanță.

:::caution EVM / MetaMask necesită o cheie PQC și o fereastră deschisă
Fluxul MetaMask (EVM) de mai sus nu poartă extensia hibridă, dar începând cu v3.2.0 calea EVM admite tranzacții doar de la un cont cu o cheie post-cuantică înregistrată și o **fereastră de autorizare EVM** deschisă. Vezi [Fereastra de autorizare EVM](/getting-started/first-transaction#evm-window).
:::

## Portofel CLI

Binarul `qorechaind` include un sistem integrat de gestionare a cheilor pentru utilizarea din linia de comandă.

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
* [Conectarea la testnet](/getting-started/connecting-to-testnet) — Alătură-te testnet-ului Diana activ
