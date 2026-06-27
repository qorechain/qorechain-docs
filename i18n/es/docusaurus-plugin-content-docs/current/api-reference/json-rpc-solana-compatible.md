---
slug: /api-reference/json-rpc-solana-compatible
title: JSON-RPC — Compatible con Solana
sidebar_label: JSON-RPC — Compatible con Solana
sidebar_position: 4
---

# JSON-RPC — Compatible con Solana

QoreChain proporciona una interfaz JSON-RPC compatible con Solana a través de su entorno de ejecución SVM (Solana Virtual Machine), lo que permite que las herramientas y los SDK existentes de Solana interactúen con QoreChain de forma nativa.

## Conexión

| Transporte | Dirección predeterminada  |
| --------- | ------------------------- |
| HTTP      | `http://127.0.0.1:8899`   |

El servidor JSON-RPC lo **inicia `qorechaind start`** y está **habilitado de forma predeterminada**, escuchando en `127.0.0.1:8899`. Se configura mediante una sección `[svm-rpc]` en `app.toml` (`enable` + `address`). Un nodo recién iniciado ya sirve esta interfaz — no se requiere ningún proceso adicional.

:::note
La interfaz JSON-RPC compatible con Solana se sirve en el puerto **8899** tanto por la red principal **`qorechain-vladi`** (activa en la versión de cadena **v3.1.77**) como por la red de pruebas **`qorechain-diana`**. La dirección local anterior se aplica a un nodo que ejecutes tú mismo; sustituye el endpoint de red principal o de pruebas de tu proveedor para el acceso remoto.
:::

---

## Métodos

| Método                              | Parámetros               | Descripción                                                    |
| ----------------------------------- | ------------------------ | -------------------------------------------------------------- |
| `getAccountInfo`                    | `pubkey` (base58 string) | Devuelve los datos de la cuenta, el propietario, los lamports y el indicador de ejecutable |
| `getBalance`                        | `pubkey` (base58 string) | Devuelve el saldo en lamports de la clave pública dada         |
| `getSlot`                           | ninguno                  | Devuelve el número de slot actual                              |
| `getMinimumBalanceForRentExemption` | `dataLength` (integer)   | Devuelve el saldo mínimo para la exención de renta según el tamaño de los datos |
| `getVersion`                        | ninguno                  | Devuelve la versión del software del nodo                      |
| `getHealth`                         | ninguno                  | Devuelve el estado de salud del nodo (`"ok"` si está sano)     |

---

## Formato de respuesta

Todas las respuestas siguen la especificación JSON-RPC 2.0. Las respuestas que hacen referencia al estado on-chain incluyen un objeto `context` con el `slot` actual:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "context": {
      "slot": 123456
    },
    "value": { ... }
  }
}
```

---

## Ejemplos

### getAccountInfo

**Solicitud:**

```bash
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getAccountInfo",
    "params": [
      "4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T",
      { "encoding": "base64" }
    ],
    "id": 1
  }'
```

**Respuesta:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "context": {
      "slot": 123456
    },
    "value": {
      "data": ["AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=", "base64"],
      "executable": false,
      "lamports": 1000000000,
      "owner": "11111111111111111111111111111111",
      "rentEpoch": 0
    }
  }
}
```

### getBalance

**Solicitud:**

```bash
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getBalance",
    "params": ["4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T"],
    "id": 2
  }'
```

**Respuesta:**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "context": {
      "slot": 123456
    },
    "value": 1000000000
  }
}
```

### getVersion

**Solicitud:**

```bash
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getVersion",
    "params": [],
    "id": 3
  }'
```

**Respuesta:**

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "solana-core": "1.18.0-qorechain",
    "feature-set": 1
  }
}
```

La cadena de versión `1.18.0-qorechain` indica compatibilidad con la interfaz RPC de Solana 1.18.0 ejecutándose en el entorno de ejecución SVM de QoreChain.

---

## Integración con @solana/web3.js

Las aplicaciones existentes de Solana pueden conectarse a QoreChain apuntando el objeto `Connection` al endpoint SVM local:

```javascript
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

const connection = new Connection("http://127.0.0.1:8899", "confirmed");

// Check version
const version = await connection.getVersion();
console.log("Node version:", version["solana-core"]);

// Get balance
const pubkey = new PublicKey("4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T");
const balance = await connection.getBalance(pubkey);
console.log("Balance:", balance / LAMPORTS_PER_SOL);

// Get slot
const slot = await connection.getSlot();
console.log("Current slot:", slot);

// Get account info
const accountInfo = await connection.getAccountInfo(pubkey);
if (accountInfo) {
  console.log("Owner:", accountInfo.owner.toBase58());
  console.log("Executable:", accountInfo.executable);
  console.log("Data length:", accountInfo.data.length);
}
```

---

## Notas

- **Formato de dirección**: las cuentas SVM usan claves públicas codificadas en base58 (formato estándar de Solana), no el prefijo Bech32 `qor1` que usan los módulos nativos del Cosmos SDK.
- **Puenteo entre VM**: para mover activos entre los entornos de ejecución EVM y SVM, usa el módulo Cross-VM (`x/crossvm`). Consulta los [Comandos de transacción](/cli-reference/transaction-commands) para conocer la sintaxis de `crossvm call`.
- **Despliegue de programas**: despliega programas BPF a través de la CLI (`qorechaind tx svm deploy-program`) o programáticamente mediante el entorno de ejecución SVM.
- **Presupuesto de cómputo**: el entorno de ejecución SVM aplica un presupuesto de cómputo de 1.400.000 unidades de cómputo por transacción de forma predeterminada. Esto se puede configurar mediante los parámetros del módulo.
