---
slug: /dashboard/wallet
title: Wallet
sidebar_label: Wallet
sidebar_position: 3
---

# Wallet

La pagina **Wallet** è il luogo in cui visualizzi il tuo saldo e la cronologia delle transazioni, ricevi QOR e li invii. Il funzionamento della pagina dipende dalla rete:

- **Mainnet — non custodial.** La Dashboard non detiene le chiavi di mainnet. Colleghi il tuo wallet (**Keplr** per il binario Native, **MetaMask** per il binario EVM), il tuo saldo reale e la cronologia vengono letti direttamente dalla chain e puoi ricevere fondi su qualsiasi binario. Gli invii avvengono dal tuo wallet collegato.
- **Testnet — custodial.** La Dashboard gestisce per te un wallet di test, così puoi provare trasferimenti, swap e staking senza alcuna configurazione. Alimentalo dal [Faucet](/dashboard/faucet).

Gli account sono protetti con crittografia resistente ai computer quantistici e la codifica Native di ogni indirizzo usa il prefisso bech32 `qor` (`qor1...`).

## Un account, tre codifiche {#one-account-three-encodings}

Un account QoreChain è un'identità unica che può essere scritta in tre modi — uno per ciascun binario di esecuzione:

| Binario | Codifica | Aspetto |
| --- | --- | --- |
| **Native QOR** | bech32 | `qor1...` |
| **EVM** | hex | `0x...` |
| **SVM** | base58 | ad es. `5Gv7...` |

Tutte e tre le codifiche puntano allo **stesso account e allo stesso saldo**. I fondi ricevuti su qualsiasi binario confluiscono nel tuo unico saldo e la Dashboard indicizza saldo e cronologia tramite la codifica `qor1` (Native), quindi l'attività di ogni binario viene mostrata insieme.

## Usare il Wallet su mainnet {#mainnet}

1. Imposta l'intestazione della Dashboard su **Mainnet**.
2. Se richiesto, accetta il [riconoscimento del rischio una tantum](/dashboard/overview#risk-acknowledgement) — la mainnet muove fondi reali, la Dashboard è non custodial e le transazioni sono irreversibili.
3. Seleziona **Connect Wallet** e scegli **Keplr** (binario Native) o **MetaMask** (binario EVM), poi approva la connessione nel tuo wallet.
4. La pagina carica dalla chain il tuo saldo reale e la cronologia delle transazioni.

Se il tuo wallet non ha ancora QoreChain configurata, aggiungila prima — vedi [Aggiungere QoreChain al tuo wallet](#add-network).

### Inviare su mainnet {#send-mainnet}

Poiché la Dashboard non detiene mai le tue chiavi di mainnet, gli invii vengono effettuati dal tuo wallet collegato: crea il trasferimento in Keplr (binario Native) o MetaMask (binario EVM) come faresti su qualsiasi altra rete e firmalo lì. La Dashboard mostra la transazione nella tua cronologia una volta che è on-chain.

:::caution Fondi reali, trasferimenti irreversibili
Le transazioni su mainnet sono irreversibili. Verifica sempre due volte l'indirizzo del destinatario nel tuo wallet prima di firmare.
:::

### Ricevere su un binario specifico {#receive-mainnet}

1. Seleziona **Receive**.
2. Nella finestra di ricezione, scegli un binario con il selettore: **Native QOR**, **EVM** o **SVM**.
3. La finestra mostra il tuo indirizzo nella codifica di quel binario (`qor1...`, `0x...` o base58) con un codice QR e un pulsante di copia.
4. Copia l'indirizzo, oppure lascia che il mittente scansioni il codice QR.

Qualunque sia il binario usato dal mittente, i fondi arrivano nello stesso account — un account, tre codifiche, un saldo.

### Leggere la cronologia delle transazioni {#history}

Su mainnet, ogni riga della cronologia mostra:

- Un **badge del binario** — Native, EVM o SVM — che indica quale binario ha usato la transazione.
- Un'**etichetta reale del tipo di transazione**, come *Send*, *registrazione chiave PQC* o *deploy di contratto*, invece di un'etichetta generica.
- L'importo, l'ora e lo stato, con l'hash della transazione che puoi aprire nell'[Explorer](/dashboard/explorer).

## Usare il Wallet su testnet {#testnet}

Su testnet (`qorechain-diana`) la Dashboard gestisce per te un wallet di test, così puoi provare i flussi da un capo all'altro senza collegare nulla.

### Cosa mostra la pagina

- L'etichetta del tuo wallet e l'indirizzo attivo, in forma abbreviata, con un pulsante di copia con un clic.
- Il tuo **saldo totale** in QOR.
- Un pannello di sicurezza che segnala la crittografia resistente ai computer quantistici e la rete connessa.
- Un indicatore dell'ultimo aggiornamento con un controllo di refresh.
- Le schede **Assets** e **Activity** che mostrano le tue disponibilità e la cronologia delle transazioni.

Usa il controllo di refresh in qualsiasi momento per recuperare dalla chain il saldo corrente e l'attività più recente.

### Inviare QOR (testnet)

1. Seleziona **Send**.
2. Inserisci l'indirizzo del destinatario (`qor1...`).
3. Inserisci l'importo e, facoltativamente, un memo.
4. Rivedi i dettagli e la commissione stimata, poi conferma.

Mentre digiti un destinatario, ti vengono suggeriti i contatti salvati e gli indirizzi recenti per aiutarti a evitare errori. Dopo l'invio del trasferimento ricevi una conferma con l'hash della transazione, che puoi aprire nell'[Explorer](/dashboard/explorer).

### Ricevere QOR (testnet)

1. Seleziona **Receive**.
2. Condividi il tuo indirizzo o il suo codice QR con il mittente, oppure copia l'indirizzo con un clic.
3. Facoltativamente, inserisci un importo richiesto e un memo per generare un link di pagamento e un codice QR scaricabile.

### Gestire i tuoi wallet di test

Seleziona **My Wallets** per aprire l'elenco dei tuoi indirizzi. Da lì puoi passare da un wallet all'altro, creare un nuovo wallet, importarne uno esistente o rimuovere un wallet che non ti serve più. Il wallet attivo è quello usato per invii, swap, staking e altre azioni firmate in tutta la Dashboard su testnet.

## Aggiungere QoreChain al tuo wallet {#add-network}

La pagina **Add Network** mostra quattro schede affiancate — una per ogni modalità di connessione — così puoi aggiungere QoreChain al tuo wallet con un clic:

| Scheda | Cosa ti offre |
| --- | --- |
| **Native** | Gli endpoint RPC e REST più l'ID della chain, ciascuno con un pulsante di copia — per Keplr e altri wallet del binario Native. |
| **EVM** | Parametri di rete EIP-3085 pronti all'uso — un clic aggiunge QoreChain a MetaMask e ad altri wallet EVM. |
| **SVM** | L'URL RPC SVM per wallet e strumenti compatibili con SVM. |
| **WalletConnect** | Un abbinamento WalletConnect per collegare qualsiasi wallet compatibile con WalletConnect. |

Per aggiungere QoreChain:

1. Apri la pagina **Add Network** dalla Dashboard.
2. Scegli la scheda che corrisponde al binario del tuo wallet.
3. Seleziona il pulsante di aggiunta (EVM, WalletConnect), oppure copia gli endpoint e l'ID della chain nel modulo di aggiunta rete del tuo wallet (Native, SVM).
4. Approva la nuova rete nel tuo wallet.

Gli endpoint pubblici sono `rpc.qore.host` (RPC Native), `api.qore.host` (REST), `evm.qore.host` (JSON-RPC EVM) e `svm.qore.host` (RPC SVM), con le varianti `*-testnet` (ad esempio `rpc-testnet.qore.host`) per la testnet. ID delle chain: mainnet `qorechain-vladi` (chain ID EVM `9801`), testnet `qorechain-diana` (chain ID EVM `9800`).

## Correlati

- [Token Operations](/user-guide/token-operations) — i concetti alla base dei trasferimenti e delle denominazioni di QOR.
- [Trade](/dashboard/trade) — scambia i tuoi token sull'AMM on-chain.
- [Bridge](/dashboard/bridge) — sposta asset da e verso altre chain.
