import { hashToURL, _getImages } from "../util/imagesaver"
import axios from 'axios'

export default class MetaDappFactory {
    constructor(contract) {
        this.contract = contract
    }

    _address() {
        return this.contract.address
    }

    async _getUser(account) {
        let user = await this.contract.getUser(account)

        var userData = {
            name: "",
            contact: ""
        }

        if (user.dataHash !== '') {
            const userInfo = await axios.get(hashToURL(user.dataHash))
            if (userInfo.status === 200 && 'data' in userInfo)
                userData = userInfo.data
        }

        return {
            name: userData.name,
            contact: userData.contact,
            updated: user.updated,
            total_products: user.total_products,
            products: user.products
        }
    }

    async _getUserProductsIds(account) {
        return (await this._getUser(account)).products
    }

    async _getProduct(product_id) {
        let product = await this.contract.getProduct(product_id)

        return {
            id: product_id,
            name: product.name,
            dataHash: product.dataHash,
            section: product.section,
            price: product.price,
            owner: product.owner,
            reserved_by: product.reserved_by,
            images: []
        }
    }

    async _getProducts() {
        let products = await this.contract.getProducts()
        return this.mapProducts(products)
    }

    async _totalUsers() {
        return (await this.contract.totalUsers()).toNumber()
    }

    async _totalProducts() {
        return (await this._getProducts()).length
    }

    async _buyProduct(product_id, from) {
        return await this.contract.buyProduct(product_id, { from })
    }

    async _updateUserContact(dataHash, from) {
        return this.contract.updateUserContact(dataHash, { from })
    }

    async _updateProductPrice(product_id, price, from) {
        return await this.contract.updateProductPrice(product_id, price, { from })
    }

    async _addProduct(name, dataHash, section, price, from) {
        return await this.contract.addProduct(name, dataHash, section, price, { from })
    }

    async _percentValue(amount, from) {
        return await this.contract.__percentValue(amount, { from })
    }

    async _setSecureAddPercent(percent, from) {
        return await this.contract.setSecureAddPercent(percent, { from })
    }

    mapProducts(products) {
        return products.map((product, product_id) => {
            return {
                id: product_id,
                name: product.name,
                dataHash: product.dataHash,
                section: product.section,
                price: product.price,
                owner: product.owner,
                reserved_by: product.reserved_by,
                images: []
            }
        })
    }
}