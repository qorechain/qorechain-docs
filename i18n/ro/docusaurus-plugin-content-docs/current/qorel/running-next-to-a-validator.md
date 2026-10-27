---
slug: /qorel/running-next-to-a-validator
title: Rularea QORel alături de un validator
sidebar_label: Alături de un validator
sidebar_position: 6
---

# Rularea QORel alături de un validator

Validatorii fac adesea relay pentru canalele propriului lanț. QORel poate rula pe gazda validatorului, ca un container sidecar sau în Kubernetes. Această pagină prezintă cele trei aranjamente și regulile care păstrează relayer-ul izolat de cheile proprii ale validatorului. Este destinată operatorilor de validatori și de noduri. Pentru rularea nodului în sine vezi [Rularea unui validator](/developer-guide/running-a-validator) și [Rularea unui nod](/developer-guide/running-a-node).

Relay-ul este astăzi doar pentru testnet: QORel a fost rulat pe `qorechain-diana`, iar niciun canal IBC de mainnet nu este deschis.

## Inovații {#innovations}

- **Un serviciu întărit în pachet.** `.deb` și `.rpm` instalează un `qorel.service` care rulează ca propriul utilizator `qorel`, cu umask `0077`, fără privilegii noi, un `/tmp` privat, un sistem de fișiere doar în citire în afara `/var/lib/qorel` și fără core dump-uri.
- **Chei doar în memorie, dacă doriți.** Aranjamentul Kubernetes reconstruiește cheile la pornirea pod-ului dintr-un secret într-un volum susținut de memorie, astfel încât fișierele de chei nu ating niciodată discul.
- **Fișiere de chei doar pentru proprietar.** Fișierele de chei, inclusiv seed-ul post-cuantic, au modul 0600.
- **Verificări pentru care puteți configura alerte.** `qorel keys pqc-status` raportează `ready_to_relay`, iar verificarea dinaintea trimiterii oprește o tranzacție care ar fi refuzată înainte să se cheltuiască o taxă.

## Cum se folosește {#how-to-use}

### Reguli de bază {#ground-rules}

- **Folosiți un cont de relayer dedicat.** Niciodată cheia operatorului validatorului și niciodată cheia de consens. Alimentați-l cu ce are nevoie relayer-ul pentru taxe.
- **Un singur proces de relayer per cheie de relayer.** Două procese care semnează cu aceeași cheie se luptă pentru secvențele contului.
- **Faceți relay doar pentru canalele dumneavoastră.** Setați un `packet_filter`.
- **Îndreptați QORel către nodul local.** Folosiți `http://127.0.0.1:26657`, `http://127.0.0.1:9090` și `ws://127.0.0.1:26657/websocket` și păstrați acele porturi închise către internet. Aceasta oferă relayer-ului și endpoint-ul gRPC care nu este disponibil public.
- **Pe QoreChain**, înregistrați o singură dată cheia post-cuantică a relayer-ului cu `qorel keys register-pqc` și verificați `qorel keys pqc-status` înainte de pornire.

### 1. systemd pe gazda validatorului {#systemd}

1. Instalați pachetul `.deb` sau `.rpm` ([Instalare](/qorel/install#packages)). Acesta creează un utilizator de sistem `qorel`, separat de utilizatorul validatorului, și un `qorel.service` întărit.
2. Editați `/etc/qorel/config.toml` cu endpoint-urile nodului local.
3. Adăugați cheia relayer-ului ca utilizatorul `qorel` și înregistrați cheia post-cuantică:

   ```bash
   sudo -u qorel qorel --config /etc/qorel/config.toml keys add --chain qorechain-diana --key-name relayer --mnemonic-file <file>
   sudo -u qorel qorel --config /etc/qorel/config.toml keys register-pqc --chain qorechain-diana
   sudo -u qorel qorel --config /etc/qorel/config.toml keys pqc-status --chain qorechain-diana
   ```

4. Rulați `systemctl enable --now qorel`.
5. Dați lui QORel o prioritate mai mică decât nodului, ca să nu concureze niciodată cu producția de blocuri:

   ```ini
   # /etc/systemd/system/qorel.service.d/priority.conf
   [Service]
   Nice=10
   CPUWeight=20
   MemoryMax=1G
   ```

   Apoi `systemctl daemon-reload && systemctl restart qorel`.

### 2. Sidecar Docker Compose {#compose}

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

Adăugați cheile o singură dată cu aceeași imagine, de exemplu:

```bash
docker run --rm -v $PWD/qorel:/home/nonroot/.hermes ghcr.io/qorechain/qorel:0.1.0 \
  keys add --chain qorechain-diana --key-name relayer --mnemonic-file /home/nonroot/.hermes/relayer.mnemonic
docker run --rm --network host -v $PWD/qorel:/home/nonroot/.hermes ghcr.io/qorechain/qorel:0.1.0 \
  keys register-pqc --chain qorechain-diana
```

Ștergeți apoi fișierul cu mnemonic.

### 3. Kubernetes {#kubernetes}

Păstrați mnemonicul în depozitul dumneavoastră de secrete și reconstruiți cheile la pornire:

1. Un init container rulează `qorel keys add` într-un `emptyDir` cu `medium: Memory` (înregistrați cheia post-cuantică o singură dată, manual, în prealabil).
2. Containerul principal rulează `qorel start` pe același volum.

În felul acesta cheile există doar în memorie.

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

`key_store_folder` din configurație trebuie să indice spre `/home/nonroot/.hermes/keys` (sau să rămână nesetat).

### Monitorizare {#monitoring}

Activați telemetria și configurați alerte pentru pachetele în așteptare, soldurile relayer-ului, starea cheii post-cuantice și prospețimea clienților. Lista este la [Monitorizare](/qorel/monitoring).

## Cum se accesează {#how-to-access}

- **Rețea.** Testnet-ul `qorechain-diana`. Relayer-ul se conectează la porturile locale ale propriului dumneavoastră nod și la endpoint-urile celuilalt lanț.
- **Conturi.** Un cont de relayer dedicat pe fiecare lanț, alimentat pentru taxe; niciodată cheia operatorului validatorului.
- **Gazdă.** Linux cu systemd pentru aranjamentul 1; Docker cu host networking pentru aranjamentul 2; un cluster cu un `emptyDir` susținut de memorie pentru aranjamentul 3.
- **Cost.** Doar taxe. Exemplele de mai sus limitează relayer-ul la 1 CPU și 1 GiB de memorie.

## Unde este publicat {#where-published}

Pachetele, imaginea de container și sursa sunt listate la [Instalare](/qorel/install#where-published). Configurația exemplu este `packaging/config.example.toml` în [qorechain/QORel](https://github.com/qorechain/QORel).

## Limite și probleme cunoscute {#limits}

- **Nu este o îndatorire a validatorului.** Relay-ul este opțional și separat de validare; un relayer oprit nu afectează consensul.
- **Un singur proces per cheie.** Actualizările rolling care pornesc un al doilea pod pe aceeași cheie strică secvența contului; exemplul folosește `Recreate`.
- **Înregistrare manuală.** `keys register-pqc` este un pas manual, unic; init container-ul Kubernetes doar reconstruiește cheile.
- **Doar testnet.** Nu există încă un canal de mainnet pentru relay.
