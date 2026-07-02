---
slug: /user-guide/bridging-assets
title: Transferencia de activos mediante puente
sidebar_label: Transferencia de activos mediante puente
sidebar_position: 5
---

# Transferencia de activos mediante puente

Esta guía explica cómo mover activos entre QoreChain y otras redes blockchain. La capa de interoperabilidad de QoreChain comprende **37 configuraciones de QCB (QoreChain Bridge)** (incluido un loopback de QoreChain) para redes heterogéneas, más **8 canales IBC** para cadenas del ecosistema Cosmos.

:::caution
El puente entre cadenas se encuentra actualmente en una etapa de **testnet / preproducción**. La disponibilidad de las conexiones, los activos admitidos y los parámetros de finalidad están sujetos a cambios y no deben considerarse listos para producción. Valida todas las transferencias en **`qorechain-diana`** antes de depender de ellas.
:::

:::note
Los comandos a continuación usan la testnet **`qorechain-diana`** (EVM chain ID **9800**). La mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) está activa desde el 7 de junio de 2026 ejecutando la versión de cadena **v3.1.82** — sustituye el chain ID y los endpoints de mainnet de la página **Conexión a Mainnet** donde se haya habilitado el soporte del puente.
:::

---

## Resumen de conexiones

QoreChain ofrece dos protocolos de puente:

| Protocolo                                 | Conexiones         | Caso de uso                                                              |
| ---------------------------------------- | ------------------ | ------------------------------------------------------------------------ |
| **IBC** (Inter-Blockchain Communication) | 8 canales          | Interoperabilidad nativa con cadenas habilitadas para IBC                |
| **QCB** (QoreChain Bridge)               | 37 configuraciones | Transferencias entre cadenas con redes no IBC mediante atestaciones aseguradas con PQC |

Una enumeración completa de cada configuración de QCB y canal IBC se encuentra en la página **Arquitectura del puente**. Esta guía se centra en el uso diario del puente.

---

## Canales IBC

Las siguientes cadenas habilitadas para IBC tienen canales establecidos con QoreChain:

| Cadena               | Canal       | Estado |
| -------------------- | ----------- | ------ |
| Cosmos Hub           | `channel-0` | Activo |
| Osmosis              | `channel-1` | Activo |
| Noble                | `channel-2` | Activo |
| Celestia             | `channel-3` | Activo |
| Stride               | `channel-4` | Activo |
| Akash                | `channel-5` | Activo |
| Babylon              | `channel-6` | Activo |
| QoreChain (loopback) | `channel-7` | Activo |

Las transferencias IBC usan el módulo estándar `ibc-transfer`:

```bash
qorechaind tx ibc-transfer transfer transfer <channel> <recipient> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Endpoints del puente QCB

El QoreChain Bridge se conecta a cadenas externas que abarcan múltiples tipos de ecosistema. Una selección representativa de las redes admitidas:

| Cadena    | Tipo de cadena | Activos admitidos |
| --------- | ---------- | ---------------- |
| Ethereum  | EVM        | ETH, USDC, WBTC  |
| BSC       | EVM        | BNB, USDC        |
| Solana    | Solana     | SOL, USDC        |
| Avalanche | EVM        | AVAX, USDC       |
| Polygon   | EVM        | MATIC, USDC      |
| Arbitrum  | EVM        | ETH, ARB, USDC   |
| TON       | TON        | TON              |
| Sui       | Sui Move   | SUI              |
| Optimism  | EVM        | ETH, USDC, OP    |
| Base      | EVM        | ETH, USDC        |
| Aptos     | Aptos      | APT, USDC        |
| Bitcoin   | Bitcoin    | BTC              |
| NEAR      | NEAR       | NEAR, USDC       |
| Cardano   | Cardano    | ADA              |
| Polkadot  | Polkadot   | DOT              |
| Tezos     | Tezos      | XTZ              |
| Tron      | Tron       | TRX, USDT        |

Consulta la página **Arquitectura del puente** para ver la lista completa de configuraciones de QCB y su estado de despliegue actual.

---

## Flujo de depósito (de cadena externa a QoreChain)

Depositar activos desde una cadena externa hacia QoreChain sigue esta secuencia:

1. **Bloqueo** — Bloquea los tokens en la cadena externa enviándolos al contrato o dirección del puente QCB.
2. **Atestación** — Los validadores del puente observan la transacción de bloqueo y producen atestaciones firmadas con PQC.
3. **Umbral** — Una vez recopiladas **7 de 10** atestaciones de validadores, el puente finaliza el depósito.
4. **Acuñación** — Los tokens envueltos equivalentes se acuñan en QoreChain y se acreditan a tu dirección `qor1...`.

**Comando CLI:**

```bash
qorechaind tx bridge deposit \
  --chain ethereum \
  --amount 1000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Flujo de retiro (de QoreChain a cadena externa)

Retirar activos desde QoreChain a una cadena externa:

1. **Quema** — Quema los tokens envueltos en QoreChain.
2. **Atestación** — Los validadores del puente observan la quema y producen atestaciones firmadas con PQC.
3. **Umbral** — Una vez recopiladas **7 de 10** atestaciones, el retiro se finaliza.
4. **Desbloqueo** — Los tokens originales se liberan en la cadena externa hacia la dirección de destino especificada.

**Comando CLI:**

```bash
qorechaind tx bridge withdraw \
  --chain ethereum \
  --amount 1000000 \
  --to 0xYourEthereumAddress \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Modelo de seguridad

El QoreChain Bridge está protegido por múltiples capas de defensa:

| Mecanismo                    | Descripción                                                                                                                                          |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Multifirma PQC 7-de-10**   | Cada operación del puente requiere atestaciones de al menos 7 de 10 validadores del puente, cada uno usando firmas criptográficas poscuánticas.       |
| **Período de impugnación de 24 horas** | Los retiros que superan un umbral configurable entran en una ventana de impugnación de 24 horas durante la cual los validadores u observadores pueden señalar transacciones fraudulentas. |
| **Interruptores automáticos** | Limitadores de tasa automatizados detienen las operaciones del puente si se detectan volúmenes anómalos o patrones sospechosos. Las operaciones del puente se reanudan tras una revisión manual. |

---

## Consulta del estado del puente

Comprueba el estado de una operación del puente pendiente:

```bash
qorechaind query bridge pending-deposits --address <your_qor_address>
```

```bash
qorechaind query bridge pending-withdrawals --address <your_qor_address>
```

Lista todas las conexiones de puente activas:

```bash
qorechaind query bridge connections
```

---

## Consejos

* Los depósitos del puente normalmente se finalizan en cuestión de minutos una vez recopiladas las 7-de-10 atestaciones requeridas.
* Los retiros grandes activan automáticamente el período de impugnación de 24 horas. Planifica con antelación las transferencias urgentes.
* Verifica siempre que el formato de la dirección de destino coincida con la cadena de destino (por ejemplo, `0x...` para cadenas EVM, base58 para Solana).
* Las transferencias IBC son generalmente más rápidas que las transferencias QCB, ya que usan comunicación nativa a nivel de protocolo.
* Las comisiones del puente se queman a través del canal de quema `bridge_fee` (consulta [Operaciones con tokens](/user-guide/token-operations)).
