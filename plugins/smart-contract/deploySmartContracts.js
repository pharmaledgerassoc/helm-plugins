const constants = require("../constants");
const path = require("path");
const fs = require("fs");
const utils = require("../utils");
const childProcess = require("child_process");

function getAccountInfo(config) {
    let orgAcc;
    try {
        orgAcc = JSON.parse(fs.readFileSync(path.join(config.outputPath, constants.PATHS.ORG_ACCOUNT), "utf-8"));
    } catch (e) {
        orgAcc = utils.createOrgAccount();
        fs.writeFileSync(path.join(config.outputPath, constants.PATHS.ORG_ACCOUNT), JSON.stringify(orgAcc));
    }
    return orgAcc;
}

function deploySmartContract(web3, accountInfo, contractInfo, contractName, contractArgs, callback) {
    let abi = contractInfo.abi;
    let bin = contractInfo.bytecode;

    let contract = new web3.eth.Contract(abi);
    sendTransaction(web3, accountInfo, contract.deploy({data: "0x" + bin, arguments: contractArgs}), (err, tr) => {
        if (err) {
            return callback(err);
        }
        console.log('Contract mined : ', tr.contractAddress);
        callback(undefined, tr.contractAddress);
    });
}

function sendTransaction(web3, accountInfo, transaction, callback) {
    transaction.estimateGas({from: accountInfo.account}).then(
        (estimatedGas) => {

            let options = {
                from: accountInfo.account,
                data: transaction.encodeABI(),
                gas: estimatedGas
            };

            web3.eth.accounts.signTransaction(options, accountInfo.privateKey).then(
                (signedT) => {
                    let signedTransaction = signedT;
                    web3.eth.sendSignedTransaction(signedTransaction.rawTransaction, (err, hash) => {
                        if (err) {
                            console.log(err);
                            return callback(err);
                        }
                        console.log('Received T receipt', hash);
                        waitForTransactionToFinish(web3, hash, callback);
                    });
                },
                (err) => {
                    console.log(err);
                    return callback(err);
                }
            );

        },
    );
}

function compileSmartContracts(config, contracts) {
    const fs = require('fs');
    const path = require('path');
    const solc = require('solc');

    const compilerInput = {
        language: 'Solidity',
        sources: {},
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    };

    for (let contract of contracts) {
        const contractPath = path.join(__dirname, constants.PATHS.SMART_CONTRACTS_REPO, contract);
        const content = fs.readFileSync(contractPath, 'utf-8');
        compilerInput.sources[contract] = {content}
    }

    const output = JSON.parse(solc.compile(JSON.stringify(compilerInput)));
    const contractsABIAndBytecode = {};
    for (let contractName in output.contracts) {
        const contractClass = Object.keys(output.contracts[contractName])[0]
        const bytecode = output.contracts[contractName][contractClass].evm.bytecode.object;
        const abi = output.contracts[contractName][contractClass].abi;
        contractsABIAndBytecode[contractName] = {bytecode, abi}
    }

    return contractsABIAndBytecode;
}

function waitForTransactionToFinish(web3, hash, callback) {
    console.log('Waiting for transaction to finish ...');
    const receipt = () => {
        web3.eth.getTransactionReceipt(hash).then((tr) => {
                if (tr === null) {
                    console.log('Waiting for transaction to finish ...');
                    setTimeout(() => {
                        receipt();
                    }, 2000);
                    return;
                }
                console.log('Transaction finished : ', tr);

                callback(undefined, tr);
            },
            (err) => {
                console.log(err);
                return callback(err);
            }
        )
    }

    receipt();
}

function uploadContractsInfo(contractsInfo, config) {
    const childProcess = require("child_process");
    const {sharedRepoPath, tmpDir} = utils.cloneSharedRepo(config);
    storeSmartContractsInfo(sharedRepoPath, contractsInfo, config);

    childProcess.execSync(`cd ${sharedRepoPath} && git config user.name ${config.git_upload.user}`);
    childProcess.execSync(`cd ${sharedRepoPath} && git config user.email ${config.git_upload.email}`);
    let remotes = childProcess.execSync(`cd ${sharedRepoPath} && git remote -v`);

    if (remotes.length === 0) {
        childProcess.execSync(`cd ${sharedRepoPath} && git remote add origin ${config.git_upload.git_repo_with_access_token}`);
    }

    childProcess.execSync(`cd ${sharedRepoPath} && git add .`);
    childProcess.execSync(`cd ${sharedRepoPath} && git commit -m "${constants.COMMIT_MESSAGES.SMART_CONTRACT_UPDATE}"`);
    childProcess.execSync(`cd ${sharedRepoPath} && git push`);
    fs.rmSync(tmpDir, {recursive: true})
    console.log("Smart contract info was stored successfully");
}

function storeSmartContractsInfo(outputPath, contractsInfo, config) {
    try {
        fs.accessSync(outputPath);
    } catch (e) {
        fs.mkdirSync(outputPath, {recursive: true});
    }
    for (let contract in contractsInfo) {
        const contractIndex = config.smart_contracts.findIndex(sc => sc.smart_contract_name === contract);
        let smartContractAbiPath = path.join(outputPath, `smartContractAbi.json`);
        let smartContractAddressPath = path.join(outputPath, `smartContractAddress.json`);
        if (contractIndex > 0) {
            smartContractAbiPath = path.join(outputPath, `smartContractAbi_${contractIndex}.json`);
            smartContractAddressPath = path.join(outputPath, `smartContractAddress_${contractIndex}.json`);
        }

        fs.writeFileSync(smartContractAbiPath, JSON.stringify(contractsInfo[contract].abi, null, "\t"));
        fs.writeFileSync(smartContractAddressPath, JSON.stringify({contractAddress: contractsInfo[contract].address}));
    }
}

function deploySmartContracts(accountInfo, config, callback) {
    const portForward = require("./portForward").portForward;
    const fs = require('fs');
    const files = fs.readdirSync(path.join(__dirname, constants.PATHS.SMART_CONTRACTS_REPO));
    const contracts = files.filter(file => file.endsWith(".sol"));
    const Web3 = require('web3');
    const web3 = new Web3('http://127.0.0.1:8545'); // your geth
    const contractsInfo = compileSmartContracts(config, contracts);
    const contractsAbiAndAddress = {};
    const __deploySmartContractsSequentially = (index, childProcess) => {
        const contract = contracts[index];
        if (typeof contract === "undefined") {
            process.kill(-childProcess.pid);
            return callback(undefined, contractsAbiAndAddress);
        }

        deploySmartContract(web3, accountInfo, contractsInfo[contract], contract, [], (err, scAddress) => {
            if (err) {
                return callback(err);
            }

            contractsAbiAndAddress[path.basename(contract, ".sol")] = {
                abi: JSON.stringify(contractsInfo[contract].abi),
                address: scAddress
            }
            __deploySmartContractsSequentially(index + 1, childProcess);
        })
    }

    portForward(config, (err, childProcess) => {
        if (err) {
            return callback(err);
        }
        __deploySmartContractsSequentially(0, childProcess);
    })
}

function deploySmartContractsAndStoreInfo(config) {
    const accountInfo = getAccountInfo(config);
    deploySmartContracts(accountInfo, config, (err, contractsInfo) => {
        if (err) {
            console.log(err);
            process.exit(1);
        }

        storeSmartContractsInfo(config.outputPath, contractsInfo, config);
        if (config && config.git_upload && config.git_upload.enabled) {
            uploadContractsInfo(contractsInfo, config);
        }

        fs.rmSync(path.join(__dirname, constants.PATHS.SMART_CONTRACTS_REPO), {recursive: true})
        process.exit(0);
    })
}

module.exports = {
    deploySmartContractsAndStoreInfo
}

