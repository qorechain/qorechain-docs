---
slug: /developer-guide/svm-development
title: Desarrollo con SVM
sidebar_label: Desarrollo con SVM
sidebar_position: 4
---

# Desarrollo con SVM

QoreChain incluye un entorno de ejecución **Solana Virtual Machine (SVM)** que permite a los desarrolladores desplegar y ejecutar programas SBF/BPF usando las herramientas habituales de Solana. El módulo SVM expone una interfaz JSON-RPC compatible con Solana en el **puerto 8899**, que `qorechaind start` inicia automáticamente (véase [Servidor JSON-RPC](#json-rpc-server) más abajo).

:::note
Los comandos siguientes usan la mainnet **`qorechain-vladi`** (activa desde el 7 de junio de 2026), que ejecuta la versión de nodo **v3.2.8** desde el 18 de noviembre de 2026 (propuesta de gobernanza 17, altura 4,273,000; v3.2.7 desde el 12 de noviembre de 2026; v3.2.6 desde el 4 de noviembre de 2026; v3.2.5 desde el 29 de octubre de 2026, v3.2.4 desde el 23 de octubre de 2026). Sustituya `--chain-id qorechain-diana` para la testnet, que ejecuta v3.2.9 (desde el 20 de noviembre de 2026; v3.2.8 desde el 12 de noviembre, v3.2.4 desde el 19 de octubre de 2026). **Las transacciones SVM están abiertas en la testnet** (propuesta de gobernanza 37) y **desactivadas en la mainnet**, por lo que los comandos `tx svm` de esta página solo pueden tener éxito en la testnet; para el recorrido completo en la testnet consulta [SVM en la testnet (v3.2.9)](/developer-guide/svm-testnet-v329).
:::

---

:::note Estado del carril SVM (comprobado el 22 de noviembre de 2026)
En la testnet **`qorechain-diana`** el carril SVM está **abierto** desde la propuesta de gobernanza 37 (12 de noviembre de 2026), y la versión v3.2.9 añade transacciones Solana en formato nativo y ventanas SVM: consulta [SVM en la testnet](/developer-guide/svm-testnet-v329). En la mainnet **`qorechain-vladi`** el carril está **desactivado**: cualquier transacción `x/svm` allí devuelve `code 11, "SVM module is disabled"`. Lee `GET /qorechain/svm/v1/params` y comprueba `enabled` antes de construir.
:::

## Visión general

El módulo `x/svm` proporciona:

* **QOR nativo como activo SVM de primera clase** — el balance unificado de la cuenta, visible en lamports
* Despliegue y ejecución de programas SBF/BPF
* Creación y gestión de cuentas de datos
* Un endpoint JSON-RPC compatible con Solana
* Mapeo bidireccional de direcciones entre los formatos de QoreChain y de Solana
* Medición de presupuesto de cómputo y economía de almacenamiento basada en rent

---

## QOR nativo en la interfaz SVM {#native-qor}

Desde la versión de cadena **v3.1.82**, la interfaz SVM es una **interfaz de QOR nativo de primera clase**, no un balance de sandbox separado. El único balance unificado de la cuenta — los mismos fondos visibles como `uqor` en la interfaz Cosmos y como wei de 18 decimales en la EVM — aparece en el lado SVM en **lamports** (9 decimales):

```
1 uqor = 1,000 lamports    ·    1 QOR = 1,000,000,000 lamports
```

* **`getBalance` / `getAccountInfo`** devuelven el QOR nativo de la cuenta (en lamports).
* **`getSignaturesForAddress`** devuelve el historial de transacciones que afectan a una dirección — útil para la detección de depósitos con las herramientas estándar de Solana.
* **Las transferencias del System Program mueven QOR nativo** — una instrucción de transferencia al estilo Solana mueve los mismos fondos que movería un `MsgSend` de Cosmos o una transferencia EVM.
* **Formato de dirección SVM** — la dirección SVM de una cuenta son sus 20 bytes de cuenta rellenados a la derecha hasta 32 bytes y codificados en base58. Las tres formas de dirección (`qor1...`, `0x...`, base58) se refieren a la misma cuenta.

**Versión v3.2.8 (testnet desde el 12 de noviembre de 2026, mainnet desde el 18 de noviembre de 2026).** La actualización cierra el carril SVM en `qorechain-diana`: las escrituras SVM fallan, `MsgRegisterSVMPQCKey` se rechaza y el JSON-RPC de SVM rechaza los métodos de escritura en los chain ids públicos, hasta que una votación de gobernanza lo reabra (la testnet tiene un interruptor gobernado). En mainnet el carril sigue desactivado (leído el 19 de noviembre de 2026: `enabled` `false`). Los clientes deben leer el estado del carril en los parámetros del módulo SVM (`enabled`) antes de ofrecer acciones SVM.

Los endpoints públicos (`https://svm.qore.host`, `https://svm-testnet.qore.host`) sirven lecturas. El 22 de noviembre de 2026 el gateway público de la testnet no retransmitía `sendTransaction` (respondía que no hay clave de relayer configurada), así que para enviar transacciones SVM en la testnet envías tú mismo la transacción portadora o ejecutas tu propio nodo (puerto 8899). Consulte [SVM en la testnet](/developer-guide/svm-testnet-v329#relay). En la mainnet el carril está desactivado.

---

## Servidor JSON-RPC {#json-rpc-server}

El servidor JSON-RPC compatible con Solana es **iniciado por `qorechaind start`** y está **habilitado por defecto**. Se configura mediante una sección `[svm-rpc]` en `app.toml`:

```toml
[svm-rpc]
# Enable the Solana-compatible JSON-RPC server
enable = true
# Address the server listens on
address = "127.0.0.1:8899"
```

Los valores por defecto son `enable = true` y `address = "127.0.0.1:8899"`, de modo que un nodo recién iniciado ya sirve la interfaz JSON-RPC de Solana en el puerto 8899 — `@solana/web3.js` se conecta en `http://127.0.0.1:8899` sin configuración adicional. `getVersion` informa `1.18.0-qorechain`, y `getBalance` / `getAccountInfo` devuelven cuentas SVM en cadena en tiempo real.

| Propiedad      | Valor                     |
| -------------- | ------------------------- |
| URL por defecto | `http://127.0.0.1:8899`  |
| Habilitado     | Sí, por defecto            |
| Iniciado por   | `qorechaind start`        |
| Compatibilidad | JSON-RPC de Solana (subconjunto) |
| `getVersion`   | `1.18.0-qorechain`        |

### Métodos compatibles

| Método                               | Descripción                                |
| ------------------------------------ | ------------------------------------------ |
| `getAccountInfo`                     | Recupera los datos y el balance en lamports de una cuenta |
| `getBalance`                         | Obtiene el balance de la cuenta en lamports (QOR nativo) |
| `getSignaturesForAddress`            | Historial de transacciones de una dirección |
| `getSlot`                            | Número de slot actual                      |
| `getMinimumBalanceForRentExemption`  | Balance mínimo para un tamaño de datos dado |
| `getVersion`                         | Información de versión del runtime SVM     |
| `getHealth`                          | Comprobación de salud del endpoint SVM     |
| `getGenesisHash`                    | Hash génesis del clúster (desde v3.2.7: testnet desde el 6 de noviembre de 2026, mainnet desde el 12 de noviembre de 2026; base58) |

**Identidad del clúster (v3.2.7).** Las wallets que siguen el Wallet Standard necesitan una identidad de clúster estable. Desde la versión v3.2.7 (testnet desde el 6 de noviembre de 2026, mainnet desde el 12 de noviembre de 2026) el nodo sirve el hash génesis del clúster y su ID de cadena de Wallet Standard. En la testnet, el 7 de noviembre de 2026, `GET /qorechain/svm/v1/cluster_info` respondió con `chain_id` `qorechain-diana`, un `genesis_hash`, un `caip2_chain_id` (`solana:` seguido de los primeros 32 caracteres del hash génesis) y `execution_enabled` `false`, y `getGenesisHash` en `https://svm-testnet.qore.host` devolvió el mismo hash génesis. El hash se deriva del ID de cadena, no de un clúster real de Solana. **La ejecución SVM sigue desactivada en ambas redes**; esto solo identifica el clúster. El 12 de noviembre de 2026 la misma ruta en la mainnet respondió `200` con `chain_id` `qorechain-vladi`, su propio hash génesis y `execution_enabled` `false`.

---

## Despliegue e interacción con programas

:::info
**Ejecución SBF moderna.** El motor de ejecución SVM se ha modernizado sobre **solana-sbpf 0.21.1**, de modo que los programas SBF recién compilados con la cadena de herramientas actual de Solana (**platform-tools v1.53 / agave 4.x**) se **despliegan y ejecutan** en QoreChain — la ejecución es totalmente compatible, no solo el despliegue. Los programas construidos con `cargo build-sbf --arch v0` o `--arch v3` son compatibles.
:::

1. **Desplegar un programa SBF** — Compile su programa de Solana a un objeto compartido SBF con las platform-tools actuales (v1.53 / agave 4.x), y luego despliéguelo en QoreChain:

   ```bash
   # Build with the current Solana toolchain (--arch v0 or --arch v3)
   cargo build-sbf --arch v3

   # Deploy the compiled program
   qorechaind tx svm deploy-program ./my_program.so \
     --from mykey \
     --gas 2000000 --fees 200000uqor \
     --generate-only > tx.json
   ```

   En una red donde el carril esté habilitado, cada comando `tx svm` es una transacción del carril Cosmos: firme y difunda `tx.json` con `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>`, y establezca un límite de gas explícito con una comisión de al menos gas × 0,1 uqor. La respuesta de la transacción incluye el **ID del programa** en formato base58.

2. **Ejecutar una instrucción** — Llame a un programa BPF en cadena con datos de instrucción:

   ```bash
   # Execute instruction
   qorechaind tx svm execute <program-id-base58> <data-hex> \
     --from mykey \
     --gas 400000 --fees 40000uqor \
     --generate-only > tx.json
   ```

   | Parámetro            | Formato            | Descripción                     |
   | -------------------- | ------------------- | -------------------------------- |
   | `program-id-base58`  | Cadena base58        | La dirección del programa desplegado |
   | `data-hex`           | Bytes codificados en hex | Datos de instrucción serializados |

3. **Crear una cuenta de datos** — Los programas suelen necesitar cuentas donde almacenar estado. Cree una con un tamaño y un propietario especificados:

   ```bash
   # Create data account
   qorechaind tx svm create-account <owner-base58> <space> <lamports> \
     --from mykey \
     --gas 400000 --fees 40000uqor \
     --generate-only > tx.json
   ```

   | Parámetro       | Descripción                                                  |
   | ---------------- | ------------------------------------------------------------ |
   | `owner-base58`   | El programa propietario de esta cuenta (base58)               |
   | `space`          | Tamaño del campo de datos en bytes                             |
   | `lamports`       | Balance inicial (debe alcanzar el mínimo de exención de rent) |

   Consulte el balance mínimo exento de rent para un tamaño dado:

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

4. **Usando @solana/web3.js** — El SDK de JavaScript de Solana funciona directamente con el endpoint SVM de QoreChain:

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

QoreChain mantiene un **mapeo bidireccional de direcciones** entre las direcciones Bech32 nativas (`qor1...`) y las direcciones base58 al estilo Solana:

| Dirección           | Ejemplo                                                     |
| -------------------- | ------------------------------------------------------------ |
| Nativa a SVM          | `qor1abc...xyz` se mapea a una dirección base58 determinista |
| SVM a nativa          | Las direcciones de programa base58 se mapean de vuelta a los equivalentes `qor1...` |

El mapeo es determinista y lo gestiona el módulo `x/svm`. Ambas representaciones se refieren a la misma cuenta subyacente.

---

## Modelo de rent

El módulo SVM usa un **modelo de almacenamiento basado en rent** para evitar el hinchamiento del estado:

| Parámetro                        | Valor       |
| ---------------------------------- | ----------- |
| Lamports por byte por año          | `3,480`     |
| Multiplicador de exención de rent  | `2.0`       |
| Frecuencia de cobro                | Cada época  |

* Las cuentas con un balance **por encima** de `2 * (data_size * 3480 / seconds_per_year)` en lamports están **exentas de rent** y nunca se les cobra.
* A las cuentas **por debajo** del umbral de exención de rent se les cobra rent en cada época. Si el balance llega a cero, la cuenta se purga.

:::info
**Buena práctica:** financie siempre las cuentas de datos por encima del mínimo de exención de rent para evitar la eliminación inesperada de la cuenta.
:::

---

## Presupuesto de cómputo

Cada ejecución de instrucción se mide en unidades de cómputo:

| Parámetro                                        | Valor        |
| -------------------------------------------------- | ------------ |
| Máximo de unidades de cómputo por instrucción      | `1,400,000`  |
| Profundidad máxima de CPI (invocación entre programas) | `4`      |
| Tamaño máximo de programa                          | `10 MB`      |
| Tamaño máximo de datos de cuenta                   | `10 MB`      |

Los programas que superan el presupuesto de cómputo se detienen y la transacción se revierte.

---

## Resumen de parámetros

| Parámetro                    | Valor        |
| ------------------------------ | ------------ |
| `max_program_size`             | 10 MB        |
| `max_account_data_size`        | 10 MB        |
| `compute_budget_max`           | 1,400,000 CU |
| `max_cpi_depth`                | 4            |
| `lamports_per_byte_year`       | 3,480        |
| `rent_exemption_multiplier`    | 2.0          |
| Puerto JSON-RPC                | 8899         |

---

## Interoperabilidad entre VMs

Los programas SVM están diseñados para comunicarse con contratos EVM y QoreChain Native a través del mensaje `MsgCrossVMCall` del módulo `x/crossvm` (la cadena determina por sí misma el carril de origen). Las llamadas cross-VM están en pausa en la mainnet y el carril SVM está desactivado allí, así que no hay ruta cross-VM para SVM en la mainnet. En la testnet el carril SVM está abierto y las reglas de v3.2.9 figuran en [SVM en la testnet](/developer-guide/svm-testnet-v329). Véase [Interoperabilidad entre VMs](/developer-guide/cross-vm-interoperability) para conocer el estado actual, el ciclo de vida del mensaje y el comportamiento de tiempo de espera.

---

## Próximos pasos

* [Interoperabilidad entre VMs](/developer-guide/cross-vm-interoperability) — Comunicación entre SVM, EVM y QoreChain Native
* [Desarrollo con EVM](/developer-guide/evm-development) — Contratos inteligentes en Solidity en QoreChain
* [Desarrollo con QoreChain Native](/developer-guide/cosmwasm-development) — Contratos de WebAssembly basados en Rust
