---
slug: /dashboard/validators
title: Validatori
sidebar_label: Validatori
sidebar_position: 12
---

# Validatori

La pagina **Validators** elenca i validatori della rete che hai selezionato, con schede riepilogative, una casella di ricerca e, per ogni validatore, la sua posizione in classifica, il potere di voto, la commissione, lo stato e un valore di rendimento variabile letto dalla chain. È uno strumento di confronto in sola lettura per chi deve decidere a chi delegare. Non ha un pulsante per delegare: lo staking si fa nella pagina Wallet, vedi [Staking e validatori](/dashboard/staking-and-validators).

## Innovazioni {#innovations}

- **L'elenco segue la rete selezionata.** La pagina richiede l'insieme della rete scelta nell'intestazione, quindi chi guarda la mainnet vede i validatori della mainnet e chi guarda la testnet vede quelli della testnet.
- **Rendimento letto dalla chain, con i suoi limiti allegati.** La colonna APY è il tasso base dello staking-tier della chain moltiplicato per (1 meno la commissione del validatore). È mostrata con un asterisco e la nota "variable, not guaranteed, lock bonuses not included". Il valore è una lettura in tempo reale di un tasso di protocollo variabile, non una promessa e non una previsione.
- **"From fees" oltre il tetto di emissione.** Una rete che ha superato il proprio tetto di emissione mostra **From fees** al posto di una percentuale, perché non viene coniato nuovo QOR e lo staking guadagna allora solo dalle commissioni di transazione. Sulla testnet la colonna attualmente riporta **From fees**. Un valore sconosciuto mostra un trattino, mai 0.00%.
- **Classifica per potere di voto.** La posizione è calcolata dal potere di voto, quindi il rango 1 è il validatore con più stake.
- **Lacune dichiarate.** Regione, blocchi proposti, versione del software e ultimo avvistamento vengono mostrati solo quando la fonte dei dati li fornisce, e l'uptime sconosciuto riporta **N/A** anziché 0%.

## Come si usa {#how-to-use}

1. Accedi e apri la pagina dal suo indirizzo, `dashboard.qorechain.io/validators`. Non c'è un link nella barra laterale.
2. Scegli la rete nell'intestazione (**Mainnet** o **Testnet**); la pagina si ricarica con i validatori di quella rete.
3. Leggi le schede riepilogative: **Active Validators**, **Total Bonded**, **Avg Commission** e **Avg Uptime**.
4. Cerca con la casella "Search by moniker or address".
5. Leggi ogni riga: la posizione e il moniker con l'indirizzo (e un pulsante di copia), **Voting power** (stake e quota del totale), **Commission**, **APY** e **Status** (active, jailed o inactive), poi l'uptime ed eventuali dettagli opzionali.
6. Per delegare, vai alla scheda **Stake / Delegate** della pagina Wallet ([Delegare](/dashboard/staking-and-validators#delegate)). Per guardare un validatore più in dettaglio, apri la sua pagina dell'indirizzo nell'[Explorer](/dashboard/explorer#validators).

:::caution Leggi la nota sull'APY
La percentuale dipende da un tasso di protocollo che può cambiare e dalla commissione del validatore. I bonus di blocco del modulo opzionale di staking con blocco temporale non sono inclusi. Non considerarla un reddito garantito.
:::

## Come accedere {#how-to-access}

- **URL:** [dashboard.qorechain.io/validators](https://dashboard.qorechain.io/validators). È raggiungibile solo dall'indirizzo; la barra laterale non la elenca.
- **Accesso:** obbligatorio. Senza accesso, la pagina mostra "Authentication Required".
- **Rete:** segue il selettore dell'intestazione.
- **Wallet:** non serve per leggere la pagina.
- **Costo:** gratuito.

## Dove è pubblicato {#where-published}

| Superficie | Indirizzo | Reti | Accesso |
| --- | --- | --- | --- |
| Pagina Validators | `dashboard.qorechain.io/validators` | Mainnet e testnet, selettore nell'intestazione | Obbligatorio |
| Tabella dei validatori dell'Explorer | `dashboard.qorechain.io/explorer/validators` | Mainnet e testnet | Non richiesto |
| Dati della chain | `GET /cosmos/staking/v1beta1/validators` su `api.qore.host` e `api-testnet.qore.host` | Mainnet e testnet | Nessuno |

## Limiti e problemi noti {#limits}

- **La pagina è in sola lettura** e non è collegata dalla barra laterale.
- **L'APY è variabile e non garantito.** Esclude i bonus di blocco e mostra **From fees** dove il tetto di emissione è stato raggiunto.
- **Meno campi di dati di una dashboard di nodo:** regione, blocchi proposti, versione del software e ultimo avvistamento sono mostrati solo quando disponibili, e l'uptime può riportare N/A.
- **I validatori jailed** risultano come jailed e non sono proposti nel pannello Delegate.
- **I dati sono in cache per un breve periodo** (circa 30 secondi), quindi una modifica sulla chain può richiedere un momento per comparire.
