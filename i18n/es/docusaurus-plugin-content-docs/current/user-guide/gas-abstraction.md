---
slug: /user-guide/gas-abstraction
title: Abstracción de gas
sidebar_label: Abstracción de gas
sidebar_position: 7
---

# Abstracción de gas

Esta guía explica la función de abstracción de gas de QoreChain, que permite a los usuarios pagar las comisiones de transacción en tokens no nativos en lugar de QOR.

:::note
Los comandos a continuación usan la testnet **`qorechain-diana`** (EVM chain ID **9800**). La mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) está activa desde el 7 de junio de 2026 ejecutando la versión de cadena **v3.1.77** — sustituye el chain ID y los endpoints de mainnet de la página **Conexión a Mainnet** al transaccionar en mainnet.
:::

---

## Resumen

La abstracción de gas elimina el requisito de tener tokens QOR para pagar las comisiones de transacción. Los usuarios que tengan tokens alternativos aceptados (como USDC o ATOM transferidos vía IBC) pueden usar esos tokens directamente como pago de comisión. El protocolo convierte automáticamente el importe de la comisión a su equivalente nativo antes de procesarla.

---

## Tokens aceptados

Los siguientes tokens se aceptan para el pago de comisiones:

| Token              | Denominación | Tasa de conversión | Comisión de ejemplo          |
| ------------------ | ------------ | --------------- | -------------------- |
| **QOR**            | `uqor`       | 1.0 (nativo)    | `--fees 500uqor`     |
| **USDC** (vía IBC) | `ibc/USDC`   | 1.0             | `--fees 500ibc/USDC` |
| **ATOM** (vía IBC) | `ibc/ATOM`   | 10.0            | `--fees 50ibc/ATOM`  |

:::note
Las tasas de conversión reflejan la relación de cambio definida por el protocolo, no los precios de mercado. Una tasa de 10.0 para ATOM significa que 1 unidad de ibc/ATOM equivale a 10 unidades de uqor a efectos de comisiones.
:::

---

## Cómo funciona

El `GasAbstractionDecorator` de QoreChain está integrado en el pipeline de procesamiento de transacciones. Cuando una transacción incluye comisiones en una denominación no nativa, ocurre lo siguiente:

1. **Inspección de la comisión** — El decorador comprueba la denominación de la comisión especificada en la transacción.
2. **Búsqueda de tasa** — Si la denominación está en la lista de tokens aceptados, el protocolo busca la tasa de conversión correspondiente.
3. **Conversión** — El importe de la comisión se convierte a su equivalente nativo en uqor usando la tasa de conversión.
4. **Procesamiento estándar** — La comisión convertida se pasa al gestor estándar `DeductFee` para deducirla de la cuenta del remitente. La conversión es transparente para el resto del pipeline de transacciones. Todo el procesamiento posterior de comisiones (distribución a los validadores, quema, asignación a la tesorería, recompensas de los stakers y recompensas de los nodos ligeros) opera sobre el equivalente nativo en uqor.

---

## Ejemplos de uso

### Pagar comisiones en USDC

Envía una transferencia de tokens con las comisiones pagadas en USDC:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 500ibc/USDC
```

Dado que USDC tiene una tasa de conversión de 1.0, 500 ibc/USDC equivale a 500 uqor.

### Pagar comisiones en ATOM

Envía una transferencia de tokens con las comisiones pagadas en ATOM:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 50ibc/ATOM
```

Dado que ATOM tiene una tasa de conversión de 10.0, 50 ibc/ATOM equivale a 500 uqor.

---

## Consulta de tokens aceptados

Recupera la lista de tokens actualmente aceptados para la abstracción de gas, junto con sus tasas de conversión:

```bash
qorechaind query gasabstraction accepted-tokens
```

**Salida de ejemplo:**

```yaml
accepted_tokens:
- denom: uqor
  conversion_rate: "1.000000000000000000"
- denom: ibc/USDC
  conversion_rate: "1.000000000000000000"
- denom: ibc/ATOM
  conversion_rate: "10.000000000000000000"
```

---

## Acceso vía JSON-RPC

Para aplicaciones que se integran vía JSON-RPC, consulta la configuración de la abstracción de gas:

```
qor_getGasAbstractionConfig
```

**Solicitud:**

```json
{
  "jsonrpc": "2.0",
  "method": "qor_getGasAbstractionConfig",
  "params": [],
  "id": 1
}
```

**Respuesta:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "accepted_tokens": [
      { "denom": "uqor", "conversion_rate": "1.0" },
      { "denom": "ibc/USDC", "conversion_rate": "1.0" },
      { "denom": "ibc/ATOM", "conversion_rate": "10.0" }
    ]
  }
}
```

---

:::tip

* La abstracción de gas es ideal para usuarios que llegan desde otros ecosistemas y que quizá aún no tengan QOR.
* Las tasas de conversión las establece la gobernanza y pueden actualizarse mediante propuestas de cambio de parámetros.
* Si tienes varios tokens aceptados, cualquiera de ellos puede usarse para comisiones en cualquier tipo de transacción.
* El token real especificado en `--fees` es el que se deduce de tu cuenta. La conversión solo se usa para validar que la comisión cumple el requisito mínimo.

:::
