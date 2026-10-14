---
slug: /architecture/post-quantum-security
title: Seguridad Post-Cuántica
sidebar_label: Seguridad Post-Cuántica
sidebar_position: 3
---

# Seguridad Post-Cuántica

QoreChain está construida con **criptografía post-cuántica (PQC) desde el génesis** — no añadida posteriormente como una actualización. El módulo `x/pqc` proporciona firmas digitales basadas en retículos y encapsulamiento de claves como primitivas criptográficas principales, con un marco de agilidad de algoritmos controlado por gobernanza para una resiliencia a largo plazo.

La base completa de PQC — **Dilithium-5 (firmas) + ML-KEM-1024 (KEM) + SHAKE-256 (hash)** — está ahora completa y es el valor por defecto de la red. En las redes en producción (v3.2.x), las firmas híbridas son **requeridas por defecto** en la ruta de transacción cosmos: `hybrid_signature_mode = required` y `allow_classical_fallback = false`. Cada transacción de la ruta cosmos debe llevar una firma Dilithium-5 junto a su firma clásica secp256k1; las transacciones solo clásicas desde una cuenta PQC se rechazan, y la ruta de degradación clásica está cerrada.

## Principios de Diseño

* **PQC requerida por defecto**: Las firmas post-cuánticas son obligatorias en la ruta cosmos. Las firmas clásicas secp256k1 por sí solas ya no son suficientes — `allow_classical_fallback = false`.
* **Híbrida por defecto**: Las transacciones cosmos llevan simultáneamente tanto una firma clásica secp256k1 como una firma PQC Dilithium-5. El respaldo solo clásico está cerrado.
* **Agilidad de algoritmos**: El registro de algoritmos criptográficos está controlado por gobernanza, lo que permite a la red adoptar nuevos algoritmos o desaprobar los comprometidos sin hard forks.
* **Verificación determinista**: Toda la verificación de firmas es determinista y reproducible en todos los nodos validadores.

## Algoritmos Soportados

| Algoritmo       | Estándar             | Categoría          | Nivel NIST | Clave Pública  | Clave Privada | Firma / Texto Cifrado | Secreto Compartido |
| --------------- | -------------------- | ----------------- | ---------- | ----------- | ----------- | ---------------------- | ------------- |
| **Dilithium-5** | ML-DSA-87 (FIPS 204) | Firma         | 5          | 2,592 bytes | 4,896 bytes | 4,627 bytes            | --            |
| **ML-KEM-1024** | FIPS 203             | Encapsulamiento de Claves | 5          | 1,568 bytes | 3,168 bytes | 1,568 bytes            | 32 bytes      |

Ambos algoritmos operan en el **Nivel de Seguridad NIST 5**, la categoría de seguridad estandarizada más alta, proporcionando una protección equivalente a AES-256 frente a adversarios tanto clásicos como cuánticos.

## Backend Criptográfico

Las operaciones PQC se implementan en un backend criptográfico de alto rendimiento y seguro en memoria que expone la firma basada en retículos, la verificación y el encapsulamiento de claves al runtime de QoreChain. El backend proporciona:

Operaciones específicas de algoritmo:

* Generación de claves, firma y verificación de Dilithium-5
* Generación de claves, encapsulamiento y desencapsulamiento de ML-KEM-1024
* Generación de baliza aleatoria determinista (`seed`, `epoch`)

Operaciones conscientes del algoritmo:

* `Keygen(algorithmID)` — Genera un par de claves para cualquier algoritmo registrado
* `Sign(algorithmID, privkey, message)` — Crea una firma
* `Verify(algorithmID, pubkey, message, signature)` — Verifica una firma
* `AlgorithmInfo(algorithmID)` — Consulta los tamaños de clave/salida
* `ListAlgorithms()` — Enumera todos los algoritmos soportados

Todas las operaciones de firma y verificación son deterministas y producen resultados idénticos en todos los nodos validadores y plataformas soportadas.

Estas mismas primitivas — ML-DSA (FIPS-204), ML-KEM (FIPS-203) y SHAKE-256 (FIPS-202) — están disponibles para wallets e integradores a través de la biblioteca de código abierto [**qorechain-pqc**](https://github.com/qorechain/qorechain-pqc), que proporciona una API consistente y compatible byte a byte en seis lenguajes (JavaScript/TypeScript, Rust, Go, C, Python, Java). Consulta [Firma Post-Cuántica](/developer-guide/post-quantum-signing).

## Registro de Claves {#key-registration}

Las cuentas registran claves PQC de forma explícita mediante `MsgRegisterPQCKey` (legacy, por defecto Dilithium-5) o `MsgRegisterPQCKeyV2` (consciente del algoritmo); la cadena nunca registra una clave por sí sola, y el flujo por CLI es `qorechaind tx pqc gen-key <name>` seguido de `qorechaind tx pqc register-key <public_key_hex> hybrid --from <key>` (consulta [Primera Transacción](/getting-started/first-transaction#register-pqc-key)). Cada mensaje incluye:

* **Sender**: La dirección de la cuenta que registra la clave.
* **PublicKey**: Los bytes de la clave pública PQC.
* **AlgorithmID**: El identificador del algoritmo PQC (solo v2).
* **KeyType**: Uno de tres modos de registro:

| Tipo de Clave    | Descripción                                                              |
| ---------------- | ------------------------------------------------------------------------ |
| `hybrid`         | Claves tanto clásica (ECDSA) como PQC. Las transacciones llevan firmas duales. |
| `pqc_only`       | Se registra igual que `hybrid`: la firma clásica secp256k1 se sigue verificando con las comprobaciones de firma estándar, y además se requiere la firma PQC. |
| `classical_only` | Solo clave clásica. Sin protección PQC (no recomendado).                 |

## Firmas Híbridas

El sistema de firmas híbridas requiere que las transacciones de la ruta cosmos lleven **tanto** una firma clásica como una firma PQC simultáneamente. Esto proporciona defensa en profundidad: incluso si un esquema se rompe, el otro protege la transacción.

Con el valor por defecto de la red `hybrid_signature_mode = required`, cada transacción de la ruta cosmos debe incluir la extensión Dilithium-5 junto a la firma secp256k1. Las únicas exenciones (para el arranque) son los **gentxs de génesis (altura 0)** y las **transacciones de registro/migración de clave PQC** (`MsgRegisterPQCKey`, `MsgRegisterPQCKeyV2`, `MsgMigratePQCKey`), a las que se les permite ser solo clásicas para que las cuentas puedan registrar su primera clave PQC, y un unjail desde una cuenta de operador que no tiene ninguna clave registrada.

**El carril EVM se protege en su lugar con una ventana de autorización.** Una transacción EVM no puede llevar una segunda firma (ML-DSA) — los wallets estándar firman una única firma secp256k1 sobre una transacción de Ethereum y no ofrecen ninguna forma de adjuntar otra. Así, la autorización post-cuántica viaja *por delante* de la transacción: la cuenta abre una **ventana de autorización EVM** acotada con un mensaje del carril Cosmos (`MsgOpenEVMWindow`), que lleva la firma híbrida ordinaria, y el carril EVM admite entonces solo las transacciones cubiertas por una ventana activa. Desde v3.2.0 se rechaza una transacción EVM salvo que su remitente (1) tenga una clave post-cuántica registrada y (2) tenga una ventana activa con bloques, transacciones y valor restantes. Dentro de una ventana, una transacción ordinaria de MetaMask/ethers/Hardhat funciona sin modificaciones, porque la comprobación lee el estado de la cadena, no la transacción. Consulta [Ventana de autorización EVM](/getting-started/first-transaction#evm-window).

### Flujo de Cofirma

Para producir una transacción cosmos conforme, la firma clásica secp256k1 se calcula sobre los sign bytes estándar (que excluyen la extensión PQC), y una firma Dilithium-5 se calcula sobre los bytes firmados v2 (consulta [Bytes firmados (v2)](#sign-bytes-v2) más abajo) y se adjunta como la extensión `PQCHybridSignature`. Las herramientas estándar de CosmJS / relayer deben producir esta extensión para transaccionar en la ruta cosmos. Hoy esto se hace mediante:

* `qorechaind tx pqc gen-key <name>` — genera una clave Dilithium-5.
* `qorechaind tx pqc cosign <unsigned_tx_file> --from <key> --pqc-key <name>` — adjunta la cofirma Dilithium-5 a una transacción construida con `--generate-only`.
* La firma híbrida del SDK de QoreChain — `buildHybridTx`. La clave de la cuenta ya debe estar registrada con `MsgRegisterPQCKey`.
* [QoreX](/qorex/overview), que hace ambas cosas por ti.

*Una transacción firmada con secp256k1 (ECDSA) más ML-DSA-87 (Dilithium-5), verificada por el ante handler bajo el modo de aplicación de toda la cadena.*

```mermaid
flowchart TD
    A["Transaction<br/>secp256k1 (ECDSA) signature<br/>+ ML-DSA-87 (Dilithium-5) extension"] --> B["PQCHybridVerifyDecorator"]
    B --> C{"Account has<br/>registered PQC key?"}
    C -- "Yes, extension present" --> D["Verify PQC signature<br/>against registered key"]
    C -- "No extension" --> F{"Hybrid mode"}
    F -- "Disabled / Optional" --> G["Allow classical-only tx"]
    F -- "Required" --> H["Reject transaction"]
    D --> I["Accept"]
    G --> I
```

### Bytes firmados (v2) {#sign-bytes-v2}

La firma ML-DSA cubre bytes etiquetados por dominio y ligados a la cadena. Desde v3.2.0 la cadena verifica **únicamente** esta forma:

```text
"qorechain-pqc-hybrid-v2" ‖ BE64(len(chainID)) ‖ chainID ‖
BE32(len(B0)) ‖ B0 ‖ BE32(len(authInfo)) ‖ authInfo
```

donde `B0` es el cuerpo de la transacción serializado **sin** la extensión PQC y `authInfo` son los bytes de AuthInfo tal cual (`‖` es concatenación, las longitudes son big-endian). La etiqueta de dominio impide que una firma hecha en otro contexto (un desafío de inicio de sesión, una solicitud de firma de mensaje) sea válida como firma de transacción, y ligar el chain ID hace que la propia firma post-cuántica sea inválida en cualquier otra red. La primera forma (`BE32(len(B0)) ‖ B0 ‖ BE32(len(authInfo)) ‖ authInfo`) solo se verificaba por debajo de la altura de actualización; ningún bloque acepta ambas. Las cargas de migración de claves y de atestación del puente pasaron al mismo esquema etiquetado por dominio y ligado a la cadena.

**¿Qué forma verifica mi red?** Pregunta al nodo si la actualización se ha aplicado:

```bash
curl -s https://api.qore.host/cosmos/upgrade/v1beta1/applied_plan/v3.2.0         # height 2981742 on mainnet
curl -s https://api-testnet.qore.host/cosmos/upgrade/v1beta1/applied_plan/v3.2.0 # height 5920000 on testnet
```

(`"height":"0"` significa que no se ha aplicado.) La CLI lo hace con `--sign-bytes auto`; el SDK 0.8.x y wallet-adapter 0.2.x hacen lo mismo, y además reconocen la vista previa anterior del cambio en testnet. Un cliente con la forma equivocada produce un digest que la cadena rechaza — falla de forma segura (fail closed).

### Formato de la Extensión de TX

Las firmas PQC se adjuntan a las transacciones como una **extensión de TX** con la URL de tipo `/qorechain.pqc.v1.PQCHybridSignature`:

```text
{
  "algorithm_id": 1,
  "pqc_signature": "<4627 bytes for Dilithium-5>",
  "pqc_public_key": "<2592 bytes, optional>"
}
```

El campo `pqc_public_key` es opcional e informativo; las claves solo se registran mediante un mensaje de registro explícito (consulta [Registro de Claves](#key-registration)).

### PQCHybridVerifyDecorator

El ante handler `PQCHybridVerifyDecorator` procesa las firmas híbridas con una lógica de verificación de tres vías:

| Escenario | La Cuenta Tiene Clave PQC | Extensión Presente | Clave Pública en la Extensión | Resultado                                              |
| -------- | ------------------- | ----------------- | ----------------------- | --------------------------------------------------- |
| Path 1   | Sí                 | Sí               | --                      | Verifica la firma PQC contra la clave registrada    |
| Path 3a  | No                 | No               | --                      | **Modo opcional**: Permite transacción solo clásica |
| Path 3b  | No                 | No               | --                      | **Modo requerido**: Rechaza la transacción          |
| Path 4   | Sí                 | No               | --                      | Gestionado por el PQCVerifyDecorator estándar       |

Una clave debe estar registrada con `MsgRegisterPQCKey` / `MsgRegisterPQCKeyV2` antes de que la cuenta envíe transacciones firmadas de forma híbrida; el campo `pqc_public_key` de la extensión no registra nada.

### Modos de Firma Híbrida

El nivel de aplicación híbrida de toda la cadena es configurable por gobernanza. El **valor por defecto actual de la red es `required`**:

| Modo         | ID | Por Defecto | Comportamiento                                                                                                   |
| ------------ | -- | ------- | ----------------------------------------------------------------------------------------------------------------- |
| **Disabled** | 0  | No      | Solo firmas clásicas. Las extensiones PQC se ignoran.                                                            |
| **Optional** | 1  | No      | Las extensiones PQC se verifican si están presentes. Las cuentas sin claves PQC pueden transaccionar solo con firmas clásicas. |
| **Required** | 2  | **Sí** | Todas las transacciones de la ruta cosmos deben llevar firmas tanto clásicas como PQC. Las transacciones sin extensión PQC se rechazan. |

La red ha completado su migración: **Optional** (génesis) → **Required** (el valor por defecto actual desde v3.1.71, con `allow_classical_fallback = false`). Los tres modos siguen estando controlados por gobernanza y pueden ajustarse mediante propuesta.

## Marco de Agilidad de Algoritmos

El marco de agilidad de algoritmos proporciona un registro controlado por gobernanza para los algoritmos PQC, permitiendo a la red añadir nuevos algoritmos, desaprobar los vulnerables y migrar cuentas — todo sin hard forks.

### Ciclo de Vida del Algoritmo

Cada algoritmo registrado tiene un estado de ciclo de vida:

```
active --> migrating --> deprecated --> disabled
```

| Estado         | Descripción                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Active**     | Totalmente operativo. Se aceptan nuevos registros de claves y verificaciones.                                                               |
| **Migrating**  | El período de doble firma está activo. Se anima a las cuentas a migrar al algoritmo de reemplazo. Se aceptan tanto las firmas antiguas como las nuevas. |
| **Deprecated** | Las firmas existentes todavía pueden verificarse, pero no se aceptan nuevos registros de claves.                                            |
| **Disabled**   | Interruptor de emergencia. El algoritmo no puede verificar ninguna firma. Se usa cuando se descubre una vulnerabilidad.                     |

### Migración por Doble Firma

Cuando un algoritmo se desaprueba, comienza un **período de migración** (por defecto: 1,000,000 bloques — unos 37 días con el tiempo de bloque actual de mainnet de ≈3,2 s). Durante este período:

1. Las cuentas con claves que usan el algoritmo desaprobado deben migrar al reemplazo.
2. La migración requiere firmas duales (`MsgMigratePQCKey`): una de la clave antigua y una de la clave nueva, probando la propiedad de ambas.
3. Ambos algoritmos se aceptan para la verificación durante todo el período de migración.

### Mensajes

| Mensaje                 | Descripción                                                                                                                                                       |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MsgRegisterPQCKey` / `MsgRegisterPQCKeyV2` | Registra la clave PQC de una cuenta (consulta [Registro de Claves](#key-registration)). Puede firmarse de forma clásica para que una cuenta nueva pueda arrancar. |
| `MsgMigratePQCKey`      | Migración con doble firma de la clave de un algoritmo a la de otro durante un período de migración. |
| `MsgRotatePQCKey`       | Rota la clave ML-DSA-87 de la cuenta dentro del mismo algoritmo (firmada por la clave antigua y la nueva; `tx pqc rotate-key`). |
| `MsgOpenEVMWindow` / `MsgCloseEVMWindow` | Abre o cierra la ventana de autorización EVM (v3.2.0); consulta [Ventana de autorización EVM](/getting-started/first-transaction#evm-window). |
| `MsgDeprecateAlgorithm` | Mensaje de gobernanza: inicia el proceso de desaprobación de un algoritmo. Especifica el algoritmo de reemplazo y el período de migración en bloques. |
| `MsgDisableAlgorithm`   | Mensaje de gobernanza: desactiva de emergencia un algoritmo inmediatamente. Requiere una cadena de motivo. Se usa cuando se descubre una vulnerabilidad criptográfica. |

`MsgDeprecateAlgorithm` y `MsgDisableAlgorithm` están actualmente desactivados en mainnet por el circuit breaker (consulta [Parámetros de la Cadena](/appendix/chain-parameters#circuit-breaker)).

### Extensibilidad

Añadir un algoritmo requiere una versión de software que lo implemente detrás de la interfaz unificada de firma y verificación; el registro y el ciclo de vida de desaprobación/desactivación están controlados por gobernanza.

## Hash SHAKE-256

A partir de v3.1.73, **SHAKE-256** (función de salida extensible SHA-3) es el **hash de aplicación por defecto** en todo QoreChain — proporcionado por el paquete `qorehash` — completando la base criptográfica resistente a la computación cuántica junto a las firmas Dilithium-5 y el encapsulamiento de claves ML-KEM-1024. El módulo `x/pqc` proporciona utilidades SHAKE-256 en Go puro:

| Función                            | Descripción                       | Salida           |
| ---------------------------------- | --------------------------------- | ---------------- |
| `SHAKE256Hash(data, outputLen)`    | Resumen SHAKE-256 de longitud variable | Longitud arbitraria |
| `SHAKE256Hash32(data)`             | Resumen SHAKE-256 estándar de 256 bits | 32 bytes         |
| `SHAKE256ConcatHash(left, right)`  | Hash de entradas concatenadas     | 32 bytes         |
| `SHAKE256DomainHash(domain, data)` | Hash con separación de dominio    | 32 bytes         |

Estas utilidades respaldan el hash de aplicación por defecto y se utilizan para:

* Hashing de nodos del árbol Merkle
* Compromisos hash en atestaciones entre capas
* Separación de dominios para diferentes contextos de hash (p. ej., `"leaf:"` vs `"node:"`)

## PQC del Puente

Todas las atestaciones de puente entre cadenas y los compromisos de estado utilizan firmas **Dilithium-5**. El módulo `x/multilayer` requiere firmas agregadas PQC en cada envío de `MsgAnchorState`, y los compromisos ML-KEM aseguran los canales de intercambio de claves entre los relayers del puente.

Esto garantiza que la seguridad entre cadenas no se degrade por el uso de criptografía clásica en la infraestructura del puente, manteniendo la resistencia a la computación cuántica en toda la pila del protocolo.

## Parámetros del Módulo

| Parámetro                  | Tipo                | Por Defecto       | Descripción                                           |
| -------------------------- | ------------------- | ----------------- | ----------------------------------------------------- |
| `pqc_primary`              | bool                | `true`            | PQC es el esquema de firma principal                  |
| `allow_classical_fallback` | bool                | `false`           | El respaldo solo clásico está cerrado; las txs cosmos deben ser híbridas |
| `min_security_level`       | int32               | `5`               | Nivel de seguridad NIST mínimo para algoritmos aceptados |
| `default_migration_blocks` | int64               | `1,000,000`       | Período de migración por doble firma por defecto en bloques |
| `default_signature_algo`   | AlgorithmID         | `1` (Dilithium-5) | Algoritmo de firma por defecto para nuevos registros de claves |
| `hybrid_signature_mode`    | HybridSignatureMode | `2` (Required)    | Nivel de aplicación de firma híbrida de toda la cadena |

## Relacionado

* [Firma Post-Cuántica](/developer-guide/post-quantum-signing) — la biblioteca de código abierto `qorechain-pqc` (seis lenguajes) para estas primitivas y la firma híbrida.
* [Configuración de Wallet](/getting-started/wallet-setup) — crea y gestiona cuentas respaldadas por PQC.
* [Cuentas y firma PQC del SDK](/sdk/concepts/accounts-pqc) — claves y firma post-cuántica desde código.
* [Parámetros de la Cadena](/appendix/chain-parameters) — algoritmos por defecto y configuración de migración.
* [Arquitectura del Puente](/architecture/bridge-architecture) — verificación PQC en paquetes entre cadenas.
