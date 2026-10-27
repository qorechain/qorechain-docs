---
slug: /qorel/troubleshooting
title: Risoluzione dei problemi e FAQ di QORel
sidebar_label: Risoluzione dei problemi
sidebar_position: 9
---

# Risoluzione dei problemi e FAQ

Domande e soluzioni per eseguire QORel, nell'ordine in cui di solito ci si imbatte in esse. È pensata per gli operatori con un relayer che non si avvia, si rifiuta di inviare o lascia i pacchetti in sospeso. Oggi QORel è solo testnet, quindi ogni risposta presuppone `qorechain-diana`.

## Innovazioni {#innovations}

La maggior parte dei problemi su una chain ibrida viene intercettata prima che venga spesa una commissione:

- **Il controllo pre-invio indica il problema.** Se la chiave post-quantistica non è caricata, non è registrata o non è la chiave locale, oppure la versione dei sign-bytes è sconosciuta, QORel non invia nulla e dice quale dei casi si verifica.
- **`keys pqc-status` è il primo comando da eseguire.** Mostra la registrazione, la corrispondenza della chiave, la prova di possesso, la versione dei sign-bytes che la chain verifica e `ready_to_relay`.
- **`health-check` spiega le configurazioni errate**, incluso un moltiplicatore di gas inferiore a 1.1 su una voce QoreChain.

## Come si usa {#how-to-use}

Esegui prima questi comandi e confronta:

```bash
qorel --version
qorel health-check
qorel keys pqc-status --chain qorechain-diana
qorel query packet pending --chain qorechain-diana --port transfer --channel channel-0
```

### Chiavi e registrazione {#keys}

**`ready_to_relay` è `false`. Che cosa faccio?**
Leggi gli altri campi di `keys pqc-status`:
- `registered: false`: l'account non ha alcuna chiave post-quantistica registrata. Finanzia l'account, poi esegui `qorel keys register-pqc --chain qorechain-diana`.
- `registered: true` ma `matches_local_key: false`: l'account ha registrata una chiave diversa da quella che detiene QORel. Controlla di aver usato la mnemonica dell'account e il `--key-name` corretto. Se hai riaggiunto la chiave, `keys add --overwrite` ricostruisce la chiave locale e il suo seed `<key name>.pqc` dalla mnemonica.
- Il comando non riesce a caricare la chiave: il file `<key name>.pqc` accanto alla chiave manca o non è leggibile. Esegui di nuovo `keys add` per quella chain.

**`keys register-pqc` dice che l'account ha già una chiave diversa.**
Non ha inviato nulla, di proposito. La chiave on-chain è stata registrata da un'altra mnemonica o da un altro strumento. Usa la mnemonica originale, oppure ruota la chiave on-chain a partire da quella vecchia ([Firma post-quantistica](/developer-guide/post-quantum-signing#key-rotation)); una chiave che l'account ha usato in precedenza non può essere registrata di nuovo.

**`keys register-pqc` fallisce con un errore di commissione o di saldo.**
L'account ha bisogno di QOR sulla testnet prima di poter inviare la sua prima transazione. Usa il [Faucet della dashboard](/dashboard/faucet). La registrazione richiede qualche centinaio di migliaia di gas; al minimo di 0,1 uqor sono alcune decine di migliaia di uqor.

**Mi serve `--no-proof`?**
Solo per una rete precedente alla v3.2.3. Entrambe le reti QoreChain accettano una prova di possesso, e QORel ne aggiunge una per impostazione predefinita.

**Dove è memorizzata la mia chiave post-quantistica?**
Accanto alla chiave secp256k1, come `<key name>.pqc` (un seed di 32 byte), leggibile solo dal proprietario. Può essere derivata di nuovo dalla mnemonica. Fai il backup della mnemonica, non dei file.

**I miei file delle chiavi sono leggibili da altri.**
QORel scrive i nuovi file delle chiavi con 0600. Le chiavi aggiunte con un Hermes precedente mantengono la loro vecchia modalità; esegui `chmod 600` su di esse.

### Configurazione {#config}

**La configurazione viene rifiutata con un messaggio su `extension_options`.**
Le `extension_options` statiche non possono essere combinate con `signing = 'qorechain-hybrid'`: la firma post-quantistica deve essere l'unica opzione di estensione critica. Rimuovile dalla voce di quella chain.

**Dice che la chain non usa `signing = "qorechain-hybrid"`.**
I comandi per le chiavi post-quantistiche funzionano solo su chain con quell'impostazione. Aggiungila alla voce QoreChain.

**Devo impostare la versione dei sign-bytes?**
No. `pqc.sign_bytes = 'auto'` la legge dalla chain, la rilegge ogni minuto e dopo ogni rifiuto. Un `v1` o `v2` fisso che non corrisponde alla chain fa sì che rifiuti ogni transazione.

**`pqc-status` mostra `sign_bytes` come sconosciuto.**
QORel non è riuscito a leggere i record di upgrade della chain. Controlla che `rpc_addr` per la voce QoreChain risponda e punti alla rete giusta (`qorechain-diana` sulla testnet). QORel non firma senza una versione nota.

**Quale moltiplicatore di gas devo usare?**
`1.1` è il valore predefinito dell'esempio e mantiene silenzioso `health-check`. Sulla testnet (v3.2.6) funziona un valore più basso come `1.05`. Le build precedenti sottostimano il gas simulato, quindi usa `1.15` su un nodo che ne esegue una. Vedi [Gas](/qorel/configuration#gas).

**`health-check` avvisa sul moltiplicatore di gas.**
È inferiore a 1.1 su una voce QoreChain. È solo un avviso; il relay funziona. Alzalo se vedi errori di gas esaurito.

### Invio e relay {#relaying}

**La chain rifiuta una transazione con codespace `pqc`, codice 21.**
La firma ibrida non è stata verificata. QORel rilegge la versione dei sign-bytes e la registrazione prima della transazione successiva e riprova. Se si ripete: conferma che `id` nella voce della chain sia esattamente il chain ID (`qorechain-diana`), che la chiave sia quella registrata (`keys pqc-status`) e che il nodo che usi esegua la versione che ti aspetti. [Firma post-quantistica](/developer-guide/post-quantum-signing#code-21) elenca le cause.

**Non viene inviato nulla e non si spende alcuna commissione, ma il relayer registra un errore.**
È il controllo pre-invio che fa il suo lavoro. La riga di log indica l'elemento mancante: chiave non caricata, chiave non registrata, chiave non corrispondente o versione dei sign-bytes sconosciuta. Risolvi come indicato sopra.

**Errori `account sequence mismatch`.**
Due processi firmano con la stessa chiave del relayer. Esegui un relayer per chiave; questo include un servizio systemd più un container, e un secondo pod Kubernetes.

**Vedo `429 Too Many Requests` nei log.**
L'endpoint sta limitando la frequenza, di solito uno pubblico dopo un riavvio. QORel lo tratta come ritentabile e mantiene attivi i suoi worker dei pacchetti, riprovando a ogni intervallo di clearing. Per un relay continuo usa i tuoi nodi o un endpoint a pagamento. La testnet di QoreChain non ha un endpoint gRPC pubblico, quindi il lato QoreChain richiede comunque un tuo nodo.

**Commissioni o errori di gas esaurito su QoreChain.**
La commissione è il limite di gas per il prezzo, senza rimborso, e il minimo è 0,1 uqor per gas. Controlla `gas_price`, che sia impostato `dynamic_gas_price.backend = 'cosmos-evm-feemarket'` e il saldo dell'account (`qorel keys balance --chain qorechain-diana`).

### Pacchetti e canali {#packets}

**Il mio trasferimento è in sospeso e non arriva nulla.**
Controlla, in ordine: che un relayer sia in esecuzione per il canale (il processo è attivo; la telemetria risponde); che il canale sia nel tuo `packet_filter` su entrambe le chain; che il relayer abbia un saldo sulla chain di destinazione; che la chiave post-quantistica sia pronta; che gli endpoint siano raggiungibili. Poi esegui `qorel query packet pending` per il canale. Se nessun relayer è in esecuzione, il pacchetto attende finché ne parte uno o il trasferimento scade.

**Che cosa succede se un trasferimento scade?**
Quando il relayer è in esecuzione, inoltra il timeout e i token vengono rimborsati al mittente sulla chain di origine. Questo è stato testato sul canale della testnet.

**Posso usare il canale di test esistente o me ne serve uno mio?**
`channel-0` della testnet verso `channel-600` della testnet dell'Hub è aperto ([Il canale di test](/user-guide/bridging-assets#ibc-test-channel)); esegui QORel con quel `packet_filter` per farne il relay. Creane uno tuo con `qorel create channel ... --new-client-connection` solo se ti serve.

**`create channel` fallisce a metà.**
L'handshake è costituito da più transazioni su entrambe le chain. Esegui `qorel health-check`, risolvi la causa, poi riesegui il comando con `--a-connection` impostato sulla connessione che ha già creato, oppure ricomincia con `--new-client-connection`.

**Hermes standard funziona con QoreChain?**
No. QoreChain rifiuta una transazione senza la firma ML-DSA-87, e Hermes standard non la aggiunge. QORel è Hermes più quella firma.

### Generale {#general}

**QORel può fare da relay per chain diverse da QoreChain?**
Sì. Una chain senza `signing` usa il formato di transazione standard di Hermes, byte per byte.

**Supporta la mainnet?**
Non ancora. Non è aperto alcun canale IBC su mainnet. Quando l'IBC su mainnet verrà aperto, questo manuale lo dirà.

**Supporta IBC v2?**
Non ancora. Il relay IBC v2 non è implementato in QORel; è la fase successiva. Il relay Ethereum (Eureka) non è stato avviato.

**Windows?**
No. Usa il container sotto WSL2.

**Dove segnalo un problema?**
Apri una issue su [github.com/qorechain/QORel](https://github.com/qorechain/QORel/issues). Includi la versione di QORel, la voce della chain con i dati sensibili oscurati e l'output di `qorel keys pqc-status`; non pubblicare mai una mnemonica, un file di chiave o un seed `.pqc`.

## Come accedere {#how-to-access}

- Ogni comando qui sopra si esegue sull'host del relayer con la stessa configurazione del relayer.
- Stato pubblico con cui confrontarsi: il REST della testnet di QoreChain su `https://api-testnet.qore.host` ([Connessione alla testnet](/getting-started/connecting-to-testnet)) e il [block explorer](https://explore.qore.network) (passa a Testnet).

## Dove è pubblicato {#where-published}

QORel si trova nel repository [qorechain/QORel](https://github.com/qorechain/QORel); le issue vanno lì. La guida di Hermes originale, [hermes.informal.systems](https://hermes.informal.systems), tratta le impostazioni e i comandi che QORel condivide con esso.

## Limiti e problemi noti {#limits}

- **Solo testnet**, e una release 0.x.
- **Nessun relay IBC v2 per ora** (fase successiva), e nessun relay Ethereum (Eureka).
- **Gli endpoint di terze parti limitano la frequenza.** Gli endpoint lato Hub nella configurazione di esempio sono pubblici e non gestiti da QoreChain.
- **Questa pagina non può coprire ogni errore di Hermes.** Per gli errori che non menzionano la chiave post-quantistica, i sign bytes o QoreChain, valgono la guida di Hermes e il suo issue tracker.

Vedi anche: [Configurazione](/qorel/configuration), [Monitoraggio](/qorel/monitoring), [Firmare da qualsiasi linguaggio](/qorel/signing-from-any-language).
