export function _weiToBNB(amount) {
    return amount / (10 ** 18)
}

export function _bnbToWei(amount) {
    return amount * (10 ** 18)
}

export function _toBigNumber(amount) {
    return require('web3').utils.toBN(amount)
}