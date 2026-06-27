---
slug: /architecture/chain-licensing
title: Licencias de cadena
sidebar_label: Licencias de cadena
sidebar_position: 9
---

# Licencias de cadena

El módulo `x/license` proporciona **licencias de capacidades** on-chain. Ciertas capacidades restringidas en QoreChain —en particular las funciones de puente y de validador por cadena— requieren que la cuenta que actúa posea una licencia válida para esa capacidad. Una licencia es simplemente un registro on-chain que autoriza a un titular específico (el **concesionario**) a usar una **función** restringida específica.

Las licencias mantienen estas capacidades verificables y autodescriptivas: cualquier integrador, explorador o billetera puede preguntar a la cadena si una cuenta dada está autorizada para una función dada, sin necesidad de ninguna búsqueda off-chain.

## Qué representa una licencia

Cada licencia es un registro indexado por un par `(grantee, feature_id)`:

- **`grantee`** — la cuenta `qor` que la licencia autoriza.
- **`feature_id`** — la capacidad restringida que desbloquea. Los ID de función son identificadores de cadena estables; las capacidades de puente y de validador se nombran por cadena de destino (por ejemplo `bridge_ethereum`, `validator_solana`), junto con funciones generales como las funciones de protocolo de puente y de operador de nodo/validador.
- **`granted_at`** / **`expires_at`** — la altura de bloque en la que se otorgó la licencia y la altura de bloque en la que expira (un valor de `0` significa que no expira).
- **`granted_by`** — la autoridad que emitió la licencia.

Una capacidad restringida tras una función simplemente comprueba, en tiempo de ejecución, si la cuenta que actúa posee una licencia **activa** para esa función.

## Ciclo de vida de una licencia

Una licencia pasa por un pequeño conjunto de estados:

| Estado | Significado |
| --- | --- |
| **Otorgada / Activa** | La licencia existe y autoriza al concesionario. Se considera activa mientras no esté suspendida ni expirada. |
| **Suspendida** | Deshabilitada temporalmente. El registro sigue existiendo, pero la capacidad restringida se deniega hasta que la licencia se reanude. |
| **Revocada** | Eliminada de forma permanente. El concesionario ya no posee la licencia en absoluto. |

Una licencia también deja de estar activa una vez que pasa su altura `expires_at`, incluso si nunca fue suspendida ni revocada.

## Quién puede cambiar las licencias

Otorgar, revocar, suspender y reanudar licencias son **operaciones de autoridad** — las realiza la autoridad de gobernanza de la cadena, no usuarios arbitrarios. Estas transacciones existen como parte de la superficie de comandos del módulo, pero un usuario normal no las invoca directamente; el ciclo de vida lo administra on-chain la autoridad.

Para **obtener** una licencia, los integradores pasan por el **Dashboard (Herramientas → Comprar licencia)**, que gestiona el flujo de solicitud; la autoridad registra entonces la concesión on-chain.

Las transacciones restringidas a la autoridad son:

```bash
# Grant a license for a feature to a grantee (authority signs)
qorechaind tx license grant qor1grantee... bridge_ethereum \
  --expires-at 0 --from qor1authority... --chain-id qorechain-vladi

# Suspend / resume a license
qorechaind tx license suspend qor1grantee... bridge_ethereum --from qor1authority...
qorechaind tx license resume  qor1grantee... bridge_ethereum --from qor1authority...

# Revoke a license permanently
qorechaind tx license revoke qor1grantee... bridge_ethereum --from qor1authority...
```

## Comprobar y verificar una licencia

Los comandos de consulta están abiertos a cualquiera. Son la parte del módulo que los integradores usan a diario: para confirmar que una cuenta está autorizada antes de confiar en una capacidad restringida, o para mostrar el estado de la licencia en una billetera o explorador.

### Comprobar una sola licencia

`check` informa de si un concesionario específico posee una función específica, y de si esa licencia está actualmente **activa**. Esta es la llamada canónica de "¿está esta cuenta autorizada a hacer X?".

```bash
qorechaind query license check qor1grantee... bridge_ethereum
# -> returns the license record and an `active` flag (true / false)
```

La respuesta incluye los detalles de la licencia y un campo booleano `active` que ya tiene en cuenta la suspensión y la expiración, de modo que un `true` significa que el concesionario puede usar la función restringida en este momento.

### Listar las licencias de un concesionario

`list` devuelve todas las licencias que posee una cuenta, en todas las funciones.

```bash
qorechaind query license list qor1grantee...
```

### Listar los titulares de una función

`holders` devuelve todas las cuentas que poseen una licencia para una función dada, útil para enumerar, por ejemplo, quién está autorizado para una capacidad de puente o de validador en particular.

```bash
qorechaind query license holders bridge_ethereum
```

## Resumen de comandos

**Transacciones** (`qorechaind tx license …`) — restringidas a la autoridad / gobernanza:

| Comando | Propósito |
| --- | --- |
| `grant` | Autorizar a un concesionario para una función |
| `revoke` | Eliminar una licencia de forma permanente |
| `suspend` | Deshabilitar temporalmente una licencia |
| `resume` | Reactivar una licencia suspendida |

**Consultas** (`qorechaind query license …`) — abiertas a cualquiera:

| Comando | Propósito |
| --- | --- |
| `check` | Comprobar una licencia `(grantee, feature)` y su estado activo |
| `list` | Listar todas las licencias que posee un concesionario |
| `holders` | Listar todos los concesionarios que poseen una función dada |

## Relacionado

- Las licencias para funciones de puente y de validador respaldan las capacidades descritas en [Arquitectura del puente](/architecture/bridge-architecture).
- Las licencias se obtienen a través del **Dashboard (Herramientas → Comprar licencia)**.
- Los nodos ligeros obtienen una licencia durante el [Registro y licencias](/light-node/registration-and-licensing).
- Compra y gestiona licencias desde el [Centro de herramientas](/dashboard/tools-hub).
