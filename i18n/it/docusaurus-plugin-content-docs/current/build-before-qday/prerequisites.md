---
slug: /build-before-qday/prerequisites
title: "Prima di iniziare: strumenti e wallet testnet"
sidebar_label: "Prima di iniziare"
sidebar_position: 2
---

# Prima di iniziare: strumenti e wallet testnet

Ogni tutorial di questa sezione parte da un computer senza nulla di installato. Questa pagina è l'unico posto in cui prepari tutto. Fallo una volta sola, poi apri il tutorial che preferisci. Ogni tutorial rimanda qui e ripete soltanto i brevi comandi di verifica che gli servono.

**Quanto tempo serve:** circa 20-40 minuti la prima volta, quasi tutto per i download. Installi solo gli strumenti del tutorial che vuoi seguire.

:::caution Solo un account testnet usa e getta
Tutto quello che trovi qui gira sulla **testnet** di QoreChain, dove i QOR non hanno alcun valore. Non usare mai il tuo wallet vero, una vera frase di recupero o fondi reali in nessun tutorial. Creerai un account nuovo apposta per questo esercizio.
:::

## Quali strumenti servono a ciascun tutorial? {#which-tools}

Installa solo le righe che ti servono. Git, un terminale e un browser web servono a tutti.

| Tutorial | Linguaggio | Strumenti da installare | Wallet QoreX |
| --- | --- | --- | --- |
| [Guida del Workshop 1](/build-before-qday/workshop-1) | TypeScript | Node.js, pnpm, curl, jq (facoltativo) | Non serve |
| [Q-Day Counter](/build-before-qday/workshop-1/apps/qday-counter) | TypeScript | Git, Node.js, pnpm | Non serve |
| [Q-Day Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) | TypeScript | Git, Node.js, pnpm | Serve, con un account Ethereum (coin 60) |
| [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) | TypeScript | Git, Node.js, pnpm | Serve |
| [Rust, qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) | Rust | Git, Rust | Non serve |
| [Java, Tip Jar](/build-before-qday/workshop-1/apps/java-tipjar) | Java | Git, Java 21, Maven | Non serve |
| [Python, Airdrop](/build-before-qday/workshop-1/apps/python-airdrop) | Python | Git, Python 3.10 o successivo | Non serve |

## Aprire un terminale {#terminal}

Un terminale è una finestra in cui scrivi comandi. Incollerai al suo interno i comandi di queste pagine, uno alla volta.

| Sistema | Come aprirlo |
| --- | --- |
| macOS | Premi Comando e Spazio, scrivi `Terminal`, premi Invio. |
| Windows | Apri il menu Start, scrivi `PowerShell`, apri **Windows PowerShell**. Per il tutorial Java ti serve anche **Git Bash** (è incluso in Git, vedi sotto) oppure WSL. |
| Linux | Premi Ctrl, Alt e T, oppure cerca `Terminal` tra le applicazioni. |

Dopo aver installato uno strumento, **chiudi il terminale e aprine uno nuovo**. Un terminale rimasto aperto durante l'installazione non vede ancora il nuovo strumento.

## Installare gli strumenti {#install}

Per ogni strumento trovi il comando di installazione o il link per il download, poi il **comando di verifica**. Un comando di verifica chiede allo strumento la sua versione. Se stampa un numero di versione pari o superiore a quello richiesto, lo strumento funziona.

### Gestori di pacchetti (aiuti facoltativi) {#package-managers}

Un gestore di pacchetti installa altri programmi con un solo comando. Puoi anche scaricare ogni strumento a mano dal suo sito. I comandi qui sotto usano l'aiuto adatto al tuo sistema.

| Sistema | Aiuto | Come ottenerlo |
| --- | --- | --- |
| macOS | Homebrew | Incolla questa riga nel terminale, poi segui quello che stampa: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` |
| Windows | winget | Già incluso in Windows 10 e 11. Verifica con `winget --version`. |
| Linux | apt | Già incluso in Ubuntu e Debian. Altri sistemi: usa il tuo gestore di pacchetti (`dnf`, `pacman`). |

### Git {#git}

Git scarica da GitHub il codice degli esempi.

| Sistema | Installazione |
| --- | --- |
| macOS | `xcode-select --install` (si apre una finestra, scegli **Installa**), oppure `brew install git` |
| Windows | `winget install --id Git.Git -e`, oppure scarica da [git-scm.com](https://git-scm.com/download/win) |
| Linux | `sudo apt install -y git` |

Verifica:

```bash
git --version
```

Dovresti vedere una riga come `git version 2.40.0`. Va bene qualsiasi versione.

### Node.js 22.13 o successivo {#node}

Node.js esegue i progetti TypeScript. Hardhat 3, lo strumento per i contratti usato qui, non parte con nessuna versione di Node.js precedente alla 22.13.

| Sistema | Installazione |
| --- | --- |
| macOS | `brew install node`, oppure scarica l'installer LTS da [nodejs.org](https://nodejs.org) |
| Windows | `winget install --id OpenJS.NodeJS.LTS -e`, oppure scarica l'installer LTS da [nodejs.org](https://nodejs.org) |
| Linux (Ubuntu, Debian) | `curl -fsSL https://deb.nodesource.com/setup_22.x \| sudo -E bash -` poi `sudo apt install -y nodejs` |

:::note Linux: non usare il pacchetto apt predefinito
Su Ubuntu e Debian, `sudo apt install nodejs` installa una versione vecchia, troppo bassa. Usa la riga NodeSource qui sopra.
:::

Verifica:

```bash
node -v
```

Dovresti vedere `v22.13.0` o superiore, per esempio `v22.20.0` o `v24.1.0`. Se vedi un numero più basso, reinstalla e apri un nuovo terminale.

### pnpm 9 o successivo {#pnpm}

pnpm installa le librerie di cui un progetto TypeScript ha bisogno. Fa lo stesso lavoro di `npm`, ma più velocemente.

Installalo, su ogni sistema, con lo strumento di installazione di Node.js, `npm`:

```bash
npm install -g pnpm
```

| Parte | Cosa fa |
| --- | --- |
| `npm install` | Scarica e installa un programma. |
| `-g` | Abbreviazione di "global" (globale): lo installa per tutto il computer, non per una sola cartella. |
| `pnpm` | Il programma da installare. |

Su macOS e Linux, se finisce con `EACCES` o "permission denied", eseguilo di nuovo come `sudo npm install -g pnpm`.

:::caution Node.js installato con Homebrew non include pnpm
Se un tutorial dice `pnpm: command not found` (oppure `zsh: command not found: pnpm`), significa che non hai ancora installato pnpm. Esegui `npm install -g pnpm`, apri un nuovo terminale e riprova.
:::

Verifica:

```bash
pnpm -v
```

Dovresti vedere `9.0.0` o superiore, per esempio `10.4.1`.

### curl e jq (solo guida del Workshop 1) {#curl-jq}

`curl` scarica un indirizzo web dal terminale. Lo usi per leggere la tua transazione dall'endpoint REST pubblico. `jq` filtra la risposta lunga in modo che tu veda solo la parte che ti interessa. `jq` è facoltativo.

| Sistema | curl | jq |
| --- | --- | --- |
| macOS | Incluso. | `brew install jq` |
| Windows | Incluso in Windows 10 e 11 come `curl.exe`. | `winget install --id jqlang.jq -e` |
| Linux | `sudo apt install -y curl` se manca | `sudo apt install -y jq` |

Verificali:

```bash
curl --version
jq --version
```

Dovresti vedere una riga di versione per ciascuno, per esempio `jq-1.7`.

:::note Windows PowerShell: scrivi curl.exe
In PowerShell la parola breve `curl` è un altro comando integrato. Scrivi `curl.exe` al posto di `curl` in ogni comando di queste pagine. Se usi Git Bash, funziona `curl` semplice.
:::

### Rust 1.88 o successivo (solo tutorial Rust) {#rust}

Rust compila l'app a riga di comando `qday-pay`. Lo installi con `rustup`, l'installer ufficiale di Rust. Installa anche `cargo`, lo strumento di compilazione di Rust.

| Sistema | Installazione |
| --- | --- |
| macOS | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (premi Invio per accettare il valore predefinito). Gli strumenti del compilatore arrivano con `xcode-select --install`. |
| Windows | Scarica ed esegui `rustup-init.exe` da [rustup.rs](https://rustup.rs), oppure `winget install --id Rustlang.Rustup -e`. Quando chiede i Visual Studio C++ Build Tools, accetta: Rust ne ha bisogno per compilare programmi su Windows. |
| Linux | `sudo apt install -y build-essential curl` poi `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (premi Invio per accettare il valore predefinito) |

Verifica:

```bash
rustc --version
cargo --version
```

Dovresti vedere `rustc 1.88.0` o superiore e una riga di versione di `cargo`. Se hai già Rust, `rustup update` lo porta all'ultima versione.

### Java 21 e Maven (solo tutorial Java) {#java}

L'app Tip Jar richiede un JDK Java 21 o successivo (gli strumenti per compilare ed eseguire Java) e Maven, lo strumento di build che scarica le librerie Java.

| Sistema | Installazione |
| --- | --- |
| macOS | `brew install --cask temurin@21` poi `brew install maven` (oppure usa l'installer da [adoptium.net](https://adoptium.net)) |
| Windows | `winget install --id EclipseAdoptium.Temurin.21.JDK -e`, poi scarica Maven da [maven.apache.org/download.cgi](https://maven.apache.org/download.cgi), decomprimilo e aggiungi la sua cartella `bin` al `PATH`. Strada più semplice: installa WSL (vedi sotto) e segui la riga Linux. |
| Linux | `sudo apt install -y openjdk-21-jdk maven` |

Verificali:

```bash
java -version
mvn -version
```

Dovresti vedere `openjdk version "21` (o un numero più alto, come 25) e `Apache Maven 3.` seguito da una versione. Se `java -version` mostra 17 o meno, installa Java 21 e apri un nuovo terminale.

### Python 3.10 o successivo con venv (solo tutorial Python) {#python}

Python esegue l'app Airdrop. `venv` crea una cartella privata per le sue librerie, così nient'altro sul tuo computer viene toccato.

| Sistema | Installazione |
| --- | --- |
| macOS | `brew install python`, oppure scarica da [python.org](https://www.python.org/downloads/) |
| Windows | `winget install --id Python.Python.3.12 -e`, oppure scarica da [python.org](https://www.python.org/downloads/) e spunta **Add python.exe to PATH** nell'installer |
| Linux | `sudo apt install -y python3 python3-venv python3-pip` |

Verifica:

```bash
python3 --version
```

Dovresti vedere `Python 3.10.0` o superiore. Su Windows scrivi invece `python --version` (il comando è `python`, non `python3`).

### Windows e i comandi Linux: WSL {#wsl}

La maggior parte dei comandi dei tutorial è uguale su ogni sistema. Alcuni usano funzioni della shell Linux: `source`, `chmod`, `./tipjar` e `sleep`. Su Windows hai due scelte:

1. **Windows nativo.** Usa PowerShell per i tutorial TypeScript, Rust e Python. I tutorial indicano la variante per Windows dove differisce, per esempio `.venv\Scripts\activate`. Per il tutorial Java usa **Git Bash** (installato con Git).
2. **WSL.** Il Sottosistema Windows per Linux ti dà un vero Linux dentro Windows. Apri PowerShell come amministratore, esegui il comando qui sotto, riavvia, poi segui le righe **Linux** di questa pagina nella finestra di Ubuntu.

```powershell
wsl --install
```

| Parte | Cosa fa |
| --- | --- |
| `wsl` | Lo strumento Windows Subsystem for Linux. |
| `--install` | Installa WSL e il sistema Linux Ubuntu in un solo passaggio. |

## Verificare tutto in un colpo solo {#check-all}

Esegui i comandi per gli strumenti che hai installato. Ognuno deve stampare una versione.

```bash
git --version
node -v
pnpm -v
rustc --version
java -version
mvn -version
python3 --version
```

| Verifica | Risposta corretta |
| --- | --- |
| `node -v` | `v22.13.0` o superiore |
| `pnpm -v` | `9.0.0` o superiore |
| `rustc --version` | `rustc 1.88.0` o superiore |
| `java -version` | `21` o superiore |
| `mvn -version` | `Apache Maven 3.` e una versione |
| `python3 --version` | `Python 3.10.0` o superiore |

## Ottenere un wallet testnet {#wallet}

Ti serve un posto dove tenere i QOR di prova. Alcuni tutorial creano per te un account usa e getta in un file. Altri usano il wallet **QoreX**, il wallet ufficiale di QoreChain, passato sulla testnet. La tabella in [Quali strumenti servono a ciascun tutorial?](#which-tools) indica quale è quale.

### QoreX sulla testnet {#qorex}

1. Installa QoreX dalla scheda ufficiale: [App Store](https://apps.apple.com/us/app/qorex-wallet/id6791256626) per iPhone, [Google Play](https://play.google.com/store/apps/details?id=network.qore.qorex) per Android, [Chrome Web Store](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) per Chrome, Brave, Edge, Arc e Opera, oppure [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/qorex/). L'elenco completo è nella [panoramica di QoreX](/qorex/overview).
2. Crea un wallet **nuovo** e scrivi la frase di recupero su carta. Non importare una frase che custodisce fondi reali.
3. Passa il wallet sulla testnet:
   - **App per telefono:** apri **Impostazioni**, poi attiva **Use testnet (developers)**.
   - **Estensione del browser:** sbloccala, poi tocca 7 volte il **numero di versione in fondo**. Compare un'opzione per sviluppatori. Scegli **Switch to testnet (diana)**.
4. Controlla che compaia il badge testnet. La testnet si chiama `qorechain-diana`.

**Cosa dovresti vedere:** un badge testnet nel wallet e un indirizzo `qor1...` nella schermata iniziale. I saldi della testnet non mostrano alcun valore in dollari, ed è corretto.

### Aggiungere un account Ethereum (coin 60) {#coin-60}

Il tutorial Guestbook usa la lane EVM, quindi il wallet ha bisogno di un account in stile Ethereum.

1. In QoreX apri l'elenco degli account e scegli **Add an Ethereum account (coin 60)**.
2. Creane uno nuovo. Non ripristinare una frase che custodisce fondi reali.
3. Seleziona quell'account. Mostra un indirizzo `0x...`.

**Cosa dovresti vedere:** un account con l'etichetta *Ethereum, coin 60*, con un indirizzo che inizia con `0x`. Lo stesso account ha anche un indirizzo `qor1...`.

Altro sugli account: [Account e Dashboard di QoreX](/qorex/account-and-dashboard) e [Iniziare con QoreX](/qorex/getting-started).

## Ottenere QOR di prova dal faucet {#faucet}

Il faucet regala QOR di prova a un indirizzo testnet. Un account nuovo deve riceverne un po' prima di poter fare qualsiasi cosa, perché ogni transazione paga una piccola commissione di rete.

1. Apri [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet) nel browser.
2. Accedi alla Dashboard di QoreChain.
3. Incolla il tuo indirizzo `qor1...` nella casella dell'indirizzo.
4. Seleziona **Request Tokens**.
5. Attendi **Tokens Sent!**.

**Cosa dovresti vedere:** la scheda **Tokens Sent!** con 100 QOR e un link **View on Explorer**.

Il faucet eroga **100 QOR una volta ogni 24 ore per account** e per indirizzo. Se chiedi di nuovo troppo presto mostra **Rate Limit Reached**. Aspetta che le 24 ore siano trascorse. Una richiesta basta per tutti i tutorial di questa pagina.

### La tua prima transazione registra la tua chiave post-quantistica {#first-tx}

Ogni account QoreChain ha due chiavi: una chiave classica e una chiave post-quantistica ML-DSA-87. La primissima transazione di un nuovo account **registra on chain la chiave ML-DSA-87**. Succede una sola volta, per account, e costa circa **0,09 QOR**. Da quel momento, ogni transazione viene firmata con entrambe le chiavi.

I tutorial eseguono questo passaggio per te con un comando chiamato `register`. Ora non devi fare nulla. I 100 QOR del faucet lo coprono molte volte.

## QOR e uqor {#units}

Vedrai due nomi per la stessa moneta. **QOR** è la moneta intera. **uqor** è il pezzo più piccolo.

**1 QOR = 1.000.000 uqor.**

| Vedi | Significa |
| --- | --- |
| `1` QOR | 1.000.000 uqor |
| `0.1` QOR | 100.000 uqor |
| `0.09` QOR | 90.000 uqor |
| `0.15uqor` | Un prezzo di 0,15 uqor per ogni unità di gas, usato quando paghi una commissione |

I wallet e la maggior parte dei comandi usano QOR. La catena conta in uqor. Un **memo** è un breve testo che alleghi a una transazione, come `Hello from the workshop`. Chiunque può leggerlo on chain, quindi non scrivere mai un segreto in un memo.

Il **gas** è la misura del lavoro che una transazione chiede alla rete. La commissione è il gas usato moltiplicato per il prezzo del gas. Gli strumenti di questa sezione stimano il gas per te, quindi non devi calcolare nulla.

## Custodire al sicuro le tue chiavi usa e getta {#key-hygiene}

Un tutorial crea un segreto per il tuo account testnet e lo conserva sul tuo computer. Trattalo con cura, anche se i QOR di prova non valgono nulla, così prendi l'abitudine prima della mainnet.

1. **Dove si trova.** Nei tutorial TypeScript i segreti stanno in un file chiamato `.env` nella cartella del progetto. Le app Rust, Java e Python scrivono un file di chiavi con il comando `new`, in una cartella nascosta chiamata `.config/qday` dentro la tua cartella home. Il tutorial indica il file esatto.
2. **Non condividerlo mai.** Non incollarlo in una chat, in un'email, in uno screenshot o in un video. Nascondi il file quando condividi lo schermo.
3. **Non fare mai commit.** Non aggiungere `.env` o un file di chiavi a Git e non farne mai il push su GitHub. Aggiungi `.env` a `.gitignore` se un progetto non lo ignora già.
4. **Solo testnet.** Non riusare mai su mainnet una chiave, una frase di recupero o un codice di recupero della testnet.
5. **Cancellalo quando hai finito.** Quando hai concluso un tutorial, elimina il file di chiavi o `.env`. Puoi sempre creare un nuovo account in un minuto.

:::danger Fondi reali
Non mettere mai la chiave, la mnemonica (frase di recupero) o il codice di recupero di un account che custodisce fondi reali in un file `.env`, in un file di chiavi o in un comando di questa sezione.
:::

## La rete e gli endpoint pubblici {#network}

| Servizio | Valore |
| --- | --- |
| Nome della testnet | `qorechain-diana` |
| EVM chain ID | 9800 |
| REST (leggere dati via web) | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` |
| Explorer | [explore.qore.network](https://explore.qore.network), poi passa a **Testnet** |
| Faucet | [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet) |

## Risoluzione dei problemi {#troubleshooting}

| Cosa vedi | Perché | Cosa fare |
| --- | --- | --- |
| `pnpm: command not found` | pnpm non è installato. Node.js non lo include, nemmeno se installato con Homebrew. | Esegui `npm install -g pnpm`, apri un nuovo terminale ed esegui `pnpm -v`. |
| `node: command not found`, o una versione vecchia dopo l'installazione | Il terminale era aperto durante l'installazione, oppure la versione vecchia ha la precedenza. | Chiudi il terminale, aprine uno nuovo, esegui `node -v`. Su Linux usa la riga NodeSource, non il pacchetto apt predefinito. |
| `ERROR: You are using Node.js ... which is not supported by Hardhat` | Node.js è precedente alla 22.13. | Installa Node.js 22.13 o successivo, poi esegui di nuovo `pnpm install` nel progetto. |
| `EACCES` o permission denied durante `npm install -g pnpm` | Il tuo utente non può scrivere nella cartella globale. | Esegui `sudo npm install -g pnpm` su macOS e Linux. |
| `rustc: command not found` dopo aver installato Rust | Il terminale non conosce ancora il nuovo `PATH`. | Apri un nuovo terminale. Se fallisce ancora, esegui `source "$HOME/.cargo/env"`. |
| `linker 'cc' not found` o `link.exe not found` compilando Rust | Mancano gli strumenti del compilatore C. | macOS: `xcode-select --install`. Linux: `sudo apt install -y build-essential`. Windows: installa i Visual Studio C++ Build Tools. |
| `java -version` mostra 17 o meno | Una versione più vecchia di Java ha la precedenza. | Installa Java 21, apri un nuovo terminale, verifica di nuovo. |
| PowerShell dice che l'esecuzione degli script è disabilitata quando attivi il venv di Python | Windows blocca gli script per impostazione predefinita. | Esegui `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, rispondi `Y`, poi attiva di nuovo. |
| `Rate Limit Reached` sul faucet | Il faucet eroga una volta ogni 24 ore per account e per indirizzo. | Aspetta che le 24 ore siano trascorse. Una richiesta basta per tutti i tutorial. |
| Il wallet non mostra il badge testnet | Il wallet è ancora sulla mainnet. | App per telefono: Impostazioni, poi **Use testnet (developers)**. Estensione: tocca 7 volte il numero di versione, poi **Switch to testnet (diana)**. |
| `account has no PQC key and classical fallback is disabled` | Il nuovo account non ha ancora registrato la sua chiave ML-DSA-87. | Esegui prima il passaggio `register` del tutorial (è la prima transazione dell'account). |
| Errori CORS nella console del browser | L'endpoint REST pubblico non invia header CORS, quindi una pagina web non può chiamarlo direttamente. | Chiama l'endpoint tramite il proxy `/lcd` del progetto, come fa il template. |

## Passo successivo {#next}

Scegli un tutorial dalla [panoramica](/build-before-qday/overview#choose) e seguilo dal primo comando.
