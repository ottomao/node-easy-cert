#!/usr/bin/env node

const crtMgr = require('./src/index.js')();
const program = require('commander');
const packageInfo = require('./package.json');
const color = require('colorful');

program
  .version(packageInfo.version)
  .option('-r, --root', 'to generate the root CA')
  .option('-h, --host [value]', 'get certificate for the specified host value')
  .option('-d, --dirPath', 'get the dir path of root folder')
  .parse(process.argv);

if (program.root) {
    crtMgr.generateRootCA((error) => {
        if (error) {
            console.log(color.red('Failed to generate root CA'));
            console.error(error);
        } else {
            console.log(color.cyan('Root CA generated!'));
            console.log(color.cyan('\n ### Please install and trust them before using them ###\n'));
        }
    });
}

if (program.host) {
    const host = program.host;
    crtMgr.getCertificate(program.host, (error, keyContent, crtContent) => {
        if (error) {
            console.log(color.red('Failed to get certifcate for host: ' + host));
            console.error(error);
        } else {
            console.log(color.cyan('certifcate for host: ' + host + ' fetched'));
            console.log(color.cyan('the key is:\n' + keyContent));
            console.log(color.cyan('the crt is:\n' + crtContent));
        }
    });
}

if (program.dirPath) {
    const dirPath = crtMgr.getRootDirPath();
    console.log(color.cyan('the dir path for certifcate is: ' + dirPath));
}
