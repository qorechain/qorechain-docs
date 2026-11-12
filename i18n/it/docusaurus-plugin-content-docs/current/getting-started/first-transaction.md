---
slug: /getting-started/first-transaction
title: Prima transazione
sidebar_label: Prima transazione
sidebar_position: 5
---

# Prima transazione

Questa guida illustra l'invio di token QOR, l'interrogazione delle transazioni e l'interazione con QoreChain attraverso le sue interfacce native, EVM e SVM.

:::note
I comandi seguenti utilizzano la testnet **`qorechain-diana`** (EVM chain ID **9800**). La mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) è attiva dal 7 giugno 2026 ed esegue la release v3.2.6 dal 4 novembre 2026 (la testnet esegue la v3.2.8 dal 12 novembre 2026) — sostituisci il chain ID e gli endpoint della mainnet riportati nella pagina **Connessione alla mainnet** quando esegui transazioni sulla mainnet.
:::

## Verifica del saldo

Prima di inviare token, verifica il saldo del tuo account:

```bash
qorechaind query bank balances qor1youraddress... --output json
```

La risposta include tutte le denominazioni di token detenute dall'account. I saldi QOR sono visualizzati in `uqor` (micro-QOR), dove **1 QOR = 1.000.000 uqor**.

## Invio di QOR {#send-qor}

Un account QoreChain invia sulla lane Cosmos con una **firma ibrida**: la firma classica secp256k1 più una firma ML-DSA-87 (Dilithium-5). Un semplice `qorechaind tx bank send ... -y` viene rifiutato, quindi il trasferimento viene costruito senza firma e poi cofirmato. Devi aver registrato una volta una chiave post-quantistica sul tuo account (vedi [Registra la tua chiave post-quantistica](#register-pqc-key) qui sotto) e usare il binario di release ufficiale `qorechaind` da [download.qore.host](https://download.qore.host) (un binario compilato dall'albero dei sorgenti pubblico non può creare né applicare una firma Dilithium).

```bash
# 1. Build the unsigned transaction (the fee is fixed here, because cosign signs the fee in this file)
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 60000uqor \
  --generate-only > tx.json

# 2. Add the ML-DSA-87 signature and broadcast
qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

Questo invia **1 QOR** (1.000.000 uqor) all'indirizzo del destinatario e paga una commissione di 60.000 uqor (0,06 QOR). Il minimo della rete è **0,1 uqor per unità di gas**, quindi la commissione deve essere almeno pari al limite di gas moltiplicato per 0,1: `--gas 400000` richiede `--fees 40000uqor` o più. Gli esempi pagano 0,15 uqor per unità di gas (`--fees 60000uqor`): dalla v3.2.8 il mempool ordina le transazioni per commissione per unità di gas, quindi un trasferimento che paga esattamente il minimo resta in attesa dietro ad altri quando i blocchi sono occupati. Un trasferimento con firma ibrida utilizza tipicamente da 160.000 a 240.000 di gas perché la firma aggiunge circa 4,7 KB alla transazione. `cosign` chiede al nodo quale forma dei byte firmati la rete verifica, quindi lo stesso comando funziona su entrambe le reti.

### Registra la tua chiave post-quantistica {#register-pqc-key}

Una chiave post-quantistica viene **registrata esplicitamente**, una volta per account. La chain non la registra per te alla tua prima transazione. La transazione di registrazione stessa (e la migrazione della chiave) può essere firmata solo con la chiave classica, così che un account appena creato possa avviarsi:

```bash
# generate the ML-DSA-87 key (stored under ~/.qorechaind/pqc/mypqc.dilithium, mode 0600, not encrypted)
qorechaind tx pqc gen-key mypqc

# register the printed public key for your account
qorechaind tx pqc register-key <public_key_hex> hybrid --from mykey \
  --chain-id qorechain-diana --gas 600000 --fees 90000uqor
```

Dalla v3.2.3 la chain accetta inoltre una **prova di possesso** opzionale con la registrazione, e rifiuta chiavi deboli, degeneri o già utilizzate. Per allegarne una, registra con `register-key-v2` e indica il nome della tua chiave locale:

```bash
qorechaind tx pqc register-key-v2 dilithium5 <public_key_hex> hybrid --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --gas 600000 --fees 90000uqor
```

Conserva il backup del file della chiave PQC con la stessa cura della tua frase di recupero; può essere derivato di nuovo dalla frase con `qorechaind tx pqc recover-key`. [QoreX](/qorex/overview) e l'SDK QoreChain eseguono la registrazione della chiave per te. Vedi [Configurazione del wallet](/getting-started/wallet-setup) per il flusso ibrido completo.

:::caution I trasferimenti Cosmos richiedono una firma PQC ibrida
Sulla lane Cosmos l'impostazione di rete è `hybrid_signature_mode = required` (le reti live eseguono la linea v3.2). Una transazione solo classica viene **rifiutata**. Per produrre la firma ibrida al di fuori della CLI, la libreria open-source [**qorechain-pqc**](/developer-guide/post-quantum-signing) (`hybridSignBytes`) e l'SDK QoreChain fanno l'equivalente nel codice.
:::

Dopo che la transazione cofirmata è stata accettata, la CLI restituisce un hash della transazione.

## La prima transazione di un nuovo account {#first-tx-pqc}

Dalla release **v3.2.8** (testnet dal 12 novembre 2026; la mainnet non ha ancora una data) la prima transazione di un account nuovo deve essere la **registrazione della sua chiave post-quantistica**: `MsgRegisterPQCKeyV2`, che porta la prova di possesso, firmata con la sola chiave classica. Qualsiasi altra prima transazione da un account che non ha una chiave registrata viene rifiutata. Questo vale per un account nuovo che è stato finanziato ma non ha mai inviato nulla; un account che ha già una chiave registrata non è interessato.

**Perché è importante.** Ogni transazione successiva sulla lane Cosmos è firmata in modo ibrido (secp256k1 più ML-DSA-87), e la chain può verificare la parte ML-DSA-87 solo rispetto a una chiave che già conosce. La registrazione è l'unica transazione che non può ancora portare quella firma, quindi è l'unica transazione che la chain accetta con la sola firma classica, e deve venire per prima. Se invii un trasferimento, una delega o una chiamata a un contratto prima di registrare, la transazione viene rifiutata e prima devi registrare.

### Registra la chiave

Con la CLI, usa `register-key-v2` esattamente come in [Registra la tua chiave post-quantistica](#register-pqc-key) qui sopra (la chiave deve essere prima generata con `qorechaind tx pqc gen-key mypqc`):

```bash
qorechaind tx pqc register-key-v2 dilithium5 <public_key_hex> hybrid --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --gas 600000 --fees 90000uqor
```

Con l'SDK TypeScript (0.9.0 o successivo), `ensurePqcRegistered` legge prima lo stato della chiave, salta la transazione quando la tua chiave è già registrata, allega la prova di possesso e invia da solo la registrazione in modo classico:

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  ensurePqcRegistered,
} from "@qorechain/sdk";

const client = createClient({
  endpoints: { rest: "https://api-testnet.qore.host", rpc: "https://rpc-testnet.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);
const tx = await client.connectTx(signer, { pqcKeypair });

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  rest: client.network.endpoints.rest,
  fee: { amount: [{ denom: "uqor", amount: "90000" }], gas: "600000" },
});
console.log(res.alreadyRegistered ? "already registered" : res.txHash);
```

Se ti serve solo il messaggio (per esempio per inserirlo nel corpo di una tua transazione), `buildRegisterPqcKeyMsg(sender, { pqcKeypair, ecdsaPubkey, proofOfPossession })` restituisce il `MsgRegisterPQCKeyV2` senza inviarlo.

Gli altri SDK hanno lo stesso helper idempotente, e tutti leggono prima lo stato della chiave via REST e non registrano mai alla cieca:

| Linguaggio | Helper |
| --- | --- |
| Python | `qorsdk.pqc_dx.ensure_pqc_registered(account=..., pqc_keypair=..., chain_id=..., account_number=..., sequence=..., rest_url=..., fee=...)` |
| Go | `pqcdx.New(pqcdx.Signer{...}, pqcdx.Options{}).EnsurePQCRegistered(pqcdx.RegisterOptions{})` |
| Rust | `PqcDx::ensure_pqc_registered().await` |
| Java | `PqcDx.ensurePqcRegistered(signer, broadcaster, qor, new PqcDx.EnsureOptions())` |

Per la configurazione completa del firmatario in ogni linguaggio, vedi il riferimento dell'SDK per quel linguaggio. La registrazione richiede che l'account detenga abbastanza QOR per pagare la commissione, quindi finanzia il nuovo account prima di registrare.

### Stima la commissione includendo la firma

Una firma ibrida aggiunge circa **4,7 KB** alla transazione e la chain addebita una **commissione di verifica** per essa, quindi una commissione stimata da una copia della transazione non firmata o firmata solo in modo classico è troppo bassa. Simula la transazione con la firma ibrida inclusa, oppure lascia fare all'SDK: la commissione predefinita del client TypeScript è `"auto"`, che simula la transazione ibrida e imposta il limite di gas dal risultato.

```ts
import { toBase } from "@qorechain/sdk";

// "auto" is the default: the client simulates the hybrid transaction itself.
await tx.bankSend("qor1recipientaddress...", [{ denom: "uqor", amount: toBase("1.5") }]);
```

| Transazione | Gas tipico | Commissione di esempio a 0,15 uqor per gas |
| --- | --- | --- |
| Trasferimento con firma ibrida | circa 160,000 a 240,000 | da 24,000 a 36,000 uqor |
| Registrazione della chiave | circa 600,000 (limite da impostare) | 90,000 uqor |

**Testato sulla testnet.** Il 12 novembre 2026 (release v3.2.8) un account eth-native nuovo con 500 QOR ha inviato prima la registrazione (SDK 0.13.0, firmata in modo classico, con la prova di possesso): code 0, 299,233 di gas usato con un limite di 600,000 e una commissione di 90,000 uqor. Il suo primo trasferimento con firma ibrida ha poi usato 187,494 di gas con un limite di 400,000 (commissione 60,000 uqor). Rileggendo la transazione da `GET /cosmos/tx/v1beta1/txs/{hash}` si vedevano code 0, l'estensione `/qorechain.pqc.v1.PQCHybridSignature` con una firma ML-DSA-87 di 4,627 byte, e gli eventi `pqc_verify` (`hybrid_mode=required`) e `pqc_hybrid_verify` (`status=verified`). La regola per cui la registrazione deve essere la prima transazione è stata ricevuta dal team della chain; una prima transazione di altro tipo non è stata provata.

Il minimo della rete è 0,1 uqor per unità di gas; dalla v3.2.8 il mempool ordina le transazioni per commissione per unità di gas, quindi pagare un po' sopra il minimo evita che una transazione resti in attesa dietro ad altre quando i blocchi sono occupati.

### Cosa vedi se salti la registrazione

| Cosa vedi | Significato | Cosa fare |
| --- | --- | --- |
| Un rifiuto che dice che l'account non ha una chiave PQC registrata o deve includere una firma ibrida (modulo `pqc`, code 8; l'SDK riporta `pqc_key_required`) | L'account non ha ancora una chiave registrata | Registra la chiave come sopra, poi invia di nuovo |
| Registrazione rifiutata come `already registered` (modulo `pqc`, code 7) | L'account detiene già una chiave | Nulla da fare; leggi la registrazione con `GET /qorechain/pqc/v1/account/{address}` oppure usa `ensurePqcRegistered` (lancia `PqcKeyMismatchError` per una chiave diversa) |

Vedi anche [Quickstart dell'SDK](/sdk/quickstart), [Firma post-quantistica](/developer-guide/post-quantum-signing) e [Configurazione del wallet](/getting-started/wallet-setup).

## Interrogazione di una transazione

Cerca una transazione completata tramite il suo hash:

```bash
qorechaind query tx <txhash>
```

L'output include lo stato della transazione, il gas utilizzato, l'altezza del blocco e tutti gli eventi emessi durante l'esecuzione.

Per l'output in JSON:

```bash
qorechaind query tx <txhash> --output json
```

## Utilizzo di JSON-RPC (EVM)

L'ambiente di esecuzione EVM di QoreChain espone un'interfaccia JSON-RPC Ethereum standard sulla porta `8545`.

:::caution Le transazioni EVM richiedono una finestra di autorizzazione
La firma Ethereum standard (MetaMask, ethers.js, ...) funziona ancora senza modifiche, ma dalla v3.2.0 la lane EVM ammette una transazione solo da un account che ha una **chiave post-quantistica registrata** e una **finestra di autorizzazione EVM aperta**. Aprine una prima (è una transazione della lane Cosmos, firmata con la tua chiave ML-DSA) — vedi [Finestra di autorizzazione EVM](#evm-window) qui sotto. Senza di essa il nodo risponde `no open EVM authorisation window`. La lettura dello stato (`eth_blockNumber`, `eth_getBalance`, `eth_call`, `eth_estimateGas`) non richiede alcuna finestra.
:::

### Ottenere il numero dell'ultimo blocco

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_blockNumber",
    "params": [],
    "id": 1
  }' | jq '.result'
```

### Ottenere il saldo di un account

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getBalance",
    "params": ["0xYourEVMAddress", "latest"],
    "id": 1
  }' | jq '.result'
```

Il saldo viene restituito come valore codificato in esadecimale nella denominazione più piccola.

### Finestra di autorizzazione EVM {#evm-window}

Dalla release della chain **v3.2.0** (altezza mainnet 2,981,742, 25 settembre 2026; altezza testnet 5,920,000) la lane EVM ammette una transazione solo da un account che

1. ha una **chiave post-quantistica registrata** (ML-DSA-87), e
2. ha una **finestra di autorizzazione EVM aperta** con ancora spazio per la transazione.

Tutto il resto della lane EVM è invariato: continui a firmare con MetaMask, ethers.js, Hardhat o Foundry, e `eth_estimateGas` e le altre simulazioni funzionano senza finestra. Le distribuzioni di contratti contano come qualsiasi altra transazione EVM, quindi serve una finestra prima di distribuire.

**Perché una finestra?** Un wallet standard produce una sola firma secp256k1 su una transazione Ethereum e non offre alle applicazioni alcun modo di allegare una seconda firma post-quantistica. L'autorizzazione post-quantistica viaggia quindi *prima* della transazione: apri una finestra limitata con una normale transazione della lane Cosmos, che porta la tua firma ML-DSA, e la lane EVM poi ammette le transazioni coperte da essa. Una chiave classica da sola non può mai aprire una finestra, quindi una chiave classica rubata può agire solo entro ciò che una finestra già aperta consente sulla lane EVM. Funziona come un'approvazione: autorizzi un numero limitato di transazioni e un importo limitato di QOR nativo per un tempo limitato, poi esegui transazioni normalmente. La finestra non limita gli importi dei token né le approvazioni che un contratto detiene già.

**Cosa limita una finestra.** Si applicano tre limiti contemporaneamente; il primo che si esaurisce chiude la finestra.

| Limite | Significato | Intervallo consentito |
| --- | --- | --- |
| `blocks` | Per quanto tempo la finestra resta aperta, contato dal blocco che la apre | 1 – 17,280 |
| `max-txs` | Quante transazioni EVM ammette | 1 – 1,000 |
| `max-value` | Uscita totale che ammette, in uqor: valore trasferito **più** la commissione massima che ogni transazione potrebbe pagare (limite di gas × tetto della commissione), arrotondato per eccesso | maggiore di 0 |

* 17,280 blocchi sono circa 15 ore sulla mainnet (circa 3,1 s per blocco) e circa 6 ore sulla testnet (circa 1,3 s per blocco).
* Una transazione ammessa che poi fallisce consuma comunque il suo slot e il suo budget di valore.
* L'apertura di una nuova finestra **sostituisce** la precedente; il consumo riparte da zero.
* La CLI accetta `max-value` in `uqor` o `qor` (`1000qor` = 1,000,000,000 uqor).
* Il limite di valore conta solo il QOR nativo: un trasferimento di token, un'approvazione o qualsiasi altra chiamata a un contratto porta valore zero. L'ambito (sotto) restringe quali destinatari la finestra ammette; non limita gli importi dei token.

**Passo 1 — registra la tua chiave post-quantistica** (una volta): vedi [Registra la tua chiave post-quantistica](#register-pqc-key) sopra.

**Passo 2 — apri una finestra.** L'apertura di una finestra è una transazione della lane Cosmos, quindi viene prodotta senza firma e poi cofirmata:

```bash
# at most 1000 QOR in total, at most 20 transactions, for 7,200 blocks (about 6.4 hours on mainnet)
qorechaind tx pqc open-evm-window 7200 20 1000qor --from mykey \
  --chain-id qorechain-diana --gas 400000 --fees 60000uqor --generate-only > window.json

qorechaind tx pqc cosign window.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

**Restringere l'ambito (v3.2.3 e successive).** Due flag opzionali limitano ciò che una finestra aperta ammette: `--native-only` ammette solo semplici trasferimenti di QOR nativo (nessun calldata, nessuna creazione di contratti, nessun destinatario che contenga codice), e `--allowed-targets 0xAAA...,0xBBB...` ammette solo transazioni verso quei destinatari (al massimo 16; la creazione di contratti viene in tal caso rifiutata). Ad esempio:

```bash
qorechaind tx pqc open-evm-window 7200 20 1000qor --native-only --from mykey \
  --chain-id qorechain-diana --gas 400000 --fees 60000uqor --generate-only > window.json
```

`--allowed-targets` limita **quali** contratti e token la finestra può toccare, non **quanto**. Un token elencato ammette qualsiasi importo di quel token, incluso `approve`, e un contratto elencato può muovere tutto ciò che il suo codice e le approvazioni esistenti consentono, quindi non elencare contratti forwarder o router generici. Una finestra vincola solo le transazioni sulla lane EVM (firmate in modo classico); i messaggi Cosmos firmati con la firma PQC ibrida, come le chiamate cross-VM e authz, ne restano fuori.

Sulla mainnet, l'apertura di una finestra ha usato circa 180.000 di gas. In [QoreX](/qorex/security-and-recovery#evm-window) lo stesso passaggio è **Impostazioni → Sicurezza → Finestra di accesso EVM** (app) oppure il pulsante **Finestra di accesso EVM** (estensione). L'apertura della finestra fa avanzare il nonce del tuo account, quindi aprila **prima** di preparare la transazione EVM nel tuo wallet.

**Passo 3 — controlla cosa resta:**

```bash
qorechaind query pqc evm-window qor1youraddress...
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_window/qor1youraddress...
```

La risposta REST non fallisce mai per un indirizzo senza finestra; restituisce `found: false`. I campi sono `found`, `live`, `opened_height`, `expiry_height`, `max_txs`, `used_txs`, `max_value`, `used_value`, `remaining_blocks`, `remaining_txs` e `remaining_value` (interi in uqor, restituiti come stringhe). Sulla mainnet usa `https://api.qore.host`.

**Passo 4 — usa normalmente la lane EVM.** Invia da MetaMask o dai tuoi strumenti come al solito. Ogni transazione consuma uno slot di transazione e (valore + commissione massima) dalla finestra.

**Chiudere una finestra in anticipo.** Se sospetti che la tua chiave classica sia compromessa, chiudi la finestra; tutto ciò che ancora ammetteva viene rifiutato dal blocco successivo. La chiusura revoca anche qualsiasi consenso di delega EIP-7702 in sospeso (dalla v3.2.2; una transazione di tipo 4 che modifica il codice di un account viene ammessa solo dopo un consenso post-quantistico `authorize-evm-delegation`):

```bash
qorechaind tx pqc close-evm-window --from mykey --chain-id qorechain-diana \
  --gas 400000 --fees 60000uqor --generate-only > close.json
qorechaind tx pqc cosign close.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

**Errori**

| Cosa vedi | Significato | Cosa fare |
| --- | --- | --- |
| `no open EVM authorisation window; open one with MsgOpenEVMWindow ...` (modulo `pqc`, code 26) | Nessuna finestra per questo account | Passo 2 |
| `... has no registered post-quantum key; the EVM lane requires one` (code 26 sulla lane EVM; code 28 se provi ad aprire una finestra) | Nessuna chiave ML-DSA registrata | Passo 1 |
| `the EVM authorisation window for ... does not admit this transaction (remaining: ...)` (code 27) | Scaduta o esaurita; il messaggio indica quale limite | Apri una nuova finestra |
| `invalid EVM authorisation window` (code 28) | Limiti fuori intervallo (`blocks` 1–17,280, `max-txs` 1–1,000, `max-value` > 0) | Correggi gli argomenti |

Da codice, l'SDK QoreChain e `@qorechain/wallet-adapter` possono comporre i messaggi di apertura e chiusura e leggere lo stato della finestra; vedi la [documentazione dell'SDK](/sdk/overview).

La finestra si applica solo alla lane EVM. Le transazioni della lane Cosmos portano già la firma ibrida in ogni transazione, e se non apri mai una finestra le tue transazioni EVM vengono rifiutate mentre nient'altro cambia.

## Utilizzo di SVM RPC

L'ambiente di esecuzione SVM di QoreChain espone un'interfaccia RPC compatibile con Solana sulla porta `8899`. La lane di transazione SVM è attualmente disabilitata a livello di rete, quindi questi metodi di lettura sono la parte che puoi usare oggi.

### Ottenere lo slot corrente

```bash
curl -s -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getSlot",
    "id": 1
  }' | jq '.result'
```

### Ottenere il saldo di un account

```bash
curl -s -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getBalance",
    "params": ["YourSVMPublicKey"],
    "id": 1
  }' | jq '.result'
```

## Pattern comuni della CLI

Quando si lavora con la CLI `qorechaind`, questi flag vengono utilizzati frequentemente:

| Flag               | Descrizione                   | Esempio                        |
| ------------------ | ----------------------------- | ------------------------------ |
| `--chain-id`       | Specifica la chain di destinazione | `--chain-id qorechain-diana` |
| `--fees`           | Commissione della transazione in uqor (limite di gas × almeno 0,1) | `--fees 40000uqor`        |
| `--from`           | Nome della chiave di firma o indirizzo | `--from mykey`         |
| `--output`         | Formato della risposta        | `--output json`                |
| `--node`           | Endpoint RPC a cui connettersi | `--node tcp://localhost:26657` |
| `--gas`            | Limite di gas per la transazione | `--gas 400000` (o `--gas auto`) |
| `--gas-adjustment` | Moltiplicatore per il gas stimato | `--gas-adjustment 1.5`     |
| `--gas-prices`     | Prezzo del gas al posto di `--fees` | `--gas-prices 0.1uqor`   |
| `--generate-only`  | Stampa la transazione senza firma (necessario prima di `tx pqc cosign`) | `--generate-only` |
| `-y`               | Salta il prompt di conferma   | `-y`                           |

### Esempio: comando completo con tutti i flag comuni

```bash
qorechaind tx bank send mykey qor1recipient... 500000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 60000uqor \
  --node tcp://localhost:26657 \
  --output json \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

## Prossimi passi

Ora che hai inviato la tua prima transazione, esplora di più di ciò che QoreChain offre:

* **Staking e delega** — Metti in staking QOR per contribuire a proteggere la rete e ricevere ricompense di staking
* **Bridging di asset** — Sposta asset tra le chain
* **Sviluppo EVM** — Distribuisci smart contract Solidity su QoreChain
