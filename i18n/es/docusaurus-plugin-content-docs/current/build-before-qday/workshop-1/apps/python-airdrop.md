---
slug: /build-before-qday/workshop-1/apps/python-airdrop
title: Aplicación en Python, Q-Day Airdrop
sidebar_label: Python, Airdrop
sidebar_position: 6
---

# Aplicación en Python: Q-Day Airdrop

El **Q-Day Airdrop** es una pequeña herramienta en Python que envía QOR de testnet a una lista completa de direcciones en **una** transacción, firmada con una clave clásica secp256k1 y una clave poscuántica ML-DSA-87 (FIPS 204). Después demuestra, a partir del propio registro de la cadena, que ambas firmas fueron verificadas. Se ejecuta en la testnet de QoreChain (`qorechain-diana`, ID de cadena EVM 9800).

## Qué demuestra {#what-it-shows}

- **Firma híbrida ML-DSA-87 + secp256k1** desde Python.
- **Una transacción con firma híbrida verificada en la cadena**, que paga a muchos destinatarios a la vez con un único mensaje de envío múltiple.
- **Un informe de verificación** construido a partir del registro de la propia cadena, no de lo que diga la herramienta.

Por qué importa: una sola firma protege un airdrop entero, y sigue protegida frente a un futuro ordenador cuántico porque la mitad ML-DSA-87 es poscuántica. Consulta [Transacciones resistentes a la computación cuántica](/sdk/guides/quantum-safe).

## Paso a paso {#run}

Todo lo que sigue se ejecuta en tu propia terminal (macOS, Linux o Windows con WSL). Solo usas una cuenta de testnet desechable. Los QOR de testnet no tienen valor y aquí nunca usas una wallet real.

### 1. Instala las herramientas {#install}

Necesitas Git y Python 3.10 o posterior (con `venv`). Comprueba lo que tienes:

```bash
git --version
python3 --version      # must report 3.10 or later
python3 -m venv --help # prints usage if venv is available
```

Si falta algo, instálalo primero, por ejemplo desde [python.org](https://www.python.org/downloads/) o con tu gestor de paquetes (`brew install python` en macOS, `sudo apt install python3 python3-venv git` en Debian o Ubuntu). Abre una terminal nueva y repite las comprobaciones.

### 2. Obtén el código {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/06-python-airdrop
```

### 3. Instala las dependencias {#deps}

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Esto instala un solo paquete, `qorechain-sdk==0.13.0`, más lo que necesita. Mantén activo el entorno virtual durante el resto de los pasos (vuelve a ejecutar `source .venv/bin/activate` en cualquier terminal nueva). Comprueba que la herramienta arranca:

```bash
python airdrop.py --help
```

Deberías ver los comandos `new`, `status`, `register`, `drop` y `verify`.

### 4. Crea tu cuenta de testnet desechable {#key}

```bash
python airdrop.py new
```

Esto genera una frase de recuperación nueva, la escribe en el archivo de claves `~/.config/qday/python.env` (legible solo por ti, modo 600) e imprime únicamente la dirección de la cuenta, que empieza por `qor1...`. La frase nunca se muestra. No compartas este archivo, no lo subas a git y no lo reutilices en la mainnet. Para guardar la clave en otro lugar, pon `--key-file /path/to/file` antes del nombre del comando (por ejemplo `python airdrop.py --key-file ~/my.env status`) o define `QORE_KEY_FILE`.

Copia la dirección `qor1...` de la salida. Si la pierdes, `python airdrop.py status` la vuelve a imprimir.

### 5. Consigue QOR de testnet en el faucet {#faucet}

1. Abre https://dashboard.qorechain.io/faucet e inicia sesión.
2. Pega tu dirección `qor1...` y solicita tokens. El faucet da 100 QOR cada 24 horas.
3. Comprueba que han llegado:

```bash
python airdrop.py status
```

El saldo debería mostrar tus QOR de testnet, y la clave poscuántica debería aparecer como aún no registrada.

### 6. Registra tu clave poscuántica {#register}

```bash
python airdrop.py register
```

Esto registra tu clave ML-DSA-87 en la cadena una sola vez. Es seguro ejecutarlo de nuevo. El registro se firma de forma clásica, porque una clave no puede cofirmar su propio registro. Todas las transacciones posteriores se firman de forma híbrida.

### 7. Escribe la lista de destinatarios {#list}

Crea un archivo de texto con una dirección de testnet por línea. Para una primera prueba, crea unas cuantas direcciones desechables apuntando `--key-file` a archivos nuevos, o usa direcciones de amigos que también usen la testnet:

```bash
python airdrop.py --key-file ~/.config/qday/r1.env new
python airdrop.py --key-file ~/.config/qday/r2.env new
```

Después pon las direcciones impresas en `addresses.txt`:

```text
# One qor1 address per line. Blank lines and lines starting with # are ignored.
qor1...first-testnet-address
qor1...second-testnet-address
```

Las líneas en blanco, los comentarios con `#`, los duplicados, el propio remitente y cualquier cosa que no sea una dirección de cuenta `qor1...` válida se omiten con un aviso. Como máximo 100 destinatarios por transacción. El repositorio también incluye `addresses.example.txt`, un ejemplo con líneas de marcador de posición.

### 8. Envía el airdrop {#drop}

```bash
python airdrop.py drop addresses.txt 0.1 --memo "Build Before Q-Day"
```

`0.1` es la cantidad en QOR que se envía a cada destinatario. La herramienta muestra un resumen (destinatarios, cantidad por cada uno, total) y te pide confirmar; añade `--yes` para omitir la pregunta. Después simula la transacción para fijar el gas, la firma con ambas claves, la difunde como una sola transacción e imprime el informe de verificación. Si una difusión falla, espera un minuto y reintenta.

### 9. Verifica cualquier transacción {#verify}

```bash
python airdrop.py verify <TX_HASH>
```

Usa el hash que imprimió `drop`. Esto imprime por sí solo el informe de verificación, para cualquier hash de transacción.

## Qué deberías ver {#output}

- `drop` imprime el hash y la altura de la transacción y después el informe de verificación: el estado de `pqc_hybrid_verify` del firmante es `verified`, la firma ML-DSA-87 ocupa 4627 bytes, el código es 0 y el número de destinatarios coincide con tu lista.
- En el explorador: abre `https://explore.qore.network/tx/<HASH>` y cambia el explorador a **Testnet**. La transacción aparece como exitosa, con todos los destinatarios pagados.

## Cómo funciona la prueba {#proof}

`verify` lee `GET /cosmos/tx/v1beta1/txs/{hash}` del endpoint REST público de la testnet y comprueba:

- un evento de tipo `pqc_hybrid_verify` para el firmante con `status=verified`;
- que la extensión `/qorechain.pqc.v1.PQCHybridSignature` lleva una firma ML-DSA-87 de 4627 bytes (junto a la secp256k1 de 64 bytes);
- que la transacción tuvo éxito (código 0) y a cuántos destinatarios pagó.

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

La clave se registra una sola vez con `ensure_pqc_registered(...)`, que no hace nada si la misma clave ya está en la cadena. El gas nunca es fijo: la transacción real con firma híbrida se simula primero y el límite es el gas simulado multiplicado por 1,3, con un precio de 0,15 uqor por unidad de gas.

La cuenta usa coin type 118 (`m/44'/118'/0'/0/0`). La clave ML-DSA-87 se deriva de la misma frase de recuperación y se vincula a la dirección con `derive_pqc_canonical`. Si en cambio construyes tu propia aplicación sobre los auxiliares basados en semilla, el SDK 0.13.0 necesita un código de recuperación o un secreto PQC independiente de 32 bytes (en Python `unified_account_from_seed(seed32, recovery_code=...)`); consulta [Instalar el SDK](/sdk/install#whats-new-0130). No imprimas nunca un código de recuperación.

## Paquetes usados {#packages}

| Elemento | Versión |
| --- | --- |
| `qorechain-sdk` (PyPI, importado como `qorsdk`) | 0.13.0 (fijado en `requirements.txt` como `qorechain-sdk==0.13.0`) |
| Python | 3.10 o posterior |

La herramienta también importa los tipos protobuf `Input`, `Output` (de `cosmpy.protos.cosmos.bank.v1beta1.bank_pb2`) y `Coin` (de `cosmpy.protos.cosmos.base.v1beta1.coin_pb2`); vienen con el SDK. Consulta [Instalar el SDK](/sdk/install) para ver la tabla de versiones de todos los lenguajes.

## Dónde consultar cada cosa {#access}

| Qué | Dónde |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorador | `https://explore.qore.network` (cambia a Testnet) |
| Faucet | https://dashboard.qorechain.io/faucet |
| Código | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/06-python-airdrop |
