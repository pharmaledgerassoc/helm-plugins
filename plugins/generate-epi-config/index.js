const fs = require("fs");
const path = require("path");
const CLUSTER_ALIAS = "clusterAlias";
const NETWORK_NAME = "networkName";
const BASE_PATH = path.join(__dirname, CLUSTER_ALIAS);
const PLACEHOLDER_PREFIX = "PLACEHOLDER_";
const placeHolderPrefixLength = PLACEHOLDER_PREFIX.length;
function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ?
            walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const getWordEndAtIndex = (str) => {
    const endChars = [" ", ":", ",", "\"", "\/"]
    const positiveIndexes = [str.length];
    for (let char of endChars) {
        let index = str.indexOf(char);
        if (index > 0) {
            positiveIndexes.push(index);
        }
    }

    let endIndex = Math.min(...positiveIndexes);
    return str.slice(0, endIndex);
}

const generateEpiConfig = (input, outputPath) => {
    const replacePlaceholders = (filePath) => {
        let fileContent = fs.readFileSync(filePath).toString();
        let lines = fileContent.split("\n");
        for (let line of lines) {
            const index = line.indexOf(PLACEHOLDER_PREFIX);
            let processedLine = line;
            if (index >= 0) {
                let placeholder = getWordEndAtIndex(line.slice(index));
                let prop = placeholder.slice(placeHolderPrefixLength);
                processedLine = line.replace(placeholder, input[prop]);
            }
            processedLine += "\n";
            let outPath = path.join(outputPath, path.relative(__dirname, filePath));
            outPath = outPath.replace(CLUSTER_ALIAS, input.clusterAlias);
            outPath = outPath.replace(NETWORK_NAME, input.networkName);
            fs.mkdirSync(path.dirname(outPath), {recursive: true})
            fs.appendFileSync(outPath, processedLine);
        }
    }

    walkDir(BASE_PATH, replacePlaceholders)
}

module.exports = {
    generateEpiConfig
}
