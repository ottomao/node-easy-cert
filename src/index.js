var exec = require('child_process').exec,
    spawn         = require('child_process').spawn,
    path          = require("path"),
    fs            = require("fs"),
    os            = require("os"),
    color         = require('colorful'),
    readline      = require('readline'),
    certGenerator = require("./certGenerator"),
    util          = require('./util'),
    asyncTask     = require("async-task-mgr");


function CertManager (options) {
    options = options || {};
    var rootName = options.rootName || util.getDefaultRootName();
    var fullRootDir  = options.fullRootDir || path.join(util.getUserHome(),"/" + rootName + "/");

    var isWin             = /^win/.test(process.platform),
        certDir           = fullRootDir,
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
        _checkRootCA();
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

    function createCert(hostname,callback){
        _checkRootCA();

        var cmd = cmd_genCert + " __host __path".replace(/__host/,hostname).replace(/__path/,certDir);
        exec(cmd,{ cwd : certDir },function(err,stdout,stderr){
            if(err){
                callback && callback(new Error("error when generating certificate"),null);
            }else{
                var tipText = "certificate created for __HOST".replace(/__HOST/,hostname);
                console.log(color.yellow(color.bold("[internal https]")) + color.yellow(tipText)) ;
                callback(null);
            }
        });
    }

    function clearCerts(cb){
        console.info('cert dir is:', certDir);
        exec('ls ', { cwd: certDir }, (error) => {
            console.error(error);
        });

        if(isWin){
            exec("del * /q",{ cwd : certDir },cb);
        }else{
            exec("rm *.key *.csr *.crt *.srl",{ cwd : certDir },cb);
        }
    }

    function isRootCAFileExists(){
        return (fs.existsSync(rootCAcrtFilePath) && fs.existsSync(rootCAkeyFilePath));
    }



    function generateRootCA(){
        if(isRootCAFileExists()){
            console.log(color.yellow("rootCA exists at " + certDir));
            var rl = readline.createInterface({
                input : process.stdin,
                output: process.stdout
            });

            rl.question("do you really want to generate a new one ?)(yes/NO)", function(answer) {
                if(/yes/i.test(answer)){
                    startGenerating();
                }else{
                    console.log("will not generate a new one");
                    process.exit(0);
                }

                rl.close();
            });
        }else{
            startGenerating();
        }

        function startGenerating(){
            //clear old certs
            clearCerts(function(error){
                console.log(color.red(error));
                console.log(color.green("temp certs cleared"));
                try{
                    var result = certGenerator.generateRootCA();
                    fs.writeFileSync(rootCAkeyFilePath, result.privateKey);
                    fs.writeFileSync(rootCAcrtFilePath, result.certificate);

                    console.log(color.green("rootCA generated"));
                    console.log(color.green(color.bold("please trust the rootCA.crt in " + certDir)));

                    if(isWin){
                        exec("start .",{ cwd : certDir });
                    }else{
                        exec("open .",{ cwd : certDir });
                    }

                }catch(e){
                    console.log(color.red(e));
                    console.log(color.red(e.stack));
                    console.log(color.red("fail to generate root CA"));
                }
            });
        }
    }

    function getRootCAFilePath(){
        return isRootCAFileExists() ? rootCAcrtFilePath: '';
    }

    function _checkRootCA(){
        if (rootCAExists) {
            return;
        }

        if(!isRootCAFileExists()){
            console.log(color.red("can not find rootCA.crt or rootCA.key"));
            console.log(color.red("you may generate one by the following methods"));
            process.exit(0);
        } else{
            rootCAExists = true;
        }
    }

    return {
        getRootCAFilePath: getRootCAFilePath,
        generateRootCA: generateRootCA,
        getCertificate: getCertificate,
        createCert: createCert,
        clearCerts: clearCerts,
        isRootCAFileExists: isRootCAFileExists
    };
}



module.exports = CertManager;