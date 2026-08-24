---
slug: /developer-guide/running-a-validator
title: Ejecutar un Validador
sidebar_label: Ejecutar un Validador
sidebar_position: 9
---

# Ejecutar un Validador

Esta guía cubre cómo crear un validador en la red QoreChain, entender el sistema de clasificación de pools, registrar una clave PQC para seguridad resistente a la computación cuántica, y monitorear tu nodo.

:::note
Esta guía está orientada a la mainnet **`qorechain-vladi`** (chain ID EVM **9801**), activa desde el 7 de junio de 2026 y ejecutando la versión de cadena **v3.1.92**. Se recomienda la testnet **`qorechain-diana`** (chain ID EVM **9800**) para ensayar tu configuración antes de pasar a producción. Sustituye el `--chain-id` adecuado según tu red objetivo.
:::

---

## Requisitos previos

* Un nodo `qorechaind` completamente sincronizado (ver [Conexión a Testnet](/getting-started/connecting-to-testnet))
* Una cuenta con fondos de al menos **1,000 QOR** (1,000,000,000 uqor) para la autodelegación inicial
* Familiaridad con el modelo de [Staking y Delegación](/user-guide/staking-and-delegation)

---

## Crear un Validador

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

| Parámetro                      | Descripción                                              |
| ------------------------------ | --------------------------------------------------------- |
| `--amount`                     | Monto de autodelegación (stake mínimo)                    |
| `--pubkey`                     | Clave pública de consenso del validador (ed25519)         |
| `--moniker`                    | Nombre legible para tu validador                          |
| `--commission-rate`            | Tasa de comisión inicial (p. ej., 0.10 = 10%)              |
| `--commission-max-rate`        | Tasa de comisión máxima (inmutable tras la creación)       |
| `--commission-max-change-rate` | Tasa máxima de cambio diario de comisión                   |
| `--min-self-delegation`        | Cantidad mínima de tokens que el operador debe autodelegar |

Una vez confirmada la transacción, verifica tu validador:

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## Clasificación de Pools

QoreChain utiliza un **sistema de clasificación de tres pools** gestionado por el módulo `x/qca` (Quantum Consensus Allocation). Cada **1,000 bloques**, los validadores se reclasifican en uno de tres pools según su reputación y stake:

| Pool                                  | Criterio                                                     | Asignación de Bloques |
| -------------------------------------- | ------------------------------------------------------------- | ---------------------- |
| **RPoS** (Reputation Proof-of-Stake)   | Reputación >= percentil 70 Y stake >= mediana                 | 40% de los bloques      |
| **DPoS** (Delegated Proof-of-Stake)    | Delegación total >= 10,000 QOR                                 | 35% de los bloques      |
| **PoS** (Proof-of-Stake)               | Todos los demás validadores activos                            | 25% de los bloques      |

Dentro de cada pool, los proponentes de bloque se seleccionan mediante **selección aleatoria ponderada** proporcional a su stake efectivo. La clasificación garantiza que tanto los validadores de alta reputación como los de alta delegación reciban una representación justa, permitiendo a la vez que los validadores más pequeños participen.

### Consultar tu Clasificación de Pool

```bash
qorechaind query qca pool-classification $(qorechaind keys show mykey --bech val -a)
```

Vía JSON-RPC:

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

La recompensa de staking para un validador se determina mediante una curva de bonding que incorpora múltiples factores:

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

* **Bono por duración de lealtad:** Los validadores que hacen staking de forma continua reciben recompensas crecientes mediante el término logarítmico de lealtad. Esto incentiva el compromiso a largo plazo.
* **Factor de calidad de reputación:** Va de 0.75 (reputación pobre) a 1.25 (reputación excelente). La reputación se calcula a partir del uptime, las propuestas exitosas, la participación comunitaria y la calidad de validación de transacciones.
* **Multiplicador de fase del protocolo:** Se ajusta a medida que la red madura a través de distintas fases (bootstrap, crecimiento, madurez).

---

## Slashing Progresivo

QoreChain utiliza un modelo de **slashing progresivo** que escala las penalizaciones para infractores reincidentes, permitiendo al mismo tiempo que los validadores se recuperen con el tiempo:

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

3. **El contador efectivo decae con el tiempo.** El contador efectivo decae con una vida media de 100,000 bloques (~7 días con bloques de 6s), permitiendo que los validadores se recuperen tras un período de buen comportamiento.

4. **Eventos únicos frente a infracciones repetidas.** Un único evento accidental de inactividad resulta en una penalización menor, mientras que las infracciones repetidas desencadenan consecuencias exponencialmente crecientes.

---

## Registro de Clave PQC {#pqc-key-registration}

Los validadores pueden registrar opcionalmente una **clave pública criptográfica post-cuántica (PQC)** usando el algoritmo ML-DSA-87. Esto proporciona seguridad resistente a la computación cuántica para la identidad del validador y puede usarse para firma híbrida.

```bash
qorechaind tx pqc register-key <pubkey-hex> hybrid \
  --from mykey \
  --gas auto \
  -y
```

| Parámetro      | Descripción                                                |
| -------------- | ------------------------------------------------------------ |
| `<pubkey-hex>` | Clave pública ML-DSA-87 de 2592 bytes en codificación hex     |
| `hybrid`       | Modo de registro (hybrid = clásico + PQC combinados)          |

Verificar el registro:

```bash
qorechaind query pqc key <account-address>
```

:::tip
**Recomendación:** el registro de clave PQC es opcional pero se recomienda encarecidamente para los validadores que operan en mainnet. Proporciona una defensa a futuro frente a las amenazas de la computación cuántica.
:::

---

## Monitoreo

### Métricas de Prometheus

QoreChain expone métricas de Prometheus en el puerto **26660**:

```
http://localhost:26660/metrics
```

Métricas clave a monitorear:

| Métrica                          | Descripción                                          |
| ---------------------------------- | ------------------------------------------------------- |
| `qorechain_missed_blocks_total`    | Total de bloques perdidos por tu validador               |
| `qorechain_validator_uptime`       | Porcentaje de uptime en los últimos N bloques             |
| `qorechain_reputation_score`       | Puntuación de reputación actual                          |
| `qorechain_pool_classification`    | Asignación de pool actual (0=PoS, 1=DPoS, 2=RPoS)         |
| `qorechain_consecutive_signed`     | Bloques consecutivos firmados                             |
| `consensus_height`                 | Altura de bloque actual                                   |
| `consensus_rounds`                 | Rondas de consenso para la altura actual                  |

### Consultar Puntuación de Reputación

```bash
qorechaind query reputation score $(qorechaind keys show mykey --bech val -a)
```

Vía JSON-RPC:

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
qorechaind query staking validators --status bonded | grep "my-validator"
```

---

## Buenas Prácticas Operativas

1. **Usa una arquitectura de nodos sentry.** Ejecuta tu validador detrás de nodos sentry para protegerlo de ataques DDoS. Expón solo los nodos sentry a la red pública.

2. **Configura alertas.** Configura alertas para bloques perdidos, uptime bajo y reinicios inesperados. Unos pocos bloques perdidos son normales; las pérdidas sostenidas activarán slashing.

3. **Mantén un uptime alto.** El sistema de reputación premia el uptime consistente. El tiempo de inactividad prolongado degrada tu factor de calidad de reputación, reduciendo las recompensas.

4. **Mantén el software actualizado.** Sigue las versiones de QoreChain y aplica las actualizaciones con prontitud. Coordínate con la comunidad de validadores para las actualizaciones de cadena.

5. **Asegura tus claves.** Usa un módulo de seguridad de hardware (HSM) o un firmante remoto para la clave de consenso del validador. Nunca almacenes las claves en la misma máquina que el nodo.

6. **Registra una clave PQC.** Protege tu validador a futuro frente a las amenazas cuánticas registrando una clave ML-DSA-87.

7. **Monitorea tu pool.** Rastrea tu clasificación de pool cada 1,000 bloques. Mejorar tu reputación puede moverte de PoS a RPoS, aumentando significativamente las oportunidades de proponer bloques.

---

## Referencia de Comandos del Validador

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

## Validar Redes Conectadas {#connected-networks}

A partir de la versión de cadena **v3.1.80**, un validador de QoreChain también puede ayudar a validar las redes conectadas a través del [bridge](/architecture/bridge-architecture). Esto es **opt-in y está sujeto a licencia**:

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

* [Compilación desde el Código Fuente](/developer-guide/building-from-source) — Compila el binario `qorechaind`
* [Desarrollo EVM](/developer-guide/evm-development) — Despliega contratos inteligentes en QoreChain
* [Abstracción de Cuentas](/developer-guide/account-abstraction) — Cuentas programables para las operaciones de tu validador
