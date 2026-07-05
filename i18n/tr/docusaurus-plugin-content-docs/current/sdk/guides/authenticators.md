---
slug: /sdk/guides/authenticators
title: Kimlik Doğrulayıcılar ve Yetkilendirilmiş Harcama
sidebar_label: Kimlik Doğrulayıcılar
sidebar_position: 8
---

# Kimlik doğrulayıcılar ve yetkilendirilmiş harcama

**Kimlik doğrulayıcı şeritleri** (SDK 0.7.0, zincir **v3.1.85**), bağlı bir
harici anahtarın — bir Phantom **ed25519** anahtarı ya da bir MetaMask / EVM
**secp256k1** anahtarı — TEK kanonik **PQC zorunlu** hesaptan, en az yetki
ilkesine dayalı, harcama limitli ve iptal edilebilir koşullarla, **harici
anahtar hiçbir zaman bir ML-DSA eş-imzası üretmeden** harcama yapmasına olanak
tanır.

Bu, zincirin
[hesap soyutlama](/developer-guide/account-abstraction) modülünün SDK
tarafındaki karşılığıdır.

## Aktarıcı (relayer) modeli

Bir **aktarıcı (relayer)** işlemi gönderir ve ücretleri öder. Aktarıcının kendi
hibrit (klasik + ML-DSA-87) imzası, zarf üzerinde ante işleyicisini karşılar;
bu nedenle kanonik hesabın PQC imzasına zincir üzerinde **gerek yoktur**.
Yetkilendirme, bunun yerine bağlı anahtarın alan ayrımlı (domain-separated),
tekrar oynatmaya (replay) karşı bağlanmış bir **sign-bytes** özeti üzerindeki
imzasıdır.

```text
 Phantom / MetaMask key            Relayer (pays fees)             Chain
 ─────────────────────            ───────────────────            ─────
 sign(authSignBytes)  ──────────▶ wrap in Msg, sign envelope ──▶ verify authenticator sig
                                                                  check permission + rule
                                                                  spend FROM canonical account
```

Aktarıcı, sahipten **farklı** bir hesaptır; dolayısıyla hesabın EVM nonce
değerini artırmaz.

## Üç şerit

| Şerit | Mesaj | Sign-bytes | Ne harcar |
| --- | --- | --- | --- |
| EVM | `MsgExecuteEVM` | `evmAuthSignBytes` | hesabın `0x` adresinden yerel QOR / EVM çağrısı |
| Native | `MsgExecuteCosmos` | `cosmosAuthSignBytes` | hesaptan `x/bank` üzerinden yerel QOR |
| Anahtar rotasyonu | `MsgRotatePQCKey` | `rotationSignBytes` | (hesabın PQC anahtarını döndürür) |

Mesaj tür URL'leri `/qorechain.abstractaccount.v1.MsgExecuteEVM`,
`/qorechain.abstractaccount.v1.MsgExecuteCosmos` ve
`/qorechain.pqc.v1.MsgRotatePQCKey` şeklindedir.

## Bir Phantom kimlik doğrulayıcısı kaydetme

Bir anahtarı bağlamak **sahip imzalıdır** (kanonik hesap tarafından yapılan
normal bir hibrit işlem): `MsgRegisterAuthenticator`, anahtarı (şema + ham
pubkey baytları), verilen `permissions` yetkilerini ve bir `expiryUnix` oturum
son tarihini belirtir. Harcama limitleri, `MsgUpdateSpendingRules` aracılığıyla
bir `SpendingRule` ile eklenir:

```ts
import { msg } from "@qorechain/sdk";

// The Phantom wallet in the browser:
const phantomPubkey = window.solana.publicKey.toBytes(); // 32-byte ed25519

// 1) Link the key: least privilege ("send" only) + a session expiry.
const register = msg.abstractaccount.registerAuthenticator({
  owner: canonicalAccount,          // the PQC-required account ("qor1…")
  accountAddress: canonicalAccount, // the account the key may act for
  scheme: "ed25519",                // Phantom keys are ed25519
  pubkey: phantomPubkey,
  permissions: ["send"],            // e.g. "send", "evm", "svm" — never "all" for a hot key
  expiryUnix: String(Math.floor(Date.now() / 1000) + 7 * 24 * 3600), // 7 days
  label: "phantom",
});

// 2) Bound what it can move: per-tx and daily limits, uqor only.
const limits = msg.abstractaccount.updateSpendingRules({
  owner: canonicalAccount,
  accountAddress: canonicalAccount,
  rules: [
    {
      id: "phantom-hot",
      perTxLimit: "1000000",    // ≤ 1 QOR per spend
      dailyLimit: "10000000",   // ≤ 10 QOR per day
      allowedDenoms: ["uqor"],
      enabled: true,
    },
  ],
});

// Broadcast BOTH owner-signed (hybrid) — e.g. via the hybrid tx path:
// await signAndBroadcastHybrid({ ..., messages: [register, limits] });
```

Bir anahtarı anında devre dışı bırakmak için sahip,
`msg.abstractaccount.revokeAuthenticator({ owner, accountAddress, scheme,
pubkey })` mesajını yayınlar.

## Phantom'dan harcama (Native şeridi, bir aktarıcı üzerinden)

Anahtar bağlandıktan sonra tarayıcı, aktarıcıya hazır bir `MsgExecuteCosmos`
oluşturur: `buildPhantomExecuteCosmos` alan ayrımlı özeti yeniden oluşturur,
Phantom'a imzalatır (`signMessage`) ve `{ typeUrl, value }` mesajını döndürür.

**Tarayıcı (Phantom kullanıcısı):**

```ts
import { buildPhantomExecuteCosmos } from "@qorechain/sdk";

// window.solana is a Phantom-style wallet: { publicKey, signMessage }.
const msgExecute = await buildPhantomExecuteCosmos({
  wallet: window.solana,
  relayer: relayerAddress,       // who will submit + pay fees
  chainId: "qorechain-vladi",
  account: canonicalAccount,     // the PQC-required owner
  to: recipient,                 // "qor1…"
  amount: "100uqor",             // single-coin amount string
  nonce,                         // the per-authenticator sequence for (account, pubkey)
});

// Ship `msgExecute` to your relayer service (it is already signed by Phantom):
await fetch("/api/relay", {
  method: "POST",
  body: JSON.stringify({
    typeUrl: msgExecute.typeUrl,
    value: {
      ...msgExecute.value,
      pubkey: Buffer.from(msgExecute.value.pubkey).toString("base64"),
      signature: Buffer.from(msgExecute.value.signature).toString("base64"),
      nonce: msgExecute.value.nonce.toString(),
    },
  }),
});
```

**Sunucu (aktarıcı):** zarfı **kendi** hesabıyla imzalar (Native yolunda her
zamanki gibi hibrit) ve ücretleri öder. Mesajın içindeki kimlik doğrulayıcı
imzası, sahibin hesabından harcama yapma yetkisidir.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
} from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: {
    rpc: "https://rpc.qore.host",
    rest: "https://api.qore.host",
  },
});

// The relayer's OWN account — a different account than the owner.
const relayer = await deriveNativeAccount(process.env.RELAYER_MNEMONIC!);
const signer = await directSignerFromPrivateKey(relayer.privateKey, "qor");
const tx = await client.connectTx(signer);

// Decode the message from the request, then broadcast it (relayer pays fees).
const result = await tx.signAndBroadcast([msgExecute], { fee });
console.log(result.transactionHash);
```

Uçtan uca çalıştırılabilir bir sürüm (Phantom yerine yerel bir ed25519 anahtarı
kullanan)
[`authenticator-spend`](https://github.com/qorechain/qorechain-sdk/tree/main/examples/authenticator-spend)
örneğidir.

## MetaMask'ten harcama (EVM şeridi)

Bir MetaMask anahtarı, `registerEthAuthenticatorMsg` ile **20 baytlık ETH
adresi** (şema `secp256k1`) üzerinden bağlanır ve aynı türden bir özet
üzerindeki 65 baytlık EIP-191 `personal_sign` imzasıyla harcamaları
yetkilendirir.

**1) Sahip, MetaMask adresini bağlar** (sahip imzalı, hibrit):

```ts
import { registerEthAuthenticatorMsg } from "@qorechain/sdk";

const [ethAddress] = await window.ethereum.request({
  method: "eth_requestAccounts",
  params: [],
});

const register = registerEthAuthenticatorMsg({
  owner: canonicalAccount,
  ethAddress,                 // 0x-hex 20-byte address = the authenticator pubkey
  permissions: ["evm"],       // EVM lane only
  expiryUnix: Math.floor(Date.now() / 1000) + 24 * 3600, // 24 h session
  label: "metamask",
});
// broadcast owner-signed (hybrid), like any other message
```

**2) MetaMask bir EVM transferini yetkilendirir** — `buildMetaMaskExecuteEvm`
özeti oluşturur, sağlayıcıdan `personal_sign` (EIP-191) ister ve aktarıcıya
hazır bir `MsgExecuteEVM` döndürür:

```ts
import { buildMetaMaskExecuteEvm } from "@qorechain/sdk";

const msgExecute = await buildMetaMaskExecuteEvm({
  provider: window.ethereum,   // any EIP-1193 provider
  address: ethAddress,         // the linked 20-byte address (0x-hex)
  relayer: relayerAddress,
  chainId: "qorechain-vladi",
  account: canonicalAccount,   // the PQC-required owner
  to: "0xRecipient…",          // 0x-hex recipient
  value: "1000000000000000000",// decimal wei string (EVM lane: 18 decimals)
  gasLimit: 100000,
  nonce: evmNonce,             // the account's CURRENT EVM nonce — do NOT +1
});
// hand `msgExecute` to the relayer, exactly as in the Phantom flow
```

`buildMetaMaskExecuteCosmos`, Native şeridi için aynı şekilde çalışır
(`to: "qor1…"`, `amount: "100uqor"`, `nonce` = kimlik doğrulayıcı başına
sıra numarası). Anahtarları ve imzaları kendiniz yönetiyorsanız eşleşen
düşük seviyeli oluşturucular da vardır: `executeEvmMsg`,
`executeCosmosMsg`, `registerEthAuthenticatorMsg`, `revokeAuthenticatorMsg`,
`rotatePqcKeyMsg`.

## Sign-bytes (bayt düzeyinde birebir)

İki bayt yardımcısı vardır: `BE64(n)` 8 baytlık big-endian bir tamsayıdır;
`LP(bytes)` ise `BE64(len) ‖ bytes` (uzunluk önekli) biçimindedir.

**EVM şeridi** — `evmAuthSignBytes({ chainId, account, pubkey, to, value, data, nonce })`
32 baytlık bir özet döndürür:

```text
sha256( "qorechain-evm-auth-v1"
        ‖ LP(chainId) ‖ LP(account) ‖ LP(pubkey)
        ‖ LP(to) ‖ LP(value) ‖ LP(data) ‖ BE64(nonce) )
```

`to` `0x`-hex alıcı adresi, `value` ondalık wei dizesi, `data` ise ham
calldata'dır.

**Native şeridi** — `cosmosAuthSignBytes({ chainId, account, pubkey, to, amount, nonce })`
32 baytlık bir özet döndürür:

```text
sha256( "qorechain-cosmos-auth-v1"
        ‖ LP(chainId) ‖ LP(account) ‖ LP(pubkey)
        ‖ LP(to) ‖ LP(amount) ‖ BE64(nonce) )
```

`amount`, kanonik tek-coin dizesidir (ör. `100uqor`).

**Rotasyon** — `rotationSignBytes(chainId, algorithmId, account, oldPub, newPub)`
her iki anahtarın da imzaladığı dizeyi (UTF-8 halini) döndürür:

```text
qorechain-pqc-rotate-v1|<chainId>|<algorithmId>|<account>|<oldHex>|<newHex>
```

## Nonce değerleri

- `MsgExecuteEVM.nonce` = hesabın **güncel EVM nonce değeri** (aktarıcı farklı
  bir hesaptır ve sahibin nonce değerini artırmaz; bu yüzden 1 **eklemeyin**).
- `MsgExecuteCosmos.nonce` = `(account, pubkey)` için **kimlik doğrulayıcı
  başına sıra numarası** — hesabın kendi sırasından ayrı bir depo sayacıdır ve
  her başarılı Native şeridi harcamasında artırılır.

Nonce değerini yanlış vermek bir tekrar oynatma (replay) reddiyle sonuçlanır
(`abstractaccount` kodu 11, aşağıya bakın).

```ts
// EVM lane: the account's current nonce, straight from the EVM JSON-RPC.
const evmNonce = await client.evm.call<string>("eth_getTransactionCount", [
  account0x,
  "latest",
]);
```

## Yetki şeması

Zincir, istemcilerin kapsamları dizeleri sabit kodlamadan doğrulayabilmesi ve
`schema_version` aracılığıyla sapmaları tespit edebilmesi için kanonik kimlik
doğrulayıcı yetki taksonomisini yayınlar:

```ts
// REST (LCD):
const schema = await client.rest.getPermissionSchema();

schema.schema_version;      // bumps on any taxonomy/mapping change
schema.permissions;         // ["send", "evm", "svm", "all", ...]
schema.msg_permissions;     // { "/qorechain.abstractaccount.v1.MsgExecuteEVM": "evm", ... }
schema.key_management_msgs; // typeURLs NEVER delegable to a linked key
```

REST rotası `GET /qorechain/abstractaccount/v1/permission_schema` şeklindedir;
tipli gRPC sorgu istemcisi aynı veriyi
`clients.abstractaccount.permissionSchema()` olarak sunar. Modül ayrıca
`/config`, `/accounts` ve `/accounts/{address}` rotalarını da sunar.

## Hata kodları

Hatalar, kullanıcı dostu bir `kind` alanıyla `decodeTxError` üzerinden çözülür:

| Codespace | Kod | Kind |
| --- | --- | --- |
| `abstractaccount` | 5 | `spending_limit_exceeded` |
| `abstractaccount` | 6 | `session_key_expired` |
| `abstractaccount` | 10 | `permission_denied` |
| `abstractaccount` | 11 | `authenticator_replay` |
| `pqc` | 21 | `hybrid_verify_failed` |

```ts
import { decodeTxError } from "@qorechain/sdk";

const decoded = decodeTxError({
  code: result.code,
  codespace: result.codespace,
  rawLog: result.rawLog,
});

switch (decoded.kind) {
  case "spending_limit_exceeded": // over the per-tx or daily SpendingRule
    break;
  case "session_key_expired":     // expiryUnix passed — re-register the key
    break;
  case "permission_denied":       // scope missing — check the permission_schema
    break;
  case "authenticator_replay":    // wrong nonce — refetch and re-sign
    break;
  case "hybrid_verify_failed":    // ML-DSA sig did not verify (see note below)
    break;
}
```

`hybrid_verify_failed` çoğunlukla **hedged** (deterministik olmayan) bir
ML-DSA-87 imzası anlamına gelir — zincir yalnızca deterministik imzaları kabul
eder. Ayrıca, 0.6.1 öncesi bir SDK hibrit uzantıyı JSON olarak kodladıysa da
bu hatayı görürsünüz (yükseltin — bkz.
[Hesaplar ve PQC imzalama](/sdk/concepts/accounts-pqc#hybrid-signing)).

## Anahtar rotasyonu {#key-rotation}

Bir hesabın ML-DSA-87 anahtarını, **aynı** algoritmadan yeni bir anahtara
döndürün — örneğin eski chain-bridge türevli bir anahtarı
(`shake256(mnemonic)`) kanonik adres-bağlı anahtara
(`shake256("qorechain:pqc:v1|addr|mnemonic")`) taşımak için:

```ts
import { rotatePqcKeyMsgFromMnemonic, derivePqcLegacy } from "@qorechain/sdk";

const { msg, oldKeypair, newKeypair } = rotatePqcKeyMsgFromMnemonic({
  account,
  mnemonic,
  chainId: "qorechain-vladi",
  // oldDerivation: "bridge" (legacy), newDerivation: "adapter" (canonical) by default
});
// broadcast `msg` BY the account, cosigned (hybrid) with the OLD key —
// both keys dual-sign the rotation bytes (old proves ownership, new proves control).
```

`derivePqcLegacy(mnemonic)`, ihtiyaç duyduğunuzda (ör. rotasyon zincire
işlenene kadar imzalamaya devam etmek için) eski anahtar çiftini kendi başına
yeniden üretir.

## Sonraki adımlar

- [Hesaplar ve PQC imzalama](/sdk/concepts/accounts-pqc) — birleşik hesaplar ve
  hibrit imzalama.
- [Hesap soyutlama](/developer-guide/account-abstraction) — zincir tarafındaki
  modül.
- Çalıştırılabilir örnek:
  [`authenticator-spend`](https://github.com/qorechain/qorechain-sdk/tree/main/examples/authenticator-spend).
