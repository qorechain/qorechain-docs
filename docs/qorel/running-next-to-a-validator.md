---
slug: /qorel/running-next-to-a-validator
title: Running QORel next to a validator
sidebar_label: Next to a validator
sidebar_position: 6
---

# Running QORel next to a validator

Validators often relay the channels of their own chain. QORel can run on the validator host, as a sidecar container, or in Kubernetes. This page gives the three layouts and the rules that keep the relayer isolated from the validator's own keys. It is for validator and node operators. For running the node itself see [Running a Validator](/developer-guide/running-a-validator) and [Running a Node](/developer-guide/running-a-node).

Relaying is testnet only today: QORel has been run against `qorechain-diana`, and no mainnet IBC channel is open.

## Innovations {#innovations}

- **A hardened service in the package.** The `.deb` and `.rpm` install a `qorel.service` that runs as its own `qorel` user, with a `0077` umask, no new privileges, a private `/tmp`, a read-only file system outside `/var/lib/qorel`, and no core dumps.
- **Keys only in memory, if you want.** The Kubernetes layout rebuilds the keys at pod start from a secret into a memory-backed volume, so key files never touch disk.
- **Owner-only key files.** Key files, including the post-quantum seed, are mode 0600.
- **Checks you can alert on.** `qorel keys pqc-status` reports `ready_to_relay`, and the pre-send check stops a transaction that would be refused before a fee is spent.

## How to use {#how-to-use}

### Ground rules {#ground-rules}

- **Use a dedicated relayer account.** Never the validator operator key and never the consensus key. Fund it with what the relayer needs for fees.
- **One relayer process per relayer key.** Two processes signing with the same key fight over account sequences.
- **Relay only your channels.** Set a `packet_filter`.
- **Point QORel at the local node.** Use `http://127.0.0.1:26657`, `http://127.0.0.1:9090` and `ws://127.0.0.1:26657/websocket`, and keep those ports closed to the internet. This also gives the relayer the gRPC endpoint that is not available publicly.
- **On QoreChain**, register the relayer's post-quantum key once with `qorel keys register-pqc`, and check `qorel keys pqc-status` before starting.

### 1. systemd on the validator host {#systemd}

1. Install the `.deb` or `.rpm` package ([Install](/qorel/install#packages)). It creates a `qorel` system user, separate from the validator's user, and a hardened `qorel.service`.
2. Edit `/etc/qorel/config.toml` with the local node endpoints.
3. Add the relayer key as user `qorel`, and register the post-quantum key:

   ```bash
   sudo -u qorel qorel --config /etc/qorel/config.toml keys add --chain qorechain-diana --key-name relayer --mnemonic-file <file>
   sudo -u qorel qorel --config /etc/qorel/config.toml keys register-pqc --chain qorechain-diana
   sudo -u qorel qorel --config /etc/qorel/config.toml keys pqc-status --chain qorechain-diana
   ```

4. Run `systemctl enable --now qorel`.
5. Give QORel lower priority than the node, so it never competes with block production:

   ```ini
   # /etc/systemd/system/qorel.service.d/priority.conf
   [Service]
   Nice=10
   CPUWeight=20
   MemoryMax=1G
   ```

   Then `systemctl daemon-reload && systemctl restart qorel`.

### 2. Docker Compose sidecar {#compose}

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

Add the keys once with the same image, for example:

```bash
docker run --rm -v $PWD/qorel:/home/nonroot/.hermes ghcr.io/qorechain/qorel:0.1.0 \
  keys add --chain qorechain-diana --key-name relayer --mnemonic-file /home/nonroot/.hermes/relayer.mnemonic
docker run --rm --network host -v $PWD/qorel:/home/nonroot/.hermes ghcr.io/qorechain/qorel:0.1.0 \
  keys register-pqc --chain qorechain-diana
```

Delete the mnemonic file afterwards.

### 3. Kubernetes {#kubernetes}

Keep the mnemonic in your secret store and rebuild the keys at start:

1. An init container runs `qorel keys add` into an `emptyDir` with `medium: Memory` (register the post-quantum key once, by hand, beforehand).
2. The main container runs `qorel start` on the same volume.

That way the keys exist only in memory.

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

The config's `key_store_folder` must point at `/home/nonroot/.hermes/keys` (or be left unset).

### Monitoring {#monitoring}

Enable telemetry and alert on pending packets, relayer balances, the post-quantum key state and client freshness. The list is on [Monitoring](/qorel/monitoring).

## How to access {#how-to-access}

- **Network.** Testnet `qorechain-diana`. The relayer connects to your own node's local ports and to the other chain's endpoints.
- **Accounts.** A dedicated relayer account on each chain, funded for fees; never the validator operator key.
- **Host.** Linux with systemd for layout 1; Docker with host networking for layout 2; a cluster with a memory-backed `emptyDir` for layout 3.
- **Cost.** Fees only. The examples above cap the relayer at 1 CPU and 1 GiB of memory.

## Where it is published {#where-published}

The packages, the container image and the source are listed on [Install](/qorel/install#where-published). The example config is `packaging/config.example.toml` in [qorechain/QORel](https://github.com/qorechain/QORel).

## Limits and known issues {#limits}

- **Not a validator duty.** Relaying is optional and separate from validating; a stopped relayer does not affect consensus.
- **One process per key.** Rolling updates that start a second pod on the same key break the account sequence; the example uses `Recreate`.
- **Manual registration.** `keys register-pqc` is a one-time manual step; the Kubernetes init container only rebuilds the keys.
- **Testnet only.** There is no mainnet channel to relay yet.
