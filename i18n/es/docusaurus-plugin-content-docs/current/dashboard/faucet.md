---
slug: /dashboard/faucet
title: Grifo
sidebar_label: Grifo
sidebar_position: 9
---

# Grifo

El **Grifo** te da tokens de prueba gratuitos para que puedas probar el Panel sin gastar nada de valor. Es una herramienta **exclusiva de testnet**: úsala en testnet (`qorechain-diana`) para financiar tu dirección antes de probar transferencias, swaps, staking y despliegue de contratos.

:::caution Solo testnet — sin valor real
El QOR de testnet **no tiene valor real**. El Grifo nunca toca mainnet: no existe un grifo para QOR de mainnet, y nada de lo que reclames aquí puede moverse a mainnet.
:::

## Solicitar tokens de prueba

1. Inicia sesión, cambia el Panel a **testnet** y abre el **Grifo**.
2. Introduce la dirección que quieres financiar (`qor1...`). Si tu monedero está conectado, selecciona **Use my address** para rellenarla automáticamente. El formulario confirma que la dirección es válida antes de que puedas continuar.
3. Selecciona el botón de solicitud. La financiación se procesa en segundos.

Cuando la solicitud tiene éxito, una tarjeta de confirmación muestra la cantidad enviada y el hash de la transacción, con un botón de copiar y un enlace para abrir la transacción en el [Explorador](/dashboard/explorer). Desde el 27 de octubre de 2026 una solicitud también puede pagar los tres [tokens de prueba Fest](#fest-tokens); la tarjeta muestra entonces una fila **Fest tokens** con lo que llegó, o una breve nota si solo se enviaron los QOR.

## Límites

Cada dirección puede solicitar al Grifo una vez por periodo de espera. La página muestra la cantidad exacta por solicitud y el periodo de espera antes de que puedas volver a reclamar. Si solicitas de nuevo demasiado pronto, el Grifo te indica cuándo serás elegible la próxima vez.

## Tokens de prueba Fest (fUSD, fETH, fBTC) {#fest-tokens}

Existen tres tokens de prueba adicionales en la testnet para el fest de builders: **fUSD** (FestUSD, 6 decimales), **fETH** (FestETH, 18 decimales) y **fBTC** (FestBTC, 8 decimales). Son simples tokens de prueba sin valor y sin vínculo con ningún activo real. La gobernanza de la testnet los registró en el módulo ERC-20 (propuesta 26 de la testnet), de modo que cada uno existe tanto como contrato ERC-20 en la EVM de la testnet como como moneda bank que los monederos y el AMM pueden mantener. El Grifo está configurado para enviar algo de cada uno con una solicitud de QOR (en el momento de redactar esto, 27 de octubre de 2026: 1.000 fUSD, 0,5 fETH y 0,02 fBTC, con el mismo periodo de espera de 24 horas que el QOR); la página muestra las cantidades exactas junto a la cantidad de QOR siempre que el Grifo los paga.

| Token | Decimales | Contrato ERC-20 en la EVM de la testnet | Denominación bank (distingue mayúsculas) |
| --- | --- | --- | --- |
| fUSD | 6 | `0x97143B771D34ddb9130b807b135Ae675A5a963CA` | `erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA` |
| fETH | 18 | `0x02292293c13880a26242690eb70a0e42B8E91c28` | `erc20:0x02292293c13880a26242690eb70a0e42B8E91c28` |
| fBTC | 8 | `0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | `erc20:0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` |

Cosas que conviene saber:

- **Solo testnet.** Los tokens no existen en mainnet.
- **Copia la denominación exactamente.** La parte de la dirección está en mayúsculas y minúsculas EIP-55 y la denominación se compara distinguiendo mayúsculas de minúsculas.
- **Míralos on-chain.** `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` lista las tres denominaciones con sus símbolos y nombres para mostrar.
- **Convertir entre las dos formas.** Pasar un saldo ERC-20 a monedas bank (`MsgConvertERC20`) requiere el remitente como una dirección bech32 `qor1...`.
- **Pools.** El [AMM](/architecture/amm) de la testnet puede agruparlos frente a `uqor`; si existe un pool lo muestra `GET /qorechain/amm/v1/pools`. Las páginas del [Monedero](/dashboard/wallet) y de [Operar](/dashboard/trade) no tienen una entrada dedicada para ellos; consulta un saldo con `GET /cosmos/bank/v1beta1/balances/{address}`.

## Qué hacer con los tokens de prueba

Los tokens de prueba te permiten ejercitar la red de principio a fin en testnet:

- Envía y recibe en la página del [Monedero](/dashboard/wallet).
- Prueba un [swap](/dashboard/trade) en el AMM.
- [Delega](/dashboard/staking-and-validators) a un validador.
- Despliega y prueba contratos antes de pasar a mainnet.

:::note Solo valor de prueba
Los tokens del Grifo existen en testnet y no tienen valor real. Cuando estés listo para uso en producción, cambia a mainnet (`qorechain-vladi`).
:::
