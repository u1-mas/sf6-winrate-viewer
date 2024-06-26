# sf6-winrate-viewer

deno deployを使用しています。

- https://sf6-winrate-viewer.deno.dev/

## Setup

.env に EMAIL, PASSWORD, DENO_KV_ACCESS_TOKEN を指定する

- 平文なので要注意

### 開発時

初回のみ

```sh
deno task hook install
```

> https://deno.land/x/deno_hooks@0.1.2

### WSL

- 日本語フォントを入れる

```sh
sudo apt install language-pack-ja
sudo apt install fonts-ipafont
sudo apt install fonts-ipaexfont
fc-cache -fv
```

> https://lef237.hatenablog.com/entry/2022/12/05/163550
