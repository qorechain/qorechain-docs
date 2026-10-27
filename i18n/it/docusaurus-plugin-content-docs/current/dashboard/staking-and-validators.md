---
slug: /dashboard/staking-and-validators
title: Staking e validatori
sidebar_label: Staking e validatori
sidebar_position: 8
---

# Staking e validatori

Questa pagina descrive lo staking dalla Dashboard: delegare il tuo QOR a un validatore, revocarne la delega e riscuotere le ricompense. Le azioni si trovano nella pagina **Wallet** (schede **Stake / Delegate** e **Rewards**) su **mainnet**, con il tuo wallet QoreX collegato. Per confrontare prima i validatori, usa la pagina di sola lettura [Validatori](/dashboard/validators). Per i concetti alla base di delega e ricompense, vedi [Staking e delega](/user-guide/staking-and-delegation).

## Innovazioni {#innovations}

- **La Dashboard non detiene mai una chiave di staking.** Componi la richiesta (quale validatore, quanto) sulla Dashboard, e QoreX la ricostruisce, la mostra, la firma con la firma ibrida ML-DSA-87 e la trasmette. La Dashboard invia solo i parametri tramite un link `qorex://tx?...` e viene a sapere solo l'hash della transazione. Il flusso è lo stesso del [flusso di invio](/dashboard/wallet#send-mainnet).
- **Solo lane nativa, in modo permanente.** Staking, delega e operazioni sui validatori avvengono solo sulla lane nativa (Cosmos) con la firma post-quantistica ibrida, mai tramite un precompile EVM. Un indirizzo collegato tramite MetaMask può ricevere e, con una finestra EVM aperta, inviare QOR, ma non può fare staking. Può farlo solo un indirizzo collegato tramite QoreX.
- **L'ordine dei validatori distribuisce lo stake.** Vengono elencati solo i validatori bonded e non in jail, dal più piccolo. Il primo posto viene estratto a caso sul server dalla metà più piccola, quindi il validatore più grande non è mai quello predefinito.
- **La soglia del light node è un unico totale.** "Currently bonded" è mostrato a confronto con la soglia di stake del light node, contata su tutti i tuoi validatori insieme, quindi un'eventuale mancanza può essere suddivisa tra più validatori.
- **Il tempo di unbonding è mostrato dove serve.** Il periodo di unbonding di 21 giorni viene letto dalla chain e mostrato una volta in Delegate e due volte in Unbond, di proposito, perché è lì che serve.
- **Controllo della commissione prima di firmare.** Il pannello legge il tuo QOR spendibile (esclusi vesting e monete vincolate) e mantiene **Continue in QoreX** disabilitato finché la commissione non può essere pagata.

## Come si usa {#how-to-use}

Prerequisiti: accesso effettuato, intestazione su **Mainnet**, [conferma](/dashboard/overview#risk-acknowledgement) accettata e un wallet QoreX collegato come descritto in [Usare il Wallet su mainnet](/dashboard/wallet#mainnet).

### Scegliere un validatore

Apri [Validatori](/dashboard/validators) per confrontare commissione, potere di voto e stato. La pagina si trova su `/validators` nella Dashboard: richiede che tu abbia effettuato l'accesso, non ha un link nella barra laterale (digita l'indirizzo o segui il link qui) e segue la rete selezionata nell'intestazione. La sua colonna APY viene letta dalla chain e riporta la nota "variable, not guaranteed, lock bonuses not included" (oppure indica "From fees"); non viene promessa alcuna cifra. Nello scegliere, considera:

- **Commissione:** un tasso più basso lascia più ricompense a te, ma gli operatori sostenibili hanno bisogno di una quota ragionevole.
- **Stato:** un validatore finisce in jail quando firma meno del 5% dei blocchi in una finestra di 10.000 blocchi, cioè circa 8,3 ore di blocchi saltati su mainnet a circa 3,1 secondi per blocco. Un jailing per downtime dura un tempo fisso di **600 secondi** e costa al validatore l'**1% del suo stake**; il double-signing è un'infrazione separata, più grave, che comporta uno slashing del **5%**. Questi sono i parametri live della chain (verificati il 27 ottobre 2026).
- **Potere di voto:** distribuire lo stake tra più validatori favorisce la decentralizzazione. L'ordinamento del pannello Delegate aiuta in questo.

### Delegare {#delegate}

1. In **Wallet**, apri la scheda **Stake / Delegate** e trova il pannello **Delegate QOR**.
2. Leggi il riquadro informativo: **Currently bonded** a confronto con la **Light-node threshold**, e se la raggiungi. La soglia viene verificata sul tuo stake totale delegato su tutti i validatori. Non esiste un modo per "delegare a un light node" direttamente: la delega punta sempre a un validatore, e l'idoneità al light node è un controllo separato sul tuo totale.
3. Apri il menu a tendina **Validator** e scegline uno. La prima voce viene estratta a caso dalla metà più piccola dei validatori e può cambiare quando ricarichi la pagina; le altre sono elencate partendo dallo stake più piccolo. I validatori jailed non vengono proposti.
4. Inserisci un **Amount (QOR)**.
5. Leggi la nota sotto l'importo: l'unbonding richiede 21 giorni, e il QOR vincolato non può essere spostato né venduto finché quel periodo non è trascorso.
6. Se il pannello avvisa che l'indirizzo non ha QOR spendibile sufficiente per la commissione, invia prima un po' di QOR spendibile a quell'indirizzo. **Continue in QoreX** resta disabilitato finché ciò non viene risolto.
7. Seleziona **Continue in QoreX** (mostra **Preparing...** mentre la richiesta viene creata).
8. Il pannello mostra "Approve it in QoreX" con **Open QoreX**, l'ID della richiesta e **Approve in the browser extension** quando l'estensione viene rilevata. QoreX mostra il validatore e l'importo prima della firma; non viene inviato nulla finché non approvi.
9. Approva in QoreX. Costruisce, firma e trasmette la delega.

**Esempio minimo:** delega 10 QOR al primo validatore elencato e approva in QoreX.

:::note Lo staking con blocco temporale non fa parte della Dashboard
La release v3.2.4 aggiunge un modulo opzionale di staking con blocco temporale (sulla mainnet dal 23 ottobre 2026, sulla testnet dal 19 ottobre 2026); vedi [Staking con blocco temporale](/user-guide/staking-and-delegation#time-locked-staking). Né la Dashboard né QoreX hanno una schermata per esso. Le deleghe effettuate qui sono deleghe ordinarie senza vincolo di blocco; l'unica attesa è l'unbonding di 21 giorni in uscita.
:::

### Ridelegare {#redelegate}

La Dashboard non ha un pannello Redelegate. **QoreX sposta lo stake tra validatori direttamente** (app 1.0.8+ ed estensione 0.2.6+): niente attesa di 21 giorni di unbonding, nessuna ricompensa persa, e può suddividere uno spostamento su più validatori di destinazione in un'unica transazione. Apri **Stake** in QoreX, tocca il validatore da cui vuoi uscire e scegli dove far confluire lo stake; vedi [Spostare lo stake tra validatori](/qorex/portfolio-and-staking#move-stake).

Su una build di QoreX più vecchia senza questa funzione, sposta invece lo stake in due passaggi: [revoca la delega](#undelegate), attendi il periodo di unbonding (il QOR non è spostabile né produce ricompense in quel periodo), poi [delega](#delegate) al nuovo validatore. Questo metodo alternativo costa 21 giorni di ricompense e più commissioni, quindi aggiorna QoreX se puoi.

### Revocare la delega {#undelegate}

:::caution Periodo di unbonding di 21 giorni
Il QOR con delega revocata non arriva oggi stesso. Rimane prima in un **periodo di unbonding di 21 giorni**, durante il quale non produce ricompense e non può essere spostato né venduto. Il pannello lo dichiara due volte apposta, una come sottotitolo e una proprio sopra il pulsante di conferma.
:::

1. In **Wallet**, apri **Stake / Delegate** e scorri fino al pannello **Unbond QOR**, sotto Delegate.
2. Se da questo indirizzo non hai deleghe attive, il pannello lo segnala e si ferma qui.
3. Apri **Unbond from** e scegli la delega da ridurre. Elenca solo i validatori a cui sei delegato, con l'importo vincolato.
4. Inserisci un importo, oppure seleziona **Unbond all X QOR** per inserire l'intero importo vincolato.
5. Inserire più di quanto è vincolato blocca l'invio.
6. Leggi il secondo avviso sopra il pulsante di conferma: il QOR arriva tra 21 giorni, non oggi.
7. Se l'indirizzo non può coprire la commissione (le monete vincolate non possono pagarla), il pannello avvisa e disabilita il pulsante.
8. Seleziona **Continue in QoreX** (**Preparing...** mentre la richiesta viene creata), poi approva in QoreX tramite **Open QoreX**, oppure **Approve in the browser extension**.

Il QOR torna spendibile solo al termine del periodo di unbonding di 21 giorni.

### Riscuotere le ricompense {#claim}

1. In **Wallet**, apri la scheda **Rewards**.
2. Il pannello **Staking rewards** legge le ricompense maturate su ogni validatore a cui sei delegato. Se da questo indirizzo non hai nulla in stake, lo segnala.
3. Altrimenti mostra il totale in attesa più una riga per validatore. Le ricompense maturano in modo continuo e non vengono perse aspettando.
4. Seleziona **Claim in QoreX**. La riscossione avviene da **tutti** i validatori insieme; non esiste una riscossione per singolo validatore.
5. Approva la riscossione in QoreX (**Open QoreX**, oppure **Approve in the browser extension**).

## Come accedere {#how-to-access}

- **Dove:** [dashboard.qorechain.io/wallet](https://dashboard.qorechain.io/wallet), schede **Stake / Delegate** e **Rewards**. È richiesto l'accesso.
- **Rete:** solo mainnet, con un wallet QoreX collegato. I wallet su testnet non hanno una schermata di staking.
- **Wallet:** QoreX (app o estensione). Keplr e MetaMask non possono fare staking dalla Dashboard.
- **Costi:** la commissione di rete, pagata con QOR spendibile (soglia minima 0,1 uqor per gas). La Dashboard non addebita nulla.
- **Fondi:** i saldi in vesting contano per ciò che puoi delegare ma non possono pagare la commissione.

## Dove è pubblicato {#where-published}

| Superficie | Indirizzo | Rete |
| --- | --- | --- |
| Delegate, Unbond, Rewards | `dashboard.qorechain.io/wallet` | Mainnet |
| Confronta i validatori | `dashboard.qorechain.io/validators`, vedi [Validatori](/dashboard/validators) | Segue la rete dell'intestazione |
| Sposta lo stake tra validatori | QoreX, vedi [Portafoglio e Staking](/qorex/portfolio-and-staking#move-stake) | Mainnet |

## Limiti e problemi noti {#limits}

- **Non presenti nella Dashboard:** la ridelegazione (usa QoreX) e lo staking con blocco temporale.
- **Nessuno staking per i wallet su testnet** nella Dashboard.
- **Le stime sono approssimative:** la stima della commissione e la soglia del light node mostrate nel pannello sono valori incorporati nella Dashboard, non letti dalla chain in quel momento. QoreX mostra la commissione esatta prima che tu firmi.
- **L'unbonding dura 21 giorni** e non può essere accorciato.
- **La riscossione è totale (claim-all).**

## Correlati

- [Validatori](/dashboard/validators) - confronta validatori, commissione e rendimento variabile.
- [Staking e delega](/user-guide/staking-and-delegation) - concetti completi sullo staking.
- [Usare il Wallet su mainnet](/dashboard/wallet#mainnet) - collega QoreX prima di fare staking.
- [Explorer Validators](/dashboard/explorer#validators) - consulta i validatori senza wallet.
- [Nodes & Validators](/dashboard/tools-hub) - candidati a gestire un tuo validatore.
