---
slug: /user-guide/governance
title: Yönetişim
sidebar_label: Yönetişim
sidebar_position: 3
---

# Yönetişim

Bu kılavuz, QoreChain üzerinde zincir üstü yönetişimin nasıl çalıştığını, Kuadratik Delegasyon-İtibar Ağırlıklı (QDRW) oylama sistemini, tekliflerin nasıl gönderileceğini ve nasıl oy kullanılacağını açıklar.

:::note
Aşağıdaki komutlar **`qorechain-diana`** testnet'ini (EVM chain ID **9800**) kullanır. Mainnet (**`qorechain-vladi`**, EVM chain ID **9801**), 7 Haziran 2026'dan beri **v3.1.92** zincir sürümünü çalıştırarak yayında — mainnet üzerinde yönetişime katılırken **Mainnet'e Bağlanma** sayfasındaki mainnet chain ID'sini ve uç noktalarını kullanın.
:::

---

## Oylama Gücü: QDRW Formülü

QoreChain, oylama gücünü hesaplamak için **Kuadratik Delegasyon-İtibar Ağırlıklı (QDRW)** formülünü kullanır. Bu sistem, yüksek itibar puanları kazanmış ve xQORE staking yoluyla yönetişime bağlılık göstermiş katılımcıları ödüllendirirken balina (whale) hakimiyetini önler.

```
VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)
```

| Variable                  | Description                                                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `VP`                      | Etkin oylama gücü                                                                                                                 |
| `staked`                  | Oy verenin stake ettiği toplam QOR token miktarı                                                                                 |
| `xQORE`                   | Elde tutulan xQORE yönetişim tokenlarının miktarı (bkz. [xQORE Staking](/user-guide/xqore-staking))                              |
| `r`                       | Oy verenin \[0, 1] aralığına normalleştirilmiş itibar puanı                                                                      |
| `ReputationMultiplier(r)` | İtibarı \[0.5, 2.0] aralığındaki bir çarpana eşleyen sigmoid fonksiyon                                                           |

### Temel Özellikler

* **Kuadratik sönümleme:** Bir başka oy verenin 100 katı stake'e sahip bir katılımcı, 100 kat değil yalnızca \~10 kat oylama gücü kazanır. Bu, yönetişim etkisinin servetle doğrusal-altı (sub-linear) şekilde ölçeklenmesini sağlar.
* **xQORE bonusu:** xQORE tokenları karekök içinde **2x ağırlıkla** sayılır ve yönetişime bağlılık göstermiş katılımcılara belirgin bir avantaj sağlar.
* **İtibar çarpanı:** Oy verenin itibar puanını, bir sigmoid eğrisi kullanarak \[0, 1] aralığından \[0.5, 2.0] aralığındaki bir çarpana eşler. Yüksek itibarlı katılımcılar etkin oylama güçlerini ikiye katlayabilirken, düşük itibarlı katılımcıların etkisi yarıya iner.

---

## Teklif Gönderme

Herhangi bir QOR sahibi bir yönetişim teklifi gönderebilir. Teklifin oylama dönemine girebilmesi için asgari bir depozito gereklidir.

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

| Option         | Description                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| `yes`          | Teklifi destekler                                                                                        |
| `no`           | Teklife karşı çıkar                                                                                      |
| `abstain`      | Bir taraf tutmadan teklifi kabul eder                                                                    |
| `no_with_veto` | Teklife karşı çıkar ve gönderilmemesi gerektiğini bildirir (eşik karşılanırsa depozito yakılır)          |

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

| Type                 | Description                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| **Text**             | Otomatik zincir üstü yürütmesi olmayan bir sinyal teklifi. Topluluk eğilimini ölçmek için kullanılır. |
| **Parameter Change** | Bir veya daha fazla zincir üstü protokol parametresini değiştirir (örn. maksimum doğrulayıcı sayısı, emisyon oranı). |
| **Software Upgrade** | Belirtilen bir blok yüksekliğinde koordineli bir zincir yükseltmesini planlar.                   |
| **Community Spend**  | Belirtilen bir alıcı adres için topluluk hazinesinden fon talep eder.                            |

---

## Teklifleri Sorgulama

Tüm teklifleri listeleyin:

```bash
qorechaind query gov proposals
```

Belirli bir teklifi ID ile sorgulayın:

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

Başlıca parametreler şunlardır:

| Parameter            | Description                                                      |
| -------------------- | ---------------------------------------------------------------- |
| `min_deposit`        | Bir teklifin oylamaya girmesi için gereken asgari depozito        |
| `max_deposit_period` | Asgari depozitoya ulaşmak için tanınan zaman penceresi            |
| `voting_period`      | Bir teklif etkinleştikten sonraki oylama döneminin süresi         |
| `quorum`             | Geçerli bir oylama için gereken asgari katılım                    |
| `threshold`          | Kabul edilmesi için gereken asgari "yes" yüzdesi (çekimserler hariç) |
| `veto_threshold`     | Reddetmek ve depozitoyu yakmak için gereken asgari "no with veto" yüzdesi |

---

:::tip

* Oylama gücü çarpanınızı en üst düzeye çıkarmak için önemli yönetişim oylamalarından önce itibar biriktirin.
* QDRW formülü içinde 2x yönetişim ağırlığı bonusu için QOR'unuzu xQORE'a kilitleyin.
* `no_with_veto` seçeneğini dikkatli kullanın. Veto eşiği karşılanırsa teklif depozitosu yakılır.
* Depozito dönemi içinde asgari depozitoya ulaşamayan teklifler otomatik olarak kaldırılır.

:::
