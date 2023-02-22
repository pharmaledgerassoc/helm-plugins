const fs = require("fs");
const path = require("path");
const constants = require("../constants");

function downloadSmartContract(url, callback) {
    const urlObj = new URL(url);
    const http = require(urlObj.protocol.slice(0, -1));
    let data = "";
    http.get(url, (res) => {
        res.on('data', (chunk) => {
            data += chunk.toString();
        });

        res.on('end', () => {
            callback(undefined, data);
        })

    }).on('error', (err) => {
        callback(err);
    });
}

function downloadAndStoreSmartContracts(config, callback) {
    let noRemainingSC = config.smart_contracts.length;
    const smartContractsRepoPath = path.join(__dirname, constants.PATHS.SMART_CONTRACTS_REPO);
    try {
        fs.accessSync(smartContractsRepoPath);
    } catch (e) {
        fs.mkdirSync(smartContractsRepoPath, {recursive: true});
    }

    config.smart_contracts.forEach(smartContract => {
        downloadSmartContract(smartContract.smart_contract_location, (err, contractCode) => {
            if (err) {
                return callback(err);
            }

            try {
                fs.writeFileSync(path.join(smartContractsRepoPath, smartContract.smart_contract_name + ".sol"), contractCode);
            } catch (e) {
                return callback(e);
            }

            noRemainingSC--;
            if (noRemainingSC === 0) {
                return callback();
            }
        })
    })
}

module.exports = {
    downloadAndStoreSmartContracts
}