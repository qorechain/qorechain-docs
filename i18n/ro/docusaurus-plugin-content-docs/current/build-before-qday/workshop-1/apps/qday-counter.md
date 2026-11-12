---
slug: /build-before-qday/workshop-1/apps/qday-counter
title: Q-Day Counter
sidebar_label: Q-Day Counter
sidebar_position: 1
---

# Q-Day Counter

Q-Day Counter este cel mai mic proiect EVM util de pe QoreChain: un contract Solidity care stochează un singur număr, un proiect Hardhat care îl implementează pe testnetul `qorechain-diana` și un script scurt care îl citește și îl incrementează. Este șablonul `hardhat` din `create-qorechain-dapp`, cu un mic script `interact` adăugat.

## Ce demonstrează {#shows}

- **Semnarea hibridă face parte din calea de implementare.** Înainte de orice tranzacție EVM, inclusiv implementarea unui contract, contul are nevoie de o cheie ML-DSA-87 înregistrată și de o fereastră de autorizare EVM activă. Fereastra se deschide cu un singur mesaj pe lane-ul nativ, semnat cu ambele chei, secp256k1 și ML-DSA-87 (hibrid), iar lanțul verifică ambele semnături.
- **O tranzacție semnată hibrid, verificată pe lanț.** Pasul `pnpm window open` trimite acea tranzacție. O poți căuta în explorer și vezi verdictul lanțului însuși.
- **Instrumentele tale EVM obișnuite continuă să funcționeze.** Hardhat, Ignition și viem trimit tranzacții Ethereum obișnuite. Protecția post-cuantică stă în fereastră, așa că o cheie secp256k1 furată, singură, nu poate cheltui din cont.

Un calculator cuantic suficient de mare ca să spargă secp256k1 i-ar permite unui atacator să falsifice semnături clasice. QoreChain cere pe cont o a doua semnătură, post-cuantică (ML-DSA-87, FIPS 204). Counter arată întregul ciclu al dezvoltatorului cu această regulă activată: înregistrezi cheia, deschizi o fereastră, implementezi, apelezi, citești.

## Înainte să începi {#prerequisites}

Ai nevoie de un terminal pe macOS, Linux sau Windows cu WSL ori Git Bash, și de aceste instrumente:

| Instrument | Versiune necesară | Verificare cu |
| --- | --- | --- |
| Git | orice versiune recentă | `git --version` |
| Node.js | 20.12 sau mai nouă (recomandat 22 LTS) | `node --version` |
| pnpm | 9 sau mai nouă | `pnpm --version` |

Instalează Node.js de la https://nodejs.org. Dacă `pnpm --version` eșuează, instalează pnpm cu `npm install -g pnpm` (sau `corepack enable`) și verifică din nou.

Ai nevoie și de un cont gratuit pe [dashboardul QoreChain](https://dashboard.qorechain.io) ca să folosești faucetul. În acest ghid nu folosești niciodată un portofel real: tot ce urmează folosește un cont de testnet de unică folosință, iar QOR de testnet nu are valoare.

## Pas cu pas {#steps}

### 1. Obține codul {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/01-qday-counter
```

### 2. Instalează dependențele {#step-install}

```sh
pnpm install
```

### 3. Rulează testele și build-ul {#step-test}

Testele rulează pe un lanț simulat local. Nu au nevoie de nicio cheie și de niciun cont în rețea.

```sh
pnpm test
pnpm build
```

Ar trebui să vezi `2 passing` pentru testele `Counter`.

### 4. Creează fișierul cu cheia de testnet {#step-account}

Creează fișierul de setări pornind de la șablon:

```sh
cp .env.example .env
```

Fișierul `.env` conține o cheie de unică folosință, deci nu-l comite niciodată și nu reutiliza cheia nicăieri într-un context real. Deschide `.env` în orice editor. Vei completa două valori.

**a. O cheie privată de unică folosință.** Generează o cheie aleatoare de 32 de octeți:

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

Copiază valoarea `0x...` afișată în `.env` ca `PRIVATE_KEY=0x...`, înlocuind valoarea provizorie formată din zerouri.

**b. Un cod de recuperare post-cuantic.** Cheia ML-DSA-87 a contului este derivată dintr-un cod de recuperare separat. Creează unul:

```sh
pnpm window recovery-code
```

Copiază linia `QRC1-...` afișată în `.env` ca `QORE_PQC_RECOVERY_CODE=QRC1-...`. Păstrează acest cod împreună cu cheia privată și refolosește-l mereu pe același: un cod nou dă contului o altă cheie ML-DSA-87.

Lasă `QORE_MNEMONIC` gol și păstrează `QORE_NETWORK=testnet`. Acum `.env` arată așa (cu valori provizorii):

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

### 5. Afișează adresa contului tău {#step-address}

```sh
pnpm window status
```

Prima linie afișează contul tău ca `0x...` și în forma `qor1...`. În acest moment spune și că cheia nu este înregistrată și că nu există nicio fereastră. Copiază adresa `qor1...`.

### 6. Primește QOR de testnet de la faucet {#step-faucet}

1. Deschide https://dashboard.qorechain.io/faucet și autentifică-te.
2. Lipește adresa ta `qor1...` și cere QOR (100 QOR o dată la 24 de ore).
3. Așteaptă câteva secunde, apoi rulează din nou `pnpm window status`. Contul există acum pe lanț.

### 7. Înregistrează cheia și deschide fereastra {#step-window}

```sh
pnpm window register    # once: registers your ML-DSA-87 key
pnpm window open        # hybrid-signed: opens a window (600 blocks, 5 transactions)
sleep 10                # opening the window advances the account's nonce
pnpm window status      # PQC key: registered, window: live
```

Înregistrarea este singurul mesaj pe care lanțul îl acceptă semnat clasic, deoarece nu există încă pe lanț o cheie față de care să verifice. Deschiderea ferestrei este semnată hibrid. Păstrează hashul tranzacției pe care îl afișează `window open`: îl vei căuta la ultimul pas.

### 8. Implementează contractul {#step-deploy}

```sh
pnpm deploy:testnet     # Hardhat Ignition, answer y when asked to confirm
```

Comanda afișează adresa `Counter` implementată (`0x...`).

### 9. Citește și incrementează {#step-interact}

```sh
pnpm interact           # read count, increment(), read again, explorer link
pnpm interact --read    # read only
```

### 10. Caută-l în explorer {#step-explorer}

1. Deschide https://explore.qore.network și comută selectorul de rețea pe **Testnet**.
2. Caută hashul afișat de `pnpm window open`. Tranzacția arată o semnătură post-cuantică pe care lanțul a verificat-o.
3. Caută hashul tranzacției `increment` afișat de `pnpm interact`, sau adresa `Counter` de la pasul 8, ca să vezi apelul de contract.

[Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) arată același fel de dovadă, octet cu octet.

## Ce ar trebui să vezi {#result}

- `pnpm test` afișează `2 passing`.
- `pnpm window status` afișează contul (`0x...` cu forma lui `qor1...`), `PQC key: registered` și `window: live`, cu blocurile, tranzacțiile și valoarea rămase.
- `pnpm deploy:testnet` afișează adresa `Counter` implementată (`0x...`).
- `pnpm interact` afișează adresa Counter, `count`, hashul tranzacției `increment`, `status: success` cu numărul blocului, noul `count` și un link către tranzacție în explorer.
- În explorer (Testnet), tranzacția `window open` este marcată ca verificată cu ambele semnături.

Dacă un pas eșuează, rulează mai întâi `pnpm window status`: îți spune dacă lipsește cheia sau fereastra. O tranzacție refuzată după ce fereastra a fost consumată înseamnă că trebuie să deschizi una nouă cu `pnpm window open`.

## Codul {#code}

Contractul (`contracts/Counter.sol`):

```solidity
contract Counter {
    uint256 public count;
    event CountChanged(uint256 newCount);

    constructor(uint256 initial) {
        count = initial;
        emit CountChanged(initial);
    }

    function increment() external {
        count += 1;
        emit CountChanged(count);
    }

    function set(uint256 value) external {
        count = value;
        emit CountChanged(value);
    }
}
```

Partea semnată hibrid din `scripts/window.ts` (mesajul ferestrei și semnatarul):

```ts
import { EthNativeSigner, openEvmWindowMsg } from "@qorechain/sdk";
import { evmWindowCost } from "@qorechain/evm";

// 3,000,000 gas at a 250 gwei fee cap, for a few deploys
const perTx = evmWindowCost({ gas: 3_000_000n, maxFeePerGas: 250_000_000_000n });
const maxValue = BigInt(process.env.QORE_WINDOW_MAX_UQOR ?? (perTx * maxTxs).toString());
const msg = openEvmWindowMsg({ sender: acc.cosmos, blocks, maxTxs, maxValue });

// broadcast(acc, "hybrid", [msg]) does this:
const signer = new EthNativeSigner(acc, { signMode: "hybrid", rest: net.rest });
const res = await signer.signAndBroadcast(transport, {
  chainId: net.chainId, accountNumber, sequence, fee: FEE, messages: [msg],
});
```

`acc` este contul unificat derivat din materialul tău de chei, iar `net` este înregistrarea rețelei pentru `QORE_NETWORK` (implicit `testnet`, chain id `qorechain-diana`). Taxa folosită de script este 100000 `uqor`, cu o limită de gaz de 800000, deoarece tranzacțiile hibride sunt mari. Dimensiunea ferestrei poate fi schimbată în `.env` cu `QORE_WINDOW_BLOCKS` (implicit 600), `QORE_WINDOW_TXS` (implicit 5) și `QORE_WINDOW_MAX_UQOR`.

## Pachete folosite {#packages}

| Pachet | Versiune | Folosit pentru |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | Semnare hibridă, înregistrarea cheii PQC, `openEvmWindowMsg` |
| `@qorechain/evm` | ^0.13.0 | Ajutoare pentru fereastra EVM (`evmWindowStatus`, `evmWindowCost`) |
| `@cosmjs/stargate` | ^0.39.0 | Transmiterea tranzacției pe lane-ul nativ |
| `hardhat` | ^3.21.1 | Compilare, teste, implementare cu Ignition |
| `viem` | ^2.47.6 | Citirea și scrierea contractului |
| `tsx` | ^4.19.0 | Rularea scripturilor TypeScript |
| `typescript` | ^5.6.3 | Verificarea tipurilor |

Poți genera singur același proiect cu `npx create-qorechain-dapp my-app -t hardhat --network testnet`. Vezi [Generatoare și CLI](/developer-tools/scaffolders-and-cli) și [Instalarea SDK-ului](/sdk/install).

## Detalii despre rețea {#networks}

| Element | Valoare |
| --- | --- |
| Rețea | testnet `qorechain-diana` |
| EVM chain id | 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM RPC | `https://evm-testnet.qore.host` |

Sursa: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/01-qday-counter
