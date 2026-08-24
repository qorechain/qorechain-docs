---
slug: /user-guide/staking-and-delegation
title: Staking y Delegación
sidebar_label: Staking y Delegación
sidebar_position: 2
---

# Staking y Delegación

Esta guía explica cómo delegar tokens QOR a validadores, redelegar entre validadores, retirar tu stake (unbonding), reclamar recompensas y entender la arquitectura de staking Triple-Pool de QoreChain.

:::note
Los comandos a continuación usan la testnet **`qorechain-diana`** (chain ID EVM **9800**). La mainnet (**`qorechain-vladi`**, chain ID EVM **9801**) está activa desde el 7 de junio de 2026 ejecutando la versión de cadena **v3.1.92** — sustituye el chain ID y los endpoints de mainnet desde la página **Conectando a Mainnet** al hacer staking en mainnet.
:::

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

:::caution
No puedes redelegar tokens que ya están en tránsito de redelegación. Espera a que la redelegación actual se complete antes de iniciar otra.
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

Las recompensas de staking se financian desde el pool de staking del protocolo de 590M QOR bajo el calendario de Tokenomics v2.1, junto con la parte del staker (10%) de cada comisión de transacción.

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

## Recompensas por Curva de Bonding

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
* La redelegación es instantánea pero tiene restricciones de enfriamiento (cooldown). Planifica tus movimientos con cuidado.
* El período de unbonding de 21 días es una medida de seguridad. Durante este tiempo, los eventos de slashing aún pueden afectar tus tokens.

:::
