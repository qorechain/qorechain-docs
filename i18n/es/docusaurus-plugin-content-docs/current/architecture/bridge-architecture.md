---
slug: /architecture/bridge-architecture
title: Arquitectura del Puente
sidebar_label: Arquitectura del Puente
sidebar_position: 7
---

# Arquitectura del Puente

El módulo `x/bridge` está diseñado para conectar QoreChain con el ecosistema blockchain más amplio mediante **37 configuraciones de cadena (36 cadenas externas más Injective, alcanzada por IBC) y hasta 8 contrapartes IBC (Inter-Blockchain Communication)**. Cada operación del puente está diseñada para estar asegurada con criptografía poscuántica.

:::caution No está activo en ninguna de las dos redes
El módulo del puente está desplegado en mainnet y testnet, pero **ninguna ruta del puente está activa**: las 37 configuraciones de cadena están en estado `pending` sin ningún contrato de puente establecido, no hay validadores de puente registrados, nunca se ha creado ninguna operación del puente y no existen canales ni clientes IBC. Todo lo que sigue describe el diseño previsto. No envíe activos esperando que sean transferidos por el puente.
:::

## Estado actual {#current-status}

| | Mainnet | Testnet |
|---|---|---|
| Módulo del puente | habilitado | habilitado |
| Configuraciones de cadena | 37, todas `pending` | 37, todas `pending` |
| Validadores de puente registrados | 0 | 0 |
| Operaciones del puente | 0 | 0 |
| Canales / clientes IBC | 0 / 0 | 0 / 0 |

(Comprobado el 20 de octubre de 2026 con la mainnet v3.2.3 y la testnet v3.2.4. Lea los valores en vivo con `qorechaind query bridge chains` y `qorechaind query bridge validators`, o por REST en `/qorechain/bridge/v1/chains` y `/qorechain/bridge/v1/validators`.) La configuración del módulo es la misma en ambas redes: `min_validators` 10, `attestation_threshold` 7, `challenge_period_secs` 86.400 y `large_transfer_threshold` 100.000 QOR (`100000000000` uqor). La pila IBC que usaría el módulo es ibc-go v10.7 (desde v3.2.2), pero no se ha creado ningún cliente ni canal.

## Resumen de Conexiones

QoreChain está diseñado para admitir dos protocolos de puente operando en paralelo:

| Protocolo | Conexiones           | Modelo de Seguridad                  | Caso de Uso                             |
| -------- | -------------------- | ------------------------------------ | --------------------------------------- |
| **IBC**  | hasta 8 canales (ninguno abierto) | IBC estándar + firmas PQC de paquetes | Cadenas compatibles con Cosmos SDK      |
| **QCB**  | 37 configs de cadena (todas pending) | multifirma Dilithium-5 7-de-10        | Cadenas no IBC (EVM, Solana, TON, etc.) |

Las **37 configuraciones de cadena** son las **36 cadenas externas** enumeradas a continuación más **Injective**, que está configurada como una cadena de tipo IBC. No existe una configuración loopback de QoreChain. Los canales IBC planificados conectan con cadenas compatibles con Cosmos SDK.

## Canales IBC

QoreChain está diseñado para mantener conexiones IBC con las siguientes 8 cadenas, retransmitidas vía Hermes v1.x. **Todavía no existe ningún canal ni cliente IBC en ninguna de las dos redes**, por lo que esta tabla enumera únicamente contrapartes planificadas:

| Cadena     | Descripción                    |
| ---------- | ------------------------------ |
| Cosmos Hub | Conexión principal del hub     |
| Osmosis    | Enrutamiento de liquidez DEX   |
| Noble      | Emisión nativa de USDC         |
| Celestia   | Capa de disponibilidad de datos |
| Stride     | Liquid staking                 |
| Akash      | Cómputo descentralizado        |
| Babylon    | Protocolo de restaking de BTC  |
| Injective  | Interoperabilidad DeFi / libro de órdenes |

### Configuración del Relayer IBC

* **Software de relayer**: Hermes v1.x
* **Actualizaciones de cliente**: Refresco automático del light client
* **Detección de comportamiento indebido**: Habilitada — el relayer monitorea la equivocación
* **Limpieza de paquetes**: Cada 100 bloques se limpian los paquetes IBC pendientes
* **Mejora PQC**: Cada paquete IBC originado en QoreChain incluye una firma Dilithium-5 opcional para seguridad cuántica a futuro. Las cadenas receptoras compatibles con PQC pueden verificar esta firma junto con la verificación IBC estándar.

## Protocolo QCB (QoreChain Bridge)

El protocolo QCB usa una arquitectura hub-and-spoke asegurada con criptografía poscuántica. QoreChain actúa como el hub, con una configuración spoke para cada cadena externa.

### Configuraciones de Cadenas Externas (36)

El protocolo QCB está diseñado para apuntar a las siguientes 36 cadenas externas. Junto con Injective (una configuración de tipo IBC), esto da **37 configuraciones de cadena en total**, todas actualmente en estado `pending`.

**Cadenas base (10)**

Ethereum, Solana, TON, BSC, Avalanche, Polygon, Arbitrum, Optimism, Base, Sui.

**Cadenas de la familia EVM (14)**

zkSync Era, Linea, Scroll, Blast, Mantle, Hyperliquid, Berachain, Sonic, Sei, Monad, Plasma, Filecoin FVM, Cronos, Kaia.

**Cadenas no EVM (5)**

Starknet, XRP Ledger, Stellar, Hedera, Algorand.

**Otras cadenas (7)**

NEAR, Bitcoin, Cardano, Polkadot, Tezos, Tron, Aptos.

:::note
Verificación de conteo: 10 base + 14 familia EVM + 5 no EVM + 7 otras = **36 cadenas externas**. Sumando Injective (IBC) se obtienen **37 configuraciones de cadena**.
:::

### Formatos de Dirección

El protocolo QCB clasifica las cadenas por tipo para validar las direcciones de destino:

| Tipo de Cadena | Cadenas de Ejemplo                                                     | Formato de Dirección                               |
| ------------ | ----------------------------------------------------------------------- | -------------------------------------------------- |
| `evm`        | Ethereum, BSC, Avalanche, Polygon, Arbitrum, Optimism, Base             | `0x` + 40 caracteres hex                           |
| `solana`     | Solana                                                                  | Base58, 32-44 caracteres                           |
| `ton`        | TON                                                                     | `EQ` + codificado en base64                        |
| `sui_move`   | Sui                                                                     | `0x` + 64 caracteres hex                           |
| `aptos_move` | Aptos                                                                   | `0x` + 64 caracteres hex                           |
| `bitcoin`    | Bitcoin                                                                 | Bech32 (`bc1`), P2SH (`3...`), o legado (`1...`)   |
| `near`       | NEAR Protocol                                                           | sufijo `.near` o implícita                         |
| `cardano`    | Cardano                                                                 | `addr1` (pago) o `stake1` (staking)                |
| `polkadot`   | Polkadot                                                                | codificada en SS58                                 |
| `tezos`      | Tezos                                                                   | `tz1`/`tz2`/`tz3` (implícita) o `KT1` (originada)  |
| `tron`       | TRON                                                                    | `T` + base58, 34 caracteres                        |

## Light Clients

Para verificar eventos de cadenas externas sin necesidad de confianza, el puente está diseñado para ejecutar light clients on-chain adaptados al sistema de consenso y de pruebas de cada cadena de origen. Estos light clients permiten a QoreChain validar depósitos y retiros sin depender únicamente de las atestaciones de los validadores.

| Light Client            | Cadena de Origen    | Primitivas de Verificación                                          |
| ----------------------- | ------------------- | ------------------------------------------------------------------- |
| **Ethereum light client** | Ethereum / EVM L1 | Verificación de firma BLS12-381, serialización SSZ, pruebas de estado MPT |
| **Bitcoin SPV**         | Bitcoin             | Simplified Payment Verification contra las cabeceras de bloque      |
| **Starknet STARK**      | Starknet            | Verificación de pruebas STARK de las transiciones de estado de Starknet |
| **Sui BLS**             | Sui                 | Verificación de firma agregada BLS de los checkpoints de Sui        |
| **Wormhole / Solana VAA** | Solana (vía Wormhole) | Verificación de firma de guardián Verified Action Approval (VAA)  |

## Flujo de Depósito (Externo a QoreChain)

La secuencia siguiente muestra el depósito QCB tal como está diseñado: los activos se bloquean en una cadena externa, los validadores de QoreChain envían atestaciones firmadas con PQC (7-de-10 Dilithium-5) y se acuñan tokens envueltos. Las cadenas compatibles con Cosmos SDK usarían en su lugar la ruta IBC paralela (hasta 8 canales, con firmas Dilithium-5 opcionales de paquetes). Ninguna de las dos rutas está activa; nunca se ha realizado ningún depósito.

```mermaid
sequenceDiagram
    participant U as User
    participant X as External Chain
    participant V as QoreChain Validators
    participant Q as QoreChain
    U->>X: 1. Lock assets on bridge contract
    X->>V: 2. Observe lock event
    V->>Q: 3. Submit attestations (7/10 PQC sigs)
    Note over V,Q: Light client verifies source proofs where available
    Q->>Q: 4. Mint wrapped tokens
    Note over Q: If > 100K QOR: 24h challenge period before execution
    Note over X,Q: IBC path (planned, up to 8 channels) runs in parallel for Cosmos SDK chains
```

```
External Chain          QoreChain Validators           QoreChain
     |                         |                          |
     | 1. Lock assets on       |                          |
     |    bridge contract      |                          |
     |------------------------>|                          |
     |                         | 2. Observe & attest      |
     |                         |    (7/10 PQC sigs)       |
     |                         |------------------------->|
     |                         |                          | 3. Mint wrapped
     |                         |                          |    tokens
     |                         |                          |
     |                         |    [If > 100K QOR]       |
     |                         |    24h challenge period   |
     |                         |    before execution       |
```

1. **Bloqueo (Lock)** — El usuario bloquea los activos en el contrato del puente en la cadena externa.
2. **Atestación (Attest)** — Los validadores del puente observan la transacción de bloqueo y envían atestaciones firmadas con Dilithium-5. Se requiere un mínimo de **7 de 10** atestaciones de validadores. Cuando hay un light client disponible para la cadena de origen, el evento de bloqueo se verifica adicionalmente contra las propias pruebas de la cadena.
3. **Acuñación (Mint)** — Una vez alcanzado el umbral de atestaciones, se acuñan tokens envueltos en QoreChain.
4. **Período de impugnación** — Para transferencias que superan el equivalente a 100.000 QOR, se aplica un **período de impugnación de 24 horas** antes de la ejecución. Durante esta ventana, los validadores pueden marcar actividad sospechosa.

## Flujo de Retiro (QoreChain a Externo)

```
QoreChain               QoreChain Validators           External Chain
     |                         |                          |
     | 1. Burn wrapped tokens  |                          |
     |------------------------>|                          |
     |                         | 2. Attest burn           |
     |                         |    (7/10 PQC sigs)       |
     |                         |------------------------->|
     |                         |                          | 3. Unlock original
     |                         |                          |    assets
```

1. **Quema (Burn)** — El usuario quema los tokens envueltos en QoreChain.
2. **Atestación (Attest)** — Los validadores atestiguan el evento de quema con firmas Dilithium-5 (umbral 7/10).
3. **Desbloqueo (Unlock)** — Una vez alcanzado el umbral, los activos originales se desbloquean en la cadena externa.

Todas las comisiones del puente recaudadas durante los retiros se enrutan al módulo `x/burn` mediante el canal de quema `bridge_fee` (el 100% de las comisiones del puente se queman).

### Retiros L2 → L1 (rollups)

Los retiros de rollup no usan el puente. Los paga el módulo `x/rdk` con `execute-withdrawal` contra la raíz de retiros de un lote finalizado — consulte [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals).

## Arquitectura de Seguridad

### Multifirma PQC

Todas las operaciones del puente QCB requieren un **umbral de 7 de 10** firmas poscuánticas Dilithium-5 de validadores de puente registrados. Cada validador de puente se registra con:

* Una dirección de validador de QoreChain
* Una clave pública Dilithium-5 (2.592 bytes)
* Una lista de cadenas admitidas
* Una puntuación de reputación (mantenida por `x/reputation`)

Desde v3.2.2 el módulo valida de forma coherente los montos cero y su configuración en todas las rutas. **Desde v3.2.4 (testnet desde el 19 de octubre de 2026; mainnet desde la altura 3,742,566):** registrar un validador de puente también requiere una prueba de posesión de la clave Dilithium-5 (el mismo formato `proof_of_possession` que el registro de claves PQC, véase [Seguridad Poscuántica](/architecture/post-quantum-security#proof-of-possession)) y rechaza una clave que otro validador de puente ya esté usando. La mainnet v3.2.3, que se ejecuta hasta esa altura, no tiene esa comprobación, y no hay ningún validador de puente registrado en ninguna de las dos redes.

### Disyuntores (Circuit Breakers)

Cada cadena conectada dispone de protecciones de disyuntor independientes:

| Protección                | Descripción                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------ |
| **Límite por transferencia única** | Monto máximo para cualquier operación individual del puente por cadena      |
| **Límite agregado diario** | Tope de volumen total por cadena por ventana de 24 horas                            |
| **Pausa manual**          | Detención de emergencia por cadena activada por gobernanza o validador               |
| **Detección de anomalías** | Pausa automática si hay >50 operaciones en una ventana corta o el volumen supera 5x el límite diario |

El estado del disyuntor se rastrea por cadena e incluye: máximo por transferencia única, límite diario, uso diario actual, altura del último reinicio y estado de pausa con motivo.

### Período de Impugnación

Para transferencias grandes (>100.000 equivalente en QOR, configurable mediante `large_transfer_threshold`):

* Se aplica un **período de impugnación de 24 horas** (86.400 segundos) tras alcanzarse el umbral de atestaciones.
* Durante esta ventana, los validadores están diseñados para poder marcar la operación.
* Si no se impugna, la operación se ejecuta automáticamente tras expirar el período.
* Las operaciones impugnadas se congelan para revisión de gobernanza.

### Optimización de Rutas con IA

El módulo del puente se integra con el subsistema de IA para la optimización de rutas (no expuesta por REST). Para transferencias que pueden recorrer múltiples rutas (p. ej., de la cadena A a la cadena B vía un intermediario), el optimizador de rutas evalúa:

* Comisiones estimadas entre rutas
* Tiempo estimado de finalización
* Puntuación de seguridad por ruta
* Nivel de confianza de la estimación

## Administración del Puente

### Activación de cadena posdespliegue (sin gobernanza)

A partir de la versión de cadena **v3.1.78**, una cadena del puente puede activarse y reconfigurarse después del despliegue con una única transacción firmada — sin propuesta de gobernanza y sin actualización de cadena. Una clave `bridge_admin` (establecida en `BridgeConfig.BridgeAdmin` en el génesis) o un titular de la licencia `qcb_bridge` puede:

* **`tx bridge update-chain-config`** — establecer la dirección de contrato, el conteo de confirmaciones, la arquitectura y el estado de una cadena (`MsgUpdateChainConfig`).
* **`tx bridge set-verifier-bootstrap`** — seleccionar el verificador activo de una cadena e instalar su raíz de confianza (`MsgSetVerifierBootstrap`).

Esto permite a un operador poner en línea el puente de una cadena conectada — o rotar su verificador — directamente, con la autorización verificada contra la clave de administrador del puente. A partir de la versión de cadena **v3.2.0**, el módulo del puente también tiene su propia cuenta de módulo (las versiones anteriores no tenían ninguna, por lo que el primer depósito en una ruta activada habría fallado).

Las licencias como `qcb_bridge` las concede la cuenta de la autoridad de licencias. Desde v3.2.3 (mainnet), la gobernanza puede sustituir esa cuenta con una propuesta `MsgUpdateAuthority`; el propio módulo se describe en [Licenciamiento de Cadena](/architecture/chain-licensing).

### Validación de redes conectadas

A partir de la versión de cadena **v3.1.79**, un validador que posea la licencia `validator_<chain>` (o `qcb_bridge`) correspondiente puede ejecutar el cliente de la red externa en el mismo nodo, aprovisionado automáticamente bajo la orquestación de QoreChain una vez activada la licencia. Se incluyen drivers para las 37 redes del puente, clasificados por modelo de participación (validador sin permisos, limitado/electo/admisión, full-node de L2, y sin staking/lista de confianza). El stake y las claves de firma de la red externa los proporciona el operador por cada red. Consulte [Ejecutar un Validador](/developer-guide/running-a-validator#connected-networks) para conocer los pasos del operador. Dado que todas las configuraciones de cadena están en estado `pending`, hoy no se está validando ninguna red conectada a través del puente.

## Endpoints de la API REST {#rest-api-endpoints}

El estado del puente puede consultarse **en modo solo lectura vía REST** a través de grpc-gateway bajo el prefijo `/qorechain/bridge/v1/...`. Estos sirven JSON on-chain real sobre HTTP para exploradores y telemetría de nodos ligeros. Consulte [Endpoints REST / gRPC](/api-reference/rest-grpc-endpoints#bridge-module) para la lista completa.

| Método | Endpoint                                  | Descripción                                                                                                         |
| ------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| GET    | `/qorechain/bridge/v1/config`             | Configuración del módulo del puente (`min_validators`, `attestation_threshold`, `challenge_period_secs`, `large_transfer_threshold`, `enabled`) |
| GET    | `/qorechain/bridge/v1/chains`             | Todas las configuraciones de cadena y su estado                                                                     |
| GET    | `/qorechain/bridge/v1/chains/{chain_id}`  | Una configuración de cadena                                                                                         |
| GET    | `/qorechain/bridge/v1/validators`         | Validadores de puente registrados                                                                                   |
| GET    | `/qorechain/bridge/v1/validators/{address}` | Un validador de puente                                                                                            |
| GET    | `/qorechain/bridge/v1/operations`         | Operaciones del puente                                                                                              |
| GET    | `/qorechain/bridge/v1/operations/{id}`    | Una operación del puente                                                                                            |

Los montos bloqueados, el estado de los disyuntores y las estimaciones de ruta no tienen hoy ninguna ruta de consulta.

## Eventos del Puente

El módulo del puente emite los siguientes eventos on-chain:

| Tipo de Evento                | Descripción                                     |
| ----------------------------- | ----------------------------------------------- |
| `bridge_deposit`              | Nueva operación de depósito creada              |
| `bridge_withdraw`             | Nueva operación de retiro creada                |
| `bridge_attestation`          | Atestación de validador enviada                 |
| `bridge_operation_executed`   | Operación finalizada y ejecutada                |
| `bridge_circuit_breaker_trip` | Disyuntor activado o desactivado                |
| `bridge_validator_registered` | Nuevo validador de puente registrado            |
| `bridge_pqc_verification`     | Resultado de verificación de firma PQC (paquetes IBC) |

## Relacionado

* [Transferir Activos por Puente](/user-guide/bridging-assets) — mover activos entre cadenas paso a paso.
* [Restaking de BTC vía Babylon](/architecture/btc-restaking-babylon) — seguridad respaldada por Bitcoin.
* [Seguridad Poscuántica](/architecture/post-quantum-security) — verificación PQC en paquetes IBC.
