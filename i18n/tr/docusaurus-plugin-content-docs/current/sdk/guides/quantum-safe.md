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
Canlı ağlarda bu, Native yol işlemleri için isteğe bağlı değildir: anahtar
**açıkça** kaydedilmelidir (ilk işlemde otomatik kayıt yoktur) ve ardından her
Native yol işlemi hibrit imzayı taşımalıdır.

## Durumu kontrol edin {#check-status}

`isPqcRegistered` / `getPqcStatus`, bir adresin `qor_getPQCKeyStatus` JSON-RPC
yöntemi aracılığıyla kayıtlı bir PQC anahtarına sahip olup olmadığını okur. Bunlar bir
`QorClient`'ı veya `createClient`'tan oluşturulan istemciyi kabul eder. **Genel
uç noktalar `qor_` ad alanını sunmaz** (bkz.
[`qor_` ad alanı](/api-reference/json-rpc-qor_-namespace)); bu nedenle
`*.qore.host` karşısında bu yardımcılar `-32601` JSON-RPC hatasıyla başarısız olur.
Durumu bunun yerine REST üzerinden okuyun:

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: {
    rest: "https://api.qore.host",
    rpc: "https://rpc.qore.host",
    evmRpc: "https://evm.qore.host",
  },
});

async function isPqcRegistered(address: string): Promise<boolean> {
  const res = await client.rest.get<{ found: boolean }>(
    `/qorechain/pqc/v1/account/${address}`,
  );
  return res.found;
}
```

Rota `GET /qorechain/pqc/v1/account/{address}` şeklindedir (tekil `account`). Kayıtlı
bir adres için `{"found": true, "account": {…}}`, aksi halde
`{"found": false, "account": null}` yanıtını verir. Bunun için
`client.rest.getPqcAccount` kullanmayın: zincirin sunmadığı çoğul `/accounts/`
yolunu çağırır.

`isPqcRegistered(client, address)` ve `getPqcStatus(client, address)`
(`statusSource` seçeneğiyle), `qor` ad alanını sunan bir düğüme karşı doğru çağrılar
olmaya devam eder; sonuçları
`{ registered: boolean; algorithmId?: number; pubkey?: string | Uint8Array }`
şeklindedir.

Aynı durum EVM tarafında da `0x0000000000000000000000000000000000000A02` adresindeki
`pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey)`
ön derlemesi (`@qorechain/evm` içinde `pqcKeyStatus` olarak sunulur) etkinleştiğinde
okunabilir; bu ön derleme henüz mainnet veya testnet üzerinde etkin değildir (bkz.
[Ağ durumu](/developer-guide/evm-precompiles#network-status)). Bir sonraki SDK yama
sürümü, `.rest` sunan bir istemci (örneğin oluşturulmuş istemci) verildiğinde yukarıdaki
REST rotasına geri döner ve durum okunamadığında "kayıtlı değil" bildirmek yerine
hata fırlatır.

## Tek çağrıda kaydedin

`ensurePqcRegistered`, bir hesabı kuantuma dayanıklı yapar. İmzalayanın ML-DSA-87
genel anahtarı ve hesabın ECDSA genel anahtarıyla `MsgRegisterPQCKeyV2` oluşturur ve
yayınlar. Önceden okunmuş bir `status` (veya bir `statusSource`) verdiğinizde
**bağımsız uygulanabilirdir**: anahtar zaten kayıtlıysa kaydı atlar; bu nedenle her
uygulama başlangıcında çağrılması güvenlidir.

Kayıt klasik olarak imzalanır ve hibrit gereksiniminden muaftır; böylece yeni bir
hesap ilk anahtarını önyükleyebilir. Bir CosmJS imzalayıcısı, yani coin-type-118
hesabı (`deriveNativeAccount`) üzerinden imzalar; birleşik eth-native hesap için
kaydı `EthNativeSigner` ve `signMode: "classical"` ile imzalayın (bkz.
[Hesaplar ve PQC imzalama](/sdk/concepts/accounts-pqc#hybrid-signing)). 2.592 baytlık
anahtar yaklaşık 600.000 gas limiti gerektirir; ağın asgari gas fiyatı gas birimi
başına 0,1 uqor'dur.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  ensurePqcRegistered,
} from "@qorechain/sdk";

const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const tx = await client.connectTx(signer);

// The address-bound key, recoverable from { address, mnemonic } (SDK 0.8.3+).
// Never register a throwaway key from generatePqcKeypair() unless you store it.
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);

// Read the status over REST: the default status source needs the `qor_` namespace.
const { found } = await client.rest.get<{ found: boolean }>(
  `/qorechain/pqc/v1/account/${account.address}`,
);

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  ecdsaPubkey: account.publicKey,
  status: { registered: found },
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});
// res: { alreadyRegistered: boolean; txHash?: string }
```

## Hibrit imzalayın

`migrateToHybrid` kaydı sağlar ve anahtar çiftini mevcut
`buildHybridTx` / `signAndBroadcastHybrid` oluşturucularına önceden bağlı olarak bir hibrit
gönderme yolu geri verir. SDK'nın ağın hangi hibrit sign-bytes biçimini doğruladığını
çözebilmesi için `rest` geçin (bkz.
[Hangi sign-bytes biçimi?](/sdk/concepts/accounts-pqc#sign-bytes-versions)):

```ts
import { StargateClient } from "@cosmjs/stargate";
import { migrateToHybrid, qorechainRegistry } from "@qorechain/sdk";

const hybrid = await migrateToHybrid(tx, {
  pqcKeypair,
  ecdsaPubkey: account.publicKey,
  status: { registered: found },
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});

const transport = await StargateClient.connect("https://rpc.qore.host");
const info = await transport.getSequence(account.address);

await hybrid.signAndBroadcastHybrid({
  registry: qorechainRegistry(),
  signer,          // classical secp256k1 direct signer
  messages,
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" },
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: "https://api.qore.host",
  transport,       // a connected broadcast transport (e.g. StargateClient)
});
```

Zincir, hedged (rastgeleleştirilmiş) veya deterministik olsun, geçerli herhangi bir
FIPS-204 ML-DSA-87 imzasını kabul eder. SDK varsayılan olarak deterministik imzalar
(0.5.1'den beri); böylece bir işlem her zaman aynı imzaya ve aynı tx hash'ine sahip
olur. Bir hibrit tx `pqc` kod 21 (`hybrid_verify_failed`) ile başarısız olursa,
neden sign-bytes sürümü, chain-id, eski bir PQC kütüphanesi veya kayıtlı olmayan ya da
farklı bir anahtardır; asla hedged imzalama değildir: bkz.
[Kod 21 sorun giderme](/developer-guide/post-quantum-signing#code-21).

## Bir anahtarı döndürün

Bir hesabın ML-DSA-87 anahtarını **aynı** algoritmanın başka bir anahtarıyla
değiştirmek için (örneğin eski bir `shake256(mnemonic)` anahtarını adrese bağlı
kanonik anahtara taşımak veya ele geçirilmiş bir anahtarı emekliye ayırmak),
`rotatePqcKeyMsgFromMnemonic` ile bir `MsgRotatePQCKey` oluşturun; her iki anahtar da
buna çift imza atar. Tam örnek için
[Anahtar döndürme](/sdk/guides/authenticators#key-rotation) bölümüne bakın.

`migratePqcKey`, bir hesabı **algoritmalar** arasında taşıyan ve her iki imzanın da
çağıran tarafından sağlanmasını gerektiren daha eski `MsgMigratePQCKey`'i yayınlar:

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
göstergesi gösterir. Her ikisi de durumu `getPqcStatus` üzerinden okur; bu nedenle
genel uç noktalar karşısında (`qor_` ad alanı yok) bugün bir anahtarı doğrulayamazlar;
React sayfasındaki canlı ağ sınırlarına bakın.
