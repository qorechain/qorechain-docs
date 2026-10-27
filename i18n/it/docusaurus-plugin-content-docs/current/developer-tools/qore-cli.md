---
slug: /developer-tools/qore-cli
title: CLI di QoreChain (qore)
sidebar_label: CLI di QoreChain
sidebar_position: 24
---

# CLI di QoreChain (`@qorechain/qore-cli`, comando `qore`)

`qore` legge QoreChain dal terminale. È pensata per sviluppatori, operatori e script che vogliono cercare una transazione, controllare se la sua firma post-quantistica si verifica, leggere un account o l'insieme dei validatori, simulare una transazione o preparare un trasferimento non firmato, senza scrivere codice. Ogni comando esegue uno strumento del [server MCP di QoreChain](/developer-tools/mcp), e `--json` stampa esattamente il JSON restituito dallo strumento, così uno script e un agente AI vedono gli stessi dati.

Nulla viene mai firmato o trasmesso, e la CLI non custodisce chiavi. Versione **0.1.0**, pubblicata il 27 ottobre 2026, Apache-2.0, Node.js 20 o successivo.

## Innovazioni {#innovations}

- **JSON identico all'output dello strumento MCP.** `qore <command> --json` stampa lo stesso oggetto, con gli stessi nomi di campo, restituito dallo strumento MCP corrispondente. Senza `--json` lo stesso oggetto viene stampato come testo leggibile. Uno script scritto per uno funziona con l'altro.
- **Stato post-quantistico dal terminale.** `qore pq status <txhash>` indica se la transazione contiene esattamente un livello ibrido e se la firma ML-DSA-87 (FIPS 204) si verifica rispetto alla chiave che il firmatario ha registrato on-chain, per sign-bytes v1 e v2. `qore pq status <address>` indica la chiave registrata, il suo tipo, la prova di possesso e la finestra di autorizzazione EVM.
- **Una pipeline per un trasferimento che non richiede chiavi.** `prepare-transfer --json` scrive un trasferimento non firmato e `simulate` accetta quel file, così puoi costruire, controllare e valutare il costo di un trasferimento da uno script di shell. Il passaggio di firma resta nel tuo wallet o in [QoreSign](/qoresign/overview).
- **Codici di uscita stabili.** 0 è successo, 1 è un errore dello strumento che riporta un codice stabile come `NOT_FOUND` o `INVALID_INPUT`, e 2 è un errore d'uso, così uno script può ramificare in base al risultato.

## Come si usa {#how-to-use}

Eseguila senza installare, oppure installala una volta sola:

```bash
npx -y @qorechain/qore-cli chain
npm install -g @qorechain/qore-cli
qore --version
```

I comandi sono in sola lettura e usano la testnet per impostazione predefinita:

```bash
# the latest block, and the chain info
qore block
qore chain

# is this testnet transaction hybrid-signed, and does the ML-DSA-87 layer verify?
qore pq status F642F59F2A2FEDA2B3A61A3CF49F8B5F792D65985027997004FEBB22A6F42152

# an account on mainnet, as JSON
qore account qor1... --network mainnet --json

# the top bonded validators
qore validators --limit 3

# an unsigned transfer, then its simulation (nothing is signed or sent)
qore prepare-transfer --from qor1... --to qor1... --amount 1.5 --json > transfer.json
qore simulate transfer.json
qore estimate-fee --from qor1... --to qor1... --amount 1.5
```

Gli importi sono `1.5` o `1.5 QOR` (QOR, fino a 6 decimali) oppure `1500000uqor`. Gli indirizzi possono essere `qor1...` o `0x...`.

### Comandi {#commands}

| Comando | Strumento MCP | Cosa fa |
|---|---|---|
| `chain`, `features` | `get_chain_info` | ID della chain, ultimo blocco, prezzo minimo del gas, versione dei sign-bytes, interruttori delle funzionalità del protocollo, precompile EVM attive |
| `block [height]` | `get_block` | un blocco, l'ultimo per impostazione predefinita |
| `tx get <hash>` | `get_transaction` | una transazione per hash nativo o EVM: stato, commissione, messaggi, firmatari, livello di firma |
| `account <address>` | `get_address_info` | saldi, stato dell'account, importo in staking, entrambe le forme dell'indirizzo |
| `pq status <address\|txhash>` | `get_pq_status` | stato della chiave ML-DSA-87 per un indirizzo, oppure la verifica del livello ibrido per una transazione |
| `validators [--status S] [--limit N]` | `get_validators` | validatori per stake; lo stato è `bonded` (predefinito), `unbonding`, `unbonded` o `all`; limite fino a 200 |
| `staking-tiers [--holder A]` | `get_staking_tiers` | parametri e pool dei livelli di staking, e i blocchi di un singolo titolare (chain v3.2.4 e successive) |
| `search <query>` | `search` | riconosce un'altezza, un hash, un indirizzo o un validatore e lo legge |
| `read-contract --to 0x.. (--data 0x.. \| --function "f(address)" --arg V) [--returns T]` | `read_contract` | solo un `eth_call` EVM, con codifica e decodifica opzionali |
| `simulate <txfile.json\|base64> [--no-pqc-placeholder]` | `simulate_tx` | gas, variazioni di saldo e un rifiuto decodificato per una transazione codificata |
| `estimate-fee (<txfile.json\|base64> \| --from A --to B --amount X)` | `estimate_fee` | limite di gas suggerito e commissione, incluso il livello ML-DSA-87 |
| `prepare-transfer --from A --to B --amount X [--memo M] [--gas-limit N]` | `prepare_transfer` | un trasferimento non firmato che il tuo wallet deve firmare |

Opzioni globali: `--network testnet|mainnet` (predefinita `testnet`), `--json`, `--timeout <ms>` (timeout a monte, predefinito 10000), `--help` e `--version`. Gli schemi degli strumenti sono nel [riferimento degli strumenti MCP](https://github.com/qorechain/qorechain-mcp/blob/main/docs/tools.md).

### Cosa è stato eseguito {#what-was-run}

Il 27 ottobre 2026 `@qorechain/qore-cli` 0.1.0 e `@qorechain/mcp` 0.1.0 sono stati installati da npm in un progetto vuoto e questi comandi in sola lettura sono stati eseguiti sugli endpoint pubblici:

- `qore --version` ha stampato `0.1.0`, e `qore --help` ha elencato i comandi qui sopra.
- `qore chain` (testnet) ha stampato la chain `qorechain-diana`, EVM chain ID 9800, prezzo minimo del gas 0.1 e sign-bytes `v2`; `qore chain --network mainnet` ha stampato la chain `qorechain-vladi`, EVM chain ID 9801 e sign-bytes `v2`.
- `qore block`, `qore validators --limit 3 --json`, `qore staking-tiers --json`, `qore search 8981000`, `qore account qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08` e `qore read-contract --to 0x...0a02 --function "x()"` hanno restituito i loro dati.
- `qore pq status F642F59F...2152` ha stampato livello `pqc`, `has_exactly_one_pqc_layer: true` e `verified: true` con sign-bytes `v2`.
- `qore prepare-transfer --from A --to A --amount 1.5 --json` ha scritto un trasferimento non firmato (limite di gas 171698, commissione 17170 uqor), `qore simulate` su quel file ha restituito `ok: true`, e `qore estimate-fee` ha restituito una commissione coincidente. Mittente e destinatario erano lo stesso indirizzo, quindi lo strumento ha aggiunto un avviso, e nulla è stato firmato né inviato.
- `qore tx get zzz` ha stampato `error [INVALID_INPUT]` ed è uscito con 1; `qore bogus` è uscito con 2.

## Come accedere {#how-to-access}

- **Reti.** Testnet `qorechain-diana` (predefinita) e mainnet `qorechain-vladi` con `--network mainnet`.
- **Endpoint.** La CLI legge gli endpoint pubblici REST, RPC e JSON-RPC EVM: `https://api-testnet.qore.host`, `https://rpc-testnet.qore.host` e `https://evm-testnet.qore.host` sulla testnet, e `https://api.qore.host`, `https://rpc.qore.host` e `https://evm.qore.host` sulla mainnet.
- **Account e chiavi.** Nessuno. Non c'è accesso, né chiave API, né file di configurazione; la chiave dell'endpoint MCP ospitato non si applica alla CLI.
- **Prerequisiti.** Node.js 20 o successivo e HTTPS in uscita.
- **Costo.** Gratuita. Per inviare il trasferimento che hai preparato paghi la commissione di rete (minimo 0.1 uqor per gas) dal tuo wallet; la CLI non esegue quel passaggio.

## Dove è pubblicata {#where-published}

| Registro | Pacchetto | Versione | Installazione | Note |
|---|---|---|---|---|
| npm | [`@qorechain/qore-cli`](https://www.npmjs.com/package/@qorechain/qore-cli) | 0.1.0 | `npm install -g @qorechain/qore-cli` | Bin `qore`. Node.js 20 o successivo |

Sorgenti: [github.com/qorechain/qorechain-mcp](https://github.com/qorechain/qorechain-mcp), cartella `packages/cli` (pubblico, Apache-2.0, verificato il 27 ottobre 2026). Non esiste una build Python o Rust della CLI; il server stesso è disponibile anche su PyPI come [`qorechain-mcp`](/developer-tools/mcp#where-published).

## Limiti e problemi noti {#limits}

- **Sola lettura.** Nessun comando firma o trasmette. `prepare-transfer` costruisce solo un `MsgSend` di uqor sul lane nativo; non prepara transazioni EVM, SVM, di staking, di governance o di contratti. `simulate` e `estimate-fee` accettano qualsiasi transazione codificata del lane nativo.
- **Nessun faucet e nessun elenco dei titolari di token.** Questi due strumenti MCP non hanno un comando CLI. I QOR di testnet arrivano dal [Faucet](/dashboard/faucet).
- **La cronologia della testnet viene eliminata.** Un vecchio blocco o una vecchia transazione della testnet restituisce `NOT_FOUND` con l'altezza minima disponibile; la mainnet era servita dall'altezza 1 al momento del controllo.
- **Le cifre del gas differiscono per rete.** La simulazione sulla testnet include già il costo di verifica ML-DSA-87; la simulazione sulla mainnet no, quindi il limite di gas suggerito ha un margine.
- **Limiti di output.** Al massimo 100 hash di transazione per blocco, 50 messaggi per transazione, 100 saldi per account, 200 validatori per chiamata. Ogni richiesta ha un timeout predefinito di 10 secondi, un limite di risposta di 4 MiB e nessun nuovo tentativo.
- **I segreti vengono rifiutati.** Un input che sembra una frase di recupero o una chiave privata nuda viene respinto con `INVALID_INPUT`. Non inserirne uno in una riga di comando: la cronologia della shell lo conserva.
- **Le precompile EVM post-quantistiche** `0x...0A01` e `0x...0A02` sono attive solo sulla testnet.
- **Prima release.** 0.1.0: i nomi dei comandi e le opzioni possono cambiare nelle versioni successive. Usa `--json` e i codici di uscita per gli script, e fissa la versione.

Pagine correlate: [Server MCP di QoreChain](/developer-tools/mcp), [Panoramica dei pacchetti per sviluppatori](/developer-tools/overview), [Riferimento CLI dell'SDK](/sdk/reference/cli), [Faucet](/dashboard/faucet).
