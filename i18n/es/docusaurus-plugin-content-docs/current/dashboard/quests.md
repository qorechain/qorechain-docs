---
slug: /dashboard/quests
title: Misiones
sidebar_label: Misiones
sidebar_position: 10
---

# Misiones

Las **Misiones** (Quests) son tareas guiadas que te enseñan a usar QoreChain a medida que las completas. Una misión agrupa uno o más pasos, como financiar una billetera, hacer una transferencia o vincular una cuenta, y te recompensa por terminarla. Esta página también cubre las demás páginas del grupo **Earn** de la barra lateral y el arcade: **Leaderboard**, **Badges** y **Games**. Todas son para miembros de la comunidad que quieren una forma práctica de aprender la red y acumular progreso.

## Innovaciones {#innovations}

- **Finalización verificada, no autodeclarada.** Una misión cuenta cuando pasa su comprobación. Eigenstate 2 indica el tipo de comprobación en cada misión: **cuenta vinculada**, **billetera conectada**, **enlace de prueba**, **revisión del equipo** o **cuestionario**.
- **Las misiones sociales solo cuentan con cuentas verificadas.** Una misión que implica X, Telegram o Discord (y, en las comprobaciones de cuenta vinculada de Eigenstate 2, también YouTube y GitHub) solo cuenta una vez que has conectado la cuenta en tu **Perfil** y la conexión está verificada. Hasta entonces la página muestra *Connect Social Accounts* con un enlace **Go to Profile**.
- **Los requisitos previos se hacen cumplir.** Una misión bloqueada indica qué terminar primero ("Complete "..." first").
- **Estados claros.** Started, Pending Verification, Pending Review, Failed y Completed, de modo que una misión que espera una revisión humana no se muestra como fallida.
- **Dos temporadas en una página.** Las pestañas **Eigenstate 1** y **Eigenstate 2** tienen sus propios conjuntos de misiones y categorías.

## Cómo usarlo {#how-to-use}

### Explorar misiones

Abre **Quests** (grupo **Earn** de la barra lateral). Un resumen muestra cuántas misiones hay disponibles, en curso y completadas. Las **pestañas de categoría** filtran la lista:

- Eigenstate 1: Onboarding, Trading, Social, Community, Learning, Daily y Weekly.
- Eigenstate 2: Social, Exchanges, Developer, Educational, Korea/Asia, On-Chain y Other.

Una categoría vacía dice "No quests in this category yet." Cada tarjeta de misión muestra un icono, un título y una descripción breve, una insignia de **dificultad**, un tiempo estimado, la **recompensa** (en QOR o en puntos eigenvalue, λ) y un estado (completada, en curso, iniciada o bloqueada).

### Completar una misión de Eigenstate 1

1. Abre una misión y selecciona **Start Quest** (más tarde **Continue Quest**).
2. Avanza por las tareas. Una tarea ofrece **Go to Action** (a la página correspondiente del Panel) y **Complete** (para confirmar un paso y poder verificarlo).
3. Una barra de progreso registra las tareas completadas.
4. Cuando todas las tareas estén hechas, selecciona **Check Completion** para verificar la misión y recibir su recompensa.

Las misiones diarias y semanales se reinician con una periodicidad; la página de detalle muestra la cadencia de reinicio y tu racha. Una solicitud al [Faucet](/dashboard/faucet) cuenta para las misiones del faucet.

### Completar una misión de Eigenstate 2

1. Abre la misión y lee su tipo de comprobación.
2. Usa el botón que ofrece la misión. Cuál aparece depende del tipo de comprobación y del estado actual: **Verify**, **Submit**, **Resubmit**, **Retry verification** o **Re-check status**.
3. Observa cómo el estado pasa por Started, Pending Verification o Pending Review, y luego Completed (o Failed).

### Leaderboard {#leaderboard}

`/leaderboard` clasifica a las personas por puntos eigenvalue (λ) con un top tres, estadísticas de la comunidad y un cuadro de búsqueda. Es una clasificación off-chain.

### Badges {#badges}

`/badges` es un catálogo de 12 series de insignias. **Check Badges** reevalúa tu progreso. Un **Badge Widget** te da un fragmento iframe, BBCode o Markdown con **Copy Code** para mostrar una insignia en otro sitio. Una serie Bridge aparece en la lista aunque el puente no está en producción.

### Games {#games}

`/games` es el **QoreChain Arcade** con 12 juegos: Quantum Space Miner, Quantum Runner, Chain Breaker, Token Rush, Block Defense, Node Puzzle, Quantum Stack, Hash Breaker, Qubit Bounce, Consensus Race, Quantum Maze y Wave Coder. Selecciona **Play Now** en una tarjeta; tu puntuación (Photons, γ) se envía cuando termina el juego. Las puntuaciones se guardan off-chain.

## Cómo acceder {#how-to-access}

- **URLs:** [dashboard.qorechain.io/quests](https://dashboard.qorechain.io/quests), `/leaderboard`, `/badges`, `/games`.
- **Inicio de sesión:** requerido para todas. `/quests` redirige al inicio de sesión cuando no has iniciado sesión; Leaderboard, Badges y Games muestran una pantalla "Authentication Required".
- **Red:** ninguna sigue el cambio de red.
- **Billetera:** no se requiere ninguna, pero las misiones que implican transacciones necesitan una billetera de testnet con fondos (consulta [Monedero](/dashboard/wallet#testnet) y [Faucet](/dashboard/faucet)); las misiones sociales necesitan cuentas vinculadas.
- **Coste:** gratis.

## Dónde se publica {#where-published}

| Página | Dirección | Cuenta |
| --- | --- | --- |
| Quests (Eigenstate 1 y 2) | `dashboard.qorechain.io/quests` | Inicio de sesión |
| Leaderboard | `dashboard.qorechain.io/leaderboard` | Inicio de sesión |
| Badges | `dashboard.qorechain.io/badges` | Inicio de sesión |
| Games | `dashboard.qorechain.io/games` | Inicio de sesión |

## Límites y problemas conocidos {#limits}

- **Los conjuntos de misiones cambian.** La pestaña de una temporada puede estar vacía o mostrar menos misiones cuando sus misiones no están activas; consulta la pestaña en lugar de fiarte de esta página para la lista actual.
- **Todo aquí es off-chain:** los puntos, las clasificaciones, las insignias y las puntuaciones de los juegos los registra el Panel, no QoreChain. La palabra "on-chain" del subtítulo del Arcade no describe las puntuaciones.
- **Las cantidades de recompensa** se muestran en cada misión y pueden cambiar.
- **Se requiere iniciar sesión** y, para las misiones sociales, cuentas vinculadas verificadas.
- **Public Sale** (`/public-sale`) es una página aparte para los participantes existentes (asignación, calendario de vesting, reclamación); todas las rondas anteriores están cerradas y no se describe más aquí.
- **FAQ** (`/faq`) es una página de ayuda dentro de la aplicación cuyo contenido va por detrás de este manual.

## Relacionado

- [Resumen y primeros pasos](/dashboard/overview) - inicia sesión y conecta tu billetera antes de empezar las misiones.
- [Faucet](/dashboard/faucet) - financia una billetera de testnet para las misiones que implican transacciones.
