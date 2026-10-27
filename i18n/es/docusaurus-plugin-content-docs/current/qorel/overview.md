---
slug: /qorel/overview
title: Descripción general de QORel
sidebar_label: Descripción general
sidebar_position: 1
---

# QORel

QORel es el relayer IBC de QoreChain. Un relayer es el programa que lleva paquetes IBC, pruebas y actualizaciones de cliente entre dos cadenas; sin uno en marcha, una transferencia por un canal IBC queda pendiente. QORel está pensado para operadores, validadores y equipos que quieren ejecutar el relé de un canal de QoreChain, y para cualquiera que necesite un relayer capaz de enviar transacciones a QoreChain.

QoreChain exige una firma híbrida poscuántica (secp256k1 más ML-DSA-87, FIPS 204) en cada transacción del carril nativo, y un relayer estándar no la produce, por lo que QoreChain rechaza sus transacciones. QORel añade esa firma para QoreChain y firma de la forma estándar cualquier otra cadena de Cosmos SDK. Es un único binario, `qorel`, publicado bajo Apache-2.0. Es un fork de [Hermes](https://github.com/informalsystems/hermes) 1.13.3, el relayer IBC escrito por Informal Systems (Apache-2.0); el mérito del motor del relayer es suyo, y QORel conserva los comandos y la configuración de Hermes para toda cadena que no necesite la firma adicional.

QORel 0.1.0 es **solo para testnet**. Ha retransmitido entre la testnet de QoreChain `qorechain-diana` y la testnet pública de Cosmos Hub (chain ID `provider`). El IBC de mainnet aún no está abierto; el soporte para mainnet llegará más adelante, cuando se abra allí un canal.

## Innovaciones {#innovations}

- **Modo de firma por cadena.** Cada cadena de la configuración tiene `signing`. `'qorechain-hybrid'` añade la firma ML-DSA-87 que verifica QoreChain. El valor por defecto, `'standard'`, produce transacciones idénticas byte a byte a las de Hermes, de modo que el mismo proceso de QORel retransmite QoreChain y el lado de Cosmos Hub a la vez.
- **Una capa de firmantes conectable.** El crate `qorel-signer` define como piezas separadas una primitiva poscuántica, las reglas de bytes de firma de una cadena y un firmante de extensiones de transacción. El relayer lo invoca cuando la información de autenticación (auth info) es definitiva y antes de construir el documento de firma clásico, y la simulación de gas pasa por la misma ruta. Una cadena con una firma adicional diferente necesita un nuevo framer en ese crate, no un cambio en el relayer. Consulta [Firmar desde cualquier lenguaje](/qorel/signing-from-any-language) para ver el contrato.
- **Gestión de claves poscuánticas en los comandos de claves.** `qorel keys add` deriva la clave ML-DSA-87 de la misma mnemónica que la cuenta, con la derivación de cartera de QoreChain, de modo que la clave del relayer coincide con la que derivarían QoreX o el SDK. `qorel keys register-pqc` registra la clave pública una vez, con una prueba de posesión. `qorel keys pqc-status` informa de si la clave está lista.
- **Una comprobación antes de cada envío.** Antes de cada transacción a una cadena híbrida, QORel confirma que la clave poscuántica está registrada en la cadena y es la misma que guarda localmente, y lee de la cadena la versión de los bytes de firma. Si algo falla, no envía nada, de modo que no se gasta comisión en una transacción que la cadena rechazaría.
- **Precio del gas a partir del mercado de comisiones de QoreChain.** `dynamic_gas_price.backend = 'cosmos-evm-feemarket'` lee la comisión base de la cadena (mínimo de 0,1 uqor por unidad de gas) en lugar de usar una estimación fija.
- **Detección de comportamientos indebidos en cadenas con ibc-go v10.** ibc-go v10 ya no incluye la cabecera en los eventos `update_client`, y Hermes 1.13 estándar desactiva la detección de comportamientos indebidos en esas cadenas. QORel lee en su lugar la cabecera de la transacción `MsgUpdateClient`, de modo que la detección sigue funcionando.
- **Resiliencia ante endpoints con límite de peticiones.** Los workers de paquetes siguen activos y reintentan en cada intervalo de despeje mientras un intento de relé o de despeje ha fallado, por ejemplo después de que un endpoint público responda brevemente `429`. Solo se detienen por inactividad después de que una ronda de despeje tenga éxito.
- **Archivos de clave solo para el propietario.** Los archivos de clave, incluida la semilla poscuántica almacenada, se escriben con modo 0600.
- **Probado en una red real.** El primer canal IBC de la testnet de QoreChain, `transfer/channel-0` en `qorechain-diana` hacia `channel-600` en la testnet pública de Cosmos Hub, lo retransmite QORel. Se probaron transferencias en ambos sentidos, así como la devolución de un token transferido y el reembolso automático de una transferencia caducada. Consulta [El canal de prueba](/user-guide/bridging-assets#ibc-test-channel).

La lista completa de cada versión está en [Novedades](/qorel/whats-new).

## La conexión en vivo de la testnet {#testnet-connection}

| | `qorechain-diana` | Testnet pública de Cosmos Hub (`provider`) |
|---|---|---|
| Cliente ligero | `07-tendermint-0` | `07-tendermint-466` |
| Conexión | `connection-0` | `connection-315` |
| Canal | `transfer/channel-0` (`STATE_OPEN`, sin orden, versión `ics20-1`) | `transfer/channel-600` |

En esta conexión existen dos trazas de token. ATOM en la testnet de QoreChain es `ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2` (traza `transfer/channel-0/uatom`). QOR en la testnet del Hub es `ibc/BB4D5A9372637A885CC895F775B38B127354A31F3E20D8F6FB3997E34BF4AA4A` (traza `transfer/channel-600/uqor`). Hay abierta, sin fusionar, una pull request del chain-registry que añade esta ruta ([cosmos/chain-registry#8086](https://github.com/cosmos/chain-registry/pull/8086)). La mainnet no tiene ningún canal IBC.

Lo que se probó: transferencias en ambos sentidos (1 QOR de salida, 0,1 ATOM de entrada, 0,4 QOR devueltos) y el reembolso automático de una transferencia con un timeout de 1 segundo, retransmitido como mensaje de timeout. Las 13 transacciones del relayer en `qorechain-diana` tuvieron éxito (código 0).

### Qué necesita un relayer de terceros {#third-party}

La testnet solo acepta el tipo de cliente ligero `07-tendermint` (`/ibc/core/client/v1/params` lista `allowed_clients = ["07-tendermint"]`); hoy no se puede crear ningún cliente `08-wasm`. Para abrir un canal hacia QoreChain, un relayer necesita:

- un cliente `07-tendermint` en cada lado;
- en el lado de QoreChain, cada transacción firmada de forma híbrida por una cuenta de relayer cuya clave ML-DSA-87 esté registrada. QORel lo hace; el Hermes estándar, el relayer de Go (`rly`) y ts-relayer son rechazados;
- un canal de transferencia ICS-20 con versión `ics20-1`.

Tampoco hay una lista de relayers permitidos en la configuración de cliente de IBC v2 (`/ibc/core/client/v2/config/07-tendermint-0` responde `allowed_relayers: []`). Los paquetes de IBC v2 usan timeouts absolutos en segundos Unix. QORel todavía no retransmite IBC v2.

## qorel-signer {#qorel-signer}

El firmante es un crate independiente, `qorel-signer`, en el repositorio de QORel en `crates/qorel-signer`. No está en crates.io; úsalo como dependencia de git. Lo que garantiza:

- **Cofirmante conectable.** La firma adicional de una cadena la añade un cofirmante, y las cadenas con firma estándar no usan ninguno, por lo que sus transacciones no cambian.
- **Bytes protobuf en bruto.** Trabaja con bytes codificados y no depende de ningún tipo de IBC ni del relayer.
- **Una política de cuerpo.** Rechaza los cuerpos que la cadena rechazaría: una opción de extensión crítica ya existente, la marca `unordered` o campos desconocidos.
- **Sin adivinar la versión.** Nunca recurre a los bytes de firma v1 en las redes de QoreChain antes de conocer la versión de los bytes de firma.
- **Firmas autoverificadas.** Cada firma se verifica antes de usarse.
- **Secretos protegidos.** Los secretos se ponen a cero en memoria y se ocultan en la salida de `Debug`.
- **Pruebas byte a byte.** Las pruebas reconstruyen, byte a byte, transacciones de relé que el ante handler de la cadena aceptó.

Hay un ejemplo de uso en `crates/qorel-signer/README.md` del repositorio; consulta también [Firmar desde cualquier lenguaje](/qorel/signing-from-any-language#signer-layer). El mismo gancho de firmante se ofrece al proyecto original de Hermes como [informalsystems/hermes#4435](https://github.com/informalsystems/hermes/pull/4435) (abierta, sin fusionar).

## Cómo se usa {#how-to-use}

Instala el binario, escribe una configuración con una entrada por cadena, añade una clave para cada cadena, registra la clave poscuántica en QoreChain, comprueba que todo está listo y luego arranca el relayer:

```bash
qorel keys add --chain qorechain-diana --key-name relayer --mnemonic-file ./relayer.mnemonic
qorel keys register-pqc --chain qorechain-diana
qorel keys pqc-status --chain qorechain-diana    # ready_to_relay must be true
qorel health-check
qorel start
```

Las páginas de esta sección:

| Página | Qué cubre |
|---|---|
| [Novedades](/qorel/whats-new) | Lo que 0.1.0 añade sobre Hermes |
| [Instalación](/qorel/install) | Tarballs, `.deb`, `.rpm`, Homebrew, contenedor, desde el código fuente, y cómo verificar cada uno |
| [Inicio rápido](/qorel/quickstart) | De la instalación a una primera transferencia en la testnet |
| [Configuración](/qorel/configuration) | La entrada de cadena de QoreChain, las claves, el gas y las comprobaciones de seguridad |
| [Ejecución junto a un validador](/qorel/running-next-to-a-validator) | Disposiciones con systemd, Docker Compose y Kubernetes |
| [Monitorización](/qorel/monitoring) | Telemetría, sobre qué configurar alertas |
| [Firmar desde cualquier lenguaje](/qorel/signing-from-any-language) | El contrato de la firma híbrida y las bibliotecas para cinco lenguajes |
| [Solución de problemas](/qorel/troubleshooting) | Preguntas y soluciones |

## Cómo acceder {#how-to-access}

- **Red.** Solo la testnet `qorechain-diana` (la testnet ejecuta v3.2.6). La mainnet `qorechain-vladi` no tiene ningún canal IBC abierto; consulta [Transferencia de activos](/user-guide/bridging-assets#ibc-testnet-v326) para ver lo que tiene cada red.
- **Contraparte.** La testnet pública de Cosmos Hub, chain ID `provider`, a través de `channel-600`. Cualquier otra cadena de Cosmos SDK funciona del mismo modo que la entrada `provider` de la configuración de ejemplo.
- **Endpoints.** QORel necesita un RPC de consenso, un WebSocket y un endpoint gRPC para cada cadena. La testnet de QoreChain tiene RPC público (`https://rpc-testnet.qore.host`) y REST (`https://api-testnet.qore.host`), pero hoy no tiene un endpoint gRPC público y no se promete ninguno, así que un relayer de terceros para `qorechain-diana` necesita su propio nodo de testnet ([Ejecutar un nodo](/developer-guide/running-a-node), [Conectarse a la testnet](/getting-started/connecting-to-testnet)). Los endpoints públicos que limitan las peticiones a los relayers sirven para una prueba corta, no para un relé estable.
- **Cuentas.** Una cuenta de relayer dedicada en cada cadena, con un saldo pequeño para comisiones. El QOR de testnet se obtiene en el [Faucet del panel](/dashboard/faucet); no tiene valor. Nunca uses la clave de operador de un validador.
- **Coste.** QORel es gratuito. En QoreChain una transacción cuesta el gas por el precio, con un mínimo de 0,1 uqor por unidad de gas, y la comisión completa se cobra sin reembolso.
- **Plataformas.** Linux x86_64 y arm64 (glibc 2.28 o posterior), macOS Apple Silicon e Intel, y una imagen de contenedor para todo lo demás. Windows no es compatible; usa el contenedor bajo WSL2.

## Dónde se publica {#where-published}

| Dónde | Qué | Versión |
|---|---|---|
| [GitHub: qorechain/QORel](https://github.com/qorechain/QORel) | Código fuente, incidencias y la página de versiones con tarballs, `.deb`, `.rpm`, `SHA256SUMS` y atestaciones de compilación | 0.1.0 |
| Homebrew | `brew install qorechain/tap/qorel` | 0.1.0 |
| `ghcr.io/qorechain/qorel` | Imagen de contenedor (amd64 y arm64, distroless, sin root, firmada con cosign) | 0.1.0 |
| Crate `qorel-signer` | La capa de firmantes, en el repositorio en `crates/qorel-signer`; usa una dependencia de git | No está en crates.io |

Licencia: Apache-2.0. QORel deriva de Hermes, copyright de Informal Systems Inc. y los autores de Hermes, también Apache-2.0; el archivo `NOTICE` del repositorio recoge la atribución. Consulta [Instalación](/qorel/install) para ver los comandos y cómo verificar una descarga.

Para los demás paquetes de desarrollo consulta [Paquetes para desarrolladores](/developer-tools/overview). Para saber cómo encaja IBC en la cadena consulta [Arquitectura del puente](/architecture/bridge-architecture#ibc-relayer).

## Límites y problemas conocidos {#limits}

- **Solo testnet.** QORel se ha ejecutado contra `qorechain-diana` y la testnet pública de Cosmos Hub. No ha retransmitido en mainnet, y no hay ningún canal IBC de mainnet abierto.
- **Solo IBC v1 (clásico).** El relé de IBC v2 todavía no está implementado en QORel; es la siguiente fase. El relé de Ethereum (Eureka) no se ha iniciado.
- **Versión de la cadena.** El modo híbrido sigue la versión de los bytes de firma que informa la cadena. Ambas redes de QoreChain verifican hoy la forma actual (versión 2).
- **Sin relayer alojado.** Este manual no ofrece un servicio de relayer. Si no hay un relayer en marcha para un canal, una transferencia queda pendiente hasta que lo haya.
- **Endpoints públicos.** El lado de QoreChain necesita gRPC, que no es público. Los endpoints públicos de terceros para otras cadenas suelen limitar las peticiones a los relayers.
- **No es una cartera.** QORel firma solo las transacciones que envía como relayer. Para la firma en carteras consulta [QoreSign](/qoresign/overview).
- **Sin compilación para Windows.** Usa el contenedor bajo WSL2.
- **Estado de la versión.** QORel es una versión 0.x. Los comandos y ajustes que son iguales a los de Hermes conservan el comportamiento de Hermes; los ajustes específicos de QoreChain todavía pueden cambiar antes de la 1.0.
