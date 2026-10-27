---
slug: /getting-started/connecting-to-testnet
title: الاتصال بشبكة الاختبار
sidebar_label: الاتصال بشبكة الاختبار
sidebar_position: 4
---

# الاتصال بشبكة الاختبار

انضم إلى شبكة اختبار QoreChain Diana الحيّة عبر إعداد عقدتك بملف التكوين الأولي (genesis) الصحيح والنظراء (peers) وإعدادات الشبكة المناسبة.

:::note
تغطي هذه الصفحة شبكة الاختبار **`qorechain-diana`** (معرّف سلسلة EVM هو **9800**). أما الشبكة الرئيسية (**`qorechain-vladi`**، بمعرّف سلسلة EVM **9801**) فهي تعمل منذ 7 يونيو 2026 (الإصدار **v3.2.4** منذ 23 أكتوبر 2026) ولديها صفحة مخصصة بعنوان **الاتصال بالشبكة الرئيسية** تتضمن ملف genesis ونظراء وتفاصيل اتصال منفصلة. تعمل شبكة الاختبار بالإصدار **v3.2.6** (طُبّق في 27 أكتوبر 2026)؛ ويوجد بيان الإصدار الخاص بها على [download.qore.host/testnet/latest.json](https://download.qore.host/testnet/latest.json).
:::

## نقاط النهاية العامة

إذا كنت تحتاج فقط إلى **الاستعلام من شبكة الاختبار أو بث المعاملات**، فاستخدم نقاط النهاية العامة:

| الخدمة | الرابط |
|---|---|
| RPC الإجماع | `https://rpc-testnet.qore.host` (WebSocket: `wss://rpc-testnet.qore.host/websocket`) |
| Cosmos REST (LCD) | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` (معرّف السلسلة `9800`) |
| EVM WebSocket | `wss://evm-ws-testnet.qore.host` |
| SVM JSON-RPC (للقراءة فقط) | `https://svm-testnet.qore.host` |
| مستكشف الكتل | [explore.qore.network](https://explore.qore.network) (بدّل إلى شبكة الاختبار) |

يمكن الحصول على QOR الخاص بشبكة الاختبار من [صنبور لوحة التحكم](/dashboard/faucet)، الذي يمكنه أيضًا إرسال [رموز Fest الاختبارية](/dashboard/faucet#fest-tokens) الخاصة بشبكة الاختبار فقط (fUSD وfETH وfBTC؛ بلا قيمة).

---

## التثبيت

المصدر المرجعي الوحيد للملف التنفيذي الحالي لشبكة الاختبار وملف genesis والنظراء ونقطة الثقة الخاصة بمزامنة الحالة (state-sync) هو **بيان شبكة الاختبار (testnet manifest)**، ويُحدَّث مباشرةً على `https://download.qore.host/testnet/latest.json`. له نفس بنية بيان الشبكة الرئيسية، ولذلك فإن خطوات التثبيت هي نفسها — نزّله واستخدم قيمه بدلًا من تثبيت إصدار أو مجموع تحقق (checksum) بشكل ثابت في الأوامر:

```bash
curl -s https://download.qore.host/testnet/latest.json -o latest.json
jq -r '.version, .minCompatible, .upgradeHeight' latest.json

BINARY_URL=$(jq -r .binary.url latest.json)
BINARY_SHA256=$(jq -r .binary.sha256 latest.json)

curl -fsSL "$BINARY_URL" -o qore.tgz
echo "${BINARY_SHA256}  qore.tgz" | sha256sum -c -

tar xzf qore.tgz
sudo install -m0755 qorechaind /usr/local/bin/
sudo mkdir -p /opt/qorechain/lib && sudo cp lib/*.so /opt/qorechain/lib/
export LD_LIBRARY_PATH=/opt/qorechain/lib

qorechaind init my-node --chain-id qorechain-diana
```

تخضع شبكة الاختبار لترقيات منسّقة عبر مقترحات الحوكمة، ولذلك يتضمن بيانها الحقل `upgradeHeight` ويساوي `minCompatible` الإصدار الحالي. العقدة التي تنضم الآن تحتاج إلى الإصدار المذكور في البيان. وقت كتابة هذا النص (27 أكتوبر 2026) يقرأ بيان شبكة الاختبار `version` بقيمة 3.2.6 و`minCompatible` بقيمة 3.2.6 و`upgradeHeight` بقيمة 8970638، وتقول ملاحظته "IBC v2 light client routes, AMM pools and RL consensus agent fixes, fest test tokens". أبقِ ساعة النظام متزامنة عبر NTP.

| الإصدار | ارتفاع شبكة الاختبار | تاريخ التطبيق |
| --- | --- | --- |
| v3.2.2 | 6,905,034 | 2 أكتوبر 2026 |
| v3.2.3 | 8,003,746 | 15 أكتوبر 2026 |
| v3.2.4 | 8,337,253 | 19 أكتوبر 2026 |
| v3.2.5 | 8,890,800 | 26 أكتوبر 2026 |
| v3.2.6 | 8,970,638 | 27 أكتوبر 2026 (16:58 بالتوقيت العالمي UTC) |

تتلقى شبكة الاختبار كل إصدار قبل الشبكة الرئيسية. طبّقت الشبكة الرئيسية v3.2.4 عند الارتفاع 3,742,566 في 23 أكتوبر 2026؛ وسيطبّق مقترح الحوكمة 14 على الشبكة الرئيسية الإصدار v3.2.5 عند الارتفاع 3,906,833 وكان في فترة التصويت وقت كتابة هذا النص. البيانان منفصلان، ولذلك لا تنسخ ملفًا تنفيذيًا بين الشبكتين أبدًا، ولا تتوقع أن تقبل الشبكة الرئيسية ميزة خاصة بشبكة الاختبار فقط (تُدرج إضافات v3.2.6 في [سجل الإصدارات](/appendix/version-history#testnet-v326)).

---

## تنزيل ملف Genesis

استبدل ملف genesis المحلي لديك بملف genesis الرسمي لشبكة الاختبار، باستخدام الرابط وقيمة SHA-256 من البيان الذي جلبته أعلاه:

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -
```

ويقدّم الملف نفسه أيضًا مباشرةً من السلسلة ذاتها:

```bash
curl -s https://rpc-testnet.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

يحدد هذا الملف الحالة الأولية لشبكة اختبار Diana، بما في ذلك مجموعة المدقّقين وتوزيعات الرموز ومعاملات الوحدات (modules).

:::note تتم ترقية شبكة الاختبار في مكانها
تعمل Diana بشكل متواصل منذ 1 يوليو 2026 وتُرقّى عبر مقترحات الحوكمة مثل الشبكة الرئيسية. شبكة الاختبار شبكة تجريبية (staging) ويمكن إعادة تعيينها دون إشعار: إذا توقفت عقدتك عن المزامنة، فتحقق من البيان ومن إعلانات Discord، ثم أعد تنزيل ملف genesis وابدأ من دليل بيانات جديد. تحتفظ العقدة الحارسة العامة (sentry) بالكتل الأخيرة فقط، ولذلك ينبغي للعقدة الجديدة استخدام مزامنة الحالة (state sync، أدناه) بدلًا من إعادة التشغيل من genesis.
:::

---

## إعداد النظراء

اقرأ قوائم النظراء والعقد المُبذِّرة (seeds) الحالية من البيان بدلًا من تثبيت معرّفات العقد والمضيفين بشكل ثابت:

```bash
PEERS=$(jq -r '.peers | join(",")' latest.json)
SEEDS=$(jq -r '.seeds | join(",")' latest.json)
```

افتح `~/.qorechaind/config/config.toml` وعيّن الحقلين `persistent_peers` (و`seeds`) بتلك القيم:

```toml
persistent_peers = "<value of $PEERS>"
seeds = "<value of $SEEDS>"
```

عيّن أيضًا الحد الأدنى للرسوم في `~/.qorechaind/config/app.toml` (تستخدم شبكة الاختبار نفس الحد الأدنى لسعر الغاز **0.1uqor** المعتمد في الشبكة الرئيسية):

```toml
minimum-gas-prices = "0.1uqor"
```

### الإعدادات الموصى بها

العقدة الكاملة لا تختار زمن الكتلة — بل يختاره المدقّقون (تنتج شبكة الاختبار حاليًا كتلة تقريبًا كل 1.3 ثانية). اترك مهلات الإجماع على قيمها الافتراضية ما لم تشغّل مدقّقًا وتكون قد حصلت على قيم من مجموعة المدقّقين. إعداد مفيد لذاكرة المعاملات (mempool) في عقدة RPC عامة، في `config.toml`:

```toml
[mempool]
size = 5000
```

---

## بدء سريع (مزامنة الحالة)

يحمل الحقل `stateSync` في البيان زوج ارتفاع/تجزئة الثقة يُحدَّث بانتظام:

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

اضبط القسم `[statesync]` في `config.toml` بتلك القيم وبقيمة `rpcServers` من البيان — راجع [تشغيل عقدة](/developer-guide/running-a-node) لسير العمل الكامل.

---

## تشغيل العقدة

شغّل عقدتك لبدء المزامنة مع الشبكة:

```bash
./qorechaind start
```

تتصل العقدة بالنظراء وتبدأ في تنزيل الكتل (من genesis، أو من ارتفاع الثقة إذا استخدمت مزامنة الحالة). يعتمد زمن المزامنة الأولية على ارتفاع السلسلة الحالي وسرعة شبكتك.

---

## التحقق من حالة المزامنة

تحقق من أن عقدتك تلحق بأحدث كتلة:

```bash
curl localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — لا تزال العقدة قيد المزامنة. انتظر حتى تلحق بالشبكة.
* `false` — العقدة متزامنة بالكامل وتعالج كتلًا جديدة.

يمكنك أيضًا التحقق من أحدث ارتفاع للكتل:

```bash
curl localhost:26657/status | jq '.result.sync_info.latest_block_height'
```

---

## المراقبة

توفر QoreChain عدة نقاط نهاية لمراقبة صحة العقدة وأدائها.

### مقاييس Prometheus

المقاييس الخام متاحة على:

```
http://localhost:26660/metrics
```

يمكن جمع هذه المقاييس بواسطة أي مجمّع متوافق مع Prometheus.

### لوحات Grafana

عند التشغيل عبر Docker Compose، تكون Grafana متاحة على:

```
http://localhost:3001
```

عند أول تسجيل دخول، عيّن بيانات اعتماد خاصة بك عندما يُطلب منك ذلك — ولا تُبقِ على القيم الافتراضية. تعرض اللوحات المُعدّة مسبقًا إنتاج الكتل ومعدل معالجة المعاملات واتصالات النظراء واستهلاك الموارد.

### فحص الحالة عبر REST

توفر واجهة REST API نقطة نهاية سريعة للحالة:

```
http://localhost:1317
```

---

## مرجع المنافذ

| المنفذ  | البروتوكول | الوصف                                              |
| ------- | --------- | -------------------------------------------------- |
| `26657` | TCP       | RPC — الاستعلام وبث المعاملات                      |
| `26656` | TCP       | P2P — التواصل الشبكي بين النظراء                   |
| `1317`  | HTTP      | REST API — الاستعلام عن حالة السلسلة عبر HTTP      |
| `9090`  | gRPC      | gRPC API — الوصول البرمجي إلى السلسلة              |
| `8545`  | HTTP      | EVM JSON-RPC — واجهة RPC متوافقة مع Ethereum (معرّف السلسلة `9800`) |
| `8546`  | WebSocket | EVM WebSocket — اشتراكات أحداث EVM في الوقت الفعلي |
| `8899`  | HTTP      | SVM RPC — واجهة RPC متوافقة مع Solana (للقراءة فقط؛ مسار معاملات SVM معطّل) |
| `26660` | HTTP      | نقطة نهاية مقاييس Prometheus                       |

---

## الخطوات التالية

* [إعداد المحفظة](/getting-started/wallet-setup) — إعداد محفظة لشبكة الاختبار
* [معاملتك الأولى](/getting-started/first-transaction) — أرسل أول تحويل QOR لك
