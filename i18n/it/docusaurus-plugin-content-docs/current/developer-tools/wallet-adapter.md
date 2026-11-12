---
slug: /developer-tools/wallet-adapter
title: Wallet Adapter
sidebar_label: Wallet adapter
sidebar_position: 2
---

# Wallet adapter (`@qorechain/wallet-adapter`)

`@qorechain/wallet-adapter` aggiunge QoreChain ai wallet Cosmos che espongono `signDirect` (Keplr, Leap, Cosmostation) e costruisce le transazioni richieste dalla chain: una transazione sulla lane nativa deve portare una firma ML-DSA-87 (FIPS 204) accanto alla firma classica secp256k1 dell'account, e un wallet standard non può produrre quella ML-DSA-87. L'adapter la produce, la inserisce nel corpo della transazione e poi chiede al wallet invariato una firma ordinaria. È pensato per sviluppatori di dApp e wallet, e per chi costruisce strumenti che hanno bisogno in JavaScript di wallet QoreChain unificati, messaggi della finestra di autorizzazione EVM o messaggi per chiavi collegate (authenticator). La versione attuale è la 0.6.0 (12 novembre 2026).

Se ti serve solo che una dApp invii una transazione dal wallet QoreX di un utente, la strada più breve è [`qorexSignAndBroadcast`](#qorex) in questo pacchetto, oppure i pacchetti QoreX elencati nell'indice [Pacchetti per sviluppatori](/developer-tools/overview#group-qorex). Se stai scrivendo un wallet e vuoi una libreria di firma completa in cinque linguaggi, leggi prima [QoreSign](/qoresign/overview).

## Innovazioni {#innovations}

- **Il wallet firma un corpo ordinario.** L'adapter costruisce il corpo senza l'estensione, firma il livello ML-DSA-87 sui sign-bytes, lo inserisce nel corpo come opzione di estensione `/qorechain.pqc.v1.PQCHybridSignature` (id algoritmo 1), e solo allora chiama `wallet.signDirect` sul `SignDoc` finito. Il wallet produce una firma `SIGN_MODE_DIRECT` standard e non ha bisogno di alcun codice specifico di QoreChain. Il risultato sono i consueti byte `TxRaw`.
- **Selettore dei sign-bytes per rete.** La chiave ML-DSA-87 firma una di due forme di byte e una rete ne verifica esattamente una a ogni altezza. Con `signBytesVersion: "auto"` (il valore predefinito) il firmatario chiede al nodo `GET /cosmos/upgrade/v1beta1/applied_plan/{name}` per `v3.2.0` e poi per `v3.1.98`, firma la forma v2 (tag di dominio `qorechain-pqc-hybrid-v2` più il chain ID) se una delle due altezze è superiore a zero, mette in cache la risposta per 60 secondi per URL REST e chain ID, e lancia un errore invece di tirare a indovinare quando non può chiedere. Verificato il 27 ottobre 2026 sui nodi live: mainnet e testnet risolvono entrambe in `v2`, e una chiamata per `qorechain-vladi` senza `rest` lancia un errore. `refreshSignBytesVersion()` salta la cache e `isHybridSignBytesRejection()` riconosce il rifiuto con codice `pqc` 21, così chi chiama può risolvere di nuovo e riprovare una volta quando una rete viene aggiornata mentre un wallet è aperto.
- **Una chiave ML-DSA-87 per mnemonic, condivisa tra gli strumenti.** `walletFromMnemonic` deriva la chiave come `SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)` data in input alla generazione di chiavi ML-DSA-87. È legata all'indirizzo dell'account ed è la stessa derivazione usata dall'SDK, da `@qorechain/chain-bridge`, da QoreX e dal comando `qorechaind tx pqc recover-key`, quindi un mnemonic dà una sola chiave a prescindere dallo strumento che firma. Vedi [Derivazione deterministica della chiave e recupero](/developer-guide/post-quantum-signing#key-derivation).
- **Un account, tre forme di indirizzo, una chiave di firma.** `generateQoreWallet` e `walletFromMnemonic` restituiscono insieme le forme `qor1`, `0x` (EIP-55) e base58 SVM della stessa identità di 20 byte, con la coppia di chiavi ML-DSA-87. `signClassicalEth` e `signHybridEth` firmano le transazioni della lane Cosmos con quella chiave eth-native (`eth_secp256k1`), quindi la stessa chiave firma anche le transazioni EVM altrove.
- **Codici di recupero PQC.** `generatePqcRecoveryCode` restituisce un segreto casuale a 256 bit formattato come `QRC1-` più base32 Crockford con un checksum a 24 bit. `pqcKeyFromRecoveryCode(code, address)` ne deriva la chiave ML-DSA-87, legata all'indirizzo. Un carattere digitato male viene rifiutato con un messaggio invece di derivare in silenzio una chiave che non corrisponde a nulla, e il codice non è volutamente una frase seed.
- **QoreX come firmatario.** `qorexSignAndBroadcast` invia messaggi codificati in protobuf (da 1 a 32 per chiamata, memo fino a 256 byte, limite di gas da 100.000 a 5.000.000) al wallet QoreX dell'utente, che li mostra decodificati, aggiunge il livello ML-DSA-87 che solo il wallet può produrre, firma ed esegue il broadcast. L'adapter controlla localmente i limiti e rifiuta i messaggi di gestione delle chiavi PQC (`MsgRegisterPQCKey`, `MsgRegisterPQCKeyV2`, `MsgMigratePQCKey`, `MsgRotatePQCKey`), anche all'interno di un `MsgExec` authz a qualsiasi profondità. Un `MsgExec` che non riesce a decodificare viene rifiutato. Dalla 0.5.0 il controllo della richiesta è più severo: `validateQorexRequest` e `qorexSignAndBroadcast` rifiutano anche, direttamente e all'interno di un `MsgExec` authz, i messaggi per chiavi KEM, multisig e autorità dell'account (`MsgRegisterKEMKey`, `MsgRemoveKEMKey`, `MsgRegisterPQCMultisig`, `MsgRegisterAuthenticator`, `MsgRevokeAuthenticator`, `MsgUpdateSpendingRules`, `MsgCreateAbstractAccount`, `MsgOpenEVMWindow`, `MsgCloseEVMWindow`, `MsgAuthorizeEVMDelegation`, `MsgClearEVMDelegation`). Questi restano sulle schermate di QoreX.
- **Elementi costitutivi per la finestra di autorizzazione EVM, mai una finestra automatica.** `openEvmWindowMsg`, `closeEvmWindowMsg`, `fetchEvmWindow`, `parseEvmWindow` e `isEvmWindowRejection` coprono la finestra che deve essere aperta prima di un invio EVM. Ogni limite (`blocks` da 1 a 17.280, `maxTxs` da 1 a 1.000, `maxValue` superiore a zero) è obbligatorio e controllato lato client senza valore predefinito, i campi di stato della finestra sono BigInt, e il pacchetto non apre mai una finestra da solo: l'utente deve vedere un passaggio di autorizzazione esplicito.
- **Messaggi per chiavi collegate (authenticator) con digest esatti rispetto alla chain.** `registerAuthenticatorMsg`, `registerEthAuthenticatorMsg`, `buildPhantomExecuteEvm`, `buildPhantomExecuteCosmos`, `buildMetaMaskExecuteEvm` e `buildMetaMaskExecuteCosmos` costruiscono i messaggi che permettono a una chiave Phantom o MetaMask di spendere da un account QoreChain sotto un insieme di permessi e una regola di spesa. `evmAuthSignBytesV2` è il digest dalla chain v3.2.3, che lega anche il limite di gas della chiamata (deve essere diverso da zero). Il nonce è la sequenza authenticator della chiave collegata, non il nonce EVM dell'account. Vedi [Authenticator e spesa delegata](/sdk/guides/authenticators).
- **Rotazione sicura delle chiavi.** `rotateFromLegacyWalletKey` costruisce un `MsgRotatePQCKey` che si allontana da una chiave creata con la derivazione da firma del wallet ormai ritirata, e rifiuta se la chiave che ri-deriva non coincide con quella registrata. `rotatePqcKeyMsgFromMnemonic` sposta una chiave legacy `SHAKE-256(mnemonic)` sulla chiave canonica legata all'indirizzo, e rifiuta la derivazione legacy come nuova chiave.

## Come usarlo {#how-to-use}

Installa l'adapter con i due peer cosmjs (versione 0.32):

```bash
npm install @qorechain/wallet-adapter @cosmjs/stargate @cosmjs/proto-signing
```

Il pacchetto è un modulo ES in JavaScript semplice con tipizzazioni TypeScript. Il manifest non ha un quickstart testato per esso. Gli snippet qui sotto provengono dalle tipizzazioni e dal sorgente del pacchetto; il 27 ottobre 2026 la generazione del wallet, il risolutore dei sign-bytes, la lettura dello stato della finestra EVM, `openEvmWindowMsg` e l'errore della funzione ritirata sono stati eseguiti sul pacchetto 0.4.0 pubblicato e sugli endpoint REST live di testnet e mainnet, e i 102 test del pacchetto passano. Gli snippet di firma e di QoreX non sono stati eseguiti end to end.

### Generare un wallet unificato {#unified-wallet}

```js
import { generateQoreWallet, walletFromMnemonic } from "@qorechain/wallet-adapter";

const w = await generateQoreWallet();           // random 24-word mnemonic
// const w = await walletFromMnemonic(mnemonic); // or recover one
console.log(w.cosmos); // qor1...   (bech32)
console.log(w.evm);    // 0x...     (EIP-55)
console.log(w.svm);    // base58 form of the same 20 bytes
// w.privateKey, w.pubkey, w.pqc = { publicKey (2592 bytes), secretKey }
```

`walletFromSeed(seed, opts)` costruisce lo stesso wallet a partire da 32 byte segreti: il seed diventa la chiave privata secp256k1, quindi deve provenire da una fonte casuale sicura o da una funzione di derivazione di chiavi applicata a materiale che solo l'utente possiede. Non derivarlo mai da una firma che un sito web può chiedere a un wallet di produrre. Dalla 0.5.0 la chiave ML-DSA-87 non viene presa dal seed: passi anche `{ recoveryCode }` (un codice `QRC1`) oppure `{ pqcSecret }` (32 byte casuali).

```js
import { walletFromSeed, generatePqcRecoveryCode } from "@qorechain/wallet-adapter";

const recoveryCode = generatePqcRecoveryCode(); // una sola volta; conservalo separato dal seed
const w = await walletFromSeed(seed32, { recoveryCode });
// oppure: await walletFromSeed(seed32, { pqcSecret })  // 32 byte casuali, indipendenti dal seed
```

Conserva il codice di recupero (o il segreto PQC): uno diverso dà una chiave diversa. Un segreto PQC uguale al seed viene rifiutato, e i wallet creati da un mnemonico non cambiano. `{ legacySeedDerivation: true }` esiste solo per recuperare la chiave di un vecchio wallet da percorso seed così da poterla ruotare; non usarlo per i nuovi wallet.

### Registrare la chain nei wallet dell'utente {#register-chain}

```js
import { qoreChainInfo, addQoreEvmToWallet } from "@qorechain/wallet-adapter";

// Keplr and other Cosmos wallets. chainId defaults to the testnet, so pass it for mainnet.
await window.keplr.experimentalSuggestChain(
  qoreChainInfo({ chainId: "qorechain-vladi", rpc: "https://rpc.qore.host", rest: "https://api.qore.host" }),
);
await window.keplr.enable("qorechain-vladi");

// MetaMask and other EIP-1193 wallets (18-decimal native currency on the EVM lane).
await addQoreEvmToWallet(window.ethereum, {
  evmChainId: 9801, testnet: false, rpcUrl: "https://evm.qore.host",
});
```

`qoreChainInfo` usa coin type 118, prefisso bech32 `qor`, denom `uqor` con 6 decimali e uno scaglione di prezzo del gas di 0,1, 0,15 e 0,25 uqor per gas, che rispetta il minimo di commissione di 0,1 uqor per gas. `addQoreEvmToWallet` richiede `rpcUrl`.

### Firmare una transazione ibrida con un wallet Cosmos {#sign-hybrid}

```js
import { QoreChainSigner, pqcKeyFromRecoveryCode } from "@qorechain/wallet-adapter";

const signer = window.keplr.getOfflineSigner("qorechain-vladi");
const [account] = await signer.getAccounts();

// The account's ML-DSA-87 keypair, from a recovery code. Use this in a wallet or tool that
// legitimately owns the key; a web page should send its messages to QoreX instead (see below).
const pqc = await pqcKeyFromRecoveryCode(userRecoveryCode, account.address);

const adapter = new QoreChainSigner({
  wallet: window.keplr,
  chainId: "qorechain-vladi",
  address: account.address,
  pubkeySecp256k1: account.pubkey,
  accountNumber,                 // from GET /cosmos/auth/v1beta1/accounts/{address}
  pqc,
  rest: "https://api.qore.host", // lets the signer pick the sign-bytes form this network verifies
});

const txRaw = await adapter.signHybrid({ messages, fee, sequence }); // TxRaw bytes, with .signBytesVersion
// broadcast txRaw yourself (RPC broadcast_tx_sync or REST /cosmos/tx/v1beta1/txs)
```

Cose da sapere:

- L'adapter firma; il broadcast lo fai tu. Non costruisce il messaggio di registrazione della chiave. Registra una volta la chiave ML-DSA-87 dell'account con [QoreSign](/qoresign/quickstart) (`buildRegisterPqKeyMessage`), l'SDK o la CLI (vedi [Registrare la tua chiave](/developer-guide/post-quantum-signing#pqc-key-registration)); quella prima transazione è quella che può essere firmata in modo classico.
- Una pagina web che detiene la chiave ML-DSA-87 dell'account è un design da evitare. `derivePqcKeyFromWallet`, che un tempo la derivava da una firma del wallet, è stata ritirata nella 0.3.0 e lancia sempre un errore. Una dApp dovrebbe inviare i messaggi a QoreX (sotto) e lasciare che sia il wallet a firmare.
- Se un broadcast viene rifiutato con il codice `pqc` 21 e hai usato `"auto"`, chiama `adapter.refreshSignBytesVersion()` e firma ancora una volta; non riprovare se hai passato un `"v1"` o `"v2"` esplicito. Vedi [Risoluzione dei problemi del codice 21](/developer-guide/post-quantum-signing#code-21).

### Inviare tramite QoreX {#qorex}

```js
import {
  hasQorexSignAndBroadcast, qorexSignAndBroadcast, isQorexRejection,
} from "@qorechain/wallet-adapter";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx.js";

if (!hasQorexSignAndBroadcast()) throw new Error("Install or update QoreX");

try {
  const { txHash, code } = await qorexSignAndBroadcast({
    chainId: "qorechain-vladi",   // must equal the wallet's active network
    messages: [{
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: MsgSend.encode(MsgSend.fromPartial({ fromAddress, toAddress, amount })).finish(),
    }],
    gasLimit: 300_000,            // optional, 100,000 to 5,000,000
  });
  if (code !== 0) throw new Error(`rejected by the chain with code ${code}`);
} catch (err) {
  if (isQorexRejection(err)) return; // the user declined; not a failure
  throw err;
}
```

`value` è costituito da byte protobuf (un `Uint8Array`, un array di numeri o base64), firmati esattamente come forniti. Una dApp non può cambiare la rete del wallet. Richiede l'estensione QoreX 0.3.5 o l'app 1.1.5 o successive; verifica con `hasQorexSignAndBroadcast()` invece di un controllo di versione. Il contratto a livello wire è in [Estensione Browser QoreX](/qorex/browser-extension#sign-and-broadcast).

### Costruire un messaggio per la finestra EVM {#evm-window}

```js
import { openEvmWindowMsg, fetchEvmWindow } from "@qorechain/wallet-adapter";

const status = await fetchEvmWindow({ rest: "https://api.qore.host", address: qor1 });
if (!status.live) {
  const msg = openEvmWindowMsg({
    sender: qor1,
    blocks: 300,        // 1 to 17280
    maxTxs: 3,          // 1 to 1000
    maxValue: "250000", // uqor: value plus the maximum fee of each admitted transaction
  });
  // sign it with signHybrid (or signHybridEth) and broadcast: it is an ordinary Cosmos-lane message
}
```

L'ordine conta: apri la finestra, poi leggi il nonce EVM, poi firma la transazione EVM, perché aprire una finestra fa avanzare la sequenza dell'account, che è anche il suo nonce EVM. Dalla 0.6.0, `openEvmWindowMsg` accetta anche l'ambito della finestra: `nativeOnly`, `allowedTargets` e, su una rete che esegue la chain v3.2.8, `validators`, `stakingValidators` e `ibcReceivers`. Approfondimenti: [Finestra di autorizzazione EVM](/sdk/guides/evm#evm-window) e [La tua prima transazione](/getting-started/first-transaction#evm-window).

### Altri punti d'ingresso

| Compito | Funzioni |
|---|---|
| Recuperare o ruotare una chiave PQC | `generatePqcRecoveryCode`, `pqcKeyFromRecoveryCode`, `pqcKeyFromSecret`, `pqcRecoveryCodeFromSecret`, `isValidRecoveryCode`, `rotatePqcKeyMsgFromMnemonic`, `rotateFromLegacyWalletKey`, `rotatePqcKeyMsg` |
| Firmare con la chiave eth-native | `signClassicalEth` (la registrazione classica della chiave), `signHybridEth` |
| Helper dei sign-bytes | `hybridSignBytes(version, chainId, body, authInfo)`, `resolveSignBytesVersion`, `signBytesVersionFor`, `SIGN_BYTES_V2_UPGRADES` |
| Collegare e spendere con una chiave esterna | `linkAuthenticatorMsgs`, `registerAuthenticatorMsg`, `registerEthAuthenticatorMsg`, `revokeAuthenticatorMsg`, le funzioni `buildPhantom*` e `buildMetaMask*` |

## Cosa cambia la 0.6.0 {#whats-new-060}

La 0.6.0 (12 novembre 2026) aggiunge il supporto per la chain v3.2.8 (la testnet la esegue dal 12 novembre 2026; la mainnet non l'ha applicata). Le nuove regole valgono su una rete una volta che esegue la v3.2.8.

**Modifiche incompatibili.**

- `registerAuthenticatorMsg` e `registerEthAuthenticatorMsg` richiedono `possessionProof`: la chiave che viene collegata firma un messaggio di collegamento in chiaro che nomina la chain, l'account, lo schema e la chiave. Una chiamata senza prova lancia un errore.
- `decodeEvmWindowMsg` restituisce i nuovi campi di ambito (liste vuote e `nativeOnly: false` quando assenti).
- `buildPhantomSvmEnvelope` e `buildPhantomTransfer` scelgono la forma da firmare: passa `rest` e `chainId`, oppure `svmAuthVersion: "v2" | "v3"`. Senza nessuno dei due lanciano un errore invece di firmare una forma che la rete potrebbe rifiutare.

**Nuove funzioni.**

| Compito | Funzioni |
|---|---|
| Collegamento delle chiavi | `authenticatorLinkMessage`, `phantomPossessionProof`, `metaMaskPossessionProof` |
| Regola di spesa per una chiave che muove valore | `spendingRuleBoundsEveryDenom`, `updateSpendingRulesMsg`, `linkAuthenticatorMsgs` (la regola di spesa e il collegamento in un'unica transazione firmata dal proprietario) |
| Risultati di esecuzione | `authenticatorExecutionResults`, `assertAuthenticatorExecutionsSucceeded`: leggono `success=false` da `MsgExecuteEVM` o `MsgExecuteCosmos` dentro una transazione con codice 0 |
| Ambito della finestra EVM | `openEvmWindowMsg` accetta `nativeOnly`, `allowedTargets`, `validators`, `stakingValidators` e `ibcReceivers`; `validateEvmWindowScope` li controlla |
| Autorizzazione SVM | `authSignBytesV3` (il digest legato alla chain che una rete verifica quando abilita `svm-relayed-chain-bound`) e `resolveSvmAuthVersion({ rest })`, che restituisce `"v3"` o `"v2"` |

Il controllo delle richieste QoreX rifiuta anche un `MsgGrant` di authz il cui `GenericAuthorization` nomina un messaggio che esso rifiuta, e un `MsgGrant` che non riesce a decodificare.

Una chiave con il permesso `send`, `evm`, `deploy`, `svm` o `all` richiede che la prima regola di spesa abilitata dell'account limiti ogni denom; altrimenti `linkAuthenticatorMsgs` rifiuta la coppia. `rules` sostituisce per intero le regole dell'account, quindi passale tutte quelle da mantenere. Collega una chiave MetaMask (questo snippet deriva dalle tipizzazioni e dal sorgente della 0.6.0; non è stato eseguito):

```js
import {
  registerEthAuthenticatorMsg,
  metaMaskPossessionProof,
  linkAuthenticatorMsgs,
} from "@qorechain/wallet-adapter";

const possessionProof = await metaMaskPossessionProof({
  provider: window.ethereum,
  address: ethAddress,        // the 0x address being linked
  chainId: "qorechain-diana",
  account: qor1,
});

const registerMsg = registerEthAuthenticatorMsg({
  owner: qor1,
  ethAddress,
  permissions: ["evm"],
  expiryUnix,
  possessionProof,
});

// The spending rule and the link, in order, for one owner-signed transaction.
const msgs = linkAuthenticatorMsgs({
  registerMsg,
  rules: [{ enabled: true, perTxLimit: "1000000", allowedDenoms: ["uqor"] }],
});
```

## Cosa cambia la 0.5.0 {#whats-new-050}

La 0.5.0 (11 novembre 2026) ha una modifica incompatibile. `walletFromSeed(seed, opts)` richiede `{ recoveryCode }` (un codice `QRC1`) oppure `{ pqcSecret }` (32 byte casuali); `{ legacySeedDerivation: true }` serve solo a recuperare una vecchia chiave per poterla ruotare, e un segreto PQC uguale al seed viene rifiutato. I wallet creati da un mnemonico non cambiano. Nuove funzioni: `pqcKeyFromSecret`, `pqcRecoveryCodeFromSecret` e `generatePqcRecoveryCode`. Il controllo delle richieste QoreX è più severo (vedi [Invio tramite QoreX](#qorex)).

## Come accedere {#how-to-access}

- **Reti:** mainnet `qorechain-vladi` e testnet `qorechain-diana`. Passa `chainId` e l'URL `rest` corrispondente ([endpoint](/developer-tools/overview#how-to-access)).
- **Wallet:** Keplr è il wallet usato dalla guida di QoreSign e dagli esempi ([wallet compatibili con Keplr](/qoresign/guides/keplr-compatible-wallets)). Leap e Cosmostation espongono la stessa interfaccia `signDirect` e il pacchetto è scritto per qualsiasi wallet di questo tipo; non è stato verificato su di essi per questa pagina. MetaMask usa la lane EVM, non il firmatario dell'adapter, e richiede una finestra EVM aperta per ogni invio ([Pacchetti per sviluppatori](/developer-tools/overview#how-to-access)). Phantom si collega come authenticator.
- **Account e chiave:** un account con QOR sufficienti per la commissione, e la chiave ML-DSA-87 dell'account registrata on-chain prima della prima transazione ibrida.
- **Prerequisiti:** Node.js con moduli ES, oppure un bundler per il browser. Dipendenze peer `@cosmjs/stargate` e `@cosmjs/proto-signing` `^0.32`. Dipendenze di runtime: `@qorechain/pqc` `^0.2.1`, `cosmjs-types` `^0.9.0`, `@cosmjs/crypto` e `@cosmjs/encoding` `^0.32`.
- **Costo:** il pacchetto è gratuito; le transazioni pagano la commissione di rete a 0,1 uqor per gas o più. Registrare una chiave usa un limite di gas elevato perché la chiave pubblica ML-DSA-87 è di 2.592 byte.

## Dove è pubblicato {#where-published}

| Registry | Pacchetto | Versione | Link |
|---|---|---|---|
| npm | `@qorechain/wallet-adapter` | 0.6.0 (pubblicato il 12 novembre 2026) | [npmjs.com](https://www.npmjs.com/package/@qorechain/wallet-adapter) |

Sorgente: [github.com/qorechain/qorechain-wallet-adapter](https://github.com/qorechain/qorechain-wallet-adapter) (pubblico, tag `v0.6.0`, Apache-2.0). Non è pubblicato su PyPI, crates.io, Maven Central né sul Go proxy. Correlati: [Pacchetti per sviluppatori](/developer-tools/overview), [QoreSign](/qoresign/overview), [Firma Post-Quantistica](/developer-guide/post-quantum-signing), [Guida per exchange e integratori](/developer-guide/exchange-integration).

## Limiti e problemi noti {#limits}

- **Firma; non esegue broadcast, non registra chiavi e non apre finestre.** Non esiste alcuna funzione che registri la chiave ML-DSA-87, e nulla apre una finestra EVM al posto tuo.
- **Prova di possesso.** Prima della 0.6.0 una registrazione di chiave fatta con questo pacchetto non ne portava alcuna. Dalla 0.6.0 le funzioni di collegamento ne richiedono una (vedi [Cosa cambia la 0.6.0](#whats-new-060)); la chain rifiuta un collegamento che ne è privo una volta che esegue la v3.2.8, e verifica la prova quando è presente sulle reti precedenti ([Prova di possesso](/developer-guide/post-quantum-signing#proof-of-possession)).
- **`derivePqcKeyFromWallet` è ritirata** (0.3.0) e lancia sempre un errore. Gli account che hanno registrato una chiave con essa dovrebbero ruotarla con `rotateFromLegacyWalletKey`.
- **Ambito della finestra.** Prima della 0.6.0 `openEvmWindowMsg` non aveva campi di ambito; i campi `validators`, `stakingValidators` e `ibcReceivers` hanno effetto solo su una rete che esegue la chain v3.2.8.
- **`qoreChainInfo` usa la testnet come valore predefinito.** Passa sempre `chainId` per la mainnet.
- **Nonce degli authenticator.** Nessuna query espone ancora la sequenza authenticator della chiave collegata, quindi devi tenerne traccia tu; la chain risponde con `abstractaccount` codice 11 quando il valore è sbagliato. Il modulo authenticator è abilitato sulla testnet e disattivato sulla mainnet (vedi la [panoramica dell'SDK](/sdk/overview)).
- **Peer cosmjs 0.32.** L'SDK usa cosmjs 0.39; installare entrambi nello stesso progetto dà un errore `ERESOLVE`, quindi tienili separati oppure passa `--legacy-peer-deps`.
- **Non copiare dal README del pacchetto.** Dice ancora che la mainnet verifica la prima forma dei sign-bytes e che un invio MetaMask non richiede alcun passaggio aggiuntivo. Entrambe le affermazioni sono obsolete: entrambe le reti verificano v2, e un invio EVM richiede una chiave registrata e una finestra aperta.
- **Nessun quickstart testato** è registrato per questo pacchetto, e il percorso QoreX richiede il wallet installato, quindi non può essere eseguito in uno script.
