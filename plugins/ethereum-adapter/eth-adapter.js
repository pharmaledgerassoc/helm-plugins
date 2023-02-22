const utils = require("../utils");
const constants = require("../constants");
const path = require('path');
const fs = require('fs');``

async function dlFilesAndWriteJsonFile(config, outputPath) {
    const {sharedRepoPath, tmpDir} = utils.cloneSharedRepo(config);
    const smartContractAbiPath = path.join(sharedRepoPath, "smartContractAbi.json");
    const smartContractAddressPath = path.join(sharedRepoPath, "smartContractAddress.json");
    const smartContractAbi = fs.readFileSync(smartContractAbiPath, "utf-8")
    let smartContractAddress = fs.readFileSync(smartContractAddressPath, "utf-8")
    smartContractAddress = JSON.parse(smartContractAddress);
    const ethAdapterInfoPath = path.join(path.resolve(outputPath), constants.PATHS.ETH_ADAPTER_OUTPUT);
    const smartContractInfo = {
        abi: JSON.parse(smartContractAbi),
        address: smartContractAddress.contractAddress
    }

    const orgAcc = utils.createOrgAccount();
    fs.writeFileSync(path.join(outputPath, constants.PATHS.ORG_ACCOUNT), JSON.stringify(orgAcc));
    fs.writeFileSync(ethAdapterInfoPath, JSON.stringify(smartContractInfo));
    fs.rmSync(tmpDir, {recursive: true});
    console.log('Configuration created at : ', outputPath);
}
module.exports = {
    downloadFilesAndCreateJSON: function (inputPath, outputPath) {
        dlFilesAndWriteJsonFile(inputPath, outputPath).then(
            () => {
            },
            (err) => {
                console.log(err);
            }
        );
    }
}
