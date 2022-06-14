const MetaDapp = artifacts.require('MetaDapp')

module.exports = function (deployer) {
    deployer.deploy(MetaDapp, '0x4D3cD51aBF78ae44638a3561e5c46D59f986e0e2')
}