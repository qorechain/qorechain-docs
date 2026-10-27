---
slug: /light-node/overview
title: Visión general del nodo ligero
sidebar_label: Visión general
sidebar_position: 1
---

# Visión general del nodo ligero

El **nodo ligero de QoreChain** es un cliente pequeño que sigue una red QoreChain sin ejecutar un nodo completo y que puede registrarse on-chain como nodo ligero para participar en la **parte del 3% de recompensas para nodos ligeros**. Es para operadores que quieren una forma de bajo coste de seguir la cadena y de ganar con esa parte, y para quienes solo quieren una segunda opinión sobre el hash del último bloque de la cadena sin fiarse de un único servidor RPC. Es un único binario autónomo en dos ediciones construidas a partir del mismo código: **SX** (`lightnode-sx`, un daemon sin interfaz con línea de comandos, para servidores) y **UX** (`lightnode-ux`, el mismo daemon más un panel web local en `127.0.0.1:8420`). Se publica bajo la licencia Apache 2.0, y el código fuente es público en `github.com/qorechain/qorechain-lightnode`.

Ejecutar y sincronizar un nodo no requiere licencia. Participar en la parte de recompensas es un paso aparte: requiere una licencia `lightnode_operator`, stake delegado a validadores bonded y un registro on-chain (consulta [Cómo acceder](#how-to-access)).

El nodo ligero tiene su **propia línea de versiones**, separada de la versión de lanzamiento de la cadena. En el momento de redactar esto (27 de octubre de 2026), los canales de versiones de ambas redes llevan el nodo ligero **3.1.12** (cadena `v3.2.4` en mainnet, `v3.2.6` en la testnet). Trata los dos números como no relacionados.

## Innovaciones {#innovations}

Cada elemento siguiente es un mecanismo que puedes comprobar en el código fuente o ejecutando el nodo.

- **Firma híbrida nativa, sin ningún otro software.** El nodo construye y firma sus propias transacciones en Go puro (sin CGO, sin bibliotecas nativas, sin `qorechaind`). Cada transacción lleva una firma ML-DSA-87 (FIPS 204) sobre el cuerpo sin la extensión PQC, más una firma secp256k1 sobre el SignDoc cuyo cuerpo lleva esa extensión. La versión del formato de firma se lee de los planes de actualización aplicados de la cadena. Existen compilaciones para Linux, macOS y Windows en amd64 y arm64 (desde 3.1.8).
- **Un único conjunto de palabras de recuperación da ambas claves.** `keys add-operator --recover` deriva la clave de la cuenta en `m/44'/118'/0'/0/0`, la misma ruta que usan `qorechaind` y Keplr. Para la clave poscuántica, o bien reconstruye a partir de las mismas palabras la clave que un monedero ya registró en esa cuenta (las derivaciones del wallet-adapter y del Dashboard, la misma que `qorechaind tx pqc recover-key`), o bien deriva una nueva, de modo que las palabras también restauran la clave del nodo (desde 3.1.9).
- **El registro es un solo comando, comprobado paso a paso.** `register` comprueba la licencia, asocia la clave poscuántica (con una prueba de posesión cuando la cadena lo admite), delega solo el stake que falta si pasas `--delegate-to` y luego registra. Cada paso debe estar en un bloque antes de enviar el siguiente. El stake solo se cuenta en validadores bonded, tal como lo cuenta la cadena (desde 3.1.10).
- **Los heartbeats se cronometran a partir del registro propio de la cadena.** El daemon envía un heartbeat cuando han pasado 1.000 bloques desde el `last_heartbeat` del nodo según la cadena, lo comprueba cada 60 segundos y solo da un heartbeat por enviado cuando ya está en un bloque. Un reinicio ni envía un duplicado ni espera un intervalo entero.
- **Verificación cruzada de cabeceras entre endpoints.** El nodo obtiene la misma altura de su endpoint primario y de cada endpoint testigo configurado, y almacena la cabecera solo si todos devuelven el mismo hash. Se rechaza un testigo en el mismo host que el primario, o en una dirección `http://` remota en texto plano. El modo se registra por cabecera a nivel de depuración como `assurance` (`trusted-single-source` o `corroborated-across-sources`). Esto **no** es verificación de consenso: consulta [Límites](#limits).
- **Autoactualización firmada.** Desde el nodo ligero 3.1.11 el daemon lee el `latest.json` de su red cada 6 horas. Solo instala una versión nueva si `v<version>/SHA256SUMS.sig` se verifica como una firma Ed25519 de una clave de versión incorporada en el binario (la firma vincula la red, la versión y el contenido de `SHA256SUMS`), el binario descargado coincide con su checksum firmado y el nuevo binario se ejecuta e informa exactamente `v<version>`. El binario anterior se conserva como `<name>.old` y el nodo se reinicia en el sitio (el mismo proceso en Linux y macOS; en Windows arranca el nuevo binario y el antiguo termina). `[update] mode` es `auto` (predeterminado), `notify` u `off`; `lightnode-sx update --check` y `lightnode-sx update` hacen lo mismo a mano. En un contenedor, o donde la carpeta del binario no es escribible, el nodo solo anuncia una versión (línea de registro, `GET /api/update` en la API local y un banner en el panel UX).
- **Avisos que coinciden con lo que hace la cadena.** Con `[delegation] rebalance_enabled` activado (el valor predeterminado), el nodo avisa cuando un validador al que delegas está en jail, cuando no está en el conjunto activo y cuando tu stake bonded cae por debajo de `min_delegated_stake` (1.000 QOR). En los tres casos la cadena deja de acreditar al nodo sin ningún mensaje. Se registra un aviso cuando aparece, cada hora mientras dura y una vez cuando desaparece. Un cuarto aviso, la puntuación de reputación de un validador delegado por debajo de `min_reputation` (predeterminado `0.5`), lee `GET /qorechain/reputation/v1/validator/<valoper>`: está activo ahora en la **testnet** y llega a mainnet solo con una versión de la cadena posterior a v3.2.5; hasta que la ruta se sirva, el nodo lo anota una vez y vuelve a preguntar cada 6 horas.

### Por qué ejecutar un nodo ligero y cómo leer la verificación cruzada {#why-run-a-light-node}

- **Participa en la parte de recompensas.** Los nodos ligeros registrados y activos que cumplen las reglas de stake y de tiempo de actividad cobran de la parte del 3% descrita [más abajo](#the-3-light-node-reward-share).
- **Verifica de forma cruzada el estado de la cadena que se te muestra.** Sin ningún testigo configurado, el nodo registra una advertencia al arrancar e informa `trusted-single-source`: un único endpoint gestionado honestamente informa el mismo valor que uno comprometido. Añade un testigo gestionado de forma independiente para pasar a `corroborated-across-sources`, que necesita que todos los endpoints configurados estén comprometidos a la vez para engañarlo. El valor aparece en las líneas `synced header` del registro de depuración (establece `log_level = "debug"`); no se muestra en `status` ni en el panel, y nada central puede verlo, porque tus elecciones de RPC son locales a tu configuración.
- **Vigila la red.** La telemetría cubre validadores, consenso, el puente y tokenomics, actualizados en intervalos independientes.

## Cómo usarlo {#how-to-use}

Elige una edición. Ambas leen el mismo `config.toml`, almacenan datos en el mismo directorio principal (`~/.qorechain-lightnode`) y usan el mismo keyring.

| Edición | Binario | Diseñado para | Interfaz |
| --- | --- | --- | --- |
| **SX** (Server eXperience) | `lightnode-sx` | Servidores sin interfaz, automatización | Daemon más CLI completa. Consulta [Edición SX](/light-node/sx-edition). |
| **UX** (User eXperience) | `lightnode-ux` | Uso de escritorio y de operador | Los mismos comandos más un panel web local. Consulta [Edición UX](/light-node/ux-edition). |

**1. Descarga y verifica** (se muestra Linux amd64; se usa `jq` para leer el manifiesto). Toma la versión del manifiesto de la red a la que apuntas:

```bash
NET=mainnet            # or testnet
V=$(curl -fsS https://download.qore.host/$NET/lightnode/latest.json | jq -r .version)
F=lightnode-sx-linux-amd64          # see the artifact list in latest.json for other platforms
curl -fsSLO https://download.qore.host/$NET/lightnode/v$V/$F
curl -fsSLO https://download.qore.host/$NET/lightnode/v$V/SHA256SUMS
grep " $F\$" SHA256SUMS | sha256sum -c -        # macOS: shasum -a 256 -c -
chmod +x $F
```

En Windows, compara `certutil -hashfile lightnode-sx-windows-amd64.exe SHA256` con el valor del manifiesto. El `SHA256SUMS` específico de la versión debe coincidir con el binario específico de la versión, así que toma ambos de la ruta `v$V`.

**2. Configura y registra.** La secuencia siguiente es la que muestra el Dashboard; se ejecutó en una devnet, en la testnet (ensayo el 18 de octubre de 2026) y para el primer nodo de mainnet (20 de octubre de 2026).

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'

./lightnode-sx onboard                  # PQC self-test, chain RPC (see below), node key
./lightnode-sx keys add-operator --recover   # recovery words on standard input; no flag = new account, 24 words shown once
./lightnode-sx register --delegate-to qorvaloper1...   # needs the licence and QOR in the operator account
./lightnode-sx start
./lightnode-sx status
```

El RPC de la cadena para `onboard` es `https://rpc.qore.host` (mainnet) o `https://rpc-testnet.qore.host` (testnet). Para la edición UX usa `lightnode-ux` con los mismos comandos y abre `http://127.0.0.1:8420`. Detalles de cada paso: [Edición SX](/light-node/sx-edition) y [Registro y licenciamiento](/light-node/registration-and-licensing).

**3. Mantenlo actualizado.** El nodo ligero 3.1.11 y posteriores se actualizan solos fuera de contenedores (consulta el elemento de autoactualización más arriba). Un nodo en 3.1.10 o anterior debe instalar 3.1.12 a mano una vez: descarga el binario versionado como arriba y sustituye el archivo. Con Docker, recompila desde la nueva etiqueta de código fuente. Consulta [Edición SX: actualización](/light-node/sx-edition#updating).

## Cómo acceder {#how-to-access}

| | Mainnet | Testnet |
| --- | --- | --- |
| Cadena | `qorechain-vladi` (cadena `v3.2.4`) | `qorechain-diana` (cadena `v3.2.6`) |
| RPC para el nodo | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| REST para consultas | `https://api.qore.host` | `https://api-testnet.qore.host` |
| Versión del nodo ligero | 3.1.12 | 3.1.12 |
| Licencia | $50, comprada en el Dashboard; la concesión se firma a mano por lotes | Gratuita, de autoservicio: **Nodes & Validators > Light Node**, **Request licence**; se firma automáticamente, normalmente en unos minutos |

**Qué necesitas para registrarte**

- Una cuenta cuyas palabras de recuperación tengas tú (tus propias palabras, Keplr o una clave de `qorechaind`), preferiblemente dedicada al nodo. Un monedero custodial del Dashboard no puede ejecutar un nodo a menos que exportes su semilla.
- Una licencia `lightnode_operator` activa en esa dirección (consulta más abajo).
- Al menos **1.000 QOR** delegados desde esa dirección a validadores **bonded**, contados como total.
- QOR en la cuenta para la comisión de registro de **1 QOR** y las comisiones de transacción. Un heartbeat cuesta 0.25 uqor por gas con el límite predeterminado de 300.000 de gas, es decir, 0,075 QOR como techo (gas usado medido: unos 165.000).
- Un ordenador que permanezca encendido: el nodo debe enviar un heartbeat cada 1.000 bloques y mantener al menos un 80% de tiempo de actividad para cobrar.

**Conseguir una licencia.** En el Dashboard, abre **Nodes & Validators** (la entrada de la barra lateral que antes se llamaba **Tools**; la página sigue estando en `/tools`), elige la pestaña **Light Node** y selecciona la red en la cabecera. El Dashboard requiere iniciar sesión.

- *Mainnet:* introduce primero la dirección `qor1...`, elige la red USDT y paga $50. La pestaña muestra **Paid, awaiting on-chain grant** hasta que la cadena confirma la concesión.
- *Testnet:* no se vende nada. Introduce tu dirección `qor1...` en **Free testnet licence** y selecciona **Request licence**. Hay una solicitud por cuenta y una por dirección. La pestaña muestra "Granted to ..." cuando la licencia ha llegado, o indica que la concesión no se pudo firmar y te permite volver a solicitarla.

También puedes comprobar una licencia directamente: `GET /qorechain/license/v1/check/<address>/lightnode_operator`.

### Estado del programa de recompensas {#reward-program-status}

:::note El registro está abierto
El registro está abierto en mainnet (`qorechain-vladi`, cadena v3.2.4) y en testnet (`qorechain-diana`, cadena v3.2.6). El 27 de octubre de 2026 se habían concedido siete licencias `lightnode_operator` en mainnet y había un nodo ligero registrado en cada red (`total_registered` es `1` en `GET /qorechain/lightnode/v1/stats` en ambas). La contabilidad de recompensas está activa en ambas redes desde la actualización v3.2.0. El tiempo de actividad se cuenta **desde el bloque en que tu nodo se registra**, así que ejecutar un nodo antes no genera crédito. Desde la cadena v3.2.4 el límite por nodo también comienza en el propio registro del nodo: la primera liquidación tras registrarse acredita solo lo acumulado desde entonces.

El manifiesto de versión (`https://download.qore.host/<net>/lightnode/latest.json`) lleva la señal oficial en su campo `registration.open`. Para el estado en vivo, consulta `GET /qorechain/license/v1/holders/lightnode_operator` y `GET /qorechain/lightnode/v1/stats` en `https://api.qore.host` (mainnet) o `https://api-testnet.qore.host` (testnet).
:::

## La parte del 3% de recompensas para nodos ligeros {#the-3-light-node-reward-share}

La distribución de comisiones de QoreChain asigna una **parte fija del 3% a los nodos ligeros** (el parámetro `reward_share`, `0.03`). Consulta [Tokenomics](/architecture/tokenomics) para el desglose completo del 37% / 30% / 20% / 10% / 3% (validadores, quemado, tesorería, stakers, nodos ligeros).

Ese 3% es lo que se abona a la cuenta del módulo de nodos ligeros; no es un derecho por nodo. Cada 100 bloques la cadena acredita a cada nodo elegible su parte ponderada por stake de lo acumulado desde la liquidación anterior, **limitada por nodo**. Desde la cadena v3.2.3 el límite es de **2.000 QOR por nodo cada 30 días** (`max_reward_per_month_per_node`, `2000000000` uqor), prorrateado según el tiempo de bloque transcurrido desde la liquidación anterior y escalado por el tiempo de actividad del nodo; es la regla `lightnode-monthly-cap`. Antes de v3.2.3 el límite se expresaba por bloque (`max_reward_per_block_per_node`, `1713` uqor), valor que la consulta del pool de recompensas sigue informando. El límite es un techo, no una cantidad prometida. Todo lo que no se gana se traslada a una reserva que solo una votación de gobernanza puede liberar, de modo que no se acumula ningún bote para quien se registre primero. Puedes inspeccionar el reparto en vivo con `GET /qorechain/lightnode/v1/reward_pool`.

Para ser elegible para recompensas, un nodo ligero debe estar **registrado on-chain y activo** (probando su liveness con heartbeats), mantener al menos el stake bonded mínimo y mantener su tiempo de actividad igual o superior al mínimo. El registro y el licenciamiento se tratan en [Registro y licenciamiento](/light-node/registration-and-licensing); cómo se acreditan, reclaman y monitorizan las recompensas se trata en [Recompensas y monitorización](/light-node/rewards-and-monitoring).

## Dónde está publicado {#where-published}

| Qué | Dónde | Versión actual |
| --- | --- | --- |
| Manifiesto de versión, mainnet | `https://download.qore.host/mainnet/lightnode/latest.json` | 3.1.12 (`minCompatible` 3.1.9, registro abierto) |
| Manifiesto de versión, testnet | `https://download.qore.host/testnet/lightnode/latest.json` | 3.1.12 (`minCompatible` 3.1.9, registro abierto) |
| Binarios | `https://download.qore.host/<net>/lightnode/v<version>/<file>` | 12 archivos por versión (SX y UX, Linux, macOS y Windows, amd64 y arm64) más `SHA256SUMS` |
| Código fuente y versiones | `github.com/qorechain/qorechain-lightnode` (Apache 2.0) | Versión `v3.1.12` (actual) y etiquetas anteriores; cada una incluye los 12 binarios, `SHA256SUMS`, `lightnode-build.json` y un APK de vista previa para Android |
| Android | Adjunto solo a la versión de GitHub | Vista previa: sigue la cadena, no se registra, no gana |
| Docker | Se compila desde la etiqueta de código fuente (consulta [Edición SX: Docker](/light-node/sx-edition#docker)) | No se publica ninguna imagen en un registro para descargas anónimas |

Comprueba la `version` del manifiesto de tu red antes de descargar, en lugar de fiarte de esta tabla. La clave de firma de versiones está incorporada en el binario; no hay nada que instalar por tu parte.

## Límites y problemas conocidos {#limits}

- **No es un cliente ligero de protocolo.** El nodo corrobora hashes de bloque entre endpoints. No comprueba firmas de commit, cambios del conjunto de validadores ni un periodo de confianza, por lo que no verifica el consenso de la cadena. `trust_period` y `max_clock_drift` de la configuración se aceptan pero no se usan.
- **Las recompensas son un techo.** El límite por nodo (2.000 QOR cada 30 días) es un máximo, y el nodo cobra solo lo que se acumula en el pool y solo mientras es elegible.
- **Un heartbeat es una firma de liveness.** Demuestra que la clave del operador firmó a tiempo, no que el software completo se ejecutara de forma continua.
- **Los avisos de reputación son solo de testnet por ahora.** Mainnet todavía no sirve puntuaciones de reputación por validador, así que en mainnet esa comprobación no se ejecuta y el nodo lo dice en su registro. Los avisos de jail, de fuera del conjunto activo y de stake bajo no dependen de ella. Las versiones del nodo anteriores a 3.1.11 registraban una comprobación de reputación fallida cada cinco minutos y nunca avisaban de nada.
- **La autoactualización empieza en 3.1.11.** Un nodo en 3.1.10 o anterior no se actualiza solo y necesita una instalación manual de 3.1.12. En un contenedor o en una carpeta no escribible, el nodo solo anuncia nuevas versiones.
- **No hay imagen de Docker que descargar.** Compila desde la etiqueta de código fuente; los paquetes de contenedor publicados todavía no son públicos. Los nodos Docker nunca se actualizan solos.
- **Android es una vista previa** y no se registra ni gana.
- **Licencias.** Las concesiones de mainnet se firman a mano por lotes, así que hay una espera entre el pago y el registro. La licencia de testnet se limita a una por cuenta y una por dirección.
- **Un monedero creado en el Dashboard no puede ejecutar un nodo** a menos que exportes su semilla, porque el nodo debe firmar con claves que tengas tú.

## Adónde ir a continuación

- [Edición SX](/light-node/sx-edition): instala, configura y ejecuta el daemon de servidor.
- [Edición UX](/light-node/ux-edition): ejecuta la edición con panel web.
- [Registro y licenciamiento](/light-node/registration-and-licensing): obtén una licencia y regístrate on-chain.
- [Recompensas y monitorización](/light-node/rewards-and-monitoring): cómo se acredita y reclama la parte del 3%, y cómo mantener el nodo en buen estado.
- [Tokenomics](/architecture/tokenomics): cómo encaja la parte de recompensas para nodos ligeros en la economía más amplia.
