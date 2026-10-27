---
slug: /qorel/running-next-to-a-validator
title: 밸리데이터 옆에서 QORel 실행하기
sidebar_label: 밸리데이터 옆에서 실행하기
sidebar_position: 6
---

# 밸리데이터 옆에서 QORel 실행하기

밸리데이터는 자신의 체인 채널을 직접 릴레이하는 경우가 많습니다. QORel은 밸리데이터 호스트에서, 사이드카 컨테이너로, 또는 Kubernetes에서 실행할 수 있습니다. 이 페이지는 세 가지 구성과 릴레이어를 밸리데이터 자체의 키와 분리해 두는 규칙을 다룹니다. 밸리데이터와 노드 운영자를 위한 것입니다. 노드 자체를 운영하는 방법은 [밸리데이터 운영하기](/developer-guide/running-a-validator)와 [노드 운영](/developer-guide/running-a-node)을 참고하세요.

현재 릴레이는 테스트넷 전용입니다. QORel은 `qorechain-diana`를 상대로 실행되었고, 열려 있는 메인넷 IBC 채널은 없습니다.

## 혁신 {#innovations}

- **패키지에 포함된 하드닝된 서비스.** `.deb`와 `.rpm`은 자체 `qorel` 사용자로 실행되고, `0077` umask, no new privileges, 비공개 `/tmp`, `/var/lib/qorel` 바깥의 읽기 전용 파일 시스템을 적용하며, 코어 덤프를 만들지 않는 `qorel.service`를 설치합니다.
- **원한다면 키를 메모리에만 둘 수 있습니다.** Kubernetes 구성은 파드가 시작될 때 시크릿에서 메모리 기반 볼륨으로 키를 다시 만들므로, 키 파일이 디스크에 닿지 않습니다.
- **소유자 전용 키 파일.** 포스트 양자 시드를 포함한 키 파일은 모드 0600입니다.
- **알림을 걸 수 있는 검사.** `qorel keys pqc-status`는 `ready_to_relay`를 보고하며, 전송 전 검사는 거부될 트랜잭션을 수수료가 소모되기 전에 막습니다.

## 사용 방법 {#how-to-use}

### 기본 원칙 {#ground-rules}

- **전용 릴레이어 계정을 사용하세요.** 밸리데이터 운영자 키나 컨센서스 키는 절대 안 됩니다. 릴레이어가 수수료에 필요한 만큼만 넣어 두세요.
- **릴레이어 키당 릴레이어 프로세스 하나.** 같은 키로 서명하는 두 프로세스는 계정 시퀀스를 두고 충돌합니다.
- **자신의 채널만 릴레이하세요.** `packet_filter`를 설정하세요.
- **QORel이 로컬 노드를 가리키게 하세요.** `http://127.0.0.1:26657`, `http://127.0.0.1:9090`, `ws://127.0.0.1:26657/websocket`을 사용하고 해당 포트는 인터넷에 닫아 두세요. 이렇게 하면 공개적으로는 제공되지 않는 gRPC 엔드포인트도 릴레이어가 사용할 수 있습니다.
- **QoreChain에서는** `qorel keys register-pqc`로 릴레이어의 포스트 양자 키를 한 번 등록하고, 시작하기 전에 `qorel keys pqc-status`를 확인하세요.

### 1. 밸리데이터 호스트의 systemd {#systemd}

1. `.deb` 또는 `.rpm` 패키지를 설치합니다([설치](/qorel/install#packages)). 밸리데이터의 사용자와는 별개인 `qorel` 시스템 사용자와 하드닝된 `qorel.service`가 만들어집니다.
2. `/etc/qorel/config.toml`을 로컬 노드 엔드포인트로 편집합니다.
3. 사용자 `qorel`로 릴레이어 키를 추가하고 포스트 양자 키를 등록합니다.

   ```bash
   sudo -u qorel qorel --config /etc/qorel/config.toml keys add --chain qorechain-diana --key-name relayer --mnemonic-file <file>
   sudo -u qorel qorel --config /etc/qorel/config.toml keys register-pqc --chain qorechain-diana
   sudo -u qorel qorel --config /etc/qorel/config.toml keys pqc-status --chain qorechain-diana
   ```

4. `systemctl enable --now qorel`을 실행합니다.
5. 블록 생성과 경쟁하지 않도록 QORel의 우선순위를 노드보다 낮춥니다.

   ```ini
   # /etc/systemd/system/qorel.service.d/priority.conf
   [Service]
   Nice=10
   CPUWeight=20
   MemoryMax=1G
   ```

   그런 다음 `systemctl daemon-reload && systemctl restart qorel`을 실행합니다.

### 2. Docker Compose 사이드카 {#compose}

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

같은 이미지로 키를 한 번 추가합니다. 예:

```bash
docker run --rm -v $PWD/qorel:/home/nonroot/.hermes ghcr.io/qorechain/qorel:0.1.0 \
  keys add --chain qorechain-diana --key-name relayer --mnemonic-file /home/nonroot/.hermes/relayer.mnemonic
docker run --rm --network host -v $PWD/qorel:/home/nonroot/.hermes ghcr.io/qorechain/qorel:0.1.0 \
  keys register-pqc --chain qorechain-diana
```

이후에 니모닉 파일을 삭제하세요.

### 3. Kubernetes {#kubernetes}

니모닉은 시크릿 저장소에 보관하고 시작할 때 키를 다시 만듭니다.

1. init 컨테이너가 `medium: Memory`인 `emptyDir`에 `qorel keys add`를 실행합니다(포스트 양자 키는 사전에 한 번 수동으로 등록하세요).
2. 메인 컨테이너가 같은 볼륨에서 `qorel start`를 실행합니다.

이렇게 하면 키가 메모리에만 존재합니다.

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

설정의 `key_store_folder`는 `/home/nonroot/.hermes/keys`를 가리켜야 합니다(또는 지정하지 않은 채로 두세요).

### 모니터링 {#monitoring}

텔레메트리를 활성화하고 대기 중인 패킷, 릴레이어 잔액, 포스트 양자 키 상태, 클라이언트 최신성에 알림을 거세요. 목록은 [모니터링](/qorel/monitoring)에 있습니다.

## 접근 방법 {#how-to-access}

- **네트워크.** 테스트넷 `qorechain-diana`. 릴레이어는 직접 운영하는 노드의 로컬 포트와 상대 체인의 엔드포인트에 연결합니다.
- **계정.** 각 체인에 수수료용 자금이 있는 전용 릴레이어 계정. 밸리데이터 운영자 키는 절대 사용하지 마세요.
- **호스트.** 구성 1은 systemd가 있는 Linux, 구성 2는 호스트 네트워킹이 가능한 Docker, 구성 3은 메모리 기반 `emptyDir`을 쓸 수 있는 클러스터.
- **비용.** 수수료뿐입니다. 위 예제는 릴레이어를 CPU 1개와 메모리 1 GiB로 제한합니다.

## 배포 위치 {#where-published}

패키지, 컨테이너 이미지, 소스는 [설치](/qorel/install#where-published)에 나열되어 있습니다. 예제 설정은 [qorechain/QORel](https://github.com/qorechain/QORel)의 `packaging/config.example.toml`입니다.

## 한계와 알려진 문제 {#limits}

- **밸리데이터의 의무가 아닙니다.** 릴레이는 선택 사항이며 밸리데이션과는 별개입니다. 릴레이어가 멈춰도 컨센서스에는 영향이 없습니다.
- **키당 프로세스 하나.** 같은 키로 두 번째 파드를 시작하는 롤링 업데이트는 계정 시퀀스를 깨뜨립니다. 예제는 `Recreate`를 사용합니다.
- **수동 등록.** `keys register-pqc`는 한 번만 하는 수동 단계입니다. Kubernetes init 컨테이너는 키만 다시 만듭니다.
- **테스트넷 전용.** 아직 릴레이할 메인넷 채널이 없습니다.
