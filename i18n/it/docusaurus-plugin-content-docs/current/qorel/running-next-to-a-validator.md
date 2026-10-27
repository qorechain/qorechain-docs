---
slug: /qorel/running-next-to-a-validator
title: Eseguire QORel accanto a un validatore
sidebar_label: Accanto a un validatore
sidebar_position: 6
---

# Eseguire QORel accanto a un validatore

I validatori spesso fanno da relay per i canali della propria chain. QORel può girare sull'host del validatore, come container sidecar o in Kubernetes. Questa pagina presenta le tre configurazioni e le regole che mantengono il relayer isolato dalle chiavi del validatore. È pensata per gli operatori di validatori e di nodi. Per eseguire il nodo stesso vedi [Eseguire un validatore](/developer-guide/running-a-validator) ed [Eseguire un nodo](/developer-guide/running-a-node).

Oggi il relay è solo testnet: QORel è stato eseguito su `qorechain-diana`, e non è aperto alcun canale IBC su mainnet.

## Innovazioni {#innovations}

- **Un servizio rinforzato nel pacchetto.** I `.deb` e `.rpm` installano un `qorel.service` che gira come utente `qorel` dedicato, con umask `0077`, nessun nuovo privilegio, un `/tmp` privato, un file system in sola lettura al di fuori di `/var/lib/qorel` e nessun core dump.
- **Chiavi solo in memoria, se lo desideri.** La configurazione Kubernetes ricostruisce le chiavi all'avvio del pod da un secret in un volume in memoria, così i file delle chiavi non toccano mai il disco.
- **File delle chiavi leggibili solo dal proprietario.** I file delle chiavi, incluso il seed post-quantistico, hanno modalità 0600.
- **Controlli su cui puoi impostare alert.** `qorel keys pqc-status` riporta `ready_to_relay`, e il controllo pre-invio ferma una transazione che verrebbe rifiutata prima che venga spesa una commissione.

## Come si usa {#how-to-use}

### Regole di base {#ground-rules}

- **Usa un account relayer dedicato.** Mai la chiave operatore del validatore e mai la chiave di consenso. Finanzialo con quanto serve al relayer per le commissioni.
- **Un processo relayer per chiave del relayer.** Due processi che firmano con la stessa chiave si contendono i sequence dell'account.
- **Fai da relay solo per i tuoi canali.** Imposta un `packet_filter`.
- **Punta QORel al nodo locale.** Usa `http://127.0.0.1:26657`, `http://127.0.0.1:9090` e `ws://127.0.0.1:26657/websocket`, e tieni quelle porte chiuse a internet. Questo fornisce inoltre al relayer l'endpoint gRPC che non è disponibile pubblicamente.
- **Su QoreChain**, registra una sola volta la chiave post-quantistica del relayer con `qorel keys register-pqc`, e controlla `qorel keys pqc-status` prima di avviare.

### 1. systemd sull'host del validatore {#systemd}

1. Installa il pacchetto `.deb` o `.rpm` ([Installazione](/qorel/install#packages)). Crea un utente di sistema `qorel`, separato dall'utente del validatore, e un `qorel.service` rinforzato.
2. Modifica `/etc/qorel/config.toml` con gli endpoint del nodo locale.
3. Aggiungi la chiave del relayer come utente `qorel` e registra la chiave post-quantistica:

   ```bash
   sudo -u qorel qorel --config /etc/qorel/config.toml keys add --chain qorechain-diana --key-name relayer --mnemonic-file <file>
   sudo -u qorel qorel --config /etc/qorel/config.toml keys register-pqc --chain qorechain-diana
   sudo -u qorel qorel --config /etc/qorel/config.toml keys pqc-status --chain qorechain-diana
   ```

4. Esegui `systemctl enable --now qorel`.
5. Dai a QORel una priorità inferiore a quella del nodo, in modo che non competa mai con la produzione dei blocchi:

   ```ini
   # /etc/systemd/system/qorel.service.d/priority.conf
   [Service]
   Nice=10
   CPUWeight=20
   MemoryMax=1G
   ```

   Poi `systemctl daemon-reload && systemctl restart qorel`.

### 2. Sidecar con Docker Compose {#compose}

```yaml
services:
  qorel:
    image: ghcr.io/qorechain/qorel:0.1.0
    command: ["--config", "/home/nonroot/.hermes/config.toml", "start"]
    network_mode: host          # reach the node on 127.0.0.1
    restart: unless-stopped
    volumes:
      - ./qorel:/home/nonroot/.hermes   # config.toml + keys/ (owner uid 65532, mode 0700)
    deploy:
      resources:
        limits: { cpus: "1.0", memory: 1g }
```

Aggiungi le chiavi una sola volta con la stessa immagine, per esempio:

```bash
docker run --rm -v $PWD/qorel:/home/nonroot/.hermes ghcr.io/qorechain/qorel:0.1.0 \
  keys add --chain qorechain-diana --key-name relayer --mnemonic-file /home/nonroot/.hermes/relayer.mnemonic
docker run --rm --network host -v $PWD/qorel:/home/nonroot/.hermes ghcr.io/qorechain/qorel:0.1.0 \
  keys register-pqc --chain qorechain-diana
```

Elimina poi il file della mnemonica.

### 3. Kubernetes {#kubernetes}

Conserva la mnemonica nel tuo secret store e ricostruisci le chiavi all'avvio:

1. Un init container esegue `qorel keys add` in un `emptyDir` con `medium: Memory` (registra la chiave post-quantistica una sola volta, a mano, in anticipo).
2. Il container principale esegue `qorel start` sullo stesso volume.

In questo modo le chiavi esistono solo in memoria.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: qorel }
spec:
  replicas: 1                      # never more than one per key
  strategy: { type: Recreate }
  selector: { matchLabels: { app: qorel } }
  template:
    metadata: { labels: { app: qorel } }
    spec:
      securityContext: { runAsNonRoot: true, runAsUser: 65532, fsGroup: 65532 }
      volumes:
        - name: home
          emptyDir: { medium: Memory }
        - name: config
          configMap: { name: qorel-config }
        - name: mnemonic
          secret: { secretName: qorel-relayer-mnemonic }   # key: mnemonic
      initContainers:
        - name: keys
          image: ghcr.io/qorechain/qorel:0.1.0
          args: ["--config", "/config/config.toml", "keys", "add", "--chain", "qorechain-diana",
                 "--key-name", "relayer", "--mnemonic-file", "/secret/mnemonic", "--overwrite"]
          volumeMounts:
            - { name: home, mountPath: /home/nonroot/.hermes }
            - { name: config, mountPath: /config }
            - { name: mnemonic, mountPath: /secret, readOnly: true }
        # repeat the init container for each chain in the config
      containers:
        - name: qorel
          image: ghcr.io/qorechain/qorel:0.1.0
          args: ["--config", "/config/config.toml", "start"]
          ports: [{ containerPort: 3001, name: telemetry }]
          resources: { limits: { cpu: "1", memory: 1Gi } }
          volumeMounts:
            - { name: home, mountPath: /home/nonroot/.hermes }
            - { name: config, mountPath: /config }
```

Il `key_store_folder` della configurazione deve puntare a `/home/nonroot/.hermes/keys` (oppure essere lasciato non impostato).

### Monitoraggio {#monitoring}

Abilita la telemetria e imposta alert su pacchetti in sospeso, saldi del relayer, stato della chiave post-quantistica e aggiornamento dei client. L'elenco è in [Monitoraggio](/qorel/monitoring).

## Come accedere {#how-to-access}

- **Rete.** Testnet `qorechain-diana`. Il relayer si connette alle porte locali del tuo nodo e agli endpoint dell'altra chain.
- **Account.** Un account relayer dedicato su ciascuna chain, finanziato per le commissioni; mai la chiave operatore del validatore.
- **Host.** Linux con systemd per la configurazione 1; Docker con rete host per la configurazione 2; un cluster con un `emptyDir` in memoria per la configurazione 3.
- **Costo.** Solo commissioni. Gli esempi qui sopra limitano il relayer a 1 CPU e 1 GiB di memoria.

## Dove è pubblicato {#where-published}

I pacchetti, l'immagine container e il codice sorgente sono elencati in [Installazione](/qorel/install#where-published). La configurazione di esempio è `packaging/config.example.toml` in [qorechain/QORel](https://github.com/qorechain/QORel).

## Limiti e problemi noti {#limits}

- **Non è un compito del validatore.** Il relay è opzionale e separato dalla validazione; un relayer fermo non influisce sul consenso.
- **Un processo per chiave.** Gli aggiornamenti progressivi che avviano un secondo pod con la stessa chiave rompono il sequence dell'account; l'esempio usa `Recreate`.
- **Registrazione manuale.** `keys register-pqc` è un passaggio manuale una tantum; l'init container di Kubernetes ricostruisce soltanto le chiavi.
- **Solo testnet.** Non esiste ancora un canale mainnet su cui fare relay.
