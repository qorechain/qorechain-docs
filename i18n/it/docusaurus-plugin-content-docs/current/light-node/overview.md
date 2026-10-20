---
slug: /light-node/overview
title: Panoramica del Light Node
sidebar_label: Panoramica
sidebar_position: 1
---

# Panoramica del Light Node

Il **Light Node QoreChain** è un client leggero che segue la rete QoreChain senza eseguire un validatore completo o un nodo archivio. Invece di rieseguire ogni transazione, verifica gli header dei blocchi confrontandoli tra più endpoint RPC, rispecchia dalla chain le deleghe e le ricompense dell'account operatore e trasmette in streaming la telemetria di rete in tempo reale — tutto da un binario piccolo e autonomo.

Eseguire un light node ti permette di osservare lo stato della rete senza i costi di storage, banda e gestione operativa di un nodo completo. Partecipare alla quota di ricompensa dei light node è un passaggio separato, subordinato a una licenza; la registrazione è aperta su entrambe le reti — vedi [Stato del programma di ricompense](#reward-program-status).

## Una propria linea di versione

Il light node viene rilasciato su una **propria linea di versione — attualmente 3.1.9** — che è **distinta dalla versione della chain** (la mainnet esegue la chain `v3.2.3`). I binari di ciascuna rete vengono pubblicati con un **manifest di checksum SHA-256** all'indirizzo `https://download.qore.host/<net>/lightnode/latest.json` (`<net>` è `mainnet` o `testnet`). Entrambi i canali distribuiscono la stessa build 3.1.9 ed entrambi i manifest impostano `minCompatible` a `3.1.9`, quindi le build più vecchie del light node vanno sostituite. Il rilascio comprende 12 binari — SX e UX per Linux, macOS e Windows, ciascuno su amd64 e arm64 — più un file `SHA256SUMS`. Vedi [Edizione SX](/light-node/sx-edition#install) per i passaggi di download e verifica, e [Docker](/light-node/sx-edition#docker) per costruire un'immagine dal tag sorgente `v3.1.9`.

Una build Android è allegata al rilascio GitHub solo come **anteprima**: segue e verifica la chain, ma non si registra e non guadagna.

Quando leggi la documentazione o le note di rilascio, tratta la versione del light node (3.1.9) e la versione della chain (v3.2.3) come due numeri separati che condividono per coincidenza una serie major.

## Perché eseguire un light node {#why-run-a-light-node}

- **Partecipa alla quota di ricompensa dei light node.** I light node registrati e attivi che rispettano le regole di stake e di uptime sono idonei all'**allocazione del 3% per i light node** descritta di seguito. La registrazione richiede una licenza `lightnode_operator` — vedi [Registrazione e Licenze](/light-node/registration-and-licensing). Eseguire e sincronizzare un nodo non richiede alcuna licenza.
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

Quel 3% è ciò che viene versato nel module account dei light node; non è un diritto per singolo nodo. Ogni 100 blocchi la chain accredita a ciascun nodo idoneo la sua quota, ponderata per lo stake, di quanto accumulato dal settlement precedente, **con un limite per nodo**. Dalla chain v3.2.3 il limite è di **2.000 QOR per nodo ogni 30 giorni** (`max_reward_per_month_per_node`, `2000000000` uqor), ripartito proporzionalmente sul tempo di blocco trascorso dal settlement precedente e scalato in base all'uptime del nodo; questa è la regola `lightnode-monthly-cap`. Prima della v3.2.3 il limite era espresso per blocco (`max_reward_per_block_per_node`, `1713` uqor), valore che la query del reward pool riporta ancora. Il limite è un tetto, non un importo promesso. Tutto ciò che non viene guadagnato viene spostato in una riserva che solo un voto di governance può sbloccare, così non si accumula alcun montepremi per chi si registra per primo. Puoi ispezionare la suddivisione in tempo reale con `GET /qorechain/lightnode/v1/reward_pool`.

Per essere idoneo alle ricompense un light node deve essere **registrato on-chain, attivo** (dimostrando la propria liveness con gli heartbeat), detenere almeno lo stake minimo vincolato e mantenere l'uptime pari o superiore al minimo. La registrazione e le licenze sono trattate in [Registrazione e Licenze](/light-node/registration-and-licensing); come le ricompense vengono accreditate, richieste e monitorate è trattato in [Ricompense e Monitoraggio](/light-node/rewards-and-monitoring).

## Stato del programma di ricompense {#reward-program-status}

:::note La registrazione è aperta
La registrazione è aperta su mainnet (`qorechain-vladi`, chain v3.2.3) e su testnet (`qorechain-diana`). A ottobre 2026 sono state concesse sei licenze `lightnode_operator` su mainnet e nessun light node si è ancora registrato. La contabilità delle ricompense è live su entrambe le reti dall'upgrade v3.2.0. Eseguire e sincronizzare un nodo non richiede alcuna licenza, ma l'uptime viene conteggiato **a partire dal blocco in cui il tuo nodo è registrato**, quindi far girare un nodo prima non fa guadagnare alcun credito.

Il manifest di rilascio (`https://download.qore.host/<net>/lightnode/latest.json`) riporta il segnale ufficiale nel campo `registration.open`. Per lo stato in tempo reale, interroga `GET /qorechain/license/v1/holders/lightnode_operator` e `GET /qorechain/lightnode/v1/stats` su `https://api.qore.host` (mainnet) o `https://api-testnet.qore.host` (testnet).
:::

## Funzionalità principali in sintesi

- **Verifica incrociata degli header multi-sorgente** — confronta l'ultimo hash di blocco con ogni endpoint witness configurato prima di considerarlo attendibile, senza scaricare blocchi completi, sincronizzandosi rapidamente anche da un cold start.
- **Tracciamento delle deleghe** — rispecchia dalla chain le deleghe dell'account operatore (sola lettura).
- **Auto-claim opzionale** — richiede le ricompense accumulate dei light node verso l'account operatore a un intervallo configurabile. Disattivato per impostazione predefinita; non ridelega mai.
- **Avvisi di reputazione** — ti avvisa quando un validatore a cui deleghi scende sotto un punteggio di reputazione configurabile; non sposta lo stake.
- **Telemetria in tempo reale** — validatori, consenso, bridge e tokenomics, aggiornati con intervalli indipendenti.
- **Registrazione on-chain** — con heartbeat proof di liveness che mantengono il nodo idoneo alle ricompense. La registrazione è subordinata a una licenza. Il nodo firma da solo le proprie transazioni su Linux, macOS e Windows; non serve nessun altro software.
- **Crittografia post-quantum** — chiavi e firme Dilithium-5 (ML-DSA-87) ovunque.
- **Modalità solo locale** — sperimenta l'intero stack PQC ed esegui il nodo in modo autonomo prima di collegarlo a una chain live.

Il light node è rilasciato con licenza **Apache 2.0**.

## Dove andare adesso

- [Edizione SX](/light-node/sx-edition) — installa, configura ed esegui il daemon server.
- [Edizione UX](/light-node/ux-edition) — esegui l'edizione con dashboard web.
- [Registrazione e Licenze](/light-node/registration-and-licensing) — ottieni una licenza e registrati on-chain.
- [Ricompense e Monitoraggio](/light-node/rewards-and-monitoring) — come la quota del 3% viene accreditata e richiesta, e come mantenere il nodo in salute.
- [Tokenomics](/architecture/tokenomics) — come la quota di ricompensa dei light node si inserisce nell'economia più ampia.
