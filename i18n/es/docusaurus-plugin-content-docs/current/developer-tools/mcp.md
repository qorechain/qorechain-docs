---
slug: /developer-tools/mcp
title: Servidor MCP de QoreChain
sidebar_label: Servidor MCP
sidebar_position: 23
---

# Servidor MCP de QoreChain (`@qorechain/mcp`)

El servidor MCP de QoreChain da a los agentes de IA y a las herramientas para desarrolladores acceso de lectura a QoreChain a través del [Model Context Protocol](https://modelcontextprotocol.io): bloques, transacciones, cuentas, validadores, niveles de staking, el estado de la firma híbrida secp256k1 más ML-DSA-87 (FIPS 204), lecturas de contratos EVM, simulación y estimaciones de comisión, y transferencias sin firmar que el titular de la cuenta firma en su propia wallet. Está pensado para los desarrolladores que conectan un cliente o agente compatible con MCP a QoreChain, y para los equipos que quieren una vista de solo lectura de la cadena, programable por scripts y con una salida estable.

El servidor nunca firma, nunca guarda claves y nunca difunde una transacción. Se ejecuta en su equipo mediante stdio, o como servidor Streamable HTTP que usted aloja o que aloja QoreChain. Versión **0.1.0**, publicada el 27 de octubre de 2026, Apache-2.0. Un gemelo de línea de comandos, [`qore`](/developer-tools/qore-cli), ejecuta las mismas herramientas desde un terminal.

## Innovaciones {#innovations}

- **Comprobación de la firma híbrida, no solo una etiqueta.** `get_pq_status` toma un hash de transacción, confirma que el cuerpo lleva exactamente una capa `/qorechain.pqc.v1.PQCHybridSignature` y verifica esa capa ML-DSA-87 localmente con [QoreSign](/qoresign/overview) frente a la clave que el firmante ha registrado en la cadena, probando sign-bytes v1 y v2. La respuesta es `verified: true` o `false` con el motivo, no una suposición a partir del tipo de transacción.
- **Transferencias sin firmar que llevan la comisión real.** `prepare_transfer` lee el número de cuenta, la secuencia y la clave pública del remitente, simula la transferencia con una capa ML-DSA-87 de marcador de posición del tamaño correcto para que el gas incluya la capa que la wallet añade al firmar, y devuelve el SignDoc, un resumen legible y comprobaciones. Lo único que falta es la firma del titular.
- **Simulación con rechazos decodificados.** `simulate_tx` y `estimate_fee` devuelven el gas usado, un límite de gas sugerido, el cambio de saldo por dirección y, cuando la red rechazaría la transacción, un rechazo decodificado en lugar de una cadena de error sin procesar.
- **Un único esquema para el servidor y la CLI.** Cada comando de `qore` ejecuta una herramienta MCP, y `qore --json` imprime exactamente el JSON que devuelve la herramienta. El paquete de Python sirve los mismos nombres de herramienta, esquemas de entrada y salida y códigos de error; ambos se prueban con las mismas respuestas grabadas de la cadena.
- **Los secretos se rechazan antes de que algo salga del equipo.** La entrada que parece una frase de recuperación (12 o más palabras BIP-39 consecutivas) o una clave privada desnuda de 32 bytes se rechaza con `INVALID_INPUT` antes de hacer ninguna petición, y el error indica al usuario que trate ese secreto como expuesto.
- **Respuestas construidas campo a campo.** Cada salida se ensambla a partir de campos con nombre de la respuesta de la cadena. Los cuerpos de error del upstream y las trazas de pila nunca llegan al cliente; los fallos se asignan a siete códigos de error estables.

## Para qué se usa {#use-cases}

1. **Preguntar a un asistente de programación por el estado de la cadena.** Un desarrollador añade el servidor a un editor compatible con MCP y pregunta "¿cuál es el último bloque de la mainnet?" o "muestra los saldos de qor1... en la testnet". `get_block` y `get_address_info` responden a partir de los endpoints públicos, con enlaces al explorador.
2. **Comprobar que una transacción llevaba la firma híbrida.** Un desarrollador de wallets o del SDK acaba de difundir una transacción y quiere confirmar que lleva exactamente una capa ML-DSA-87 y que esa capa se verifica frente a la clave registrada. `get_pq_status` (o `qore pq status <hash>`) informa del nivel de firma y del resultado de la verificación local.
3. **Preparar una transferencia para que la firme un usuario.** Un asistente construido sobre QoreChain necesita ayudar a un usuario a enviar QOR sin tocar las claves. `prepare_transfer` devuelve un SignDoc sin firmar con un resumen legible, comprobaciones y advertencias (entre ellas una para la mainnet), y `estimate_fee` da la comisión. El usuario firma en su propia wallet.
4. **Depurar una transacción rechazada.** Un equipo de backend tiene una transacción codificada que la red rechaza. `simulate_tx` devuelve el gas, los cambios de saldo por dirección y un rechazo decodificado, y no difunde nada.
5. **Leer contratos desde un script o un trabajo de CI.** Un equipo de dApps comprueba un saldo de token o una vista de contrato con `qore read-contract --to 0x... --function "balanceOf(address)" --arg 0x... --returns uint256 --json` y procesa el JSON con `jq`.
6. **Paneles de validadores y de staking.** Un analista lista los validadores bonded con su porcentaje de poder de voto y su comisión (`get_validators`) y lee los parámetros de los niveles de staking y los bloqueos de un titular (`get_staking_tiers`).
7. **Ejecutar un endpoint de equipo.** Una empresa ejecuta `qorechain-mcp serve` detrás de su propio proxy inverso, con claves de API y límites de frecuencia, de modo que varias herramientas internas comparten un único endpoint MCP que apunta a sus propios nodos.

## Cómo funciona {#how-it-works}

* El servidor es un lector fino y sin estado de los endpoints públicos de QoreChain (REST, RPC de consenso y JSON-RPC de EVM). Cada llamada al upstream es una sola petición con un tiempo de espera de 10 segundos, un límite de respuesta de 4 MiB y sin reintentos.
* Las respuestas se construyen campo a campo a partir de la respuesta de la cadena. Los cuerpos de error del upstream, las trazas de pila y los mensajes de bibliotecas nunca llegan al cliente; un fallo inesperado se convierte en `INTERNAL_ERROR`. Los errores vuelven como un resultado de herramienta con `isError: true` y un cuerpo JSON.
* Las comprobaciones de la firma híbrida se ejecutan en local con [QoreSign](/qoresign/overview): el servidor obtiene la transacción y la clave ML-DSA-87 registrada del firmante, reconstruye los sign-bytes (v1 o v2) y verifica.
* Simulación: en una cadena con v3.2.5 o posterior, la simulación ya incluye el coste de verificación de ML-DSA-87 (`exact_gas_simulation: true` en `get_chain_info`), de modo que el límite de gas sugerido es exacto; en una cadena más antigua se añade un margen. Cuando un cuerpo no tiene capa ML-DSA-87, `simulate_tx` añade una capa de marcador de posición del tamaño correcto (nunca se difunde) para que el gas coincida con la transacción que firmará la wallet (`assume_pqc_layer`, por defecto true). El servidor detecta por sí mismo la versión de la cadena.
* Los precompilados de EVM `0x...0A01` (verificación ML-DSA-87) y `0x...0A02` (estado de la clave) están activos solo en la testnet; en la mainnet una llamada a ellos devuelve datos vacíos.
* Los esquemas de las herramientas legibles por máquina están en el repositorio como `spec/tools.json`, generado a partir de la propia respuesta `tools/list` del servidor. La referencia legible para personas es `docs/tools.md`.

## Cómo usarlo {#how-to-use}

Necesita Node.js 20 o posterior para el paquete de npm, o Python 3.10 o posterior para el paquete de Python.

### Ejecutarlo en local con npx {#run-npx}

Compruebe que el servidor arranca y luego añádalo a su cliente MCP. La mayoría de los clientes que inician servidores locales leen un archivo JSON con un objeto `mcpServers` (el nombre del archivo y los nombres de las claves para los servidores HTTP difieren según el cliente; consulte la documentación de su cliente):

```bash
npx -y @qorechain/mcp --version
```

```json
{
  "mcpServers": {
    "qorechain": { "command": "npx", "args": ["-y", "@qorechain/mcp"] }
  }
}
```

Reinicie el cliente. Lista 14 herramientas. El servidor habla stdio con el cliente. Después pregunte, por ejemplo:

- "¿Cuál es el último bloque de la mainnet de QoreChain?" (`get_block`)
- "¿La transacción F642F59F2A2FEDA2B3A61A3CF49F8B5F792D65985027997004FEBB22A6F42152 de la testnet lleva una capa ML-DSA-87 válida?" (`get_pq_status`)
- "Prepara una transferencia de 1,5 QOR en la testnet desde mi dirección a qor1... y estima la comisión." (`prepare_transfer`, `estimate_fee`)

### Ejecutarlo en local con pip o uvx {#run-pip}

```bash
pip install qorechain-mcp
qorechain-mcp --network testnet      # stdio
# or, without installing:
uvx qorechain-mcp
```

```json
{ "mcpServers": { "qorechain": { "command": "uvx", "args": ["qorechain-mcp"] } } }
```

El paquete de Python sirve solo stdio. Para Streamable HTTP, claves de API y límites de frecuencia use el paquete de npm (abajo). El paquete también tiene un punto de entrada de biblioteca, `run_tool`.

### Ejecutarlo como servidor HTTP {#run-http}

```bash
npx -y @qorechain/mcp serve --port 8787
# listening on http://127.0.0.1:8787/mcp
```

El transporte HTTP no tiene estado y responde con JSON: `POST /mcp` para las peticiones MCP, `GET /healthz` para `{"status":"ok"}`. Opciones:

| Opción | Valor por defecto | Significado |
|---|---|---|
| `--port` | 8787 | puerto TCP |
| `--host` | 127.0.0.1 | dirección de enlace; `0.0.0.0` escucha en todas las interfaces |
| `--api-keys-file` | ninguno | archivo con hashes SHA-256 de las claves aceptadas; si se indica, las peticiones necesitan `Authorization: Bearer <key>` |
| `--rate-limit` | 60 | peticiones por minuto por clave de API y por IP de cliente; `0` lo desactiva |
| `--allowed-origin` | ninguno | origen de navegador autorizado a llamar al endpoint (repetible); los demás orígenes reciben HTTP 403 |
| `--trust-proxy` | desactivado | toma la IP del cliente de `X-Forwarded-For`; solo detrás de un proxy que usted controle |
| `--network` | testnet | red para las llamadas que no indican ninguna |

Para proteger su propio endpoint, genere una clave, guarde solo su hash y entregue la clave al cliente:

```bash
openssl rand -hex 32 > my.key
npx -y @qorechain/mcp hash-key < my.key >> api-keys.txt
npx -y @qorechain/mcp serve --api-keys-file api-keys.txt
```

`api-keys.txt` tiene un hash de 64 caracteres hexadecimales por línea (se acepta un prefijo opcional `sha256:`, y `#` inicia un comentario). Una clave ausente o desconocida recibe HTTP 401 con un mensaje de error que empieza por `UNAUTHORIZED`; al superar el límite de frecuencia el servidor responde HTTP 429 con `Retry-After`. Ponga TLS delante de cualquier servidor al que se pueda llegar desde fuera de su equipo.

El paquete también exporta `createServer`, `createHttpHandler` y `startNodeServer` para integrarlo en su propio entorno de ejecución. Detalles completos: [autoalojamiento](https://github.com/qorechain/qorechain-mcp/blob/main/docs/self-hosting.md) en el repositorio de código fuente.

### Configuración {#configuration}

| Ajuste | Cómo | Efecto |
|---|---|---|
| Red por llamada | el argumento `network` en cualquier herramienta: `testnet` o `mainnet` | Elige la cadena para esa llamada |
| Red por defecto | `--network testnet` o `--network mainnet` en el comando del servidor | La red que se usa cuando una llamada no indica ninguna. Por defecto `testnet` |
| Puerto HTTP, host, claves, límites | opciones de `serve` indicadas arriba | Solo en modo HTTP |
| Tiempo de espera del upstream | fijo en 10 segundos por petición, límite de respuesta de 4 MiB, sin reintentos | Los endpoints lentos dan `UPSTREAM_UNAVAILABLE` |

La mainnet es `qorechain-vladi` (ID de cadena EVM 9801) y la testnet es `qorechain-diana` (ID de cadena EVM 9800). Una transferencia preparada para la mainnet lleva una advertencia adicional. No hay variables de entorno para la red: es la opción de línea de comandos o el argumento por llamada. Para hacer de la mainnet la red por defecto de un cliente:

```json
{ "command": "npx", "args": ["-y", "@qorechain/mcp", "--network", "mainnet"] }
```

### Herramientas {#tools}

Las 14 herramientas son de solo lectura y aceptan un `network` opcional. Sus entradas y salidas se generan a partir de los propios esquemas del servidor; la [referencia de herramientas](https://github.com/qorechain/qorechain-mcp/blob/main/docs/tools.md) enumera cada campo.

| Herramienta | Qué devuelve |
|---|---|
| `get_chain_info` | IDs de cadena, último bloque, precio mínimo del gas, versión de sign-bytes, interruptores de funciones del protocolo, una actualización pendiente si hay una programada, precompilados EVM activos |
| `get_block` | un bloque (o el último): hash, hora, proponente, número de transacciones y hasta 100 hashes de transacción |
| `get_transaction` | una transacción por hash nativo o hash EVM (prefijo `0x`): estado, comisión, memo, gas, hasta 50 mensajes, firmantes y el nivel de firma (`pqc`, `enrollment`, `shake` o `classical`) |
| `get_address_info` | ambas formas de dirección (`qor1...` y `0x...`), estado de la cuenta, hasta 100 saldos, importe en staking, si hay una clave ML-DSA-87 registrada, si hay bytecode desplegado |
| `get_pq_status` | para una dirección: clave registrada, algoritmo, prueba de posesión, ventana de autorización EVM. Para una transacción: si tiene exactamente una capa híbrida y si se verifica |
| `get_validators` | validadores por stake (por defecto bonded, como máximo 50, límite hasta 200): estado, indicador de jailed, stake, porcentaje de poder de voto, comisión |
| `get_staking_tiers` | el módulo de niveles de staking: condiciones de bloqueo y bonificaciones, penalización por desbloqueo anticipado, el fondo de bonificaciones y, opcionalmente, los bloqueos de un titular. Cadena v3.2.4 y posteriores |
| `search` | detecta una altura de bloque, un hash de transacción, una dirección o un validador a partir de una sola cadena, lo lee y nombra la herramienta que devuelve los mismos datos |
| `read_contract` | solo un `eth_call` de EVM, con codificación ABI opcional de una firma de función y decodificación del resultado |
| `estimate_fee` | gas simulado, límite de gas sugerido y comisión (límite de gas por el precio mínimo del gas), incluida la capa ML-DSA-87 |
| `simulate_tx` | gas usado, límite de gas sugerido, cambio de saldo por dirección y un rechazo decodificado para una transacción codificada |
| `prepare_transfer` | un `MsgSend` de uqor sin firmar: SignDoc, resumen legible, comprobaciones y advertencias |
| `get_token_holders` | siempre `NOT_AVAILABLE_ON_CHAIN`: listar titulares requiere un indexador que los endpoints públicos no ofrecen |
| `request_faucet` | siempre `NOT_AVAILABLE_ON_CHAIN`: el QOR de la testnet procede del [Faucet](/dashboard/faucet) del panel |

Los errores son resultados de herramienta con `isError: true` y un cuerpo JSON `{"error": {"code", "message", "details?"}}`. Los códigos son `NOT_FOUND`, `INVALID_INPUT`, `UPSTREAM_UNAVAILABLE`, `NOT_AVAILABLE_ON_CHAIN`, `RATE_LIMITED`, `UNAUTHORIZED` y `INTERNAL_ERROR`.

### Úselo como biblioteca {#library}

El paquete de npm exporta `createServer({ defaultNetwork })` (una instancia de servidor MCP para cualquier transporte MCP), `createHttpHandler({ apiKeyHashes, rateLimitPerMinute })` (un manejador de la API Fetch, `(Request) => Promise<Response>`) y `startNodeServer(...)` (el servidor HTTP de Node que usa `serve`). Las opciones compartidas son `defaultNetwork`, `endpoints` (apunta una red a sus propios nodos), `upstream` (`timeoutMs`, `maxResponseBytes`, `fetch`) y `onToolCall` (recibe el nombre de la herramienta, el estado y la latencia).

El paquete de Python puede usarse del mismo modo mediante `run_tool`:

```python
import anyio
from qorechain_mcp import Context, run_tool

async def main():
    out = await run_tool("get_chain_info", {"network": "mainnet"}, Context())
    print(out["latest_block"])

anyio.run(main)
```

### Probar el endpoint alojado desde un terminal {#test-hosted}

```bash
curl -s -X POST https://mcp.qorechain.io/mcp \
  -H "Authorization: Bearer $QORECHAIN_MCP_KEY" \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Sin una clave válida, el endpoint responde HTTP 401 con un error JSON-RPC cuyo mensaje empieza por `UNAUTHORIZED`.

### Solución de problemas {#troubleshooting}

* `UPSTREAM_UNAVAILABLE`: el endpoint público no respondió en 10 segundos. Inténtelo de nuevo.
* `NOT_FOUND` en un bloque antiguo de la testnet: los nodos de la testnet podan el historial, y el error indica la altura disponible más baja. `get_chain_info` informa de `earliest_available_height`.
* El cliente no lista ninguna herramienta: ejecute `npx -y @qorechain/mcp --help` en un terminal para comprobar que Node y npm funcionan, y luego lea el registro MCP del cliente.
* `UNAUTHORIZED` en el endpoint alojado: la clave falta, es incorrecta, está revocada o todavía no está activa (una clave nueva puede tardar uno o dos minutos).

### Qué se ejecutó {#what-was-run}

El 27 de octubre de 2026 se instalaron los paquetes publicados desde los registros y se ejecutaron contra los endpoints públicos de la testnet y la mainnet:

- `qorechain-mcp --version` imprimió `0.1.0`; por stdio, `initialize` devolvió el nombre de servidor `qorechain-mcp` y `tools/list` devolvió los 14 nombres de herramienta anteriores; `pip install qorechain-mcp==0.1.0` se instaló y su `--version` imprimió `0.1.0`.
- `qorechain-mcp serve --port 18787` respondió a `GET /healthz` con `{"status":"ok"}` y a un `tools/call` de `get_chain_info` mediante `POST /mcp`.
- `get_chain_info` devolvió la cadena `qorechain-diana`, ID de cadena EVM 9800, precio mínimo del gas 0,1 uqor y sign-bytes `v2` en la testnet, y la cadena `qorechain-vladi`, ID de cadena EVM 9801 y sign-bytes `v2` en la mainnet.
- `get_pq_status` sobre la transacción de testnet anterior devolvió el nivel `pqc`, exactamente una capa híbrida y `verified: true` con sign-bytes `v2`.
- `prepare_transfer` para 1,5 QOR en la testnet devolvió un SignDoc con límite de gas 171698 y comisión 17170 uqor (0,01717 QOR), y `simulate_tx` sobre su transacción sin firmar devolvió `ok: true` con la comisión descontada del remitente. No se firmó ni se envió nada.

## Cómo acceder {#how-to-access}

- **Local (opción principal).** stdio mediante `npx -y @qorechain/mcp` o `uvx qorechain-mcp`. No necesita cuenta ni clave de API. Lee los endpoints públicos de QoreChain, por lo que necesita HTTPS saliente.
- **Su propio servidor HTTP.** `qorechain-mcp serve`, como arriba, con las claves de API y los límites de frecuencia que usted configure.
- **Endpoint alojado.** `https://mcp.qorechain.io/mcp` sirve el transporte Streamable HTTP. Usa la testnet salvo que una llamada indique `"network": "mainnet"`. Cada petición necesita una clave de API enviada como `Authorization: Bearer <key>`; solicite una desde su panel (más abajo). Sin clave, el endpoint responde HTTP 401 (`UNAUTHORIZED`), que fue la respuesta el 27 de octubre de 2026. Hay una clave activa por cuenta, y cada clave está limitada a 10 peticiones por segundo (ráfaga de 20) y 100 000 peticiones por día. Para la mayoría de los usos, la configuración local no necesita clave y es la opción más sencilla.

  Para obtener una clave, inicie sesión en [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers), abra la pestaña **AI agents (MCP)** y rellene el formulario **API key** (nombre u organización, un contacto, uso previsto, volumen esperado), y pulse **Request API key**. El equipo de QoreChain aprueba o rechaza la solicitud; un rechazo muestra su nota y puede volver a solicitarla. Tras la aprobación pulse **Generate key**: la clave se muestra una sola vez, con un botón de copiar y un fragmento de configuración listo para usar, y queda activa en uno o dos minutos. QoreChain conserva solo una huella (un hash), así que una clave perdida no puede volver a mostrarse; revóquela (surte efecto en aproximadamente un minuto) y solicite una nueva. Consulte [Página Developers del panel](/dashboard/developers#mcp).

Configuración de cliente HTTP para un servidor que necesita una clave (los nombres exactos de las claves varían según el cliente):

```json
{
  "mcpServers": {
    "qorechain": {
      "type": "http",
      "url": "https://mcp.qorechain.io/mcp",
      "headers": { "Authorization": "Bearer ${QORECHAIN_MCP_KEY}" }
    }
  }
}
```

No ponga nunca una frase de recuperación ni una clave privada en la configuración de un cliente: ninguna herramienta de QoreChain las necesita.

El servidor lee de estos endpoints públicos:

| | Testnet | Mainnet |
|---|---|---|
| REST | `https://api-testnet.qore.host` | `https://api.qore.host` |
| RPC de consenso | `https://rpc-testnet.qore.host` | `https://rpc.qore.host` |
| JSON-RPC de EVM | `https://evm-testnet.qore.host` | `https://evm.qore.host` |

Coste: el servidor es gratuito. Las lecturas no cuestan nada. Si difunde una transacción que construyó `prepare_transfer`, se aplica la comisión de red (el mínimo de comisión es 0,1 uqor por gas).

## Notas de seguridad {#security}

* **No existe ninguna ruta de código de firma** en el servidor ni en la CLI. No se firma nada, no se guarda ninguna clave y no se difunde nada.
* **Los secretos se rechazan.** La entrada que parece una frase de recuperación (12 o más palabras BIP-39 consecutivas) o una clave privada hexadecimal desnuda de 32 bytes se rechaza con `INVALID_INPUT` antes de hacer ninguna petición, y el error indica al usuario que trate ese secreto como expuesto. No ponga nunca una frase de recuperación ni una clave privada en la configuración de un cliente; ninguna herramienta de QoreChain las necesita.
* **El texto de error del upstream nunca se reenvía**; las respuestas se construyen campo a campo.
* **Registros.** Los registros HTTP incluyen el método JSON-RPC, el nombre de la herramienta, el estado y la latencia. Las entradas, las salidas, las claves y las direcciones de los clientes no se registran.
* **Las claves de API** de un servidor autoalojado se guardan como hashes SHA-256, nunca en texto plano. CORS está cerrado por defecto, lo que también protege a un servidor enlazado a localhost frente al DNS rebinding.
* **La mainnet debe indicarse explícitamente**, y `prepare_transfer` añade una advertencia para las transferencias de la mainnet.
* **Los memos son públicos y permanentes.** No ponga nunca un secreto en un memo.
* **Trate una clave de API alojada como una contraseña.** Guárdela en una variable de entorno o en un almacén de secretos y revóquela desde el panel si se filtra.
* Comunique las vulnerabilidades de forma privada a security@qore.network, nunca en una incidencia pública.

## Dónde está publicado {#where-published}

| Registro | Paquete | Versión | Ejecución | Notas |
|---|---|---|---|---|
| npm | [`@qorechain/mcp`](https://www.npmjs.com/package/@qorechain/mcp) | 0.1.0 | `npx -y @qorechain/mcp` | Binario `qorechain-mcp`. stdio y Streamable HTTP. Node.js 20 o posterior |
| PyPI | [`qorechain-mcp`](https://pypi.org/project/qorechain-mcp/) | 0.1.0 | `pip install qorechain-mcp` o `uvx qorechain-mcp` | Solo stdio. Python 3.10 o posterior |
| npm | [`@qorechain/qore-cli`](https://www.npmjs.com/package/@qorechain/qore-cli) | 0.1.0 | `npm install -g @qorechain/qore-cli` | El comando `qore`. Véase [CLI de QoreChain](/developer-tools/qore-cli) |

Código fuente: [github.com/qorechain/qorechain-mcp](https://github.com/qorechain/qorechain-mcp) (público, Apache-2.0, comprobado el 27 de octubre de 2026). El repositorio contiene el servidor, la CLI, el paquete de Python, la referencia de herramientas, notas de autoalojamiento, configuraciones de cliente de ejemplo y tres archivos de skills para agentes. No tiene una imagen de contenedor publicada; use `npx` o `pip`.

## Límites y problemas conocidos {#limits}

- **Solo lectura.** No hay ninguna ruta de código de firma, ni almacenamiento de claves ni difusión. `prepare_transfer` devuelve un documento sin firmar. Para completar una transferencia, fírmela con [QoreSign](/qoresign/overview) o con la wallet QoreX y difúndala usted mismo; después lea el resultado con `get_transaction`. `read_contract` usa solo `eth_call` y no puede cambiar el estado.
- **Se prepara un único tipo de transacción.** `prepare_transfer` construye un `MsgSend` de uqor de la vía nativa. No construye transacciones EVM, SVM, de staking, de gobernanza ni de contratos. `estimate_fee` y `simulate_tx` aceptan cualquier transacción codificada de la vía nativa.
- **Las cifras de gas siguen la versión de la cadena, no la red.** Ambas redes han aplicado la v3.2.5 (la mainnet el 29 de octubre de 2026), así que la simulación incluye el coste de verificación de ML-DSA-87 y el gas es exacto (`exact_gas_simulation` es true en ambas). Frente a un nodo anterior a la v3.2.5, el límite de gas sugerido lleva un margen.
- **El historial de la testnet se poda.** Un bloque antiguo de la testnet devuelve `NOT_FOUND`, y el error indica la altura disponible más baja (8.790.799 en la testnet cuando se comprobó; la mainnet servía desde la altura 1). `get_pq_status` comprueba una capa frente a la clave registrada ahora, por lo que tras una rotación de clave las transacciones más antiguas ya no coinciden.
- **Precompilados poscuánticos de EVM.** `0x...0A01` (verificación ML-DSA-87) y `0x...0A02` (estado de la clave) están activos solo en la testnet; en la mainnet una llamada a ellos devuelve datos vacíos.
- **Límites.** Cada petición al upstream tiene un tiempo de espera de 10 segundos y un límite de respuesta de 4 MiB, sin reintentos. Los bloques listan como máximo 100 hashes de transacción, las transacciones como máximo 50 mensajes y las cuentas como máximo 100 saldos. Los cuerpos de las peticiones HTTP están limitados a 512 KiB. Un memo tiene como máximo 256 caracteres, y es público y permanente, así que nunca ponga un secreto en él. El límite de frecuencia de un servidor autoalojado es por instancia y se mantiene en memoria; detrás de un balanceador de carga, cada instancia cuenta por su cuenta.
- **No disponible:** `get_token_holders` (no hay indexador en los endpoints públicos) y `request_faucet` (use el faucet del panel, que requiere iniciar sesión). El endpoint alojado necesita una clave de API, solicitada desde su panel; la configuración local no la necesita.
- **La mainnet es explícita.** Las llamadas van a la testnet salvo que indiquen `"network": "mainnet"` o que el servidor se haya iniciado con `--network mainnet`.
- **No se publica ninguna imagen de contenedor.** Ejecute el servidor con `npx` o `pip`.
- **Versión.** 0.1.0 es la primera versión; los nombres de las herramientas y los esquemas pueden cambiar en versiones posteriores, y el archivo generado `spec/tools.json` del repositorio es la referencia de la versión que haya instalado.

## Páginas relacionadas {#related}

* [CLI de QoreChain](/developer-tools/qore-cli): las mismas herramientas desde un terminal.
* [QoreSign](/qoresign/overview): el verificador híbrido que usa `get_pq_status`.
* [SDK de QoreChain](/sdk/overview): construya y firme las transacciones que este servidor lee y simula.
* [Integraciones de QoreX](/developer-tools/qorex-integrations): la wallet que firma lo que prepara `prepare_transfer`.
* [Kit de custodia](/developer-tools/custody-kit): detección de depósitos y verificación de retiros para custodios.
* [Faucet](/dashboard/faucet) y la [Página Developers del panel](/dashboard/developers#mcp): QOR de la testnet y claves de API de MCP.
* [Resumen de paquetes para desarrolladores](/developer-tools/overview).
