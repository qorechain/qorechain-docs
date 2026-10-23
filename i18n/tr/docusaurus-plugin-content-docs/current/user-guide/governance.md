---
slug: /user-guide/governance
title: Yönetişim
sidebar_label: Yönetişim
sidebar_position: 3
---

# Yönetişim

Bu kılavuz, QoreChain üzerinde zincir üstü yönetişimin nasıl çalıştığını, oyların nasıl sayıldığını, tekliflerin nasıl gönderileceğini ve nasıl oy kullanılacağını açıklar.

:::note
Aşağıdaki komutlar **`qorechain-diana`** testnet'ini (EVM chain ID **9800**) kullanır. Mainnet (**`qorechain-vladi`**, EVM chain ID **9801**), 7 Haziran 2026'dan beri yayında ve 23 Ekim 2026'dan beri **v3.2.4** sürümünü çalıştırıyor; testnet 19 Ekim 2026'dan beri **v3.2.4** çalıştırıyor — mainnet üzerinde yönetişime katılırken **Mainnet'e Bağlanma** sayfasındaki mainnet chain ID'sini ve uç noktalarını kullanın.
:::

:::caution `tx pqc cosign` ile imzalayın
Mainnet ve testnet, her Cosmos hattı (lane) işlemi için hibrit bir kuantum sonrası imza gerektirir; bu nedenle bu sayfadaki komutlar yazıldığı haliyle yayınlanmaz. Bir komuta `--generate-only > tx.json` ekleyin, ardından `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>` komutunu çalıştırın. Bkz. [Hibrit imzalama](/cli-reference/transaction-commands#hybrid-signing).
:::

---

## Oylama Gücü {#voting-power}

Teklifler **bonded stake** üzerinden sayılır: bonded bir doğrulayıcıya delege ettiğiniz her QOR, çarpan olmaksızın bir birim oylama gücü sayılır. Kendiniz oy kullanmazsanız delegasyonunuz doğrulayıcınızın oyunu izler; kendi oyunuzu kullanırsanız bu, stake'iniz için doğrulayıcının oyunu geçersiz kılar. Bir teklif, aşağıdakilerin tümü sağlandığında kabul edilir:

| Kural     | Güncel değer | Anlamı                                                                      |
| --------- | ------------ | --------------------------------------------------------------------------- |
| Yeter sayı (quorum) | 33.4% | Oy kullanması gereken bonded stake payı                                     |
| Eşik      | 50%          | Kabul için gereken, çekimser olmayan oylar içindeki "yes" payı              |
| Veto      | 33.4%        | "no with veto" bu paya ulaşırsa teklif reddedilir ve depozitosu yakılır     |

Bu değerler 23 Ekim 2026'da mainnet'ten okunmuştur (testnet'te de aynıdır); yönetişim bunları değiştirebileceğinden `qorechaind query gov params` ile doğrulayın.

:::note QDRW tasarlandı ancak etkin değil
QoreChain'in tasarımı, büyük stake'leri sönümleyecek ve itibarı ağırlıklandıracak bir **Kuadratik Delegasyon-İtibar Ağırlıklı (QDRW)** oylama gücü formülü içerir: `VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)`. Bu formül `x/qca` modülünde uygulanmıştır ancak her iki ağda da **kapalıdır** (`qorechaind query qca config` içinde `qdrw_enabled` değeri `false`) ve yönetişim sayımının parçası değildir; dolayısıyla bugün hiçbir oyu etkilemez. xQORE da henüz yayında değildir (bkz. [xQORE Staking](/user-guide/xqore-staking)).
:::

---

## Teklif Gönderme

Herhangi bir QOR sahibi bir yönetişim teklifi gönderebilir. Teklifin oylama dönemine girebilmesi için asgari bir depozito gereklidir.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Örnek teklif dosyası** (`proposal.json`). Bir teklif; kabul edilmesi halinde yönetişim modülünün yürüttüğü mesajların bir listesi ile bir başlık, bir özet ve bir depozitodan oluşur. Bu örnek, maksimum doğrulayıcı sayısını 100'den 150'ye çıkarır; `authority`, yönetişim modülü hesabıdır (`qorechaind query auth module-account gov`):

```json
{
  "messages": [
    {
      "@type": "/cosmos.staking.v1beta1.MsgUpdateParams",
      "authority": "qor10d07y265gmmuvt4z0w9aw880jnsr700jwfyxr3",
      "params": {
        "unbonding_time": "1814400s",
        "max_validators": 150,
        "max_entries": 7,
        "historical_entries": 10000,
        "bond_denom": "uqor",
        "min_commission_rate": "0.000000000000000000"
      }
    }
  ],
  "metadata": "",
  "deposit": "10000000uqor",
  "title": "Increase maximum validator count",
  "summary": "Raise the active validator set from 100 to 150 to improve decentralization.",
  "expedited": false
}
```

`MsgUpdateParams` parametre kümesinin tamamını değiştirir; bu yüzden güncel değerleri `qorechaind query staking params` çıktısından kopyalayın ve yalnızca değiştirmek istediğiniz alanı değiştirin. Yalnızca metin içeren (sinyal) bir teklif `"messages": []` kullanır. `qorechaind tx gov draft-proposal` bir iskelet üretir.

---

## Tekliflere Oy Verme

Bir teklif oylama dönemine girdiğinde, herhangi bir staker oy kullanabilir:

```bash
qorechaind tx gov vote <proposal_id> <option> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Oy seçenekleri:**

| Seçenek        | Açıklama                                                                                                 |
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
  --gas 400000 --fees 40000uqor
```

---

## Teklif Türleri

Bir teklif, kabul edilirse yürütülen sıfır veya daha fazla mesaj taşır. Yaygın durumlar:

| Tür                  | Açıklama                                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| **Metin**            | Mesajı olmayan ve otomatik zincir üstü yürütmesi bulunmayan bir sinyal teklifi. Topluluk eğilimini ölçmek için kullanılır. |
| **Parametre Değişikliği** | Yönetişim modülü hesabı tarafından gönderilen, bir modülün `MsgUpdateParams` mesajı. O modülün parametre kümesinin tamamını değiştirir. |
| **Yazılım Yükseltmesi** | Belirtilen bir blok yüksekliğinde koordineli bir zincir yükseltmesini planlayan bir `MsgSoftwareUpgrade` mesajı. |
| **Topluluk Harcaması** | Topluluk havuzundan bir alıcı adrese fon gönderen bir `MsgCommunityPoolSpend` mesajı.         |
| **Hızlandırılmış (Expedited)** | Daha kısa bir oylama dönemi, daha yüksek bir depozito ve kabul eşiği için `"expedited": true` olarak ayarlayın (aşağıya bakın). |

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

| Parametre            | Açıklama                                                         | Güncel değer (20 Eki 2026) |
| -------------------- | ---------------------------------------------------------------- | -------------------------- |
| `min_deposit`        | Bir teklifin oylamaya girmesi için gereken asgari depozito       | 10 QOR (`10000000uqor`)    |
| `max_deposit_period` | Asgari depozitoya ulaşmak için tanınan zaman penceresi           | 2 gün                      |
| `voting_period`      | Bir teklif etkinleştikten sonraki oylama döneminin süresi        | 2 gün                      |
| `quorum`             | Geçerli bir oylama için gereken asgari katılım                   | 0.334                      |
| `threshold`          | Kabul edilmesi için gereken asgari "yes" yüzdesi (çekimserler hariç) | 0.5                    |
| `veto_threshold`     | Reddetmek ve depozitoyu yakmak için gereken asgari "no with veto" yüzdesi | 0.334             |
| `expedited_voting_period` / `expedited_threshold` / `expedited_min_deposit` | Hızlandırılmış teklifler için oylama dönemi, kabul eşiği ve depozito | 1 gün / 0.667 / 50 QOR |

---

## Mainnet'te şimdiye kadarki yönetişim {#mainnet-history}

Mainnet yönetişimi; parametre değişiklikleri, devre kesici kararları, koordineli yükseltmeler ve Ekim 2026'dan itibaren zincirin v3.2.0 yükseltmesinde kaydettiği tutarların serbest bırakılması için kullanılmıştır. 7 ila 13 numaralı teklifler Ekim 2026'da mainnet'te kabul edildi; bunların arasında 12 numaralı (başka bir serbest bırakma, 21 Ekim'de kabul edildi) ve 13 numaralı (v3.2.4 yükseltmesi, 23 Ekim'de 3.742.566 yüksekliğinde uygulandı) teklifler de vardır; liste ve sonuçlar [Sürüm Geçmişi](/appendix/version-history#governance-timeline) sayfasındadır ve her teklif `GET /cosmos/gov/v1/proposals` adresinden canlı olarak okunabilir.

---

:::tip

* Oylama dönemi sona ermeden önce oy kullanın; oyunuz yalnızca teklif oylama dönemindeyken kullanılırsa sayılır.
* `no_with_veto` seçeneğini dikkatli kullanın. Veto eşiğine ulaşılırsa teklif depozitosu yakılır.
* Depozito dönemi içinde asgari depozitoya ulaşamayan teklifler otomatik olarak kaldırılır.

:::
