# Plugin module ethereum-adapter
Use the ethereum-adapter module to download the public shared information. The execution of the module will produce
1. ethereum-adapter.plugin.json file that will contain all the downloaded information, like ABI, smart contract address. The json file will be used by the helm charts.
2. thereum-adapter.plugin.secrets.json file that will contain all the private information like private keys/passwords/etc. of the account used by the ethereum adapter. The json file will be used by the helm charts.
