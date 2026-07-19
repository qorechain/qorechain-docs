---
slug: /qorex/browser-extension
title: Extensión de navegador
sidebar_label: Extensión de navegador
sidebar_position: 8
---

# Extensión de navegador

La **extensión de navegador** de QoreX (Chrome y Firefox; una versión para Safari está en camino con funcionalidad idéntica) es el **conector de dApps** para escritorio. Permite que los sitios web descubran tu billetera y convierte cada solicitud en una aprobación explícita. Se complementa conceptualmente con la aplicación móvil y **no** incluye funciones de staking, portafolio ni cuenta: esas viven en la aplicación.

## Configuración

La extensión se empareja con una billetera creada en la **aplicación móvil de QoreX**. Si abres la ventana emergente antes de emparejar, muestra **"No wallet yet — create one in the QoreX app."**

## Desbloqueo

La ventana emergente pide tu **contraseña de bóveda** (o una passkey donde el navegador admita claves derivadas de passkey). La bóveda está cifrada con AES-256-GCM en el almacenamiento de la extensión, se bloquea automáticamente y cada desbloqueo es explícito.

## Conexión con dApps

Los sitios web descubren QoreX mediante **EIP-6963** (el estándar multibilletera) y el contrato de conexión de QoreChain. QoreX **nunca sobrescribe** `window.ethereum` ni `window.keplr`: aparece **junto** a otras billeteras, y tú eliges qué billetera usar en cada sitio.

1. Un sitio solicita una conexión; la ventana emergente de aprobación muestra el **origen**.
2. Al aprobar se revela únicamente tu **dirección pública** a ese origen.
3. Las aprobaciones son **por origen**, persisten entre reinicios del navegador, y la aprobación de un sitio no concede nada a otro.

## Firma

Cada solicitud de firma abre una ventana de aprobación que muestra la **carga útil decodificada** — destinatario, monto, red — nunca un hash simple.

- Para las transacciones de QoreChain en la lane Native, la extensión indica que la **dApp aporta la capa poscuántica** (la billetera firma la mitad clásica, el mismo patrón que usan las billeteras consolidadas).
- Si una solicitud es **solo clásica**, la ventana emergente muestra una advertencia explícita: **"⚠ This request is a classical signature — the app did not add a quantum-safe layer."**
- **Rechazar** es siempre un solo clic, y las solicitudes caducan por sí solas.

## Envío en redes externas

Desde la ventana emergente puedes enviar **ETH / BNB / POL / ARB / SOL** y tokens **ERC-20 / SPL** (las mismas derivaciones de semilla que la aplicación). Debes reconocer la nota de firma clásica antes de enviar; un enlace de resultado abre el explorador de bloques.

## Redes y postura de seguridad

- **Red activa** — QoreChain **mainnet** de forma predeterminada (cadena `0x2649` en la lane EVM). La testnet sigue siendo compatible para las dApps que la solicitan, y las solicitudes de firma entre redes se rechazan.
- **Permisos** — la extensión solicita **`storage` únicamente**. El content script inyecta solo las API del proveedor; no lee el contenido de la página más allá de las solicitudes de la billetera, y no hay analítica ni código remoto.
