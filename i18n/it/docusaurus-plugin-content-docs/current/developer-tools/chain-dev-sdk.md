---
slug: /developer-tools/chain-dev-sdk
title: Chain Developer Kit
sidebar_label: Chain Developer Kit
sidebar_position: 34
---

# Chain developer kit (template EVM e QoreChain Native)

Il chain developer kit è la parte dell'SDK QoreChain **0.11.0** che aiuta i team Solidity e di smart contract a costruire su QoreChain con gli strumenti che già usano. Aggiunge a `@qorechain/evm` le definizioni di chain per viem e gli helper per la finestra di autorizzazione EVM, quattro nuovi template di progetto a `create-qorechain-dapp` (Foundry, Hardhat 3, viem con wagmi e un token CosmWasm QoreChain Native), quickstart EVM per cinque linguaggi e un riferimento su come l'EVM di QoreChain differisce da Ethereum. È pensato per i team Solidity che portano contratti da Ethereum, gli sviluppatori front-end di dApp su wagmi e RainbowKit, gli sviluppatori CosmWasm e i manutentori di strumenti EVM che vogliono aggiungere QoreChain.

:::caution In arrivo: l'SDK 0.11.0 è taggato ma non pubblicato su npm
L'SDK 0.11.0 è taggato su GitHub (`qorechain/qorechain-sdk`, tag `v0.11.0`, 27 ottobre 2026). **La sua release su npm è in sospeso**, e il 27 ottobre 2026 `npm view` per la versione 0.11.0 di `@qorechain/evm`, `@qorechain/sdk`, `@qorechain/react`, `@qorechain/svm` e `create-qorechain-dapp` non ha trovato nulla. Questa pagina **non fornisce alcun comando di installazione per la 0.11.0**. Ogni voce contrassegnata **dalla 0.11.0** qui sotto oggi non funziona da npm. Le voci contrassegnate **attive oggi** funzionano: provengono da `@qorechain/sdk` 0.10.0, `@qorechain/evm` 0.8.0, `create-qorechain-dapp` 0.10.0 e dagli SDK per i vari linguaggi alla 0.10.0. La 0.11.0 cambia solo i pacchetti npm; gli SDK Python, Rust, Go e Java restano alla 0.10.0.
:::

Il kit ha come obiettivo la mainnet (`qorechain-vladi`, EVM chain ID 9801) e la testnet (`qorechain-diana`, EVM chain ID 9800).

## Attivo oggi e in arrivo nella 0.11.0 {#status}

| Voce | Stato | Dove |
|---|---|---|
| Lettura con ethers v6, web3.py, go-ethereum, alloy o web3j sugli endpoint pubblici | **Attivo oggi** (nessun pacchetto QoreChain necessario) | [Quickstart 1](#quickstart-ethers) |
| `createEvmClient`, helper ERC-20, ERC-721 e ERC-1155, binding `precompiles`, `PRECOMPILE_ADDRESSES` | **Attivo oggi** in `@qorechain/evm` 0.8.0 | [Quickstart 2](#quickstart-evm-080) |
| Apertura e lettura di una finestra di autorizzazione EVM da TypeScript, con `openEvmWindowMsg`, `fetchEvmWindow`, `EthNativeSigner`, `deriveUnifiedAccount` | **Attivo oggi** in `@qorechain/sdk` 0.10.0 | [Quickstart 5](#quickstart-open-window) |
| Gli stessi builder di finestra in Python, Go, Rust e Java | **Attivo oggi** negli SDK 0.10.0 | [API principale](#main-api) |
| Helper per il consenso EIP-7702 `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `classifyEvmDelegationRejection` | **Attivo oggi** in `@qorechain/sdk` 0.10.0 | [API principale](#main-api) |
| Lo scaffolder con i template `evm-solidity`, `fullstack-web`, `rollup-app` | **Attivo oggi** in `create-qorechain-dapp` 0.10.0 | [Quickstart 6](#quickstart-scaffold-live) |
| Definizioni di chain viem `qorechain` e `qorechainTestnet`, `QORECHAIN_CHAINS`, `QORECHAIN_REST_ENDPOINTS` | **Dalla 0.11.0** (in arrivo) | [Quickstart 3](#quickstart-viem) |
| `evmWindowStatus`, `openEvmWindowMessage`, `evmWindowCost`, `classifyEvmWindowRejection`, convertitori di indirizzi, costanti della finestra, sottopercorso `@qorechain/evm/window` | **Dalla 0.11.0** (in arrivo) | [Quickstart 4](#quickstart-window-helpers) |
| Template `foundry`, `hardhat`, `viem-wagmi`, `cosmwasm` e l'helper `pnpm window` | **Dalla 0.11.0** (in arrivo) | [Template](#templates) |
| `PqcStatusBadge` in `@qorechain/react` | **Dalla 0.11.0** (in arrivo) | [API principale](#main-api) |

## Innovazioni {#innovations}

- **L'invio è autorizzato di proposito, con una finestra delimitata.** Una transazione EVM è ammessa solo da un account che ha una chiave ML-DSA-87 registrata e una finestra di autorizzazione EVM aperta. La finestra viene aperta da un messaggio della lane nativa firmato in modo ibrido (secp256k1 più ML-DSA-87), quindi la chiave secp256k1 che una libreria EVM detiene non può mai autorizzare da sola una spesa. La transazione Ethereum in sé resta una normale transazione Ethereum.
- **Una finestra dimensionata su limiti, non sulla fiducia.** Una finestra limita il numero di blocchi (da 1 a 17.280), il numero di transazioni EVM (da 1 a 1.000) e un totale in uqor che copre il valore più la commissione massima di ogni transazione ammessa. `nativeOnly` la limita ai semplici trasferimenti di QOR e `allowedTargets` (al massimo 16 indirizzi) limita i destinatari e rifiuta la creazione di contratti.
- **Un account, due codifiche.** Per un account eth-native gli indirizzi `0x` e `qor1...` sono gli stessi 20 byte e mostrano lo stesso saldo, quindi una sola chiave funziona sull'EVM e sulla lane nativa. QOR ha 18 decimali sull'EVM e 6 sulla lane nativa (`uqor`); 1 uqor equivale a 10^12 wei.
- **Helper che nominano il rifiuto.** `classifyEvmWindowRejection` trasforma una transazione rifiutata in uno di quattro motivi, `no-pqc-key`, `no-window`, `exhausted` o `invalid`, a partire da un errore di viem o ethers, da un risultato di consegna della lane nativa o da una stringa.
- **Dimensionamento della finestra in uqor.** `evmWindowCost` e `weiToUqorCeil` dimensionano una finestra a partire da valore, gas e tetto della commissione, arrotondando i wei per eccesso a uqor, così il totale copre il caso peggiore.
- **Nessuna apertura automatica.** Il kit non ha deliberatamente alcun helper che apra una finestra prima di un invio. La finestra esiste affinché la spesa sia autorizzata di proposito.
- **Simulazione gratuita.** `eth_call` e `eth_estimateGas` funzionano per qualsiasi account, senza finestra né chiave registrata.
- **Template che collegano la finestra.** I template Foundry e Hardhat includono `pnpm window status|register|open`, che deriva la chiave ML-DSA-87 dallo stesso segreto della chiave EVM, la registra una volta e trasmette il messaggio di apertura firmato in modo ibrido.
- **Una superficie di compatibilità documentata.** Una pagina di riferimento (letta dagli endpoint pubblici il 27 ottobre 2026) elenca ciò che differisce da Ethereum: tipi di transazione, fork, finalità, campi delle commissioni, namespace JSON-RPC e precompile. È riassunta [qui sotto](#evm-differences).

## Cosa contiene il kit {#contents}

### `@qorechain/evm` {#evm-package}

**Dalla 0.11.0** (nuovo):

- `qorechain` (9801) e `qorechainTestnet` (9800): oggetti chain di viem con gli endpoint pubblici, la valuta nativa QOR con 18 decimali e l'explorer `https://explore.qore.network`. `QORECHAIN_CHAINS` le elenca entrambe (mainnet, poi testnet) per wagmi e RainbowKit. `QORECHAIN_REST_ENDPOINTS` associa ogni EVM chain ID al suo endpoint REST della lane nativa.
- `evmWindowStatus({ rest, address })` legge la finestra di un account via REST (`/qorechain/pqc/v1/evm_window/{address}`), accetta un indirizzo `qor1...` o `0x` e risponde `{ found: false }` invece di fallire quando non ce n'è una. `parseEvmWindow` interpreta la risposta grezza.
- `openEvmWindowMessage(params)` controlla i limiti e compone il `MsgOpenEVMWindow` della lane nativa come semplice oggetto `{ typeUrl, value }`, pronto per essere firmato con `@qorechain/sdk`. `checkOpenEvmWindowParams` esegue solo i controlli.
- `evmWindowCost`, `weiToUqorCeil`, `classifyEvmWindowRejection`, `isEvmWindowRejection`, `toQorAddress`, `toEvmAddress`, e le costanti `OPEN_EVM_WINDOW_TYPE_URL`, `CLOSE_EVM_WINDOW_TYPE_URL`, `MAX_EVM_WINDOW_BLOCKS` (17.280), `MAX_EVM_WINDOW_TXS` (1.000) e `MAX_EVM_WINDOW_TARGETS` (16).
- Gli helper della finestra sono pubblicati anche senza viem al sottopercorso `@qorechain/evm/window`.

**Attivo oggi** (0.8.0 e successive): `createEvmClient`, `evmAccountFromPrivateKey`, `writeContract`, gli helper `erc20`, gli helper ERC-721 e ERC-1155, i binding `precompiles` e `PRECOMPILE_ADDRESSES`. Vedi la [guida EVM](/sdk/guides/evm).

### Template {#templates}

`create-qorechain-dapp` ha tre template attivi oggi (`evm-solidity`, `fullstack-web`, `rollup-app`; vedi [Scaffolder e CLI](/developer-tools/scaffolders-and-cli)). **Dalla 0.11.0** ne ha sette. I quattro nuovi:

| Template | Cosa ottieni |
|---|---|
| `foundry` | Un progetto Foundry: contratto `Counter`, test, script di deploy, endpoint RPC con nome `qorechain` e `qorechain_testnet`, e `pnpm window status\|register\|open`. |
| `hardhat` | Un progetto Hardhat 3 e viem: contratto `Counter`, test sulla rete simulata, un modulo di deploy Ignition, reti `qorechain` e `qorechainTestnet`, e `pnpm window status\|register\|open`. |
| `viem-wagmi` | Una dApp Vite, React, wagmi e RainbowKit con il wallet QoreX (`@qorechain/qorex-rainbowkit`) e le definizioni di chain da `@qorechain/evm`. Mostra l'ultimo blocco, il saldo QOR e la finestra EVM dell'account. |
| `cosmwasm` | Un token CW20 QoreChain Native (CosmWasm) basato su `cw20-base` di cw-plus, una build ottimizzata in Docker, uno script per la proposta di upload via governance e script di instanziazione e query sulla testnet. |

I template fissano `@qorechain/evm` e `@qorechain/sdk` a `^0.11.0`, quindi non si installano da npm finché la 0.11.0 non è pubblicata.

### Guide nel repository dell'SDK {#guides}

Il repository (`docs/docs/guides/`, tag `v0.11.0`) contiene `evm-quickstarts.md` (letture per viem, ethers v6, web3.py, go-ethereum, alloy e web3j, più una sezione "Before you send"), `evm-differences.md` ("QoreChain EVM compared with Ethereum"), `evm.md` e `cosmwasm.md`. Lo stesso materiale su questo sito: [guida EVM](/sdk/guides/evm), [Sviluppo EVM](/developer-guide/evm-development) e [Sviluppo QoreChain Native](/developer-guide/cosmwasm-development).

Nel tag ci sono anche file di contribuzione per altri strumenti (definizioni di chain viem, voci di chain Sourcify e un'estensione Scaffold-ETH 2) sotto `contrib/` e `templates/scaffold-eth-extension/`. Sono file preparati nel repository, non integrati upstream.

## Casi d'uso {#use-cases}

1. **Un team Solidity che porta codice da Ethereum.** Crea con lo scaffolder il template `foundry` (dalla 0.11.0), copia i contratti, esegui `forge test` in locale, esegui `pnpm window register` una volta e `pnpm window open` prima di ogni lotto di deploy. Le [differenze](#evm-differences) elencano cosa cambiare: niente transazioni blob, PREVRANDAO è una costante, niente tracing `debug_*` sugli endpoint pubblici.
2. **Un progetto Hardhat 3 che va in testnet.** Crea con lo scaffolder il template `hardhat` (dalla 0.11.0), mantieni i tuoi moduli Ignition e fai il deploy con `pnpm deploy:testnet` dopo aver aperto una finestra.
3. **Un front end dApp su wagmi.** Importa `QORECHAIN_CHAINS` nella configurazione di wagmi e RainbowKit (dalla 0.11.0), mostra la finestra dell'utente con `evmWindowStatus` e spiega un invio rifiutato con `classifyEvmWindowRejection`.
4. **Un servizio backend in un altro linguaggio.** Un servizio Python, Go, Rust o Java legge i saldi e chiama i contratti con web3.py, go-ethereum, alloy o web3j come su Ethereum, **oggi**. Per inviare, costruisce `MsgOpenEVMWindow` con l'SDK QoreChain 0.10.0 di quel linguaggio, che è attivo.
5. **Uno sviluppatore CosmWasm.** Crea con lo scaffolder il template `cosmwasm` (dalla 0.11.0), testa il CW20 con `cargo test`, compila il Wasm ottimizzato, invia una proposta di governance per memorizzare il codice e instanzialo sulla testnet una volta approvata la proposta.
6. **Un'integrazione di wallet o di custodia.** Un'integrazione che detiene chiavi per conto degli utenti deve sapere che la sola chiave secp256k1 non può spendere sulla lane EVM. Apre finestre ristrette (`nativeOnly` o `allowedTargets`) firmate con la chiave ML-DSA-87 dell'account, **oggi** con `openEvmWindowMsg` di `@qorechain/sdk` 0.10.0.
7. **Manutentori di strumenti EVM.** I manutentori di viem, Sourcify o Scaffold-ETH 2 possono leggere i file di contribuzione preparati per aggiungere gli chain ID 9800 e 9801.

## Come funziona {#how-it-works}

- **La regola di autorizzazione.** La chain ammette una transazione EVM da un account che ha una chiave ML-DSA-87 registrata e una finestra attiva, e altrimenti la rifiuta. La regola è la funzionalità di protocollo `evm-pqc-authorisation-window`, abilitata su entrambe le reti; leggila a `/qorechain/pqc/v1/protocol_features`. Vedi [Finestra di autorizzazione EVM](/sdk/guides/evm#evm-window) e [la guida alla prima transazione](/getting-started/first-transaction#evm-window).
- **Apertura e chiusura.** `MsgOpenEVMWindow` (`/qorechain.pqc.v1.MsgOpenEVMWindow`) apre una finestra, firmata in modo ibrido; aprire una finestra sostituisce qualsiasi finestra precedente. `MsgCloseEVMWindow` la chiude.
- **Cosa delimita una finestra.** Blocchi (un numero di blocchi, non una durata), transazioni EVM e un totale in uqor che copre il valore più la commissione massima (limite di gas per tetto della commissione) di ogni transazione ammessa. `nativeOnly` e `allowedTargets` la restringono ulteriormente (vedi [Delimitare una finestra](/sdk/guides/evm#evm-window-scope)).
- **Nonce.** La sequenza nativa e il nonce EVM sono lo stesso contatore. Aprire una finestra lo fa avanzare, quindi apri la finestra, poi leggi il nonce, poi firma la transazione EVM.
- **L'helper dei template.** In `foundry` e `hardhat`, `pnpm window` deriva l'account da `PRIVATE_KEY` (o `QORE_MNEMONIC`), deriva la sua chiave ML-DSA-87 dallo stesso segreto, registra la chiave una volta (`register`) e trasmette `MsgOpenEVMWindow` firmato in modo ibrido (`open`). Per impostazione predefinita dimensiona una finestra di 600 blocchi e 5 transazioni, per transazioni fino a 3.000.000 di gas con un tetto della commissione di 250 gwei.
- **CosmWasm su QoreChain Native.** L'upload del codice avviene tramite governance su entrambe le reti (`code_upload_access` è `Nobody`): il codice viene memorizzato da una proposta di governance che porta `MsgStoreCode` con il modulo di governance come mittente. L'instanziazione è aperta a tutti sulla testnet e chiusa sulla mainnet (`instantiate_default_permission` è `Everybody` sulla testnet e `Nobody` sulla mainnet, letto il 27 ottobre 2026). Leggi entrambi a `/cosmwasm/wasm/v1/codes/params`; elenca i codici memorizzati a `/cosmwasm/wasm/v1/code`. Il 27 ottobre 2026 la mainnet non aveva codici memorizzati.

## L'EVM di QoreChain a confronto con Ethereum {#evm-differences}

Letto dagli endpoint pubblici il 27 ottobre 2026 (guida SDK `evm-differences.md`). Lo stato della rete (commissioni, tempi di blocco, precompile attivi) è datato; leggilo live prima di farvi affidamento.

- **Invio.** Ogni transazione EVM richiede una chiave ML-DSA-87 registrata e una finestra aperta per il suo mittente, senza eccezioni per account. Deploy, trasferimenti e chiamate a contratti sono tutti coperti. Un account con una chiave registrata non ha nemmeno un percorso con firma classica sulla lane nativa: ogni transazione nativa che firma è ibrida.
- **Simulazione.** `eth_call` e `eth_estimateGas` non richiedono alcuna finestra.
- **Tipi di transazione.** Sono accettati i tipi 0 (legacy), 1 (access list), 2 (EIP-1559) e 4 (EIP-7702). **Le transazioni blob EIP-4844 (tipo 3) sono rifiutate.** Gli opcode Cancun funzionano, ma `blobGasUsed` e `excessBlobGas` sono sempre 0, `eth_blobBaseFee` non esiste e il precompile di valutazione del punto (`0x0a`) restituisce un errore.
- **Fork.** Fino a London dalla genesi; Shanghai, Cancun e Prague sono attivi; Osaka non è attivo.
- **PREVRANDAO (EIP-4399) è una costante** (`0xff...ff`) e il `mixHash` dell'header è zero. Non usarlo mai come casualità.
- **EIP-7702** è accettato con una regola di QoreChain: ogni authority la cui delega avrebbe effetto richiede una chiave PQC registrata e un consenso monouso registrato con `MsgAuthorizeEVMDelegation` (al massimo 8 autorizzazioni per transazione, nessuna authority duplicata). La finestra dello sponsor non conta come consenso delle authority. `MsgClearEVMDelegation` rimuove una delega. Vedi [Consenso EIP-7702](/sdk/guides/evm#evm-delegation-consent).
- **Finalità.** I blocchi sono finali quando vengono committati: `latest`, `safe` e `finalized` restituiscono lo stesso blocco, senza reorg e senza uncle.
- **Commissioni (entrambe le reti, 27 ottobre 2026).** `eth_gasPrice` 112,5 gwei; base fee 100 gwei (il minimo della chain di 0,1 uqor per gas); `eth_maxPriorityFeePerGas` 12,5 gwei; `gasLimit` dell'header 4.294.967.295. Gli strumenti che impostano il tetto della commissione vicino al doppio della base fee (Foundry lo fa) impegnano fino a circa 200 gwei per gas sulla finestra pagando circa 112,5 gwei.
- **Namespace JSON-RPC.** `eth`, `net`, `web3` e `txpool`. Ogni metodo `debug_*`, `personal_*`, `admin_*` e `miner_*` non è disponibile (`-32601`), così come `trace_*`, `eth_coinbase`, `eth_mining`, `eth_hashrate`, `eth_getWork`, `eth_submitWork`, `eth_blobBaseFee`, `eth_simulateV1`, `eth_callMany`, `eth_signTransaction`, `eth_pendingTransactions` e `eth_config`. Gli strumenti che richiedono trace non funzionano sugli endpoint pubblici.
- **Comportamento diverso.** `eth_getProof` funziona ma restituisce le prove IAVL della chain, non prove Merkle-Patricia. `eth_getLogs` copre al massimo 10.000 blocchi per query. `eth_subscribe` funziona solo via WebSocket. `eth_accounts`, `eth_sign` e `eth_sendTransaction` sono rifiutati perché il nodo non detiene account: firma in locale e usa `eth_sendRawTransaction`. `txpool_content` è rifiutato sugli endpoint pubblici; `txpool_status` funziona. `web3_clientVersion` non è un modo affidabile per riconoscere il nodo.
- **Saldi.** `eth_getBalance` restituisce il saldo bank in uqor per 10^12 più l'eventuale resto inferiore a un uqor.
- **Precompile.** I precompile standard di Ethereum rispondono come al solito. `pqcVerify` (`0x0A01`) e `pqcKeyStatus` (`0x0A02`) sono **attivi solo sulla testnet**; nessuno è attivo sulla mainnet, e attivarne uno richiederebbe una decisione di governance, senza una data. La testnet elenca anche `0x0C01` (`rlConsensusParams`). Una chiamata a un precompile non attivo restituisce dati vuoti invece di annullare la transazione, quindi leggi `active_static_precompiles` a `/cosmos/evm/vm/v1/params` prima di fare affidamento su uno di essi. Vedi [Precompile EVM](/developer-guide/evm-precompiles#network-status).
- **Strumenti.** QoreChain non è ancora in `viem/chains`: importa le chain da `@qorechain/evm` (dalla 0.11.0). Sourcify non elenca ancora gli chain ID 9800 o 9801. La lane SVM non è aperta.

## Come si usa {#how-to-use}

Tutti gli snippet che leggono usano la testnet pubblica (`qorechain-diana`, EVM chain ID 9800), non richiedono chiavi e non inviano nulla. L'ERC-20 di test a `0x9C2F20329750c16B215bDc50455d320De2a7Ba1c` è un token della testnet (simbolo `WQOR`, 18 decimali); sostituiscilo, insieme all'indirizzo, con i tuoi.

### Installazione per linguaggio {#install}

| Linguaggio o strumento | Installazione | Stato | Piattaforma minima |
|---|---|---|---|
| TypeScript, letture EVM e helper ERC | `npm install @qorechain/evm viem` (si risolve alla 0.8.0, che non ha definizioni di chain né helper per la finestra) | Attivo oggi | Node.js 20 o successivo; peer `viem ^2` |
| TypeScript, firma del messaggio della finestra | `npm install @qorechain/sdk` (la 0.10.0 ha `openEvmWindowMsg`, `fetchEvmWindow`, `EthNativeSigner`, `deriveUnifiedAccount`) | Attivo oggi | Node.js 20 o successivo |
| TypeScript, definizioni di chain viem e helper per la finestra | ancora nessuna | **In arrivo (0.11.0)** | Node.js 20 o successivo |
| Scaffolder, template `evm-solidity`, `fullstack-web`, `rollup-app` | `npx create-qorechain-dapp my-app --template <name>` | Attivo oggi (0.10.0) | Node.js 20 o successivo |
| Scaffolder, template `foundry`, `hardhat`, `viem-wagmi`, `cosmwasm` | ancora nessuna | **In arrivo (0.11.0)** | Foundry e Node.js 20; Node.js 22 per Hardhat 3; Rust e Docker per `cosmwasm` |
| Python (letture EVM) | `pip install "web3>=7,<8"`; messaggio della finestra da `qorechain-sdk` 0.10.0 | Attivo oggi | Python 3.10 o successivo |
| Go (letture EVM) | `go get github.com/ethereum/go-ethereum@latest`; messaggio della finestra dall'SDK Go di QoreChain v0.10.0 | Attivo oggi | Toolchain Go |
| Rust (letture EVM) | `alloy = { version = "1", features = ["provider-http", "contract", "sol-types"] }`; messaggio della finestra dal crate `qorechain-sdk` 0.10.0 | Attivo oggi | Rust stable |
| Java (letture EVM) | `org.web3j:core:5.0.0`; messaggio della finestra da `io.github.qorechain:qorechain-sdk:0.10.0` | Attivo oggi | JDK 21 (l'SDK Java di QoreChain è compilato con una toolchain JDK 21) |

### Quickstart 1: leggere con ethers v6 (attivo oggi) {#quickstart-ethers}

Non serve alcun pacchetto QoreChain. Eseguito il 27 ottobre 2026 sulla testnet, ha stampato `chain id: 9800n`, un saldo e `token: WQOR 18n`.

```ts
import { Contract, JsonRpcProvider, formatEther } from "ethers";

const provider = new JsonRpcProvider("https://evm-testnet.qore.host", 9800, { staticNetwork: true });

const ADDRESS = "0x000000000000000000000000000000000000dEaD"; // any 0x address
const TOKEN = "0x9C2F20329750c16B215bDc50455d320De2a7Ba1c"; // a test ERC-20 on the testnet
const erc20 = new Contract(
  TOKEN,
  ["function symbol() view returns (string)", "function decimals() view returns (uint8)"],
  provider,
);

const { chainId } = await provider.getNetwork();
const balance = await provider.getBalance(ADDRESS);
const symbol: string = await erc20.symbol();
const decimals: bigint = await erc20.decimals();

console.log("chain id:", chainId); // 9800n
console.log("balance:", formatEther(balance), "QOR");
console.log("token:", symbol, decimals);
```

La stessa lettura in web3.py, go-ethereum, alloy e web3j è nella guida SDK `evm-quickstarts.md` (lì riportata come testata con web3.py 7.16, go-ethereum 1.17.10, alloy 1.8 e web3j 5.0.0 su JDK 21; questa pagina non li ha rieseguiti).

### Quickstart 2: leggere con `@qorechain/evm` 0.8.0 pubblicato (attivo oggi) {#quickstart-evm-080}

Quickstart testato dal developer hub. Si connette, riconosce automaticamente l'EVM chain ID e stampa il saldo QOR dell'account del faucet pubblico della testnet.

```ts
import { createEvmClient } from "@qorechain/evm";
import { formatEther } from "viem";

// Public testnet EVM JSON-RPC (EVM chain ID 9800, auto-detected).
const client = await createEvmClient({ rpcUrl: "https://evm-testnet.qore.host" });

// A public testnet address (the testnet faucet account, EVM form).
const address = "0xf1e70c24817e00aee286f7275e14e61cabd20741";
const wei = await client.publicClient.getBalance({ address });
console.log(await client.getChainId(), address, formatEther(wei), "QOR");
```

### Quickstart 3: leggere con la definizione di chain viem (dalla 0.11.0, in arrivo) {#quickstart-viem}

Oggi questo non funziona da npm, perché la 0.8.0 non ha `qorechainTestnet`. Eseguito il 27 ottobre 2026 con la definizione di chain della 0.11.0 caricata dal sorgente del repository (non da npm), ha stampato `chain id: 9800` e il token `WQOR`.

```ts
import { createPublicClient, erc20Abi, formatEther, http } from "viem";
import { qorechainTestnet } from "@qorechain/evm";

const client = createPublicClient({ chain: qorechainTestnet, transport: http() });

const ADDRESS = "0x000000000000000000000000000000000000dEaD"; // any 0x address
const TOKEN = "0x9C2F20329750c16B215bDc50455d320De2a7Ba1c"; // a test ERC-20 on the testnet

const chainId = await client.getChainId();
const balance = await client.getBalance({ address: ADDRESS });
const symbol = await client.readContract({ address: TOKEN, abi: erc20Abi, functionName: "symbol" });
const decimals = await client.readContract({ address: TOKEN, abi: erc20Abi, functionName: "decimals" });

console.log("chain id:", chainId); // 9800
console.log("balance:", formatEther(balance), "QOR");
console.log("token:", symbol, decimals);
```

### Quickstart 4: controllare una finestra e comporre il messaggio di apertura (dalla 0.11.0, in arrivo) {#quickstart-window-helpers}

Dal README di `@qorechain/evm` al tag v0.11.0. Legge, poi costruisce un oggetto messaggio; non firma né invia. Per un account senza finestra, `evmWindowStatus` restituisce `found: false, live: false` (verificato su entrambe le reti il 27 ottobre 2026).

```ts
import { evmWindowStatus, openEvmWindowMessage, evmWindowCost } from "@qorechain/evm";

const w = await evmWindowStatus({ rest: "https://api-testnet.qore.host", address: "0x..." });
// w.live, w.remainingTxs, w.remainingValue (uqor), w.remainingBlocks

const msg = openEvmWindowMessage({
  sender: "qor1...", // the same account; toQorAddress("0x...") converts
  blocks: 600,
  maxTxs: 5,
  maxValue: evmWindowCost({ gas: 3_000_000n, maxFeePerGas: 112_500_000_000n }) * 5n,
});
// Sign `msg` hybrid on the native lane, then read the nonce (opening advances it).
```

### Quickstart 5: aprire una finestra da TypeScript (attivo oggi, SDK 0.10.0 e successivi) {#quickstart-open-window}

Dalla guida SDK `evm-quickstarts.md`, "Before you send". Questo **invia una transazione della lane nativa**: eseguilo solo con un tuo account di test finanziato, mai con una frase condivisa o pubblica.

```ts
import { StargateClient } from "@cosmjs/stargate";
import { EthNativeSigner, deriveUnifiedAccount, openEvmWindowMsg } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic); // account.evm = 0x..., account.cosmos = qor1...
const signer = new EthNativeSigner(account, { rest: "https://api-testnet.qore.host" });
const transport = await StargateClient.connect("https://rpc-testnet.qore.host");

await signer.signAndBroadcast(transport, {
  chainId: "qorechain-diana",
  accountNumber, // from /cosmos/auth/v1beta1/accounts/{qor1...}
  sequence,
  fee: { amount: [{ denom: "uqor", amount: "100000" }], gas: "800000" },
  messages: [openEvmWindowMsg({ sender: account.cosmos, blocks: 600, maxTxs: 5, maxValue: "3750000" })],
});
// Now read the nonce and send with viem, ethers, Foundry or Hardhat.
```

Questo snippet non è stato rieseguito per questa pagina. `maxValue: "3750000"` corrisponde a 5 transazioni da 3.000.000 di gas con un tetto della commissione di 250 gwei.

### Quickstart 6: creare un progetto con lo scaffolder attivo {#quickstart-scaffold-live}

Testato il 27 ottobre 2026 in una directory vuota con `npx` dal registry npm pubblico (0.10.0, template `fullstack-web`): ha creato il progetto e la build è riuscita.

```sh
npx -y create-qorechain-dapp my-dapp --template fullstack-web --network testnet --package-manager npm --yes
cd my-dapp && npm run build
```

### I nuovi template (dalla 0.11.0, in arrivo) {#new-templates-usage}

Una volta pubblicata la 0.11.0, lo scaffolder accetta i quattro nuovi nomi di template (vedi la tabella dei flag qui sotto). Un progetto `foundry` si compila e si testa poi in locale con `forge build` e `forge test` (senza rete), e `pnpm window status` legge l'account, la sua chiave PQC e la sua finestra. `pnpm window register` e `pnpm window open` trasmettono transazioni della lane nativa dal tuo account finanziato, e `forge script ... --broadcast` fa il deploy. Non mettere mai una chiave reale in `.env.example`, non fare mai commit di `.env` e non finanziare mai la frase di test BIP-39 pubblica (`abandon` ripetuto 11 volte, poi `about`).

## API principale {#main-api}

### `@qorechain/evm` (dalla 0.11.0) {#api-evm}

| Nome | Cosa fa |
|---|---|
| `qorechain`, `qorechainTestnet` | Oggetti chain di viem per 9801 e 9800 con endpoint pubblici ed explorer. |
| `QORECHAIN_CHAINS` | Entrambe le chain (mainnet, poi testnet), per wagmi o RainbowKit. |
| `QORECHAIN_REST_ENDPOINTS` | Da EVM chain ID all'URL REST della lane nativa. |
| `evmWindowStatus` | Legge una finestra via REST: `{ found, live, remainingBlocks, remainingTxs, remainingValue, nativeOnly, allowedTargets, ... }`. |
| `parseEvmWindow` | Interpreta la risposta REST. |
| `openEvmWindowMessage` | Controlla i limiti e costruisce `MsgOpenEVMWindow` come `{ typeUrl, value }`. |
| `checkOpenEvmWindowParams` | Solo i controlli sui limiti. |
| `evmWindowCost`, `weiToUqorCeil` | Dimensionamento della finestra in uqor. |
| `classifyEvmWindowRejection`, `isEvmWindowRejection` | Spiegano un rifiuto: `no-pqc-key`, `no-window`, `exhausted`, `invalid`. |
| `toQorAddress`, `toEvmAddress` | Convertono tra `0x` e `qor1...` per lo stesso account. |
| `OPEN_EVM_WINDOW_TYPE_URL`, `CLOSE_EVM_WINDOW_TYPE_URL`, `MAX_EVM_WINDOW_BLOCKS`, `MAX_EVM_WINDOW_TXS`, `MAX_EVM_WINDOW_TARGETS` | Costanti. |
| `@qorechain/evm/window` | Gli helper della finestra senza la dipendenza da viem. |

`@qorechain/evm` non firma né trasmette transazioni della lane nativa; per questo usa `@qorechain/sdk` o gli SDK dei vari linguaggi.

### Costruire e leggere una finestra in ogni SDK (attivo oggi, 0.10.0) {#api-window}

| Linguaggio | Aprire una finestra | Leggere una finestra |
|---|---|---|
| TypeScript | `openEvmWindowMsg` (`@qorechain/sdk`); `openEvmWindowMessage` (`@qorechain/evm`, dalla 0.11.0) | `fetchEvmWindow`; `evmWindowStatus` (dalla 0.11.0) |
| Python | `qorsdk.msg.pqc.open_evm_window` | `qorsdk.evm_window.get_evm_window` |
| Go | `messages.NewOpenEVMWindow` (`NewOpenEVMWindowScoped` per `nativeOnly` o `allowedTargets`) | REST `/qorechain/pqc/v1/evm_window/{address}` |
| Rust | `qorechain::msg::pqc::open_evm_window` | REST `/qorechain/pqc/v1/evm_window/{address}` |
| Java | `io.github.qorechain.evm.EvmWindow.open` | `EvmWindow.restPath` |

Consenso EIP-7702 (TypeScript, `@qorechain/sdk` 0.10.0): `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `classifyEvmDelegationRejection`.

`@qorechain/react` 0.11.0 aggiunge `PqcStatusBadge` (etichette predefinite "PQC key registered" e "No PQC key").

### Flag di `create-qorechain-dapp` {#api-scaffolder}

| Flag | Cosa fa |
|---|---|
| `-t, --template <name>` | `evm-solidity`, `fullstack-web`, `rollup-app` (attivi oggi); `foundry`, `hardhat`, `viem-wagmi`, `cosmwasm` (dalla 0.11.0). |
| `--network <name>` | Preset `testnet` o `mainnet`. |
| `--package-manager <pm>` | `pnpm`, `npm` o `yarn`. |
| `-y, --yes` | Salta le domande e usa i valori predefiniti. |
| `--no-install` | Non installare le dipendenze. |
| `-h, --help` / `-v, --version` | Aiuto e versione. |

### Script dei template (dalla 0.11.0) {#api-template-scripts}

| Template | Script | Cosa fa |
|---|---|---|
| `foundry`, `hardhat` | `pnpm window status` | Mostra l'account, se la sua chiave ML-DSA-87 è registrata (e se è questa chiave) e la sua finestra. |
| `foundry`, `hardhat` | `pnpm window register` | Registra la chiave ML-DSA-87 dell'account, una volta per account. |
| `foundry`, `hardhat` | `pnpm window open` | Apre una finestra (predefinita 600 blocchi, 5 transazioni). |
| `foundry` | `pnpm deploy:testnet` | `forge script script/Counter.s.sol --rpc-url qorechain_testnet --broadcast`. |
| `hardhat` | `pnpm build`, `pnpm test`, `pnpm deploy:testnet` | Build Hardhat, test, deploy Ignition su `qorechainTestnet`. |
| `viem-wagmi` | `pnpm dev`, `pnpm build` | Server di sviluppo su `http://localhost:5173`; build di produzione. |
| `cosmwasm` | `pnpm build:wasm`, `pnpm propose-store`, `pnpm instantiate`, `pnpm query` | Build ottimizzata, proposta di upload via governance, instanziazione (testnet), query REST. |

Variabili d'ambiente dei template (in `.env`, mai committate): `PRIVATE_KEY`, `QORE_MNEMONIC`, `QORE_NETWORK` (`testnet` o `mainnet`), `QORE_WINDOW_BLOCKS`, `QORE_WINDOW_TXS`, `QORE_WINDOW_MAX_UQOR`, `COUNTER_INITIAL`; `QORE_CODE_ID` e `QORE_I_KNOW_THIS_IS_MAINNET=yes` per gli script CosmWasm (lo script della proposta rifiuta la mainnet senza); `VITE_WALLETCONNECT_PROJECT_ID` per un wallet WalletConnect in `viem-wagmi`.

## Come accedere {#how-to-access}

| | Testnet | Mainnet |
|---|---|---|
| Chain ID nativo | `qorechain-diana` | `qorechain-vladi` |
| EVM chain ID (`eth_chainId`) | 9800 (`0x2648`) | 9801 (`0x2649`) |
| EVM JSON-RPC | `https://evm-testnet.qore.host` | `https://evm.qore.host` |
| EVM WebSocket | `wss://evm-ws-testnet.qore.host` | non pubblicato |
| REST | `https://api-testnet.qore.host` | `https://api.qore.host` |
| Consensus RPC | `https://rpc-testnet.qore.host` | `https://rpc.qore.host` |
| Explorer | `https://explore.qore.network` | `https://explore.qore.network` |

- **Le letture** non richiedono nulla: nessun account, nessuna chiave, nessuna finestra.
- **L'invio sulla lane EVM** richiede un account finanziato, la sua chiave ML-DSA-87 registrata on-chain (una volta) e una finestra aperta. La registrazione della chiave e la finestra sono transazioni della lane nativa.
- **Costo.** Il minimo della commissione è 0,1 uqor per gas su entrambe le reti. La lettura è gratuita. Il QOR di testnet proviene dal [Faucet](/dashboard/faucet).
- **CosmWasm.** Nessun upload di codice senza governance su nessuna delle due reti; nessuna instanziazione sulla mainnet senza governance. Il 27 ottobre 2026 la mainnet non aveva codici memorizzati.
- **Versioni di nodo e strumenti.** Vedi la tabella di installazione qui sopra.

## Dove è pubblicato {#where-published}

Versioni lette live da ciascun registry il 27 ottobre 2026. Il tag GitHub `v0.11.0` esiste (27 ottobre 2026), e non esiste ancora un oggetto release GitHub per esso (l'ultima release è la v0.10.0).

| Registry | Pacchetto | Versione attiva oggi | Stato della 0.11.0 | Link |
|---|---|---|---|---|
| npm | `@qorechain/evm` | 0.8.0 | **in sospeso, non pubblicata** | https://www.npmjs.com/package/@qorechain/evm |
| npm | `@qorechain/sdk` | 0.10.0 | **in sospeso, non pubblicata** | https://www.npmjs.com/package/@qorechain/sdk |
| npm | `@qorechain/react` | 0.10.0 | **in sospeso, non pubblicata** | https://www.npmjs.com/package/@qorechain/react |
| npm | `@qorechain/svm` | 0.8.0 | **in sospeso, non pubblicata** | https://www.npmjs.com/package/@qorechain/svm |
| npm | `create-qorechain-dapp` | 0.10.0 (template `evm-solidity`, `fullstack-web`, `rollup-app`) | **in sospeso, non pubblicata** | https://www.npmjs.com/package/create-qorechain-dapp |
| npm | `@qorechain/qorex-rainbowkit` (usato da `viem-wagmi`) | 0.1.0 | non fa parte della 0.11.0 | https://www.npmjs.com/package/@qorechain/qorex-rainbowkit |
| PyPI | `qorechain-sdk` | 0.10.0 | non fa parte della 0.11.0 | https://pypi.org/project/qorechain-sdk/ |
| crates.io | `qorechain-sdk` | 0.10.0 | non fa parte della 0.11.0 | https://crates.io/crates/qorechain-sdk |
| Go proxy | `github.com/qorechain/qorechain-sdk/packages/go` | v0.10.0 | non fa parte della 0.11.0 | https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go |
| Maven Central | `io.github.qorechain:qorechain-sdk` | 0.10.0 | non fa parte della 0.11.0 | https://central.sonatype.com/artifact/io.github.qorechain/qorechain-sdk |

Sorgente: [github.com/qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk), tag `v0.11.0`; percorsi `packages/evm`, `cli/`, `templates/`, `docs/docs/guides/`, `contrib/`. Apache-2.0, mantenuto dalla QoreChain Association.

## Limiti e problemi noti {#limits}

- **La 0.11.0 non è ancora su npm.** Tutto ciò che è contrassegnato "dalla 0.11.0" (le definizioni di chain viem, gli helper della finestra, `@qorechain/evm/window`, i quattro nuovi template, `PqcStatusBadge`) oggi non può essere installato da un registry. I nuovi template dipendono da pacchetti `^0.11.0`, quindi anche uno scaffold dal repository non si installerà da npm finché non sarà pubblicata. Questa pagina cambierà quando npm servirà la 0.11.0.
- **La 0.11.0 cambia solo i pacchetti npm.** Python, Rust, Go e Java restano alla 0.10.0, che contiene già i builder di finestra elencati sopra.
- **`@qorechain/evm` legge la finestra e compone il messaggio; non firma né trasmette** transazioni della lane nativa.
- **Nessun helper apre automaticamente una finestra prima di un invio**, per scelta progettuale.
- **Il wallet QoreX nel template `viem-wagmi`** risponde a `eth_chainId`, `eth_accounts`, `eth_requestAccounts` e `wallet_switchEthereumChain`; i suoi metodi di firma EVM non sono ancora disponibili. Usalo per connetterti e leggere, e firma con un wallet EIP-1193 iniettato.
- **L'helper `pnpm window` dei template deriva la chiave ML-DSA-87 dallo stesso segreto della chiave EVM.** Se la chiave dell'account è stata registrata da un altro wallet, apri la finestra da quel wallet.
- **Non disponibili sugli endpoint pubblici:** transazioni blob, tracing e i namespace `debug`, `personal`, `admin` e `miner`.
- **L'upload di CosmWasm passa dalla governance su entrambe le reti**; il template `cosmwasm` non può memorizzare codice da solo.
- **I contributi ad altri strumenti** (viem, Sourcify, Scaffold-ETH 2) sono file preparati nel repository, non integrati upstream.
- **Precompile EVM sulla mainnet:** nessuno è attivo. `pqcVerify` (`0x0A01`) e `pqcKeyStatus` (`0x0A02`) sono attivi solo sulla testnet.
- **Lo stato della rete è datato.** I valori di commissioni e tempi di blocco sono stati letti il 27 ottobre 2026.

## Note di sicurezza {#security}

- Il design della finestra significa che la chiave secp256k1 detenuta da una libreria EVM non può mai autorizzare da sola una spesa: aprire una finestra richiede una firma ibrida con la chiave ML-DSA-87 dell'account. Mantieni le finestre piccole (`blocks`, `maxTxs`, `maxValue`) e usa `nativeOnly` o `allowedTargets` dove puoi.
- `maxValue` include la commissione massima di ogni transazione; dimensionalo con `evmWindowCost` invece che solo in base al valore.
- I template leggono le chiavi da `.env`, che è ignorato da git; `.env.example` contiene segnaposto. Gli utenti Hardhat possono memorizzare la chiave cifrata con `npx hardhat keystore set PRIVATE_KEY`.
- Non finanziare mai la frase di test BIP-39 pubblica (`abandon` ripetuto 11 volte, poi `about`).
- Per una proposta CosmWasm sulla mainnet, pubblica il sorgente e una build riproducibile (l'optimizer stampa il checksum) così che i votanti possano verificare il binario.
- Segnala le vulnerabilità in privato a security@qore.network.

## Pagine correlate {#related}

- [Panoramica dei pacchetti per sviluppatori](/developer-tools/overview) e [Scaffolder e CLI](/developer-tools/scaffolders-and-cli) (l'attivo `create-qorechain-dapp` 0.10.0)
- [Panoramica dell'SDK](/sdk/overview), [Installazione dell'SDK](/sdk/install) e la [guida EVM](/sdk/guides/evm) (finestra, finestre delimitate, consenso EIP-7702, precompile)
- [Sviluppo EVM](/developer-guide/evm-development) e [Precompile EVM](/developer-guide/evm-precompiles#network-status)
- [Sviluppo QoreChain Native](/developer-guide/cosmwasm-development) (CosmWasm e proposte di governance)
- [Integrazioni QoreX](/developer-tools/qorex-integrations) (`@qorechain/qorex-rainbowkit`)
- [QoreSign](/qoresign/overview) (firma ibrida sulla lane nativa)
- [QoreScan](/developer-tools/qorescan) (inventario dell'uso di `ecrecover` e dei precompile PQC nei sorgenti Solidity)
