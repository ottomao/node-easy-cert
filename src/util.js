module.exports.getUserHome = function () {
    return process.env.HOME || process.env.USERPROFILE;
};

module.exports.getDefaultRootDirName = function () {
    return '.node_easy_certs';
};