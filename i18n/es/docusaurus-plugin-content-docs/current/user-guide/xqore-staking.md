---
slug: /user-guide/xqore-staking
title: Staking de xQORE
sidebar_label: Staking de xQORE
sidebar_position: 4
---

# Staking de xQORE

Esta guía cubre el mecanismo de staking de gobernanza xQORE, que permite a los poseedores de QOR bloquear sus tokens para obtener un poder de gobernanza mejorado con un modelo de rebase PvP que recompensa a los participantes a largo plazo.

:::note
Los comandos siguientes utilizan la testnet **`qorechain-diana`** (EVM chain ID **9800**). La mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) está activa desde el 7 de junio de 2026 ejecutando la versión de cadena **v3.1.77** — sustituye el chain ID y los endpoints de mainnet de la página **Conectarse a la Mainnet** cuando hagas staking en mainnet.
:::

---

## Visión General

xQORE es el token de staking de gobernanza de QoreChain. Cuando bloqueas QOR, recibes xQORE en una **proporción 1:1**. Poseer xQORE proporciona una ventaja significativa en la gobernanza: los tokens xQORE cuentan con **doble peso** en la fórmula de poder de voto QDRW (consulta [Gobernanza](/user-guide/governance)).

```
VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)
```

Esto significa que bloquear QOR en xQORE duplica efectivamente su impacto en la gobernanza en comparación con el staking regular por sí solo.

---

## Bloquear QOR para Obtener xQORE

Bloquea tokens QOR para acuñar xQORE en una proporción 1:1:

```bash
qorechaind tx xqore lock <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Ejemplo:** Bloquear 1,000 QOR:

```bash
qorechaind tx xqore lock 1000000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Tras esta transacción, tu cuenta tendrá 1,000,000,000 uxqore (1,000 xQORE).

---

## Desbloquear xQORE

Quema xQORE para recuperar QOR. Puede aplicarse una **penalización de salida** dependiendo de cuánto tiempo hayan estado bloqueados los tokens:

```bash
qorechaind tx xqore unlock <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Ejemplo:** Desbloquear 500 xQORE:

```bash
qorechaind tx xqore unlock 500000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Calendario de Penalizaciones de Salida

El retiro anticipado de xQORE conlleva una penalización. Cuanto más tiempo lo mantengas, menor será la penalización:

| Duración del Bloqueo      | Penalización de Salida |
| ------------------ | ------------ |
| Menos de 30 días  | **50%**      |
| De 30 a 90 días      | **35%**      |
| De 90 a 180 días     | **15%**      |
| Más de 180 días | **0%**       |

**Ejemplo:** Si bloqueaste 1,000 QOR y desbloqueas tras 45 días, recibes 650 QOR (penalización del 35% aplicada). Los 350 QOR restantes se redistribuyen a otros poseedores de xQORE a través del mecanismo de rebase PvP.

---

## Mecanismo de Rebase PvP

Las penalizaciones recaudadas de las salidas anticipadas **no se queman**. En su lugar, se redistribuyen proporcionalmente a todos los poseedores restantes de xQORE. Esto crea una dinámica "Jugador contra Jugador" en la que los poseedores pacientes se benefician de la impaciencia de los demás.

Cómo funciona:

1. Un usuario desbloquea xQORE antes del umbral de penalización cero de 180 días.
2. La penalización de salida se deduce de su QOR devuelto.
3. El importe de la penalización se distribuye proporcionalmente entre todas las posiciones restantes de xQORE.
4. El QOR reclamable por xQORE de cada poseedor restante aumenta.

Este mecanismo incentiva el compromiso de gobernanza a largo plazo y recompensa a los poseedores que mantienen sus posiciones.

---

## Consultar Tu Posición

Comprueba tu posición actual de xQORE, la duración del bloqueo y la penalización de salida aplicable:

```bash
qorechaind query xqore position <address>
```

**Ejemplo:**

```bash
qorechaind query xqore position qor1abc...xyz
```

**Salida de ejemplo:**

```yaml
position:
  address: qor1abc...xyz
  locked_amount: "1000000000"
  xqore_balance: "1000000000"
  lock_timestamp: "2026-01-15T12:00:00Z"
  current_penalty_rate: "0.150000000000000000"
  accrued_rebase: "25000000"
```

---

## Acceso vía JSON-RPC

Para las aplicaciones que se integran con QoreChain a través de JSON-RPC, la posición de xQORE puede consultarse usando:

```
qor_getXQOREPosition
```

**Solicitud:**

```json
{
  "jsonrpc": "2.0",
  "method": "qor_getXQOREPosition",
  "params": ["qor1abc...xyz"],
  "id": 1
}
```

**Respuesta:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "locked_amount": "1000000000",
    "xqore_balance": "1000000000",
    "lock_timestamp": "2026-01-15T12:00:00Z",
    "current_penalty_rate": "0.15",
    "accrued_rebase": "25000000"
  }
}
```

---

## Consejos

* Bloquea QOR en xQORE con suficiente antelación a las votaciones de gobernanza importantes para maximizar tu poder de voto.
* El umbral de 180 días para salidas sin penalización recompensa a los participantes pacientes de la gobernanza.
* Monitorea las acumulaciones de rebase PvP. A medida que otros salen anticipadamente, tu posición aumenta de valor.
* xQORE no es transferible. Solo puede acuñarse bloqueando QOR y quemarse desbloqueándolo.
* Considera cuidadosamente la penalización de salida antes de bloquear. Los bloqueos a corto plazo conllevan penalizaciones significativas.
