---
slug: /developer-guide/running-a-validator
title: Ejecutar un validador
sidebar_label: Ejecutar un validador
sidebar_position: 9
---

# Ejecutar un validador

Esta guía explica cómo crear un validador en la red QoreChain, comprender el sistema de clasificación de grupos, registrar una clave PQC para obtener seguridad resistente a la computación cuántica y monitorizar tu nodo.

:::note
Esta guía está dirigida a la red principal **`qorechain-vladi`** (ID de cadena EVM **9801**), activa desde el 7 de junio de 2026 ejecutando la versión de cadena **v3.1.80**. Se recomienda la red de pruebas **`qorechain-diana`** (ID de cadena EVM **9800**) para ensayar tu configuración antes de pasar a producción. Sustituye el `--chain-id` apropiado para tu red de destino.
:::

---

## Requisitos previos

* Un nodo `qorechaind` completamente sincronizado (consulta [Conexión a la red de pruebas](/getting-started/connecting-to-testnet))
* Una cuenta financiada con al menos **1.000 QOR** (1.000.000.000 uqor) para la autodelegación inicial
* Familiaridad con el modelo de [Staking y delegación](/user-guide/staking-and-delegation)

---

## Crear un validador

```bash
qorechaind tx staking create-validator \
  --amount 1000000000uqor \
  --pubkey $(qorechaind comet show-validator) \
  --moniker "my-validator" \
  --commission-rate 0.10 \
  --commission-max-rate 0.20 \
  --commission-max-change-rate 0.01 \
  --min-self-delegation 1 \
  --from mykey \
  --gas auto \
  --gas-adjustment 1.3 \
  -y
```

| Parámetro                      | Descripción                                            |
| ------------------------------ | ----------------------------------------------------- |
| `--amount`                     | Cantidad de autodelegación (stake mínimo)             |
| `--pubkey`                     | Clave pública de consenso del validador (ed25519)     |
| `--moniker`                    | Nombre legible para tu validador                       |
| `--commission-rate`            | Tasa de comisión inicial (p. ej., 0,10 = 10%)         |
| `--commission-max-rate`        | Tasa de comisión máxima (inmutable tras la creación)  |
| `--commission-max-change-rate` | Tasa máxima de cambio diario de la comisión           |
| `--min-self-delegation`        | Tokens mínimos que el operador debe autodelegar       |

Una vez confirmada la transacción, verifica tu validador:

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## Clasificación de grupos

QoreChain utiliza un **sistema de clasificación de tres grupos** gestionado por el módulo `x/qca` (Quantum Consensus Allocation). Cada **1.000 bloques**, los validadores se reclasifican en uno de los tres grupos según su reputación y su stake:

| Grupo                                | Criterios                                                    | Asignación de bloques |
| ------------------------------------ | ----------------------------------------------------------- | --------------------- |
| **RPoS** (Reputation Proof-of-Stake) | Reputación >= percentil 70 Y stake >= mediana               | 40% de los bloques    |
| **DPoS** (Delegated Proof-of-Stake)  | Delegación total >= 10.000 QOR                               | 35% de los bloques    |
| **PoS** (Proof-of-Stake)             | Todos los demás validadores activos                         | 25% de los bloques    |

Dentro de cada grupo, los proponentes de bloques se seleccionan mediante **selección aleatoria ponderada** proporcional a su stake efectivo. La clasificación garantiza que tanto los validadores con alta reputación como los de alta delegación reciban una representación justa, permitiendo a la vez que los validadores más pequeños participen.

### Consultar tu clasificación de grupo

```bash
qorechaind query qca pool-classification $(qorechaind keys show mykey --bech val -a)
```

A través de JSON-RPC:

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

## Curva de vinculación

La recompensa de staking de un validador se determina mediante una curva de vinculación que incorpora múltiples factores:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Variable | Descripción                                                       |
| -------- | ---------------------------------------------------------------- |
| `R`      | Cantidad de recompensa                                            |
| `beta`   | Tasa de recompensa base                                           |
| `S`      | Stake efectivo                                                    |
| `alpha`  | Constante de escalado de fidelidad                                |
| `L`      | Duración de la fidelidad (tiempo de staking continuo)            |
| `Q(r)`   | Factor de calidad de reputación, rango \[0,75 - 1,25]            |
| `P(t)`   | Multiplicador de fase del protocolo (se ajusta a lo largo del ciclo de vida de la red) |

**Puntos clave:**

* **Bonificación por duración de la fidelidad:** Los validadores que hacen staking de forma continua reciben recompensas crecientes a través del término logarítmico de fidelidad. Esto incentiva el compromiso a largo plazo.
* **Factor de calidad de reputación:** Va de 0,75 (mala reputación) a 1,25 (excelente reputación). La reputación se calcula a partir del tiempo de actividad, las propuestas exitosas, la participación comunitaria y la calidad de la validación de transacciones.
* **Multiplicador de fase del protocolo:** Se ajusta a medida que la red madura a través de distintas fases (arranque, crecimiento, madurez).

---

## Slashing progresivo

QoreChain utiliza un modelo de **slashing progresivo** que escala las penalizaciones para los infractores reincidentes, permitiendo a la vez que los validadores se recuperen con el tiempo:

```
penalty = base_rate * escalation^effective_count * severity
```

| Parámetro                              | Valor          |
| -------------------------------------- | -------------- |
| Penalización máxima por evento         | 33% del stake  |
| Vida media de decaimiento              | 100.000 bloques |
| Severidad por inactividad              | 1.0            |
| Severidad por doble firma              | 2.0            |
| Severidad por ataque de cliente ligero | 3.0            |

1. **Cada infracción incrementa el recuento efectivo.** Toda infracción (inactividad, doble firma, etc.) aumenta el recuento efectivo del validador, lo que afecta a las penalizaciones futuras.

2. **La penalización escala exponencialmente.** La penalización escala según el recuento efectivo usando la fórmula anterior, de modo que los infractores reincidentes se enfrentan a penalizaciones mucho mayores.

3. **El recuento efectivo decae con el tiempo.** El recuento efectivo decae con una vida media de 100.000 bloques (\~7 días con bloques de 6 s), permitiendo a los validadores recuperarse tras un periodo de buen comportamiento.

4. **Eventos únicos frente a infracciones repetidas.** Un único evento de inactividad accidental da lugar a una penalización menor, mientras que las infracciones repetidas desencadenan consecuencias que aumentan de forma exponencial.

---

## Registro de clave PQC

Los validadores pueden registrar opcionalmente una **clave pública criptográfica poscuántica (PQC)** usando el algoritmo ML-DSA-87. Esto proporciona seguridad resistente a la computación cuántica para la identidad del validador y puede usarse para firma híbrida.

```bash
qorechaind tx pqc register-key <pubkey-hex> hybrid \
  --from mykey \
  --gas auto \
  -y
```

| Parámetro      | Descripción                                              |
| -------------- | ------------------------------------------------------- |
| `<pubkey-hex>` | Clave pública ML-DSA-87 de 2592 bytes en codificación hex |
| `hybrid`       | Modo de registro (hybrid = clásico + PQC a la vez)      |

Verifica el registro:

```bash
qorechaind query pqc key <account-address>
```

:::tip
**Recomendación:** El registro de clave PQC es opcional, pero muy recomendable para los validadores que operan en la red principal. Proporciona una defensa con visión de futuro frente a las amenazas de la computación cuántica.
:::

---

## Monitorización

### Métricas de Prometheus

QoreChain expone métricas de Prometheus en el puerto **26660**:

```
http://localhost:26660/metrics
```

Métricas clave a monitorizar:

| Métrica                         | Descripción                                          |
| ------------------------------- | ---------------------------------------------------- |
| `qorechain_missed_blocks_total` | Total de bloques perdidos por tu validador           |
| `qorechain_validator_uptime`    | Porcentaje de actividad en los últimos N bloques     |
| `qorechain_reputation_score`    | Puntuación de reputación actual                       |
| `qorechain_pool_classification` | Asignación de grupo actual (0=PoS, 1=DPoS, 2=RPoS)   |
| `qorechain_consecutive_signed`  | Bloques firmados de forma consecutiva                |
| `consensus_height`              | Altura de bloque actual                              |
| `consensus_rounds`              | Rondas de consenso para la altura actual             |

### Consultar la puntuación de reputación

```bash
qorechaind query reputation score $(qorechaind keys show mykey --bech val -a)
```

A través de JSON-RPC:

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

### Comprobaciones de estado

```bash
# Node status
qorechaind status | jq '.sync_info'

# Validator signing info (uptime, missed blocks)
qorechaind query slashing signing-info $(qorechaind comet show-validator)

# Check if your validator is in the active set
qorechaind query staking validators --status bonded | grep "my-validator"
```

---

## Buenas prácticas operativas

1. **Usa una arquitectura de nodos centinela.** Ejecuta tu validador detrás de nodos centinela para protegerlo de ataques DDoS. Expón a la red pública únicamente los nodos centinela.

2. **Configura alertas.** Configura alertas para bloques perdidos, baja actividad y reinicios inesperados. Algunos bloques perdidos son normales; las pérdidas sostenidas desencadenarán slashing.

3. **Mantén una alta disponibilidad.** El sistema de reputación recompensa la actividad constante. La inactividad prolongada degrada tu factor de calidad de reputación, reduciendo las recompensas.

4. **Mantén el software actualizado.** Sigue las versiones de QoreChain y aplica las actualizaciones con prontitud. Coordínate con la comunidad de validadores para las actualizaciones de la cadena.

5. **Protege tus claves.** Usa un módulo de seguridad de hardware (HSM) o un firmante remoto para la clave de consenso del validador. Nunca almacenes las claves en la misma máquina que el nodo.

6. **Registra una clave PQC.** Prepara tu validador para el futuro frente a amenazas cuánticas registrando una clave ML-DSA-87.

7. **Monitoriza tu grupo.** Sigue tu clasificación de grupo cada 1.000 bloques. Mejorar tu reputación puede moverte de PoS a RPoS, aumentando significativamente las oportunidades de proponer bloques.

---

## Referencia de comandos del validador

```bash
# Edit validator metadata
qorechaind tx staking edit-validator \
  --moniker "new-name" \
  --website "https://myvalidator.com" \
  --details "Description of my validator" \
  --from mykey -y

# Unjail after downtime slashing
qorechaind tx slashing unjail --from mykey -y

# Delegate additional stake
qorechaind tx staking delegate $(qorechaind keys show mykey --bech val -a) \
  500000000uqor --from mykey -y

# Withdraw rewards
qorechaind tx distribution withdraw-rewards $(qorechaind keys show mykey --bech val -a) \
  --commission --from mykey -y
```

---

## Validar redes conectadas {#connected-networks}

A partir de la versión de cadena **v3.1.80**, un validador de QoreChain también puede ayudar a validar las redes conectadas a través del [puente](/architecture/bridge-architecture). Esto está **restringido por licencia y es opcional**:

1. **Posee la licencia.** El validador debe poseer una licencia `validator_<chain>` (o `qcb_bridge`) activa para la red de destino. El orquestador se niega a iniciar un cliente externo sin ella (fallo seguro).
2. **La activación aprovisiona el cliente automáticamente.** Cuando se activa la licencia, QoreChain aprovisiona el cliente de la red correspondiente en tu nodo: descarga el cliente fijado, genera su configuración y lo ejecuta bajo la orquestación de QoreChain. No se descarga nada hasta la activación.
3. **Aporta las claves y el stake de la red.** El validador/stake y las claves de firma de la red externa son **aportados por el operador** para cada red; QoreChain proporciona el marco de drivers y el control de licencia obligatorio, no tu stake de la cadena externa.

Existen drivers para las **37 redes del puente**, clasificadas según cómo puede participar un validador:

| Clase | Participación | Ejemplos |
| ----- | ------------- | -------- |
| Validador sin permisos | Hacer stake y ejecutar | Solana, Ethereum, Avalanche, Sui, Aptos, Cardano, Tezos, Algorand, Starknet |
| Limitado / electo / por admisión | Hacer stake, sujeto a un límite o elección | BSC, Polygon, Polkadot, TRON, Sei, Injective, NEAR, Hedera |
| Nodo completo L2 | Ejecutar un nodo completo (sin staking) | Optimism, Base, zkSync Era, Linea, Scroll, Arbitrum |
| Sin staking / lista de confianza | Observar / participar sin hacer staking | Bitcoin, Filecoin, XRPL, Stellar |

:::note
Las versiones fijadas de los clientes son orientativas; verifica la versión del cliente upstream para tu red de destino antes de una activación en producción.
:::

## Próximos pasos

* [Compilar desde el código fuente](/developer-guide/building-from-source) — Compila el binario `qorechaind`
* [Desarrollo EVM](/developer-guide/evm-development) — Despliega contratos inteligentes en QoreChain
* [Abstracción de cuentas](/developer-guide/account-abstraction) — Cuentas programables para las operaciones de tu validador
