---
slug: /qorel/install
title: تثبيت QORel
sidebar_label: التثبيت
sidebar_position: 3
---

# تثبيت QORel

QORel ملف تنفيذي واحد هو `qorel`. تعرض هذه الصفحة كل طريقة لتثبيته وكيفية التحقق مما نزّلته. وهي موجّهة إلى المشغّلين الذين يُعدّون مُرحِّلًا على خادم أو حاسوب محمول أو منصة حاويات. اختر قناة واحدة؛ فكلها تثبّت البرنامج نفسه.

يُنشر كل إصدار على [GitHub Releases](https://github.com/qorechain/QORel/releases) تحت الوسم `qorel-v<version>` (مثل `qorel-v0.1.0`)، ويحمل ملف `SHA256SUMS` وشهادات إثبات مصدر البناء (build provenance attestations) التي يمكنك التحقق منها بالأمر `gh attestation verify <file> --repo qorechain/QORel`. أما الوسوم العادية `v*` في المستودع (مثل `v0.1.0`) فهي تاريخ Hermes الأصلي وليست إصدارات QORel؛ استخدم دائمًا البادئة `qorel-v`.

## الابتكارات {#innovations}

- **تنزيلات يمكن فحصها.** الأرشيفات المضغوطة (tarballs) مغطاة بالملف `SHA256SUMS` وبشهادات البناء، فيمكنك التأكد من سلامة الملف ومن أنه بُني بواسطة سير عمل الإصدار في مستودع QORel.
- **صورة حاوية موقّعة.** الصورة `ghcr.io/qorechain/qorel` موقّعة بتوقيع cosign بلا مفاتيح (keyless)؛ ويسمّي التوقيع سير عمل الإصدار في المستودع، ويمكنك التحقق منه قبل تشغيل الصورة.
- **خدمة مُحصَّنة في الحزم.** تثبّت حزمتا `.deb` و`.rpm` الخدمة `qorel.service` التي تعمل بمستخدمها الخاص `qorel` ومجلده الرئيسي في `/var/lib/qorel`، مع umask بقيمة `0077`، وبلا صلاحيات جديدة، و`/tmp` خاص، ونظام للقراءة فقط، وصلاحية كتابة في `/var/lib/qorel` فقط.
- **صورة صغيرة بلا توزيعة (distroless).** الحاوية متعددة المعماريات (amd64 وarm64)، وبلا توزيعة، وبلا صلاحيات الجذر.

## كيفية الاستخدام {#how-to-use}

| المنصة | القنوات |
|---|---|
| Linux x86_64 أو arm64 (glibc 2.28 أو أحدث: Ubuntu 20.04+ وDebian 11+ وRHEL وRocky أو Alma 8+ وAmazon Linux 2023) | أرشيف tarball، و`.deb`، و`.rpm`، وحاوية، وHomebrew |
| macOS بمعالج Apple Silicon أو Intel | أرشيف tarball، وHomebrew |
| Docker أو Kubernetes | `ghcr.io/qorechain/qorel` |
| أي نظام فيه سلسلة أدوات Rust | من المصدر |

نظام Windows غير مدعوم (ولا يُصدر Hermes الأصلي إصدارًا له أيضًا)؛ شغّل الحاوية تحت WSL2.

### أرشيف الإصدار {#tarball}

```bash
V=0.1.0
T=x86_64-unknown-linux-gnu   # or aarch64-unknown-linux-gnu, aarch64-apple-darwin, x86_64-apple-darwin
curl -LO https://github.com/qorechain/QORel/releases/download/qorel-v$V/qorel-v$V-$T.tar.gz
curl -LO https://github.com/qorechain/QORel/releases/download/qorel-v$V/SHA256SUMS
sha256sum --ignore-missing -c SHA256SUMS   # macOS: shasum -a 256 --ignore-missing -c SHA256SUMS
tar -xzf qorel-v$V-$T.tar.gz
sudo install -m 0755 qorel-v$V-$T/qorel /usr/local/bin/qorel
qorel --version
```

يجب أن يطبع سطر فحص المجموع `OK` للأرشيف قبل فكّ ضغطه.

### Debian وUbuntu وعائلة RHEL {#packages}

```bash
V=0.1.0
sudo apt install ./qorel_${V}_amd64.deb       # or arm64
sudo dnf install ./qorel-${V}-1.x86_64.rpm    # or aarch64
```

نزّل الحزمة من صفحة الإصدار أولًا وقارنها بالملف `SHA256SUMS`. تثبّت الحزم ما يلي:

- `/usr/bin/qorel`
- خدمة `qorel.service` مُحصَّنة، تعمل بالمستخدم `qorel` ومجلده الرئيسي في `/var/lib/qorel`
- `/etc/qorel/config.example.toml`

ثم أعدّ ملف الإعدادات والمفاتيح بصفة المستخدم `qorel`:

```bash
sudo cp /etc/qorel/config.example.toml /etc/qorel/config.toml   # edit it
sudo -u qorel qorel --config /etc/qorel/config.toml keys add --chain <chain> --key-name relayer --mnemonic-file <file>
sudo -u qorel qorel --config /etc/qorel/config.toml keys register-pqc --chain qorechain-diana   # QoreChain only, once
sudo -u qorel qorel --config /etc/qorel/config.toml health-check
sudo systemctl enable --now qorel
```

احذف ملف العبارة السرية بعد `keys add`. تُكتب ملفات المفاتيح بحيث يقرؤها المالك وحده (0600).

### Homebrew (على macOS وLinux) {#homebrew}

```bash
brew install qorechain/tap/qorel
qorel --version
```

### الحاوية {#container}

```bash
docker run --rm ghcr.io/qorechain/qorel:0.1.0 --version
docker run -d --name qorel --restart unless-stopped \
  -v $HOME/.qorel:/home/nonroot/.hermes \
  ghcr.io/qorechain/qorel:0.1.0 start
```

يُقرأ ملف الإعدادات (`config.toml`) والمجلد `keys/` من المجلد المركَّب. يجب أن يكون المجلد مملوكًا للمعرّف uid 65532 وبصلاحيات 0700.

تحقق من توقيع الصورة قبل تشغيلها:

```bash
cosign verify ghcr.io/qorechain/qorel:0.1.0 \
  --certificate-identity-regexp 'https://github.com/qorechain/QORel/.github/workflows/qorel-release.yml@refs/tags/qorel-v.*' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

### من المصدر {#from-source}

```bash
cargo install --locked --git https://github.com/qorechain/QORel --tag qorel-v0.1.0 ibc-relayer-cli --bin qorel
```

يتطلب هذا Rust 1.85 وprotoc وclang؛ وعلى Linux يتطلب أيضًا ترويسات OpenSSL. أضف `--features vendored-openssl` لتجميع OpenSSL ضمن البناء بدلًا من ذلك.

### تأكد من أنه يعمل {#check}

```bash
qorel --version
qorel --help
```

يسرد `qorel keys --help` الأوامر `add` و`register-pqc` و`pqc-status` ضمن أوامر المفاتيح.

## كيفية الوصول {#how-to-access}

- **التكلفة.** مجاني؛ ترخيص Apache-2.0.
- **الحسابات.** لا يلزم أي حساب للتثبيت. وللترحيل تحتاج إلى حساب مُرحِّل على كل سلسلة (راجع [البدء السريع](/qorel/quickstart)).
- **الوصول إلى الشبكة.** يحتاج المضيف إلى وصول صادر إلى نقاط نهاية RPC وgRPC وWebSocket لكل سلسلة تضبطها.
- **المتطلبات المسبقة.** للحزم والأرشيفات: glibc 2.28 أو أحدث. وللبناء من المصدر: Rust 1.85 وprotoc وclang.

## أين يُنشر {#where-published}

| القناة | الاسم | الإصدار | الرابط |
|---|---|---|---|
| GitHub Releases | `qorel-v0.1.0-<target>.tar.gz` و`.deb` و`.rpm` و`SHA256SUMS` | 0.1.0 | [إصدارات qorechain/QORel](https://github.com/qorechain/QORel/releases) |
| مرآة التنزيل | `download.qore.host/qorel/v0.1.0/<file>`, `download.qore.host/qorel/latest/<file>`, `latest.json` | 0.1.0 | [download.qore.host/qorel/latest.json](https://download.qore.host/qorel/latest.json) |
| Homebrew | `qorechain/tap/qorel` | 0.1.0 | `brew install qorechain/tap/qorel` |
| سجل الحاويات | `ghcr.io/qorechain/qorel` | 0.1.0 | `docker pull ghcr.io/qorechain/qorel:0.1.0` |
| المصدر | `ibc-relayer-cli`، والملف التنفيذي `qorel` | الوسم `qorel-v0.1.0` | [github.com/qorechain/QORel](https://github.com/qorechain/QORel) |

## الحدود والمشكلات المعروفة {#limits}

- **لا يوجد إصدار لـ Windows.** استخدم الحاوية تحت WSL2.
- **إصدار تجريبي مسبق وملفات كبيرة.** الإصدار 0.1.0 منشور كإصدار تجريبي مسبق (pre-release) على GitHub. حجم كل ملف في الإصدار نحو 110 MB لأن الملفات التنفيذية لم تُجرَّد بعد. لا توجد صورة على Docker Hub؛ استخدم صورة `ghcr.io` المذكورة أعلاه.
- **ثبّت الإصدار.** تستخدم الأوامر أعلاه الإصدار `0.1.0`. استخدم الإصدار الذي تنوي تشغيله بدلًا من `latest`، واقرأ [صفحة الإصدارات](https://github.com/qorechain/QORel/releases) لمعرفة الأحدث.
- **عملية واحدة لكل مفتاح.** لا تشغّل خدمة الحزمة وحاوية بمفتاح المُرحِّل نفسه؛ فعمليتان توقّعان بالمفتاح نفسه تتنازعان على تسلسلات الحساب.
- **مكان مخزن المفاتيح.** تحفظ الحزم المفاتيح تحت `/var/lib/qorel`؛ وتقرؤها الحاوية من المجلد المركَّب؛ ويستخدم التثبيت بالأرشيف `~/.hermes/keys` ما لم يضبط ملف الإعدادات `key_store_folder`.

التالي: [البدء السريع](/qorel/quickstart)، [الإعدادات](/qorel/configuration)، [التشغيل بجانب مدقّق](/qorel/running-next-to-a-validator).
