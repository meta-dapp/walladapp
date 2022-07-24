import TokenContract from './MetaDappToken.json'
import contract from 'truffle-contract'

export default async (provider) => {
    const token = contract(TokenContract)
    token.setProvider(provider)
    var instance = await token.deployed()
    return instance
}