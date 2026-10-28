---
slug: /developer-tools/asset-kit
title: QoreChain Asset Kit
sidebar_label: Asset Kit
sidebar_position: 35
---

# QoreChain Asset Kit

QoreChain Asset Kit es un conjunto de herramientas de código abierto para emitir y gestionar tokens con permisos que representan activos del mundo real en QoreChain. Tiene dos partes con estados distintos. Una parte es un conjunto de contratos EVM que se ejecutan hoy en el QoreChain EVM Engine: adaptadores para dos estándares abiertos de tokens para activos regulados (ERC-3643 y CMTAT), vaults con participaciones restringidas y un control propio de QoreChain que exige que cada titular tenga una clave ML-DSA-87 registrada. La otra parte es una **propuesta** de módulos nativos de la cadena, publicada como interfaces protobuf con clientes en cuatro lenguajes y un mock en memoria, para que las aplicaciones se puedan diseñar y probar con las reglas propuestas.

Está pensado para emisores, agentes de transferencia, administradores de fondos, equipos de cumplimiento y legales, e integradores que quieren hacer un prototipo de un token regulado en la testnet de QoreChain. Versión **0.1.0**, Apache-2.0 (con las excepciones de licencia indicadas en [Dónde está publicado](#where-published)), mantenido por la QoreChain Association. Es una versión anterior a 1.0 y **no está auditada**.

:::caution Qué está en vivo y qué no
- **Funciona hoy, solo en testnet:** los contratos EVM, los scripts de despliegue de Foundry y la consola del emisor, en `qorechain-diana` (ID de cadena EVM 9800). La comprobación de titular lee el precompilado `pqcKeyStatus` en `0x0A02`, que está activo en testnet y **no está activo en mainnet**.
- **Mainnet (`qorechain-vladi`, ID de cadena EVM 9801):** la comprobación de titular **falla en cerrado**. Toda dirección que no esté exenta de forma explícita cuenta como no elegible, así que un token protegido por el guard no puede moverse entre titulares ordinarios. Los scripts de despliegue se niegan a ejecutarse en la cadena 9801.
- **Una propuesta, no está en vivo en ningún sitio:** los módulos nativos `x/asset`, `x/identity`, `x/compliance`, `x/settlement` y `x/attest` no existen en ninguna red de QoreChain, y no hay prevista ninguna actualización que los añada. Los clientes para ellos solo pueden hablar con un mock en memoria.
- **Las plantillas legales** del repositorio son borradores sin revisar para comentar con un asesor jurídico. No son asesoramiento legal.
:::

## Innovaciones {#innovations}

- **Una comprobación de titular poscuántica añadida a los controles propios del estándar.** El guard lee `pqcKeyStatus(address)` en `0x0A02` y acepta una dirección solo si devuelve `registered`, el id de algoritmo 1 (ML-DSA-87) y `possessionProven`. Una clave registrada sin prueba de posesión podría pertenecer a otra persona, así que no cuenta. Todos los controles del estándar original (registro de identidades, claim topics, congelación, pausa, transferencia forzada) siguen aplicándose; la comprobación se suma a ellos.
- **Falla en cerrado, con decodificación estricta.** El guard llama al precompilado con una asignación de gas fija y decodifica la respuesta de forma estricta. Una respuesta con el antiguo formato de tres campos, una respuesta mal formada o la ausencia de respuesta se tratan como «sin clave». Donde el precompilado no está activo, toda dirección no exenta es no elegible.
- **El mismo guard detrás de tres adaptadores.** `QoreChainHybridHolderRule` se conecta a un token CMTAT v3 como su `ruleEngine` (o como regla dentro de un CMTA RuleEngine) con los códigos de restricción 60, 61 y 62; `QoreChainHybridHolderModule` se conecta al cumplimiento modular de ERC-3643 como módulo plug-and-play; los vaults aceptan cualquier política `IHolderEligibility`, el guard incluido.
- **Participaciones de vault que no pueden blanquear un token restringido.** `QoreChainRwaVault` (ERC-4626) y `QoreChainRwaAsyncVault` (ERC-7540, con solicitudes liquidadas por lotes por un operador con `FULFILLER_ROLE`) comprueban el lado receptor de cada movimiento de participaciones: `maxDeposit` y `maxMint` devuelven cero para un receptor no elegible. Los reembolsos nunca se rechazan.
- **Contratos originales usados sin modificar.** T-REX 4.1.6, ONCHAINID 2.2.1, CMTAT 3.2.0 y OpenZeppelin son submódulos de git, no copias.
- **Una propuesta que se puede probar antes de que exista.** Toda llamada en el `ChainClient` falla con `ChainUpgradeRequired` (código `CHAIN_UPGRADE_REQUIRED`, más el nombre del módulo) sin enviar ninguna solicitud de red. Un `MockChain` implementa las reglas propuestas en memoria y rechaza con `MockChainError` que lleva el nombre del código de error propuesto, por ejemplo `ERROR_CODE_ADDRESS_FROZEN`. Una aplicación se puede escribir contra el mock y mantener conectado el cliente real, de modo que una actualización ausente se comunica con claridad en lugar de fallar en silencio.
- **Una consola sin backend.** La consola del emisor es una página de React que no hace ninguna solicitud de red por su cuenta; la compilación de producción establece una Content-Security-Policy con `connect-src 'none'`, y todo pasa por el monedero conectado.
- **Pruebas que se ejecutan sin conexión.** 33 pruebas de Foundry se ejecutan sin red, con un doble de prueba del precompilado.

## Qué hace {#what-it-does}

**Funciona hoy en la EVM de QoreChain (testnet):**

- **`QoreChainHybridHolderGuard`.** Informa de si una dirección tiene una clave ML-DSA-87 registrada con prueba de posesión (`isHybridHolder`, `isEligible`, `requireHybridHolder`, `keyStatus`, `precompileActive`). Exenciones gestionadas por el propietario para contratos como vaults y escrows (`setExempt`, evento `ExemptionSet` con un motivo). La propiedad se transfiere en dos pasos (`Ownable2Step` de OpenZeppelin).
- **`QoreChainHybridHolderRule`.** Una regla de transferencia de CMTAT v3 asignada al guard. Códigos de restricción 60 (emisor), 61 (receptor) y 62 (spender) mediante `detectTransferRestriction`, `detectTransferRestrictionFrom` y `messageForTransferRestriction`.
- **`QoreChainHybridHolderModule`.** Un módulo de cumplimiento modular de ERC-3643 (T-REX v4) asignado al guard. `moduleCheck` comprueba emisor y receptor. Sin configuración por cumplimiento.
- **`QoreChainRwaVault` y `QoreChainRwaAsyncVault`.** Descritos arriba.
- **`IERC7518`.** Un esbozo de interfaz para las particiones de ERC-7518, sin implementación; su id ERC-165 `0x5a264a5d` se comprueba en una prueba.
- **Scripts de despliegue (Foundry).** `script/DeployCmtat.s.sol`, `script/erc3643/DeployErc3643.s.sol` y `script/DeployVaults.s.sol`, con una comprobación previa compartida (`script/QoreChainTestnet.sol`) que informa de si el precompilado responde y del estado de la clave del desplegador, y que rechaza la cadena 9801.
- **Consola del emisor** (`packages/issuer-console`). Conecta cualquier monedero EIP-6963, añade QoreChain Testnet o cambia a ella, crea un token CMTAT protegido por el guard (guard, regla y token, como en `DeployCmtat.s.sol`), abre tokens CMTAT o ERC-3643 existentes, ejecuta acciones de agente (mint, burn, freeze, unfreeze, transferencia forzada, pause, unpause) y muestra los titulares y un registro de auditoría construido a partir de eventos de la cadena.

**Propuesta (no está en la cadena):**

- Interfaces protobuf en `proto/` para `x/asset`, `x/identity`, `x/compliance`, `x/settlement` y `x/attest`, y su semántica en `docs/proposal.md`.
- Clientes en TypeScript, Python, Go y Java: tipos generados, el `ChainClient` y el `MockChain`.

**Documentos de referencia en el repositorio:**

- `docs/evm-adapters.md`: los contratos, las licencias originales, el despliegue en testnet.
- `docs/technology-standards.md`: un borrador que describe las redes como las necesitaría ver un emisor o un auditor (fiabilidad, gobernanza, autoridad de actualización, orden de transacciones, observabilidad, gestión de incidentes, gestión de claves), con cada dato etiquetado como Verified, Documented, Not measured o Not published.
- `legal/`: tres plantillas para comentar (consulta [Límites](#limits)).

## Casos de uso {#use-cases}

1. **Un emisor hace un prototipo de un token con permisos en testnet.** El emisor despliega un token CMTAT con `DeployCmtat.s.sol` (o desde la consola del emisor), o una suite completa de ERC-3643 con `DeployErc3643.s.sol`, y prueba la congelación, la pausa, la transferencia forzada y la comprobación de titular en `qorechain-diana` antes de decidir nada sobre una emisión real.
2. **Un administrador de fondos gestiona suscripciones y reembolsos mediante vaults de participaciones restringidas.** Los inversores solicitan depósitos en `QoreChainRwaAsyncVault`; el administrador los procesa por lotes con `fulfillDeposit` y `fulfillRedeem`; las participaciones solo las pueden recibir direcciones elegibles, mientras que los reembolsos siguen abiertos a todo el que tenga participaciones.
3. **Un equipo de cumplimiento exige el registro de una clave poscuántica para cada titular.** Añadir `QoreChainHybridHolderRule` (CMTAT) o `QoreChainHybridHolderModule` (ERC-3643) significa que un token solo se puede emitir o transferir a direcciones con una clave ML-DSA-87 registrada y con prueba de posesión, además de los controles de identidad y de lista de permitidos del propio estándar.
4. **Un integrador construye contra los módulos nativos propuestos.** Un monedero, un registro o un back office programa contra `MockChain` en TypeScript, Python, Go o Java, comprueba sus eventos y códigos de error, y mantiene conectado `ChainClient`.
5. **Un equipo de producto diseña flujos de entrega contra pago y de attestation.** El `x/settlement` propuesto (instrucciones con afirmación bilateral, todas las patas o ninguna) y `x/attest` (declaraciones con un periodo de validez y caducidad) se pueden ejercitar en `MockChain` para diseñar flujos de usuario, sabiendo que ninguno de los dos existe en la cadena.
6. **Un equipo legal empieza el trabajo documental con su asesor jurídico.** Las plantillas para un valor registrado en un ledger suizo, los términos de token del TVTG de Liechtenstein y un compromiso del régimen piloto de DLT de la UE dan una estructura y una sección de correspondencia técnica por rellenar. Un asesor jurídico cualificado de la jurisdicción lo revisa todo antes de cualquier uso.
7. **Un revisor de due diligence lee los datos de la red.** `docs/technology-standards.md` enumera lo que se puede comprobar en las redes en vivo y lo que no está medido o no está publicado, con sus fuentes.

## Cómo funciona {#how-it-works}

### La comprobación de titular en la EVM {#holder-check}

El precompilado en `0x0A02` responde a `pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey, bool possessionProven)`. El guard exige `registered && algorithmId == 1 && possessionProven`. Esto hace que el guard falle en cerrado: donde el precompilado no está activo, toda dirección que no esté exenta de forma explícita es no elegible. Consulta [Precompilados EVM](/developer-guide/evm-precompiles) para el propio precompilado y su estado en cada red.

```
                 CMTAT v3 token  -- ruleEngine -->  QoreChainHybridHolderRule --+
                                                                                +--> QoreChainHybridHolderGuard --> 0x0A02 pqcKeyStatus
ERC-3643 token -> ModularCompliance - module -->  QoreChainHybridHolderModule --+         (exemptions for contracts)
                                                                                |
       ERC-4626 / ERC-7540 vault shares ----------- IHolderEligibility ---------+
```

La comprobación es aditiva. Todos los controles del estándar original siguen aplicándose: el registro de identidades de ERC-3643 (ONCHAINID), claim topics, emisores de confianza, congelación, congelación parcial, pausa, transferencia forzada y recuperación; en CMTAT, congelación, congelación parcial, pausa, transferencia forzada, documentos y snapshots.

### Qué cubre la comprobación {#coverage}

Lo que importa es la recepción: una emisión o una transferencia a una dirección sin clave se rechaza. La regla de CMTAT también comprueba al emisor y, en `transferFrom`, al spender. El módulo de ERC-3643 comprueba emisor y receptor; ERC-3643 no pasa el spender a los módulos de cumplimiento, así que allí no se comprueba el spender de un `transferFrom`. Las quemas nunca se rechazan (en ERC-3643, `burn` no consulta en absoluto a los módulos de cumplimiento), de modo que un titular que perdió la elegibilidad aún puede ser reembolsado.

### Vaults {#vaults}

Ambos vaults comprueban el lado receptor de cada movimiento de participaciones; los reembolsos nunca se rechazan. En el vault de ERC-7540, las solicitudes se agregan por controller (id de solicitud 0). El fulfiller convierte los depósitos pendientes en participaciones a la proporción de activos por participación del propio vault en el momento del cumplimiento, sin ninguna entrada de valoración externa; después los controllers reclaman con `deposit` o `mint`, o con `redeem` o `withdraw`. El propio contrato del vault debe poder tener el token subyacente: registrado en el registro de identidades de ERC-3643 o en la lista de permitidos de CMTAT, y exento en el guard (`DeployVaults.s.sol` establece las exenciones del guard).

### Enviar una transacción EVM en QoreChain {#native-prerequisites}

Toda transacción EVM en QoreChain se admite solo si el emisor tiene:

1. una clave ML-DSA-87 registrada, registrada con `MsgRegisterPQCKeyV2` y una prueba de posesión, y
2. una ventana de autorización EVM abierta, abierta con `/qorechain.pqc.v1.MsgOpenEVMWindow` en una transacción del carril nativo con firma híbrida (secp256k1 más ML-DSA-87).

Para los despliegues, la ventana necesita `allowed_targets` **vacío** (una ventana restringida a destinos rechaza la creación de contratos), `max_txs` al menos igual al número de transacciones, `max_value` que cubra el valor más la comisión máxima de cada transacción, `blocks` lo bastante largo (como máximo 17,280) y `native_only` en falso. Abrir la ventana avanza la secuencia de la cuenta, que es también el nonce de la EVM: abre primero la ventana y luego ejecuta el script. Las llamadas y la estimación de gas no necesitan ventana. Contexto: [Firma poscuántica](/developer-guide/post-quantum-signing) y [Desarrollo EVM](/developer-guide/evm-development#evm-window).

### La propuesta {#proposal}

Seis flags fijos o solo relajables en la creación (`require_auth`, `freezable`, `pausable`, `non_transferable`, `supply_cap`, `require_hybrid_signature`); roles (emisor, agentes, auditores, agentes de identidad, emisores de claims, attesters); comprobaciones de transferencia ordenadas; congelación, congelación parcial, clawback y transferencia forzada con un motivo registrado; identidades con claims pero sin datos personales en la cadena; un registro de módulos de cumplimiento con versiones (`identity-verified`, `country-allowlist`, `country-blocklist`, `max-holders`, `max-balance`, `attestation-fresh`); instrucciones de liquidación con afirmaciones; attestations con estado `FRESH`, `STALE` o `MISSING`. La especificación es `docs/proposal.md` en el repositorio. Donde el texto y el mock no coinciden, el texto es el comportamiento previsto. Todo esto es un diseño: nada de ello existe en una red de QoreChain.

## Cómo usarlo {#how-to-use}

### Instalación {#install}

| Parte | Instalación | Plataforma mínima |
|---|---|---|
| Contratos Solidity (desde GitHub) | `git clone --recurse-submodules https://github.com/qorechain/qorechain-asset-kit` (etiqueta `v0.1.0`), o como dependencia de Foundry: `forge install qorechain/qorechain-asset-kit@v0.1.0` | Foundry; solc 0.8.28 (los archivos de T-REX y ONCHAINID usan 0.8.17); `evm_version = "cancun"` |
| Java | `implementation("io.github.qorechain:asset-kit:0.1.0")` (Maven `io.github.qorechain:asset-kit:0.1.0`) | Java 17 |
| Go | `go get github.com/qorechain/qorechain-asset-kit/clients/go@v0.1.0` (paquete `assetkit`) | Go 1.23 |
| Python | **Próximamente** en PyPI como `qorechain-asset-kit`; todavía no está publicado. Hoy, desde un clon: `cd clients/python && python -m pip install .` (se importa `qorechain_asset_kit`) | Python 3.10 |
| TypeScript | **Próximamente** en npm como `@qorechain/asset-kit`; todavía no está publicado. Hoy, desde un clon: `pnpm install && pnpm -r build` | Node.js 22.12 |
| Consola del emisor | Desde un clon: `pnpm install`, y luego `pnpm --filter @qorechain/issuer-console dev` (no se publica como paquete) | Un navegador con un monedero EIP-6963 |

El README del repositorio y el README del cliente de TypeScript importan desde `@qorechain/asset-kit` como si estuviera instalado. Eso funciona solo desde un clon, hasta la publicación en npm.

Con `forge install`, los contratos quedan en `lib/qorechain-asset-kit/contracts/` y sus propias dependencias en `lib/qorechain-asset-kit/contracts/lib/`. Remappings que compilan el guard, la regla de CMTAT y los vaults:

```
qorechain-asset-kit/=lib/qorechain-asset-kit/contracts/src/
@openzeppelin/contracts/=lib/qorechain-asset-kit/contracts/lib/openzeppelin-contracts/contracts/
CMTAT/=lib/qorechain-asset-kit/contracts/lib/CMTAT/contracts/
```

### Inicio rápido 1: compilar y probar los contratos (sin conexión) {#quickstart-build}

Del README del repositorio. Sin red, sin cuenta.

```bash
git clone --recurse-submodules https://github.com/qorechain/qorechain-asset-kit
cd qorechain-asset-kit/contracts
forge build && forge test
```

La salida observada termina con `33 tests passed, 0 failed, 0 skipped (33 total tests)`.

### Inicio rápido 2: simulacro de un despliegue contra testnet {#quickstart-dry-run}

Sin `--broadcast`, Foundry simula contra el estado de testnet y no envía nada. Cualquier dirección sirve como `--sender` para un simulacro.

```bash
forge script script/DeployCmtat.s.sol --rpc-url qorechain_testnet --sender <deployer>
```

`qorechain_testnet` está definido en `foundry.toml` como `https://evm-testnet.qore.host`. La comprobación previa imprime el ID de cadena (9800), `pqcKeyStatus precompile: active` y el estado de la clave del desplegador. Para una dirección sin clave añade `Broadcasting would fail: register an ML-DSA-87 key and open an EVM window first.` Después imprime las direcciones que tendrían el guard, la regla y el token. El mismo comando contra mainnet se detiene con `QoreChain mainnet: the hybrid-holder guard is testnet only`. `script/erc3643/DeployErc3643.s.sol` y `script/DeployVaults.s.sol` se ejecutan igual. Variables de entorno opcionales: `CMTAT_ADMIN`, `CMTAT_NAME`, `CMTAT_SYMBOL`, `CMTAT_TOKEN_ID`, `CMTAT_TERMS_URI`, `TREX_AGENT`, `TREX_SALT`, `VAULT_ASSET`, `VAULT_GUARD`.

### Antes de transmitir en testnet {#before-broadcast}

1. Usa una cuenta de testnet que controles, con un poco de QOR de testnet (consulta el [Faucet](/dashboard/faucet)). No uses nunca una mnemónica de mainnet, y no fondees nunca la frase de prueba pública usada en los ejemplos.
2. Registra su clave ML-DSA-87 con prueba de posesión (el ejemplo `examples/register-and-send` de [QoreSign](/qoresign/overview) registra una).
3. Abre una ventana de autorización EVM con los ajustes de [Enviar una transacción EVM](#native-prerequisites), con `allowed_targets` vacío. El [QoreChain SDK](/sdk/overview) construye el mensaje (`openEvmWindow` en el grupo de mensajes `pqc` en TypeScript, `qorsdk.msg.pqc.open_evm_window` en Python) y lee la ventana de vuelta (`fetchEvmWindow`, `get_evm_window`).
4. Ejecuta el script con `--broadcast` y la configuración de tu monedero.
5. Exime con `guard.setExempt` a cada contrato que deba tener el token (vaults, escrows), registra a los titulares en el cumplimiento propio del token, y comprueba a cada titular con `guard.isHybridHolder(address)` antes de emitir.

### Inicio rápido 3: consola del emisor (testnet) {#quickstart-console}

```bash
pnpm install
pnpm --filter @qorechain/issuer-console dev
```

Conecta un monedero EIP-6963, cambia a QoreChain Testnet y luego crea un token CMTAT o abre uno existente por su dirección. En la cadena 9801 la consola muestra una advertencia y desactiva la creación de tokens. La consola no registra claves ni abre ventanas; haz primero los pasos 2 y 3 de arriba.

### Inicio rápido 4: construir contra los módulos propuestos con MockChain (Python, sin conexión) {#quickstart-python}

Del README del cliente de Python. Hasta la publicación en PyPI, instala desde un clon (consulta [Instalación](#install)).

```python
from qorechain_asset_kit import MockChain, MockChainError, asset

chain = MockChain()
chain.asset.create_asset(issuer="qor1issuer", asset_id="bond-2030", flags={"freezable": True})
chain.asset.mint(agent="qor1issuer", asset_id="bond-2030", to="qor1alice", amount="100")
chain.asset.freeze(agent="qor1issuer", asset_id="bond-2030", holder="qor1alice", frozen=True)
try:
    chain.asset.transfer(from_="qor1alice", asset_id="bond-2030", to="qor1bob", amount="1")
except MockChainError as e:
    print(e.code)  # ERROR_CODE_ADDRESS_FROZEN
```

Salida observada: `ERROR_CODE_ADDRESS_FROZEN`. La misma llamada en `ChainClient()` lanza `ChainUpgradeRequired` con `module == "x/asset"` y `code == "CHAIN_UPGRADE_REQUIRED"`.

### Inicio rápido 5: lo mismo en Go (proxy de módulos v0.1.0) {#quickstart-go}

Del README del cliente de Go, envuelto en un paquete `main`.

```go
package main

import (
	"context"
	"errors"
	"fmt"

	assetkit "github.com/qorechain/qorechain-asset-kit/clients/go"
	assetv1 "github.com/qorechain/qorechain-asset-kit/clients/go/gen/qorechain/asset/v1"
)

func main() {
	ctx := context.Background()
	chain := assetkit.NewMockChain()
	_, err := chain.Asset().CreateAsset(ctx, &assetv1.MsgCreateAsset{
		Issuer: "qor1issuer", AssetId: "bond-2030", Flags: &assetv1.RwaFlagsV0{Freezable: true},
	})
	_, err = chain.Asset().Mint(ctx, &assetv1.MsgMint{Agent: "qor1issuer", AssetId: "bond-2030", To: "qor1alice", Amount: "100"})
	fmt.Println("mock mint error:", err)

	_, err = assetkit.NewChainClient().Asset().Mint(ctx, &assetv1.MsgMint{})
	var upgrade *assetkit.ChainUpgradeRequired
	fmt.Println(errors.As(err, &upgrade), upgrade.Module)
}
```

Salida observada: `mock mint error: <nil>` y luego `true x/asset`. El README del cliente de Java tiene el ejemplo equivalente con `MockChain`, `MsgCreateAsset.newBuilder()` y `MockChainError.code()`.

:::note
Los README de Go y TypeScript del repositorio contienen pequeños errores en sus fragmentos, que se corregirán en 0.1.1. El ejemplo de Go de arriba es la versión corregida.
:::

## API principal {#main-api}

### Contratos {#api-contracts}

| Nombre | Qué hace |
|---|---|
| `QoreChainHybridHolderGuard(initialOwner)` | Guard sobre `0x0A02`: `isHybridHolder`, `isEligible`, `requireHybridHolder` (revierte `HybridKeyRequired`), `keyStatus`, `decodeKeyStatus`, `precompileActive`, `setExempt`, `exempt` |
| `QoreChainHybridHolderRule(guard)` | Regla de CMTAT: `detectTransferRestriction`, `detectTransferRestrictionFrom`, `canTransfer`, `canTransferFrom`, `messageForTransferRestriction`, `canReturnTransferRestrictionCode`; códigos `CODE_FROM_NOT_HYBRID` (60), `CODE_TO_NOT_HYBRID` (61), `CODE_SPENDER_NOT_HYBRID` (62) |
| `QoreChainHybridHolderModule(guard)` | Módulo de ERC-3643: `moduleCheck`, `bindCompliance`, `unbindCompliance`, `isComplianceBound`, `isPlugAndPlay`, `name` |
| `QoreChainRwaVault(asset, name, symbol, eligibility)` | Vault de ERC-4626 con participaciones restringidas |
| `QoreChainRwaAsyncVault(asset, name, symbol, eligibility, admin)` | Vault de ERC-7540: `requestDeposit`, `fulfillDeposit`, `requestRedeem`, `fulfillRedeem`, `pendingDepositRequest`, `claimableDepositRequest`, `pendingRedeemRequest`, `claimableRedeemRequest`, `setOperator`, y `deposit`, `mint`, `redeem`, `withdraw` con un controller; `FULFILLER_ROLE`; las previsualizaciones revierten por diseño |
| `IHolderEligibility` | `isEligible(address)`: conecta otra política de elegibilidad para los vaults |
| `IERC7518` | Esbozo de interfaz de particiones |
| `forge script script/DeployCmtat.s.sol` | Guard, regla y token CMTAT |
| `forge script script/erc3643/DeployErc3643.s.sol` | Infraestructura T-REX, guard, módulo y una suite de token |
| `forge script script/DeployVaults.s.sol` | Ambos vaults sobre un token restringido, con exenciones del guard |

### Clientes (propuesta) {#api-clients}

Se muestran los nombres de TypeScript y Java; Python usa snake_case (`create_asset`), y Go usa la capitalización de Go tras accesores (`chain.Asset().CreateAsset(ctx, msg)`).

| Nombre | Qué hace |
|---|---|
| `ChainClient` (en Go `NewChainClient()`) | Toda llamada falla con `ChainUpgradeRequired`; sin solicitud de red |
| `MockChain` (en Go `NewMockChain()`) | Las reglas propuestas en memoria; los rechazos lanzan `MockChainError` |
| `asset` | `createAsset`, `updateFlags`, `setRole`, `proposeIssuer`, `acceptIssuer`, `authorizeHolder`, `mint`, `burn`, `transfer`, `freeze`, `freezePartial`, `pause`, `clawback`, `forceTransfer`, `setTerms`, `retire`; consultas `asset`, `assets`, `holder`, `holders`, `roles`, `canTransfer`, `params` |
| `identity` | `registerIdentity`, `updateCountry`, `bindAddress`, `unbindAddress`, `addClaim`, `revokeClaim`, `removeIdentity`, `setClaimIssuer`; consultas `identity`, `identityByAddress`, `claimIssuers`, `isVerified` |
| `compliance` | `registerModule`, `setModuleStatus`, `bindModule`, `unbindModule`, `migrateBinding`; consultas `modules`, `module`, `bindings`, `check` |
| `settlement` | `createVenue`, `createInstruction`, `affirm`, `withdrawAffirmation`, `executeInstruction`, `cancelInstruction`; consultas `instruction`, `instructionsByParty`, `venue` |
| `attest` | `setAttester`, `submit`, `revoke`; consultas `latest`, `history`, `attesters` |
| Ayudantes del mock | `setHybridKey`, `fundBank`, `bankBalance`, `advance(blocks, seconds)`, `events(type)`, `defineModuleLogic(moduleId, fn)` (Python también `has_hybrid_key`, `height`, `time`) |

## Cómo acceder {#how-to-access}

| | Testnet `qorechain-diana` | Mainnet `qorechain-vladi` |
|---|---|---|
| ID de cadena EVM | 9800 | 9801 |
| RPC EVM | `https://evm-testnet.qore.host` | `https://evm.qore.host` |
| Precompilado `pqcKeyStatus` `0x0A02` | Activo | No activo (`eth_call` devuelve datos vacíos); activarlo requeriría una decisión de gobernanza, no se ha tomado ninguna |
| Guard, regla y módulo de titular híbrido | Funcionan | Fallan en cerrado: toda dirección no exenta es no elegible, así que los tokens no pueden moverse entre titulares ordinarios |
| Scripts de despliegue | Simulacro y transmisión | Se niegan a ejecutarse |
| Consola del emisor | Completa | Advertencia; creación de tokens desactivada |
| Módulos nativos (`x/asset` y otros) | No existen | No existen |

Requisitos para cualquier cosa que envíe una transacción EVM: una cuenta con una clave ML-DSA-87 registrada (con prueba de posesión) y una ventana de autorización EVM abierta, ambas configuradas en el carril nativo con una transacción de firma híbrida. Las lecturas (`eth_call`, logs, estimación de gas, simulacros) no necesitan ninguna de las dos. El `MockChain` y las pruebas de Foundry no necesitan red en absoluto. Otros endpoints y el faucet: [Conexión a testnet](/getting-started/connecting-to-testnet) y [Conexión a mainnet](/getting-started/connecting-to-mainnet).

Comportamiento de la red que conviene tener presente: `PREVRANDAO` es una constante (ninguno de los contratos del kit la usa); las transacciones blob (tipo 3) se rechazan, y los tipos 0, 1, 2 y 4 se aceptan; las delegaciones EIP-7702 necesitan el propio consentimiento poscuántico de la autoridad (`MsgAuthorizeEVMDelegation`).

## Dónde está publicado {#where-published}

Comprobado en vivo el 28 de octubre de 2026 (el release de GitHub, Maven Central y el proxy de Go sirven 0.1.0; PyPI y npm devuelven 404).

| Registro | Paquete | Versión | Enlace |
|---|---|---|---|
| Maven Central | `io.github.qorechain:asset-kit` | 0.1.0 | https://central.sonatype.com/artifact/io.github.qorechain/asset-kit |
| Proxy de módulos de Go | `github.com/qorechain/qorechain-asset-kit/clients/go` | v0.1.0 (etiqueta `clients/go/v0.1.0`) | https://pkg.go.dev/github.com/qorechain/qorechain-asset-kit/clients/go |
| PyPI | `qorechain-asset-kit` | **Próximamente** (todavía no está en PyPI) | |
| npm | `@qorechain/asset-kit` | **Próximamente** (no publicado) | |
| GitHub (contratos Solidity, consola del emisor, protos, documentación, plantillas legales) | `qorechain/qorechain-asset-kit` | release v0.1.0 | https://github.com/qorechain/qorechain-asset-kit/releases/tag/v0.1.0 |

Repositorio: https://github.com/qorechain/qorechain-asset-kit. Mantenedor: QoreChain Association.

**Licencias.** El código es Apache-2.0, salvo `contracts/script/erc3643/` y `contracts/test/erc3643/`, que se compilan junto con la implementación de referencia de ERC-3643 y son GPL-3.0-or-later. La documentación en `docs/` y `legal/` es Apache-2.0. Las dependencias conservan sus propias licencias y se usan sin modificar como submódulos de git: T-REX y ONCHAINID (GPL-3.0), CMTAT (MPL-2.0), OpenZeppelin (MIT). Un token ERC-3643 desplegado es código T-REX bajo su licencia; un token CMTAT desplegado está bajo MPL-2.0. El archivo `NOTICE` enumera todas las dependencias.

## Límites y problemas conocidos {#limits}

- **Los módulos nativos no existen.** `x/asset`, `x/identity`, `x/compliance`, `x/settlement` y `x/attest` son una propuesta. No hay prevista ninguna actualización que los añada. `ChainClient` nunca puede tener éxito en 0.1.0; `MockChain` es una herramienta de desarrollo, no una cadena.
- **La comprobación de titular es solo de testnet.** En mainnet el guard falla en cerrado; un despliegue en mainnet no puede apoyarse en ella.
- **Los poderes de agente eluden la comprobación de titular.** En ambos estándares, la transferencia forzada y la recuperación de monedero por un agente no consultan la regla ni el módulo: `forcedTransfer` de CMTAT y `forcedTransfer` y `recoveryAddress` de ERC-3643 pueden colocar tokens en una dirección que no tiene clave. Restringe quién tiene los roles de agente.
- **Los spenders de `transferFrom` de ERC-3643 no se comprueban** en el módulo, porque ERC-3643 no pasa el spender al cumplimiento. La regla de CMTAT sí comprueba al spender.
- **Las quemas y los reembolsos siguen abiertos** a los titulares que perdieron la elegibilidad, por diseño, en ambos estándares de token y en ambos vaults.
- **Las solicitudes pendientes de ERC-7540 no se pueden cancelar** en 0.1.0. Si un agente saca activos del vault asíncrono, `totalAssets` lee cero y las reclamaciones que necesitan los activos que faltan fallan hasta que el emisor restablezca el saldo.
- **Sin entrada de valoración externa** en el vault de ERC-7540; la conversión usa el saldo propio del vault por participación.
- **Sin entrega contra pago ni attestations en la EVM.** Solo existen como los `x/settlement` y `x/attest` propuestos.
- **ERC-7518 es un esbozo de interfaz**, no una implementación. Las particiones se pueden modelar hoy con un token por clase o tramo que compartan un mismo registro de identidades o regla.
- **CMTA RuleEngine v3** se sigue publicando como release candidates; la regla funciona directamente como `ruleEngine` de un token y anuncia ambos ids de interfaz de regla (`0x2497d6cb`, `0xb1a69752`).
- **La consola del emisor** no registra claves, no abre ventanas, no despliega suites de ERC-3643 ni vaults, ni gestiona roles de CMTAT, congelaciones parciales, documentos o snapshots.
- **Python y TypeScript no están en sus registros.** Usa un clon hasta las publicaciones en PyPI y npm; esta página no da ningún comando de instalación desde un registro para ellos.
- **Errores en los README.** Los fragmentos de Go y TypeScript en los README del repositorio tienen pequeños errores, que se corregirán en 0.1.1. Usa los inicios rápidos de esta página.
- **Plantillas legales.** `legal/` contiene tres borradores para comentar: un valor registrado en un ledger suizo (art. 973d a 973i del Código de Obligaciones), términos de token de Liechtenstein bajo el TVTG (enfoque de «token container») y un esquema de compromiso para un operador bajo el régimen piloto de DLT de la UE (Reglamento (UE) 2022/858). No han sido revisadas por un asesor jurídico, no son asesoramiento legal y deben ser revisadas por un asesor jurídico cualificado de la jurisdicción correspondiente antes de cualquier uso. Usarlas, o usar el kit, no dice nada sobre si una emisión concreta cumple algún requisito legal. La QoreChain Association no actúa como emisor, registrador, custodio, plataforma ni asesor jurídico de ningún activo.
- **Anterior a 1.0.** Los protos propuestos pueden cambiar en cualquier versión menor.

## Notas de seguridad {#security}

- **No está auditado.** Los contratos no han tenido ninguna revisión independiente. No los uses para custodiar valor real sin una.
- Las claves se quedan con sus propietarios: el guard lee el estado de la clave pública desde la cadena y nunca maneja una clave privada. Las claves del desplegador, del propietario y de los agentes son cuentas EVM ordinarias con claves ML-DSA-87 registradas; mantén los roles de emisor, propietario del guard y agente en cuentas separadas y bien protegidas.
- El propietario del guard controla las exenciones. Una exención hace elegible a una dirección sin clave; concédela a los contratos que tienen el activo por diseño, y vigila los eventos `ExemptionSet`.
- Los roles de agente pueden eludir la comprobación de titular (transferencia forzada, recuperación). Trátalos como los roles más sensibles del token.
- El guard falla en cerrado y decodifica la respuesta del precompilado de forma estricta; nunca trata como válida una clave sin prueba de posesión.
- La compilación de producción de la consola del emisor establece una Content-Security-Policy con `connect-src 'none'`: la página no hace ninguna solicitud de red por su cuenta, y todo pasa por el monedero.
- `MockChain` confía en los campos de firmante de los mensajes (no hay firmas); no es un límite de seguridad.
- Los problemas en CMTAT, la implementación de referencia de ERC-3643, ONCHAINID u OpenZeppelin también deben comunicarse a sus mantenedores.
- Comunica las vulnerabilidades del kit en privado a security@qore.network.

## Páginas relacionadas {#related}

- [QoreChain SDK](/sdk/overview): registrar una clave ML-DSA-87 y abrir una ventana de autorización EVM (`openEvmWindow`, `fetchEvmWindow`, `get_evm_window`).
- [QoreSign](/qoresign/overview): firma híbrida para las transacciones del carril nativo que registran claves y abren ventanas.
- [Firma poscuántica](/developer-guide/post-quantum-signing) y [cuentas y firma PQC](/sdk/concepts/accounts-pqc): registro de claves y firma híbrida.
- [Desarrollo EVM](/developer-guide/evm-development#evm-window): la ventana de autorización EVM.
- [Precompilados EVM](/developer-guide/evm-precompiles): `0x0A01` y `0x0A02`, activos solo en testnet.
- [Kit de desarrollo de cadena](/developer-tools/chain-dev-sdk): plantillas de Foundry, Hardhat y viem y ayudantes de ventana (SDK 0.11.0, próximamente).
- [Kit de custodia](/developer-tools/custody-kit) y [QoreScan](/developer-tools/qorescan): kits vecinos para custodios y para inventarios de criptografía.
- [Paquetes para desarrolladores](/developer-tools/overview): cada paquete y el estado de su registro.
- Estándares originales: ERC-3643, CMTAT, ERC-4626, ERC-7540, ERC-7518.
