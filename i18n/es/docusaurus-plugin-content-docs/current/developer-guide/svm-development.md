---
slug: /developer-guide/svm-development
title: Desarrollo SVM
sidebar_label: Desarrollo SVM
sidebar_position: 4
---

# Desarrollo SVM

QoreChain incluye un entorno de ejecución **Solana Virtual Machine (SVM)**, que permite a los desarrolladores desplegar y ejecutar programas SBF/BPF usando las herramientas habituales de Solana. El módulo SVM expone una interfaz JSON-RPC compatible con Solana en el **puerto 8899**, que `qorechaind start` inicia automáticamente (consulta [Servidor JSON-RPC](#json-rpc-server) más abajo).

:::note
Los comandos que siguen usan la mainnet **`qorechain-vladi`**, activa desde el 7 de junio de 2026 y ejecutando la versión de cadena **v3.1.82**. Sustituye `--chain-id qorechain-diana` para la testnet.
:::

---

## Descripción general

El módulo `x/svm` proporciona:

* **QOR nativo como activo de primera clase en la SVM** — el saldo unificado de la cuenta, visible en lamports
* Despliegue y ejecución de programas SBF/BPF
* Creación y gestión de cuentas de datos
* Un endpoint JSON-RPC compatible con Solana
* Mapeo bidireccional de direcciones entre los formatos de dirección de QoreChain y de Solana
* Medición de presupuesto de cómputo y economía de almacenamiento basada en renta

---

## QOR nativo en la interfaz SVM {#native-qor}

Desde la versión de cadena **v3.1.82**, la interfaz SVM es una **interfaz de QOR nativo de primera clase**, no un saldo aislado independiente. El único saldo unificado de la cuenta — los mismos fondos visibles como `uqor` en la interfaz Cosmos y como wei de 18 decimales en la EVM — aparece en el lado SVM en **lamports** (9 decimales):

```
1 uqor = 1,000 lamports    ·    1 QOR = 1,000,000,000 lamports
```

* **`getBalance` / `getAccountInfo`** devuelven el QOR nativo de la cuenta (en lamports).
* **`getSignaturesForAddress`** devuelve el historial de transacciones que afectan a una dirección — utilizable para la detección de depósitos con las herramientas estándar de Solana.
* **Las transferencias del System Program mueven QOR nativo** — una instrucción de transferencia al estilo de Solana mueve los mismos fondos que movería un `MsgSend` de Cosmos o una transferencia EVM.
* **Forma de dirección SVM** — la dirección SVM de una cuenta son sus 20 bytes de cuenta rellenados por la derecha hasta 32 bytes y codificados en base58. Las tres formas de dirección (`qor1...`, `0x...`, base58) se refieren a la misma cuenta.

Los endpoints públicos (`https://svm.qore.host`, `https://svm-testnet.qore.host`) son **de solo lectura** — el envío de transacciones está deshabilitado en el borde. Ejecuta tu propio nodo (puerto 8899) para enviar transacciones SVM.

---

## Servidor JSON-RPC {#json-rpc-server}

El servidor JSON-RPC compatible con Solana lo **inicia `qorechaind start`** y está **habilitado por defecto**. Se configura mediante una sección `[svm-rpc]` en `app.toml`:

```toml
[svm-rpc]
# Enable the Solana-compatible JSON-RPC server
enable = true
# Address the server listens on
address = "127.0.0.1:8899"
```

Los valores por defecto son `enable = true` y `address = "127.0.0.1:8899"`, así que un nodo recién iniciado ya sirve la interfaz JSON-RPC de Solana en el puerto 8899 — `@solana/web3.js` se conecta en `http://127.0.0.1:8899` sin configuración adicional. `getVersion` reporta `1.18.0-qorechain`, y `getBalance` / `getAccountInfo` devuelven cuentas SVM reales en cadena.

| Propiedad      | Valor                     |
| ------------- | ------------------------- |
| URL por defecto   | `http://127.0.0.1:8899`   |
| Habilitado       | Sí, por defecto           |
| Iniciado por    | `qorechaind start`        |
| Compatibilidad | JSON-RPC de Solana (subconjunto)  |
| `getVersion`  | `1.18.0-qorechain`        |

### Métodos soportados

| Método                              | Descripción                               |
| ----------------------------------- | ----------------------------------------- |
| `getAccountInfo`                    | Obtener los datos de la cuenta y el saldo en lamports |
| `getBalance`                        | Obtener el saldo de la cuenta en lamports (QOR nativo) |
| `getSignaturesForAddress`           | Historial de transacciones de una dirección        |
| `getSlot`                           | Número de slot actual                       |
| `getMinimumBalanceForRentExemption` | Saldo mínimo para un tamaño de datos dado     |
| `getVersion`                        | Información de versión del runtime SVM                  |
| `getHealth`                         | Comprobación de salud del endpoint SVM         |

---

## Despliegue e interacción con programas

:::info
**Ejecución SBF moderna.** El motor de ejecución SVM se ha modernizado sobre **solana-sbpf 0.21.1**, de modo que los programas SBF recién compilados con la cadena de herramientas actual de Solana (**platform-tools v1.53 / agave 4.x**) se **despliegan y ejecutan** en QoreChain — la ejecución está totalmente soportada, no es solo despliegue. Se admiten programas compilados tanto con `cargo build-sbf --arch v0` como con `--arch v3`.
:::

1. **Desplegar un programa SBF** — Compila tu programa de Solana a un objeto compartido SBF con las platform-tools actuales (v1.53 / agave 4.x) y luego despliégalo en QoreChain:

   ```bash
   # Build with the current Solana toolchain (--arch v0 or --arch v3)
   cargo build-sbf --arch v3

   # Deploy the compiled program
   qorechaind tx svm deploy-program ./my_program.so \
     --from mykey \
     --gas auto \
     --gas-adjustment 1.3 \
     -y
   ```

   La respuesta de la transacción incluye el **program ID** en formato base58.

2. **Ejecutar una instrucción** — Llama a un programa BPF en cadena con datos de instrucción:

   ```bash
   # Execute instruction
   qorechaind tx svm execute <program-id-base58> <data-hex> \
     --from mykey \
     --gas auto \
     -y
   ```

   | Parámetro           | Formato            | Descripción                    |
   | ------------------- | ----------------- | ------------------------------ |
   | `program-id-base58` | Cadena base58     | La dirección del programa desplegado |
   | `data-hex`          | Bytes codificados en hexadecimal | Datos de instrucción serializados    |

3. **Crear una cuenta de datos** — Los programas suelen necesitar cuentas para almacenar estado. Crea una con un tamaño y un propietario especificados:

   ```bash
   # Create data account
   qorechaind tx svm create-account <owner-base58> <space> <lamports> \
     --from mykey \
     --gas auto \
     -y
   ```

   | Parámetro      | Descripción                                        |
   | -------------- | -------------------------------------------------- |
   | `owner-base58` | El programa propietario de esta cuenta (base58)        |
   | `space`        | Tamaño del campo de datos en bytes                    |
   | `lamports`     | Saldo inicial (debe cumplir el mínimo de exención de renta) |

   Consulta el saldo mínimo exento de renta para un tamaño dado:

   ```bash
   # RPC: getMinimumBalanceForRentExemption
   curl -X POST http://localhost:8899 \
     -H "Content-Type: application/json" \
     -d '{
       "jsonrpc": "2.0",
       "id": 1,
       "method": "getMinimumBalanceForRentExemption",
       "params": [1024]
     }'
   ```

4. **Usar @solana/web3.js** — El SDK de JavaScript de Solana funciona directamente con el endpoint SVM de QoreChain:

   ```javascript
   import { Connection, PublicKey } from "@solana/web3.js";

   const connection = new Connection("http://127.0.0.1:8899");

   // Check health
   const health = await connection.getHealth();
   console.log("SVM health:", health);

   // Get slot
   const slot = await connection.getSlot();
   console.log("Current slot:", slot);

   // Get account info
   const pubkey = new PublicKey("YourBase58ProgramId...");
   const accountInfo = await connection.getAccountInfo(pubkey);
   console.log("Account data:", accountInfo);

   // Get balance
   const balance = await connection.getBalance(pubkey);
   console.log("Balance (lamports):", balance);
   ```

---

## Mapeo de direcciones

QoreChain mantiene un **mapeo bidireccional de direcciones** entre las direcciones Bech32 nativas (`qor1...`) y las direcciones base58 al estilo de Solana:

| Sentido     | Ejemplo                                                    |
| ------------- | ---------------------------------------------------------- |
| Nativa a SVM | `qor1abc...xyz` se mapea a una dirección base58 determinista     |
| SVM a nativa | Las direcciones base58 de programas se mapean de vuelta a sus equivalentes `qor1...` |

El mapeo es determinista y lo gestiona el módulo `x/svm`. Ambas representaciones se refieren a la misma cuenta subyacente.

---

## Modelo de renta

El módulo SVM usa un **modelo de almacenamiento basado en renta** para evitar la hinchazón del estado:

| Parámetro                  | Valor      |
| -------------------------- | ---------- |
| Lamports por byte por año | `3,480`    |
| Multiplicador de exención de renta  | `2.0`      |
| Frecuencia de cobro       | Cada epoch |

* Las cuentas con un saldo **por encima** de `2 * (data_size * 3480 / seconds_per_year)` en lamports están **exentas de renta** y nunca se les cobra.
* A las cuentas **por debajo** del umbral de exención de renta se les cobra renta en cada epoch. Si el saldo llega a cero, la cuenta se purga.

:::info
**Buena práctica:** Financia siempre las cuentas de datos por encima del mínimo de exención de renta para evitar la eliminación inesperada de la cuenta.
:::

---

## Presupuesto de cómputo

Cada ejecución de instrucción se mide con unidades de cómputo:

| Parámetro                                | Valor       |
| ---------------------------------------- | ----------- |
| Máximo de unidades de cómputo por instrucción        | `1,400,000` |
| Profundidad máxima de CPI (invocación entre programas) | `4`         |
| Tamaño máximo de programa                         | `10 MB`     |
| Tamaño máximo de datos de cuenta                    | `10 MB`     |

Los programas que exceden el presupuesto de cómputo se detienen y la transacción se revierte.

---

## Resumen de parámetros

| Parámetro                   | Valor        |
| --------------------------- | ------------ |
| `max_program_size`          | 10 MB        |
| `max_account_data_size`     | 10 MB        |
| `compute_budget_max`        | 1,400,000 CU |
| `max_cpi_depth`             | 4            |
| `lamports_per_byte_year`    | 3,480        |
| `rent_exemption_multiplier` | 2.0          |
| Puerto JSON-RPC               | 8899         |

---

## Interoperabilidad entre VMs

Los programas SVM pueden comunicarse con contratos EVM y CosmWasm a través de la ruta de mensajes entre VMs **asíncrona**:

```bash
# Cross-VM call example
qorechaind tx crossvm call \
  --source-vm svm \
  --target-vm evm \
  --target-contract 0x1234...abcd \
  --payload '...' \
  --from mykey \
  -y
```

Los mensajes se encolan y los procesa el EndBlocker. Consulta [Interoperabilidad entre VMs](/developer-guide/cross-vm-interoperability) para más detalles sobre el ciclo de vida de los mensajes y el comportamiento de los timeouts.

---

## Próximos pasos

* [Interoperabilidad entre VMs](/developer-guide/cross-vm-interoperability) — Comunicación entre SVM, EVM y CosmWasm
* [Desarrollo EVM](/developer-guide/evm-development) — Contratos inteligentes en Solidity sobre QoreChain
* [Desarrollo CosmWasm](/developer-guide/cosmwasm-development) — Contratos WebAssembly basados en Rust
