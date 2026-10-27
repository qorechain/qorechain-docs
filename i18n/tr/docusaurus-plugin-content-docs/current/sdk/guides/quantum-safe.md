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

`isPqcRegistered` / `getPqcStatus`, bir adresin kayıtlı bir PQC anahtarına sahip olup
olmadığını okur. `createClient`'tan oluşturulan istemci verildiğinde REST üzerinden okurlar
(`GET /qorechain/pqc/v1/account/{address}`, her genel uç nokta tarafından sunulur);
çıplak bir `QorClient` verildiğinde ise **genel uç noktaların sunmadığı**
`qor_getPQCKeyStatus` JSON-RPC yöntemini kullanırlar (bkz.
[`qor_` ad alanı](/api-reference/json-rpc-qor_-namespace)); bu nedenle
`*.qore.host` karşısında oluşturulmuş istemciyi geçin. 0.9.0 öncesi sürümler her zaman
`qor_` yöntemini kullanıyordu ve `-32601` JSON-RPC hatasıyla başarısız oluyordu; orada
REST rotasını doğrudan okuyun.

```ts
import { createClient, isPqcRegistered, getPqcStatus } from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: {
    rest: "https://api.qore.host",
    rpc: "https://rpc.qore.host",
    evmRpc: "https://evm.qore.host",
  },
});

const registered = await isPqcRegistered(client, address); // boolean
const status = await getPqcStatus(client, address);
// { registered: boolean; algorithmId?: number; pubkey?: string | Uint8Array }
```

Rota `GET /qorechain/pqc/v1/account/{address}` şeklindedir (tekil `account`). Kayıtlı
bir adres için `{"found": true, "account": {…}}`, aksi halde
`{"found": false, "account": null}` yanıtını verir; `client.rest.getPqcAccount(address)`
bu gövdeyi döndürür ve `fetchPqcStatus({ rest, address })` onu yukarıdaki duruma
dönüştürür. Okunamayan bir yanıt (bir HTTP hatası, bir aktarım hatası) bir yeniden
denemeden sonra hata olarak fırlatılır: asla "kayıtlı değil" olarak okunmaz. 0.8.x'te
`getPqcAccount`, zincirin sunmadığı çoğul bir `/accounts/` yolunu çağırıyordu.

Aynı durum EVM tarafında da `0x0000000000000000000000000000000000000A02` adresindeki
`pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey)`
ön derlemesi (`@qorechain/evm` içinde `pqcKeyStatus` olarak sunulur) etkinleştiğinde
okunabilir; bu ön derleme mainnet üzerinde etkin değildir ve testnet üzerinde etkin olarak listelenir (27 Ekim 2026'da kontrol edildi; bkz.
[Ağ durumu](/developer-guide/evm-precompiles#network-status)).

## Tek çağrıda kaydedin {#register-in-one-call}

`ensurePqcRegistered`, bir hesabı kuantuma dayanıklı yapar. İmzalayanın ML-DSA-87
genel anahtarıyla `MsgRegisterPQCKeyV2` oluşturur ve yayınlar. **Bağımsız
uygulanabilirdir**: önce hesabın durumunu okur (`rest` geçtiğinizde REST üzerinden),
hesap zaten bu anahtar çiftinin anahtarını taşıyorsa kaydı atlar ve bu nedenle her
uygulama başlangıcında çağrılması güvenlidir. Hesap *farklı* bir anahtar
taşıyorsa `PqcKeyMismatchError` fırlatır ve hiçbir şey göndermez, çünkü anahtar
çiftinizle imzalanan her hibrit işlem reddedilirdi. Asla körü körüne kaydetmez: durum
okunamazsa hata fırlatır (`force: true` değerini yalnızca anahtarı olmadığını
bildiğiniz bir hesap için geçin).

Kayıt klasik olarak imzalanır ve hibrit gereksiniminden muaftır; böylece yeni bir
hesap ilk anahtarını önyükleyebilir; v3.2.3'ten beri bu muafiyet yalnızca anahtarı
olmayan bir hesabı kapsar (zaten bir anahtarı olan bir hesap, bir kayıt veya geçişi
hibrit imzalamalıdır ve zincir zayıf, dejenere veya yeniden kullanılmış anahtarları
reddeder). Ağ v3.2.3'ü uyguladıktan sonra yardımcı, isteğe bağlı **sahiplik
kanıtını** (proof of possession) yeni anahtarla imzalar ve ekler (zincir kimliğini
`chainId`'den veya düğümden okur ve v3.2.3'ü uygulamamış bir ağda alanı boş bırakır,
çünkü eski bir düğüm onu reddeder). Bir CosmJS imzalayıcısı, yani coin-type-118
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

// The address-bound key, recoverable from { address, mnemonic } (0.8.3+; see below).
// Never register a throwaway key from generatePqcKeypair() unless you store it.
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);

// With the keypair the client signs every transaction hybrid; the registration
// itself stays classical (the chain's bootstrap path).
const tx = await client.connectTx(signer, { pqcKeypair });

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  rest: client.network.endpoints.rest,
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});
// res: { alreadyRegistered: boolean; txHash?: string }

await tx.bankSend("qor1…", [{ denom: "uqor", amount: "1000000" }]); // hybrid-signed
```

### Kurtarabileceğiniz bir anahtar {#canonical-derivation}

`derivePqcCanonical(address, mnemonic)`, hesabın ML-DSA-87 anahtarını adresinden ve
mnemonic'inden türetir; böylece kaybedilen bir cihaz kurtarılabilir ve her dil ve
cüzdan aynı anahtarı türetir (bir mnemonic, hesap başına bir anahtar). Önce adresi
küçük harfli `qor1…` biçimine çözümler; dolayısıyla birleşik bir hesabın `0x` biçimi
aynı anahtarı verir. Eşdeğerleri:

| Dil | İşlev | Yayımlandı |
| --- | --- | --- |
| TypeScript | `derivePqcCanonical(address, mnemonic)` (`@qorechain/sdk`) | 0.9.0 |
| Python | `derive_pqc_canonical(address, mnemonic)` (`qorsdk`) | 0.9.0 |
| Go | `authenticator.DerivePQCCanonical(address, mnemonic)` | v0.9.0 |
| Rust | `authenticator::try_derive_pqc_canonical(address, mnemonic)` (bir `Result` döndürür) | 0.9.0 |
| Java | `Authenticator.derivePqcCanonical(address, mnemonic)` | 0.9.0 |

Eski türetme (`derivePqcLegacy`, `"bridge"`) hesaba bağlı değildir ve yeni anahtarlar
için kullanımdan kaldırılmıştır; döndürme yardımcıları onu yeni anahtar olarak
reddeder (bkz. [Bir anahtarı döndürün](#rotate-a-key)).

Python'da kayıt (0.9.0; durum okuması REST üzerinden yapılır ve çağrı, ikinci bir
kayıt için ödeme yapmak yerine farklı bir kayıtlı anahtar için `PqcKeyMismatchError`
fırlatır):

```python
import httpx
from qorsdk import derive_native_account, derive_pqc_canonical, ensure_pqc_registered, fetch_pqc_status

REST = "https://api.qore.host"
native = derive_native_account(mnemonic, 0)
pqc_keypair = derive_pqc_canonical(native.address, mnemonic)

print(fetch_pqc_status(REST, native.address))  # {'registered': False} for a new account

acct = httpx.get(f"{REST}/cosmos/auth/v1beta1/accounts/{native.address}").json()["account"]
result = ensure_pqc_registered(
    account=native,
    pqc_keypair=pqc_keypair,
    chain_id="qorechain-vladi",
    account_number=int(acct["account_number"]),
    sequence=int(acct.get("sequence", 0)),
    rest_url=REST,
    fee={"amount": [{"denom": "uqor", "amount": "60000"}], "gas": "600000"},
)
```

Go (`pqcdx.Signer.RestURL`), Rust (`pqc_dx` `rest_url`) ve Java
(`signer.restUrl`) yardımcıları durumu aynı REST rotasından okur ve sahiplik
kanıtını aynı şekilde ekler.

Diğer SDK'lar hibrit imzayı kendi hibrit işlem oluşturucuları üzerinden atar
(Python ve Rust'ta `build_hybrid_tx`, Go'da `tx.BuildHybridMessages`, Java'da
`PqcDx.HybridSendPath`); yalnızca TypeScript `TxClient` sizin için hibrit imzalar.

:::warning Her zaman önce kontrol etmesine izin verin
Zincir, aynı anahtarın ikinci kaydını **ücreti aldıktan sonra** reddeder.
Bu nedenle `ensurePqcRegistered` durumu önce REST üzerinden okur
(`/qorechain/pqc/v1/account/{address}`) ve karar veremediğinde kaydetmeyi reddeder.
`rest` geçin (veya `qor_*` sunan bir düğüm için `statusSource`, ya da önceden
okunmuş bir `status`); `force: true` kontrolü atlar. 0.8.x'te yardımcının REST
yedeği yoktu ve siz kendiniz `status` geçmedikçe kaydı kontrol etmeden yayınlıyordu.
:::

## Hibrit imzalayın

İstemcide bir `pqcKeypair` varken `tx.bankSend(...)` ve
`tx.signAndBroadcast([messages], "auto")` hibrit imzalar (`fee: "auto"` yolu hibrit
işlemi simüle eder ve post-kuantum doğrulamasının gas'ını ekler).
Hibrit imza, ağın doğruladığı sign-bytes biçimi üzerinden hesaplanır (bkz.
[Hangi sign-bytes biçimi?](/sdk/concepts/accounts-pqc#sign-bytes-versions)); istemci
ağa kendi REST uç noktası üzerinden sorar.

`migrateToHybrid` kaydı sağlar ve anahtar çiftini daha alt düzey
`buildHybridTx` / `signAndBroadcastHybrid` oluşturucularına önceden bağlı olarak bir
hibrit gönderme yolu geri verir; bu, ücreti, hesap numarasını ve sıra numarasını
kendiniz yönettiğinizde işe yarar. SDK'nın sign-bytes biçimini çözebilmesi için `rest`
geçin:

```ts
import { StargateClient } from "@cosmjs/stargate";
import { migrateToHybrid, qorechainRegistry } from "@qorechain/sdk";

const hybrid = await migrateToHybrid(tx, {
  pqcKeypair,
  rest: "https://api.qore.host",
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

## Bir anahtarı döndürün {#rotate-a-key}

Bir hesabın ML-DSA-87 anahtarını **aynı** algoritmanın başka bir anahtarıyla
değiştirmek için (örneğin eski bir `shake256(mnemonic)` anahtarını adrese bağlı
kanonik anahtara taşımak veya ele geçirilmiş bir anahtarı emekliye ayırmak),
`rotatePqcKeyMsgFromMnemonic` ile bir `MsgRotatePQCKey` oluşturun; her iki anahtar da
buna çift imza atar. Tam örnek için
[Anahtar döndürme](/sdk/guides/authenticators#key-rotation) bölümüne bakın.

`migratePqcKeyHybrid`, bir hesabı **algoritmalar** arasında taşıyan daha eski
`MsgMigratePQCKey`'i, zincirin v3.2.3'ten itibaren anahtarı olan bir hesaptan
gerektirdiği hibrit imzayla yayınlar. `pqcKeypair`, **şu anda** kayıtlı olan anahtardır
(döndürülerek çıkarılan); çağıran iki sahiplik imzasını sağlar (eski anahtarın
`oldSignature`'ı, yeni anahtarın `newSignature`'ı). Klasik `migratePqcKey` kullanımdan
kaldırılmıştır: bir v3.2.3 düğümü, anahtarı olan bir hesaptan gelen klasik bir geçişi
reddeder.

```ts
import { StargateClient } from "@cosmjs/stargate";
import { migratePqcKeyHybrid, qorechainRegistry } from "@qorechain/sdk";

const transport = await StargateClient.connect("https://rpc.qore.host");
const info = await transport.getSequence(account.address);

await migratePqcKeyHybrid({
  sender: account.address,
  registry: qorechainRegistry(),
  signer,
  pqcKeypair,   // the currently registered key
  oldPublicKey,
  newPublicKey,
  oldSignature, // by the old key
  newSignature, // by the new key
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: "https://api.qore.host",
  transport,
});
```

## Kullanıcı arayüzünde

[`@qorechain/react`](/sdk/guides/react) kiti bunların tümünü React'te sunar:
`usePqcStatus` kancası ve `<QuantumSafeBadge/>` bileşeni, bağlı hesabın kayıtlı bir
PQC anahtarına sahip olduğu her durumda bir **Kuantuma dayanıklı**
göstergesi gösterir. Her ikisi de durumu oluşturulmuş istemciyle `getPqcStatus`
üzerinden okur; bu nedenle `@qorechain/react` 0.9.0'dan itibaren bunu REST üzerinden
okurlar ve genel uç noktalar karşısında çalışırlar; 0.8.x orada bir anahtarı
doğrulayamıyordu.
