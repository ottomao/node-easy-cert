# 用于管理自生成的HTTPS证书的插件
本插件可以生成自签名的root证书，并基于该root证书，生成各个域名的HTTPS证书。

# 使用方式
```js
const CertManager = require('cert-manager');

const options = {
  rootName: '.certmanager_custom', // default to .certmanager_certs
  fullRootDir: '/the/full/path/of/the/dir' // if specified, the instance will take this as root dir
}

crtMgr.generateRootCA();
```
# 配置项(可选)

## rootName
证书的根目录名，默认放在 `user_home` 的目录下

## fullRootDir
证书目录的全路径，如果配置，优先级高于rootName

# 证书生成目录
默认情况下，证书都会生成在 `{USER_HOME}/{ROOT_NAME}/`,  其中`ROOT_NAME` 默认为 *.certmanager_certs*。
如果配置了`fullRootDir`, 那么所有的证书都会生成在该目录下

# 错误码
在运行过程中，会根据错误原因抛出指定错误码，包括如下

### ROOT_CA_NOT_EXISTS
root根证书不存在。当我们执行的某个操作依赖于根证书，而根证书不存在时，就会抛出该异常。我们可以尝试生成根证书