---
slug: /qorel/whats-new
title: Novità di QORel
sidebar_label: Novità
sidebar_position: 2
---

# Novità di QORel

Questa pagina elenca ciò che aggiunge ogni release di QORel. È pensata per gli operatori che devono decidere se passare da Hermes, o da un QORel precedente, e si limita a dichiarare ciò che una release fa, come comportamento verificabile. QORel è basato su Hermes 1.13.3 (Informal Systems, Apache-2.0); ogni modifica qui sotto si aggiunge a quella base. Tutto ciò che non è elencato si comporta come in Hermes.

## 0.1.0 {#v0-1-0}

Prima release. Solo testnet. La [pagina della release](https://github.com/qorechain/QORel/releases) contiene i file.

### Innovazioni {#innovations}

- **Firma ibrida post-quantistica per QoreChain.** Imposta `signing = 'qorechain-hybrid'` su una chain e QORel aggiunge la firma ML-DSA-87 (`/qorechain.pqc.v1.PQCHybridSignature`) come unica opzione di estensione critica di ogni transazione, poi firma il corpo finale con secp256k1. Il messaggio che la chiave post-quantistica firma sono i sign bytes versione 2, che entrambe le reti QoreChain verificano. Le `extension_options` statiche non possono essere combinate con questa modalità, e la configurazione viene rifiutata se ci sono.
- **La firma standard resta invariata.** Con `signing = 'standard'` (il valore predefinito) il formato di transazione è identico byte per byte a quello di Hermes, per Cosmos Hub, Osmosis e qualsiasi altra chain Cosmos SDK.
- **Il crate `qorel-signer`.** La primitiva post-quantistica (`PqSigner`, con `MlDsa87Signer`), le regole della chain (`SignBytesFramer`) e il firmatario dell'estensione che il relayer richiama (`TxExtensionSigner`) sono interfacce separate. La simulazione del gas e il dimensionamento dei batch passano per lo stesso percorso, così i circa 4,7 KB aggiuntivi e il gas di verifica vengono sempre conteggiati.
- **`qorel keys add` deriva la chiave post-quantistica.** Su una chain ibrida deriva la chiave ML-DSA-87 dalla stessa mnemonica e dallo stesso account con la derivazione del wallet QoreChain e ne memorizza solo il seed di 32 byte, accanto alla chiave, come `<key name>.pqc`. Non viene stampato nulla di segreto.
- **`qorel keys register-pqc`.** Invia una sola volta `MsgRegisterPQCKeyV2`, con una prova di possesso sulle reti dalla v3.2.3 in poi. È idempotente (non viene inviato nulla se la stessa chiave è già registrata) e si rifiuta di inviare quando l'account ha già una chiave diversa. `--no-proof` esiste solo per le reti precedenti alla v3.2.3.
- **`qorel keys pqc-status`.** Stampa se la chiave è registrata, se coincide con la chiave locale, se il possesso è stato dimostrato, quali sign bytes la chain verifica e `ready_to_relay`.
- **Controllo di sicurezza pre-invio.** Prima di ogni transazione verso una chain ibrida QORel verifica che la chiave sia caricata, registrata e identica a quella locale, e che la versione dei sign-bytes sia nota. Con `pqc.sign_bytes = 'auto'` legge la versione dai record di upgrade applicati della chain, la rilegge ogni minuto e la rilegge dopo ogni rifiuto con codespace `pqc` codice 21. A qualsiasi errore non viene inviato nulla e non si spende alcuna commissione; `health-check` riporta il motivo.
- **Prezzo del gas dal fee market.** `dynamic_gas_price.backend = 'cosmos-evm-feemarket'` legge la base fee di QoreChain, che ha un minimo di 0,1 uqor per gas.
- **Rilevamento del misbehaviour sulle chain ibc-go v10.** QORel legge l'header dalla transazione `MsgUpdateClient` perché ibc-go v10 non lo include più negli eventi `update_client`. Hermes 1.13 standard disattiva il rilevamento su queste chain.
- **I worker dei pacchetti sopravvivono al rate limiting.** I worker restano attivi mentre un tentativo di relay o di clearing è fallito e riprovano a ogni intervallo di clearing. In Hermes un worker si ferma anche dopo `clear_interval x 5` blocchi senza nuovi eventi IBC pur se l'ultimo ciclo di clearing è fallito, quindi un pacchetto in sospeso in quel momento attendeva il pacchetto successivo sul canale o un riavvio.
- **File delle chiavi leggibili solo dal proprietario.** Hermes scriveva i file delle chiavi con l'umask predefinita. QORel scrive `<key name>.json` e `<key name>.pqc` con modalità 0600. Le chiavi aggiunte da un Hermes precedente mantengono la loro vecchia modalità; controllale con `ls -l`.
- **Un binario `qorel`.** Un unico binario, `qorel`, con il set di comandi di Hermes più i comandi per le chiavi post-quantistiche. Dall'albero dei sorgenti viene costruito anche un binario `hermes` con la stessa CLI.
- **Release con provenienza.** Tarball per Linux e macOS, pacchetti `.deb` e `.rpm` con un'unità systemd rinforzata, una formula Homebrew e un'immagine container multi-architettura firmata con cosign. I file di release sono accompagnati da `SHA256SUMS` e da attestazioni di build. Vedi [Installazione](/qorel/install).
- **Un test su devnet locale.** Il repository include `scripts/qorel-devnet/`, che costruisce in locale un nodo QoreChain e una chain di test ibc-go v10 ed esegue un test end-to-end ICS-20 in entrambe le direzioni: registrazione della chiave, creazione di client, connessione e canale, trasferimenti in entrambe le direzioni, ritorno di un token trasferito, un pacchetto scaduto liberato e rimborsato, e un trasferimento inviato dallo stesso QORel.

### Provato sulla testnet {#proven-on-the-testnet}

- Il primo canale IBC della testnet di QoreChain, `transfer/channel-0` su `qorechain-diana` verso `channel-600` sulla testnet pubblica di Cosmos Hub (chain ID `provider`), è gestito da QORel. I client sono `07-tendermint-0` e `07-tendermint-466`, le connessioni `connection-0` e `connection-315`.
- I trasferimenti sono stati testati in entrambe le direzioni (1 QOR in uscita, 0,1 ATOM in entrata, 0,4 QOR restituiti) e il rimborso automatico di un trasferimento con timeout di 1 secondo tramite un messaggio di timeout. Tutte le 13 transazioni del relayer su `qorechain-diana` sono riuscite.
- La vista in sola lettura del canale è in [Bridging Assets](/user-guide/bridging-assets#ibc-test-channel).

### Non in questa release {#not-in-this-release}

- Il relay IBC v2. Non è ancora implementato in QORel ed è la fase successiva.
- Il relay Ethereum (Eureka). Non avviato.
- Il relay su mainnet. Non è ancora aperto alcun canale IBC su mainnet.
- Una build per Windows.
- Il crate `qorel-signer` su crates.io. La pubblicazione è bloccata; il crate è nel repository in `crates/qorel-signer`, quindi usa una dipendenza git.

## Aggiornamento {#upgrading}

Non esiste una release precedente di QORel. Per passare da Hermes 1.13 a QORel 0.1.0:

1. Installa `qorel` accanto a `hermes` o al suo posto ([Installazione](/qorel/install)).
2. Mantieni il tuo `config.toml`. Le chain senza `signing` restano sulla firma standard e si comportano come prima.
3. Rinomina il comando nei tuoi file di servizio da `hermes` a `qorel`. La cartella dell'archivio delle chiavi (`~/.hermes/keys` per impostazione predefinita) resta invariata, ed è per questo che l'immagine container monta i suoi dati in `/home/nonroot/.hermes`.
4. Controlla le modalità dei file delle chiavi con `ls -l`; le nuove chiavi sono 0600, quelle più vecchie mantengono la loro modalità.

Le note di aggiornamento di Hermes originale in `UPGRADING.md` del repository valgono per chiunque provenga da una versione di Hermes precedente alla 1.6.
