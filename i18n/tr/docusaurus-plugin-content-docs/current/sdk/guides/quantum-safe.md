---
slug: /sdk/guides/quantum-safe
title: Varsayılan Olarak Kuantuma Dayanıklı
sidebar_label: Kuantuma dayanıklı
sidebar_position: 6
---

# Varsayılan olarak kuantuma dayanıklı

QoreChain, post-kuantum kriptografiyi **birinci sınıf** bir imza şeması olarak ele alır.
Bir hesap, zincir üzerinde bir **ML-DSA-87 (Dilithium-5, NIST FIPS 204)** anahtarı kaydeder,
ardından işlemleri bir **hibrit** imza taşıyabilir — olağan
klasik secp256k1 imzası **artı** bir ML-DSA-87 imzası. Zincirin ante
işleyicisi her ikisini de doğrular; böylece kuantuma dayanıklı bir hesap, gelecekteki bir kuantum
düşmanına karşı koruma kazanırken klasik doğrulamayla tam uyumlu kalır.

SDK bunu küçük, bağımsız uygulanabilir bir yüzeye paketler; böylece bir dApp
**varsayılan olarak kuantuma dayanıklı** hale gelir: PQC korumalı olmak için tek bir çağrı.

## Durumu kontrol edin

`isPqcRegistered` / `getPqcStatus`, bir adresin `qor_getPQCKeyStatus` JSON-RPC
yöntemi aracılığıyla kayıtlı bir PQC anahtarına sahip olup olmadığını okur. Bunlar bir
`QorClient`'ı veya `createClient`'tan oluşturulan istemciyi kabul eder:

```ts
import { createClient, isPqcRegistered, getPqcStatus } from "@qorechain/sdk";

const client = createClient({ network: "mainnet", endpoints: { /* … */ } });

const safe = await isPqcRegistered(client, "qor1…");
const status = await getPqcStatus(client, "qor1…");
// status: { registered: boolean; algorithmId?: number; pubkey?: string | Uint8Array }
```

Aynı durum EVM tarafında da `0x0000000000000000000000000000000000000A02` adresindeki
`pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey)`
ön derlemesi (`@qorechain/evm` içinde `pqcKeyStatus` olarak sunulur) aracılığıyla okunabilir.
Yukarıdaki yardımcılar, hiçbir viem eşi gerektirmeyen JSON-RPC yöntemini tercih eder.

## Tek çağrıda kaydedin

`ensurePqcRegistered`, bir hesabı kuantuma dayanıklı yapar. **Bağımsız uygulanabilirdir**: bir
durum kaynağı geçin, anahtar zaten kayıtlıysa kaydı atlar;
bu nedenle her uygulama başlangıcında çağrılması güvenlidir.

```ts
import { generatePqcKeypair, ensurePqcRegistered } from "@qorechain/sdk";

const tx = await client.connectTx(signer);
const pqcKeypair = generatePqcKeypair(); // or derive deterministically from the wallet

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  statusSource: client, // makes the call idempotent (skips if already registered)
});
// res: { alreadyRegistered: boolean; txHash?: string }
```

Arka planda, imzalayanın Dilithium genel anahtarıyla (`pqcKeypair` içinden) artı,
isteğe bağlı olarak hesabın ECDSA genel anahtarıyla `MsgRegisterPQCKey` oluşturur
ve yayınlar.

## Hibrit imzalayın

`migrateToHybrid` kaydı sağlar ve anahtar çiftini mevcut
`buildHybridTx` / `signAndBroadcastHybrid` oluşturucularına önceden bağlı olarak bir hibrit
gönderme yolu geri verir:

```ts
import { migrateToHybrid } from "@qorechain/sdk";

const hybrid = await migrateToHybrid(tx, { pqcKeypair, statusSource: client });

await hybrid.signAndBroadcastHybrid({
  registry,
  signer,          // classical secp256k1 direct signer
  messages,
  fee,
  chainId,
  accountNumber,
  sequence,
  transport,       // a connected broadcast transport (e.g. StargateClient)
});
```

## Bir anahtarı döndürün

PQC anahtarını döndürmeniz gerekirse (algoritma yükseltmesi veya ele geçirilmiş bir anahtar),
hem eski hem de yeni anahtarın sahipliğini kanıtlayarak `MsgMigratePQCKey` yayınlayan
`migratePqcKey`'i kullanın:

```ts
import { migratePqcKey } from "@qorechain/sdk";

await migratePqcKey(tx, {
  oldPublicKey,
  newPublicKey,
  oldSignature, // by the old key
  newSignature, // by the new key
});
```

## Kullanıcı arayüzünde

[`@qorechain/react`](/sdk/guides/react) kiti bunların tümünü React'te sunar:
`usePqcStatus` kancası ve `<QuantumSafeBadge/>` bileşeni, bağlı hesabın kayıtlı bir
PQC anahtarına sahip olduğu her durumda bir **Kuantuma dayanıklı**
göstergesi gösterir.
