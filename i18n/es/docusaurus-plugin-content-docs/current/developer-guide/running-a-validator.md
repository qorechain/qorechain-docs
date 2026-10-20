---
slug: /developer-guide/running-a-validator
title: Ejecutar un Validador
sidebar_label: Ejecutar un Validador
sidebar_position: 9
---

# Ejecutar un Validador

Esta guía cubre cómo crear un validador en la red QoreChain, entender el diseño de clasificación de pools, registrar una clave PQC para seguridad resistente a la computación cuántica, y monitorear tu nodo.

:::note
Esta guía está orientada a la mainnet **`qorechain-vladi`** (chain ID EVM **9801**), activa desde el 7 de junio de 2026 y ejecutando la versión de nodo **v3.2.3** (aplicada por gobernanza en la altura 3,662,051). Se recomienda la testnet **`qorechain-diana`** (chain ID EVM **9800**, v3.2.4) para ensayar tu configuración antes de pasar a producción. Sustituye el `--chain-id` adecuado según tu red objetivo. Los tiempos de bloque difieren: unos 3.2 s en la mainnet y unos 1.0 s en la testnet, así que convierte los recuentos de bloques a tiempo según cada red.
:::

:::caution Usa el binario de release, no una compilación desde el código fuente
Un validador debe ejecutar el **`qorechaind` de release** indicado en el manifiesto en vivo (`https://download.qore.host/mainnet/latest.json`; ver [Ejecutar un Nodo](/developer-guide/running-a-node#fetch-the-manifest)). Un binario compilado desde el código fuente público tiene keepers stub y no incluye firmante post-cuántico: no puede reproducir el estado de consenso de la red y no puede crear la firma híbrida que necesitan `create-validator` y cualquier otra transacción de la vía Cosmos (ver [Compilación desde el Código Fuente](/developer-guide/building-from-source)). Desde v3.2.3, un binario compilado desde el código fuente público se niega directamente a arrancar en una red pública. Un nodo nuevo de mainnet necesita v3.2.0 o posterior; mantén el reloj del sistema sincronizado por NTP, porque desde v3.2.1 el nodo se detiene cuando su reloj se desvía más de 60 segundos.
:::

:::note Qué partes de esta página están activas
La producción de bloques usa la rotación estándar de validadores ponderada por stake, y el slashing y la gobernanza usan los módulos estándar del Cosmos SDK con los parámetros que se muestran más abajo. La lógica CPoS de Triple-Pool (clasificación de pools, selección de proponente ponderada por pool, curva de bonding y slashing progresivo) está implementada en el módulo `x/qca` y sus parámetros están on-chain, pero **todavía no está integrada en la producción de bloques, las recompensas ni el slashing**. Las secciones sobre esos temas describen el diseño; no planifiques en función de que la pertenencia a un pool o la reputación cambien hoy tu cuota de propuestas de bloque o tus recompensas.
:::

---

## Requisitos previos

* Un nodo `qorechaind` de release completamente sincronizado (ver [Conexión a Mainnet](/getting-started/connecting-to-mainnet), o [Conexión a Testnet](/getting-started/connecting-to-testnet) para ensayar)
* Una **clave PQC ML-DSA-87 registrada** en la cuenta del operador (ver [Registro de Clave PQC](#pqc-key-registration)) — `create-validator` necesita la firma híbrida
* Una cuenta con fondos de al menos **100,000 QOR** (100,000,000,000 uqor) para la autodelegación inicial — este mínimo se aplica on-chain y `create-validator` se rechaza por debajo de él
* Una **concesión `validator_operator`** activa en tu dirección de operador, emitida a través del [Validator Program](/dashboard/tools-hub#validator-application) (presentar la solicitud, ser seleccionado y pagar la tarifa de programa de $1,000); ver la nota más abajo. Sin ella, `create-validator` falla con `ErrUnauthorized` sin importar cuánto QOR autodelegues
* Familiaridad con el modelo de [Staking y Delegación](/user-guide/staking-and-delegation)

---

## Crear un Validador

### Concesión de operador: `validator_operator` {#validator-license-gate}

`create-validator` está protegido por dos verificaciones independientes, ambas aplicadas on-chain, y necesitas ambas — un autobond grande por sí solo no es suficiente:

1. **Autobond mínimo de 100,000 QOR.**
2. **Una concesión `validator_operator` activa** en la cuenta que envía la transacción.

La concesión la emite on-chain QoreChain Association a través del **Validator Program**: presenta tu solicitud en el [Tools Hub](/dashboard/tools-hub#validator-application), ejecuta un validador en la testnet diana durante la prueba de 14 días y, una vez seleccionado, paga la **tarifa de programa de $1,000**; la concesión se firma entonces por lotes para la dirección de operador de tu solicitud. Comprueba la tuya con `GET /qorechain/license/v1/check/{grantee}/validator_operator`. El `expires_at` de una licencia es una **altura de bloque**, no una fecha ni una duración — `0` significa sin vencimiento. Si falta o está vencida, `create-validator` falla con `ErrUnauthorized`, sin importar cuánto autodelegues; esta es la razón más común por la que un intento bien financiado falla y parece inexplicable. Este gate existe específicamente porque la vía de ejecución EVM no puede verlo ni aplicarlo (un único decorador de ante allí lo eludiría por completo) — es una de las razones por las que el staking y la validación permanecen exclusivamente en la vía Native.

Crea un archivo `validator.json` (la forma basada en flags se eliminó en el SDK actual):

```json
{
  "pubkey": {"@type": "/cosmos.crypto.ed25519.PubKey", "key": "<base64 key from: qorechaind comet show-validator>"},
  "amount": "100000000000uqor",
  "moniker": "my-validator",
  "identity": "",
  "website": "",
  "security": "",
  "details": "",
  "commission-rate": "0.10",
  "commission-max-rate": "0.20",
  "commission-max-change-rate": "0.01",
  "min-self-delegation": "1"
}
```

Luego genera y firma la transacción (necesita la firma híbrida como toda transacción de la vía Cosmos; ver [Comandos de Transacción](/cli-reference/transaction-commands#hybrid-signing)):

```bash
qorechaind tx staking create-validator validator.json \
  --from mykey --chain-id qorechain-vladi \
  --gas 600000 --fees 60000uqor \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

El mínimo de comisión de la red es de **0.1 uqor por unidad de gas**, así que un límite de 600,000 de gas requiere al menos 60,000 uqor.

| Campo de `validator.json`      | Descripción                                              |
| ------------------------------ | --------------------------------------------------------- |
| `amount`                       | Monto de autodelegación — **mínimo 100,000 QOR** (`100000000000uqor`) |
| `pubkey`                       | Clave pública de consenso del validador (ed25519)         |
| `moniker`                      | Nombre legible para tu validador                          |
| `commission-rate`              | Tasa de comisión inicial (p. ej., 0.10 = 10%)              |
| `commission-max-rate`          | Tasa de comisión máxima (inmutable tras la creación)       |
| `commission-max-change-rate`   | Tasa máxima de cambio diario de comisión                   |
| `min-self-delegation`          | Cantidad mínima de tokens que el operador debe autodelegar |

Una vez confirmada la transacción, verifica tu validador:

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## Clasificación de Pools

:::note Diseño, todavía no activo en la producción de bloques
La clasificación de pools que se describe a continuación es el diseño de `x/qca`. Sus parámetros están on-chain (`qorechaind query qca config`), pero los proponentes de bloque todavía no se eligen por pool y los pools aún no cambian las recompensas ni el slashing.
:::

El módulo `x/qca` (Quantum Consensus Allocation) de QoreChain define un **sistema de clasificación de tres pools**. Cada **1,000 bloques** (unos 54 minutos con los bloques de 3.2 s de la mainnet), los validadores deben reclasificarse en uno de tres pools según su reputación y stake:

| Pool                                  | Criterio                                                     | Asignación de Bloques |
| -------------------------------------- | ------------------------------------------------------------- | ---------------------- |
| **RPoS** (Reputation Proof-of-Stake)   | Reputación >= percentil 70 Y stake >= mediana                 | 40% de los bloques      |
| **DPoS** (Delegated Proof-of-Stake)    | Delegación total >= 10,000 QOR                                 | 35% de los bloques      |
| **PoS** (Proof-of-Stake)               | Todos los demás validadores activos                            | 25% de los bloques      |

En el diseño, los proponentes de bloque dentro de cada pool se seleccionan mediante **selección aleatoria ponderada** proporcional a su stake efectivo, de modo que tanto los validadores de alta reputación como los de alta delegación reciban una representación justa, permitiendo a la vez que los validadores más pequeños participen.

### Consultar la Configuración de Pools

```bash
# Pool weights and classification parameters (there is no per-validator classification query)
qorechaind query qca config
```

Vía JSON-RPC:

> **Aún no disponible:** ninguna compilación publicada del nodo sirve el espacio de nombres JSON-RPC `qor_`, por lo que esta llamada devuelve `-32601` (método no encontrado) en todos los endpoints públicos hoy. Ver [el espacio de nombres `qor_`](/api-reference/json-rpc-qor_-namespace).

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getPoolClassification",
    "params": ["qorvaloper1..."],
    "id": 1
  }'
```

---

## Curva de Bonding

:::note Diseño, todavía no activo
La curva de bonding está implementada en `x/qca`, pero todavía no está integrada en la distribución de recompensas; las recompensas de staking hoy siguen el módulo de distribución estándar. La fórmula de abajo es el diseño.
:::

La recompensa de staking para un validador está diseñada para determinarse mediante una curva de bonding que incorpora múltiples factores:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Variable | Descripción                                                       |
| -------- | -------------------------------------------------------------------- |
| `R`      | Monto de la recompensa                                                |
| `beta`   | Tasa base de recompensa                                               |
| `S`      | Stake efectivo                                                        |
| `alpha`  | Constante de escalado de lealtad                                      |
| `L`      | Duración de lealtad (tiempo continuo de staking)                      |
| `Q(r)`   | Factor de calidad de reputación, rango \[0.75 - 1.25]                 |
| `P(t)`   | Multiplicador de fase del protocolo (se ajusta según el ciclo de vida de la red) |

**Puntos clave:**

* **Bono por duración de lealtad:** el diseño añade un término logarítmico para el tiempo continuo de staking.
* **Factor de calidad de reputación:** Va de 0.75 (reputación pobre) a 1.25 (reputación excelente). Los pesos de la fórmula de reputación están on-chain (`qorechaind query reputation params`).
* **Multiplicador de fase del protocolo:** Se ajusta a medida que la red madura a través de distintas fases (bootstrap, crecimiento, madurez).

---

## Slashing {#slashing}

Las penalizaciones base por infracción, consultables en vivo y vigentes al momento de escribir esto:

```bash
qorechaind query slashing params
```

| Parámetro | Valor |
| --- | --- |
| Ventana de bloques firmados | 10,000 bloques (aproximadamente 8.9 horas en mainnet a 3.2 s por bloque; menos en la testnet) |
| Mínimo firmado por ventana | 5% (`min_signed_per_window` = 0.05): un validador es encarcelado cuando firma **menos del 5%** de los últimos 10,000 bloques, es decir, cuando pierde más del 95% |
| Duración del encarcelamiento por inactividad | 600 segundos (10 minutos) |
| Fracción de slashing por inactividad | 1% del stake |
| Fracción de slashing por doble firma | 5% del stake |

El encarcelamiento es un tiempo de espera fijo de 10 minutos con una penalización fija. El unbonding tarda 21 días (1,814,400 s), el conjunto activo admite como máximo 100 validadores (`max_validators`) y cada delegador puede tener como máximo 7 entradas de unbonding (`max_entries`). El modelo progresivo descrito a continuación es un diseño aparte que superpondría consecuencias adicionales y crecientes sobre las infracciones reincidentes; todavía no está integrado.

## Slashing Progresivo

:::note Diseño, todavía no activo
El slashing progresivo está implementado en `x/qca`, pero no está integrado en el slashing: las penalizaciones vigentes son los valores estándar de `x/slashing` de la tabla anterior. Los parámetros de abajo son el diseño (`qorechaind query qca config`).
:::

El diseño de slashing progresivo escala las penalizaciones para infractores reincidentes, permitiendo al mismo tiempo que los validadores se recuperen con el tiempo:

```
penalty = base_rate * escalation^effective_count * severity
```

| Parámetro                          | Valor           |
| ------------------------------------ | --------------- |
| Penalización máxima por evento       | 33% del stake    |
| Vida media de decaimiento            | 100,000 bloques  |
| Severidad por inactividad            | 1.0              |
| Severidad por doble firma            | 2.0              |
| Severidad por ataque de light client | 3.0              |

1. **Cada infracción incrementa el contador efectivo.** Cada infracción (inactividad, doble firma, etc.) incrementa el contador efectivo del validador, lo cual afecta las penalizaciones futuras.

2. **La penalización escala exponencialmente.** La penalización escala según el contador efectivo usando la fórmula anterior, de modo que los infractores reincidentes enfrentan penalizaciones mucho mayores.

3. **El contador efectivo decae con el tiempo.** El contador efectivo decae con una vida media de 100,000 bloques (unos 3.7 días con los bloques de 3.2 s de la mainnet), permitiendo que los validadores se recuperen tras un período de buen comportamiento.

4. **Eventos únicos frente a infracciones repetidas.** Un único evento accidental de inactividad resulta en una penalización menor, mientras que las infracciones repetidas desencadenan consecuencias exponencialmente crecientes.

---

## Registro de Clave PQC {#pqc-key-registration}

Registra tu **clave pública criptográfica post-cuántica (PQC)** (ML-DSA-87) **antes** de ejecutar `create-validator`, y lo antes posible: el panel [Validator Readiness](/dashboard/tools-hub#validator-application) la comprueba desde el momento en que presentas tu solicitud. Esto **no es opcional ni automático**: la cadena exige una firma híbrida PQC en cada transacción por la vía Cosmos, `MsgCreateValidator` no es uno de los tipos de mensaje exentos y ninguna cuenta registra su clave automáticamente: el registro es una transacción explícita que cada cuenta (incluidos los operadores de validador) debe enviar por sí misma, con antelación. Genera primero la clave:

```bash
qorechaind tx pqc gen-key mypqc          # prints the public key (hex); stored unencrypted under ~/.qorechaind/pqc/
```

```bash
qorechaind tx pqc register-key-v2 dilithium5 <pubkey-hex> hybrid \
  --from mykey \
  --pqc-key mypqc \
  --chain-id qorechain-vladi \
  --gas 600000 --fees 60000uqor \
  -y
```

`--pqc-key mypqc` adjunta una **prueba de posesión**: la clave firma `qorechain-pqc-pop-v1|chainid|algo|address|hex(pubkey)` y la cadena la verifica, de modo que nadie puede registrar una clave pública cuya mitad privada no tenga. Es opcional en v3.2.3 y recomendable.

:::note Qué cambió v3.2.3 en el registro de claves
* Una cuenta **sin** clave registrada solo puede enviar el propio registro: cualquier otra transacción que lleve una extensión de firma híbrida se rechaza. Registra primero y luego firma todo lo demás con `tx pqc cosign`.
* Las claves `classical_only`, vacías y degeneradas se rechazan en el registro.
* Una vez que una cuenta tiene una clave, cualquier mantenimiento posterior de la clave (rotación, migración, nuevo registro) debe estar a su vez firmado de forma híbrida y no puede enviarse a través de `authz`.
* `tx pqc gen-key` nunca sobrescribe un archivo de clave existente.
:::

| Parámetro      | Descripción                                                |
| -------------- | ------------------------------------------------------------ |
| `dilithium5`   | Algoritmo (ML-DSA-87)                                         |
| `<pubkey-hex>` | Clave pública ML-DSA-87 de 2592 bytes en codificación hex     |
| `hybrid`       | Tipo de clave (hybrid = clásico + PQC combinados)             |

(`qorechaind tx pqc register-key <pubkey-hex> hybrid` es la forma heredada equivalente para Dilithium-5.)

:::caution Establece `--gas` explícitamente
La clave pública ML-DSA-87 ocupa 2,592 bytes, y escribirla on-chain puede superar el límite de gas por defecto de 200,000 (los registros en mainnet han usado entre 220,000 y 350,000 de gas). Sin `--gas 600000` (o superior), la transacción puede fallar con un error opaco `out of gas`. La comisión debe ser al menos el límite de gas multiplicado por 0.1 uqor, así que `--gas 600000` requiere `--fees 60000uqor` o más.
:::

Verificar el registro:

```bash
qorechaind query pqc account <account-address>
```

El archivo de clave bajo `~/.qorechaind/pqc/` es la clave de firma post-cuántica de la cuenta: respáldalo como la mnemónica y, en la medida de lo posible, mantenlo fuera de la máquina que ejecuta la clave de consenso. Ver [Firma Post-Cuántica](/developer-guide/post-quantum-signing#pqc-key-registration) para recuperación y rotación.

---

## Monitoreo

### Métricas de Prometheus

QoreChain expone métricas de Prometheus en el puerto **26660**:

```
http://localhost:26660/metrics
```

Activa el endpoint con `prometheus = true` en la sección `[instrumentation]` de `config.toml`. El nodo expone las métricas estándar del motor de consenso (altura de bloque, rondas de consenso, conjunto de validadores, peers, mempool); lista lo que sirve tu nodo con `curl -s localhost:26660/metrics | grep -i -E 'height|validator|peers|mempool'`. La salud de firma por validador se lee de forma más fiable desde la propia cadena (ver Verificaciones de Salud más abajo), ya que su propio registro es el que decide el encarcelamiento.

### Consultar Parámetros de Reputación

```bash
# Formula weights only (there is no per-validator score query)
qorechaind query reputation params
```

Vía JSON-RPC:

> **Aún no disponible:** ninguna compilación publicada del nodo sirve el espacio de nombres JSON-RPC `qor_`, por lo que esta llamada devuelve `-32601` (método no encontrado) en todos los endpoints públicos hoy. Ver [el espacio de nombres `qor_`](/api-reference/json-rpc-qor_-namespace).

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getReputationScore",
    "params": ["qorvaloper1..."],
    "id": 1
  }'
```

### Verificaciones de Salud

```bash
# Node status
qorechaind status | jq '.sync_info'

# Validator signing info (uptime, missed blocks)
qorechaind query slashing signing-info $(qorechaind comet show-validator)

# Check if your validator is in the active set
qorechaind query staking validators --status BOND_STATUS_BONDED | grep "my-validator"
```

---

## Buenas Prácticas Operativas

1. **Usa una arquitectura de nodos sentry.** Ejecuta tu validador detrás de nodos sentry para protegerlo de ataques DDoS. Expón solo los nodos sentry a la red pública.

2. **Configura alertas.** Configura alertas para bloques perdidos, uptime bajo y reinicios inesperados. Unos pocos bloques perdidos son normales; las pérdidas sostenidas activarán slashing.

3. **Mantén un uptime alto.** El tiempo de inactividad sostenido hace que el validador sea encarcelado (menos del 5% de los últimos 10,000 bloques firmados) y sufra slashing; ver [Slashing](#slashing).

4. **Mantén el software actualizado.** Sigue las versiones de QoreChain y aplica las actualizaciones con prontitud. Coordínate con la comunidad de validadores para las actualizaciones de cadena.

5. **Asegura tus claves.** Usa un módulo de seguridad de hardware (HSM) o un firmante remoto para la clave de consenso del validador. Nunca almacenes las claves en la misma máquina que el nodo.

6. **Registra primero una clave PQC.** La cuenta del operador necesita una clave ML-DSA-87 registrada antes de poder crear un validador o enviar cualquier otra transacción de la vía Cosmos.

7. **Mantén el reloj sincronizado.** Ejecuta un cliente NTP; desde v3.2.1 el nodo se detiene cuando su reloj se desvía más de 60 segundos.

---

## Referencia de Comandos del Validador

```bash
# Edit validator metadata
qorechaind tx staking edit-validator \
  --new-moniker "new-name" \
  --website "https://myvalidator.com" \
  --details "Description of my validator" \
  --from mykey --gas 400000 --fees 40000uqor --generate-only > tx.json

# Unjail after downtime slashing
qorechaind tx slashing unjail --from mykey --gas 300000 --fees 30000uqor --generate-only > tx.json

# Delegate additional stake
qorechaind tx staking delegate $(qorechaind keys show mykey --bech val -a) \
  500000000uqor --from mykey --gas 400000 --fees 40000uqor --generate-only > tx.json

# Withdraw rewards and commission
qorechaind tx distribution withdraw-rewards $(qorechaind keys show mykey --bech val -a) \
  --commission --from mykey --gas 400000 --fees 40000uqor --generate-only > tx.json

# Sign and broadcast any of the above (hybrid signature):
qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

El mínimo de comisión de la red es de 0.1 uqor por unidad de gas. Una cuenta de operador que **no** tiene una clave PQC registrada todavía puede enviar `unjail` de forma clásica; una vez registrada una clave, toda transacción (unjail incluido) necesita la firma híbrida.

---

## Validar Redes Conectadas {#connected-networks}

:::caution Ninguna red conectada está activa todavía
El módulo del bridge está desplegado en mainnet y testnet, pero **ninguna ruta del bridge está activa**: las 37 configuraciones de cadena están en estado `pending`, no hay validadores del bridge registrados, nunca se ha creado ninguna operación del bridge y no existen canales IBC. El framework de abajo describe el diseño; hoy no hay nada que validar en una red conectada.
:::

El diseño (desde la versión de cadena **v3.1.80**) permite que un validador de QoreChain también ayude a validar las redes conectadas a través del [bridge](/architecture/bridge-architecture). Es **opt-in y está sujeto a licencia**:

1. **Poseer la licencia.** El validador debe tener una licencia activa `validator_<chain>` (o `qcb_bridge`) para la red objetivo. El orquestador se niega a iniciar un cliente externo sin ella (fail-closed).
2. **La activación aprovisiona el cliente automáticamente.** Cuando se activa la licencia, QoreChain aprovisiona el cliente de la red correspondiente en tu nodo: descarga el cliente fijado, renderiza su configuración y lo ejecuta bajo la orquestación de QoreChain. No se descarga nada hasta la activación.
3. **Aporta las claves y el stake de la red.** El validador/stake y las claves de firma de la red externa son **suministrados por el operador** para cada red; QoreChain proporciona el framework de drivers y el gate de licencia obligatorio, no tu stake en la cadena externa.

Existen drivers para las **37 redes del bridge**, clasificadas según cómo puede participar un validador:

| Clase | Participación | Ejemplos |
| ----- | -------------- | -------- |
| Validador sin permisos (permissionless) | Hacer stake y ejecutar | Solana, Ethereum, Avalanche, Sui, Aptos, Cardano, Tezos, Algorand, Starknet |
| Con tope / electo / por admisión | Hacer stake, sujeto a un tope o elección | BSC, Polygon, Polkadot, TRON, Sei, Injective, NEAR, Hedera |
| Nodo completo L2 | Ejecutar un nodo completo (sin staking) | Optimism, Base, zkSync Era, Linea, Scroll, Arbitrum |
| Sin staking / lista de confianza | Observar / participar sin hacer stake | Bitcoin, Filecoin, XRPL, Stellar |

:::note
Las versiones fijadas de los clientes son best-effort; verifica la versión del cliente upstream para tu red objetivo antes de una activación en producción.
:::

## Próximos Pasos

* [Ejecutar un Nodo](/developer-guide/running-a-node) — Instala el binario de release, state sync y ajustes del nodo
* [Desarrollo EVM](/developer-guide/evm-development) — Despliega contratos inteligentes en QoreChain
* [Firma Post-Cuántica](/developer-guide/post-quantum-signing) — Registro de claves, recuperación y rotación
