---
slug: /light-node/ux-edition
title: Edizione UX (Dashboard Web)
sidebar_label: Edizione UX
sidebar_position: 3
---

# Edizione UX — Dashboard Web

L'edizione **UX (User eXperience)** esegue lo stesso demone light node dell'edizione SX, ma aggiunge una **dashboard web integrata** che permette di monitorare il nodo e la rete dal browser. Il binario è `lightnode-ux`. Come l'edizione SX, appartiene alla linea **v3.1.2** del light node (una versione propria, separata dalla versione della chain).

L'edizione UX è la scelta giusta per l'uso desktop e per gli operatori che preferiscono un'interfaccia visiva alla riga di comando.

## Installazione

I binari precompilati funzionano nativamente su **sei piattaforme senza dipendenze native** — Linux (amd64, arm64), macOS (Intel, Apple Silicon) e Windows (amd64, arm64) — ciascuno di circa 16 MB. Verifica il checksum del download rispetto al manifest prima di eseguirlo — vedi [Edizione SX](/light-node/sx-edition#install) per il procedimento.

### Compilazione da sorgente

L'edizione UX richiede **Go 1.26.1**. La sua crittografia post-quantistica è un'implementazione pura in Go (nessun CGO, nessuna libreria nativa):

```bash
go build -o build/lightnode-ux ./cmd/lightnode-ux/
```

Questo produce `build/lightnode-ux`.

### Docker

Il servizio UX viene compilato da `Dockerfile.ux`:

```bash
docker compose up lightnode-ux
```

Il container UX persiste i dati in un volume denominato su `/root/.qorechain-lightnode` e legge l'indirizzo RPC della chain dalla variabile d'ambiente `QORECHAIN_RPC_ADDR`.

## Esecuzione

Avvia il nodo UX:

```bash
build/lightnode-ux start
```

Questo avvia insieme il demone e il server della dashboard integrata. L'edizione UX abilita sempre la dashboard. All'avvio il binario stampa l'URL della dashboard.

L'edizione UX condivide la configurazione con l'edizione SX: legge lo stesso `config.toml` da `~/.qorechain-lightnode` e usa lo stesso keyring Dilithium-5. Se non hai ancora configurato il nodo, esegui prima la procedura guidata SX (`lightnode-sx onboard`) per scrivere la configurazione e importare o generare la tua chiave — vedi [Edizione SX](/light-node/sx-edition).

## La dashboard web sulla porta 8420

La dashboard è esposta sulla **porta 8420**. È la porta che l'immagine Docker `lightnode-ux` dichiara (`EXPOSE 8420`) ed è quella predefinita a cui si collega il binario, quindi quando viene eseguito in Docker la dashboard viene pubblicata sulla porta `8420`:

```
http://localhost:8420
```

:::caution Controlla il mapping delle porte nel tuo compose
Alcuni testi altrove fanno riferimento alla porta 8080 per la dashboard. Il valore autorevole è **8420** — è quello che l'immagine espone effettivamente e su cui il demone si collega per impostazione predefinita. Se adatti il tuo `docker-compose.yml` o un reverse proxy, mappa alla porta **8420**, non 8080.
:::

:::caution Nessuna rotta della dashboard è autenticata
Nulla dietro la porta 8420 dispone di login o controllo degli accessi — chiunque possa raggiungerla può leggere la tua configurazione, le tue delegazioni e i tuoi reward; nessuna chiave privata viene mai servita. Il binario ora **si collega per impostazione predefinita solo al loopback** (`127.0.0.1:8420`) anziché a tutte le interfacce, e stampa un avviso all'avvio se lo hai configurato per ascoltare più ampiamente — ma l'avviso non è un rifiuto, e non aggiunge autenticazione. Se estendi deliberatamente il bind (ad esempio per raggiungerlo da un'altra macchina, o perché stai pubblicando la porta da Docker), mettilo dietro un reverse proxy che richieda autenticazione anziché esporlo direttamente. La connessione WebSocket della telemetria controlla anche l'`Origin` del browser, poiché un bind di rete ampio da solo non impedisce ad un'altra pagina aperta nello stesso browser di connettersi.
:::

## Cosa mostra la dashboard

La dashboard è organizzata nelle seguenti viste:

- **Overview** — altezza del blocco e stato del nodo a colpo d'occhio.
- **Validators** — l'insieme dei validatori bonded.
- **Delegation** — le tue delegazioni attuali e la loro ripartizione.
- **Network** — telemetria di rete in tempo reale e header sincronizzati di recente.
- **Bridge** — telemetria del bridge cross-chain.
- **Tokenomics** — telemetria dell'economia del token.
- **Settings** — la configurazione effettiva del nodo.

La telemetria si aggiorna in tempo reale, con il demone che aggiorna i dati di validatori, rete, bridge e tokenomics su intervalli indipendenti (configurabili sotto `[telemetry]` in `config.toml`).

### Banner solo locale

Se il nodo **non ha un endpoint RPC della chain configurato**, la dashboard funziona in **modalità solo locale** e mostra un banner ben visibile che spiega lo stato: lo stack PQC è verificato, ma il nodo non sta sincronizzando alcuna chain, quindi l'altezza del blocco resta a `0`. Il banner invita a eseguire la procedura guidata di onboarding sull'host:

```bash
lightnode-sx onboard
```

La procedura guidata esegue l'autotest PQC, chiede il tuo endpoint della chain e importa o genera la tua chiave di validatore. Una volta configurato un endpoint, riavvia il nodo e la dashboard inizierà a mostrare dati live della chain.

## Dove andare ora

- [Registrazione e Licenze](/light-node/registration-and-licensing) — registra il nodo on-chain.
- [Reward e Monitoraggio](/light-node/rewards-and-monitoring) — guadagna la quota del 3% per light node e monitora lo stato del nodo.
