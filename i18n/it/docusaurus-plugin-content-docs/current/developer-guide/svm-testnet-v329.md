---
slug: /developer-guide/svm-testnet-v329
title: "SVM sulla testnet: distribuire programmi e inviare transazioni Solana (v3.2.9)"
sidebar_label: SVM Testnet (v3.2.9)
sidebar_position: 11
---

# SVM sulla testnet: distribuire programmi e inviare transazioni Solana (v3.2.9)

La release **v3.2.9** permette alla riga di comando standard di Solana di parlare con QoreChain. Puoi eseguire `solana transfer`, `solana program deploy`, `anchor deploy` e uno script web3.js sulla testnet, e la chain verifica da sola ogni firma Solana. Una chiave Solana non può toccare da sola il tuo account QoreChain: prima apri una piccola **finestra di autorizzazione** limitata, con una transazione firmata dalla tua **chiave post-quantistica**, e la finestra viene accettata solo se la chiave Solana dimostra, con la propria firma, che la possiedi. Quando la finestra termina, la chiave torna a essere un normale account Solana.

Questa pagina accompagna uno sviluppatore da una macchina vuota a un programma distribuito e chiamato sulla testnet: cosa c'è di nuovo, gli strumenti, come costruire a mano la prova della chiave, come aprire e chiudere la finestra, come finanziare una chiave di deploy, come distribuire con `solana` o `anchor`, come chiamare il programma, come leggere il risultato, e una tabella dei testi di errore reali.

:::note Solo testnet, verificato il 22 novembre 2026
Tutto qui gira sulla testnet **`qorechain-diana`**, che esegue la v3.2.9 dal 20 novembre 2026 (proposta di governance 39, altezza 10.424.000). La lane compatibile con Solana (SVM) è aperta lì dalla proposta di governance 37. **Niente di tutto questo funziona sulla mainnet:** la lane SVM è spenta su `qorechain-vladi`, le chiamate cross-VM restano in pausa e il caricamento di contratti CosmWasm resta solo tramite governance. Sviluppa solo sulla testnet. I QOR di test non hanno valore. Usa chiavi usa e getta.

Le chiamate di lettura, il preventivo della commissione, la route del nonce e l'esempio della prova della chiave in questa pagina sono stati eseguiti sulla testnet live il 22 novembre 2026. Il flusso completo (finestra, finanziamento, deploy, chiamata, upgrade, chiusura) è stato eseguito prima della release su una rete di test locale con `solana-cli` 4.0.2 e `anchor-cli` 1.2.2 non modificati. Vedi [Cosa è stato verificato](#tested) per la suddivisione esatta.
:::

:::caution Il gateway pubblico non inoltra ancora le transazioni
Il 22 novembre 2026 `https://svm-testnet.qore.host` ha risposto a ogni `sendTransaction` ben formata con `this node relays no Solana transactions ([svm-rpc] relayer-key is not set)`. Le letture funzionano, i preventivi di commissione funzionano, le scritture sono rifiutate finché gli operatori di quel gateway non impostano un account relayer. I passaggi fino alla finestra inclusa non richiedono alcun gateway. Per i passaggi che inviano, vedi [Inviare senza il gateway pubblico](#relay) e ricontrolla l'endpoint prima di iniziare: esegui il comando del [Passaggio 1](#step-config) e poi un `solana transfer` come nel [Passaggio 6](#step-fund).
:::

## Novità della v3.2.9 per la SVM {#whats-new}

* **Transazioni Solana wire on-chain.** Una transazione firmata da un wallet o da uno strumento Solana viene trasportata, byte per byte, nel messaggio Native `MsgSolanaTransaction`. La chain verifica ogni firma ed25519, il recent blockhash e il fee payer, esegue le istruzioni in ordine come un unico passo atomico e rifiuta una firma già vista. Il messaggio funziona solo come messaggio di primo livello di una propria transazione di trasporto: è rifiutato sotto authz e quando lo invia un contratto.
* **Un gateway che inoltra invece di eseguire.** Il metodo JSON-RPC Solana `sendTransaction` del nodo non esegue più nulla sul nodo. Decodifica la transazione, la simula su una copia scartata dello stato e la passa a un account relayer che firma la transazione di trasporto con entrambe le chiavi e la invia alla mempool. Cambia lo stato solo ciò che passa in un blocco. Il relayer non ottiene alcuna autorità sulla tua transazione, perché le tue firme ed25519 sono verificate on-chain.
* **Una finestra di autorizzazione post-quantistica per le chiavi Solana.** `MsgOpenSVMWindow` indica una chiave ed25519 e la limita per blocchi, numero di transazioni e valore in QOR, con la possibilità di restringerla a programmi elencati. Finché la finestra è aperta, le transazioni firmate da quella chiave agiscono per il tuo account. Aprirla richiede la tua **firma ML-DSA-87**, quindi una chiave Solana trapelata da sola non può mai aprirne una.
* **Una prova della chiave.** Aprire una finestra richiede `svm_key_proof` (campo 7): una firma Ed25519 di 64 byte, fatta dalla chiave Solana stessa, su un breve testo che nomina la chain, il tuo account e la chiave. Una chiave pubblica è pubblica, quindi è la prova a mostrare che chi apre la finestra possiede la chiave.
* **Una prova apre una finestra.** Il testo contiene un contatore (il nonce) che aumenta a ogni finestra aperta per quella chiave, quindi una vecchia prova non può essere riutilizzata.
* **Un loader di programmi.** Il loader upgradeable è disponibile, quindi funzionano `solana program deploy`, `write-buffer`, `extend`, `set-upgrade-authority`, `close` e `anchor deploy`, e i programmi possono essere aggiornati dalla loro authority e chiusi per recuperare la rent.
* **Commissioni che gli strumenti Solana capiscono.** `getFeeForMessage` e `simulateTransaction` riportano la commissione reale, quindi i controlli di commissione predefiniti di `solana` e web3.js sono corretti senza flag aggiuntivi. Quando una transazione costa troppo poco, l'errore riporta il prezzo esatto da impostare.
* **Budget per i grant authz.** `MsgExecuteProgram`, `MsgCreateAccount` e `MsgDeployProgram` inviati a tuo nome da qualcun altro con un grant authz funzionano solo dentro una finestra e il suo budget separato per conto terzi.

### Il percorso della transazione {#path}

```text
solana CLI / web3.js / anchor
        |  sendTransaction (signed wire transaction)
        v
SVM gateway on a node: decode, verify, simulate on a copy, check the price
        |  relayer signs MsgSolanaTransaction with the classical key and ML-DSA-87
        v
mempool, then a block: ante checks every Solana signature, blockhash, fee payer, window
        v
instructions run in order; they all succeed or none does
```

La commissione Solana va al relayer, quindi non è mai a suo carico. Ogni risposta del gateway è definitiva: un blocco viene finalizzato una sola volta, quindi `processed`, `confirmed` e `finalized` restituiscono gli stessi dati.

### La finestra: cosa limita {#window}

| Limite | Cosa significa | Intervallo |
| ----- | ------------- | ----- |
| Blocchi | La finestra scade dopo questo numero di blocchi. Un blocco dura circa 1,4 secondi sulla testnet (verificato il 22 novembre 2026), quindi 3.600 blocchi sono circa 85 minuti | da 1 a 17.280 |
| Transazioni | Ogni transazione Solana ammessa ne conta una, anche se poi fallisce | da 1 a 1.000 |
| Valore | Conta ogni diminuzione del QOR nativo dell'account causata da transazioni ammesse, commissioni comprese. Una transazione che supererebbe il valore è rifiutata e annullata. Il valore si indica in uqor o in QOR, per esempio `25qor` | maggiore di 0 |
| Programmi (facoltativo) | Ogni istruzione di una transazione ammessa deve chiamare uno dei programmi elencati | fino a 16 |

Regole che discendono dal progetto:

* La finestra si apre e si chiude solo con **la tua firma post-quantistica**, come messaggio di primo livello. È rifiutata sotto authz, group o un contratto.
* Serve una **chiave post-quantistica registrata** prima di poter aprire una finestra.
* **Una chiave Solana autorizza un solo account alla volta.** Aprire di nuovo una finestra sostituisce la vecchia e libera la sua chiave.
* **Cambiare o migrare la tua chiave post-quantistica chiude la finestra.**
* Oltre al saldo nativo, il limite di valore conta anche il QOR che la tua firma controlla altrove: account derivati dal tuo con un seed, token account che puoi chiudere, lookup table e account del loader di cui sei authority. Se spesi o ceduti a qualcun altro, contano. Una chiave di finestra non può mai portare l'indirizzo del tuo account fuori dallo stato del wallet.
* Leggere `getBalance` o `getAccountInfo` per la chiave di finestra mostra il tuo saldo nativo finché la finestra è aperta.

### Limiti noti della finestra {#window-limits}

Leggili prima di aprire una finestra per un wallet che detiene token.

* **Gli importi dei token non contano nel limite di valore.** Il limite conta solo QOR nativo. Con l'ambito predefinito (nessun elenco di programmi), la chiave Solana può trasferire e bruciare i token SPL dell'account, e fare mint con una mint authority che l'account detiene, pagando solo la commissione di transazione.
* **L'ambito predefinito rifiuta i grant duraturi.** Una chiave che agisce con una finestra di ambito predefinito non può approvare un delegate, cambiare il proprietario o la close authority di un token account, né cambiare la mint o la freeze authority. Questo vale anche per un token account o una mint creati nella stessa transazione. Servono la tua firma post-quantistica, oppure una finestra il cui elenco di programmi nomini il token program.
* **Il pagamento di un co-firmatario conta contro la finestra.** Se un'altra chiave firma la stessa transazione Solana e vi paga qualcosa, quel pagamento conta anch'esso contro il tuo limite di valore. Lascia che uno sponsor paghi in una transazione separata, oppure apri una finestra il cui limite di valore copra tutto ciò che la transazione sposta.
* **I grant fatti con un ambito token esplicito sopravvivono alla finestra.** Se l'elenco dei programmi nomina il token program, i delegate e i cambi di authority fatti tramite la finestra restano in vigore dopo che la finestra si chiude, scade o la tua chiave post-quantistica viene ruotata. Revocali con la tua firma.
* **Per escludere del tutto le azioni sui token,** apri la finestra con un elenco di programmi che non nomini il token program.

### Commissioni {#fees}

| Voce | Valore (testnet, 22 novembre 2026) |
| ---- | --------------------------------- |
| Commissione base per firma | 0,045 QOR (45.000 uqor, 45.000.000 lamport). È il prezzo di 450.000 gas al prezzo minimo del gas della chain di 0,1 uqor per gas, e lo riporta `getFeeForMessage` |
| Unità a schermo | `solana` etichetta gli importi **SOL**. Su QoreChain 1 "SOL" è 1 QOR, perché 1 uqor vale 1.000 lamport e 1 QOR vale 1.000.000 uqor. Leggi "0.045 SOL" come 0,045 QOR |
| Commissione di priorità | Solo quando la transazione richiede più gas di quanto paghi la commissione base. È il prezzo ComputeBudget per il limite di unità |
| Un deploy | Una commissione base per ogni transazione di scrittura, più la rent che torna indietro quando chiudi il programma |

Ciò che paghi è limitato da ciò che hai firmato: paghi il costo della transazione di trasporto, almeno la commissione base e al massimo la commissione promessa dalla tua firma. Un relayer non può farti pagare di più.

Quando una transazione paga meno di quanto costa il suo trasporto, il gateway la rifiuta con codice `-32002` e indica la correzione esatta. Gli stessi numeri sono nel `data` dell'errore:

```json
{
  "code": -32002,
  "message": "Transaction simulation failed: insufficient priority fee: the transaction pays 45000000 lamports, its carrier costs ... uqor ... set ComputeBudget SetComputeUnitPrice to <price> micro-lamports per compute unit, which covers it for a compute unit limit of <limit> or more ...",
  "data": {
    "computeUnitPrice": 0,
    "computeUnitLimit": 0,
    "transactionComputeUnitLimit": 0,
    "carrierFeeLamports": 0,
    "feeLamports": 0
  }
}
```

Gli zeri stanno per i numeri della tua transazione. Imposta `SetComputeUnitPrice` a `data.computeUnitPrice` e un limite di unità di almeno `data.computeUnitLimit`; un micro-lamport in meno viene rifiutato di nuovo. Con `solana program deploy` usa `--with-compute-unit-price <data.computeUnitPrice>`. Nelle esecuzioni pre-release ogni passaggio di un normale deploy, upgrade, extend, close e cambio di authority rientrava nella commissione base, quindi incontri questo errore soprattutto con un `--max-len` insolitamente grande.

### Budget per conto terzi {#on-behalf}

Un grantee authz che invia `MsgExecuteProgram`, `MsgCreateAccount` o `MsgDeployProgram` a tuo nome agisce solo dentro la tua finestra e il suo **budget separato per conto terzi**: `on_behalf_max_txs` e `on_behalf_max_value`. I limiti propri della chiave e il budget per conto terzi non possono esaurirsi a vicenda. Senza budget per conto terzi (il valore predefinito) tali grant sono rifiutati e nulla si muove. Un `MsgExecuteProgram` avvolto in un'esecuzione authz con l'account stesso come grantee conta anch'esso come inviato per conto tuo, quindi invia i tuoi messaggi SVM come messaggi di primo livello.

Ogni execute o deploy annidato fa anche pagare al tuo account la commissione fissa SVM, `max(1, compute_budget_max / 1000)` uqor, cioè 1.400 uqor al valore live del parametro di 1.400.000. Quella commissione conta contro il limite di valore per conto terzi. Imposta `--on-behalf-max-value` ad almeno `on_behalf_max_txs` volte la commissione fissa, più il valore che il grantee deve spostare. Un valore pari a 0 rifiuta ogni esecuzione per conto terzi.

### Il loader {#loader}

| Esegui | Cosa fa on-chain |
| ------- | --------------------- |
| `solana program deploy x.so` | Scrive il programma in un buffer con molte piccole transazioni, poi lo distribuisce. L'id del programma è quello di `--program-id`, oppure uno nuovo |
| `solana program deploy --program-id <id> x.so` per un programma esistente | Lo aggiorna. Solo l'upgrade authority può farlo |
| `solana program write-buffer` / `show --buffers` / `close <buffer>` | Scrive, elenca e chiude un buffer senza distribuire |
| `solana program extend <id> <bytes>` | Ingrandisce l'area dati del programma |
| `solana program set-upgrade-authority <id> --new-upgrade-authority <key>` | Affida gli upgrade a un'altra chiave. `--final` rende il programma permanente |
| `solana program close <id>` | Chiude il programma e restituisce la rent |
| `anchor deploy` | Fa lo stesso con il programma compilato da Anchor |

Un programma può arrivare a 10 MiB (il `max_program_size` live). I programmi si chiamano a vicenda fino a 4 livelli di profondità (`max_cpi`). Il compute budget predefinito arriva a 1.400.000 unità per istruzione.

## Parole usate in questa guida {#words}

| Parola | Significato semplice |
| ---- | ------------- |
| SVM | La macchina virtuale compatibile con Solana in QoreChain. Esegue gli stessi programmi compilati (SBF) di Solana |
| Lamport | La più piccola unità negli strumenti Solana. 1 uqor vale 1.000 lamport, e 1 QOR vale 1.000.000.000 lamport |
| Finestra | Un permesso breve e limitato per una chiave Solana di agire per il tuo account. Aprirla richiede una transazione firmata con la tua chiave post-quantistica |
| Prova della chiave | La firma della chiave Solana stessa su un breve testo. Dimostra che possiedi la chiave che indichi |
| Nonce | Un contatore per chiave Solana, aumentato a ogni finestra aperta con una prova. La prova successiva deve firmare il valore attuale |
| Carrier (trasporto) | La transazione Native che porta una transazione Solana attraverso un blocco |
| Relayer | L'account che firma e invia il carrier. La commissione Solana lo rimborsa |
| Blockhash | L'hash di blocco recente su cui è costruita una transazione Solana. È valido per 150 slot, circa 3,5 minuti qui |

## Prima di iniziare {#prerequisites}

Serve un terminale su macOS o Linux, circa 10 QOR di test e questi strumenti (le versioni nella colonna di destra sono quelle usate per questa pagina):

| Strumento | A cosa serve | Versione usata |
| ---- | -------- | ------------ |
| Riga di comando Solana (Agave) | `solana`, `solana-keygen` | `solana-cli` 4.0.2 |
| Rust e `cargo build-sbf` | Compilare un programma | `cargo-build-sbf` 4.0.0, platform tools v1.53, `rustc` 1.89 |
| Anchor (facoltativo) | `anchor build`, `anchor deploy` | `anchor-cli` 1.2.2 |
| Node.js 18 o successivo | Lo script della prova della chiave e lo script di chiamata | qualsiasi LTS attuale |
| `@solana/web3.js` 1.x | Chiamare il programma | 1.99 |
| `qorechaind` v3.2.9 | Registrare la chiave post-quantistica, aprire e chiudere la finestra | il binario della release, vedi sotto |

Controlla cosa hai:

```bash
solana --version
cargo build-sbf --version
anchor --version
node -v
```

**Su `qorechaind`.** Aprire una finestra è un messaggio Native che richiede la tua firma ML-DSA-87, e il comando `tx pqc open-svm-window` fa parte della v3.2.9. Il 22 novembre 2026 il manifest della release testnet (`https://download.qore.host/testnet/latest.json`) elencava ancora la versione 3.2.8, quindi il bundle v3.2.9 è quello indicato nel testo della proposta di governance 39 (`GET https://api-testnet.qore.host/cosmos/gov/v1/proposals/39`). Il binario della release è compilato per Linux; non esiste un binario macOS pacchettizzato. Un helper SDK per la finestra non è ancora pubblicato. Tutto il resto di questa guida non richiede un nodo.

Serve anche un account QoreChain con QOR di test (prendili dal [faucet](/dashboard/faucet)) e una chiave post-quantistica registrata. Se non l'hai ancora fatto, segui prima [Registrare la chiave](/developer-guide/post-quantum-signing#pqc-key-registration). I comandi qui sotto chiamano la chiave dell'account `mykey` e la sua chiave post-quantistica `mykey-mldsa`.

:::caution Solo chiavi testnet usa e getta
Le due coppie di chiavi Solana create qui sotto sono file con chiavi segrete al loro interno. Non usare mai una coppia di chiavi che detiene fondi reali su un'altra rete, e non incollare mai una chiave segreta in un comando, in una chat o in un repository.
:::

## Passo dopo passo {#steps}

Crea una cartella di lavoro e una configurazione Solana separata, in modo che le tue normali impostazioni di `solana` non vengano toccate:

```bash
mkdir -p ~/qore-svm && cd ~/qore-svm
alias qsol='solana -C ~/qore-svm/solana-config.yml'
```

L'alias esegue `solana` con un proprio file di configurazione. Continua a usare lo stesso terminale, oppure ripeti l'alias in uno nuovo.

### Passaggio 1: Punta gli strumenti Solana alla testnet {#step-config}

```bash
qsol config set --url https://svm-testnet.qore.host
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getVersion","params":[]}'
qsol epoch-info
```

La prima riga salva l'indirizzo RPC in `solana-config.yml`. La seconda chiede al nodo la sua versione. Dovresti vedere `solana-core` `1.18.0-qorechain`, l'id della chain `qorechain-diana` e il genesis hash `6Z9pa53SwiprqiAoNCqqUdj5c3C4P1zRw31gQVnF4Czj` (HTTP 200). La terza stampa lo slot corrente, che coincide con l'altezza del blocco (circa 10,57 milioni il 22 novembre 2026).

I parametri della lane decidono cosa ci sta. Leggili una volta:

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params
```

Dovresti vedere `"enabled":true` e i limiti della testnet live: `max_program_size` 10.485.760, `compute_budget_max` 1.400.000, `lamports_per_byte` 3.480, `max_cpi` 4. Se `enabled` è `false`, la lane è chiusa e niente di ciò che segue può funzionare.

L'endpoint pubblico non serve un websocket (un upgrade websocket ha risposto HTTP 405 il 22 novembre 2026), quindi passa `--use-rpc` ai comandi che confermano una transazione (`solana program deploy`, `write-buffer`) e lascia che lo strumento faccia polling via HTTP semplice. Anchor lo accetta dopo un doppio trattino.

### Passaggio 2: Crea due coppie di chiavi Solana {#step-keys}

```bash
solana-keygen new --no-bip39-passphrase --outfile window.json
solana-keygen new --no-bip39-passphrase --outfile deployer.json
solana-keygen pubkey window.json
solana-keygen pubkey deployer.json
```

I primi due comandi scrivono ciascuno un file di coppia di chiavi (un array JSON di 64 numeri: il seed segreto di 32 byte, poi la chiave pubblica). Gli ultimi due stampano le chiavi pubbliche come testo base58. Dovresti vedere due indirizzi diversi di 32-44 caratteri. Chiamali `WINDOW_PUBKEY` e `DEPLOYER_PUBKEY`.

Perché due chiavi. La **chiave di finestra** agirà per il tuo account Native per breve tempo. Non detiene nulla di suo; spende il tuo QOR dentro la finestra. La **chiave di deploy** è una normale chiave Solana. La finanzi dalla finestra e da quel momento distribuisce, aggiorna e possiede il programma senza alcuna finestra. Non usare la chiave di finestra come upgrade authority: il programma registra il tuo account Native come authority, e `solana` rifiuta un upgrade firmato da una chiave che non è l'authority registrata.

Imposta la chiave di deploy come firmatario predefinito della tua configurazione Solana:

```bash
qsol config set --keypair ~/qore-svm/deployer.json
```

### Passaggio 3: Registra la tua chiave post-quantistica {#step-pqc}

Salta questo passaggio se `qorechaind query pqc account <your qor address>` mostra già una chiave. Altrimenti, su una macchina con il `qorechaind` della release:

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana

qorechaind tx pqc gen-key mykey-mldsa
qorechaind tx pqc register-key-v2 dilithium5 <printed-pubkey-hex> hybrid --pqc-key mykey-mldsa \
  --from mykey --chain-id $QCHAIN --node $QNODE --gas 600000 --fees 60000uqor -y
qorechaind query pqc account <your qor address> --node $QNODE
```

`gen-key` crea la chiave ML-DSA-87 e ne stampa la chiave pubblica in esadecimale. `register-key-v2` la associa al tuo account, con una prova di possesso. La query dovrebbe mostrare la chiave registrata. È l'unica transazione che un nuovo account può firmare con la sola chiave classica. La spiegazione completa, incluso come fare il backup della chiave, è in [Post-Quantum Signing](/developer-guide/post-quantum-signing#pqc-key-registration).

### Passaggio 4: Costruisci la prova della chiave {#step-proof}

La prova è una firma Ed25519 della chiave di finestra su questo testo esatto, codificato in UTF-8 senza spazi e senza newline finale:

```text
qorechain-svm-window-key-v1|<chain-id>|<your qor address>|<WINDOW_PUBKEY>
```

Per una chiave che ha già aperto una o più finestre, il nonce `N` segue dopo un altro `|`:

```text
qorechain-svm-window-key-v1|<chain-id>|<your qor address>|<WINDOW_PUBKEY>|<N>
```

`N` è il numero di finestre già aperte con una prova per quella chiave, scritto in decimale senza segno e senza zeri iniziali. Per una chiave nuova `N` è 0 e non c'è alcun suffisso. La firma è Ed25519 semplice (RFC 8032): nessun prehash, nessun contesto e nessun header di messaggio off-chain di Solana, quindi un wallet deve firmare i byte UTF-8 grezzi.

Non costruire il testo a mano. Chiedilo alla chain:

```bash
curl -s "https://api-testnet.qore.host/qorechain/pqc/v1/svm_window_key_proof/<WINDOW_PUBKEY>?sender=<your qor address>"
```

La risposta contiene il nonce e il testo esatto:

```json
{"svm_pubkey":"9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj","nonce":"0","key_proof_required":true,"sign_bytes":"qorechain-svm-window-key-v1|qorechain-diana|qor1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg34kqp8d|9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj","chain_id":"qorechain-diana"}
```

Questa è la risposta live del 22 novembre 2026 per un indirizzo di esempio. Firma `sign_bytes` con la chiave di finestra. Lo script qui sotto fa entrambi i passaggi, usando solo Node.js (salvalo come `keyproof.mjs`):

```js
// node keyproof.mjs <solana-keypair.json> <your qor address>
import { readFileSync } from "node:fs";
import { createPrivateKey, sign } from "node:crypto";

const REST = "https://api-testnet.qore.host";
const [keypairPath, sender] = process.argv.slice(2);

// A solana-cli keypair file: JSON array of 64 bytes, the 32-byte seed first, then the public key.
const bytes = Uint8Array.from(JSON.parse(readFileSync(keypairPath, "utf8")));
const seed = bytes.slice(0, 32);

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function base58(buf) {
  let n = 0n;
  for (const b of buf) n = n * 256n + BigInt(b);
  let out = "";
  while (n > 0n) { out = ALPHABET[Number(n % 58n)] + out; n /= 58n; }
  for (const b of buf) { if (b === 0) out = "1" + out; else break; }
  return out;
}
const pubkey = base58(bytes.slice(32));

// The chain knows its id and the key's nonce, so it gives the exact text.
const url = `${REST}/qorechain/pqc/v1/svm_window_key_proof/${pubkey}?sender=${sender}`;
const info = await (await fetch(url)).json();
console.log("nonce:", info.nonce);
console.log("text to sign:", info.sign_bytes);

// Pure Ed25519 over the UTF-8 bytes of the text.
const pkcs8 = Buffer.concat([Buffer.from("302e020100300506032b657004220420", "hex"), Buffer.from(seed)]);
const key = createPrivateKey({ key: pkcs8, format: "der", type: "pkcs8" });
const proof = sign(null, Buffer.from(info.sign_bytes, "utf8"), key);
console.log("svm_key_proof (hex):", proof.toString("hex"));
```

```bash
node keyproof.mjs window.json <your qor address>
```

Dovresti vedere `nonce: 0`, il testo e una stringa esadecimale di 128 caratteri. Conserva la stringa esadecimale. È valida per **una finestra** e solo per questo mittente, questa chiave e questa chain.

**Controlla il tuo codice con un esempio pubblicato.** Chain id `qorechain-diana`, mittente `qor1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg34kqp8d` (20 byte di `0x11`), nonce 0:

| Campo | Valore |
| ----- | ----- |
| Chiave pubblica (base58) | `9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj` |
| Chiave pubblica (hex) | `79b5562e8fe654f94078b112e8a98ba7901f853ae695bed7e0e3910bad049664` |
| Messaggio (131 byte) | `qorechain-svm-window-key-v1\|qorechain-diana\|qor1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg34kqp8d\|9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj` |
| Firma (hex) | `786b449dcd4b85c2225819c9ac993fbe97a2cfdce7f9ffba07e6895fad0b9b8d3a0634aae5b21d28d366590b3858c7085c8c856a90770fd919ee1bff728b0801` |

Con nonce 1 il messaggio è di 133 byte e termina con `|1`. Lo script qui sopra ha riprodotto questa firma il 22 novembre 2026 dalla chiave corrispondente. Se il tuo codice produce byte diversi per gli stessi input, le cause abituali sono un newline finale, un prehash, l'header off-chain di Solana o un nonce di valore sbagliato.

Non sei obbligato a eseguire lo script: il comando del passaggio successivo può firmare da solo con il file della coppia di chiavi (`--svm-keypair`). Usa lo script quando la chiave sta altrove, per esempio in un wallet che può firmare un messaggio semplice, e passa il suo risultato con `--svm-key-proof`.

### Passaggio 5: Apri la finestra {#step-open}

Costruisci la transazione, poi aggiungi la firma post-quantistica. Questo esempio apre una finestra di 3.600 blocchi (circa 85 minuti), fino a 10 transazioni e 10 QOR in totale (valore più commissioni), limitata al programma System (trasferimenti) e al loader (deploy):

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana
SYS=11111111111111111111111111111111
LOADER=BPFLoaderUpgradeab1e11111111111111111111111

qorechaind tx pqc open-svm-window <WINDOW_PUBKEY> 3600 10 10qor \
  --allowed-programs $SYS,$LOADER \
  --svm-keypair ~/qore-svm/window.json \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window-open.json

qorechaind tx pqc cosign window-open.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Il primo comando costruisce `window-open.json`. Gli argomenti posizionali sono la chiave pubblica Solana, il numero di blocchi, il numero di transazioni e il valore. Legge il nonce dalla chain e firma la prova della chiave con `window.json`. Il secondo comando aggiunge la tua firma ML-DSA-87 e invia la transazione. Dovresti vedere un hash di transazione e codice 0.

Per usare invece la prova dello script, sostituisci `--svm-keypair ...` con `--svm-key-proof <hex from Step 4>`. Se non dai nessuno dei due flag, il comando rifiuta e stampa il testo esatto da firmare. Se la chiave ha già aperto finestre, il comando legge da solo il nonce; con `--svm-key-proof` puoi fissarlo con `--svm-key-nonce <N>`.

Rileggi la finestra:

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/svm_window/<your qor address>
qorechaind query pqc svm-window <your qor address> --node $QNODE
```

Dovresti vedere `"found":true` e `"live":true`, con `max_txs`, `used_txs`, `max_value`, `used_value`, `remaining_blocks`, `remaining_txs`, `remaining_value`, `allowed_programs` e `key_proven` `true`. Puoi leggerla anche tramite la chiave Solana: `GET /qorechain/pqc/v1/svm_window_by_key/<WINDOW_PUBKEY>`. Ci sono anche i campi `key_proof_required`, `key_usable` e `key_proof_nonce` (il prossimo valore da firmare).

L'elenco dei programmi nomina il programma System e il loader perché è la combinazione testata. In questa guida la chiave di finestra si limita a trasferire, e la chiave di deploy distribuisce. Se mai lasci che la chiave di finestra paghi direttamente un deploy, l'elenco deve nominare entrambi i programmi.

### Passaggio 6: Finanzia la chiave di deploy {#step-fund}

Finché la finestra è aperta, la chiave di finestra spende il tuo QOR. Invia 5 QOR alla chiave di deploy:

```bash
qsol balance <WINDOW_PUBKEY>
qsol transfer <DEPLOYER_PUBKEY> 5 --keypair ~/qore-svm/window.json --allow-unfunded-recipient
qsol balance <DEPLOYER_PUBKEY>
```

La prima riga mostra il tuo saldo Native come lo vede la chiave di finestra (in "SOL", leggi QOR). La seconda invia 5 QOR; il flag `--keypair` rende la chiave di finestra il firmatario per questo solo comando, e `--allow-unfunded-recipient` serve perché la chiave di deploy non detiene ancora nulla. La terza dovrebbe mostrare `5 SOL`, cioè 5 QOR. Il trasferimento costa al tuo account 5,045 QOR in tutto: i 5 QOR più la commissione base di 0,045 QOR, e i contatori della finestra (`used_txs` 1, `used_value` 5.045.000) lo mostrano.

Se viene rifiutato con `this node relays no Solana transactions`, vedi [Inviare senza il gateway pubblico](#relay).

### Passaggio 7: Compila un piccolo programma {#step-build}

```bash
cargo init --lib hello
cd hello
```

Sostituisci `Cargo.toml` con:

```toml
[package]
name = "hello"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]

[dependencies]
solana-program = "2.2"
```

Sostituisci `src/lib.rs` con:

```rust
use solana_program::{account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, msg, pubkey::Pubkey};

entrypoint!(process_instruction);

fn process_instruction(_program_id: &Pubkey, _accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    msg!("hello from QoreChain, {} data bytes", data.len());
    Ok(())
}
```

```bash
cargo build-sbf
ls -l target/deploy
```

Questo compila il programma per SBF. Dovresti vedere `hello.so` (circa 19 KB) e `hello-keypair.json`, la chiave il cui indirizzo diventa l'id del programma. Gli avvisi del compilatore su `unexpected cfg` sono innocui. Il programma scrive una riga di log e non fa altro.

### Passaggio 8: Distribuisci {#step-deploy}

```bash
qsol program deploy target/deploy/hello.so --program-id target/deploy/hello-keypair.json --use-rpc
```

Questo scrive il programma in circa 20 piccole transazioni e poi lo distribuisce. `solana` prima stima il costo e controlla il tuo saldo: per la build di 18.896 byte ha stampato una spesa di 0,133 QOR (rent) e una commissione di 1,035 QOR il 22 novembre 2026, cioè 23 transazioni a 0,045 QOR. Dovresti finire con `Program Id: <address>`. Controllalo:

```bash
qsol program show <program id>
```

Dovresti vedere l'id del programma, il loader (`BPFLoaderUpgradeab1e11111111111111111111111`), un indirizzo ProgramData, l'**authority** (la tua chiave di deploy), lo slot del deploy e la lunghezza dei dati. Se avvii il deploy e si ferma a metà, `solana` stampa una frase di recupero di 12 parole per la chiave temporanea del buffer. Conservala finché il deploy non è finito: con essa riprendi lo stesso buffer passando la coppia di chiavi recuperata al successivo `program deploy` o `write-buffer`, e puoi chiudere il buffer per riavere la sua rent.

Per un programma compilato con Anchor, aggiungi `--skip-feature-verify` a `solana program deploy`, come hanno fatto le esecuzioni pre-release.

#### Con Anchor {#anchor}

```bash
anchor init counter
cd counter
anchor build
anchor deploy --provider.cluster https://svm-testnet.qore.host \
  --provider.wallet ~/qore-svm/deployer.json -- --use-rpc
```

`anchor build` compila il programma del template e `anchor deploy` lo distribuisce all'id del programma in `declare_id!`. Un programma del template pesa circa 130 KB, cioè circa 130 transazioni di scrittura a 0,045 QOR, quindi finanzia prima la chiave di deploy con almeno 10 QOR. Nell'esecuzione pre-release un programma da 128 KB è costato circa 6,8 QOR, per lo più commissioni di scrittura, con la rent che torna indietro alla chiusura. Un secondo `anchor deploy` dopo una modifica del codice aggiorna il programma. Anchor salta il caricamento dell'IDL per un indirizzo locale; il caricamento dell'IDL sulla testnet non è stato testato.

### Passaggio 9: Chiama il programma {#step-call}

`solana` non può chiamare un programma arbitrario, quindi usa un breve script web3.js. In una cartella vuota:

```bash
npm init -y
npm install @solana/web3.js@1
```

Salva come `call.cjs`:

```js
// node call.cjs <payer keypair.json> <program id> [data as text]
const fs = require("fs");
const { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } = require("@solana/web3.js");

const RPC = "https://svm-testnet.qore.host";
const [payerPath, programId, text = "hi"] = process.argv.slice(2);
const payer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(payerPath, "utf8"))));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const conn = new Connection(RPC, "confirmed");
  const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash();
  const tx = new Transaction({ feePayer: payer.publicKey, recentBlockhash: blockhash }).add(
    new TransactionInstruction({ programId: new PublicKey(programId), keys: [], data: Buffer.from(text) }),
  );
  tx.sign(payer);

  const signature = await conn.sendRawTransaction(tx.serialize()); // preflight runs on the gateway
  console.log("signature:", signature);

  // The public endpoint serves no websocket, so poll instead of confirmTransaction.
  for (;;) {
    const { value } = await conn.getSignatureStatuses([signature]);
    if (value[0]) { console.log("status:", value[0].confirmationStatus, "err:", JSON.stringify(value[0].err)); break; }
    if ((await conn.getBlockHeight()) > lastValidBlockHeight) throw new Error("blockhash expired, build and send again");
    await sleep(1500);
  }
  const t = await conn.getTransaction(signature, { maxSupportedTransactionVersion: 0 });
  console.log("fee (lamports):", t.meta.fee);
  console.log((t.meta.logMessages || []).join("\n"));
})().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
```

```bash
node call.cjs ~/qore-svm/deployer.json <program id> "hello"
```

Lo script costruisce un'istruzione per il tuo programma, la firma con la chiave di deploy, la invia, fa polling finché la firma ha uno stato e stampa il log del programma. Il fee payer è la chiave di deploy, quindi non serve alcuna finestra. Dovresti vedere una firma, `status: finalized err: null`, `fee (lamports): 45000000` e log come questi (la forma viene dall'esecuzione pre-release; il messaggio è quello del tuo programma):

```text
Program <program id> invoke [1]
Program log: hello from QoreChain, 5 data bytes
Program <program id> consumed ... compute units
Program <program id> success
```

### Passaggio 10: Leggi il risultato {#step-read}

| Cosa vuoi | Comando o chiamata |
| -------- | --------------- |
| Lo stato di una transazione | `qsol confirm -v <signature>`, oppure `getSignatureStatuses` |
| I suoi log, la commissione e le variazioni di saldo | `getTransaction` con `maxSupportedTransactionVersion: 0` (lo script qui sopra) |
| Il programma e la sua authority | `qsol program show <program id>` |
| Tutti i programmi della chiave di deploy | `qsol program show --programs` |
| Un account di dati | `qsol account <address>`, oppure `getAccountInfo` |
| La tua finestra, per account o per chiave | `GET /qorechain/pqc/v1/svm_window/<address>` e `.../svm_window_by_key/<pubkey>` |

Una transazione che fallisce dentro un blocco (per esempio perché hai saltato il preflight del gateway con `--skip-preflight`) mantiene comunque la sua firma e paga la sua commissione, e i suoi effetti vengono annullati. Nell'esecuzione pre-release un trasferimento oltre il limite di valore della finestra, inviato con `--skip-preflight`, è entrato ed è fallito con `Error processing Instruction 0: generic instruction error`, e il trasferimento è stato annullato. Senza `--skip-preflight` viene rifiutato prima, al gateway, con `-32002 ... SVM authorisation window exhausted`.

### Passaggio 11: Aggiorna, cedi, estendi e chiudi {#step-admin}

Tutti questi usano la chiave di deploy come firmatario e non richiedono alcuna finestra.

| Compito | Comando |
| ---- | ------- |
| Aggiornare dopo una modifica del codice | `qsol program deploy target/deploy/hello.so --program-id target/deploy/hello-keypair.json --use-rpc` |
| Ingrandire l'area dati di N byte | `qsol program extend <program id> N` |
| Affidare gli upgrade a un'altra chiave | `qsol program set-upgrade-authority <program id> --new-upgrade-authority <new.json>` |
| Rendere il programma permanente | `qsol program set-upgrade-authority <program id> --final` |
| Scrivere un buffer senza distribuire, elencare i buffer | `qsol program write-buffer x.so --use-rpc`, poi `qsol program show --buffers` |
| Chiudere un buffer, o chiudere il programma e riprendere la rent | `qsol program close <buffer or program id>` (un programma richiede anche `--bypass-warning`) |

Un upgrade da parte di una chiave che non è l'authority viene rifiutato. Dopo `set-upgrade-authority`, la vecchia authority viene rifiutata e la nuova può aggiornare. Dopo `--final` un upgrade viene rifiutato con un messaggio che dice che il programma non è più aggiornabile. Un programma chiuso non può più essere chiamato e `program show` dice che è stato chiuso.

### Passaggio 12: Chiudi la finestra {#step-close}

Puoi chiudere una finestra quando hai finito, e devi chiuderla subito se pensi che la chiave Solana sia stata esposta. Tutto ciò che la finestra ammetteva ancora viene rifiutato dal blocco successivo:

```bash
qorechaind tx pqc close-svm-window --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window-close.json
qorechaind tx pqc cosign window-close.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Rileggi la finestra: non dovrebbe più essere live, e `qsol balance <WINDOW_PUBKEY>` dovrebbe mostrare di nuovo 0. La chiave di finestra non può più muovere il tuo QOR. La chiave di deploy, il programma e i fondi che hai creato tramite la finestra restano tuoi.

Per aprire una nuova finestra per la stessa chiave, esegui di nuovo il Passaggio 4: il nonce ora è più alto, e una prova fatta per la vecchia finestra viene rifiutata con `expected_nonce`.

## Inviare senza il gateway pubblico {#relay}

Il gateway pubblico `svm-testnet.qore.host` ha rifiutato di inoltrare il 22 novembre 2026 (vedi il riquadro in cima). Ci sono due modi per inviare finché non inoltra.

**Una singola transazione dalla riga di comando.** Qualsiasi account nativo che detiene QOR e ha una chiave post-quantistica registrata può trasportare una transazione Solana che hai firmato. Costruisci e firma prima la transazione Solana, per esempio con web3.js, e stampala in base64 (`tx.serialize().toString("base64")`). Una transazione è valida per circa 3,5 minuti dopo il blockhash che usa. Poi:

```bash
qorechaind tx svm solana-tx <base64 transaction> --from mykey \
  --chain-id $QCHAIN --node $QNODE --gas <GAS> --fees <FEES>uqor --generate-only > relay.json
qorechaind tx pqc cosign relay.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Imposta `--gas` e `--fees` con una prova a secco: esegui prima `tx pqc cosign` con `--dry-run` (stampa una stima del gas e non invia nulla), poi usa la stima più il 30% come `<GAS>` e una commissione di almeno `<GAS>` per 0,1 uqor come `<FEES>`. Un trasferimento semplice richiede circa 300.000 o 400.000 di gas; un deploy o una proposta che contiene codice ne richiede molto di più.

L'account in `--from` è il relayer. Firma il carrier e ne paga il gas, e il fee payer Solana lo rimborsa. Il relayer non ottiene alcuna autorità sulla transazione Solana. La commissione del carrier deve essere coperta da ciò che paga la transazione Solana: 45.000 uqor per una firma. È pratico per un trasferimento o una chiamata, non per un deploy di molte transazioni di scrittura. Questa via non è stata eseguita sulla testnet live per questa pagina.

**Il tuo gateway.** Un nodo che segue la testnet ed esegue il binario v3.2.9 serve il JSON-RPC Solana sulla porta 8899 e inoltra quando la sezione `[svm-rpc]` del suo `app.toml` indica un relayer: `relayer-key` (un account finanziato nel keyring del nodo, oppure più account separati da virgole), `relayer-pqc-key` (le loro chiavi ML-DSA-87 nella cartella `pqc` del nodo) e `relayer-keyring-backend`. Con `relayer-key` vuoto, `sendTransaction` viene rifiutata, come oggi sull'endpoint pubblico. Lascia vuoto `relayer-fee`: il relayer allora fissa il prezzo di ogni carrier in base a ciò che paga la transazione Solana, quindi non è mai in perdita. Copia l'intera cartella `lib/` del bundle della release. Questa configurazione non è stata eseguita per questa pagina; vedi [Esecuzione di un Nodo](/developer-guide/running-a-node) per il nodo stesso.

## Limiti da considerare {#limits}

* **Quota di inoltro.** Una transazione Solana inviata tramite un gateway conta contro il suo fee payer: 600 ogni 30 blocchi al valore predefinito, cioè ben meno di un minuto. Un grande deploy da una sola chiave può superarla (un programma da 1 MB richiede circa 1.100 scritture). Le scritture rifiutate non costano nulla. Scrivi prima il buffer con `qsol program write-buffer`, aspetta un minuto ed eseguilo di nuovo con lo stesso buffer se si ferma, poi distribuisci dal buffer con `--buffer`, oppure paga le scritture del buffer e il deploy da fee payer diversi.
* **Equa ripartizione del gateway.** Un gateway riserva parte della sua capacità ai client che hanno inviato poche transazioni e divide il resto in modo uniforme tra le reti client attive. Se vieni rifiutato con un messaggio di equa ripartizione (codice `-32005`), aspetta un minuto o usa un altro gateway.
* **La transazione deve entrare prima che il suo blockhash scada** (150 slot). `solana` reinvia per te; uno script dovrebbe fare lo stesso.
* **Una transazione è al massimo di 1.232 byte, con al massimo 64 account,** come in Solana. Sono accettati messaggi legacy e versione 0.
* **Programmi e account:** 10 MiB ciascuno; 32 KiB di stack e 256 KiB di heap per frame.
* **I limiti di custodia** di [Lane SVM (v3.2.8)](/developer-guide/svm-lane-v328#custody) restano validi: un deposito può essere rifiutato con `svm custody cap exceeded` (codice 23) quando il pool SVM è al suo limite.
* **Nomi nell'elenco della finestra.** `--allowed-programs` accetta id di programma base58, al massimo 16, ciascuno una sola volta. Un ambito si applica alle istruzioni di primo livello della transazione: un programma elencato che ne chiama altri porta con sé la tua firma, quindi elenca solo programmi di cui ti fidi nel loro insieme.
* **Indirizzi.** Un nuovo messaggio v3.2.9 rifiuta un indirizzo bech32 che non sia nella sua forma canonica minuscola. Invia la forma prodotta da `toBech32`.

## Risoluzione dei problemi {#troubleshooting}

I testi contrassegnati "live" sono stati visti sulla testnet live il 22 novembre 2026. Gli altri sono i messaggi propri della chain e del gateway visti nelle esecuzioni pre-release.

| Cosa vedi | Cosa significa | Cosa fare |
| ------------ | ------------- | ---------- |
| `this node relays no Solana transactions ([svm-rpc] relayer-key is not set)` (codice JSON-RPC `-32603`, live) | Il gateway non ha un account relayer | Usa [il tuo gateway o l'inoltro da riga di comando](#relay), oppure aspetta gli operatori |
| `Error: Account <key> has insufficient funds for spend (X SOL) + fee (Y SOL)` (live, da `solana`) | La chiave non detiene nulla. Leggi SOL come QOR | Apri la finestra e finanzia la chiave, oppure apri la finestra e usa la chiave di finestra come firmatario |
| Simulazione `InsufficientFundsForFee`, log `fee payer ... has no account: insufficient fee` (live) | Stessa causa, vista da una simulazione | Stessa soluzione |
| `invalid solana transaction: no signatures`, `truncated: need 2 bytes at 1` (codice `-32602`, live) | I byte non sono una transazione Solana firmata | Invia la transazione wire firmata completa, in base64 o base58 |
| HTTP 405 su un upgrade websocket (live) | L'endpoint pubblico non serve un websocket | Aggiungi `--use-rpc` a `solana program deploy` e `write-buffer`; negli script fai polling con `getSignatureStatuses` |
| `-32002 ... insufficient priority fee ...` | La transazione paga meno di quanto costa il suo carrier | Imposta prezzo e limite di unità ComputeBudget dal `data` dell'errore; vedi [Commissioni](#fees) |
| `-32002 ... SVM authorisation window exhausted` | La finestra ha esaurito blocchi, transazioni o valore, oppure la transazione supererebbe il valore | Leggi la finestra, aprine una nuova con più valore o più transazioni |
| `no open SVM authorisation window` (codespace `pqc`, codice 341) | La chiave non ha una finestra live | Aprine una (Passaggio 5) |
| Apertura rifiutata con codice 343 e `expected_nonce=<N>` | La prova è stata firmata su un altro nonce, per esempio una vecchia prova | Rileggi la route del nonce (Passaggio 4), firma di nuovo |
| `the key proof does not verify for <key>, sender <qor address>, chain <id>` (CLI) | La firma non corrisponde al testo | Firma esattamente `sign_bytes` dalla route del nonce, con la chiave e il mittente giusti |
| `--svm-keypair holds the key X, not Y` (CLI) | Il file della coppia di chiavi non è la chiave che hai indicato | Usa la coppia di chiavi che corrisponde alla chiave base58 |
| `the window needs the proof that you hold the Solana key` (CLI) | Non hai dato né `--svm-keypair` né `--svm-key-proof` | Dai uno dei due; il messaggio stampa il testo da firmare |
| `blocks must be between 1 and 17280`, `max_txs must be between 1 and 1000`, `max_value must be positive`, `allowed_programs lists N programs, the maximum is 16` | Un limite della finestra è fuori intervallo | Usa valori entro la tabella in [La finestra](#window) |
| `svm_pubkey ... is not a valid ed25519 public key`, oppure `... is a native account address, not an ed25519 key` | La chiave è un indirizzo di programma o uno dei tuoi indirizzi QoreChain | Usa una coppia di chiavi creata con `solana-keygen` |
| `sender sol:<payer> has sent 600 transactions in the last 30 blocks` | La quota di inoltro di un fee payer | Aspetta un minuto, riprendi con lo stesso buffer; vedi [Limiti](#limits) |
| `-32005` con `fair share of the relayer quota` | Il gateway ripartisce la sua capacità | Riprova dopo un minuto |
| `-32020 node is starting, no committed state` | Il nodo non ha ancora uno stato | Riprova tra qualche secondo |
| `node busy: the carrier could not be measured now, retry` | Il gateway non ha potuto calcolare il prezzo del carrier in questo momento | Riprova |
| `Transaction simulation failed: Blockhash not found` | Il blockhash è più vecchio di 150 slot o sconosciuto | Ottieni un blockhash nuovo, firma e invia di nuovo |
| `Transaction simulation failed: This transaction has already been processed` | La stessa transazione firmata è già stata vista | Controlla `getSignatureStatuses`; non inviarla di nuovo |
| Una transazione Solana è rifiutata con `cannot approve a delegate`, `cannot hand over the ownership`, `cannot hand over the close authority` o `cannot change the mint or freeze authority`, con `the grant would outlive the window` | Una finestra di ambito predefinito rifiuta i grant duraturi sui token | Firma questa azione con la tua chiave post-quantistica sulla lane Native, oppure apri una finestra il cui elenco di programmi nomini il token program (vedi [Limiti noti](#window-limits)) |
| `SVM module is disabled` (codice 11) | La lane è chiusa. È lo stato della mainnet | Usa la testnet |
| `svm custody cap exceeded` (codice 23) | Il pool SVM è al suo limite | Riprova più tardi o con un importo minore |
| `solana program deploy` di un programma compilato con Anchor è rifiutato lato client sulle feature del programma | Lo strumento controlla le feature ELF | Aggiungi `--skip-feature-verify` |
| Un upgrade da parte della chiave di finestra è rifiutato da `solana` | L'authority registrata è il tuo account Native, non la chiave | Distribuisci con una chiave di deploy separata come in questa guida |
| Apertura o chiusura della finestra rifiutata sotto authz, group o un contratto | Le finestre si aprono e si chiudono solo con la tua firma | Invia il messaggio come messaggio di primo livello dal tuo account |

## Cosa è stato verificato {#tested}

| Verifica | Dove e quando | Risultato |
| ----- | -------------- | ------ |
| `GET /qorechain/svm/v1/params` e `/cluster_info` | testnet live, 22 novembre 2026 | `enabled` ed `execution_enabled` entrambi `true` |
| `getHealth`, `getVersion`, `getGenesisHash`, `getLatestBlockhash` (base58), `getMinimumBalanceForRentExemption(1024)` | testnet live, 22 novembre 2026 | `ok`; `1.18.0-qorechain`; genesis hash come sopra; blockhash base58 di 44 caratteri; 8.017.920 lamport |
| `getFeeForMessage` e `simulateTransaction` per un trasferimento a una firma | testnet live, 22 novembre 2026 | commissione 45.000.000 lamport (0,045 QOR); un payer senza fondi dà `InsufficientFundsForFee` |
| Route del nonce della prova della chiave e route della finestra | testnet live, 22 novembre 2026 | nonce 0, `sign_bytes` come nel Passaggio 4; `found` `false` per un indirizzo senza finestra |
| Script della prova della chiave del Passaggio 4 contro l'esempio pubblicato | route testnet live, 22 novembre 2026 | firma identica alla tabella |
| Compilazione del programma con `cargo build-sbf` (4.0.0, platform tools v1.53) | macchina locale, 22 novembre 2026 | `hello.so` di 18.896 byte |
| Stima del costo di `solana program deploy` da una chiave senza fondi | testnet live, 22 novembre 2026 | rifiutata lato client con spesa 0,133 QOR e commissione 1,035 QOR |
| `sendTransaction` di un trasferimento ben formato | testnet live, 22 novembre 2026 | rifiutata: `this node relays no Solana transactions` |
| Upgrade websocket sull'endpoint pubblico | testnet live, 22 novembre 2026 | HTTP 405 |
| Apertura della finestra, `solana transfer` dalla chiave di finestra, deploy, chiamata, upgrade, set authority, extend, close, `anchor deploy` e upgrade | rete di test locale prima della release, `solana-cli` 4.0.2, `anchor-cli` 1.2.2, `@solana/web3.js` 1.99 | superati |
| Gli stessi passaggi sulla testnet live | non eseguiti: il gateway pubblico non ha inoltrato nulla il 22 novembre 2026, e nessun QOR di test è stato speso per questa pagina | non eseguiti |

## Mainnet {#mainnet}

La mainnet esegue una release senza nulla di tutto questo: la lane SVM è spenta, i suoi endpoint SVM pubblici sono in sola lettura, le chiamate cross-VM restano in pausa e il caricamento dei contratti resta solo tramite governance. Non aprire finestre, non distribuire e non inviare transazioni Solana sulla mainnet; pianifica solo sulla testnet.

## Vedi anche {#see-also}

* [Lane SVM (v3.2.8)](/developer-guide/svm-lane-v328): lo stato della lane, la rent, i limiti di custodia e la chiave post-quantistica di un wallet SVM.
* [Sviluppo SVM](/developer-guide/svm-development): panoramica della lane e server JSON-RPC.
* [JSON-RPC Compatibile con Solana](/api-reference/json-rpc-solana-compatible): l'elenco dei metodi.
* [Post-Quantum Signing](/developer-guide/post-quantum-signing): registrare e usare la tua chiave ML-DSA-87.
* [Riferimento della finestra di autorizzazione EVM (v3.2.8)](/developer-guide/evm-window-reference): la stessa idea per le chiavi in stile Ethereum.
* [Cross-VM Interoperability](/developer-guide/cross-vm-interoperability): chiamate tra SVM, EVM e QoreChain Native.
* [Cronologia delle Versioni](/appendix/version-history#v329): cosa ha cambiato la v3.2.9.
