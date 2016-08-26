const CertManager = require('../src/index.js')();
const util = require('../src/util.js');
const fs = require('fs');

const defaultRootPath = util.getUserHome() + '/' + util.getDefaultRootName() + '/';

describe('Test Cert Manager', () => {
    // it('generateRootCA', () => {
    //     try{
    //         CertManager.generateRootCA();
    //     } catch (e) {
    //         console.error(e);
    //     }
    // });

    it('getRootCAFilePath', () => {
        const filePath = CertManager.getRootCAFilePath();
        expect(filePath).toEqual(defaultRootPath + 'rootCA.crt');
    });

    it('createCert', (done) => {
        CertManager.createCert('localhost', () => {
            const path = defaultRootPath + '/localhost.crt';
            fs.exists(path, (error) => {
                if (!error) {
                    done();
                } else {
                    done.fail('cert generated failed');
                }
            });
        });
    });

    it('clearCerts', () => {

    });
});

