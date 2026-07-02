---
slug: /user-guide/governance
title: Yönetişim
sidebar_label: Yönetişim
sidebar_position: 3
---

# Yönetişim

Bu kılavuz, QoreChain üzerinde zincir üstü yönetişimin nasıl çalıştığını, Kuadratik Delegasyon-İtibar Ağırlıklı (QDRW) oylama sistemini, tekliflerin nasıl gönderileceğini ve oy verilmesini açıklar.

:::note
Aşağıdaki komutlar **`qorechain-diana`** testnet'ini (EVM chain ID **9800**) kullanır. Mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) 7 Haziran 2026'dan beri **v3.1.82** zincir sürümünü çalıştırarak yayında — mainnet üzerinde yönetişime katılırken **Mainnet'e Bağlanma** sayfasındaki mainnet chain ID'sini ve uç noktalarını kullanın.
:::

---

## Oylama Gücü: QDRW Formülü

QoreChain, oylama gücünü hesaplamak için **Kuadratik Delegasyon-İtibar Ağırlıklı (QDRW)** formülünü kullanır. Bu sistem, yüksek itibar puanları kazanmış ve xQORE staking yoluyla yönetişime bağlılık göstermiş katılımcıları ödüllendirirken balina (whale) hakimiyetini önler.

```
VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)
```

| Değişken                  | Açıklama                                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `VP`                      | Etkili oylama gücü                                                                                                              |
| `staked`                  | Oy verenin stake ettiği toplam QOR tokenları                                                                                    |
| `xQORE`                   | Tutulan xQORE yönetişim tokenlarının miktarı (bkz. [xQORE Staking](/user-guide/xqore-staking))                                  |
| `r`                       | Oy verenin \[0, 1] aralığına normalleştirilmiş itibar puanı                                                                     |
| `ReputationMultiplier(r)` | İtibarı \[0.5, 2.0] aralığındaki bir çarpana eşleyen sigmoid fonksiyonu                                                         |

### Temel Özellikler

* **Kuadratik sönümleme:** Bir başka oy verenin 100 katı stake'e sahip bir kişi, 100 kat değil yalnızca \~10 kat oylama gücü kazanır. Bu, yönetişim etkisinin servetle alt-doğrusal olarak ölçeklenmesini sağlar.
* **xQORE bonusu:** xQORE tokenları karekök içinde **2x ağırlıkla** sayılır ve yönetişime bağlı katılımcılara anlamlı bir avantaj sağlar.
* **İtibar çarpanı:** Oy verenin itibar puanını sigmoid eğrisi kullanarak \[0, 1] aralığından \[0.5, 2.0] aralığındaki bir çarpana eşler. Yüksek itibarlı katılımcılar etkili oylama güçlerini ikiye katlayabilirken, düşük itibarlı katılımcılar etkilerinin yarıya indiğini görür.

---

## Teklif Gönderme

Herhangi bir QOR sahibi bir yönetişim teklifi gönderebilir. Teklifin oylama dönemine girmesi için asgari bir depozito gereklidir.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Örnek teklif dosyası** (`proposal.json`):

```json
{
  "title": "Increase Maximum Validator Count",
  "description": "This proposal increases the maximum active validator set from 100 to 150 to improve decentralization.",
  "type": "parameter_change",
  "changes": [
    {
      "subspace": "staking",
      "key": "MaxValidators",
      "value": "150"
    }
  ],
  "deposit": "10000000uqor"
}
```

---

## Tekliflere Oy Verme

Bir teklif oylama dönemine girdiğinde, herhangi bir staker oy kullanabilir:

```bash
qorechaind tx gov vote <proposal_id> <option> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Oy seçenekleri:**

| Seçenek        | Açıklama                                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| `yes`          | Teklifi destekle                                                                                          |
| `no`           | Teklife karşı çık                                                                                         |
| `abstain`      | Bir pozisyon almadan teklifi onayla                                                                       |
| `no_with_veto` | Teklife karşı çık ve gönderilmemesi gerektiğini belirt (eşik karşılanırsa depozitoyu yakar)              |

**Örnek:**

```bash
qorechaind tx gov vote 1 yes \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Teklif Türleri

QoreChain aşağıdaki yönetişim teklif türlerini destekler:

| Tür                  | Açıklama                                                                                         |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| **Text**             | Otomatik zincir üstü yürütmesi olmayan bir sinyal teklifi. Topluluk eğilimi kontrolleri için kullanılır. |
| **Parameter Change** | Bir veya daha fazla zincir üstü protokol parametresini değiştirir (ör. maks. doğrulayıcılar, emisyon oranı). |
| **Software Upgrade** | Belirtilen bir blok yüksekliğinde koordineli bir zincir yükseltmesi zamanlar.                    |
| **Community Spend**  | Belirtilen bir alıcı adres için topluluk hazinesinden fon talep eder.                            |

---

## Teklifleri Sorgulama

Tüm teklifleri listeleyin:

```bash
qorechaind query gov proposals
```

ID'ye göre belirli bir teklifi sorgulayın:

```bash
qorechaind query gov proposal <proposal_id>
```

Bir teklif üzerindeki güncel oy sayımını kontrol edin:

```bash
qorechaind query gov tally <proposal_id>
```

Bir teklif üzerindeki kendi oyunuzu görüntüleyin:

```bash
qorechaind query gov vote <proposal_id> <voter_address>
```

---

## Yönetişim Parametreleri

Güncel yönetişim parametrelerini sorgulayın:

```bash
qorechaind query gov params
```

Temel parametreler şunları içerir:

| Parametre            | Açıklama                                                          |
| -------------------- | ---------------------------------------------------------------- |
| `min_deposit`        | Bir teklifin oylamaya girmesi için gereken asgari depozito       |
| `max_deposit_period` | Asgari depozitoya ulaşmak için zaman penceresi                   |
| `voting_period`      | Bir teklif aktif olduğunda oylama döneminin süresi               |
| `quorum`             | Geçerli bir oy için gereken asgari katılım                       |
| `threshold`          | Geçmesi için gereken asgari "yes" yüzdesi (çekimserler hariç)    |
| `veto_threshold`     | Reddetmek ve depozitoyu yakmak için gereken asgari "no with veto" yüzdesi |

---

:::tip

* Oylama gücü çarpanınızı en üst düzeye çıkarmak için büyük yönetişim oylamalarından önce itibar oluşturun.
* QDRW formülünde 2x yönetişim ağırlığı bonusu için QOR'u xQORE'a kilitleyin.
* `no_with_veto`'yu dikkatli kullanın. Veto eşiğine ulaşılırsa, teklif depozitosu yakılır.
* Depozito dönemi içinde asgari depozitoya ulaşamayan teklifler otomatik olarak kaldırılır.

:::
