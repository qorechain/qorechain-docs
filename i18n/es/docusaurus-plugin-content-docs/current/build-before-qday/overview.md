---
slug: /build-before-qday/overview
title: Build Before Q-Day
sidebar_label: Visión general
sidebar_position: 1
---

# Build Before Q-Day

**Build Before Q-Day** es el festival para desarrolladores de QoreChain, que se celebra en línea en [build.qorechain.io](https://build.qorechain.io) con el hashtag #BuildBeforeQDay. Los participantes eligen un nivel, construyen en la testnet de QoreChain con los kits de código abierto, publican su avance en abierto y presentan su proyecto a un jurado y a la comunidad. Junto al festival hay un taller técnico por semana. Cada taller tiene una guía completa paso a paso en esta sección, desde el primer comando hasta el último, así que puedes hacerlo todo a tu ritmo y en tu propio ordenador, aunque seas nuevo en el desarrollo. Las aplicaciones de ejemplo están reunidas en el repositorio público [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday).

## Innovaciones {#innovations}

Todos los talleres de esta sección giran en torno a las funciones que hacen diferente a QoreChain:

- **Firma híbrida.** Una transacción se firma dos veces: una con una clave clásica secp256k1 y otra con una clave poscuántica ML-DSA-87. Quien robe solo la clave clásica no puede producir la segunda firma.
- **Verificada en la cadena.** Los validadores comprueban ambas firmas. La transacción lleva una extensión `PQCHybridSignature` y la cadena emite un evento `pqc_hybrid_verify` con el estado `verified`. Puedes leer ambas cosas desde el endpoint REST público y ver el resultado en el explorador.
- **Una clave, vinculada una sola vez.** Tu clave poscuántica se deriva, no se genera, y se registra una vez con una prueba. Consulta [Cómo se vincula tu clave poscuántica a tu cuenta](/build-before-qday/key-binding).
- **Herramientas habituales.** Sigues usando Hardhat, Foundry o el lenguaje que prefieras. Los kits se encargan de la clave poscuántica y de la ventana de autorización por ti.

## Cómo funciona {#how-it-works}

1. **Regístrate** en [build.qorechain.io](https://build.qorechain.io): inicia sesión con GitHub, elige tu nivel, conecta X y QoreX.
2. **Construye** en la testnet con los kits, los talleres semanales y los retos de mitad del festival. Tus commits y actualizaciones aparecen en el feed público.
3. **Envía** tu proyecto antes de la fecha límite con un repositorio público, un vídeo de hasta 3 minutos y la dirección de testnet que usa tu proyecto.

Participar es gratis: construyes en la testnet, donde el QOR de prueba sale del [faucet](/dashboard/faucet). Las reglas completas de elegibilidad, envío y evaluación están en la página Rules del sitio del festival. El fondo de premios es de 20.000 $ en total, con becas de seguimiento en QOR a partir de enero de 2027; el reparto está en el sitio del festival.

## Niveles {#levels}

Eliges un nivel al registrarte y puedes cambiarlo más tarde.

| Nivel | Para quién es |
| --- | --- |
| Quantum Pass | Eres nuevo en QoreChain o en web3. Construye una pequeña aplicación que envía una transacción híbrida poscuántica y la lee de vuelta desde la cadena. |
| Intermediate | Ya has publicado una dApp antes. Construye una aplicación completa con el SDK de QoreChain y QoreX. |
| Advanced | Tres pistas: A, agentes; B, aplicaciones cifradas con QoreSeal; C, aplicaciones cross-VM que abarcan los carriles EVM y Native. |
| Expert | Infraestructura de protocolo: rollups con el RDK, IBC con QORel, custodia y herramientas para desarrolladores. |

El Workshop 1 cubre exactamente lo que pide el nivel Quantum Pass: una transacción firmada de forma híbrida y verificada en la cadena.

## Calendario {#timeline}

Todas las horas son UTC.

| Cuándo | Qué |
| --- | --- |
| 4 de noviembre de 2026 | Se abren el registro y la construcción |
| Cada semana | Un taller (4 en total) con su guía paso a paso aquí |
| 18 de noviembre de 2026 | Empiezan los retos de mitad del festival |
| 2 de diciembre de 2026, 23:59 | Fecha límite de envío |
| Del 3 al 5 de diciembre | Comprobación de los envíos |
| Del 6 al 15 de diciembre | Evaluación y votación People's Choice |
| 16 de diciembre | Ganadores y demostración en directo |
| Del 17 al 22 de diciembre | Pago de premios |
| Enero de 2027 | Becas de seguimiento |

El calendario está en el sitio del festival.

## Para quién es {#who}

No necesitas saber de blockchain ni de criptografía poscuántica. Si sabes abrir una terminal y pegar un comando, puedes seguir todas las guías de aquí. Cada guía explica en palabras sencillas qué hace cada comando y qué significa cada una de sus partes, y luego muestra lo que deberías ver en pantalla. Cuando una guía dice que un comando puede tardar un momento, espera a que termine antes de ejecutar el siguiente.

## Elige un tutorial {#choose}

Haz primero la **guía del Workshop 1**. Es el camino completo, desde un ordenador vacío hasta una transacción firmada con dos claves y comprobada en la cadena. Después elige cualquiera de las aplicaciones de abajo. Muestran la misma idea en distintos lenguajes y herramientas.

Los tiempos corresponden a los pasos posteriores a la instalación de las herramientas. Instalar las herramientas la primera vez suma entre 20 y 40 minutos: consulta [Antes de empezar](/build-before-qday/prerequisites).

| Tutorial | Nivel | Lenguaje | Tiempo | Qué tendrás al final |
| --- | --- | --- | --- | --- |
| [Guía del Workshop 1](/build-before-qday/workshop-1) | Principiante | TypeScript, Solidity | 30 minutos | Un proyecto que generaste, probaste y desplegaste en la testnet, y una transacción firmada de forma híbrida y verificada en la cadena. |
| [Guía del Workshop 2](/build-before-qday/workshop-2) | Intermedio | Solidity, TypeScript, Node.js | 75 minutos | Una bóveda que paga solo contra una firma poscuántica, un agente cuyos límites de gasto aplica la cadena y preguntas de solo lectura a la cadena con MCP. |
| [Guía del Workshop 3](/build-before-qday/workshop-3) | Avanzado | Node.js, Solidity, Rust | 70 minutos | Un mensaje cifrado para una dirección `qor1...` con cifrado poscuántico que solo su dueño puede abrir, y una transacción EVM que escribe en un contrato Native, todo o nada. |
| [Guía del Workshop 4](/build-before-qday/workshop-4) | Experto | Node.js | 45 minutos, más una espera de una hora | Un rollup que paga un retiro y pierde su bono cuando hace trampa, QOR enviado a la testnet del Cosmos Hub y de vuelta, y las herramientas de desarrollo de QoreX. La parte del rollup necesita una asignación mayor de testnet. |
| [Q-Day Counter](/build-before-qday/workshop-1/apps/qday-counter) | Principiante | TypeScript, Solidity | 25 minutos | Un contrato contador en la testnet que incrementas con un flujo firmado de forma híbrida. |
| [Q-Day Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) | Intermedio | TypeScript, Solidity, React | 45 minutos | Tu propio libro de visitas en la cadena, con una página web donde firmas desde la wallet QoreX. |
| [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) | Principiante | TypeScript, React | 25 minutos | Una página web que envía QOR desde QoreX y muestra las dos firmas y el veredicto de la cadena. |
| [Rust, qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) | Intermedio | Rust | 25 minutos | Una aplicación de línea de comandos que paga con una firma híbrida y la verifica en la cadena. |
| [Java, Tip Jar](/build-before-qday/workshop-1/apps/java-tipjar) | Intermedio | Java 21 | 25 minutos | Un backend que envía propinas y solo acepta pagos firmados de forma poscuántica. |
| [Python, Airdrop](/build-before-qday/workshop-1/apps/python-airdrop) | Principiante | Python | 20 minutos | Una transacción que paga a muchas direcciones, firmada con las dos claves y verificada en la cadena. |

Qué significan aquí los niveles:

- **Principiante:** unos pocos comandos que pegas en orden. No hay que escribir código.
- **Intermedio:** lo mismo, con una segunda herramienta, como una página web, una extensión de wallet o un conjunto de herramientas de un lenguaje que quizá no hayas usado.

Todos los tutoriales siguen la misma estructura: **Antes de empezar**, pasos numerados (cada comando con lo que hace y lo que significa cada parte), **Lo que deberías ver**, cómo **verificar** la transacción en la cadena y una tabla de **Solución de problemas**.

## Antes de empezar {#before-you-start}

Lee una vez [Antes de empezar: herramientas y una wallet de testnet](/build-before-qday/prerequisites). Cubre:

- Instalar Node.js, pnpm, Git, Rust, Java, Maven, Python y jq en macOS, Windows y Linux, con un comando de comprobación para cada uno.
- Configurar la wallet QoreX en la testnet.
- Conseguir QOR de prueba en el faucet (100 QOR cada 24 horas por cuenta).
- QOR y uqor: 1 QOR son 1.000.000 uqor.
- Cómo mantener a salvo una clave de testnet desechable. Usa solo cuentas de prueba, nunca una wallet con fondos reales.

## Por dónde empezar {#where-to-start}

1. Lee [Antes de empezar](/build-before-qday/prerequisites) e instala las herramientas de tu primer tutorial.
2. Sigue la [guía del Workshop 1](/build-before-qday/workshop-1) en la testnet. Después, la [guía del Workshop 2](/build-before-qday/workshop-2), la [guía del Workshop 3](/build-before-qday/workshop-3) y la [guía del Workshop 4](/build-before-qday/workshop-4).
3. Prueba una de las aplicaciones de ejemplo de la tabla de arriba.
4. Si nunca has desplegado en QoreChain, [Despliega en 5 minutos](/getting-started/deploy-in-5-minutes) explica la idea en profundidad. Los kits que hay detrás de las aplicaciones están en la página de [Kits](/build-before-qday/workshop-1/kits).

## Preguntas de los builders {#builder-questions}

Las reglas completas están en la página Rules de [build.qorechain.io](https://build.qorechain.io), y en las preguntas frecuentes de ese sitio se responden más preguntas.

### ¿Mi repositorio tiene que ser público? {#faq-public-repo}

Sí. Un repositorio privado, incluido uno compartido con una sola cuenta, no pasa las comprobaciones de envío. Antes de la fecha límite, el 2 de diciembre de 2026 a las 23:59 UTC, el repositorio debe ser público en GitHub bajo la licencia MIT o Apache-2.0, con el archivo de licencia dentro. Puedes mantenerlo privado mientras construyes y hacerlo público antes de enviar. Nunca hagas commit de claves, frases semilla ni archivos `.env`.

### Mi proyecto es una wallet propia. ¿Aun así necesita conectar QoreX para el Quantum Pass? {#faq-wallet-project}

Sí. El Quantum Pass te pide conectar QoreX, así que añade QoreX como opción de conexión junto a tu propia wallet y deja que los usuarios elijan cualquiera de las dos. Envía a través de QoreX la transacción con firma híbrida del pass.

QoreX ofrece `window.qorex.native` para transacciones QoreChain Native y `window.qorex.evm`, un proveedor EIP-1193 que también se anuncia mediante EIP-6963 con el `rdns` `network.qore.qorex`. QoreX nunca define `window.keplr`, así que detecta `window.qorex`. En la testnet usa el chain id `qorechain-diana` (EVM chain ID 9800). Consulta [Integrar una dApp con QoreX](/qorex/dapp-integration).

### Construí mi aplicación antes de ejecutar create-qorechain-dapp. ¿Cómo demuestro que lo usé? {#faq-starter}

Añade la aplicación generada a tu repositorio. Pon la salida de `create-qorechain-dapp` en su propia carpeta (por ejemplo `apps/web`), conserva su estructura y haz que conecte QoreX y envíe la transacción con firma híbrida. Indica en tu README el nombre de la carpeta y el comando que ejecutaste. El jurado revisa a mano el uso de `create-qorechain-dapp`, así que una aplicación generada que pueda ver es la prueba más segura. Mover llamadas del SDK a una aplicación existente está bien, pero por sí solo no demuestra que usaste el starter.

### Desplegué mi contrato desde una dirección distinta de la dirección QoreX con la que me registré. ¿Es un problema? {#faq-other-address}

No. Tu dirección QoreX vinculada demuestra tu inscripción. No necesitas cambiarla, y una cuenta de testnet creada en la línea de comandos sirve para desplegar. Ship Weeks y las comprobaciones del proyecto miran tu dirección vinculada y todas las direcciones `qor1` que figuran en la página de tu proyecto. Añade la dirección desde la que desplegaste en **Direcciones de testnet** en la página de tu proyecto y luego pulsa **Revisar de nuevo**. Una transacción desde una dirección que no figura no cuenta. Los premios no se pagan a la dirección vinculada: cuando se pagan los premios, se pide a los ganadores una wallet de cobro.

## El código {#code}

Todas las aplicaciones de ejemplo están en un solo repositorio público, carpetas `workshop-1`, `workshop-2`, `workshop-3` y `workshop-4`: [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday). Cada tutorial te dice qué carpeta abrir. Descarga el código una vez con:

```bash
git clone https://github.com/qorechain/build-before-qday
```

| Parte | Qué hace |
| --- | --- |
| `git clone` | Descarga a tu ordenador una copia completa de un repositorio de código. |
| `https://github.com/qorechain/build-before-qday` | La dirección del repositorio que se copia. |

**Lo que deberías ver:** una carpeta nueva llamada `build-before-qday` en la carpeta donde ejecutaste el comando.
