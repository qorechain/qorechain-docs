---
slug: /build-before-qday/prerequisites
title: "Antes de empezar: herramientas y una wallet de testnet"
sidebar_label: "Antes de empezar"
sidebar_position: 2
---

# Antes de empezar: herramientas y una wallet de testnet

Todos los tutoriales de esta sección parten de un ordenador sin nada instalado. Esta página es el único lugar donde lo preparas. Hazlo una vez y luego abre cualquier tutorial. Cada tutorial enlaza de vuelta aquí y solo repite los comandos de comprobación cortos que necesita.

**Cuánto tarda:** entre 20 y 40 minutos la primera vez, sobre todo por las descargas. Solo instalas las herramientas del tutorial que quieras seguir.

:::caution Solo una cuenta de testnet desechable
Todo lo que hay aquí se ejecuta en la **testnet** de QoreChain, donde el QOR no tiene valor. No uses nunca tu wallet real, una frase de recuperación real ni fondos reales en ningún tutorial. Crearás una cuenta nueva solo para este ejercicio.
:::

## ¿Qué herramientas necesita cada tutorial? {#which-tools}

Instala solo las filas que necesites. Git, una terminal y un navegador web los necesitan todos.

| Tutorial | Lenguaje | Herramientas que instalar | Wallet QoreX |
| --- | --- | --- | --- |
| [Guía del Workshop 1](/build-before-qday/workshop-1) | TypeScript | Node.js, pnpm, curl, jq (opcional) | No hace falta |
| [Q-Day Counter](/build-before-qday/workshop-1/apps/qday-counter) | TypeScript | Git, Node.js, pnpm | No hace falta |
| [Q-Day Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) | TypeScript | Git, Node.js, pnpm | Hace falta, con una cuenta Ethereum (coin 60) |
| [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) | TypeScript | Git, Node.js, pnpm | Hace falta |
| [Rust, qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) | Rust | Git, Rust | No hace falta |
| [Java, Tip Jar](/build-before-qday/workshop-1/apps/java-tipjar) | Java | Git, Java 21, Maven | No hace falta |
| [Python, Airdrop](/build-before-qday/workshop-1/apps/python-airdrop) | Python | Git, Python 3.10 o posterior | No hace falta |

## Abre una terminal {#terminal}

Una terminal es una ventana donde escribes comandos. Pegarás en ella los comandos de estas páginas, uno por uno.

| Sistema | Cómo abrirla |
| --- | --- |
| macOS | Pulsa Comando y Espacio, escribe `Terminal` y pulsa Retorno. |
| Windows | Abre el menú Inicio, escribe `PowerShell` y abre **Windows PowerShell**. Para el tutorial de Java necesitas además **Git Bash** (viene con Git, ver más abajo) o WSL. |
| Linux | Pulsa Ctrl, Alt y T, o busca `Terminal` en tus aplicaciones. |

Después de instalar una herramienta, **cierra la terminal y abre una nueva**. Una terminal que estaba abierta durante la instalación todavía no ve la herramienta nueva.

## Instala las herramientas {#install}

De cada herramienta tienes el comando de instalación o el enlace de descarga, y luego el **comando de comprobación**. Un comando de comprobación le pregunta la versión a la herramienta. Si imprime un número de versión igual o superior al requerido, la herramienta funciona.

### Gestores de paquetes (ayudantes opcionales) {#package-managers}

Un gestor de paquetes instala otros programas con un solo comando. También puedes descargar cada herramienta a mano desde su sitio web. Los comandos de abajo usan el ayudante que corresponde a tu sistema.

| Sistema | Ayudante | Cómo conseguirlo |
| --- | --- | --- |
| macOS | Homebrew | Pega esta línea en la terminal y sigue lo que imprima: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` |
| Windows | winget | Ya viene incluido en Windows 10 y 11. Compruébalo con `winget --version`. |
| Linux | apt | Ya viene incluido en Ubuntu y Debian. Otros sistemas: usa tu propio gestor de paquetes (`dnf`, `pacman`). |

### Git {#git}

Git descarga el código de ejemplo desde GitHub.

| Sistema | Instalación |
| --- | --- |
| macOS | `xcode-select --install` (se abre una ventana, elige **Install**), o `brew install git` |
| Windows | `winget install --id Git.Git -e`, o descárgalo de [git-scm.com](https://git-scm.com/download/win) |
| Linux | `sudo apt install -y git` |

Compruébalo:

```bash
git --version
```

Deberías ver una línea como `git version 2.40.0`. Sirve cualquier versión.

### Node.js 22.13 o posterior {#node}

Node.js ejecuta los proyectos de TypeScript. Hardhat 3, la herramienta de contratos que se usa aquí, se niega a arrancar con cualquier versión anterior a Node.js 22.13.

| Sistema | Instalación |
| --- | --- |
| macOS | `brew install node`, o descarga el instalador LTS de [nodejs.org](https://nodejs.org) |
| Windows | `winget install --id OpenJS.NodeJS.LTS -e`, o descarga el instalador LTS de [nodejs.org](https://nodejs.org) |
| Linux (Ubuntu, Debian) | `curl -fsSL https://deb.nodesource.com/setup_22.x \| sudo -E bash -` y luego `sudo apt install -y nodejs` |

:::note Linux: no uses el paquete apt predeterminado
En Ubuntu y Debian, `sudo apt install nodejs` instala una versión antigua, demasiado baja. Usa la línea de NodeSource de arriba.
:::

Compruébalo:

```bash
node -v
```

Deberías ver `v22.13.0` o superior, por ejemplo `v22.20.0` o `v24.1.0`. Si ves un número más bajo, instala de nuevo y abre una terminal nueva.

### pnpm 9 o posterior {#pnpm}

pnpm instala las librerías que necesita un proyecto de TypeScript. Hace el mismo trabajo que `npm`, solo que más rápido.

Instálalo en cualquier sistema con la propia herramienta de instalación de Node.js, `npm`:

```bash
npm install -g pnpm
```

| Parte | Qué hace |
| --- | --- |
| `npm install` | Descarga e instala un programa. |
| `-g` | Abreviatura de "global": lo instala para todo tu ordenador, no para una sola carpeta. |
| `pnpm` | El programa que se instala. |

En macOS y Linux, si termina con `EACCES` o "permission denied", ejecútalo de nuevo como `sudo npm install -g pnpm`.

:::caution Node.js de Homebrew no incluye pnpm
Si un tutorial dice `pnpm: command not found` (o `zsh: command not found: pnpm`), todavía no has instalado pnpm. Ejecuta `npm install -g pnpm`, abre una terminal nueva e inténtalo otra vez.
:::

Compruébalo:

```bash
pnpm -v
```

Deberías ver `9.0.0` o superior, por ejemplo `10.4.1`.

### curl y jq (solo para la guía del Workshop 1) {#curl-jq}

`curl` descarga una dirección web desde la terminal. Lo usas para leer tu transacción desde el endpoint REST público. `jq` filtra la respuesta larga para que veas solo la parte que quieres. `jq` es opcional.

| Sistema | curl | jq |
| --- | --- | --- |
| macOS | Incluido. | `brew install jq` |
| Windows | Incluido en Windows 10 y 11 como `curl.exe`. | `winget install --id jqlang.jq -e` |
| Linux | `sudo apt install -y curl` si falta | `sudo apt install -y jq` |

Compruébalos:

```bash
curl --version
jq --version
```

Deberías ver una línea de versión para cada uno, por ejemplo `jq-1.7`.

:::note Windows PowerShell: escribe curl.exe
En PowerShell la palabra corta `curl` es otro comando integrado distinto. Escribe `curl.exe` en lugar de `curl` en todos los comandos de estas páginas. Si usas Git Bash, funciona `curl` a secas.
:::

### Rust 1.88 o posterior (solo para el tutorial de Rust) {#rust}

Rust compila la aplicación de línea de comandos `qday-pay`. Lo instalas con `rustup`, el instalador oficial de Rust. También instala `cargo`, la herramienta de compilación de Rust.

| Sistema | Instalación |
| --- | --- |
| macOS | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (pulsa Retorno para aceptar la opción predeterminada). Las herramientas del compilador vienen con `xcode-select --install`. |
| Windows | Descarga y ejecuta `rustup-init.exe` desde [rustup.rs](https://rustup.rs), o usa `winget install --id Rustlang.Rustup -e`. Cuando pida las Visual Studio C++ Build Tools, acepta: Rust las necesita para compilar programas en Windows. |
| Linux | `sudo apt install -y build-essential curl` y luego `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (pulsa Retorno para aceptar la opción predeterminada) |

Compruébalo:

```bash
rustc --version
cargo --version
```

Deberías ver `rustc 1.88.0` o superior y una línea de versión de `cargo`. Si ya tienes Rust, `rustup update` lo deja al día.

### Java 21 y Maven (solo para el tutorial de Java) {#java}

La aplicación Tip Jar necesita un JDK de Java 21 o posterior (las herramientas para compilar y ejecutar Java) y Maven, la herramienta de compilación que descarga las librerías de Java.

| Sistema | Instalación |
| --- | --- |
| macOS | `brew install --cask temurin@21` y luego `brew install maven` (o usa el instalador de [adoptium.net](https://adoptium.net)) |
| Windows | `winget install --id EclipseAdoptium.Temurin.21.JDK -e`, y luego descarga Maven desde [maven.apache.org/download.cgi](https://maven.apache.org/download.cgi), descomprímelo y añade su carpeta `bin` al `PATH`. Camino más fácil: instala WSL (ver más abajo) y sigue la línea de Linux. |
| Linux | `sudo apt install -y openjdk-21-jdk maven` |

Compruébalos:

```bash
java -version
mvn -version
```

Deberías ver `openjdk version "21` (o un número superior como 25) y `Apache Maven 3.` seguido de una versión. Si `java -version` muestra 17 o menos, instala Java 21 y abre una terminal nueva.

### Python 3.10 o posterior con venv (solo para el tutorial de Python) {#python}

Python ejecuta la aplicación Airdrop. `venv` crea una carpeta privada para sus librerías, de modo que no se toca nada más de tu ordenador.

| Sistema | Instalación |
| --- | --- |
| macOS | `brew install python`, o descárgalo de [python.org](https://www.python.org/downloads/) |
| Windows | `winget install --id Python.Python.3.12 -e`, o descárgalo de [python.org](https://www.python.org/downloads/) y marca **Add python.exe to PATH** en el instalador |
| Linux | `sudo apt install -y python3 python3-venv python3-pip` |

Compruébalo:

```bash
python3 --version
```

Deberías ver `Python 3.10.0` o superior. En Windows, escribe `python --version` en su lugar (el comando es `python`, no `python3`).

### Windows y los comandos de Linux: WSL {#wsl}

La mayoría de los comandos de los tutoriales son iguales en todos los sistemas. Unos pocos usan funciones del shell de Linux: `source`, `chmod`, `./tipjar` y `sleep`. En Windows tienes dos opciones:

1. **Windows nativo.** Usa PowerShell para los tutoriales de TypeScript, Rust y Python. Los tutoriales dan la variante de Windows donde difiere, por ejemplo `.venv\Scripts\activate`. Para el tutorial de Java, usa **Git Bash** (se instala con Git).
2. **WSL.** El Subsistema de Windows para Linux te da un Linux de verdad dentro de Windows. Abre PowerShell como administrador, ejecuta el comando de abajo, reinicia y luego sigue las líneas de **Linux** de esta página dentro de la ventana de Ubuntu.

```powershell
wsl --install
```

| Parte | Qué hace |
| --- | --- |
| `wsl` | La herramienta del Subsistema de Windows para Linux. |
| `--install` | Instala WSL y el sistema Linux Ubuntu en un solo paso. |

## Comprueba todo de una vez {#check-all}

Ejecuta los comandos de las herramientas que instalaste. Cada uno debe imprimir una versión.

```bash
git --version
node -v
pnpm -v
rustc --version
java -version
mvn -version
python3 --version
```

| Comprobación | Respuesta correcta |
| --- | --- |
| `node -v` | `v22.13.0` o superior |
| `pnpm -v` | `9.0.0` o superior |
| `rustc --version` | `rustc 1.88.0` o superior |
| `java -version` | `21` o superior |
| `mvn -version` | `Apache Maven 3.` y una versión |
| `python3 --version` | `Python 3.10.0` o superior |

## Consigue una wallet de testnet {#wallet}

Necesitas un lugar donde guardar QOR de prueba. Algunos tutoriales te crean una cuenta desechable en un archivo. Otros usan la wallet **QoreX**, la wallet oficial de QoreChain, cambiada a la testnet. La tabla de [¿Qué herramientas necesita cada tutorial?](#which-tools) indica cuál es cuál.

### QoreX en testnet {#qorex}

1. Instala QoreX desde la ficha oficial: [App Store](https://apps.apple.com/us/app/qorex-wallet/id6791256626) para iPhone, [Google Play](https://play.google.com/store/apps/details?id=network.qore.qorex) para Android, [Chrome Web Store](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) para Chrome, Brave, Edge, Arc y Opera, o [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/qorex/). La lista completa está en la [visión general de QoreX](/qorex/overview).
2. Crea una wallet **nueva** y guarda la frase de recuperación en papel. No importes una frase que contenga fondos reales.
3. Cambia la wallet a la testnet:
   - **App del móvil:** abre **Settings** y activa **Use testnet (developers)**.
   - **Extensión del navegador:** desbloquéala y pulsa 7 veces el **número de versión al final de la pantalla**. Aparece una opción de desarrollador. Elige **Switch to testnet (diana)**.
4. Comprueba que se muestra la insignia de testnet. La testnet se llama `qorechain-diana`.

**Lo que deberías ver:** una insignia de testnet en la wallet y una dirección `qor1...` en la pantalla de inicio. Los saldos de testnet no muestran valor en dólares, y eso es correcto.

### Añade una cuenta Ethereum (coin 60) {#coin-60}

El tutorial del Guestbook usa el carril EVM, así que la wallet necesita una cuenta de tipo Ethereum.

1. En QoreX, abre la lista de cuentas y elige **Add an Ethereum account (coin 60)**.
2. Crea una nueva. No restaures una frase que contenga fondos reales.
3. Selecciona esa cuenta. Muestra una dirección `0x...`.

**Lo que deberías ver:** una cuenta etiquetada *Ethereum, coin 60*, con una dirección que empieza por `0x`. La misma cuenta tiene también una dirección `qor1...`.

Más sobre las cuentas: [Cuenta de QoreX y Dashboard](/qorex/account-and-dashboard) y [Primeros pasos con QoreX](/qorex/getting-started).

## Consigue QOR de prueba en el faucet {#faucet}

El faucet entrega QOR de prueba gratis a una dirección de testnet. Una cuenta nueva debe recibir algo antes de poder hacer nada, porque cada transacción paga una pequeña comisión de red.

1. Abre [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet) en tu navegador.
2. Inicia sesión en el Dashboard de QoreChain.
3. Pega tu dirección `qor1...` en el cuadro de dirección.
4. Selecciona **Request Tokens**.
5. Espera a que aparezca **Tokens Sent!**.

**Lo que deberías ver:** la tarjeta **Tokens Sent!** con 100 QOR y un enlace **View on Explorer**.

El faucet entrega **100 QOR una vez cada 24 horas por cuenta** y por dirección. Si lo pides antes de tiempo muestra **Rate Limit Reached**. Espera a que pasen las 24 horas. Una sola solicitud basta para todos los tutoriales de esta página.

### Tu primera transacción registra tu clave poscuántica {#first-tx}

Cada cuenta de QoreChain tiene dos claves: una clave clásica y una clave poscuántica ML-DSA-87. La primerísima transacción de una cuenta nueva **registra la clave ML-DSA-87 en la cadena**. Ocurre una sola vez por cuenta y cuesta unos **0,09 QOR**. Después, cada transacción se firma con las dos claves.

Para ver cómo se crea la clave y se vincula a tu cuenta, lee [Cómo se vincula tu clave poscuántica a tu cuenta](/build-before-qday/key-binding).

Los tutoriales ejecutan este paso por ti con un comando llamado `register`. Ahora no tienes que hacer nada. Los 100 QOR del faucet lo cubren de sobra muchas veces.

## QOR y uqor {#units}

Verás dos nombres para la misma moneda. **QOR** es la moneda entera. **uqor** es la porción más pequeña.

**1 QOR = 1.000.000 uqor.**

| Lo que ves | Qué significa |
| --- | --- |
| `1` QOR | 1.000.000 uqor |
| `0.1` QOR | 100.000 uqor |
| `0.09` QOR | 90.000 uqor |
| `0.15uqor` | Un precio de 0,15 uqor por cada unidad de gas, que se usa cuando pagas una comisión |

Las wallets y la mayoría de los comandos usan QOR. La cadena misma cuenta en uqor. Un **memo** es un fragmento de texto corto que adjuntas a una transacción, como `Hello from the workshop`. Cualquiera puede leerlo en la cadena, así que nunca pongas un secreto en un memo.

El **gas** es la medida del trabajo que una transacción pide hacer a la red. La comisión es el gas usado multiplicado por el precio del gas. Las herramientas de esta sección estiman el gas por ti, así que no calculas nada.

## Mantén a salvo tus claves desechables {#key-hygiene}

Un tutorial crea un secreto para tu cuenta de testnet y lo guarda en tu ordenador. Trátalo con cuidado, aunque el QOR de prueba no tenga valor, para crear el hábito antes de la mainnet.

1. **Dónde se guarda.** En los tutoriales de TypeScript los secretos van en un archivo llamado `.env` en la carpeta del proyecto. Las aplicaciones de Rust, Java y Python escriben un archivo de clave con el comando `new`, en una carpeta oculta llamada `.config/qday` dentro de tu carpeta personal. El tutorial indica el archivo exacto.
2. **No lo compartas nunca.** No lo pegues en un chat, un correo, una captura de pantalla ni un vídeo. Oculta el archivo cuando compartas tu pantalla.
3. **No lo subas nunca a un repositorio.** No añadas `.env` ni un archivo de clave a Git, y nunca los subas a GitHub. Añade `.env` a `.gitignore` si un proyecto todavía no lo ignora.
4. **Solo testnet.** No reutilices nunca una clave, una frase de recuperación o un código de recuperación de testnet en la mainnet.
5. **Bórralo al terminar.** Cuando termines un tutorial, borra el archivo de clave o `.env`. Siempre puedes crear una cuenta nueva en un minuto.

:::danger Fondos reales
No pongas nunca la clave, el mnemónico (frase de recuperación) ni el código de recuperación de una cuenta que tenga fondos reales en un archivo `.env`, en un archivo de clave ni en ningún comando de esta sección.
:::

## La red y los endpoints públicos {#network}

| Servicio | Valor |
| --- | --- |
| Nombre de la testnet | `qorechain-diana` |
| ID de cadena EVM | 9800 |
| REST (leer datos por la web) | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| JSON-RPC de EVM | `https://evm-testnet.qore.host` |
| Explorador | [explore.qore.network](https://explore.qore.network), y luego cambia a **Testnet** |
| Faucet | [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet) |

## Solución de problemas {#troubleshooting}

| Lo que ves | Por qué | Qué hacer |
| --- | --- | --- |
| `pnpm: command not found` | pnpm no está instalado. Node.js no lo incluye, tampoco cuando se instala con Homebrew. | Ejecuta `npm install -g pnpm`, abre una terminal nueva y ejecuta `pnpm -v`. |
| `node: command not found`, o una versión antigua tras la instalación | La terminal estaba abierta durante la instalación, o la versión antigua tiene prioridad. | Cierra la terminal, abre una nueva y ejecuta `node -v`. En Linux usa la línea de NodeSource, no el paquete apt predeterminado. |
| `ERROR: You are using Node.js ... which is not supported by Hardhat` | Node.js es anterior a la 22.13. | Instala Node.js 22.13 o posterior y vuelve a ejecutar `pnpm install` en el proyecto. |
| `EACCES` o permiso denegado durante `npm install -g pnpm` | Tu usuario no puede escribir en la carpeta global. | Ejecuta `sudo npm install -g pnpm` en macOS y Linux. |
| `rustc: command not found` tras instalar Rust | La terminal aún no conoce el nuevo `PATH`. | Abre una terminal nueva. Si sigue fallando, ejecuta `source "$HOME/.cargo/env"`. |
| `linker 'cc' not found` o `link.exe not found` al compilar Rust | Faltan las herramientas del compilador de C. | macOS: `xcode-select --install`. Linux: `sudo apt install -y build-essential`. Windows: instala las Visual Studio C++ Build Tools. |
| `java -version` muestra 17 o menos | Una versión más antigua de Java tiene prioridad. | Instala Java 21, abre una terminal nueva y comprueba de nuevo. |
| PowerShell dice que la ejecución de scripts está deshabilitada al activar el venv de Python | Windows bloquea los scripts por defecto. | Ejecuta `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, responde `Y` y activa de nuevo. |
| `Rate Limit Reached` en el faucet | El faucet paga una vez cada 24 horas por cuenta y por dirección. | Espera a que pasen las 24 horas. Una solicitud basta para todos los tutoriales. |
| La wallet no muestra la insignia de testnet | La wallet sigue en mainnet. | App del móvil: Settings y luego **Use testnet (developers)**. Extensión: pulsa 7 veces el número de versión y luego **Switch to testnet (diana)**. |
| `account has no PQC key and classical fallback is disabled` | La cuenta nueva no ha registrado su clave ML-DSA-87. | Ejecuta primero el paso `register` del tutorial (es la primera transacción de la cuenta). |
| Errores de CORS en la consola del navegador | El endpoint REST público no envía cabeceras CORS, así que una página web no puede llamarlo directamente. | Llama al endpoint a través del proxy `/lcd` del proyecto, como hace la plantilla. |

## Siguiente paso {#next}

Elige un tutorial en la [visión general](/build-before-qday/overview#choose) y síguelo desde el primer comando.
