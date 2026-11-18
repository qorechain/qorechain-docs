---
slug: /build-before-qday/workshop-2
title: "Taller 2: Protege dinero con una clave poscuántica"
sidebar_label: "Taller 2"
sidebar_position: 3
date: 2026-11-18
---

# Taller 2: Protege dinero con una clave poscuántica

El Taller 1 envió una transacción firmada con dos claves. El Taller 2 usa la clave poscuántica para **proteger dinero**: primero un contrato inteligente que paga solo cuando firma una clave poscuántica, después un agente de IA cuyos límites de gasto aplica la cadena y, por último, una forma de preguntarle a la cadena cómo se protegió cada transacción.

No necesitas ser experto en seguridad. Cada comando de abajo dice qué hace y qué deberías ver. Las tres aplicaciones de ejemplo son públicas: [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), carpeta `workshop-2`.

**Cuánto tarda:** unos 40 minutos para la bóveda, 25 para el agente y 10 para las preguntas a la cadena. Haz las partes en el orden que quieras, pero cada parte necesita su propia cuenta de prueba.

## Qué construimos {#what-we-built}

| Parte | Aplicación | Qué demuestra |
| --- | --- | --- |
| 1 | **QDayVault** (Solidity y TypeScript) | Una bóveda que paga solo con una firma ML-DSA-87, comprobada en la cadena por el precompile `pqcVerify`. Una clave de estilo Ethereum robada no basta para llevarse el dinero. |
| 2 | **Agente que paga facturas** (Node.js) | Un agente con su propia clave. La cadena aplica sus límites: solo enviar, 1 QOR por pago, 3 QOR por día, 24 horas. |
| 3 | **Pregunta a la cadena** (MCP y `qore-cli`) | Preguntas de solo lectura: ¿se firmó esta transacción de forma poscuántica? ¿cuál es el estado de la clave de esta cuenta? |

Las innovaciones que hay detrás:

- **Verificación poscuántica dentro de un contrato.** La cadena tiene contratos integrados (precompiles) en direcciones fijas que comprueban firmas ML-DSA-87 y informan de la clave registrada de una cuenta. Tu código Solidity los llama como a cualquier otro contrato.
- **Límites que viven en la cadena.** Los permisos y las reglas de gasto de un agente forman parte de la cuenta, así que un fallo o un servidor robado no puede levantarlos.
- **Etiquetas honestas.** La cadena puede decirte qué transacciones llevaron una firma poscuántica y cuáles no.

## Palabras usadas en esta guía {#words}

| Palabra | Significado sencillo |
| --- | --- |
| Precompile | Un contrato integrado en una dirección fija que la cadena ejecuta de forma nativa. `pqcVerify` está en `0x0000000000000000000000000000000000000a01` y `pqcKeyStatus` en `0x0000000000000000000000000000000000000a02`. Escribe las direcciones en minúsculas: el compilador de Solidity rechaza la grafía con mayúsculas y minúsculas mezcladas |
| ML-DSA-87 | El esquema de firma poscuántica (NIST FIPS 204) que usa QoreChain |
| Ventana EVM | Un permiso corto y limitado para enviar transacciones de estilo Ethereum desde una cuenta. Abrirla requiere una transacción firmada con ambas claves, así que una clave de Ethereum por sí sola nunca puede abrir una |
| Guardián | La cuenta cuya clave poscuántica debe firmar cada retirada de la bóveda |
| Autenticador | Una clave vinculada a tu cuenta con reglas que aplica la cadena, como la que usa el agente de la parte 2 |
| Cuenta desechable | Una clave creada para este ejercicio que guarda solo QOR de prueba |

:::caution Solo cuentas de testnet desechables
Usa claves creadas para este taller, con QOR de prueba sin valor. Nunca pongas en un archivo `.env` ni en un comando la clave o el código de recuperación de una cuenta que tenga dinero real.
:::

## Antes de empezar {#prerequisites}

Necesitas las herramientas de [Antes de empezar](/build-before-qday/prerequisites) (una terminal, Node.js 22 o posterior y Git) y un navegador web. Comprueba Node.js:

```bash
node -v
```

Debe mostrar `v22` o superior. La parte 1 también necesita **pnpm** y **Foundry**:

```bash
npm install -g pnpm
```

Instala pnpm, la herramienta de paquetes que usa la bóveda. Compruébalo con `pnpm -v`.

Foundry compila, prueba y despliega Solidity. Instálalo desde [getfoundry.sh](https://getfoundry.sh): la página da un comando para tu sistema y después ejecutas:

```bash
foundryup
```

Descarga las herramientas de Foundry. Compruébalo con `forge --version` y `cast --version`.

Consigue el código de ejemplo:

```bash
git clone https://github.com/qorechain/build-before-qday.git
cd build-before-qday/workshop-2
```

La primera línea descarga los ejemplos en una carpeta llamada `build-before-qday`. La segunda entra en la carpeta `workshop-2`, que contiene las tres aplicaciones.

Para conseguir QOR de prueba usas el [faucet](/dashboard/faucet) del panel. Las tres aplicaciones funcionan solo en la testnet de QoreChain `qorechain-diana`.

## Parte 1: QDayVault, una bóveda que sobrevive a una clave filtrada {#part-1}

Código: [workshop-2/01-qday-vault](https://github.com/qorechain/build-before-qday/tree/main/workshop-2/01-qday-vault). Un día, un ordenador cuántico podría romper una clave de wallet normal (la clave secp256k1 que usa MetaMask). Esta bóveda está hecha para que una clave robada de ese tipo no baste: el dinero sale solo cuando el **guardián** firma la retirada con una clave poscuántica, y el propio contrato comprueba esa firma, en la cadena. Cualquiera puede enviar la retirada firmada. Lo que importa es la firma, no quién la envía.

```bash
cd 01-qday-vault
```

Entra en la carpeta de la bóveda.

### Cómo funciona el contrato {#vault-how}

Abre `src/QDayVault.sol`. La función importante es `withdraw`:

```solidity
(bool registered,, bytes memory pubkey, bool proven) = PQC_KEYS.pqcKeyStatus(guardian);
if (!registered || pubkey.length == 0) revert GuardianKeyNotRegistered();
if (!proven) revert GuardianKeyNotProven();

uint256 n = nonce;
if (!PQC_VERIFY.pqcVerify(pubkey, mldsaSignature, withdrawalMessage(to, amount, n))) revert BadPqcSignature();

nonce = n + 1;
emit Withdrawn(to, amount, n);
(bool ok,) = to.call{value: amount}("");
if (!ok) revert TransferFailed();
```

1. **Lee la clave del guardián desde la cadena.** La clave ocupa 2.592 bytes, así que el contrato no la guarda. Si el guardián rota la clave en la cadena, la bóveda la sigue.
2. **Rechaza una clave que nunca se demostró.** "Demostrada" significa que la cuenta firmó una prueba de propiedad al registrar la clave. Sin esta comprobación, alguien podría registrar una clave que no es suya.
3. **Verifica la firma sobre un mensaje exacto.** El mensaje une una etiqueta fija, el chain id, la dirección de la bóveda, el destinatario, la cantidad y el nonce, de modo que una firma sirve para una retirada, en una bóveda, en una cadena, una sola vez.
4. **Sube el nonce antes de enviar dinero.** La misma firma no se puede usar dos veces, y el estado cambia antes de la llamada externa, lo que protege contra la reentrada.
5. **Comprueba que la transferencia funcionó.** Si falló, toda la transacción se deshace.

### Paso 1: ejecuta las pruebas (no hace falta cuenta) {#vault-tests}

```bash
pnpm install
```

Descarga los paquetes de JavaScript de `package.json` (el SDK de QoreChain, viem, tsx).

```bash
pnpm forge-std
```

Descarga `forge-std`, la librería estándar de Foundry, en `lib/`. Las pruebas y el script de despliegue la importan. Se hace una sola vez.

```bash
forge test
```

Compila el contrato y ejecuta las 8 pruebas de `test/QDayVault.t.sol`. Deberías ver `8 passed; 0 failed`. La cadena de pruebas local no tiene los precompiles de QoreChain, así que las pruebas colocan pequeños contratos sustitutos en las dos direcciones de precompile con `vm.etch`. Comprueban la lógica: una firma buena paga, una mala se rechaza, una firma sirve una sola vez, una clave no demostrada se rechaza. Los precompiles reales se ejecutan en los pasos siguientes.

### Paso 2: crea una cuenta solo para testnet {#vault-account}

```bash
cast wallet new
```

Muestra una dirección y una clave privada nuevas. Úsalas solo en la testnet.

En macOS y Linux:

```bash
cp .env.example .env
```

En Windows PowerShell usa `Copy-Item .env.example .env`. Esto crea tu propio archivo de ajustes. Git ignora `.env`, así que nunca se sube. Abre `.env` y pon en `PRIVATE_KEY` la clave privada de `cast wallet new`.

```bash
pnpm window recovery-code
```

Muestra un código de recuperación que empieza por `QRC1-`. Tu clave poscuántica se crea a partir de él. Ponlo en `.env` como `QORE_PQC_RECOVERY_CODE` y guarda una copia en un lugar seguro, aparte de la clave privada. Usa siempre el mismo código: un código distinto da una clave poscuántica distinta.

### Paso 3: financia la cuenta {#vault-fund}

```bash
pnpm window status
```

Muestra tu cuenta en dos formas, `0x...` y `qor1...`. Son la misma cuenta. Pega la dirección `qor1...` en el [faucet](/dashboard/faucet).

### Paso 4: registra tu clave poscuántica, una sola vez {#vault-register}

```bash
pnpm window register
```

Pone tu clave pública ML-DSA-87 en la cadena, con una prueba de que es tuya. Se hace una vez por cuenta. Después, `pnpm window status` muestra `PQC key: registered`. Es la única transacción que la cadena acepta solo con la clave clásica, porque aún no conoce tu clave poscuántica. Para saber qué vincula realmente el registro, consulta [Cómo se vincula tu clave poscuántica a tu cuenta](/build-before-qday/key-binding).

### Paso 5: abre una ventana EVM limitada {#vault-window}

```bash
pnpm window:scoped
```

Envía una transacción firmada con ambas claves que abre una ventana EVM de **600 bloques (unos 15 minutos), 3 transacciones y 2 QOR** de valor más comisiones. Es suficiente para el despliegue y una retirada, y nada más. Si tu clave clásica se filtra mientras la ventana está abierta, el daño queda limitado a ese presupuesto; cuando termina, el carril de estilo Ethereum se cierra otra vez.

**Espera unos 10 segundos** antes del paso siguiente. Abrir la ventana usó un nonce de tu cuenta, y el siguiente bloque debe incluirlo primero.

### Paso 6: despliega la bóveda {#vault-deploy}

```bash
pnpm deploy:testnet
```

Ejecuta el script de Foundry `script/QDayVault.s.sol`: despliega la bóveda con un depósito de 1 QOR y te nombra **a ti** guardián. Busca `QDayVault 0x...` en la salida. En la salida de Foundry, "ETH" significa QOR.

```bash
pnpm vault status
```

Muestra la dirección de la bóveda, su saldo (1 QOR), el guardián (tú) y el nonce (0).

### Paso 7: el ataque, como simulación {#vault-attack}

```bash
pnpm vault attack 0x1b6dF9880065e7758c6e82741c50cEaD80664937 0.5
```

Hace de atacante que tiene tu clave clásica pero no tu clave poscuántica. Firma la retirada con una clave ML-DSA-87 aleatoria y le pregunta a la cadena qué pasaría. Deberías ver `BLOCKED by the vault: BadPqcSignature`. Es solo una simulación, así que no cuesta nada y no usa tu ventana. Sirve cualquier dirección como destinatario.

### Paso 8: la retirada real {#vault-withdraw}

```bash
pnpm vault withdraw 0x1b6dF9880065e7758c6e82741c50cEaD80664937 0.5
```

Firma la retirada con **tu** clave ML-DSA-87 (un mensaje de 157 bytes, una firma de 4.627 bytes) y la envía. La bóveda la comprueba con `pqcVerify` y paga. Deberías ver `WITHDRAWN tx 0x...` y un enlace al explorador.

```bash
pnpm window status
```

Muestra lo que queda de la ventana: 1 transacción, exactamente el presupuesto que le diste.

### Si algo sale mal {#vault-troubleshooting}

| Qué ves | Qué significa | Qué hacer |
| --- | --- | --- |
| `REFUSED: Missing or invalid parameters` al desplegar o retirar | No hay una ventana EVM activa: caducó o se agotó | Ejecuta `pnpm window status`, luego `pnpm window:scoped`, espera 10 segundos y vuelve a intentarlo |
| `does not exist on chain yet` | La cuenta aún no tiene QOR | Usa el faucet (paso 3) |
| `PQC key: not registered` | Se saltó el paso 4 | Ejecuta `pnpm window register` |
| `GuardianKeyNotRegistered` | El guardián no tiene clave ML-DSA-87 en la cadena | Regístrala (paso 4) |
| `No vault yet` | No se ha desplegado nada desde esta carpeta | Haz el paso 6, o pon `VAULT_ADDRESS` en `.env` |

### Audita el contrato antes de desplegarlo {#vault-audit}

La carpeta `audit/` contiene el primer borrador del contrato, con errores reales, y la versión corregida. Muestra un flujo en dos etapas con el [Contract Auditor](/dashboard/contract-auditor) del panel: audita el borrador, corrige cada hallazgo con una prueba, audita el contrato final y conserva ambos informes. Una auditoría automática no sustituye a una auditoría humana antes de mainnet. Para Solidity, la calificación de preparación cuántica muestra "Not scored", y es lo esperado: en la EVM, la comprobación poscuántica la hace la cadena mediante el precompile. Consulta `audit/README.md` en la carpeta y la página [EVM Precompiles](/developer-guide/evm-precompiles) para ver las direcciones de los precompiles y el gas.

## Parte 2: un agente que paga facturas con límites que aplica la cadena {#part-2}

Código: [workshop-2/02-pq-agent](https://github.com/qorechain/build-before-qday/tree/main/workshop-2/02-pq-agent). Si le das a un bot tu clave privada, sus límites de gasto viven en su propio código. Un error, una inyección de prompt o un servidor robado, y los límites desaparecen. En QoreChain los límites viven **en la cadena**: el agente recibe su propia clave, vinculada a tu cuenta con reglas que la cadena comprueba en cada pago.

Vuelve una carpeta atrás y entra en la del agente:

```bash
cd ../02-pq-agent
```

### Tres claves, tres funciones {#agent-keys}

| Clave | Quién la tiene | Qué puede hacer |
| --- | --- | --- |
| **Propietario** | Tú | Tu cuenta, firmada con ambas claves. Guarda el dinero, vincula al agente y escribe las reglas |
| **Clave del agente** | El agente | Una clave ed25519. Puede pedir gastar desde la cuenta del propietario, solo dentro de las reglas. No guarda dinero |
| **Wallet de gas** | El agente | Una pequeña cuenta aparte que envía las solicitudes del agente y paga las comisiones. Nunca guarda el dinero del propietario |

Las reglas de este ejemplo: el agente solo puede **enviar QOR**, como máximo **1 QOR por pago** y **3 QOR por día**, y el vínculo **caduca a las 24 horas**. Abre `agent.mjs` y mira el comando `pay`: no tiene ninguna comprobación de límites. El agente simplemente intenta pagar. Todos los límites que verás vienen de la cadena.

### Paso 1: instala y crea las claves {#agent-keys-create}

```bash
npm install
```

Descarga los paquetes de `package.json`: el SDK de QoreChain, CosmJS y `@noble/curves` para la clave ed25519.

```bash
node agent.mjs init
```

Crea la clave ed25519 del agente y su wallet de gas y las guarda en `~/.config/qday/agent.env`, legible solo por ti. Muestra la dirección `qor1...` de la wallet de gas.

```bash
node agent.mjs owner-init
```

Crea una cuenta de propietario desechable para la testnet y la guarda en `~/.config/qday/owner.env`. Para usar una cuenta que ya tengas, pon en ese archivo `QORE_MNEMONIC="..."`. Las claves nunca salen de tu ordenador, nunca se muestran y nunca deben ir a un repositorio.

```bash
node agent.mjs whoami
```

Muestra las tres direcciones: propietario, clave del agente y wallet de gas.

### Paso 2: financia al propietario y la wallet de gas {#agent-fund}

Pega cada dirección `qor1...` en el [faucet](/dashboard/faucet). El propietario necesita unos pocos QOR para las facturas, y la wallet de gas unos 3 QOR para comisiones.

```bash
node agent.mjs balance
```

Comprueba que ambos tienen QOR.

### Paso 3: registra las claves poscuánticas, una sola vez {#agent-register}

```bash
node agent.mjs register owner
node agent.mjs register gas
```

Cada cuenta pone su clave pública ML-DSA-87 en la cadena con una prueba de propiedad. A partir de ahora, ambas firman cada transacción con dos claves.

### Paso 4: vincula al agente, con límites {#agent-link}

```bash
node agent.mjs link 1 3
```

El propietario envía **una** transacción, firmada con ambas claves, que vincula la clave ed25519 del agente a la cuenta del propietario (la clave del agente firma una prueba de que está de acuerdo, así que nadie puede vincular una clave que no es suya), le da un permiso (`send`), escribe una regla de gasto (1 QOR por pago, 3 QOR por día, solo `uqor`) y fija una caducidad de 24 horas. Añade un tercer número para otra cantidad de horas, como máximo 30 días. Deberías ver `agent linked` y `hybrid ML-DSA-87: verified`.

```bash
node agent.mjs rules
```

Lee de vuelta desde la cadena lo que aplica: la regla, el permiso, la caducidad y cuántos pagos ha hecho el agente. Para saber cómo funciona la vinculación, consulta [Autenticadores](/sdk/guides/authenticators).

### Paso 5: deja que el agente pague las facturas {#agent-run}

```bash
node agent.mjs run bills.json
```

El agente intenta pagar las cinco facturas de `bills.json`, 8,2 QOR en total. Para cada una firma una solicitud con su clave ed25519 y la wallet de gas la envía. Deberías ver:

| Factura | Cantidad | Resultado | Por qué |
| --- | --- | --- | --- |
| Alojamiento de servidor | 0.8 | PAID | |
| Renovación de dominio | 0.5 | PAID | |
| Factura de un remitente desconocido | 5 | REFUSED BY THE CHAIN | Supera el límite de 1 QOR por pago |
| Créditos de API | 1 | PAID | |
| Monitorización | 0.9 | REFUSED BY THE CHAIN | Supera el límite diario de 3 QOR: 2,3 gastados, quedan 0,7 |

Los rechazos vienen de la cadena, no del código del agente. Un detalle en el explorador: un pago rechazado sigue apareciendo como una transacción con código 0. La transacción en sí fue aceptada en un bloque, pero el pago que contiene fue rechazado. `agent.mjs` lee el resultado del pago interior, que es lo que muestra.

### Paso 6: revoca al agente {#agent-revoke}

```bash
node agent.mjs revoke
```

Una transacción del propietario desactiva la clave del agente.

```bash
node agent.mjs pay qor1s90l5nnwfjznf4cdj3p4pf2p7uk32axf8800yu 0.1 "after revoke"
```

Intenta un pago más. Deberías ver `REFUSED BY THE CHAIN: linked key is unbound or revoked`. Así, si un agente llega a ser comprometido, lo máximo que puedes perder es su límite diario, y una transacción lo detiene.

Para ejecutar la demostración otra vez, mueve `~/.config/qday/agent.env` a otro sitio (después de sacar el QOR de la wallet de gas) y ejecuta `node agent.mjs init` de nuevo.

Todos los comandos: `init`, `owner-init`, `whoami`, `register owner|gas`, `link <perTxQOR> <dailyQOR> [hours]`, `rules`, `pay <to> <QOR> [memo]`, `run <bills.json>`, `revoke`, `balance`. Puedes cambiar `QORE_REST`, `QORE_RPC` (tu propio nodo) y `QDAY_DIR` (dónde están los archivos de claves) con variables de entorno.

## Parte 3: pregunta a la cadena, con MCP y qore-cli {#part-3}

Código: [workshop-2/03-mcp](https://github.com/qorechain/build-before-qday/tree/main/workshop-2/03-mcp). MCP (Model Context Protocol) es una forma estándar de que los asistentes de código y otras herramientas de IA usen herramientas externas. El servidor MCP de QoreChain, `@qorechain/mcp`, les da **acceso de lectura** a la cadena: bloques, transacciones, cuentas, el estado de la clave poscuántica de una cuenta, estimaciones de comisión y simulaciones. Tiene 14 herramientas. **Nunca firma, nunca guarda claves y nunca difunde transacciones**: si pides una transferencia, te da un documento sin firmar y lo firmas en tu propia wallet.

### Añádelo a tu cliente MCP {#mcp-config}

Sirve cualquier cliente MCP. La mayoría usa una configuración como esta:

```json
{
  "mcpServers": {
    "qorechain": {
      "command": "npx",
      "args": ["-y", "@qorechain/mcp"]
    }
  }
}
```

`npx -y` descarga el servidor la primera vez y lo inicia. El cliente muestra entonces sus herramientas, por ejemplo `get_pq_status`, `get_transaction`, `get_address_info`, `read_contract`, `estimate_fee`, `simulate_tx` y `prepare_transfer`.

### Las mismas preguntas desde la terminal {#mcp-cli}

`qore-cli` da las mismas respuestas sin un cliente de IA. Haz tres preguntas sobre lo que construiste:

```bash
npx -y @qorechain/qore-cli pq status <hash of an agent payment>
```

¿Se firmó de forma poscuántica el pago del agente? Esperado: `tier: pqc`, `verified: true`. Es una transacción nativa, firmada con ambas claves y comprobada por la cadena.

```bash
npx -y @qorechain/qore-cli pq status <hash of the vault withdrawal>
```

¿Y la retirada de la bóveda? Esperado: `tier: classical`, `reason: evm_lane`. Es una respuesta honesta: las transacciones de estilo Ethereum no llevan firma poscuántica. Las protegen la ventana EVM y, aquí, el contrato de la bóveda, que comprueba por sí mismo una firma ML-DSA-87.

```bash
npx -y @qorechain/qore-cli pq status <your 0x or qor1 address>
```

¿Y la cuenta? Esperado: `registered: true`, `possession_proven: true` y la ventana EVM con lo que le queda.

### Un cliente visual (opcional) {#mcp-inspector}

Para recorrer las herramientas con clics, sin un asistente de IA:

```bash
npx -y @modelcontextprotocol/inspector npx -y @qorechain/mcp
```

Después elige **Connect**, **Tools**, **List Tools**, escoge `get_pq_status`, pon una dirección o un hash en `target` y elige **Run Tool**.

## Lo que tienes ahora {#done}

Un contrato que paga solo contra una firma poscuántica, un agente cuyos límites aplica la cadena y las herramientas para comprobar cómo se protegió cualquier transacción. Usa cualquiera de ellos como base de tu envío: consulta [Build Before Q-Day](/build-before-qday/overview) para ver los niveles y las reglas.
