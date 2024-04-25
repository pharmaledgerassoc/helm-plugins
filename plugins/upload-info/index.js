const utils = require("../utils");
const childProcess = require("child_process");
const constants = require("../constants");
const fs = require("fs");
const path = require("path");

function generateGenesis(config) {
    const balance = "1000000000000000000000000000";
    const genesis = {
        "alloc": {},
        "coinbase": "0x0000000000000000000000000000000000000000",
        "config": {
            "homesteadBlock": 0,
            "byzantiumBlock": 0,
            "constantinopleBlock": 0,
            "petersburgBlock": 0,
            "istanbulBlock": 0,
            "eip150Block": 0,
            "eip150Hash": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "eip155Block": 0,
            "eip158Block": 0,
            "maxCodeSizeConfig": [
                {
                    "block": 0,
                    "size": 32
                }
            ],
            "chainId": 10,
            "isQuorum": true,
            "istanbul": {
                "epoch": 30000,
                "policy": 0
            }
        },
        "difficulty": "0x1",
        "extraData": `${config.extradata}`,
        "gasLimit": "0xE0000000",
        "mixHash": "0x63746963616c2062797a616e74696e65206661756c7420746f6c6572616e6365",
        "nonce": "0x0",
        "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "timestamp": "0x00"
    }

    genesis.alloc[config.genesisAccount] = {
        balance
    }

    return genesis;
}

function uploadQuorumNodeInfo(config) {
    const {sharedRepoPath, tmpDir} = utils.cloneSharedRepo(config);
    let enode = `enode://${config.enode}@${config.deployment.enode_address}:${config.deployment.enode_address_port}?discport=0`;
    const validator = config.nodeKeyPublic;
    const commonPath = path.join(sharedRepoPath, "editable", config.deployment.company);
    const enodePath = path.join(commonPath, "enode");
    const validatorPath = path.join(commonPath, "validator");
    try {
        fs.accessSync(commonPath);
    } catch (e) {
        fs.mkdirSync(commonPath, {recursive: true});
    }
    fs.writeFileSync(enodePath, enode);
    fs.writeFileSync(validatorPath, validator);

    if (config.use_case.newNetwork.enabled) {
        const genesis = generateGenesis(config);
        const genesisPath = path.join(sharedRepoPath, constants.PATHS.GENESIS_FILE);
        fs.writeFileSync(genesisPath, JSON.stringify(genesis));
    }

    childProcess.execSync(`cd ${sharedRepoPath} && git config user.name ${config.git_upload.user}`);
    childProcess.execSync(`cd ${sharedRepoPath} && git config user.email ${config.git_upload.email}`);
    let remotes = childProcess.execSync(`cd ${sharedRepoPath} && git remote -v`);

    if (remotes.length === 0) {
        childProcess.execSync(`cd ${sharedRepoPath} && git remote add origin ${config.git_upload.git_repo_with_access_token}`);
    }

    childProcess.execSync(`cd ${sharedRepoPath} && git add .`);
    childProcess.execSync(`cd ${sharedRepoPath} && git commit -m "${constants.COMMIT_MESSAGES.ENODE_INFO_UPDATE}"`);
    childProcess.execSync(`cd ${sharedRepoPath} && git push`);
    fs.rmSync(tmpDir, {recursive: true});
    console.log("Uploaded enode and validator public key successfully");
}

module.exports = {
    uploadQuorumNodeInfo
}