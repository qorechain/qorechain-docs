---
slug: /build-before-qday/workshop-3
title: "Taller 3: Aplicaciones cifradas y cross-VM"
sidebar_label: "Taller 3"
sidebar_position: 4
date: 2026-11-20
---

# Taller 3: Aplicaciones cifradas y cross-VM

El Taller 2 protegió dinero con una clave poscuántica. El Taller 3 hace dos cosas nuevas con la misma cadena. Primero, **cifras un mensaje para una dirección de QoreChain** de modo que solo el dueño de esa dirección pueda leerlo, con cifrado poscuántico. Segundo, una transacción en la **EVM** escribe en un contrato de **QoreChain Native**, y ambos lados cambian juntos o no cambian en absoluto.

No necesitas ser criptógrafo. Cada comando de abajo dice qué hace y qué deberías ver. Las dos aplicaciones de ejemplo son públicas: [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), carpeta `workshop-3`. Ambas funcionan solo en la testnet de QoreChain `qorechain-diana`. El QOR de prueba no tiene valor.

**Cuánto tarda:** unos 30 minutos para QoreSeal y 40 para el checkout cross-VM. Las dos partes son independientes, y cada una necesita sus propias cuentas de prueba.

## Qué construimos {#what-we-built}

| Parte | Aplicación | Qué demuestra |
| --- | --- | --- |
| 1 | **QoreSeal** (Node.js) | Cifrar un mensaje para una dirección `qor1...` con ML-KEM-1024, abrirlo, comprobar que un tercero no puede, comprobar que se detecta cualquier manipulación y rotar una clave sin perder el correo antiguo. |
| 2 | **CrossVmCheckout** (Solidity y Rust) | Una llamada desde un contrato EVM escribe un recibo en un contrato Native en la misma transacción. Si falla cualquiera de los dos lados, ambos se deshacen. |

Las innovaciones que hay detrás:

- **Cifrado para una dirección.** Cada cuenta puede publicar en la cadena una clave de cifrado poscuántica, como una guía telefónica pública. Para escribirle a alguien solo necesitas su dirección.
- **Una tarjeta que vincula la clave con la cuenta.** La cuenta firma una pequeña tarjeta de destinatario con sus dos claves de firma, así que nadie puede colar una clave de cifrado falsa por el medio.
- **Cifrado híbrido.** ML-KEM-1024 (NIST FIPS 203) se combina con la clave clásica X25519. El mensaje sigue siendo privado mientras resista cualquiera de las dos.
- **Atomicidad cross-VM.** La EVM y QoreChain Native comparten un solo estado y un solo bloque. Una llamada entre ellas forma parte de la misma transacción, así que no queda ningún estado a medias que limpiar.
- **Alcance aprobado por gobernanza.** El puente solo llama a contratos Native que la gobernanza ha aprobado, y cada aprobación queda fijada al código del contrato.

## Palabras usadas en esta guía {#words}

| Palabra | Significado sencillo |
| --- | --- |
| ML-KEM-1024 | Un intercambio de claves poscuántico (NIST FIPS 203). Aquí se usa para acordar una clave secreta para cada mensaje |
| X25519 | Un intercambio de claves clásico, combinado con ML-KEM para que el sobre aguante si se rompe cualquiera de los dos |
| ML-DSA-87 | La firma poscuántica (NIST FIPS 204). Cada transacción nativa se firma con ella y con la clave clásica secp256k1 |
| Tarjeta de destinatario | Una pequeña nota firmada que une las claves de cifrado de una cuenta con la cuenta |
| Sobre | El mensaje sellado, guardado como un archivo de texto que puedes enviar como quieras |
| Native | QoreChain Native, el carril CosmWasm donde los contratos se escriben en Rust |
| Precompile del puente | Un contrato integrado en `0x0000000000000000000000000000000000000901` que permite a un contrato EVM llamar a un contrato Native |
| Lista de permitidos | Los contratos Native que la gobernanza ha aprobado para que el puente los alcance |
| Ventana EVM | Un permiso corto y limitado para enviar transacciones de estilo Ethereum desde una cuenta. Abrirla requiere una transacción firmada con ambas claves |

:::caution Solo cuentas de testnet desechables
Usa claves creadas para este taller, con QOR de prueba sin valor. Nunca pongas las palabras secretas ni la clave de una cuenta que tenga dinero real en un archivo ni en un comando.
:::

## Antes de empezar {#prerequisites}

Necesitas las herramientas de [Antes de empezar](/build-before-qday/prerequisites) (una terminal, Node.js y Git) y un navegador para el faucet. La parte 1 necesita Node.js 20 o posterior. La parte 2 también necesita **pnpm** y **Foundry**, y opcionalmente Rust. Comprueba Node.js:

```bash
node -v
```

Debe mostrar `v20` o superior. Para la parte 2 instala el resto:

```bash
npm install -g pnpm
```

Instala pnpm, la herramienta de paquetes que usa la parte 2. Compruébalo con `pnpm -v`. Foundry compila, prueba y despliega Solidity: instálalo desde [getfoundry.sh](https://getfoundry.sh) y ejecuta `foundryup`. Compruébalo con `forge --version` y `cast --version`.

Consigue el código de ejemplo:

```bash
git clone https://github.com/qorechain/build-before-qday.git
cd build-before-qday/workshop-3
```

La primera línea descarga los ejemplos en una carpeta llamada `build-before-qday`. La segunda entra en la carpeta `workshop-3`, que contiene las dos aplicaciones.

El QOR de prueba sale del [faucet](/dashboard/faucet) del panel.

## Parte 1: QoreSeal, cifrar para una dirección {#part-1}

Código: [workshop-3/01-qoreseal](https://github.com/qorechain/build-before-qday/tree/main/workshop-3/01-qoreseal). Paquetes: `@qorechain/qoreseal` y `@qorechain/qoresign`.

Quieres enviarle un mensaje privado a alguien y lo único que sabes es su dirección. Esta aplicación muestra cómo:

1. Alice registra sus claves en la cadena.
2. Cualquiera busca la clave de cifrado de Alice por su dirección.
3. Se sella un mensaje para Alice. Alice lo abre. **Eve no puede.**
4. Cambia un solo bit del sobre y **ya no se abre**.
5. Un mensaje sellado para Alice **y** Bob: cada uno lo abre con su propia clave.
6. Alice **rota** su clave: la tarjeta antigua se rechaza, los mensajes nuevos usan la clave nueva y los antiguos se siguen abriendo.

El cifrado ocurre en tu ordenador. La cadena nunca ve el mensaje, solo la clave pública.

```bash
cd 01-qoreseal
```

Entra en la carpeta de QoreSeal.

### Paso 1: instala {#seal-install}

```bash
npm install
```

Descarga las versiones exactas de los paquetes de `package-lock.json`: QoreSeal, QoreSign (el firmante híbrido) y unas pocas utilidades de cosmjs que construyen la transacción.

```bash
node seal.mjs help
```

Lista todos los comandos.

### Paso 2: crea tres cuentas de testnet {#seal-accounts}

```bash
node seal.mjs init alice
node seal.mjs init bob
node seal.mjs init eve
```

Cada comando crea una cuenta nueva y guarda sus palabras secretas en `~/.config/qday-w3/<name>.json`, legible solo por ti. No se muestra nada secreto. Pon `QDAY_DIR` para guardar los archivos en otro sitio. Cada comando muestra la dirección `qor1...` de la cuenta.

### Paso 3: financia a Alice {#seal-fund-alice}

Pega la dirección `qor1...` de Alice en el [faucet](/dashboard/faucet) y comprueba:

```bash
node seal.mjs whoami
```

Muestra cada cuenta: dirección, saldo y si sus claves ya están en la cadena. Por ahora la respuesta es `no`.

### Paso 4: Alice registra sus claves {#seal-register}

```bash
node seal.mjs register alice
```

Dos transacciones:

1. **La clave de firma ML-DSA-87**, con una prueba de que Alice la posee. Es la única transacción que la cadena acepta firmada solo con la clave clásica, porque aún no conoce su clave poscuántica.
2. **La clave de cifrado ML-KEM-1024** (1.568 bytes), firmada con ambas claves. A partir de ahora cualquiera puede leerla desde la cadena.

Después firma la **tarjeta de destinatario** de Alice y la guarda como `cards/alice.json`. En una aplicación real publicarías la tarjeta junto a la dirección, por ejemplo en una página de perfil, en un contrato o detrás de una API.

### Paso 5: reparte QOR a Bob y Eve, y registra a Bob {#seal-bob}

```bash
node seal.mjs fund alice bob 3
node seal.mjs fund alice eve 3
```

Envía 3 QOR de prueba de Alice a Bob y a Eve. Como toda transacción posterior al registro, se firma con **ambas** claves y la cadena comprueba las dos. Por eso Alice se registra primero: una cuenta sin clave ML-DSA-87 en la cadena solo puede registrar una, y cualquier otra transacción suya se rechaza.

```bash
node seal.mjs register bob
```

Bob hace falta para el paso 9, donde un mensaje va a dos personas. Eve sigue sin registrar: es la tercera persona que intentará leer el correo de Alice.

### Paso 6: busca a Alice, como haría un remitente {#seal-lookup}

```bash
node seal.mjs lookup alice
```

Lee `GET /qorechain/pqc/v1/kem/<address>` de la API REST pública: el algoritmo (`ML-KEM-1024`), la clave pública de 1.568 bytes y el bloque en que se registró. Después comprueba la tarjeta contra esa clave y contra la clave ML-DSA-87 de Alice en la cadena. Deberías ver `card valid`. Puedes hacerlo con cualquier dirección: `node seal.mjs lookup qor1...`.

### Paso 7: sella un mensaje para Alice y ábrelo {#seal-send}

```bash
node seal.mjs send alice "Payroll for March: 12,400 QOR to the team"
```

Lee la clave de Alice desde la cadena, comprueba su tarjeta y sella el mensaje. Un mensaje de 41 caracteres pasa a ocupar unos 1.760 bytes, sobre todo material de clave poscuántica. El sobre se guarda en `inbox/`.

```bash
node seal.mjs open alice
```

Muestra `OPENED by alice with encryption key #0` y el mensaje.

```bash
node seal.mjs open eve
```

Muestra `CANNOT OPEN: eve holds none of the keys this envelope was sealed to`. Eve tiene el archivo, pero no la clave de Alice.

### Paso 8: manipúlalo {#seal-tamper}

```bash
node seal.mjs tamper alice
```

Cambia un bit del sobre e intenta abrirlo. Deberías ver `REFUSED` con `DECRYPTION_FAILED`. El sobre está autenticado, así que cualquier cambio se detecta y nadie puede editar un mensaje sellado.

### Paso 9: un mensaje, dos destinatarios {#seal-multi}

```bash
node seal.mjs send alice,bob "Board memo: Q4 budget"
node seal.mjs open bob
node seal.mjs open alice
```

Un solo sobre, sellado para ambas direcciones. Cada uno lo abre con su propia clave. Eve sigue sin poder.

### Paso 10: rota la clave de Alice {#seal-rotate}

```bash
node seal.mjs rotate alice
```

Deriva la **siguiente** clave de cifrado de Alice (la número 1) a partir de las mismas palabras secretas y la registra en la cadena, donde **sustituye** a la anterior. Después comprueba la tarjeta **antigua** contra la cadena y deberías ver `refused: the card names a different ML-KEM-1024 key than the registered one`. Los remitentes que comprueban la tarjeta ya no pueden sellar para la clave antigua. Se firma una tarjeta nueva.

```bash
node seal.mjs open alice inbox/$(ls inbox | head -1)
```

Abre el **primer** sobre, sellado antes de la rotación: `OPENED by alice with encryption key #0 (an older key)`. La clave antigua nunca se guardó. Se deriva de nuevo a partir de las palabras secretas, así que rotar nunca te deja fuera del correo antiguo.

```bash
node seal.mjs inspect
```

Muestra lo que hay dentro de un sobre sin el secreto: versión, propósito, destinatarios y tamaños.

### Cómo funciona el código {#seal-code}

Todo está en `seal.mjs`. Las llamadas de QoreSeal que importan:

| Llamada | Qué hace |
| --- | --- |
| `deriveSealKeys({ mnemonic, index })` | Las claves de cifrado de la clave número `index`, derivadas de las palabras secretas |
| `buildRegisterKemKeyMessage({ sender, mlkemPublicKey })` | El mensaje `MsgRegisterKEMKey` que pone la clave en la cadena |
| `signRecipientCard({ chainId, address, keys, classicalKey, pqKey })` | La tarjeta, firmada con las dos claves de firma de la cuenta |
| `verifyRecipientCard({ card, chainId, address, mlkemPublicKey, pqPublicKey })` | Lanza un error salvo que la tarjeta coincida con las claves de la cadena |
| `sealToAddresses({ rest, chainId, purpose, recipients, plaintext })` | Lee cada clave de la cadena, comprueba cada tarjeta y sella |
| `open({ chainId, purpose, envelope, keys })` | Abre el sobre, o lanza un error |
| `envelopeToText` y `envelopeFromText` | El sobre como archivo de texto y de vuelta |

`purpose` (aquí `qday-note`) forma parte de lo que se sella: un sobre hecho para una aplicación no puede abrirse como si viniera de otra.

### Si algo sale mal (QoreSeal) {#seal-trouble}

| Qué ves | Qué hacer |
| --- | --- |
| `does not exist on chain yet: fund ... first` | La cuenta no tiene QOR: usa el faucet o `fund` |
| `no ML-KEM key registered for this address` | Ejecuta antes `register` para esa cuenta |
| `hybrid mode needs the recipient card` | Falta el archivo `cards/<name>.json`: ejecuta `register <name>`, que escribe la tarjeta otra vez |
| `no envelope yet` | Ejecuta antes `send` |
| `account has no PQC key and classical fallback is disabled` | Esa cuenta aún no se ha registrado: ejecuta `register <name>` antes de `fund` desde ella |
| `refused: ...` en una transacción | Lee el mensaje: normalmente no hay QOR suficiente, o la API pública de la testnet te está limitando la frecuencia. Espera unos segundos |

Los archivos de `~/.config/qday-w3/` guardan palabras secretas. Nunca los subas ni los compartas, y nunca los reutilices en mainnet. Las carpetas `cards/` e `inbox/` son locales y están en `.gitignore`.

## Parte 2: CrossVmCheckout, una transacción a través de dos VM {#part-2}

Código: [workshop-3/02-cross-vm](https://github.com/qorechain/build-before-qday/tree/main/workshop-3/02-cross-vm). Lenguajes: Solidity y TypeScript para el lado EVM, Rust para el lado Native.

QoreChain ejecuta más de una máquina virtual en la misma cadena: la **EVM** (Solidity, al estilo de MetaMask) y **QoreChain Native** (contratos CosmWasm en Rust). Comparten un solo estado y un solo bloque. Esta aplicación es una tiendita:

- **`CrossVmCheckout`** (Solidity, EVM) cuenta pedidos.
- **`qday-receipts`** (Rust, Native) guarda un libro de recibos.
- Una llamada a `checkout("coffee for the team")` hace ambas cosas **en la misma transacción**: el contador de pedidos sube en el lado EVM y se escribe un recibo en el lado Native.

La clave es la **atomicidad**: ambos lados cambian juntos o ninguno cambia.

| Comando | Qué pasa | Resultado |
| --- | --- | --- |
| `checkout` | Pedido +1 en la EVM, recibo +1 en Native | Cambian los dos |
| `undo` | Se escribe el recibo Native, **después** el lado EVM revierte | No cambia ninguno: el recibo también se deshace |
| `native-fails` | Se cuenta el pedido, **después** el contrato Native rechaza | No cambia ninguno: el pedido también se deshace |
| `outside` | Pedir al puente que llame a un contrato Native que la gobernanza no ha aprobado | Rechazado por la cadena |

En mainnet las llamadas cross-VM están en pausa por ahora, así que esta parte funciona solo en la testnet.

### El puente y la lista de permitidos {#bridge}

La EVM llega a Native a través del precompile del puente en `0x0000000000000000000000000000000000000901`. Tú llamas a:

```solidity
executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)
```

| Argumento | Significado |
| --- | --- |
| `targetVM` | `1` para Native |
| `targetContract` | La dirección `qor1...` del contrato Native |
| `payload` | El mensaje JSON del contrato Native |

El puente solo llega a contratos Native que la **gobernanza** ha aprobado. La lista es pública, en los parámetros de crossvm (`GET https://api-testnet.qore.host/qorechain/crossvm/v1/params`), y cada entrada queda fijada al código del contrato, así que un contrato aprobado no puede cambiarse más tarde por otro código distinto.

El contrato Native al que vas a llamar, `qday-receipts`, está en la lista de permitidos de la testnet (propuesta de gobernanza 40, code id 865):

```text
qor1xjayq5ev55tkzpml9klxwyshr7gdrha0nurha9jhm0f0gdckksgs3gltw8
```

No tiene administrador, así que nadie puede cambiarlo. **Cualquier builder puede llamarlo desde sus propios contratos para la pista Cross-VM.** En el lado Native, quien envía la llamada es la cuenta `qor1...` de tu propio contrato EVM, no tu wallet, así que cada recibo muestra qué contrato lo escribió.

### Cómo funciona el contrato EVM {#xvm-how}

Abre `evm/src/CrossVmCheckout.sol`:

```solidity
function checkout(string calldata note, bool failAfter) external returns (bytes memory reply) {
    _checkNote(bytes(note));
    orders += 1;
    reply = _callNative(bytes(string.concat('{"record":{"note":"', note, '"}}')));
    if (failAfter) revert EvmSideFailed();
    emit Ordered(orders, msg.sender, note, reply);
}

function _callNative(bytes memory payload) private returns (bytes memory) {
    (bool ok, bytes memory ret) =
        BRIDGE.call(abi.encodeWithSignature("executeCrossVMCall(uint8,string,bytes)", NATIVE, receipts, payload));
    if (!ok) revert BridgeCallFailed(ret);
    if (ret.length == 0) revert BridgeNotActive();
    if (ret.length >= 64 && uint256(bytes32(ret)) == 32) return abi.decode(ret, (bytes));
    return ret;
}
```

1. **Comprueba la nota.** Va dentro de una cadena JSON, así que debe tener de 1 a 140 caracteres imprimibles, sin `"` ni `\`. Si no, una nota manipulada podría cambiar el mensaje que recibe el contrato Native.
2. **Cuenta el pedido.** Un cambio de estado normal de la EVM.
3. **Llama al puente.** El contrato Native se ejecuta ahí mismo, dentro de esta transacción.
4. **Si la llamada al puente falló, revierte.** Un fallo en Native se convierte en una reversión de la EVM, y toda la transacción se deshace.
5. **Sin respuesta no hay puente.** En una cadena donde el precompile no está activo, una llamada a esa dirección "tiene éxito" con datos vacíos. Trátalo como un error, nunca como un éxito.
6. **Decodifica la respuesta.** El puente devuelve la respuesta de Native como `bytes` codificados en ABI. El código también acepta bytes sin procesar.
7. **`failAfter`** revierte después de que la llamada a Native tuvo éxito. Demuestra que el recibo escrito en el lado Native también se deshace.

Usa un `call` normal, no un `staticcall` ni una función view: el puente rechaza las llamadas estáticas, porque el lado Native puede escribir estado.

Todos los comandos de abajo se ejecutan en la carpeta `evm`, salvo que se diga otra cosa:

```bash
cd ../02-cross-vm/evm
```

Si sigues en `01-qoreseal`, esto te lleva a la carpeta EVM de la aplicación cross-VM.

### Paso 1: ejecuta las pruebas (no hace falta cuenta) {#xvm-tests}

```bash
pnpm install
pnpm forge-std
forge test
```

`pnpm install` descarga los paquetes de JavaScript. `pnpm forge-std` descarga la librería estándar de Foundry en `lib/`, una sola vez. `forge test` ejecuta las 5 pruebas de `test/CrossVmCheckout.t.sol`. Deberías ver `5 passed; 0 failed`.

La EVM local de Foundry no tiene el puente de QoreChain, así que las pruebas colocan un pequeño puente falso en `0x...0901` con `vm.etch`. Comprueban el mensaje JSON exacto que se envía, que `failAfter` revierte todo, que un fallo de Native revierte el lado EVM, que una nota no puede inyectar JSON y que un puente inactivo es un error. El puente real se ejecuta en los pasos siguientes.

### Paso 2: una cuenta con clave poscuántica {#xvm-account}

Si hiciste el Taller 2, copia tu `.env` de allí (la misma cuenta, con la clave ya registrada) y añade la línea `RECEIPTS_CONTRACT` de `.env.example`. Si no:

```bash
cast wallet new
cp .env.example .env
```

`cast wallet new` crea una cuenta desechable. Pon su clave privada en `.env` como `PRIVATE_KEY`. **Solo testnet.**

```bash
pnpm window recovery-code
```

Muestra un código `QRC1-...`. Ponlo en `.env` como `QORE_PQC_RECOVERY_CODE` y guarda una copia aparte de la clave privada. Tu clave ML-DSA-87 se deriva de él.

```bash
pnpm window status
```

Muestra tu dirección `qor1...`. Pégala en el [faucet](/dashboard/faucet) y luego:

```bash
pnpm window register
```

Pone tu clave ML-DSA-87 en la cadena, una vez por cuenta. Ahora `pnpm window status` muestra `PQC key: registered`.

### Paso 3: abre una ventana EVM limitada {#xvm-window}

```bash
pnpm window:scoped
```

Abre una ventana de **1.200 bloques (unos 28 minutos), 6 transacciones y 3 QOR** de valor más comisiones. Es suficiente para el despliegue y las tres transacciones de la demostración, y nada más. Tu wallet llama a **tu propio contrato**, y el contrato llama después al puente con su propia identidad, así que la ventana solo necesita admitir la llamada a tu contrato.

**Espera unos 10 segundos** antes del paso siguiente, para que la transacción de la ventana esté en un bloque.

### Paso 4: despliega la tienda {#xvm-deploy}

```bash
pnpm deploy:testnet
```

Despliega `CrossVmCheckout` apuntando a `RECEIPTS_CONTRACT`. Busca `CrossVmCheckout 0x...`. En la salida de Foundry, "ETH" significa QOR.

```bash
pnpm xvm status
```

Muestra ambos lados: `orders` en tu contrato EVM y el número de recibos en `qday-receipts`, con los tres últimos recibos. Otros builders escriben en el mismo libro de recibos, así que su cuenta probablemente no es cero. Lo que importa es cómo **cambia**.

### Paso 5: un contrato que la cadena no ha aprobado {#xvm-outside}

```bash
pnpm xvm outside
```

Simula una llamada directa al puente hacia un contrato Native real que **no** está en la lista de permitidos. Deberías ver `REFUSED by the bridge: ... is not allowlisted`. Es gratis y no usa ninguna transacción de la ventana.

### Paso 6: una transacción, dos VM {#xvm-checkout}

```bash
pnpm xvm checkout "coffee for the team"
```

Ves `before`, la transacción (`SUCCESS`) y `after`: pedidos +1 **y** recibos +1, además del recibo nuevo con tu nota, enviado `from` la dirección `qor1...` de tu contrato. Después `both sides changed, in the same transaction`.

### Paso 7: el lado EVM falla después de la llamada a Native {#xvm-undo}

```bash
pnpm xvm undo "this receipt must disappear"
```

Se escribe el recibo Native y después el lado EVM revierte. La transacción se mina como `REVERTED`, y `before` y `after` son idénticos: `nothing changed on either side`. El recibo que se escribió en el lado Native también desaparece.

### Paso 8: el lado Native rechaza {#xvm-native-fails}

```bash
pnpm xvm native-fails
```

El pedido se cuenta en el lado EVM, y después `qday-receipts` rechaza con `{"fail":{}}`. La transacción es `REVERTED` y los números son idénticos: el pedido de la EVM también se deshace.

Cada transacción tiene un enlace al explorador. Ábrelo en el [explorador del panel](/dashboard/explorer) con el selector de red en **Testnet**.

### Si algo sale mal (cross-VM) {#xvm-trouble}

| Qué ves | Qué significa | Qué hacer |
| --- | --- | --- |
| `Missing or invalid parameters` al desplegar o en una transacción | No hay una ventana EVM activa | `pnpm window status`, luego `pnpm window:scoped`, espera 10 segundos y vuelve a intentarlo |
| `No shop yet` | No se ha desplegado nada desde esta carpeta | Paso 4, o pon `SHOP_ADDRESS` en `.env` |
| `BridgeCallFailed` con `not allowlisted` | La gobernanza no ha aprobado el destino | Usa `qday-receipts`, la dirección de arriba |
| `BridgeNotActive` | El precompile del puente no está activo en esa red | Usa la testnet |
| `BadNote` | La nota está vacía, es demasiado larga o contiene `"` o `\` | Usa texto sencillo de hasta 140 caracteres |

### El lado Native {#native-side}

La carpeta `native/` contiene el código fuente completo de `qday-receipts` (CosmWasm 2, Rust):

| Mensaje | Qué hace |
| --- | --- |
| `{"record":{"note":"..."}}` | Añade un recibo: id, remitente, nota, altura de bloque |
| `{"fail":{}}` | Siempre rechaza, para mostrar la atomicidad |
| `{"count":{}}` (consulta) | Cuántos recibos hay |
| `{"receipt":{"id":1}}` (consulta) | Un recibo |
| `{"latest":{"limit":3}}` (consulta) | Los recibos más nuevos, el más nuevo primero, como máximo 20 |

Ejecuta sus pruebas (hace falta Rust):

```bash
cd ../native
cargo test
```

Deberías ver que pasan 3 pruebas. Subir contratos Native a la testnet pasa por la gobernanza, así que no necesitas desplegar este: ya está activo.

Para comprobar que el código de la cadena es este código fuente, compílalo con el optimizador de CosmWasm y compara los checksums. El código de la cadena se compiló en un Mac con Apple Silicon con la imagen arm64, así que usa la misma: la imagen x86 produce un checksum distinto.

```bash
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/optimizer-arm64:0.16.1
cat artifacts/checksums.txt
```

El checksum debe ser `6ebfc32fb9a9c8a412fdb071fb2c317b780ba05f637b8a4d274001c95fb5c43c`, el mismo `data_hash` que muestra la cadena para el código 865:

```bash
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/code/865" | head -c 400
```

Lee el libro de recibos desde cualquier sitio, sin cuenta:

```bash
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/contract/qor1xjayq5ev55tkzpml9klxwyshr7gdrha0nurha9jhm0f0gdckksgs3gltw8/smart/$(printf '{"latest":{"limit":3}}' | base64)"
```

### Archivos {#files}

```text
evm/src/CrossVmCheckout.sol         the shop: counts orders, writes receipts through the bridge
evm/test/CrossVmCheckout.t.sol      Foundry tests, with a fake bridge
evm/script/CrossVmCheckout.s.sol    deploy script (reads RECEIPTS_CONTRACT and PRIVATE_KEY)
evm/scripts/window.ts               pnpm window: status, register, open, recovery-code
evm/scripts/xvm.ts                  pnpm xvm: status, checkout, undo, native-fails, outside
evm/.env.example                    the settings to copy into .env
native/src/lib.rs                   qday-receipts, the Native contract
```

## Más información {#learn-more}

- El festival, las pistas Encrypted Apps y Cross-VM y las recompensas: [build.qorechain.io](https://build.qorechain.io).
- QoreSeal en npm: [@qorechain/qoreseal](https://www.npmjs.com/package/@qorechain/qoreseal).
- [Precompiles de la EVM](/developer-guide/evm-precompiles) y la [referencia cross-VM](/developer-guide/cross-vm-reference).
- [Taller 2](/build-before-qday/workshop-2) para la ventana EVM y la bóveda.
