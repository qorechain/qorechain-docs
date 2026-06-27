---
slug: /architecture/chain-licensing
title: Zincir Lisanslama
sidebar_label: Zincir Lisanslama
sidebar_position: 9
---

# Zincir Lisanslama

`x/license` modülü, zincir üstü **yetenek lisanslama** sağlar. QoreChain üzerindeki belirli sınırlandırılmış yetenekler — özellikle zincir başına köprü ve doğrulayıcı özellikleri — eylemde bulunan hesabın o yetenek için geçerli bir lisansa sahip olmasını gerektirir. Bir lisans, basitçe belirli bir sahibin (**hibe edilen** / grantee) belirli bir sınırlandırılmış **özelliği** kullanmasını yetkilendiren bir zincir üstü kayıttır.

Lisanslama, bu yetenekleri doğrulanabilir ve kendi kendini tanımlayan tutar: herhangi bir entegratör, gezgin veya cüzdan, zincire belirli bir hesabın belirli bir özellik için yetkili olup olmadığını sorabilir; zincir dışı bir arama gerektirmez.

## Bir lisans neyi temsil eder

Her lisans, bir `(grantee, feature_id)` çiftiyle anahtarlanan bir kayıttır:

- **`grantee`** — lisansın yetkilendirdiği `qor` hesabı.
- **`feature_id`** — kilidini açtığı sınırlandırılmış yetenek. Özellik kimlikleri kararlı string tanımlayıcılarıdır; köprü ve doğrulayıcı yetenekleri hedef zincir başına adlandırılır (örneğin `bridge_ethereum`, `validator_solana`), köprü protokolü ve düğüm/doğrulayıcı operatör özellikleri gibi şemsiye özelliklerin yanında.
- **`granted_at`** / **`expires_at`** — lisansın verildiği blok yüksekliği ve sona erdiği blok yüksekliği (`0` değeri sona ermediği anlamına gelir).
- **`granted_by`** — lisansı veren yetkili.

Bir özelliğin arkasında sınırlandırılmış bir yetenek, yürütme zamanında eylemde bulunan hesabın o özellik için **aktif** bir lisansa sahip olup olmadığını basitçe kontrol eder.

## Lisans yaşam döngüsü

Bir lisans küçük bir durum kümesi arasında hareket eder:

| Durum | Anlamı |
| --- | --- |
| **Verildi / Aktif** | Lisans mevcuttur ve hibe edileni yetkilendirir. Askıya alınmadığı ve süresi dolmadığı sürece aktif sayılır. |
| **Askıya Alındı** | Geçici olarak devre dışı bırakıldı. Kayıt hâlâ mevcuttur, ancak lisans sürdürülene kadar sınırlandırılmış yetenek reddedilir. |
| **İptal Edildi** | Kalıcı olarak kaldırıldı. Hibe edilen artık lisansa hiç sahip değildir. |

Bir lisans ayrıca, hiç askıya alınmamış veya iptal edilmemiş olsa bile, `expires_at` yüksekliği geçtiğinde aktif olmayı durdurur.

## Lisansları kim değiştirebilir

Lisansları verme, iptal etme, askıya alma ve sürdürme **yetkili işlemleridir** — bunlar gelişigüzel kullanıcılar tarafından değil, zincirin yönetişim yetkilisi tarafından gerçekleştirilir. Bu işlemler modülün komut yüzeyinin bir parçası olarak mevcuttur, ancak normal bir kullanıcı bunları doğrudan çağırmaz; yaşam döngüsü zincir üstünde yetkili tarafından yönetilir.

Bir lisans **edinmek** için, entegratörler **Kontrol Paneli (Araçlar → Lisans Satın Al)** üzerinden geçer; bu istek akışını yönetir; ardından yetkili hibeyi zincir üstüne kaydeder.

Yetkili sınırlandırmalı işlemler şunlardır:

```bash
# Grant a license for a feature to a grantee (authority signs)
qorechaind tx license grant qor1grantee... bridge_ethereum \
  --expires-at 0 --from qor1authority... --chain-id qorechain-vladi

# Suspend / resume a license
qorechaind tx license suspend qor1grantee... bridge_ethereum --from qor1authority...
qorechaind tx license resume  qor1grantee... bridge_ethereum --from qor1authority...

# Revoke a license permanently
qorechaind tx license revoke qor1grantee... bridge_ethereum --from qor1authority...
```

## Bir lisansı kontrol etme ve doğrulama

Sorgu komutları herkese açıktır. Entegratörlerin günlük olarak kullandığı modül kısmıdır — sınırlandırılmış bir yeteneğe güvenmeden önce bir hesabın yetkili olduğunu onaylamak veya bir cüzdanda ya da gezginde lisans durumunu göstermek için.

### Tek bir lisansı kontrol et

`check`, belirli bir hibe edilenin belirli bir özelliğe sahip olup olmadığını ve o lisansın şu anda **aktif** olup olmadığını bildirir. Bu, kanonik "bu hesabın X'i yapmasına izin veriliyor mu" çağrısıdır.

```bash
qorechaind query license check qor1grantee... bridge_ethereum
# -> returns the license record and an `active` flag (true / false)
```

Yanıt, lisans ayrıntılarını ve askıya alma ile süre dolmasını zaten hesaba katan boolean bir `active` alanı içerir — yani `true`, hibe edilenin sınırlandırılmış özelliği şu anda kullanabileceği anlamına gelir.

### Bir hibe edilenin lisanslarını listeleme

`list`, bir hesabın tüm özellikler genelinde tuttuğu her lisansı döndürür.

```bash
qorechaind query license list qor1grantee...
```

### Bir özelliğin sahiplerini listeleme

`holders`, belirli bir özellik için lisans tutan her hesabı döndürür — örneğin belirli bir köprü veya doğrulayıcı yeteneği için kimin yetkili olduğunu sıralamak için kullanışlıdır.

```bash
qorechaind query license holders bridge_ethereum
```

## Komut özeti

**İşlemler** (`qorechaind tx license …`) — yetkili / yönetişim sınırlandırmalı:

| Komut | Amaç |
| --- | --- |
| `grant` | Bir hibe edileni bir özellik için yetkilendir |
| `revoke` | Bir lisansı kalıcı olarak kaldır |
| `suspend` | Bir lisansı geçici olarak devre dışı bırak |
| `resume` | Askıya alınmış bir lisansı yeniden etkinleştir |

**Sorgular** (`qorechaind query license …`) — herkese açık:

| Komut | Amaç |
| --- | --- |
| `check` | Bir `(grantee, feature)` lisansını ve aktif durumunu kontrol et |
| `list` | Bir hibe edilenin tuttuğu tüm lisansları listele |
| `holders` | Belirli bir özelliği tutan tüm hibe edilenleri listele |

## İlgili

- Köprü ve doğrulayıcı özellikleri için lisanslar, [Köprü Mimarisi](/architecture/bridge-architecture) sayfasında açıklanan yetenekleri destekler.
- Lisanslar **Kontrol Paneli (Araçlar → Lisans Satın Al)** üzerinden edinilir.
- Hafif düğümler, [Kayıt ve Lisanslama](/light-node/registration-and-licensing) sırasında bir lisans edinir.
- Lisansları [Araçlar Merkezi](/dashboard/tools-hub) üzerinden satın alın ve yönetin.
