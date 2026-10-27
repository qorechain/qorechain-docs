---
slug: /developer-tools/pq-light-client
title: Cliente ligero PQ
sidebar_label: Cliente ligero PQ
sidebar_position: 31
---

# Cliente ligero PQ (`qorechain-pq-light-client`)

`qorechain-pq-light-client` es una especificación en borrador y un verificador de referencia para checkpoints firmados con ML-DSA-87 (FIPS 204). En el diseño propuesto, los validadores firman un checkpoint corto al final de cada época con una clave de checkpoint ML-DSA-87 independiente, y un cliente ligero sigue la cadena de checkpoints verificando esas firmas y nada más. Está pensado para investigadores de protocolos, desarrolladores de relayers y puentes, y equipos de otras cadenas que quieren revisar el diseño y probarlo. Versión **0.1.0**, Apache-2.0, mantenido por la Asociación QoreChain.

**La cadena no admite estos checkpoints, y no hay nada programado.** QoreChain no produce los checkpoints que verifica este paquete, ni en la mainnet (`qorechain-vladi`) ni en la testnet (`qorechain-diana`). Ninguna versión de la cadena los admite y no hay ninguna actualización ni fecha prevista. Las claves de consenso de los validadores son hoy ed25519, no post-cuánticas. El paquete no puede seguir una red en vivo: funciona con conjuntos de validadores simulados y los vectores de prueba compartidos. No convierte en post-cuántica ninguna ruta, puente ni canal IBC de QoreChain.

## Innovaciones {#innovations}

- **Checkpoints en lugar de firmas por bloque.** Los validadores firmarían un checkpoint por época (ID de cadena, época, altura, hora, hash de cabecera, hash de app, el hash del conjunto firmante y el hash del conjunto siguiente). Las firmas viajarían en transacciones ordinarias, de modo que la producción de bloques nunca las espera, y el volumen de datos queda muy por debajo del de firmar cada bloque. La especificación (sección 12) da el razonamiento.
- **Una clave de checkpoint independiente con prueba de posesión.** Cada validador registraría una clave de checkpoint ML-DSA-87, independiente de su clave de consenso y de cualquier clave de cuenta, con una prueba de posesión sobre `"qorechain-pqlc-key-pop-v1|" || chain_id || operator address || consensus address || public key`.
- **Traspaso del conjunto por el conjunto saliente.** Un checkpoint se acepta cuando lo han firmado validadores que tienen estrictamente más de dos tercios del poder del conjunto nombrado por el último checkpoint de confianza, de modo que los cambios del conjunto de validadores siempre los firma el conjunto saliente. Exactamente dos tercios no es un quórum, y la firma de alguien que no es miembro invalida el checkpoint en lugar de omitirse.
- **Una codificación por objeto.** El checkpoint, el conjunto de validadores y el checkpoint firmado tienen codificaciones canónicas, y los decodificadores aceptan exactamente una codificación para cada uno. Un relayer reenvía los bytes canónicos sin cambios.
- **Orden fijo de comprobaciones.** `verifyCheckpoint` ejecuta las comprobaciones en un orden especificado, de modo que TypeScript, Rust y Go devuelven el mismo código de error para la misma entrada.
- **Evidencia de mala conducta.** Dos checkpoints distintos para una misma época, cada uno con un quórum, son mala conducta. `detectMisbehaviour` devuelve ambos checkpoints en un orden canónico, los firmantes dobles y su poder.
- **Tres lenguajes, un solo conjunto de vectores.** Los vectores compartidos (`vectors/pq-light-client-v1.json`) proceden de un simulador determinista y cubren cadenas de checkpoints de 4 y 21 validadores, rotaciones del conjunto, todos los rechazos que puede producir el verificador, checkpoints en conflicto y casos de decodificador. Go, Rust y TypeScript los superan todos, así que una cuarta implementación puede demostrar que coincide byte a byte.

## Casos de uso {#use-cases}

1. **Los desarrolladores de relayers prototipan una ruta de actualización post-cuántica.** Un relayer en Rust guarda un estado de confianza por red, decodifica y verifica cada checkpoint firmado, reenvía los mismos bytes al destino y se detiene ante `CONFLICTING_CHECKPOINT`. Hoy se ejecuta sobre los vectores o una cadena simulada propia; la guía del relayer del repositorio muestra el bucle.
2. **Los equipos de IBC y de puentes evalúan el diseño.** La sección 14 de la especificación asigna los checkpoints a un tipo de cliente ligero de IBC (estado del cliente, estado de consenso, mala conducta, pruebas de pertenencia en las alturas de checkpoint). Los equipos pueden revisar la asignación y sus compromisos antes de que exista nada en la cadena. Es una nota de diseño; no existe código para ella.
3. **Los equipos de cadenas EVM o de Solana comparan diseños de verificador.** La sección 15 compara la verificación ML-DSA-87 en la cadena, una prueba STARK de la verificación y un conjunto de attestors, incluyendo qué opciones conservan la propiedad post-cuántica y cuáles la pierden. También son solo notas de diseño. Como referencia, la propia EVM de QoreChain tiene un precompilado de verificación ML-DSA (`pqcVerify`, 0x0A01) que está activo solo en la testnet; consulta [Precompilados de EVM](/developer-guide/evm-precompiles).
4. **Los revisores de seguridad e investigadores comprueban las reglas.** El orden de las comprobaciones, la regla del quórum, el traspaso del conjunto, el periodo de confianza y la evidencia de mala conducta están especificados y son comprobables en tres lenguajes.
5. **Los equipos que hablan de rutas redactan bien sus afirmaciones.** La página de posición del repositorio define cuándo una ruta puede llamarse post-cuántica (consulta [Límites](#limits)).
6. **Implementadores en otros lenguajes.** Los vectores permiten que una nueva implementación demuestre que coincide con la de referencia.

## Cómo funciona {#how-it-works}

Todo lo de esta sección es el diseño propuesto, y todo ello requiere soporte de la cadena que no está programado.

1. Cada validador registra una clave de checkpoint ML-DSA-87 con una prueba de posesión (arriba).
2. Al final de cada época, los validadores firman un checkpoint: ID de cadena, época (estrictamente creciente), altura, hora, hash de cabecera, hash de app, el hash del conjunto que firma este checkpoint y el hash del conjunto que firma el siguiente.
3. Un cliente ligero acepta un checkpoint firmado por más de dos tercios del poder del conjunto que nombró su último checkpoint de confianza.
4. Dos checkpoints distintos para una misma época, cada uno con un quórum, son mala conducta; la evidencia nombra a los firmantes dobles.

El consenso por bloque no cambiaría. Las alturas dentro de una época siguen siendo clásicas hasta el siguiente checkpoint; un cliente que necesite la garantía post-cuántica usa las alturas de checkpoint y acepta hasta una época de latencia.

**Formatos** (todos los enteros en big-endian, byte de versión `0x01`):

| Objeto | Disposición | Tamaño |
|---|---|---|
| Checkpoint | versión, longitud y bytes del ID de cadena, época, altura, hora, hash de cabecera, hash de app, hash del conjunto de validadores, hash del siguiente conjunto de validadores | `154 + len(chain_id)` bytes (169 para `qorechain-vladi`) |
| Conjunto de validadores | versión, recuento (de 1 a 256), y por validador: dirección de 20 bytes, poder de 8 bytes, clave ML-DSA-87 de 2,592 bytes, ordenados por dirección | `3 + 2,620 x validators` bytes |
| Checkpoint firmado | versión, checkpoint, recuento de firmas, por firmante una dirección de 20 bytes y una firma de 4,627 bytes (ordenadas por dirección), indicador de siguiente conjunto, siguiente conjunto cuando el conjunto cambia | `173 + 4,647 x signers` bytes para `qorechain-vladi`, más el siguiente conjunto cuando está presente |

**Firma y hash.** ML-DSA-87, modo puro de FIPS 204, contexto vacío, sobre `"qorechain-pqlc-checkpoint-v1|" || encode(checkpoint)`. La firma determinista y la hedged son ambas válidas. El hash es SHAKE-256 con salida de 32 bytes; el hash del conjunto de validadores usa el prefijo `qorechain-pqlc-valset-v1|`.

**Orden de verificación** (`verifyCheckpoint`): estructura, ID de cadena, caducidad de la confianza, deriva del reloj, tratamiento de la misma época (idéntico da `NOT_NEWER`; distinto con un quórum da `CONFLICTING_CHECKPOINT`), avance de época, altura y hora, el conjunto firmante es igual al siguiente conjunto de confianza, el siguiente conjunto incluido coincide con su hash, quórum. Un fallo deja intacto el estado de confianza. Una época posterior puede aceptarse directamente mientras el conjunto firmante no cambie; tras una rotación, hay que verificar todos los checkpoints desde la rotación en adelante.

**Confianza.** Un cliente parte de una raíz de confianza elegida fuera del protocolo, como en cualquier cliente ligero de proof-of-stake. El periodo de confianza debe ser más corto que el periodo durante el cual un validador todavía puede ser penalizado; pasado ese periodo, el cliente debe reinicializarse.

La especificación es `spec/pq-light-client-v1.md` en el repositorio (estado: borrador, abierta a revisión). La sección 10 (claves de checkpoint, firma, épocas, penalizaciones en la cadena) es un diseño para revisión, no un compromiso.

## Cómo usarlo {#how-to-use}

### Instalación {#install}

| Lenguaje | Instalación | Plataforma mínima |
|---|---|---|
| TypeScript | `npm install @qorechain/pq-light-client` | Node.js 20.19 o posterior, y navegadores. Depende de `@qorechain/pqc` 0.2.3 |
| Rust | `cargo add qorechain-pq-light-client` (biblioteca `qorechain_pq_light_client`) | Rust estable; depende de `qorechain-pqc` 0.2.3; sin `unsafe`, sin E/S |
| Go | `go get github.com/qorechain/qorechain-pq-light-client/go@v0.1.0` (paquete `pqlightclient`) | Go 1.25; depende de `github.com/qorechain/qorechain-pqc/go` v0.2.3 |

No hay paquete en PyPI, y no está previsto ninguno.

### Inicio rápido (sin conexión, TypeScript) {#quickstart}

Nada toca una red de QoreChain. El script sigue la cadena simulada de checkpoints de 21 validadores de los vectores compartidos (ID de cadena `qorechain-sim-21`, con una rotación del conjunto en la época 2) y después muestra que la fuente en vivo no está disponible. Las claves de los vectores son claves de prueba públicas.

```bash
mkdir pqlc && cd pqlc && npm init -y && npm pkg set type=module
npm install @qorechain/pq-light-client
curl -sLO https://raw.githubusercontent.com/qorechain/qorechain-pq-light-client/v0.1.0/vectors/pq-light-client-v1.json
```

```js
// follow.mjs: a TypeScript port of the repository's Rust relayer example.
import { readFileSync } from "node:fs";
import {
  PqLightClientError,
  decodeSignedCheckpoint,
  decodeValidatorSet,
  fetchCheckpoint,
  newTrustedState,
  verifyCheckpoint,
} from "@qorechain/pq-light-client";

const v = JSON.parse(readFileSync("pq-light-client-v1.json", "utf8"));
const hex = (s) => Uint8Array.from(Buffer.from(s, "hex"));

const root = decodeSignedCheckpoint(hex(v.signedCheckpoints["c21-e0-root"].encoded));
const set = decodeValidatorSet(hex(v.validatorSets.C21.encoded));
let state = newTrustedState({
  checkpoint: root.checkpoint,
  signatures: root.signatures,
  validatorSet: set,
  nextValidatorSet: set,
  trustingPeriod: 1_209_600n, // 14 days
  maxClockDrift: 10n,
});

for (const id of ["c21-e1", "c21-e2-rotate", "c21-e3"]) {
  const signed = decodeSignedCheckpoint(hex(v.signedCheckpoints[id].encoded));
  state = verifyCheckpoint(state, signed, signed.checkpoint.time + 5n);
  console.log(`trusted epoch ${state.checkpoint.epoch} at height ${state.checkpoint.height}`);
}

try {
  await fetchCheckpoint("https://rpc.example.invalid", state.checkpoint.chainId, 4n);
} catch (e) {
  if (e instanceof PqLightClientError) console.log("live source:", e.code);
}
```

Ejecutado el 27 de octubre de 2026 contra el paquete 0.1.0 publicado en npm y los vectores de la etiqueta v0.1.0, `node follow.mjs` imprimió:

```
trusted epoch 1 at height 11000
trusted epoch 2 at height 12000
trusted epoch 3 at height 13000
live source: REQUIRES_CHAIN_SUPPORT
```

El archivo de vectores pesa unos 2.4 MB. El original en Rust es `rust/examples/relayer.rs` en el repositorio (`cargo run --example relayer`); no se ejecutó para esta página.

Gestión de errores en TypeScript (del README del paquete):

```ts
try {
  trusted = verifyCheckpoint(trusted, decodeSignedCheckpoint(bytes), BigInt(Math.floor(Date.now() / 1000)));
} catch (e) {
  if (e instanceof PqLightClientError && e.code === "CONFLICTING_CHECKPOINT") {
    report(e.misbehaviour);
  }
}
```

Lo mismo en Go:

```go
signed, err := pqlightclient.DecodeSignedCheckpoint(b)
if err != nil {
	return err
}
next, err := pqlightclient.VerifyCheckpoint(trusted, signed, uint64(time.Now().Unix()))
if errors.Is(err, pqlightclient.ErrConflictingCheckpoint) {
	// err.(*pqlightclient.Error).Misbehaviour holds the evidence
}
```

### API principal {#api}

La API es la misma en los tres lenguajes (camelCase en TypeScript, PascalCase en Go, snake_case en Rust). Los campos de 64 bits son `bigint` en TypeScript.

| Nombre | Qué hace |
|---|---|
| `Checkpoint`, `ValidatorSet`, `SignedCheckpoint`, `TrustedState`, `Misbehaviour` | tipos de datos |
| `encodeCheckpoint`, `decodeCheckpoint` | codificación canónica del checkpoint; decodificador estricto |
| `encodeValidatorSet`, `decodeValidatorSet`, `hashValidatorSet` | codificación del conjunto de validadores y su hash SHAKE-256 |
| `encodeSignedCheckpoint`, `decodeSignedCheckpoint` | los bytes que transporta un relayer |
| `encodeCheckpointSignBytes` | los sign-bytes, `"qorechain-pqlc-checkpoint-v1|" || encode(checkpoint)` |
| `newTrustedState` | de raíz de confianza a estado de confianza (comprueba que ambos conjuntos tengan como hash los valores del checkpoint; no verifica firmas) |
| `verifyCheckpoint(trusted, signed, now)` | verificación completa; devuelve el nuevo estado de confianza o un error tipado |
| `detectMisbehaviour(set, a, b)` | evidencia de checkpoints en conflicto, o nada |
| `signCheckpoint` | firma un checkpoint con una clave secreta ML-DSA-87 (simuladores y pruebas) |
| `CheckpointSource`, `fetchCheckpoint`, `chainCheckpointSource` (TypeScript) o `ChainCheckpointSource` (Rust, Go) | interfaces para una futura API de nodo; hoy siempre fallan con `REQUIRES_CHAIN_SUPPORT` y no hacen ninguna petición |
| `PqLightClientError` (TypeScript), `*Error` con `ErrInsufficientPower` y similares (Go, usa `errors.Is`), `Error` con `code()` (Rust) | errores tipados con códigos estables |

Códigos de error, compartidos por los tres lenguajes, y qué debería hacer un relayer (de la guía del relayer):

| Error | Acción |
|---|---|
| `MALFORMED` | descartar los bytes; la fuente es defectuosa |
| `CHAIN_ID_MISMATCH` | error de configuración |
| `TRUST_EXPIRED` | detenerse; reinicializar desde una nueva raíz de confianza |
| `FUTURE_CHECKPOINT` | revisar el reloj local; reintentar más tarde |
| `NOT_NEWER` | nada nuevo; esperar |
| `SET_MISMATCH` | falta un checkpoint con una rotación del conjunto; obtener las épocas intermedias |
| `UNKNOWN_VALIDATOR`, `BAD_SIGNATURE` | descartar el checkpoint |
| `INSUFFICIENT_POWER` | esperar más firmas |
| `CONFLICTING_CHECKPOINT` | dejar de reenviar e informar de la evidencia |
| `REQUIRES_CHAIN_SUPPORT` | esperado hoy |

## Cómo acceder {#how-to-access}

- **Mainnet `qorechain-vladi` y testnet `qorechain-diana`:** no se producen checkpoints, así que los verificadores no pueden seguir ninguna de las dos redes. Ninguna versión de la cadena los admite y ninguna está programada.
- Lo que hacen hoy las redes: las claves de consenso de los validadores son ed25519, las vote extensions están desactivadas e IBC usa el tipo estándar de cliente ligero 07.
- **Para ejecutar el paquete** no necesitas nada más que el entorno de ejecución del lenguaje. Sin cuenta, sin claves, sin endpoint, sin coste. Los vectores usan claves de prueba públicas y los ID de cadena `qorechain-sim` y `qorechain-sim-21`.
- Solo como referencia (este paquete no los usa): REST `https://api.qore.host` y `https://api-testnet.qore.host`, RPC `https://rpc.qore.host` y `https://rpc-testnet.qore.host`.

## Dónde se publica {#where-published}

Comprobado el 27 de octubre de 2026 contra cada registro.

| Registro | Paquete | Versión | Enlace |
|---|---|---|---|
| npm | `@qorechain/pq-light-client` | 0.1.0 (`latest`) | [npmjs.com](https://www.npmjs.com/package/@qorechain/pq-light-client) |
| crates.io | `qorechain-pq-light-client` | 0.1.0 | [crates.io](https://crates.io/crates/qorechain-pq-light-client) |
| Proxy de módulos de Go | `github.com/qorechain/qorechain-pq-light-client/go` | v0.1.0 (etiqueta `go/v0.1.0`) | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-pq-light-client/go) |

Código fuente: [github.com/qorechain/qorechain-pq-light-client](https://github.com/qorechain/qorechain-pq-light-client) (release v0.1.0, código fuente, sin binarios). Licencia Apache-2.0.

## Límites y problemas conocidos {#limits}

- **No convierte en post-cuántica a QoreChain, ni a ningún canal IBC, puente o relayer.** Las claves de consenso de los validadores no son hoy post-cuánticas, y no hay programada ninguna actualización que lo cambie.
- **No puede seguir una red en vivo.** `fetchCheckpoint` siempre falla con `REQUIRES_CHAIN_SUPPORT`. Funciona con conjuntos de validadores simulados y los vectores compartidos.
- **La especificación es un borrador, abierto a revisión.** Nada de lo que contiene es un compromiso.
- **Notas de diseño sin código:** el tipo de cliente IBC (sección 14) y los verificadores de EVM y Solana (sección 15).
- **Las alturas dentro de una época siguen siendo clásicas.** Incluso con checkpoints, la verificación post-cuántica se aplicaría en las alturas de checkpoint.
- **Qué puede llamarse ruta post-cuántica.** Una ruta puede llamarse post-cuántica cuando ambos extremos verifican el estado del otro extremo firmado de forma post-cuántica, en ambas direcciones, sin ningún paso clásico: ningún cliente ligero clásico en ninguno de los extremos, ningún envoltorio SNARK basado en emparejamientos, ningún comité de attestors clásico. Las firmas de cuenta post-cuánticas por sí solas no hacen que una ruta sea post-cuántica. Las cuentas de QoreChain firman con ML-DSA-87 y secp256k1; descríbelo como "firmas de cuenta post-cuánticas", no como una ruta post-cuántica.
- **Las raíces de confianza son subjetivas.** El protocolo no puede proteger a un cliente que parte de una equivocada.
- **Pre-1.0.** Las versiones menores pueden cambiar la API.

Redacción sugerida por la página de posición del repositorio:

| Situación | Redacción |
|---|---|
| Las cuentas firman con ML-DSA-87 | "firmas de cuenta post-cuánticas" |
| Un extremo verifica checkpoints post-cuánticos, el otro no | "verificación post-cuántica del estado de QoreChain en la cadena X; la ruta de vuelta es clásica" |
| Ambos extremos verifican estado firmado de forma post-cuántica, sin ningún paso clásico | "ruta post-cuántica" |

Hasta que ambos extremos cumplan la regla, describe una ruta por lo que realmente verifica, por ejemplo "protegida por el cliente ligero clásico de la contraparte".

## Notas de seguridad {#security}

- El paquete no guarda claves y no hace E/S. Rust no tiene código `unsafe`; en TypeScript y Go, `fetchCheckpoint` no hace ninguna petición.
- Los decodificadores son estrictos: una codificación por objeto, y se rechaza cualquier otra longitud de firma o de clave. Los relayers deben reenviar los bytes canónicos sin cambios, nunca una recodificación.
- Las firmas de validadores ajenos al conjunto invalidan un checkpoint en lugar de omitirse, lo que mantiene a todas las implementaciones en el mismo resultado.
- Mantén sincronizado el reloj del verificador: un reloj adelantado hace caducar la confianza antes de tiempo, y uno atrasado rechaza los checkpoints nuevos como `FUTURE_CHECKPOINT`.
- El diseño supone que los validadores que tienen más de dos tercios del poder de cada conjunto de checkpoint no firman nada salvo checkpoints que su propio nodo ha confirmado.
- Los dominios de firma propuestos (`qorechain-pqlc-checkpoint-v1|`, `qorechain-pqlc-key-pop-v1|`) son propuestas; hoy no están reservados en la cadena.
- Las claves de los vectores son claves de prueba públicas; no las uses nunca para nada más.
- Informa de las vulnerabilidades en privado a security@qore.network.

## Páginas relacionadas {#related}

- [Biblioteca PQC](/developer-tools/pqc-library): los enlaces de ML-DSA-87 y SHAKE-256 que hay bajo los verificadores.
- [QoreSign](/qoresign/overview): firmas ML-DSA-87 a nivel de cuenta, que son algo distinto de los checkpoints de los validadores.
- [Seguridad Post-Cuántica](/architecture/post-quantum-security): el modelo post-cuántico de la cadena hoy.
- [Arquitectura del Puente](/architecture/bridge-architecture) y [Transferencia de activos mediante puente](/user-guide/bridging-assets): las rutas entre cadenas de hoy usan el cliente ligero clásico estándar.
- [QoreSeal](/developer-tools/qoreseal): el otro kit post-cuántico 0.1.0 publicado el 27 de octubre de 2026.
- [Resumen de paquetes para desarrolladores](/developer-tools/overview).
