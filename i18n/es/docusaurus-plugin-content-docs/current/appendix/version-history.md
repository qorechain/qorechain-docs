---
slug: /appendix/version-history
title: Historial de versiones
sidebar_label: Historial de versiones
sidebar_position: 3
---

# Historial de versiones

Historial de versiones público de QoreChain. La mainnet **`qorechain-vladi`** (chain ID EVM **9801**, activa desde el 7 de junio de 2026) ejecuta **v3.2.5** (aplicada mediante la propuesta de gobernanza 14 en la altura 3,906,833 el 29 de octubre de 2026; la versión anterior, v3.2.4, se aplicó en la altura 3,742,566 el 23 de octubre de 2026 y v3.2.3 en la altura 3,662,051 el 20 de octubre de 2026). La testnet **`qorechain-diana`** (chain ID EVM **9800**) ejecuta **v3.2.6** (aplicada en la altura 8,970,638 el 27 de octubre de 2026); v3.2.4 llegó a ella en la altura 8,337,253 (19 de octubre de 2026) y v3.2.5 en la altura 8,890,800 (26 de octubre de 2026).

:::note
Las entradas siguientes son resúmenes de capacidades de alto nivel. Las entradas anteriores `v1.x` se conservan como registro histórico de la línea de versiones de testnet que precedió a la mainnet. El manifiesto de la versión ([Conexión a mainnet](/getting-started/connecting-to-mainnet)) se publica por separado del etiquetado y puede ir con retraso respecto a un tag durante algún tiempo — consúltelo directamente para saber qué descarga realmente una instalación nueva.
:::

## Cronología de gobernanza de mainnet {#governance-timeline}

Propuestas que modificaron la mainnet en ejecución desde el 14 de octubre de 2026. Las ocho son propuestas aceleradas (período de votación de un día) y las ocho se aprobaron con todo el stake bonded que votó a favor. La lista completa está en `GET /cosmos/gov/v1/proposals` en `https://api.qore.host`.

| Propuesta | Qué hace | Votación | Resultado |
| --- | --- | --- | --- |
| 7 | Aplica v3.2.2 en la altura 3,556,788 | 14–15 de octubre de 2026 (termina a las 21:24 UTC) | Aprobada; aplicada el 16 de octubre de 2026 |
| 8 | Libera la reserva de nodos ligeros (3,156,983.796395 QOR) a la fundación | 18–19 de octubre de 2026 (termina a las 19:15 UTC) | Aprobada |
| 9 | Libera la parte de los stakers atascada (6,693,045.921330 QOR) a la fundación | 18–19 de octubre de 2026 (termina a las 19:15 UTC) | Aprobada |
| 10 | Emisión: fija la emisión fija en 86,000 QOR por época y el tope acumulativo en 590,000,000 QOR (la duración de la época no cambia; la primera época de 86,000 QOR comienza en el bloque 3,672,000) | 18–19 de octubre de 2026 (termina a las 19:15 UTC) | Aprobada |
| 11 | Aplica v3.2.3 en la altura 3,662,051 | 18–19 de octubre de 2026 (termina a las 19:15 UTC) | Aprobada; aplicada el 20 de octubre de 2026 |
| 12 | Libera la parte corregida de los stakers atascada (3,807,496.785528 QOR, recalculada en la altura de v3.2.3) a la fundación | 20 de octubre de 2026 20:01 UTC a 21 de octubre de 2026 20:01 UTC | Aprobada |
| 13 | Actualización coordinada a v3.2.4 en la altura 3,742,566: staking con bloqueo temporal opcional, límite de recompensa de nodos ligeros contado desde el registro, un indicador de posesión para las claves post-cuánticas, prueba de posesión para los validadores de puente, la ventana de desafío del RDK en tiempo de bloque y endurecimiento local del nodo | 20 de octubre de 2026 21:18 UTC a 21 de octubre de 2026 21:18 UTC | Aprobada; aplicada el 23 de octubre de 2026 en la altura 3,742,566 |
| 14 | Actualización coordinada a v3.2.5 (build 2) en la altura 3,906,833 (los nodos permanecieron en v3.2.4 hasta esa altura, se detuvieron allí y se reiniciaron con v3.2.5; la firma de transacciones no cambia). El contenido se detalla en [v3.2.5](#v325) | 27 de octubre de 2026 00:29 UTC a 28 de octubre de 2026 00:29 UTC | Aprobada; aplicada el 29 de octubre de 2026 en la altura 3,906,833 |

Consulte [Tokenomics](/architecture/tokenomics#stranded-and-reserve) para saber qué significan las liberaciones y [Gobernanza](/user-guide/governance) para saber cómo votar.

---

## Versión de testnet v3.2.6 (hasta ahora solo testnet) {#testnet-v326}

La testnet `qorechain-diana` recibe cada versión unos días antes que mainnet. Nada de lo que contiene esta sección cambia mainnet: ejecuta v3.2.5 hasta que una actualización de gobernanza indique otra cosa. Todo lo de v3.2.5 ya está activo en ambas redes (consulte [v3.2.5](#v325) más abajo).

### v3.2.6 — Rutas de consulta, valores PRISM en vivo y tokens de prueba (testnet)

**Enfoque de la versión:** Aplicada en la testnet mediante la propuesta de gobernanza 28 de testnet en la altura **8,970,638** (27 de octubre de 2026, 16:58 UTC). El manifiesto de la testnet establece `version` y `minCompatible` en 3.2.6 con `upgradeHeight` 8970638, por lo que un nodo que se une a la testnet necesita v3.2.6. El formato de firma, las direcciones, los decimales, los memos y las comisiones no cambian.

* **Nuevas rutas de lectura en testnet.** `GET /qorechain/pqc/v1/params`, la ruta de cliente IBC v2 `/ibc/core/client/v2/counterparty_info/{client_id}` y el conjunto completo de consultas de PRISM (`x/rlconsensus`) bajo `/qorechain/rlconsensus/v1/` (`agent`, `params`, `observation`, `reward`, `policy`, `applied_params`, `last_action`). Mainnet responde 501 (no implementado) en las rutas de PRISM, de parámetros PQC y de cliente IBC v2. Las rutas del AMM bajo `/qorechain/amm/v1/` (`pools`, `quote/exact_in`, `pools/{id}/lp/{address}`) responden en ambas redes. Consulte la [referencia REST / gRPC](/api-reference/rest-grpc-endpoints).
* **Agente PRISM.** El agente de la testnet está en modo sombra (establecido por la propuesta de gobernanza 29 de testnet): observa cada 10 bloques, calcula una recompensa y una acción propuesta, y las registra sin cambiar ningún valor. Se corrigió el interruptor de seguridad del agente y su historial está acotado. Consulte [PRISM](/architecture/prism-consensus-engine).
* **Valores PRISM en vivo en la EVM.** El precompilado `rlConsensusParams` ahora devuelve los valores aplicados del módulo en lugar de números fijos.
* **Rechazo anticipado de la anulación de delegación de stake bloqueado.** El mempool rechaza una anulación de delegación o una redelegación de stake bloqueado antes de que cueste una comisión; una simulación de transacción también devuelve el código de error tipado.
* **RDK.** Las consultas de lotes incorporan un campo `withdrawals_bound`.
* **Límite de tasa IBC (solo testnet).** Un limitador de tasa por canal para las transferencias IBC: las cuotas son un porcentaje entero del suministro por ventana de horas. **La gobernanza fija los límites; nada es automático y hoy no hay ningún límite fijado** (un conjunto vacío significa sin límite). Un paquete reenviado se cobra en ambos canales, y un reembolso devuelve la cuota.
* **Reenvío de paquetes IBC (solo testnet).** Una transferencia IBC v1 entrante puede llevar un memo `forward` (receptor, puerto, canal) que la envía a otro canal, con reembolso al remitente si falla un salto. No hay reintentos y el tiempo de espera predeterminado por salto es de 10 minutos; un token que se convierte en un ERC-20 al llegar no puede reenviarse.
* **Clientes ligeros 08-wasm (solo testnet).** Se añaden los mensajes de cliente ligero 08-wasm (almacenar, migrar y eliminar un binario de cliente), solo para la autoridad. Los tipos de cliente permitidos siguen conteniendo únicamente el cliente estándar, por lo que no se puede crear ningún cliente ligero wasm hasta que la gobernanza añada `08-wasm`.
* **Tokens de prueba de la fest.** Tres contratos ERC-20 desplegados para la fest de constructores fueron registrados por la gobernanza de testnet (propuesta 26) como denominaciones de bank: fUSD (6 decimales), fETH (18) y fBTC (8). Son tokens de prueba exclusivos de testnet y sin valor. Consulte [Faucet](/dashboard/faucet#fest-tokens).

---

## v3.2.5: registro nativo de claves, cross-VM y contratos gobernados, desafíos abiertos del RDK (mainnet) {#v325}

**Enfoque de la versión:** La versión actual de mainnet. La propuesta de gobernanza 14 la aplicó en mainnet en la altura **3,906,833** el 29 de octubre de 2026 (hacia las 16:04 UTC): los nodos permanecieron en v3.2.4 hasta ese bloque, se detuvieron allí y se reiniciaron con v3.2.5, y la firma de transacciones no cambia. La testnet `qorechain-diana` la recibió primero, mediante la propuesta de gobernanza 15 de testnet en la altura 8,890,800 (26 de octubre de 2026); desde entonces la testnet ha avanzado a v3.2.6. El manifiesto de mainnet establece `minCompatible` en 3.2.5, por lo que un nodo que se une a mainnet necesita v3.2.5. La actualización activa sus funciones de protocolo en la altura de la actualización (83 están activadas en mainnet, listadas en `GET /qorechain/pqc/v1/protocol_features`). **Esta actualización no activa ningún precompilado de EVM**: cada uno necesita su propia votación de gobernanza, y la lista de precompilados estáticos activos en mainnet sigue vacía.

* **Registro nativo de claves ML-KEM.** Una cuenta puede registrar en la cadena una clave de cifrado post-cuántica (ML-KEM) para que otros la consulten por dirección.
* **Cuentas abstractas bajo gobernanza.** La gobernanza controla la configuración de las cuentas abstractas, y las reglas de gasto se comprueban con más rigor: se rechaza una regla que no limita nada, y una entrada de límite vacía o toda en cero ya no elimina los límites reales. Las cuentas inteligentes siguen desactivadas en mainnet (`enabled` es `false`).
* **Llamadas cross-VM bajo gobernanza.** La lista de contratos permitidos a los que el puente cross-VM puede llamar la gestiona la gobernanza y se sirve en `GET /qorechain/crossvm/v1/params` (antes de v3.2.5 mainnet respondía 501). La llamada cross-VM tiene un formato de respuesta canónico (`abi.encode(bytes)`, con `Error(string)` en caso de rechazo), se ejecuta de forma atómica con una ejecución acotada, y las entradas finalizadas se podan. La lista de permitidos está vacía, el precompilado cross-VM `0x...0901` no está activo y `MsgCrossVMCall` sigue desactivado por el circuit breaker, así que todavía nada puede llamar entre VMs en mainnet.
* **Despliegue gobernado de CosmWasm.** La subida de contratos sigue siendo solo por gobernanza; la instanciación de código aprobado es la vía prevista. En mainnet, la instanciación sigue desactivada por el circuit breaker y el permiso de instanciación por defecto sigue siendo `Nobody`.
* **Liquidación del RDK.** Los lotes de rollup se liquidan en orden, cualquier cuenta puede resolver un desafío (la cadena comprueba por sí misma la prueba de fraude), los retiros quedan ligados a las pruebas de fraude, y los parámetros del RDK son gobernables y se sirven en `GET /qorechain/rdk/v1/params`. Consulte [comportamiento de la cadena v3.2.5 para los rollups](/rollups/overview#v325). Todavía no se ha creado ningún rollup en mainnet.
* **Las propuestas aceleradas conservan sus votos.** Una propuesta acelerada que no supera su recuento breve y se convierte en propuesta regular conserva los votos ya emitidos.
* **Reglas de los precompilados de EVM.** Las llamadas a precompilados se acotan mediante la ventana de autorización de EVM, y el circuit breaker se les aplica.
* **La verificación post-cuántica se cobra una vez por firmante**, y **gas de simulación exacto**: el gas que informa la simulación de una transacción ahora coincide con el que la transacción usa.
* **Endurecimiento** a partir de dos auditorías de seguridad, que abarcan el carril compatible con Solana (SVM), cross-VM, los rollups y la fijación de comisiones: las comisiones pagadas en otros tokens se valoran a partir del tipo correcto de pool, la quema de una transacción fallida usa la comisión convertida, y los despliegues, la ejecución y el cómputo de SVM están acotados.

## v3.2.4 — Ventana de registro de nodos ligeros y staking con bloqueo temporal opcional

**Enfoque de la versión:** La versión de mainnet del 23 al 29 de octubre de 2026. Se ejecutó primero en la testnet `qorechain-diana`: la propuesta de gobernanza 13 de testnet la aplicó en la altura **8,337,253** (19 de octubre de 2026). En mainnet, la propuesta de gobernanza 13 la aplicó en la altura **3,742,566** el 23 de octubre de 2026: los nodos permanecieron en v3.2.3 hasta ese bloque, se detuvieron allí y se reiniciaron con v3.2.4, y la firma de transacciones no cambia. Cada función siguiente está activa en mainnet y en la testnet.

* **Ventana de registro de nodos ligeros.** El límite de recompensa de un nodo ligero comienza en el más tardío entre la liquidación anterior y el propio registro del nodo, de modo que un registro nuevo no cobra un monto acumulado de antes de incorporarse.
* **Staking con bloqueo temporal opcional (`x/stakingtier`, un módulo nuevo).** Un delegador puede bloquear parte de una delegación durante 3, 6 o 12 meses; la parte bloqueada no puede deshacer su delegación ni redelegarse, y se permite un desbloqueo anticipado con una penalización que se quema. El bloqueo mínimo es de 10 QOR. Consulte [Staking y delegación](/user-guide/staking-and-delegation#time-locked-staking).
* **Nuevo modo de emisión.** `x/inflation` incorpora un tercer modo de emisión, `target_apy`, con un parámetro `target_apy_bps` (`0` en ambas redes; el modo vigente en mainnet sigue siendo `fixed`). Cambiar el modo de emisión de una red es una decisión de gobernanza independiente; el modo vigente se muestra en `/qorechain/inflation/v1/params`.
* **Flag `possession_proven`** en los registros de cuentas post-cuánticas; la prueba de posesión de las claves de cuenta sigue siendo opcional.
* **Prueba de posesión del validador de puente.** Registrar un validador de puente requiere una prueba de posesión y una clave que ningún otro validador de puente utilice.
* **Ventana de disputa del RDK en tiempo de bloque.** La ventana de disputa optimista se cuenta en tiempo de bloque en lugar de en un número de bloques derivado de este.
* **Endurecimiento local del nodo** (límites de las solicitudes JSON-RPC, presupuesto de chunks de state-sync, verificaciones previas del registro de claves) y nuevas consultas (`protocol_features`, `auth_nonce` y los campos adicionales del pool de recompensas de nodos ligeros, como `monthly_cap_active`).

## v3.2.3 — Segundo lote de seguridad de octubre

**Enfoque de la versión:** El segundo lote de endurecimiento de octubre, aplicado en mainnet mediante la propuesta de gobernanza 11 en la altura **3,662,051** (20 de octubre de 2026, 16:01 UTC); aplicado antes en la testnet en la altura 8,003,746 (15 de octubre). La actualización activa 52 funciones del protocolo en esa altura; el formato de firma, las direcciones, los decimales, los memos y las comisiones no cambian.

* **Integridad de las claves post-cuánticas.** Las claves débiles, degeneradas y ya utilizadas se rechazan en el registro; se refuerza el mantenimiento de claves híbridas; los mensajes de gestión de claves post-cuánticas ya no pueden ejecutarse mediante authz; una cuenta no puede eliminar su último algoritmo de firma. El registro (`MsgRegisterPQCKeyV2`, `tx pqc register-key-v2 ... --pqc-key <name>`) acepta una **prueba de posesión opcional**, que se verifica cuando está presente.
* **Ventanas EVM con alcance limitado.** `MsgOpenEVMWindow` admite los campos opcionales `native_only` (solo transferencias simples de QOR nativo) y `allowed_targets` (hasta 16 destinatarios) que acotan una ventana. Consulte [Ventana de autorización EVM](/getting-started/first-transaction#evm-window).
* **Libro de depósito en garantía de rollups** para el RDK, una **cola atómica cross-VM** con endurecimiento de precompiles y **autorización canónica de stake**.
* **Creación de vesting solo para uno mismo.** La creación de cuentas de vesting solo puede financiar la propia cuenta del creador (los tres mensajes de vesting también siguen desactivados mediante el cortacircuitos).
* **Correcciones de economía.** El año de emisión se deriva de la duración de la época; el trabajo del AMM al final del bloque está acotado; los registros de quema se podan; la parte de los stakers atascada registrada se recalculó en la altura de la actualización, de 0 a 3,807,496.79 QOR (consulte [Tokenomics](/architecture/tokenomics#stranded-and-reserve)).
* **Límite mensual de nodos ligeros.** El límite de recompensa por nodo ahora se expresa por mes: 2,000 QOR por nodo cada 30 días, prorrateado por tiempo de bloque y uptime.
* **Autoridad de licencias gobernable.** Un nuevo `MsgUpdateAuthority` permite que la gobernanza sustituya a la autoridad que concede licencias.
* **Las compilaciones públicas rechazan las redes públicas.** Un binario compilado a partir del árbol de código fuente público se detiene si se apunta a una red en vivo.
* **Nuevas rutas de lectura.** Los parámetros de `x/inflation` y el registro de época se sirven por REST en mainnet (`/qorechain/inflation/v1/params`, `/epoch_info`).

## v3.2.2 — Actualización de dependencias y primer lote de seguridad de octubre (mainnet)

**Enfoque de la versión:** Una actualización coordinada aplicada en mainnet mediante la propuesta de gobernanza 7 en la altura **3,556,788** (16 de octubre de 2026, 17:59 UTC); aplicada en la testnet en la altura 6,905,034 (2 de octubre). El formato de firma no cambia.

* **Dependencias.** Cosmos SDK v0.53.8, motor de consenso v0.38.26 e ibc-go v10.7.
* **26 funciones del protocolo** se activan en la altura de actualización, entre ellas: la delegación EIP-7702 requiere un consentimiento post-cuántico (`MsgAuthorizeEVMDelegation`, que se anula con `MsgClearEVMDelegation` o `MsgCloseEVMWindow`); los límites de multisig se aplican en la ejecución de bloques; la admisión de validadores se comprueba en cada ruta; verificaciones de integridad del AMM; las cuentas de módulo no pueden reclamarse a través de la EVM; se rechazan las transacciones anteriores a EIP-155; el registro de claves post-cuánticas valida la clave clásica; el mensaje de anclaje del RDK y multilayer pasa a una segunda forma (v2); y se aplica el canal de quema de transacciones fallidas.

## v3.2.1 — Endurecimiento de nodos

**Enfoque de la versión:** Una versión de seguridad local del nodo para la mainnet (14 de octubre de 2026): **sin altura de actualización, sin cambio de consenso y sin voto de gobernanza**. Los nodos con v3.2.0 siguen la cadena.

* Endurece los límites de recursos de la API pública, acota el JSON-RPC de EVM y el mempool, y propaga por gossip las transacciones EVM promovidas.
* Fija el chain ID de EVM en la configuración del nodo y lo contrasta con el chain ID de Cosmos; los operadores deben establecer `evm-chain-id = 9801` en `app.toml` (un valor distinto se registra como error).
* Actualiza la dependencia del motor de consenso; mantenga el reloj del sistema sincronizado por NTP (un desfase de más de 60 segundos detiene el nodo).
* Recomendada para todos los operadores; `minCompatible` en el manifiesto de mainnet era 3.2.0 en ese momento.

v3.2.1 se aplicó nodo por nodo y no tiene altura de actualización; fue reemplazada en mainnet por v3.2.2 (16 de octubre), v3.2.3 (20 de octubre), v3.2.4 (23 de octubre) y v3.2.5 (29 de octubre).

## v3.2.0 — Ventana de autorización EVM y correcciones de contabilidad

**Enfoque de la versión:** Hacer que el requisito post-cuántico sea cierto en todos los carriles y cerrar dos brechas de contabilidad. Aplicada en mainnet mediante la propuesta de gobernanza #6 en la altura **2,981,742** (25 de septiembre de 2026, 12:07 UTC); aplicada en testnet en la altura 5,920,000.

* **Ventana de autorización EVM (cambio incompatible para wallets EVM).** Una transacción EVM ahora solo se admite desde una cuenta que tenga una clave ML-DSA-87 registrada **y** una ventana abierta. La ventana se abre con un mensaje del carril Cosmos (`MsgOpenEVMWindow`, con una firma híbrida ML-DSA-87 (FIPS 204)) y está acotada por bloques (≤ 17,280), transacciones (≤ 1,000) y valor total (valor transferido más la comisión máxima de cada transacción); `MsgCloseEVMWindow` la revoca. La firma estándar de Ethereum no cambia dentro de una ventana. El carril EVM, que estaba desactivado en mainnet mediante el cortacircuitos desde el 16 de septiembre, se reabrió en el mismo bloque en que entró en vigor la regla. Consulte [Ventana de autorización EVM](/getting-started/first-transaction#evm-window).
* **Firma híbrida v2.** Las firmas post-cuánticas ahora se hacen sobre bytes de firma etiquetados por dominio y vinculados a la cadena; la primera forma se rechaza desde la altura de actualización. Los clientes consultan los planes de actualización aplicados del nodo para elegir la forma; la CLI (`--sign-bytes auto`), el SDK 0.8.x y wallet-adapter 0.2.x lo hacen. Los payloads de migración de claves y de atestación del puente pasaron al mismo esquema. Consulte [Seguridad post-cuántica](/architecture/post-quantum-security#sign-bytes-v2).
* **Parte de los stakers pagada.** La parte del 10 % de los stakers en el reparto de comisiones se estaba depositando donde no respaldaba ningún derecho; desde esta actualización se paga como una recompensa de staking normal. El monto ya acumulado (6,693,045.92 QOR en mainnet) está registrado en cadena (`GET /qorechain/burn/v1/stranded_rewards`) y solo podía moverse mediante un voto de gobernanza (`MsgReleaseStrandedRewards`); la gobernanza lo liberó en octubre de 2026 (consulte la [cronología de gobernanza](#governance-timeline) y [Tokenomics](/architecture/tokenomics#stranded-and-reserve)).
* **Reserva de recompensas de nodos ligeros.** La parte del 3 % de nodos ligeros que se acumuló mientras ningún nodo era elegible (3,156,009.33 QOR en mainnet) se registra como una reserva (`GET /qorechain/lightnode/v1/reward_pool`), se excluye de la distribución y solo puede moverse mediante gobernanza (liberada en octubre de 2026); a partir de entonces la distribución paga únicamente lo acumulado desde la ejecución anterior, con un límite por nodo. El registro de nodos ligeros seguía cerrado en esta versión y desde entonces se ha abierto (consulte [Nodo ligero](/light-node/overview#reward-program-status)).
* **El límite de transacciones por remitente** ahora se aplica (600 transacciones por cada 30 bloques por remitente, para que los relayers puedan operar).
* **El mapa de versiones de módulos de la actualización** ahora lista todos los módulos (48), corrigiendo una brecha que habría afectado a migraciones posteriores.
* Además: se endurecieron la cuenta de módulo del puente y los payloads de atestación, se validan los bloques propuestos, la liquidación de rollups se restringe al sequencer del rollup con depósito en garantía por rollup y una quema de creación efectiva, el stake del creador multilayer se bloquea al registrarse y se devuelve al dar de baja, el flag `enabled` de la cuenta inteligente se aplica en todas las rutas, y las rutas de admisión de validadores y de creación de vesting se cerraron al anidamiento de authz.

## v3.1.96 + v3.1.97 — Bloqueo de acceso de QoreChain Native

**Enfoque de la versión:** Cerrar la subida e instanciación de código de contratos sin permiso, tras un aviso de seguridad a nivel de toda la industria para CosmWasm, el runtime sobre el que está construido QoreChain Native.

* **La subida e instanciación de contratos ahora requieren permiso explícito.** `code_upload_access` e `instantiate_default_permission` se establecen en `Nobody` tanto en mainnet como en testnet — verificado en producción, independientemente de cuál de estos dos tags esté ejecutando un nodo dado, ya que es un parámetro en cadena y no algo que solo apliquen los binarios más recientes. Consulte [Desarrollo con QoreChain Native](/developer-guide/cosmwasm-development) para saber qué significa esto si está construyendo un contrato. Los contratos ya instanciados no se ven afectados — `execute` y `query` funcionan como antes. En ambas redes, además, los tres mensajes de QoreChain Native de subida e instanciación están desactivados mediante el cortacircuitos.
* **Compilaciones de versión con posición independiente (PIE)**, siguiendo la misma guía de endurecimiento del aviso, de modo que la dirección de memoria que un exploit necesitaría adivinar se aleatoriza por proceso. Los binarios enlazados dinámicamente solo necesitaron un flag de compilación; verificado que no rompe el estado.

## v3.1.95 — Endurecimiento de Cosmos EVM

**Enfoque de la versión:** Actualización de seguridad progresiva de la biblioteca de contabilidad de saldos EVM.

* **Endurecimiento frente a overflow** — Una ruta de actualización de saldo EVM ahora falla de forma segura en lugar de desbordarse silenciosamente ante una condición extrema de overflow. Se entrega como una actualización progresiva que no rompe el consenso — no se requirió voto de gobernanza ni altura de detención coordinada.

## v3.1.94 — Tope de emisión y endurecimiento de mensajes administrativos

**Enfoque de la versión:** Alinear la emisión de recompensas de staking con las condiciones reales de la red, y reforzar las verificaciones de autorización en mensajes administrativos privilegiados.

* **Tope de emisión** — Una propuesta de gobernanza, aprobada con el pleno respaldo del stake bonded y aplicada en la altura 2,122,074 (26 de agosto de 2026), sustituyó el calendario de emisión decreciente original por un monto fijo por época bajo un tope acumulativo estricto. El calendario original había sido calibrado para una red mucho más madura y totalmente bonded; frente al stake bonded real, estaba pagando mucho más rápido de lo previsto. El monto por época y el tope fueron elevados por la propuesta de gobernanza 10 el 19 de octubre de 2026. Consulte [Tokenomics](/architecture/tokenomics#staking-reward-schedule) para conocer las cifras actuales.
* **Endurecimiento de mensajes administrativos** — Un conjunto de mensajes administrativos privilegiados, protegidos por autoridad, ahora verifican a su firmante contra la propia dirección del módulo de gobernanza en lugar de confiar en un valor transportado en el propio mensaje.
* También incorpora la corrección de fiabilidad de incorporación de nodos de la v3.1.92, para cualquier nodo que actualice directamente a esta versión.

## v3.1.92 — Fiabilidad de sincronización de nodos

**Enfoque de la versión:** Incorporación de nodos más fiable a partir de snapshots y del archivo de cadena publicado.

* **Corrección de sincronización de snapshots y archivo** — Se resolvió un problema por el cual un nodo que se restauraba a partir de un snapshot de state-sync o del archivo de cadena publicado podía no completar la sincronización más allá de ciertos bloques históricos. La incorporación por cualquiera de las dos vías ahora se completa de forma fiable.

## v3.1.90 — Contabilización del uptime de nodos ligeros

**Enfoque de la versión:** El uptime medido para la elegibilidad de recompensas de nodos ligeros ahora se acumula de forma consistente a lo largo del tiempo.

* **Acumulación progresiva del uptime** — El uptime de elegibilidad para recompensas de un nodo ligero ahora se calcula acumulando de forma progresiva su recuento esperado de heartbeats desde su propio registro, según el intervalo de heartbeat vigente en cada momento, en lugar de recalcular todo su historial bajo el intervalo actualmente vigente. Por lo tanto, un cambio de gobernanza en el intervalo de heartbeat afecta el uptime únicamente hacia adelante, y nunca vuelve a calificar retroactivamente el desempeño pasado de un nodo.

## v3.1.86 — Salvaguarda de recuperación de validadores

**Enfoque de la versión:** Un validador ya no puede quedar bloqueado permanentemente para recuperarse de una cárcel por inactividad.

* **Corrección del bloqueo de cárcel** — Una cuenta de operador de validador sin clave post-cuántica registrada ahora siempre puede enviar `MsgUnjail` para recuperarse de una cárcel por inactividad, incluso cuando la aplicación de firmas híbridas está establecida como requerida con el respaldo clásico desactivado. Anteriormente, dicha cuenta no tenía ninguna vía de recuperación, ya que salir de la cárcel requería enviar una transacción que tenía bloqueada.
* **Snapshots de state-sync** — La generación de snapshots está habilitada en toda la red, lo que permite a los nuevos validadores y nodos completos incorporarse rápidamente mediante state sync en lugar de una reproducción histórica completa.

## v3.1.85 — Gasto delegado mediante wallets vinculadas

**Enfoque de la versión:** Una clave de wallet externa vinculada (Phantom, MetaMask) ahora puede **gastar** desde la única cuenta canónica post-cuántica — bajo permisos de mínimo privilegio, límites de gasto y revocación instantánea.

* **Carriles de ejecución para autenticadores** — Dos nuevos mensajes permiten que un autenticador registrado autorice transferencias desde la cuenta canónica sin que el propietario de la cuenta esté presente: **`MsgExecuteEVM`** (una llamada/transferencia EVM desde la dirección `0x…` de la cuenta) y **`MsgExecuteCosmos`** (un envío bancario por el carril Native). Un **relayer** envía y paga el sobre de la transacción — su propia firma híbrida PQC satisface los requisitos de la transacción — mientras que la firma del autenticador sobre bytes de firma con separación de dominio y protección contra repetición constituye la autorización. La clave externa nunca necesita una cofirma ML-DSA.
* **MetaMask como autenticador** — Los autenticadores secp256k1 ahora pueden registrarse mediante su **dirección Ethereum de 20 bytes** y verificarse vía **EIP-191 `personal_sign`** (además de la forma de clave comprimida de 33 bytes), de modo que una cuenta MetaMask estándar puede vincularse y gastar bajo límites.
* **Aplicación en los tres carriles** — Los alcances de permisos y los límites de valor de **SpendingRule** (por transacción + topes diarios) se aplican en los carriles Native, EVM y SVM; los mensajes de gestión de claves nunca son delegables. Códigos de error distintos permiten a las wallets mostrar el mensaje correcto: `5` límite de gasto excedido, `6` autenticador expirado, `10` permiso denegado, `11` repetición rechazada.
* **Consulta del esquema de permisos** — `GET /qorechain/abstractaccount/v1/permission_schema` (también gRPC/CLI) devuelve la taxonomía canónica de permisos (11 permisos), el mapa mensaje→permiso y la lista de mensajes no delegables, de modo que las wallets validan los alcances sin codificarlos de forma fija.
* **Rotación de claves PQC dentro del mismo algoritmo** — El nuevo **`MsgRotatePQCKey`** rota la clave ML-DSA-87 de una cuenta dentro del mismo algoritmo (con firma dual de la clave antigua y la nueva), lo que permite migrar claves derivadas con el método heredado a la derivación canónica vinculada a la dirección y retirar una clave comprometida. Nuevos comandos CLI: `tx pqc rotate-key` y `tx pqc recover-key` (recuperación determinista de claves a partir de un mnemónico).
* **Las transacciones con clave raíz no se ven afectadas** — Los cambios son aditivos; los flujos normales de wallets y exchanges no cambian. Los operadores de nodos deben estar en **v3.1.85** antes de la altura de actualización de la red.
* **Estado actual** — Las funciones de cuenta inteligente y de wallet vinculada están implementadas, pero **desactivadas en mainnet** (`abstractaccount.enabled = false`) y activadas en la testnet (comprobado el 27 de octubre de 2026); en mainnet, desde v3.2.0 se rechaza toda ruta de autenticador mientras el flag esté desactivado. Compruebe `GET /qorechain/abstractaccount/v1/config` antes de ofrecer un flujo de vinculación.

## v3.1.84 — Permisos de autenticadores y límites de gasto

**Enfoque de la versión:** El modelo de permisos detrás del gasto delegado.

* **Taxonomía canónica de permisos** — Once permisos (`all`, `send`, `delegate`, `withdraw`, `vote`, `evm`, `wasm`, `svm`, `amm`, `ibc`, `deploy`) con un mapa mensaje→permiso que falla en cerrado: un tipo de mensaje que no está mapeado se deniega, y los mensajes de gestión de claves nunca pueden delegarse.
* **Aplicación de SpendingRule** — Se aplican y registran topes de gasto por transacción y por día (UTC) con listas de denominaciones permitidas por cada par (cuenta, autenticador).
* **Autorización en el carril SVM** — Las acciones autorizadas por una clave de esquema foráneo (p. ej., ed25519 de Phantom) en el carril SVM pasan por la misma puerta central de autorización.

## v3.1.83 — Firma con cuenta unificada en las tres interfaces

**Enfoque de la versión:** Una clave, una cuenta — una única identidad unificada que ahora puede **firmar**, no solo mantener un saldo, en las interfaces Cosmos, EVM y SVM.

* **Una clave firma en cada carril** — Una cuenta creada como eth-native (dirección = keccak de su clave pública secp256k1) ahora firma transacciones del carril Cosmos con el esquema `eth_secp256k1`, además de las transacciones EVM. Sus formas `qor1…` (Cosmos), `0x…` (EVM) y Solana-VM (base58) son una única identidad de 20 bytes que tanto **mantiene un solo saldo** como **gasta en los tres carriles** — incluidas las transacciones Cosmos híbridas post-cuánticas (ML-DSA-87).
* **La firma post-cuántica no cambia** — La cuenta unificada sigue registrando su clave ML-DSA-87 y lleva la firma híbrida FIPS-204 que la cadena exige; la parte clásica es `eth_secp256k1` (keccak) en lugar del esquema coinType-118. Las cuentas coinType-118 existentes no se ven afectadas.
* **Actualización progresiva neutral para el consenso** — Entregada como una actualización binaria progresiva en ambas redes, **sin re-génesis y sin detención de la cadena**. Los saldos de las cuentas, el historial y el génesis no cambian.
* **Herramientas de cliente** — `@qorechain/wallet-adapter` 0.1.5 añade la firma Cosmos eth-native (`signClassicalEth` / `signHybridEth`), la generación unificada de 3 direcciones y `walletFromSeed` (derivar la cuenta canónica a partir de cualquier semilla de 32 bytes — p. ej., una firma de Phantom); `@qorechain/chain-bridge` incorpora una ruta de firma `eth_secp256k1`.

:::caution Operadores de nodos — actualización obligatoria
Los nodos completos deben ejecutar **v3.1.83+**. Un nodo anterior a 3.1.83 no puede decodificar una transacción eth-native (`eth_secp256k1`) y dejará de sincronizar en cuanto una aparezca en un bloque. Descargue el paquete actual desde [download.qore.host](https://download.qore.host).
:::

## v3.1.82 — QOR nativo en SVM en producción + habilitación para integradores

**Enfoque de la versión:** La unificación de QOR nativo en SVM en funcionamiento en ambas redes, además de todo lo que un exchange o integrador necesita para conectarse.

* **Saldo unificado de QOR nativo activo en las tres interfaces** — La unificación SVM (v3.1.81) está confirmada en producción en mainnet y testnet: la misma cuenta mantiene un único saldo visible como `uqor` (6 decimales) en Cosmos, 18 decimales al estilo wei en la EVM y lamports (9 decimales; 1 uqor = 1,000 lamports) en la interfaz compatible con Solana.
* **Endpoints públicos verificados** — Endpoints HTTPS públicos para RPC de consenso, REST, JSON-RPC de EVM y JSON-RPC de SVM en ambas redes, además del [explorador de bloques](https://explore.qore.network) público. Consulte [Redes](/appendix/networks).
* **Descargas** — Paquetes versionados de binarios de nodo, el génesis de mainnet y snapshots recientes de los datos de la cadena (con sumas de verificación SHA-256) publicados en [download.qore.host](https://download.qore.host).
* **Firma post-cuántica determinista en toda la pila de cliente** — `@qorechain/pqc` 0.1.1 firma ML-DSA-87 de forma determinista (FIPS-204 §3.4) en los seis bindings de lenguaje, en correspondencia con lo que la cadena acepta; `@qorechain/wallet-adapter` 0.1.2 se apoya en él para la firma de transacciones híbridas.
* **Guía para integradores** — Nueva [Guía para exchanges e integradores](/developer-guide/exchange-integration) que cubre depósitos, retiros y operación de nodos a través de las tres interfaces.

## v3.1.81 — Unificación de QOR nativo en SVM

**Enfoque de la versión:** QOR nativo como activo de primera clase en la interfaz compatible con Solana.

* **QOR nativo en SVM** — El entorno de ejecución SVM ahora expone directamente el saldo de QOR nativo de la cuenta (en lamports), en lugar de llevar un saldo separado exclusivo de SVM. `getBalance` y `getSignaturesForAddress` funcionan contra los fondos nativos, y las transferencias del System Program mueven QOR nativo.
* **Mapeo de direcciones SVM** — La dirección SVM de una cuenta se deriva de sus 20 bytes de cuenta (rellenados a la derecha hasta 32 bytes y codificados en base58), de modo que las direcciones Cosmos, EVM y SVM de una misma clave se refieren a los mismos fondos.

## v3.1.80 — Consultas de anclajes de estado multicapa

**Enfoque de la versión:** Anclajes de liquidación legibles y verificables sin conexión para rollups.

* **Consultas de lectura de anclajes** — El servicio de consultas de `x/multilayer` ahora expone `Anchor` (el anclaje de estado más reciente de una capa) y `Anchors` (el historial de anclajes de una capa), de modo que los clientes pueden obtener el anclaje de liquidación de una capa y verificarlo de forma independiente.
* **Pasarela REST para multilayer** — Cada consulta multilayer (`params`, `layers`, `layers/{layer_id}`, `anchor/{layer_id}`, `anchors/{layer_id}`, `routing-stats`) está ahora disponible por REST además de gRPC.
* **Recibos de liquidación ML-DSA-87 desbloqueados** — Cada anclaje lleva una firma **ML-DSA-87 (Dilithium-5)** sobre sus campos canónicos, lo que proporciona la base en cadena para la verificación sin conexión de recibos de liquidación del Rollup Development Kit.

## v3.1.79 — Aprovisionamiento automático de validadores para redes puente

**Enfoque de la versión:** Participación llave en mano en redes conectadas para validadores con licencia.

* **Framework de drivers de red** — Un framework declarativo de drivers permite que un validador de QoreChain que posea la licencia `validator_<chain>` (o `qcb_bridge`) correspondiente tenga el cliente de la red externa asociada aprovisionado, configurado y en ejecución en el mismo nodo bajo la orquestación de QoreChain — solo una vez que la licencia esté activada.
* **Drivers para las 37 redes puente** — La cobertura abarca todas las redes conectadas, clasificadas por modelo de participación (validador sin permisos, con límite/electo/por admisión, nodo completo L2 y roles sin staking/lista de confianza). Las claves de staking y firma de la red externa siguen siendo aportadas por el operador para cada red; QoreChain proporciona el framework y la puerta de licencia aplicada.

## v3.1.78 — Preparación previa al despliegue

**Enfoque de la versión:** Wallets, puentes, IBC y licencias funcionan desde el lanzamiento — sin gobernanza posterior al despliegue.

* **Activación de puentes post-despliegue sin confianza** — Una clave `bridge_admin` (o un titular de licencia `qcb_bridge`) puede activar el puente de cualquier cadena conectada con una única transacción firmada (`tx bridge update-chain-config` / `set-verifier-bootstrap`) — estableciendo la dirección del contrato, las confirmaciones, la arquitectura, el estado, el verificador activo y la raíz de confianza del verificador — sin propuesta de gobernanza ni actualización de la cadena.
* **Puerta de licencia para redes de validadores** — El orquestador ahora exige la licencia `validator_<chain>` / `qcb_bridge` (falla en cerrado) antes de iniciar cualquier cliente de red externa.
* **Paquetes de integración de wallets** — `@qorechain/wallet-adapter` y `@qorechain/connect` publicados en npm (v0.1.0), añadiendo el registro de red en MetaMask con una sola llamada (EIP-3085, QOR nativo de **18 decimales** en el raíl EVM) y la configuración del precio de gas en Keplr.
* **Relayer IBC llave en mano** — Configuración de relayer lista para ejecutar y herramientas de arranque de canales para las ocho contrapartes IBC, de modo que los canales se levantan tras el despliegue sin configuración a medida.

## v3.1.77 — Endpoints REST de puente y quema

**Enfoque de la versión:** Acceso REST de solo lectura para los módulos de cross-chain y suministro.

* **Endpoints REST del puente** — Endpoints de consulta HTTP de solo lectura para el módulo de puente, exponiendo el estado del puente por REST estándar además de gRPC.
* **Endpoints REST de quema** — Endpoints de consulta HTTP de solo lectura para el módulo de quema, haciendo consultables por REST estándar los datos de distribución de comisiones y suministro.

## v3.1.76 — Modernización de la cadena de herramientas SVM

**Enfoque de la versión:** Actualización de compatibilidad con la Solana Virtual Machine.

* **Compatibilidad con programas de la cadena de herramientas actual** — Ejecución SVM modernizada para que los programas compilados con la cadena de herramientas actual de Solana se ejecuten en el entorno SVM de QoreChain.

## v3.1.75 — JSON-RPC de SVM por defecto

**Enfoque de la versión:** RPC compatible con Solana listo para usar.

* **JSON-RPC compatible con Solana** — El servidor JSON-RPC de SVM ahora está habilitado por defecto (puerto **8899**) y se inicia automáticamente con el nodo, proporcionando una interfaz RPC compatible con Solana para las herramientas SVM.

## v3.1.74 — Perfiles predefinidos de rollup

**Enfoque de la versión:** Usabilidad y liquidación del Rollup Development Kit.

* **Aplicación de perfiles predefinidos** — La creación de rollups ahora aplica el preset del perfil seleccionado (DeFi, gaming, NFT, empresarial o totalmente personalizado), de modo que los nuevos rollups heredan valores por defecto sensatos para su caso de uso.
* **Liquidación optimista** — La ruta de liquidación optimista (envío de lotes y disputa) está operativa de extremo a extremo.

## v3.1.73 — Línea base de hash post-cuántico

**Enfoque de la versión:** Completar la línea base criptográfica post-cuántica por defecto.

* **SHAKE-256 como hash por defecto** — SHAKE-256 (familia SHA-3) se adopta como hash de aplicación por defecto, completando la línea base post-cuántica por defecto de firmas **ML-DSA-87 (Dilithium-5)**, encapsulación de claves **ML-KEM-1024** y hashing **SHAKE-256**.

## v3.1.72 — Estabilidad y mantenimiento

**Enfoque de la versión:** Mantenimiento rutinario de estabilidad y de la canalización de compilación.

* **Mejoras de estabilidad** — Mantenimiento interno de estabilidad, dependencias y canalización de compilación sin cambios de comportamiento visibles externamente.

## v3.1.71 — Firmas híbridas PQC aplicadas por defecto

**Enfoque de la versión:** Seguridad post-cuántica activada por defecto en la ruta de transacciones Cosmos.

* **Firmas híbridas requeridas por defecto** — Las firmas híbridas post-cuánticas se aplican ahora por defecto en la ruta de transacciones Cosmos: cada transacción lleva una firma post-cuántica **ML-DSA-87 (Dilithium-5)** junto a la firma clásica **secp256k1**.
* **Aplicación controlada por gobernanza** — El modo de aplicación sigue controlado por gobernanza, con el valor por defecto establecido en **requerido**.

## v3.1.70 — Endurecimiento de producción

**Enfoque de la versión:** Endurecimiento de producción y optimización del consenso para la mainnet en vivo.

* **Optimización del consenso PRISM** — Mejoras continuas en la capa de optimización por aprendizaje por refuerzo PRISM para el ajuste adaptativo de parámetros bajo condiciones reales de red, con controles de seguridad tipo cortacircuitos.
* **Rendimiento y estabilidad** — Refinamientos de throughput, latencia y uso de recursos en validadores y nodos completos.
* **Herramientas operativas** — Mejoras en la monitorización, las consultas y la ergonomía de operación de nodos para los operadores de mainnet.
* **Alineación con Tokenomics v2.1** — Mecánicas de distribución de comisiones y emisión alineadas con el modelo económico de emisión finita y con tope (refinado más tarde por el tope de emisión de v3.1.94).

## v3.0.0 — Génesis de mainnet

**Enfoque de la versión:** Lanzamiento de la mainnet y evento de generación de tokens.

* **Génesis de mainnet** — La mainnet de QoreChain (`qorechain-vladi`, chain ID EVM 9801) está activa desde el **7 de junio de 2026**, con el evento de generación de tokens (TGE) en el génesis.
* **Reparto de comisiones en cinco vías** — Distribución de las comisiones del protocolo entre validadores, quema, tesorería, stakers y nodos ligeros (**37 / 30 / 20 / 10 / 3**), añadiendo una parte dedicada a los nodos ligeros.
* **AMM en cadena** — Módulo nativo de creador de mercado automatizado (`x/amm`) para pools de liquidez y swaps en cadena.
* **Licencias de cadena** — Módulo de licencias en cadena (`x/license`) para registrar y gestionar derechos del protocolo.
* **Paradigmas de liquidación endurecidos** — Modos de liquidación del RDK finalizados como optimista, zk, based y soberano.

## v1.4.0 — Expansión previa a la mainnet

**Enfoque de la versión:** Cobertura cross-chain y estabilización de la candidata a versión final antes de la mainnet.

* **Cobertura cross-chain ampliada** — Conectividad IBC y de puentes adicional hacia un conjunto más amplio de redes externas.
* **Participación de nodos ligeros** — Se introdujeron los nodos ligeros y las bases para sus recompensas por participación en comisiones.
* **Endurecimiento de la candidata a versión final** — Pruebas exhaustivas, auditorías y estabilización de todos los módulos centrales en preparación para el génesis de la mainnet.

## v1.3.0 — Rollup Development Kit

**Enfoque de la versión:** Infraestructura nativa de rollups para despliegues de rollups soberanos y de seguridad compartida.

* **Módulo x/rdk** — Rollup Development Kit completo con cuatro paradigmas de liquidación: optimista, zk, based y soberano
* **5 perfiles predefinidos** — Plantillas de rollup preconfiguradas para casos de uso DeFi, gaming, NFT, empresarial y totalmente personalizado
* **Disponibilidad de datos nativa** — Capa de DA en cadena con almacenamiento de blobs, gestión de retención y ciclo de vida de poda
* **Autofinalización por EndBlocker** — Finalización automática de lotes cuando expira la ventana de disputa, sin necesidad de intervención del operador
* **Selección de perfil asistida por IA** — Consulta `suggest-profile` que recomienda una configuración óptima de rollup según el caso de uso previsto
* **Integración multicapa** — Los rollups se registran como capas en la arquitectura multicapa, heredando las mecánicas de enrutamiento, anclaje y disputa
* **Ciclo de vida de depósito en garantía** — El stake del operador se mantiene en garantía durante la operación del rollup y se libera tras un cierre limpio o se pierde por slashing

## v1.2.0 — IBC y puentes

**Enfoque de la versión:** Conectividad cross-chain y abstracciones avanzadas de cuentas.

* *(Diseñado; la capa cross-chain sigue pendiente — consulte [Arquitectura de puentes](/architecture/bridge-architecture).)* **25 conexiones cross-chain** — 8 canales IBC y 17 conexiones QoreChain Bridge (QCB) a redes externas
* **Módulo x/babylon** — Integración de restaking de BTC que permite a los tenedores de Bitcoin participar en la seguridad de staking de QoreChain
* **Módulo x/abstractaccount** — Framework de cuentas inteligentes con reglas de gasto programables, claves de sesión y lógica de autenticación personalizada
* **Módulo x/fairblock** — Cifrado basado en identidad con umbral (tIBE) para el cifrado de transacciones resistente al MEV
* **Módulo x/gasabstraction** — Diseño de pago de gas multi-token con soporte para QOR nativo, USDC puenteado por IBC y ATOM puenteado por IBC (todavía no hay ningún canal IBC abierto)
* **Priorización de TX en 5 carriles** — Definiciones de carriles para la priorización del espacio de bloque (solo configuración; el mempool en vivo no los aplica)
* **Configuraciones de relayer IBC** — Configuraciones de relayer predefinidas para todos los canales IBC soportados
* **Integración puente-quema** — Las comisiones del puente se enrutan a través de la distribución de comisiones del módulo de quema

## v1.1.0 — Firmas híbridas PQC

**Enfoque de la versión:** Seguridad criptográfica post-cuántica y agilidad de algoritmos.

* **Firmas duales secp256k1 (ECDSA) + ML-DSA-87** — Cada transacción lleva tanto una firma clásica como una post-cuántica, verificadas en la cadena del AnteHandler
* **3 modos de aplicación** — Aplicación configurable de firmas híbridas: desactivada (modo 0), permisiva (modo 1, PQC opcional), obligatoria (modo 2, PQC requerida)
* **Registro de claves** — Las primeras compilaciones registraban automáticamente una clave pública PQC en la primera transacción híbrida; ese comportamiento se eliminó, y ahora una clave se registra de forma explícita con `MsgRegisterPQCKey` (consulte [Primera transacción](/getting-started/first-transaction#register-pqc-key))
* **Base de hash SHAKE-256** — Todas las operaciones de hashing relacionadas con PQC usan SHAKE-256 (familia SHA-3) para la derivación de direcciones
* **Interfaces de atestación TEE** — Soporte de atestación de Entornos de Ejecución Confiables para demostrar la integridad de la generación de claves PQC
* **Framework de agilidad de algoritmos** — Registro de algoritmos conectable que permite añadir futuros algoritmos PQC vía gobernanza sin una actualización de la cadena

## v1.0.0 — Génesis (motor de tokenomics)

**Enfoque de la versión:** Lanzamiento inicial del protocolo con tokenomics completa, ejecución multi-VM y operaciones asistidas por IA.

* **Módulo x/burn** — Mecanismo de quema de comisiones multicanal con una distribución en cuatro vías entre validadores, quema, tesorería y stakers
* **Módulo x/xqore** — Derivado de staking de gobernanza con penalizaciones escalonadas por desbloqueo anticipado y redistribución de rebase PvP
* **Módulo x/inflation** — Emisión basada en épocas con decaimiento anual (sustituida en v3.1.94 por un monto fijo por época bajo un tope acumulativo estricto)
* **Capa de consenso PRISM** — Optimización por aprendizaje por refuerzo (PPO) para el ajuste dinámico de parámetros de la cadena con controles de seguridad tipo cortacircuitos
* **CPoS de triple pool** — Proof-of-Stake compuesto con pools de validadores RPoS, DPoS y PoS ponderados por puntuaciones de reputación (implementado en `x/qca`; todavía no conectado a la producción de bloques)
* **Gobernanza QDRW** — Fórmula de poder de voto de Delegación Cuadrática con Ponderación por Reputación (implementada; desactivada en las redes en vivo)
* **Entornos EVM + QoreChain Native + SVM** — Tres entornos de ejecución concurrentes: el QoreChain EVM Engine, contratos inteligentes QoreChain Native y la Solana Virtual Machine
* **Puente cross-VM** — Paso de mensajes y transferencias de activos entre los entornos EVM, QoreChain Native y SVM dentro de un mismo bloque
* **Criptografía post-cuántica** — Firma ML-DSA-87 respaldada por una biblioteca PQC de alto rendimiento
* **QCAI** — Análisis heurístico en cadena con un sidecar opcional fuera de cadena para detección de fraude, estimación de comisiones y optimización de la red
* **Despliegue en contenedores** — Despliegue completo de testnet multivalidador con servicio sidecar e indexador de bloques
* **Indexador de bloques** — Listener de bloques con almacenamiento persistente para consultas históricas y analítica
