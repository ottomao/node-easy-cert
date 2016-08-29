const CertManager = require('../src/index.js');
const util = require('../src/util.js');
const fs = require('fs');
const bddstdin = require('bdd-stdin');

describe('Test Cert Manager', () => {
    beforeAll(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
    });

    describe('Default Cert Manager', () => {
        const certMgr = CertManager();
        const rootDirPath = util.getUserHome() + '/' + util.getDefaultRootDirName() + '/';
        beginTest(certMgr, rootDirPath);
    });

    describe('RootDirName with rootDirName .certmanager_certs_test', () => {
        const options = {
            rootDirName: '.certmanager_certs_test'
        };
        const certMgr = CertManager(options);
        const rootDirPath = util.getUserHome() + '/.certmanager_certs_test/';

        beginTest(certMgr, rootDirPath);
    });

    describe('RootDirName with fullRootDir /Users/wangweijie/.certmanager_certs_fulldir', () => {
        const options = {
            rootDirPath: '/Users/wangweijie/.certmanager_certs_fulldir'
        };
        const certMgr = CertManager(options);
        const rootDirPath = util.getUserHome() + '/.certmanager_certs_fulldir/';

        beginTest(certMgr, rootDirPath);
    });


    function beginTest (certMgr, rootDirPath) {
        it('isRootCAFileExists', () => {
            const path = rootDirPath + '/rootCA.crt';
            expect(certMgr.isRootCAFileExists()).toBe(false);
        });

        it('generateRootCA', (done) => {
            bddstdin('yes\n');

            certMgr.generateRootCA((error) => {
                if (!error) {
                    fs.stat(rootDirPath + 'rootCA.crt', (e) => {
                        if (!e) {
                            done();
                        } else {
                            console.error(e);
                            done.fail('failed to generate root ca');
                        }
                    });
                }
            });
        });

        it('isRootCAFileExists', () => {
            const path = rootDirPath + '/rootCA.crt';
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
                const path = rootDirPath + '/localhost.crt';
                fs.stat(path, (error) => {
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

