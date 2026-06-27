---
slug: /architecture/mev-protection-fairblock
title: Protección MEV (FairBlock)
sidebar_label: Protección MEV (FairBlock)
sidebar_position: 10
---

# Protección MEV (FairBlock)

El módulo `x/fairblock` implementa la defensa de QoreChain contra los ataques de Valor Máximo Extraíble (MEV) mediante cifrado por umbral basado en identidad. Combinado con un sistema de priorización de transacciones de 5 carriles, esto crea una arquitectura anti-MEV integral que protege a los usuarios contra el front-running, los ataques sándwich y otras formas de extracción de valor basadas en el mempool.

## El Problema del MEV

El MEV ocurre cuando los proponentes de bloques u observadores explotan la **asimetría de información** en el mempool de transacciones. Dado que las transacciones pendientes son visibles antes de su inclusión, los adversarios pueden:

* **Front-run**: Colocar una transacción por delante de una operación rentable detectada
* **Ataque sándwich**: Colocar transacciones antes y después de la operación de una víctima para extraer valor del deslizamiento de precio
* **Back-run**: Colocar una transacción inmediatamente después de una oportunidad detectada

Estos ataques extraen valor de los usuarios ordinarios y socavan la equidad en DeFi, los intercambios de tokens y la acuñación de NFT.

## Marco tIBE de FairBlock

QoreChain aborda el MEV mediante el **Cifrado Basado en Identidad por Umbral (tIBE)**, un esquema criptográfico donde:

1. **Cifrado**: Los usuarios cifran sus transacciones antes de difundirlas. Las transacciones cifradas son **opacas** — los proponentes, validadores y observadores del mempool no pueden leer el contenido de las transacciones.
2. **Inclusión**: Los proponentes incluyen las transacciones cifradas en los bloques sin conocer su contenido. Dado que los datos son ilegibles, se elimina la asimetría de información.
3. **Descifrado**: Después de que una transacción se confirma en un bloque, un número umbral de validadores aporta participaciones de descifrado. Una vez alcanzado el umbral, la transacción se descifra y se ejecuta.

Este enfoque garantiza que ninguna parte individual pueda descifrar una transacción antes de que se confirme de forma irreversible, eliminando el vector de ataque MEV en su raíz.

### Estructura de la Transacción Cifrada

Cada transacción cifrada contiene:

| Campo            | Descripción                                      |
| ---------------- | ------------------------------------------------ |
| `encrypted_data` | Carga útil de transacción cifrada con tIBE       |
| `sender`         | Dirección del remitente de la transacción (visible para el enrutamiento) |
| `target_height`  | Altura de bloque en la que debe ocurrir el descifrado |
| `submitted_at`   | Marca de tiempo del cifrado                      |

### Participaciones de Descifrado

Los validadores aportan participaciones de descifrado para las transacciones confirmadas:

| Campo        | Descripción                           |
| ------------ | ------------------------------------- |
| `validator`  | Dirección del validador que contribuye |
| `tx_id`      | ID de la transacción cifrada          |
| `share_data` | La participación de clave de descifrado del validador |
| `height`     | Altura de bloque del envío de la participación |

## Estado de Implementación

En la versión actual de testnet, el módulo FairBlock es una **implementación stub**:

* El ante handler `FairBlockDecorator` está conectado a la canalización de procesamiento de transacciones pero **deja pasar** todas las transacciones sin modificación.
* Cuando `enabled` es `false` (el valor por defecto), el decorador delega inmediatamente al siguiente handler de la cadena.
* La activación completa de tIBE está planificada para una versión futura, pendiente de una ceremonia de claves de validadores para establecer los parámetros de cifrado por umbral.

### Configuración de FairBlock

| Parámetro            | Por Defecto  | Descripción                                      |
| -------------------- | ------------ | ------------------------------------------------ |
| `enabled`            | `false`      | Interruptor maestro del cifrado tIBE             |
| `tibe_threshold`     | 5            | Número de participaciones de descifrado de validadores requeridas |
| `decryption_delay`   | 3 blocks     | Bloques tras la inclusión antes de que comience el descifrado |
| `max_encrypted_size` | 65,536 bytes | Tamaño máximo de una carga útil de transacción cifrada |

## Priorización de Transacciones de 5 Carriles

QoreChain implementa una arquitectura de mempool de 5 carriles que categoriza las transacciones por tipo y asigna a cada carril un nivel de prioridad y una asignación de espacio de bloque.

### Configuración de Carriles

| Carril      |     Prioridad | Espacio de Bloque | Tipo de Transacción                              |
| ----------- | ------------: | ----------: | ------------------------------------------------ |
| **PQC**     | 100 (más alta) |         15% | Transacciones con firmas híbridas post-cuánticas |
| **MEV**     |            90 |         20% | Transacciones cifradas con tIBE de FairBlock     |
| **AI**      |            80 |         15% | Transacciones puntuadas por IA y optimizadas en comisiones |
| **Default** |            50 |         40% | Transacciones estándar                           |
| **Free**    |   10 (más baja) |         10% | Transacciones con gas abstraído y patrocinadas   |

### Descripciones de los Carriles

**Carril PQC** (Prioridad 100, 15% de espacio de bloque)\
Las transacciones firmadas con firmas criptográficas híbridas post-cuánticas reciben la prioridad más alta. Esto incentiva la adopción de la firma de transacciones resistente a la computación cuántica y garantiza que las operaciones protegidas por PQC nunca queden desplazadas durante la congestión.

**Carril MEV** (Prioridad 90, 20% de espacio de bloque)\
Las transacciones cifradas con tIBE reciben la segunda prioridad más alta y la mayor asignación reservada. Esto garantiza que los usuarios que optan por la protección MEV tengan espacio de bloque asegurado, fomentando la adopción generalizada del esquema de cifrado.

**Carril AI** (Prioridad 80, 15% de espacio de bloque)\
Las transacciones que han sido puntuadas u optimizadas por el sistema de detección de anomalías por IA reciben prioridad elevada. Esto incluye transacciones marcadas como operaciones legítimas de alto valor o aquellas con estructuras de comisiones optimizadas por IA.

**Carril Default** (Prioridad 50, 40% de espacio de bloque)\
Transacciones estándar sin ninguna clasificación especial. Este carril recibe la mayor asignación absoluta de espacio de bloque para gestionar el tráfico normal de la red.

**Carril Free** (Prioridad 10, 10% de espacio de bloque)\
Transacciones con gas abstraído y patrocinadas. Este carril permite experiencias de usuario sin comisiones en las que un tercero (aplicación, protocolo o relayer) patrocina el coste del gas. La baja prioridad y el espacio de bloque limitado evitan el abuso a la vez que siguen admitiendo casos de uso de abstracción de gas.

### Estado de Implementación

La configuración de carriles es **solo de datos** en la versión actual de testnet. Las definiciones de carriles (prioridad, asignación de espacio de bloque) se registran en la inicialización de la aplicación, pero la reordenación real del mempool mediante `PrepareProposal` y `ProcessProposal` es un hito futuro. Actualmente, todas las transacciones se procesan en orden estándar independientemente de la asignación de carril.

## Efecto Anti-MEV Combinado

1. **Capa 1: Cifrado (tIBE)** — Las transacciones se cifran antes de entrar en el mempool. Los proponentes no pueden leer el contenido, por lo que no hay información que extraer.
2. **Capa 2: Priorización (Carriles)** — Las transacciones cifradas del carril MEV obtienen un 20% de espacio de bloque reservado. La prioridad 90 garantiza la inclusión incluso durante la congestión.
3. **Capa 3: Descifrado por Umbral** — Solo después de la confirmación del bloque los validadores revelan las participaciones de descifrado. El requisito de umbral evita que cualquier validador individual realice un descifrado anticipado.

Resultado: La asimetría de información se elimina en cada etapa del ciclo de vida de la transacción, desde la difusión hasta la ejecución.

Este enfoque es estrictamente superior al descifrado con retardo temporal o a los esquemas de commit-reveal de una sola parte, porque el requisito de umbral distribuye la confianza entre todo el conjunto de validadores.
