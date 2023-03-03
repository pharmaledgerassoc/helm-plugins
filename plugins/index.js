const utils = require("./utils");
function processFlags(){
    const argv = utils.processArgv();
    if (argv.h || argv.help){
        return showHelp();
    }

    let fnToExecute;

    if (argv.newNetwork){
        fnToExecute = require('./new-network/new-network').generateInitialNodeCrypto;
    }

    if (argv.joinNetwork){
        fnToExecute = require('./join-network/join-network').generateNodeCrypto;
    }

    if (argv.updatePartnersInfo){
        fnToExecute = require('./update-partners-info/update-partners-info').aggregatePartnersInfo;
    }

    if (argv.ethAdapter){
        fnToExecute = require('./ethereum-adapter/eth-adapter.js').downloadFilesAndCreateJSON;
    }

    if(argv.smartContract){
        fnToExecute = require('./smart-contract').deploySmartContracts;
    }

    if(argv.uploadInfo){
        fnToExecute = require('./upload-info').uploadQuorumNodeInfo;
    }

    if(argv.generateEpiConfig){
        fnToExecute = require('./generate-epi-config').generateEpiConfig;
    }

    if (typeof fnToExecute !== "function") {
        return showHelp();
    }

    utils.processFlagsThenExecute(argv, fnToExecute);
}

function showHelp(){
    return console.log('\n\nPharmaLedger plugin for helm.\n\n' +
        'Usage:\n' +
        'helm plugin-name [command] [flags]\n\n' +
        'Plugin commands:\n' +
        '--newNetwork           generate crypto for the initial node and genesis information\n'+
        '--joinNetwork          generate crypto for the joining node\n'+
        '--updatePartnersInfo   aggregates the information regarding partners present in the network\n'+
        '--ethAdapter   Demo code for aggregation\n' +
        '--smartContract   deploys smart contracts\n' +
        '--generateEpiConfig   generates config files for epi deployment\n\n');
}

processFlags();
