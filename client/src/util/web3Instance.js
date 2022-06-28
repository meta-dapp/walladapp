import Web3Modal from "web3modal"
import Web3 from "web3"
import WalletConnectProvider from "@walletconnect/web3-provider"
import { Networks } from './consts'
import { isConnected } from "./metadapp"
import { message } from "antd"

export class Web3Instance {
    constructor() {
        this.account = null
        this.provider = null
        this._web3 = null
        this.web3Modal = null
    }

    async init() {
        try {
            const rpcData = {}
            rpcData[Networks.bsct.id] = Networks.bsct.rpc
            const providerOptions = {
                walletconnect: {
                    package: WalletConnectProvider,
                    options: {
                        rpc: rpcData,
                        network: 'binance'
                    }
                }
            }

            this.web3Modal = new Web3Modal({
                cacheProvider: true,
                providerOptions
            })

            if (isConnected()) {
                await this.connect()
            } else await this.disconnect()

        } catch (err) { }

        return this
    }

    async _getAccount() {
        const account = (await this._web3.eth.getAccounts())[0]
        return account ? account.toLowerCase() : undefined
    }

    async connect() {
        try {
            this.provider = await this.web3Modal.connect()
        } catch (err) {
            console.log(err)
            message.error({ content: 'Conéctate a Binance Smart Chain', duration: 3 })
            this.disconnect()
            return
        }

        this._web3 = new Web3(this.provider)
        this.account = await this._getAccount()

        if (this.account)
            this._setupAccount()

        this.provider.on('accountsChanged', (accounts) => {
            this._fetchAccount(accounts)
        })

        this.provider.on("networkChanged", (networkId) => {
            if (networkId == Networks.bsct.id) {
                this.disconnect()
                this.connect()
            } else {
                message.error({ content: 'Conéctate a Binance Smart Chain', duration: 3 })
                this.disconnect()
            }
        })

        this.provider.on("disconnect", (error) => {
            this._dropState()
        })
    }

    async disconnect() {
        try {
            this._dropState()
            if (this.provider.close) {
                await this.provider.close()
                this.web3Modal.clearCachedProvider()
            }

            this.provider = null
        } catch (err) { }
    }

    _setupAccount() {
        localStorage.setItem('eth_connected', 'y')
        localStorage.setItem('account', this.account)
    }

    _dropState() {
        localStorage.clear()
        this.account = null
        this.provider = null
        this._web3 = null
    }

    async _fetchAccount(accounts) {
        if (accounts.length > 0) {
            this.account = accounts[0].toLowerCase()
            this._setupAccount()
        }
    }

    getAccount() {
        return this.account
    }

    getProvider() {
        return this._web3.currentProvider
    }
}