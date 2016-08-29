const CertManager = require('../src/index.js');
const util = require('../src/util.js');
const fs = require('fs');
const bddstdin = require('bdd-stdin');
const path = require('path');

describe('Test Cert Manager', () => {
    beforeAll(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
    });

    describe('Default Cert Manager', () => {
        const certMgr = new CertManager();
        const rootDirPath = util.getUserHome() + '/' + util.getDefaultRootDirName() + '/';
        beginTest(certMgr, rootDirPath);
    });

    describe('RootDirName with fullRootDir /temp/.certmanager_certs_fulldir', () => {
        const options = {
            rootDirPath: '/temp/.certmanager_certs_fulldir/'
        };
        const certMgr = new CertManager(options);
        const rootDirPath = '/temp/.certmanager_certs_fulldir/';

        beginTest(certMgr, rootDirPath);
    });


    function beginTest (certMgr, rootDirPath) {
        it('isRootCAFileExists', () => {
            expect(certMgr.isRootCAFileExists()).toBe(false);
        });

        it('generateRootCA with common Name', (done) => {
            const options = {
                commonName: 'testRootCA',
                overwrite: true
            };

            certMgr.generateRootCA(options, (error) => {
                if (!error) {
                    fs.stat(rootDirPath + 'rootCA.crt', (e) => {
                        if (!e) {
                            done();
                        } else {
                            console.error(e);
                            done.fail('failed to generate root ca');
                        }
                    });
                } else {
                    console.error(error);
                    done.fail('failed to generate root CA');
                }
            });
        });

        it('isRootCAFileExists', () => {
            expect(certMgr.isRootCAFileExists()).toBe(true);
        });

        it('getRootCAFilePath', () => {
            const filePath = certMgr.getRootCAFilePath();
            expect(filePath).toEqual(rootDirPath + 'rootCA.crt');
        });

        it('getRootDirPath', () => {
            const filePath = certMgr.getRootCAFilePath();
            expect(filePath).toEqual(rootDirPath + 'rootCA.crt');
        });

        it('getCertificate', (done) => {
            certMgr.getCertificate('localhost', () => {
                const filePath = path.join(rootDirPath + '/localhost.crt');
                fs.stat(filePath, (error) => {
                    if (!error) {
                        done();
                    } else {
                        console.error(error);
                        done.fail('cert generated failed');
                    }
                });
            });
        });

        it('clearCerts', (done) => {
            certMgr.clearCerts(() => {
                fs.rmdir(rootDirPath, (error) => {
                    if (error) {
                        console.error('root dir path is:', error);
                        done.fail('failed to clear certs');

                    } else {
                        done();
                    }
                });
            });
        });
    }

});

