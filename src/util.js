module.exports.getUserHome = function () {
    return process.env.HOME || process.env.USERPROFILE;
};

module.exports.getDefaultRootDirName = function () {
    return '.certmanager_certs';
};