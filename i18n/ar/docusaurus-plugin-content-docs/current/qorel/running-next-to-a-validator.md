---
slug: /qorel/running-next-to-a-validator
title: تشغيل QORel بجانب مدقّق
sidebar_label: بجانب مدقّق
sidebar_position: 6
---

# تشغيل QORel بجانب مدقّق

كثيرًا ما يرحّل المدقّقون قنوات سلسلتهم. يمكن تشغيل QORel على مضيف المدقّق، أو كحاوية جانبية (sidecar)، أو في Kubernetes. تعرض هذه الصفحة التخطيطات الثلاثة والقواعد التي تُبقي المُرحِّل معزولًا عن مفاتيح المدقّق نفسه. وهي موجّهة إلى مشغّلي المدقّقين والعقد. ولتشغيل العقدة نفسها راجع [تشغيل مدقّق](/developer-guide/running-a-validator) و[تشغيل عقدة](/developer-guide/running-a-node).

الترحيل اليوم على شبكة الاختبار فقط: شُغِّل QORel مقابل `qorechain-diana`، ولا توجد قناة IBC مفتوحة على الشبكة الرئيسية.

## الابتكارات {#innovations}

- **خدمة مُحصَّنة في الحزمة.** تثبّت حزمتا `.deb` و`.rpm` الخدمة `qorel.service` التي تعمل بمستخدمها الخاص `qorel`، مع umask بقيمة `0077`، وبلا صلاحيات جديدة، و`/tmp` خاص، ونظام ملفات للقراءة فقط خارج `/var/lib/qorel`، وبلا مخلّفات ذاكرة (core dumps).
- **مفاتيح في الذاكرة فقط، إن أردت.** يعيد تخطيط Kubernetes بناء المفاتيح عند بدء الـ pod من secret إلى وحدة تخزين مدعومة بالذاكرة، فلا تلمس ملفات المفاتيح القرص أبدًا.
- **ملفات مفاتيح للمالك وحده.** ملفات المفاتيح، بما فيها البذرة ما بعد الكمومية، بصلاحيات 0600.
- **فحوص يمكنك التنبيه عليها.** يبلّغ `qorel keys pqc-status` عن `ready_to_relay`، ويوقف فحص ما قبل الإرسال معاملة سترفض قبل إنفاق أي رسم.

## كيفية الاستخدام {#how-to-use}

### القواعد الأساسية {#ground-rules}

- **استخدم حساب مُرحِّل مخصصًا.** لا مفتاح مشغّل المدقّق أبدًا ولا مفتاح الإجماع أبدًا. موّله بما يحتاجه المُرحِّل للرسوم.
- **عملية مُرحِّل واحدة لكل مفتاح مُرحِّل.** عمليتان توقّعان بالمفتاح نفسه تتنازعان على تسلسلات الحساب.
- **رحّل قنواتك فقط.** اضبط `packet_filter`.
- **وجّه QORel إلى العقدة المحلية.** استخدم `http://127.0.0.1:26657` و`http://127.0.0.1:9090` و`ws://127.0.0.1:26657/websocket`، وأبقِ تلك المنافذ مغلقة أمام الإنترنت. وهذا يمنح المُرحِّل أيضًا نقطة gRPC غير المتاحة علنًا.
- **على QoreChain**، سجّل مفتاح المُرحِّل ما بعد الكمومي مرة واحدة بالأمر `qorel keys register-pqc`، وتحقق من `qorel keys pqc-status` قبل البدء.

### 1. systemd على مضيف المدقّق {#systemd}

1. ثبّت حزمة `.deb` أو `.rpm` ([التثبيت](/qorel/install#packages)). فهي تُنشئ مستخدم نظام `qorel`، منفصلًا عن مستخدم المدقّق، وخدمة `qorel.service` مُحصَّنة.
2. حرّر `/etc/qorel/config.toml` بنقاط نهاية العقدة المحلية.
3. أضف مفتاح المُرحِّل بصفة المستخدم `qorel`، وسجّل المفتاح ما بعد الكمومي:

   ```bash
   sudo -u qorel qorel --config /etc/qorel/config.toml keys add --chain qorechain-diana --key-name relayer --mnemonic-file <file>
   sudo -u qorel qorel --config /etc/qorel/config.toml keys register-pqc --chain qorechain-diana
   sudo -u qorel qorel --config /etc/qorel/config.toml keys pqc-status --chain qorechain-diana
   ```

4. شغّل `systemctl enable --now qorel`.
5. امنح QORel أولوية أدنى من العقدة، كي لا ينافسها أبدًا على إنتاج الكتل:

   ```ini
   # /etc/systemd/system/qorel.service.d/priority.conf
   [Service]
   Nice=10
   CPUWeight=20
   MemoryMax=1G
   ```

   ثم `systemctl daemon-reload && systemctl restart qorel`.

### 2. حاوية Docker Compose الجانبية {#compose}

```yaml
services:
  qorel:
    image: ghcr.io/qorechain/qorel:0.1.0
    command: ["--config", "/home/nonroot/.hermes/config.toml", "start"]
    network_mode: host          # reach the node on 127.0.0.1
    restart: unless-stopped
    volumes:
      - ./qorel:/home/nonroot/.hermes   # config.toml + keys/ (owner uid 65532, mode 0700)
    deploy:
      resources:
        limits: { cpus: "1.0", memory: 1g }
```

أضف المفاتيح مرة واحدة بالصورة نفسها، مثلًا:

```bash
docker run --rm -v $PWD/qorel:/home/nonroot/.hermes ghcr.io/qorechain/qorel:0.1.0 \
  keys add --chain qorechain-diana --key-name relayer --mnemonic-file /home/nonroot/.hermes/relayer.mnemonic
docker run --rm --network host -v $PWD/qorel:/home/nonroot/.hermes ghcr.io/qorechain/qorel:0.1.0 \
  keys register-pqc --chain qorechain-diana
```

احذف ملف العبارة السرية بعد ذلك.

### 3. Kubernetes {#kubernetes}

احتفظ بالعبارة السرية في مخزن الأسرار لديك وأعد بناء المفاتيح عند البدء:

1. تشغّل حاوية تهيئة (init container) الأمر `qorel keys add` داخل `emptyDir` بقيمة `medium: Memory` (سجّل المفتاح ما بعد الكمومي مرة واحدة، يدويًا، قبل ذلك).
2. تشغّل الحاوية الرئيسية `qorel start` على وحدة التخزين نفسها.

بهذه الطريقة لا توجد المفاتيح إلا في الذاكرة.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: qorel }
spec:
  replicas: 1                      # never more than one per key
  strategy: { type: Recreate }
  selector: { matchLabels: { app: qorel } }
  template:
    metadata: { labels: { app: qorel } }
    spec:
      securityContext: { runAsNonRoot: true, runAsUser: 65532, fsGroup: 65532 }
      volumes:
        - name: home
          emptyDir: { medium: Memory }
        - name: config
          configMap: { name: qorel-config }
        - name: mnemonic
          secret: { secretName: qorel-relayer-mnemonic }   # key: mnemonic
      initContainers:
        - name: keys
          image: ghcr.io/qorechain/qorel:0.1.0
          args: ["--config", "/config/config.toml", "keys", "add", "--chain", "qorechain-diana",
                 "--key-name", "relayer", "--mnemonic-file", "/secret/mnemonic", "--overwrite"]
          volumeMounts:
            - { name: home, mountPath: /home/nonroot/.hermes }
            - { name: config, mountPath: /config }
            - { name: mnemonic, mountPath: /secret, readOnly: true }
        # repeat the init container for each chain in the config
      containers:
        - name: qorel
          image: ghcr.io/qorechain/qorel:0.1.0
          args: ["--config", "/config/config.toml", "start"]
          ports: [{ containerPort: 3001, name: telemetry }]
          resources: { limits: { cpu: "1", memory: 1Gi } }
          volumeMounts:
            - { name: home, mountPath: /home/nonroot/.hermes }
            - { name: config, mountPath: /config }
```

يجب أن يشير `key_store_folder` في ملف الإعدادات إلى `/home/nonroot/.hermes/keys` (أو يُترك دون ضبط).

### المراقبة {#monitoring}

فعّل القياس عن بُعد ونبّه عند وجود حزم معلّقة، وأرصدة المُرحِّل، وحالة المفتاح ما بعد الكمومي، وحداثة العملاء. القائمة في [المراقبة](/qorel/monitoring).

## كيفية الوصول {#how-to-access}

- **الشبكة.** شبكة الاختبار `qorechain-diana`. يتصل المُرحِّل بمنافذ عقدتك المحلية وبنقاط نهاية السلسلة الأخرى.
- **الحسابات.** حساب مُرحِّل مخصص على كل سلسلة، ممول للرسوم؛ ولا يكون أبدًا مفتاح مشغّل المدقّق.
- **المضيف.** Linux مع systemd للتخطيط 1؛ وDocker مع شبكة المضيف للتخطيط 2؛ وعنقود مع `emptyDir` مدعوم بالذاكرة للتخطيط 3.
- **التكلفة.** الرسوم فقط. تحدّ الأمثلة أعلاه المُرحِّل بمعالج واحد و1 GiB من الذاكرة.

## أين يُنشر {#where-published}

الحزم وصورة الحاوية والمصدر مدرجة في [التثبيت](/qorel/install#where-published). وملف الإعدادات النموذجي هو `packaging/config.example.toml` في [qorechain/QORel](https://github.com/qorechain/QORel).

## الحدود والمشكلات المعروفة {#limits}

- **ليس من واجبات المدقّق.** الترحيل اختياري ومنفصل عن التدقيق؛ وتوقف المُرحِّل لا يؤثر في الإجماع.
- **عملية واحدة لكل مفتاح.** التحديثات المتدرجة التي تبدأ pod ثانيًا بالمفتاح نفسه تكسر تسلسل الحساب؛ ولذلك يستخدم المثال `Recreate`.
- **التسجيل اليدوي.** `keys register-pqc` خطوة يدوية تُجرى مرة واحدة؛ وحاوية التهيئة في Kubernetes تعيد بناء المفاتيح فقط.
- **شبكة الاختبار فقط.** لا توجد قناة في الشبكة الرئيسية لترحيلها بعد.
