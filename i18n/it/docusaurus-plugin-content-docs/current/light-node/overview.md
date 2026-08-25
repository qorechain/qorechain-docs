---
slug: /light-node/overview
title: Panoramica del Light Node
sidebar_label: Panoramica
sidebar_position: 1
---

# Panoramica del Light Node

Il **Light Node QoreChain** è un client leggero che segue la rete QoreChain senza eseguire un validatore completo o un nodo archivio. Invece di rieseguire ogni transazione, verifica gli header dei blocchi confrontandoli tra più endpoint RPC, traccia deleghe e ricompense, e trasmette in streaming la telemetria di rete in tempo reale — tutto da un binario piccolo e autonomo.

Eseguire un light node ti permette di partecipare all'economia della rete e osservarne lo stato senza i costi di storage, banda e gestione operativa di un nodo completo.

## Una propria linea di versione

Il light node viene rilasciato su una **propria linea di versione — attualmente v3.1.2** — che è **distinta dalla versione della chain** (la chain segue un tracciato `v3.x` separato). I binari vengono pubblicati con un **manifest di checksum SHA-256** — vedi [Connettersi alla Mainnet](/getting-started/connecting-to-mainnet) per lo schema di download — e v3.1.2 è la prima release i cui binari Windows e macOS superano effettivamente keygen/sign/verify (le build precedenti risalgono a prima di una sostituzione della libreria Rust e fallivano silenziosamente su quelle piattaforme). È attualmente promossa sul canale di release **testnet**; il canale mainnet è intenzionalmente trattenuto per un periodo di rodaggio più lungo prima della promozione — se un link di download mainnet restituisce 404, è per questo motivo, non perché il link sia rotto.

Quando leggi la documentazione o le note di rilascio, tratta la versione del light node (v3.1.2) e la versione della chain come due numeri separati che condividono per coincidenza una serie major.

## Perché eseguire un light node {#why-run-a-light-node}

- **Guadagna una quota delle ricompense di blocco.** I light node attivi e registrati sono idonei alla **quota del 3% riservata ai light node** descritta di seguito.
- **Verifica in modo incrociato lo stato della chain che ti viene mostrato.** Il nodo recupera l'ultima altezza dal suo endpoint RPC primario e da ogni endpoint witness configurato in parallelo, e memorizza un header solo quando concordano sull'hash del blocco — alzando l'asticella dal fidarsi di un singolo endpoint al richiedere che ogni endpoint configurato sia compromesso contemporaneamente. Questa è una verifica incrociata tra fonti indipendenti, **non una verifica crittografica completa del consenso** (nessun controllo del validator-set o delle firme di commit). Il tuo nodo riporta quale modalità sta eseguendo come stato `Assurance` sulla **propria dashboard** (`http://127.0.0.1:8420` per impostazione predefinita) — questo non è qualcosa che una dashboard centrale QoreChain può vedere, poiché le scelte RPC del tuo nodo sono locali alla tua configurazione. **`trusted-single-source`** (nessun witness configurato) è l'impostazione predefinita con cui la maggior parte degli operatori inizia, non un segnale d'allarme — un singolo endpoint gestito onestamente riporta lo stesso valore di uno compromesso. Aggiungi un witness gestito in modo indipendente per passare a `corroborated-across-sources`.
- **Delega e ricapitalizza automaticamente.** Gestisci lo stake delegato su più validatori, suddiviso per peso, e ricapitalizza le ricompense automaticamente.
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

## La quota del 3% per i light node

La distribuzione delle fee di QoreChain assegna una **quota fissa del 3% ai light node** per il servizio di fornitura dei dati di rete. Questo è imposto on-chain come parte della suddivisione delle ricompense del protocollo ed è lo stesso canale documentato nell'economia del progetto — vedi [Tokenomics](/architecture/tokenomics) per la ripartizione completa 37% / 30% / 20% / 10% / 3% (validatori, bruciato, treasury, staker, light node).

Per essere idoneo a questa quota, un light node deve essere **registrato on-chain e dimostrare attivamente la propria liveness** tramite heartbeat proof. La registrazione e le licenze sono trattate in [Registrazione e Licenze](/light-node/registration-and-licensing); come viene guadagnata, ricapitalizzata e monitorata la quota è trattato in [Ricompense e Monitoraggio](/light-node/rewards-and-monitoring).

## Funzionalità principali in sintesi

- **Verifica incrociata degli header multi-sorgente** — confronta l'ultimo hash di blocco con ogni endpoint witness configurato prima di considerarlo attendibile, senza scaricare blocchi completi, sincronizzandosi rapidamente anche da un cold start.
- **Staking delegato** — stake su più validatori con pesi di suddivisione configurabili.
- **Ricompense a ricapitalizzazione automatica** — richiede e ridelega le ricompense a un intervallo configurabile.
- **Ribilanciamento basato sulla reputazione** — sposta automaticamente la delega verso validatori con reputazione più alta.
- **Telemetria in tempo reale** — validatori, consenso, bridge e tokenomics, aggiornati con intervalli indipendenti.
- **Registrazione on-chain** — con heartbeat proof di liveness che mantengono il nodo idoneo alle ricompense.
- **Crittografia post-quantum** — chiavi e firme Dilithium-5 (ML-DSA-87) ovunque.
- **Modalità solo locale** — sperimenta l'intero stack PQC ed esegui il nodo in modo autonomo prima di collegarlo a una chain live.

Il light node è rilasciato con licenza **Apache 2.0**.

## Dove andare adesso

- [Edizione SX](/light-node/sx-edition) — installa, configura ed esegui il daemon server.
- [Edizione UX](/light-node/ux-edition) — esegui l'edizione con dashboard web.
- [Registrazione e Licenze](/light-node/registration-and-licensing) — registrati on-chain e ottieni una licenza.
- [Ricompense e Monitoraggio](/light-node/rewards-and-monitoring) — guadagna la quota del 3% e mantieni il nodo in salute.
- [Edizione SX](/light-node/sx-edition) e [Edizione UX](/light-node/ux-edition) sono i due modi per eseguire un light node.
- [Tokenomics](/architecture/tokenomics) — come la quota di ricompensa dei light node si inserisce nell'economia più ampia.
