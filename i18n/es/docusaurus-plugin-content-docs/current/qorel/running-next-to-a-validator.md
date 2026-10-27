---
slug: /qorel/running-next-to-a-validator
title: Ejecutar QORel junto a un validador
sidebar_label: Junto a un validador
sidebar_position: 6
---

# Ejecutar QORel junto a un validador

Los validadores suelen retransmitir los canales de su propia cadena. QORel puede ejecutarse en el host del validador, como contenedor sidecar o en Kubernetes. Esta página ofrece las tres disposiciones y las reglas que mantienen al relayer aislado de las claves del propio validador. Está dirigida a operadores de validadores y de nodos. Para ejecutar el nodo en sí consulta [Ejecutar un validador](/developer-guide/running-a-validator) y [Ejecutar un nodo](/developer-guide/running-a-node).

Hoy el relé es solo para testnet: QORel se ha ejecutado contra `qorechain-diana`, y no hay ningún canal IBC de mainnet abierto.

## Innovaciones {#innovations}

- **Un servicio reforzado en el paquete.** Los `.deb` y `.rpm` instalan un `qorel.service` que se ejecuta como su propio usuario `qorel`, con un umask `0077`, sin nuevos privilegios, un `/tmp` privado, un sistema de archivos de solo lectura fuera de `/var/lib/qorel` y sin volcados de memoria (core dumps).
- **Claves solo en memoria, si quieres.** La disposición de Kubernetes reconstruye las claves al arrancar el pod a partir de un secreto en un volumen respaldado por memoria, de modo que los archivos de clave nunca tocan el disco.
- **Archivos de clave solo para el propietario.** Los archivos de clave, incluida la semilla poscuántica, tienen modo 0600.
- **Comprobaciones sobre las que puedes configurar alertas.** `qorel keys pqc-status` informa `ready_to_relay`, y la comprobación previa al envío detiene una transacción que sería rechazada antes de gastar comisión.

## Cómo se usa {#how-to-use}

### Reglas básicas {#ground-rules}

- **Usa una cuenta de relayer dedicada.** Nunca la clave de operador del validador ni la clave de consenso. Fondéala con lo que el relayer necesita para las comisiones.
- **Un proceso de relayer por clave de relayer.** Dos procesos que firman con la misma clave se pisan los números de secuencia de la cuenta.
- **Retransmite solo tus canales.** Define un `packet_filter`.
- **Apunta QORel al nodo local.** Usa `http://127.0.0.1:26657`, `http://127.0.0.1:9090` y `ws://127.0.0.1:26657/websocket`, y mantén esos puertos cerrados a internet. Esto también le da al relayer el endpoint gRPC que no está disponible públicamente.
- **En QoreChain**, registra la clave poscuántica del relayer una vez con `qorel keys register-pqc`, y comprueba `qorel keys pqc-status` antes de arrancar.

### 1. systemd en el host del validador {#systemd}

1. Instala el paquete `.deb` o `.rpm` ([Instalación](/qorel/install#packages)). Crea un usuario de sistema `qorel`, distinto del usuario del validador, y un `qorel.service` reforzado.
2. Edita `/etc/qorel/config.toml` con los endpoints del nodo local.
3. Añade la clave del relayer como usuario `qorel` y registra la clave poscuántica:

   ```bash
   sudo -u qorel qorel --config /etc/qorel/config.toml keys add --chain qorechain-diana --key-name relayer --mnemonic-file <file>
   sudo -u qorel qorel --config /etc/qorel/config.toml keys register-pqc --chain qorechain-diana
   sudo -u qorel qorel --config /etc/qorel/config.toml keys pqc-status --chain qorechain-diana
   ```

4. Ejecuta `systemctl enable --now qorel`.
5. Dale a QORel menor prioridad que al nodo, para que nunca compita con la producción de bloques:

   ```ini
   # /etc/systemd/system/qorel.service.d/priority.conf
   [Service]
   Nice=10
   CPUWeight=20
   MemoryMax=1G
   ```

   Después `systemctl daemon-reload && systemctl restart qorel`.

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

Añade las claves una vez con la misma imagen, por ejemplo:

```bash
docker run --rm -v $PWD/qorel:/home/nonroot/.hermes ghcr.io/qorechain/qorel:0.1.0 \
  keys add --chain qorechain-diana --key-name relayer --mnemonic-file /home/nonroot/.hermes/relayer.mnemonic
docker run --rm --network host -v $PWD/qorel:/home/nonroot/.hermes ghcr.io/qorechain/qorel:0.1.0 \
  keys register-pqc --chain qorechain-diana
```

Elimina después el archivo de la mnemónica.

### 3. Kubernetes {#kubernetes}

Guarda la mnemónica en tu almacén de secretos y reconstruye las claves al arrancar:

1. Un contenedor init ejecuta `qorel keys add` en un `emptyDir` con `medium: Memory` (registra la clave poscuántica una vez, a mano, de antemano).
2. El contenedor principal ejecuta `qorel start` sobre el mismo volumen.

De ese modo las claves existen solo en memoria.

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

El `key_store_folder` de la configuración debe apuntar a `/home/nonroot/.hermes/keys` (o dejarse sin definir).

### Monitorización {#monitoring}

Activa la telemetría y configura alertas sobre los paquetes pendientes, los saldos del relayer, el estado de la clave poscuántica y la frescura de los clientes. La lista está en [Monitorización](/qorel/monitoring).

## Cómo acceder {#how-to-access}

- **Red.** Testnet `qorechain-diana`. El relayer se conecta a los puertos locales de tu propio nodo y a los endpoints de la otra cadena.
- **Cuentas.** Una cuenta de relayer dedicada en cada cadena, con fondos para comisiones; nunca la clave de operador del validador.
- **Host.** Linux con systemd para la disposición 1; Docker con red de host para la disposición 2; un clúster con un `emptyDir` respaldado por memoria para la disposición 3.
- **Coste.** Solo comisiones. Los ejemplos anteriores limitan el relayer a 1 CPU y 1 GiB de memoria.

## Dónde se publica {#where-published}

Los paquetes, la imagen de contenedor y el código fuente figuran en [Instalación](/qorel/install#where-published). La configuración de ejemplo es `packaging/config.example.toml` en [qorechain/QORel](https://github.com/qorechain/QORel).

## Límites y problemas conocidos {#limits}

- **No es una obligación del validador.** El relé es opcional y independiente de validar; un relayer detenido no afecta al consenso.
- **Un proceso por clave.** Las actualizaciones progresivas que arrancan un segundo pod con la misma clave rompen la secuencia de la cuenta; el ejemplo usa `Recreate`.
- **Registro manual.** `keys register-pqc` es un paso manual único; el contenedor init de Kubernetes solo reconstruye las claves.
- **Solo testnet.** Todavía no hay ningún canal de mainnet que retransmitir.
