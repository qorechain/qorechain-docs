---
slug: /build-before-qday/workshop-1
title: "Workshop 1: la tua prima transazione firmata in modo ibrido"
sidebar_label: "Workshop 1"
sidebar_position: 2
date: 2026-11-12
---

# Workshop 1: la tua prima transazione firmata in modo ibrido

Questa guida ti porta da un computer senza nulla di installato a una transazione firmata con due chiavi insieme e verificata dalla testnet di QoreChain. Tutto gira nel tuo ambiente, con un account testnet usa e getta.

## Cosa costruiamo {#what-we-built}

Un progetto Solidity completo generato con un solo comando, testato, distribuito sulla testnet di QoreChain, e poi una transazione firmata con **due chiavi insieme** e controllata dalla catena.

Cosa mostra:

- **Firma ibrida.** La transazione porta una firma classica secp256k1 e una firma post-quantistica ML-DSA-87 (NIST FIPS 204).
- **Una transazione firmata in modo ibrido, verificata on chain.** I validatori verificano entrambe le firme. Leggi la prova dall'endpoint REST pubblico (l'estensione `PQCHybridSignature` e l'evento `pqc_hybrid_verify`) e nell'explorer.
- **La finestra di autorizzazione EVM.** Una transazione Ethereum non può portare una firma post-quantistica, quindi su QoreChain registri una volta la tua chiave ML-DSA-87 e apri una breve finestra, con un messaggio firmato in modo ibrido, durante la quale le tue normali transazioni EVM vengono ammesse. Per l'idea in dettaglio vedi [Deploy in 5 minuti](/getting-started/deploy-in-5-minutes).

È esattamente ciò che chiede il livello Quantum Pass.

## Prerequisiti {#prerequisites}

Ti servono un computer con macOS, Linux o Windows (con WSL), un terminale e un browser web. Installa prima questi strumenti e controlla ogni versione:

| Strumento | Versione | Controllo | Installazione |
| --- | --- | --- | --- |
| Node.js | 22 o successiva (richiesta da Hardhat 3) | `node -v` | [nodejs.org](https://nodejs.org) |
| pnpm | 9 o successiva | `pnpm -v` | `npm install -g pnpm` (oppure `corepack enable`) |
| curl | qualsiasi | `curl --version` | incluso in macOS e Linux |
| jq (facoltativo) | qualsiasi | `jq --version` | [jqlang.org](https://jqlang.org), usato solo per filtrare l'output al passo 6 |

Ti serve anche un account sulla dashboard di QoreChain per usare il faucet (passo 4).

La rete e gli endpoint pubblici usati in questa guida:

| Servizio | URL |
| --- | --- |
| Testnet | `qorechain-diana`, EVM chain ID 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (passa a Testnet) |
| Faucet | `https://dashboard.qorechain.io/faucet` (accesso richiesto) |

:::caution Solo chiavi testnet usa e getta
Usa chiavi create per questo esercizio, che contengano solo QOR di test. Non inserire mai in `.env` una chiave o un codice di recupero di un account che contiene fondi reali, e non fare mai il commit di `.env` su git.
:::

## Passi {#steps}

### Passo 1: controlla i tuoi strumenti {#step-1}

1. Apri un terminale.
2. Esegui i controlli della tabella qui sopra:

```bash
node -v
pnpm -v
```

`node -v` deve stampare `v22` o superiore. Se non è così, installa una versione più recente di Node.js prima di continuare.

### Passo 2: genera il progetto ed esegui i test {#step-2}

1. Crea il progetto in una nuova cartella. Il comando `npx` scarica lo scaffolder, quindi serve l'accesso a internet:

```bash
npx create-qorechain-dapp@latest qday-demo -t hardhat --network testnet --package-manager pnpm
```

2. Entra nella cartella ed esegui i test. Girano su una catena simulata locale e non inviano nulla:

```bash
cd qday-demo
pnpm test
```

Dovresti vedere `Done! Created qday-demo`, e poi `2 passing` dai test.

3. Guarda cosa hai ottenuto: `contracts/Counter.sol`, `ignition/modules/Counter.ts`, `scripts/window.ts` (l'helper per la finestra di autorizzazione) e `hardhat.config.ts` con la rete `qorechainTestnet` (chain ID 9800). Maggiori informazioni sui template: [Scaffolder e CLI](/developer-tools/scaffolders-and-cli) e [Kit di sviluppo della catena](/developer-tools/chain-dev-sdk).

### Passo 3: crea un account testnet usa e getta {#step-3}

L'account ha bisogno di due segreti: una chiave privata in stile Ethereum e un **codice di recupero** (inizia con `QRC1`) da cui viene derivata la chiave post-quantistica ML-DSA-87. Il comando qui sotto genera entrambi con le librerie già installate dal progetto e li scrive direttamente in un nuovo file `.env`, quindi nulla viene stampato a schermo né incollato altrove. Eseguilo dall'interno della cartella `qday-demo`:

```bash
node --input-type=module -e '
import { generatePrivateKey } from "viem/accounts";
import { generatePqcRecoveryCode } from "@qorechain/sdk";
import { writeFileSync } from "node:fs";
writeFileSync(".env", `PRIVATE_KEY=${generatePrivateKey()}\nQORE_PQC_RECOVERY_CODE=${generatePqcRecoveryCode()}\nQORE_NETWORK=testnet\n`);
console.log(".env written");
'
```

Stampa `.env written`. Note:

- Il comando sostituisce il file `.env` segnaposto creato dallo scaffolder. Eseguilo una sola volta. Una nuova esecuzione crea un account diverso e una chiave post-quantistica diversa.
- Lascia `.env` così com'è: la stessa chiave privata e lo stesso codice di recupero ti danno ogni volta lo stesso account. Se perdi il file, ricomincia con un nuovo account.
- Preferisci una mnemonica? Metti `QORE_MNEMONIC="your twelve words"` in `.env` al posto delle due righe qui sopra. Con una mnemonica entrambe le chiavi derivano dalla stessa frase e non serve alcun codice di recupero. Usa una frase creata solo per questo esercizio.

Ora chiedi al progetto l'indirizzo del tuo nuovo account:

```bash
pnpm window status
```

Dovresti vedere tre righe:

```text
account:  0x...  (qor1...)
PQC key:  not registered (run: pnpm window register)
window:   none (run: pnpm window open)
```

Copia l'indirizzo `qor1...`. È quello da dare al faucet.

### Passo 4: ricevi QOR di testnet dal faucet {#step-4}

1. Apri il [faucet](https://dashboard.qorechain.io/faucet) nel browser e accedi.
2. Incolla il tuo indirizzo `qor1...` (oppure scegli **Use my address** se la dashboard lo conosce).
3. Seleziona **Request Tokens**. La scheda mostra **Tokens Sent!** con 100 QOR, più i token di test del fest, e un link **View on Explorer**.

Il faucet eroga una volta ogni 24 ore per account e per indirizzo. Gli importi esatti sono nella pagina [Faucet](/dashboard/faucet). Tornato nel terminale, controlla che l'account ora esista on chain:

```bash
pnpm window status
```

L'output ora risponde invece di fallire con "does not exist on chain yet".

### Passo 5: registra la chiave, apri la finestra, fai il deploy {#step-5}

1. Registra la tua chiave ML-DSA-87. È un passo da fare una sola volta per account, firmato con la chiave classica, come richiede la catena per la registrazione:

```bash
pnpm window register
```

Stampa `registered: <HASH>`.

2. Apri la finestra di autorizzazione. È a sua volta una transazione **firmata in modo ibrido**:

```bash
pnpm window open
```

Stampa `opened: <HASH>`, poi una riga come `window: 600 blocks, 5 txs, 3750000 uqor (value plus fees)`. Annota l'hash di `opened:`: lo verifichi al passo 6.

3. Attendi circa 10 secondi. La finestra ha fatto avanzare il nonce dell'account e Hardhat aspetta le conferme.
4. Compila e distribuisci il contratto:

```bash
pnpm build
pnpm deploy:testnet
```

Rispondi `y` a "Confirm deploy to network qorechainTestnet (9800)?". Dovresti vedere `CounterModule#Counter - 0x...`.

### Passo 6: verifica la firma ibrida on chain {#step-6}

La transazione `opened:` del passo 5 è stata firmata con entrambe le chiavi. Sostituisci `<HASH>` con quell'hash e leggila dall'endpoint REST pubblico:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

Cerca:

1. `tx_response.code` uguale a `0`.
2. Nel corpo della transazione, l'estensione `PQCHybridSignature` che contiene la firma ML-DSA-87: **4.627 byte**, accanto alla firma secp256k1 da 64 byte.
3. In `tx_response.events`, l'evento `pqc_hybrid_verify` con l'attributo `status` impostato su `verified`. Per stampare solo quell'evento (serve `jq`):

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> \
  | jq '.tx_response.events[] | select(.type=="pqc_hybrid_verify")'
```

Poi guardala nell'explorer:

1. Apri [explore.qore.network](https://explore.qore.network).
2. Imposta il selettore di rete su **Testnet**.
3. Cerca l'hash. La pagina della transazione mostra la sicurezza della firma come quantum-safe, verificata on chain, con l'algoritmo ML-DSA-87 (FIPS 204).

Questa è la prova: i validatori hanno controllato entrambe le firme.

## Cosa dovresti vedere {#what-you-should-see}

| Dove | Cosa |
| --- | --- |
| Dopo il passo 2 | `Done! Created qday-demo` e `2 passing` |
| Dopo il passo 3 | `.env written`, poi una riga `account:` con i tuoi indirizzi `0x...` e `qor1...` |
| Dopo il passo 4 | **Tokens Sent!** sul faucet e un account esistente in `pnpm window status` |
| Dopo il passo 5 | `registered: <HASH>`, `opened: <HASH>`, poi `CounterModule#Counter - 0x...` |
| Dopo il passo 6 | `code` 0, una firma ML-DSA-87 da 4.627 byte e `pqc_hybrid_verify` con `status` `verified`, nell'output REST e nell'explorer su Testnet |

## Pacchetti usati {#published}

Dichiarati nel `package.json` generato:

| Pacchetto | Registro | Versione |
| --- | --- | --- |
| `create-qorechain-dapp` | npm | 0.14.0 |
| `@qorechain/sdk` | npm | ^0.14.0 |
| `@qorechain/evm` | npm | ^0.14.0 |
| `@cosmjs/stargate` | npm | ^0.39.0 |
| `hardhat` | npm | ^3.21.1 |
| `viem` | npm | ^2.47.6 |
| `tsx` | npm | ^4.19.0 |
| `typescript` | npm | ^5.6.3 |

Lo scaffolder installa anche il toolbox di Hardhat e i plugin Ignition e keystore elencati nel `package.json` generato.

## Risoluzione dei problemi {#troubleshooting}

| Cosa vedi | Perché | Cosa fare |
| --- | --- | --- |
| `HHE10402` o "wait for confirmations" subito dopo l'apertura della finestra | L'apertura della finestra ha fatto avanzare il nonce dell'account | Esegui di nuovo `pnpm deploy:testnet` |
| "EVM authorisation window exhausted" o "no window" | La finestra ha esaurito le transazioni o i blocchi, oppure è limitata a un altro contratto (una finestra limitata a un altro contratto blocca un deploy) | Esegui `pnpm window open` per aprire una nuova finestra, attendi circa 10 secondi, poi rifai il deploy |
| "account has no PQC key and classical fallback is disabled" | L'account non ha registrato una chiave ML-DSA-87 | Esegui prima `pnpm window register`, poi apri la finestra |
| "does not exist on chain yet" | L'account non ha ancora QOR | Ricevi QOR dal faucet (passo 4) |
| "Rate Limit Reached" sul faucet, o nessun token dopo 30 secondi | Un'erogazione ogni 24 ore per account e per indirizzo, e le richieste vengono servite una alla volta | Attendi qualche secondo e riprova, oppure aspetta la fine del periodo di attesa |
| `pnpm window` si ferma con un messaggio su un codice di recupero mancante | `.env` ha `PRIVATE_KEY` senza `QORE_PQC_RECOVERY_CODE` | Ripeti il passo 3, oppure usa `QORE_MNEMONIC` |
| Hardhat si rifiuta di avviarsi | Node.js è precedente alla versione 22 | Installa Node.js 22 o successiva ed esegui di nuovo `pnpm install` |

## Le app di esempio {#example-apps}

Lo stesso flusso, da diversi linguaggi e front end. Ognuna firma in modo ibrido. Si trovano tutte nel repository pubblico [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), cartella `workshop-1`. Scaricalo con:

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1
```

Ogni pagina di app è una guida completa a sé, dall'inizio alla fine.

| App | Linguaggio | Pagina |
| --- | --- | --- |
| Q-Day Counter | TypeScript, Solidity | [qday-counter](/build-before-qday/workshop-1/apps/qday-counter) |
| Q-Day Guestbook | TypeScript, Solidity | [qday-guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) |
| Hybrid Inspector | TypeScript | [hybrid-inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) |
| Q-Day Pay | Rust | [rust-qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) |
| Q-Day Tip Jar | Java | [java-tipjar](/build-before-qday/workshop-1/apps/java-tipjar) |
| Q-Day Airdrop | Python | [python-airdrop](/build-before-qday/workshop-1/apps/python-airdrop) |

I kit che stanno dietro a queste app sono elencati in [Kit](/build-before-qday/workshop-1/kits). Per usare il wallet QoreX con una dApp nel browser, vedi [QoreX](/qorex/overview).
