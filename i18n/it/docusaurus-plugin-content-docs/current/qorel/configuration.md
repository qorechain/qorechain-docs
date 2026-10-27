---
slug: /qorel/configuration
title: Configurazione di QORel
sidebar_label: Configurazione
sidebar_position: 5
---

# Configurazione

QORel legge un unico file TOML (per impostazione predefinita `~/.hermes/config.toml`, oppure il percorso indicato con `--config`). Per qualsiasi chain che firma nel modo standard il file è esattamente la configurazione di Hermes; la [guida di Hermes](https://hermes.informal.systems) descrive ogni impostazione. Questa pagina tratta ciò che QORel aggiunge: la voce della chain QoreChain, le chiavi post-quantistiche, le impostazioni del gas e i controlli eseguiti prima dell'invio di una transazione. È pensata per gli operatori che scrivono o rivedono una configurazione di QORel.

## Innovazioni {#innovations}

- **`signing` per chain.** `'qorechain-hybrid'` aggiunge la firma ML-DSA-87 a ogni transazione che QORel invia a quella chain; `'standard'` (il valore predefinito) è identico byte per byte a Hermes. Le configurazioni miste funzionano: un processo, una chain di ciascun tipo.
- **Versione dei sign-bytes letta dalla chain.** Con `pqc.sign_bytes = 'auto'`, QORel legge i record di upgrade applicati dalla chain, firma la forma corrispondente, la rilegge ogni minuto e dopo ogni rifiuto, e non inventa mai una versione.
- **Prezzo del gas dal fee market.** `dynamic_gas_price` con `backend = 'cosmos-evm-feemarket'` segue la base fee di QoreChain (minimo 0,1 uqor per gas).
- **Una configurazione che rifiuta le combinazioni non sicure.** `extension_options` statiche insieme alla firma ibrida vengono rifiutate al caricamento, perché la firma post-quantistica deve essere l'unica opzione di estensione critica.

## Come si usa {#how-to-use}

### La voce della chain QoreChain {#chain-entry}

Questa è la voce testnet della configurazione di esempio. Sostituisci gli indirizzi dei nodi con quelli del tuo nodo testnet:

```toml
[[chains]]
id = 'qorechain-diana'
type = 'CosmosSdk'
rpc_addr = 'http://YOUR-QORECHAIN-NODE:26657'
grpc_addr = 'http://YOUR-QORECHAIN-NODE:9090'
event_source = { mode = 'push', url = 'ws://YOUR-QORECHAIN-NODE:26657/websocket', batch_delay = '500ms' }
rpc_timeout = '15s'
account_prefix = 'qor'
key_name = 'relayer'
key_store_folder = '/var/lib/qorel/keys'
store_prefix = 'ibc'
default_gas = 400000
max_gas = 6000000

# The QoreChain-specific part:
signing = 'qorechain-hybrid'
gas_price = { price = 0.1, denom = 'uqor' }
gas_multiplier = 1.1
dynamic_gas_price = { enabled = true, multiplier = 1.0, max = 10.0, backend = 'cosmos-evm-feemarket' }
# optional, defaults shown:
# pqc = { sign_bytes = 'auto', sign_mode = 'hedged', include_public_key = false }

clock_drift = '5s'
trust_threshold = '2/3'
memo_prefix = 'relayed by QORel'
# Relay only the channels you operate.
packet_filter = { policy = 'allow', list = [['transfer', 'channel-0']] }
```

Le impostazioni specifiche di QoreChain:

| Impostazione | Valore | Che cosa fa |
|---|---|---|
| `signing` | `'qorechain-hybrid'` | Aggiunge la firma ML-DSA-87 (FIPS 204) a ogni transazione inviata a questa chain. Omettila, oppure usa `'standard'`, per ogni altra chain. |
| `account_prefix` | `'qor'` | Il prefisso degli indirizzi degli account QoreChain. |
| `gas_price` | `{ price = 0.1, denom = 'uqor' }` | Il minimo della commissione è 0,1 uqor per gas. |
| `gas_multiplier` | `1.1` | Moltiplica il gas simulato per ottenere il limite di gas. Vedi [Gas](#gas). |
| `dynamic_gas_price.backend` | `'cosmos-evm-feemarket'` | Legge la base fee del fee market della chain invece di usare solo `gas_price`. |
| `pqc.sign_bytes` | `'auto'` (predefinito), `'v1'` o `'v2'` | `auto` legge dalla chain la versione dei sign-bytes; `v1` e `v2` forzano una forma. Lascialo su `auto`. |
| `pqc.sign_mode` | `'hedged'` (predefinito) o `'deterministic'` | Firma ML-DSA randomizzata o deterministica. La chain accetta entrambe. |
| `pqc.include_public_key` | `false` (predefinito) | Se incorporare la chiave pubblica in ciascuna estensione di firma. Questo non registra la chiave; solo `keys register-pqc` lo fa. |

Gli endpoint pubblici della testnet QoreChain per la lettura sono elencati in [Connessione alla testnet](/getting-started/connecting-to-testnet). Un relayer richiede anche gRPC, che non è pubblico, quindi esegui un tuo nodo per il lato QoreChain.

### Qualsiasi altra chain Cosmos SDK {#other-chains}

Scrivi la voce come faresti per Hermes e ometti `signing`. Questa è la voce della testnet pubblica di Cosmos Hub della configurazione di esempio:

```toml
[[chains]]
id = 'provider'
type = 'CosmosSdk'
rpc_addr = 'https://rpc.provider-sentry-01.hub-testnet.polypore.xyz'
grpc_addr = 'https://grpc.provider-sentry-01.hub-testnet.polypore.xyz:443'
event_source = { mode = 'push', url = 'wss://rpc.provider-sentry-01.hub-testnet.polypore.xyz/websocket', batch_delay = '500ms' }
rpc_timeout = '15s'
account_prefix = 'cosmos'
key_name = 'relayer'
key_store_folder = '/var/lib/qorel/keys'
store_prefix = 'ibc'
default_gas = 400000
max_gas = 6000000
gas_price = { price = 0.005, denom = 'uatom' }
gas_multiplier = 1.3
dynamic_gas_price = { enabled = true, multiplier = 1.1, max = 0.1, backend = 'skip-feemarket' }
clock_drift = '5s'
trust_threshold = '2/3'
memo_prefix = 'relayed by QORel'
packet_filter = { policy = 'allow', list = [['transfer', 'channel-600']] }
```

Questi endpoint appartengono a una terza parte, sono pubblici e possono limitare la frequenza delle richieste. Usa i tuoi nodi per un relay continuo.

### Impostazioni globali {#global}

La configurazione di esempio usa queste, che sono impostazioni di Hermes:

```toml
[global]
log_level = 'info'

[mode.clients]
enabled = true
refresh = true
misbehaviour = true

[mode.connections]
enabled = false

[mode.channels]
enabled = false

[mode.packets]
enabled = true
clear_interval = 50
clear_on_start = true
tx_confirmation = true

[rest]
enabled = false
host = '127.0.0.1'
port = 3000

[telemetry]
enabled = true
host = '127.0.0.1'
port = 3001
```

`mode.clients` mantiene aggiornati i light client e sorveglia il misbehaviour; `mode.packets` fa il relay dei pacchetti e libera quelli in sospeso ogni `clear_interval` blocchi e all'avvio. Gli handshake di connessione e di canale sono lasciati ai comandi `create`. La porta della telemetria è descritta in [Monitoraggio](/qorel/monitoring).

### Chiavi {#keys}

```bash
qorel keys add --chain qorechain-diana --key-name relayer --mnemonic-file ./relayer.mnemonic
qorel keys register-pqc --chain qorechain-diana
qorel keys pqc-status --chain qorechain-diana
```

- `keys add` (oppure `--key-file` con un file di chiave che contiene la mnemonica) memorizza la chiave secp256k1 come fa Hermes e, su una chain ibrida, deriva la chiave ML-DSA-87 dalla stessa mnemonica e dallo stesso account con la derivazione del wallet QoreChain. Ne viene memorizzato solo il seed di 32 byte, accanto alla chiave, come `<key name>.pqc`. Non viene stampato nulla di segreto. Vedi [Derivazione delle chiavi](/qoresign/guides/key-derivation) per la derivazione.
- `keys register-pqc` invia una sola volta `MsgRegisterPQCKeyV2`. È l'unica transazione che QoreChain accetta con la sola firma classica, e porta una prova di possesso sulle reti dalla v3.2.3 in poi. È idempotente e si rifiuta di inviare quando l'account ha già una chiave diversa. Vedi [Firma post-quantistica](/developer-guide/post-quantum-signing#pqc-key-registration) per che cosa verifica la chain.
- `keys pqc-status` mostra se la chiave è registrata, se corrisponde alla chiave locale, se è stata dimostrata con una prova di possesso e quali sign bytes verifica la chain. `ready_to_relay` deve essere `true`.
- Usa un account relayer dedicato con un piccolo saldo, mai la chiave operatore di un validatore.
- I file delle chiavi (`<key name>.json` e `<key name>.pqc`) sono scritti leggibili solo dal proprietario (0600). Hermes originale usava l'umask predefinita; le chiavi aggiunte con un Hermes precedente mantengono la loro vecchia modalità, quindi controllale con `ls -l`.

### Gas {#gas}

QoreChain addebita l'intera commissione (limite di gas per prezzo) senza rimborso, quindi mantieni il moltiplicatore contenuto.

- Sulla testnet (v3.2.6), la simulazione coincide con la consegna entro poche centinaia di gas. Il test end-to-end locale su una build di quella linea passa con `1.05` (ogni transazione di relay ha usato il 95% del proprio limite).
- Le build precedenti sottostimano di circa l'8-10% (misurato su una devnet pre-release, dove `1.15` lasciava un margine del 4-7%). Usa `1.15` finché non hai misurato i tuoi nodi.
- `health-check` segnala come possibile errore di configurazione qualsiasi moltiplicatore inferiore a `1.1` su una voce QoreChain. È un avviso e il relay funziona comunque. `1.1`, il valore nella configurazione di esempio, lo mantiene pulito con circa il 5% di commissione in più rispetto a `1.05`.
- La transazione una tantum `keys register-pqc` usa almeno `1.1`, qualunque cosa dica la configurazione.
- Ogni firma ibrida aggiunge circa 4,7 KB alla transazione e 2.000 gas per la verifica; la simulazione include entrambi.

### Controlli di sicurezza prima di ogni invio {#safety-checks}

Prima di ogni transazione verso una chain ibrida, QORel verifica che la chiave post-quantistica sia caricata, registrata on-chain e identica a quella locale, e che la versione dei sign-bytes sia nota. Se un controllo fallisce, non invia nulla (non si spende alcuna commissione) e `health-check` riporta il motivo. Un rifiuto della chain con codespace `pqc` codice 21 fa sì che QORel rilegga la versione e la registrazione prima della transazione successiva.

### Note per le chain ibc-go v10 {#ibc-go-v10}

- Il middleware delle commissioni ICS-29 non esiste più in ibc-go v10; le commissioni sono il prezzo del gas, un fee granter e la base fee dinamica.
- ibc-go v10 non inserisce più l'header negli eventi `update_client`. QORel lo legge invece dalla transazione `MsgUpdateClient`, così il rilevamento del misbehaviour continua a funzionare (Hermes 1.13 standard lo disattiva su queste chain).

### Endpoint con limiti di frequenza {#rate-limits}

Gli endpoint pubblici spesso rispondono alle raffiche con `429 Too Many Requests`, per esempio subito dopo l'avvio del relayer. Hermes li tratta come ritentabili, ma i suoi worker dei pacchetti si fermano anche dopo `clear_interval x 5` blocchi senza nuovi eventi IBC, anche quando l'ultimo ciclo di clearing è fallito; un pacchetto in sospeso in quel momento attendeva il pacchetto successivo sul canale o un riavvio. QORel mantiene attivi i worker dei pacchetti di un canale mentre un tentativo di relay o di clearing è fallito, e riprova a ogni intervallo di clearing. Si fermano per inattività solo dopo che un ciclo di clearing ha successo. Preferisci i tuoi nodi o un endpoint a pagamento per il relay in produzione, e imposta alert sui pacchetti in sospeso ([Monitoraggio](/qorel/monitoring)).

## Come accedere {#how-to-access}

- **Dove si trova il file.** `~/.hermes/config.toml` per un'installazione da tarball o Homebrew, `/etc/qorel/config.toml` per i `.deb` e `.rpm`, e la directory montata per il container. Sovrascrivi con `--config <path>`.
- **Archivio delle chiavi.** `key_store_folder` imposta dove sono conservate le chiavi; il valore predefinito è `~/.hermes/keys`, e i pacchetti usano `/var/lib/qorel/keys`.
- **Prerequisiti.** Endpoint RPC, gRPC e WebSocket per ogni chain, e un account relayer con fondi su ciascuna.
- **Verificare una configurazione.** `qorel health-check` carica il file e testa ogni chain.

## Dove è pubblicato {#where-published}

| Che cosa | Dove |
|---|---|
| Configurazione di esempio (testnet, QoreChain e testnet pubblica di Cosmos Hub) | `packaging/config.example.toml` in [qorechain/QORel](https://github.com/qorechain/QORel); installata in `/etc/qorel/config.example.toml` dai pacchetti |
| Riferimento alla configurazione di Hermes | [hermes.informal.systems](https://hermes.informal.systems) |

## Limiti e problemi noti {#limits}

- **Le `extension_options` statiche vengono rifiutate** su una chain con `signing = 'qorechain-hybrid'`.
- **Mantieni `pqc.sign_bytes` su `auto`.** Un `v1` o `v2` fisso che non corrisponde a ciò che la chain verifica fa sì che la chain rifiuti ogni transazione.
- **Modalità delle chiavi più vecchie.** I file scritti da un Hermes precedente mantengono i vecchi permessi.
- **Endpoint di terze parti.** Gli endpoint lato Hub nella configurazione di esempio non sono gestiti da QoreChain e possono cambiare o limitare la frequenza.
- **Solo voce testnet.** La voce QoreChain qui riportata è per `qorechain-diana`. La mainnet non è aperta all'IBC.
