const MetaDappTokenSale = artifacts.require('MetaDappTokenSale')

module.exports = function (deployer) {
    deployer.deploy(MetaDappTokenSale, '0xe47c6c360d7214563e59DF3a6D0399F45d9D8A92')
}