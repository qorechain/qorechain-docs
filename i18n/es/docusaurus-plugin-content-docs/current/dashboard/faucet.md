---
slug: /dashboard/faucet
title: Grifo
sidebar_label: Grifo
sidebar_position: 9
---

# Grifo

El **Grifo** paga tokens de prueba gratuitos a una dirección de testnet para que puedas probar el Panel, los monederos y los contratos sin gastar nada de valor. Es para cualquiera que necesite QOR de testnet (y, durante el fest de builders, tres tokens de prueba) para probar transferencias, swaps, herramientas de staking y despliegue de contratos en la testnet `qorechain-diana`.

:::caution Solo testnet, sin valor real
El QOR de testnet **no tiene valor real**. El Grifo nunca toca mainnet: no existe un grifo para QOR de mainnet, y nada de lo que reclames aquí puede moverse a mainnet.
:::

## Innovaciones {#innovations}

- **Una solicitud, dos tipos de token.** Una solicitud paga 100 QOR y, en una transacción aparte, 1,000 fUSD, 0.5 fETH y 0.02 fBTC. Si falla el envío del fest, el QOR llega igualmente y la tarjeta de resultado lo indica.
- **Un doble periodo de espera.** Una solicitud cada 24 horas por cuenta **y** por dirección. El hueco se reserva antes de enviar nada y se libera si el envío falla, así que una solicitud fallida no consume tu día.
- **Los tokens del fest son monedas bank nativas.** Son denominaciones bank `erc20:0x...` que el AMM on-chain, los envíos bank, IBC y los contratos de QoreChain Native usan tal cual. MetaMask o un DEX de EVM solo los ven tras una conversión con `MsgConvertCoin` (consulta [Tokens de prueba del fest](#fest-tokens)).
- **Un destinatario `0x` se paga en su gemela `qor1`.** Una dirección `0x` son los mismos 20 bytes que su forma `qor1`, así que el servicio paga a la misma cuenta. El propio formulario del Panel solo acepta `qor1...`.

## Cómo usarlo {#how-to-use}

1. **Inicia sesión.** Sin sesión iniciada, la página muestra "Sign in to access the faucet."
2. Abre el **Grifo**. En **Request Tokens**, bajo **Wallet Address**, usa "Select a wallet" o **Use my address ->** para rellenar una de tus billeteras del Panel, o escribe una dirección `qor1...`.
3. La línea informativa dice "You can request 100 QOR once every 24 hours" más las cantidades del fest.
4. Selecciona **Request Tokens**.
5. Si tiene éxito, la tarjeta muestra **Tokens Sent!** con la cantidad, una fila **Fest tokens** (lo que llegó, o una breve nota si solo se enviaron los QOR), el hash de la transacción con un botón de copiar y **View on Explorer**.
6. Si solicitas de nuevo demasiado pronto, aparece "Rate Limit Reached" y "Rate limited for another HH:MM".

La comprobación de la dirección en el formulario es ligera: busca el prefijo `qor` y una longitud de al menos 10 caracteres, y rechaza la entrada `0x...`. Comprueba tú mismo la dirección antes de enviar.

Una solicitud al Grifo también cuenta para las [misiones](/dashboard/quests) del grifo.

**Ejemplo mínimo:** inicia sesión, abre el Grifo, selecciona **Use my address ->**, selecciona **Request Tokens** y luego **View on Explorer** con el encabezado en Testnet.

### Tokens de prueba del fest (fUSD, fETH, fBTC) {#fest-tokens}

Existen tres tokens de prueba adicionales en la testnet para el fest de builders: **fUSD** (FestUSD, 6 decimales), **fETH** (FestETH, 18 decimales) y **fBTC** (FestBTC, 8 decimales). No tienen valor ni vínculo con ningún activo real. La gobernanza de la testnet los registró en el módulo ERC-20 (propuesta 26 de la testnet), de modo que cada uno existe tanto como contrato ERC-20 en la EVM de la testnet como como moneda bank que los monederos y el AMM pueden mantener. El Grifo está configurado para enviar algo de cada uno con una solicitud de QOR (en el momento de redactar esto, 27 de octubre de 2026: 1,000 fUSD, 0.5 fETH y 0.02 fBTC, con el mismo periodo de espera de 24 horas); la página muestra las cantidades exactas junto a la cantidad de QOR siempre que los paga. Los tokens del fest llegan en una transacción aparte; su hash no se muestra en la tarjeta.

| Token | Decimales | Contrato ERC-20 en la EVM de la testnet | Denominación bank (distingue mayúsculas) |
| --- | --- | --- | --- |
| fUSD | 6 | `0x97143B771D34ddb9130b807b135Ae675A5a963CA` | `erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA` |
| fETH | 18 | `0x02292293c13880a26242690eb70a0e42B8E91c28` | `erc20:0x02292293c13880a26242690eb70a0e42B8E91c28` |
| fBTC | 8 | `0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | `erc20:0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` |

- **Solo testnet.** Los tokens no existen en mainnet.
- **Copia la denominación exactamente.** La parte de la dirección está en mayúsculas y minúsculas EIP-55 y la denominación se compara distinguiendo mayúsculas de minúsculas.
- **Míralos on-chain.** `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` lista las tres denominaciones con sus símbolos y nombres para mostrar.
- **Usarlos desde MetaMask o un DEX de EVM.** El Grifo paga monedas bank. Para mantener una como ERC-20 en MetaMask o en un DEX de EVM, conviértela con `MsgConvertCoin` (remitente tu dirección `qor1...`, destinatario una dirección `0x...` y la denominación exacta con mayúsculas y minúsculas). Devolverla es `MsgConvertERC20`. Los pasos y las cifras de gas están en [Desarrollo EVM](/developer-guide/evm-development#fest-tokens).
- **Pools.** El [AMM](/architecture/amm) de la testnet puede agruparlos frente a `uqor`; si existe un pool lo muestra `GET /qorechain/amm/v1/pools`. La pestaña Tokens del [Monedero](/dashboard/wallet) y [Operar](/dashboard/trade) no tienen una entrada para ellos; consulta un saldo con `GET /cosmos/bank/v1beta1/balances/{address}`.

### Qué hacer con los tokens de prueba

- Envía y recibe en la página del [Monedero](/dashboard/wallet).
- Prueba un [swap](/dashboard/trade) con los tokens de prueba de QoreSwap.
- Despliega y prueba contratos desde el [Creador de contratos inteligentes](/dashboard/smart-contract-creator) antes de pasar a mainnet.
- Prueba la configuración de un nodo o validador en testnet con las herramientas de [Nodos y validadores](/dashboard/tools-hub).

## Cómo acceder {#how-to-access}

- **URL:** [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet).
- **Cuenta:** se requiere iniciar sesión. No hace falta conectar un monedero; puedes pegar cualquier dirección `qor1...`.
- **Red:** el Grifo **siempre paga en la testnet** `qorechain-diana`, diga lo que diga el encabezado. No necesitas cambiar el encabezado a testnet para solicitar. Cámbialo a testnet solo para que **View on Explorer** abra la red correcta; con el encabezado en mainnet ese enlace muestra "Transaction Not Found".
- **Coste:** gratis.

## Dónde se publica {#where-published}

| Superficie | Dirección | Red | Cuenta |
| --- | --- | --- | --- |
| Página del Grifo | `dashboard.qorechain.io/faucet` | Solo testnet `qorechain-diana` | Requiere iniciar sesión |
| Metadatos de los tokens del fest | `api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` | Testnet | Ninguna |

## Límites y problemas conocidos {#limits}

- **100 QOR una vez cada 24 horas**, por cuenta y por dirección. Los tokens del fest siguen el mismo periodo de espera.
- **No hay grifo de mainnet.** El QOR de testnet nunca es intercambiable por QOR de mainnet.
- **El formulario rechaza las direcciones `0x`** y solo hace una comprobación ligera de `qor`.
- **El envío del fest puede fallar por sí solo;** el QOR se paga igualmente y la tarjeta lo indica. Espera al periodo de espera o comprueba tu saldo antes de reintentar.
- **Los tokens del fest no aparecen** en la pestaña Tokens del Monedero.
