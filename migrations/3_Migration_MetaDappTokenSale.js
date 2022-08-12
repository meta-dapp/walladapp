const MetaDappTokenSale = artifacts.require('MetaDappTokenSale')

module.exports = function (deployer) {
    deployer.deploy(MetaDappTokenSale, '0x97146Ac0C2703336B7126c88e1536DB0369aD07d')
}