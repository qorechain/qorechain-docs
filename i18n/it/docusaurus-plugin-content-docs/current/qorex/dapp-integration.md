---
slug: /qorex/dapp-integration
title: Integrare una dApp con QoreX
sidebar_label: Integrazione dApp
sidebar_position: 8
---

# Integrare una dApp con QoreX

Questa è la guida completa per chi sviluppa e vuole che una web app funzioni con il wallet QoreX: come rilevarlo, connettersi, inviare transazioni QoreChain, firmare messaggi, usare EVM e Solana, gestire i rifiuti e generare link che aprono QoreX. Copre l'estensione per browser QoreX e il browser dApp integrato nell'app QoreX, e indica dove i due differiscono. Gli esempi di codice sono stati verificati con il codice del wallet stesso.

## Innovazioni {#innovations}

- **La pagina non ha mai la chiave post-quantistica.** `signAndBroadcast` riceve i tuoi messaggi; QoreX li mostra decodificati, aggiunge il livello ML-DSA-87 che solo il wallet può produrre, e trasmette. cosmjs, cosmos-kit e Interchain Kit funzionano senza modifiche tramite `getOfflineSigner`, e QoreX aggiunge lo stesso livello quando la transazione non lo ha.
- **Rilevamento per capacità, non per versione.** `window.qorex.native.capabilities` elenca cosa fa una build, così un unico percorso di codice funziona con ogni release.
- **Nulla viene sovrascritto.** QoreX si annuncia con EIP-6963 e con il Wallet Standard di Solana, non imposta mai `window.keplr` e non sovrascrive mai il `window.ethereum` di un altro wallet.
- **Firma di messaggi con una metà post-quantistica.** `signArbitrary` firma con la chiave classica dell'account (ADR-36) e con ML-DSA-87. Un server verifica entrambe con `@qorechain/qoresign` rispetto alla chiave registrata on-chain.
- **EVM su QoreChain, spiegato all'utente.** `personal_sign`, `eth_signTypedData_v4` ed `eth_sendTransaction` vengono decodificati sul dispositivo, simulati dove il nodo lo consente, e l'approvazione apre la finestra di autorizzazione per singola transazione richiesta dalla lane EVM di QoreChain.
- **Niente firma alla cieca, e un breve elenco di cose che un sito non può mai chiedere.** Un messaggio che QoreX non può mostrare viene rifiutato, e i messaggi riservati al wallet (gestione delle chiavi, regole di spesa, finestre, concessioni) vengono rifiutati a qualsiasi sito.
- **Link che un servizio può generare.** Aprire una pagina nell'app, chiedere un pagamento firmato dalla chiave del destinatario, o consegnare la proposta di un agente.

## Cosa inietta QoreX {#injected}

In ogni pagina, QoreX aggiunge un solo oggetto, `window.qorex`, con tre provider:

| Provider | Che cos'è |
|---|---|
| `window.qorex.native` | La lane QoreChain (Cosmos). In stile Keplr: `enable`, `getKey`, `signAndBroadcast`, `signDirect`, `signArbitrary`, `verifyArbitrary`, `getOfflineSigner*`, più un elenco `capabilities`. Non è un sostituto diretto di Keplr. |
| `window.qorex.evm` | Un provider EIP-1193 per la lane EVM di QoreChain (e, nell'estensione, per Ethereum). Annunciato anche tramite EIP-6963. |
| `window.qorex.svm` | Un provider Solana. Nell'estensione, le dApp Solana di norma trovano QoreX tramite il Wallet Standard. |

Cosa QoreX non fa:

- Non imposta mai `window.keplr`. Il codice che cerca Keplr non troverà QoreX; rileva invece `window.qorex`.
- Non sovrascrive mai `window.ethereum`. L'estensione non lo imposta affatto. Il browser integrato nell'app imposta `window.ethereum` solo quando nessun altro wallet lo ha fatto. Scegli QoreX in base al suo nome EIP-6963, non tramite `window.ethereum`.
- `signAmino` e `sendTx` non esistono (vedi [cosmjs](#cosmjs)).

## Rilevare QoreX {#detection}

**EVM.** Ascolta gli annunci EIP-6963 e scegli quello il cui `rdns` è `network.qore.qorex`:

```ts
const wallets = new Map<string, EIP6963ProviderDetail>();
window.addEventListener("eip6963:announceProvider", (event) => {
  const detail = (event as CustomEvent<EIP6963ProviderDetail>).detail;
  wallets.set(detail.info.rdns, detail);
});
window.dispatchEvent(new Event("eip6963:requestProvider"));

const qorex = wallets.get("network.qore.qorex"); // undefined when QoreX is not there
```

**Lane nativa di QoreChain.** Controlla `window.qorex?.native` e leggine le capacità. Controlla queste invece di un numero di versione:

```js
const native = window.qorex?.native;
const can = (name) => native?.capabilities?.includes(name) === true;
```

| Capacità | Estensione | App |
|---|---|---|
| `signAndBroadcast` | 0.3.5 | 1.2.1 (metodo presente dalla 1.1.5) |
| `signDirectAddsPqcLayer` | 0.4.0 | 1.2.1 (comportamento dalla 1.2.0) |
| `signArbitrary` | 0.4.0 | 1.2.1 (metodo presente dalla 1.2.0) |
| `listAccounts`, `connectProofPicksAccount`, `executeRequest` | 0.3.x | non nell'app |

L'app 1.2.0 ha i metodi ma non dichiara alcuna capacità; per coprirla, ripiega su `typeof window.qorex?.native?.signArbitrary === "function"`. `executeRequest` è il bridge della Dashboard, che funziona solo per `dashboard.qorechain.io` (vedi [Bridge della Dashboard](/qorex/browser-extension#dashboard-bridge)); agli altri siti non serve. Le build 1.2.5 e 0.4.5 dichiarano le stesse capacità di prima.

**Estensione o app.** Una pagina non può chiedere con quale dei due sta parlando, e non dovrebbe averne bisogno. Le differenze che contano sono nella tabella qui sotto.

| | Estensione (desktop) | App (browser dApp integrato) |
|---|---|---|
| Lane nativa di QoreChain | sì | sì |
| Firma EVM su QoreChain | sì | sì |
| EVM su Ethereum (`wallet_switchEthereumChain` a `0x1`, per sito) | sì | no, solo la rete QoreChain attiva |
| Eventi EVM (`connect`, `accountsChanged`, `chainChanged`) | tutti e tre | solo `connect`: il browser viene chiuso per cambiare account o rete |
| Solana (Wallet Standard) | sì | no, il browser integrato non firma transazioni Solana |
| Bridge della Dashboard (`connectProof`, `executeRequest`) | sì, solo `dashboard.qorechain.io` | no |
| Aprire una pagina da un link | non applicabile | link `browse` (vedi [Link](#links)) |

Vedi [Estensione per browser](/qorex/browser-extension) e [Browser dApp](/qorex/dapp-browser) per il lato utente di ciascuno.

## Connettersi {#connect}

La connessione richiede un'approvazione per sito, che rivela solo l'indirizzo pubblico:

```js
await window.qorex.native.enable("qorechain-vladi"); // once per site; mainnet chain id
const key = await window.qorex.native.getKey("qorechain-vladi");
// key.bech32Address is the qor1... address; key.algo is "secp256k1", or "ethsecp256k1" for a coin-60 account
```

EVM:

```js
const [account] = await qorex.provider.request({ method: "eth_requestAccounts" });
```

`eth_accounts` restituisce un elenco vuoto finché l'utente non ha approvato il sito, e non apre mai una finestra di propria iniziativa. `enable` ed `eth_requestAccounts` invece aprono il wallet quando è bloccato (vedi [Wallet bloccato](#locked)).

L'estensione emette un evento sulla finestra, `qorex_keystorechange`, quando cambiano l'account, il wallet o la rete. Le approvazioni sono conservate per wallet e l'utente può revocare un sito in qualsiasi momento in **Siti collegati**.

## Inviare una transazione QoreChain: `signAndBroadcast` {#sign-and-broadcast}

Ogni transazione QoreChain da un account con una chiave post-quantistica registrata deve portare una firma ibrida: secp256k1 **e** ML-DSA-87. Solo il wallet custodisce la chiave ML-DSA, quindi una pagina non può costruire da sé quella firma. Invia i messaggi e QoreX fa il resto:

1. mostra all'utente i messaggi decodificati e la commissione,
2. costruisce la transazione per l'account che l'utente ha selezionato,
3. aggiunge la firma ibrida (registrando prima la chiave post-quantistica dell'account se è la sua prima transazione),
4. trasmette, e risolve con il risultato.

```js
const provider = window.qorex.native;
if (!provider.capabilities?.includes("signAndBroadcast")) {
  throw new Error("Please update QoreX");
}
await provider.enable("qorechain-vladi");              // connect, once per site

const res = await provider.signAndBroadcast({
  chainId: "qorechain-vladi",                          // must be the wallet's active network
  messages: [
    {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: MsgSend.encode(msgSend).finish(),         // protobuf bytes: Uint8Array,
    },                                                 // number[] or a base64 string
  ],
  memo: "",                                            // optional, at most 256 bytes
  gasLimit: 300000,                                    // optional: 100k to 5M, default 400k
});
// res = { txHash, code, height?, shield }
```

`shield` ti dice se la transazione confermata porta il livello ibrido: `shielded` quando lo porta, `downgraded` quando è stata confermata senza (segnala questo caso), e `pending` o `classical` negli altri casi.

**Regole**

- `chainId` deve coincidere con la rete attiva del wallet: `qorechain-vladi` (mainnet) oppure `qorechain-diana` quando l'utente è passato alla testnet. Una mancata corrispondenza viene rifiutata con un messaggio che nomina entrambe. **Una dApp non può cambiare rete** (vedi [Testnet](#testnet)).
- Da 1 a 32 messaggi per chiamata. I byte dei messaggi vengono firmati esattamente come li invii; il wallet non li ricodifica.
- Un memo di al massimo 256 byte viene mostrato nella schermata di approvazione; le interruzioni di riga e i caratteri di controllo al suo interno sono mostrati con i loro codici.
- I messaggi riservati al wallet vengono rifiutati (vedi [Messaggi che un sito non può mai richiedere](#wallet-only)).
- QoreX non firma un messaggio che non può mostrare. Una tale richiesta viene rifiutata con `QoreX cannot show what <type> does, so it will not sign it`, anche all'interno di `MsgExec`. Usa un tipo di messaggio che QoreX sa decodificare.

**Gas e commissione**

- La commissione è `gasLimit` moltiplicato per il prezzo del gas della rete (QoreX segue il minimo corrente della rete), mostrata prima che l'utente approvi.
- Il tuo `gasLimit` è mantenuto tra 100,000 e 5,000,000; senza un valore è 400,000.
- Una transazione che esegue codice CosmWasm o cross-VM viene prima simulata, prima dell'approvazione. QoreX chiede almeno 1.3 volte il gas simulato, fino a 20,000,000, e un valore più alto proveniente dalla tua pagina viene mantenuto. Una chiamata che il contratto rifiuterebbe viene respinta prima dell'approvazione, con il motivo della chain. Se la chiamata richiede più di 20,000,000, QoreX lo dice e rifiuta.
- Una transazione non può superare il limite di gas per transazione della rete stessa; QoreX ne rifiuta una che lo superi prima che qualcosa venga firmato.

Un rifiuto dell'utente genera `QoreX: signature rejected` con codice `4001`.

## cosmjs, cosmos-kit e Interchain Kit {#cosmjs}

`getOfflineSigner(chainId)`, `getOfflineSignerOnlyDirect(chainId)` e `getOfflineSignerAuto(chainId)` restituiscono un `OfflineDirectSigner` di cosmjs, quindi `SigningStargateClient` funziona senza modifiche:

```js
const signer = window.qorex.native.getOfflineSigner("qorechain-vladi");
const client = await SigningStargateClient.connectWithSigner(rpc, signer, {
  gasPrice: GasPrice.fromString("0.15uqor"),
});
await client.sendTokens(from, to, [{ denom: "uqor", amount: "1000" }], "auto");
```

**Il livello post-quantistico aggiunto dal wallet.** Quando la transazione non porta un livello ML-DSA (che una pagina non può produrre), QoreX lo aggiunge: simula il costo del livello, aumenta il gas e la commissione nella transazione, firma con ML-DSA-87 il corpo e le informazioni sulla commissione aumentata, e mostra all'utente la commissione finale prima dell'approvazione. La tua commissione `"auto"` torna quindi più alta del costo del livello, decine di migliaia di gas. Trasmetti sempre il documento `signed` che ti viene restituito, non quello che hai inviato. Controlla `capabilities.includes("signDirectAddsPqcLayer")` prima di fare affidamento su questo.

- L'account deve avere già registrata la propria chiave post-quantistica; la registra con la sua prima transazione da QoreX. Altrimenti la chiamata fallisce con codice `4100` e motivo `pqc-key-missing`. Chiedi all'utente di inviare prima una transazione da QoreX, oppure usa `signAndBroadcast`, che registra la chiave da sé.
- **Amino viene rifiutato.** `signAmino` e `getOfflineSignerOnlyAmino().signAmino` vengono respinti con codice `4200` e motivo `amino-unsupported`, perché Amino JSON non può trasportare la firma ibrida. Configura la tua libreria per la firma diretta.
- Gli account importati da MetaMask (coin 60) firmano tramite `signAndBroadcast`; per loro l'estensione rifiuta `signDirect`, e quindi i signer di cosmjs.
- `getKey` e `getAccounts` restituiscono l'account attivo.

In una web app, il [wallet adapter](/developer-tools/wallet-adapter) e i pacchetti delle [integrazioni QoreX](/developer-tools/qorex-integrations) (RainbowKit, Interchain Kit, cosmos-kit) racchiudono per te questo rilevamento e queste chiamate.

## `signDirect` {#sign-direct}

`signDirect` firma un `SignDoc` costruito dalla tua pagina. Se il corpo porta già un livello ML-DSA, QoreX lo verifica rispetto alla chiave registrata dell'account, come fa la chain, prima che si apra qualsiasi finestra. Se non ne porta, QoreX lo aggiunge come descritto sopra. Un livello che non corrisponde alla chiave registrata, un messaggio riservato al wallet, un messaggio che QoreX non può mostrare, o più di 1,000 messaggi vengono rifiutati prima che si apra qualsiasi approvazione. Per il codice nuovo, `signAndBroadcast` è più semplice.

## Firmare un messaggio: `signArbitrary` e `verifyArbitrary` {#sign-arbitrary}

```js
const message = "Log in to example.com\nNonce: 1234";
const sig = await window.qorex.native.signArbitrary("qorechain-vladi", address, message);
const ok = await window.qorex.native.verifyArbitrary("qorechain-vladi", address, message, sig);
```

La firma segue [QoreSign message-signing-v1](/qoresign/spec/message-signing-v1): ADR-36 con la chiave classica dell'account (secp256k1, oppure eth_secp256k1 per un account coin-60), più ML-DSA-87 su `"qorechain-msg-v1|" + chainId + "|" + data`. Contiene anche i campi `pub_key` e `signature` di Keplr, così il codice scritto per Keplr può leggerla. L'utente vede l'intero messaggio. Un messaggio deve essere lungo da 1 a 4096 byte e non deve iniziare con un altro dominio di firma di QoreChain.

**Verifica sul tuo server, mai nella pagina.** La metà ML-DSA va controllata rispetto alla chiave registrata on-chain per quell'indirizzo, mai rispetto a una chiave inviata dal client. Usa [`@qorechain/qoresign`](/qoresign/overview):

```ts
import { verifyMessageWithChain } from "@qorechain/qoresign/network";

try {
  await verifyMessageWithChain({
    rest: "https://api.qore.host",     // the network's REST endpoint
    chainId: "qorechain-vladi",
    signer: address,                    // the qor1... address that signed
    data: message,                      // exactly the text you asked the user to sign
    signature: sig,                     // the object signArbitrary returned
  });
  // signed in
} catch (err) {
  // a QoreSignError with a stable code: the signature does not verify
}
```

`verifyMessageWithChain` recupera la chiave ML-DSA-87 registrata del firmatario e genera un `QoreSignError` quando qualcosa non è verificato. Un account che non ha mai inviato una transazione su quella rete non ha ancora una chiave registrata e fallisce con `KEY_NOT_REGISTERED`: chiedi all'utente di inviare prima una transazione da QoreX. Inserisci nel messaggio un nonce monouso e il tuo dominio, e controllali entrambi sul server, così una firma non può essere riutilizzata su un altro sito. Le guide di QoreSign trattano in maggiore dettaglio i messaggi di accesso.

## dApp EVM {#evm}

QoreX risponde su EIP-6963 e, tramite il suo provider EIP-1193, firma `personal_sign`, `eth_signTypedData_v4` ed `eth_sendTransaction` sulla lane EVM di QoreChain (chain id **9801**, testnet **9800**). Nell'estensione firma anche su Ethereum dopo che il sito ha chiamato `wallet_switchEthereumChain` verso `0x1` (per sito). I metodi di sola lettura (`eth_call`, `eth_getBalance`, `eth_getLogs` e le altre letture standard) vanno al nodo della rete selezionata. Ogni altro metodo risponde `4200`, e `wallet_switchEthereumChain` o `wallet_addEthereumChain` verso qualsiasi cosa diversa da una chain per cui QoreX firma risponde `4902`. Un sito non può passare all'altra rete QoreChain: la risposta è `4100` con `switch the network in QoreX itself`.

```js
const [from] = await qorex.provider.request({ method: "eth_requestAccounts" });
const hash = await qorex.provider.request({
  method: "eth_sendTransaction",
  params: [{ from, to, value: "0x0", data }],
});
```

**Cosa decodifica l'approvazione.** Ogni finestra dice cosa viene autorizzato, decodificato sul dispositivo: trasferimenti, approvazioni di token (una illimitata è indicata come ILLIMITATA), `setApprovalForAll`, firme Permit e Permit2, e transazioni Safe (una DELEGATECALL è contrassegnata come ad alto rischio). Una chiamata che QoreX non sa decodificare è mostrata come sconosciuta e ad alto rischio e richiede un secondo tocco. Le deleghe EIP-7702 vengono rifiutate.

**Simulazione.** Prima della firma, la finestra mostra cosa cambia la transazione nel saldo dell'utente.

- Con `eth_simulateV1` (tracciamento dei trasferimenti) sul nodo, mostra le variazioni di QOR e token.
- Su un nodo senza `eth_simulateV1`, che oggi è il caso dei nodi EVM di QoreChain, è disponibile solo `eth_call`, che dice se la chiamata andrebbe in revert. Una chiamata con dati mostra allora l'avviso che ciò che fa ai tuoi token non è stato verificato, e l'utente ha bisogno di un secondo tocco per approvare.
- Anche una transazione che fallirebbe, o che il nodo non può simulare, richiede un secondo tocco.
- La simulazione va allo stesso nodo che riceverebbe la transazione; non viene inviato nient'altro altrove.

Progetta la pagina in modo che questo secondo tocco non sia una sorpresa: spiega anche nella tua interfaccia cosa fa la chiamata.

**La finestra di autorizzazione EVM, per transazione.** Su QoreChain una transazione EVM è ammessa solo all'interno di una finestra di autorizzazione aperta dalla firma ibrida ML-DSA-87 dell'account sulla lane nativa. Quando nessuna copre la transazione, la stessa approvazione ne apre una esattamente per quella transazione:

- come limite, il valore più la commissione massima,
- circa dieci minuti,
- limitata ai contratti chiamati dalla transazione, dove la rete lo supporta.

L'approvazione nomina ogni contratto che la finestra ammetterebbe (inclusi i contratti che di recente hanno verificato una firma per lo stesso sito) e dice che sostituisce qualsiasi finestra che l'utente abbia aperta. Se la rete non può limitare una finestra a dei contratti, QoreX chiede una seconda volta, nominando i contratti e dicendo che la finestra ammetterebbe qualsiasi contratto, prima di aprirne una senza limiti; un "no" non invia nulla. Il limite in QOR copre tutti i QOR che escono dall'account, commissione massima inclusa, e un contratto che la finestra consente all'utente di chiamare può comunque agire per l'account (token che detiene o che ha approvato, oppure QOR detenuti da altri contratti). Vedi [Finestra di accesso EVM](/qorex/security-and-recovery#evm-window).

**Una finestra aperta a mano dall'utente.** Una finestra che l'utente apre dalla schermata della finestra è impostata per default su **Solo trasferimenti di QOR**; consentire qualsiasi contratto è una scelta separata con un avviso. Quindi una finestra aperta in precedenza dall'utente non coprirà una chiamata a token o contratti. Una dApp che si aspetta l'esistenza di una finestra dovrebbe lasciare che QoreX apra la finestra per singola transazione (il modo più semplice, e il più ristretto), oppure dire all'utente di scegliere **Qualsiasi contratto** se ne apre una da sé.

**Altre regole su questa lane**

- Solo gli account importati da MetaMask (coin type 60) possono inviare sulla lane EVM di QoreChain. Un altro account risponde `4100` e il messaggio indica all'utente i passi successivi.
- I precompile di staking, distribuzione, governance, vesting, bank e IBC vengono rifiutati (`4200`): su QoreChain queste operazioni passano dalla lane nativa.
- Le firme sulla lane EVM sono classiche (secp256k1). QoreX non afferma di più.
- I typed data per una chain diversa da quella selezionata vengono rifiutati con `-32602`.

## dApp Solana (estensione) {#solana}

L'estensione si registra con il Wallet Standard di Solana sulla mainnet di Solana (`solana:mainnet`), così le dApp Solana la trovano senza codice personalizzato. Funzionalità: connect, disconnect, eventi, `solana:signMessage`, `solana:signTransaction` e `solana:signAndSendTransaction`, per transazioni legacy e v0. `connect({ silent: true })` è supportato.

L'approvazione decodifica trasferimenti System, trasferimenti SPL Token e Token-2022, approvazioni, cambi di autorità e chiusure di account, e mostra il testo di un memo. Un'istruzione che QoreX non sa decodificare è contrassegnata nella schermata come illeggibile e l'approvazione richiede un secondo tocco. Una transazione che non elenca il wallet come firmatario viene rifiutata, e `signMessage` non firma byte che in realtà sono una transazione. Le firme sono classiche e contrassegnate come tali.

Il browser integrato nell'app non firma transazioni Solana. Solana su QoreChain stessa è una funzionalità separata, solo testnet, all'interno del wallet: vedi [Funzionalità disponibili solo su testnet](/qorex/testnet-features).

## Quando il wallet è bloccato {#locked}

Dall'estensione 0.4.5 e da Safari 1.8.2, una richiesta di firma fatta mentre QoreX è bloccato (nativa, EVM o Solana) apre il wallet sulla schermata della password, nominando il sito. Dopo che l'utente ha sbloccato, la finestra si chiude e la richiesta mostra la propria approvazione. Se invece l'utente chiude la finestra, la richiesta viene rifiutata con codice `4001`. In precedenza, una richiesta di questo tipo falliva subito con "wallet is locked".

- `enable`, `getKey`, `eth_requestAccounts` e i metodi di firma risvegliano il wallet in questo modo.
- Le letture che una pagina fa al caricamento (`eth_accounts`, `eth_chainId`, letture della chain) non aprono mai una finestra: `eth_accounts` restituisce semplicemente un elenco vuoto.
- Nulla viene firmato senza la password, e a una richiesta in attesa viene risposto "no" se l'utente cambia wallet o blocca di nuovo.

Gestisci `4001` come un esito normale, non come un guasto.

## Messaggi che un sito non può mai richiedere {#wallet-only}

QoreX li rifiuta a qualsiasi sito su ogni percorso (`signAndBroadcast`, `signDirect`, proposta di un agente), perché cedono un'autorità permanente sull'account. L'utente li esegue dalle schermate di QoreX:

- gestione delle chiavi post-quantistiche: registrare, migrare e ruotare una chiave, la chiave di cifratura e la registrazione di un multisig PQC;
- autenticatori e regole di spesa: registrare o revocare una chiave di firma, regole di spesa, creare un account astratto;
- apertura, chiusura e cancellazione delle finestre EVM (e il consenso alla delega);
- apertura e chiusura delle finestre Solana su QoreChain, e il messaggio di inoltro Solana;
- una concessione authz (`MsgGrant`) di `MsgGrant` o `MsgExec`, perché una tale concessione permetterebbe al beneficiario di agire come l'account.

Il rifiuto si applica direttamente, dentro `MsgExec` a qualsiasi profondità, e come concessione generica di uno di questi messaggi. L'errore recita `QoreX: <type> is managed by the wallet itself, not by a website`.

## Errori ed eventi {#errors}

Gli errori portano un `code` EIP-1193:

| Codice | Significato |
|---|---|
| `4001` | L'utente ha rifiutato, o ha chiuso la finestra (inclusa la finestra di sblocco). |
| `4100` | Non autorizzato: account sconosciuto, nessuna chiave post-quantistica registrata (`reason: pqc-key-missing`), un account coin-118 che tenta la lane EVM, o una richiesta di cambiare rete. |
| `4200` | Non supportato: Amino (`reason: amino-unsupported`), un metodo EVM che QoreX non firma, una delega EIP-7702, un precompile solo nativo. |
| `4901` | Chain Solana sbagliata. |
| `4902` | Chain sconosciuta. |
| `-32602` | Parametri non validi (ad esempio typed data per un'altra chain). |

Eventi:

- Provider EVM: `connect`, `accountsChanged` e `chainChanged` nell'estensione; solo `connect` nell'app.
- Lane nativa (estensione): l'evento sulla finestra `qorex_keystorechange` quando cambiano l'account, il wallet o la rete. cosmos-kit lo ascolta.
- Wallet Standard di Solana: `change`.

## Link che un servizio può generare {#links}

Tre link aprono QoreX da un'altra pagina o app.

### Aprire una pagina nell'app: `browse` {#link-browse}

```
https://link.qore.network/browse?url=<encodeURIComponent(https URL)>
qorex://browse?url=<encodeURIComponent(https URL)>
```

Su un telefono, il link apre la tua pagina nel browser dApp di QoreX dopo la consueta richiesta biometrica. La pagina deve essere `https://` su un nome di dominio. QoreX rifiuta il link se la pagina ha:

- una porta,
- un nome utente o una password,
- un indirizzo IP,
- `localhost`,
- una barra rovesciata o spazi vuoti,
- più di 2048 caratteri.

Il link non dà nulla alla pagina. Deve comunque chiedere di connettersi, e ogni firma passa comunque dalla schermata di approvazione. Se sul telefono non c'è un wallet, l'app resta sull'onboarding. Se QoreX non è installato, la forma https mostra una pagina con un link per ottenerlo. L'estensione non ha un link `browse`.

### Chiedere un pagamento: `qorex://pay` {#link-pay}

```
qorex://pay?v=1&net=qorechain-vladi&to=qor1...&amt=1500000&d=uqor&id=pr_...&tag=...&pk=...&sig=...
```

Un link di richiesta di pagamento porta il destinatario, l'importo in unità base, la denominazione, un id della richiesta e il suo tag memo, una nota e un @handle facoltativi, la rete, e una firma su tutto questo fatta dalla chiave dell'account del destinatario. Il QoreX di chi paga controlla la firma, che la chiave firmataria possieda l'indirizzo del destinatario, la rete esatta e l'eventuale @handle, poi mostra la normale revisione prima di inviare. Un importo o un destinatario alterato viene rilevato, e la richiesta viene contrassegnata come pagata leggendo la chain.

**Generalo con la schermata di richiesta di QoreX** (app, **Richieste di pagamento**, **Nuova richiesta**) invece che a mano: la firma è fatta con la chiave dell'account, che una pagina non ha mai. Considera non supportato un link che costruisci o modifichi da te. Una forma web del link non è ancora disponibile.

### Consegnare la proposta di un agente: `qorex://propose` {#link-propose}

```
qorex://propose?d=<base64url of the proposal JSON>
```

Solo app. Il link porta una transazione proposta da un agente IA; QoreX la convalida, la simula e la mostra nella normale finestra di approvazione. Una proposta non viene mai firmata così com'è, e un link può portare al massimo 64 KB. Vedi il [modello degli agenti IA](#agents) qui sotto.

## Agenti IA {#agents}

Se crei un agente IA che lavora con un wallet, il modello è che l'agente può leggere ciò che l'utente consente e **proporre** una transazione; non firma mai. QoreX controlla e simula ogni proposta e l'utente la approva o la rifiuta nella stessa finestra di approvazione usata per una richiesta dApp. Una proposta per un messaggio riservato al wallet viene rifiutata prima che si apra qualsiasi finestra. Nell'estensione un agente raggiunge QoreX tramite un programma di supporto sul computer dell'utente che non è ancora pubblicato; nell'app, una proposta viene incollata o arriva come link `qorex://propose`. Per come l'utente lo attiva e cosa vede, leggi [Modalità sviluppatore: agenti IA](/qorex/developer-mode#ai-agents).

## Testnet {#testnet}

**Una dApp non può cambiare rete.** Il `chainId` in una richiesta deve coincidere con la rete su cui si trova il wallet; una mancata corrispondenza viene rifiutata. Questo protegge l'utente da una pagina che lo sposterebbe su una rete in cui i fondi sembrano gli stessi ma non lo sono.

Per usare la testnet (`qorechain-diana`, chain id EVM 9800), l'utente la attiva in QoreX:

- **App:** Impostazioni, poi **Usa la testnet (sviluppatori)**.
- **Estensione:** attiva la Modalità sviluppatore (tocca sette volte il numero di versione in fondo al popup), poi **Passa alla testnet (diana)**. **Torna alla mainnet** ripristina l'impostazione predefinita.

In ogni schermata compare allora un banner TESTNET, i saldi di testnet non mostrano alcun valore in USD, e la rete si ricollega senza riavvio. Di' ai tuoi utenti di cambiare rete prima di aprire la tua pagina di testnet. Le funzionalità del wallet disponibili solo su testnet (IBC, la schermata del QoreChain Bridge, Solana su QoreChain) sono descritte in [Funzionalità disponibili solo su testnet](/qorex/testnet-features).

## Risoluzione dei problemi {#troubleshooting}

| Cosa vedi | Perché, e cosa fare |
|---|---|
| `window.keplr` è undefined | Voluto. Usa `window.qorex.native`, oppure una libreria con un connettore QoreX. |
| `window.ethereum` non è QoreX | Voluto. Seleziona il wallet tramite EIP-6963 (`rdns` `network.qore.qorex`). |
| `QoreX: chain X does not match the active network Y` | L'utente è sull'altra rete. Chiedigli di cambiarla in QoreX; tu non puoi. |
| `4100`, `pqc-key-missing` | L'account non ha ancora una chiave post-quantistica sulla rete. Chiedi all'utente di inviare una transazione da QoreX, oppure usa `signAndBroadcast`. |
| `4200`, `amino-unsupported` | La tua libreria sta chiedendo Amino. Configura la firma diretta. |
| `QoreX: <type> is managed by the wallet itself, not by a website` | Un messaggio riservato al wallet. Rimuovilo; l'utente lo esegue da QoreX. |
| `QoreX cannot show what <type> does, so it will not sign it` | Un messaggio che QoreX non sa decodificare. Usa un tipo che può mostrare. |
| `QoreX: send between 1 and 32 messages` | Dividi la richiesta. |
| `QoreX: the memo may be at most 256 bytes` | Accorcia il memo. |
| `QoreX: a message must be 1 to 4096 bytes` | Accorcia il messaggio che chiedi di firmare. |
| `needs about N gas, more than the 20,000,000 QoreX allows` | La chiamata al contratto è troppo pesante per una sola transazione. Dividila. |
| `QoreX: EVM method X not yet supported` (`4200`) | QoreX firma solo `personal_sign`, `eth_signTypedData_v4` ed `eth_sendTransaction`. |
| `QoreX: this account uses the QoreChain (coin 118) key and cannot send on QoreChain's EVM lane` | Solo gli account importati da MetaMask (coin 60) inviano sulla lane EVM. |
| `QoreX: staking, rewards, IBC and governance on QoreChain go through the native lane` | Per queste operazioni chiama la lane nativa; i precompile EVM vengono rifiutati. |
| Una chiamata EVM richiede sempre un secondo tocco | Il nodo non può verificare cosa fa la chiamata ai token, oppure la chiamata non è decodificabile. Spiegalo nella tua pagina. |
| Una chiamata a un token fallisce anche se l'utente ha aperto una finestra | Per impostazione predefinita, una finestra aperta a mano dall'utente copre solo i trasferimenti di QOR. Lascia che QoreX apra la finestra per singola transazione, oppure di' all'utente di scegliere qualsiasi contratto. |
| `4001` subito dopo che la pagina chiede una firma | L'utente ha rifiutato, oppure ha chiuso la finestra di sblocco su un wallet bloccato. Proponi di riprovare. |
| `eth_accounts` restituisce `[]` | Il sito non è ancora connesso. Chiama `eth_requestAccounts`. |
| Un link `browse` non fa nulla | L'indirizzo della pagina ha violato una regola (porta, IP, `localhost`, non https, oltre 2048 caratteri), oppure il telefono non ha ancora un wallet. |
| `KEY_NOT_REGISTERED` sul tuo server | Il firmatario non ha mai inviato una transazione su quella rete. Chiedine prima una. |

Se un problema persiste, l'utente può inviare un registro delle richieste oscurato dalla [Modalità sviluppatore](/qorex/developer-mode), e puoi usare la testnet per riprodurlo.

## Dove è pubblicato {#where-published}

| Cosa | Dove |
|---|---|
| Estensione per browser QoreX | Chrome Web Store, Firefox Add-ons e Mac App Store (Safari). Vedi [Estensione per browser](/qorex/browser-extension#install). |
| App QoreX e il suo browser dApp | App Store e Google Play. Vedi [Wallet QoreX](/qorex/overview#how-to-access). |
| Verifica di messaggi e transazioni | `@qorechain/qoresign` (TypeScript e altri linguaggi). Vedi [QoreSign](/qoresign/overview). |
| Rilevamento del wallet per web app | [`@qorechain/wallet-adapter`](/developer-tools/wallet-adapter) |
| Connettori RainbowKit, Interchain Kit e cosmos-kit, tipi e un wallet di test | [`@qorechain/qorex-*`](/developer-tools/qorex-integrations) |
| SDK di base per costruire e inviare transazioni | [Strumenti per sviluppatori](/developer-tools/overview) |

Il codice sorgente di QoreX non è pubblico. La versione corrente su ciascuno store è nella pagina [panoramica](/qorex/overview#versions).
