---
slug: /developer-tools/scaffolders-and-cli
title: Scaffolder di progetto e CLI qorollup
sidebar_label: Scaffolder e CLI
sidebar_position: 21
---

# Scaffolder di progetto e CLI `qorollup`

Tre strumenti da riga di comando portano un progetto QoreChain dal nulla a un punto di partenza tipizzato e compilabile. Sono pensati per gli sviluppatori di applicazioni (dApp) e per gli operatori di rollup che lavorano in Node.js:

* **`create-qorechain-dapp`** (0.10.0) genera lo scheletro di una dApp a partire da uno di tre template, costruiti sull'[SDK QoreChain](/sdk/overview).
* **`create-qorechain-rollup`** (0.7.0) genera lo scheletro di un progetto rollup a partire da uno di sei template, costruiti sul [Rollup Development Kit](/rollups/overview) TypeScript.
* **`qorollup`**, il comando del pacchetto `@qorechain/rdk-cli` (0.7.0), è la riga di comando dell'operatore: controlli preliminari, creazione e monitoraggio di un rollup, lettura dei parametri live.

La pagina riflette i pacchetti pubblicati così come installati da npm il 27 ottobre 2026. Le guide concettuali sono [Distribuire un Rollup](/rollups/deploying-a-rollup) e il [riferimento della CLI dell'SDK](/sdk/reference/cli).

## Innovazioni {#innovations}

* **Scaffolding non interattivo per la CI.** Ogni domanda ha un flag: `--template`, `--network`, `--package-manager`, `--yes` (accetta i valori predefiniti) e `--no-install`. Una pipeline può generare e compilare un progetto con un solo comando e senza terminale.
* **I template sono vincolati ai pacchetti correnti.** I template dApp dipendono da `@qorechain/sdk` `^0.10.0` (il template EVM da `@qorechain/evm`) e i template rollup da `@qorechain/rdk` `^0.7.0`. Uno scaffolder precedente (0.8.0) scriveva intervalli che si risolvevano in un SDK incapace di firmare per le reti live; con quello attuale questo non accade.
* **I template rollup codificano una configurazione valida per ogni caso d'uso.** Ogni template rollup imposta una combinazione di settlement, sequencer, data availability, gas e VM che la matrice di compatibilità dell'RDK accetta, e lo scaffolder stampa lo stake e il burn di creazione correnti prima che tu crei qualsiasi cosa.
* **Un comando di controllo preliminare che nomina ciò che manca.** `qorollup doctor` (e `npm run doctor` all'interno di un template rollup) verifica che l'endpoint REST risponda, che i parametri dei moduli siano leggibili, che l'endpoint sia la rete richiesta e che sia configurato un signer, e stampa una riga per ogni controllo. All'interno di un template convalida anche la configurazione del rollup rispetto alla matrice di compatibilità.
* **Firma ibrida integrata nei template.** I template rollup si connettono tramite un piccolo `signer.ts` che deriva la chiave ML-DSA-87 dell'account dalla tua mnemonica (oppure accetta un seed insieme a una chiave privata grezza) e firma in modo ibrido, come richiesto dalle reti sulla lane nativa. Il template dApp `rollup-app` fa lo stesso ed è eseguito come dry run a meno che tu non imposti `QORE_BROADCAST=1`.
* **Dry run.** `qorollup create ... --dry-run` convalida la configurazione, stampa lo stake e il burn e dichiara che invierebbe `MsgCreateRollup` senza trasmetterlo.
* **Output leggibile dalle macchine.** `qorollup ... --json` stampa JSON per gli script.

## Come si usa {#how-to-use}

### Generare una dApp {#create-dapp}

```bash
# interactive
npm create qorechain-dapp my-dapp
# non-interactive
npx create-qorechain-dapp my-dapp --template fullstack-web --network testnet --package-manager npm --yes
```

| Template | Cosa genera | Script |
| --- | --- | --- |
| `evm-solidity` | Un contratto Solidity `Counter` con un artefatto precompilato e uno script viem che lo distribuisce e lo chiama usando `@qorechain/evm`. File: `contracts/Counter.sol`, `contracts/Counter.artifact.ts`, `scripts/deploy.ts`, `.env`. | `deploy` |
| `fullstack-web` | Una pagina Vite, React e TypeScript che legge i saldi di un indirizzo (e una panoramica della tokenomics) con `@qorechain/sdk`. File: `index.html`, `src/App.tsx`, `src/main.tsx`, `vite.config.ts`, `.env`. | `dev`, `build`, `preview`, `typecheck` |
| `rollup-app` | Uno script Node che usa `createRollupClient` e `createMultilayerClient` dell'SDK per costruire messaggi di rollup e di sidechain o paychain. File: `src/index.ts` e la consueta configurazione. Dry run per impostazione predefinita. | `start`, `typecheck` |

| Flag | Significato |
| --- | --- |
| `-t, --template <name>` | `evm-solidity`, `fullstack-web` o `rollup-app` |
| `--network <name>` | `testnet` o `mainnet` |
| `--package-manager <pm>` | `pnpm`, `npm` o `yarn` |
| `-y, --yes` | salta le domande e usa i valori predefiniti |
| `--no-install` | non installa le dipendenze |
| `-h, --help`, `-v, --version` | aiuto, versione |

Esempio verificato (dal developer hub; eseguito il 27 ottobre 2026 in una directory vuota, con `npx` dal registro npm pubblico): genera il template web e lo compila. Osservato: `Done! Created my-dapp` e un `vite build` riuscito. La compilazione stampa un avviso sulla dimensione del bundle, che è innocuo.

```bash
npx -y create-qorechain-dapp my-dapp --template fullstack-web --network testnet --package-manager npm --yes
cd my-dapp && npm run build
```

Prima di eseguire l'app web, apri il file `.env` generato: punta a `http://localhost:1317` e `http://localhost:8545`, quindi imposta `VITE_QORE_REST_URL` su `https://api-testnet.qore.host` (oppure `https://api.qore.host` per la mainnet) e `VITE_QORE_EVM_RPC_URL` su `https://evm-testnet.qore.host` (oppure `https://evm.qore.host`).

### Generare un progetto rollup {#create-rollup}

```bash
npm create qorechain-rollup my-rollup
# non-interactive
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --package-manager npm --yes
```

| Template | Profilo | Settlement / sequencer / DA / gas / VM | File aggiuntivi |
| --- | --- | --- | --- |
| `defi-rollup` | defi | zk-SNARK, dedicated, native, EIP-1559, EVM | un prover di riferimento (`src/prover.ts`) e un circuito dimostrativo sotto `circuits/` |
| `gaming-rollup` | gaming | based, based, native, gas fisso, VM personalizzata | nessuno |
| `nft-rollup` | nft | optimistic, dedicated, QoreChain Native, con un flusso di contestazione | `src/challenge.ts` |
| `enterprise-rollup` | enterprise | based, based, native, gas sovvenzionato, EVM | nessuno |
| `custom-rollup` | custom | completamente parametrizzato, ogni campo documentato | nessuno |
| `multivm-rollup` | multivm | un rollup EVM che chiama i contratti QoreChain Native tramite il precompile cross-VM | `contracts/CrossVmCaller.sol`, `src/crossvm-call.ts` |

Ogni template contiene `rollup.config.ts` (la configurazione), `src/client.ts`, `src/signer.ts`, `src/create.ts`, `src/submit-batch.ts`, `src/query-status.ts`, `src/doctor.ts`, `src/status.ts`, `.env` e `.env.example`, un README e un `.github/workflows/deploy.yml`. Script: `create`, `submit-batch`, `query-status`, `doctor`, `status`, `typecheck`. I profili preimpostati sono spiegati in [Profili Preset](/rollups/preset-profiles).

Le opzioni sono le stesse dello scaffolder dApp, con i sei nomi di template indicati sopra. Il template `multivm-rollup` è elencato da `--help` ma non nel README del pacchetto, che ne elenca cinque.

Esempio verificato (developer hub, 27 ottobre 2026, `npx` da npm in una directory vuota). Osservato: `Created my-rollup (defi-rollup template)` e `tsc --noEmit` superato. Lo stesso scaffold e `npm run typecheck` sono stati ripetuti con la 0.6.2 lo stesso giorno, con lo stesso risultato.

```bash
npx -y create-qorechain-rollup my-rollup --template defi-rollup --network testnet --package-manager npm --yes
cd my-rollup && npm run typecheck
```

Passaggi successivi, così come li stampa lo scaffolder: `npm install`, inserire la chiave dell'operatore in `.env`, `npm run doctor`, `npm run create`, `npm run query-status`. Il file `.env` generato contiene già gli endpoint pubblici della testnet (`https://api-testnet.qore.host`, `https://rpc-testnet.qore.host`, `https://evm-testnet.qore.host`) e campi chiave vuoti: `QORE_MNEMONIC` oppure `QORE_OPERATOR_PRIVATE_KEY_HEX` (con `QORE_PQC_SEED_HEX` per il seed post-quantistico). Non eseguire mai il commit di quel file.

### La CLI `qorollup` {#qorollup}

```bash
npm install -g @qorechain/rdk-cli
qorollup --version          # 0.7.0
qorollup doctor --network testnet
```

Puoi anche eseguirla senza installarla: `npx @qorechain/rdk-cli doctor`.

| Comando | Cosa fa |
| --- | --- |
| `doctor` | controllo preliminare: endpoint, parametri dei moduli, corrispondenza della rete, signer, saldo, configurazione |
| `params` | stampa i parametri live dei moduli |
| `create --rollup-id <id>` | crea un rollup (`--profile`, `--stake-uqor`, `--dry-run`) |
| `status <id>`, `watch <id>` | stato e salute, oppure una vista live (`--interval <ms>`) |
| `advise <id>` | consigli dal Copilot QCAI (vedi [Copilot QCAI](/rollups/qcai-copilot)) |
| `suggest "<use case>"` | suggerisce un profilo per un caso d'uso |
| `receipt <id> <batch>` | costruisce una ricevuta di settlement (`--verify`, `--out <file>`), vedi [Ricevute di settlement](/rollups/settlement-receipts) |
| `watchtower <id>` | framework di contestazione per i rollup optimistic, vedi [Watchtower](/rollups/watchtower) |
| `pause`, `resume`, `stop <id>` | transizioni del ciclo di vita (solo il creatore) |
| `keygen` | genera una chiave dell'operatore (mnemonica e indirizzo) |
| `manifest export`, `manifest import` | esporta o importa un manifest di rollup |
| `withdraw --file <json>` | assembla e invia un prelievo (`--dry-run`) |
| `faucet <address>` | richiede fondi di testnet (richiede `QORE_FAUCET_URL`) |

Flag globali: `--network testnet|mainnet` (predefinito testnet), `--rest`, `--rpc`, `--evm-rpc` (sostituzioni degli endpoint, oppure `QORE_REST_URL`, `QORE_RPC_URL`, `QORE_EVM_RPC_URL`), `--mnemonic` o `--key` (oppure `QORE_MNEMONIC`, `QORE_OPERATOR_PRIVATE_KEY_HEX`), `--profile defi|gaming|nft|enterprise|custom`, `--json`, `-y, --yes`, `-h, --help`, `-v, --version`.

**`doctor`.** Eseguilo prima di qualsiasi operazione che invia una transazione. Output osservato il 27 ottobre 2026 con la 0.6.2 e nessun signer impostato, sulla testnet (la mainnet ha stampato lo stesso, con `qorechain-vladi` e `https://api.qore.host`; lo strumento stampa trattini lunghi, qui mostrati come trattini semplici):

```text
Preflight (testnet - qorechain-diana):
✓ REST endpoint reachable - https://api-testnet.qore.host
✓ Module parameters readable - min stake 10000 QOR, burn 1%
✓ Network matches expectation - client is testnet (qorechain-diana)
! Signer configured - no signer (Set QORE_OPERATOR_PRIVATE_KEY_HEX or QORE_MNEMONIC to create/operate.)
All checks passed.
```

Una riga che inizia con `!` è un avviso e non fa fallire l'esecuzione; un signer mancante è un problema solo quando vuoi creare o gestire un rollup. Il comando termina con codice 0 quando nessun controllo fallisce.

**Esempio verificato.** Dal developer hub: leggere i parametri live dei moduli senza alcuna chiave. Con la 0.6.1 è fallito (il comando non ha stampato nulla ed è terminato con 0) ed è stato rieseguito con la 0.6.2:

```bash
npx -y @qorechain/rdk-cli params --network testnet --rest https://api-testnet.qore.host
```

Osservato con la 0.6.2 tramite `npx`, tramite un'installazione globale e tramite il link locale `node_modules/.bin/qorollup` (e con la 0.7.0 tramite il link locale, dove `qorollup --version` ha stampato 0.7.0): i parametri dei moduli vengono stampati (rollup massimi 200, stake minimo 10000 QOR, burn di creazione 1%, finestra di contestazione 3600 s, blob di data availability massimo 2,097,152 byte, conservazione dei blob 432,000 blocchi, batch massimi per blocco 10). Un dry run di una creazione, anch'esso osservato:

```bash
qorollup create --rollup-id my-roll --profile defi --dry-run --network testnet
# Create rollup "my-roll" (profile defi, zk/evm)
# Stake 10000 QOR - burned on creation: 100 QOR
# Dry run OK - would submit MsgCreateRollup (no broadcast).
```

## Come accedere {#how-to-access}

* **Prerequisiti.** Node.js 20 o successivo e un package manager. Gli scaffolder scrivono file e, a meno che tu non passi `--no-install`, installano le dipendenze, quindi richiedono accesso di rete al registro npm. I client RDK in Python, Rust, Go e Java sono librerie e non hanno uno scaffolder; vedi [Distribuire un Rollup](/rollups/deploying-a-rollup).
* **Reti ed endpoint.** Mainnet `qorechain-vladi` (EVM chain id 9801): REST `https://api.qore.host`, RPC `https://rpc.qore.host`, EVM `https://evm.qore.host`. Testnet `qorechain-diana` (chain id 9800): gli stessi host con `-testnet` dopo la prima etichetta, per esempio `https://api-testnet.qore.host`. La lettura dei dati, `doctor`, `params`, `suggest` e `--dry-run` non richiedono alcun account.
* **Account e chiavi.** Tutto ciò che invia una transazione richiede un account operatore con fondi e la sua mnemonica o chiave privata, fornite tramite variabili d'ambiente o flag, mai sottoposte a commit. Creare un rollup richiede lo stake minimo (10,000 QOR su entrambe le reti, letto live il 27 ottobre 2026), di cui l'1% viene bruciato alla creazione. `qorollup keygen` genera una nuova chiave; sulla testnet i fondi di prova arrivano dal [Faucet della Dashboard](/dashboard/faucet), oppure da `qorollup faucet` con `QORE_FAUCET_URL` impostato.
* **Firma ibrida.** Le transazioni della lane nativa richiedono una firma secp256k1 più una firma ML-DSA-87. I template derivano la chiave post-quantistica dalla tua mnemonica; i comandi di transazione di `qorollup` no (vedi i limiti qui sotto).
* **Costi.** Gli strumenti sono gratuiti (Apache-2.0). On-chain, il minimo della commissione è 0,1 uqor per gas; lo stake del rollup e il burn indicati sopra si applicano alla creazione.

## Dove è pubblicato {#where-published}

| Registro | Pacchetto | Versione | Link |
| --- | --- | --- | --- |
| npm | `create-qorechain-dapp` (comando `create-qorechain-dapp`) | 0.10.0 | https://www.npmjs.com/package/create-qorechain-dapp |
| npm | `create-qorechain-rollup` (comando `create-qorechain-rollup`) | 0.7.0 | https://www.npmjs.com/package/create-qorechain-rollup |
| npm | `@qorechain/rdk-cli` (comando `qorollup`) | 0.7.0 | https://www.npmjs.com/package/@qorechain/rdk-cli |
| npm | `@qorechain/rdk` (libreria usata dai template) | 0.7.0 | https://www.npmjs.com/package/@qorechain/rdk |

Sorgenti: https://github.com/qorechain/qorechain-sdk/tree/main/cli (scaffolder dApp), https://github.com/qorechain/qorechain-rdk/tree/main/cli (scaffolder rollup) e https://github.com/qorechain/qorechain-rdk/tree/main/packages/rdk-cli (`qorollup`). La release 0.7.0 dell'RDK è disponibile anche su PyPI, crates.io, Maven Central e sul Go module proxy (verificato il 27 ottobre 2026). Tutti sono Apache-2.0.

## Limiti e problemi noti {#limits}

* **`--network mainnet` non ha cambiato i file generati in un'esecuzione di prova.** Il 27 ottobre 2026 `fullstack-web` e `custom-rollup` sono stati generati con `--network mainnet`; il `.env` generato conteneva ancora endpoint localhost (dApp) oppure `QORE_NETWORK=testnet` con gli endpoint della testnet (rollup), e l'`App.tsx` della dApp creava un client `testnet`. Imposta tu la rete e gli endpoint in `.env` e, per il template web, in `src/App.tsx`.
* **Nessun rollup esiste ancora su nessuna delle due reti** (verificato il 27 ottobre 2026). Nessun percorso di transazione degli strumenti rollup è stato messo alla prova su un rollup live. Convalida tutto prima sulla testnet e leggi [RDK 0.7.0: modifiche e limiti](/rollups/deploying-a-rollup#rdk-050-limits).
* **Il template `defi-rollup` non può effettuare il settlement di un batch.** Il settlement ZK non è ancora utilizzabile su nessuna delle due reti (la registrazione delle chiavi è prevista per la chain v3.2.7), e il suo circuito dimostrativo non potrebbe comunque superare il controllo della prova della chain. Dalla 0.7.0 il template si ferma prima dell'invio, quindi non spende più una fee per un batch che la chain rifiuta sempre. Usa un template con settlement `optimistic` finché la situazione non cambia (vedi [ZK, STARK e prelievi](/rollups/zk-stark-withdrawals)).
* **Il template `multivm-rollup` dipende da qualcosa che non è live.** Il precompile cross-VM all'indirizzo `0x0000000000000000000000000000000000000901` non è attivo su nessuna delle due reti, quindi una chiamata da un contratto non produce alcun effetto; il template lo verifica e il suo contratto è scritto in modo da fare revert invece di fallire in silenzio (vedi [Multi-VM](/rollups/multi-vm)).
* **I comandi di transazione di `qorollup` firmano solo in modo classico.** `create`, `pause`, `resume`, `stop` e `withdraw` si connettono senza una chiave post-quantistica, che entrambe le reti rifiutano sulla lane nativa. Le letture, `doctor`, `params`, `receipt` e `--dry-run` non sono interessati. Per inviare transazioni, usa un progetto generato (i suoi script firmano in modo ibrido), l'RDK TypeScript con un `pqcKeypair`, oppure la CLI della chain.
* **Alcuni helper di `qorollup` non hanno ancora nulla con cui comunicare.** `advise` sulla testnet il 27 ottobre ha stampato "advisory unavailable" per le superfici di commissioni, rete, frodi e agente RL (il nodo rispondeva 501 o "method does not exist") e per un rollup che non esiste. `suggest` ha restituito un profilo con `source: fallback`, il che indica che è stato usato l'elenco predefinito integrato invece del servizio assistente. Leggi gli avvisi.
* **`rollup-app` trasmette solo quando lo chiedi.** Esegue un dry run per impostazione predefinita; con `QORE_BROADCAST=1` registra una sola volta la chiave ML-DSA-87 dell'account e firma in modo ibrido. I suoi valori di esempio per il rollup sono illustrativi: prendi i nomi reali dei profili e lo stake da [Profili Preset](/rollups/preset-profiles).
* **`fullstack-web` mostra un errore sul pulsante della tokenomics.** Quel pannello chiama un metodo JSON-RPC `qor_` che gli endpoint pubblici non servono; la consultazione del saldo funziona. Sostituiscilo con una lettura REST come `client.rest.getBurnStats()`.
* **`evm-solidity` richiede più di un account con fondi.** Inviare una transazione EVM su QoreChain richiede anche una chiave ML-DSA-87 registrata e una finestra di autorizzazione EVM aperta, predisposte dalla lane nativa (vedi la [guida EVM](/developer-guide/evm-development#evm-window)). Lo script `deploy` del template non è stato eseguito su una rete live per questa pagina.
* **`create-qorechain-dapp --version` stampa `0.5.1`** sebbene il pacchetto installato sia la 0.10.0 (verificato il 27 ottobre 2026). Leggi la versione da `package.json` o dal registro.
* **I README dei pacchetti sono obsoleti.** Il README di `create-qorechain-dapp` elenca due template e quello di `create-qorechain-rollup` cinque; `--help` ne mostra tre e sei. Fidati di `--help`.
* **Le versioni precedenti alla 0.6.2 non funzionano da npm.** `qorollup` 0.6.1 e precedenti, installato tramite npm in qualsiasi modo, non ha stampato nulla ed è terminato con codice 0, e `--version` ha stampato `0.4.1`. Se devi restare sulla 0.6.1, esegui `node node_modules/@qorechain/rdk-cli/dist/index.js <command>`; altrimenti aggiorna.
* **Copie delle dipendenze (solo 0.6.x).** `@qorechain/rdk` 0.6.2 e precedenti dipendono da `@qorechain/sdk` `^0.9.0`, quindi un progetto che installava anche l'SDK 0.10.0 conteneva un secondo SDK 0.9.x annidato. Dalla 0.7.0 il kit dipende da `@qorechain/sdk` `^0.10.0` e condivide un'unica copia.
