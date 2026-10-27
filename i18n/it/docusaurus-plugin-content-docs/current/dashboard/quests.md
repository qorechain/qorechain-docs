---
slug: /dashboard/quests
title: Quest
sidebar_label: Quest
sidebar_position: 10
---

# Quest

Le **Quest** sono attività guidate che ti accompagnano nell'uso di QoreChain mentre le completi. Una quest raggruppa uno o più passaggi, come finanziare un wallet, effettuare un trasferimento o collegare un account, e ti premia per il completamento. Questa pagina tratta anche le altre pagine del gruppo **Earn** della barra laterale e l'arcade: **Leaderboard**, **Badges** e **Games**. Sono tutte pensate per i membri della community che vogliono un modo pratico per imparare la rete e raccogliere progressi.

## Innovazioni {#innovations}

- **Completamento verificato, non autodichiarato.** Una quest conta quando il suo controllo viene superato. Eigenstate 2 indica il tipo di controllo su ogni quest: **account collegato**, **wallet connesso**, **link di prova**, **revisione del team** o **quiz**.
- **Le quest social contano solo per gli account verificati.** Una quest che coinvolge X, Telegram o Discord (e, per i controlli di account collegato di Eigenstate 2, anche YouTube e GitHub) conta solo dopo che hai collegato l'account nel tuo **Profilo** e la connessione è verificata. Fino ad allora la pagina mostra *Connect Social Accounts* con un link **Go to Profile**.
- **I prerequisiti sono applicati.** Una quest bloccata indica cosa terminare prima ("Complete "..." first").
- **Stati chiari.** Started, Pending Verification, Pending Review, Failed e Completed, così una quest in attesa di una revisione umana non viene mostrata come fallita.
- **Due stagioni in una sola pagina.** Le schede **Eigenstate 1** ed **Eigenstate 2** hanno ciascuna i propri insiemi di quest e le proprie categorie.

## Come si usa {#how-to-use}

### Sfoglia le quest

Apri **Quests** (barra laterale **Earn**). Un riepilogo mostra quante quest sono disponibili, in corso e completate. Le **schede categoria** filtrano l'elenco:

- Eigenstate 1: Onboarding, Trading, Social, Community, Learning, Daily e Weekly.
- Eigenstate 2: Social, Exchanges, Developer, Educational, Korea/Asia, On-Chain e Other.

Una categoria vuota riporta "No quests in this category yet." Ogni card di una quest mostra un'icona, un titolo e una breve descrizione, un badge di **difficoltà**, un tempo stimato, la **ricompensa** (in QOR o in punti eigenvalue, λ) e uno stato (completata, in corso, avviata o bloccata).

### Completa una quest di Eigenstate 1

1. Apri una quest e seleziona **Start Quest** (poi **Continue Quest**).
2. Procedi attraverso le attività. Un'attività offre **Go to Action** (verso la pagina pertinente della Dashboard) e **Complete** (per confermare un passaggio in modo che possa essere verificato).
3. Una barra di avanzamento monitora le attività completate.
4. Quando tutte le attività sono terminate, seleziona **Check Completion** per verificare la quest e ricevere la sua ricompensa.

Le quest giornaliere e settimanali si reimpostano con una cadenza; la pagina di dettaglio mostra la cadenza di reset e la tua serie. Una richiesta al [Faucet](/dashboard/faucet) conta per le quest del faucet.

### Completa una quest di Eigenstate 2

1. Apri la quest e leggi il suo tipo di controllo.
2. Usa il pulsante offerto dalla quest. Quale compare dipende dal tipo di controllo e dallo stato attuale: **Verify**, **Submit**, **Resubmit**, **Retry verification** o **Re-check status**.
3. Osserva lo stato passare da Started a Pending Verification o Pending Review, poi a Completed (o Failed).

### Leaderboard {#leaderboard}

`/leaderboard` classifica le persone per punti eigenvalue (λ), con i primi tre, statistiche della community e un campo di ricerca. È una classifica off-chain.

### Badges {#badges}

`/badges` è un catalogo di 12 serie di badge. **Check Badges** rivaluta i tuoi progressi. Un **Badge Widget** ti fornisce uno snippet iframe, BBCode o Markdown con **Copy Code** per mostrare un badge altrove. Una serie Bridge compare nell'elenco anche se il bridge non è attivo.

### Games {#games}

`/games` è la **QoreChain Arcade** con 12 giochi: Quantum Space Miner, Quantum Runner, Chain Breaker, Token Rush, Block Defense, Node Puzzle, Quantum Stack, Hash Breaker, Qubit Bounce, Consensus Race, Quantum Maze e Wave Coder. Seleziona **Play Now** su una card; il tuo punteggio (Photons, γ) viene inviato al termine del gioco. I punteggi sono conservati off-chain.

## Come accedere {#how-to-access}

- **URL:** [dashboard.qorechain.io/quests](https://dashboard.qorechain.io/quests), `/leaderboard`, `/badges`, `/games`.
- **Accesso:** richiesto per tutte. `/quests` reindirizza all'accesso quando non hai effettuato l'accesso; Leaderboard, Badges e Games mostrano una schermata "Authentication Required".
- **Rete:** nessuna di esse segue il cambio di rete.
- **Wallet:** non ne serve alcuno, ma le quest che coinvolgono transazioni richiedono un wallet testnet finanziato (vedi [Wallet](/dashboard/wallet#testnet) e [Faucet](/dashboard/faucet)); le quest social richiedono account collegati.
- **Costo:** gratuito.

## Dove è pubblicato {#where-published}

| Pagina | Indirizzo | Account |
| --- | --- | --- |
| Quests (Eigenstate 1 e 2) | `dashboard.qorechain.io/quests` | Accesso |
| Leaderboard | `dashboard.qorechain.io/leaderboard` | Accesso |
| Badges | `dashboard.qorechain.io/badges` | Accesso |
| Games | `dashboard.qorechain.io/games` | Accesso |

## Limiti e problemi noti {#limits}

- **Gli insiemi di quest cambiano.** La scheda di una stagione può essere vuota o mostrare meno quest quando le sue quest non sono attive; controlla la scheda invece di fare affidamento su questa pagina per l'elenco attuale.
- **Tutto qui è off-chain:** punti, classifiche, badge e punteggi dei giochi sono registrati dalla Dashboard, non su QoreChain. I Photons non sono on-chain.
- **Gli importi delle ricompense** sono mostrati su ogni quest e possono cambiare.
- **L'accesso** e, per le quest social, gli account collegati verificati sono richiesti.
- **Public Sale** (`/public-sale`) è una pagina separata per i partecipanti esistenti (allocazione, calendario di vesting, claim); tutti i round precedenti sono chiusi e non viene descritta ulteriormente qui.
- **FAQ** (`/faq`) è una breve pagina di aiuto nell'app; questo manuale è il riferimento.

## Correlati

- [Panoramica e primi passi](/dashboard/overview) - accedi e collega il tuo wallet prima di avviare le quest.
- [Faucet](/dashboard/faucet) - finanzia un wallet testnet per le quest che prevedono transazioni.
