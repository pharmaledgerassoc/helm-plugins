function generateInitialNodeCrypto(config, outputPath) {
    const path = require('path');
    const fs = require('fs');
    //configured use case validation
    if (!config.use_case.newNetwork.enabled) {
        return console.log('Error : values.yaml file has not enabled the newNetwork use case. Please review the input values.yaml configuration and execute the correct plugin for the configured use case !');
    }


    const generatedInfoFile = path.resolve(outputPath, 'new-network.plugin.json');
    const publicJson = {};
    const generatedSecretInfoFile = path.resolve(outputPath, 'new-network.plugin.secrets.json');
    const secretJson = {}

    const utils = require('./utils');
    const modulesUtils = require('../utils');
    const node = modulesUtils.generateValidator();
    const genesisextradata = utils.getGenesisExtraData([node.nodeAddress]);
    const admAccount = utils.createAdmAcc();

    publicJson.extradata = genesisextradata;
    publicJson.enode = node.enode;
    publicJson.nodeKeyPublic = node.nodeAddress;
    publicJson.genesisAccount = admAccount.account;

    secretJson.nodeKey = node.nodekey;
    secretJson.genesisKeyStoreAccount = admAccount.keyObject;
    secretJson.genesisKeyStoreAccountEncryptionPassword = admAccount.password;
    secretJson.genesisAccountPrivateKey = admAccount.privateKey;


    fs.writeFileSync(generatedInfoFile, JSON.stringify(publicJson));
    fs.writeFileSync(generatedSecretInfoFile, JSON.stringify(secretJson));

    console.log('Generated information file for newNetwork use case : ', generatedInfoFile);
    console.log('Generated secret information file for newNetwork use case : ', generatedSecretInfoFile);
}


module.exports = {
    generateInitialNodeCrypto
}

