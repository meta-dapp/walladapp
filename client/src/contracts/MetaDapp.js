import MetaDappContract from './MetaDapp.json'
import contract from 'truffle-contract'

export default async (provider) => {
    const metadapp = contract(MetaDappContract)
    metadapp.setProvider(provider)
    var instance = await metadapp.deployed()
    return instance
}