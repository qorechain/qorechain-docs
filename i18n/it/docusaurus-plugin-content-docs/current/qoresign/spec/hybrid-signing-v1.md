---
slug: /qoresign/spec/hybrid-signing-v1
title: Firma ibrida delle transazioni v1
sidebar_label: Firma ibrida v1
sidebar_position: 1
---

# Firma ibrida delle transazioni su QoreChain, versione 1

Stato: stabile. Si applica alla corsia Native (Cosmos SDK) di `qorechain-vladi`
(mainnet) e `qorechain-diana` (testnet). Fonte:
[`spec/hybrid-signing-v1.md`](https://github.com/qorechain/qoresign/blob/main/spec/hybrid-signing-v1.md).

## Riepilogo {#summary}

Una transazione ibrida è un normale `TxRaw` del Cosmos SDK firmato due volte
dallo stesso account:

1. una firma ML-DSA-87 (FIPS 204), trasportata all'interno del body della
   transazione come opzione di estensione `/qorechain.pqc.v1.PQCHybridSignature`;
2. una firma secp256k1 `SIGN_MODE_DIRECT` sul body finale, in
   `TxRaw.signatures`.

La rete verifica entrambe. Sulla corsia Native la rete richiede per impostazione
predefinita la firma ML-DSA-87 (`HybridSignatureMode = Required`, un parametro a
livello di chain); a parte un piccolo insieme di messaggi esenti, come quelli che
registrano o mantengono la chiave ML-DSA-87 dell'account, una transazione che ne
è priva viene rifiutata.

## Chiavi {#keys}

| Chiave | Algoritmo | Dimensione |
|---|---|---|
| Classica | secp256k1 (account `secp256k1`: indirizzo = RIPEMD160(SHA256(chiave compressa)); account `eth_secp256k1`: indirizzo = ultimi 20 byte di KECCAK256(chiave non compressa)) | chiave pubblica compressa da 33 byte |
| Post-quantistica | ML-DSA-87, id algoritmo `1` | chiave pubblica 2592 byte, firma 4627 byte |

La chiave pubblica ML-DSA-87 deve essere registrata per l'account con
`MsgRegisterPQCKeyV2` prima che le transazioni ibride si verifichino (vedi
[Registrazione](#registration)). In alternativa, una transazione può incorporare
la chiave pubblica nell'estensione (campo 3) per registrarla al primo utilizzo.

## L'estensione {#extension}

```protobuf
package qorechain.pqc.v1;

message PQCHybridSignature {
  uint32 algorithm_id   = 1; // 1 = ML-DSA-87
  bytes  pqc_signature  = 2; // 4627 bytes
  bytes  pqc_public_key = 3; // optional, 2592 bytes
}
```

Viene aggiunta a `TxBody.extension_options` (campo 1023) come
`google.protobuf.Any` con `type_url = "/qorechain.pqc.v1.PQCHybridSignature"` e
la codifica protobuf come `value`. Un body deve portare esattamente una di
queste estensioni.

## Sign-bytes {#sign-bytes}

Sia `B0` la codifica protobuf canonica del `TxBody` **senza** l'estensione PQC
(ogni altro campo ed estensione mantenuti, in ordine) e `A` i byte di `AuthInfo`
esattamente come trasmessi. `BE32`/`BE64` sono lunghezze senza segno in big-endian.

```
v1 = BE32(len(B0)) || B0 || BE32(len(A)) || A
v2 = "qorechain-pqc-hybrid-v2" || BE64(len(chain_id)) || chain_id || v1
```

A una data altezza, una rete verifica esattamente una forma. Entrambe le reti
pubbliche verificano `v2` dai rispettivi aggiornamenti `v3.1.98` / `v3.2.0`
(mainnet: `v3.2.0` all'altezza 2,981,742); qualsiasi altra rete verifica `v2` fin
dal genesis. `v1` serve solo per riprodurre le firme create prima di quelle
altezze. Un client può chiedere a un nodo quale forma verifica leggendo
`/cosmos/upgrade/v1beta1/applied_plan/{v3.1.98|v3.2.0}`.

La firma ML-DSA-87 è `ML-DSA.Sign(sk, signBytes, ctx = "")`. La rete accetta sia
la variante deterministica sia quella hedged; QoreSign firma per impostazione
predefinita in modo deterministico (FIPS 204, `rnd` = 32 byte a zero), così le
firme sono riproducibili rispetto ai vettori pubblicati.

## Ordine delle operazioni {#order-of-operations}

1. Codifica `B0` e `A` (commissione, limite di gas e informazioni del firmatario
   sono fissati a questo punto).
2. Calcola i sign-bytes e la firma ML-DSA-87.
3. Aggiungi l'estensione a `B0`, nell'ordine canonico dei campi (dopo le
   `extension_options` esistenti, prima di `non_critical_extension_options`),
   ottenendo il body finale `B`.
4. Firma `SignDoc { body_bytes = B, auth_info_bytes = A, chain_id, account_number }`
   con secp256k1: SHA-256 per gli account `secp256k1`, KECCAK-256 per gli account
   `eth_secp256k1`; `r || s` da 64 byte, low-S.
5. Trasmetti `TxRaw { B, A, [classical signature] }`.

La firma classica copre l'estensione; la firma ML-DSA-87 copre tutto il resto del
body e le informazioni di autenticazione, commissione inclusa. Nessuna delle due
firme firma se stessa.

## Registrazione {#registration}

`MsgRegisterPQCKeyV2` (type URL `/qorechain.pqc.v1.MsgRegisterPQCKeyV2`):

| Campo | Numero | Valore |
|---|---|---|
| `sender` | 1 | l'account `qor1` |
| `public_key` | 2 | chiave pubblica ML-DSA-87 |
| `algorithm_id` | 3 | `1` |
| `ecdsa_pubkey` | 4 | la chiave secp256k1 compressa da 33 byte dell'account; deve derivare in `sender` |
| `key_type` | 5 | `hybrid` |
| `proof_of_possession` | 6 | firma ML-DSA-87 sul messaggio seguente |

```
"qorechain-pqc-pop-v1|" + chain_id + "|" + algorithm_id + "|" + sender + "|" + lowercase_hex(public_key)
```

La transazione di registrazione è firmata solo con la chiave classica. Una chiave
pubblica la cui parte `t1` (dal byte 32 in poi) è interamente zero viene
rifiutata, perché le sue firme possono essere falsificate.

## Altre corsie {#other-lanes}

- Corsia EVM: le transazioni Ethereum non hanno un campo per un'estensione,
  quindi non portano alcuna firma ML-DSA-87. Un account con una chiave ML-DSA-87
  registrata può aprire dalla corsia Native una finestra di autorizzazione EVM
  limitata (altezza di scadenza, numero massimo di transazioni, valore massimo).
  Vedi [Wallet EVM: modalità quantum-ready](/qoresign/guides/evm-quantum-ready).
- Corsia SVM: non ancora aperta sulla rete.

## Vettori di test {#test-vectors}

`vectors/qoresign-v1.json`, campo `hybridTx`, fornisce un body, le informazioni di
autenticazione e il numero di account con i sign-bytes attesi, le firme, il body
finale e il `TxRaw` per entrambe le versioni. Vedi
[Vettori di test](/qoresign/vectors).
