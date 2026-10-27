---
slug: /qorel/quickstart
title: Inicio rápido de QORel
sidebar_label: Inicio rápido
sidebar_position: 4
---

# Inicio rápido

Esta guía recorre el relé entre la testnet de QoreChain `qorechain-diana` y la testnet pública de Cosmos Hub (chain ID `provider`): instalar, configurar, añadir y registrar claves, comprobar que todo está listo, arrancar el relayer y enviar una primera transferencia. Está dirigida a quien nunca ha ejecutado un relayer. Todo lo de aquí es testnet; los tokens no tienen valor.

## Innovaciones {#innovations}

- **El estado listo es un único campo.** `qorel keys pqc-status` termina en `ready_to_relay`. Si es `true`, la clave poscuántica está registrada en la cadena y coincide con la clave local, y el relayer no rechazará sus propias transacciones por ese motivo.
- **No se envía nada cuando algo va mal.** La comprobación previa al envío detiene una transacción defectuosa antes de que llegue a la cadena, de modo que un paso omitido no cuesta comisión.
- **El mismo flujo para cada cadena.** Los pasos del lado de Cosmos Hub son los propios de Hermes; solo la entrada de cadena de QoreChain y el paso de registro son nuevos.

## Cómo se usa {#how-to-use}

### 1. Instalar {#step-install}

Instala `qorel` con cualquier método de la página [Instalación](/qorel/install) y compruébalo:

```bash
qorel --version
```

### 2. Obtener la configuración {#step-config}

Copia la configuración de ejemplo del repositorio (`packaging/config.example.toml`; los `.deb` y `.rpm` la colocan en `/etc/qorel/config.example.toml`):

```bash
mkdir -p ~/.hermes
curl -o ~/.hermes/config.toml https://raw.githubusercontent.com/qorechain/QORel/main/packaging/config.example.toml
```

Abre `~/.hermes/config.toml` y sustituye los marcadores de posición del nodo de QoreChain (`YOUR-QORECHAIN-NODE`) por las direcciones RPC, gRPC y WebSocket de un nodo de testnet que ejecutes tú. QoreChain no tiene un endpoint gRPC público, así que necesitas tu propio nodo; consulta [Ejecutar un nodo](/developer-guide/running-a-node) y [Conectarse a la testnet](/getting-started/connecting-to-testnet). Cada ajuste se explica en [Configuración](/qorel/configuration).

La configuración de ejemplo tiene dos cadenas: `qorechain-diana` con `signing = 'qorechain-hybrid'`, y `provider` con la firma estándar por defecto. Limita el relé a `transfer/channel-0` en QoreChain y a `transfer/channel-600` en la testnet de Hub.

### 3. Crear y fondear las cuentas del relayer {#step-accounts}

Crea una cuenta nueva para el relayer en cada cadena. Usa una cuenta dedicada, nunca la clave de operador de un validador. Guarda la mnemónica de cada cuenta en un archivo que solo tú puedas leer:

```bash
umask 077
nano ./diana.mnemonic       # paste the mnemonic, save
nano ./provider.mnemonic
```

La misma mnemónica puede servir para ambas cadenas, o puedes usar una distinta para cada una. QORel deriva con coin type 118 (`m/44'/118'/0'/0/0`) por defecto; pasa `--hd-path` a `keys add` si tu cuenta usa otra ruta.

Añade las claves:

```bash
qorel keys add --chain qorechain-diana --key-name relayer --mnemonic-file ./diana.mnemonic
qorel keys add --chain provider        --key-name relayer --mnemonic-file ./provider.mnemonic
```

En `qorechain-diana`, `keys add` también deriva la clave ML-DSA-87 de la misma mnemónica y guarda su semilla junto a la clave como `relayer.pqc`. Elimina los archivos de mnemónica cuando termines.

Después fondea las cuentas. Muestra las direcciones con `qorel keys list --chain <id>`. El QOR de testnet se obtiene en el [Faucet del panel](/dashboard/faucet); los tokens de prueba de la testnet de Hub se obtienen en el faucet público de esa red. Bastan unos pocos tokens para las comisiones: el mínimo de QoreChain es 0,1 uqor por unidad de gas, así que una transacción con el límite de gas por defecto de 400.000 cuesta unos 40.000 uqor al precio mínimo. Compruébalo con:

```bash
qorel keys balance --chain qorechain-diana
qorel keys balance --chain provider
```

### 4. Registrar la clave poscuántica {#step-register}

QoreChain solo acepta una transacción con firma híbrida de una cuenta que haya registrado su clave pública ML-DSA-87. El registro se hace una sola vez:

```bash
qorel keys register-pqc --chain qorechain-diana
```

Envía una transacción, firmada solo con la clave clásica (el único tipo de transacción que QoreChain acepta de esa forma), con una prueba de posesión. Es seguro volver a ejecutarlo: si la misma clave ya está registrada, no envía nada. Si la cuenta ya tiene registrada una clave poscuántica distinta, se niega y no envía nada.

Comprueba que todo está listo:

```bash
qorel keys pqc-status --chain qorechain-diana
```

El resultado es un objeto JSON con los campos `chain_id`, `account`, `local_public_key_sha256`, `registered`, `matches_local_key`, `registered_public_key_sha256`, `possession_proven`, `sign_bytes` y `ready_to_relay`. Continúa solo cuando `ready_to_relay` sea `true`. Consulta [Solución de problemas](/qorel/troubleshooting) si no lo es.

### 5. Comprobación de estado {#step-health}

```bash
qorel health-check
```

Comprueba la configuración y la conexión con cada cadena, e informa de un multiplicador de gas inferior a 1.1 en una entrada de QoreChain como una posible configuración errónea (un aviso; el relé sigue funcionando).

### 6. Elegir el canal {#step-channel}

La testnet ya tiene un canal de transferencia: `channel-0` en `qorechain-diana`, cuya contraparte es `channel-600` en `provider` ([El canal de prueba](/user-guide/bridging-assets#ibc-test-channel)). Para retransmitirlo, ve directamente al paso 7.

Para crear en su lugar un canal propio entre las dos cadenas:

```bash
qorel create channel \
  --a-chain qorechain-diana --b-chain provider \
  --a-port transfer --b-port transfer \
  --new-client-connection
```

`--new-client-connection` también crea los dos clientes ligeros y la conexión. Esto envía varias transacciones en cada cadena. El comando imprime los identificadores del nuevo canal; colócalos en el `packet_filter` de ambas entradas de cadena.

### 7. Arrancar el relayer {#step-start}

```bash
qorel start
```

Déjalo en marcha (usa el servicio de systemd o un contenedor para un relayer de larga duración; consulta [Ejecución junto a un validador](/qorel/running-next-to-a-validator)). QORel retransmite paquetes, actualiza los clientes ligeros y vigila los comportamientos indebidos.

### 8. Enviar una primera transferencia {#step-transfer}

En una segunda terminal, envía 1000 uqor de QoreChain a la testnet de Hub. QORel firma y envía esta transacción él mismo, con la misma firma híbrida:

```bash
qorel tx ft-transfer \
  --src-chain qorechain-diana --dst-chain provider \
  --src-port transfer --src-channel channel-0 \
  --amount 1000 --denom uqor \
  --timeout-seconds 600 \
  --receiver <a cosmos address on the Hub testnet>
```

Sin `--receiver`, los tokens van a la propia dirección del relayer en la cadena de destino. Después sigue el paquete:

```bash
qorel query packet pending --chain qorechain-diana --port transfer --channel channel-0
```

El paquete figura en la lista hasta que el relayer en marcha lo entrega y la confirmación (acknowledgement) regresa. En QoreChain también puedes leer el canal y las trazas de tokens por REST:

```bash
curl -s https://api-testnet.qore.host/ibc/core/channel/v1/channels
curl -s https://api-testnet.qore.host/ibc/apps/transfer/v1/denoms
```

Una transferencia que no se entrega antes de su timeout se reembolsa al remitente en la cadena de origen mediante el relayer. El valor de `--timeout-seconds` de arriba le da diez minutos.

## Cómo acceder {#how-to-access}

- **Red.** Solo la testnet `qorechain-diana` y la testnet pública de Cosmos Hub.
- **Necesitas.** QORel, un nodo de testnet de QoreChain que ejecutes tú (RPC, gRPC y WebSocket), endpoints accesibles para la testnet de Hub, una cuenta de relayer con fondos en cada cadena y la mnemónica de cada una en un archivo.
- **Costes.** Comisiones solo en tokens de prueba: en QoreChain, el gas por un precio con un mínimo de 0,1 uqor por unidad de gas, sin reembolso del gas no utilizado.
- **Usuarios de contenedor.** Ejecuta cada comando anterior como `docker run --rm -v $HOME/.qorel:/home/nonroot/.hermes ghcr.io/qorechain/qorel:0.1.0 <command>`, con los archivos de mnemónica dentro del directorio montado, y `start` como contenedor de larga duración ([Instalación](/qorel/install#container)).

## Dónde se publica {#where-published}

El binario y la configuración de ejemplo proceden del [repositorio de QORel](https://github.com/qorechain/QORel) (`packaging/config.example.toml`); consulta [Instalación](/qorel/install) para ver todos los canales y la [descripción general de QORel](/qorel/overview#where-published) para ver las versiones.

## Límites y problemas conocidos {#limits}

- **Solo testnet.** El IBC de mainnet no está abierto; no apuntes este flujo a mainnet.
- **Necesitas tu propio nodo de QoreChain.** No hay un endpoint gRPC público.
- **Un canal nuevo cuesta comisiones en ambas cadenas** y añade un cliente y una conexión. Prefiere retransmitir `channel-0` salvo que necesites uno propio.
- **Los endpoints públicos del lado de Hub pueden limitar las peticiones.** QORel sigue reintentando, pero para un relé estable usa tus propios nodos.
- **Pendiente hasta que se retransmite.** Si no hay un relayer en marcha para el canal, una transferencia queda pendiente hasta que se arranque uno o el paquete caduque.

Siguiente: [Configuración](/qorel/configuration), [Monitorización](/qorel/monitoring), [Solución de problemas](/qorel/troubleshooting).
