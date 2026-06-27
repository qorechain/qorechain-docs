---
slug: /architecture/chain-licensing
title: Licensing della chain
sidebar_label: Licensing della chain
sidebar_position: 9
---

# Licensing della chain

Il modulo `x/license` fornisce il **licensing delle capacità** on-chain. Alcune capacità soggette a restrizioni su QoreChain — in particolare le funzionalità di bridge e validatore per chain — richiedono che l'account che agisce detenga una licenza valida per quella capacità. Una licenza è semplicemente un record on-chain che autorizza un titolare specifico (il **grantee**) a utilizzare una specifica **feature** soggetta a restrizioni.

Il licensing mantiene queste capacità verificabili e auto-descrittive: qualsiasi integratore, explorer o wallet può chiedere alla chain se un dato account è autorizzato per una data feature, senza necessità di alcuna ricerca off-chain.

## Cosa rappresenta una licenza

Ogni licenza è un record indicizzato da una coppia `(grantee, feature_id)`:

- **`grantee`** — l'account `qor` che la licenza autorizza.
- **`feature_id`** — la capacità soggetta a restrizioni che sblocca. I feature ID sono identificatori stringa stabili; le capacità di bridge e validatore sono denominate per chain di destinazione (ad esempio `bridge_ethereum`, `validator_solana`), insieme a feature generali come quelle del protocollo del bridge e dell'operatore di nodi/validatori.
- **`granted_at`** / **`expires_at`** — l'altezza del blocco in cui la licenza è stata concessa e l'altezza del blocco in cui scade (un valore di `0` significa che non scade).
- **`granted_by`** — l'autorità che ha emesso la licenza.

Una capacità soggetta a restrizioni dietro una feature verifica semplicemente, al momento dell'esecuzione, se l'account che agisce detiene una licenza **attiva** per quella feature.

## Ciclo di vita di una licenza

Una licenza attraversa un piccolo insieme di stati:

| Stato | Significato |
| --- | --- |
| **Concessa / Attiva** | La licenza esiste e autorizza il grantee. Conta come attiva finché non è sospesa e non è scaduta. |
| **Sospesa** | Temporaneamente disabilitata. Il record esiste ancora, ma la capacità soggetta a restrizioni è negata finché la licenza non viene ripristinata. |
| **Revocata** | Rimossa permanentemente. Il grantee non detiene più affatto la licenza. |

Una licenza smette inoltre di essere attiva una volta superata l'altezza `expires_at`, anche se non è mai stata sospesa o revocata.

## Chi può modificare le licenze

La concessione, la revoca, la sospensione e il ripristino delle licenze sono **operazioni dell'autorità** — vengono eseguite dall'autorità di governance della chain, non da utenti arbitrari. Queste transazioni esistono come parte della superficie di comando del modulo, ma un normale utente non le chiama direttamente; il ciclo di vita è amministrato on-chain dall'autorità.

Per **ottenere** una licenza, gli integratori passano attraverso la **Dashboard (Tools → Buy License)**, che gestisce il flusso di richiesta; l'autorità registra quindi la concessione on-chain.

Le transazioni soggette a restrizioni dell'autorità sono:

```bash
# Grant a license for a feature to a grantee (authority signs)
qorechaind tx license grant qor1grantee... bridge_ethereum \
  --expires-at 0 --from qor1authority... --chain-id qorechain-vladi

# Suspend / resume a license
qorechaind tx license suspend qor1grantee... bridge_ethereum --from qor1authority...
qorechaind tx license resume  qor1grantee... bridge_ethereum --from qor1authority...

# Revoke a license permanently
qorechaind tx license revoke qor1grantee... bridge_ethereum --from qor1authority...
```

## Verifica e controllo di una licenza

I comandi di query sono aperti a chiunque. Sono la parte del modulo che gli integratori utilizzano quotidianamente — per confermare che un account è autorizzato prima di fare affidamento su una capacità soggetta a restrizioni, o per mostrare lo stato della licenza in un wallet o explorer.

### Verificare una singola licenza

`check` riferisce se uno specifico grantee detiene una specifica feature, e se quella licenza è attualmente **attiva**. Questa è la chiamata canonica "questo account è autorizzato a fare X".

```bash
qorechaind query license check qor1grantee... bridge_ethereum
# -> returns the license record and an `active` flag (true / false)
```

La risposta include i dettagli della licenza e un campo booleano `active` che tiene già conto della sospensione e della scadenza — quindi un valore `true` significa che il grantee può utilizzare la feature soggetta a restrizioni in questo momento.

### Elencare le licenze di un grantee

`list` restituisce ogni licenza detenuta da un account, su tutte le feature.

```bash
qorechaind query license list qor1grantee...
```

### Elencare i titolari di una feature

`holders` restituisce ogni account che detiene una licenza per una data feature — utile per enumerare, ad esempio, chi è autorizzato per una particolare capacità di bridge o validatore.

```bash
qorechaind query license holders bridge_ethereum
```

## Riepilogo dei comandi

**Transazioni** (`qorechaind tx license …`) — soggette a restrizioni dell'autorità / governance:

| Comando | Scopo |
| --- | --- |
| `grant` | Autorizza un grantee per una feature |
| `revoke` | Rimuove permanentemente una licenza |
| `suspend` | Disabilita temporaneamente una licenza |
| `resume` | Riabilita una licenza sospesa |

**Query** (`qorechaind query license …`) — aperte a chiunque:

| Comando | Scopo |
| --- | --- |
| `check` | Verifica una licenza `(grantee, feature)` e il suo stato attivo |
| `list` | Elenca tutte le licenze detenute da un grantee |
| `holders` | Elenca tutti i grantee che detengono una data feature |

## Correlati

- Le licenze per le feature di bridge e validatore supportano le capacità descritte in [Architettura del bridge](/architecture/bridge-architecture).
- Le licenze si ottengono attraverso la **Dashboard (Tools → Buy License)**.
- I light node ottengono una licenza durante [Registrazione e Licensing](/light-node/registration-and-licensing).
- Acquista e gestisci le licenze dal [Tools Hub](/dashboard/tools-hub).
