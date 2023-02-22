module.exports = {
    PATHS: {
        SMART_CONTRACT_INFO: 'smart-contract.plugin.json',
        SMART_CONTRACT_SECRETS: 'smart-contract.plugin.secrets.json',
        SHARED_REPO_CLONE_PATH: './',
        SHARED_REPO_NAME: "shared-repo",
        SHARED_SMART_CONTRACT_DATA_FOLDER: "networks/smart-contract",
        SMART_CONTRACTS_REPO: "./smartContracts",
        ORG_ACCOUNT: "orgAccount.json",
        ETH_ADAPTER_OUTPUT: "eth-adapter.plugin.json",
        SMART_CONTRACT_NAME: "anchoring",
        BASE_SHARED_FOLDER: "networks",
        GENESIS_FILE: "genesis-geth.json"
    },
    PLUGINS: {
        ETHEREUM_ADAPTER: "ethereum-adapter",
        INSTALL_API_HUB: "install-api-hub",
        NEW_NETWORK: "new-network",
        JOIN_NETWORK: "join-networks",
        SMART_CONTRACT: "smart-contract",
        UPDATE_PARTNERS_INFO: "update-partners-info"
    },
    COMMIT_MESSAGES: {
        SMART_CONTRACT_UPDATE: "Updated smart contract ABI and address",
        ENODE_INFO_UPDATE: "Updated quorum information"
    }
}
