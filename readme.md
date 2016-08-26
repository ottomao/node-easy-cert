# 用于管理自生成的HTTPS证书的插件
本插件可以生成自签名的root证书，并基于该root证书，生成各个域名的HTTPS证书
# 使用方式
```js
const certManager = require('cert-manager')();

certManager.generateRootCA();
```
# 配置项

## rootName
证书的根目录名，默认放在 user_home的目录下

## fullRootDir
证书目录的全路径，如果配置，优先级高于rootName