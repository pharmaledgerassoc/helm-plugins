const constants = require("./constants");
const path = require("path");
const childProcess = require("child_process");
function promisify(fun) {
    return function (...args) {
        return new Promise((resolve, reject) => {
            function callback(err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            }

            args.push(callback);

            fun.call(this, ...args);
        });
    };
}

async function dlFile(githubUrl, token){
    return promisify(downloadFile)(githubUrl, token);
}

function downloadFile(url,token, callback) {
    if (typeof token === "function"){
        callback = token;
        token = undefined;
    }
    const urlObj = new URL(url);
    const http = require(urlObj.protocol.slice(0, -1));
    let data = "";
    let options;
    if (token)
    {
        options = {
            headers: {
                "Authorization": `token ${token}`
            }
        }
    } else {
        options = {};
    }
    http.get(url, options, (res) => {
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

function generateValidator(){
    const crypto = require('crypto');
    const entropy = crypto.randomBytes(128);
    const eth = require('eth-crypto');
    const identity = eth.createIdentity(entropy);
    return {
        nodekey:identity.privateKey.slice(2),
        nodeAddress : identity.address.toString(),
        enode : identity.publicKey.toString()
    }
}

function createOrgAccount() {
    const Web3 = require("web3");

    const web3 = new Web3('http://ref-quorum-node1:8545'); // your geth

    //create a new account which doesn't have a storekey located in the blockchain node
    const newAccount = web3.eth.accounts.create();
    const orgAccData = {
        privateKey: newAccount.privateKey,
        address: newAccount.address
    }

    return orgAccData;
}

function showHelp(plugin){
    let helpMessage = `\n\nPharmaLedger plugin for helm.\n\nUsage : helm plugin-name --${plugin} -i <input> -o <output> \n\n
        --${plugin} command flags:\n\n
        -i <values.yaml file path>\n
        -o <output path where to store the generated json files>\n\n`;

    const plugins = Object.values(constants.PLUGINS);
    if (plugins.findIndex(pl => pl === plugin) === -1) {
        throw Error(`Invalid plugin name: ${plugin}`);
    }
    return helpMessage;
}

function processFlagsThenExecute(argv, fnToExecute) {
    if (argv.h || argv.help){
        return require('./utils').showHelp();
    }
    if (!argv.i){
        console.log('Input values.yaml file not provided.\n\n');
        return require('./utils').showHelp();
    }

    if (!argv.o){
        console.log('Output path not provided.\n\n');
        return require('./utils').showHelp();
    }

    fnToExecute(aggregateYamlFiles(argv.i), argv.o);
}

function processArgv() {
    let argv = process.argv.slice(2);
    const processedArgv = {};
    let flag;
    for (let i = 0; i < argv.length; i++) {
        if (argv[i].startsWith("-")) {
            flag = argv[i].replaceAll("-", "");
            processedArgv[flag] = [];
        } else {
            if (typeof flag === "undefined") {
                throw Error("Flags should be preceded by - or --");
            }
            processedArgv[flag].push(argv[i]);
        }
    }

    for (let prop in processedArgv) {
        if (processedArgv[prop].length === 0) {
            processedArgv[prop] = true;
        }

        if (processedArgv[prop].length === 1) {
            processedArgv[prop] = processedArgv[prop][0];
        }
    }

    return processedArgv;
}

function createConfig(config, defaultConfig) {
    if (typeof config === "undefined") {
        return defaultConfig;
    }

    //ensure that the config object will contain all the necessary keys for server configuration
    for (let mandatoryKey in defaultConfig) {
        if (typeof config[mandatoryKey] === "undefined") {
            config[mandatoryKey] = defaultConfig[mandatoryKey];
        }
    }
    return __createConfigRecursively(config, defaultConfig);

    function __createConfigRecursively(config, defaultConfig) {
        for (let prop in defaultConfig) {
            if (typeof config[prop] === "object" && !Array.isArray(config[prop])) {
                __createConfigRecursively(config[prop], defaultConfig[prop]);
            } else {
                if (typeof config[prop] === "undefined") {
                    config[prop] = defaultConfig[prop];
                    __createConfigRecursively(config[prop], defaultConfig[prop]);
                }
            }
        }
        return config;
    }
}

function aggregateYamlFiles(filePaths) {
    if (!Array.isArray(filePaths)) {
        filePaths = [filePaths];
    }
    const fs = require("fs");
    let outputJson = {};
    for (let filePath of filePaths) {
        let content = fs.readFileSync(filePath).toString();
        const yaml = require('js-yaml');
        content = yaml.load(content);
        outputJson = createConfig(content, outputJson);
    }
    return outputJson;
}

function cloneSharedRepo(config) {
    const childProcess = require("child_process");
    const tmpDir = path.join(require("os").tmpdir(), require("crypto").randomBytes(3).toString("hex"));
    const token = config.git_shared_configuration.read_write_token;
    const repoName = config.git_shared_configuration.repository_name;
    const sharedRepoURL = `https://${token}:x-oauth-basic@github.com/${repoName}`;
    childProcess.execSync(`git clone ${sharedRepoURL} ${path.join(tmpDir, constants.PATHS.SHARED_REPO_NAME)}`);
    const sharedRepoPath = path.join(tmpDir, constants.PATHS.SHARED_REPO_NAME, constants.PATHS.BASE_SHARED_FOLDER, config.network_name);

    return {
        sharedRepoPath,
        tmpDir
    };
}

module.exports = {
    generateValidator,
    showHelp,
    processFlagsThenExecute,
    dlFile,
    createOrgAccount,
    processArgv,
    aggregateYamlFiles,
    cloneSharedRepo
}

