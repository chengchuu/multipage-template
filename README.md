English | [简体中文](./README_CN.md)

# multipage-template

Webpack multi-page and GitLab incremental build deployment template.

## Entry

Each new standalone page only needs to create a folder under `pages`, but must have two entry files: `index.html` and `index.js`.

```
├── package.json
└── src
    ├── index.js // pages - You can put common things on the outside.
    └── pages
        ├── page1
        │   ├── index.js
        │   └── index.html
        └── page2
            ├── style.css
            ├── index.js
            └── index.html
```

## Output

Each packaged page is independent.

```
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

## Deploy

### Aliyun OSS

Use GitLab variable to run out of modified `pages` folder, and use Aliyun OSS CLI [aliyunoss-cli](https://github.com/chengchuu/aliyunoss-cli) to upload packaged files automatically.

```
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

### Docker

The page can be visited on `http://localhost:7415` by running the command: `bash DockerBuild.sh`.

## Notification

### WeixinWork

The notification will be opened after filling the file: `build\shell\notification.sh`.

## Reference

[Use GitLab CI/CD and Aliyun CLI to deploy front-end projects](https://blog.mazey.net/1695.html)

## Appendix

Address of this project: [https://github.com/chengchuu/multipage-template](https://github.com/chengchuu/multipage-template)
