const MetaDapp = artifacts.require('MetaDapp')

module.exports = function (deployer) {
    deployer.deploy(MetaDapp, '0xe47c6c360d7214563e59DF3a6D0399F45d9D8A92')
}