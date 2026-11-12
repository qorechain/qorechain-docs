---
slug: /build-before-qday/workshop-1/apps/rust-qday-pay
title: App Rust, qday-pay
sidebar_label: Rust, qday-pay
sidebar_position: 4
---

# App Rust: qday-pay

**qday-pay** è un piccolo programma Rust che esegui in un terminale. Paga QOR di testnet sulla testnet di QoreChain `qorechain-diana` con una **firma ibrida**: una firma classica secp256k1 più una firma post-quantistica ML-DSA-87 (NIST FIPS 204). Dopo il pagamento rilegge la transazione dalla catena e ti mostra la prova della catena stessa che entrambe le firme sono state controllate.

**Quanto ci vuole:** circa 15 minuti in totale. La prima compilazione scarica e compila le librerie e richiede da 2 a 5 minuti. Dopo, ogni comando gira in pochi secondi.

## Cosa mostra {#what-it-shows}

- **Firma ibrida da Rust** con il crate pubblicato `qorechain-sdk` (versione 0.13, usato nel codice come `qorechain`).
- **Registrazione una tantum** della tua chiave post-quantistica on chain.
- **Un rapporto di verifica** per qualsiasi transazione: la firma classica di 64 byte, la firma ML-DSA-87 di 4.627 byte e il verdetto `pqc_hybrid_verify` della catena.

Perché è importante: si prevede che una firma solo classica possa essere violata da un futuro computer quantistico. Una firma ibrida resta sicura finché regge almeno una delle due metà. Vedi [Transazioni a prova di quantistico](/sdk/guides/quantum-safe).

## Passo dopo passo {#run}

Lavori nel tuo terminale. Usa solo un account di testnet usa e getta. Il QOR di testnet non ha alcun valore. Non usare mai un wallet reale né fondi reali qui.

:::note Windows
qday-pay usa i permessi dei file di Linux e macOS per il suo file della chiave, quindi su Windows lo esegui dentro **WSL** (Windows Subsystem for Linux). WSL ti dà un terminale Linux dentro Windows. Da lì in poi segui le istruzioni per Linux.
:::

### 1. Prima di iniziare: installa gli strumenti {#install}

Servono tre strumenti: **Git** (scarica il codice), **Rust** (compila il programma) e un **compilatore C** (Rust ne ha bisogno per collegare il programma). Per questa app non servono Java, Node.js né Python.

**macOS**

| Strumento | Come installarlo | Come verificarlo |
| --- | --- | --- |
| Compilatore C e Git | `xcode-select --install` (si apre una finestra, fai clic su Installa) | `git --version` |
| Rust | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (premi Invio per accettare l'opzione predefinita), poi chiudi e riapri il terminale | `rustc --version` e `cargo --version` |

**Linux (Debian o Ubuntu; le altre distribuzioni usano il proprio gestore di pacchetti)**

| Strumento | Come installarlo | Come verificarlo |
| --- | --- | --- |
| Git e compilatore C | `sudo apt update && sudo apt install -y git build-essential curl` | `git --version` |
| Rust | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (premi Invio per accettare l'opzione predefinita), poi chiudi e riapri il terminale | `rustc --version` e `cargo --version` |

**Windows (tramite WSL)**

1. Apri PowerShell come amministratore ed esegui `wsl --install`. Riavvia il computer quando lo chiede. Windows installa Ubuntu. Apri l'app **Ubuntu** dal menu Start.
2. Nel terminale di Ubuntu, segui la tabella **Linux** qui sopra.
3. Git per Windows (https://git-scm.com/download/win) non serve, perché Git arriva con il comando Linux di cui sopra.

È richiesto Rust 1.74 o successivo. Il comando `rustup` installa la versione più recente, e va bene. Il controllo della versione dovrebbe stampare qualcosa come `rustc 1.80.0`, o un numero più alto.

**Cosa dovresti vedere:** `git --version`, `rustc --version` e `cargo --version` stampano ciascuno un numero di versione. Se un comando dice `command not found`, chiudi il terminale, aprine uno nuovo e riprova.

### 2. Prima di iniziare: ottieni un wallet di testnet e il faucet {#wallet}

Questa app crea da sola il proprio account di testnet (passaggio 5), quindi non devi installare un wallet per eseguirla. Ti serve solo un modo per ricevere QOR di testnet gratuiti. Il faucet è un sito web che invia QOR di testnet gratuiti a un indirizzo.

Se vuoi anche guardare il tuo account nel wallet QoreX, usa **QoreX sulla testnet** con un account usa e getta:

- **App QoreX:** apri Impostazioni e attiva **Use testnet (developers)**.
- **Estensione del browser QoreX:** sbloccala, tocca 7 volte il numero di versione in basso, poi scegli **Switch to testnet (diana)**.

Per questa app non serve alcun account Ethereum. Usa il tipo di account QoreChain Native (un indirizzo `qor1...`).

**Faucet:** https://dashboard.qorechain.io/faucet. Accedi, incolla il tuo indirizzo e fai la richiesta. Il faucet eroga **100 QOR ogni 24 ore per account**.

**Da sapere:** la primissima transazione di un nuovo account registra on chain la sua chiave post-quantistica ML-DSA-87. È una commissione una tantum di circa 0,09 QOR. qday-pay lo fa nel passaggio 8.

**Importi:** l'unità che leggi è il **QOR**. La catena conta in **uqor**, l'unità più piccola. 1 QOR = 1.000.000 uqor. Scrivi gli importi in QOR (per esempio `1`) e il programma li converte per te.

### 3. Scarica il codice {#get-the-code-step}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/04-rust-qday-pay
```

**Cosa fa**

| Parte | Significato |
| --- | --- |
| `git clone <indirizzo>` | Scarica da GitHub una copia completa delle app di esempio in una nuova cartella chiamata `build-before-qday`. |
| `cd <cartella>` | Sposta il terminale nella cartella dell'app Rust. Tutti i comandi successivi si eseguono da qui. |

**Cosa dovresti vedere:** `Cloning into 'build-before-qday'...` e poi il prompt nella cartella `04-rust-qday-pay`. Esegui `ls` per controllare: vedi `Cargo.toml`, `Cargo.lock`, `README.md` e `src`.

### 4. Compila il programma {#build}

```bash
cargo build --release
```

**Cosa fa:** `cargo` è lo strumento di compilazione di Rust. Questo comando scarica le librerie elencate in `Cargo.toml` e compila il programma in un unico file.

| Parte | Significato |
| --- | --- |
| `build` | Compila il programma (non lo esegue ancora). |
| `--release` | Crea la versione veloce e ottimizzata. Senza questa opzione ottieni una versione di debug più lenta, in un'altra cartella. |

**Quanto ci vuole:** da 2 a 5 minuti la prima volta, pochi secondi le volte successive.

**Cosa dovresti vedere:** molte righe `Compiling ...`, poi `Finished release profile [optimized] target(s)`. Il programma ora è il file `./target/release/qday-pay`.

Controlla che parta:

```bash
./target/release/qday-pay
```

**Cosa fa:** esegue il programma senza alcun comando. Stampa la sua guida e non cambia nulla.

**Cosa dovresti vedere:**

```text
qday-pay: hybrid post-quantum payments on QoreChain testnet

  qday-pay new
  qday-pay status
  qday-pay register
  qday-pay send <qor1to> <amount_qor> [--memo text]
  qday-pay verify <tx_hash>
```

Le cinque righe sono i cinque comandi che userai qui sotto. Nel resto di questa pagina, `<command>` significa `./target/release/qday-pay <command>`.

### 5. Crea un account di testnet usa e getta {#new-account}

```bash
./target/release/qday-pay new
```

**Cosa fa:** crea un nuovissimo account di testnet. Genera una frase di recupero segreta (la mnemonica) e la salva in un **file della chiave**. Da quell'unica frase deriva entrambe le tue chiavi, la chiave classica secp256k1 e la chiave post-quantistica ML-DSA-87. La frase non viene mai stampata a schermo.

| Parte | Significato |
| --- | --- |
| `new` | Il comando: crea un account e un file della chiave. Si rifiuta di sovrascrivere un file della chiave già esistente, così non può distruggere per errore un account con fondi. |

**Dove si trova il file della chiave:** `~/.config/qday/rust.env`. La `~` è la tua cartella home. Il file è leggibile solo da te (modalità 0600). Puoi usare un altro percorso impostando `QDAY_KEY_FILE`, per esempio `QDAY_KEY_FILE=$HOME/my-test-key.env ./target/release/qday-pay new`. In quel caso, imposta la stessa variabile davanti a ogni comando successivo.

:::warning Tieni privato il file della chiave
Il file della chiave è la chiave dell'account. Non condividerlo mai, non incollarlo mai in una chat o in uno screenshot e non farne mai il commit su Git. Usa questo account solo per il workshop e mai sulla mainnet. Quando hai finito, elimina il file.
:::

**Cosa dovresti vedere:**

```text
  New testnet account (mnemonic saved, not shown)

  address      qor1...
  key file     /home/you/.config/qday/rust.env (0600)

  Next: fund it with testnet QOR, then `qday-pay status`.
```

Copia l'indirizzo `qor1...`.

### 6. Finanzia l'account dal faucet {#faucet}

1. Apri https://dashboard.qorechain.io/faucet e accedi.
2. Incolla il tuo indirizzo `qor1...` e fai la richiesta. Ricevi 100 QOR.
3. Aspetta circa 10 secondi il blocco che contiene il pagamento.

L'account deve esistere on chain prima che tu possa registrare una chiave, ed è il pagamento del faucet a crearlo.

### 7. Controlla l'account {#status}

```bash
./target/release/qday-pay status
```

**Cosa fa:** legge il tuo account dalla testnet e stampa un riepilogo. Non invia nulla.

**Cosa dovresti vedere:**

```text
  network      qorechain-diana (testnet)
  address      qor1...
  balance      100 QOR
  ML-DSA-87    NOT registered (run `qday-pay register`)
  block        123456
```

| Riga | Significato |
| --- | --- |
| `network` | La catena con cui parla il programma. Funziona solo sulla testnet `qorechain-diana` e rifiuta qualsiasi altra rete. |
| `balance` | Il tuo QOR spendibile. |
| `ML-DSA-87` | Se la tua chiave post-quantistica è registrata on chain. |
| `block` | L'altezza dell'ultimo blocco. Continua a crescere. |

### 8. Registra la chiave post-quantistica {#register}

```bash
./target/release/qday-pay register
```

**Cosa fa:** invia una transazione che comunica alla catena la tua chiave pubblica ML-DSA-87, insieme a una **prova di possesso** (una prova che possiedi davvero la chiave segreta corrispondente). La catena memorizza la chiave e da quel momento può controllare le tue firme post-quantistiche. Costa una commissione una tantum di circa 0,09 QOR. Puoi rieseguirlo senza rischi: se la chiave è già registrata, non fa nulla.

| Parte | Significato |
| --- | --- |
| `register` | Il comando: registra una volta la tua chiave ML-DSA-87. |

**Cosa dovresti vedere:**

```text
  ML-DSA-87    registered (MsgRegisterPQCKeyV2 + proof of possession)
  tx           <64-character transaction hash>
  block        123460
  gas          ... used / ... wanted
  address      qor1...
```

### 9. Invia un pagamento firmato in modo ibrido {#send}

Sostituisci `qor1...` con un indirizzo di testnet. Puoi pagare il tuo stesso indirizzo, oppure l'indirizzo di testnet di un amico.

```bash
./target/release/qday-pay send qor1... 1 --memo "Build Before Q-Day Workshop 1 (Rust)"
```

**Cosa fa:** costruisce un pagamento, lo firma due volte (secp256k1 e ML-DSA-87), controlla il costo in gas, lo invia, aspetta che sia in un blocco e poi esegue per te la verifica del passaggio 10.

| Parte | Significato |
| --- | --- |
| `send` | Il comando: paga QOR a un altro indirizzo. |
| `qor1...` (primo valore) | Il destinatario. Deve essere un indirizzo `qor1`, altrimenti il programma si ferma con `not a qor1 address`. |
| `1` (secondo valore) | L'importo in QOR. `1` significa 1 QOR, cioè 1.000.000 uqor. Puoi usare decimali come `0.5`. |
| `--memo "testo"` | Facoltativo. Un memo è un breve testo allegato alla transazione e salvato on chain. Mettilo tra virgolette se contiene spazi. Chiunque può leggerlo, quindi non scrivere nulla di privato. |

L'opzione `--memo` va dopo il destinatario e l'importo, come nell'esempio.

**Cosa dovresti vedere:**

```text
  sending      1 QOR -> qor1...
  fee          ... uqor (gas ...)
  included     block 123465

  tx           <64-character transaction hash>
  block        123465
  memo         Build Before Q-Day Workshop 1 (Rust)
  classical    secp256k1   64 bytes
  quantum      ML-DSA-87   4627 bytes

  VERIFIED: secp256k1 + ML-DSA-87
```

La `fee` è mostrata in uqor ed è molto inferiore a 1 QOR. Il programma stampa anche un link `explorer` e una riga `chain says` (passaggio 10). Copia l'hash della transazione.

### 10. Verifica qualsiasi transazione {#verify}

```bash
./target/release/qday-pay verify <TX_HASH>
```

**Cosa fa:** legge la transazione dalla catena e controlla tre cose, senza inviare nulla.

| Parte | Significato |
| --- | --- |
| `verify` | Il comando: stampa il rapporto di verifica. |
| `<TX_HASH>` | L'hash di 64 caratteri della transazione. Incolla l'hash del passaggio 9. Funziona per qualsiasi transazione di testnet. |

I controlli:

1. La transazione è riuscita (codice di risultato 0).
2. La catena ha emesso l'evento `pqc_hybrid_verify` con `status=verified`. È la catena che dichiara di aver controllato la firma post-quantistica.
3. La transazione contiene un'estensione `PQCHybridSignature` con una firma ML-DSA-87 di 4.627 byte, accanto alla firma secp256k1 di 64 byte.

**Cosa dovresti vedere:** lo stesso rapporto del passaggio 9, che termina con `VERIFIED: secp256k1 + ML-DSA-87`. Se un controllo fallisce, il rapporto dice `NOT VERIFIED as hybrid` e il programma esce con codice 2.

### 11. Verificalo in un secondo modo, senza il nostro programma {#verify-curl}

Puoi chiedere direttamente alla catena. Ti serve solo `curl`, incluso in macOS e nella maggior parte dei sistemi Linux. Lo strumento `jq` (facoltativo) rende la risposta più leggibile. Installalo con `brew install jq` su macOS o `sudo apt install -y jq` su Linux.

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.code, .tx.body.extension_options[0]["@type"], (.tx.body.extension_options[0].pqc_signature | length)'
```

| Parte | Significato |
| --- | --- |
| `curl -s <indirizzo>` | Scarica la risposta dal servizio REST della testnet. `-s` nasconde la barra di avanzamento. |
| `<HASH>` | L'hash della tua transazione. |
| `\| jq '...'` | Estrae tre valori. Senza `jq`, togli questa parte e leggi il testo completo. |

**Cosa dovresti vedere:**

- `"code": 0` nella risposta (la transazione è riuscita). Nell'output di `jq` la prima riga è `0`.
- Un'estensione `PQCHybridSignature` (tipo `/qorechain.pqc.v1.PQCHybridSignature`) che contiene la firma ML-DSA-87. Il testo base64 è lungo 6.172 caratteri, cioè 4.627 byte.
- In `tx_response.events`, un evento di tipo `pqc_hybrid_verify` con l'attributo `status` impostato su `verified`.

**Nell'explorer:** apri https://explore.qore.network, passa a **Testnet** e cerca l'hash della tua transazione. Il programma stampa anche un link diretto.

### 12. Pulizia {#cleanup}

Quando hai finito, elimina il file della chiave usa e getta:

```bash
rm ~/.config/qday/rust.env
```

`rm` elimina un file. Eseguilo solo per una chiave di testnet che non ti serve più.

## Risoluzione dei problemi {#troubleshooting}

| Cosa vedi | Perché | Cosa fare |
| --- | --- | --- |
| `command not found: cargo` o `rustc` | Rust non è installato, oppure il terminale è stato aperto prima dell'installazione. | Installa Rust (passaggio 1), poi chiudi e riapri il terminale. |
| `linker 'cc' not found` o `linking with cc failed` | Manca il compilatore C. | macOS: `xcode-select --install`. Ubuntu: `sudo apt install -y build-essential`. |
| `cannot read ... run qday-pay new first` | Non c'è un file della chiave in quel posto. | Esegui `./target/release/qday-pay new`, oppure imposta lo stesso `QDAY_KEY_FILE` di prima. |
| `cannot create ... it may already exist` | Esiste già un file della chiave. Il programma non ne sovrascrive mai uno. | Continua a usarlo, oppure eliminalo con `rm` se non contiene nulla che ti serve, poi esegui di nuovo `new`. |
| `account qor1... not found on chain yet; fund it first` | L'account non ha ancora QOR, quindi non esiste on chain. | Richiedi QOR dal faucet (passaggio 6), aspetta circa 10 secondi, riprova. |
| Il faucet dice che hai raggiunto il limite di richieste | Il faucet concede una richiesta ogni 24 ore per account. | Aspetta 24 ore, oppure usa un secondo account usa e getta. |
| `account has no PQC key and classical fallback is disabled` | Hai inviato un pagamento prima di registrare la chiave post-quantistica. | Esegui `./target/release/qday-pay register`, poi invia di nuovo. |
| `not a qor1 address` | Il destinatario è sbagliato, per esempio un indirizzo `0x...`. | Usa un indirizzo `qor1...`. |
| `transport error` o `error sending request` | Non c'è internet, oppure la testnet è brevemente irraggiungibile. | Controlla la connessione e riprova tra un minuto. |
| `NOT VERIFIED as hybrid` | La transazione è fallita oppure non era firmata in modo ibrido. | Leggi il `code` nel rapporto. Invia un nuovo pagamento con questo programma. |
| `pnpm: command not found` | Hai provato un'app JavaScript. Questa app Rust non ha bisogno di pnpm. | Ignoralo qui. Per le app JavaScript, esegui `npm install -g pnpm`. |
| `EVM authorisation window exhausted` | Riguarda l'app Hardhat, non questa. | In quell'app, apri una nuova finestra con `pnpm window open`. |
| Errori CORS | Riguardano le app del browser. Questa app da riga di comando non li ha. | In un'app del browser, usa il proxy `/lcd` del template. |

## L'account {#account}

L'account è un account QoreChain Native secp256k1 (coin type 118, percorso `m/44'/118'/0'/0/0`, un indirizzo `qor1...`). La chiave ML-DSA-87 deriva dalla stessa frase di recupero tramite la regola canonica legata all'indirizzo dell'SDK (`authenticator::try_derive_pqc_canonical`). Una sola frase di recupero ripristina entrambe le chiavi.

## Il codice dell'SDK che conta {#code}

Questo è il cuore del comando `send` in `src/main.rs`:

```rust
let send = bank_send_any(w.address(), to, vec![coin(&uqor)]);           // MsgSend
let draft = build_hybrid_tx(params.clone())?;                           // secp256k1 + ML-DSA-87
params.fee = estimate_fee(rest, &draft.tx_raw_bytes, 1.3, "0.15uqor").await?; // simulate, gas x 1.3
let tx = build_hybrid_tx(params)?;                                      // sign for real
let res = broadcast_and_wait(rest, &tx.tx_raw_bytes, WaitOptions::default()).await?;
```

La registrazione è una sola chiamata: `PqcDx::ensure_pqc_registered()`. Invia `MsgRegisterPQCKeyV2` con una prova di possesso solo quando non è ancora registrata alcuna chiave.

## Come si decide "verificato" {#verified}

`verify` legge `GET /cosmos/tx/v1beta1/txs/{hash}` e controlla:

- che la transazione sia riuscita (`code 0`);
- che la catena abbia emesso `pqc_hybrid_verify` con `status=verified` per il firmatario;
- che il corpo contenga un'estensione `/qorechain.pqc.v1.PQCHybridSignature` con una firma ML-DSA-87 di 4.627 byte (accanto alla firma secp256k1 di 64 byte).

## Cosa dovresti vedere {#output}

- `new` stampa un indirizzo `qor1...` e la posizione del file della chiave, mai la frase di recupero.
- `status` mostra il saldo e se la chiave ML-DSA-87 è registrata.
- `send` termina con `VERIFIED: secp256k1 + ML-DSA-87` e un link all'explorer.
- Su https://explore.qore.network (passato a Testnet) la transazione compare sotto il suo hash.

## Endpoint di rete {#access}

| | |
| --- | --- |
| Cosmos chain id | `qorechain-diana` (solo testnet) |
| REST | `https://api-testnet.qore.host` |
| Faucet | https://dashboard.qorechain.io/faucet |
| Explorer | https://explore.qore.network (passa a Testnet) |

## Pacchetti usati {#packages}

| Crate | Versione | Usato per |
| --- | --- | --- |
| `qorechain-sdk` | 0.13 | Account, firma ibrida, client REST, funzioni di verifica |
| `tokio` | 1 | Runtime asincrono |
| `serde_json` | 1 | Lettura delle risposte JSON della catena |
| `base64` | 0.22 | Misurazione delle dimensioni delle firme |
| `cosmrs` | 0.22 | Il tipo di messaggio `Coin` |

## Codice sorgente {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/04-rust-qday-pay
