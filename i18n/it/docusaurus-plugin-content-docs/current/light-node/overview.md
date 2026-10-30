---
slug: /light-node/overview
title: Panoramica del Light Node
sidebar_label: Panoramica
sidebar_position: 1
---

# Panoramica del Light Node

Il **Light Node QoreChain** è un piccolo client che segue una rete QoreChain senza eseguire un nodo completo e che può registrarsi on-chain come light node per partecipare alla **quota di ricompensa del 3% per i light node**. È pensato per gli operatori che vogliono un modo a basso costo per seguire la chain e guadagnare da quella quota, e per chi desidera semplicemente una seconda opinione sull'hash dell'ultimo blocco della chain senza fidarsi di un singolo server RPC. È un unico binario autonomo in due edizioni costruite dallo stesso codice: **SX** (`lightnode-sx`, un daemon headless con una riga di comando, per i server) e **UX** (`lightnode-ux`, lo stesso daemon più una dashboard web locale su `127.0.0.1:8420`). È rilasciato con licenza Apache 2.0 e il sorgente è pubblico su `github.com/qorechain/qorechain-lightnode`.

Eseguire e sincronizzare un nodo non richiede alcuna licenza. Partecipare alla quota di ricompensa è un passaggio separato: richiede una licenza `lightnode_operator`, stake delegato a validatori bonded e una registrazione on-chain (vedi [Come accedere](#how-to-access)).

Il light node ha una **propria linea di versione**, separata dalla release della chain. Al momento della stesura (27 ottobre 2026) i canali di rilascio di entrambe le reti distribuiscono il light node **3.1.12** (chain `v3.2.5` sulla mainnet, `v3.2.6` sulla testnet). Tratta i due numeri come indipendenti.

## Innovazioni {#innovations}

Ciascuna voce qui sotto è un meccanismo che puoi verificare nel sorgente o eseguendo il nodo.

- **Firma ibrida nativa, nessun altro software.** Il nodo costruisce e firma le proprie transazioni in puro Go (niente CGO, niente librerie native, niente `qorechaind`). Ogni transazione porta una firma ML-DSA-87 (FIPS 204) sul corpo senza l'estensione PQC, più una firma secp256k1 sul SignDoc il cui corpo porta quell'estensione. La versione del formato di firma viene letta dai piani di upgrade applicati dalla chain. Esistono build per Linux, macOS e Windows su amd64 e arm64 (dalla 3.1.8).
- **Un solo insieme di parole di recupero dà entrambe le chiavi.** `keys add-operator --recover` deriva la chiave dell'account al percorso `m/44'/118'/0'/0/0`, lo stesso che usano `qorechaind` e Keplr. Per la chiave post-quantistica o ricostruisce la chiave che un wallet ha già registrato su quell'account a partire dalle stesse parole (le derivazioni del wallet-adapter e della Dashboard, le stesse di `qorechaind tx pqc recover-key`) oppure ne deriva una nuova, così le parole ripristinano anche la chiave del nodo (dalla 3.1.9).
- **La registrazione è un unico comando, verificato passo dopo passo.** `register` controlla la licenza, collega la chiave post-quantistica (con una prova di possesso dove la chain la supporta), delega solo lo stake mancante se passi `--delegate-to`, e poi registra. Ogni passaggio deve trovarsi in un blocco prima che venga inviato il successivo. Lo stake è conteggiato solo sui validatori bonded, come lo conteggia la chain (dalla 3.1.10).
- **Gli heartbeat sono temporizzati sul registro della chain stessa.** Il daemon invia un heartbeat quando sono trascorsi 1,000 blocchi dall'`last_heartbeat` della chain per il nodo, controlla ogni 60 secondi e segnala un heartbeat solo quando è in un blocco. Un riavvio non invia un duplicato né aspetta un intero intervallo.
- **Verifica incrociata degli header tra endpoint.** Il nodo recupera la stessa altezza dal suo endpoint primario e da ogni endpoint witness configurato, e memorizza l'header solo se tutti restituiscono lo stesso hash. Un witness sullo stesso host del primario, o su un indirizzo remoto `http://` in chiaro, viene rifiutato. La modalità è registrata per ogni header a livello debug come `assurance` (`trusted-single-source` o `corroborated-across-sources`). Questa **non** è una verifica del consenso: vedi [Limiti](#limits).
- **Auto-aggiornamento firmato.** Dalla versione 3.1.11 del light node il daemon legge il `latest.json` della sua rete ogni 6 ore. Installa una nuova release solo se `v<version>/SHA256SUMS.sig` si verifica come firma Ed25519 di una chiave di rilascio incorporata nel binario (la firma vincola la rete, la versione e il contenuto di `SHA256SUMS`), se il binario scaricato corrisponde al checksum firmato e se il nuovo binario si avvia e riporta esattamente `v<version>`. Il binario precedente viene conservato come `<name>.old` e il nodo si riavvia sul posto (lo stesso processo su Linux e macOS; su Windows si avvia il nuovo binario e il vecchio termina). `[update] mode` è `auto` (predefinito), `notify` oppure `off`; `lightnode-sx update --check` e `lightnode-sx update` fanno lo stesso a mano. In un container, o dove la cartella del binario non è scrivibile, il nodo si limita ad annunciare una release (riga di log, `GET /api/update` sull'API locale e un banner sulla dashboard UX).
- **Avvisi che corrispondono a ciò che fa la chain.** Con `[delegation] rebalance_enabled` attivo (il valore predefinito) il nodo ti avvisa quando un validatore a cui deleghi è in jail, quando non è nel set attivo e quando il tuo stake bonded scende sotto `min_delegated_stake` (1,000 QOR). In tutti e tre i casi la chain smette di accreditare il nodo senza alcun messaggio. Un avviso viene registrato quando compare, ogni ora finché dura, e una volta quando rientra. Un quarto avviso, il punteggio di reputazione di un validatore delegato inferiore a `min_reputation` (predefinito `0.5`), legge `GET /qorechain/reputation/v1/validator/<valoper>`: è attivo ora sulla **testnet** e arriva sulla mainnet solo con una release di chain successiva (la mainnet esegue la v3.2.5 e non la serve ancora); finché la route non è servita il nodo lo segnala una volta e riprova ogni 6 ore.

### Perché eseguire un light node, e come leggere la verifica incrociata {#why-run-a-light-node}

- **Partecipa alla quota di ricompensa.** I light node registrati e attivi che rispettano le regole di stake e uptime vengono pagati dalla quota del 3% descritta [qui sotto](#the-3-light-node-reward-share).
- **Verifica in modo incrociato lo stato della chain che ti viene mostrato.** Senza alcun witness configurato, il nodo registra un avviso all'avvio e riporta `trusted-single-source`: un singolo endpoint gestito onestamente riporta lo stesso valore di uno compromesso. Aggiungi un witness gestito in modo indipendente per passare a `corroborated-across-sources`, che per essere ingannato richiede che ogni endpoint configurato sia compromesso contemporaneamente. Il valore compare sulle righe `synced header` del log di debug (imposta `log_level = "debug"`); non è mostrato in `status` né sulla dashboard, e nessun servizio centrale può vederlo, perché le tue scelte RPC sono locali alla tua configurazione.
- **Osserva la rete.** La telemetria copre validatori, consenso, bridge e tokenomics, aggiornati con intervalli indipendenti.

## Come si usa {#how-to-use}

Scegli un'edizione. Entrambe leggono lo stesso `config.toml`, memorizzano i dati nella stessa directory home (`~/.qorechain-lightnode`) e usano lo stesso keyring.

| Edizione | Binario | Pensata per | Interfaccia |
| --- | --- | --- | --- |
| **SX** (Server eXperience) | `lightnode-sx` | Server headless, automazione | Daemon più riga di comando completa. Vedi [Edizione SX](/light-node/sx-edition). |
| **UX** (User eXperience) | `lightnode-ux` | Uso desktop e da operatore | Gli stessi comandi più una dashboard web locale. Vedi [Edizione UX](/light-node/ux-edition). |

**1. Scarica e verifica** (mostrato Linux amd64; `jq` serve per leggere il manifest). Prendi la versione dal manifest della rete che ti interessa:

```bash
NET=mainnet            # or testnet
V=$(curl -fsS https://download.qore.host/$NET/lightnode/latest.json | jq -r .version)
F=lightnode-sx-linux-amd64          # see the artifact list in latest.json for other platforms
curl -fsSLO https://download.qore.host/$NET/lightnode/v$V/$F
curl -fsSLO https://download.qore.host/$NET/lightnode/v$V/SHA256SUMS
grep " $F\$" SHA256SUMS | sha256sum -c -        # macOS: shasum -a 256 -c -
chmod +x $F
```

Su Windows, confronta `certutil -hashfile lightnode-sx-windows-amd64.exe SHA256` con il valore del manifest. Il `SHA256SUMS` specifico della versione deve corrispondere al binario specifico della versione, quindi prendili entrambi dal percorso `v$V`.

**2. Configura e registra.** La sequenza qui sotto è quella che mostra la Dashboard; è stata eseguita su una devnet, sulla testnet (prova il 18 ottobre 2026) e per il primo nodo della mainnet (20 ottobre 2026).

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'

./lightnode-sx onboard                  # PQC self-test, chain RPC (see below), node key
./lightnode-sx keys add-operator --recover   # recovery words on standard input; no flag = new account, 24 words shown once
./lightnode-sx register --delegate-to qorvaloper1...   # needs the licence and QOR in the operator account
./lightnode-sx start
./lightnode-sx status
```

L'RPC della chain per `onboard` è `https://rpc.qore.host` (mainnet) oppure `https://rpc-testnet.qore.host` (testnet). Per l'edizione UX usa `lightnode-ux` con gli stessi comandi e apri `http://127.0.0.1:8420`. Dettagli di ogni passaggio: [Edizione SX](/light-node/sx-edition) e [Registrazione e Licenze](/light-node/registration-and-licensing).

**3. Mantienilo aggiornato.** Il light node 3.1.11 e successivi si aggiornano da soli fuori dai container (vedi la voce sull'auto-aggiornamento qui sopra). Un nodo alla 3.1.10 o precedente deve installare a mano la 3.1.12 una volta: scarica il binario versionato come sopra e sostituisci il file. Con Docker, esegui `docker compose pull && docker compose up -d`. Vedi [Edizione SX: aggiornamento](/light-node/sx-edition#updating).

## Come accedere {#how-to-access}

| | Mainnet | Testnet |
| --- | --- | --- |
| Chain | `qorechain-vladi` (chain `v3.2.5`) | `qorechain-diana` (chain `v3.2.6`) |
| RPC per il nodo | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| REST per le query | `https://api.qore.host` | `https://api-testnet.qore.host` |
| Release del light node | 3.1.12 | 3.1.12 |
| Licenza | $50, acquistata sulla Dashboard; la concessione viene firmata a mano in lotti | Gratuita, self-service: **Nodes & Validators > Light Node**, **Request licence**; firmata automaticamente, di solito entro pochi minuti |

**Cosa serve per registrarsi**

- Un account di cui possiedi le parole di recupero (le tue parole, Keplr, o una chiave `qorechaind`), preferibilmente dedicato al nodo. Un wallet custodial della Dashboard non può eseguire un nodo a meno che tu non ne esporti il seed.
- Una licenza `lightnode_operator` attiva su quell'indirizzo (vedi sotto).
- Almeno **1,000 QOR** delegati da quell'indirizzo a validatori **bonded**, conteggiati come totale.
- QOR nell'account per la commissione di registrazione di **1 QOR** e per le commissioni di transazione. Un heartbeat costa 0,25 uqor per gas al limite predefinito di 300,000 gas, cioè 0,075 QOR come tetto (gas usato misurato: circa 165,000).
- Un computer che resti acceso: il nodo deve inviare un heartbeat ogni 1,000 blocchi e mantenere almeno l'80% di uptime per essere pagato.

**Ottenere una licenza.** Sulla Dashboard, apri **Nodes & Validators** (la voce della barra laterale che prima si chiamava **Tools**; la pagina risiede ancora su `/tools`), scegli la scheda **Light Node** e seleziona la rete nell'intestazione. La Dashboard richiede l'accesso.

- *Mainnet:* inserisci prima l'indirizzo `qor1...`, scegli la rete USDT e paga $50. La scheda mostra **Paid, awaiting on-chain grant** finché la chain non conferma la concessione.
- *Testnet:* non si vende nulla. Inserisci il tuo indirizzo `qor1...` sotto **Free testnet licence** e seleziona **Request licence**. C'è una richiesta per account e una per indirizzo. La scheda mostra "Granted to ..." quando la licenza è arrivata, oppure indica che la concessione non ha potuto essere firmata e ti permette di richiederla di nuovo.

Puoi anche verificare una licenza direttamente: `GET /qorechain/license/v1/check/<address>/lightnode_operator`.

### Stato del programma di ricompense {#reward-program-status}

:::note La registrazione è aperta
La registrazione è aperta su mainnet (`qorechain-vladi`, chain v3.2.5) e su testnet (`qorechain-diana`, chain v3.2.6). Il 27 ottobre 2026 sulla mainnet erano state concesse sette licenze `lightnode_operator` e su ciascuna rete era registrato un light node (`total_registered` è `1` in `GET /qorechain/lightnode/v1/stats` su entrambe). La contabilità delle ricompense è live su entrambe le reti dall'upgrade v3.2.0. L'uptime viene conteggiato **a partire dal blocco in cui il tuo nodo è registrato**, quindi far girare un nodo prima non fa guadagnare alcun credito. Dalla chain v3.2.4 anche il limite per nodo parte dalla registrazione del nodo stesso: il primo settlement dopo la registrazione accredita solo quanto si è accumulato da allora.

Il manifest di rilascio (`https://download.qore.host/<net>/lightnode/latest.json`) riporta il segnale ufficiale nel campo `registration.open`. Per lo stato in tempo reale, interroga `GET /qorechain/license/v1/holders/lightnode_operator` e `GET /qorechain/lightnode/v1/stats` su `https://api.qore.host` (mainnet) o `https://api-testnet.qore.host` (testnet).
:::

## La quota di ricompensa del 3% per i light node {#the-3-light-node-reward-share}

La distribuzione delle commissioni di QoreChain assegna una **quota fissa del 3% ai light node** (il parametro `reward_share`, `0.03`). Vedi [Tokenomics](/architecture/tokenomics) per la ripartizione completa 37% / 30% / 20% / 10% / 3% (validatori, bruciato, treasury, staker, light node).

Quel 3% è ciò che viene versato nel module account dei light node; non è un diritto per singolo nodo. Ogni 100 blocchi la chain accredita a ciascun nodo idoneo la sua quota, ponderata per lo stake, di quanto accumulato dal settlement precedente, **con un limite per nodo**. Dalla chain v3.2.3 il limite è di **2,000 QOR per nodo ogni 30 giorni** (`max_reward_per_month_per_node`, `2000000000` uqor), ripartito proporzionalmente sul tempo di blocco trascorso dal settlement precedente e scalato in base all'uptime del nodo; questa è la regola `lightnode-monthly-cap`. Prima della v3.2.3 il limite era espresso per blocco (`max_reward_per_block_per_node`, `1713` uqor), valore che la query del reward pool riporta ancora. Il limite è un tetto, non un importo promesso. Tutto ciò che non viene guadagnato viene spostato in una riserva che solo un voto di governance può sbloccare, così non si accumula alcun montepremi per chi si registra per primo. Puoi ispezionare la suddivisione in tempo reale con `GET /qorechain/lightnode/v1/reward_pool`.

Per essere idoneo alle ricompense un light node deve essere **registrato on-chain, attivo** (dimostrando la propria liveness con gli heartbeat), detenere almeno lo stake minimo bonded e mantenere l'uptime pari o superiore al minimo. La registrazione è trattata in [Registrazione e Licenze](/light-node/registration-and-licensing); come le ricompense vengono accreditate, richieste e monitorate è trattato in [Ricompense e Monitoraggio](/light-node/rewards-and-monitoring).

## Dove è pubblicato {#where-published}

| Cosa | Dove | Versione corrente |
| --- | --- | --- |
| Manifest di rilascio, mainnet | `https://download.qore.host/mainnet/lightnode/latest.json` | 3.1.12 (`minCompatible` 3.1.9, registrazione aperta) |
| Manifest di rilascio, testnet | `https://download.qore.host/testnet/lightnode/latest.json` | 3.1.12 (`minCompatible` 3.1.9, registrazione aperta) |
| Binari | `https://download.qore.host/<net>/lightnode/v<version>/<file>` | 12 file per release (SX e UX, Linux, macOS e Windows, amd64 e arm64) più `SHA256SUMS` |
| Sorgente e release | `github.com/qorechain/qorechain-lightnode` (Apache 2.0) | Release `v3.1.12` (corrente) e tag precedenti; ciascuna contiene i 12 binari, `SHA256SUMS`, `lightnode-build.json` e un APK Android in anteprima |
| Android | Allegato solo alla release GitHub | Anteprima: segue la chain, non si registra, non guadagna |
| Docker | `ghcr.io/qorechain/qorechain-lightnode-sx` e `ghcr.io/qorechain/qorechain-lightnode-ux`, pubbliche, tag `latest` e `v<version>` (vedi [Edizione SX: Docker](/light-node/sx-edition#docker)) | `v3.1.12` |

Controlla la `version` nel manifest della tua rete prima di scaricare, invece di affidarti a questa tabella. La chiave di firma del rilascio è incorporata nel binario; non c'è nulla da installare da parte tua.

## Limiti e problemi noti {#limits}

- **Non è un light client di protocollo.** Il nodo corrobora gli hash dei blocchi tra gli endpoint. Non controlla le firme di commit, le modifiche del validator-set né un trust period, quindi non verifica il consenso della chain. `trust_period` e `max_clock_drift` nella configurazione sono accettati ma non usati.
- **Le ricompense sono un tetto.** Il limite per nodo (2,000 QOR ogni 30 giorni) è un massimo, e il nodo è pagato solo per ciò che si accumula nel pool e solo mentre è idoneo.
- **Un heartbeat è una firma di liveness.** Dimostra che la chiave dell'operatore ha firmato in tempo, non che il software completo sia rimasto in esecuzione in modo continuo.
- **Gli avvisi di reputazione per ora sono solo per la testnet.** La mainnet (anche sulla v3.2.5) non serve ancora i punteggi di reputazione per validatore, quindi sulla mainnet quel controllo non viene eseguito e il nodo lo dice nel suo log. Gli avvisi di jail, di assenza dal set attivo e di stake basso non ne dipendono. Le versioni del nodo precedenti alla 3.1.11 registravano un controllo di reputazione fallito ogni cinque minuti e non avvisavano mai di nulla.
- **L'auto-aggiornamento parte dalla 3.1.11.** Un nodo alla 3.1.10 o precedente non si aggiorna da solo e richiede un'installazione manuale della 3.1.12. In un container o in una cartella non scrivibile il nodo si limita ad annunciare le nuove release.
- **I nodi Docker non si aggiornano da soli.** Vengono avvisati di una nuova release e l'aggiornamento è `docker compose pull && docker compose up -d`.
- **Android è un'anteprima** e non si registra né guadagna.
- **Licenze.** Le concessioni sulla mainnet vengono firmate a mano in lotti, quindi c'è un'attesa tra il pagamento e la registrazione. La licenza della testnet è limitata a una per account e una per indirizzo.
- **Un wallet creato dalla dashboard non può eseguire un nodo** a meno che tu non ne esporti il seed, perché il nodo deve firmare con chiavi che possiedi.

## Dove andare adesso

- [Edizione SX](/light-node/sx-edition): installa, configura ed esegui il daemon server.
- [Edizione UX](/light-node/ux-edition): esegui l'edizione con dashboard web.
- [Registrazione e Licenze](/light-node/registration-and-licensing): ottieni una licenza e registrati on-chain.
- [Ricompense e Monitoraggio](/light-node/rewards-and-monitoring): come la quota del 3% viene accreditata e richiesta, e come mantenere il nodo in salute.
- [Tokenomics](/architecture/tokenomics): come la quota di ricompensa dei light node si inserisce nell'economia più ampia.
