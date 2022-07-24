import TokenSaleContract from './MetaDappTokenSale.json'
import contract from 'truffle-contract'

export default async (provider) => {
    const tokensale = contract(TokenSaleContract)
    tokensale.setProvider(provider)
    var instance = await tokensale.deployed()
    return instance
}