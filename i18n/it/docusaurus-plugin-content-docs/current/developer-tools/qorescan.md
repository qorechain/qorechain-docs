---
slug: /developer-tools/qorescan
title: QoreScan Community
sidebar_label: QoreScan
sidebar_position: 33
---

# QoreScan Community

QoreScan Community è uno strumento a riga di comando che fa l'inventario della crittografia di un deployment QoreChain e scrive il risultato come CBOM (cryptographic bill of materials) CycloneDX 1.6. Legge la home directory di un nodo, lo stato live della rete, gli endpoint TLS e i sorgenti Solidity, e registra ogni algoritmo, protocollo, certificato e chiave che trova, con il file e la riga o l'endpoint in cui è stato trovato.

È pensato per operatori di validator e di nodi, team di compliance e di rischio, revisori che preparano un pacchetto di evidenze e team Solidity che vogliono sapere da quali schemi di firma dipendono i loro contratti. Dal CBOM scrive report in Markdown mappati sulla FINMA Guidance 05/2026, sulla roadmap post-quantistica del NIS Cooperation Group dell'UE e sul RTS DORA sulla gestione del rischio ICT (articolo 6), con uno stato per algoritmo rispetto a FIPS 203, 204 e 205 e a NIST IR 8547.

Versione **0.1.0**, pubblicata il 27 ottobre 2026, Apache-2.0. Legge la mainnet (`qorechain-vladi`) e la testnet (`qorechain-diana`) tramite i loro endpoint REST pubblici, oppure qualsiasi endpoint REST che gli indichi.

QoreScan è uno strumento di supporto all'inventario. Non è una certificazione, un audit né un parere legale, e non stabilisce la conformità a nessuna normativa o standard. Tutto ciò che la scansione non può stabilire resta "To be completed".

## Innovazioni {#innovations}

- **Un CBOM in un formato standard.** Ogni riscontro è un componente `cryptographic-asset` CycloneDX 1.6 con `cryptoProperties` (tipo di asset, primitiva, parameter set, curva, livello di sicurezza classico, categoria di sicurezza quantistica NIST, OID) e `evidence.occurrences` (file e riga, oppure endpoint). I certificati rimandano al proprio algoritmo di firma e alla propria chiave pubblica, i protocolli agli algoritmi che usano, le librerie agli algoritmi che forniscono. Ogni CBOM scritto nei test del progetto viene validato rispetto allo schema JSON ufficiale CycloneDX 1.6, e ogni `bom-ref` usato viene controllato come definito, così l'output si carica in qualsiasi consumer CycloneDX 1.6.
- **Sorgenti consapevoli della chain.** Oltre a file e TLS, legge QoreChain stessa: i parametri PQC, gli interruttori di protocollo legati al PQC, i tipi di chiave di consenso del set di validator attivo e i precompile EVM attivi, e per ogni account che indichi, se ha una chiave PQC registrata, il suo algoritmo, il tipo di chiave (ibrida, solo PQC, solo classica) e la dimensione della chiave pubblica.
- **Lo scambio di chiavi ibrido è visibile.** Un handshake TLS per endpoint registra la versione, la cipher suite, il gruppo di scambio di chiavi (inclusi i gruppi ibridi ML-KEM come `X25519MLKEM768`), ALPN, SNI e ogni certificato inviato dal server.
- **I valori delle chiavi private non vengono mai letti.** I file di chiavi sono decodificati in strutture che non hanno alcun campo per la chiave privata, quindi quei byte non vengono mai decodificati, memorizzati, registrati nei log né scritti. Un test fallisce se quelle strutture acquisiscono un campo che potrebbe contenere dati privati, e un altro test scansiona una home di nodo con chiavi appena generate e verifica che nessuna loro codifica compaia in alcun output.
- **Ogni algoritmo riceve una classificazione e uno stato di transizione.** `post-quantum`, `hybrid`, `quantum-vulnerable` o `symmetric`, con la sua categoria di sicurezza quantistica NIST dove ne è definita una, e il suo stato rispetto a FIPS 203, 204, 205 e alla pianificazione di NIST IR 8547.
- **Output riproducibile.** Il timestamp del CBOM è l'ora corrente, oppure `SOURCE_DATE_EPOCH` quando è impostata. Il numero di serie deriva dal contenuto, quindi lo stesso input nello stesso momento produce lo stesso documento.
- **Wrapper che controllano ciò che eseguono.** I pacchetti npm e PyPI scaricano su richiesta il binario di release per la tua piattaforma e ne confrontano lo SHA-256 con i digest forniti dentro il pacchetto. Rifiutano un binario che non corrisponde, sia dopo il download sia a ogni esecuzione successiva della copia in cache. Nessuno script di installazione viene eseguito con `npm install`.
- **Nessun codice di terze parti nel binario.** Il binario `qorescan` usa la libreria standard di Go per la scansione (il validatore di schema JSON è usato dai suoi test). Non riusa codice dei progetti PQCA CBOMkit; il suo output si carica nel viewer CBOMkit.

## Casi d'uso {#use-cases}

1. **Un team di compliance produce un CBOM per un'autorità di vigilanza.** Un istituto finanziario svizzero che gestisce un nodo QoreChain deve mostrare un inventario dei metodi crittografici nei propri sistemi ICT, tecnologia a registro distribuito inclusa (FINMA Guidance 05/2026, sezione 3.2). Esegue `qorescan scan --node-home ... --network mainnet`, allega il CBOM e `qorescan report --framework finma` alla propria analisi dei rischi e completa a mano le sezioni organizzative.
2. **Un validator che verifica il proprio nodo.** Un operatore vuole confermare quale tipo di chiave di consenso usa il validator, se i file di chiavi sono leggibili da altri utenti, se i listener RPC o EVM JSON-RPC sono esposti senza TLS e se è configurato un signer remoto. `qorescan scan --node-home ~/.qorechain` registra tutto questo senza aprire i valori delle chiavi private.
3. **Controllare gli account prima di farvi affidamento.** Un desk di custodia o un team di integrazione di un exchange vuole sapere se gli indirizzi di tesoreria o di hot wallet hanno una chiave ML-DSA-87 registrata e se è ibrida. `qorescan scan --network mainnet --address qor1... --address qor1...` scrive nel CBOM lo stato della chiave PQC di ciascun account. Vedi il [custody kit](/developer-tools/custody-kit).
4. **Un team Solidity che porta contratti.** Un team che sposta contratti da Ethereum vuole un elenco di ogni punto che dipende da `ecrecover`, `ECDSA` di OpenZeppelin, P-256 o RSA, e di ogni punto che chiama già i precompile PQC di QoreChain. `qorescan solidity ./contracts` elenca ogni uso con file e riga.
5. **Revisione degli endpoint.** Un team di piattaforma vuole sapere se i suoi endpoint pubblici RPC, REST o dell'API del wallet negoziano con i client moderni uno scambio di chiavi post-quantistico ibrido. `qorescan tls api.example.org:443` registra il gruppo negoziato, la cipher suite e la catena di certificati.
6. **Un gate CI su ogni pull request.** Un repository di dApp aggiunge la GitHub Action di QoreScan, così ogni modifica produce un CBOM nuovo e un report DORA o FINMA come artefatti della build, e i revisori possono vedere quando un nuovo schema di firma o un nuovo hash entra nel codice.
7. **Due diligence sui fornitori.** Un'impresa regolamentata invia a un fornitore di servizi l'output di `qorescan template questionnaire`, precompilato con ciò che la scansione degli endpoint di quel fornitore mostra già, così il fornitore risponde solo ai punti rimasti aperti.
8. **Entità UE che si preparano alla roadmap NIS e a DORA.** Un'entità usa `qorescan report --framework nis` e `--framework dora` per mostrare dove il suo inventario alimenta la fase di gestione degli asset crittografici e l'articolo 6 dell'RTS DORA.

## Come funziona {#how-it-works}

### Sorgenti {#sources}

- **Home del nodo** (`--node-home DIR`). Legge `config/config.toml`, `config/app.toml`, `config/genesis.json`, `priv_validator_key.json`, `node_key.json` e tutti i file di certificato che questi nominano. Registra il trasporto P2P e i suoi algoritmi, i certificati TLS di RPC e EVM JSON-RPC, i listener su indirizzi non loopback senza TLS, un signer remoto, i tipi di chiave e le chiavi pubbliche del validator e del nodo, i permessi dei file di chiavi, i parametri del modulo `pqc` in genesis, il registro degli algoritmi on-chain in genesis e i tipi di chiave di consenso dei validator.
- **Rete** (`--network mainnet|testnet` oppure `--rest URL`). Legge via REST gli interruttori di protocollo legati al PQC, i parametri `pqc`, i tipi di chiave di consenso del set di validator attivo e i precompile EVM attivi.
- **Account** (`--address ADDR`, ripetibile). Legge via REST la chiave PQC registrata di ciascun account.
- **TLS** (`--tls HOST:PORT`, ripetibile). Un handshake per endpoint.
- **Solidity** (`--solidity PATH`, ripetibile). Rilevamento testuale di `ecrecover`, delle chiamate ai precompile ecrecover (`0x01`), pqcVerify (`0x0A01`), pqcKeyStatus (`0x0A02`) e P-256 (`0x100`), di `keccak256`, `sha256`, `ripemd160` e degli import delle librerie di firma di OpenZeppelin, Solady e `IQorePQC.sol`. I precompile pqcVerify e pqcKeyStatus sono attivi solo sulla testnet; nessuno è attivo sulla mainnet. Vedi [Precompile EVM](/developer-guide/evm-precompiles).

### Letture di rete {#network-reads}

Ogni richiesta alla rete è una HTTP GET. Le route lette sono la route delle informazioni sul nodo, `/qorechain/pqc/v1/protocol_features`, `/qorechain/pqc/v1/params`, la route dell'ultimo set di validator, `/cosmos/evm/vm/v1/params` e `/qorechain/pqc/v1/account/{address}`. Una route che un nodo non serve diventa una nota nel CBOM, non un errore.

### Classificazione {#classification}

ML-KEM (FIPS 203), ML-DSA (FIPS 204), SLH-DSA (FIPS 205) e LMS/XMSS sono `post-quantum`. Uno scambio di chiavi classico combinato con ML-KEM è `hybrid`. RSA, ECDSA, EdDSA, Diffie-Hellman su campo finito e su curva ellittica e le firme basate su pairing sono `quantum-vulnerable`, con la pianificazione NIST IR 8547 "deprecated after 2030, disallowed after 2035". Cifrari a blocchi, AEAD, hash, XOF e KDF sono `symmetric`. QoreScan applica la pianificazione IR 8547 a ogni curva delle famiglie ECDSA, EdDSA ed ECDH, secp256k1 e X25519 comprese, perché l'esposizione quantistica è la stessa. Queste sono classificazioni di inventario, non dichiarazioni sull'approvazione NIST.

### Output {#output}

QoreScan aggiunge alcune proprietà `qorescan:*` (classificazione, transizione NIST IR 8547, standard, sorgente) e registra nei metadati del CBOM i fatti scansionati, le note e una proprietà di disclaimer. I percorsi delle evidenze sono relativi alla directory scansionata.

Un report contiene la tabella di mappatura del framework, un riepilogo per classificazione, ogni algoritmo con la sua categoria NIST, il suo stato rispetto a FIPS 203, 204, 205 e NIST IR 8547 e le sue evidenze, poi protocolli, certificati, chiavi, librerie, fatti scansionati, note della scansione e fonti citate. Le voci organizzative riportano "To be completed".

### Mappatura dei framework {#frameworks}

| Framework | Fonte | Dove l'inventario serve da input |
|---|---|---|
| `finma` | FINMA Guidance 05/2026 "Quantum computing", 9 luglio 2026, sezione 3 | 3.2 inventario (il CBOM); 3.3 dati critici (scambio di chiavi dei trasporti scansionati, modalità di firma ibrida della corsia Native); 3.4 crypto-agility (registro degli algoritmi, periodo di migrazione, interruttori di protocollo); 3.5 fornitori (emittenti dei certificati, il questionario). 3.1 strategia è organizzativa. |
| `nis` | NIS Cooperation Group, "A Coordinated Implementation Roadmap for the Transition to Post-Quantum Cryptography", Parte 1, v1.1, 11 giugno 2025 | Gestione degli asset crittografici (il CBOM); le tappe del 2030 e del 2035 (l'elenco degli algoritmi quantum-vulnerable); agilità. |
| `dora` | Regolamento delegato (UE) 2024/1774 della Commissione, articolo 6 | 6(2)(a) e (c) registri dei trasporti e listener senza TLS; 6(2)(d) registri delle chiavi (tipi e chiavi pubbliche); 6(3) ogni algoritmo rispetto a FIPS e NIST IR 8547; 6(4) registro, periodo di migrazione, interruttori. 6(1) e 6(5) sono organizzativi. |

## Come usarlo {#how-to-use}

### Installazione {#install}

| Canale | Comando di installazione | Piattaforma minima |
|---|---|---|
| Binario di release | Scarica `qorescan_0.1.0_<os>_<arch>` (oppure il `.tar.gz` o lo `.zip`; i binari Windows terminano con `.exe`) dalla [release GitHub](https://github.com/qorechain/qorescan/releases/tag/v0.1.0) e verificalo con `qorescan_0.1.0_checksums.txt` | macOS, Linux o Windows su amd64 o arm64 |
| Go | `go install github.com/qorechain/qorescan/cmd/qorescan@v0.1.0` | Go 1.26 |
| npm | `npx @qorechain/qorescan scan ...` | Node.js 18 o successivo |
| PyPI | `pipx run qorescan scan ...` (oppure `pip install qorescan`) | Python 3.9 o successivo |
| Docker | `docker build -t qorescan .` dal repository (non è pubblicata alcuna immagine precompilata) | Docker; l'immagine è distroless e gira come utente 65532 |
| GitHub Action | `uses: qorechain/qorescan@<commit sha>` | Runner GitHub-hosted o self-hosted; l'action compila QoreScan dal proprio sorgente con `actions/setup-go` |

Variabili d'ambiente per entrambi i wrapper:

| Variabile | Effetto |
|---|---|
| `QORESCAN_CACHE_DIR` | Dove viene messo in cache il binario (predefinito: la directory di cache dell'utente). |
| `QORESCAN_DOWNLOAD_BASE` | Scarica da un mirror anziché da GitHub. Il controllo del digest continua ad applicarsi. |

### Avvio rapido {#quickstart}

QoreScan invia richieste GET e un handshake TLS per endpoint, non firma nulla e non richiede alcuna chiave. I comandi qui sotto sono stati eseguiti il 27 ottobre 2026 sulla testnet pubblica, con un binario compilato dal sorgente v0.1.0.

**1. Scansiona lo stato della testnet, un account, il TLS dell'endpoint REST pubblico della testnet e una cartella di sorgenti Solidity:**

```bash
qorescan scan --network testnet \
  --address qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08 \
  --tls api-testnet.qore.host:443 \
  --solidity ./contracts \
  --name my-deployment \
  --out cbom.json
```

È terminato con codice 0. Il CBOM ha registrato, tra l'altro, il chain id `qorechain-diana`, la modalità di firma ibrida della corsia Native `required`, la chiave PQC ibrida dell'account (l'account del faucet della testnet), le chiavi di consenso Ed25519 del set di validator, TLS 1.3 con il gruppo ibrido `X25519MLKEM768` e gli algoritmi trovati nei sorgenti Solidity.

Una seconda esecuzione delle sole parti di rete e TLS, fatta mentre si scriveva questa pagina, ha prodotto un CBOM di 21 componenti, tra cui ML-DSA-87, `X25519MLKEM768`, una voce di protocollo TLS 1.3 per `api-testnet.qore.host:443`, la sua catena di certificati e le chiavi Ed25519 del set di validator.

**2. Scrivi un report FINMA dal CBOM:**

```bash
qorescan report --framework finma --cbom cbom.json --out finma.md
```

Il report si apre con il disclaimer, poi la tabella di mappatura (sezioni da 3.1 a 3.5), un riepilogo per classificazione e una riga per algoritmo con il suo stato FIPS e NIST IR 8547 e le sue evidenze. La scansione di un singolo file Solidity che usa `ecrecover` ha prodotto un CBOM CycloneDX 1.6 con un componente (`ECDSA secp256k1`) e la stessa intestazione del report. Un nome di framework sconosciuto termina con codice 2 e un messaggio che elenca `finma`, `nis` e `dora`.

**3. Precompila il questionario per i fornitori e la dichiarazione di agilità:**

```bash
qorescan template questionnaire --cbom cbom.json --out vendor-questionnaire.md
qorescan template agility       --cbom cbom.json --out agility-statement.md
```

**4. Scansiona il tuo nodo.** Basta l'accesso in lettura alla home del nodo:

```bash
qorescan scan --node-home ~/.qorechain --network mainnet --out node-cbom.json
```

Con Docker, monta la home del nodo in sola lettura, così il container non può modificarla:

```bash
docker run --rm -v "$HOME/.qorechain:/scan/home:ro" qorescan scan --node-home /scan/home > cbom.json
```

**5. Tramite i wrapper i comandi sono gli stessi:**

```bash
npx @qorechain/qorescan scan --network mainnet --out cbom.json
pipx run qorescan report --framework dora --cbom cbom.json
```

**6. In GitHub Actions.** Fissa l'action e ogni altra action al commit:

```yaml
permissions:
  contents: read
steps:
  - uses: actions/checkout@<sha>
  - id: qorescan
    uses: qorechain/qorescan@<commit sha>
    with:
      solidity: contracts
      network: mainnet
      addresses: qor1...
      out: qorescan.cbom.json
      framework: finma
  - uses: actions/upload-artifact@<sha>
    with:
      name: cbom
      path: |
        ${{ steps.qorescan.outputs.cbom }}
        ${{ steps.qorescan.outputs.report }}
```

Input dell'action: `node-home`, `network`, `rest`, `addresses`, `tls`, `solidity` (elenchi separati da spazi o da a capo), `out` (predefinito `qorescan.cbom.json`) e `framework`. Output: `cbom` e `report`. L'action compila QoreScan dal proprio sorgente al commit fissato, quindi non viene scaricato alcun binario.

Che cosa è stato eseguito per questa pagina: la scansione della testnet, la scansione Solidity, il report FINMA e l'errore di framework sconosciuto, con un binario compilato dal sorgente v0.1.0. I binari di release, i wrapper npm e PyPI (oltre alla lettura del contenuto dei pacchetti e delle voci di registry), l'immagine Docker e la GitHub Action non sono stati eseguiti.

### Comandi e flag {#commands}

```
qorescan scan [--node-home DIR] [--network mainnet|testnet | --rest URL] [--address ADDR]...
              [--tls HOST:PORT]... [--solidity DIR]... [--out FILE]
qorescan tls HOST:PORT... [--out FILE]
qorescan solidity DIR... [--out FILE]
qorescan report --framework finma|nis|dora --cbom FILE [--out FILE]
qorescan template agility|questionnaire --cbom FILE [--out FILE]
qorescan version
```

I flag possono comparire prima o dopo gli argomenti posizionali. `--out -` (il valore predefinito) scrive sullo standard output. `qorescan <command> -h` stampa i flag di un comando.

| Comando | Flag | Che cosa fa |
|---|---|---|
| `scan` | `--node-home DIR` | Directory home del nodo (quella che contiene `config/`). |
| `scan` | `--network mainnet\|testnet` | Legge lo stato live da `https://api.qore.host` o `https://api-testnet.qore.host`. |
| `scan` | `--rest URL` | Usa invece qualsiasi endpoint REST, per esempio il tuo nodo (`http://127.0.0.1:1317`) o un relay che inoltra le richieste GET. Ha la precedenza su `--network`. |
| `scan` | `--address ADDR` | Account di cui si legge lo stato della chiave PQC. Ripetibile. Richiede `--network` o `--rest`. |
| `scan` | `--tls HOST:PORT` | Endpoint TLS con cui fare l'handshake. Ripetibile. Porta 443 se omessa. |
| `scan` | `--solidity PATH` | Directory o file `.sol`. Ripetibile. |
| `scan`, `solidity` | `--include-deps` | Scansiona anche `node_modules`, `lib`, `out`, `cache`, `artifacts` e `typechain-types`, che per impostazione predefinita vengono saltati. |
| `scan` | `--name NAME` | Nome del deployment scansionato nei metadati del CBOM. |
| `scan` | `--timeout D` | Timeout di rete per richiesta (predefinito `20s`). |
| `tls` | `--servername NAME` | Nome del server SNI (predefinito: l'host). |
| `tls` | `--timeout D` | Timeout dell'handshake (predefinito `15s`). |
| tutte le scansioni | `--verbose` | Registra sullo standard error ogni file letto e ogni richiesta. |
| tutti | `--out FILE` | File di output, `-` per lo standard output. |
| `report` | `--framework finma\|nis\|dora` | Il framework su cui mappare. Obbligatorio. |
| `report`, `template` | `--cbom FILE` | Il CBOM da leggere, `-` per lo standard input. Obbligatorio. |
| `template` | `agility` o `questionnaire` | Quale modello scrivere. |

Altri comandi: `qorescan tls` è una scansione TLS a sé stante, `qorescan solidity` è una scansione Solidity a sé stante, `qorescan template agility` scrive una dichiarazione di crypto-agility precompilata dai fatti scansionati, `qorescan template questionnaire` scrive un questionario per i fornitori di cinque domande che segue le cinque misure della sezione 3 della FINMA Guidance 05/2026, e `qorescan report` accetta anche un CBOM CycloneDX 1.6 scritto da un altro strumento (la classificazione va allora in base al nome dell'algoritmo).

Codici di uscita: `0` successo, `1` un errore di scansione o di I/O, `2` un errore di utilizzo.

## Come accedere {#how-to-access}

| | Mainnet | Testnet |
|---|---|---|
| Chain id | `qorechain-vladi` | `qorechain-diana` |
| REST usato da `--network` | `https://api.qore.host` | `https://api-testnet.qore.host` |

- Non servono chiavi, account né fondi. QoreScan non firma né invia mai una transazione e non scrive nulla tranne il file di output che indichi.
- Alcune route non sono servite da tutti i nodi. Il 27 ottobre 2026 l'endpoint REST pubblico della mainnet non serviva `/qorechain/pqc/v1/params`; la scansione registra allora una nota e continua. Punta `--rest` al tuo nodo per un quadro più completo.
- Il registro degli algoritmi on-chain non è esposto via REST. QoreScan lo legge da `genesis.json` quando viene scansionata una home di nodo.
- La scansione riflette la versione della chain del nodo che legge. Gli interruttori di protocollo e i precompile attivi differiscono tra mainnet e testnet; il CBOM registra ciò che riporta il nodo interrogato.
- Se la tua macchina non raggiunge gli endpoint pubblici, usa `--rest` con un nodo che gestisci tu, oppure con un relay che inoltra le richieste GET.
- Dipendenze: i wrapper npm e PyPI usano soltanto i moduli integrati del loro linguaggio.

## Note di sicurezza {#security}

- **I valori delle chiavi private non vengono mai letti.** Da `priv_validator_key.json` QoreScan prende l'indirizzo, la chiave pubblica e i nomi dei tipi di chiave. Da `node_key.json` prende solo il tipo di chiave; l'ID del nodo non viene derivato, perché richiederebbe la chiave privata. Il buffer grezzo del file viene sovrascritto dopo la decodifica e gli errori di decodifica, che potrebbero citare l'input, non vengono mai restituiti.
- Le directory del keyring (`keyring-*`) e i file di chiavi indicati da `tls_key_file` e `tls.key-path` non vengono aperti. QoreScan registra soltanto che esistono o sono configurati. Gli altri blocchi PEM in un file di certificato vengono saltati senza essere decodificati.
- Ogni richiesta di rete è una HTTP GET. Non viene scritto nulla tranne il file di output.
- I wrapper npm e PyPI verificano lo SHA-256 del binario prima di ogni esecuzione e rifiutano una discordanza, anche quando si usa un mirror. Per la release 0.1.0 i digest dentro il pacchetto npm corrispondono al file di checksum della release.
- L'immagine Docker è distroless e gira come utente non root. Monta la home del nodo con `:ro`.
- Segnala le vulnerabilità in privato a security@qore.network.

## Dove è pubblicato {#where-published}

Le versioni sono state lette da ciascun registry il 27 ottobre 2026.

| Registry | Pacchetto | Versione | Link |
|---|---|---|---|
| Release GitHub | `qorechain/qorescan` | v0.1.0 (pubblicata il 27 ottobre 2026), binari per darwin, linux e windows su amd64 e arm64, più `qorescan_0.1.0_checksums.txt` | https://github.com/qorechain/qorescan/releases/tag/v0.1.0 |
| npm | `@qorechain/qorescan` (comando `qorescan`) | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorescan |
| PyPI | `qorescan` (Python 3.9 o successivo) | 0.1.0 | https://pypi.org/project/qorescan/ |
| Go module proxy | `github.com/qorechain/qorescan` | v0.1.0 | https://pkg.go.dev/github.com/qorechain/qorescan |

Sorgente: https://github.com/qorechain/qorescan (Apache-2.0, copyright 2026 QoreChain Association). Non esiste alcun pacchetto crates.io o Maven né alcuna immagine Docker precompilata; compila l'immagine dal repository. Il repository documenta ogni flag in `docs/usage.md`, che cosa viene letto e che cosa non viene mai letto in `docs/scanned-data.md`, la mappatura dei framework e le sue fonti in `docs/frameworks.md` e i limiti in `docs/limitations.md`.

## Limiti e problemi noti {#limits}

- **Uno strumento di supporto all'inventario.** Non certifica, non fa audit né dà consulenza legale, e i suoi report non stabiliscono la conformità a nessuna normativa o standard. Le misure organizzative (strategia, roadmap, classificazione dei dati, responsabilità) restano "To be completed".
- **Ambito.** QoreScan scansiona solo le sorgenti che gli indichi. Dati archiviati, backup, HSM, sistemi di gestione delle chiavi, configurazione del sistema operativo e delle librerie, wallet, bridge e servizi off-chain sono fuori dalla scansione a meno che tu non aggiunga i loro endpoint TLS con `--tls`. Non scansiona i bridge.
- **Stato live.** Il registro degli algoritmi proviene da `genesis.json` e riflette la rete al genesis, non le successive modifiche di governance. Le chiavi di consenso dei validator sono lette per l'ultimo set di validator.
- **TLS.** Un handshake con le preferenze predefinite del client Go mostra ciò che il server negozia con un client moderno, non ogni versione, suite o gruppo che accetta. Un endpoint dietro un load balancer può rispondere in modo diverso su un'altra connessione.
- **Signer remoti.** Con `priv_validator_laddr` impostato, la chiave del validator si trova altrove e il suo tipo non è visibile dalla home del nodo.
- **Solidity.** Il rilevamento è testuale. Non risolve gli import, non segue l'ereditarietà e non calcola indirizzi a runtime. Un indirizzo di precompile assemblato a runtime sfugge, e una variabile con un nome simile a un pattern può essere segnalata. Le dipendenze vengono saltate a meno che tu non passi `--include-deps`.
- **CBOM di altri strumenti.** I report classificano i CBOM di altri strumenti solo in base al nome dell'algoritmo.
- **Date.** Le categorie NIST e le transizioni di IR 8547 sono prese dai documenti citati allo stato di ottobre 2026. Indicazioni specifiche per applicazione possono fissare date anteriori.
- **Stringa di versione.** Un binario compilato dal sorgente senza flag di versione stampa `qorescan dev`. Usa il binario di release o l'installazione Go della versione con tag quando ti serve la versione registrata.

## Pagine correlate {#related}

- [Firma post-quantistica](/developer-guide/post-quantum-signing): secp256k1 più ML-DSA-87 ibrido sulla corsia Native e la finestra di autorizzazione EVM.
- [Custody kit](/developer-tools/custody-kit): guida all'integrazione e codice di riferimento per custodian ed exchange.
- [QoreSign](/qoresign/overview): librerie di firma e verifica ibride.
- [Eseguire un nodo](/developer-guide/running-a-node) ed [eseguire un validator](/developer-guide/running-a-validator): struttura della home del nodo, signer remoti e file di chiavi.
- [Precompile EVM](/developer-guide/evm-precompiles): i precompile PQC `0x0A01` e `0x0A02`.
- [Libreria post-quantistica (qorechain-pqc)](/developer-tools/pqc-library): ML-DSA-87 in sei linguaggi.
- [Connessione alla mainnet](/getting-started/connecting-to-mainnet) e [connessione alla testnet](/getting-started/connecting-to-testnet): endpoint pubblici.
