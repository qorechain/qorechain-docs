---
slug: /user-guide/staking-and-delegation
title: Staking y Delegación
sidebar_label: Staking y Delegación
sidebar_position: 2
---

# Staking y Delegación

Esta guía explica cómo delegar tokens QOR a validadores, redelegar entre validadores, retirar tu stake (unbonding), reclamar recompensas y entender qué partes del diseño de staking de QoreChain están activas hoy.

:::note
Los comandos a continuación usan la testnet **`qorechain-diana`** (chain ID EVM **9800**). La mainnet (**`qorechain-vladi`**, chain ID EVM **9801**) está activa desde el 7 de junio de 2026 y ejecuta la versión **v3.2.3**; la testnet ejecuta **v3.2.4** — sustituye el chain ID y los endpoints de mainnet desde la página **Conectando a Mainnet** al hacer staking en mainnet.
:::

:::caution Firma con `tx pqc cosign`
Mainnet y testnet exigen una firma híbrida post-cuántica en cada transacción del carril Cosmos, por lo que los comandos de esta página no se difunden tal como están escritos. Añade `--generate-only > tx.json` a un comando y luego ejecuta `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>`. Consulta [Firma híbrida](/cli-reference/transaction-commands#hybrid-signing). [QoreX](/qorex/portfolio-and-staking) y el [panel de control](/dashboard/staking-and-validators) realizan esta firma por ti.
:::

## ¿Existe un período de bloqueo? {#lock-in-period}

**En mainnet hoy**, no — no hay que elegir un plazo, porque el staking aquí no se ofrece en duraciones fijas como suele ocurrir en un exchange. La delegación permanece activa con recompensas fluyendo desde el siguiente bloque, durante todo el tiempo que quieras, hasta que decidas retirarla (undelegate); no hay nada que expire ni que renovar. El **período de unbonding de 21 días** que verás mencionado a lo largo de esta guía no es un bloqueo que aceptes de antemano — solo comienza cuando *solicitas* retirar la delegación, y solo se aplica al QOR que estás retirando. Mover una delegación entre validadores (redelegar) evita completamente esa espera, ya que el stake nunca sale del pool bonded. El término de "lealtad" de la [curva de bonding](#bonding-curve) más abajo forma parte del diseño de QoreChain, pero **la cadena activa no lo aplica hoy**, por lo que el tiempo que permanezcas delegando no cambia tu tasa de recompensa. Una forma opcional de staking con bloqueo temporal está ya en la testnet y está prevista para mainnet desde la altura 3,742,566; consulta [Staking con bloqueo temporal (v3.2.4)](#time-locked-staking).

Esto describe el comportamiento actual de la mainnet, no una garantía permanente — un período mínimo de staking es un parámetro que la gobernanza podría introducir en el futuro, de la misma manera que cualquier otro parámetro de staking en esta página puede cambiar por votación. Si eso llegara a ocurrir, el wallet mostrará la espera resultante (cualquier mínimo más el unbonding de 21 días) antes de que confirmes una delegación, y esta página se actualizará para reflejarlo.

---

## Delegar Tokens

Delega QOR a un validador para participar en la seguridad de la red. Los delegadores reciben una parte de las recompensas que gana el validador, menos la comisión del validador:

```bash
qorechaind tx staking delegate <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Ejemplo:** Delegar 100 QOR a un validador:

```bash
qorechaind tx staking delegate qorvaloper1abc...xyz 100000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

---

## Redelegar

Mueve tu delegación de un validador a otro sin esperar el período de unbonding:

```bash
qorechaind tx staking redelegate <source_validator> <destination_validator> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Ejemplo:**

```bash
qorechaind tx staking redelegate qorvaloper1src... qorvaloper1dst... 50000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

Redelegar **no tiene penalización ni bloqueo propio** — el stake nunca sale del pool bonded, nunca deja de generar recompensas y surte efecto de inmediato. No está sujeto en absoluto al período de unbonding de 21 días; eso solo se aplica a `unbond`. Se aplica una regla estándar de staking: el stake que acabas de mover **a** un validador no puede volver a redelegarse **desde** ese validador hasta que el primer movimiento haya madurado (21 días); mientras tanto, aún puedes hacer `unbond` de él o redelegar el resto de tu stake.

:::caution El verdadero límite es un recuento, no un enfriamiento
Un delegador puede tener como máximo **7 entradas de redelegación simultáneas en curso** para exactamente la misma ruta (delegador, validador origen, validador destino) — cada entrada se libera por sí sola al madurar, liberando un cupo. Este es un tope que el uso normal prácticamente nunca alcanza, no una regla general de "espera antes de poder redelegar de nuevo".
:::

---

## Unbonding

Retira tus tokens delegados de un validador. El unbonding tarda **21 días** en completarse, período durante el cual los tokens no generan recompensas y no pueden transferirse.

```bash
qorechaind tx staking unbond <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Ejemplo:**

```bash
qorechaind tx staking unbond qorvaloper1abc...xyz 25000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

Después del período de unbonding de 21 días (1,814,400 segundos), los tokens se devuelven automáticamente a tu cuenta. Un delegador puede tener como máximo 7 entradas de unbonding simultáneas por validador.

---

## Reclamar Recompensas

Retira todas las recompensas de staking acumuladas de cada validador al que hayas delegado:

```bash
qorechaind tx distribution withdraw-all-rewards \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

Para retirar recompensas de un validador específico únicamente:

```bash
qorechaind tx distribution withdraw-rewards <validator_address> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

Las recompensas de staking se financian desde dos fuentes: el presupuesto de emisión limitado del protocolo (consulta [Tokenomics](/architecture/tokenomics#staking-reward-schedule) para el monto actual por época y el tope, ambos fijados por gobernanza — el más reciente, la propuesta 10 del 19 de octubre de 2026) y la parte del staker de cada comisión de transacción (pagada como una recompensa de staking normal desde la actualización v3.2.0; consulta [la parte del staker varada](/architecture/tokenomics#stranded-and-reserve)). Las recompensas dependen de la comisión del validador y de la actividad de la red, y no están garantizadas.

---

## Staking con bloqueo temporal (v3.2.4) {#time-locked-staking}

:::note Cuándo se aplica
La versión v3.2.4 añade un módulo opcional de staking con bloqueo temporal, `x/stakingtier`. Está activo en la **testnet `qorechain-diana`** desde el 19 de octubre de 2026 y está previsto para **mainnet desde la altura 3,742,566** (propuesta de gobernanza 13; mainnet ejecuta v3.2.3 hasta ese bloque). Hasta la actualización de mainnet, la delegación en mainnet no tiene bloqueo (consulta [arriba](#lock-in-period)); a partir de la actualización, el bloqueo está disponible como opción y la delegación ordinaria sigue sin bloqueo. El mecanismo descrito a continuación se comprobó con los parámetros en vivo de la testnet.
:::

Un delegador puede comprometer parte de una delegación existente a un validador durante un plazo fijo de 3, 6 o 12 meses. Los plazos y los montos son parámetros de la cadena; lee los actuales en `GET /qorechain/stakingtier/v1/params` en lugar de en esta página.

* **El bloqueo es opcional.** La delegación, la redelegación y el unbonding ordinarios funcionan exactamente como se describe en esta página. Solo el monto bloqueado está restringido: mientras un bloqueo está abierto no se puede retirar la delegación ni redelegar, y esto se cumple por cualquier ruta (transacción, authz, group, contrato, gobernanza).
* **Bloqueo mínimo** de 10 QOR, y como máximo 16 bloqueos abiertos por delegador.
* **Se permite el desbloqueo anticipado**: termina el bloqueo, se pierde la recompensa de bloqueo que no se haya pagado y se quema una penalización tomada del monto bloqueado (5% en los parámetros de la testnet, registrada bajo la fuente de quema `staking_tier_penalty`); el resto permanece delegado y desbloqueado.
* **El slashing** se aplica a una delegación bloqueada como a cualquier otra; el bloqueo se reduce junto con la delegación.
* **Reclamación.** Un bloqueo gana un componente de recompensa adicional por época, fijado por los parámetros del módulo; se paga cuando lo reclamas, no de forma automática. Esta página no cita tasas: lee `params` para ver los ajustes en vivo.
* **Al vencer** el bloqueo se libera y la delegación continúa como una delegación ordinaria.

Los comandos están disponibles por la línea de comandos y por las rutas REST `GET /qorechain/stakingtier/v1/params`, `/locks/{holder}` y `/pool`; el monto es un número entero de `uqor` (1 QOR = 1,000,000 uqor).

```bash
qorechaind tx stakingtier lock <validator_address> <amount_in_uqor> <months> --from mykey \
  --chain-id qorechain-diana --gas 400000 --fees 40000uqor --generate-only > tx.json
qorechaind tx stakingtier unlock-early <lock_id> --from mykey --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor --generate-only > tx.json
qorechaind tx stakingtier claim --from mykey --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor --generate-only > tx.json
qorechaind query stakingtier locks <holder_address>
```

El chain ID anterior es el de la testnet; usa `qorechain-vladi` en mainnet una vez que haya aplicado la actualización v3.2.4. Como en el resto de esta página, firma cada transacción generada con `tx pqc cosign`.

---

## Clasificación Triple-Pool (estado del diseño)

El diseño de QoreChain incluye un modelo **Triple-Pool** que clasificaría a los validadores en tres pools según su reputación y sus niveles de delegación, con una parte ponderada de las recompensas de bloque para cada pool:

| Pool                                  | Criterio de Entrada                                                    | Peso de Recompensa en el Diseño |
| -------------------------------------- | ------------------------------------------------------------------------ | ------------------- |
| **RPoS** (Reputation Proof of Stake)   | Puntuación de reputación >= percentil 70 **Y** stake >= mediana          | 40%                  |
| **DPoS** (Delegated Proof of Stake)    | Delegación total >= 10,000 QOR                                          | 35%                  |
| **PoS** (Proof of Stake)               | Todos los validadores restantes                                          | 25%                  |

:::note No activo en las redes en producción
La clasificación en pools, la selección de proponente ponderada por pool y los pesos de recompensa por pool están implementados en el módulo `x/qca` y sus parámetros están on-chain (`qorechaind query qca config`), pero **todavía no están conectados a la producción de bloques ni a la distribución de recompensas**. Hoy la propuesta de bloques rota por stake de la forma estándar y las recompensas se reparten en proporción al stake bonded, menos la comisión de cada validador. El pool al que "pertenece" un validador no cambia lo que recibes.
:::

---

## Recompensas por Curva de Bonding {#bonding-curve}

El diseño de QoreChain también define una fórmula de recompensas por curva de bonding:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Variable | Descripción                                                              |
| -------- | -------------------------------------------------------------------------- |
| `R`      | Monto de recompensa para el período                                       |
| `beta`   | Tasa base de recompensa (parámetro del protocolo)                         |
| `S`      | Monto en stake                                                             |
| `alpha`  | Coeficiente de lealtad (parámetro del protocolo)                          |
| `L`      | Duración del staking en épocas                                            |
| `Q(r)`   | Multiplicador de calidad derivado de la puntuación de reputación `r` del validador |
| `P(t)`   | Multiplicador de pool en el momento `t` (40%, 35% o 25% según el pool)    |

:::note No activo en las redes en producción
El cálculo de la curva de bonding, al igual que la clasificación en pools anterior, **no es invocado por la cadena activa**: las recompensas no se calculan con esta fórmula, y ni la duración del staking ni la reputación del validador las modifican hoy. Los parámetros (`bonding_alpha`, `bonding_beta`) existen on-chain pero no tienen efecto.
:::

---

## Slashing y Jailing

El slashing en QoreChain sigue el módulo estándar de slashing del Cosmos SDK con estos parámetros activos (`qorechaind query slashing params`):

| Evento               | Regla                                                                | Consecuencia                                 |
| -------------------- | -------------------------------------------------------------------- | -------------------------------------------- |
| Inactividad (downtime) | Firmar menos del 5% de los últimos 10,000 bloques (unas 8.9 horas con los bloques de aproximadamente 3.2 segundos de la mainnet) | Encarcelado (jailed) durante 600 segundos; 1% del stake sancionado (slashed) |
| Doble firma (double-signing) | Firmar dos bloques distintos a la misma altura               | 5% del stake sancionado (slashed)            |

El slashing se aplica al stake bonded total de un validador, por lo que los delegadores asumen su parte proporcional. También puede alcanzar el stake que ya está en unbonding desde un validador sancionado, razón por la cual el período de unbonding es una medida de seguridad y no solo un tiempo de espera.

---

## Consultar Información de Validadores

Consulta los detalles de cualquier validador:

```bash
qorechaind query staking validator <validator_operator_address>
```

**Ejemplo:**

```bash
qorechaind query staking validator qorvaloper1abc...xyz
```

Lista todos los validadores activos:

```bash
qorechaind query staking validators --status BOND_STATUS_BONDED
```

Consulta tus delegaciones actuales:

```bash
qorechaind query staking delegations <delegator_address>
```

---

:::tip

* Revisa la comisión, la disponibilidad y el historial de un validador antes de delegar; el pool o la reputación de un validador no cambia actualmente las recompensas que recibes.
* La redelegación surte efecto de inmediato, sin penalización y sin bloqueo. Los límites son el tope de 7 entradas para redelegaciones simultáneas por la misma ruta exacta y la regla de que el stake recién redelegado no puede moverse desde el validador destino hasta que madure.
* El período de unbonding de 21 días es una medida de seguridad. Durante este tiempo, los eventos de slashing aún pueden afectar tus tokens.

:::
