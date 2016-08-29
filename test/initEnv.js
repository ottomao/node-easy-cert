const options = {
    rootName: '.anyproxy_certs2'
};

const CertManager = require('../src/index.js')(options);
// CertManager.clearCerts();
CertManager.generateRootCA();