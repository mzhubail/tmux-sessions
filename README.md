## Tmux-sessioner

<!--This is a lua script to create tmux sessions from a YAML file.-->

- Supports setting the environment variables session-wide, through config or through current environment variables.
- Supports specifying each windows and splits with each having its own working directory.

### Sample config

```yaml
env:
  - name: KUBECONFIG
    default: /home/mzh/just-for-now/trading-app/kubeconfig.yaml
  - name: AWS_ACCESS_KEY_ID
  - name: AWS_SECRET_ACCESS_KEY
  - name: AWS_SESSION_TOKEN
  - name: SOMETHING
    value: my_val

windows:
  - cmd: lg
  - cmd: npm run start
    working_directory: ../angularui
  - cmd: vim
    working_directory: ../angularui
  - cmd: helm upgrade --force mzh .
    norun: true
  - split:
      leftside:
        cmd: echo hi
        norun: true
      rightside:
        cmd: echo hello
        working_directory: "~"
```

#### Sample output

```sh
tmux \
    setenv KUBECONFIG              "${KUBECONFIG:-/home/mzh/just-for-now/trading-app/kubeconfig.yaml}"  \; \
    setenv AWS_ACCESS_KEY_ID       "$AWS_ACCESS_KEY_ID"                                                 \; \
    setenv AWS_SECRET_ACCESS_KEY   "$AWS_SECRET_ACCESS_KEY"                                             \; \
    setenv AWS_SESSION_TOKEN       "$AWS_SESSION_TOKEN"                                                 \; \
                  send-keys '  lg'                                                      C-m \; \
    new-window \; send-keys '  cd ../angularui' C-m \; send-keys '  npm run start'      C-m \; \
    splitw -h  \; send-keys '  cd ../angularui' C-m \; send-keys '  vim'                C-m \; \
    new-window \; send-keys '  helm delete mzh ; helm install mzh .'                        \; \
    new-window \; send-keys '  watch -n 1 kubectl get all -l app.kubernetes.io/part-of=fix-engine' C-m \; \
    new-window \; send-keys '  k logs -fl app.kubernetes.io/component=gateway '             \; \
    new-window \; send-keys '  k logs -fl app.kubernetes.io/component=server '              \; \
    new-window \; send-keys '  k exec -it '                                                 \;
```
