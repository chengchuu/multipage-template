# multipage-template

webpack 多页面 & GitLab 增量构建部署模板。

## 入口文件

每新建个独立的页面只需要在 `pages` 下面新建一个文件夹即可，但必须拥有两个入口文件 `index.html`、`index.js`。

```plain
├── package.json
└── src
    ├── index.js // pages 外部可以放一些通用的东西
    └── pages
        ├── page1
        │   ├── index.js
        │   └── index.html
        └── page2
            ├── style.css
            ├── index.js
            └── index.html
```

## 出口

构建打包出来的页面结构互相独立。

```text
├── package.json
└── dist
    ├── page1
    │   ├── index.html
    │   └── 20210526.194300
    │       ├── 7ffaa4103cae71b1629a.css
    │       └── 7ffaa4103cae71b1629a.js
    └── page2
        ├── index.html
        └── 20210526.194300
            ├── 88870cd4b2e554c2a754.css
            └── 88870cd4b2e554c2a754.js
```

## 增量部署

利用 GitLab 变量跑出有修改的 `pages` 文件夹，构建打包后使用阿里云 OSS 脚手架 [aliyunoss-cli](https://github.com/chengchuu/aliyunoss-cli) 自动上传到云端。

```bash
search_dir=src/pages
for path in "$search_dir"/*; do
echo "$(git diff HEAD~ --name-only | grep "$path")"
    if [ "$(git diff HEAD~ --name-only | grep "$path/")" ]; then
        page_name=$(basename $path)
        echo "[CI] Page \"$page_name\" has been modified"
        echo "[CI] Start building"
        npx cross-env NODE_ENV=production PAGE=$page_name node build/build.js
    fi
done
```

## 参考

- [使用 GitLab CI/CD 和阿里云 CLI 自动部署前端项目](http://blog.mazey.net/1695.html)
