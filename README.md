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
