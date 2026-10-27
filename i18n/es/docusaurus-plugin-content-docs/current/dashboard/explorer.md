---
slug: /dashboard/explorer
title: Explorador
sidebar_label: Explorador
sidebar_position: 2
---

# Explorador

El **Explorador** es la ventana de solo lectura hacia la cadena: consulta bloques, transacciones, direcciones y validadores, y observa la actividad de la red. Es para quien quiere comprobar una transferencia, inspeccionar una cuenta, ver qué firma protegió una transacción o examinar el conjunto de validadores. Hay dos exploradores: el que está dentro del Panel, en `dashboard.qorechain.io/explorer`, y una aplicación pública aparte en [explore.qore.network](https://explore.qore.network) que no necesita cuenta. Son aplicaciones distintas y no aplican las mismas reglas de etiquetado, por lo que esta página cubre ambas.

## Innovaciones {#innovations}

- **Una etiqueta de firma solo cuando la cadena la verificó.** En el Explorador del Panel, una transacción nativa muestra la tarjeta **PQC Verified** solo si tuvo éxito (código 0) **y** la cadena emitió un evento `pqc_hybrid_verify` con estado verificado. Una transacción fallida no recibe ninguna afirmación poscuántica.
- **Las transacciones EVM muestran la ventana que las autorizó.** Desde la altura de activación (testnet 5,920,000; mainnet 2,981,742), una transacción EVM muestra "Authorised by a PQC window", con un enlace "Window opened by" hacia la transacción nativa, firmada con ML-DSA-87, que la abrió. La ventana mostrada es la última apertura de ventana del remitente a la altura de la transacción o por debajo de ella que no ha expirado y no se ha cerrado desde entonces. Una transacción EVM nunca se etiqueta como "PQC Verified": lleva una firma secp256k1 ordinaria. Consulta [Ventana de autorización EVM](/developer-guide/evm-development#evm-window).
- **Ninguna etiqueta poscuántica por bloque.** Los bloques los firman las claves de consenso, por lo que la protección se muestra por transacción, nunca por bloque.
- **Estado poscuántico del validador, tomado de la cadena.** La página de dirección de un validador tiene un campo "Post-Quantum Crypto", leído de la cadena. **Enabled** significa que hay una clave ML-DSA-87 registrada para el operador; **N/A** significa que no se pudo leer el estado. La prueba de posesión es opcional en la cadena.
- **Una cuenta, tres vías.** El historial de una dirección `qor1...` fusiona la actividad nativa, EVM y SVM, y la página de la dirección muestra la cantidad que aún está en vesting y la fecha del próximo desbloqueo.
- **Datos de la red y endpoints en un solo panel.** ID de cadena, ID de cadena EVM, token, decimales, prefijo de dirección, tipo de moneda (coin type), precio mínimo de gas y endpoints públicos copiables, con un panel "Add QoreChain to your wallet".
- **El explorador independiente se construye solo sobre los endpoints públicos.** [explore.qore.network](https://explore.qore.network) lee los endpoints públicos de la cadena y no necesita cuenta. Su página de dirección muestra las formas `qor1`, `0x` y SVM de una misma cuenta con una comprobación de paridad en vivo (wei = uqor x 10^12; lamports = uqor x 1000), y sus rutas funcionan como enlaces profundos para monederos.

## Cómo usarlo {#how-to-use}

### Visión general

Abre **Explorer** en la barra lateral. La visión general muestra:

- el estado de la red con un chip "Post-Quantum Secured" (una etiqueta a nivel de red; la afirmación por transacción está en la página de la transacción);
- **Latest Block**, **Block Time** y **Blocks Today**;
- **Total Bonded**, **Bonded Ratio** y **Circulating**;
- **Transactions**, **Real Txs**, **Active Set** y **Total Addresses**;
- **Latest Blocks** y **Latest Transactions**, con botones de actualización y actualización automática.

Haz clic en una fila de bloque o de transacción para abrir su página.

### Búsqueda

El cuadro de búsqueda (marcador "Search QoreChain (Address, Tx, Block)...") dirige según lo que escribas:

- `qor...` abre la página de la dirección.
- `0x...` o una cadena de 64 caracteres abre la página de la transacción.
- Los dígitos abren la página del bloque.

:::note Una dirección 0x lleva a "Transaction Not Found"
La búsqueda del Panel trata la entrada `0x...` como un hash de transacción. Para consultar una dirección EVM, busca su forma `qor1...` (una dirección `0x` son los mismos 20 bytes que su forma `qor1`), o usa [explore.qore.network](https://explore.qore.network), cuya página de dirección acepta ambas.
:::

### Página de la transacción

La página de la transacción muestra el hash (con copiar), el estado y el tipo, Block Height, Interactions (From y To), Value & Fees, Memo, Gas Consumed, una fila entre cadenas cuando la hay, y **Raw Data**. También muestra qué protegió la transacción, y solo hace una afirmación que la cadena respalda:

- **PQC Verified.** Una transacción del carril nativo que tuvo éxito y cuya firma híbrida (incluida la parte ML-DSA-87) verificó la propia cadena. Una transacción fallida, o una sin firma híbrida verificada, muestra en su lugar seguridad estándar.
- **Authorised by a PQC window.** Una transacción EVM enviada mientras el remitente tenía abierta una [ventana de autorización EVM](/developer-guide/evm-development#evm-window), con el enlace **Window opened by**.

### Página del bloque

Las flechas de anterior y siguiente recorren la cadena. **Core Information** tiene la altura, el hash, el proponente, el recuento de firmas y Gas Used; le siguen **Technical Hashes** y **Block Transactions**. Los bloques no llevan etiqueta poscuántica.

### Página de la dirección

Una dirección de QoreChain es una sola cuenta con tres codificaciones, Native (`qor1...`), EVM (`0x...`) y SVM (base58), y la página de la dirección fusiona la actividad de las tres.

- **Copy address** y **Show QR Code** (una ventana emergente; no hay descarga).
- **Total Balance** y **Available**, y una línea con la cantidad que aún está en vesting y la fecha del próximo desbloqueo.
- **Total Activity** y el historial combinado (métodos como Transfer, Faucet Claim y Cross-Chain Swap).
- En la página de dirección de un validador (`/explorer/address/qorvaloper1...`), el campo **Post-Quantum Crypto**.

### Validadores {#validators}

`/explorer/validators` lista los validadores de la red. Las tarjetas de resumen muestran **Active Validators**, **Bonded Tokens** y **Consensus Health** (una etiqueta de estado, no un valor medido). La tabla tiene Rank, Validator, Voting Power, Commission, Status y PQC (la columna PQC de la tabla aparece atenuada en todas las filas; usa la página de dirección del validador para ver su estado real). El cuadro de búsqueda dice "Search validator...". La lista sigue la red seleccionada en la cabecera. Para delegar, consulta [Staking y Validadores](/dashboard/staking-and-validators); para una comparación más amplia con rendimiento e inicio de sesión, consulta [Validadores](/dashboard/validators).

### Datos de la red y añadir al monedero

La visión general incluye los datos de la cadena y los endpoints públicos, cada uno copiable, y el mismo panel **Add QoreChain to your wallet** que la página Monedero (consulta [Añadir QoreChain a tu monedero](/dashboard/wallet#add-network)).

### Explorador independiente {#standalone-explorer}

[explore.qore.network](https://explore.qore.network) es una aplicación web aparte, solo de explorador. Se abre en **mainnet** y tiene un selector **Testnet / Mainnet** en su cabecera. Rutas:

| Ruta | Qué muestra |
| --- | --- |
| `/` | Altura en vivo, estado, suministro, stake vinculado, últimos bloques y transacciones, datos de la cadena, endpoints públicos y enlaces a guías. |
| `/blocks`, `/block/{height}` | Lista de bloques y un bloque con sus transacciones. |
| `/txs`, `/tx/{hash}` | Lista de transacciones y una transacción con estado, comisión, gas, mensajes y la respuesta en bruto. |
| `/address/{qor1... or 0x...}` | La página de identidad unificada con las tres codificaciones y la comprobación de paridad. `/account/*` redirige a `/address/*`. |
| `/validators`, `/validator/{address}` | El conjunto de validadores con poder de voto y comisión, y un validador concreto. |
| `/tokens`, `/token/{denom}`, `/assets` | Listados de tokens y activos. |
| `/contracts`, `/nfts`, `/collections` | Contratos, NFT y colecciones. |

La búsqueda acepta una altura de bloque, un hash de 64 caracteres hexadecimales (con o sin `0x`), una dirección `qor1...` o `0x...`, o una dirección `qorvaloper1...`. Una búsqueda `qorvaloper1...` abre la lista de validadores, no la página de ese validador. Una sección **Add to wallet** ofrece suggestChain (Keplr, Leap, Cosmostation), EIP-3085 (MetaMask y otros monederos EVM), instrucciones de RPC personalizado para SVM y emparejamiento WalletConnect v2.

Las rutas `/tx/`, `/block/` y `/address/` funcionan con los enlaces de explorador de bloques de EIP-3085, de modo que los monederos que abren una URL de explorador llegan a la página correcta.

:::caution No uses el /api/lcd del explorador desde código
El explorador independiente tiene un proxy de solo lectura en `/api/lcd/...` que sirve sus propias páginas, y responde según la cookie de red del navegador. No es una API pública: puede cambiar, no está dimensionado para uso programático y devuelve la red que indica la cookie. Para scripts, servicios y monederos usa en su lugar los endpoints REST públicos: `https://api.qore.host` (mainnet) y `https://api-testnet.qore.host` (testnet). Consulta [Endpoints REST y gRPC](/api-reference/rest-grpc-endpoints).
:::

:::note El explorador independiente todavía no aplica las reglas de etiquetado PQC del Panel
Las reglas de [Innovaciones](#innovations) (una etiqueta poscuántica solo tras la verificación de la cadena, y la tarjeta "Authorised by a PQC window" para las transacciones EVM) están activas en el Explorador del Panel. El explorador independiente de explore.qore.network no se ha actualizado para ellas: su página de transacción muestra un marcador de firma híbrida que todavía no distingue una transacción fallida, y etiqueta las transacciones EVM con su redacción anterior. Considera las etiquetas del Explorador del Panel como la referencia.
:::

## Cómo acceder {#how-to-access}

- **Explorador del Panel:** [dashboard.qorechain.io/explorer](https://dashboard.qorechain.io/explorer). Elige la red en la cabecera. La **visión general** en mainnet requiere iniciar sesión y el [reconocimiento único](/dashboard/overview#risk-acknowledgement); la visión general en testnet y **todas las páginas de detalle** (transacción, bloque, dirección, validadores) en ambas redes se abren sin cuenta.
- **Explorador independiente:** [explore.qore.network](https://explore.qore.network). Sin cuenta, sin monedero. Usa el selector de su cabecera para testnet.
- **Coste:** gratuito. No hace falta conectar un monedero para leer nada.

## Dónde se publica {#where-published}

| Superficie | Dirección | Redes | Cuenta |
| --- | --- | --- | --- |
| Explorador del Panel | `dashboard.qorechain.io/explorer` (`/explorer/tx/<hash>`, `/explorer/block/<height>`, `/explorer/address/<address>`, `/explorer/validators`) | Mainnet y testnet, selector de la cabecera | Solo la visión general en mainnet |
| Explorador independiente | `explore.qore.network` | Mainnet (predeterminada) y selector de testnet | Ninguna |
| Datos de la cadena | `api.qore.host`, `api-testnet.qore.host` (REST), `rpc.qore.host`, `rpc-testnet.qore.host` (RPC) | Mainnet y testnet | Ninguna |

## Límites y problemas conocidos {#limits}

- **Una dirección `0x` escrita en la búsqueda del Panel** lleva a "Transaction Not Found". Usa la forma `qor1...`.
- **La columna PQC** de la tabla de validadores del Panel siempre aparece atenuada. El estado real de un validador está en su página de dirección.
- **No se muestra:** un contador de uso de ventanas por transacción, pruebas poscuánticas para bloques, ni un indicador poscuántico por validador en la tabla de validadores.
- **El explorador independiente** todavía no ha adoptado las reglas de etiquetado del Panel (ver arriba), y una búsqueda `qorvaloper1...` abre la lista de validadores.
- **El /api/lcd del explorador independiente** es para el propio sitio, no para programas.
- **La red sigue a la cabecera** en el Explorador del Panel: un hash de la otra red muestra "not found".
