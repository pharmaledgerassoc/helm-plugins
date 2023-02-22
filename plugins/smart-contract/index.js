const downloadSmartContracts = require("./downloadSmartContracts").downloadAndStoreSmartContracts;
function getConfig(config, outputPath) {
    const path = require('path');
    config.outputPath = path.resolve(outputPath);
    return config;
}

function deploySmartContracts(inputPath, outputPath) {
    const config = getConfig(inputPath, outputPath);
    downloadSmartContracts(config, (err)=>{
        if (err) {
            console.log(err);
            process.exit(1);
        }

        require("./deploySmartContracts").deploySmartContractsAndStoreInfo(config);
    })
}

module.exports = {
    deploySmartContracts
}