---
slug: /developer-tools/mcp
title: Server MCP di QoreChain
sidebar_label: Server MCP
sidebar_position: 23
---

# Server MCP di QoreChain (`@qorechain/mcp`)

Il server MCP di QoreChain offre ad agenti AI e strumenti per sviluppatori un accesso in sola lettura a QoreChain tramite il [Model Context Protocol](https://modelcontextprotocol.io): blocchi, transazioni, account, validatori, livelli di staking, lo stato della firma ibrida secp256k1 più ML-DSA-87 (FIPS 204), letture di contratti EVM, simulazione e stime delle commissioni, e trasferimenti non firmati che il proprietario dell'account firma nel proprio wallet. È pensato per gli sviluppatori che collegano a QoreChain un client o un agente compatibile con MCP, e per i team che vogliono una vista della chain in sola lettura, programmabile e con output stabile.

Il server non firma mai, non custodisce chiavi e non trasmette mai una transazione. Gira sulla tua macchina tramite stdio, oppure come server Streamable HTTP che ospiti tu o che è ospitato da QoreChain. Versione **0.1.0**, pubblicata il 27 ottobre 2026, Apache-2.0. Un gemello da riga di comando, [`qore`](/developer-tools/qore-cli), esegue gli stessi strumenti da un terminale.

## Innovazioni {#innovations}

- **Verifica della firma ibrida, non solo un'etichetta.** `get_pq_status` prende l'hash di una transazione, conferma che il corpo contenga esattamente un livello `/qorechain.pqc.v1.PQCHybridSignature` e verifica localmente quel livello ML-DSA-87 con [QoreSign](/qoresign/overview) rispetto alla chiave che il firmatario ha registrato on-chain, provando sign-bytes v1 e v2. La risposta è `verified: true` o `false` con il motivo, non una supposizione basata sul tipo di transazione.
- **Trasferimenti non firmati che riportano la commissione reale.** `prepare_transfer` legge numero di account, sequenza e chiave pubblica del mittente, simula il trasferimento con un livello ML-DSA-87 segnaposto della dimensione corretta, così che il gas includa il livello che il wallet aggiunge al momento della firma, e restituisce il SignDoc, un riepilogo leggibile e i controlli. L'unica cosa che manca è la firma del proprietario.
- **Simulazione con rifiuti decodificati.** `simulate_tx` e `estimate_fee` restituiscono il gas usato, un limite di gas suggerito, la variazione di saldo per indirizzo e, quando la rete rifiuterebbe la transazione, un rifiuto decodificato al posto di una stringa di errore grezza.
- **Uno schema unico per il server e la CLI.** Ogni comando `qore` esegue uno strumento MCP, e `qore --json` stampa esattamente il JSON restituito dallo strumento. Il pacchetto Python espone gli stessi nomi di strumenti, gli stessi schemi di input e output e gli stessi codici di errore; entrambi sono testati con le stesse risposte registrate della chain.
- **I segreti vengono rifiutati prima che qualcosa lasci la macchina.** Un input che sembra una frase di recupero (12 o più parole BIP-39 consecutive) o una chiave privata nuda da 32 byte viene respinto con `INVALID_INPUT` prima di qualsiasi richiesta, e l'errore dice all'utente di considerare quel segreto compromesso.
- **Risposte costruite campo per campo.** Ogni output è assemblato a partire da campi con nome della risposta della chain. I corpi di errore a monte e gli stack trace non raggiungono mai il client; i guasti corrispondono a sette codici di errore stabili.

## Come si usa {#how-to-use}

Serve Node.js 20 o successivo per il pacchetto npm, oppure Python 3.10 o successivo per il pacchetto Python.

### Eseguirlo in locale con npx {#run-npx}

Verifica che il server si avvii, poi aggiungilo al tuo client MCP. La maggior parte dei client che avviano server locali legge un file JSON con un oggetto `mcpServers` (il nome del file e i nomi delle chiavi per i server HTTP cambiano a seconda del client; consulta la documentazione del tuo client):

```bash
npx -y @qorechain/mcp --version
```

```json
{
  "mcpServers": {
    "qorechain": { "command": "npx", "args": ["-y", "@qorechain/mcp"] }
  }
}
```

Riavvia il client. Elenca 14 strumenti. Il server parla stdio con il client. Poi chiedi, per esempio:

- "Qual è l'ultimo blocco sulla mainnet di QoreChain?" (`get_block`)
- "La transazione testnet F642F59F2A2FEDA2B3A61A3CF49F8B5F792D65985027997004FEBB22A6F42152 contiene un livello ML-DSA-87 valido?" (`get_pq_status`)
- "Prepara un trasferimento testnet di 1,5 QOR dal mio indirizzo a qor1... e stima la commissione." (`prepare_transfer`, `estimate_fee`)

### Eseguirlo in locale con pip o uvx {#run-pip}

```bash
pip install qorechain-mcp
qorechain-mcp --network testnet      # stdio
# or, without installing:
uvx qorechain-mcp
```

```json
{ "mcpServers": { "qorechain": { "command": "uvx", "args": ["qorechain-mcp"] } } }
```

Il pacchetto Python supporta solo stdio. Per Streamable HTTP, chiavi API e limiti di frequenza usa il pacchetto npm (sotto). Il pacchetto ha anche un punto di ingresso come libreria, `run_tool`.

### Eseguirlo come server HTTP {#run-http}

```bash
npx -y @qorechain/mcp serve --port 8787
# listening on http://127.0.0.1:8787/mcp
```

Il trasporto HTTP è senza stato e risponde in JSON: `POST /mcp` per le richieste MCP, `GET /healthz` per `{"status":"ok"}`. Opzioni:

| Opzione | Predefinito | Significato |
|---|---|---|
| `--port` | 8787 | porta TCP |
| `--host` | 127.0.0.1 | indirizzo di bind; `0.0.0.0` resta in ascolto su ogni interfaccia |
| `--api-keys-file` | nessuno | file di hash SHA-256 delle chiavi accettate; se impostato, le richieste richiedono `Authorization: Bearer <key>` |
| `--rate-limit` | 60 | richieste al minuto per chiave API e per IP del client; `0` lo disattiva |
| `--allowed-origin` | nessuno | origine del browser autorizzata a chiamare l'endpoint (ripetibile); le altre origini ricevono HTTP 403 |
| `--trust-proxy` | disattivato | prende l'IP del client da `X-Forwarded-For`; solo dietro un proxy che controlli |
| `--network` | testnet | rete per le chiamate che non ne indicano nessuna |

Per proteggere il tuo endpoint, genera una chiave, conserva solo il suo hash e consegna la chiave al client:

```bash
openssl rand -hex 32 > my.key
npx -y @qorechain/mcp hash-key < my.key >> api-keys.txt
npx -y @qorechain/mcp serve --api-keys-file api-keys.txt
```

`api-keys.txt` contiene un hash da 64 caratteri esadecimali per riga (è accettato un prefisso opzionale `sha256:`, `#` inizia un commento). Una chiave mancante o sconosciuta riceve HTTP 401 con un messaggio di errore che inizia con `UNAUTHORIZED`; oltre il limite di frequenza il server risponde HTTP 429 con `Retry-After`. Metti TLS davanti a qualsiasi server raggiungibile dall'esterno della tua macchina.

Il pacchetto esporta anche `createServer`, `createHttpHandler` e `startNodeServer` per l'integrazione nel tuo runtime. Dettagli completi: [self-hosting](https://github.com/qorechain/qorechain-mcp/blob/main/docs/self-hosting.md) nel repository dei sorgenti.

### Configurazione {#configuration}

| Impostazione | Come | Effetto |
|---|---|---|
| Rete per chiamata | l'argomento `network` di qualsiasi strumento: `testnet` o `mainnet` | Sceglie la chain per quella chiamata |
| Rete predefinita | `--network testnet` o `--network mainnet` nel comando del server | La rete usata quando una chiamata non ne indica nessuna. Predefinita `testnet` |
| Porta, host, chiavi, limiti HTTP | opzioni di `serve` sopra | Solo in modalità HTTP |
| Timeout a monte | fisso a 10 secondi per richiesta, limite di risposta di 4 MiB, nessun nuovo tentativo | Gli endpoint lenti producono `UPSTREAM_UNAVAILABLE` |

La mainnet è `qorechain-vladi` (EVM chain ID 9801) e la testnet è `qorechain-diana` (EVM chain ID 9800). Un trasferimento preparato per la mainnet riporta un avviso aggiuntivo. Non ci sono variabili d'ambiente per la rete: si usa il flag da riga di comando o l'argomento per chiamata. Per rendere la mainnet la rete predefinita di un client:

```json
{ "command": "npx", "args": ["-y", "@qorechain/mcp", "--network", "mainnet"] }
```

### Strumenti {#tools}

Tutti i 14 strumenti sono in sola lettura e accettano un `network` opzionale. I loro input e output sono generati dagli schemi del server stesso; il [riferimento degli strumenti](https://github.com/qorechain/qorechain-mcp/blob/main/docs/tools.md) elenca ogni campo.

| Strumento | Cosa restituisce |
|---|---|
| `get_chain_info` | ID della chain, ultimo blocco, prezzo minimo del gas, versione dei sign-bytes, interruttori delle funzionalità del protocollo, un eventuale aggiornamento in sospeso se programmato, precompile EVM attive |
| `get_block` | un blocco (o l'ultimo): hash, ora, proposer, numero di transazioni e fino a 100 hash di transazione |
| `get_transaction` | una transazione per hash nativo o hash EVM (prefisso `0x`): stato, commissione, memo, gas, fino a 50 messaggi, firmatari e livello di firma (`pqc`, `enrollment`, `shake` o `classical`) |
| `get_address_info` | entrambe le forme dell'indirizzo (`qor1...` e `0x...`), stato dell'account, fino a 100 saldi, importo in staking, se è registrata una chiave ML-DSA-87, se è distribuito del bytecode |
| `get_pq_status` | per un indirizzo: chiave registrata, algoritmo, prova di possesso, finestra di autorizzazione EVM. Per una transazione: se ha esattamente un livello ibrido e se si verifica |
| `get_validators` | validatori per stake (predefinito bonded, al massimo 50, limite fino a 200): stato, flag jailed, stake, quota di potere di voto, commissione |
| `get_staking_tiers` | il modulo dei livelli di staking: termini di blocco e bonus, penalità di sblocco anticipato, il pool dei bonus e, facoltativamente, i blocchi di un singolo titolare. Chain v3.2.4 e successive |
| `search` | riconosce da una sola stringa un'altezza di blocco, un hash di transazione, un indirizzo o un validatore, lo legge e indica lo strumento che restituisce gli stessi dati |
| `read_contract` | solo un `eth_call` EVM, con codifica ABI opzionale di una firma di funzione e decodifica del risultato |
| `estimate_fee` | gas simulato, limite di gas suggerito e commissione (limite di gas per il prezzo minimo del gas), incluso il livello ML-DSA-87 |
| `simulate_tx` | gas usato, limite di gas suggerito, variazione di saldo per indirizzo e un rifiuto decodificato per una transazione codificata |
| `prepare_transfer` | un `MsgSend` di uqor non firmato: SignDoc, riepilogo leggibile, controlli e avvisi |
| `get_token_holders` | sempre `NOT_AVAILABLE_ON_CHAIN`: elencare i titolari richiede un indexer che gli endpoint pubblici non offrono |
| `request_faucet` | sempre `NOT_AVAILABLE_ON_CHAIN`: i QOR di testnet arrivano dal [Faucet](/dashboard/faucet) della dashboard |

Gli errori sono risultati dello strumento con `isError: true` e un corpo JSON `{"error": {"code", "message", "details?"}}`. I codici sono `NOT_FOUND`, `INVALID_INPUT`, `UPSTREAM_UNAVAILABLE`, `NOT_AVAILABLE_ON_CHAIN`, `RATE_LIMITED`, `UNAUTHORIZED` e `INTERNAL_ERROR`.

### Cosa è stato eseguito {#what-was-run}

Il 27 ottobre 2026 i pacchetti pubblicati sono stati installati dai registri ed eseguiti sugli endpoint pubblici di testnet e mainnet:

- `qorechain-mcp --version` ha stampato `0.1.0`; su stdio, `initialize` ha restituito il nome del server `qorechain-mcp` e `tools/list` ha restituito i 14 nomi di strumenti qui sopra; `pip install qorechain-mcp==0.1.0` ha installato il pacchetto e il suo `--version` ha stampato `0.1.0`.
- `qorechain-mcp serve --port 18787` ha risposto a `GET /healthz` con `{"status":"ok"}` e a una `tools/call` per `get_chain_info` tramite `POST /mcp`.
- `get_chain_info` ha restituito la chain `qorechain-diana`, EVM chain ID 9800, prezzo minimo del gas 0.1 uqor e sign-bytes `v2` sulla testnet, e la chain `qorechain-vladi`, EVM chain ID 9801 e sign-bytes `v2` sulla mainnet.
- `get_pq_status` sulla transazione testnet indicata sopra ha restituito livello `pqc`, esattamente un livello ibrido e `verified: true` con sign-bytes `v2`.
- `prepare_transfer` per 1,5 QOR su testnet ha restituito un SignDoc con limite di gas 171698 e commissione 17170 uqor (0.01717 QOR), e `simulate_tx` sulla sua transazione non firmata ha restituito `ok: true` con la commissione addebitata al mittente. Nulla è stato firmato né inviato.

## Come accedere {#how-to-access}

- **Locale (opzione principale).** stdio tramite `npx -y @qorechain/mcp` o `uvx qorechain-mcp`. Non richiede account né chiave API. Legge gli endpoint pubblici di QoreChain, quindi serve HTTPS in uscita.
- **Il tuo server HTTP.** `qorechain-mcp serve`, come sopra, con chiavi API e limiti di frequenza che configuri tu.
- **Endpoint ospitato.** `https://mcp.qorechain.io/mcp` serve il trasporto Streamable HTTP. Usa la testnet a meno che una chiamata non indichi `"network": "mainnet"`. Ogni richiesta richiede una chiave API inviata come `Authorization: Bearer <key>`; richiedine una dalla tua dashboard (vedi sotto). Senza chiave l'endpoint risponde HTTP 401 (`UNAUTHORIZED`), che era la risposta del 27 ottobre 2026. Ogni chiave è limitata a 10 richieste al secondo (burst 20) e 100.000 richieste al giorno, con una chiave attiva per account. Per la maggior parte degli usi l'installazione locale non richiede alcuna chiave ed è la scelta più semplice.

  Per ottenere una chiave, accedi su [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers), apri la scheda **AI agents (MCP)** e compila il modulo **API key** (nome o organizzazione, un contatto, uso previsto, volume atteso), quindi premi **Request API key**. Il team QoreChain approva o rifiuta la richiesta; un rifiuto mostra la sua nota e puoi fare una nuova richiesta. Dopo l'approvazione premi **Generate key**: la chiave viene mostrata una sola volta, con un pulsante di copia e uno snippet di configurazione pronto, e diventa attiva entro un minuto o due. QoreChain conserva solo un'impronta (un hash), quindi una chiave persa non può essere mostrata di nuovo; revocala (ha effetto in circa un minuto) e richiedine una nuova. Vedi [Pagina Developers](/dashboard/developers#mcp).

Configurazione del client HTTP per un server che richiede una chiave (i nomi esatti delle chiavi variano a seconda del client):

```json
{
  "mcpServers": {
    "qorechain": {
      "type": "http",
      "url": "https://mcp.qorechain.io/mcp",
      "headers": { "Authorization": "Bearer ${QORECHAIN_MCP_KEY}" }
    }
  }
}
```

Non inserire mai una frase di recupero o una chiave privata nella configurazione di un client: nessuno strumento di QoreChain ne ha bisogno.

Il server legge da questi endpoint pubblici:

| | Testnet | Mainnet |
|---|---|---|
| REST | `https://api-testnet.qore.host` | `https://api.qore.host` |
| RPC di consenso | `https://rpc-testnet.qore.host` | `https://rpc.qore.host` |
| JSON-RPC EVM | `https://evm-testnet.qore.host` | `https://evm.qore.host` |

Costo: il server è gratuito. Le letture non costano nulla. Se trasmetti una transazione costruita da `prepare_transfer`, si applica la commissione di rete (il minimo è 0.1 uqor per gas).

## Dove è pubblicato {#where-published}

| Registro | Pacchetto | Versione | Esecuzione | Note |
|---|---|---|---|---|
| npm | [`@qorechain/mcp`](https://www.npmjs.com/package/@qorechain/mcp) | 0.1.0 | `npx -y @qorechain/mcp` | Bin `qorechain-mcp`. stdio e Streamable HTTP. Node.js 20 o successivo |
| PyPI | [`qorechain-mcp`](https://pypi.org/project/qorechain-mcp/) | 0.1.0 | `pip install qorechain-mcp` o `uvx qorechain-mcp` | Solo stdio. Python 3.10 o successivo |
| npm | [`@qorechain/qore-cli`](https://www.npmjs.com/package/@qorechain/qore-cli) | 0.1.0 | `npm install -g @qorechain/qore-cli` | Il comando `qore`. Vedi [CLI di QoreChain](/developer-tools/qore-cli) |

Sorgenti: [github.com/qorechain/qorechain-mcp](https://github.com/qorechain/qorechain-mcp) (pubblico, Apache-2.0, verificato il 27 ottobre 2026). Il repository contiene il server, la CLI, il pacchetto Python, il riferimento degli strumenti, le note di self-hosting, esempi di configurazione dei client e tre file di skill per agenti. Non ha un'immagine container pubblicata; usa `npx` o `pip`.

## Limiti e problemi noti {#limits}

- **Sola lettura.** Non esiste alcun percorso di firma, nessun archivio di chiavi e nessuna trasmissione. `prepare_transfer` restituisce un documento non firmato. Per completare un trasferimento, firmalo con [QoreSign](/qoresign/overview) o con il wallet QoreX e trasmettilo tu stesso; poi leggi il risultato con `get_transaction`. `read_contract` usa solo `eth_call` e non può modificare lo stato.
- **Viene preparato un solo tipo di transazione.** `prepare_transfer` costruisce un `MsgSend` di uqor sul lane nativo. Non costruisce transazioni EVM, SVM, di staking, di governance o di contratti. `estimate_fee` e `simulate_tx` accettano qualsiasi transazione codificata del lane nativo.
- **Le cifre del gas differiscono per rete.** La simulazione sulla testnet (v3.2.6) include già il costo di verifica ML-DSA-87, quindi il gas è esatto. La simulazione sulla mainnet (v3.2.4) non lo include, quindi il limite di gas suggerito ha un margine (`exact_gas_simulation` è false sulla mainnet).
- **La cronologia della testnet viene eliminata.** Un vecchio blocco della testnet restituisce `NOT_FOUND`, e l'errore indica l'altezza minima disponibile (8,790,799 sulla testnet al momento del controllo; la mainnet era servita dall'altezza 1). `get_pq_status` verifica un livello rispetto alla chiave registrata ora, quindi dopo una rotazione della chiave le transazioni più vecchie non corrispondono più.
- **Precompile EVM post-quantistiche.** `0x...0A01` (verifica ML-DSA-87) e `0x...0A02` (stato della chiave) sono attive solo sulla testnet; sulla mainnet una chiamata a esse restituisce dati vuoti.
- **Limiti.** Ogni richiesta a monte ha un timeout di 10 secondi e un limite di risposta di 4 MiB, senza nuovi tentativi. I blocchi elencano al massimo 100 hash di transazione, le transazioni al massimo 50 messaggi, gli account al massimo 100 saldi. I corpi delle richieste HTTP sono limitati a 512 KiB. Un memo è lungo al massimo 256 caratteri, ed è pubblico e permanente, quindi non inserirvi mai un segreto. Il limite di frequenza di un server in self-hosting vale per istanza ed è tenuto in memoria; dietro un load balancer, ogni istanza conta per conto proprio.
- **Non disponibili:** `get_token_holders` (nessun indexer sugli endpoint pubblici) e `request_faucet` (usa il faucet della dashboard, che richiede l'accesso). L'endpoint ospitato richiede una chiave API, richiesta dalla tua dashboard; l'installazione locale no.
- **La mainnet è esplicita.** Le chiamate vanno alla testnet a meno che non indichino `"network": "mainnet"` o che il server sia stato avviato con `--network mainnet`.
- **Non è pubblicata alcuna immagine container.** Esegui il server con `npx` o `pip`.
- **Versione.** 0.1.0 è la prima release; i nomi degli strumenti e gli schemi possono cambiare nelle versioni successive, e il file generato `spec/tools.json` nel repository è il riferimento per la versione che hai installato.

Pagine correlate: [Panoramica dei pacchetti per sviluppatori](/developer-tools/overview), [CLI di QoreChain](/developer-tools/qore-cli), [QoreSign](/qoresign/overview), [Pagina Sviluppatori nella dashboard](/dashboard/developers#mcp).
