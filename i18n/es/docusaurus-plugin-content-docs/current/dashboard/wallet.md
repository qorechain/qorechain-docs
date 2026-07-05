---
slug: /dashboard/wallet
title: Monedero
sidebar_label: Monedero
sidebar_position: 3
---

# Monedero

La página de **Monedero** es donde consultas tu saldo y tu historial de transacciones, recibes QOR y lo envías. El funcionamiento de la página depende de la red:

- **Mainnet — sin custodia.** El Dashboard no guarda claves de mainnet. Conectas tu propio monedero (**Keplr** para el raíl Native, **MetaMask** para el raíl EVM), tu saldo y tu historial reales se leen directamente desde la cadena, y puedes recibir fondos en cualquier raíl. Los envíos se realizan desde tu propio monedero conectado.
- **Testnet — con custodia.** El Dashboard gestiona un monedero de prueba por ti, para que puedas probar transferencias, swaps y staking sin ninguna configuración. Fóndalo desde el [Faucet](/dashboard/faucet).

Las cuentas están protegidas con criptografía resistente a la computación cuántica, y la codificación Native de cada dirección usa el prefijo bech32 `qor` (`qor1...`).

## Una cuenta, tres codificaciones {#one-account-three-encodings}

Una cuenta de QoreChain es una identidad única que puede escribirse de tres maneras — una por cada raíl de ejecución:

| Raíl | Codificación | Aspecto |
| --- | --- | --- |
| **Native QOR** | bech32 | `qor1...` |
| **EVM** | hex | `0x...` |
| **SVM** | base58 | p. ej. `5Gv7...` |

Las tres codificaciones apuntan a la **misma cuenta y al mismo saldo**. Los fondos recibidos en cualquier raíl llegan a tu único saldo, y el Dashboard indexa el saldo y el historial mediante la codificación `qor1` (Native), de modo que la actividad de todos los raíles aparece junta.

## Usa el Monedero en mainnet {#mainnet}

1. Cambia la cabecera del Dashboard a **Mainnet**.
2. Si se te solicita, acepta el [reconocimiento de riesgo único](/dashboard/overview#risk-acknowledgement) — mainnet mueve fondos reales, el Dashboard no tiene custodia y las transacciones son irreversibles.
3. Selecciona **Connect Wallet** y elige **Keplr** (raíl Native) o **MetaMask** (raíl EVM); luego aprueba la conexión en tu monedero.
4. La página carga tu saldo y tu historial de transacciones reales desde la cadena.

Si tu monedero todavía no tiene QoreChain configurado, añádelo primero — consulta [Añade QoreChain a tu monedero](#add-network).

### Envía en mainnet {#send-mainnet}

Como el Dashboard nunca guarda tus claves de mainnet, los envíos se hacen desde tu propio monedero conectado: crea la transferencia en Keplr (raíl Native) o MetaMask (raíl EVM) como lo harías en cualquier red, y fírmala allí. El Dashboard muestra la transacción en tu historial una vez que está en la cadena.

:::caution Fondos reales, transferencias irreversibles
Las transacciones de mainnet son irreversibles. Verifica siempre dos veces la dirección del destinatario en tu monedero antes de firmar.
:::

### Recibe en un raíl específico {#receive-mainnet}

1. Selecciona **Receive**.
2. En el modal de recepción, elige un raíl con el selector: **Native QOR**, **EVM** o **SVM**.
3. El modal muestra tu dirección en la codificación de ese raíl (`qor1...`, `0x...` o base58) con un código QR y un botón de copiado.
4. Copia la dirección, o deja que el remitente escanee el código QR.

Sea cual sea el raíl que use el remitente, los fondos llegan a la misma cuenta — una cuenta, tres codificaciones, un solo saldo.

### Lee tu historial de transacciones {#history}

En mainnet, cada fila de tu historial muestra:

- Una **insignia de raíl** — Native, EVM o SVM — que te indica qué raíl usó la transacción.
- Una **etiqueta real del tipo de transacción**, como *Send*, *registro de clave PQC* o *despliegue de contrato*, en lugar de una etiqueta genérica.
- El importe, la hora y el estado, con el hash de la transacción que puedes abrir en el [Explorador](/dashboard/explorer).

## Usa el Monedero en testnet {#testnet}

En testnet (`qorechain-diana`) el Dashboard gestiona un monedero de prueba por ti, para que puedas probar los flujos de principio a fin sin conectar nada.

### Qué muestra la página

- La etiqueta de tu monedero y la dirección activa, en forma abreviada, con un botón de copiado de un clic.
- Tu **saldo total** en QOR.
- Un panel de seguridad que indica el cifrado resistente a la computación cuántica y la red conectada.
- Un indicador de última actualización con un control de refresco.
- Las pestañas **Assets** y **Activity**, que muestran tus tenencias y tu historial de transacciones.

Usa el control de refresco en cualquier momento para obtener de la cadena tu saldo actual y tu actividad más reciente.

### Envía QOR (testnet)

1. Selecciona **Send**.
2. Introduce la dirección del destinatario (`qor1...`).
3. Introduce el importe y, opcionalmente, un memo.
4. Revisa los detalles y la comisión estimada, y luego confirma.

Mientras escribes un destinatario, se sugieren contactos guardados y direcciones recientes para ayudarte a evitar errores. Una vez enviada la transferencia, recibes una confirmación con el hash de la transacción, que puedes abrir en el [Explorador](/dashboard/explorer).

### Recibe QOR (testnet)

1. Selecciona **Receive**.
2. Comparte tu dirección o su código QR con el remitente, o copia la dirección con un clic.
3. Opcionalmente, introduce un importe solicitado y un memo para generar un enlace de pago y un código QR descargable.

### Gestiona tus monederos de prueba

Selecciona **My Wallets** para abrir tu lista de direcciones. Desde allí puedes cambiar entre monederos, crear un monedero nuevo, importar uno existente o eliminar un monedero que ya no necesites. El monedero activo es el que se usa para enviar, hacer swaps, hacer staking y otras acciones firmadas en todo el Dashboard en testnet.

## Añade QoreChain a tu monedero {#add-network}

La página **Add Network** muestra cuatro tarjetas lado a lado — una por cada forma de conexión — para que puedas añadir QoreChain a tu propio monedero con un clic:

| Tarjeta | Qué te ofrece |
| --- | --- |
| **Native** | Endpoints RPC y REST más el ID de cadena, cada uno con un botón de copiado — para Keplr y otros monederos del raíl Native. |
| **EVM** | Parámetros de red EIP-3085 listos para usar — un clic añade QoreChain a MetaMask y otros monederos EVM. |
| **SVM** | La URL RPC de SVM para monederos y herramientas compatibles con SVM. |
| **WalletConnect** | Un emparejamiento WalletConnect para vincular cualquier monedero compatible con WalletConnect. |

Para añadir QoreChain:

1. Abre la página **Add Network** desde el Dashboard.
2. Elige la tarjeta que corresponde al raíl de tu monedero.
3. Selecciona el botón de añadir (EVM, WalletConnect), o copia los endpoints y el ID de cadena en el formulario de añadir red de tu monedero (Native, SVM).
4. Aprueba la nueva red en tu monedero.

Los endpoints públicos son `rpc.qore.host` (RPC Native), `api.qore.host` (REST), `evm.qore.host` (JSON-RPC EVM) y `svm.qore.host` (RPC SVM), con variantes `*-testnet` (por ejemplo `rpc-testnet.qore.host`) para testnet. IDs de cadena: mainnet `qorechain-vladi` (ID de cadena EVM `9801`), testnet `qorechain-diana` (ID de cadena EVM `9800`).

## Relacionado

- [Token Operations](/user-guide/token-operations) — conceptos detrás de las transferencias y denominaciones de QOR.
- [Trade](/dashboard/trade) — intercambia tus tokens en el AMM en cadena.
- [Bridge](/dashboard/bridge) — mueve activos hacia y desde otras cadenas.
