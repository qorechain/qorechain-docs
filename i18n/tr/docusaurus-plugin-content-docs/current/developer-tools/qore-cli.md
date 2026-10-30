---
slug: /developer-tools/qore-cli
title: QoreChain CLI (qore)
sidebar_label: QoreChain CLI
sidebar_position: 24
---

# QoreChain CLI (`@qorechain/qore-cli`, komut `qore`)

`qore`, QoreChain'i terminalden okur. Kod yazmadan bir işlemi aramak, kuantum sonrası imzasının doğrulanıp doğrulanmadığını denetlemek, bir hesabı veya doğrulayıcı kümesini okumak, bir işlemi simüle etmek ya da imzasız bir transfer hazırlamak isteyen geliştiriciler, operatörler ve betikler içindir. Her komut, [QoreChain MCP sunucusunun](/developer-tools/mcp) bir aracını çalıştırır ve `--json`, aracın döndürdüğü JSON'un aynısını yazdırır; böylece bir betik ve bir yapay zeka ajanı aynı veriyi görür.

Hiçbir şey asla imzalanmaz veya yayınlanmaz ve CLI anahtar tutmaz. Sürüm **0.1.0**, 27 Ekim 2026'da yayınlandı, Apache-2.0, Node.js 20 veya üzeri.

## Yenilikler {#innovations}

- **MCP aracının çıktısıyla aynı JSON.** `qore <command> --json`, eşleşen MCP aracının döndürdüğü nesnenin aynısını, aynı alan adlarıyla yazdırır. `--json` olmadan aynı nesne okunabilir metin olarak yazdırılır. Birine karşı yazılmış bir betik ötekine karşı da çalışır.
- **Terminalden kuantum sonrası durum.** `qore pq status <txhash>`, işlemin tam olarak bir hibrit katman taşıyıp taşımadığını ve ML-DSA-87 (FIPS 204) imzasının, imzalayanın zincirde kaydettiği anahtara karşı imzalanacak bayt v1 ve v2 için doğrulanıp doğrulanmadığını bildirir. `qore pq status <address>`, kayıtlı anahtarı, türünü, sahiplik kanıtını ve EVM yetkilendirme penceresini bildirir.
- **Anahtar gerektirmeyen bir transfer hattı.** `prepare-transfer --json` imzasız bir transfer yazar ve `simulate` bu dosyayı kabul eder; böylece bir kabuk betiğinden bir transferi oluşturabilir, denetleyebilir ve fiyatlandırabilirsiniz. İmzalama adımı cüzdanınızda veya [QoreSign](/qoresign/overview) içinde kalır.
- **Kararlı çıkış kodları.** 0 başarıdır, 1 `NOT_FOUND` veya `INVALID_INPUT` gibi kararlı bir kod taşıyan bir araç hatasıdır ve 2 bir kullanım hatasıdır; böylece bir betik sonuca göre dallanabilir.

## Ne için kullanılır {#use-cases}

1. **Bir işlemin hibrit imzayı taşıdığını denetlemek.** Yayından hemen sonra `qore pq status <hash>`, imza katmanını ve ML-DSA-87 katmanının imzalayanın kayıtlı anahtarına karşı doğrulanıp doğrulanmadığını bildirir.
2. **Terminalden zincir durumuna bakmak.** `qore block`, `qore account <address>`, `qore validators` ve `qore search <query>`, bir gezgin açmadan veya kod yazmadan hızlı bir soruyu yanıtlar.
3. **Bir transferi imzalamadan önce fiyatlandırmak ve denetlemek.** `prepare-transfer` imzasız bir transfer yazar, `simulate` gas'i, bakiye değişimlerini ve çözülmüş bir ret nedenini gösterir, `estimate-fee` ise önerilen ücreti verir. Kendi cüzdanınızda veya [QoreSign](/qoresign/overview) ile imzalarsınız.
4. **Sözleşmeleri bir betikten veya CI işinden okumak.** `qore read-contract --to 0x... --function "balanceOf(address)" --arg 0x... --returns uint256 --json | jq`, bir token bakiyesini veya bir sözleşme görünümünü denetler ve sonucu ayrıştırır.
5. **Kabuk betikleri ve izleme.** `--json` çıktısı ile kararlı çıkış kodları (0, 1, 2), bir betiğin sonuca göre dallanmasını sağlar. Aynı JSON, [MCP sunucusunun](/developer-tools/mcp) döndürdüğü JSON'dur; bu yüzden bir yapay zeka istemcisi ve bir betik aynı veriyi görür.

## Nasıl çalışır {#how-it-works}

Her `qore` komutu, MCP sunucusunun ortak çekirdeğinin bir aracını, sizin işleminizde, seçtiğiniz ağın genel REST, RPC ve EVM JSON-RPC uç noktalarına karşı çalıştırır. Yanıtlar zincirin cevabından alan alan oluşturulur, üst akış hata metni asla yazdırılmaz ve bir hata yedi kararlı hata kodundan birine eşlenir (`NOT_FOUND`, `INVALID_INPUT`, `UPSTREAM_UNAVAILABLE`, `NOT_AVAILABLE_ON_CHAIN`, `RATE_LIMITED`, `UNAUTHORIZED`, `INTERNAL_ERROR`). Her üst akış isteğinin 10 saniyelik bir zaman aşımı (`--timeout` ile değiştirilir), 4 MiB'lık bir yanıt sınırı vardır ve yeniden deneme yoktur. Hibrit imza denetimleri [QoreSign](/qoresign/overview) ile yerel olarak çalışır. Hiçbir şey imzalanmaz veya gönderilmez. Her aracın ayrıntıları [MCP sunucusu sayfasındadır](/developer-tools/mcp#how-it-works).

## Nasıl kullanılır {#how-to-use}

Kurmadan çalıştırın ya da bir kez kurun:

```bash
npx -y @qorechain/qore-cli chain
npm install -g @qorechain/qore-cli
qore --version
```

Komutlar salt okunurdur ve varsayılan olarak testnet kullanır:

```bash
# the latest block, and the chain info
qore block
qore chain

# is this testnet transaction hybrid-signed, and does the ML-DSA-87 layer verify?
qore pq status F642F59F2A2FEDA2B3A61A3CF49F8B5F792D65985027997004FEBB22A6F42152

# an account on mainnet, as JSON
qore account qor1... --network mainnet --json

# the top bonded validators
qore validators --limit 3

# an unsigned transfer, then its simulation (nothing is signed or sent)
qore prepare-transfer --from qor1... --to qor1... --amount 1.5 --json > transfer.json
qore simulate transfer.json
qore estimate-fee --from qor1... --to qor1... --amount 1.5
```

Tutarlar `1.5` veya `1.5 QOR` (QOR, en fazla 6 ondalık) ya da `1500000uqor` biçimindedir. Adresler `qor1...` veya `0x...` olabilir.

### Bir hesabı ve bir işlemi denetleyen betik {#script}

Depoda bunu yapan tam bir betik (`examples/cli/pq-check.sh`) bulunur. Özü şudur:

```bash
net=testnet
qore() { npx -y @qorechain/qore-cli "$@" --network "$net" --json; }

qore account "$addr" | jq '{exists, balances: [.balances[] | {denom, amount, display}], pq_key_registered}'
qore pq status "$addr" | jq '.address_status | {registered, algorithm, key_type, possession_proven, evm_window: .evm_window.live}'
qore pq status "$tx" | jq '.transaction_status | {tier, has_exactly_one_pqc_layer, signer, verified: .verification.verified, reason: .verification.reason}'

# An unsigned transfer to yourself, then its fee (nothing is signed or sent).
qore prepare-transfer --from "$addr" --to "$addr" --amount 0.000001 > transfer.json
qore simulate transfer.json | jq '{ok, gas_used, suggested_gas_limit, refusal}'
```

`qore block --network mainnet --json` komutunun bir örneği (27 Ekim 2026):

```json
{
  "network": "mainnet",
  "height": "3858155",
  "hash": "1DA8CA5049ACF8844A3B775E2E138B2B118EDC1FC8C1F3602369B0C18D0B90C2",
  "time": "2026-10-27T21:32:48.831948088Z",
  "chain_id": "qorechain-vladi",
  "proposer_address": "B1CDC8C45DA1FFF9BA5A01320F16FC7460E90B8F",
  "tx_count": 0,
  "tx_hashes": [],
  "tx_hashes_truncated": false,
  "explorer_url": "https://explore.qore.network/block/3858155"
}
```

### Komutlar {#commands}

| Komut | MCP aracı | Ne yapar |
|---|---|---|
| `chain`, `features` | `get_chain_info` | zincir kimlikleri, son blok, asgari gas fiyatı, imzalanacak bayt sürümü, protokol özellik anahtarları, etkin EVM precompile'ları |
| `block [height]` | `get_block` | tek bir blok, varsayılan olarak sonuncusu |
| `tx get <hash>` | `get_transaction` | yerel veya EVM karması ile bir işlem: durum, ücret, mesajlar, imzalayanlar, imza katmanı |
| `account <address>` | `get_address_info` | bakiyeler, hesap durumu, stake edilen miktar, her iki adres biçimi |
| `pq status <address\|txhash>` | `get_pq_status` | bir adres için ML-DSA-87 anahtar durumu veya bir işlem için hibrit katman denetimi |
| `validators [--status S] [--limit N]` | `get_validators` | stake'e göre doğrulayıcılar; durum `bonded` (varsayılan), `unbonding`, `unbonded` veya `all`; sınır 200'e kadar |
| `staking-tiers [--holder A]` | `get_staking_tiers` | staking katmanı parametreleri ve havuzu ile bir sahibin kilitleri (zincir v3.2.4 ve sonrası) |
| `search <query>` | `search` | bir yüksekliği, karmayı, adresi veya doğrulayıcıyı algılar ve okur |
| `read-contract --to 0x.. (--data 0x.. \| --function "f(address)" --arg V) [--returns T]` | `read_contract` | yalnızca bir EVM `eth_call`, isteğe bağlı kodlama ve çözmeyle |
| `simulate <txfile.json\|base64> [--no-pqc-placeholder]` | `simulate_tx` | kodlanmış bir işlem için gas, bakiye değişimleri ve çözülmüş bir ret nedeni |
| `estimate-fee (<txfile.json\|base64> \| --from A --to B --amount X)` | `estimate_fee` | önerilen gas sınırı ve ücret, ML-DSA-87 katmanı dahil |
| `prepare-transfer --from A --to B --amount X [--memo M] [--gas-limit N]` | `prepare_transfer` | cüzdanınızın imzalaması için imzasız bir transfer |

Genel seçenekler: `--network testnet|mainnet` (varsayılan `testnet`), `--json`, `--timeout <ms>` (üst akış zaman aşımı, varsayılan 10000), `--help` ve `--version`. Araç şemaları [MCP araç başvurusunda](https://github.com/qorechain/qorechain-mcp/blob/main/docs/tools.md) bulunur.

### Ne çalıştırıldı {#what-was-run}

27 Ekim 2026'da `@qorechain/qore-cli` 0.1.0 ve `@qorechain/mcp` 0.1.0 npm'den boş bir projeye kuruldu ve şu salt okunur komutlar genel uç noktalara karşı çalıştırıldı:

- `qore --version` çıktısı `0.1.0` oldu ve `qore --help` yukarıdaki komutları listeledi.
- `qore chain` (testnet) zincir `qorechain-diana`, EVM zincir kimliği 9800, asgari gas fiyatı 0.1 ve imzalanacak bayt `v2` yazdırdı; `qore chain --network mainnet` ise zincir `qorechain-vladi`, EVM zincir kimliği 9801 ve imzalanacak bayt `v2` yazdırdı.
- `qore block`, `qore validators --limit 3 --json`, `qore staking-tiers --json`, `qore search 8981000`, `qore account qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08` ve `qore read-contract --to 0x...0a02 --function "x()"` verilerini döndürdü.
- `qore pq status F642F59F...2152` katman `pqc`, `has_exactly_one_pqc_layer: true` ve imzalanacak bayt `v2` ile `verified: true` yazdırdı.
- `qore prepare-transfer --from A --to A --amount 1.5 --json` imzasız bir transfer yazdı (gas sınırı 171698, ücret 17170 uqor), o dosya üzerinde `qore simulate` `ok: true` döndürdü ve `qore estimate-fee` eşleşen bir ücret döndürdü. Gönderen ve alıcı aynı adresti, bu yüzden araç bir uyarı ekledi ve hiçbir şey imzalanmadı veya gönderilmedi.
- `qore tx get zzz` `error [INVALID_INPUT]` yazdırdı ve 1 ile çıktı; `qore bogus` 2 ile çıktı.

## Nasıl erişilir {#how-to-access}

- **Ağlar.** Testnet `qorechain-diana` (varsayılan) ve `--network mainnet` ile mainnet `qorechain-vladi`.
- **Uç noktalar.** CLI genel REST, RPC ve EVM JSON-RPC uç noktalarını okur: testnet'te `https://api-testnet.qore.host`, `https://rpc-testnet.qore.host` ve `https://evm-testnet.qore.host`, mainnet'te ise `https://api.qore.host`, `https://rpc.qore.host` ve `https://evm.qore.host`.
- **Hesap ve anahtarlar.** Yok. Oturum açma, API anahtarı ve yapılandırma dosyası yoktur; barındırılan MCP uç noktasının anahtarı CLI için geçerli değildir.
- **Önkoşullar.** Node.js 20 veya üzeri ve giden HTTPS.
- **Maliyet.** Ücretsiz. Hazırladığınız transferi göndermek için ağ ücretini (taban gas başına 0,1 uqor) kendi cüzdanınızdan ödersiniz; CLI bu adımı yapmaz.

## Güvenlik notları {#security}

* **İmzalama kod yolu yok.** CLI anahtar tutmaz, hiçbir şey imzalamaz ve hiçbir şey yayınlamaz; `prepare-transfer` imzasız bir belge döndürür.
* **Gizli bilgiler reddedilir.** Kurtarma ifadesine (12 veya daha fazla ardışık BIP-39 sözcüğü) ya da çıplak bir 32 baytlık özel anahtara benzeyen girdi, herhangi bir istek yapılmadan önce `INVALID_INPUT` ile reddedilir. Yine de birini komut satırına koymayın: kabuk geçmişiniz onu saklar ve hata, o gizli bilgiyi ifşa olmuş saymanızı söyler.
* **Makinenizden yalnızca herkese açık veriler çıkar:** sizin verdiğiniz adresler, karmalar ve kodlanmış işlemler, genel QoreChain uç noktalarına gönderilir.
* **Mainnet açıkça belirtilir.** `--network mainnet` vermedikçe çağrılar testnet'e gider ve mainnet için hazırlanan bir transfer bir uyarı taşır.
* **Notlar herkese açık ve kalıcıdır.** Bir `--memo` içine asla bir gizli bilgi koymayın.
* Güvenlik açıklarını herkese açık bir issue'da değil, security@qore.network adresine özel olarak bildirin.

## Nerede yayınlandı {#where-published}

| Kayıt defteri | Paket | Sürüm | Kurulum | Notlar |
|---|---|---|---|---|
| npm | [`@qorechain/qore-cli`](https://www.npmjs.com/package/@qorechain/qore-cli) | 0.1.0 | `npm install -g @qorechain/qore-cli` | Bin `qore`. Node.js 20 veya üzeri |

Kaynak: [github.com/qorechain/qorechain-mcp](https://github.com/qorechain/qorechain-mcp), `packages/cli` klasörü (genel, Apache-2.0, 27 Ekim 2026'da kontrol edildi). CLI'ın Python veya Rust derlemesi yoktur; sunucunun kendisi ayrıca PyPI'da [`qorechain-mcp`](/developer-tools/mcp#where-published) olarak bulunur.

## Sınırlar ve bilinen sorunlar {#limits}

- **Salt okunur.** Hiçbir komut imzalamaz veya yayınlamaz. `prepare-transfer` yalnızca uqor cinsinden native lane `MsgSend` oluşturur; EVM, SVM, staking, yönetişim veya sözleşme işlemleri hazırlamaz. `simulate` ve `estimate-fee`, kodlanmış herhangi bir native lane işlemini kabul eder.
- **Faucet ve token sahibi listesi yok.** Bu iki MCP aracının CLI komutu yoktur. Testnet QOR, [Faucet](/dashboard/faucet) sayfasından alınır.
- **Testnet geçmişi budanır.** Eski bir testnet bloğu veya işlemi, mevcut en düşük yükseklikle birlikte `NOT_FOUND` döndürür; mainnet, kontrol edildiğinde 1. yükseklikten itibaren sunuluyordu.
- **Gas rakamları zincir sürümünü izler.** Her iki ağ da v3.2.5'i uygulamıştır; bu yüzden simülasyon ML-DSA-87 doğrulama maliyetini içerir, daha eski bir düğümde ise önerilen gas sınırı bir pay taşır.
- **Çıktı sınırları.** Blok başına en fazla 100 işlem karması, işlem başına 50 mesaj, hesap başına 100 bakiye, çağrı başına 200 doğrulayıcı. Her isteğin varsayılan 10 saniyelik bir zaman aşımı, 4 MiB'lık bir yanıt sınırı vardır ve yeniden deneme yoktur.
- **Gizli bilgiler reddedilir.** Kurtarma ifadesine veya çıplak bir özel anahtara benzeyen girdi `INVALID_INPUT` ile reddedilir. Birini komut satırına koymayın: kabuk geçmişi onu saklar.
- **EVM kuantum sonrası precompile'ları** `0x...0A01` ve `0x...0A02` yalnızca testnet'te etkindir.
- **İlk sürüm.** 0.1.0: komut adları ve seçenekler sonraki sürümlerde değişebilir. Betikler için `--json` ve çıkış kodlarını kullanın ve sürümü sabitleyin.

## İlgili sayfalar {#related}

* [QoreChain MCP sunucusu](/developer-tools/mcp): yapay zeka istemcileri için aynı araçlar, barındırılan bir uç noktayla.
* [QoreSign](/qoresign/overview): `prepare-transfer` komutunun yazdığı transferi imzalayın.
* [SDK CLI başvurusu](/sdk/reference/cli): SDK'nın kendi komut satırı.
* [Faucet](/dashboard/faucet): testnet QOR.
* [Geliştirici paketlerine genel bakış](/developer-tools/overview).
