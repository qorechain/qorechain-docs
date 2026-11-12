---
slug: /developer-guide/evm-window-reference
title: Riferimento della finestra di autorizzazione EVM (v3.2.8)
sidebar_label: Riferimento finestra EVM
sidebar_position: 7
---

# Riferimento della finestra di autorizzazione EVM (v3.2.8)

Una transazione Ethereum porta una sola firma secp256k1 e nient'altro, quindi non può portare la firma post-quantistica (ML-DSA-87) che QoreChain richiede a ogni altra transazione. La **finestra di autorizzazione EVM** colma questa lacuna. L'account apre prima una finestra delimitata con un messaggio QoreChain Native che **è** firmato con la sua chiave post-quantistica, e la corsia EVM ammette poi le normali transazioni dell'account da MetaMask, ethers.js, Hardhat o Foundry solo finché la finestra le copre. Questa pagina è il riferimento completo di come si comporta una finestra nella release **v3.2.8**.

:::note Dove gira la v3.2.8
La testnet **`qorechain-diana`** esegue la **v3.2.8** dal 12 novembre 2026. La mainnet **`qorechain-vladi`** non l'ha ancora applicata; sulla mainnet la finestra funziona come descritto in [Sviluppo EVM](/developer-guide/evm-development#evm-window), senza le opzioni e le regole contrassegnate "v3.2.8" qui sotto. Un nodo precedente alla v3.2.8 rifiuta un messaggio di finestra che imposta le nuove liste.
:::

## Perché è importante {#why}

- **Una chiave classica rubata vale solo quanto ciò che una finestra aperta ammette.** La finestra limita il tempo (blocchi), il numero di transazioni, i QOR che possono uscire e, facoltativamente, quali contratti l'account può toccare.
- **La chiave post-quantistica resta al comando.** Aprire, restringere e chiudere una finestra sono tutti messaggi Native firmati in modo ibrido. La sola chiave classica non può mai aprirne una.
- **La v3.2.8 rende più severi i valori predefiniti.** I metodi dei precompile standard sono negati per impostazione predefinita, le firme controllate da altri contratti richiedono il consenso della finestra e cambiare la chiave post-quantistica chiude la finestra.

La versione breve delle aggiunte della v3.2.8 è in [Opzioni di finestra aggiunte nella v3.2.8](/developer-guide/evm-development#evm-window-v328); questa pagina non la ripete per intero e aggiunge gli esempi, il riferimento dei campi e la tabella degli errori. Per la prima finestra passo passo vedi [La tua prima transazione](/getting-started/first-transaction#evm-window).

## Apri, chiudi e leggi {#lifecycle}

| Azione | Messaggio | CLI | REST |
| ------ | --------- | --- | ---- |
| Apri (sostituisce qualsiasi finestra aperta) | `/qorechain.pqc.v1.MsgOpenEVMWindow` | `qorechaind tx pqc open-evm-window [blocks] [max-txs] [max-value]` | nessuna (una transazione) |
| Chiudi subito | `/qorechain.pqc.v1.MsgCloseEVMWindow` | `qorechaind tx pqc close-evm-window` | nessuna (una transazione) |
| Leggi | nessuno | `qorechaind q pqc evm-window <address>` | `GET /qorechain/pqc/v1/evm_window/{address}` |

Aprire e chiudere sono transazioni della corsia Native e richiedono la firma ibrida dell'account (classica più ML-DSA-87), e l'account deve già avere una chiave post-quantistica registrata per aprire una finestra. Chiudere una finestra ritira anche un consenso EIP-7702 in sospeso. Aprire **fa avanzare il nonce dell'account** (la sequenza Native è il nonce EVM), quindi apri prima la finestra e leggi il nonce EVM dopo.

### CLI {#cli}

Costruisci la transazione con `--generate-only`, poi aggiungi la firma post-quantistica con `tx pqc cosign`. Il binario `qorechaind` di release ha `gen-key` e `cosign`; una build della community no.

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana

# Open: 7,200 blocks, 20 transactions, 100 QOR cap (value plus maximum fees)
qorechaind tx pqc open-evm-window 7200 20 100qor \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window.json

qorechaind tx pqc cosign window.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Senza argomenti la CLI usa valori predefiniti dimensionati per una sessione di deploy: 3,600 blocchi, 10 transazioni e 25 QOR. Una finestra limitata a un solo contratto, che può anche delegare a un solo validatore e inviare a un solo destinatario IBC:

```bash
qorechaind tx pqc open-evm-window 600 5 100qor \
  --allowed-targets 0x0000000000000000000000000000000000000800 \
  --staking-validators qorvaloper1... \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window.json
```

Chiudi una finestra in anticipo, per esempio se pensi che la chiave classica sia esposta. Ciò che la finestra ammetteva ancora viene rifiutato dal blocco successivo:

```bash
qorechaind tx pqc close-evm-window \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 40000uqor --generate-only > close.json

qorechaind tx pqc cosign close.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Leggi la finestra:

```bash
qorechaind q pqc evm-window <qor1-address> --node $QNODE
```

`live: true` insieme a `remaining_blocks`, `remaining_txs` e `remaining_value` (uqor) è ciò che vuoi vedere. Il riferimento dei comandi è in [Comandi di transazione](/cli-reference/transaction-commands#open-evm-window).

### REST {#rest}

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_window/<qor1-address>
```

Un account senza finestra risponde con HTTP 200 e `found: false`, quindi la route è sicura da interrogare ripetutamente. Ogni numero è una stringa JSON. Una finestra memorizzata può essere scaduta o esaurita: `live` ti dice se ammette ancora almeno un'altra transazione a valore zero all'altezza corrente.

### TypeScript {#typescript}

Gli helper della finestra sono in `@qorechain/sdk` (vedi la [guida EVM dell'SDK](/sdk/guides/evm#evm-window-scope) per la configurazione della firma). `openEvmWindowMsg` accetta ogni campo qui sotto, `closeEvmWindowMsg` costruisce il messaggio di chiusura, `fetchEvmWindow` legge la finestra e `classifyEvmWindowRejection` spiega un rifiuto.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  openEvmWindowMsg,
  closeEvmWindowMsg,
  fetchEvmWindow,
} from "@qorechain/sdk";

const REST = "https://api-testnet.qore.host";
const client = createClient({
  network: "testnet",
  endpoints: { rest: REST, rpc: "https://rpc-testnet.qore.host", evmRpc: "https://evm-testnet.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic); // already registered on chain
const tx = await client.connectTx(signer, { pqcKeypair });         // signs hybrid

// Open a window that may call one token contract and delegate to one validator.
await tx.signAndBroadcast(
  [
    openEvmWindowMsg({
      sender: account.address,
      blocks: 7200,
      maxTxs: 20,
      maxValue: "100000000",                 // uqor: value PLUS the maximum fee of each transaction
      allowedTargets: ["0x0000000000000000000000000000000000000800"],
      stakingValidators: ["qorvaloper1..."],
    }),
  ],
  "auto",
);

// Read it back (opens first, then read the nonce).
const w = await fetchEvmWindow({ rest: REST, address: account.address });
console.log(w.live, w.remainingBlocks, w.remainingTxs, w.remainingValue);

// Close it early.
await tx.signAndBroadcast([closeEvmWindowMsg(account.address)], "auto");
```

`openEvmWindowMsg` controlla i limiti e i formati delle liste prima che venga firmato qualsiasi cosa, quindi un errore fallisce in locale invece di costare una transazione rifiutata. `MAX_EVM_WINDOW_BLOCKS` e `MAX_EVM_WINDOW_TXS` esportano i limiti. La lettura (`fetchEvmWindow`) restituisce i limiti, i contatori e l'ambito della v3.2.3 (`nativeOnly`, `allowedTargets`); `validators` (indirizzi di contratto), `stakingValidators` (`qorvaloper1...`) e `ibcReceivers` (`"<channel>/<receiver>"`) sono accettati dal builder dall'SDK 0.14.0, che porta le liste della v3.2.8; la lettura non le restituisce, quindi leggile via REST. L'esempio qui sopra usa `stakingValidators`; non è stato eseguito con l'SDK 0.14.0. Imposta le tre liste solo per una rete che esegue la v3.2.8: un nodo precedente rifiuta un messaggio di finestra che le imposta. Con un `connectTx` che firma in modo ibrido la chiave post-quantistica deve essere già registrata.

### Testato sulla testnet {#tested}

Eseguito su `qorechain-diana` il 12 novembre 2026 (release v3.2.8) con un account eth-native che aveva registrato la propria chiave post-quantistica, usando l'SDK 0.13.0 (`openEvmWindowMsg`, `closeEvmWindowMsg`, `fetchEvmWindow`) e la firma ibrida. I campi di finestra `validators`, `staking_validators` e `ibc_receivers` non erano nei builder dell'SDK 0.13.0; l'SDK 0.14.0 li aggiunge a `openEvmWindowMsg`, e questa esecuzione non li ha usati (con l'SDK 0.13.0 usa la riga di comando per questi).

| Passaggio | Risultato |
| --------- | --------- |
| `GET /qorechain/pqc/v1/evm_window/{address}` prima dell'apertura | `found: false`, `live: false` |
| Apertura: 300 blocchi, 5 transazioni, 1,000,000 uqor | code 0, 187,282 di gas usato. Lettura: `found: true`, `live: true`, `opened_height` 9942089, `expiry_height` 9942389, `max_txs` 5, `max_value` 1000000, `remaining_blocks` 297, `native_only: false`, `allowed_targets: []` |
| Apertura di nuovo con `nativeOnly: true` | code 0, 187,803 di gas usato. La nuova finestra ha sostituito la vecchia: `native_only: true`, un nuovo `opened_height` |
| Chiusura | code 0, 170,468 di gas usato. Lettura: `found: false` |

Con l'SDK 0.14.0, lo stesso giorno, una finestra aperta con `allowedTargets` (l'indirizzo del precompile di staking), `stakingValidators` (un indirizzo operatore di validatore) e `ibcReceivers` (una coppia `channel-0/...`) è riuscita con code 0 e 195,233 di gas usato. La lettura REST ha elencato `allowed_targets` e ha restituito `found: true`, `live: true`; non restituisce le liste `validators`, `staking_validators` o `ibc_receivers`, quindi conserva i valori con cui hai aperto la finestra.

`fetchEvmWindow` ha restituito gli stessi campi in camel case (`openedHeight`, `remainingBlocks`, `nativeOnly`, `allowedTargets`). Aprire e chiudere sono transazioni Cosmos firmate in modo ibrido, quindi la prima che un account invia richiede che la sua chiave sia registrata prima.

### Python, Go, Rust e Java {#other-languages}

Ogni SDK ha un builder per il messaggio e una lettura REST. Tutti controllano in locale i limiti della chain. Il builder di un linguaggio che imposta le liste della v3.2.8 richiede l'SDK 0.14.0 o successivo (Java: la 0.14.0 su Maven Central); le release precedenti costruiscono solo i campi più vecchi.

| Linguaggio | Apertura (con ogni lista) | Chiusura | Lettura | Limiti EVM |
| ---------- | ------------------------- | -------- | ------- | ---------- |
| Python | `msg.pqc.open_evm_window(sender=, blocks=, max_txs=, max_value=, native_only=, allowed_targets=, validators=, staking_validators=, ibc_receivers=)` | `msg.pqc.close_evm_window(sender=)` | `get_evm_window(rest, address)` | `fetch_evm_limits(rest)` |
| Go | `messages.NewOpenEVMWindowWithScope(sender, blocks, maxTxs, maxValue, scope)` con un `messages.EVMWindowScope` | `messages.NewCloseEVMWindow(sender)` | `rest.GetEVMWindowStatus(address)` | `rest.GetEVMLimits()` |
| Rust | `msg::pqc::open_evm_window_with_scope_any(sender, blocks, max_txs, max_value, &scope)` con `EvmWindowScope` | `msg::pqc::close_evm_window_any(sender)` | `get_evm_window(&rest, address)` | nessun helper per ora; leggi la route REST |
| Java | `EvmWindow.openWithPolicy(sender, blocks, maxTxs, maxValue, nativeOnly, allowedTargets, validators, stakingValidators, ibcReceivers)` | `EvmWindow.close(sender)` | `rest.evmWindow(address)` | `rest.evmLimits()` |

Python:

```python
from qorsdk import RestClient, get_network, get_evm_window, msg

sender = "qor1..."
open_msg = msg.pqc.open_evm_window(
    sender=sender,
    blocks=7200,
    max_txs=20,
    max_value="100000000",  # uqor, integer string
    allowed_targets=["0x0000000000000000000000000000000000000800"],
    staking_validators=["qorvaloper1..."],
)
# broadcast it through the usual hybrid path, then:
rest = RestClient(get_network("testnet").endpoints.rest)
status = get_evm_window(rest, sender)
print(status.live, status.remaining_blocks, status.remaining_txs, status.remaining_value)
close_msg = msg.pqc.close_evm_window(sender=sender)
```

Go:

```go
open, err := messages.NewOpenEVMWindowWithScope(sender, 7200, 20, "100000000",
    messages.EVMWindowScope{
        AllowedTargets:    []string{"0x0000000000000000000000000000000000000800"},
        StakingValidators: []string{"qorvaloper1..."},
    })
status, err := rest.GetEVMWindowStatus(sender)
closeMsg, err := messages.NewCloseEVMWindow(sender)
```

Rust:

```rust
use qorechain::evm_window::{get_evm_window, EvmWindowScope};
use qorechain::msg;

let scope = EvmWindowScope {
    allowed_targets: vec!["0x0000000000000000000000000000000000000800".into()],
    staking_validators: vec!["qorvaloper1...".into()],
    ..Default::default()
};
let open = msg::pqc::open_evm_window_with_scope_any("qor1...", 7200, 20, "100000000", &scope)?;
let status = get_evm_window(&rest, "qor1...").await?;
let close = msg::pqc::close_evm_window_any("qor1...");
```

Java:

```java
TypedMessage open = EvmWindow.openWithPolicy(sender, 7200, 20, "100000000",
    false,
    List.of("0x0000000000000000000000000000000000000800"), // allowedTargets
    null,                                                   // validators
    List.of("qorvaloper1..."),                              // stakingValidators
    null);                                                  // ibcReceivers
EvmWindowStatus status = rest.evmWindow(sender);
TypedMessage close = EvmWindow.close(sender);
```

L'SDK non apre mai una finestra al posto tuo. Una finestra autorizza la spesa, quindi il passaggio resta esplicito e visibile all'utente.

## Campi {#fields}

| Campo (flag CLI) | Limite | Significato |
| ---------------- | ------ | ----------- |
| `blocks` (primo argomento) | da 1 a 17,280 | La finestra non ammette nulla dopo l'altezza di apertura più `blocks`. È un numero di blocchi, non una durata: circa 5 ore sulla testnet e circa 15 ore sulla mainnet con i tempi di blocco di oggi |
| `max_txs` (secondo argomento) | da 1 a 1,000 | Quante transazioni EVM ammette |
| `max_value` (terzo argomento) | positivo | Totale di uqor che la finestra lascia uscire dall'account: il valore trasferito **più** la commissione massima (limite di gas per il tetto della commissione) di ogni transazione ammessa |
| `native_only` (`--native-only`) | true o false | Ammette solo trasferimenti semplici di QOR: nessun calldata, nessuna creazione di contratto, nessun destinatario che porti codice, nessuna autorizzazione EIP-7702 |
| `allowed_targets` (`--allowed-targets`) | al massimo 16 indirizzi `0x`, senza duplicati | Ammette solo transazioni verso questi indirizzi; la creazione di contratti è rifiutata |
| `validators` (`--validators`) | al massimo 16 indirizzi `0x`, senza duplicati | Contratti il cui controllo della firma dell'account vale per le azioni dell'account stesso: un modulo validatore chiamato da un contratto wallet, o l'entry point ERC-4337. v3.2.8 |
| `staking_validators` (`--staking-validators`) | al massimo 16 indirizzi `qorvaloper...`, senza duplicati | Validatori ai quali l'account può delegare o ridelegare tramite la finestra. v3.2.8 |
| `ibc_receivers` (`--ibc-receivers`) | al massimo 16 voci `<channel>/<receiver>`, al massimo 256 caratteri ciascuna, senza spazi né virgole | Destinazioni esatte verso cui può andare un trasferimento IBC di QOR nativo. Confrontate byte per byte, quindi scrivi `channel-0` e il destinatario bech32 in minuscolo esattamente come li porta il trasferimento. v3.2.8 |

Ogni limite deve essere indicato: la chain rifiuta quello mancante invece di assegnargli un valore predefinito (la CLI inserisce da sola i valori predefiniti per le sessioni di deploy). Qualsiasi limite che si esaurisce di fatto termina la finestra. Una finestra funziona solo finché la chiave post-quantistica dell'account è utilizzabile, cioè non vuota, non solo classica e non disabilitata dalla governance.

### Cosa conta una finestra {#counting}

All'ammissione, prima che la transazione venga eseguita, ogni transazione EVM usa una delle `max_txs` e aggiunge al valore usato il proprio valore trasferito più la commissione massima, convertiti dall'unità EVM a 18 decimali in uqor e arrotondati per eccesso. Una transazione ammessa che poi fa revert ha comunque usato la sua quota. Dopo l'esecuzione, anche i QOR nativi che un precompile ha mosso per conto dell'account (una delega, un deposito, un trasferimento IBC) vengono addebitati alla finestra, quindi contano contro `max_value` anche se il valore della transazione era zero.

Non vengono conteggiati: `eth_call`, `eth_estimateGas` e le simulazioni. I token non sono prezzati affatto: un trasferimento o un'approvazione ERC-20 porta valore zero, quindi limitali con un ambito (`allowed_targets`). Ogni addebito emette un evento `pqc_evm_window_used` con gli attributi `address`, `evm_address`, `window_open_height`, `used_txs`, `used_value`, `tx_value` e `source` (`ante` per l'ammissione, `settlement` per l'addebito dopo l'esecuzione), così un wallet può mostrare cosa ha preso una transazione. L'apertura e la chiusura emettono `pqc_evm_window_opened` e `pqc_evm_window_closed`.

## Precompile standard attraverso una finestra {#precompile-allowlist}

Per un account che una finestra autorizza, un metodo di un precompile standard (staking, distribution, ICS-20, gov, slashing, i precompile dei token ERC-20) viene rifiutato a meno che non sia nella tabella e la finestra elenchi quel precompile in `allowed_targets`. Gli indirizzi dei precompile sono in [Precompile EVM](/developer-guide/evm-precompiles); quelli di staking, distribution, ICS-20 e gov sono `0x...0800`, `0x...0801`, `0x...0802` e `0x...0805`.

| Precompile | Metodo | Ammesso quando |
| ---------- | ------ | -------------- |
| distribution | `claimRewards`, `withdrawDelegatorRewards` | le ricompense vengono pagate all'account stesso (il suo indirizzo di prelievo è il proprio) |
| distribution | `withdrawValidatorCommission` | il validatore è quello dell'account e paga l'account stesso |
| distribution | `depositValidatorRewardsPool` | il validatore è in `staking_validators` e ogni moneta è QOR nativo |
| staking | `delegate`, `redelegate` | il validatore di destinazione è in `staking_validators` |
| ICS-20 | `transfer` | QOR nativo, sulla porta `transfer`, senza memo, verso una coppia in `ibc_receivers` |
| Precompile dei token ERC-20 | `transfer`, `transferFrom`, `approve` | QOR nativo; un altro token solo quando la finestra elenca l'indirizzo di quel token |

Tutto il resto viene rifiutato attraverso una finestra, qualunque cosa elenchi: annullare una delega (undelegate), annullare un unbonding, votare e altre azioni di governance, cambiare l'indirizzo di prelievo, creare o modificare un validatore, rimuovere dalla prigione (unjail), finanziare la community pool. Invia queste come transazioni Native firmate in modo post-quantistico. Elencare ICS-20 senza `ibc_receivers` non ammette alcun trasferimento, ed elencare il precompile di staking senza `staking_validators` non ammette alcuna delega.

Esempi di cosa elencare:

| Obiettivo | Finestra |
| --------- | -------- |
| Riscuotere le ricompense di staking da MetaMask | `allowed_targets` con il precompile di distribution; tieni l'indirizzo di prelievo come l'account stesso |
| Fare staking da MetaMask | `allowed_targets` con il precompile di staking, più `staking_validators` |
| Trasferire QOR in uscita tramite bridge | `allowed_targets` con il precompile ICS-20, più `ibc_receivers` come `channel-0/<receiver>` |
| Spostare un token IBC detenuto come precompile ERC-20 | `allowed_targets` con l'indirizzo di quel token |

Elencare un contratto è il consenso dell'account a ciò che quel contratto può fare con i suoi asset: per un vault, un router o un token che detiene i token dell'account, la finestra non limita quali token si muovono né dove.

## Creazione di contratti {#contract-creation}

Distribuire un contratto richiede una finestra **senza ambito**. Una finestra con `native_only` o con `allowed_targets` rifiuta la creazione di contratti. Per una sessione di deploy apri una finestra semplice (i valori predefiniti della CLI sono dimensionati per una), esegui il deploy, poi chiudila. Per le sessioni successive apri una finestra con `--allowed-targets <contract-address>` per limitarla alle chiamate al contratto che hai distribuito. La guida al deploy con Hardhat e Foundry è in [Sviluppo EVM](/developer-guide/evm-development).

## Permit, ordini EIP-712 e Permit2 {#permits}

Un permit EIP-2612, un trasferimento Permit2, un ordine firmato o una meta-transazione vengono controllati da un contratto con il precompile `ecrecover`. Dalla v3.2.8 (su entrambe le reti, una volta che una rete la applica), per un account che detiene una chiave post-quantistica utilizzabile quel controllo riesce solo finché la **finestra live** dell'account stesso ammette il **contratto verificatore**, cioè il token o Permit2 stesso e non il router che inoltra la chiamata.

1. Se la finestra ha un ambito, elenca il contratto verificatore in `allowed_targets` (`native_only` non ammette alcuna firma di questo tipo).
2. Apri la finestra **prima** che l'utente firmi. Senza una finestra live la firma viene trattata come non valida e il contratto la rifiuta.
3. La firma in sé non viene mai addebitata alla finestra, perché una firma diventa pubblica una volta usata.
4. Un permit o un'approvazione concessi dentro una finestra restano dopo che la finestra si chiude. Rivedi e revoca le approvazioni al termine della sessione.

Gli account senza record post-quantistico, un wallet delegato che controlla la propria firma e la firma del mittente stesso in una finestra senza ambito vengono recuperati come prima. Le query e le stime del gas non sono interessate.

## Cambi di chiave e consenso EIP-7702 {#key-changes}

- **Ruotare, migrare o registrare di nuovo la chiave post-quantistica chiude la finestra** ed elimina qualsiasi consenso EIP-7702. Apri di nuovo la finestra dopo. Tienine conto nei wallet hot e nelle integrazioni degli exchange.
- La finestra, il consenso EIP-7702 (`MsgAuthorizeEVMDelegation`, `MsgClearEVMDelegation`) e i messaggi di gestione degli account astratti devono essere il **messaggio di primo livello dell'account stesso, firmato in modo ibrido**. Non possono essere inviati tramite authz (`MsgExec`) né concessi a un altro account, e una concessione di quei tipi di messaggio viene rifiutata. Le concessioni di consenso esistenti di questo tipo sono state rimosse con l'upgrade.
- Un account delegato EIP-7702 che agisce dentro la transazione di qualcun altro ha bisogno di una propria finestra live nel momento in cui il suo codice agisce. Senza una, fallisce solo quella chiamata, e il contratto chiamante vede il fallimento, quindi un pagamento a un account delegato non fa più andare in revert l'intera transazione del pagatore.

Il consenso per una delega viene registrato con `qorechaind tx pqc authorize-evm-delegation <delegate_0x> <blocks>` e letto con `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`; vedi [Deleghe EIP-7702](/developer-guide/evm-development#eip-7702).

## Limiti in vigore {#limits}

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_limits
```

La testnet ha risposto il 12 novembre 2026 con `tx_max_gas` **30000000** e `precompile_input_max_bytes` **16384**:

| Limite | Valore | Significato |
| ------ | ------ | ----------- |
| `tx_max_gas` | 30,000,000 | Il massimo di gas che una transazione EVM può richiedere; sopra, la transazione viene rifiutata prima di essere eseguita. Le esecuzioni EVM avviate da un messaggio Native condividono lo stesso budget |
| `precompile_input_max_bytes` | 16,384 | Il massimo input che un precompile con stato protetto accetta |
| `blocks` della finestra | 17,280 | Finestra più lunga |
| `max_txs` della finestra | 1,000 | Massimo di transazioni in una finestra |
| Voci delle liste | 16 per lista | `allowed_targets`, `validators`, `staking_validators`, `ibc_receivers` |

La risposta contiene anche un oggetto `limits` con i valori impostati dalla governance; leggi i `tx_max_gas` e `precompile_input_max_bytes` di primo livello, che sono i valori in vigore. La route è servita dalla v3.2.8, quindi la mainnet pubblica risponde `501 Not Implemented` finché non viene aggiornata.

Una finestra aperta a un normale prezzo del gas conta comunque la commissione massima: un limite di gas di 30,000,000 con un tetto della commissione di 100 gwei conta 3 QOR contro `max_value` per una transazione.

## Errori {#errors}

I rifiuti arrivano con codespace `pqc`. Su JSON-RPC EVM un rifiuto arriva come errore di broadcast che porta il messaggio e nessun codespace, quindi confronta anche il testo (lo fanno i classificatori degli SDK).

| Codice | Messaggio | Causa | Cosa fare |
| ------ | --------- | ----- | --------- |
| 26 | `no open EVM authorisation window` | Nessuna finestra, nessuna chiave post-quantistica registrata, o la finestra è scaduta | Registra prima una chiave se non ce n'è una, poi apri una finestra |
| 27 | `EVM authorisation window exhausted` | Un limite è esaurito, o la transazione è fuori dall'ambito della finestra (incluso un precompile standard che la finestra non elenca, o la creazione di contratti con una finestra con ambito) | Apri una nuova finestra con limiti più ampi o l'ambito che ti serve |
| 28 | `invalid EVM authorisation window` | Una richiesta di apertura fuori dai limiti, o nessuna chiave utilizzabile a quel punto | Controlla `blocks`, `max_txs`, `max_value` e le liste; registra o ripara la chiave |
| 62 | `delegated account has no window covering this action` | Un account delegato ha agito, o il mittente ha mosso più di quanto la sua finestra copra, senza una finestra che copra. Dalla v3.2.8 la stessa regola fa fallire solo la chiamata incriminata | Apri per quell'account una finestra che ammetta l'azione |
| revert | `<method> is disabled: the circuit breaker has tripped ...` | Un metodo di un precompile standard il cui messaggio Native è disattivato | Attendi; non c'è nulla da cambiare nella finestra |
| revert | `<method>: account ... has no open EVM authorisation window that lists 0x...` | Un precompile che muove valore raggiunto tramite codice, per un account la cui finestra non lo elenca | Aggiungi il precompile a `allowed_targets` |
| nonce | `nonce too low` | La transazione EVM è stata firmata prima dell'apertura della finestra (aprire fa avanzare il nonce) | Rileggi il nonce e firma di nuovo |
| chain id | `only replay-protected (EIP-155) Ethereum transactions are accepted` | Una transazione firmata senza chain id | Imposta il chain id nella configurazione di rete dello strumento |

`classifyEvmWindowRejection(err)` nell'SDK TypeScript restituisce `"no-pqc-key"`, `"no-window"`, `"exhausted"` o `"invalid"`; gli altri SDK hanno un classificatore equivalente (`describe_evm_window_error` in Python, `tx.ClassifyEVMWindowError` in Go, `classify_evm_window_error` in Rust, `EvmWindowIssue.classify` in Java).

## Cosa la finestra non governa {#outside}

La finestra governa la corsia EVM, cioè le transazioni firmate con la sola chiave classica. Questi casi non le vengono addebitati, perché ciascuno porta la propria firma post-quantistica o è avviato da un modulo per un account che ha firmato:

- I messaggi della corsia Native che l'account firma da solo: invii bank, staking, governance e un `MsgCrossVMCall` verso l'EVM, che gira come l'indirizzo `0x` del firmatario stesso.
- Le esecuzioni di account astratti autorizzate dagli autenticatori dell'account.
- Le conversioni ERC-20 e i callback IBC eseguiti dai moduli.

Una chiamata cross-VM verso l'EVM che il mittente non ha inviato di persona (per esempio sotto una concessione authz) gira sotto la finestra del mittente e richiede che questa ammetta la destinazione. Il bridge cross-VM `0x0901` richiede una finestra che lo elenchi. Vedi [Interoperabilità cross-VM](/developer-guide/cross-vm-interoperability).

## Flusso MetaMask e QoreX {#qorex-flow}

MetaMask firma con una chiave Ethereum, che è la chiave di un **account in stile Ethereum (coin 60)**, e MetaMask non può produrre un messaggio Native. QoreX è il luogo in cui un tale account apre la sua finestra; gli invii di QoreX usano la corsia Native e non ne hanno mai bisogno.

1. In QoreX, aggiungi o ripristina l'account coin-60 per la tua frase di MetaMask (vedi [Ripristinare una frase da MetaMask o dalla Dashboard](/qorex/getting-started#restore-dashboard)). L'account richiede una chiave ML-DSA-87 registrata; il tuo primo trasferimento da QoreX la registra.
2. Apri la scheda **Finestra di accesso EVM** (app: Impostazioni, Sicurezza, Finestra di accesso EVM; estensione: il pulsante **Finestra di accesso EVM** nel popup) e scegli quanti blocchi (fino a 17,280), quante transazioni (fino a 1,000) e il tetto di spesa in QOR. Il tetto copre ogni importo più la sua commissione massima. I valori predefiniti sono 300 blocchi, 5 transazioni e 1 QOR.
3. Approva il messaggio firmato in modo ibrido. Una nuova finestra sostituisce qualsiasi finestra aperta, e l'apertura fa avanzare il tuo nonce, quindi invia da MetaMask solo dopo; una transazione preparata prima viene rifiutata con "nonce too low".
4. Invia da MetaMask sul chain id 9800 (testnet) o 9801 (mainnet). Quando hai finito, usa **Chiudi la finestra**, offerto solo mentre una finestra è live.

La scheda di QoreX imposta i tre limiti. Non offre una schermata per le liste di ambito (`allowed_targets`, `validators`, `staking_validators`, `ibc_receivers`, `native_only`), quindi una finestra con ambito si ottiene da `qorechaind` o da un SDK. Vedi [Finestra di accesso EVM](/qorex/security-and-recovery#evm-window) per la scheda e i suoi quattro stati.

## Pagine correlate {#related}

- [Sviluppo EVM](/developer-guide/evm-development): il runtime, i limiti di gas e le [opzioni di finestra della v3.2.8](/developer-guide/evm-development#evm-window-v328)
- [Precompile EVM](/developer-guide/evm-precompiles)
- [Interoperabilità cross-VM](/developer-guide/cross-vm-interoperability)
- [Firma post-quantistica](/developer-guide/post-quantum-signing)
- [Guida EVM dell'SDK](/sdk/guides/evm#evm-window-scope)
- [Comandi di transazione](/cli-reference/transaction-commands#open-evm-window) e [Comandi di query](/cli-reference/query-commands)
- [Endpoint REST e gRPC](/api-reference/rest-grpc-endpoints)
- [La tua prima transazione](/getting-started/first-transaction#evm-window)
- [QoreX: finestra di accesso EVM](/qorex/security-and-recovery#evm-window)
