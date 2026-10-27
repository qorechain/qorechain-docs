---
slug: /qorel/whats-new
title: Novedades de QORel
sidebar_label: Novedades
sidebar_position: 2
---

# Novedades de QORel

Esta página enumera lo que añade cada versión de QORel. Está dirigida a operadores que deciden si pasar desde Hermes, o desde una versión anterior de QORel, y solo expone lo que hace una versión, como comportamiento comprobable. QORel se basa en Hermes 1.13.3 (Informal Systems, Apache-2.0); cada cambio de abajo se suma a esa base. Todo lo que no figura aquí se comporta como en Hermes.

## 0.1.0 {#v0-1-0}

Primera versión. Solo testnet. La [página de versiones](https://github.com/qorechain/QORel/releases) tiene los archivos.

### Innovaciones {#innovations}

- **Firma híbrida poscuántica para QoreChain.** Define `signing = 'qorechain-hybrid'` en una cadena y QORel añade la firma ML-DSA-87 (`/qorechain.pqc.v1.PQCHybridSignature`) como la única opción de extensión crítica de cada transacción, y después firma el cuerpo final con secp256k1. El mensaje que firma la clave poscuántica son los bytes de firma de la versión 2, que verifican ambas redes de QoreChain. Las `extension_options` estáticas no se pueden combinar con este modo, y la configuración se rechaza si las hay.
- **La firma estándar no cambia.** Con `signing = 'standard'` (el valor por defecto) el formato de transacción es idéntico byte a byte al de Hermes, para Cosmos Hub, Osmosis y cualquier otra cadena de Cosmos SDK.
- **El crate `qorel-signer`.** La primitiva poscuántica (`PqSigner`, con `MlDsa87Signer`), las reglas de la cadena (`SignBytesFramer`) y el firmante de extensiones que invoca el relayer (`TxExtensionSigner`) son interfaces separadas. La simulación de gas y el dimensionamiento de lotes pasan por la misma ruta, de modo que los aproximadamente 4,7 KB adicionales y el gas de verificación siempre se cuentan.
- **`qorel keys add` deriva la clave poscuántica.** En una cadena híbrida deriva la clave ML-DSA-87 de la misma mnemónica y cuenta con la derivación de cartera de QoreChain y guarda solo su semilla de 32 bytes, junto a la clave, como `<key name>.pqc`. No se imprime nada secreto.
- **`qorel keys register-pqc`.** Envía `MsgRegisterPQCKeyV2` una sola vez, con una prueba de posesión en las redes con v3.2.3 o posterior. Es idempotente (no se envía nada si la misma clave ya está registrada) y se niega a enviar cuando la cuenta ya tiene una clave distinta. `--no-proof` existe solo para redes anteriores a v3.2.3.
- **`qorel keys pqc-status`.** Imprime si la clave está registrada, si coincide con la clave local, si se demostró la posesión, qué bytes de firma verifica la cadena y `ready_to_relay`.
- **Comprobación de seguridad previa al envío.** Antes de cada transacción a una cadena híbrida, QORel comprueba que la clave está cargada, registrada e idéntica a la local, y que se conoce la versión de los bytes de firma. Con `pqc.sign_bytes = 'auto'` lee la versión de los registros de actualizaciones aplicadas de la cadena, la vuelve a leer cada minuto y tras cualquier rechazo con codespace `pqc` código 21. Ante cualquier fallo no se envía nada y no se gasta comisión; `health-check` informa del motivo.
- **Precio del gas según el mercado de comisiones.** `dynamic_gas_price.backend = 'cosmos-evm-feemarket'` lee la comisión base de QoreChain, que tiene un mínimo de 0,1 uqor por unidad de gas.
- **Detección de comportamientos indebidos en cadenas con ibc-go v10.** QORel lee la cabecera de la transacción `MsgUpdateClient` porque ibc-go v10 ya no la incluye en los eventos `update_client`. Hermes 1.13 estándar desactiva la detección en estas cadenas.
- **Los workers de paquetes sobreviven a los límites de peticiones.** Los workers siguen activos mientras un intento de relé o de despeje ha fallado y reintentan en cada intervalo de despeje. En Hermes un worker también se detiene tras `clear_interval x 5` bloques sin eventos IBC nuevos, incluso cuando la última ronda de despeje falló, así que un paquete pendiente en ese momento esperaba al siguiente paquete del canal o a un reinicio.
- **Archivos de clave solo para el propietario.** Hermes escribía los archivos de clave con el umask por defecto. QORel escribe `<key name>.json` y `<key name>.pqc` con modo 0600. Las claves añadidas por un Hermes anterior conservan su modo antiguo; compruébalas con `ls -l`.
- **Un binario `qorel`.** Un único binario, `qorel`, con el conjunto de comandos de Hermes más los comandos de claves poscuánticas. Del árbol de código fuente también se compila un binario `hermes` con la misma CLI.
- **Versiones con procedencia verificable.** Tarballs para Linux y macOS, paquetes `.deb` y `.rpm` con una unidad de systemd reforzada, una fórmula de Homebrew y una imagen de contenedor multiarquitectura firmada con cosign. Los archivos de la versión incluyen `SHA256SUMS` y atestaciones de compilación. Consulta [Instalación](/qorel/install).
- **Una prueba en devnet local.** El repositorio incluye `scripts/qorel-devnet/`, que construye en local un nodo de QoreChain y una cadena de prueba con ibc-go v10 y ejecuta una prueba de extremo a extremo de ICS-20 en ambos sentidos: registro de claves, creación de cliente, conexión y canal, transferencias en ambos sentidos, devolución de un token transferido, un paquete caducado despejado y reembolsado, y una transferencia enviada por el propio QORel.

### Probado en la testnet {#proven-on-the-testnet}

- El primer canal IBC de la testnet de QoreChain, `transfer/channel-0` en `qorechain-diana` hacia `channel-600` en la testnet pública de Cosmos Hub (chain ID `provider`), lo retransmite QORel. Los clientes son `07-tendermint-0` y `07-tendermint-466`, las conexiones `connection-0` y `connection-315`.
- Se probaron transferencias en ambos sentidos (1 QOR de salida, 0,1 ATOM de entrada, 0,4 QOR devueltos) y el reembolso automático de una transferencia con un timeout de 1 segundo mediante un mensaje de timeout. Las 13 transacciones del relayer en `qorechain-diana` tuvieron éxito.
- La vista de lectura del canal está en [Transferencia de activos](/user-guide/bridging-assets#ibc-test-channel).

### No incluido en esta versión {#not-in-this-release}

- Relé de IBC v2. Todavía no está implementado en QORel y es la siguiente fase.
- Relé de Ethereum (Eureka). No iniciado.
- Relé en mainnet. Todavía no hay ningún canal IBC de mainnet abierto.
- Una compilación para Windows.
- El crate `qorel-signer` en crates.io. La publicación está bloqueada; el crate está en el repositorio en `crates/qorel-signer`, así que usa una dependencia de git.

## Actualización {#upgrading}

No hay ninguna versión anterior de QORel. Para pasar de Hermes 1.13 a QORel 0.1.0:

1. Instala `qorel` junto a `hermes` o en su lugar ([Instalación](/qorel/install)).
2. Conserva tu `config.toml`. Las cadenas sin `signing` siguen con la firma estándar y se comportan como antes.
3. Cambia el nombre del comando en tus archivos de servicio de `hermes` a `qorel`. La carpeta del almacén de claves (`~/.hermes/keys` por defecto) no cambia, y por eso la imagen de contenedor monta sus datos en `/home/nonroot/.hermes`.
4. Comprueba el modo de los archivos de clave con `ls -l`; las claves nuevas son 0600, las antiguas conservan su modo.

Las notas de actualización de Hermes en el `UPGRADING.md` del repositorio se aplican a quien venga de una versión de Hermes anterior a la 1.6.
