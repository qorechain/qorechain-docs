---
slug: /cli-reference/transaction-commands
title: Comandos de transacción
sidebar_label: Comandos de transacción
sidebar_position: 2
---

# Comandos de transacción

Todos los comandos de transacción siguen el patrón:

```bash
qorechaind tx <module> <command> [args] [flags]
```

:::note
Establece `--chain-id qorechain-vladi` para transmitir contra la mainnet en vivo, o `--chain-id qorechain-diana` para la testnet. Ambas redes ejecutan la línea v3.2 (versión de nodo de la mainnet **v3.2.1**, testnet **v3.2.2**; consulta `latest.json` en [download.qore.host](https://download.qore.host) para ver la versión actual). Si se omite `--chain-id`, el cliente usa el `chain-id` de tu configuración local de cliente.
:::

Las flags comunes se aplican a todos los subcomandos `tx`:

| Flag                | Tipo   | Descripción                                                    |
| ------------------- | ------ | -------------------------------------------------------------- |
| `--from`            | string | Nombre o dirección de la clave firmante                        |
| `--chain-id`        | string | Identificador de la cadena (por defecto: de la configuración del cliente) |
| `--fees`            | string | Comisión de la transacción, p. ej. `40000uqor`                 |
| `--gas-prices`      | string | Precio del gas en lugar de `--fees`, p. ej. `0.1uqor`          |
| `--gas`             | string | Límite de gas, o `auto` para estimarlo (por defecto `200000`)  |
| `--gas-adjustment`  | float  | Multiplicador aplicado a la estimación `auto` (por defecto `1`) |
| `--keyring-backend` | string | `os`, `file`, `kwallet`, `pass`, `test` o `memory`             |
| `--node`            | string | Endpoint RPC (por defecto `tcp://localhost:26657`)             |
| `--broadcast-mode`  | string | `sync` o `async`                                               |
| `--generate-only`   | bool   | Imprime la transacción sin firmar en lugar de firmarla         |
| `-y`                | bool   | Omitir el mensaje de confirmación                              |

---

## Comisiones y gas {#fees-and-gas}

El mínimo de comisión de la red es **0.1 uqor por unidad de gas** (`query feemarket params` muestra `min_gas_price`; la comisión base en vivo puede subir por encima del mínimo bajo carga, consulta `query feemarket base-fee`). Una transacción se rechaza a menos que `fee >= gas limit x gas price`, por lo que `--fees 500uqor` solo funciona con un límite de gas de 5,000 o menos y falla en cualquier transacción real.

| Transacción                                   | `--gas` sugerido  | `--fees` correspondiente |
| --------------------------------------------- | ----------------- | ------------------------ |
| Transferencia, delegación, voto o reclamación con firma híbrida | `400000`          | `40000uqor`              |
| Registro de clave PQC                         | `600000`          | `60000uqor`              |
| `lightnode register`                          | `300000`          | `30000uqor`              |

Una firma híbrida añade unos 4.7 KB a una transacción, que se cobran a 10 de gas por byte, por lo que el `--gas 200000` por defecto no siempre es suficiente: las transferencias con firma híbrida en la mainnet han usado entre aproximadamente 160,000 y 240,000 de gas. Establece siempre `--gas` de forma explícita junto con `--fees` (o `--gas-prices`).

---

## La firma híbrida es obligatoria en la vía Cosmos {#hybrid-signing}

`hybrid_signature_mode` es `required` en ambas redes (`qorechaind query pqc hybrid-mode`). Toda transacción de la vía Cosmos debe llevar una firma ML-DSA-87 (Dilithium-5) junto a la firma secp256k1; un simple `tx bank send ... -y` se rechaza. Las únicas excepciones son el registro y la migración de claves PQC (para que una cuenta nueva pueda registrar su primera clave) y `tx slashing unjail` para una cuenta que no tiene ninguna clave PQC registrada.

Por ello, todos los comandos de esta página excepto `pqc register-key`, `pqc register-key-v2` y `pqc migrate-key` se ejecutan en dos pasos: construye la transacción con `--generate-only` y luego fírmala y transmítela con `tx pqc cosign`:

```bash
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

El nombre de clave `mypqc` es una clave creada con `tx pqc gen-key` y registrada en la cuenta (consulta [pqc](#pqc)). Usa para ello el binario oficial de la versión publicada en [download.qore.host](https://download.qore.host): un binario compilado a partir del árbol de código fuente público no puede crear ni aplicar una firma Dilithium (`gen-key` y `cosign` informan de que necesitan la compilación completa). [QoreX](/qorex/overview) y los SDK realizan esta misma firma por ti.

---

## bank

### send

Transfiere tokens de una cuenta a otra.

```bash
qorechaind tx bank send <from_key_or_address> <to_address> <amount> [flags]
```

Ejemplo: `qorechaind tx bank send mykey qor1recipient... 1000000uqor --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > tx.json`, y después `tx pqc cosign` como se muestra arriba. 1 QOR = 1,000,000 uqor.

---

## staking

### create-validator

Crea un validador a partir de un archivo JSON (la forma basada en flags fue eliminada). La mainnet además requiere una licencia `validator_operator` activa y una clave PQC registrada; consulta [Running a Validator](/developer-guide/running-a-validator).

```bash
qorechaind tx staking create-validator validator.json \
  --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi \
  --generate-only > tx.json
```

`validator.json`:

```json
{
  "pubkey": {"@type": "/cosmos.crypto.ed25519.PubKey", "key": "<base64 key from: qorechaind comet show-validator>"},
  "amount": "100000000000uqor",
  "moniker": "my-validator",
  "identity": "",
  "website": "",
  "security": "",
  "details": "",
  "commission-rate": "0.10",
  "commission-max-rate": "0.20",
  "commission-max-change-rate": "0.01",
  "min-self-delegation": "1"
}
```

### edit-validator

Edita la descripción o la comisión de un validador existente.

```bash
qorechaind tx staking edit-validator --new-moniker "new-name" --website "https://example.org" --from mykey [flags]
```

Flags: `--new-moniker`, `--website`, `--identity`, `--security-contact`, `--details`, `--commission-rate`, `--min-self-delegation`. Los campos omitidos se dejan sin cambios.

### delegate

```bash
qorechaind tx staking delegate <validator_address> <amount> [flags]
```

### redelegate

```bash
qorechaind tx staking redelegate <src_validator> <dst_validator> <amount> [flags]
```

### unbond

```bash
qorechaind tx staking unbond <validator_address> <amount> [flags]
```

### cancel-unbond

Cancela una entrada de unbonding en curso.

```bash
qorechaind tx staking cancel-unbond <validator_address> <amount> <creation_height> [flags]
```

---

## slashing

### unjail

Devuelve un validador encarcelado (jailed) al conjunto activo una vez transcurrido el periodo de encarcelamiento.

```bash
qorechaind tx slashing unjail --from mykey [flags]
```

---

## distribution

### withdraw-all-rewards

Retira todas las recompensas de staking pendientes.

```bash
qorechaind tx distribution withdraw-all-rewards [flags]
```

### withdraw-rewards

Retira las recompensas de un validador.

```bash
qorechaind tx distribution withdraw-rewards <validator_address> [flags]
```

| Flag           | Tipo | Descripción                                              |
| -------------- | ---- | -------------------------------------------------------- |
| `--commission` | bool | Retirar también la comisión (direcciones de operador de validador) |

---

## gov

### submit-proposal

Envía una propuesta de gobernanza a partir de un archivo JSON con `messages`, `metadata`, `deposit`, `title`, `summary` y, opcionalmente, `expedited`. Genera un esqueleto con `qorechaind tx gov draft-proposal`.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> [flags]
```

### vote

```bash
qorechaind tx gov vote <proposal_id> <option> [flags]
```

Opciones de voto: `yes`, `no`, `abstain`, `no_with_veto`. Usa `tx gov weighted-vote <proposal_id> yes=0.6,no=0.4` para dividir un voto.

### deposit

```bash
qorechaind tx gov deposit <proposal_id> <amount> [flags]
```

---

## pqc {#pqc}

### gen-key

Genera una clave Dilithium-5 (ML-DSA-87) y la almacena en `<home>/pqc/<name>.dilithium` (modo `0600`, **sin cifrar**). Imprime la clave pública en hex.

```bash
qorechaind tx pqc gen-key <name>
```

### register-key

Registra una clave pública PQC para tu cuenta (comando heredado: el algoritmo es Dilithium-5). Se firma solo con la clave clásica; esta es la excepción de arranque (bootstrap).

```bash
qorechaind tx pqc register-key <pubkey_hex> <key_type> --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`key_type` es `hybrid` (recomendado), `pqc_only` o `classical_only`. La clave pública de 2,592 bytes hace que el registro sea más costoso que una transferencia, por lo que necesita el límite de gas más alto.

### register-key-v2

Registra una clave con selección explícita del algoritmo.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> <key_type> --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`algorithm` es `dilithium5` (o `1`) o `mlkem1024` (o `2`).

### cosign

Firma una transacción sin firmar con la clave PQC y la clave clásica de la cuenta, y después la transmite.

```bash
qorechaind tx pqc cosign <unsigned_tx_file> --from <key> --pqc-key <name> --chain-id <id>
```

| Flag           | Descripción                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------- |
| `--pqc-key`    | Nombre de la clave creada con `gen-key` o `recover-key`                                           |
| `--sign-bytes` | `auto` (por defecto: pregunta a la cadena qué forma de sign-bytes se aplica), `v1` o `v2`         |
| `--generate-only` / `--offline` | Imprime la transacción firmada como JSON en lugar de transmitirla; envíala después con `tx broadcast`; `--offline` también necesita `--account-number`, `--sequence` y `--sign-bytes v1\|v2` |
| `--dry-run`    | Simula e imprime la estimación de gas                                                             |

Ambas redes han aplicado la actualización que trasladó la verificación híbrida a los sign-bytes v2; la forma v1 se rechaza.

### migrate-key

Migra la clave PQC de tu cuenta de un algoritmo a otro. Debe haber una migración activa para tu algoritmo actual (iniciada por gobernanza); ambas claves firman los bytes de la migración.

```bash
qorechaind tx pqc migrate-key <new_algorithm> <old_pubkey_hex> <new_pubkey_hex> <old_sig_hex> <new_sig_hex> [flags]
```

### recover-key

Reconstruye la clave ML-DSA-87 de la cuenta a partir de su mnemónico BIP-39 (leído desde stdin) y la almacena localmente. Usa `SHAKE-256("qorechain:pqc:v1|address|mnemonic")`.

```bash
echo "<mnemonic>" | qorechaind tx pqc recover-key <name> <address> [flags]
```

| Flag           | Tipo   | Descripción                                                                |
| -------------- | ------ | -------------------------------------------------------------------------- |
| `--derivation` | string | `adapter` (canónica, por defecto) o `bridge` (legada `SHAKE-256(mnemonic)`) |

### rotate-key

Rota la clave ML-DSA-87 de la cuenta dentro del mismo algoritmo. Lee el mnemónico desde stdin, firma doblemente con la clave antigua y la nueva, cofirma con la clave antigua y transmite.

```bash
echo "<mnemonic>" | qorechaind tx pqc rotate-key --from mykey --old-derivation bridge --new-derivation adapter \
  --gas 600000 --fees 60000uqor --chain-id qorechain-vladi
```

| Flag               | Tipo   | Descripción                                                                          |
| ------------------ | ------ | ------------------------------------------------------------------------------------ |
| `--old-derivation` | string | Derivación de la clave registrada actualmente: `bridge` (por defecto) o `adapter`    |
| `--new-derivation` | string | Derivación de la nueva clave: `adapter` (por defecto) o `bridge`                     |
| `--new-random`     | bool   | Rotar a una clave aleatoria nueva; requiere `--new-key-out`                          |
| `--new-key-out`    | string | Guardar la nueva clave privada como `<home>/pqc/<name>.dilithium` antes de enviar nada |
| `--sign-bytes`     | string | `auto` (por defecto), `v1` o `v2`                                                    |

### open-evm-window

La vía EVM admite una transacción solo de una cuenta que tenga una clave PQC registrada **y** una ventana de autorización abierta. La ventana se abre con un mensaje de la vía Cosmos, de modo que lleva la firma PQC que una billetera Ethereum no puede aportar. Dentro de la ventana, las transacciones normales de MetaMask funcionan sin cambios.

```bash
qorechaind tx pqc open-evm-window <blocks> <max-txs> <max-value> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > w.json
qorechaind tx pqc cosign w.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

| Argumento   | Límite               | Significado                                                                                   |
| ----------- | -------------------- | --------------------------------------------------------------------------------------------- |
| `blocks`    | 1 a 17,280           | Cuánto tiempo permanece abierta la ventana, contado desde el bloque que la abre               |
| `max-txs`   | 1 a 1,000            | Cuántas transacciones EVM admite                                                              |
| `max-value` | positivo             | Total admitido, contando el valor transferido **y** la comisión máxima que podría pagar cada transacción; `uqor` o `qor`, p. ej. `1000qor` |

Abrir una ventana sustituye a cualquier ventana existente. Compruébala con `qorechaind query pqc evm-window <address>`.

### close-evm-window

Cierra tu ventana de inmediato, por ejemplo cuando sospechas que la clave clásica está comprometida.

```bash
qorechaind tx pqc close-evm-window --from mykey --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > c.json
qorechaind tx pqc cosign c.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

---

## lightnode

```bash
qorechaind tx lightnode register <node_type> <version> [--capabilities <csv>] --from operator \
  --gas 300000 --fees 30000uqor --chain-id qorechain-vladi --generate-only > register.json
qorechaind tx pqc cosign register.json --from operator --pqc-key <name> --chain-id qorechain-vladi
```

`node_type` es `sx` o `ux`. El registro requiere una licencia `lightnode_operator` activa, y el registro para el programa de recompensas de nodos ligeros **todavía no está abierto**. Otros comandos: `tx lightnode heartbeat`, `tx lightnode claim-rewards`, `tx lightnode deregister`. Consulta [Light Node](/light-node/overview).

---

## bridge

El puente no está en producción: en ambas redes todas las cadenas configuradas están en estado `pending` y no hay validadores de puente registrados (`query bridge chains`, `query bridge validators`).

### withdraw

```bash
qorechaind tx bridge withdraw <destination_chain> <destination_address> <asset> <amount> [flags]
```

### deposit

Acredita activos transferidos por el puente desde una cadena de origen. Lleva firmas de validadores (`--validator-sigs`, `--pqc-commitment`); es un mensaje de operador del puente, no la forma en que un usuario final inicia un depósito.

```bash
qorechaind tx bridge deposit <source_chain> <source_tx_hash> <asset> <amount> [flags]
```

### update-chain-config / set-verifier-bootstrap

Administrativos (licencia `bridge_admin` o `qcb_bridge`).

```bash
qorechaind tx bridge update-chain-config <chain_id> [--status active|paused|pending] [--verifier <kind>] [--contract <addr>] [--confirmations <n>] [--architecture <a>] [--lock-event-sig <hex>] [flags]
qorechaind tx bridge set-verifier-bootstrap <kind> <chain_id> [flags]
```

---

## ibc-transfer

```bash
qorechaind tx ibc-transfer transfer transfer <channel> <receiver> <amount> [flags]
```

El primer `transfer` es el subcomando y el segundo es el puerto de origen. En el momento de escribir esto no hay canales IBC abiertos en ninguna de las dos redes (`query ibc channel channels`).

---

## rdk

```bash
qorechaind tx rdk create-rollup <rollup_id> <profile> <stake_amount> [--vm evm|cosmwasm|svm|custom] [flags]
qorechaind tx rdk submit-batch <rollup_id> <batch_index> <state_root_hex> [flags]
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> --proof <hex> [flags]
qorechaind tx rdk pause-rollup <rollup_id> <reason> [flags]
qorechaind tx rdk resume-rollup <rollup_id> [flags]
qorechaind tx rdk stop-rollup <rollup_id> [flags]
qorechaind tx rdk execute-withdrawal <rollup_id> <batch_index> <withdrawal_index> <recipient> <denom> <amount> --proof <hex,hex,...> [flags]
```

`profile` es `defi`, `gaming`, `nft`, `enterprise` o `custom`; `stake_amount` está en uqor (el mínimo actual figura en `query rdk config`). El preajuste del perfil aporta la liquidación, el secuenciador, la DA y el modelo de gas; solo la VM puede sobrescribirse desde la línea de comandos. No existe un comando `finalize-batch`.

---

## multilayer

```bash
qorechaind tx multilayer register-sidechain <layer_id> <description> [--block-time-ms 2000] [--domains defi] [--max-tx 1000] [--min-validators 1] [--settlement-interval 100] [--vm-types evm] [flags]
qorechaind tx multilayer register-paychain <layer_id> <description> [--max-tx 5000] [--settlement-interval 50] [--base-fee-multiplier 0.01] [flags]
qorechaind tx multilayer anchor-state <layer_id> <layer_height> <state_root_hex> <pqc_agg_sig_hex> [flags]
qorechaind tx multilayer route-transaction <payload_hex> [--preferred-layer <id>] [--max-latency-ms 10000] [--max-fee 1000000] [flags]
qorechaind tx multilayer challenge-anchor <layer_id> <anchor_height> <fraud_proof_hex> <reason> [flags]
qorechaind tx multilayer update-layer-status <layer_id> <new_status> <reason> [flags]
```

`new_status` es `proposed`, `active`, `suspended` o `decommissioned`. `update-layer-status` está deshabilitado en la mainnet por el cortacircuitos (consulta más abajo).

---

## Mensajes deshabilitados o no disponibles hoy {#disabled-messages}

Algunos comandos existen en el binario pero no pueden tener éxito en las redes en vivo:

| Comando                                                   | Motivo                                                                                         |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `tx wasm store`, `tx wasm instantiate`, `instantiate2`    | El permiso de carga e instanciación es `Nobody` en ambas redes, y los tipos de mensaje también están en la lista del cortacircuitos |
| `tx crossvm call`                                         | Deshabilitado en la mainnet por el cortacircuitos                                              |
| `tx svm deploy-program`, `execute`, `create-account`      | La vía de transacciones SVM está deshabilitada en toda la red                                  |
| `tx abstractaccount create`, `register-authenticator`, `execute-cosmos`, `execute-evm` | El módulo de cuenta abstracta está desactivado (`query abstractaccount config` muestra `enabled: false`) |
| `tx rlconsensus *`, `tx amm pause-pool`/`resume-pool`      | Mensajes de la autoridad de gobernanza; también están en la lista del cortacircuitos de la mainnet |
| `tx license *`                                            | Solo para la autoridad (las licencias las concede la autoridad de licencias de la red)         |

La lista en vivo es `qorechaind query circuit disabled-list`.
