---
slug: /qorel/monitoring
title: Monitorización de QORel
sidebar_label: Monitorización
sidebar_position: 7
---

# Monitorización

Un relayer que se detiene sin avisar deja paquetes pendientes, así que conviene vigilarlo. Esta página enumera lo que QORel expone (telemetría de Prometheus, un endpoint REST opcional, registros y comandos) y sobre qué configurar alertas. Está dirigida a operadores que ejecutan un relayer para un canal que les importa.

## Innovaciones {#innovations}

- **Una comprobación del estado de la clave poscuántica que puedes automatizar.** `qorel keys pqc-status` imprime un objeto JSON cuyo campo `ready_to_relay` es `true` solo cuando la clave está registrada en la cadena y coincide con la clave local. Una alerta sobre ese campo detecta una clave ausente o modificada antes de que se rechace al relayer.
- **Fallos que no detienen el relé en silencio.** Los workers de paquetes siguen en marcha y reintentan en cada intervalo de despeje tras un intento fallido de relé o de despeje, de modo que un límite de peticiones breve aparece como avisos en el registro y no como un canal bloqueado.
- **Una comprobación previa al envío con motivo.** Cuando la comprobación previa rechaza una transacción (clave no registrada, clave que no coincide, versión de los bytes de firma desconocida), no se envía nada y el motivo se registra y lo muestra `qorel health-check`.

## Cómo se usa {#how-to-use}

### Telemetría {#telemetry}

Actívala en la configuración:

```toml
[telemetry]
enabled = true
host = '127.0.0.1'
port = 3001
```

Las métricas se sirven en formato Prometheus en `http://127.0.0.1:3001/metrics`. Son las métricas de Hermes; Prometheus muestra los contadores con el sufijo `_total`. Las que merece la pena graficar:

| Métrica | Por qué |
|---|---|
| `workers` | Número de workers en ejecución por tipo; una caída significa que un worker se ha detenido. |
| `backlog_size`, `backlog_oldest_sequence` | Paquetes en espera en un canal y la secuencia más antigua que sigue esperando. |
| `wallet_balance` | El saldo del relayer en cada cadena. |
| `receive_packets_confirmed`, `acknowledgment_packets_confirmed`, `timeout_packets_confirmed` | Paquetes retransmitidos. Una línea plana mientras crece el backlog indica un bloqueo. |
| `client_updates_submitted`, `client_misbehaviours_submitted` | Mantenimiento del cliente ligero e informes de comportamiento indebido. |
| `broadcast_errors`, `simulate_errors` | Transacciones rechazadas o que fallaron al simular. |
| `ws_reconnect` | Reconexiones de WebSocket; muchas seguidas apuntan a un endpoint inestable. |
| `tx_latency_submitted`, `tx_latency_confirmed` | Cuánto tardan las transacciones. |

Hermes documenta el conjunto completo en su [guía de telemetría](https://hermes.informal.systems/documentation/telemetry/operators.html). El listener está en `127.0.0.1` en la configuración de ejemplo; coloca tu recolector de Prometheus en el mismo host o cambia `host` deliberadamente.

### Sobre qué configurar alertas {#alerts}

| Qué | Dónde |
|---|---|
| Proceso activo | El endpoint de telemetría responde |
| Paquetes y confirmaciones pendientes en tus canales | `qorel query packet pending --chain <id> --port transfer --channel <channel>` |
| Saldo del relayer en cada cadena | `qorel keys balance --chain <id>`, o `wallet_balance` |
| Clave poscuántica lista | `qorel keys pqc-status` informa `ready_to_relay: true` |
| Frescura del cliente | QORel actualiza un cliente a un tercio de su periodo de confianza; configura una alerta si un cliente no se ha actualizado durante aproximadamente la mitad de ese periodo |
| Errores | `broadcast_errors` y `simulate_errors` en aumento |

Una pequeña comprobación del estado de la clave, adecuada para cron o un agente de monitorización:

```bash
qorel --json keys pqc-status --chain qorechain-diana | jq -e '.result.ready_to_relay == true'
```

Termina con un código distinto de cero cuando la clave no está lista.

### Registros {#logs}

`log_level = 'info'` en `[global]` es el valor por defecto. Con el paquete de systemd, los registros van al journal:

```bash
journalctl -u qorel -f
```

Aparece una línea de registro que empieza por `post-quantum sign bytes` cuando QORel lee de la cadena la versión de los bytes de firma y esta cambia. Los avisos sobre respuestas `429` de un endpoint significan que el endpoint aplica un límite de peticiones; QORel reintenta.

### Endpoint REST {#rest}

El servidor REST opcional (`[rest]` en la configuración, puerto 3000 en el ejemplo, desactivado por defecto) expone el estado del relayer para inspeccionarlo. Déjalo enlazado a `127.0.0.1`.

### Comprobaciones manuales {#by-hand}

```bash
qorel health-check
qorel keys pqc-status --chain qorechain-diana
qorel query packet pending --chain qorechain-diana --port transfer --channel channel-0
curl -s https://api-testnet.qore.host/ibc/core/channel/v1/channels
```

## Cómo acceder {#how-to-access}

- La telemetría y REST son locales al host del relayer; ambos quedan fuera de la red pública salvo que los expongas.
- Los comandos `qorel` leen el mismo archivo de configuración que el relayer.
- El endpoint REST público de la testnet de QoreChain (`https://api-testnet.qore.host`) muestra el estado de canales y de las trazas de tokens; consulta [Conectarse a la testnet](/getting-started/connecting-to-testnet).

## Dónde se publica {#where-published}

La monitorización forma parte del binario `qorel`; no hay nada aparte que instalar. Código fuente y guía de telemetría de Hermes: [qorechain/QORel](https://github.com/qorechain/QORel), [hermes.informal.systems](https://hermes.informal.systems).

## Límites y problemas conocidos {#limits}

- **Sin panel alojado.** QORel no incluye paneles ni reglas de alerta; constrúyelos a partir de las métricas anteriores.
- **Los nombres de las métricas son los de Hermes.** QORel no añade métricas poscuánticas en 0.1.0; usa `keys pqc-status` para ese estado.
- **Los límites de peticiones son normales en endpoints públicos.** Configura alertas sobre un backlog sostenido, no sobre avisos `429` aislados.
- **Solo testnet.** Nada de esto se ha ejecutado contra un canal de mainnet.
