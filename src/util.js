module.exports.getUserHome = function () {
    return process.env.HOME || process.env.USERPROFILE;
};

module.exports.getDefaultRootName = function () {
    return '.certmanager_certs';
};