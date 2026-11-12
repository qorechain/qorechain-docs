---
slug: /developer-guide/svm-lane-v328
title: "Lane SVM: programmi, account e limiti di custodia (v3.2.8)"
sidebar_label: Lane SVM (v3.2.8)
sidebar_position: 10
---

# Lane SVM: programmi, account e limiti di custodia (v3.2.8)

La lane SVM è la parte di QoreChain compatibile con Solana: si distribuiscono programmi compilati, si creano account di dati e si chiamano i programmi con strumenti in stile Solana, e lo stesso saldo di QOR nativo è visibile in lamport. La release **v3.2.8** ha chiuso la lane all'upgrade finché un voto di governance non l'ha riaperta. Sulla testnet quel voto (proposta 37) è passato e la lane è **aperta**; la sua custodia è limitata da tre limiti governati.

Questa pagina spiega come leggere lo stato della lane, come funzionano programmi, account e rent, come un wallet SVM registra una chiave post-quantistica, cosa significano i limiti di custodia e quali esempi si possono eseguire oggi.

:::note Prima la testnet, e la lane è aperta lì dalla proposta 37
La v3.2.8 gira sulla testnet **`qorechain-diana`** dal 12 novembre 2026. La mainnet (`qorechain-vladi`) è ancora alla v3.2.6, non ha una data per la v3.2.8 e **la lane resta spenta sulla mainnet**. L'upgrade ha chiuso la lane sulla testnet (le scritture SVM fallivano, `MsgRegisterSVMPQCKey` veniva rifiutato). **La proposta di governance 37 è passata e l'ha aperta su `qorechain-diana`**: ha impostato `enabled: true`, ha lasciato invariati gli altri parametri e ha tolto la pausa del circuit breaker su `MsgExecuteProgram` e sulle chiamate cross-VM. Al controllo del 12 novembre 2026 dopo il voto, `GET /qorechain/svm/v1/params` mostrava `enabled: true` e l'elenco del circuit breaker conteneva solo `/cosmwasm.wasm.v1.MsgStoreCode`. Il JSON-RPC SVM pubblico resta in sola lettura. Leggi sempre prima lo stato attuale (sezione successiva) e non darlo per scontato.
:::

## Perché è importante {#why}

* Un client che offre azioni SVM mentre la lane è chiusa fa ottenere agli utenti transazioni rifiutate. Leggere prima un parametro lo evita.
* La lane custodisce QOR reali: ogni lamport in un programma, in un indirizzo derivato da programma o in un account di dati è garantito da uqor detenuti dal modulo SVM. I tre limiti di custodia mantengono limitato quel pool, quindi un trasferimento o un deposito può essere rifiutato anche quando il mittente ha i fondi.
* Rent e limiti di dimensione decidono quanto costa mantenere lo stato on-chain, quindi vanno inclusi nel budget di un deployment.

## Leggere lo stato della lane {#lane-state}

Lo stato della lane è il campo `enabled` dei parametri SVM. Leggilo dalla route REST o dalla CLI del nodo. La stessa risposta contiene tutti gli altri limiti di questa pagina, quindi una sola chiamata basta per dimensionare un deployment.

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params
```

Risposta su `qorechain-diana`, 12 novembre 2026, dopo il passaggio della proposta 37 (HTTP 200):

```json
{"params":{"max_program_size":"10485760","max_account_data_size":"10485760","compute_budget_max":"1400000","lamports_per_byte":"3480","rent_exemption_multi":"2.000000000000000000","enabled":true,"svm_slot_offset":"0","default_sig_scheme":0,"max_cpi":4,"max_custody_uqor":"10000000000","max_custody_hard_uqor":"1000000000000","max_account_excess_uqor":"10000000000"}}
```

Su un nodo Linux (non esiste un binario macOS pacchettizzato), la stessa lettura è:

```bash
qorechaind query svm params --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

In TypeScript, con Node 18 o successivo (per questa lettura non serve alcuna chiamata SDK):

```ts
const REST = "https://api-testnet.qore.host";

const { params } = await (await fetch(`${REST}/qorechain/svm/v1/params`)).json();
if (!params.enabled) {
  throw new Error("The SVM lane is closed on this network; do not offer SVM actions");
}
console.log("compute units per instruction:", params.compute_budget_max);
```

Un helper tipizzato per questi parametri (e un builder sicuro per una proposta di parametri) fa parte della bozza dell'SDK per la v3.2.8, che non è ancora pubblicata. Una release SDK successiva lo aggiunge; nel frattempo usa la riga di comando o la route REST.

### Identità del cluster {#cluster-info}

`cluster_info` identifica il cluster per i wallet e dice se l'esecuzione è attiva. Non cambia con lo stato della lane in alcun modo diverso da `execution_enabled`.

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/cluster_info
```

Risposta del 12 novembre 2026, letta dopo il passaggio della proposta 37, con `execution_enabled` `true` (HTTP 200):

```json
{"chain_id":"qorechain-diana","genesis_hash":"6Z9pa53SwiprqiAoNCqqUdj5c3C4P1zRw31gQVnF4Czj","caip2_chain_id":"solana:6Z9pa53SwiprqiAoNCqqUdj5c3C4P1zR","derivation":"base58(SHA-256(\"qorechain/svm/genesis-hash/v1\" || 0x00 || chain_id))","execution_enabled":true}
```

La CLI del nodo ha la stessa query: `qorechaind query svm cluster-info`. Il metodo JSON-RPC `getGenesisHash` su `https://svm-testnet.qore.host` restituisce lo stesso hash. L'hash è derivato dal chain id; non è l'hash di genesi di un vero cluster Solana.

## L'RPC SVM pubblico è in sola lettura {#public-rpc}

Gli endpoint pubblici `https://svm.qore.host` e `https://svm-testnet.qore.host` rispondono alle letture e rifiutano i metodi di scrittura (`sendTransaction` e simili) sui chain id pubblici, che la lane sia aperta o no. Per inviare transazioni SVM si esegue un proprio nodo, che serve per impostazione predefinita il JSON-RPC compatibile con Solana sulla porta 8899 (vedi [Sviluppo SVM](/developer-guide/svm-development#json-rpc-server)), e la lane stessa deve essere aperta sulla rete che quel nodo segue. Le letture funzionano già:

```bash
# Health, version, cluster hash, slot and a rent quote (all HTTP 200 on 12 November 2026)
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth","params":[]}'
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getVersion","params":[]}'
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getGenesisHash","params":[]}'
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getMinimumBalanceForRentExemption","params":[1024]}'
```

`getVersion` ha riportato `solana-core` `1.18.0-qorechain` insieme al chain id, all'id del cluster e all'hash di genesi. Il preventivo di rent per 1.024 byte era `8017920` lamport il 12 novembre 2026. Le route REST `GET /qorechain/svm/v1/account/{address}`, `.../program/{address}` e `.../slot` hanno risposto **HTTP 501** (non implementato) sull'endpoint pubblico; leggi account e programmi tramite i metodi JSON-RPC `getAccountInfo` e `getMultipleAccounts`, oppure tramite la CLI del nodo.

## Distribuire e chiamare programmi {#programs}

Quando la lane è aperta, il flusso è: compilare un programma SBF con la toolchain Solana attuale, distribuirlo, creare gli account di cui ha bisogno, poi chiamarlo. Ogni comando `tx svm` è una transazione della lane Cosmos, quindi richiede un limite di gas esplicito, una commissione di almeno gas per 0,1 uqor e la cofirma post-quantistica ibrida (vedi [Post-Quantum Signing](/developer-guide/post-quantum-signing)).

Questi sono i comandi della CLI del nodo Linux tratti dal riferimento del nodo. **UNTESTED: la lane si è aperta sulla testnet solo dopo la proposta 37 e per questa pagina non sono stati eseguiti deploy di programmi, esecuzioni né creazioni di account.**

```bash
# 1. Build (platform-tools v1.53, --arch v0 or --arch v3)
cargo build-sbf --arch v3

# 2. Deploy; the response carries the program id in base58
qorechaind tx svm deploy-program ./my_program.so --from mykey \
  --gas 2000000 --fees 200000uqor --chain-id qorechain-diana --generate-only > tx.json
qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana

# 3. Create a data account owned by the program (space in bytes, lamports for rent)
qorechaind tx svm create-account <owner-base58> <space> <lamports> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-diana --generate-only > tx.json

# 4. Call the program
qorechaind tx svm execute <program-id-base58> <data-hex> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-diana --generate-only > tx.json
```

Letture su un nodo, disponibili qualunque sia lo stato della lane:

```bash
qorechaind query svm account <base58-address>
qorechaind query svm program <base58-address>
qorechaind query svm params
qorechaind query svm slot
```

### TypeScript con @qorechain/svm 0.13.0 {#typescript}

`@qorechain/svm` è un sottile strato sopra `@solana/web3.js`. Non ha un wrapper per il loader: usa la CLI del nodo qui sopra per distribuire, e il pacchetto per costruire e inviare istruzioni a un programma già esistente. I suoi preset pubblici non impostano di proposito alcun endpoint SVM, quindi forniscigli l'URL del tuo nodo.

```ts
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  createSvmClient,
  createInvokeInstruction,
  withComputeBudget,
  svmKeypairFromSecretKey,
} from "@qorechain/svm";

const client = createSvmClient({ rpcUrl: "http://127.0.0.1:8899" }); // your own node

const payer = svmKeypairFromSecretKey(secretKey64);       // 64-byte Solana-style secret key
const programId = new PublicKey("<program-id-base58>");
const dataAccount = new PublicKey("<data-account-base58>");

const tx = new Transaction().add(
  createInvokeInstruction(
    programId,
    [{ pubkey: dataAccount, isSigner: false, isWritable: true }],
    Uint8Array.from([0]),                                  // your program's instruction data
  ),
);
withComputeBudget(tx, { units: 200_000 });                 // stay under compute_budget_max

const sim = await client.simulateTransaction(tx);          // dry run first
const signature = await client.sendTransaction(tx, [payer]);
```

**UNTESTED:** questo esempio richiede un nodo che gestisci tu (la lane è aperta sulla testnet). Sull'endpoint pubblico l'invio viene rifiutato. Le chiamate in sola lettura (`client.getBalance`, `client.getAccountInfo`, `client.getSignaturesForAddress`) funzionano su `https://svm-testnet.qore.host` perché `createSvmClient({ rpcUrl })` accetta qualsiasi URL.

Python, Go, Rust e Java: gli adapter SVM per quei linguaggi costruiscono gli stessi messaggi; una release SDK successiva aggiunge gli helper v3.2.8. Nel frattempo usa la CLI del nodo qui sopra o il messaggio grezzo. Anche qualsiasi libreria client Solana può parlare con la porta 8899 del tuo nodo perché l'insieme di metodi è compatibile con Solana.

## Account e rent {#rent}

Gli account di dati SVM pagano lo spazio che usano. I numeri provengono dai parametri live qui sopra.

| Voce | Regola | Valore live (testnet) |
| ---- | ------ | --------------------- |
| Rent annuale | dimensione dei dati in byte per `lamports_per_byte` | 3.480 lamport per byte |
| Minimo per l'esenzione dal rent | rent annuale per `rent_exemption_multi` | moltiplicatore 2,0 |
| Finanziato pari o sopra il minimo | mai soggetto a rent | |
| Finanziato sotto il minimo | il rent viene detratto a ogni epoch | |
| Il saldo arriva a zero | l'account viene rimosso | |

Lamport e uqor sono legati da 1 uqor = 1.000 lamport. Chiedi al nodo il minimo esatto invece di calcolarlo: `getMinimumBalanceForRentExemption` ha restituito 8.017.920 lamport per 1.024 byte (il preventivo include l'header dell'account). `create-account` richiede almeno quei lamport, altrimenti l'account non è esente dal rent.

Indirizzi: l'indirizzo SVM di un account sono i suoi 20 byte di account riempiti fino a 32 byte e scritti in base58. Le forme `qor1...`, `0x...` e base58 indicano lo stesso account.

## Chiave post-quantistica per i wallet SVM {#pqc-key}

Un wallet SVM che vuole una chiave post-quantistica on-chain la registra con **`MsgRegisterSVMPQCKey`**. Contiene il mittente, l'indirizzo SVM di 32 byte e la chiave pubblica ML-DSA-87. È un messaggio della lane Cosmos, quindi il mittente lo firma in modo ibrido come qualsiasi altra transazione nativa. Viene rifiutato mentre la lane è chiusa, e **l'account SVM deve già esistere prima che la sua chiave venga registrata** (vedi il rifiuto in [Testato sulla testnet](#tested)).

Non esiste un comando `tx svm` per questo; usa il composer dell'SDK. In TypeScript il composer è `msg.svm.registerSvmPqcKey` in `@qorechain/sdk`. **UNTESTED per un account esistente: l'unico invio riguardava un indirizzo senza account ed è stato rifiutato.**

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  msg,
} from "@qorechain/sdk";
import { fromBech32 } from "@cosmjs/encoding";

const client = createClient({
  network: "testnet",
  endpoints: { rest: "https://api-testnet.qore.host", rpc: "https://rpc-testnet.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);
const tx = await client.connectTx(signer, { pqcKeypair });   // signs hybrid

// 20 account bytes padded with zeros to the 32-byte SVM address
const svmAddr = new Uint8Array(32);
svmAddr.set(fromBech32(account.address).data);

await tx.signAndBroadcast(
  [msg.svm.registerSvmPqcKey({ sender: account.address, svmAddr, pqcPubKey: pqcKeypair.publicKey })],
  "auto",
);
```

Il composer Python è `msg.svm.register_svm_pqc_key(sender=, ...)` e quello Go è `Svm.RegisterPQCKey(sender, svmAddr, pqcPubKey)`.

## Limiti di custodia {#custody}

Ogni lamport detenuto da un programma, da un indirizzo derivato da programma o da un account di dati è garantito da uqor che il modulo SVM tiene in un unico pool, chiamato custodia. Tre parametri governati lo limitano. Tutti e tre sono in uqor; 1 QOR sono 1.000.000 uqor. La governance li modifica con una proposta di parametri, e una proposta deve inviare tutti e dodici i campi perché sostituisce l'insieme nel suo complesso.

| Parametro | Valore live | In parole semplici |
| --------- | ----------- | ------------------ |
| `max_custody_uqor` | 10.000.000.000 (10.000 QOR) | Il tetto al saldo del pool SVM. Un trasferimento che porterebbe il pool sopra di esso viene rifiutato con `svm custody cap exceeded` (codice 23). `0` significa nessun tetto. |
| `max_custody_hard_uqor` | 1.000.000.000.000 (1.000.000 QOR) | Il tetto assoluto al saldo grezzo del pool, comprese riserve di rent, prefinanziamenti e semplici donazioni. Un'operazione che lascerebbe il saldo sopra di esso viene rifiutata. Non deve essere inferiore a `max_custody_uqor` e deve essere maggiore di zero perché la lane possa essere aperta. |
| `max_account_excess_uqor` | 10.000.000.000 (10.000 QOR) | Il massimo che un singolo account di dati può detenere oltre il proprio minimo per l'esenzione dal rent. `0` significa nessun tetto per account. |

Cosa significa per un'applicazione: mantieni modesto il valore che parcheggi negli account SVM e superiore al minimo di rent solo di ciò che ti serve. Un deposito che va bene per il tuo saldo può comunque essere rifiutato se il pool nel suo complesso è vicino al tetto, quindi considera il codice 23 come "riprova più tardi o con meno", non come una transazione non valida. I limiti possono crescere solo con un voto di governance, mai con la transazione di un utente.

## Budget di calcolo e limiti di dimensione {#limits}

| Limite | Parametro | Valore live (testnet) |
| ------ | --------- | --------------------- |
| Unità di calcolo per istruzione | `compute_budget_max` | 1.400.000 |
| Dimensione del programma (ELF) | `max_program_size` | 10.485.760 byte (10 MiB) |
| Dimensione dell'account di dati | `max_account_data_size` | 10.485.760 byte (10 MiB) |
| Chiamate annidate tra programmi | `max_cpi` | 4 |
| Schema di firma predefinito | `default_sig_scheme` | 0 (Ed25519) |
| Offset dello slot | `svm_slot_offset` | 0 (lo slot è l'altezza del blocco più l'offset) |

Ogni frame ha uno stack di 32 KiB e un heap di 256 KiB. I valori qui sopra possono cambiare per governance, quindi leggili live. In `@qorechain/svm` 0.13.0, `withComputeBudget(tx, { units })` richiede un limite di unità di calcolo; tienilo pari o inferiore a `compute_budget_max`.

## Limiti attuali dell'endpoint SVM della testnet {#endpoint-limits}

La lane è aperta, ma il JSON-RPC SVM pubblico non si comporta ancora come un nodo Solana completo. Pianifica tenendo conto di questi limiti:

- **`getLatestBlockhash` restituisce il blockhash come 64 caratteri esadecimali,** non in base58 come fanno i nodi Solana (letto il 12 novembre 2026: `blockhash` `e8d4...d449`, `lastValidBlockHeight` 9944659). Un client che si aspetta base58 deve convertirlo. Il team della chain ha programmato una modifica.
- **`sendTransaction` in formato wire Solana da strumenti Solana standard non è ancora supportato** sull'endpoint pubblico. I programmi vengono distribuiti e chiamati con i messaggi Cosmos `MsgDeployProgram` e `MsgExecuteProgram`, firmati con la firma ibrida come qualsiasi transazione della lane Cosmos (vedi gli helper TypeScript qui sopra). La piena parità con gli strumenti Solana è prevista per una release successiva.
- **Una chiave esterna può autorizzare un'azione SVM tramite un relayer.** L'autorizzazione firma un digest vincolato alla chain (dominio `qorechain-svm-auth-v3`) una volta che la rete abilita la funzionalità di protocollo `svm-relayed-chain-bound`; `@qorechain/wallet-adapter` 0.6.0 lo costruisce con `authSignBytesV3`, e `resolveSvmAuthVersion` legge quale forma richiede la rete.

## Errori e rifiuti {#errors}

| Cosa vedi | Significato | Cosa fare |
| --------- | ----------- | --------- |
| `SVM module is disabled` (codice 11) | La lane è chiusa (mainnet, o testnet prima della proposta 37) | Leggi `enabled`; non riprovare |
| `MsgRegisterSVMPQCKey` rifiutato con `SVM account ... not found` (codespace `svm`, codice 3) | L'account SVM non esiste ancora | Crea prima l'account, poi registra la sua chiave |
| `MsgRegisterSVMPQCKey` rifiutato mentre la lane è chiusa | Lane chiusa | Registra dopo l'apertura della lane |
| Metodo di scrittura rifiutato su `svm.qore.host` o `svm-testnet.qore.host` | Gli endpoint pubblici sono in sola lettura | Usa il tuo nodo |
| `svm custody cap exceeded` (codice 23) | Il pool è al suo tetto | Riprova più tardi o con un importo minore |
| `airdrop rate limit exceeded` (codice 19) | `requestAirdrop` chiamato troppo spesso (solo testnet) | Attendi |
| `blockhash expired` (codice 20) | Il blockhash recente è troppo vecchio | Recuperane uno nuovo e firma di nuovo |
| `svm simulation slots busy, retry later` (codice 24) | Le simulazioni sono limitate; non avviene mai in un blocco | Riprova la simulazione |
| HTTP 501 su `/qorechain/svm/v1/account/...` | Route non implementata sull'endpoint pubblico | Usa `getAccountInfo` |

## Testato sulla testnet {#tested}

Eseguito su `qorechain-diana` il 12 novembre 2026 (release v3.2.8) dopo il passaggio della proposta 37.

| Passo | Risultato |
| ----- | --------- |
| `GET /cosmos/circuit/v1/disable_list` | Solo `/cosmwasm.wasm.v1.MsgStoreCode` |
| `GET /qorechain/svm/v1/params` | `enabled` true; `max_program_size` 10485760, `max_account_data_size` 10485760, `compute_budget_max` 1400000, `lamports_per_byte` 3480, `rent_exemption_multi` 2, `max_cpi` 4, `max_custody_uqor` 10000000000, `max_custody_hard_uqor` 1000000000000, `max_account_excess_uqor` 10000000000 |
| `MsgRegisterSVMPQCKey` per un indirizzo SVM che non esiste ancora | Rifiutato: codespace `svm` codice 3, `SVM account ... not found: SVM account not found`. L'account deve esistere prima che la sua chiave post-quantistica venga registrata |

Non eseguiti (UNTESTED): deploy di programmi, esecuzione di programmi e creazione di account SVM.

## Mainnet {#mainnet}

La mainnet per ora resta alla v3.2.6, con la lane SVM spenta, e attivarla sulla mainnet richiede una release successiva e un voto di governance. Pianifica solo rispetto alla testnet.

## Vedi anche {#see-also}

* [Sviluppo SVM](/developer-guide/svm-development): panoramica della lane, server JSON-RPC e QOR nativo come lamport.
* [JSON-RPC compatibile con Solana](/api-reference/json-rpc-solana-compatible): l'elenco dei metodi.
* [Post-Quantum Signing](/developer-guide/post-quantum-signing): la firma ibrida di cui ha bisogno ogni transazione della lane nativa.
* [Cross-VM Interoperability](/developer-guide/cross-vm-interoperability): chiamate tra SVM, EVM e QoreChain Native.
* [Operatori di nodo: checklist v3.2.8](/developer-guide/node-operators-v328): aggiornare un nodo.
