---
slug: /qoresign/guides/evm-quantum-ready
title: "Carteras EVM: ventana de autorización"
sidebar_label: Ventana de autorización EVM
sidebar_position: 3
---

# Carteras EVM: ventana de autorización

Las transacciones de Ethereum no tienen ningún campo por el que pueda viajar una
segunda firma, y la red aplica su configuración PQC en toda la cadena, no por
carril. Por eso una transacción enviada por el carril EVM de QoreChain se firma
solo con secp256k1, y QoreSign no ofrece una firma híbrida para EVM
(`assertHybridLane("evm")` lanza `LANE_NOT_AVAILABLE`).

En su lugar, la red admite una transacción EVM solo si su remitente tiene una
clave ML-DSA-87 registrada y una **ventana de autorización EVM** activa que la
cubra. La ventana se abre desde el carril nativo con una transacción firmada de
forma híbrida, de modo que la clave post-cuántica autoriza la actividad EVM con
antelación. La propia transacción EVM es solo secp256k1. Ambas redes públicas lo
aplican (función de protocolo `evm-pqc-authorisation-window`, que se puede leer
con `fetchProtocolFeatures` en el [SDK de QoreChain](/sdk/overview) o en
`/qorechain/pqc/v1/protocol_features`).

## Pasos para una cuenta EVM {#steps}

1. Registra una clave ML-DSA-87 para la cuenta en el carril nativo
   (`buildRegisterPqKeyMessage`, consulta
   [Registro](/qoresign/spec/hybrid-signing-v1#registration)). Para una cuenta
   `eth_secp256k1`, los mismos 20 bytes de dirección tienen una forma `qor1`;
   úsala como `sender`.
2. Abre una ventana con una transacción del carril nativo firmada de forma
   híbrida: una altura de expiración, un número máximo de transacciones EVM, un
   valor máximo y, opcionalmente, los contratos a los que puede llamar. El SDK
   de QoreChain incluye compositores para los mensajes de la ventana.
3. Envía transacciones EVM desde cualquier cartera EIP-1193 mientras la ventana
   esté abierta. Fuera de una ventana, o más allá de sus límites, la red las
   rechaza, de modo que la clave secp256k1 por sí sola no puede mover valor en
   el carril EVM.

Cuando la red añada PQC por carril para el carril EVM, QoreSign añadirá un modo
EVM híbrido en una nueva versión menor.

## MetaMask y otras carteras EIP-1193 {#eip-1193-wallets}

MetaMask y otras carteras EIP-1193 no pueden añadir una firma ML-DSA-87 a
`eth_sendTransaction`; para ellas, la vía disponible es la ventana, abierta
desde una cartera que tenga la clave ML-DSA-87.
