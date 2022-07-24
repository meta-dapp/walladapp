export default class TokenFactory {
    constructor(contract) {
        this.contract = contract
    }

    async _approve(spender, amount, from) {
        return await this.contract.approve(spender, amount, { from })
    }

    async _allowance(owner, spender) {
        return await this.contract.allowance(owner, spender, { from: owner })
    }

    async _symbol() {
        return await this.contract.symbol()
    }
}