---
slug: /qorex/dapp-integration
title: Integrar una dApp con QoreX
sidebar_label: Integración de dApps
sidebar_position: 8
---

# Integrar una dApp con QoreX

Esta es la guía completa para un desarrollador que quiere que una aplicación web funcione con la wallet QoreX: cómo detectarla, conectarse, enviar transacciones de QoreChain, firmar mensajes, usar EVM y Solana, gestionar los rechazos y generar enlaces que abren QoreX. Cubre la extensión de navegador QoreX y el navegador de dApps integrado en la app QoreX, e indica en qué se diferencian. Los ejemplos de código se comprobaron con el propio código de la wallet.

## Innovaciones {#innovations}

- **La página nunca tiene la clave poscuántica.** `signAndBroadcast` recibe tus mensajes; QoreX los muestra decodificados, añade la capa ML-DSA-87 que solo la wallet puede crear y difunde. cosmjs, cosmos-kit e Interchain Kit funcionan sin cambios mediante `getOfflineSigner`, y QoreX añade la misma capa cuando la transacción no la tiene.
- **Detección por capacidad, no por versión.** `window.qorex.native.capabilities` enumera lo que hace una compilación, así que una sola ruta de código funciona en todas las versiones.
- **No se apropia de nada.** QoreX se anuncia con EIP-6963 y el Solana Wallet Standard, nunca define `window.keplr` y nunca sobrescribe el `window.ethereum` de otra wallet.
- **Firma de mensajes con una mitad poscuántica.** `signArbitrary` firma con la clave clásica de la cuenta (ADR-36) y con ML-DSA-87. Un servidor verifica ambas con `@qorechain/qoresign` contra la clave registrada en la cadena.
- **EVM en QoreChain, explicado al usuario.** `personal_sign`, `eth_signTypedData_v4` y `eth_sendTransaction` se decodifican en el dispositivo, se simulan cuando el nodo lo permite, y la aprobación abre la ventana de autorización por transacción que necesita el carril EVM de QoreChain.
- **Sin firma a ciegas, y una lista corta de cosas que un sitio nunca puede pedir.** Un mensaje que QoreX no puede mostrar se rechaza, y los mensajes exclusivos de la wallet (gestión de claves, reglas de gasto, ventanas, autorizaciones) se rechazan desde cualquier sitio.
- **Enlaces que un servicio puede generar.** Abrir una página en la app, pedir un pago firmado con la propia clave del destinatario o entregar una propuesta de agente.

## Qué inyecta QoreX {#injected}

En cada página, QoreX añade un objeto, `window.qorex`, con tres proveedores:

| Proveedor | Qué es |
|---|---|
| `window.qorex.native` | El carril de QoreChain (Cosmos). Estilo Keplr: `enable`, `getKey`, `signAndBroadcast`, `signDirect`, `signArbitrary`, `verifyArbitrary`, `getOfflineSigner*`, además de una lista `capabilities`. No es un reemplazo directo de Keplr. |
| `window.qorex.evm` | Un proveedor EIP-1193 para el carril EVM de QoreChain (y, en la extensión, Ethereum). También se anuncia mediante EIP-6963. |
| `window.qorex.svm` | Un proveedor de Solana. En la extensión, las dApps de Solana normalmente encuentran QoreX a través del Wallet Standard. |

Lo que QoreX no hace:

- Nunca define `window.keplr`. El código que busque Keplr no encontrará QoreX; detecta `window.qorex`.
- Nunca sobrescribe `window.ethereum`. La extensión no lo define en absoluto. El navegador integrado de la app define `window.ethereum` solo cuando ninguna otra wallet lo ha hecho. Elige QoreX por su nombre EIP-6963, no por `window.ethereum`.
- `signAmino` y `sendTx` no existen (consulta [cosmjs](#cosmjs)).

## Detectar QoreX {#detection}

**EVM.** Escucha los anuncios EIP-6963 y elige aquel cuyo `rdns` sea `network.qore.qorex`:

```ts
const wallets = new Map<string, EIP6963ProviderDetail>();
window.addEventListener("eip6963:announceProvider", (event) => {
  const detail = (event as CustomEvent<EIP6963ProviderDetail>).detail;
  wallets.set(detail.info.rdns, detail);
});
window.dispatchEvent(new Event("eip6963:requestProvider"));

const qorex = wallets.get("network.qore.qorex"); // undefined when QoreX is not there
```

**Carril nativo de QoreChain.** Comprueba `window.qorex?.native` y lee sus capacidades. Compruébalas en lugar de un número de versión:

```js
const native = window.qorex?.native;
const can = (name) => native?.capabilities?.includes(name) === true;
```

| Capacidad | Extensión | App |
|---|---|---|
| `signAndBroadcast` | 0.3.5 | 1.2.1 (método presente desde 1.1.5) |
| `signDirectAddsPqcLayer` | 0.4.0 | 1.2.1 (comportamiento desde 1.2.0) |
| `signArbitrary` | 0.4.0 | 1.2.1 (método presente desde 1.2.0) |
| `listAccounts`, `connectProofPicksAccount`, `executeRequest` | 0.3.x | no en la app |

La app 1.2.0 tiene los métodos pero no declara capacidades; para cubrirla, recurre a `typeof window.qorex?.native?.signArbitrary === "function"`. `executeRequest` es el puente del Dashboard, que funciona solo para `dashboard.qorechain.io` (consulta [Puente del Dashboard](/qorex/browser-extension#dashboard-bridge)); los demás sitios no lo necesitan. Las compilaciones 1.2.5 y 0.4.5 declaran las mismas capacidades que antes.

**Extensión o app.** Una página no puede preguntar con cuál de las dos está hablando, ni debería necesitarlo. Las diferencias que importan están en la tabla siguiente.

| | Extensión (escritorio) | App (navegador de dApps integrado) |
|---|---|---|
| Carril nativo de QoreChain | sí | sí |
| Firma EVM en QoreChain | sí | sí |
| EVM en Ethereum (`wallet_switchEthereumChain` a `0x1`, por sitio) | sí | no, solo la red activa de QoreChain |
| Eventos EVM (`connect`, `accountsChanged`, `chainChanged`) | los tres | solo `connect`: el navegador se cierra para cambiar de cuenta o de red |
| Solana (Wallet Standard) | sí | no, el navegador integrado no firma transacciones de Solana |
| Puente del Dashboard (`connectProof`, `executeRequest`) | sí, solo `dashboard.qorechain.io` | no |
| Abrir una página desde un enlace | no aplica | enlaces `browse` (consulta [Enlaces](#links)) |

Consulta [Extensión de navegador](/qorex/browser-extension) y [Navegador de dApps](/qorex/dapp-browser) para ver el lado del usuario de cada una.

## Conectar {#connect}

Conectarse requiere una aprobación por sitio, que revela solo la dirección pública:

```js
await window.qorex.native.enable("qorechain-vladi"); // once per site; mainnet chain id
const key = await window.qorex.native.getKey("qorechain-vladi");
// key.bech32Address is the qor1... address; key.algo is "secp256k1", or "ethsecp256k1" for a coin-60 account
```

EVM:

```js
const [account] = await qorex.provider.request({ method: "eth_requestAccounts" });
```

`eth_accounts` devuelve una lista vacía hasta que el usuario ha aprobado el sitio, y nunca abre una ventana por sí mismo. `enable` y `eth_requestAccounts` sí abren la wallet cuando está bloqueada (consulta [Wallet bloqueada](#locked)).

La extensión emite un evento de ventana, `qorex_keystorechange`, cuando cambia la cuenta, la wallet o la red. Las aprobaciones se guardan por wallet y el usuario puede revocar un sitio en cualquier momento en **Sitios conectados**.

## Enviar una transacción de QoreChain: `signAndBroadcast` {#sign-and-broadcast}

Toda transacción de QoreChain desde una cuenta con una clave poscuántica registrada debe llevar una firma híbrida: secp256k1 **y** ML-DSA-87. Solo la wallet tiene la clave ML-DSA, así que una página no puede construir esa firma por sí misma. Envía los mensajes y QoreX hace el resto:

1. muestra al usuario los mensajes decodificados y la comisión,
2. construye la transacción para la cuenta que el usuario tiene seleccionada,
3. añade la firma híbrida (registrando antes la clave poscuántica de la cuenta si es su primera transacción),
4. difunde y resuelve con el resultado.

```js
const provider = window.qorex.native;
if (!provider.capabilities?.includes("signAndBroadcast")) {
  throw new Error("Please update QoreX");
}
await provider.enable("qorechain-vladi");              // connect, once per site

const res = await provider.signAndBroadcast({
  chainId: "qorechain-vladi",                          // must be the wallet's active network
  messages: [
    {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: MsgSend.encode(msgSend).finish(),         // protobuf bytes: Uint8Array,
    },                                                 // number[] or a base64 string
  ],
  memo: "",                                            // optional, at most 256 bytes
  gasLimit: 300000,                                    // optional: 100k to 5M, default 400k
});
// res = { txHash, code, height?, shield }
```

`shield` te dice si la transacción confirmada lleva la capa híbrida: `shielded` cuando la lleva, `downgraded` cuando se confirmó sin ella (informa de ese caso), y `pending` o `classical` en los demás casos.

**Reglas**

- `chainId` debe ser igual a la red activa de la wallet: `qorechain-vladi` (mainnet) o `qorechain-diana` cuando el usuario ha cambiado a testnet. Una discrepancia se rechaza con un mensaje que nombra ambas. **Una dApp no puede cambiar la red** (consulta [Testnet](#testnet)).
- De 1 a 32 mensajes por llamada. Los bytes de los mensajes se firman exactamente como los envías; la wallet no los vuelve a codificar.
- En la hoja de aprobación se muestra un memo de 256 bytes como máximo; sus saltos de línea y caracteres de control se muestran como sus códigos.
- Los mensajes exclusivos de la wallet se rechazan (consulta [Mensajes que un sitio nunca puede pedir](#wallet-only)).
- QoreX no firmará un mensaje que no pueda mostrar. Una solicitud así se rechaza con `QoreX cannot show what <type> does, so it will not sign it`, también dentro de `MsgExec`. Usa un tipo de mensaje que QoreX pueda decodificar.

**Gas y comisión**

- La comisión es `gasLimit` multiplicado por el precio de gas de la red (QoreX sigue el mínimo en vivo de la red), y se muestra antes de que el usuario apruebe.
- Tu `gasLimit` se mantiene entre 100,000 y 5,000,000; sin valor, es 400,000.
- Una transacción que ejecuta código CosmWasm o entre VM se simula primero, antes de la aprobación. QoreX pide al menos 1.3 veces el gas simulado, hasta 20,000,000, y se conserva un valor mayor de tu página. Una llamada que el contrato rechazaría se rechaza antes de la aprobación, con el motivo de la cadena. Si la llamada necesita más de 20,000,000, QoreX lo dice y la rechaza.
- Una transacción no puede superar el límite de gas por transacción de la propia red; QoreX rechaza una que lo supere antes de que se firme nada.

Un rechazo del usuario lanza `QoreX: signature rejected` con el código `4001`.

## cosmjs, cosmos-kit e Interchain Kit {#cosmjs}

`getOfflineSigner(chainId)`, `getOfflineSignerOnlyDirect(chainId)` y `getOfflineSignerAuto(chainId)` devuelven un `OfflineDirectSigner` de cosmjs, así que `SigningStargateClient` funciona sin cambios:

```js
const signer = window.qorex.native.getOfflineSigner("qorechain-vladi");
const client = await SigningStargateClient.connectWithSigner(rpc, signer, {
  gasPrice: GasPrice.fromString("0.15uqor"),
});
await client.sendTokens(from, to, [{ denom: "uqor", amount: "1000" }], "auto");
```

**La capa poscuántica que añade la wallet.** Cuando la transacción no lleva capa ML-DSA (que una página no puede crear), QoreX la añade: simula el coste de la capa, sube el gas y la comisión en la transacción, firma con ML-DSA-87 el cuerpo y la información de comisión elevada, y muestra al usuario la comisión final antes de que apruebe. Por eso tu comisión `"auto"` vuelve más alta en lo que cuesta la capa, decenas de miles de gas. Difunde siempre el documento `signed` que vuelve, no el que enviaste. Comprueba `capabilities.includes("signDirectAddsPqcLayer")` antes de depender de esto.

- La cuenta ya debe tener registrada su clave poscuántica; se registra con su primera transacción desde QoreX. De lo contrario, la llamada falla con el código `4100` y el motivo `pqc-key-missing`. Pide al usuario que envíe antes una transacción desde QoreX, o usa `signAndBroadcast`, que registra la clave por sí mismo.
- **Amino se rechaza.** `signAmino` y `getOfflineSignerOnlyAmino().signAmino` rechazan con el código `4200` y el motivo `amino-unsupported`, porque Amino JSON no puede llevar la firma híbrida. Configura tu biblioteca para la firma directa.
- Las cuentas importadas de MetaMask (coin 60) firman mediante `signAndBroadcast`; la extensión rechaza `signDirect`, y por tanto los firmantes de cosmjs, para ellas.
- `getKey` y `getAccounts` devuelven la cuenta activa.

En una aplicación web, el [wallet adapter](/developer-tools/wallet-adapter) y los paquetes de [integraciones de QoreX](/developer-tools/qorex-integrations) (RainbowKit, Interchain Kit, cosmos-kit) envuelven esta detección y estas llamadas por ti.

## `signDirect` {#sign-direct}

`signDirect` firma un `SignDoc` que construyó tu página. Si el cuerpo ya lleva una capa ML-DSA, QoreX la verifica contra la clave registrada de la cuenta, como hace la cadena, antes de que se abra ninguna ventana. Si no lleva ninguna, QoreX la añade como se describe arriba. Una capa que no coincide con la clave registrada, un mensaje exclusivo de la wallet, un mensaje que QoreX no puede mostrar o más de 1,000 mensajes se rechazan antes de que se abra ninguna aprobación. Para código nuevo, `signAndBroadcast` es más sencillo.

## Firmar un mensaje: `signArbitrary` y `verifyArbitrary` {#sign-arbitrary}

```js
const message = "Log in to example.com\nNonce: 1234";
const sig = await window.qorex.native.signArbitrary("qorechain-vladi", address, message);
const ok = await window.qorex.native.verifyArbitrary("qorechain-vladi", address, message, sig);
```

La firma sigue [QoreSign message-signing-v1](/qoresign/spec/message-signing-v1): ADR-36 con la clave clásica de la cuenta (secp256k1, o eth_secp256k1 para una cuenta coin-60), más ML-DSA-87 sobre `"qorechain-msg-v1|" + chainId + "|" + data`. También lleva los campos `pub_key` y `signature` de Keplr, así que el código escrito para Keplr puede leerla. El usuario ve el mensaje completo. Un mensaje debe tener entre 1 y 4096 bytes y no debe empezar con otro dominio de firma de QoreChain.

**Verifica en tu servidor, nunca en la página.** La mitad ML-DSA debe comprobarse contra la clave registrada en la cadena para esa dirección, nunca contra una clave que envíe el cliente. Usa [`@qorechain/qoresign`](/qoresign/overview):

```ts
import { verifyMessageWithChain } from "@qorechain/qoresign/network";

try {
  await verifyMessageWithChain({
    rest: "https://api.qore.host",     // the network's REST endpoint
    chainId: "qorechain-vladi",
    signer: address,                    // the qor1... address that signed
    data: message,                      // exactly the text you asked the user to sign
    signature: sig,                     // the object signArbitrary returned
  });
  // signed in
} catch (err) {
  // a QoreSignError with a stable code: the signature does not verify
}
```

`verifyMessageWithChain` obtiene la clave ML-DSA-87 registrada del firmante y lanza un `QoreSignError` cuando algo no se verifica. Una cuenta que nunca ha enviado una transacción en esa red todavía no tiene clave registrada y falla con `KEY_NOT_REGISTERED`: pide al usuario que envíe antes una transacción desde QoreX. Incluye en el mensaje un nonce de un solo uso y tu dominio, y comprueba ambos en el servidor, para que una firma no pueda reutilizarse en otro sitio. Las guías de QoreSign tratan con más detalle los mensajes de inicio de sesión.

## dApps EVM {#evm}

QoreX responde por EIP-6963 y, mediante su proveedor EIP-1193, firma `personal_sign`, `eth_signTypedData_v4` y `eth_sendTransaction` en el carril EVM de QoreChain (chain id **9801**, testnet **9800**). En la extensión también firma en Ethereum después de que el sitio llame a `wallet_switchEthereumChain` a `0x1` (por sitio). Los métodos de solo lectura (`eth_call`, `eth_getBalance`, `eth_getLogs` y las demás lecturas estándar) van al nodo de la red seleccionada. Cualquier otro método responde `4200`, y `wallet_switchEthereumChain` o `wallet_addEthereumChain` a cualquier cosa que no sea una cadena para la que QoreX firma responde `4902`. Un sitio no puede cambiar a la otra red de QoreChain: eso responde `4100` con `switch the network in QoreX itself`.

```js
const [from] = await qorex.provider.request({ method: "eth_requestAccounts" });
const hash = await qorex.provider.request({
  method: "eth_sendTransaction",
  params: [{ from, to, value: "0x0", data }],
});
```

**Lo que decodifica la aprobación.** Cada ventana dice qué se está autorizando, decodificado en el dispositivo: transferencias, permisos de tokens (uno ilimitado dice UNLIMITED), `setApprovalForAll`, firmas Permit y Permit2 y transacciones Safe (un DELEGATECALL se marca como de alto riesgo). Una llamada que QoreX no puede decodificar se muestra como desconocida y de alto riesgo y necesita un segundo toque. Las delegaciones EIP-7702 se rechazan.

**Simulación.** Antes de firmar, la ventana muestra lo que la transacción cambia en el saldo del usuario.

- Con `eth_simulateV1` (rastreo de transferencias) en el nodo, muestra los cambios en QOR y tokens.
- En un nodo sin `eth_simulateV1`, que es hoy el caso de los nodos EVM de QoreChain, solo está disponible `eth_call`, y eso dice si la llamada revertiría. Una llamada con datos muestra entonces "what it does to your tokens was not checked", y el usuario necesita un segundo toque para aprobar.
- Una transacción que fallaría, o que el nodo no puede simular, también necesita un segundo toque.
- La simulación va al mismo nodo que recibiría la transacción; no se envía nada a ningún otro sitio.

Diseña la página para que ese segundo toque no sorprenda: explica también en tu propia interfaz lo que hace la llamada.

**La ventana de autorización EVM, por transacción.** En QoreChain una transacción EVM se admite solo dentro de una ventana de autorización abierta por la firma híbrida ML-DSA-87 de la cuenta en el carril nativo. Cuando ninguna cubre la transacción, la misma aprobación abre una exactamente para esa transacción:

- con el valor más la comisión máxima como límite,
- durante unos diez minutos,
- limitada a los contratos que llama la transacción, cuando la red lo admite.

La aprobación nombra todos los contratos que la ventana admitiría (incluidos los contratos que verificaron recientemente una firma para el mismo sitio) y dice que sustituye cualquier ventana que el usuario tenga abierta. Si la red no puede limitar una ventana a contratos, QoreX pregunta una segunda vez, nombrando los contratos y diciendo que la ventana admitiría cualquier contrato, antes de abrir una ilimitada; un "no" no envía nada. El límite de QOR cubre todos los QOR que salen de la cuenta, comisión máxima incluida, y un contrato que la ventana permite llamar al usuario todavía puede actuar por la cuenta (tokens que tenga o haya aprobado, o QOR en poder de otros contratos). Consulta [Ventana de acceso EVM](/qorex/security-and-recovery#evm-window).

**Una ventana que el usuario abrió a mano.** Una ventana que el usuario abre en la pantalla de la ventana es por defecto **Solo transferencias de QOR**; permitir cualquier contrato es una opción aparte con una advertencia. Así que una ventana que el usuario abrió antes no cubrirá una llamada a un token o a un contrato. Una dApp que espere que exista una ventana debe dejar que QoreX abra la ventana por transacción (la forma más sencilla y la más estrecha) o decir al usuario que elija **Cualquier contrato** si abre una él mismo.

**Otras reglas de este carril**

- Solo las cuentas importadas de MetaMask (tipo de moneda 60) pueden enviar en el carril EVM de QoreChain. Otra cuenta responde `4100` y el mensaje indica al usuario los siguientes pasos.
- Los precompilados de staking, distribución, gobernanza, vesting, bank e IBC se rechazan (`4200`): en QoreChain eso pasa por el carril nativo.
- Las firmas en el carril EVM son clásicas (secp256k1). QoreX no afirma más que eso.
- Los datos tipados para una cadena distinta de la seleccionada se rechazan con `-32602`.

## dApps de Solana (extensión) {#solana}

La extensión se registra con el Solana Wallet Standard en la mainnet de Solana (`solana:mainnet`), así que las dApps de Solana la encuentran sin código personalizado. Funciones: connect, disconnect, events, `solana:signMessage`, `solana:signTransaction` y `solana:signAndSendTransaction`, para transacciones legacy y v0. Se admite `connect({ silent: true })`.

La aprobación decodifica transferencias de System, transferencias, aprobaciones, cambios de autoridad y cierres de cuenta de SPL Token y Token-2022, y muestra el texto de un memo. Una instrucción que QoreX no puede decodificar se marca en la hoja como ilegible y la aprobación necesita un segundo toque. Se rechaza una transacción que no incluya la wallet como firmante, y `signMessage` no firmará bytes que en realidad sean una transacción. Las firmas son clásicas y se marcan como tales.

El navegador integrado de la app no firma transacciones de Solana. Solana en la propia QoreChain es una función aparte, solo de testnet, dentro de la wallet: consulta [Funciones solo de testnet](/qorex/testnet-features).

## Cuando la wallet está bloqueada {#locked}

Desde la extensión 0.4.5 y Safari 1.8.2, una solicitud de firma hecha mientras QoreX está bloqueado (nativa, EVM o Solana) abre la wallet en la pantalla de contraseña, nombrando el sitio. Después de que el usuario desbloquea, la ventana se cierra y la solicitud muestra su propia aprobación. Si el usuario cierra la ventana, la solicitud se rechaza con el código `4001`. Antes de esto, una solicitud así fallaba de inmediato con "wallet is locked".

- `enable`, `getKey`, `eth_requestAccounts` y los métodos de firma despiertan la wallet de esta manera.
- Las lecturas que una página hace al cargar (`eth_accounts`, `eth_chainId`, lecturas de la cadena) nunca abren una ventana: `eth_accounts` simplemente devuelve una lista vacía.
- No se firma nada sin la contraseña, y una solicitud en espera recibe un "no" si el usuario cambia de wallet o vuelve a bloquear.

Trata `4001` como un resultado normal, no como un fallo.

## Mensajes que un sitio nunca puede pedir {#wallet-only}

QoreX rechaza estos desde cualquier sitio y por todas las rutas (`signAndBroadcast`, `signDirect`, una propuesta de agente), porque ceden autoridad permanente sobre la cuenta. El usuario los hace desde las propias pantallas de QoreX:

- gestión de claves poscuánticas: registrar, migrar y rotar una clave, la clave de cifrado y el registro multifirma PQC;
- autenticadores y reglas de gasto: registrar o revocar una clave de firma, reglas de gasto, crear una cuenta abstracta;
- abrir, cerrar y borrar la ventana EVM (y el consentimiento de delegación);
- abrir y cerrar la ventana de Solana en QoreChain, y el mensaje de retransmisión de Solana;
- una autorización authz (`MsgGrant`) de `MsgGrant` o `MsgExec`, porque una autorización así permitiría al beneficiario actuar como la cuenta.

El rechazo se aplica directamente, dentro de `MsgExec` a cualquier profundidad y como autorización genérica de uno de estos mensajes. El error dice `QoreX: <type> is managed by the wallet itself, not by a website`.

## Errores y eventos {#errors}

Los errores llevan un `code` de EIP-1193:

| Código | Significado |
|---|---|
| `4001` | El usuario rechazó o cerró la ventana (incluida la de desbloqueo). |
| `4100` | No autorizado: cuenta desconocida, sin clave poscuántica registrada (`reason: pqc-key-missing`), una cuenta coin-118 que intenta usar el carril EVM o una petición de cambiar la red. |
| `4200` | No admitido: Amino (`reason: amino-unsupported`), un método EVM que QoreX no firma, una delegación EIP-7702, un precompilado solo nativo. |
| `4901` | Cadena de Solana equivocada. |
| `4902` | Cadena desconocida. |
| `-32602` | Parámetros incorrectos (por ejemplo, datos tipados para otra cadena). |

Eventos:

- Proveedor EVM: `connect`, `accountsChanged` y `chainChanged` en la extensión; solo `connect` en la app.
- Carril nativo (extensión): el evento de ventana `qorex_keystorechange` cuando cambia la cuenta, la wallet o la red. cosmos-kit lo escucha.
- Solana Wallet Standard: `change`.

## Enlaces que un servicio puede generar {#links}

Tres enlaces abren QoreX desde otra página o app.

### Abrir una página en la app: `browse` {#link-browse}

```
https://link.qore.network/browse?url=<encodeURIComponent(https URL)>
qorex://browse?url=<encodeURIComponent(https URL)>
```

En un teléfono, el enlace abre tu página en el navegador de dApps de QoreX después de la solicitud biométrica habitual. La página debe ser `https://` en un nombre de dominio. QoreX rechaza el enlace si la página tiene:

- un puerto,
- un nombre de usuario o una contraseña,
- una dirección IP,
- `localhost`,
- una barra invertida o espacios en blanco,
- más de 2048 caracteres.

El enlace no da nada a la página. Esta sigue pidiendo conectarse, y cada firma sigue pasando por la hoja de aprobación. Si no hay wallet en el teléfono, la app se queda en la incorporación. Si QoreX no está instalado, la forma https muestra una página con un enlace para conseguirlo. La extensión no tiene enlace `browse`.

### Pedir un pago: `qorex://pay` {#link-pay}

```
qorex://pay?v=1&net=qorechain-vladi&to=qor1...&amt=1500000&d=uqor&id=pr_...&tag=...&pk=...&sig=...
```

Un enlace de solicitud de pago lleva el destinatario, el importe en unidades base, la denominación, un id de solicitud y su etiqueta de memo, una nota y un @handle opcionales, la red y una firma de todo ello con la propia clave de cuenta del destinatario. El QoreX del pagador comprueba la firma, que la clave firmante sea dueña de la dirección del destinatario, la red exacta y cualquier @handle, y luego muestra la revisión normal antes de enviar. Un importe o un destinatario alterados se detectan, y la solicitud se marca como pagada leyendo la cadena.

**Genéralo con la propia pantalla de solicitudes de QoreX** (app, **Solicitudes de pago**, **Nueva solicitud**) en lugar de a mano: la firma se hace con la clave de la cuenta, que una página nunca tiene. Considera no admitido un enlace que construyas o modifiques tú mismo. Todavía no hay una forma web del enlace.

### Entregar una propuesta de agente: `qorex://propose` {#link-propose}

```
qorex://propose?d=<base64url of the proposal JSON>
```

Solo en la app. El enlace lleva una transacción que propone un agente de IA; QoreX la valida, la simula y la muestra en la ventana de aprobación normal. Una propuesta nunca se firma tal cual, y un enlace puede llevar como máximo 64 KB. Consulta más abajo el [modelo de agentes de IA](#agents).

## Agentes de IA {#agents}

Si construyes un agente de IA que trabaja con una wallet, el modelo es que un agente puede leer lo que el usuario permita y **proponer** una transacción; nunca firma. QoreX comprueba y simula cada propuesta y el usuario la aprueba o la rechaza en la misma ventana de aprobación que usa una solicitud de dApp. Una propuesta de un mensaje exclusivo de la wallet se rechaza antes de que se abra ninguna ventana. En la extensión, un agente llega a QoreX a través de un programa complementario en el ordenador del usuario que todavía no se ha publicado; en la app, una propuesta se pega o llega como enlace `qorex://propose`. Para saber cómo lo activa el usuario y qué ve, lee [Modo desarrollador: agentes de IA](/qorex/developer-mode#ai-agents).

## Testnet {#testnet}

**Una dApp no puede cambiar la red.** El `chainId` de una solicitud debe coincidir con la red en la que está la wallet; una discrepancia se rechaza. Esto protege al usuario de una página que lo trasladaría a una red donde los fondos parecen iguales pero no lo son.

Para usar la testnet (`qorechain-diana`, EVM chain id 9800), el usuario la cambia en QoreX:

- **App:** Ajustes y luego **Usar testnet (desarrolladores)**.
- **Extensión:** activa el modo desarrollador (toca siete veces el número de versión en la parte inferior del popup) y luego **Cambiar a testnet (diana)**. **Volver a mainnet** regresa al valor predeterminado.

Entonces aparece un aviso TESTNET en cada pantalla, los saldos de testnet no muestran valor en USD y la red se vuelve a vincular sin reiniciar. Pide a tus usuarios que cambien antes de abrir tu página de testnet. Las funciones de la wallet exclusivas de testnet (IBC, la pantalla de QoreChain Bridge, Solana en QoreChain) se describen en [Funciones solo de testnet](/qorex/testnet-features).

## Solución de problemas {#troubleshooting}

| Lo que ves | Por qué, y qué hacer |
|---|---|
| `window.keplr` es undefined | Es así por diseño. Usa `window.qorex.native` o una biblioteca con un conector de QoreX. |
| `window.ethereum` no es QoreX | Es así por diseño. Selecciona la wallet mediante EIP-6963 (`rdns` `network.qore.qorex`). |
| `QoreX: chain X does not match the active network Y` | El usuario está en la otra red. Pídele que cambie en QoreX; tú no puedes. |
| `4100`, `pqc-key-missing` | La cuenta todavía no tiene clave poscuántica en la red. Pide al usuario que envíe una transacción desde QoreX, o usa `signAndBroadcast`. |
| `4200`, `amino-unsupported` | Tu biblioteca está pidiendo Amino. Configura la firma directa. |
| `QoreX: <type> is managed by the wallet itself, not by a website` | Un mensaje exclusivo de la wallet. Quítalo; el usuario lo hace desde QoreX. |
| `QoreX cannot show what <type> does, so it will not sign it` | Un mensaje que QoreX no puede decodificar. Usa un tipo que pueda mostrar. |
| `QoreX: send between 1 and 32 messages` | Divide la solicitud. |
| `QoreX: the memo may be at most 256 bytes` | Acorta el memo. |
| `QoreX: a message must be 1 to 4096 bytes` | Acorta el mensaje que pides firmar. |
| `needs about N gas, more than the 20,000,000 QoreX allows` | La llamada al contrato es demasiado pesada para una sola transacción. Divídela. |
| `QoreX: EVM method X not yet supported` (`4200`) | QoreX firma solo `personal_sign`, `eth_signTypedData_v4` y `eth_sendTransaction`. |
| `QoreX: this account uses the QoreChain (coin 118) key and cannot send on QoreChain's EVM lane` | Solo las cuentas importadas de MetaMask (coin 60) envían en el carril EVM. |
| `QoreX: staking, rewards, IBC and governance on QoreChain go through the native lane` | Usa el carril nativo para eso; los precompilados EVM se rechazan. |
| Una llamada EVM sigue necesitando un segundo toque | El nodo no puede comprobar qué hace la llamada con los tokens, o la llamada no se puede decodificar. Explícalo en tu página. |
| Una llamada a un token falla aunque el usuario abrió una ventana | Una ventana que el usuario abrió a mano cubre por defecto solo transferencias de QOR. Deja que QoreX abra la ventana por transacción, o di al usuario que elija cualquier contrato. |
| `4001` justo después de que la página pida una firma | El usuario rechazó, o cerró la ventana de desbloqueo de una wallet bloqueada. Ofrece volver a intentarlo. |
| `eth_accounts` devuelve `[]` | El sitio todavía no está conectado. Llama a `eth_requestAccounts`. |
| Un enlace `browse` no hace nada | La dirección de la página incumplió una regla (puerto, IP, `localhost`, no es https, más de 2048 caracteres), o el teléfono todavía no tiene wallet. |
| `KEY_NOT_REGISTERED` en tu servidor | El firmante nunca envió una transacción en esa red. Pide primero una. |

Si el problema continúa, el usuario puede enviar un registro de solicitudes con datos ocultados desde el [modo desarrollador](/qorex/developer-mode), y tú puedes usar la testnet para reproducirlo.

## Dónde está publicado {#where-published}

| Qué | Dónde |
|---|---|
| Extensión de navegador QoreX | Chrome Web Store, Firefox Add-ons y Mac App Store (Safari). Consulta [Extensión de navegador](/qorex/browser-extension#install). |
| App QoreX y su navegador de dApps | App Store y Google Play. Consulta [Monedero QoreX](/qorex/overview#how-to-access). |
| Verificación de mensajes y transacciones | `@qorechain/qoresign` (TypeScript y otros lenguajes). Consulta [QoreSign](/qoresign/overview). |
| Detección de wallets para aplicaciones web | [`@qorechain/wallet-adapter`](/developer-tools/wallet-adapter) |
| Conectores de RainbowKit, Interchain Kit y cosmos-kit, tipos y una wallet de prueba | [`@qorechain/qorex-*`](/developer-tools/qorex-integrations) |
| SDK principal para construir y enviar transacciones | [Herramientas para desarrolladores](/developer-tools/overview) |

El código fuente de QoreX no es público. La versión actual en cada tienda está en la página de la [visión general](/qorex/overview#versions).
