---
slug: /build-before-qday/workshop-1/apps/python-airdrop
title: تطبيق Python، Q-Day Airdrop
sidebar_label: Python، Airdrop
sidebar_position: 6
---

# تطبيق Python: Q-Day Airdrop

**Q-Day Airdrop** أداة Python صغيرة ترسل QOR الاختبارية إلى قائمة كاملة من العناوين في معاملة **واحدة**، موقّعة بمفتاح كلاسيكي secp256k1 ومفتاح ما بعد كمومي ML-DSA-87 (FIPS 204). ثم تثبت من سجل السلسلة نفسها أن التوقيعين تم التحقق منهما. وتعمل على شبكة QoreChain الاختبارية (`qorechain-diana`، معرّف سلسلة EVM هو 9800).

## ما الذي يُظهره {#what-it-shows}

- **توقيع هجين ML-DSA-87 + secp256k1** من Python.
- **معاملة هجينة واحدة متحقَّق منها على السلسلة**، تدفع لعدة مستلمين دفعة واحدة برسالة إرسال متعدد واحدة.
- **تقرير تحقق** مبني على سجل المعاملة الصادر عن السلسلة نفسها، لا على كلام الأداة.

لماذا يهم ذلك: توقيع واحد يحمي إنزالًا مجانيًا كاملًا، ويظل محميًا ضد حاسوب كمومي مستقبلي لأن نصف ML-DSA-87 ما بعد كمومي. راجع [المعاملات الآمنة كموميًا](/sdk/guides/quantum-safe).

## خطوة بخطوة {#run}

كل ما يلي يعمل في طرفيتك الخاصة (macOS أو Linux أو Windows مع WSL). تستخدم حسابًا اختباريًا مؤقتًا فقط. QOR الاختبارية بلا قيمة، ولا تستخدم هنا محفظة حقيقية أبدًا.

### 1. ثبّت الأدوات {#install}

تحتاج إلى Git وPython 3.10 أو أحدث (مع `venv`). افحص ما لديك:

```bash
git --version
python3 --version      # must report 3.10 or later
python3 -m venv --help # prints usage if venv is available
```

إن كان شيء ناقصًا فثبّته أولًا، مثلًا من [python.org](https://www.python.org/downloads/) أو بمدير الحزم لديك (`brew install python` على macOS، و`sudo apt install python3 python3-venv git` على Debian أو Ubuntu). افتح طرفية جديدة وأعد الفحوص.

### 2. احصل على الشيفرة {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/06-python-airdrop
```

### 3. ثبّت الاعتماديات {#deps}

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

يثبّت هذا حزمة واحدة هي `qorechain-sdk==0.13.0`، إضافة إلى ما تحتاجه. أبقِ البيئة الافتراضية نشطة طوال الخطوات المتبقية (شغّل `source .venv/bin/activate` مرة أخرى في أي طرفية جديدة). تأكد أن الأداة تبدأ:

```bash
python airdrop.py --help
```

يجب أن ترى الأوامر `new` و`status` و`register` و`drop` و`verify`.

### 4. أنشئ حسابك الاختباري المؤقت {#key}

```bash
python airdrop.py new
```

يولّد هذا عبارة استرداد جديدة ويكتبها في ملف المفاتيح `~/.config/qday/python.env` (مقروء لك وحدك، صلاحيات 600)، ويطبع عنوان الحساب فقط، وهو يبدأ بـ `qor1...`. لا تُعرض العبارة أبدًا. لا تشارك هذا الملف ولا تُودِعه ولا تعِد استخدامه على الشبكة الرئيسية. لإبقاء المفتاح في مكان آخر، ضع `--key-file /path/to/file` قبل اسم الأمر (مثلًا `python airdrop.py --key-file ~/my.env status`) أو اضبط `QORE_KEY_FILE`.

انسخ العنوان `qor1...` من الناتج. إن ضاع منك فإن `python airdrop.py status` يطبعه مرة أخرى.

### 5. احصل على QOR اختبارية من الصنبور {#faucet}

1. افتح https://dashboard.qorechain.io/faucet وسجّل الدخول.
2. الصق عنوانك `qor1...` واطلب الرموز. يعطي الصنبور 100 QOR كل 24 ساعة.
3. تأكد من وصولها:

```bash
python airdrop.py status
```

يجب أن يعرض الرصيد QOR الاختبارية الخاصة بك، وأن يظهر المفتاح ما بعد الكمومي على أنه غير مسجَّل بعد.

### 6. سجّل مفتاحك ما بعد الكمومي {#register}

```bash
python airdrop.py register
```

يسجّل هذا مفتاح ML-DSA-87 على السلسلة مرة واحدة. وتشغيله مرة أخرى آمن. يُوقَّع التسجيل كلاسيكيًا، لأن المفتاح لا يستطيع أن يشارك في توقيع تسجيله بنفسه. كل معاملة بعده تُوقَّع هجينًا.

### 7. اكتب قائمة المستلمين {#list}

أنشئ ملفًا نصيًا فيه عنوان واحد من شبكة الاختبار في كل سطر. للتجربة الأولى، أنشئ بضعة عناوين مؤقتة بتوجيه `--key-file` إلى ملفات جديدة، أو استخدم عناوين أصدقاء يستخدمون شبكة الاختبار أيضًا:

```bash
python airdrop.py --key-file ~/.config/qday/r1.env new
python airdrop.py --key-file ~/.config/qday/r2.env new
```

ثم ضع العناوين المطبوعة في `addresses.txt`:

```text
# One qor1 address per line. Blank lines and lines starting with # are ignored.
qor1...first-testnet-address
qor1...second-testnet-address
```

تُتجاهل مع تحذير الأسطر الفارغة وتعليقات `#` والتكرارات والمرسل نفسه وكل ما ليس عنوان حساب `qor1...` صالحًا. الحد الأقصى 100 مستلم في المعاملة الواحدة. ويحتوي المستودع أيضًا على `addresses.example.txt`، وهو نموذج بأسطر نائبة.

### 8. أرسل الإنزال المجاني {#drop}

```bash
python airdrop.py drop addresses.txt 0.1 --memo "Build Before Q-Day"
```

القيمة `0.1` هي المبلغ بعملة QOR المرسل إلى كل مستلم. تعرض الأداة ملخصًا (المستلمون والمبلغ لكل واحد والمجموع) وتطلب منك التأكيد؛ أضف `--yes` لتخطي السؤال. ثم تحاكي المعاملة لتضبط الغاز، وتوقّعها بالمفتاحين، وتبثها معاملةً واحدة، وتطبع تقرير التحقق. إن فشل البث فانتظر دقيقة وأعد المحاولة.

### 9. تحقق من أي معاملة {#verify}

```bash
python airdrop.py verify <TX_HASH>
```

استخدم التجزئة التي طبعها `drop`. يطبع هذا تقرير التحقق وحده، لأي تجزئة معاملة.

## ما الذي يجب أن تراه {#output}

- يطبع `drop` تجزئة المعاملة والارتفاع، ثم تقرير التحقق: حالة `pqc_hybrid_verify` للموقّع هي `verified`، وتوقيع ML-DSA-87 بحجم 4627 بايت، والرمز 0، وعدد المستلمين يطابق قائمتك.
- في المستكشف: افتح `https://explore.qore.network/tx/<HASH>` وبدّل المستكشف إلى **Testnet**. تظهر المعاملة ناجحة، مع دفع كل مستلم.

## كيف يعمل الإثبات {#proof}

يقرأ `verify` النقطة `GET /cosmos/tx/v1beta1/txs/{hash}` من نقطة REST العامة لشبكة الاختبار ويفحص:

- حدثًا من النوع `pqc_hybrid_verify` للموقّع بالحالة `status=verified`؛
- أن الامتداد `/qorechain.pqc.v1.PQCHybridSignature` يحمل توقيع ML-DSA-87 بحجم 4627 بايت (إلى جانب توقيع secp256k1 البالغ 64 بايت)؛
- نجاح المعاملة (الرمز 0)، وكم مستلمًا دفعت لهم.

## شيفرة SDK المهمة {#code}

```python
from qorsdk import (derive_native_account, derive_pqc_canonical, msg, build_hybrid_tx,
                    auto_fee, hybrid_sign_and_broadcast, wait_for_tx,
                    resolve_sign_bytes_version)

account = derive_native_account(mnemonic)                   # classical secp256k1 key
pqc = derive_pqc_canonical(account.address, mnemonic)       # ML-DSA-87 key, same mnemonic

# ONE MsgMultiSend: one input (the sender), one output per recipient.
drop = msg.bank.multi_send(
    inputs=[Input(address=sender, coins=[Coin(denom="uqor", amount=str(each * len(to)))])],
    outputs=[Output(address=a, coins=[Coin(denom="uqor", amount=str(each))]) for a in to])

build = lambda fee, v: build_hybrid_tx(account=account, pqc_keypair=pqc, messages=[drop], fee=fee,
    memo=memo, chain_id="qorechain-diana", account_number=num, sequence=seq, sign_bytes_version=v)

v = resolve_sign_bytes_version("qorechain-diana", rest_url=REST)                 # "v2" on the testnet
fee = auto_fee(REST, build({"amount": [], "gas": "0"}, v), gas_multiplier=1.3)  # simulate
res = hybrid_sign_and_broadcast(lambda v: build(fee, v), chain_id="qorechain-diana", rest_url=REST)
included = wait_for_tx(rest, res["tx_response"]["txhash"])
```

يُسجَّل المفتاح مرة واحدة بـ `ensure_pqc_registered(...)`، الذي لا يفعل شيئًا إن كان المفتاح نفسه موجودًا على السلسلة. الغاز لا يكون ثابتًا أبدًا: تُحاكى المعاملة الهجينة الحقيقية أولًا ويكون الحد هو الغاز المحاكى مضروبًا في 1.3، بسعر 0.15 uqor للغاز الواحد.

الحساب بنوع العملة 118 (`m/44'/118'/0'/0/0`). يُشتق مفتاح ML-DSA-87 من عبارة الاسترداد نفسها ويُربط بالعنوان عبر `derive_pqc_canonical`. إن بنيت تطبيقك الخاص على المساعدات المعتمدة على البذرة بدلًا من ذلك، فإن SDK 0.13.0 يحتاج إلى رمز استرداد أو سرّ PQC مستقل من 32 بايت (في Python `unified_account_from_seed(seed32, recovery_code=...)`)؛ راجع [تثبيت SDK](/sdk/install#whats-new-0130). لا تطبع رمز استرداد أبدًا.

## الحزم المستخدمة {#packages}

| البند | الإصدار |
| --- | --- |
| `qorechain-sdk` (PyPI، يُستورد باسم `qorsdk`) | 0.13.0 (مثبّت في `requirements.txt` على هيئة `qorechain-sdk==0.13.0`) |
| Python | 3.10 أو أحدث |

تستورد الأداة أيضًا أنواع protobuf الآتية: `Input` و`Output` (من `cosmpy.protos.cosmos.bank.v1beta1.bank_pb2`) و`Coin` (من `cosmpy.protos.cosmos.base.v1beta1.coin_pb2`)؛ وتأتي مع SDK. راجع [تثبيت SDK](/sdk/install) لجدول الإصدارات بكل اللغات.

## أين تبحث عن كل شيء {#access}

| ماذا | أين |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| المستكشف | `https://explore.qore.network` (بدّل إلى Testnet) |
| الصنبور | https://dashboard.qorechain.io/faucet |
| الشيفرة | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/06-python-airdrop |
