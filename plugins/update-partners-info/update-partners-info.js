const path = require("path");
const fs = require('fs');
const utils = require("../utils");
async function aggregatePartnersInfo(config, outputPath) {
    //configured use case validation
    if (!config.use_case.updatePartnersInfo.enabled) {
        return console.log('Error : values.yaml file has not enabled the updatePartnersInfo use case. Please review the input values.yaml configuration and execute the correct plugin for the configured use case !');
    }
    
    console.log(config);

    const generatedInfoFile = path.resolve(outputPath, 'update-partners-info.plugin.json');
    const publicJson = {};
    publicJson.peers = [];

    const peers = config.use_case.updatePartnersInfo.peers;
    const {sharedRepoPath} = utils.cloneSharedRepo(config);
    const partnersDataPath = path.join(sharedRepoPath, "editable");
    
    console.log(sharedRepoPath);
    console.log(partnersDataPath);
    
    for (let i = 0; i < peers.length; i++) {
        const peerDataPath = path.join(partnersDataPath, peers[i]);
        const validatorDataPath = path.join(peerDataPath, "validator");
        
        console.log(validatorPath);
        
        const enodeDataPath = path.join(peerDataPath, "enode");
        const validatorData = fs.readFileSync(validatorDataPath, "utf-8");
        const enodeData = fs.readFileSync(enodeDataPath, "utf-8");

        publicJson.peers.push(parsePeerData(enodeData, validatorData));
    }

    fs.writeFileSync(generatedInfoFile, JSON.stringify(publicJson));
    console.log('Generated information file for updatePartnersInfo use case : ', generatedInfoFile);

}

function parsePeerData(enodeData, validatorData) {
    const toTrim = "enode://";
    enodeData = enodeData.replaceAll(toTrim, "");
    const splitEnode = enodeData.split("@");
    const peer = {};
    peer.enode = splitEnode[0];
    const enodeAddressAndPort = splitEnode[1].split("?")[0];
    const splitEnodeAddressAndPort = enodeAddressAndPort.split(":");
    peer.enodeAddress = splitEnodeAddressAndPort[0];
    peer.enodeAddressPort = splitEnodeAddressAndPort[1];
    peer.nodeKeyPublic = validatorData;
    return peer;
}

module.exports = {
    aggregatePartnersInfo
}
