---
slug: /developer-guide/svm-development
title: Desarrollo SVM
sidebar_label: Desarrollo SVM
sidebar_position: 4
---

# Desarrollo SVM

QoreChain incluye un entorno de ejecución de **máquina virtual de Solana (SVM)**, que permite a los desarrolladores desplegar y ejecutar programas SBF/BPF utilizando las herramientas habituales de Solana. El módulo SVM expone una interfaz JSON-RPC compatible con Solana en el **puerto 8899**, que `qorechaind start` inicia automáticamente (consulta [Servidor JSON-RPC](#json-rpc-server) más abajo).

:::note
Los comandos a continuación usan la red principal **`qorechain-vladi`**, activa desde el 7 de junio de 2026 ejecutando la versión de cadena **v3.1.80**. Sustituye por `--chain-id qorechain-diana` para la red de pruebas.
:::

---

## Descripción general

El módulo `x/svm` proporciona:

* Despliegue y ejecución de programas SBF/BPF
* Creación y gestión de cuentas de datos
* Un endpoint JSON-RPC compatible con Solana
* Mapeo bidireccional de direcciones entre los formatos de dirección de QoreChain y de Solana
* Medición del presupuesto de cómputo y economía de almacenamiento basada en renta

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

Los valores por defecto son `enable = true` y `address = "127.0.0.1:8899"`, por lo que un nodo recién iniciado ya sirve la interfaz JSON-RPC de Solana en el puerto 8899 — `@solana/web3.js` se conecta en `http://127.0.0.1:8899` sin configuración adicional. `getVersion` reporta `1.18.0-qorechain`, y `getBalance` / `getAccountInfo` devuelven cuentas SVM activas en la cadena.

| Propiedad      | Valor                     |
| ------------- | ------------------------- |
| URL por defecto   | `http://127.0.0.1:8899`   |
| Habilitado       | Sí, por defecto           |
| Iniciado por    | `qorechaind start`        |
| Compatibilidad | JSON-RPC de Solana (subconjunto)  |
| `getVersion`  | `1.18.0-qorechain`        |

### Métodos compatibles

| Método                              | Descripción                               |
| ----------------------------------- | ----------------------------------------- |
| `getAccountInfo`                    | Recupera los datos de la cuenta y el saldo en lamports |
| `getBalance`                        | Obtiene el saldo de la cuenta en lamports           |
| `getSlot`                           | Número de slot actual                |
| `getMinimumBalanceForRentExemption` | Saldo mínimo para un tamaño de datos dado     |
| `getVersion`                        | Información de la versión del runtime SVM                  |
| `getHealth`                         | Comprobación de estado del endpoint SVM         |

---

## Despliegue e interacción con programas

:::info
**Ejecución SBF moderna.** El motor de ejecución SVM se ha modernizado sobre **solana-sbpf 0.21.1**, por lo que los programas SBF recién compilados con la cadena de herramientas actual de Solana (**platform-tools v1.53 / agave 4.x**) tanto **se despliegan como se ejecutan** en QoreChain — la ejecución es totalmente compatible, no solo el despliegue. Se admiten los programas compilados con `cargo build-sbf --arch v0` o `--arch v3`.
:::

1. **Desplegar un programa SBF** — Compila tu programa de Solana a un objeto compartido SBF con las platform-tools actuales (v1.53 / agave 4.x), luego despliégalo en QoreChain:

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

   La respuesta de la transacción incluye el **ID del programa** en formato base58.

2. **Ejecutar una instrucción** — Llama a un programa BPF en la cadena con datos de instrucción:

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
   | `data-hex`          | Bytes codificados en hex | Datos de instrucción serializados    |

3. **Crear una cuenta de datos** — Los programas a menudo necesitan cuentas para almacenar estado. Crea una con un tamaño y propietario especificados:

   ```bash
   # Create data account
   qorechaind tx svm create-account <owner-base58> <space> <lamports> \
     --from mykey \
     --gas auto \
     -y
   ```

   | Parámetro      | Descripción                                        |
   | -------------- | -------------------------------------------------- |
   | `owner-base58` | El programa que posee esta cuenta (base58)        |
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

4. **Uso de @solana/web3.js** — El SDK de JavaScript de Solana funciona directamente con el endpoint SVM de QoreChain:

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

QoreChain mantiene un **mapeo bidireccional de direcciones** entre las direcciones nativas Bech32 (`qor1...`) y las direcciones base58 al estilo de Solana:

| Dirección     | Ejemplo                                                    |
| ------------- | ---------------------------------------------------------- |
| Nativa a SVM | `qor1abc...xyz` se mapea a una dirección base58 determinista     |
| SVM a Nativa | Las direcciones de programa base58 se mapean de vuelta a sus equivalentes `qor1...` |

El mapeo es determinista y lo gestiona el módulo `x/svm`. Ambas representaciones se refieren a la misma cuenta subyacente.

---

## Modelo de renta

El módulo SVM usa un **modelo de almacenamiento basado en renta** para prevenir el crecimiento descontrolado del estado:

| Parámetro                  | Valor      |
| -------------------------- | ---------- |
| Lamports por byte por año | `3,480`    |
| Multiplicador de exención de renta  | `2.0`      |
| Frecuencia de cobro       | Cada época |

* Las cuentas con un saldo **superior** a `2 * (data_size * 3480 / seconds_per_year)` en lamports están **exentas de renta** y nunca se les cobra.
* A las cuentas **por debajo** del umbral de exención de renta se les cobra renta en cada época. Si el saldo llega a cero, la cuenta se purga.

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
| Tamaño máximo del programa                         | `10 MB`     |
| Tamaño máximo de datos de cuenta                    | `10 MB`     |

Los programas que superan el presupuesto de cómputo se detienen y la transacción se revierte.

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

## Interoperabilidad entre máquinas virtuales

Los programas SVM pueden comunicarse con contratos EVM y CosmWasm a través de la ruta de mensajes **asíncrona** entre máquinas virtuales:

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

Los mensajes se ponen en cola y los procesa el EndBlocker. Consulta [Interoperabilidad entre máquinas virtuales](/developer-guide/cross-vm-interoperability) para más detalles sobre el ciclo de vida de los mensajes y el comportamiento del tiempo de espera.

---

## Próximos pasos

* [Interoperabilidad entre máquinas virtuales](/developer-guide/cross-vm-interoperability) — Comunicación entre SVM, EVM y CosmWasm
* [Desarrollo EVM](/developer-guide/evm-development) — Contratos inteligentes en Solidity en QoreChain
* [Desarrollo CosmWasm](/developer-guide/cosmwasm-development) — Contratos WebAssembly basados en Rust
