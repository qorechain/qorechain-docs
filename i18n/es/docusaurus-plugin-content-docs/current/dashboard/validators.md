---
slug: /dashboard/validators
title: Validators
sidebar_label: Validators
sidebar_position: 12
---

# Validators

La página **Validators** lista los validadores de la red que has seleccionado, con tarjetas de resumen, un cuadro de búsqueda y, para cada validador, su rango, poder de voto, comisión, estado y una cifra de rendimiento variable leída de la cadena. Es una herramienta de comparación de solo lectura para quienes deciden dónde delegar. No tiene botón de delegar: el staking se hace en la página Wallet, consulta [Staking y validadores](/dashboard/staking-and-validators).

## Innovaciones {#innovations}

- **La lista sigue a la red seleccionada.** La página pide el conjunto de la red elegida en el encabezado, así que quien ve mainnet ve los validadores de mainnet y quien ve testnet ve los de testnet.
- **Rendimiento leído de la cadena, con sus límites a la vista.** La columna APY es la tasa base del staking-tier de la cadena multiplicada por (1 menos la comisión del validador). Se muestra con un asterisco y la nota "variable, not guaranteed, lock bonuses not included". La cifra es una lectura en vivo de una tasa de protocolo variable, no una promesa ni una previsión.
- **"From fees" pasado el tope de emisión.** Una red que ha superado su tope de emisión muestra **From fees** en lugar de un porcentaje, porque ya no se acuña QOR nuevo y el staking solo gana entonces con las comisiones de transacción. En testnet la columna muestra actualmente **From fees**. Un valor desconocido muestra un guion, nunca 0.00%.
- **Rango por poder de voto.** El rango se calcula a partir del poder de voto, así que el rango 1 es el validador con más stake.
- **Huecos honestos.** La región, los bloques propuestos, la versión del software y la última vez visto se muestran solo cuando la fuente de datos los proporciona, y un uptime desconocido muestra **N/A** en lugar de 0%.

## Cómo usarlo {#how-to-use}

1. Inicia sesión y abre la página por su dirección, `dashboard.qorechain.io/validators`. No hay enlace en la barra lateral.
2. Elige la red en el encabezado (**Mainnet** o **Testnet**); la página se recarga con los validadores de esa red.
3. Lee las tarjetas de resumen: **Active Validators**, **Total Bonded**, **Avg Commission** y **Avg Uptime**.
4. Busca con el cuadro "Search by moniker or address".
5. Lee cada fila: el rango y el moniker con la dirección (y un botón de copiar), **Voting power** (stake y porcentaje del total), **Commission**, **APY** y **Status** (active, jailed o inactive), y después el uptime y los detalles opcionales.
6. Para delegar, ve a la pestaña **Stake / Delegate** de la página Wallet ([Delegar](/dashboard/staking-and-validators#delegate)). Para ver un validador con más detalle, abre su página de dirección en el [Explorador](/dashboard/explorer#validators).

:::caution Lee la nota del APY
El porcentaje depende de una tasa de protocolo que puede cambiar y de la comisión del validador. Los bonos por bloqueo del módulo opcional de staking con bloqueo temporal no están incluidos. No lo trates como un ingreso garantizado.
:::

## Cómo acceder {#how-to-access}

- **URL:** [dashboard.qorechain.io/validators](https://dashboard.qorechain.io/validators). Solo se llega por la dirección; la barra lateral no la lista.
- **Inicio de sesión:** obligatorio. Sin sesión, la página muestra "Authentication Required".
- **Red:** sigue el selector del encabezado.
- **Wallet:** no hace falta ninguna para leer la página.
- **Coste:** gratis.

## Dónde está publicado {#where-published}

| Superficie | Dirección | Redes | Inicio de sesión |
| --- | --- | --- | --- |
| Página Validators | `dashboard.qorechain.io/validators` | Mainnet y testnet, selector del encabezado | Obligatorio |
| Tabla de validadores del Explorador | `dashboard.qorechain.io/explorer/validators` | Mainnet y testnet | No obligatorio |
| Datos de la cadena | `GET /cosmos/staking/v1beta1/validators` en `api.qore.host` y `api-testnet.qore.host` | Mainnet y testnet | Ninguno |

## Límites y problemas conocidos {#limits}

- **La página es de solo lectura** y no está enlazada desde la barra lateral.
- **El APY es variable y no está garantizado.** Excluye los bonos por bloqueo y muestra **From fees** donde se ha alcanzado el tope de emisión.
- **Menos campos de datos que un panel de nodos:** la región, los bloques propuestos, la versión del software y la última vez visto se muestran solo cuando están disponibles, y el uptime puede mostrar N/A.
- **Los validadores jailed** se muestran como jailed y no se ofrecen en el panel de Delegate.
- **Los datos se almacenan en caché un breve tiempo** (unos 30 segundos), así que un cambio en la cadena puede tardar un momento en aparecer.
