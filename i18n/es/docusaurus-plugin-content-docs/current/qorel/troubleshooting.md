---
slug: /qorel/troubleshooting
title: Solución de problemas y preguntas frecuentes de QORel
sidebar_label: Solución de problemas
sidebar_position: 9
---

# Solución de problemas y preguntas frecuentes

Preguntas y soluciones para ejecutar QORel, en el orden en que la gente suele encontrarlas. Está dirigida a operadores con un relayer que no arranca, se niega a enviar o deja paquetes pendientes. Hoy QORel es solo para testnet, así que cada respuesta da por supuesto `qorechain-diana`.

## Innovaciones {#innovations}

La mayoría de los problemas en una cadena híbrida se detectan antes de gastar comisión:

- **La comprobación previa al envío nombra el problema.** Si la clave poscuántica no está cargada, no está registrada o no es la clave local, o si se desconoce la versión de los bytes de firma, QORel no envía nada y dice cuál de ellos es.
- **`keys pqc-status` es el primer comando que ejecutar.** Muestra el registro, la coincidencia de la clave, la prueba de posesión, la versión de los bytes de firma que verifica la cadena y `ready_to_relay`.
- **`health-check` explica las configuraciones erróneas**, incluido un multiplicador de gas inferior a 1.1 en una entrada de QoreChain.

## Cómo se usa {#how-to-use}

Ejecuta esto primero y compara:

```bash
qorel --version
qorel health-check
qorel keys pqc-status --chain qorechain-diana
qorel query packet pending --chain qorechain-diana --port transfer --channel channel-0
```

### Claves y registro {#keys}

**`ready_to_relay` es `false`. ¿Y ahora qué?**
Lee los demás campos de `keys pqc-status`:
- `registered: false`: la cuenta no tiene ninguna clave poscuántica registrada. Fondea la cuenta y luego ejecuta `qorel keys register-pqc --chain qorechain-diana`.
- `registered: true` pero `matches_local_key: false`: la cuenta tiene registrada una clave distinta de la que guarda QORel. Comprueba que has usado la mnemónica propia de la cuenta y el `--key-name` correcto. Si volviste a añadir la clave, `keys add --overwrite` reconstruye la clave local y su semilla `<key name>.pqc` a partir de la mnemónica.
- El comando no consigue cargar la clave: falta el archivo `<key name>.pqc` junto a la clave o no se puede leer. Ejecuta `keys add` de nuevo para esa cadena.

**`keys register-pqc` dice que la cuenta ya tiene una clave distinta.**
No envió nada, a propósito. La clave de la cadena se registró desde otra mnemónica o con otra herramienta. Usa la mnemónica original, o rota la clave en la cadena desde la antigua ([Firma poscuántica](/developer-guide/post-quantum-signing#key-rotation)); una clave que la cuenta usó antes no se puede volver a registrar.

**`keys register-pqc` falla con un error de comisión o de saldo.**
La cuenta necesita QOR en la testnet antes de poder enviar su primera transacción. Usa el [Faucet del panel](/dashboard/faucet). El registro necesita unos cientos de miles de unidades de gas; al mínimo de 0,1 uqor son unas pocas decenas de miles de uqor.

**¿Necesito `--no-proof`?**
Solo para una red anterior a v3.2.3. Ambas redes de QoreChain aceptan una prueba de posesión, y QORel añade una por defecto.

**¿Dónde se guarda mi clave poscuántica?**
Junto a la clave secp256k1, como `<key name>.pqc` (una semilla de 32 bytes), legible solo por el propietario. Se puede volver a derivar de la mnemónica. Haz copia de seguridad de la mnemónica, no de los archivos.

**Mis archivos de clave son legibles por otros.**
QORel escribe los archivos de clave nuevos con 0600. Las claves añadidas con un Hermes anterior conservan su modo antiguo; ejecuta `chmod 600` sobre ellas.

### Configuración {#config}

**La configuración se rechaza con un mensaje sobre `extension_options`.**
Las `extension_options` estáticas no se pueden combinar con `signing = 'qorechain-hybrid'`: la firma poscuántica debe ser la única opción de extensión crítica. Elimínalas de la entrada de esa cadena.

**Dice que la cadena no usa `signing = "qorechain-hybrid"`.**
Los comandos de claves poscuánticas solo funcionan en cadenas con ese ajuste. Añádelo a la entrada de QoreChain.

**¿Tengo que definir la versión de los bytes de firma?**
No. `pqc.sign_bytes = 'auto'` la lee de la cadena, la vuelve a leer cada minuto y tras cualquier rechazo. Un `v1` o `v2` fijo que no coincida con la cadena hace que rechace todas las transacciones.

**`pqc-status` muestra `sign_bytes` como desconocido.**
QORel no pudo leer los registros de actualizaciones de la cadena. Comprueba que el `rpc_addr` de la entrada de QoreChain responde y apunta a la red correcta (`qorechain-diana` en la testnet). QORel no firmará sin una versión conocida.

**¿Qué multiplicador de gas debería usar?**
`1.1` es el valor por defecto del ejemplo y mantiene tranquilo a `health-check`. En la cadena v3.2.5 o posterior (ahora ambas redes; medido en la testnet con v3.2.6) funciona un valor menor como `1.05`. Las compilaciones anteriores subestiman el gas simulado, así que usa `1.15` en un nodo que ejecute una. Consulta [Gas](/qorel/configuration#gas).

**`health-check` avisa sobre el multiplicador de gas.**
Es inferior a 1.1 en una entrada de QoreChain. Es solo un aviso; el relé funciona. Súbelo si ves fallos por falta de gas.

### Envío y relé {#relaying}

**La cadena rechaza una transacción con codespace `pqc`, código 21.**
La firma híbrida no se verificó. QORel vuelve a leer la versión de los bytes de firma y el registro antes de la siguiente transacción y reintenta. Si se repite: confirma que `id` en la entrada de la cadena es exactamente el chain ID (`qorechain-diana`), que la clave es la registrada (`keys pqc-status`) y que el nodo que usas ejecuta la versión que esperas. [Firma poscuántica](/developer-guide/post-quantum-signing#code-21) enumera las causas.

**No se envía nada y no se gasta comisión, pero el relayer registra un error.**
Es la comprobación previa al envío haciendo su trabajo. La línea de registro nombra la pieza que falta: clave no cargada, clave no registrada, clave que no coincide o versión de los bytes de firma desconocida. Corrígelo como se indicó arriba.

**Errores `account sequence mismatch`.**
Dos procesos están firmando con la misma clave de relayer. Ejecuta un relayer por clave; esto incluye un servicio de systemd más un contenedor, y un segundo pod de Kubernetes.

**Veo `429 Too Many Requests` en los registros.**
El endpoint aplica un límite de peticiones, normalmente uno público tras un reinicio. QORel lo trata como reintentable y mantiene en marcha sus workers de paquetes, reintentando en cada intervalo de despeje. Para un relé estable usa tus propios nodos o un endpoint de pago. La testnet de QoreChain no tiene un endpoint gRPC público, así que el lado de QoreChain necesita tu propio nodo de todos modos.

**Errores de comisiones o de falta de gas en QoreChain.**
La comisión es el límite de gas por el precio, sin reembolso, y el mínimo es 0,1 uqor por unidad de gas. Revisa `gas_price`, que `dynamic_gas_price.backend = 'cosmos-evm-feemarket'` esté definido y el saldo de la cuenta (`qorel keys balance --chain qorechain-diana`).

### Paquetes y canales {#packets}

**Mi transferencia está pendiente y no llega nada.**
Comprueba, por orden: que hay un relayer en marcha para el canal (el proceso está activo; la telemetría responde); que el canal está en tu `packet_filter` en ambas cadenas; que el relayer tiene saldo en la cadena de destino; que la clave poscuántica está lista; que los endpoints son accesibles. Después ejecuta `qorel query packet pending` para el canal. Si no hay ningún relayer en marcha, el paquete espera hasta que se arranque uno o la transferencia caduque.

**¿Qué pasa si una transferencia caduca?**
Con el relayer en marcha, este retransmite el timeout y los tokens se reembolsan al remitente en la cadena de origen. Esto se probó en el canal de la testnet.

**¿Puedo usar el canal de prueba existente, o necesito el mío?**
El `channel-0` de la testnet hacia el `channel-600` de la testnet de Hub está abierto ([El canal de prueba](/user-guide/bridging-assets#ibc-test-channel)); ejecuta QORel con ese `packet_filter` para retransmitirlo. Crea el tuyo con `qorel create channel ... --new-client-connection` solo si lo necesitas.

**`create channel` falla a medias.**
El handshake son varias transacciones en ambas cadenas. Ejecuta `qorel health-check`, corrige la causa y luego vuelve a ejecutar el comando con `--a-connection` apuntando a la conexión que ya creó, o empieza de nuevo con `--new-client-connection`.

**¿Funciona Hermes estándar con QoreChain?**
No. QoreChain rechaza una transacción sin la firma ML-DSA-87, y Hermes estándar no la añade. QORel es Hermes más esa firma.

### General {#general}

**¿Puede QORel retransmitir cadenas distintas de QoreChain?**
Sí. Una cadena sin `signing` usa el formato de transacción estándar de Hermes, byte a byte.

**¿Es compatible con mainnet?**
Todavía no. No hay ningún canal IBC de mainnet abierto. Cuando se abra el IBC de mainnet, este manual lo indicará.

**¿Es compatible con IBC v2?**
Todavía no. El relé de IBC v2 no está implementado en QORel; es la siguiente fase. El relé de Ethereum (Eureka) no se ha iniciado.

**¿Windows?**
No. Usa el contenedor bajo WSL2.

**¿Dónde informo de un problema?**
Abre una incidencia en [github.com/qorechain/QORel](https://github.com/qorechain/QORel/issues). Incluye la versión de QORel, la entrada de cadena con los datos sensibles omitidos y la salida de `qorel keys pqc-status`; nunca publiques una mnemónica, un archivo de clave ni una semilla `.pqc`.

## Cómo acceder {#how-to-access}

- Cada comando de arriba se ejecuta en el host del relayer con la misma configuración que el relayer.
- Estado público con el que comparar: el REST de la testnet de QoreChain en `https://api-testnet.qore.host` ([Conectarse a la testnet](/getting-started/connecting-to-testnet)) y el [explorador de bloques](https://explore.qore.network) (cambia a Testnet).

## Dónde se publica {#where-published}

QORel está en el repositorio [qorechain/QORel](https://github.com/qorechain/QORel); las incidencias van allí. La guía de Hermes original, [hermes.informal.systems](https://hermes.informal.systems), cubre los ajustes y comandos que QORel comparte con él.

## Límites y problemas conocidos {#limits}

- **Solo testnet**, y una versión 0.x.
- **Todavía sin relé de IBC v2** (siguiente fase), y sin relé de Ethereum (Eureka).
- **Los endpoints de terceros aplican límites de peticiones.** Los endpoints del lado de Hub de la configuración de ejemplo son públicos y QoreChain no los gestiona.
- **Esta página no puede cubrir todos los errores de Hermes.** Para los errores que no mencionan la clave poscuántica, los bytes de firma ni QoreChain, rigen la guía de Hermes y su gestor de incidencias.

Consulta también: [Configuración](/qorel/configuration), [Monitorización](/qorel/monitoring), [Firmar desde cualquier lenguaje](/qorel/signing-from-any-language).
