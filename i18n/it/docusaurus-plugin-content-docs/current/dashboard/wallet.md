---
slug: /dashboard/wallet
title: Portafoglio
sidebar_label: Portafoglio
sidebar_position: 3
---

# Wallet

La pagina **Wallet** è dove visualizzi il tuo saldo e la cronologia delle transazioni, ricevi QOR e lo invii. Il funzionamento della pagina dipende dalla rete:

- **Mainnet — non custodiale.** Il Dashboard non conserva le chiavi della mainnet. Colleghi il tuo wallet — **QoreX** (il wallet ufficiale di QoreChain, estensione o app), **Keplr** o **MetaMask** — il tuo saldo e la cronologia reali vengono letti direttamente dalla chain, e puoi ricevere fondi su qualsiasi rail. L'invio e lo staking sul **rail Native richiedono QoreX**: gli account QoreChain firmano con una firma ibrida post-quantistica, e QoreX è il wallet che la produce, quindi le schede Invia e Stake del Dashboard funzionano tramite QoreX indipendentemente da quale altro wallet hai anche collegato. Keplr può comunque essere collegato per visualizzare il tuo saldo sul rail Native (`qor1...`) e per ricevere fondi su di esso. **MetaMask** firma e invia in modo indipendente sul **rail EVM** (`0x...`), che usa una firma classica e non è interessato da questo vincolo.
- **Testnet — custodiale.** Il Dashboard gestisce un wallet di test per te, così puoi provare trasferimenti, swap e staking senza alcuna configurazione. Riforniscilo dal [Faucet](/dashboard/faucet).

Gli account sono protetti con crittografia quantum-safe, e la codifica Native di ogni indirizzo usa il prefisso bech32 `qor` (`qor1...`).

## Un account, tre codifiche {#one-account-three-encodings}

Un account QoreChain è un'unica identità che può essere scritta in tre modi — uno per ogni rail di esecuzione:

| Rail | Codifica | Aspetto |
| --- | --- | --- |
| **Native QOR** | bech32 | `qor1...` |
| **EVM** | hex | `0x...` |
| **SVM** | base58 | ad es. `5Gv7...` |

Tutte e tre le codifiche puntano allo **stesso account e allo stesso saldo**. I fondi ricevuti su qualsiasi rail confluiscono nel tuo unico saldo, e il Dashboard indicizza saldo e cronologia tramite la codifica `qor1` (Native), quindi l'attività di ogni rail appare insieme.

## Usare il Wallet su mainnet {#mainnet}

1. Passa l'intestazione del Dashboard a **Mainnet**.
2. Se richiesto, accetta la [dichiarazione di rischio una tantum](/dashboard/overview#risk-acknowledgement) — la mainnet muove fondi reali, il Dashboard è non custodiale e le transazioni sono irreversibili.
3. Seleziona **Connect Wallet** e scegli un wallet — **QoreX** (consigliato, il wallet ufficiale di QoreChain — richiesto per inviare e fare staking sul rail Native), **Keplr** (per visualizzare/ricevere sul rail Native) o **MetaMask** (per collegarti, inviare e ricevere sul rail EVM). Di seguito trovi i passaggi dettagliati per ciascuno.
4. La pagina carica il tuo saldo reale e la cronologia delle transazioni dalla chain.

Una volta collegato, la pagina Wallet organizza tutto in sei schede: **Wallet** (saldo e riepilogo account), **Send from QoreX**, **Stake / Delegate**, **Rewards**, **Details** (i tuoi indirizzi `qor1...` / `0x...` / SVM) e **Connect Wallets** (ogni wallet che hai collegato, e da dove collegarne altri). Le schede Send, Stake e Rewards funzionano tramite QoreX — questo vale anche se hai anche Keplr o MetaMask collegati, perché le transazioni sul rail Native richiedono la firma ibrida post-quantistica prodotta da QoreX.

Se il tuo wallet non ha ancora QoreChain configurata, aggiungila prima — vedi [Aggiungere QoreChain al tuo wallet](#add-network).

### Collegati con QoreX — estensione browser {#connect-qorex-extension}

1. Nella pagina Wallet, trova la scheda **QoreX wallet** e seleziona **Connect with QoreX**.
2. Poiché l'estensione QoreX (0.1.4 o successiva) viene rilevata in questo browser, il Dashboard chiede come vuoi collegarti. Seleziona **Browser extension**.
3. L'estensione QoreX apre il proprio popup di approvazione, mostrando `dashboard.qorechain.io` come sito che richiede la connessione.
4. Rivedi la richiesta nel popup e approvala — questo firma una prova una tantum che possiedi il tuo indirizzo `qor1...`; nessun fondo si muove e non viene concesso nessun altro permesso.
5. Il popup si chiude e il Dashboard mostra **Connected: qor1...** sulla scheda QoreX, con il tuo indirizzo che sblocca il resto della pagina Wallet. La scelta estensione/app viene ricordata, quindi la prossima volta che selezioni **Connect with QoreX** su questo browser si ricollega nello stesso modo senza chiedere — usa **Use a different method** sulla scheda di connessione se mai vuoi cambiare metodo.

Puoi collegare più di un indirizzo QoreX allo stesso account Dashboard — ad esempio uno da un'estensione Firefox e uno da Chrome, oppure un telefono e un laptop. Seleziona **Add another wallet** per ripetere il flusso con un secondo indirizzo; a ogni indirizzo collegato può essere assegnata la propria etichetta e uno viene contrassegnato come predefinito per l'invio, entrambi dalla scheda **Connect Wallets**.

### Collegati con QoreX — app mobile {#connect-qorex-app}

1. Nella pagina Wallet, trova la scheda **QoreX wallet** e seleziona **Connect with QoreX**.
2. Se appare il selettore dell'estensione, seleziona **QoreX app** (se in questo browser non viene rilevata nessuna estensione, il Dashboard passa direttamente a questo flusso).
3. Il Dashboard mostra un codice QR e un link **Open QoreX**.
4. Sul tuo telefono, apri l'app QoreX e scansiona il codice QR con essa — oppure, se stai navigando dallo stesso telefono, tocca **Open QoreX** per avviare l'app direttamente tramite il suo link `qorex://connect`.
5. QoreX mostra la richiesta di pairing con l'origine del Dashboard. Rivedila e approvala con la tua conferma biometrica (Face ID / Touch ID / PIN).
6. Il Dashboard esegue il polling dell'approvazione in background; entro un paio di secondi mostra **Connected: qor1...** sulla scheda QoreX, e il tuo indirizzo sblocca il resto della pagina Wallet.

### Collegati con Keplr {#connect-keplr}

Keplr si collega per visualizzare il tuo saldo, la cronologia e l'indirizzo di ricezione sul rail Native. L'invio e lo staking sul rail Native usano QoreX (vedi sopra) — gli account QoreChain firmano con una firma ibrida post-quantistica, motivo per cui le schede Invia e Stake del Dashboard funzionano tramite QoreX anziché tramite qualsiasi wallet tu abbia collegato qui.

1. Nella pagina Wallet, seleziona **Connect Wallet** e scegli **Keplr**.
2. Se QoreChain non è ancora configurata in Keplr, il Dashboard attiva il prompt `suggestChain` di Keplr — rivedi i dettagli della rete (chain ID, endpoint RPC/REST) nel popup di Keplr e seleziona **Approve** per aggiungerla.
3. Keplr ti chiede quindi di selezionare l'account da collegare e di approvare la connessione — seleziona **Approve**.
4. Il Dashboard legge il tuo indirizzo `qor1...` e carica il tuo saldo e la cronologia.

### Collegati con MetaMask {#connect-metamask}

1. Nella pagina Wallet, seleziona **Connect Wallet** e scegli **MetaMask**.
2. Se la rete EVM di QoreChain non è ancora stata aggiunta, MetaMask mostra il proprio prompt **Add network** (EIP-3085) con chain ID, URL RPC e simbolo della valuta precompilati — rivedilo e seleziona **Approve**, poi **Switch network**.
3. MetaMask chiede quale account collegare — seleziona l'account e conferma **Connect**.
4. Il Dashboard legge il tuo indirizzo `0x...` e carica il tuo saldo e la cronologia.

### Inviare su mainnet {#send-mainnet}

Poiché il Dashboard non conserva mai le tue chiavi mainnet, ogni invio viene composto sul Dashboard ma finalizzato nel tuo wallet. Sul **rail Native**, quel wallet è sempre **QoreX** — le schede Send e Stake funzionano tramite esso indipendentemente da quale altro wallet hai anche collegato, perché gli account QoreChain firmano con una firma ibrida post-quantistica. Sul **rail EVM**, MetaMask firma e invia in modo indipendente.

:::caution Fondi reali, trasferimenti irreversibili
Le transazioni sulla mainnet sono irreversibili. Verifica sempre due volte l'indirizzo del destinatario prima di approvare.
:::

:::note Saldi in vesting
Se parte del tuo saldo è ancora in vesting, conta ai fini di quanto puoi delegare per lo staking, ma non può pagare una commissione di transazione — per questo ti serve QOR liberamente spendibile a parte, anche per registrare una chiave PQC. Un wallet finanziato solo con il proprio importo in vesting può delegare ma non può inviare.
:::

#### Invia con QoreX — estensione browser

1. Nella pagina Wallet, nella scheda **Send from QoreX**, inserisci il destinatario (un indirizzo `qor1...` o un `@handle`), l'importo in QOR e un memo facoltativo.
2. Seleziona **Continue in QoreX**.
3. Il Dashboard mostra un pulsante **Approve in browser extension** — selezionalo.
4. L'estensione QoreX apre il proprio popup di approvazione con il trasferimento decodificato per intero — destinatario e importo. Rivedilo e approvalo usando la sicurezza propria della tua estensione (sblocco biometrico o password).
5. L'estensione firma il trasferimento con una firma ibrida PQC e lo trasmette direttamente alla chain — il Dashboard apprende solo l'hash della transazione risultante.
6. La pagina Wallet mostra **Transfer confirmed** con l'hash della transazione, che puoi aprire nell'[Explorer](/dashboard/explorer).

#### Invia con QoreX — app mobile

1. Nella pagina Wallet, nella scheda **Send from QoreX**, inserisci il destinatario (un indirizzo `qor1...` o un `@handle`), l'importo in QOR e un memo facoltativo.
2. Seleziona **Continue in QoreX**.
3. Il Dashboard mostra un codice QR e un link **Open QoreX** che porta una richiesta `qorex://tx`.
4. Scansiona il codice QR con l'app QoreX, oppure tocca **Open QoreX** se sei sullo stesso telefono.
5. QoreX decodifica la richiesta e mostra il destinatario e l'importo per intero. Rivedila e approvala con la tua conferma biometrica.
6. QoreX firma il trasferimento con una firma ibrida PQC e lo trasmette.
7. Il Dashboard esegue il polling del risultato e mostra **Transfer confirmed** con l'hash della transazione una volta che approda sulla chain, che puoi aprire nell'[Explorer](/dashboard/explorer).

#### Inviare a un @handle

Il campo destinatario nella scheda **Send from QoreX** accetta anche un `@handle` invece di un indirizzo `qor1...`. Ciò che accade dopo dipende dal fatto che tu abbia già pagato quell'handle da questo browser in precedenza:

- **Prima volta**: l'indirizzo risolto viene mostrato per intero, e devi selezionare **Confirm address** prima che possa essere usato — l'indirizzo viene memorizzato (pinnato) solo dopo averlo confermato, non nel momento in cui viene risolto.
- **Stesso indirizzo di prima**: passa con una conferma leggera — non serve digitare di nuovo.
- **Un indirizzo diverso da prima**: il flusso si ferma bruscamente. Sia l'indirizzo precedente sia quello nuovo vengono mostrati per intero — mai troncati, poiché il troncamento nasconde esattamente i caratteri centrali che un attaccante cercherebbe di far sembrare simili — con un avviso esplicito che l'indirizzo è cambiato, e un pulsante **deliberatamente in stile secondario** per procedere comunque.

Questo pin è memorizzato solo nel tuo browser, non su alcun server, quindi un computer diverso o un browser ripulito mostra di nuovo "prima volta" — è intenzionale. Gli handle sono lunghi 3–20 caratteri (`a-z`, `0-9`, `_`) e appartengono a un indirizzo specifico, quindi chi possiede più indirizzi può usare un handle diverso per ciascuno.

#### Invia con MetaMask

1. Apri MetaMask e verifica che sia impostato sulla rete EVM di QoreChain.
2. Seleziona **Send** all'interno di MetaMask.
3. Inserisci l'indirizzo `0x...` del destinatario e l'importo.
4. Rivedi la commissione di gas e conferma per firmare e trasmettere.
5. Tornato sulla pagina Wallet del Dashboard, la transazione appare nella tua cronologia una volta che è sulla chain (aggiorna se non è ancora comparsa).

### Ricevere su un rail specifico {#receive-mainnet}

1. Seleziona **Receive**.
2. Nella finestra modale di ricezione, scegli un rail con il selettore: **Native QOR**, **EVM** o **SVM**.
3. La finestra modale mostra il tuo indirizzo nella codifica di quel rail (`qor1...`, `0x...` o base58) con un codice QR e un pulsante di copia.
4. Copia l'indirizzo, oppure lascia che il mittente scansioni il codice QR.

Qualunque rail usi il mittente, i fondi arrivano sullo stesso account — un account, tre codifiche, un saldo.

### Leggere la cronologia delle transazioni {#history}

Su mainnet, ogni riga della tua cronologia mostra:

- Un **badge del rail** — Native, EVM o SVM — che indica quale rail ha usato la transazione.
- Un'**etichetta reale del tipo di transazione**, come *Send*, *PQC key registration* o *contract deploy*, invece di un'etichetta generica.
- L'importo, l'ora e lo stato, con l'hash della transazione che puoi aprire nell'[Explorer](/dashboard/explorer).

## Usare il Wallet su testnet {#testnet}

Su testnet (`qorechain-diana`) il Dashboard gestisce un wallet di test per te, così puoi testare i flussi end to end senza collegare nulla.

### Cosa mostra la pagina

- L'etichetta del tuo wallet e l'indirizzo attivo, in forma abbreviata, con un pulsante di copia a un clic.
- Il tuo **saldo totale** in QOR.
- Un pannello di sicurezza che segnala la crittografia quantum-safe e la rete collegata.
- Un indicatore dell'ultimo aggiornamento con un controllo di refresh.
- Le schede **Assets** e **Activity** che mostrano i tuoi possedimenti e la cronologia delle transazioni.

Usa il controllo di refresh in qualsiasi momento per recuperare dalla chain il tuo saldo attuale e l'attività più recente.

### Invia QOR (testnet)

1. Seleziona **Send**.
2. Inserisci l'indirizzo del destinatario (`qor1...`).
3. Inserisci l'importo e un memo facoltativo.
4. Rivedi i dettagli e la commissione stimata, poi conferma.

Mentre digiti un destinatario, vengono suggeriti contatti salvati e indirizzi recenti per aiutarti a evitare errori. Dopo l'invio del trasferimento, ricevi una conferma con l'hash della transazione, che puoi aprire nell'[Explorer](/dashboard/explorer).

### Ricevi QOR (testnet)

1. Seleziona **Receive**.
2. Condividi il tuo indirizzo o il suo codice QR con il mittente, oppure copia l'indirizzo con un clic.
3. Facoltativamente inserisci un importo richiesto e un memo per generare un link di pagamento e un codice QR scaricabile.

### Gestire i tuoi wallet di test

Seleziona **My Wallets** per aprire il tuo elenco di indirizzi. Da lì puoi passare tra i wallet, crearne uno nuovo, importarne uno esistente o rimuovere un wallet che non ti serve più. Il wallet attivo è quello usato per inviare, fare swap, staking e altre azioni firmate in tutto il Dashboard su testnet.

## Aggiungere QoreChain al tuo wallet {#add-network}

La pagina **Add Network** mostra quattro schede affiancate — una per ogni modalità di connessione — così puoi aggiungere QoreChain al tuo wallet in un clic:

| Scheda | Cosa ottieni |
| --- | --- |
| **Native** | Endpoint RPC e REST più il chain ID, ciascuno con un pulsante di copia — per Keplr e altri wallet del rail Native. |
| **EVM** | Parametri di rete EIP-3085 già pronti — un clic aggiunge QoreChain a MetaMask e ad altri wallet EVM. |
| **SVM** | L'URL RPC SVM per wallet e strumenti compatibili con SVM. |
| **WalletConnect** | Un pairing WalletConnect per collegare qualsiasi wallet compatibile con WalletConnect. |

Per aggiungere QoreChain:

1. Apri la pagina **Add Network** dal Dashboard.
2. Scegli la scheda che corrisponde al rail del tuo wallet.
3. Seleziona il pulsante di aggiunta (EVM, WalletConnect), oppure copia gli endpoint e il chain ID nel modulo di aggiunta rete del tuo wallet (Native, SVM).
4. Approva la nuova rete nel tuo wallet.

Gli endpoint pubblici sono `rpc.qore.host` (RPC Native), `api.qore.host` (REST), `evm.qore.host` (EVM JSON-RPC) e `svm.qore.host` (RPC SVM), con varianti `*-testnet` (ad esempio `rpc-testnet.qore.host`) per la testnet. Chain ID: mainnet `qorechain-vladi` (EVM chain ID `9801`), testnet `qorechain-diana` (EVM chain ID `9800`).

### Firmatari collegati (Phantom) {#linked-signers}

La scheda **SVM** ti permette anche di collegare una chiave Phantom al tuo account come **firmatario collegato** — un autenticatore di spesa delegato e revocabile, non una connessione wallet primaria separata come QoreX, Keplr o MetaMask. Il tuo wallet esistente firma la registrazione; Phantom non diventa mai una propria identità. Per il modello di permessi e limiti di spesa on-chain dietro a questo meccanismo, vedi [Firmatari collegati e limiti di spesa](/qorex/security-and-recovery#linked-signers) nella documentazione di QoreX.

## Correlati

- [Operazioni sui token](/user-guide/token-operations) — i concetti dietro i trasferimenti e le denominazioni di QOR.
- [Trade](/dashboard/trade) — scambia i tuoi token sull'AMM on-chain.
- [Bridge](/dashboard/bridge) — sposta gli asset da e verso altre chain.
