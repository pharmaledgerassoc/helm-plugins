const fs = require("fs");
const path = require("path");
const BASE_PATH = "./clusterAlias";
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
            let newLine = line;
            if (index >= 0) {
                let placeholder = getWordEndAtIndex(line.slice(index));
                let prop = placeholder.slice(placeHolderPrefixLength);
                newLine = line.replace(placeholder, input[prop]);
                console.log(newLine);
            }
            newLine += "\n";
            let newPath = filePath.replace("clusterAlias", input.clusterAlias);
            newPath = path.join(outputPath, newPath.replace("networkName", input.networkName));
            fs.mkdirSync(newPath.replace(path.basename(newPath), ''), {recursive: true})
            fs.appendFileSync(newPath, newLine);
        }
    }

    walkDir(BASE_PATH, replacePlaceholders)
}

module.exports = {
    generateEpiConfig
}