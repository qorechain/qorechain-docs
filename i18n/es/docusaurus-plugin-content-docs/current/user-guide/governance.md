---
slug: /user-guide/governance
title: Gobernanza
sidebar_label: Gobernanza
sidebar_position: 3
---

# Gobernanza

Esta guía explica cómo funciona la gobernanza on-chain en QoreChain, incluido el sistema de votación Quadratic Delegation-Reputation Weighted (QDRW), cómo presentar propuestas y cómo votar.

:::note
Los comandos a continuación usan la testnet **`qorechain-diana`** (EVM chain ID **9800**). La mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) está activa desde el 7 de junio de 2026 ejecutando la versión de cadena **v3.1.80** — sustituye el chain ID y los endpoints de mainnet de la página **Conexión a Mainnet** al participar en la gobernanza en mainnet.
:::

---

## Poder de voto: fórmula QDRW

QoreChain usa la fórmula **Quadratic Delegation-Reputation Weighted (QDRW)** para calcular el poder de voto. Este sistema evita el dominio de las ballenas a la vez que recompensa a los participantes que han ganado puntuaciones de reputación altas y se han comprometido con la gobernanza mediante el staking de xQORE.

```
VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)
```

| Variable                  | Descripción                                                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `VP`                      | Poder de voto efectivo                                                                                                          |
| `staked`                  | Total de tokens QOR en stake por el votante                                                                                     |
| `xQORE`                   | Cantidad de tokens de gobernanza xQORE que se posee (consulta [Staking de xQORE](/user-guide/xqore-staking))                    |
| `r`                       | Puntuación de reputación del votante, normalizada a \[0, 1]                                                                     |
| `ReputationMultiplier(r)` | Función sigmoide que mapea la reputación a un multiplicador en el rango \[0.5, 2.0]                                             |

### Propiedades clave

* **Amortiguación cuadrática:** Un poseedor con 100 veces el stake de otro votante obtiene solo \~10 veces el poder de voto, no 100 veces. Esto garantiza que la influencia en la gobernanza escale de forma sublineal con la riqueza.
* **Bonificación de xQORE:** Los tokens xQORE cuentan con un **peso 2x** dentro de la raíz cuadrada, lo que otorga una ventaja significativa a los participantes comprometidos con la gobernanza.
* **Multiplicador de reputación:** Mapea la puntuación de reputación del votante de \[0, 1] a un multiplicador en \[0.5, 2.0] usando una curva sigmoide. Los participantes con alta reputación pueden duplicar su poder de voto efectivo, mientras que los de baja reputación ven su influencia reducida a la mitad.

---

## Presentación de una propuesta

Cualquier poseedor de QOR puede presentar una propuesta de gobernanza. Se requiere un depósito mínimo para que la propuesta entre en el período de votación.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Archivo de propuesta de ejemplo** (`proposal.json`):

```json
{
  "title": "Increase Maximum Validator Count",
  "description": "This proposal increases the maximum active validator set from 100 to 150 to improve decentralization.",
  "type": "parameter_change",
  "changes": [
    {
      "subspace": "staking",
      "key": "MaxValidators",
      "value": "150"
    }
  ],
  "deposit": "10000000uqor"
}
```

---

## Votación de propuestas

Una vez que una propuesta entra en el período de votación, cualquier staker puede emitir un voto:

```bash
qorechaind tx gov vote <proposal_id> <option> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Opciones de voto:**

| Opción         | Descripción                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| `yes`          | Apoyar la propuesta                                                                                      |
| `no`           | Oponerse a la propuesta                                                                                  |
| `abstain`      | Reconocer la propuesta sin tomar una posición                                                            |
| `no_with_veto` | Oponerse a la propuesta y señalar que no debería haberse presentado (quema el depósito si se alcanza el umbral) |

**Ejemplo:**

```bash
qorechaind tx gov vote 1 yes \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Tipos de propuesta

QoreChain admite los siguientes tipos de propuesta de gobernanza:

| Tipo                 | Descripción                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| **Texto**            | Una propuesta de señalización sin ejecución automática on-chain. Se usa para sondeos de sentimiento de la comunidad. |
| **Cambio de parámetro** | Modifica uno o más parámetros de protocolo on-chain (por ejemplo, máximo de validadores, tasa de emisión). |
| **Actualización de software** | Programa una actualización coordinada de la cadena a una altura de bloque especificada.   |
| **Gasto comunitario** | Solicita fondos de la tesorería comunitaria para una dirección de destinatario especificada.   |

---

## Consulta de propuestas

Lista todas las propuestas:

```bash
qorechaind query gov proposals
```

Consulta una propuesta específica por su ID:

```bash
qorechaind query gov proposal <proposal_id>
```

Comprueba el recuento actual de votos de una propuesta:

```bash
qorechaind query gov tally <proposal_id>
```

Consulta tu propio voto sobre una propuesta:

```bash
qorechaind query gov vote <proposal_id> <voter_address>
```

---

## Parámetros de gobernanza

Consulta los parámetros de gobernanza actuales:

```bash
qorechaind query gov params
```

Los parámetros clave incluyen:

| Parámetro            | Descripción                                                      |
| -------------------- | ---------------------------------------------------------------- |
| `min_deposit`        | Depósito mínimo requerido para que una propuesta entre en votación |
| `max_deposit_period` | Ventana de tiempo para alcanzar el depósito mínimo               |
| `voting_period`      | Duración del período de votación una vez que una propuesta está activa |
| `quorum`             | Participación mínima requerida para una votación válida          |
| `threshold`          | Porcentaje mínimo de "sí" para aprobar (excluyendo las abstenciones) |
| `veto_threshold`     | Porcentaje mínimo de "no con veto" para rechazar y quemar el depósito |

---

:::tip

* Construye reputación antes de las votaciones de gobernanza importantes para maximizar tu multiplicador de poder de voto.
* Bloquea QOR en xQORE para obtener una bonificación de peso de gobernanza de 2x dentro de la fórmula QDRW.
* Usa `no_with_veto` con cuidado. Si se alcanza el umbral de veto, el depósito de la propuesta se quema.
* Las propuestas que no alcanzan el depósito mínimo dentro del período de depósito se eliminan automáticamente.

:::
