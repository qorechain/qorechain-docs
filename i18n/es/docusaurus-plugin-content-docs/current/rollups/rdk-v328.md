---
slug: /rollups/rdk-v328
title: "El RDK en v3.2.8: qué cambió"
sidebar_label: RDK en v3.2.8
sidebar_position: 11
---

# El RDK en v3.2.8: qué cambió

La versión v3.2.8 de QoreChain cambia la forma en que se liquidan los rollups. Ahora los rollups pueden poner sus datos en la cadena, dejar que la cadena ordene sus transacciones (secuenciación basada), liquidar de forma optimista con una prueba de fraude que vuelve a ejecutar el lote, mantener sus publicaciones privadas para un conjunto de miembros y vincular raíces de retiro Groth16 de un modo que acepta cualquier raíz de 32 bytes. La liquidación STARK queda en pausa hasta una versión posterior. Esta página describe qué hace cada cambio y cómo usarlo. Está dirigida a operadores y desarrolladores de rollups que construyen sobre el módulo `x/rdk`.

:::caution Solo testnet por ahora

v3.2.8 se ejecuta en la testnet pública `qorechain-diana` desde el 12 de noviembre de 2026. La mainnet todavía no la ha aplicado, así que todas las funciones de esta página se rechazan allí hasta que lo haga. Trata los ejemplos como ejemplos de la testnet.

:::

:::note Qué herramientas pueden hacerlo hoy

* **Línea de comandos del nodo (`qorechaind`)**: cada mensaje de esta página tiene un comando. Es el binario de nodo para Linux; no hay un binario empaquetado para macOS, así que en un Mac ejecútalo en un host Linux o lee la cadena por REST.
* **Kit RDK**: el RDK 0.9.0 es compatible con v3.2.8. Está publicado en todos los registros: npm (`@qorechain/rdk`, `@qorechain/rdk-cli`, `create-qorechain-rollup`), PyPI (`qorechain-rdk`), crates.io (`qorechain-rdk`), Maven (`io.github.qorechain:qorechain-rdk`) y Go (`github.com/qorechain/qorechain-rdk/packages/go` v0.9.0). Notas de la versión: https://github.com/qorechain/qorechain-rdk/releases/tag/v0.9.0.
* **Clientes RDK de Python, Go, Rust y Java**: la versión 0.9.0 de cada uno es compatible con v3.2.8. La ejecución de extremo a extremo de más abajo usó el cliente de TypeScript.

:::

## Qué cambió de un vistazo {#at-a-glance}

| Área | Comportamiento desde v3.2.8 |
| --- | --- |
| Publicación de datos | `MsgPostRollupData` pone un payload en una transacción y conserva un compromiso en la cadena bajo la siguiente secuencia de bandeja de entrada (inbox) del rollup. |
| Secuenciación basada | La cadena ordena las transacciones de un rollup por su inclusión. Se fija al crear el rollup o por gobernanza con `MsgSetRollupSequencing`. |
| Rollups optimistas | Los nuevos rollups optimistas (`nft`, `custom`) ejecutan el modelo de ejecución `qledger-v1` y deben ser basados. Una prueba de fraude vuelve a ejecutar el lote. |
| Fianza del remitente de lotes | Los lotes de un rollup `qledger-v1` necesitan una fianza (`MsgBondRollupSubmitter`). Una prueba de fraude aceptada quema la mitad y paga la otra mitad al retador. |
| Depósitos | `MsgDepositToRollup` acredita una cuenta de 32 bytes en un rollup `qledger-v1`. |
| Rollups privados | Los rollups `defi` creados con privacidad `encapsulated` solo aceptan sobres ML-KEM-1024 dirigidos a sus miembros (`MsgSetRollupMembers`). |
| Entradas de Groth16 | Las entradas se leen módulo el campo escalar de BLS12-381. `withdrawals_root` puede ser cualquier valor de 32 bytes y se almacena reducido. |
| STARK | Las claves STARK y los lotes STARK se rechazan hasta una versión posterior. |
| Retención | Los compromisos de datos publicados se conservan durante `posted_data_retention_blocks`, y los puntos de control se conservan más tiempo en los rollups `qledger-v1`. |

## Por qué importa {#why}

Antes de v3.2.8, los datos de un rollup no tenían lugar en la cadena, así que quien comprobaba un lote tenía que confiar en la copia del secuenciador. Publicar datos y ordenar por inclusión elimina esa confianza: la propia cadena registra lo que se publicó y en qué orden, y un lote debe consumir exactamente ese rango. Para los rollups optimistas, una impugnación ahora comprueba la ejecución y no solo una raíz, así que un lote erróneo hace que su remitente pierda su fianza. Los rollups privados permiten a un grupo compartir datos en una cadena pública sin publicarlos.

## Publicar datos de un rollup {#posting-data}

`MsgPostRollupData` (comando `tx rdk post-data`) envía un payload en una transacción. Los bytes permanecen en la transacción, así que están en el bloque. La cadena conserva un compromiso bajo la siguiente secuencia de bandeja de entrada del rollup (empezando en 1): el SHA-256 de los datos, su tamaño, quien publica y la altura. También extiende el acumulador de la bandeja de entrada del rollup.

* **Quién puede publicar**: el secuenciador del rollup (su creador cuando no hay dirección de secuenciador). En un rollup basado, cualquiera.
* **Tamaño**: como máximo `max_posted_data_bytes` por publicación (por defecto 131,072 bytes, techo absoluto de 1 MiB) y `max_posted_data_bytes_per_block` entre todos los rollups (por defecto 524,288 bytes facturables).
* **Comisión**: `posted_data_fee_per_byte` uqor por byte facturable (por defecto 10), y una publicación se factura como mínimo por 1 KiB. La comisión va al recaudador de comisiones y se reparte como una comisión de transacción. El gas se cobra además.
* **Retención**: el compromiso se poda tras `posted_data_retention_blocks` (por defecto 648,000). Los bytes permanecen en el historial de bloques.
* **Uso en un lote**: un lote de un rollup con DA nativa que no sea basado puede referenciar una publicación retenida con `data_hash` igual al SHA-256 de los datos.

Línea de comandos (binario de nodo para Linux):

```bash
# Post a file's raw bytes to a rollup
qorechaind tx rdk post-data my-rollup @payload.bin --from <key> --chain-id qorechain-diana

# Or post hex
qorechaind tx rdk post-data my-rollup 68656c6c6f --from <key> --chain-id qorechain-diana

# Read a commitment back (the payload itself is in the transaction at its height)
qorechaind query rdk posted-data my-rollup 1
```

Lee un compromiso por REST (verificado en la testnet, véase [Rutas comprobadas](#checked-routes)):

```bash
curl -s https://api-testnet.qore.host/qorechain/rdk/v1/posted_data/<rollup-id>/1
```

La respuesta lleva `data_hash`, `size`, `poster`, `height`, `inbox_acc` y `expires_at_height`. Una secuencia que nunca se publicó, o que se podó, devuelve HTTP 404.

## Secuenciación basada {#based-sequencing}

Un rollup basado se ordena por inclusión en QoreChain. Cada publicación recibe la siguiente secuencia de bandeja de entrada, y cada lote consume la bandeja de entrada en orden.

* Crea un rollup como basado con `--sequencing based`, o mueve un rollup existente con la `MsgSetRollupSequencing` de gobernanza.
* Cada lote fija `inbox_end` (la secuencia de la última publicación que consume) y lleva el compromiso del rango de la bandeja de entrada como `data_hash`. Pídeselo a la cadena con `query rdk inbox` (devuelve `range_data_hash`).
* Un rollup basado solo lo pausan, reanudan y detienen la gobernanza.

Quién puede enviar lotes en un rollup basado depende del rollup:

| Rollup | Quién envía lotes |
| --- | --- |
| zk con una clave Groth16 (`defi`) | Cualquier cuenta. La prueba vincula las raíces, el rango de la bandeja de entrada y la raíz de retiros. |
| liquidación basada (`gaming`, `enterprise`) | Solo el secuenciador del rollup. |
| optimista con `qledger-v1` (`nft`, `custom`) | Cualquier cuenta que tenga una fianza de remitente. |

Los rollups optimistas sin `qledger-v1` y los rollups STARK no pueden ser basados en esta versión.

```bash
# Create a based defi rollup (a Groth16 key is registered separately with set-verification-key)
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 --sequencing based --from <key> --chain-id qorechain-diana

# Inbox head, consumed position and the range hash for a batch ending at the head
qorechaind query rdk inbox my-defi-rollup

# Range hash for a batch that ends earlier
qorechaind query rdk inbox my-defi-rollup --inbox-end 12
```

El acumulador y el compromiso del rango, para los probadores que quieran calcularlos sin confiar en un nodo:

```
acc_n = SHA-256("qorechain/rdk/inbox/v1" | lp(chain_id) | lp(rollup_id) | acc_(n-1)
                | be64(n) | be64(height) | lp(poster) | SHA-256(data))
range = SHA-256("qorechain/rdk/inbox-range/v1" | lp(chain_id) | lp(rollup_id)
                | be64(from) | be64(to) | acc_from | acc_to)
```

`acc_0` son 32 bytes a cero y `lp` es un prefijo de longitud de 4 bytes en big-endian.

## Rollups optimistas con qledger-v1 {#qledger-v1}

Desde v3.2.8 no se puede crear un nuevo rollup optimista sin una VM de ejecución. Los presets `nft` y `custom` necesitan `--execution-vm qledger-v1` junto con `--sequencing based`. Los rollups optimistas creados antes de v3.2.8 no cambian.

`qledger-v1` es un libro de cuentas en uqor (un árbol de Merkle disperso con SHA-256) con transferencias y retiros firmados. Las claves de cuenta son solo ML-DSA-44. Sus entradas son su bandeja de entrada:

* **Publicaciones de usuarios**: una transacción cada una, como máximo 6 KiB.
* **Depósitos**: `MsgDepositToRollup` acredita un id de cuenta de 32 bytes. La cadena añade el depósito a la bandeja de entrada por sí misma.

```bash
qorechaind tx rdk create-rollup my-nft-rollup nft 10000000000 \
  --execution-vm qledger-v1 --sequencing based --from <key> --chain-id qorechain-diana

# Deposit 1,000,000 uqor (1 QOR) for a 32-byte L2 account id
qorechaind tx rdk deposit my-nft-rollup <64-hex-chars> 1000000 --from <key> --chain-id qorechain-diana
```

### Fianza del remitente y lotes pendientes {#submitter-bond}

Cualquier cuenta puede enviar lotes una vez que tiene en ese rollup una fianza de remitente de al menos `min_submitter_bond` (por defecto 1,000 QOR, 1,000,000,000 uqor).

```bash
qorechaind tx rdk bond-submitter my-nft-rollup 1000000000 --from <key> --chain-id qorechain-diana
qorechaind query rdk submitter-bond my-nft-rollup <submitter-address>
qorechaind tx rdk unbond-submitter my-nft-rollup --from <key> --chain-id qorechain-diana
```

La consulta de la fianza devuelve `amount`, `last_submit_time`, `unbond_after` y `pending`. `pending` es el número de lotes de ese remitente que siguen esperando la finalidad: sube con cada lote enviado y baja cuando uno se finaliza o se rechaza. Un remitente puede tener menos de 1,024 lotes pendientes. Una fianza se puede recuperar con `unbond-submitter` una ventana de impugnación completa después del último lote del titular.

### Reglas de los lotes {#batch-rules}

Sea `consumed` la posición de la bandeja de entrada desde la que empieza el siguiente lote y `head` la última publicación (ambas en `query rdk inbox`). Un lote con `inbox_end = end` se admite cuando se cumple todo lo siguiente:

1. El remitente tiene al menos `min_submitter_bond` y menos de 1,024 lotes pendientes.
2. `consumed < end <= head`. Un lote consume al menos una entrada.
3. `end - consumed <= 64`. Como máximo 64 entradas de la bandeja de entrada por lote.
4. La cadena aún puede producir el acumulador en `end`: `end` es la cabeza, o el compromiso de la publicación `end` está retenido (`query rdk inbox <rollup> --inbox-end <end>` devuelve un `range_data_hash`).
5. Un lote de menos de 64 entradas que se detiene antes de la cabeza se detiene justo antes de una publicación hecha en los últimos 20 bloques, o en un punto de control (`end` es múltiplo de 64) cuya siguiente publicación ya no está retenida.
6. `data_hash` es el compromiso del rango de la bandeja de entrada desde `consumed` hasta `end`, el primer lote parte de la raíz de libro vacío, y `state_root` tiene 32 bytes.

Un cliente puede elegir `end` así:

```
want = min(head, consumed + 64)
if want == head or retained(want):
    end = want                          # to the head, or a full batch of 64
else:
    end = (consumed // 64 + 1) * 64     # the next checkpoint, which is retained
```

Envíalo con la línea de comandos:

```bash
qorechaind tx rdk submit-batch my-nft-rollup 0 <state-root-hex> \
  --prev-state-root <hex> --tx-count 4 --inbox-end 4 \
  --data-hash <range_data_hash from query rdk inbox> \
  --withdrawals-root <hex> --from <key> --chain-id qorechain-diana
```

### Pruebas de fraude {#fraud-proofs}

Durante la ventana de impugnación, cualquiera puede enviar `MsgChallengeBatch` con una prueba de fraude de `qledger-v1`: las entradas del lote y un testigo de Merkle de las cuentas que tocan. La cadena vuelve a ejecutar el lote.

* Si la raíz de estado o la raíz de retiros es incorrecta, el lote se rechaza, y también todo lote construido sobre él. La bandeja de entrada retrocede.
* Se recorta (slash) la fianza completa del remitente. **La mitad se quema y la mitad se paga al retador.** La mitad quemada se registra en el módulo de quema bajo la fuente `rollup_slash`. Un remitente que impugna su propio lote erróneo pierde igualmente la mitad de su fianza.
* Una prueba que no muestra un lote erróneo falla con el error 51 y no cambia nada.

```bash
qorechaind tx rdk challenge-batch my-nft-rollup 1 --proof <hex-fraud-proof> --from <key> --chain-id qorechain-diana
```

El RDK 0.9.0 tiene los ayudantes de `qledger-v1` que construyen los bytes de la prueba.

Los lotes que no se impugnan se finalizan solos cuando termina la ventana de impugnación. Los retiros se pagan solo desde lotes finalizados, desde el fondo de depósitos del rollup, nunca desde el escrow del creador. Un rollup no se puede detener mientras el fondo contenga depósitos (error 54).

### Retención y periodos inactivos {#retention}

* Un compromiso de publicación se conserva durante `posted_data_retention_blocks` y, después, mientras ningún lote finalizado lo cubra, hasta 4 periodos de retención más.
* Después se poda, salvo un punto de control: toda publicación cuya secuencia sea múltiplo de 64 conserva su compromiso hasta que un lote finalizado lo cubra, o hasta que el rollup se detenga.
* Un rollup detenido no conserva ningún compromiso más allá de su periodo de retención.
* `posted_data_retention_blocks` debe ser al menos la ventana de impugnación más larga vigente, contada como un bloque por segundo (`default_challenge_window` y la ventana de todo rollup que no esté detenido). Una actualización de parámetros que lo deje más corto, o que suba una ventana por encima de él, se rechaza con `invalid params`. El límite superior es 25,920,000.
* En la actualización a v3.2.8, un valor almacenado por debajo de esa ventana se eleva hasta ella. Los parámetros por defecto se dejan como están.
* **Valores de la testnet**: `default_challenge_window` es de 3,600 segundos (el valor por defecto del núcleo y estilo mainnet es de 604,800 segundos, 7 días). Los datos publicados se conservan 648,000 bloques, y los blobs y los lotes finalizados 432,000 bloques.

Tras un periodo largo de inactividad, con más de 64 publicaciones sin consumir y sus compromisos podados, un remitente se pone al día en orden: un lote hasta el siguiente múltiplo de 64 si `consumed` no lo es, luego lotes completos de 64 de punto de control a punto de control, y después un último lote hasta la cabeza (o hasta cualquier posición retenida según la regla 5). En funcionamiento normal nada cambia: lotes de hasta 64 entradas, hasta la cabeza o hasta justo antes de una publicación reciente.

## Rollups privados {#private-rollups}

Un rollup `defi` (Groth16) creado con privacidad `encapsulated` solo acepta publicaciones que sean sobres ML-KEM-1024 dirigidos a sus miembros.

Un sobre cifra los datos una vez con AES-256-GCM bajo una clave nueva, y encapsula esa clave para la clave ML-KEM-1024 de cada miembro desde el registro KEM de la cadena. Un compromiso de clave garantiza que todos los miembros abran el mismo contenido. La cadena comprueba que el sobre está bien formado y que cada entrada nombra la clave actual del miembro. Nunca descifra.

* El creador fija los miembros con `MsgSetRollupMembers`: como máximo 32, cada uno con una clave ML-KEM-1024 registrada. Cada cambio inicia una nueva época de membresía.
* Las publicaciones, quien publica, la hora, los tamaños, los miembros, las raíces y los retiros (destinatario y monto) siguen siendo públicos. Solo el contenido de las publicaciones es privado.

```bash
qorechaind tx rdk create-rollup my-private-rollup defi 10000000000 --privacy encapsulated \
  --verification-key-file vk.json --from <key> --chain-id qorechain-diana

qorechaind tx rdk set-members my-private-rollup <addr1>,<addr2> --from <key> --chain-id qorechain-diana

# Encrypt to the members and post, in one step
qorechaind tx rdk post-private-data my-private-rollup @message.bin --from <key> --chain-id qorechain-diana

# A member opens a post offline
qorechaind tx rdk decrypt-private-data my-private-rollup @envelope.hex
```

## Entradas de Groth16 y la raíz de retiros {#groth16}

Un lote Groth16 sobre BLS12-381 (el perfil `defi`, SNARK) se verifica contra entradas públicas, cada una un valor de 32 bytes leído como un entero big-endian y reducido módulo el orden del campo escalar:

```
r = 0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001
input_i = int.from_bytes(value_i, "big") mod r
values  = prev_state_root, state_root, data_hash, withdrawals_root
```

Un lote enviado antes de que se vincularan los retiros solo tiene las tres primeras entradas. El testigo del probador debe tomar los mismos valores reducidos.

Que un valor deba estar ya por debajo de `r` depende de quién lo fija:

| Valor | Quién lo fija | Debe estar por debajo de r |
| --- | --- | --- |
| `state_root` | el probador | sí |
| `prev_state_root` | la cadena (el último `state_root` liquidado), salvo en el primer lote de un rollup | solo el primer lote |
| `data_hash` | la cadena cuando está vinculado (el rango de la bandeja de entrada de un rollup basado, un compromiso de datos publicados), en caso contrario el probador | solo cuando no está vinculado |
| `withdrawals_root` | la cadena (la raíz del árbol de retiros que reconstruye `MsgExecuteWithdrawal`) | no |

Qué significa esto para un cliente:

* Envía la raíz de retiros tal como la da el árbol. Puede ser cualquier valor de 32 bytes.
* La cadena almacena `withdrawals_root mod r` como 32 bytes big-endian. La consulta del lote muestra ese valor almacenado, con `withdrawals_root_reduced` en true. Alrededor del 55 por ciento de las raíces de árbol están en `r` o por encima, así que el valor almacenado a menudo difiere de los bytes enviados.
* `MsgExecuteWithdrawal` no cambia para el cliente: envía los campos de la hoja y los hashes hermanos. La cadena reconstruye la raíz y acepta el retiro cuando `rebuilt_root mod r == stored_root mod r`.
* Dos envíos del mismo lote cuyas raíces difieren en un múltiplo de `r` son el mismo lote. El primero se liquida, el segundo se rechaza como un lote que ya existe, y todos los retiros del árbol se pagan contra la raíz almacenada.
* Tras la liquidación, compara la raíz almacenada con `tree_root mod r`, no con `tree_root`.

Los lotes optimistas, de `qledger-v1` y Groth16 anteriores a la regla de reducción almacenan y comparan los 32 bytes exactos. Para la codificación del árbol y de las hojas, consulta [ZK / STARK y Retiros](/rollups/zk-stark-withdrawals).

## La liquidación STARK está en pausa {#stark}

La única declaración STARK que admite el verificador prueba un cuadrado iterado entre dos valores de 64 bits. Eso no restringe los retiros ni los datos de un rollup. Desde v3.2.8 no se puede fijar una clave STARK y los lotes de un rollup STARK se rechazan (error 52). La gobernanza puede mover un rollup así a una clave Groth16. La liquidación STARK volverá en una versión posterior con una declaración real de rollup.

## Mensajes nuevos {#messages}

| Mensaje | Comando | Quién lo envía |
| --- | --- | --- |
| `MsgPostRollupData` | `tx rdk post-data` | El secuenciador, o cualquiera en un rollup basado |
| `MsgSetRollupSequencing` | propuesta de gobernanza | Gobernanza |
| `MsgDepositToRollup` | `tx rdk deposit` | Cualquiera, para un rollup `qledger-v1` |
| `MsgBondRollupSubmitter` | `tx rdk bond-submitter` | Un remitente de lotes |
| `MsgUnbondRollupSubmitter` | `tx rdk unbond-submitter` | Un remitente de lotes |
| `MsgSetRollupMembers` | `tx rdk set-members` | El creador de un rollup privado |
| Campo `inbox_end` de `MsgSubmitBatch` | `tx rdk submit-batch --inbox-end` | El remitente de un lote de un rollup basado |

`create-rollup` también admite `--sequencing`, `--execution-vm` y `--privacy`. La matriz de compatibilidad es ahora: el modo optimista con pruebas de fraude necesita `qledger-v1` y secuenciación basada, y la liquidación ZK significa SNARK.

## Flujo completo: crear, afianzar, depositar, publicar, enviar lote, impugnar, finalizar, retirar {#worked-flow}

:::note Ejecutado en la testnet por el equipo del RDK, 12 de noviembre de 2026
El equipo del RDK ejecutó este flujo de extremo a extremo en la testnet `qorechain-diana` el 12 de noviembre de 2026, de las 06:22 a las 07:27 UTC. Se condujo íntegramente con el RDK 0.9.0 (TypeScript) con la comisión `auto` del RDK a 0.15 uqor por gas. Todos los pasos devolvieron código 0. No lo ejecutó el autor de esta página.
:::

| Paso | Mensaje | Gas usado / gas pedido |
| --- | --- | --- |
| 0 | Registrar primero la clave poscuántica de la cuenta nueva, en su propia transacción (`MsgRegisterPQCKeyV2` con prueba de posesión). Los clientes del RDK lo hacen automáticamente; sin ello la primera transacción real se rechaza con el código pqc 8 | 348,917 / 600,000 |
| 1 | `MsgCreateRollup`: perfil `nft`, VM de ejecución `qledger-v1`, secuenciación `based`, stake de 10,000 QOR (1% quemado) | 301,260 / 349,199 |
| 2 | `MsgBondRollupSubmitter`, 1,000 QOR | 178,059 / 263,425 |
| 3 | `MsgDepositToRollup` dos veces (3 QOR y 1 QOR; el mínimo es 1 QOR) | unos 240,000 / 350,000 cada una |
| 4 | `MsgPostRollupData` dos veces (una transferencia qledger firmada y un retiro qledger firmado), más la comisión de datos publicados (10 uqor por byte facturable, al menos 1 KiB facturado) | unos 328,500 / 474,000 cada una |
| 5 | `planQledgerBatch`, luego `MsgSubmitBatch` para 4 entradas de la bandeja de entrada (`inbox_end` 4, `data_hash` el rango de la bandeja de entrada). Estado del lote `submitted`, fianza con `pending` 1 | 712,379 / 1,011,431 |
| 6 | Prueba de fraude: una publicación más, luego un lote con una raíz de estado deliberadamente incorrecta (233,990 / 341,742), luego `MsgChallengeBatch` con la prueba de fraude construida por el RDK (4,136 bytes) | 450,186 / 644,417 |
| 7 | El lote 0 se finalizó solo tras la ventana de impugnación de 3,600 segundos de la testnet | sin transacción |
| 8 | `MsgExecuteWithdrawal` de 0.3 QOR con la prueba de Merkle de qledger del RDK | 192,768 / 284,220 |

Resultados dignos de mención:

* **Paso 6**: el lote erróneo se rechazó, la fianza del remitente se recortó (la mitad quemada, la mitad pagada al retador), la bandeja de entrada retrocedió y el lote bueno anterior no se tocó.
* **Paso 8**: el fondo de depósitos del rollup pasó de 4.0 a 3.7 QOR, y el saldo del destinatario subió 0.3 QOR menos la comisión.

La línea de comandos tiene un equivalente para cada paso. Estos comandos individuales no se ejecutaron para esta página y siguen las definiciones de la CLI del nodo:

```bash
CHAIN="--chain-id qorechain-diana --from <key>"

# 1. Create an optimistic, based qledger-v1 rollup (needs the creation stake)
qorechaind tx rdk create-rollup my-nft-rollup nft 10000000000 \
  --execution-vm qledger-v1 --sequencing based $CHAIN

# 2. Bond the submitter (at least min_submitter_bond)
qorechaind tx rdk bond-submitter my-nft-rollup 1000000000 $CHAIN

# 3. Deposit funds for an L2 account
qorechaind tx rdk deposit my-nft-rollup <64-hex-account-id> 1000000 $CHAIN

# 4. Post a signed L2 transaction (one transaction, at most 6 KiB)
qorechaind tx rdk post-data my-nft-rollup @signed-l2-tx.bin $CHAIN

# 5. Read the range hash, execute the entries off chain, then submit the batch
qorechaind query rdk inbox my-nft-rollup
qorechaind tx rdk submit-batch my-nft-rollup 0 <new-state-root> --tx-count <n> \
  --inbox-end <end> --data-hash <range_data_hash> --withdrawals-root <root> $CHAIN

# 6. A challenger who finds a wrong root sends a fraud proof inside the window
qorechaind tx rdk challenge-batch my-nft-rollup 0 --proof <hex-fraud-proof> $CHAIN

# 7. An unchallenged batch finalizes by itself when the challenge window ends
qorechaind query rdk batch my-nft-rollup --index 0   # status finalized

# 8. Withdraw from the finalized batch (anyone may submit the proof)
qorechaind tx rdk execute-withdrawal my-nft-rollup 0 <withdrawal-index> <recipient> uqor <amount> \
  --proof <sibling-hex>,<sibling-hex> $CHAIN
```

La ventana de impugnación de un rollup está en su `challenge_window_sec`. En la testnet `default_challenge_window` es de 3,600 segundos a propósito, para poder probar los rollups en una hora; el valor por defecto del núcleo y estilo mainnet es de 604,800 segundos (7 días). Los pasos 5 a 8 necesitan raíces y pruebas calculadas a partir del libro; el RDK 0.9.0 tiene los ayudantes de `qledger-v1` que lo hacen.

## Leer la cadena con el kit de TypeScript publicado {#typescript}

Estas lecturas usan nombres de `@qorechain/rdk`, que es compatible con v3.2.8 desde la 0.9.0. También puedes leer los campos nuevos directamente con `curl` como se muestra más abajo.

```ts
import { RestClient } from "@qorechain/rdk";

const rest = new RestClient("https://api-testnet.qore.host");

const params = await rest.getParams();
const rollup = await rest.getRollup("my-nft-rollup");
const latest = await rest.getLatestBatch("my-nft-rollup");
console.log(params, rollup, latest);
```

Este fragmento no se ejecutó para esta página.

## Rutas comprobadas {#checked-routes}

Estas rutas de solo lectura se solicitaron a la testnet pública el 12 de noviembre de 2026.

| Ruta | Estado |
| --- | --- |
| `GET /qorechain/rdk/v1/params` | 200 |
| `GET /qorechain/rdk/v1/rollups` | 200 |
| `GET /qorechain/rdk/v1/rollup/<id>` | 200 |
| `GET /qorechain/rdk/v1/inbox/<id>` y `?inbox_end=N` | 200 |
| `GET /qorechain/rdk/v1/posted_data/<id>/<sequence>` | 200, o 404 para una secuencia nunca publicada o podada |
| `GET /qorechain/rdk/v1/submitter_bond/<id>/<address>` | 200 |
| `GET /qorechain/rdk/v1/batches/<id>`, `latest_batch/<id>`, `batch/<id>/<index>` | 200 |
| cualquier ruta para un rollup desconocido | 404 |

```bash
BASE=https://api-testnet.qore.host/qorechain/rdk/v1
curl -s $BASE/params
curl -s $BASE/inbox/<rollup-id>
curl -s $BASE/submitter_bond/<rollup-id>/<address>
curl -s $BASE/latest_batch/<rollup-id>
```

Los parámetros del módulo ahora incluyen `max_posted_data_bytes`, `max_posted_data_bytes_per_block`, `posted_data_fee_per_byte`, `posted_data_retention_blocks`, `min_submitter_bond` y `finalized_batch_retention_blocks`. La vista del lote añade `inbox_start`, `inbox_end` y `withdrawals_root_reduced`, y la vista del rollup añade `sequencing`, `execution_vm`, `privacy`, `members`, `members_epoch` y `deposit_pool`. La respuesta de la bandeja de entrada tiene `head_sequence`, `consumed_sequence` y `range_data_hash`, que está vacío cuando el compromiso en el final solicitado no está disponible.

## Límites y errores {#limits}

| Límite o error | Valor o significado |
| --- | --- |
| Tamaño de publicación | `max_posted_data_bytes`, por defecto 131,072 bytes, techo de 1 MiB |
| Bytes publicados por bloque | `max_posted_data_bytes_per_block`, por defecto 524,288 bytes facturables |
| Comisión de publicación | 10 uqor por byte facturable por defecto, al menos 1 KiB facturado |
| Retención de datos publicados | 648,000 bloques por defecto, como máximo 25,920,000, nunca por debajo de la ventana de impugnación más larga en segundos |
| Publicación `qledger-v1` | Una transacción, como máximo 6 KiB |
| Tamaño del lote | De 1 a 64 entradas de la bandeja de entrada |
| Lotes pendientes por remitente | menos de 1,024 |
| Miembros de un rollup privado | como máximo 32, cada uno con una clave ML-KEM-1024 registrada |
| Lotes liquidados por bloque, por rollup | `max_batches_per_block`, por defecto 10 (error 40) |
| Error 41, 44, 47 | La función no está habilitada en esta altura (la red no ha aplicado v3.2.8) |
| Error 42, 43 | Publicación demasiado grande, o se alcanzó el límite de publicaciones del bloque |
| Error 45 | La secuenciación basada no está disponible para este rollup |
| Error 46 | El lote no coincide con la bandeja de entrada del rollup (`inbox_end` o `data_hash` incorrectos) |
| Error 48 | Modo de ejecución o de privacidad inválido |
| Error 49 | Se requiere una fianza de remitente |
| Error 50 | La fianza del remitente sigue bloqueada |
| Error 51 | La prueba de fraude no muestra que el lote sea inválido |
| Error 52 | La liquidación STARK está en pausa |
| Error 53 | La publicación no es un sobre válido para los miembros del rollup |
| Error 54 | El rollup todavía tiene depósitos de usuarios, así que no se puede detener |

## Páginas relacionadas {#related}

* [Visión general de los Rollups](/rollups/overview)
* [Perfiles predefinidos](/rollups/preset-profiles)
* [Desplegar un rollup](/rollups/deploying-a-rollup)
* [Disponibilidad de datos](/rollups/data-availability)
* [ZK / STARK y Retiros](/rollups/zk-stark-withdrawals)
* [Watchtower](/rollups/watchtower)
