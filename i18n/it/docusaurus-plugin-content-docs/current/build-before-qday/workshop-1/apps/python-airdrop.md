---
slug: /build-before-qday/workshop-1/apps/python-airdrop
title: App Python, Q-Day Airdrop
sidebar_label: Python, Airdrop
sidebar_position: 6
---

# App Python: Q-Day Airdrop

Il **Q-Day Airdrop** è un piccolo strumento Python che invia QOR di testnet a un'intera lista di indirizzi in **una sola** transazione. La transazione è firmata con una chiave classica secp256k1 e una chiave post-quantistica ML-DSA-87 (FIPS 204). Lo strumento poi dimostra, dal registro della catena stessa, che entrambe le firme sono state verificate. Gira sulla testnet di QoreChain (`qorechain-diana`, EVM chain ID 9800).

**Quanto ci vuole:** circa 20 minuti la prima volta (10 minuti per installare gli strumenti, 5 di configurazione, 5 per inviare e controllare).

Non serve conoscere Python. Basta digitare i comandi qui sotto, uno alla volta, e confrontare il risultato con "Cosa dovresti vedere".

## Cosa mostra {#what-it-shows}

- **Firma ibrida ML-DSA-87 + secp256k1** da Python.
- **Una transazione firmata in modo ibrido e verificata on chain**, che paga molti destinatari in un colpo solo con un unico messaggio multi-invio.
- **Un rapporto di verifica** costruito dal registro della transazione della catena, non dalla parola dello strumento.

Perché è importante: una sola firma protegge un intero airdrop, e resta protetta contro un futuro computer quantistico perché la metà ML-DSA-87 è post-quantistica. Vedi [Transazioni a prova di quantistico](/sdk/guides/quantum-safe).

:::warning Solo testnet
Usa solo un account di testnet usa e getta. Il QOR di testnet non ha alcun valore. Non usare mai in questo tutorial il tuo wallet reale, la tua vera frase di recupero o fondi reali.
:::

## Parole che incontrerai {#words}

| Parola | Significato |
| --- | --- |
| Testnet | Una copia di prova di QoreChain. Le monete al suo interno sono gratuite e non valgono nulla. |
| QOR e uqor | Due nomi per la stessa moneta. 1 QOR = 1.000.000 uqor. Lo strumento chiede QOR. Le commissioni sono mostrate in uqor. |
| Memo | Un breve testo allegato a una transazione, come la causale di un bonifico. |
| Indirizzo | Il tuo numero di conto pubblico. Su QoreChain inizia con `qor1`. Si può condividere senza problemi. |
| File della chiave | Un file con la tua frase di recupero segreta. Non condividerlo mai. |
| Faucet | Un sito web che regala QOR di testnet gratuiti. |
| Hash | L'ID univoco di una transazione. Serve per cercare la transazione. |

## Prima di iniziare {#before}

Servono **Git** (scarica il codice) e **Python 3.10 o successivo** con `venv` (una cartella privata per le librerie dello strumento). Dopo ogni installazione, **chiudi il terminale e aprine uno nuovo**, poi esegui il comando di verifica.

| Strumento | macOS | Windows | Linux (Debian o Ubuntu) | Verifica |
| --- | --- | --- | --- | --- |
| Git | `brew install git` (Homebrew da https://brew.sh) | https://git-scm.com/download/win | `sudo apt install git` | `git --version` |
| Python 3.10+ | `brew install python` | https://www.python.org/downloads/ (spunta "Add python.exe to PATH" nell'installer) | `sudo apt install python3 python3-venv python3-pip` | `python3 --version` (su Windows: `python --version`) |

Su Windows usa PowerShell oppure Git Bash. Dove questa pagina dice `python3`, Windows di solito usa `python`. Tutto il resto è uguale, tranne la riga che attiva l'ambiente virtuale (passaggio 3).

## Ottieni un wallet di testnet e QOR gratuiti {#wallet}

Lo strumento crea da solo la propria chiave usa e getta (passaggio 4 qui sotto), quindi per questo tutorial non ti serve un'app wallet. Se vuoi anche vedere il tuo account in QoreX:

1. **App QoreX:** apri Impostazioni, poi attiva **Use testnet (developers)**.
2. **Estensione del browser QoreX:** sbloccala, tocca 7 volte il numero di versione in basso, poi scegli **Switch to testnet (diana)**.

I QOR gratuiti arrivano dal faucet su https://dashboard.qorechain.io/faucet. Accedi, incolla l'indirizzo e fai la richiesta. Eroga **100 QOR ogni 24 ore per account**.

La primissima transazione di un nuovo account registra sulla catena la sua chiave post-quantistica ML-DSA-87. È un passaggio una tantum con una commissione di circa 0,09 QOR. Lo strumento lo fa per te con il comando `register`.

## Passo dopo passo {#run}

### 1. Scarica il codice {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/06-python-airdrop
```

**Cosa fa**

- `git clone <indirizzo>`: copia il progetto da GitHub in una nuova cartella chiamata `build-before-qday`.
- `cd <cartella>`: sposta il terminale nella cartella dell'app Python. Ogni comando successivo deve essere eseguito da questa cartella.

**Cosa dovresti vedere:** righe come `Cloning into 'build-before-qday'...` e poi il prompt nella nuova cartella.

### 2. Crea un ambiente Python privato {#venv}

```bash
python3 -m venv .venv
```

**Cosa fa:** crea una cartella chiamata `.venv` che contiene le librerie di questo strumento, così non si mescolano con nient'altro sul tuo computer.

| Parte | Significato |
| --- | --- |
| `python3` | Il programma Python. |
| `-m venv` | Esegue il creatore di "ambienti virtuali" integrato in Python. |
| `.venv` | Il nome della cartella da creare. |

**Cosa dovresti vedere:** nessun output stampato e una nuova cartella `.venv`.

### 3. Attivalo e installa le librerie {#deps}

```bash
source .venv/bin/activate
```

Su PowerShell di Windows usa invece `.venv\Scripts\activate` (se PowerShell lo blocca, esegui `Set-ExecutionPolicy -Scope Process RemoteSigned` e riprova). Nel Prompt dei comandi di Windows usa `.venv\Scripts\activate.bat`.

**Cosa fa:** fa usare al tuo terminale l'ambiente privato.

**Cosa dovresti vedere:** `(.venv)` all'inizio del prompt. Riattivalo con questo stesso comando in ogni nuovo terminale.

```bash
pip install -r requirements.txt
```

| Parte | Significato |
| --- | --- |
| `pip` | L'installatore di librerie di Python. |
| `install` | Scarica e installa librerie. |
| `-r requirements.txt` | Legge l'elenco delle librerie da questo file. Nomina una libreria, `qorechain-sdk==0.13.0` (l'SDK di QoreChain, versione esatta 0.13.0), più ciò di cui ha bisogno. |

**Cosa dovresti vedere:** righe di download che terminano con `Successfully installed ... qorechain-sdk-0.13.0`. Un avviso che è disponibile un nuovo pip è innocuo.

**Quanto ci vuole:** da circa 15 secondi a 1 minuto.

Ora controlla che lo strumento parta:

```bash
python airdrop.py --help
```

**Cosa dovresti vedere:** i comandi `new`, `status`, `register`, `drop` e `verify`.

### 4. Crea il tuo account di testnet usa e getta {#key}

```bash
python airdrop.py new
```

**Cosa fa:** crea un account nuovo. Scrive una frase di recupero segreta nel file della chiave `~/.config/qday/python.env` (nella tua cartella home, leggibile solo da te) e stampa solo l'indirizzo pubblico.

| Parte | Significato |
| --- | --- |
| `new` | Crea un nuovo file della chiave e stampa il suo indirizzo. |
| `new --force` | Sostituisce un file della chiave esistente. La vecchia chiave è persa. |

**Cosa dovresti vedere:** `New testnet wallet`, un `address` che inizia con `qor1...`, il percorso del file della chiave con `(mode 600, mnemonic not shown)` e un suggerimento per il passaggio successivo.

**Copia l'indirizzo `qor1...`.** Se lo perdi, `python airdrop.py status` lo stampa di nuovo. Non condividere mai il file della chiave, non farne mai il commit su Git e non riutilizzarlo mai sulla mainnet.

Per tenere la chiave altrove, metti `--key-file` **prima** del nome del comando:

```bash
python airdrop.py --key-file ~/my.env status
```

`--key-file <percorso>` significa "usa questo file della chiave invece di quello predefinito". L'ordine conta: `--key-file` va prima di `status`, `drop` e degli altri comandi. In alternativa puoi impostare la variabile d'ambiente `QORE_KEY_FILE`.

### 5. Ottieni QOR di testnet dal faucet {#faucet}

1. Apri https://dashboard.qorechain.io/faucet e accedi.
2. Incolla il tuo indirizzo `qor1...` e premi il pulsante di richiesta.
3. Aspetta qualche secondo, poi esegui:

```bash
python airdrop.py status
```

**Cosa fa:** chiede alla testnet il tuo saldo e se la tua chiave post-quantistica è registrata.

**Cosa dovresti vedere:** il tuo saldo (circa 100 QOR) e un avviso che la chiave ML-DSA-87 non è ancora registrata. Se dice che l'indirizzo "is not on chain yet", il pagamento del faucet non è ancora arrivato: aspetta 10 secondi e riprova.

### 6. Registra la tua chiave post-quantistica {#register}

```bash
python airdrop.py register
```

**Cosa fa:** registra sulla catena la tua chiave ML-DSA-87, una sola volta. Si può rieseguire senza rischi. Questa prima transazione è firmata in modo classico, perché una chiave non può cofirmare la propria registrazione. Costa circa 0,09 QOR. Ogni transazione successiva è firmata in modo ibrido.

**Cosa dovresti vedere:** un hash di transazione e una riga `registered` (oppure `already registered` se lo hai eseguito due volte).

**Quanto ci vuole:** qualche secondo (un blocco).

### 7. Scrivi la lista dei destinatari {#list}

Crea due account destinatari usa e getta. Ognuno ha il proprio file della chiave:

```bash
python airdrop.py --key-file ~/.config/qday/r1.env new
python airdrop.py --key-file ~/.config/qday/r2.env new
```

**Cosa fa:** è lo stesso `new` di prima, ma `--key-file` manda ogni chiave nel proprio file, così nulla viene sovrascritto. (Puoi anche usare indirizzi di amici che usano la testnet.)

**Cosa dovresti vedere:** due indirizzi `qor1...` diversi. Copiali entrambi.

Ora crea in questa cartella un file di testo semplice chiamato `addresses.txt`, un indirizzo per riga. Va bene qualsiasi editor di testo (Blocco note su Windows, TextEdit in modalità testo semplice su macOS, `nano addresses.txt` su Linux):

```text
# One qor1 address per line. Blank lines and lines starting with # are ignored.
qor1...first-testnet-address
qor1...second-testnet-address
```

Sostituisci le due righe di esempio con i tuoi indirizzi reali. Le righe vuote, i commenti `#`, i duplicati, il mittente stesso e tutto ciò che non è un indirizzo `qor1...` valido vengono saltati con un avviso. Al massimo 100 destinatari per transazione. La cartella contiene anche `addresses.example.txt`, un esempio con righe segnaposto.

### 8. Invia l'airdrop {#drop}

```bash
python airdrop.py drop addresses.txt 0.1 --memo "Build Before Q-Day"
```

| Parte | Significato |
| --- | --- |
| `drop` | Invia una transazione che paga tutti quelli nella lista. |
| `addresses.txt` | Il file con i destinatari. |
| `0.1` | L'importo in QOR **per ogni destinatario** (0,1 QOR = 100.000 uqor). Due destinatari ricevono 0,2 QOR in totale. |
| `--memo "..."` | Un breve testo allegato alla transazione. Facoltativo. |
| `--yes` (o `-y`) | Facoltativo: salta la domanda "sei sicuro". |

Ordine delle opzioni: prima l'importo e il file, poi `--memo` e `--yes`. `--key-file` è diverso: va prima di `drop`.

**Cosa fa:** mostra un riepilogo (destinatari, importo ciascuno, totale) e ti chiede di confermare. Digita `y` e premi Invio. Poi chiede alla catena quanto gas serve (una prova), aggiunge il 30 per cento come margine di sicurezza, firma con entrambe le chiavi, invia una transazione e stampa il rapporto di verifica.

**Cosa dovresti vedere:** l'hash e l'altezza della transazione, poi un rapporto con: code 0, lo stato `verified` di `pqc_hybrid_verify` del firmatario, una firma ML-DSA-87 di 4.627 byte e un numero di destinatari che corrisponde alla tua lista. Copia l'hash.

**Quanto ci vuole:** circa 10 secondi.

### 9. Verifica qualsiasi transazione {#verify}

```bash
python airdrop.py verify <TX_HASH>
```

**Cosa fa:** legge la transazione dalla catena e stampa da solo il rapporto di verifica. Funziona con qualsiasi hash di transazione, non solo con i tuoi.

**Cosa dovresti vedere:** lo stesso rapporto della fine del passaggio 8.

## Verifica tu stesso la transazione {#check}

Non devi fidarti dello strumento. Chiedi direttamente alla catena.

**Modo 1, nel browser.** Apri `https://explore.qore.network/tx/<HASH>` (al posto di `<HASH>` metti il tuo hash), poi passa l'explorer a **Testnet**. Dovresti vedere una transazione riuscita con ogni destinatario pagato.

**Modo 2, un solo comando:**

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

| Parte | Significato |
| --- | --- |
| `curl` | Uno strumento che scarica un indirizzo web. Incluso in macOS, Windows 10+ e nella maggior parte di Linux. |
| `-s` | Silenzioso: nasconde la barra di avanzamento. |
| l'indirizzo | L'API REST pubblica della testnet. Restituisce il registro completo della transazione in JSON. |

**Cosa dovresti vedere** nel lungo output (aggiungi `| jq .` se hai installato jq, vedi https://jqlang.github.io/jq/download/):

- `"code": 0` significa che la transazione è riuscita.
- Un'estensione `PQCHybridSignature` che contiene una `pqc_signature` di **4.627 byte** (la firma ML-DSA-87), accanto a quella classica di 64 byte.
- Un evento `pqc_hybrid_verify` con `status` impostato su `verified` per il tuo indirizzo.

## Come funziona la prova {#proof}

`verify` legge `GET /cosmos/tx/v1beta1/txs/{hash}` dall'endpoint REST pubblico della testnet e controlla:

- un evento di tipo `pqc_hybrid_verify` per il firmatario con `status=verified`;
- che l'estensione `/qorechain.pqc.v1.PQCHybridSignature` contenga una firma ML-DSA-87 di 4.627 byte;
- che la transazione sia riuscita (code 0), e quanti destinatari ha pagato.

## Risoluzione dei problemi {#troubleshooting}

| Cosa vedi | Perché | Cosa fare |
| --- | --- | --- |
| `python3: command not found` o versione inferiore alla 3.10 | Python manca o è vecchio. | Installa Python 3.10 o successivo, apri un nuovo terminale. Su Windows usa `python`. |
| `No module named venv` o `ensurepip is not available` | La parte venv di Python non è installata (Debian, Ubuntu). | `sudo apt install python3-venv`, poi ripeti il passaggio 2. |
| `ModuleNotFoundError: No module named 'qorsdk'` | L'ambiente non è attivo, oppure l'installazione è stata saltata. | Esegui `source .venv/bin/activate`, poi `pip install -r requirements.txt`. |
| `unrecognized arguments: --key-file` | `--key-file` è stato messo dopo il comando. | Mettilo prima: `python airdrop.py --key-file <path> status`. |
| `no key file at ... Run: python airdrop.py new` | Hai saltato il passaggio 4, oppure è in uso un altro `--key-file`. | Esegui `python airdrop.py new`. |
| `... already exists (use --force to replace it)` | Un file della chiave è già presente. | Tienilo, oppure esegui `python airdrop.py new --force` (la vecchia chiave è persa). |
| `... is readable by others (mode ...)` | I permessi del file della chiave sono troppo aperti. | Esegui `chmod 600 <path>`. |
| `... is not on chain yet (fund it first)` | Non è arrivato alcun QOR dal faucet. | Aspetta 10 secondi, oppure fai la richiesta al faucet. |
| `account has no PQC key and classical fallback is disabled` | La chiave post-quantistica non è ancora registrata. | Esegui prima `python airdrop.py register`. |
| `the ML-DSA-87 key is not registered yet` | Stessa causa, rilevata dallo strumento prima dell'invio. | Esegui `python airdrop.py register`. |
| `balance too low` | L'importo totale più la commissione supera ciò che possiedi. | Invia un importo minore, oppure aspetta la prossima richiesta al faucet. |
| Il faucet dice che hai raggiunto il limite di richieste | Una richiesta ogni 24 ore per account. | Aspetta, oppure usa un altro account usa e getta. |
| `skip line N: not a valid qor1 address` | Una riga di `addresses.txt` non è un indirizzo corretto. | Correggi o elimina quella riga. Le altre righe funzionano comunque. |
| `no valid recipients` | Ogni riga è stata saltata. | Controlla che `addresses.txt` contenga veri indirizzi `qor1...`. |
| `bad amount` | L'importo non è un numero semplice. | Usa QOR come numero, per esempio `0.1`. |
| `refused by the node: code ...` | La catena ha rifiutato la transazione. | Leggi il messaggio. Aspetta un minuto e riprova se la testnet è occupata o in aggiornamento. |
| `transaction not found on the testnet` | Hash sbagliato, oppure il blocco non è ancora finale. | Controlla l'hash e riprova tra qualche secondo. |
| `the testnet may be pausing for an upgrade` | Gli endpoint pubblici limitano le richieste per indirizzo IP, oppure la testnet è in aggiornamento. | Aspetta un minuto ed eseguilo di nuovo. |
| `EVM authorisation window exhausted` | Riguarda le app EVM, non questa. | In un'app EVM, apri una nuova finestra con `pnpm window open`. |
| `HHE10402` dopo l'apertura della finestra | Solo app Hardhat: la finestra non era ancora attiva. | Esegui di nuovo il deploy. |
| Errori `CORS` in un browser | Solo quando una pagina web chiama direttamente la catena. Questo strumento non lo fa. | In un'app del browser, usa il proxy `/lcd` del template. |
| `pnpm: command not found` | pnpm non è installato. Qui non serve. | Solo per il tutorial Hardhat: esegui `npm install -g pnpm`. |

## Il codice dell'SDK che conta {#code}

```python
from qorsdk import (derive_native_account, derive_pqc_canonical, msg, build_hybrid_tx,
                    auto_fee, hybrid_sign_and_broadcast, wait_for_tx,
                    resolve_sign_bytes_version)

account = derive_native_account(mnemonic)                   # classical secp256k1 key
pqc = derive_pqc_canonical(account.address, mnemonic)       # ML-DSA-87 key, same mnemonic

# ONE MsgMultiSend: one input (the sender), one output per recipient.
drop = msg.bank.multi_send(
    inputs=[Input(address=sender, coins=[Coin(denom="uqor", amount=str(each * len(to)))])],
    outputs=[Output(address=a, coins=[Coin(denom="uqor", amount=str(each))]) for a in to])

build = lambda fee, v: build_hybrid_tx(account=account, pqc_keypair=pqc, messages=[drop], fee=fee,
    memo=memo, chain_id="qorechain-diana", account_number=num, sequence=seq, sign_bytes_version=v)

v = resolve_sign_bytes_version("qorechain-diana", rest_url=REST)                 # "v2" on the testnet
fee = auto_fee(REST, build({"amount": [], "gas": "0"}, v), gas_multiplier=1.3)  # simulate
res = hybrid_sign_and_broadcast(lambda v: build(fee, v), chain_id="qorechain-diana", rest_url=REST)
included = wait_for_tx(rest, res["tx_response"]["txhash"])
```

La chiave viene registrata una volta con `ensure_pqc_registered(...)`, che non fa nulla se la stessa chiave è già sulla catena. Il gas non è mai fisso: la vera transazione firmata in modo ibrido viene prima simulata e il limite è il gas simulato moltiplicato per 1,3, con un prezzo di 0,15 uqor per unità di gas.

L'account è coin type 118 (`m/44'/118'/0'/0/0`). La chiave ML-DSA-87 deriva dalla stessa frase di recupero ed è legata all'indirizzo con `derive_pqc_canonical`. Se costruisci una tua app sugli helper basati sul seed, l'SDK 0.13.0 richiede un codice di recupero oppure un segreto PQC indipendente di 32 byte (in Python `unified_account_from_seed(seed32, recovery_code=...)`); vedi [Installazione dell'SDK](/sdk/install#whats-new-0130). Non stampare mai un codice di recupero.

## Pacchetti usati {#packages}

| Elemento | Versione |
| --- | --- |
| `qorechain-sdk` (PyPI, importato come `qorsdk`) | 0.13.0 (fissata in `requirements.txt` come `qorechain-sdk==0.13.0`) |
| Python | 3.10 o successivo |

Lo strumento importa anche i tipi protobuf `Input`, `Output` (da `cosmpy.protos.cosmos.bank.v1beta1.bank_pb2`) e `Coin` (da `cosmpy.protos.cosmos.base.v1beta1.coin_pb2`); arrivano con l'SDK. Vedi [Installazione dell'SDK](/sdk/install) per la tabella delle versioni di tutti i linguaggi.

## Dove cercare le cose {#access}

| Cosa | Dove |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (passa a Testnet) |
| Faucet | https://dashboard.qorechain.io/faucet |
| Codice | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/06-python-airdrop |
