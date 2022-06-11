const path = require('path')
const HDWalletProvider = require('@truffle/hdwallet-provider')

module.exports = {
    plugins: [
        'truffle-plugin-verify'
    ],
    api_keys: {
        bscscan: 'TU API KEY DE BSCSCAN'
    },
    contracts_build_directory: path.join(__dirname, "client/src/contracts"),
    networks: {
        development: {
            host: '127.0.0.1',
            port: 7545,
            network_id: "*"
        },
        bsc_testnet: {
            provider: () => new HDWalletProvider(
                'TUS FRASES SECRETAS DE TU WALLET',
                `https://data-seed-prebsc-1-s1.binance.org:8545`, 0),
            from: "LA CUENTA DESDE DONDE QUIERES PUBLICAR LOS CONTRATOS",
            gas: "4500000",
            gasPrice: "10000000000",
            network_id: 97,
            confirmations: 10,
            timeoutBlocks: 1000,
            skipDryRun: true
        }
    },
    compilers: {
        solc: {
            version: "0.8.0"
        }
    }
}