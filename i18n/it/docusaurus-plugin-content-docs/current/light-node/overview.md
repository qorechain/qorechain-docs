---
slug: /light-node/overview
title: Panoramica del Light Node
sidebar_label: Panoramica
sidebar_position: 1
---

# Panoramica del Light Node

Il **Light Node QoreChain** è un client leggero che segue la rete QoreChain senza eseguire un validatore completo o un nodo archivio. Invece di rieseguire ogni transazione, verifica gli header dei blocchi confrontandoli tra più endpoint RPC, rispecchia dalla chain le deleghe e le ricompense dell'account operatore e trasmette in streaming la telemetria di rete in tempo reale — tutto da un binario piccolo e autonomo.

Eseguire un light node ti permette di osservare lo stato della rete senza i costi di storage, banda e gestione operativa di un nodo completo. Partecipare alla quota di ricompensa dei light node è un passaggio separato, subordinato a una licenza, che **non è ancora aperto** — vedi [Stato del programma di ricompense](#reward-program-status).

## Una propria linea di versione

Il light node viene rilasciato su una **propria linea di versione — attualmente v3.1.3** per i binari precompilati — che è **distinta dalla versione della chain** (la chain segue un tracciato `v3.x` separato). I binari di ciascuna rete vengono pubblicati con un **manifest di checksum SHA-256** all'indirizzo `https://download.qore.host/<net>/lightnode/latest.json` (`<net>` è `mainnet` o `testnet`; entrambi i canali attualmente distribuiscono la stessa build v3.1.3). Vedi [Edizione SX](/light-node/sx-edition#install) per i passaggi di download e verifica. Il tag sorgente `v3.1.4` differisce dalla v3.1.3 solo per il signer incluso nell'immagine Docker; vedi [Docker](/light-node/sx-edition#docker).

Quando leggi la documentazione o le note di rilascio, tratta la versione del light node (v3.1.3) e la versione della chain come due numeri separati che condividono per coincidenza una serie major.

## Perché eseguire un light node {#why-run-a-light-node}

- **Partecipa alla quota di ricompensa dei light node.** I light node registrati e attivi che rispettano le regole di stake e di uptime sono idonei all'**allocazione del 3% per i light node** descritta di seguito. La registrazione al programma di ricompense **non è ancora aperta** — vedi [Stato del programma di ricompense](#reward-program-status). Eseguire e sincronizzare un nodo non richiede alcuna licenza e funziona già oggi.
- **Verifica in modo incrociato lo stato della chain che ti viene mostrato.** Il nodo recupera l'ultima altezza dal suo endpoint RPC primario e da ogni endpoint witness configurato in parallelo, e memorizza un header solo quando concordano sull'hash del blocco — alzando l'asticella dal fidarsi di un singolo endpoint al richiedere che ogni endpoint configurato sia compromesso contemporaneamente. Questa è una verifica incrociata tra fonti indipendenti, **non una verifica crittografica completa del consenso** (nessun controllo del validator-set o delle firme di commit). Il tuo nodo registra la modalità in cui sta funzionando come valore `assurance` su ogni riga `synced header` del suo log di debug (imposta `log_level = "debug"`); non viene mostrato nella dashboard del nodo né in `status`, e nessun servizio centrale di QoreChain può vederlo, poiché le scelte RPC del tuo nodo sono locali alla tua configurazione. **`trusted-single-source`** è ciò che ottieni senza witness configurati — il nodo registra un avviso all'avvio per segnalarlo, perché un singolo endpoint gestito onestamente riporta lo stesso valore di uno compromesso. Aggiungi un witness gestito in modo indipendente per passare a `corroborated-across-sources`.
- **Tieni d'occhio il tuo stake.** Il nodo rispecchia dalla chain le deleghe dell'account operatore e ti avvisa quando un validatore a cui deleghi scende sotto un punteggio di reputazione configurabile. Non sposta mai stake da solo — le modifiche alle deleghe si fanno dal tuo wallet.
- **Osserva la rete in tempo reale.** La telemetria in tempo reale copre validatori, consenso, bridge e tokenomics.
- **Post-quantum fin dal primo giorno.** Chiavi e firme utilizzano Dilithium-5 (ML-DSA-87).

## Due edizioni: SX e UX

Il light node è disponibile in due edizioni costruite dalla stessa base di codice. Scegli quella che corrisponde al modo in cui vuoi gestire il nodo.

| Edizione | Binario | Pensata per | Interfaccia |
| --- | --- | --- | --- |
| **SX — Server eXperience** | `lightnode-sx` | Deployment su server headless | CLI completa (daemon + comandi di gestione) |
| **UX — User eXperience** | `lightnode-ux` | Uso desktop e da operatore | Dashboard web integrata |

- L'**edizione SX** è un daemon headless con una CLI di gestione completa. È la scelta giusta per server, automazione e operatori che vivono da riga di comando. Vedi [Edizione SX](/light-node/sx-edition).
- L'**edizione UX** esegue lo stesso daemon ma aggiunge una dashboard web integrata così puoi osservare telemetria, deleghe e ricompense da un browser. Vedi [Edizione UX](/light-node/ux-edition).

Entrambe le edizioni leggono lo stesso `config.toml`, memorizzano i dati nella stessa directory home (`~/.qorechain-lightnode` per impostazione predefinita) e usano lo stesso keyring Dilithium-5.

## La quota di ricompensa del 3% per i light node {#the-3-light-node-reward-share}

La distribuzione delle fee di QoreChain assegna una **quota fissa del 3% ai light node** (il parametro `reward_share`, `0.03`). Vedi [Tokenomics](/architecture/tokenomics) per la ripartizione completa 37% / 30% / 20% / 10% / 3% (validatori, bruciato, treasury, staker, light node).

Quel 3% è ciò che viene versato nel module account dei light node; non è un diritto per singolo nodo. Ogni 100 blocchi la chain accredita a ciascun nodo idoneo la sua quota, ponderata per lo stake, di quanto accumulato dal settlement precedente, **con un limite per nodo** dato da `max_reward_per_block_per_node` (attualmente `1713` uqor per blocco, scalato in base all'uptime del nodo). Il limite è un tetto, non un importo promesso. Tutto ciò che non viene guadagnato viene spostato in una riserva che solo un voto di governance può sbloccare, così non si accumula alcun montepremi per chi si registra per primo. Puoi ispezionare la suddivisione in tempo reale con `GET /qorechain/lightnode/v1/reward_pool`.

Per essere idoneo alle ricompense un light node deve essere **registrato on-chain, attivo** (dimostrando la propria liveness con gli heartbeat), detenere almeno lo stake minimo vincolato e mantenere l'uptime pari o superiore al minimo. La registrazione e le licenze sono trattate in [Registrazione e Licenze](/light-node/registration-and-licensing); come le ricompense vengono accreditate, richieste e monitorate è trattato in [Ricompense e Monitoraggio](/light-node/rewards-and-monitoring).

## Stato del programma di ricompense {#reward-program-status}

:::note La registrazione al programma di ricompense non è ancora aperta
Al momento della stesura (15 ottobre 2026) nessuna licenza `lightnode_operator` è stata concessa su nessuna delle due reti e nessun light node è registrato (`GET /qorechain/lightnode/v1/stats` riporta `total_registered: "0"` su mainnet e testnet). La chain rifiuta una registrazione senza quella licenza, quindi nessuno può ancora iscriversi. La contabilità delle ricompense in sé è già live su entrambe le reti dall'upgrade v3.2.0. Eseguire e sincronizzare un nodo non richiede alcuna licenza e funziona già oggi, ma l'uptime viene conteggiato **a partire dal blocco in cui il tuo nodo è registrato**, quindi far girare un nodo prima non fa guadagnare alcun credito.

Il manifest di rilascio (`https://download.qore.host/<net>/lightnode/latest.json`) riporta il segnale ufficiale nel campo `registration.open`. Puoi anche controllare `GET /qorechain/license/v1/holders/lightnode_operator` e `GET /qorechain/lightnode/v1/stats` su `https://api.qore.host` (mainnet) o `https://api-testnet.qore.host` (testnet).
:::

## Funzionalità principali in sintesi

- **Verifica incrociata degli header multi-sorgente** — confronta l'ultimo hash di blocco con ogni endpoint witness configurato prima di considerarlo attendibile, senza scaricare blocchi completi, sincronizzandosi rapidamente anche da un cold start.
- **Tracciamento delle deleghe** — rispecchia dalla chain le deleghe dell'account operatore (sola lettura).
- **Auto-claim opzionale** — richiede le ricompense accumulate dei light node verso l'account operatore a un intervallo configurabile. Disattivato per impostazione predefinita; non ridelega mai.
- **Avvisi di reputazione** — ti avvisa quando un validatore a cui deleghi scende sotto un punteggio di reputazione configurabile; non sposta lo stake.
- **Telemetria in tempo reale** — validatori, consenso, bridge e tokenomics, aggiornati con intervalli indipendenti.
- **Registrazione on-chain** — con heartbeat proof di liveness che mantengono il nodo idoneo alle ricompense. La registrazione è subordinata a una licenza.
- **Crittografia post-quantum** — chiavi e firme Dilithium-5 (ML-DSA-87) ovunque.
- **Modalità solo locale** — sperimenta l'intero stack PQC ed esegui il nodo in modo autonomo prima di collegarlo a una chain live.

Il light node è rilasciato con licenza **Apache 2.0**.

## Dove andare adesso

- [Edizione SX](/light-node/sx-edition) — installa, configura ed esegui il daemon server.
- [Edizione UX](/light-node/ux-edition) — esegui l'edizione con dashboard web.
- [Registrazione e Licenze](/light-node/registration-and-licensing) — registrati on-chain e ottieni una licenza.
- [Ricompense e Monitoraggio](/light-node/rewards-and-monitoring) — come la quota del 3% viene accreditata e richiesta, e come mantenere il nodo in salute.
- [Tokenomics](/architecture/tokenomics) — come la quota di ricompensa dei light node si inserisce nell'economia più ampia.
