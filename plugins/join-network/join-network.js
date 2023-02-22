async function generateNodeCrypto(config, outputPath) {
    const path = require('path');
    const utils = require('../utils');
    const constants = require("../constants");
    const fs = require('fs');
    //configured use case validation
    if (!config.use_case.joinNetwork.enabled) {
        return console.log('Error: values.yaml file has not enabled the joinNetwork use case. Please review the input values.yaml configuration and execute the correct plugin for the configured use case !');
    }
    const token = config.git_shared_configuration.read_write_token;
    const repoName = config.git_shared_configuration.repository_name;
    const baseShareFolder = "networks";
    const networkName = config.deployment.network_name;
    const genesisFileName = constants.PATHS.GENESIS_FILE;
    const genesisUrl = `https://raw.githubusercontent.com/${repoName}/master/${baseShareFolder}/${networkName}/${genesisFileName}`
    console.log("genesis url", genesisUrl);
    console.log("output path", outputPath);
    const generatedInfoFile = path.resolve(outputPath, 'join-network.plugin.json');
    const generatedSecretInfoFile = path.resolve(outputPath, 'join-network.plugin.secrets.json');
    const publicJson = {};
    const secretJson = {};

    const node = utils.generateValidator();

    publicJson.enode = node.enode;
    publicJson.nodeKeyPublic = node.nodeAddress;
    console.log('Downloading : ', genesisUrl);
    try {
        publicJson.genesis = await utils.dlFile(genesisUrl, token);
    } catch (e){
        return console.log(e);
    }
    secretJson.nodeKey = node.nodekey;

    fs.writeFileSync(generatedInfoFile, JSON.stringify(publicJson));
    fs.writeFileSync(generatedSecretInfoFile, JSON.stringify(secretJson));

    console.log('Generated information file for joinNetwork use case : ', generatedInfoFile);
    console.log('Generated secret information file for joinNetwork use case : ', generatedSecretInfoFile);
}

module.exports = {
    generateNodeCrypto
}
