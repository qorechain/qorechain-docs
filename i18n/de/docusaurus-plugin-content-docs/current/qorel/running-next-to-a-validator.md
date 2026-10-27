---
slug: /qorel/running-next-to-a-validator
title: QORel neben einem Validator betreiben
sidebar_label: Neben einem Validator
sidebar_position: 6
---

# QORel neben einem Validator betreiben

Validatoren relayen oft die Kanäle ihrer eigenen Chain. QORel kann auf dem Validator-Host, als Sidecar-Container oder in Kubernetes laufen. Diese Seite zeigt die drei Layouts und die Regeln, die den Relayer von den eigenen Schlüsseln des Validators getrennt halten. Sie richtet sich an Validator- und Node-Betreiber. Zum Betrieb des Nodes selbst siehe [Validator betreiben](/developer-guide/running-a-validator) und [Einen Node betreiben](/developer-guide/running-a-node).

Das Relaying ist heute nur im Testnet möglich: QORel wurde gegen `qorechain-diana` betrieben, und es ist kein Mainnet-IBC-Kanal geöffnet.

## Innovationen {#innovations}

- **Ein gehärteter Dienst im Paket.** `.deb` und `.rpm` installieren eine `qorel.service`, die als eigener Benutzer `qorel` läuft, mit umask `0077`, ohne neue Privilegien, mit privatem `/tmp`, einem schreibgeschützten Dateisystem außerhalb von `/var/lib/qorel` und ohne Core-Dumps.
- **Schlüssel nur im Arbeitsspeicher, wenn Sie möchten.** Das Kubernetes-Layout baut die Schlüssel beim Pod-Start aus einem Secret in ein speichergestütztes Volume neu auf, sodass Schlüsseldateien nie die Festplatte berühren.
- **Schlüsseldateien nur für den Besitzer.** Schlüsseldateien, einschließlich des Post-Quanten-Seeds, haben den Modus 0600.
- **Prüfungen, auf die Sie Alarme setzen können.** `qorel keys pqc-status` meldet `ready_to_relay`, und die Prüfung vor dem Senden hält eine Transaktion auf, die abgelehnt würde, bevor eine Gebühr anfällt.

## Verwendung {#how-to-use}

### Grundregeln {#ground-rules}

- **Verwenden Sie ein eigenes Relayer-Konto.** Nie den Operator-Schlüssel des Validators und nie den Konsensschlüssel. Laden Sie es mit dem auf, was der Relayer für Gebühren braucht.
- **Ein Relayer-Prozess pro Relayer-Schlüssel.** Zwei Prozesse, die mit demselben Schlüssel signieren, kämpfen um die Account-Sequenzen.
- **Relayen Sie nur Ihre Kanäle.** Setzen Sie einen `packet_filter`.
- **Richten Sie QORel auf den lokalen Node.** Verwenden Sie `http://127.0.0.1:26657`, `http://127.0.0.1:9090` und `ws://127.0.0.1:26657/websocket` und halten Sie diese Ports zum Internet hin geschlossen. Das gibt dem Relayer auch den gRPC-Endpunkt, der öffentlich nicht verfügbar ist.
- **Auf QoreChain** registrieren Sie den Post-Quanten-Schlüssel des Relayers einmalig mit `qorel keys register-pqc` und prüfen vor dem Start `qorel keys pqc-status`.

### 1. systemd auf dem Validator-Host {#systemd}

1. Installieren Sie das Paket `.deb` oder `.rpm` ([Installation](/qorel/install#packages)). Es legt einen Systembenutzer `qorel` an, getrennt vom Benutzer des Validators, und eine gehärtete `qorel.service`.
2. Bearbeiten Sie `/etc/qorel/config.toml` mit den lokalen Node-Endpunkten.
3. Fügen Sie den Relayer-Schlüssel als Benutzer `qorel` hinzu und registrieren Sie den Post-Quanten-Schlüssel:

   ```bash
   sudo -u qorel qorel --config /etc/qorel/config.toml keys add --chain qorechain-diana --key-name relayer --mnemonic-file <file>
   sudo -u qorel qorel --config /etc/qorel/config.toml keys register-pqc --chain qorechain-diana
   sudo -u qorel qorel --config /etc/qorel/config.toml keys pqc-status --chain qorechain-diana
   ```

4. Führen Sie `systemctl enable --now qorel` aus.
5. Geben Sie QORel eine niedrigere Priorität als dem Node, damit es nie mit der Blockproduktion konkurriert:

   ```ini
   # /etc/systemd/system/qorel.service.d/priority.conf
   [Service]
   Nice=10
   CPUWeight=20
   MemoryMax=1G
   ```

   Führen Sie dann `systemctl daemon-reload && systemctl restart qorel` aus.

### 2. Docker-Compose-Sidecar {#compose}

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

Fügen Sie die Schlüssel einmalig mit demselben Image hinzu, zum Beispiel:

```bash
docker run --rm -v $PWD/qorel:/home/nonroot/.hermes ghcr.io/qorechain/qorel:0.1.0 \
  keys add --chain qorechain-diana --key-name relayer --mnemonic-file /home/nonroot/.hermes/relayer.mnemonic
docker run --rm --network host -v $PWD/qorel:/home/nonroot/.hermes ghcr.io/qorechain/qorel:0.1.0 \
  keys register-pqc --chain qorechain-diana
```

Löschen Sie die Mnemonic-Datei anschließend.

### 3. Kubernetes {#kubernetes}

Halten Sie die Mnemonic in Ihrem Secret-Store und bauen Sie die Schlüssel beim Start neu auf:

1. Ein Init-Container führt `qorel keys add` in ein `emptyDir` mit `medium: Memory` aus (registrieren Sie den Post-Quanten-Schlüssel vorher einmalig von Hand).
2. Der Haupt-Container führt `qorel start` auf demselben Volume aus.

So existieren die Schlüssel nur im Arbeitsspeicher.

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

Der `key_store_folder` der Konfiguration muss auf `/home/nonroot/.hermes/keys` zeigen (oder ungesetzt bleiben).

### Monitoring {#monitoring}

Aktivieren Sie die Telemetrie und setzen Sie Alarme auf ausstehende Pakete, Relayer-Guthaben, den Zustand des Post-Quanten-Schlüssels und die Aktualität der Clients. Die Liste steht unter [Monitoring](/qorel/monitoring).

## Zugang {#how-to-access}

- **Netzwerk.** Testnet `qorechain-diana`. Der Relayer verbindet sich mit den lokalen Ports Ihres eigenen Nodes und mit den Endpunkten der anderen Chain.
- **Konten.** Ein eigenes Relayer-Konto auf jeder Chain, für Gebühren aufgeladen; nie der Operator-Schlüssel des Validators.
- **Host.** Linux mit systemd für Layout 1; Docker mit Host-Netzwerk für Layout 2; ein Cluster mit speichergestütztem `emptyDir` für Layout 3.
- **Kosten.** Nur Gebühren. Die obigen Beispiele begrenzen den Relayer auf 1 CPU und 1 GiB Arbeitsspeicher.

## Wo es veröffentlicht ist {#where-published}

Die Pakete, das Container-Image und der Quellcode sind unter [Installation](/qorel/install#where-published) aufgeführt. Die Beispielkonfiguration ist `packaging/config.example.toml` in [qorechain/QORel](https://github.com/qorechain/QORel).

## Grenzen und bekannte Probleme {#limits}

- **Keine Validator-Pflicht.** Das Relaying ist optional und vom Validieren getrennt; ein gestoppter Relayer wirkt sich nicht auf den Konsens aus.
- **Ein Prozess pro Schlüssel.** Rolling Updates, die einen zweiten Pod mit demselben Schlüssel starten, brechen die Account-Sequenz; das Beispiel verwendet `Recreate`.
- **Manuelle Registrierung.** `keys register-pqc` ist ein einmaliger manueller Schritt; der Kubernetes-Init-Container baut nur die Schlüssel neu auf.
- **Nur Testnet.** Es gibt noch keinen Mainnet-Kanal zum Relayen.
