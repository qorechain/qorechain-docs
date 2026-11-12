---
slug: /build-before-qday/workshop-1/apps/python-airdrop
title: App en Python, Q-Day Airdrop
sidebar_label: Python, Airdrop
sidebar_position: 6
---

# App en Python: Q-Day Airdrop

El **Q-Day Airdrop** es una pequeña herramienta en Python que envía QOR de testnet a toda una lista de direcciones en **una sola** transacción. La transacción se firma con una clave clásica secp256k1 y una clave poscuántica ML-DSA-87 (FIPS 204). Después, la herramienta demuestra, con el propio registro de la cadena, que se verificaron las dos firmas. Funciona en la testnet de QoreChain (`qorechain-diana`, EVM chain ID 9800).

**Cuánto tarda:** unos 20 minutos la primera vez (10 minutos instalando herramientas, 5 de configuración y 5 enviando y comprobando).

No necesitas saber Python. Solo escribes los comandos de abajo, uno por uno, y comparas el resultado con "Qué deberías ver".

## Qué demuestra {#what-it-shows}

- **Firma híbrida ML-DSA-87 + secp256k1** desde Python.
- **Una transacción firmada de forma híbrida y verificada en la cadena**, que paga a muchos destinatarios a la vez con un único mensaje de envío múltiple.
- **Un informe de verificación** construido a partir del registro de transacción de la propia cadena, no de la palabra de la herramienta.

Por qué importa: una sola firma protege todo un airdrop, y sigue protegido frente a un futuro ordenador cuántico porque la mitad ML-DSA-87 es poscuántica. Consulta [Transacciones resistentes a la computación cuántica](/sdk/guides/quantum-safe).

:::warning Solo testnet
Usa solo una cuenta de testnet desechable. Los QOR de la testnet no tienen valor. No uses en este tutorial tu wallet real, tu frase de recuperación real ni fondos reales.
:::

## Palabras que verás {#words}

| Palabra | Significado |
| --- | --- |
| Testnet | Una copia de práctica de QoreChain. Sus monedas son gratis y no valen nada. |
| QOR y uqor | Dos nombres de la misma moneda. 1 QOR = 1.000.000 uqor. La herramienta pide QOR. Las comisiones se muestran en uqor. |
| Memo | Un texto corto adjunto a una transacción, como la nota de una transferencia bancaria. |
| Dirección | Tu número de cuenta público. En QoreChain empieza por `qor1`. Es seguro compartirla. |
| Archivo de clave | Un archivo con tu frase de recuperación secreta. No lo compartas nunca. |
| Faucet | Un sitio web que da QOR de testnet gratis. |
| Hash | El identificador único de una transacción. Sirve para buscarla. |

## Antes de empezar {#before}

Necesitas **Git** (descarga el código) y **Python 3.10 o superior** con `venv` (una carpeta privada para las librerías de la herramienta). Tras cada instalación, **cierra la terminal y abre una nueva**, y luego ejecuta el comando de comprobación.

| Herramienta | macOS | Windows | Linux (Debian o Ubuntu) | Comprobación |
| --- | --- | --- | --- | --- |
| Git | `brew install git` (Homebrew desde https://brew.sh) | https://git-scm.com/download/win | `sudo apt install git` | `git --version` |
| Python 3.10+ | `brew install python` | https://www.python.org/downloads/ (marca "Add python.exe to PATH" en el instalador) | `sudo apt install python3 python3-venv python3-pip` | `python3 --version` (en Windows: `python --version`) |

En Windows, usa PowerShell o Git Bash. Donde esta página dice `python3`, Windows suele usar `python`. Todo lo demás es igual, salvo la línea que activa el entorno virtual (paso 3).

## Consigue una wallet de testnet y QOR gratis {#wallet}

La herramienta crea su propia clave desechable (paso 4 de abajo), así que no necesitas una app de wallet para este tutorial. Si además quieres ver tu cuenta en QoreX:

1. **App QoreX:** abre Ajustes y activa **Use testnet (developers)**.
2. **Extensión de navegador de QoreX:** desbloquéala, toca 7 veces el número de versión de la parte inferior y elige **Switch to testnet (diana)**.

Los QOR gratis salen del faucet en https://dashboard.qorechain.io/faucet. Inicias sesión, pegas la dirección y haces la solicitud. Da **100 QOR cada 24 horas por cuenta**.

La primera transacción de una cuenta nueva registra en la cadena su clave poscuántica ML-DSA-87. Es un paso único con una tarifa de unos 0,09 QOR. La herramienta lo hace por ti con el comando `register`.

## Paso a paso {#run}

### 1. Descarga el código {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/06-python-airdrop
```

**Qué hace**

- `git clone <address>`: copia el proyecto desde GitHub a una carpeta nueva llamada `build-before-qday`.
- `cd <folder>`: mueve tu terminal a la carpeta de la app en Python. Todos los comandos posteriores deben ejecutarse desde esta carpeta.

**Qué deberías ver:** líneas como `Cloning into 'build-before-qday'...` y después tu prompt en la carpeta nueva.

### 2. Crea un entorno de Python privado {#venv}

```bash
python3 -m venv .venv
```

**Qué hace:** crea una carpeta llamada `.venv` que guarda las librerías de esta herramienta, para que no se mezclen con nada más de tu ordenador.

| Parte | Significado |
| --- | --- |
| `python3` | El programa Python. |
| `-m venv` | Ejecuta el creador de "entornos virtuales" incorporado de Python. |
| `.venv` | El nombre de la carpeta que se crea. |

**Qué deberías ver:** no se imprime nada, y aparece una carpeta nueva `.venv`.

### 3. Actívalo e instala las librerías {#deps}

```bash
source .venv/bin/activate
```

En PowerShell de Windows usa en su lugar `.venv\Scripts\activate` (si PowerShell lo bloquea, ejecuta `Set-ExecutionPolicy -Scope Process RemoteSigned` e inténtalo de nuevo). En el Símbolo del sistema de Windows usa `.venv\Scripts\activate.bat`.

**Qué hace:** cambia tu terminal para que use el entorno privado.

**Qué deberías ver:** `(.venv)` al principio de tu prompt. Vuelve a activarlo con este mismo comando en cada terminal nueva.

```bash
pip install -r requirements.txt
```

| Parte | Significado |
| --- | --- |
| `pip` | El instalador de librerías de Python. |
| `install` | Descarga e instala librerías. |
| `-r requirements.txt` | Lee la lista de librerías de este archivo. Nombra una librería, `qorechain-sdk==0.13.0` (el SDK de QoreChain, versión exacta 0.13.0), más lo que necesita. |

**Qué deberías ver:** líneas de descarga que terminan en `Successfully installed ... qorechain-sdk-0.13.0`. Un aviso de que hay un pip nuevo disponible es inofensivo.

**Cuánto tarda:** de unos 15 segundos a 1 minuto.

Ahora comprueba que la herramienta arranca:

```bash
python airdrop.py --help
```

**Qué deberías ver:** los comandos `new`, `status`, `register`, `drop` y `verify`.

### 4. Crea tu cuenta de testnet desechable {#key}

```bash
python airdrop.py new
```

**Qué hace:** crea una cuenta nueva. Escribe una frase de recuperación secreta en el archivo de clave `~/.config/qday/python.env` (en tu carpeta personal, legible solo por tu usuario) e imprime únicamente la dirección pública.

| Parte | Significado |
| --- | --- |
| `new` | Crea un archivo de clave nuevo e imprime su dirección. |
| `new --force` | Reemplaza un archivo de clave existente. La clave anterior se pierde. |

**Qué deberías ver:** `New testnet wallet`, una `address` que empieza por `qor1...`, la ruta del archivo de clave con `(mode 600, mnemonic not shown)` y una pista para el siguiente paso.

**Copia la dirección `qor1...`.** Si la pierdes, `python airdrop.py status` la imprime de nuevo. No compartas nunca el archivo de clave, no lo subas nunca a Git y no lo reutilices nunca en la mainnet.

Para guardar la clave en otro lugar, pon `--key-file` **antes** del nombre del comando:

```bash
python airdrop.py --key-file ~/my.env status
```

`--key-file <path>` significa "usa este archivo de clave en lugar del predeterminado". El orden importa: `--key-file` va antes de `status`, `drop` y los demás comandos. También puedes definir la variable de entorno `QORE_KEY_FILE` en su lugar.

### 5. Consigue QOR de testnet en el faucet {#faucet}

1. Abre https://dashboard.qorechain.io/faucet e inicia sesión.
2. Pega tu dirección `qor1...` y pulsa el botón de solicitud.
3. Espera unos segundos y ejecuta:

```bash
python airdrop.py status
```

**Qué hace:** le pregunta a la testnet tu saldo y si tu clave poscuántica está registrada.

**Qué deberías ver:** tu saldo (unos 100 QOR) y un aviso de que la clave ML-DSA-87 aún no está registrada. Si dice que la dirección "is not on chain yet", el pago del faucet todavía no ha llegado: espera 10 segundos e inténtalo de nuevo.

### 6. Registra tu clave poscuántica {#register}

```bash
python airdrop.py register
```

**Qué hace:** registra tu clave ML-DSA-87 en la cadena, una sola vez. Es seguro ejecutarlo de nuevo. Esta primera transacción se firma de forma clásica, porque una clave no puede cofirmar su propio registro. Cuesta unos 0,09 QOR. Cada transacción posterior se firma de forma híbrida.

**Qué deberías ver:** un hash de transacción y una línea `registered` (o `already registered` si lo ejecutaste dos veces).

**Cuánto tarda:** unos segundos (un bloque).

### 7. Escribe la lista de destinatarios {#list}

Crea dos cuentas de destinatario desechables. Cada una recibe su propio archivo de clave:

```bash
python airdrop.py --key-file ~/.config/qday/r1.env new
python airdrop.py --key-file ~/.config/qday/r2.env new
```

**Qué hace:** el mismo `new` de antes, pero `--key-file` manda cada clave a su propio archivo para que no se sobrescriba nada. (También puedes usar direcciones de amigos que usen la testnet.)

**Qué deberías ver:** dos direcciones `qor1...` distintas. Copia las dos.

Ahora crea en esta carpeta un archivo de texto plano llamado `addresses.txt`, con una dirección por línea. Sirve cualquier editor de texto (Bloc de notas en Windows, TextEdit en modo texto plano en macOS, `nano addresses.txt` en Linux):

```text
# One qor1 address per line. Blank lines and lines starting with # are ignored.
qor1...first-testnet-address
qor1...second-testnet-address
```

Sustituye las dos líneas de ejemplo por tus direcciones reales. Las líneas en blanco, los comentarios con `#`, los duplicados, el propio remitente y todo lo que no sea una dirección `qor1...` válida se omiten con un aviso. Máximo 100 destinatarios por transacción. La carpeta también tiene `addresses.example.txt`, un ejemplo con líneas de relleno.

### 8. Envía el airdrop {#drop}

```bash
python airdrop.py drop addresses.txt 0.1 --memo "Build Before Q-Day"
```

| Parte | Significado |
| --- | --- |
| `drop` | Envía una transacción que paga a todos los de la lista. |
| `addresses.txt` | El archivo con los destinatarios. |
| `0.1` | La cantidad en QOR **para cada destinatario** (0,1 QOR = 100.000 uqor). Dos destinatarios reciben 0,2 QOR en total. |
| `--memo "..."` | Un texto corto adjunto a la transacción. Opcional. |
| `--yes` (o `-y`) | Opcional: omite la pregunta de "¿estás seguro?". |

Orden de las opciones: la cantidad y el archivo van primero, y `--memo` y `--yes` van después. `--key-file` es distinto: va antes de `drop`.

**Qué hace:** muestra un resumen (destinatarios, cantidad para cada uno, total) y te pide confirmar. Escribe `y` y pulsa Enter. Después le pregunta a la cadena cuánto gas se necesita (una ejecución de prueba), añade un 30 por ciento como margen de seguridad, firma con las dos claves, envía una transacción e imprime el informe de verificación.

**Qué deberías ver:** el hash de la transacción y la altura, y luego un informe con: código 0, el estado `verified` de `pqc_hybrid_verify` del firmante, una firma ML-DSA-87 de 4.627 bytes y un número de destinatarios que coincide con tu lista. Copia el hash.

**Cuánto tarda:** unos 10 segundos.

### 9. Verifica cualquier transacción {#verify}

```bash
python airdrop.py verify <TX_HASH>
```

**Qué hace:** lee la transacción desde la cadena e imprime por sí solo el informe de verificación. Funciona con cualquier hash de transacción, no solo con los tuyos.

**Qué deberías ver:** el mismo informe que al final del paso 8.

## Verifica la transacción tú mismo {#check}

No tienes que fiarte de la herramienta. Pregúntale directamente a la cadena.

**Forma 1, en el navegador.** Abre `https://explore.qore.network/tx/<HASH>` (pon tu hash en lugar de `<HASH>`) y cambia el explorador a **Testnet**. Deberías ver una transacción exitosa con todos los destinatarios pagados.

**Forma 2, un comando:**

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

| Parte | Significado |
| --- | --- |
| `curl` | Una herramienta que descarga una dirección web. Viene incluida en macOS, Windows 10+ y la mayoría de Linux. |
| `-s` | Silencioso: oculta la barra de progreso. |
| la dirección | La API REST pública de la testnet. Devuelve el registro completo de la transacción en JSON. |

**Qué deberías ver** en la salida larga (añade `| jq .` si instalaste jq, consulta https://jqlang.github.io/jq/download/):

- `"code": 0` significa que la transacción tuvo éxito.
- Una extensión `PQCHybridSignature` con un `pqc_signature` de **4.627 bytes** (la firma ML-DSA-87), junto a la clásica de 64 bytes.
- Un evento `pqc_hybrid_verify` con `status` igual a `verified` para tu dirección.

## Cómo funciona la prueba {#proof}

`verify` lee `GET /cosmos/tx/v1beta1/txs/\{hash\}` desde el endpoint REST público de la testnet y comprueba:

- un evento de tipo `pqc_hybrid_verify` para el firmante con `status=verified`;
- que la extensión `/qorechain.pqc.v1.PQCHybridSignature` lleva una firma ML-DSA-87 de 4.627 bytes;
- que la transacción tuvo éxito (código 0), y a cuántos destinatarios pagó.

## Solución de problemas {#troubleshooting}

| Qué ves | Por qué | Qué hacer |
| --- | --- | --- |
| `python3: command not found` o versión inferior a 3.10 | Python falta o es antiguo. | Instala Python 3.10 o superior y abre una terminal nueva. En Windows usa `python`. |
| `No module named venv` o `ensurepip is not available` | La parte venv de Python no está instalada (Debian, Ubuntu). | `sudo apt install python3-venv` y repite el paso 2. |
| `ModuleNotFoundError: No module named 'qorsdk'` | El entorno no está activado, o se omitió la instalación. | Ejecuta `source .venv/bin/activate` y luego `pip install -r requirements.txt`. |
| `unrecognized arguments: --key-file` | `--key-file` se puso después del comando. | Ponlo antes: `python airdrop.py --key-file <path> status`. |
| `no key file at ... Run: python airdrop.py new` | Te saltaste el paso 4, o se usa otro `--key-file`. | Ejecuta `python airdrop.py new`. |
| `... already exists (use --force to replace it)` | Ya hay un archivo de clave. | Consérvalo, o ejecuta `python airdrop.py new --force` (la clave anterior se pierde). |
| `... is readable by others (mode ...)` | Los permisos del archivo de clave son demasiado abiertos. | Ejecuta `chmod 600 <path>`. |
| `... is not on chain yet (fund it first)` | No ha llegado ningún QOR del faucet. | Espera 10 segundos, o haz una solicitud al faucet. |
| `account has no PQC key and classical fallback is disabled` | La clave poscuántica aún no está registrada. | Ejecuta primero `python airdrop.py register`. |
| `the ML-DSA-87 key is not registered yet` | Mismo motivo, detectado por la herramienta antes de enviar. | Ejecuta `python airdrop.py register`. |
| `balance too low` | La cantidad total más la comisión supera lo que tienes. | Envía una cantidad menor, o espera a la próxima solicitud al faucet. |
| El faucet dice límite de solicitudes | Una solicitud cada 24 horas por cuenta. | Espera, o usa otra cuenta desechable. |
| `skip line N: not a valid qor1 address` | Una línea de `addresses.txt` no es una dirección correcta. | Corrige o borra esa línea. Las demás líneas siguen funcionando. |
| `no valid recipients` | Se omitieron todas las líneas. | Comprueba que `addresses.txt` tiene direcciones `qor1...` reales. |
| `bad amount` | La cantidad no es un número simple. | Usa QOR como número, por ejemplo `0.1`. |
| `refused by the node: code ...` | La cadena rechazó la transacción. | Lee el mensaje. Espera un minuto y reintenta si la testnet está ocupada o en actualización. |
| `transaction not found on the testnet` | Hash equivocado, o el bloque aún no es final. | Revisa el hash e inténtalo de nuevo en unos segundos. |
| `the testnet may be pausing for an upgrade` | Los endpoints públicos limitan las solicitudes por dirección IP, o la testnet se está actualizando. | Espera un minuto y vuelve a ejecutarlo. |
| `EVM authorisation window exhausted` | Pertenece a las apps EVM, no a esta. | En una app EVM, abre una ventana nueva con `pnpm window open`. |
| `HHE10402` tras abrir la ventana | Solo en las apps de Hardhat: la ventana aún no estaba activa. | Vuelve a ejecutar el despliegue. |
| Errores de `CORS` en un navegador | Solo ocurren cuando una página web llama a la cadena directamente. Esta herramienta no lo hace. | En una app de navegador, usa el proxy `/lcd` de la plantilla. |
| `pnpm: command not found` | pnpm no está instalado. Aquí no hace falta. | Solo para el tutorial de Hardhat: ejecuta `npm install -g pnpm`. |

## El código del SDK que importa {#code}

```python
from qorsdk import (derive_native_account, derive_pqc_canonical, msg, build_hybrid_tx,
                    auto_fee, hybrid_sign_and_broadcast, wait_for_tx,
                    resolve_sign_bytes_version)

account = derive_native_account(mnemonic)                   # classical secp256k1 key
pqc = derive_pqc_canonical(account.address, mnemonic)       # ML-DSA-87 key, same mnemonic

# ONE MsgMultiSend: one input (the sender), one output per recipient.
drop = msg.bank.multi_send(
    inputs=[Input(address=sender, coins=[Coin(denom="uqor", amount=str(each * len(to)))])],
    outputs=[Output(address=a, coins=[Coin(denom="uqor", amount=str(each))]) for a in to])

build = lambda fee, v: build_hybrid_tx(account=account, pqc_keypair=pqc, messages=[drop], fee=fee,
    memo=memo, chain_id="qorechain-diana", account_number=num, sequence=seq, sign_bytes_version=v)

v = resolve_sign_bytes_version("qorechain-diana", rest_url=REST)                 # "v2" on the testnet
fee = auto_fee(REST, build({"amount": [], "gas": "0"}, v), gas_multiplier=1.3)  # simulate
res = hybrid_sign_and_broadcast(lambda v: build(fee, v), chain_id="qorechain-diana", rest_url=REST)
included = wait_for_tx(rest, res["tx_response"]["txhash"])
```

La clave se registra una sola vez con `ensure_pqc_registered(...)`, que no hace nada si la misma clave ya está en la cadena. El gas nunca es fijo: primero se simula la transacción real firmada de forma híbrida y el límite es el gas simulado multiplicado por 1,3, con un precio de 0,15 uqor por unidad de gas.

La cuenta es de coin type 118 (`m/44'/118'/0'/0/0`). La clave ML-DSA-87 se deriva de la misma frase de recuperación y se liga a la dirección con `derive_pqc_canonical`. Si creas tu propia app con las ayudas basadas en semilla, el SDK 0.13.0 necesita un código de recuperación o un secreto PQC independiente de 32 bytes (en Python `unified_account_from_seed(seed32, recovery_code=...)`); consulta [Instalación del SDK](/sdk/install#whats-new-0130). No imprimas nunca un código de recuperación.

## Paquetes usados {#packages}

| Elemento | Versión |
| --- | --- |
| `qorechain-sdk` (PyPI, importado como `qorsdk`) | 0.13.0 (fijada en `requirements.txt` como `qorechain-sdk==0.13.0`) |
| Python | 3.10 o superior |

La herramienta también importa los tipos protobuf `Input`, `Output` (de `cosmpy.protos.cosmos.bank.v1beta1.bank_pb2`) y `Coin` (de `cosmpy.protos.cosmos.base.v1beta1.coin_pb2`); vienen con el SDK. Consulta [Instalación del SDK](/sdk/install) para ver la tabla de versiones de todos los lenguajes.

## Dónde consultar cada cosa {#access}

| Qué | Dónde |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorador | `https://explore.qore.network` (cambia a Testnet) |
| Faucet | https://dashboard.qorechain.io/faucet |
| Código | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/06-python-airdrop |
