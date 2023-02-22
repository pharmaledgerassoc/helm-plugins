# Plugin module ethereum-sc

The ethereum-sc plugin will download the anchoring smart contract and generate the organization user that will make the deployment. The execution of the plugin will produce:
1. ethereum-sc.plugin.json file that will contain all the downloaded information, like the smart contract source code. The json file will be used by the helm charts.
2. ethereum-sc.plugin.secrets.json file that will contain all the private information like private keys/passwords/etc. of the user that will deploy the smart contract on the blockchain.
