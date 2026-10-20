---
slug: /light-node/ux-edition
title: Edizione UX (Dashboard Web)
sidebar_label: Edizione UX
sidebar_position: 3
---

# Edizione UX — Dashboard Web

L'edizione **UX (User eXperience)** esegue lo stesso demone light node dell'edizione SX, ma aggiunge una **dashboard web integrata** che permette di monitorare il nodo e la rete dal browser. Il binario è `lightnode-ux`. Come l'edizione SX, questa pagina descrive il light node **3.1.9** (una propria linea di versione, separata dalla versione della chain).

L'edizione UX è la scelta giusta per l'uso desktop e per gli operatori che preferiscono un'interfaccia visiva alla riga di comando.

## Installazione

I binari precompilati funzionano nativamente su **sei piattaforme senza dipendenze native** — Linux (amd64, arm64), macOS (Intel, Apple Silicon) e Windows (amd64, arm64) — ciascuno di circa 13 MB. Verifica il checksum del download rispetto al manifest prima di eseguirlo — vedi [Edizione SX](/light-node/sx-edition#install) per il procedimento.

### Compilazione da sorgente

L'edizione UX richiede **Go 1.26.1**. La sua crittografia post-quantistica è un'implementazione pura in Go (nessun CGO, nessuna libreria nativa):

```bash
go build -o build/lightnode-ux ./cmd/lightnode-ux/
```

Compila dal tag della release (`git checkout v3.1.9`). Questo produce `build/lightnode-ux`.

### Docker

Il servizio UX viene compilato da `Dockerfile.ux` nel repository dei sorgenti (`github.com/qorechain/qorechain-lightnode`, tag `v3.1.9`). Il container ha bisogno di un `config.toml` nel proprio volume di dati prima di potersi avviare. Il binario UX dispone dei comandi di configurazione, quindi puoi crearlo direttamente nel volume:

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='...'
export QORECHAIN_RPC_ADDR=https://rpc.qore.host     # testnet: https://rpc-testnet.qore.host

docker compose run --rm lightnode-ux onboard
docker compose run --rm lightnode-ux keys add-operator --recover   # to register this node
docker compose run --rm lightnode-ux register --delegate-to qorvaloper1...
```

All'interno di un container la dashboard deve ascoltare su tutte le interfacce del container, quindi imposta questo valore in quella configurazione (`/root/.qorechain-lightnode/config.toml` nel volume) e pubblica la porta solo sul loopback dell'host. Il `docker-compose.yml` fornito pubblica `8420:8420`, che è raggiungibile da altre macchine; modificalo:

```toml
[dashboard]
bind_addr = "0.0.0.0:8420"
```

```yaml
# docker-compose.yml, lightnode-ux service
ports:
  - "127.0.0.1:8420:8420"
```

```bash
docker compose up -d lightnode-ux
```

Il container UX persiste i dati, keyring compreso, in un volume denominato su `/root/.qorechain-lightnode` e legge l'indirizzo RPC della chain dalla variabile d'ambiente `QORECHAIN_RPC_ADDR`. Il nodo firma da solo le proprie transazioni, quindi un container UX può registrarsi e inviare heartbeat come l'edizione SX. L'immagine UX non include `qorechaind`, quindi l'alternativa `qorechaind` non è disponibile al suo interno.

## Esecuzione

Avvia il nodo UX:

```bash
build/lightnode-ux start
```

Questo avvia insieme il demone e il server della dashboard integrata. L'edizione UX abilita sempre la dashboard. All'avvio il binario stampa l'URL della dashboard.

L'edizione UX condivide la configurazione con l'edizione SX: legge lo stesso `config.toml` da `~/.qorechain-lightnode` e usa lo stesso keyring, e dispone degli stessi comandi (`onboard`, `keys`, `register`, `status`, `selftest` e gli altri). La configurazione iniziale consiste negli stessi cinque passaggi, con `lightnode-ux` al posto di `lightnode-sx`:

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'
lightnode-ux onboard
lightnode-ux keys add-operator --recover
lightnode-ux register --delegate-to qorvaloper1...
lightnode-ux start
```

Vedi [Edizione SX](/light-node/sx-edition#first-run-onboard) per cosa fa ciascun comando e [Registrazione e Licenze](/light-node/registration-and-licensing) per i requisiti. Il demone dell'edizione UX firma e invia gli heartbeat allo stesso modo dell'edizione SX, su Linux, macOS e Windows. Quando `register` viene eseguito dal binario UX, il nodo viene registrato con tipo `ux`.

## La dashboard web sulla porta 8420

La dashboard è esposta sulla **porta 8420**. È la porta che l'immagine Docker `lightnode-ux` dichiara (`EXPOSE 8420`) ed è quella predefinita a cui si collega il binario, quindi quando viene eseguito in Docker la dashboard viene pubblicata sulla porta `8420`:

```
http://localhost:8420
```

:::caution Controlla il mapping delle porte nel tuo compose
Alcuni testi altrove fanno riferimento alla porta 8080 per la dashboard. Il valore autorevole è **8420** — è quello che l'immagine espone effettivamente e su cui il demone si collega per impostazione predefinita. Se adatti il tuo `docker-compose.yml` o un reverse proxy, mappa alla porta **8420**, non 8080.
:::

:::caution Proteggi la dashboard
La dashboard non ha login. A meno che tu non imposti `[dashboard] token`, chiunque possa raggiungere la porta 8420 può leggere la tua configurazione, le tue delegazioni e i tuoi reward; nessuna chiave privata viene mai servita. Con un token impostato, ogni rotta `/api` e la connessione `/ws` richiedono `Authorization: Bearer <token>` (il token che QoreX invia quando si associa al nodo); su `http` semplice quel token attraversa la rete in chiaro. Il binario ora **si collega per impostazione predefinita solo al loopback** (`127.0.0.1:8420`) anziché a tutte le interfacce, e stampa un avviso all'avvio se lo hai configurato per ascoltare più ampiamente — ma l'avviso non è un rifiuto. Se estendi deliberatamente il bind (ad esempio per raggiungerlo da un'altra macchina, o perché stai pubblicando la porta da Docker), imposta un token e mettilo dietro https (un reverse proxy o un tunnel SSH) anziché esporlo direttamente. La connessione WebSocket della telemetria controlla anche l'`Origin` del browser, poiché un bind di rete ampio da solo non impedisce ad un'altra pagina aperta nello stesso browser di connettersi.
:::

## Cosa mostra la dashboard

La dashboard è organizzata nelle seguenti viste:

- **Overview** — altezza del blocco e stato del nodo a colpo d'occhio.
- **Validators** — l'insieme dei validatori bonded.
- **Delegation** — le delegazioni rispecchiate dal tuo account operatore (`operator_address`).
- **Network** — telemetria di rete in tempo reale e header sincronizzati di recente.
- **Bridge** — telemetria del bridge cross-chain.
- **Tokenomics** — telemetria dell'economia del token.
- **Settings** — la configurazione effettiva del nodo.

La telemetria si aggiorna in tempo reale, con il demone che aggiorna i dati di validatori, rete, bridge e tokenomics su intervalli indipendenti (configurabili sotto `[telemetry]` in `config.toml`).

### Banner solo locale

Se il nodo **non ha un endpoint RPC della chain configurato**, la dashboard funziona in **modalità solo locale** e mostra un banner ben visibile che spiega lo stato: lo stack PQC è verificato, ma il nodo non sta sincronizzando alcuna chain, quindi l'altezza del blocco resta a `0`. Il banner invita a eseguire la procedura guidata di onboarding sull'host (nomina `lightnode-sx`; `lightnode-ux onboard` fa lo stesso):

```bash
lightnode-sx onboard
```

La procedura guidata esegue l'autotest PQC, chiede il tuo endpoint della chain e importa o genera la chiave del tuo nodo. Una volta configurato un endpoint, riavvia il nodo e la dashboard inizierà a mostrare dati live della chain.

## Dove andare ora

- [Registrazione e Licenze](/light-node/registration-and-licensing) — registra il nodo on-chain.
- [Reward e Monitoraggio](/light-node/rewards-and-monitoring) — come la quota del 3% per light node viene accreditata e riscossa, e come monitorare lo stato del nodo.
