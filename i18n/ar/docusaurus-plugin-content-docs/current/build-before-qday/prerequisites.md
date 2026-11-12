---
slug: /build-before-qday/prerequisites
title: "قبل أن تبدأ: الأدوات ومحفظة الشبكة التجريبية"
sidebar_label: "قبل أن تبدأ"
sidebar_position: 2
---

# قبل أن تبدأ: الأدوات ومحفظة الشبكة التجريبية

يبدأ كل درس في هذا القسم من حاسوب لم يُثبَّت عليه شيء. هذه الصفحة هي المكان الوحيد الذي تُجهّز فيه كل ذلك. افعل ذلك مرة واحدة، ثم افتح أي درس. يعود كل درس إلى هذه الصفحة ويكرّر فقط أوامر الفحص القصيرة التي يحتاجها.

**المدة المتوقعة:** من 20 إلى 40 دقيقة تقريبًا في المرة الأولى، ومعظمها تنزيلات. ثبّت فقط أدوات الدرس الذي تريد اتباعه.

:::caution حساب تجريبي مؤقت فقط
كل ما هنا يعمل على **الشبكة التجريبية** (testnet) في QoreChain، حيث لا قيمة لـ QOR. لا تستخدم أبدًا محفظتك الحقيقية ولا عبارة استرجاع حقيقية ولا أموالًا حقيقية في أي درس. ستنشئ حسابًا جديدًا لهذا التمرين فقط.
:::

## ما الأدوات التي يحتاجها كل درس؟ {#which-tools}

ثبّت فقط الصفوف التي تحتاجها. أما Git والطرفية ومتصفح الويب فتلزم جميع الدروس.

| الدرس | اللغة | الأدوات المطلوب تثبيتها | محفظة QoreX |
| --- | --- | --- | --- |
| [دليل الورشة 1](/build-before-qday/workshop-1) | TypeScript | Node.js وpnpm وcurl وjq (اختياري) | غير مطلوبة |
| [Q-Day Counter](/build-before-qday/workshop-1/apps/qday-counter) | TypeScript | Git وNode.js وpnpm | غير مطلوبة |
| [Q-Day Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) | TypeScript | Git وNode.js وpnpm | مطلوبة، مع حساب Ethereum (coin 60) |
| [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) | TypeScript | Git وNode.js وpnpm | مطلوبة |
| [Rust, qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) | Rust | Git وRust | غير مطلوبة |
| [Java, Tip Jar](/build-before-qday/workshop-1/apps/java-tipjar) | Java | Git وJava 21 وMaven | غير مطلوبة |
| [Python, Airdrop](/build-before-qday/workshop-1/apps/python-airdrop) | Python | Git وPython 3.10 أو أحدث | غير مطلوبة |

## افتح الطرفية {#terminal}

الطرفية (terminal) نافذة تكتب فيها الأوامر. ستنسخ الأوامر من هذه الصفحات وتلصقها فيها، واحدًا تلو الآخر.

| النظام | كيف تفتحها |
| --- | --- |
| macOS | اضغط Command وSpace، واكتب `Terminal`، ثم اضغط Return. |
| Windows | افتح قائمة ابدأ، واكتب `PowerShell`، ثم افتح **Windows PowerShell**. لدرس Java تحتاج أيضًا إلى **Git Bash** (يأتي مع Git، انظر أدناه) أو WSL. |
| Linux | اضغط Ctrl وAlt وT، أو ابحث عن `Terminal` في تطبيقاتك. |

بعد تثبيت أي أداة، **أغلق الطرفية وافتح طرفية جديدة**. الطرفية التي كانت مفتوحة أثناء التثبيت لا ترى الأداة الجديدة بعد.

## ثبّت الأدوات {#install}

لكل أداة ستجد أمر التثبيت أو رابط التنزيل، ثم **أمر الفحص**. يسأل أمر الفحص الأداة عن إصدارها. إذا طبع رقم إصدار يساوي المطلوب أو يزيد عليه، فالأداة تعمل.

### مديرو الحزم (مساعدون اختياريون) {#package-managers}

مدير الحزم يثبّت برامج أخرى بأمر واحد. ويمكنك أيضًا تنزيل كل أداة يدويًا من موقعها. تستخدم الأوامر أدناه المساعد المناسب لنظامك.

| النظام | المساعد | كيف تحصل عليه |
| --- | --- | --- |
| macOS | Homebrew | الصق هذا السطر الواحد في الطرفية، ثم اتبع ما يطبعه: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` |
| Windows | winget | موجود أصلًا في Windows 10 و11. افحصه بالأمر `winget --version`. |
| Linux | apt | موجود أصلًا في Ubuntu وDebian. للأنظمة الأخرى: استخدم مدير الحزم الخاص بك (`dnf` أو `pacman`). |

### Git {#git}

يُنزّل Git الشيفرة النموذجية من GitHub.

| النظام | التثبيت |
| --- | --- |
| macOS | `xcode-select --install` (تُفتح نافذة، اختر **Install**)، أو `brew install git` |
| Windows | `winget install --id Git.Git -e`، أو نزّله من [git-scm.com](https://git-scm.com/download/win) |
| Linux | `sudo apt install -y git` |

افحصه:

```bash
git --version
```

يجب أن ترى سطرًا مثل `git version 2.40.0`. أي إصدار يصلح.

### Node.js 22.13 أو أحدث {#node}

يشغّل Node.js مشاريع TypeScript. أما Hardhat 3، وهي أداة العقود المستخدمة هنا، فترفض العمل على أي إصدار أقدم من Node.js 22.13.

| النظام | التثبيت |
| --- | --- |
| macOS | `brew install node`، أو نزّل مثبّت LTS من [nodejs.org](https://nodejs.org) |
| Windows | `winget install --id OpenJS.NodeJS.LTS -e`، أو نزّل مثبّت LTS من [nodejs.org](https://nodejs.org) |
| Linux (Ubuntu وDebian) | `curl -fsSL https://deb.nodesource.com/setup_22.x \| sudo -E bash -` ثم `sudo apt install -y nodejs` |

:::note Linux: لا تستخدم حزمة apt الافتراضية
في Ubuntu وDebian يعطيك الأمر `sudo apt install nodejs` إصدارًا قديمًا ورقمه أقل من المطلوب. استخدم سطر NodeSource أعلاه.
:::

افحصه:

```bash
node -v
```

يجب أن ترى `v22.13.0` أو أعلى، مثل `v22.20.0` أو `v24.1.0`. إذا رأيت رقمًا أقل، فأعد التثبيت وافتح طرفية جديدة.

### pnpm 9 أو أحدث {#pnpm}

يثبّت pnpm المكتبات التي يحتاجها مشروع TypeScript. وهو يؤدي عمل `npm` نفسه، لكن بسرعة أكبر.

ثبّته بأداة التثبيت الخاصة بـ Node.js، وهي `npm`، على كل الأنظمة:

```bash
npm install -g pnpm
```

| الجزء | ماذا يفعل |
| --- | --- |
| `npm install` | ينزّل برنامجًا ويثبّته. |
| `-g` | اختصار لكلمة "global" أي عام: يثبّته لحاسوبك كله لا لمجلد واحد. |
| `pnpm` | البرنامج المطلوب تثبيته. |

في macOS وLinux، إذا انتهى الأمر بالخطأ `EACCES` أو "permission denied"، فشغّله مرة أخرى بالصيغة `sudo npm install -g pnpm`.

:::caution Node.js المثبَّت من Homebrew لا يتضمن pnpm
إذا قال لك درس `pnpm: command not found` (أو `zsh: command not found: pnpm`)، فهذا يعني أنك لم تثبّت pnpm بعد. شغّل `npm install -g pnpm`، وافتح طرفية جديدة، ثم أعد المحاولة.
:::

افحصه:

```bash
pnpm -v
```

يجب أن ترى `9.0.0` أو أعلى، مثل `10.4.1`.

### curl وjq (لدليل الورشة 1 فقط) {#curl-jq}

ينزّل `curl` عنوان ويب من الطرفية. ستستخدمه لقراءة معاملتك من نقطة REST العامة. ويصفّي `jq` الإجابة الطويلة ليُظهر لك الجزء الذي تريده فقط. استخدام `jq` اختياري.

| النظام | curl | jq |
| --- | --- | --- |
| macOS | مضمّن. | `brew install jq` |
| Windows | مضمّن في Windows 10 و11 باسم `curl.exe`. | `winget install --id jqlang.jq -e` |
| Linux | `sudo apt install -y curl` إن لم يكن موجودًا | `sudo apt install -y jq` |

افحصهما:

```bash
curl --version
jq --version
```

يجب أن ترى سطر إصدار لكل منهما، مثل `jq-1.7`.

:::note Windows PowerShell: اكتب curl.exe
في PowerShell تكون الكلمة القصيرة `curl` أمرًا مدمجًا مختلفًا. اكتب `curl.exe` بدلًا من `curl` في كل أمر في هذه الصفحات. وإذا كنت تستخدم Git Bash فإن `curl` وحدها تعمل.
:::

### Rust 1.88 أو أحدث (لدرس Rust فقط) {#rust}

يُترجم Rust تطبيق سطر الأوامر `qday-pay`. ثبّته بالأداة `rustup`، وهي المثبّت الرسمي لـ Rust. وهي تثبّت أيضًا `cargo`، أداة البناء في Rust.

| النظام | التثبيت |
| --- | --- |
| macOS | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (اضغط Return لقبول الخيار الافتراضي). أدوات المُصرّف تأتي مع `xcode-select --install`. |
| Windows | نزّل `rustup-init.exe` وشغّله من [rustup.rs](https://rustup.rs)، أو `winget install --id Rustlang.Rustup -e`. حين يطلب أدوات Visual Studio C++ Build Tools فوافق: يحتاجها Rust لبناء البرامج على Windows. |
| Linux | `sudo apt install -y build-essential curl` ثم `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (اضغط Return لقبول الخيار الافتراضي) |

افحصه:

```bash
rustc --version
cargo --version
```

يجب أن ترى `rustc 1.88.0` أو أعلى وسطر إصدار لـ `cargo`. وإذا كان Rust مثبّتًا عندك أصلًا، فالأمر `rustup update` يحدّثه.

### Java 21 وMaven (لدرس Java فقط) {#java}

يحتاج تطبيق Tip Jar إلى JDK بإصدار Java 21 أو أحدث (أدوات بناء Java وتشغيله) وإلى Maven، أداة البناء التي تنزّل مكتبات Java.

| النظام | التثبيت |
| --- | --- |
| macOS | `brew install --cask temurin@21` ثم `brew install maven` (أو استخدم المثبّت من [adoptium.net](https://adoptium.net)) |
| Windows | `winget install --id EclipseAdoptium.Temurin.21.JDK -e`، ثم نزّل Maven من [maven.apache.org/download.cgi](https://maven.apache.org/download.cgi)، وفكّ ضغطه، وأضف مجلد `bin` فيه إلى `PATH`. الطريق الأسهل: ثبّت WSL (انظر أدناه) واتبع سطر Linux. |
| Linux | `sudo apt install -y openjdk-21-jdk maven` |

افحصهما:

```bash
java -version
mvn -version
```

يجب أن ترى `openjdk version "21` (أو رقمًا أعلى مثل 25) و`Apache Maven 3.` يتبعه رقم إصدار. وإذا أظهر `java -version` الرقم 17 أو أقل، فثبّت Java 21 وافتح طرفية جديدة.

### Python 3.10 أو أحدث مع venv (لدرس Python فقط) {#python}

يشغّل Python تطبيق Airdrop. وينشئ `venv` مجلدًا خاصًا لمكتباته، فلا يُمَسّ أي شيء آخر على حاسوبك.

| النظام | التثبيت |
| --- | --- |
| macOS | `brew install python`، أو نزّله من [python.org](https://www.python.org/downloads/) |
| Windows | `winget install --id Python.Python.3.12 -e`، أو نزّله من [python.org](https://www.python.org/downloads/) وفعّل الخيار **Add python.exe to PATH** في المثبّت |
| Linux | `sudo apt install -y python3 python3-venv python3-pip` |

افحصه:

```bash
python3 --version
```

يجب أن ترى `Python 3.10.0` أو أعلى. في Windows اكتب `python --version` بدلًا منه (الأمر هو `python` وليس `python3`).

### Windows وأوامر Linux: WSL {#wsl}

معظم الأوامر في الدروس واحدة على كل الأنظمة. وبعضها يستخدم ميزات صدفة Linux: `source` و`chmod` و`./tipjar` و`sleep`. في Windows أمامك خياران:

1. **Windows الأصلي.** استخدم PowerShell لدروس TypeScript وRust وPython. تعطي الدروس صيغة Windows حيث تختلف، مثل `.venv\Scripts\activate`. أما لدرس Java فاستخدم **Git Bash** (يُثبَّت مع Git).
2. **WSL.** يمنحك Windows Subsystem for Linux نظام Linux حقيقيًا داخل Windows. افتح PowerShell كمسؤول، وشغّل الأمر أدناه، وأعد التشغيل، ثم اتبع أسطر **Linux** في هذه الصفحة داخل نافذة Ubuntu.

```powershell
wsl --install
```

| الجزء | ماذا يفعل |
| --- | --- |
| `wsl` | أداة Windows Subsystem for Linux. |
| `--install` | يثبّت WSL ونظام Ubuntu Linux في خطوة واحدة. |

## افحص كل شيء دفعة واحدة {#check-all}

شغّل الأوامر الخاصة بالأدوات التي ثبّتّها. يجب أن يطبع كل أمر رقم إصدار.

```bash
git --version
node -v
pnpm -v
rustc --version
java -version
mvn -version
python3 --version
```

| الفحص | الإجابة السليمة |
| --- | --- |
| `node -v` | `v22.13.0` أو أعلى |
| `pnpm -v` | `9.0.0` أو أعلى |
| `rustc --version` | `rustc 1.88.0` أو أعلى |
| `java -version` | `21` أو أعلى |
| `mvn -version` | `Apache Maven 3.` ورقم إصدار |
| `python3 --version` | `Python 3.10.0` أو أعلى |

## احصل على محفظة للشبكة التجريبية {#wallet}

تحتاج إلى مكان تحتفظ فيه بـ QOR التجريبي. بعض الدروس تنشئ لك حسابًا مؤقتًا داخل ملف. وبعضها يستخدم محفظة **QoreX**، المحفظة الرسمية لـ QoreChain، بعد تحويلها إلى الشبكة التجريبية. الجدول في [ما الأدوات التي يحتاجها كل درس؟](#which-tools) يبيّن أيّها.

### QoreX على الشبكة التجريبية {#qorex}

1. ثبّت QoreX من الصفحة الرسمية: [App Store](https://apps.apple.com/us/app/qorex-wallet/id6791256626) لأجهزة iPhone، و[Google Play](https://play.google.com/store/apps/details?id=network.qore.qorex) لأجهزة Android، و[Chrome Web Store](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) لمتصفحات Chrome وBrave وEdge وArc وOpera، أو [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/qorex/). القائمة الكاملة في [نظرة عامة على QoreX](/qorex/overview).
2. أنشئ محفظة **جديدة** واحفظ عبارة الاسترجاع على الورق. لا تستورد عبارة تحمل أموالًا حقيقية.
3. حوّل المحفظة إلى الشبكة التجريبية:
   - **تطبيق الهاتف:** افتح **Settings**، ثم فعّل **Use testnet (developers)**.
   - **إضافة المتصفح:** افتحها، ثم اضغط **رقم الإصدار في أسفل الشاشة** 7 مرات. يظهر خيار للمطورين. اختر **Switch to testnet (diana)**.
4. تأكد من ظهور شارة الشبكة التجريبية. اسم الشبكة التجريبية هو `qorechain-diana`.

**ما يجب أن تراه:** شارة الشبكة التجريبية في المحفظة، وعنوانًا بصيغة `qor1...` في الشاشة الرئيسية. أرصدة الشبكة التجريبية لا تُظهر قيمة بالدولار، وهذا طبيعي.

### أضف حساب Ethereum (coin 60) {#coin-60}

يستخدم درس Guestbook مسار EVM، لذلك تحتاج المحفظة إلى حساب بنمط Ethereum.

1. في QoreX افتح قائمة الحسابات واختر **Add an Ethereum account (coin 60)**.
2. أنشئ حسابًا جديدًا. لا تستعد عبارة تحمل أموالًا حقيقية.
3. اختر ذلك الحساب. سيظهر عنوان يبدأ بـ `0x...`.

**ما يجب أن تراه:** حسابًا عنوانه *Ethereum, coin 60*، وعنوانًا يبدأ بـ `0x`. وللحساب نفسه عنوان آخر بصيغة `qor1...`.

للمزيد عن الحسابات: [حساب QoreX ولوحة التحكم](/qorex/account-and-dashboard) و[ابدأ مع QoreX](/qorex/getting-started).

## احصل على QOR تجريبي من الحنفية {#faucet}

تعطي الحنفية (faucet) QOR تجريبيًا مجانيًا لعنوان على الشبكة التجريبية. يجب أن يستلم الحساب الجديد بعضًا منه قبل أن يفعل أي شيء، لأن كل معاملة تدفع رسمًا صغيرًا للشبكة.

1. افتح [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet) في متصفحك.
2. سجّل الدخول إلى لوحة تحكم QoreChain.
3. الصق عنوانك `qor1...` في خانة العنوان.
4. اختر **Request Tokens**.
5. انتظر ظهور **Tokens Sent!**.

**ما يجب أن تراه:** البطاقة **Tokens Sent!** مع 100 QOR، ورابط **View on Explorer**.

تدفع الحنفية **100 QOR مرة كل 24 ساعة لكل حساب** ولكل عنوان. وإذا طلبت مرة أخرى مبكرًا جدًا فستظهر **Rate Limit Reached**. انتظر حتى تنقضي الـ 24 ساعة. طلب واحد يكفي لكل دروس هذه الصفحة.

### معاملتك الأولى تسجّل مفتاحك ما بعد الكمّي {#first-tx}

لكل حساب في QoreChain مفتاحان: مفتاح كلاسيكي ومفتاح ML-DSA-87 ما بعد كمّي. المعاملة الأولى لأي حساب جديد **تسجّل مفتاح ML-DSA-87 على السلسلة**. يحدث ذلك مرة واحدة فقط لكل حساب، وتبلغ كلفته نحو **0.09 QOR**. وبعدها تُوقَّع كل معاملة بالمفتاحين معًا.

لترى كيف يُصنع المفتاح ويُربط بحسابك، اقرأ [كيف يرتبط مفتاحك ما بعد الكمّي بحسابك](/build-before-qday/key-binding).

تنفّذ الدروس هذه الخطوة نيابة عنك بأمر اسمه `register`. لا تحتاج إلى فعل شيء الآن. فالـ 100 QOR من الحنفية تغطيها مرات كثيرة.

## QOR وuqor {#units}

سترى اسمين للعملة نفسها. **QOR** هو العملة كاملة. و**uqor** هو أصغر جزء منها.

**1 QOR = 1,000,000 uqor.**

| ما تراه | معناه |
| --- | --- |
| `1` QOR | 1,000,000 uqor |
| `0.1` QOR | 100,000 uqor |
| `0.09` QOR | 90,000 uqor |
| `0.15uqor` | سعر 0.15 uqor لكل وحدة غاز، يُستخدم عند دفع رسم |

تستخدم المحافظ ومعظم الأوامر QOR. أما السلسلة نفسها فتحسب بوحدة uqor. و**المذكرة** (memo) نص قصير تُرفقه بالمعاملة، مثل `Hello from the workshop`. يستطيع أي شخص قراءتها على السلسلة، فلا تضع فيها سرًا أبدًا.

**الغاز** (gas) هو مقياس العمل الذي تطلب المعاملة من الشبكة إنجازه. والرسم هو الغاز المستهلك مضروبًا في سعر الغاز. تقدّر الأدوات في هذا القسم الغاز نيابة عنك، فلا تحسب شيئًا بنفسك.

## حافظ على مفاتيحك المؤقتة {#key-hygiene}

ينشئ الدرس سرًّا لحسابك على الشبكة التجريبية ويخزّنه على حاسوبك. تعامل معه بعناية، رغم أن QOR التجريبي بلا قيمة، لتكوّن هذه العادة قبل الشبكة الرئيسية.

1. **أين يوجد.** في دروس TypeScript تُحفظ الأسرار في ملف اسمه `.env` داخل مجلد المشروع. أما تطبيقات Rust وJava وPython فتكتب ملف مفتاح بالأمر `new`، في مجلد مخفي اسمه `.config/qday` داخل مجلدك الشخصي. ويذكر الدرس اسم الملف بدقة.
2. **لا تشاركه أبدًا.** لا تلصقه في محادثة أو بريد إلكتروني أو لقطة شاشة أو فيديو. أخفِ الملف عند مشاركة شاشتك.
3. **لا ترفعه أبدًا إلى Git.** لا تضف `.env` ولا ملف مفتاح إلى Git، ولا تدفعه إلى GitHub. أضف `.env` إلى `.gitignore` إن لم يكن المشروع يتجاهله أصلًا.
4. **للشبكة التجريبية فقط.** لا تعِد استخدام مفتاح تجريبي أو عبارة استرجاع أو رمز استرداد على الشبكة الرئيسية.
5. **احذفه عند الانتهاء.** حين تنهي الدرس، احذف ملف المفتاح أو `.env`. يمكنك دائمًا إنشاء حساب جديد في دقيقة.

:::danger أموال حقيقية
لا تضع أبدًا مفتاح حساب يحمل أموالًا حقيقية، ولا mnemonic (عبارة الاسترجاع)، ولا رمز الاسترداد، في ملف `.env` أو ملف مفتاح أو أي أمر في هذا القسم.
:::

## الشبكة ونقاط النهاية العامة {#network}

| الخدمة | القيمة |
| --- | --- |
| اسم الشبكة التجريبية | `qorechain-diana` |
| معرّف سلسلة EVM | 9800 |
| REST (قراءة البيانات عبر الويب) | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` |
| المستكشف | [explore.qore.network](https://explore.qore.network)، ثم بدّل إلى **Testnet** |
| الحنفية | [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet) |

## استكشاف الأخطاء وإصلاحها {#troubleshooting}

| ما تراه | السبب | ما تفعله |
| --- | --- | --- |
| `pnpm: command not found` | pnpm غير مثبّت. لا يتضمنه Node.js، حتى عند تثبيته بـ Homebrew. | شغّل `npm install -g pnpm`، وافتح طرفية جديدة، ثم شغّل `pnpm -v`. |
| `node: command not found`، أو إصدار قديم بعد التثبيت | كانت الطرفية مفتوحة أثناء التثبيت، أو أن الإصدار القديم يأتي أولًا. | أغلق الطرفية، وافتح واحدة جديدة، وشغّل `node -v`. في Linux استخدم سطر NodeSource لا حزمة apt الافتراضية. |
| `ERROR: You are using Node.js ... which is not supported by Hardhat` | Node.js أقدم من 22.13. | ثبّت Node.js 22.13 أو أحدث، ثم شغّل `pnpm install` في المشروع من جديد. |
| `EACCES` أو permission denied أثناء `npm install -g pnpm` | لا يملك مستخدمك صلاحية الكتابة في المجلد العام. | شغّل `sudo npm install -g pnpm` في macOS وLinux. |
| `rustc: command not found` بعد تثبيت Rust | الطرفية لا تعرف قيمة `PATH` الجديدة بعد. | افتح طرفية جديدة. وإن استمر الخطأ فشغّل `source "$HOME/.cargo/env"`. |
| `linker 'cc' not found` أو `link.exe not found` عند بناء Rust | أدوات مُصرّف C مفقودة. | macOS: `xcode-select --install`. Linux: `sudo apt install -y build-essential`. Windows: ثبّت Visual Studio C++ Build Tools. |
| `java -version` يُظهر 17 أو أقل | إصدار Java أقدم يأتي أولًا. | ثبّت Java 21، وافتح طرفية جديدة، ثم افحص مرة أخرى. |
| تقول PowerShell إن تشغيل السكربتات معطّل عند تفعيل بيئة Python venv | يمنع Windows السكربتات افتراضيًا. | شغّل `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`، وأجب `Y`، ثم فعّل البيئة من جديد. |
| `Rate Limit Reached` في الحنفية | تدفع الحنفية مرة كل 24 ساعة لكل حساب ولكل عنوان. | انتظر حتى تنتهي الـ 24 ساعة. طلب واحد يكفي لكل الدروس. |
| لا تُظهر المحفظة شارة الشبكة التجريبية | ما زالت المحفظة على الشبكة الرئيسية. | تطبيق الهاتف: Settings، ثم **Use testnet (developers)**. الإضافة: اضغط رقم الإصدار 7 مرات، ثم **Switch to testnet (diana)**. |
| `account has no PQC key and classical fallback is disabled` | لم يسجّل الحساب الجديد مفتاح ML-DSA-87 بعد. | شغّل خطوة `register` الخاصة بالدرس أولًا (فهي أول معاملة للحساب). |
| أخطاء CORS في وحدة تحكم المتصفح | لا ترسل نقطة REST العامة ترويسات CORS، فلا تستطيع صفحة ويب استدعاءها مباشرة. | استدعِ النقطة عبر وكيل `/lcd` الخاص بالمشروع، كما يفعل القالب. |

## الخطوة التالية {#next}

اختر درسًا من [النظرة العامة](/build-before-qday/overview#choose) واتبعه من أول أمر.
