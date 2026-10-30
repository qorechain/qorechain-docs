---
slug: /developer-tools/custody-kit
title: QoreChain Custody Kit
sidebar_label: Custody Kit
sidebar_position: 32
---

# Custody kit di QoreChain

Il custody kit di QoreChain è una guida scritta all'integrazione, un insieme di vettori di test e un piccolo codice di riferimento per custodi ed exchange che detengono fondi dei clienti su QoreChain. Spiega che cosa richiede la rete su ogni rail di esecuzione e mostra, in codice leggibile, le parti di un'integrazione in cui è facile sbagliare: controllare un indirizzo, decodificare e verificare una transazione firmata prima che venga trasmessa, e decidere quali trasferimenti in ingresso accreditare.

È pensato per custodi, exchange, processori di pagamento e back end di wallet, e per gli ingegneri e gli auditor che rivedono quelle integrazioni. Versione **0.1.0**, pubblicata il 27 ottobre 2026, Apache-2.0. Funziona con la mainnet (`qorechain-vladi`) e con la testnet (`qorechain-diana`); i controlli live che lo accompagnano vengono eseguiti sulla testnet e sono solo di lettura.

**Leggi prima questo: il kit è codice di esempio, non una libreria.** Cloni il repository e leggi, copi o includi nel tuo progetto (vendor) la cartella del tuo linguaggio. Non esiste alcun pacchetto del kit su npm, PyPI, crates.io o Maven Central, per scelta. L'unica eccezione nella forma è Go: la cartella Go è un modulo Go con una versione taggata, quindi `go get` può scaricarla, ma resta comunque codice di esempio senza alcuna promessa di API stabile (vedi [Che cosa è una libreria e che cosa è codice di esempio](#library-vs-example)). La firma e la verifica crittografica provengono da [QoreSign](/qoresign/overview), che è una libreria pubblicata.

## Innovazioni {#innovations}

- **Un solo comportamento in cinque linguaggi, dimostrato da un solo file.** TypeScript, Python, Go, Rust e Java implementano le stesse quattro funzioni con gli stessi risultati e gli stessi codici di errore. Ogni linguaggio viene eseguito contro il file condiviso di vettori di test `vectors/custody-v1.json`, quindi un team che porta il kit in un altro linguaggio può dimostrare che corrisponde.
- **Codici di errore stabili per gli indirizzi.** `validateAddress` non genera mai eccezioni. In caso di successo restituisce le due grafie dell'indirizzo, altrimenti uno di undici codici stabili (`EMPTY`, `WHITESPACE`, `BAD_HEX`, `BAD_EIP55`, `NO_CHECKSUM`, `MIXED_CASE`, `BAD_BECH32`, `BAD_CHECKSUM`, `WRONG_PREFIX`, `BAD_LENGTH`, `KIND_NOT_ALLOWED`) così un modulo di prelievo può mostrare il motivo esatto.
- **Controllo di entrambe le firme prima della trasmissione.** `verifyTx` controlla la firma secp256k1 sul `SignDoc`, il livello ML-DSA-87 rispetto a una chiave che gli passi, e se la chiave pubblica contenuta nella transazione è quella che ti aspetti. Restituisce `{ valid, classical, signerKey, pq }` e genera un errore solo su input malformato, mai su una firma errata. Un secondo processo può eseguirlo su ogni prelievo firmato prima che venga inviato qualsiasi cosa.
- **Decisioni sui depositi con un motivo.** `extractDeposits` restituisce ogni trasferimento in ingresso di una transazione con un flag `creditable` e un `reason` (`evm_failed`, `fee_refund`, `unsupported_message` oppure `null`). Intercetta il caso che sorprende chi integra l'EVM: un'esecuzione EVM fallita riporta comunque il codice di risultato 0 a livello nativo.
- **Un costruttore di query che corrisponde al nodo.** `buildDepositQuery` produce l'esatto percorso REST con codifica percentuale per i trasferimenti in ingresso verso un indirizzo (limite da 1 a 100, limiti di altezza, ordine crescente), e converte l'input `0x` nella forma `qor1`.
- **Indicazioni scritte per ogni rail.** La guida copre il rail Native, il rail EVM con le sue finestre di autorizzazione, e afferma che il rail SVM non è aperto alle transazioni, quindi nessun flusso di deposito o prelievo va costruito su di esso.

## Casi d'uso {#use-cases}

1. **Scanner dei depositi per un exchange.** Mantieni un cursore di altezza, chiama `buildDepositQuery({ address, minHeight, maxHeight })` sul tuo nodo, poi `extractDeposits(txResponse, address)` per accreditare in `uqor` i `MsgSend`, i `MsgMultiSend` e i trasferimenti EVM riusciti. Le esecuzioni EVM fallite, i rimborsi di gas e gli altri messaggi vengono esclusi o segnalati per revisione.
2. **Pipeline di prelievo con un secondo approvatore.** Dopo che il firmatario produce un prelievo firmato in modo ibrido, un processo indipendente esegue `decodeTx` (destinatario, importo, commissione, memo) e `verifyTx` (entrambe le firme, chiavi attese) prima che la transazione venga trasmessa.
3. **Acquisizione degli indirizzi.** Convalida con `validateAddress` ogni indirizzo di prelievo fornito dall'utente, rifiuta gli indirizzi `qorvaloper` come destinazioni di pagamento e, facoltativamente, richiedi i checksum EIP-55 per l'input esadecimale.
4. **Pianificazione dell'HSM.** Un team di sicurezza usa la guida alla gestione delle chiavi per scegliere tra chiavi ML-DSA-87 generate dall'HSM e derivazione canonica basata su mnemonico, per verificare il supporto PKCS #11 v3.2 alla firma ML-DSA-87 pura con contesto vuoto, e per progettare rotazione e backup.
5. **Rail di pagamento EVM.** Un exchange che paga sul rail EVM registra una sola volta la chiave ML-DSA-87, apre una finestra di autorizzazione con ambito limitato per ogni lotto con una sola transazione ibrida sul rail Native, poi firma normali transazioni EIP-1559 con il suo stack secp256k1 esistente.
6. **Staking per i clienti.** Un custode che offre lo staking segue la guida allo staking (delegare, revocare la delega, ridelegare, ricompense, blocchi dello staking tier) e decodifica ogni messaggio di staking con `decodeTx` prima di firmare.
7. **Porting in un altro linguaggio, o un audit.** Un team che scrive una propria implementazione la esegue contro `vectors/custody-v1.json` per dimostrare che corrisponde ai risultati e ai codici di errore di riferimento.
8. **Prova generale prima della mainnet.** Un team di integrazione segue la prova generale sulla testnet (registrare la chiave, invio ibrido, scansione dei depositi, staking, finestra EVM, rotazione della chiave) e la checklist di integrazione.

## Come funziona {#how-it-works}

### Che cosa contiene il kit {#contents}

| Parte | Che cosa è |
|---|---|
| `docs/` | Dieci pagine di guida: firma per rail, indirizzi e derivazione, depositi, prelievi, staking, errori, gestione delle chiavi, ambiente di test, checklist di integrazione, FAQ. |
| `code/ts`, `code/python`, `code/go`, `code/rust`, `code/java` | Codice di riferimento con le stesse quattro funzioni e una piccola riga di comando di esempio per ogni linguaggio. |
| `vectors/custody-v1.json` | Vettori di test: un indirizzo valido e uno non valido per ogni codice di errore, un `MsgDelegate` firmato in modo ibrido, un `MsgOpenEVMWindow` firmato in modo ibrido da un account eth-native, messaggi di staking e di finestra, transazioni malformate, query di deposito e casi di estrazione dei depositi. I vettori di QoreSign sono riutilizzati per riferimento e controllati tramite SHA-256. |
| Controlli live | Controlli di sola lettura sulla testnet, attivati con `QORE_LIVE_TEST=1`: parametri di staking, una query di deposito per un trasferimento recente e la verifica di una transazione ibrida confermata. |

### Che cosa è una libreria e che cosa è codice di esempio {#library-vs-example}

| Elemento | Tipo | Dove ottenerlo |
|---|---|---|
| QoreSign (firma, verifica ML-DSA-87 e secp256k1, messaggio di registrazione della chiave) | Libreria pubblicata | npm, PyPI, crates.io, Go, Maven Central. Vedi [QoreSign](/qoresign/overview). |
| Il codice del kit in TypeScript, Python, Rust e Java | Codice di esempio, non pubblicato su alcun registro | Clona `qorechain/qorechain-custody-kit` e copia o includi la cartella (vendor). |
| Il codice del kit in Go (pacchetto `custodykit`) | Codice di esempio. Scaricabile come modulo Go a una versione taggata, senza alcuna promessa di API stabile | `go get github.com/qorechain/qorechain-custody-kit/code/go@v0.1.0`, oppure clona e includi (vendor). |
| Le pagine di guida, i vettori e la checklist | Documentazione e dati | Il repository. |

Il kit non implementa alcuno schema di firma. La verifica ML-DSA-87 e secp256k1 proviene da QoreSign. Il codice Python contiene un piccolo Keccak-256 usato per il checksum EIP-55 e nient'altro.

### Rail {#lanes}

| Rail | Che cosa firma un custode | Stato |
|---|---|---|
| Native (Cosmos SDK) | secp256k1 `SIGN_MODE_DIRECT` più un livello ML-DSA-87 (FIPS 204). Un account con una chiave registrata non ha un percorso classico; un account senza chiave può inviare in modo classico solo per registrare la propria chiave (o per fare unjail). | aperto |
| EVM | Normali transazioni Ethereum secp256k1 (EIP-155 ed EIP-1559), ammesse per un mittente con una chiave ML-DSA-87 registrata e una finestra di autorizzazione attiva, aperta da una transazione ibrida sul rail Native: una firma ML-DSA-87 per finestra. | aperto |
| SVM | Non applicabile | non aperto alle transazioni |

### Transazioni ibride sul rail Native {#hybrid}

- Una transazione ibrida è un normale `TxRaw` firmato due volte dallo stesso account. La firma ML-DSA-87 viaggia nel body come extension option `/qorechain.pqc.v1.PQCHybridSignature` (`algorithm_id = 1`, una firma di 4.627 byte, facoltativamente la chiave pubblica di 2.592 byte). La firma secp256k1 è la solita firma `SIGN_MODE_DIRECT` sul body finale, extension inclusa.
- La firma ML-DSA-87 copre sign-bytes che escludono l'extension. Entrambe le reti pubbliche verificano i sign-bytes v2 (una stringa di dominio, il chain id, poi i byte di body e auth info). Sono accettate sia le firme FIPS 204 hedged sia quelle deterministiche. Il formato normativo è la [specifica di firma ibrida di QoreSign](/qoresign/spec/hybrid-signing-v1).
- Ordine delle operazioni: codifica body e auth info (commissione e gas fissati), calcola i sign-bytes v2, firma con ML-DSA-87, aggiungi l'extension, firma il `SignDoc` con secp256k1, trasmetti.
- Registrazione della chiave: `MsgRegisterPQCKeyV2` (`key_type = "hybrid"`, con una prova di possesso facoltativa e consigliata), firmato in modo classico dall'account senza chiave, una volta per ogni indirizzo hot. QoreSign costruisce l'intero messaggio.
- Una transazione ibrida è circa 4,7 KB più grande di una classica e usa più gas, quindi simula sempre.

### Indirizzi {#addresses}

- `qor1...` e `0x...` sono due grafie degli stessi 20 byte. I fondi inviati all'una o all'altra arrivano nello stesso saldo. `qorvaloper1...` è l'indirizzo operatore di un validatore e non è mai un indirizzo di pagamento.
- Esistono due tipi di account: `secp256k1` (coin type 118, percorso `m/44'/118'/0'/0/i`) ed eth-native `eth_secp256k1` (coin type 60, percorso `m/44'/60'/0'/0/i`). Lo stesso mnemonico dà due account diversi. Gli account eth-native permettono a una sola chiave di operare sia sul rail Native sia sul rail EVM.
- La chiave ML-DSA-87 può venire dalla derivazione canonica (quella che i wallet QoreChain e l'SDK registrano, legata all'indirizzo `qor1` e al mnemonico), da una derivazione gerarchica in bozza, o da una chiave casuale generata in un HSM. Qualsiasi chiave valida funziona una volta registrata. Vedi [derivazione delle chiavi](/qoresign/guides/key-derivation).

### Depositi {#deposits}

- QoreChain finalizza un blocco quando viene confermato. Non ci sono riorganizzazioni, quindi una transazione in un blocco confermato è definitiva dopo un blocco. Ulteriori conferme sono una scelta operativa.
- I depositi sul rail Native si trovano con `GET /cosmos/tx/v1beta1/txs?query=transfer.recipient='qor1...' AND tx.height>=H1 AND tx.height<=H2&order_by=ORDER_BY_ASC`. `buildDepositQuery` costruisce esattamente questo percorso.
- Regole di accredito in `extractDeposits`: una transazione con `code != 0` non ha spostato nulla; un `transfer` senza `msg_index` è il pagamento della commissione; gli importi sono filtrati per denom (`uqor` per impostazione predefinita); gli output di `MsgSend` e `MsgMultiSend` sono accreditabili; `MsgEthereumTx` è accreditabile a meno che l'esecuzione EVM non sia fallita o il trasferimento non sia un rimborso di gas dal fee collector; tutto il resto torna con `reason: "unsupported_message"` per la revisione.

### Prelievi e gas {#withdrawals}

- Commissione = ceil(gas limit x gas price) in `uqor`. Il gas price minimo è 0.1 uqor, applicato al gas limit.
- Prendi il gas limit da una simulazione della transazione completamente firmata. Sui nodi che hanno applicato l'upgrade v3.2.5 (entrambe le reti dal 29 ottobre 2026) usa `ceil(gas_used x 1.02) + 2000`, perché la simulazione include la verifica ML-DSA-87. Prima di allora usa `ceil((gas_used + 40000) x 1.4)`. Rileva quale vale con `GET /cosmos/upgrade/v1beta1/applied_plan/v3.2.5`, non in base alla data.
- Dopo aver scelto il gas limit, ricostruisci `AuthInfo` e firma di nuovo: entrambe le firme coprono la commissione.
- Sequenze: usa una coda di firma per ogni indirizzo hot, oppure più indirizzi hot per pagamenti in parallelo.

### Finestre di autorizzazione EVM {#evm-windows}

- Una finestra si apre con `/qorechain.pqc.v1.MsgOpenEVMWindow` (`blocks` da 1 a 17.280, `max_txs` da 1 a 1.000, `max_value` in `uqor` che conta valore più commissione massima, `native_only` facoltativo, `allowed_targets` facoltativo fino a 16 indirizzi) e si chiude con `MsgCloseEVMWindow`. Lo stato è su `GET /qorechain/pqc/v1/evm_window/{address}`.
- Aprire una finestra sostituisce qualsiasi finestra esistente e fa avanzare la sequenza dell'account, che è il suo nonce EVM: apri la finestra, poi leggi il nonce.
- `eth_call` ed `eth_estimateGas` non richiedono alcuna finestra.

## Come si usa {#how-to-use}

### Ottenere il codice {#install}

Il kit è codice di riferimento: clona il repository, o includi (vendor) la cartella del tuo linguaggio, invece di installare un pacchetto.

| Linguaggio | Come ottenerlo | Dipende da | Piattaforma minima |
|---|---|---|---|
| TypeScript | `git clone https://github.com/qorechain/qorechain-custody-kit`, poi `cd code/ts && pnpm install && pnpm build` | `@qorechain/qoresign` 0.1.0 (npm) | Node.js 20 |
| Python | clona, poi `cd code/python && pip install -r requirements-dev.txt`. Per `verify_tx` anche `pip install qorechain-qoresign==0.1.1` | nulla a runtime; `qorechain-qoresign` 0.1.1 (PyPI) per `verify_tx` | Python 3.9 |
| Go | `go get github.com/qorechain/qorechain-custody-kit/code/go@v0.1.0` (pacchetto `custodykit`), oppure clona | `github.com/qorechain/qoresign/go` v0.1.0 | Go 1.25 |
| Rust | clona, poi `cd code/rust && cargo build` (non è su crates.io) | `qorechain-qoresign` 0.1.0 (crates.io) | Rust edizione 2021 |
| Java | clona, poi `cd code/java && mvn test` (non è su Maven Central) | `io.github.qorechain:qoresign:0.1.0` (Maven Central), Gson | Java 17 |

QoreSign è pubblicato per ogni linguaggio usato dal kit, Python incluso. `verify_tx` nel codice Python richiede `qorechain-qoresign` 0.1.1 da PyPI (macOS e Linux). Il codice TypeScript, Go, Rust e Java fissa QoreSign 0.1.0, che è ancora pubblicato accanto alla 0.1.1.

### Quickstart {#quickstart}

Rete di destinazione: testnet (`qorechain-diana`) per tutto ciò che legge la chain. La variabile d'ambiente `QORE_REST` punta gli esempi e i controlli live a un altro endpoint REST, che in produzione è il tuo nodo. Gli indirizzi qui sotto provengono dalla frase di test pubblica BIP-39 e non devono mai contenere fondi.

**1. Convalidare un indirizzo (Go, offline).** Eseguito il 27 ottobre 2026 da un clone del tag `v0.1.0`:

```bash
cd code/go
go run ./cmd/custody-kit validate 0x9858EfFD232B4033E47d90003D41EC34EcaEda94
```

Ha stampato (codice di uscita 0):

```json
{
  "valid": true,
  "kind": "account",
  "format": "hex",
  "checksum": "eip55",
  "bech32": "qor1npvwllfr9dqr8erajqqr6s0vxnk2ak55am9g2c",
  "hex": "0x9858EfFD232B4033E47d90003D41EC34EcaEda94"
}
```

Un indirizzo di validatore viene rifiutato a meno che tu non lo consenta con `--allow-validator`:

```bash
go run ./cmd/custody-kit validate qorvaloper19rl4cm2hmr8afy4kldpxz3fka4jguq0a5ws5he
```

Ha stampato `"valid": false` con `"error": "KIND_NOT_ALLOWED"` e il dettaglio `a validator address is not accepted here`, ed è terminato con codice 1. Anche la suite di test Go (`go test ./...`) è passata sullo stesso checkout.

**2. Decodificare e verificare una transazione firmata prima della trasmissione.**

```bash
go run ./cmd/custody-kit decode <tx hex or base64>
go run ./cmd/custody-kit verify <tx> --chain-id qorechain-diana --account-number <n> \
  --pubkey <33-byte hex> --pq-pubkey <2592-byte hex>
```

Aggiungi `--eth` per un account eth-native. Leggi il numero di account da `GET /cosmos/auth/v1beta1/account_info/{address}` e la chiave ML-DSA-87 registrata da `GET /qorechain/pqc/v1/account/{address}`.

Lo stesso in TypeScript, dalla riga di comando di esempio del kit (`code/ts/src/cli.ts`):

```ts
import { decodeTx, fromHex, verifyTx } from "./index.js";

console.log(JSON.stringify(decodeTx(txBytes), null, 2)); // messages, memo, fee, signers, pqcLayers, txHash

const r = verifyTx({
  txBytes,
  chainId: "qorechain-diana",
  accountNumber: BigInt(accountNumber),
  classicalPublicKey: fromHex(secp256k1PubKeyHex),
  classicalKeyType: "secp256k1", // or "eth_secp256k1" for eth-native accounts
  pqPublicKey: fromHex(registeredMlDsa87KeyHex),
});
// r.valid, r.classical, r.signerKey ("match" | "absent" | "mismatch"), r.pq
```

**3. Scansionare i depositi (letture sulla testnet).**

```bash
go run ./cmd/custody-kit deposits qor1... --from-height 8976000 --to-height 8976400
```

Eseguito il 27 ottobre 2026 per l'indirizzo di test pubblico sulle altezze di testnet da 8976000 a 8983000, ha restituito un elenco vuoto, come ci si aspetta per un indirizzo che non ha mai ricevuto nulla.

TypeScript (da `code/ts/src/cli.ts`):

```ts
import { DEFAULT_TESTNET_REST, buildDepositQuery, extractDeposits, getJson } from "./index.js";

const restUrl = process.env.QORE_REST ?? DEFAULT_TESTNET_REST;
const path = buildDepositQuery({ address, minHeight: BigInt(from), maxHeight: BigInt(to) });
const body = await getJson(restUrl, path);
const responses = (body.tx_responses ?? []) as Record<string, unknown>[];
const entries = responses.flatMap((r) => extractDeposits(r, address));
// each entry: txhash, height, msgIndex, messageType, sender, amount, denom, memo, creditable, reason
```

Go (da `code/go/cmd/custody-kit/main.go`):

```go
opts := custodykit.DepositQueryOptions{Address: addr, MinHeight: &from, MaxHeight: &to}
path, err := custodykit.BuildDepositQuery(opts)
// GET restURL + path, then for each tx_response:
r, err := custodykit.ParseTxResponse(raw)
entries, err := custodykit.ExtractDeposits(r, addr, "") // "" = uqor
```

**4. Gli altri linguaggi.**

```bash
# Python (from code/python/src)
python -m qorechain_custody_kit validate qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h
python -m qorechain_custody_kit deposits <address> --from-height H --to-height H

# Rust
cargo run --example custody-kit -- validate 0x9858EfFD232B4033E47d90003D41EC34EcaEda94

# Java
mvn -q compile exec:java -Dexec.args="validate 0x9858EfFD232B4033E47d90003D41EC34EcaEda94"
```

**5. Eseguire i vettori e i controlli live.**

```bash
scripts/fetch-qoresign-vectors.sh            # optional: also check the QoreSign hybrid vectors
cd code/go && go test ./...                  # vectors
QORE_LIVE_TEST=1 go test -run Live ./...     # live reads against testnet
```

Ogni linguaggio ha l'equivalente (`pnpm test`, `pytest`, `cargo test`, `mvn test`). I controlli live non richiedono fondi. Quando questa pagina è stata scritta sono stati eseguiti solo i comandi Go `validate` e `deposits` e la suite di test Go; gli altri linguaggi sono descritti a partire dal repository.

### Funzioni e comandi principali {#api}

| TypeScript | Go | Python e Rust | Java | Che cosa fa |
|---|---|---|---|---|
| `validateAddress(input, { allow, requireEip55 })` | `ValidateAddress(input, ValidateAddressOptions{Allow, RequireEIP55})` | `validate_address` | `Addresses.validateAddress` | Restituisce `{ valid, kind, format, checksum, bech32, hex }` oppure `{ valid: false, error }`. |
| `decodeTx(txBytes)`, `decodeMessage(typeUrl, value)` | `DecodeTx`, `DecodeMessage` | `decode_tx`, `decode_message` | `TxDecoder.decodeTx`, `decodeMessage` | Messaggi, memo, commissione, firmatari, livelli ML-DSA-87 e l'hash della transazione. |
| `verifyTx({ txBytes, chainId, accountNumber, classicalPublicKey, classicalKeyType, pqPublicKey, signBytesVersion })` | `VerifyTx(VerifyTxArgs{...})` | `verify_tx` | `TxVerifier.verifyTx` | Restituisce `{ valid, classical, signerKey, pq }`. Versione dei sign-bytes v1, v2 oppure una qualsiasi. |
| `buildDepositQuery({ address, minHeight, maxHeight, event, page, limit, orderBy })` | `BuildDepositQuery` | `build_deposit_query` | `Deposits.buildDepositQuery` | Percorso REST per i trasferimenti in ingresso. `event` è `transfer` (predefinito) o `coin_received`; `limit` da 1 a 100, predefinito 50; crescente per impostazione predefinita. |
| `extractDeposits(txResponse, address, { denom })` | `ExtractDeposits(resp, address, denom)` | `extract_deposits` | `Deposits.extractDeposits` | Voci di deposito con `creditable` e `reason`. |
| `depositEventQuery`, `percentEncode`, `getJson`, `toHex`, `fromHex` | `DepositEventQuery`, `PercentEncode`, `GetJSON`, `ToHex`, `FromHex`, `ParseTxResponse` | `deposit_event_query`, `get_json`, `from_hex` | `CustodyKit`, `Rest` | Helper. |

Sono esportate anche le costanti `FEE_COLLECTOR`, `MSG_SEND`, `MSG_MULTI_SEND`, `MSG_ETHEREUM_TX`, `KNOWN_MESSAGES`, `PQC_HYBRID_TYPE_URL` e `DEFAULT_TESTNET_REST`.

Riga di comando di esempio in ogni linguaggio:

- `validate <address> [--allow-validator] [--require-eip55]`
- `decode <tx hex or base64>`
- `verify <tx> --chain-id ID --account-number N --pubkey HEX [--eth] [--pq-pubkey HEX]`
- `deposits <address> [--from-height H] [--to-height H] [--rest URL]`

Codici di errore, identici in ogni linguaggio:

- Kit: `MALFORMED_TX` (i byte non sono una transazione ben formata), `UNKNOWN_FIELD` (un campo che il decoder non conosce, che anche la rete rifiuterebbe), `INVALID_ARGUMENT`.
- `validateAddress`: gli undici codici elencati in [Innovazioni](#innovations).

I rifiuti della chain che un custode incontra più spesso, come codespace e codice (la tabella completa è in `docs/errors.md` del kit):

| Codespace | Codici |
|---|---|
| `sdk` | 3 sequenza non corrispondente, 4 non autorizzato, 5 fondi insufficienti, 11 gas esaurito, 12 memo troppo grande, 13 commissione insufficiente, 19 già nel mempool |
| `pqc` | 20 firma ibrida richiesta, 21 verifica ibrida fallita, 7 chiave già registrata, 26 nessuna finestra EVM (o nessuna chiave registrata), 27 finestra esaurita o fuori ambito, 28 parametri di finestra non validi |
| `stakingtier` | 13 lo stake è bloccato |

Distingui in base a codespace e codice insieme, e conserva il log grezzo.

## Come accedere {#how-to-access}

| | Mainnet | Testnet |
|---|---|---|
| Chain id | `qorechain-vladi` | `qorechain-diana` |
| EVM chain id | 9801 | 9800 |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM JSON-RPC | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| Release del nodo | v3.2.5 (applicata il 29 ottobre 2026) | v3.2.6 (v3.2.5 applicata) |

- La denominazione è `uqor` (1 QOR = 10^6 uqor; sul rail EVM 1 uqor = 10^12 wei). Il gas price minimo è 0.1 uqor, il periodo di unbonding è di 21 giorni e il limite del memo è di 256 caratteri. Questi valori sono stati letti da entrambe le reti il 27 ottobre 2026 e possono cambiare per governance, quindi in produzione leggili dalla chain.
- I depositi non richiedono né chiavi né registrazione. Inviare richiede una chiave ML-DSA-87 registrata per ogni indirizzo hot.
- Esegui i tuoi full node per la produzione. Gli endpoint pubblici hanno limiti di frequenza e sono pensati per lo sviluppo. Se uno script riceve `403 Forbidden`, imposta un header `User-Agent` esplicito. Vedi [eseguire un nodo](/developer-guide/running-a-node) e [connettersi alla mainnet](/getting-started/connecting-to-mainnet).
- La testnet riceve ogni release del nodo prima della mainnet. Cambia le regole del gas controllando l'upgrade applicato, non la data (entrambe le reti hanno applicato la v3.2.5).
- I token di test sulla testnet (denom bank della forma `erc20:0x...`, un token IBC) non esistono sulla mainnet. Accredita `uqor` su entrambe le reti.
- I QOR di testnet provengono dal faucet della dashboard di QoreChain e non hanno alcun valore. Vedi [connettersi alla testnet](/getting-started/connecting-to-testnet).

## Note di sicurezza {#security}

- Entrambe le chiavi di un indirizzo hot (secp256k1 e ML-DSA-87) firmano ogni transazione sul rail Native. Tienile nello stesso perimetro di custodia, con lo stesso quorum e la stessa traccia di audit.
- Fai il backup del seed ML-DSA-87 di 32 byte (chiavi software) oppure usa il backup delle chiavi dell'HSM. Un account con una chiave registrata non ha un percorso classico, quindi perdere la chiave ML-DSA-87 significa che l'account non può più firmare. Prova il ripristino sulla testnet con `verifyTx`.
- Gli HSM devono supportare la firma ML-DSA-87 pura (`CKM_ML_DSA` in PKCS #11 v3.2) sui sign-bytes con contesto vuoto. `HashML-DSA` non è accettato.
- Esegui `decodeTx` e `verifyTx` su ogni transazione firmata prima della trasmissione, in un processo che non l'ha costruita.
- La rotazione usa `MsgRotatePQCKey`: entrambe le chiavi firmano, il livello della transazione stessa usa la chiave attuale e il riutilizzo di una chiave precedente viene rifiutato. Se la chiave secp256k1 è esposta, sposta i fondi su un nuovo indirizzo con entrambe le chiavi nuove e chiudi qualsiasi finestra EVM aperta.
- Finestre EVM: usa `native_only` o `allowed_targets`, il `max_value` e i `blocks` più piccoli che coprano il lotto, e chiudi la finestra dopo il lotto. Tratta `MsgSetWithdrawAddress`, `MsgRotatePQCKey`, `MsgOpenEVMWindow` e `MsgAuthorizeEVMDelegation` come operazioni privilegiate.
- Non accreditare mai una transazione EVM il cui evento `ethereum_tx` segnala un fallimento, anche se il suo risultato nativo è `code == 0`.
- Questo è codice di riferimento alla versione 0.1.0. Rivedilo prima di usarlo in produzione. Segnala le vulnerabilità in privato a security@qore.network, inclusi gli errori di documentazione che potrebbero portare a un accredito sbagliato o a una firma non voluta.

## Dove è pubblicato {#where-published}

Verificato sui registri il 27 ottobre 2026.

| Registro | Pacchetto | Versione | Link |
|---|---|---|---|
| GitHub | `qorechain/qorechain-custody-kit` (tutti e cinque i linguaggi, pagine di guida, vettori) | release `v0.1.0`, pubblicata il 27 ottobre 2026 | https://github.com/qorechain/qorechain-custody-kit |
| Proxy dei moduli Go | `github.com/qorechain/qorechain-custody-kit/code/go` (codice di esempio, scaricabile) | v0.1.0 (tag `code/go/v0.1.0`) | https://pkg.go.dev/github.com/qorechain/qorechain-custody-kit/code/go |
| npm, PyPI, crates.io, Maven Central | non pubblicato: il kit è codice di esempio da copiare o includere (vendor) | non applicabile | non applicabile |

La release GitHub non ha file allegati; la release è il tag del repository. Le dipendenze su cui si basa il kit, tutte pubblicate: `@qorechain/qoresign` su npm (ultima 0.1.1, il kit fissa la 0.1.0), `qorechain-qoresign` su PyPI (0.1.1), `qorechain-qoresign` su crates.io (ultima 0.1.1, il kit fissa la 0.1.0), `github.com/qorechain/qoresign/go` (v0.1.0 e v0.1.1) e `io.github.qorechain:qoresign` su Maven Central (0.1.0 e 0.1.1).

Licenza Apache-2.0. Manutentore: QoreChain Association.

## Limiti e problemi noti {#limits}

- Il kit non custodisce chiavi, non firma transazioni, non trasmette e non offre firma threshold o MPC. La firma è fatta da QoreSign o dal tuo HSM. Oggi non esiste uno schema threshold standardizzato per ML-DSA; la guida documenta come combinare una chiave secp256k1 threshold con una chiave ML-DSA-87 custodita separatamente.
- Non fa alcuna dichiarazione sui processi interni di alcun custode. La checklist descrive solo i requisiti della rete.
- `validateAddress` accetta indirizzi di 20 byte. Gli indirizzi più lunghi di account di moduli e di contratti vengono rifiutati, come è giusto per gli indirizzi di deposito e di pagamento.
- `extractDeposits` accredita automaticamente `MsgSend`, `MsgMultiSend` e `MsgEthereumTx` riusciti. Gli altri messaggi (prelievi di ricompense, chiamate a contratti, trasferimenti IBC) vengono restituiti per revisione, non accreditati.
- `verifyTx` verifica transazioni con un solo firmatario.
- Il rail SVM non è aperto alle transazioni. Non costruire flussi di deposito o prelievo su di esso.
- Il codice del kit è codice di esempio alla 0.1.0. I nomi e le firme delle funzioni possono cambiare tra le versioni, e il tag del modulo Go non promette un'API stabile.
- Quando questa pagina è stata scritta sono stati eseguiti solo gli esempi Go e la suite di test. I controlli live e i controlli sui vettori negli altri quattro linguaggi non sono stati rieseguiti.
- Il README Python del repository potrebbe ancora dire che `verify_tx` genera un errore di import finché `qorechain-qoresign` 0.1.1 non è su PyPI. Quella versione è pubblicata, quindi la nota è obsoleta.
- La guida del kit cita parametri (valori di gas, valori dello staking tier) letti il 27 ottobre 2026. In produzione leggili dalla chain.

## Pagine correlate {#related}

- [QoreSign](/qoresign/overview): firma ibrida, verifica, il messaggio di registrazione della chiave e gli helper per il gas `suggestGasLimit` e `simulateTx`.
- [SDK QoreChain](/sdk/overview): decodifica degli errori con `decodeTxError`, i composer per la finestra EVM e il classificatore dei rifiuti.
- [Firma post-quantistica](/developer-guide/post-quantum-signing): firme ibride, sign-bytes v2 e registrazione della chiave.
- [Guida per exchange e integratori](/developer-guide/exchange-integration): scegliere tra i percorsi Native, EVM e SVM.
- [Precompile EVM](/developer-guide/evm-precompiles) e il rail EVM.
- [Staking e delega](/user-guide/staking-and-delegation).
- [Eseguire un nodo](/developer-guide/running-a-node) e [connettersi alla mainnet](/getting-started/connecting-to-mainnet).
- [Server MCP di QoreChain](/developer-tools/mcp): `get_pq_status` e `simulate_tx` per controlli rapidi.
- [QoreScan](/developer-tools/qorescan): fai l'inventario della crittografia del tuo nodo, dei tuoi endpoint e dei tuoi account.
