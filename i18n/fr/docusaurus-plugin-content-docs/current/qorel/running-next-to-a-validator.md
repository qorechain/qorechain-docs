---
slug: /qorel/running-next-to-a-validator
title: Exécuter QORel à côté d'un validateur
sidebar_label: À côté d'un validateur
sidebar_position: 6
---

# Exécuter QORel à côté d'un validateur

Les validateurs relaient souvent les canaux de leur propre chaîne. QORel peut tourner sur l'hôte du validateur, dans un conteneur sidecar ou dans Kubernetes. Cette page présente les trois dispositions et les règles qui maintiennent le relayeur isolé des propres clés du validateur. Elle s'adresse aux opérateurs de validateurs et de nœuds. Pour exécuter le nœud lui-même, voir [Exécuter un validateur](/developer-guide/running-a-validator) et [Exécuter un nœud](/developer-guide/running-a-node).

Le relais est aujourd'hui réservé au testnet : QORel a été exécuté sur `qorechain-diana`, et aucun canal IBC du mainnet n'est ouvert.

## Innovations {#innovations}

- **Un service durci dans le paquet.** Les `.deb` et `.rpm` installent un `qorel.service` qui s'exécute sous son propre utilisateur `qorel`, avec un umask `0077`, aucun nouveau privilège, un `/tmp` privé, un système de fichiers en lecture seule en dehors de `/var/lib/qorel`, et aucun core dump.
- **Des clés uniquement en mémoire, si vous le souhaitez.** La disposition Kubernetes reconstruit les clés au démarrage du pod à partir d'un secret dans un volume en mémoire, de sorte que les fichiers de clés ne touchent jamais le disque.
- **Fichiers de clés réservés au propriétaire.** Les fichiers de clés, y compris la graine post-quantique, ont le mode 0600.
- **Des contrôles sur lesquels alerter.** `qorel keys pqc-status` indique `ready_to_relay`, et la vérification avant envoi arrête une transaction qui serait refusée avant qu'un frais soit dépensé.

## Utilisation {#how-to-use}

### Règles de base {#ground-rules}

- **Utilisez un compte de relayeur dédié.** Jamais la clé d'opérateur du validateur ni la clé de consensus. Approvisionnez-le avec ce dont le relayeur a besoin pour les frais.
- **Un seul processus relayeur par clé de relayeur.** Deux processus qui signent avec la même clé se disputent les numéros de séquence du compte.
- **Ne relayez que vos canaux.** Définissez un `packet_filter`.
- **Pointez QORel vers le nœud local.** Utilisez `http://127.0.0.1:26657`, `http://127.0.0.1:9090` et `ws://127.0.0.1:26657/websocket`, et gardez ces ports fermés à Internet. Cela donne aussi au relayeur le point d'accès gRPC qui n'est pas disponible publiquement.
- **Sur QoreChain**, enregistrez une seule fois la clé post-quantique du relayeur avec `qorel keys register-pqc`, et vérifiez `qorel keys pqc-status` avant de démarrer.

### 1. systemd sur l'hôte du validateur {#systemd}

1. Installez le paquet `.deb` ou `.rpm` ([Installation](/qorel/install#packages)). Il crée un utilisateur système `qorel`, distinct de celui du validateur, et un `qorel.service` durci.
2. Modifiez `/etc/qorel/config.toml` avec les points d'accès du nœud local.
3. Ajoutez la clé du relayeur en tant qu'utilisateur `qorel`, et enregistrez la clé post-quantique :

   ```bash
   sudo -u qorel qorel --config /etc/qorel/config.toml keys add --chain qorechain-diana --key-name relayer --mnemonic-file <file>
   sudo -u qorel qorel --config /etc/qorel/config.toml keys register-pqc --chain qorechain-diana
   sudo -u qorel qorel --config /etc/qorel/config.toml keys pqc-status --chain qorechain-diana
   ```

4. Exécutez `systemctl enable --now qorel`.
5. Donnez à QORel une priorité inférieure à celle du nœud, afin qu'il n'entre jamais en concurrence avec la production de blocs :

   ```ini
   # /etc/systemd/system/qorel.service.d/priority.conf
   [Service]
   Nice=10
   CPUWeight=20
   MemoryMax=1G
   ```

   Puis `systemctl daemon-reload && systemctl restart qorel`.

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

Ajoutez les clés une fois avec la même image, par exemple :

```bash
docker run --rm -v $PWD/qorel:/home/nonroot/.hermes ghcr.io/qorechain/qorel:0.1.0 \
  keys add --chain qorechain-diana --key-name relayer --mnemonic-file /home/nonroot/.hermes/relayer.mnemonic
docker run --rm --network host -v $PWD/qorel:/home/nonroot/.hermes ghcr.io/qorechain/qorel:0.1.0 \
  keys register-pqc --chain qorechain-diana
```

Supprimez ensuite le fichier de phrase mnémonique.

### 3. Kubernetes {#kubernetes}

Conservez la phrase mnémonique dans votre magasin de secrets et reconstruisez les clés au démarrage :

1. Un init container exécute `qorel keys add` dans un `emptyDir` avec `medium: Memory` (enregistrez la clé post-quantique une seule fois, à la main, au préalable).
2. Le conteneur principal exécute `qorel start` sur le même volume.

Ainsi, les clés n'existent qu'en mémoire.

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

Le `key_store_folder` de la configuration doit pointer vers `/home/nonroot/.hermes/keys` (ou rester non défini).

### Surveillance {#monitoring}

Activez la télémétrie et configurez des alertes sur les paquets en attente, les soldes du relayeur, l'état de la clé post-quantique et la fraîcheur des clients. La liste figure sur [Surveillance](/qorel/monitoring).

## Accès {#how-to-access}

- **Réseau.** Testnet `qorechain-diana`. Le relayeur se connecte aux ports locaux de votre propre nœud et aux points d'accès de l'autre chaîne.
- **Comptes.** Un compte de relayeur dédié sur chaque chaîne, approvisionné pour les frais ; jamais la clé d'opérateur du validateur.
- **Hôte.** Linux avec systemd pour la disposition 1 ; Docker avec réseau hôte pour la disposition 2 ; un cluster avec un `emptyDir` en mémoire pour la disposition 3.
- **Coût.** Uniquement les frais. Les exemples ci-dessus plafonnent le relayeur à 1 CPU et 1 Gio de mémoire.

## Où c'est publié {#where-published}

Les paquets, l'image de conteneur et les sources sont listés sur [Installation](/qorel/install#where-published). La configuration d'exemple est `packaging/config.example.toml` dans [qorechain/QORel](https://github.com/qorechain/QORel).

## Limites et problèmes connus {#limits}

- **Pas une tâche de validateur.** Le relais est facultatif et distinct de la validation ; un relayeur arrêté n'affecte pas le consensus.
- **Un processus par clé.** Les mises à jour progressives qui démarrent un second pod sur la même clé cassent la séquence du compte ; l'exemple utilise `Recreate`.
- **Enregistrement manuel.** `keys register-pqc` est une étape manuelle ponctuelle ; l'init container Kubernetes ne fait que reconstruire les clés.
- **Testnet uniquement.** Il n'existe pas encore de canal du mainnet à relayer.
