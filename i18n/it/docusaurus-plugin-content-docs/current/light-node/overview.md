---
slug: /light-node/overview
title: Panoramica del Light Node
sidebar_label: Panoramica
sidebar_position: 1
---

# Panoramica del Light Node

Il **QoreChain Light Node** è un client leggero che segue la rete QoreChain senza eseguire un nodo validatore o di archivio completo. Anziché rieseguire ogni transazione, verifica crittograficamente gli header dei blocchi, traccia le deleghe e le ricompense e trasmette in streaming la telemetria di rete in tempo reale — il tutto da un binario piccolo e autosufficiente.

Eseguire un light node ti consente di partecipare all'economia della rete e di osservarne lo stato senza i costi di archiviazione, banda e operativi di un nodo completo.

## La sua linea di versione dedicata

Il light node viene rilasciato sulla sua **linea di versione dedicata — attualmente v3.1.1** — che è **distinta dalla versione di rilascio della chain** (la chain è su un track `v3.x` separato). La linea v3.1.1 del light node è allineata con `qorechain-core`: aggiunge una suite di regressione per la crittografia post-quantistica (PQC) (keygen, sign, verify e rilevamento di manomissioni) che protegge il comportamento di verifica delle firme del core e la esegue in integrazione continua.

Quando leggi la documentazione o le note di rilascio, considera la versione del light node (v3.1.1) e la versione della chain come due numeri separati che casualmente condividono una serie major.

## Perché eseguire un light node

- **Guadagna una quota delle ricompense di blocco.** I light node attivi e registrati sono idonei alla **quota di ricompensa del 3% per i light node** descritta di seguito.
- **Verifica la chain tu stesso.** Il nodo esegue la verifica degli header con un light client di tipo skipping, così ottieni la garanzia crittografica dello stato della chain senza fidarti di un'API remota.
- **Delega e auto-compounding.** Gestisci lo stake delegato su più validatori, suddiviso per peso, e capitalizza automaticamente le ricompense.
- **Osserva la rete in tempo reale.** La telemetria in tempo reale copre validatori, consenso, bridge e tokenomics.
- **Post-quantistico fin dal primo giorno.** Le chiavi e le firme utilizzano Dilithium-5 (ML-DSA-87).

## Due edizioni: SX e UX

Il light node è disponibile in due edizioni costruite dalla stessa codebase. Scegli quella più adatta al modo in cui vuoi gestire il nodo.

| Edizione | Binario | Pensata per | Interfaccia |
| --- | --- | --- | --- |
| **SX — Server eXperience** | `lightnode-sx` | Deployment server headless | CLI completa (comandi daemon + di gestione) |
| **UX — User eXperience** | `lightnode-ux` | Uso desktop e da operatore | Dashboard web integrata |

- L'**edizione SX** è un daemon headless con una CLI di gestione completa. È la scelta giusta per server, automazione e operatori che vivono sulla riga di comando. Vedi [Edizione SX](/light-node/sx-edition).
- L'**edizione UX** esegue lo stesso daemon ma aggiunge una dashboard web integrata così puoi osservare telemetria, deleghe e ricompense in un browser. Vedi [Edizione UX](/light-node/ux-edition).

Entrambe le edizioni leggono lo stesso `config.toml`, archiviano i dati nella stessa home directory (`~/.qorechain-lightnode` per impostazione predefinita) e utilizzano lo stesso keyring Dilithium-5.

## La quota di ricompensa del 3% per i light node

La distribuzione delle commissioni di QoreChain alloca una **quota fissa del 3% ai light node** per la fornitura di dati di rete. Questo è applicato on-chain come parte della suddivisione delle ricompense del protocollo ed è lo stesso canale documentato nell'economia del progetto — vedi [Tokenomics](/architecture/tokenomics) per la suddivisione completa 37% / 30% / 20% / 10% / 3% (validatori, bruciato, tesoro, staker, light node).

Per essere idoneo a questa quota, un light node deve essere **registrato on-chain e provare attivamente la liveness** tramite prove di heartbeat. La registrazione e il licensing sono trattati in [Registrazione e Licensing](/light-node/registration-and-licensing); come la quota viene guadagnata, capitalizzata e monitorata è trattato in [Ricompense e Monitoraggio](/light-node/rewards-and-monitoring).

## Funzionalità principali in sintesi

- **Light client skipping** — verifica gli header senza scaricare i blocchi completi, sincronizzandosi rapidamente anche da un avvio a freddo.
- **Staking delegato** — fai staking su più validatori con pesi di suddivisione configurabili.
- **Ricompense auto-compounding** — riscuoti e ridelegabili le ricompense a un intervallo configurabile.
- **Ribilanciamento basato sulla reputazione** — sposta automaticamente la delega verso validatori con reputazione più alta.
- **Telemetria in tempo reale** — validatori, consenso, bridge e tokenomics, aggiornati a intervalli indipendenti.
- **Registrazione on-chain** — con prove di liveness heartbeat che mantengono il nodo idoneo alle ricompense.
- **Crittografia post-quantistica** — chiavi e firme Dilithium-5 (ML-DSA-87) ovunque.
- **Modalità local-only** — esercita l'intero stack PQC ed esegui il nodo in modalità autonoma prima di puntarlo a una chain attiva.

Il light node è rilasciato con licenza **Apache 2.0**.

## Dove andare dopo

- [Edizione SX](/light-node/sx-edition) — installa, configura ed esegui il daemon server.
- [Edizione UX](/light-node/ux-edition) — esegui l'edizione con dashboard web.
- [Registrazione e Licensing](/light-node/registration-and-licensing) — registrati on-chain e ottieni una licenza.
- [Ricompense e Monitoraggio](/light-node/rewards-and-monitoring) — guadagna la quota del 3% e mantieni il nodo in salute.
- [Edizione SX](/light-node/sx-edition) ed [Edizione UX](/light-node/ux-edition) sono i due modi per eseguire un light node.
- [Tokenomics](/architecture/tokenomics) — come la quota di ricompensa per i light node si inserisce nell'economia più ampia.
