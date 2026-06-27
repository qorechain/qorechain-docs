---
slug: /light-node/ux-edition
title: Edizione UX (dashboard web)
sidebar_label: Edizione UX
sidebar_position: 3
---

# Edizione UX — Dashboard web

L'edizione **UX (User eXperience)** esegue lo stesso daemon del light node dell'edizione SX, ma aggiunge una **dashboard web integrata** così da poter monitorare il nodo e la rete in un browser. Il binario è `lightnode-ux`. Come l'edizione SX, questa è la linea **v3.1.1** del light node (la sua versione, distinta dalla versione della chain).

L'edizione UX è la scelta giusta per l'uso da desktop e per gli operatori che preferiscono un'interfaccia visiva alla riga di comando.

## Installazione

### Compilazione dal sorgente

L'edizione UX richiede **Go 1.26.1** e si compila con CGO abilitato per la libreria nativa post-quantistica:

```bash
CGO_ENABLED=1 go build -o build/lightnode-ux ./cmd/lightnode-ux/
```

Questo produce `build/lightnode-ux`.

### Docker

Il servizio UX si compila da `Dockerfile.ux`:

```bash
docker compose up lightnode-ux
```

Il container UX conserva i dati in un volume denominato su `/root/.qorechain-lightnode` e legge l'indirizzo RPC della chain dalla variabile d'ambiente `QORECHAIN_RPC_ADDR`.

## Esecuzione

Avvia il nodo UX:

```bash
build/lightnode-ux start
```

Questo avvia insieme il daemon e il server della dashboard integrata. L'edizione UX abilita sempre la dashboard. All'avvio il binario stampa l'URL della dashboard.

L'edizione UX condivide la sua configurazione con l'edizione SX: legge lo stesso `config.toml` da `~/.qorechain-lightnode` e usa lo stesso keyring Dilithium-5. Se non hai ancora configurato il nodo, esegui prima la procedura guidata SX (`lightnode-sx onboard`) per scrivere la configurazione e importare o generare la tua chiave — consulta [Edizione SX](/light-node/sx-edition).

## La dashboard web sulla porta 8420

La dashboard è esposta sulla **porta 8420**. È la porta che l'immagine Docker `lightnode-ux` dichiara (`EXPOSE 8420`) ed è quella a cui il binario si lega per impostazione predefinita, perciò quando si esegue in Docker la dashboard è pubblicata su `8420`:

```
http://localhost:8420
```

:::caution Verifica la mappatura delle porte nel tuo compose
Alcuni testi altrove fanno riferimento alla porta 8080 per la dashboard. Il valore autoritativo è **8420** — è ciò che l'immagine espone effettivamente e a cui il daemon si lega per impostazione predefinita. Se adatti il tuo `docker-compose.yml` o un reverse proxy, mappa su **8420**, non su 8080.
:::

## Cosa mostra la dashboard

La dashboard è organizzata nelle seguenti viste:

- **Overview** — altezza di blocco e stato del nodo a colpo d'occhio.
- **Validators** — l'insieme dei validatori vincolati.
- **Delegation** — le tue deleghe correnti e la loro suddivisione.
- **Network** — telemetria di rete in tempo reale e header sincronizzati di recente.
- **Bridge** — telemetria del bridge cross-chain.
- **Tokenomics** — telemetria dell'economia del token.
- **Settings** — la configurazione effettiva del nodo.

La telemetria si aggiorna in tempo reale, con il daemon che aggiorna i dati di validatori, rete, bridge e tokenomics su intervalli indipendenti (configurabili sotto `[telemetry]` in `config.toml`).

### Banner della modalità solo locale

Se il nodo **non ha alcun endpoint RPC della chain configurato**, la dashboard funziona in **modalità solo locale** e mostra un banner ben visibile che spiega lo stato: lo stack PQC è verificato, ma il nodo non sincronizza alcuna chain, quindi l'altezza di blocco resta a `0`. Il banner ti invita a eseguire la procedura guidata di onboarding sull'host:

```bash
lightnode-sx onboard
```

La procedura guidata esegue il self-test PQC, chiede l'endpoint della tua chain e importa o genera la tua chiave del validatore. Una volta configurato un endpoint, riavvia il nodo e la dashboard inizia a mostrare i dati live della chain.

## Dove andare ora

- [Registrazione e licenze](/light-node/registration-and-licensing) — registra il nodo on-chain.
- [Ricompense e monitoraggio](/light-node/rewards-and-monitoring) — guadagna la quota del 3% riservata ai light node e monitora la salute del nodo.
