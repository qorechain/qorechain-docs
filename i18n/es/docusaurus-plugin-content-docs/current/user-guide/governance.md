---
slug: /user-guide/governance
title: Gobernanza
sidebar_label: Gobernanza
sidebar_position: 3
---

# Gobernanza

Esta guía explica cómo funciona la gobernanza on-chain en QoreChain: cómo se cuentan los votos, cómo presentar propuestas y cómo votar.

:::note
Los comandos a continuación usan la testnet **`qorechain-diana`** (EVM chain ID **9800**). La mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) está activa desde el 7 de junio de 2026 y ejecuta la versión **v3.2.5** desde el 29 de octubre de 2026 (v3.2.4 desde el 23 de octubre); la testnet ejecuta **v3.2.6** (desde el 27 de octubre de 2026) — sustituye el chain ID y los endpoints de mainnet de la página **Conexión a Mainnet** al participar en la gobernanza en mainnet.
:::

:::caution Firma con `tx pqc cosign`
Mainnet y testnet exigen una firma híbrida poscuántica en cada transacción del carril Cosmos, por lo que los comandos de esta página no se difunden tal como están escritos. Añade `--generate-only > tx.json` a un comando y ejecuta después `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>`. Consulta [Firma híbrida](/cli-reference/transaction-commands#hybrid-signing).
:::

---

## Poder de voto {#voting-power}

Las propuestas se cuentan sobre el **stake vinculado (bonded)**: cada QOR que hayas delegado a un validador vinculado cuenta como una unidad de poder de voto, sin multiplicador. Si no votas tú mismo, tu delegación sigue el voto de tu validador; emitir tu propio voto lo anula para tu stake. Una propuesta se aprueba cuando se cumplen todas las condiciones siguientes:

| Regla     | Valor actual | Significado                                                                   |
| --------- | ---------- | ----------------------------------------------------------------------------- |
| Quórum    | 33.4%      | Proporción del stake vinculado que debe votar                                 |
| Umbral    | 50%        | Proporción de "sí" entre los votos no abstenidos necesaria para aprobar       |
| Veto      | 33.4%      | Si "no con veto" alcanza esta proporción, la propuesta se rechaza y su depósito se quema |

Estos valores se leyeron de mainnet el 27 de octubre de 2026. La testnet tiene los mismos depósitos, quórum y umbrales, pero periodos de votación mucho más cortos (votación de 4 horas, votación acelerada de 1 hora); confírmalos con `qorechaind query gov params`, ya que la gobernanza puede cambiarlos.

:::note QDRW está diseñado pero no está activo
El diseño de QoreChain incluye una fórmula de poder de voto **Quadratic Delegation-Reputation Weighted (QDRW)**, `VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)`, que amortiguaría los stakes grandes y ponderaría la reputación. Está implementada en el módulo `x/qca`, pero está **desactivada** en ambas redes (`qdrw_enabled` es `false` en `qorechaind query qca config`) y no forma parte del recuento de gobernanza, por lo que hoy no afecta a ningún voto. xQORE tampoco está activo (consulta [Staking de xQORE](/user-guide/xqore-staking)).
:::

---

## Presentación de una propuesta

Cualquier poseedor de QOR puede presentar una propuesta de gobernanza. Se requiere un depósito mínimo para que la propuesta entre en el período de votación.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Archivo de propuesta de ejemplo** (`proposal.json`). Una propuesta es una lista de mensajes que el módulo de gobernanza ejecuta si se aprueba, más un título, un resumen y un depósito. Esta eleva el número máximo de validadores de 100 a 150; `authority` es la cuenta del módulo de gobernanza (`qorechaind query auth module-account gov`):

```json
{
  "messages": [
    {
      "@type": "/cosmos.staking.v1beta1.MsgUpdateParams",
      "authority": "qor10d07y265gmmuvt4z0w9aw880jnsr700jwfyxr3",
      "params": {
        "unbonding_time": "1814400s",
        "max_validators": 150,
        "max_entries": 7,
        "historical_entries": 10000,
        "bond_denom": "uqor",
        "min_commission_rate": "0.000000000000000000"
      }
    }
  ],
  "metadata": "",
  "deposit": "10000000uqor",
  "title": "Increase maximum validator count",
  "summary": "Raise the active validator set from 100 to 150 to improve decentralization.",
  "expedited": false
}
```

`MsgUpdateParams` reemplaza todo el conjunto de parámetros, así que copia los valores actuales de `qorechaind query staking params` y cambia solo el campo que quieras modificar. Una propuesta solo de texto (de señalización) usa `"messages": []`. `qorechaind tx gov draft-proposal` genera un esqueleto.

---

## Votación de propuestas

Una vez que una propuesta entra en el período de votación, cualquier staker puede emitir un voto:

```bash
qorechaind tx gov vote <proposal_id> <option> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
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
  --gas 400000 --fees 40000uqor
```

---

## Tipos de propuesta

Una propuesta lleva cero o más mensajes que se ejecutan si se aprueba. Casos habituales:

| Tipo                 | Descripción                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| **Texto**             | Una propuesta de señalización sin mensajes y sin ejecución automática on-chain. Se usa para sondeos de sentimiento de la comunidad. |
| **Cambio de parámetro** | El mensaje `MsgUpdateParams` de un módulo, enviado por la cuenta del módulo de gobernanza. Reemplaza todo el conjunto de parámetros de ese módulo. |
| **Actualización de software** | Un mensaje `MsgSoftwareUpgrade` que programa una actualización coordinada de la cadena a una altura de bloque especificada.   |
| **Gasto comunitario** | Un mensaje `MsgCommunityPoolSpend` que envía fondos del pool comunitario a una dirección de destinatario.   |
| **Expedita**        | Establece `"expedited": true` para un período de votación más corto con un depósito y un umbral de aprobación más altos (ver más abajo). Desde v3.2.5 (ambas redes), una propuesta expedita que no supera el recuento y se convierte en propuesta regular conserva los votos ya emitidos; antes de v3.2.5 esos votos se perdían. |

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

| Parámetro            | Descripción                                                      | Valor en mainnet (27 oct. 2026) |
| -------------------- | ---------------------------------------------------------------- | ------------------------ |
| `min_deposit`        | Depósito mínimo requerido para que una propuesta entre en votación | 10 QOR (`10000000uqor`)  |
| `max_deposit_period` | Ventana de tiempo para alcanzar el depósito mínimo               | 2 días                   |
| `voting_period`      | Duración del período de votación una vez que una propuesta está activa | 2 días                   |
| `quorum`             | Participación mínima requerida para una votación válida          | 0.334                    |
| `threshold`          | Porcentaje mínimo de "sí" para aprobar (excluyendo las abstenciones) | 0.5                      |
| `veto_threshold`     | Porcentaje mínimo de "no con veto" para rechazar y quemar el depósito | 0.334                    |
| `expedited_voting_period` / `expedited_threshold` / `expedited_min_deposit` | Período de votación, umbral de aprobación y depósito de las propuestas expeditas | 1 día / 0.667 / 50 QOR |

---

## La gobernanza en mainnet hasta ahora {#mainnet-history}

La gobernanza de mainnet se ha usado para cambios de parámetros, decisiones de cortacircuitos, actualizaciones coordinadas y, desde octubre de 2026, para liberar cantidades que la cadena registró en la actualización v3.2.0. Las propuestas 7 a 14 se aprobaron en mainnet en octubre de 2026, incluidas la propuesta 12 (otra liberación, aprobada el 21 de octubre) y la propuesta 13 (la actualización v3.2.4, aplicada en la altura 3,742,566 el 23 de octubre) y la propuesta 14 (la actualización v3.2.5, aplicada en la altura 3,906,833 el 29 de octubre de 2026); la lista y los resultados están en el [Historial de versiones](/appendix/version-history#governance-timeline), y cada propuesta puede leerse en vivo en `GET /cosmos/gov/v1/proposals`.

---

:::tip

* Vota antes de que termine el período de votación; tu voto solo se cuenta si se emite mientras la propuesta está en el período de votación.
* Usa `no_with_veto` con cuidado. Si se alcanza el umbral de veto, el depósito de la propuesta se quema.
* Las propuestas que no alcanzan el depósito mínimo dentro del período de depósito se eliminan automáticamente.

:::
