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
2. Sigue la [guía del Workshop 1](/build-before-qday/workshop-1) en la testnet.
3. Prueba una de las aplicaciones de ejemplo de la tabla de arriba.
4. Si nunca has desplegado en QoreChain, [Despliega en 5 minutos](/getting-started/deploy-in-5-minutes) explica la idea en profundidad. Los kits que hay detrás de las aplicaciones están en la página de [Kits](/build-before-qday/workshop-1/kits).

## El código {#code}

Todas las aplicaciones de ejemplo están en un solo repositorio público, carpeta `workshop-1`: [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday). Cada tutorial te dice qué carpeta abrir. Descarga el código una vez con:

```bash
git clone https://github.com/qorechain/build-before-qday
```

| Parte | Qué hace |
| --- | --- |
| `git clone` | Descarga a tu ordenador una copia completa de un repositorio de código. |
| `https://github.com/qorechain/build-before-qday` | La dirección del repositorio que se copia. |

**Lo que deberías ver:** una carpeta nueva llamada `build-before-qday` en la carpeta donde ejecutaste el comando.
