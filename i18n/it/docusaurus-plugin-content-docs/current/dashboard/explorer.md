---
slug: /dashboard/explorer
title: Explorer
sidebar_label: Explorer
sidebar_position: 2
---

# Explorer

L'**Explorer** è la finestra in sola lettura sulla chain: cerca blocchi, transazioni, indirizzi e validatori e osserva l'attività della rete. È pensato per chi vuole controllare un trasferimento, ispezionare un account, vedere quale firma ha protetto una transazione o guardare l'insieme dei validatori. Esistono due explorer: quello all'interno della Dashboard su `dashboard.qorechain.io/explorer` e un'app pubblica separata su [explore.qore.network](https://explore.qore.network) che non richiede alcun account. Sono applicazioni diverse e non applicano le stesse regole di etichettatura, quindi questa pagina tratta entrambe.

## Innovazioni {#innovations}

- **Un'etichetta della firma solo quando la chain l'ha verificata.** Nell'Explorer della Dashboard una transazione nativa mostra la scheda **PQC Verified** solo se è riuscita (code 0) **e** la chain ha emesso un evento `pqc_hybrid_verify` con stato verified. Una transazione fallita non riceve alcuna dichiarazione post-quantum.
- **Le transazioni EVM mostrano la finestra che le ha autorizzate.** Dall'altezza di attivazione (testnet 5.920.000; mainnet 2.981.742) una transazione EVM mostra "Authorised by a PQC window", con un link "Window opened by" alla transazione nativa, firmata con ML-DSA-87, che l'ha aperta. La finestra mostrata è l'ultima apertura di finestra del mittente all'altezza della transazione o a una inferiore che non è scaduta e non è stata chiusa da allora. Una transazione EVM non è mai etichettata "PQC Verified": porta una normale firma secp256k1. Vedi [Finestra di autorizzazione EVM](/developer-guide/evm-development#evm-window).
- **Nessuna etichetta post-quantum per blocco.** I blocchi sono firmati dalle chiavi di consenso, quindi la protezione è mostrata per transazione, mai per blocco.
- **Stato post-quantum del validatore dalla chain.** La pagina dell'indirizzo di un validatore ha un campo "Post-Quantum Crypto" (Enabled, Disabled o N/A). Enabled significa che l'operatore ha una chiave ML-DSA-87 registrata. La proof of possession è facoltativa on-chain.
- **Un account, tre rail.** Una cronologia `qor1...` unisce l'attività Native, EVM e SVM, e la pagina dell'indirizzo mostra l'importo ancora in vesting e la data del prossimo sblocco.
- **Dati di rete ed endpoint in un solo pannello.** Chain ID, EVM chain ID, token, decimali, prefisso degli indirizzi, coin type, prezzo minimo del gas ed endpoint pubblici copiabili, con un pannello "Add QoreChain to your wallet".
- **L'explorer standalone è costruito solo sugli endpoint pubblici.** [explore.qore.network](https://explore.qore.network) legge gli endpoint pubblici della chain e non richiede alcun account. La sua pagina dell'indirizzo mostra le forme `qor1`, `0x` e SVM di un unico account con un controllo di parità in tempo reale (wei = uqor x 10^12; lamport = uqor x 1000), e le sue route funzionano come deep link per i wallet.

## Come usarlo {#how-to-use}

### Panoramica

Apri **Explorer** nella barra laterale. La panoramica mostra:

- lo stato della rete con un chip "Post-Quantum Secured" (un'etichetta a livello di rete; la dichiarazione per singola transazione è nella pagina della transazione);
- **Latest Block**, **Block Time** e **Blocks Today**;
- **Total Bonded**, **Bonded Ratio** e **Circulating**;
- **Transactions**, **Real Txs**, **Active Set** e **Total Addresses**;
- **Latest Blocks** e **Latest Transactions**, con pulsanti di aggiornamento e aggiornamento automatico.

Fai clic su una riga di blocco o di transazione per aprirne la pagina.

### Ricerca

La casella di ricerca (segnaposto "Search QoreChain (Address, Tx, Block)...") ti indirizza in base a ciò che digiti:

- `qor...` apre la pagina dell'indirizzo.
- `0x...` o una stringa di 64 caratteri apre la pagina della transazione.
- Le cifre aprono la pagina del blocco.

:::note Un indirizzo 0x porta a "Transaction Not Found"
La ricerca della Dashboard tratta l'input `0x...` come un hash di transazione. Per cercare un indirizzo EVM, cerca invece la sua forma `qor1...` (un indirizzo `0x` corrisponde agli stessi 20 byte della sua forma `qor1`), oppure usa [explore.qore.network](https://explore.qore.network), la cui pagina dell'indirizzo accetta entrambe.
:::

### Pagina della transazione

La pagina della transazione mostra l'hash (con copia), stato e tipo, Block Height, Interactions (From e To), Value & Fees, Memo, Gas Consumed, una riga cross-chain quando presente e **Raw Data**. Mostra anche che cosa ha protetto la transazione, e afferma solo ciò che la chain conferma:

- **PQC Verified.** Una transazione sulla lane nativa che è riuscita e la cui firma ibrida (inclusa la parte ML-DSA-87) è stata verificata dalla chain stessa. Una transazione fallita, o senza una firma ibrida verificata, mostra invece la sicurezza standard.
- **Authorised by a PQC window.** Una transazione EVM inviata mentre il mittente aveva aperta una [finestra di autorizzazione EVM](/developer-guide/evm-development#evm-window), con il link **Window opened by**.

### Pagina del blocco

Le frecce precedente e successivo scorrono la chain. **Core Information** riporta altezza, hash, proposer, numero di firme e Gas Used; seguono **Technical Hashes** e **Block Transactions**. I blocchi non portano alcuna etichetta post-quantum.

### Pagina dell'indirizzo

Un indirizzo QoreChain è un unico account con tre codifiche, Native (`qor1...`), EVM (`0x...`) e SVM (base58), e la pagina dell'indirizzo unisce l'attività di tutte e tre.

- **Copy address** e **Show QR Code** (un popover; non c'è alcun download).
- **Total Balance** e **Available**, e una riga per l'importo ancora in vesting con la data del prossimo sblocco.
- **Total Activity** e la cronologia combinata (metodi come Transfer, Faucet Claim e Cross-Chain Swap).
- Nella pagina dell'indirizzo di un validatore (`/explorer/address/qorvaloper1...`), il campo **Post-Quantum Crypto**.

### Validatori {#validators}

`/explorer/validators` elenca i validatori della rete. Le schede riepilogative mostrano **Active Validators**, **Bonded Tokens** e **Consensus Health** (un'etichetta di stato, non un valore misurato). La tabella ha Rank, Validator, Voting Power, Commission, Status e PQC (la colonna PQC della tabella è attenuata per ogni riga; usa la pagina dell'indirizzo del validatore per il suo stato reale). La casella di ricerca riporta "Search validator...". L'elenco segue la rete selezionata nell'intestazione. Per delegare, consulta [Staking e Validatori](/dashboard/staking-and-validators); per un confronto più ampio con rendimento e accesso, consulta [Validators](/dashboard/validators).

### Dati di rete e aggiunta al wallet

La panoramica riporta i dati della chain e gli endpoint pubblici, ciascuno copiabile, e lo stesso pannello **Add QoreChain to your wallet** della pagina Wallet (vedi [Aggiungi QoreChain al tuo wallet](/dashboard/wallet#add-network)).

### Explorer standalone {#standalone-explorer}

[explore.qore.network](https://explore.qore.network) è un'app web separata, dedicata solo all'explorer. Si apre sulla **mainnet** e ha un selettore **Testnet / Mainnet** nell'intestazione. Route:

| Route | Cosa mostra |
| --- | --- |
| `/` | Altezza live, stato, supply, stake in bonding, ultimi blocchi e transazioni, dati della chain, endpoint pubblici e link alle guide. |
| `/blocks`, `/block/{height}` | Elenco dei blocchi e un blocco con le sue transazioni. |
| `/txs`, `/tx/{hash}` | Elenco delle transazioni e una transazione con stato, commissione, gas, messaggi e risposta raw. |
| `/address/{qor1... or 0x...}` | La pagina di identità unificata con le tre codifiche e il controllo di parità. `/account/*` reindirizza a `/address/*`. |
| `/validators`, `/validator/{address}` | L'insieme dei validatori con voting power e commissione, e un singolo validatore. |
| `/tokens`, `/token/{denom}`, `/assets` | Elenchi di token e asset. |
| `/contracts`, `/nfts`, `/collections` | Contratti, NFT e collezioni. |

La ricerca accetta un'altezza di blocco, un hash di 64 caratteri esadecimali (con o senza `0x`), un indirizzo `qor1...` o `0x...`, oppure un indirizzo `qorvaloper1...`. Una ricerca `qorvaloper1...` apre l'elenco dei validatori, non la pagina di quel validatore. Una sezione **Add to wallet** offre suggestChain (Keplr, Leap, Cosmostation), EIP-3085 (MetaMask e altri wallet EVM), le istruzioni per il custom RPC SVM e l'abbinamento WalletConnect v2.

Le route `/tx/`, `/block/` e `/address/` funzionano con i link EIP-3085 del block explorer, quindi i wallet che aprono un URL dell'explorer arrivano alla pagina giusta.

:::caution Non usare /api/lcd dell'explorer da codice
L'explorer standalone ha un proxy di sola lettura su `/api/lcd/...` che serve le sue stesse pagine, e risponde in base al cookie di rete del browser. Non è un'API pubblica: può cambiare, non è dimensionato per un uso programmatico e restituisce la rete indicata dal cookie. Per script, servizi e wallet usa invece gli endpoint REST pubblici: `https://api.qore.host` (mainnet) e `https://api-testnet.qore.host` (testnet). Vedi [Endpoint REST e gRPC](/api-reference/rest-grpc-endpoints).
:::

:::note L'explorer standalone non applica ancora le regole di etichettatura PQC della Dashboard
Le regole in [Innovazioni](#innovations) (un'etichetta post-quantum solo dopo la verifica della chain, e la scheda "Authorised by a PQC window" per le transazioni EVM) sono attive nell'Explorer della Dashboard. L'explorer standalone su explore.qore.network non è stato aggiornato per applicarle: la sua pagina della transazione mostra un indicatore di firma ibrida che non distingue ancora una transazione fallita, e etichetta le transazioni EVM con la sua formulazione precedente. Considera le etichette dell'Explorer della Dashboard come riferimento.
:::

## Come accedere {#how-to-access}

- **Explorer della Dashboard:** [dashboard.qorechain.io/explorer](https://dashboard.qorechain.io/explorer). Scegli la rete nell'intestazione. La **panoramica** su mainnet richiede l'accesso e la [presa d'atto una tantum](/dashboard/overview#risk-acknowledgement); la panoramica su testnet e **tutte le pagine di dettaglio** (transazione, blocco, indirizzo, validatori) su entrambe le reti si aprono senza account.
- **Explorer standalone:** [explore.qore.network](https://explore.qore.network). Nessun account, nessun wallet. Usa il selettore nell'intestazione per la testnet.
- **Costo:** gratuito. Per leggere qualsiasi cosa non serve alcuna connessione del wallet.

## Dove è pubblicato {#where-published}

| Superficie | Indirizzo | Reti | Account |
| --- | --- | --- | --- |
| Explorer della Dashboard | `dashboard.qorechain.io/explorer` (`/explorer/tx/<hash>`, `/explorer/block/<height>`, `/explorer/address/<address>`, `/explorer/validators`) | Mainnet e testnet, selettore nell'intestazione | Solo la panoramica su mainnet |
| Explorer standalone | `explore.qore.network` | Mainnet (predefinita) e selettore testnet | Nessuno |
| Dati della chain | `api.qore.host`, `api-testnet.qore.host` (REST), `rpc.qore.host`, `rpc-testnet.qore.host` (RPC) | Mainnet e testnet | Nessuno |

## Limiti e problemi noti {#limits}

- **Un indirizzo `0x` digitato nella ricerca della Dashboard** porta a "Transaction Not Found". Usa la forma `qor1...`.
- **La colonna PQC** nella tabella dei validatori della Dashboard è sempre attenuata. Lo stato reale di un validatore è nella sua pagina dell'indirizzo.
- **Non mostrati:** un contatore dell'uso della finestra per transazione, proof post-quantum per i blocchi e un indicatore post-quantum per singolo validatore nella tabella dei validatori.
- **L'explorer standalone** non ha ancora adottato le regole di etichettatura della Dashboard (vedi sopra), e una ricerca `qorvaloper1...` apre l'elenco dei validatori.
- **L'/api/lcd dell'explorer standalone** è per il sito stesso, non per i programmi.
- **La rete segue l'intestazione** nell'Explorer della Dashboard: un hash dell'altra rete mostra "not found".
