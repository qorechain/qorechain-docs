---
slug: /developer-tools/chain-bridge
title: Chain Bridge e Handle
sidebar_label: Chain bridge e handle
sidebar_position: 3
---

# Chain bridge e handle

Questa pagina tratta due piccoli pacchetti lato server.

**`@qorechain/chain-bridge`** (0.2.3) è una libreria Node.js per backend che operano su QoreChain senza una persona alla tastiera: invia QOR, registra la chiave ML-DSA-87 di un account, registra light node, distribuisce contratti e, per chi detiene la chiave di autorità delle licenze della chain, concede e revoca licenze. Gestisce le due cose che un backend semplice non può fare da solo: la firma ibrida ML-DSA-87 richiesta dalle transazioni sulla lane nativa e l'esatta codifica protobuf dei messaggi personalizzati di QoreChain. È pensata per worker di hot wallet, backend di pagamento e dashboard e servizi simili.

**`@qorechain/handles`** (0.1.0) risolve un `@handle` di QoreX in un indirizzo e verifica crittograficamente la risposta prima di restituirla. È pensato per wallet e servizi che permettono di digitare `@alice` invece di un indirizzo `qor1...`.

Nessuno dei due pacchetti riporta un repository sorgente nei metadati del registry. Puoi leggere il codice pubblicato su npm.

## Innovazioni {#innovations}

### Chain bridge {#innovations-chain-bridge}

- **Un solo mnemonic, una sola chiave ML-DSA-87 canonica.** La chiave è derivata come `SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)` e poi con la generazione di chiavi ML-DSA-87, la stessa derivazione del [wallet adapter](/developer-tools/wallet-adapter), dell'SDK e di QoreX, quindi la chiave può essere recuperata con `qorechaind tx pqc recover-key`. Gli account registrati da strumenti precedenti con `SHAKE-256(mnemonic)` mantengono la loro chiave legacy: quando una firma canonica viene rifiutata con un errore di verifica, il bridge riprova una volta con la chiave legacy.
- **Forma dei sign-bytes letta dalla chain.** Con `cosmosRest` impostato, il bridge chiede al nodo i piani di upgrade applicati (`v3.2.0` e `v3.1.98`) e firma la forma v2 quando uno dei due è applicato, come descritto nella [pagina del wallet adapter](/developer-tools/wallet-adapter#innovations). Se la chain rifiuta con il codice `pqc` 21, risolve di nuovo una volta e firma ancora. Sulle reti live `cosmosRest` è obbligatorio; senza di esso una chiamata ibrida lancia un errore invece di tirare a indovinare.
- **Registra la chiave al primo utilizzo, ma prima controlla la chain.** Quando una transazione ibrida viene rifiutata per l'assenza di una chiave PQC, il bridge invia `MsgRegisterPQCKeyV2` (una transazione classica, che la chain consente per una prima registrazione) e riprova. Poiché quel messaggio costa la sua commissione anche se rifiutato, prima legge `GET /qorechain/pqc/v1/account/{address}`: se l'account possiede già una chiave che non è né quella canonica né quella legacy del tuo mnemonic, lancia `pqc_key_mismatch` e non invia nulla. Con `cosmosRest`, una registrazione porta anche la prova di possesso una volta che la rete ha applicato la v3.2.3 (la mainnet e la testnet l'hanno entrambe).
- **ID delle funzionalità di licenza a partire da nomi semplici.** `featureIdsFor({ type, chains })` mappa la descrizione di un prodotto negli ID di funzionalità della chain (`validator_operator` più `validator_<chain>`, `lightnode_operator`, `qcb_bridge` più `bridge_<chain>`), normalizza nomi di chain in testo libero come "Solana" o "BNB Chain" e scarta una chain sconosciuta invece di costruire un ID che la chain rifiuterebbe. Verificato il 27 ottobre 2026: `featureIdsFor({ type: "validator", chains: ["Solana", "Ethereum", "Foo"] })` ha restituito `validator_operator`, `validator_solana`, `validator_ethereum` e ha scartato `Foo`.
- **JavaScript puro, nessun add-on nativo.** È un modulo ES per Node.js 18 o successivo, quindi funziona nei worker serverless. Oltre al punto d'ingresso principale esporta `@qorechain/chain-bridge/proto` (gli encoder del formato wire) e `@qorechain/chain-bridge/features` (la mappatura delle funzionalità).

### Handle {#innovations-handles}

- **Una risoluzione viene controllata due volte prima di essere restituita.** Il record deve portare la firma ed25519 del registry, verificata rispetto a una chiave pubblica del registry che fissi nel client, e la firma secp256k1 del proprietario sulla dichiarazione, la cui chiave pubblica deve avere come hash l'indirizzo `qor1` del record. Un record che non supera uno dei due controlli non viene mai restituito.
- **Il pin store è tuo.** `resolve` restituisce `pin.status` come `new`, `match` o `CHANGED` confrontando il record con un pin che possiedi, e non fissa mai nulla da solo. Fissi il pin dopo che l'utente ha visto l'indirizzo e ha proceduto. Lo scopo di un pin è accorgersi che il registry ha iniziato a dire qualcosa di diverso, quindi deve essere custodito da qualcuno diverso dalla parte controllata, per esempio sul dispositivo dell'utente.
- **Per una rete vengono restituiti solo indirizzi firmati dal proprietario.** `addressForNetwork(record, caip2)` restituisce l'indirizzo `qor1` per le reti QoreChain, e l'indirizzo `0x` per i chain ID 9800 e 9801 quando il record è un account unificato. Gli indirizzi su altre chain che il registry si limita ad attestare non vengono restituiti per l'invio.
- **Ricerca inversa solo per la visualizzazione.** `reverse(address)` restituisce un handle da mostrare nello storico. Il suo risultato non deve mai diventare la destinazione di un invio.
- **Claim e delete usano domini di firma separati.** `signClaim` e `signDelete` firmano messaggi diversi, quindi una firma di eliminazione non può essere riutilizzata come claim.

## Come usarli {#how-to-use}

### Chain bridge {#use-chain-bridge}

```bash
npm install @qorechain/chain-bridge
```

Porta con sé `@qorechain/wallet-adapter` (^0.4.0), `@qorechain/pqc` (^0.2.1), cosmjs 0.32 ed ethers 6. Non esiste un quickstart testato; lo snippet qui sotto segue le tipizzazioni del pacchetto e la [guida all'integrazione per exchange](/developer-guide/exchange-integration#chain-bridge). Il 27 ottobre 2026 il costruttore, `featureIdsFor` e l'elenco dei metodi sono stati verificati sul pacchetto 0.2.3 pubblicato; nessuna transazione è stata inviata.

```js
import { ChainBridge } from "@qorechain/chain-bridge";

const bridge = new ChainBridge({
  cosmosRpc: "https://rpc-testnet.qore.host",
  cosmosRest: "https://api-testnet.qore.host", // picks the sign-bytes form; required on both live networks
  chainId: "qorechain-diana",
  signerMnemonic: process.env.WORKER_MNEMONIC, // from your secrets manager, never in source code
});

// Once per account (the bridge also does it on first use if the chain reports no key).
await bridge.registerPqc({ mnemonic: process.env.WORKER_MNEMONIC });

// Amounts are in uqor (6 decimals): 1 QOR = 1000000.
const { txHash, code } = await bridge.sendTokens({ to: "qor1...", amountUqor: "1000000" });
```

Metodi principali:

| Metodo | Cosa fa | Chiave usata |
|---|---|---|
| `sendTokens({ to, amountUqor })` | bank `MsgSend`, firmato in modo ibrido | signer |
| `registerPqc({ mnemonic })` | `MsgRegisterPQCKeyV2`, classico | quell'account |
| `registerLightNode({ operatorMnemonic, nodeType, version, capabilities })` | registrazione del light node, firmata in modo ibrido | operatore |
| `grantLicense`, `grantLicenseSet`, `revokeLicense`, `suspendLicense`, `resumeLicense` | messaggi del modulo licenze | la chiave di autorità delle licenze della chain |
| `deployEvm({ bytecode, abi, args })` | un deploy in stile Ethereum tramite `eth_sendRawTransaction` | chiave del deployer |
| `deploySvm({ bytecode })` | deploy di programmi SVM | signer |
| `createVestingAccount`, `createPeriodicVestingAccount` | creazione di account di vesting | signer |
| `featureIdsFor`, `normalizeChain` | helper locali | nessuna |

Ogni chiamata restituisce `{ txHash, code, height, gasUsed }`, e una chiamata ibrida riporta anche `signBytesVersion`. Il prezzo del gas predefinito è 0,1 uqor per gas, che è il minimo della rete (un `sendTokens` da 300.000 gas costa 30.000 uqor a quel prezzo, e il default di 6.000.000 gas per una registrazione di chiave costa 600.000 uqor, che paghi una sola volta per account). La lane EVM usa 18 decimali: il `value` di `deployEvm` è in wei. Imposta `keyType: "eth_secp256k1"` nella configurazione per firmare con la chiave unificata eth-native (un'unica identità come `qor1`, `0x` e SVM) invece della chiave predefinita con coin type 118; quell'opzione è nel sorgente e nel README del wallet adapter ma non nelle tipizzazioni.

### Handle {#handles}

```bash
npm install @qorechain/handles
```

Le sue uniche dipendenze a runtime sono `@noble/curves`, `@noble/hashes` e `bech32`. Non esiste un quickstart testato. Lo snippet segue il README e le tipizzazioni del pacchetto; il 27 ottobre 2026 `isHandleInput`, `normalizeHandle` e l'elenco delle esportazioni sono stati verificati sul pacchetto 0.1.0 pubblicato, e nessun registry è stato contattato.

```ts
import { HandleClient, type PinStore } from "@qorechain/handles";

const client = new HandleClient({ baseUrl: registryUrl, registryPubkeyHex });

// You supply the pin store, ideally on the user's device.
const pins: PinStore = { get: (handle) => load(handle), put: (pin) => save(pin) };

const { record, pin } = await client.resolve("@alice", pins);

if (pin.status === "CHANGED") {
  // Stop. Show both addresses in full and require explicit confirmation.
  // Never update the pin silently.
}

// Show record.qorAddress to the user. When they proceed (and only then):
await client.pin(record, pins, Date.now());
```

`resolve` lancia un errore quando l'handle è sconosciuto, il registry non è raggiungibile o la risposta non supera la verifica. `isHandleInput(text)` distingue un handle da un indirizzo (un handle è di 3-20 caratteri tra `a-z`, `0-9` e `_`, oppure inizia con `@`; una stringa `qor1...` o `0x...` non è mai un handle). Altre esportazioni: `claimSignBytes`, `signClaim`, `deleteSignBytes`, `signDelete`, `verifyResolution`, `checkPin`, `QorexError`. Per come QoreX usa gli handle, vedi [Invia a un @handle](/qorex/browser-extension#handle-send) e [Account e Dashboard](/qorex/account-and-dashboard).

## Come accedere {#how-to-access}

- **Reti:** il chain bridge funziona sulla mainnet `qorechain-vladi` o sulla testnet `qorechain-diana` con gli endpoint elencati nella pagina [Pacchetti per sviluppatori](/developer-tools/overview#how-to-access) (l'RPC EVM e il chain ID 9800 o 9801 per `deployEvm`).
- **Prerequisiti del chain bridge:** Node.js 18 o successivo; un account con fondi di cui il tuo worker detiene il mnemonic (conservalo in un secrets manager); e l'URL REST della rete. La chiave ML-DSA-87 è derivata dal mnemonic e registrata al primo utilizzo, quindi l'account deve contenere abbastanza QOR per la commissione di quella registrazione.
- **Le chiamate sulle licenze** riescono solo se firmate con la chiave configurata nella chain come autorità delle licenze. Uno sviluppatore esterno non la possiede, quindi questi metodi sono per l'operatore di quella chiave. Per le licenze e la registrazione dei light node come utente, vedi [Registrazione e licenze](/light-node/registration-and-licensing).
- **Prerequisiti degli handle:** l'URL di base del registry e la sua chiave pubblica ed25519 (hex), un pin store che implementi tu e `fetch`. Le letture non richiedono alcun account.
- **Costo:** entrambi i pacchetti sono gratuiti. Le transazioni del chain bridge pagano la commissione di rete.

## Dove sono pubblicati {#where-published}

| Registry | Pacchetto | Versione | Link |
|---|---|---|---|
| npm | `@qorechain/chain-bridge` | 0.2.3 (pubblicato il 20 ottobre 2026) | [npmjs.com](https://www.npmjs.com/package/@qorechain/chain-bridge) |
| npm | `@qorechain/handles` | 0.1.0 (pubblicato in agosto 2026) | [npmjs.com](https://www.npmjs.com/package/@qorechain/handles) |

Entrambi sono Apache-2.0 e pubblicati solo su npm (non su PyPI, crates.io, Maven Central né sul Go proxy). Nessuno dei due riporta un repository sorgente nei metadati del registry, quindi non c'è una pagina sorgente pubblica da collegare; il codice è nel tarball pubblicato. Per leggere le versioni attuali, vedi [Come ottenere le versioni attuali](/developer-tools/overview#live-versions).

## Limiti e problemi noti {#limits}

### Chain bridge {#limits-chain-bridge}

- **I deploy EVM richiedono una finestra aperta.** `deployEvm` invia una transazione Ethereum standard. Dalla chain v3.2.0 la lane EVM ammette una transazione solo da un account con una chiave ML-DSA-87 registrata e una finestra di autorizzazione EVM aperta, e il bridge non ha alcun metodo che ne apra una. Apri la finestra con altri strumenti (il [wallet adapter](/developer-tools/wallet-adapter#evm-window), l'SDK o QoreX) prima di chiamarlo, altrimenti la transazione viene rifiutata (codespace `pqc`, codice 26, 27 o 28). Questo segue le regole della chain e il sorgente del pacchetto; non è stato provato su una rete live per questa pagina. Il README del pacchetto definisce ancora esente la lane EVM, il che è obsoleto.
- **`deploySvm`** è rivolto alla lane SVM, che non accetta ancora transazioni su nessuna delle due reti.
- **I metodi di caricamento dei contratti esistono ma non sono documentati.** Il sorgente ha anche `storeWasm`, `instantiateWasm` e `deployWasm` per i contratti QoreChain Native, che non sono nelle tipizzazioni né nel README. Il caricamento è riservato alla governance per gli account ordinari sulle reti live, quindi aspettati un rifiuto per un account ordinario.
- **La chiave è derivata sul server.** Il mnemonic resta nel tuo processo. Tienilo fuori dai log e dal controllo di versione, e non riutilizzarlo come wallet personale.
- **Una registrazione non è gratuita.** Il bridge registra la chiave da solo al primo utilizzo; un rail che sposta fondi dovrebbe registrarla in anticipo e confermare il risultato con `GET /qorechain/pqc/v1/account/{address}` prima del primo prelievo.
- **cosmjs 0.32.** Non installarlo accanto all'SDK (cosmjs 0.39) nello stesso progetto; npm segnala `ERESOLVE`.
- **Parti obsolete del README.** Il README dice che la mainnet resta sulla prima forma dei sign-bytes; entrambe le reti verificano v2 (vedi [Sicurezza Post-Quantistica](/architecture/post-quantum-security)).
- **Nessun quickstart testato, nessun repository sorgente pubblico.**

### Handle {#limits-handles}

- **L'indirizzo e la chiave pubblica del registry non sono pubblicati** nel pacchetto né in questo manuale. QoreX e la dashboard li hanno integrati, quindi un integratore può usare il pacchetto solo se gli vengono forniti questi due valori.
- **Gli handle non sono nomi on-chain.** Il registry è un servizio off-chain gestito per QoreX; il pacchetto verifica le sue risposte ma non può renderlo disponibile. Se il registry non è raggiungibile, `resolve` lancia un errore `NETWORK_UNAVAILABLE`, e `isReachable()` è una verifica rapida che una UI può usare per nascondere le funzioni degli handle.
- **Non fissa nulla per te.** Se non chiami mai `pin`, ogni risoluzione riporta `new`. Chi chiama è responsabile di conservare i pin in modo sicuro.
- **Per l'invio si usano solo indirizzi firmati dal proprietario.** Gli indirizzi su altre chain che il registry attesta non vengono restituiti da `addressForNetwork`.
- **Le chiamate di scrittura richiedono più del pacchetto.** `claim`, `deleteHandle` e `bySub` dialogano con gli endpoint di scrittura del registry e richiedono una firma del proprietario (`signClaim`, `signDelete`) o un token di account; sono pensate per le app wallet.
- **Nessun quickstart testato, nessun repository sorgente pubblico.**
