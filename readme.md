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

# 方法
### generateRootCA(callback(error))
在证书根目录下面生成根证书rootCA.crt 和 rootCA.key。生成后，请选择rootCA.crt,**安装并信任**，否则您的组件可能工作失败。

#### 返回
- 无

#### 参数
- callback `function`
回调函数，将在结束后被调用，如果有异常，异常将作为第一个参数传入

### getCertificate(hostname, callback([error, keyContent, crtContent]))
获取指定域名下的证书的key和crt内容，如果证书还不存在，则会先创建该证书

#### 返回
- 无

#### 参数
- `hostname` `string`
所要获取证书内容的hostname

- `callback` `function`
获取到内容后的回调函数，主要包含key的内容和crt的内容，如果获取过程中出现异常，则放入error变量中
> 获取子域名的证书，要求已经存在根证书，否则会提示失败。组件会抛出对应的异常。您可以捕获并通过 `generateRootCA()`来生成根证书。**并安装并请信任该根证书**

### getRootDirPath()
获取由当前cert-manager实例所管理的证书的根目录

#### 返回
- `string` 当前cert-manager实例所管理的证书所对应的根目录。默认为{USER_HOME}/.certmanager_certs/

### getRootCAFilePath()
获取根证书的全路径

#### 返回
- `string` 根证书的全路径，如果根证书不存在，将返回空字符串

### isRootCAFileExists()
获取根证书是否存在的状态

#### 返回
- `bool` 是否存在根证书

### clearCerts(callback(error))
清除当前目录下所有的证书文件

#### 返回
- 无

#### 参数
- `callback`  `function`
删除结束后的回调函数，如果删除过程中有错误，将会被放入error对象中

# 错误码
在运行过程中，会根据错误原因抛出指定错误码，包括如下

- `ROOT_CA_NOT_EXISTS`
root根证书不存在。当我们执行的某个操作依赖于根证书，而根证书不存在时，就会抛出该异常。我们可以尝试生成根证书