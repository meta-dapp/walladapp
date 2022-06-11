const MetaDappToken = artifacts.require('MetaDappToken')

module.exports = function (deployer) {
    deployer.deploy(MetaDappToken)
}