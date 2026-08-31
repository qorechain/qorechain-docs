---
slug: /user-guide/staking-and-delegation
title: Staking y Delegación
sidebar_label: Staking y Delegación
sidebar_position: 2
---

# Staking y Delegación

Esta guía explica cómo delegar tokens QOR a validadores, redelegar entre validadores, retirar tu stake (unbonding), reclamar recompensas y entender la arquitectura de staking Triple-Pool de QoreChain.

:::note
Los comandos a continuación usan la testnet **`qorechain-diana`** (chain ID EVM **9800**). La mainnet (**`qorechain-vladi`**, chain ID EVM **9801**) está activa desde el 7 de junio de 2026 ejecutando la versión de cadena **v3.1.95** — sustituye el chain ID y los endpoints de mainnet desde la página **Conectando a Mainnet** al hacer staking en mainnet.
:::

## ¿Existe un período de bloqueo? {#lock-in-period}

**Hoy**, no — no hay que elegir un plazo, porque el staking aquí no se ofrece en duraciones fijas como suele ocurrir en un exchange. La delegación permanece activa con recompensas fluyendo desde el siguiente bloque, durante todo el tiempo que quieras, hasta que decidas retirarla (undelegate); no hay nada que expire ni que renovar. El **período de unbonding de 21 días** que verás mencionado a lo largo de esta guía no es un bloqueo que aceptes de antemano — solo comienza cuando *solicitas* retirar la delegación, y solo se aplica al QOR que estás retirando. Mover una delegación entre validadores (redelegar) evita completamente esa espera, ya que el stake nunca sale del pool bonded. El bono de "lealtad" mencionado más abajo en la [curva de bonding](#bonding-curve) es, además, un efecto en la tasa de recompensa según *cuánto tiempo llevas delegando hasta ahora* — es automático y tampoco requiere elegir un plazo, simplemente crece cuanto más tiempo mantengas la delegación sin retirarla.

Esto describe el comportamiento actual de la cadena, no una garantía permanente — un período mínimo de staking es un parámetro que la gobernanza podría introducir en el futuro, de la misma manera que cualquier otro parámetro de staking en esta página puede cambiar por votación. Si eso llegara a ocurrir, el wallet mostrará la espera resultante (cualquier mínimo más el unbonding de 21 días) antes de que confirmes una delegación, y esta página se actualizará para reflejarlo.

---

## Delegar Tokens

Delega QOR a un validador para ganar recompensas de staking y participar en la seguridad de la red:

```bash
qorechaind tx staking delegate <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Ejemplo:** Delegar 100 QOR a un validador:

```bash
qorechaind tx staking delegate qorvaloper1abc...xyz 100000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Redelegar

Mueve tu delegación de un validador a otro sin esperar el período de unbonding:

```bash
qorechaind tx staking redelegate <source_validator> <destination_validator> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Ejemplo:**

```bash
qorechaind tx staking redelegate qorvaloper1src... qorvaloper1dst... 50000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Redelegar **no tiene penalización ni bloqueo propio** — el stake nunca sale del pool bonded, nunca deja de generar recompensas y puede volver a moverse en cualquier momento. No está sujeto en absoluto al período de unbonding de 21 días; eso solo se aplica a `unbond`.

:::caution El verdadero límite es un recuento, no un enfriamiento
Un delegador puede tener como máximo **7 entradas de redelegación simultáneas en curso** para exactamente la misma ruta (delegador, validador origen, validador destino) — cada entrada se libera por sí sola al madurar, liberando un cupo. Este es un tope que el uso normal prácticamente nunca alcanza, no una regla de "espera antes de poder redelegar de nuevo"; puedes redelegar libremente hacia o desde otros validadores, o repetir la misma ruta una vez que se libere un cupo.
:::

---

## Unbonding

Retira tus tokens delegados de un validador. El unbonding tarda **21 días** en completarse, período durante el cual los tokens no generan recompensas y no pueden transferirse.

```bash
qorechaind tx staking unbond <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Ejemplo:**

```bash
qorechaind tx staking unbond qorvaloper1abc...xyz 25000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Después del período de unbonding de 21 días, los tokens se devuelven automáticamente a tu cuenta.

---

## Reclamar Recompensas

Retira todas las recompensas de staking acumuladas de cada validador al que hayas delegado:

```bash
qorechaind tx distribution withdraw-all-rewards \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Para retirar recompensas de un validador específico únicamente:

```bash
qorechaind tx distribution withdraw-rewards <validator_address> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Las recompensas de staking se financian desde dos fuentes: el presupuesto de emisión limitado del protocolo (consulta [Tokenomics](/architecture/tokenomics#staking-reward-schedule) para el tope actual, vigente desde un cambio de gobernanza del 26 de agosto de 2026) y la parte del staker de cada comisión de transacción.

---

## Clasificación Triple-Pool

QoreChain utiliza un modelo de staking **Triple-Pool** que clasifica a los validadores en tres pools según su reputación y sus niveles de delegación. Cada pool recibe una parte ponderada de las recompensas de bloque.

| Pool                                  | Criterio de Entrada                                                    | Peso de Recompensa |
| -------------------------------------- | ------------------------------------------------------------------------ | ------------------- |
| **RPoS** (Reputation Proof of Stake)   | Puntuación de reputación >= percentil 70 **Y** stake >= mediana          | 40%                  |
| **DPoS** (Delegated Proof of Stake)    | Delegación total >= 10,000 QOR                                          | 35%                  |
| **PoS** (Proof of Stake)               | Todos los validadores restantes                                          | 25%                  |

Los validadores se reclasifican en cada límite de época. Un validador que construye una reputación sólida y acumula suficiente stake es promovido al pool RPoS, obteniendo la mayor parte de recompensa.

---

## Recompensas por Curva de Bonding {#bonding-curve}

Las recompensas de staking individuales se calculan usando la fórmula de curva de bonding de QoreChain:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Variable | Descripción                                                              |
| -------- | -------------------------------------------------------------------------- |
| `R`      | Monto de recompensa para el período                                       |
| `beta`   | Tasa base de recompensa (parámetro del protocolo)                         |
| `S`      | Monto en stake                                                             |
| `alpha`  | Coeficiente de lealtad (parámetro del protocolo)                          |
| `L`      | Duración del bloqueo en épocas                                            |
| `Q(r)`   | Multiplicador de calidad derivado de la puntuación de reputación `r` del validador |
| `P(t)`   | Multiplicador de pool en el momento `t` (40%, 35% o 25% según el pool)    |

Duraciones de bloqueo más largas y puntuaciones de reputación más altas producen recompensas proporcionalmente mayores, incentivando el compromiso a largo plazo y el buen comportamiento del validador.

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
qorechaind query staking validators --status bonded
```

Consulta tus delegaciones actuales:

```bash
qorechaind query staking delegations <delegator_address>
```

---

:::tip

* Delegar a validadores del **pool RPoS** produce las recompensas más altas debido al peso de pool del 40%.
* Construir la reputación de un validador lleva tiempo. Considera el historial del validador antes de delegar.
* La redelegación es instantánea, sin penalización y sin bloqueo — el único límite es un tope de 7 entradas para redelegaciones simultáneas por la misma ruta exacta, algo que el uso normal no alcanzará.
* El período de unbonding de 21 días es una medida de seguridad. Durante este tiempo, los eventos de slashing aún pueden afectar tus tokens.

:::
