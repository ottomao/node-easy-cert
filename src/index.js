delete require.cache['./certGenerator'];

var exec = require('child_process').exec,
    spawn         = require('child_process').spawn,
    path          = require("path"),
    fs            = require("fs"),
    os            = require("os"),
    color         = require('colorful'),
    readline      = require('readline'),
    certGenerator = require("./certGenerator"),
    util          = require('./util'),
    Errors        = require('./errorConstants'),
    asyncTask     = require("async-task-mgr");


function CertManager (options) {
    options = options || {};
    var rootDirName = util.getDefaultRootDirName();
    var rootDirPath  = options.rootDirPath || path.join(util.getUserHome(),"/" + rootDirName + "/");

    if (options.defaultCertAttrs) {
        certGenerator.setDefaultAttrs(options.defaultCertAttrs);
    }

    var isWin             = /^win/.test(process.platform),
        certDir           = rootDirPath,
        rootCAcrtFilePath = path.join(certDir,"rootCA.crt"),
        rootCAkeyFilePath = path.join(certDir,"rootCA.key"),
        createCertTaskMgr = new asyncTask();
    var cache_rootCACrtFileContent, cache_rootCAKeyFileContent;
    var rootCAExists = false;

    if(!fs.existsSync(certDir)){
        try{
            fs.mkdirSync(certDir, '0777');
        }catch(e){
            console.log("===========");
            console.log("failed to create cert dir ,please create one by yourself - " + certDir);
            console.log("===========");
        }
    }

    function getCertificate(hostname,certCallback){
        if (!_checkRootCA()) {
            console.log(color.yellow('please generate root CA before getting certificate for sub-domains'));
            certCallback && certCallback(Errors.ROOT_CA_NOT_EXISTS);
            return;
        }
        var keyFile = path.join(certDir , "__hostname.key".replace(/__hostname/,hostname) ),
            crtFile = path.join(certDir , "__hostname.crt".replace(/__hostname/,hostname) );

        if(!cache_rootCACrtFileContent || !cache_rootCAKeyFileContent){
            cache_rootCACrtFileContent = fs.readFileSync(rootCAcrtFilePath, { encoding: 'utf8' });
            cache_rootCAKeyFileContent = fs.readFileSync(rootCAkeyFilePath, { encoding: 'utf8' });
        }

        createCertTaskMgr.addTask(hostname,function(callback){
            if(!fs.existsSync(keyFile) || !fs.existsSync(crtFile)){
                try{
                    var result = certGenerator.generateCertsForHostname(hostname, {
                        cert: cache_rootCACrtFileContent,
                        key: cache_rootCAKeyFileContent
                    });
                    fs.writeFileSync(keyFile, result.privateKey);
                    fs.writeFileSync(crtFile, result.certificate);
                    callback(null, result.privateKey, result.certificate);

                }catch(e){
                    callback(e);
                }
            }else{
                callback(null , fs.readFileSync(keyFile) , fs.readFileSync(crtFile));
            }

        },function(err,keyContent,crtContent){
            if(!err){
                certCallback(null ,keyContent,crtContent);
            }else{
                certCallback(err);
            }
        });
    }

    function clearCerts(cb){
        if(isWin){
            exec("del * /q",{ cwd : certDir },cb);
        }else{
            exec("rm -f *.key *.csr *.crt *.srl .DS_Store",{ cwd : certDir },cb);
        }
    }

    function isRootCAFileExists(){
        return (fs.existsSync(rootCAcrtFilePath) && fs.existsSync(rootCAkeyFilePath));
    }

    function generateRootCA(options, certCallback){
        console.log('options.commonName is:', options.commonName);
        if (!options || !options.commonName) {
            console.error(color.red('The "options.commonName" for rootCA is required, please specify.'));
            certCallback(Errors.ROOT_CA_COMMON_NAME_UNSPECIFIED);
            return;
        }

        if(isRootCAFileExists()){
            if (options.overwrite) {
                startGenerating(options.commonName, certCallback);
            } else {
                console.error(color.red('The rootCA exists already, if you want to overwrite it, please specify the "options.overwrite=true"'));
                certCallback(Errors.ROOT_CA_EXISTED);
                return;
            }
        }else{
            startGenerating(options.commonName, certCallback);
        }

        function startGenerating(commonName, certCallback){
            //clear old certs
            clearCerts(function(error){
                console.log(color.green("temp certs cleared"));
                try{
                    var result = certGenerator.generateRootCA(commonName);
                    fs.writeFileSync(rootCAkeyFilePath, result.privateKey);
                    fs.writeFileSync(rootCAcrtFilePath, result.certificate);

                    console.log(color.green("rootCA generated"));
                    console.log(color.green(color.bold("PLEASE TRUST the rootCA.crt in " + certDir)));

                    certCallback && certCallback(null, rootCAkeyFilePath, rootCAcrtFilePath);
                }catch(e){
                    console.log(color.red(e));
                    console.log(color.red(e.stack));
                    console.log(color.red("fail to generate root CA"));
                    certCallback && certCallback(e);
                }
            });
        }
    }

    function getRootCAFilePath(){
        return isRootCAFileExists() ? rootCAcrtFilePath: '';
    }

    function getRootDirPath () {
        return rootDirPath;
    }

    function _checkRootCA(){
        if (rootCAExists) {
            return true;
        }

        if(!isRootCAFileExists()){
            console.log(color.red("can not find rootCA.crt or rootCA.key"));
            console.log(color.red("you may generate one"));
            return false;
        } else{
            rootCAExists = true;
            return true;
        }
    }

    return {
        getRootCAFilePath: getRootCAFilePath,
        generateRootCA: generateRootCA,
        getCertificate: getCertificate,
        clearCerts: clearCerts,
        isRootCAFileExists: isRootCAFileExists,
        getRootDirPath: getRootDirPath
    };
}



module.exports = CertManager;