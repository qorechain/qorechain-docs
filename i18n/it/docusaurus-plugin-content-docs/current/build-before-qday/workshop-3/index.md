---
slug: /build-before-qday/workshop-3
title: "Workshop 3: App cifrate e cross-VM"
sidebar_label: "Workshop 3"
sidebar_position: 4
date: 2026-11-20
---

# Workshop 3: App cifrate e cross-VM

Il Workshop 2 ha protetto i fondi con una chiave post-quantistica. Il Workshop 3 fa due cose nuove con la stessa catena. Prima, **cifri un messaggio verso un indirizzo QoreChain** in modo che solo il proprietario di quell'indirizzo possa leggerlo, con cifratura post-quantistica. Poi, una sola transazione sulla **EVM** scrive in un contratto su **QoreChain Native**, e i due lati cambiano insieme o non cambiano affatto.

Non devi essere un crittografo. Ogni comando qui sotto dice che cosa fa e che cosa dovresti vedere. Le due app di esempio sono pubbliche: [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), cartella `workshop-3`. Entrambe girano solo sulla testnet di QoreChain `qorechain-diana`. I QOR di prova non hanno alcun valore.

**Quanto tempo serve:** circa 30 minuti per QoreSeal, 40 per il checkout cross-VM. Le due parti sono indipendenti e ognuna richiede i propri account di prova.

## Cosa costruiamo {#what-we-built}

| Parte | App | Cosa dimostra |
| --- | --- | --- |
| 1 | **QoreSeal** (Node.js) | Cifrare un messaggio verso un indirizzo `qor1...` con ML-KEM-1024, aprirlo, vedere che un estraneo non può, vedere che la manomissione viene rilevata e ruotare una chiave senza perdere la vecchia posta. |
| 2 | **CrossVmCheckout** (Solidity e Rust) | Una chiamata da un contratto EVM scrive una ricevuta in un contratto Native nella stessa transazione. Se uno dei due lati fallisce, entrambi vengono annullati. |

Le innovazioni dietro queste app:

- **Cifratura verso un indirizzo.** Ogni account può pubblicare on chain una chiave di cifratura post-quantistica, come un elenco telefonico pubblico. Per scrivere a qualcuno ti basta il suo indirizzo.
- **Una scheda che lega la chiave all'account.** L'account firma una piccola scheda del destinatario con entrambe le sue chiavi di firma, così nessuno può infilare in mezzo una falsa chiave di cifratura.
- **Cifratura ibrida.** ML-KEM-1024 (NIST FIPS 203) è combinato con la chiave classica X25519. Il messaggio resta privato finché regge almeno una delle due.
- **Atomicità cross-VM.** La EVM e QoreChain Native condividono uno stato e un blocco. Una chiamata tra le due fa parte della stessa transazione, quindi non resta nessuno stato a metà da ripulire.
- **Accesso approvato dalla governance.** Il bridge chiama solo contratti Native approvati dalla governance, e ogni approvazione è legata al codice del contratto.

## Parole usate in questa guida {#words}

| Parola | Significato in parole semplici |
| --- | --- |
| ML-KEM-1024 | Uno scambio di chiavi post-quantistico (NIST FIPS 203). Qui serve a concordare una chiave segreta per ogni messaggio |
| X25519 | Uno scambio di chiavi classico, combinato con ML-KEM così la busta regge se uno dei due viene rotto |
| ML-DSA-87 | La firma post-quantistica (NIST FIPS 204). Ogni transazione nativa è firmata con essa e con la chiave classica secp256k1 |
| Scheda del destinatario | Una piccola nota firmata che lega le chiavi di cifratura di un account all'account stesso |
| Busta | Il messaggio sigillato, salvato come file di testo che puoi inviare come preferisci |
| Native | QoreChain Native, la corsia CosmWasm in cui i contratti si scrivono in Rust |
| Precompile del bridge | Un contratto integrato a `0x0000000000000000000000000000000000000901` che permette a un contratto EVM di chiamare un contratto Native |
| Allowlist | I contratti Native che la governance ha approvato perché il bridge possa raggiungerli |
| Finestra EVM | Un permesso breve e limitato per inviare transazioni in stile Ethereum da un account. Aprirla richiede una transazione firmata con entrambe le chiavi |

:::caution Solo account testnet usa e getta
Usa chiavi create per questo workshop, che contengano QOR di prova senza valore. Non inserire mai in un file o in un comando le parole segrete o la chiave di un account che contiene denaro vero.
:::

## Prima di iniziare {#prerequisites}

Ti servono gli strumenti di [Prima di iniziare](/build-before-qday/prerequisites) (un terminale, Node.js e Git) e un browser per il faucet. La parte 1 richiede Node.js 20 o successivo. La parte 2 richiede anche **pnpm** e **Foundry**, e facoltativamente Rust. Controlla Node.js:

```bash
node -v
```

Deve stampare `v20` o un numero più alto. Per la parte 2 installa il resto:

```bash
npm install -g pnpm
```

Installa pnpm, lo strumento per i pacchetti usato dalla parte 2. Controllalo con `pnpm -v`. Foundry compila, testa e distribuisce Solidity: installalo da [getfoundry.sh](https://getfoundry.sh), poi esegui `foundryup`. Controlla con `forge --version` e `cast --version`.

Scarica il codice di esempio:

```bash
git clone https://github.com/qorechain/build-before-qday.git
cd build-before-qday/workshop-3
```

La prima riga scarica gli esempi in una cartella chiamata `build-before-qday`. La seconda entra nella cartella `workshop-3`, che contiene le due app.

I QOR di prova arrivano dal [faucet](/dashboard/faucet) della dashboard.

## Parte 1: QoreSeal, cifrare verso un indirizzo {#part-1}

Codice: [workshop-3/01-qoreseal](https://github.com/qorechain/build-before-qday/tree/main/workshop-3/01-qoreseal). Pacchetti: `@qorechain/qoreseal` e `@qorechain/qoresign`.

Vuoi mandare un messaggio privato a qualcuno e conosci solo il suo indirizzo. Questa app mostra come:

1. Alice registra le sue chiavi on chain.
2. Chiunque cerca la chiave di cifratura di Alice tramite il suo indirizzo.
3. Un messaggio viene sigillato per Alice. Alice lo apre. **Eve no.**
4. Cambia un solo bit della busta e **non si apre più**.
5. Un messaggio sigillato per Alice **e** Bob: ognuno lo apre con la propria chiave.
6. Alice **ruota** la sua chiave: la vecchia scheda viene rifiutata, i nuovi messaggi usano la nuova chiave e i vecchi messaggi si aprono ancora.

La cifratura avviene sul tuo computer. La catena non vede mai il messaggio, solo la chiave pubblica.

```bash
cd 01-qoreseal
```

Entra nella cartella di QoreSeal.

### Passaggio 1: installa {#seal-install}

```bash
npm install
```

Scarica le versioni esatte dei pacchetti indicate in `package-lock.json`: QoreSeal, QoreSign (il firmatario ibrido) e alcuni helper cosmjs che costruiscono la transazione.

```bash
node seal.mjs help
```

Elenca tutti i comandi.

### Passaggio 2: crea tre account testnet {#seal-accounts}

```bash
node seal.mjs init alice
node seal.mjs init bob
node seal.mjs init eve
```

Ogni comando crea un nuovo account e salva le sue parole segrete in `~/.config/qday-w3/<name>.json`, leggibile solo da te. Non viene stampato nulla di segreto. Imposta `QDAY_DIR` per tenere i file altrove. Ogni comando stampa l'indirizzo `qor1...` dell'account.

### Passaggio 3: finanzia Alice {#seal-fund-alice}

Incolla l'indirizzo `qor1...` di Alice nel [faucet](/dashboard/faucet), poi controlla:

```bash
node seal.mjs whoami
```

Mostra ogni account: indirizzo, saldo e se le sue chiavi sono già on chain. Per ora la risposta è `no`.

### Passaggio 4: Alice registra le sue chiavi {#seal-register}

```bash
node seal.mjs register alice
```

Due transazioni:

1. **La chiave di firma ML-DSA-87**, con una prova che Alice la possiede. È l'unica transazione che la catena accetta firmata solo con la chiave classica, perché non conosce ancora la sua chiave post-quantistica.
2. **La chiave di cifratura ML-KEM-1024** (1.568 byte), firmata con entrambe le chiavi. Da ora chiunque può leggerla dalla catena.

Poi firma la **scheda del destinatario** di Alice e la salva come `cards/alice.json`. In un'app vera pubblicheresti la scheda accanto all'indirizzo, per esempio in una pagina di profilo, in un contratto o dietro un'API.

### Passaggio 5: dai QOR a Bob ed Eve e registra Bob {#seal-bob}

```bash
node seal.mjs fund alice bob 3
node seal.mjs fund alice eve 3
```

Invia 3 QOR di prova da Alice a Bob e a Eve. Come ogni transazione dopo la registrazione, è firmata con **entrambe** le chiavi, e la catena le controlla entrambe. Per questo Alice si registra per prima: un account senza chiave ML-DSA-87 on chain può registrarne solo una, e ogni altra transazione da esso viene rifiutata.

```bash
node seal.mjs register bob
```

Bob serve per il passaggio 9, in cui un messaggio va a due persone. Eve resta non registrata: è l'estranea che proverà a leggere la posta di Alice.

### Passaggio 6: cerca Alice, come farebbe un mittente {#seal-lookup}

```bash
node seal.mjs lookup alice
```

Legge `GET /qorechain/pqc/v1/kem/<address>` dall'API REST pubblica: l'algoritmo (`ML-KEM-1024`), la chiave pubblica di 1.568 byte e il blocco in cui è stata registrata. Poi controlla la scheda rispetto a quella chiave e alla chiave ML-DSA-87 di Alice on chain. Dovresti vedere `card valid`. Puoi farlo per qualsiasi indirizzo: `node seal.mjs lookup qor1...`.

### Passaggio 7: sigilla un messaggio per Alice e aprilo {#seal-send}

```bash
node seal.mjs send alice "Payroll for March: 12,400 QOR to the team"
```

Legge la chiave di Alice dalla catena, controlla la sua scheda e sigilla il messaggio. Un messaggio di 41 caratteri diventa circa 1.760 byte, in gran parte materiale di chiavi post-quantistiche. La busta viene salvata in `inbox/`.

```bash
node seal.mjs open alice
```

Mostra `OPENED by alice with encryption key #0` e il messaggio.

```bash
node seal.mjs open eve
```

Mostra `CANNOT OPEN: eve holds none of the keys this envelope was sealed to`. Eve ha il file, ma non la chiave di Alice.

### Passaggio 8: manometti la busta {#seal-tamper}

```bash
node seal.mjs tamper alice
```

Cambia un bit della busta e prova ad aprirla. Dovresti vedere `REFUSED` con `DECRYPTION_FAILED`. La busta è autenticata, quindi ogni modifica viene rilevata e nessuno può alterare un messaggio sigillato.

### Passaggio 9: un messaggio, due destinatari {#seal-multi}

```bash
node seal.mjs send alice,bob "Board memo: Q4 budget"
node seal.mjs open bob
node seal.mjs open alice
```

Una busta, sigillata per entrambi gli indirizzi. Ognuno la apre con la propria chiave. Eve ancora non può.

### Passaggio 10: ruota la chiave di Alice {#seal-rotate}

```bash
node seal.mjs rotate alice
```

Deriva la **prossima** chiave di cifratura di Alice (la numero 1) dalle stesse parole segrete e la registra on chain, dove **sostituisce** la vecchia. Poi controlla la **vecchia** scheda rispetto alla catena e dovresti vedere `refused: the card names a different ML-KEM-1024 key than the registered one`. I mittenti che controllano la scheda non possono più sigillare verso la vecchia chiave. Viene firmata una nuova scheda.

```bash
node seal.mjs open alice inbox/$(ls inbox | head -1)
```

Apre la **prima** busta, sigillata prima della rotazione: `OPENED by alice with encryption key #0 (an older key)`. La vecchia chiave non è mai stata salvata. Viene derivata di nuovo dalle parole segrete, quindi ruotare non ti chiude mai fuori dalla vecchia posta.

```bash
node seal.mjs inspect
```

Mostra che cosa c'è dentro una busta senza il segreto: versione, scopo, destinatari e dimensioni.

### Come funziona il codice {#seal-code}

Tutto è in `seal.mjs`. Le chiamate di QoreSeal che contano:

| Chiamata | Che cosa fa |
| --- | --- |
| `deriveSealKeys({ mnemonic, index })` | Le chiavi di cifratura della chiave numero `index`, derivate dalle parole segrete |
| `buildRegisterKemKeyMessage({ sender, mlkemPublicKey })` | Il messaggio `MsgRegisterKEMKey` che mette la chiave on chain |
| `signRecipientCard({ chainId, address, keys, classicalKey, pqKey })` | La scheda, firmata con entrambe le chiavi di firma dell'account |
| `verifyRecipientCard({ card, chainId, address, mlkemPublicKey, pqPublicKey })` | Lancia un errore se la scheda non corrisponde alle chiavi on chain |
| `sealToAddresses({ rest, chainId, purpose, recipients, plaintext })` | Legge ogni chiave dalla catena, controlla ogni scheda, sigilla |
| `open({ chainId, purpose, envelope, keys })` | Apre la busta, oppure lancia un errore |
| `envelopeToText` e `envelopeFromText` | La busta come file di testo e viceversa |

`purpose` (qui `qday-note`) fa parte di ciò che viene sigillato: una busta creata per un'app non può essere aperta come se venisse da un'altra.

### Se qualcosa va storto (QoreSeal) {#seal-trouble}

| Cosa vedi | Che cosa fare |
| --- | --- |
| `does not exist on chain yet: fund ... first` | L'account non ha QOR: usa il faucet o `fund` |
| `no ML-KEM key registered for this address` | Esegui prima `register` per quell'account |
| `hybrid mode needs the recipient card` | Manca il file `cards/<name>.json`: esegui `register <name>`, che scrive di nuovo la scheda |
| `no envelope yet` | Esegui prima `send` |
| `account has no PQC key and classical fallback is disabled` | Quell'account non si è ancora registrato: esegui `register <name>` prima di `fund` da esso |
| `refused: ...` su una transazione | Leggi il messaggio: di solito mancano QOR, oppure l'API pubblica della testnet ti sta limitando. Aspetta qualche secondo |

I file in `~/.config/qday-w3/` contengono parole segrete. Non farne mai commit né condividerli, e non riusarli mai sulla mainnet. Le cartelle `cards/` e `inbox/` sono locali ed elencate in `.gitignore`.

## Parte 2: CrossVmCheckout, una transazione su due VM {#part-2}

Codice: [workshop-3/02-cross-vm](https://github.com/qorechain/build-before-qday/tree/main/workshop-3/02-cross-vm). Linguaggi: Solidity e TypeScript per il lato EVM, Rust per il lato Native.

QoreChain esegue più di una macchina virtuale sulla stessa catena: la **EVM** (Solidity, stile MetaMask) e **QoreChain Native** (contratti CosmWasm in Rust). Condividono uno stato e un blocco. Questa app è un piccolo negozio:

- **`CrossVmCheckout`** (Solidity, EVM) conta gli ordini.
- **`qday-receipts`** (Rust, Native) tiene un registro delle ricevute.
- Una sola chiamata a `checkout("coffee for the team")` fa entrambe le cose **nella stessa transazione**: il conteggio degli ordini sale sul lato EVM e una ricevuta viene scritta sul lato Native.

Il punto è l'**atomicità**: i due lati cambiano insieme oppure nessuno dei due cambia.

| Comando | Che cosa succede | Risultato |
| --- | --- | --- |
| `checkout` | Ordine +1 su EVM, ricevuta +1 su Native | Cambiano entrambi |
| `undo` | La ricevuta Native viene scritta, **poi** il lato EVM fa revert | Non cambia nessuno dei due: anche la ricevuta viene annullata |
| `native-fails` | L'ordine viene contato, **poi** il contratto Native rifiuta | Non cambia nessuno dei due: anche l'ordine viene annullato |
| `outside` | Chiedi al bridge di chiamare un contratto Native che la governance non ha approvato | Rifiutato dalla catena |

Sulla mainnet le chiamate cross-VM per ora sono in pausa, quindi questa parte gira solo sulla testnet.

### Il bridge e l'allowlist {#bridge}

La EVM raggiunge Native tramite il precompile del bridge a `0x0000000000000000000000000000000000000901`. Chiami:

```solidity
executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)
```

| Argomento | Significato |
| --- | --- |
| `targetVM` | `1` per Native |
| `targetContract` | L'indirizzo `qor1...` del contratto Native |
| `payload` | Il messaggio JSON del contratto Native |

Il bridge raggiunge solo contratti Native che la **governance** ha approvato. L'elenco è pubblico, nei parametri crossvm (`GET https://api-testnet.qore.host/qorechain/crossvm/v1/params`), e ogni voce è legata al codice del contratto, quindi un contratto approvato non può essere sostituito in seguito con un codice diverso.

Il contratto Native che chiamerai, `qday-receipts`, è nell'allowlist della testnet (proposta di governance 40, code id 865):

```text
qor1xjayq5ev55tkzpml9klxwyshr7gdrha0nurha9jhm0f0gdckksgs3gltw8
```

Non ha un admin, quindi nessuno può modificarlo. **Qualsiasi builder può chiamarlo dai propri contratti per il percorso Cross-VM.** Sul lato Native, il mittente della chiamata è l'account `qor1...` del tuo contratto EVM, non il tuo wallet, quindi ogni ricevuta mostra quale contratto l'ha scritta.

### Come funziona il contratto EVM {#xvm-how}

Apri `evm/src/CrossVmCheckout.sol`:

```solidity
function checkout(string calldata note, bool failAfter) external returns (bytes memory reply) {
    _checkNote(bytes(note));
    orders += 1;
    reply = _callNative(bytes(string.concat('{"record":{"note":"', note, '"}}')));
    if (failAfter) revert EvmSideFailed();
    emit Ordered(orders, msg.sender, note, reply);
}

function _callNative(bytes memory payload) private returns (bytes memory) {
    (bool ok, bytes memory ret) =
        BRIDGE.call(abi.encodeWithSignature("executeCrossVMCall(uint8,string,bytes)", NATIVE, receipts, payload));
    if (!ok) revert BridgeCallFailed(ret);
    if (ret.length == 0) revert BridgeNotActive();
    if (ret.length >= 64 && uint256(bytes32(ret)) == 32) return abi.decode(ret, (bytes));
    return ret;
}
```

1. **Controlla la nota.** Finisce dentro una stringa JSON, quindi deve avere da 1 a 140 caratteri stampabili, senza `"` e senza `\`. Altrimenti una nota costruita ad arte potrebbe cambiare il messaggio che riceve il contratto Native.
2. **Conta l'ordine.** Un normale cambio di stato EVM.
3. **Chiama il bridge.** Il contratto Native viene eseguito lì, dentro questa transazione.
4. **Se la chiamata al bridge è fallita, fai revert.** Un fallimento di Native diventa un revert EVM e l'intera transazione viene annullata.
5. **Nessuna risposta significa nessun bridge.** Su una catena in cui il precompile non è attivo, una chiamata a quell'indirizzo "riesce" con dati vuoti. Trattala come un errore, mai come un successo.
6. **Decodifica la risposta.** Il bridge restituisce la risposta Native come `bytes` codificati ABI. Il codice accetta anche byte grezzi.
7. **`failAfter`** fa revert dopo che la chiamata Native è riuscita. Mostra che anche la ricevuta scritta sul lato Native viene annullata.

Usa una normale `call`, non una `staticcall` né una funzione view: il bridge rifiuta le chiamate statiche, perché il lato Native può scrivere stato.

Tutti i comandi qui sotto vanno eseguiti nella cartella `evm`, salvo diversa indicazione:

```bash
cd ../02-cross-vm/evm
```

Se sei ancora in `01-qoreseal`, questo comando ti porta nella cartella EVM dell'app cross-VM.

### Passaggio 1: esegui i test (non serve un account) {#xvm-tests}

```bash
pnpm install
pnpm forge-std
forge test
```

`pnpm install` scarica i pacchetti JavaScript. `pnpm forge-std` scarica la libreria standard di Foundry in `lib/`, una sola volta. `forge test` esegue i 5 test in `test/CrossVmCheckout.t.sol`. Dovresti vedere `5 passed; 0 failed`.

La EVM locale di Foundry non ha il bridge di QoreChain, quindi i test mettono un piccolo bridge finto a `0x...0901` con `vm.etch`. Controllano il messaggio JSON esatto inviato, che `failAfter` annulla tutto, che un fallimento di Native annulla il lato EVM, che una nota non può iniettare JSON e che un bridge inattivo è un errore. Il bridge vero si usa nei passaggi successivi.

### Passaggio 2: un account con una chiave post-quantistica {#xvm-account}

Se hai fatto il Workshop 2, copia da lì il tuo `.env` (stesso account, chiave già registrata) e aggiungi la riga `RECEIPTS_CONTRACT` da `.env.example`. Altrimenti:

```bash
cast wallet new
cp .env.example .env
```

`cast wallet new` crea un account usa e getta. Inserisci la sua chiave privata in `.env` come `PRIVATE_KEY`. **Solo testnet.**

```bash
pnpm window recovery-code
```

Stampa un codice `QRC1-...`. Inseriscilo in `.env` come `QORE_PQC_RECOVERY_CODE` e tieni una copia separata dalla chiave privata. La tua chiave ML-DSA-87 viene derivata da esso.

```bash
pnpm window status
```

Mostra il tuo indirizzo `qor1...`. Incollalo nel [faucet](/dashboard/faucet), poi:

```bash
pnpm window register
```

Mette la tua chiave ML-DSA-87 on chain, una sola volta per account. Ora `pnpm window status` mostra `PQC key: registered`.

### Passaggio 3: apri una finestra EVM limitata {#xvm-window}

```bash
pnpm window:scoped
```

Apre una finestra di **1.200 blocchi (circa 28 minuti), 6 transazioni e 3 QOR** di valore più commissioni. Basta per il deploy e le tre transazioni dimostrative, e niente di più. Il tuo wallet chiama **il tuo contratto**, e il contratto chiama poi il bridge con la propria identità, quindi la finestra deve solo ammettere la chiamata al tuo contratto.

**Aspetta circa 10 secondi** prima del passaggio successivo, così la transazione della finestra è in un blocco.

### Passaggio 4: distribuisci il negozio {#xvm-deploy}

```bash
pnpm deploy:testnet
```

Distribuisce `CrossVmCheckout` puntando a `RECEIPTS_CONTRACT`. Cerca `CrossVmCheckout 0x...`. Nell'output di Foundry, "ETH" significa QOR.

```bash
pnpm xvm status
```

Mostra entrambi i lati: `orders` sul tuo contratto EVM e il numero di ricevute su `qday-receipts`, con le ultime tre ricevute. Altri builder scrivono nello stesso registro, quindi il suo conteggio probabilmente non è zero. Conta come **cambia**.

### Passaggio 5: un contratto che la catena non ha approvato {#xvm-outside}

```bash
pnpm xvm outside
```

Simula una chiamata diretta al bridge verso un vero contratto Native che **non** è nell'allowlist. Dovresti vedere `REFUSED by the bridge: ... is not allowlisted`. È gratis e non usa nessuna transazione della finestra.

### Passaggio 6: una transazione, due VM {#xvm-checkout}

```bash
pnpm xvm checkout "coffee for the team"
```

Vedi `before`, la transazione (`SUCCESS`) e `after`: ordini +1 **e** ricevute +1, più la nuova ricevuta con la tua nota, inviata `from` dall'indirizzo `qor1...` del tuo contratto. Poi `both sides changed, in the same transaction`.

### Passaggio 7: il lato EVM fallisce dopo la chiamata Native {#xvm-undo}

```bash
pnpm xvm undo "this receipt must disappear"
```

La ricevuta Native viene scritta, poi il lato EVM fa revert. La transazione viene minata come `REVERTED`, e `before` e `after` sono identici: `nothing changed on either side`. Anche la ricevuta scritta sul lato Native è sparita.

### Passaggio 8: il lato Native rifiuta {#xvm-native-fails}

```bash
pnpm xvm native-fails
```

L'ordine viene contato sul lato EVM, poi `qday-receipts` rifiuta con `{"fail":{}}`. La transazione è `REVERTED` e i numeri sono identici: anche l'ordine EVM viene annullato.

Ogni transazione ha un link all'explorer. Aprilo nell'[explorer della Dashboard](/dashboard/explorer) con il selettore di rete su **Testnet**.

### Se qualcosa va storto (cross-VM) {#xvm-trouble}

| Cosa vedi | Che cosa significa | Che cosa fare |
| --- | --- | --- |
| `Missing or invalid parameters` nel deploy o in una transazione | Nessuna finestra EVM attiva | `pnpm window status`, poi `pnpm window:scoped`, aspetta 10 secondi e riprova |
| `No shop yet` | Nulla è stato distribuito da questa cartella | Passaggio 4, oppure imposta `SHOP_ADDRESS` in `.env` |
| `BridgeCallFailed` con `not allowlisted` | La destinazione non è approvata dalla governance | Usa `qday-receipts`, l'indirizzo qui sopra |
| `BridgeNotActive` | Il precompile del bridge non è attivo su quella rete | Usa la testnet |
| `BadNote` | La nota è vuota, troppo lunga o contiene `"` o `\` | Usa testo semplice fino a 140 caratteri |

### Il lato Native {#native-side}

La cartella `native/` contiene il sorgente completo di `qday-receipts` (CosmWasm 2, Rust):

| Messaggio | Che cosa fa |
| --- | --- |
| `{"record":{"note":"..."}}` | Aggiunge una ricevuta: id, mittente, nota, altezza del blocco |
| `{"fail":{}}` | Rifiuta sempre, per mostrare l'atomicità |
| `{"count":{}}` (query) | Quante ricevute ci sono |
| `{"receipt":{"id":1}}` (query) | Una ricevuta |
| `{"latest":{"limit":3}}` (query) | Le ricevute più recenti, la più nuova per prima, al massimo 20 |

Esegui i suoi test (serve Rust):

```bash
cd ../native
cargo test
```

Dovresti vedere 3 test superati. Il caricamento dei contratti Native sulla testnet passa dalla governance, quindi non devi distribuire questo: è già attivo.

Per verificare che il codice on chain sia questo sorgente, compilalo con l'optimizer di CosmWasm e confronta i checksum. Il codice on chain è stato compilato su un Mac Apple Silicon con l'immagine arm64, quindi usa la stessa: l'immagine x86 produce un checksum diverso.

```bash
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/optimizer-arm64:0.16.1
cat artifacts/checksums.txt
```

Il checksum deve essere `6ebfc32fb9a9c8a412fdb071fb2c317b780ba05f637b8a4d274001c95fb5c43c`, lo stesso `data_hash` che la catena mostra per il codice 865:

```bash
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/code/865" | head -c 400
```

Leggi il registro delle ricevute da qualsiasi luogo, senza bisogno di un account:

```bash
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/contract/qor1xjayq5ev55tkzpml9klxwyshr7gdrha0nurha9jhm0f0gdckksgs3gltw8/smart/$(printf '{"latest":{"limit":3}}' | base64)"
```

### File {#files}

```text
evm/src/CrossVmCheckout.sol         the shop: counts orders, writes receipts through the bridge
evm/test/CrossVmCheckout.t.sol      Foundry tests, with a fake bridge
evm/script/CrossVmCheckout.s.sol    deploy script (reads RECEIPTS_CONTRACT and PRIVATE_KEY)
evm/scripts/window.ts               pnpm window: status, register, open, recovery-code
evm/scripts/xvm.ts                  pnpm xvm: status, checkout, undo, native-fails, outside
evm/.env.example                    the settings to copy into .env
native/src/lib.rs                   qday-receipts, the Native contract
```

## Per saperne di più {#learn-more}

- Il fest, i percorsi Encrypted Apps e Cross-VM e le bounty: [build.qorechain.io](https://build.qorechain.io).
- QoreSeal su npm: [@qorechain/qoreseal](https://www.npmjs.com/package/@qorechain/qoreseal).
- [Precompile EVM](/developer-guide/evm-precompiles) e il [riferimento cross-VM](/developer-guide/cross-vm-reference).
- [Workshop 2](/build-before-qday/workshop-2) per la finestra EVM e il vault.
