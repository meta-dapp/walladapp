const MetaDapp = artifacts.require('MetaDapp')

module.exports = function (deployer) {
    deployer.deploy(MetaDapp, '0x97146Ac0C2703336B7126c88e1536DB0369aD07d')
}