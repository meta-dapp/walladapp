export default class TokenFactory {
    constructor(contract) {
        this.contract = contract
    }

    async _approve(spender, amount, from) {
        return await this.contract.approve(spender, amount, { from })
    }

    async _allowence(owner, spender) {
        return await this.contract.allowence(owner, spender, { from: owner })
    }
}