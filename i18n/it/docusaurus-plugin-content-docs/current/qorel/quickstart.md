---
slug: /qorel/quickstart
title: Avvio rapido di QORel
sidebar_label: Avvio rapido
sidebar_position: 4
---

# Avvio rapido

Questa guida illustra il relay tra la testnet di QoreChain `qorechain-diana` e la testnet pubblica di Cosmos Hub (chain ID `provider`): installazione, configurazione, aggiunta e registrazione delle chiavi, verifica della prontezza, avvio del relayer e invio di un primo trasferimento. È pensata per chi non ha mai eseguito un relayer. Tutto qui è testnet; i token non hanno alcun valore.

## Innovazioni {#innovations}

- **La prontezza è un unico campo.** `qorel keys pqc-status` termina con `ready_to_relay`. Se è `true`, la chiave post-quantistica è registrata on-chain e coincide con la chiave locale, e il relayer non rifiuterà le proprie transazioni per questo motivo.
- **Non viene inviato nulla quando qualcosa non va.** Il controllo pre-invio ferma una transazione errata prima che raggiunga la chain, così un passaggio saltato non costa alcuna commissione.
- **Lo stesso flusso per ogni chain.** I passaggi per il lato Cosmos Hub sono quelli di Hermes; sono nuovi solo la voce della chain QoreChain e il passaggio di registrazione.

## Come si usa {#how-to-use}

### 1. Installazione {#step-install}

Installa `qorel` con uno qualsiasi dei metodi nella pagina [Installazione](/qorel/install) e verificalo:

```bash
qorel --version
```

### 2. Ottenere la configurazione {#step-config}

Copia la configurazione di esempio dal repository (`packaging/config.example.toml`; i `.deb` e `.rpm` la collocano in `/etc/qorel/config.example.toml`):

```bash
mkdir -p ~/.hermes
curl -o ~/.hermes/config.toml https://raw.githubusercontent.com/qorechain/QORel/main/packaging/config.example.toml
```

Apri `~/.hermes/config.toml` e sostituisci i segnaposto per il nodo QoreChain (`YOUR-QORECHAIN-NODE`) con gli indirizzi RPC, gRPC e WebSocket di un nodo testnet che gestisci tu. QoreChain non ha un endpoint gRPC pubblico, quindi ti serve un tuo nodo; vedi [Eseguire un nodo](/developer-guide/running-a-node) e [Connessione alla testnet](/getting-started/connecting-to-testnet). Ogni impostazione è spiegata in [Configurazione](/qorel/configuration).

La configurazione di esempio ha due chain: `qorechain-diana` con `signing = 'qorechain-hybrid'`, e `provider` con la firma standard predefinita. Limita il relay a `transfer/channel-0` su QoreChain e a `transfer/channel-600` sulla testnet dell'Hub.

### 3. Creare e finanziare gli account del relayer {#step-accounts}

Crea un nuovo account per il relayer su ciascuna chain. Usa un account dedicato, mai la chiave operatore di un validatore. Salva la mnemonica di ciascun account in un file che solo tu puoi leggere:

```bash
umask 077
nano ./diana.mnemonic       # paste the mnemonic, save
nano ./provider.mnemonic
```

La stessa mnemonica può servire per entrambe le chain, oppure puoi usarne una separata per ciascuna. QORel deriva per impostazione predefinita con coin type 118 (`m/44'/118'/0'/0/0`); passa `--hd-path` a `keys add` se il tuo account usa un altro percorso.

Aggiungi le chiavi:

```bash
qorel keys add --chain qorechain-diana --key-name relayer --mnemonic-file ./diana.mnemonic
qorel keys add --chain provider        --key-name relayer --mnemonic-file ./provider.mnemonic
```

Su `qorechain-diana`, `keys add` deriva anche la chiave ML-DSA-87 dalla stessa mnemonica e ne memorizza il seed accanto alla chiave come `relayer.pqc`. Elimina i file delle mnemoniche quando hai finito.

Poi finanzia gli account. Mostra gli indirizzi con `qorel keys list --chain <id>`. I QOR di testnet provengono dal [Faucet della dashboard](/dashboard/faucet); i token di prova per la testnet dell'Hub provengono dal faucet pubblico di quella rete. Bastano pochi token per le commissioni: il minimo di QoreChain è 0,1 uqor per gas, quindi una transazione con il limite di gas predefinito di 400.000 costa circa 40.000 uqor al prezzo minimo. Verifica con:

```bash
qorel keys balance --chain qorechain-diana
qorel keys balance --chain provider
```

### 4. Registrare la chiave post-quantistica {#step-register}

QoreChain accetta una transazione firmata in modo ibrido solo da un account che ha registrato la propria chiave pubblica ML-DSA-87. La registrazione si fa una sola volta:

```bash
qorel keys register-pqc --chain qorechain-diana
```

Invia una transazione, firmata con la sola chiave classica (l'unico tipo di transazione che QoreChain accetta in questo modo), con una prova di possesso. È sicuro eseguirlo di nuovo: se la stessa chiave è già registrata non invia nulla. Se l'account ha già registrata una chiave post-quantistica diversa, si rifiuta e non invia nulla.

Verifica la prontezza:

```bash
qorel keys pqc-status --chain qorechain-diana
```

Il risultato è un oggetto JSON con i campi `chain_id`, `account`, `local_public_key_sha256`, `registered`, `matches_local_key`, `registered_public_key_sha256`, `possession_proven`, `sign_bytes` e `ready_to_relay`. Prosegui solo quando `ready_to_relay` è `true`. Vedi [Risoluzione dei problemi](/qorel/troubleshooting) se non lo è.

### 5. Controllo di stato {#step-health}

```bash
qorel health-check
```

Verifica la configurazione e la connessione a ciascuna chain, e segnala come possibile errore di configurazione un moltiplicatore di gas inferiore a 1.1 su una voce QoreChain (un avviso; il relay funziona comunque).

### 6. Scegliere il canale {#step-channel}

La testnet ha già un canale di trasferimento: `channel-0` su `qorechain-diana`, la cui controparte è `channel-600` su `provider` ([Il canale di test](/user-guide/bridging-assets#ibc-test-channel)). Per fare da relay su di esso, passa direttamente al passaggio 7.

Per creare invece un nuovo canale tuo tra le due chain:

```bash
qorel create channel \
  --a-chain qorechain-diana --b-chain provider \
  --a-port transfer --b-port transfer \
  --new-client-connection
```

`--new-client-connection` crea anche i due light client e la connessione. Questo invia diverse transazioni su ciascuna chain. Il comando stampa gli identificatori del nuovo canale; inseriscili nel `packet_filter` di entrambe le voci delle chain.

### 7. Avviare il relayer {#step-start}

```bash
qorel start
```

Lascialo in esecuzione (usa il servizio systemd o un container per un relayer di lunga durata; vedi [Eseguire QORel accanto a un validatore](/qorel/running-next-to-a-validator)). QORel inoltra i pacchetti, aggiorna i light client e sorveglia il misbehaviour.

### 8. Inviare un primo trasferimento {#step-transfer}

In un secondo terminale, invia 1000 uqor da QoreChain alla testnet dell'Hub. QORel firma e invia da sé questa transazione, con la stessa firma ibrida:

```bash
qorel tx ft-transfer \
  --src-chain qorechain-diana --dst-chain provider \
  --src-port transfer --src-channel channel-0 \
  --amount 1000 --denom uqor \
  --timeout-seconds 600 \
  --receiver <a cosmos address on the Hub testnet>
```

Senza `--receiver`, i token vanno all'indirizzo del relayer stesso sulla chain di destinazione. Poi segui il pacchetto:

```bash
qorel query packet pending --chain qorechain-diana --port transfer --channel channel-0
```

Il pacchetto resta elencato finché il relayer in esecuzione non lo consegna e l'acknowledgement non torna indietro. Su QoreChain puoi anche leggere il canale e le tracce dei token via REST:

```bash
curl -s https://api-testnet.qore.host/ibc/core/channel/v1/channels
curl -s https://api-testnet.qore.host/ibc/apps/transfer/v1/denoms
```

Un trasferimento che non viene consegnato prima del suo timeout viene rimborsato al mittente sulla chain di origine dal relayer. Il valore `--timeout-seconds` qui sopra gli concede dieci minuti.

## Come accedere {#how-to-access}

- **Rete.** Solo la testnet `qorechain-diana` e la testnet pubblica di Cosmos Hub.
- **Ti serve.** QORel, un nodo testnet di QoreChain che gestisci tu (RPC, gRPC e WebSocket), endpoint raggiungibili per la testnet dell'Hub, un account relayer con fondi su ciascuna chain e la mnemonica di ciascuno in un file.
- **Costi.** Solo commissioni in token di prova: su QoreChain, gas per un prezzo con un minimo di 0,1 uqor per gas, senza rimborso del gas non utilizzato.
- **Utenti di container.** Esegui ciascun comando qui sopra come `docker run --rm -v $HOME/.qorel:/home/nonroot/.hermes ghcr.io/qorechain/qorel:0.1.0 <command>`, con i file delle mnemoniche dentro la directory montata, e `start` come container di lunga durata ([Installazione](/qorel/install#container)).

## Dove è pubblicato {#where-published}

Il binario e la configurazione di esempio provengono dal [repository di QORel](https://github.com/qorechain/QORel) (`packaging/config.example.toml`); vedi [Installazione](/qorel/install) per ogni canale e la [panoramica di QORel](/qorel/overview#where-published) per le versioni.

## Limiti e problemi noti {#limits}

- **Solo testnet.** L'IBC su mainnet non è aperto; non puntare questo flusso alla mainnet.
- **Ti serve un tuo nodo QoreChain.** Non esiste un endpoint gRPC pubblico.
- **Un nuovo canale costa commissioni su entrambe le chain** e aggiunge un client e una connessione. Preferisci il relay di `channel-0` a meno che non ti serva un canale tuo.
- **Gli endpoint pubblici lato Hub possono limitare la frequenza.** QORel continua a riprovare, ma per un relay continuo usa i tuoi nodi.
- **In sospeso finché non viene inoltrato.** Se per il canale non è in esecuzione alcun relayer, un trasferimento resta in sospeso finché non ne viene avviato uno o il pacchetto scade.

Prossimi passi: [Configurazione](/qorel/configuration), [Monitoraggio](/qorel/monitoring), [Risoluzione dei problemi](/qorel/troubleshooting).
