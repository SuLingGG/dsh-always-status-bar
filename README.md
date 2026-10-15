# dsh-always-status-bar

> DeepSeek Harness Web 插件：让消息原生的状态栏——`日期 | 时间`，以及
> Assistant 侧的 `用时 · 首 token · tok/s`——无需悬停即可始终显示。

[DSH](https://github.com/deepseek-ai/deepseek-harness) 原生已渲染这些信息，但默认仅在 Hover 时显示，容易被错过。本插件以一条 scoped CSS 覆盖将其常驻显示：复用原生渲染与原生位置，日期/时间格式随 DSH 自动更新，不新增任何可见 UI。

- **Always visible**：用户消息与 Assistant 消息的状态栏常驻显示，Hover 前后一致
- **Zero config**：无设置项、无开关、无存储、无后端、无网络请求，安装即生效
- **Clean uninstall**：卸载后完全恢复原生 Hover-only 行为，不残留 DOM / CSS / 配置
- **Minimal & safe**：不扫描 DOM、无 MutationObserver、无轮询；只改一行的可见性，不碰按钮行为、布局或配色

> 本仓库是 [Bobnemimimmi/dsh-always-status-bar](https://github.com/Bobnemimimmi/dsh-always-status-bar)
> 的 fork，把覆盖规则适配到 DSH 0.1.7-alpha.1 起的**行级**淡出机制（见下）。

维护：[SuLingGG](https://github.com/SuLingGG) · 问题与反馈：[GitHub Issues](https://github.com/SuLingGG/dsh-always-status-bar/issues)

## 机制

原生样式在 `@media (hover:hover)` 里淡出的是**整行** action row，不是时钟 `<span>`：

```css
/* @deepseek-ai/dsh-client-ui-chat/MessageIconActions.module.css */
[data-actions-reveal=hover] .[hash]_actions,
:is([data-chat-flow-kind=user],[data-chat-flow-kind=steering])
  :has(~:is([data-chat-flow-kind=user],[data-chat-flow-kind=steering])) .[hash]_actions
  { opacity: 0; transition: opacity 80ms }
```

`0.1.x` 时代那条规则只隐藏时钟 span、且挂在 `data-time-hover-root` 上；该属性如今已不存在，
而且整行作为一个单位淡出时，子元素自己的 `opacity: 1` 逃不出来（子 opacity 与父相乘）。
唯一可用的把手因此是**行本身**，本插件就是把它拉回 `opacity: 1`：

```css
[data-actions-reveal=hover] [data-clock],
:is([data-chat-flow-kind=user],[data-chat-flow-kind=steering]):has(~:is([data-chat-flow-kind=user],[data-chat-flow-kind=steering])) [data-clock] {
  opacity: 1 !important;
}
```

- `[data-clock]`（`"start"` / `"end"`）是 DSH 自己 CSS 就在用的语义属性，不受构建期
  `[hash]_[local]` 改名影响；两条臂逐条对应原生两条隐藏规则，只多不少。
- 不使用 `>` 子选择器：slot 条目（点赞 / 点踩）挂在一个 `display: contents` 包装节点下 ——
  对布局不可见，但仍是 DOM 节点，层级敏感的选择器会静默漏掉它们。
- 行可见即行内一切可见，包括同行承载的按钮（复制 / 分支 / 点赞 / 点踩）。这是本插件的
  预期语义：每条消息一枚常驻状态行，等同于 DSH 给 `data-actions-reveal="always"`
  那行（结束本轮的回复）的原生渲染。
- 不额外包 `@media (hover:hover)`：原生隐藏规则本身就在该查询内，无悬停设备上本来就
  不隐藏，这条声明落在 `opacity: 1` 上等于空操作。

## Usage

### 安装

#### 1. 从本仓库安装（推荐，含 0.1.7-alpha.1+ 的修复）

```sh
# 跟随 main（最新修复）
dsh plugin --profile web add github:SuLingGG/dsh-always-status-bar

# 或锁定 tag / commit（可复现）
dsh plugin --profile web add github:SuLingGG/dsh-always-status-bar#v0.1.1
dsh plugin --profile web add git+https://github.com/SuLingGG/dsh-always-status-bar.git#<commit-sha>
```

本包带 `prepare` 自构建；pnpm ≥10 首次 `add` 可能拒绝并要求授权，按提示把打印出来的 `allowBuilds`
键加进 profile 的 `pnpm-workspace.yaml` 后重跑即可。构建产物 `lib/` 已随仓库一起提交，所以
**即使授权被拒也能正常加载**，授权只是让构建再跑一遍。

#### 2. 从 Release tarball 安装（不触发任何构建脚本）

```sh
# 在仓库根目录生成产物；prepack 会先跑一次 build.mjs
npm pack        # -> dsh-always-status-bar-0.1.1.tgz
```

把该 tarball 上传到 GitHub Release，然后：

```sh
dsh plugin --profile web add https://github.com/SuLingGG/dsh-always-status-bar/releases/download/v0.1.1/dsh-always-status-bar-0.1.1.tgz
```

#### 3. 本地目录 / tarball

```sh
dsh plugin --profile web add ./dsh-always-status-bar
```

重启 `dsh web` 即生效。

#### 安装后确认

`dsh.profile.bundles` 与 `dependencies` 里应各有一条：

```sh
grep -n always-status-bar ~/.dsh/profiles/web/package.json
```

> **不要用 npm 上的 `dsh-always-status-bar`**：那里目前只有上游未修复的 `0.1.0`，在
> DSH ≥ `0.1.2-alpha.2` 上是空操作（它锚定的 `data-time-hover-root` 已不存在）。
> 在 `0.1.1` 发布到 npm 之前，请用上面的 GitHub / tarball 方式安装。

### 卸载

```sh
dsh plugin --profile web remove dsh-always-status-bar
```

重启 `dsh web` 后恢复原生 Hover-only 行为。

## Requirements

- DeepSeek Harness（`dsh web`）—— 已逐版本核对 **`0.1.7-alpha.1` … `0.2.1-alpha.3`**（含当前
  `latest` = `0.2.0-rc.2`）。核对方式：取每个已发布版本的 `dsh-client-ui-chat`
  自己的 `MessageIconActions.module.css`，在同一套 DOM 夹具里跑真实浏览器层叠比较。
- `dsh` CLI（或按 DSH 文档以源码方式运行 `pnpm dsh`）

不支持的范围（这些版本上本插件会是空操作）：

| DSH | 原因 |
|---|---|
| `0.1.2-alpha.2` … `0.1.6-alpha.2` | 行级淡出已经存在，但这一行的 div 只有 `className`，没有任何 `data-*` 锚点可挂 |
| `0.1.1-rc.2` 及更早 | 这一行当时还渲染在 `dsh-client-ui-conversation` 里，锚点是 `data-time-hover-root`，机制不同 |

`package.json` 的 `peerDependencies` 声明了 `@deepseek-ai/dsh >= 0.1.7-alpha.1`；DSH 组装
profile 时会校验，不匹配时**只禁用本插件这一行**并打印原因，不会波及其它插件。

DSH 迭代较快；升级后若状态栏未常驻显示，先核对 `[data-clock]` 是否仍在这一行上、
`MessageIconActions.module.css` 的隐藏机制是否仍是行级 `opacity`。

## 开发

```sh
pnpm install
pnpm run typecheck
pnpm test          # 构建 + vitest
```

`pnpm test` 里的 CSS 契约测试是**静态**断言（解析选择器与声明），校验的是规则的形状而非
层叠结果；真正的可见性行为由上面 Requirements 所述的逐版本真机夹具验证。

## License

MIT
