---
slug: /user-guide/bridging-assets
title: Transferencia de activos mediante puente
sidebar_label: Transferencia de activos mediante puente
sidebar_position: 5
---

# Transferencia de activos mediante puente

Esta guía describe cómo está diseñado el movimiento de activos entre QoreChain y otras redes blockchain. La capa de interoperabilidad de QoreChain se construye en torno a **37 configuraciones de cadena** (36 cadenas externas más Injective, a la que se llega por IBC) y hasta **8 contrapartes IBC** para cadenas del ecosistema Cosmos.

:::caution No está activo en ninguna de las dos redes
El módulo del puente está desplegado en mainnet y testnet, pero **ninguna ruta del puente está activa**: las 37 configuraciones de cadena están en estado `pending` sin contrato de puente establecido, no hay validadores del puente registrados, nunca se ha creado ninguna operación del puente y no existen canales ni clientes IBC. Todo lo que sigue describe el diseño previsto. No envíes activos esperando que se transfieran por el puente. Consulta [Arquitectura del puente](/architecture/bridge-architecture) para ver la tabla de estado actual.
:::

:::note
Los comandos a continuación usan la testnet **`qorechain-diana`** (EVM chain ID **9800**). La mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) ejecuta la versión de cadena **v3.2.1**. Sustituye el chain ID y los endpoints de mainnet de la página **Conexión a Mainnet** una vez que se active una ruta.
:::

---

## Resumen de conexiones

QoreChain está diseñada para ofrecer dos protocolos de puente:

| Protocolo                                 | Conexiones         | Caso de uso                                                              |
| ---------------------------------------- | ------------------ | ------------------------------------------------------------------------ |
| **IBC** (Inter-Blockchain Communication) | hasta 8 canales (ninguno abierto) | Interoperabilidad nativa con cadenas habilitadas para IBC                |
| **QCB** (QoreChain Bridge)               | 37 configuraciones (todas pending) | Transferencias entre cadenas con redes no IBC mediante atestaciones aseguradas con PQC |

Una enumeración completa de cada configuración de cadena se encuentra en la página **Arquitectura del puente**. Esta guía se centra en cómo está diseñada una transferencia por el puente.

---

## IBC

IBC forma parte del diseño (Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon, Injective), pero **todavía no existe ningún canal ni cliente IBC en ninguna de las dos redes**, así que no hay nada que transferir. Esta página listará los canales cuando se abran.

---

## Endpoints del puente QCB

El QoreChain Bridge está diseñado para conectarse a cadenas externas que abarcan múltiples tipos de ecosistema. Una selección representativa de las conexiones planificadas (todas están hoy en `pending`):

| Cadena    | Tipo de cadena |
| --------- | ---------- |
| Ethereum  | EVM        |
| BSC       | EVM        |
| Solana    | Solana     |
| Avalanche | EVM        |
| Polygon   | EVM        |
| Arbitrum  | EVM        |
| TON       | TON        |
| Sui       | Sui Move   |
| Optimism  | EVM        |
| Base      | EVM        |
| Aptos     | Aptos      |
| Bitcoin   | Bitcoin    |
| NEAR      | NEAR       |
| Cardano   | Cardano    |
| Polkadot  | Polkadot   |
| Tezos     | Tezos      |
| Tron      | Tron       |

No se publica ninguna lista de activos: las configuraciones de cadena todavía no incluyen un registro de activos. Consulta la página **Arquitectura del puente** para ver la lista completa de configuraciones de cadena.

---

## Flujo de depósito (de cadena externa a QoreChain)

La secuencia diseñada para un depósito desde una cadena externa hacia QoreChain:

1. **Bloqueo** — Bloquea los tokens en la cadena externa enviándolos al contrato o dirección del puente QCB.
2. **Atestación** — Los validadores del puente observan la transacción de bloqueo y producen atestaciones firmadas con PQC.
3. **Umbral** — Una vez recopiladas **7 de 10** atestaciones de validadores, el puente finaliza el depósito.
4. **Acuñación** — Los tokens envueltos equivalentes se acuñan en QoreChain y se acreditan a tu dirección `qor1...`.

No existe ningún comando ejecutado por el usuario para "iniciar un depósito": bloqueas en la cadena externa, y las atestaciones de los validadores del puente acreditan tu cuenta. (El comando `qorechaind tx bridge deposit` de la cadena acredita un depósito ya atestado y necesita firmas de validadores del puente; no es la forma en que un usuario inicia un depósito.)

---

## Flujo de retiro (de QoreChain a cadena externa)

La secuencia diseñada para un retiro desde QoreChain a una cadena externa:

1. **Quema** — Quema los tokens envueltos en QoreChain.
2. **Atestación** — Los validadores del puente observan la quema y producen atestaciones firmadas con PQC.
3. **Umbral** — Una vez recopiladas **7 de 10** atestaciones, el retiro se finaliza.
4. **Desbloqueo** — Los tokens originales se liberan en la cadena externa hacia la dirección de destino especificada.

**Comando CLI** (bloqueado hoy: ninguna cadena está activa, por lo que la transacción sería rechazada):

```bash
# 1. Build the unsigned transaction
qorechaind tx bridge withdraw [destination-chain] [destination-address] [asset] [amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 300000 --fees 30000uqor \
  --generate-only > withdraw.json

# 2. Attach the post-quantum co-signature and broadcast
qorechaind tx pqc cosign withdraw.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

Toda transacción del carril nativo necesita la cofirma poscuántica híbrida y una comisión de al menos 0.1 uqor por unidad de gas; consulta [Primera transacción](/getting-started/first-transaction).

---

## Modelo de seguridad

El QoreChain Bridge está diseñado para estar protegido por múltiples capas de defensa:

| Mecanismo                    | Descripción                                                                                                                                          |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Multifirma PQC 7-de-10**   | Cada operación del puente requiere atestaciones de al menos 7 de 10 validadores del puente, cada uno usando firmas criptográficas poscuánticas.       |
| **Período de impugnación de 24 horas** | Las transferencias que superan el umbral de transferencia grande (100,000 QOR) entran en una ventana de impugnación de 24 horas durante la cual los validadores u observadores pueden señalar transacciones fraudulentas. |
| **Interruptores automáticos** | Limitadores de tasa automatizados detienen las operaciones del puente si se detectan volúmenes anómalos o patrones sospechosos. Las operaciones del puente se reanudan tras una revisión manual. |

---

## Consulta del estado del puente

Lee el estado del puente:

```bash
qorechaind query bridge config
qorechaind query bridge chains
qorechaind query bridge chain ethereum
qorechaind query bridge validators
qorechaind query bridge operations
qorechaind query bridge operation [id]
```

Los mismos datos están disponibles por REST bajo `/qorechain/bridge/v1/` (consulta [Arquitectura del puente](/architecture/bridge-architecture#rest-api-endpoints)).

---

## Consejos

* Verifica siempre que el formato de la dirección de destino coincida con la cadena de destino (por ejemplo, `0x...` para cadenas EVM, base58 para Solana).
* Las transferencias grandes (superiores a 100,000 QOR) están diseñadas para activar automáticamente el período de impugnación de 24 horas.
* Las comisiones del puente se queman a través del canal de quema `bridge_fee` (consulta [Operaciones con tokens](/user-guide/token-operations)).
