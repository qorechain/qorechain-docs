---
slug: /build-before-qday/workshop-4
title: "Workshop 4: Rollup, IBC e QoreX per sviluppatori"
sidebar_label: "Workshop 4"
sidebar_position: 5
date: 2026-11-27
---

# Workshop 4: Rollup, IBC e QoreX per sviluppatori

Il Workshop 4 scende sotto il livello dell'applicazione. Prima, fai girare un **rollup** che si regola su QoreChain: lo crei, prelevi da esso, dimostri cosa ha fatto, poi bari di proposito e guardi l'imbroglio che viene scoperto. Poi, invii **QOR alla testnet del Cosmos Hub e ritorno** tramite IBC. Infine, vedi cosa ti offre il **wallet QoreX** mentre sviluppi una dApp.

Ogni comando qui sotto dice che cosa fa e che cosa dovresti vedere. Il codice è pubblico: [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), cartella `workshop-4`. Tutto qui gira solo su testnet. I token di prova non hanno alcun valore.

**Quanto tempo serve:** circa 45 minuti di passaggi. Il rollup ha anche una finestra di contestazione di un'ora, durante la quale aspetti. Le tre parti sono indipendenti: mentre aspetti nella Parte 1, puoi fare la Parte 2 o la Parte 3.

## Cosa costruiamo {#what-we-built}

| Parte | App | Cosa dimostra |
| --- | --- | --- |
| 1 | **Un rollup** (Node.js, `@qorechain/rdk`) | Batch la cui ancora è firmata con ML-DSA-87, un prelievo pagato con una prova di Merkle, una ricevuta di settlement che chiunque può controllare, una frode provata da un watchtower e una cauzione sottoposta a slashing. |
| 2 | **IBC andata e ritorno** (Node.js, `@qorechain/qoresign`, cosmjs) | I QOR vanno sulla testnet del Cosmos Hub e tornano, trasportati da QORel, il relayer di QoreChain. |
| 3 | **QoreX per sviluppatori** (una guida, nessun codice nuovo) | I provider con cui parla una dApp, i pacchetti di integrazione, la modalità sviluppatore, il registro delle richieste e l'ispettore di transazioni. |

Le innovazioni dietro queste app:

- **Un rollup il cui settlement è firmato in modo post-quantistico.** Il creatore firma la state root di ogni batch onesto con ML-DSA-87 (NIST FIPS 204), e la catena la conserva.
- **Fraud proof che la catena controlla da sé.** Con il ledger `qledger-v1`, QoreChain riesegue un batch contestato. Non occorre fidarsi di nessuno per stabilire chi aveva ragione.
- **Ordine preso da QoreChain.** Con il sequencing based, le transazioni del rollup vengono pubblicate in una inbox su QoreChain, quindi l'operatore non può riordinarle né tralasciare ciò che è stato pubblicato.
- **IBC con firma ibrida sul lato QoreChain.** Il trasferimento che lascia QoreChain è firmato sia con secp256k1 sia con ML-DSA-87.
- **Un wallet che mostra il proprio lavoro.** QoreX registra cosa ha chiesto ogni sito e ti permette di ispezionare cosa ha memorizzato la catena.

## Parole usate in questa guida {#words}

| Parola | Significato in parole semplici |
| --- | --- |
| Rollup | Un sistema che esegue le proprie transazioni fuori dalla catena principale e ogni tanto invia alla catena principale un breve riepilogo |
| Batch | Uno di questi riepiloghi: il nuovo stato del rollup e i prelievi che richiede |
| State root | Una breve impronta di tutti i saldi del rollup |
| Rollup ottimistico | I batch vengono accettati subito e diventano definitivi solo se nessuno dimostra che sono sbagliati durante la finestra di contestazione |
| Finestra di contestazione | Il tempo che chiunque ha per dimostrare che un batch è sbagliato. Sulla testnet è di un'ora |
| Cauzione | Denaro che l'operatore blocca e perde se mente |
| Watchtower | Un account che riesegue le transazioni del rollup e segnala un batch sbagliato |
| `qledger-v1` | Un ledger semplice che la catena stessa sa rieseguire. Gli account al suo interno firmano con ML-DSA-44 |
| Sequencing based | L'ordine delle transazioni del rollup viene dalla inbox su QoreChain, non dall'operatore |
| Ancora | La state root del batch, firmata dal creatore del rollup con ML-DSA-87 e memorizzata on chain |
| Prova di Merkle | Pochi hash che dimostrano che un elemento fa parte di un insieme più grande, senza inviare l'intero insieme |
| IBC | Il modo in cui le catene Cosmos si trasferiscono token senza un custode: ogni catena gestisce un light client dell'altra e controlla le prove |
| Canale | Una corsia tra due catene |
| Voucher | Il token che l'altra catena crea mentre i tuoi QOR restano bloccati su QoreChain |
| Escrow | L'account su QoreChain in cui i QOR inviati aspettano finché il voucher non torna |
| Relayer | Un programma che trasporta pacchetti e prove tra due catene |

:::caution Solo account testnet usa e getta
Gli script creano nuovi account per te. Lascia che sia così. Non inserire mai in un file o in un comando le parole segrete o la chiave di un account che contiene denaro vero.
:::

## Prima di iniziare {#prerequisites}

Ti servono un terminale, **Node.js 20 o successivo** e **Git**: vedi [Prima di iniziare](/build-before-qday/prerequisites). La parte 3 richiede anche **pnpm** e il wallet QoreX. Controlla Node.js:

```bash
node -v
```

Deve stampare `v20` o un numero più alto. Scarica il codice di esempio:

```bash
git clone https://github.com/qorechain/build-before-qday.git
cd build-before-qday/workshop-4
```

La prima riga scarica gli esempi in una cartella chiamata `build-before-qday`. La seconda entra nella cartella `workshop-4`.

Ogni parte richiede una quantità diversa di QOR di prova:

| Parte | Cosa ti serve | Da dove arriva |
| --- | --- | --- |
| 1, account operatore | Circa 12.010 QOR di prova: 10.000 di stake del rollup, 1.000 per lo slot della sidechain, 1.000 di cauzione del submitter e qualcuno per depositi e commissioni | Il faucet dà 100 QOR al giorno, che non bastano. Chiedi al team del fest, sui canali di [build.qorechain.io](https://build.qorechain.io), un'assegnazione testnet più grande |
| 1, account watchtower | Qualche QOR di prova per le commissioni | Il [faucet](/dashboard/faucet) |
| 2 | Circa 2 QOR di prova, più un po' di ATOM di prova | Il [faucet](/dashboard/faucet). Lo script chiede gli ATOM al faucet della testnet del Cosmos Hub |
| 3 | Un po' di QOR di prova nel tuo account testnet di QoreX | Il [faucet](/dashboard/faucet) |

:::tip Nessuna assegnazione grande? Puoi comunque seguire la Parte 1
`node rollup.mjs rollups` non richiede un account, e i passaggi qui sotto mostrano che cosa fa ogni comando.
:::

## Parte 1: un rollup che si regola su QoreChain {#part-1}

Codice: [workshop-4/01-rollup](https://github.com/qorechain/build-before-qday/tree/main/workshop-4/01-rollup). Pacchetto: `@qorechain/rdk`, il Rollup Development Kit.

Percorrerai l'intera vita di un piccolo rollup ottimistico: crearlo, bloccare uno stake, versare la cauzione dell'operatore, depositare, inviare un batch, aspettare, prelevare, creare una ricevuta, barare e scoprire l'imbroglio. Vedi [Rollup](/rollups/overview) per capire come funzionano.

### Passaggio 1: installa {#r1}

```bash
cd 01-rollup
npm install
node rollup.mjs help
```

| Parte | Cosa fa |
| --- | --- |
| `cd 01-rollup` | Entra nella cartella dell'app del rollup. |
| `npm install` | Scarica i pacchetti usati dall'app. Le versioni sono fissate da `package.json` e `package-lock.json`. |
| `node rollup.mjs help` | Esegue lo script ed elenca tutti i comandi. |

**Cosa dovresti vedere:** l'elenco dei comandi: `init`, `rollups`, `prepare`, `status`, `withdraw`, `bond`, `receipt`, `cheat`, `watchtower`.

### Passaggio 2: guarda i rollup sulla testnet {#r2}

```bash
node rollup.mjs rollups
```

Legge la catena. Non serve un account.

**Cosa dovresti vedere:** una prima riga con il numero di rollup e lo stake e la cauzione che la catena chiede oggi (10.000 QOR e 1.000 QOR quando è stata scritta questa guida), poi una riga per ogni rollup: il suo id, se è attivo, come si regola (`optimistic` o `zk`), il tipo di VM e il blocco in cui è stato creato.

**Perché:** mostra che le cifre che pagherai vengono dalla catena, non dallo script.

### Passaggio 3: crea due account {#r3}

```bash
node rollup.mjs init
```

Crea due account, l'**operatore** e il **watchtower**. Le loro parole segrete vengono salvate in `~/.config/qday-w4/operator.json` e `watcher.json`, leggibili solo da te, e non vengono mai stampate. Il file dell'operatore contiene anche due seed casuali per le chiavi rollup di due utenti, Ana e Ben. Per tenere i file altrove, imposta la variabile d'ambiente `QDAY_DIR`.

**Cosa dovresti vedere:** due indirizzi `qor1...`. Finanzia entrambi, come indicato in [Prima di iniziare](#prerequisites).

**Perché due account:** chi segnala un batch sbagliato non dovrebbe essere chi lo ha pubblicato.

### Passaggio 4: crea il rollup e invia il batch 0 {#r4}

```bash
node rollup.mjs prepare
```

Questo singolo comando esegue l'intera preparazione. Ricorda cosa ha già fatto in `~/.config/qday-w4/rollup-state.json`, quindi puoi eseguirlo di nuovo se qualcosa si ferma a metà.

| Cosa invia | Cosa fa |
| --- | --- |
| `createRollup` | Crea il tuo rollup con esecuzione `qledger-v1` e sequencing based, e blocca lo stake. |
| `bondRollupSubmitter` | Blocca la cauzione di 1.000 QOR. |
| Due depositi | 3 QOR per Ana e 1 QOR per Ben entrano nel rollup. |
| Tre transazioni del rollup | Ana paga a Ben 0,5 QOR, Ana preleva 0,3 QOR, Ben preleva 0,2 QOR. Ognuna è firmata con la chiave ML-DSA-44 del mittente e pubblicata nella inbox su QoreChain. |
| `submitBatch` | Lo script rilegge la inbox, la riesegue per ottenere la nuova state root e la withdrawals root, e invia il batch 0. L'RDK ne firma l'ancora con ML-DSA-87. |

**Cosa dovresti vedere:** una riga `ok` per ogni transazione, con il blocco e un link all'explorer. Poi lo stato del tuo rollup, con il batch 0 mostrato come `submitted`.

### Passaggio 5: aspetta un'ora, poi controlla {#r5}

```bash
node rollup.mjs status
```

**Cosa dovresti vedere:** il rollup, lo stake dell'operatore, il pool dei prelievi, la cauzione e ogni batch. Dopo la finestra di contestazione di un'ora, il batch 0 mostra `finalized`.

**Perché l'attesa:** un rollup ottimistico è sicuro perché c'è il tempo di dimostrare che un batch è sbagliato prima che il denaro esca.

### Passaggio 6: preleva su QoreChain {#r6}

```bash
node rollup.mjs withdraw 0
node rollup.mjs withdraw 1
```

Il prelievo `0` sono gli 0,3 QOR di Ana e il prelievo `1` gli 0,2 QOR di Ben. In questa demo entrambi vengono pagati all'account operatore. Lo script costruisce una prova di Merkle del fatto che il prelievo è nella withdrawals root del batch 0, e la catena la controlla rispetto alla root che ha memorizzato prima di pagare. Poi lo script invia lo stesso prelievo una seconda volta.

**Cosa dovresti vedere:** il numero di hash nella prova, una riga `ok`, il saldo del destinatario prima e dopo (lo stesso account ha pagato la commissione) e poi il secondo tentativo contrassegnato `REFUSED`. Un prelievo viene pagato una sola volta.

Se il batch 0 non è ancora definitivo, il comando si ferma e dice che i prelievi vengono pagati solo dopo la finestra di contestazione.

### Passaggio 7: una ricevuta di settlement {#r7}

```bash
node rollup.mjs receipt 0
```

Crea un piccolo file JSON che descrive il batch 0 e lo salva accanto alle tue chiavi. Chiunque può controllarlo: il controllo rilegge tutto da QoreChain e non si fida del file.

| Controllo | Cosa dimostra |
| --- | --- |
| `rollupLayerBinding` | Il rollup appartiene al layer indicato dalla ricevuta |
| `batchStateRoot` | Il batch sulla catena porta esattamente questa state root |
| `anchorOnChain` | On chain esiste un'ancora con ogni campo della ricevuta |
| `creatorAuthority` | La chiave di firma è stata letta dalla catena, non dalla ricevuta |
| `pqcSignature` | La firma ML-DSA-87 sull'ancora è valida |
| `chainBinding` | La ricevuta appartiene a questa catena e non è una copia presa altrove |

**Cosa dovresti vedere:** `VALID` con un segno di spunta accanto a ciascuno dei sei controlli. Poi lo script cambia una cifra esadecimale della state root e controlla di nuovo: `NOT VALID`.

**Perché è utile:** un exchange, un revisore o un altro sistema può verificare lo stato di un rollup senza fidarsi di chi ha inviato il file.

### Passaggio 8: un operatore disonesto {#r8}

```bash
node rollup.mjs cheat
```

Ben paga ad Ana 0,1 QOR dentro il rollup, e poi l'operatore invia il batch 1 con un bit della state root invertito, di proposito.

**Cosa dovresti vedere:** due righe `ok`. La seconda dice che il batch è stato pubblicato con una **state root sbagliata**. Per ora la catena lo accetta: c'è un'ora per dimostrare che è sbagliato, e la cauzione dell'operatore è in gioco.

### Passaggio 9: il watchtower lo scopre {#r9}

```bash
node rollup.mjs watchtower
```

Questo comando usa l'account watchtower, non quello dell'operatore.

| Passaggio | Cosa succede |
| --- | --- |
| 1 | Legge il batch 1 dalla catena. |
| 2 | Legge esattamente la parte della inbox usata dal batch 1 e la riesegue partendo dallo stato successivo al batch 0. Si ottiene così la root onesta. |
| 3 | Costruisce la fraud proof e la controlla sul tuo computer. |
| 4 | Invia `challengeBatch`. La catena riesegue il batch da sé, lo respinge e applica lo slashing alla cauzione: metà viene bruciata e metà va al watchtower. |

**Cosa dovresti vedere:** la root sbagliata e la root onesta, il risultato del controllo locale, una riga `ok` per la contestazione, il batch contrassegnato come respinto e il saldo del watchtower prima e dopo.

:::note Qualcuno potrebbe essere più veloce di te
La testnet ha già dei watchtower indipendenti. Se uno di loro prova la frode per primo, cosa che può richiedere un solo blocco, il tuo script dice che il batch è già stato respinto ed esegue solo il controllo locale. In ogni caso, l'operatore perde la cauzione.
:::

Per barare di nuovo, prima ripristina la cauzione:

```bash
node rollup.mjs bond
```

### Come è organizzato il codice {#r-code}

È tutto in un solo file, `rollup.mjs`. Ogni comando è una funzione nell'oggetto `cmds`, nell'ordine dei passaggi qui sopra. La funzione `connect()` trasforma un file di account in un client di transazioni RDK che firma ogni transazione QoreChain con entrambe le chiavi, secp256k1 e ML-DSA-87.

## Parte 2: QOR verso il Cosmos Hub e ritorno {#part-2}

Codice: [workshop-4/02-ibc](https://github.com/qorechain/build-before-qday/tree/main/workshop-4/02-ibc). Pacchetti: `@qorechain/qoresign` e cosmjs. Reti: la testnet di QoreChain `qorechain-diana` e la testnet del Cosmos Hub `provider`.

Questa app invia 0,5 QOR dalla testnet di QoreChain alla testnet del Cosmos Hub e li riporta indietro. [QORel](https://github.com/qorechain/QORel), il relayer di QoreChain, trasporta i pacchetti tra le due catene. Quando è stata scritta questa guida, la testnet di QoreChain aveva dieci canali IBC: Cosmos Hub, Osmosis, Injective, Akash, Celestia, Coreum, dYdX, Fetch, Allora e ixo. IBC gira solo sulla testnet: non è attivo sulla mainnet.

Come funziona:

1. Una sola chiave ti dà due indirizzi: `qor1...` su QoreChain e `cosmos1...` sull'Hub.
2. **Andata:** il trasferimento viene firmato su QoreChain con entrambe le chiavi, e la catena le controlla entrambe. QORel porta il pacchetto e una prova all'Hub. Il light client di QoreChain sull'Hub controlla la prova e crea un voucher per i QOR.
3. **Ritorno:** sull'Hub, il trasferimento viene firmato nel modo abituale dell'Hub. Il light client dell'Hub su QoreChain controlla la prova. Il voucher viene bruciato e i QOR originali vengono rilasciati.

:::info Due limiti da conoscere
Il `channel-0` di QoreChain è il `channel-600` dell'Hub. Il nome del voucher sull'Hub è `ibc/` seguito dallo SHA-256 di `transfer/channel-600/uqor`. Su ogni canale QOR della testnet, al massimo l'1% dell'offerta di QOR può attraversare in 24 ore, come freno di sicurezza.
:::

### Passaggio 1: installa {#i1}

```bash
cd ../02-ibc
npm install
node ibc.mjs help
```

La prima riga passa da `01-rollup` a `02-ibc`. Se sei nella cartella `workshop-4`, usa `cd 02-ibc`.

**Cosa dovresti vedere:** l'elenco dei comandi: `init`, `channels`, `status`, `register`, `hub-faucet`, `send`, `back`.

### Passaggio 2: una chiave, due catene {#i2}

```bash
node ibc.mjs init
```

Crea un account e salva le sue parole segrete in `~/.config/qday-w4/traveler.json`, leggibile solo da te. Non vengono mai stampate. `QDAY_DIR` cambia la cartella.

**Cosa dovresti vedere:** l'indirizzo QoreChain dell'account e il suo indirizzo Cosmos Hub. Incolla l'indirizzo `qor1...` nel [faucet](/dashboard/faucet).

### Passaggio 3: elenca i canali {#i3}

```bash
node ibc.mjs channels
```

Legge ogni canale IBC sulla testnet di QoreChain e la catena all'altro capo. Non serve un account.

**Cosa dovresti vedere:** una riga per ogni canale con il suo stato (`OPEN`), l'id dell'altra catena e il nome del canale su quel lato. L'ultima riga mostra che la mainnet non ha ancora canali.

### Passaggio 4: registra la tua chiave post-quantistica e ottieni ATOM {#i4}

```bash
node ibc.mjs register
node ibc.mjs hub-faucet
node ibc.mjs status
```

| Comando | Cosa fa |
| --- | --- |
| `register` | Mette on chain la tua chiave pubblica ML-DSA-87, una sola volta. Le transazioni QoreChain successive vengono controllate con essa. |
| `hub-faucet` | Chiede al faucet pubblico della testnet del Cosmos Hub gli ATOM, che pagano le commissioni del ritorno. |
| `status` | Mostra i tuoi QOR su QoreChain, il voucher e gli ATOM sull'Hub, e se la tua chiave è on chain. |

**Cosa dovresti vedere:** dopo `status`, il tuo saldo in QOR, `ML-DSA-87 key on chain: yes` e un po' di ATOM. Se un saldo è ancora a zero, aspetta un minuto ed esegui di nuovo `status`.

### Passaggio 5: andata {#i5}

```bash
node ibc.mjs send 0.5
```

Costruisce un messaggio di trasferimento di token (`MsgTransfer`, lo standard ICS-20) su `channel-0`, lo firma con entrambe le chiavi tramite QoreSign, poi aspetta che il voucher compaia sull'Hub.

**Cosa dovresti vedere:** tre righe numerate: la transazione firmata con il numero del pacchetto, il blocco e il link all'explorer; QORel che trasporta il pacchetto; e l'arrivo del voucher sull'Hub, con il numero di secondi impiegati. Di solito ogni direzione richiede pochi secondi. I tuoi tempi possono essere diversi.

### Passaggio 6: e ritorno {#i6}

```bash
node ibc.mjs back
```

Rimanda a casa ogni voucher attraverso `channel-600`. La transazione sull'Hub viene firmata con un normale client cosmjs, al prezzo del gas corrente dell'Hub. Poi lo script aspetta il ritorno dei QOR.

**Cosa dovresti vedere:** la transazione sull'Hub, poi il voucher bruciato sull'Hub e i semplici QOR rilasciati su QoreChain.

### Come è organizzato il codice {#i-code}

È tutto in un solo file, `ibc.mjs`. `sendTx()` costruisce e firma una transazione QoreChain ibrida con QoreSign. `hubWallet()` trasforma le stesse parole segrete in un wallet dell'Hub con il prefisso `cosmos`. Ogni comando è una funzione nell'oggetto `cmds`.

## Parte 3: QoreX per sviluppatori {#part-3}

Guida: [workshop-4/03-qorex-developer-mode](https://github.com/qorechain/build-before-qday/tree/main/workshop-4/03-qorex-developer-mode). Non c'è codice nuovo: usi l'[Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) del Workshop 1.

I passaggi qui sotto usano l'**estensione per browser QoreX 0.4.5** su Chrome o Firefox. L'estensione per Safari è una versione precedente. Anche l'app QoreX (1.2.5, iPhone e Android) ha la modalità sviluppatore: la attivi nelle **Impostazioni**, come spiegato in [Modalità sviluppatore](/qorex/developer-mode).

### Con cosa parla una dApp {#providers}

QoreX aggiunge tre provider alle pagine web:

| Provider | Per | Standard |
| --- | --- | --- |
| `window.ethereum` | dApp EVM. QoreX si annuncia anche tramite EIP-6963 | EIP-1193 |
| `window.qorex.native` | Transazioni QoreChain native, firmate con secp256k1 e ML-DSA-87 | API QoreX |
| `window.qorex.svm` | La corsia SVM | API QoreX |

Questi pacchetti su npm collegano QoreX agli strumenti più comuni:

| Pacchetto | Uso |
| --- | --- |
| `@qorechain/qorex-rainbowkit` | QoreX in RainbowKit (EVM) |
| `@qorechain/qorex-cosmos-kit`, `@qorechain/qorex-interchain-kit` | QoreX in Cosmos Kit e Interchain Kit |
| `@qorechain/qorex-types` | Tipi TypeScript per `window.qorex` |
| `@qorechain/qorex-wallet-mock`, `@qorechain/qorex-synpress` | Testare la tua dApp con QoreX in test automatici |
| `@qorechain/sdk`, `@qorechain/wallet-adapter` | Costruire e inviare transazioni con firma ibrida |

Vedi [Integrazione delle dApp](/qorex/dapp-integration) per i dettagli.

### Passaggio 1: attiva la modalità sviluppatore {#x1}

Nel popup dell'estensione, clicca **sette volte** sul numero di versione in fondo alla schermata iniziale. Compare una sezione **Modalità sviluppatore** con **Strumenti per sviluppatori**, **Passa alla testnet (diana)** e **Disattiva la modalità sviluppatore**. Clicca su **Passa alla testnet (diana)**.

**Perché per prima cosa:** il registro delle richieste registra le richieste solo mentre la modalità sviluppatore è attiva.

### Passaggio 2: avvia l'Hybrid Inspector {#x2}

Dalla cartella `workshop-4`:

```bash
cd ../workshop-1/03-hybrid-inspector
pnpm install
pnpm dev
```

La prima riga passa all'app del Workshop 1, `pnpm install` ne scarica i pacchetti e `pnpm dev` avvia una pagina web locale. Apri l'indirizzo che stampa (di solito `http://localhost:5173`) e collega QoreX.

### Passaggio 3: invia una richiesta mentre il wallet è bloccato {#x3}

Clicca su **Blocca** in QoreX. Nell'Inspector, invia 0,001 QOR al tuo stesso indirizzo con il memo `Workshop 4`.

**Cosa dovresti vedere:** QoreX chiede la tua password e **nomina il sito** che sta facendo la richiesta. Dopo lo sblocco, l'approvazione mostra l'importo, il destinatario e il memo. Approvala: la transazione viene firmata con entrambe le chiavi. Se invece chiudi la finestra, la richiesta viene rifiutata.

**Perché è importante:** nulla viene firmato senza la tua password, e sai quale sito sta facendo la richiesta.

### Passaggio 4: apri gli Strumenti per sviluppatori {#x4}

Apri **Strumenti per sviluppatori** e guarda sotto **Transazioni**:

- **Registro delle richieste:** cosa ha chiesto ogni sito a QoreX, con il metodo, i parametri e la tua risposta.
- **Ispettore di transazioni:** incolla l'hash di una transazione o una richiesta in **Hash o richiesta** e clicca su **Ispeziona**. Con un hash, vedi cosa ha registrato la catena, senza uscire dal wallet.

Ci sono 17 strumenti per sviluppatori in tutto. [Modalità sviluppatore](/qorex/developer-mode) spiega ciascuno.

### Altre novità in QoreX 1.2.5 {#also-new}

- **Una finestra EVM manuale consente solo trasferimenti di QOR, per impostazione predefinita.** Puoi scegliere un ambito più ampio, e vedi cosa concedi.
- **Multisig PQC:** un account condiviso i cui membri firmano ciascuno in modo post-quantistico.
- **Rotazione e riparazione della chiave:** sostituisci o ripara la tua chiave ML-DSA-87 on chain senza cambiare indirizzo.

## Risoluzione dei problemi {#troubleshooting}

| Cosa vedi | Cosa fare |
| --- | --- |
| `no operator account yet` | Esegui prima `node rollup.mjs init`. |
| `no rollup yet` | Esegui prima `node rollup.mjs prepare`. |
| `createRollup` viene rifiutato per mancanza di fondi | All'account operatore servono circa 12.010 QOR di prova. Vedi [Prima di iniziare](#prerequisites). |
| `prepare` si ferma a metà | Eseguilo di nuovo. Riprende da ciò che ha già fatto. |
| `withdrawals are paid only after the challenge window` | Il batch 0 non è ancora definitivo. Controlla con `node rollup.mjs status` e riprova più tardi. |
| `nothing to challenge` | Esegui prima `node rollup.mjs cheat`. |
| Il batch è già respinto quando esegui `watchtower` | Un altro watchtower sulla testnet è stato più veloce. È normale. |
| `no account "traveler"` | Esegui prima `node ibc.mjs init`. |
| `does not exist on chain yet` | Ottieni QOR di prova dal faucet per quell'indirizzo, poi riprova. |
| `nothing after 120 s` | Il relayer potrebbe essere occupato. Aspetta un minuto ed esegui `node ibc.mjs status`. |
| Il registro delle richieste è vuoto | Attiva la modalità sviluppatore prima di usare la dApp. |

## Per saperne di più {#learn-more}

- Il fest, i suoi livelli e le sue track: [build.qorechain.io](https://build.qorechain.io).
- [Rollup](/rollups/overview) e l'RDK. L'RDK è disponibile per TypeScript, Python, Rust, Go e Java, con uno strumento a riga di comando, `qorollup`, e un template di progetto.
- Per seguire i nuovi batch man mano che arrivano, guarda `watchBatches` nell'RDK: un punto di partenza per un watchtower che gira tutto il giorno.
- [QORel](https://github.com/qorechain/QORel) è open source. Installalo con `brew install qorechain/tap/qorel` oppure usa il container `ghcr.io/qorechain/qorel`. Eseguilo solo con le tue chiavi.
- Per provare un altro canale nella Parte 2, modifica `CHANNEL`, `HUB_CHANNEL` e gli endpoint dell'altra catena in `ibc.mjs`. `node ibc.mjs channels` li elenca.
- [Modalità sviluppatore](/qorex/developer-mode) e [integrazione delle dApp](/qorex/dapp-integration) in QoreX.
- [Workshop 3, QoreSeal](/build-before-qday/workshop-3#part-1), se il tuo rollup deve mantenere privati i dati che pubblica.
