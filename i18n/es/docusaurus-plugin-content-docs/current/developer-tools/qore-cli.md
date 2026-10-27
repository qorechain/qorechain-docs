---
slug: /developer-tools/qore-cli
title: CLI de QoreChain (qore)
sidebar_label: CLI de QoreChain
sidebar_position: 24
---

# CLI de QoreChain (`@qorechain/qore-cli`, comando `qore`)

`qore` lee QoreChain desde el terminal. Está pensado para desarrolladores, operadores y scripts que quieren consultar una transacción, comprobar si su firma poscuántica se verifica, leer una cuenta o el conjunto de validadores, simular una transacción o preparar una transferencia sin firmar, sin escribir código. Cada comando ejecuta una herramienta del [servidor MCP de QoreChain](/developer-tools/mcp), y `--json` imprime exactamente el JSON que devuelve la herramienta, de modo que un script y un agente de IA ven los mismos datos.

Nunca se firma ni se difunde nada, y la CLI no guarda claves. Versión **0.1.0**, publicada el 27 de octubre de 2026, Apache-2.0, Node.js 20 o posterior.

## Innovaciones {#innovations}

- **JSON idéntico a la salida de la herramienta MCP.** `qore <command> --json` imprime el mismo objeto, con los mismos nombres de campo, que devuelve la herramienta MCP correspondiente. Sin `--json` el mismo objeto se imprime como texto legible. Un script escrito para uno funciona con el otro.
- **Estado poscuántico desde el terminal.** `qore pq status <txhash>` informa de si la transacción lleva exactamente una capa híbrida y de si la firma ML-DSA-87 (FIPS 204) se verifica frente a la clave que el firmante registró en la cadena, para sign-bytes v1 y v2. `qore pq status <address>` informa de la clave registrada, su tipo, la prueba de posesión y la ventana de autorización EVM.
- **Un flujo para una transferencia que no necesita clave.** `prepare-transfer --json` escribe una transferencia sin firmar y `simulate` acepta ese archivo, de modo que puede construir, comprobar y valorar una transferencia desde un script de shell. El paso de firma queda en su wallet o en [QoreSign](/qoresign/overview).
- **Códigos de salida estables.** 0 es éxito, 1 es un error de herramienta que lleva un código estable como `NOT_FOUND` o `INVALID_INPUT`, y 2 es un error de uso, de modo que un script puede ramificar según el resultado.

## Para qué se usa {#use-cases}

1. **Comprobar que una transacción llevaba la firma híbrida.** Justo después de una difusión, `qore pq status <hash>` informa del nivel de firma y de si la capa ML-DSA-87 se verifica frente a la clave registrada del firmante.
2. **Consultar el estado de la cadena desde un terminal.** `qore block`, `qore account <address>`, `qore validators` y `qore search <query>` responden a una pregunta rápida sin abrir un explorador ni escribir código.
3. **Valorar y comprobar una transferencia antes de firmarla.** `prepare-transfer` escribe una transferencia sin firmar, `simulate` muestra el gas, los cambios de saldo y cualquier rechazo decodificado, y `estimate-fee` da la comisión sugerida. Usted firma en su propia wallet o con [QoreSign](/qoresign/overview).
4. **Leer contratos desde un script o un trabajo de CI.** `qore read-contract --to 0x... --function "balanceOf(address)" --arg 0x... --returns uint256 --json | jq` comprueba un saldo de token o una vista de contrato y procesa el resultado.
5. **Scripts de shell y monitorización.** La salida `--json` junto con los códigos de salida estables (0, 1, 2) permite a un script ramificar según el resultado. El mismo JSON es el que devuelve el [servidor MCP](/developer-tools/mcp), de modo que un cliente de IA y un script ven los mismos datos.

## Cómo funciona {#how-it-works}

Cada comando de `qore` ejecuta una herramienta del núcleo compartido del servidor MCP, en su proceso, contra los endpoints públicos REST, RPC y JSON-RPC de EVM de la red que elija. Las respuestas se construyen campo a campo a partir de la respuesta de la cadena, el texto de error del upstream nunca se imprime, y un fallo se asigna a uno de siete códigos de error estables (`NOT_FOUND`, `INVALID_INPUT`, `UPSTREAM_UNAVAILABLE`, `NOT_AVAILABLE_ON_CHAIN`, `RATE_LIMITED`, `UNAUTHORIZED`, `INTERNAL_ERROR`). Cada petición al upstream tiene un tiempo de espera de 10 segundos (`--timeout` lo cambia), un límite de respuesta de 4 MiB y no hay reintentos. Las comprobaciones de la firma híbrida se ejecutan en local con [QoreSign](/qoresign/overview). No se firma ni se envía nada. Los detalles de cada herramienta están en la [página del servidor MCP](/developer-tools/mcp#how-it-works).

## Cómo usarlo {#how-to-use}

Ejecútelo sin instalar, o instálelo una vez:

```bash
npx -y @qorechain/qore-cli chain
npm install -g @qorechain/qore-cli
qore --version
```

Los comandos son de solo lectura y usan la testnet por defecto:

```bash
# the latest block, and the chain info
qore block
qore chain

# is this testnet transaction hybrid-signed, and does the ML-DSA-87 layer verify?
qore pq status F642F59F2A2FEDA2B3A61A3CF49F8B5F792D65985027997004FEBB22A6F42152

# an account on mainnet, as JSON
qore account qor1... --network mainnet --json

# the top bonded validators
qore validators --limit 3

# an unsigned transfer, then its simulation (nothing is signed or sent)
qore prepare-transfer --from qor1... --to qor1... --amount 1.5 --json > transfer.json
qore simulate transfer.json
qore estimate-fee --from qor1... --to qor1... --amount 1.5
```

Los importes son `1.5` o `1.5 QOR` (QOR, hasta 6 decimales) o `1500000uqor`. Las direcciones pueden ser `qor1...` o `0x...`.

### Un script que comprueba una cuenta y una transacción {#script}

El repositorio tiene un script completo (`examples/cli/pq-check.sh`) que hace esto. Lo esencial:

```bash
net=testnet
qore() { npx -y @qorechain/qore-cli "$@" --network "$net" --json; }

qore account "$addr" | jq '{exists, balances: [.balances[] | {denom, amount, display}], pq_key_registered}'
qore pq status "$addr" | jq '.address_status | {registered, algorithm, key_type, possession_proven, evm_window: .evm_window.live}'
qore pq status "$tx" | jq '.transaction_status | {tier, has_exactly_one_pqc_layer, signer, verified: .verification.verified, reason: .verification.reason}'

# An unsigned transfer to yourself, then its fee (nothing is signed or sent).
qore prepare-transfer --from "$addr" --to "$addr" --amount 0.000001 > transfer.json
qore simulate transfer.json | jq '{ok, gas_used, suggested_gas_limit, refusal}'
```

Un ejemplo de `qore block --network mainnet --json` (27 de octubre de 2026):

```json
{
  "network": "mainnet",
  "height": "3858155",
  "hash": "1DA8CA5049ACF8844A3B775E2E138B2B118EDC1FC8C1F3602369B0C18D0B90C2",
  "time": "2026-10-27T21:32:48.831948088Z",
  "chain_id": "qorechain-vladi",
  "proposer_address": "B1CDC8C45DA1FFF9BA5A01320F16FC7460E90B8F",
  "tx_count": 0,
  "tx_hashes": [],
  "tx_hashes_truncated": false,
  "explorer_url": "https://explore.qore.network/block/3858155"
}
```

### Comandos {#commands}

| Comando | Herramienta MCP | Qué hace |
|---|---|---|
| `chain`, `features` | `get_chain_info` | IDs de cadena, último bloque, precio mínimo del gas, versión de sign-bytes, interruptores de funciones del protocolo, precompilados EVM activos |
| `block [height]` | `get_block` | un bloque, el último por defecto |
| `tx get <hash>` | `get_transaction` | una transacción por hash nativo o EVM: estado, comisión, mensajes, firmantes, nivel de firma |
| `account <address>` | `get_address_info` | saldos, estado de la cuenta, importe en staking, ambas formas de dirección |
| `pq status <address\|txhash>` | `get_pq_status` | estado de la clave ML-DSA-87 de una dirección, o la comprobación de la capa híbrida de una transacción |
| `validators [--status S] [--limit N]` | `get_validators` | validadores por stake; el estado es `bonded` (por defecto), `unbonding`, `unbonded` o `all`; límite hasta 200 |
| `staking-tiers [--holder A]` | `get_staking_tiers` | parámetros y fondo de los niveles de staking, y los bloqueos de un titular (cadena v3.2.4 y posteriores) |
| `search <query>` | `search` | detecta una altura, un hash, una dirección o un validador y lo lee |
| `read-contract --to 0x.. (--data 0x.. \| --function "f(address)" --arg V) [--returns T]` | `read_contract` | solo un `eth_call` de EVM, con codificación y decodificación opcionales |
| `simulate <txfile.json\|base64> [--no-pqc-placeholder]` | `simulate_tx` | gas, cambios de saldo y un rechazo decodificado para una transacción codificada |
| `estimate-fee (<txfile.json\|base64> \| --from A --to B --amount X)` | `estimate_fee` | límite de gas sugerido y comisión, incluida la capa ML-DSA-87 |
| `prepare-transfer --from A --to B --amount X [--memo M] [--gas-limit N]` | `prepare_transfer` | una transferencia sin firmar para que la firme su wallet |

Opciones globales: `--network testnet|mainnet` (por defecto `testnet`), `--json`, `--timeout <ms>` (tiempo de espera del upstream, por defecto 10000), `--help` y `--version`. Los esquemas de las herramientas están en la [referencia de herramientas MCP](https://github.com/qorechain/qorechain-mcp/blob/main/docs/tools.md).

### Qué se ejecutó {#what-was-run}

El 27 de octubre de 2026 se instalaron `@qorechain/qore-cli` 0.1.0 y `@qorechain/mcp` 0.1.0 desde npm en un proyecto vacío y se ejecutaron estos comandos de solo lectura contra los endpoints públicos:

- `qore --version` imprimió `0.1.0`, y `qore --help` listó los comandos anteriores.
- `qore chain` (testnet) imprimió la cadena `qorechain-diana`, ID de cadena EVM 9800, precio mínimo del gas 0.1 y sign-bytes `v2`; `qore chain --network mainnet` imprimió la cadena `qorechain-vladi`, ID de cadena EVM 9801 y sign-bytes `v2`.
- `qore block`, `qore validators --limit 3 --json`, `qore staking-tiers --json`, `qore search 8981000`, `qore account qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08` y `qore read-contract --to 0x...0a02 --function "x()"` devolvieron sus datos.
- `qore pq status F642F59F...2152` imprimió el nivel `pqc`, `has_exactly_one_pqc_layer: true` y `verified: true` con sign-bytes `v2`.
- `qore prepare-transfer --from A --to A --amount 1.5 --json` escribió una transferencia sin firmar (límite de gas 171698, comisión 17170 uqor), `qore simulate` sobre ese archivo devolvió `ok: true`, y `qore estimate-fee` devolvió una comisión coincidente. El remitente y el destinatario eran la misma dirección, por lo que la herramienta añadió una advertencia, y no se firmó ni se envió nada.
- `qore tx get zzz` imprimió `error [INVALID_INPUT]` y terminó con código 1; `qore bogus` terminó con código 2.

## Cómo acceder {#how-to-access}

- **Redes.** La testnet `qorechain-diana` (por defecto) y la mainnet `qorechain-vladi` con `--network mainnet`.
- **Endpoints.** La CLI lee los endpoints públicos REST, RPC y JSON-RPC de EVM: `https://api-testnet.qore.host`, `https://rpc-testnet.qore.host` y `https://evm-testnet.qore.host` en la testnet, y `https://api.qore.host`, `https://rpc.qore.host` y `https://evm.qore.host` en la mainnet.
- **Cuenta y claves.** Ninguna. No hay inicio de sesión, ni clave de API ni archivo de configuración; la clave del endpoint MCP alojado no se aplica a la CLI.
- **Requisitos previos.** Node.js 20 o posterior y HTTPS saliente.
- **Coste.** Gratuita. Para enviar la transferencia que preparó paga la comisión de red (mínimo 0,1 uqor por gas) desde su propia wallet; la CLI no realiza ese paso.

## Notas de seguridad {#security}

* **Sin ruta de código de firma.** La CLI no guarda claves, no firma nada y no difunde nada; `prepare-transfer` devuelve un documento sin firmar.
* **Los secretos se rechazan.** La entrada que parece una frase de recuperación (12 o más palabras BIP-39 consecutivas) o una clave privada desnuda de 32 bytes se rechaza con `INVALID_INPUT` antes de hacer ninguna petición. Aun así, no ponga una en una línea de comandos: el historial del shell la conserva, y el error le indica que trate ese secreto como expuesto.
* **Solo salen de su equipo datos públicos:** las direcciones, los hashes y las transacciones codificadas que usted pasa, enviados a los endpoints públicos de QoreChain.
* **La mainnet es explícita.** Las llamadas van a la testnet salvo que pase `--network mainnet`, y una transferencia preparada para la mainnet lleva una advertencia.
* **Los memos son públicos y permanentes.** No ponga nunca un secreto en un `--memo`.
* Comunique las vulnerabilidades de forma privada a security@qore.network, nunca en una incidencia pública.

## Dónde está publicada {#where-published}

| Registro | Paquete | Versión | Instalación | Notas |
|---|---|---|---|---|
| npm | [`@qorechain/qore-cli`](https://www.npmjs.com/package/@qorechain/qore-cli) | 0.1.0 | `npm install -g @qorechain/qore-cli` | Binario `qore`. Node.js 20 o posterior |

Código fuente: [github.com/qorechain/qorechain-mcp](https://github.com/qorechain/qorechain-mcp), carpeta `packages/cli` (público, Apache-2.0, comprobado el 27 de octubre de 2026). No hay una versión de la CLI en Python ni en Rust; el propio servidor también está en PyPI como [`qorechain-mcp`](/developer-tools/mcp#where-published).

## Límites y problemas conocidos {#limits}

- **Solo lectura.** Ningún comando firma ni difunde. `prepare-transfer` construye únicamente un `MsgSend` de uqor de la vía nativa; no prepara transacciones EVM, SVM, de staking, de gobernanza ni de contratos. `simulate` y `estimate-fee` aceptan cualquier transacción codificada de la vía nativa.
- **Sin faucet y sin listado de titulares de tokens.** Esas dos herramientas MCP no tienen comando en la CLI. El QOR de la testnet procede del [Faucet](/dashboard/faucet).
- **El historial de la testnet se poda.** Un bloque o una transacción antiguos de la testnet devuelven `NOT_FOUND` con la altura disponible más baja; la mainnet servía desde la altura 1 cuando se comprobó.
- **Las cifras de gas difieren según la red.** La simulación de la testnet ya incluye el coste de verificación de ML-DSA-87; la simulación de la mainnet no lo incluye, por lo que el límite de gas sugerido lleva un margen.
- **Límites de salida.** Como máximo 100 hashes de transacción por bloque, 50 mensajes por transacción, 100 saldos por cuenta y 200 validadores por llamada. Cada petición tiene un tiempo de espera por defecto de 10 segundos, un límite de respuesta de 4 MiB y no hay reintentos.
- **Los secretos se rechazan.** La entrada que parece una frase de recuperación o una clave privada desnuda se rechaza con `INVALID_INPUT`. No ponga una en una línea de comandos: el historial del shell la conserva.
- **Los precompilados poscuánticos de EVM** `0x...0A01` y `0x...0A02` están activos solo en la testnet.
- **Primera versión.** 0.1.0: los nombres de los comandos y las opciones pueden cambiar en versiones posteriores. Use `--json` y los códigos de salida para los scripts, y fije la versión.

## Páginas relacionadas {#related}

* [Servidor MCP de QoreChain](/developer-tools/mcp): las mismas herramientas para clientes de IA, con un endpoint alojado.
* [QoreSign](/qoresign/overview): firme la transferencia que escribe `prepare-transfer`.
* [Referencia de la CLI del SDK](/sdk/reference/cli): la línea de comandos propia del SDK.
* [Faucet](/dashboard/faucet): QOR de la testnet.
* [Resumen de paquetes para desarrolladores](/developer-tools/overview).
